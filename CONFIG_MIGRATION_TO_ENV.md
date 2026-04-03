# Config 迁移到 .env - 迁移摘要

## 迁移完成

所有配置已从 `config.json` 迁移到 `.env` 环境变量文件。

## 迁移详情

### 前端迁移 (Frontend)

#### 新增文件
- **`.env.local`** - 前端本地开发环境变量
  ```
  VITE_SERVER_API_ENDPOINT=http://localhost:9876/api
  VITE_USE_LOCAL_STORAGE=false
  ```

- **`.env.example`** - 前端环境变量示例模板

#### 修改文件
- **`vite.config.js`** - 添加 define 配置支持环境变量

- **`src/config/config.js`** - 改为从 `import.meta.env` 读取前端环境变量
  - ✅ 移除 fetch 'config.json' 的逻辑
  - ✅ 使用 Vite 环境变量 `VITE_SERVER_API_ENDPOINT` 和 `VITE_USE_LOCAL_STORAGE`
  - ✅ 保留原有API接口不变

#### 配置变量映射

| 原配置 (config.json) | 新配置 (.env.local) | 说明 |
|---|---|---|
| `apiEndpoint` | `VITE_SERVER_API_ENDPOINT` | API 服务器地址 |
| `useLocalStorage` | `VITE_USE_LOCAL_STORAGE` | 是否使用本地存储（JSON 文件存储） |

### 后端迁移 (Backend)

#### 修改文件

- **`server/.env.example`** - 完善示例，添加认证和 JWT 配置

#### 现有后端环境变量 (已经使用中)

| 变量 | 值 | 说明 |
|---|---|---|
| `PORT` | 9876 | 服务器端口 |
| `DB_HOST` | 127.0.0.1 | 数据库主机 |
| `DB_PORT` | 5432 | 数据库端口 |
| `DB_USERNAME` | bloguser | 数据库用户 |
| `DB_PASSWORD` | lyxyz5223 | 数据库密码 |
| `DB_NAME` | blog_db | 数据库名 |
| `DB_TABLE` | blogs | 数据表名 |
| `ADMIN_USERNAME` | lyxyz5223 | 管理员用户名 |
| `ADMIN_PASSWORD` | lyxyz5223 | 管理员密码 |
| `JWT_SECRET` | dev-secret-key-... | JWT 签名密钥 |
| `JWT_EXPIRES_IN` | 7d | Token 过期时间 |
| `NODE_ENV` | development | 运行环境 |

## 使用说明

### 前端开发

1. **本地启动** - 使用 `.env.local`
   ```bash
   yarn dev
   ```

2. **生产构建** - 创建 `.env.production`
   ```bash
   VITE_SERVER_API_ENDPOINT=https://api.example.com
   VITE_USE_LOCAL_STORAGE=false
   ```

### 后端开发

1. **本地启动** - 使用 `server/.env`
   ```bash
   cd server
   yarn dev
   ```

## 重要说明

### 原 `config.json` 文件
- 不再被前端使用
- 可以删除或保留作为参考
- 避免混淆，建议删除

### 环境变量前缀 (VITE_)
- Vite 要求前端环境变量以 `VITE_` 开头
- 确保访问时使用 `import.meta.env.VITE_*`

### 安全建议

#### 开发环境
- `.env.local` 包含开发凭证
- 建议加入 `.gitignore`（已默认忽略）

#### 生产环境
- 创建 `.env.production` 或 `.env.production.local`
- 使用强密码和安全的 JWT 密钥
- 修改默认的管理员凭证

### 现有代码兼容性
- ✅ 所有现有代码无需修改
- ✅ `loadConfig()` 等函数保持不变
- ✅ API 调用方式保持一致

## 迁移关键步骤

1. ✅ 创建前端 `.env.local`
2. ✅ 创建前端 `.env.example`
3. ✅ 更新 `vite.config.js`
4. ✅ 更新 `src/config/config.js` 读取逻辑
5. ✅ 完善后端 `server/.env` 和 `server/.env.example`

## 测试验证

运行应用验证：
```bash
# 前端
yarn dev

# 后端
cd server && yarn dev
```

确保：
- ✅ 前端能正确感知 API 端点
- ✅ 后端能正确连接数据库
- ✅ 认证功能正常
- ✅ 无断裂变化

---
迁移日期: 2026-04-04
