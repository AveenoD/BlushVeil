import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

const CART_KEY = 'cart';

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        try {
            const saved = localStorage.getItem(CART_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // Sync with localStorage
    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cartItems));
    }, [cartItems]);

    const findItemIndex = useCallback((items, dressId, size, color) => {
        return items.findIndex(item =>
            item.dress._id === dressId &&
            item.selectedSize === size &&
            item.selectedColor === color
        );
    }, []);

    const addToCart = useCallback((dress, size, color, quantity = 1) => {
        setCartItems(prev => {
            const index = findItemIndex(prev, dress._id, size, color);
            if (index !== -1) {
                return prev.map((item, i) =>
                    i === index
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { dress, selectedSize: size, selectedColor: color, quantity }];
        });
    }, [findItemIndex]);

    const removeFromCart = useCallback((dressId, size, color) => {
        setCartItems(prev =>
            prev.filter(item =>
                !(item.dress._id === dressId &&
                  item.selectedSize === size &&
                  item.selectedColor === color)
            )
        );
    }, []);

    const updateQuantity = useCallback((dressId, size, color, newQty) => {
        if (newQty <= 0) {
            removeFromCart(dressId, size, color);
            return;
        }
        setCartItems(prev =>
            prev.map(item =>
                item.dress._id === dressId &&
                item.selectedSize === size &&
                item.selectedColor === color
                    ? { ...item, quantity: newQty }
                    : item
            )
        );
    }, [removeFromCart]);

    // ✅ Improved clearCart - directly clears both state and localStorage
    const clearCart = useCallback(() => {
        setCartItems([]);
        localStorage.removeItem(CART_KEY);   // Immediate clear
    }, []);

    const totalAmount = useMemo(() => 
        cartItems.reduce((sum, item) => sum + (item.dress.price * item.quantity), 0), 
    [cartItems]);

    const totalItems = useMemo(() => 
        cartItems.reduce((sum, item) => sum + item.quantity, 0), 
    [cartItems]);

    const value = useMemo(() => ({
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItems
    }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalAmount, totalItems]);

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === null) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};