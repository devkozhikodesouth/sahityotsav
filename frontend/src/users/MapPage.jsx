import React, { useEffect } from "react";
import UnderFooter from '../components/Footer';
import { motion } from "framer-motion";
import { Map as MapIcon } from "lucide-react";
import { getSettings, getFullEventTitle } from "../api/apiCall";

function MapPage() {
  useEffect(() => {
    async function fetchSettingsAndTitle() {
      try {
        const settingsRes = await getSettings();
        if (settingsRes?.success && settingsRes?.settings) {
          document.title = `Route Map - ${getFullEventTitle(settingsRes.settings)}`;
        }
      } catch (err) {
        console.error("Failed to fetch settings for title:", err.message);
      }
    }
    fetchSettingsAndTitle();
  }, []);
  return (
    <>
      <div className=" bg-gray-50 pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="text-primary font-semibold tracking-wider uppercase text-sm mb-2 flex items-center justify-center gap-2">
              <MapIcon className="w-4 h-4" /> Directions
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-gray-900 mb-4">
              Route <span className="text-gradient">Map</span>
            </h1>
            <p className="text-gray-500 max-w-xl mx-auto">Find your way to the Sahityotsav venue.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-4xl mx-auto glass p-4 md:p-6 rounded-[2.5rem] shadow-glass border-white/40"
          >
            <div className="w-full rounded-[2rem] overflow-hidden shadow-inner relative bg-white">
              <img
                src="/Routmap.jpg"
                alt="Route Map"
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
      
      <div className="relative z-50">
        <UnderFooter />
      </div>
    </>
  );
}

export default MapPage;
