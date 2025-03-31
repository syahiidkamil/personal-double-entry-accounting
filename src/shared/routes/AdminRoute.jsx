import React from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "../../features/auth/hooks/useAuth";

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is an admin
  if (user?.role !== "admin") {
    // Redirect to dashboard if user is not an admin
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default AdminRoute;