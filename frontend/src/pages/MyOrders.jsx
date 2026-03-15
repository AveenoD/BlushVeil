import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle, MapPin } from 'lucide-react'
import api from '../api/axios'

const STATUS_CONFIG = {
    pending:          { label: 'Pending',          icon: Clock,       color: 'text-yellow-500', bg: 'bg-yellow-50' },
    confirmed:        { label: 'Confirmed',         icon: CheckCircle, color: 'text-blue-500',   bg: 'bg-blue-50' },
    dispatched:       { label: 'Dispatched',        icon: Truck,       color: 'text-purple-500', bg: 'bg-purple-50' },
    out_for_delivery: { label: 'Out for Delivery',  icon: Truck,       color: 'text-orange-500', bg: 'bg-orange-50' },
    delivered:        { label: 'Delivered',         icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50' },
    cancelled:        { label: 'Cancelled',         icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50' },
}

const StatusBadge = ({ status }) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
    const Icon = config.icon
    return (
        <span className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${config.bg} ${config.color}`}>
            <Icon size={12} />
            {config.label}
        </span>
    )
}

const MyOrders = () => {
    const navigate = useNavigate()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders/my-orders')
                setOrders(res.data.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchOrders()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
                <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <span className="font-semibold text-gray-900">My Orders</span>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-8">
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
                        <Package size={40} className="mb-3 opacity-30" />
                        <p className="text-sm font-medium">No orders yet</p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-4 text-sm text-black underline"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">

                                {/* Order Header */}
                                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-gray-400">Order Number</p>
                                        <p className="text-sm font-semibold text-gray-900">{order.orderNumber}</p>
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>

                                {/* Items */}
                                <div className="px-5 py-4 flex flex-col gap-3">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex gap-3">
                                            <img
                                                src={item.image}
                                                alt={item.name}
                                                className="w-14 h-16 rounded-xl object-cover bg-gray-100 shrink-0"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Size: {item.size} {item.color && `· ${item.color}`} · Qty: {item.quantity}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-900 mt-1">₹{item.price * item.quantity}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Tracking Info */}
                                {(order.status === 'dispatched' || order.status === 'out_for_delivery') && order.estimatedDelivery && (
                                    <div className="mx-5 mb-4 bg-purple-50 rounded-xl px-4 py-3 flex items-center gap-2">
                                        <Truck size={14} className="text-purple-500 shrink-0" />
                                        <p className="text-xs text-purple-600">
                                            Estimated delivery: <span className="font-semibold">
                                                {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </span>
                                        </p>
                                    </div>
                                )}

                                {order.status === 'delivered' && order.deliveredAt && (
                                    <div className="mx-5 mb-4 bg-green-50 rounded-xl px-4 py-3 flex items-center gap-2">
                                        <CheckCircle size={14} className="text-green-500 shrink-0" />
                                        <p className="text-xs text-green-600">
                                            Delivered on: <span className="font-semibold">
                                                {new Date(order.deliveredAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'long', year: 'numeric'
                                                })}
                                            </span>
                                        </p>
                                    </div>
                                )}

                                {/* Address + Total */}
                                <div className="px-5 pb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                        <MapPin size={12} />
                                        {order.deliveryAddress?.city}, {order.deliveryAddress?.state}
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900">Total: ₹{order.totalAmount}</p>
                                </div>

                                {/* Order Date */}
                                <div className="px-5 pb-4">
                                    <p className="text-xs text-gray-400">
                                        Ordered on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric', month: 'long', year: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyOrders