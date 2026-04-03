import { blogsData as localBlogsData } from './blogsData';
import { loadConfig, isUsingLocalStorage, getApiEndpoint } from '../config/config';

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
 */
export const getBlogsData = async () => {
  try {
    const config = await loadConfig();
    
    if (config.useLocalStorage) {
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
 * 获取分页的博客数据（不包含完整内容，用于列表显示）
 * 优化：直接使用后端分页 API，避免加载全部数据
 * @param {number} page - 页码（从1开始）
 * @param {number} pageSize - 每页数量
 * @returns {Promise<{items: Array, total: number, page: number, pageSize: number, totalPages: number}>}
 */
export const getPaginatedBlogs = async (page = 1, pageSize = 10) => {
  try {
    const config = await loadConfig();
    
    if (config.useLocalStorage) {
      // 本地数据模式：从本地数据进行分页处理
      const allBlogs = getLocalBlogsData();
      const blogsForList = allBlogs.map(blog => ({
        id: blog.id,
        title: blog.title,
        category: blog.category,
        datetime: blog.datetime || blog.date,
        date: blog.datetime || blog.date,
        excerpt: blog.excerpt || blog.content?.substring(0, 100) + '...' || '无摘要',
        author: blog.author
      }));

      const total = blogsForList.length;
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const items = blogsForList.slice(startIndex, endIndex);
      
      return { items, total, page, pageSize, totalPages };
    } else {
      // API 模式：使用后端分页 API（推荐大数据量使用）
      const apiEndpoint = getApiEndpoint();
      const response = await fetch(`${apiEndpoint}/blogs/paginated/${page}?limit=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting paginated blogs:', error);
    throw error;
  }
};

/**
 * 获取所有分类（优化版本）
 * 直接从后端获取，而不是加载全部数据来提取分类
 */
export const getCategories = async () => {
  try {
    const config = await loadConfig();
    
    if (config.useLocalStorage) {
      // 本地数据模式
      const blogs = getLocalBlogsData();
      return [...new Set(blogs.map(blog => blog.category).filter(Boolean))];
    } else {
      // API 模式：使用专门的分类 API
      const apiEndpoint = getApiEndpoint();
      const response = await fetch(`${apiEndpoint}/categories`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

/**
 * 获取单篇博客的完整内容（包含缓存）- 优化版本
 * 改为直接根据 ID 获取，而非加载所有博客后再查找
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
    console.error('Error getting blog detail:', error);
    throw error;
  }
};

/**
 * 获取本地博客数据
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

