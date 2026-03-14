import { X, ShoppingBag } from 'lucide-react'
import { useEffect } from 'react'

const DressModal = ({ dress, onClose }) => {

    // Close on escape key
    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    if (!dress) return null

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
                    <img
                        src={dress.image?.url}
                        alt={dress.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Details */}
                <div className="flex-1 p-8 flex flex-col overflow-y-auto">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">{dress.category}</span>
                            <h2 className="text-2xl font-semibold text-gray-900 mt-1">{dress.name}</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors shrink-0"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <p className="text-3xl font-semibold text-gray-900 mb-4">₹{dress.price}</p>

                    <p className="text-sm text-gray-500 leading-relaxed mb-6">{dress.description}</p>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                        <span className={`w-2 h-2 rounded-full ${dress.stock > 0 ? 'bg-green-400' : 'bg-red-400'}`}></span>
                        {dress.stock > 0 ? `${dress.stock} in stock` : 'Out of stock'}
                    </div>

                    <button className="mt-auto flex items-center justify-center gap-2 bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                        <ShoppingBag size={16} />
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DressModal