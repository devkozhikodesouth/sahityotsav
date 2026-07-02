import React, { useRef, useState } from "react";
import { addtonews } from "../api/apiCall";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { UploadCloud, Image as ImageIcon, CheckCircle2, Newspaper } from "lucide-react";

const NewsUploader = ({ setNewsList }) => {
  const fileInputRef = useRef();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
    if (!selectedImage || !title.trim() || !description.trim()) {
      toast.error("All fields are required!");
      return;
    }

    setIsUploading(true);
    toast.loading("Publishing news article...");
    
    const formData = new FormData();
    formData.append("image", selectedImage);
    formData.append("title", title);
    formData.append("description", description);

    try {
      const res = await addtonews(formData);
      toast.dismiss();
      if (res?.data) {
        toast.success("News uploaded successfully ✅");
        setNewsList((prev) => [res.data, ...prev]);

        // Reset state
        setSelectedImage(null);
        setPreviewUrl(null);
        setTitle("");
        setDescription("");
        if (fileInputRef.current) fileInputRef.current.value = null;
      }
    } catch (err) {
      console.error("Upload failed:", err);
      toast.dismiss();
      toast.error("Failed to upload news ❌");
    } finally {
      setIsUploading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-colors outline-none focus:ring-4 bg-gray-50 text-gray-800 font-medium";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 max-w-6xl mx-auto"
    >
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Image Upload Section */}
        <div className="w-full lg:w-1/3 flex flex-col space-y-4">
          <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">Cover Image</label>
          <div
            onClick={handleImageClick}
            className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-300 hover:border-indigo-500 bg-gray-50 hover:bg-indigo-50/50 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group"
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
              <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-indigo-500 transition-colors">
                <ImageIcon size={48} className="mb-3 opacity-50" />
                <p className="font-medium text-sm">Click to upload cover</p>
                <p className="text-xs mt-1 opacity-75">PNG, JPG up to 5MB</p>
              </div>
            )}
          </div>
          {selectedImage && (
            <p className="text-sm text-gray-500 font-medium text-center truncate px-4">
              {selectedImage.name}
            </p>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Form Section */}
        <div className="w-full lg:w-2/3 flex flex-col gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Headline</label>
            <input
              type="text"
              placeholder="Enter an attention-grabbing headline..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex-1 flex flex-col">
            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Article Body</label>
            <textarea
              placeholder="Write the full news description here..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`${inputClass} flex-1 min-h-[160px] resize-y`}
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 px-10 rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-600/20 ${
                isUploading ? "opacity-70 cursor-not-allowed scale-95" : "hover:scale-[1.02]"
              }`}
            >
              {isUploading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><CheckCircle2 size={24} /> Publish Article</>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NewsUploader;
