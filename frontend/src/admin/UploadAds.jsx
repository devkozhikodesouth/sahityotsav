import React, { useEffect, useState } from "react";
import { getAds, uploadAd, deleteAd } from "../api/apiCall";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, UploadCloud, Trash2, Link as LinkIcon, Image as ImageIcon, Sparkles, Plus, CheckCircle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

function UploadAds() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [ads, setAds] = useState([]);

  // Form states
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchAdsData = async () => {
    try {
      setLoading(true);
      const res = await getAds();
      if (res.success && res.data) {
        setAds(res.data);
      }
    } catch (err) {
      console.error("Failed to load advertisements", err);
      toast.error("Failed to load advertisements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdsData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please select an ad image to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("title", title);
    formData.append("link", link);

    try {
      const res = await uploadAd(formData);
      if (res.success) {
        toast.success("Advertisement uploaded successfully! 🚀");
        setTitle("");
        setLink("");
        setImageFile(null);
        setImagePreview("");
        fetchAdsData(); // Refresh list
      } else {
        toast.error(res.message || "Failed to upload advertisement");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save advertisement. ❌");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this advertisement?")) return;

    try {
      const res = await deleteAd(id);
      if (res.success) {
        toast.success("Advertisement deleted successfully!");
        fetchAdsData(); // Refresh list
      } else {
        toast.error(res.message || "Failed to delete advertisement");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete advertisement. ❌");
    }
  };

  if (loading && ads.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
        <p className="text-gray-400 font-semibold animate-pulse">Loading advertisements...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col py-12 relative overflow-hidden px-4 md:px-8">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-pink-900/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full shadow-lg border border-gray-700 transition z-20 flex items-center justify-center"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="container max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-10 mt-6 md:mt-0">
          <span className="text-pink-400 font-bold tracking-widest uppercase text-xs mb-2 block flex items-center justify-center gap-1.5">
            <Sparkles size={14} className="text-pink-400" /> Promotion Portal
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
            Manage Advertisements
          </h2>
          <p className="text-gray-400 text-sm">
            Upload banner ads to display dynamically across the main public site layout.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form Column */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 shadow-xl space-y-5">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Plus size={20} className="text-pink-500" /> Upload New Ad
              </h3>

              {/* Aspect Ratio Note */}
              <div className="bg-pink-950/35 border border-pink-900/50 p-4 rounded-2xl text-xs space-y-2 text-pink-300">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info size={14} className="text-pink-400 shrink-0" /> Note on Dimensions
                </div>
                <p className="leading-relaxed">
                  Ads render as wide page-break banners. To ensure high clarity, we recommend:
                </p>
                <ul className="list-disc pl-4 space-y-1 font-semibold">
                  <li><strong>3:1 Aspect Ratio</strong> (e.g. 1200x400) - Preferred</li>
                  <li><strong>16:9 Aspect Ratio</strong> (e.g. 1200x675) - Supported</li>
                </ul>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                {/* File Upload Box */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                    Ad Banner Image
                  </label>
                  <div
                    onClick={() => document.getElementById("adImageInput").click()}
                    className="w-full aspect-[16/9] rounded-2xl border-2 border-dashed border-gray-600 hover:border-pink-500 bg-gray-900 hover:bg-gray-700/35 transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group"
                  >
                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Ad Preview"
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white font-semibold text-xs flex items-center gap-1.5">
                            <UploadCloud size={16} /> Change Image
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500 group-hover:text-pink-400 transition-colors p-4">
                        <ImageIcon size={32} className="mb-2 opacity-55" />
                        <p className="font-semibold text-xs text-center">Click to upload ad banner</p>
                        <p className="text-[10px] text-gray-500 mt-1">Recommended: 1200x400 (3:1)</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="adImageInput"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Title Input */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                    Ad Title / Alt Text
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Blackberry Sponsor Ad"
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition text-sm"
                  />
                </div>

                {/* Target URL */}
                <div>
                  <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-1.5">
                    Click-through Link (URL)
                  </label>
                  <input
                    type="url"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="e.g. https://blackberry.com"
                    className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 transition text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                    uploading
                      ? "bg-pink-800 text-gray-300 cursor-not-allowed"
                      : "bg-pink-600 hover:bg-pink-700 text-white shadow-pink-600/30 hover:scale-[1.02]"
                  }`}
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud size={18} /> Upload Advertisement
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Ad List Grid Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 border border-gray-700 rounded-3xl p-6 md:p-8 shadow-xl">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ImageIcon size={20} className="text-pink-500" /> Active Banners ({ads.length})
              </h3>

              {ads.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                  <ImageIcon size={48} className="text-gray-600 animate-bounce" />
                  <p className="text-gray-400 font-medium text-sm">No advertisements uploaded yet.</p>
                  <p className="text-gray-500 text-xs max-w-sm leading-relaxed">
                    Upload an ad on the left panel. Don't forget to enable the "ads" option in the Feature Control Panel.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {ads.map((ad) => (
                    <div
                      key={ad._id}
                      className="bg-gray-900 border border-gray-700/80 rounded-2xl overflow-hidden group shadow-md hover:border-pink-500/50 transition-all flex flex-col"
                    >
                      {/* Image Thumbnail */}
                      <div className="w-full aspect-[3/1] bg-black relative overflow-hidden">
                        <img
                          src={ad.path}
                          alt={ad.title || "Ad"}
                          className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider text-pink-400 font-bold border border-pink-900/50">
                          Active
                        </div>
                      </div>

                      {/* Details */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <h4 className="font-bold text-sm text-gray-200 line-clamp-1">
                            {ad.title || "Untitled Advertisement"}
                          </h4>
                          {ad.link ? (
                            <a
                              href={ad.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-pink-400 text-xs flex items-center gap-1 hover:underline mt-1 break-all"
                            >
                              <LinkIcon size={12} className="shrink-0" /> {ad.link}
                            </a>
                          ) : (
                            <p className="text-gray-500 text-xs italic mt-1">No click-through link</p>
                          )}
                        </div>

                        <div className="flex justify-end pt-2 border-t border-gray-800">
                          <button
                            onClick={() => handleDelete(ad._id)}
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-right" />
    </div>
  );
}

export default UploadAds;
