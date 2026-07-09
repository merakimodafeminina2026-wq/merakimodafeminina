import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { signIn, signUp, signOut, getUserProfile, signInWithProvider } from '../services/auth.js'
import Header from '../components/Header.jsx'
import BenefitsBar from '../components/BenefitsBar.jsx'
import Footer from '../components/Footer.jsx'

export default function AuthPage() {
    const { session, user, profile, admin, loading } = useAuth()
    const navigate = useNavigate()
    const [tab, setTab] = useState('login')
    const [alert, setAlert] = useState({ message: '', type: '' })
    const [submitting, setSubmitting] = useState(false)
    const [cartCount, setCartCount] = useState(0)
    const [wishlistCount, setWishlistCount] = useState(0)
    const [searchOpen, setSearchOpen] = useState(false)
    const [dashboardTab, setDashboardTab] = useState('orders')
    
    // Profile Edit States
    const [editName, setEditName] = useState('')
    const [editPhone, setEditPhone] = useState('')
    const [editCpf, setEditCpf] = useState('')
    const [editAddress, setEditAddress] = useState('')
    const [editCep, setEditCep] = useState('')
    const [editNum, setEditNum] = useState('')
    const [editComp, setEditComp] = useState('')
    const [editBairro, setEditBairro] = useState('')
    const [editCity, setEditCity] = useState('')
    const [editState, setEditState] = useState('')
    
    // Returns States
    const [returnsList, setReturnsList] = useState([])
    const [returnReason, setReturnReason] = useState('')
    const [returnOrderId, setReturnOrderId] = useState('')
    const [returnItemId, setReturnItemId] = useState('')
    const [returnType, setReturnType] = useState('troca')

    // Load header metrics
    useEffect(() => {
        const storedWishlist = JSON.parse(localStorage.getItem('meraki_wishlist') || '[]')
        setWishlistCount(storedWishlist.length)

        const storedCart = JSON.parse(localStorage.getItem('meraki_cart') || '[]')
        setCartCount(storedCart.reduce((acc, item) => acc + item.quantity, 0))
    }, [])

    useEffect(() => {
        if (profile) {
            setEditName(profile.full_name || '')
            setEditPhone(profile.phone || '')
            setEditCpf(profile.cpf || '')
            setEditAddress(profile.address || '')
            setEditCep(profile.cep || '')
            setEditNum(profile.number || '')
            setEditComp(profile.complement || '')
            setEditBairro(profile.neighborhood || '')
            setEditCity(profile.city || '')
            setEditState(profile.state || '')
        }
        if (user) {
            const storedReturns = JSON.parse(localStorage.getItem(`meraki_returns_${user.email}`) || '[]')
            setReturnsList(storedReturns)
        }
    }, [profile, user])

    // Fetch address from ViaCEP when CEP reaches 8 digits
    useEffect(() => {
        const cleanCep = editCep.replace(/\D/g, '')
        if (cleanCep.length === 8) {
            const fetchAddress = async () => {
                try {
                    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
                    const data = await response.json()
                    if (!data.erro) {
                        setEditAddress(data.logradouro || '')
                        setEditBairro(data.bairro || '')
                        setEditCity(data.localidade || '')
                        setEditState(data.uf || '')
                    }
                } catch (err) {
                    console.error('Erro ao buscar CEP:', err)
                }
            }
            fetchAddress()
        }
    }, [editCep])

    function showAlert(message, type = 'error') {
        setAlert({ message, type })
        setTimeout(() => {
            setAlert(prev => {
                if (prev.message === message) {
                    return { message: '', type: '' }
                }
                return prev
            })
        }, 4000)
    }

    // Input masks
    function maskPhone(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 15)
    }

    // CPF Mask
    function maskCpf(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .slice(0, 14)
    }

    // CEP Mask
    function maskCep(value) {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .slice(0, 9)
    }

    // Login handler
    async function handleLogin(e) {
        e.preventDefault()
        setAlert({ message: '', type: '' })
        const email = e.target.loginEmail.value.trim()
        const password = e.target.loginPassword.value

        setSubmitting(true)
        const { data, error } = await signIn(email, password)
        setSubmitting(false)

        if (error) {
            if (error.message.includes('Invalid login credentials')) showAlert('E-mail ou senha incorretos.')
            else if (error.message.includes('Email not confirmed')) showAlert('Verifique seu e-mail para confirmar sua conta.')
            else showAlert('Erro ao fazer login.')
        } else {
            const userId = data?.user?.id
            if (userId) {
                const { profile: userProfile } = await getUserProfile(userId)
                if (userProfile?.tipo_user === 'admin') {
                    showAlert('Login admin realizado! Redirecionando...', 'success')
                    setTimeout(() => navigate('/admin'), 1000)
                    return
                }
            }
            showAlert('Login realizado com sucesso!', 'success')
        }
    }

    // Forgot password handler
    async function handleForgotPassword(e) {
        e.preventDefault()
        setAlert({ message: '', type: '' })
        const email = e.target.forgotEmail.value.trim()
        setSubmitting(true)
        
        const localUsersData = localStorage.getItem('meraki_users')
        const users = localUsersData ? JSON.parse(localUsersData) : []
        const found = users.some(u => u.email === email)
        
        await new Promise(resolve => setTimeout(resolve, 800))
        setSubmitting(false)
        
        if (found) {
            showAlert('Enviamos um link de recuperação para o seu e-mail!', 'success')
            e.target.reset()
        } else {
            showAlert('E-mail não encontrado em nosso sistema.')
        }
    }

    // Signup handler
    async function handleSignup(e) {
        e.preventDefault()
        setAlert({ message: '', type: '' })
        const name = e.target.signupName.value.trim()
        const phone = e.target.signupPhone.value.trim()
        const cpf = e.target.signupCpf.value.trim()
        const email = e.target.signupEmail.value.trim()
        const password = e.target.signupPassword.value
        const confirm = e.target.signupConfirm.value

        if (password !== confirm) {
            showAlert('As senhas não coincidem.')
            return
        }

        setSubmitting(true)
        const { data, error } = await signUp(email, password, name, phone, cpf)
        setSubmitting(false)

        if (error) {
            if (error.message.includes('already registered')) showAlert('Este e-mail já está cadastrado.')
            else showAlert('Erro ao criar conta: ' + error.message)
        } else if (data.session) {
            showAlert('Conta criada com sucesso!', 'success')
        } else {
            showAlert('Conta criada! Verifique seu e-mail para confirmar.', 'success')
        }
    }

    // Logout handler
    async function handleLogout() {
        await signOut()
        showAlert('Você saiu da conta.', 'success')
    }

    async function handleSocialLogin(provider) {
        setAlert({ message: '', type: '' })
        setSubmitting(true)
        const { data, error } = await signInWithProvider(provider)
        setSubmitting(false)
        if (error) {
            showAlert(`Erro ao entrar com ${provider}`)
        } else {
            showAlert(`Login via ${provider} realizado com sucesso!`, 'success')
        }
    }

    async function handleSaveProfile(e) {
        e.preventDefault()
        setSubmitting(true)
        const users = JSON.parse(localStorage.getItem('meraki_users') || '[]')
        const idx = users.findIndex(u => u.email === user.email)
        if (idx !== -1) {
            users[idx].full_name = editName
            users[idx].phone = editPhone
            users[idx].cpf = editCpf
            users[idx].address = editAddress
            users[idx].cep = editCep
            users[idx].number = editNum
            users[idx].complement = editComp
            users[idx].neighborhood = editBairro
            users[idx].city = editCity
            users[idx].state = editState
            localStorage.setItem('meraki_users', JSON.stringify(users))
            
            const sessionData = JSON.parse(localStorage.getItem('meraki_session') || '{}')
            if (sessionData.user) {
                sessionData.user.user_metadata = { ...sessionData.user.user_metadata, full_name: editName }
                localStorage.setItem('meraki_session', JSON.stringify(sessionData))
            }
            showAlert('Dados atualizados com sucesso!', 'success')
            window.dispatchEvent(new Event('storage'))
        } else {
            showAlert('Erro ao atualizar perfil.')
        }
        setSubmitting(false)
    }

    function handleRequestReturn(e) {
        e.preventDefault()
        if (!returnOrderId) {
            showAlert('Selecione um pedido para continuar.')
            return
        }
        if (!returnItemId) {
            showAlert('Selecione o produto que deseja trocar ou devolver.')
            return
        }
        const postCode = `PM${Math.floor(100000000 + Math.random() * 900000000)}BR`
        const newReturn = {
            id: 'RET-' + Date.now(),
            orderId: returnOrderId,
            itemId: returnItemId,
            type: returnType,
            reason: returnReason,
            date: new Date().toISOString(),
            status: 'Autorizado (Aguardando Postagem)',
            postageCode: postCode
        }

        const updatedReturns = [newReturn, ...returnsList]
        setReturnsList(updatedReturns)
        localStorage.setItem(`meraki_returns_${user.email}`, JSON.stringify(updatedReturns))
        setReturnReason('')
        setReturnOrderId('')
        setReturnItemId('')
        setReturnType('troca')
        showAlert(`Solicitação de ${returnType} enviada! Código de postagem: ${postCode}`, 'success')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FCFAFA]">
                <div className="w-8 h-8 border-2 border-[#7A3E4A] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const userName = profile?.full_name || user?.user_metadata?.full_name || 'Usuário'
    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

    // Derived order data for dashboard
    const allOrders = JSON.parse(localStorage.getItem('meraki_orders') || '[]')
    const clientOrders = allOrders.filter(o => o.customerEmail === user?.email)
    const paidOrders = clientOrders.filter(o => o.status === 'Pago')
    const selectedOrderItems = returnOrderId
        ? (clientOrders.find(o => o.id === returnOrderId)?.items || [])
        : []

    const statusConfig = {
        'Pendente':  { bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
        'Pago':      { bg: 'bg-emerald-50',  text: 'text-emerald-700', dot: 'bg-emerald-400' },
        'Enviado':   { bg: 'bg-sky-50',      text: 'text-sky-700',     dot: 'bg-sky-400' },
        'Entregue':  { bg: 'bg-teal-50',     text: 'text-teal-700',    dot: 'bg-teal-400' },
        'Cancelado': { bg: 'bg-gray-100',     text: 'text-gray-500',    dot: 'bg-gray-400' },
    }

    return (
        <div className="bg-[#FAFAF8] min-h-screen flex flex-col font-sans">
            <Header cartCount={cartCount} wishlistCount={wishlistCount} onSearchOpen={() => setSearchOpen(true)} />

            {/* Global Alert Banner */}
            {session && alert.message && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md px-4 py-3 text-sm font-medium shadow-lg border-l-4 animate-[slideDown_250ms_ease-out] ${
                    alert.type === 'success'
                        ? 'bg-white border-[#C6A76A] text-[#5a3a1a]'
                        : 'bg-white border-[#7A3E4A] text-[#7A3E4A]'
                }`}>
                    <div className="flex items-center gap-2">
                        {alert.type === 'success'
                            ? <svg className="w-4 h-4 text-[#C6A76A] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                            : <svg className="w-4 h-4 text-[#7A3E4A] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                        }
                        <span>{alert.message}</span>
                    </div>
                </div>
            )}

            <main className="flex-grow w-full">
                {session ? (
                    /* ── DASHBOARD CLIENTE ─────────────────────────────── */
                    <div className="max-w-2xl mx-auto px-0 sm:px-4 pb-20 sm:pb-10">

                        {/* ── HERO PROFILE STRIP ── */}
                        <div className="relative bg-[#FDF8F6] border border-[#C6A76A]/20 px-5 pt-10 pb-6 sm:mx-0 sm:rounded-none">
                            {/* Decorative line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C6A76A] to-transparent" />

                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="relative shrink-0">
                                    <div className="w-14 h-14 rounded-sm bg-[#C6A76A] flex items-center justify-center text-white text-lg font-bold tracking-wider shadow-md">
                                        {initials}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#FDF8F6]" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-[#C6A76A] text-[9px] font-bold uppercase tracking-[0.2em] mb-0.5">Bem-vinda de volta</p>
                                    <h1 className="text-gray-900 font-heading text-base font-bold truncate">{userName}</h1>
                                    <p className="text-gray-500 text-[11px] truncate mt-0.5">{user?.email}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-1.5 shrink-0">
                                    {admin && (
                                        <Link to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-[9px] font-bold uppercase tracking-widest transition-all border border-gray-200 rounded-xs">
                                            <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            Admin
                                        </Link>
                                    )}
                                    <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-750 hover:text-gray-900 text-[9px] font-bold uppercase tracking-widest transition-all border border-gray-200 rounded-xs">
                                        <svg className="w-3 h-3 text-gray-550" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Sair
                                    </button>
                                </div>
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-2 mt-6 pt-5 border-t border-[#E8E0D8]">
                                {[
                                    { label: 'Pedidos', value: clientOrders.length },
                                    { label: 'Entregues', value: clientOrders.filter(o => o.status === 'Entregue').length },
                                    { label: 'Em Aberto', value: clientOrders.filter(o => ['Pendente','Pago','Enviado'].includes(o.status)).length },
                                ].map(stat => (
                                    <div key={stat.label} className="text-center">
                                        <p className="text-gray-900 font-bold text-xl leading-none">{stat.value}</p>
                                        <p className="text-gray-500 text-[9px] uppercase tracking-widest mt-1">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── TAB NAV ── */}
                        <div className="sticky top-0 z-30 bg-white border-b border-[#E8E0D8] shadow-[0_1px_0_rgba(0,0,0,0.04)]">
                            <div className="flex">
                                {[
                                    { id: 'orders',  label: 'Pedidos',  icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
                                    { id: 'returns', label: 'Trocas',   icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15' },
                                    { id: 'profile', label: 'Perfil',   icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setDashboardTab(t.id)}
                                        className={`flex-1 flex flex-col items-center gap-1 py-3 text-[9px] font-bold uppercase tracking-widest transition-all relative ${
                                            dashboardTab === t.id
                                                ? 'text-[#7A3E4A]'
                                                : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={t.icon} />
                                        </svg>
                                        {t.label}
                                        {dashboardTab === t.id && (
                                            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C6A76A]" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── TAB CONTENT ── */}
                        <div className="px-4 sm:px-0 pt-5">

                            {/* ─── PEDIDOS TAB ─── */}
                            {dashboardTab === 'orders' && (
                                <div className="space-y-3 animate-[fadeIn_200ms_ease-out]">
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xs font-bold text-[#2d1a1e] uppercase tracking-[0.15em]">Histórico de Pedidos</h2>
                                        <span className="text-[9px] text-gray-400 font-semibold">{clientOrders.length} pedido{clientOrders.length !== 1 ? 's' : ''}</span>
                                    </div>

                                    {clientOrders.length === 0 ? (
                                        <div className="text-center py-16 border border-dashed border-[#E8E0D8]">
                                            <div className="w-12 h-12 mx-auto mb-3 border border-[#E8E0D8] flex items-center justify-center">
                                                <svg className="w-5 h-5 text-[#C6A76A]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                            </div>
                                            <p className="text-[#7A3E4A] font-heading text-sm font-semibold mb-1">Nenhum pedido ainda</p>
                                            <p className="text-gray-400 text-xs mb-5">Explore nossa coleção e realize seu primeiro pedido.</p>
                                            <Link to="/" className="inline-block px-6 py-2.5 bg-[#7A3E4A] !text-white text-[10px] font-bold uppercase tracking-widest hover:bg-[#6b3540] transition-colors">
                                                Explorar Coleção
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {clientOrders.map(order => {
                                                const cfg = statusConfig[order.status] || { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-400' }
                                                return (
                                                    <div key={order.id} className="bg-white border border-[#E8E0D8] overflow-hidden">
                                                        {/* Order header */}
                                                        <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0EBE3]">
                                                            <div>
                                                                <p className="text-[10px] text-gray-400 font-medium">{new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                                <p className="text-xs font-bold text-[#2d1a1e] mt-0.5">{order.id}</p>
                                                            </div>
                                                            <div className={`flex items-center gap-1.5 px-2.5 py-1 ${cfg.bg}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                                                <span className={`text-[10px] font-bold ${cfg.text}`}>{order.status}</span>
                                                            </div>
                                                        </div>

                                                        {/* Items */}
                                                        <div className="divide-y divide-[#F7F3EE]">
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} className="flex items-center gap-3 px-4 py-3">
                                                                    <div className="w-10 h-10 bg-[#F7F3EE] shrink-0 flex items-center justify-center text-[#C6A76A]">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-semibold text-[#2d1a1e] truncate">{item.name}</p>
                                                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                                                            {item.quantity}x
                                                                            {item.size && <span className="ml-1 bg-[#F0EBE3] text-[#7A3E4A] px-1 py-0.5 text-[9px] font-bold">Tam {item.size}</span>}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-xs font-bold text-[#7A3E4A] shrink-0">
                                                                        {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Footer */}
                                                        <div className="flex items-center justify-between px-4 py-3 bg-[#FAF8F5] border-t border-[#F0EBE3]">
                                                            <span className="text-[10px] text-gray-400 font-medium">{order.paymentMethod}</span>
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[9px] text-gray-400 uppercase tracking-wider">Total</span>
                                                                <span className="text-sm font-bold text-[#7A3E4A] ml-1">
                                                                    {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ─── TROCAS TAB ─── */}
                            {dashboardTab === 'returns' && (
                                <div className="space-y-5 animate-[fadeIn_200ms_ease-out]">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xs font-bold text-[#2d1a1e] uppercase tracking-[0.15em]">Trocas & Devoluções</h2>
                                    </div>

                                    {/* ─ REQUEST FORM ─ */}
                                    <div className="bg-white border border-[#E8E0D8] overflow-hidden">
                                        <div className="bg-[#7A3E4A] px-4 py-3">
                                            <h3 className="text-white text-[10px] font-bold uppercase tracking-[0.2em]">Nova Solicitação</h3>
                                        </div>

                                        <form onSubmit={handleRequestReturn} className="p-4 space-y-4">

                                            {/* Type toggle */}
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Tipo de Solicitação</p>
                                                <div className="flex">
                                                    {['troca', 'devolução'].map(type => (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            onClick={() => setReturnType(type)}
                                                            className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                                                returnType === type
                                                                    ? 'bg-[#7A3E4A] text-white border-[#7A3E4A]'
                                                                    : 'bg-white text-gray-400 border-[#E8E0D8] hover:border-[#C6A76A] hover:text-[#7A3E4A]'
                                                            }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Step 1: Select Order */}
                                            <div>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                    <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#C6A76A] text-white text-[8px] font-black mr-1.5">1</span>
                                                    Selecione o Pedido
                                                </p>
                                                {paidOrders.length === 0 ? (
                                                    <div className="border border-dashed border-[#E8E0D8] p-3 text-center">
                                                        <p className="text-[11px] text-gray-400 italic">Nenhum pedido pago disponível para troca.</p>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {paidOrders.map(order => (
                                                            <label key={order.id} className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                                                                returnOrderId === order.id
                                                                    ? 'border-[#C6A76A] bg-[#FDF9F4]'
                                                                    : 'border-[#E8E0D8] hover:border-[#C6A76A]/50 bg-white'
                                                            }`}>
                                                                <input
                                                                    type="radio"
                                                                    name="returnOrder"
                                                                    value={order.id}
                                                                    checked={returnOrderId === order.id}
                                                                    onChange={e => { setReturnOrderId(e.target.value); setReturnItemId('') }}
                                                                    className="accent-[#C6A76A]"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-bold text-[#2d1a1e]">{order.id}</p>
                                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                                        {new Date(order.created_at).toLocaleDateString('pt-BR')} • {order.items.length} produto{order.items.length > 1 ? 's' : ''}
                                                                    </p>
                                                                </div>
                                                                <span className="text-xs font-bold text-[#7A3E4A] shrink-0">
                                                                    {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                </span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Step 2: Select Product */}
                                            {returnOrderId && selectedOrderItems.length > 0 && (
                                                <div>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#C6A76A] text-white text-[8px] font-black mr-1.5">2</span>
                                                        Produto a {returnType === 'troca' ? 'Trocar' : 'Devolver'}
                                                    </p>
                                                    <div className="space-y-2">
                                                        {selectedOrderItems.map((item, idx) => {
                                                            const itemKey = `${item.name}_${idx}`
                                                            return (
                                                                <label key={itemKey} className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                                                                    returnItemId === itemKey
                                                                        ? 'border-[#C6A76A] bg-[#FDF9F4]'
                                                                        : 'border-[#E8E0D8] hover:border-[#C6A76A]/50 bg-white'
                                                                }`}>
                                                                    <input
                                                                        type="radio"
                                                                        name="returnItem"
                                                                        value={itemKey}
                                                                        checked={returnItemId === itemKey}
                                                                        onChange={e => setReturnItemId(e.target.value)}
                                                                        className="accent-[#C6A76A]"
                                                                    />
                                                                    <div className="w-8 h-8 bg-[#F0EBE3] flex items-center justify-center shrink-0 text-[#C6A76A]">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-xs font-semibold text-[#2d1a1e] truncate">{item.name}</p>
                                                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                                                            Qtd: {item.quantity}
                                                                            {item.size && <span className="ml-2 bg-[#F0EBE3] text-[#7A3E4A] px-1 py-0.5 text-[9px] font-bold">Tam {item.size}</span>}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-xs font-bold text-[#7A3E4A] shrink-0">
                                                                        {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                                    </p>
                                                                </label>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Step 3: Reason */}
                                            {returnItemId && (
                                                <div>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#C6A76A] text-white text-[8px] font-black mr-1.5">3</span>
                                                        Motivo da Solicitação
                                                    </p>
                                                    <textarea
                                                        value={returnReason}
                                                        onChange={e => setReturnReason(e.target.value)}
                                                        placeholder={`Descreva o motivo da ${returnType}...`}
                                                        required
                                                        rows={3}
                                                        className="w-full bg-white border border-[#E8E0D8] focus:border-[#C6A76A] outline-none p-3 text-xs text-gray-700 placeholder:text-gray-300 resize-none transition-colors"
                                                    />
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={!returnOrderId || !returnItemId}
                                                className="w-full py-3.5 bg-[#7A3E4A] hover:bg-[#6b3540] text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Solicitar {returnType}
                                            </button>
                                        </form>
                                    </div>

                                    {/* ─ REQUESTS LIST ─ */}
                                    {returnsList.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">Minhas Solicitações</p>
                                            {returnsList.map(ret => (
                                                <div key={ret.id} className="bg-white border border-[#E8E0D8] overflow-hidden">
                                                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#F0EBE3]">
                                                        <div>
                                                            <p className="text-[9px] text-[#C6A76A] font-bold uppercase tracking-wider">{ret.type || 'Troca'}</p>
                                                            <p className="text-xs font-bold text-[#2d1a1e]">{ret.id}</p>
                                                        </div>
                                                        <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-2 py-1">{ret.status}</span>
                                                    </div>
                                                    <div className="px-4 py-3 space-y-1">
                                                        <p className="text-[10px] text-gray-400">Pedido: <span className="text-gray-600 font-semibold">{ret.orderId}</span></p>
                                                        <p className="text-[10px] text-gray-400">Data: <span className="text-gray-600">{new Date(ret.date).toLocaleDateString('pt-BR')}</span></p>
                                                        {ret.reason && <p className="text-[10px] text-gray-500 italic mt-1">"{ret.reason}"</p>}
                                                    </div>
                                                    {ret.postageCode && (
                                                        <div className="mx-4 mb-4 p-3 border border-[#C6A76A]/30 bg-[#FDF9F4]">
                                                            <p className="text-[9px] font-bold text-[#7A3E4A] uppercase tracking-wider mb-1">Código de Postagem Reversa</p>
                                                            <p className="text-sm font-black text-[#2d1a1e] tracking-[0.15em]">{ret.postageCode}</p>
                                                            <p className="text-[9px] text-gray-400 mt-1.5">Apresente nos Correios para envio gratuito.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ─── PERFIL TAB ─── */}
                            {dashboardTab === 'profile' && (
                                <div className="animate-[fadeIn_200ms_ease-out]">
                                    <h2 className="text-xs font-bold text-[#2d1a1e] uppercase tracking-[0.15em] mb-5">Meus Dados</h2>

                                    <form onSubmit={handleSaveProfile} className="space-y-4">
                                        <div className="bg-white border border-[#E8E0D8] p-5 sm:p-6 space-y-4">
                                            {/* Nome Completo */}
                                            <div className="group relative bg-[#FCFAFA] hover:bg-white border border-[#E8E0D8] focus-within:border-[#C6A76A] focus-within:bg-white transition-all px-4 py-2.5 flex flex-col gap-0.5">
                                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Nome Completo:</label>
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={e => setEditName(e.target.value)}
                                                    required
                                                    className="w-full bg-transparent text-xs font-semibold text-[#2d1a1e] outline-none min-w-0"
                                                />
                                            </div>

                                            {/* Grid Telefone e CPF */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="group relative bg-[#FCFAFA] hover:bg-white border border-[#E8E0D8] focus-within:border-[#C6A76A] focus-within:bg-white transition-all px-4 py-2.5 flex flex-col gap-0.5">
                                                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Telefone:</label>
                                                    <input
                                                        type="tel"
                                                        value={editPhone}
                                                        onChange={e => setEditPhone(maskPhone(e.target.value))}
                                                        placeholder="(00) 00000-0000"
                                                        className="w-full bg-transparent text-xs font-semibold text-[#2d1a1e] outline-none min-w-0 placeholder:text-gray-350"
                                                    />
                                                </div>

                                                <div className="group relative bg-[#FCFAFA] hover:bg-white border border-[#E8E0D8] focus-within:border-[#C6A76A] focus-within:bg-white transition-all px-4 py-2.5 flex flex-col gap-0.5">
                                                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">CPF:</label>
                                                    <input
                                                        type="text"
                                                        value={editCpf}
                                                        onChange={e => setEditCpf(maskCpf(e.target.value))}
                                                        placeholder="000.000.000-00"
                                                        className="w-full bg-transparent text-xs font-semibold text-[#2d1a1e] outline-none min-w-0 placeholder:text-gray-355"
                                                    />
                                                </div>
                                            </div>

                                            {/* E-mail (Somente Leitura) */}
                                            <div className="relative bg-[#FAF9F5] border border-[#E8E0D8] px-4 py-2.5 flex flex-col gap-0.5 opacity-80 cursor-not-allowed">
                                                <label className="text-[10px] font-semibold text-gray-550 uppercase tracking-wider">E-mail (Não editável):</label>
                                                <p className="text-xs font-semibold text-gray-500 truncate">{user?.email}</p>
                                            </div>

                                            {/* ─── DADOS DE ENTREGA ─── */}
                                            <div className="pt-2 border-t border-[#E8E0D8] mb-1">
                                                <p className="text-[10px] font-bold text-[#C6A76A] uppercase tracking-widest">Endereço de Entrega</p>
                                            </div>

                                            {/* CEP */}
                                            <div className="group relative bg-[#FCFAFA] hover:bg-white border border-[#E8E0D8] focus-within:border-[#C6A76A] focus-within:bg-white transition-all px-4 py-2.5 flex flex-col gap-0.5">
                                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">CEP:</label>
                                                <input
                                                    type="text"
                                                    value={editCep}
                                                    onChange={e => setEditCep(maskCep(e.target.value))}
                                                    placeholder="00000-000"
                                                    className="w-full bg-transparent text-xs font-semibold text-[#2d1a1e] outline-none min-w-0 placeholder:text-gray-355"
                                                />
                                            </div>

                                            {/* Endereço / Rua */}
                                            <div className="group relative bg-[#FCFAFA] hover:bg-white border border-[#E8E0D8] focus-within:border-[#C6A76A] focus-within:bg-white transition-all px-4 py-2.5 flex flex-col gap-0.5">
                                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Rua / Avenida:</label>
                                                <input
                                                    type="text"
                                                    value={editAddress}
                                                    onChange={e => setEditAddress(e.target.value)}
                                                    placeholder="Ex: Rua das Flores"
                                                    className="w-full bg-transparent text-xs font-semibold text-[#2d1a1e] outline-none min-w-0 placeholder:text-gray-355"
                                                />
                                            </div>

                                            {/* Número e Complemento */}
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="group relative bg-[#FCFAFA] hover:bg-white border border-[#E8E0D8] focus-within:border-[#C6A76A] focus-within:bg-white transition-all px-4 py-2.5 flex flex-col gap-0.5 sm:col-span-1">
                                                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Número:</label>
                                                    <input
                                                        type="text"
                                                        value={editNum}
                                                        onChange={e => setEditNum(e.target.value)}
                                                        placeholder="123"
                                                        className="w-full bg-transparent text-xs font-semibold text-[#2d1a1e] outline-none min-w-0 placeholder:text-gray-355"
                                                    />
                                                </div>

                                                <div className="group relative bg-[#FCFAFA] hover:bg-white border border-[#E8E0D8] focus-within:border-[#C6A76A] focus-within:bg-white transition-all px-4 py-2.5 flex flex-col gap-0.5 sm:col-span-2">
                                                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Complemento:</label>
                                                    <input
                                                        type="text"
                                                        value={editComp}
                                                        onChange={e => setEditComp(e.target.value)}
                                                        placeholder="Ex: Apto 45, Bloco B (Opcional)"
                                                        className="w-full bg-transparent text-xs font-semibold text-[#2d1a1e] outline-none min-w-0 placeholder:text-gray-355"
                                                    />
                                                </div>
                                            </div>

                                            {/* Bairro */}
                                            <div className="group relative bg-[#FCFAFA] hover:bg-white border border-[#E8E0D8] focus-within:border-[#C6A76A] focus-within:bg-white transition-all px-4 py-2.5 flex flex-col gap-0.5">
                                                <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Bairro:</label>
                                                <input
                                                    type="text"
                                                    value={editBairro}
                                                    onChange={e => setEditBairro(e.target.value)}
                                                    placeholder="Ex: Centro"
                                                    className="w-full bg-transparent text-xs font-semibold text-[#2d1a1e] outline-none min-w-0 placeholder:text-gray-355"
                                                />
                                            </div>

                                            {/* Cidade e Estado */}
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                                <div className="group relative bg-[#FCFAFA] hover:bg-white border border-[#E8E0D8] focus-within:border-[#C6A76A] focus-within:bg-white transition-all px-4 py-2.5 flex flex-col gap-0.5 sm:col-span-3">
                                                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Cidade:</label>
                                                    <input
                                                        type="text"
                                                        value={editCity}
                                                        onChange={e => setEditCity(e.target.value)}
                                                        placeholder="Ex: São Paulo"
                                                        className="w-full bg-transparent text-xs font-semibold text-[#2d1a1e] outline-none min-w-0 placeholder:text-gray-355"
                                                    />
                                                </div>

                                                <div className="group relative bg-[#FCFAFA] hover:bg-white border border-[#E8E0D8] focus-within:border-[#C6A76A] focus-within:bg-white transition-all px-4 py-2.5 flex flex-col gap-0.5 sm:col-span-1">
                                                    <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">UF:</label>
                                                    <input
                                                        type="text"
                                                        value={editState}
                                                        onChange={e => setEditState(e.target.value.toUpperCase().slice(0, 2))}
                                                        placeholder="SP"
                                                        className="w-full bg-transparent text-xs font-semibold text-[#2d1a1e] outline-none min-w-0 placeholder:text-gray-355"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                            <button
                                                type="submit"
                                                disabled={submitting}
                                                className="flex-1 py-4 bg-[#7A3E4A] hover:bg-[#6b3540] !text-white text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                                            >
                                                {submitting ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Salvando...
                                                    </div>
                                                ) : 'Salvar Alterações'}
                                            </button>

                                            <Link to="/" className="flex-1 flex items-center justify-center gap-2 py-4 border border-[#E8E0D8] text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-[#7A3E4A] hover:border-[#C6A76A] transition-all bg-white">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                                Voltar para a Loja
                                            </Link>
                                        </div>
                                    </form>
                                </div>
                            )}

                        </div>
                    </div>

                ) : (
                    /* ── LOGIN / CADASTRO — estilo original nude ── */
                    <div className="max-w-md mx-auto bg-[#FDF8F6] rounded-xs border border-[#C6A76A]/20 shadow-xs p-8 sm:p-10 animate-[fadeIn_300ms_ease-out]">

                        <p className="text-center font-heading italic text-gray-500 text-sm mb-4">Bem-vinda à Meraki</p>

                        {/* Tabs */}
                        <div className="flex bg-white rounded-xs p-1 mb-8 border border-[#C6A76A]/30">
                            <button onClick={() => { setTab('login'); setAlert({ message: '', type: '' }) }}
                                className={`flex-1 py-3 text-center font-heading text-xs uppercase font-bold tracking-wider rounded-xs transition-all ${tab === 'login' ? 'bg-[#C6A76A] text-white shadow-xs' : 'text-gray-400 hover:text-gray-600'}`}>
                                Entrar
                            </button>
                            <button onClick={() => { setTab('signup'); setAlert({ message: '', type: '' }) }}
                                className={`flex-1 py-3 text-center font-heading text-xs uppercase font-bold tracking-wider rounded-xs transition-all ${tab === 'signup' ? 'bg-[#C6A76A] text-white shadow-xs' : 'text-gray-400 hover:text-gray-600'}`}>
                                Criar Conta
                            </button>
                        </div>

                        {/* Social */}
                        <div className="space-y-3 mb-6">
                            <button type="button" onClick={() => handleSocialLogin('Google')}
                                className="w-full py-3.5 bg-white hover:bg-gray-50 text-gray-700 font-heading text-xs font-semibold tracking-wide rounded-xs border border-gray-200 flex items-center justify-center gap-3 transition-colors cursor-pointer">
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.9h6.6c-.28 1.48-1.12 2.73-2.38 3.58v3h3.84c2.25-2.06 3.53-5.1 3.53-8.68z" />
                                    <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.84-3c-1.06.7-2.42 1.13-4.12 1.13-3.18 0-5.86-2.15-6.82-5.04H1.21v3.13C3.18 21.29 7.3 24 12 24z" />
                                    <path fill="#FBBC05" d="M5.18 14.18c-.24-.7-.38-1.47-.38-2.27s.14-1.57.38-2.27V6.51H1.21A11.94 11.94 0 0 0 0 12c0 2.05.52 4 1.21 5.49l3.97-3.31z" />
                                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.96 1.19 15.24 0 12 0 7.3 0 3.18 2.71 1.21 6.51l3.97 3.13c.96-2.89 3.64-5.04 6.82-5.04z" />
                                </svg>
                                Entrar com o Google
                            </button>
                            <button type="button" onClick={() => handleSocialLogin('Facebook')}
                                className="w-full py-3.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-heading text-xs font-semibold tracking-wide rounded-xs flex items-center justify-center gap-3 transition-colors cursor-pointer">
                                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                                Entrar com o Facebook
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center my-6">
                            <div className="flex-grow border-t border-gray-200" />
                            <span className="px-3 text-[10px] font-heading font-semibold text-gray-400 uppercase tracking-widest">ou</span>
                            <div className="flex-grow border-t border-gray-200" />
                        </div>

                        {/* Alert */}
                        {alert.message && (
                            <div className={`px-4 py-3 mb-5 text-xs font-semibold border flex items-center gap-2 ${
                                alert.type === 'success'
                                    ? 'bg-white border-[#C6A76A] text-[#5a3a1a]'
                                    : 'bg-white border-[#7A3E4A] text-[#7A3E4A]'
                            }`}>
                                {alert.type === 'success'
                                    ? <svg className="w-4 h-4 text-[#C6A76A] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                                    : <svg className="w-4 h-4 text-[#7A3E4A] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                                }
                                <span>{alert.message}</span>
                            </div>
                        )}

                        {tab === 'forgot' ? (
                            <form onSubmit={handleForgotPassword} className="animate-[fadeIn_300ms_ease-out] space-y-6">
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Insira seu e-mail cadastrado e enviaremos as instruções para a redefinição da sua senha.
                                </p>
                                <div>
                                    <label className="block font-heading text-xs font-semibold text-gray-700 tracking-wider mb-2">E-mail</label>
                                    <input type="email" name="forgotEmail" placeholder="seu@email.com" required
                                        className="w-full bg-transparent px-0 py-2.5 border-b border-gray-200 focus:border-[#C6A76A] outline-none font-heading text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400" />
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="w-full py-4 bg-[#C6A76A] hover:bg-[#b09054] text-white font-heading text-xs font-bold uppercase tracking-wider rounded-xs transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs cursor-pointer">
                                    {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Recuperar Senha'}
                                </button>
                                <div className="text-center pt-2">
                                    <button type="button" onClick={() => { setTab('login'); setAlert({ message: '', type: '' }) }} 
                                        className="text-xs text-[#7A3E4A] hover:text-[#C6A76A] font-bold uppercase tracking-wider transition-colors cursor-pointer">
                                        Voltar para o Login
                                    </button>
                                </div>
                            </form>
                        ) : tab === 'login' ? (
                            <form onSubmit={handleLogin} className="animate-[fadeIn_300ms_ease-out] space-y-6">
                                <div>
                                    <label className="block font-heading text-xs font-semibold text-gray-700 tracking-wider mb-2">E-mail</label>
                                    <input type="email" name="loginEmail" placeholder="seu@email.com" required
                                        className="w-full bg-transparent px-0 py-2.5 border-b border-gray-200 focus:border-[#C6A76A] outline-none font-heading text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block font-heading text-xs font-semibold text-gray-700 tracking-wider">Senha</label>
                                        <button 
                                            type="button"
                                            onClick={() => { setTab('forgot'); setAlert({ message: '', type: '' }) }}
                                            className="text-[10px] text-[#7A3E4A] hover:text-[#C6A76A] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                        >
                                            Esqueceu a senha?
                                        </button>
                                    </div>
                                    <input type="password" name="loginPassword" placeholder="Sua senha" required
                                        className="w-full bg-transparent px-0 py-2.5 border-b border-gray-200 focus:border-[#C6A76A] outline-none font-heading text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400" />
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="w-full py-4 bg-[#C6A76A] hover:bg-[#b09054] text-white font-heading text-xs font-bold uppercase tracking-wider rounded-xs transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs">
                                    {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Entrar'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSignup} className="animate-[fadeIn_300ms_ease-out] space-y-6">
                                <div>
                                    <label className="block font-heading text-xs font-semibold text-gray-700 tracking-wider mb-2">Nome Completo</label>
                                    <input type="text" name="signupName" placeholder="Seu nome completo" required
                                        className="w-full bg-transparent px-0 py-2.5 border-b border-gray-200 focus:border-[#C6A76A] outline-none font-heading text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-heading text-xs font-semibold text-gray-700 tracking-wider mb-2">Telefone</label>
                                        <input type="tel" name="signupPhone" placeholder="(11) 99999-9999"
                                            onChange={e => { e.target.value = maskPhone(e.target.value) }}
                                            className="w-full bg-transparent px-0 py-2.5 border-b border-gray-200 focus:border-[#C6A76A] outline-none font-heading text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400" />
                                    </div>
                                    <div>
                                        <label className="block font-heading text-xs font-semibold text-gray-700 tracking-wider mb-2">CPF</label>
                                        <input type="text" name="signupCpf" placeholder="000.000.000-00"
                                            onChange={e => { e.target.value = maskCpf(e.target.value) }}
                                            className="w-full bg-transparent px-0 py-2.5 border-b border-gray-200 focus:border-[#C6A76A] outline-none font-heading text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block font-heading text-xs font-semibold text-gray-700 tracking-wider mb-2">E-mail</label>
                                    <input type="email" name="signupEmail" placeholder="seu@email.com" required
                                        className="w-full bg-transparent px-0 py-2.5 border-b border-gray-200 focus:border-[#C6A76A] outline-none font-heading text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label className="block font-heading text-xs font-semibold text-gray-700 tracking-wider mb-2">Senha</label>
                                    <input type="password" name="signupPassword" placeholder="Mínimo 6 caracteres" required minLength={6}
                                        className="w-full bg-transparent px-0 py-2.5 border-b border-gray-200 focus:border-[#C6A76A] outline-none font-heading text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400" />
                                </div>
                                <div>
                                    <label className="block font-heading text-xs font-semibold text-gray-700 tracking-wider mb-2">Confirmar Senha</label>
                                    <input type="password" name="signupConfirm" placeholder="Confirme sua senha" required minLength={6}
                                        className="w-full bg-transparent px-0 py-2.5 border-b border-gray-200 focus:border-[#C6A76A] outline-none font-heading text-sm font-medium text-gray-900 transition-all placeholder:text-gray-400" />
                                </div>
                                <button type="submit" disabled={submitting}
                                    className="w-full py-4 bg-[#C6A76A] hover:bg-[#b09054] text-white font-heading text-xs font-bold uppercase tracking-wider rounded-xs transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed shadow-xs">
                                    {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Criar Conta'}
                                </button>
                            </form>
                        )}
                    </div>

                )}
            </main>

            <BenefitsBar />
            <Footer />
        </div>
    )
}
