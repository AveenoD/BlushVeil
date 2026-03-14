import api from '../api/axios.js'
import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('user')
        window.__accessToken = localStorage.getItem('accessToken')
        return saved ? JSON.parse(saved) : null
    })

    const isAdmin = user?.role === "admin"

    const login = (userData, accessToken) => {
        window.__accessToken = accessToken
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('accessToken', accessToken)
        setUser(userData)
    }

    const logout = async () => {
        try {
            await api.post('/users/logout')
        } catch (error) {
            console.error(error)
        } finally {
            window.__accessToken = null
            localStorage.removeItem('user')
            localStorage.removeItem('accessToken')
            setUser(null)
        }
    }

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)