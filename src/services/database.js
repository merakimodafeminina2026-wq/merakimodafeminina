import { supabase } from './supabase.js'



// Initialize database schema sync
// Define expected columns for each database table
const TABLE_COLUMNS = {
    orders: [
        'id', 'customername', 'customeremail', 'customerphone', 'customercpf', 'shippingaddress',
        'paymentmethod', 'subtotal', 'shipping', 'discount', 'total', 'coupon', 'status', 'items', 'created_at'
    ],
    coupons: ['id', 'code', 'value', 'type', 'minpurchase', 'created_at'],
    banners: ['id', 'image', 'mobile_image', 'alt', 'link', 'created_at'],
    returns: ['id', 'orderid', 'itemid', 'customeremail', 'type', 'postagecode', 'status', 'created_at'],
    categories: ['id', 'name', 'group', 'description', 'image', 'created_at'],
    products: [
        'id', 'name', 'category', 'price', 'original_price', 'image', 'badge', 'section', 'sizes', 'description', 'stock', 'created_at',
        'colors', 'inpromocombo', 'iscustomizable', 'custompricewith', 'custompricewithout', 'customfeeletter', 'customfeenumber', 'customfeeemoji', 'customizable_emojis'
    ],
    store_config: [
        'id', 'whatsapp', 'sac_phone', 'address', 'cnpj', 'infinitepay_handle',
        'topbarmessages', 'topbarstyle', 'promocombo', 'editorial', 'available_colors', 'available_emojis', 'shipping_message',
        'available_badges', 'installment_text', 'banner_transition'
    ]
}

// Maps database columns to alternative frontend keys
const FIELD_MAPPING = {
    customername: ['customerName', 'customername'],
    customeremail: ['customerEmail', 'customeremail'],
    customerphone: ['customerPhone', 'customerphone'],
    customercpf: ['customerCpf', 'customercpf'],
    shippingaddress: ['shippingAddress', 'shippingaddress'],
    paymentmethod: ['paymentMethod', 'paymentmethod'],
    minpurchase: ['minPurchase', 'minpurchase'],
    orderid: ['orderId', 'orderid'],
    itemid: ['itemId', 'itemid'],
    postagecode: ['postageCode', 'postagecode'],
    inpromocombo: ['inPromoCombo', 'inpromocombo'],
    iscustomizable: ['isCustomizable', 'iscustomizable'],
    custompricewith: ['customPriceWith', 'custompricewith'],
    custompricewithout: ['customPriceWithout', 'custompricewithout'],
    customfeeletter: ['customFeeLetter', 'customfeeletter'],
    customfeenumber: ['customFeeNumber', 'customfeenumber'],
    customfeeemoji: ['customFeeEmoji', 'customfeeemoji'],
    customizable_emojis: ['customizableEmojis', 'customizable_emojis'],
    topbarmessages: ['topbarMessages', 'topbarmessages'],
    topbarstyle: ['topbarStyle', 'topbarstyle'],
    promocombo: ['promoCombo', 'promocombo'],
    editorial: ['editorial', 'editorial'],
    available_colors: ['availableColors', 'available_colors'],
    available_emojis: ['availableEmojis', 'available_emojis'],
    shipping_message: ['shippingMessage', 'shipping_message'],
    available_badges: ['availableBadges', 'available_badges'],
    installment_text: ['installmentText', 'installment_text'],
    banner_transition: ['bannerTransition', 'banner_transition']
}

// Normalize a category value (object or string) to its name string
function normalizeCategoryName(cat) {
    if (!cat) return cat
    if (typeof cat === 'object') return cat.name || ''
    try {
        const parsed = JSON.parse(cat)
        if (parsed && typeof parsed === 'object') return parsed.name || cat
    } catch (_) { /* not JSON */ }
    return cat
}

