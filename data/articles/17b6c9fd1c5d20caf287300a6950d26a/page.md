---
title: "性能暴涨 3 倍！Prisma 7 颠覆性更新：放弃 Rust 拥抱 TypeScript！"
link: "http://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247528637&idx=1&sn=5f5f89ee8c3595537740aabb35699e2a&chksm=f992766ccee5ff7aa6767e4fadd07215c23e007826bc7919e58fd05c6b892e1b87f3a2621af0#rd"
date: 2025-12-19
md5: 17b6c9fd1c5d20caf287300a6950d26a
---

# 性能暴涨 3 倍！Prisma 7 颠覆性更新：放弃 Rust 拥抱 TypeScript！

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

> 作者：五月君
> 
> 转载自：Nodejs技术栈

在前端，“用 Rust 重写一切” 似乎已经成为了提升性能的黄金法则。然而，全球最受欢迎的 Node.js ORM 框架之一 ——  Prisma，在最新的 7.0 版本中做出了一个**惊人**的决定：

**放弃 Rust，全面回归 TypeScript！**

你没看错。当所有人都在往 Rust 挤的时候，Prisma 反其道而行之。

结果如何？**Bundle 体积减少 90%，查询速度提升 3 倍。**

难道 Rust 不香了吗？今天我们就来扒一扒 Prisma 7 背后的技术决策，以及它给开发者带来的实际红利。

## 为什么要放弃 Rust？

Prisma 团队在博客中坦言，虽然 Rust 以高性能著称，但在 Prisma Client 的特定场景下，它反而成了瓶颈。

**1\. 跨语言通信的代价**

之前的 Prisma Client 虽然核心是用 Rust 写的，但它需要和你的 Node.js/TypeScript 应用进行通信。这意味着每一次数据库查询，数据都需要在 JavaScript 和 Rust 之间“穿梭”。

这种“跨语言桥接”（Bridge）带来了巨大的序列化和反序列化开销。对于大量的简单查询来说，**通信的成本甚至超过了查询执行本身的成本**。

**2\. 贡献门槛过高**

Prisma 的用户主要是 JavaScript 和 TypeScript 开发者。当核心逻辑用 Rust 编写时，绝大多数用户根本无法参与贡献或修复 Bug。

**3\. Serverless 的噩梦**

Rust 核心意味着你需要分发针对不同平台的二进制文件。这不仅让部署变得复杂（想想 Cloudflare Workers 或 Vercel Edge），而且二进制文件通常很大，容易触碰到 Serverless 平台的体积限制。

## 回归 TypeScript 带来的惊人红利

Prisma 7 将 Client Runtime 完全用 TypeScript 重写。这一改变带来了立竿见影的效果：

- \*\*体积狂降 90%\*\*：没有了沉重的 Rust 二进制文件，Prisma Client 变得轻盈无比。这意味着更快的冷启动速度，以及完美支持 Cloudflare Workers 等边缘计算平台。
- **查询速度提升 3 倍**：去掉了 JS 到 Rust 的通信层，现在的查询直接在 JS 运行时中处理，性能直接起飞。
- **更低的资源占用**：大幅降低了 CPU 和内存的使用率。

正如 Deno 团队的 Luca Casonato 所说：“看到 Prisma 摆脱 Rust 让我们非常兴奋，这让在 Deno 中支持 Prisma 变得简单多了！”

## 开发者体验 (DX) 的重大升级

除了性能，Prisma 7 在开发体验上也听取了社区多年的吐槽，做出了重大改进。

**1\. 告别 `node_modules` 黑盒**

以前，Prisma 生成的代码默认藏在 `node_modules` 里。这虽然符合库的习惯，但在调试和版本控制时非常麻烦。

现在，Prisma 默认将生成的 Client 代码**直接放在你的项目源代码中**。这意味着：

- 你的 IDE 可以更好地索引类型。
- 文件监听器（Watcher）可以即时响应 Schema 的变化。
- 一切都变得透明可见。

**2\. 引入 `prisma.config.ts`**

终于！Prisma 有了自己的配置文件。

以前，你的配置散落在 `schema.prisma` 和 `package.json` 中。现在，你可以使用 `prisma.config.ts` 来统一管理数据库 URL、Seed 脚本等配置。而且因为它是 TypeScript 文件，你可以使用 `dotenv` 等工具动态注入环境变量。

**3\. 类型检查更快了**

通过与 ArkType 的作者 David Blass 合作，Prisma 7 优化了类型生成逻辑：

- Schema 评估所需的类型减少了 \*\*98%\*\*。
- 完整类型检查的速度提升了 \*\*70%\*\*。

这意味着你的 VS Code 不会再因为复杂的数据库模型而卡顿了。

## Prisma Postgres：开箱即用的数据库

Prisma 甚至顺手发布了自己的托管数据库服务 —— **Prisma Postgres**。

这不仅仅是一个普通的 Postgres 实例，它专为 Prisma 优化，内置了连接池和缓存。对于想快速上线项目的独立开发者来说，这是个极大的便利：一条命令即可配置好数据库。

## 总结

Prisma 7 的发布给我们上了一堂生动的架构课：**没有绝对最好的语言，只有最适合场景的工具。**

在数据库驱动这个特定场景下，消除跨语言通信的开销比 Rust 本身的原始性能更重要。回归 TypeScript 不仅解决了性能瓶颈，还让整个 JavaScript 生态系统（包括 Deno、Cloudflare Workers）受益。

  

Node 社群
