import React, { createContext, useState, useEffect } from "react";
import axiosInstance, { setAccessToken } from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, username, role }
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
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
