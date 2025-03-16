// api/routes/auth.js
import bcrypt from "bcrypt";
import prisma from "../db/prisma.js";

// Helper function to create default data for new users
async function createDefaultDataForUser(userId) {
  // Create default categories for the user
  const expenseCategories = [
    {
      name: "Food & Dining",
      type: "EXPENSE",
      color: "#FF5733",
      icon: "utensils",
    },
    { name: "Housing", type: "EXPENSE", color: "#33FF57", icon: "home" },
    { name: "Transportation", type: "EXPENSE", color: "#3357FF", icon: "car" },
    { name: "Entertainment", type: "EXPENSE", color: "#F033FF", icon: "film" },
    {
      name: "Shopping",
      type: "EXPENSE",
      color: "#FF33A8",
      icon: "shopping-bag",
    },
    { name: "Utilities", type: "EXPENSE", color: "#33FFF0", icon: "bolt" },
    {
      name: "Health & Medical",
      type: "EXPENSE",
      color: "#A833FF",
      icon: "medkit",
    },
    { name: "Personal", type: "EXPENSE", color: "#FF8333", icon: "user" },
  ];

  const incomeCategories = [
    { name: "Salary", type: "INCOME", color: "#33FF57", icon: "briefcase" },
    { name: "Freelance", type: "INCOME", color: "#3357FF", icon: "laptop" },
    {
      name: "Investments",
      type: "INCOME",
      color: "#FF8333",
      icon: "chart-line",
    },
    { name: "Gifts", type: "INCOME", color: "#F033FF", icon: "gift" },
  ];

  // Create categories
  for (const category of [...expenseCategories, ...incomeCategories]) {
    await prisma.category.create({
      data: {
        ...category,
        userId,
      },
    });
  }

  // Create default accounts
  const defaultAccounts = [
    { name: "Cash", type: "ASSET", category: "CASH", balance: 0 },
    { name: "Checking Account", type: "ASSET", category: "BANK", balance: 0 },
    {
      name: "Credit Card",
      type: "LIABILITY",
      category: "CREDIT_CARD",
      balance: 0,
    },
  ];

  for (const account of defaultAccounts) {
    await prisma.account.create({
      data: {
        ...account,
        userId,
      },
    });
  }
}

export default async function (fastify, opts) {
  // Register route
  fastify.post("/api/auth/register", async (request, reply) => {
    const { email, password, name } = request.body;

    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return reply.code(400).send({ error: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || email.split("@")[0], // Use name if provided, or part of email
        },
      });

      // Create default data for the user
      await createDefaultDataForUser(user.id);

      // Generate token
      const token = fastify.jwt.sign({ id: user.id });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
        message:
          "Account created successfully with default categories and accounts",
      };
    } catch (error) {
      console.error("Registration error:", error);
      reply.code(500).send({ error: "Server error during registration" });
    }
  });

  // Login route
  fastify.post("/api/auth/login", async (request, reply) => {
    const { email, password } = request.body;

    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      // Compare password
      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      // Generate token
      const token = fastify.jwt.sign({ id: user.id });

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      reply.code(500).send({ error: "Server error during login" });
    }
  });

  // Get current user
  fastify.get(
    "/api/auth/me",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: request.user.id },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        });

        if (!user) {
          return reply.code(404).send({ error: "User not found" });
        }

        return user;
      } catch (error) {
        console.error("Get user error:", error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Update user profile
  fastify.put(
    "/api/auth/profile",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { name, email, currentPassword, newPassword } = request.body;
      const userId = request.user.id;

      try {
        // Find current user
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return reply.code(404).send({ error: "User not found" });
        }

        // If changing email, check if new email is already taken
        if (email && email !== user.email) {
          const emailExists = await prisma.user.findUnique({
            where: { email },
          });

          if (emailExists) {
            return reply.code(400).send({ error: "Email already in use" });
          }
        }

        // If changing password, verify current password
        let hashedNewPassword;
        if (newPassword && currentPassword) {
          const isValidPassword = await bcrypt.compare(
            currentPassword,
            user.password
          );
          if (!isValidPassword) {
            return reply
              .code(401)
              .send({ error: "Current password is incorrect" });
          }
          hashedNewPassword = await bcrypt.hash(newPassword, 10);
        }

        // Update user
        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: {
            ...(name && { name }),
            ...(email && { email }),
            ...(hashedNewPassword && { password: hashedNewPassword }),
          },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
          },
        });

        return updatedUser;
      } catch (error) {
        console.error("Update profile error:", error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );
}
