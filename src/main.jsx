import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'
import { applyTransparentButterflyFavicon } from './utils/favicon.js'

// Automatically apply transparent Meraki butterfly favicon in browser tab
applyTransparentButterflyFavicon()

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
