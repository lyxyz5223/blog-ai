# React Hooks 详解

React Hooks 是 React 16.8 引入的一个新特性，它允许你在不编写类组件的情况下使用状态和其他 React 特性。

## 常用的 Hooks

### useState
```jsx
const [count, setCount] = useState(0);
```

useState Hook 允许你向函数组件添加状态。

### useEffect
```jsx
useEffect(() => {
  document.title = `You clicked ${count} times`;
}, [count]);
```

useEffect Hook 允许你在函数组件中执行副作用。

### useContext
useContext 允许你订阅 Context，而不必嵌套一个消费者。

## 最佳实践

1. **只在顶层调用 Hooks** - 不要在循环、条件或嵌套的函数中调用 Hooks。
2. **只在 React 函数中调用 Hooks** - 在 React 函数组件中调用 Hooks。
3. **使用 ESLint 插件** - 使用 eslint-plugin-react-hooks 来强制执行这些规则。

## 总结

Hooks 提供了一种更优雅的方式来重用状态逻辑，使代码更简洁、更易维护。
