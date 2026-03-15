import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
    
    const [cartItems, setCartItems] = useState(() => {
        const saved = localStorage.getItem('cart')
        return saved ? JSON.parse(saved) : []
    })

    
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems))
    }, [cartItems])
    const addToCart = (dress, size, color, quantity = 1) => {
    setCartItems(prev => {
       
        const exists = prev.find(item => 
            item.dress._id === dress._id && 
            item.selectedSize === size && 
            item.selectedColor === color
        )
        
        if (exists) {
            
            return prev.map(item =>
                item.dress._id === dress._id && 
                item.selectedSize === size && 
                item.selectedColor === color
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            )
        }
        
        
        return [...prev, {
            dress,
            selectedSize: size,
            selectedColor: color,
            quantity
        }]
    })
}
const removeFromCart = (dressId, size, color) => {
    setCartItems(prev => 
        prev.filter(item => 
            !(item.dress._id === dressId && 
              item.selectedSize === size && 
              item.selectedColor === color)
        )
    )
}
const updateQuantity = (dressId, size, color, newQty) => {
    if (newQty <= 0) {
        removeFromCart(dressId, size, color)
        return
    }
    setCartItems(prev =>
        prev.map(item =>
            item.dress._id === dressId && 
            item.selectedSize === size && 
            item.selectedColor === color
                ? { ...item, quantity: newQty }
                : item
        )
    )
}
const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
}

const totalAmount = cartItems.reduce(
    (sum, item) => sum + (item.dress.price * item.quantity), 0
)

const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity, 0
)

return (
        <CartContext.Provider value={{ 
            cartItems, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart,
            totalAmount,
            totalItems
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)