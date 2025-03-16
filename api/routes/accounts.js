import prisma from "../db/prisma.js";

export default async function (fastify, opts) {
  // Get all accounts
  fastify.get(
    "/api/accounts",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const accounts = await prisma.account.findMany({
          where: { userId: request.user.id },
          orderBy: {
            name: "asc",
          },
        });
        return accounts;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Get single account
  fastify.get(
    "/api/accounts/:id",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const account = await prisma.account.findFirst({
          where: {
            id: parseInt(id),
            userId: request.user.id,
          },
        });

        if (!account) {
          return reply.code(404).send({ error: "Account not found" });
        }

        return account;
      } catch (error) {
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Create account
  fastify.post(
    "/api/accounts",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const {
        name,
        type,
        initialBalance,
        currency,
        category,
        interestRate,
        dueDate,
        paymentAmount,
      } = request.body;

      try {
        // Create account
        const account = await prisma.account.create({
          data: {
            name,
            type,
            balance: parseFloat(initialBalance || 0),
            currency: currency || "USD",
            category,
            interestRate: interestRate ? parseFloat(interestRate) : null,
            dueDate: dueDate ? new Date(dueDate) : null,
            paymentAmount: paymentAmount ? parseFloat(paymentAmount) : null,
            userId: request.user.id,
          },
        });

        return account;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Update account
  fastify.put(
    "/api/accounts/:id",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        name,
        type,
        balance,
        currency,
        category,
        interestRate,
        dueDate,
        paymentAmount,
      } = request.body;

      try {
        // Verify account belongs to user
        const existingAccount = await prisma.account.findFirst({
          where: {
            id: parseInt(id),
            userId: request.user.id,
          },
        });

        if (!existingAccount) {
          return reply.code(404).send({ error: "Account not found" });
        }

        // Update account
        const updatedAccount = await prisma.account.update({
          where: { id: parseInt(id) },
          data: {
            name,
            type,
            balance: balance !== undefined ? parseFloat(balance) : undefined,
            currency,
            category,
            interestRate:
              interestRate !== undefined ? parseFloat(interestRate) : undefined,
            dueDate: dueDate !== undefined ? new Date(dueDate) : undefined,
            paymentAmount:
              paymentAmount !== undefined
                ? parseFloat(paymentAmount)
                : undefined,
          },
        });

        return updatedAccount;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Delete account
  fastify.delete(
    "/api/accounts/:id",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        // Verify account belongs to user
        const existingAccount = await prisma.account.findFirst({
          where: {
            id: parseInt(id),
            userId: request.user.id,
          },
        });

        if (!existingAccount) {
          return reply.code(404).send({ error: "Account not found" });
        }

        // Check if account has associated transactions
        const transactionsCount = await prisma.transaction.count({
          where: {
            OR: [
              { fromAccountId: parseInt(id) },
              { toAccountId: parseInt(id) },
            ],
          },
        });

        if (transactionsCount > 0) {
          return reply.code(400).send({
            error: "Cannot delete account with transactions",
            message:
              "This account has associated transactions. Please delete those transactions first or reassign them to other accounts.",
          });
        }

        // Delete account
        await prisma.account.delete({
          where: { id: parseInt(id) },
        });

        return { success: true };
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Get account templates
  fastify.get(
    "/api/account-templates",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      // These would typically come from a database, but for simplicity,
      // we'll return a static list of templates
      return [
        {
          id: "basic",
          name: "Basic Accounts",
          description: "Basic set of accounts for personal finance",
          accounts: [
            {
              name: "Cash",
              type: "ASSET",
              category: "CASH",
              initialBalance: 0,
            },
            {
              name: "Checking Account",
              type: "ASSET",
              category: "BANK",
              initialBalance: 0,
            },
            {
              name: "Savings Account",
              type: "ASSET",
              category: "BANK",
              initialBalance: 0,
            },
            {
              name: "Credit Card",
              type: "LIABILITY",
              category: "CREDIT_CARD",
              initialBalance: 0,
            },
          ],
        },
        {
          id: "detailed",
          name: "Detailed Personal Finances",
          description:
            "Comprehensive set of accounts for detailed personal finance tracking",
          accounts: [
            {
              name: "Cash",
              type: "ASSET",
              category: "CASH",
              initialBalance: 0,
            },
            {
              name: "Primary Checking",
              type: "ASSET",
              category: "BANK",
              initialBalance: 0,
            },
            {
              name: "Emergency Fund",
              type: "ASSET",
              category: "BANK",
              initialBalance: 0,
            },
            {
              name: "Savings",
              type: "ASSET",
              category: "BANK",
              initialBalance: 0,
            },
            {
              name: "Investment Account",
              type: "ASSET",
              category: "INVESTMENT",
              initialBalance: 0,
            },
            {
              name: "Primary Credit Card",
              type: "LIABILITY",
              category: "CREDIT_CARD",
              initialBalance: 0,
            },
            {
              name: "Car Loan",
              type: "LIABILITY",
              category: "LOAN",
              initialBalance: 0,
            },
            {
              name: "Mortgage",
              type: "LIABILITY",
              category: "LOAN",
              initialBalance: 0,
            },
          ],
        },
      ];
    }
  );

  // Apply account template
  fastify.post(
    "/api/apply-account-template",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { templateId } = request.body;

      // Get templates (in a real app, this would come from a database)
      const templates = [
        {
          id: "basic",
          accounts: [
            {
              name: "Cash",
              type: "ASSET",
              category: "CASH",
              initialBalance: 0,
            },
            {
              name: "Checking Account",
              type: "ASSET",
              category: "BANK",
              initialBalance: 0,
            },
            {
              name: "Savings Account",
              type: "ASSET",
              category: "BANK",
              initialBalance: 0,
            },
            {
              name: "Credit Card",
              type: "LIABILITY",
              category: "CREDIT_CARD",
              initialBalance: 0,
            },
          ],
        },
        {
          id: "detailed",
          accounts: [
            {
              name: "Cash",
              type: "ASSET",
              category: "CASH",
              initialBalance: 0,
            },
            {
              name: "Primary Checking",
              type: "ASSET",
              category: "BANK",
              initialBalance: 0,
            },
            {
              name: "Emergency Fund",
              type: "ASSET",
              category: "BANK",
              initialBalance: 0,
            },
            {
              name: "Savings",
              type: "ASSET",
              category: "BANK",
              initialBalance: 0,
            },
            {
              name: "Investment Account",
              type: "ASSET",
              category: "INVESTMENT",
              initialBalance: 0,
            },
            {
              name: "Primary Credit Card",
              type: "LIABILITY",
              category: "CREDIT_CARD",
              initialBalance: 0,
            },
            {
              name: "Car Loan",
              type: "LIABILITY",
              category: "LOAN",
              initialBalance: 0,
            },
            {
              name: "Mortgage",
              type: "LIABILITY",
              category: "LOAN",
              initialBalance: 0,
            },
          ],
        },
      ];

      const template = templates.find((t) => t.id === templateId);

      if (!template) {
        return reply.code(404).send({ error: "Template not found" });
      }

      try {
        // Create accounts from template
        const accounts = await Promise.all(
          template.accounts.map((account) =>
            prisma.account.create({
              data: {
                name: account.name,
                type: account.type,
                category: account.category,
                balance: parseFloat(account.initialBalance || 0),
                currency: "USD", // Default currency
                userId: request.user.id,
              },
            })
          )
        );

        return { success: true, accounts };
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );
}
