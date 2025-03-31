// API endpoint for managing invitation codes
// This endpoint should connect to your actual database

// Generate a random invitation code
function generateInvitationCode() {
  const prefix = 'FINTRACK';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = prefix + '-';
  
  // Generate 4 characters separated by dashes (e.g., FINTRACK-XXXX-XXXX-XXXX)
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 4; j++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    if (i < 2) result += '-';
  }
  
  return result;
}

export default function handler(req, res) {
  // Handle GET request - list invitation codes
  if (req.method === 'GET') {
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
      
      // Initialize invitation_codes array if it doesn't exist
      if (!db.invitation_codes) {
        db.invitation_codes = [];
      }

      return res.status(200).json({
        success: true,
        invitationCodes: db.invitation_codes
      });
    } catch (error) {
      console.error('List invitation codes error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
  
  // Handle POST request - create invitation code
  else if (req.method === 'POST') {
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

      // Get notes from request body
      const { notes } = req.body;

      // Read database
      const db = readDB();
      
      // Initialize invitation_codes array if it doesn't exist
      if (!db.invitation_codes) {
        db.invitation_codes = [];
      }

      // Generate a unique code
      let code;
      do {
        code = generateInvitationCode();
      } while (db.invitation_codes.some(ic => ic.code === code));

      // Calculate expiration (1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Create new invitation code
      const newInvitationCode = {
        id: Date.now().toString(),
        code,
        notes: notes || '',
        createdBy: decodedToken.id,
        createdAt: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        used: false,
        usedBy: null,
        usedAt: null
      };

      // Add to database
      db.invitation_codes.push(newInvitationCode);
      writeDB(db);

      return res.status(201).json({
        success: true,
        message: 'Invitation code created successfully',
        invitationCode: newInvitationCode
      });
    } catch (error) {
      console.error('Create invitation code error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
  
  // Handle other HTTP methods
  else {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }
}