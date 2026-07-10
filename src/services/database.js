import { supabase } from './supabase.js'

// Cache default products for auto-seeding if Supabase is empty
const DEFAULT_PRODUCTS = [
    {
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
    }
]

// Initialize database schema sync
// Define expected columns for each database table
const TABLE_COLUMNS = {
    orders: ['id', 'customername', 'customeremail', 'total', 'status', 'items', 'created_at'],
    coupons: ['id', 'code', 'value', 'type', 'minpurchase', 'created_at'],
    banners: ['id', 'image', 'alt', 'created_at'],
    returns: ['id', 'orderid', 'itemid', 'customeremail', 'type', 'postagecode', 'status', 'created_at'],
    categories: ['id', 'name', 'group', 'description', 'image', 'created_at'],
    products: ['id', 'name', 'category', 'price', 'original_price', 'image', 'badge', 'section', 'sizes', 'description', 'stock', 'created_at']
}

// Maps database columns to alternative frontend keys
const FIELD_MAPPING = {
    customername: ['customerName', 'customername'],
    customeremail: ['customerEmail', 'customeremail'],
    minpurchase: ['minPurchase', 'minpurchase'],
    orderid: ['orderId', 'orderid'],
    itemid: ['itemId', 'itemid'],
    postagecode: ['postageCode', 'postagecode']
}

// Translate database properties back to camelCase for frontend pages
function mapDbToFrontend(table, item) {
    if (!item) return item
    const mapped = { ...item }
    if (table === 'orders') {
        if (item.customername !== undefined) mapped.customerName = item.customername
        if (item.customeremail !== undefined) mapped.customerEmail = item.customeremail
    } else if (table === 'returns') {
        if (item.orderid !== undefined) mapped.orderId = item.orderid
        if (item.itemid !== undefined) mapped.itemId = item.itemid
        if (item.customeremail !== undefined) mapped.customerEmail = item.customeremail
        if (item.postagecode !== undefined) mapped.postageCode = item.postagecode
    } else if (table === 'coupons') {
        if (item.minpurchase !== undefined) mapped.minPurchase = item.minpurchase
    }
    return mapped
}

export async function initSupabaseSync() {
    try {
        console.log('🔄 Sincronizando tabelas com o Supabase...')
        
        // 1. Sync Products (and seed if empty)
        const { data: dbProducts, error: pError } = await supabase.from('products').select('*')
        if (!pError) {
            if (!dbProducts || dbProducts.length === 0) {
                console.log('🌱 Banco vazio. Semeando produtos padrão no Supabase...')
                await supabase.from('products').insert(DEFAULT_PRODUCTS)
                const { data: reloadedProducts } = await supabase.from('products').select('*')
                localStorage.setItem('meraki_products', JSON.stringify(reloadedProducts || DEFAULT_PRODUCTS))
            } else {
                localStorage.setItem('meraki_products', JSON.stringify(dbProducts))
            }
        }

        // 2. Sync Orders
        const { data: dbOrders } = await supabase.from('orders').select('*')
        if (dbOrders) {
            const mappedOrders = dbOrders.map(o => mapDbToFrontend('orders', o))
            localStorage.setItem('meraki_orders', JSON.stringify(mappedOrders))
        }

        // 3. Sync Coupons
        const { data: dbCoupons } = await supabase.from('coupons').select('*')
        if (dbCoupons) {
            const mappedCoupons = dbCoupons.map(c => mapDbToFrontend('coupons', c))
            localStorage.setItem('meraki_coupons', JSON.stringify(mappedCoupons))
        }

        // 4. Sync Banners
        const { data: dbBanners } = await supabase.from('banners').select('*')
        if (dbBanners) {
            localStorage.setItem('meraki_banners', JSON.stringify(dbBanners))
        }

        // 5. Sync Categories
        const { data: dbCategories } = await supabase.from('categories').select('*')
        if (dbCategories) {
            localStorage.setItem('meraki_categories', JSON.stringify(dbCategories))
        }

        // 6. Sync Returns
        const { data: dbReturns } = await supabase.from('returns').select('*')
        if (dbReturns) {
            const mappedReturns = dbReturns.map(r => mapDbToFrontend('returns', r))
            localStorage.setItem('meraki_all_returns', JSON.stringify(mappedReturns))
        }

        // 7. Sync Store Config
        const { data: dbConfig } = await supabase.from('store_config').select('*').eq('id', 'default').maybeSingle()
        if (dbConfig) {
            localStorage.setItem('meraki_store_config', JSON.stringify(dbConfig))
        } else {
            const defaultConfig = {
                id: 'default',
                whatsapp: '5511999999999',
                sac_phone: '(11) 2388-0403',
                address: 'Rua Alpont, 428 - Bairro Capuava - Mauá - São Paulo. CEP: 09380-115',
                cnpj: '57.484.768/0064-89',
                infinitepay_handle: 'nicolly_gomes'
            }
            await supabase.from('store_config').upsert(defaultConfig)
            localStorage.setItem('meraki_store_config', JSON.stringify(defaultConfig))
        }

        console.log('✅ Sincronização concluída com sucesso.')
    } catch (e) {
        console.error('⚠️ Falha ao sincronizar dados com Supabase:', e)
    }
}

// Start sync immediately
initSupabaseSync()

// Intercept LocalStorage writes to sync them back to Supabase
const originalSetItem = localStorage.setItem.bind(localStorage)

