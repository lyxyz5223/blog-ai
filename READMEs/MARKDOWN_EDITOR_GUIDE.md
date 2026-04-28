# Markdown 编辑器集成指南

## 功能概述

博客应用现已集成专业的 Markdown 编辑器，支持实时预览、多种编辑模式和全屏编辑。

## 新增功能

### 1. **编辑模式切换**
   - **✎ 编辑**：纯编辑视图，最大化编辑空间
   - **👁 预览**：实时预览 Markdown 渲染效果
   - **⊞ 分屏**：同时显示编辑和预览，左右分屏

### 2. **全屏编辑**
   - 点击 **⛶** 按钮进入全屏模式
   - 适合长篇幅文章编辑
   - 再次点击退出全屏

### 3. **实时预览**
   - 即时查看 Markdown 渲染效果
   - 支持所有 Markdown 语法
   - 预览效果与发布后一致

### 4. **丰富的工具栏**
   - 粗体、斜体、代码等快捷按钮
   - Markdown 语法提示
   - 表格、列表、链接等一键插入

## 支持的 Markdown 语法

```markdown
# 一级标题
## 二级标题
### 三级标题

**粗体文本**
*斜体文本*
~~删除线~~

- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2

[链接文本](https://example.com)

![图片描述](https://example.com/image.jpg)

> 引用文本

`内联代码`

\`\`\`javascript
// 代码块
const hello = "world";
\`\`\`

| 表头1 | 表头2 |
|------|------|
| 单元格1 | 单元格2 |
```

## 安装步骤

### 1. 安装依赖
```bash
npm install
```

这会安装以下新包：
- `@uiw/react-md-editor` - 专业 Markdown 编辑器
- `@uiw/react-markdown-preview` - 高质量预览引擎

### 2. 启动应用
```bash
npm run dev
```

## 使用流程

1. **进入后台管理**
   - 点击首页 "管理员登录"
   - 输入管理员账号密码

2. **创建或编辑博客**
   - 点击 "➕ 新建文章" 创建新博客
   - 或选择已有文章进行编辑

3. **使用 Markdown 编辑器**
   - 切换编辑模式（编辑/预览/分屏）
   - 输入 Markdown 内容
   - 使用工具栏快速插入 Markdown 语法
   - 支持全屏编辑长篇文章

4. **预览效果**
   - 在预览模式下查看最终效果
   - 确保格式正确后保存

5. **保存文章**
   - 点击 "💾 保存" 按钮
   - 在数据库模式下自动保存到后端
   - 在本地模式下需要导出 `blogsData.js`

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + B` | 粗体 |
| `Ctrl/Cmd + I` | 斜体 |
| `Ctrl/Cmd + H` | 标题 |
| `Ctrl/Cmd + Shift + C` | 代码块 |
| `Ctrl/Cmd + K` | 链接 |

## 文件结构

```
src/
├── components/
│   ├── MarkdownEditor.jsx      # 编辑器组件
│   └── MarkdownEditor.css      # 编辑器样式
└── pages/
    ├── Admin.jsx               # 已更新
    └── Admin.css               # 已更新
```

## 配置说明

### MarkdownEditor 组件 Props

```javascript
<MarkdownEditor
  value={content}                    // 编辑器内容
  onChange={(val) => setContent(val)} // 内容变更回调
  placeholder="输入内容..."           // 占位符文本
/>
```

## 常见问题

### Q: 如何插入图片？
A: 使用 Markdown 语法：`![描述](图片URL)` 或使用工具栏中的图片按钮

### Q: 支持表格吗？
A: 完全支持！使用标准 Markdown 表格语法或工具栏快速插入

### Q: 能导出为 HTML 吗？
A: 现阶段导出为 Markdown 格式。可在前端使用库如 `markdown-html` 转换

### Q: 分屏模式的高度可以调整吗？
A: 在 `MarkdownEditor.css` 中修改 `max-height: 400px` 的值

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 性能优化

- 编辑器使用虚拟滚动，支持大型文档
- 预览采用增量渲染
- 防抖处理，避免频繁更新

## 下一步改进

- [ ] 支持图片上传到服务器
- [ ] 添加更多主题
- [ ] 支持自定义快捷键
- [ ] 添加字数统计
- [ ] 支持导出为 PDF
- [ ] 剪贴板图片直接粘贴

## 技术栈

- React 19.2.4
- @uiw/react-md-editor 4.1.11
- @uiw/react-markdown-preview 3.3.2
- react-markdown 10.1.0

## 支持

遇到问题？请检查：
1. 依赖是否正确安装：`npm list`
2. 浏览器控制台是否有错误信息
3. 服务器是否正常运行（数据库模式）
