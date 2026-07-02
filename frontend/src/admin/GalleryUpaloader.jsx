import React, { useRef, useState } from "react";
import { addToGallery } from "../api/apiCall";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { UploadCloud, Image as ImageIcon, CheckCircle2 } from "lucide-react";

const GalleryUpaloader = ({ images, setImages }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef();

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first!");
      return;
    }

    setIsUploading(true);
    toast.loading("Uploading to gallery...");
    const formData = new FormData();
    formData.append("image", selectedImage);
    
    try {
      const res = await addToGallery(formData);
      toast.dismiss();
      if (res && res.data) {
        setImages((prev) => [res.data, ...prev]);
        toast.success("Image uploaded successfully! ✅");
        setSelectedImage(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
      } else {
        throw new Error("Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error.message);
      toast.dismiss();
      toast.error("Failed to upload image ❌");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto mt-10"
    >
      <div className="flex flex-col md:flex-row gap-8 items-center">
        
        {/* Upload Area */}
        <div className="w-full md:w-1/2">
          <div
            onClick={handleImageClick}
            className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50/50 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group"
          >
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Selected"
                  className="object-cover w-full h-full"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white font-semibold flex items-center gap-2"><UploadCloud size={20}/> Change Image</p>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                <ImageIcon size={48} className="mb-3 opacity-50" />
                <p className="font-medium text-sm">Click to upload photo</p>
                <p className="text-xs mt-1 opacity-75">High-res JPG or PNG</p>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Info & Action */}
        <div className="w-full md:w-1/2 flex flex-col items-start gap-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 text-blue-600 mb-2">
            <ImageIcon size={24} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 font-heading">Add New Photo</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-4">
            Upload high-quality images from the festival to showcase in the public gallery. Images will be automatically resized and optimized.
          </p>
          
          {selectedImage && (
            <div className="bg-gray-100 px-4 py-2 rounded-lg w-full truncate border border-gray-200">
              <span className="text-sm font-semibold text-gray-700">Selected: </span>
              <span className="text-sm text-gray-500 truncate">{selectedImage.name}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={isUploading || !selectedImage}
            className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-lg mt-auto ${
              isUploading || !selectedImage
                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 hover:scale-[1.02]"
            }`}
          >
            {isUploading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><CheckCircle2 size={24} /> Upload to Gallery</>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GalleryUpaloader;
