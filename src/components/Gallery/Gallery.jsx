import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Edit, UploadCloud, Image as ImageIcon } from 'react-feather';

// Load environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editGalleryItem, setEditGalleryItem] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [error, setError] = useState(null);

  // Helper function for drag and drop
  const reorderImages = (startIndex, endIndex) => {
    const reorderedImages = [...newImages];
    const [movedImage] = reorderedImages.splice(startIndex, 1);
    reorderedImages.splice(endIndex, 0, movedImage);
    setNewImages(reorderedImages);
    setDraggedIndex(endIndex);
  };

  // Fetch gallery items from the backend
  const fetchGalleryItems = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/gallery`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGalleryItems(data);
    } catch (error) {
      setError(error.message);
      console.error('Error fetching gallery items:', error);
    }
  }, []);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  // Handle image upload
  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      if (files.length <= 10) {
        const validImages = [];
        for (let i = 0; i < files.length; i++) {
          if (files[i].type.startsWith('image/')) {
            validImages.push(files[i]);
          } else {
            setError('Invalid file type. Please select only image files.');
            return;
          }
        }
        setNewImages(validImages);
        setError(null);
      } else {
        setError('You can only upload a maximum of 10 images.');
      }
    }
  };

  // Handle gallery item creation (Post Gallery)
  const handleCreateGalleryItem = async () => {
    if (newImages.length === 0) {
      setError('Please select images to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    newImages.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const response = await fetch(`${API_BASE_URL}/api/gallery`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Mock upload progress
      const totalSize = newImages.reduce((acc, file) => acc + file.size, 0);
      let uploaded = 0;
      const interval = setInterval(() => {
        uploaded += Math.floor(totalSize / 10);
        const progress = Math.min(100, Math.round((uploaded / totalSize) * 100));
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 300);

      const newGalleryItem = await response.json();
      setGalleryItems((prevItems) => [...prevItems, newGalleryItem]);
      setNewImages([]);
      setIsUploading(false);
      setUploadProgress(0);
      setError(null);

    } catch (error) {
      setError(error.message);
      console.error('Error creating gallery item:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle gallery item deletion
  const handleDeleteGalleryItem = async (id) => {
    try {
      const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/api/gallery/</span>{id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setGalleryItems((prevItems) => prevItems.filter((item) => item._id !== id));
    } catch (error) {
      setError(error.message);
      console.error('Error deleting gallery item:', error);
    }
  };

  // Handle editing a gallery item
  const handleEditGalleryItem = (item) => {
    setIsEditing(true);
    setEditGalleryItem(item);

    const files = item.images.map(img => {
      return fetch(img.secure_url)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `image-${img.public_id}.jpg`, { type: 'image/jpeg' });
          return file;
        });
    });

    Promise.all(files).then(resolvedFiles => {
      setNewImages(resolvedFiles);
    })
  };

  // Handle updating a gallery item
  const handleUpdateGalleryItem = async () => {
    if (!editGalleryItem) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();

    editGalleryItem.images.forEach((img) => {
      formData.append('existingImages', JSON.stringify(img));
    });

    newImages.forEach((image) => {
      formData.append('images', image);
    });

    try {
      const response = await fetch(`<span class="math-inline">\{API\_BASE\_URL\}/api/gallery/</span>{editGalleryItem._id}`, {
        method: 'PUT',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const totalSize = newImages.reduce((acc, file) => acc + file.size, 0);
      let uploaded = 0;
      const interval = setInterval(() => {
        uploaded += Math.floor(totalSize / 10);
        const progress = Math.min(100, Math.round((uploaded / totalSize) * 100));
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
        }
      }, 300);

      const updatedGalleryItem = await response.json();

      setGalleryItems(prevItems =>
        prevItems.map(item =>
          item._id === updatedGalleryItem._id ? updatedGalleryItem : item
        )
      );
      setIsUploading(false);
      setIsEditing(false);
      setEditGalleryItem(null);
      setNewImages([]);
      setUploadProgress(0);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error updating gallery item:', error);
      setIsUploading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800">Gallery Management</h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          {isEditing ? 'Edit Gallery' : 'Upload Images'}
        </h2>
        <div
          className="border-4 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400"
          onDrop={(e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
              if (files.length <= 10) {
                const validImages = [];
                for (let i = 0; i < files.length; i++) {
                  if (files[i].type.startsWith('image/')) {
                    validImages.push(files[i]);
                  } else {
                    setError('Invalid file type. Please select only image files.');
                    return;
                  }
                }
                setNewImages(validImages);
                setError(null);
              } else {
                setError('You can only upload a maximum of 10 images.');
              }
            }
          }}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
            id="fileInput"
          />
          <label htmlFor="fileInput" className="cursor-pointer">
            <UploadCloud className="w-12 h-12 mx-auto text-gray-600 mb-3" />
            <p className="text-lg text-gray-700">
              Drag and drop up to 10 images here, or click to select files.
            </p>
            <p className="text-gray-500 text-sm mt-1">(Only images are accepted)</p>
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {newImages.map((image, index) => (
            <div
              key={index}
              className="relative group"
              draggable={true}
              onDragStart={(e) => {
                e.preventDefault();
                setDraggedIndex(index);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                let targetIndex = index;
                const element = e.currentTarget;
                if (element) {
                  const rect = element.getBoundingClientRect();
                  const centerX = rect.left + rect.width / 2;
                  const parent = element.parentElement;
                  if (parent) {
                    for (let i = 0; i < parent.children.length; i++) {
                      const child = parent.children[i];
                      if (child !== element) {
                        const childRect = child.getBoundingClientRect();
                        if (centerX > childRect.left && centerX < childRect.right) {
                          targetIndex = i;
                          break;
                        }
                      }
                    }
                  }
                }

                if (targetIndex !== index) {
                  reorderImages(index, targetIndex);
                }
              }}
              style={{
                zIndex: draggedIndex === index ? 10 : 1,
              }}
            >
              <img
                src={URL.createObjectURL(image)}
                alt={`Preview ${index + 1}`}
                className="w-24 h-24 object-cover rounded-md border border-gray-200"
              />
              {draggedIndex === index && (
                <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
                  <p className="text-white text-sm">Dragging</p>
                </div>
              )}
              <button
                onClick={() =>
                  setNewImages((prevImages) => prevImages.filter((_, i) => i !== index))
                }
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {isUploading && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-red-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              >
                <span className="sr-only">{uploadProgress}% Complete</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">{uploadProgress}%</p>
          </div>
        )}

        <div className="mt-6 flex gap-4 justify-center">
          <button
            onClick={isEditing ? handleUpdateGalleryItem : handleCreateGalleryItem}
            disabled={isUploading || (newImages.length === 0 && !isEditing)}
            className="bg-red-600 text-white hover:bg-red-700 transition-colors px-6 py-2 rounded-md"
          >
            {isUploading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading...
              </>
            ) : isEditing ? 'Update Gallery' : 'Post Gallery'}
          </button>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Existing Gallery Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md p-4 relative group">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {item.images.map((img, index) => (
                  <div key={img.public_id} className="relative">
                    <img
                      src={img.secure_url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded-xl"
                    />
                    <div className="absolute top-1 right-1 bg-white rounded-full p-1 opacity-70">
                      <ImageIcon className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-sm">
                Uploaded: {new Date(item.createdAt).toLocaleDateString()}
              </p>
              <div className="absolute top-2 right-2 space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEditGalleryItem(item)}
                  className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded-md bg-white/80"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteGalleryItem(item._id)}
                  className="text-red-500 hover:text-red-700 px-2 py-1 rounded-md bg-white/80"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
    </div>
  );
};

export default GalleryPage;