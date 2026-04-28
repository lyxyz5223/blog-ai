import { describe, it, expect, vi, beforeEach } from 'vitest'

async function importFreshConfig() {
  vi.resetModules()
  return await import('./config.js')
}

describe('src/config/config.js', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem.mockReset()
  })

  it('loadConfig: 默认读取环境变量并缓存结果', async () => {
    const mod = await importFreshConfig()
    const first = await mod.loadConfig()
    const second = await mod.loadConfig()

    expect(first).toEqual(second)
    expect(first).toHaveProperty('useLocalStorage')
    expect(first).toHaveProperty('apiEndpoint')
  })

  it('getConfig: 未初始化时也应返回配置对象', async () => {
    const mod = await importFreshConfig()
    const cfg = mod.getConfig()
    expect(cfg).toHaveProperty('useLocalStorage')
    expect(cfg).toHaveProperty('apiEndpoint')
  })

  it('updateConfig: 应更新配置并写入 localStorage', async () => {
    const mod = await importFreshConfig()
    const next = { useLocalStorage: true, apiEndpoint: 'http://x/api' }
    mod.updateConfig(next)

    expect(mod.getConfig()).toEqual(next)
    expect(localStorage.setItem).toHaveBeenCalledWith('blog-config', JSON.stringify(next))
  })

  it('isUsingLocalStorage: 已配置时返回 true/false', async () => {
    const mod = await importFreshConfig()
    mod.updateConfig({ useLocalStorage: true, apiEndpoint: 'http://x/api' })
    expect(mod.isUsingLocalStorage()).toBe(true)

    mod.updateConfig({ useLocalStorage: false, apiEndpoint: 'http://x/api' })
    expect(mod.isUsingLocalStorage()).toBe(false)
  })

  it('isUsingLocalStorage: 配置缺失时回退为 false', async () => {
    const mod = await importFreshConfig()
    mod.updateConfig({})
    expect(mod.isUsingLocalStorage()).toBe(false)
  })

  it('getApiEndpoint: 返回当前配置中的 endpoint', async () => {
    const mod = await importFreshConfig()
    mod.updateConfig({ useLocalStorage: false, apiEndpoint: 'http://custom/api' })
    expect(mod.getApiEndpoint()).toBe('http://custom/api')
  })
})
