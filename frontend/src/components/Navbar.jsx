import { useState } from 'react'
import { Search, LogIn, LogOut, LayoutDashboard, Menu, X, UserCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../logo/navlogo.png'

const Navbar = ({ onSearch }) => {
    const { user, logout, isAdmin, isLoading } = useAuth()   // ← add isLoading here
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [menuOpen, setMenuOpen] = useState(false)

    const handleSearch = (e) => {
        e.preventDefault()
        if (onSearch) onSearch(query)
    }

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">

                
                <img
                    src={logo}
                    alt="BlushVeil"
                    onClick={() => navigate('/')}
                     className="h-24 w-autocursor-pointer shrink-0 object-contain"
                />

                {/* Search Bar */}
                <form
                    onSubmit={handleSearch}
                    className="flex-1 max-w-xl mx-auto hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2"
                >
                    <Search size={16} className="text-gray-400 shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search dresses..."
                        className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                    />
                </form>

                {/* Desktop Auth Area */}
                <div className="hidden sm:flex items-center gap-2 ml-auto shrink-0">
                    {isLoading ? (
                        // During auth check → show placeholder to prevent flash
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-24 bg-gray-100 rounded-full animate-pulse" />
                        </div>
                    ) : user ? (
                        <>
                            {/* Profile Button */}
                            <button
                                onClick={() => navigate('/profile')}
                                className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center text-white text-xs font-semibold">
                                    {user.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <span className="max-w-[80px] truncate">{user.fullName?.split(' ')[0]}</span>
                            </button>

                            {isAdmin && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <LayoutDashboard size={15} />
                                    Admin
                                </button>
                            )}
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
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

                {/* Mobile Menu Toggle */}
                <button className="sm:hidden ml-auto" onClick={() => setMenuOpen(!menuOpen)}>
                    {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {menuOpen && (
                <div className="sm:hidden border-t border-gray-100 px-4 py-3 flex flex-col gap-3 bg-white">
                    <form onSubmit={handleSearch} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2">
                        <Search size={16} className="text-gray-400" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search dresses..."
                            className="bg-transparent outline-none text-sm w-full"
                        />
                    </form>

                    {isLoading ? (
                        <div className="h-10 bg-gray-100 rounded animate-pulse" />
                    ) : user ? (
                        <>
                            <button onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                                className="flex items-center gap-2 text-sm font-medium py-2">
                                <UserCircle size={15} /> My Profile
                            </button>
                            {isAdmin && (
                                <button onClick={() => { navigate('/admin'); setMenuOpen(false) }}
                                    className="flex items-center gap-2 text-sm font-medium py-2">
                                    <LayoutDashboard size={15} /> Admin Panel
                                </button>
                            )}
                            <button onClick={handleLogout}
                                className="flex items-center gap-2 text-sm font-medium py-2 text-red-500">
                                <LogOut size={15} /> Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={() => { navigate('/login'); setMenuOpen(false) }}
                            className="flex items-center gap-2 text-sm font-medium py-2">
                            <LogIn size={15} /> Login
                        </button>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar