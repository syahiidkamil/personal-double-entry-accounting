import axiosInstance from "../../../shared/lib/axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

const authService = {
  login: async (email, password) => {
    try {
      const response = await axiosInstance.post("/api/auth/login", {
        email,
        password,
      });

      const { token, user, success, message } = response.data;

      if (!success) {
        toast.error(message || "Login failed");
        return { success: false, message };
      }

      // Store token and user info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(message || "Successfully logged in!");
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
      return { success: false, message };
    }
  },

  register: async (userData) => {
    try {
      const response = await axiosInstance.post("/api/auth/register", userData);

      const { token, user, success, message } = response.data;

      if (!success) {
        toast.error(message || "Registration failed");
        return { success: false, message };
      }

      // Store token and user info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(message || "Account created successfully!");
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
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
    return localStorage.setItem("token");
  },
  
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.patch("/api/auth/me", userData);
      
      const { user, success, message } = response.data;
      
      if (!success) {
        toast.error(message || "Failed to update profile");
        return { success: false, message };
      }
      
      // Update stored user info in localStorage
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem("user", JSON.stringify({ ...currentUser, ...user }));
      
      toast.success(message || "Profile updated successfully!");
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || "Failed to update profile";
      toast.error(message);
      return { success: false, message };
    }
  },
  
  fetchProfile: async () => {
    try {
      const response = await axiosInstance.get("/api/auth/me");
      
      const { user, success } = response.data;
      
      if (!success) {
        return { success: false, user: null };
      }
      
      // Update stored user info in localStorage
      localStorage.setItem("user", JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      console.error("Error fetching profile:", error);
      return { success: false, user: null };
    }
  },
  
  validateInvitationCode: async (invitationCode) => {
    try {
      const response = await axiosInstance.post("/api/auth/validate-invitation", {
        invitationCode
      });
      
      return {
        success: response.data.success,
        message: response.data.message,
        expiresAt: response.data.expiresAt
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid invitation code"
      };
    }
  }
};

export default authService;