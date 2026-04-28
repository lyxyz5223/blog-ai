import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

const navigateMock = vi.fn()
const mockGetBlogDetail = vi.fn()
const mockGetBlogsData = vi.fn()

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

vi.mock('../data/dataService', () => ({
  getBlogDetail: (...args) => mockGetBlogDetail(...args),
  getBlogsData: (...args) => mockGetBlogsData(...args),
}))

vi.mock('../components/GitHubComments', () => ({
  default: ({ blogId, blogTitle, theme }) => (
    <div data-testid="comments">
      comments:{blogId}:{blogTitle}:{theme}
    </div>
  ),
}))

vi.mock('react-syntax-highlighter', () => ({
  Prism: ({ children }) => <pre data-testid="code-block">{children}</pre>,
}))
vi.mock('react-syntax-highlighter/dist/esm/styles/prism', () => ({ dracula: {}, vs: {} }))

// 用 mock 的 ReactMarkdown 来触发 markdownComponents 分支（inline code / block code / img）
vi.mock('react-markdown', () => ({
  default: ({ components, children }) => (
    <div>
      <div data-testid="md-raw">{children}</div>
      <div data-testid="md-inline">
        {components.code({ inline: true, className: '', children: ['x'] })}
      </div>
      <div data-testid="md-block">
        {components.code({ inline: false, className: 'language-js', children: ['const a=1\n'] })}
      </div>
      <div data-testid="md-img">
        {components.img({ src: 'http://img.test/a.png', alt: 'A' })}
      </div>
      <div data-testid="md-p">
        {components.p({ children: ['hello'] })}
      </div>
    </div>
  ),
}))

import BlogDetail from './BlogDetail'

describe('BlogDetail Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.documentElement.setAttribute('data-theme', 'light')
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    window.scrollBy = vi.fn()
    window.scrollTo = vi.fn()

    mockGetBlogDetail.mockResolvedValue({
      id: 2,
      title: 'T2',
      category: 'React',
      datetime: '2026-01-02T00:00:00.000Z',
      content: 'hello **md**',
    })
    mockGetBlogsData.mockResolvedValue([
      { id: 1, title: 'T1' },
      { id: 2, title: 'T2' },
      { id: 3, title: 'T3' },
    ])
  })

  it('加载成功：渲染内容、评论区、上一篇/下一篇', async () => {
    render(
      <MemoryRouter>
        <BlogDetail blogId={2} />
      </MemoryRouter>
    )

    expect(await screen.findByText('T2')).toBeInTheDocument()
    expect(screen.getByTestId('comments')).toHaveTextContent('comments:2:T2:light')
    expect(screen.getByText('上一篇')).toBeInTheDocument()
    expect(screen.getByText('下一篇')).toBeInTheDocument()
    expect(screen.getByText('T1')).toBeInTheDocument()
    expect(screen.getByText('T3')).toBeInTheDocument()
    expect(screen.getByTestId('code-block')).toBeInTheDocument()
  })

  it('滚动按钮：点击会触发 scrollBy/scrollTo', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <BlogDetail blogId={2} />
      </MemoryRouter>
    )
    await screen.findByText('T2')

    await user.click(screen.getByLabelText('向上滚动'))
    await user.click(screen.getByLabelText('向下滚动'))
    await user.click(screen.getByLabelText('返回顶部'))

    expect(window.scrollBy).toHaveBeenCalled()
    expect(window.scrollTo).toHaveBeenCalled()

    window.scrollY = 200
    fireEvent.scroll(window)
    expect(screen.getByLabelText('返回顶部').className).not.toContain('scroll-to-top-hidden')
  })

  it('图片：触发 onError 后显示错误占位', async () => {
    render(
      <MemoryRouter>
        <BlogDetail blogId={2} />
      </MemoryRouter>
    )
    await screen.findByText('T2')

    const img = screen.getByAltText('A')
    fireEvent.error(img)
    expect(await screen.findByText('图片加载失败')).toBeInTheDocument()
    expect(screen.getByText('点击在新标签页打开')).toBeInTheDocument()
  })

  it('加载失败：显示错误与返回列表链接', async () => {
    mockGetBlogDetail.mockRejectedValueOnce(new Error('boom'))

    render(
      <MemoryRouter>
        <BlogDetail blogId={2} />
      </MemoryRouter>
    )

    expect(await screen.findByText(/加载文章失败/)).toBeInTheDocument()
    expect(screen.getByText('返回列表')).toBeInTheDocument()
  })

  it('主题监听：变更 data-theme 会更新评论组件的 theme', async () => {
    render(
      <MemoryRouter>
        <BlogDetail blogId={2} />
      </MemoryRouter>
    )
    await screen.findByText('T2')
    expect(screen.getByTestId('comments')).toHaveTextContent(':light')

    document.documentElement.setAttribute('data-theme', 'dark')
    await waitFor(() => {
      expect(screen.getByTestId('comments')).toHaveTextContent(':dark')
    })
  })
})

