import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Handle GitHub Pages SPA routing redirect from 404.html
// When accessing a non-existent route (like /blog-ai/invalid), 
// GitHub Pages serves 404.html which redirects to /blog-ai/ and saves the path in sessionStorage
// This code restores that path so React Router can handle it (and show NotFound if route doesn't exist)
if (sessionStorage.redirectPath) {
  const redirectPath = sessionStorage.redirectPath;
  delete sessionStorage.redirectPath;
  
  // Restore the original path
  const basePath = '/blog-ai/';
  // Remove leading slash if present to avoid double slashes when concatenating
  const cleanPath = redirectPath.startsWith('/') ? redirectPath.slice(1) : redirectPath;
  
  console.log(`🔄 [SPA Router] 恢复路由: ${cleanPath}`);
  console.log(`   若路由不存在，将显示 NotFound 页面`);
  
  window.history.replaceState(null, null, basePath + cleanPath);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
