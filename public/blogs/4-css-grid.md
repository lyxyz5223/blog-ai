# CSS Grid 布局完全指南

CSS Grid 是一个强大的布局系统，允许你创建二维布局。

## 基础概念

### 容器和项目
```css
.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  gap: 10px;
}
```

### 网格线
网格由水平线和垂直线组成。

### 网格单元
由四条网格线围成的最小单位。

## 常用属性

- `grid-template-columns`: 定义列的大小
- `grid-template-rows`: 定义行的大小
- `grid-column`: 定义列的跨度
- `grid-row`: 定义行的跨度
- `justify-items`: 水平对齐项目
- `align-items`: 垂直对齐项目

## 实际应用

Grid 非常适合用于创建页面布局、卡片网格、仪表板等。

## 总结

CSS Grid 是现代 Web 设计中必不可少的工具。
