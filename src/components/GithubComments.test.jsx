import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import GitHubComments from './GitHubComments'

describe('GitHubComments Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('test 环境：应渲染占位并避免加载外部脚本', async () => {
    render(<GitHubComments blogId="b1" blogTitle="t1" theme="light" />)
    expect(await screen.findByTestId('giscus-test-placeholder')).toHaveTextContent('giscus-disabled-in-test:b1:t1:light')
  })

  it('theme effect：存在 iframe 时会 postMessage 更新主题', async () => {
    const { container, rerender } = render(<GitHubComments blogId="b1" blogTitle="t1" theme="light" />)

    const wrapper = container.querySelector('#giscus-b1')
    const iframe = document.createElement('iframe')
    iframe.className = 'giscus-frame'
    Object.defineProperty(iframe, 'contentWindow', {
      value: { postMessage: vi.fn() },
      configurable: true,
    })
    wrapper.appendChild(iframe)

    rerender(<GitHubComments blogId="b1" blogTitle="t1" theme="dark" />)

    await waitFor(() => {
      expect(iframe.contentWindow.postMessage).toHaveBeenCalled()
    })
  })

  it('强制脚本模式：应创建 giscus script 并写入 specific mapping 的 data-term', async () => {
    const originalCreateElement = document.createElement.bind(document)
    const createdScripts = []

    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = originalCreateElement(tagName)
      if (tagName === 'script') createdScripts.push(el)
      return el
    })

    render(<GitHubComments blogId="" blogTitle="t1" theme="dark" forceScriptMode={true} />)

    const script = createdScripts[0]
    expect(script).toBeTruthy()
    expect(script.getAttribute('src')).toBe('https://giscus.app/client.js')
    expect(script.getAttribute('data-mapping')).toBe('pathname')
    expect(script.getAttribute('data-theme')).toBe('dark')
  })

  it('强制脚本模式：blogId 变化会重新挂载 script', async () => {
    const { container, rerender } = render(
      <GitHubComments blogId="b1" blogTitle="t1" theme="light" forceScriptMode={true} />
    )

    const target = container.querySelector('#giscus-b1')
    expect(target.querySelector('script')).toBeTruthy()

    rerender(<GitHubComments blogId="b2" blogTitle="t2" theme="light" forceScriptMode={true} />)
    const nextTarget = container.querySelector('#giscus-b2')
    expect(nextTarget.querySelector('script')).toBeTruthy()
  })
})
