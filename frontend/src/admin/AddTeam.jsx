import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { Trash2, Edit3, PlusCircle, Users, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getTeam, addTeamName, deleteTeam, editTeam } from '../api/apiCall';
import { checkProgramStarted } from '../utils/checkProgramStarted';

const AddTeam = () => {
    const [formState, setFormState] = useState('');
    const [errors, setErrors] = useState('');
    const [teams, setTeams] = useState([]);
    const navigate = useNavigate();

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
    }, []);

    const handlePointChange = (e) => {
        const text = e.target.value;
        setFormState(text);
        if (errors) setErrors('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = formState.trim();
        
        if (trimmed === "") {
            setErrors('Team name is required');
            return;
        }

        const isDuplicate = teams.some((team) => team.teamName.toLowerCase() === trimmed.toLowerCase());
        if (isDuplicate) {
            setErrors('Team Name already exists');
            return;
        }

        try {
            const response = await toast.promise(
                addTeamName(trimmed),
                {
                    loading: 'Adding Team...',
                    success: 'Team added successfully!',
                    error: 'Failed to add Team',
                }
            );

            setTeams((prev) => [response.data, ...prev]);
            setErrors('');
            setFormState('');
        } catch (error) {
            console.error(error.message);
        }
    };

    const handleDeleteTeam = async (id) => {
        if(await checkProgramStarted()) return;

        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#9ca3af",
            confirmButtonText: "Yes, delete it!",
            customClass: {
                popup: "rounded-3xl",
                confirmButton: "rounded-xl",
                cancelButton: "rounded-xl"
            }
        }).then((result) => {
            if (result.isConfirmed) {
                async function remove(id) {
                    const response = await toast.promise(
                        deleteTeam(id),
                        {
                            loading: 'Deleting...',
                            success: "Team Deleted successfully",
                            error: (err) => err.data?.message || 'Failed to delete'
                        }
                    );
                    if (response.success === true) {
                        const filteredData = teams.filter((item) => item._id !== id);
                        setTeams(filteredData);
                    }
                }
                remove(id);
            }
        });
    };

    const handleEditTeam = async (id, currentName, index) => {
        const { value: newName } = await Swal.fire({
            title: "Edit Team Name",
            input: "text",
            inputValue: currentName,
            showCancelButton: true,
            confirmButtonText: "Save Changes",
            confirmButtonColor: "#10b981",
            showLoaderOnConfirm: true,
            customClass: {
                popup: "rounded-3xl",
                input: "rounded-xl border-gray-300 focus:ring-primary focus:border-primary",
                confirmButton: "rounded-xl",
                cancelButton: "rounded-xl"
            },
            inputValidator: (value) => {
                if (!value.trim()) {
                    return "Team name cannot be empty!";
                }
            },
            preConfirm: async (value) => {
                try {
                    const response = await editTeam(id, value.trim());
                    const newTeam = [...teams];
                    newTeam[index] = { ...newTeam[index], teamName: value.trim() };
                    setTeams(newTeam);
                    return response?.data?.message;
                } catch (error) {
                    const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
                    Swal.showValidationMessage(errorMessage);
                }
            }
        });

        if (newName) {
            toast.success('Team updated successfully!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 font-sans relative">
            <button 
                onClick={() => navigate(-1)} 
                className="absolute top-4 left-4 md:top-8 md:left-8 p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors z-10 flex items-center justify-center"
            >
                <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header & Form Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12"
                >
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-600 mb-4">
                            <Users size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 font-heading">Manage Teams</h1>
                        <p className="text-gray-500 mt-2">Create and organize competing teams.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Team Name</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3 rounded-xl border ${errors ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} transition-colors outline-none focus:ring-4`}
                                placeholder="e.g. Red House, Blue House..."
                                value={formState}
                                onChange={handlePointChange}
                            />
                            {errors && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                <span className="iconify" data-icon="mdi:alert-circle-outline"></span> {errors}
                            </p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white py-3.5 px-4 rounded-xl font-semibold transition-colors shadow-sm"
                        >
                            <PlusCircle size={20} /> Add Team
                        </button>
                    </form>
                </motion.div>

                {/* Table Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden"
                >
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Existing Teams</h2>
                        <span className="bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-bold">
                            {teams.length} Teams
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold w-24 text-center">No.</th>
                                    <th className="px-6 py-4 font-semibold">Team Name</th>
                                    <th className="px-6 py-4 font-semibold text-center w-24">Edit</th>
                                    <th className="px-6 py-4 font-semibold text-center w-24">Delete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {teams?.length > 0 ? (
                                    teams.map((item, index) => (
                                        <motion.tr 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={item._id || index} 
                                            className="hover:bg-gray-50 transition-colors group"
                                        >
                                            <td className="px-6 py-4 text-center text-gray-500 font-medium">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-gray-900 font-medium">
                                                {item?.teamName}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleEditTeam(item?._id, item?.teamName, index)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Team"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleDeleteTeam(item?._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Team"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <Users size={32} className="text-gray-300" />
                                                <p>No teams found. Create one above.</p>
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
};

export default AddTeam;
