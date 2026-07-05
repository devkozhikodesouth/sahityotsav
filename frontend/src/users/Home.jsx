import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, ChevronDown, Menu, BookOpen } from "lucide-react";
import ThreeDBackdrop from "./ThreeDBackdrop.jsx";
import { Link } from "react-router-dom";

/* ═══════════════════════════════════════════════════
   ORNAMENTAL CORNER MOTIF
   ═══════════════════════════════════════════════════ */
function CornerOrnaments() {
  return (
    <>
      {/* Top-Left */}
      <div className="absolute top-6 left-6 w-24 h-24 border-t-2 border-l-2 border-accent/40 pointer-events-none z-10">
        <div className="absolute top-1 left-1 w-3 h-3 bg-accent/40 rounded-full"></div>
        <div className="absolute top-2 left-2 w-16 h-px bg-accent/20"></div>
        <div className="absolute top-2 left-2 w-px h-16 bg-accent/20"></div>
      </div>
      {/* Top-Right */}
      <div className="absolute top-6 right-6 w-24 h-24 border-t-2 border-r-2 border-accent/40 pointer-events-none z-10">
        <div className="absolute top-1 right-1 w-3 h-3 bg-accent/40 rounded-full"></div>
        <div className="absolute top-2 right-2 w-16 h-px bg-accent/20"></div>
        <div className="absolute top-2 right-2 w-px h-16 bg-accent/20"></div>
      </div>
      {/* Bottom-Left */}
      <div className="absolute bottom-6 left-6 w-24 h-24 border-b-2 border-l-2 border-accent/40 pointer-events-none z-10">
        <div className="absolute bottom-1 left-1 w-3 h-3 bg-accent/40 rounded-full"></div>
        <div className="absolute bottom-2 left-2 w-16 h-px bg-accent/20"></div>
        <div className="absolute bottom-2 left-2 w-px h-16 bg-accent/20"></div>
      </div>
      {/* Bottom-Right */}
      <div className="absolute bottom-6 right-6 w-24 h-24 border-b-2 border-r-2 border-accent/40 pointer-events-none z-10">
        <div className="absolute bottom-1 right-1 w-3 h-3 bg-accent/40 rounded-full"></div>
        <div className="absolute bottom-2 right-2 w-16 h-px bg-accent/20"></div>
        <div className="absolute bottom-2 right-2 w-px h-16 bg-accent/20"></div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   VINTAGE INFO BLOCK (Glassmorphic edition)
   ═══════════════════════════════════════════════════ */
function InfoPill({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-accent/25 rounded-xl px-5 py-3.5 flex-1 min-w-0 shadow-lg backdrop-blur-md">
      <span className="text-accent text-xl flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] text-accent/70 uppercase tracking-widest font-heading font-semibold leading-none mb-1">{label}</p>
        <p className="text-sm font-semibold text-white/95 truncate font-serif">{value}</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════ */
export default function Home({ festival, onOpenMenu }) {
  const settings = festival?.settings || {};
  const isDefault = festival?.name?.toLowerCase().includes("kozhikode");

  const dateStr = settings.date || (isDefault ? "May 22 & 23, 2026" : "Coming Soon");
  const venueStr = settings.venue || (isDefault ? "Kuttippadam" : "Main Venue");
  const descriptionStr = settings.description || "A grand celebration of literature, culture, creativity, and talent. Experience unforgettable days filled with inspiring performances, competitions, and artistic excellence.";
  const badgeStr = settings.badge || festival?.name || "SSF KUTTIKKATOOR";
  const defaultEdition = festival
    ? festival.name.replace(/[-_]?sahityotsav/gi, "").replace(/[-_]?sahithyotsav/gi, "").trim()
    : "26";
  const editionStr = settings.edition || defaultEdition;
  const programsCount = settings.programsCount || "140+";
  const participantsCount = settings.participantsCount || "300+";
  const rightImage = settings.rightImage || "/bgmobile2.jpg";

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const containerVar = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };
  
  const itemVar = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-between py-12 px-6 md:px-12 text-secondary select-none bg-transparent overflow-x-hidden"
    >
      {/* 3D WebGL Background backdrop */}
      <ThreeDBackdrop />

      {/* Corner Ornaments */}
      <CornerOrnaments />

      {/* Floating Menu Button */}
      <div className="fixed top-6 right-6 z-50">
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(197, 160, 89, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenMenu}
          aria-label="Open Navigation Menu"
          className="p-3.5 rounded-full text-accent hover:text-white bg-primary/95 border border-accent/40 shadow-xl backdrop-blur-md transition-all duration-200"
        >
          <Menu className="h-6 w-6" />
        </motion.button>
      </div>

      {/* Unified Responsive Grid Container */}
      <div className="relative flex flex-col lg:flex-row flex-1 items-center justify-center max-w-7xl mx-auto w-full z-10 mt-12 mb-8 gap-10 lg:gap-12 xl:gap-16">
        
        {/* LEFT COLUMN: Texts & Actions */}
        <motion.div 
          variants={containerVar} 
          initial="hidden" 
          animate="show" 
          className="flex-1 w-full text-left space-y-6 lg:max-w-2xl"
        >
          {/* Badge pill */}
          <motion.div variants={itemVar} className="w-fit">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-accent/30 rounded-full shadow-md backdrop-blur-sm">
              <BookOpen size={14} className="text-accent" />
              <span className="text-[10px] tracking-[3px] uppercase text-accent font-heading font-bold">{badgeStr}</span>
            </div>
          </motion.div>

          {/* Logo & Edition */}
          <motion.div variants={itemVar} className="space-y-4">
            <img
              src="/SahiText.svg"
              className="invert drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] w-[300px] md:w-[440px] h-auto block"
              alt="Sahityotsav"
            />
            <div className="text-accent font-heading font-bold italic text-xl lg:text-2xl tracking-wide pl-1">
              {editionStr} Edition
            </div>
          </motion.div>

          {/* Divider */}
          <motion.div variants={itemVar} className="divider-vintage-ornamental w-2/3 opacity-40"></motion.div>

          {/* Description */}
          <motion.p 
            variants={itemVar} 
            className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl font-serif"
          >
            {descriptionStr}
          </motion.p>

          {/* Info Pills */}
          <motion.div variants={itemVar} className="flex flex-col sm:flex-row gap-4 w-full max-w-xl">
            <InfoPill icon={<CalendarDays />} label="Festive Schedule" value={dateStr} />
            <InfoPill icon={<MapPin />} label="Cultural Arena" value={venueStr} />
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={itemVar} className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => scrollTo("results")}
              className="w-full sm:w-auto bg-primary text-white border border-accent/50 hover:text-accent hover:border-accent hover:bg-primary-light px-8 py-4 rounded-xl font-heading font-bold tracking-wider uppercase shadow-md transition-all duration-200"
            >
              🏆 explore results
            </motion.button>
        <Link to="/student">
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className="w-full sm:w-auto bg-white/5 text-white border border-accent/40 hover:bg-white/10 px-8 py-4 rounded-xl font-heading font-semibold tracking-wider uppercase shadow-sm transition-all duration-200 backdrop-blur-sm"
  >
    Participant Login
  </motion.button>
</Link>
          </motion.div>

        </motion.div>

        {/* RIGHT COLUMN: Invite Frame & Stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, duration: 0.7 }}
          className="hidden lg:flex w-full lg:w-[380px] justify-center relative mt-4 lg:mt-0"
        >
          <div className="relative p-4 bg-white/5 border border-accent/35 shadow-2xl w-full max-w-[350px] rounded-2xl backdrop-blur-md">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-accent/20">
              <img 
                src={rightImage} 
                alt="Sahityotsav Commemorative Invite" 
                className="w-full h-full object-cover grayscale-[10%] sepia-[10%] brightness-95" 
              />
              <div className="absolute inset-0 bg-primary/5 mix-blend-overlay pointer-events-none"></div>
            </div>

            {/* Stats Inside Invite Card */}
            <div className="mt-4 pt-4 border-t border-accent/20 flex justify-around text-center">
              <div>
                <p className="text-[9px] text-accent uppercase tracking-widest font-heading font-bold">Programs</p>
                <p className="text-lg font-heading font-bold text-white mt-0.5">🎭 {programsCount}</p>
              </div>
              <div className="w-px bg-accent/20"></div>
              <div>
                <p className="text-[9px] text-accent uppercase tracking-widest font-heading font-bold">Participants</p>
                <p className="text-lg font-heading font-bold text-white mt-0.5">👥 {participantsCount}</p>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* ─── SCROLL DOWN ARROW ─── */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={() => scrollTo("results")}
        aria-label="Scroll down to results"
        className="mx-auto flex flex-col items-center gap-1.5 cursor-pointer group z-10 mt-8"
      >
        <span className="hidden sm:block text-[9px] text-white/40 font-heading font-bold uppercase tracking-widest group-hover:text-accent transition-colors">
          Scroll Down
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          className="w-9 h-9 rounded-full flex items-center justify-center border border-accent/30 bg-white/5 shadow-md backdrop-blur-sm"
        >
          <ChevronDown size={16} className="text-accent group-hover:text-white transition-colors" />
        </motion.div>
      </motion.button>
    </section>
  );
}