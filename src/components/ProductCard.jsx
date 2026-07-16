import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAssetUrl } from '../utils/assets.js'

export default function ProductCard({ product, onQuickView, onToggleWishlist, isWishlisted }) {
    const navigate = useNavigate()

    const [installmentText, setInstallmentText] = useState(() => {
        try {
            const config = JSON.parse(localStorage.getItem('meraki_store_config') || '{}')
            return config.installmentText || 'Em até 6x sem juros'
        } catch { return 'Em até 6x sem juros' }
    })

    useEffect(() => {
        const update = () => {
            try {
                const config = JSON.parse(localStorage.getItem('meraki_store_config') || '{}')
                if (config.installmentText) setInstallmentText(config.installmentText)
            } catch {}
        }
        window.addEventListener('storeConfigUpdated', update)
        window.addEventListener('storage', update)
        return () => {
            window.removeEventListener('storeConfigUpdated', update)
            window.removeEventListener('storage', update)
        }
    }, [])

    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
    }

    // Dynamic mock colors to emulate product options from the design
    const mockColors = product.category === 'Conjuntos' ? ['#C2B0A3', '#1A1A1A'] : ['#E8DCC4', '#EAA2A2', '#1A1A1A']

    const imageSrc = getAssetUrl(Array.isArray(product.image) ? (product.image[0] || '/placeholder.jpg') : (product.image || '/placeholder.jpg'))

    const handleCardClick = (e) => {
        if (e.target.closest('button')) return
        navigate(`/product/${product.id}`)
    }

    return (
        <div onClick={handleCardClick} className="group bg-white overflow-hidden transition-all duration-75 hover:shadow-premium relative flex flex-col h-full rounded-2xl border border-gray-100/50 cursor-pointer">
            {/* Image Wrapper */}
            <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] rounded-t-2xl">
                <img
                    src={imageSrc}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 cubic-bezier(0.19, 1, 0.22, 1) group-hover:scale-105"
                    onError={(e) => {
                        e.target.onError = null; // prevent infinite loop
                        e.target.src = getAssetUrl('/placeholder.jpg');
                    }}
                />

                {/* Add to cart / Quick view bag icon at bottom right of image */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onQuickView?.(product);
                    }}
                    className="absolute bottom-3 right-3 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 z-10"
                    aria-label="Adicionar ao carrinho"
                >
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                </button>

                {/* Wishlist Heart Icon at top right */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onToggleWishlist?.(product.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:bg-white hover:scale-115 shadow-sm z-10"
                    aria-label="Favoritar"
                >
                    <svg
                        className={`w-4 h-4 transition-all duration-300 ${isWishlisted ? 'text-primary fill-primary' : 'text-gray-600 hover:text-primary'}`}
                        fill={isWishlisted ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </button>
            </div>

            {/* Product Details */}
            <div className="p-4 flex flex-col flex-grow text-center items-center justify-between">
                <div className="w-full space-y-1.5 mb-2">
                    {/* Pink bordered badge for promotion / exclusivity */}
                    {product.badge ? (
                        <div className="inline-block border border-[#D11A6E] text-[#D11A6E] text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded">
                            {product.badge}
                        </div>
                    ) : (
                        <div className="inline-block border border-[#C6A76A] text-[#C6A76A] text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded">
                            Exclusivo Site
                        </div>
                    )}

                    {/* Color Swatches */}
                    <div className="flex justify-center gap-1.5 py-1">
                        {mockColors.map((color, cIdx) => (
                            <span 
                                key={cIdx} 
                                className="w-2.5 h-2.5 rounded-full border border-gray-300/80 shadow-xs inline-block" 
                                style={{ backgroundColor: color }} 
                            />
                        ))}
                    </div>

                    <h3 className="font-sans text-base sm:text-lg font-bold text-[#1A1A1A] tracking-wide leading-snug line-clamp-2 h-14 overflow-hidden px-1">
                        {product.name}
                    </h3>
                </div>

                <div className="w-full mt-auto">
                    {/* Price and Installment info */}
                    <div className="flex flex-col items-center gap-0.5">
                        <div className="flex items-center justify-center gap-2 flex-wrap">
                            {product.original_price > 0 && product.original_price > product.price && (
                                <span className="text-xs text-gray-400 line-through font-medium">{formatPrice(product.original_price)}</span>
                            )}
                            <span className="text-base sm:text-lg font-extrabold text-[#7A3E4A]">{formatPrice(product.price)}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-semibold tracking-wide">{installmentText}</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
