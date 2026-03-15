import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const ProductPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { addToCart } = useCart()
    const { user } = useAuth()
    const [dress, setDress] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedSize, setSelectedSize] = useState('')
    const [selectedColor, setSelectedColor] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [added, setAdded] = useState(false)

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

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login')
            return
        }
        if (!selectedSize) return alert('Please select a size')
        addToCart(dress, selectedSize, selectedColor, quantity)
        setAdded(true)
        setTimeout(() => setAdded(false), 2000)
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
        <div className="min-h-screen flex items-center justify-center text-gray-400">
            Dress not found
        </div>
    )

    return (
        <div className="min-h-screen bg-white pb-32">

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-sm"
            >
                <ArrowLeft size={18} />
            </button>

            {/* Image */}
            <div className="w-full aspect-square bg-gray-100">
                <img src={dress.image?.url} alt={dress.name} className="w-full h-full object-cover" />
            </div>

            {/* Details */}
            <div className="px-5 py-6">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">{dress.category}</span>
                <h1 className="text-xl font-semibold text-gray-900 mt-1">{dress.name}</h1>
                <p className="text-2xl font-semibold text-gray-900 mt-2">₹{dress.price}</p>

                {/* Stock */}
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${dress.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                    {dress.stock > 0 ? `${dress.stock} in stock` : 'Out of stock'}
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mt-4">{dress.description}</p>

                {/* Size Selector */}
                {dress.sizes?.length > 0 && (
                    <div className="mt-5">
                        <p className="text-xs font-medium text-gray-500 mb-2">SIZE</p>
                        <div className="flex gap-2 flex-wrap">
                            {dress.sizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                                        ${selectedSize === size
                                            ? 'bg-black text-white border-black'
                                            : 'border-gray-200 text-gray-600'
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
                    <div className="mt-5">
                        <p className="text-xs font-medium text-gray-500 mb-2">COLOR — {selectedColor}</p>
                        <div className="flex gap-2 flex-wrap">
                            {dress.colors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors
                                        ${selectedColor === color
                                            ? 'bg-black text-white border-black'
                                            : 'border-gray-200 text-gray-600'
                                        }`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quantity */}
                <div className="mt-5">
                    <p className="text-xs font-medium text-gray-500 mb-2">QUANTITY</p>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setQuantity(q => Math.max(1, q - 1))}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center"
                        >
                            <Minus size={14} />
                        </button>
                        <span className="text-sm font-medium w-6 text-center">{quantity}</span>
                        <button
                            onClick={() => setQuantity(q => q + 1)}
                            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center"
                        >
                            <Plus size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
                <button
                    onClick={handleAddToCart}
                    disabled={dress.stock === 0}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-full text-sm font-medium transition-colors
                        ${added ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'}
                        disabled:opacity-50`}
                >
                    <ShoppingBag size={16} />
                    {added ? 'Added to Cart!' : 'Add to Cart'}
                </button>
            </div>
        </div>
    )
}

export default ProductPage