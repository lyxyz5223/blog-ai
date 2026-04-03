export const blogsData = [
  {
    id: 1,
    title: 'React Hooks 详解',
    excerpt: '深入了解 React Hooks 的原理和最佳实践...',
    content: `
# React Hooks 详解

React Hooks 是 React 16.8 引入的一个新特性，它允许你在不编写类组件的情况下使用状态和其他 React 特性。

## 常用的 Hooks

### useState
\`\`\`jsx
const [count, setCount] = useState(0);
\`\`\`

useState Hook 允许你向函数组件添加状态。

### useEffect
\`\`\`jsx
useEffect(() => {
  document.title = \`You clicked \${count} times\`;
}, [count]);
\`\`\`

useEffect Hook 允许你在函数组件中执行副作用。

### useContext
useContext 允许你订阅 Context，而不必嵌套一个消费者。

## 最佳实践

1. **只在顶层调用 Hooks** - 不要在循环、条件或嵌套的函数中调用 Hooks。
2. **只在 React 函数中调用 Hooks** - 在 React 函数组件中调用 Hooks。
3. **使用 ESLint 插件** - 使用 eslint-plugin-react-hooks 来强制执行这些规则。

## 总结

Hooks 提供了一种更优雅的方式来重用状态逻辑，使代码更简洁、更易维护。
    `,
    datetime: '2024-01-15T10:30',
    category: 'React',
    author: '技术博主'
  },
  {
    id: 2,
    title: '现代 JavaScript 特性',
    excerpt: '探索 ES6+ 的强大功能...',
    content: `
# 现代 JavaScript 特性

从 ECMAScript 6 开始，JavaScript 语言得到了大幅的改进和扩展。让我们看看一些最重要的特性。

## 箭头函数
\`\`\`js
const add = (a, b) => a + b;
\`\`\`

箭头函数提供了一个简洁的语法，并且 \`this\` 是继承的。

## 析构赋值
\`\`\`js
const { name, age } = person;
const [first, second] = array;
\`\`\`

析构赋值允许你从对象或数组中提取值。

## 模板字符串
\`\`\`js
const message = \`Hello, \${name}!\`;
\`\`\`

模板字符串提供了一个更简洁和清晰的方式来创建字符串。

## 类
\`\`\`js
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(this.name + ' makes a sound');
  }
}
\`\`\`

类提供了一个更传统的面向对象编程方式。

## 总结

现代 JavaScript 使开发变得更加高效和愉快。
    `,
    datetime: '2024-01-10T10:00',
    category: 'JavaScript',
    author: '技术博主'
  },
  {
    id: 3,
    title: 'Vite 构建工具介绍',
    excerpt: '为什么 Vite 是现代前端开发的最佳选择...',
    content: `
# Vite 构建工具介绍

Vite 是一个下一代的前端构建工具，由 Vue 的创作者尤雨溪开发。它提供了极快的本地开发体验。

## 为什么选择 Vite

### 快速的冷启动
Vite 利用浏览器原生的 ES 模块支持，在开发模式下无需打包，大大加快了启动速度。

### 闪电般快的 HMR
热模块替换几乎是即时的，无论应用程序大小如何。

### 丰富的功能
- 开箱即用的 TypeScript、JSX、CSS 等支持
- 预配置的 Rollup 构建
- 通用的插件接口

## Vite 的工作原理

\`\`\`
dev server
    ↓
request →  [ESM Request Interceptor]
    ↓
return native ESM module
\`\`\`

在生产环境中，Vite 使用 Rollup 进行预配置的打包。

## 快速开始

\`\`\`bash
npm create vite@latest my-project -- --template react
cd my-project
npm install
npm run dev
\`\`\`

## 总结

Vite 提供了一个更快、更愉快的开发体验，同时保持了强大的生产构建能力。
    `,
    datetime: '2024-01-05T10:00',
    category: 'Vite',
    author: '技术博主'
  },
  {
    id: 4,
    title: 'CSS Grid 布局完全指南',
    excerpt: '掌握现代 CSS 网格布局...',
    content: `
# CSS Grid 布局完全指南

CSS Grid 是一个强大的布局系统，允许你创建二维布局。

## 基础概念

### 容器和项目
\`\`\`css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  gap: 10px;
}
\`\`\`

### 网格线
网格由水平线和垂直线组成。

### 网格单元
由四条网格线围成的最小单位。

## 常用属性

- \`grid-template-columns\`: 定义列的大小
- \`grid-template-rows\`: 定义行的大小
- \`grid-column\`: 定义列的跨度
- \`grid-row\`: 定义行的跨度
- \`justify-items\`: 水平对齐项目
- \`align-items\`: 垂直对齐项目

## 实际应用

Grid 非常适合用于创建页面布局、卡片网格、仪表板等。

## 总结

CSS Grid 是现代 Web 设计中必不可少的工具。
    `,
    datetime: '2023-12-28T10:00',
    category: 'CSS',
    author: '技术博主'
  }
]
