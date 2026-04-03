import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router'
import { isUsingLocalStorage } from './config/config'
import './App.css'
import Header from './components/Header'
import FloatingElements from './components/FloatingElements'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import BlogList from './pages/BlogList'
import BlogDetail from './pages/BlogDetail'
import About from './pages/About'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

function AppRouter() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('adminToken')
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminUser')
    setIsAuthenticated(false)
  }

  const handleLoginSuccess = (token, user) => {
    localStorage.setItem('adminToken', token)
    localStorage.setItem('adminUser', JSON.stringify(user))
    setIsAuthenticated(true)
  }

  return (
    <Router basename="/blog-ai/">
      <div className="app">
        <FloatingElements />
        
        <Header 
          theme={theme} 
          onToggleTheme={toggleTheme}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
        />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/page/:page" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogDetailWrapper />} />
          <Route path="/about" element={<About />} />
          <Route 
            path="/login" 
            element={
              !isUsingLocalStorage() ? (
                <Login 
                  isAuthenticated={isAuthenticated}
                  onLoginSuccess={handleLoginSuccess}
                />
              ) : (
                <NotFound />
              )
            } 
          />
          <Route
            path="/admin"
            element={
              !isUsingLocalStorage() ? (
                <ProtectedRoute 
                  isAuthenticated={isAuthenticated}
                  component={Admin}
                />
              ) : (
                <NotFound />
              )
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>

      </div>
    </Router>
  )
}

// 包装组件处理URL参数
function BlogDetailWrapper() {
  const { id } = useParams()
  return <BlogDetail blogId={parseInt(id)} />
}

export default AppRouter
