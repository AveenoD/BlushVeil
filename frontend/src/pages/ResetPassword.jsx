import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const ResetPassword = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [form, setForm] = useState({ password: '', confirmPassword: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match')
            return
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)
        try {
            await api.post(`/users/reset-password/${token}`, {
                password: form.password
            })
            setSuccess(true)
            setTimeout(() => navigate('/login'), 3000)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                <h1 className="text-2xl font-semibold text-center mb-1 font-serif">BlushVeil</h1>
                <p className="text-sm text-gray-400 text-center mb-8">Set new password</p>

                {success ? (
                    <div className="flex flex-col items-center gap-5 text-center">
                        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-lg">Password reset!</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Redirecting to login...
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">New Password</label>
                                <input
                                    type="password"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    required
                                    placeholder="••••••••"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Confirm Password</label>
                                <input
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}

export default ResetPassword