import React, { useEffect, useState } from "react";
import { get3fromGallery } from "../api/apiCall";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

function Gallery({ bgColor }) {
  const [images, setImages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await get3fromGallery();
        if (res && res.data) {
          setImages(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch gallery:", err.message);
      }
    }
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <section id="gallery" className="w-full pt-8 pb-8 md:pt-10 md:pb-10 bg-background relative overflow-hidden paper-texture" style={{ backgroundColor: bgColor || "#FDFBF7" }}>
      {/* Decorative Ornaments */}
      <div className="hidden md:block absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="hidden md:block absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="hidden md:block absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="hidden md:block absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent font-heading font-semibold tracking-widest uppercase text-xs mb-2 flex items-center justify-center gap-2">
            <ImageIcon className="w-4 h-4" /> Highlights
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-primary mb-3">
            Event <span className="text-gradient">Gallery</span>
          </h2>
          <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
          <p className="text-secondary/80 max-w-xl mx-auto font-serif italic text-sm md:text-base">
            Glimpses of the beautiful moments from our events.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-12"
        >
          {images && images.map((src, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="relative aspect-[4/3] p-3 bg-surface border border-accent/30 rounded-xl shadow-md group cursor-pointer"
            >
              <div className="absolute inset-3 bg-primary-dark/20 group-hover:bg-transparent transition-colors z-10 duration-500 rounded-lg"></div>
              <img
                src={src.path}
                alt={`Gallery Highlight ${index + 1}`}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out rounded-lg border border-accent/15"
              />
            </motion.div>
          ))}
          {/* Skeleton loading state if no images yet */}
          {images.length === 0 && [1, 2, 3].map(i => (
            <div key={`skel-${i}`} className="aspect-[4/3] rounded-xl bg-surface border border-accent/20 animate-pulse"></div>
          ))}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <button
            onClick={() => navigate("/gallerypage")}
            className="group flex items-center gap-3 px-8 py-4 bg-primary text-surface rounded-xl font-heading font-bold border border-accent/40 shadow-md hover:bg-primary-light transition-all"
          >
            <span>View Full Gallery</span>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-colors">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-surface" />
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default Gallery;
