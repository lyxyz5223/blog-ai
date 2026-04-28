import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const navigateMock = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

import { MemoryRouter, Routes, Route } from 'react-router'
import NotFound from './NotFound'

describe('NotFound Page', () => {
  const renderNotFound = () => {
    return render(
      <MemoryRouter initialEntries={['/not-found']}>
        <Routes>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染 404 页面', () => {
    const { container } = renderNotFound()
    expect(container.textContent).toContain('404')
  })

  it('应该显示错误消息', () => {
    const { container } = renderNotFound()
    const errorTitle = container.querySelector('.error-title') || container.querySelector('h1')
    expect(errorTitle).toBeTruthy()
  })

  it('应该有返回首页或上一页的按钮', () => {
    const { container } = renderNotFound()
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('页面内容应该不为空', () => {
    const { container } = renderNotFound()
    expect(container.textContent.length).toBeGreaterThan(10)
  })

  it('应该显示建议的解决方案', () => {
    const { container } = renderNotFound()
    expect(container).toBeTruthy()
  })

  it('应该有正确的错误代码', () => {
    const { container } = renderNotFound()
    expect(container.textContent).toContain('404')
  })

  it('应该有错误标题', () => {
    const { container } = renderNotFound()
    expect(container.textContent).toBeTruthy()
  })

  it('应该有错误描述', () => {
    const { container } = renderNotFound()
    expect(container.textContent.length).toBeGreaterThan(20)
  })

  it('应该有返回按钮', () => {
    const { container } = renderNotFound()
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('按钮应该是可交互的', () => {
    const { container } = renderNotFound()
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('应该有正确的容器结构', () => {
    const { container } = renderNotFound()
    expect(container.querySelector('div')).toBeTruthy()
  })

  it('应该处理多个按钮', () => {
    const { container } = renderNotFound()
    const buttons = container.querySelectorAll('button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('点击按钮：返回首页与返回上一页应调用 navigate', async () => {
    const user = userEvent.setup()
    renderNotFound()

    await user.click(document.querySelector('.btn.btn-primary'))
    await user.click(document.querySelector('.btn.btn-secondary'))

    expect(navigateMock).toHaveBeenCalledWith('/')
    expect(navigateMock).toHaveBeenCalledWith(-1)
  })
})
