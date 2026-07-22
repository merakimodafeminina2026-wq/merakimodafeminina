import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import WhatsAppButton from '../components/WhatsAppButton.jsx'
import Notification from '../components/Notification.jsx'
import OrderTracker from '../components/OrderTracker.jsx'
import FireworksEffect from '../components/FireworksEffect.jsx'

export default function OrderSuccessPage() {
    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [infinitePayModalOpen, setInfinitePayModalOpen] = useState(false)
    const [infinitePayHandle, setInfinitePayHandle] = useState(() => {
        try {
            const config = JSON.parse(localStorage.getItem('meraki_store_config') || '{}')
            return config.infinitepay_handle || 'nicolly_gomes'
        } catch {
            return 'nicolly_gomes'
        }
    })

    useEffect(() => {
        const checkOrder = () => {
            const savedOrders = JSON.parse(localStorage.getItem('meraki_orders') || '[]')
            const targetOrder = savedOrders.find(o => o.id === orderId)
            if (targetOrder) {
                setOrder(prev => {
                    const prevStatus = (prev?.status || '').toLowerCase()
                    const newStatus = (targetOrder.status || '').toLowerCase()
                    if (prevStatus === 'pendente' && (newStatus === 'pago' || newStatus === 'aprovado' || newStatus === 'enviado')) {
                        setShowFireworks(true)
                        setNotification({ message: '🎉 Pagamento autorizado com sucesso!', visible: true })
                    }
                    return targetOrder
                })

                const s = (targetOrder.status || '').toLowerCase()
                if (s === 'pago' || s === 'aprovado' || s === 'entregue' || s === 'enviado') {
                    setShowFireworks(true)
                }
            } else {
                setShowFireworks(true)
            }
        }

        checkOrder()
        const interval = setInterval(checkOrder, 3000)
        window.addEventListener('storage', checkOrder)
        window.addEventListener('ordersUpdated', checkOrder)

        return () => {
            clearInterval(interval)
            window.removeEventListener('storage', checkOrder)
            window.removeEventListener('ordersUpdated', checkOrder)
        }
    }, [orderId])

    const showNotification = (message) => {
        setNotification({ message, visible: true })
    }

    const handleCopyPix = () => {
        navigator.clipboard.writeText("00020126580014BR.GOV.BCB.PIX0136e4f387b9-1d4e-4f38-a78a-f38b0029e71f5204000053039865406200.005802BR5912MerakiStore6009Sao Paulo62070503***6304E8A9")
        setCopied(true)
        showNotification('Chave Pix copiada com sucesso! 🚀')
        setTimeout(() => setCopied(false), 3000)
    }

    if (!order) {
        return (
            <div className="bg-[#FCFAFA] min-h-screen flex flex-col font-sans">
                <Header />
                <main className="max-w-md mx-auto px-4 py-24 text-center flex-grow flex flex-col justify-center">
                    <div className="w-8 h-8 border-2 border-[#7A3E4A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-medium text-sm">Carregando detalhes do seu pedido...</p>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="bg-[#FCFAFA] min-h-screen flex flex-col font-sans">
            {showFireworks && <FireworksEffect duration={6000} />}
            <Header />

            <main className="max-w-6xl mx-auto px-4 py-12 flex-grow w-full space-y-8">
                
                {/* Card Payment InfinitePay Banner */}
                {order.paymentMethod === 'card' && order.status === 'Pendente' && (
                    <div className="bg-gradient-to-br from-[#FFF9F6] via-white to-[#FDF4EC] border border-[#E8E0D8] rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7A3E4A] via-[#C6A76A] to-[#7A3E4A]" />

                        <div className="flex flex-col items-center gap-2 pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#7A3E4A]/10 border border-[#7A3E4A]/20 text-[#7A3E4A] text-[10px] font-black uppercase tracking-[0.2em]">
                                💳 Pagamento Seguro InfinitePay
                            </span>
                            <h3 className="font-sans text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                Efetuar Pagamento no Cartão de Crédito
                            </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
                            Seu pedido foi pré-reservado! Abra a janela de pagamento da <strong>InfinitePay</strong> para concluir o pagamento com total segurança.
                        </p>

                        <button
                            onClick={() => setInfinitePayModalOpen(true)}
                            className="px-8 py-4 bg-gradient-to-r from-[#7A3E4A] to-[#603039] hover:from-[#603039] hover:to-[#4A2027] text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all cursor-pointer shadow-lg hover:shadow-[#7A3E4A]/30 flex items-center justify-center gap-2 mx-auto"
                        >
                            💳 Pagar com InfinitePay Agora
                        </button>
                    </div>
                )}
                
                {/* Pix / Boleto Payment Banner when Payment is Pending */}
                {order.paymentMethod === 'pix' && order.status === 'Pendente' && (
                    <div className="bg-gradient-to-br from-[#FFF9F6] via-white to-[#FDF4EC] border border-[#E8E0D8] rounded-3xl p-6 sm:p-10 space-y-6 text-center shadow-xl relative overflow-hidden">
                        {/* Elegant accent border */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7A3E4A] via-[#C6A76A] to-[#7A3E4A]" />

                        <div className="flex flex-col items-center gap-2 pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#7A3E4A]/10 border border-[#7A3E4A]/20 text-[#7A3E4A] text-[10px] font-black uppercase tracking-[0.2em]">
                                ⚡ Pagamento Instantâneo
                            </span>
                            <h3 className="font-sans text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                Aguardando Pagamento via PIX
                            </h3>
                        </div>
                        
                        {/* QR Code Container */}
                        <div className="relative w-48 h-48 bg-white border-2 border-[#C6A76A]/30 rounded-2xl p-4 mx-auto shadow-md flex items-center justify-center group transition-all hover:border-[#7A3E4A]/50">
                            <svg className="w-full h-full text-[#1A1A1A]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                <rect x="2" y="2" width="6" height="6" />
                                <rect x="16" y="2" width="6" height="6" />
                                <rect x="2" y="16" width="6" height="6" />
                                <rect x="5" y="5" width="0.01" height="0.01" strokeWidth="2" />
                                <rect x="19" y="5" width="0.01" height="0.01" strokeWidth="2" />
                                <rect x="5" y="19" width="0.01" height="0.01" strokeWidth="2" />
                                <path d="M10 2h4M10 6h2M10 10h4M2 10h4M16 10h6M10 14h4M14 16h4M10 20h2M14 20h4M20 14v4M10 17h2M18 19h2" />
                            </svg>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
                            Escaneie o QR Code acima pelo app do seu banco ou utilize a chave <strong>Pix copia-e-cola</strong> abaixo.
                        </p>

                        <div className="max-w-lg mx-auto flex items-center border border-[#E8E0D8] rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
                            <input
                                type="text"
                                readOnly
                                value="00020126580014BR.GOV.BCB.PIX0136e4f387b..."
                                className="flex-1 px-4 py-4 text-xs font-mono text-gray-600 outline-none bg-transparent select-all"
                            />
                            <button
                                onClick={handleCopyPix}
                                className="px-7 py-4 bg-gradient-to-r from-[#7A3E4A] to-[#603039] hover:from-[#603039] hover:to-[#4A2027] text-white text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
                            >
                                {copied ? '✅ Copiado!' : 'Copiar Chave'}
                            </button>
                        </div>
                    </div>
                )}

                {order.paymentMethod === 'boleto' && order.status === 'Pendente' && (
                    <div className="bg-gradient-to-br from-[#FFF9F6] via-white to-[#FDF4EC] border border-[#E8E0D8] rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7A3E4A] via-[#C6A76A] to-[#7A3E4A]" />

                        <div className="flex flex-col items-center gap-2 pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#7A3E4A]/10 border border-[#7A3E4A]/20 text-[#7A3E4A] text-[10px] font-black uppercase tracking-[0.2em]">
                                📄 Boleto Bancário
                            </span>
                            <h3 className="font-sans text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                                Boleto Bancário Gerado
                            </h3>
                        </div>

                        <p className="text-xs sm:text-sm text-gray-600 font-medium max-w-md mx-auto leading-relaxed">
                            O boleto foi enviado para o seu e-mail. Utilize a linha digitável abaixo para realizar o pagamento.
                        </p>

                        <div className="max-w-lg mx-auto flex items-center border border-[#E8E0D8] rounded-2xl overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
                            <input
                                type="text"
                                readOnly
                                value="34191.79001 01043.513184 91020.150008 7 987600000"
                                className="flex-1 px-4 py-4 text-xs font-mono text-gray-600 outline-none bg-transparent select-all"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText("34191.7900101043513184910201500087987600000")
                                    showNotification('Código de barras copiado com sucesso!')
                                }}
                                className="px-7 py-4 bg-gradient-to-r from-[#7A3E4A] to-[#603039] hover:from-[#603039] hover:to-[#4A2027] text-white text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-sm flex items-center gap-1.5 shrink-0"
                            >
                                Copiar Código
                            </button>
                        </div>
                    </div>
                )}

                {/* Banner de Pagamento Aprovado com Sucesso */}
                {(order.status === 'Pago' || order.status === 'Aprovado' || order.status === 'Enviado' || order.status === 'Entregue') && (
                    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 border border-emerald-500 rounded-3xl p-6 sm:p-8 text-white text-center shadow-2xl space-y-3 relative overflow-hidden animate-[fadeInUp_400ms_ease-out]">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner border border-white/30 animate-bounce">
                            🎉
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                            Pagamento Concluído com Sucesso!
                        </h2>
                        <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-lg mx-auto leading-relaxed">
                            Identificamos a autorização do seu PIX com sucesso! Seu pedido foi confirmado e já está sendo preparado pela nossa equipe com todo carinho.
                        </p>
                    </div>
                )}

                {/* Main Order Tracker Component */}
                <OrderTracker order={order} onCopyPix={handleCopyPix} pixCopied={copied} />

                {/* Navigation Buttons */}
                <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        to="/profile"
                        className="w-full sm:w-auto text-center py-4 px-8 bg-[#7A3E4A] hover:bg-[#63303a] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-md hover:scale-[1.01]"
                    >
                        Ver Meus Pedidos
                    </Link>
                    <Link
                        to="/"
                        className="w-full sm:w-auto text-center py-4 px-8 border border-[#7A3E4A] text-[#7A3E4A] hover:bg-[#7A3E4A]/5 text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all hover:scale-[1.01]"
                    >
                        Voltar à Loja
                    </Link>
                </div>

            </main>

            <Footer />
            <WhatsAppButton />
            <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ message: '', visible: false })} />

            {/* Modal de Pagamento Embutido InfinitePay */}
            {infinitePayModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-[fadeIn_150ms_ease-out]">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-4 sm:p-6 border border-gray-100 shadow-2xl relative space-y-4 animate-[scaleUp_200ms_ease-out]">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase text-[#7A3E4A]">Pagamento Seguro</span>
                                <span className="text-[10px] font-bold text-gray-400">| InfinitePay ({infinitePayHandle})</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInfinitePayModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold flex items-center justify-center cursor-pointer transition-all"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="w-full h-[550px] rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 relative">
                            <iframe
                                src={`https://pay.infinitepay.io/${infinitePayHandle}?amount=${order.total}&order_id=${order.id}`}
                                className="w-full h-full border-0"
                                title="Pagamento InfinitePay"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
