---
title: "【早阅】一周重写 Next.js：AI 如何造出更快更小的 vinext？"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278624&idx=1&sn=80be0485ee26431b040c99831ee892e0&chksm=bcf95c28d991f67474cce195039d75a5241bd6533bab509e5656b4773967b30e5986571d1f5c&scene=0#rd"
date: 2026-02-27
md5: 388eb338223f9ea29479fef775b411b5
---

# 【早阅】一周重写 Next.js：AI 如何造出更快更小的 vinext？

前言

一名工程师借助 AI，在不到一周时间内重写了 Next.js，打造出基于 Vite 的替代方案 vinext。不仅构建速度最高提升 4 倍，打包体积减少 57%，还可一键部署至 Cloudflare Workers。这不仅是一次框架重构，更是 AI 改变软件开发方式的真实案例。今日前端早读课文章由 @Steve Faulkner 分享，@飘飘编译。

译文从这开始～～

上周，一名工程师和一个 AI 模型从零开始重写了目前最流行的前端框架。最终成果是 vinext（读作 “vee-next”），它基于 Vite 构建，是 Next.js 的直接替代品，并且只需一条命令就能部署到 Cloudflare Workers。初步测试显示，它在构建生产应用时速度最高可提升 4 倍，生成的客户端打包体积最多可缩小 57%。目前已经有客户在生产环境中使用它。

