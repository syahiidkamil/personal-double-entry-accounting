import { useState, useCallback } from 'react';
import AdminAPI from '../api/AdminAPI';

/**
 * Custom hook for admin operations
 * @returns {Object} Admin operations and state
 */
const useAdmin = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch dashboard statistics
   */
  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await AdminAPI.getDashboardStats();
      setStats(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard statistics');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get admin profile
   */
  const getProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await AdminAPI.getProfile();
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch admin profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Data
    stats,
    
    // Operations
    fetchDashboardStats,
    getProfile,
    
    // State
    loading,
    error,
  };
};

export default useAdmin;
