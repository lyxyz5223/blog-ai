import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Handle GitHub Pages SPA routing redirect from 404.html
// When accessing a non-existent route (like /blog-ai/blog/1), 
// GitHub Pages serves 404.html which redirects to /blog-ai/ and saves the original path in sessionStorage
// This code restores the original path so React Router can handle it
if (sessionStorage.redirect) {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  
  // Restore the original path
  const basePath = '/blog-ai/';
  const targetPath = redirect.startsWith('/') ? redirect : '/' + redirect;
  
  console.log(`🔄 [SPA Router] 从 sessionStorage 恢复路由: ${targetPath}`);
  window.history.replaceState(null, null, basePath + targetPath);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