// Translate database properties back to camelCase for frontend pages
function mapDbToFrontend(table, item) {
    if (!item) return item
    const mapped = { ...item }
    if (table === 'orders') {
        if (item.customername !== undefined) mapped.customerName = item.customername
        if (item.customeremail !== undefined) mapped.customerEmail = item.customeremail
        if (item.customerphone !== undefined) mapped.customerPhone = item.customerphone
        if (item.customercpf !== undefined) mapped.customerCpf = item.customercpf
        if (item.shippingaddress !== undefined) mapped.shippingAddress = item.shippingaddress
        if (item.paymentmethod !== undefined) mapped.paymentMethod = item.paymentmethod
    } else if (table === 'returns') {
        if (item.orderid !== undefined) mapped.orderId = item.orderid
        if (item.itemid !== undefined) mapped.itemId = item.itemid
        if (item.customeremail !== undefined) mapped.customerEmail = item.customeremail
        if (item.postagecode !== undefined) mapped.postageCode = item.postagecode
    } else if (table === 'coupons') {
        if (item.minpurchase !== undefined) mapped.minPurchase = item.minpurchase
    } else if (table === 'products') {
        mapped.category = normalizeCategoryName(item.category)
        if (item.inpromocombo !== undefined) mapped.inPromoCombo = item.inpromocombo
        if (item.iscustomizable !== undefined) mapped.isCustomizable = item.iscustomizable
        if (item.custompricewith !== undefined) mapped.customPriceWith = item.custompricewith
        if (item.custompricewithout !== undefined) mapped.customPriceWithout = item.custompricewithout
        if (item.customfeeletter !== undefined) mapped.customFeeLetter = item.customfeeletter
        if (item.customfeenumber !== undefined) mapped.customFeeNumber = item.customfeenumber
        if (item.customfeeemoji !== undefined) mapped.customFeeEmoji = item.customfeeemoji
        if (item.customizable_emojis !== undefined) mapped.customizableEmojis = item.customizable_emojis
        
        // Normaliza colors e sizes do banco de dados (PG text array ou string delimitada por vírgula)
        if (item.colors) {
            if (typeof item.colors === 'string') {
                const clean = item.colors.replace(/[\{\}]/g, '')
                mapped.colors = clean.split(',').map(c => c.trim()).filter(Boolean)
            } else if (Array.isArray(item.colors)) {
                mapped.colors = item.colors.map(c => String(c).trim()).filter(Boolean)
            }
        } else {
            mapped.colors = []
        }

        if (item.sizes) {
            if (typeof item.sizes === 'string') {
                const clean = item.sizes.replace(/[\{\}]/g, '')
                mapped.sizes = clean.split(',').map(s => s.trim()).filter(Boolean)
            } else if (Array.isArray(item.sizes)) {
                mapped.sizes = item.sizes.map(s => String(s).trim()).filter(Boolean)
            }
        } else {
            mapped.sizes = []
        }
    } else if (table === 'store_config') {
        if (item.topbarmessages !== undefined) mapped.topbarMessages = item.topbarmessages
        if (item.topbarstyle !== undefined) mapped.topbarStyle = item.topbarstyle
        if (item.promocombo !== undefined) mapped.promoCombo = item.promocombo
        if (item.editorial !== undefined) mapped.editorial = item.editorial
        if (item.available_colors !== undefined) mapped.availableColors = item.available_colors
        if (item.available_emojis !== undefined) mapped.availableEmojis = item.available_emojis
        if (item.shipping_message !== undefined) mapped.shippingMessage = item.shipping_message
        if (item.available_badges !== undefined) mapped.availableBadges = item.available_badges
        if (item.installment_text !== undefined) mapped.installmentText = item.installment_text
        if (item.banner_transition !== undefined) mapped.bannerTransition = item.banner_transition
    }
    return mapped
}

export let isInitialSyncComplete = false
let isSyncing = false

