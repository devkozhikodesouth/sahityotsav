import React, { useState, useEffect, useMemo } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Play, 
  Search, 
  MapPin, 
  Layers, 
  SlidersHorizontal, 
  Award, 
  Info,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { getProxySchedule } from "../api/apiCall";
import toast from "react-hot-toast";

export default function Schedule({ bgColor = "bg-background" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scheduleData, setScheduleData] = useState({ timezone: "Asia/Kolkata", stages: [], schedule: [] });

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStage, setSelectedStage] = useState("All");
  const [selectedDate, setSelectedDate] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  useEffect(() => {
    async function fetchSchedule() {
      try {
        setLoading(true);
        const res = await getProxySchedule();
        if (res && res.status === 200 && res.data) {
          setScheduleData(res.data);
          
          // Automatically pick first date as default if available
          if (res.data.schedule && res.data.schedule.length > 0) {
            const dates = Array.from(new Set(res.data.schedule.map(item => item.date))).sort();
            if (dates.length > 0) {
              setSelectedDate(dates[0]);
            }
          }
        } else {
          throw new Error(res.msg || "Failed to fetch event schedule.");
        }
      } catch (err) {
        console.error("Error loading schedule:", err);
        setError(err.message || "Failed to connect to the schedule server.");
      } finally {
        setLoading(false);
      }
    }
    fetchSchedule();
  }, []);

  // Utility to calculate duration from start and end time
  const getDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";
    try {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      
      let diffMins = (endH * 60 + endM) - (startH * 60 + startM);
      if (diffMins < 0) diffMins += 24 * 60; // handle overnight transition
      
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      
      return hours > 0 
        ? `${hours}h ${mins > 0 ? mins + "m" : ""}`
        : `${mins} mins`;
    } catch {
      return "N/A";
    }
  };

  // Memoized unique dates, categories, and types in the master list
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(scheduleData.schedule.map(item => item.date)));
    return dates.sort();
  }, [scheduleData.schedule]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(scheduleData.schedule.map(item => item.category))).filter(Boolean);
  }, [scheduleData.schedule]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(scheduleData.schedule.map(item => item.type))).filter(Boolean);
  }, [scheduleData.schedule]);

  // Memoized calculations for metrics
  const metrics = useMemo(() => {
    const total = scheduleData.schedule.length;
    const completed = scheduleData.schedule.filter(item => item.status === "Completed").length;
    const live = scheduleData.schedule.filter(item => item.status === "In Progress").length;
    const upcoming = scheduleData.schedule.filter(item => item.status === "Upcoming").length;
    return { total, completed, live, upcoming };
  }, [scheduleData.schedule]);

  // Clean formatted date helper
  const formatDateLabel = (dateStr) => {
    if (!dateStr || dateStr === "All") return "All Dates";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" });
    } catch {
      return dateStr;
    }
  };

  // Filter schedule items based on selected criteria
  const filteredSchedule = useMemo(() => {
    return scheduleData.schedule.filter(item => {
      const matchesSearch = !searchQuery || 
        item.competitionName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.competitionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStage = selectedStage === "All" || item.stageName === selectedStage;
      const matchesDate = selectedDate === "All" || item.date === selectedDate;
      const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
      const matchesType = selectedType === "All" || item.type === selectedType;
      const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;

      return matchesSearch && matchesStage && matchesDate && matchesCategory && matchesType && matchesStatus;
    });
  }, [scheduleData.schedule, searchQuery, selectedStage, selectedDate, selectedCategory, selectedType, selectedStatus]);

  if (loading) {
    return (
      <section id="schedule" className={`py-12 px-4 md:px-8 max-w-7xl mx-auto w-full flex flex-col justify-center items-center min-h-[400px]`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        <p className="mt-4 text-primary font-heading font-medium tracking-wide">Loading event schedule...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="schedule" className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex flex-col items-center justify-center text-center shadow-sm">
          <Info className="w-12 h-12 text-rose-600 mb-3" />
          <h3 className="text-lg font-heading font-bold mb-1">Could Not Load Schedule</h3>
          <p className="text-sm max-w-md mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition"
          >
            Retry Loading
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="schedule" className="py-12 px-4 md:px-8 max-w-7xl mx-auto w-full transition-all">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-accent/20 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-accent tracking-widest uppercase">
            <Calendar className="w-4 h-4" />
            <span>Timeline Overview</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-heading font-black text-primary uppercase tracking-tight">
            Event Schedule
          </h2>
          <p className="text-xs text-primary/70 mt-1 flex items-center gap-1 font-mono">
            <span>Timezone:</span>
            <span className="font-bold text-accent">{scheduleData.timezone || "Asia/Kolkata"}</span>
          </p>
        </div>
        
        {/* Total stages count and total comps counts */}
        <div className="flex gap-3 text-start">
          <div className="bg-surface/85 backdrop-blur-md px-4 py-2 rounded-xl border border-accent/20 shadow-sm flex flex-col justify-center min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-primary/50 tracking-wider">Total Stages</span>
            <span className="text-xl font-black text-primary font-mono">{scheduleData.stages.length || 0}</span>
          </div>
          <div className="bg-surface/85 backdrop-blur-md px-4 py-2 rounded-xl border border-accent/20 shadow-sm flex flex-col justify-center min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-primary/50 tracking-wider">Competitions</span>
            <span className="text-xl font-black text-primary font-mono">{metrics.total}</span>
          </div>
        </div>
      </div>

      {/* 2. Stats Dashboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Live Card */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-heading font-bold text-amber-800 uppercase tracking-wider">Live Now</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-700 font-mono">{metrics.live}</span>
            <span className="text-xs text-amber-600 font-medium">running</span>
          </div>
        </div>

        {/* Completed Card */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-heading font-bold text-emerald-800 uppercase tracking-wider">Completed</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-700 font-mono">{metrics.completed}</span>
            <span className="text-xs text-emerald-600 font-medium">finished</span>
          </div>
        </div>

        {/* Upcoming Card */}
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-heading font-bold text-rose-800 uppercase tracking-wider">Upcoming</span>
            <Clock className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-700 font-mono">{metrics.upcoming}</span>
            <span className="text-xs text-rose-600 font-medium">queued</span>
          </div>
        </div>

        {/* Filtered Card */}
        <div className="bg-primary/5 border border-accent/20 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-heading font-bold text-primary/70 uppercase tracking-wider">Matched</span>
            <TrendingUp className="w-4 h-4 text-accent" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-primary font-mono">{filteredSchedule.length}</span>
            <span className="text-xs text-primary/60 font-medium">showing</span>
          </div>
        </div>
      </div>

      {/* 3. Search and Sticky Quick Filters */}
      <div className="bg-surface/85 backdrop-blur-md rounded-2xl border border-accent/30 shadow-sm p-4 mb-6 sticky top-[80px] z-30 transition-all">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          
          {/* Main Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
            <input
              type="text"
              placeholder="Search competition, chest number, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-accent/30 rounded-xl text-primary text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all font-heading"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold tracking-wide uppercase transition-all font-heading w-full md:w-auto ${
                showFiltersPanel || selectedCategory !== "All" || selectedType !== "All" || selectedStatus !== "All"
                  ? "bg-accent/15 border-accent text-primary" 
                  : "bg-background border-accent/30 text-primary/75 hover:bg-surface"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4 text-accent" />
              <span>Filters</span>
            </button>
            
            {/* Clear Filters helper */}
            {(searchQuery || selectedStage !== "All" || selectedDate !== "All" || selectedCategory !== "All" || selectedType !== "All" || selectedStatus !== "All") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedStage("All");
                  setSelectedCategory("All");
                  setSelectedType("All");
                  setSelectedStatus("All");
                  if (uniqueDates.length > 0) setSelectedDate(uniqueDates[0]);
                }}
                className="px-4 py-2.5 text-xs font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition font-heading tracking-wide uppercase whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showFiltersPanel && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-accent/25 animate-fadeIn">
            {/* Category Filter */}
            <div>
              <label className="block text-[10px] font-bold text-primary/50 uppercase tracking-wider mb-1 font-heading">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-background border border-accent/20 rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="All">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-[10px] font-bold text-primary/50 uppercase tracking-wider mb-1 font-heading">Competition Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-background border border-accent/20 rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="All">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[10px] font-bold text-primary/50 uppercase tracking-wider mb-1 font-heading">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-background border border-accent/20 rounded-xl px-3 py-2 text-xs text-primary focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="In Progress">Live Now</option>
                <option value="Upcoming">Upcoming</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 4. Sticky Date Picker Navigation Bar */}
      {uniqueDates.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide sticky top-[148px] z-20 bg-background/95 py-2">
          {uniqueDates.map(dateStr => {
            const isActive = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold font-heading whitespace-nowrap border shadow-sm transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-primary text-surface border-accent shadow-md translate-y-[-1px]"
                    : "bg-surface/80 border-accent/20 text-primary/75 hover:bg-surface hover:border-accent/40"
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 ${isActive ? "text-accent" : "text-primary/55"}`} />
                <span>{formatDateLabel(dateStr)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 5. Horizontal Stage Filters */}
      {scheduleData.stages.length > 0 && (
        <div className="flex gap-1.5 overflow-x-auto pb-4 mb-6 scrollbar-hide border-b border-accent/10">
          <button
            onClick={() => setSelectedStage("All")}
            className={`px-4 py-2 rounded-xl text-xs font-heading font-medium tracking-wide uppercase transition-all whitespace-nowrap ${
              selectedStage === "All"
                ? "bg-accent/20 text-primary border border-accent/40 font-bold"
                : "bg-surface/30 border border-transparent text-primary/70 hover:bg-surface/50"
            }`}
          >
            All Stages ({scheduleData.schedule.length})
          </button>
          
          {scheduleData.stages.map(stage => {
            const count = scheduleData.schedule.filter(item => item.stageName === stage.name).length;
            const isActive = selectedStage === stage.name;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.name)}
                className={`px-4 py-2 rounded-xl text-xs font-heading font-medium tracking-wide uppercase transition-all whitespace-nowrap border ${
                  isActive
                    ? "bg-accent/20 border-accent text-primary font-bold shadow-sm"
                    : "bg-surface/30 border-transparent text-primary/70 hover:bg-surface/50 hover:border-accent/20"
                }`}
              >
                {stage.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* 6. Timeline List Layout */}
      {filteredSchedule.length === 0 ? (
        /* Empty State */
        <div className="bg-surface/50 border border-accent/20 rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <Info className="w-12 h-12 text-primary/30 mb-3" />
          <h3 className="text-lg font-heading font-bold text-primary mb-1">No Matches Found</h3>
          <p className="text-sm text-primary/60 max-w-sm">
            Try adjusting your search queries or clearing active filters to view the full schedule layout.
          </p>
        </div>
      ) : (
        <div className="relative border-l-2 border-accent/20 pl-4 md:pl-6 ml-3 space-y-6">
          {filteredSchedule.map((item, idx) => {
            const duration = getDuration(item.startTime, item.endTime);
            const isLive = item.status === "In Progress";
            const isCompleted = item.status === "Completed";
            
            // Get Status specific design classes (completed=green, live=yellow, upcoming=red)
            let statusBadgeClass = "";
            let statusCardClass = "bg-surface/85 border-accent/20 shadow-sm hover:border-accent/40";
            let statusDotClass = "";
            let statusText = "";

            if (isCompleted) {
              statusText = "Completed";
              statusDotClass = "bg-emerald-500";
              statusBadgeClass = "bg-emerald-100 text-emerald-800 border-emerald-200";
            } else if (isLive) {
              statusText = "Live Now";
              statusDotClass = "bg-amber-500 animate-pulse";
              statusBadgeClass = "bg-amber-100 text-amber-800 border-amber-200 font-bold";
              statusCardClass = "bg-amber-500/5 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/20";
            } else {
              statusText = "Upcoming";
              statusDotClass = "bg-rose-500";
              statusBadgeClass = "bg-rose-100 text-rose-800 border-rose-200";
            }

            return (
              <div key={item.competitionId} className="relative group transition-all">
                {/* Timeline node dot indicator */}
                <span className={`absolute -left-[25px] md:-left-[33px] top-5 flex h-4.5 w-4.5 rounded-full border-4 border-background items-center justify-center shadow-sm ${
                  isLive ? "bg-amber-500 scale-110" : isCompleted ? "bg-emerald-600" : "bg-rose-500"
                }`}>
                  {isLive && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  )}
                </span>

                {/* Competition Card */}
                <div className={`p-5 rounded-2xl border transition-all ${statusCardClass}`}>
                  
                  {/* Card Header metadata */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase font-mono tracking-widest px-2 py-0.5 rounded border ${statusBadgeClass}`}>
                        {statusText}
                      </span>
                      {isLive && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase tracking-wider animate-pulse">
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>Pulsing Live</span>
                        </span>
                      )}
                    </div>
                    
                    {/* Timing and duration */}
                    <div className="flex items-center gap-2 text-xs font-bold text-primary/60 font-mono">
                      <Clock className="w-3.5 h-3.5 text-accent" />
                      <span>{item.startTime} - {item.endTime}</span>
                      <span className="text-[10px] bg-primary/5 px-1.5 py-0.5 rounded font-medium">({duration})</span>
                    </div>
                  </div>

                  {/* Competition title */}
                  <h4 className="text-lg font-heading font-black text-primary group-hover:text-accent transition-colors leading-snug">
                    {item.competitionName}
                  </h4>

                  {/* Metadata footer strip */}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-4 pt-3 border-t border-accent/10 text-xs text-primary/75">
                    
                    {/* Category */}
                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-accent" />
                      <span className="font-semibold">{item.category}</span>
                      <span className="text-primary/30 font-light">•</span>
                      <span className="text-primary/60 font-medium">{item.type}</span>
                    </div>

                    {/* Stage Name */}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <MapPin className="w-3.5 h-3.5 text-accent" />
                      <span className="font-heading font-bold uppercase tracking-wider text-[10px] text-accent bg-accent/10 px-2.5 py-0.5 rounded-full">
                        {item.stageName}
                      </span>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
