// 从 meta.json 加载博客元数据
let blogsMetaCache = null;
let blogContentCache = new Map(); // 缓存单篇文章内容

/**
 * 加载博客元数据（只加载元数据，不加载内容）- 支持懒加载
 * 这是列表页应该使用的方法
 */
const loadBlogsMeta = async () => {
  if (blogsMetaCache) {
    console.log(`✅ [loadBlogsMeta] 从缓存返回 ${blogsMetaCache.length} 条记录`);
    return blogsMetaCache;
  }

  try {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const metaUrl = `${baseUrl}blogs/meta.json`;
    
    console.log(`📚 [loadBlogsMeta] 加载元数据: ${metaUrl}`);
    
    const metaResponse = await fetch(metaUrl);
    if (!metaResponse.ok) {
      throw new Error(`Failed to fetch meta.json: ${metaResponse.status} ${metaResponse.statusText}`);
    }
    
    blogsMetaCache = await metaResponse.json();
    console.log(`✅ [loadBlogsMeta] 成功加载 ${blogsMetaCache.length} 篇文章的元数据`);
    
    return blogsMetaCache;
  } catch (error) {
    console.error('❌ [loadBlogsMeta] 加载失败:', error);
    return [];
  }
};

/**
 * 懒加载单篇文章内容
 * 只在需要时（详情页）加载单个文章的完整内容
 */
const loadBlogContent = async (filename) => {
  // 检查缓存
  if (blogContentCache.has(filename)) {
    console.log(`✅ [loadBlogContent] 从缓存返回: ${filename}`);
    return blogContentCache.get(filename);
  }

  try {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const contentUrl = `${baseUrl}blogs/${filename}`;
    
    console.log(`📖 [loadBlogContent] 加载文章内容: ${contentUrl}`);
    
    const contentResponse = await fetch(contentUrl);
    if (!contentResponse.ok) {
      throw new Error(`Failed to fetch ${filename}: ${contentResponse.status}`);
    }
    
    const content = await contentResponse.text();
    
    // 存入缓存，最多保持20篇文章的缓存
    blogContentCache.set(filename, content);
    if (blogContentCache.size > 20) {
      const firstKey = blogContentCache.keys().next().value;
      blogContentCache.delete(firstKey);
    }
    
    console.log(`✅ [loadBlogContent] 成功加载: ${filename}`);
    return content;
  } catch (error) {
    console.error(`❌ [loadBlogContent] 加载失败 ${filename}:`, error);
    throw error;
  }
};

/**
 * 旧方法：一次性加载所有文章（仅保留用于兼容，不推荐）
 */
const loadBlogsData = async () => {
  try {
    const metadata = await loadBlogsMeta();
    
    // 为每个博客加载 markdown 内容（这会很慢）
    console.warn('⚠️ [loadBlogsData] 一次性加载所有文章，不推荐在生产环境使用');
    
    const blogs = await Promise.all(
      metadata.map(async (blog) => {
        try {
          const content = await loadBlogContent(blog.filename);
          return { ...blog, content };
        } catch (error) {
          return { ...blog, content: '内容加载失败' };
        }
      })
    );

    return blogs;
  } catch (error) {
    console.error('❌ [loadBlogsData] 加载失败:', error);
    return [];
  }
};

export { loadBlogsData, loadBlogsMeta, loadBlogContent };

// 导出一个兼容旧代码的 blogsData，用于同步场景
// 使用此时需要调用 loadBlogsData() 异步函数
export const blogsData = [];
