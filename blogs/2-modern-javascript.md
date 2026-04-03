# 现代 JavaScript 特性

从 ECMAScript 6 开始，JavaScript 语言得到了大幅的改进和扩展。让我们看看一些最重要的特性。

## 箭头函数
```js
const add = (a, b) => a + b;
```

箭头函数提供了一个简洁的语法，并且 `this` 是继承的。

## 析构赋值
```js
const { name, age } = person;
const [first, second] = array;
```

析构赋值允许你从对象或数组中提取值。

## 模板字符串
```js
const message = `Hello, ${name}!`;
```

模板字符串提供了一个更简洁和清晰的方式来创建字符串。

## 类
```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    console.log(this.name + ' makes a sound');
  }
}
```

类提供了一个更传统的面向对象编程方式。

## 总结

现代 JavaScript 使开发变得更加高效和愉快。