localStorage.setItem = function(key, value) {
    originalSetItem(key, value)
    
    // Asynchronously push updates to Supabase
    try {
        const parsed = JSON.parse(value)
        if (key === 'meraki_products') {
            syncTableToSupabase('products', parsed)
        } else if (key === 'meraki_orders') {
            syncTableToSupabase('orders', parsed)
        } else if (key === 'meraki_coupons') {
            syncTableToSupabase('coupons', parsed)
        } else if (key === 'meraki_banners') {
            syncTableToSupabase('banners', parsed)
        } else if (key === 'meraki_categories') {
            syncTableToSupabase('categories', parsed)
        } else if (key.startsWith('meraki_returns_')) {
            const email = key.replace('meraki_returns_', '')
            const returnsWithEmail = parsed.map(ret => ({ ...ret, customerEmail: email }))
            syncTableToSupabase('returns', returnsWithEmail)
        } else if (key === 'meraki_store_config') {
            supabase.from('store_config').upsert(parsed).then(() => {
                window.dispatchEvent(new Event('storeConfigUpdated'))
            })
        }
    } catch (e) {
        // Not JSON or non-sync key
    }
}

async function syncTableToSupabase(table, items) {
    if (!Array.isArray(items)) return
    try {
        const allowedCols = TABLE_COLUMNS[table]
        for (const item of items) {
            const payload = {}
            
            if (allowedCols) {
                for (const col of allowedCols) {
                    const possibleKeys = FIELD_MAPPING[col] || [col]
                    let val = undefined
                    for (const key of possibleKeys) {
                        if (item[key] !== undefined) {
                            val = item[key]
                            break
                        }
                    }
                    if (val !== undefined) {
                        payload[col] = val
                    }
                }
            } else {
                Object.assign(payload, item)
            }

            // If the item has a temporary numeric ID (like mock products/orders), Supabase will auto-generate a UUID if omitted
            if (payload.id && (payload.id.length < 10 || !isNaN(payload.id))) {
                delete payload.id // Let Supabase generate a proper UUID
            }

            const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' })
            if (error) {
                console.error(`Erro ao upsertar item na tabela ${table}:`, error.message, payload)
            }
        }
    } catch (e) {
        console.error(`Erro ao sincronizar tabela ${table} para o Supabase:`, e)
    }
}

// Helper database functions expected by pages
export async function getProducts() {
    try {
        const { data, error } = await supabase.from('products').select('*')
        if (error) throw error
        return { data: data || [], error: null }
    } catch (e) {
        return { data: [], error: e }
    }
}

export async function getProductById(id) {
    try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
        if (error) throw error
        return { data, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function getProductsBySection(section) {
    try {
        const { data, error } = await supabase.from('products').select('*').eq('section', section)
        if (error) throw error
        return { data: data || [], error: null }
    } catch (e) {
        return { data: [], error: e }
    }
}

export async function createProduct(product) {
    try {
        const { data, error } = await supabase.from('products').insert([product]).select().single()
        if (error) throw error
        
        // Update local cache
        const current = JSON.parse(localStorage.getItem('meraki_products') || '[]')
        current.unshift(data)
        originalSetItem('meraki_products', JSON.stringify(current))

        return { data, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function updateProduct(id, updates) {
    try {
        const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single()
        if (error) throw error

        // Update local cache
        const current = JSON.parse(localStorage.getItem('meraki_products') || '[]')
        const idx = current.findIndex(p => p.id === id)
        if (idx !== -1) {
            current[idx] = { ...current[idx], ...data }
            originalSetItem('meraki_products', JSON.stringify(current))
        }

        return { data, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function deleteProduct(id) {
    try {
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) throw error

        // Update local cache
        const current = JSON.parse(localStorage.getItem('meraki_products') || '[]')
        const filtered = current.filter(p => p.id !== id)
        originalSetItem('meraki_products', JSON.stringify(filtered))

        return { data: true, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function searchProducts(query) {
    try {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
        if (error) throw error
        return { data: data || [], error: null }
    } catch (e) {
        return { data: [], error: e }
    }
}

// Storage/image uploading
export async function uploadImage(file) {
    try {
        // Try uploading to Supabase Storage Bucket 'images'
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}_${Date.now()}.${fileExt}`
        const { data, error } = await supabase.storage.from('images').upload(fileName, file)
        
        if (error) {
            // Fallback to FileReader Base64 encoding if bucket is not configured
            return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve({ url: reader.result, error: null })
                reader.onerror = (e) => resolve({ url: null, error: e })
                reader.readAsDataURL(file)
            })
        }

        const { data: { publicUrl } } = supabase.storage.from('images').getPublicUrl(fileName)
        return { url: publicUrl, error: null }
    } catch (e) {
        return { url: null, error: e }
    }
}

export async function uploadMultipleImages(files) {
    const results = await Promise.all(files.map(f => uploadImage(f)))
    const urls = results.filter(r => r.url).map(r => r.url)
    const errors = results.filter(r => r.error).map(r => r.error)
    return { urls, errors }
}

export async function deleteImage(url) {
    try {
        if (url.includes('/storage/v1/object/public/images/')) {
            const fileName = url.split('/').pop()
            await supabase.storage.from('images').remove([fileName])
        }
        return { error: null }
    } catch (e) {
        return { error: e }
    }
}
