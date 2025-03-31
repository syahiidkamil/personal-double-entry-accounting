import Link from 'next/link';

/**
 * Product card component to display a product in a list
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {boolean} props.isAdmin - If true, shows admin actions
 * @param {Function} props.onDelete - Callback for delete action
 */
const ProductCard = ({ product, isAdmin = false, onDelete }) => {
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm(`Are you sure you want to delete ${product.name}?`)) {
      onDelete(product.id);
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
      {product.imageUrl && (
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-48 object-cover"
        />
      )}
      
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
        <p className="text-gray-700 mb-2">${product.price?.toFixed(2) || '0.00'}</p>
        
        {product.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <Link 
            href={`/products/${product.id}`}
            className="inline-block bg-blue-500 hover:bg-blue-700 text-white py-1 px-4 rounded"
          >
            View Details
          </Link>
          
          {isAdmin && (
            <div className="flex space-x-2">
              <Link
                href={`/admin/products/${product.id}`}
                className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"
              >
                Edit
              </Link>
              
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
