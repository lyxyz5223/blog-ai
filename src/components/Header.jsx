import { useLocation, Link, useNavigate } from 'react-router'
import { isUsingLocalStorage } from '../config/config'
import './Header.css'

function Header({ theme, onToggleTheme, isAuthenticated, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => {
    return location.pathname === path ? 'active' : ''
  }

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>My Blog</h1>
        </Link>
        <nav className="nav">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/')}`}
          >
            首页
          </Link>
          <Link 
            to="/blogs" 
            className={`nav-link ${isActive('/blogs') || location.pathname.startsWith('/blogs/page/') ? 'active' : ''}`}
          >
            博客
          </Link>
          <Link 
            to="/about" 
            className={`nav-link ${isActive('/about')}`}
          >
            关于我
          </Link>
          {!isUsingLocalStorage() && isAuthenticated ? (
            <>
              <Link 
                to="/admin" 
                className={`nav-link ${isActive('/admin')}`}
                title="管理后台"
              >
                📝 管理
              </Link>
              <button 
                className="nav-link logout-btn"
                onClick={handleLogout}
                title="登出"
              >
                🚪 登出
              </button>
            </>
          ) : null}
          <button 
            className="nav-link theme-toggle"
            onClick={onToggleTheme}
            title={theme === 'light' ? '切换到夜间模式' : '切换到日间模式'}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header