export async function initSupabaseSync() {
    isSyncing = true
    try {
        console.log('🔄 Sincronizando tabelas com o Supabase...')
        
        // 1. Sync Products
        const { data: dbProducts, error: pError } = await supabase.from('products').select('*')
        if (!pError) {
            localStorage.setItem('meraki_products', JSON.stringify(dbProducts || []))
        }

        // 2. Sync Orders — always overwrite to clear stale cache
        const { data: dbOrders, error: oError } = await supabase.from('orders').select('*')
        if (!oError) {
            const mappedOrders = (dbOrders || []).map(o => mapDbToFrontend('orders', o))
            localStorage.setItem('meraki_orders', JSON.stringify(mappedOrders))
        }

        // 3. Sync Coupons — always overwrite to clear stale cache
        const { data: dbCoupons, error: cError } = await supabase.from('coupons').select('*')
        if (!cError) {
            const mappedCoupons = (dbCoupons || []).map(c => mapDbToFrontend('coupons', c))
            localStorage.setItem('meraki_coupons', JSON.stringify(mappedCoupons))
        }

        // 4. Sync Banners
        const { data: dbBanners, error: bError } = await supabase.from('banners').select('*')
        if (!bError) {
            localStorage.setItem('meraki_banners', JSON.stringify(dbBanners || []))
        }

        // 5. Sync Categories — always overwrite to clear stale cache
        const { data: dbCategories, error: catError } = await supabase.from('categories').select('*')
        if (!catError) {
            localStorage.setItem('meraki_categories', JSON.stringify(dbCategories || []))
        }

        // 6. Sync Returns — always overwrite to clear stale cache
        const { data: dbReturns, error: rError } = await supabase.from('returns').select('*')
        if (!rError) {
            const mappedReturns = (dbReturns || []).map(r => mapDbToFrontend('returns', r))
            localStorage.setItem('meraki_all_returns', JSON.stringify(mappedReturns))
        }

        // 7. Sync Store Config
        const { data: dbConfigRaw } = await supabase.from('store_config').select('*').eq('id', 'default').maybeSingle()
        const dbConfig = dbConfigRaw ? mapDbToFrontend('store_config', dbConfigRaw) : null
        
        if (dbConfig) {
            if (dbConfig.topbarStyle && dbConfig.topbarStyle.default_category_image) {
                dbConfig.default_category_image = dbConfig.topbarStyle.default_category_image
            }
            localStorage.setItem('meraki_store_config', JSON.stringify(dbConfig))
            // Extract and sync visual keys to individual localStorage items
            if (dbConfig.topbarMessages) localStorage.setItem('meraki_topbar_messages', JSON.stringify(dbConfig.topbarMessages))
            if (dbConfig.topbarStyle) {
                localStorage.setItem('meraki_topbar_style', JSON.stringify(dbConfig.topbarStyle))
                if (dbConfig.topbarStyle.availableSections) {
                    localStorage.setItem('meraki_sections', JSON.stringify(dbConfig.topbarStyle.availableSections))
                }
                const homeCats = dbConfig.topbarStyle.homepageCategories || [
                    { name: 'Home', description: 'Voltar para a página inicial', image: '/assets/categories/cat-conjuntos.jpg', link: '/' },
                    { name: 'Categorias', description: 'Navegar pelas nossas coleções', image: '/assets/categories/cat-noite.jpg', link: '/category/conjuntos' },
                    { name: 'Política de Troca', description: 'Regras e prazos para trocas de produtos', image: '/assets/categories/cat-sexy.jpg', link: '/returns' },
                    { name: 'Ofertas', description: 'Confira nossos produtos com descontos', image: '/assets/categories/cat-plus.jpg', link: '/category/ofertas' }
                ]
                localStorage.setItem('meraki_homepage_categories', JSON.stringify(homeCats))
            }
            if (dbConfig.promoCombo) localStorage.setItem('meraki_promo_combo', JSON.stringify(dbConfig.promoCombo))
            if (dbConfig.editorial) localStorage.setItem('meraki_editorial', JSON.stringify(dbConfig.editorial))
            localStorage.setItem('meraki_shipping_message', dbConfig.shippingMessage || 'Frete grátis para a região Centro-Oeste nas compras acima de R$ 299,90.')
        } else {
            const defaultConfig = {
                id: 'default',
                whatsapp: '551123880403',
                sac_phone: '(11) 2388-0403',
                address: 'Avenida Alfredo Nasser, Qd. 14, Lt. 05 - Centro, Bonfinópolis - GO, CEP: 75225-000',
                cnpj: '57.484.768/0064-89',
                infinitepay_handle: 'merakimodafeminina2026',
                topbarMessages: [
                    "✨ Frete Grátis acima de R$ 299 • Parcele em até 12x",
                    "Utilize o cupom BEMVIND010 em sua primeira compra!",
                    "Ganhe 5% de desconto pagando no PIX!"
                ],
                topbarStyle: { bgColor: '#C6A76A', textColor: '#FFFFFF' },
                promoCombo: {
                    title: 'Combo Sutiã',
                    subtitle: 'Do P ao EG. Diversos modelos para você escolher.',
                    image: '/assets/categories/cat-conjuntos.jpg',
                    price2Items: 139,
                    price3Items: 169,
                    link: '/category/promo-combo',
                    query: 'sutiã',
                    visible: true
                },
                editorial: {
                    label: 'Artesanal & Premium',
                    title: 'A arte de se sentir extraordinária.',
                    description: 'Cada costura, cada detalhe em renda foi pensado para elevar sua confiança e celebrar sua beleza única em todos os momentos.',
                    buttonText: 'Ver Manifesto',
                    buttonLink: '/story',
                    image: '/assets/banners/banner-2.jpg'
                },
                shippingMessage: 'Frete grátis para a região Centro-Oeste nas compras acima de R$ 299,90.'
            }
            localStorage.setItem('meraki_store_config', JSON.stringify(defaultConfig))
            localStorage.setItem('meraki_topbar_messages', JSON.stringify(defaultConfig.topbarMessages))
            localStorage.setItem('meraki_topbar_style', JSON.stringify(defaultConfig.topbarStyle))
            localStorage.setItem('meraki_promo_combo', JSON.stringify(defaultConfig.promoCombo))
            localStorage.setItem('meraki_editorial', JSON.stringify(defaultConfig.editorial))
            localStorage.setItem('meraki_shipping_message', defaultConfig.shippingMessage)
            const defaultHomeCats = [
                { name: 'Home', description: 'Voltar para a página inicial', image: '/assets/categories/cat-conjuntos.jpg', link: '/' },
                { name: 'Categorias', description: 'Navegar pelas nossas coleções', image: '/assets/categories/cat-noite.jpg', link: '/category/conjuntos' },
                { name: 'Política de Troca', description: 'Regras e prazos para trocas de produtos', image: '/assets/categories/cat-sexy.jpg', link: '/returns' },
                { name: 'Ofertas', description: 'Confira nossos produtos com descontos', image: '/assets/categories/cat-plus.jpg', link: '/category/ofertas' }
            ]
            localStorage.setItem('meraki_homepage_categories', JSON.stringify(defaultHomeCats))
        }

        console.log('✅ Sincronização concluída com sucesso.')
        
        // Dispatch global events to notify components that database sync is complete
        window.dispatchEvent(new Event('categoriesUpdated'))
        window.dispatchEvent(new Event('productsUpdated'))
        window.dispatchEvent(new Event('bannersUpdated'))
        window.dispatchEvent(new Event('couponsUpdated'))
        window.dispatchEvent(new Event('ordersUpdated'))
        window.dispatchEvent(new Event('returnsUpdated'))
        window.dispatchEvent(new Event('storeConfigUpdated'))
        window.dispatchEvent(new Event('homepageCategoriesUpdated'))
        window.dispatchEvent(new Event('topbarMessagesUpdated'))
        window.dispatchEvent(new Event('topbarStyleUpdated'))
        window.dispatchEvent(new Event('promoComboUpdated'))
        window.dispatchEvent(new Event('editorialUpdated'))
    } catch (e) {
        console.error('⚠️ Falha ao sincronizar dados com Supabase:', e)
    } finally {
        isSyncing = false
        isInitialSyncComplete = true
        window.dispatchEvent(new Event('meraki_db_synced'))
    }
}

