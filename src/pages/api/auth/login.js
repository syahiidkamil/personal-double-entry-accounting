import { readDB, createToken, sanitizeUser } from '../../../lib/db';

export default function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Read database
    const db = readDB();
    
    // Find user
    const user = db.users.find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Create token and sanitize user object
    const token = createToken(user);
    const sanitizedUser = sanitizeUser(user);

    // Return user data and token
    res.status(200).json({
      user: sanitizedUser,
      token,
      message: 'Login successful',
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}