import { blogsData as localBlogsData, loadBlogsMeta, loadBlogContent } from './blogsData';
import { loadConfig, getApiEndpoint } from '../config/config';

// 文章缓存系统 - 保存已加载的完整文章内容
const articleCache = new Map();
const CACHE_SIZE = 10; // 保持最多10篇文章的缓存

/**
 * 添加文章到缓存（LRU缓存策略）
 */
const addToCache = (id, article) => {
  // 如果已存在，先删除再重新添加（保证最近访问的在最后）
  if (articleCache.has(id)) {
    articleCache.delete(id);
  }
  articleCache.set(id, article);
  
  // 超过缓存限制时删除最早的条目
  if (articleCache.size > CACHE_SIZE) {
    const firstKey = articleCache.keys().next().value;
    articleCache.delete(firstKey);
  }
};

/**
 * 从缓存获取文章
 */
const getFromCache = (id) => {
  if (articleCache.has(id)) {
    // 获取后移到最后（LRU）
    const article = articleCache.get(id);
    articleCache.delete(id);
    articleCache.set(id, article);
    return article;
  }
  return null;
};

/**
 * 清除某个文章的缓存
 */
const removeFromCache = (id) => {
  if (articleCache.has(id)) {
    articleCache.delete(id);
    console.log(`🗑️ [缓存清除] 文章ID: ${id}`);
  }
};

/**
 * 清除所有缓存
 */
const clearAllCache = () => {
  articleCache.clear();
  console.log(`🗑️ [缓存清空] 已清除所有文章缓存`);
};

/**
 * 获取博客列表数据（只包含摘要，不包含完整内容）- 支持本地存储和数据库切换
 * 注意：这个方法只用于获取列表，获取完整内容请使用 getBlogDetail()
 * 优先级：MD 文件 > 本地存储 > API
 */
export const getBlogsData = async () => {
  try {
    const config = await loadConfig();

    if (config.useLocalStorage) {
      // 本地模式优先从 MD 文件加载，失败后回退到内存数据
      try {
        const fileBlogs = await loadFileBasedBlogs();
        return fileBlogs.map(blog => ({
          id: blog.id,
          title: blog.title,
          category: blog.category,
          datetime: blog.datetime,
          date: blog.datetime,
          excerpt: blog.excerpt || blog.content?.substring(0, 100) + '...' || '无摘要',
          author: blog.author
        }));
      } catch (fileError) {
        console.warn('Failed to load from MD files, falling back to local data mode:', fileError);
      }

      // 使用本地数据 - 创建只包含摘要的列表
      return getLocalBlogsData().map(blog => ({
        id: blog.id,
        title: blog.title,
        category: blog.category,
        datetime: blog.datetime,
        date: blog.datetime,
        excerpt: blog.excerpt || blog.content?.substring(0, 100) + '...' || '无摘要',
        author: blog.author
      }));
    } else {
      // 从 API 获取分页列表数据（推荐方式）
      const result = await getPaginatedBlogs(1, 100); // 获取前100条
      return result.items;
    }
  } catch (error) {
    console.error('Error getting blogs data:', error);
    // 出错时回退到本地数据
    return getLocalBlogsData().map(blog => ({
      id: blog.id,
      title: blog.title,
      category: blog.category,
      datetime: blog.datetime,
      date: blog.datetime,
      excerpt: blog.excerpt || blog.content?.substring(0, 100) + '...' || '无摘要',
      author: blog.author
    }));
  }
};

/**
 * 获取分页的博客数据（只包含元数据，不包含完整内容，用于列表显示）
 * ✨ 优化：使用懒加载 - 列表页只加载元数据，详情页才加载完整内容
 * 优先级：MD 文件（元数据） > 本地存储 > API
 * @param {number} page - 页码（从1开始）
 * @param {number} pageSize - 每页数量
 * @returns {Promise<{items: Array, total: number, page: number, pageSize: number, totalPages: number}>}
 */
