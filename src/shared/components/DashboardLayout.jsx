import React, { useState, useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import {
  LayoutDashboard,
  Wallet,
  ArrowRightLeft,
  CreditCard,
  FileText,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ChevronDown,
  FileSpreadsheet,
  TrendingUp,
  PieChart,
  BarChart4,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(false);

  // Navigation items
  const navigationItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      name: "Accounts",
      icon: Wallet,
      href: "/accounts",
    },
    {
      name: "Transactions",
      icon: ArrowRightLeft,
      href: "/transactions",
    },
    {
      name: "Debt & Liabilities",
      icon: CreditCard,
      href: "/debts",
    },
    {
      name: "Reports",
      icon: FileText,
      href: null, // No direct link for reports
      submenu: [
        {
          name: "Balance Sheet",
          icon: FileSpreadsheet,
          href: "/reports/balance-sheet",
        },
        {
          name: "Income Statement",
          icon: TrendingUp,
          href: "/reports/income-statement",
        },
        {
          name: "Spending Analysis",
          icon: PieChart,
          href: "/reports/spending",
        },
        { name: "Net Worth", icon: BarChart4, href: "/reports/net-worth" },
      ],
    },
  ];

  // Initialize sidebar state based on screen size
  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");

    // Set initial state
    if (mediaQuery.matches) {
      setSidebarCollapsed(true);
    }

    // Listen for changes in media query
    const handleChange = (e) => {
      if (e.matches) {
        setSidebarCollapsed(true);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    return () => {}; // No cleanup needed for modern browsers
  }, []);

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle logout action
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Toggle reports submenu
  const toggleReportsMenu = () => {
    if (!sidebarCollapsed) {
      setReportsExpanded(!reportsExpanded);
    }
  };

  // Determine if a reports submenu item is active
  const isReportActive = () => {
    return window.location.pathname.startsWith("/reports");
  };

  // Get current date for header
  const today = new Date();
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString(undefined, dateOptions);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top navigation bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-3 lg:px-6">
          {/* Logo and title in header - always visible */}
          <div className="flex items-center">
            {/* Mobile menu button - only on small screens */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 mr-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Logo and app name */}
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold">$</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-blue-600">FinTrack</h1>
                <p className="text-xs text-gray-500 hidden md:block">
                  Personal Accounting
                </p>
              </div>
            </div>
          </div>

          {/* Date display */}
          <div className="hidden md:block text-gray-600 text-sm">
            {formattedDate}
          </div>

          {/* User menu */}
          <div className="flex items-center">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100"
              >
                <div className="bg-purple-600 h-8 w-8 rounded-full flex items-center justify-center text-white font-medium">
                  <span>{user?.name?.charAt(0) || "A"}</span>
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.name || "Admin"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-40 border border-gray-200">
                  <div className="border-b border-gray-100 pb-2 pt-1 px-4">
                    <p className="text-sm font-medium text-gray-700">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || "admin@example.com"}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Desktop sidebar - without icon in header section */}
        <aside
          className={cn(
            "bg-white border-r border-gray-200 flex-shrink-0 hidden lg:flex lg:flex-col transition-all duration-300 relative",
            sidebarCollapsed ? "w-20" : "w-64"
          )}
        >
          {/* Sidebar toggle button - positioned higher at corner intersection */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 flex items-center justify-center h-6 w-6 bg-white border border-gray-200 rounded-full shadow-sm text-gray-500 hover:text-blue-600 z-20"
            style={{ top: "12px", transform: "translateY(-50%)" }} // Position at exact corner intersection
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Sidebar content - No icon in the sidebar header and no gap */}
          <div className="h-full flex flex-col">
            {/* Navigation - start immediately after header */}
            <nav className="flex-1 overflow-y-auto">
              <ul className="pt-0">
                {navigationItems.map((item, index) => (
                  <li key={item.name} className="relative">
                    {/* Regular menu items */}
                    {item.href ? (
                      <NavLink
                        to={item.href}
                        className={({ isActive }) =>
                          cn(
                            "flex items-center py-3 text-sm font-medium transition-all",
                            isActive
                              ? "bg-blue-50 text-blue-600"
                              : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                            sidebarCollapsed ? "justify-center px-3" : "px-4"
                          )
                        }
                        end={item.href === "/dashboard"} // Match dashboard exactly
                      >
                        {({ isActive }) => (
                          <>
                            {/* Active indicator */}
                            {isActive && !sidebarCollapsed && (
                              <div className="absolute left-0 inset-y-0 w-1 bg-blue-500 rounded-r-full"></div>
                            )}

                            <item.icon
                              className={cn(
                                "flex-shrink-0 h-5 w-5",
                                isActive ? "text-blue-600" : "text-gray-500"
                              )}
                            />

                            {!sidebarCollapsed && (
                              <span className="ml-3">{item.name}</span>
                            )}
                          </>
                        )}
                      </NavLink>
                    ) : (
                      /* Reports menu with submenu */
                      <>
                        {/* When sidebar is not collapsed, show reports as clickable header */}
                        {!sidebarCollapsed ? (
                          <button
                            className={cn(
                              "w-full flex items-center py-3 text-sm font-medium transition-all",
                              isReportActive()
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600",
                              "px-4"
                            )}
                            onClick={toggleReportsMenu}
                          >
                            {isReportActive() && (
                              <div className="absolute left-0 inset-y-0 w-1 bg-blue-500 rounded-r-full"></div>
                            )}

                            <item.icon
                              className={cn(
                                "flex-shrink-0 h-5 w-5",
                                isReportActive()
                                  ? "text-blue-600"
                                  : "text-gray-500"
                              )}
                            />

                            <span className="ml-3">{item.name}</span>
                            <ChevronDown
                              className={cn(
                                "ml-auto h-4 w-4 text-gray-500 transition-transform",
                                reportsExpanded && "rotate-180"
                              )}
                            />
                          </button>
                        ) : (
                          /* When sidebar is collapsed, show reports as a separator */
                          <div className="py-2 flex justify-center">
                            <div className="w-8 h-px bg-gray-200"></div>
                          </div>
                        )}

                        {/* In collapsed mode, show report submenu directly */}
                        {sidebarCollapsed && (
                          <div className="mt-1 space-y-1">
                            {item.submenu.map((subitem) => (
                              <NavLink
                                key={subitem.name}
                                to={subitem.href}
                                className={({ isActive }) =>
                                  cn(
                                    "flex justify-center items-center py-2 text-sm font-medium transition-all",
                                    isActive
                                      ? "bg-blue-50 text-blue-600"
                                      : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                                  )
                                }
                                title={subitem.name}
                              >
                                {({ isActive }) => (
                                  <subitem.icon
                                    className={cn(
                                      "flex-shrink-0 h-5 w-5",
                                      isActive
                                        ? "text-blue-600"
                                        : "text-gray-500"
                                    )}
                                  />
                                )}
                              </NavLink>
                            ))}
                          </div>
                        )}

                        {/* Expanded submenu for report items */}
                        {!sidebarCollapsed && reportsExpanded && (
                          <ul className="mt-1 pl-10 space-y-1">
                            {item.submenu.map((subitem) => (
                              <li key={subitem.name}>
                                <NavLink
                                  to={subitem.href}
                                  className={({ isActive }) =>
                                    cn(
                                      "flex items-center py-2 pl-4 pr-2 text-sm font-medium transition-all",
                                      isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                                    )
                                  }
                                >
                                  {({ isActive }) => (
                                    <>
                                      <subitem.icon
                                        className={cn(
                                          "flex-shrink-0 h-4 w-4 mr-3",
                                          isActive
                                            ? "text-blue-600"
                                            : "text-gray-500"
                                        )}
                                      />
                                      <span>{subitem.name}</span>
                                    </>
                                  )}
                                </NavLink>
                              </li>
                            ))}
                          </ul>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Bottom section with logout */}
            <div className="p-4 border-t border-gray-200 mt-auto">
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg py-2 text-sm font-medium transition-colors",
                  sidebarCollapsed ? "justify-center px-3" : "px-4 w-full"
                )}
              >
                <LogOut className="flex-shrink-0 h-5 w-5" />
                {!sidebarCollapsed && <span className="ml-3">Sign out</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile sidebar drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-y-0 left-0 flex flex-col w-full max-w-xs bg-white z-40 lg:hidden">
            <div className="flex items-center justify-between px-4 pt-5 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold">$</span>
                </div>
                <div>
                  <span className="font-bold text-xl text-blue-600">
                    FinTrack
                  </span>
                  <p className="text-xs text-gray-500">Personal Accounting</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-500 hover:text-gray-600"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile navigation - no gap after header */}
            <nav className="flex-1 overflow-y-auto">
              <ul className="pt-0">
                {navigationItems.map((item, index) => (
                  <React.Fragment key={item.name}>
                    {item.href ? (
                      <li>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center py-3 px-4 text-sm font-medium",
                              isActive
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                            )
                          }
                          onClick={() => setMobileMenuOpen(false)}
                          end={item.href === "/dashboard"} // Match dashboard exactly
                        >
                          {({ isActive }) => (
                            <>
                              <item.icon
                                className={cn(
                                  "flex-shrink-0 h-5 w-5 mr-3",
                                  isActive ? "text-blue-600" : "text-gray-500"
                                )}
                              />
                              <span>{item.name}</span>
                            </>
                          )}
                        </NavLink>
                      </li>
                    ) : (
                      <>
                        {/* Reports category header in mobile view */}
                        <li>
                          <div className="flex items-center py-3 px-4 text-sm font-medium text-gray-700">
                            <item.icon className="flex-shrink-0 h-5 w-5 mr-3 text-gray-500" />
                            <span>{item.name}</span>
                          </div>
                        </li>

                        {/* Reports submenu items in mobile view */}
                        {item.submenu.map((subitem) => (
                          <li key={subitem.name}>
                            <NavLink
                              to={subitem.href}
                              className={({ isActive }) =>
                                cn(
                                  "flex items-center py-2 ml-8 pl-4 pr-2 text-sm font-medium",
                                  isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"
                                )
                              }
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {({ isActive }) => (
                                <>
                                  <subitem.icon
                                    className={cn(
                                      "flex-shrink-0 h-4 w-4 mr-3",
                                      isActive
                                        ? "text-blue-600"
                                        : "text-gray-500"
                                    )}
                                  />
                                  <span>{subitem.name}</span>
                                </>
                              )}
                            </NavLink>
                          </li>
                        ))}
                      </>
                    )}
                  </React.Fragment>
                ))}
              </ul>
            </nav>

            {/* Mobile sign out button */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={handleLogout}
                className="flex items-center w-full rounded-lg py-2 px-4 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="flex-shrink-0 h-5 w-5 mr-3" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-auto relative">
          <div className="px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
