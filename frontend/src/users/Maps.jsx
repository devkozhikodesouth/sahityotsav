import React from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

function Maps({ festival }) {
  const mapLink = festival?.settings?.mapLink || "https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3911.563552654755!2d75.86181397505054!3d11.366555588820399!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMTHCsDIxJzU5LjYiTiA3NcKwNTEnNTEuOCJF!5e0!3m2!1sen!2sin!4v1753490288065!5m2!1sen!2sin";
  return (
    <section id="map" className="w-full py-24 bg-background relative overflow-hidden paper-texture border-t border-accent/15">
      {/* Decorative Ornaments */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-accent font-heading font-semibold tracking-widest uppercase text-xs mb-2 flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" /> Location
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-primary mb-3">
            Event <span className="text-gradient">Venue</span>
          </h2>
          <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="manuscript-panel border-vintage p-4 md:p-6 shadow-vintage rounded-xl"
        >
          <div className="w-full h-[400px] md:h-[500px] rounded-lg overflow-hidden border border-accent/30 shadow-inner relative bg-surface">
            <div className="absolute inset-0 bg-primary/5 pointer-events-none z-10 rounded-lg"></div>
            <iframe
              src={mapLink}
              className="w-full h-full border-0 grayscale-[10%] contrast-110"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Festival Location"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Maps;
