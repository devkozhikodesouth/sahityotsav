import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Carousel = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    'https://img.freepik.com/free-vector/sun-light-with-clouds-sky-background_1017-38299.jpg?t=st=1739713605~exp=1739717205~hmac=bea221f2a840a79942b147937d2b2c9a41e377dc1e5de836bd1d89eb4cc5b1d7',
    'https://static.vecteezy.com/system/resources/thumbnails/010/360/100/small_2x/shining-blue-sky-and-orange-sand-background-free-vector.jpg'
  ];

  const scrollToElement = (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000); // Slower, more elegant transition
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="default-carousel" className="relative w-full h-[80vh] md:h-[100vh] overflow-hidden bg-primary-dark">
      {/* Carousel wrapper */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full"
        >
          <img
            src={slides[currentSlide]}
            alt={`Slide ${currentSlide + 1}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary-dark/60 via-transparent to-background"></div>
        </motion.div>
      </AnimatePresence>

      {/* Floating Content over Carousel */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
        <div className="mt-auto pb-12 md:pb-24 pointer-events-auto">
          <button 
            onClick={() => scrollToElement("results")}
            className="flex flex-col items-center group"
          >
            <span className="text-white/80 text-sm mb-3 font-medium tracking-wide uppercase group-hover:text-white transition-colors">Discover More</span>
            <div className="w-14 h-14 rounded-full glass flex items-center justify-center animate-bounce-soft group-hover:bg-white/20 transition-all shadow-glass border-white/30">
              <span className="iconify text-3xl text-white" data-icon="mdi:chevron-down"></span>
            </div>
          </button>
        </div>
      </div>

      {/* Slider indicators */}
      <div className="absolute z-20 flex -translate-x-1/2 bottom-8 left-1/2 space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`transition-all duration-300 rounded-full ${
              index === currentSlide ? 'w-8 h-2 bg-accent' : 'w-2 h-2 bg-white/50 hover:bg-white/80'
            }`}
            aria-current={index === currentSlide}
            aria-label={`Slide ${index + 1}`}
            onClick={() => setCurrentSlide(index)}
          />
        ))}
      </div>

      {/* Slider controls */}
      <button
        type="button"
        className="absolute top-1/2 -translate-y-1/2 start-4 md:start-8 z-30 flex items-center justify-center h-12 w-12 rounded-full glass group hover:bg-white/20 transition-all cursor-pointer focus:outline-none"
        onClick={prevSlide}
      >
        <span className="iconify text-2xl text-white group-hover:-translate-x-1 transition-transform" data-icon="mdi:chevron-left"></span>
        <span className="sr-only">Previous</span>
      </button>
      
      <button
        type="button"
        className="absolute top-1/2 -translate-y-1/2 end-4 md:end-8 z-30 flex items-center justify-center h-12 w-12 rounded-full glass group hover:bg-white/20 transition-all cursor-pointer focus:outline-none"
        onClick={nextSlide}
      >
        <span className="iconify text-2xl text-white group-hover:translate-x-1 transition-transform" data-icon="mdi:chevron-right"></span>
        <span className="sr-only">Next</span>
      </button>
    </div>
  );
};

export default Carousel;
