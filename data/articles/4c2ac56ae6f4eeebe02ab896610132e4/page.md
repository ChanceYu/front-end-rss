---
title: "【第3648期】用 200 行 JS 实现“渐进式 JSON”——让网页加载速度快到飞起！"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278535&idx=1&sn=74e108dbd7c5d4d957265752690614bf&chksm=bce236708c9513d6e7d56416b2d965290dd64dc7cd63febfc5d478a56957c08386e7b6c64452&scene=0#rd"
date: 2026-01-27
md5: 4c2ac56ae6f4eeebe02ab896610132e4
---

# 【第3648期】用 200 行 JS 实现“渐进式 JSON”——让网页加载速度快到飞起！

前言

介绍了如何用约 200 行 JavaScript 代码，通过流式传输分块 JSON 数据（Progressive JSON），实现客户端即时渲染，从而显著提升 Web 应用的加载性能。今日前端早读课文章由 @KrasimirTsonev 分享，@飘飘编译。

译文从这开始～～

在继续研究 React 服务端组件（React Server Components）时，偶然看到一篇关于 “progressive JSON（渐进式 JSON）” 的文章。Dan Abramov 在文中介绍了一种从服务器向客户端分块流式传输 JSON 的技术，这样客户端在还没接收完整个数据时，就能提前开始渲染部分内容。对于大型数据集来说，这种方式可以显著提升 “感知性能”。于是我开始好奇：要实现这样的功能需要多大工作量？结果发现，这其实是个挺有趣的练习，最终我写了一个大约 200 行代码的小库，叫 Streamson。这篇文章就是讲我如何构建它的。

