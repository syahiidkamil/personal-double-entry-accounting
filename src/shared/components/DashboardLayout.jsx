import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router";
import { useAuth } from "../../features/auth/hooks/useAuth";
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
  DollarSign,
  Users,
  Ticket,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppLogo } from "@/components/ui/app-logo";
import { NavItem } from "@/components/ui/nav-item";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [reportsExpanded, setReportsExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const isAdmin = user?.role === "ADMIN";

  // Auto-expand sections if current path is related
  useEffect(() => {
    if (location.pathname.startsWith("/reports")) {
      setReportsExpanded(true);
    }
    if (location.pathname.startsWith("/admin")) {
      setAdminExpanded(true);
    }
  }, [location.pathname]);

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

  // Admin navigation items - only visible to admins
  const adminItems = isAdmin
    ? [
        {
          name: "Admin",
          icon: Settings,
          href: null, // No direct link for admin
          submenu: [
            {
              name: "User Management",
              icon: Users,
              href: "/admin/users",
            },
            {
              name: "Invitation Codes",
              icon: Ticket,
              href: "/admin/invitation-codes",
            },
          ],
        },
      ]
    : [];

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

  // Get current date for header
  const today = new Date();
  const dateOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = today.toLocaleDateString(undefined, dateOptions);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle sidebar collapse state
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Handle logout action
  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  // Toggle submenu for sections
  const toggleReportsMenu = () => {
    setReportsExpanded(!reportsExpanded);
  };

  const toggleAdminMenu = () => {
    setAdminExpanded(!adminExpanded);
  };

  // Determine if a submenu item is active
  const isReportActive = () => {
    return location.pathname.startsWith("/reports");
  };

  const isAdminActive = () => {
    return location.pathname.startsWith("/admin");
  };

  // Combine navigation items
  const allNavigationItems = [...navigationItems, ...adminItems];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top navigation bar */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 py-2 lg:px-6">
          {/* Logo and title in header - always visible */}
          <div className="flex items-center">
            {/* Mobile menu button - only on small screens */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 mr-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Logo and app name */}
            <div className="flex items-center space-x-3">
              <AppLogo icon={DollarSign} size="md" />
              <div>
                <h1 className="font-bold text-lg">FinTrack</h1>
                <p className="text-xs text-muted-foreground hidden md:block">
                  Personal Accounting
                </p>
              </div>
            </div>
          </div>

          {/* Date display */}
          <div className="hidden md:block text-muted-foreground text-sm">
            {formattedDate}
          </div>

          {/* User menu */}
          <div className="flex items-center">
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-full hover:bg-accent"
              >
                <Avatar
                  size="sm"
                  fallback={user?.name?.charAt(0) || "A"}
                  className="bg-primary text-primary-foreground"
                />
                <span className="hidden md:block text-sm font-medium text-foreground">
                  {user?.name || "Admin"}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-40 border border-border">
                  <div className="border-b border-border pb-2 pt-1 px-4">
                    <p className="text-sm font-medium text-foreground">
                      {user?.name || "Admin"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || "admin@example.com"}
                    </p>
                    {isAdmin && (
                      <p className="text-xs mt-1 bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm inline-block">
                        Admin
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-accent"
                  >
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>Profile</span>
                    </div>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-4 w-4 mr-2" />
                      <span>Sign out</span>
                    </div>
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
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile sidebar drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 max-w-xs bg-card z-40 lg:hidden border-r border-border">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <AppLogo icon={DollarSign} />
                  <div>
                    <span className="font-bold text-lg">FinTrack</span>
                    <p className="text-xs text-muted-foreground">
                      Personal Accounting
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mobile navigation */}
            <nav className="flex-1 overflow-y-auto py-2">
              <ul>
                {allNavigationItems.map((item) => (
                  <React.Fragment key={item.name}>
                    {item.href ? (
                      <li>
                        <NavLink
                          to={item.href}
                          className={({ isActive }) =>
                            cn(
                              "flex items-center py-3 px-4 text-base font-medium",
                              isActive
                                ? "bg-accent text-accent-foreground"
                                : "text-foreground hover:bg-muted hover:text-foreground"
                            )
                          }
                          onClick={() => setMobileMenuOpen(false)}
                          end={item.href === "/dashboard"} // Match dashboard exactly
                        >
                          {({ isActive }) => (
                            <NavItem
                              icon={item.icon}
                              active={isActive}
                              collapsed={false}
                              as="span"
                              className="w-full"
                            >
                              {item.name}
                            </NavItem>
                          )}
                        </NavLink>
                      </li>
                    ) : (
                      <>
                        {/* Category header in mobile view */}
                        <li>
                          <button
                            onClick={
                              item.name === "Reports"
                                ? toggleReportsMenu
                                : toggleAdminMenu
                            }
                            className="flex items-center w-full py-3 px-4 text-base font-medium text-foreground hover:bg-muted"
                          >
                            <item.icon className="flex-shrink-0 h-5 w-5 mr-3 text-muted-foreground" />
                            <span>{item.name}</span>
                            <ChevronDown
                              className={cn(
                                "ml-auto h-4 w-4 text-muted-foreground transition-transform",
                                (item.name === "Reports" && reportsExpanded) ||
                                  (item.name === "Admin" && adminExpanded)
                                  ? "rotate-180"
                                  : ""
                              )}
                            />
                          </button>
                        </li>

                        {/* Submenu items in mobile view */}
                        {((item.name === "Reports" && reportsExpanded) ||
                          (item.name === "Admin" && adminExpanded)) &&
                          item.submenu.map((subitem) => (
                            <li key={subitem.name}>
                              <NavLink
                                to={subitem.href}
                                className={({ isActive }) =>
                                  cn(
                                    "flex items-center py-3 pl-12 pr-4 text-base font-medium",
                                    isActive
                                      ? "bg-accent text-accent-foreground"
                                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
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
                                          ? "text-primary"
                                          : "text-muted-foreground"
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
            <div className="p-4 border-t border-border">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/profile");
                }}
                className="flex items-center w-full justify-start py-2 px-4 text-sm font-medium mb-2"
              >
                <User className="flex-shrink-0 h-4 w-4 mr-3" />
                <span>Profile</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center w-full justify-start text-destructive py-2 px-4 text-sm font-medium"
              >
                <LogOut className="flex-shrink-0 h-4 w-4 mr-3" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <aside
          className={cn(
            "hidden lg:block border-r border-border bg-card h-[calc(100vh-53px)]",
            sidebarCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Sidebar toggle button */}
          <button
            onClick={toggleSidebar}
            className="absolute left-[246px] top-[67px] flex items-center justify-center h-5 w-5 bg-background border border-border rounded-full shadow-sm text-muted-foreground hover:text-foreground z-20"
            style={{ display: sidebarCollapsed ? "none" : "flex" }}
          >
            <ChevronLeft className="h-3 w-3" />
          </button>

          {/* Only show expand button when collapsed */}
          {sidebarCollapsed && (
            <button
              onClick={toggleSidebar}
              className="absolute left-[59px] top-[67px] flex items-center justify-center h-5 w-5 bg-background border border-border rounded-full shadow-sm text-muted-foreground hover:text-foreground z-20"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          )}

          {/* Sidebar content */}
          <div className="h-full flex flex-col overflow-y-auto">
            <nav className="flex-1">
              <ul className="space-y-2 p-2">
                {allNavigationItems.map((item) => (
                  <li key={item.name} className="relative">
                    {/* Regular menu items */}
                    {item.href ? (
                      <NavLink
                        to={item.href}
                        end={item.href === "/dashboard"} // Match dashboard exactly
                        title={sidebarCollapsed ? item.name : ""}
                      >
                        {({ isActive }) => (
                          <NavItem
                            icon={item.icon}
                            active={isActive}
                            collapsed={sidebarCollapsed}
                          >
                            {item.name}
                          </NavItem>
                        )}
                      </NavLink>
                    ) : (
                      /* Menu with submenu */
                      <>
                        {/* Section header - showing differently based on collapsed state */}
                        {!sidebarCollapsed ? (
                          // Expanded mode - show as button with chevron
                          <button
                            className={cn(
                              "w-full flex items-center py-3 rounded-md text-base font-medium",
                              (item.name === "Reports" && isReportActive()) ||
                                (item.name === "Admin" && isAdminActive())
                                ? "bg-accent text-accent-foreground"
                                : "text-foreground hover:bg-muted",
                              "px-3"
                            )}
                            onClick={
                              item.name === "Reports"
                                ? toggleReportsMenu
                                : toggleAdminMenu
                            }
                          >
                            {((item.name === "Reports" && isReportActive()) ||
                              (item.name === "Admin" && isAdminActive())) && (
                              <div className="absolute left-0 inset-y-0 w-2 bg-primary rounded-r-full"></div>
                            )}

                            <item.icon
                              className={cn(
                                "flex-shrink-0 h-5 w-5",
                                (item.name === "Reports" && isReportActive()) ||
                                  (item.name === "Admin" && isAdminActive())
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              )}
                            />
                            <span className="ml-3">{item.name}</span>
                            <ChevronDown
                              className={cn(
                                "ml-auto h-4 w-4 text-muted-foreground transition-transform",
                                (item.name === "Reports" && reportsExpanded) ||
                                  (item.name === "Admin" && adminExpanded)
                                  ? "rotate-180"
                                  : ""
                              )}
                            />
                          </button>
                        ) : (
                          // Collapsed mode - show as separator
                          <Separator className="my-2 mx-auto w-6" />
                        )}

                        {/* Expanded submenu for items */}
                        {!sidebarCollapsed &&
                          ((item.name === "Reports" && reportsExpanded) ||
                            (item.name === "Admin" && adminExpanded)) && (
                            <ul className="mt-2 ml-5 pl-4 space-y-2">
                              {item.submenu.map((subitem) => (
                                <li key={subitem.name}>
                                  <NavLink
                                    to={subitem.href}
                                    className={({ isActive }) =>
                                      cn(
                                        "flex items-center py-2.5 rounded-md text-base font-medium px-3",
                                        isActive
                                          ? "bg-accent text-accent-foreground font-bold"
                                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                      )
                                    }
                                  >
                                    {({ isActive }) => (
                                      <>
                                        <subitem.icon
                                          className={cn(
                                            "flex-shrink-0 h-5 w-5",
                                            isActive
                                              ? "text-primary"
                                              : "text-muted-foreground"
                                          )}
                                        />
                                        <span className="ml-2">
                                          {subitem.name}
                                        </span>
                                      </>
                                    )}
                                  </NavLink>
                                </li>
                              ))}
                            </ul>
                          )}

                        {/* In collapsed mode, show submenu directly */}
                        {sidebarCollapsed && (
                          <div className="mt-1 space-y-1">
                            {item.submenu.map((subitem) => (
                              <NavLink
                                key={subitem.name}
                                to={subitem.href}
                                className={({ isActive }) =>
                                  cn(
                                    "flex justify-center items-center py-2 text-base font-medium",
                                    isActive
                                      ? "text-primary"
                                      : "text-muted-foreground hover:text-foreground"
                                  )
                                }
                                title={subitem.name}
                              >
                                {({ isActive }) => (
                                  <subitem.icon
                                    className={cn(
                                      "flex-shrink-0 h-4 w-4",
                                      isActive
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                    )}
                                  />
                                )}
                              </NavLink>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Bottom section with sign out button */}
            <div className="mt-auto flex border-t border-border">
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center text-destructive py-4 text-sm font-medium mx-auto",
                  sidebarCollapsed ? "justify-center" : ""
                )}
              >
                <LogOut className="h-5 w-5 mr-2" />
                {!sidebarCollapsed && <span>Sign out</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
