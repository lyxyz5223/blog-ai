# 快速启动 - 认证功能测试

## 安装依赖

### 前端依赖（如已安装可跳过）
```bash
yarn install
```

### 后端依赖（必须）
```bash
cd server
yarn install
cd ..
```

## 启动应用

### 方式1：使用两个终端（推荐）

**终端1 - 启动Vite开发服务器**
```bash
yarn run dev
```
访问: http://localhost:5173

**终端2 - 启动Express后端服务器**
```bash
yarn run server
```
访问: http://localhost:5000

### 方式2：使用单个终端
先启动后端，等待就绪，然后在新终端启动前端
```bash
# 终端1
yarn run server

# 终端2（等待后端启动完成）
yarn run dev
```

## 测试步骤

### 1. 访问管理页面
1. 打开 http://localhost:5173
2. 点击导航栏中的 "📝 管理" 按钮
3. 应该跳转到登录页面

### 2. 使用默认账号登录
- **用户名**: `admin`
- **密码**: `admin123`
- 点击 "登录" 按钮

### 3. 成功登录后
- 应该进入 Admin 管理页面
- 导航栏应该显示 "🚪 登出" 按钮
- 可以正常创建、编辑、删除文章

### 4. 测试登出
- 点击导航栏中的 "🚪 登出" 按钮
- 应该重定向到首页
- 尝试再次访问管理页面，应该需要重新登录

### 5. 测试错误案例
- 尝试用错误的密码登录
- 应该显示错误提示："用户名或密码错误"

## 完整工作流示例

```
1. http://localhost:5173
   ↓
2. 点击 "📝 管理" → 自动跳转到登录页面
   ↓
3. 输入 admin/admin123 登录
   ↓
4. 进入 Admin 页面，可以管理文章
   ↓
5. 创建/编辑/删除文章（需要运行后端服务）
   ↓
6. 点击 "🚪 登出" 返回首页
   ↓
7. 完成！
```

## 常见问题

### 登录时显示"登录请求失败"
- 检查后端服务是否正在运行: `http://localhost:5000/api/health`
- 检查CORS是否正确配置

### Token过期错误
- 这是正常的，用户需要重新登录
- 默认Token有效期为7天

### 文章操作提示"认证已过期"
- Token可能已过期，需要重新登录
- 点击"🚪 登出"然后重新登录

### 看不到"🚪 登出"按钮
- 确认已成功登录
- 检查浏览器localStorage中是否有`adminToken`

## 浏览器开发者工具调试

### 查看Token
1. 打开浏览器开发工具 (F12)
2. 进入 "Application" 或 "Storage" 标签
3. 查看 "Local Storage"
4. 找到当前网站，查看 `adminToken` 值

### 查看API请求
1. 打开浏览器开发工具 (F12)
2. 进入 "Network" 标签
3. 执行登录操作
4. 查看 `/api/auth/login` 请求的请求头和响应

### 查看请求头中的Token
1. 执行创建/编辑/删除文章操作
2. 在 Network 中查看 POST/PUT/DELETE 请求
3. 在 "Request Headers" 中查看 `Authorization: Bearer...`

## 后端日志

启动后端时，应该看到类似输出：
```
Database initialized
Blog API Server running on http://localhost:5000
Database: blog_db
Table: blogs
```

登录时应该看到：
```
[认证成功]
```

文章操作时应该看到相应的数据库操作日志。

## 性能和安全 TIP

### 开发环境
- 使用注册表中的默认凭证是安全的
- Token有效期设为7天便于测试

### 生产环境部署前清单
- [ ] 修改 `server/auth.js` 中的默认凭证
- [ ] 修改 `JWT_SECRET` 为强随机字符串
- [ ] 检查 CORS 配置是否限制到特定域名
- [ ] 启用 HTTPS
- [ ] 考虑添加登录尝试限制
- [ ] 定期更换 JWT_SECRET

## 下一步

如需进一步定制，参考：
- `AUTH_GUIDE.md` - 完整的认证功能文档
- `server/auth.js` - 后端认证逻辑
- `src/pages/Login.jsx` - 前端登录组件
- `src/App.jsx` - 前端应用主文件
