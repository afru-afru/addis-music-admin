import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaUpload, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { delayChildren: 0.3, staggerChildren: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
};

const itemVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
};

const inputStyle = 'w-full px-4 py-3 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200';
const textareaStyle = 'w-full px-4 py-3 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200 h-32';
const buttonStyle = 'bg-red-500 text-white py-3 px-6 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50';
const addButton = 'bg-green-500 text-white py-3 px-6 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300 flex items-center';
const iconStyle = 'mr-2';
const roundCardStyle = 'bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-lg shadow-md overflow-hidden cursor-pointer';
const artistCardStyle = 'bg-gray-100 bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-md p-4 mb-4';
const imageStyle = 'w-32 h-32 object-cover rounded-md mb-2';

function WonArtistsAdmin() {
    const [rounds, setRounds] = useState([]);
    const [newRound, setNewRound] = useState('');
    const [newArtists, setNewArtists] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [submissionStatus, setSubmissionStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [selectedRound, setSelectedRound] = useState(null);

    // Function to get base URL from environment variable
    const getBaseUrl = () => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';  // Default
        if (!baseUrl) {
            const errorMsg = "VITE_API_BASE_URL is not set in environment variables!";
            console.error(errorMsg);
            setError(errorMsg); // Set error message.
            return '';
        }
        return baseUrl;
    };

    const fetchRounds = useCallback(async () => {
        const baseUrl = getBaseUrl();
        if(!baseUrl) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseUrl}/api/wonArtists`);
            setRounds(response.data);
        } catch (error) {
            console.error('Error fetching rounds:', error);
            setError('Failed to fetch data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRounds();
    }, [fetchRounds]);

    const handleAddArtist = () => {
        setNewArtists((prev) => [
            ...prev,
            {
                name: '',
                category: '',
                work: '',
                description: '',
                image: null,
                imageUrl: null,
                fileId: `file-${Math.random().toString(36).substr(2, 9)}`
            }
        ]);
    }

    const handleArtistChange = (index, e) => {
        const updatedArtists = [...newArtists];
        updatedArtists[index][e.target.name] = e.target.value;
        setNewArtists(updatedArtists);
    };

    const handleImageChange = (index, files) => {
        const updatedArtists = [...newArtists];
        updatedArtists[index].image = files[0];
        updatedArtists[index].imageUrl = null;
        setNewArtists(updatedArtists);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmissionStatus('loading');
        const baseUrl = getBaseUrl();
        if(!baseUrl) {
            setLoading(false);
            setSubmissionStatus(null);
            return;
        }

        const formData = new FormData();
        formData.append('round', newRound);

        const artistsData = newArtists.map((artist) => ({
            _id: artist._id, // Include the _id for identifying existing artists
            name: artist.name,
            category: artist.category,
            work: artist.work,
            description: artist.description,
            imageUrl: artist.imageUrl,
            cloudinary_id: artist.cloudinary_id,
            fileId: artist.fileId,
        }));
        formData.append('artists', JSON.stringify(artistsData));

        newArtists.forEach((artist) => {
            if (artist.image) {
                formData.append(artist.fileId, artist.image);
            }
        });

        try {
            const url = editingId
                ? `${baseUrl}/api/wonArtists/${editingId}`
                : `${baseUrl}/api/wonArtists`;

            const method = editingId ? 'put' : 'post';

            console.log("Frontend: Sending FormData:", formData.get('round'), formData.get('artists'), [...formData.entries()]); // Log FormData

            await axios[method](url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            await fetchRounds();
            resetForm();
            setSubmissionStatus('success');
            setShowForm(false);
            toast.success(editingId ? 'Round updated successfully!' : 'Round saved successfully!');
        } catch (error) {
            console.error('Error saving round:', error);
            setError(error.response?.data?.message || 'Failed to save round.');
            setSubmissionStatus('error');
            toast.error('Failed to save round.');
        } finally {
            setSubmissionStatus(null);
        }
    };
    const resetForm = () => {
        setNewRound('');
        setNewArtists([]);
        setEditingId(null);
    };

    const handleDeleteRound = async (id) => {
        if (!window.confirm('Are you sure you want to delete this round?')) return;
        const baseUrl = getBaseUrl();
         if(!baseUrl) {
            setLoading(false);
            return;
        }
        try {
            await axios.delete(`${baseUrl}/api/wonArtists/${id}`);
            setRounds((prev) => prev.filter((r) => r._id !== id));
            setSubmissionStatus('deleteSuccess');
            toast.success('Round deleted successfully!');
        } catch (error) {
            console.error('Error deleting round:', error);
            setError('Failed to delete round.');
            setSubmissionStatus('error');
            toast.error('Failed to delete round.');
        } finally {
            setSubmissionStatus(null);
        }
    };

    const startEditRound = (round) => {
        setEditingId(round._id);
        setNewRound(round.round);
        setNewArtists(
            round.artists.map((artist) => ({
                ...artist,
                fileId: `file-${Math.random().toString(36).substr(2, 9)}`, // Generate a new fileId for potential new uploads
                // Importantly, keep the existing _id, imageUrl, and cloudinary_id
            }))
        );
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRemoveArtist = (index) => {
        const updatedArtists = [...newArtists];
        updatedArtists.splice(index, 1);
        setNewArtists(updatedArtists);
    };

    const ImageUploader = ({ index, onImageChange, existingImageUrl }) => {
        const { getRootProps, getInputProps, isDragActive } = useDropzone({
            accept: 'image/*',
            onDrop: (acceptedFiles) => onImageChange(index, acceptedFiles),
            multiple: false,
        });
        return (
            <div {...getRootProps()} className="relative rounded-md overflow-hidden">
                <input {...getInputProps()} />
                <label className="block py-3 px-4 text-gray-700 cursor-pointer">
                    {newArtists[index].image ? (
                        <span className="truncate">{newArtists[index].image.name}</span>
                    ) : existingImageUrl ? (
                        <img src={existingImageUrl} alt="Existing" className={imageStyle} />
                    ) : (
                        <div className="flex items-center justify-center">
                            <FaUpload className={iconStyle} />
                            <span>{isDragActive ? 'Drop here' : 'Upload Image'}</span>
                        </div>
                    )}
                </label>
                {newArtists[index].image && (
                    <motion.img
                        src={URL.createObjectURL(newArtists[index].image)}
                        alt="Preview"
                        className={imageStyle}
                    />
                )}
            </div>
        );
    };

    const handleRoundClick = (round) => {
        setSelectedRound(round);
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-screen p-10 bg-gray-50 bg-opacity-50 backdrop-filter backdrop-blur-lg"
        >
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
            <div className="max-w-6xl mx-auto">
                <motion.h1 variants={itemVariants} className="text-4xl font-semibold mb-8 text-gray-800 text-center">
                    Manage Won Artists
                </motion.h1>

                {loading && <motion.p variants={itemVariants} className="text-center text-gray-600">Loading...</motion.p>}
                {error && <motion.p variants={itemVariants} className="text-center text-red-600">{error}</motion.p>}

                <motion.div variants={itemVariants} className="mb-8 flex justify-end">
                    <motion.button
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => setShowForm(!showForm)}
                        className={addButton}
                    >
                        {showForm ? 'Hide Form' : 'Add New Round'}
                    </motion.button>
                </motion.div>

                <AnimatePresence>
                    {showForm && (
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
                            exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
                            onSubmit={handleSubmit}
                            className="mb-10 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg p-6 rounded-md shadow-sm"
                        >
                            <motion.h2 className="text-xl font-semibold mb-4 text-gray-700">
                                {editingId ? 'Edit Round' : 'Add New Round'}
                            </motion.h2>

                            <motion.input
                                type="text"
                                placeholder="Round Title (e.g., The 10th Edition)"
                                value={newRound}
                                onChange={(e) => setNewRound(e.target.value)}
                                className={inputStyle}
                            />
                            <motion.div>
                                <motion.h3 className="text-lg font-semibold mb-3 text-gray-700">Artists:</motion.h3>
                                {newArtists.map((artist, index) => (
                                    <motion.div
                                        key={artist.fileId}
                                        className={`mb-4 p-4 rounded-md border border-gray-200 ${artistCardStyle}`}
                                    >
                                        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <motion.input
                                                type="text"
                                                name="name"
                                                placeholder="Artist Name"
                                                value={artist.name}
                                                onChange={(e) => handleArtistChange(index, e)}
                                                className={inputStyle}
                                            />
                                            <motion.input
                                                type="text"
                                                name="category"
                                                placeholder="Category"
                                                value={artist.category}
                                                onChange={(e) => handleArtistChange(index, e)}
                                                className={inputStyle}
                                            />
                                            <motion.input
                                                type="text"
                                                name="work"
                                                placeholder="Work Title"
                                                value={artist.work}
                                                onChange={(e) => handleArtistChange(index, e)}
                                                className={inputStyle}
                                            />
                                            <ImageUploader
                                                index={index}
                                                onImageChange={handleImageChange}
                                                existingImageUrl={artist.imageUrl}
                                            />
                                        </motion.div>
                                        <motion.textarea
                                            name="description"
                                            placeholder="Description"
                                            value={artist.description}
                                            onChange={(e) => handleArtistChange(index, e)}
                                            className={textareaStyle}
                                        />
                                        {newArtists.length > 1 && (
                                            <motion.button
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                type="button"
                                                onClick={() => handleRemoveArtist(index)}
                                                className="bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 text-sm"
                                            >
                                                Remove
                                            </motion.button>
                                        )}
                                    </motion.div>
                                ))}
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    type="button"
                                    onClick={handleAddArtist}
                                    className={addButton}
                                >
                                    <FaPlus className={iconStyle} /> Add Artist
                                </motion.button>
                            </motion.div>

                            <motion.div className="flex justify-end mt-6">
                                <motion.button
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    type="submit"
                                    disabled={submissionStatus === 'loading'}
                                    className={buttonStyle}
                                >
                                    {submissionStatus === 'loading' ? 'Saving...' : editingId ? 'Update Round' : 'Save Round'}
                                </motion.button>
                            </motion.div>
                        </motion.form>
                    )}
                </AnimatePresence>
                {!showForm && (
                    <motion.div variants={itemVariants} className="mt-8">
                        <motion.h2 className="text-xl font-semibold mb-4 text-gray-700">Previous Won Artists</motion.h2>
                        <div className="grid grid-cols-1 gap-6">
                            {rounds.map((round) => (
                                <motion.div
                                    key={round._id}
                                    variants={itemVariants}
                                    className={roundCardStyle}
                                    onClick={() => handleRoundClick(round)}
                                >
                                    <div className="p-6">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3">{round.round}</h3>
                                        <div className="flex justify-end mt-4">
                                            <motion.button
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                onClick={(e) => { e.stopPropagation(); startEditRound(round); }}
                                                className="text-blue-600 hover:text-blue-800 font-bold text-sm mr-2 flex items-center"
                                            >
                                                <FaEdit className={iconStyle} /> Edit
                                            </motion.button>
                                            <motion.button
                                                variants={buttonVariants}
                                                whileHover="hover"
                                                whileTap="tap"
                                                onClick={(e) => { e.stopPropagation(); handleDeleteRound(round._id); }}
                                                className="text-red-600 hover:text-red-800 font-bold text-sm flex items-center"
                                            >
                                                <FaTrash className={iconStyle} /> Delete
                                            </motion.button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <AnimatePresence>
                            {selectedRound && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
                                    exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
                                    className={`${roundCardStyle} mt-6 p-6`}
                                >
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800">{selectedRound.round}</h3>
                                        <motion.button
                                            variants={buttonVariants}
                                            whileHover="hover"
                                            whileTap="tap"
                                            onClick={() => setSelectedRound(null)}
                                            className="bg-gray-200 text-gray-600 rounded -full p-2"
                                        >
                                            <FaTimes />
                                        </motion.button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedRound.artists.map((artist) => (
                                            <div key={artist._id} className={`${artistCardStyle} flex flex-col items-start p-4 mb-4`}>
                                                {artist.imageUrl && (
                                                    <img
                                                        src={artist.imageUrl}
                                                        alt={artist.name}
                                                        className={imageStyle}
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-700">{artist.name}</p>
                                                    <p className="text-gray-600 text-sm">Category: {artist.category}</p>
                                                    <p className="text-gray-600 text-sm">Work: {artist.work}</p>
                                                    {artist.description && <p className="text-gray-600 text-sm mt-1">{artist.description}</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
}
export default WonArtistsAdmin;

