# 多选分类筛选和计数显示功能总结

## 功能需求
1. ✅ 分类筛选允许多选（可同时选择多个分类）
2. ✅ 每个分类标签后显示该分类的博客数量
3. ✅ 不再只显示"全部"的计数

## 实现方案

### 1️⃣ 后端修改

#### a) 数据库函数 - `server/database.js`

**修改 `getCategories()` 函数**
- 改为返回包含每个分类计数的对象数组
- 使用 `GROUP BY` 统计每个分类的博客数量
- 按分类名称排序

```javascript
// 返回格式：[{name: "JavaScript", count: 15}, {name: "React", count: 10}, ...]
```

**新增 `getPaginatedBlogsByCategories()` 函数**
- 支持查询多个分类的博客
- 使用 `IN` 操作符匹配任何一个分类
- 支持分页

```javascript
export const getPaginatedBlogsByCategories = async (categories, page = 1, pageSize = 10, tableName = 'blogs')
```

#### b) API 端点 - `server/index.js`

**修改 `GET /api/categories` 端点**
- 返回包含计数的分类对象数组

**新增 `GET /api/blogs/categories/page/:page` 端点**
- 路由：`/api/blogs/categories/page/{page}?categories={cat1}&categories={cat2}&limit={pageSize}`
- 支持多分类查询
- 支持数组参数格式

```javascript
// 示例请求
GET /api/blogs/categories/page/1?categories=JavaScript&categories=React&limit=10
GET /api/blogs/categories/page/1?categories=TypeScript&limit=10
```

### 2️⃣ 前端服务层修改 - `src/data/dataService.js`

**修改 `getCategories()` 函数**
- 本地模式：遍历博客元数据，计算每个分类的计数
- 返回 `[{name: "...", count: N}, ...]` 格式

**新增 `getPaginatedBlogsByCategories()` 函数**
- 支持按多个分类查询分页数据
- 本地模式和 API 模式都支持
- 并行处理多个分类条件

```javascript
export const getPaginatedBlogsByCategories = async (categories, page = 1, pageSize = 10)
```

### 3️⃣ 前端页面修改 - `src/pages/BlogList.jsx`

**改变状态管理**
```javascript
// 改为
const [selectedCategories, setSelectedCategories] = useState([])  // 数组支持多选
// 原为
// const [selectedCategory, setSelectedCategory] = useState(null)  // 单个分类
```

**改进加载逻辑优先级**
```
1. 如果正在搜索 → searchBlogs()
2. 否则如果选择多个分类 → getPaginatedBlogsByCategories()
3. 否则如果选择一个分类 → getPaginatedBlogsByCategory()
4. 否则 → getPaginatedBlogs()（全部）
```

**改进分类按钮逻辑 - 支持多选**
```javascript
onClick={() => {
  if (selectedCategories.includes(category.name)) {
    // 点击已选分类 → 取消选择
    setSelectedCategories(selectedCategories.filter(c => c !== category.name))
  } else {
    // 点击未选分类 → 添加选择
    setSelectedCategories([...selectedCategories, category.name])
  }
}}
```

**显示分类计数**
```jsx
{category.name} ({category.count})
```

## 工作流程

### 单选
```
用户点击 "React" 按钮
  ↓
toggles: selectedCategories = ["React"]
  ↓
调用 getPaginatedBlogsByCategory("React", 1, 10)
  ↓
显示 React 分类的博客
```

### 多选
```
用户点击 "React" 按钮
  ↓
toggles: selectedCategories = ["React"]
  ↓
用户点击 "JavaScript" 按钮
  ↓
toggles: selectedCategories = ["React", "JavaScript"]
  ↓
调用 getPaginatedBlogsByCategories(["React", "JavaScript"], 1, 10)
  ↓
显示 React 或 JavaScript 分类的博客
```

