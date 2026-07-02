import React, { useState } from "react";
import { saveLiveLink } from "../api/apiCall";
import toast, { Toaster } from "react-hot-toast";
const LiveUpload = () => {
  const [lives, setLives] = useState([
    { url: null }, // Live 1
    { url: null }, // Live 2
  ]);

  const handleInputChange = (index, value) => {
    const updatedLives = [...lives];
    updatedLives[index].url = value;
    setLives(updatedLives);
  };

   const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await toast.promise(saveLiveLink(lives), {
        loading: "Submitting live links...",
        success: "Live links submitted successfully!",
        error: "Failed to submit live links.",
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
    
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg md:text-2xl w-full  mb-3 font-semibold ">
            Upload Live Link  </h2>
      <form onSubmit={handleSubmit} className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {lives.map((live, index) => (
          <div key={index} className="col-span-1 sm:col-span-2">
            <input
              type="text"
              value={live.url || ""}
              onChange={(e) => handleInputChange(index, e.target.value)}
              placeholder={`YouTube Live ${index + 1} Embeded URL`}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              
            />
          </div>
        ))}

        <div className="col-span-1 sm:col-span-2 flex justify-center mt-4">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold rounded-lg shadow-md hover:from-red-700 hover:to-red-900 transition duration-300"
          >
            💾 Save Changes
          </button>
        </div>
      </form>
    </div>
    <Toaster/>
    </>
  );
};

export default LiveUpload;
