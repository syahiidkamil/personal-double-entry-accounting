import prisma from '../utils/db/prisma';
import { runMiddleware, authMiddleware } from '../utils/middleware/auth';

export default async function handler(req, res) {
  // Check authentication first
  try {
    await runMiddleware(req, res, authMiddleware);
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }

  // Handle GET request to fetch current user profile
  if (req.method === 'GET') {
    try {
      const userId = req.user.id;
      
      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
      
      // Return sanitized user data
      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          preferences: user.preferences
        }
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  } 
  
  // Handle PATCH request to update user profile
  else if (req.method === 'PATCH') {
    try {
      const userId = req.user.id;
      const { name, preferences } = req.body;
      
      // Create update data object with only valid fields
      const updateData = {};
      if (name !== undefined) updateData.name = name;
      if (preferences !== undefined) updateData.preferences = preferences;
      
      // Update user in database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData
      });
      
      // Return sanitized updated user data
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          preferences: updatedUser.preferences
        }
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
  
  // Disallow other methods
  else {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}