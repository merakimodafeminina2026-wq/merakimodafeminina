import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'
import { applyTransparentButterflyFavicon } from './utils/favicon.js'

// Automatically apply transparent Meraki butterfly favicon in browser tab
applyTransparentButterflyFavicon()

// Security Purge: Ensure sensitive user data is never stored in persistent localStorage
try {
    localStorage.removeItem('meraki_users')
    localStorage.removeItem('meraki_session')
} catch (e) {}

// Auto-recover from stale Vercel asset 404s after new deployments
window.addEventListener('error', (event) => {
    const src = event?.target?.src || event?.filename || ''
    if (src.includes('/assets/') || event?.message?.includes('chunk') || event?.message?.includes('Importing a module')) {
        const reloaded = sessionStorage.getItem('meraki_asset_reload')
        if (!reloaded) {
            sessionStorage.setItem('meraki_asset_reload', 'true')
            window.location.reload()
        }
    }
}, true)

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