[【第3654期】不再重置！在 React / Next.js 中实现跨页面“持续进化”的动画效果](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278586&idx=1&sn=3cfb81a18bdbbe2a205a4a70f3d3b6ae&scene=21#wechat_redirect)

整个过程大约消耗了价值 1100 美元的 tokens。

#### Next.js 的部署难题

Next.js 是目前最受欢迎的 React 框架，拥有数百万开发者用户，在生产环境中被广泛使用。这并非偶然，它的开发体验确实非常出色。

但当 Next.js 被用于更广泛的无服务器（serverless）生态时，就会遇到部署难题。它的工具链是高度定制化的：Next.js 在 Turbopack 上投入了大量精力，但如果你想把应用部署到 Cloudflare、Netlify 或 AWS Lambda，就必须对构建产物进行额外处理，把它转换成目标平台能够运行的形式。

如果你在想：“这不就是 OpenNext 要解决的问题吗？”—— 没错。

OpenNext 正是为了解决这个问题而诞生的。包括我们 Cloudflare 在内的多家厂商都为此投入了大量工程资源。它确实能用，但很快就会遇到各种限制，修一个问题又冒出一个新问题，像 “打地鼠” 一样没完没了。

[【第3460期】如何在前端开发中实现零停机部署](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651275760&idx=1&sn=6c73d6f67aa0f474cc8c21e78ed76749&scene=21#wechat_redirect)

OpenNext：https://opennext.js.org/

以 Next.js 的构建产物为基础进行二次构建，本质上是一种困难且脆弱的做法。由于 OpenNext 需要对 Next.js 的输出进行 “逆向解析”，不同版本之间的变化往往难以预测，每次升级都需要花大量精力去修补。

Next.js 也在开发一套官方适配器 API，我们也参与了合作。这项工作还处于早期阶段。即便有了适配器，本质上还是基于 Turbopack 这套高度定制的工具链。而且适配器只覆盖构建和部署环节。开发阶段的 next dev 只能运行在 Node.js 上，无法替换成其他运行时。如果你的应用依赖特定平台的 API，比如 Durable Objects、KV 或 AI 绑定，那么在开发环境中就无法直接测试这些代码，只能通过额外的变通方案。

#### 介绍 vinext

![图片](./images/729b61256416041b489599866e470188.png)

如果我们不再去适配 Next.js 的构建产物，而是直接在 Vite 上重新实现一套兼容 Next.js 的 API，会怎么样？Vite 是 Next.js 之外前端生态中最主流的构建工具，被 Astro、SvelteKit、Nuxt、Remix 等框架广泛采用。我们的目标是一次彻底的重写，而不是简单做一层封装或适配。说实话，我们一开始也不确定这是否可行。但现在是 2026 年，软件开发的成本结构已经彻底改变。

结果比我们预想的走得更远。

```
 npm install vinext
```
把脚本中的 next 替换为 vinext，其余内容保持不变。现有的 `app/`、`pages/` 目录以及 `next.config.js` 都可以原样使用。

```
 vinext dev          # 启动支持 HMR 的开发服务器
 vinext build        # 生产环境构建
 vinext deploy       # 构建并部署到 Cloudflare Workers
```
这并不是对 Next.js 或 Turbopack 输出的简单封装，而是对其 API 能力的另一种实现方式，包括路由、服务端渲染、React Server Components、Server Actions、缓存机制、中间件等，全部以 Vite 插件的形式实现。更重要的是，借助 Vite Environment API，Vite 的构建产物可以运行在任意平台上。

[【早阅】Vite 不仅仅是构建工具](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277651&idx=1&sn=4cb0aa638ffa1bdecf692a40f5c6784c&scene=21#wechat_redirect)

#### 数据表现

初步基准测试结果令人鼓舞。我们使用同一个包含 33 条路由的 App Router 应用，对 vinext 与 Next.js 16 进行了对比。两个框架执行的工作完全相同：编译、打包以及准备服务端渲染路由。我们在 Next.js 构建过程中关闭了 TypeScript 类型检查和 ESLint（因为 Vite 构建时不会执行这些），并启用了 force-dynamic，避免 Next.js 额外进行静态路由预渲染，从而影响对比的公平性。本次测试只关注打包和编译速度，不涉及其他因素。所有基准测试都会在每次合并到 main 分支时通过 GitHub CI 自动运行。

**生产环境构建时间：**

框架

平均时间

对比 Next.js

Next.js 16.1.6 (Turbopack)

7.38 秒

基准

vinext (Vite 7 / Rollup)

4.64 秒

快 1.6 倍

vinext (Vite 8 / Rolldown)

1.67 秒

快 4.4 倍

**客户端打包体积（gzip 后）：**

框架

gzip 后体积

对比 Next.js

Next.js 16.1.6

168.9 KB

基准

vinext (Rollup)

74.0 KB

小 56%

vinext (Rolldown)

72.9 KB

小 57%

这些测试数据衡量的是编译和打包速度，而不是生产环境中的实际运行性能。测试样本仅为一个包含 33 条路由的应用，并不能代表所有生产应用场景。随着三个项目的持续发展，这些数字还会发生变化。完整的测试方法和历史数据均已公开。请将这些结果视为趋势参考，而非最终定论。

测试数据：https://benchmarks.vinext.workers.dev/

不过，从趋势来看结果非常积极。Vite 的架构，尤其是即将在 Vite 8 中推出的基于 Rust 的打包器 Rolldown，在构建性能方面具备明显的结构性优势，这一点在测试中已经清晰体现出来。

#### 部署到 Cloudflare Workers

vinext 从一开始就将 Cloudflare Workers 作为首要部署目标。只需一条命令，就能从源代码到成功运行的 Worker：

```
 vinext deploy
```
这条命令会自动完成所有步骤：构建应用、自动生成 Worker 配置并完成部署。无论是 App Router 还是 Pages Router，都可以在 Workers 上运行，支持完整的客户端水合、交互式组件、客户端路由跳转以及 React 状态管理。

[【第3656期】深入理解 React 的 useEffectEvent：彻底告别闭包陷阱](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278602&idx=1&sn=a51d047d864a2178ae921057e3c6073a&scene=21#wechat_redirect)

在生产环境缓存方面，vinext 内置了一个基于 Cloudflare KV 的缓存处理器，开箱即用支持 ISR（增量静态再生成）：

```
 import { KVCacheHandler } from "vinext/cloudflare";
 import { setCacheHandler } from "next/cache";

 setCacheHandler(new KVCacheHandler(env.MY_KV_NAMESPACE));
```
对于大多数应用来说，KV 是一个不错的默认选择。但缓存层本身是可插拔的。通过调用 setCacheHandler，你可以替换为任何合适的后端。对于缓存内容较大或访问模式不同的应用，R2 可能更合适。我们也在改进 Cache API，希望在更少配置的前提下提供更强大的缓存能力。目标是保持灵活性：根据应用需求选择最适合的缓存策略。

目前正在运行的在线示例包括：

- App Router Playground
- Hacker News 克隆版
- App Router 最小示例
- Pages Router 最小示例

我们还提供了一个 Cloudflare Agents 在 Next.js 应用中运行的在线示例。由于整个应用在开发和部署阶段都运行在 workerd 中，因此不再需要像 getPlatformProxy 这样的变通方案。这意味着你可以无缝使用 Durable Objects、AI 绑定以及所有 Cloudflare 专属服务。详情请查看示例。

#### 框架是团队协作的成果

目前的部署目标是 Cloudflare Workers，但这只是整体的一小部分。vinext 大约 95% 的代码都是纯 Vite 实现。路由系统、模块适配层、SSR 流程、RSC 集成 —— 都不依赖 Cloudflare。

Cloudflare 正在与其他托管服务商探讨，将这套工具链提供给他们的客户（实现成本非常低 —— 我们在不到 30 分钟内就在 Vercel 上做出了一个可行性验证版本）。这是一个开源项目，我们相信，要实现长期成功，就必须与生态中的合作伙伴共同投入。欢迎其他平台提交 PR。如果你有兴趣添加新的部署目标，欢迎提 issue 或直接联系我们。

#### 当前状态：实验阶段

需要明确的是：vinext 仍处于实验阶段。它甚至还不到一周时间，也尚未在大规模真实流量环境中经过充分验证。如果你打算在生产环境中使用它，请保持谨慎。

不过，我们的测试体系相当完善：包括 1700 多个 Vitest 单元测试和 380 个 Playwright 端到端测试，其中包含直接移植自 Next.js 官方测试套件以及 OpenNext 的 Cloudflare 兼容性测试。我们已经对照 Next.js App Router Playground 进行了验证。目前已覆盖 Next.js 16 API 表面的 94%。

来自真实客户的早期反馈也令人鼓舞。我们正在与 National Design Studio 合作，这是一支致力于现代化政府界面的团队。他们的一个测试站点 CIO.gov 已经在生产环境中运行 vinext，并在构建时间和打包体积方面取得了明显改善。

README 中也坦诚列出了当前不支持或未来不会支持的功能，以及已知限制。我们希望保持透明，而不是过度承诺。

#### 关于预渲染

vinext 已经原生支持 ISR（增量静态再生成）。页面在第一次请求后会被缓存，并在后台重新验证，行为与 Next.js 一致。这部分功能已经可以正常使用。

[【第2387期】新一代Web技术栈的演进：SSR/SSG/ISR/DPR都在做什么？](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651249087&idx=1&sn=08a0bd0da23014fd230cd17583cdb4fd&scene=21#wechat_redirect)

不过，vinext 目前还不支持构建阶段的静态预渲染。在 Next.js 中，没有动态数据的页面会在 next build 阶段直接生成静态 HTML；如果存在动态路由，则通过 generateStaticParams () 指定需要提前生成的页面。vinext 目前还未实现这一功能。

这是发布时的有意设计选择。该功能已在路线图中，但如果你的网站是 100% 静态内容，今天使用 vinext 可能收益不大。话虽如此，如果一名工程师花费 1100 美元的 tokens 就能重建 Next.js，那你或许只需花 10 美元，就可以迁移到专为静态内容设计的 Vite 框架，例如 Astro（同样支持部署到 Cloudflare Workers）。

但对于不是纯静态的网站，我们认为可以做得比在构建阶段预渲染所有页面更好。

#### 引入 “基于流量的预渲染”（Traffic-aware Pre-Rendering）

Next.js 会在构建阶段预渲染 `generateStaticParams()` 中列出的所有页面。一个拥有 1 万个商品页的网站，就意味着构建时要渲染 1 万次，即使其中 99% 的页面可能从未被访问。构建时间会随着页面数量线性增长。这也是为什么大型 Next.js 网站的构建时间常常达到 30 分钟。

因此我们提出了 “基于流量的预渲染”（TPR）。目前仍处于实验阶段，待更多真实场景验证后，我们计划将其设为默认行为。

思路很简单。Cloudflare 本身就是你网站的反向代理，我们已经拥有你的流量数据。我们知道哪些页面真正被访问。因此，与其全部预渲染或完全不预渲染，vinext 在部署时会查询 Cloudflare 的站点分析数据，只预渲染真正重要的页面。

```
 vinext deploy --experimental-tpr

 Building...
 Build complete (4.2s)

 TPR（实验）：分析 my-store.com 最近 24 小时的流量
 TPR：12,847 个唯一路径——其中 184 个页面覆盖了 90% 的流量
 TPR：正在预渲染 184 个页面...
 TPR：8.3 秒完成 184 个页面预渲染 → 写入 KV 缓存

 正在部署到 Cloudflare Workers...
```
对于一个拥有 10 万个商品页的网站，根据幂律分布，通常 90% 的流量集中在 50 到 200 个页面。这些页面可以在几秒内完成预渲染。其他页面则按需进行 SSR，并在首次请求后通过 ISR 缓存。每次新的部署都会根据最新流量模式刷新预渲染列表。突然爆红的页面也会被自动纳入。整个过程无需 `generateStaticParams()`，也无需将构建流程与生产数据库强绑定。

#### 迎战 Next.js，这一次有 AI 加持

像这样的项目，通常需要一个工程师团队花上几个月甚至几年的时间。多家公司里的多个团队都曾尝试过，但它的规模实在太大了。我们在 Cloudflare 也试过一次！两个路由系统、33 个以上的模块适配层、服务端渲染流水线、RSC 流式传输、基于文件系统的路由、中间件、缓存、静态导出…… 难怪一直没人真正完成。

而这一次，我们在不到一周的时间里完成了。一个工程师（准确地说是一位工程经理）负责方向把控，AI 负责实现。

第一个提交在 2 月 13 日完成。当天晚上，Pages Router 和 App Router 都已经实现了基础的 SSR，并支持中间件、Server Actions 和流式传输。第二天下午，App Router Playground 的 11 条路由中已有 10 条可以正常渲染。第三天，vinext deploy 已经可以将应用完整部署到 Cloudflare Workers，并支持完整的客户端水合。接下来几天主要用于打磨细节：修复边缘情况、扩展测试套件，将 API 覆盖率提升到 94%。

相比之前的尝试，改变在哪里？AI 变强了，而且强了不止一点。

#### 为什么这个问题特别适合 AI

并不是所有项目都能这样推进。但这次之所以成功，是因为几个关键条件恰好同时具备。

Next.js 的规范非常清晰。它拥有详尽的文档、庞大的用户群体，以及多年来积累的大量 Stack Overflow 问答和教程。它的 API 在训练数据中随处可见。当你让 Claude 实现 getServerSideProps 或解释 useRouter 的工作方式时，它不会胡编乱造，它真的理解 Next.js 的机制。

Next.js 拥有极其完善的测试套件。官方仓库中包含数千个端到端测试，覆盖各种功能和边界情况。我们直接移植了其中的部分测试（代码中可以看到出处说明）。这为我们提供了一个可以机械验证的 “行为规范”。

Vite 是一个极好的基础。它已经解决了前端工具链中最复杂的部分：快速 HMR、原生 ESM、清晰的插件 API、生产环境打包能力。我们不需要自己实现一个打包器，只需要让它 “说” Next.js 的语言。@vitejs/plugin-rsc 虽然还处于早期阶段，但它让我们无需从零实现 RSC，就获得了 React Server Components 支持。

[【第3654期】不再重置！在 React / Next.js 中实现跨页面“持续进化”的动画效果](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278586&idx=1&sn=3cfb81a18bdbbe2a205a4a70f3d3b6ae&scene=21#wechat_redirect)

模型本身也进步了。我们认为，即便在几个月前，这件事都很难实现。早期模型无法在如此规模的代码库中保持一致性。新一代模型可以在上下文中理解完整架构，推理模块之间的关系，并足够频繁地产出正确代码，从而保持开发节奏。有时我看到它深入到 Next、Vite、React 的内部实现中排查 bug。当前最先进的模型确实令人印象深刻，而且还在持续进步。

这些条件必须同时成立：目标 API 文档完备、测试体系完整、底层工具稳固、模型具备足够的复杂度处理能力。缺少任何一个，这个项目都不会这么顺利。

#### 我们究竟是如何构建它的

vinext 几乎每一行代码都由 AI 编写。但更重要的是：每一行代码都通过了与人工代码同样严格的质量门槛。项目包含 1700 多个 Vitest 单元测试、380 个 Playwright 端到端测试，使用 tsgo 进行完整的 TypeScript 类型检查，并通过 oxlint 进行代码规范检查。持续集成会在每个 PR 上运行全部检查。建立完善的护栏，是让 AI 在代码库中高效工作的关键。

流程从制定计划开始。我花了几个小时在 OpenCode 中与 Claude 来回讨论，确定架构方案：要实现什么、顺序如何、采用哪些抽象。这份计划成为整个项目的 “北极星”。之后的流程相当直接：

- 定义一个任务（例如：“实现 next/navigation 的适配层，包括 usePathname、useSearchParams、useRouter”）。
- 让 AI 编写实现代码和测试。
- 运行测试套件。
- 如果测试通过，合并；如果失败，把错误输出交给 AI 继续迭代。
- 不断重复。

我们还接入了 AI 代理进行代码审查。PR 创建后会由一个代理进行审查，审查意见返回后再由另一个代理处理。整个反馈循环基本实现了自动化。

当然，并非每次都完美。有些 PR 是错误的。AI 有时会自信地实现一个 “看起来合理” 的功能，但实际行为与真正的 Next.js 不一致。我需要不断进行方向修正。架构决策、优先级判断、识别错误方向 —— 这些都需要人来把控。当你为 AI 提供清晰的方向、充分的上下文和严格的护栏，它会非常高效。但方向盘仍然在人的手里。

在浏览器层面的测试中，我使用 agent-browser 验证真实渲染结果、客户端导航和水合行为。单元测试往往捕捉不到很多浏览器细节问题，而这种方式可以弥补。

整个项目期间，我们在 OpenCode 中运行了 800 多次会话，总成本约为 1100 美元的 Claude API tokens。

[【第3610期】OpenSpec 与 Spec Kit：为你的团队选择合适的 AI 驱动开发流程](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277871&idx=1&sn=3af22db9e0ffa2d71ff4cd8b4435bccb&scene=21#wechat_redirect)

#### 这对软件意味着什么

为什么我们的技术栈会有这么多层？这个项目让我深入思考这个问题，以及 AI 会如何改变答案。

软件中的大多数抽象层，本质上是为了帮助人类。我们无法在脑中同时掌握整个系统，于是构建了分层结构来管理复杂性。每一层都让下一位开发者更容易工作。于是，框架之上再叠加框架，封装库层层嵌套，数千行 “胶水代码” 随之产生。

AI 并没有同样的认知限制。它可以在上下文中掌握整个系统，直接生成代码。它不需要中间框架来帮助自己组织思路，只需要一个清晰的规范和一个可靠的基础。

目前还不清楚哪些抽象是真正的基础设施，哪些只是为了弥补人类认知限制的 “拐杖”。未来几年，这条界线会发生巨大变化。而 vinext 是一个例证：我们提供了一个 API 契约、一套构建工具和一个 AI 模型，剩下的全部由 AI 补齐。没有额外的中间框架。我们认为，这种模式将在更多软件领域重复出现。过去多年叠加的那些层，并不都会留下来。

#### 致谢

感谢 Vite 团队。Vite 是整个项目的基石。@vitejs/plugin-rsc 虽然还处于早期阶段，但它让我们无需从零实现 RSC，否则项目可能根本无法启动。在我们把插件推进到此前未被测试过的领域时，Vite 维护者给予了及时且有帮助的反馈。

我们也要感谢 Next.js 团队。他们多年打磨的框架提升了 React 开发的标准。正是因为他们的 API 文档详尽、测试体系完善，这个项目才成为可能。没有他们设立的标准，就不会有 vinext。

#### 立即尝试

vinext 提供了一个 Agent Skill，可以帮你完成迁移。它支持 Claude Code、OpenCode、Cursor、Codex 以及数十种 AI 编码工具。安装后，在你的 Next.js 项目中对 AI 说：

```
 npx skills add cloudflare/vinext
```
然后在支持的工具中打开项目并输入：

```
 migrate this project to vinext
```
该技能会自动完成兼容性检查、依赖安装、配置生成以及开发服务器启动。它了解 vinext 的支持范围，并会提示任何需要手动处理的部分。

如果你更喜欢手动操作：

```
 npx vinext init    # 迁移现有 Next.js 项目
 npx vinext dev     # 启动开发服务器
 npx vinext deploy  # 部署到 Cloudflare Workers
```
源码地址：github.com/cloudflare/vinext。欢迎提交 Issue、PR 和反馈。

Cloudflare 的连接云平台为企业网络提供全面防护，帮助客户高效构建互联网规模的应用，加速网站与各类互联网应用，抵御 DDoS 攻击，防范黑客入侵，并支持 Zero Trust 架构的落地。

关于本文  
译者：@飘飘  
作者：@Steve Faulkner  
原文：https://blog.cloudflare.com/vinext/

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
