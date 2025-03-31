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
  // GET request - list all products (public)
  if (req.method === 'GET') {
    try {
      const db = readDB();
      return res.status(200).json(db.products);
    } catch (error) {
      console.error('Error fetching products:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // POST request - create a new product (admin only)
  if (req.method === 'POST') {
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
      
      // Create new product
      const newProduct = {
        id: Date.now().toString(),
        name,
        description: description || '',
        price: parseFloat(price),
        imageUrl: imageUrl || 'https://via.placeholder.com/300',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add product to database
      db.products.push(newProduct);
      writeDB(db);
      
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error creating product:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ message: 'Method not allowed' });
}
