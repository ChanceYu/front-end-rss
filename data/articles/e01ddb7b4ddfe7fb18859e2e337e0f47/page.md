---
title: "CSS if() 函数上线啦！"
link: "http://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247528668&idx=1&sn=1587f30ba73cecbdff86eab41dbd110f&chksm=f992760dcee5ff1b18a895a5329e1bd79728201b2d3f34f3c214d91ac29eae14bd24df1dd7a2#rd"
date: 2025-12-23
md5: e01ddb7b4ddfe7fb18859e2e337e0f47
---

# CSS if() 函数上线啦！

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

  

多年来，我们一直依赖各种变通方式：用 JavaScript 切换 class、用 CSS 预处理器写 mixin，或者写满屏的媒体查询。`if()` 函数终结了这些做法，它把条件逻辑直接带进了 CSS —— 优雅、高性能且完全声明式。

## 如何工作：

```code-snippet__js
property: if(
  condition-1: value-1;
  condition-2: value-2;
  condition-3: value-3;
  else: default-value
);
```
该函数会按顺序检查条件，应用第一个匹配的值。如果没有匹配项，则使用 `else` 的值——完全符合编程语言的直觉，只是现在是在纯 CSS 中实现。

---

## if() 函数的三大能力

### 1\. Style Queries

通过 `style()`，你可以根据 CSS 自定义属性变化做出响应：

```code-snippet__js
.card {
  --status: attr(data-status type(<custom-ident>));


  border-color: if(
    style(--status: pending): royalblue;
    style(--status: complete): seagreen;
    style(--status: error): crimson;
    else: gray
  );
}
```
一个 HTML 中的 `data-status` 属性现在就能控制整套样式 —— 不再需要 utility class！

---

### 2\. Media Queries

忘掉那些层层嵌套的媒体查询吧。通过 `media()`，你可以在行内定义响应式值：

```code-snippet__js
h1 {
  font-size: if(
    media(width >= 1200px): 3rem;
    media(width >= 768px): 2.5rem;
    media(width >= 480px): 2rem;
    else: 1.75rem
  );
}
```
---

### 3\. Feature Detection

告别随机 fallback 和“希望它能正常工作”的时代 😬。有了 `supports()`，你可以在属性内直接检查浏览器特性：

```code-snippet__js
.element {
  border-color: if(
    supports(color: lch(0 0 0)): lch(50% 100 150);
    supports(color: lab(0 0 0)): lab(50 100 -50);
    else: rgb(200, 100, 50)
  );
}
```
---

## 真实应用场景

### 三行实现暗色模式

```code-snippet__js
body {
  --theme: "dark"; /* 可通过 JavaScript 或用户偏好切换 */


  background: if(
    style(--theme: "dark"): #1a1a1a;
    else: white
  );


  color: if(
    style(--theme: "dark"): #e4e4e4;
    else: #333
  );
}
```
---

### 设计系统中的状态组件

```code-snippet__js
.alert {
  --type: attr(data-type type(<custom-ident>));


  background: if(
    style(--type: success): #d4edda;
    style(--type: warning): #fff3cd;
    style(--type: danger): #f8d7da;
    style(--type: info): #d1ecf1;
    else: #f8f9fa
  );


  border-left: 4px solid if(
    style(--type: success): #28a745;
    style(--type: warning): #ffc107;
    style(--type: danger): #dc3545;
    style(--type: info): #17a2b8;
    else: #6c757d
  );
}
```
---

### 无需媒体查询混乱的容器布局

```code-snippet__js
.container {
  width: if(
    media(width >= 1400px): 1320px;
    media(width >= 1200px): 1140px;
    media(width >= 992px): 960px;
    media(width >= 768px): 720px;
    media(width >= 576px): 540px;
    else: 100%
  );


  padding-inline: if(
    media(width >= 768px): 2rem;
    else: 1rem
  );
}
```
---

## 与现代 CSS 特性的组合 🤔

```code-snippet__js
.element {
  /* 与新的 light-dark() 配合使用 */
  color: if(
    style(--high-contrast: true): black;
    else: light-dark(#333, #e4e4e4)
  );


  /* 与 CSS Custom Functions (@function) 配合使用 */
  padding: if(
    style(--spacing: loose): --spacing-function(2);
    style(--spacing: tight): --spacing-function(0.5);
    else: --spacing-function(1)
  );
}
```
---

## 浏览器支持情况

截至 2025 年 8 月：

- ✅ Chrome/Edge：137+
- ✅ Chrome Android：139+
- ❌ Firefox：开发中
- ❌ Safari：已在规划
- ❌ Opera：暂不支持

在支持仍在扩张的情况下，你可以使用如下模式：

```code-snippet__js
.button {
  /* 所有浏览器的 fallback */
  padding: 1rem 2rem;
  background: #007bff;


  /* 现代浏览器会自动覆盖 */
  padding: if(
    style(--size: small): 0.5rem 1rem;
    style(--size: large): 1.5rem 3rem;
    else: 1rem 2rem
  );


  background: if(
    style(--variant: primary): #007bff;
    style(--variant: success): #28a745;
    style(--variant: danger): #dc3545;
    else: #6c757d
  );
}
```
---

## 未来展望

CSS Working Group 已在研究下一步扩展：

- 范围判断：`if(style(--value > 100): ...)`
- 逻辑操作符：`if(style(--a: true) and style(--b: false): ...)`
- 更深度的容器查询整合：更强的上下文感知能力

原文地址：https://medium.com/@karstenbiedermann/the-css-if-function-has-arrived-152115ab2115

  

原文作者： Karsten Biedermann

Node 社群
