import { useState } from 'react'
import { useNavigate } from 'react-router'
import './Login.css'

function Login({ isAuthenticated, onLoginSuccess }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const apiEndpoint = localStorage.getItem('apiEndpoint') || 'http://localhost:5000/api'
      const response = await fetch(`${apiEndpoint}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      })

      const data = await response.json()

      if (data.success) {
        // 保存token到localStorage
        localStorage.setItem('adminToken', data.token)
        localStorage.setItem('adminUser', JSON.stringify(data.user))
        
        // 调用回调函数
        onLoginSuccess(data.token, data.user)
        
        // 导航到管理页面
        navigate('/admin')
      } else {
        setError(data.message || '登录失败')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('登录请求失败，请检查服务器连接')
    } finally {
      setLoading(false)
    }
  }

  // 如果已认证，重定向到管理页面
  if (isAuthenticated) {
    navigate('/admin')
    return null
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">博客管理系统</h1>
        <p className="login-subtitle">管理员登录</p>
        
        {error && <div className="login-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">用户名</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <div className="login-help">
          <p><strong>演示账号：</strong></p>
          <p>用户名: <code>admin</code></p>
          <p>密码: <code>admin123</code></p>
        </div>
      </div>
    </div>
  )
}

export default Login
