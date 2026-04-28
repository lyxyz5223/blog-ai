import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FloatingMusicPlayer, { ensureStyle, ensureScript, clickPlayButton } from './FloatingMusicPlayer'

describe('FloatingMusicPlayer', () => {
  beforeEach(() => {
    document.head.innerHTML = ''
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('ensureStyle: 不存在时应插入 link，已存在时不重复插入', () => {
    const originalCreateElement = document.createElement.bind(document)
    let createdLink = null
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = originalCreateElement(tagName)
      if (tagName === 'link') createdLink = el
      return el
    })
    const appendSpy = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node)

    ensureStyle('https://example.com/a.css', 'style-a')
    expect(createdLink?.id).toBe('style-a')
    expect(createdLink?.rel).toBe('stylesheet')
    expect(createdLink?.href).toContain('https://example.com/a.css')
    expect(appendSpy).toHaveBeenCalledTimes(1)

    vi.spyOn(document, 'getElementById').mockReturnValueOnce(createdLink)
    ensureStyle('https://example.com/a.css', 'style-a')
    expect(appendSpy).toHaveBeenCalledTimes(1)
  })

  it('ensureScript: 已存在 script 时应直接 resolve', async () => {
    const script = document.createElement('script')
    script.id = 'script-a'
    document.body.appendChild(script)

    await expect(ensureScript('https://example.com/a.js', 'script-a')).resolves.toBeUndefined()
  })

  it('ensureScript: 新脚本加载成功时应 resolve', async () => {
    const originalCreateElement = document.createElement.bind(document)
    let createdScript = null
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = originalCreateElement(tagName)
      if (tagName === 'script') createdScript = el
      return el
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)

    const promise = ensureScript('https://example.com/b.js', 'script-b')
    expect(createdScript).toBeTruthy()

    createdScript.onload()
    await expect(promise).resolves.toBeUndefined()
  })

  it('ensureScript: 脚本加载失败时应 reject', async () => {
    const originalCreateElement = document.createElement.bind(document)
    let createdScript = null
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = originalCreateElement(tagName)
      if (tagName === 'script') createdScript = el
      return el
    })
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node)

    const promise = ensureScript('https://example.com/c.js', 'script-c')
    expect(createdScript).toBeTruthy()

    createdScript.onerror()
    await expect(promise).rejects.toThrow('load failed')
  })

  it('clickPlayButton: 找到主播放按钮时应 click 并返回 true', () => {
    const playBtn = document.createElement('button')
    playBtn.className = 'aplayer-button aplayer-play'
    playBtn.click = vi.fn()
    document.body.appendChild(playBtn)

    expect(clickPlayButton()).toBe(true)
    expect(playBtn.click).toHaveBeenCalled()
  })

  it('clickPlayButton: 主按钮不存在时应走 fallback dispatchEvent', () => {
    const wrapper = document.createElement('div')
    wrapper.className = 'aplayer'
    const icon = document.createElement('span')
    icon.className = 'aplayer-icon-play'
    icon.dispatchEvent = vi.fn()
    wrapper.appendChild(icon)
    document.body.appendChild(wrapper)

    expect(clickPlayButton()).toBe(true)
    expect(icon.dispatchEvent).toHaveBeenCalled()
  })

  it('clickPlayButton: 没有任何按钮时返回 false', () => {
    expect(clickPlayButton()).toBe(false)
  })

  it('test 环境：应直接 ready 并渲染 meting-js', async () => {
    const { container } = render(<FloatingMusicPlayer />)
    // test 环境会直接 ready
    await screen.findByText((content, el) => el?.className === 'music-meting-wrapper')
    expect(container.querySelector('meting-js')).toBeTruthy()
  })

  it('首次点击：会尝试触发播放按钮点击', async () => {
    const user = userEvent.setup()

    const playBtn = document.createElement('button')
    playBtn.className = 'aplayer-button aplayer-play'
    playBtn.click = vi.fn()
    document.body.appendChild(playBtn)

    render(<FloatingMusicPlayer />)
    await user.click(document.body)
    expect(playBtn.click).toHaveBeenCalled()
  })

  it('强制运行时模式：脚本加载失败时应显示错误提示', async () => {
    const originalCreateElement = document.createElement.bind(document)
    const realAppendChild = HTMLBodyElement.prototype.appendChild
    let createdScripts = []
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = originalCreateElement(tagName)
      if (tagName === 'script') createdScripts.push(el)
      return el
    })
    vi.spyOn(HTMLBodyElement.prototype, 'appendChild').mockImplementation(function (node) {
      if (node.tagName?.toLowerCase() === 'script') {
        queueMicrotask(() => node.onerror?.())
        return node
      }
      return realAppendChild.call(this, node)
    })

    render(<FloatingMusicPlayer forceRuntimeLoad={true} />)
    expect(await screen.findByText('在线音乐组件加载失败，请检查网络或稍后重试。')).toBeInTheDocument()
    expect(createdScripts.length).toBe(1)
  })

  it('强制运行时模式：无主按钮时应走 fallback 图标点击', async () => {
    const user = userEvent.setup()
    const originalCreateElement = document.createElement.bind(document)
    const realAppendChild = HTMLBodyElement.prototype.appendChild
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => originalCreateElement(tagName))
    vi.spyOn(HTMLBodyElement.prototype, 'appendChild').mockImplementation(function (node) {
      if (node.tagName?.toLowerCase() === 'script') {
        queueMicrotask(() => node.onload?.())
        return node
      }
      return realAppendChild.call(this, node)
    })

    const wrapper = document.createElement('div')
    wrapper.className = 'aplayer'
    const icon = document.createElement('span')
    icon.className = 'aplayer-icon-play'
    icon.dispatchEvent = vi.fn()
    wrapper.appendChild(icon)
    document.body.appendChild(wrapper)

    render(<FloatingMusicPlayer forceRuntimeLoad={true} />)
    await screen.findByText((_, el) => el?.className === 'music-meting-wrapper')
    await user.click(document.body)

    expect(icon.dispatchEvent).toHaveBeenCalled()
  })
})

