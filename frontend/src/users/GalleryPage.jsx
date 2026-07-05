import React, { useEffect, useState } from 'react';
import UnderFooter from '../components/Footer';
import { getGallery, getSettings, getFullEventTitle } from '../api/apiCall';
import { motion } from 'framer-motion';
import { Image as ImageIcon } from 'lucide-react';

function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettingsAndTitle() {
      try {
        const settingsRes = await getSettings();
        if (settingsRes?.success && settingsRes?.settings) {
          document.title = `Gallery - ${getFullEventTitle(settingsRes.settings)}`;
        }
      } catch (err) {
        console.error("Failed to fetch settings for title:", err.message);
      }
    }
    fetchSettingsAndTitle();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await getGallery();
        if (res && res.data) {
          setImages(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch gallery:", err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <>
      <div className="min-h-screen bg-background pt-24 pb-32 paper-texture">
        {/* Decorative Ornaments */}
        <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
        <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-8">
          
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <span className="text-accent font-heading font-semibold tracking-widest uppercase text-xs mb-2 flex items-center justify-center gap-2">
              <ImageIcon className="w-4 h-4" /> Collection
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-primary mb-3">
              Full <span className="text-gradient">Gallery</span>
            </h1>
            <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
            <p className="text-secondary/80 max-w-xl mx-auto font-serif italic text-sm md:text-base">Explore all the captured moments from our event.</p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="aspect-[4/3] bg-surface border border-accent/20 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : images.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            >
              {images.map((src, index) => (
                <motion.div 
                  key={index} 
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="group relative rounded-xl p-2 bg-surface border border-accent/30 shadow-md aspect-[4/3] cursor-pointer"
                >
                  <img
                    src={src.path}
                    alt={`Gallery item ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-accent/15 transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  <div className="absolute inset-2 bg-primary-dark/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20 text-secondary/60">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-accent/40" />
              <p className="text-xl font-heading font-semibold text-primary">No images uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="relative z-50">
        <UnderFooter />
      </div>
    </>
  );
}

export default Gallery;
