// API endpoint for updating a user
// This endpoint should connect to your actual database

import { verifyToken } from "../../utils/auth/jwt";
import prisma from "../../utils/db/prisma";

export default async function handler(req, res) {
  // Only allow PATCH method
  if (req.method !== "PATCH") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.substring(7);
    const decodedToken = verifyToken(token);

    if (!decodedToken || decodedToken.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
    }

    // Get user ID from URL
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Get active status from request body
    const { active } = req.body;
    if (active === undefined) {
      return res.status(400).json({
        success: false,
        message: "Active status is required",
      });
    }

    // Find user by ID
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if trying to deactivate the last admin
    if (!active && user.role === "ADMIN") {
      const activeAdmins = await prisma.user.count({
        where: {
          role: "ADMIN",
          active: true,
          NOT: { id: userId },
        },
      });

      if (activeAdmins === 0) {
        return res.status(400).json({
          success: false,
          message: "Cannot deactivate the last admin user",
        });
      }
    }

    // Update user's active status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { active },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        preferences: true,
        created_at: true,
        updated_at: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: `User ${active ? "activated" : "deactivated"} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
