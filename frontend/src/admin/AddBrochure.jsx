import React, { useEffect, useState } from 'react';
import { addBrochure, getBrochure } from '../api/apiCall';
import toast, { Toaster } from "react-hot-toast";
import { BarLoader } from "react-spinners";
import AddTheme from './AddTheme';
import { motion } from 'framer-motion';
import { BookOpen, UploadCloud, CheckCircle2, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const dummy = "https://dummyimage.com/350x350/000/fff.png&text=Please+Click+me";

function AddBrochure() {
  const [loading, setLoading] = useState(false);
  const [brochure, setBrochure] = useState([null, null, null]);
  const [uploadFiles, setUploadFiles] = useState([null, null, null]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await toast.promise(
          getBrochure(),
          {
            loading: 'Fetching brochure...',
            success: (res) => `Loaded successfully: ${res.message}`,
            error: 'Failed to fetch brochure. Please try again.',
          }
        );
        const data = response.data || {};
        const newImage = [
          data?.image1?.path || null,
          data?.image2?.path || null,
          data?.image3?.path || null,
        ];
        setBrochure(newImage);
      } catch (error) {
        console.error("Error fetching brochure:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      brochure.forEach(url => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [brochure]);

  const handleImageClick = (index) => {
    document.getElementById(`fileInput${index}`).click();
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...brochure];
      newImages[index] = URL.createObjectURL(file);
      setBrochure(newImages);

      const newUploadFiles = [...uploadFiles];
      newUploadFiles[index] = file;
      setUploadFiles(newUploadFiles);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    uploadFiles.forEach((file, index) => {
      if (file) {
        formData.append(`image${index + 1}`, file);
      }
    });

    await toast.promise(
      addBrochure(formData),
      {
        loading: 'Saving brochure...',
        success: 'Brochure saved successfully!',
        error: 'Failed to save Brochure.',
      }
    );
  };

  const hasUploads = uploadFiles.some(file => file);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans space-y-12 relative">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10 flex items-center justify-center"
      >
        <ArrowLeft size={24} className="text-gray-600" />
      </button>
      {loading ? (
        <div className="w-full min-h-[60vh] flex flex-col justify-center items-center">
          <BarLoader color="#4f46e5" width={150} />
          <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading brochure data...</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto space-y-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 text-green-600 mb-4">
              <BookOpen size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 font-heading">Event Brochure</h1>
            <p className="text-gray-500 mt-2 text-lg">Upload up to 3 pages for the official event brochure.</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {brochure.map((img, index) => (
                <div key={index} className="flex flex-col space-y-3">
                  <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Page {index + 1}
                  </label>
                  <div
                    onClick={() => handleImageClick(index)}
                    className="w-full aspect-[3/4] rounded-2xl border-2 border-dashed border-gray-300 hover:border-green-500 bg-gray-50 hover:bg-green-50/50 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group shadow-inner"
                  >
                    {img ? (
                      <>
                        <img
                          src={img}
                          alt={`Brochure Page ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-semibold flex items-center gap-2">
                            <UploadCloud size={20}/> Change Image
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-green-500 transition-colors">
                        <ImageIcon size={48} className="mb-3 opacity-50" />
                        <p className="font-medium text-sm text-center">Click to upload<br/>brochure page</p>
                      </div>
                    )}
                  </div>
                  {uploadFiles[index] && (
                    <p className="text-xs text-gray-500 font-medium text-center truncate px-2">
                      {uploadFiles[index].name}
                    </p>
                  )}
                  <input
                    type="file"
                    id={`fileInput${index}`}
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, index)}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-8 border-t border-gray-100 mt-8">
              <button
                onClick={handleSubmit}
                disabled={loading || !hasUploads}
                className={`flex items-center justify-center gap-2 py-4 px-12 rounded-xl font-bold text-lg transition-all shadow-lg w-full md:w-auto ${
                  loading || !hasUploads
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    : 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20 hover:scale-[1.02]'
                }`}
              >
                <CheckCircle2 size={24} /> 
                {loading ? 'Saving...' : 'Publish Brochure'}
              </button>
            </div>
          </motion.div>

          <AddTheme />
        </div>
      )}
      <Toaster position="top-center" />
    </div>
  );
}

export default AddBrochure;
