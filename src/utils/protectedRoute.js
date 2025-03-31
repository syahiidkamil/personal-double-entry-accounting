import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Higher-order component to protect routes that require authentication
 * @param {React.Component} Component - Component to wrap with protection
 * @param {Object} options - Configuration options
 * @param {boolean} options.adminOnly - Whether the route is only for admins
 * @returns {React.Component} Protected component
 */
const withProtectedRoute = (Component, { adminOnly = false } = {}) => {
  const ProtectedRoute = (props) => {
    const { isAuthenticated, isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // If auth state is loaded and user is not authenticated, redirect to login
      if (!loading && !isAuthenticated) {
        router.replace({
          pathname: "/login",
          query: { returnUrl: router.asPath },
        });
      }

      // If this is an admin-only route and user is not an admin, redirect to home
      if (!loading && isAuthenticated && adminOnly && !isAdmin) {
        router.replace("/");
      }
    }, [isAuthenticated, isAdmin, loading, router, adminOnly]);

    // Show nothing while loading or if the user is not authorized
    if (loading || !isAuthenticated || (adminOnly && !isAdmin)) {
      return null; // Or a loading spinner/message
    }

    // User is authenticated and authorized, render the component
    return <Component {...props} />;
  };

  return ProtectedRoute;
};

/**
 * Higher-order component for public routes that should redirect to home if authenticated
 * @param {React.Component} Component - Component to wrap with protection
 * @returns {React.Component} Protected public component
 */
export const withPublicRoute = (Component) => {
  const PublicRoute = (props) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // If auth state is loaded and user is authenticated, redirect to home
      if (!loading && isAuthenticated) {
        router.replace("/");
      }
    }, [isAuthenticated, loading, router]);

    // Show nothing while loading if the user is authenticated (redirecting)
    if (loading || isAuthenticated) {
      return null; // Or a loading spinner/message
    }

    // User is not authenticated, render the public component
    return <Component {...props} />;
  };

  return PublicRoute;
};

export default withProtectedRoute;
