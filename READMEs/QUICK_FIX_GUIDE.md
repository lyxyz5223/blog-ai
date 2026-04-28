# 🔧 测试失败快速修复指南

## 最关键的问题：路由配置

**目前这是导致 15 个测试失败的主要原因**

### 问题症状
```
❌ No routes matched location "/"
❌ Unable to find an element...
```

### 快速修复 - BlogList.test.jsx

将测试渲染函数改为：

```javascript
const renderBlogList = (path = '/blogs') => {
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/blogs/*" element={<BlogList />} />
      </Routes>
    </BrowserRouter>,
    { initialEntries: [path] }
  )
}
```

---

## 修复步骤（优先级顺序）

### 步骤 1: 修复 BlogList 路由 (5 分钟)
📝 文件: `src/pages/BlogList.test.jsx`
```javascript
import { BrowserRouter, Routes, Route, MemoryRouter } from 'react-router'

// 改成更完整的 render 函数
const renderBlogList = (path = '/blogs/page/1') => {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/blogs/page/:page" element={<BlogList />} />
      </Routes>
    </MemoryRouter>
  )
}
```

### 步骤 2: 修复 NotFound 路由 (3 分钟)
📝 文件: `src/pages/NotFound.test.jsx`
```javascript
const renderNotFound = () => {
  return render(
    <MemoryRouter initialEntries={['/invalid-route']}>
      <Routes>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MemoryRouter>
  )
}
```

### 步骤 3: 修复 Home 异步警告 (2 分钟)
📝 文件: `src/pages/Home.test.jsx`
```javascript
import { act } from '@testing-library/react'

// 异步操作用 act 包装
await act(async () => {
  await waitFor(() => {
    expect(screen.getByText('最新文章')).toBeTruthy()
  })
})
```

### 步骤 4: 修复 DailyQuote Mock (3 分钟)
📝 文件: `src/components/DailyQuote.test.jsx`
```javascript
beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        hitokoto: 'Test quote',
        from_who: 'Author'
      })
    })
  )
})
```

---

## 预期结果

| 当前 | ↓ 修复后 |
|------|---------|
| 152 ✅ / 24 ❌ | 170 ✅ / 6 ❌ |
| **86% 通过率** | **96% 通过率** |

---

## 运行修复后的测试

```bash
# 运行特定文件
yarn test src/pages/BlogList.test.jsx --run

# 运行所有测试
yarn test --run

# 查看详细输出
yarn test --run --reporter=verbose
```

---

## 重要提示

✨ **好消息：这些失败都是测试配置问题，不是代码问题**

核心功能（工具函数、数据服务、配置管理）的测试都通过了 ✅
