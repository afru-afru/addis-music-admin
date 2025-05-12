import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { CircleLoader } from 'react-spinners';

// Note: This component is likely intended for an admin panel or similar protected route,
// as it allows adding, editing, and deleting About Us information.

const containerVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.5 } },
};

const formVariants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2 } },
};

const tableVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { delayChildren: 0.2, staggerChildren: 0.1 } },
};

const rowVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function AboutUs() {
  // State variables - types removed for JavaScript
  const [aboutUsData, setAboutUsData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // const [activeAction, setActiveAction] = useState(null); // State seems unused
  const [checkedItems, setCheckedItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // Can be File, URL string, or null
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState(null); // Can be string or null
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null); // Ref without explicit type
  const [loading, setLoading] = useState(true);

  // Derived state
  const hasExistingInformation = aboutUsData.length > 0;
  const totalPages = Math.ceil(aboutUsData.length / itemsPerPage);
  const currentItems = aboutUsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helper function to get the base URL with a check
  const getBaseUrl = () => {
      const url = import.meta.env.VITE_API_BASE_URL;
      if (!url) {
          console.error("VITE_API_BASE_URL is not set in environment variables.");
          // For this component, returning empty string and handling the empty
          // baseUrl case explicitly in fetch/submit is better.
          return '';
      }
      return url;
  }


  // Fetch data from backend on page load
  useEffect(() => {
    const fetchAboutUsData = async () => {
      setLoading(true);
      const baseUrl = getBaseUrl(); // Get base URL
      if (!baseUrl) {
          setErrorMessage("Configuration error: API Base URL is not set.");
          setLoading(false);
          return; // Stop fetch if config is missing
      }

      try {
        // --- USING ENV VARIABLE FOR FETCH ---
        const response = await axios.get(`${baseUrl}/api/aboutus`);
        // -----------------------------------

        // Assuming API returns { data: [...] } as observed previously for /api/aboutus
        if (response.data && Array.isArray(response.data.data) && response.data.data.length > 0) {
          setAboutUsData(response.data.data);
        } else {
          setAboutUsData([]);
        }
        setErrorMessage(''); // Clear error on successful fetch
      } catch (error) {
        console.error('Error fetching About Us data:', error);
        setAboutUsData([]);
        setErrorMessage('Failed to fetch About Us data.'); // Set error state on fetch failure
      } finally {
        setLoading(false);
      }
    };
    fetchAboutUsData();
    // Removed successMessage and errorMessage from dependencies as they are not needed for refetch
  }, []); // Empty dependency array means this runs once on mount

  // Effect to clear success message after a delay - kept as is
  useEffect(() => {
    if (successMessage) {
      const timeout = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [successMessage]);

  // Effect to clear error message after a delay - kept as is
  useEffect(() => {
    if (errorMessage) {
      const timeout = setTimeout(() => setErrorMessage(''), 3000);
      return () => clearTimeout(timeout);
    }
  }, [errorMessage]);

  const handlePageChange = (page) => { // Type annotation removed
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // const handleActionClick = (id) => { // Type annotation removed - State seems unused
  //   setActiveAction(id === activeAction ? null : id);
  // };

  const handleCheckboxChange = (id) => { // Type annotation removed
    setCheckedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const resetForm = () => {
    setShowForm(false);
    setTitle('');
    setDescription('');
    setSelectedImage(null);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input value
    }
    setErrorMessage(''); // Clear error message on form reset
    setSuccessMessage(''); // Clear success message on form reset
  };

  const handleImageChange = (e) => { // Type annotation removed
    const file = e.target.files?.[0]; // Use optional chaining
    if (file) setSelectedImage(file);
  };

  const handleDrop = (e) => { // Type annotation removed
    e.preventDefault();
    const file = e.dataTransfer.files?.[0]; // Use optional chaining
    if (file) setSelectedImage(file);
  };

  const handleDragOver = (e) => e.preventDefault(); // Type annotation removed

  const handleBrowseClick = () => fileInputRef.current?.click(); // Use optional chaining

  const handleSubmit = async (e) => { // Type annotation removed
    e.preventDefault();
    setErrorMessage(''); // Clear previous errors
    setSuccessMessage(''); // Clear previous success message

    if (hasExistingInformation && !editingId) {
      setErrorMessage('Only one About Us information is allowed. Please edit or delete the existing one to add new.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);

    // Append image only if a new file is selected
    if (selectedImage instanceof File) {
      formData.append('image', selectedImage);
    } else if (selectedImage === null && editingId) {
      // Handle case where image is cleared on edit? Or keep existing image if none selected?
      // Current backend might expect image on PUT. Needs clarification if image is optional on PUT.
      // For now, if editing and no *new* file is selected, we don't append 'image'.
      // The backend needs to handle PUT requests without a new image upload
      // (e.g., by keeping the old image unless a new one is provided).
    }


     const baseUrl = getBaseUrl(); // Get base URL
      if (!baseUrl) {
          const configErrorMsg = "Configuration error: API Base URL is not set. Cannot submit form.";
          console.error(configErrorMsg);
          setErrorMessage(configErrorMsg);
          return; // Stop submission if config is missing
      }


    try {
      let response;
      if (editingId) {
         // --- USING ENV VARIABLE FOR PUT ---
        response = await axios.put(`${baseUrl}/api/aboutus/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // ----------------------------------

        // Assuming PUT response structure is { data: { ...updatedItem } }
         if (response.data && response.data.data) {
              setAboutUsData(prev =>
                prev.map(item => (item._id === editingId ? response.data.data : item))
              );
               setSuccessMessage('Information updated successfully!');
         } else {
              throw new Error("Update successful but received no data or unexpected format.");
         }

      } else {
         // --- USING ENV VARIABLE FOR POST ---
        response = await axios.post(`${baseUrl}/api/aboutus`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        // -----------------------------------

        // Assuming POST response structure is { data: { ...newItem } }
        if (response.data && response.data.data) {
            // Replace existing data with the new one, assuming only one item is allowed
             setAboutUsData([response.data.data]);
             setSuccessMessage('Information added successfully!');
        } else {
             throw new Error("Creation successful but received no data or unexpected format.");
        }
      }

      resetForm(); // Reset form on successful submission

    } catch (error) {
      console.error("Error submitting About Us info:", error);
      // Improved error message display
      if (axios.isAxiosError(error)) {
         const apiErrorMsg = error.response?.data?.message || error.message;
         setErrorMessage(`Error submitting information: ${apiErrorMsg}`);
         console.error("Axios error details:", error.response);
      } else {
         setErrorMessage(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  const handleAddInformationClick = () => {
    if (hasExistingInformation && !editingId) {
      setErrorMessage('Only one About Us information is allowed. Please edit or delete the existing one to add new.');
      return;
    }
    resetForm(); // Always reset form before showing it for add
    setShowForm(true);
  };

  const handleEditInformation = (id) => { // Type annotation removed
    const item = aboutUsData.find(item => item._id === id);
    if (item) {
      setEditingId(id);
      setTitle(item.title);
      setDescription(item.description);
      setSelectedImage(item.image); // Set image URL string for preview
      setShowForm(true);
      setErrorMessage(''); // Clear errors when starting edit
      setSuccessMessage(''); // Clear success message when starting edit
    }
  };

  const handleDeleteInformation = async (id) => { // Type annotation removed
    setErrorMessage(''); // Clear previous errors
    setSuccessMessage(''); // Clear previous success message
     const baseUrl = getBaseUrl(); // Get base URL
      if (!baseUrl) {
          const configErrorMsg = "Configuration error: API Base URL is not set. Cannot delete item.";
          console.error(configErrorMsg);
          setErrorMessage(configErrorMsg);
          return; // Stop deletion if config is missing
      }

    try {
       // --- USING ENV VARIABLE FOR DELETE ---
      await axios.delete(`${baseUrl}/api/aboutus/${id}`);
      // -------------------------------------

      setAboutUsData([]); // Clear the data after deletion as only one item is expected
      setSuccessMessage('Information deleted successfully!');
      // Optional: refetch data instead of clearing if multiple items were allowed later
      // fetchAboutUsData();

    } catch (error) {
      console.error("Error deleting About Us info:", error);
       // Improved error message display
      if (axios.isAxiosError(error)) {
         const apiErrorMsg = error.response?.data?.message || error.message;
         setErrorMessage(`Error deleting information: ${apiErrorMsg}`);
         console.error("Axios error details:", error.response);
      } else {
         setErrorMessage(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  };

  // Loading state render - kept as is
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <CircleLoader color="#e3342f" loading={loading} size={60} />
      </div>
    );
  }

  // Main component render
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="p-8 space-y-8 bg-white rounded-xl shadow-lg mt-4"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">About Us Information</h1>
          <p className="text-sm text-gray-500 mt-1">Admin &gt; About Us Information</p>
        </div>
        {/* Disable "Add Information" button if info exists and not currently editing */}
        <button
          className={`bg-red-600 text-white rounded-lg px-6 py-2 text-sm font-semibold hover:bg-red-700 ${hasExistingInformation && !editingId ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={handleAddInformationClick}
          disabled={hasExistingInformation && !editingId}
        >
          + Add Information
        </button>
      </div>

      {/* Success message display - kept as is */}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-4 rounded-md">
          <p>{successMessage}</p>
        </div>
      )}

      {/* Error message display - kept as is */}
      {errorMessage && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          <p>{errorMessage}</p>
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            key="form"
            className="bg-white rounded-lg shadow-md p-6 mt-6"
            variants={formVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">{editingId ? 'Edit Information' : 'Add New Information'}</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-3 mt-1 focus:ring-red-500 focus:border-red-500 text-sm"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter title"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                className="w-full h-32 border border-gray-300 rounded-lg p-3 mt-1 focus:ring-red-500 focus:border-red-500 resize-none text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <div
                className="border-dashed border-2 border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                  accept="image/*"
                />
                {/* Display image preview if selected */}
                {selectedImage ? (
                  <img
                    // If selectedImage is a string, it's likely an existing URL. If a File, create URL.
                    src={typeof selectedImage === 'string' ? selectedImage : URL.createObjectURL(selectedImage)}
                    alt="Preview"
                    className="max-h-40 max-w-full rounded-lg"
                  />
                ) : (
                  <p className="text-gray-500">Drag & Drop or Click to Browse</p>
                )}
                <button
                  type="button"
                  className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-red-700"
                  onClick={handleBrowseClick}
                >
                  Browse
                </button>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                className="border border-gray-300 rounded-lg px-6 py-2 text-sm font-semibold hover:bg-gray-100"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button
                className="bg-red-600 text-white rounded-lg px-6 py-2 text-sm font-semibold hover:bg-red-700"
                onClick={handleSubmit}
              >
                {editingId ? 'Update' : 'Post'} Information
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Display table if form is not shown */}
      {!showForm && (
        <>
          <motion.div
            className="overflow-x-auto rounded-lg shadow-sm bg-gray-50"
            variants={tableVariants}
            initial="initial"
            animate="animate"
          >
            <table className="min-w-full divide-y divide-gray-200 table-auto">
              <thead className="bg-gray-100">
                <tr>
                  {/* Table Headers */}
                  {/* <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Checkbox</th> */} {/* Checkbox column header - seems unused in JSX body */}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">No data available</td> {/* colspan=4 as there are 4 visible columns */}
                  </tr>
                ) : (
                  currentItems.map(item => (
                    <motion.tr key={item._id} className="hover:bg-gray-50" variants={rowVariants}>
                       {/* Checkbox cell - seems unused/commented out */}
                       {/* <td className="px-6 py-4 text-sm">
                          <input
                            type="checkbox"
                            checked={checkedItems.includes(item._id)}
                            onChange={() => handleCheckboxChange(item._id)}
                            className="form-checkbox h-4 w-4 text-red-600"
                          />
                       </td> */}
                      <td className="px-6 py-4 text-sm break-words max-w-xs">{item.description}</td>
                      {/* Display formatted date, fallback if createdAt is missing */}
                      <td className="px-6 py-4 text-sm text-gray-500">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        {/* Display image, fallback or handle missing image */}
                        {item.image ? (
                             <img src={item.image} alt={item.title || 'About Us Image'} className="h-16 w-16 object-cover rounded-lg" />
                        ) : (
                             <span className="text-gray-400">No Image</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-3">
                          {/* Edit Button */}
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleEditInformation(item._id)} // Use item._id directly, no non-null assertion needed in JS
                          >
                            Edit
                          </button>
                          {/* Delete Button */}
                          <button
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteInformation(item._id)} // Use item._id directly
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Showing {currentItems.length} of {aboutUsData.length} entries
            </div>
            <div>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 border rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <span className="mx-2 text-sm text-gray-500">Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 border rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}

export default AboutUs;
