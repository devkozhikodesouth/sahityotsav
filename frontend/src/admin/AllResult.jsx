import React, { useEffect, useState } from "react";
import { getallresult, deleteResult, togglePublishResult } from "../api/apiCall";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { Search, Trophy, Medal, Award, CheckCircle2, ListChecks, Edit2, Trash2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function AllResult() {
    const [results, setResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [refresh, setRefresh] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await toast.promise(
                    getallresult(),
                    {
                        loading: 'Loading results...',
                        success: "All results fetched successfully",
                        error: (err) => err?.response?.data?.message || err.message || 'Something went wrong'
                    }
                );
                if (response.success === true) {
                    setResults(response.data);
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchData();
    }, [refresh]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this result?")) {
            try {
                toast.loading("Deleting...");
                const res = await deleteResult(id);
                toast.dismiss();
                if (res.success) {
                    toast.success("Result deleted successfully");
                    setRefresh(prev => !prev);
                } else {
                    toast.error(res.message || "Failed to delete result");
                }
            } catch (err) {
                toast.dismiss();
                toast.error("Failed to delete result");
            }
        }
    };

    const handleTogglePublish = async (id) => {
        try {
            toast.loading("Updating status...");
            const res = await togglePublishResult(id);
            toast.dismiss();
            if (res.success) {
                toast.success(res.message);
                setRefresh(prev => !prev);
            } else {
                toast.error(res.message || "Failed to update status");
            }
        } catch (err) {
            toast.dismiss();
            toast.error("Failed to update status");
        }
    };

    const handleEdit = (element) => {
        navigate('/admin/addresult', { 
            state: { 
                categoryId: element.category?._id, 
                itemId: element.item?._id 
            } 
        });
    };

    const getWinners = (resultItem, oldKeyName, oldTeamName) => {
        if (resultItem?.winners) {
            return resultItem.winners.map(w => ({
                ...w,
                team: w.teamId?.teamName || w.team
            }));
        }
        if (resultItem?.[oldKeyName]) return [{ name: resultItem[oldKeyName], team: resultItem[oldTeamName] }];
        return [];
    };

    const filteredResults = results.filter((element) => {
        const query = searchQuery.toLowerCase();
        if (element.category?.categoryName?.toLowerCase().includes(query)) return true;
        if (element.item?.itemName?.toLowerCase().includes(query)) return true;

        const allWinners = [
            ...getWinners(element.result[0], 'firstPrize', 'firstTeam'),
            ...getWinners(element.result[1], 'secPrize', 'secTeam'),
            ...getWinners(element.result[2], 'thirdPrize', 'thirdTeam'),
        ];
        
        return allWinners.some(w => w.name?.toLowerCase().includes(query) || w.team?.toLowerCase().includes(query));
    });

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans relative">
            <button 
                onClick={() => navigate(-1)} 
                className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10 flex items-center justify-center"
            >
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header & Search Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-500/10 text-blue-600">
                                <ListChecks size={28} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 font-heading">Published Results</h1>
                                <p className="text-gray-500 text-sm mt-1">View and search all finalized event results.</p>
                            </div>
                        </div>

                        <div className="relative w-full md:w-96">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search category, item, or winner..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-colors outline-none focus:ring-4 bg-gray-50 text-gray-800"
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Table Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold w-16 text-center">No.</th>
                                    <th className="px-6 py-4 font-semibold">Event Details</th>
                                    <th className="px-6 py-4 font-semibold">First Place <span className="text-amber-500">🏆</span></th>
                                    <th className="px-6 py-4 font-semibold">Second Place <span className="text-gray-400">🥈</span></th>
                                    <th className="px-6 py-4 font-semibold">Third Place <span className="text-orange-400">🥉</span></th>
                                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredResults.length > 0 ? (
                                    filteredResults.map((element, index) => (
                                        <motion.tr 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={index} 
                                            className="hover:bg-gray-50 transition-colors group"
                                        >
                                            <td className="px-6 py-5 text-center text-gray-500 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-gray-900">{element?.item?.itemName}</div>
                                                <div className="text-sm text-gray-500 font-medium">{element?.category?.categoryName}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                {(() => {
                                                    const winners = getWinners(element.result[0], 'firstPrize', 'firstTeam');
                                                    if (winners.length === 0) return <span className="text-gray-300 text-sm italic">Not Awarded</span>;
                                                    return (
                                                        <div className="space-y-2">
                                                            {winners.map((w, i) => (
                                                                <div key={i}>
                                                                    <div className="font-semibold text-gray-900">{w.name}</div>
                                                                    <div className="text-xs text-amber-600 bg-amber-50 inline-block px-2 py-0.5 rounded-full mt-1 border border-amber-100 font-bold">{w.team || "No Team"}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-5">
                                                {(() => {
                                                    const winners = getWinners(element.result[1], 'secPrize', 'secTeam');
                                                    if (winners.length === 0) return <span className="text-gray-300 text-sm italic">Not Awarded</span>;
                                                    return (
                                                        <div className="space-y-2">
                                                            {winners.map((w, i) => (
                                                                <div key={i}>
                                                                    <div className="font-semibold text-gray-900">{w.name}</div>
                                                                    <div className="text-xs text-gray-600 bg-gray-100 inline-block px-2 py-0.5 rounded-full mt-1 border border-gray-200 font-bold">{w.team || "No Team"}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-5">
                                                {(() => {
                                                    const winners = getWinners(element.result[2], 'thirdPrize', 'thirdTeam');
                                                    if (winners.length === 0) return <span className="text-gray-300 text-sm italic">Not Awarded</span>;
                                                    return (
                                                        <div className="space-y-2">
                                                            {winners.map((w, i) => (
                                                                <div key={i}>
                                                                    <div className="font-semibold text-gray-900">{w.name}</div>
                                                                    <div className="text-xs text-orange-600 bg-orange-50 inline-block px-2 py-0.5 rounded-full mt-1 border border-orange-100 font-bold">{w.team || "No Team"}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <div className="flex items-center justify-center gap-3">
                                                    <button 
                                                        onClick={() => handleTogglePublish(element._id)}
                                                        className={`p-2 rounded-lg transition-colors ${element.isPublished !== false ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                        title={element.isPublished !== false ? "Unpublish" : "Publish"}
                                                    >
                                                        {element.isPublished !== false ? <Eye size={18} /> : <EyeOff size={18} />}
                                                    </button>
                                                    <button 
                                                        onClick={() => handleEdit(element)}
                                                        className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(element._id)}
                                                        className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-16 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Search size={32} className="text-gray-300" />
                                                <p className="text-lg">No results found matching your search.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>
            <Toaster position="top-center" />
        </div>
    );
}

export default AllResult;
