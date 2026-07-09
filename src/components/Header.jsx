import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth.js'
import { smoothScrollToTop } from '../utils/scroll.js'

const topBarMessages = [
    "✨ Frete Grátis acima de R$ 299 • Parcele em até 12x",
    "Utilize o cupom BEMVIND010 em sua primeira compra!",
    "Ganhe 5% de desconto pagando no PIX!"
]

export default function Header({ cartCount = 0, wishlistCount = 0, onSearchOpen }) {
    const { session, user, profile } = useAuth()
    const [isScrolled, setIsScrolled] = useState(false)
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            if (currentScrollY > 120) {
                setIsScrolled(true)
            } else if (currentScrollY < 40) {
                setIsScrolled(false)
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMessageIndex((prev) => (prev + 1) % topBarMessages.length)
        }, 4000)
        return () => clearInterval(interval)
    }, [])

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [mobileMenuOpen])

    const userName = profile?.full_name || user?.user_metadata?.full_name || ''
    const initials = userName ? userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : ''

    return (
        <header
            className={`sticky top-0 border-0 border-transparent ${
                mobileMenuOpen ? 'z-[9999] bg-white' : 'transition-all duration-500 z-50'
            } ${isScrolled && !mobileMenuOpen ? 'glass shadow-premium' : 'bg-white'}`}
            style={{ borderBottom: 'none', border: 'none', outline: 'none' }}
        >
            {/* Top Bar - Hidden on scroll for focus */}
            <div className={`bg-[#C6A76A] text-white text-center text-[11px] uppercase tracking-[0.15em] py-2 px-4 font-bold antialiased transition-all duration-500 overflow-hidden ${isScrolled ? 'max-h-0 opacity-0' : 'max-h-10 opacity-100'
                }`}>
                <div className="relative h-4 flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={currentMessageIndex}
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -15, opacity: 0 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                            className="absolute whitespace-nowrap"
                        >
                            {topBarMessages[currentMessageIndex]}
                        </motion.span>
                    </AnimatePresence>
                </div>
            </div>

            {/* Main Header Container */}
            <div className="max-w-7xl mx-auto px-4 relative">
                {/* Row 1: Logo, Navigation (Desktop) and Icons */}
                <div className={`flex items-center justify-between transition-all duration-500 ${isScrolled ? 'py-3' : 'py-5'}`}>
                    
                    {/* Hamburger Button (Mobile Only) */}
                    <button 
                        onClick={() => setMobileMenuOpen(true)} 
                        className="md:hidden p-2 -ml-2 text-[#1A1A1A] hover:text-[#7A3E4A] transition-colors cursor-pointer"
                        aria-label="Abrir Menu"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>

                    {/* Logo (Centered on mobile, left on desktop) */}
                    <div className="flex-grow md:flex-grow-0 text-center md:text-left">
                        <Link 
                            to="/" 
                            onClick={() => { smoothScrollToTop(1200); setMobileMenuOpen(false); }}
                            className="font-heading text-2xl md:text-2.5xl lg:text-3xl font-bold tracking-[0.15em] text-[#1A1A1A] hover:text-[#7A3E4A] transition-all duration-500 inline-block animate-logo-breath"
                        >
                            MERAKI
                        </Link>
                    </div>

                    {/* Desktop Navigation Menu (Center on desktop, hidden on mobile) */}
                    <nav className="hidden md:block">
                        <ul className="flex items-center gap-6 lg:gap-8">
                            {['Home', 'Conjuntos', 'Linha Noite', 'Linha Sexy', 'Plus Size', 'Ofertas'].map((item) => (
                                <li key={item}>
                                    <Link
                                        to={item === 'Home' ? '/' : `/category/${item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(' ', '-')}`}
                                        onClick={() => smoothScrollToTop(1200)}
                                        className="relative text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#7A3E4A] transition-all duration-300 group inline-block"
                                    >
                                        {item}
                                        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-[#C6A76A] transition-all duration-500 group-hover:w-full"></span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Icons (Right) */}
                    <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
                        {/* Search */}
                        <button onClick={onSearchOpen} className="group relative p-2 transition-all hover:-translate-y-0.5 cursor-pointer" aria-label="Buscar">
                            <svg className="w-5 h-5 text-[#1A1A1A] group-hover:text-[#7A3E4A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>

                        {/* User / Logged-in indicator (Hidden on mobile) */}
                        <div className="hidden md:block">
                            {session && initials ? (
                                <Link to="/auth" className="group flex items-center gap-3 transition-all hover:-translate-y-0.5" aria-label="Minha Conta">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#4A4A4A] flex items-center justify-center text-white text-[10px] font-bold shadow-premium ring-1 ring-black/5 group-hover:scale-110 transition-all duration-500">
                                        {initials}
                                    </div>
                                    <span className="hidden lg:block text-[11px] font-semibold uppercase tracking-widest text-[#1A1A1A] group-hover:text-[#7A3E4A] transition-colors">
                                        {userName.split(' ')[0]}
                                    </span>
                                </Link>
                            ) : (
                                <Link to="/auth" className="group relative p-2 transition-all hover:-translate-y-0.5" aria-label="Conta">
                                    <svg className="w-5 h-5 text-[#1A1A1A] group-hover:text-[#7A3E4A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </Link>
                            )}
                        </div>

                        {/* Wishlist (Hidden on mobile) */}
                        <div className="hidden md:block">
                            <Link to="/wishlist" className="group relative p-2 transition-all hover:-translate-y-0.5 cursor-pointer inline-block" aria-label="Favoritos">
                                <svg className="w-5 h-5 text-[#1A1A1A] group-hover:text-[#7A3E4A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                {wishlistCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-[#7A3E4A] text-white text-[8px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold">
                                        {wishlistCount}
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* Cart */}
                        <button 
                            onClick={() => window.dispatchEvent(new CustomEvent('toggle-cart', { detail: { open: true } }))}
                            className="group relative p-2 transition-all hover:-translate-y-0.5 cursor-pointer" 
                            aria-label="Carrinho"
                        >
                            <svg className="w-5 h-5 text-[#1A1A1A] group-hover:text-[#7A3E4A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute top-1 right-1 bg-[#7A3E4A] text-white text-[8px] min-w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Drawer (Mobile Only) */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-[9999] md:hidden">
                    {/* Backdrop */}
                    <div 
                        onClick={() => setMobileMenuOpen(false)} 
                        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
                    ></div>
                    
                    {/* Menu Content Drawer */}
                    <div className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col justify-between p-6 z-[9999] animate-slide-right">
                        <div>
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between pb-6 border-b border-gray-100 mb-6">
                                <span className="font-heading text-2xl font-bold tracking-[0.15em] text-[#1A1A1A]">MENU</span>
                                <button 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Menu Links */}
                            <ul className="space-y-4">
                                {['Home', 'Conjuntos', 'Linha Noite', 'Linha Sexy', 'Plus Size', 'Ofertas'].map((item) => (
                                    <li key={item} className="border-b border-gray-50 pb-3">
                                        <Link
                                            to={item === 'Home' ? '/' : `/category/${item.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(' ', '-')}`}
                                            onClick={() => { smoothScrollToTop(1200); setMobileMenuOpen(false); }}
                                            className="text-sm font-semibold uppercase tracking-wider text-gray-800 hover:text-[#7A3E4A] block transition-colors"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Drawer Footer Actions */}
                        <div className="pt-6 border-t border-gray-100 space-y-4">
                            {session ? (
                                <Link 
                                    to="/auth" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1A1A1A] to-[#4A4A4A] flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                                        {initials}
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Minha Conta ({userName.split(' ')[0]})</span>
                                </Link>
                            ) : (
                                <Link 
                                    to="/auth" 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Entrar / Criar Conta</span>
                                </Link>
                            )}

                            <Link 
                                to="/wishlist"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Meus Favoritos</span>
                                </div>
                                {wishlistCount > 0 && (
                                    <span className="bg-[#7A3E4A] text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    )
}
