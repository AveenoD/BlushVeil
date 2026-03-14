import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Pencil, X, Check, ArrowLeft, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const ProfilePage = () => {
    const { user, setUser } = useAuth()
    const navigate = useNavigate()

    const [editSection, setEditSection] = useState(null) // 'profile' | 'address' | 'password'
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState('')
    const [error, setError] = useState('')

    const [profileForm, setProfileForm] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
    })

    const [addressForm, setAddressForm] = useState({
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        pincode: user?.address?.pincode || '',
        country: user?.address?.country || '',
    })

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
    })

    const showSuccess = (msg) => {
        setSuccess(msg)
        setError('')
        setTimeout(() => setSuccess(''), 3000)
    }

    const openEdit = (section) => {
        setError('')
        setSuccess('')
        // Reset forms to current user data
        if (section === 'profile') {
            setProfileForm({ fullName: user?.fullName || '', email: user?.email || '' })
        }
        if (section === 'address') {
            setAddressForm({
                street: user?.address?.street || '',
                city: user?.address?.city || '',
                state: user?.address?.state || '',
                pincode: user?.address?.pincode || '',
                country: user?.address?.country || '',
            })
        }
        if (section === 'password') {
            setPasswordForm({ oldPassword: '', newPassword: '' })
        }
        setEditSection(section)
    }

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await api.patch('/users/update-profile', profileForm)
            setUser(res.data.data)
            setEditSection(null)
            showSuccess('Profile updated successfully!')
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed')
        } finally {
            setLoading(false)
        }
    }

    const handleAddressUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const res = await api.patch('/users/update-address', addressForm)
            setUser(res.data.data)
            setEditSection(null)
            showSuccess('Address updated successfully!')
        } catch (err) {
            setError(err.response?.data?.message || 'Address update failed')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordUpdate = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await api.patch('/users/update-password', passwordForm)
            setEditSection(null)
            setPasswordForm({ oldPassword: '', newPassword: '' })
            showSuccess('Password changed successfully!')
        } catch (err) {
            setError(err.response?.data?.message || 'Password update failed')
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

            <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-4">

                {/* Success / Error */}
                {success && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-600 text-sm px-4 py-3 rounded-xl">
                        <Check size={15} /> {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                {/* Avatar Card */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-white text-2xl font-semibold shrink-0">
                        {user?.fullName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-semibold text-gray-900 text-lg">{user?.fullName}</p>
                        <p className="text-sm text-gray-400">{user?.email}</p>
                        {user?.role === 'admin' && (
                            <span className="text-xs bg-black text-white px-2 py-0.5 rounded-full mt-1 inline-block">Admin</span>
                        )}
                    </div>
                </div>

                {/* Profile Section */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                        <p className="font-medium text-gray-900">Personal Info</p>
                        {editSection !== 'profile' ? (
                            <button onClick={() => openEdit('profile')}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                                <Pencil size={13} /> Edit
                            </button>
                        ) : (
                            <button onClick={() => setEditSection(null)}
                                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors">
                                <X size={13} /> Cancel
                            </button>
                        )}
                    </div>

                    {/* View Mode */}
                    {editSection !== 'profile' && (
                        <div className="px-6 py-4 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-400">Full Name</p>
                                <p className="text-sm font-medium text-gray-900">{user?.fullName || '—'}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-400">Email</p>
                                <p className="text-sm font-medium text-gray-900">{user?.email || '—'}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-400">Phone</p>
                                <p className="text-sm font-medium text-gray-900">{user?.phoneNumber || '—'}</p>
                            </div>
                        </div>
                    )}

                    {/* Edit Mode */}
                    {editSection === 'profile' && (
                        <form onSubmit={handleProfileUpdate} className="px-6 py-4 flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Full Name</label>
                                <input type="text" value={profileForm.fullName}
                                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                                <input type="email" value={profileForm.email}
                                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Address Section */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                        <p className="font-medium text-gray-900">Delivery Address</p>
                        {editSection !== 'address' ? (
                            <button onClick={() => openEdit('address')}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                                <Pencil size={13} /> Edit
                            </button>
                        ) : (
                            <button onClick={() => setEditSection(null)}
                                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors">
                                <X size={13} /> Cancel
                            </button>
                        )}
                    </div>

                    {/* View Mode */}
                    {editSection !== 'address' && (
                        <div className="px-6 py-4 flex flex-col gap-3">
                            {user?.address?.street ? (
                                <>
                                    <div className="flex justify-between">
                                        <p className="text-xs text-gray-400">Street</p>
                                        <p className="text-sm font-medium text-gray-900">{user.address.street}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-xs text-gray-400">City</p>
                                        <p className="text-sm font-medium text-gray-900">{user.address.city}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-xs text-gray-400">State</p>
                                        <p className="text-sm font-medium text-gray-900">{user.address.state}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-xs text-gray-400">Pincode</p>
                                        <p className="text-sm font-medium text-gray-900">{user.address.pincode}</p>
                                    </div>
                                    <div className="flex justify-between">
                                        <p className="text-xs text-gray-400">Country</p>
                                        <p className="text-sm font-medium text-gray-900">{user.address.country}</p>
                                    </div>
                                </>
                            ) : (
                                <p className="text-sm text-gray-400 py-1">No address added yet. Click Edit to add one.</p>
                            )}
                        </div>
                    )}

                    {/* Edit Mode */}
                    {editSection === 'address' && (
                        <form onSubmit={handleAddressUpdate} className="px-6 py-4 flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Street</label>
                                <input type="text" value={addressForm.street}
                                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                                    placeholder="123 MG Road"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">City</label>
                                    <input type="text" value={addressForm.city}
                                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                                        placeholder="Nashik"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">State</label>
                                    <input type="text" value={addressForm.state}
                                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                                        placeholder="Maharashtra"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Pincode</label>
                                    <input type="text" value={addressForm.pincode}
                                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                        placeholder="422001"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 mb-1 block">Country</label>
                                    <input type="text" value={addressForm.country}
                                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                                        placeholder="India"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                                {loading ? 'Saving...' : 'Save Address'}
                            </button>
                        </form>
                    )}
                </div>

                {/* Password Section */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
                        <p className="font-medium text-gray-900">Change Password</p>
                        {editSection !== 'password' ? (
                            <button onClick={() => openEdit('password')}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                                <Lock size={13} /> Change
                            </button>
                        ) : (
                            <button onClick={() => setEditSection(null)}
                                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 transition-colors">
                                <X size={13} /> Cancel
                            </button>
                        )}
                    </div>

                    {editSection !== 'password' && (
                        <div className="px-6 py-4">
                            <p className="text-sm text-gray-400">••••••••</p>
                        </div>
                    )}

                    {editSection === 'password' && (
                        <form onSubmit={handlePasswordUpdate} className="px-6 py-4 flex flex-col gap-4">
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Current Password</label>
                                <input type="password" value={passwordForm.oldPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">New Password</label>
                                <input type="password" value={passwordForm.newPassword}
                                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gray-400 transition-colors" />
                            </div>
                            <button type="submit" disabled={loading}
                                className="w-full bg-black text-white py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50">
                                {loading ? 'Updating...' : 'Update Password'}
                            </button>
                        </form>
                    )}
                </div>

            </div>
        </div>
    )
}

export default ProfilePage
