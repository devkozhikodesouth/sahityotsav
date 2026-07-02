import Swal from "sweetalert2";
import { checkforResult, checkStartProgram } from "../api/apiCall";



export const checkProgramStarted = async () => {
  try {
    
    const response = await checkStartProgram();


    if (response?.success) {
      await Swal.fire({
        icon: "warning",
        title: "Program is Started",
        text: "You cannot make any changes now.",
      });
    }

    return response?.success;
  } catch (error) {
    console.error("Program check failed:", error);
    await Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to check program status.",
    });
    return { success: false };
  }
};

export const canAddResult = async () => {
    try {
      
      const response = await checkforResult();

  
      if (!response?.success) {
        await Swal.fire({
          icon: "warning",
          title: "Program Not Started",
          text: "Please start the program",
        });
      }
      return response?.success;
    } catch (error) {
      console.error("Program check failed:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to check program status.",
      });
      return { success: true };
    }
  };
  