import React, { useEffect, useState } from "react";
import UnderFooter from "../components/Footer";
import { getNews, deleteNews } from "../api/apiCall";
import NewsUploader from "./NewsUploader";
import { Trash2, Newspaper, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const NewsAdd = () => {
  const [newsList, setNewsList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await getNews();
        if (res?.data) {
          setNewsList(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch news:", err.message);
      }
    }

    fetchNews();
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Delete Article?",
      text: "This will permanently remove the news article.",
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
          toast.loading("Deleting article...");
          await deleteNews(id);
          setNewsList((prev) => prev.filter((item) => item._id !== id));
          toast.dismiss();
          toast.success("Article deleted!");
        } catch (err) {
          console.error("Delete failed:", err.message);
          toast.dismiss();
          toast.error("Failed to delete news ❌");
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
      <div className="py-10 px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-6xl mx-auto"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-600 mb-4">
            <Newspaper size={32} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 font-heading">Manage News Updates</h1>
          <p className="text-gray-500 mt-2 text-lg">Publish announcements, press releases, and articles.</p>
        </motion.div>

        {/* Uploader */}
        <NewsUploader setNewsList={setNewsList} />

        {/* News List */}
        {newsList.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-6xl mx-auto space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 px-2 flex items-center gap-2">
              Published Articles <span className="text-gray-400 font-medium text-lg">({newsList.length})</span>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsList.map((item, index) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  key={item._id || index}
                  className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all relative flex flex-col"
                >
                  <Link to={`/news/${item._id}/admin`} className="flex flex-col flex-1">
                    <div className="w-full h-48 overflow-hidden bg-gray-100 relative">
                      {item?.image?.path ? (
                        <img
                          src={item?.image?.path}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Newspaper size={48} className="opacity-20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">{item.title}</h2>
                      <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed flex-1">
                        {item.description}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(item._id);
                    }}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                    title="Delete Article"
                  >
                    <Trash2 size={18} />
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      <UnderFooter />
    </div>
  );
};

export default NewsAdd;
