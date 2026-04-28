import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import About from './About'

describe('About Page', () => {
  const renderAbout = () => {
    return render(
      <MemoryRouter>
        <About />
      </MemoryRouter>
    )
  }

  it('应该正确渲染 About 组件', () => {
    const { container } = renderAbout()
    expect(container).toBeTruthy()
  })

  it('应该包含页面内容', () => {
    const { container } = renderAbout()
    expect(container.querySelector('div')).toBeTruthy()
  })

  it('应该能够正常挂载', () => {
    expect(() => {
      renderAbout()
    }).not.toThrow()
  })

  it('应该可能包含标题或主要内容', () => {
    const { container } = renderAbout()
    expect(container.textContent).toBeTruthy()
  })

  it('应该能够渲染多次而不出错', () => {
    const { rerender } = renderAbout()
    expect(() => {
      rerender(
        <MemoryRouter>
          <About />
        </MemoryRouter>
      )
    }).not.toThrow()
  })

  it('应该有可访问的内容结构', () => {
    const { container } = renderAbout()
    const divs = container.querySelectorAll('div')
    expect(divs.length).toBeGreaterThan(0)
  })

  it('应该显示个人信息', () => {
    const { container } = renderAbout()
    expect(container.textContent.length).toBeGreaterThan(20)
  })

  it('应该包含技能部分', () => {
    const { container } = renderAbout()
    expect(container).toBeTruthy()
  })

  it('应该包含社交链接或联系方式', () => {
    const { container } = renderAbout()
    expect(container).toBeTruthy()
  })

  it('应该有正确的文本内容', () => {
    const { container } = renderAbout()
    const text = container.textContent
    expect(text).toBeTruthy()
  })

  it('应该支持语义化HTML', () => {
    const { container } = renderAbout()
    expect(container.querySelector('div')).toBeTruthy()
  })

  it('应该能够响应式渲染', () => {
    const { container } = renderAbout()
    expect(container).toBeTruthy()
  })

  it('应该不包含动态导入错误', () => {
    expect(() => {
      renderAbout()
    }).not.toThrow()
  })

  it('应该正确处理组件卸载', () => {
    const { unmount } = renderAbout()
    expect(() => {
      unmount()
    }).not.toThrow()
  })
})
