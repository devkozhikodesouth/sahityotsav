import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, User, Flame } from "lucide-react";

export default function StudentDetails({ festival, bgColor }) {
  const [chestNumber, setChestNumber] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!chestNumber.trim()) {
      setError("Please enter a student chest number.");
      return;
    }
    setError("");
    navigate("/student", { state: { chestNumber: chestNumber.trim() } });
  };

  return (
    <section id="student-details" className="w-full pt-12 pb-16 px-4 md:px-8 bg-background relative overflow-hidden paper-texture border-t border-accent/25" style={{ backgroundColor: bgColor || "#F4EFE3" }}>
      {/* Decorative Ornaments */}
      <div className="hidden md:block absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="hidden md:block absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="hidden md:block absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="hidden md:block absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>

      <div className="max-w-xl mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <span className="text-accent font-heading font-semibold tracking-widest uppercase text-xs mb-2 block">
            Exhibition Portal Search
          </span>
          <h2 className="text-3xl md:text-4xl font-heading font-black text-primary mb-3">
            STUDENT DETAILS
          </h2>
          <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
          <p className="text-sm font-serif italic text-secondary/70 max-w-md mx-auto">
            Retrieve active competition registrations, dynamic result points, and prize collection statuses using your unique chest number.
          </p>
        </div>

        {/* Search Panel Card */}
        <div className="manuscript-panel border-vintage p-6 md:p-8 rounded-2xl shadow-xl">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-heading font-bold text-primary uppercase tracking-wider block text-center">
                Enter Student Chest Number
              </label>
              <div className="relative max-w-xs mx-auto">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-accent" />
                <input
                  type="text"
                  value={chestNumber}
                  onChange={(e) => setChestNumber(e.target.value)}
                  placeholder="e.g. A001"
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-accent/40 rounded-xl text-sm text-secondary placeholder-secondary/35 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-heading tracking-wider uppercase font-medium text-center"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl text-center font-serif italic"
              >
                {error}
              </motion.div>
            )}

            <div className="max-w-xs mx-auto">
              <button
                type="submit"
                className="w-full py-3.5 bg-primary hover:bg-accent hover:text-primary-dark border border-accent/40 rounded-xl text-xs uppercase tracking-[0.3em] font-heading font-black text-white transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95"
              >
                <Search className="w-4 h-4" />
                Retrieve Profile
              </button>
            </div>
          </form>
        </div>

      </div>
    </section>
  );
}
