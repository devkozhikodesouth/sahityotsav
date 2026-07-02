import React from 'react'
import { resetProgram, startProgram,stopProgram } from '../api/apiCall';
import Swal from "sweetalert2";
import { steps } from '../data';
import toast, { Toaster } from 'react-hot-toast';
import UnderFooter from '../components/Footer';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function StartProgram() {
      const navigate = useNavigate();

      async function handleStartButtton() {
        toast.loading('Starting...')
        const isStart = await startProgram();
        toast.dismiss()
        if (isStart.success) {
          Swal.fire({
            icon: "success",
            title: "Program Started Successfully",
            text: "You can now begin using the website.",
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Failed to Start Program",
            text: isStart.message || "An unexpected error occurred.",
          });
        }
      }
async function handleStopButtton() {
  const confirmResult = await Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to stop the program?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, stop it!",
    cancelButtonText: "Cancel",
  });

  if (confirmResult.isConfirmed) {
     toast.loading('Stoping...')
    const isStart = await stopProgram();
    toast.dismiss()
    if (isStart.success) {
      Swal.fire({
        icon: "success",
        title: "Program Stopped Successfully",
        text: "You can make changes.",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed to Stop Program",
        text: isStart.message || "An unexpected error occurred.",
      });
    }
  }
}
async function handleRestButtton() {
  const confirmResult = await Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to reset the program?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, stop it!",
    cancelButtonText: "Cancel",
  });

  if (confirmResult.isConfirmed) {
     toast.loading('Resetting...')
    const isStart = await resetProgram();
    toast.dismiss()
    if (isStart.success) {
      Swal.fire({
        icon: "success",
        title: "Program Reset Successfully",
        text: "You can now begin using the website.",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Failed to Stop Program",
        text: isStart.message || "An unexpected error occurred.",
      });
    }
  }
}

    
      return (
        <>
       <div>
         <div className="md:max-w-xl md:mx-auto mx-5 p-6 bg-blue-100 rounded mt-5 shadow-md">
          <h2 className="text-2xl font-bold mb-4 text-center">How to Start Using Our Website</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            {steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
        <div className="w-full flex flex-col sm:flex-row justify-center mb-20 mt-10 gap-3 sm:gap-4 px-8">
  <button
    className="bg-green-400 hover:bg-green-500 focus:outline-none focus:ring-4 focus:ring-green-300 px-6 py-2 sm:px-10 sm:py-2 rounded text-lg sm:text-2xl text-white transition duration-300"
    onClick={() => handleStartButtton()}
  >
    Start
  </button>
  <button
    className="bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-300 px-6 py-2 sm:px-10 sm:py-2 rounded text-lg sm:text-2xl text-white transition duration-300"
    onClick={() => handleStopButtton()}
  >
    Stop
  </button>
  <button
    className="bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-4 focus:ring-red-300 px-6 py-2 sm:px-10 sm:py-2 rounded text-lg sm:text-2xl text-white transition duration-300"
    onClick={() => handleRestButtton()}
  >
    Reset
  </button>
</div>


       </div>
      
       <Toaster/>
       </>
      );
    };

export default StartProgram

