---
title: "前端性能革命：200 行 JavaScript 代码实现 Streaming JSON"
link: "http://mp.weixin.qq.com/s?__biz=MzI3NTM5NDgzOA==&mid=2247517503&idx=1&sn=a26713fc5534e848ae8f2889a9252833&chksm=eb07bd46dc7034503a81cfa77690f663e1513186917305282817a04f10be8bc1669275990876#rd"
date: 2026-01-07
md5: a69d46b8b70569514c1ced2461c19d9c
---

# 前端性能革命：200 行 JavaScript 代码实现 Streaming JSON

## 1\. 前言

5 月的时候，React 的核心开发者 Dan 发表了一篇名为《Progressive JSON》 的文章，介绍了一种将 JSON 数据从服务器流式传输到客户端的技术，允许客户端在接收到全部数据之前就开始渲染部分数据。

**这可以显著提升用户体验，尤其是处理大型数据集时。**

让我们以“获取用户文章”这个场景为例。

这是一个完整的数据结构：

```
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "posts": [
      { "id": 101, "title": "First Post", "content": "..." },
      { "id": 102, "title": "Second Post", "content": "..." }
    ]
  }
}
```
假设我们能够很快获取用户信息，但文章数据还需要一段时间从数据库获取。

与其等待数据完全加载完毕，不如先发送一个占位符表示文章字段：

```
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "posts": "_$1"
  }
}
```
客户端收到数据后，先将用户信息渲染出来。

然后，当文章数据准备完毕后，我们将文章数据作为一个单独的 chunk 发送：

```
{
  "_$1": [
    { "id": 101, "title": "First Post", "content": "..." },
    { "id": 102, "title": "Second Post", "content": "..." }
  ]
}
```
客户端收到数据后，最后将文章数据渲染出来。

要实现这样一个功能，客户端需要具备处理这些占位符的能力，并在最终数据到达时替换为实际数据。

如果要实现这样一个单独的功能需要多少代码呢？

**200 行就可以！**

本篇文章和大家介绍下实现思路，供大家学习和思考使用。

## 2\. 服务端实现

让我们来看下服务器端实现。

首先是服务端函数。

```
function serve(res, data) {
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Transfer-Encoding", "chunked");

  // 向客户端发送 chunks
  res.write(JSON.stringify(...) + "\n");
  res.write(JSON.stringify(...) + "\n");

  // 当完成的时候
  res.end();
}
```
这里有 2 点值得注意：

1. **我们使用了 `application/x-ndjson`内容类型。**

NDJSON，全拼 Newline Delimited JSON，其实就是一种换行符分割的 JSON，其中每一行都是一个有效的 JSON 对象。这允许我们在单个响应中发送多个 JSON 对象，并以换行符分隔。

1. **我们使用了 `Transfer-Encoding: chunked`响应头。**

使用该响应头，可以通知客户端，响应将分块发送。在调用 `res.end()`之前，请保持连接活跃状态。

其次，我们需要对数据进行分块。

实现方式也很简单，遍历数据对象，并用占位符替代那些暂时没有准备好的部分。

当遇到需要稍后发送的部分（一个 Promise）时，我们将其存储到队列中，并在准备就绪后，将其作为单独的数据块发送。

函数如下：

```
function normalize(value) {
function walk(node) {
    if (isPromise(node)) {
      const id = getId();
      registerPromise(node, id);
      return id;
    }
    if (Array.isArray(node)) {
      return node.map((item) => walk(item));
    }
    if (node && typeof node === "object") {
      const out = {};
      for (const [key, val] ofObject.entries(node)) {
        out[key] = walk(val);
      }
      return out;
    }
    return node;
  }
return walk(value);
}
```
函数递归遍历数据对象。

当遇到 Promise 时，它会生成一个唯一的占位符 ID，注册该 Promise 以便稍后解析，并返回该占位符。

对于数组和对象，它会递归处理它们的元素或属性。原始值将按原样返回。

这是注册 Promise 的代码：

```
let promises = [];

function registerPromise(promise, id) {
  promises.push({ promise, id });
  promise.then((value) => {
    send(id, value);
  }).catch((err) => {
    console.error("Error resolving promise for path", err);
    send(id, { error: "promise error", timeoutMs: TIMEOUT });
  });
```
这是 `send` 的代码，`send`函数负责将解析后的数据发送给客户端：

```
function send(id, value) {
  res.write(JSON.stringify({ i: id, c: normalize(value) }) + "\n");
  promises = promises.filter((p) => p.id !== id);
  if (promises.length === 0) res.end();
}
```
该 `send` 函数会向响应中写入一个新的数据块，其中包括占位符 ID 和 normalize 后的值。然后它会从队列中移除已经 resolve 的 Promise。如果没有其他要处理的 Promise，它就会结束响应，从而关闭与客户端的连接。

