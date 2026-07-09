import { useState, useEffect } from 'react'

const WISHLIST_KEY = 'meraki_wishlist'

function loadFromStorage() {
    try {
        const saved = localStorage.getItem(WISHLIST_KEY)
        return saved ? JSON.parse(saved) : []
    } catch {
        return []
    }
}

const wishlistListeners = new Set()

export function useWishlist() {
    const [wishlist, setWishlist] = useState(loadFromStorage)

    useEffect(() => {
        const syncListener = (newWishlist) => {
            setWishlist(newWishlist)
        }
        wishlistListeners.add(syncListener)
        
        const handleStorageChange = (e) => {
            if (e.key === WISHLIST_KEY) {
                const updated = loadFromStorage()
                wishlistListeners.forEach(listener => listener(updated))
            }
        }
        window.addEventListener('storage', handleStorageChange)

        return () => {
            wishlistListeners.delete(syncListener)
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [])

    function updateWishlistState(newWishlist) {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(newWishlist))
        wishlistListeners.forEach(listener => listener(newWishlist))
        window.dispatchEvent(new Event('wishlist-updated'))
    }

    function toggleWishlist(productId) {
        const current = loadFromStorage()
        let updated
        if (current.includes(productId)) {
            updated = current.filter(id => id !== productId)
        } else {
            updated = [...current, productId]
        }
        updateWishlistState(updated)
    }

    function isWishlisted(productId) {
        return wishlist.includes(productId)
    }

    return { wishlist, toggleWishlist, isWishlisted, wishlistCount: wishlist.length }
}
