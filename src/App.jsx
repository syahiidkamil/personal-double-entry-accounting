import { createBrowserRouter, RouterProvider } from "react-router";
import { SonnerProvider } from "./shared/components/ui/sonner-provider";
import ProtectedRoute from "./shared/routes/ProtectedRoute";
import PublicRoute from "./shared/routes/PublicRoute";
import AdminRoute from "./shared/routes/AdminRoute";
import DashboardLayout from "./shared/components/DashboardLayout";
import { AuthProvider } from "./features/auth/contexts/AuthProvider";

// Import pages
import LoginPage from "./features/auth/LoginPage";
import RegisterPage from "./features/auth/RegisterPage";
import NotFoundPage from "./features/not-found/NotFoundPage";
import DashboardHomePage from "./features/dashboard-home/DashboardHomePage";
import ProfilePage from "./features/profile/ProfilePage";

// Import admin pages
import UserManagementPage from "./features/admin/users/UserManagementPage";
import InvitationCodesPage from "./features/admin/invitation-codes/InvitationCodesPage";

// Dummy Components for missing pages
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
        path: "profile",
        element: <ProfilePage />,
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
      // Admin Routes (protected by AdminRoute)
      {
        path: "admin/users",
        element: (
          <AdminRoute>
            <UserManagementPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/invitation-codes",
        element: (
          <AdminRoute>
            <InvitationCodesPage />
          </AdminRoute>
        ),
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

// Initialize router only on client side
const App = () => {
  // We need to check if we're in a browser environment before creating the router
  if (typeof window === 'undefined') {
    return null;
  }

  // Create browser router without a basename
  // This will make it work directly from the root URL
  const router = createBrowserRouter(routesConfig);

  return (
    <AuthProvider>
      <SonnerProvider />
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;