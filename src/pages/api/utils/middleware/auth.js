import { getTokenFromRequest, verifyToken } from '../auth/jwt';
import prisma from '../db/prisma';

/**
 * Authentication middleware for API routes
 * 
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 * @param {Function} next - Next.js next function 
 * @returns {Promise<void>}
 */
export async function authMiddleware(req, res, next) {
  try {
    // Get token from request
    const token = getTokenFromRequest(req);
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    // Check if user exists and is active
    if (!user || !user.active) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or account deactivated' 
      });
    }

    // Add user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    // Continue to the route handler
    return next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}

/**
 * Admin authorization middleware
 * Requires authMiddleware to be called first
 * 
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 * @param {Function} next - Next.js next function
 * @returns {Promise<void>} 
 */
export async function adminMiddleware(req, res, next) {
  try {
    // Check if user exists and is admin
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Continue to the route handler
    return next();
  } catch (error) {
    console.error('Admin authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Helper function to run middleware in Next.js API routes
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 * @param {Function} fn - Middleware function
 * @returns {Promise<any>} Result of middleware
 */
export function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}