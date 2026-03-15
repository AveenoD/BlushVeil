import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const DressModal = ({ dress, onClose }) => {
    const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    useEffect(() => {
        if (dress) {
            setSelectedSize(dress.sizes?.[0] || '')
            setSelectedColor(dress.colors?.[0] || '')
        }
    }, [dress])

    if (!dress) return null

    // Check if this dress with selected size/color is already in cart
    const cartItem = cartItems.find(
        item =>
            item.dress._id === dress._id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
    )
    const isInCart = !!cartItem

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login')
            onClose()
            return
        }
        if (!selectedSize) return alert('Please select a size')
        if (dress.colors?.length > 0 && !selectedColor) return alert('Please select a color')
        addToCart(dress, selectedSize, selectedColor, 1)
    }

    const handleIncrease = () => {
        updateQuantity(dress._id, selectedSize, selectedColor, cartItem.quantity + 1)
    }

    const handleDecrease = () => {
        updateQuantity(dress._id, selectedSize, selectedColor, cartItem.quantity - 1)
    }

    return (
        <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Image */}
                <div className="w-1/2 bg-gray-100 shrink-0">
                    <img src={dress.image?.url} alt={dress.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-1 p-8 flex flex-col overflow-y-auto">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">{dress.category}</span>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-1">{dress.name}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0">
                            <X size={18} />
                        </button>
                    </div>

                    <p className="text-3xl font-semibold text-gray-900 mb-3">₹{dress.price}</p>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{dress.description}</p>

                    {/* Stock */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-5">
                        <span className={`w-2 h-2 rounded-full ${dress.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                        {dress.stock > 0 ? `${dress.stock} in stock` : 'Out of stock'}
                    </div>

                    {/* Size Selector */}
                    {dress.sizes?.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">SIZE</p>
                            <div className="flex gap-2 flex-wrap">
                                {dress.sizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                                            ${selectedSize === size
                                                ? 'bg-black text-white border-black'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Selector */}
                    {dress.colors?.length > 0 && (
                        <div className="mb-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">COLOR — {selectedColor}</p>
                            <div className="flex gap-2 flex-wrap">
                                {dress.colors.map(color => (
                                    <button
                                        key={color}
                                        onClick={() => setSelectedColor(color)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                                            ${selectedColor === color
                                                ? 'bg-black text-white border-black'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-400'
                                            }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cart Controls */}
                    <div className="mt-auto pt-4">
                        {dress.stock === 0 ? (
                            <button disabled className="w-full py-3 rounded-full text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
                                Out of Stock
                            </button>
                        ) : isInCart ? (
                            <div className="flex items-center justify-between bg-gray-50 rounded-full px-4 py-2">
                                <button
                                    onClick={handleDecrease}
                                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors"
                                >
                                    {cartItem.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                                </button>
                                <span className="text-sm font-semibold text-gray-900">
                                    {cartItem.quantity} in cart
                                </span>
                                <button
                                    onClick={handleIncrease}
                                    className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors"
                                >
                                    <Plus size={13} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors"
                            >
                                <ShoppingBag size={16} />
                                Add to Cart
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DressModal