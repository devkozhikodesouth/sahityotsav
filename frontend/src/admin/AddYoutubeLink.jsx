import React, { useEffect, useState } from "react";
import {
  getYoutubeLink,
  addYoutubeLink,
  deleteYoutubeLink,
} from "../api/apiCall";
import Swal from "sweetalert2";
import toast, { Toaster } from "react-hot-toast";
import LiveUpload from "./LiveUpload";
import { motion } from "framer-motion";
import { Youtube, Trash2, Plus, PlayCircle, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AddYoutubeLink = () => {
  const navigate = useNavigate();
  const [link, setLink] = useState("");
  const [error, setError] = useState("");
  const [savedLink, setSavedLink] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await toast.promise(getYoutubeLink(), {
          loading: "Fetching videos...",
          success: "Videos loaded!",
          error: "Error fetching videos",
        });
        setSavedLink(response?.url || []);
      } catch (err) {
        console.error(err.message);
      }
    }

    fetchData();
  }, []);

  const handleDelete = (indexToDelete, id) => {
    Swal.fire({
      title: "Delete Video?",
      text: "This will permanently remove the video link from the gallery.",
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
    }).then((result) => {
      if (result.isConfirmed) {
        const updatedLinks = savedLink.filter((_, i) => i !== indexToDelete);

        async function fetchData() {
          try {
            const response = await toast.promise(deleteYoutubeLink(id), {
              loading: "Deleting video...",
              success: "Video deleted!",
              error: "Error deleting video",
            });

            if (response.success) {
              setSavedLink(updatedLinks);
            }
          } catch (err) {
            console.error(err.message);
          }
        }
        fetchData();
      }
    });
  };

  const isValidYoutubeUrl = (url) => {
    const pattern =
      /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;
    return pattern.test(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmed = link.trim();
    if (!isValidYoutubeUrl(trimmed)) {
      setError("Please enter a valid YouTube video link.");
      return;
    }

    try {
      const response = await toast.promise(addYoutubeLink({ url: trimmed }), {
        loading: "Saving video...",
        success: "YouTube link saved!",
        error: "Failed to save link",
      });

      if (response && response.url) {
        setSavedLink((prev) => [{ url: response.url }, ...prev]);
        setLink("");
        setError("");
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const inputClass = "w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-red-500/20 transition-colors outline-none focus:ring-4 bg-gray-50 text-gray-800";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans space-y-10 relative">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10 flex items-center justify-center"
      >
        <ArrowLeft size={24} className="text-gray-600" />
      </button>
      
      <div className="max-w-6xl mx-auto">
        <LiveUpload />
      </div>
      
      <div className="max-w-6xl mx-auto space-y-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 text-red-600 mb-4">
            <Youtube size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-heading">Video Gallery</h1>
          <p className="text-gray-500 mt-2 text-lg">Manage YouTube links and embedded videos.</p>
        </motion.div>

        {/* Add Video Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <LinkIcon size={20} />
                </div>
                <input
                  type="text"
                  className={`${inputClass} ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50" : ""}`}
                  placeholder="https://youtube.com/watch?v=..."
                  value={link}
                  onChange={(e) => {
                    setLink(e.target.value);
                    if (error) setError("");
                  }}
                />
              </div>
              {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
            </div>
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-8 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-red-600/20"
            >
              <Plus size={24} /> Add Video
            </button>
          </form>
        </motion.div>

        {/* Video Gallery Grid */}
        {savedLink && savedLink.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <PlayCircle size={24} className="text-red-500" />
              Published Videos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {savedLink.map((item, index) => {
                const match = item.url.match(
                  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
                );
                const videoId = match ? match[1] : null;
                const embedUrl = videoId
                  ? `https://www.youtube.com/embed/${videoId}`
                  : "";

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    key={index}
                    className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative transition-all hover:shadow-md"
                  >
                    <div className="aspect-video bg-gray-100 relative">
                      {embedUrl ? (
                        <iframe
                          className="w-full h-full"
                          src={embedUrl}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          title={`YouTube video ${index + 1}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <p className="text-sm font-medium">Invalid Video Link</p>
                        </div>
                      )}
                      
                      {/* Delete Overlay Button */}
                      <button
                        onClick={() => handleDelete(index, item._id)}
                        className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                        title="Delete Video"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    
                    <div className="p-4 bg-white">
                      <a
                        href={videoId ? `https://www.youtube.com/watch?v=${videoId}` : item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1"
                      >
                        <Youtube size={16} /> Watch on YouTube
                      </a>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
      <Toaster position="top-center" />
    </div>
  );
};

export default AddYoutubeLink;
