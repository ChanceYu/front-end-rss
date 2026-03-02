---
title: "【第3659期】JavaScript 显式资源管理来了：用 using 告别手写 try/finally"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278629&idx=1&sn=b51bc320fefe9c3d3d6f715b1d6626bf&chksm=bcbd70cf21bc4ea4594b976fdf87464337c1c959619a4d9171bfd48615c7bc7d590804d6a601&scene=0#rd"
date: 2026-02-27
md5: 50ce3fc755c423f51c04920af0669621
---

# 【第3659期】JavaScript 显式资源管理来了：用 using 告别手写 try/finally

前言

在 JavaScript 中，资源清理一直依赖 try/finally 手动处理，繁琐且容易出错。如今显式资源管理正式落地，通过 using、DisposableStack 等机制，把清理责任交给运行时，让生命周期更清晰、代码更简洁。今日前端早读课文章由 @Matt Smith 分享，@飘飘编译。

译文从这开始～～

在编写 JavaScript 时，只要打开了某种资源（例如文件、流、锁或数据库连接），就意味着之后要记得把它清理掉。但说实话，这一步并不总能做到。我自己就不止一次忘记过。

一直以来，JavaScript 都把这件事交给开发者自己处理。我们使用 try /finally，提醒自己要小心，并希望没有漏掉某个边界情况。大多数时候确实可行，但代码显得冗长，而且很容易在细节上出错。一旦需要同时管理多个资源，情况就会变得更加复杂。

