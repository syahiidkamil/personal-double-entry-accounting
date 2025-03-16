import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AuthProvider } from "./shared/contexts/AuthProvider";
import { SonnerProvider } from "./shared/components/ui/sonner-provider";
import ProtectedRoute from "./shared/routes/ProtectedRoute";
import PublicRoute from "./shared/routes/PublicRoute";
import DashboardLayout from "./shared/components/DashboardLayout";
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import NotFoundPage from "./features/not-found/NotFoundPage";

// Dummy Components for missing pages
const DashboardHomePage = () => <div>Dashboard Home Page</div>;
const AccountsPage = () => <div>Accounts Page</div>;
const TransactionsPage = () => <div>Transactions Page</div>;
const TransactionNewPage = () => <div>New Transaction Page</div>;
const TransactionTransferPage = () => <div>Transfer Funds Page</div>;
const DebtsPage = () => <div>Debt & Liabilities Page</div>;
const BalanceSheetPage = () => <div>Balance Sheet Report</div>;
const IncomeStatementPage = () => <div>Income Statement Report</div>;
const SpendingAnalysisPage = () => <div>Spending Analysis Report</div>;
const NetWorthPage = () => <div>Net Worth Report</div>;

// Route configuration array
const routesConfig = [
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardHomePage />,
      },
      {
        path: "dashboard",
        element: <DashboardHomePage />,
      },
      {
        path: "accounts",
        element: <AccountsPage />,
      },
      {
        path: "transactions",
        element: <TransactionsPage />,
      },
      {
        path: "transactions/new",
        element: <TransactionNewPage />,
      },
      {
        path: "transactions/transfer",
        element: <TransactionTransferPage />,
      },
      {
        path: "debts",
        element: <DebtsPage />,
      },
      {
        path: "reports/balance-sheet",
        element: <BalanceSheetPage />,
      },
      {
        path: "reports/income-statement",
        element: <IncomeStatementPage />,
      },
      {
        path: "reports/spending",
        element: <SpendingAnalysisPage />,
      },
      {
        path: "reports/net-worth",
        element: <NetWorthPage />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];

// Create the router from the routes configuration
const router = createBrowserRouter(routesConfig);

const App = () => {
  return (
    <AuthProvider>
      <SonnerProvider />
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;
