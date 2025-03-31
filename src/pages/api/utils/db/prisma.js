import { PrismaClient } from '@prisma/client';

// Use a global variable to prevent multiple instances during development
const globalForPrisma = global;

// Check if we already have a Prisma instance
const prisma = globalForPrisma.prisma || new PrismaClient();

// In development, keep the same instance across hot reloads
if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma;
}

export default prisma;