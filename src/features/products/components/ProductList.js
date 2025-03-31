import { useEffect } from 'react';
import Link from 'next/link';
import useProducts from '../hooks/useProducts';

const ProductList = () => {
  const { products, loading, error, fetchProducts } = useProducts();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  if (loading) {
    return <div className="text-center p-4">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-4xl mx-auto my-4" role="alert">
        <p className="font-bold">Error</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!products.length) {
    return <div className="text-center p-4">No products found.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
  return (
    <div className="border rounded-lg overflow-hidden shadow-lg">
      {product.imageUrl && (
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
        <p className="text-gray-700 mb-2">${product.price.toFixed(2)}</p>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
        <Link 
          href={`/products/${product.id}`}
          className="inline-block bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default ProductList;
