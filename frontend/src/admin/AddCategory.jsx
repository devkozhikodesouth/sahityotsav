import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { Trash2, Edit3, PlusCircle, Layers, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addCategory, deleteCategory, editCategory, getCategory } from '../api/cateGoryAnditem';
import { checkProgramStarted } from '../utils/checkProgramStarted';

const AddCategory = () => {
    const [formState, setFormState] = useState('');
    const [errors, setErrors] = useState('');
    const [category, setCategory] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await getCategory();
                setCategory(response.data);
            } catch (error) {
                toast.error('Failed to fetch Category Data.');
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
            setErrors('Category name is required');
            return;
        }

        const isDuplicate = category.some((cate) => cate?.categoryName.toLowerCase() === trimmed.toLowerCase());
        if (isDuplicate) {
            setErrors('Category Name already exists');
            return;
        }

        try {
            const response = await toast.promise(
                addCategory(trimmed),
                {
                    loading: 'Adding Category...',
                    success: 'Category added successfully!',
                    error: 'Failed to add Category',
                }
            );

            setCategory((prev) => [response.data, ...prev]);
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
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    toast.loading('Deleting...');
                    const response = await deleteCategory(id);
                    toast.dismiss();

                    if (response?.success === true) {
                        toast.success('Category deleted successfully');
                        const filteredData = category.filter(item => item._id !== id);
                        setCategory(filteredData);
                    } else {
                        const errorMessage = response?.message;
                        if (errorMessage === "This category added items") {
                            Swal.fire({
                                title: "Deletion Failed!",
                                text: "This category is already used in an item. Please delete that item first.",
                                icon: "warning",
                                customClass: { popup: "rounded-3xl", confirmButton: "rounded-xl" }
                            });
                        } else {
                            toast.error(errorMessage || 'Failed to delete category');
                        }
                    }
                } catch (err) {
                    toast.dismiss();
                    const errorMessage = err?.response?.data?.message;
                    if (errorMessage === "This category added items") {
                        Swal.fire({
                            title: "Deletion Failed!",
                            text: "This category is already used in an item. Please delete that item first.",
                            icon: "warning",
                            customClass: { popup: "rounded-3xl", confirmButton: "rounded-xl" }
                        });
                    } else {
                        Swal.fire({
                            title: "Error!",
                            text: errorMessage || "Something went wrong!",
                            icon: "error",
                            customClass: { popup: "rounded-3xl", confirmButton: "rounded-xl" }
                        });
                    }
                }
            }
        });
    };

    const handleEditTeam = async (id, currentName, index) => {
        const { value: newName } = await Swal.fire({
            title: "Edit Category Name",
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
                    return "Category name cannot be empty!";
                }
            },
            preConfirm: async (value) => {
                try {
                    const response = await editCategory(id, value.trim());
                    const newCategory = [...category];
                    newCategory[index] = { ...newCategory[index], categoryName: value.trim() };
                    setCategory(newCategory);
                    return response?.data?.message;
                } catch (error) {
                    const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
                    Swal.showValidationMessage(errorMessage);
                }
            }
        });

        if (newName) {
            toast.success('Category updated successfully!');
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
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                            <Layers size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 font-heading">Manage Categories</h1>
                        <p className="text-gray-500 mt-2">Create and organize event categories.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3 rounded-xl border ${errors ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} transition-colors outline-none focus:ring-4`}
                                placeholder="e.g. Sub Junior, General..."
                                value={formState}
                                onChange={handlePointChange}
                            />
                            {errors && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                <span className="iconify" data-icon="mdi:alert-circle-outline"></span> {errors}
                            </p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white py-3.5 px-4 rounded-xl font-semibold transition-colors shadow-sm"
                        >
                            <PlusCircle size={20} /> Add Category
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
                    <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
                        <h2 className="text-xl font-bold text-gray-800">Existing Categories</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold w-24 text-center">No.</th>
                                    <th className="px-6 py-4 font-semibold">Category Name</th>
                                    <th className="px-6 py-4 font-semibold text-center w-24">Edit</th>
                                    <th className="px-6 py-4 font-semibold text-center w-24">Delete</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {category?.length > 0 ? (
                                    category.map((item, index) => (
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
                                                {item?.categoryName}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleEditTeam(item?._id, item?.categoryName, index)}
                                                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Category"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button 
                                                    onClick={() => handleDeleteTeam(item?._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Category"
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
                                                <Layers size={32} className="text-gray-300" />
                                                <p>No categories found. Create one above.</p>
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

export default AddCategory;
