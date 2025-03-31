import MainLayout from "@/components/layouts/MainLayout";
import ProductList from "@/features/products/components/ProductList";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Welcome to Our Store</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Browse our collection of high-quality products. Sign in to access exclusive features!
        </p>
      </div>
      
      <div className="my-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Our Products</h2>
        <ProductList />
      </div>
    </div>
  );
}

// Define the layout for this page
Home.getLayout = (page) => <MainLayout>{page}</MainLayout>;
