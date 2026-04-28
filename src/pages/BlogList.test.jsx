import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router'
import BlogList from './BlogList'

vi.mock('../data/dataService', () => ({
  getPaginatedBlogs: vi.fn(),
  getCategories: vi.fn(),
  getPaginatedBlogsByCategory: vi.fn(),
  getPaginatedBlogsByCategories: vi.fn(),
  searchBlogs: vi.fn(),
}))

import {
  getPaginatedBlogs,
  getCategories,
  getPaginatedBlogsByCategory,
  getPaginatedBlogsByCategories,
  searchBlogs,
} from '../data/dataService'

describe('BlogList Page', () => {
  const mockBlogsData = (overrides = {}) => ({
    items: [
      {
        id: 1,
        title: 'Blog 1',
        category: 'JavaScript',
        date: '2026-04-01T10:00:00.000Z',
        excerpt: 'Blog excerpt 1',
      },
      {
        id: 2,
        title: 'Blog 2',
        category: 'React',
        date: '2026-04-02T10:00:00.000Z',
        excerpt: 'Blog excerpt 2',
      },
    ],
    total: 20,
    page: 1,
    pageSize: 10,
    totalPages: 3,
    ...overrides,
  })

  const mockCategories = [
    { name: 'JavaScript', count: 10 },
    { name: 'React', count: 5 },
    { name: 'Vue', count: 3 },
  ]

  const renderBlogList = (initialPath = '/blogs/page/1') =>
    render(
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/page/:page" element={<BlogList />} />
        </Routes>
      </MemoryRouter>
    )

  beforeEach(() => {
    vi.clearAllMocks()
    window.scrollTo = vi.fn()
    getCategories.mockResolvedValue(mockCategories)
    getPaginatedBlogs.mockResolvedValue(mockBlogsData({ totalPages: 10 }))
  })

  it('默认加载：渲染文章列表、分类按钮与分页', async () => {
    renderBlogList('/blogs/page/8')
    await waitFor(() => expect(getPaginatedBlogs).toHaveBeenCalledWith(8, 10))

    expect(await screen.findByText('Blog 1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /全部/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /JavaScript/ })).toBeInTheDocument()
    expect(screen.getByText('首页')).toBeInTheDocument()
    expect(screen.getByText('...')).toBeInTheDocument()
  })

  it('单分类：点击分类按钮会调用 getPaginatedBlogsByCategory', async () => {
    const user = userEvent.setup()
    getPaginatedBlogsByCategory.mockResolvedValue(mockBlogsData({ total: 5, totalPages: 1 }))

    renderBlogList('/blogs')
    await screen.findByText('Blog 1')

    await user.click(screen.getByRole('button', { name: /React/ }))

    await waitFor(() => {
      expect(getPaginatedBlogsByCategory).toHaveBeenCalledWith('React', 1, 10)
    })
  })

  it('多分类：选择两个分类会调用 getPaginatedBlogsByCategories', async () => {
    const user = userEvent.setup()
    getPaginatedBlogsByCategories.mockResolvedValue(mockBlogsData({ total: 8, totalPages: 1 }))

    renderBlogList('/blogs')
    await screen.findByText('Blog 1')

    await user.click(screen.getByRole('button', { name: /JavaScript/ }))
    await user.click(screen.getByRole('button', { name: /React/ }))

    await waitFor(() => {
      expect(getPaginatedBlogsByCategories).toHaveBeenCalledWith(['JavaScript', 'React'], 1, 10)
    })
  })

  it('搜索：输入关键词并点击搜索会调用 searchBlogs，并可清除', async () => {
    const user = userEvent.setup()
    searchBlogs.mockResolvedValue(mockBlogsData({ total: 2, totalPages: 1 }))

    renderBlogList('/blogs')
    await screen.findByText('Blog 1')

    await user.type(screen.getByPlaceholderText('搜索文章...'), 'react')
    await user.click(screen.getByTitle('搜索'))

    await waitFor(() => {
      expect(searchBlogs).toHaveBeenCalledWith('react', 1, 10)
    })

    expect(await screen.findByText(/搜索:/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '清除' }))
    await waitFor(() => {
      expect(getPaginatedBlogs).toHaveBeenCalled()
    })
  })

  it('分页：应渲染页码链接', async () => {
    renderBlogList('/blogs/page/2')
    await waitFor(() => expect(getPaginatedBlogs).toHaveBeenCalledWith(2, 10))
    expect(await screen.findByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('分页：只有一页时不渲染分页栏', async () => {
    getPaginatedBlogs.mockResolvedValueOnce(mockBlogsData({ totalPages: 1 }))
    const { container } = renderBlogList('/blogs')
    await screen.findByText('Blog 1')
    expect(container.querySelector('.pagination')).toBeNull()
  })

  it('搜索：按回车也会触发搜索，空值点击不会搜索', async () => {
    const user = userEvent.setup()
    searchBlogs.mockResolvedValue(mockBlogsData({ total: 1, totalPages: 1 }))

    renderBlogList('/blogs')
    await screen.findByText('Blog 1')

    await user.click(screen.getByTitle('搜索'))
    expect(searchBlogs).not.toHaveBeenCalled()

    await user.type(screen.getByPlaceholderText('搜索文章...'), 'js{enter}')
    await waitFor(() => {
      expect(searchBlogs).toHaveBeenCalledWith('js', 1, 10)
    })
  })

  it('分类：再次点击已选分类会取消选择并回退到全部列表', async () => {
    const user = userEvent.setup()
    getPaginatedBlogsByCategory.mockResolvedValue(mockBlogsData({ total: 5, totalPages: 1 }))

    renderBlogList('/blogs')
    await screen.findByText('Blog 1')

    const reactBtn = screen.getByRole('button', { name: /React/ })
    await user.click(reactBtn)
    await waitFor(() => {
      expect(getPaginatedBlogsByCategory).toHaveBeenCalledWith('React', 1, 10)
    })

    await user.click(reactBtn)
    await waitFor(() => {
      expect(getPaginatedBlogs).toHaveBeenCalled()
    })
  })

  it('分页：第一页展示末页，最后一页展示首页', async () => {
    renderBlogList('/blogs')
    await screen.findByText('Blog 1')
    expect(screen.getByText('末页')).toBeInTheDocument()

    renderBlogList('/blogs/page/10')
    await waitFor(() => expect(getPaginatedBlogs).toHaveBeenCalledWith(10, 10))
    expect(await screen.findByText('首页')).toBeInTheDocument()
  })

  it('无结果：items 为空时显示 no-results', async () => {
    getPaginatedBlogs.mockResolvedValueOnce(mockBlogsData({ items: [], total: 0, totalPages: 1 }))
    renderBlogList('/blogs')
    expect(await screen.findByText('没有找到匹配的文章')).toBeInTheDocument()
  })

  it('API 错误：显示错误提示', async () => {
    getPaginatedBlogs.mockRejectedValueOnce(new Error('API Error'))
    renderBlogList('/blogs')
    expect(await screen.findByText(/加载数据失败/)).toBeInTheDocument()
  })
})
