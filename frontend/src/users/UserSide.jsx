import React, { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import Home from "./Home.jsx";
import Carousel from "./Carousel.jsx";
import TeamPoint from "./TeamPoint.jsx";
import Gallery from "./Gallery.jsx";
import VideoLink from "./VideoLink.jsx";
import Results from "./Results.jsx";
import VideoShow from "./VideoShow.jsx";
import Footer from "../components/Footer.jsx";
import { getFeatures } from "../api/apiCall.js";
import Theme from "./Theme.jsx";
import Maps from "./Maps.jsx";
import ShowNews from "./ShowNews.jsx";
import AdsBanner from "./AdsBanner.jsx";
function UserSide({ festival, onOpenMenu }) {
  const [buttonShow, setButtonShow] = useState(false);
  const [features, setFeatures] = useState([]);

  // Fetch features from API
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const result = await getFeatures();
        setFeatures(Array.isArray(result) ? result : []);
      } catch (error) {
        console.error("Error fetching features:", error);
        toast.error("Something went wrong while fetching features.");
      }
    };

    fetchFeatures();
  }, []);

  // Mapping of feature keys to components
  const featureComponents = {
    live: <VideoLink />,
    videos: <VideoShow />,
    gallery: <Gallery />,
    ads:<AdsBanner />,
    results: <Results festival={festival} />,
    news:     <ShowNews/>,
    teamPoints: <TeamPoint festival={festival} />,
    theme: <Theme/>,
    map: <Maps festival={festival}/>,
  };

  // Show scroll-to-top button logic
  useEffect(() => {
    const handleScroll = () => {
      setButtonShow(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Helper to check if a feature is enabled
  const isFeatureEnabled = (key) =>
    features.some((feature) => feature.name === key && feature.enabled);

  return (
    <>
      <Home festival={festival} onOpenMenu={onOpenMenu} />
      <div>
        {Object.entries(featureComponents).map(([key, Component], index) => {
          if (!isFeatureEnabled(key)) return null;
          
          return (
            <React.Fragment key={key}>
              {Component}
              
            </React.Fragment>
          );
        })}
      </div>
  
      <Footer festival={festival} />

      <AnimatePresence>
        {buttonShow && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary border border-accent/45 text-accent shadow-vintage hover:bg-primary-light hover:text-surface transition-all"
          >
            <span
              className="iconify text-2xl"
              data-icon="mdi:arrow-up"
            ></span>
          </motion.button>
        )}
      </AnimatePresence>

    
    </>
  );
}

export default UserSide;
