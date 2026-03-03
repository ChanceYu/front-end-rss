---
title: "【第3629期】2025版现代 Node.js 开发模式"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278227&idx=1&sn=15f7d73db285cdb284e2a5bfd0aee702&chksm=bc5dc1e373c4cd90799524d0ffa1fef4d2b478da982e8164ffe2aca49bcb446c319715c2c53a&scene=0#rd"
date: 2025-12-23
md5: 0d4f2b8c8af212bd56984e726f7caef4
---

# 【第3629期】2025版现代 Node.js 开发模式

前言

还在用旧版的 CommonJS、axios、nodemon？2025 年的 Node.js 已经自带更强大的工具链：原生 Fetch、Watch 模式、内置测试、单文件打包…… 这篇文章帮你用最通俗的方式，快速上手 Node.js 的现代开发新姿势。

今日前端早读课文章由 @Ashwin 分享，@飘飘编译。

译文从这开始～～

![图片](./images/593a81c405e6e7beeb976186a3122cfa.png)

#### 现代 Node.js 开发工作流

自诞生以来，Node.js 经历了令人惊叹的转变。如果你已经写了好几年 Node.js 代码，那么一定亲眼见证了它从 “回调地狱、CommonJS 一统天下” 的年代，走向如今 “简洁、基于标准” 的现代开发体验。

这些变化并非只是表面功夫；它们代表着我们在服务器端 JavaScript 开发方式上的根本转变。现代的 Node.js 拥抱 Web 标准、减少外部依赖，并让开发体验更加直观。下面我们来看看这些变化，以及它们对 2025 年的应用开发意味着什么。

