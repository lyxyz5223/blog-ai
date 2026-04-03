// 从 meta.json 加载博客元数据
let blogsDataCache = null;

const loadBlogsData = async () => {
  if (blogsDataCache) {
    return blogsDataCache;
  }

  try {
    // 加载元数据
    const metaResponse = await fetch('/blogs/meta.json');
    const metadata = await metaResponse.json();

    // 为每个博客加载 markdown 内容
    const blogs = await Promise.all(
      metadata.map(async (blog) => {
        try {
          const contentResponse = await fetch(`/blogs/${blog.filename}`);
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
