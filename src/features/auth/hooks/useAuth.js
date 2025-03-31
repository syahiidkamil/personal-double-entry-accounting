import { useState } from "react";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import AuthAPI from "../api/AuthAPI";

/**
 * Custom hook for authentication operations
 * @returns {Object} Auth operations and state
 */
const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get auth context methods and state
  const authContext = useAuthContext();

  /**
   * Login user with email and password
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   */
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await AuthAPI.login(credentials);
      authContext.login(response.user, response.token);
      return response;
    } catch (err) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User name
   * @param {string} userData.email - User email
   * @param {string} userData.password - User password
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await AuthAPI.register(userData);
      authContext.register(response.user, response.token);
      return response;
    } catch (err) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout the current user
   */
  const logout = () => {
    authContext.logout();
  };

  return {
    // Operations
    login,
    register,
    logout,

    // State
    loading,
    error,

    // Forward auth context properties
    isAuthenticated: authContext.isAuthenticated,
    isAdmin: authContext.isAdmin,
    user: authContext.user,
  };
};

export default useAuth;
