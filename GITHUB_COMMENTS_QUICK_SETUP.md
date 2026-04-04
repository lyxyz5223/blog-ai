# GitHub 评论功能 - 快速设置 (5分钟)

## ⚡ 快速开始

### 前置条件
- GitHub 账户（公开仓库）
- 已启用 Discussions 功能

### 配置步骤

#### 1️⃣ 启用 GitHub Discussions (仅需一次)
```
GitHub 仓库 → Settings → General → ✓ Discussions (启用)
```

#### 2️⃣ 创建 "Comments" 分类 (仅需一次)
```
仓库主页 → Discussions → New category → "Comments"
```

#### 3️⃣ 获取 Giscus 配置
打开 https://giscus.app，填入你的仓库信息，获取：
- `data-repo-id` (仓库 ID)
- `data-category-id` (分类 ID)

#### 4️⃣ 更新 `.env` 文件
```env
VITE_GITHUB_REPO=你的用户名/仓库名
VITE_GITHUB_REPO_ID=R_kgDO...（从Giscus获取）
VITE_GITHUB_DISCUSSION_CATEGORY=Comments
VITE_GITHUB_DISCUSSION_CATEGORY_ID=DIC_kwDO...（从Giscus获取）
```

#### 5️⃣ 重启开发服务器
```bash
npm run dev
```

## ✅ 完成！
打开任何博客文章，向下滚动即可看到评论板块 💬

## 🔧 配置示例

**完整的 `.env` 示例:**
```env
VITE_GITHUB_REPO=lyxyz5223/blog-ai
VITE_GITHUB_REPO_ID=R_kgDOR5BfjA
VITE_GITHUB_DISCUSSION_CATEGORY=Comments
VITE_GITHUB_DISCUSSION_CATEGORY_ID=DIC_kwDOR5BfjM4C6Btj
VITE_GITHUB_MAPPING=pathname
VITE_GITHUB_INPUT_POSITION=top
VITE_GITHUB_THEME=preferred_color_scheme
```

## 🎨 支持的功能

| 功能 | 状态 |
|------|------|
| GitHub 登录 | ✅ |
| 留下评论 | ✅ |
| 表情反应 | ✅ |
| 深色/亮色主题 | ✅ |
| 中文界面 | ✅ |
| 按博客分类 | ✅ |

## 📱 访问者体验

1. 打开博客 → 滚到底部 → 看到评论区
2. 点击 "Sign in with GitHub" 登录
3. 输入评论内容（支持 Markdown）
4. 点击评论按钮或 Ctrl+Enter 提交
5. 对评论添加表情反应 👍 ❤️

## 🚀 完整配置指南
详见 [GITHUB_COMMENTS_GUIDE.md](./GITHUB_COMMENTS_GUIDE.md)

## ❓ 需要帮助？
- 检查浏览器控制台错误 (F12)
- 确保仓库是公开的
- 确认 Discussions 已启用
- 访问 https://giscus.app 验证配置

---
**Happy commenting!** 🎉
