import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Lock, MapPin, ArrowLeft, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'address', label: 'Address', icon: MapPin },
]

const ProfilePage = () => {
    const { user, setUser } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [profileForm, setProfileForm] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
    })

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
    })

    const [addressForm, setAddressForm] = useState({
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        pincode: user?.address?.pincode || '',
        country: user?.address?.country || '',
    })

    const showSuccess = (msg) => {
        setSuccess(msg)
        setError('')
        setTimeout(() => setSuccess(''), 3000)
    }

    // TODO: you write - PATCH /api/v1/users/update-profile
    const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
        const res = await api.patch('/users/update-profile', profileForm)
        const updatedUser = res.data.data
        setUser(updatedUser)
        // ✅ localStorage bhi update karo
        localStorage.setItem('user', JSON.stringify(updatedUser))
        showSuccess('Profile updated successfully!')
    } catch (err) {
        setError(err.response?.data?.message || 'Update failed')
    } finally {
        setLoading(false)
    }
}

    // TODO: you write - PATCH /api/v1/users/update-password
    const handlePasswordUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await api.patch('/users/update-password', passwordForm)
            setPasswordForm({ oldPassword: '', newPassword: '' })
            showSuccess('Password changed successfully!')
        } catch (err) {
            setError(err.response?.data?.message || 'Password update failed')
        } finally {
            setLoading(false)
        }
    }

    // TODO: you write - PATCH /api/v1/users/update-address
    const handleAddressUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
        const res = await api.patch('/users/update-address', addressForm)
        const updatedUser = res.data.data
        setUser(updatedUser)
        // ✅ localStorage update
        localStorage.setItem('user', JSON.stringify(updatedUser))
        showSuccess('Address updated successfully!')
    } catch (err) {
        setError(err.response?.data?.message || 'Address update failed')
    } finally {
        setLoading(false)
    }
}

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <span className="font-semibold text-gray-900">My Account</span>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white text-xl font-semibold">
                        {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900">{user?.fullName}</p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                        {user?.role === 'admin' && (
                            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full mt-1 inline-block">Admin</span>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-6">
                    {TABS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => { setActiveTab(id); setError(''); setSuccess('') }}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors
                                ${activeTab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* Alerts */}
                {success && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl mb-4">
                        <Check size={16} /> {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-4">
                        {error}
                    </div>
                )}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileUpdate} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
                            <input
                                type="text"
                                value={profileForm.fullName}
                                onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                            <input
                                type="email"
                                value={profileForm.email}
                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                            />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </form>
                )}

                {/* Password Tab */}
                {activeTab === 'password' && (
                    <form onSubmit={handlePasswordUpdate} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Current Password</label>
                            <input
                                type="password"
                                value={passwordForm.oldPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">New Password</label>
                            <input
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors"
                            />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </form>
                )}

                {/* Address Tab */}
                {activeTab === 'address' && (
                    <form onSubmit={handleAddressUpdate} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Street</label>
                            <input type="text" value={addressForm.street}
                                onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                placeholder="123 MG Road"
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
                                <input type="text" value={addressForm.city}
                                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                    placeholder="Nashik"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">State</label>
                                <input type="text" value={addressForm.state}
                                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                    placeholder="Maharashtra"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Pincode</label>
                                <input type="text" value={addressForm.pincode}
                                    onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                    placeholder="422001"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Country</label>
                                <input type="text" value={addressForm.country}
                                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                    placeholder="India"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 transition-colors" />
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                            {loading ? 'Saving...' : 'Save Address'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}

export default ProfilePage