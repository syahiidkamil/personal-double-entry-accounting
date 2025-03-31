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
    const { name, email, password, invitationCode } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }

    // Validate invitation code
    if (!invitationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invitation code is required'
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

    // Check if invitation code exists and is valid
    const invitation = await prisma.invitationCode.findUnique({
      where: { code: invitationCode }
    });

    if (!invitation) {
      return res.status(400).json({
        success: false,
        message: 'Invalid invitation code'
      });
    }

    // Check if invitation code is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invitation code has expired'
      });
    }

    // Check if invitation code is already used
    if (invitation.used_by) {
      return res.status(400).json({
        success: false,
        message: 'Invitation code has already been used'
      });
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create new user and mark invitation code as used in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create new user
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password_hash,
          role: 'REGULAR',
          preferences: {
            mainCurrency: 'IDR',
            currencies: ['IDR']
          }
        }
      });

      // Mark invitation code as used
      await tx.invitationCode.update({
        where: { id: invitation.id },
        data: {
          used_by: newUser.id,
          used_at: new Date()
        }
      });

      return newUser;
    });

    // Create token
    const token = generateToken(result);

    // Return sanitized user data and token
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role,
        preferences: result.preferences
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}