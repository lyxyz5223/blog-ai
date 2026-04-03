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

```
dev server
    ↓
request →  [ESM Request Interceptor]
    ↓
return native ESM module
```

在生产环境中，Vite 使用 Rollup 进行预配置的打包。

## 快速开始

```bash
npm create vite@latest my-project -- --template react
cd my-project
npm install
npm run dev
```

## 总结

Vite 提供了一个更快、更愉快的开发体验，同时保持了强大的生产构建能力。
