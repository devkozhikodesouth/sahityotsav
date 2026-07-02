import React, { useEffect, useState, useRef } from "react";
import { getYoutubeLink, getSettings, getFullEventTitle } from "../api/apiCall";
import UnderFooter from '../components/Footer';
import { motion } from "framer-motion";
import { PlayCircle, Maximize2 } from "lucide-react";

function VideoPage() {
  const [savedLink, setSavedLink] = useState([]);
  const iframeRefs = useRef([]);

  useEffect(() => {
    async function fetchSettingsAndTitle() {
      try {
        const settingsRes = await getSettings();
        if (settingsRes?.success && settingsRes?.settings) {
          document.title = `Videos - ${getFullEventTitle(settingsRes.settings)}`;
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
        const response = await getYoutubeLink();
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
              <PlayCircle className="w-4 h-4" /> Watch
            </span>
            <h1 className="text-4xl md:text-5xl font-heading font-black text-primary mb-3">
              All <span className="text-gradient">Videos</span>
            </h1>
            <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
            <p className="text-secondary/80 max-w-xl mx-auto font-serif italic text-sm md:text-base">Browse through our complete collection of event videos.</p>
          </motion.div>

          {savedLink.length > 0 ? (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
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
                    whileHover={{ y: -5 }}
                    className="group rounded-xl p-3 bg-surface border border-accent/30 shadow-md transition-all"
                  >
                    {embedUrl ? (
                      <div className="relative pt-[56.25%] bg-primary-dark rounded-lg overflow-hidden border border-accent/15">
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
                      <div className="flex items-center justify-center pt-[56.25%] bg-surface relative rounded-lg border border-dashed border-accent/20">
                        <p className="absolute inset-0 flex items-center justify-center text-primary font-heading font-semibold text-sm">
                          Invalid Video Link
                        </p>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <div className="text-center py-20 text-secondary/60">
              <PlayCircle className="w-16 h-16 mx-auto mb-4 text-accent/40" />
              <p className="text-xl font-heading font-semibold text-primary">No videos available yet.</p>
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

export default VideoPage;
