# 前端配置管理指南

## 概述

前端的 `config.json` 文件用于配置应用的运行模式和 API 端点。

## 配置文件位置

```
blog/
├── config.json          # 前端配置文件
└── src/
    └── config/
        └── config.js    # 配置加载模块
```

## config.json 说明

### 文件内容

```json
{
  "useLocalStorage": false,
  "apiEndpoint": "http://localhost:5000/api"
}
```

### 配置参数

| 参数 | 类型 | 说明 | 默认值 | 例子 |
|-----|------|------|--------|------|
| `useLocalStorage` | boolean | 是否使用本地存储模式而非数据库 | false | true \| false |
| `apiEndpoint` | string | 后端 API 服务器地址 | http://localhost:5000/api | http://api.example.com/api |

## 运行模式详解

### 模式1：本地存储模式（开发测试）

```json
{
  "useLocalStorage": true,
  "apiEndpoint": "http://localhost:5000/api"
}
```

**特点：**
- 不需要后端服务器
- 数据保存在浏览器 localStorage
- 刷新页面数据保持（同一浏览器）
- **不支持管理员登录和数据库操作**
- 仅用于前端展示开发

### 模式2：API/数据库模式（推荐）

```json
{
  "useLocalStorage": false,
  "apiEndpoint": "http://localhost:5000/api"
}
```

**特点：**
- 需要后端 Express 服务器运行
- 需要 PostgreSQL 数据库连接
- 支持管理员登录认证
- 支持创建、编辑、删除文章
- **生产环境应使用此模式**

## 开发环境配置

### 启动前端 + 后端

```json
{
  "useLocalStorage": false,
  "apiEndpoint": "http://localhost:5000/api"
}
```

**启动步骤：**
```bash
# 终端1 - 启动后端
cd server
yarn install  # 首次需要
yarn run dev

# 终端2 - 启动前端
yarn install  # 首次需要
yarn run dev
```

## 生产环境配置

### 修改配置指向生产服务器

```json
{
  "useLocalStorage": false,
  "apiEndpoint": "https://api.yourdomain.com/api"
}
```

## 配置加载流程

### 前端配置加载 (src/config/config.js)

```javascript
// 1. 加载 config.json
const response = await fetch('config.json')
const config = await response.json()

// 2. 返回配置对象
{
  useLocalStorage: config.useLocalStorage,
  apiEndpoint: config.apiEndpoint
}
```

### 使用配置

```javascript
import { loadConfig, isUsingLocalStorage, getApiEndpoint } from './config/config'

// 在组件中使用
const config = await loadConfig()
const useLocal = config.useLocalStorage
const api = config.apiEndpoint
```

## 常见场景

### 场景1：本地开发（仅前端）

```json
{
  "useLocalStorage": true,
  "apiEndpoint": "http://localhost:5000/api"
}
```

- 不启动后端
- 不连接数据库
- 仅用于 UI 开发

### 场景2：本地开发（前端+后端）

```json
{
  "useLocalStorage": false,
  "apiEndpoint": "http://localhost:5000/api"
```

- 启动本地后端服务
- 连接本地 PostgreSQL
- 可测试完整功能

### 场景3：生产环境

```json
{
  "useLocalStorage": false,
  "apiEndpoint": "https://api.yourdomain.com/api"
}
```

- 部署到生产服务器
- 指向生产 API 服务器
- 提供完整功能

## 数据持久化对比

| 功能 | 本地存储 | 数据库模式 |
|-----|---------|----------|
| 前端展示 | ✅ | ✅ |
| 博客查看 | ✅ | ✅ |
| 管理员登录 | ❌ | ✅ |
| 创建文章 | ❌ | ✅ |
| 编辑文章 | ❌ | ✅ |
| 删除文章 | ❌ | ✅ |
| 数据备份 | ❌ | ✅ |
| 多用户访问 | ❌ | ✅ |
| 多设备同步 | ❌ | ✅ |

## 故障排除

### 问题：设置 useLocalStorage=false 但无法登录

**检查列表：**
1. 确认后端服务是否运行 (`http://localhost:5000/api/health`)
2. 检查 apiEndpoint 是否正确
3. 查看浏览器开发者工具 Network 标签中的 API 请求
4. 检查后端日志

### 问题：修改 config.json 后没有生效

**解决：**
1. 清除浏览器缓存
2. 关闭开发服务器，重新启动 (`yarn run dev`)
3. 执行硬刷新 (Ctrl+Shift+R)

### 问题：无法连接到后端

**排查步骤：**
```bash
# 1. 检查后端是否运行
curl http://localhost:5000/api/health

# 2. 检查CORS是否配置正确
# 3. 检查防火墙设置
# 4. 检查网络连接
```

## 部署检查清单

### 生产环境前

- [ ] apiEndpoint 已更改为生产地址
- [ ] useLocalStorage 设为 false
- [ ] 后端服务已正确部署
- [ ] PostgreSQL 数据库已配置
- [ ] CORS 配置允许生产域名
- [ ] 管理员凭证已修改

### 打包部署

```bash
# 1. 构建前端
yarn run build

# 2. 验证 config.json 已正确设置
cat config.json

# 3. 上传到服务器
# 将 dist/ 文件夹部署到 web 服务器
```

## 相关文件

- [config.json](/../config.json) - 前端配置文件
- [src/config/config.js](../src/config/config.js) - 配置加载模块
- [server/CONFIG_GUIDE.md](./CONFIG_GUIDE.md) - 后端配置指南
- [server/.env](./server/.env) - 后端环境变量（敏感信息）
