---
title: "【第3630期】从依赖到原生：15 个 Node.js 新特性提升开发效率与安全性"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278232&idx=1&sn=d4c12993848286edfac7b9a0baa4c0ad&chksm=bc5a9538f69fe825d19e92b02aff91e8fb98a085583dd1082326ecb0187181313f8f4fff1c31&scene=0#rd"
date: 2025-12-24
md5: 37e5d72e0323f4468aa51f999344bfee
---

# 【第3630期】从依赖到原生：15 个 Node.js 新特性提升开发效率与安全性

前言

Node.js 正在不断进化，许多过去依赖第三方 npm 包的功能如今已原生内置。本文带你全面了解 15 个最新 Node.js 特性，帮助你精简依赖、提升开发效率与应用安全性。

今日前端早读课文章由 @Lizz Parody 分享，@飘飘编译。

译文从这开始～～

多年来，Node.js 开发者一直依赖无数 npm 包来弥补平台功能的不足。从 HTTP 工具到文件系统辅助函数，庞大的生态系统一直是 Node.js 的一大优势。但随着 Node.js 的不断演进，许多原本需要第三方包才能实现的功能，如今已经直接内置在运行时中了。

[【第3620期】从崩溃到优雅：Node.js 错误处理的正确姿势](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278024&idx=1&sn=60cc64389d04ede80e9340f888a8fc1a&scene=21#wechat_redirect)

这种变化减少了依赖臃肿，提高了安全性，也让应用更容易维护。如果你想要一个工具来跟踪 Node.js 中第三方包带来的安全风险，可以了解一下 N|Solid，https://nodesource.com/products/nsolid

本文将介绍一些能够替代热门 npm 包的 Node.js 原生新特性。

#### 1\. node-fetch → 全局 fetch ()

**之前：开发者需要安装** `node-fetch`，才能在 Node.js 中使用浏览器常见的 `fetch()` API。

**现在：从 Node.js 18 开始，**`fetch()` 已经成为全局函数，与浏览器版本几乎完全一致：

```
 const res = await fetch('https://api.github.com/repos/nodejs/node');
 const data = await res.json();
 console.log(data.full_name); // "nodejs/node"
```
**引入版本：** Node.js v17.5.0（实验性）

**稳定版本：** Node.js v18.0.0 起正式稳定

**仍需使用 node-fetch 的情况：** 如果项目需要兼容 Node.js 18 以下的旧版本。

#### 2\. ws（客户端）→ 全局 WebSocket

**之前：ws** 是用于创建 WebSocket 客户端和服务器的主流包。

[【第1882期】基于Unix Socket的可靠Node.js HTTP代理实现（支持WebSocket协议）](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651235939&idx=2&sn=5f2a127ddb8378afdf4ce7b7a2097c6f&scene=21#wechat_redirect)

**现在：Node.js 已内置全局** `WebSocket` 类，可直接用于客户端连接：

```
 const ws = new WebSocket('wss://echo.websocket.org');

 ws.onopen = () => ws.send('Hello!');
 ws.onmessage = (event) => console.log('Received:', event.data);
```
**引入版本：** Node.js v21.0.0（实验性）

**当前状态：** 仍为实验性功能，尚未完全稳定

**仍需使用 ws 的情况：如果要在服务端实现 WebSocket，**`ws` 或基于它构建的库依然是主流选择。

#### 3\. 测试框架 → node:test

**之前：编写测试通常需要安装 mocha、jest 或 tap 等框架。**

[【第1792期】使用 mocha 进行自动化测试](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651234940&idx=1&sn=9664ae6455444bcc3b7335a5ad386fcb&scene=21#wechat_redirect)

**现在：Node.js 内置了** `node:test` 模块，可直接运行测试：

```
 import test from 'node:test';
 import assert from 'node:assert';

 test('addition works', () => {
   assert.strictEqual(2 + 2, 4);
 });
```
**引入版本：** Node.js v18.0.0（实验性）

**稳定版本：** 从 Node.js v20.0.0 起正式稳定

**仍需使用第三方框架的情况：**

如果需要高级功能（如快照测试、mock、插件生态等）。`node:test` 足以满足模块级测试需求，但在大型应用开发中，完整的框架仍有优势。

#### 4\. sqlite3 /better-sqlite3 → node:sqlite（实验性）

**之前：开发者通常使用** `sqlite3` 或性能更优的 `better-sqlite3`。但这些包依赖本地编译，在 Node.js 升级时常常出现兼容性问题。

**现在：Node.js 正在引入实验性的** `node:sqlite` 模块：

```
 import { open } from 'node:sqlite';

 const db = await open(':memory:');
 await db.exec('CREATE TABLE users (id INTEGER, name TEXT)');
```
**当前状态：** 仍为实验性功能

**仍需使用社区包的情况：如果需要更高性能调优或** `node:sqlite` 目前尚未提供的高级功能。

#### 5\. chalk / kleur → util.styleText()

**之前：像 chalk 和 kleur 这样的库曾是命令行文本着色的首选工具。**

**现在：Node.js 已原生提供** `util.styleText()` 方法：

```
 import { styleText } from 'node:util';

 console.log(styleText('red', 'Error!'));
 console.log(styleText(['bold', 'green'], 'Success!'));
```
**引入版本：** Node.js v20.12.0

**稳定版本：** Node.js v22.17.0 起稳定

**仍需使用 chalk 的情况：**

如果你需要更复杂的主题、链式调用语法或旧版本兼容性。

#### 6\. ansi-colors / strip-ansi → util.stripVTControlCharacters()

**之前：开发者使用** `strip-ansi` 等包来清除日志中的 ANSI 转义字符。

**现在：Node.js 已内置** `util.stripVTControlCharacters()`：

```
 import { stripVTControlCharacters } from 'node:util';

 const text = '\u001B[4mUnderlined\u001B[0m';
 console.log(stripVTControlCharacters(text)); // "Underlined"
```
**优点：原生支持，处理更可靠。**

**仍需使用第三方包的情况：几乎不需要 —— 内置方法已能覆盖大多数使用场景。**

#### 7\. glob → fs.glob()

**之前：glob** 包是文件路径匹配的核心工具。

**现在：Node.js 22+ 已在** `fs` 模块中加入 `fs.glob()`：

```
 import fs from 'node:fs/promises';

 const files = await fs.glob('**/*.js');
 console.log(files);
```
**引入版本：** Node.js v22.0.0（属于 v22 系列的 fs API 扩展）

**稳定版本：** Node.js v22.17.0 LTS

**仍需使用 glob 的情况：如果要兼容旧版 Node.js。**

#### 8\. rimraf → fs.rm({ recursive: true })

**之前：要递归删除文件夹，必须安装** `rimraf`。

**现在：Node.js 原生支持递归删除**

```
 import fs from 'node:fs/promises';

 await fs.rm('dist', { recursive: true, force: true });
```
**引入版本：** 大约在 Node.js v12.10.0 起提供（Promise 版本在后续完善）

**稳定状态：** 所有 LTS 版本（v18、v20、v22）均已稳定支持

#### 9\. mkdirp → fs.mkdir({ recursive: true })

**之前：开发者使用** `mkdirp` 来递归创建文件夹。

**现在：Node.js 原生支持**

```
 await fs.mkdir('logs/app', { recursive: true });
```
**引入版本：** Node.js v10.12.0

**稳定状态：** 自引入以来即为稳定核心 API。

#### 10\. uuid (v4) → crypto.randomUUID()

**之前：生成 UUID 通常需要安装** `uuid` 包。

**现在：Node.js 提供原生方法**

```
 import { randomUUID } from 'node:crypto';

 console.log(randomUUID());
```
**引入版本：** Node.js v14.17.0

**稳定状态：** 自发布起即为稳定 API。

#### 11\. base64-js / atob polyfills → Buffer, atob, btoa

**之前：编码或解码 Base64 需要 polyfill 包。**

**现在：Node.js 内置全局** `atob`、`btoa`，以及 `Buffer`：

```
 const encoded = btoa('hello');
 console.log(encoded); // "aGVsbG8="
 console.log(atob(encoded)); // "hello"
```
**引入版本：** 大约在 Node.js v20.0.0

**稳定状态：** 当前 LTS 版本中已为稳定功能。

#### 12\. url-pattern → URLPattern（实验性）

**之前：路由匹配通常使用** `url-pattern`。

[【第3622期】深入浅出：用 URLPattern 打造轻量级 SPA 路由](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278071&idx=1&sn=3bc9e4bb8bdd2e318b79450b8779891c&scene=21#wechat_redirect)

**现在：Node.js 已支持全局** `URLPattern` API

```
 const pattern = new URLPattern({ pathname: '/users/:id' });
 const match = pattern.exec('/users/42');
 console.log(match.pathname.groups.id); // "42"
```
**引入版本：** Node.js v20.0.0（实验性）

**当前状态：** 仍为实验功能，尚未稳定。

#### 13\. dotenv（基础功能）→ --env-file 标志（实验性）

**之前：加载** `.env` 文件需安装 `dotenv`。

**现在：Node.js 原生支持直接加载环境文件**

```
 node --env-file=.env app.js
```
**引入版本：** Node.js v20.10.0（实验性）

**当前状态：** 尚未稳定

**仍需使用 dotenv 的情况：**

如果需要变量扩展、多环境文件或更复杂的配置。

#### 14\. event-target-shim → EventTarget

**之前：Node.js 原有** `EventEmitter`，开发者需使用 `event-target-shim` 实现 Web 标准的 `EventTarget`。

**现在：EventTarget** 已成为全局对象：

```
 const target = new EventTarget();
 target.addEventListener('ping', () => console.log('pong'));
 target.dispatchEvent(new Event('ping'));
```
**引入版本：** Node.js v15.0.0

**稳定版本：** Node.js v15.4.0 起正式稳定。

#### 15\. tsc（基础转译）→ Node.js 实验性 TypeScript 支持

**之前：运行** `.ts` 文件需要完整的 TypeScript 工具链（如 tsc 或 ts-node）。

**现在：Node.js 提供实验性 TypeScript 支持**

```
 node --experimental-strip-types app.ts
```
**引入版本：** 大约在 Node.js v21.0.0

**当前状态：** 仍为实验性功能

**仍需使用 tsc 的情况：如果需要类型检查、声明文件或生产级构建。**

#### 总结

Node.js 的发展趋势十分明显：许多过去依赖外部包的功能，如今都成为核心模块中的一等公民。

这意味着开发者可以：

- 减少依赖数量
- 降低供应链与安全风险
- 编写更具可移植性的代码（适用于浏览器与服务器）

不过，在生产环境中保持稳定性、性能与安全并不容易。

关于本文  
译者：@飘飘  
作者：@Lizz Parody  
原文：https://nodesource.com/blog/nodejs-features-replacing-npm-packages

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
