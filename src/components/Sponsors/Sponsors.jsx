import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Trash2, Edit, ChevronDown, Upload, Image, Plus } from "react-feather";
import axios from "axios";
import Dropzone from "react-dropzone";

// Load environment variables
const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL;

const LEVELS = ["Platinum", "Gold"];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};
const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};

const SponsorRow = ({ sponsor, handleEdit, handleDelete, setMenuOpen, menuOpen }) => {
    return (
        <motion.tr variants={itemVariants} className="border-b hover:bg-gray-50 transition-colors">
            <td className="p-4 text-center">
                {sponsor.logos && sponsor.logos.map((logo, index) => (
                    <img key={index} src={logo.secure_url} alt={`Logo ${index + 1}`} className="w-16 h-16 object-cover rounded-md mx-1 border inline-block" />
                ))}
            </td>
            <td className="p-4 text-left">{sponsor.companyName}</td>
            <td className="p-4 text-left">{sponsor.level}</td>
            <td className="p-4 text-left max-w-xs overflow-hidden text-ellipsis">{sponsor.description}</td>
            <td className="p-4 text-center relative">
                <button onClick={() => setMenuOpen(menuOpen === sponsor._id ? null : sponsor._id)} className="focus:outline-none">
                    <MoreVertical className="text-gray-600 hover:text-gray-800" />
                </button>
                <AnimatePresence>
                    {menuOpen === sponsor._id && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.1 }}
                            className="absolute right-0 bg-white shadow-lg rounded-md p-2 mt-2 w-36 z-10 border"
                        >
                            <div
                                onClick={() => handleEdit(sponsor)}
                                className="text-blue-600 hover:bg-gray-100 py-2 px-4 rounded-md flex items-center cursor-pointer"
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </div>
                            <div
                                onClick={() => handleDelete(sponsor._id)}
                                className="text-red-600 hover:bg-gray-100 py-2 px-4 rounded-md flex items-center cursor-pointer"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </div>
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
    const [menuOpen, setMenuOpen] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const [newSponsor, setNewSponsor] = useState({
        companyName: "",
        description: "",
        logos: [],
        level: "Platinum",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editSponsor, setEditSponsor] = useState(null);
    const [isLevelDropdownOpen, setIsLevelDropdownOpen] = useState(false);
    const [newLogos, setNewLogos] = useState([]); // State to hold multiple uploaded logos

    useEffect(() => {
        fetchSponsors();
    }, []);

    const fetchSponsors = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/sponsor`);
            setSponsors(response.data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const handleAddSponsor = async () => {
        const { companyName, description, level } = newSponsor;
        if (!companyName || !description || newLogos.length === 0) return alert("Fill all fields and upload at least one logo image.");

        const formData = new FormData();
        formData.append("companyName", companyName);
        formData.append("description", description);
        newLogos.forEach((logo) => {
            formData.append("logos", logo);
        });
        formData.append("level", level);

        try {
            await axios.post(`${API_BASE_URL}/api/sponsor`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setNewSponsor({ companyName: "", description: "", logos: [], level: "Platinum" });
            setNewLogos([]); // Clear uploaded logos after successful add
            fetchSponsors();
            setIsAdding(false);
        } catch (err) {
            console.error("Add error:", err);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/sponsor/${id}`);
            fetchSponsors();
            setMenuOpen(null);
        } catch (err) {
            console.error("Delete error:", err);
        }
    };

    const handleEdit = (sponsor) => {
        setEditSponsor({ ...sponsor });
        setIsEditing(true);
    };

    const handleUpdateSponsor = async () => {
        try {
            await axios.put(`${API_BASE_URL}/api/sponsor/${editSponsor._id}`, editSponsor);
            fetchSponsors();
            setIsEditing(false);
            setEditSponsor(null);
        } catch (err) {
            console.error("Update error:", err);
        }
    };

    const filteredSponsors = filteredLevel ? sponsors.filter((s) => s.level === filteredLevel) : sponsors;

    const handleLogoDrop = (acceptedFiles) => {
        setNewLogos((prevLogos) => [...prevLogos, ...acceptedFiles]);
    };

    const handleRemoveNewLogo = (index) => {
        setNewLogos((prevLogos) => prevLogos.filter((_, i) => i !== index));
    };

    return (
        <div className="p-6 min-h-screen bg-gray-50 font-sans">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Sponsors Management</h1>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-500 transition-colors shadow-md"
                >
                    {isAdding ? "Cancel" : "Add Sponsor"}
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div className="relative inline-block">
                    <button
                        onClick={() => setIsLevelDropdownOpen(!isLevelDropdownOpen)}
                        className="w-56 px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center justify-between"
                    >
                        {filteredLevel || "Filter by Level"}
                        <ChevronDown className="ml-2 h-5 w-5 text-gray-400" />
                    </button>
                    <AnimatePresence>
                        {isLevelDropdownOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute z-10 mt-2 w-56 bg-white rounded-md shadow-lg"
                            >
                                <div className="py-1">
                                    <button
                                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                        onClick={() => {
                                            setFilteredLevel("");
                                            setIsLevelDropdownOpen(false);
                                        }}
                                    >
                                        All Levels
                                    </button>
                                    {LEVELS.map((level) => (
                                        <button
                                            key={level}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                            onClick={() => {
                                                setFilteredLevel(level);
                                                setIsLevelDropdownOpen(false);
                                            }}
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
            {(isAdding || isEditing) && (
                <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-700">Name</label>
                            <input
                                type="text"
                                value={isEditing ? editSponsor.companyName : newSponsor.companyName}
                                onChange={(e) =>
                                    isEditing
                                        ? setEditSponsor({ ...editSponsor, companyName: e.target.value })
                                        : setNewSponsor({ ...newSponsor, companyName: e.target.value })
                                }
                                className="mt-1 p-2 border rounded-md w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700">Level</label>
                            <select
                                value={isEditing ? editSponsor.level : newSponsor.level}
                                onChange={(e) =>
                                    isEditing ? setEditSponsor({ ...editSponsor, level: e.target.value }) : setNewSponsor({ ...newSponsor, level: e.target.value })
                                }
                                className="mt-1 p-2 border rounded-md w-full"
                            >
                                {LEVELS.map((level) => (
                                    <option key={level}>{level}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-700">Description</label>
                            <textarea
                                rows={3}
                                value={isEditing ? editSponsor.description : newSponsor.description}
                                onChange={(e) =>
                                    isEditing
                                        ? setEditSponsor({ ...editSponsor, description: e.target.value })
                                        : setNewSponsor({ ...newSponsor, description: e.target.value })
                                }
                                className="mt-1 p-2 border rounded-md w-full"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-gray-700">Upload Logo Images</label>
                            <Dropzone onDrop={handleLogoDrop} accept="image/*" multiple={true}>
                                {({ getRootProps, getInputProps }) => (
                                    <div {...getRootProps()} className="border-dashed border-2 rounded-md p-4 cursor-pointer text-center">
                                        <input {...getInputProps()} />
                                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                                        <p className="mt-2 text-gray-600">Drag 'n' drop or click to select files</p>
                                    </div>
                                )}
                            </Dropzone>
                            <div className="mt-3 flex flex-wrap space-x-2">
                                {newLogos.map((logo, index) => (
                                    <motion.div
                                        key={index}
                                        layout
                                        className="relative"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <img src={URL.createObjectURL(logo)} alt={`Logo ${index + 1} Preview`} className="w-24 h-24 object-cover rounded-md border" />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewLogo(index)}
                                            className="absolute top-0 right-0 bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-red-600 hover:bg-gray-300 focus:outline-none"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                        <Image className="absolute top-1 right-1 h-5 w-5 text-gray-500" />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={isEditing ? handleUpdateSponsor : handleAddSponsor}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-500 transition"
                        >
                            {isEditing ? "Update Sponsor" : "Save Sponsor"}
                        </button>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto bg-white rounded-lg shadow">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4 text-center">Logo</th>
                            <th className="p-4">Company Name</th>
                            <th className="p-4">Level</th>
                            <th className="p-4">Description</th>
                            <th className="p-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <motion.tbody variants={containerVariants} initial="hidden" animate="visible">
                        {filteredSponsors.map((sponsor) => (
                            <SponsorRow
                                key={sponsor._id}
                                sponsor={sponsor}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                setMenuOpen={setMenuOpen}
                                menuOpen={menuOpen}
                            />
                        ))}
                    </motion.tbody>
                    {filteredSponsors.length === 0 && (
                        <div className="text-center p-6 text-gray-500">No sponsors available</div>
                    )}
                </table>
            </div>
        </div>
    );
};

export default SponsorsPage;