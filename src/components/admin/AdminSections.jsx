import { useState, useEffect } from 'react'
import { supabase } from '../../services/supabase.js'
import { getAssetUrl } from '../../utils/assets.js'
import MediaDisplay from '../MediaDisplay.jsx'

function Icon({ path, className = 'w-5 h-5' }) {
    return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    )
}

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

// ─── SECTION 2: PRODUCTS ──────────────────────────────────────────────────────
export function ProductsSection({
    productsLoading,
    filteredProducts,
    searchQuery,
    setSearchQuery,
    setModal,
    setDeleteModal,
    paginatedProducts,
    getProductImage,
    sectionLabel,
    renderPagination,
    pPage,
    setPPage
}) {
    return (
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
                                        {['Produto', 'Categoria', 'Preço', 'Estoque', 'Seção', ''].map((h, i) => (
                                            <th key={i} className={`px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F8F8F8]">
                                    {paginatedProducts.map(p => (
                                        <tr key={p.id} className="hover:bg-[#FAF9F5] transition-colors group">
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-14 bg-gray-50 rounded-xl overflow-hidden border border-[#EEEEEE] shrink-0">
                                                        <img src={getProductImage(p)} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <span className="text-sm font-bold text-gray-900">{p.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-3 text-xs text-gray-500 font-semibold">{typeof p.category === 'object' && p.category !== null ? p.category.name : p.category}</td>
                                            <td className="px-6 py-3">
                                                <span className="text-sm font-black text-[#7A3E4A]">R$ {p.price?.toFixed(2)}</span>
                                            </td>
                                            <td className="px-6 py-3 text-xs text-gray-500 font-bold">{p.stock !== undefined ? p.stock : 10} un</td>
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
                        {paginatedProducts.map(p => (
                            <div key={p.id} className="bg-white rounded-2xl border border-[#EEEEEE] p-4 flex items-center gap-4">
                                <div className="w-14 h-18 bg-gray-50 rounded-xl overflow-hidden border border-[#EEEEEE] shrink-0">
                                    <img src={getProductImage(p)} alt="" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                                    <p className="text-[10px] text-gray-400 font-medium mb-1">{typeof p.category === 'object' && p.category !== null ? p.category.name : p.category} • Est: {p.stock !== undefined ? p.stock : 10} un • {sectionLabel(p.section)}</p>
                                    <p className="text-base font-black text-[#7A3E4A]">R$ {p.price?.toFixed(2)}</p>
                                </div>
                                <div className="flex flex-col gap-2 shrink-0">
                                    <button onClick={() => setModal({ open: true, editing: p.id })} className="px-3 py-1.5 text-[10px] font-bold bg-[#7A3E4A]/10 text-[#7A3E4A] rounded-lg cursor-pointer">Editar</button>
                                    <button onClick={() => setDeleteModal({ open: true, product: p })} className="px-3 py-1.5 text-[10px] font-bold bg-red-50 text-red-500 rounded-lg cursor-pointer">Excluir</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {renderPagination(pPage, filteredProducts.length, setPPage)}
                </>
            ) : (
                <div className="bg-white rounded-2xl border border-[#EEEEEE] py-16 text-center">
                    <Icon path="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-600 mb-1">Nenhum produto encontrado</p>
                    <p className="text-xs text-gray-400">Tente ajustar sua busca ou adicione um novo produto.</p>
                </div>
            )}
        </div>
    )
}

// ─── SECTION 3: ORDERS ────────────────────────────────────────────────────────
export function OrdersSection({
    orders,
    paginatedOrders,
    handleStatusChange,
    setSelectedOrder,
    renderPagination,
    oPage,
    setOPage
}) {
    return (
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
                                    {paginatedOrders.map(order => (
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
                                                    className="text-[10px] font-bold border rounded-full px-3 py-1.5 outline-none cursor-pointer bg-white transition-all border-[#EEEEEE]"
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
                        {paginatedOrders.map(order => (
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

                    {/* Pagination Controls */}
                    {renderPagination(oPage, orders.length, setOPage)}
                </>
            ) : (
                <div className="bg-white rounded-2xl border border-[#EEEEEE] py-20 text-center">
                    <Icon path="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-600 mb-1">Nenhum pedido registrado</p>
                    <p className="text-xs text-gray-400">Os pedidos dos clientes aparecerão aqui.</p>
                </div>
            )}
        </div>
    )
}

// ─── SECTION 4: COUPONS ───────────────────────────────────────────────────────
export function CouponsSection({
    coupons,
    paginatedCoupons,
    setCouponModal,
    handleOpenCreateCoupon,
    handleOpenEditCoupon,
    handleDeleteCoupon,
    renderPagination,
    cpPage,
    setCpPage
}) {
    const onNewCouponClick = handleOpenCreateCoupon || (() => setCouponModal(true))

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-black text-gray-900">Cupons Ativos</h2>
                    <p className="text-[10px] text-gray-400 font-medium">{coupons.length} cupom{coupons.length !== 1 ? 's' : ''} cadastrado{coupons.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={onNewCouponClick} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#7A3E4A] to-[#9A5060] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#7A3E4A]/30 transition-all cursor-pointer">
                    <Icon path="M12 4v16m8-8H4" className="w-4 h-4" /> Criar Cupom
                </button>
            </div>

            {coupons.length > 0 ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                        {paginatedCoupons.map(cp => (
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
                                    <div className="flex items-center gap-1.5">
                                        {handleOpenEditCoupon && (
                                            <button onClick={() => handleOpenEditCoupon(cp)} className="text-[10px] font-bold text-[#C6A76A] hover:text-[#7A3E4A] uppercase tracking-wider cursor-pointer px-2.5 py-1 rounded-lg hover:bg-[#C6A76A]/10 transition-all flex items-center gap-1">
                                                <Icon path="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" className="w-3 h-3" />
                                                Editar
                                            </button>
                                        )}
                                        <button onClick={() => handleDeleteCoupon(cp.id)} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50 transition-all">
                                             Remover
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {renderPagination(cpPage, coupons.length, setCpPage)}
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
    )
}

export function BannersSection({
    banners,
    setBannerModal,
    getAssetUrl,
    compressImage,
    uploadMultipleImages,
    handleUpdateBannerImage,
    handleUpdateBannerMobileImage,
    handleDeleteBanner,
    updateStoreConfig
}) {
    const [activeTransition, setActiveTransition] = useState(() => {
        try {
            const config = JSON.parse(localStorage.getItem('meraki_store_config') || '{}')
            return config.bannerTransition || 'shatter'
        } catch { return 'shatter' }
    })

    const TRANSITIONS = [
        {
            id: 'shatter',
            label: 'Estilhaçar',
            description: 'Pedaços voam para fora',
            preview: (
                <div className="relative w-full h-full overflow-hidden rounded-lg bg-gradient-to-br from-[#7A3E4A]/20 to-[#C6A76A]/20 flex items-center justify-center">
                    <div className="grid grid-cols-4 grid-rows-3 gap-0.5 w-10 h-8 opacity-70">
                        {Array.from({length:12}).map((_,i) => (
                            <div key={i} className="bg-[#7A3E4A] rounded-[1px]" style={{animation:`shatterPreview${i % 4} 2s ease-in-out infinite`, animationDelay:`${i*0.08}s`}} />
                        ))}
                    </div>
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-black text-[#7A3E4A] uppercase tracking-wider">💥 Estilhaçar</span>
                </div>
            )
        },
        {
            id: 'fade',
            label: 'Fade',
            description: 'Dissolve suavemente',
            preview: (
                <div className="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#7A3E4A]/80 to-[#C6A76A]/80" style={{animation:'fadePrev 2s ease-in-out infinite'}} />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#C6A76A]/80 to-[#7A3E4A]/80" style={{animation:'fadeNext 2s ease-in-out infinite'}} />
                    <span className="relative z-10 text-[8px] font-black text-white uppercase tracking-wider drop-shadow">🌫️ Fade</span>
                </div>
            )
        },
        {
            id: 'slideLeft',
            label: 'Deslizar →',
            description: 'Desliza horizontalmente',
            preview: (
                <div className="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center bg-gray-100">
                    <div className="absolute inset-0 flex">
                        <div className="w-1/2 h-full bg-gradient-to-r from-[#7A3E4A] to-[#9A5060]" style={{animation:'slideLeftPrev 2s ease-in-out infinite'}} />
                        <div className="w-1/2 h-full bg-gradient-to-r from-[#C6A76A] to-[#D4B878]" style={{animation:'slideLeftNext 2s ease-in-out infinite'}} />
                    </div>
                    <span className="relative z-10 text-[8px] font-black text-white uppercase tracking-wider drop-shadow">➡️ Deslizar</span>
                </div>
            )
        },
        {
            id: 'slideUp',
            label: 'Deslizar ↑',
            description: 'Sobe de baixo para cima',
            preview: (
                <div className="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center bg-gray-100">
                    <div className="absolute inset-0 flex flex-col">
                        <div className="h-1/2 w-full bg-gradient-to-b from-[#7A3E4A] to-[#9A5060]" style={{animation:'slideUpPrev 2s ease-in-out infinite'}} />
                        <div className="h-1/2 w-full bg-gradient-to-b from-[#C6A76A] to-[#D4B878]" style={{animation:'slideUpNext 2s ease-in-out infinite'}} />
                    </div>
                    <span className="relative z-10 text-[8px] font-black text-white uppercase tracking-wider drop-shadow">⬆️ Deslizar Cima</span>
                </div>
            )
        },
        {
            id: 'zoom',
            label: 'Zoom',
            description: 'Zoom de entrada suave',
            preview: (
                <div className="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center bg-gradient-to-br from-[#7A3E4A] to-[#C6A76A]">
                    <div className="w-8 h-6 rounded bg-white/30" style={{animation:'zoomPrev 2s ease-in-out infinite'}} />
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-black text-white uppercase tracking-wider">🔍 Zoom</span>
                </div>
            )
        },
        {
            id: 'flip',
            label: 'Virar',
            description: 'Vira como uma página',
            preview: (
                <div className="relative w-full h-full overflow-hidden rounded-lg flex items-center justify-center" style={{perspective:'200px'}}>
                    <div className="w-10 h-7 rounded bg-gradient-to-r from-[#7A3E4A] to-[#C6A76A]" style={{animation:'flipPrev 2s ease-in-out infinite', transformStyle:'preserve-3d'}} />
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[8px] font-black text-[#7A3E4A] uppercase tracking-wider">🔄 Virar</span>
                </div>
            )
        }
    ]

    const saveTransition = async (id) => {
        setActiveTransition(id)
        const config = JSON.parse(localStorage.getItem('meraki_store_config') || '{}')
        const updated = { ...config, bannerTransition: id }
        localStorage.setItem('meraki_store_config', JSON.stringify(updated))
        window.dispatchEvent(new Event('storeConfigUpdated'))
        if (updateStoreConfig) {
            await updateStoreConfig({ banner_transition: id })
        }
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-black text-gray-900">Banners do Carrossel</h2>
                    <p className="text-[10px] text-gray-400 font-medium">
                        {banners.length} banner{banners.length !== 1 ? 's' : ''} ativo{banners.length !== 1 ? 's' : ''} • <span className="text-[#C6A76A] font-bold">Responsivo (Desktop + Mobile)</span>
                    </p>
                </div>
                <button onClick={() => setBannerModal(true)} className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#7A3E4A] to-[#9A5060] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#7A3E4A]/30 transition-all cursor-pointer">
                    <Icon path="M12 4v16m8-8H4" className="w-4 h-4" /> Adicionar Banner
                </button>
            </div>

            {/* ─── Transition Selector ──────────────────────────────────────────── */}
            <style>{`
                @keyframes fadePrev { 0%,100%{opacity:1} 50%{opacity:0} }
                @keyframes fadeNext { 0%,100%{opacity:0} 50%{opacity:1} }
                @keyframes slideLeftPrev { 0%,100%{transform:translateX(0)} 50%{transform:translateX(-100%)} }
                @keyframes slideLeftNext { 0%,100%{transform:translateX(100%)} 50%{transform:translateX(0)} }
                @keyframes slideUpPrev { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-100%)} }
                @keyframes slideUpNext { 0%,100%{transform:translateY(100%)} 50%{transform:translateY(0)} }
                @keyframes zoomPrev { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:0} }
                @keyframes flipPrev { 0%,100%{transform:rotateY(0deg)} 50%{transform:rotateY(90deg)} }
            `}</style>
            <div className="bg-white p-5 rounded-2xl border border-[#EEEEEE] space-y-4">
                <div>
                    <h4 className="text-[10px] font-black text-[#7A3E4A] uppercase tracking-widest">Efeito de Transição do Banner</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">Escolha como os banners mudam entre si. Clique para selecionar.</p>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {TRANSITIONS.map(t => (
                        <button
                            key={t.id}
                            type="button"
                            onClick={() => saveTransition(t.id)}
                            className={`relative flex flex-col rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer group ${
                                activeTransition === t.id
                                    ? 'border-[#7A3E4A] shadow-lg shadow-[#7A3E4A]/20 scale-[1.03]'
                                    : 'border-[#EEEEEE] hover:border-[#7A3E4A]/40 hover:scale-[1.02]'
                            }`}
                        >
                            {/* Animated preview */}
                            <div className="aspect-[4/3] w-full bg-gray-50 relative">
                                {t.preview}
                            </div>
                            {/* Label */}
                            <div className={`py-2 px-1 text-center text-[9px] font-black uppercase tracking-wider transition-colors ${
                                activeTransition === t.id ? 'bg-[#7A3E4A] text-white' : 'bg-white text-gray-500'
                            }`}>
                                {t.label}
                            </div>
                            {/* Active checkmark */}
                            {activeTransition === t.id && (
                                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#7A3E4A] rounded-full flex items-center justify-center">
                                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
                <p className="text-[10px] text-[#7A3E4A] font-semibold">
                    ✓ Ativo: <span className="font-black">{TRANSITIONS.find(t => t.id === activeTransition)?.label}</span> — {TRANSITIONS.find(t => t.id === activeTransition)?.description}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map(bn => (
                    <div key={bn.id} className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden hover:border-[#7A3E4A]/20 hover:shadow-lg transition-all group p-4 space-y-4">
                        {/* Previews: Widescreen Desktop + Vertical Mobile side-by-side */}
                        <div className="grid grid-cols-3 gap-3">
                            {/* Desktop preview (2/3 width) */}
                            <div className="col-span-2 space-y-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Desktop (Foto/Vídeo/GIF)</span>
                                <div className="aspect-[16/7] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center relative">
                                    {bn.image ? (
                                        <MediaDisplay src={bn.image} alt={bn.alt} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-2 text-[8px] text-gray-300 font-bold">Sem mídia desktop</div>
                                    )}
                                </div>
                            </div>
                            {/* Mobile preview (1/3 width) */}
                            <div className="col-span-1 space-y-1">
                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Mobile (Foto/Vídeo/GIF)</span>
                                <div className="aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center relative">
                                    {bn.mobile_image ? (
                                        <MediaDisplay src={bn.mobile_image} alt={bn.alt} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-2 text-[8px] text-gray-300 font-bold">Sem mídia mobile</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2 border-t border-[#EEEEEE]/60">
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Texto Alternativo (Alt)</p>
                                    <p className="text-xs font-semibold text-gray-700 truncate max-w-[200px]">{bn.alt}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-[#C6A76A] uppercase tracking-widest">Link de Destino</p>
                                    <p className="text-[10px] font-bold text-gray-500 truncate max-w-[120px]">{bn.link}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                {/* Change Desktop Image/Video/GIF */}
                                <div>
                                    <button
                                        onClick={() => document.getElementById(`change-banner-desk-${bn.id}`).click()}
                                        className="w-full py-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                                    >
                                        Mídia Desktop 🎥/🖼️
                                    </button>
                                    <p className="text-[8px] text-gray-400 text-center mt-1">(Foto, GIF ou Vídeo MP4/WebM)</p>
                                    <input 
                                        id={`change-banner-desk-${bn.id}`}
                                        type="file" 
                                        accept="image/*,video/*,.gif,.mp4,.webm,.mov" 
                                        onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                const { urls } = await uploadMultipleImages([e.target.files[0]])
                                                if (urls?.[0]) {
                                                    handleUpdateBannerImage(bn.id, urls[0])
                                                }
                                            }
                                        }}
                                        className="hidden" 
                                    />
                                </div>

                                {/* Change Mobile Image/Video/GIF */}
                                <div>
                                    <button
                                        onClick={() => document.getElementById(`change-banner-mob-${bn.id}`).click()}
                                        className="w-full py-2 rounded-xl bg-[#7A3E4A]/10 text-[#7A3E4A] hover:bg-[#7A3E4A]/20 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                                    >
                                        Mídia Mobile 🎥/🖼️
                                    </button>
                                    <p className="text-[8px] text-[#7A3E4A] text-center mt-1">(Foto, GIF ou Vídeo MP4/WebM)</p>
                                    <input 
                                        id={`change-banner-mob-${bn.id}`}
                                        type="file" 
                                        accept="image/*,video/*,.gif,.mp4,.webm,.mov" 
                                        onChange={async (e) => {
                                            if (e.target.files?.[0]) {
                                                const { urls } = await uploadMultipleImages([e.target.files[0]])
                                                if (urls?.[0]) {
                                                    handleUpdateBannerMobileImage(bn.id, urls[0])
                                                }
                                            }
                                        }}
                                        className="hidden" 
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => handleDeleteBanner(bn.id)}
                                className="w-full py-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
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
    )
}


// ─── SECTION 6: PROMO COMBO CONFIG ────────────────────────────────────────────
export function PromoComboSection({
    promoCombo,
    setPromoCombo,
    saving,
    setSaving,
    compressImage,
    uploadMultipleImages,
    getAssetUrl
}) {
    return (
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
                            const compressedFile = await compressImage(files[0], 1600)
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
                                        defaultValue={promoCombo.price2Items ?? 139}
                                        required
                                        className="w-full pl-8 pr-3 py-2 border border-[#EEEEEE] focus:border-[#7A3E4A] focus:ring-2 focus:ring-[#7A3E4A]/10 rounded-xl text-sm font-bold outline-none"
                                    />
                                </div>
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
                                        defaultValue={promoCombo.price3Items ?? 169}
                                        required
                                        className="w-full pl-8 pr-3 py-2 border border-[#EEEEEE] focus:border-[#7A3E4A] focus:ring-2 focus:ring-[#7A3E4A]/10 rounded-xl text-sm font-bold outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Descrição / Subtítulo</label>
                            <input type="text" name="promoSubtitle" defaultValue={promoCombo.subtitle} required className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Upload de Imagem</label>
                            <input type="file" name="promoImage" accept="image/*,video/*,.gif,.mp4,.webm,.mov" className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#7A3E4A]/10 file:text-[#7A3E4A] hover:file:bg-[#7A3E4A]/20 cursor-pointer" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        {promoCombo.image && (
                            <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#EEEEEE] bg-gray-50 flex items-center justify-center">
                                <img src={getAssetUrl(promoCombo.image)} alt="Preview" className="max-w-full max-h-full object-contain" />
                            </div>
                        )}
                        <button type="submit" disabled={saving} className="px-5 py-3 bg-[#7A3E4A] hover:bg-[#603039] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 self-end">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── SECTION 7: EDITORIAL CONFIG ──────────────────────────────────────────────
export function EditorialSection({
    editorial,
    setEditorial,
    saving,
    setSaving,
    compressImage,
    uploadMultipleImages,
    getAssetUrl
}) {
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-sm font-black text-gray-900">Manifesto Editorial</h2>
                <p className="text-[10px] text-gray-400 font-medium font-sans">Altere a imagem e as frases da seção do manifesto editorial na Home page.</p>
            </div>

            <div className="bg-white rounded-2xl border border-[#EEEEEE] p-5">
                <form 
                    onSubmit={async (e) => {
                        e.preventDefault()
                        const form = e.target
                        const label = form.edLabel.value.trim()
                        const title = form.edTitle.value.trim()
                        const description = form.edDescription.value.trim()
                        const buttonText = form.edButtonText.value.trim()
                        const files = form.edImage.files

                        setSaving(true)
                        let imageUrl = editorial.image
                        if (files?.[0]) {
                            const compressedFile = await compressImage(files[0], 1600)
                            const { urls } = await uploadMultipleImages([compressedFile])
                            if (urls?.[0]) imageUrl = urls[0]
                        }

                        const updated = {
                            label,
                            title,
                            description,
                            buttonText,
                            buttonLink: '/story',
                            image: imageUrl
                        }
                        setEditorial(updated)
                        localStorage.setItem('meraki_editorial', JSON.stringify(updated))
                        window.dispatchEvent(new Event('editorialUpdated'))
                        setSaving(false)
                        alert('Manifesto Editorial atualizado com sucesso!')
                    }}
                    className="space-y-4"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Etiqueta / Tag (Pequena)</label>
                            <input type="text" name="edLabel" defaultValue={editorial.label} required className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Título do Manifesto</label>
                            <input type="text" name="edTitle" defaultValue={editorial.title} required className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Texto de Descrição</label>
                        <textarea name="edDescription" rows="3" defaultValue={editorial.description} required className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none resize-none" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Texto do Botão</label>
                        <input type="text" name="edButtonText" defaultValue={editorial.buttonText} required className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Upload de Imagem</label>
                        <input type="file" name="edImage" accept="image/*,video/*,.gif,.mp4,.webm,.mov" className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#7A3E4A]/10 file:text-[#7A3E4A] hover:file:bg-[#7A3E4A]/20 cursor-pointer" />
                    </div>

                    <div className="flex gap-4 pt-2">
                        {editorial.image && (
                            <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#EEEEEE]">
                                <img src={getAssetUrl(editorial.image)} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <button type="submit" disabled={saving} className="px-5 py-3 bg-[#7A3E4A] hover:bg-[#603039] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 self-end">
                            Salvar Alterações
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// ─── SECTION 8: CATEGORIES ────────────────────────────────────────────────────
export function CategoriesSection({
    categories,
    setCategories,
    saving,
    setSaving,
    compressImage,
    uploadMultipleImages,
    getAssetUrl,
    homepageCategories = [],
    setHomepageCategories,
    saveHomepageCategoriesToConfig
}) {
    const [editingIndex, setEditingIndex] = useState(null)
    const [catName, setCatName] = useState('')
    const [catGroup, setCatGroup] = useState('Lingerie')
    const [catDescription, setCatDescription] = useState('')

    const [editingHomeIdx, setEditingHomeIdx] = useState(null)
    const [homeCatName, setHomeCatName] = useState('')
    const [homeCatDescription, setHomeCatDescription] = useState('')
    const [homeCatLink, setHomeCatLink] = useState('')

    const [defaultCategoryImage, setDefaultCategoryImage] = useState(() => {
        const stored = JSON.parse(localStorage.getItem('meraki_store_config') || '{}')
        return stored.default_category_image || categories?.[0]?.image || '/assets/categories/cat-sexy.jpg'
    })

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('meraki_store_config') || '{}')
        if (stored.default_category_image) {
            setDefaultCategoryImage(stored.default_category_image)
        } else if (categories && categories.length > 0 && categories[0]?.image) {
            setDefaultCategoryImage(categories[0].image)
        }
    }, [categories])

    const resetForm = () => {
        setEditingIndex(null)
        setCatName('')
        setCatGroup('Lingerie')
        setCatDescription('')
    }

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-sm font-black text-gray-900">Categorias da Loja</h2>
                <p className="text-[10px] text-gray-400 font-medium">{categories.length} categoria{categories.length !== 1 ? 's' : ''} cadastrada{categories.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Formulário de Cadastro/Edição */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EEEEEE] p-5">
                    <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
                        {editingIndex !== null ? 'Editar Categoria' : 'Nova Categoria'}
                    </h3>
                    <form 
                        onSubmit={async (e) => {
                            e.preventDefault()
                            const form = e.target
                            const name = catName.trim()
                            const group = catGroup
                            const description = catDescription.trim()
                            const files = form.catImage.files
                            
                            if (!name) return
                            setSaving(true)
                            
                            let imageUrl = '/placeholder.jpg'
                            if (editingIndex !== null) {
                                imageUrl = categories[editingIndex].image || '/placeholder.jpg'
                            }
                            
                            if (files?.[0]) {
                                const compressedFile = await compressImage(files[0], 1200)
                                const { urls } = await uploadMultipleImages([compressedFile])
                                if (urls?.[0]) imageUrl = urls[0]
                            }

                            const catObj = { name, group, description, image: imageUrl }
                            
                            let updated
                            if (editingIndex !== null) {
                                updated = categories.map((c, i) => i === editingIndex ? catObj : c)
                            } else {
                                updated = [...categories, catObj]
                            }
                            
                            setCategories(updated)
                            localStorage.setItem('meraki_categories', JSON.stringify(updated))
                            window.dispatchEvent(new Event('categoriesUpdated'))
                            form.reset()
                            resetForm()
                            setSaving(false)
                        }}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Nome da Categoria</label>
                                <input 
                                    type="text" 
                                    name="catName" 
                                    required 
                                    value={catName}
                                    onChange={e => setCatName(e.target.value)}
                                    placeholder="Ex: Lingerie Luxo" 
                                    className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" 
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Grupo do Mega Menu</label>
                                <select 
                                    name="catGroup" 
                                    value={catGroup}
                                    onChange={e => setCatGroup(e.target.value)}
                                    className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none bg-white"
                                >
                                    <option value="Lingerie">Lingerie</option>
                                    <option value="Noite & Especiais">Noite & Especiais</option>
                                    <option value="Destaques">Destaques</option>
                                    <option value="Sensual">Sensual</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Imagem de Capa</label>
                                <input type="file" name="catImage" accept="image/*,video/*,.gif,.mp4,.webm,.mov" className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#7A3E4A]/10 file:text-[#7A3E4A] hover:file:bg-[#7A3E4A]/20 cursor-pointer" />
                                {editingIndex !== null && (
                                    <p className="text-[9px] text-gray-400 mt-1">Deixe em branco para manter a imagem atual</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Descrição</label>
                            <input 
                                type="text" 
                                name="catDescription" 
                                value={catDescription}
                                onChange={e => setCatDescription(e.target.value)}
                                placeholder="Breve descrição da categoria..." 
                                className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" 
                            />
                        </div>
                        <div className="flex gap-2">
                            <button type="submit" disabled={saving} className="px-5 py-3 bg-[#7A3E4A] hover:bg-[#603039] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50">
                                {editingIndex !== null ? 'Salvar Alterações' : 'Cadastrar Categoria'}
                            </button>
                            {editingIndex !== null && (
                                <button 
                                    type="button" 
                                    onClick={resetForm}
                                    className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                                >
                                    Cancelar
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Imagem Padrão do Menu */}
                <div className="bg-white rounded-2xl border border-[#EEEEEE] p-5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Imagem Padrão do Menu</h3>
                        <p className="text-[10px] text-gray-400 font-semibold mb-4 leading-relaxed">
                            Esta imagem será exibida no painel do Mega Menu quando nenhuma categoria estiver sendo selecionada com o cursor.
                        </p>
                        
                        <div className="w-full h-32 rounded-xl overflow-hidden border border-[#EEEEEE] bg-gray-50 mb-4 relative group">
                            <MediaDisplay src={defaultCategoryImage} alt="Imagem Padrão do Menu" className="w-full h-full object-cover" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <input 
                            type="file" 
                            accept="image/*,video/*,.gif,.mp4,.webm,.mov" 
                            id="defaultCatImageInput"
                            onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                setSaving(true)
                                try {
                                    const compressed = await compressImage(file, 1200)
                                    const { urls } = await uploadMultipleImages([compressed])
                                    if (urls?.[0]) {
                                        const stored = JSON.parse(localStorage.getItem('meraki_store_config') || '{}')
                                        const newConfig = { ...stored, id: 'default', default_category_image: urls[0] }
                                        localStorage.setItem('meraki_store_config', JSON.stringify(newConfig))
                                        
                                        try {
                                            const currentStyle = JSON.parse(localStorage.getItem('meraki_topbar_style') || '{"bgColor": "#C6A76A", "textColor": "#FFFFFF"}')
                                            const newStyle = { ...currentStyle, default_category_image: urls[0] }
                                            localStorage.setItem('meraki_topbar_style', JSON.stringify(newStyle))
                                        } catch (err) {
                                            console.error(err)
                                        }
                                        
                                        window.dispatchEvent(new Event('storeConfigUpdated'))
                                        setDefaultCategoryImage(urls[0])
                                    }
                                } catch (err) {
                                    console.error(err)
                                }
                                setSaving(false)
                            }}
                            className="hidden" 
                        />
                        <button 
                            type="button" 
                            disabled={saving}
                            onClick={() => document.getElementById('defaultCatImageInput').click()}
                            className="w-full py-3 bg-[#7A3E4A]/10 hover:bg-[#7A3E4A]/15 text-[#7A3E4A] text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center disabled:opacity-50"
                        >
                            Alterar Imagem Padrão
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {categories.map((cat, idx) => {
                    const cName = typeof cat === 'object' ? cat.name : cat
                    const cDesc = typeof cat === 'object' ? cat.description : 'Coleção Meraki'
                    const cImage = typeof cat === 'object' ? cat.image : '/placeholder.jpg'
                    const cGroup = typeof cat === 'object' ? cat.group : 'Lingerie'

                    return (
                        <div key={idx} className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden hover:border-[#7A3E4A]/20 hover:shadow-lg transition-all group flex flex-col justify-between">
                            <div className="flex gap-4 p-4">
                                <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#EEEEEE] shrink-0 bg-gray-50">
                                    <img src={getAssetUrl(cImage)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-800 truncate">{cName}</p>
                                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{cGroup}</p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">{cDesc}</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 border-t border-[#F8F8F8] flex justify-end gap-2">
                                <button 
                                    onClick={() => {
                                        setEditingIndex(idx)
                                        setCatName(cName)
                                        setCatGroup(cGroup)
                                        setCatDescription(cDesc)
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                    }}
                                    className="text-[9px] font-bold text-[#C6A76A] hover:text-[#b09054] uppercase tracking-widest cursor-pointer px-2 py-1 rounded-lg hover:bg-[#C6A76A]/10 transition-all"
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={() => {
                                        const updated = categories.filter((_, i) => i !== idx)
                                        setCategories(updated)
                                        localStorage.setItem('meraki_categories', JSON.stringify(updated))
                                        window.dispatchEvent(new Event('categoriesUpdated'))
                                        if (editingIndex === idx) resetForm()
                                    }}
                                    className="text-[9px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Divisor */}
            <div className="h-px bg-[#EEEEEE] my-10" />

            {/* Categorias da Home */}
            <div className="space-y-5">
                <div>
                    <h2 className="text-sm font-black text-gray-900">Categorias em Destaque na Home</h2>
                    <p className="text-[10px] text-gray-400 font-medium">Estes são os 4 cartões com foto exibidos logo no início da página inicial (ex: Home, Categorias, Trocas, Ofertas).</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Formulário de Edição */}
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-[#EEEEEE] p-5">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-4">
                            {editingHomeIdx !== null ? 'Editar Cartão da Home' : 'Novo Cartão da Home'}
                        </h3>
                        <form 
                            onSubmit={async (e) => {
                                e.preventDefault()
                                const form = e.target
                                const name = homeCatName.trim()
                                const description = homeCatDescription.trim()
                                const link = homeCatLink.trim()
                                const files = form.homeCatImage.files
                                
                                if (!name) return
                                setSaving(true)
                                
                                let imageUrl = '/placeholder.jpg'
                                if (editingHomeIdx !== null) {
                                    imageUrl = homepageCategories[editingHomeIdx].image || '/placeholder.jpg'
                                }
                                
                                if (files?.[0]) {
                                    const compressedFile = await compressImage(files[0], 1200)
                                    const { urls } = await uploadMultipleImages([compressedFile])
                                    if (urls?.[0]) imageUrl = urls[0]
                                } else if (form.homeCatImageUrl?.value) {
                                    imageUrl = form.homeCatImageUrl.value.trim()
                                }
                                
                                const cardObj = { name, description, image: imageUrl, link }
                                
                                let updated
                                if (editingHomeIdx !== null) {
                                    updated = homepageCategories.map((c, i) => i === editingHomeIdx ? cardObj : c)
                                } else {
                                    updated = [...homepageCategories, cardObj]
                                }
                                
                                setHomepageCategories(updated)
                                await saveHomepageCategoriesToConfig(updated)
                                form.reset()
                                setEditingHomeIdx(null)
                                setHomeCatName('')
                                setHomeCatDescription('')
                                setHomeCatLink('')
                                setSaving(false)
                            }}
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Título do Cartão</label>
                                    <input 
                                        type="text" 
                                        name="homeCatName" 
                                        required 
                                        value={homeCatName}
                                        onChange={e => setHomeCatName(e.target.value)}
                                        placeholder="Ex: Lançamentos" 
                                        className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Link de Redirecionamento</label>
                                    <input 
                                        type="text" 
                                        name="homeCatLink" 
                                        required 
                                        value={homeCatLink}
                                        onChange={e => setHomeCatLink(e.target.value)}
                                        placeholder="Ex: /category/novidades ou https://..." 
                                        className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" 
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Fazer Upload da Imagem</label>
                                    <input type="file" name="homeCatImage" accept="image/*,video/*,.gif,.mp4,.webm,.mov" className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#7A3E4A]/10 file:text-[#7A3E4A] hover:file:bg-[#7A3E4A]/20 cursor-pointer" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Ou Link da Imagem (Opcional)</label>
                                    <input 
                                        type="text" 
                                        name="homeCatImageUrl" 
                                        placeholder="Ex: https://images.unsplash.com/..." 
                                        className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Descrição / Subtítulo</label>
                                <input 
                                    type="text" 
                                    name="homeCatDescription" 
                                    value={homeCatDescription}
                                    onChange={e => setHomeCatDescription(e.target.value)}
                                    placeholder="Ex: Curadoria exclusiva das melhores peças" 
                                    className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" 
                                />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" disabled={saving} className="px-5 py-3 bg-[#7A3E4A] hover:bg-[#603039] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50">
                                    {editingHomeIdx !== null ? 'Salvar Alterações' : 'Cadastrar Cartão'}
                                </button>
                                {editingHomeIdx !== null && (
                                    <button 
                                        type="button" 
                                        onClick={() => {
                                            setEditingHomeIdx(null)
                                            setHomeCatName('')
                                            setHomeCatDescription('')
                                            setHomeCatLink('')
                                        }}
                                        className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                                    >
                                        Cancelar
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl border border-[#EEEEEE] p-5">
                        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Dica de Layout</h3>
                        <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                            O design do site foi otimizado para exibir exatamente **4 cartões** alinhados. Para manter o visual harmônico das 4 colunas na Home, recomendamos manter exatamente 4 itens cadastrados na lista.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {homepageCategories.map((card, idx) => (
                        <div key={idx} className="bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden hover:border-[#7A3E4A]/20 hover:shadow-lg transition-all group flex flex-col justify-between">
                            <div className="flex gap-4 p-4">
                                <div className="w-14 h-14 rounded-xl overflow-hidden border border-[#EEEEEE] shrink-0 bg-gray-50">
                                    <img src={getAssetUrl(card.image)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-800 truncate">{card.name}</p>
                                    <p className="text-[9px] text-[#7A3E4A] font-bold uppercase tracking-wider mb-1">{card.link}</p>
                                    <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-2">{card.description}</p>
                                </div>
                            </div>
                            <div className="px-4 py-2 border-t border-[#F8F8F8] flex justify-end gap-2">
                                <button 
                                    onClick={() => {
                                        setEditingHomeIdx(idx)
                                        setHomeCatName(card.name)
                                        setHomeCatDescription(card.description)
                                        setHomeCatLink(card.link)
                                        window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' })
                                    }}
                                    className="text-[9px] font-bold text-[#C6A76A] hover:text-[#b09054] uppercase tracking-widest cursor-pointer px-2 py-1 rounded-lg hover:bg-[#C6A76A]/10 transition-all"
                                >
                                    Editar
                                </button>
                                <button 
                                    onClick={async () => {
                                        const updated = homepageCategories.filter((_, i) => i !== idx)
                                        setHomepageCategories(updated)
                                        await saveHomepageCategoriesToConfig(updated)
                                        if (editingHomeIdx === idx) {
                                            setEditingHomeIdx(null)
                                            setHomeCatName('')
                                            setHomeCatDescription('')
                                            setHomeCatLink('')
                                        }
                                    }}
                                    className="text-[9px] font-bold text-red-400 hover:text-red-600 uppercase tracking-widest cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50 transition-all"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ─── SECTION 9: CUSTOMERS ─────────────────────────────────────────────────────
export function CustomersSection({
    customers,
    paginatedCustomers,
    renderPagination,
    cPage,
    setCPage
}) {
    return (
        <div className="space-y-5">
            {customers.length > 0 ? (
                <>
                    <div className="hidden md:block bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[#F5F5F5]">
                                        {['Cliente', 'CPF', 'Telefone', 'Tipo'].map((h, i) => (
                                            <th key={i} className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F8F8F8]">
                                    {paginatedCustomers.map(c => (
                                        <tr key={c.id} className="hover:bg-[#FAF9F5] transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-800">{c.full_name}</p>
                                                <p className="text-[10px] text-gray-400">{c.email}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-medium">{c.cpf || 'Não cadastrado'}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-medium">{c.phone || 'Não cadastrado'}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${c.tipo_user === 'admin' ? 'bg-[#7A3E4A]/10 text-[#7A3E4A]' : 'bg-gray-100 text-gray-600'}`}>
                                                    {c.tipo_user === 'admin' ? 'Admin' : 'Cliente'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="md:hidden space-y-3">
                        {paginatedCustomers.map(c => (
                            <div key={c.id} className="bg-white rounded-2xl border border-[#EEEEEE] p-4 space-y-2">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{c.full_name}</p>
                                    <p className="text-[10px] text-gray-400">{c.email}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-[#F5F5F5]">
                                    <p className="text-gray-500 font-medium">CPF: <span className="font-bold text-gray-700">{c.cpf || 'Não cadastrado'}</span></p>
                                    <p className="text-gray-500 font-medium">Tel: <span className="font-bold text-gray-700">{c.phone || 'Não cadastrado'}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {renderPagination(cPage, customers.length, setCPage)}
                </>
            ) : (
                <div className="bg-white rounded-2xl border border-[#EEEEEE] py-20 text-center">
                    <Icon path="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-600 mb-1">Nenhum cliente cadastrado</p>
                </div>
            )}
        </div>
    )
}

// ─── SECTION 10: RETURNS ──────────────────────────────────────────────────────
export function ReturnsSection({
    returns,
    paginatedReturns,
    setSelectedReturn,
    renderPagination,
    rPage,
    setRPage
}) {
    return (
        <div className="space-y-5">
            {returns.length > 0 ? (
                <>
                    <div className="hidden md:block bg-white rounded-2xl border border-[#EEEEEE] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-[#F5F5F5]">
                                        {['Pedido', 'Cliente', 'Tipo', 'Data', 'Status', ''].map((h, i) => (
                                            <th key={i} className={`px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i === 5 ? 'text-right' : ''}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#F8F8F8]">
                                    {paginatedReturns.map(ret => (
                                        <tr key={ret.id} className="hover:bg-[#FAF9F5] transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs font-bold text-gray-500">#{ret.orderId?.slice(-6)}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-gray-800">{ret.customerName}</p>
                                                <p className="text-[10px] text-gray-400">{ret.customerEmail}</p>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#7A3E4A]">{ret.type === 'refund' ? 'Reembolso' : 'Troca'}</td>
                                            <td className="px-6 py-4 text-xs text-gray-500 font-medium">{new Date(ret.created_at).toLocaleDateString('pt-BR')}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[9px] font-bold ${
                                                    ret.status === 'Pendente' ? 'bg-amber-50 text-amber-700' :
                                                    ret.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                                }`}>
                                                    {ret.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => setSelectedReturn(ret)} className="px-4 py-2 bg-[#7A3E4A]/10 hover:bg-[#7A3E4A] text-[#7A3E4A] hover:text-white text-[10px] font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider">
                                                    Analisar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="md:hidden space-y-3">
                        {paginatedReturns.map(ret => (
                            <div key={ret.id} className="bg-white rounded-2xl border border-[#EEEEEE] p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{ret.customerName}</p>
                                        <p className="text-[10px] text-[#7A3E4A] font-bold uppercase tracking-wider">{ret.type === 'refund' ? 'Reembolso' : 'Troca'}</p>
                                    </div>
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                        ret.status === 'Pendente' ? 'bg-amber-50 text-amber-700' :
                                        ret.status === 'Aprovado' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                                    }`}>{ret.status}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-[#F5F5F5]">
                                    <span className="text-[10px] text-gray-400 font-mono">#{ret.orderId?.slice(-6)}</span>
                                    <button onClick={() => setSelectedReturn(ret)} className="px-4 py-2 bg-[#7A3E4A] text-white text-[10px] font-bold rounded-xl cursor-pointer">Analisar</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {renderPagination(rPage, returns.length, setRPage)}
                </>
            ) : (
                <div className="bg-white rounded-2xl border border-[#EEEEEE] py-20 text-center">
                    <Icon path="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-gray-600 mb-1">Nenhuma solicitação de troca</p>
                </div>
            )}
        </div>
    )
}

// ─── SECTION 8: STORE SETTINGS ────────────────────────────────────────────────
export function SettingsSection({ saving, setSaving, updateStoreConfig }) {
    const [config, setConfig] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('meraki_store_config') || '{}')
        } catch { return {} }
    })

    const [whatsapp, setWhatsapp] = useState(config.whatsapp || '551123880403')
    const [sacPhone, setSacPhone] = useState(config.sac_phone || '(11) 2388-0403')
    const [address, setAddress] = useState(config.address || 'Avenida Alfredo Nasser, Qd. 14, Lt. 05 - Centro, Bonfinópolis - GO, CEP: 75225-000')
    const [cnpj, setCnpj] = useState(config.cnpj || '57.484.768/0064-89')
    const [razaoSocial, setRazaoSocial] = useState(config.razao_social || 'Meraki Comércio de Vestuário Ltda')
    const [originCep, setOriginCep] = useState(config.origin_cep || '75225-000')
    const [metaPixelId, setMetaPixelId] = useState(config.meta_pixel_id || '')
    const [gaTrackingId, setGaTrackingId] = useState(config.ga_tracking_id || '')
    const [infinitepayHandle, setInfinitepayHandle] = useState(config.infinitepay_handle || 'nicolly_gomes')
    
    const [rewardBar, setRewardBar] = useState(() => {
        try {
            const storedReward = JSON.parse(localStorage.getItem('meraki_reward_bar') || 'null')
            return storedReward || config.rewardBar || {
                enabled: true,
                target_type: 'value',
                target_value: 299.99,
                reward_type: 'frete_gratis',
                reward_title: 'Frete Grátis',
                success_message: 'Parabéns! Você ganhou Frete Grátis!'
            }
        } catch {
            return {
                enabled: true,
                target_type: 'value',
                target_value: 299.99,
                reward_type: 'frete_gratis',
                reward_title: 'Frete Grátis',
                success_message: 'Parabéns! Você ganhou Frete Grátis!'
            }
        }
    })
    const [message, setMessage] = useState('')

    // Password states
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [pwdMessage, setPwdMessage] = useState('')
    const [pwdError, setPwdError] = useState(false)

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        setSaving?.(true)
        setPwdMessage('')
        setPwdError(false)
        if (newPassword !== confirmPassword) {
            setPwdMessage('As senhas não coincidem.')
            setPwdError(true)
            setSaving?.(false)
            return
        }
        if (newPassword.length < 6) {
            setPwdMessage('A senha deve ter no mínimo 6 caracteres.')
            setPwdError(true)
            setSaving?.(false)
            return
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) {
            setPwdMessage('Erro ao alterar senha: ' + error.message)
            setPwdError(true)
        } else {
            setPwdMessage('Senha de administrador atualizada com sucesso!')
            setNewPassword('')
            setConfirmPassword('')
            setTimeout(() => setPwdMessage(''), 3000)
        }
        setSaving?.(false)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving?.(true)
        setMessage('')
        try {
            const updatedConfig = {
                ...config,
                id: 'default',
                whatsapp,
                sac_phone: sacPhone,
                address,
                cnpj,
                razao_social: razaoSocial,
                origin_cep: originCep,
                meta_pixel_id: metaPixelId,
                ga_tracking_id: gaTrackingId,
                infinitepay_handle: infinitepayHandle,
                reward_bar: rewardBar,
                rewardBar
            }
            localStorage.setItem('meraki_store_config', JSON.stringify(updatedConfig))
            localStorage.setItem('meraki_reward_bar', JSON.stringify(rewardBar))
            window.dispatchEvent(new Event('storeConfigUpdated'))
            if (updateStoreConfig) {
                await updateStoreConfig(updatedConfig)
            }
            setMessage('Configurações salvas com sucesso!')
            setTimeout(() => setMessage(''), 3000)
        } catch (err) {
            console.error(err)
        }
        setSaving?.(false)
    }

    const inputCls = "w-full px-4 py-3 bg-[#FAF9F5] border border-[#EEEEEE] rounded-xl text-sm outline-none focus:border-[#7A3E4A] focus:ring-2 focus:ring-[#7A3E4A]/10 transition-all font-medium"
    const labelCls = "block text-[10px] font-bold text-gray-700 mb-1.5 uppercase tracking-wider"

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#EEEEEE]">
                <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">Configurações Gerais da Loja</h3>
                    <p className="text-xs text-gray-400">Gerencie contatos, dados jurídicos do rodapé, pixels de anúncios, chave de pagamento e frete em um único lugar.</p>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {message && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl animate-[fadeIn_200ms_ease-out]">
                        ✓ {message}
                    </div>
                )}

                {/* 1. Dados Jurídicos & SAC */}
                <div className="bg-white p-6 rounded-2xl border border-[#EEEEEE] space-y-4">
                    <h4 className="text-xs font-black text-[#7A3E4A] uppercase tracking-wider flex items-center gap-2">
                        🏛️ Dados da Empresa & SAC (Rodapé)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>Número do WhatsApp (Com DDD - Apenas Números)</label>
                            <input
                                type="text"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Telefone do SAC (Exibido formatado)</label>
                            <input
                                type="text"
                                value={sacPhone}
                                onChange={(e) => setSacPhone(e.target.value)}
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>Razão Social</label>
                            <input
                                type="text"
                                value={razaoSocial}
                                onChange={(e) => setRazaoSocial(e.target.value)}
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>CNPJ da Empresa</label>
                            <input
                                type="text"
                                value={cnpj}
                                onChange={(e) => setCnpj(e.target.value)}
                                className={inputCls}
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className={labelCls}>Endereço Completo do Showroom / Loja Física</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className={inputCls}
                                required
                            />
                        </div>
                        <div>
                            <label className={labelCls}>CEP de Origem (Saída dos Envios)</label>
                            <input
                                type="text"
                                value={originCep}
                                onChange={(e) => setOriginCep(e.target.value)}
                                className={inputCls}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Marketing & Pixels */}
                <div className="bg-white p-6 rounded-2xl border border-[#EEEEEE] space-y-4">
                    <h4 className="text-xs font-black text-[#7A3E4A] uppercase tracking-wider flex items-center gap-2">
                        📊 Rastreamento & Marketing (Pixels)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>ID do Meta Pixel (Facebook / Instagram Ads)</label>
                            <input
                                type="text"
                                placeholder="Ex: 123456789012345"
                                value={metaPixelId}
                                onChange={(e) => setMetaPixelId(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <label className={labelCls}>ID do Google Analytics 4 (GA4)</label>
                            <input
                                type="text"
                                placeholder="Ex: G-XXXXXXXXXX"
                                value={gaTrackingId}
                                onChange={(e) => setGaTrackingId(e.target.value)}
                                className={inputCls}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Pagamento */}
                <div className="bg-white p-6 rounded-2xl border border-[#EEEEEE] space-y-4">
                    <h4 className="text-xs font-black text-[#7A3E4A] uppercase tracking-wider flex items-center gap-2">
                        💳 Gateway de Pagamento
                    </h4>
                    <div>
                        <label className={labelCls}>InfiniteTag / Handle da InfinitePay (Sem o $)</label>
                        <input
                            type="text"
                            value={infinitepayHandle}
                            onChange={(e) => setInfinitepayHandle(e.target.value)}
                            className={inputCls}
                            placeholder="nicolly_gomes"
                            required
                        />
                    </div>
                </div>

                {/* 4. Barra de Progresso / Recompensas no Carrinho */}
                <div className="bg-white p-6 rounded-2xl border border-[#EEEEEE] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F5F5F5] pb-4">
                        <div>
                            <h4 className="text-xs font-black text-[#7A3E4A] uppercase tracking-wider flex items-center gap-2">
                                🎁 Barra de Progresso / Recompensas no Carrinho
                            </h4>
                            <p className="text-xs text-gray-400 mt-0.5">Configure metas de valor ou quantidade para liberar Frete Grátis, Brindes ou Descontos.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={rewardBar.enabled}
                                onChange={(e) => setRewardBar(prev => ({ ...prev, enabled: e.target.checked }))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#7A3E4A]"></div>
                            <span className="ml-2 text-xs font-bold text-gray-700">{rewardBar.enabled ? 'Ativada' : 'Desativada'}</span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className={labelCls}>Tipo de Bônus / Recompensa</label>
                            <select
                                value={rewardBar.reward_type || 'frete_gratis'}
                                onChange={(e) => setRewardBar(prev => ({ 
                                    ...prev, 
                                    reward_type: e.target.value,
                                    reward_title: e.target.value === 'frete_gratis' ? 'Frete Grátis' : (e.target.value === 'brinde' ? 'Brinde Especial' : 'Desconto Especial')
                                }))}
                                className={inputCls}
                            >
                                <option value="frete_gratis">🚚 Frete Grátis</option>
                                <option value="brinde">🎁 Brinde Especial (ex: Batom/Mimo)</option>
                                <option value="desconto">🏷️ Desconto Especial</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelCls}>Tipo de Meta</label>
                            <select
                                value={rewardBar.target_type}
                                onChange={(e) => setRewardBar(prev => ({ ...prev, target_type: e.target.value }))}
                                className={inputCls}
                            >
                                <option value="value">Valor Mínimo da Compra (R$)</option>
                                <option value="quantity">Quantidade Mínima de Produtos (Qtd)</option>
                            </select>
                        </div>

                        <div>
                            <label className={labelCls}>
                                {rewardBar.target_type === 'quantity' ? 'Quantidade Meta (ex: 3)' : 'Valor Meta R$ (ex: 299.99)'}
                            </label>
                            <input
                                type="number"
                                step="any"
                                value={rewardBar.target_value}
                                onChange={(e) => setRewardBar(prev => ({ ...prev, target_value: parseFloat(e.target.value) || 0 }))}
                                className={inputCls}
                                required
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Título da Recompensa</label>
                            <input
                                type="text"
                                value={rewardBar.reward_title}
                                onChange={(e) => setRewardBar(prev => ({ ...prev, reward_title: e.target.value }))}
                                className={inputCls}
                                placeholder="Ex: Frete Grátis ou Batom de Brinde"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Mensagem de Comemoração (Ao atingir a meta)</label>
                        <input
                            type="text"
                            value={rewardBar.success_message}
                            onChange={(e) => setRewardBar(prev => ({ ...prev, success_message: e.target.value }))}
                            className={inputCls}
                            placeholder="Ex: Parabéns! Você ganhou Frete Grátis!"
                            required
                        />
                    </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3.5 bg-gradient-to-r from-[#7A3E4A] to-[#9A5060] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-[#7A3E4A]/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {saving ? 'Salvando...' : 'Salvar Configurações da Loja'}
                    </button>
                </div>
            </form>

            {/* Alteração de Senha */}
            <form onSubmit={handlePasswordChange} className="bg-white p-6 rounded-2xl border border-[#EEEEEE] space-y-4">
                <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider mb-1">Alterar Minha Senha de Administrador</h3>
                    <p className="text-xs text-gray-400">Insira a nova senha para atualizar seu login administrativo do site.</p>
                </div>

                {pwdMessage && (
                    <div className={`p-4 text-xs font-bold rounded-xl border ${pwdError ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                        {pwdMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className={labelCls}>Nova Senha (Mínimo 6 caracteres)</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={inputCls}
                            required
                        />
                    </div>
                    <div>
                        <label className={labelCls}>Confirmar Nova Senha</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={inputCls}
                            required
                        />
                    </div>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-3 bg-gradient-to-r from-[#7A3E4A] to-[#9A5060] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:shadow-lg hover:shadow-[#7A3E4A]/30 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {saving ? 'Alterando...' : 'Alterar Senha'}
                    </button>
                </div>
            </form>
        </div>
    )
}

