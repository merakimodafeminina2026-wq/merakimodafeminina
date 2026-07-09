import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../hooks/useCart.js'
import { getAssetUrl } from '../utils/assets.js'

export default function CartDrawer() {
    const [isOpen, setIsOpen] = useState(false)
    const { cart, removeFromCart, updateQuantity, cartCount } = useCart()
    const navigate = useNavigate()

    useEffect(() => {
        const handleToggle = (e) => {
            setIsOpen(e.detail?.open !== undefined ? e.detail.open : !isOpen)
        }
        window.addEventListener('toggle-cart', handleToggle)
        return () => window.removeEventListener('toggle-cart', handleToggle)
    }, [isOpen])

    const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)

    const formatCurrency = (val) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[150] flex justify-end">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-xs animate-[fadeIn_200ms_ease-out]"
                onClick={() => setIsOpen(false)}
            />

            {/* Panel */}
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10 animate-[slideInRight_300ms_cubic-bezier(0.16,1,0.3,1)]">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-heading text-lg font-bold text-[#1A1A1A]">Seu Carrinho</h2>
                        <p className="text-xs text-gray-400 font-light">{cartCount} {cartCount === 1 ? 'item' : 'itens'} adicionados</p>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-400 hover:text-[#1A1A1A] transition-colors rounded-full hover:bg-gray-50"
                        aria-label="Fechar carrinho"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length > 0 ? (
                        cart.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex gap-4 pb-6 border-b border-gray-50 last:border-0">
                                {/* Thumbnail */}
                                <div className="w-20 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                                    <img 
                                        src={item.image ? getAssetUrl(item.image) : getAssetUrl('/assets/placeholder.jpg')} 
                                        alt={item.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = getAssetUrl('/assets/placeholder.jpg') }}
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between gap-2">
                                            <h3 className="font-heading text-sm font-semibold text-[#1A1A1A] line-clamp-1">
                                                {item.name}
                                            </h3>
                                            <button 
                                                onClick={() => removeFromCart(item.id, item.size)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                aria-label="Remover item"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-0.5">Tamanho: <span className="font-bold text-[#1A1A1A] uppercase">{item.size}</span></p>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50/50">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
                                                className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                                            >
                                                -
                                            </button>
                                            <span className="px-3 text-xs font-semibold text-gray-700">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
                                                className="px-2.5 py-1 text-gray-500 hover:bg-gray-100 transition-colors text-sm"
                                            >
                                                +
                                            </button>
                                        </div>
                                        
                                        {/* Price */}
                                        <span className="text-sm font-bold text-[#1A1A1A]">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <h3 className="font-heading text-base font-bold text-gray-700 mb-1">Seu carrinho está vazio</h3>
                            <p className="text-gray-400 text-xs font-light max-w-[200px] mx-auto">Adicione peças da nossa curadoria para iniciar suas compras.</p>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                {cart.length > 0 && (
                    <div className="p-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="text-base font-extrabold text-[#1A1A1A]">{formatCurrency(subtotal)}</span>
                        </div>
                        <p className="text-[11px] text-gray-400 font-light leading-relaxed">Fretamento e descontos aplicados diretamente na etapa de finalização da compra.</p>
                        
                        <button
                            onClick={() => {
                                setIsOpen(false)
                                navigate('/checkout')
                            }}
                            className="w-full py-4 bg-[#7A3E4A] hover:bg-[#63303a] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-md flex items-center justify-center gap-2 hover:scale-[1.01]"
                        >
                            Finalizar Compra
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
