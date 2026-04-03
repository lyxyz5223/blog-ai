# MD 文件博客系统使用指南

## 概述

博客系统已升级为从 Markdown 文件读取博客内容，而不是直接保存在 JavaScript 中。这样做的好处包括：

- ✅ **易于管理**：每篇博客是一个独立的 MD 文件，方便编辑
- ✅ **内容分离**：内容与代码分离，结构更清晰
- ✅ **版本控制**：MD 文件更适合 Git 版本管理
- ✅ **性能优化**：按需加载内容，减少初始加载量
- ✅ **易于扩展**：轻松添加新博客，无需修改代码逻辑

## 目录结构

```
blog/
├── public/
│   └── blogs/
│       ├── meta.json                 # 博客元数据文件
│       ├── 1-react-hooks.md         # 博客内容文件
│       ├── 2-modern-javascript.md
│       ├── 3-vite-tool.md
│       └── 4-css-grid.md
├── src/
│   └── data/
│       ├── blogsData.js             # 加载器（已修改）
│       └── dataService.js           # 数据服务（已修改）
```

## 如何添加新博客

### 步骤 1：创建 MD 文件

在 `public/blogs/` 目录下创建一个新的 Markdown 文件，命名格式为 `{id}-{slug}.md`

例如：`5-web-performance.md`

```markdown
# Web 性能优化指南

## 介绍
Web 性能对用户体验至关重要...

## 性能指标
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

## 优化技巧
...
```

### 步骤 2：更新 meta.json

在 `public/blogs/meta.json` 中添加新博客的元数据：

```json
{
  "id": 5,
  "title": "Web 性能优化指南",
  "excerpt": "深入了解如何优化网页加载速度和交互性...",
  "filename": "5-web-performance.md",
  "datetime": "2024-02-01T10:00",
  "category": "性能优化",
  "author": "技术博主"
}
```

**字段说明：**
- `id`: 博客唯一标识符（整数），必须唯一
- `title`: 博客标题
- `excerpt`: 博客摘要（用于列表显示）
- `filename`: 对应的 MD 文件名
- `datetime`: 发布时间（ISO 8601 格式）
- `category`: 博客分类
- `author`: 博客作者

### 步骤 3：验证

应用会自动从 `public/blogs/` 加载所有博客。刷新页面即可看到新博客。

## 工作流程

### 数据加载优先级

系统按以下优先级加载数据：

1. **MD 文件模式**（新方式）✨
   - 从 `public/blogs/meta.json` 加载元数据
   - 按需加载对应的 MD 文件内容
   - **推荐使用**

2. **本地存储模式**（回退）
   - 使用 `blogsData.js` 中的内存数据
   - 当 MD 文件加载失败时使用

3. **API 模式**（可选）
   - 从后端 API 获取数据
   - 需要配置 `config.js`

### 代码架构

#### blogsData.js
```javascript
export const loadBlogsData = async () => {
  // 加载 meta.json 获取元数据
  // 为每个博客加载对应的 MD 文件内容
  // 返回完整的博客对象数组
}
```

#### dataService.js
```javascript
// 新增函数
export const loadFileBasedBlogs = async () => {
  // 从 MD 文件系统加载所有博客（带缓存）
}

// 所有数据函数都已升级，优先使用 MD 文件：
- getBlogsData()         // 获取博客列表
- getPaginatedBlogs()    // 获取分页博客
- getBlogDetail()        // 获取博客详情
- getCategories()        // 获取分类列表
```

## 编辑现有博客

### 修改元数据

直接编辑 `public/blogs/meta.json` 中的相应条目，修改标题、摘要、分类等。

### 修改 MD 内容

直接编辑对应的 MD 文件，无需修改任何代码。

## MD 文件格式建议

### 标题结构
```markdown
# 主标题（H1）

## 章节标题（H2）

### 小节标题（H3）
```

### 代码高亮
```markdown
\`\`\`javascript
const example = () => {
  console.log('Hello');
};
\`\`\`

\`\`\`css
.container {
  display: flex;
}
\`\`\`
```

### 强调和列表
```markdown
**粗体文本**
*斜体文本*
`代码`

- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2
```

## 常见问题

### Q: 如何删除博客？
A: 从 `public/blogs/meta.json` 中删除对应条目，并删除对应的 MD 文件（可选）。

### Q: 新博客为什么不显示？
A: 检查以下几点：
1. MD 文件名是否与 `meta.json` 中的 `filename` 一致
2. 文件是否保存在 `public/blogs/` 目录下
3. 浏览器缓存是否需要清除（Ctrl+Shift+Delete）
4. 查看浏览器控制台是否有加载错误

### Q: 如何修改博客日期？
A: 编辑 `public/blogs/meta.json` 中的 `datetime` 字段即可。

### Q: 可以使用特殊的 Markdown 扩展语法吗？
A: 支持标准 Markdown 语法。复杂的扩展语法（如表格）显示效果可能会因为渲染器而异。

## 相关文件

- [blogsData.js](src/data/blogsData.js) - 数据加载器
- [dataService.js](src/data/dataService.js) - 数据服务
- [博客元数据](public/blogs/meta.json) - 博客列表
- [示例博客](public/blogs/) - MD 文件示例
