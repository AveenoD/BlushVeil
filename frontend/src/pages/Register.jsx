import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

const Register = () => {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        fullName: '', email: '', password: '', phoneNumber: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }


    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await api.post('/users/register', form)
            navigate('/login', {
                state: { message: 'Please verify your email before logging in.' }
            })
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                <h1 className="text-2xl font-semibold text-center mb-1 font-serif">BlushVeil</h1>
                <p className="text-sm text-gray-400 text-center mb-8">Create your account</p>

                {error && (
                    <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-4">
                        {error}
                    </div>
                )}
                {success ? (
                    <div className="flex flex-col items-center gap-5 text-center">
                        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-lg">Account created!</p>
                            <p className="text-sm text-gray-400 mt-1">
                                We've sent a verification email to <strong>{form.email}</strong>.
                                Please verify before logging in.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                                required
                                placeholder="Ayesha Khan"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                            />
                        </div>

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
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Phone Number</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={handleChange}
                                required
                                placeholder="9876543210"
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
                        >
                            {loading ? 'Creating account...' : 'Create Account'}
                        </button>
                    </form>
                )}
                <p className="text-sm text-center text-gray-400 mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-black font-medium underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default Register