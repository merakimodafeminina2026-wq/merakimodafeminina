import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import HomePage from './pages/HomePage.jsx'
import AuthPage from './pages/AuthPage.jsx'
import AdminPage from './pages/AdminPage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import OrderSuccessPage from './pages/OrderSuccessPage.jsx'
import ProductPage from './pages/ProductPage.jsx'
import InfoPage from './pages/InfoPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import CartDrawer from './components/CartDrawer.jsx'

function ScrollToTopReset() {
    const { pathname } = useLocation()
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [pathname])
    return null
}

export default function App() {
    return (
        <HashRouter>
            <ScrollToTopReset />
            <CartDrawer />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                
                {/* Institutional & Atendimento Routes */}
                <Route path="/story" element={<InfoPage tab="story" />} />
                <Route path="/revenda" element={<InfoPage tab="revenda" />} />
                <Route path="/connect" element={<InfoPage tab="connect" />} />
                <Route path="/security" element={<InfoPage tab="security" />} />
                <Route path="/payment" element={<InfoPage tab="payment" />} />
                <Route path="/delivery" element={<InfoPage tab="delivery" />} />
                <Route path="/returns" element={<InfoPage tab="returns" />} />
                <Route path="/withdrawal" element={<InfoPage tab="withdrawal" />} />
                <Route path="/privacy" element={<InfoPage tab="privacy" />} />
                <Route path="/promotional-rules" element={<InfoPage tab="promotional-rules" />} />
                <Route path="/stores" element={<InfoPage tab="stores" />} />
                <Route path="/wishlist" element={<InfoPage tab="wishlist" />} />
            </Routes>
        </HashRouter>
    )
}
