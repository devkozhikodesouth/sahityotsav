import React, { useEffect, useState, useCallback } from "react";
import { getTeamPoint, getProxyTeamPoints } from "../api/apiCall";
import { Trophy, Medal, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Team type tabs for external API
const TEAM_TABS = [
  { label: "General", value: "General" },
  { label: "Campus", value: "Campus" },
  { label: "Campus Girls Parallel", value: "Campus Girls Parallel" },
];

function TeamPoint({ festival }) {
  const [points, setTeampoint] = useState([]);
  const [afterCount, setAfterCount] = useState(0);
  const [activeTab, setActiveTab] = useState("General");
  const [tabLoading, setTabLoading] = useState(false);

  const isExternal = festival?.externalApiEnabled;

  // Fetch external points filtered by teamTypeName tab
  const fetchExternalPoints = useCallback(async (teamTypeName) => {
    setTabLoading(true);
    try {
      const responseData = await getProxyTeamPoints(teamTypeName);
      const standings = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData?.data)
          ? responseData.data
          : [];

      const mappedResults = standings.map((item) => ({
        team: { teamName: item.name },
        point: item.point,
      }));

      const rankedResults = mappedResults.map((item) => {
        const strictlyHigher = mappedResults.filter(
          (other) => parseInt(other.point || 0, 10) > parseInt(item.point || 0, 10)
        ).length;
        return { ...item, rank: strictlyHigher + 1 };
      });

      setTeampoint(rankedResults);
      setAfterCount(10001);
    } catch (error) {
      console.error("Error fetching external team points:", error);
      setTeampoint([]);
    } finally {
      setTabLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!festival) return;

    if (isExternal) {
      fetchExternalPoints(activeTab);
    } else {
      const fetchLocal = async () => {
        try {
          const response = await getTeamPoint();
          if (Array.isArray(response?.data?.sortedResults)) {
            const validResults = response.data.sortedResults.filter((item) => item.team);

            const rankedResults = validResults.map((item) => {
              const strictlyHigher = validResults.filter(
                (other) => parseInt(other.point || 0, 10) > parseInt(item.point || 0, 10)
              ).length;
              return { ...item, rank: strictlyHigher + 1 };
            });

            setTeampoint(rankedResults);
            setAfterCount(response?.data?.afterCount);
          }
        } catch (error) {
          console.error("Error fetching team points:", error);
        }
      };
      fetchLocal();
    }
  }, [festival, isExternal, activeTab, fetchExternalPoints]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-surface border-l-4 border-accent shadow-md";
    if (rank === 2) return "bg-surface/90 border-l-4 border-accent/70 shadow-sm";
    if (rank === 3) return "bg-surface/80 border-l-4 border-copper/60 shadow-sm";
    return "bg-surface/60 border-l-4 border-transparent hover:border-accent/30";
  };

  return (
    <section id="total-point" className="w-full py-24 px-4 md:px-8 bg-background relative overflow-hidden paper-texture">
      {/* Decorative Ornaments */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-accent font-heading font-semibold tracking-widest uppercase text-xs mb-2 block">Leaderboard</span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-primary mb-3">
            {afterCount === 10001 ? "Final " : `After ${afterCount} `}
            <span className="text-gradient">Standings</span>
          </h2>
          <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
          <p className="text-secondary/80 max-w-xl mx-auto font-serif italic text-sm md:text-base mt-3">
            Current team points and overall rankings in the festival.
          </p>
        </motion.div>

        {/* ── TABS — only shown when external API is active ── */}
        {isExternal && (
          <div className="flex justify-center mb-8">
            <div className="flex bg-surface/70 border border-accent/25 rounded-xl p-1 gap-1 shadow-md">
              {TEAM_TABS.map((tab) => {
                const isActive = activeTab === tab.value;
                return (
                  <button
                    key={tab.value}
                    id={`tab-${tab.value.replace(/\s+/g, "-").toLowerCase()}`}
                    onClick={() => setActiveTab(tab.value)}
                    className={`relative px-4 py-2 rounded-lg text-xs font-heading font-bold tracking-wider uppercase transition-all duration-200 whitespace-nowrap ${isActive
                        ? "bg-accent text-background shadow-sm"
                        : "text-secondary hover:text-primary hover:bg-surface"
                      }`}
                  >
                    {tab.label}
                    {isActive && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 rounded-lg bg-accent -z-10"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="manuscript-panel border-vintage p-3 md:p-8 shadow-vintage">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-primary text-surface rounded-xl font-heading font-bold tracking-wider text-xs uppercase mb-6 shadow-md border border-accent/30">
            <div className="col-span-2 text-center text-accent">Rank</div>
            <div className="col-span-7">Team Name</div>
            <div className="col-span-3 text-center text-accent">Points</div>
          </div>

          {/* Tab-switch loading spinner */}
          <AnimatePresence mode="wait">
            {tabLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-16 flex flex-col items-center justify-center gap-3 text-accent/60"
              >
                <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-heading tracking-widest uppercase">Loading standings…</span>
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {points.length > 0 ? (
                  /* ── Scrollable standings list ── */
                  <div
                    className="max-h-[520px] overflow-y-auto space-y-3 pr-1"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "var(--color-accent, #b8860b) transparent"
                    }}
                  >
                    {points.map((data, index) => {
                      const rank = data.rank || index + 1;
                      // Count how many teams share this exact rank (tie detection)
                      const tieCount = points.filter(p => (p.rank || 0) === rank).length;
                      const isTied = tieCount > 1;

                      let Icon = Award;
                      let iconColor = "text-accent/60";
                      if (rank === 1) { Icon = Trophy; iconColor = "text-accent"; }
                      else if (rank === 2) { Icon = Medal; iconColor = "text-accent/80"; }
                      else if (rank === 3) { Icon = Medal; iconColor = "text-copper"; }

                      return (
                        <motion.div
                          key={`${activeTab}-${index}`}
                          variants={rowVariants}
                          whileHover={{ scale: 1.01 }}
                          className={`grid grid-cols-12 gap-4 items-center p-4 md:px-8 md:py-4 rounded-xl border border-accent/20 transition-all duration-300 ${getRankStyle(rank)}`}
                        >
                          {/* Position + tie badge */}
                          <div className="col-span-3 md:col-span-2 flex items-center justify-center gap-1.5">
                            <span className={`text-xl md:text-2xl font-heading font-bold ${rank <= 3 ? "text-primary" : "text-secondary/70"}`}>
                              #{rank}
                            </span>
                            {isTied && (
                              <span className="text-[8px] font-heading font-black bg-accent/20 text-accent border border-accent/40 rounded px-1 py-0.5 leading-none uppercase tracking-wide">
                                TIE
                              </span>
                            )}
                            {!isTied && rank <= 3 && <Icon className={`w-5 h-5 ${iconColor} drop-shadow-sm hidden md:block`} />}
                          </div>

                          {/* Team */}
                          <div className="col-span-6 md:col-span-7 flex flex-col">
                            <span className={`text-base md:text-lg font-heading font-bold ${rank <= 3 ? "text-primary" : "text-secondary"}`}>
                              {data.team?.teamName || "Deleted Team"}
                            </span>
                          </div>

                          {/* Points */}
                          <div className="col-span-3 text-center">
                            <div className="inline-flex items-center justify-center bg-surface border-vintage-thin px-3 py-1.5 md:px-5 md:py-2 rounded-lg shadow-sm">
                              <span className="text-lg md:text-xl font-heading font-black text-primary">{data.point}</span>
                              <span className="text-[10px] text-accent font-heading font-semibold ml-1.5 hidden md:inline">PTS</span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <motion.div variants={rowVariants} className="py-16 text-center text-secondary/60 italic bg-surface/40 rounded-xl border border-dashed border-accent/30">
                    <Trophy className="w-12 h-12 text-accent/40 mx-auto mb-3 animate-pulse" />
                    No points available yet for {isExternal ? activeTab : "this festival"}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default TeamPoint;
