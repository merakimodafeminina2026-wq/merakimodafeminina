// Mock Database Service using LocalStorage
// Resolves all promises locally without calling Supabase

const DEFAULT_PRODUCTS = [
    {
        id: '1',
        name: 'Conjunto de Renda Sophie Noir',
        category: 'Conjuntos',
        price: 189.90,
        original_price: 249.90,
        image: [
            'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1608748010899-18f300247112?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Mais Vendido',
        section: 'best-sellers',
        sizes: ['P', 'M', 'G'],
        description: 'Conjunto delicado em renda premium francesa com sutiã com aro e calcinha fio regulável.'
    },
    {
        id: '2',
        name: 'Robe Satin Royale',
        category: 'Linha Noite',
        price: 219.90,
        original_price: 0,
        image: [
            'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Luxo',
        section: 'featured',
        sizes: ['M', 'G', 'GG'],
        description: 'Robe em cetim de seda pura com acabamento em renda chantilly nas mangas.'
    },
    {
        id: '3',
        name: 'Body Red Velvet Sexy',
        category: 'Linha Sexy',
        price: 159.90,
        original_price: 199.90,
        image: [
            'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1608748010899-18f300247112?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Novidade',
        section: 'new-collection',
        sizes: ['P', 'M', 'G'],
        description: 'Body cavado em veludo molhado vermelho e detalhes em tule transparente.'
    },
    {
        id: '4',
        name: 'Corset Classic Ethereal',
        category: 'Plus Size',
        price: 259.90,
        original_price: 320.00,
        image: [
            'https://images.unsplash.com/photo-1608748010899-18f300247112?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Destaque',
        section: 'featured',
        sizes: ['G', 'GG', 'XG'],
        description: 'Corset estruturado com barbatanas flexíveis para modelagem perfeita e conforto incomparável.'
    },
    {
        id: '5',
        name: 'Baby Doll de Seda Romance',
        category: 'Linha Noite',
        price: 149.90,
        original_price: 179.90,
        image: [
            'https://images.unsplash.com/photo-1610398000003-1600c35928bb?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=600&auto=format&fit=crop&q=80'
        ],
        badge: '15% OFF',
        section: 'best-sellers',
        sizes: ['P', 'M', 'G'],
        description: 'Baby doll leve em malha fria e renda antialérgica, ideal para noites tranquilas.'
    },
    {
        id: '6',
        name: 'Conjunto Strappy Noir',
        category: 'Linha Sexy',
        price: 199.90,
        original_price: 0,
        image: [
            'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Novidade',
        section: 'new-collection',
        sizes: ['P', 'M', 'G'],
        description: 'Conjunto sexy com tiras reguláveis, renda floral e bojo estruturado.'
    },
    {
        id: '7',
        name: 'Sutiã Rendado Comfort',
        category: 'Plus Size',
        price: 129.90,
        original_price: 159.90,
        image: [
            'https://images.unsplash.com/photo-1626294336060-cc989c894565?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Conforto',
        section: 'best-sellers',
        sizes: ['G', 'GG', 'XG'],
        description: 'Sutiã reforçado com alças largas acolchoadas e renda macia de alta durabilidade.'
    },
    {
        id: '8',
        name: 'Conjunto All White Bride',
        category: 'Conjuntos',
        price: 229.90,
        original_price: 299.90,
        image: [
            'https://images.unsplash.com/photo-1626294336060-cc989c894565?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1610398000003-1600c35928bb?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Noivas',
        section: 'featured',
        sizes: ['P', 'M', 'G'],
        description: 'Conjunto especial noiva em renda branca floral com detalhes em pérola sintética.'
    },
    {
        id: '9',
        name: 'Calcinha Fio Regulável Amore',
        category: 'Ofertas',
        price: 39.90,
        original_price: 59.90,
        image: [
            'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Popular',
        section: 'best-sellers',
        sizes: ['P', 'M', 'G'],
        description: 'Calcinha modelo fio dental com regulagem lateral em metal dourado e renda antialérgica.'
    },
    {
        id: '10',
        name: 'Calcinha Hot Pant Modeladora',
        category: 'Plus Size',
        price: 49.90,
        original_price: 69.90,
        image: [
            'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Cós Alto',
        section: 'featured',
        sizes: ['M', 'G', 'GG', 'XG'],
        description: 'Calcinha hot pant em microfibra tecnológica de média compressão e recortes rendados nas laterais.'
    },
    {
        id: '11',
        name: 'Kit 3 Calcinhas Cotton Conforto',
        category: 'Ofertas',
        price: 89.90,
        original_price: 119.90,
        image: [
            'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Melhor Valor',
        section: 'best-sellers',
        sizes: ['P', 'M', 'G', 'GG'],
        description: 'Kit contendo 3 calcinhas de algodão egípcio extremamente macias, ideais para o dia a dia.'
    },
    {
        id: '12',
        name: 'Calcinha Renda e Tule Sedução',
        category: 'Linha Sexy',
        price: 45.90,
        original_price: 0,
        image: [
            'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Sexy',
        section: 'new-collection',
        sizes: ['P', 'M', 'G'],
        description: 'Calcinha sem costura com frente rendada e costas em tule transparente invisível.'
    },
    {
        id: '13',
        name: 'Conjunto Bralette Cozy Sem Aro',
        category: 'Conjuntos',
        price: 139.90,
        original_price: 169.90,
        image: [
            'https://images.unsplash.com/photo-1626294336060-cc989c894565?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Super Conforto',
        section: 'new-collection',
        sizes: ['P', 'M', 'G'],
        description: 'Bralette confortável sem aro em microfibra macia de toque gelado com calcinha boxer curta.'
    },
    {
        id: '14',
        name: 'Camisola de Cetim Elegance',
        category: 'Linha Noite',
        price: 179.90,
        original_price: 219.00,
        image: [
            'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Sofisticado',
        section: 'featured',
        sizes: ['P', 'M', 'G', 'GG'],
        description: 'Camisola curta com alças reguláveis em cetim brilhante e decote em renda no busto.'
    },
    {
        id: '15',
        name: 'Body Cavado de Renda Imperial',
        category: 'Linha Sexy',
        price: 189.90,
        original_price: 249.90,
        image: [
            'https://images.unsplash.com/photo-1608748010899-18f300247112?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Destaque',
        section: 'featured',
        sizes: ['P', 'M', 'G'],
        description: 'Body de renda de manga longa bufante removível e forro de tule invisível no busto.'
    },
    {
        id: '16',
        name: 'Conjunto Plus Size Amour Renda',
        category: 'Plus Size',
        price: 209.90,
        original_price: 0,
        image: [
            'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Modelagem Perfeita',
        section: 'best-sellers',
        sizes: ['G', 'GG', 'XG'],
        description: 'Conjunto com sutiã reforçado com arco largo e base confortável com calcinha caleçon de renda.'
    },
    {
        id: '17',
        name: 'Calcinha Fio Regulável Lavanda',
        category: 'Ofertas',
        price: 35.90,
        original_price: 49.90,
        image: [
            'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Novidade',
        section: 'new-collection',
        sizes: ['P', 'M', 'G'],
        description: 'Calcinha fio dental regulável com detalhes em renda lilás suave e toque sedoso.'
    },
    {
        id: '18',
        name: 'Sutiã Push-Up Rendez-vous',
        category: 'Ofertas',
        price: 79.90,
        original_price: 119.90,
        image: [
            'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Push Up',
        section: 'best-sellers',
        sizes: ['P', 'M', 'G'],
        description: 'Sutiã com bojo push-up que realça o busto naturalmente, revestido em renda acetinada.'
    },
    {
        id: '19',
        name: 'Conjunto de Renda Ruby Red',
        category: 'Conjuntos',
        price: 199.90,
        original_price: 259.90,
        image: [
            'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1608748010899-18f300247112?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Premium',
        section: 'new-collection',
        sizes: ['P', 'M', 'G'],
        description: 'Conjunto rendado na cor vermelha rubi com aro estruturado de sustentação.'
    },
    {
        id: '20',
        name: 'Camisola Satin Longa Noir',
        category: 'Linha Noite',
        price: 199.90,
        original_price: 249.90,
        image: [
            'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Elegante',
        section: 'featured',
        sizes: ['M', 'G', 'GG'],
        description: 'Camisola longa de cetim com abertura lateral e costas nuas transpassadas.'
    },
    {
        id: '21',
        name: 'Conjunto Corset Satin e Renda',
        category: 'Conjuntos',
        price: 249.90,
        original_price: 319.90,
        image: [
            'https://images.unsplash.com/photo-1608748010899-18f300247112?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Luxo',
        section: 'featured',
        sizes: ['P', 'M', 'G'],
        description: 'Corset rendado com fecho traseiro por colchetes e calcinha fio dental dupla.'
    },
    {
        id: '22',
        name: 'Sutiã Meia Taça Classic Lace',
        category: 'Ofertas',
        price: 89.95,
        original_price: 129.90,
        image: [
            'https://images.unsplash.com/photo-1626294336060-cc989c894565?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Clássico',
        section: 'best-sellers',
        sizes: ['P', 'M', 'G'],
        description: 'Sutiã modelo meia taça clássico, ideal para decotes quadrados, confeccionado em renda antialérgica.'
    },
    {
        id: '23',
        name: 'Calcinha Boxer Algodão Premium',
        category: 'Ofertas',
        price: 34.90,
        original_price: 49.90,
        image: [
            'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Básico Chic',
        section: 'best-sellers',
        sizes: ['M', 'G', 'GG'],
        description: 'Calcinha estilo boxer curta de algodão com toque suave e elástico largo invisível na cintura.'
    },
    {
        id: '24',
        name: 'Conjunto Plus Size Bella Coral',
        category: 'Plus Size',
        price: 219.90,
        original_price: 0,
        image: [
            'https://images.unsplash.com/photo-1616422285623-13ff0162193c?w=600&auto=format&fit=crop&q=80'
        ],
        badge: 'Novidade',
        section: 'new-collection',
        sizes: ['G', 'GG', 'XG'],
        description: 'Conjunto em renda coral vibrante com aro duplo de metal e laterais largas modeladoras.'
    }
]

function getLocalProducts() {
    const data = localStorage.getItem('meraki_products')
    const version = localStorage.getItem('meraki_products_version')
    const CURRENT_VERSION = 'v6'

    if (!data || version !== CURRENT_VERSION) {
        localStorage.setItem('meraki_products', JSON.stringify(DEFAULT_PRODUCTS))
        localStorage.setItem('meraki_products_version', CURRENT_VERSION)
        return DEFAULT_PRODUCTS
    }
    return JSON.parse(data)
}


function saveLocalProducts(products) {
    localStorage.setItem('meraki_products', JSON.stringify(products))
}

// =============================================
// PRODUCTS
// =============================================

export async function getProducts() {
    try {
        const products = getLocalProducts()
        return { data: products, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function getProductById(id) {
    try {
        const products = getLocalProducts()
        const product = products.find(p => p.id === id)
        return { data: product || null, error: product ? null : new Error('Product not found') }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function getProductsBySection(section) {
    try {
        const products = getLocalProducts()
        const filtered = products.filter(p => p.section === section)
        return { data: filtered, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function createProduct(product) {
    try {
        const products = getLocalProducts()
        const newProduct = {
            ...product,
            id: String(Date.now() + Math.floor(Math.random() * 1000)),
            created_at: new Date().toISOString()
        }
        products.unshift(newProduct)
        saveLocalProducts(products)
        return { data: newProduct, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function updateProduct(id, updates) {
    try {
        const products = getLocalProducts()
        const idx = products.findIndex(p => p.id === id)
        if (idx === -1) return { data: null, error: new Error('Product not found') }
        
        products[idx] = { ...products[idx], ...updates }
        saveLocalProducts(products)
        return { data: products[idx], error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function deleteProduct(id) {
    try {
        let products = getLocalProducts()
        products = products.filter(p => p.id !== id)
        saveLocalProducts(products)
        return { data: true, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function searchProducts(query) {
    try {
        const products = getLocalProducts()
        const normalizedQuery = query.toLowerCase()
        const filtered = products.filter(p => 
            p.name.toLowerCase().includes(normalizedQuery) || 
            p.category.toLowerCase().includes(normalizedQuery) ||
            (p.description && p.description.toLowerCase().includes(normalizedQuery))
        )
        return { data: filtered, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

// =============================================
// STORAGE (Mock)
// =============================================

export async function uploadImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => {
            resolve({ url: reader.result, error: null })
        }
        reader.onerror = (e) => {
            resolve({ url: null, error: e })
        }
        reader.readAsDataURL(file)
    })
}

export async function uploadMultipleImages(files) {
    const results = await Promise.all(files.map(f => uploadImage(f)))
    const urls = results.filter(r => r.url).map(r => r.url)
    const errors = results.filter(r => r.error).map(r => r.error)
    return { urls, errors }
}

export async function deleteImage(url) {
    // No-op for local mock
    return { error: null }
}
