import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { getAssetUrl } from '../utils/assets.js'
import { useProducts } from '../hooks/useProducts.js'
import { createProduct, updateProduct, deleteProduct, uploadMultipleImages, deleteImage } from '../services/database.js'
import { signOut } from '../services/auth.js'

// ─── Icon Component ───────────────────────────────────────────────────────────
function Icon({ path, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        'Pago':      'bg-emerald-50 text-emerald-700 border-emerald-200',
        'Enviado':   'bg-sky-50 text-sky-700 border-sky-200',
        'Entregue':  'bg-[#7A3E4A]/10 text-[#7A3E4A] border-[#7A3E4A]/20',
        'Cancelado': 'bg-red-50 text-red-600 border-red-200',
        'Pendente':  'bg-amber-50 text-amber-700 border-amber-200',
    }
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${map[status] || 'bg-gray-50 text-gray-600 border-gray-200'}`}>
            {status}
        </span>
    )
}

export default function AdminPage() {
    const { session, user, admin, loading: authLoading } = useAuth()
    const { products, loading: productsLoading, setProducts } = useProducts()
    const [activeSection, setActiveSection] = useState('dashboard')
    const [searchQuery, setSearchQuery] = useState('')

    // Modals
    const [modal, setModal] = useState({ open: false, editing: null })
    const [deleteModal, setDeleteModal] = useState({ open: false, product: null })
    const [couponModal, setCouponModal] = useState(false)
    const [bannerModal, setBannerModal] = useState(false)

    const [saving, setSaving] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    // Data lists
    const [orders, setOrders] = useState([])
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [coupons, setCoupons] = useState([])
    const [banners, setBanners] = useState([])
    const [customers, setCustomers] = useState([])
    const [returns, setReturns] = useState([])
    const [selectedReturn, setSelectedReturn] = useState(null)
    const [topbarMessages, setTopbarMessages] = useState([])
    const [newTopbarMsg, setNewTopbarMsg] = useState('')
    const [topbarStyle, setTopbarStyle] = useState(() => {
        try {
            const stored = localStorage.getItem('meraki_topbar_style')
            return stored ? JSON.parse(stored) : { bgColor: '#C6A76A', textColor: '#FFFFFF' }
        } catch { return { bgColor: '#C6A76A', textColor: '#FFFFFF' } }
    })

    const [categories, setCategories] = useState(() => {
        const stored = localStorage.getItem('meraki_categories')
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                return parsed.map(c => typeof c === 'string' ? { name: c, description: 'Coleção Meraki', image: '/placeholder.jpg', group: 'Lingerie' } : c)
            } catch (e) { console.error(e) }
        }
        return [
            { name: 'Conjuntos', group: 'Lingerie', description: 'Sutiãs e calcinhas combinando com caimento perfeito.', image: 'https://images.unsplash.com/photo-1616422285623-13ff0162193c?auto=format&fit=crop&w=400&q=80' },
            { name: 'Calcinhas', group: 'Lingerie', description: 'Modelos confortáveis em renda e microfibra.', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=400&q=80' },
            { name: 'Tanga', group: 'Lingerie', description: 'Sensualidade e conforto para o dia a dia.', image: 'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=400&q=80' },
            { name: 'Body', group: 'Lingerie', description: 'Peças versáteis que modelam e realçam suas curvas.', image: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=400&q=80' },
            
            { name: 'Camisola', group: 'Noite & Especiais', description: 'Leveza e elegância para suas noites.', image: 'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?auto=format&fit=crop&w=400&q=80' },
            { name: 'Baby Doll', group: 'Noite & Especiais', description: 'Frescor e estilo romântico em cetim e renda.', image: 'https://images.unsplash.com/photo-1549064482-6779ba3292fe?auto=format&fit=crop&w=400&q=80' },
            { name: 'Linha Noite', group: 'Noite & Especiais', description: 'Pijamas e robes sofisticados de alta costura.', image: 'https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?auto=format&fit=crop&w=400&q=80' },
            { name: 'Plus Size', group: 'Noite & Especiais', description: 'Modelagens exclusivas que valorizam sua beleza.', image: 'https://images.unsplash.com/photo-1581338834647-b0fb40704e21?auto=format&fit=crop&w=400&q=80' },
            
            { name: 'Personalizáveis', group: 'Destaques', description: 'Peças únicas com gravação personalizada de nomes.', image: 'https://images.unsplash.com/photo-1549439602-43ebcb23281f?auto=format&fit=crop&w=400&q=80' },
            { name: 'Fantasias', group: 'Destaques', description: 'Momentos inesquecíveis com designs temáticos sensuais.', image: 'https://images.unsplash.com/photo-1502301197179-6522b4bce294?auto=format&fit=crop&w=400&q=80' },
            
            { name: 'Sex Shop', group: 'Sensual', description: 'Acessórios e cosméticos para apimentar a relação.', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80' },
            { name: 'Acessórios', group: 'Sensual', description: 'Complementos ideais para compor seu visual íntimo.', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=400&q=80' },
            { name: 'Linha Sexy', group: 'Sensual', description: 'Lingerie provocante com rendas e recortes ousados.', image: 'https://images.unsplash.com/photo-1566207274740-0f8cf6b7d5a5?auto=format&fit=crop&w=400&q=80' }
        ]
    })
    const [newCategoryName, setNewCategoryName] = useState('')
    const [selectedModalCategory, setSelectedModalCategory] = useState('Conjuntos')
    const [selectedModalSizes, setSelectedModalSizes] = useState(['P', 'M', 'G', 'GG'])

    const [sections, setSections] = useState(() => {
        const stored = localStorage.getItem('meraki_sections')
        return stored ? JSON.parse(stored) : [
            { id: 'best-sellers', label: 'Best Sellers' },
            { id: 'featured', label: 'Destaques' },
            { id: 'new-collection', label: 'Novas Coleções' }
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

    const [newSectionLabel, setNewSectionLabel] = useState('')
    const [selectedModalSection, setSelectedModalSection] = useState('best-sellers')

    const [selectedModalColors, setSelectedModalColors] = useState([])
    const [isCustomizable, setIsCustomizable] = useState(false)
    const [customPriceWith, setCustomPriceWith] = useState('')
    const [customPriceWithout, setCustomPriceWithout] = useState('')
    const [customFeeLetter, setCustomFeeLetter] = useState('2.50')
    const [customFeeNumber, setCustomFeeNumber] = useState('2.50')
    const [customFeeEmoji, setCustomFeeEmoji] = useState('3.00')

    // Form inputs
    const [couponForm, setCouponForm] = useState({ code: '', type: 'percentage', value: '', minPurchase: '' })
    const [bannerForm, setBannerForm] = useState({ image: '', alt: '', link: '/shop' })
    const [bannerImageFiles, setBannerImageFiles] = useState([])

    // Product Images states
    const [imageFiles, setImageFiles] = useState([])
    const [existingImages, setExistingImages] = useState([])
    const [dragActive, setDragActive] = useState(false)
    const fileInputRef = useRef(null)

    const seedMockData = () => {
        const mockCoupons = [
            { id: 'cp-1', code: 'MERAKI15', type: 'percentage', value: 15, minPurchase: 150 },
            { id: 'cp-2', code: 'PIX20', type: 'fixed', value: 20, minPurchase: 100 },
            { id: 'cp-3', code: 'OFF5', type: 'percentage', value: 5, minPurchase: 50 }
        ]
        const mockUsers = [
            { id: 'admin-id-123', email: 'admin', password: 'admin', full_name: 'Administradora Meraki', tipo_user: 'admin', phone: '(11) 99999-9999', cpf: '123.456.789-00' },
            { id: 'us-1', full_name: 'Carla Souza', email: 'carla.souza@email.com', phone: '(11) 98888-7777', cpf: '123.456.789-01', tipo_user: 'customer' },
            { id: 'us-2', full_name: 'Marina Lima', email: 'marina.lima@email.com', phone: '(21) 97777-6666', cpf: '987.654.321-02', tipo_user: 'customer' },
            { id: 'us-3', full_name: 'Amanda Oliveira', email: 'amanda.oliveira@email.com', phone: '(31) 96666-5555', cpf: '456.789.123-03', tipo_user: 'customer' }
        ]
        const mockOrders = [
            {
                id: 'ord-982713',
                customerName: 'Carla Souza',
                customerEmail: 'carla.souza@email.com',
                customerPhone: '(11) 98888-7777',
                customerCpf: '123.456.789-01',
                created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
                status: 'Pago',
                items: [
                    { id: 'p-1', name: 'Conjunto Rendado Bella', price: 129.90, quantity: 2, size: 'M', image: [] }
                ],
                subtotal: 259.80,
                shipping: 0,
                discount: 38.97,
                total: 220.83,
                shippingAddress: { street: 'Av. Paulista', number: '1000', complement: 'Apto 12', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', cep: '01310-100' }
            },
            {
                id: 'ord-812731',
                customerName: 'Marina Lima',
                customerEmail: 'marina.lima@email.com',
                customerPhone: '(21) 97777-6666',
                customerCpf: '987.654.321-02',
                created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
                status: 'Enviado',
                items: [
                    { id: 'p-2', name: 'Robe de Seda Satin', price: 189.90, quantity: 1, size: 'G', image: [] }
                ],
                subtotal: 189.90,
                shipping: 15.00,
                discount: 0,
                total: 204.90,
                shippingAddress: { street: 'Rua Copacabana', number: '450', complement: '', neighborhood: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ', cep: '22020-002' }
            },
            {
                id: 'ord-731289',
                customerName: 'Amanda Oliveira',
                customerEmail: 'amanda.oliveira@email.com',
                customerPhone: '(31) 96666-5555',
                customerCpf: '456.789.123-03',
                created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
                status: 'Entregue',
                items: [
                    { id: 'p-3', name: 'Baby Doll Romantic', price: 110.00, quantity: 3, size: 'P', image: [] }
                ],
                subtotal: 330.00,
                shipping: 0,
                discount: 20.00,
                total: 310.00,
                shippingAddress: { street: 'Rua Bahia', number: '200', complement: 'Bloco B', neighborhood: 'Savassi', city: 'Belo Horizonte', state: 'MG', cep: '30190-010' }
            }
        ]

        const mockReturnsCarla = [
            {
                id: 'ret-1002',
                orderId: 'ord-982713',
                itemId: 'p-1',
                type: 'devolução',
                reason: 'Ficou um pouco largo no busto.',
                date: new Date(Date.now() - 3600000 * 1).toISOString(),
                status: 'Autorizado (Aguardando Postagem)',
                postageCode: 'PR583019284BR'
            }
        ]

        const mockReturnsMarina = [
            {
                id: 'ret-1003',
                orderId: 'ord-812731',
                itemId: 'p-2',
                type: 'troca',
                reason: 'Gostaria de trocar pelo tamanho M.',
                date: new Date(Date.now() - 3600000 * 12).toISOString(),
                status: 'Produto Recebido (Em Análise)',
                postageCode: 'PR109382103BR'
            }
        ]

        localStorage.setItem('meraki_coupons', JSON.stringify(mockCoupons))
        localStorage.setItem('meraki_users', JSON.stringify(mockUsers))
        localStorage.setItem('meraki_orders', JSON.stringify(mockOrders))
        localStorage.setItem('meraki_returns_carla.souza@email.com', JSON.stringify(mockReturnsCarla))
        localStorage.setItem('meraki_returns_marina.lima@email.com', JSON.stringify(mockReturnsMarina))

        setCoupons(mockCoupons)
        setCustomers(mockUsers)
        setOrders(mockOrders)
        
        const allReturns = [
            { ...mockReturnsCarla[0], customerEmail: 'carla.souza@email.com' },
            { ...mockReturnsMarina[0], customerEmail: 'marina.lima@email.com' }
        ]
        setReturns(allReturns)
    }

    useEffect(() => {
        let loadedOrders = JSON.parse(localStorage.getItem('meraki_orders') || '[]')
        let loadedCoupons = JSON.parse(localStorage.getItem('meraki_coupons') || '[]')
        let loadedBanners = JSON.parse(localStorage.getItem('meraki_banners') || '[]')
        let loadedCustomers = JSON.parse(localStorage.getItem('meraki_users') || '[]')

        if (loadedOrders.length === 0 && loadedCoupons.length === 0) {
            // Seed immediately
            const mockCoupons = [
                { id: 'cp-1', code: 'MERAKI15', type: 'percentage', value: 15, minPurchase: 150 },
                { id: 'cp-2', code: 'PIX20', type: 'fixed', value: 20, minPurchase: 100 },
                { id: 'cp-3', code: 'OFF5', type: 'percentage', value: 5, minPurchase: 50 }
            ]
            const mockUsers = [
                { id: 'admin-id-123', email: 'admin', password: 'admin', full_name: 'Administradora Meraki', tipo_user: 'admin', phone: '(11) 99999-9999', cpf: '123.456.789-00' },
                { id: 'us-1', full_name: 'Carla Souza', email: 'carla.souza@email.com', phone: '(11) 98888-7777', cpf: '123.456.789-01', tipo_user: 'customer' },
                { id: 'us-2', full_name: 'Marina Lima', email: 'marina.lima@email.com', phone: '(21) 97777-6666', cpf: '987.654.321-02', tipo_user: 'customer' },
                { id: 'us-3', full_name: 'Amanda Oliveira', email: 'amanda.oliveira@email.com', phone: '(31) 96666-5555', cpf: '456.789.123-03', tipo_user: 'customer' }
            ]
            const mockOrders = [
                {
                    id: 'ord-982713',
                    customerName: 'Carla Souza',
                    customerEmail: 'carla.souza@email.com',
                    customerPhone: '(11) 98888-7777',
                    customerCpf: '123.456.789-01',
                    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
                    status: 'Pago',
                    items: [
                        { id: 'p-1', name: 'Conjunto Rendado Bella', price: 129.90, quantity: 2, size: 'M', image: [] }
                    ],
                    subtotal: 259.80,
                    shipping: 0,
                    discount: 38.97,
                    total: 220.83,
                    shippingAddress: { street: 'Av. Paulista', number: '1000', complement: 'Apto 12', neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP', cep: '01310-100' }
                },
                {
                    id: 'ord-812731',
                    customerName: 'Marina Lima',
                    customerEmail: 'marina.lima@email.com',
                    customerPhone: '(21) 97777-6666',
                    customerCpf: '987.654.321-02',
                    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
                    status: 'Enviado',
                    items: [
                        { id: 'p-2', name: 'Robe de Seda Satin', price: 189.90, quantity: 1, size: 'G', image: [] }
                    ],
                    subtotal: 189.90,
                    shipping: 15.00,
                    discount: 0,
                    total: 204.90,
                    shippingAddress: { street: 'Rua Copacabana', number: '450', complement: '', neighborhood: 'Copacabana', city: 'Rio de Janeiro', state: 'RJ', cep: '22020-002' }
                },
                {
                    id: 'ord-731289',
                    customerName: 'Amanda Oliveira',
                    customerEmail: 'amanda.oliveira@email.com',
                    customerPhone: '(31) 96666-5555',
                    customerCpf: '456.789.123-03',
                    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
                    status: 'Entregue',
                    items: [
                        { id: 'p-3', name: 'Baby Doll Romantic', price: 110.00, quantity: 3, size: 'P', image: [] }
                    ],
                    subtotal: 330.00,
                    shipping: 0,
                    discount: 20.00,
                    total: 310.00,
                    shippingAddress: { street: 'Rua Bahia', number: '200', complement: 'Bloco B', neighborhood: 'Savassi', city: 'Belo Horizonte', state: 'MG', cep: '30190-010' }
                }
            ]
            const mockReturnsCarla = [
                {
                    id: 'ret-1002',
                    orderId: 'ord-982713',
                    itemId: 'p-1',
                    type: 'devolução',
                    reason: 'Ficou um pouco largo no busto.',
                    date: new Date(Date.now() - 3600000 * 1).toISOString(),
                    status: 'Autorizado (Aguardando Postagem)',
                    postageCode: 'PR583019284BR'
                }
            ]
            const mockReturnsMarina = [
                {
                    id: 'ret-1003',
                    orderId: 'ord-812731',
                    itemId: 'p-2',
                    type: 'troca',
                    reason: 'Gostaria de trocar pelo tamanho M.',
                    date: new Date(Date.now() - 3600000 * 12).toISOString(),
                    status: 'Produto Recebido (Em Análise)',
                    postageCode: 'PR109382103BR'
                }
            ]

            localStorage.setItem('meraki_coupons', JSON.stringify(mockCoupons))
            localStorage.setItem('meraki_users', JSON.stringify(mockUsers))
            localStorage.setItem('meraki_orders', JSON.stringify(mockOrders))
            localStorage.setItem('meraki_returns_carla.souza@email.com', JSON.stringify(mockReturnsCarla))
            localStorage.setItem('meraki_returns_marina.lima@email.com', JSON.stringify(mockReturnsMarina))

            loadedOrders = mockOrders
            loadedCoupons = mockCoupons
            loadedCustomers = mockUsers
        }

        setOrders(loadedOrders)
        setCoupons(loadedCoupons)
        setBanners(loadedBanners)
        setCustomers(loadedCustomers)

        const storedTopbar = localStorage.getItem('meraki_topbar_messages')
        const loadedTopbar = storedTopbar ? JSON.parse(storedTopbar) : [
            "✨ Frete Grátis acima de R$ 299 • Parcele em até 12x",
            "Utilize o cupom BEMVIND010 em sua primeira compra!",
            "Ganhe 5% de desconto pagando no PIX!"
        ]
        setTopbarMessages(loadedTopbar)

        const loadedReturns = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('meraki_returns_')) {
                const email = key.replace('meraki_returns_', '')
                try {
                    const userReturns = JSON.parse(localStorage.getItem(key) || '[]')
                    userReturns.forEach(ret => { loadedReturns.push({ ...ret, customerEmail: email }) })
                } catch (e) { console.error(e) }
            }
        }
        setReturns(loadedReturns.sort((a, b) => new Date(b.date) - new Date(a.date)))
    }, [activeSection])

    useEffect(() => {
        if (modal.open && modal.editing) {
            const product = products.find(p => p.id === modal.editing)
            const imgs = product?.image || []
            setExistingImages(Array.isArray(imgs) ? imgs : (imgs ? [imgs] : []))
            setImageFiles([])
            setSelectedModalCategory(product?.category || 'Conjuntos')
            setSelectedModalSizes(product?.sizes || [])
            setSelectedModalSection(product?.section || 'best-sellers')
            setSelectedModalColors(product?.colors || [])
            setIsCustomizable(product?.isCustomizable || product?.category?.toLowerCase() === 'personalizaveis' || product?.category?.toLowerCase() === 'personalizáveis' || false)
            setCustomPriceWith(product?.customPriceWith || '')
            setCustomPriceWithout(product?.customPriceWithout || '')
            setCustomFeeLetter(product?.customFeeLetter !== undefined ? String(product.customFeeLetter) : '2.50')
            setCustomFeeNumber(product?.customFeeNumber !== undefined ? String(product.customFeeNumber) : '2.50')
            setCustomFeeEmoji(product?.customFeeEmoji !== undefined ? String(product.customFeeEmoji) : '3.00')
        } else if (modal.open && !modal.editing) {
            setExistingImages([])
            setImageFiles([])
            setSelectedModalCategory(categories[0] || 'Conjuntos')
            setSelectedModalSizes(['P', 'M', 'G', 'GG'])
            setSelectedModalSection(sections[0]?.id || 'best-sellers')
            setSelectedModalColors([])
            setIsCustomizable(false)
            setCustomPriceWith('')
            setCustomPriceWithout('')
            setCustomFeeLetter('2.50')
            setCustomFeeNumber('2.50')
            setCustomFeeEmoji('3.00')
        }
    }, [modal.open, modal.editing, products, categories, sections])

    // ─── Auth Guards ───────────────────────────────────────────────────────────
    if (authLoading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FAF9F5 0%, #F5EEE9 100%)' }}>
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-[#7A3E4A]/20 border-t-[#7A3E4A] animate-spin" />
                <span className="text-xs font-bold text-[#7A3E4A]/60 uppercase tracking-widest">Carregando Painel</span>
            </div>
        </div>
    )

    if (!session || !admin) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6 text-center" style={{ background: 'linear-gradient(135deg, #FAF9F5 0%, #F5EEE9 100%)' }}>
            <div className="w-20 h-20 rounded-2xl bg-[#7A3E4A]/10 flex items-center justify-center">
                <Icon path="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" className="w-8 h-8 text-[#7A3E4A]" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Acesso Restrito</h2>
                <p className="text-gray-500 text-sm max-w-xs">Você precisa estar autenticada como administradora para acessar este painel.</p>
            </div>
            <Link to="/auth" className="px-8 py-3 bg-[#7A3E4A] text-white rounded-xl font-bold text-sm hover:bg-[#63303a] transition-all shadow-lg shadow-[#7A3E4A]/20">
                Fazer Login
            </Link>
        </div>
    )

    // ─── Computed ─────────────────────────────────────────────────────────────
    const filteredProducts = searchQuery
        ? products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.category?.toLowerCase().includes(searchQuery.toLowerCase()))
        : products

    const paidOrders = orders.filter(o => ['Pago', 'Enviado', 'Entregue'].includes(o.status))
    const totalSales = paidOrders.reduce((sum, o) => sum + o.total, 0)
    const ticketMedio = paidOrders.length > 0 ? totalSales / paidOrders.length : 0
    const stats = { sales: totalSales, orders: orders.length, ticket: ticketMedio, customers: customers.length, products: products.length }

    const sectionLabel = (s) => ({ 'best-sellers': 'Best Sellers', 'featured': 'Destaques', 'new-collection': 'Novas Coleções' }[s] || s)
    const getProductImage = (product) => {
        if (Array.isArray(product.image)) return getAssetUrl(product.image[0] || '/placeholder.jpg')
        return getAssetUrl(product.image || '/placeholder.jpg')
    }

    const compressImage = (file) => new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target.result
            img.onload = () => {
                const canvas = document.createElement('canvas')
                const MAX_WIDTH = 1000
                let width = img.width, height = img.height
                if (width > MAX_WIDTH) { height = Math.round((height * MAX_WIDTH) / width); width = MAX_WIDTH }
                canvas.width = width; canvas.height = height
                canvas.getContext('2d').drawImage(img, 0, 0, width, height)
                canvas.toBlob((blob) => {
                    resolve(blob ? new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.webp', { type: 'image/webp', lastModified: Date.now() }) : file)
                }, 'image/webp', 0.8)
            }
            img.onerror = () => resolve(file)
        }
        reader.onerror = () => resolve(file)
    })

    const handleFileSelect = async (files) => {
        const validFiles = Array.from(files).filter(f => f.type.startsWith('image/'))
        const compressed = await Promise.all(validFiles.map(f => compressImage(f)))
        setImageFiles(prev => [...prev, ...compressed])
    }

    const handleStatusChange = (orderId, newStatus) => {
        const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
        setOrders(updated)
        localStorage.setItem('meraki_orders', JSON.stringify(updated))
        if (selectedOrder?.id === orderId) setSelectedOrder(prev => ({ ...prev, status: newStatus }))
    }

    async function handleSave(e) {
        e.preventDefault(); setSaving(true)
        const form = e.target
        let uploadedUrls = []
        if (imageFiles.length > 0) {
            const { urls } = await uploadMultipleImages(imageFiles)
            uploadedUrls = urls
        }
        const allImages = [...existingImages, ...uploadedUrls].filter(Boolean)
        const productData = {
            name: form.pName.value, category: selectedModalCategory,
            price: parseFloat(form.pPrice.value), original_price: parseFloat(form.pOriginalPrice.value) || 0,
            badge: form.pBadge.value, section: selectedModalSection, sizes: selectedModalSizes, image: allImages, description: form.pDescription.value,
            colors: selectedModalColors,
            inPromoCombo: form.pInPromoCombo?.checked || false,
            isCustomizable: isCustomizable || selectedModalCategory?.toLowerCase() === 'personalizaveis' || selectedModalCategory?.toLowerCase() === 'personalizáveis',
            customPriceWith: parseFloat(form.pCustomPriceWith?.value || '0') || 0,
            customPriceWithout: parseFloat(form.pCustomPriceWithout?.value || '0') || 0,
            customFeeLetter: parseFloat(form.pCustomFeeLetter?.value || '2.50') || 2.50,
            customFeeNumber: parseFloat(form.pCustomFeeNumber?.value || '2.50') || 2.50,
            customFeeEmoji: parseFloat(form.pCustomFeeEmoji?.value || '3.00') || 3.00,
        }
        if (modal.editing) {
            const { data, error } = await updateProduct(modal.editing, productData)
            if (!error && data) setProducts(prev => prev.map(p => p.id === modal.editing ? data : p))
        } else {
            const { data, error } = await createProduct(productData)
            if (!error && data) setProducts(prev => [data, ...prev])
        }
        setSaving(false); setModal({ open: false, editing: null })
    }

    async function handleDelete() {
        if (!deleteModal.product) return
        const imgs = deleteModal.product.image
        if (Array.isArray(imgs)) await Promise.all(imgs.map(url => deleteImage(url)))
        await deleteProduct(deleteModal.product.id)
        setProducts(prev => prev.filter(p => p.id !== deleteModal.product.id))
        setDeleteModal({ open: false, product: null })
    }

    const handleCreateCoupon = (e) => {
        e.preventDefault()
        if (!couponForm.code.trim()) return
        const newCoupon = { id: 'cp-' + Date.now(), code: couponForm.code.toUpperCase().trim(), type: couponForm.type, value: parseFloat(couponForm.value) || 0, minPurchase: parseFloat(couponForm.minPurchase) || 0 }
        const updated = [...coupons, newCoupon]
        setCoupons(updated); localStorage.setItem('meraki_coupons', JSON.stringify(updated))
        setCouponForm({ code: '', type: 'percentage', value: '', minPurchase: '' }); setCouponModal(false)
        window.dispatchEvent(new Event('couponsUpdated'))
    }

    const handleDeleteCoupon = (id) => {
        const updated = coupons.filter(c => c.id !== id)
        setCoupons(updated); localStorage.setItem('meraki_coupons', JSON.stringify(updated))
        window.dispatchEvent(new Event('couponsUpdated'))
    }

    const handleCreateBanner = async (e) => {
        e.preventDefault(); setSaving(true)
        let imageUrl = bannerForm.image
        if (bannerImageFiles.length > 0) {
            const { urls } = await uploadMultipleImages(bannerImageFiles)
            if (urls?.[0]) imageUrl = urls[0]
        }
        if (!imageUrl) { alert('Por favor insira um link de imagem ou faça upload de um arquivo.'); setSaving(false); return }
        const newBanner = { id: 'bn-' + Date.now(), image: imageUrl, alt: bannerForm.alt || 'Banner Meraki', link: bannerForm.link || '/shop' }
        const updated = [...banners, newBanner]
        setBanners(updated); localStorage.setItem('meraki_banners', JSON.stringify(updated))
        setBannerForm({ image: '', alt: '', link: '/shop' }); setBannerImageFiles([]); setBannerModal(false); setSaving(false)
        window.dispatchEvent(new Event('bannersUpdated'))
    }

    const handleDeleteBanner = (id) => {
        const updated = banners.filter(b => b.id !== id)
        setBanners(updated); localStorage.setItem('meraki_banners', JSON.stringify(updated))
        window.dispatchEvent(new Event('bannersUpdated'))
    }

    const handleUpdateReturn = (customerEmail, returnId, updatedFields) => {
        const key = `meraki_returns_${customerEmail}`
        const userReturns = JSON.parse(localStorage.getItem(key) || '[]')
        const updated = userReturns.map(ret => ret.id === returnId ? { ...ret, ...updatedFields } : ret)
        localStorage.setItem(key, JSON.stringify(updated))
        setReturns(returns.map(ret => ret.id === returnId && ret.customerEmail === customerEmail ? { ...ret, ...updatedFields } : ret))
        if (selectedReturn?.id === returnId && selectedReturn?.customerEmail === customerEmail)
            setSelectedReturn(prev => ({ ...prev, ...updatedFields }))
    }

    const handleAddTopbarMessage = (e) => {
        e.preventDefault()
        if (!newTopbarMsg.trim()) return
        const updated = [...topbarMessages, newTopbarMsg.trim()]
        setTopbarMessages(updated)
        localStorage.setItem('meraki_topbar_messages', JSON.stringify(updated))
        setNewTopbarMsg('')
        window.dispatchEvent(new Event('topbarMessagesUpdated'))
    }

    const handleDeleteTopbarMessage = (index) => {
        const updated = topbarMessages.filter((_, i) => i !== index)
        setTopbarMessages(updated)
        localStorage.setItem('meraki_topbar_messages', JSON.stringify(updated))
        window.dispatchEvent(new Event('topbarMessagesUpdated'))
    }

    const handleUpdateTopbarMessage = (index, value) => {
        const updated = [...topbarMessages]
        updated[index] = value
        setTopbarMessages(updated)
        localStorage.setItem('meraki_topbar_messages', JSON.stringify(updated))
        window.dispatchEvent(new Event('topbarMessagesUpdated'))
    }

    const adminName = user?.user_metadata?.full_name || 'Admin'
    const adminInitials = adminName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    const menuItems = [
        { id: 'dashboard', label: 'Painel Geral',   icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { id: 'products', label: 'Produtos',         icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
        { id: 'categories', label: 'Categorias',     icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
        { id: 'orders',   label: 'Pedidos',           icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2' },
        { id: 'coupons',  label: 'Cupons',            icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
        { id: 'banners',  label: 'Banners Home',      icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { id: 'promocombo', label: 'Promoção Combo', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { id: 'topbar',   label: 'Faixa Promocional', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
        { id: 'customers',label: 'Clientes',          icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
        { id: 'returns',  label: 'Devoluções',        icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
    ]

    // ─── Shared input styles ──────────────────────────────────────────────────
    const inputCls = "w-full px-4 py-3 bg-[#FAF9F5] border border-[#EEEEEE] rounded-xl text-sm text-gray-800 outline-none focus:border-[#7A3E4A] focus:ring-2 focus:ring-[#7A3E4A]/10 transition-all font-medium placeholder-gray-400"
    const labelCls = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5"

    // ─── Sidebar Nav Item ─────────────────────────────────────────────────────
    const NavItem = ({ item, onClick }) => {
        const active = activeSection === item.id
        return (
            <button
                onClick={onClick || (() => setActiveSection(item.id))}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-xs font-semibold tracking-wide transition-all cursor-pointer group ${active
                    ? 'bg-gradient-to-r from-[#7A3E4A] to-[#9A5060] text-white shadow-md shadow-[#7A3E4A]/25'
                    : 'text-gray-500 hover:bg-[#7A3E4A]/5 hover:text-[#7A3E4A]'
                }`}
            >
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${active ? 'bg-white/20' : 'bg-transparent group-hover:bg-[#7A3E4A]/10'}`}>
                    <Icon path={item.icon} className="w-4 h-4" />
                </span>
                {item.label}
                {active && <span className="ml-auto w-1.5 h-1.5 bg-white/70 rounded-full" />}
            </button>
        )
    }

    // ─── Sidebar Content ──────────────────────────────────────────────────────
    const SidebarContent = ({ onNavClick }) => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-[#EEEEEE]">
                <Link to="/" className="block">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-heading text-xl font-black tracking-[0.25em] text-[#7A3E4A]">MERAKI</span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#C6A76A]">Painel Administrativo</span>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest px-4 mb-3 mt-1">Menu Principal</p>
                {menuItems.map(item => (
                    <NavItem key={item.id} item={item} onClick={onNavClick ? () => { setActiveSection(item.id); onNavClick() } : undefined} />
                ))}

                <div className="pt-4 mt-4 border-t border-[#EEEEEE] space-y-1">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest px-4 mb-3">Atalhos</p>
                    <Link
                        to="/"
                        onClick={onNavClick}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-gray-500 hover:bg-[#7A3E4A]/5 hover:text-[#7A3E4A] transition-all group"
                    >
                        <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-transparent group-hover:bg-[#7A3E4A]/10 transition-all">
                            <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" className="w-4 h-4" />
                        </span>
                        Ver Loja
                    </Link>
                </div>
            </nav>

            {/* User Card */}
            <div className="p-4 border-t border-[#EEEEEE]">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#FAF9F5] mb-2">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7A3E4A] to-[#9A5060] flex items-center justify-center text-white text-xs font-black tracking-wider shrink-0">
                        {adminInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{adminName}</p>
                        <p className="text-[10px] text-[#C6A76A] font-semibold">Administradora</p>
                    </div>
                </div>
                <button
                    onClick={() => signOut()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-all cursor-pointer border border-red-100"
                >
                    <Icon path="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" className="w-4 h-4" />
                    Sair do Painel
                </button>
            </div>
        </div>
    )

    return (
        <div className="flex min-h-screen" style={{ background: '#F7F4F1', fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, -apple-system, sans-serif' }}>

            {/* ─── Sidebar Desktop ─────────────────────────────────────────────── */}
            <aside className="w-64 bg-white border-r border-[#EEEEEE] flex flex-col shrink-0 hidden lg:flex sticky top-0 h-screen overflow-hidden">
                <SidebarContent />
            </aside>

            {/* ─── Mobile Drawer Overlay ───────────────────────────────────────── */}
            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[98] lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside className="fixed inset-y-0 left-0 w-72 bg-white z-[99] flex flex-col lg:hidden shadow-2xl animate-slide-right">
                        <div className="flex items-center justify-between p-5 border-b border-[#EEEEEE]">
                            <span className="font-heading text-lg font-black tracking-[0.25em] text-[#7A3E4A]">MERAKI</span>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
                            >
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <SidebarContent onNavClick={() => setSidebarOpen(false)} />
                        </div>
                    </aside>
                </>
            )}

            {/* ─── Main Content ────────────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">

                {/* Top Header Bar */}
                <header className="bg-white border-b border-[#EEEEEE] px-4 md:px-8 h-16 flex items-center justify-between sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden w-9 h-9 rounded-xl bg-[#FAF9F5] flex items-center justify-center cursor-pointer hover:bg-[#7A3E4A]/10 transition-colors"
                            aria-label="Abrir menu"
                        >
                            <Icon path="M4 6h16M4 12h16M4 18h16" className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-sm font-black text-gray-900 uppercase tracking-wider leading-none">
                                {menuItems.find(i => i.id === activeSection)?.label}
                            </h1>
                            <p className="text-[10px] text-gray-400 font-medium">Meraki Admin</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={seedMockData}
                            className="hidden md:flex items-center gap-1.5 text-xs text-[#C6A76A] hover:text-[#7A3E4A] font-bold transition-colors px-3 py-1.5 rounded-lg bg-[#C6A76A]/10 hover:bg-[#7A3E4A]/5 cursor-pointer border border-[#C6A76A]/20"
                        >
                            <Icon path="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" className="w-4 h-4" />
                            Gerar Dados de Teste
                        </button>
                        <Link
                            to="/"
                            className="hidden md:flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#7A3E4A] font-semibold transition-colors px-3 py-1.5 rounded-lg hover:bg-[#7A3E4A]/5"
                        >
                            <Icon path="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" className="w-4 h-4" />
                            Ver Loja
                        </Link>
                        <div className="flex items-center gap-2">
                            <span className="hidden md:block text-xs font-semibold text-gray-600">{adminName}</span>
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7A3E4A] to-[#9A5060] flex items-center justify-center text-white text-xs font-black tracking-wider shadow-md shadow-[#7A3E4A]/20">
                                {adminInitials}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6">

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* SECTION 1: DASHBOARD */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {activeSection === 'dashboard' && (
                        <div className="space-y-6">
                            {/* Welcome Banner */}
                            <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 bg-white border border-[#EEEEEE] shadow-sm flex items-center justify-between">
                                <div className="relative z-10 space-y-1">
                                    <span className="text-[10px] font-bold text-[#C6A76A] uppercase tracking-[0.2em]">Bem-vinda de volta 👋</span>
                                    <h2 className="text-xl md:text-2xl font-black text-[#7A3E4A] tracking-tight">{adminName}</h2>
                                    <p className="text-xs text-gray-500 font-medium">Aqui está um resumo das métricas e do desempenho do seu negócio hoje.</p>
                                </div>
                                <div className="hidden md:block shrink-0 pr-2">
                                    <div className="w-12 h-12 rounded-xl bg-[#7A3E4A]/5 flex items-center justify-center border border-[#7A3E4A]/10">
                                        <Icon path="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" className="w-5 h-5 text-[#7A3E4A]" />
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {[
                                    {
                                        label: 'Faturamento',
                                        value: totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                                        gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-600', sub: 'Pedidos pagos'
                                    },
                                    {
                                        label: 'Ticket Médio',
                                        value: ticketMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
                                        gradient: 'from-[#7A3E4A] to-[#9A5060]', bg: 'bg-[#7A3E4A]/10', text: 'text-[#7A3E4A]', sub: 'Por venda'
                                    },
                                    {
                                        label: 'Pedidos',
                                        value: stats.orders,
                                        icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
                                        gradient: 'from-sky-500 to-blue-600', bg: 'bg-sky-50', text: 'text-sky-600', sub: 'Total de pedidos'
                                    },
                                    {
                                        label: 'Clientes',
                                        value: stats.customers,
                                        icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z',
                                        gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600', sub: 'Cadastrados'
                                    },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-5 border border-[#EEEEEE] hover:border-[#7A3E4A]/20 hover:shadow-lg hover:shadow-[#7A3E4A]/5 transition-all group">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                                <Icon path={stat.icon} className={`w-5 h-5 ${stat.text}`} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                        <p className="text-xl font-black text-gray-900 leading-none">{stat.value}</p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-1">{stat.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Bottom Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Recent Orders */}
                                <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
                                    <div className="flex items-center justify-between p-5 border-b border-[#EEEEEE]">
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900">Vendas Recentes</h3>
                                            <p className="text-[10px] text-gray-400 font-medium">Últimos pedidos recebidos</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveSection('orders')}
                                            className="text-[10px] font-bold text-[#7A3E4A] hover:text-[#9A5060] uppercase tracking-wider cursor-pointer px-3 py-1.5 rounded-lg hover:bg-[#7A3E4A]/5 transition-all"
                                        >
                                            Ver todos →
                                        </button>
                                    </div>
                                    <div className="divide-y divide-[#F5F5F5]">
                                        {orders.slice(0, 5).map(o => (
                                            <div key={o.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FAF9F5] transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7A3E4A]/10 to-[#C6A76A]/10 flex items-center justify-center text-[10px] font-black text-[#7A3E4A]">
                                                        {o.customerName?.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800 leading-tight">{o.customerName}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium">{new Date(o.created_at).toLocaleDateString('pt-BR')} • {o.items?.length} itens</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-gray-900">{o.total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                    <StatusBadge status={o.status} />
                                                </div>
                                            </div>
                                        ))}
                                        {orders.length === 0 && (
                                            <div className="py-12 text-center">
                                                <Icon path="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                                <p className="text-xs text-gray-400 font-medium">Nenhuma venda ainda</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Catalog Summary */}
                                <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
                                    <div className="flex items-center justify-between p-5 border-b border-[#EEEEEE]">
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900">Resumo do Catálogo</h3>
                                            <p className="text-[10px] text-gray-400 font-medium">Seus produtos ativos</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveSection('products')}
                                            className="text-[10px] font-bold text-[#7A3E4A] hover:text-[#9A5060] uppercase tracking-wider cursor-pointer px-3 py-1.5 rounded-lg hover:bg-[#7A3E4A]/5 transition-all"
                                        >
                                            Gerenciar →
                                        </button>
                                    </div>
                                    <div className="p-5 space-y-4">
                                        <div className="grid grid-cols-3 gap-3">
                                            {[
                                                { label: 'Produtos', value: stats.products },
                                                { label: 'Categorias', value: [...new Set(products.map(p => p.category))].length },
                                                { label: 'Cupons', value: coupons.length },
                                            ].map((item, i) => (
                                                <div key={i} className="p-3 rounded-xl bg-[#FAF9F5] text-center border border-[#EEEEEE]">
                                                    <p className="text-lg font-black text-[#7A3E4A]">{item.value}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Produtos em Destaque</p>
                                            <div className="space-y-2">
                                                {products.slice(0, 4).map(p => (
                                                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF9F5] transition-colors">
                                                        <div className="w-8 h-11 rounded-lg overflow-hidden border border-[#EEEEEE] shrink-0 bg-gray-50">
                                                            <img src={getProductImage(p)} alt="" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                                                            <p className="text-[10px] text-gray-400 font-medium">{p.category}</p>
                                                        </div>
                                                        <span className="text-xs font-black text-[#7A3E4A] shrink-0">R$ {p.price?.toFixed(2)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* SECTION 2: PRODUCTS */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {activeSection === 'products' && (
                        <div className="space-y-5">
                            {/* Section Header */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <Icon path="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Buscar produtos..."
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-[#EEEEEE] rounded-xl text-sm outline-none focus:border-[#7A3E4A] focus:ring-2 focus:ring-[#7A3E4A]/10 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => setModal({ open: true, editing: null })}
                                    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#7A3E4A] to-[#9A5060] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#7A3E4A]/30 transition-all cursor-pointer whitespace-nowrap"
                                >
                                    <Icon path="M12 4v16m8-8H4" className="w-4 h-4" />
                                    Novo Produto
                                </button>
                            </div>

                            {productsLoading ? (
                                <div className="flex justify-center py-16">
                                    <div className="w-10 h-10 rounded-full border-2 border-[#7A3E4A]/20 border-t-[#7A3E4A] animate-spin" />
                                </div>
                            ) : filteredProducts.length > 0 ? (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden md:block bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-[#F5F5F5]">
                                                        {['Produto', 'Categoria', 'Preço', 'Seção', ''].map((h, i) => (
                                                            <th key={i} className={`px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i === 4 ? 'text-right' : ''}`}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#F8F8F8]">
                                                    {filteredProducts.map(p => (
                                                        <tr key={p.id} className="hover:bg-[#FAF9F5] transition-colors group">
                                                            <td className="px-6 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-10 h-14 bg-gray-50 rounded-xl overflow-hidden border border-[#EEEEEE] shrink-0">
                                                                        <img src={getProductImage(p)} alt="" className="w-full h-full object-cover" />
                                                                    </div>
                                                                    <span className="text-sm font-bold text-gray-900">{p.name}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-3 text-xs text-gray-500 font-semibold">{p.category}</td>
                                                            <td className="px-6 py-3">
                                                                <span className="text-sm font-black text-[#7A3E4A]">R$ {p.price?.toFixed(2)}</span>
                                                            </td>
                                                            <td className="px-6 py-3">
                                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#7A3E4A]/10 text-[#7A3E4A]">
                                                                    {sectionLabel(p.section)}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-3 text-right">
                                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => setModal({ open: true, editing: p.id })} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#7A3E4A] hover:bg-[#7A3E4A]/10 rounded-lg transition-colors cursor-pointer">Editar</button>
                                                                    <button onClick={() => setDeleteModal({ open: true, product: p })} className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">Excluir</button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="md:hidden space-y-3">
                                        {filteredProducts.map(p => (
                                            <div key={p.id} className="bg-white rounded-2xl border border-[#EEEEEE] p-4 flex items-center gap-4">
                                                <div className="w-14 h-18 bg-gray-50 rounded-xl overflow-hidden border border-[#EEEEEE] shrink-0">
                                                    <img src={getProductImage(p)} alt="" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium mb-1">{p.category} • {sectionLabel(p.section)}</p>
                                                    <p className="text-base font-black text-[#7A3E4A]">R$ {p.price?.toFixed(2)}</p>
                                                </div>
                                                <div className="flex flex-col gap-2 shrink-0">
                                                    <button onClick={() => setModal({ open: true, editing: p.id })} className="px-3 py-1.5 text-[10px] font-bold bg-[#7A3E4A]/10 text-[#7A3E4A] rounded-lg cursor-pointer">Editar</button>
                                                    <button onClick={() => setDeleteModal({ open: true, product: p })} className="px-3 py-1.5 text-[10px] font-bold bg-red-50 text-red-500 rounded-lg cursor-pointer">Excluir</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white rounded-2xl border border-[#EEEEEE] py-16 text-center">
                                    <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-gray-600 mb-1">Nenhum produto encontrado</p>
                                    <p className="text-xs text-gray-400">Tente ajustar sua busca ou adicione um novo produto.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* SECTION 3: ORDERS */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {activeSection === 'orders' && (
                        <div className="space-y-5">
                            {orders.length > 0 ? (
                                <>
                                    {/* Desktop Table */}
                                    <div className="hidden md:block bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-[#F5F5F5]">
                                                        {['Pedido', 'Cliente', 'Data', 'Total', 'Status', ''].map((h, i) => (
                                                            <th key={i} className={`px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#F8F8F8]">
                                                    {orders.map(order => (
                                                        <tr key={order.id} className="hover:bg-[#FAF9F5] transition-colors">
                                                            <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500">#{order.id?.slice(-6)}</td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-sm font-bold text-gray-800">{order.customerName}</p>
                                                                <p className="text-[10px] text-gray-400">{order.customerEmail}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-xs text-gray-500 font-medium">{new Date(order.created_at).toLocaleDateString('pt-BR')}</td>
                                                            <td className="px-6 py-4 text-sm font-black text-[#7A3E4A]">{order.total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
                                                            <td className="px-6 py-4">
                                                                <select
                                                                    value={order.status}
                                                                    onChange={e => handleStatusChange(order.id, e.target.value)}
                                                                    className="text-[10px] font-bold border rounded-full px-3 py-1.5 outline-none cursor-pointer bg-white transition-all"
                                                                    style={{ borderColor: '#EEEEEE' }}
                                                                >
                                                                    {['Pendente', 'Pago', 'Enviado', 'Entregue', 'Cancelado'].map(s => <option key={s}>{s}</option>)}
                                                                </select>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button onClick={() => setSelectedOrder(order)} className="px-4 py-2 bg-[#7A3E4A]/10 hover:bg-[#7A3E4A] text-[#7A3E4A] hover:text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider">
                                                                    Detalhes
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="md:hidden space-y-3">
                                        {orders.map(order => (
                                            <div key={order.id} className="bg-white rounded-2xl border border-[#EEEEEE] p-4 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{order.customerName}</p>
                                                        <p className="text-[10px] text-gray-400">{order.customerEmail}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">#{order.id?.slice(-6)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-base font-black text-[#7A3E4A]">{order.total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                                        <p className="text-[10px] text-gray-400">{new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-[#F5F5F5]">
                                                    <select
                                                        value={order.status}
                                                        onChange={e => handleStatusChange(order.id, e.target.value)}
                                                        className="text-[10px] font-bold border border-[#EEEEEE] rounded-xl px-3 py-2 outline-none cursor-pointer bg-white"
                                                    >
                                                        {['Pendente', 'Pago', 'Enviado', 'Entregue', 'Cancelado'].map(s => <option key={s}>{s}</option>)}
                                                    </select>
                                                    <button onClick={() => setSelectedOrder(order)} className="px-4 py-2 bg-[#7A3E4A] text-white text-[10px] font-bold rounded-xl cursor-pointer">Ver Detalhes</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white rounded-2xl border border-[#EEEEEE] py-20 text-center">
                                    <Icon path="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-gray-600 mb-1">Nenhum pedido registrado</p>
                                    <p className="text-xs text-gray-400">Os pedidos dos clientes aparecerão aqui.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* SECTION 4: COUPONS */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {activeSection === 'coupons' && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-black text-gray-900">Cupons Ativos</h2>
                                    <p className="text-[10px] text-gray-400 font-medium">{coupons.length} cupom{coupons.length !== 1 ? 's' : ''} cadastrado{coupons.length !== 1 ? 's' : ''}</p>
                                </div>
                                <button onClick={() => setCouponModal(true)} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#7A3E4A] to-[#9A5060] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#7A3E4A]/30 transition-all cursor-pointer">
                                    <Icon path="M12 4v16m8-8H4" className="w-4 h-4" /> Criar Cupom
                                </button>
                            </div>

                            {coupons.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                    {coupons.map(cp => (
                                        <div key={cp.id} className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden hover:border-[#C6A76A]/40 hover:shadow-md transition-all group">
                                            <div className="p-5" style={{ background: 'linear-gradient(135deg, #FAF9F5, #F5EEE9)' }}>
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-[#C6A76A]/15 flex items-center justify-center">
                                                        <Icon path="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" className="w-5 h-5 text-[#C6A76A]" />
                                                    </div>
                                                    <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-[#7A3E4A]/10 text-[#7A3E4A] uppercase tracking-wider">
                                                        {cp.type === 'percentage' ? 'Porcentagem' : 'Fixo'}
                                                    </span>
                                                </div>
                                                <p className="text-lg font-black text-gray-900 tracking-wider uppercase mb-1">{cp.code}</p>
                                                <p className="text-2xl font-black text-[#7A3E4A]">
                                                    {cp.type === 'percentage' ? `${cp.value}%` : `R$ ${cp.value?.toFixed(2)}`}
                                                    <span className="text-xs font-semibold text-gray-400 ml-1">de desconto</span>
                                                </p>
                                            </div>
                                            <div className="px-5 py-3 border-t border-[#EEEEEE] flex items-center justify-between">
                                                <p className="text-[10px] text-gray-400 font-medium">
                                                    Mínimo: <span className="font-bold text-gray-600">R$ {cp.minPurchase?.toFixed(2)}</span>
                                                </p>
                                                <button onClick={() => handleDeleteCoupon(cp.id)} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50 transition-all">
                                                    Remover
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-[#EEEEEE] py-20 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-[#C6A76A]/10 flex items-center justify-center mx-auto mb-4">
                                        <Icon path="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" className="w-7 h-7 text-[#C6A76A]" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-600 mb-1">Nenhum cupom cadastrado</p>
                                    <p className="text-xs text-gray-400">Crie cupons para aumentar suas vendas.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* SECTION 5: BANNERS */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {activeSection === 'banners' && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-sm font-black text-gray-900">Banners do Carrossel</h2>
                                    <p className="text-[10px] text-gray-400 font-medium">{banners.length} banner{banners.length !== 1 ? 's' : ''} ativo{banners.length !== 1 ? 's' : ''}</p>
                                </div>
                                <button onClick={() => setBannerModal(true)} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#7A3E4A] to-[#9A5060] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#7A3E4A]/30 transition-all cursor-pointer">
                                    <Icon path="M12 4v16m8-8H4" className="w-4 h-4" /> Adicionar Banner
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {banners.map(bn => (
                                    <div key={bn.id} className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden hover:border-[#7A3E4A]/20 hover:shadow-lg transition-all group">
                                        <div className="aspect-[16/7] bg-gray-100 overflow-hidden">
                                            <img src={getAssetUrl(bn.image)} alt={bn.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="p-4 space-y-2">
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Alt Text</p>
                                                <p className="text-xs font-semibold text-gray-700 truncate">{bn.alt}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteBanner(bn.id)}
                                                className="w-full mt-2 py-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                            >
                                                Remover Banner
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {banners.length === 0 && (
                                    <div className="col-span-full bg-white rounded-2xl border border-[#EEEEEE] py-20 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-[#7A3E4A]/5 flex items-center justify-center mx-auto mb-4">
                                            <Icon path="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" className="w-7 h-7 text-[#7A3E4A]/40" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-600 mb-1">Nenhum banner personalizado</p>
                                        <p className="text-xs text-gray-400">O site está usando os banners padrão.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* SECTION 5.4: PROMO COMBO CONFIGURATION */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {activeSection === 'promocombo' && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-sm font-black text-gray-900">Promoção de Combos (Home)</h2>
                                <p className="text-[10px] text-gray-400 font-medium font-sans">Configure o banner de promoção destacado na página inicial.</p>
                            </div>

                            <div className="bg-white rounded-2xl border border-[#EEEEEE] p-5">
                                <form 
                                    onSubmit={async (e) => {
                                        e.preventDefault()
                                        const form = e.target
                                        const title = form.promoTitle.value.trim()
                                        const price2Items = parseFloat(form.promoPrice2Items.value) || 139
                                        const price3Items = parseFloat(form.promoPrice3Items.value) || 169
                                        const subtitle = form.promoSubtitle.value.trim()
                                        const query = form.promoQuery.value.trim()
                                        const visible = form.promoVisible.checked
                                        const files = form.promoImage.files

                                        setSaving(true)
                                        let imageUrl = promoCombo.image
                                        if (files?.[0]) {
                                            const compressedFile = await compressImage(files[0])
                                            const { urls } = await uploadMultipleImages([compressedFile])
                                            if (urls?.[0]) imageUrl = urls[0]
                                        }

                                        const updated = {
                                            title,
                                            price2Items,
                                            price3Items,
                                            subtitle,
                                            link: '/category/promo-combo',
                                            query,
                                            image: imageUrl,
                                            visible
                                        }
                                        setPromoCombo(updated)
                                        localStorage.setItem('meraki_promo_combo', JSON.stringify(updated))
                                        window.dispatchEvent(new Event('promoComboUpdated'))
                                        setSaving(false)
                                        alert('Promoção atualizada com sucesso!')
                                    }}
                                    className="space-y-4"
                                >
                                    {/* Toggle visibility */}
                                    <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EEEEEE]">
                                        <label className="flex items-center gap-2.5 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="promoVisible"
                                                defaultChecked={promoCombo.visible !== false}
                                                className="w-4 h-4 text-[#7A3E4A] focus:ring-[#7A3E4A] border-gray-300 rounded cursor-pointer"
                                            />
                                            <span className="text-xs font-bold text-[#7A3E4A] uppercase tracking-wider">Exibir Seção de Combo/Promoção na Home</span>
                                        </label>
                                    </div>

                                    {/* Title + keyword */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Título do Combo</label>
                                            <input type="text" name="promoTitle" defaultValue={promoCombo.title} required className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Palavra-chave de Filtro (Ex: sutiã)</label>
                                            <input type="text" name="promoQuery" defaultValue={promoCombo.query} className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" />
                                        </div>
                                    </div>

                                    {/* Numeric price fields */}
                                    <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EEEEEE] space-y-3">
                                        <p className="text-[10px] font-bold text-[#7A3E4A] uppercase tracking-wider">Preços do Combo — Digite apenas o valor em R$</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Preço do Combo de 2 Peças (R$)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">R$</span>
                                                    <input
                                                        type="number"
                                                        name="promoPrice2Items"
                                                        step="0.01"
                                                        min="0"
                                                        defaultValue={promoCombo.price2Items ?? promoCombo.priceLine1?.match(/\d+/)?.[0] ?? 139}
                                                        required
                                                        className="w-full pl-8 pr-3 py-2 border border-[#EEEEEE] focus:border-[#7A3E4A] focus:ring-2 focus:ring-[#7A3E4A]/10 rounded-xl text-sm font-bold outline-none"
                                                    />
                                                </div>
                                                <p className="text-[9px] text-gray-400 mt-1">Ex: 139 → "Leve 2 por R$ 139"</p>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Preço do Combo de 3 Peças (R$)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">R$</span>
                                                    <input
                                                        type="number"
                                                        name="promoPrice3Items"
                                                        step="0.01"
                                                        min="0"
                                                        defaultValue={promoCombo.price3Items ?? promoCombo.priceLine2?.match(/\d+/)?.[0] ?? 169}
                                                        required
                                                        className="w-full pl-8 pr-3 py-2 border border-[#EEEEEE] focus:border-[#7A3E4A] focus:ring-2 focus:ring-[#7A3E4A]/10 rounded-xl text-sm font-bold outline-none"
                                                    />
                                                </div>
                                                <p className="text-[9px] text-gray-400 mt-1">Ex: 169 → "Leve 3 por R$ 169"</p>
                                            </div>
                                        </div>
                                        {/* Live preview badge */}
                                        <div className="mt-1 px-3 py-2 bg-white rounded-lg border border-[#EEEEEE] text-[10px] text-gray-500 font-semibold">
                                            Selo gerado automaticamente: <span className="font-black text-[#7A3E4A]">"Leve 2 por R$ {promoCombo.price2Items ?? 139} | 3 por R$ {promoCombo.price3Items ?? 169}"</span>
                                        </div>
                                    </div>


                                    {/* Subtitle + image */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Descrição / Subtítulo</label>
                                            <input type="text" name="promoSubtitle" defaultValue={promoCombo.subtitle} required className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Upload de Imagem <span className="text-[9px] text-[#C6A76A] lowercase font-normal">(Recomendado: 800x600px - Proporção 4:3)</span></label>
                                            <input type="file" name="promoImage" accept="image/*" className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#7A3E4A]/10 file:text-[#7A3E4A] hover:file:bg-[#7A3E4A]/20 cursor-pointer" />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-2">
                                        {promoCombo.image && (
                                            <div className="w-24 h-18 rounded-lg overflow-hidden border border-[#EEEEEE]">
                                                <img src={getAssetUrl(promoCombo.image)} alt="Preview" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                        <button type="submit" disabled={saving} className="px-5 py-3 bg-[#7A3E4A] hover:bg-[#603039] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 self-end">
                                            {saving ? 'Salvar Alterações' : 'Salvar Alterações'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* SECTION 5.5: CATEGORIES MANAGEMENT */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {activeSection === 'categories' && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-sm font-black text-gray-900">Categorias da Loja</h2>
                                <p className="text-[10px] text-gray-400 font-medium">{categories.length} categoria{categories.length !== 1 ? 's' : ''} cadastrada{categories.length !== 1 ? 's' : ''}</p>
                            </div>

                            {/* Create Category Form */}
                            <div className="bg-white rounded-2xl border border-[#EEEEEE] p-5">
                                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">Nova Categoria</h3>
                                <form 
                                    onSubmit={async (e) => {
                                        e.preventDefault()
                                        const form = e.target
                                        const name = form.catName.value.trim()
                                        const group = form.catGroup.value
                                        const description = form.catDescription.value.trim()
                                        const files = form.catImage.files
                                        
                                        if (!name) return
                                        setSaving(true)
                                        
                                        let imageUrl = '/placeholder.jpg'
                                        if (files?.[0]) {
                                            const compressedFile = await compressImage(files[0])
                                            const { urls } = await uploadMultipleImages([compressedFile])
                                            if (urls?.[0]) imageUrl = urls[0]
                                        }

                                        const newCatObj = { name, group, description, image: imageUrl }
                                        const updated = [...categories, newCatObj]
                                        setCategories(updated)
                                        localStorage.setItem('meraki_categories', JSON.stringify(updated))
                                        window.dispatchEvent(new Event('categoriesUpdated'))
                                        form.reset()
                                        setSaving(false)
                                    }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Nome da Categoria</label>
                                            <input type="text" name="catName" required placeholder="Ex: Lingerie Luxo" className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Grupo do Mega Menu</label>
                                            <select name="catGroup" className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none bg-white">
                                                <option value="Lingerie">Lingerie</option>
                                                <option value="Noite & Especiais">Noite & Especiais</option>
                                                <option value="Destaques">Destaques</option>
                                                <option value="Sensual">Sensual</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Imagem de Capa (Home & Menu) <span className="text-[9px] text-[#C6A76A] lowercase font-normal">(Recomendado: 800x600px - Proporção 4:3)</span></label>
                                            <input type="file" name="catImage" accept="image/*" className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#7A3E4A]/10 file:text-[#7A3E4A] hover:file:bg-[#7A3E4A]/20 cursor-pointer" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Descrição (Exibida ao passar o mouse)</label>
                                        <input type="text" name="catDescription" placeholder="Breve descrição da categoria..." className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" />
                                    </div>
                                    <button type="submit" disabled={saving} className="px-5 py-3 bg-[#7A3E4A] hover:bg-[#603039] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50">
                                        {saving ? 'Cadastrando...' : 'Cadastrar Categoria'}
                                    </button>
                                </form>
                            </div>

                            {/* Categories Grid List */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                {categories.map((cat, idx) => {
                                    const name = typeof cat === 'object' ? cat.name : cat
                                    const image = typeof cat === 'object' ? cat.image : '/placeholder.jpg'
                                    const desc = typeof cat === 'object' ? cat.description : 'Coleção Meraki'
                                    const group = typeof cat === 'object' ? cat.group : 'Lingerie'

                                    return (
                                        <div key={idx} className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden hover:border-[#7A3E4A]/20 hover:shadow-lg transition-all flex flex-col justify-between">
                                            <div className="aspect-[4/3] bg-gray-100 relative">
                                                <img src={getAssetUrl(image)} alt={name} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-between p-4">
                                                    <span className="bg-[#C6A76A] text-white text-[8px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider self-start">{group}</span>
                                                    <span className="text-white text-sm font-bold">{name}</span>
                                                </div>
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <p className="text-xs text-gray-500 font-light line-clamp-2">{desc}</p>
                                                <button
                                                    onClick={() => {
                                                        const updated = categories.filter((_, i) => i !== idx)
                                                        setCategories(updated)
                                                        localStorage.setItem('meraki_categories', JSON.stringify(updated))
                                                        window.dispatchEvent(new Event('categoriesUpdated'))
                                                    }}
                                                    className="w-full py-2 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                                >
                                                    Remover Categoria
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* SECTION 6: CUSTOMERS */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {activeSection === 'customers' && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-sm font-black text-gray-900">Clientes Cadastrados</h2>
                                <p className="text-[10px] text-gray-400 font-medium">{customers.length} cliente{customers.length !== 1 ? 's' : ''} registrado{customers.length !== 1 ? 's' : ''}</p>
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden md:block bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-[#F5F5F5]">
                                                {['Cliente', 'E-mail', 'Telefone', 'CPF', 'Função'].map((h, i) => (
                                                    <th key={i} className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#F8F8F8]">
                                            {customers.map(c => (
                                                <tr key={c.id || c.email} className="hover:bg-[#FAF9F5] transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7A3E4A]/10 to-[#C6A76A]/10 flex items-center justify-center text-[10px] font-black text-[#7A3E4A] shrink-0">
                                                                {c.full_name?.charAt(0) || '?'}
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-900">{c.full_name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-gray-500 font-semibold">{c.email}</td>
                                                    <td className="px-6 py-4 text-xs text-gray-500">{c.phone || '—'}</td>
                                                    <td className="px-6 py-4 text-xs text-gray-500 font-mono">{c.cpf || '—'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${c.tipo_user === 'admin' ? 'bg-[#7A3E4A]/10 text-[#7A3E4A]' : 'bg-gray-100 text-gray-500'}`}>
                                                            {c.tipo_user || 'cliente'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-3">
                                {customers.map(c => (
                                    <div key={c.id || c.email} className="bg-white rounded-2xl border border-[#EEEEEE] p-4 flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7A3E4A]/10 to-[#C6A76A]/10 flex items-center justify-center text-sm font-black text-[#7A3E4A] shrink-0">
                                            {c.full_name?.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <p className="text-sm font-bold text-gray-900 truncate">{c.full_name}</p>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${c.tipo_user === 'admin' ? 'bg-[#7A3E4A]/10 text-[#7A3E4A]' : 'bg-gray-100 text-gray-500'}`}>
                                                    {c.tipo_user || 'cliente'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-gray-400 truncate">{c.email}</p>
                                            <p className="text-[10px] text-gray-400">{c.phone || '—'} • CPF: {c.cpf || '—'}</p>
                                        </div>
                                    </div>
                                ))}
                                {customers.length === 0 && (
                                    <div className="bg-white rounded-2xl border border-[#EEEEEE] py-12 text-center">
                                        <p className="text-xs text-gray-400">Nenhum cliente cadastrado ainda.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* SECTION 7: RETURNS */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {activeSection === 'returns' && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-sm font-black text-gray-900">Trocas & Devoluções</h2>
                                <p className="text-[10px] text-gray-400 font-medium">{returns.length} solicitaç{returns.length !== 1 ? 'ões' : 'ão'} recebida{returns.length !== 1 ? 's' : ''}</p>
                            </div>

                            {returns.length > 0 ? (
                                <>
                                    {/* Desktop */}
                                    <div className="hidden md:block bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-[#F5F5F5]">
                                                        {['Data', 'Cliente', 'Pedido/Item', 'Tipo', 'Código Postagem', 'Status', ''].map((h, i) => (
                                                            <th key={i} className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-[#F8F8F8]">
                                                    {returns.map(ret => (
                                                        <tr key={ret.id} className="hover:bg-[#FAF9F5] transition-colors">
                                                            <td className="px-6 py-4 text-xs text-gray-500 font-medium">{new Date(ret.date).toLocaleDateString('pt-BR')}</td>
                                                            <td className="px-6 py-4 text-xs font-bold text-gray-800">{ret.customerEmail}</td>
                                                            <td className="px-6 py-4">
                                                                <p className="text-xs font-semibold text-gray-700">{ret.orderId}</p>
                                                                <p className="text-[10px] text-gray-400">{ret.itemId}</p>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold border ${ret.type === 'devolução' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-sky-50 text-sky-600 border-sky-200'}`}>
                                                                    {ret.type}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-xs font-mono font-bold text-gray-700">{ret.postageCode || '—'}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold ${ret.status?.startsWith('Autorizado') ? 'bg-amber-50 text-amber-700' : ret.status?.startsWith('Concluído') ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                                    {ret.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <button onClick={() => setSelectedReturn(ret)} className="px-4 py-2 bg-[#7A3E4A]/10 hover:bg-[#7A3E4A] text-[#7A3E4A] hover:text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider">
                                                                    Gerenciar
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Mobile Cards */}
                                    <div className="md:hidden space-y-3">
                                        {returns.map(ret => (
                                            <div key={ret.id} className="bg-white rounded-2xl border border-[#EEEEEE] p-4 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800">{ret.customerEmail}</p>
                                                        <p className="text-[10px] text-gray-400">{new Date(ret.date).toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold border ${ret.type === 'devolução' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-sky-50 text-sky-600 border-sky-200'}`}>
                                                        {ret.type}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 border-t border-[#F5F5F5]">
                                                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${ret.status?.startsWith('Autorizado') ? 'bg-amber-50 text-amber-700' : ret.status?.startsWith('Concluído') ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                        {ret.status}
                                                    </span>
                                                    <button onClick={() => setSelectedReturn(ret)} className="px-4 py-2 bg-[#7A3E4A] text-white text-[10px] font-bold rounded-xl cursor-pointer">Gerenciar</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white rounded-2xl border border-[#EEEEEE] py-20 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-[#7A3E4A]/5 flex items-center justify-center mx-auto mb-4">
                                        <Icon path="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" className="w-7 h-7 text-[#7A3E4A]/40" />
                                    </div>
                                    <p className="text-sm font-bold text-gray-600 mb-1">Nenhuma solicitação recebida</p>
                                    <p className="text-xs text-gray-400">Trocas e devoluções dos clientes aparecerão aqui.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════════════════════ */}
                    {/* SECTION 8: FAIXA PROMOCIONAL (TOPBAR MESSAGES) */}
                    {/* ═══════════════════════════════════════════════════════════ */}
                    {activeSection === 'topbar' && (
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EEEEEE]">
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">Frases Rotativas do Topo</h3>
                                    <p className="text-xs text-gray-400">Configure as mensagens promocionais que aparecem na barra no topo do site.</p>
                                </div>
                            </div>

                            {/* Color Pickers */}
                            <div className="bg-white p-6 rounded-2xl border border-[#EEEEEE] space-y-4">
                                <h4 className="text-[10px] font-bold text-[#7A3E4A] uppercase tracking-widest">Cores da Faixa</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 mb-2 uppercase tracking-wider">Cor de Fundo</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={topbarStyle.bgColor}
                                                onChange={(e) => {
                                                    const updated = { ...topbarStyle, bgColor: e.target.value }
                                                    setTopbarStyle(updated)
                                                    localStorage.setItem('meraki_topbar_style', JSON.stringify(updated))
                                                    window.dispatchEvent(new Event('topbarStyleUpdated'))
                                                }}
                                                className="w-10 h-10 rounded-lg border border-[#EEEEEE] cursor-pointer p-0.5 bg-white"
                                            />
                                            <span className="text-xs font-mono text-gray-500">{topbarStyle.bgColor}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 mb-2 uppercase tracking-wider">Cor das Letras</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="color"
                                                value={topbarStyle.textColor}
                                                onChange={(e) => {
                                                    const updated = { ...topbarStyle, textColor: e.target.value }
                                                    setTopbarStyle(updated)
                                                    localStorage.setItem('meraki_topbar_style', JSON.stringify(updated))
                                                    window.dispatchEvent(new Event('topbarStyleUpdated'))
                                                }}
                                                className="w-10 h-10 rounded-lg border border-[#EEEEEE] cursor-pointer p-0.5 bg-white"
                                            />
                                            <span className="text-xs font-mono text-gray-500">{topbarStyle.textColor}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Live Preview */}
                                <div
                                    className="w-full rounded-xl py-2.5 px-4 text-center text-[11px] font-bold uppercase tracking-[0.15em] transition-all"
                                    style={{ background: topbarStyle.bgColor, color: topbarStyle.textColor }}
                                >
                                    {topbarMessages[0] || 'Pré-visualização da Faixa Promocional'}
                                </div>
                                <div className="flex gap-2 pt-1">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const reset = { bgColor: '#C6A76A', textColor: '#FFFFFF' }
                                            setTopbarStyle(reset)
                                            localStorage.setItem('meraki_topbar_style', JSON.stringify(reset))
                                            window.dispatchEvent(new Event('topbarStyleUpdated'))
                                        }}
                                        className="text-[10px] font-bold text-gray-400 hover:text-[#7A3E4A] px-3 py-1.5 rounded-lg hover:bg-[#FAF9F5] transition-all cursor-pointer border border-[#EEEEEE]"
                                    >
                                        Restaurar Padrão
                                    </button>
                                </div>
                            </div>

                            {/* Add message form */}
                            <form onSubmit={handleAddTopbarMessage} className="bg-white p-6 rounded-2xl border border-[#EEEEEE] space-y-4">
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Adicionar Nova Frase</h4>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={newTopbarMsg}
                                        onChange={(e) => setNewTopbarMsg(e.target.value)}
                                        placeholder="Ex: ✨ Desconto de 10% na primeira compra com o cupom MERAKI10!"
                                        className={inputCls}
                                        maxLength={100}
                                    />
                                    <button
                                        type="submit"
                                        className="px-6 bg-[#7A3E4A] hover:bg-[#5A2E34] text-white text-xs font-bold rounded-xl shrink-0 transition-colors uppercase tracking-wider cursor-pointer"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </form>

                            {/* Messages list */}
                            <div className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
                                <div className="p-6 border-b border-[#EEEEEE]">
                                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Frases Ativas ({topbarMessages.length})</h4>
                                </div>
                                {topbarMessages.length > 0 ? (
                                    <div className="divide-y divide-[#EEEEEE]">
                                        {topbarMessages.map((msg, index) => (
                                            <div key={index} className="p-4 flex items-center justify-between gap-4 hover:bg-[#FAF9F5] transition-colors">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        value={msg}
                                                        onChange={(e) => handleUpdateTopbarMessage(index, e.target.value)}
                                                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-[#7A3E4A] focus:outline-none text-sm text-gray-700 font-medium py-1"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteTopbarMessage(index)}
                                                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-500 hover:text-red-700 cursor-pointer transition-colors"
                                                    title="Excluir frase"
                                                >
                                                    <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-12 text-center text-gray-400">
                                        Nenhuma frase cadastrada. A barra de anúncios ficará oculta no site.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* MODAL: ORDER DETAILS */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {selectedOrder && (
                <>
                    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[95] bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-[#EEEEEE]">
                            <div>
                                <h2 className="text-sm font-black text-gray-900">Detalhes do Pedido</h2>
                                <p className="text-[10px] text-gray-400 font-mono">#{selectedOrder.id?.slice(-8)}</p>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-[#FAF9F5] rounded-xl space-y-1">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Cliente</p>
                                    <p className="text-sm font-bold text-gray-900">{selectedOrder.customerName}</p>
                                    <p className="text-xs text-gray-500">{selectedOrder.customerEmail}</p>
                                    <p className="text-xs text-gray-500">{selectedOrder.customerPhone}</p>
                                    <p className="text-xs text-gray-500">CPF: {selectedOrder.customerCpf}</p>
                                </div>
                                <div className="p-4 bg-[#FAF9F5] rounded-xl space-y-1">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Endereço</p>
                                    <p className="text-xs text-gray-700 leading-relaxed">
                                        {selectedOrder.shippingAddress?.street}, {selectedOrder.shippingAddress?.number}<br />
                                        {selectedOrder.shippingAddress?.neighborhood} — {selectedOrder.shippingAddress?.city}/{selectedOrder.shippingAddress?.state}<br />
                                        CEP: {selectedOrder.shippingAddress?.cep}
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Itens Comprados</p>
                                <div className="border border-[#EEEEEE] rounded-xl overflow-hidden divide-y divide-[#F5F5F5]">
                                    {selectedOrder.items?.map(item => (
                                        <div key={`${item.id}-${item.size}`} className="flex items-center gap-3 p-3">
                                            <div className="w-9 h-12 bg-gray-50 rounded-lg overflow-hidden border border-[#EEEEEE] shrink-0">
                                                <img src={getProductImage(item)} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-gray-800 truncate">{item.name}</p>
                                                <p className="text-[10px] text-gray-400">Tam: {item.size} • Qtd: {item.quantity}</p>
                                            </div>
                                            <p className="text-xs font-black text-gray-900">{(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2 border-t border-[#EEEEEE]">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Alterar Status</p>
                                    <select
                                        value={selectedOrder.status}
                                        onChange={e => handleStatusChange(selectedOrder.id, e.target.value)}
                                        className="px-4 py-2.5 bg-white border border-[#EEEEEE] rounded-xl text-xs font-bold outline-none focus:border-[#7A3E4A] cursor-pointer"
                                    >
                                        {['Pendente', 'Pago', 'Enviado', 'Entregue', 'Cancelado'].map(s => <option key={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1 text-right">
                                    {[
                                        { label: 'Subtotal', value: selectedOrder.subtotal?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), cls: 'text-gray-500' },
                                        { label: 'Frete', value: selectedOrder.shipping === 0 ? 'Grátis' : selectedOrder.shipping?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), cls: 'text-gray-500' },
                                        ...(selectedOrder.discount > 0 ? [{ label: 'Desconto', value: `-${selectedOrder.discount?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, cls: 'text-emerald-600 font-black' }] : []),
                                        { label: 'Total', value: selectedOrder.total?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), cls: 'text-[#7A3E4A] font-black text-base border-t border-dashed border-[#EEEEEE] pt-1' },
                                    ].map((row, i) => (
                                        <div key={i} className={`flex justify-end gap-6 text-xs font-semibold ${row.cls}`}>
                                            <span>{row.label}:</span><span>{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* MODAL: DELETE PRODUCT */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {deleteModal.open && (
                <>
                    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" onClick={() => setDeleteModal({ open: false, product: null })} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-[calc(100%-2rem)] space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mx-auto">
                            <Icon path="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="text-center">
                            <h2 className="text-sm font-black text-gray-900 mb-1">Excluir Produto?</h2>
                            <p className="text-xs text-gray-500 leading-relaxed">Você tem certeza que deseja excluir <strong>"{deleteModal.product?.name}"</strong>? Esta ação não pode ser desfeita.</p>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteModal({ open: false, product: null })} className="flex-1 py-3 border border-[#EEEEEE] text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">Cancelar</button>
                            <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer">Excluir</button>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* MODAL: CREATE/EDIT PRODUCT */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {modal.open && (() => {
                const editingProduct = modal.editing ? products.find(p => p.id === modal.editing) : null
                return (
                    <>
                        <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" onClick={() => setModal({ open: false, editing: null })} />
                        <div className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-[95] bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b border-[#EEEEEE] sticky top-0 bg-white z-10">
                                <h2 className="text-sm font-black text-gray-900">{modal.editing ? 'Editar Produto' : 'Novo Produto'}</h2>
                                <button onClick={() => setModal({ open: false, editing: null })} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
                                    <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                            <form onSubmit={handleSave} className="p-6 space-y-4">
                                <div>
                                    <label className={labelCls}>Nome do Produto</label>
                                    <input type="text" name="pName" required defaultValue={editingProduct?.name || ''} className={inputCls} />
                                </div>
                                
                                <div>
                                    <label className={labelCls}>Categoria</label>
                                    <div className="flex flex-wrap gap-1.5 mb-2 bg-[#FAF9F5] p-3 rounded-xl border border-[#EEEEEE]">
                                        {categories.map(cat => {
                                            const catName = typeof cat === 'object' ? cat.name : cat
                                            return (
                                                <button
                                                    key={catName}
                                                    type="button"
                                                    onClick={() => setSelectedModalCategory(catName)}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                        selectedModalCategory === catName
                                                            ? 'bg-[#7A3E4A] text-white border-[#7A3E4A] shadow-xs'
                                                            : 'bg-white text-gray-500 border-[#EEEEEE] hover:bg-gray-150'
                                                    }`}
                                                >
                                                    {catName}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <div className="flex gap-2 max-w-xs">
                                        <input
                                            type="text"
                                            value={newCategoryName}
                                            onChange={e => setNewCategoryName(e.target.value)}
                                            placeholder="Nova categoria..."
                                            className="flex-1 px-3 py-2 text-xs bg-[#FAF9F5] border border-[#EEEEEE] rounded-xl outline-none focus:border-[#7A3E4A] font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const name = newCategoryName.trim();
                                                if (name && !categories.some(c => (typeof c === 'object' ? c.name : c) === name)) {
                                                    const updated = [...categories, { name, description: 'Coleção Meraki', image: '/placeholder.jpg' }];
                                                    setCategories(updated);
                                                    localStorage.setItem('meraki_categories', JSON.stringify(updated));
                                                    setSelectedModalCategory(name);
                                                    setNewCategoryName('');
                                                }
                                            }}
                                            className="px-3.5 py-2 bg-[#7A3E4A] hover:bg-[#5A2E34] text-white text-[10px] font-bold uppercase rounded-xl cursor-pointer transition-colors"
                                        >
                                            + Criar
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div><label className={labelCls}>Preço (R$)</label><input type="number" name="pPrice" step="0.01" min="0" required defaultValue={editingProduct?.price || ''} className={inputCls} /></div>
                                    <div><label className={labelCls}>Preço Original (R$)</label><input type="number" name="pOriginalPrice" step="0.01" min="0" defaultValue={editingProduct?.original_price || '0'} className={inputCls} /></div>
                                </div>

                                <div>
                                    <label className={labelCls}>Badge (Etiqueta)</label>
                                    <input type="text" name="pBadge" placeholder="Ex: NOVO, 15% OFF" defaultValue={editingProduct?.badge || ''} className={inputCls} />
                                </div>

                                <div>
                                    <label className={labelCls}>Seção da Loja</label>
                                    <div className="flex flex-wrap gap-1.5 mb-2 bg-[#FAF9F5] p-3 rounded-xl border border-[#EEEEEE]">
                                        {sections.map(sec => (
                                            <button
                                                key={sec.id}
                                                type="button"
                                                onClick={() => setSelectedModalSection(sec.id)}
                                                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                    selectedModalSection === sec.id
                                                        ? 'bg-[#7A3E4A] text-white border-[#7A3E4A] shadow-xs'
                                                        : 'bg-white text-gray-500 border-[#EEEEEE] hover:bg-gray-150'
                                                }`}
                                            >
                                                {sec.label}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 max-w-xs">
                                        <input
                                            type="text"
                                            value={newSectionLabel}
                                            onChange={e => setNewSectionLabel(e.target.value)}
                                            placeholder="Nova seção..."
                                            className="flex-1 px-3 py-2 text-xs bg-[#FAF9F5] border border-[#EEEEEE] rounded-xl outline-none focus:border-[#7A3E4A] font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const label = newSectionLabel.trim();
                                                if (label) {
                                                    const id = label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                                                    if (id && !sections.some(s => s.id === id)) {
                                                        const updated = [...sections, { id, label }];
                                                        setSections(updated);
                                                        localStorage.setItem('meraki_sections', JSON.stringify(updated));
                                                        setSelectedModalSection(id);
                                                        setNewSectionLabel('');
                                                    }
                                                }
                                            }}
                                            className="px-3.5 py-2 bg-[#7A3E4A] hover:bg-[#5A2E34] text-white text-[10px] font-bold uppercase rounded-xl cursor-pointer transition-colors"
                                        >
                                            + Criar
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Tamanhos Disponíveis</label>
                                    <div className="flex flex-wrap gap-1.5 bg-[#FAF9F5] p-3 rounded-xl border border-[#EEEEEE]">
                                        {['P', 'M', 'G', 'GG', 'EGG', 'XG', 'Único', '34', '36', '38', '40', '42', '44', '46', '48', '50'].map(size => {
                                            const isSelected = selectedModalSizes.includes(size)
                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedModalSizes(prev => prev.filter(s => s !== size))
                                                        } else {
                                                            setSelectedModalSizes(prev => [...prev, size])
                                                        }
                                                    }}
                                                    className={`w-9 h-9 text-xs font-bold rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-[#C6A76A] text-white border-[#C6A76A] shadow-xs'
                                                            : 'bg-white text-gray-400 border-[#EEEEEE] hover:bg-gray-150'
                                                    }`}
                                                >
                                                    {size}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <label className={labelCls}>Cores Disponíveis</label>
                                    <div className="flex flex-wrap gap-1.5 bg-[#FAF9F5] p-3 rounded-xl border border-[#EEEEEE]">
                                        {['Preto', 'Branco', 'Vermelho', 'Nude', 'Rosa', 'Bordô', 'Azul', 'Verde', 'Amarelo', 'Lilás', 'Marinho', 'Pink', 'Rubi', 'Preto/Renda', 'Branco/Renda'].map(color => {
                                            const isSelected = selectedModalColors.includes(color)
                                            const COLOR_MAP = {
                                                'Preto': '#000000',
                                                'Branco': '#FFFFFF',
                                                'Vermelho': '#DC2626',
                                                'Nude': '#EED9C4',
                                                'Rosa': '#F472B6',
                                                'Bordô': '#800020',
                                                'Azul': '#2563EB',
                                                'Verde': '#16A34A',
                                                'Amarelo': '#FBBF24',
                                                'Lilás': '#C084FC',
                                                'Marinho': '#1E3A8A',
                                                'Pink': '#EC4899',
                                                'Rubi': '#9B111E',
                                                'Preto/Renda': '#1F1F1F',
                                                'Branco/Renda': '#F5F5F5'
                                            }
                                            const hex = COLOR_MAP[color] || '#CCCCCC'
                                            return (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => {
                                                        if (isSelected) {
                                                            setSelectedModalColors(prev => prev.filter(c => c !== color))
                                                        } else {
                                                            setSelectedModalColors(prev => [...prev, color])
                                                        }
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-[#C6A76A] text-white border-[#C6A76A] shadow-xs'
                                                            : 'bg-white text-gray-400 border-[#EEEEEE] hover:bg-gray-150'
                                                    }`}
                                                >
                                                    <span className="w-3 h-3 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: hex }} />
                                                    {color}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#EEEEEE] space-y-4">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="pInPromoCombo"
                                            defaultChecked={editingProduct?.inPromoCombo || false}
                                            className="w-4 h-4 text-[#7A3E4A] focus:ring-[#7A3E4A] border-gray-300 rounded"
                                        />
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Destacar no Combo da Home Page</span>
                                    </label>

                                    <label className="flex items-center gap-2.5 cursor-pointer pt-2 border-t border-[#EEEEEE] border-dashed">
                                        <input
                                            type="checkbox"
                                            checked={isCustomizable}
                                            onChange={e => setIsCustomizable(e.target.checked)}
                                            className="w-4 h-4 text-[#7A3E4A] focus:ring-[#7A3E4A] border-gray-300 rounded"
                                        />
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Ativar Personalização de Nome</span>
                                    </label>

                                    {isCustomizable && (
                                        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-dashed border-gray-200 animate-[fadeIn_200ms_ease-out]">
                                            <div>
                                                <label className={labelCls}>Preço SEM Personalização (R$)</label>
                                                <input 
                                                    type="number" 
                                                    name="pCustomPriceWithout" 
                                                    step="0.01" 
                                                    min="0" 
                                                    value={customPriceWithout}
                                                    onChange={e => setCustomPriceWithout(e.target.value)}
                                                    className={inputCls} 
                                                    placeholder="Ex: 18.00"
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Preço COM Personalização (R$)</label>
                                                <input 
                                                    type="number" 
                                                    name="pCustomPriceWith" 
                                                    step="0.01" 
                                                    min="0" 
                                                    value={customPriceWith}
                                                    onChange={e => setCustomPriceWith(e.target.value)}
                                                    className={inputCls} 
                                                    placeholder="Ex: 18.00"
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Taxa por Letra (R$)</label>
                                                <input 
                                                    type="number" 
                                                    name="pCustomFeeLetter" 
                                                    step="0.01" 
                                                    min="0" 
                                                    value={customFeeLetter}
                                                    onChange={e => setCustomFeeLetter(e.target.value)}
                                                    className={inputCls} 
                                                />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Taxa por Número (R$)</label>
                                                <input 
                                                    type="number" 
                                                    name="pCustomFeeNumber" 
                                                    step="0.01" 
                                                    min="0" 
                                                    value={customFeeNumber}
                                                    onChange={e => setCustomFeeNumber(e.target.value)}
                                                    className={inputCls} 
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label className={labelCls}>Taxa por Emoji/Especial (R$)</label>
                                                <input 
                                                    type="number" 
                                                    name="pCustomFeeEmoji" 
                                                    step="0.01" 
                                                    min="0" 
                                                    value={customFeeEmoji}
                                                    onChange={e => setCustomFeeEmoji(e.target.value)}
                                                    className={inputCls} 
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div><label className={labelCls}>Descrição</label><textarea name="pDescription" rows="3" defaultValue={editingProduct?.description || ''} className={`${inputCls} resize-none`} /></div>

                                {/* Image Upload */}
                                <div>
                                    <label className={labelCls}>Imagens do Produto <span className="text-[9px] text-[#C6A76A] lowercase font-normal">(Recomendado: 800x1000px - Proporção 4:5)</span></label>
                                    {existingImages.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {existingImages.map((url, i) => (
                                                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#EEEEEE]">
                                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-black cursor-pointer shadow-sm">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div
                                        onDragOver={e => { e.preventDefault(); setDragActive(true) }}
                                        onDragLeave={() => setDragActive(false)}
                                        onDrop={e => { e.preventDefault(); setDragActive(false); handleFileSelect(e.dataTransfer.files) }}
                                        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${dragActive ? 'border-[#7A3E4A] bg-[#7A3E4A]/5' : 'border-[#EEEEEE] hover:border-[#7A3E4A]/40 hover:bg-[#FAF9F5]'}`}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <input type="file" ref={fileInputRef} multiple accept="image/*" className="hidden" onChange={e => handleFileSelect(e.target.files)} />
                                        <Icon path="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                        <p className="text-xs font-bold text-gray-400">Arraste fotos ou clique para enviar</p>
                                        <p className="text-[10px] text-gray-300 mt-1">Aceita: JPG, PNG, WebP</p>
                                    </div>
                                    {imageFiles.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {imageFiles.map((file, i) => (
                                                <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#EEEEEE]">
                                                    <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-black cursor-pointer shadow-sm">✕</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button type="submit" disabled={saving} className="w-full py-4 bg-gradient-to-r from-[#7A3E4A] to-[#9A5060] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#7A3E4A]/30 transition-all disabled:opacity-50 cursor-pointer">
                                    {saving ? 'Salvando...' : 'Salvar Produto'}
                                </button>
                            </form>
                        </div>
                    </>
                )
            })()}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* MODAL: CREATE COUPON */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {couponModal && (
                <>
                    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" onClick={() => setCouponModal(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] bg-white rounded-2xl shadow-2xl max-w-sm w-[calc(100%-2rem)]">
                        <div className="flex items-center justify-between p-5 border-b border-[#EEEEEE]">
                            <h2 className="text-sm font-black text-gray-900">Novo Cupom</h2>
                            <button onClick={() => setCouponModal(false)} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateCoupon} className="p-5 space-y-4">
                            <div><label className={labelCls}>Código do Cupom</label><input type="text" required placeholder="Ex: MERAKI15" value={couponForm.code} onChange={e => setCouponForm(prev => ({ ...prev, code: e.target.value }))} className={`${inputCls} uppercase tracking-widest font-black`} /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className={labelCls}>Tipo</label>
                                    <select value={couponForm.type} onChange={e => setCouponForm(prev => ({ ...prev, type: e.target.value }))} className={inputCls}>
                                        <option value="percentage">Porcentagem (%)</option>
                                        <option value="fixed">Fixo (R$)</option>
                                    </select>
                                </div>
                                <div><label className={labelCls}>Valor</label><input type="number" required placeholder="15" value={couponForm.value} onChange={e => setCouponForm(prev => ({ ...prev, value: e.target.value }))} className={inputCls} /></div>
                            </div>
                            <div><label className={labelCls}>Mínimo de Compra (R$)</label><input type="number" placeholder="100" value={couponForm.minPurchase} onChange={e => setCouponForm(prev => ({ ...prev, minPurchase: e.target.value }))} className={inputCls} /></div>
                            <button type="submit" className="w-full py-4 bg-gradient-to-r from-[#7A3E4A] to-[#9A5060] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#7A3E4A]/30 transition-all cursor-pointer">
                                Criar Cupom
                            </button>
                        </form>
                    </div>
                </>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* MODAL: ADD BANNER */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {bannerModal && (
                <>
                    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" onClick={() => setBannerModal(false)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] bg-white rounded-2xl shadow-2xl max-w-sm w-[calc(100%-2rem)]">
                        <div className="flex items-center justify-between p-5 border-b border-[#EEEEEE]">
                            <h2 className="text-sm font-black text-gray-900">Adicionar Banner</h2>
                            <button onClick={() => setBannerModal(false)} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateBanner} className="p-5 space-y-4">
                            <div>
                                <label className={labelCls}>Upload de Imagem <span className="text-[9px] text-[#C6A76A] lowercase font-normal">(Recomendado: 1920x800px - Proporção 16:7)</span></label>
                                <input type="file" accept="image/*" onChange={e => {
                                    if (e.target.files?.[0]) compressImage(e.target.files[0]).then(f => setBannerImageFiles([f]))
                                }} className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#7A3E4A]/10 file:text-[#7A3E4A] hover:file:bg-[#7A3E4A]/20 cursor-pointer" />
                            </div>
                            <div><label className={labelCls}>Ou Link de Imagem</label><input type="text" placeholder="https://..." value={bannerForm.image} onChange={e => setBannerForm(prev => ({ ...prev, image: e.target.value }))} className={inputCls} /></div>
                            <div><label className={labelCls}>Texto Alternativo (Alt)</label><input type="text" placeholder="Ex: Nova Coleção" value={bannerForm.alt} onChange={e => setBannerForm(prev => ({ ...prev, alt: e.target.value }))} className={inputCls} /></div>
                            <div><label className={labelCls}>Link de Destino</label><input type="text" value={bannerForm.link} onChange={e => setBannerForm(prev => ({ ...prev, link: e.target.value }))} className={inputCls} /></div>
                            <button type="submit" disabled={saving} className="w-full py-4 bg-gradient-to-r from-[#7A3E4A] to-[#9A5060] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#7A3E4A]/30 transition-all cursor-pointer disabled:opacity-50">
                                {saving ? 'Salvando...' : 'Adicionar Banner'}
                            </button>
                        </form>
                    </div>
                </>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* MODAL: RETURN MANAGEMENT */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {selectedReturn && (
                <>
                    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm" onClick={() => setSelectedReturn(null)} />
                    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[95] bg-white rounded-2xl shadow-2xl max-w-sm w-[calc(100%-2rem)]">
                        <div className="flex items-center justify-between p-5 border-b border-[#EEEEEE]">
                            <h2 className="text-sm font-black text-gray-900">Gerenciar Devolução</h2>
                            <button onClick={() => setSelectedReturn(null)} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
                                <Icon path="M6 18L18 6M6 6l12 12" className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="p-4 bg-[#FAF9F5] rounded-xl space-y-2 text-xs">
                                <div className="flex justify-between"><span className="font-bold text-gray-400">Protocolo</span><span className="font-mono text-gray-700 text-[10px]">{selectedReturn.id}</span></div>
                                <div className="flex justify-between"><span className="font-bold text-gray-400">Cliente</span><span className="text-gray-700">{selectedReturn.customerEmail}</span></div>
                                <div className="flex justify-between"><span className="font-bold text-gray-400">Pedido</span><span className="text-gray-700">{selectedReturn.orderId}</span></div>
                                <div className="flex justify-between"><span className="font-bold text-gray-400">Tipo</span><span className={`font-bold capitalize ${selectedReturn.type === 'devolução' ? 'text-red-500' : 'text-sky-500'}`}>{selectedReturn.type}</span></div>
                                {selectedReturn.reason && <div className="border-t border-[#EEEEEE] pt-2"><span className="font-bold text-gray-400 block mb-1">Motivo</span><p className="text-gray-600 italic">"{selectedReturn.reason}"</p></div>}
                            </div>

                            <div>
                                <label className={labelCls}>Status da Solicitação</label>
                                <select value={selectedReturn.status} onChange={e => handleUpdateReturn(selectedReturn.customerEmail, selectedReturn.id, { status: e.target.value })} className={inputCls}>
                                    <option value="Autorizado (Aguardando Postagem)">Autorizado (Aguardando Postagem)</option>
                                    <option value="Produto Recebido (Em Análise)">Produto Recebido (Em Análise)</option>
                                    <option value="Concluído (Cupom/Estorno Gerado)">Concluído (Cupom/Estorno Gerado)</option>
                                    <option value="Recusado">Recusado</option>
                                </select>
                            </div>

                            <div>
                                <label className={labelCls}>Código de Postagem Reversa</label>
                                <input
                                    type="text"
                                    placeholder="Ex: 982183201"
                                    defaultValue={selectedReturn.postageCode || ''}
                                    onBlur={e => handleUpdateReturn(selectedReturn.customerEmail, selectedReturn.id, { postageCode: e.target.value })}
                                    className={`${inputCls} font-mono uppercase tracking-wider`}
                                />
                                <p className="text-[10px] text-gray-400 mt-1.5 italic">Alterações são salvas automaticamente ao sair do campo.</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
