import React from "react";
import { Link } from "react-router";
import { useAuth } from "../../features/auth/hooks/useAuth";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";

const DashboardHomePage = () => {
  const { user } = useAuth();

  // Dummy data for financial charts
  const balanceData = [
    { name: "Jan", assets: 10000, liabilities: 5000 },
    { name: "Feb", assets: 11000, liabilities: 4800 },
    { name: "Mar", assets: 12000, liabilities: 4600 },
    { name: "Apr", assets: 12500, liabilities: 4500 },
    { name: "May", assets: 13000, liabilities: 4300 },
    { name: "Jun", assets: 14000, liabilities: 4000 },
    { name: "Jul", assets: 15000, liabilities: 3800 },
  ];

  // Dummy data for expense categories
  const expenseCategoryData = [
    { name: "Housing", value: 1200 },
    { name: "Food", value: 800 },
    { name: "Transportation", value: 400 },
    { name: "Entertainment", value: 300 },
    { name: "Other", value: 200 },
  ];

  // Dummy data for income vs expenses
  const cashflowData = [
    { name: "Jan", income: 3000, expenses: 2400 },
    { name: "Feb", income: 3100, expenses: 2200 },
    { name: "Mar", income: 3200, expenses: 2800 },
    { name: "Apr", income: 3300, expenses: 2300 },
    { name: "May", income: 3400, expenses: 2100 },
    { name: "Jun", income: 3500, expenses: 2400 },
    { name: "Jul", income: 3600, expenses: 2500 },
  ];

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28FD0"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h1>
      <p className="text-gray-600 mb-6">
        Welcome to your financial dashboard, {user?.name || "Admin"}!
      </p>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Assets</h3>
          <p className="text-2xl font-bold">$15,000</p>
          <p className="text-xs text-green-500 flex items-center">
            <span>↑ 5.2%</span> <span className="ml-1">vs last month</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Total Liabilities</h3>
          <p className="text-2xl font-bold">$3,800</p>
          <p className="text-xs text-green-500 flex items-center">
            <span>↓ 4.7%</span> <span className="ml-1">vs last month</span>
          </p>
        </div>

        <div className="bg-white p-4 rounded shadow border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Net Worth</h3>
          <p className="text-2xl font-bold">$11,200</p>
          <p className="text-xs text-green-500 flex items-center">
            <span>↑ 9.3%</span> <span className="ml-1">vs last month</span>
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Assets vs Liabilities Chart */}
        <div className="bg-white p-6 rounded shadow border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Assets vs Liabilities
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={balanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, undefined]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="assets"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="liabilities"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories Chart */}
        <div className="bg-white p-6 rounded shadow border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Expense Categories
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {expenseCategoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value}`, "Amount"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income vs Expenses Chart */}
        <div className="bg-white p-6 rounded shadow border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Income vs Expenses
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cashflowData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value}`, undefined]} />
                <Legend />
                <Bar dataKey="income" fill="#10B981" />
                <Bar dataKey="expenses" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded shadow border border-gray-200">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Recent Transactions
          </h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-green-100 text-green-500 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Salary deposit</p>
                <p className="text-xs text-gray-500">2 days ago</p>
              </div>
              <div className="ml-auto text-sm font-medium text-green-500">
                +$3,000.00
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-red-100 text-red-500 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Grocery shopping</p>
                <p className="text-xs text-gray-500">3 days ago</p>
              </div>
              <div className="ml-auto text-sm font-medium text-red-500">
                -$150.00
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  ></path>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Transfer to Cash</p>
                <p className="text-xs text-gray-500">4 days ago</p>
              </div>
              <div className="ml-auto text-sm font-medium text-blue-500">
                $500.00
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline" size="sm" className="w-full">
              View All Transactions
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white p-6 rounded shadow border border-gray-200">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/accounts"
            className="flex items-center p-4 border border-gray-200 rounded hover:bg-gray-50"
          >
            <div className="mr-4 w-10 h-10 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                ></path>
              </svg>
            </div>
            <div>
              <p className="font-medium">Manage Accounts</p>
              <p className="text-sm text-gray-500">
                Add or edit your accounts
              </p>
            </div>
          </Link>

          <Link
            to="/transactions/new"
            className="flex items-center p-4 border border-gray-200 rounded hover:bg-gray-50"
          >
            <div className="mr-4 w-10 h-10 bg-green-100 text-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
            </div>
            <div>
              <p className="font-medium">New Transaction</p>
              <p className="text-sm text-gray-500">
                Record income or expense
              </p>
            </div>
          </Link>

          <Link
            to="/reports/balance-sheet"
            className="flex items-center p-4 border border-gray-200 rounded hover:bg-gray-50"
          >
            <div className="mr-4 w-10 h-10 bg-purple-100 text-purple-500 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
            </div>
            <div>
              <p className="font-medium">View Reports</p>
              <p className="text-sm text-gray-500">See your financial status</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardHomePage;