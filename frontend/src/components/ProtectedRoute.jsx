import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, isAdmin, isLoading } = useAuth()

    // ← Fetch hone tak wait karo
    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
    )

    if (!user) return <Navigate to="/login" replace />
    if (adminOnly && !isAdmin) return <Navigate to="/" replace />

    return children
}

export default ProtectedRoute