import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, ShoppingBag, Trash2, MessageCircle } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { buildWhatsAppMessage, openWhatsApp } from '../components/utils/whatsapp.js'
//This is a comment just to update the repo and trigger the pipeline. Please ignore.
const ProductPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addToCart, cartItems, updateQuantity } = useCart()
    const { user } = useAuth()
    const [dress, setDress] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [buyingNow, setBuyingNow] = useState(false)

    useEffect(() => {
        const fetchDress = async () => {
            try {
                const res = await api.get(`/dresses/${id}`)
                const d = res.data.data
                setDress(d)
                setSelectedSize(d.sizes?.[0] || '')
                setSelectedColor(d.colors?.[0] || '')
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchDress()
    }, [id])

    const cartItem = dress ? cartItems.find(item =>
        item.dress._id === dress._id &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
    ) : null
    const isInCart = !!cartItem

    const validateSelection = () => {
        if (!user) { navigate('/login'); return false }
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
            navigate('/profile'); return
        }

        setBuyingNow(true)
        try {
            const qty = isInCart ? cartItem.quantity : 1
            const items = [{
                dress: dress._id,
                name: dress.name,
                image: dress.image?.url,
                price: dress.price,
                size: selectedSize,
                color: selectedColor || 'N/A',
                quantity: qty  // ← dynamic
            }]
            const res = await api.post('/orders/place', { items, totalAmount: dress.price * qty })
            const message = buildWhatsAppMessage(res.data.data, items, user, dress.price)
            openWhatsApp(message)
        } catch (err) {
            alert(err.response?.data?.message || 'Something went wrong')
        } finally {
            setBuyingNow(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-white animate-pulse">
            <div className="aspect-square bg-gray-100 w-full" />
            <div className="p-5 flex flex-col gap-3">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-6 bg-gray-100 rounded w-2/3" />
            </div>
        </div>
    )

    if (!dress) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400">Dress not found</div>
    )

    return (
        <div className="min-h-screen bg-white pb-36">

            <button onClick={() => navigate(-1)} className="absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-sm">
                <ArrowLeft size={18} />
            </button>

            <div className="w-full aspect-square bg-gray-100">
                <img src={dress.image?.url} alt={dress.name} className="w-full h-full object-cover" />
            </div>

            <div className="px-5 py-6">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">{dress.category}</span>
                <h1 className="text-xl font-semibold text-gray-900 mt-1">{dress.name}</h1>
                <p className="text-2xl font-semibold text-gray-900 mt-2">₹{dress.price}</p>

                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${dress.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                    {dress.stock > 0 ? `${dress.stock} in stock` : 'Out of stock'}
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mt-4">{dress.description}</p>

                {/* Size */}
                {dress.sizes?.length > 0 && (
                    <div className="mt-5">
                        <p className="text-xs font-medium text-gray-500 mb-2">SIZE</p>
                        <div className="flex gap-2 flex-wrap">
                            {dress.sizes.map(size => (
                                <button key={size} onClick={() => setSelectedSize(size)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedSize === size ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600'}`}>
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Color */}
                {dress.colors?.length > 0 && (
                    <div className="mt-5">
                        <p className="text-xs font-medium text-gray-500 mb-2">COLOR — {selectedColor}</p>
                        <div className="flex gap-2 flex-wrap">
                            {dress.colors.map(color => (
                                <button key={color} onClick={() => setSelectedColor(color)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${selectedColor === color ? 'bg-black text-white border-black' : 'border-gray-200 text-gray-600'}`}>
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed Bottom */}
            <div className="fixed bottom-0 left-0 right-0 px-4 py-3 bg-white border-t border-gray-100">
                {dress.stock === 0 ? (
                    <button disabled className="w-full py-4 rounded-full text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed">Out of Stock</button>
                ) : isInCart ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between bg-gray-50 rounded-full px-5 py-3">
                            <button onClick={() => updateQuantity(dress._id, selectedSize, selectedColor, cartItem.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-colors">
                                {cartItem.quantity === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                            </button>
                            <span className="text-sm font-semibold text-gray-900">{cartItem.quantity} in cart</span>
                            <button onClick={() => updateQuantity(dress._id, selectedSize, selectedColor, cartItem.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors">
                                <Plus size={14} />
                            </button>
                        </div>
                        <button onClick={handleBuyNow} disabled={buyingNow}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50">
                            <MessageCircle size={16} />
                            {buyingNow ? 'Placing...' : 'Buy Now on WhatsApp'}
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        <button onClick={handleAddToCart}
                            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-sm font-medium bg-black text-white hover:bg-gray-800 transition-colors">
                            <ShoppingBag size={16} />
                            Add to Cart
                        </button>
                        <button onClick={handleBuyNow} disabled={buyingNow}
                            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-full text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50">
                            <MessageCircle size={16} />
                            {buyingNow ? 'Placing...' : 'Buy Now'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductPage