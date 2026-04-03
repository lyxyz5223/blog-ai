# 博客管理系统 - 认证功能说明

## 概述

为后台管理系统添加了完整的登录认证功能，只有管理员用户能够登录和管理文章。

## 功能特性

### 1. **用户认证**
- ✅ JWT Token 认证
- ✅ 用户名密码登录
- ✅ Token 自动过期管理（7天）
- ✅ Token 存储在 localStorage

### 2. **访问控制**
- ✅ 受保护的 Admin 路由
- ✅ 未认证用户自动跳转到登录页面
- ✅ Token 过期时自动清除

### 3. **用户体验**
- ✅ 美观的登录页面
- ✅ 登出按钮在导航栏显示
- ✅ 深色/浅色主题兼容
- ✅ 完整的错误提示

## 默认管理员账号

```
用户名: admin
密码: admin123
```

⚠️ **生产环境提示**：请更改默认密码和JWT密钥！

## 技术实现

### 后端改动

**新增文件：**
- `server/auth.js` - 认证逻辑模块
  - `login()` - 处理登录请求
  - `verifyToken()` - 验证 Token 中间件
  - `verifyAdmin()` - 验证管理员权限中间件
  - `validateToken()` - 验证 Token 有效性

**修改文件：**
- `server/index.js` - 添加认证路由
  - `POST /api/auth/login` - 登录接口
  - `POST /api/auth/validate` - 验证 Token 接口
  - 为博客 API 添加认证中间件保护

- `server/package.json` - 添加 `jsonwebtoken` 依赖

### 前端改动

**新增文件：**
- `src/pages/Login.jsx` - 登录页面组件
- `src/pages/Login.css` - 登录页面样式
- `src/components/ProtectedRoute.jsx` - 受保护路由组件

**修改文件：**
- `src/App.jsx` - 添加认证状态管理
  - 初始化认证状态
  - 受保护路由包装 Admin 页面
  - 登出功能

- `src/components/Header.jsx` - 添加登出按钮
  - 已认证用户显示登出按钮
  - 深色主题兼容

- `src/components/Header.css` - 添加登出按钮样式

- `src/data/dataService.js` - 添加 Token 认证
  - `getAuthToken()` - 获取 Token
  - `getAuthHeaders()` - 构建认证请求头
  - 为所有修改操作（POST/PUT/DELETE）添加 Token

## 工作流程

### 1. 用户尝试访问管理页面
```
用户点击"管理" → 检查 isAuthenticated 状态
  ↓
如果未认证 → 显示登录页面
如果已认证 → 显示 Admin 页面
```

### 2. 用户登录
```
输入用户名和密码 → 发送 POST /api/auth/login 请求
  ↓
服务器验证凭证 → 生成 JWT Token
  ↓
Token 保存到 localStorage
  ↓
设置认证状态 → 重定向到 Admin 页面
```

### 3. 管理文章操作
```
创建/更新/删除文章 → 获取 Token 从 localStorage
  ↓
在请求头中添加 Authorization: Bearer {token}
  ↓
后端验证 Token 和权限
  ↓
如果有效 → 执行操作
如果过期/无效 → 返回 401 错误，清除本地 Token
```

### 4. 用户登出
```
点击"登出"按钮
  ↓
清除 localStorage 中的 Token
  ↓
清除认证状态
  ↓
重定向到首页
```

## API 端点

### 认证相关

#### 登录
```
POST /api/auth/login
Content-Type: application/json

请求体:
{
  "username": "admin",
  "password": "admin123"
}

响应:
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "admin"
  },
  "message": "登录成功"
}
```

#### 验证 Token
```
POST /api/auth/validate
Authorization: Bearer {token}

响应:
{
  "success": true,
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

### 博客管理（需要认证）

所有修改操作（POST/PUT/DELETE）现在需要有效的 Token：

```
Authorization: Bearer {token}
```

未认证或 Token 过期将返回 401 错误：

```json
{
  "success": false,
  "message": "Token无效或已过期"
}
```

## 部署前准备

### 1. 更改安全配置

编辑 `server/auth.js`：

```javascript
// 改从环境变量读取凭证
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

// 改从环境变量读取密钥
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';
```

### 2. 设置环境变量

在 `.env` 文件中：

```
JWT_SECRET=your-very-secure-random-string-here
ADMIN_USERNAME=your-admin-username
ADMIN_PASSWORD=your-strong-admin-password
```

### 3. 安装依赖

```bash
cd server
yarn install
```

### 4. 重启服务器

```bash
yarn run dev
```

## 故障排除

### 问题：登录失败，显示"用户名或密码错误"
**解决方案**：检查是否使用了正确的默认凭证 (admin/admin123)

### 问题：登录成功但无法创建/更新/删除文章
**解决方案**：
- 检查后端日志是否有 Token 验证错误
- 确保 Token 正确保存在 localStorage
- 检查是否使用了本地存储模式而不是 API 模式

### 问题：Token 过期后无法操作
**解决方案**：这是正常行为，用户需要重新登录

### 问题：跨域错误(CORS)
**解决方案**：检查后端的 CORS 配置是否允许前端域名

## 安全建议

1. **生产环境**：
   - 使用环境变量而非硬编码凭证
   - 更改 JWT_SECRET 为强随机字符串
   - 使用 HTTPS 而非 HTTP
   - 实现登录尝试限制
   - 添加验证码

2. **Token 管理**：
   - 定期更换 JWT_SECRET
   - 考虑使用短期 Token + Refresh Token 模式
   - 在服务器端维护 Token 黑名单（用于主动登出）

3. **密码安全**：
   - 使用密码哈希（bcrypt）
   - 实现密码强度检查
   - 支持密码修改

## 常见问题

**Q: 可以支持多个管理员账号吗？**
A: 可以，修改 `server/auth.js` 中的认证逻辑，改为从数据库查询用户。

**Q: 可以添加"记住我"功能吗？**
A: 可以，在前端 localStorage 中保存更长期限的 Token，或使用 Refresh Token。

**Q: Token 过期时间可以修改吗？**
A: 可以，修改 `server/auth.js` 中的 `JWT_EXPIRES_IN` 值。

## 相关文件

- 后端认证: `server/auth.js`
- 后端主文件: `server/index.js`
- 前端登录组件: `src/pages/Login.jsx`
- 前端受保护路由: `src/components/ProtectedRoute.jsx`
- 前端主应用: `src/App.jsx`
- 数据服务: `src/data/dataService.js`
