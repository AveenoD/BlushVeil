import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            await api.post('/users/forgot-password', { email })
            setSuccess(true)
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-sm">

                <h1 className="text-2xl font-semibold text-center mb-1 font-serif">BlushVeil</h1>
                <p className="text-sm text-gray-400 text-center mb-8">Reset your password</p>

                {success ? (
                    <div className="flex flex-col items-center gap-5 text-center">
                        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-lg">Check your inbox!</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Reset link sent to <strong>{email}</strong>.
                                Link expires in 15 minutes.
                            </p>
                        </div>
                        <Link
                            to="/login"
                            className="w-full text-center bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            Back to Login
                        </Link>
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
                                <label className="text-xs font-medium text-gray-500 mb-1 block">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="you@example.com"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <p className="text-sm text-center text-gray-400 mt-6">
                            Remember your password?{' '}
                            <Link to="/login" className="text-black font-medium underline">
                                Login
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}

export default ForgotPassword