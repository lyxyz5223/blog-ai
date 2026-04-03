# 博客双存储系统配置指南

## 功能概述

本博客系统支持两种存储模式：
1. **本地存储模式** - 使用静态 `blogsData.js` 文件
2. **PostgreSQL 数据库模式** - 使用后端 API 连接数据库

## 配置文件说明

### 1. 全局配置文件 (`config.json`)

位置：项目根目录 `config.json`

```json
{
  "useLocalStorage": true,
  "database": {
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "your_password",
    "database": "blog_db",
    "table": "blogs"
  },
  "apiEndpoint": "http://localhost:5000/api"
}
```

**参数说明：**

- `useLocalStorage` (boolean): 
  - `true` - 使用本地存储模式
  - `false` - 使用 PostgreSQL 数据库模式

- `database` (object): PostgreSQL 连接配置
  - `host`: 数据库主机地址
  - `port`: 数据库端口（默认 5432）
  - `username`: 数据库用户名
  - `password`: 数据库密码
  - `database`: 数据库名称
  - `table`: 存储博客的表名

- `apiEndpoint`: 后端 API 服务器地址

## 使用模式

### 模式 1：本地存储模式（默认）

**特点：**
- 无需数据库
- 数据存储在 `src/data/blogsData.js` 中
- 编辑后需要导出文件手动更新

**配置步骤：**

1. 确保 `config.json` 中的 `useLocalStorage` 为 `true`
2. 在 Admin 页面管理博客
3. 编辑完成后点击"导出数据"将更新保存到 `blogsData.js`

**优点：**
- ✅ 简单快速，不需要数据库
- ✅ 适合个人博客或小型项目
- ✅ 完全静态，可部署到任何静态主机

### 模式 2：PostgreSQL 数据库模式

**特点：**
- 使用 PostgreSQL 作为数据源
- 编辑立即保存到数据库
- 支持远程数据库连接

**配置步骤：**

#### 1. 安装 PostgreSQL

- **Windows**: 下载安装 [PostgreSQL](https://www.postgresql.org/download/windows/)
- **macOS**: 使用 Homebrew: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

#### 2. 创建数据库和用户

```sql
-- 使用 psql 连接到 PostgreSQL
psql -U postgres

-- 创建数据库
CREATE DATABASE blog_db;

-- 创建用户（可选，如果想用特定用户）
CREATE USER blog_user WITH PASSWORD 'secure_password';

-- 授予权限
GRANT ALL PRIVILEGES ON DATABASE blog_db TO blog_user;

-- 退出
\q
```

#### 3. 配置 `config.json`

```json
{
  "useLocalStorage": false,
  "database": {
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "your_password",
    "database": "blog_db",
    "table": "blogs"
  },
  "apiEndpoint": "http://localhost:5000/api"
}
```

#### 4. 启动后端服务

```bash
# 进入 server 目录
cd server

# 安装依赖
npm install

# 启动服务（开发模式）
npm run dev

# 或生产模式
npm start
```

服务器将在 `http://localhost:5000` 启动，并自动创建 `blogs` 表。

#### 5. 在 Admin 页面切换模式

- 打开 Admin 页面
- 点击右上角的 "🗄️ 数据库模式" 切换按钮
- 系统会从数据库加载博客数据

**优点：**
- ✅ 实时保存，无需手动导出
- ✅ 支持多用户并发编辑（需添加认证）
- ✅ 可扩展和稳定

## 前端使用方式

### 数据加载流程

所有前端页面通过 `src/data/dataService.js` 加载数据：

```javascript
import { getBlogsData } from '../data/dataService'

// 获取所有博客数据（自动根据配置选择本地或API）
const blogs = await getBlogsData()
```

### Admin 页面

**功能：**
- 📝 创建、编辑、删除博客
- 💾 导出为 `blogsData.js` (本地模式)
- 🗄️ 切换存储模式
- 📊 实时查看当前模式

**存储模式按钮：**
- 📁 本地存储模式 - 编辑后需导出
- 🗄️ 数据库模式 - 编辑立即保存

## 数据库表结构

自动创建的 `blogs` 表结构：

```sql
CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  date DATE NOT NULL,
  category VARCHAR(100),
  author VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## API 端点

当使用数据库模式时，后端提供以下 API：

- `GET /api/blogs` - 获取所有博客
- `GET /api/blogs/:id` - 获取单个博客
- `POST /api/blogs` - 创建博客
- `PUT /api/blogs/:id` - 更新博客
- `DELETE /api/blogs/:id` - 删除博客
- `GET /api/health` - 健康检查

## 故障排除

### 问题：数据库连接失败

**解决方案：**
1. 检查 PostgreSQL 是否运行：`psql -U postgres`
2. 检查 `config.json` 中的连接信息
3. 确保数据库用户拥有权限

### 问题：后端服务启动失败

**解决方案：**
1. 检查是否安装依赖：`npm install` in server 目录
2. 检查端口 5000 是否被占用
3. 查看错误日志确定问题

### 问题：Admin 页面无法切换模式

**解决方案：**
1. 清除浏览器缓存
2. 检查 `config.json` 是否有效
3. 检查浏览器控制台错误信息

## 最佳实践

1. **本地模式**：用于开发测试或小型个人博客
2. **数据库模式**：用于生产环境或需要频繁更新内容
3. **数据备份**：定期导出数据避免丢失
4. **密码安全**：生产环境不要在 `config.json` 中存储明文密码
5. **认证**：生产环境建议添加用户认证

## 后续增强建议

- [ ] 添加用户认证系统
- [ ] 实现数据库加密
- [ ] 添加博客评论系统
- [ ] 实现全文搜索
- [ ] 添加版本控制历史
- [ ] 实现 CDN 集成
