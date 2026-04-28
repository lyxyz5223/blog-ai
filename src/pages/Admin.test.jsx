import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import Admin from './Admin'

const mockLoadConfig = vi.fn()
const mockUpdateConfig = vi.fn()
const mockGetApiEndpoint = vi.fn()

const mockGetPaginatedBlogs = vi.fn()
const mockGetBlogDetail = vi.fn()
const mockCreateBlog = vi.fn()
const mockUpdateBlog = vi.fn()
const mockDeleteBlog = vi.fn()
const mockGetLocalBlogsData = vi.fn()
const mockClearAllBlogsCache = vi.fn()

vi.mock('../config/config', () => ({
  loadConfig: (...args) => mockLoadConfig(...args),
  updateConfig: (...args) => mockUpdateConfig(...args),
  isUsingLocalStorage: vi.fn(),
  getApiEndpoint: (...args) => mockGetApiEndpoint(...args),
}))

vi.mock('../data/dataService', () => ({
  getBlogsData: vi.fn(),
  getBlogDetail: (...args) => mockGetBlogDetail(...args),
  getPaginatedBlogs: (...args) => mockGetPaginatedBlogs(...args),
  createBlog: (...args) => mockCreateBlog(...args),
  updateBlog: (...args) => mockUpdateBlog(...args),
  deleteBlog: (...args) => mockDeleteBlog(...args),
  getLocalBlogsData: (...args) => mockGetLocalBlogsData(...args),
  clearAllBlogsCache: (...args) => mockClearAllBlogsCache(...args),
  clearBlogCache: vi.fn(),
}))

