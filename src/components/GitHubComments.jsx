import { useEffect, useRef } from 'react'

/**
 * GitHub Giscus 评论组件
 * 基于 GitHub Discussions 的评论系统
 * 支持主题切换、评论展示、表情反应等功能
 */
export default function GitHubComments({ 
  blogId, 
  blogTitle,
  theme = 'light' 
}) {
  const containerRef = useRef(null)
  const scriptLoadedRef = useRef(false)
  const firstLoadRef = useRef(true)

  // 第一个 Effect: 仅在 blogId 变化或首次加载时加载 Giscus 脚本
  useEffect(() => {
    // 防止重复加载
    if (scriptLoadedRef.current && !firstLoadRef.current) {
      return
    }

    // 获取配置参数
    const mappingMode = import.meta.env.VITE_GITHUB_MAPPING || 'pathname'
    const inputPosition = import.meta.env.VITE_GITHUB_INPUT_POSITION || 'top'
    const themeMode = import.meta.env.VITE_GITHUB_THEME || 'preferred_color_scheme'

    // 初始主题值 - 如果是 preferred_color_scheme，使用当前 theme 值
    // 否则使用配置值
    let initialThemeValue = themeMode === 'preferred_color_scheme' 
      ? (theme === 'dark' ? 'dark' : 'light')
      : themeMode

    // Giscus 配置参数
    const scriptAttributes = {
      src: 'https://giscus.app/client.js',
      'data-repo': import.meta.env.VITE_GITHUB_REPO || 'lyxyz5223/blog-ai',
      'data-repo-id': import.meta.env.VITE_GITHUB_REPO_ID || 'R_kgDOR5BfjA',
      'data-category': import.meta.env.VITE_GITHUB_DISCUSSION_CATEGORY || 'Comments',
      'data-category-id': import.meta.env.VITE_GITHUB_DISCUSSION_CATEGORY_ID || 'DIC_kwDOR5BfjM4C6Btj',
      'data-mapping': mappingMode,
      'data-strict': '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': inputPosition,
      'data-theme': initialThemeValue,
      'data-lang': 'zh-CN',
      'data-loading': 'lazy',
      crossOrigin: 'anonymous',
      async: true,
    }

    // 对于 'specific' 映射方式，添加 data-term
    if (mappingMode === 'specific') {
      scriptAttributes['data-term'] = blogId || 'general'
    }

    // 清空容器
    if (containerRef.current) {
      containerRef.current.innerHTML = ''
    }

    // 创建并配置脚本
    const script = document.createElement('script')
    Object.entries(scriptAttributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        script.setAttribute(key, value)
      }
    })

    // 添加脚本到 DOM
    if (containerRef.current) {
      containerRef.current.appendChild(script)
      scriptLoadedRef.current = true
      firstLoadRef.current = false
    }
  }, [blogId, theme]) // 首次加载和 blogId 变化时运行

  // 第二个 Effect: 在 theme 变化时更新主题（不重新加载脚本）
  useEffect(() => {
    // 只有在脚本已加载且不是首次加载时才更新
    if (!scriptLoadedRef.current) {
      return
    }

    // 等待 iframe 加载完成后发送主题更新消息
    const timeoutId = setTimeout(() => {
      const giscusIframe = containerRef.current?.querySelector('iframe.giscus-frame')
      if (giscusIframe) {
        giscusIframe.contentWindow.postMessage(
          {
            giscus: {
              setConfig: {
                theme: theme === 'dark' ? 'dark' : 'light',
              },
            },
          },
          'https://giscus.app'
        )
      }
    }, 100) // 稍微延迟以确保 iframe 已准备好

    return () => clearTimeout(timeoutId)
  }, [theme]) // 在 theme 变化时运行

  return (
    <div className="github-comments-wrapper">
      <div 
        ref={containerRef}
        className="giscus-container"
        id={`giscus-${blogId}`}
      />
    </div>
  )
}
