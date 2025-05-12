import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CircleLoader } from 'react-spinners';

const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, delayChildren: 0.3, staggerChildren: 0.2 } },
};

const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const formVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

const previewVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

function Nominees() {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [newNominee, setNewNominee] = useState(null);
    const [nominees, setNominees] = useState([]);
    const [editingNomineeId, setEditingNomineeId] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    const getBaseUrl = () => {
        const url = import.meta.env.VITE_API_BASE_URL;
        if (!url) {
            const errorMsg = "VITE_API_BASE_URL is not set in environment variables.";
            console.error(errorMsg);
            setErrorMessage(errorMsg); // Set error message.
            return '';
        }
        return url;
    };

    const fetchNominees = async () => {
        setLoading(true);
        setErrorMessage('');
        const baseUrl = getBaseUrl();

        if (!baseUrl) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/api/nominee`);
            if (!response.ok) {
                let errorText = 'Failed to fetch nominees';
                try {
                  errorText = await response.text();
                } catch (e) {
                  console.error("Error parsing error response", e);
                }
                console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                throw new Error(`Failed to fetch nominees: ${response.status} - ${errorText}`);
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                setNominees(data);
            } else {
                const msg = "Received data in unexpected format: Expected an array of nominees";
                console.error(msg, data);
                setErrorMessage(msg);
                setNominees([]);
            }
        } catch (error) {
            console.error('Error fetching nominees:', error);
            setErrorMessage(error.message || 'Failed to fetch nominees.');
            setNominees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNominees();
    }, []);

    const handleAddClick = () => {
        setNewNominee({ round: '', stage: '', categories: [{ category: '', artists: [{ name: '', smsNumber: '' }] }] });
        setShowAddForm(true);
        setEditingNomineeId(null);
        setShowPreview(false);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleCancelClick = () => {
        setShowAddForm(false);
        setShowPreview(false);
        setEditingNomineeId(null);
        setNewNominee(null);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handlePreview = (nomineeData) => {
        setNewNominee(nomineeData);
        setShowAddForm(false);
        setShowPreview(true);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handlePost = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        const baseUrl = getBaseUrl();

        if (!baseUrl) {
            return;
        }

        try {
            const response = await fetch(`${baseUrl}/api/nominee`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newNominee),
            });

            if (response.ok) {
                fetchNominees();
                setShowPreview(false);
                setNewNominee(null);
                setSuccessMessage('Nominee added successfully!');
            } else {
                const errorData = await response.json();
                const msg = `Failed to post nominee: ${response.status} - ${errorData.message || 'Unknown error'}`;
                console.error(msg, errorData);
                setErrorMessage(msg);
            }
        } catch (error) {
            const msg = `Error posting nominee: ${error.message}`;
            console.error(msg, error);
            setErrorMessage(msg);
        }
    };

    const handleEditClick = (id) => {
        setEditingNomineeId(id);
        const nomineeToEdit = nominees.find((nominee) => nominee._id === id);
        setNewNominee(nomineeToEdit ? JSON.parse(JSON.stringify(nomineeToEdit)) : { round: '', stage: '', categories: [{ category: '', artists: [{ name: '', smsNumber: '' }] }] });
        setShowAddForm(true);
        setShowPreview(false);
        setSuccessMessage('');
        setErrorMessage('');
    };

    const handleUpdate = async (updatedNominee) => {
        setErrorMessage('');
        setSuccessMessage('');
        const baseUrl = getBaseUrl();

        if (!baseUrl) {
            return;
        }

        try {
            if (!editingNomineeId) {
                const msg = "Attempted to update without an editing ID.";
                console.error(msg);
                setErrorMessage("Internal error: Nominee ID for update is missing.");
                return;
            }
            const response = await fetch(`${baseUrl}/api/nominee/${editingNomineeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedNominee),
            });

            if (response.ok) {
                fetchNominees();
                setShowAddForm(false);
                setEditingNomineeId(null);
                setNewNominee(null);
                setSuccessMessage('Nominee updated successfully!');
            } else {
              const errorData = await response.json();
              const msg = `Failed to update nominee: ${response.status} - ${errorData.message || 'Unknown error'}`;
              console.error(msg, errorData);
              setErrorMessage(msg);
            }
        } catch (error) {
            const msg = `Error updating nominee: ${error.message}`;
            console.error(msg, error);
            setErrorMessage(msg);
        }
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this nominee?')) {
            setErrorMessage('');
            setSuccessMessage('');
            const baseUrl = getBaseUrl();

            if (!baseUrl) {
                return;
            }

            try {
                if (!id) {
                    const msg = "Attempted to delete without an ID.";
                    console.error(msg);
                    setErrorMessage("Internal error: Nominee ID for delete is missing.");
                    return;
                }
                const response = await fetch(`${baseUrl}/api/nominee/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    fetchNominees();
                    setSuccessMessage('Nominee deleted successfully!');
                } else {
                  const errorData = await response.json();
                  const msg = `Failed to delete nominee: ${response.status} - ${errorData.message || 'Unknown error'}`;
                  console.error(msg, errorData);
                  setErrorMessage(msg);
                }
            } catch (error) {
                const msg = `Error deleting nominee: ${error.message}`;
                console.error(msg, error);
                setErrorMessage(msg);
            }
        }
    };

    if (loading) {
        return <p className="text-center text-gray-500 mt-8">Loading nominees...</p>;
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            className="p-8 space-y-8"
        >
            <motion.div variants={itemVariants} className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800">Nominees Management</h1>
                    <p className="text-sm text-gray-500">Manage and view nominees for the Addis Music Awards.</p>
                </div>
                <button
                    className="bg-red-600 text-white rounded-lg px-6 py-2 text-sm font-semibold hover:bg-red-700 transition-colors duration-300"
                    onClick={handleAddClick}
                >
                    + Add New Nominee
                </button>
            </motion.div>

            {errorMessage && (
                <motion.div variants={itemVariants} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {errorMessage}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <svg onClick={() => setErrorMessage('')} className="fill-current h-6 w-6 text-red-500 cursor-pointer" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path fillRule="evenodd" d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.586l-2.651 3.263a1.2 1.2 0 0 1-1.697-1.697L8.303 10l-3.263-2.651a1.2 1.2 0 0 1 1.697-1.697L10 8.414l2.651-3.263a1.2 1.2 0 0 1 1.697 1.697L11.697 10l3.263 2.651a1.2 1.2 0 0 1 0 1.697z" /></svg>
                    </span>
                </motion.div>
            )}
            {successMessage && (
                <motion.div variants={itemVariants} className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> {successMessage}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                        <svg onClick={() => setSuccessMessage('')} className="fill-current h-6 w-6 text-green-500 cursor-pointer" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path fillRule="evenodd" d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.586l-2.651 3.263a1.2 1.2 0 0 1-1.697-1.697L8.303 10l-3.263-2.651a1.2 1.2 0 0 1 1.697-1.697L10 8.414l2.651-3.263a1.2 1.2 0 0 1 1.697 1.697L11.697 10l3.263 2.651a1.2 1.2 0 0 1 0 1.697z" /></svg>
                    </span>
                </motion.div>
            )}

            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        key="nomineeForm"
                        variants={formVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="mt-8"
                    >
                        <NomineeForm
                            onPreview={handlePreview}
                            onCancel={handleCancelClick}
                            nominee={newNominee}
                            setNominee={setNewNominee}
                            onUpdate={handleUpdate}
                            editingNomineeId={editingNomineeId}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showPreview && (
                    <motion.div
                        key="nomineePreview"
                        variants={previewVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="mt-8"
                    >
                        <NomineePreview nominee={newNominee} onPost={handlePost} onCancel={handleCancelClick} />
                    </motion.div>
                )}
            </AnimatePresence>

            {!showAddForm && !showPreview && (
                Array.isArray(nominees) && nominees.length > 0 ? (
                    <motion.div
                        variants={itemVariants}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8"
                    >
                        {nominees.map((nominee) => (
                            <motion.div
                                key={nominee._id}
                                variants={itemVariants}
                                className="rounded-lg p-6 shadow-md transition-transform transform hover:scale-105 bg-white"
                            >
                                <div className="border rounded-md p-4">
                                    <h2 className="text-xl font-semibold text-gray-800 mb-2">{nominee.round}</h2>
                                    <p className="text-sm text-gray-500 mb-4">
                                        Created at: {nominee.created ? new Date(nominee.created).toLocaleDateString() : 'N/A'} -
                                        <span className={`font-semibold ${nominee.stage === 'Final' ? 'text-green-600' : 'text-gray-600'}`}>
                                            {nominee.stage}
                                        </span>
                                    </p>
                                    <div className="space-y-3">
                                        {Array.isArray(nominee.categories) && nominee.categories.map((cat, index) => (
                                            <div key={index} className="flex justify-between items-center border-b pb-2">
                                                <span className="text-sm text-gray-700">{cat.category}</span>
                                                {Array.isArray(cat.artists) && (
                                                    <span className="text-sm font-semibold text-gray-800">{cat.artists.length} Artists</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-6">
                                        <button
                                            className="text-sm text-blue-600 font-semibold hover:underline"
                                            onClick={() => handleEditClick(nominee._id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="text-sm text-red-600 font-semibold hover:underline"
                                            onClick={() => handleDeleteClick(nominee._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.p variants={itemVariants} className="text-center text-gray-500 mt-8">No Data Available</motion.p>
                )
            )}
        </motion.div>
    );
}

function NomineeForm({ onPreview, onCancel, nominee, setNominee, onUpdate, editingNomineeId }) {
    const [round, setRound] = useState(nominee?.round || '');
    const [stage, setStage] = useState(nominee?.stage || '');
    const [categories, setCategories] = useState(nominee?.categories ? JSON.parse(JSON.stringify(nominee.categories)) : [{ category: '', artists: [{ name: '', smsNumber: '' }] }]);
    const [showCategoryForms, setShowCategoryForms] = useState(categories.map(() => true));

    useEffect(() => {
        if (nominee) {
            setRound(nominee.round || '');
            setStage(nominee.stage || '');
            setCategories(nominee.categories ? JSON.parse(JSON.stringify(nominee.categories)) : [{ category: '', artists: [{ name: '', smsNumber: '' }] }]);
            setShowCategoryForms(nominee.categories ? nominee.categories.map(() => true) : [true]);
        } else {
            setRound('');
            setStage('');
            setCategories([{ category: '', artists: [{ name: '', smsNumber: '' }] }]);
            setShowCategoryForms([true]);
        }
    }, [nominee]);

    const handleAddCategory = () => {
        setCategories([...categories, { category: '', artists: [{ name: '', smsNumber: '' }] }]);
        setShowCategoryForms([...showCategoryForms, true]);
    };

    const handleCategoryChange = (index, field, value) => {
        const updatedCategories = [...categories];
        updatedCategories[index][field] = value;
        setCategories(updatedCategories);
    };

    const handleAddArtist = (categoryIndex) => {
        const updatedCategories = [...categories];
        updatedCategories[categoryIndex].artists.push({ name: '', smsNumber: '' });
        setCategories(updatedCategories);
    };

    const handleArtistChange = (categoryIndex, artistIndex, field, value) => {
        const updatedCategories = [...categories];
        updatedCategories[categoryIndex].artists[artistIndex][field] = value;
        setCategories(updatedCategories);
    };

    const handleRemoveCategory = (index) => {
        if (categories.length > 1) {
            const updatedCategories = categories.filter((_, i) => i !== index);
            setCategories(updatedCategories);
            setShowCategoryForms(showCategoryForms.filter((_, i) => i !== index));
        } else {
            if (window.confirm('Are you sure you want to delete this category? This is the last one.')) {
                setCategories([]);
                setShowCategoryForms([]);
            }
        }
    };

    const handleRemoveArtist = (categoryIndex, artistIndex) => {
        const updatedCategories = [...categories];
        if (updatedCategories[categoryIndex].artists.length > 1) {
            updatedCategories[categoryIndex].artists = updatedCategories[categoryIndex].artists.filter((_, i) => i !== artistIndex);
            setCategories(updatedCategories);
        } else {
            if (window.confirm('Are you sure you want to delete this artist? This is the last one in this category.')) {
                updatedCategories[categoryIndex].artists = [];
                setCategories(updatedCategories);
            }
        }
    };

    const handlePreviewClick = (event) => {
        event.preventDefault();
        onPreview({ round, stage, categories });
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (editingNomineeId) {
            onUpdate({ _id: editingNomineeId, round, stage, categories });
        } else {
            handlePreviewClick(event);
        }
    };

    const toggleCategoryFormVisibility = (index) => {
        const updatedShowCategoryForms = [...showCategoryForms];
        updatedShowCategoryForms[index] = !updatedShowCategoryForms[index];
        setShowCategoryForms(updatedShowCategoryForms);
    };

    return (
        <motion.form
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onSubmit={handleSubmit}
            className="space-y-6 bg-white p-6 rounded-lg shadow-md"
        >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{editingNomineeId ? 'Edit Nominee' : 'Add New Nominee'}</h2>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Award Round</label>
                <input
                    type="text"
                    value={round}
                    onChange={(e) => setRound(e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring-red-500 focus:border-red-500"
                    placeholder="e.g., 12TH, 13TH"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Stage</label>
                <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring-red-500 focus:border-red-500 appearance-none bg-white rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    required
                >
                    <option value="">Select Stage</option>
                    <option value="Final">Final</option>
                    <option value="Semi-Final">Semi-Final</option>
                    <option value="Preliminary">Preliminary</option>
                </select>
            </div>
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
                {categories.map((cat, catIndex) => (
                    <div key={catIndex} className="border p-4 rounded-md shadow-sm bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">Category Name</label>
                            <div className="flex items-center space-x-3">
                                <button
                                    type="button"
                                    onClick={() => toggleCategoryFormVisibility(catIndex)}
                                    className="text-gray-500 hover:text-gray-700 text-sm"
                                >
                                    {showCategoryForms[catIndex] ? 'Hide Details' : 'Show Details'}
                                </button>
                                {categories.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCategory(catIndex)}
                                        className="text-red-600 hover:underline text-sm"
                                    >
                                        Delete Category
                                    </button>
                                )}
                            </div>
                        </div>
                        <AnimatePresence>
                            {showCategoryForms[catIndex] && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="space-y-2 pt-2">
                                        <input
                                            type="text"
                                            placeholder="Category Name"
                                            value={cat.category}
                                            onChange={(e) => handleCategoryChange(catIndex, 'category', e.target.value)}
                                            className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring-red-500 focus:border-red-500"
                                            required
                                        />
                                        <div className="mt-4 space-y-2 border-t pt-4">
                                            <h4 className="text-md font-semibold text-gray-700">Artists</h4>
                                            {cat.artists.map((artist, artistIndex) => (
                                                <div key={artistIndex} className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-medium text-gray-700">Artist Name</label>
                                                        <input
                                                            type="text"
                                                            placeholder="Artist Name"
                                                            value={artist.name}
                                                            onChange={(e) => handleArtistChange(catIndex, artistIndex, 'name', e.target.value)}
                                                            className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring-red-500 focus:border-red-500"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <label className="block text-sm font-medium text-gray-700">SMS Number</label>
                                                        <input
                                                            type="text"
                                                            placeholder="SMS Number"
                                                            value={artist.smsNumber}
                                                            onChange={(e) => handleArtistChange(catIndex, artistIndex, 'smsNumber', e.target.value)}
                                                            className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:ring-red-500 focus:border-red-500"
                                                            required
                                                        />
                                                    </div>
                                                    {cat.artists.length > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveArtist(catIndex, artistIndex)}
                                                            className="text-red-600 hover:underline self-end text-sm"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => handleAddArtist(catIndex)}
                                                className="text-sm text-red-600 hover:underline mt-2"
                                            >
                                                + Add Artist
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={handleAddCategory}
                    className="text-sm text-red-600 hover:underline mt-4"
                >
                    + Add Category
                </button>
            </div>
            <div className="flex justify-end space-x-6 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="bg-red-600 text-white rounded-lg px-6 py-2 text-sm font-semibold hover:bg-red-700 transition-colors duration-300"
                >
                    {editingNomineeId ? 'Update Nominee' : 'Preview Nominee'}
                </button>
            </div>
        </motion.form>
    );
}

function NomineePreview({ nominee, onPost, onCancel }) {
    return (
        <motion.div
            variants={previewVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6 bg-white p-6 rounded-lg shadow-md"
        >
            <h2 className="text-xl font-semibold text-gray-800">Preview Nominee</h2>
            <div>
                <p><strong>Round:</strong> {nominee?.round}</p>
                <p><strong>Stage:</strong> {nominee?.stage}</p>
                {Array.isArray(nominee?.categories) && nominee.categories.map((cat, index) => (
                    <div key={index} className="mb-4 border-t pt-2">
                        <p><strong>Category:</strong> {cat?.category}</p>
                        {Array.isArray(cat?.artists) && (
                            cat.artists.map((artist, artistIndex) => (
                                <div key={artistIndex} className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-4 ml-4">
                                    <p><strong>Artist:</strong> {artist?.name}</p>
                                    <p><strong>SMS:</strong> {artist?.smsNumber}</p>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>
            <div className="flex justify-end space-x-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onPost}
                    className="bg-red-600 text-white rounded-lg px-6 py-2 text-sm font-semibold hover:bg-red-700 transition-colors duration-300"
                >
                    Post
                </button>
            </div>
        </motion.div>
    );
}

export default Nominees;
