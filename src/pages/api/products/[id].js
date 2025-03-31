import fs from 'fs';
import path from 'path';

// Simple function to read the JSON database
const readDB = () => {
  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  const dbData = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(dbData);
};

// Simple function to write to the JSON database
const writeDB = (data) => {
  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
};

// Middleware to verify admin role
const isAdmin = (req) => {
  // In a real app, verify JWT token and check role
  // For this template, we'll extract the role from the Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    return decoded.role === 'admin';
  } catch (error) {
    return false;
  }
};

export default function handler(req, res) {
  const { id } = req.query;
  
  // GET request - get a product by ID (public)
  if (req.method === 'GET') {
    try {
      const db = readDB();
      const product = db.products.find(p => p.id === id);
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      return res.status(200).json(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // PUT request - update a product (admin only)
  if (req.method === 'PUT') {
    // Check if user is admin
    if (!isAdmin(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
      const { name, description, price, imageUrl } = req.body;
      
      // Basic validation
      if (!name || !price) {
        return res.status(400).json({ message: 'Name and price are required' });
      }
      
      const db = readDB();
      const productIndex = db.products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Update product
      const updatedProduct = {
        ...db.products[productIndex],
        name,
        description: description || '',
        price: parseFloat(price),
        imageUrl: imageUrl || db.products[productIndex].imageUrl,
        updatedAt: new Date().toISOString(),
      };
      
      db.products[productIndex] = updatedProduct;
      writeDB(db);
      
      return res.status(200).json(updatedProduct);
    } catch (error) {
      console.error('Error updating product:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // DELETE request - delete a product (admin only)
  if (req.method === 'DELETE') {
    // Check if user is admin
    if (!isAdmin(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    
    try {
      const db = readDB();
      const productIndex = db.products.findIndex(p => p.id === id);
      
      if (productIndex === -1) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      // Remove product
      db.products.splice(productIndex, 1);
      writeDB(db);
      
      return res.status(204).end();
    } catch (error) {
      console.error('Error deleting product:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
