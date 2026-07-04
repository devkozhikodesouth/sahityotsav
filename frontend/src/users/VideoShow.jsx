import React, { useEffect, useState, useRef } from "react";
import { get3YoutubeLink } from "../api/apiCall";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PlayCircle, Maximize2, ArrowRight } from "lucide-react";

function VideoShow() {
  const [savedLink, setSavedLink] = useState([]);
  const iframeRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await get3YoutubeLink();
        setSavedLink(response?.url || []);
      } catch (err) {
        console.error("Error fetching video links:", err.message);
      }
    }
    fetchData();
  }, []);

  const requestFullScreen = (iframe) => {
    const requestMethod =
      iframe.requestFullscreen ||
      iframe.webkitRequestFullscreen ||
      iframe.mozRequestFullScreen ||
      iframe.msRequestFullscreen;

    if (requestMethod) {
      requestMethod.call(iframe);
    }
  };

  const handlePlay = (index) => {
    const iframe = iframeRefs.current[index];
    if (!iframe) return;

    iframe.contentWindow.postMessage(
      JSON.stringify({
        event: "command",
        func: "playVideo",
        args: [],
      }),
      "*"
    );

    requestFullScreen(iframe);
  };

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
    <section id="videos" className="w-full py-24 bg-background relative overflow-hidden paper-texture">
      {/* Decorative Ornaments */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent font-heading font-semibold tracking-widest uppercase text-xs mb-2 flex items-center justify-center gap-2">
            <PlayCircle className="w-4 h-4" /> Watch Now
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-primary ">
            Featured <span className="text-gradient">Videos</span>
          </h2>
          <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
       
        </motion.div>

        {savedLink.length > 0 && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-nowrap overflow-x-auto gap-6 mb-12 pb-4 scrollbar-none snap-x snap-mandatory md:flex-wrap md:justify-center md:gap-8"
          >
            {savedLink.map((link, index) => {
              const match = link.url.match(
                /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
              );
              const videoId = match ? match[1] : null;
              const embedUrl = videoId
                ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&modestbranding=1&rel=0`
                : "";

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ y: -10 }}
                  className="w-[75%] sm:w-[50%] md:w-[45%] lg:w-[30%] max-w-[280px] md:max-w-sm flex-shrink-0 snap-center rounded-xl overflow-hidden shadow-md border border-accent/30 bg-surface p-3 group"
                >
                  {embedUrl ? (
                    <div className="relative pt-[177.78%] bg-primary-dark rounded-lg overflow-hidden group-hover:shadow-lg transition-shadow border border-accent/15">
                      <iframe
                        ref={(el) => (iframeRefs.current[index] = el)}
                        className="absolute top-0 left-0 w-full h-full"
                        src={embedUrl}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        allowFullScreen
                        title={`YouTube video ${index + 1}`}
                      />
                      <button
                        onClick={() => handlePlay(index)}
                        className="absolute bottom-4 right-4 flex items-center gap-2 bg-primary/95 hover:bg-primary text-surface px-4 py-2 rounded-lg text-xs border border-accent/30 transition-all shadow-md hover:scale-105"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-accent" /> Fullscreen
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full min-h-[300px] bg-surface p-8 text-center rounded-lg border border-dashed border-accent/20">
                      <p className="text-primary font-heading font-semibold text-sm flex flex-col items-center gap-2">
                        <span className="iconify text-2xl text-accent" data-icon="mdi:alert-circle-outline"></span>
                        Invalid Video Link
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <button
            onClick={() => navigate("/videopage")}
            className="group flex items-center gap-3 px-8 py-4 bg-primary text-surface rounded-xl font-heading font-bold border border-accent/40 shadow-md hover:bg-primary-light transition-all"
          >
            <span>See More Videos</span>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent group-hover:text-primary transition-colors">
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-surface" />
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
}

export default VideoShow;
