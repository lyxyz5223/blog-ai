# 配置管理系统迁移总结

## 迁移完成 ✅

已将所有敏感信息和后端配置从代码和 JSON 配置文件迁移到环境变量管理。

## 文件变化

### 后端配置迁移

| 原位置 | 现位置 | 说明 |
|--------|--------|------|
| ❌ `server/index.js` 中硬编码 | ✅ `server/.env` | 数据库配置 |
| ❌ `config.json` (database字段) | ✅ `server/.env` | 数据库凭证 |
| ❌ `server/auth.js` 中硬编码 | ✅ `server/.env` | 管理员凭证 |
| ❌ `server/auth.js` 中硬编码 | ✅ `server/.env` | JWT 密钥 |

### 前端配置简化

| 原字段 | 现状 | 说明 |
|--------|------|------|
| ✅ `useLocalStorage` | 保留 | 前端需要 |
| ✅ `apiEndpoint` | 保留 | 前端需要 |
| ❌ `database` | **已删除** | 已移到后端 .env |

## 文件结构对比

### 迁移前

```
blog/
├── config.json (包含敏感的数据库凭证)
└── server/
    ├── auth.js (硬编码管理员凭证和密钥)
    └── index.js (硬编码数据库配置)
```

### 迁移后

```
blog/
├── config.json (仅前端配置)
├── FRONTEND_CONFIG_GUIDE.md (前端配置说明)
└── server/
    ├── .env (所有敏感信息 - git忽略)
    ├── .env.example (配置模板 - 可提交git)
    ├── .gitignore (包含 .env)
    ├── CONFIG_GUIDE.md (后端配置说明)
    ├── auth.js (从 .env 读取配置)
    └── index.js (从 .env 读取配置)
```

## 环境变量一览

### 认证配置 (.env)

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=dev-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 数据库配置 (.env)

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=bloguser
DB_PASSWORD=lyxyz5223
DB_NAME=blog_db
DB_TABLE=blogs
```

### 服务器配置 (.env)

```env
PORT=5000
NODE_ENV=development
```

## 文件权限和安全

### ✅ 可以提交到 Git

- `config.json` - 前端配置（无敏感信息）
- `.env.example` - 环境变量模板
- `CONFIG_GUIDE.md` - 配置文档
- `FRONTEND_CONFIG_GUIDE.md` - 前端配置文档
- `.gitignore` - 包含 .env 规则

### ⚠️ 禁止提交到 Git

- `.env` - 包含敏感信息！！！

```gitignore
# server/.gitignore
.env
.env.local
.env.*.local
```

## 安全改进

### 代码改进

✅ 移除硬编码敏感信息
- 不再在 auth.js 中硬编码管理员凭证
- 不再在 config.json 中存储数据库密码
- 不再在 index.js 中硬编码配置

✅ 使用环境变量
- 所有配置通过 process.env 读取
- 自动使用默认值作为备选
- 支持灵活的部署配置

### 部署改进

✅ 开发环境
- 本地 .env 文件可随意配置
- 不会影响版本控制

✅ 生产环境
- 通过系统环境变量配置
- 支持容器和云平台部署
- 安全隔离凭证

## 快速启动

### 1. 后端依赖安装

```bash
cd server
yarn install
cd ..
```

### 2. 配置后端环境

环境变量已在 `server/.env` 中配置好，包含本地开发凭证：
- 管理员: `admin` / `admin123`
- 数据库: PostgreSQL on `127.0.0.1:5432`

### 3. 启动服务

```bash
# 终端1 - 后端
yarn run server

# 终端2 - 前端
yarn run dev
```

## 迁移检查清单

开发者迁移清单：

- [x] 后端依赖已更新（dotenv 已在 package.json）
- [x] 环境变量文件已创建 (.env)
- [x] 代码已更新读取环境变量
- [x] 配置文件已简化（config.json）
- [x] 文档已更新

首次运行检查：

- [ ] `yarn install` 已执行
- [ ] `server/.env` 文件存在
- [ ] 数据库凭证正确
- [ ] 后端启动成功
- [ ] 前端可连接后端

## 相关文档

### 后端配置

- [server/CONFIG_GUIDE.md](./server/CONFIG_GUIDE.md) - 后端配置详细指南
- [server/.env](./server/.env) - 本地开发环境变量
- [server/.env.example](./server/.env.example) - 环境变量模板

### 前端配置

- [FRONTEND_CONFIG_GUIDE.md](./FRONTEND_CONFIG_GUIDE.md) - 前端配置指南
- [config.json](./config.json) - 前端配置文件

### 认证信息

- [AUTH_GUIDE.md](./AUTH_GUIDE.md) - 认证功能完整指南
- [server/auth.js](./server/auth.js) - 认证模块实现

## 常见问题

**Q: 为什么要分离配置？**
A: 后端和前端的配置需求不同。后端需要数据库凭证等敏感信息，前端只需要 API 端点。分离后更安全。

**Q: 生产环境如何部署？**
A: 在生产服务器上设置环境变量（通过系统环境变量、Docker、或云平台的凭证管理），或上传 .env 文件（加密存储）。

**Q: 能否提交 .env 到 Git？**
A: 不能！.env 包含敏感信息。应该提交 .env.example 作为模板。

**Q: 如何修改数据库凭证？**
A: 编辑 `server/.env` 文件，修改 DB_* 变量。

**Q: 本地测试用不同的数据库可以吗？**
A: 可以，编辑 .env 文件，改变 DB_HOST、DB_USERNAME 等信息。

## 下一步

- 根据实际需求调整 .env 中的配置
- 部署时为生产环境创建新的环境变量配置
- 定期更换 JWT_SECRET
- 监控和记录认证相关事件
