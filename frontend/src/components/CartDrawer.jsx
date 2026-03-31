import { X, Minus, Plus, Trash2, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import api from '../api/axios';
import { buildWhatsAppMessage } from '../components/utils/whatsapp.js';

const CartDrawer = ({ isOpen, onClose }) => {
    const { 
        cartItems, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        totalAmount, 
        totalItems 
    } = useCart();

    const { user } = useAuth();
    const navigate = useNavigate();
    const [ordering, setOrdering] = useState(false);
    const [error, setError] = useState('');

    const handleWhatsAppOrder = async () => {
        if (!user) {
            navigate('/login');
            onClose();
            return;
        }

        const { street, city, state, pincode } = user.address || {};
        if (!street || !city || !state || !pincode) {
            setError('Please add your delivery address before placing an order.');
            setTimeout(() => {
                navigate('/profile');
                onClose();
            }, 1500);
            return;
        }

        setOrdering(true);
        setError('');

        const waWindow = window.open('', '_blank');

        try {
            const items = cartItems.map(item => ({
                dress: item.dress._id,
                name: item.dress.name,
                image: item.dress.image?.url,
                price: item.dress.price,
                size: item.selectedSize,
                color: item.selectedColor || 'N/A',
                quantity: item.quantity
            }));

            const res = await api.post('/orders/place', { items, totalAmount });

            if (res.data.success) {
                const order = res.data.data;
                const message = buildWhatsAppMessage(order, items, user, totalAmount);
                const waURL = `https://wa.me/918080161421?text=${encodeURIComponent(message)}`;

                // ✅ Clear cart immediately
                clearCart();

                // Close drawer and open WhatsApp
                onClose();

                if (waWindow) {
                    waWindow.location.href = waURL;
                } else {
                    window.open(waURL, '_blank');
                }

            } else {
                if (waWindow) waWindow.close();
                setError('Order could not be placed. Please try again.');
            }

        } catch (err) {
            if (waWindow) waWindow.close();
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setOrdering(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

            <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-xl">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <ShoppingBag size={18} />
                        <span className="font-semibold text-gray-900">Cart</span>
                        {totalItems > 0 && (
                            <span className="bg-black text-white text-xs px-2 py-0.5 rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Items */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                    {cartItems.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <ShoppingBag size={40} className="mb-3 opacity-30" />
                            <p className="text-sm">Your cart is empty</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {cartItems.map((item) => {
                                const key = `${item.dress._id}-${item.selectedSize}-${item.selectedColor || ''}`;
                                return (
                                    <div key={key} className="flex gap-3 pb-4 border-b border-gray-50">
                                        <img 
                                            src={item.dress.image?.url || '/placeholder.jpg'} 
                                            alt={item.dress.name}
                                            className="w-16 h-20 rounded-xl object-cover bg-gray-100 shrink-0" 
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {item.dress.name}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {item.selectedSize} 
                                                {item.selectedColor && ` · ${item.selectedColor}`}
                                            </p>
                                            <p className="text-sm font-semibold text-gray-900 mt-1">
                                                ₹{(item.dress.price * item.quantity).toLocaleString('en-IN')}
                                            </p>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-2">
                                                    <button 
                                                        onClick={() => updateQuantity(
                                                            item.dress._id, 
                                                            item.selectedSize, 
                                                            item.selectedColor, 
                                                            item.quantity - 1
                                                        )}
                                                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                                                    >
                                                        <Minus size={10} />
                                                    </button>
                                                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(
                                                            item.dress._id, 
                                                            item.selectedSize, 
                                                            item.selectedColor, 
                                                            item.quantity + 1
                                                        )}
                                                        className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50"
                                                    >
                                                        <Plus size={10} />
                                                    </button>
                                                </div>

                                                <button 
                                                    onClick={() => removeFromCart(
                                                        item.dress._id, 
                                                        item.selectedSize, 
                                                        item.selectedColor
                                                    )}
                                                    className="p-1 hover:text-red-500 text-gray-400 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {cartItems.length > 0 && (
                    <div className="px-5 py-4 border-t border-gray-100">
                        {error && (
                            <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-xl mb-3">
                                {error}
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm text-gray-500">Total</span>
                            <span className="text-lg font-semibold text-gray-900">
                                ₹{totalAmount.toLocaleString('en-IN')}
                            </span>
                        </div>

                        <button 
                            onClick={handleWhatsAppOrder} 
                            disabled={ordering}
                            className="w-full flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-full text-sm font-medium hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                            <MessageCircle size={16} />
                            {ordering ? 'Placing Order...' : 'Order on WhatsApp'}
                        </button>

                        <button 
                            onClick={() => { navigate('/my-orders'); onClose(); }}
                            className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-3 transition-colors"
                        >
                            View My Orders
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;