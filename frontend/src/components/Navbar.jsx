import { useState } from 'react'
import { Search, LogIn, LogOut, LayoutDashboard, Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import navlogo from '../../public/navlogo.png'
const Navbar = ({ onSearch }) => {
    const { user, logout, isAdmin } = useAuth()
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

                {/* Logo */}
                <img
                    src={navlogo}
                    alt="BlushVeil"
                    onClick={() => navigate('/')}
                    className="h-30 w-30 cursor-pointer object-contain"
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

                {/* Desktop Auth Buttons */}
                <div className="hidden sm:flex items-center gap-2 ml-auto shrink-0">
                    {user ? (
                        <>
                            {isAdmin && (
                                <button
                                    onClick={() => navigate('/admin')}
                                    className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <LayoutDashboard size={15} />
                                    Admin Panel
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
                <button
                    className="sm:hidden ml-auto"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
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
                            className="bg-transparent outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                        />
                    </form>
                    {user ? (
                        <>
                            {isAdmin && (
                                <button onClick={() => { navigate('/admin'); setMenuOpen(false) }} className="flex items-center gap-2 text-sm font-medium py-2">
                                    <LayoutDashboard size={15} /> Admin Panel
                                </button>
                            )}
                            <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium py-2 text-red-500">
                                <LogOut size={15} /> Logout
                            </button>
                        </>
                    ) : (
                        <button onClick={() => { navigate('/login'); setMenuOpen(false) }} className="flex items-center gap-2 text-sm font-medium py-2">
                            <LogIn size={15} /> Login
                        </button>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar