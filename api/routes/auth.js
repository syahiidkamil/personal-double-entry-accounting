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

      // Create user - looking at the error, need to check if 'name' is valid in the schema
      // If not, we'll need to modify this to match the schema
      let userData = {
        email,
        password: hashedPassword,
      };

      // Only add name if it's provided and supported in the schema
      if (name) {
        // Check if name property exists in the User model
        const userModelInfo = await prisma.$queryRaw`
          SELECT name FROM sqlite_master 
          WHERE type='table' AND name='User'
        `;

        if (userModelInfo && userModelInfo.length > 0) {
          const tableInfo = await prisma.$queryRaw`PRAGMA table_info(User)`;
          const hasNameColumn = tableInfo.some(
            (column) => column.name === "name"
          );

          if (hasNameColumn) {
            userData.name = name;
          }
        }
      }

      // Create user with checked properties
      const user = await prisma.user.create({
        data: userData,
      });

      // Create default data for the user
      await createDefaultDataForUser(user.id);

      // Generate token
      const token = fastify.jwt.sign({ id: user.id });

      // Prepare response
      const responseUser = {
        id: user.id,
        email: user.email,
      };

      // Add name to response if it was saved
      if (userData.name) {
        responseUser.name = userData.name;
      } else {
        // Default name based on email
        responseUser.name = email.split("@")[0];
      }

      return {
        user: responseUser,
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

      // Prepare the response user object
      const responseUser = {
        email: user.email,
      };

      // Add name to response if available in the user object
      if (user.name) {
        responseUser.name = user.name;
      } else {
        // Default name based on email
        responseUser.name = email.split("@")[0];
      }

      return {
        user: responseUser,
        token,
      };
    } catch (error) {
      console.error("Login error:", error);
      reply.code(500).send({ error: "Server error during login" });
    }
  });
}
