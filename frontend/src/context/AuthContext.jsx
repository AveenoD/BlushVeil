import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // ← this was missing or not used

  useEffect(() => {
    const restoreUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Make sure your endpoint matches backend (from README it's /api/v1/users/profile)
        const res = await api.get('/users/profile'); // or '/api/v1/users/profile' if needed

        // Adjust according to your actual response shape
        // Most common: res.data.data or res.data.user or res.data
        const userData = res.data.data || res.data.user || res.data;
        setUser(userData);
      } catch (error) {
        console.error("Auth restore failed:", error?.response?.data || error.message);
        localStorage.removeItem('accessToken');
        // Optional: window.__accessToken = null;  (if you still use it)
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreUser();
  }, []);

  const login = (userData, accessToken) => {
    localStorage.setItem('accessToken', accessToken);
    // window.__accessToken = accessToken;   ← only if your interceptor still needs it
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem('accessToken');
      // window.__accessToken = null;
      setUser(null);
    }
  };

  const value = {
    user,
    setUser,
    isLoading,               
    isAdmin: user?.role === 'admin',
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
};