[【第3514期】JavaScript 的新超能力：显式资源管理](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651276486&idx=1&sn=993e77b8d814daa31edc9f065be98180&scene=21#wechat_redirect)

这种状况终于开始发生改变。显式资源管理为 JavaScript 提供了一种语言级、原生支持的方式来表达：“这个对象需要清理，而且运行时会保证它一定被清理。”

这不再只是约定或编程模式，而是语言本身的一部分。

#### 我们不擅长做清理（而且语言也没帮上忙）

下面这种写法你一定很熟悉：

```
 const file = await openFile("data.txt");

 try {
   // 使用 file 做一些操作
 } finally {
   await file.close();
 }
```

这样写当然没问题，但它也存在一些明显缺点：

- 冗长
- 重复性高
- 随着逻辑变复杂（尤其是重构时），很容易出错

现在再加一个资源：

```
 const file = await openFile("data.txt");
 const lock = await acquireLock();

 try {
   // 同时操作 file 和 lock
 } finally {
   await lock.release();
   await file.close();
 }
```

这时，释放顺序就变得很重要。错误路径也需要考虑。理论上你可以把这些都理清楚，但思考成本会不断增加。而一旦复杂度上来，Bug 往往也随之而来。

其他语言多年前就解决了这个问题。JavaScript 也正在（慢慢地）跟上。

#### using：让运行时负责清理

从概念上讲，using 用来声明一个资源。当它离开作用域时，会被自动清理。

例如：

```
 using file = await openFile("data.txt");

 // 使用 file 做一些操作

 // 在当前作用域结束时，file 会被自动关闭
```

不需要 try。不需要 finally。也不用再问自己 “我有没有记得关闭它？”

关键的改变在于：资源清理不再依赖控制流程，而是绑定到资源的生命周期。

#### 清理机制究竟是如何工作的

要使用显式资源管理，资源本身需要实现一个 “约定好的符号” 方法：

1、`Symbol.dispose`：用于同步清理

2、`Symbol.asyncDispose`：用于异步清理

例如：

```
 class FileHandle {
   async write(data) {
     /* ... */
   }

   async [Symbol.asyncDispose]() {
     await this.close();
   }
 }
```

只要一个对象实现了其中之一，就可以配合 `using` 使用。

需要注意的是，`using` 并不会 “神奇地” 自动关闭文件。它只是把清理机制标准化，不再让每个库都各自发明一套关闭方式。

[【第3504期】清理已失效的分支](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651276351&idx=1&sn=4ede1b072f0a2de0722d43b45e7a0451&scene=21#wechat_redirect)

#### 什么时候需要使用 await using

如果清理过程是异步的，通常需要使用 `await using`：

```
 await using file = await openFile("data.txt");

 // 对 file 进行异步操作
```

当作用域结束时，JavaScript 会在继续执行之前等待资源完成清理。

对于同步资源（例如锁或内存中的结构），可以使用普通的 `using`。一开始可能会觉得有点奇怪，但这和 JavaScript 在其他地方区分同步与异步的方式是一致的。关键在于：当作用域结束时，资源一定会被清理。

> 📌 为异步设计
> 
> `Array.fromAsync()` 就是一个信号，说明 JavaScript 终于开始把异步当作一等公民来看待：现代 JavaScript 中的异步迭代正在逐渐成熟。

#### 多个资源叠加，也不再头疼

这里的改进就非常明显了。

过去你可能会这样写：

```
 const file = await openFile("data.txt");
 const lock = await acquireLock();

 try {
   // 执行操作
 } finally {
   await lock.release();
   await file.close();
 }
```

现在可以写成：

```
 await using file = await openFile("data.txt");
 using lock = await acquireLock();

 // 执行操作
```

资源会自动清理，并且按照 “栈” 的顺序逆序执行：

- 先释放 lock
- 再关闭 file

不需要额外语法。即使发生错误，也不会跳过清理流程，而且清理顺序是明确且可预测的。

#### 作用域才是关键

`using` 声明和 `const` 或 `let` 一样，受作用域限制：

```
 {
   await using file = await openFile("data.txt");
   // 这里可以使用 file
 }

 // 在这里 file 已被清理
```

这种机制会促使你写出更紧凑的作用域，并让资源的生命周期变得清晰可见 —— 而这恰恰是 JavaScript 过去一直不太擅长表达的。一旦你开始在代码中 “看到” 生命周期，就很难再忽视它。

#### 当 using 不够用时

并不是所有资源都能自然地放进一个代码块中。有时候资源的获取是有条件的，或者你在重构旧代码，不希望到处新增作用域。

这时就可以使用 `DisposableStack` 和 `AsyncDisposableStack`：

```
 const stack = new AsyncDisposableStack();

 const file = stack.use(await openFile("data.txt"));
 const lock = stack.use(await acquireLock());

 // 使用 file 和 lock 进行操作

 await stack.disposeAsync();
```

你可以获得和 `using` 一样的安全性，同时拥有更高的灵活度。可以把 `using` 看作是干净、声明式的标准写法，而 stack 则是一个 “兜底方案” 或进阶工具。

#### 这不只是后端功能

乍一看，这似乎更像是服务端才会关心的能力，但它同样适用于前端和各种平台级代码，例如：

- Web Streams
- navigator.locks
- 各种 Observer 和订阅机制
- IndexedDB 事务

只要你写过 `subscribe()` / `unsubscribe()`，或者 `open()` / `close()`，这套机制都值得你认真思考一下。

这不仅仅关乎代码是否正确，更关乎让 “资源生命周期” 直接体现在代码里，而不是隐藏在约定俗成的写法或注释中。

#### 有什么限制？

截至 2026 年初，Chrome 123+ 和 Firefox 119+ 已经支持这些特性，Node.js 20.9+ 也已支持。Safari 目前尚未上线，但已经在计划中。

现阶段，你可以开始尝试这些特性，或者在设计 API 时考虑围绕这种模式展开，尤其是当你在维护库或平台级抽象时。即使你明天还不会全面使用 `using`，它所引入的模型也值得关注。

#### 为资源清理提供更好的默认方案

显式资源管理并不会取代 `try / finally`。当你需要精细控制时，依然会使用它。

但它为我们提供了一个更好的默认选择：更少的样板代码、更少的资源泄漏、更清晰的意图，以及更易读的代码。随着 JavaScript 承担越来越多类似系统级的职责，这类特性已经不再只是 “锦上添花”，而是逐渐成为 “基础配置”。

关于本文  
译者：@飘飘  
作者：@Matt Smith  
原文：https://allthingssmitty.com/2026/02/02/explicit-resource-management-in-javascript/

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
