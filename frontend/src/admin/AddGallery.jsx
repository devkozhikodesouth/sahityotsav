import React, { useEffect, useState } from 'react';
import UnderFooter from '../components/Footer';
import { getGallery, deleteGalleryImage } from '../api/apiCall';
import GalleryUpaloader from './GalleryUpaloader';
import { Trash2, ImageIcon, Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

function AddGallery() {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getGallery();
        if (res && res.data) {
          setImages(res.data);  
        }
      } catch (err) {
        console.error("Failed to fetch gallery:", err.message);
      }
    }
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Image?",
      text: "This will permanently remove the image from the gallery.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      customClass: {
        popup: 'rounded-[2rem] p-6',
        title: 'text-2xl font-bold font-heading text-gray-900',
        confirmButton: 'rounded-xl px-6 py-3 font-semibold shadow-md',
        cancelButton: 'rounded-xl px-6 py-3 font-semibold',
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          toast.loading("Deleting image...");
          await deleteGalleryImage(id);
          setImages((prev) => prev.filter((img) => img._id !== id));
          toast.dismiss();
          toast.success("Image deleted!");
        } catch (err) {
          console.error("Delete failed:", err.message);
          toast.dismiss();
          toast.error("Failed to delete image ❌");
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10 flex items-center justify-center"
      >
        <ArrowLeft size={24} className="text-gray-600" />
      </button>
      <div className="py-10 px-4 sm:px-6 lg:px-8 space-y-12 pb-32">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-6xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 mb-4">
            <Camera size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-heading">Image Gallery</h1>
          <p className="text-gray-500 mt-2 text-lg">Manage photos for the public gallery showcase.</p>
        </motion.div>

        {/* Uploader Component */}
        <GalleryUpaloader images={images} setImages={setImages} />

        {/* Gallery Grid */}
        {images && images.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-6xl mx-auto space-y-6 pt-8 border-t border-gray-200"
          >
            <h2 className="text-2xl font-bold text-gray-900 px-2 flex items-center gap-2">
              <ImageIcon size={24} className="text-blue-500" />
              Published Photos <span className="text-gray-400 font-medium text-lg">({images.length})</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((img, index) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  key={img._id || index} 
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 aspect-square hover:shadow-lg transition-all"
                >
                  <img
                    src={img.path}
                    alt={`gallery-${index}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handleDelete(img._id)}
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110"
                      title="Delete Image"
                    >
                      <Trash2 size={24} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-0 w-full z-50">
        <UnderFooter />
      </div>
    </div>
  );
}

export default AddGallery;
