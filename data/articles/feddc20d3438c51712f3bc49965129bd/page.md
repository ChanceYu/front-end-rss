---
title: "常被忽视的 Node.js 功能，彻底改善了日志体验"
link: "http://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623789&idx=2&sn=ac04573daaee6ca8ff6399f774435419&chksm=802246acb755cfba4af86352b0c5719a05287877999a49fbb1c0f8a1d5afe35d6bb46037b70c#rd"
date: 2026-01-12
md5: feddc20d3438c51712f3bc49965129bd
---

# 常被忽视的 Node.js 功能，彻底改善了日志体验

> 译者：@飘飘  
> 作者：@Amit Kumar  
> 原文：https://amit08255.medium.com/the-overlooked-node-js-feature-that-makes-logs-finally-useful-d64731af16a5

  

这次探索的故事要从几个月前的一个凌晨 2 点讲起。

某个客户的支付失败了。我 通过 SSH 登录到生产环境，随即就看到了就是一整屏滚动不停的日志。

我半睡半醒地坐在那里，一行行地刷日志，心想：“数据肯定在某个地方”。我知道这些数据很重要，也确实存在，但我就是找不到。这种挫败感真的很强。

每一行日志都是一个碎片。它们和真正触发它们的请求毫无关联。只有我，一个人，凌晨 2 点盯着终端，瞎猜哪些日志是属于同一个请求的。

大家常用的临时解决方案就是手动在每个函数中传递一个关联 ID。但这会把代码搞得乱七八糟。每个函数的参数里都塞了些和函数本身逻辑无关的东西。

最后，我终于找到一个更好的办法。我写出了一个真正愿意放到生产环境里的方案。

### 传统的 Node.js 日志问题

日志很重要，这是大家都知道。所以我用 Pino 的原因。它速度快，还能输出整洁的 JSON。

但 JSON 再干净，如果日志讲不出一个故事，也没什么意义。我需要把这些点连起来，需要知道每条日志和对应请求之间的关系。

我先从一个最基础的方案讲起：写一个中间件生成 request ID，用它创建带有该 ID 的 logger，并在请求开始与结束时记录日志。

```
 // app.js
 import { randomUUID } from "node:crypto";
 import { performance } from "node:perf_hooks";
 import express from "express";
 import pino from "pino";

 const logger = pino();

 const app = express();

 app.use(express.json());

 app.use((req, res, next) => {
   const start = performance.now();
   const requestId = req.headers["x-request-id"] || randomUUID();

   const { method, url, ip, headers } = req;
   const userAgent = headers["user-agent"];

   const reqLogger = logger.child({
     "request.id": requestId,
   });

   reqLogger.info(
     {
       "http.request.method": method,
       "url.path": url,
       "client.address": ip,
       "user_agent.original": userAgent,
     },
     `incoming ${method} request to ${url}`,
   );

   res.on("finish", () => {
     const { statusCode } = res;

     const logData = {
       duration_ms: performance.now() - start,
       status_code: statusCode,
     };

     if (statusCode >= 500) {
       reqLogger.error(logData, "server error");
     } else if (statusCode >= 400) {
       reqLogger.warn(logData, "client error");
     } else {
       reqLogger.info(logData, "request completed");
     }
   });

   next();
 });

 async function fetchUser(id) {
   const response = await fetch(
     `https://jsonplaceholder.typicode.com/users/${id}`,
   );

   if (!response.ok) {
     throw new Error(
       `Failed to fetch user: ${response.status} ${response.statusText}`,
     );
   }

   const user = await response.json();

   logger.info(`profile info for user ${user.id} retrieved successfully`);

   return user;
 }

 app.get("/fetch-user", async (req, res) => {
   const userID = Math.floor(Math.random() * 10) + 1;

   logger.info("fetching user data");

   const user = await fetchUser(userID);

   res.json(user);
 });

 app.listen(3000, () => {
   logger.info("Server listening on port 3000");
 });
