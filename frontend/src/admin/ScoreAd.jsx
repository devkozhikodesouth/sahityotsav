import React, { useEffect, useState } from 'react';
import { getTeamPoint, scoreData } from '../api/apiCall';
import toast, { Toaster } from 'react-hot-toast';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, TrendingUp, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ScoreAd = () => {
  const [formState, setFormState] = useState({});
  const [errors, setErrors] = useState({});
  const [teams, setTeams] = useState([]);
  const [afterCount, setAfterCount] = useState(100);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      const toastId = toast.loading('Loading Team Data...');
      try {
        const response = await getTeamPoint();
        toast.dismiss(toastId);

        if (response?.success) {
          toast.success('Team data loaded successfully!');
          setTeams(response?.data?.sortedResults || []);
          setAfterCount(response?.data?.afterCount || 100);
        } else {
          toast.error(response?.message || 'Failed to load team data');
        }
      } catch (error) {
        toast.dismiss(toastId);
        console.error(error.message);
        toast.error('Something went wrong');
      }
    }
    fetchData();
  }, []);

  const handlePointChange = (e, index) => {
    const points = parseInt(e.target.value, 10) || 0;
    const updateTeams = [...teams];
    updateTeams[index] = { ...updateTeams[index], point: points };
    setTeams(updateTeams);
    
    if (errors[index]) {
      const updateerror = { ...errors };
      delete updateerror[index];
      setErrors(updateerror);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    teams.forEach((item, index) => {
      if (item.point === null || item.point === undefined || item.point === '') {
        newErrors[index] = 'Points are required';
        isValid = false;
      } else if (item.point < 0) {
        newErrors[index] = 'Points cannot be negative';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors before submitting.');
      return;
    }

    toast.loading('Publishing scores...');
    try {
      const response = await scoreData(teams, afterCount);
      toast.dismiss();

      if (response?.message === true || response?.success) {
        toast.success('Scores added successfully');
      } else {
        toast.error('Failed to add scores');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to add scores');
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors outline-none focus:ring-4 bg-gray-50 text-gray-800 font-bold text-lg";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans relative">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10 flex items-center justify-center"
      >
        <ArrowLeft size={24} className="text-gray-600" />
      </button>
      {teams.length > 0 ? (
        <div className="max-w-4xl mx-auto space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/10 text-blue-600 mb-4">
              <TrendingUp size={32} />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 font-heading">Manage Team Points</h1>
            <p className="text-gray-500 mt-2 text-lg">Update total scores for all competing teams.</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* After Count Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[2rem] shadow-sm border border-blue-100 p-8"
            >
              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex-1">
                  <label className="block text-lg font-bold text-gray-900 mb-2">Publish After Count</label>
                  <p className="text-sm text-gray-600 mb-4 flex items-start gap-2">
                    <Info size={16} className="mt-0.5 text-blue-500 shrink-0" />
                    Enter the threshold result count. If entering the final overall result, set this to 10001.
                  </p>
                  <input
                    type="number" 
                    className="w-full md:w-1/2 px-4 py-3 rounded-xl border border-blue-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors outline-none focus:ring-4 bg-white font-bold"
                    placeholder="Enter result count"
                    value={afterCount}
                    onChange={(e) => setAfterCount(e.target.value)}
                  />
                </div>
              </div>
            </motion.div>

            {/* Team Points Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8"
            >
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Trophy size={24} className="text-amber-500" />
                Team Scores
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {teams.map((item, index) => (
                  <div key={item?.team?.teamName || index} className="p-5 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                      {item.team?.teamName}
                    </label>
                    <input
                      type="number"
                      className={`${inputClass} ${errors[index] ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-red-50 text-red-900' : ''}`}
                      placeholder="0"
                      value={item?.point ?? ''}
                      onChange={(e) => handlePointChange(e, index)}
                    />
                    {errors[index] && (
                      <p className="text-red-500 text-sm font-medium mt-2">{errors[index]}</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-end pt-4"
            >
              <button
                type="submit"
                className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-4 px-12 rounded-xl font-bold text-lg transition-colors shadow-lg shadow-gray-900/20 w-full md:w-auto"
              >
                <CheckCircle2 size={24} /> Publish Scores
              </button>
            </motion.div>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          <div className="w-64 h-64 opacity-50">
            <DotLottieReact
              src="https://lottie.host/6eaf6b37-b15c-4d93-ab32-71ffab3ab2da/ofCIP0ePup.lottie"
              loop
              autoplay
            />
          </div>
          <p className="text-gray-400 font-medium mt-4">Waiting for team data...</p>
        </div>
      )}
      <Toaster position="top-center" />
    </div>
  );
};

export default ScoreAd;
