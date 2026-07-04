import React, { useEffect, useState } from "react";
import { getDataServer, getResultImage, getProxyCompetitions, getProxyCompetitionResults, getAds } from "../api/apiCall";
import { getCategory, getPublishedItem } from "../api/cateGoryAnditem";
import ImageDownlad from "./ImageDownlad.jsx";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Medal, Star } from "lucide-react";

function Results({ festival }) {
  const [allPublicCompetitions, setAllPublicCompetitions] = useState([]);
  const [category, setCategory] = useState("");
  const [toastData, setTostData] = useState({});
  const [selectedItem, setSelectedItem] = useState("");
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ads, setAds] = useState([]);
  const [resultNumber, setResultNumber] = useState(null);
  const [results, setResults] = useState(null);
  const [images, setImages] = useState([null, null, null]);
  const [color, setColor] = useState([null, null, null]);
  const [positions, setPositions] = useState([null, null, null]);
  const [templateMode, setTemplateMode] = useState("fixed");
  const [templateRules, setTemplateRules] = useState([]);
  const [dynamicTemplates, setDynamicTemplates] = useState([]);

  useEffect(() => {
    if (!festival) return;
    async function fetchData() {
      if (festival.externalApiEnabled) {
        try {
          const responseData = await getProxyCompetitions();
          const comps = Array.isArray(responseData) ? responseData : (Array.isArray(responseData.data) ? responseData.data : []);

          const uniqueCats = [];
          const catMap = {};
          comps.forEach(comp => {
            if (comp.category && !catMap[comp.category]) {
              const catObj = {
                _id: comp.category,
                categoryName: comp.category
              };
              catMap[comp.category] = catObj;
              uniqueCats.push(catObj);
            }
          });
          setCategories(uniqueCats);
          setAllPublicCompetitions(comps);
        } catch (err) {
          console.error("Failed to load public competitions:", err);
        }
      } else {
        const responce = await getCategory();
        setCategories(responce.data || []);
      }
    }
    fetchData();
  }, [festival]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getResultImage();
        const data = response.data;
        setImages([
          data?.image1?.image || null,
          data?.image2?.image || null,
          data?.image3?.image || null,
        ]);
        setColor([
          data?.image1?.color || null,
          data?.image2?.color || null,
          data?.image3?.color || null,
        ]);
        setPositions([
          data?.image1?.positions || null,
          data?.image2?.positions || null,
          data?.image3?.positions || null,
        ]);
        setTemplateMode(data?.templateMode || "fixed");
        setTemplateRules(data?.templateRules || []);
        setDynamicTemplates(data?.templates || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const getActiveTemplates = () => {
    if (templateMode === "fixed") {
      return [
        {
          image: images[0],
          color: color[0],
          positions: positions[0]
        },
        {
          image: images[1],
          color: color[1],
          positions: positions[1]
        },
        {
          image: images[2],
          color: color[2],
          positions: positions[2]
        }
      ];
    }

    if (resultNumber === null || resultNumber === undefined || dynamicTemplates.length === 0) {
      return [];
    }

    const matchedTemplate = dynamicTemplates.find(t => {
      const min = t.minResultNumber !== undefined && t.minResultNumber !== null && t.minResultNumber !== ""
        ? Number(t.minResultNumber)
        : null;
      const max = t.maxResultNumber !== undefined && t.maxResultNumber !== null && t.maxResultNumber !== ""
        ? Number(t.maxResultNumber)
        : null;

      if (min === null || max === null) return false;
      const val = Number(resultNumber);
      return val >= min && val <= max;
    });

    return matchedTemplate ? [matchedTemplate] : [];
  };

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const res = await getAds();
        if (res.success && Array.isArray(res.data)) {
          setAds(res.data);
        }
      } catch (err) {
        console.error("Error fetching advertisements:", err);
      }
    };
    fetchAds();
  }, []);

  const getFilteredAd = (resultNum) => {
    if (!ads || ads.length === 0) return null;
    if (resultNum === null || resultNum === undefined) {
      return null;
    }

    const matchedAd = ads.find(ad => {
      const start = ad.startRange !== null && ad.startRange !== undefined && ad.startRange !== ""
        ? Number(ad.startRange)
        : (ad.minRank !== null && ad.minRank !== undefined && ad.minRank !== "" ? Number(ad.minRank) : null);
      const end = ad.endRange !== null && ad.endRange !== undefined && ad.endRange !== ""
        ? Number(ad.endRange)
        : (ad.maxRank !== null && ad.maxRank !== undefined && ad.maxRank !== "" ? Number(ad.maxRank) : null);

      if (start === null || end === null) return false;
      const val = Number(resultNum);
      return val >= start && val <= end;
    });

    return matchedAd || null;
  };

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setCategory(selectedCategory);
    if (!selectedCategory) {
      setItems([]);
      return;
    }

    if (festival?.externalApiEnabled) {
      const filteredComps = allPublicCompetitions.filter(comp => comp.category === selectedCategory);
      const mappedItems = filteredComps.map(comp => ({
        _id: comp.id,
        itemName: comp.name
      }));
      setItems(mappedItems);
    } else {
      async function fetchData() {
        const responce = await getPublishedItem(selectedCategory);
        setItems(responce.data || []);
      }
      fetchData();
    }
  };

  const handleItemData = async (event) => {
    const itemValue = event.target.value;
    setSelectedItem(itemValue);
    if (!itemValue) {
      setResults(null);
      setResultNumber(null);
      return;
    }
    try {
      toast.loading("Fetching results...");

      if (festival?.externalApiEnabled) {
        const responseData = await getProxyCompetitionResults(itemValue);
        console.log(responseData,"dfdfd");
        toast.dismiss();

        const entries = Array.isArray(responseData) ? responseData : (Array.isArray(responseData.data) ? responseData.data : []);

        if (entries.length > 0) {
          const comp = allPublicCompetitions.find(c => c.id === itemValue);
          const tDetails = {
            category: comp ? comp.category : "Category",
            item: comp ? comp.name : "Item"
          };
          setTostData(tDetails);

          const resultGrouped = [
            { position: 1, winners: [] },
            { position: 2, winners: [] },
            { position: 3, winners: [] }
          ];

          entries.forEach(entry => {
            let winnerName = "";
            if (entry.leaderName) {
              winnerName = `${entry.leaderName} and team`;
            } else if (entry.groupName) {
              winnerName = `${entry.groupName} and team`;
            } else {
              winnerName = entry.participantName || "";
            }

            const mappedWinner = {
              name: winnerName,
              team: entry.teamName,
              teamId: { teamName: entry.teamName }
            };

            const rankNum = Number(entry.rank);
            const prizeStr = String(entry.prize || "").toUpperCase();

            if (rankNum === 1 || prizeStr === "FIRST" || prizeStr === "1ST") {
              resultGrouped[0].winners.push(mappedWinner);
            } else if (rankNum === 2 || prizeStr === "SECOND" || prizeStr === "2ND") {
              resultGrouped[1].winners.push(mappedWinner);
            } else if (rankNum === 3 || prizeStr === "THIRD" || prizeStr === "3RD") {
              resultGrouped[2].winners.push(mappedWinner);
            }
          });

          const formattedResult = {
            category: { categoryName: tDetails.category },
            item: { itemName: tDetails.item },
            result: resultGrouped
          };

          setResults(formattedResult);
          
          const externalResultNumber = responseData.resultNumber !== undefined 
            ? responseData.resultNumber 
            : (responseData.data?.resultNumber !== undefined 
                ? responseData.data.resultNumber 
                : (entries[0]?.resultNumber !== undefined 
                    ? entries[0].resultNumber 
                    : (entries[0]?.rank !== undefined ? entries[0].rank : entries.length)));
          
          setResultNumber(externalResultNumber !== null && externalResultNumber !== undefined ? Number(externalResultNumber) : null);
          toast.success(`Published: ${tDetails.category} - ${tDetails.item}`);
        } else {
          setResults({ result: false });
          setResultNumber(null);
          toast("Not Published Yet");
        }
      } else {
        const response = await getDataServer(itemValue, category);
        const { success, data, resultNumber: apiResultNumber } = response;
        setTostData({
          category: data?.category?.categoryName || "Category",
          item: data?.item?.itemName || "Item",
        });
        toast.dismiss();
        setResults(data);
        if (success) {
          toast.success(`Published: ${data?.category?.categoryName || "Result"} - ${data?.item?.itemName || "Event"}`);
          
          let count = apiResultNumber !== undefined && apiResultNumber !== null
            ? Number(apiResultNumber)
            : null;

          if (count === null) {
            let totalWinners = 0;
            if (data?.result && Array.isArray(data.result)) {
              data.result.forEach(pos => {
                if (Array.isArray(pos.winners)) {
                  totalWinners += pos.winners.length;
                }
              });
            }
            count = totalWinners;
          }
          setResultNumber(count);
        } else {
          setResultNumber(null);
          toast(`Not Published Yet: ${data?.category?.categoryName || "Result"} - ${data?.item?.itemName || "Event"}`);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error.message);
      toast.dismiss();
      setResults({ result: false });
      setResultNumber(null);
      toast.error(error.message || "Failed to fetch results. Please try again.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  const renderPrizeIcon = (index) => {
    if (index === 0) return <Trophy className="w-7 h-7 text-accent" />;
    if (index === 1) return <Medal className="w-7 h-7 text-accent/80" />;
    if (index === 2) return <Medal className="w-7 h-7 text-copper" />;
    return <Star className="w-7 h-7 text-primary-light" />;
  };

  return (
    <section id="results" className="w-full py-24 px-4 md:px-8 bg-background relative overflow-hidden paper-texture">
      {/* Decorative Ornaments */}
      <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-accent/20 pointer-events-none z-10"></div>
      <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-accent/20 pointer-events-none z-10"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-accent font-heading font-semibold tracking-widest uppercase text-xs mb-2 block">Competition</span>
          <h2 className="text-4xl md:text-5xl font-heading font-black text-primary mb-3">
            Latest <span className="text-gradient">Results</span>
          </h2>
          <div className="divider-vintage-ornamental max-w-xs mx-auto"></div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="manuscript-panel border-vintage p-6 md:p-8 mb-16 flex flex-col md:flex-row gap-6 items-center shadow-vintage"
        >
          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <label className="text-xs font-heading font-bold text-primary uppercase tracking-wider">Category</label>
            <div className="relative">
              <select
                onChange={handleCategoryChange}
                className="w-full appearance-none bg-surface border border-accent/40 text-secondary py-3 px-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all shadow-sm font-medium"
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category._id} value={category?._id}>
                    {category?.categoryName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-accent">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col gap-2">
            <label className="text-xs font-heading font-bold text-primary uppercase tracking-wider">Item / Event</label>
            <div className="relative">
              <select
                id="item"
                onChange={handleItemData}
                disabled={!category}
                className="w-full appearance-none bg-surface border border-accent/40 text-secondary py-3 px-4 rounded-xl focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all shadow-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">Select Item</option>
                {items.map((item) => (
                  <option key={item._id} value={item?._id}>
                    {item?.itemName}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-accent">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Display */}
        <AnimatePresence mode="wait">
          {results?.result && (
            <motion.div
              key="results-view"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="space-y-16"
            >
              {/* Podium / Top 3 List */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    winners: results.result[0]?.winners || (results.result[0]?.firstPrize ? [{ name: results.result[0].firstPrize, team: results.result[0].firstTeam }] : []),
                    title: "1st Prize",
                    borderStyle: "border-t-4 border-t-accent border border-accent/20"
                  },
                  {
                    winners: results.result[1]?.winners || (results.result[1]?.secPrize ? [{ name: results.result[1].secPrize, team: results.result[1].secTeam }] : []),
                    title: "2nd Prize",
                    borderStyle: "border-t-4 border-t-accent/70 border border-accent/20"
                  },
                  {
                    winners: results.result[2]?.winners || (results.result[2]?.thirdPrize ? [{ name: results.result[2].thirdPrize, team: results.result[2].thirdTeam }] : []),
                    title: "3rd Prize",
                    borderStyle: "border-t-4 border-t-copper/70 border border-accent/20"
                  }
                ].map((place, idx) => (
                  <motion.div
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    className={`bg-surface p-6 rounded-2xl flex items-start gap-5 shadow-md h-full ${place.borderStyle}`}
                  >
                    <div className="flex-shrink-0 bg-surface border-vintage-thin p-3 rounded-xl shadow-sm flex flex-col items-center justify-center w-16 h-16">
                      {renderPrizeIcon(idx)}
                      <span className="text-[10px] font-heading font-semibold text-accent mt-0.5">0{idx + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-heading font-semibold text-accent uppercase tracking-widest mb-3">{place.title}</p>
                      {place.winners && place.winners.length > 0 ? (
                        <div className="space-y-3">
                          {place.winners.map((winner, winnerIdx) => (
                            <div key={winnerIdx} className="mb-2 last:mb-0">
                              <p className="text-lg font-biorhyme font-bold text-primary leading-tight break-words">{winner.name}</p>
                              <p className="text-xs font-serif font-medium text-accent mt-1">{winner.teamId?.teamName || winner.team}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-secondary/50 italic font-serif">Not Awarded</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Download Cards */}
              <motion.div 
                variants={itemVariants} 
                className={`grid gap-8 ${
                  getActiveTemplates().length === 1 
                    ? "grid-cols-1 max-w-md mx-auto" 
                    : "grid-cols-1 md:grid-cols-3"
                }`}
              >
                {getActiveTemplates().map((tpl, idx) => (
                  <div key={idx} className="bg-surface rounded-2xl p-4 shadow-md overflow-hidden group hover:shadow-lg transition-shadow border border-accent/20">
                    <ImageDownlad
                      results={results}
                      positions={tpl.positions}
                      category={results?.category?.categoryName}
                      item={results?.item?.itemName}
                      image={tpl.image}
                      color={tpl.color}
                      activeAd={getFilteredAd(resultNumber)}
                    />
                  </div>
                ))}
              </motion.div>
            </motion.div>
          )}

          {results?.result === false && (
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-surface border border-accent/40 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-vintage"
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/15 mb-4 text-accent">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              </div>
              <h3 className="text-xl font-heading font-bold text-primary mb-2">Results Not Available</h3>
              <p className="text-secondary/80 font-serif italic text-sm md:text-base">
                The results for <span className="font-semibold text-primary">{toastData.category} - {toastData.item}</span> have not yet been published. Please check back later.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Toaster position="top-center" />
    </section>
  );
}

export default Results;