export const getPaginatedBlogs = async (page = 1, pageSize = 10) => {
  try {
    const config = await loadConfig();

    if (config.useLocalStorage) {
      // 本地模式优先从 MD 文件加载元数据
      try {
        const allBlogsMeta = await loadBlogsMeta();
        const blogsForList = allBlogsMeta.map(blog => ({
          id: blog.id,
          title: blog.title,
          category: blog.category,
          datetime: blog.datetime || blog.date,
          date: blog.datetime || blog.date,
          excerpt: blog.excerpt || '点击查看文章',
          author: blog.author,
          filename: blog.filename
        }));

        const total = blogsForList.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const items = blogsForList.slice(startIndex, endIndex);

        console.log(`📄 [getPaginatedBlogs] 从MD文件加载第 ${page} 页，共 ${total} 篇`);
        return { items, total, page, pageSize, totalPages };
      } catch (fileError) {
        console.warn('Failed to load from MD files, falling back to local data mode:', fileError);
      }

      // 本地数据模式：从内存数据进行分页处理
      const allBlogs = getLocalBlogsData();
      const blogsForList = allBlogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        category: blog.category,
        datetime: blog.datetime || blog.date,
        date: blog.datetime || blog.date,
        excerpt: blog.excerpt || blog.content?.substring(0, 100) + '...' || '点击查看文章',
        author: blog.author
      }));

      const total = blogsForList.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const items = blogsForList.slice(startIndex, endIndex);

      console.log(`📄 [getPaginatedBlogs] 从本地数据加载第 ${page} 页，共 ${total} 篇`);
      return { items, total, page, pageSize, totalPages };
    } else {
      // API 模式：使用后端分页 API（推荐大数据量使用）
      const apiEndpoint = getApiEndpoint();
      const response = await fetch(`${apiEndpoint}/blogs/paginated/${page}?limit=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`📄 [getPaginatedBlogs] 从API加载第 ${page} 页`);
      return result;
    }
  } catch (error) {
    console.error('❌ [getPaginatedBlogs] 加载失败:', error);
    throw error;
  }
};

/**
 * 获取所有分类（只需加载元数据）
 * 优先级：MD 文件 > 本地存储 > API
 */
export const getCategories = async () => {
  try {
    const config = await loadConfig();

    if (config.useLocalStorage) {
      // 本地模式优先使用 MD 元数据
      try {
        const blogsMeta = await loadBlogsMeta();
        // 计算每个分类的计数
        const categoryMap = {};
        blogsMeta.forEach(blog => {
          if (blog.category) {
            categoryMap[blog.category] = (categoryMap[blog.category] || 0) + 1;
          }
        });
        const categories = Object.entries(categoryMap)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => a.name.localeCompare(b.name));
        console.log(`📂 [getCategories] 从MD文件加载 ${categories.length} 个分类`);
        return categories;
      } catch (fileError) {
        console.warn('Failed to load categories from MD files, falling back to local data mode:', fileError);
      }

      // 本地数据模式
      const blogs = getLocalBlogsData();
      // 计算每个分类的计数
      const categoryMap = {};
      blogs.forEach(blog => {
        if (blog.category) {
          categoryMap[blog.category] = (categoryMap[blog.category] || 0) + 1;
        }
      });
      const categories = Object.entries(categoryMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));
      console.log(`📂 [getCategories] 从本地数据加载 ${categories.length} 个分类`);
      return categories;
    } else {
      // API 模式：使用专门的分类 API
      const apiEndpoint = getApiEndpoint();
      const response = await fetch(`${apiEndpoint}/categories`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const categories = await response.json();
      console.log(`📂 [getCategories] 从API加载 ${categories.length} 个分类`);
      return categories;
    }
  } catch (error) {
    console.error('❌ [getCategories] 加载失败:', error);
    throw error;
  }
};

/**
 * 获取单篇博客的完整内容（懒加载）
 * ✨ 优化：详情页才加载完整内容，支持LRU缓存
 * 优先级：MD 文件（懒加载） > 本地存储 > API
 * @param {number} id - 博客ID
 * @returns {Promise<Object>} 完整的博客对象
 */
export const getBlogDetail = async (id) => {
  // 先检查缓存
  const cached = getFromCache(id);
  if (cached) {
    console.log(`📦 [缓存命中] 文章ID: ${id}`);
    return cached;
  }

  try {
    const config = await loadConfig();

    if (config.useLocalStorage) {
      // 本地模式优先从 MD 文件懒加载详情
      try {
        const blogsMeta = await loadBlogsMeta();
        const blogMeta = blogsMeta.find(b => b.id === id);

        if (blogMeta) {
          console.log(`📖 [详情页] 加载文章ID: ${id}（懒加载）`);
          const content = await loadBlogContent(blogMeta.filename);
          const blog = { ...blogMeta, content };
          addToCache(id, blog);
          console.log(`💾 [缓存新增] 文章ID: ${id}（MD文件模式）`);
          return blog;
        }
      } catch (fileError) {
        console.warn('Failed to load from MD files, falling back to local data mode:', fileError);
      }

      // 本地模式：从本地数据查找
      const blogs = getLocalBlogsData();
      const blog = blogs.find(b => b.id === id);
      
      if (blog) {
        addToCache(id, blog);
        console.log(`💾 [缓存新增] 文章ID: ${id}（本地模式）`);
        return blog;
      }
    } else {
      // API 模式：直接通过 ID 从后端获取，不加载所有数据
      const apiEndpoint = getApiEndpoint();
      const response = await fetch(`${apiEndpoint}/blogs/${id}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const blog = await response.json();
      addToCache(id, blog);
      console.log(`💾 [缓存新增] 文章ID: ${id}（API数据库）`);
      return blog;
    }
    
    throw new Error(`文章 ID ${id} 不存在`);
  } catch (error) {
    console.error('❌ [getBlogDetail] 加载失败，ID:', id, '错误:', error);
    throw error;
  }
};

