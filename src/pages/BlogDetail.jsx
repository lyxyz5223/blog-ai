import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkBreaks from 'remark-breaks'
import remarkMath from 'remark-math'
import rehypeRaw from 'rehype-raw'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula, vs } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { getBlogDetail, getBlogsData } from '../data/dataService'
import { formatDateTime } from '../utils/formatDate'
import './BlogDetail.css'

function BlogDetail({ blogId }) {
  const navigate = useNavigate()
  const [blog, setBlog] = useState(null)
  const [prevBlog, setPrevBlog] = useState(null)
  const [nextBlog, setNextBlog] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [theme, setTheme] = useState('light')
  const [showScrollButtons, setShowScrollButtons] = useState(false)
  const [isAtTop, setIsAtTop] = useState(true)

  // 检测当前主题
  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light'
    setTheme(currentTheme)

    // 监听主题变化
    const observer = new MutationObserver(() => {
      const newTheme = document.documentElement.getAttribute('data-theme') || 'light'
      setTheme(newTheme)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  // 滚动事件监听
  useEffect(() => {
    const handleScroll = () => {
      // 始终显示滚动按钮
      setShowScrollButtons(true)
      // 检测是否在顶部
      setIsAtTop(window.scrollY < 50)
    }

    window.addEventListener('scroll', handleScroll)
    // 页面加载时同样显示按钮
    setShowScrollButtons(true)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 滚动函数
  const scrollUp = () => {
    window.scrollBy({ top: -window.innerHeight, behavior: 'smooth' })
  }

  const scrollDown = () => {
    window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 根据主题选择高亮主题
  const highlightStyle = theme === 'dark' ? dracula : vs

  // 在函数内部创建 markdownComponents，以便访问 highlightStyle
  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : 'javascript'

      if (inline) {
        return (
          <code className="inline-code" {...props}>
            {children}
          </code>
        )
      }

      return (
        <SyntaxHighlighter
          language={language}
          style={highlightStyle}
          className="code-block"
          showLineNumbers={true}
          wrapLongLines={true}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      )
    },
    h1: ({ children }) => <h1 className="markdown-h1">{children}</h1>,
    h2: ({ children }) => <h2 className="markdown-h2">{children}</h2>,
    h3: ({ children }) => <h3 className="markdown-h3">{children}</h3>,
    h4: ({ children }) => <h4 className="markdown-h4">{children}</h4>,
    h5: ({ children }) => <h5 className="markdown-h5">{children}</h5>,
    h6: ({ children }) => <h6 className="markdown-h6">{children}</h6>,
    p: ({ children }) => <p className="markdown-p">{children}</p>,
    blockquote: ({ children }) => <blockquote className="markdown-blockquote">{children}</blockquote>,
    ul: ({ children }) => <ul className="markdown-ul">{children}</ul>,
    ol: ({ children }) => <ol className="markdown-ol">{children}</ol>,
    li: ({ children }) => <li className="markdown-li">{children}</li>,
    table: ({ children }) => <table className="markdown-table"><tbody>{children}</tbody></table>,
    thead: ({ children }) => <thead className="markdown-thead">{children}</thead>,
    tbody: ({ children }) => <tbody className="markdown-tbody">{children}</tbody>,
    tr: ({ children }) => <tr className="markdown-tr">{children}</tr>,
    th: ({ children }) => <th className="markdown-th">{children}</th>,
    td: ({ children }) => <td className="markdown-td">{children}</td>,
    img: ({ src, alt, ...props }) => (
      <img 
        src={src} 
        alt={alt} 
        className="markdown-img"
        {...props}
      />
    ),
    a: ({ href, children }) => (
      <a href={href} className="markdown-link" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    br: () => <br className="markdown-br" />,
    hr: () => <hr className="markdown-hr" />,
  }

  useEffect(() => {
    const loadBlog = async () => {
      try {
        setLoading(true)
        
        // 确保 blogId 是数字类型（URL 参数是字符串）
        const id = typeof blogId === 'string' ? parseInt(blogId, 10) : blogId
        console.log(`🔍 [BlogDetail] 使用 blogId=${id} (原始: ${blogId})`)
        
        // 使用缓存系统加载完整的文章内容
        const currentBlog = await getBlogDetail(id)
        console.log(`📄 [BlogDetail] 加载完整文章 ID=${id}:`, currentBlog)
        
        // 获取所有文章用于导航
        const allBlogs = await getBlogsData()
        const currentIndex = allBlogs.findIndex(b => b.id === id)
        
        setBlog(currentBlog)
        setPrevBlog(currentIndex > 0 ? allBlogs[currentIndex - 1] : null)
        setNextBlog(currentIndex < allBlogs.length - 1 ? allBlogs[currentIndex + 1] : null)
        setError(null)
      } catch (err) {
        console.error('❌ Failed to load blog:', err)
        setError('加载文章失败，请检查配置设置')
        setBlog(null)
      } finally {
        setLoading(false)
      }
    }

    if (blogId) {
      loadBlog()
    }
  }, [blogId])

  if (loading) {
    return (
      <div className="blog-detail-page">
        <div className="loading">⏳ 加载中...</div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="blog-detail-page">
        <div className="error-message">
          <p>❌ {error || '文章未找到'}</p>
          <Link to="/blogs" className="back-button">
            返回列表
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-detail-page">
      <Link to="/blogs" className="back-to-list-floating" title="返回博客列表">
        <svg className="back-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>返回</span>
      </Link>

      {showScrollButtons && (
        <div className="scroll-buttons-floating">
          <button 
            className="scroll-btn scroll-up" 
            onClick={scrollUp}
            title="向上滚动"
            aria-label="向上滚动"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19V5M5 12l7-7 7 7"/>
            </svg>
          </button>
          <button 
            className="scroll-btn scroll-down" 
            onClick={scrollDown}
            title="向下滚动"
            aria-label="向下滚动"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7"/>
            </svg>
          </button>
          <button 
            className={`scroll-btn scroll-to-top ${isAtTop ? 'scroll-to-top-hidden' : ''}`}
            onClick={scrollToTop}
            title="置顶"
            aria-label="返回顶部"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v18M3 9l9-9 9 9"/>
            </svg>
          </button>
        </div>
      )}

      <article className="blog-detail">
        <div className="article-header">
          <h1>{blog.title}</h1>
          <div className="article-meta">
            <time dateTime={blog.datetime}>
              {formatDateTime(blog.datetime)}
            </time>
            <span className="divider">•</span>
            <span className="category">{blog.category}</span>
          </div>
        </div>

        <div className="article-content">
          <ReactMarkdown 
            components={markdownComponents} 
            remarkPlugins={[remarkBreaks, remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
            allowHtml={true}
          >
            {blog.content}
          </ReactMarkdown>
        </div>
      </article>

      <div className="article-footer">
        <div className="article-navigation">
          {prevBlog ? (
            <Link 
              to={`/blog/${prevBlog.id}`}
              className="nav-button prev"
              title="上一篇"
            >
              <div className="nav-label-wrapper">
                <svg className="nav-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 19l-7-7 7-7"/>
                </svg>
                <span className="label">上一篇</span>
              </div>
              <span className="title">{prevBlog.title}</span>
            </Link>
          ) : <div className="nav-button disabled" />}
          
          {nextBlog ? (
            <Link 
              to={`/blog/${nextBlog.id}`}
              className="nav-button next"
              title="下一篇"
            >
              <div className="nav-label-wrapper">
                <span className="label">下一篇</span>
                <svg className="nav-arrow" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7"/>
                </svg>
              </div>
              <span className="title">{nextBlog.title}</span>
            </Link>
          ) : <div className="nav-button disabled" />}
        </div>
      </div>
    </div>
  )
}

export default BlogDetail
