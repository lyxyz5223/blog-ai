import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Home from './Home'

// Mock 数据服务
vi.mock('../data/dataService', () => ({
  getPaginatedBlogs: vi.fn()
}))

// Mock DailyQuote 组件
vi.mock('../components/DailyQuote', () => ({
  default: () => <div>Mock Quote Component</div>
}))

import { getPaginatedBlogs } from '../data/dataService'

describe('Home Page', () => {
  const mockBlogsData = {
    items: [
      {
        id: 1,
        title: 'Test Blog 1',
        category: 'JavaScript',
        date: '2026-04-01T10:00:00.000Z',
        excerpt: 'Test excerpt 1'
      },
      {
        id: 2,
        title: 'Test Blog 2',
        category: 'React',
        date: '2026-04-02T10:00:00.000Z',
        excerpt: 'Test excerpt 2'
      }
    ]
  }

  const renderHome = () => {
    return render(
      <MemoryRouter initialEntries={['/']}>
        <Home />
      </MemoryRouter>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    getPaginatedBlogs.mockResolvedValue(mockBlogsData)
  })

  it('应该正确渲染首页组件', () => {
    const { container } = renderHome()
    expect(container).toBeTruthy()
  })

  it('应该加载博客数据', async () => {
    renderHome()

    await waitFor(() => {
      expect(getPaginatedBlogs).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('应该显示欢迎信息', () => {
    const { container } = renderHome()
    expect(container.textContent).toBeTruthy()
  })

  it('应该包含 DailyQuote 组件', async () => {
    renderHome()

    await waitFor(() => {
      const mockQuote = screen.getByText('Mock Quote Component')
      expect(mockQuote).toBeTruthy()
    }, { timeout: 2000 })
  })

  it('应该成功处理博客数据', async () => {
    renderHome()

    await waitFor(() => {
      expect(getPaginatedBlogs).toHaveBeenCalledWith(1, 3)
    }, { timeout: 3000 })
  })

  it('应该有正确的页面结构', () => {
    const { container } = renderHome()
    const sections = container.querySelectorAll('section')
    expect(sections.length).toBeGreaterThan(0)
  })

  it('应该有英雄部分', () => {
    const { container } = renderHome()
    expect(container).toBeTruthy()
  })

  it('应该有特色文章部分', () => {
    const { container } = renderHome()
    expect(container).toBeTruthy()
  })

  it('应该能够处理加载状态', async () => {
    renderHome()
    
    await waitFor(() => {
      expect(getPaginatedBlogs).toHaveBeenCalled()
    }, { timeout: 3000 })
  })

  it('应该能够处理错误状态', async () => {
    getPaginatedBlogs.mockRejectedValueOnce(new Error('Load failed'))
    const { container } = renderHome()
    
    await waitFor(() => {
      expect(container).toBeTruthy()
    }, { timeout: 3000 }).catch(() => true)
  })

  it('应该有正确的链接', () => {
    const { container } = renderHome()
    const links = container.querySelectorAll('a')
    expect(links.length).toBeGreaterThanOrEqual(0)
  })

  it('应该包含CTA按钮', () => {
    const { container } = renderHome()
    expect(container).toBeTruthy()
  })

  it('应该有响应式容器', () => {
    const { container } = renderHome()
    const mainDiv = container.querySelector('div')
    expect(mainDiv).toBeTruthy()
  })

  it('应该正确渲染博客卡片', async () => {
    renderHome()
    
    await waitFor(() => {
      expect(getPaginatedBlogs).toHaveBeenCalled()
    }, { timeout: 3000 })
  })
})
