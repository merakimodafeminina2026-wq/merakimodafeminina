import { useState, useCallback, useEffect } from 'react'
import { getAssetUrl } from '../utils/assets.js'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import HeroBanner from '../components/HeroBanner.jsx'
import BenefitsBar from '../components/BenefitsBar.jsx'
import CategoryCard from '../components/CategoryCard.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SearchOverlay from '../components/SearchOverlay.jsx'
import QuickViewModal from '../components/QuickViewModal.jsx'
import ScrollToTop from '../components/ScrollToTop.jsx'
import WhatsAppButton from '../components/WhatsAppButton.jsx'
import Notification from '../components/Notification.jsx'
import PromoModal from '../components/PromoModal.jsx'
import { useProducts } from '../hooks/useProducts.js'
import { useCart } from '../hooks/useCart.js'
import { useWishlist } from '../hooks/useWishlist.js'

export default function HomePage() {
    const navigate = useNavigate()
    const [searchOpen, setSearchOpen] = useState(false)
    const [quickViewProduct, setQuickViewProduct] = useState(null)
    const [notification, setNotification] = useState({ message: '', visible: false })
    const [categories, setCategories] = useState(() => {
        return [
            { name: 'Home', description: 'Voltar para a página inicial', image: '/assets/categories/cat-conjuntos.jpg', link: '/' },
            { name: 'Categorias', description: 'Navegar pelas nossas coleções', image: '/assets/categories/cat-noite.jpg', link: '/category/conjuntos' },
            { name: 'Política de Troca', description: 'Regras e prazos para trocas e devoluções', image: '/assets/categories/cat-sexy.jpg', link: '/returns' },
            { name: 'Ofertas', description: 'Confira nossos produtos com descontos', image: '/assets/categories/cat-plus.jpg', link: '/category/ofertas' },
        ]
    })

    const [promoCombo, setPromoCombo] = useState(() => {
        const stored = localStorage.getItem('meraki_promo_combo')
        if (stored) {
            try { return JSON.parse(stored) } catch (e) { console.error(e) }
        }
        return {
            title: 'Combo Sutiã',
            subtitle: 'Do P ao EG. Diversos modelos para você escolher.',
            image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=800&auto=format&fit=crop&q=80',
            price2Items: 139,
            price3Items: 169,
            link: '/category/promo-combo',
            query: 'sutiã',
            visible: true
        }
    })

    const [editorial, setEditorial] = useState(() => {
        const stored = localStorage.getItem('meraki_editorial')
        if (stored) {
            try { return JSON.parse(stored) } catch (e) { console.error(e) }
        }
        return {
            label: 'Artesanal & Premium',
            title: 'A arte de se sentir extraordinária.',
            description: 'Cada costura, cada detalhe em renda foi pensado para elevar sua confiança e celebrar sua beleza única em todos os momentos.',
            buttonText: 'Ver Manifesto',
            buttonLink: '/story',
            image: '/assets/banners/banner-2.jpg'
        }
    })

    // Auto-generate display texts from numeric price fields
    const promoPrice2 = Number(promoCombo.price2Items) || 139
    const promoPrice3 = Number(promoCombo.price3Items) || 169
    const promoPriceLine1 = `Leve 2 por R$ ${promoPrice2.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
    const promoPriceLine2 = `Leve 3 por R$ ${promoPrice3.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
    const promoBadgeText = `Leve 2 por R$ ${promoPrice2} | 3 por R$ ${promoPrice3}`

    useEffect(() => {
        const updatePromo = () => {
            const stored = localStorage.getItem('meraki_promo_combo')
            if (stored) {
                try { setPromoCombo(JSON.parse(stored)) } catch (e) { console.error(e) }
            }
        }
        const updateEditorial = () => {
            const stored = localStorage.getItem('meraki_editorial')
            if (stored) {
                try { setEditorial(JSON.parse(stored)) } catch (e) { console.error(e) }
            }
        }
        window.addEventListener('storage', updatePromo)
        window.addEventListener('storage', updateEditorial)
        window.addEventListener('promoComboUpdated', updatePromo)
        window.addEventListener('editorialUpdated', updateEditorial)
        return () => {
            window.removeEventListener('storage', updatePromo)
            window.removeEventListener('storage', updateEditorial)
            window.removeEventListener('promoComboUpdated', updatePromo)
            window.removeEventListener('editorialUpdated', updateEditorial)
        }
    }, [])

    useEffect(() => {
        const handleHashScroll = () => {
            const hash = window.location.hash
            if (hash) {
                // Handle router hash structure: can be #/hash or #hash
                const cleanHash = hash.replace('#/', '').replace('#', '')
                const element = document.getElementById(cleanHash)
                if (element) {
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }, 100)
                }
            }
        }
        
        handleHashScroll()
        window.addEventListener('hashchange', handleHashScroll)
        return () => window.removeEventListener('hashchange', handleHashScroll)
    }, [])


    const { products: allProducts, loading: loadingAll } = useProducts()
    
    // Synchronously derive sectioned lists from a single products fetch to prevent redundant async cascades
    const bestSellers = allProducts.filter(p => p.section === 'best-sellers')
    const featured = allProducts.filter(p => p.section === 'featured')
    const newCollection = allProducts.filter(p => p.section === 'new-collection')
    const loadingBest = loadingAll
    const loadingFeatured = loadingAll
    const loadingNew = loadingAll

    const { cartCount, addToCart } = useCart()
    const { wishlistCount, toggleWishlist, isWishlisted } = useWishlist()

    const showNotification = useCallback((message) => {
        setNotification({ message, visible: true })
    }, [])

    const handleAddToCart = useCallback((product, size) => {
        addToCart(product, size)
        setQuickViewProduct(null)
        showNotification('Produto adicionado ao carrinho!')
    }, [addToCart, showNotification])

    function ProductSection({ title, subtitle, products, loading, id }) {
        return (
            <FadeInSection>
                <section className="py-24" id={id}>
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col items-center text-center mb-16 px-4">
                            <span className="text-[#C6A76A] text-[10px] uppercase font-bold tracking-[0.4em] mb-4 block">
                                Exclusividade Meraki
                            </span>
                            <h2 className="font-heading text-4xl md:text-5xl text-[#1A1A1A] mb-6">
                                {title}
                            </h2>
                            <div className="w-12 h-[1px] bg-[#C6A76A] mb-6"></div>
                            <p className="text-gray-500 max-w-lg italic font-light text-lg">{subtitle}</p>
                        </div>
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-[1px] border-[#C6A76A] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 sm:gap-x-8 gap-y-8 sm:gap-y-12">
                                {products.map((product, idx) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true, amount: 0.1 }}
                                        transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.19, 1, 0.22, 1] }}
                                    >
                                        <ProductCard
                                            product={product}
                                            onQuickView={setQuickViewProduct}
                                            onToggleWishlist={toggleWishlist}
                                            isWishlisted={isWishlisted(product.id)}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-400 py-8">Nenhum produto disponível no momento.</p>
                        )}
                    </div>
                </section>
            </FadeInSection>
        )
    }

    const FadeInSection = ({ children, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.19, 1, 0.22, 1], delay }}
        >
            {children}
        </motion.div>
    )

    return (
        <div className="bg-[#FCFAFA]">
            <Header cartCount={cartCount} wishlistCount={wishlistCount} onSearchOpen={() => setSearchOpen(true)} />

            <HeroBanner />

            <FadeInSection delay={0.2}>
                <BenefitsBar />
            </FadeInSection>

            {/* Categories */}
            <FadeInSection>
                <section className="py-24 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex flex-col items-center text-center mb-16 px-4">
                            <span className="text-[#C6A76A] text-[10px] uppercase font-bold tracking-[0.4em] mb-4 block">
                                Nossas Coleções
                            </span>
                            <h2 className="font-heading text-4xl md:text-5xl text-[#1A1A1A] mb-6">
                                Categorias
                            </h2>
                            <div className="w-12 h-[1px] bg-[#C6A76A] mb-6"></div>
                            <p className="text-gray-500 max-w-lg italic font-light text-lg">Curadoria exclusiva das melhores peças para você.</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {categories.map((cat, idx) => (
                                <motion.div
                                    key={cat.name}
                                    id={cat.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(' ', '-')}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1, delay: idx * 0.1, ease: [0.19, 1, 0.22, 1] }}
                                >
                                    <CategoryCard {...cat} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </FadeInSection>

            {/* Combo Section (First Image style) */}
            {promoCombo.visible !== false && (
                <FadeInSection>
                    <section className="py-16 px-4 max-w-7xl mx-auto" id="best-sellers">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            {/* Promo Banner Left Side */}
                            <div className="lg:col-span-6 bg-[#FAF6F3] rounded-3xl p-8 md:p-12 flex flex-col justify-between items-center text-center relative overflow-hidden min-h-[500px]">
                                {/* Product Image top - Elegant framed luxury portrait */}
                                <div className="w-full max-w-[340px] mx-auto overflow-hidden rounded-3xl mb-6 relative shadow-lg bg-gradient-to-tr from-[#F3ECE6] to-[#FCFAF8] p-3 border border-[#E3D7C5]/45 hover:shadow-2xl transition-all duration-500 group/img">
                                    <div className="w-full h-[260px] rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center border border-gray-100/50">
                                        <img 
                                            src={getAssetUrl(promoCombo.image)} 
                                            alt={promoCombo.title} 
                                            className="w-full h-full object-contain hover:scale-108 transition-transform duration-700 p-3"
                                        />
                                    </div>
                                    {/* Subtle decorative gold sparkle corner details */}
                                    <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-[#C6A76A]/40" />
                                    <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-[#C6A76A]/40" />
                                    <div className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-[#C6A76A]/40" />
                                    <div className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-[#C6A76A]/40" />
                                </div>
                                <div className="space-y-4 max-w-md z-10">
                                    <span className="text-[#7A3E4A] text-xs font-bold uppercase tracking-[0.3em] block">{promoCombo.title}</span>
                                    <h3 className="font-heading text-4xl md:text-5xl text-[#7A3E4A] font-light leading-tight">
                                        {promoPriceLine1}<br />
                                        {promoPriceLine2}
                                    </h3>
                                    <p className="text-gray-600 text-sm font-medium pt-2">{promoCombo.subtitle}</p>
                                </div>
                                <Link 
                                    to="/category/promo-combo" 
                                    className="mt-8 px-8 py-4 bg-[#7A3E4A] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[#63303a] transition-all z-10"
                                >
                                    Comprar Agora &gt;
                                </Link>
                            </div>

                            {/* Product Grid Right Side */}
                            <div className="lg:col-span-6 grid grid-cols-2 gap-4 sm:gap-6">
                                {(() => {
                                    const promoProducts = allProducts.filter(p => p.inPromoCombo === true)
                                    const fallbackProducts = allProducts.filter(p => p.name.toLowerCase().includes((promoCombo.query || 'sutiã').toLowerCase()))
                                    
                                    const combined = [...promoProducts]
                                    for (const fallback of fallbackProducts) {
                                        if (combined.length >= 2) break
                                        if (!combined.some(p => p.id === fallback.id)) {
                                            combined.push(fallback)
                                        }
                                    }
                                    const displayProducts = combined.slice(0, 2)
                                    return displayProducts.map(product => {
                                        const isWish = isWishlisted(product.id)
                                        return (
                                            <div 
                                                key={product.id} 
                                                onClick={() => navigate(`/product/${product.id}`)}
                                                className="group bg-white border border-gray-100 rounded-2xl p-3 flex flex-col shadow-xs hover:shadow-md transition-all cursor-pointer relative"
                                            >
                                                <div className="relative w-full h-[220px] sm:h-[260px] lg:h-[350px] rounded-xl overflow-hidden bg-[#F9F9F9] mb-4">
                                                    <img 
                                                        src={getAssetUrl(product.image)} 
                                                        alt={product.name} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                                    />
                                                </div>
                                                    {/* Heart Button */}
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }} 
                                                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xs"
                                                    >
                                                        <svg className={`w-4 h-4 ${isWish ? 'text-primary fill-primary' : 'text-gray-500 hover:text-primary'}`} fill={isWish ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                        </svg>
                                                    </button>
                                                <div className="space-y-3 mt-1">
                                                    <div>
                                                        <span className="inline-block bg-[#FDF0F6] text-[#D11A6E] text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-sm mb-1.5">
                                                            {promoBadgeText}
                                                        </span>
                                                        <div className="flex gap-1 mb-1">
                                                            <span className="w-2.5 h-2.5 rounded-full bg-[#E8DCC4] border border-gray-300"></span>
                                                            <span className="w-2.5 h-2.5 rounded-full bg-[#EAA2A2] border border-gray-300"></span>
                                                            <span className="w-2.5 h-2.5 rounded-full bg-black border border-gray-300"></span>
                                                        </div>
                                                        <h4 className="font-sans text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{product.name}</h4>
                                                    </div>
                                                    <div className="pt-2">
                                                        <p className="text-xs sm:text-sm font-bold text-[#7A3E4A]">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                                                        <p className="text-[10px] text-gray-400">Em até 1x R$ {product.price.toFixed(2).replace('.', ',')} sem juros</p>
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product, 'M'); }}
                                                            className="w-full mt-3 py-2.5 bg-[#7A3E4A] hover:bg-[#63303a] text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                            </svg>
                                                            Comprar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })
                                })()}
                            </div>
                        </div>
                    </section>
                </FadeInSection>
            )}

            {/* Split Banner / Editorial Section */}
            <FadeInSection>
                <section className="py-12 px-4 max-w-7xl mx-auto" id="ofertas">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#FDF8F6] p-8 md:p-16">
                        <div className="space-y-6">
                            <span className="text-[#C6A76A] text-[10px] uppercase font-bold tracking-[0.4em]">{editorial.label}</span>
                            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl text-[#1A1A1A] leading-tight">
                                {editorial.title.includes('extraordinária') ? (
                                    <>A arte de se sentir <span className="italic">extraordinária</span>.</>
                                ) : (
                                    editorial.title
                                )}
                            </h2>
                            <p className="text-gray-600 font-light leading-relaxed max-w-md">{editorial.description}</p>
                            <Link to={editorial.buttonLink} className="inline-block border-b-2 border-[#1A1A1A] pb-2 text-xs font-bold uppercase tracking-widest hover:text-[#C6A76A] hover:border-[#C6A76A] transition-all">{editorial.buttonText}</Link>
                        </div>
                        <div className="relative aspect-square">
                            <img src={getAssetUrl(editorial.image)} className="w-full h-full object-cover shadow-2xl" alt="Manifesto Meraki" />
                        </div>
                    </div>
                </section>
            </FadeInSection>

            {/* Sale / Outlet Carousel (Second Image style) */}
            <FadeInSection>
                <section className="py-16 bg-white border-t border-gray-50" id="sale-outlet">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <span className="text-[#C6A76A] text-[10px] uppercase font-bold tracking-[0.4em] mb-1.5 block">Ofertas Especiais</span>
                                <h2 className="font-heading text-4xl text-[#1A1A1A] tracking-wider font-light">
                                    <span className="font-bold text-[#7A3E4A]">SALE</span> OUTLET
                                </h2>
                            </div>
                            {/* Navigation Arrows */}
                            <div className="flex gap-2">
                                <button className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:border-[#7A3E4A] hover:text-[#7A3E4A] transition-all cursor-pointer">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button className="w-10 h-10 border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:border-[#7A3E4A] hover:text-[#7A3E4A] transition-all cursor-pointer">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>

                        {loadingAll ? (
                            <div className="flex justify-center py-12">
                                <div className="w-8 h-8 border-[1px] border-[#C6A76A] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                                {allProducts.filter(p => p.original_price > 0).slice(0, 4).map(product => {
                                    const isWish = isWishlisted(product.id)
                                    const discountPercent = Math.round(((product.original_price - product.price) / product.original_price) * 100)
                                    return (
                                        <div 
                                            key={product.id}
                                            onClick={() => navigate(`/product/${product.id}`)}
                                            className="group bg-white overflow-hidden transition-all duration-300 hover:shadow-premium relative flex flex-col h-full rounded-2xl border border-gray-100/50 cursor-pointer"
                                        >
                                            {/* Image */}
                                            <div className="relative aspect-[3/4] overflow-hidden bg-[#F9F9F9] rounded-t-2xl">
                                                <img 
                                                    src={getAssetUrl(product.image)} 
                                                    alt={product.name} 
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                                                />
                                                {/* Wishlist Button */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }} 
                                                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xs"
                                                >
                                                    <svg className={`w-4 h-4 ${isWish ? 'text-primary fill-primary' : 'text-gray-500 hover:text-primary'}`} fill={isWish ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                    </svg>
                                                </button>
                                            </div>
                                            {/* Details */}
                                            <div className="p-4 flex flex-col flex-grow justify-between">
                                                <div className="space-y-1.5 mb-3">
                                                    {/* Rating stars */}
                                                    <div className="flex gap-0.5 text-yellow-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                        ))}
                                                        <span className="text-[10px] text-gray-400 font-semibold ml-1">(5)</span>
                                                    </div>
                                                    <h4 className="font-sans text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">{product.name}</h4>
                                                </div>
                                                <div className="w-full mt-auto">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className="text-xs text-gray-400 line-through">R$ {product.original_price.toFixed(2).replace('.', ',')}</span>
                                                        <span className="text-sm sm:text-base font-extrabold text-[#7A3E4A]">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                                                        <span className="bg-[#FEF08A] text-[#854D0E] text-[9px] font-extrabold px-2 py-0.5 rounded-sm uppercase">
                                                            {discountPercent}% OFF
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-gray-400">Em até 2x sem juros</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
            </FadeInSection>

            <ProductSection id="new-collection" title="Novos Horizontes" subtitle="Descubra o frescor da estação em nossa nova coleção." products={newCollection} loading={loadingNew} />

            {/* Newsletter - Editorial Style */}
            <FadeInSection>
                <section className="py-32 bg-white border-t border-[#EEEEEE]">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <span className="text-[#C6A76A] text-[10px] uppercase font-bold tracking-[0.4em] mb-6 block">Concierge & Lifestyle</span>
                        <h2 className="font-heading text-4xl md:text-6xl text-[#1A1A1A] mb-8 px-4">Junte-se ao Universo <span className="italic">Meraki</span>.</h2>
                        <p className="text-[#666666] mb-12 font-light text-lg max-w-xl mx-auto leading-relaxed">Assine nossa newsletter e receba convites para eventos exclusivos, lançamentos antecipados e curadoria de moda íntima.</p>

                        <form className="relative max-w-md mx-auto group" onSubmit={(e) => { e.preventDefault(); showNotification('Bem-vinda ao universo Meraki!') }}>
                            <div className="flex flex-col sm:flex-row items-center border-b border-[#1A1A1A] pb-2 transition-all duration-500 focus-within:border-[#C6A76A]">
                                <input
                                    type="email"
                                    placeholder="SEU MELHOR E-MAIL"
                                    required
                                    className="w-full px-2 py-4 text-[11px] font-bold tracking-[0.2em] outline-none bg-transparent placeholder:text-gray-300"
                                />
                                <button type="submit" className="whitespace-nowrap px-8 py-4 text-[11px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A] hover:text-[#C6A76A] transition-colors">
                                    Inscrever
                                </button>
                            </div>
                        </form>
                    </div>
                </section>
            </FadeInSection>

            <Footer />
            <WhatsAppButton />
            <ScrollToTop />

            <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            <QuickViewModal
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
                onAddToCart={handleAddToCart}
                isWishlisted={quickViewProduct ? isWishlisted(quickViewProduct.id) : false}
                onToggleWishlist={toggleWishlist}
            />
            <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ message: '', visible: false })} />
            <PromoModal onNotification={showNotification} />
        </div>
    )
}