```
我启动服务并访问接口。刚开始日志看起来还不错，格式整洁的 JSON：

```
 {...,"request.id":"e96b0e3d-4812-4358-8bd1-f0f907156a45","http.request.method":"GET","url.path":"/fetch-user","client.address":"::1","user_agent.original":"curl/8.7.1","msg":"incoming
  GET request to /fetch-user"}
 {...,"msg":"fetching user data"}
 {...,"msg":"profile info for user 3 retrieved successfully"}
 {...,"request.id":"e96b0e3d-4812-4358-8bd1-f0f907156a45","duration_ms":3.5279169999998885,"status_code":200,"msg":"request completed"}
```
但如果仔细看，你会发现它们之间其实没有任何联系。在生产环境里上千个请求同时发生时，这种孤立的日志完全没法用来排查问题。

一种常见的改进方式是在 logger 中添加请求上下文，比如 request ID：

```
 app.use((req, res, next) => {
   [...]

   const reqLogger = logger.child({
     "request.id": requestId,
   });

   req.log = reqLogger;

   [...]
 });

 app.get("/fetch-user", async (req, res) => {
   const userID = Math.floor(Math.random() * 10) + 1;

   req.log.info("fetching user data");

   const user = await fetchUser(userID);

   res.json(user);
 });
```
这确实能解决一些问题。短暂地。

但问题在于，要保持上下文一致，我必须把 req 或 req.log 一路往下传给所有函数。

这就是参数传递地狱（parameter drilling）。问题非常大。

它会让代码里的函数充斥着与实际功能无关的参数。

于是问题来了：我该怎样才能让 logger 在代码的任何地方都能拿到上下文？

#### 在 Node.js 中实现上下文感知日志

我准备把应用重构一下，改用 AsyncLocalStorage。

```
 import { AsyncLocalStorage } from "node:async_hooks";

 const asyncLocalStorage = new AsyncLocalStorage();

 app.use((req, res, next) => {
   . . .

   const store = new Map();

   asyncLocalStorage.run(store, () => {
     // 把带上下文的 logger 存入 AsyncLocalStorage
     asyncLocalStorage.getStore().set("logger", reqLogger);

     next();
   });
 });

 function getLogger() {
   // 如果当前处于请求上下文，就返回对应 logger，否则返回基础 logger
   return asyncLocalStorage.getStore()?.get("logger") || logger;
 }
```
在上面的例子中，我创建了一个在整个请求生命周期内都能保持的上下文环境。它能在所有 async/await 调用链中保持不丢。

现在，代码中的任何位置都可以通过 `getLogger()` 获取当前请求对应的 logger。`AsyncLocalStorage` 会负责返回正确的日志记录器。

下面是实际应用的样子：

```
 async function fetchUser(id) {
   const response = await fetch(
     `https://jsonplaceholder.typicode.com/users/${id}`,
   );

   if (!response.ok) {
     throw new Error(
       `Failed to fetch user: ${response.status} ${response.statusText}`,
     );
   }

   const user = await response.json();

   getLogger().info(`profile info for user ${id} retrieved successfully`);

   return user;
 }

 app.get("/fetch-user", async (req, res) => {
   const userID = Math.floor(Math.random() * 10) + 1;

   getLogger().info("fetching user data");

   const user = await fetchUser(userID);

   res.json(user);
 });
```
现在再运行服务器，你会发现每一条日志都带着同一个请求 ID。从头到尾都是一条清晰可过滤的 “故事线”：

```
 {...,"request.id":"e96b0e3d-4812-4358-8bd1-f0f907156a45","http.request.method":"GET","url.path":"/fetch-user","client.address":"::1","user_agent.original":"curl/8.7.1","msg":"incoming
  GET request to /fetch-user"}
 {...,"request.id":"e96b0e3d-4812-4358-8bd1-f0f907156a45","msg":"fetching user data"}
 {...,"request.id":"e96b0e3d-4812-4358-8bd1-f0f907156a45","msg":"profile info for user 3 retrieved successfully"}
 {...,"request.id":"e96b0e3d-4812-4358-8bd1-f0f907156a45","duration_ms":3.5279169999998885,"status_code":200,"msg":"request completed"}
```
每一行都用同一个 ID 串起来了。

#### 更优雅地添加更多上下文

随着应用规模变大，我希望在日志里加入更多上下文信息。

于是我想到写一个可复用的辅助函数。这个 helper 会创建子 logger，并在正确的上下文环境中运行代码，这样我就不用在每个地方重复逻辑了：

```
 function withLogContext(data, callback) {
   const store = asyncLocalStorage.getStore();
   // 获取当前上下文的 logger，没有就用基础 logger
   const parentLogger = store?.get("logger") || logger;

   // 基于新数据创建一个子 logger
   const childLogger = parentLogger.child(data);

   // 创建一个继承父上下文的新 store
   const newStore = new Map(store);
   // 用新的子 logger 覆盖掉旧的 logger
   newStore.set("logger", childLogger);

   // 在这个增强了的上下文里运行 callback
   return asyncLocalStorage.run(newStore, callback);
 }
```
这个小巧的封装就是对 `asyncLocalStorage.run()` 的一次优雅抽象。有了它，请求日志的中间件就能更简洁：

```
 app.use((req, res, next) => {
   // ... 请求日志逻辑保持不变

   withLogContext({ "request.id": requestId }, next);
 });
```
这个简单又优美的模式可以很好地扩展。现在，每当需要添加一些额外的上下文时，用一下就可以了。

比如现在我想给所有日志加上 user.id：

```
 app.get("/fetch-user", (req, res) => {
   const userID = Math.floor(Math.random() * 10) + 1;

   withLogContext({ "user.id": userID }, async () => {
     getLogger().info("fetching user data");

     const user = await fetchUser(userID);

     res.json(user);
   });
 });
```
最终的日志输出就会包含所有上下文信息：

```
 {...,"request.id":"d48ed676-ecd3-4a4b-8514-f494bcaa1ad2","http.request.method":"GET","url.path":"/fetch-user","client.address":"::1","user_agent.original":"curl/8.7.1","msg":"incoming
  GET request to /fetch-user"}
 {...,"request.id":"d48ed676-ecd3-4a4b-8514-f494bcaa1ad2","user.id":7,"msg":"fetching user data"}
 {...,"request.id":"d48ed676-ecd3-4a4b-8514-f494bcaa1ad2","user.id":7,"msg":"profile info for user 7 retrieved successfully"}
 {...,"request.id":"d48ed676-ecd3-4a4b-8514-f494bcaa1ad2","duration_ms":3.618416000000252,"status_code":200,"msg":"request completed"}
```
现在日志不仅一致，而且包含真正有助于观察性（observability）的上下文。

#### 用 OpenTelemetry 走得更远

OpenTelemetry 把这种模式标准化了，它内置了追踪（tracing）和指标（metrics）。

OpenTelemetry 提供更丰富、标准化的标识符，比如 trace\_id 和 span\_id。底层上，它在 Node.js 中也使用 AsyncLocalStorage 来管理每个请求的上下文。

我只需要先安装依赖：

```
 npm install @opentelemetry/api @opentelemetry/auto-instrumentations-node
```
启动应用时，加载自动探测脚本：

```
 OTEL_SERVICE_NAME=mynodeapp node --require @opentelemetry/auto-instrumentations-node/register app.js
```
这样 OpenTelemetry 就会初始化，并自动为像 Express、Pino 这些常用库启用 instrumentation。

启用后，我的日志会自动加上当前追踪上下文：

```
 {
   [...],
   "trace_id": "6c01f40ea85a45fa34ecafe102e56b3c",
   "span_id": "5239529039006e9c",
   "trace_flags": "01",
   "request.id": "00f2de3e-62b2-4296-979f-208151f5ccd2",
   "user.id": 10,
   "msg": "fetching user data"
 }
```
#### 最后

正如我们前面看到的，出现 “孤立日志行” 会让调试变得非常痛苦。

AsyncLocalStorage 能让我们创建一个稳定、与请求绑定的上下文。它使日志能够带着上下文穿越所有异步边界，不再丢失关联。

这些简单的模式帮助我构建了一个上下文感知的日志系统，大大提升了生产环境中的调试效率。

推荐阅读  点击标题可跳转

1、[常被忽视的 Node.js 功能，彻底改善了日志体验](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623408&idx=2&sn=c0f1218f1089aa8d06f5609096148638&scene=21#wechat_redirect)

2、[2025年 Node.js 新模式](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623228&idx=1&sn=08d29060a8b3eed2e94f7735b8b55209&scene=21#wechat_redirect)

3、[NodeJS+LLM搭建一个属于自己的知识库](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651622717&idx=1&sn=26366b5c3852a4cb292d9aade0842846&scene=21#wechat_redirect)
