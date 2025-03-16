// api/routes/reports.js
import prisma from "../db/prisma.js";

export default async function (fastify, opts) {
  // Get transaction statistics
  fastify.get(
    "/api/reports/transactions-stats",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const {
        period = "month", // day, month, year
        fromDate,
        toDate,
      } = request.query;

      try {
        // Default date range if not provided
        const now = new Date();
        const defaultFromDate = new Date();
        defaultFromDate.setMonth(now.getMonth() - 3); // Last 3 months by default

        const startDate = fromDate ? new Date(fromDate) : defaultFromDate;
        const endDate = toDate ? new Date(toDate) : now;

        // Get all transactions in date range
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: request.user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            category: true,
          },
        });

        // Process transactions based on categories
        const incomeTransactions = transactions.filter(
          (t) => t.category && t.category.type === "INCOME"
        );

        const expenseTransactions = transactions.filter(
          (t) => t.category && t.category.type === "EXPENSE"
        );

        // Calculate totals
        const totalIncome = incomeTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        );
        const totalExpenses = expenseTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        );

        // Group by category
        const incomeByCategory = {};
        incomeTransactions.forEach((t) => {
          if (t.category) {
            const categoryName = t.category.name;
            incomeByCategory[categoryName] =
              (incomeByCategory[categoryName] || 0) + t.amount;
          }
        });

        const expensesByCategory = {};
        expenseTransactions.forEach((t) => {
          if (t.category) {
            const categoryName = t.category.name;
            expensesByCategory[categoryName] =
              (expensesByCategory[categoryName] || 0) + t.amount;
          }
        });

        // Group by time period
        const groupByPeriod = (transactions) => {
          const grouped = {};

          transactions.forEach((t) => {
            let key;
            const date = new Date(t.date);

            if (period === "day") {
              key = date.toISOString().split("T")[0]; // YYYY-MM-DD
            } else if (period === "month") {
              key = `${date.getFullYear()}-${String(
                date.getMonth() + 1
              ).padStart(2, "0")}`; // YYYY-MM
            } else if (period === "year") {
              key = String(date.getFullYear()); // YYYY
            }

            if (!grouped[key]) {
              grouped[key] = {
                income: 0,
                expenses: 0,
                net: 0,
                date: key,
              };
            }

            if (t.category && t.category.type === "INCOME") {
              grouped[key].income += t.amount;
              grouped[key].net += t.amount;
            } else if (t.category && t.category.type === "EXPENSE") {
              grouped[key].expenses += t.amount;
              grouped[key].net -= t.amount;
            }
          });

          // Convert to array and sort by date
          return Object.values(grouped).sort((a, b) =>
            a.date.localeCompare(b.date)
          );
        };

        const timeSeriesData = groupByPeriod(transactions);

        return {
          summary: {
            totalIncome,
            totalExpenses,
            netIncome: totalIncome - totalExpenses,
            period: {
              from: startDate,
              to: endDate,
            },
          },
          byCategory: {
            income: incomeByCategory,
            expenses: expensesByCategory,
          },
          timeSeries: timeSeriesData,
        };
      } catch (error) {
        console.error("Stats error:", error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Get balance sheet
  fastify.get(
    "/api/reports/balance-sheet",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { asOfDate } = request.query;

      try {
        const date = asOfDate ? new Date(asOfDate) : new Date();

        // Get all accounts
        const accounts = await prisma.account.findMany({
          where: {
            userId: request.user.id,
          },
        });

        // Categorize accounts
        const assets = accounts.filter((a) => a.type === "ASSET");
        const liabilities = accounts.filter((a) => a.type === "LIABILITY");

        // Calculate totals
        const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
        const totalLiabilities = liabilities.reduce(
          (sum, a) => sum + Math.abs(a.balance),
          0
        );
        const netWorth = totalAssets - totalLiabilities;

        // Group assets by category
        const assetsByCategory = {};
        assets.forEach((a) => {
          const category = a.category;
          if (!assetsByCategory[category]) {
            assetsByCategory[category] = [];
          }
          assetsByCategory[category].push(a);
        });

        // Group liabilities by category
        const liabilitiesByCategory = {};
        liabilities.forEach((a) => {
          const category = a.category;
          if (!liabilitiesByCategory[category]) {
            liabilitiesByCategory[category] = [];
          }
          liabilitiesByCategory[category].push(a);
        });

        return {
          asOfDate: date,
          assets: {
            accounts: assets,
            byCategory: assetsByCategory,
            total: totalAssets,
          },
          liabilities: {
            accounts: liabilities,
            byCategory: liabilitiesByCategory,
            total: totalLiabilities,
          },
          equity: {
            netWorth,
          },
        };
      } catch (error) {
        console.error("Balance sheet error:", error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Get income statement
  fastify.get(
    "/api/reports/income-statement",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { fromDate, toDate } = request.query;

      try {
        // Default to current month if dates not provided
        const now = new Date();
        const defaultFromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const defaultToDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        );

        const startDate = fromDate ? new Date(fromDate) : defaultFromDate;
        const endDate = toDate ? new Date(toDate) : defaultToDate;

        // Get all transactions in date range
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: request.user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            category: true,
          },
        });

        // Process transactions
        const incomeTransactions = transactions.filter(
          (t) => t.category && t.category.type === "INCOME"
        );

        const expenseTransactions = transactions.filter(
          (t) => t.category && t.category.type === "EXPENSE"
        );

        // Group by category
        const incomeByCategory = {};
        incomeTransactions.forEach((t) => {
          const categoryName = t.category ? t.category.name : "Uncategorized";
          if (!incomeByCategory[categoryName]) {
            incomeByCategory[categoryName] = {
              total: 0,
              transactions: [],
            };
          }
          incomeByCategory[categoryName].total += t.amount;
          incomeByCategory[categoryName].transactions.push(t);
        });

        const expensesByCategory = {};
        expenseTransactions.forEach((t) => {
          const categoryName = t.category ? t.category.name : "Uncategorized";
          if (!expensesByCategory[categoryName]) {
            expensesByCategory[categoryName] = {
              total: 0,
              transactions: [],
            };
          }
          expensesByCategory[categoryName].total += t.amount;
          expensesByCategory[categoryName].transactions.push(t);
        });

        // Calculate totals
        const totalIncome = incomeTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        );
        const totalExpenses = expenseTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        );
        const netIncome = totalIncome - totalExpenses;

        return {
          period: {
            from: startDate,
            to: endDate,
          },
          income: {
            byCategory: incomeByCategory,
            total: totalIncome,
          },
          expenses: {
            byCategory: expensesByCategory,
            total: totalExpenses,
          },
          netIncome,
        };
      } catch (error) {
        console.error("Income statement error:", error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Get net worth over time
  fastify.get(
    "/api/reports/net-worth-history",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const {
        period = "month", // day, month, year
        months = 12,
      } = request.query;

      try {
        const now = new Date();
        const endDate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
        const startDate = new Date(endDate);

        // Set start date based on period and number of months
        if (period === "month") {
          startDate.setMonth(startDate.getMonth() - parseInt(months));
        } else if (period === "year") {
          startDate.setFullYear(
            startDate.getFullYear() - parseInt(months / 12)
          );
        } else {
          // day
          startDate.setDate(startDate.getDate() - parseInt(months * 30)); // Approximate
        }

        // Get all transactions
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: request.user.id,
          },
          orderBy: {
            date: "asc",
          },
        });

        // Get all accounts with current balances
        const accounts = await prisma.account.findMany({
          where: {
            userId: request.user.id,
          },
        });

        // Calculate current net worth
        const currentAssets = accounts
          .filter((a) => a.type === "ASSET")
          .reduce((sum, a) => sum + a.balance, 0);

        const currentLiabilities = accounts
          .filter((a) => a.type === "LIABILITY")
          .reduce((sum, a) => sum + Math.abs(a.balance), 0);

        const currentNetWorth = currentAssets - currentLiabilities;

        // Generate time periods
        const periods = [];
        const periodFormat =
          period === "day"
            ? "YYYY-MM-DD"
            : period === "month"
            ? "YYYY-MM"
            : "YYYY";

        // Implementation would need a date library like date-fns or moment.js
        // for proper date manipulation, but here's a simplified approach:
        const generatePeriods = () => {
          const result = [];
          const current = new Date(startDate);

          while (current <= endDate) {
            const year = current.getFullYear();
            const month = String(current.getMonth() + 1).padStart(2, "0");
            const day = String(current.getDate()).padStart(2, "0");

            let periodKey;
            if (period === "day") {
              periodKey = `${year}-${month}-${day}`;
            } else if (period === "month") {
              periodKey = `${year}-${month}`;
            } else {
              // year
              periodKey = `${year}`;
            }

            result.push(periodKey);

            // Move to next period
            if (period === "day") {
              current.setDate(current.getDate() + 1);
            } else if (period === "month") {
              current.setMonth(current.getMonth() + 1);
            } else {
              // year
              current.setFullYear(current.getFullYear() + 1);
            }
          }

          return result;
        };

        const periodKeys = generatePeriods();

        // Working backwards from current balances to calculate historical net worth
        // This is a simplified approach and may not be completely accurate
        const historicalData = periodKeys.map((periodKey) => {
          let periodEnd;

          if (period === "day") {
            const [year, month, day] = periodKey.split("-").map(Number);
            periodEnd = new Date(year, month - 1, day, 23, 59, 59);
          } else if (period === "month") {
            const [year, month] = periodKey.split("-").map(Number);
            // Last day of month
            periodEnd = new Date(year, month, 0, 23, 59, 59);
          } else {
            // year
            const year = parseInt(periodKey);
            // Last day of year
            periodEnd = new Date(year, 11, 31, 23, 59, 59);
          }

          // Get transactions that occurred after this period
          const laterTransactions = transactions.filter(
            (t) => new Date(t.date) > periodEnd
          );

          // Reverse the effect of later transactions to calculate historical balances
          const balanceAdjustments = {};

          laterTransactions.forEach((t) => {
            // Initialize account balances if not yet tracked
            if (!balanceAdjustments[t.fromAccountId]) {
              balanceAdjustments[t.fromAccountId] = 0;
            }
            if (!balanceAdjustments[t.toAccountId]) {
              balanceAdjustments[t.toAccountId] = 0;
            }

            // Reverse the transaction's effect
            balanceAdjustments[t.fromAccountId] += t.amount;
            balanceAdjustments[t.toAccountId] -= t.amount;
          });

          // Calculate historical account balances
          const historicalAccounts = accounts.map((account) => {
            const adjustment = balanceAdjustments[account.id] || 0;
            return {
              ...account,
              historicalBalance: account.balance - adjustment,
            };
          });

          // Calculate historical net worth
          const historicalAssets = historicalAccounts
            .filter((a) => a.type === "ASSET")
            .reduce((sum, a) => sum + a.historicalBalance, 0);

          const historicalLiabilities = historicalAccounts
            .filter((a) => a.type === "LIABILITY")
            .reduce((sum, a) => sum + Math.abs(a.historicalBalance), 0);

          const historicalNetWorth = historicalAssets - historicalLiabilities;

          return {
            period: periodKey,
            date: periodEnd,
            assets: historicalAssets,
            liabilities: historicalLiabilities,
            netWorth: historicalNetWorth,
          };
        });

        return {
          current: {
            assets: currentAssets,
            liabilities: currentLiabilities,
            netWorth: currentNetWorth,
            asOf: new Date(),
          },
          history: historicalData,
          period: {
            type: period,
            from: startDate,
            to: endDate,
          },
        };
      } catch (error) {
        console.error("Net worth history error:", error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Get spending by category
  fastify.get(
    "/api/reports/spending-by-category",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      const { fromDate, toDate } = request.query;

      try {
        // Default to current month if dates not provided
        const now = new Date();
        const defaultFromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const defaultToDate = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        );

        const startDate = fromDate ? new Date(fromDate) : defaultFromDate;
        const endDate = toDate ? new Date(toDate) : defaultToDate;

        // Get expense categories
        const categories = await prisma.category.findMany({
          where: {
            userId: request.user.id,
            type: "EXPENSE",
          },
        });

        // Get all expense transactions in date range
        const transactions = await prisma.transaction.findMany({
          where: {
            userId: request.user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
            category: {
              type: "EXPENSE",
            },
          },
          include: {
            category: true,
          },
        });

        // Group by category
        const spendingByCategory = {};
        let totalSpending = 0;

        transactions.forEach((t) => {
          const categoryName = t.category ? t.category.name : "Uncategorized";
          if (!spendingByCategory[categoryName]) {
            spendingByCategory[categoryName] = {
              amount: 0,
              count: 0,
              transactions: [],
              color: t.category ? t.category.color : "#CCCCCC",
              icon: t.category ? t.category.icon : null,
            };
          }

          spendingByCategory[categoryName].amount += t.amount;
          spendingByCategory[categoryName].count += 1;
          spendingByCategory[categoryName].transactions.push({
            id: t.id,
            description: t.description,
            amount: t.amount,
            date: t.date,
          });

          totalSpending += t.amount;
        });

        // Calculate percentages
        Object.keys(spendingByCategory).forEach((category) => {
          spendingByCategory[category].percentage =
            totalSpending > 0
              ? (spendingByCategory[category].amount / totalSpending) * 100
              : 0;
        });

        // Convert to array and sort by amount
        const categoriesArray = Object.keys(spendingByCategory)
          .map((name) => ({
            name,
            ...spendingByCategory[name],
          }))
          .sort((a, b) => b.amount - a.amount);

        return {
          period: {
            from: startDate,
            to: endDate,
          },
          totalSpending,
          categories: categoriesArray,
        };
      } catch (error) {
        console.error("Spending by category error:", error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );

  // Get debt insights
  fastify.get(
    "/api/reports/debt-insights",
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        // Get all debt accounts (liabilities)
        const debtAccounts = await prisma.account.findMany({
          where: {
            userId: request.user.id,
            type: "LIABILITY",
          },
        });

        // Get debt-related transactions
        const debtTransactions = await prisma.transaction.findMany({
          where: {
            userId: request.user.id,
            OR: debtAccounts.map((account) => ({
              OR: [{ fromAccountId: account.id }, { toAccountId: account.id }],
            })),
          },
          orderBy: {
            date: "desc",
          },
          include: {
            fromAccount: true,
            toAccount: true,
          },
        });

        // Process each debt account
        const debts = debtAccounts.map((account) => {
          // Find payments for this debt
          const payments = debtTransactions.filter(
            (t) =>
              t.toAccountId === account.id && t.fromAccount.type === "ASSET"
          );

          // Calculate total paid (principal and interest)
          const totalPaid = payments.reduce((sum, t) => sum + t.amount, 0);

          // Calculate principal and interest if available
          const principalPaid = payments.reduce(
            (sum, t) => sum + (t.principalAmount || t.amount),
            0
          );

          const interestPaid = payments.reduce(
            (sum, t) => sum + (t.interestAmount || 0),
            0
          );

          // Get last payment date
          const lastPayment = payments.length > 0 ? payments[0] : null;

          // Calculate months to payoff (simplified)
          let monthsToPayoff = null;
          if (account.balance < 0 && account.paymentAmount) {
            monthsToPayoff = Math.ceil(
              Math.abs(account.balance) / account.paymentAmount
            );
          }

          return {
            id: account.id,
            name: account.name,
            balance: account.balance,
            interestRate: account.interestRate,
            paymentAmount: account.paymentAmount,
            payments: {
              count: payments.length,
              totalPaid,
              principalPaid,
              interestPaid,
              lastPayment: lastPayment
                ? {
                    date: lastPayment.date,
                    amount: lastPayment.amount,
                  }
                : null,
            },
            insights: {
              monthsToPayoff,
              totalInterestProjected: monthsToPayoff
                ? monthsToPayoff * account.paymentAmount -
                  Math.abs(account.balance)
                : null,
            },
          };
        });

        // Calculate debt summary
        const totalDebt = debtAccounts.reduce(
          (sum, a) => sum + Math.abs(a.balance),
          0
        );
        const totalMonthlyPayments = debtAccounts.reduce(
          (sum, a) => sum + (a.paymentAmount || 0),
          0
        );

        return {
          summary: {
            totalDebt,
            totalMonthlyPayments,
            debtCount: debtAccounts.length,
          },
          debts,
        };
      } catch (error) {
        console.error("Debt insights error:", error);
        reply.code(500).send({ error: "Server error" });
      }
    }
  );
}
