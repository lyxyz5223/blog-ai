import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Handle GitHub Pages SPA routing redirect from 404.html
if (window.location.search) {
  const params = new URLSearchParams(window.location.search)
  const params_str = params.toString().replace(/~and~/g, '&')
  window.history.replaceState(null, null, window.location.pathname + (params_str ? '?' + params_str : '') + window.location.hash)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
