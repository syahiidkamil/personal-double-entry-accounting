// api/routes/categories.js
import prisma from "../db/prisma.js";

export default async function (fastify, opts) {
  // Get all categories
  fastify.get(
    "/api/categories",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const categories = await prisma.category.findMany({
          where: { userId: request.user.id },
          orderBy: {
            name: "asc",
          },
        });
        return categories;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Get single category
  fastify.get(
    "/api/categories/:id",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const category = await prisma.category.findFirst({
          where: {
            id: parseInt(id),
            userId: request.user.id,
          },
        });

        if (!category) {
          return reply.code(404).send({ error: "Category not found" });
        }

        return category;
      } catch (error) {
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Create category
  fastify.post(
    "/api/categories",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { name, type, color, icon } = request.body;

      try {
        // Validate required fields
        if (!name || !type) {
          return reply.code(400).send({ error: "Name and type are required" });
        }

        // Check if type is valid
        if (type !== "INCOME" && type !== "EXPENSE") {
          return reply
            .code(400)
            .send({ error: "Type must be either INCOME or EXPENSE" });
        }

        // Create category
        const category = await prisma.category.create({
          data: {
            name,
            type,
            color,
            icon,
            userId: request.user.id,
          },
        });

        return category;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Update category
  fastify.put(
    "/api/categories/:id",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name, type, color, icon } = request.body;

      try {
        // Verify category belongs to user
        const existingCategory = await prisma.category.findFirst({
          where: {
            id: parseInt(id),
            userId: request.user.id,
          },
        });

        if (!existingCategory) {
          return reply.code(404).send({ error: "Category not found" });
        }

        // Validate type if provided
        if (type && type !== "INCOME" && type !== "EXPENSE") {
          return reply
            .code(400)
            .send({ error: "Type must be either INCOME or EXPENSE" });
        }

        // Update category
        const updatedCategory = await prisma.category.update({
          where: { id: parseInt(id) },
          data: {
            name,
            type,
            color,
            icon,
          },
        });

        return updatedCategory;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Delete category
  fastify.delete(
    "/api/categories/:id",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        // Verify category belongs to user
        const existingCategory = await prisma.category.findFirst({
          where: {
            id: parseInt(id),
            userId: request.user.id,
          },
        });

        if (!existingCategory) {
          return reply.code(404).send({ error: "Category not found" });
        }

        // Check if category is used in transactions
        const transactionsCount = await prisma.transaction.count({
          where: {
            categoryId: parseInt(id),
          },
        });

        if (transactionsCount > 0) {
          return reply.code(400).send({
            error: "Cannot delete category with transactions",
            message:
              "This category is used in transactions. Please update those transactions first.",
          });
        }

        // Delete category
        await prisma.category.delete({
          where: { id: parseInt(id) },
        });

        return { success: true };
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );
}
