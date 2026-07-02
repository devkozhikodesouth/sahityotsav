import React, { createContext, useState, useEffect } from "react";
import axiosInstance, { setAccessToken } from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, username, role }
  const [currentFestival, setCurrentFestival] = useState(null); // Active festival settings
  const [loading, setLoading] = useState(true);

  // Restore session and load active festival config on mount
  useEffect(() => {
    const restoreSession = async () => {
      // 1. Fetch default active festival
      try {
        const festRes = await axiosInstance.get("/auth/active-festival");
        if (festRes.data.success && festRes.data.data) {
          setCurrentFestival(festRes.data.data);
          localStorage.setItem("publicFestivalId", festRes.data.data._id);
          localStorage.setItem("selectedFestival", festRes.data.data._id);
        }
      } catch (err) {
        console.error("Failed to resolve default festival:", err);
      }

      const wasLoggedIn = localStorage.getItem("wasLoggedIn") === "true";
      if (!wasLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.post("/auth/refresh");
        if (response.data.success) {
          setAccessToken(response.data.accessToken);
          setUser(response.data.user);
          localStorage.setItem("wasLoggedIn", "true");
        } else {
          localStorage.removeItem("wasLoggedIn");
        }
      } catch {
        localStorage.removeItem("wasLoggedIn");
      } finally {
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post("/auth/login", {
        username,
        password,
      });

      if (response.data.success) {
        const loggedUser = response.data.user;
        setAccessToken(response.data.accessToken);
        setUser(loggedUser);
        localStorage.setItem("wasLoggedIn", "true");

        // Sync local storage ids
        const activeFestivalId = localStorage.getItem("publicFestivalId");
        if (activeFestivalId) {
          localStorage.setItem("selectedFestival", activeFestivalId);
        }

        // Fetch festival details if not already loaded
        if (!currentFestival) {
          try {
            const festRes = await axiosInstance.get("/auth/active-festival");
            if (festRes.data.success && festRes.data.data) {
              setCurrentFestival(festRes.data.data);
            }
          } catch (e) {
            console.error("Failed to load festival info on login:", e);
          }
        }

        return { success: true };
      }
    } catch (err) {
      console.error("Login request failed:", err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem("wasLoggedIn");
    }
  };

  const isAdminLoggedIn = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        currentFestival,
        setCurrentFestival,
        loading,
        isAdminLoggedIn,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
