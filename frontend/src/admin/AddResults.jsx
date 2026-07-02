import React, { useEffect, useState } from "react";
import { getTeam, postDataServer, getDataServer } from "../api/apiCall.js";
import { useNavigate, useLocation } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { getCategory, getItem } from "../api/cateGoryAnditem.js";
import { fieldNames } from "../data.js";
import { canAddResult } from "../utils/checkProgramStarted.js";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, CheckCircle2, LayoutList, Upload, ArrowLeft } from "lucide-react";
import * as XLSX from 'xlsx';


function AddResults() {
  const navigate = useNavigate()
  const [checkStarted, setCheckStart] = useState(false)
  const [category, setcategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [teams, setTeams] = useState([])
  const [formData, setFormData] = useState({
    itemId: "",
    firstPlace: [{ name: "", teamId: "" }],
    secondPlace: [{ name: "", teamId: "" }],
    thirdPlace: [{ name: "", teamId: "" }],
  });
  const [isDragging, setIsDragging] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.categoryId && location.state?.itemId) {
      setcategory(location.state.categoryId);
      
      const fetchItemsForCategory = async () => {
        try {
          const response = await getItem(location.state.categoryId);
          setItems(response.data);
          setFormData(prev => ({ ...prev, itemId: location.state.itemId }));
        } catch (error) {
          console.error('Failed to fetch items on edit', error);
        }
      };
      fetchItemsForCategory();
    }
  }, [location.state]);

  useEffect(() => {
    async function fetchData() {
      try {
        const isStarted = await canAddResult(); 
        setCheckStart(isStarted); 
        if (!isStarted) return navigate('/admin'); 
      } catch (error) {
        console.error("Error checking program start status:", error);
      }
    }
    fetchData();
  }, [navigate]);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getCategory();
        setCategories(response.data);
      } catch (error) {
        toast.error('Failed to fetch Category Data.');
      }
    }
    fetchData();
  }, [])

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getTeam();
        setTeams(response.data);
      } catch (error) {
        toast.error('Failed to fetch Team Data.');
      }
    }
    fetchData();
  }, [])

  const handleCategoryChange = async (event) => {
    const selectedCategory = event.target.value;
    setcategory(selectedCategory);
    setFormData(prev => ({ 
      ...prev, 
      itemId: "", 
      firstPlace: [{ name: "", teamId: "" }],
      secondPlace: [{ name: "", teamId: "" }],
      thirdPlace: [{ name: "", teamId: "" }]
    }));

    if (selectedCategory) {
      try {
        toast.loading('Fetching items...');
        const response = await getItem(selectedCategory);
        setItems(response.data);
        toast.dismiss();
      } catch (error) {
        toast.dismiss();
        toast.error('Failed to fetch Item Data.');
        setItems([]);
      }
    } else {
      setItems([]);
    }
  };

  const handleformData = (event) => {
    const { id, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  useEffect(() => {
    async function fetchExisting() {
      if (category && formData.itemId) {
        try {
          toast.loading('Checking for existing result...');
          const response = await getDataServer(formData.itemId, category);
          toast.dismiss();
          
          if (response.success && response.data?.result) {
            const results = response.data.result;
            
            const getWinners = (resultItem, oldKeyName, oldTeamName) => {
                if (resultItem?.winners) {
                  return resultItem.winners.length > 0 
                    ? resultItem.winners.map(w => {
                        let tId = (w.teamId && typeof w.teamId === "object" && w.teamId._id) || w.teamId || "";
                        if (!tId && w.team) {
                          const matchedTeam = teams.find(t => t.teamName.toLowerCase().trim() === w.team.toLowerCase().trim());
                          if (matchedTeam) tId = matchedTeam._id;
                        }
                        return {
                          name: w.name || "",
                          teamId: tId
                        };
                      })
                    : [{ name: "", teamId: "" }];
                }
                if (resultItem?.[oldKeyName]) {
                  const matchedTeam = teams.find(t => t.teamName.toLowerCase().trim() === (resultItem[oldTeamName] || "").toLowerCase().trim());
                  return [{ name: resultItem[oldKeyName], teamId: matchedTeam ? matchedTeam._id : "" }];
                }
                return [{ name: "", teamId: "" }];
            };
            
            setFormData(prev => ({
              ...prev,
              firstPlace: getWinners(results[0], 'firstPrize', 'firstTeam'),
              secondPlace: getWinners(results[1], 'secPrize', 'secTeam'),
              thirdPlace: getWinners(results[2], 'thirdPrize', 'thirdTeam'),
            }));
            toast.success("Existing result loaded for editing");
          } else {
             setFormData(prev => ({
               ...prev,
               firstPlace: [{ name: "", teamId: "" }],
               secondPlace: [{ name: "", teamId: "" }],
               thirdPlace: [{ name: "", teamId: "" }],
             }));
          }
        } catch (error) {
          toast.dismiss();
          console.error("Error fetching result", error);
        }
      }
    }
    fetchExisting();
  }, [formData.itemId, category]);

  const handleWinnerChange = (place, index, field, value) => {
    const updatedPlace = [...formData[place]];
    updatedPlace[index][field] = value;
    setFormData({ ...formData, [place]: updatedPlace });
  };

  const handleTeamChange = (place, index, teamId) => {
    const updatedPlace = [...formData[place]];
    updatedPlace[index].teamId = teamId;
    setFormData({ ...formData, [place]: updatedPlace });
  };

  const addWinner = (place) => {
    setFormData({ ...formData, [place]: [...formData[place], { name: "", teamId: "" }] });
  };

  const removeWinner = (place, index) => {
    const updatedPlace = formData[place].filter((_, i) => i !== index);
    setFormData({ ...formData, [place]: updatedPlace });
  };

  const processExcelFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        let firstPlace = [];
        let secondPlace = [];
        let thirdPlace = [];

        data.forEach(row => {
          const prize = String(row.Prize || row.prize || '').trim();
          const name = String(row.Name || row.name || '').trim();
          const team = String(row.Team || row.team || '').trim();

          if (!name) return;

          const matchedTeam = teams.find(t => t.teamName.toLowerCase().trim() === team.toLowerCase().trim());
          const teamId = matchedTeam ? matchedTeam._id : "";

          const winnerObj = { name, teamId };

          if (prize === '1') {
            firstPlace.push(winnerObj);
          } else if (prize === '2') {
            secondPlace.push(winnerObj);
          } else if (prize === '3') {
            thirdPlace.push(winnerObj);
          }
        });

        if (firstPlace.length === 0) firstPlace.push({ name: "", teamId: "" });
        if (secondPlace.length === 0) secondPlace.push({ name: "", teamId: "" });
        if (thirdPlace.length === 0) thirdPlace.push({ name: "", teamId: "" });

        setFormData(prev => ({
          ...prev,
          firstPlace,
          secondPlace,
          thirdPlace
        }));
        toast.success("Excel data loaded successfully!");
      } catch (error) {
        console.error("Error parsing Excel:", error);
        toast.error("Failed to parse Excel file.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleFileUpload = (e) => {
    processExcelFile(e.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processExcelFile(files[0]);
    }
  };



  const handlesumbit = async (event) => {
    event.preventDefault()

    if (!category || !formData.itemId) {
      toast.error('Please select a Category and an Item.');
      return;
    }

    const postData = {
      categoryId: category,
      ...formData,
    };

    try {
      toast.loading('Publishing Results...');
      const data = await postDataServer(postData);
      toast.dismiss();
      toast.success('Results Published Successfully!');
      setFormData({
        itemId: "",
        firstPlace: [{ name: "", teamId: "" }],
        secondPlace: [{ name: "", teamId: "" }],
        thirdPlace: [{ name: "", teamId: "" }],
      })
    } catch (error) {
      toast.dismiss();
      toast.error(error?.response?.data?.message || 'Failed to publish results');
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 transition-colors outline-none focus:ring-4 bg-white";
  const selectClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-amber-500/20 transition-colors outline-none focus:ring-4 bg-white appearance-none";
  const selectStyle = { backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans relative">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10 flex items-center justify-center"
      >
        <ArrowLeft size={24} className="text-gray-600" />
      </button>
      {checkStarted && (
        <div className="max-w-5xl mx-auto space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 mb-4">
              <Trophy size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 font-heading">Publish Results</h1>
            <p className="text-gray-500 mt-2 text-lg">Announce the winners for an event.</p>
          </motion.div>

          <form onSubmit={handlesumbit} className="space-y-8">
            {/* Event Selection Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <LayoutList size={24} className="text-amber-500" />
                Event Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Category</label>
                  <select
                    value={category}
                    onChange={handleCategoryChange}
                    className={selectClass}
                    style={selectStyle}
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.length > 0 && categories.map((cat) => (
                      <option key={cat?._id} value={cat?._id}>
                        {cat?.categoryName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Item</label>
                  <select
                    id="itemId"
                    value={formData.itemId}
                    onChange={handleformData}
                    className={selectClass}
                    style={selectStyle}
                    disabled={!category}
                    required
                  >
                    <option value="">-- Choose Item --</option>
                    {items.map((item) => (
                      <option key={item._id} value={item?._id}>
                        {item?.itemName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6 border-t border-gray-100 pt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Upload size={16} /> Auto-fill from Excel
                </label>
                <p className="text-xs text-gray-500 mb-3">Upload an .xlsx file with columns: Prize, Name, Team (Prize should be 1, 2, or 3)</p>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative w-full border-2 border-dashed rounded-xl p-8 text-center transition-colors flex flex-col items-center justify-center gap-2
                    ${isDragging ? 'border-amber-500 bg-amber-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400'}
                  `}
                >
                  <Upload size={32} className={isDragging ? 'text-amber-500' : 'text-gray-400'} />
                  <p className="text-sm font-medium text-gray-600">
                    {isDragging ? 'Drop your Excel file here' : 'Drag & drop your Excel file here'}
                  </p>
                  <p className="text-xs text-gray-400">or click to browse</p>
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>

            {/* Prize Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* First Prize */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-b from-amber-50 to-white rounded-3xl shadow-sm border border-amber-100 p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                      <Trophy size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">1st Place</h3>
                      <p className="text-sm text-gray-500 font-medium">Gold Winner(s)</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => addWinner('firstPlace')} className="p-2 bg-amber-100 text-amber-600 hover:bg-amber-200 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                </div>
                
                <div className="space-y-6 relative z-10">
                  {formData.firstPlace.map((winner, index) => (
                    <div key={index} className="space-y-4 p-4 bg-white/60 rounded-2xl border border-amber-100/50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-600">Winner #{index + 1}</span>
                        {formData.firstPlace.length > 1 && (
                          <button type="button" onClick={() => removeWinner('firstPlace', index)} className="text-red-500 hover:text-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Winner Name</label>
                        <input
                          value={winner.name}
                          onChange={(e) => handleWinnerChange('firstPlace', index, 'name', e.target.value)}
                          className={inputClass}
                          type="text"
                          placeholder="Name of participant"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Winner Team</label>
                        <select
                          value={winner.teamId || ""}
                          onChange={(e) => handleTeamChange('firstPlace', index, e.target.value)}
                          className={selectClass}
                          style={selectStyle}
                        >
                          <option value="">-- Choose Team --</option>
                          {teams.map((item) => (
                            <option key={item?._id} value={item?._id}>
                              {item?.teamName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Second Prize */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-b from-gray-100 to-white rounded-3xl shadow-sm border border-gray-200 p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gray-200/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gray-200 text-gray-600 rounded-xl">
                      <Medal size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">2nd Place</h3>
                      <p className="text-sm text-gray-500 font-medium">Silver Winner(s)</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => addWinner('secondPlace')} className="p-2 bg-gray-200 text-gray-600 hover:bg-gray-300 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                </div>
                
                <div className="space-y-6 relative z-10">
                  {formData.secondPlace.map((winner, index) => (
                    <div key={index} className="space-y-4 p-4 bg-white/60 rounded-2xl border border-gray-100/50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-600">Winner #{index + 1}</span>
                        {formData.secondPlace.length > 1 && (
                          <button type="button" onClick={() => removeWinner('secondPlace', index)} className="text-red-500 hover:text-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Winner Name</label>
                        <input
                          value={winner.name}
                          onChange={(e) => handleWinnerChange('secondPlace', index, 'name', e.target.value)}
                          className={inputClass}
                          type="text"
                          placeholder="Name of participant"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Winner Team</label>
                        <select
                          value={winner.teamId || ""}
                          onChange={(e) => handleTeamChange('secondPlace', index, e.target.value)}
                          className={selectClass}
                          style={selectStyle}
                        >
                          <option value="">-- Choose Team --</option>
                          {teams.map((item) => (
                            <option key={item?._id} value={item?._id}>
                              {item?.teamName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Third Prize */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-b from-orange-50 to-white rounded-3xl shadow-sm border border-orange-100 p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
                      <Award size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">3rd Place</h3>
                      <p className="text-sm text-gray-500 font-medium">Bronze Winner(s)</p>
                    </div>
                  </div>
                  <button type="button" onClick={() => addWinner('thirdPlace')} className="p-2 bg-orange-100 text-orange-600 hover:bg-orange-200 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                  </button>
                </div>
                
                <div className="space-y-6 relative z-10">
                  {formData.thirdPlace.map((winner, index) => (
                    <div key={index} className="space-y-4 p-4 bg-white/60 rounded-2xl border border-orange-100/50">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-orange-600">Winner #{index + 1}</span>
                        {formData.thirdPlace.length > 1 && (
                          <button type="button" onClick={() => removeWinner('thirdPlace', index)} className="text-red-500 hover:text-red-700">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/></svg>
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Winner Name</label>
                        <input
                          value={winner.name}
                          onChange={(e) => handleWinnerChange('thirdPlace', index, 'name', e.target.value)}
                          className={inputClass}
                          type="text"
                          placeholder="Name of participant"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Winner Team</label>
                        <select
                          value={winner.teamId || ""}
                          onChange={(e) => handleTeamChange('thirdPlace', index, e.target.value)}
                          className={selectClass}
                          style={selectStyle}
                        >
                          <option value="">-- Choose Team --</option>
                          {teams.map((item) => (
                            <option key={item?._id} value={item?._id}>
                              {item?.teamName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-end pt-4"
            >
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-4 px-12 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-gray-900/20"
              >
                <CheckCircle2 size={24} /> Publish Results
              </button>
            </motion.div>
          </form>
        </div>
      )}
      <Toaster position="top-center" />
    </div>
  );
}

export default AddResults;
