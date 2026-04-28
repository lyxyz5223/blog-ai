import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockLoadConfig = vi.fn()
const mockGetApiEndpoint = vi.fn()

const mockLoadBlogsMeta = vi.fn()
const mockLoadBlogContent = vi.fn()

const localBlogsDataFixture = [
  {
    id: 1,
    title: 'Local Blog 1',
    category: 'JavaScript',
    datetime: '2026-04-01T10:00:00.000Z',
    excerpt: 'local excerpt 1',
    content: 'local content 1',
    author: 'me',
  },
  {
    id: 2,
    title: 'Local Blog 2',
    category: 'React',
    datetime: '2026-04-02T10:00:00.000Z',
    content: 'local content 2',
    author: 'me',
  },
]

vi.mock('../config/config', () => ({
  loadConfig: (...args) => mockLoadConfig(...args),
  getApiEndpoint: (...args) => mockGetApiEndpoint(...args),
}))

vi.mock('./blogsData', () => ({
  blogsData: localBlogsDataFixture,
  loadBlogsMeta: (...args) => mockLoadBlogsMeta(...args),
  loadBlogContent: (...args) => mockLoadBlogContent(...args),
}))

async function importDataServiceFresh() {
  vi.resetModules()
  return await import('./dataService.js')
}

function mockFetchJsonOnce(body, init = { ok: true, status: 200, statusText: 'OK' }) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: init.ok,
    status: init.status,
    statusText: init.statusText,
    json: vi.fn().mockResolvedValue(body),
    text: vi.fn().mockResolvedValue(typeof body === 'string' ? body : JSON.stringify(body)),
  })
}