// Start sync immediately
initSupabaseSync()

// Intercept LocalStorage writes to sync them back to Supabase
const originalSetItem = localStorage.setItem.bind(localStorage)

localStorage.setItem = function(key, value) {
    originalSetItem(key, value)
    
    if (isSyncing) return
    
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
            const categoriesWithDefaults = parsed.map(cat => ({
                group: 'Geral',
                ...cat,
            }))
            syncTableToSupabase('categories', categoriesWithDefaults)
        } else if (key.startsWith('meraki_returns_')) {
            const email = key.replace('meraki_returns_', '')
            const returnsWithEmail = parsed.map(ret => ({ ...ret, customerEmail: email }))
            syncTableToSupabase('returns', returnsWithEmail)
        } else if (key === 'meraki_store_config') {
            const payload = filterPayloadForTable('store_config', parsed)
            supabase.from('store_config').upsert(payload).then(() => {
                window.dispatchEvent(new Event('storeConfigUpdated'))
            })
        } else if (
            key === 'meraki_topbar_messages' ||
            key === 'meraki_topbar_style' ||
            key === 'meraki_promo_combo' ||
            key === 'meraki_editorial'
        ) {
            // Helper to sync subcomponents configs directly inside store_config record
            const currentConfig = JSON.parse(localStorage.getItem('meraki_store_config') || '{}')
            const mapping = {
                'meraki_topbar_messages': 'topbarMessages',
                'meraki_topbar_style': 'topbarStyle',
                'meraki_promo_combo': 'promoCombo',
                'meraki_editorial': 'editorial'
            }
            currentConfig[mapping[key]] = parsed
            originalSetItem('meraki_store_config', JSON.stringify(currentConfig))
            const payload = filterPayloadForTable('store_config', currentConfig)
            supabase.from('store_config').upsert(payload).then(() => {
                window.dispatchEvent(new Event('storeConfigUpdated'))
            })
        }
    } catch (e) {
        // Not JSON or non-sync key
    }
}

