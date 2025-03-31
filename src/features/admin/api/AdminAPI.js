import axiosInstance from '@/lib/axios';

/**
 * Admin API service for admin-specific operations
 */
class AdminAPI {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard statistics
   */
  static async getDashboardStats() {
    try {
      const response = await axiosInstance.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch dashboard statistics' };
    }
  }

  /**
   * Get admin profile
   * @returns {Promise<Object>} Admin profile data
   */
  static async getProfile() {
    try {
      const response = await axiosInstance.get('/admin/profile');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch admin profile' };
    }
  }
}

export default AdminAPI;