### 取消选择
```
用户已选 ["React", "JavaScript"]
  ↓
用户再次点击 "React" 按钮
  ↓
toggles: selectedCategories = ["JavaScript"]
  ↓
调用 getPaginatedBlogsByCategory("JavaScript", 1, 10)
  ↓
或只有一个分类时自动转为单分类查询
```

### 清除所有选择
```
用户点击 "全部" 按钮
  ↓
clears: selectedCategories = []
  ↓
调用 getPaginatedBlogs(1, 10)
  ↓
显示所有分类的博客
```

## 测试方法

### 1. 启动服务器
```bash
yarn server
```

### 2. API 测试

#### 获取分类及计数
```bash
curl "http://localhost:9876/api/categories"
# 返回 [{name: "JavaScript", count: 15}, {name: "React", count: 10}, ...]
```

#### 多分类查询
```bash
# 查询 JavaScript 和 React 分类
curl "http://localhost:9876/api/blogs/categories/page/1?categories=JavaScript&categories=React&limit=10"
```

### 3. 前端页面测试

1. 打开博客列表页面
   - ✅ 验证每个分类按钮后显示计数 (10), (15), (8) 等

2. 单选一个分类
   - 点击 "React" 按钮
   - ✅ React 按钮变为 active 状态
   - ✅ 只显示 React 分类的博客
   - ✅ 分类计数正确

3. 多选两个分类
   - 点击 "React" 按钮 → active
   - 再点击 "JavaScript" 按钮 → active
   - ✅ 两个按钮都是 active 状态
   - ✅ 显示 React 或 JavaScript 的博客
   - ✅ 总数 = React 计数 + JavaScript 计数（去重）

4. 取消选择
   - 在多选状态，点击其中一个按钮
   - ✅ 该按钮变为非 active
   - ✅ 只显示其他分类的博客

5. 清除所有选择
   - 在任何多选/单选状态，点击 "全部" 按钮
   - ✅ 所有分类按钮都变为非 active
   - ✅ 显示所有分类的博客

6. 与搜索协作
   - 选择多个分类，然后搜索
   - ✅ 搜索激活，分类选择清除
   - 进行搜索，然后选择分类
   - ✅ 分类激活，搜索清除

### 4. 控制台日志验证
```
📂 [getCategories] 从API加载 3 个分类
# 返回格式已改为包含计数的对象

📄 [getPaginatedBlogsByCategories] 从API加载分类 [JavaScript, React] 第 1 页
# 显示多分类查询的日志
```

## 修改前后対比

| 功能点 | 修改前 | 修改后 |
|-------|-------|--------|
| **分类选择** | 单选 | 多选 ✅ |
| **计数显示** | 仅"全部"显示总数 | 每个分类显示其计数 ✅ |
| **按钮状态** | 0或1个active | 可多个active ✅ |
| **查询逻辑** | 3种（全部/单分类/搜索） | 4种（全部/单分类/多分类/搜索） ✅ |
| **后端API** | 基础查询 | 支持多分类参数 ✅ |

## 关键改进

✨ **用户体验改进**
- ✅ 可以同时选择多个感兴趣的分类
- ✅ 实时看到每个分类有多少篇文章
- ✅ 快速了解内容分布
- ✅ 更灵活的浏览方式

🚀 **技术改进**
- ✅ 后端支持复杂的多条件查询
- ✅ 前端状态管理更灵活
- ✅ UI 更加直观
- ✅ 可扩展的架构

## 后续优化方向

1. **分类排序**
   - 按计数从高到低排序（热门优先）
   - 支持自定义排序

2. **分类搜索**
   - 分类列表过多时，支持搜索分类
   - 快速定位目标分类

3. **已选分类指示**
   - 在筛选条件区域显示已选分类列表
   - 支持一键清除某个分类

4. **分类统计面板**
   - 显示分类的视觉统计（如条形图）
   - 展示分类间的博客数量差异

5. **分类导出**
   - 支持将选中分类的博客导出为列表
   - 支持批量操作
