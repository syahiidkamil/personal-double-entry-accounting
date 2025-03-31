import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

// Path to our "database" file
const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-for-development-only';

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Initialize the database with default data if it doesn't exist
const initDB = () => {
  ensureDataDir();
  
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      users: [
        {
          id: 1,
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'adminpassword', // In a real app, you should hash passwords
          role: 'admin',
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'Regular User',
          email: 'user@example.com',
          password: 'userpassword', // In a real app, you should hash passwords
          role: 'user',
          createdAt: new Date().toISOString(),
        },
      ],
      accounts: [],
      transactions: []
    };
    
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
};

// Read the database file
export const readDB = () => {
  try {
    ensureDataDir();
    if (!fs.existsSync(DB_PATH)) {
      return initDB();
    }
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch (error) {
    console.error('Error reading database:', error);
    return initDB();
  }
};

// Write to the database file
export const writeDB = (data) => {
  try {
    ensureDataDir();
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing to database:', error);
    return false;
  }
};

// Create a JWT token
export const createToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
    },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

// Remove sensitive fields from user object
export const sanitizeUser = (user) => {
  const sanitizedUser = { ...user };
  delete sanitizedUser.password;
  return sanitizedUser;
};

// Verify a JWT token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Check if user is authenticated middleware
export const isAuthenticated = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Add user to request object
    req.user = decoded;
    
    // If 'next' function is provided, call it
    if (typeof next === 'function') {
      return next();
    }
    
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    
    // If 'next' function is provided, pass the error to it
    if (typeof next === 'function') {
      return next(error);
    }
    
    return false;
  }
};

// Find user by ID
export const findUserById = (id) => {
  const db = readDB();
  return db.users.find(user => user.id === id);
};

// Find user by email
export const findUserByEmail = (email) => {
  const db = readDB();
  return db.users.find(user => user.email.toLowerCase() === email.toLowerCase());
};
