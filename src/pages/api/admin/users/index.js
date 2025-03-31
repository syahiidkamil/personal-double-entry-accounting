// API endpoint for listing users
// This endpoint should connect to your actual database

export default function handler(req, res) {
  // Only allow GET method
  if (req.method !== 'GET') {
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

    // Read database
    const db = readDB();
    
    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Get query filters
    const search = req.query.search || '';
    
    // Filter and paginate users
    let filteredUsers = db.users;
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) || 
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    const total = filteredUsers.length;
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
    
    // Sanitize users (remove password)
    const sanitizedUsers = paginatedUsers.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      users: sanitizedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    });
  } catch (error) {
    console.error('Admin users list error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}