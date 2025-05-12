import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Edit, Trash2, Save, X, PlusCircle, AlertTriangle, Calendar as CalendarIcon, UploadCloud } from 'react-feather';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const containerVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.5, delayChildren: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
};

const formVariants = {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

const tableVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

const Location = () => {
    const [locationData, setLocationData] = useState(null);
    const [formData, setFormData] = useState({
        date: '',
        place: '',
        image: null,
        description: '',
        sentence1: '',
        sentence2: '',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    // Function to get base URL from environment variable
    const getBaseUrl = () => {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';  // Default value
        if (!baseUrl) {
            const errorMsg = "VITE_API_BASE_URL is not set in environment variables!";
            console.error(errorMsg);
            setError(errorMsg);
            return '';
        }
        return baseUrl;
    };

    const fetchLocationData = useCallback(async () => {
        const baseUrl = getBaseUrl();
        if (!baseUrl) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${baseUrl}/api/location`);
            setLocationData(response.data[0] || null);
        } catch (err) {
            setError(err.message || 'Failed to fetch location data.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLocationData();
    }, [fetchLocationData]);

    const handleChange = (e) => {
        if (e.target.name === 'image') {
            const file = e.target.files?.[0];
            setFormData({ ...formData, image: file || null });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.date || !formData.place || !formData.description) {
            setError('Please fill in all required fields.');
            return;
        }

        const baseUrl = getBaseUrl();
        if (!baseUrl) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const form = new FormData();
            for (const key in formData) {
                form.append(key, formData[key]);
            }

            let response;
            if (isEditing) {
                response = await axios.put(`${baseUrl}/api/location/${editId}`, form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Location data updated successfully!');
            } else {
                response = await axios.post(`${baseUrl}/api/location`, form, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                toast.success('Location data created successfully!');
            }

            fetchLocationData();
            setShowForm(false);
            resetForm();
        } catch (err) {
            setError(err.message || 'Failed to submit form.');
            toast.error('Failed to submit form.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this location?')) return;

        const baseUrl = getBaseUrl();
        if (!baseUrl) {
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await axios.delete(`${baseUrl}/api/location/${id}`);
            toast.success('Location data deleted successfully!');
            fetchLocationData();
        } catch (err) {
            setError(err.message || 'Failed to delete location.');
            toast.error('Failed to delete location.');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item) => {
        setIsEditing(true);
        setEditId(item._id);
        setFormData({
            date: item.date,
            place: item.place,
            image: item.image,
            description: item.description,
            sentence1: item.sentence1,
            sentence2: item.sentence2,
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setFormData({
            date: '',
            place: '',
            image: null,
            description: '',
            sentence1: '',
            sentence2: '',
        });
        setIsEditing(false);
        setEditId(null);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFormData({ ...formData, image: e.dataTransfer.files[0] });
        }
    };

    const renderLocationTable = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
                    <svg className="animate-spin h-6 w-6 mr-3 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-gray-700">Loading Location Data...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex items-center gap-2 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
                    <AlertTriangle className="h-5 w-5" />
                    {error}
                </div>
            );
        }

        return (
            <motion.div
                variants={tableVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200"
            >
                <div className="flex items-center justify-between p-6 border-b bg-gray-50">
                    <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-red-500" /> Location Data
                    </h2>
                    {!showForm && !locationData && (
                        <div
                            className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg cursor-pointer shadow-md hover:bg-red-700 transition-colors duration-200"
                            onClick={() => setShowForm(true)}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Location
                        </div>
                    )}
                    {!showForm && locationData && (
                        <div className="bg-red-200 text-red-700 font-semibold px-4 py-2 rounded-lg cursor-not-allowed shadow-md">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Location
                            <span className="ml-2 text-xs italic">Remove existing location to add new one.</span>
                        </div>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                                <th className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Place</th>
                                <th className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sentence 1</th>
                                <th className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sentence 2</th>
                                <th className="px-6 py-4 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {locationData && (
                                <tr className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-5 border-b border-gray-200 text-sm">
                                        <img src={locationData.image} alt="Location" className="w-20 rounded-lg shadow-md border border-gray-200" />
                                    </td>
                                    <td className="px-6 py-5 border-b border-gray-200 text-sm text-gray-700">{locationData.place}</td>
                                    <td className="px-6 py-5 border-b border-gray-200 text-sm text-gray-700">{locationData.date}</td>
                                    <td className="px-6 py-5 border-b border-gray-200 text-sm text-gray-700">{locationData.description}</td>
                                    <td className="px-6 py-5 border-b border-gray-200 text-sm text-gray-700">{locationData.sentence1}</td>
                                    <td className="px-6 py-5 border-b border-gray-200 text-sm text-gray-700">{locationData.sentence2}</td>
                                    <td className="px-6 py-5 border-b border-gray-200 text-sm">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(locationData)} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1 shadow-md">
                                                <Edit className="h-4 w-4" /> <span className="hidden sm:inline">Edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(locationData._id)} className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-1 shadow-md">
                                                <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        );
    };

    const renderLocationForm = () => {
        return (
            <motion.div
                variants={formVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200"
            >
                <h2 className="text-2xl font-semibold mb-8 text-gray-800 flex items-center gap-2">
                    {isEditing ? <><Edit className="h-6 w-6 text-blue-500" /> Edit Location</> : <><PlusCircle className="h-6 w-6 text-green-500" /> Add Location</>}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Date <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="date"
                                    value={formData.date || ''}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 text-sm pr-10 py-3"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <CalendarIcon className="h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 block mb-2">Place <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="place"
                                value={formData.place || ''}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 text-sm py-3"
                                placeholder="Enter place"
                            />
                        </div>
                        <div className="relative" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                            <input type="file" name="image" ref={fileInputRef} onChange={handleChange} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" accept="image/*" />
                            <div className={`mt-1 p-4 border rounded-lg w-full flex items-center justify-center transition-colors duration-200 border-dashed border-gray-300 bg-white text-gray-500 ${dragActive ? 'border-blue-500 bg-blue-50' : ''}`}>
                                {formData.image ? (
                                    <span className="text-gray-700 truncate">{formData.image.name}</span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <UploadCloud className="h-4 w-4" />
                                        <span>Drag and drop image, or click to select</span>
                                    </span>
                                )}
                            </div>
                            {formData.image && (
                                <div className="mt-2">
                                    <img src={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image} alt="Uploaded" className="h-20 rounded-lg shadow-md border border-gray-200" />
                                </div>
                            )}
                        </div>
                        <div className="col-span-full md:col-span-1">
                            <label className="text-sm font-medium text-gray-700 block mb-2">Description <span className="text-red-500">*</span></label>
                            <textarea
                                name="description"
                                value={formData.description || ''}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 text-sm py-3"
                                placeholder="Enter description"
                                rows={3}
                            />
                        </div>
                        <div className="col-span-full md:col-span-1">
                            <label className="text-sm font-medium text-gray-700 block mb-2">Sentence 1</label>
                            <input
                                type="text"
                                name="sentence1"
                                value={formData.sentence1 || ''}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 text-sm py-3"
                                placeholder="Enter sentence 1"
                            />
                        </div>
                        <div className="col-span-full md:col-span-1">
                            <label className="text-sm font-medium text-gray-700 block mb-2">Sentence 2</label>
                            <input
                                type="text"
                                name="sentence2"
                                value={formData.sentence2 || ''}
                                onChange={handleChange}
                                className="mt-1 w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-gray-900 placeholder:text-gray-400 text-sm py-3"
                                placeholder="Enter sentence 2"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                resetForm();
                            }}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-md"
                        >
                            <X className="mr-2 h-4 w-4" /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-red-400 hover:bg-red-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-md"
                        >
                            {isEditing ? (
                                <>
                                    <Save className="mr-2 h-4 w-4" /> Update
                                </>
                            ) : (
                                <>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Post
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        );
    };

    return (
        <motion.div variants={containerVariants} initial="initial" animate="animate" exit="exit" className="p-8">
            <div className="flex items-center justify-between mb-10">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-7 w-7 text-red-500" /> Location Information
                </h1>
                <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-2">Admin</span>
                    <span>Location Information</span>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {showForm ? renderLocationForm() : renderLocationTable()}
            </AnimatePresence>

            <div className="mt-8 flex justify-end">
                {!showForm && !locationData && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-red-400 hover:bg-red-500 text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200 shadow-md"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Location
                    </button>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </motion.div>
    );
};
export default Location;

