// api/routes/transactions.js
import prisma from "../db/prisma.js";

export default async function (fastify, opts) {
  // Get all transactions
  fastify.get(
    "/api/transactions",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const {
        limit = 50,
        offset = 0,
        fromDate,
        toDate,
        accountId,
        categoryId,
        search,
      } = request.query;

      try {
        // Build filter conditions
        const whereClause = {
          userId: request.user.id,
          ...(fromDate && { date: { gte: new Date(fromDate) } }),
          ...(toDate && {
            date: { ...(fromDate ? {} : {}), lte: new Date(toDate) },
          }),
          ...(accountId && {
            OR: [
              { fromAccountId: parseInt(accountId) },
              { toAccountId: parseInt(accountId) },
            ],
          }),
          ...(categoryId && { categoryId: parseInt(categoryId) }),
          ...(search && {
            description: {
              contains: search,
            },
          }),
        };

        // Get transactions with pagination
        const transactions = await prisma.transaction.findMany({
          where: whereClause,
          include: {
            fromAccount: true,
            toAccount: true,
            category: true,
          },
          orderBy: {
            date: "desc",
          },
          skip: parseInt(offset),
          take: parseInt(limit),
        });

        // Get total count for pagination
        const total = await prisma.transaction.count({
          where: whereClause,
        });

        return {
          data: transactions,
          pagination: {
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
          },
        };
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Create transaction
  fastify.post(
    "/api/transactions",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const {
        description,
        amount,
        date,
        fromAccountId,
        toAccountId,
        categoryId,
        notes,
        principalAmount,
        interestAmount,
        feeAmount,
        isExtraPayment,
      } = request.body;

      try {
        // Verify accounts belong to user
        const [fromAccount, toAccount] = await Promise.all([
          prisma.account.findFirst({
            where: {
              id: parseInt(fromAccountId),
              userId: request.user.id,
            },
          }),
          prisma.account.findFirst({
            where: {
              id: parseInt(toAccountId),
              userId: request.user.id,
            },
          }),
        ]);

        if (!fromAccount || !toAccount) {
          return reply.code(404).send({ error: "Account not found" });
        }

        // Verify category if provided
        let category = null;
        if (categoryId) {
          category = await prisma.category.findFirst({
            where: {
              id: parseInt(categoryId),
              userId: request.user.id,
            },
          });

          if (!category) {
            return reply.code(404).send({ error: "Category not found" });
          }
        }

        // Validate and parse amount
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          return reply
            .code(400)
            .send({ error: "Amount must be a positive number" });
        }

        // Create transaction
        const transaction = await prisma.transaction.create({
          data: {
            description,
            amount: parsedAmount,
            date: new Date(date),
            fromAccountId: parseInt(fromAccountId),
            toAccountId: parseInt(toAccountId),
            categoryId: categoryId ? parseInt(categoryId) : null,
            notes,
            principalAmount: principalAmount
              ? parseFloat(principalAmount)
              : null,
            interestAmount: interestAmount ? parseFloat(interestAmount) : null,
            feeAmount: feeAmount ? parseFloat(feeAmount) : null,
            isExtraPayment: isExtraPayment || false,
            userId: request.user.id,
          },
          include: {
            fromAccount: true,
            toAccount: true,
            category: true,
          },
        });

        // Update account balances
        await Promise.all([
          prisma.account.update({
            where: { id: parseInt(fromAccountId) },
            data: { balance: fromAccount.balance - parsedAmount },
          }),
          prisma.account.update({
            where: { id: parseInt(toAccountId) },
            data: { balance: toAccount.balance + parsedAmount },
          }),
        ]);

        return transaction;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Get single transaction
  fastify.get(
    "/api/transactions/:id",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        const transaction = await prisma.transaction.findFirst({
          where: {
            id: parseInt(id),
            userId: request.user.id,
          },
          include: {
            fromAccount: true,
            toAccount: true,
            category: true,
          },
        });

        if (!transaction) {
          return reply.code(404).send({ error: "Transaction not found" });
        }

        return transaction;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Update transaction
  fastify.put(
    "/api/transactions/:id",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        description,
        amount,
        date,
        fromAccountId,
        toAccountId,
        categoryId,
        notes,
        principalAmount,
        interestAmount,
        feeAmount,
        isExtraPayment,
      } = request.body;

      try {
        // Find the transaction
        const existingTransaction = await prisma.transaction.findFirst({
          where: {
            id: parseInt(id),
            userId: request.user.id,
          },
          include: {
            fromAccount: true,
            toAccount: true,
          },
        });

        if (!existingTransaction) {
          return reply.code(404).send({ error: "Transaction not found" });
        }

        // If accounts are changing, verify they belong to the user
        let fromAccount = existingTransaction.fromAccount;
        let toAccount = existingTransaction.toAccount;

        if (
          fromAccountId &&
          parseInt(fromAccountId) !== existingTransaction.fromAccountId
        ) {
          fromAccount = await prisma.account.findFirst({
            where: {
              id: parseInt(fromAccountId),
              userId: request.user.id,
            },
          });

          if (!fromAccount) {
            return reply.code(404).send({ error: "From account not found" });
          }
        }

        if (
          toAccountId &&
          parseInt(toAccountId) !== existingTransaction.toAccountId
        ) {
          toAccount = await prisma.account.findFirst({
            where: {
              id: parseInt(toAccountId),
              userId: request.user.id,
            },
          });

          if (!toAccount) {
            return reply.code(404).send({ error: "To account not found" });
          }
        }

        // If category is changing, verify it belongs to the user
        if (categoryId) {
          const category = await prisma.category.findFirst({
            where: {
              id: parseInt(categoryId),
              userId: request.user.id,
            },
          });

          if (!category) {
            return reply.code(404).send({ error: "Category not found" });
          }
        }

        // Validate new amount if provided
        const parsedAmount = amount
          ? parseFloat(amount)
          : existingTransaction.amount;
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
          return reply
            .code(400)
            .send({ error: "Amount must be a positive number" });
        }

        // Start a transaction for updating balances and the transaction record
        await prisma.$transaction(async (tx) => {
          // Revert previous balance changes
          if (
            fromAccountId !== existingTransaction.fromAccountId ||
            toAccountId !== existingTransaction.toAccountId ||
            parsedAmount !== existingTransaction.amount
          ) {
            // Revert previous transaction effect
            await tx.account.update({
              where: { id: existingTransaction.fromAccountId },
              data: {
                balance:
                  existingTransaction.fromAccount.balance +
                  existingTransaction.amount,
              },
            });

            await tx.account.update({
              where: { id: existingTransaction.toAccountId },
              data: {
                balance:
                  existingTransaction.toAccount.balance -
                  existingTransaction.amount,
              },
            });

            // Apply new transaction effect
            await tx.account.update({
              where: {
                id: parseInt(
                  fromAccountId || existingTransaction.fromAccountId
                ),
              },
              data: { balance: fromAccount.balance - parsedAmount },
            });

            await tx.account.update({
              where: {
                id: parseInt(toAccountId || existingTransaction.toAccountId),
              },
              data: { balance: toAccount.balance + parsedAmount },
            });
          }

          // Update transaction
          return tx.transaction.update({
            where: { id: parseInt(id) },
            data: {
              description,
              amount: parsedAmount,
              date: date ? new Date(date) : undefined,
              fromAccountId: fromAccountId
                ? parseInt(fromAccountId)
                : undefined,
              toAccountId: toAccountId ? parseInt(toAccountId) : undefined,
              categoryId: categoryId ? parseInt(categoryId) : undefined,
              notes,
              principalAmount: principalAmount
                ? parseFloat(principalAmount)
                : undefined,
              interestAmount: interestAmount
                ? parseFloat(interestAmount)
                : undefined,
              feeAmount: feeAmount ? parseFloat(feeAmount) : undefined,
              isExtraPayment:
                isExtraPayment !== undefined ? isExtraPayment : undefined,
            },
            include: {
              fromAccount: true,
              toAccount: true,
              category: true,
            },
          });
        });

        // Fetch updated transaction
        const updatedTransaction = await prisma.transaction.findFirst({
          where: {
            id: parseInt(id),
            userId: request.user.id,
          },
          include: {
            fromAccount: true,
            toAccount: true,
            category: true,
          },
        });

        return updatedTransaction;
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Delete transaction
  fastify.delete(
    "/api/transactions/:id",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;

      try {
        // Find the transaction
        const transaction = await prisma.transaction.findFirst({
          where: {
            id: parseInt(id),
            userId: request.user.id,
          },
          include: {
            fromAccount: true,
            toAccount: true,
          },
        });

        if (!transaction) {
          return reply.code(404).send({ error: "Transaction not found" });
        }

        // Perform the delete and account updates in a transaction
        await prisma.$transaction(async (tx) => {
          // Revert the account balance changes
          await tx.account.update({
            where: { id: transaction.fromAccountId },
            data: {
              balance: transaction.fromAccount.balance + transaction.amount,
            },
          });

          await tx.account.update({
            where: { id: transaction.toAccountId },
            data: {
              balance: transaction.toAccount.balance - transaction.amount,
            },
          });

          // Delete the transaction
          await tx.transaction.delete({
            where: { id: parseInt(id) },
          });
        });

        return { success: true };
      } catch (error) {
        console.error(error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Import transactions from CSV
  fastify.post(
    "/api/transactions/import",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const { transactions, defaultFromAccountId, defaultToAccountId } =
          request.body;

        if (!Array.isArray(transactions) || transactions.length === 0) {
          return reply.code(400).send({ error: "No transactions to import" });
        }

        // Verify default accounts belong to user if provided
        if (defaultFromAccountId) {
          const fromAccount = await prisma.account.findFirst({
            where: {
              id: parseInt(defaultFromAccountId),
              userId: request.user.id,
            },
          });

          if (!fromAccount) {
            return reply
              .code(404)
              .send({ error: "Default from account not found" });
          }
        }

        if (defaultToAccountId) {
          const toAccount = await prisma.account.findFirst({
            where: {
              id: parseInt(defaultToAccountId),
              userId: request.user.id,
            },
          });

          if (!toAccount) {
            return reply
              .code(404)
              .send({ error: "Default to account not found" });
          }
        }

        // Process each transaction
        const results = await Promise.all(
          transactions.map(async (transaction) => {
            try {
              // Get account IDs - either from the transaction or defaults
              const fromAccountId = parseInt(
                transaction.fromAccountId || defaultFromAccountId
              );
              const toAccountId = parseInt(
                transaction.toAccountId || defaultToAccountId
              );

              if (!fromAccountId || !toAccountId) {
                return {
                  success: false,
                  error: "Missing account information",
                  transaction,
                };
              }

              // Verify accounts
              const [fromAccount, toAccount] = await Promise.all([
                prisma.account.findFirst({
                  where: {
                    id: fromAccountId,
                    userId: request.user.id,
                  },
                }),
                prisma.account.findFirst({
                  where: {
                    id: toAccountId,
                    userId: request.user.id,
                  },
                }),
              ]);

              if (!fromAccount || !toAccount) {
                return {
                  success: false,
                  error: "Account not found",
                  transaction,
                };
              }

              // Validate amount
              const amount = parseFloat(transaction.amount);
              if (isNaN(amount) || amount <= 0) {
                return {
                  success: false,
                  error: "Invalid amount",
                  transaction,
                };
              }

              // Create transaction and update balances in a transaction
              const result = await prisma.$transaction(async (tx) => {
                // Create the transaction
                const newTransaction = await tx.transaction.create({
                  data: {
                    description:
                      transaction.description || "Imported transaction",
                    amount,
                    date: transaction.date
                      ? new Date(transaction.date)
                      : new Date(),
                    fromAccountId,
                    toAccountId,
                    categoryId: transaction.categoryId
                      ? parseInt(transaction.categoryId)
                      : null,
                    notes: transaction.notes || "Imported from CSV",
                    userId: request.user.id,
                  },
                });

                // Update account balances
                await tx.account.update({
                  where: { id: fromAccountId },
                  data: { balance: fromAccount.balance - amount },
                });

                await tx.account.update({
                  where: { id: toAccountId },
                  data: { balance: toAccount.balance + amount },
                });

                return newTransaction;
              });

              return {
                success: true,
                transaction: result,
              };
            } catch (error) {
              console.error("Error importing transaction:", error);
              return {
                success: false,
                error: error.message,
                transaction,
              };
            }
          })
        );

        // Count successes and failures
        const successes = results.filter((r) => r.success).length;
        const failures = results.filter((r) => !r.success).length;

        return {
          message: `Imported ${successes} transactions successfully. ${failures} failed.`,
          results,
        };
      } catch (error) {
        console.error("Transaction import error:", error);
        reply.code(500).send({ error: "Server error during import" });
      }
    }
  );
}