function filterPayloadForTable(table, item) {
    const allowedCols = TABLE_COLUMNS[table]
    if (!allowedCols) return item
    const payload = {}
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
    return payload
}

async function syncTableToSupabase(table, items) {
    if (!Array.isArray(items)) return
    try {
        const conflictKey = table === 'categories' ? 'name' : table === 'coupons' ? 'code' : 'id'

        // For local-first array tables, delete items from Supabase that are missing in the new list
        if (table === 'banners' || table === 'coupons' || table === 'categories') {
            const currentKeys = items.map(item => item[conflictKey]).filter(Boolean)
            if (currentKeys.length > 0) {
                const inList = `(${currentKeys.map(k => `"${k}"`).join(',')})`
                await supabase.from(table).delete().filter(conflictKey, 'not.in', inList)
            } else {
                if (conflictKey === 'id') {
                    await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
                } else if (conflictKey === 'name') {
                    await supabase.from(table).delete().neq('name', '___impossible_name___')
                } else if (conflictKey === 'code') {
                    await supabase.from(table).delete().neq('code', '___impossible_code___')
                }
            }
        }

        for (const item of items) {
            const payload = filterPayloadForTable(table, item)

            // If the item has a temporary numeric ID (like mock products/orders), Supabase will auto-generate a UUID if omitted
            if (payload.id && (payload.id.length < 10 || !isNaN(payload.id))) {
                delete payload.id // Let Supabase generate a proper UUID
            }

            const { error } = await supabase.from(table).upsert(payload, { onConflict: conflictKey })
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
        const mapped = (data || []).map(p => mapDbToFrontend('products', p))
        return { data: mapped, error: null }
    } catch (e) {
        return { data: [], error: e }
    }
}

export async function getProfiles() {
    try {
        const { data, error } = await supabase.from('profiles').select('*')
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
        return { data: data ? mapDbToFrontend('products', data) : null, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function getProductsBySection(section) {
    try {
        const { data, error } = await supabase.from('products').select('*').eq('section', section)
        if (error) throw error
        const mapped = (data || []).map(p => mapDbToFrontend('products', p))
        return { data: mapped, error: null }
    } catch (e) {
        return { data: [], error: e }
    }
}

export async function createProduct(product) {
    try {
        const payload = filterPayloadForTable('products', product)
        const { data, error } = await supabase.from('products').insert([payload]).select().single()
        if (error) throw error
        
        const mapped = mapDbToFrontend('products', data)
        // Update local cache
        const current = JSON.parse(localStorage.getItem('meraki_products') || '[]')
        current.unshift(mapped)
        originalSetItem('meraki_products', JSON.stringify(current))

        return { data: mapped, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function updateProduct(id, updates) {
    try {
        const payload = filterPayloadForTable('products', updates)
        const { data, error } = await supabase.from('products').update(payload).eq('id', id).select().single()
        if (error) throw error

        const mapped = mapDbToFrontend('products', data)
        // Update local cache
        const current = JSON.parse(localStorage.getItem('meraki_products') || '[]')
        const idx = current.findIndex(p => p.id === id)
        if (idx !== -1) {
            current[idx] = { ...current[idx], ...mapped }
            originalSetItem('meraki_products', JSON.stringify(current))
        }

        return { data: mapped, error: null }
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
        // Try uploading to Supabase Storage Bucket 'product-images'
        const fileExt = file.name.split('.').pop()
        const fileName = `products/${Math.random()}_${Date.now()}.${fileExt}`
        const { data, error } = await supabase.storage.from('product-images').upload(fileName, file)
        
        if (error) {
            console.error('Supabase upload error:', error.message)
            // Fallback to FileReader Base64 encoding if bucket is not configured
            return new Promise((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve({ url: reader.result, error: null })
                reader.onerror = (e) => resolve({ url: null, error: e })
                reader.readAsDataURL(file)
            })
        }

        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName)
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
        if (url.includes('/storage/v1/object/public/product-images/')) {
            const parts = url.split('/storage/v1/object/public/product-images/')
            if (parts.length > 1) {
                const pathInBucket = parts[1]
                await supabase.storage.from('product-images').remove([pathInBucket])
            }
        } else if (url.includes('/storage/v1/object/public/images/')) {
            const fileName = url.split('/').pop()
            await supabase.storage.from('images').remove([fileName])
        }
        return { error: null }
    } catch (e) {
        return { error: e }
    }
}

export async function createCategory(category) {
    try {
        const payload = filterPayloadForTable('categories', category)
        const { data, error } = await supabase.from('categories').insert([payload]).select().single()
        if (error) throw error

        // Update local cache
        const current = JSON.parse(localStorage.getItem('meraki_categories') || '[]')
        current.push(data)
        originalSetItem('meraki_categories', JSON.stringify(current))

        return { data, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function updateStoreConfig(config) {
    try {
        const payload = filterPayloadForTable('store_config', config)
        const { data, error } = await supabase.from('store_config').update(payload).eq('id', 'default').select().single()
        if (error) throw error

        const mapped = mapDbToFrontend('store_config', data)
        originalSetItem('meraki_store_config', JSON.stringify(mapped))
        return { data: mapped, error: null }
    } catch (e) {
        return { data: null, error: e }
    }
}

export async function clearProductBadges(badgeList) {
    try {
        const uppercaseList = badgeList.map(b => b.toUpperCase())
        
        // Fetch all products to check their badges
        const { data: products, error: fetchError } = await supabase.from('products').select('id, badge')
        if (fetchError) throw fetchError
        
        const productsToUpdate = (products || []).filter(p => p.badge && !uppercaseList.includes(p.badge.toUpperCase()))
        if (productsToUpdate.length === 0) return { success: true }
        
        const ids = productsToUpdate.map(p => p.id)
        const { error: updateError } = await supabase.from('products').update({ badge: '' }).in('id', ids)
        if (updateError) throw updateError
        
        // Update local cache
        const localProds = JSON.parse(localStorage.getItem('meraki_products') || '[]')
        const updatedLocal = localProds.map(p => {
            if (ids.includes(p.id)) return { ...p, badge: '' }
            return p
        })
        originalSetItem('meraki_products', JSON.stringify(updatedLocal))
        
        return { success: true, updatedIds: ids }
    } catch (e) {
        console.error('Error clearing product badges:', e)
        return { success: false, error: e }
    }
}
