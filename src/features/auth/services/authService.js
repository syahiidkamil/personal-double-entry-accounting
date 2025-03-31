import axiosInstance from "../../../shared/lib/axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

export const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // Store token and user info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success("Successfully logged in!");
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.error || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await axiosInstance.post("/api/auth/register", {
        name,
        email,
        password,
      });

      const { token, user, message } = response.data;

      // Store token and user info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(message || "Account created successfully!");
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.error || "Registration failed";
      toast.error(message);
      return { success: false, message };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.info("You have been logged out");
    
    // We'll let the component handle navigation
    return true;
  },

  isAuthenticated: () => {
    if (typeof window === 'undefined') {
      return false; // Not authenticated on server-side
    }
    
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Check if token is expired
      if (decoded.exp && decoded.exp < currentTime) {
        // Just clean up storage without navigating
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  },

  getCurrentUser: () => {
    if (typeof window === 'undefined') {
      return null; // No user on server-side
    }
    
    const user = localStorage.getItem("user");
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      return null;
    }
  },

  getToken: () => {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem("token");
  },
};

export default authService;