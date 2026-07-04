import React, { useState } from "react";
import axios from "../api/axios";
import axiosDirect from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Award, CheckCircle, Clock, AwardIcon, Sparkles, User, Calendar, BookOpen } from "lucide-react";

export default function StudentDetails({ festival }) {
  const [chestNumber, setChestNumber] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!chestNumber.trim() || !dob) {
      setError("Please fill in both chest number and date of birth.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      if (!festival?.externalBaseUrl) {
        throw new Error("External API base URL is not configured.");
      }

      let baseUrl = festival.externalBaseUrl.trim();
      if (baseUrl.endsWith("/")) {
        baseUrl = baseUrl.slice(0, -1);
      }

      // Extract relative path (usually /api) from the externalBaseUrl
      let relativePath = "/api";
      try {
        const parsedUrl = new URL(baseUrl);
        relativePath = parsedUrl.pathname;
      } catch (e) {
        if (baseUrl.includes("/api")) {
          relativePath = baseUrl.substring(baseUrl.indexOf("/api"));
        }
      }
      if (relativePath.endsWith("/")) {
        relativePath = relativePath.slice(0, -1);
      }

      // Prefix requests with /api-external to route through local Vite proxy or Vercel rewrite
      const requestUrl = `/api-external${relativePath}/public/participant-details`;

      console.log("Calling external API through proxy:", requestUrl, festival.externalApiKey, chestNumber.trim(), dob.trim());
      const response = await axiosDirect.get(requestUrl, {
        params: {
          chestNumber: chestNumber.trim(),
          dob: dob.trim()
        },
        headers: {
          "x-api-key": festival.externalApiKey
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
    <section id="student-details" className="relative py-24 bg-[#050706] text-[#F6F0E4] overflow-hidden border-t border-[#A97843]/15">
      {/* Decorative background vectors */}
      <div className="absolute top-0 left-0 w-64 h-64 border-t-2 border-l-2 border-[#A97843]/5 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 border-b-2 border-r-2 border-[#A97843]/5 pointer-events-none"></div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">

        {/* Header */}
        <div className="text-center mb-16 space-y-3">
          <span className="text-xs uppercase tracking-[0.4em] text-[#A97843] font-black block">
            Exhibition Portal Search
          </span>
          <h2 className="text-4xl md:text-5xl font-black font-heading tracking-wide">
            STUDENT PROFILE & OUTCOMES
          </h2>
          <div className="w-24 h-[1px] bg-[#A97843]/35 mx-auto mt-4"></div>
          <p className="text-sm font-serif italic text-[#F6F0E4]/60 max-w-lg mx-auto">
            Retrieve active competition registrations, dynamic result points, and prize collection statuses using your chest number and date of birth.
          </p>
        </div>

        {/* Search Panel Card */}
        <div className="bg-[#0b0e0c]/90 border-double border-4 border-[#A97843]/35 p-6 md:p-8 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.85)] max-w-xl mx-auto backdrop-blur-md mb-12">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Chest Number Input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.25em] text-[#A97843] font-bold block">
                  Chest Number
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A97843]/60" />
                  <input
                    type="text"
                    value={chestNumber}
                    onChange={(e) => setChestNumber(e.target.value)}
                    placeholder="e.g. A001"
                    className="w-full pl-11 pr-4 py-3 bg-[#050706] border border-[#A97843]/30 rounded-lg text-sm text-[#F6F0E4] placeholder-[#F6F0E4]/30 focus:outline-none focus:border-[#A97843] focus:ring-1 focus:ring-[#A97843] transition-all font-heading tracking-wider uppercase"
                  />
                </div>
              </div>

              {/* DOB Date Picker */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.25em] text-[#A97843] font-bold block">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A97843]/60" />
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-[#050706] border border-[#A97843]/30 rounded-lg text-sm text-[#F6F0E4] placeholder-[#F6F0E4]/30 focus:outline-none focus:border-[#A97843] focus:ring-1 focus:ring-[#A97843] transition-all font-heading"
                  />
                </div>
              </div>

            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 bg-red-950/20 border border-red-800/40 p-3.5 rounded-lg text-center font-serif italic"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#1A3022] hover:bg-[#A97843] hover:text-[#050706] border border-[#A97843]/60 rounded-lg text-xs uppercase tracking-[0.3em] font-heading font-black transition-all flex items-center justify-center gap-3 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-[#F6F0E4] border-t-transparent rounded-full animate-spin"></div>
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
                <div className="md:col-span-1 bg-[#0b0e0c]/90 border border-[#A97843]/30 p-6 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-xl">
                  {/* Glowing ambient background corner */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#A97843]/5 rounded-full blur-2xl group-hover:bg-[#A97843]/10 transition-colors"></div>

                  <div className="w-24 h-24 rounded-full border-2 border-[#A97843]/40 p-1 mb-4 relative flex items-center justify-center bg-[#050706] overflow-hidden">
                    {data.participant.photo ? (
                      <img
                        src={data.participant.photo}
                        alt={data.participant.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-[#A97843]/50" />
                    )}
                  </div>

                  <span className="text-[9px] uppercase tracking-[0.3em] text-[#A97843] font-bold block mb-1">
                    Chest No. {data.participant.chestNumber}
                  </span>
                  <h3 className="text-xl font-black tracking-wide font-heading mb-1 text-[#F6F0E4]">
                    {data.participant.fullName}
                  </h3>
                  <p className="text-[10px] text-[#F6F0E4]/60 font-serif italic mb-4">
                    {data.participant.category} • {data.participant.gender}
                  </p>

                  <div className="w-full border-t border-[#A97843]/15 pt-4 space-y-1 text-left text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#F6F0E4]/40 font-serif">Zone/Team:</span>
                      <span className="font-bold text-[#A97843]">{data.participant.teamName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#F6F0E4]/40 font-serif">Festival:</span>
                      <span className="font-bold text-[#F6F0E4] truncate max-w-[150px]">{data.participant.eventName}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Overview Stats grid (4 metrics) */}
                <div className="md:col-span-2 grid grid-cols-2 gap-4">

                  {/* Metric 1 */}
                  <div className="bg-[#0b0e0c]/90 border border-[#A97843]/20 p-5 rounded-2xl flex flex-col justify-between relative shadow-lg group hover:border-[#A97843]/45 transition-colors">
                    <BookOpen className="w-5 h-5 text-[#A97843]/50 mb-4" />
                    <div>
                      <span className="text-2xl font-black font-heading block text-[#F6F0E4]">
                        {data.competitionOverview.totalCompetitions}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-[#F6F0E4]/40 font-heading block mt-0.5">
                        Competitions Registered
                      </span>
                    </div>
                  </div>

                  {/* Metric 2 */}
                  <div className="bg-[#0b0e0c]/90 border border-[#A97843]/20 p-5 rounded-2xl flex flex-col justify-between relative shadow-lg group hover:border-[#A97843]/45 transition-colors">
                    <CheckCircle className="w-5 h-5 text-[#A97843]/50 mb-4" />
                    <div>
                      <span className="text-2xl font-black font-heading block text-[#F6F0E4]">
                        {data.competitionOverview.completedCompetitions}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-[#F6F0E4]/40 font-heading block mt-0.5">
                        Results Published
                      </span>
                    </div>
                  </div>

                  {/* Metric 3 */}
                  <div className="bg-[#0b0e0c]/90 border border-[#A97843]/20 p-5 rounded-2xl flex flex-col justify-between relative shadow-lg group hover:border-[#A97843]/45 transition-colors">
                    <Award className="w-5 h-5 text-[#A97843]/50 mb-4" />
                    <div>
                      <span className="text-2xl font-black font-heading block text-yellow-500">
                        {data.competitionOverview.prizesWon}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-[#F6F0E4]/40 font-heading block mt-0.5">
                        Prizes Won (Rank 1-3)
                      </span>
                    </div>
                  </div>

                  {/* Metric 4 */}
                  <div className="bg-[#0b0e0c]/90 border border-[#A97843]/20 p-5 rounded-2xl flex flex-col justify-between relative shadow-lg group hover:border-[#A97843]/45 transition-colors">
                    <Clock className="w-5 h-5 text-[#A97843]/50 mb-4" />
                    <div>
                      <span className="text-2xl font-black font-heading block text-[#A97843]">
                        {data.competitionOverview.prizesPendingCollection}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-[#F6F0E4]/40 font-heading block mt-0.5">
                        Prizes Pending Collection
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Competitions detailed table dashboard */}
              <div className="bg-[#0b0e0c]/90 border border-[#A97843]/20 rounded-2xl overflow-hidden shadow-xl">
                <div className="border-b border-[#A97843]/15 px-6 py-4 bg-[#050706]">
                  <h4 className="text-sm font-black font-heading tracking-widest text-[#A97843] uppercase">
                    COMPETITIONS OVERVIEW
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#A97843]/15 text-[#F6F0E4]/40 uppercase tracking-widest text-[9px] font-heading font-bold">
                        <th className="py-4 px-6">Competition</th>
                        <th className="py-4 px-6 text-center">Result Published</th>
                        <th className="py-4 px-6 text-center">Rank</th>
                        <th className="py-4 px-6 text-center">Grade</th>
                        <th className="py-4 px-6 text-center">Points</th>
                        <th className="py-4 px-6 text-right">Prize Collection</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#A97843]/10 font-serif">
                      {data.competitions.map((comp, idx) => (
                        <tr key={idx} className="hover:bg-[#A97843]/5 transition-colors">

                          {/* Name */}
                          <td className="py-4 px-6 font-bold text-[#F6F0E4]">
                            {comp.competitionName}
                          </td>

                          {/* Published */}
                          <td className="py-4 px-6 text-center">
                            {comp.result.published ? (
                              <span className="inline-block px-2.5 py-0.5 bg-green-950/40 border border-green-800/40 rounded text-[9px] uppercase font-heading text-green-500 font-bold">
                                Published
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 bg-yellow-950/40 border border-yellow-800/40 rounded text-[9px] uppercase font-heading text-yellow-500 font-bold">
                                Pending
                              </span>
                            )}
                          </td>

                          {/* Rank */}
                          <td className="py-4 px-6 text-center text-sm font-black font-heading">
                            {comp.result.published && comp.result.rank ? (
                              <span className={comp.result.rank === 1 ? "text-yellow-500" : comp.result.rank === 2 ? "text-gray-300" : "text-[#A97843]"}>
                                {comp.result.rank === 1 ? "1st" : comp.result.rank === 2 ? "2nd" : comp.result.rank === 3 ? "3rd" : `${comp.result.rank}th`}
                              </span>
                            ) : (
                              <span className="text-[#F6F0E4]/30">—</span>
                            )}
                          </td>

                          {/* Grade */}
                          <td className="py-4 px-6 text-center text-sm font-black font-heading text-yellow-500/80">
                            {comp.result.published && comp.result.grade ? comp.result.grade : <span className="text-[#F6F0E4]/30">—</span>}
                          </td>

                          {/* Points */}
                          <td className="py-4 px-6 text-center font-bold text-sm">
                            {comp.result.published && comp.result.point !== undefined ? (
                              <span className="text-[#A97843]">{comp.result.point} pts</span>
                            ) : (
                              <span className="text-[#F6F0E4]/30">—</span>
                            )}
                          </td>

                          {/* Prize Status */}
                          <td className="py-4 px-6 text-right">
                            {comp.prize.exists ? (
                              comp.prize.isCollected ? (
                                <span className="inline-block px-2.5 py-0.5 bg-green-950/40 border border-green-800/40 rounded text-[9px] uppercase font-heading text-green-500 font-bold">
                                  Collected
                                </span>
                              ) : (
                                <span className="inline-block px-2.5 py-0.5 bg-red-950/40 border border-red-800/40 rounded text-[9px] uppercase font-heading text-red-500 font-bold animate-pulse">
                                  Pending ({comp.prize.title || "Prize"})
                                </span>
                              )
                            ) : (
                              <span className="text-[#F6F0E4]/30">No Prize</span>
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