/**
 * 按分类获取分页博客数据（新增功能）
 * 优先级：本地数据 > API
 * @param {string} category - 分类名称
 * @param {number} page - 页码（从1开始）
 * @param {number} pageSize - 每页数量，默认10
 * @returns {Promise<Object>} 分页数据 {items, total, page, pageSize, totalPages}
 */
export const getPaginatedBlogsByCategory = async (category, page = 1, pageSize = 10) => {
  try {
    const config = await loadConfig();

    if (config.useLocalStorage) {
      // 本地模式：从本地数据进行分页处理
      try {
        const blogsMeta = await loadBlogsMeta();
        const blogsForList = blogsMeta
          .filter(blog => blog.category === category)
          .map(blog => ({
            id: blog.id,
            title: blog.title,
            category: blog.category,
            datetime: blog.datetime || blog.date,
            date: blog.datetime || blog.date,
            excerpt: blog.excerpt || '点击查看文章',
            author: blog.author
          }));

        const total = blogsForList.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const items = blogsForList.slice(startIndex, endIndex);

        console.log(`📄 [getPaginatedBlogsByCategory] 从MD文件加载分类 '${category}' 第 ${page} 页，共 ${total} 篇`);
        return { items, total, page, pageSize, totalPages };
      } catch (fileError) {
        console.warn('Failed to load from MD files, falling back to local data mode:', fileError);
      }

      // 本地数据模式：从内存数据进行分页处理
      const allBlogs = getLocalBlogsData();
      const blogsForList = allBlogs
        .filter(blog => blog.category === category)
        .map(blog => ({
          id: blog.id,
          title: blog.title,
          category: blog.category,
          datetime: blog.datetime || blog.date,
          date: blog.datetime || blog.date,
          excerpt: blog.excerpt || blog.content?.substring(0, 100) + '...' || '点击查看文章',
          author: blog.author
        }));

      const total = blogsForList.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const items = blogsForList.slice(startIndex, endIndex);

      console.log(`📄 [getPaginatedBlogsByCategory] 从本地数据加载分类 '${category}' 第 ${page} 页，共 ${total} 篇`);
      return { items, total, page, pageSize, totalPages };
    } else {
      // API 模式：使用后端分类筛选 API
      const apiEndpoint = getApiEndpoint();
      const response = await fetch(`${apiEndpoint}/blogs/category/${encodeURIComponent(category)}/page/${page}?limit=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`📄 [getPaginatedBlogsByCategory] 从API加载分类 '${category}' 第 ${page} 页`);
      return result;
    }
  } catch (error) {
    console.error('❌ [getPaginatedBlogsByCategory] 加载失败:', error);
    throw error;
  }
};

/**
 * 按多个分类获取分页博客数据
 * 优先级：本地数据 > API
 * @param {string[]} categories - 分类名称数组
 * @param {number} page - 页码（从1开始）
 * @param {number} pageSize - 每页数量，默认10
 * @returns {Promise<Object>} 分页数据 {items, total, page, pageSize, totalPages}
 */
export const getPaginatedBlogsByCategories = async (categories, page = 1, pageSize = 10) => {
  try {
    if (!categories || categories.length === 0) {
      throw new Error('至少需要选择一个分类');
    }

    const config = await loadConfig();

    if (config.useLocalStorage) {
      // 本地模式：从本地数据进行多分类筛选和分页处理
      try {
        const blogsMeta = await loadBlogsMeta();
        const blogsForList = blogsMeta
          .filter(blog => categories.includes(blog.category))
          .map(blog => ({
            id: blog.id,
            title: blog.title,
            category: blog.category,
            datetime: blog.datetime || blog.date,
            date: blog.datetime || blog.date,
            excerpt: blog.excerpt || '点击查看文章',
            author: blog.author
          }));

        const total = blogsForList.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const items = blogsForList.slice(startIndex, endIndex);

        console.log(`📄 [getPaginatedBlogsByCategories] 从MD文件加载分类 [${categories.join(', ')}] 第 ${page} 页，共 ${total} 篇`);
        return { items, total, page, pageSize, totalPages };
      } catch (fileError) {
        console.warn('Failed to load from MD files, falling back to local data mode:', fileError);
      }

      // 本地数据模式：从内存数据进行多分类筛选和分页处理
      const allBlogs = getLocalBlogsData();
      const blogsForList = allBlogs
        .filter(blog => categories.includes(blog.category))
        .map(blog => ({
          id: blog.id,
          title: blog.title,
          category: blog.category,
          datetime: blog.datetime || blog.date,
          date: blog.datetime || blog.date,
          excerpt: blog.excerpt || blog.content?.substring(0, 100) + '...' || '点击查看文章',
          author: blog.author
        }));

      const total = blogsForList.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const items = blogsForList.slice(startIndex, endIndex);

      console.log(`📄 [getPaginatedBlogsByCategories] 从本地数据加载分类 [${categories.join(', ')}] 第 ${page} 页，共 ${total} 篇`);
      return { items, total, page, pageSize, totalPages };
    } else {
      // API 模式：使用后端多分类筛选 API
      const apiEndpoint = getApiEndpoint();
      const queryParams = categories.map(c => `categories=${encodeURIComponent(c)}`).join('&');
      const response = await fetch(`${apiEndpoint}/blogs/categories/page/${page}?${queryParams}&limit=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`📄 [getPaginatedBlogsByCategories] 从API加载分类 [${categories.join(', ')}] 第 ${page} 页`);
      return result;
    }
  } catch (error) {
    console.error('❌ [getPaginatedBlogsByCategories] 加载失败:', error);
    throw error;
  }
};

