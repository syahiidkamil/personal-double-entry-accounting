// API endpoint for updating a user
// This endpoint should connect to your actual database

export default function handler(req, res) {
  // Only allow PATCH method
  if (req.method !== 'PATCH') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required' 
      });
    }

    const token = authHeader.substring(7);
    const decodedToken = verifyToken(token);

    if (!decodedToken || decodedToken.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden: Admin access required' 
      });
    }

    // Get user ID from URL
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    // Get active status from request body
    const { active } = req.body;
    if (active === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Active status is required'
      });
    }

    // Read database
    const db = readDB();

    // Find user by ID
    const userIndex = db.users.findIndex(user => user.id.toString() === userId);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if trying to deactivate the last admin
    if (!active && db.users[userIndex].role === 'admin') {
      const activeAdmins = db.users.filter(u => u.role === 'admin' && u.active !== false);
      if (activeAdmins.length <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the last admin user'
        });
      }
    }

    // Update user's active status
    db.users[userIndex] = {
      ...db.users[userIndex],
      active,
    };

    // Save changes to database
    writeDB(db);

    // Return updated user (without password)
    const { password, ...updatedUser } = db.users[userIndex];

    return res.status(200).json({
      success: true,
      message: `User ${active ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}