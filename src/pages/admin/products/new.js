import AdminLayout from "@/components/layouts/AdminLayout";
import ProductForm from "@/features/products/components/ProductForm";
import withProtectedRoute from "@/utils/protectedRoute";

function NewProductPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <ProductForm />
    </div>
  );
}

// Define the layout for this page
NewProductPage.getLayout = (page) => <AdminLayout>{page}</AdminLayout>;

// Wrap with protected route for admin only
export default withProtectedRoute(NewProductPage, { adminOnly: true });
