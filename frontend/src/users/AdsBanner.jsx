import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getAds } from "../api/apiCall";
import { ChevronLeft, ChevronRight, Link2 } from "lucide-react";

const AdsBanner = ({ className = "" }) => {
  const [ads, setAds] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await getAds();
        if (res.success && Array.isArray(res.data)) {
          setAds(res.data);
        }
      } catch (err) {
        console.error("Error fetching advertisements in guest view:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  // Automatic slideshow transition every 6 seconds
  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [ads]);

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  };

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);
  };

  if (loading || ads.length === 0) return null;

  const currentAd = ads[currentIndex];

  return (
    <div className={`w-full py-10 md:py-16 bg-background relative overflow-hidden paper-texture flex flex-col justify-center items-center ${className}`}>
      <div className="max-w-5xl w-full mx-4 px-4 relative group">
        
        {/* Slideshow Container */}
        <div className="manuscript-panel border-vintage p-2.5 shadow-vintage rounded-xl">
          <div className="relative aspect-[3/1] md:aspect-[4/1] w-full rounded-lg overflow-hidden bg-primary border border-accent/25 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.a
                key={currentAd._id}
                href={currentAd.link || "#"}
                target={currentAd.link ? "_blank" : "_self"}
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="block w-full h-full relative"
              >
                <img
                  src={currentAd.path}
                  alt={currentAd.title || "Advertisement"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* Subtle hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Banner Details Overlay on Hover */}
                {currentAd.title && (
                  <div className="absolute bottom-4 left-6 z-20 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <h4 className="font-heading font-bold text-base drop-shadow-md flex items-center gap-1.5 text-surface">
                      {currentAd.title}
                      {currentAd.link && <Link2 size={14} className="text-accent" />}
                    </h4>
                  </div>
                )}
              </motion.a>
            </AnimatePresence>

            {/* Ad Badge */}
            {/* <div className="absolute top-4 right-4 bg-secondary/80 backdrop-blur-sm text-accent text-[8px] uppercase font-heading font-bold tracking-widest px-2.5 py-0.5 rounded border border-accent/30 select-none z-20">
              AD
            </div> */}

            {/* Slider controls (only show if multiple ads exist) */}
            {ads.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute top-1/2 -translate-y-1/2 left-4 z-30 flex items-center justify-center h-10 w-10 rounded-lg bg-secondary/70 hover:bg-secondary text-accent transition-all border border-accent/30 opacity-0 group-hover:opacity-100 animate-fade-in"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 -translate-y-1/2 right-4 z-30 flex items-center justify-center h-10 w-10 rounded-lg bg-secondary/70 hover:bg-secondary text-accent transition-all border border-accent/30 opacity-0 group-hover:opacity-100 animate-fade-in"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Indicators (only show if multiple ads exist) */}
        {ads.length > 1 && (
          <div className="flex justify-center space-x-2 mt-4">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex ? "w-6 bg-primary" : "w-2 bg-accent/40 hover:bg-accent/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsBanner;
