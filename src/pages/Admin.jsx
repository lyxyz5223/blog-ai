import { useState, useEffect } from 'react'
import { getBlogsData, getBlogDetail, getPaginatedBlogs, createBlog, updateBlog, deleteBlog, getLocalBlogsData, clearAllBlogsCache, clearBlogCache } from '../data/dataService'
import { loadConfig, updateConfig, isUsingLocalStorage, getApiEndpoint } from '../config/config'
import { formatDateTime } from '../utils/formatDate'
import MarkdownEditor from '../components/MarkdownEditor'
import './Admin.css'

function Admin() {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [useLocal, setUseLocal] = useState(true)
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:5000/api')
  const [isSaving, setIsSaving] = useState(false)
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalBlogs, setTotalBlogs] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  // 获取本地时间的 ISO 字符串（不是 UTC）
  const getLocalISODateTime = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // 处理从数据库返回的 dateTime
  const normalizeDateTimeValue = (dateTimeValue) => {
    if (!dateTimeValue) return getLocalISODateTime()
    
    // 如果是 Date 对象，转换为 datetime-local 格式
    if (dateTimeValue instanceof Date) {
      const year = dateTimeValue.getFullYear()
      const month = String(dateTimeValue.getMonth() + 1).padStart(2, '0')
      const day = String(dateTimeValue.getDate()).padStart(2, '0')
      const hours = String(dateTimeValue.getHours()).padStart(2, '0')
      const minutes = String(dateTimeValue.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }
    
    // 如果是字符串
    if (typeof dateTimeValue === 'string') {
      // ISO 8601 UTC 格式: "2026-04-03T04:26:00.000Z" -> 转换为本地时间
      if (dateTimeValue.includes('Z')) {
        const date = new Date(dateTimeValue)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const hours = String(date.getHours()).padStart(2, '0')
        const minutes = String(date.getMinutes()).padStart(2, '0')
        return `${year}-${month}-${day}T${hours}:${minutes}`
      }
      
      // 如果已经是 datetime-local 格式，直接返回
      if (dateTimeValue.includes('T')) {
        return dateTimeValue.substring(0, 16) // 只取 YYYY-MM-DDTHH:mm 部分
      }
      
      // 如果只是日期，补充时间
      return `${dateTimeValue}T00:00`
    }
    
    return getLocalISODateTime()
  }

  const [formData, setFormData] = useState({
    id: '',
    title: '',
    excerpt: '',
    content: '',
    datetime: getLocalISODateTime(),
    category: '',
    author: ''
  })

  // 加载初始配置和数据
  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        setLoading(true)
        const config = await loadConfig()
        setUseLocal(config.useLocalStorage)
        setApiEndpoint(config.apiEndpoint)
        
        // 使用分页加载数据
        const result = await getPaginatedBlogs(1, pageSize)
        console.log('📊 从数据服务获取的分页数据:', result)
        setBlogs(result.items)
        setTotalBlogs(result.total)
        setTotalPages(result.totalPages)
        setCurrentPage(1)
        setError(null)
      } catch (err) {
        console.error('Failed to initialize admin:', err)
        setError('初始化失败，已切换到本地存储模式')
        const localData = getLocalBlogsData()
        setBlogs(localData)
        setTotalBlogs(localData.length)
        setTotalPages(Math.ceil(localData.length / pageSize))
        setUseLocal(true)
      } finally {
        setLoading(false)
      }
    }

    initializeAdmin()
  }, [])

  const handleStorageModeToggle = async () => {
    const newMode = !useLocal
    try {
      // 加载新配置
      const config = await loadConfig()
      const newConfig = {
        ...config,
        useLocalStorage: newMode
      }
      updateConfig(newConfig)
      setUseLocal(newMode)
      
      // 清除所有缓存
      clearAllBlogsCache()
      
      // 重新加载数据（回到第一页）
      setCurrentPage(1)
      const result = await getPaginatedBlogs(1, pageSize)
      if (newMode) {
        setBlogs(result.items)
        setTotalBlogs(result.total)
        setTotalPages(result.totalPages)
        alert('已切换到本地存储模式')
      } else {
        setBlogs(result.items)
        setTotalBlogs(result.total)
        setTotalPages(result.totalPages)
        alert('已切换到数据库模式')
      }
      
      setEditingId(null)
      setIsCreating(false)
    } catch (err) {
      alert('切换模式失败：' + err.message)
    }
  }

  // 加载特定页的数据
  const loadPage = async (page) => {
    try {
      setLoading(true)
      const result = await getPaginatedBlogs(page, pageSize)
      setBlogs(result.items)
      setTotalBlogs(result.total)
      setTotalPages(result.totalPages)
      setCurrentPage(page)
      setEditingId(null)
      setIsCreating(false)
      console.log(`📄 [分页] 已加载第 ${page} 页，共 ${result.total} 篇文章`)
    } catch (err) {
      console.error('Failed to load page:', err)
      alert('加载页面失败：' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (blog) => {
    try {
      // 如果博客对象中没有 content，需要加载完整内容
      let fullBlog = blog;
      if (!blog.content) {
        console.log(`📥 文章缺少内容，正在加载完整内容 ID=${blog.id}`);
        fullBlog = await getBlogDetail(blog.id);
      }
      
      setEditingId(fullBlog.id);
      // 正确处理 dateTime 格式（可能是 Date 对象或字符串，UTC 或本地）
      const blogData = { ...fullBlog };
      blogData.datetime = normalizeDateTimeValue(fullBlog.datetime || fullBlog.date);
      console.log(`✏️ [handleEdit] 编辑文章 #${fullBlog.id}:`);
      console.log(`   原始 datetime: ${fullBlog.datetime || fullBlog.date}`);
      console.log(`   转换后 datetime: ${blogData.datetime}`);
      console.log(`   文章内容长度: ${blogData.content?.length || 0} 字符`);
      setFormData(blogData);
      setIsCreating(false);
    } catch (err) {
      console.error('Failed to load blog for editing:', err);
      alert('加载文章失败：' + err.message);
    }
  };

  const handleNew = () => {
    setIsCreating(true)
    setEditingId(null)
    setFormData({
      id: Math.max(...blogs.map(b => b.id), 0) + 1,
      title: '',
      excerpt: '',
      content: '',
      datetime: getLocalISODateTime(),
      category: '',
      author: ''
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    console.log('🔍 [Admin] handleSave被调用，当前formData:', {
      id: formData.id,
      title: formData.title,
      excerpt: formData.excerpt.substring(0, 30) + '...',
      content: formData.content.substring(0, 50) + '...',
      datetime: formData.datetime,
      category: formData.category,
      author: formData.author
    })
    
    if (!formData.title || !formData.excerpt || !formData.content) {
      alert('请填写必需字段：标题、摘要、内容')
      return
    }

    try {
      setIsSaving(true)
      
      // 准备要发送的数据（只包含必要字段）
      const dataToSave = {
        title: formData.title,
        excerpt: formData.excerpt,
        content: formData.content,
        datetime: formData.datetime,
        category: formData.category,
        author: formData.author
      }
      
      console.log('💾 [前端] 准备保存:', dataToSave)
      
      if (useLocal) {
        // 本地存储模式
        if (isCreating) {
          setBlogs([...blogs, { ...dataToSave, id: formData.id }])
          setTotalBlogs(totalBlogs + 1)
          alert('新文章已创建！请导出 blogsData.js 以保存到文件')
        } else {
          setBlogs(blogs.map(b => b.id === editingId ? { ...dataToSave, id: b.id } : b))
          alert('文章已更新！')
        }
      } else {
        // 数据库模式
        if (isCreating) {
          const newBlog = await createBlog(dataToSave)
          // 如果是第一页且未满，直接添加；否则重新加载当前页
          if (blogs.length < pageSize) {
            setBlogs([...blogs, newBlog])
            setTotalBlogs(totalBlogs + 1)
          } else {
            await loadPage(currentPage)
          }
          alert('文章已创建！')
        } else {
          const updatedBlog = await updateBlog(editingId, dataToSave)
          setBlogs(blogs.map(b => b.id === editingId ? updatedBlog : b))
          alert('文章已更新！')
        }
      }
      
      setEditingId(null)
      setIsCreating(false)
    } catch (err) {
      console.error('❌ 保存错误:', err)
      alert('保存失败：' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('确定要删除这篇文章吗？')) {
      return
    }

    try {
      setIsSaving(true)
      
      if (useLocal) {
        setBlogs(blogs.filter(b => b.id !== id))
        setTotalBlogs(totalBlogs - 1)
        alert('文章已删除！请导出 blogsData.js 以保存到文件')
      } else {
        await deleteBlog(id)
        setBlogs(blogs.filter(b => b.id !== id))
        setTotalBlogs(totalBlogs - 1)
        alert('文章已删除！')
      }
      
      setEditingId(null)
      setIsCreating(false)
    } catch (err) {
      alert('删除失败：' + err.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsCreating(false)
  }

  const handleExport = () => {
    const dataStr = `export const blogsData = ${JSON.stringify(blogs, null, 2)}`
    const blob = new Blob([dataStr], { type: 'text/javascript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'blogsData.js'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>📝 博客管理后台</h1>
        <div className="admin-actions">
          <button className="btn btn-primary" onClick={handleNew}>
            ➕ 新建文章
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>
            💾 导出数据
          </button>
          <div className="storage-toggle">
            <label>
              <input 
                type="checkbox" 
                checked={!useLocal}
                onChange={handleStorageModeToggle}
              />
              <span className="toggle-label">
                {useLocal ? '📁 本地存储模式' : '🗄️ 数据库模式'}
              </span>
              {!useLocal && <span className="db-endpoint">{apiEndpoint}</span>}
            </label>
          </div>
        </div>
      </div>

      {loading && (
        <div className="admin-loading">
          <p>⏳ 加载中...</p>
        </div>
      )}

      {error && (
        <div className="admin-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && (
        <div className="admin-container">
          {/* 左侧：文章列表 */}
          <aside className="admin-list">
            <div className="list-header">
              <h2>所有文章 ({totalBlogs})</h2>
              <div className="pagination-info">
                {totalPages > 0 && (
                  <span>第 {currentPage} / {totalPages} 页</span>
                )}
              </div>
            </div>
            <div className="blog-list">
              {blogs.length === 0 ? (
                <div className="empty-list">暂无文章</div>
              ) : (
                blogs.map(blog => (
                  <div
                    key={blog.id}
                    className={`list-item ${editingId === blog.id ? 'active' : ''}`}
                    onClick={() => handleEdit(blog)}
                    title={`[DEBUG] 完整数据: ${JSON.stringify(blog)}`}
                  >
                    <div className="item-title">{blog.title}</div>
                    <div className="item-meta">
                      <span className="item-date">
                        {formatDateTime(blog.datetime)}
                      </span>
                      <span className="item-category">{blog.category}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="pagination-controls">
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => loadPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  ← 上一页
                </button>
                <span className="page-indicator">
                  {currentPage} / {totalPages}
                </span>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={() => loadPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  下一页 →
                </button>
              </div>
            )}
          </aside>

          {/* 右侧：编辑表单 */}
          <main className="admin-editor">
            {editingId || isCreating ? (
              <div className="form-container">
                <h2>{isCreating ? '创建新文章' : '编辑文章'}</h2>

                <form className="edit-form">
                  <div className="form-group">
                    <label>文章标题 *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="输入文章标题"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>发布日期和时间</label>
                      <input
                        type="datetime-local"
                        name="datetime"
                        value={formData.datetime}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>分类 *</label>
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="如：React, JavaScript"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>作者 *</label>
                      <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        placeholder="作者名"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>文章摘要 *</label>
                    <textarea
                      name="excerpt"
                      value={formData.excerpt}
                      onChange={handleChange}
                      placeholder="输入文章摘要（将显示在列表页）"
                      rows="2"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>文章内容 * (支持 Markdown)</label>
                    <MarkdownEditor
                      value={formData.content}
                      onChange={(val) => {
                        console.log('📝 [Admin] 编辑器内容变化:', val.substring(0, 50) + '...')
                        setFormData(prev => ({
                          ...prev,
                          content: val || ''
                        }))
                      }}
                      placeholder="输入文章内容，支持 Markdown 格式"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={handleSave}
                      disabled={isSaving}
                    >
                      {isSaving ? '保存中...' : '💾 保存'}
                    </button>
                    {!isCreating && (
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={() => handleDelete(editingId)}
                        disabled={isSaving}
                      >
                        {isSaving ? '删除中...' : '🗑️ 删除'}
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      ❌ 取消
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="empty-state">
                <p>选择一篇文章进行编辑，或创建新文章</p>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}

export default Admin