/**
 * 搜索博客
 * 优先级：本地数据 > API
 * @param {string} keyword - 搜索关键词
 * @param {number} page - 页码（从1开始）
 * @param {number} pageSize - 每页数量，默认10
 * @returns {Promise<Object>} 分页数据 {items, total, page, pageSize, totalPages}
 */
export const searchBlogs = async (keyword, page = 1, pageSize = 10) => {
  try {
    if (!keyword.trim()) {
      throw new Error('搜索关键词不能为空');
    }

    const config = await loadConfig();

    if (config.useLocalStorage) {
      // 本地模式：从本地数据进行搜索和分页
      try {
        const blogsMeta = await loadBlogsMeta();
        const blogsForList = blogsMeta
          .filter(blog => 
            blog.title.toLowerCase().includes(keyword.toLowerCase()) ||
            blog.excerpt.toLowerCase().includes(keyword.toLowerCase())
          )
          .map(blog => ({
            id: blog.id,
            title: blog.title,
            category: blog.category,
            datetime: blog.datetime || blog.date,
            date: blog.datetime || blog.date,
            excerpt: blog.excerpt || '点击查看文章',
            author: blog.author
          }));

        const total = blogsForList.length;
        const totalPages = Math.ceil(total / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const items = blogsForList.slice(startIndex, endIndex);

        console.log(`🔍 [searchBlogs] 从MD文件搜索关键词 '${keyword}' 第 ${page} 页，共 ${total} 篇`);
        return { items, total, page, pageSize, totalPages, keyword };
      } catch (fileError) {
        console.warn('Failed to load from MD files, falling back to local data mode:', fileError);
      }

      // 本地数据模式：从内存数据进行搜索和分页
      const allBlogs = getLocalBlogsData();
      const blogsForList = allBlogs
        .filter(blog => 
          blog.title.toLowerCase().includes(keyword.toLowerCase()) ||
          (blog.excerpt || '').toLowerCase().includes(keyword.toLowerCase())
        )
        .map(blog => ({
          id: blog.id,
          title: blog.title,
          category: blog.category,
          datetime: blog.datetime || blog.date,
          date: blog.datetime || blog.date,
          excerpt: blog.excerpt || blog.content?.substring(0, 100) + '...' || '点击查看文章',
          author: blog.author
        }));

      const total = blogsForList.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const items = blogsForList.slice(startIndex, endIndex);

      console.log(`🔍 [searchBlogs] 从本地数据搜索关键词 '${keyword}' 第 ${page} 页，共 ${total} 篇`);
      return { items, total, page, pageSize, totalPages, keyword };
    } else {
      // API 模式：使用后端搜索 API
      const apiEndpoint = getApiEndpoint();
      const response = await fetch(`${apiEndpoint}/blogs/search?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`🔍 [searchBlogs] 从API搜索关键词 '${keyword}' 第 ${page} 页`);
      return result;
    }
  } catch (error) {
    console.error('❌ [searchBlogs] 搜索失败:', error);
    throw error;
  }
};

/**
 * 从 MD 文件系统加载博客元数据（异步）
 * ✨ 已重构为懒加载模式 - 只加载元数据，内容在需要时加载
 */
export const loadFileBasedBlogs = async () => {
  // 直接返回元数据，内容通过懒加载获取
  return await loadBlogsMeta();
};

/**
 * 获取本地博客数据
 * 现在支持从 MD 文件系统或内存数据加载
 */
export const getLocalBlogsData = () => {
  return [...localBlogsData];
};



/**
 * 获取认证token
 */
const getAuthToken = () => {
  return localStorage.getItem('adminToken');
};

/**
 * 创建请求头（包含认证token）
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

/**
 * 创建博客
 */
export const createBlog = async (blogData) => {
  try {
    const config = await loadConfig();
    
    if (config.useLocalStorage) {
      // 本地存储只在内存中操作，需要手动管理
      throw new Error('Local storage mode: Please use Admin panel to export updated data');
    } else {
      // 发送到 API
      const apiEndpoint = getApiEndpoint();
      const response = await fetch(`${apiEndpoint}/blogs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(blogData),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          // 清除过期的token
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          throw new Error('认证已过期，请重新登录');
        }
        throw new Error(`Failed to create blog: ${response.statusText}`);
      }
      
      const newBlog = await response.json();
      // 将新创建的博客添加到缓存
      addToCache(newBlog.id, newBlog);
      console.log(`💾 [缓存新增] 新建文章ID: ${newBlog.id}`);
      return newBlog;
    }
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

/**
 * 更新博客
 */
export const updateBlog = async (id, blogData) => {
  try {
    const config = await loadConfig();
    
    if (config.useLocalStorage) {
      throw new Error('Local storage mode: Please use Admin panel to export updated data');
    } else {
      const apiEndpoint = getApiEndpoint();
      const response = await fetch(`${apiEndpoint}/blogs/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(blogData),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          throw new Error('认证已过期，请重新登录');
        }
        throw new Error(`Failed to update blog: ${response.statusText}`);
      }
      
      const updatedBlog = await response.json();
      // 更新缓存中的博客数据
      addToCache(id, updatedBlog);
      console.log(`✏️ [缓存更新] 文章ID: ${id} 已同步到缓存`);
      return updatedBlog;
    }
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
};

/**
 * 删除博客
 */
export const deleteBlog = async (id) => {
  try {
    const config = await loadConfig();
    
    if (config.useLocalStorage) {
      throw new Error('Local storage mode: Please use Admin panel to export updated data');
    } else {
      const apiEndpoint = getApiEndpoint();
      const response = await fetch(`${apiEndpoint}/blogs/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          throw new Error('认证已过期，请重新登录');
        }
        throw new Error(`Failed to delete blog: ${response.statusText}`);
      }
      
      // 从缓存中删除该文章
      removeFromCache(id);
      return await response.json();
    }
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

/**
 * 清除指定文章的缓存（导出供外部使用）
 */
export const clearBlogCache = (id) => {
  removeFromCache(id);
};

/**
 * 清除所有文章缓存（导出供外部使用）
 */
export const clearAllBlogsCache = () => {
  clearAllCache();
};