describe('src/data/dataService.js 覆盖率', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoadBlogsMeta.mockReset()
    mockLoadBlogContent.mockReset()
    mockLoadConfig.mockReset()
    mockGetApiEndpoint.mockReset()
    localStorage.getItem.mockReturnValue(null)
    global.fetch = vi.fn()
  })

  it('getBlogsData：本地模式优先从 MD 元数据构造摘要列表', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockResolvedValue([
      { id: 10, title: 'MD 1', category: 'React', datetime: '2026-01-01', excerpt: 'ex', author: 'a', filename: 'a.md' },
      { id: 11, title: 'MD 2', category: 'Vue', date: '2026-01-02', author: 'b', filename: 'b.md' },
    ])

    const { getBlogsData } = await importDataServiceFresh()
    const result = await getBlogsData()

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ id: 10, title: 'MD 1', category: 'React', author: 'a' })
    expect(result[0].excerpt).toBe('ex')
    expect(result[1].excerpt).toBe('无摘要')
  })

  it('getBlogsData：MD 加载失败时回退到本地内存数据', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockRejectedValue(new Error('md fail'))

    const { getBlogsData } = await importDataServiceFresh()
    const result = await getBlogsData()

    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('excerpt')
    expect(result[0]).toHaveProperty('date')
  })

  it('getBlogsData：API 模式走 getPaginatedBlogs(1,100)', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    mockFetchJsonOnce({ items: [{ id: 1, title: 'From API', excerpt: 'api ex' }], total: 1, page: 1, pageSize: 100, totalPages: 1 })

    const { getBlogsData } = await importDataServiceFresh()
    const result = await getBlogsData()

    expect(global.fetch).toHaveBeenCalled()
    expect(result).toEqual([{ id: 1, title: 'From API', excerpt: 'api ex' }])
  })

  it('getPaginatedBlogs：本地模式使用 MD 元数据分页', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockResolvedValue(
      Array.from({ length: 25 }).map((_, i) => ({
        id: i + 1,
        title: `T${i + 1}`,
        category: i % 2 ? 'A' : 'B',
        datetime: `2026-01-${String(i + 1).padStart(2, '0')}`,
        excerpt: 'x',
        author: 'u',
        filename: `${i + 1}.md`,
      }))
    )

    const { getPaginatedBlogs } = await importDataServiceFresh()
    const result = await getPaginatedBlogs(2, 10)

    expect(result.items).toHaveLength(10)
    expect(result.total).toBe(25)
    expect(result.totalPages).toBe(3)
  })

  it('getPaginatedBlogs：API 模式请求失败应抛错', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    mockFetchJsonOnce({ message: 'no' }, { ok: false, status: 500, statusText: 'Server Error' })

    const { getPaginatedBlogs } = await importDataServiceFresh()
    await expect(getPaginatedBlogs(1, 10)).rejects.toThrow('API request failed')
  })

  it('getPaginatedBlogs：MD 加载失败时回退到本地内存数据', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockRejectedValue(new Error('md fail'))

    const { getPaginatedBlogs } = await importDataServiceFresh()
    const result = await getPaginatedBlogs(1, 10)
    expect(result.items.length).toBeGreaterThan(0)
    expect(result.total).toBe(localBlogsDataFixture.length)
  })

  it('getCategories：本地模式对分类计数并排序', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockResolvedValue([
      { id: 1, category: 'Vue' },
      { id: 2, category: 'React' },
      { id: 3, category: 'React' },
    ])

    const { getCategories } = await importDataServiceFresh()
    const result = await getCategories()

    expect(result).toEqual([
      { name: 'React', count: 2 },
      { name: 'Vue', count: 1 },
    ])
  })

  it('getCategories：API 模式请求并返回分类列表', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    mockFetchJsonOnce([{ name: 'A', count: 1 }])

    const { getCategories } = await importDataServiceFresh()
    const result = await getCategories()
    expect(result).toEqual([{ name: 'A', count: 1 }])
  })

  it('getCategories：MD 加载失败时回退到本地数据统计', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockRejectedValue(new Error('md fail'))

    const { getCategories } = await importDataServiceFresh()
    const result = await getCategories()
    expect(result).toEqual([
      { name: 'JavaScript', count: 1 },
      { name: 'React', count: 1 },
    ])
  })

  it('searchBlogs：空关键词应抛错', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    const { searchBlogs } = await importDataServiceFresh()
    await expect(searchBlogs('   ')).rejects.toThrow('搜索关键词不能为空')
  })

  it('searchBlogs：本地模式使用 MD 元数据搜索并分页', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockResolvedValue([
      { id: 1, title: 'React 入门', excerpt: 'hello react', category: 'React', datetime: '2026-01-01' },
      { id: 2, title: 'Vue', excerpt: 'hello vue', category: 'Vue', datetime: '2026-01-01' },
      { id: 3, title: 'React 进阶', excerpt: 'advanced', category: 'React', datetime: '2026-01-01' },
    ])

    const { searchBlogs } = await importDataServiceFresh()
    const result = await searchBlogs('react', 1, 10)
    expect(result.total).toBe(2)
    expect(result.items).toHaveLength(2)
    expect(result.keyword).toBe('react')
  })

  it('searchBlogs：API 模式请求并返回结果', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    mockFetchJsonOnce({ items: [{ id: 1 }], total: 1, page: 1, pageSize: 10, totalPages: 1 })

    const { searchBlogs } = await importDataServiceFresh()
    const result = await searchBlogs('x', 1, 10)
    expect(result.total).toBe(1)
    expect(result.items).toHaveLength(1)
  })

  it('searchBlogs：MD 加载失败时回退到本地数据搜索', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockRejectedValue(new Error('md fail'))

    const { searchBlogs } = await importDataServiceFresh()
    const result = await searchBlogs('local', 1, 10)
    expect(result.total).toBe(2)
    expect(result.items).toHaveLength(2)
  })

  it('searchBlogs：API 模式失败应抛错', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    mockFetchJsonOnce({}, { ok: false, status: 500, statusText: 'Server Error' })

    const { searchBlogs } = await importDataServiceFresh()
    await expect(searchBlogs('x', 1, 10)).rejects.toThrow('API request failed')
  })

  it('getBlogDetail：本地模式懒加载内容并命中缓存', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockResolvedValue([{ id: 99, title: 'B', category: 'C', filename: '99.md' }])
    mockLoadBlogContent.mockResolvedValue('# content')

    const { getBlogDetail } = await importDataServiceFresh()

    const first = await getBlogDetail(99)
    const second = await getBlogDetail(99)

    expect(first.content).toBe('# content')
    expect(second.content).toBe('# content')
    expect(mockLoadBlogContent).toHaveBeenCalledTimes(1)
  })

  it('getBlogDetail：本地模式找不到文章应抛错', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockResolvedValue([{ id: 1, filename: '1.md' }])

    const { getBlogDetail } = await importDataServiceFresh()
    await expect(getBlogDetail(999)).rejects.toThrow('文章 ID 999 不存在')
  })

  it('getBlogDetail：MD 详情失败时回退到本地数据', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockRejectedValue(new Error('md fail'))

    const { getBlogDetail } = await importDataServiceFresh()
    const result = await getBlogDetail(1)
    expect(result.id).toBe(1)
    expect(result.title).toBe('Local Blog 1')
  })

  it('getBlogDetail：API 模式失败应抛错', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    mockFetchJsonOnce({}, { ok: false, status: 404, statusText: 'Not Found' })

    const { getBlogDetail } = await importDataServiceFresh()
    await expect(getBlogDetail(7)).rejects.toThrow('API request failed')
  })

  it('getBlogDetail：API 模式直接按 ID 拉取并缓存', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    mockFetchJsonOnce({ id: 7, title: 'X' })

    const { getBlogDetail } = await importDataServiceFresh()
    const first = await getBlogDetail(7)
    const second = await getBlogDetail(7)

    expect(first.title).toBe('X')
    expect(second.title).toBe('X')
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('createBlog：本地模式应拒绝创建', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    const { createBlog } = await importDataServiceFresh()
    await expect(createBlog({ title: 't' })).rejects.toThrow('Local storage mode')
  })

  it('createBlog：API 成功创建会返回新博客', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    localStorage.getItem.mockReturnValue('token')

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: vi.fn().mockResolvedValue({ id: 55, title: 'new' }),
    })

    const { createBlog } = await importDataServiceFresh()
    const result = await createBlog({ title: 'new' })
    expect(result).toMatchObject({ id: 55, title: 'new' })
  })

  it('createBlog：API 401 会清理 token 并抛错', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    localStorage.getItem.mockReturnValue('token')

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: vi.fn().mockResolvedValue({}),
    })

    const { createBlog } = await importDataServiceFresh()
    await expect(createBlog({ title: 't' })).rejects.toThrow('认证已过期，请重新登录')
    expect(localStorage.removeItem).toHaveBeenCalledWith('adminToken')
    expect(localStorage.removeItem).toHaveBeenCalledWith('adminUser')
  })

  it('createBlog：API 非 401 失败应抛出 statusText', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    localStorage.getItem.mockReturnValue(null)
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: vi.fn().mockResolvedValue({}),
    })

    const { createBlog } = await importDataServiceFresh()
    await expect(createBlog({ title: 't' })).rejects.toThrow('Failed to create blog: Server Error')
  })

  it('updateBlog：API 401 会清理 token 并抛错', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    localStorage.getItem.mockReturnValue('token')

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: vi.fn().mockResolvedValue({}),
    })

    const { updateBlog } = await importDataServiceFresh()
    await expect(updateBlog(1, { title: 'x' })).rejects.toThrow('认证已过期，请重新登录')
    expect(localStorage.removeItem).toHaveBeenCalledWith('adminToken')
    expect(localStorage.removeItem).toHaveBeenCalledWith('adminUser')
  })

  it('updateBlog：本地模式应拒绝更新', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    const { updateBlog } = await importDataServiceFresh()
    await expect(updateBlog(1, { title: 'x' })).rejects.toThrow('Local storage mode')
  })

  it('updateBlog：API 非 401 失败应抛出 statusText', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    localStorage.getItem.mockReturnValue(null)
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: vi.fn().mockResolvedValue({}),
    })

    const { updateBlog } = await importDataServiceFresh()
    await expect(updateBlog(1, { title: 'x' })).rejects.toThrow('Failed to update blog: Server Error')
  })

  it('deleteBlog：API 401 会清理 token 并抛错', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    localStorage.getItem.mockReturnValue('token')

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: vi.fn().mockResolvedValue({}),
    })

    const { deleteBlog } = await importDataServiceFresh()
    await expect(deleteBlog(1)).rejects.toThrow('认证已过期，请重新登录')
    expect(localStorage.removeItem).toHaveBeenCalledWith('adminToken')
    expect(localStorage.removeItem).toHaveBeenCalledWith('adminUser')
  })

  it('deleteBlog：本地模式应拒绝删除', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    const { deleteBlog } = await importDataServiceFresh()
    await expect(deleteBlog(1)).rejects.toThrow('Local storage mode')
  })

  it('deleteBlog：API 非 401 失败应抛出 statusText', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    localStorage.getItem.mockReturnValue(null)
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: vi.fn().mockResolvedValue({}),
    })

    const { deleteBlog } = await importDataServiceFresh()
    await expect(deleteBlog(1)).rejects.toThrow('Failed to delete blog: Server Error')
  })

  it('updateBlog/deleteBlog：API 成功路径与缓存清理', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    localStorage.getItem.mockReturnValue('token')

    const { updateBlog, deleteBlog, getBlogDetail } = await importDataServiceFresh()

    // 先让详情写入缓存（API 模式）
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: vi.fn().mockResolvedValue({ id: 123, title: 'before' }),
    })
    await getBlogDetail(123)

    // update
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: vi.fn().mockResolvedValue({ id: 123, title: 'after' }),
    })
    const updated = await updateBlog(123, { title: 'after' })
    expect(updated.title).toBe('after')

    // delete
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: vi.fn().mockResolvedValue({ success: true }),
    })
    const deleted = await deleteBlog(123)
    expect(deleted).toEqual({ success: true })
  })

  it('按分类分页：getPaginatedBlogsByCategory / getPaginatedBlogsByCategories 本地与异常分支', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockResolvedValue([
      { id: 1, title: 'A', category: 'React', datetime: '2026', author: 'u' },
      { id: 2, title: 'B', category: 'Vue', datetime: '2026', author: 'u' },
      { id: 3, title: 'C', category: 'React', datetime: '2026', author: 'u' },
    ])

    const { getPaginatedBlogsByCategory, getPaginatedBlogsByCategories } = await importDataServiceFresh()
    const byOne = await getPaginatedBlogsByCategory('React', 1, 10)
    expect(byOne.total).toBe(2)
    expect(byOne.items).toHaveLength(2)

    await expect(getPaginatedBlogsByCategories([])).rejects.toThrow('至少需要选择一个分类')
    const byMany = await getPaginatedBlogsByCategories(['React', 'Vue'], 1, 10)
    expect(byMany.total).toBe(3)
  })

  it('按分类分页：API 模式请求并返回结果', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    mockFetchJsonOnce({ items: [{ id: 1 }], total: 1, page: 1, pageSize: 10, totalPages: 1 })

    const { getPaginatedBlogsByCategory } = await importDataServiceFresh()
    const result = await getPaginatedBlogsByCategory('React', 1, 10)
    expect(result.total).toBe(1)
  })

  it('按分类分页：单分类本地 MD 失败时回退到本地数据', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockRejectedValue(new Error('md fail'))

    const { getPaginatedBlogsByCategory } = await importDataServiceFresh()
    const result = await getPaginatedBlogsByCategory('React', 1, 10)
    expect(result.total).toBe(1)
    expect(result.items[0].category).toBe('React')
  })

  it('按分类分页：单分类 API 失败应抛错', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    mockFetchJsonOnce({}, { ok: false, status: 500, statusText: 'Server Error' })

    const { getPaginatedBlogsByCategory } = await importDataServiceFresh()
    await expect(getPaginatedBlogsByCategory('React', 1, 10)).rejects.toThrow('API request failed')
  })

  it('按分类分页：多分类本地 MD 失败时回退到本地数据', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: true })
    mockLoadBlogsMeta.mockRejectedValue(new Error('md fail'))

    const { getPaginatedBlogsByCategories } = await importDataServiceFresh()
    const result = await getPaginatedBlogsByCategories(['React', 'JavaScript'], 1, 10)
    expect(result.total).toBe(2)
  })

  it('按分类分页：多分类 API 失败应抛错', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    mockFetchJsonOnce({}, { ok: false, status: 500, statusText: 'Server Error' })

    const { getPaginatedBlogsByCategories } = await importDataServiceFresh()
    await expect(getPaginatedBlogsByCategories(['React'], 1, 10)).rejects.toThrow('API request failed')
  })

  it('clearBlogCache / clearAllBlogsCache：应可调用且不抛错', async () => {
    mockLoadConfig.mockResolvedValue({ useLocalStorage: false })
    mockGetApiEndpoint.mockReturnValue('http://example.test/api')
    mockFetchJsonOnce({ id: 8, title: 'X' })

    const { getBlogDetail, clearBlogCache, clearAllBlogsCache } = await importDataServiceFresh()
    await getBlogDetail(8)
    expect(() => clearBlogCache(8)).not.toThrow()
    expect(() => clearAllBlogsCache()).not.toThrow()
  })

  it('loadFileBasedBlogs / getLocalBlogsData：应返回对应数据', async () => {
    mockLoadBlogsMeta.mockResolvedValue([{ id: 88, title: 'meta' }])
    const { loadFileBasedBlogs, getLocalBlogsData } = await importDataServiceFresh()

    await expect(loadFileBasedBlogs()).resolves.toEqual([{ id: 88, title: 'meta' }])
    expect(getLocalBlogsData()).toHaveLength(2)
  })
})
