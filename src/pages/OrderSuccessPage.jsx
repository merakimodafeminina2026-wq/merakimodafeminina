import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Header from '../components/Header.jsx'
import Footer from '../components/Footer.jsx'
import WhatsAppButton from '../components/WhatsAppButton.jsx'
import Notification from '../components/Notification.jsx'
import { getAssetUrl } from '../utils/assets.js'

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

    const formatCurrency = (val) => {
        return val ? val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'R$ 0,00'
    }

    if (!order) {
        return (
            <div className="bg-[#FCFAFA] min-h-screen flex flex-col">
                <Header />
                <main className="max-w-md mx-auto px-4 py-24 text-center flex-grow flex flex-col justify-center">
                    <div className="w-8 h-8 border-[1px] border-[#C6A76A] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500 font-light text-sm">Carregando detalhes do seu pedido...</p>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="bg-[#FCFAFA] min-h-screen flex flex-col">
            <Header />

            <main className="max-w-3xl mx-auto px-4 py-16 flex-grow w-full">
                <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-premium text-center space-y-6">
                    {/* Success Icon */}
                    <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center mx-auto shadow-inner">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <div>
                        <span className="text-[#C6A76A] text-[10px] uppercase font-bold tracking-[0.4em] mb-2 block">
                            Pedido Recebido
                        </span>
                        <h1 className="font-heading text-3xl text-[#1A1A1A]">
                            Obrigada por sua compra!
                        </h1>
                        <p className="text-gray-400 font-light text-sm mt-2">
                            Seu pedido foi gerado com sucesso. Número do pedido: <span className="font-bold text-[#1A1A1A]">{order.id}</span>
                        </p>
                    </div>

                    <div className="w-full h-[1px] bg-gray-100"></div>

                    {/* Payment Instruction Blocks */}
                    {order.paymentMethod === 'pix' && (
                        <div className="bg-green-50/20 border border-green-100/50 rounded-2xl p-6 md:p-8 space-y-6 text-center">
                            <h3 className="font-heading text-lg font-bold text-green-900">Pagamento via Pix</h3>
                            
                            {/* Pix QR Code Mockup */}
                            <div className="w-44 h-44 bg-white border border-gray-200 rounded-xl p-2 mx-auto shadow-sm flex items-center justify-center">
                                <svg className="w-full h-full text-gray-800" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                    {/* Mock Pix QR Code matrix lines */}
                                    <rect x="2" y="2" width="6" height="6" />
                                    <rect x="16" y="2" width="6" height="6" />
                                    <rect x="2" y="16" width="6" height="6" />
                                    <rect x="5" y="5" width="0.01" height="0.01" strokeWidth="2" />
                                    <rect x="19" y="5" width="0.01" height="0.01" strokeWidth="2" />
                                    <rect x="5" y="19" width="0.01" height="0.01" strokeWidth="2" />
                                    <path d="M10 2h4M10 6h2M10 10h4M2 10h4M16 10h6M10 14h4M14 16h4M10 20h2M14 20h4M20 14v4M10 17h2M18 19h2" />
                                </svg>
                            </div>

                            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                                Escaneie o QR Code acima pelo app do seu banco ou utilize a chave Pix copia-e-cola abaixo.
                            </p>

                            {/* Copy Pix input field */}
                            <div className="max-w-md mx-auto flex items-center border border-gray-200 rounded-xl overflow-hidden bg-white">
                                <input
                                    type="text"
                                    readOnly
                                    value="00020126580014BR.GOV.BCB.PIX0136e4f387b..."
                                    className="flex-1 px-4 py-3.5 text-xs text-gray-500 outline-none bg-transparent"
                                />
                                <button
                                    onClick={handleCopyPix}
                                    className="px-6 py-3.5 bg-[#7A3E4A] hover:bg-[#63303a] text-white text-xs font-bold uppercase tracking-wider transition-colors border-l border-gray-200"
                                >
                                    {copied ? 'Copiado!' : 'Copiar'}
                                </button>
                            </div>
                        </div>
                    )}

                    {order.paymentMethod === 'boleto' && (
                        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-6 text-center space-y-4">
                            <h3 className="font-heading text-lg font-bold text-gray-800">Boleto Bancário</h3>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                O boleto foi gerado e enviado para o seu e-mail. Caso prefira, copie o código de barras abaixo para pagamento.
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
                                        showNotification('Código de barras copiado!')
                                    }}
                                    className="px-6 py-3.5 bg-[#7A3E4A] hover:bg-[#63303a] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                                >
                                    Copiar
                                </button>
                            </div>
                        </div>
                    )}

                    {order.paymentMethod === 'card' && (
                        <div className="p-4 bg-green-50/30 border border-green-150 rounded-2xl text-center max-w-md mx-auto">
                            <span className="text-green-700 font-bold block text-sm mb-1">Pagamento Aprovado! 🎉</span>
                            Sua transação no cartão de crédito foi processada com sucesso. Em breve você receberá as atualizações de envio.
                        </div>
                    )}

                    {/* Order Details Accordion */}
                    <div className="bg-[#FCFAFA] rounded-2xl p-6 text-left border border-gray-100 space-y-4">
                        <h4 className="font-heading font-bold text-[#1A1A1A] border-b border-gray-200/50 pb-2">Detalhes da Entrega</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
                            <div>
                                <span className="font-semibold block text-gray-500">Destinatário:</span>
                                {order.customerName} ({order.customerPhone})
                            </div>
                            <div>
                                <span className="font-semibold block text-gray-500">Endereço:</span>
                                {order.shippingAddress.street}, {order.shippingAddress.number} {order.shippingAddress.complement && ` - ${order.shippingAddress.complement}`} <br />
                                {order.shippingAddress.neighborhood} - {order.shippingAddress.city}/{order.shippingAddress.state} <br />
                                CEP: {order.shippingAddress.cep}
                            </div>
                        </div>

                        <h4 className="font-heading font-bold text-[#1A1A1A] border-b border-gray-200/50 pb-2 pt-2">Resumo Financeiro</h4>
                        <div className="space-y-1.5 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Frete</span>
                                <span>{order.shipping === 0 ? 'Grátis' : formatCurrency(order.shipping)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-700 font-medium">
                                    <span>Desconto (Pix)</span>
                                    <span>-{formatCurrency(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm font-bold text-[#7A3E4A] pt-2 border-t border-dashed border-gray-200">
                                <span>Total</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation buttons */}
                    <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            to="/auth"
                            className="inline-block py-4 px-8 bg-[#7A3E4A] hover:bg-[#63303a] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all shadow-md hover:scale-[1.01]"
                        >
                            Ver Meus Pedidos
                        </Link>
                        <Link
                            to="/"
                            className="inline-block py-4 px-8 border border-[#7A3E4A] text-[#7A3E4A] hover:bg-[#7A3E4A]/5 text-xs font-bold uppercase tracking-[0.2em] rounded-xl transition-all hover:scale-[1.01]"
                        >
                            Continuar Comprando
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
            <WhatsAppButton />
            <Notification message={notification.message} visible={notification.visible} onHide={() => setNotification({ message: '', visible: false })} />
        </div>
    )
}
