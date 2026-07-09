import { useState, useMemo, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAssetUrl } from '../utils/assets.js'
import { useProducts } from '../hooks/useProducts.js'
import { useCart } from '../hooks/useCart.js'
import { useWishlist } from '../hooks/useWishlist.js'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import ProductCard from '../components/ProductCard.jsx'
import SearchOverlay from '../components/SearchOverlay.jsx'
import QuickViewModal from '../components/QuickViewModal.jsx'
import Notification from '../components/Notification.jsx'

export default function ProductPage() {
    const { id } = useParams()
    const { products, loading } = useProducts()
    const { cartCount, addToCart } = useCart()
    const { wishlistCount, toggleWishlist, isWishlisted } = useWishlist()

    const [selectedSize, setSelectedSize] = useState(null)
    const [selectedCup, setSelectedCup] = useState('B')
    const [quantity, setQuantity] = useState(1)
    const [activeTab, setActiveTab] = useState('description')
    const [searchOpen, setSearchOpen] = useState(false)
    const [quickViewProduct, setQuickViewProduct] = useState(null)
    const [notification, setNotification] = useState({ message: '', visible: false })
    const [reviews, setReviews] = useState([])
    const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' })
    const [reviewSuccess, setReviewSuccess] = useState(false)

    // Synchronize and load reviews from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(`meraki_reviews_${id}`)
        if (stored) {
            setReviews(JSON.parse(stored))
        } else {
            setReviews([
                { id: 1, name: 'Mariana Silva', rating: 5, date: '04/05/2026', comment: 'Renda impecável e caimento perfeito. Muito confortável!', verified: true },
                { id: 2, name: 'Carolina Souza', rating: 5, date: '28/04/2026', comment: 'Lindo demais! Veste super bem e o suporte do bojo é ótimo.', verified: true },
                { id: 3, name: 'Beatriz Costa', rating: 4, date: '15/04/2026', comment: 'Amei a cor e o material. A entrega foi super rápida.', verified: true }
            ])
        }
    }, [id])

    // Find target product
    const product = useMemo(() => {
        if (!products) return null
        return products.find(p => p.id === parseInt(id) || p.id === id)
    }, [products, id])

    // Scroll to top on page load or product ID change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setSelectedSize(null)
        setQuantity(1)
        setErrorMsg('')
    }, [id])

    const [errorMsg, setErrorMsg] = useState('')

    // Fallback/related products
    const relatedProducts = useMemo(() => {
        if (!products || !product) return []
        return products
            .filter(p => p.category === product.category && p.id !== product.id)
            .slice(0, 4)
    }, [products, product])

    if (loading) {
        return (
            <div className="bg-[#FCFAFA] min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-[#7A3E4A] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!product) {
        return (
            <div className="bg-[#FCFAFA] min-h-screen flex flex-col">
                <Header cartCount={cartCount} wishlistCount={wishlistCount} onSearchOpen={() => setSearchOpen(true)} />
                <div className="max-w-7xl mx-auto px-4 py-24 text-center flex-grow">
                    <h2 className="font-heading text-3xl text-gray-900 mb-4">Produto não encontrado</h2>
                    <p className="text-gray-500 mb-8">O produto solicitado não foi localizado em nosso catálogo.</p>
                    <Link to="/" className="bg-[#7A3E4A] !text-white px-8 py-3 rounded-lg uppercase tracking-wider font-bold">
                        Voltar ao Início
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    const formatPrice = (price) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price)
    }

    const handleAddToCart = () => {
        if (sizes.length > 0 && !selectedSize) {
            setErrorMsg('Por favor, selecione um tamanho.')
            return
        }
        setErrorMsg('')
        // Add multiple quantity
        for (let i = 0; i < quantity; i++) {
            addToCart(product, selectedSize)
        }
        setNotification({ message: `${quantity}x ${product.name} adicionado ao carrinho!`, visible: true })
    }

    const handleAddReview = (e) => {
        e.preventDefault()
        if (!newReview.name || !newReview.comment) return
        setReviews([
            {
                id: Date.now(),
                name: newReview.name,
                rating: newReview.rating,
                date: new Date().toLocaleDateString('pt-BR'),
                comment: newReview.comment,
                verified: false
            },
            ...reviews
        ])
        setNewReview({ name: '', rating: 5, comment: '' })
        setReviewSuccess(true)
        setTimeout(() => setReviewSuccess(false), 4000)
    }

    const imageSrc = getAssetUrl(Array.isArray(product.image) ? (product.image[0] || '/placeholder.jpg') : (product.image || '/placeholder.jpg'))
    const altImageSrc = getAssetUrl(Array.isArray(product.image) && product.image[1] ? product.image[1] : imageSrc)
    const sizes = product.sizes ? (typeof product.sizes === 'string' ? product.sizes.split(',').map(s => s.trim()) : product.sizes) : []

    return (
        <div className="bg-[#FCFAFA] min-h-screen flex flex-col font-sans">
            <Header cartCount={cartCount} wishlistCount={wishlistCount} onSearchOpen={() => setSearchOpen(true)} />

            {/* Breadcrumbs */}
            <nav className="max-w-7xl mx-auto px-4 w-full py-4 text-xs text-gray-400">
                <Link to="/" className="hover:text-gray-900 transition-colors">Home</Link>
                <span className="mx-2">/</span>
                <Link to={`/category/${product.category.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(' ', '-')}`} className="hover:text-gray-900 transition-colors">
                    {product.category}
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-700 font-medium">{product.name}</span>
            </nav>

            {/* Main Product Layout */}
            <main className="max-w-7xl mx-auto px-4 py-6 w-full flex-grow">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    {/* Left Column: Side-by-side images resembling the references */}
                    <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-50 border border-gray-100/50 shadow-xs">
                            <img src={imageSrc} alt={product.name} className="w-full h-full object-cover hover:scale-102 transition-transform duration-500" />
                        </div>
                        <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-gray-50 border border-gray-100/50 shadow-xs hidden sm:block">
                            <img src={altImageSrc} alt={`${product.name} modelo`} className="w-full h-full object-cover hover:scale-102 transition-transform duration-500" />
                        </div>
                    </div>

                    {/* Right Column: Order Form */}
                    <div className="lg:col-span-5 flex flex-col">
                        {/* Rating Header */}
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                            <div className="flex text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <span>({reviews.length}) Clique e veja</span>
                            <span className="text-gray-300">|</span>
                            <span>SKU: {1000000 + product.id}</span>
                        </div>

                        {/* Title */}
                        <h1 className="font-heading text-3xl md:text-4xl text-gray-900 leading-tight mb-4">{product.name}</h1>

                        {/* Pricing and payments */}
                        <div className="mb-6 pb-6 border-b border-gray-100">
                            <div className="flex items-baseline gap-3 mb-2">
                                {product.original_price > 0 && product.original_price > product.price && (
                                    <span className="text-base sm:text-lg text-gray-400 line-through font-light">{formatPrice(product.original_price)}</span>
                                )}
                                <span className="text-3xl font-extrabold text-[#7A3E4A]">{formatPrice(product.price)}</span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium">
                                <span className="text-[#D11A6E] font-bold">{formatPrice(product.price * 0.95)}</span> à vista no PIX ou 6x de {formatPrice(product.price / 6)} sem juros no cartão.
                            </p>
                        </div>

                        {/* Mais cores */}
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">Mais Cores:</h4>
                            <div className="flex gap-3">
                                <button className="w-12 h-16 rounded-md border-2 border-[#7A3E4A] overflow-hidden focus:outline-none p-0.5">
                                    <img src={imageSrc} className="w-full h-full object-cover rounded-sm" />
                                </button>
                                {altImageSrc !== imageSrc && (
                                    <button className="w-12 h-16 rounded-md border border-gray-250 hover:border-gray-450 overflow-hidden focus:outline-none p-0.5">
                                        <img src={altImageSrc} className="w-full h-full object-cover rounded-sm opacity-90 hover:opacity-100 transition-opacity" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Stock Banner */}
                        <div className="bg-[#7A3E4A]/10 text-[#4A2028] text-xs px-4 py-3 flex items-center justify-center gap-2 mb-6 w-full text-center rounded-none font-sans">
                            <svg className="w-4 h-4 text-[#7A3E4A] fill-[#7A3E4A] shrink-0" viewBox="0 0 24 24">
                                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
                            </svg>
                            <span>Aproveite! Restam menos de <strong className="font-bold text-[#7A3E4A]">10 unidades</strong></span>
                        </div>

                        {/* Size Selection */}
                        {sizes.length > 0 && (
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Selecione o Tamanho</h4>
                                    {errorMsg && <span className="text-red-500 text-xs font-bold animate-[pulse_1.5s_infinite]">{errorMsg}</span>}
                                </div>
                                <div className="flex flex-wrap gap-2.5">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => {
                                                setSelectedSize(size)
                                                setErrorMsg('')
                                            }}
                                            className={`w-12 h-12 rounded-full border text-xs uppercase font-extrabold flex items-center justify-center transition-all ${selectedSize === size ? 'border-[#7A3E4A] text-[#7A3E4A] border-2 bg-transparent scale-105 shadow-xs' : 'border-gray-300 text-gray-650 hover:border-gray-450 bg-white'}`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Cup Selection (matching the design screenshot "Selecione a taça") */}
                        <div className="mb-8">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Selecione a Taça</h4>
                            <div className="flex gap-2.5">
                                {['A', 'B', 'C'].map(cup => (
                                    <button
                                        key={cup}
                                        onClick={() => setSelectedCup(cup)}
                                        className={`w-10 h-10 rounded-full border text-xs uppercase font-extrabold flex items-center justify-center transition-all ${selectedCup === cup ? 'border-[#7A3E4A] text-[#7A3E4A] border-2 bg-transparent scale-105 shadow-xs' : 'border-gray-300 text-gray-650 hover:border-gray-450 bg-white'}`}
                                    >
                                        {cup}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity and Checkout Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 items-stretch mb-6">
                            {/* Quantity Selector */}
                            <div className="flex items-center justify-between border border-gray-200 bg-white rounded-xl px-4 py-3 sm:w-32 shrink-0">
                                <button 
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    className="text-gray-500 hover:text-gray-900 font-bold px-2 text-lg focus:outline-none"
                                >
                                    -
                                </button>
                                <span className="font-extrabold text-gray-900 w-8 text-center text-sm">{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(q => q + 1)}
                                    className="text-gray-500 hover:text-gray-900 font-bold px-2 text-lg focus:outline-none"
                                >
                                    +
                                </button>
                            </div>

                            {/* Cart Action Button */}
                            <button
                                onClick={handleAddToCart}
                                className="flex-grow bg-[#7A3E4A] hover:bg-[#63303a] text-white py-4 px-8 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                Adicionar à Sacola
                            </button>
                        </div>

                        {/* Wishlist Link Button */}
                        <button
                            onClick={() => toggleWishlist(product.id)}
                            className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 py-2 border-b border-dotted border-gray-200 self-start mb-8 transition-colors"
                        >
                            <svg className={`w-4 h-4 ${isWishlisted(product.id) ? 'text-[#7A3E4A] fill-[#7A3E4A]' : 'text-gray-450'}`} fill={isWishlisted(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Adicionar aos Meus Desejos
                        </button>

                        {/* Tabs: Description / Shipping */}
                        <div className="border-t border-gray-100 pt-6">
                            <div className="flex gap-6 border-b border-gray-100 pb-3 mb-4 text-xs font-bold uppercase tracking-wider">
                                <button
                                    onClick={() => setActiveTab('description')}
                                    className={`pb-3 border-b-2 transition-all ${activeTab === 'description' ? 'border-[#7A3E4A] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Descrição do Produto
                                </button>
                                <button
                                    onClick={() => setActiveTab('shipping')}
                                    className={`pb-3 border-b-2 transition-all ${activeTab === 'shipping' ? 'border-[#7A3E4A] text-gray-900' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
                                >
                                    Trocas e Devoluções
                                </button>
                            </div>

                            <div className="text-xs text-gray-500 leading-relaxed space-y-3 font-light">
                                {activeTab === 'description' ? (
                                    <>
                                        <p>{product.description || 'Design sensual e sofisticado projetado para abraçar suas curvas com naturalidade. Confeccionado em renda francesa de toque macio e acabamento de alta costura.'}</p>
                                        <ul className="list-disc pl-4 space-y-1 mt-2">
                                            <li>Composição: 90% Poliamida, 10% Elastano.</li>
                                            <li>Forro do bojo e entretela de algodão premium.</li>
                                            <li>Alças reguláveis com banho antialérgico de ouro.</li>
                                        </ul>
                                    </>
                                ) : (
                                    <>
                                        <p>Queremos que você ame sua compra! Se por qualquer motivo não ficar satisfeita, a primeira troca é grátis dentro do prazo de 30 dias após o recebimento.</p>
                                        <p>As peças devem ser devolvidas com etiquetas intactas e na embalagem original, sem marcas de uso.</p>
                                    </>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

                {/* Reviews Section */}
                <section className="py-16 mt-16 border-t border-gray-100">
                    <h3 className="font-heading text-2xl text-gray-900 mb-8 text-center">Opiniões de Quem Já Comprou</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Rating Summary */}
                        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs text-center flex flex-col justify-center items-center h-fit">
                            <span className="text-5xl font-extrabold text-gray-900">4.9</span>
                            <div className="flex text-amber-400 my-2">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 font-medium">Recomendado por 99% das compradoras</p>
                        </div>

                        {/* Customer Reviews List */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="space-y-4">
                                {reviews.map(rev => (
                                    <div key={rev.id} className="bg-white p-5 rounded-2xl border border-gray-100/80 shadow-2xs">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-900">{rev.name}</span>
                                                {rev.verified && (
                                                    <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                                        ✓ Compradora verificada
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-gray-400">{rev.date}</span>
                                        </div>
                                        <div className="flex text-amber-400 mb-2">
                                            {Array.from({ length: rev.rating }).map((_, i) => (
                                                <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-600 font-light leading-relaxed">{rev.comment}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Add Review Form */}
                            <form onSubmit={handleAddReview} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-2xs mt-8">
                                <h4 className="font-heading text-lg text-gray-900 mb-4">Deixe sua Opinião</h4>
                                {reviewSuccess && (
                                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-4 py-2.5 rounded-lg mb-4">
                                        Muito obrigado! Sua avaliação foi cadastrada com sucesso.
                                    </div>
                                )}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Seu Nome</label>
                                        <input
                                            type="text"
                                            required
                                            value={newReview.name}
                                            onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                                            className="w-full bg-[#FCFAFA] border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#7A3E4A] text-gray-700"
                                            placeholder="Ex: Amanda Lima"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Avaliação</label>
                                        <select
                                            value={newReview.rating}
                                            onChange={e => setNewReview({ ...newReview, rating: parseInt(e.target.value) })}
                                            className="w-full bg-[#FCFAFA] border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#7A3E4A] text-gray-700"
                                        >
                                            <option value={5}>5 Estrelas (Excelente)</option>
                                            <option value={4}>4 Estrelas (Muito Bom)</option>
                                            <option value={3}>3 Estrelas (Bom)</option>
                                            <option value={2}>2 Estrelas (Regular)</option>
                                            <option value={1}>1 Estrela (Ruim)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Comentário</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={newReview.comment}
                                        onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                                        className="w-full bg-[#FCFAFA] border border-gray-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#7A3E4A] text-gray-700 resize-none"
                                        placeholder="Compartilhe sua experiência com as outras compradoras..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-[#7A3E4A] hover:bg-[#63303a] text-white py-3 px-6 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                                >
                                    Enviar Comentário
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <section className="py-16 border-t border-gray-100">
                        <h3 className="font-heading text-2xl text-gray-900 mb-8 text-center">Quem viu este produto também se interessou</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            {relatedProducts.map(rel => (
                                <ProductCard
                                    key={rel.id}
                                    product={rel}
                                    onQuickView={setQuickViewProduct}
                                    onToggleWishlist={toggleWishlist}
                                    isWishlisted={isWishlisted(rel.id)}
                                />
                            ))}
                        </div>
                    </section>
                )}
            </main>

            <Footer />

            <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
            
            <QuickViewModal
                product={quickViewProduct}
                isOpen={quickViewProduct !== null}
                onClose={() => setQuickViewProduct(null)}
                onAddToCart={addToCart}
                isWishlisted={isWishlisted}
                onToggleWishlist={toggleWishlist}
            />

            <Notification
                message={notification.message}
                visible={notification.visible}
                onClose={() => setNotification({ ...notification, visible: false })}
            />
        </div>
    )
}
