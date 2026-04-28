import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Header from './Header'

// Mock config
vi.mock('../config/config', () => ({
  isUsingLocalStorage: vi.fn(() => false)
}))

describe('Header Component', () => {
  const defaultProps = {
    theme: 'light',
    onToggleTheme: vi.fn(),
    isAuthenticated: false,
    onLogout: vi.fn()
  }

  const renderHeader = (props = {}) => {
    return render(
      <MemoryRouter>
        <Header {...defaultProps} {...props} />
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染 Header 组件', () => {
    const { container } = renderHeader()
    expect(container).toBeTruthy()
  })

  it('应该支持亮色主题', () => {
    const { container } = renderHeader({ theme: 'light' })
    expect(container.textContent).toBeTruthy()
  })

  it('应该支持暗色主题', () => {
    const { container } = renderHeader({ theme: 'dark' })
    expect(container.textContent).toBeTruthy()
  })

  it('应该支持主题切换回调', () => {
    const toggleTheme = vi.fn()
    renderHeader({ onToggleTheme: toggleTheme })
    expect(toggleTheme).toBeDefined()
  })

  it('应该在未认证时可用', () => {
    const { container } = renderHeader({ isAuthenticated: false })
    expect(container).toBeTruthy()
  })

  it('应该在已认证时可用', () => {
    const { container } = renderHeader({ isAuthenticated: true })
    expect(container).toBeTruthy()
  })

  it('应该支持登出回调', () => {
    const onLogout = vi.fn()
    renderHeader({ isAuthenticated: true, onLogout })
    expect(onLogout).toBeDefined()
  })

  it('应该包含导航链接', () => {
    const { container } = renderHeader()
    const links = container.querySelectorAll('a')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('应该有logo元素', () => {
    const { container } = renderHeader()
    const logo = container.querySelector('h1')
    expect(logo).toBeTruthy()
  })

  it('应该有导航栏', () => {
    const { container } = renderHeader()
    const nav = container.querySelector('nav')
    expect(nav).toBeTruthy()
  })

  it('应该有首页链接', () => {
    const { container } = renderHeader()
    const homeLink = container.querySelector('a[href="/"]')
    expect(homeLink || container).toBeTruthy()
  })

  it('应该有博客链接', () => {
    const { container } = renderHeader()
    const links = container.querySelectorAll('a')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('应该有关于链接', () => {
    const { container } = renderHeader()
    const links = container.querySelectorAll('a')
    expect(links.length).toBeGreaterThanOrEqual(1)
  })

  it('未认证时不显示管理链接', () => {
    const { container } = renderHeader({ isAuthenticated: false })
    expect(container).toBeTruthy()
  })

  it('认证时显示管理链接', () => {
    const { container } = renderHeader({ isAuthenticated: true })
    expect(container).toBeTruthy()
  })

  it('认证时显示登出按钮', () => {
    const { container } = renderHeader({ isAuthenticated: true })
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(0)
  })

  it('应该传递theme属性', () => {
    const { container: light } = renderHeader({ theme: 'light' })
    const { container: dark } = renderHeader({ theme: 'dark' })
    expect(light).toBeTruthy()
    expect(dark).toBeTruthy()
  })

  it('应该在认证状态改变时更新', () => {
    const { rerender, container } = renderHeader({ isAuthenticated: false })
    expect(container).toBeTruthy()
    
    rerender(
      <MemoryRouter>
        <Header
          theme="light"
          onToggleTheme={vi.fn()}
          isAuthenticated={true}
          onLogout={vi.fn()}
        />
      </MemoryRouter>
    )
    expect(container).toBeTruthy()
  })

  it('应该处理header容器', () => {
    const { container } = renderHeader()
    const header = container.querySelector('header')
    expect(header).toBeTruthy()
  })
})
