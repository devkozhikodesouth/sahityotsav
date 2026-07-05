import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaVideo,
  FaTrophy,
  FaInfoCircle,
  FaImages,
  FaChartBar,
  FaMapMarkedAlt,
  FaCompass,
  FaAward,
  FaCalendarAlt,
  FaUserGraduate
} from "react-icons/fa";
import { MdLiveTv, MdClose } from "react-icons/md";
import { TiThMenu } from "react-icons/ti";
import UserSide from "./UserSide";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getFeatures } from "../api/apiCall";

export default function RightSidebarLayout({ festival }) {
  const [isOpen, setIsOpen] = useState(false);
  const [features, setFeatures] = useState([]);
  const navigate = useNavigate();

  // Fetch features from API
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const result = await getFeatures();
        setFeatures(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching features in sidebar:", error);
      }
    };
    fetchFeatures();
  }, []);

  // Prevent scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const navLinks = [
    { name: "Home", icon: <FaHome />, href: "#home" },
    { name: "Live", icon: <MdLiveTv />, href: "#live", featureKey: "live" },
    { name: "Videos", icon: <FaVideo />, href: "#videos", featureKey: "videos" },
    { name: "Schedule", icon: <FaCalendarAlt />, href: "#schedule", featureKey: "schedule" },
    { name: "Results", icon: <FaTrophy />, href: "#results", featureKey: "results" },
    { name: "Total Point", icon: <FaChartBar />, href: "#total-point", featureKey: "teamPoints" },
    { name: "Gallery", icon: <FaImages />, href: "#gallery", featureKey: "gallery" },
    { name: "Map", icon: <FaMapMarkedAlt />, path: "/map", featureKey: "map" },
    { name: "About", icon: <FaInfoCircle />, path: "/about", featureKey: "theme" },
    { name: "Participant Login", icon: <FaUserGraduate />, path: "/student" },
  ];

  const isFeatureEnabled = (key) => {
    if (!key) return true;
    return features.some((feature) => feature.name === key && feature.enabled);
  };

  const filteredLinks = navLinks.filter(link => isFeatureEnabled(link.featureKey));

  const handleNavClick = (link) => {
    setIsOpen(false);
    if (link.path) {
      navigate(link.path);
    } else {
      const element = document.getElementById(link.href?.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="relative min-h-screen font-serif overflow-x-hidden">
      {/* Main content */}
      <div className="max-w-full mx-auto">
        <UserSide festival={festival} onOpenMenu={() => setIsOpen(true)} />
      </div>

      {/* Sidebar overlay using AnimatePresence */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[60] bg-secondary/40 backdrop-blur-sm"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 h-full w-80 bg-surface border-l-4 border-double border-accent shadow-2xl z-[70] flex flex-col paper-texture"
            >
              {/* Header Panel */}
              <div className="p-8 bg-primary text-white flex justify-between items-center relative border-b border-accent/30">
                <div className="absolute top-2 left-2 right-2 bottom-2 border border-accent/20 pointer-events-none"></div>
                <h2 className="text-2xl font-heading text-white font-bold tracking-wider uppercase">Menu</h2>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-accent/10 border border-accent/30 text-accent hover:text-white hover:bg-accent/30 rounded-full transition-all backdrop-blur-md relative z-10"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>
              
              {/* Scroll items */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {filteredLinks.map((link, idx) => (
                  <motion.button
                    key={link.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 + 0.1 }}
                    onClick={() => handleNavClick(link)}
                    className="w-full flex items-center gap-5 p-4 rounded-xl text-secondary hover:bg-primary/5 hover:text-primary transition-all font-heading font-semibold tracking-wide border border-transparent hover:border-accent/30 group"
                  >
                    <span className="text-xl text-accent group-hover:scale-110 transition-transform duration-300">
                      {link.icon}
                    </span>
                    <span className="text-base uppercase">{link.name}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
