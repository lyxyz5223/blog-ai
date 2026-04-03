# 快速开始指南

## 📋 前提条件

- Node.js 18+ 
- npm 或 yarn
- PostgreSQL 12+ (若使用数据库模式)

## 🚀 快速启动

### 方式一：本地存储模式（推荐初学者）

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动开发服务器**
   ```bash
   npm run dev
   ```

3. **访问应用**
   - 打开 http://localhost:5173
   - 进入 Admin 页面管理博客
   - 导出数据保存更改

✅ 完成！无需数据库即可开始使用

---

### 方式二：使用 PostgreSQL 数据库

#### 第一步：安装并启动 PostgreSQL

**Windows:**
- 下载安装 [PostgreSQL](https://www.postgresql.org/download/windows/)
- 启动 PostgreSQL 服务

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql
sudo service postgresql start
```

#### 第二步：创建数据库

```bash
# 使用 psql 连接
psql -U postgres

# 在 psql 提示符下执行
CREATE DATABASE blog_db;
\q
```

#### 第三步：配置应用

编辑 `config.json`：
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

#### 第四步：启动后端服务

```bash
# 安装后端依赖
npm run server:install

# 启动服务器（新终端窗口）
npm run server
```

#### 第五步：启动前端（新终端窗口）

```bash
npm run dev
```

#### 第六步：使用应用

- 打开 http://localhost:5173
- 进入 Admin 页面
- 点击存储模式按钮切换到 "🗄️ 数据库模式"
- 所有编辑立即保存到数据库

✅ 完成！数据已持久化到 PostgreSQL

---

## 🎮 使用 Admin 页面

### 创建新博客
1. 点击 "➕ 新建文章" 按钮
2. 填写标题、内容等信息
3. 点击 "💾 保存"

### 编辑博客
1. 从左侧列表选择文章
2. 修改内容
3. 点击 "💾 保存"

### 删除博客
1. 选择文章
2. 点击 "🗑️ 删除"
3. 确认删除

### 导出数据（本地模式）
1. 点击 "💾 导出数据"
2. 得到 `blogsData.js` 文件
3. 替换 `src/data/blogsData.js` 保存更改

---

## 🔄 切换存储模式

### 从本地切换到数据库

1. 按照"方式二"设置 PostgreSQL
2. 在 Admin 页面点击存储模式复选框
3. 系统会加载数据库数据

### 从数据库切换到本地

1. 在 Admin 页面导出数据
2. 在 Admin 页面点击存储模式复选框
3. 关闭后端服务

---

## 📁 项目结构说明

```
blog/
├── src/
│   ├── config/
│   │   └── config.js              # 配置加载模块
│   ├── data/
│   │   ├── blogsData.js          # 本地博客数据
│   │   └── dataService.js        # 数据加载服务（关键）
│   └── pages/
│       ├── Admin.jsx             # 管理后台
│       ├── BlogList.jsx          # 博客列表
│       ├── BlogDetail.jsx        # 博客详情
│       └── Home.jsx              # 首页
├── server/
│   ├── database.js               # 数据库操作模块
│   ├── index.js                  # 后端 API 服务器
│   └── package.json              # 后端依赖
├── config.json                   # 全局配置文件（关键）
└── STORAGE_CONFIG_GUIDE.md       # 详细配置指南
```

---

## 🆘 常见问题

**Q: 我应该选择哪种模式？**
- A: 如果是个人小博客，使用本地模式即可。如果需要迭代更新或多人管理，使用数据库模式。

**Q: 如何备份数据？**
- A: 本地模式点击导出。数据库模式使用 `pg_dump` 备份 PostgreSQL。

**Q: Admin 页面无法加载数据？**
- A: 检查 config.json 配置，检查浏览器控制台错误，确保数据库/本地文件存在。

**Q: 后端服务无法启动？**
- A: 运行 `npm run server:install` 安装依赖，检查 PostgreSQL 连接信息。

---

## 📚 更多信息

- 查看 [存储配置详细指南](./STORAGE_CONFIG_GUIDE.md)
- 查看 [博客管理指南](./BLOG_MANAGEMENT_GUIDE.md)
- 查看 [服务器 README](./server/README.md)

---

## 🎉 开始创作吧！

现在你已经准备好管理你的博客了。选择存储模式，开始创作！
