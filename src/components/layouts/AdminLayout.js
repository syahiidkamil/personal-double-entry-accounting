import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Admin layout component with sidebar navigation
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top navigation */}
      <nav className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>

              <Link
                href="/admin"
                className="ml-2 flex-shrink-0 text-xl font-bold"
              >
                Admin Dashboard
              </Link>
            </div>

            <div className="flex items-center">
              <span className="text-gray-300 mr-4">{user?.name} (Admin)</span>
              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`bg-gray-800 text-white w-64 min-h-screen ${
            isSidebarOpen ? "block" : "hidden"
          }`}
        >
          <div className="p-4">
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/admin"
                    className={`block px-4 py-2 rounded-md ${
                      router.pathname === "/admin"
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/products"
                    className={`block px-4 py-2 rounded-md ${
                      router.pathname.includes("/admin/products")
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white"
                    }`}
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/"
                    className="block px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Back to Website
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-grow p-6 ${isSidebarOpen ? "ml-64" : "ml-0"}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
