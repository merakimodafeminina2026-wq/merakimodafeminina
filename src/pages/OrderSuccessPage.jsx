import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import WhatsAppButton from '../components/WhatsAppButton.jsx'
import Notification from '../components/Notification.jsx'
import OrderTracker from '../components/OrderTracker.jsx'

export default function OrderSuccessPage() {
    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [copied, setCopied] = useState(false)
    const [notification, setNotification] = useState({ message: '', visible: false })

    useEffect(() => {
        const savedOrders = JSON.parse(localStorage.getItem('meraki_orders') || '[]')
        const targetOrder = savedOrders.find(o => o.id === orderId)
        if (targetOrder) {
            setOrder(targetOrder)
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
            <Header />

            <main className="max-w-6xl mx-auto px-4 py-12 flex-grow w-full space-y-8">
                
                {/* Pix / Boleto Payment Banner when Payment is Pending */}
                {order.paymentMethod === 'pix' && order.status === 'Pendente' && (
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-6 text-center shadow-sm">
                        <div className="flex items-center justify-center gap-2 text-emerald-800">
                            <span className="text-xl">⚡</span>
                            <h3 className="font-heading text-lg font-bold">Aguardando Pagamento via PIX</h3>
                        </div>
                        
                        <div className="w-44 h-44 bg-white border border-gray-200 rounded-2xl p-3 mx-auto shadow-sm flex items-center justify-center">
                            <svg className="w-full h-full text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                <rect x="2" y="2" width="6" height="6" />
                                <rect x="16" y="2" width="6" height="6" />
                                <rect x="2" y="16" width="6" height="6" />
                                <rect x="5" y="5" width="0.01" height="0.01" strokeWidth="2" />
                                <rect x="19" y="5" width="0.01" height="0.01" strokeWidth="2" />
                                <rect x="5" y="19" width="0.01" height="0.01" strokeWidth="2" />
                                <path d="M10 2h4M10 6h2M10 10h4M2 10h4M16 10h6M10 14h4M14 16h4M10 20h2M14 20h4M20 14v4M10 17h2M18 19h2" />
                            </svg>
                        </div>

                        <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                            Escaneie o QR Code acima pelo app do seu banco ou utilize a chave Pix copia-e-cola abaixo.
                        </p>

                        <div className="max-w-md mx-auto flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white shadow-xs">
                            <input
                                type="text"
                                readOnly
                                value="00020126580014BR.GOV.BCB.PIX0136e4f387b..."
                                className="flex-1 px-4 py-3.5 text-xs text-gray-500 outline-none bg-transparent"
                            />
                            <button
                                onClick={handleCopyPix}
                                className="px-6 py-3.5 bg-[#7A3E4A] hover:bg-[#63303a] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                {copied ? 'Copiado!' : 'Copiar'}
                            </button>
                        </div>
                    </div>
                )}

                {order.paymentMethod === 'boleto' && order.status === 'Pendente' && (
                    <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
                        <h3 className="font-heading text-lg font-bold text-gray-900">Boleto Bancário Gerado</h3>
                        <p className="text-xs text-gray-600 max-w-sm mx-auto">
                            O boleto foi enviado para o seu e-mail. Utilize a linha digitável abaixo para pagamento.
                        </p>
                        <div className="max-w-md mx-auto flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                            <input
                                type="text"
                                readOnly
                                value="34191.79001 01043.513184 91020.150008 7 987600000"
                                className="flex-1 px-4 py-3.5 text-xs text-gray-500 outline-none bg-transparent"
                            />
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText("34191.7900101043513184910201500087987600000")
                                    showNotification('Código de barras copiado com sucesso!')
                                }}
                                className="px-6 py-3.5 bg-[#7A3E4A] hover:bg-[#63303a] text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                            >
                                Copiar
                            </button>
                        </div>
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
        </div>
    )
}
