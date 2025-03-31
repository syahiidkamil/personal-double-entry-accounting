import prisma from '../../utils/db/prisma';
import { runMiddleware, authMiddleware, adminMiddleware } from '../../utils/middleware/auth';

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

export default async function handler(req, res) {
  // Check authentication and admin role
  try {
    await runMiddleware(req, res, authMiddleware);
    await runMiddleware(req, res, adminMiddleware);
  } catch (error) {
    return res.status(error.statusCode || 401).json({ 
      success: false, 
      message: error.message || 'Authentication required' 
    });
  }

  // Handle GET request - list invitation codes
  if (req.method === 'GET') {
    try {
      // Fetch all invitation codes
      const invitationCodes = await prisma.invitationCode.findMany({
        orderBy: {
          created_at: 'desc'
        },
        include: {
          creator: {
            select: {
              name: true,
              email: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      // Format response data
      const formattedCodes = invitationCodes.map(code => ({
        id: code.id,
        code: code.code,
        notes: code.notes,
        createdBy: code.created_by,
        creatorName: code.creator.name,
        createdAt: code.created_at,
        expiresAt: code.expires_at,
        used: !!code.used_by,
        usedBy: code.used_by,
        userName: code.user?.name,
        usedAt: code.used_at
      }));

      return res.status(200).json({
        success: true,
        invitationCodes: formattedCodes
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
      const { notes } = req.body;
      const userId = req.user.id;

      // Generate a unique code
      let code;
      let isUnique = false;
      
      while (!isUnique) {
        code = generateInvitationCode();
        const existingCode = await prisma.invitationCode.findUnique({
          where: { code }
        });
        
        if (!existingCode) {
          isUnique = true;
        }
      }

      // Calculate expiration (1 hour from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Create new invitation code
      const newInvitationCode = await prisma.invitationCode.create({
        data: {
          code,
          notes: notes || null,
          created_by: userId,
          expires_at: expiresAt
        },
        include: {
          creator: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      // Format response
      const invitationCodeResponse = {
        id: newInvitationCode.id,
        code: newInvitationCode.code,
        notes: newInvitationCode.notes,
        createdBy: newInvitationCode.created_by,
        creatorName: newInvitationCode.creator.name,
        createdAt: newInvitationCode.created_at,
        expiresAt: newInvitationCode.expires_at,
        used: false,
        usedBy: null,
        usedAt: null
      };

      return res.status(201).json({
        success: true,
        message: 'Invitation code created successfully',
        invitationCode: invitationCodeResponse
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