import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ UPDATED — No localStorage, cookie sent automatically
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const res = await api.get('/users/profile')
        setUser(res.data.data)
      } catch (error) {
        // Cookie invalid or expired — treat as logged out
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    restoreUser()
  }, [])

  
  const login = (userData) => {
    // Cookie is set by backend automatically
    // We just store user in state
    setUser(userData)
  }

  
  const logout = async () => {
    try {
      await api.post('/users/logout')
      // Backend clears httpOnly cookies
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setUser(null)
    }
  }

  const value = {
    user,
    setUser,
    isLoading,
    isAdmin: user?.role === 'admin',
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}