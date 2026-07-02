import React, { useEffect, useState } from "react";
import { getTeamPoint, getProxyTeamPoints } from "../api/apiCall";
import { Trophy, Medal, Award } from "lucide-react";
import { motion } from "framer-motion";

function TeamPoint({ festival }) {
  const [points, setTeampoint] = useState([]);
  const [afterCount, setAfterCount] = useState(0);

  useEffect(() => {
    if (!festival) return;
    const fetchData = async () => {
      try {
        if (festival.externalApiEnabled) {
          const responseData = await getProxyTeamPoints();
          const standings = Array.isArray(responseData) ? responseData : (Array.isArray(responseData.data) ? responseData.data : []);
          
          const mappedResults = standings.map(item => ({
            team: { teamName: item.name },
            point: item.point
          }));
          
          const rankedResults = mappedResults.map((item) => {
            const strictlyHigher = mappedResults.filter(
              other => parseInt(other.point || 0, 10) > parseInt(item.point || 0, 10)
            ).length;
            return { ...item, rank: strictlyHigher + 1 };
          });
          
          setTeampoint(rankedResults);
          setAfterCount(10001); // Shows "Final Standings"
        } else {
          const response = await getTeamPoint();
          if (Array.isArray(response?.data?.sortedResults)) {
            const validResults = response.data.sortedResults.filter(item => item.team);
            
            const rankedResults = validResults.map((item) => {
              const strictlyHigher = validResults.filter(
                other => parseInt(other.point || 0, 10) > parseInt(item.point || 0, 10)
              ).length;
              return { ...item, rank: strictlyHigher + 1 };
            });

            setTeampoint(rankedResults);
            setAfterCount(response?.data?.afterCount);
          }
        }
      } catch (error) {
        console.error("Error fetching team points:", error);
      }
    };
    fetchData();
  }, [festival]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
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
          className="text-center mb-16"
        >
          <span className="text-accent font-heading font-semibold tracking-widest uppercase text-xs mb-2 block">Leaderboard</span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-primary mb-3">
            {afterCount === 10001 ? "Final " : `After ${afterCount} `}
            <span className="text-gradient">Standings</span>
          </h2>
          <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
          <p className="text-secondary/80 max-w-xl mx-auto font-serif italic text-sm md:text-base">
            Current team points and overall rankings in the festival.
          </p>
        </motion.div>

        <div className="manuscript-panel border-vintage p-3 md:p-8 shadow-vintage">
          {/* Header Row */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 bg-primary text-surface rounded-xl font-heading font-bold tracking-wider text-xs uppercase mb-6 shadow-md border border-accent/30">
            <div className="col-span-2 text-center text-accent">Rank</div>
            <div className="col-span-7">Team Name</div>
            <div className="col-span-3 text-center text-accent">Points</div>
          </div>

          {/* Data Rows */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {points.length > 0 ? (
              points.map((data, index) => {
                const rank = data.rank || (index + 1);
                let Icon = Award;
                let iconColor = "text-accent/60";
                
                if (rank === 1) { Icon = Trophy; iconColor = "text-accent"; }
                else if (rank === 2) { Icon = Medal; iconColor = "text-accent/80"; }
                else if (rank === 3) { Icon = Medal; iconColor = "text-copper"; }

                return (
                  <motion.div
                    key={index}
                    variants={rowVariants}
                    whileHover={{ scale: 1.01 }}
                    className={`grid grid-cols-12 gap-4 items-center p-4 md:px-8 md:py-4 rounded-xl border border-accent/20 transition-all duration-300 ${getRankStyle(rank)}`}
                  >
                    {/* Position */}
                    <div className="col-span-3 md:col-span-2 flex items-center justify-center gap-2">
                      <span className={`text-xl md:text-2xl font-heading font-bold ${rank <= 3 ? "text-primary" : "text-secondary/70"}`}>
                        #{rank}
                      </span>
                      {rank <= 3 && <Icon className={`w-5 h-5 ${iconColor} drop-shadow-sm hidden md:block`} />}
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
                        <span className="text-lg md:text-xl font-heading font-black text-primary">
                          {data.point}
                        </span>
                        <span className="text-[10px] text-accent font-heading font-semibold ml-1.5 hidden md:inline">PTS</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div variants={rowVariants} className="py-16 text-center text-secondary/60 italic bg-surface/40 rounded-xl border border-dashed border-accent/30">
                <Trophy className="w-12 h-12 text-accent/40 mx-auto mb-3 animate-pulse" />
                No points available yet
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default TeamPoint;
