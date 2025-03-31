import prisma from '../utils/db/prisma';

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Method not allowed' 
    });
  }

  try {
    const { invitationCode } = req.body;

    // Validate request
    if (!invitationCode) {
      return res.status(400).json({
        success: false,
        message: 'Invitation code is required'
      });
    }

    // Find invitation code
    const invitation = await prisma.invitationCode.findUnique({
      where: { code: invitationCode }
    });

    // Check if code exists
    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invalid invitation code'
      });
    }

    // Check if code is expired
    const isExpired = new Date(invitation.expires_at) < new Date();
    if (isExpired) {
      return res.status(400).json({
        success: false,
        message: 'Invitation code has expired'
      });
    }

    // Check if code is already used
    if (invitation.used_by) {
      return res.status(400).json({
        success: false,
        message: 'Invitation code has already been used'
      });
    }

    // Code is valid
    return res.status(200).json({
      success: true,
      message: 'Invitation code is valid',
      expiresAt: invitation.expires_at
    });
  } catch (error) {
    console.error('Validate invitation code error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
}