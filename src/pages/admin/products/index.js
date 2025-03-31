import { useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from "@/components/layouts/AdminLayout";
import withProtectedRoute from "@/utils/protectedRoute";
import useProducts from "@/features/products/hooks/useProducts";
import ProductCard from "@/features/products/components/ProductCard";

function AdminProductsPage() {
  const { products, loading, error, fetchProducts, deleteProduct } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
      } catch (error) {
        console.error('Failed to delete product', error);
        // Handle error notification if needed
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
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
  );
}

// Define the layout for this page
AdminProductsPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

// Wrap with protected route for admin only
export default withProtectedRoute(AdminProductsPage, { adminOnly: true });