[【第3620期】从崩溃到优雅：Node.js 错误处理的正确姿势](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278024&idx=1&sn=60cc64389d04ede80e9340f888a8fc1a&scene=21#wechat_redirect)

#### 1\. 模块系统：ESM 成为新标准

模块系统的变化可能是你最明显能感受到的部分。CommonJS 曾经功不可没，但如今 ES Modules（ESM）已成为主流，它拥有更好的工具支持，并与 Web 标准保持一致。

##### 旧的写法（CommonJS）

过去我们是这样组织模块的，需要显式导出和同步导入：

```
 // math.js
 function add(a, b) {
   return a + b;
 }
 module.exports = { add };

 // app.js
 const { add } = require('./math');
 console.log(add(2, 3));
```
这种方式虽可用，但存在明显限制 —— 无法静态分析、不支持 tree-shaking，而且与浏览器标准不兼容。

[【第3614期】常被忽视的 Node.js 功能，彻底改善了日志体验](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277957&idx=1&sn=f82c3d371bd6336a7ade9a37849bbe90&scene=21#wechat_redirect)

##### 新的写法（带 node: 前缀的 ESM）

现代 Node.js 采用了 ESM 模块系统，并引入了关键的 `node:` 前缀，用来区分内置模块与外部依赖，这种明确的命名方式避免了混淆，并使依赖关系一目了然：

```
 // math.js
 export function add(a, b) {
   return a + b;
 }

 // app.js
 import { add } from './math.js';
 import { readFile } from 'node:fs/promises';  // 现代 node: 前缀
 import { createServer } from 'node:http';

 console.log(add(2, 3));
```
`node:` 前缀不仅是一种命名约定，更是一种明确的信号：告诉开发者和工具，这里引入的是 Node.js 内置模块，而非 npm 包，避免冲突，让依赖更透明。

##### 顶层 await：简化初始化流程

另一项革命性特性就是 “顶层 await”。不再需要为了使用 `await` 而把整个程序包在一个异步函数里：

```
 // app.js - 无需额外包装函数
 import { readFile } from 'node:fs/promises';

 const config = JSON.parse(await readFile('config.json', 'utf8'));
 const server = createServer(/* ... */);

 console.log('App started with config:', config.appName);
```
这让代码更直观、更线性，避免了早期常见的 IIFE（立即执行异步函数）写法。

#### 2\. 内置 Web API：减少外部依赖

Node.js 如今大力拥抱 Web 标准，把许多前端开发者熟悉的 API 直接带入运行时。这意味着依赖更少、前后端一致性更高。

[【早阅】深入理解 Web Components：如何利用自定义元素和 Shadow DOM 打造可复用表单组件？](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278080&idx=1&sn=8c662524c3c1d64fff6d988898dbe8bd&scene=21#wechat_redirect)

##### Fetch API：告别第三方 HTTP 库

过去每个项目几乎都需要 axios、node-fetch 等库来发请求。如今，这些都可以直接用内置的 Fetch API 完成：

```
 // 旧方式 - 需要外部库
 const axios = require('axios');
 const response = await axios.get('https://api.example.com/data');

 // 新方式 - 内置 fetch，功能更强
 const response = await fetch('https://api.example.com/data');
 const data = await response.json();
```
现代 Fetch 不仅替代了 HTTP 库，还内置了超时与取消机制：

```
 async function fetchData(url) {
   try {
     const response = await fetch(url, {
       signal: AbortSignal.timeout(5000) // 内置超时控制
     });

     if (!response.ok) {
       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
     }

     return await response.json();
   } catch (error) {
     if (error.name === 'TimeoutError') {
       throw new Error('请求超时');
     }
     throw error;
   }
 }
```
这种方法消除了对超时库的需求，并提供了统一的错误处理体验。 `AbortSignal.timeout()` 方法尤其优雅 —— 它创建了一个信号，在指定时间过后会自动中止。

##### AbortController：优雅的取消操作

现代应用必须支持 “优雅取消”，无论是用户手动中止，还是系统超时。`AbortController` 提供了标准化的取消机制：

```
 const controller = new AbortController();
 setTimeout(() => controller.abort(), 10000);

 try {
   const data = await fetch('https://slow-api.com/data', {
     signal: controller.signal
   });
   console.log('Data received:', data);
 } catch (error) {
   if (error.name === 'AbortError') {
     console.log('请求被取消（预期行为）');
   } else {
     console.error('发生意外错误：', error);
   }
 }
```
这种模式适用于许多 Node.js API，而不仅仅是 fetch。可以将同一个 AbortController 用于文件操作、数据库查询以及任何支持取消的异步操作。

#### 3\. 内置测试框架：无需依赖即可专业测试

过去进行测试时，需要在 Jest、Mocha、Ava 等框架中做选择。如今，Node.js 已内置功能完善的测试运行器，足以满足大多数需求，且无需任何外部依赖。

[【第3596期】如何测试 MCP 服务器](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277525&idx=1&sn=7209045fa96c5bc1313b1770f6dbe527&scene=21#wechat_redirect)

##### 使用 Node.js 自带的测试工具

内置的测试运行程序提供了一个简洁、熟悉的 API，给人的感觉既现代又完备：

```
 // test/math.test.js
 import { test, describe } from 'node:test';
 import assert from 'node:assert';
 import { add, multiply } from '../math.js';

 describe('Math functions', () => {
   test('adds numbers correctly', () => {
     assert.strictEqual(add(2, 3), 5);
   });

   test('handles async operations', async () => {
     const result = await multiply(2, 3);
     assert.strictEqual(result, 6);
   });

   test('throws on invalid input', () => {
     assert.throws(() => add('a', 'b'), /Invalid input/);
   });
 });
```
其特别强大的地方在于它与 Node.js 开发工作流的无缝集成：

```
 # 运行所有测试
 node --test

 # 开启 watch 模式
 node --test --watch

 # 输出覆盖率报告（Node.js 20+）
 node --test --experimental-test-coverage
```
`--watch` 模式在开发时特别方便 —— 修改代码后会自动重新运行测试。

#### 4\. 进化的异步模式

虽然 async/await 已经不新鲜，现代 Node.js 开发更有效地利用了这些模式，并将其与更新的 API 相结合。

##### 更完善的错误处理

现代写法结合 async/await 与结构化错误处理，实现更高的健壮性与并行性能：

```
 import { readFile, writeFile } from 'node:fs/promises';

 async function processData() {
   try {
     // 并行执行多个独立操作
     const [config, userData] = await Promise.all([
       readFile('config.json', 'utf8'),
       fetch('/api/user').then(r => r.json())
     ]);

     const processed = processUserData(userData, JSON.parse(config));
     await writeFile('output.json', JSON.stringify(processed, null, 2));

     return processed;
   } catch (error) {
     console.error('处理失败：', {
       message: error.message,
       stack: error.stack,
       time: new Date().toISOString()
     });
     throw error;
   }
 }
```
这种模式将并行执行以提高性能与全面的错误处理相结合。 `Promise.all()` 确保独立的操作能够并发运行，而 `try/catch` 则提供了一个单一的错误处理点，并带有丰富的上下文信息。

##### 使用 AsyncIterator 的现代事件处理

事件驱动模式也变得更优雅。使用 `AsyncIterator` 可以像遍历数据流一样处理事件：

```
 import { EventEmitter } from 'node:events';

 class DataProcessor extends EventEmitter {
   async *processStream() {
     for (let i = 0; i < 10; i++) {
       this.emit('data', `chunk-${i}`);
       yield `processed-${i}`;
       await new Promise(r => setTimeout(r, 100));
     }
     this.emit('end');
   }
 }

 // 消费异步事件流
 const processor = new DataProcessor();
 for await (const result of processor.processStream()) {
   console.log('Processed:', result);
 }
```
这种方式将事件的灵活性与异步控制流结合起来，让处理事件流更加自然、有序，并能优雅地中断或管理背压。

[【第3560期】事件驱动架构 vs 请求-响应架构：2025 开发者完整指南](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277094&idx=1&sn=58c57bd761c2c42527c829c989c2d537&scene=21#wechat_redirect)

#### 5\. 高级流处理与 Web 标准集成

流（Streams）依然是 Node.js 最强大的特性之一，但它们已经进化为遵循 Web 标准，并能更好地与其他环境互通。

##### 现代流处理方式

如今的流处理更直观，API 更友好、逻辑更清晰：

```
 import { Readable, Transform } from 'node:stream';
 import { pipeline } from 'node:stream/promises';
 import { createReadStream, createWriteStream } from 'node:fs';

 // 使用清晰聚焦的逻辑创建 Transform 流
 const upperCaseTransform = new Transform({
   objectMode: true,
   transform(chunk, encoding, callback) {
     this.push(chunk.toString().toUpperCase());
     callback();
   }
 });

 // 带有健壮错误处理的文件流处理
 async function processFile(inputFile, outputFile) {
   try {
     await pipeline(
       createReadStream(inputFile),
       upperCaseTransform,
       createWriteStream(outputFile)
     );
     console.log('文件处理成功');
   } catch (error) {
     console.error('Pipeline 出错：', error);
     throw error;
   }
 }
```
`pipeline`（基于 Promise）函数会自动进行资源清理和错误处理，解决了传统流处理中常见的痛点。

##### 与 Web Streams 的互操作性

现代 Node.js 能无缝地与 Web Streams 协作，实现与浏览器端代码和边缘运行环境更好的兼容性：

```
 // 创建一个兼容浏览器的 Web Stream
 const webReadable = new ReadableStream({
   start(controller) {
     controller.enqueue('Hello ');
     controller.enqueue('World!');
     controller.close();
   }
 });

 // 在 Web Streams 和 Node.js 流之间互转
 const nodeStream = Readable.fromWeb(webReadable);
 const backToWeb = Readable.toWeb(nodeStream);
```
这种互操作性对于需要在服务器、浏览器或边缘平台之间共享代码的应用来说尤为重要。

#### 6\. Worker Threads：为 CPU 密集型任务带来真正的并行能力

JavaScript 的单线程特性并不适合所有任务。Worker Threads 提供了一种在保持 JavaScript 简洁性的同时，充分利用多核 CPU 的方法。

[【第3414期】提升ServiceWorker性能的新特性](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651274047&idx=1&sn=e050284c131e4103221044fa52834fd8&scene=21#wechat_redirect)

##### 后台计算不阻塞主线程

Worker Threads 非常适合执行那些会阻塞事件循环的高计算量任务：

```
 // worker.js - 独立计算环境
 import { parentPort, workerData } from 'node:worker_threads';

 function fibonacci(n) {
   if (n < 2) return n;
   return fibonacci(n - 1) + fibonacci(n - 2);
 }

 const result = fibonacci(workerData.number);
 parentPort.postMessage(result);
```
主程序可以异步委托繁重的计算任务，同时保持响应性：

```
 // main.js - 非阻塞的主应用
 import { Worker } from 'node:worker_threads';
 import { fileURLToPath } from 'node:url';

 async function calculateFibonacci(number) {
   return new Promise((resolve, reject) => {
     const worker = new Worker(
       fileURLToPath(new URL('./worker.js', import.meta.url)),
       { workerData: { number } }
     );

     worker.on('message', resolve);
     worker.on('error', reject);
     worker.on('exit', (code) => {
       if (code !== 0) reject(new Error(`Worker 停止运行，退出码 ${code}`));
     });
   });
 }

 console.log('开始计算...');
 const result = await calculateFibonacci(40);
 console.log('计算结果：', result);
 console.log('主应用始终保持响应！');
```
这种模式能在保持异步编程模型（async/await）的同时，充分利用多核性能。

#### 7\. 提升开发体验

现代 Node.js 更加注重开发者体验，许多以前依赖外部包的功能，如今都已内置。

##### Watch 模式与环境管理

通过内置的 `--watch` 和 `--env-file` 功能，开发流程大大简化：

```
 {
   "name": "modern-node-app",
   "type": "module",
   "engines": {
     "node": ">=20.0.0"
   },
   "scripts": {
     "dev": "node --watch --env-file=.env app.js",
     "test": "node --test --watch",
     "start": "node app.js"
   }
 }
```
`--watch` 不再需要 nodemon，`--env-file` 替代 dotenv，开发环境更轻量：

```
 // .env 文件会被自动加载
 // DATABASE_URL=postgres://localhost:5432/mydb
 // API_KEY=secret123

 // app.js
 console.log('连接数据库：', process.env.DATABASE_URL);
 console.log('API Key 加载成功：', !!process.env.API_KEY);
```
这些特性通过减少配置与重启，让开发更加高效顺畅。

截至 Node.js 22，--watch 与 --env-file 功能已成为标准特性，无需任何实验标志。

#### 8\. 现代安全与性能监控

Node.js 现已内置安全与性能监控机制，为应用运行保驾护航。

##### 权限模型：更严格的安全控制

实验性的权限模型允许你严格限制应用访问范围，遵循 “最小权限原则”：

```
 # 限制文件系统访问范围
 node --experimental-permission --allow-fs-read=./data --allow-fs-write=./logs app.js

 # 限制网络访问（即将支持）
 node --experimental-permission --allow-net=api.example.com app.js
```
这对于执行不受信任代码或需要符合安全合规的应用尤其有用。

权限模型仍为实验性功能，但已新增网络访问控制选项（--allow-net），预计将在 Node.js 23 正式发布中稳定。

##### 内置性能监控

无需外部 APM 工具，Node.js 内置性能分析功能：

[【早阅】使用 Favicon 监控长时间进程](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651274333&idx=1&sn=74014cee3a67074103559f5f76d8676e&scene=21#wechat_redirect)

```
 import { PerformanceObserver, performance } from 'node:perf_hooks';

 const obs = new PerformanceObserver((list) => {
   for (const entry of list.getEntries()) {
     if (entry.duration > 100) {
       console.log(`慢操作：${entry.name} 耗时 ${entry.duration}ms`);
     }
   }
 });
 obs.observe({ entryTypes: ['function', 'http', 'dns'] });

 async function processLargeDataset(data) {
   performance.mark('start');
   const result = await heavyProcessing(data);
   performance.mark('end');
   performance.measure('data-processing', 'start', 'end');
   return result;
 }
```
这提供了无需外部依赖的应用程序性能可见性，有助于您在开发早期识别瓶颈。

#### 9\. 应用分发与部署

现代 Node.js 让打包与分发更简单，例如 “一键生成可执行文件” 的功能。

##### 单文件可执行应用

你可以将整个应用打包为一个独立可执行文件，方便部署：

```
 node --experimental-sea-config sea-config.json
```
配置文件示例：

```
 {
   "main": "app.js",
   "output": "my-app-bundle.blob",
   "disableExperimentalSEAWarning": true
 }
```
这对 CLI 工具、桌面应用等场景尤其有用，用户无需额外安装 Node.js。

截至 Node.js 22，SEA（单文件可执行打包）仍在实验阶段，但已可稳定用于生产环境的部分 CLI 工具。

#### 10\. 现代错误处理与诊断

Node.js 的错误管理已从简单的 try/catch 进化为结构化的错误处理与诊断系统。

##### 结构化错误处理

现代应用可通过自定义错误类，提供更丰富的上下文信息：

```
 class AppError extends Error {
   constructor(message, code, statusCode = 500, context = {}) {
     super(message);
     this.name = 'AppError';
     this.code = code;
     this.statusCode = statusCode;
     this.context = context;
     this.timestamp = new Date().toISOString();
   }

   toJSON() {
     return {
       name: this.name,
       message: this.message,
       code: this.code,
       statusCode: this.statusCode,
       context: this.context,
       timestamp: this.timestamp,
       stack: this.stack
     };
   }
 }

 throw new AppError(
   '数据库连接失败',
   'DB_CONNECTION_ERROR',
   503,
   { host: 'localhost', port: 5432, retryAttempt: 3 }
 );
```
这种结构化的错误信息可直接用于日志、监控或告警系统。

##### 高级诊断工具

Node.js 的诊断通道（Diagnostics Channel）能帮助你深入了解应用内部行为：

```
 import diagnostics_channel from 'node:diagnostics_channel';

 const dbChannel = diagnostics_channel.channel('app:database');

 dbChannel.subscribe((msg) => {
   console.log('数据库操作：', msg);
 });

 async function queryDatabase(sql, params) {
   const start = performance.now();
   try {
     const result = await db.query(sql, params);
     dbChannel.publish({
       operation: 'query',
       sql,
       params,
       duration: performance.now() - start,
       success: true
     });
     return result;
   } catch (error) {
     dbChannel.publish({
       operation: 'query',
       sql,
       params,
       duration: performance.now() - start,
       success: false,
       error: error.message
     });
     throw error;
   }
 }
```
这些数据可供监控系统消费、记录日志，甚至触发自动恢复机制。

#### 11\. 现代包管理与模块解析

包管理与模块解析系统更强大，支持 monorepo、内部包和灵活模块路径。

##### Import Maps 与内部模块路径

通过 Import Maps，可定义项目内部模块别名，避免路径混乱：

```
 {
   "imports": {
     "#config": "./src/config/index.js",
     "#utils/*": "./src/utils/*.js",
     "#db": "./src/database/connection.js"
   }
 }
```
清晰的内部引用方式：

```
import config from'#config';
import{ logger, validator }from'#utils/common';
import db from'#db';
```
这让重构更安全，也让依赖关系更明确。

##### 动态导入：灵活的模块加载

动态导入支持复杂的加载模式，包括条件加载和代码分割：动态导入能实现条件加载和代码拆分：

```
 async function loadDatabaseAdapter() {
   const dbType = process.env.DATABASE_TYPE || 'sqlite';
   try {
     const adapter = await import(`#db/adapters/${dbType}`);
     return adapter.default;
   } catch {
     console.warn(`未找到 ${dbType} 适配器，使用 sqlite 作为回退`);
     const fallback = await import('#db/adapters/sqlite');
     return fallback.default;
   }
 }

 async function loadOptionalFeatures() {
   const features = [];
   if (process.env.ENABLE_ANALYTICS === 'true') {
     const analytics = await import('#features/analytics');
     features.push(analytics.default);
   }
   if (process.env.ENABLE_MONITORING === 'true') {
     const monitoring = await import('#features/monitoring');
     features.push(monitoring.default);
   }
   return features;
 }
```
这让应用能根据环境自动加载所需模块，实现 “按需加载”。

#### 2025 年现代 Node.js 的关键要点

当审视当前 Node.js 开发的状态时，几个关键原则逐渐浮现：

- 拥抱 Web 标准：使用 `node:` 前缀、`fetch`、`AbortController`、Web Streams 等标准化 API
- 利用内置工具：测试框架、Watch 模式、环境文件支持，减少依赖
- 采用现代异步模式：顶层 await、结构化错误、异步迭代器
- 合理使用 Worker Threads：为 CPU 密集型任务实现真正并行
- 强化安全与监控：权限模型、诊断通道、性能监控
- 优化开发体验：Watch 模式、Import Maps 提升开发效率
- 简化部署：单文件可执行与现代打包方式让分发更简单

Node.js 已从单纯的 JavaScript 运行时，成长为一个完善的现代开发平台。这一转变令人瞩目。采用这些模式，你不仅能写出更现代的代码，还能构建更高性能、更易维护、与 Web 标准深度兼容的应用。

现代 Node.js 的魅力在于：持续演进，同时保持向后兼容。你可以循序渐进地引入这些特性，与现有代码共存。无论是新项目还是旧系统的现代化改造，这些模式都为未来几年 Node.js 应用开发提供了清晰的方向。

> 本文作者最初写于 2025 年 5 月，部分实验性功能（如权限模型、Import Maps、单文件打包 SEA）截至 Node.js 22 仍处于实验阶段。但核心特性如 ESM、Fetch、Worker Threads、Watch 模式等均已稳定，完全适用于生产环境。

关于本文  
译者：@飘飘  
作者：@Ashwin  
原文：https://kashw1n.com/blog/nodejs-2025/

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
