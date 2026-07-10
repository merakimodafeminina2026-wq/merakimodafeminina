import { useState } from 'react'

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
                                        {['Produto', 'Categoria', 'Preço', 'Seção', ''].map((h, i) => (
                                            <th key={i} className={`px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest ${i === 4 ? 'text-right' : ''}`}>{h}</th>
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
                        {paginatedProducts.map(p => (
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
    handleDeleteCoupon,
    renderPagination,
    cpPage,
    setCpPage
}) {
    return (
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
                                    <button onClick={() => handleDeleteCoupon(cp.id)} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase tracking-wider cursor-pointer px-2 py-1 rounded-lg hover:bg-red-50 transition-all">
                                         Remover
                                    </button>
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

// ─── SECTION 5: BANNERS ───────────────────────────────────────────────────────
export function BannersSection({
    banners,
    setBannerModal,
    getAssetUrl,
    compressImage,
    uploadMultipleImages,
    handleUpdateBannerImage,
    handleDeleteBanner
}) {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-black text-gray-900">Banners do Carrossel</h2>
                    <p className="text-[10px] text-gray-400 font-medium">
                        {banners.length} banner{banners.length !== 1 ? 's' : ''} ativo{banners.length !== 1 ? 's' : ''} • <span className="text-[#C6A76A] font-bold">Recomendado: 1920x800px (16:7)</span>
                    </p>
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
                            <div className="flex justify-between items-start gap-2">
                                <div>
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Alt Text</p>
                                    <p className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">{bn.alt}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-[#C6A76A] uppercase tracking-widest">Tamanho</p>
                                    <p className="text-[10px] font-bold text-gray-500">1920x800px</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                <button
                                    onClick={() => document.getElementById(`change-banner-file-${bn.id}`).click()}
                                    className="py-2 rounded-xl bg-[#7A3E4A]/10 text-[#7A3E4A] hover:bg-[#7A3E4A]/20 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer text-center"
                                >
                                    Trocar Imagem
                                </button>
                                <input 
                                    id={`change-banner-file-${bn.id}`}
                                    type="file" 
                                    accept="image/*" 
                                    onChange={async (e) => {
                                        if (e.target.files?.[0]) {
                                            const file = await compressImage(e.target.files[0])
                                            const { urls } = await uploadMultipleImages([file])
                                            if (urls?.[0]) {
                                                handleUpdateBannerImage(bn.id, urls[0])
                                            }
                                        }
                                    }}
                                    className="hidden" 
                                />
                                <button
                                    onClick={() => handleDeleteBanner(bn.id)}
                                    className="py-2 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    Remover
                                </button>
                            </div>
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
                            const compressedFile = await compressImage(files[0])
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
                        <input type="file" name="edImage" accept="image/*" className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#7A3E4A]/10 file:text-[#7A3E4A] hover:file:bg-[#7A3E4A]/20 cursor-pointer" />
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
    getAssetUrl
}) {
    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-sm font-black text-gray-900">Categorias da Loja</h2>
                <p className="text-[10px] text-gray-400 font-medium">{categories.length} categoria{categories.length !== 1 ? 's' : ''} cadastrada{categories.length !== 1 ? 's' : ''}</p>
            </div>

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
                            <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Imagem de Capa</label>
                            <input type="file" name="catImage" accept="image/*" className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[#7A3E4A]/10 file:text-[#7A3E4A] hover:file:bg-[#7A3E4A]/20 cursor-pointer" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wider">Descrição</label>
                        <input type="text" name="catDescription" placeholder="Breve descrição da categoria..." className="w-full px-3 py-2 border border-[#EEEEEE] rounded-xl text-xs outline-none" />
                    </div>
                    <button type="submit" disabled={saving} className="px-5 py-3 bg-[#7A3E4A] hover:bg-[#603039] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50">
                        Cadastrar Categoria
                    </button>
                </form>
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
                            <div className="px-4 py-2 border-t border-[#F8F8F8] flex justify-end">
                                <button 
                                    onClick={() => {
                                        const updated = categories.filter((_, i) => i !== idx)
                                        setCategories(updated)
                                        localStorage.setItem('meraki_categories', JSON.stringify(updated))
                                        window.dispatchEvent(new Event('categoriesUpdated'))
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
                    <p className="text-sm font-bold text-gray-600 mb-1">Nenhuma solicitação de troca ou devolução</p>
                </div>
            )}
        </div>
    )
}
