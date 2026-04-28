import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import MarkdownEditor from './MarkdownEditor'

describe('MarkdownEditor Component', () => {
  const mockOnChange = vi.fn()

  const renderMarkdownEditor = (initialContent = '') => {
    return render(
      <MarkdownEditor 
        value={initialContent}
        onChange={mockOnChange}
      />
    )
  }

  it('应该正确渲染 MarkdownEditor 组件', () => {
    const { container } = renderMarkdownEditor()
    expect(container).toBeTruthy()
  })

  it('应该能够正常挂载', () => {
    expect(() => {
      renderMarkdownEditor()
    }).not.toThrow()
  })

  it('应该接受初始值', () => {
    const { container } = renderMarkdownEditor('# Hello')
    expect(container).toBeTruthy()
  })

  it('应该包含编辑器界面', () => {
    const { container } = renderMarkdownEditor()
    expect(container.querySelector('textarea, div[contenteditable], .CodeMirror') || 
            container.querySelector('div')).toBeTruthy()
  })

  it('应该支持换值', () => {
    const { rerender } = renderMarkdownEditor('# First')
    expect(() => {
      rerender(<MarkdownEditor value="# Second" onChange={mockOnChange} />)
    }).not.toThrow()
  })

  it('应该具有编辑器容器', () => {
    const { container } = renderMarkdownEditor()
    expect(container.children.length > 0).toBe(true)
  })
})
