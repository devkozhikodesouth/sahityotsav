import React, { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import { Trash2, Edit3, PlusCircle, LayoutList, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { addItem, deleteItem, editItem, getCategory, getItem } from '../api/cateGoryAnditem';
import { checkProgramStarted } from '../utils/checkProgramStarted';

const AddItem = () => {
    const [formState, setFormState] = useState('');
    const [errors, setErrors] = useState('');
    const [category, setCategory] = useState([]);
    const [itemList, setItemList] = useState([]);
    const [selectedCate, setSelectedcate] = useState('');
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

    const handleCategoryChange = async (e) => {
        const selectedCategory = e.target.value;
        setSelectedcate(selectedCategory);
        if (errors) setErrors('');

        if (selectedCategory) {
            try {
                toast.loading('Fetching items...');
                const response = await getItem(selectedCategory);
                setItemList(response.data);
                toast.dismiss();
            } catch (error) {
                toast.dismiss();
                toast.error('Failed to fetch Item Data.');
                setItemList([]);
            }
        } else {
            setItemList([]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const trimmed = formState.trim();
        if (trimmed === "") {
            setErrors('Item name is required');
            return;
        }
        
        if (!selectedCate) {
            setErrors('Category is required');
            return;
        }

        const isDuplicate = itemList.some((item) => item?.itemName.toLowerCase() === trimmed.toLowerCase());
        if (isDuplicate) {
            setErrors('Item Name already exists in this category');
            return;
        }

        try {
            const response = await toast.promise(
                addItem(selectedCate, trimmed),
                {
                    loading: 'Adding Item...',
                    success: 'Item added successfully!',
                    error: 'Failed to add Item',
                }
            );

            setItemList((prev) => [response.data, ...prev]);
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
                        deleteItem(id),
                        {
                            loading: 'Deleting...',
                            success: "Item Deleted successfully",
                            error: (err) => err.data?.message || 'Failed to delete'
                        }
                    );
                    if (response.success === true) {
                        const filteredData = itemList.filter((item) => item._id !== id);
                        setItemList(filteredData);
                    }
                }
                remove(id);
            }
        });
    };

    const handleEditItem = async (id, currentName, index) => {
        const { value: newName } = await Swal.fire({
            title: "Edit Item Name",
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
                    return "Item name cannot be empty!";
                }
            },
            preConfirm: async (value) => {
                try {
                    const response = await editItem(id, value.trim(), selectedCate);
                    const newItemList = [...itemList];
                    newItemList[index] = { ...newItemList[index], itemName: value.trim() };
                    setItemList(newItemList);
                    return response?.data?.message;
                } catch (error) {
                    const errorMessage = error.response?.data?.message || error.message || "Something went wrong";
                    Swal.showValidationMessage(errorMessage);
                }
            }
        });

        if (newName) {
            toast.success('Item updated successfully!');
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
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/10 text-teal-600 mb-4">
                            <LayoutList size={28} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 font-heading">Manage Items</h1>
                        <p className="text-gray-500 mt-2">Create items under specific categories.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Category</label>
                            <select
                                onChange={handleCategoryChange}
                                value={selectedCate}
                                className={`w-full px-4 py-3 rounded-xl border ${errors && !selectedCate ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} transition-colors outline-none focus:ring-4 bg-white text-gray-800 font-medium appearance-none`}
                                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0.5rem center", backgroundRepeat: "no-repeat", backgroundSize: "1.5em 1.5em", paddingRight: "2.5rem" }}
                            >
                                <option value="">-- Choose Category --</option>
                                {category.map((cat) => (
                                    <option key={cat?._id} value={cat?._id}>
                                        {cat?.categoryName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name</label>
                            <input
                                type="text"
                                className={`w-full px-4 py-3 rounded-xl border ${errors && selectedCate ? 'border-red-400 focus:ring-red-100' : 'border-gray-200 focus:border-primary focus:ring-primary/20'} transition-colors outline-none focus:ring-4`}
                                placeholder="e.g. Essay Writing, Elocution..."
                                value={formState}
                                onChange={handlePointChange}
                                disabled={!selectedCate}
                            />
                            {errors && <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                <span className="iconify" data-icon="mdi:alert-circle-outline"></span> {errors}
                            </p>}
                        </div>

                        <button
                            type="submit"
                            disabled={!selectedCate}
                            className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 px-4 rounded-xl font-semibold transition-colors shadow-sm"
                        >
                            <PlusCircle size={20} /> Add Item
                        </button>
                    </form>
                </motion.div>

                {/* Table Section */}
                {selectedCate && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden"
                    >
                        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                Items in Category
                            </h2>
                            <span className="bg-teal-100 text-teal-800 text-xs px-3 py-1 rounded-full font-bold">
                                {itemList.length} Items
                            </span>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 font-semibold w-24 text-center">No.</th>
                                        <th className="px-6 py-4 font-semibold">Item Name</th>
                                        <th className="px-6 py-4 font-semibold text-center w-24">Edit</th>
                                        <th className="px-6 py-4 font-semibold text-center w-24">Delete</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {itemList?.length > 0 ? (
                                        itemList.map((item, index) => (
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
                                                    {item?.itemName}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => handleEditItem(item?._id, item?.itemName, index)}
                                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Item"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button 
                                                        onClick={() => handleDeleteTeam(item?._id)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Item"
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
                                                    <LayoutList size={32} className="text-gray-300" />
                                                    <p>No items found in this category.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}
            </div>
            <Toaster position="top-center" />
        </div>
    );
};

export default AddItem;
