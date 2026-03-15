import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Truck, CheckCircle, XCircle, ChevronDown } from 'lucide-react'
import api from '../api/axios'

const STATUSES = [
    { value: 'pending',          label: 'Pending' },
    { value: 'confirmed',        label: 'Confirmed' },
    { value: 'dispatched',       label: 'Dispatched' },
    { value: 'delivered',        label: 'Delivered' },
    { value: 'cancelled',        label: 'Cancelled' },
]

const STATUS_CONFIG = {
    pending:          { color: 'text-yellow-500', bg: 'bg-yellow-50' },
    confirmed:        { color: 'text-blue-500',   bg: 'bg-blue-50' },
    dispatched:       { color: 'text-purple-500', bg: 'bg-purple-50' },
    delivered:        { color: 'text-green-500',  bg: 'bg-green-50' },
    cancelled:        { color: 'text-red-500',    bg: 'bg-red-50' },
}

const AdminOrders = () => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [updatingId, setUpdatingId] = useState(null)
    const [showDispatchForm, setShowDispatchForm] = useState(null) // orderId
    const [estimatedDelivery, setEstimatedDelivery] = useState('')

    // TODO: you write - GET /api/v1/orders/all
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders/all')
                setOrders(res.data.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    // TODO: you write - PATCH /api/v1/orders/status/:orderId
    const handleStatusUpdate = async (orderId, status) => {
        if (status === 'dispatched') {
            setShowDispatchForm(orderId)
            return
        }

        setUpdatingId(orderId)
        try {
            const res = await api.patch(`/orders/status/${orderId}`, { status })
            setOrders(prev => prev.map(o => o._id === orderId ? res.data.data : o))
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed')
        } finally {
            setUpdatingId(null)
        }
    }

    const handleDispatchSubmit = async (orderId) => {
        if (!estimatedDelivery) return alert('Please select estimated delivery date')
        setUpdatingId(orderId)
        try {
            const res = await api.patch(`/orders/status/${orderId}`, {
                status: 'dispatched',
                estimatedDelivery
            })
            setOrders(prev => prev.map(o => o._id === orderId ? res.data.data : o))
            setShowDispatchForm(null)
            setEstimatedDelivery('')
        } catch (err) {
            alert(err.response?.data?.message || 'Update failed')
        } finally {
            setUpdatingId(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <button onClick={() => navigate('/admin')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <span className="font-semibold text-gray-900">All Orders</span>
                <span className="text-sm text-gray-400 ml-1">({orders.length})</span>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {['pending', 'dispatched', 'delivered', 'cancelled'].map(status => (
                        <div key={status} className="bg-white rounded-xl border border-gray-100 p-4">
                            <p className="text-xs text-gray-400 mb-1 capitalize">{status}</p>
                            <p className="text-xl font-semibold text-gray-900">
                                {orders.filter(o => o.status === status).length}
                            </p>
                        </div>
                    ))}
                </div>

                {loading ? (
                    <div className="flex flex-col gap-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                                <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
                                <div className="h-3 bg-gray-100 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                        <p className="text-sm">No orders yet</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {orders.map((order) => {
                            const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                            return (
                                <div key={order._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                                    {/* Order Header */}
                                    <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between flex-wrap gap-2">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
                                            {STATUSES.find(s => s.value === order.status)?.label}
                                        </span>
                                    </div>

                                    {/* Customer Info */}
                                    <div className="px-5 py-3 border-b border-gray-50 bg-gray-50">
                                        <p className="text-xs font-medium text-gray-900">{order.user?.fullName}</p>
                                        <p className="text-xs text-gray-400">{order.user?.phoneNumber} · {order.user?.email}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            {order.deliveryAddress?.street}, {order.deliveryAddress?.city}, {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
                                        </p>
                                    </div>

                                    {/* Items */}
                                    <div className="px-5 py-4 flex flex-col gap-2">
                                        {order.items.map((item, i) => (
                                            <div key={i} className="flex gap-3">
                                                <img src={item.image} alt={item.name}
                                                    className="w-12 h-14 rounded-lg object-cover bg-gray-100 shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                    <p className="text-xs text-gray-400">
                                                        Size: {item.size} {item.color && `· ${item.color}`} · Qty: {item.quantity}
                                                    </p>
                                                    <p className="text-sm font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Total + Status Update */}
                                    <div className="px-5 pb-4 flex items-center justify-between flex-wrap gap-3">
                                        <p className="text-sm font-semibold text-gray-900">Total: ₹{order.totalAmount}</p>

                                        {/* Status Dropdown */}
                                        {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                            <select
                                                value={order.status}
                                                onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                disabled={updatingId === order._id}
                                                className="text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-gray-400 bg-white disabled:opacity-50 cursor-pointer"
                                            >
                                                {STATUSES.map(s => (
                                                    <option key={s.value} value={s.value}>{s.label}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>

                                    {/* Dispatch Form — Estimated Delivery */}
                                    {showDispatchForm === order._id && (
                                        <div className="px-5 pb-4 border-t border-gray-50 pt-4">
                                            <p className="text-xs font-medium text-gray-500 mb-2">Set Estimated Delivery Date</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="date"
                                                    value={estimatedDelivery}
                                                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-gray-400"
                                                />
                                                <button
                                                    onClick={() => handleDispatchSubmit(order._id)}
                                                    disabled={updatingId === order._id}
                                                    className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                                                >
                                                    {updatingId === order._id ? 'Saving...' : 'Dispatch'}
                                                </button>
                                                <button
                                                    onClick={() => setShowDispatchForm(null)}
                                                    className="px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Estimated Delivery Display */}
                                    {order.estimatedDelivery && order.status === 'dispatched' && (
                                        <div className="px-5 pb-4">
                                            <p className="text-xs text-purple-500 flex items-center gap-1">
                                                <Truck size={12} />
                                                Est. delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AdminOrders