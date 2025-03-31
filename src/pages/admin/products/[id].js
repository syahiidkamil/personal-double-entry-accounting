import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from "@/components/layouts/AdminLayout";
import ProductForm from "@/features/products/components/ProductForm";
import withProtectedRoute from "@/utils/protectedRoute";
import useProducts from "@/features/products/hooks/useProducts";

function EditProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const { fetchProduct, currentProduct, loading, error } = useProducts();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadProduct = async () => {
        try {
          await fetchProduct(id);
          setIsLoading(false);
        } catch (error) {
          console.error('Failed to fetch product:', error);
          // Redirect to products list on error
          router.push('/admin/products');
        }
      };

      loadProduct();
    }
  }, [id, fetchProduct, router]);

  if (isLoading || loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => router.push('/admin/products')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      {currentProduct && <ProductForm initialData={currentProduct} />}
    </div>
  );
}

// Define the layout for this page
EditProductPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

// Wrap with protected route for admin only
export default withProtectedRoute(EditProductPage, { adminOnly: true });
