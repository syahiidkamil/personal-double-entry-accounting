import prisma from '../utils/db/prisma';
import { hashPassword } from '../utils/auth/password';
import { generateToken } from '../utils/auth/jwt';

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Verify admin key from request header
    const adminKey = req.headers['x-admin-key'];
    const expectedAdminKey = process.env.ADMIN_REGISTRATION_KEY;

    if (!adminKey || adminKey !== expectedAdminKey) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid admin key' 
      });
    }

    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create new admin user
    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        role: 'ADMIN',
        preferences: {
          mainCurrency: 'IDR',
          currencies: ['IDR', 'USD']
        }
      }
    });

    // Create token
    const token = generateToken(newAdmin);

    // Return sanitized user data and token
    return res.status(201).json({
      success: true,
      message: 'Admin user registered successfully',
      token,
      user: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        preferences: newAdmin.preferences
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}