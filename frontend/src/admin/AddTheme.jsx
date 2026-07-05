import React, { useEffect, useState } from 'react'
import { addDescription, getDescription } from '../api/apiCall'
import toast, { Toaster } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Quote, Save } from 'lucide-react'

function AddTheme() {
  const [description, setDescription] = useState('')
  const maxLength = 10000 

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getDescription()
        setDescription(response?.data || '')
      } catch (error) {
        console.error(error.message)
      }
    }
    fetchData()
  }, [])

  async function handleSaveDescription() {
    try {
      const response = await toast.promise(
        addDescription(description),
        {
          loading: 'Saving theme...',
          success: 'Theme description saved successfully!',
          error: 'Failed to save description.',
        }
      )
      setDescription(response.data) // fallback
    } catch (error) {
      console.error('Save failed:', error)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 max-w-6xl mx-auto w-full mt-10"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Quote size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-heading">Event Theme</h2>
            <p className="text-gray-500 text-sm">Update the main theme description shown on the homepage.</p>
          </div>
        </div>

        <div className="relative w-full">
          <textarea
            className="w-full h-48 rounded-xl border border-gray-200 px-5 py-4 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all resize-none shadow-inner bg-gray-50 text-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Type the event theme description here..."
            maxLength={maxLength}
          ></textarea>

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm font-medium text-gray-400">
              <span className={description?.length > maxLength * 0.9 ? "text-red-500" : ""}>
                {description?.length || 0}
              </span> / {maxLength}
            </span>
            <button
              onClick={handleSaveDescription}
              className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-gray-900/20"
            >
              <Save size={20} /> Save Theme
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AddTheme;
