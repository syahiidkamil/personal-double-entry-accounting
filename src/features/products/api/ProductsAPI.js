import axiosInstance from '@/lib/axios';

/**
 * Products API service for handling product-related requests
 */
class ProductsAPI {
  /**
   * Get all products
   * @returns {Promise<Array>} Array of products
   */
  static async getProducts() {
    try {
      const response = await axiosInstance.get('/products');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch products' };
    }
  }

  /**
   * Get a single product by ID
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Product data
   */
  static async getProduct(id) {
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch product' };
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product data
   */
  static async createProduct(productData) {
    try {
      const response = await axiosInstance.post('/products', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create product' };
    }
  }

  /**
   * Update an existing product
   * @param {string} id - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product data
   */
  static async updateProduct(id, productData) {
    try {
      const response = await axiosInstance.put(`/products/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update product' };
    }
  }

  /**
   * Delete a product
   * @param {string} id - Product ID
   * @returns {Promise<Object>} Response data
   */
  static async deleteProduct(id) {
    try {
      const response = await axiosInstance.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete product' };
    }
  }
}

export default ProductsAPI;
