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
        setUser(authService.getCurrentUser());
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
    const result = await authService.register(
      userData.name,
      userData.email,
      userData.password
    );
    console.log("Register result:", result);
    if (result.success) {
      setUser(result.user);
      return true;
    }
    return false;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
