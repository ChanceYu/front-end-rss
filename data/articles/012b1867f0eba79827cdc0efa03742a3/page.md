---
title: "【第3646期】别再把一切都变成数组了！少做点无用功"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278501&idx=1&sn=4a13eb278c2f5ce66c4b46ede112eeb0&chksm=bcfe3e8d7aec66ee05e99fc7dfcbf318fbf02d2be88994d1ac9d92e9e9aca2ee9327c40c7211&scene=0#rd"
date: 2026-01-22
md5: 012b1867f0eba79827cdc0efa03742a3
---

# 【第3646期】别再把一切都变成数组了！少做点无用功

前言

讲解了如何用 JavaScript 的迭代器辅助方法（Iterator Helpers）替代传统数组方法，以更高效、更惰性的方式处理数据，减少无谓的计算与内存开销。今日前端早读课文章由 @Matt Smith 分享，@飘飘编译。

译文从这开始～～

在前端开发中，大多数数据在显示到屏幕之前，都会被处理很多次。我们通常会获取一个列表，对它进行修改、裁剪，然后反复操作。大多数时候，我们甚至没仔细想过，这中间到底做了多少 “额外的工作”。

[【第3635期】用 JavaScript + JSDoc + tsc，优雅取代 TypeScript 的最佳实践](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278339&idx=1&sn=dbccbeb9b02e73028a780dc2543b8272&scene=21#wechat_redirect)

多年来，现代 JavaScript 一直推崇这样一种熟悉的写法：

```
 data
   .map(...)
   .filter(...)
   .slice(...)
   .map(...)
```
这种链式写法可读性强，语义清晰，但它是 “急切求值” 的：每一步都会生成新的数组，占用额外的内存，还经常做了很多其实没必要的处理。

而现在，JavaScript 中的 迭代器辅助方法（Iterator Helpers） 提供了一种原生的 “惰性” 替代方案，特别适合处理大数据集、数据流以及依赖 UI 交互的逻辑。

#### 数组无处不在（以及那些不必要的工作）

想象这样一个常见的 UI 场景：

- 你获取了一个很大的数据集
- 对它进行了过滤
- 只取前几个结果
- 渲染到页面上

```
 const visibleItems = items
   .filter(isVisible)
   .map(transform)
   .slice(0, 10);
```
看起来没什么问题，对吧？我自己也写过无数次类似的代码。但在底层，这几行其实做了很多额外的事：

- `filter`
  
  创建了一个新数组
- `map`
  
   又创建了一个新数组
- `slice`
  
   再创建了一个新数组

即使你最终只需要 10 个结果，也可能在前面处理了几千条数据。这种 “工作量和需求不匹配” 的问题，就是迭代器辅助方法能帮你解决的。

[【早阅】谁才是你的 AI 职场搭档？这份数据告诉你答案](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278272&idx=1&sn=7ca1a5f5d8554c86449b75c417c569e3&scene=21#wechat_redirect)

#### 什么是 Iterator Helpers？

在介绍迭代器助手之前，让我们先简单了解一下 JavaScript 中的迭代器和可迭代对象。迭代器是一种用于遍历集合（如数组、字符串、映射等）的对象，它定义了一个 `next()` 方法，每次调用该方法都会返回集合中的下一个值。可迭代对象是指实现了迭代器接口的对象，即具有一个 `Symbol.iterator` 方法的对象。迭代器助手是基于迭代器的特性，为处理可迭代对象提供了一些便捷的方法。

迭代器辅助方法是定义在 “迭代器对象” 上的可链式方法，而不是数组上的。

这点非常重要。数组并不会自动拥有这些方法。你需要从 `values()`、`keys()`、`entries()` 或一个生成器（generator）中获取迭代器，然后才能在其上构建惰性的数据处理管道。

常见的方法包括：`map`、`filter`、`take`、`drop`、`flatMap`、`find`、`some`、`every`、`reduce`、`toArray`

其中大多数都是 “惰性执行” 的 —— 只有在需要结果时，才会真正取出数据。

> ⚠️ 注意：`reduce` 是例外，它会立即消耗整个迭代器，因为必须处理所有值才能得到结果。

**惰性执行意味着：**

- 不会生成中间数组
- 不会做无用的工作
- 一旦条件满足就立即停止

你只需描述想要的操作，运行时会在需要时才真正取数据。

#### 默认就是惰性的

来看同样的逻辑，用迭代器辅助方法重写：

```
 const visibleItems = items
   .values()
   .filter(isVisible)
   .map(transform)
   .take(10)
   .toArray();
```
为了更清晰地理解迭代器助手的多种方法，我们来看一些具体的代码示例：

1、map 方法示例：假设我们有一个包含用户信息的可迭代对象，我们想要提取每个用户的用户名并转换为大写形式。

```
 const users = [
   { id: 1, name: 'Alice' },
   { id: 2, name: 'Bob' },
   { id: 3, name: 'Charlie' }
 ];
 const upperCaseNames = users.values().map(user => user.name.toUpperCase()).toArray();
 console.log(upperCaseNames); // 输出：['ALICE', 'BOB', 'CHARLIE']
```
2、filter 方法示例：假设我们有一个包含数字的可迭代对象，我们想要筛选出其中的偶数。

```
 const numbers = [1, 2, 3, 4, 5, 6];
 const evenNumbers = numbers.values().filter(num => num % 2 === 0).toArray();
 console.log(evenNumbers); // 输出：[2, 4, 6]
```
3、take 方法示例：假设我们有一个包含大量数据的可迭代对象，我们只需要获取前 5 个数据项。

```
 const largeDataset = [/* 假设这里有很多数据项 */];
 const firstFiveItems = largeDataset.values().take(5).toArray();
 console.log(firstFiveItems); // 输出：前5个数据项
```
有什么变化？

- `items.values()`
  
   返回的是迭代器，而不是数组
- 每一步只在需要下一个值时才执行
- 当取够 10 个结果后，处理立即停止

#### 在实际项目中能带来什么好处

这不仅仅是性能问题，更重要的是减少不必要的计算。迭代器辅助方法可以让你的 UI 逻辑更高效。

[【早阅】构建更高效、更灵活的前端项目：EdgeOne Pages 的实践与升级](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651275026&idx=1&sn=809be4e03eafb8c5ed5043f9a093e7fb&scene=21#wechat_redirect)

##### 渲染大列表

例如：

- 虚拟列表（Virtualized lists）
- 无限滚动（Infinite scroll）
- 大型表格（Large tables）

惰性迭代意味着你只会处理真正显示在屏幕上的内容：

```
 function* rows(data) {
   for (const row of data) {
     yield renderRow(row);
   }
 }

 const visibleRows = rows(data)
   .filter(isInViewport)
   .take(20)
   .toArray();
```
结果：你只渲染需要的那部分。

##### 流式和异步数据

异步可迭代对象（Async Iterable）也支持迭代器辅助方法，非常适合分页 API 或流式数据：

```
 async function* fetchPages() {
   let page = 1;
   while (true) {
     const res = await fetch(`/api/items?page=${page++}`);
     if (!res.ok) return;
     yield* await res.json();
   }
 }

 const firstTen = await fetchPages()
   .filter(isValid)
   .take(10)
   .toArray();
```
不需要缓存整页数据，也不用自己维护计数器。只需描述数据管道，让运行时按需取值。

#### 更干净的数据处理管道（不再依赖第三方库）

在有 iterator helpers 之前，你可能会引入工具库（如 Lodash）来实现惰性链式调用。现在这些都成为语言内置功能了：

```
 const ids = users
   .values()
   .map(u => u.id)
   .filter(Boolean)
   .toArray();
```
简洁、原生、无依赖。

#### Iterator Helpers vs. 数组方法



| 特性 | 数组方法 | Iterator Helpers |
| --- | --- | --- |
| 执行方式 | 急切执行 | 惰性执行 |
| 内存分配 | 创建新数组 | 几乎无额外分配 |
| 处理数据量 | 全部处理完 | 可提前停止 |
| 学习成本 | 熟悉 | 略有学习曲线 |


经验法则：如果你不需要整个数组，就不要创建数组。

[【第3555期】JavaScript 使用 Array.fromAsync() 实现现代异步迭代](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277029&idx=1&sn=73375282f7504a287abef3ce4a12b5b1&scene=21#wechat_redirect)

#### 什么时候不该用 Iterator Helpers

它们功能强大，但并非万能。若强行在所有地方使用，反而会让代码更复杂。

不适合的场景包括：

- 需要随机访问（如 `items[5]`）
- 大量依赖数组变更
- 数据量很小、简单直接更重要

#### 一些要注意的坑



| 特性 | 含义 | 为什么重要 |
| --- | --- | --- |
| 单次可用 | 一旦消费，迭代器就结束 | 无法复用同一个管道 |
| 惰性执行 | 不消费就不会执行 | 带副作用的操作可能看似 “没生效” |
| 顺序执行 | 不能随机访问 | 类似 items[5] 的写法不适用 |
| 调试会消耗数据 | console.log 可能改变结果 | 打印时会提前取数据 |


记住：迭代器代表的是 “尚未执行的工作”，而不是 “已有的数据”。

#### 现在能用吗？

可以！迭代器辅助方法已在所有现代浏览器和 Node 22+ 中得到支持。如果你的项目运行在当下的环境，就能直接使用。

除了文章中提到的不适合使用迭代器助手的场景外，在以下几种场景下优先考虑使用迭代器助手：

- 处理大数据集：当需要处理的数据量较大时，迭代器助手的懒加载特性可以避免一次性加载和处理所有数据，从而减少内存占用和提高性能。
- 流数据处理：对于流式数据（如从 API 分页获取的数据），迭代器助手能够很好地与异步迭代器结合，实现按需加载和处理数据，避免不必要的数据缓冲和手动分页逻辑。
- UI 驱动的逻辑：在 UI 渲染过程中，如果只需要根据用户操作动态加载和显示部分数据，迭代器助手可以根据用户的实际需求逐步处理数据，提高 UI 的响应速度和性能。

#### 有意 “少做点事”

长期以来，JavaScript 一直让我们习惯于把一切都转成数组。而迭代器辅助方法提供了一种新的思路：

- 少做不必要的工作
- 更少的内存占用
- 数据处理逻辑更贴近 UI 实际需求

一旦你习惯了惰性迭代，再回头看那些急切执行的链式调用，就会觉得有点浪费。

管理其实也是，少做点事，特别是无意义的事。

关于本文  
译者：@飘飘  
作者：@Matt Smith  
原文：https://allthingssmitty.com/2026/01/12/stop-turning-everything-into-arrays-and-do-less-work-instead/

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
