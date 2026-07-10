import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useCart } from '../hooks/useCart.js'
import { useAuth } from '../hooks/useAuth.js'
import { signUp } from '../services/auth.js'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import WhatsAppButton from '../components/WhatsAppButton.jsx'
import Notification from '../components/Notification.jsx'
import { getAssetUrl } from '../utils/assets.js'
import { createPaymentSession } from '../services/payment.js'

export default function CheckoutPage() {
    const { cart, clearCart, cartCount, subtotal: rawSubtotal, comboDiscount } = useCart()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [notification, setNotification] = useState({ message: '', visible: false })

    // Form states
    const [name, setName] = useState(user?.user_metadata?.full_name || '')
    const [email, setEmail] = useState(user?.email || '')
    const [phone, setPhone] = useState('')
    const [cpf, setCpf] = useState('')
    const [password, setPassword] = useState('')
    
    // Address states
    const [cep, setCep] = useState('')
    const [street, setStreet] = useState('')
    const [number, setNumber] = useState('')
    const [complement, setComplement] = useState('')
    const [neighborhood, setNeighborhood] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [shippingMethod, setShippingMethod] = useState('pac') // pac, sedex
    const [availableShipping, setAvailableShipping] = useState([])

    // Address selection states
    const [savedAddresses, setSavedAddresses] = useState([])
    const [selectedAddressId, setSelectedAddressId] = useState('')
    const [addressLabel, setAddressLabel] = useState('Casa')

    // Load saved addresses and user data
    useEffect(() => {
        if (user) {
            setName(user?.user_metadata?.full_name || '')
            setEmail(user?.email || '')

            const users = JSON.parse(localStorage.getItem('meraki_users') || '[]')
            const dbUser = users.find(u => u.email === user.email)
            if (dbUser) {
                if (dbUser.full_name) setName(dbUser.full_name)
                if (dbUser.phone) setPhone(dbUser.phone)
                if (dbUser.cpf) setCpf(dbUser.cpf)

                let addresses = dbUser.addresses || []
                // Fallback to migrating legacy address to list
                if (addresses.length === 0 && dbUser.address) {
                    addresses = [{
                        id: 'addr-default',
                        label: 'Principal',
                        cep: dbUser.cep || '',
                        street: dbUser.address || '',
                        number: dbUser.number || '',
                        complement: dbUser.complement || '',
                        neighborhood: dbUser.neighborhood || '',
                        city: dbUser.city || '',
                        state: dbUser.state || ''
                    }]
                }
                setSavedAddresses(addresses)
                if (addresses.length > 0) {
                    const first = addresses[0]
                    setSelectedAddressId(first.id)
                    setCep(first.cep || '')
                    setStreet(first.street || '')
                    setNumber(first.number || '')
                    setComplement(first.complement || '')
                    setNeighborhood(first.neighborhood || '')
                    setCity(first.city || '')
                    setState(first.state || '')
                } else {
                    setSelectedAddressId('new')
                }
            } else {
                setSelectedAddressId('new')
            }
        } else {
            setSelectedAddressId('new')
        }
    }, [user])

    const handleSelectAddress = (id) => {
        setSelectedAddressId(id)
        if (id === 'new') {
            setCep('')
            setStreet('')
            setNumber('')
            setComplement('')
            setNeighborhood('')
            setCity('')
            setState('')
            setAddressLabel('Casa')
        } else {
            const addr = savedAddresses.find(a => a.id === id)
            if (addr) {
                setCep(addr.cep || '')
                setStreet(addr.street || '')
                setNumber(addr.number || '')
                setComplement(addr.complement || '')
                setNeighborhood(addr.neighborhood || '')
                setCity(addr.city || '')
                setState(addr.state || '')
            }
        }
    }

    // Payment states
    const [paymentMethod, setPaymentMethod] = useState('pix') // pix, card, boleto

    // Card details
    const [cardNumber, setCardNumber] = useState('')
    const [cardName, setCardName] = useState('')
    const [cardExpiry, setCardExpiry] = useState('')
    const [cardCvv, setCardCvv] = useState('')
    const [installments, setInstallments] = useState('1')

    // Coupon states
    const [couponCode, setCouponCode] = useState('')
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [couponError, setCouponError] = useState('')

    const subtotal = Math.max(0, rawSubtotal - comboDiscount)

    useEffect(() => {
        if (!state) {
            setAvailableShipping([])
            return
        }
        const isSP = state.toUpperCase() === 'SP'
        const pacPrice = subtotal >= 299 ? 0 : 19.90
        const sedexPrice = subtotal >= 299 ? 19.90 : 39.90
        
        setAvailableShipping([
            { id: 'pac', label: 'PAC (Correios)', price: pacPrice, days: isSP ? '3 a 5 dias úteis' : '6 a 12 dias úteis' },
            { id: 'sedex', label: 'SEDEX (Expresso)', price: sedexPrice, days: isSP ? '1 a 2 dias úteis' : '3 a 5 dias úteis' }
        ])
    }, [state, subtotal])

    const selectedShippingOption = availableShipping.find(s => s.id === shippingMethod)
    const shipping = selectedShippingOption ? selectedShippingOption.price : (subtotal >= 299 ? 0 : 19.90)
    
    // Pix discount is 5% off subtotal
    const pixDiscount = paymentMethod === 'pix' ? subtotal * 0.05 : 0
    
    // Coupon discount calculation
    let couponDiscount = 0
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') {
            couponDiscount = subtotal * (appliedCoupon.value / 100)
        } else {
            couponDiscount = appliedCoupon.value
        }
    }
    
    const discount = pixDiscount + couponDiscount
    const total = Math.max(0, subtotal + shipping - discount)

    const handleApplyCoupon = (e) => {
        if (e) e.preventDefault()
        setCouponError('')
        const code = couponCode.trim().toUpperCase()
        if (!code) return

        const storedCoupons = JSON.parse(localStorage.getItem('meraki_coupons') || '[]')
        const found = storedCoupons.find(c => c.code.toUpperCase() === code)

        if (!found) {
            setCouponError('Cupom inválido ou expirado.')
            setAppliedCoupon(null)
            return
        }

        if (subtotal < found.minPurchase) {
            setCouponError(`Compra mínima para este cupom: R$ ${found.minPurchase.toFixed(2)}`)
            setAppliedCoupon(null)
            return
        }

        setAppliedCoupon(found)
        showNotification(`Cupom ${code} aplicado com sucesso!`)
    }

    const formatCurrency = (val) => {
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    }

    const showNotification = (message) => {
        setNotification({ message, visible: true })
    }

    const maskCep = (val) => {
        return val
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 9)
    }

    const handleCepChange = async (e) => {
        const masked = maskCep(e.target.value)
        setCep(masked)
        
        const cleanVal = masked.replace(/\D/g, '')
        if (cleanVal.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cleanVal}/json/`)
                const data = await response.json()
                if (!data.erro) {
                    setStreet(data.logradouro || '')
                    setNeighborhood(data.bairro || '')
                    setCity(data.localidade || '')
                    setState(data.uf || '')
                    showNotification('CEP preenchido automaticamente!')
                } else {
                    showNotification('CEP não encontrado.')
                }
            } catch (err) {
                console.error(err)
            }
        }
    }

    const maskCpf = (val) => {
        return val
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
            .slice(0, 14)
    }

    const handleCheckoutSubmit = async (e) => {
        e.preventDefault()

        if (cart.length === 0) {
            alert('Seu carrinho está vazio.')
            return
        }

        if (!user) {
            if (!password) {
                alert('Por favor, crie uma senha para realizar seu cadastro e finalizar o pedido.')
                return
            }
            const { error: signUpError } = await signUp(
                email.trim().toLowerCase(),
                password,
                name,
                phone,
                cpf
            )
            if (signUpError) {
                alert('Erro ao realizar o cadastro: ' + signUpError.message)
                return
            }
        }

        const orderId = `MRK-${Math.floor(100000 + Math.random() * 900000)}`
        
        const newOrder = {
            id: orderId,
            customerName: name,
            customerEmail: email.trim().toLowerCase(),
            customerPhone: phone,
            customerCpf: cpf,
            shippingAddress: {
                cep,
                street,
                number,
                complement,
                neighborhood,
                city,
                state
            },
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                image: item.image
            })),
            paymentMethod,
            subtotal,
            shipping,
            discount,
            total,
            coupon: appliedCoupon ? appliedCoupon.code : null,
            status: 'Pendente',
            created_at: new Date().toISOString()
        }

        // Save new address to profile
        const activeEmail = user?.email || email.trim().toLowerCase()
        const users = JSON.parse(localStorage.getItem('meraki_users') || '[]')
        const idx = users.findIndex(u => u.email?.trim().toLowerCase() === activeEmail.trim().toLowerCase())
        if (idx !== -1) {
            let addresses = users[idx].addresses || []
            if (selectedAddressId === 'new') {
                const newAddr = {
                    id: 'addr-' + Date.now(),
                    label: addressLabel || 'Outro',
                    cep,
                    street,
                    number,
                    complement,
                    neighborhood,
                    city,
                    state
                }
                addresses.push(newAddr)
            } else {
                // Update existing
                const addrIdx = addresses.findIndex(a => a.id === selectedAddressId)
                if (addrIdx !== -1) {
                    addresses[addrIdx] = {
                        ...addresses[addrIdx],
                        cep,
                        street,
                        number,
                        complement,
                        neighborhood,
                        city,
                        state
                    }
                }
            }
            users[idx].addresses = addresses
            // Also update fallback profile address fields
            users[idx].address = street
            users[idx].cep = cep
            users[idx].number = number
            users[idx].complement = complement
            users[idx].neighborhood = neighborhood
            users[idx].city = city
            users[idx].state = state
            
            localStorage.setItem('meraki_users', JSON.stringify(users))
            window.dispatchEvent(new Event('storage'))
        }

        // Save order to localStorage
        const savedOrders = JSON.parse(localStorage.getItem('meraki_orders') || '[]')
        savedOrders.unshift(newOrder)
        localStorage.setItem('meraki_orders', JSON.stringify(savedOrders))

        // Clear cart
        clearCart()

        // Create InfinitePay payment session and redirect
        const { paymentUrl } = await createPaymentSession(newOrder)
        if (paymentUrl) {
            window.location.href = paymentUrl
        } else {
            // Redirect to success fallback
            navigate(`/order-success/${orderId}`)
        }
    }

    if (cart.length === 0) {
        return (
            <div className="bg-[#FCFAFA] min-h-screen flex flex-col">
                <Header cartCount={0} />
                <main className="max-w-md mx-auto px-4 py-24 text-center flex-grow flex flex-col justify-center">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h1 className="font-heading text-2xl font-bold text-gray-800 mb-2">Checkout Vazio</h1>
                    <p className="text-gray-500 font-light mb-8 text-sm">Adicione lingeries ao seu carrinho antes de finalizar a compra.</p>
                    <Link to="/" className="inline-block py-4 px-8 bg-[#7A3E4A] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl hover:bg-[#63303a] transition-colors">
                        Voltar para a Loja
                    </Link>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="bg-[#FCFAFA] min-h-screen flex flex-col">
            <Header cartCount={cartCount} />

            <main className="max-w-7xl mx-auto px-4 py-12 flex-grow w-full">
                <div className="text-center mb-10">
                    <span className="text-[#C6A76A] text-[10px] uppercase font-bold tracking-[0.4em] mb-2 block">
                        Finalização da Compra
                    </span>
                    <h1 className="!font-sans text-2xl md:text-3xl font-bold tracking-tight text-[#1A1A1A] antialiased">
                        Checkout Seguro
                    </h1>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Shipping and Payment forms */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Personal Data */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
                            <h2 className="!font-sans text-base font-semibold text-[#1A1A1A] flex items-center gap-2.5 border-b border-gray-100 pb-3 antialiased">
                                <span className="w-5.5 h-5.5 rounded-full bg-[#7A3E4A] text-white flex items-center justify-center text-[11px] font-bold font-sans antialiased">1</span>
                                Dados Pessoais
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 font-semibold mb-1">Nome Completo</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 font-semibold mb-1">CPF</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="000.000.000-00"
                                        value={cpf} 
                                        onChange={(e) => setCpf(maskCpf(e.target.value))}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 font-semibold mb-1">Email</label>
                                    <input 
                                        type="email" 
                                        required 
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 font-semibold mb-1">Telefone / WhatsApp</label>
                                    <input 
                                        type="tel" 
                                        required 
                                        placeholder="(00) 00000-0000"
                                        value={phone} 
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                    />
                                </div>
                                {!user && (
                                    <div className="flex flex-col sm:col-span-2">
                                        <label className="text-xs text-gray-500 font-semibold mb-1">Crie uma Senha para sua Conta</label>
                                        <input 
                                            type="password" 
                                            required 
                                            placeholder="Defina uma senha para finalizar seu cadastro"
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-4">
                            <h2 className="!font-sans text-base font-semibold text-[#1A1A1A] flex items-center gap-2.5 border-b border-gray-100 pb-3 antialiased">
                                <span className="w-5.5 h-5.5 rounded-full bg-[#7A3E4A] text-white flex items-center justify-center text-[11px] font-bold font-sans antialiased">2</span>
                                Endereço de Entrega
                            </h2>

                            {/* Address Selector */}
                            {user && savedAddresses.length > 0 && (
                                <div className="space-y-3 mb-6 pb-4 border-b border-gray-100">
                                    <label className="text-xs text-gray-500 font-semibold">Selecione o Endereço de Entrega:</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {savedAddresses.map(addr => (
                                            <button
                                                key={addr.id}
                                                type="button"
                                                onClick={() => handleSelectAddress(addr.id)}
                                                className={`text-left p-3.5 border transition-all rounded-xl cursor-pointer ${
                                                    selectedAddressId === addr.id
                                                        ? 'border-[#C6A76A] bg-[#FDF8F6] ring-1 ring-[#C6A76A]/20 shadow-xs'
                                                        : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[11px] font-bold text-[#C6A76A] uppercase tracking-wider">{addr.label}</span>
                                                    {selectedAddressId === addr.id && (
                                                        <span className="w-2.5 h-2.5 rounded-full bg-[#C6A76A]"></span>
                                                    )}
                                                </div>
                                                <div className="font-sans not-italic text-[11px] font-semibold text-gray-800 truncate">{addr.street}, {addr.number}</div>
                                                <div className="font-sans not-italic text-[10px] text-gray-500 truncate">{addr.neighborhood} - {addr.city}/{addr.state}</div>
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => handleSelectAddress('new')}
                                            className={`text-center p-3.5 border border-dashed transition-all rounded-xl flex flex-col items-center justify-center min-h-[90px] cursor-pointer ${
                                                selectedAddressId === 'new'
                                                    ? 'border-[#C6A76A] bg-[#FDF8F6]'
                                                    : 'border-gray-300 hover:border-gray-400 bg-white'
                                            }`}
                                        >
                                            <span className="text-xs font-bold text-gray-600">+ Adicionar Novo</span>
                                            <span className="text-[10px] text-gray-400 mt-1">Entregar em outro endereço</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Label for new address */}
                            {user && selectedAddressId === 'new' && (
                                <div className="flex flex-col mb-4">
                                    <label className="text-xs text-gray-500 font-semibold mb-1">Identificação do Endereço (ex: Trabalho, Casa 2, etc.):</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="Ex: Trabalho, Casa, etc."
                                        value={addressLabel} 
                                        onChange={(e) => setAddressLabel(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 font-semibold mb-1">CEP</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="00000-000"
                                        value={cep} 
                                        onChange={handleCepChange}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                    />
                                </div>
                                <div className="flex flex-col sm:col-span-2">
                                    <label className="text-xs text-gray-500 font-semibold mb-1">Rua / Avenida</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={street} 
                                        onChange={(e) => setStreet(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 font-semibold mb-1">Número</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={number} 
                                        onChange={(e) => setNumber(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 font-semibold mb-1">Complemento</label>
                                    <input 
                                        type="text" 
                                        value={complement} 
                                        onChange={(e) => setComplement(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 font-semibold mb-1">Bairro</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={neighborhood} 
                                        onChange={(e) => setNeighborhood(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                    />
                                </div>
                                <div className="flex flex-col sm:col-span-2">
                                    <label className="text-xs text-gray-500 font-semibold mb-1">Cidade</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={city} 
                                        onChange={(e) => setCity(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-xs text-gray-500 font-semibold mb-1">Estado</label>
                                    <input 
                                        type="text" 
                                        required 
                                        value={state} 
                                        onChange={(e) => setState(e.target.value)}
                                        className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-[#7A3E4A] transition-all" 
                                    />
                                </div>
                            </div>

                            {availableShipping.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100 animate-[fadeIn_200ms_ease-out]">
                                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 block">Opções de Envio</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {availableShipping.map(option => (
                                            <button
                                                key={option.id}
                                                type="button"
                                                onClick={() => setShippingMethod(option.id)}
                                                className={`p-4 border rounded-2xl flex items-center justify-between transition-all text-left cursor-pointer ${
                                                    shippingMethod === option.id
                                                        ? 'border-[#7A3E4A] bg-[#FDF8F6] text-[#7A3E4A] ring-2 ring-[#7A3E4A]/5'
                                                        : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                                                }`}
                                            >
                                                <div>
                                                    <div className="font-sans not-italic text-xs font-bold">{option.label}</div>
                                                    <div className="font-sans not-italic text-[10px] text-gray-400 font-medium mt-0.5">Prazo: {option.days}</div>
                                                </div>
                                                <span className="text-sm font-black">
                                                    {option.price === 0 ? 'Grátis' : formatCurrency(option.price)}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Payment Options */}
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-6">
                            <h2 className="!font-sans text-base font-semibold text-[#1A1A1A] flex items-center gap-2.5 border-b border-gray-100 pb-3 antialiased">
                                <span className="w-5.5 h-5.5 rounded-full bg-[#7A3E4A] text-white flex items-center justify-center text-[11px] font-bold font-sans antialiased">3</span>
                                Método de Pagamento
                            </h2>

                            <div className="p-5 bg-gradient-to-br from-[#7A3E4A]/5 to-[#9A5060]/5 border border-[#7A3E4A]/10 rounded-2xl space-y-4">
                                <div className="flex gap-3 items-start">
                                    <div className="p-3 bg-[#7A3E4A] rounded-xl text-white mt-1">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-[#1A1A1A]">Checkout Seguro InfinitePay</h3>
                                        <p className="text-xs text-gray-500 font-light mt-1">
                                            Você será redirecionada para a página oficial e criptografada da **InfinitePay** para concluir o pagamento de forma 100% segura.
                                        </p>
                                    </div>
                                </div>

                                <div className="border-t border-[#7A3E4A]/10 pt-4 flex flex-wrap gap-4 justify-around text-center">
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-bold text-gray-800">Pix</span>
                                        <span className="text-[10px] text-emerald-600 font-bold">Aprovado na hora</span>
                                    </div>
                                    <div className="w-[1px] bg-gray-200"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-bold text-gray-800">Cartão de Crédito</span>
                                        <span className="text-[10px] text-gray-500 font-medium">Até 12x sem juros</span>
                                    </div>
                                    <div className="w-[1px] bg-gray-200"></div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xs font-bold text-gray-800">Cartão de Débito</span>
                                        <span className="text-[10px] text-gray-500 font-medium">À vista</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm sticky top-28 space-y-6">
                            <h2 className="!font-sans text-base font-semibold text-[#1A1A1A] border-b border-gray-100 pb-3 antialiased">
                                Resumo do Pedido
                            </h2>

                            {/* Cart List */}
                            <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                                {cart.map(item => (
                                    <div key={`${item.id}-${item.size}`} className="flex gap-3 justify-between items-center text-sm">
                                        <div className="flex gap-3 items-center">
                                            <div className="w-12 h-16 bg-gray-50 border border-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                <img 
                                                    src={item.image ? getAssetUrl(item.image) : getAssetUrl('/assets/placeholder.jpg')} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = getAssetUrl('/assets/placeholder.jpg') }}
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-heading font-semibold text-[#1A1A1A] line-clamp-1">{item.name}</h3>
                                                <p className="text-[11px] text-gray-400 font-medium">Tamanho: {item.size} • Qtd: {item.quantity}</p>
                                            </div>
                                        </div>
                                        <span className="font-bold text-[#1A1A1A] whitespace-nowrap">
                                            {formatCurrency(item.price * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Input */}
                            <div className="border-t border-gray-100 pt-4 pb-1">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Cupom de Desconto</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        placeholder="Digite seu cupom" 
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#7A3E4A] placeholder:text-gray-400 font-medium"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleApplyCoupon}
                                        className="px-4 py-2 bg-[#7A3E4A] hover:bg-[#63303a] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                                    >
                                        Aplicar
                                    </button>
                                </div>
                                {couponError && (
                                    <p className="text-[10px] text-red-500 font-semibold mt-1.5">{couponError}</p>
                                )}
                                {appliedCoupon && (
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200/50 px-2.5 py-1.5 rounded-lg mt-2.5 text-[10px] text-green-700 font-bold">
                                        <span>Cupom {appliedCoupon.code} ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}%` : `R$ ${appliedCoupon.value}`} OFF)</span>
                                        <button 
                                            type="button" 
                                            onClick={() => { setAppliedCoupon(null); setCouponCode('') }} 
                                            className="text-red-500 hover:text-red-700 font-bold uppercase text-[9px] cursor-pointer"
                                        >
                                            Remover
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Summary Values */}
                            <div className="border-t border-gray-100 pt-4 space-y-2.5 text-sm">
                                {comboDiscount > 0 ? (
                                    <>
                                        <div className="flex justify-between text-gray-500">
                                            <span>Subtotal original</span>
                                            <span className="font-semibold text-gray-700">{formatCurrency(rawSubtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-[#D11A6E] font-medium">
                                            <span>Desconto do Combo</span>
                                            <span>-{formatCurrency(comboDiscount)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500 font-bold">
                                            <span>Subtotal</span>
                                            <span className="text-gray-700">{formatCurrency(subtotal)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between text-gray-500">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-700">{formatCurrency(subtotal)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-gray-500">
                                    <span>Entrega / Frete</span>
                                    <span className="font-bold text-gray-700">
                                        {shipping === 0 ? 'Grátis' : formatCurrency(shipping)}
                                    </span>
                                </div>
                                {pixDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Desconto (Pix 5%)</span>
                                        <span>-{formatCurrency(pixDiscount)}</span>
                                    </div>
                                )}
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Desconto (Cupom)</span>
                                        <span>-{formatCurrency(couponDiscount)}</span>
                                    </div>
                                )}
                                <div className="border-t border-gray-100 pt-4 flex justify-between items-end">
                                    <span className="text-[#1A1A1A] font-bold">Total</span>
                                    <span className="text-xl font-extrabold text-[#7A3E4A]">{formatCurrency(total)}</span>
                                </div>
                            </div>

                            {/* Order Action Button */}
                            <button
                                type="submit"
                                className="w-full py-4 bg-[#7A3E4A] hover:bg-[#63303a] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-md hover:scale-[1.01]"
                            >
                                Finalizar Pedido
                            </button>
                        </div>
                    </div>
                </form>
            </main>

            <Footer />
            <WhatsAppButton />
            <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ message: '', visible: false })} />
        </div>
    )
}
