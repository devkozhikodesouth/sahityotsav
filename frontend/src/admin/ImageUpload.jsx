import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Draggable from 'react-draggable';
import toast, { Toaster } from 'react-hot-toast';
import { baseUrl } from '../api/cateGoryAnditem';
import {  ImageUploadServer } from '../api/apiCall';
import { motion } from 'framer-motion';
import { Image as ImageIcon, UploadCloud, Move, Palette, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarLoader } from 'react-spinners';

const dummy = "https://dummyimage.com/350x350/000/fff.png&text=Upload+Image";
const imageClass = 'object-contain w-full h-full cursor-pointer transition-transform hover:scale-105';

const ImageUpload = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [images, setImages] = useState([null, null, null]);
  const [files, setFiles] = useState([null, null, null]);
  const [color, setColor] = useState(['text-black', 'text-black', 'text-black']);
  const [positions, setPositions] = useState([{ x: 45, y: 140 }, { x: 45, y: 140 }, { x: 45, y: 140 }]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/showImage`);
        const data = response.data?.data || {};

        const newImages = [
          data?.image1?.image || null,
          data?.image2?.image || null,
          data?.image3?.image || null,
        ];
        const newColor = [
          data?.image1?.color || 'text-black',
          data?.image2?.color || 'text-black',
          data?.image3?.color || 'text-black',
        ];
        const newPositions = [
          data?.image1?.positions ? data.image1.positions : { x: 45, y: 140 },
          data?.image2?.positions ? data.image2.positions : { x: 45, y: 140 },
          data?.image3?.positions ? data.image3.positions : { x: 45, y: 140 },
        ];
        setImages(newImages);
        setColor(newColor);
        setPositions(newPositions);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleImageClick = (index) => {
    document.getElementById(`fileInput${index}`).click();
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImages = [...images];
      newImages[index] = URL.createObjectURL(file);
      setImages(newImages);

      const newFiles = [...files];
      newFiles[index] = file;
      setFiles(newFiles);
    }
  };

  const handleColorChange = (index, newColor) => {
    const updated = [...color];
    updated[index] = newColor;
    setColor(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    files.forEach((file, index) => {
      if (file) {
        formData.append(`image${index + 1}`, file);
      }
    });

    formData.append('color', JSON.stringify(color));
    formData.append('positions', JSON.stringify(positions));

    toast.loading('Publishing Posters...');
    try {
      const response = await ImageUploadServer(formData);

      if (response && response.success) {
        toast.dismiss();
        toast.success('Posters published successfully!');
      } else {
        throw new Error(response?.message || 'Failed to upload image.');
      }
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || 'Failed to upload image.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <BarLoader color="#ec4899" width={150} />
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading poster designs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans relative">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10 flex items-center justify-center"
      >
        <ArrowLeft size={24} className="text-gray-600" />
      </button>
      <div className="max-w-7xl mx-auto space-y-10">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-500/10 text-pink-600 mb-4">
            <ImageIcon size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-heading">Result Posters</h1>
          <p className="text-gray-500 mt-2 text-lg">Upload square (1:1) result templates. Position the dummy text and select text color.</p>
        </motion.div>

        <form onSubmit={handleSubmit}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {images.map((img, index) => (
                <div key={index} className="flex flex-col space-y-6">
                  
                  {/* Image Preview Container */}
                  <div className="relative w-full aspect-square rounded-3xl border-2 border-dashed border-gray-300 hover:border-pink-500 bg-gray-100 overflow-hidden shadow-inner group">
                    <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wider">
                      Template {index + 1}
                    </div>

                    <img
                      src={img || dummy}
                      alt={`Poster ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                    
                    {/* Draggable Text Overlay */}
                    <Draggable
                      bounds="parent"
                      defaultPosition={positions[index]}
                      onStop={(e, data) => {
                        const updatedPositions = [...positions];
                        updatedPositions[index] = { x: data.x, y: data.y };
                        setPositions(updatedPositions);
                      }}
                    >
                      <div className="absolute top-0 left-0 p-2 cursor-move z-20 flex flex-col hover:ring-2 hover:ring-white/50 rounded transition-all">
                        <div className={`text-[10px] font-semibold ${color[index]}`}>
                          Category Name
                        </div>
                        <div className={`text-[15px] font-bold -mt-[6px] ${color[index]}`}>
                          Item Name
                        </div>

                        <div className="mt-2 pl-[10px] text-start">
                          {[...Array(3)].map((_, idx) => (
                            <div key={idx}>
                              <div className={`text-[12px] font-bold ${color[index]}`}>
                                Participants Name
                              </div>
                              <div className={`text-[10px] -mt-[5px] mb-[6px] ${color[index]}`}>
                                Participants Team
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="absolute -top-3 -right-3 opacity-0 group-hover:opacity-100 bg-white text-black p-1 rounded-full shadow-lg pointer-events-none transition-opacity">
                          <Move size={12} />
                        </div>
                      </div>
                    </Draggable>
                    
                    {/* Overlay for clicking */}
                    <div 
                      onClick={() => handleImageClick(index)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer z-10"
                    >
                      <p className="text-white font-semibold flex items-center gap-2">
                        <UploadCloud size={24}/> Change Template
                      </p>
                    </div>

                    <input
                      type="file"
                      id={`fileInput${index}`}
                      hidden
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                    />
                  </div>

                  {/* Controls */}
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Palette size={16} /> Text Color
                      </label>
                      <button
                        type="button"
                        onClick={() => handleColorChange(index, color[index] === "text-white" ? "text-black" : "text-white")}
                        className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${
                          color[index] === "text-white" ? "bg-black text-white border-black hover:bg-gray-800" : "bg-white text-black border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {color[index] === "text-white" ? "White Text" : "Black Text"}
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 font-medium leading-relaxed">
                      <span className="flex items-start gap-2"><Move size={14} className="shrink-0 mt-0.5"/> Drag the dummy text block to position where results should appear on the poster.</span>
                    </div>
                    {files[index] && (
                      <p className="text-xs text-pink-600 font-semibold truncate bg-pink-50 p-2 rounded-lg">
                        New: {files[index].name}
                      </p>
                    )}
                  </div>

                </div>
              ))}
            </div>

            <div className="flex justify-end pt-10 border-t border-gray-100 mt-10">
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-4 px-12 rounded-xl font-bold text-lg transition-all shadow-lg shadow-gray-900/20 w-full md:w-auto hover:scale-[1.02]"
              >
                <CheckCircle2 size={24} /> Publish Templates
              </button>
            </div>
          </motion.div>
        </form>
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default ImageUpload;
