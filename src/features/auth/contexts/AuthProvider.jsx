import React, { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import authService from "../services/authService";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from authService
    const checkAuth = async () => {
      const isAuthenticated = authService.isAuthenticated();
      if (isAuthenticated) {
        // Get user from localStorage first for instant UI update
        setUser(authService.getCurrentUser());
        
        // Then fetch fresh data from the server
        try {
          const { success, user: freshUser } = await authService.fetchProfile();
          if (success && freshUser) {
            setUser(freshUser);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    const result = await authService.login(
      credentials.email,
      credentials.password
    );
    if (result.success) {
      setUser(result.user);
      return true;
    }
    return false;
  };

  const register = async (userData) => {
    console.log("AuthProvider register called with:", userData);
    const result = await authService.register(userData);
    console.log("Register result:", result);
    if (result.success) {
      setUser(result.user);
      return true;
    }
    return false;
  };

  const updateProfile = async (userData) => {
    const result = await authService.updateProfile(userData);
    if (result.success) {
      setUser(prev => ({ ...prev, ...result.user }));
      return true;
    }
    return false;
  };

  // Now logout just calls authService.logout() and resets the user state
  // The component that calls this function will handle navigation
  const logout = () => {
    authService.logout();
    setUser(null);
    return true; // Return true to indicate logout was successful
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};