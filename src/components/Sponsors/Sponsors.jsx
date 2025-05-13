import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MoreVertical,
    Trash2,
    Edit,
    ChevronDown,
    Upload,
    Loader, // Added for spinners
    CheckCircle, // Added for success notifications
    AlertTriangle, // Added for error notifications
    X, // For closing notification
} from "react-feather";
import axios from "axios";
import Dropzone from "react-dropzone";

// Define API base URL from .env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const LEVELS = ["Platinum", "Gold"]; // Reverted to original levels

// Animation variants for container and items
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07 },
    },
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};

// Notification Component
const Notification = ({ message, type, onClose }) => {
    if (!message) return null;

    const icon =
        type === "success" ? (
            <CheckCircle className="w-6 h-6 text-green-500" />
        ) : (
            <AlertTriangle className="w-6 h-6 text-red-500" />
        );

    return (
        <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50, transition: { duration: 0.3 } }}
            className={`fixed top-5 right-5 p-4 rounded-lg shadow-xl z-50 flex items-center space-x-3
        ${type === "success" ? "bg-green-50 text-green-700 border border-green-300" : "bg-red-50 text-red-700 border border-red-300"}`}
        >
            {icon}
            <span>{message}</span>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
            </button>
        </motion.div>
    );
};


const SponsorRow = ({ sponsor, handleEdit, handleDelete, setMenuOpen, menuOpen, deletingSponsorId }) => {
    return (
        <motion.tr variants={itemVariants} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150">
            <td className="p-4 text-center">
                {sponsor.logos && sponsor.logos.length > 0 ? (
                    sponsor.logos.map((logo, index) => (
                        <img
                            key={index}
                            src={logo.secure_url}
                            alt={`${sponsor.companyName} Logo ${index + 1}`}
                            className="w-16 h-16 object-contain rounded-md mx-1 border border-gray-200 inline-block bg-white p-1"
                            onError={(e) => { e.target.src = 'https://placehold.co/64x64/e2e8f0/94a3b8?text=Logo'; e.target.alt = 'Placeholder Logo'; }}
                        />
                    ))
                ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gray-100 text-gray-400 rounded-md mx-auto border border-gray-200 text-xs">
                        No Logo
                    </div>
                )}
            </td>
            <td className="p-4 text-left text-gray-700 font-medium">{sponsor.companyName}</td>
            <td className="p-4 text-left text-gray-600">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    sponsor.level === "Platinum" ? "bg-purple-100 text-purple-700" :
                    sponsor.level === "Gold" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700" // Default for any other levels if they were to be added
                }`}>
                    {sponsor.level}
                </span>
            </td>
            <td className="p-4 text-left text-gray-600 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap">{sponsor.description}</td>
            <td className="p-4 text-center relative">
                <button
                    onClick={() => setMenuOpen(menuOpen === sponsor._id ? null : sponsor._id)}
                    className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
                >
                    <MoreVertical className="text-gray-500 hover:text-gray-700 w-5 h-5" />
                </button>
                <AnimatePresence>
                    {menuOpen === sponsor._id && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.1 } }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 mt-2 w-36 bg-white shadow-lg rounded-md p-1 z-20 border border-gray-200"
                            // ref={actionMenuRef} // Assign ref if individual closing logic is needed
                        >
                            <button
                                onClick={() => { handleEdit(sponsor); setMenuOpen(null); }}
                                className="w-full text-left text-sm text-blue-600 hover:bg-gray-100 py-2 px-3 rounded-md flex items-center transition-colors"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(sponsor._id)}
                                disabled={deletingSponsorId === sponsor._id}
                                className="w-full text-left text-sm text-red-600 hover:bg-gray-100 py-2 px-3 rounded-md flex items-center transition-colors disabled:opacity-50"
                            >
                                {deletingSponsorId === sponsor._id ? (
                                    <Loader className="animate-spin mr-2 h-4 w-4" />
                                ) : (
                                    <Trash2 className="mr-2 h-4 w-4" />
                                )}
                                Delete
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </td>
        </motion.tr>
    );
};

const SponsorsPage = () => {
    const [sponsors, setSponsors] = useState([]);
    const [filteredLevel, setFilteredLevel] = useState("");
    const [menuOpen, setMenuOpen] = useState(null); // For row action menu
    const [isAdding, setIsAdding] = useState(false);
    const [newSponsor, setNewSponsor] = useState({
        companyName: "",
        description: "",
        level: "Platinum", // Default to Platinum
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editSponsor, setEditSponsor] = useState(null);
    const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
    const [newLogos, setNewLogos] = useState([]); // Files for new sponsor

    // Loading states
    const [isFetchingSponsors, setIsFetchingSponsors] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deletingSponsorId, setDeletingSponsorId] = useState(null);

    // Notification state
    const [notification, setNotification] = useState({ message: "", type: "", key: 0 });

    const levelDropdownRef = useRef(null);
    // const actionMenuRef = useRef(null); // Ref for individual action menus (if needed for outside click)

    // Function to show notifications
    const showNotification = (message, type) => {
        setNotification({ message, type, key: Date.now() }); // Use key to re-trigger animation
        setTimeout(() => {
            setNotification({ message: "", type: "", key: 0 });
        }, 4000); // Auto-dismiss after 4 seconds
    };

    useEffect(() => {
        fetchSponsors();
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (levelDropdownRef.current && !levelDropdownRef.current.contains(event.target)) {
                setIsLevelDropdownOpen(false);
            }
            // For action menus, if they are not contained within a parent that has the ref,
            // this becomes tricky. A global click on the main div could close `menuOpen`.
            // Or, each `SponsorRow`'s menu div would need its own ref and logic.
            // For simplicity, clicking another "MoreVertical" button already closes the previous one.
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []); // Removed menuOpen from dependencies as it could cause re-renders


    const fetchSponsors = async () => {
        setIsFetchingSponsors(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/sponsor`);
            setSponsors(response.data);
        } catch (err) {
            console.error("Fetch error:", err);
            showNotification(`Failed to fetch sponsors: ${err.message || "Server error"}`, "error");
        } finally {
            setIsFetchingSponsors(false);
        }
    };

    const handleAddSponsor = async () => {
        const { companyName, description, level } = newSponsor;
        if (!companyName.trim() || !description.trim()) {
            showNotification("Company name and description are required.", "error");
            return;
        }
        if (newLogos.length === 0) {
            showNotification("At least one logo image is required.", "error");
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("companyName", companyName);
        formData.append("description", description);
        newLogos.forEach((logoFile) => {
            formData.append("logos", logoFile);
        });
        formData.append("level", level);

        try {
            await axios.post(`${API_BASE_URL}/api/sponsor`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setNewSponsor({ companyName: "", description: "", level: "Platinum" });
            setNewLogos([]);
            fetchSponsors();
            setIsAdding(false);
            showNotification("Sponsor added successfully!", "success");
        } catch (err) {
            console.error("Add error:", err);
            showNotification(`Failed to add sponsor: ${err.response?.data?.message || err.message || "Server error"}`, "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        setDeletingSponsorId(id);
        try {
            await axios.delete(`${API_BASE_URL}/api/sponsor/${id}`);
            fetchSponsors(); // Re-fetch to update list
            setMenuOpen(null); // Close action menu
            showNotification("Sponsor deleted successfully!", "success");
        } catch (err)
        {
            console.error("Delete error:", err);
            showNotification(`Failed to delete sponsor: ${err.response?.data?.message || err.message || "Server error"}`, "error");
        } finally {
            setDeletingSponsorId(null);
        }
    };

    const handleEdit = (sponsor) => {
        setEditSponsor({ ...sponsor }); 
        setNewLogos([]); 
        setIsEditing(true);
        setIsAdding(false); 
        setMenuOpen(null); 
    };

    const handleUpdateSponsor = async () => {
        if (!editSponsor || !editSponsor.companyName.trim() || !editSponsor.description.trim()) {
            showNotification("Company name and description are required.", "error");
            return;
        }
        
        setIsSubmitting(true);
        try {
            const payload = {
                companyName: editSponsor.companyName,
                description: editSponsor.description,
                level: editSponsor.level,
                // Logos are not updated here. Backend should preserve existing logos if not sent.
            };

            await axios.put(`${API_BASE_URL}/api/sponsor/${editSponsor._id}`, payload);
            fetchSponsors();
            setIsEditing(false);
            setEditSponsor(null);
            showNotification("Sponsor updated successfully!", "success");
        } catch (err) {
            console.error("Update error:", err);
            showNotification(`Failed to update sponsor: ${err.response?.data?.message || err.message || "Server error"}`, "error");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const toggleAddForm = () => {
        if (isAdding) {
            setIsAdding(false); 
            setNewSponsor({ companyName: "", description: "", level: "Platinum" });
            setNewLogos([]);
        } else {
            setIsAdding(true); 
            setIsEditing(false); 
            setEditSponsor(null);
            // Reset newSponsor form to defaults when opening for Add
            setNewSponsor({ companyName: "", description: "", level: "Platinum" });
            setNewLogos([]);
        }
    };


    const filteredSponsors = filteredLevel ? sponsors.filter((s) => s.level === filteredLevel) : sponsors;

    const handleLogoDrop = (acceptedFiles) => {
        const combinedLogos = [...newLogos, ...acceptedFiles].slice(0, 5); 
        setNewLogos(combinedLogos);
    };

    const handleRemoveNewLogo = (indexToRemove) => {
        setNewLogos((prevLogos) => prevLogos.filter((_, i) => i !== indexToRemove));
    };
    
    const currentFormData = isEditing ? editSponsor : newSponsor;
    const setCurrentFormValue = (field, value) => {
        if (isEditing) {
            setEditSponsor(prev => ({ ...prev, [field]: value }));
        } else {
            setNewSponsor(prev => ({ ...prev, [field]: value }));
        }
    };


    return (
        <div className="p-4 sm:p-6 md:p-8 min-h-screen bg-gradient-to-br from-gray-100 to-slate-100 font-sans text-gray-800">
            <AnimatePresence>
                {notification.message && (
                    <Notification
                        key={notification.key} 
                        message={notification.message}
                        type={notification.type}
                        onClose={() => setNotification({ message: "", type: "", key: 0 })}
                    />
                )}
            </AnimatePresence>

            <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b border-gray-300">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-700 mb-4 sm:mb-0">Sponsors Dashboard</h1>
                <button
                    onClick={toggleAddForm}
                    className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center transition-all duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md hover:shadow-lg
                        ${isAdding ? "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500" : "bg-red-600 hover:bg-red-700 focus:ring-red-500"} text-white`}
                >
                    {isAdding ? "Cancel" : "Add New Sponsor"}
                </button>
            </header>

            <AnimatePresence>
                {(isAdding || isEditing) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="bg-white p-6 rounded-xl shadow-xl mb-8 overflow-hidden"
                    >
                        <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b pb-3">
                            {isEditing ? "Edit Sponsor" : "Add New Sponsor"}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="companyName" className="block text-sm font-medium text-gray-600 mb-1">Company Name</label>
                                <input
                                    id="companyName"
                                    type="text"
                                    placeholder="e.g., Acme Corp"
                                    value={currentFormData?.companyName || ""}
                                    onChange={(e) => setCurrentFormValue('companyName', e.target.value)}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
                                />
                            </div>
                            <div>
                                <label htmlFor="level" className="block text-sm font-medium text-gray-600 mb-1">Sponsorship Level</label>
                                <select
                                    id="level"
                                    value={currentFormData?.level || "Platinum"}
                                    onChange={(e) => setCurrentFormValue('level', e.target.value)}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow bg-white"
                                >
                                    {LEVELS.map((level) => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Description</label>
                                <textarea
                                    id="description"
                                    rows={4}
                                    placeholder="Brief description of the company and their sponsorship"
                                    value={currentFormData?.description || ""}
                                    onChange={(e) => setCurrentFormValue('description', e.target.value)}
                                    className="mt-1 p-3 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-shadow"
                                />
                            </div>
                            
                            {/* Logo upload only for new sponsors or if edit functionality is extended */}
                            {!isEditing && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Company Logos (up to 5)</label>
                                    <Dropzone onDrop={handleLogoDrop} accept={{ 'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.svg'] }} multiple={true}>
                                        {({ getRootProps, getInputProps, isDragActive }) => (
                                            <div
                                                {...getRootProps()}
                                                className={`border-2 border-dashed rounded-lg p-8 cursor-pointer text-center transition-colors
                                                    ${isDragActive ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}
                                            >
                                                <input {...getInputProps()} />
                                                <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                                                {isDragActive ? (
                                                    <p className="text-red-600">Drop the files here ...</p>
                                                ) : (
                                                    <p className="text-gray-500">Drag 'n' drop logos here, or click to select files</p>
                                                )}
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF, SVG up to 1MB each</p>
                                            </div>
                                        )}
                                    </Dropzone>
                                    {newLogos.length > 0 && (
                                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                            <AnimatePresence>
                                                {newLogos.map((logo, index) => (
                                                    <motion.div
                                                        key={URL.createObjectURL(logo) + index} // Ensure unique key for animation
                                                        layout
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                                        className="relative group"
                                                    >
                                                        <img
                                                            src={URL.createObjectURL(logo)}
                                                            alt={`Logo Preview ${index + 1}`}
                                                            className="w-full h-24 object-contain rounded-md border border-gray-200 p-1 bg-white"
                                                            onLoad={(e) => URL.revokeObjectURL(e.target.src)} // Clean up object URL
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveNewLogo(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none shadow-md hover:bg-red-600"
                                                            aria-label="Remove logo"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </div>
                            )}
                             {isEditing && editSponsor?.logos?.length > 0 && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-600 mb-1">Current Logos</label>
                                    <div className="mt-2 flex flex-wrap gap-3">
                                        {editSponsor.logos.map((logo, index) => (
                                            <div key={logo.public_id || index} className="relative">
                                                <img
                                                    src={logo.secure_url}
                                                    alt={`Current Logo ${index + 1}`}
                                                    className="w-24 h-24 object-contain rounded-md border border-gray-200 p-1 bg-white"
                                                    onError={(e) => { e.target.src = 'https://placehold.co/96x96/e2e8f0/94a3b8?text=Logo'; }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Logo editing in this form is not supported. To change logos, please delete and re-add the sponsor.</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-8 flex justify-end space-x-3">
                             <button
                                type="button"
                                onClick={() => { 
                                    if (isEditing) {
                                        setIsEditing(false); 
                                        setEditSponsor(null);
                                    } else {
                                        setIsAdding(false);
                                    }
                                    // Reset forms to default only when explicitly cancelling "Add"
                                    if (!isEditing) {
                                      setNewSponsor({ companyName: "", description: "", level: "Platinum" });
                                      setNewLogos([]);
                                    }
                                }}
                                className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={isEditing ? handleUpdateSponsor : handleAddSponsor}
                                disabled={isSubmitting}
                                className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader className="animate-spin h-5 w-5 mr-2" />
                                        Processing...
                                    </>
                                ) : (isEditing ? "Update Sponsor" : "Save Sponsor")
                                }
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="relative inline-block w-full sm:w-auto" ref={levelDropdownRef}>
                    <button
                        onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                        className="w-full sm:w-56 px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm flex items-center justify-between hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 transition-colors"
                    >
                        <span className="text-gray-700">{filteredLevel || "Filter by Level"}</span>
                        <ChevronDown className={`ml-2 h-5 w-5 text-gray-400 transition-transform duration-200 ${isLevelDropdownOpen ? "transform rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                        {isLevelDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                                transition={{ duration: 0.2 }}
                                className="absolute z-10 mt-1 w-full sm:w-56 bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden"
                            >
                                <div className="py-1">
                                    <button
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
                                        onClick={() => { setFilteredLevel(""); setIsLevelDropdownOpen(false); }}
                                    >
                                        All Levels
                                    </button>
                                    {LEVELS.map((level) => (
                                        <button
                                            key={level}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-500 hover:text-white transition-colors"
                                            onClick={() => { setFilteredLevel(level); setIsLevelDropdownOpen(false); }}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {isFetchingSponsors && (
                <div className="flex justify-center items-center p-10">
                    <Loader className="animate-spin h-10 w-10 text-red-600" />
                    <p className="ml-3 text-gray-600">Loading sponsors...</p>
                </div>
            )}

            {!isFetchingSponsors && (
                 <div className="overflow-x-auto bg-white rounded-xl shadow-xl">
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="bg-gray-100 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-center font-semibold text-gray-600 uppercase tracking-wider">Logo(s)</th>
                                <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider">Company Name</th>
                                <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider">Level</th>
                                <th className="p-4 font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                                <th className="p-4 text-center font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                            {filteredSponsors.length > 0 ? (
                                filteredSponsors.map((sponsor) => (
                                    <SponsorRow
                                        key={sponsor._id}
                                        sponsor={sponsor}
                                        handleEdit={handleEdit}
                                        handleDelete={handleDelete}
                                        setMenuOpen={setMenuOpen}
                                        menuOpen={menuOpen}
                                        deletingSponsorId={deletingSponsorId}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="text-center p-10 text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            <p className="font-semibold text-lg">No sponsors found.</p>
                                            <p className="text-sm">{filteredLevel ? `There are no sponsors for the level "${filteredLevel}".` : "Try adding a new sponsor or adjusting your filters."}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </motion.tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SponsorsPage;
