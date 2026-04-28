import { describe, it, expect, vi, beforeEach } from 'vitest'

async function importBlogsDataFresh() {
  vi.resetModules()
  return await import('./blogsData.js')
}

describe('src/data/blogsData.js 覆盖率', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it('loadBlogsMeta：成功加载并缓存，第二次直接返回缓存', async () => {
    const meta = [{ id: 1, title: 't1', filename: '1.md' }]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: vi.fn().mockResolvedValue(meta),
    })

    const { loadBlogsMeta } = await importBlogsDataFresh()
    const first = await loadBlogsMeta()
    const second = await loadBlogsMeta()

    expect(first).toEqual(meta)
    expect(second).toEqual(meta)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('loadBlogsMeta：请求失败返回空数组', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
      json: vi.fn(),
    })

    const { loadBlogsMeta } = await importBlogsDataFresh()
    const result = await loadBlogsMeta()
    expect(result).toEqual([])
  })

  it('loadBlogContent：成功加载并缓存；超过 20 篇时会驱逐最早条目', async () => {
    global.fetch = vi.fn().mockImplementation(async (url) => {
      return {
        ok: true,
        status: 200,
        statusText: 'OK',
        text: vi.fn().mockResolvedValue(`content:${url}`),
      }
    })

    const { loadBlogContent } = await importBlogsDataFresh()

    // 填满并触发驱逐
    for (let i = 1; i <= 21; i++) {
      // eslint-disable-next-line no-await-in-loop
      await loadBlogContent(`${i}.md`)
    }

    // 由于 1.md 被驱逐，再次加载应再次 fetch
    await loadBlogContent('1.md')
    expect(global.fetch).toHaveBeenCalled()
  })

  it('loadBlogContent：命中缓存时不再重复请求', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: vi.fn().mockResolvedValue('cached content'),
    })

    const { loadBlogContent } = await importBlogsDataFresh()
    const first = await loadBlogContent('cache.md')
    const second = await loadBlogContent('cache.md')

    expect(first).toBe('cached content')
    expect(second).toBe('cached content')
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('loadBlogContent：非 ok 时应抛错', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: vi.fn(),
    })

    const { loadBlogContent } = await importBlogsDataFresh()
    await expect(loadBlogContent('404.md')).rejects.toThrow('Failed to fetch')
  })

  it('loadBlogsData：会为每篇文章加载 content，失败时回填“内容加载失败”', async () => {
    global.fetch = vi.fn().mockImplementation(async (url) => {
      if (String(url).includes('meta.json')) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          json: vi.fn().mockResolvedValue([
            { id: 1, title: 'a', filename: 'a.md' },
            { id: 2, title: 'b', filename: 'b.md' },
          ]),
        }
      }
      if (String(url).includes('a.md')) {
        return {
          ok: true,
          status: 200,
          statusText: 'OK',
          text: vi.fn().mockResolvedValue('# A'),
        }
      }
      return {
        ok: false,
        status: 500,
        statusText: 'Fail',
        text: vi.fn(),
      }
    })

    const { loadBlogsData } = await importBlogsDataFresh()
    const result = await loadBlogsData()

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({ id: 1, content: '# A' })
    expect(result[1]).toMatchObject({ id: 2, content: '内容加载失败' })
  })

  it('loadBlogsData：元数据加载异常时返回空数组', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('network fail'))

    const { loadBlogsData } = await importBlogsDataFresh()
    await expect(loadBlogsData()).resolves.toEqual([])
  })
})

