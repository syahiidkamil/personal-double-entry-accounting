// API endpoint for listing users
// This endpoint should connect to your actual database

import { verifyToken } from "../../utils/auth/jwt";
import prisma from "../../utils/db/prisma";

export default async function handler(req, res) {
  // Only allow GET method
  if (req.method !== "GET") {
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

    // Parse pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get query filters
    const search = req.query.search || "";

    // Build where condition for search
    const whereCondition = search
      ? {
          OR: [{ name: { contains: search } }, { email: { contains: search } }],
        }
      : {};

    // Get total count for pagination
    const total = await prisma.user.count({
      where: whereCondition,
    });

    // Get paginated users
    const users = await prisma.user.findMany({
      where: whereCondition,
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
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
    });

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      users: users,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Admin users list error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
