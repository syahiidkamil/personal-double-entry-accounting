import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useProducts from '../hooks/useProducts';

/**
 * Product form component for creating or editing products
 * @param {Object} props - Component props
 * @param {Object} props.initialData - Initial product data for editing (null for new product)
 */
const ProductForm = ({ initialData = null }) => {
  const isEditMode = !!initialData;
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
  });
  const [formError, setFormError] = useState('');
  
  const { createProduct, updateProduct, loading } = useProducts();
  const router = useRouter();

  // Initialize form with product data if in edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        price: initialData.price ? initialData.price.toString() : '',
        imageUrl: initialData.imageUrl || '',
      });
    }
  }, [initialData]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate the form data
  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError('Product name is required');
      return false;
    }
    
    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      setFormError('Price must be a valid number');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form first
    if (!validateForm()) {
      return;
    }
    
    try {
      if (isEditMode) {
        await updateProduct(initialData.id, {
          ...formData,
          price: parseFloat(formData.price),
        });
        router.push('/admin/products');
      } else {
        await createProduct({
          ...formData,
          price: parseFloat(formData.price),
        });
        router.push('/admin/products');
      }
    } catch (error) {
      setFormError(error.message || 'Failed to save product. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
      <h2 className="text-2xl font-bold mb-6">
        {isEditMode ? 'Edit Product' : 'Add New Product'}
      </h2>
      
      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <span>{formError}</span>
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
          Product Name*
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Product Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Product Description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
          Price*
        </label>
        <input
          id="price"
          name="price"
          type="text"
          placeholder="19.99"
          value={formData.price}
          onChange={handleChange}
          required
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUrl">
          Image URL
        </label>
        <input
          id="imageUrl"
          name="imageUrl"
          type="text"
          placeholder="https://example.com/image.jpg"
          value={formData.imageUrl}
          onChange={handleChange}
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
