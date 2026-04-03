// 从 meta.json 加载博客元数据
let blogsDataCache = null;

const loadBlogsData = async () => {
  if (blogsDataCache) {
    return blogsDataCache;
  }

  try {
    // 使用 BASE_URL 支持 GitHub Pages 部署
    const baseUrl = import.meta.env.BASE_URL || '/';
    const metaUrl = `${baseUrl}blogs/meta.json`;
    
    console.log(`📚 [loadBlogsData] 尝试加载: ${metaUrl}`);
    
    // 加载元数据
    const metaResponse = await fetch(metaUrl);
    if (!metaResponse.ok) {
      throw new Error(`Failed to fetch meta.json: ${metaResponse.status} ${metaResponse.statusText}`);
    }
    const metadata = await metaResponse.json();
    console.log(`📚 [loadBlogsData] 成功加载 ${metadata.length} 篇文章的元数据`);

    // 为每个博客加载 markdown 内容
    const blogs = await Promise.all(
      metadata.map(async (blog) => {
        try {
          const contentUrl = `${baseUrl}blogs/${blog.filename}`;
          const contentResponse = await fetch(contentUrl);
          if (!contentResponse.ok) {
            throw new Error(`Failed to fetch ${blog.filename}: ${contentResponse.status}`);
          }
          const content = await contentResponse.text();
          return {
            ...blog,
            content
          };
        } catch (error) {
          console.error(`Failed to load blog content for ${blog.filename}:`, error);
          return {
            ...blog,
            content: '内容加载失败'
          };
        }
      })
    );

    blogsDataCache = blogs;
    console.log(`✅ [loadBlogsData] 成功加载所有文章内容`);
    return blogs;
  } catch (error) {
    console.error('Failed to load blogs data:', error);
    return [];
  }
};

export { loadBlogsData };

// 导出一个兼容旧代码的 blogsData，用于同步场景
// 使用此时需要调用 loadBlogsData() 异步函数
export const blogsData = [];
