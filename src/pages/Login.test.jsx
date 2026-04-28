import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const navigateMock = vi.fn()
const mockLoadConfig = vi.fn()
const mockGetApiEndpoint = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('../config/config', () => ({
  loadConfig: (...args) => mockLoadConfig(...args),
  getApiEndpoint: (...args) => mockGetApiEndpoint(...args),
}))

import Login from './Login'

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false, apiEndpoint: 'http://example.test/api' })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    global.fetch = vi.fn()
  })

  it('已认证：应直接导航到 /admin 并返回 null', () => {
    const { container } = render(<Login isAuthenticated={true} onLoginSuccess={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
    expect(navigateMock).toHaveBeenCalledWith('/admin')
  })

  it('登录成功：保存 token/user，回调并导航', async () => {
    const user = userEvent.setup()
    const onLoginSuccess = vi.fn()

    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        success: true,
        token: 't',
        user: { name: 'u' },
      }),
    })

    render(<Login isAuthenticated={false} onLoginSuccess={onLoginSuccess} />)

    await user.type(screen.getByLabelText('用户名'), 'admin')
    await user.type(screen.getByLabelText('密码'), 'admin123')
    await user.click(screen.getByRole('button', { name: '登录' }))

    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledWith('t', { name: 'u' })
      expect(navigateMock).toHaveBeenCalledWith('/admin')
    })
    expect(localStorage.setItem).toHaveBeenCalledWith('adminToken', 't')
    expect(localStorage.setItem).toHaveBeenCalledWith('adminUser', JSON.stringify({ name: 'u' }))
  })

  it('登录失败：显示后端 message', async () => {
    const user = userEvent.setup()

    global.fetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue({
        success: false,
        message: 'bad',
      }),
    })

    render(<Login isAuthenticated={false} onLoginSuccess={vi.fn()} />)
    await user.type(screen.getByLabelText('用户名'), 'x')
    await user.type(screen.getByLabelText('密码'), 'y')
    await user.click(screen.getByRole('button', { name: '登录' }))

    expect(await screen.findByText('bad')).toBeInTheDocument()
  })

  it('请求异常：显示“服务器连接”提示', async () => {
    const user = userEvent.setup()
    global.fetch = vi.fn().mockRejectedValue(new Error('network'))

    render(<Login isAuthenticated={false} onLoginSuccess={vi.fn()} />)
    await user.type(screen.getByLabelText('用户名'), 'x')
    await user.type(screen.getByLabelText('密码'), 'y')
    await user.click(screen.getByRole('button', { name: '登录' }))

    expect(await screen.findByText('登录请求失败，请检查服务器连接')).toBeInTheDocument()
  })
})
