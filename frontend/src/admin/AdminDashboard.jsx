import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FaImage,
  FaClipboardList,
  FaUsers,
  FaListAlt,
  FaSignOutAlt,
  FaHome,
  FaImages,
  FaLayerGroup,
  FaRegNewspaper,
  FaVideo,
  FaEye,
  FaBuilding,
  FaCog,
  FaBullhorn,
} from "react-icons/fa";
import { MdOutlinePowerSettingsNew, MdDashboardCustomize } from "react-icons/md";
import { GrGallery } from "react-icons/gr";
import toast, { Toaster } from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";
import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getResultCount, changePassword, getEventConfig } from "../api/apiCall";

function AdminDashboard() {
  const navigate = useNavigate();
  const [viewCount, setViewCount] = useState(0);

  const { user, logout } = useContext(AuthContext);
  const [eventConfig, setEventConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters long.");
      return;
    }

    setChanging(true);
    try {
      const response = await changePassword(oldPassword, newPassword);
      if (response.success) {
        toast.success("Password changed successfully!");
        setIsChangePasswordOpen(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(response.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Change password submission error:", error);
      toast.error(error.response?.data?.message || "Failed to change password. Please verify current password.");
    } finally {
      setChanging(false);
    }
  };

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const configRes = await getEventConfig();
        if (configRes && configRes.success && configRes.data) {
          setEventConfig(configRes.data);
          const countRes = await getResultCount();
          if (countRes && countRes.success) {
            setViewCount(countRes.count);
          }
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setConfigLoading(false);
      }
    }
    loadDashboardData();
  }, [user]);

  const cards = [
    { title: "Add Image", icon: <FaImage />, color: "from-blue-400 to-blue-600", path: "/admin/addImage" },
    { title: "Add Result", icon: <FaClipboardList />, color: "from-emerald-400 to-emerald-600", path: "/admin/addresult" },
    { title: "Add Team", icon: <FaLayerGroup />, color: "from-indigo-400 to-indigo-600", path: "/admin/addteam" },
    { title: "Add Category", icon: <FaClipboardList />, color: "from-cyan-400 to-cyan-600", path: "/admin/addcategory" },
    { title: "Add Item", icon: <FaClipboardList />, color: "from-teal-400 to-teal-600", path: "/admin/additem" },
    { title: "Add Gallery", icon: <GrGallery />, color: "from-purple-400 to-purple-600", path: "/admin/addgallery" },
    { title: "All Results", icon: <FaListAlt />, color: "from-violet-400 to-violet-600", path: "/admin/allresult" },
    { title: "Add Team Point", icon: <FaUsers />, color: "from-amber-400 to-amber-600", path: "/admin/addteampoint" },
    { title: "Add Brochure", icon: <FaImages />, color: "from-rose-400 to-rose-600", path: "/admin/addbrochure" },
    { title: "Add News", icon: <FaRegNewspaper />, color: "from-fuchsia-400 to-fuchsia-600", path: "/admin/addnews" },
    { title: "Upload Ads", icon: <FaBullhorn />, color: "from-pink-500 to-rose-650", path: "/admin/upload-ads" },
    { title: "Add Videos", icon: <FaVideo />, color: "from-sky-400 to-sky-600", path: "/admin/addvideos" },
    { title: "Customize", icon: <MdDashboardCustomize />, color: "from-green-400 to-green-600", path: "/admin/featuretoggle" },
    { title: "Settings", icon: <FaCog />, color: "from-slate-500 to-slate-750", path: "/admin/settings" }
  ];

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of the admin panel.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, logout!",
      background: "#ffffff",
      customClass: {
        popup: "rounded-3xl",
        confirmButton: "rounded-xl",
        cancelButton: "rounded-xl"
      }
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        navigate("/admin/login");
      }
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  if (!user) return null;

  if (configLoading || !eventConfig) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-gray-400 text-sm">Resolving active portal settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col py-12 relative overflow-hidden px-4 md:px-8">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-900/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

      {/* Top Bar with Profile and Visitor Counter */}
      <div className="container max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-6 z-20">
        <div className="flex items-center gap-4 bg-gray-800/80 backdrop-blur border border-gray-700 px-6 py-3 rounded-2xl w-fit shadow-xl">
          <div className="bg-indigo-600 p-3 rounded-full text-white text-xl">
            <FaBuilding />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Event Scope</span>
            <span className="text-lg font-bold text-white block">
              {eventConfig ? eventConfig.name : "Loading scope..."}
            </span>
          </div>
        </div>

        {/* Counter */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gray-800/80 backdrop-blur border border-gray-700 px-6 py-3 rounded-2xl w-fit flex items-center gap-4 shadow-xl self-start md:self-auto"
        >
          <div className="bg-indigo-900/40 p-2.5 rounded-xl text-indigo-400 text-xl">
            <FaEye />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Result Views</span>
            <span className="text-xl font-bold text-white block">{viewCount.toLocaleString()}</span>
          </div>
        </motion.div>
      </div>

      {/* Main Container */}
      <div className="container max-w-6xl mx-auto relative z-10 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <span className="text-indigo-400 font-bold tracking-widest uppercase text-xs mb-2 block">
            Portal Control Center
          </span>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-2">
            Event Admin Dashboard
          </h2>
          <p className="text-gray-400 text-sm">Welcome, <span className="font-semibold text-gray-200">{user.username}</span>. Select a module to manage your portal.</p>
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-md inline-flex items-center gap-2"
          >
            🔒 Change Password
          </button>
        </motion.div>

        {/* Grid Cards */}
        {eventConfig?.externalApiEnabled && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-indigo-950/40 border border-indigo-900/40 p-6 rounded-3xl mb-8 shadow-lg space-y-4"
          >
            <div>
              <h3 className="text-lg font-bold text-indigo-300 flex items-center gap-2">
                🔌 Connected to External Results API
              </h3>
              <p className="text-xs text-gray-400 mt-1 max-w-2xl leading-relaxed">
                This event is configured to load results from an external API. Manual team, category, item, and result inputs are disabled. Results on the public portal will be pulled dynamically from the configured server below.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-indigo-900/40">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase">External API Base URL</span>
                <span className="text-xs text-gray-200 font-mono break-all">{eventConfig?.externalBaseUrl || "Not configured"}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase">External API Key</span>
                <span className="text-xs text-gray-200 font-mono break-all">
                  {eventConfig?.externalApiKey ? `${eventConfig.externalApiKey.slice(0, 8)}...${eventConfig.externalApiKey.slice(-8)}` : "Not configured"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase">External Team Points Limit</span>
                <span className="text-xs text-gray-200 font-mono">
                  {eventConfig?.teamPointsLimit !== undefined && eventConfig?.teamPointsLimit !== 0
                    ? `Top ${eventConfig.teamPointsLimit} teams`
                    : "No limit (All teams)"}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10"
        >
          {cards.filter(card => {
            if (eventConfig?.externalApiEnabled) {
              const pathsToHide = [
                "/admin/addresult",
                "/admin/addteam",
                "/admin/addcategory",
                "/admin/additem",
                "/admin/allresult",
                "/admin/addteampoint"
              ];
              return !pathsToHide.includes(card.path);
            }
            return true;
          }).map((card, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(card.path)}
              className="bg-gray-800 border border-gray-700/80 rounded-3xl p-6 flex flex-col items-center justify-center transition shadow-lg hover:shadow-2xl hover:border-gray-650 cursor-pointer group"
            >
              <div className={`w-14 h-14 mb-3.5 rounded-2xl bg-gradient-to-br ${card.color} text-white flex items-center justify-center text-2xl shadow-lg`}>
                {card.icon}
              </div>
              <h3 className="text-sm md:text-base font-bold text-gray-200 text-center tracking-tight group-hover:text-white transition">
                {card.title}
              </h3>
            </motion.div>
          ))}
        </motion.div>

        {/* Home, Start, and Logout Buttons */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className={`grid grid-cols-1 ${eventConfig?.externalApiEnabled ? "sm:grid-cols-2" : "sm:grid-cols-3"} gap-6 pt-8 border-t border-gray-800`}
        >
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="p-5 rounded-2xl shadow-lg bg-gray-800 border border-gray-700 text-gray-300 flex flex-col items-center justify-center hover:border-indigo-500 cursor-pointer group transition"
          >
            <div className="text-2xl mb-2 text-gray-500 group-hover:text-indigo-400 transition">
              <FaHome />
            </div>
            <h3 className="text-sm font-bold tracking-tight">Go to Public Site</h3>
          </motion.div>

          {!eventConfig?.externalApiEnabled && (
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/admin/start")}
              className="p-5 rounded-2xl shadow-lg bg-gray-800 border border-gray-700 text-gray-300 flex flex-col items-center justify-center hover:border-amber-500 cursor-pointer group transition"
            >
              <div className="text-2xl mb-2 text-gray-500 group-hover:text-amber-400 transition">
                <MdOutlinePowerSettingsNew />
              </div>
              <h3 className="text-sm font-bold tracking-tight">Program Control</h3>
            </motion.div>
          )}

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="p-5 rounded-2xl shadow-lg bg-gray-800 border border-gray-700 text-gray-300 flex flex-col items-center justify-center hover:border-red-500 cursor-pointer group transition"
          >
            <div className="text-2xl mb-2 text-gray-500 group-hover:text-red-400 transition">
              <FaSignOutAlt />
            </div>
            <h3 className="text-sm font-bold tracking-tight">Sign Out</h3>
          </motion.div>
        </motion.div>
      </div>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-800 border border-gray-700 w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl relative"
          >
            {/* Close Button */}
            <button
              onClick={() => {
                setIsChangePasswordOpen(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="absolute top-4 right-4 text-gray-450 hover:text-white transition text-lg"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              🔒 Update Admin Password
            </h3>

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="•••••••• (Min 6 chars)"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-450 block">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangePasswordOpen(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-650 border border-gray-600 rounded-xl text-xs font-bold uppercase tracking-wider text-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changing}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:opacity-50"
                >
                  {changing ? "Updating..." : "Save Password"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Toaster position="top-center" />
    </div>
  );
}

export default AdminDashboard;
