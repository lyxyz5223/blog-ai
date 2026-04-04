# GitHub 评论功能配置指南

## 概述
本项目使用 **Giscus** 来实现基于 GitHub Discussions 的评论系统。访问者可以通过 GitHub 账号进行身份验证并留下评论，所有评论都会保存在你的 GitHub 仓库的 Discussions 中。

## 功能特点
- ✅ **基于 GitHub 认证** - 使用 GitHub 账户登录评论
- ✅ **Discussion 存储** - 评论存储在 GitHub Discussions 中
- ✅ **实时同步** - 评论实时显示
- ✅ **主题自适应** - 支持亮色/深色主题切换
- ✅ **多语言支持** - 默认中文界面
- ✅ **评论反应** - 支持表情反应（👍 ❤️ 😄 等）
- ✅ **按博客分类** - 每篇博客独立的评论线程

## 配置步骤

### 步骤 1: 启用 GitHub Discussions

1. 打开你的 GitHub 仓库设置
   - 进入 `Settings` → `General`
   - 向下滚动到 `Features` 部分

2. 启用 Discussions
   - 勾选 `Discussions` 选项
   - 点击 `Save`

3. 创建评论分类
   - 点击仓库主页的 `Discussions` 选项卡
   - 点击 `New category`
   - 创建分类 "Comments" (评论)
   - 选择分类类型为 "General"

### 步骤 2: 获取 Giscus 配置

