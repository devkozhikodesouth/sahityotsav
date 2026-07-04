import React, { useState } from "react";
import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Award, CheckCircle, Clock, AwardIcon, Sparkles, User, Calendar, BookOpen } from "lucide-react";

export default function StudentDetails({ festival }) {
  const [chestNumber, setChestNumber] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const handleDobChange = (e) => {
    let value = e.target.value;
    const clean = value.replace(/[^0-9]/g, "");
    let formatted = "";
    
    if (clean.length > 0) {
      formatted += clean.substring(0, 2);
    }
    if (clean.length > 2) {
      formatted += "-" + clean.substring(2, 4);
    }
    if (clean.length > 4) {
      formatted += "-" + clean.substring(4, 8);
    }
    
    setDob(formatted);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!chestNumber.trim() || !dob) {
      setError("Please fill in both chest number and date of birth.");
      return;
    }

    const dobRegex = /^\d{2}-\d{2}-\d{4}$/;
    if (!dobRegex.test(dob.trim())) {
      setError("Please enter a valid Date of Birth in DD-MM-YYYY format (e.g. 15-05-2005).");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);
    try {
      const response = await axios.get("/external-participant-details", {
        params: {
          chestNumber: chestNumber.trim(),
          dob: dob.trim()
        }
      });

      if (response.data && response.data.data) {
        setData(response.data.data);
      } else {
        setError("Invalid response received from server.");
      }
    } catch (err) {
      console.error("Error fetching participant details:", err);
      const msg = err.response?.data?.msg || err.response?.data?.message;
      if (msg) {
        setError(msg);
      } else if (err.response?.status === 404) {
        setError("No participant found with that chest number and date of birth.");
      } else if (err.response?.status === 400) {
        setError("Participant lookup is not enabled for this festival.");
      } else {
        setError("Failed to fetch participant details. Please check your inputs and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="student-details" className="w-full py-24 px-4 md:px-8 bg-background relative overflow-hidden paper-texture border-t border-accent/25">
      {/* Decorative Ornaments */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="text-accent font-heading font-semibold tracking-widest uppercase text-xs mb-2 block">
            Exhibition Portal Search
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-primary mb-3">
            STUDENT PROFILE & OUTCOMES
          </h2>
          <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
          <p className="text-sm font-serif italic text-secondary/70 max-w-lg mx-auto">
            Retrieve active competition registrations, dynamic result points, and prize collection statuses using your chest number and date of birth.
          </p>
        </div>

        {/* Search Panel Card */}
        <div className="manuscript-panel border-vintage p-6 md:p-8 rounded-2xl shadow-xl max-w-xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Chest Number Input */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-primary uppercase tracking-wider block">
                  Chest Number
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                  <input
                    type="text"
                    value={chestNumber}
                    onChange={(e) => setChestNumber(e.target.value)}
                    placeholder="e.g. A001"
                    className="w-full pl-11 pr-4 py-3 bg-surface border border-accent/40 rounded-xl text-sm text-secondary placeholder-secondary/35 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-heading tracking-wider uppercase font-medium"
                  />
                </div>
              </div>

              {/* DOB Input */}
              <div className="space-y-2">
                <label className="text-xs font-heading font-bold text-primary uppercase tracking-wider block">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
                  <input
                    type="text"
                    value={dob}
                    onChange={handleDobChange}
                    placeholder="DD-MM-YYYY"
                    maxLength={10}
                    className="w-full pl-11 pr-4 py-3 bg-surface border border-accent/40 rounded-xl text-sm text-secondary placeholder-secondary/35 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-heading font-medium"
                  />
                </div>
              </div>

            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-700 bg-red-50 border border-red-200 p-3.5 rounded-xl text-center font-serif italic"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary hover:bg-accent hover:text-primary-dark border border-accent/40 rounded-xl text-xs uppercase tracking-[0.3em] font-heading font-black text-white transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Searching Records...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Retrieve Profile
                </>
              )}
            </button>
          </form>
        </div>

        {/* Presentation Area */}
        <AnimatePresence mode="wait">
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Profile Card & Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* 1. Student Identity Card */}
                <div className="md:col-span-1 bg-surface border border-accent/40 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-xl">
                  {/* Glowing ambient background corner */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl group-hover:bg-accent/10 transition-colors"></div>

                  <div className="w-24 h-24 rounded-full border-2 border-accent/40 p-1 mb-4 relative flex items-center justify-center bg-background overflow-hidden">
                    {data.participant.photo ? (
                      <img
                        src={data.participant.photo}
                        alt={data.participant.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-accent/50" />
                    )}
                  </div>

                  <span className="text-xs uppercase tracking-[0.2em] text-accent font-bold block mb-1">
                    Chest No. {data.participant.chestNumber}
                  </span>
                  <h3 className="text-xl font-black tracking-wide font-heading mb-1 text-primary">
                    {data.participant.fullName}
                  </h3>
                  <p className="text-xs text-secondary/80 font-serif italic mb-4">
                    {data.participant.category} • {data.participant.gender}
                  </p>

                  <div className="w-full border-t border-accent/20 pt-4 space-y-1 text-left text-xs">
                    <div className="flex justify-between">
                      <span className="text-secondary/60 font-serif">Zone/Team:</span>
                      <span className="font-bold text-primary">{data.participant.teamName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary/60 font-serif">Festival:</span>
                      <span className="font-bold text-primary truncate max-w-[150px]">{data.participant.eventName}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Overview Stats grid (4 metrics) */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">

                  {/* Metric 1 */}
                  <div className="bg-surface border border-accent/30 p-5 rounded-2xl flex flex-col justify-between relative shadow-lg group hover:border-accent transition-colors">
                    <BookOpen className="w-5 h-5 text-accent/70 mb-4" />
                    <div>
                      <span className="text-2xl font-black font-heading block text-primary">
                        {data.competitionOverview.totalCompetitions}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-secondary/60 font-heading block mt-0.5">
                        Competitions Registered
                      </span>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-surface border border-accent/30 p-5 rounded-2xl flex flex-col justify-between relative shadow-lg group hover:border-accent transition-colors">
                    <CheckCircle className="w-5 h-5 text-accent/70 mb-4" />
                    <div>
                      <span className="text-2xl font-black font-heading block text-primary">
                        {data.competitionOverview.completedCompetitions}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-secondary/60 font-heading block mt-0.5">
                        Results Published
                      </span>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-surface border border-accent/30 p-5 rounded-2xl flex flex-col justify-between relative shadow-lg group hover:border-accent transition-colors">
                    <Award className="w-5 h-5 text-accent/70 mb-4" />
                    <div>
                      <span className="text-2xl font-black font-heading block text-yellow-600">
                        {data.competitionOverview.prizesWon}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-secondary/60 font-heading block mt-0.5">
                        Prizes Won (Rank 1-3)
                      </span>
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-surface border border-accent/30 p-5 rounded-2xl flex flex-col justify-between relative shadow-lg group hover:border-accent transition-colors">
                    <Clock className="w-5 h-5 text-accent/70 mb-4" />
                    <div>
                      <span className="text-2xl font-black font-heading block text-copper">
                        {data.competitionOverview.prizesPendingCollection}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-secondary/60 font-heading block mt-0.5">
                        Prizes Pending Collection
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Competitions detailed table dashboard */}
              <div className="bg-surface border border-accent/40 rounded-2xl overflow-hidden shadow-xl">
                <div className="border-b border-accent/20 px-6 py-4 bg-background/50">
                  <h4 className="text-sm font-black font-heading tracking-widest text-primary uppercase">
                    COMPETITIONS OVERVIEW
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-accent/20 text-secondary/60 uppercase tracking-widest text-[9px] font-heading font-bold bg-background/30">
                        <th className="py-4 px-6">Competition</th>
                        <th className="py-4 px-6 text-center">Result Published</th>
                        <th className="py-4 px-6 text-center">Rank</th>
                        <th className="py-4 px-6 text-center">Grade</th>
                        <th className="py-4 px-6 text-center">Points</th>
                        <th className="py-4 px-6 text-right">Prize Collection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-accent/15 font-serif text-secondary">
                      {data.competitions.map((comp, idx) => (
                        <tr key={idx} className="hover:bg-accent/5 transition-colors">

                          {/* Name */}
                          <td className="py-4 px-6 font-bold text-secondary">
                            {comp.competitionName}
                          </td>

                          {/* Published */}
                          <td className="py-4 px-6 text-center">
                            {comp.result?.published ? (
                              <span className="inline-block px-2.5 py-0.5 bg-green-50 border border-green-200 rounded text-[9px] uppercase font-heading text-green-700 font-bold">
                                Published
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 bg-yellow-50 border border-yellow-200 rounded text-[9px] uppercase font-heading text-yellow-700 font-bold">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Rank */}
                          <td className="py-4 px-6 text-center text-sm font-black font-heading">
                            {comp.result?.published && comp.result?.rank ? (
                              <span className={comp.result?.rank === 1 ? "text-yellow-600 font-black" : comp.result?.rank === 2 ? "text-slate-500 font-bold" : "text-amber-800 font-semibold"}>
                                {comp.result?.rank === 1 ? "1st" : comp.result?.rank === 2 ? "2nd" : comp.result?.rank === 3 ? "3rd" : `${comp.result?.rank}th`}
                              </span>
                            ) : (
                              <span className="text-secondary/40">—</span>
                            )}
                          </td>

                          {/* Grade */}
                          <td className="py-4 px-6 text-center text-sm font-black font-heading text-primary-light">
                            {comp.result?.published && comp.result?.grade ? comp.result?.grade : <span className="text-secondary/40">—</span>}
                          </td>

                          {/* Points */}
                          <td className="py-4 px-6 text-center font-bold text-sm">
                            {comp.result?.published && comp.result?.point !== undefined ? (
                              <span className="text-primary font-black">{comp.result?.point} pts</span>
                            ) : (
                              <span className="text-secondary/40">—</span>
                            )}
                          </td>

                          {/* Prize Status */}
                          <td className="py-4 px-6 text-right">
                            {comp.prize?.exists ? (
                              comp.prize.isCollected ? (
                                <span className="inline-block px-2.5 py-0.5 bg-green-50 border border-green-200 rounded text-[9px] uppercase font-heading text-green-700 font-bold">
                                  Collected
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 bg-red-50 border border-red-200 rounded text-[9px] uppercase font-heading text-red-700 font-bold animate-pulse">
                                  Pending ({comp.prize.title || "Prize"})
                                </span>
                              )
                            ) : (
                              <span className="text-secondary/40">No Prize</span>
                            )}
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
