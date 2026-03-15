import { useState, useEffect } from 'react'
import { Search, LogIn, LogOut, LayoutDashboard, Menu, X, UserCircle, ShoppingBag, ClipboardList } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import logo from '../logo/navlogo.png'
import CartDrawer from './CartDrawer'
import api from '../api/axios'

const ACTIVE_STATUSES = ['pending', 'confirmed', 'dispatched']

const Navbar = ({ onSearch }) => {
    const { user, logout, isAdmin, isLoading } = useAuth()
    const { totalItems } = useCart()
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)
    const [cartOpen, setCartOpen] = useState(false)
    const [activeOrdersCount, setActiveOrdersCount] = useState(0)
    const [newOrdersCount, setNewOrdersCount] = useState(0)

    // User — fetch active orders count with polling
    useEffect(() => {
        if (!user || isAdmin) return
        const fetchActiveOrders = async () => {
            try {
                const res = await api.get('/orders/my-orders')
                const active = res.data.data.filter(order =>
                    ACTIVE_STATUSES.includes(order.status)
                )
                setActiveOrdersCount(active.length)
            } catch (err) {
                console.error(err)
            }
        }
        fetchActiveOrders()
        const interval = setInterval(fetchActiveOrders, 30000)
        return () => clearInterval(interval)
    }, [user, isAdmin])

    // Admin — fetch pending orders count with polling
    useEffect(() => {
        if (!user || !isAdmin) return
        const fetchNewOrders = async () => {
            try {
                const res = await api.get('/orders/all')
                const pending = res.data.data.filter(order =>
                    order.status === 'pending'
                )
                setNewOrdersCount(pending.length)
            } catch (err) {
                console.error(err)
            }
        }
        fetchNewOrders()
        const interval = setInterval(fetchNewOrders, 30000)
        return () => clearInterval(interval)
    }, [user, isAdmin])

    // Real time search handler
    const handleQueryChange = (value) => {
        setQuery(value)
        if (onSearch) onSearch(value)
    }

    const handleSearch = (e) => {
        e.preventDefault()
    }

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <>
            <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-3">

                    {/* Logo */}
                    <img
                        src={logo}
                        alt="BlushVeil"
                        onClick={() => navigate('/')}
                        className="h-28 w-auto cursor-pointer shrink-0 object-contain"
                    />

                    {/* Search Bar */}
                    <form
                        onSubmit={handleSearch}
                        className="flex-1 max-w-xl mx-auto hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2"
                    >
                        <Search size={15} className="text-gray-400 shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => handleQueryChange(e.target.value)}
                            placeholder="Search dresses..."
                            className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                        />
                    </form>

                    {/* Desktop Right */}
                    <div className="hidden sm:flex items-center gap-1.5 ml-auto shrink-0">

                        {/* Cart — sirf user ke liye */}
                        {!isAdmin && (
                            <button
                                onClick={() => setCartOpen(true)}
                                className="relative p-2 hover:bg-gray-50 rounded-full transition-colors"
                            >
                                <ShoppingBag size={19} className="text-gray-700" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        )}

                        {isLoading ? (
                            <div className="h-9 w-24 bg-gray-100 rounded-full animate-pulse" />
                        ) : user ? (
                            <>
                                {/* Profile Button */}
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-xs font-semibold">
                                        {user.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="max-w-[80px] truncate">{user.fullName?.split(' ')[0]}</span>
                                </button>

                                {/* My Orders — sirf user ke liye */}
                                {!isAdmin && (
                                    <button
                                        onClick={() => navigate('/my-orders')}
                                        className="relative flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <ClipboardList size={15} />
                                        Orders
                                        {activeOrdersCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                                                {activeOrdersCount}
                                            </span>
                                        )}
                                    </button>
                                )}

                                {/* Admin Panel — sirf admin ke liye */}
                                {isAdmin && (
                                    <button
                                        onClick={() => navigate('/admin/orders')}
                                        className="relative flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                                    >
                                        <LayoutDashboard size={15} />
                                        Admin
                                        {newOrdersCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                                {newOrdersCount}
                                            </span>
                                        )}
                                    </button>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors text-red-500"
                                >
                                    <LogOut size={15} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => navigate('/login')}
                                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800 transition-colors"
                            >
                                <LogIn size={15} />
                                Login
                            </button>
                        )}
                    </div>

                    {/* Mobile Right */}
                    <div className="sm:hidden ml-auto flex items-center gap-2">
                        {!isAdmin && (
                            <button onClick={() => setCartOpen(true)} className="relative p-2">
                                <ShoppingBag size={20} className="text-gray-700" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-xs rounded-full flex items-center justify-center font-medium">
                                        {totalItems}
                                    </span>
                                )}
                            </button>
                        )}
                        <button onClick={() => setMenuOpen(!menuOpen)} className="p-1">
                            {menuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown */}
                {menuOpen && (
                    <div className="sm:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-1 bg-white">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 mb-2">
                            <Search size={15} className="text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                placeholder="Search dresses..."
                                className="bg-transparent outline-none text-sm w-full"
                            />
                        </form>

                        {isLoading ? (
                            <div className="h-10 bg-gray-100 rounded animate-pulse" />
                        ) : user ? (
                            <>
                                <button
                                    onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                                    className="flex items-center gap-2 text-sm font-medium py-2.5 px-2 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    <UserCircle size={16} className="text-gray-500" />
                                    My Profile
                                </button>

                                {!isAdmin && (
                                    <button
                                        onClick={() => { navigate('/my-orders'); setMenuOpen(false) }}
                                        className="flex items-center justify-between text-sm font-medium py-2.5 px-2 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ClipboardList size={16} className="text-gray-500" />
                                            My Orders
                                        </div>
                                        {activeOrdersCount > 0 && (
                                            <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                                {activeOrdersCount} active
                                            </span>
                                        )}
                                    </button>
                                )}

                                {isAdmin && (
                                    <button
                                        onClick={() => { navigate('/admin/orders'); setMenuOpen(false) }}
                                        className="flex items-center justify-between text-sm font-medium py-2.5 px-2 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <LayoutDashboard size={16} className="text-gray-500" />
                                            Admin Panel
                                        </div>
                                        {newOrdersCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                                {newOrdersCount} new
                                            </span>
                                        )}
                                    </button>
                                )}

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 text-sm font-medium py-2.5 px-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors mt-1"
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => { navigate('/login'); setMenuOpen(false) }}
                                className="flex items-center gap-2 text-sm font-medium py-2.5 px-2 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <LogIn size={16} className="text-gray-500" />
                                Login
                            </button>
                        )}
                    </div>
                )}
            </nav>

            <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    )
}

export default Navbar