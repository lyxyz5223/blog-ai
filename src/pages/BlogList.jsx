import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router'
import { getPaginatedBlogs, getCategories } from '../data/dataService'
import { formatDateTime } from '../utils/formatDate'
import './BlogList.css'

const ITEMS_PER_PAGE = 10

function BlogList() {
  const { page } = useParams()
  const navigate = useNavigate()
  const currentPage = parseInt(page) || 1

  const [blogsData, setBlogsData] = useState(null)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [inputValue, setInputValue] = useState('')

  // 合并加载：分页数据 + 分类（减少网络请求）
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // 并行加载两个数据，而不是顺序加载
        const [blogsResult, categoriesResult] = await Promise.all([
          getPaginatedBlogs(currentPage, ITEMS_PER_PAGE),
          getCategories()
        ])
        
        console.log(`📖 [BlogList] 加载第 ${currentPage} 页数据:`, blogsResult)
        console.log('📂 [BlogList] 加载的分类:', categoriesResult)
        
        setBlogsData(blogsResult)
        setCategories(categoriesResult)
        setError(null)
      } catch (err) {
        console.error('Failed to load data:', err)
        setError('加载数据失败，请检查配置设置')
        setBlogsData(null)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentPage])

  const filteredBlogs = (blogsData?.items || []).filter(blog => {
    const matchCategory = !selectedCategory || blog.category === selectedCategory
    const matchSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    return matchCategory && matchSearch
  })

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (blogsData?.totalPages || 1)) {
      navigate(`/blogs/page/${newPage}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const renderPagination = () => {
    if (!blogsData || blogsData.totalPages <= 1) return null

    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
    let endPage = Math.min(blogsData.totalPages, startPage + maxVisible - 1)

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    if (startPage > 1) {
      pages.push(
        <Link key="first" to="/blogs" className="pagination-link">
          首页
        </Link>
      )
      if (startPage > 2) {
        pages.push(<span key="ellipsis-start" className="pagination-ellipsis">...</span>)
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        i === currentPage ? (
          <span key={i} className="pagination-current">
            {i}
          </span>
        ) : (
          <Link
            key={i}
            to={i === 1 ? '/blogs' : `/blogs/page/${i}`}
            className="pagination-link"
          >
            {i}
          </Link>
        )
      )
    }

    if (endPage < blogsData.totalPages) {
      if (endPage < blogsData.totalPages - 1) {
        pages.push(<span key="ellipsis-end" className="pagination-ellipsis">...</span>)
      }
      pages.push(
        <Link key="last" to={`/blogs/page/${blogsData.totalPages}`} className="pagination-link">
          末页
        </Link>
      )
    }

    return <div className="pagination">{pages}</div>
  }

  return (
    <div className="blog-list-page">
      <div className="page-header">
        <h1>所有文章</h1>
        <p>探索我的技术文章和思考</p>
      </div>

      {loading && (
        <div className="loading">
          <p>⏳ 加载中...</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {!loading && !error && blogsData && (
        <div className="blog-list-container">
          <div className="filters-top">
            <div className="search-box">
              <input
                type="text"
                placeholder="搜索文章..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && setSearchTerm(inputValue)}
                className="search-input"
              />
              <button
                className="search-btn"
                onClick={() => setSearchTerm(inputValue)}
                title="搜索"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>

            <div className="filters">
              <div className="category-buttons">
                <button
                  className={`category-btn ${selectedCategory === null ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(null)}
                >
                  全部 ({blogsData?.total || 0})
                </button>
                {categories.map(category => (
                  <button
                    key={category}
                    className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <main className="blog-content">
            {filteredBlogs.length > 0 ? (
              <>
                <div className="blog-posts">
                  {filteredBlogs.map(blog => (
                    <article key={blog.id} className="blog-post">
                      <div className="post-header">
                        <h2 className="post-title">{blog.title}</h2>
                        <span className="post-category">{blog.category}</span>
                      </div>
                      <p className="post-excerpt">{blog.excerpt || '暂无摘要'}</p>
                      <div className="post-meta">
                        <time dateTime={blog.date}>
                          {formatDateTime(blog.date)}
                        </time>
                      </div>
                      <Link
                        to={`/blog/${blog.id}`}
                        className="read-btn"
                      >
                        继续阅读 →
                      </Link>
                    </article>
                  ))}
                </div>
                {renderPagination()}
              </>
            ) : (
              <div className="no-results">
                <p>没有找到匹配的文章</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default BlogList
