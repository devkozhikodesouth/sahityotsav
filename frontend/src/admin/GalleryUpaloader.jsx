import React, { useRef, useState } from "react";
import { addToGallery } from "../api/apiCall";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Image as ImageIcon, CheckCircle2, X, AlertCircle } from "lucide-react";

const GalleryUpaloader = ({ images, setImages }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const processFiles = (files) => {
    const validFiles = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(`"${file.name}" is not a valid format. Only JPG, PNG, WEBP are allowed.`, { id: `type-err-${file.name}` });
        continue;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        toast.error(`"${file.name}" exceeds the 10MB limit.`, { id: `size-err-${file.name}` });
        continue;
      }

      // Avoid duplicates in the selection queue
      if (selectedFiles.some(f => f.file.name === file.name && f.file.size === file.size)) {
        continue;
      }

      validFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
      toast.success(`Added ${validFiles.length} file(s) to upload queue.`);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleRemoveFile = (idToRemove) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find(f => f.id === idToRemove);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      return prev.filter(f => f.id !== idToRemove);
    });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select or drop images first!");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    const toastId = toast.loading("Uploading images...");

    const formData = new FormData();
    // Append each file to the array field 'images[]'
    selectedFiles.forEach((f) => {
      formData.append("images[]", f.file);
    });

    try {
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        }
      };

      const res = await addToGallery(formData, config);
      toast.dismiss(toastId);

      if (res && res.success) {
        if (res.uploaded && res.uploaded.length > 0) {
          const newImages = res.uploaded.map(item => ({
            _id: item.id,
            path: item.url,
            publicId: item.publicId
          }));
          setImages((prev) => [...newImages, ...prev]);
        }

        const successCount = res.uploaded ? res.uploaded.length : 0;
        const failedCount = res.failed ? res.failed.length : 0;

        if (successCount > 0) {
          toast.success(`Successfully uploaded ${successCount} image(s)! 🎉`);
        }
        if (failedCount > 0) {
          res.failed.forEach((f) => {
            toast.error(`Failed to upload ${f.file}: ${f.reason}`, { duration: 6000 });
          });
        }

        // Clean up previews and reset selected files
        selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = null;
      } else {
        throw new Error(res.message || "Failed to upload files.");
      }
    } catch (error) {
      console.error("Upload error:", error.message);
      toast.dismiss(toastId);
      toast.error("Failed to upload images ❌");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 max-w-4xl mx-auto mt-10"
    >
      <div className="space-y-8">
        
        {/* Header Title inside Uploader */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/10 text-blue-600">
            <ImageIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-heading">Bulk Image Uploader</h2>
            <p className="text-gray-500 text-sm">
              Upload multiple images to the public gallery at once.
            </p>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={handleImageClick}
          className={`w-full py-12 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center relative group min-h-[220px] ${
            isDragActive 
              ? "border-blue-500 bg-blue-50/50" 
              : "border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50/20"
          }`}
        >
          <div className="flex flex-col items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors p-4 text-center">
            <UploadCloud size={56} className={`mb-4 transition-transform duration-300 ${isDragActive ? "scale-110 text-blue-500" : "opacity-60"}`} />
            <p className="font-semibold text-lg text-gray-700 mb-1">
              Drag & drop photos here, or <span className="text-blue-600 hover:underline">browse</span>
            </p>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              Supports JPG, JPEG, PNG, and WEBP. Maximum 10MB per file.
            </p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            multiple
            className="hidden"
          />
        </div>

        {/* Previews section */}
        <AnimatePresence>
          {selectedFiles.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                  Selected Images ({selectedFiles.length})
                </h3>
                <button 
                  onClick={() => {
                    selectedFiles.forEach(f => URL.revokeObjectURL(f.previewUrl));
                    setSelectedFiles([]);
                  }}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {selectedFiles.map((fileObj) => (
                  <motion.div
                    key={fileObj.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm"
                  >
                    <img
                      src={fileObj.previewUrl}
                      alt={fileObj.file.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-1 right-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFile(fileObj.id);
                        }}
                        className="bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition-colors"
                        title="Remove Image"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {/* Tooltip for file name */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 px-2 py-1 text-[10px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {fileObj.file.name}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Bar & Actions */}
        {selectedFiles.length > 0 && (
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-4">
            
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-gray-500 uppercase">
                  <span>Uploading to Cloudinary</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <motion.div 
                    className="bg-blue-600 h-full rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${uploadProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                  isUploading
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20 hover:scale-[1.01]"
                }`}
              >
                {isUploading ? (
                  <>
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Uploading {selectedFiles.length} file(s)...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={24} />
                    <span>Upload {selectedFiles.length} Photo(s) to Gallery</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default GalleryUpaloader;
