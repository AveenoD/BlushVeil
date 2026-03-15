import { X, ShoppingBag, Plus, Minus, Trash2, MessageCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'

const ADMIN_WHATSAPP = '919999999999' // ← apna number daalo

const DressModal = ({ dress, onClose }) => {
    const { addToCart, cartItems, updateQuantity } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [buyingNow, setBuyingNow] = useState(false)

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

    const cartItem = cartItems.find(
        item =>
            item.dress._id === dress._id &&
            item.selectedSize === selectedSize &&
            item.selectedColor === selectedColor
    )
    const isInCart = !!cartItem

    const validateSelection = () => {
        if (!user) { navigate('/login'); onClose(); return false }
        if (!selectedSize) { alert('Please select a size'); return false }
        if (dress.colors?.length > 0 && !selectedColor) { alert('Please select a color'); return false }
        return true
    }

    const handleAddToCart = () => {
        if (!validateSelection()) return
        addToCart(dress, selectedSize, selectedColor, 1)
    }

    const handleBuyNow = async () => {
        if (!validateSelection()) return

        const { street, city, state, pincode } = user.address || {}
        if (!street || !city || !state || !pincode) {
            alert('Please add your delivery address first!')
            navigate('/profile')
            onClose()
            return
        }

        setBuyingNow(true)
        try {
            const items = [{
                dress: dress._id,
                name: dress.name,
                image: dress.image?.url,
                price: dress.price,
                size: selectedSize,
                color: selectedColor || 'N/A',
                quantity: 1
            }]

            const res = await api.post('/orders/place', {
                items,
                totalAmount: dress.price
            })
            const order = res.data.data

            let message = `🛍️ *New Order — BlushVeil*\n`
            message += `Order No: *${order.orderNumber}*\n\n`
            message += `*1. ${dress.name}*\n`
            message += `   Size: ${selectedSize} | Color: ${selectedColor || 'N/A'} | Qty: 1\n`
            message += `   Price: ₹${dress.price}\n\n`
            message += `💰 *Total: ₹${dress.price}*\n\n`
            message += `📦 *Delivery Address:*\n`
            message += `${user.address.street}, ${user.address.city}\n`
            message += `${user.address.state} - ${user.address.pincode}\n`
            message += `${user.address.country || ''}\n\n`
            message += `👤 *Customer:*\n`
            message += `${user.fullName} | ${user.phoneNumber}`

            onClose()
            window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`, '_blank')
        } catch (err) {
            alert(err.response?.data?.message || 'Something went wrong')
        } finally {
            setBuyingNow(false)
        }
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
                                    <button key={size} onClick={() => setSelectedSize(size)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                                            ${selectedSize === size ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Color Selector */}
                    {dress.colors?.length > 0 && (
                        <div className="mb-5">
                            <p className="text-xs font-medium text-gray-500 mb-2">COLOR — {selectedColor}</p>
                            <div className="flex gap-2 flex-wrap">
                                {dress.colors.map(color => (
                                    <button key={color} onClick={() => setSelectedColor(color)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                                            ${selectedColor === color ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Cart Controls */}
                    <div className="mt-auto pt-2 flex flex-col gap-2">
                        {dress.stock === 0 ? (
                            <button disabled className="w-full py-3 rounded-full text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed">
                                Out of Stock
                            </button>
                        ) : isInCart ? (
                            <>
                                {/* Quantity Controls */}
                                <div className="flex items-center justify-between bg-gray-50 rounded-full px-4 py-2">
                                    <button onClick={() => updateQuantity(dress._id, selectedSize, selectedColor, cartItem.quantity - 1)}
                                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-colors">
                                        {cartItem.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
                                    </button>
                                    <span className="text-sm font-semibold text-gray-900">{cartItem.quantity} in cart</span>
                                    <button onClick={() => updateQuantity(dress._id, selectedSize, selectedColor, cartItem.quantity + 1)}
                                        className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                        <Plus size={13} />
                                    </button>
                                </div>
                                {/* Buy Now still available */}
                                <button onClick={handleBuyNow} disabled={buyingNow}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50">
                                    <MessageCircle size={15} />
                                    {buyingNow ? 'Placing...' : 'Buy Now on WhatsApp'}
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Add to Cart */}
                                <button onClick={handleAddToCart}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors">
                                    <ShoppingBag size={15} />
                                    Add to Cart
                                </button>
                                {/* Buy Now */}
                                <button onClick={handleBuyNow} disabled={buyingNow}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-medium border border-green-500 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50">
                                    <MessageCircle size={15} />
                                    {buyingNow ? 'Placing...' : 'Buy Now on WhatsApp'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DressModal