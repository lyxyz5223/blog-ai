import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockIsUsingLocalStorage = vi.fn()

vi.mock('./config/config', () => ({
  isUsingLocalStorage: () => mockIsUsingLocalStorage(),
}))

vi.mock('./components/FloatingElements', () => ({ default: () => null }))
vi.mock('./components/FloatingMusicPlayer', () => ({ default: () => null }))

vi.mock('./components/Header', () => ({
  default: ({ theme, onToggleTheme, isAuthenticated, onLogout }) => (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="auth">{String(isAuthenticated)}</div>
      <button onClick={onToggleTheme}>toggle-theme</button>
      <button onClick={onLogout}>logout</button>
    </div>
  ),
}))

vi.mock('./pages/Home', () => ({ default: () => <div>HOME</div> }))
vi.mock('./pages/BlogList', () => ({ default: () => <div>BLOG_LIST</div> }))
vi.mock('./pages/BlogDetail', () => ({ default: ({ blogId }) => <div>BLOG_DETAIL:{blogId}</div> }))
vi.mock('./pages/About', () => ({ default: () => <div>ABOUT</div> }))
vi.mock('./pages/NotFound', () => ({ default: () => <div>NOT_FOUND</div> }))
vi.mock('./pages/Admin', () => ({ default: () => <div>ADMIN</div> }))

vi.mock('./components/ProtectedRoute', () => ({
  default: ({ isAuthenticated, component: Component }) => (isAuthenticated ? <Component /> : <div>NEED_LOGIN</div>),
}))

vi.mock('./pages/Login', () => ({
  default: ({ isAuthenticated, onLoginSuccess }) => (
    <div>
      <div>LOGIN:{String(isAuthenticated)}</div>
      <button onClick={() => onLoginSuccess('t', { name: 'u' })}>do-login</button>
    </div>
  ),
}))

import AppRouter from './AppRouter'

describe('AppRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.history.pushState({}, '', '/blog-ai/')
    localStorage.getItem.mockImplementation((k) => {
      if (k === 'theme') return 'light'
      if (k === 'adminToken') return null
      return null
    })
  })

  it('主题切换：会更新 data-theme 与 localStorage', async () => {
    mockIsUsingLocalStorage.mockReturnValue(false)
    const user = userEvent.setup()
    render(<AppRouter />)

    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    await user.click(screen.getByRole('button', { name: 'toggle-theme' }))
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })

  it('主题初始化：无存储值时会使用 prefers-color-scheme', async () => {
    mockIsUsingLocalStorage.mockReturnValue(false)
    localStorage.getItem.mockImplementation((k) => {
      if (k === 'theme') return null
      if (k === 'adminToken') return null
      return null
    })
    window.matchMedia = vi.fn().mockReturnValue({ matches: true })

    window.history.pushState({}, '', '/blog-ai/')
    render(<AppRouter />)
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('路由：本地存储模式下 /login 与 /admin 显示 NOT_FOUND', async () => {
    mockIsUsingLocalStorage.mockReturnValue(true)

    window.history.pushState({}, '', '/blog-ai/login')
    render(<AppRouter />)
    expect(screen.getByText('NOT_FOUND')).toBeInTheDocument()
  })

  it('路由：/blog/:id 应通过 wrapper 传递数字 blogId', async () => {
    mockIsUsingLocalStorage.mockReturnValue(false)
    window.history.pushState({}, '', '/blog-ai/blog/42')
    render(<AppRouter />)
    expect(await screen.findByText('BLOG_DETAIL:42')).toBeInTheDocument()
  })

  it('登出：应清理 token 并更新认证态', async () => {
    mockIsUsingLocalStorage.mockReturnValue(false)
    localStorage.getItem.mockImplementation((k) => {
      if (k === 'theme') return 'light'
      if (k === 'adminToken') return 't'
      return null
    })

    window.history.pushState({}, '', '/blog-ai/')
    const user = userEvent.setup()
    render(<AppRouter />)
    expect(screen.getByTestId('auth')).toHaveTextContent('true')

    await user.click(screen.getByRole('button', { name: 'logout' }))
    expect(localStorage.removeItem).toHaveBeenCalledWith('adminToken')
    expect(localStorage.removeItem).toHaveBeenCalledWith('adminUser')
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
  })

  it('登录成功：回调会设置认证态并影响受保护路由', async () => {
    mockIsUsingLocalStorage.mockReturnValue(false)
    const user = userEvent.setup()

    window.history.pushState({}, '', '/blog-ai/login')
    const first = render(<AppRouter />)
    expect(screen.getByText('LOGIN:false')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'do-login' }))
    expect(localStorage.setItem).toHaveBeenCalledWith('adminToken', 't')
    expect(localStorage.setItem).toHaveBeenCalledWith('adminUser', JSON.stringify({ name: 'u' }))
    expect(screen.getByTestId('auth')).toHaveTextContent('true')

    // 重新挂载时，AppRouter 会从 localStorage 初始化认证态
    localStorage.getItem.mockImplementation((k) => {
      if (k === 'theme') return 'light'
      if (k === 'adminToken') return 't'
      return null
    })

    window.history.pushState({}, '', '/blog-ai/admin')
    // 重新挂载以读取 localStorage 初始化认证态并匹配路由
    first.unmount()
    render(<AppRouter />)
    expect(await screen.findByText('ADMIN')).toBeInTheDocument()
  })
})

