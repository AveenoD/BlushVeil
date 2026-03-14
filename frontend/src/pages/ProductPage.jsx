import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBag } from 'lucide-react'
import api from '../api/axios'

const ProductPage = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [dress, setDress] = useState(null)
    const [loading, setLoading] = useState(true)

   
    useEffect(() => {
        const fetchDress = async () => {
            try {
                const res = await api.get(`/dresses/${id}`)
                setDress(res.data.data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchDress()
    }, [id])

    if (loading) return (
        <div className="min-h-screen bg-white animate-pulse">
            <div className="aspect-square bg-gray-100 w-full" />
            <div className="p-5 flex flex-col gap-3">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-6 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
        </div>
    )

    if (!dress) return (
        <div className="min-h-screen flex items-center justify-center text-gray-400">
            Dress not found
        </div>
    )

    return (
        <div className="min-h-screen bg-white">

            {/* Back Button */}
            <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 z-10 p-2 bg-white rounded-full shadow-sm"
            >
                <ArrowLeft size={18} />
            </button>

            {/* Image */}
            <div className="w-full aspect-square bg-gray-100">
                <img
                    src={dress.image?.url}
                    alt={dress.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Details */}
            <div className="px-5 py-6">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                    {dress.category}
                </span>
                <h1 className="text-xl font-semibold text-gray-900 mt-1">{dress.name}</h1>
                <p className="text-2xl font-semibold text-gray-900 mt-2">₹{dress.price}</p>

                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                    <span className={`w-2 h-2 rounded-full ${dress.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                    {dress.stock > 0 ? `${dress.stock} in stock` : 'Out of stock'}
                </div>

                <p className="text-sm text-gray-500 leading-relaxed mt-4">{dress.description}</p>

                <button className="w-full mt-8 flex items-center justify-center gap-2 bg-black text-white py-4 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                    <ShoppingBag size={16} />
                    Add to Cart
                </button>
            </div>
        </div>
    )
}

export default ProductPage