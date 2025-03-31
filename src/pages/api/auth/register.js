import { readDB, writeDB, createToken, sanitizeUser } from '../../../lib/db';

export default function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    // Read database
    const db = readDB();
    
    // Check if user already exists
    const userExists = db.users.some(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    if (userExists) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const newUser = {
      id: Date.now(),
      name,
      email,
      password, // In a real app, you should hash this password
      createdAt: new Date().toISOString(),
    };

    // Add user to database
    db.users.push(newUser);
    writeDB(db);

    // Create token and sanitize user object
    const token = createToken(newUser);
    const sanitizedUser = sanitizeUser(newUser);

    // Return user data and token
    res.status(201).json({
      user: sanitizedUser,
      token,
      message: 'Registration successful',
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}