// 在浏览器控制台中运行此代码来诊断加载问题

console.log('🔍 [诊断] 开始检查文件加载...');

// 获取当前 BASE_URL
const baseUrl = import.meta.env?.BASE_URL || '/';
console.log('📍 BASE_URL:', baseUrl);

// 构建 meta.json 的 URL
const metaUrl = `${baseUrl}blogs/meta.json`;
console.log('📄 meta.json URL:', metaUrl);

// 测试加载 meta.json
fetch(metaUrl)
  .then(res => {
    console.log(`✅ meta.json 状态: ${res.status} ${res.statusText}`);
    return res.json();
  })
  .then(data => {
    console.log(`📚 加载成功，共 ${data.length} 篇文章`);
    
    // 检查第一个文件
    const firstBlog = data[0];
    console.log(`🔹 第一篇文章:`, firstBlog);
    const contentUrl = `${baseUrl}blogs/${firstBlog.filename}`;
    console.log(`📖 尝试加载: ${contentUrl}`);
    
    // 测试加载第一篇文章的内容
    return fetch(contentUrl);
  })
  .then(res => {
    console.log(`✅ 文章内容状态: ${res.status} ${res.statusText}`);
    if (!res.ok) {
      throw new Error(`Failed: ${res.status}`);
    }
    return res.text();
  })
  .then(content => {
    console.log(`✅ 文章加载成功，内容长度: ${content.length} 字符`);
    console.log(`📋 前 100 字符:`, content.substring(0, 100));
  })
  .catch(err => {
    console.error('❌ 加载失败:', err.message);
    console.error('❌ 完整错误:', err);
  });