完整的实现代码点击这里。

最后，我们举一个从服务端发送的对象示例：

```
const data = {
user: {
    id: 1,
    name: "John Doe",
    posts: fetchPostsFromDatabase(), // 返回一个 promise
  },
};

asyncfunction fetchPostsFromDatabase() {
const posts = await database.query("SELECT * FROM posts WHERE userId = 1");
return posts.map((post) => ({
    id: post.id,
    title: post.title,
    content: post.content,
    comments: fetchCommentsForPost(post.id), // 返回一个 promise
  }));
}
```
每篇文章还有一个评论字段（comments），该字段是一个 Promise 对象。意味着评论数据将在文章数据发送后，作为单独的片段发送。

## 3\. 客户端实现

那客户端该如何实现呢？

在客户端，我们处理传入的数据块，并将占位符替换为实际数据。

我们可以使用 Fetch API 向服务器发送请求，并将响应读取为流。每当遇到占位符时，我们都会将其替换为一个 Promise，该 Promise 将在实际数据到达时解析。

核心逻辑如下：

```
try {
    const res = await fetch(endpoint);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    asyncfunction process() {
      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          try {
            const chunk = JSON.parse(decoder.decode(value, { stream: true }));
            chunk.c = walk(chunk.c);
            if (promises.has(chunk.i)) {
              promises.get(chunk.i)(chunk.c);
              promises.delete(chunk.i);
            }
          } catch (e) {
            console.error(`Error parsing chunk.`, e);
          }
        }
      }
    }
    process();
  } catch (e) {
    console.error(e);
    thrownewError(`Failed to fetch data from Streamson endpoint ${endpoint}`);
  }
}
```
对流的处理，你可能感到陌生，可以拓展阅读我的这篇文章：《如何用 Next.js v14 实现一个 Streaming 接口？》

`process` 函数逐块读取响应流。每个数据块都被解析为 JSON，并调用 `walk` 函数将占位符替换为 Promise。

如果数据块包含先前注册的占位符 ID ，则相应的 Promise 会被解析为接收到的数据。关键在于 `await reader.read()`，它允许我们等待新数据到来。

`walk`函数用于将占位符替换为 Promise：

```
function walk(node) {
if (isPromisePlaceholder(node)) {
    returnnewPromise((done) => {
      promises.set(node, done);
    });
  }
if (Array.isArray(node)) {
    return node.map((item) => walk(item));
  }
if (node && typeof node === "object") {
    const out = {};
    for (const [key, val] ofObject.entries(node)) {
      out[key] = walk(val);
    }
    return out;
  }
return node;
}
function isPromisePlaceholder(val) {
returntypeof val === "string" && val.match(/^_\$(\d)/);
}
```
类似于服务端的 `normalize` 函数。当遇到占位符的时候，它会返回一个新的 Promise，该 Promise 将在实际数据到达时解析。对于数组和对象，它会递归处理它们的元素或属性。原始值则直接返回。当然，ID 必须与服务器端生成的 ID 匹配。

完整的实现代码点击这里。两个文件加起来一共 155 行代码。

## 4\. NPM 包

本篇文章整理翻译自 Streaming JSON in just 200 lines of JavaScript。

作者还将代码整理成了一个 NPM 包：Streamson。

通过 npm 安装：`npm intall streamson`

服务端上使用：

```
import { serve } from"streamson";
import express from"express";

const app = express();
const port = 5009;

app.get("/data", async (req, res) => {
const myData = {
    title: "My Blog",
    description: "A simple blog example using Streamson",
    posts: getBlogPosts(), // this returns a Promise
  };
  serve(res, myData);
});

app.listen(port, () => {
console.log(`Example app listening on port ${port}`);
});
```
客户端是一个 1KB 的 JavaScript 文件，地址：https://unpkg.com/streamson@latest/dist/streamson.min.js

客户端使用如下：

```
const request = Streamson("/data");

const data = await request.get();
console.log(data.title); // "My Blog"

const posts = await request.get("posts");
console.log(posts); // Array of blog posts
```
## 5\. 最后

流式传输 JSON 数据是一种提升 Web 应用感知性能的有效方法，尤其适用于处理大型数据集或动态生成数据。

通过在数据可用时立即发送部分数据，我们可以让客户端更早地开始渲染内容，从而带来更佳的用户体验。

  

---

  


- 我是 ssh，工作 6 年+，阿里云、字节跳动 Web infra 一线拼杀出来的资深前端工程师 + 面试官，非常熟悉大厂的面试套路，Vue、React 以及前端工程化领域深入浅出的文章帮助无数人进入了大厂。
- 欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2025 陪你一起度过！
- ![图片](./images/b5ad3289d79a880519f191ffa435f343.png)
- 关注公众号，发送消息：
  
  指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。
  
  简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。
  
  面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！
