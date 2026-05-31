import React, { createContext, useState, useContext, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * DATABASE SYNC LOGIC
   * This runs every time the app loads/refreshes.
   * Instead of trusting what's in the browser, we ask MySQL:
   * "Is this token still valid, and what is this user's current role?"
   */
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");

      // If no token exists, we don't even try to hit the DB
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Query the MySQL database for the live user profile
        const { data } = await API.get("/auth/me");
        setUser(data); // Sync local state with database reality
      } catch (err) {
        console.error(
          "Session Validation Failed: ",
          err.response?.data?.message,
        );
        // If the token is fake or expired, purge local storage
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        // Give the UI a 500ms breather for a smoother transition
        setTimeout(() => setLoading(false), 500);
      }
    };

    verifyUser();
  }, []);

  const login = (userData, token) => {
    // 1. Store the token for future API calls
    localStorage.setItem("token", token);
    // 2. Wake up the application state with user data
    setUser(userData);
  };

  const logout = () => {
    // 1. Destroy the session in the browser
    localStorage.removeItem("token");
    // 2. Nullify the user state to trigger Protected Route redirects
    setUser(null);
    // 3. Clear any mid-exam progress for security
    localStorage.removeItem("exam_progress");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        role: user?.role, // Easy access to current role (admin/teacher/student)
      }}
    >
      {/* 
        Professional UX: We don't render the app until the 
        Database has confirmed the user's identity. 
      */}
      {loading ? (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-white font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
            Verifying Database Identity
          </p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
