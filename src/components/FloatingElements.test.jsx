import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import FloatingElements from './FloatingElements'

describe('FloatingElements Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    // 让随机更可预测（但不完全固定，避免 0 导致边界）
    vi.spyOn(Math, 'random').mockReturnValue(0.42)

    // 让 RAF 同步执行
    Object.defineProperty(window, 'requestAnimationFrame', {
      value: (cb) => {
        cb()
        return 1
      },
      configurable: true,
    })
    Object.defineProperty(window, 'cancelAnimationFrame', {
      value: vi.fn(),
      configurable: true,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    Math.random.mockRestore()
  })

  it('应生成并渲染浮动形状元素', async () => {
    const { container } = render(<FloatingElements />)
    // 第一次 effect 会 setShapes，等待微任务/下一轮渲染
    await vi.runAllTimersAsync()

    const els = container.querySelectorAll('.floating-element')
    expect(els.length).toBeGreaterThan(0)
    const shape = container.querySelector('.floating-shape')
    expect(shape).toBeTruthy()
  })

  it('mousemove：应通过 RAF 更新 CSS 变量', async () => {
    const { container } = render(<FloatingElements />)
    await vi.runAllTimersAsync()

    const el = container.querySelector('.floating-element')
    expect(el).toBeTruthy()

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 10, clientY: 20 }))
    expect(el.style.getPropertyValue('--mouse-x')).toMatch(/px/)
    expect(el.style.getPropertyValue('--mouse-y')).toMatch(/px/)
  })

  it('click：应创建涟漪与粒子，并在超时后移除', async () => {
    render(<FloatingElements />)
    await vi.runAllTimersAsync()

    window.dispatchEvent(new MouseEvent('click', { clientX: 100, clientY: 200 }))

    // 立即应该有涟漪/粒子
    expect(document.querySelectorAll('.click-ripple').length).toBeGreaterThan(0)
    expect(document.querySelectorAll('.particle').length).toBeGreaterThan(0)

    // 触发移除定时器（600/800ms）
    vi.advanceTimersByTime(900)
    expect(document.querySelectorAll('.click-ripple').length).toBe(0)
    expect(document.querySelectorAll('.particle').length).toBe(0)
  })

  it('多次 mousemove：应取消上一帧并重新调度', async () => {
    const cancelSpy = vi.fn()
    Object.defineProperty(window, 'cancelAnimationFrame', { value: cancelSpy, configurable: true })

    render(<FloatingElements />)
    await vi.runAllTimersAsync()

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 2 }))
    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 3, clientY: 4 }))

    expect(cancelSpy).toHaveBeenCalled()
  })

  it('卸载：若存在挂起的 RAF，应调用 cancelAnimationFrame', async () => {
    const cancelSpy = vi.fn()
    Object.defineProperty(window, 'cancelAnimationFrame', { value: cancelSpy, configurable: true })
    Object.defineProperty(window, 'requestAnimationFrame', {
      value: () => 123, // 不执行回调，制造“挂起”
      configurable: true,
    })

    const { unmount } = render(<FloatingElements />)
    await vi.runAllTimersAsync()

    window.dispatchEvent(new MouseEvent('mousemove', { clientX: 1, clientY: 2 }))
    unmount()

    expect(cancelSpy).toHaveBeenCalledWith(123)
  })
})
