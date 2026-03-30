import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

const VerifyEmail = () => {
    const { token } = useParams()
    const navigate = useNavigate()
    const [status, setStatus] = useState('loading') // 'loading' | 'success' | 'error'
    const [message, setMessage] = useState('')

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const res = await api.get(`/users/verify-email/${token}`)
                setMessage(res.data.message || 'Email verified successfully!')
                setStatus('success')
            } catch (err) {
                setMessage(err.response?.data?.message || 'Verification failed. Link may be invalid or expired.')
                setStatus('error')
            }
        }

        if (token) {
            verifyEmail()
        } else {
            setMessage('Invalid verification link.')
            setStatus('error')
        }
    }, [token])

    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="w-full max-w-sm text-center">

                {/* Logo */}
                <h1 className="text-2xl font-semibold mb-1 font-serif">BlushVeil</h1>
                <p className="text-sm text-gray-400 mb-10">Email Verification</p>

                {/* Loading */}
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-500">Verifying your email...</p>
                    </div>
                )}

                {/* Success */}
                {status === 'success' && (
                    <div className="flex flex-col items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-lg">You're verified!</p>
                            <p className="text-sm text-gray-400 mt-1">{message}</p>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                        >
                            Continue to Login
                        </button>
                    </div>
                )}

                {/* Error */}
                {status === 'error' && (
                    <div className="flex flex-col items-center gap-5">
                        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-lg">Verification failed</p>
                            <p className="text-sm text-gray-400 mt-1">{message}</p>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                            <button
                                onClick={() => navigate('/register')}
                                className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                            >
                                Register Again
                            </button>
                            <Link
                                to="/login"
                                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-2"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default VerifyEmail