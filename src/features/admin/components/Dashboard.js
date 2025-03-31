import { useEffect } from 'react';
import Link from 'next/link';
import useAuth from '@/features/auth/hooks/useAuth';
import useProducts from '@/features/products/hooks/useProducts';
import ProductCard from '@/features/products/components/ProductCard';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { products, loading, error, fetchProducts, deleteProduct } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error('Failed to delete product', error);
      // Handle error notification if needed
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        
        <div className="bg-gray-100 p-4 rounded mb-6">
          <p className="font-medium">Welcome, {user?.name || 'Admin'}</p>
          <p className="text-sm text-gray-600">You have access to manage products and view admin features.</p>
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Products</h2>
          <Link 
            href="/admin/products/new" 
            className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
          >
            Add New Product
          </Link>
        </div>
        
        {loading ? (
          <div className="text-center p-4">Loading products...</div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        ) : !products.length ? (
          <div className="text-center p-4 bg-gray-50 rounded">
            No products found. Start by adding a new product.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                isAdmin={true}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
