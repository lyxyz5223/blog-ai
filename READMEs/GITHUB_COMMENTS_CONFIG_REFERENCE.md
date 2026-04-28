# 你的 GitHub 评论配置参考

## ✅ 当前配置

### 基本信息
```
仓库: lyxyz5223/blog-ai
仓库 ID: R_kgDOR5BfjA
分类: Comments
分类 ID: DIC_kwDOR5BfjM4C6Btj
```

### 评论设置
```
评论映射: pathname (根据页面路径)
输入框位置: top (在评论列表上方)
评论主题: preferred_color_scheme (自动适应)
```

## 📋 当前 .env 配置

```env
VITE_GITHUB_REPO=lyxyz5223/blog-ai
VITE_GITHUB_REPO_ID=R_kgDOR5BfjA
VITE_GITHUB_DISCUSSION_CATEGORY=Comments
VITE_GITHUB_DISCUSSION_CATEGORY_ID=DIC_kwDOR5BfjM4C6Btj
VITE_GITHUB_MAPPING=pathname
VITE_GITHUB_INPUT_POSITION=top
VITE_GITHUB_THEME=preferred_color_scheme
```

## 🎯 配置说明

### VITE_GITHUB_MAPPING: pathname
- **含义**: 根据页面的 URL 路径名来隔离评论
- **优点**: 稳定、可预测、最推荐
- **行为**: `/blog/1` 和 `/blog/2` 会有不同的评论
- **修改方式**: 编辑 `.env` 改为 `url` | `title` | `specific`

### VITE_GITHUB_INPUT_POSITION: top
- **含义**: 评论输入框显示在评论列表上方
- **优点**: 用户直接看到评论表单
- **可选值**: `top` (上方) | `bottom` (下方)

### VITE_GITHUB_THEME: preferred_color_scheme
- **含义**: 自动根据用户系统或网站主题
- **优点**: 用户体验最好，无需额外配置
- **可选值**: 
  - `preferred_color_scheme` - 自动适应 ⭐
  - `light` - 始终亮色
  - `dark` - 始终深色

## 🧪 测试配置

### 快速测试步骤
1. ✅ 重启开发服务器 `npm run dev`
2. ✅ 打开任何博客文章
3. ✅ 向下滚动到评论部分
4. ✅ 看到 "Sign in with GitHub" 按钮？成功！

### 验证清单
- [ ] .env 文件配置正确
- [ ] 博客 ID 和标题能正常显示
- [ ] 评论框显示在文章下方
- [ ] 点击可以登录 GitHub
- [ ] 深色/亮色主题切换有效

## 🔄 如何修改配置

### 改变评论映射方式
目前: `pathname` (个页面路径)

改为 `url` (完整 URL):
```env
VITE_GITHUB_MAPPING=url
```

改为 `specific` (基于博客 ID):
```env
VITE_GITHUB_MAPPING=specific
```

### 改变输入框位置
目前: `top` (上方)

改为 `bottom` (下方):
```env
VITE_GITHUB_INPUT_POSITION=bottom
```

### 改变主题设置
目前: `preferred_color_scheme` (自动)

改为固定亮色:
```env
VITE_GITHUB_THEME=light
```

改为固定深色:
```env
VITE_GITHUB_THEME=dark
```

## 📝 记住这些命令

```bash
# 开发环境
npm run dev

# 构建生产版
npm run build

# 查看生产预览
npm run preview
```

## 📚 文档导航

- **快速设置** → 阅读 [GITHUB_COMMENTS_QUICK_SETUP.md](./GITHUB_COMMENTS_QUICK_SETUP.md)
- **完整指南** → 阅读 [GITHUB_COMMENTS_GUIDE.md](./GITHUB_COMMENTS_GUIDE.md)
- **技术细节** → 阅读 [GITHUB_COMMENTS_IMPLEMENTATION.md](./GITHUB_COMMENTS_IMPLEMENTATION.md)

## 🆘 出现问题？

### 看不到评论框
1. 检查 `.env` 配置（仓库 ID 和分类 ID）
2. 确保仓库 `lyxyz5223/blog-ai` 是公开的
3. 确保已启用 Discussions 功能
4. 打开浏览器开发工具 (F12) 查看错误

### GitHub 登录不了
1. 清除浏览器缓存
2. 尝试隐身模式
3. 检查 GitHub 账户是否有限制

### 主题不自动切换
1. 用户使用固定主题时刷新页面
2. 检查浏览器中文主题检测是否开启

## 🎉 你都准备好了！

配置现在已经完成并且已验证。只需重启开发服务器，然后：

```bash
npm run dev
```

访问任何博客文章，向下滚动就能看到评论功能！

---

**最后更新**: 2026-04-04
**配置状态**: ✅ 已验证
