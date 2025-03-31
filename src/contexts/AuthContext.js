import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, getUser, setToken, setUser, removeToken, removeUser, isAdmin } from '@/lib/auth';

// Create the auth context
const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  isAdmin: false,
  login: () => {},
  register: () => {},
  logout: () => {},
  loading: true,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap around components that need auth
export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      const storedUser = getUser();
      if (storedUser) {
        setUserState(storedUser);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login user
  const login = (userData, token) => {
    setToken(token);
    setUser(userData);
    setUserState(userData);
  };

  // Register user
  const register = (userData, token) => {
    setToken(token);
    setUser(userData);
    setUserState(userData);
  };

  // Logout user
  const logout = () => {
    removeToken();
    removeUser();
    setUserState(null);
    
    // In a CSR app, we typically redirect to login after logout
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  // Determine if the user is authenticated
  const isAuthenticated = !!user;

  // Determine if the user is an admin
  const isUserAdmin = user ? isAdmin() : false;

  // Context value
  const contextValue = {
    isAuthenticated,
    isAdmin: isUserAdmin,
    user,
    login,
    register,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
