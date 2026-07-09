import { useState, useEffect } from 'react'

const CART_KEY = 'meraki_cart'

function loadFromStorage() {
    try {
        const saved = localStorage.getItem(CART_KEY)
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

// Global set of hook state setters to synchronize all active useCart instances
const cartListeners = new Set()

export function useCart() {
    const [cart, setCart] = useState(loadFromStorage)

    useEffect(() => {
        const syncListener = (newCart) => {
            setCart(newCart)
        }
        cartListeners.add(syncListener)
        
        // Listen to storage events from other tabs/windows
        const handleStorageChange = (e) => {
            if (e.key === CART_KEY) {
                const updatedCart = loadFromStorage()
                cartListeners.forEach(listener => listener(updatedCart))
            }
        }
        window.addEventListener('storage', handleStorageChange)

        return () => {
            cartListeners.delete(syncListener)
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    function updateCartState(newCart) {
        localStorage.setItem(CART_KEY, JSON.stringify(newCart))
        // Dispatch to all listeners in the current tab
        cartListeners.forEach(listener => listener(newCart))
        // Dispatch custom event to notify other components that might listen to window
        window.dispatchEvent(new Event('cart-updated'))
    }

    function addToCart(product, size) {
        const currentCart = loadFromStorage()
        const existingIndex = currentCart.findIndex(
            item => item.id === product.id && item.size === size
        )
        let updated
        if (existingIndex >= 0) {
            updated = [...currentCart]
            updated[existingIndex] = {
                ...updated[existingIndex],
                quantity: updated[existingIndex].quantity + 1,
            }
        } else {
            updated = [...currentCart, { ...product, size, quantity: 1 }]
        }
        updateCartState(updated)
    }

    function removeFromCart(productId, size) {
        const currentCart = loadFromStorage()
        const updated = currentCart.filter(item => !(item.id === productId && item.size === size))
        updateCartState(updated)
    }

    function clearCart() {
        updateCartState([])
    }

    function updateQuantity(productId, size, quantity) {
        if (quantity <= 0) {
            removeFromCart(productId, size)
            return
        }
        const currentCart = loadFromStorage()
        const updated = currentCart.map(item => 
            (item.id === productId && item.size === size)
                ? { ...item, quantity }
                : item
        )
        updateCartState(updated)
    }

    const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

    return { cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount }
}
