import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { getPaginatedBlogs } from '../data/dataService'
import { formatDateTime } from '../utils/formatDate'
import './Home.css'

function Home() {
  const [latestBlogs, setLatestBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true)
        const data = await getPaginatedBlogs(1, 3) // 加载首页最新的3篇文章
        console.log('📚 [Home] 加载的最新博客数据:', data)
        setLatestBlogs(data.items)
        setError(null)
      } catch (err) {
        console.error('Failed to load blogs:', err)
        setError('加载数据失败')
        setLatestBlogs([])
      } finally {
        setLoading(false)
      }
    }

    loadBlogs()
  }, [])

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>欢迎来到我的博客</h1>
          <p>分享技术知识，记录学习之旅</p>
          <Link to="/blogs" className="cta-button">
            浏览文章
          </Link>
        </div>
      </section>

      <section className="featured-posts">
        <div className="section-container">
          <h2>最新文章</h2>
          {loading && <div className="loading">⏳ 加载中...</div>}
          {error && <div className="error-message">❌ {error}</div>}
          {!loading && !error && (
            <div className="posts-grid">
              {latestBlogs.length > 0 ? (
                latestBlogs.map(blog => (
                  <article key={blog.id} className="blog-card">
                    <div className="card-header">
                      <h3>{blog.title}</h3>
                      <span className="category">{blog.category}</span>
                    </div>
                    <p className="excerpt">{blog.excerpt}</p>
                    <div className="card-footer">
                      <time dateTime={blog.date}>
                        {formatDateTime(blog.date)}
                      </time>
                      <Link 
                        to={`/blog/${blog.id}`}
                        className="read-more"
                      >
                        阅读更多 →
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <p className="no-posts">暂无文章</p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="about-preview">
        <div className="section-container">
          <h2>关于我</h2>
          <p>我是一名热爱 Web 开发的工程师，专注于前端技术和现代开发工具。在这个博客上，我分享我的学习经验和技术见解。</p>
          <Link to="/about" className="link-button">
            了解更多关于我 →
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
