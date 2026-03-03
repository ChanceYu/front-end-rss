---
title: "【第3628期】默认参数：写出更简洁、更安全的函数代码"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278223&idx=1&sn=f7fa67b2ad3477766a8df709d3ee5789&chksm=bc192b150bc7f3107b9eecb4ec4b76cfb453633a873cb60ee1e1e65ccbf8795c57c93f38380b&scene=0#rd"
date: 2025-12-22
md5: 1b728ca84239360f8f815d32eeb17e92
---

# 【第3628期】默认参数：写出更简洁、更安全的函数代码

前言

还在用 if 判断或逻辑 “或” 来设置默认值？这种老方法早就该淘汰了。本文带你深入理解 JavaScript 默认参数（Default Parameters）：从基础语法到 API 调用、工具函数、React 事件处理，再到解构赋值的高级技巧，帮你彻底告别繁琐判断，让函数代码更优雅、更易维护。

今日前端早读课文章由 @Matt Smith 分享，@飘飘编译。

译文从这开始～～

无论你是在构建 UI 组件、调用 API，还是编写一些工具函数，处理可选函数参数都是相当常见。传统做法通常是用 `if` 判断或逻辑 “或” (`||`) 来设置默认值。但说实话，这种方式容易埋下细微的 bug。

[【第3575期】解锁 AI 响应中的丰富 UI 组件渲染](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277284&idx=1&sn=c96010fa50abd506a21064e332bbf967&scene=21#wechat_redirect)

想想你写过多少次这样的代码：

```
 function greet(name) {
   name = name || 'Guest';
   console.log(`Hello, ${name}`);
 }
```
这种老式写法虽然简洁，但有个陷阱：它会把所有 “假值”（falsy value）都当作缺省值处理，包括像 `0` 或空字符串这样的有效值，从而导致意外结果。

此外，这种写法也有点过时了。这时就轮到 默认参数（default parameters） 登场了 ——JavaScript 的一个实用特性，让你的函数更简洁、更智能。

#### 什么是默认参数？

默认参数允许你在函数定义时直接为参数指定默认值。如果调用函数时没有传入该参数，或者显式传入了 `undefined`，就会自动使用默认值。

```
 function greet(name = 'Guest') {
   console.log(`Hello, ${name}`);
 }
```
现在你可以这样写：

```
 greet();          // Hello, Guest
 greet('Kristen'); // Hello, Kristen
```
不需要在函数内部再写手动判断或回退逻辑。

[【第3608期】Next.js 16 新特性解读：从异步参数到 Turbopack 默认化](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277855&idx=1&sn=5e61452f4d216189051162d44606e4cc&scene=21#wechat_redirect)

#### 注意：只有 `undefined` 才会触发默认值

默认值只在参数为 `undefined` 时生效 —— 也就是说，当参数被省略或显式传入 `undefined` 时才会触发。其他 “假值” 如 `null`、`0` 或 `false` 则不会。

```
 function showCount(count = 10) {
   console.log(count);
 }

 showCount();          // 10
 showCount(undefined); // 10
 showCount(null);      // null（不会使用默认值）
 showCount(0);         // 0
```
如果你希望像 `null` 或 `0` 这样的值也被视为 “缺省”，可以使用 空值合并运算符（nullish coalescing operator） `??`：

```
 function showCount(count) {
   count = count ?? 10;
   console.log(count);
 }
```
这样就能确保只有 `null` 和 `undefined` 会触发默认值，而像 `0` 这样的有效输入则不会被错误替换。

#### 默认参数的实际应用场景

##### 一、在设置 API 选项时使用

```
 function fetchUser(id, options = { cache: true, retries: 3 }) {
   // 逻辑代码...
 }
```
这样写可以让你的函数更健壮 —— 即使调用者忘记传入 `options` 对象，也能使用合理的默认配置。

> ⚠️ 注意：默认参数的值是在调用函数时才会计算的。  
> 这意味着每次调用 `fetchUser` 而不传入 `options` 时，都会新建一个对象，因此不会产生共享状态的问题。

但如果你把默认对象定义在函数外，就可能出现意外的共享或修改：

```
 const defaultOptions = { cache: true, retries: 3 };

 function fetchUser(id, options = defaultOptions) {
   // ‼️ defaultOptions 可能被修改并被多个调用共享
 }
```
##### 二、让工具函数更灵活

```
 function multiply(a, b = 1) {
   return a * b;
 }
```
这样，调用者在希望 “乘以 1” 或只想返回原值时，可以直接省略第二个参数。

##### 三、在 React 事件处理函数或工具包装函数中使用

```
 const handleClick = (event = {}) => {
   const { target = null } = event;
   const id = event?.target?.id ?? 'default-id';
   console.log(`Clicked on element with id: ${id}`);
 };
```
这种写法在测试时或事件被高阶逻辑包裹时尤其方便。默认参数配合可选链（`?.`），让代码更安全，也更易读。

[【早阅】LLM 时代的前端革命：React 不再是框架，而是平台](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278142&idx=1&sn=c310375429ed17ec469ff84e61e56d6f&scene=21#wechat_redirect)

> 🙈 代码自白  
> 以前写满了 `&&` 判断？我也是…… 直到开始用可选链。代码更简洁，bug 更少。

##### 四、加分技巧：默认参数 + 解构赋值

把这两者结合，可以优雅地处理可选的配置对象：

```
 function createUser({ name = 'Anonymous', age = 24 } = {}) {
   console.log(`${name} is ${age} years old.`);
 }

 createUser(); // Anonymous is 24 years old.
```
如果不用默认参数，你可能得在函数内部写一堆重复的检查和回退逻辑。这种模式在编写库函数、处理表单输入或管理组件属性时尤其有用。

##### 五、额外提示：参数顺序很重要

默认参数是按位置定义的，这意味着你不能跳过一个参数，除非显式传入 `undefined`：

```
 function log(a = 'A', b = 'B') {
   console.log(a, b);
 }

 log(undefined, 'Custom'); // A Custom
 log(, 'Custom');          // ❌ SyntaxError
```
如果你想跳过某个参数并使用它的默认值，就传入 `undefined`。

#### 总结

默认参数是 JavaScript 里一个小而强大的语法改进。它让函数写起来更简洁、安全、可读性更强。  
如果你还没用过，不妨今天就试试。

#### 最后一点：关于 `arguments` 对象

默认参数不会计入 `arguments` 对象，除非显式传入：

```
 function demo(a = 1) {
   console.log(arguments.length); // 如果没传参数，结果是 0
   console.log(arguments[0]);     // undefined，即使 a === 1
 }
```
请记住：

- `arguments.length`
  
   反映的是实际传入的参数数量，不包括默认值。
- 即使参数有默认值，`arguments[i]` 也可能是 `undefined`。

关于本文  
译者：@飘飘  
作者：@Matt Smith  
原文：https://allthingssmitty.com/2025/06/29/default-parameters-your-code-just-got-smarter/

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
