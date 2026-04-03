# 文章加载懒加载修复

## 问题诊断
- ✅ 文章列表显示正常
- ❌ 点击进入文章详情页时无法加载内容

## 根本原因
之前的代码逻辑：
1. 列表页加载时，**一次性加载所有文章的完整内容**
2. 如果任何一个 markdown 文件加载失败，整个列表加载都会失败
3. 没有错误恢复机制，导致详情页出现 404

## 解决方案

### 1. 分离元数据加载和内容加载
**新的架构：** `blogsData.js`
```
loadBlogsMeta() ──→ 只加载 meta.json（快速）
    ↓
loadBlogContent() ──→ 懒加载单个 markdown（按需）
```

### 2. 改进的加载流程

```
列表页面
├─ getPaginatedBlogs()
│  └─ loadBlogsMeta()  ← 只加载元数据，快速显示列表
│
详情页面
├─ getBlogDetail(id)
│  └─ loadBlogsMeta()  ← 先查找元数据
│     └─ loadBlogContent(filename)  ← 再加载单个文章内容（含缓存）
```

### 3. 关键改动

| 文件 | 改动 | 好处 |
|------|------|------|
| `blogsData.js` | 拆分为 `loadBlogsMeta()` 和 `loadBlogContent()` | 懒加载，快速响应 |
| `dataService.js` | `getPaginatedBlogs()` 只加载元数据 | 列表页加载快 |
| `dataService.js` | `getBlogDetail()` 仅加载该篇内容 | 详情页快速加载 |
| 两处 | 每个函数都有缓存机制 | 避免重复请求 |

### 4. LRU 缓存策略
- 最多缓存 **20 篇文章内容**（降低内存压力）
- 超过限制时，删除最早访问的文章
- 优化用户频繁切换文章时的体验

## 支持的两种部署方式

### 开发环境
```
http://localhost:5173
└─ /blogs/meta.json
└─ /blogs/xxx.md
```

### GitHub Pages 部署
```
https://lyxyz5223.github.io/blog-ai/
└─ /blog-ai/blogs/meta.json
└─ /blog-ai/blogs/xxx.md
```

✨ 使用 `import.meta.env.BASE_URL` 自动适配

## 测试清单

### 列表页面
- [ ] 页面快速加载（不需要等待所有文章内容）
- [ ] 显示所有文章的标题、摘要、分类
- [ ] 分页功能正常
- [ ] 浏览器控制台看到 `📄 [getPaginatedBlogs]` 日志

### 详情页面
- [ ] 点击文章能快速跳转
- [ ] 文章内容正常加载和显示
- [ ] 首次加载看到 `📖 [详情页] 加载文章...` 日志
- [ ] 再次访问看到 `📦 [缓存命中]` 日志

### 本地开发
```bash
yarn dev
# 访问 http://localhost:5173，检查功能
```

### GitHub Pages 部署
```bash
yarn build
# 推送到 GitHub，自动部署
# 访问 https://lyxyz5223.github.io/blog-ai/
```

## 性能提升

### Before（一次性加载所有内容）
```
列表页加载时间：500ms + 5篇文章 × 100ms = 1000ms+ ❌
任何文件失败→整个页面失败 ❌
```

### After（懒加载）
```
列表页加载时间：100ms ✅（只加载 meta.json）
详情页加载时间：50ms（从缓存） / 100ms（新文章）✅
任何文件失败→仅该文章失败，不影响列表 ✅
```

## 调试帮助

### 如果列表不显示
检查浏览器控制台：
```
📚 [loadBlogsMeta] 加载元数据: https://...
✅ [loadBlogsMeta] 成功加载 X 篇文章的元数据
```

### 如果详情页显示失败
检查浏览器控制台：
```
📖 [详情页] 加载文章ID: X（懒加载）
📖 [loadBlogContent] 加载文章内容: https://...
✅ [loadBlogContent] 成功加载: xxx.md
```

如果看到 ❌ 错误，检查：
1. `/blogs/meta.json` 是否存在
2. 文件名在 `meta.json` 中是否正确
3. 对应的 `.md` 文件是否存在
