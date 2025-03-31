import { useState, useEffect, useCallback } from 'react';
import ProductsAPI from '../api/ProductsAPI';

/**
 * Custom hook for products operations
 * @param {Object} options - Hook options
 * @param {boolean} options.fetchOnMount - Whether to fetch products on mount
 * @returns {Object} Products operations and state
 */
const useProducts = ({ fetchOnMount = false } = {}) => {
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch all products
   */
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ProductsAPI.getProducts();
      setProducts(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch products');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch a single product by ID
   * @param {string} id - Product ID
   */
  const fetchProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ProductsAPI.getProduct(id);
      setCurrentProduct(data);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to fetch product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new product
   * @param {Object} productData - Product data
   */
  const createProduct = useCallback(async (productData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ProductsAPI.createProduct(productData);
      setProducts((prevProducts) => [...prevProducts, data]);
      return data;
    } catch (err) {
      setError(err.message || 'Failed to create product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing product
   * @param {string} id - Product ID
   * @param {Object} productData - Updated product data
   */
  const updateProduct = useCallback(async (id, productData) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await ProductsAPI.updateProduct(id, productData);
      
      // Update products list
      setProducts((prevProducts) =>
        prevProducts.map((product) => (product.id === id ? data : product))
      );
      
      // Update current product if it's the one being edited
      if (currentProduct && currentProduct.id === id) {
        setCurrentProduct(data);
      }
      
      return data;
    } catch (err) {
      setError(err.message || 'Failed to update product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProduct]);

  /**
   * Delete a product
   * @param {string} id - Product ID
   */
  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      await ProductsAPI.deleteProduct(id);
      
      // Remove from products list
      setProducts((prevProducts) => 
        prevProducts.filter((product) => product.id !== id)
      );
      
      // Clear current product if it's the one being deleted
      if (currentProduct && currentProduct.id === id) {
        setCurrentProduct(null);
      }
      
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete product');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentProduct]);

  // Fetch products on mount if requested
  useEffect(() => {
    if (fetchOnMount) {
      fetchProducts();
    }
  }, [fetchOnMount, fetchProducts]);

  return {
    // Data
    products,
    currentProduct,
    
    // Operations
    fetchProducts,
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // State
    loading,
    error,
  };
};

export default useProducts;
