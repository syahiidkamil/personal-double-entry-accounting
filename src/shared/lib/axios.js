import axios from "axios";
import { toast } from "sonner";

// For Next.js API routes, we don't need a separate base URL
const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 - Unauthorized
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      // Clear storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Show toast notification
      toast.error("Your session has expired. Please log in again.");
      
      // Redirect to login page if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle general errors
    const errorMessage = error.response?.data?.message || "An error occurred. Please try again.";
    if (error.response && error.response.status !== 401) {
      toast.error(errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;