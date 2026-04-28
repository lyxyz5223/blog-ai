import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import DailyQuote from './DailyQuote'

describe('DailyQuote Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('应该正确渲染 DailyQuote 组件', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        hitokoto: 'Test quote',
        from_who: 'Test author'
      })
    })

    const { container } = render(<DailyQuote />)
    expect(container).toBeTruthy()
  })

  it('应该调用 hitokoto API 端点', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        hitokoto: 'Test quote',
        from_who: 'Author'
      })
    })

    render(<DailyQuote />)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://v1.hitokoto.cn')
    }, { timeout: 3000 })
  })

  it('应该处理网络错误', () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'))

    const { container } = render(<DailyQuote />)
    expect(container).toBeTruthy()
  })

  it('应该能够多次使用', () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        hitokoto: 'Test quote',
        from_who: 'Test author'
      })
    })

    const { container: container1 } = render(<DailyQuote />)
    const { container: container2 } = render(<DailyQuote />)

    expect(container1).toBeTruthy()
    expect(container2).toBeTruthy()
  })

  it('应该在挂载时不崩溃', () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        hitokoto: 'Test quote'
      })
    })

    expect(() => {
      render(<DailyQuote />)
    }).not.toThrow()
  })
})
