import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { useLocation } from 'react-router-dom'
const Login = () => {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showResend, setShowResend] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const location = useLocation()
    const successMessage = location.state?.message
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/users/login', form)
            login(res.data.data.user) // ✅ accessToken param removed — cookie handles it
            navigate('/')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed')
            if (err.response?.status === 403) {
                setShowResend(true)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setResendLoading(true)
        try {
            await api.post('/users/resend-verification', { email: form.email })
            setError('')
            setShowResend(false)
            setSuccess('Verification email resent! Check your inbox.')
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend')
        } finally {
            setResendLoading(false)
        }
    }
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                <h1 className="text-2xl font-semibold text-center mb-1 font-serif">BlushVeil</h1>
                <p className="text-sm text-gray-400 text-center mb-8">Sign in to your account</p>

                {error && (
                    <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-4">
                        {error}
                    </div>
                )}
                {showResend && (
                    <button
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="w-full border border-black text-black py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                )}
                {successMessage && (
                    <div className="bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">
                        {successMessage}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                        />
                    </div>
                    <div className="flex justify-end">
                        <Link
                            to="/forgot-password"
                            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-400 mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-black font-medium underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Login