[【第3547期】渐进式JSON](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651276917&idx=1&sn=1cc382a66cc417fe94617ad3b7620265&scene=21#wechat_redirect)

Streamson：https://github.com/krasimir/streamson

#### 思路

渐进式 JSON 流式传输的核心思想是：只要部分数据准备好了，就立即发送给客户端，而不是等整个 JSON 完成后再发送。这在处理大型数据集或数据是实时生成时尤其有用。对于暂时还没准备好的部分，可以先发送占位符，等数据就绪后客户端再将其替换为真实内容。举个例子：

```
 {
   "user": {
     "id": 1,
     "name": "John Doe",
     "posts": [
       { "id": 101, "title": "First Post", "content": "..." },
       { "id": 102, "title": "Second Post", "content": "..." }
     ]
   }
 }
```
假设我们立即有用户信息，但帖子内容需要从数据库获取，会花一些时间。传统方式是等待所有帖子加载完再返回整个对象，而我们可以先发一个占位符：

[【第3646期】别再把一切都变成数组了！少做点无用功](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278501&idx=1&sn=4a13eb278c2f5ce66c4b46ede112eeb0&scene=21#wechat_redirect)

```
 {
   "user": {
     "id": 1,
     "name": "John Doe",
     "posts": "_$1"
   }
 }
```
当帖子加载完成后，再单独发一个分块数据：

```
 {
   "_$1": [
     { "id": 101, "title": "First Post", "content": "..." },
     { "id": 102, "title": "Second Post", "content": "..." }
   ]
 }
```
客户端需要能识别这些占位符，并在对应数据到达时将其替换。

#### 服务端实现

我们先写一个简单的函数，它接收服务器响应对象（即通向客户端的通道）和要发送的数据对象：

```
 function serve(res, data) {
   res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
   res.setHeader("Transfer-Encoding", "chunked");

   // 向客户端发送分块数据
   res.write(JSON.stringify(...) + "\n");
   res.write(JSON.stringify(...) + "\n");

   // 全部完成后
   res.end();
 }
```
这里有几个关键点：

- 使用了 `application/x-ndjson` 内容类型。

NDJSON（Newline Delimited JSON，换行分隔的 JSON）是一种方便的流式传输格式，每一行都是独立的 JSON 对象。这样我们可以在一个响应中发送多个 JSON 对象，以换行符分隔。

- 使用了 `Transfer-Encoding: chunked` 头。

这告诉客户端响应是分块传输的，客户端不能依赖 `Content-Length` 来判断数据结束。同时，这会保持连接一直打开，直到我们调用 `res.end()`。

接下来我们要对数据进行 “分块化”。做法是遍历数据对象，把其中需要后续发送的部分替换成占位符。当遇到一个异步数据（Promise）时，我们将它放入一个队列，等它完成后再作为独立分块发送。

[【第3045期】基于模块联邦与大仓模式的商家巨石应用拆分实践](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651265502&idx=1&sn=7b4ddd995bb0979e7c7a8189f3f371c4&scene=21#wechat_redirect)

下面是用于处理数据的函数：

```
 function normalize(value) {
   function walk(node) {
     if (isPromise(node)) {
       const id = getId();
       registerPromise(node, id);
       return id;
     }
     if (Array.isArray(node)) {
       return node.map((item) => walk(item));
     }
     if (node && typeof node === "object") {
       const out = {};
       for (const [key, val] of Object.entries(node)) {
         out[key] = walk(val);
       }
       return out;
     }
     return node;
   }
   return walk(value);
 }
```
这个函数会递归地遍历数据对象。当遇到 Promise 时，会生成一个唯一的占位符 ID，并注册这个 Promise，等待其解析。数组和对象会递归处理，原始值（如数字、字符串）则直接返回。

`registerPromise` 函数会把 Promise 和占位符 ID 存入队列。当 Promise 解析成功时，就将结果作为新分块发给客户端：

```
 let promises = [];

 function registerPromise(promise, id) {
   promises.push({ promise, id });
   promise.then((value) => {
     send(id, value);
   }).catch((err) => {
     console.error("Error resolving promise for path", err);
     send(id, { error: "promise error", timeoutMs: TIMEOUT });
   });
 }
```
`send` 函数负责把已解析的数据写入响应：

```
 function send(id, value) {
   res.write(JSON.stringify({ i: id, c: normalize(value) }) + "\n");
   promises = promises.filter((p) => p.id !== id);
   if (promises.length === 0) res.end();
 }
```
它会向客户端写入一个新的 JSON 行，包含占位符 ID 和对应的数据。  
当该 Promise 处理完后，它会从队列中移除。若没有待处理的 Promise，就调用 `res.end()` 结束响应。

完整实现可以在这里：https://github.com/krasimir/streamson/blob/main/packages/streamson/lib/server.js

最后来看一个可以从服务端发送的对象示例：

```
 const data = {
   user: {
     id: 1,
     name: "John Doe",
     posts: fetchPostsFromDatabase(), // 返回一个 Promise
   },
 };

 async function fetchPostsFromDatabase() {
   const posts = await database.query("SELECT * FROM posts WHERE userId = 1");
   return posts.map((post) => ({
     id: post.id,
     title: post.title,
     content: post.content,
     comments: fetchCommentsForPost(post.id), // 同样返回 Promise
   }));
 }
```
注意，每个帖子里还有一个 `comments` 字段，它也是一个 Promise。这意味着评论数据会在帖子数据发送之后，再作为单独分块传送给客户端。

#### 客户端实现

在客户端，我们需要处理从服务器传来的分块数据，并将占位符替换成真实数据。可以使用 Fetch API 向服务器发起请求，并将响应作为一个流来读取。每当遇到占位符时，我们用一个 Promise 来替代它，当实际数据到达时再解析这个 Promise。核心逻辑大致如下：

[【第3567期】React Suspense 的内部原理：抛出 Promise 与声明式异步 UI](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277190&idx=1&sn=673ab56d992bd74088941d7939fdf840&scene=21#wechat_redirect)

```
 try {
   const res = await fetch(endpoint);
   const reader = res.body.getReader();
   const decoder = new TextDecoder();

   async function process() {
     let done = false;
     while (!done) {
       const { value, done: readerDone } = await reader.read();
       done = readerDone;
       if (value) {
         try {
           const chunk = JSON.parse(decoder.decode(value, { stream: true }));
           chunk.c = walk(chunk.c);
           if (promises.has(chunk.i)) {
             promises.get(chunk.i)(chunk.c);
             promises.delete(chunk.i);
           }
         } catch (e) {
           console.error(`解析分块数据出错`, e);
         }
       }
     }
   }
   process();
 } catch (e) {
   console.error(e);
   throw new Error(`从 Streamson 接口 ${endpoint} 获取数据失败`);
 }
```
`process` 函数会逐个读取响应流的分块。每个分块都会被解析成 JSON，然后调用 `walk` 函数，用来把占位符替换成 Promise。如果分块中包含之前注册过的占位符 ID 对应的数据，就会解析该 Promise。关键点在于 `reader.read()` —— 它允许我们等待新数据的到来。

下面是 `walk` 函数的实现，用于把占位符替换成 Promise：

```
 function walk(node) {
   if (isPromisePlaceholder(node)) {
     return new Promise((done) => {
       promises.set(node, done);
     });
   }
   if (Array.isArray(node)) {
     return node.map((item) => walk(item));
   }
   if (node && typeof node === "object") {
     const out = {};
     for (const [key, val] of Object.entries(node)) {
       out[key] = walk(val);
     }
     return out;
   }
   return node;
 }

 function isPromisePlaceholder(val) {
   return typeof val === "string" && val.match(/^_\$(\d)/);
 }
```
这个函数的逻辑与服务器端的 `normalize` 函数非常相似。当遇到一个占位符时，它返回一个新的 Promise，等实际数据到达时再解析。数组和对象会递归处理，原始值则直接返回。当然，占位符 ID 必须与服务器生成的保持一致。

完整实现可以在文中提供的链接中查看：https://github.com/krasimir/streamson/blob/main/packages/streamson/lib/client.js

服务端与客户端的代码加起来一共只有 155 行 😎。

#### NPM 包：Streamson

是的，它已经被打包成了一个 NPM 库 —— Streamson！ 👨

用占位符分块流式传输 JSON，是一种非常有趣的技术。它能显著提升 Web 应用的 “感知性能”，特别是在处理大型数据集或动态生成的数据时。通过让服务器在数据就绪时立刻发送分块，我们可以让客户端更早开始渲染页面，从而带来更好的用户体验。

你只需要同时掌控服务器和客户端，大约 200 行 JavaScript 代码 就能实现。

我把这套代码封装成了一个 NPM 库，名字就叫 Streamson。

你可以通过以下命令安装：

```
 npm install streamson
```
在服务器上使用方式如下：

```
 import { serve } from "streamson";
 import express from "express";

 const app = express();
 const port = 5009;

 app.get("/data", async (req, res) => {
   const myData = {
     title: "My Blog",
     description: "A simple blog example using Streamson",
     posts: getBlogPosts(), // 返回一个 Promise
   };
   serve(res, myData);
 });

 app.listen(port, () => {
   console.log(`示例应用已启动，监听端口 ${port}`);
 });
```
客户端部分只需要大约 1KB 的 JavaScript，可以从这里下载：https://unpkg.com/streamson@latest/dist/streamson.min.js

引入后，你会得到一个全局函数 `Streamson`，可以像这样使用：

```
 const request = Streamson("/data");

 const data = await request.get();
 console.log(data.title); // "My Blog"

 const posts = await request.get("posts");
 console.log(posts); // 博客文章数组
```
祝你流式传输愉快！🚀

关于本文  
译者：@飘飘  
作者：@KrasimirTsonev  
原文：https://krasimirtsonev.com/blog/article/streaming-json-in-just-200-lines-of-javascript

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
