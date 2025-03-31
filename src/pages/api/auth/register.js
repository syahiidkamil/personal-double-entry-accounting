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

export default function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Read database
    const db = readDB();
    
    // Check if user already exists
    const userExists = db.users.some(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password, // In a real app, you should hash this password
      role: 'customer', // Default role for new users
      createdAt: new Date().toISOString(),
    };

    // Add user to database
    db.users.push(newUser);
    writeDB(db);

    // Create a sanitized user object (without password)
    const sanitizedUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    };

    // In a real application, you would use a proper JWT library
    // For simplicity, we'll create a fake token
    const token = Buffer.from(JSON.stringify(sanitizedUser)).toString('base64');

    // Return user data and token
    res.status(201).json({
      user: sanitizedUser,
      token,
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