vi.mock('../components/MarkdownEditor', () => ({
  default: ({ value, onChange, placeholder }) => (
    <textarea
      aria-label="markdown-editor"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

describe('Admin Page', () => {
  const renderAdmin = () =>
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    )

  beforeEach(() => {
    vi.clearAllMocks()
    window.alert = vi.fn()
    window.confirm = vi.fn().mockReturnValue(true)

    mockLoadConfig.mockResolvedValue({
      useLocalStorage: true,
      apiEndpoint: 'http://example.test/api',
    })

    mockGetPaginatedBlogs.mockResolvedValue({
      items: [
        {
          id: 1,
          title: 'Blog 1',
          category: 'React',
          datetime: '2026-04-03T04:26:00.000Z',
          excerpt: 'ex',
          author: 'me',
        },
      ],
      total: 11,
      totalPages: 2,
    })

    mockGetBlogDetail.mockResolvedValue({
      id: 1,
      title: 'Blog 1',
      category: 'React',
      datetime: '2026-04-03T04:26:00.000Z',
      excerpt: 'ex',
      author: 'me',
      content: '# content',
    })
  })

  it('初始化：加载配置与分页数据并渲染列表/分页控件', async () => {
    renderAdmin()

    expect(await screen.findByText('📝 博客管理后台')).toBeInTheDocument()

    await waitFor(() => {
      expect(mockGetPaginatedBlogs).toHaveBeenCalledWith(1, 10)
    })

    expect(await screen.findByText('Blog 1')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /下一页/ })).toBeInTheDocument()
  })

  it('编辑：点击列表项会加载完整内容并进入表单编辑态', async () => {
    const user = userEvent.setup()
    renderAdmin()

    const item = await screen.findByText('Blog 1')
    await user.click(item)

    await waitFor(() => {
      expect(mockGetBlogDetail).toHaveBeenCalledWith(1)
    })

    expect(await screen.findByText('编辑文章')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Blog 1')).toBeInTheDocument()
    expect(screen.getByLabelText('markdown-editor')).toHaveValue('# content')
  })

  it('本地模式：新建并保存会更新列表并提示导出', async () => {
    const user = userEvent.setup()
    renderAdmin()

    await screen.findByText('Blog 1')
    await user.click(screen.getByRole('button', { name: /新建文章/ }))

    await user.type(screen.getByPlaceholderText('输入文章标题'), 'New Title')
    await user.type(screen.getByPlaceholderText('输入文章摘要（将显示在列表页）'), 'New Ex')
    await user.type(screen.getByPlaceholderText('如：React, JavaScript'), 'JS')
    await user.type(screen.getByPlaceholderText('作者名'), 'Author')
    await user.type(screen.getByLabelText('markdown-editor'), '# New Content')

    await user.click(screen.getByRole('button', { name: /保存/ }))

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('新文章已创建'))
    expect(await screen.findByText('New Title')).toBeInTheDocument()
  })

  it('切换到数据库模式：会更新配置、清空缓存并重新加载第一页', async () => {
    const user = userEvent.setup()
    renderAdmin()

    await screen.findByText('Blog 1')

    // checkbox checked={!useLocal}，初始 useLocal=true => checked=false
    const checkbox = screen.getByRole('checkbox')
    await user.click(checkbox)

    await waitFor(() => {
      expect(mockUpdateConfig).toHaveBeenCalled()
      expect(mockClearAllBlogsCache).toHaveBeenCalled()
    })

    expect(mockGetPaginatedBlogs).toHaveBeenCalledWith(1, 10)
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('已切换到数据库模式'))
  })

  it('数据库模式：保存/删除会调用对应 API', async () => {
    mockLoadConfig.mockResolvedValueOnce({ useLocalStorage: false, apiEndpoint: 'http://example.test/api' })
    mockGetPaginatedBlogs.mockResolvedValueOnce({
      items: [{ id: 2, title: 'DB Blog', category: 'React', datetime: '2026-01-01T00:00', excerpt: 'ex', author: 'me' }],
      total: 1,
      totalPages: 1,
    })
    mockGetBlogDetail.mockResolvedValueOnce({
      id: 2,
      title: 'DB Blog',
      category: 'React',
      datetime: '2026-01-01T00:00',
      excerpt: 'ex',
      author: 'me',
      content: '# c',
    })
    mockUpdateBlog.mockResolvedValueOnce({
      id: 2,
      title: 'DB Blog updated',
      category: 'React',
      datetime: '2026-01-01T00:00',
      excerpt: 'ex',
      author: 'me',
      content: '# c',
    })
    mockDeleteBlog.mockResolvedValueOnce({ success: true })

    const user = userEvent.setup()
    renderAdmin()

    const item = await screen.findByText('DB Blog')
    await user.click(item)
    await screen.findByText('编辑文章')

    await user.clear(screen.getByPlaceholderText('输入文章标题'))
    await user.type(screen.getByPlaceholderText('输入文章标题'), 'DB Blog updated')
    await user.click(screen.getByRole('button', { name: /保存/ }))

    await waitFor(() => {
      expect(mockUpdateBlog).toHaveBeenCalled()
    })
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('文章已更新'))

    // 保存后会退出编辑态，重新进入后再删除
    await user.click(await screen.findByText('DB Blog updated'))
    await screen.findByText('编辑文章')

    await user.click(screen.getByRole('button', { name: /删除/ }))
    await waitFor(() => {
      expect(mockDeleteBlog).toHaveBeenCalledWith(2)
    })
    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('文章已删除'))
  })

  it('初始化失败：应回退到本地数据并展示错误', async () => {
    mockLoadConfig.mockRejectedValueOnce(new Error('config fail'))
    mockGetLocalBlogsData.mockReturnValueOnce([
      { id: 1, title: 'Local', category: 'C', datetime: '2026-01-01T00:00', excerpt: 'ex', author: 'me', content: 'c' },
    ])

    renderAdmin()

    expect(await screen.findByText(/初始化失败/)).toBeInTheDocument()
    expect(await screen.findByText('Local')).toBeInTheDocument()
  })

  it('保存校验：必填缺失会 alert 并不调用 API', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await screen.findByText('Blog 1')

    await user.click(screen.getByRole('button', { name: /新建文章/ }))
    await user.click(screen.getByRole('button', { name: /保存/ }))

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('请填写必需字段'))
    expect(mockCreateBlog).not.toHaveBeenCalled()
    expect(mockUpdateBlog).not.toHaveBeenCalled()
  })

  it('删除：confirm=false 时应直接返回', async () => {
    window.confirm = vi.fn().mockReturnValue(false)
    const user = userEvent.setup()

    mockLoadConfig.mockResolvedValueOnce({ useLocalStorage: false, apiEndpoint: 'http://example.test/api' })
    mockGetPaginatedBlogs.mockResolvedValueOnce({
      items: [{ id: 2, title: 'DB Blog', category: 'React', datetime: '2026-01-01T00:00', excerpt: 'ex', author: 'me' }],
      total: 1,
      totalPages: 1,
    })
    mockGetBlogDetail.mockResolvedValueOnce({
      id: 2,
      title: 'DB Blog',
      category: 'React',
      datetime: '2026-01-01T00:00',
      excerpt: 'ex',
      author: 'me',
      content: '# c',
    })

    renderAdmin()
    await user.click(await screen.findByText('DB Blog'))
    await screen.findByText('编辑文章')
    await user.click(screen.getByRole('button', { name: /删除/ }))

    expect(mockDeleteBlog).not.toHaveBeenCalled()
  })

  it('导出：应创建链接并触发下载', async () => {
    const user = userEvent.setup()
    const createObjectURL = vi.fn().mockReturnValue('blob:1')
    const revokeObjectURL = vi.fn()
    URL.createObjectURL = createObjectURL
    URL.revokeObjectURL = revokeObjectURL

    const clickSpy = vi.fn()
    const originalCreateElement = document.createElement.bind(document)
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = originalCreateElement(tagName)
      if (tagName === 'a') el.click = clickSpy
      return el
    })

    renderAdmin()
    await screen.findByText('Blog 1')
    await user.click(screen.getByRole('button', { name: /导出数据/ }))

    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:1')
  })

  it('分页加载失败：应 alert 提示', async () => {
    const user = userEvent.setup()
    mockGetPaginatedBlogs
      .mockResolvedValueOnce({
        items: [{ id: 1, title: 'Blog 1', category: 'React', datetime: '2026-01-01T00:00', excerpt: 'ex', author: 'me' }],
        total: 11,
        totalPages: 2,
      })
      .mockRejectedValueOnce(new Error('page fail'))

    renderAdmin()
    await screen.findByText('Blog 1')
    await user.click(screen.getByRole('button', { name: /下一页/ }))

    expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('加载页面失败'))
  })
})