1. 访问 [Giscus 官网](https://giscus.app)

2. 在配置表单中填入：
   - **Repository**: 选择你的仓库（必须是公开仓库）
   - **Discussions Category**: 选择 "Comments"

3. 获取配置信息
   - 向下滚动找到生成的代码
   - 找到以下属性：
     ```html
     data-repo="你的用户名/仓库名"
     data-repo-id="R_kgDO..."
     data-category-id="DIC_kwDO..."
     ```

### 步骤 3: 更新环境变量

编辑项目根目录的 `.env` 文件，更新以下变量：

```bash
# GitHub 评论配置 (Giscus)
# 仓库名称 (格式: 用户名/仓库名)
VITE_GITHUB_REPO=你的用户名/仓库名

# 仓库 ID (从 Giscus 配置生成)
VITE_GITHUB_REPO_ID=R_kgDO...

# Discussion 分类名称
VITE_GITHUB_DISCUSSION_CATEGORY=Comments

# Discussion 分类 ID (从 Giscus 配置生成)
VITE_GITHUB_DISCUSSION_CATEGORY_ID=DIC_kwDO...
```

### 步骤 4: 重启开发服务器

```bash
# 停止当前服务器 (Ctrl+C)
# 重新启动
npm run dev
```

或在 package.json 中添加启动脚本：
```bash
yarn dev
```

## 使用说明

### 访问者如何评论

1. **打开任何博客文章**
   - 向下滚动到评论部分
   - 看到 GitHub 评论框

2. **使用 GitHub 登录**
   - 点击 "Sign in with GitHub"
   - 在 GitHub 授权页面授权
   - 完成身份验证

3. **留下评论**
   - 在文本框中输入你的评论
   - 支持 Markdown 格式
   - 点击 "Comment" 或按 Ctrl+Enter 提交

4. **添加反应**
   - 点击评论下方的表情图标
   - 选择你想要的反应

### 管理评论

作为仓库所有者，你可以在 GitHub 上管理所有评论：

1. **查看所有评论**
   - 进入你的仓库
   - 点击 `Discussions` 选项卡
   - 点击 `Comments` 分类

2. **编辑或删除评论**
   - 点击评论右上方的三点菜单
   - 选择编辑或删除

3. **锁定评论**
   - 防止进一步的回复

## 环境配置参考

### 配置文件位置
- **前端配置**: `.env`
- **生产环境**: 需要在部署平台（如 Vercel、GitHub Pages）设置环境变量

### 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `VITE_GITHUB_REPO` | 仓库名 (用户名/仓库名) | `lyxyz5223/blog-ai` |
| `VITE_GITHUB_REPO_ID` | Giscus 仓库 ID | `R_kgDOR5BfjA` |
| `VITE_GITHUB_DISCUSSION_CATEGORY` | Discussion 分类名称 | `Comments` |
| `VITE_GITHUB_DISCUSSION_CATEGORY_ID` | Discussion 分类 ID | `DIC_kwDOR5BfjM4C6Btj` |
| `VITE_GITHUB_MAPPING` | 评论映射方式 | `pathname` (或 `url`, `title`, `specific`) |
| `VITE_GITHUB_INPUT_POSITION` | 评论输入框位置 | `top` (或 `bottom`) |
| `VITE_GITHUB_THEME` | 评论主题设置 | `preferred_color_scheme` (或 `light`, `dark`) |

#### 映射方式说明
- **`pathname`** (推荐) - 根据页面路径名来映射评论
- **`url`** - 根据完整 URL 来映射
- **`title`** - 根据页面标题来映射
- **`specific`** - 基于指定的 data-term 值，每篇博客独立

#### 主题说明
- **`preferred_color_scheme`** (推荐) - 自动根据系统/网站主题切换
- **`light`** - 始终使用亮色模式
- **`dark`** - 始终使用深色模式

## 代码集成说明

### GitHubComments 组件

位置: `src/components/GitHubComments.jsx`

**使用方式:**
```jsx
import GitHubComments from '../components/GitHubComments'

<GitHubComments 
  blogId={blog.id}           // 博客 ID，用于创建唯一的评论线程
  blogTitle={blog.title}     // 博客标题，显示在 Discussion 中
  theme={theme}              // 当前主题 ('light' 或 'dark')
/>
```

**参数说明:**
- `blogId` (必需): 唯一标识符，用于特定映射方式时创建唯一的评论线程
- `blogTitle` (可选): 博客标题，用于显示或追踪
- `theme` (可选): 评论区主题，当 VITE_GITHUB_THEME 不为 preferred_color_scheme 时使用

#### 配置对参数的影响
- 如果 `VITE_GITHUB_MAPPING=pathname`，则自动根据页面路径隔离评论，`blogId` 不起作用
- 如果 `VITE_GITHUB_MAPPING=specific`，则使用 `blogId` 创建独立的评论线程

### BlogDetail 页面集成

位置: `src/pages/BlogDetail.jsx`

评论组件已集成在博客详情页面，位置在文章内容下方、文章导航上方。

## 常见问题

### Q: 为什么看不到评论框？
**A:** 
- 检查环境变量是否正确配置
- 确保 GitHub 仓库是公开的
- 检查浏览器控制台是否有错误信息
- 确保已启用 Discussions

### Q: 如何自定义评论区样式？
**A:** 编辑 `src/pages/BlogDetail.css` 中的 `.github-comments-wrapper` 和 `.giscus-container` 样式

### Q: 如何改变评论语言？
**A:** 在 `GitHubComments.jsx` 中修改 `data-lang` 属性：
```javascript
'data-lang': 'en',  // 英文
'data-lang': 'zh-CN', // 中文简体
'data-lang': 'zh-TW', // 中文繁体
```

### Q: 每篇博客都有独立的评论吗？
**A:** 取决于 `VITE_GITHUB_MAPPING` 设置：
- 如果使用 `pathname`（推荐）：每个不同的页面路径有独立的评论
- 如果使用 `specific`：通过 `blogId` 参数明确创建独立的评论线程
- 如果使用 `url` 或 `title`：也会相应地创建独立的评论

### Q: 如何改变评论映射方式？
**A:** 编辑 `.env` 文件中的 `VITE_GITHUB_MAPPING` 参数：
```bash
# pathname - 根据 URL 路径名 (推荐，最稳定)
VITE_GITHUB_MAPPING=pathname

# url - 根据完整 URL (包括域名)
VITE_GITHUB_MAPPING=url

# title - 根据页面标题
VITE_GITHUB_MAPPING=title

# specific - 使用 blogId 参数 (需要组件配置)
VITE_GITHUB_MAPPING=specific
```

### Q: 如何改变评论输入框位置？
**A:** 编辑 `.env` 文件中的 `VITE_GITHUB_INPUT_POSITION` 参数：
```bash
VITE_GITHUB_INPUT_POSITION=top    # 在评论列表上方
VITE_GITHUB_INPUT_POSITION=bottom # 在评论列表下方
```

### Q: 如何改变评论主题设置？
**A:** 编辑 `.env` 文件中的 `VITE_GITHUB_THEME` 参数：
```bash
# 自动根据系统/网站主题 (推荐)
VITE_GITHUB_THEME=preferred_color_scheme

# 始终亮色
VITE_GITHUB_THEME=light

# 始终深色
VITE_GITHUB_THEME=dark
```
**A:** 在 `BlogDetail.jsx` 中，条件性地渲染 `GitHubComments` 组件：
```jsx
{/* 只在特定博客显示评论 */}
{blog.enableComments !== false && (
  <GitHubComments blogId={blog.id} blogTitle={blog.title} theme={theme} />
)}
```

### Q: 如何自定义评论区样式？
**A:** 编辑 `src/pages/BlogDetail.css` 中的以下类：
- `.github-comments-wrapper` - 评论区外层容器
- `.giscus-container` - Giscus 框架容器
- `.blog-comments-section` - 评论部分容器
- `.comments-title` - 评论标题

### Q: 如何改变评论语言？
**A:** 编辑 `GitHubComments.jsx` 中的 `data-lang` 属性：
```javascript
'data-lang': 'en',    // 英文
'data-lang': 'zh-CN', // 中文简体
'data-lang': 'zh-TW', // 中文繁体
'data-lang': 'ja',    // 日文
```

## 安全性考虑

- ✅ 所有认证由 GitHub 官方处理
- ✅ Giscus 是开源项目（https://github.com/giscus/giscus）
- ✅ 不需要存储敏感信息
- ✅ 评论内容存储在你的 GitHub 仓库中

## 深色模式支持

评论区会自动检测网站当前主题并相应调整样式。当用户切换主题时，评论区会实时更新。

## 部署到生产环境

### GitHub Pages

如果部署到 GitHub Pages，需要：

1. 在仓库 Settings 中设置环境变量
2. 或在 GitHub Actions 工作流中设置：

```yaml
env:
  VITE_GITHUB_REPO: ${{ github.repository }}
  VITE_GITHUB_REPO_ID: R_kgDO...
  VITE_GITHUB_DISCUSSION_CATEGORY: Comments
  VITE_GITHUB_DISCUSSION_CATEGORY_ID: DIC_kwDO...
```

### 其他部署平台 (Vercel, Netlify 等)

在部署平台的环境变量配置中添加这些变量。

## 参考资源

- [Giscus 官方网站](https://giscus.app)
- [Giscus GitHub 仓库](https://github.com/giscus/giscus)
- [GitHub Discussions 文档](https://docs.github.com/en/discussions)
- [本项目源代码](https://github.com/lyxyz5223/blog)

## 故障排除

### 评论框显示 "Sign in with GitHub" 但无法登录

- 清除浏览器缓存和 cookies
- 检查 GitHub 账户是否有任何限制
- 尝试在隐身模式下访问

### 看到错误信息

打开浏览器开发者工具 (F12)，查看 Console 标签中的错误信息，这会帮助诊断问题。

### 主题切换时评论不更新

刷新页面或等待 1-2 秒，主题会自动同步。

---

**需要帮助?** 如有问题，请在项目 GitHub Issues 中提报。
