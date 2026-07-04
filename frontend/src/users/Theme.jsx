import React, { useState, useEffect } from "react";
import { getBrochure, getDescription } from "../api/apiCall";
import { motion } from "framer-motion";
import { Quote, BookOpen } from "lucide-react";

function Theme({ bgColor }) {
  const [description, setDescription] = useState("");
  const [brochure, setBrochure] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getDescription();
        setDescription(response?.data || "");
      } catch (error) {
        console.error("Failed to fetch theme description", error);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getBrochure();
        setBrochure(response?.data || []);
      } catch (error) {
        console.error("Failed to fetch brochure", error);
      }
    }
    fetchData();
  }, []);

  if (!description && (!brochure || Object.keys(brochure).length === 0)) {
    return null; // Hide section if no data
  }

  const validBrochures = Object.values(brochure || {}).filter(img => img?.path);

  return (
    <section id="about" className="w-full pt-8 pb-8 md:pt-10 md:pb-10 bg-background relative overflow-hidden paper-texture" style={{ backgroundColor: bgColor || "#FDFBF7" }}>
      {/* Decorative Ornaments */}
      <div className="hidden md:block absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="hidden md:block absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="hidden md:block absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="hidden md:block absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        {/* Theme Description */}
        {description && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto mb-24 text-center"
          >
            <span className="text-accent font-heading font-semibold tracking-widest uppercase text-xs mb-2 flex items-center justify-center gap-2">
              <Quote className="w-4 h-4" /> The Concept
            </span>
            <h2 className="text-4xl md:text-5xl font-heading font-black text-primary mb-3">
              Festival <span className="text-gradient">Theme</span>
            </h2>
            <div className="divider-vintage-ornamental max-w-xs mx-auto mb-10"></div>
            
            <div className="manuscript-panel border-vintage p-8 md:p-12 shadow-vintage relative">
              <Quote className="absolute top-6 left-6 text-accent/15 w-16 h-16 transform -scale-x-100" />
              <p className="text-lg md:text-xl text-secondary leading-relaxed font-serif relative z-10 text-justify">
                {description}
              </p>
              <Quote className="absolute bottom-6 right-6 text-accent/15 w-16 h-16" />
            </div>
          </motion.div>
        )}

        {/* Brochure Section */}
        {validBrochures.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-10 border-t border-accent/15"
          >
            <div className="text-center mb-12">
              <span className="text-accent font-heading font-semibold tracking-widest uppercase text-xs mb-2 flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" /> Downloadable
              </span>
              <h3 className="text-3xl font-heading font-black text-primary">
                Official Brochure
              </h3>
              <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {validBrochures.map((imgObj, index) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.15 }}
                  viewport={{ once: true }}
                  key={index} 
                  className="group relative rounded-xl overflow-hidden shadow-md border border-accent/30 aspect-[3/4] p-2.5 bg-surface hover:shadow-xl hover:scale-101 transition-all"
                >
                  <img
                    src={imgObj.path}
                    alt={`Brochure Page ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border border-accent/15 transform group-hover:scale-103 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-2.5 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default Theme;
