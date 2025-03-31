import fs from 'fs';
import path from 'path';

// Simple function to read the JSON database
const readDB = () => {
  const dbPath = path.join(process.cwd(), 'data', 'db.json');
  const dbData = fs.readFileSync(dbPath, 'utf8');
  return JSON.parse(dbData);
};

export default function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Read database
    const db = readDB();
    
    // Find user
    const user = db.users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create a sanitized user object (without password)
    const sanitizedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // In a real application, you would use a proper JWT library
    // For simplicity, we'll create a fake token
    const token = Buffer.from(JSON.stringify(sanitizedUser)).toString('base64');

    // Return user data and token
    res.status(200).json({
      user: sanitizedUser,
      token,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
