---
title: "工具浪潮下 Babel 的定位与未来演进！"
link: "http://mp.weixin.qq.com/s/elqqbMgkyi3z6zVSeQjAsw"
date: 2025-11-25
md5: eaa93a816d4382646deb89b3eb9e8243
---

# 工具浪潮下 Babel 的定位与未来演进！

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

今日聊聊在原生工具浪潮下 Babel 的定位与未来演进，文章由 @保禄分享  

> **Rust 正在吃掉 JavaScript** —— 这句话来自 Lee Robinson 的文章，作者是前任的 Vercel VP。

他坚信 Rust 是 JavaScript 工具的未来，他洋洋洒洒地列举了不少理由，并且，从现在的 Next.js 来看，他们默认使用了自己用 Rust 写的构建工具 Turbopack。

微软也干了，今年年初，他们宣布了 TypeScript 7.x 将使用 Go 开发，从目前 GitHub 上来看，进展还不错，实现了不少东西。

字节还搞了 Rspack，从我看的一些讨论来看，相对于 Webpack，提升蛮大的。

当然其他基于 JavaScript 的解析、转译、打包工具也是这样，Babel 算一个典型，我们来聊聊 Babel 在原生工具浪潮下的定位与未来演进。

## 1\. 原生工具的兴起

Babel 有一个很典型的场景，就是开发 React 应用时的 JSX 转译，在过去几乎是一个事实标准，在 create-react-app（React 曾经的官方脚手架，现已废弃）等用到了 WebPack 技术栈的脚手架里，babel-loader 就是默认配置，大家下意识地就用 Babel 来转译 JSX。我记得在我刚学前端的时候，Babel 几乎就是转译的代名词。

现在情况还是有变化的，

Next.js 在国外算是网红级别的框架了，它现在已经启用了 Turbopack 作为默认打包工具，而且是生产环境可用，它默认就使用了 SWC 来转译 React JSX。

Rspack 是由字节主导的 Rspack 以 Rust 重写了一个高度兼容 Webpack 的打包器。它内置了 `swc-loader`，默认就以 SWC 来处理 JS/TS/JSX 的解析与转译，从而绕开 Babel。

SWC 官网上说，

> SWC is 20x faster than Babel on a single thread and 70x faster on four cores.

至于有没有 20 倍、70 倍，我具体没算过，但是给我的直观使用感受，确实快不少，尤其是在大型项目里，Babel 那种“卡顿感”会更明显一些，而 SWC 则流畅很多。

用 npm trends 的数据来看，`@swc/core` 在 `2023.1.8 - 2023.1.15` 周下载量是 **1,745,152**

一年后（`2024.1.17 - 2024.1.14`） **5,342,485**

到了 `2025.11.16 - 2025.11.23`，这个数字已经达到了 **15,453,205**，可以说是爆发式增长。

从 GitHub 的 Star 数来看，SWC 约 33k，Babel 约 43k，差距也在缩小。

国内用 `VoidZero` 的东西还是比较多的（毕竟 Vue 技术栈的统治地位），`VoidZero` 开源了 `OXC` 这个项目（它是用 `Rust` 写的，上层建筑是 `Rolldown` 以及 `Rolldown Vite`），它的重要职责包括转译和解析 ，从官方数据来看，也是很明显的性能提升。

## 2\. 为什么 Babel 被原生工具轻而易举地吃掉份额

### 2.1 性能维度的降维打击：“底层算力”这关过不去

这个在上一章已经提到过了， 对于大型项目来说，构建时间的长短不仅影响直接的开发体验，也间接影响着程序员的工作效率。

Babel 是用 JavaScript 写的，运行在 Node.js 这类 JavaScript 运行时上。

它在处理 AST 时，需要经过：源码解析、JS 对象分配、大量临时节点创建、垃圾回收等多个环节， 对于大型项目，AST 规模巨大，JS 对象分配非常频繁，Node.js 的 GC 停顿就会形成明显的“忽快忽慢”。哪怕工程师在 Babel 内部做了大量缓存与增量编译优化，也很难从根本上抹平这种抖动。

Node.js 的 JavaScript 执行模型以单线程事件循环为核心，虽然可以通过 `worker_threads` 或多进程并行处理多个文件，但跨线程 / 进程通信本身就有序列化、反序列化和调度开销，调度粒度也相对粗，这让它在“需要高频访问 AST、频繁分配对象”的编译类任务上比较吃力。

当然，这也不只是 Node.js 一家如此，哪怕是号称最快 JS 运行时的 Bun，当主要编译逻辑仍然用 JavaScript 实现时，也很难从根本上绕过 GC、对象分配模型等带来的开销。

而 SWC（Rust）和 esbuild（Go）编译为原生二进制文件。它们直接运行在操作系统上，使用更高效的内存管理策略，相比运行在 JS 引擎中的工具，基本没有解释执行带来的额外开销。这种底层语言的优势，就像是开着跑车去和骑自行车的人赛跑，基础能力的差距无法通过简单的优化来弥补。

Rust 和 Go 在语言层面对多线程 / 并发的支持更直接，很多编译器 / 构建工具也会默认吃满多核，这种并发模型上的优势，在 CPU 密集的转译任务里会非常直观地体现在构建时间上。

对于大厂和大型项目来说，缩短构建时间，也能节省大量的计算资源和成本。原生工具取代 Babel 处理转译任务，不是因为 Babel 做错了什么，而是因为在计算密集型的转译任务中，JavaScript 已经触碰到了物理极限。

### 2.2 先前的 Babel 版本给用户的痛点

下面介绍一些 Babel 的部分痛点。

#### 2.2.1 默认编译目标过于保守，性能和包体被“历史包袱”拖累

Babel 默认的编译目标是 `>=0%`，这意味着它会生成大量为了兼容旧浏览器（如 IE11）而产生的冗余代码。这不仅增加了构建时间，也导致了生成代码的体积膨胀。

在 Babel 7 中，如果用户没有显式配置 targets，官方文档说明 Babel 会“假定你在支持最旧的浏览器”，`@babel/preset-env` 会把 `ES2015–ES2020` 全部降级到 ES5，Babel7 官方文档里也说，

> When no targets are specified: Babel will assume you are targeting the oldest browsers possible. For example, @babel/preset-env will transform all ES2015-ES2020 code to be ES5 compatible.

更重要的是，这种“极度保守”的默认行为在很多项目里是隐式发生的：很多团队并没有配置 targets，却在不知情的情况下默默为 IE11 买单。这种“隐式陷阱”放大了 Babel 带来的负面直觉。

从体验的角度看，这相当于你花了同样的编译时间，结果输出了一堆根本用不上的 polyfill 和降级代码 —— 构建变慢、包变大，但团队日常面对的现代浏览器根本享受不到什么“实质收益”，自然会让人觉得这时间“白耗了”。

#### 2.2.2 配置复杂、不够直观

如果一个库的配置过于复杂，用户在使用时就会感到困惑和不便。社区在批评 Webpack 的时候也提到了类似的问题。

以装饰器（`Decorators`）为例，Babel 的配置和使用就相对复杂，尤其是在不同版本的装饰器提案之间切换时，用户需要了解各种细节和兼容性问题。Babel 7 提供了各种版本\[8\]，甚至彼此之间不完全兼容，用户怎么知道自己需要哪个版本呢？这无疑就增加了学习成本和使用难度。

社区里关于 `decoratorsBeforeExport / legacy / version` 组合踩坑的问答非常多，例如 Stack Overflow 上就有多个问题围绕:

> 「报错：decorators 插件需要 decoratorsBeforeExport」

> 「如何配置 legacy decorators 与 class‑properties 的顺序」等展开

答案往往需要给出精确的 Babel 配置才能消除错误。

这些讨论间接证明了 Babel 7 在 decorators 提案多版本同时存在时，给最终用户带来了显著的配置负担。

#### 2.2.3 Babel 的 TypeScript 的 AST 形式和 typescript-eslint 不一致

在 Eslint 的 GitHub 讨论（[#18830](javascript:;)）中，@bradzacher 明确提到：

> “我想指出的一点是使用 Babel 作为 TypeScript 解析器的问题。尽管 Babel（以及由此衍生的 @babel/eslint-parser）确实支持 TypeScript 语法，但它们输出的 AST 是其自身的一套表示形式，与 typescript-eslint 的 AST 规范并不一致。

开发 ESLint 插件或多工具集成时，作者往往需要针对 Babel AST 和 typescript‑eslint AST 分别写一套逻辑，或者在项目里引入额外的 AST 适配层，这在大型项目中是一笔不小的维护成本，也使得 Babel 在“作为通用 AST 解析器”这一角色上略显孤立。

#### 2.2.4 极度碎片化带来的“微包地狱”，极度原子化

Babel 8 在这一点上改进了很多，但是在 Babel 7 时代，Babel 的生态系统已经高度碎片化，用户需要安装和配置多个插件和预设才能满足不同的转译需求。这种“微包地狱”不仅增加了配置的复杂性，也使得依赖管理变得困难。

或者说，Babel 7 原来的做法过于激进，我在 4.4 节提到 Babel 未来可以专注于特定领域，这确实需要原子化，但是旧版本 Babel 未免太激进了点。

虽然 preset-env 缓解了这个问题，但一旦遇到 preset-env 覆盖不到的边缘特性，或者需要调试依赖冲突时，这种“原子化”的包结构会导致 node\_modules 极其臃肿。

## 3\. Babel 8

针对多年来社区对 Babel 做的批评，他们也在自我革新。既然算力比不过，那就把第 2 章提到的那些“非性能”痛点（配置繁琐、标准不统一、历史包袱重）解决掉，做一个更轻量、更标准的现代化工具。

截止到写这一段的时候（2025.11.23），Babel 8 最新版本为 8.0.0-beta.3。

Babel 8 发布计划的时候，我还是个学生，如今，终于有了 Beta。

### 3.1 全面拥抱 ESM

这是 Babel 8 最激进的变化之一\[^5\]。当然我并不感到意外，ES6 规范都发布 10 年了，Node.js 也支持 ESM 很久了，Babel 作为一个现代 JavaScript 工具，迟早要做出这个改变。

但是，Babel 在我们心目中，可能还有那种，它是老旧的、或者说，是兼容老旧玩意的刻板印象，它能全面拥抱 ESM 确实是一个积极的信号，表明它在努力跟上现代 JavaScript 生态的发展步伐。

### 3.2 放弃对旧版本 Node.js 的支持

从最新的文档来看，它要求 Node.js 版本 `^20.19.0 || >=22.12.0`，彻底放弃了对旧版本 Node.js 的支持\[^5\]。新版本的 Node.js 中不仅有性能改进，还有很多不错的新 API。这不仅对于 Babel 开发者来说是不错的，对于更多的使用者而言，也必是一个好事。

既然原生工具已经基本接管了“兼容老环境 + 极致性能”的那块地盘，Babel 再坚持支持一堆远古 Node 其实意义不大，不如彻底站到“现代 Node + 现代生态”的那一边，把精力花在它现在还能发挥优势的场景上。

### 3.3 配置简化、重构

`@babel/core` 终于将 targets 从 `>0%` 变成了 `defaults`，这意味着默认情况下，Babel 不会再生成一大堆为了兼容 IE 而产生的冗余代码。

装饰器问题，Babel 8 只保留了 2023-11 和 legacy 两个版本，由于浏览器即将实现的也是最新一版 decorators 提案，Babel 官方在迁移文档中明确建议，即便短期仍可使用 legacy，也应当优先升级到 2023-11，这样一方面与 TypeScript 5.x 行为一致，另一方面也避免了未来浏览器原生 decorators 与 Babel 输出不一致的问题。

Babel 8 把这些配置收紧，本质上是在抹掉“历史问题导致的负面体验”，让它在那些仍需要 Babel 参与的场景里，不至于被骂“慢又臃肿”。也就是说，它并不能帮 Babel 打赢和 SWC 的速度战，但至少能让人不再因为“配置坑”下意识排斥 Babel。

### 3.4 生态对齐与输出产物的现代化

除了显而易见的配置简化，Babel 8 在底层逻辑上也回应了社区长久以来的抱怨，尤其是在生态对齐和产物质量上。

#### 3.4.1 首先是解决 TypeScript AST 的分裂问题。

我们在 2.2.3 节提到过，Babel 之前的 TypeScript AST 与 typescript-eslint 存在差异，这让工具开发者极其痛苦。Babel 8 终于着手解决了这个问题，在迁移文档中明确提到，Babel 8 对 TypeScript 节点的解析逻辑进行了调整，以尽可能减少与 @typescript-eslint 项目的 AST 形状差异\[^6\]。

官方说，“这将使编写 ESLint 规则变得更加容易，当不依赖类型信息时，这些规则可以同时在 @typescript-eslint/parser 和 @babel/eslint-parser 下工作。”\[^6\]

这意味着，未来开发基于 AST 的工具（如自定义 ESLint 规则或 Codemod）时，开发者不再需要在两套标准之间反复横跳，这对于维护一个统一的 JavaScript/TypeScript 工具链生态至关重要。

#### 3.4.2 其次是默认开启 bugfixes 模式，告别“暴力降级”。

Babel 8 开启 bugfixes 模式\[^13\]，以前 Babel 转译像“一刀切”。比如你的目标浏览器支持大部分 ES6 类（Class），但只在一个很小的边缘情况有 Bug。旧模式下，Babel 会把所有 Class 代码都转译成 ES5 的函数（代码量大，性能差），默认开启 bugfixes 之后，Babel 变得更聪明。它会利用浏览器原生支持的语法，只针对那个特定的 Bug 注入一点点补丁代码，而不是把整个语法都重写。这样使得让编译后的代码更接近现代语法，体积更小，运行更快。

### 3.5 Babel 8 能逆转颓势吗？

Babel 8 的改进主要集中在清理技术债、规范化配置、提升开发者体验和对齐现代标准。虽然放弃旧 Node 版本和代码清理会带来微小的性能提升，但它本质上仍然运行在 JS 引擎之上，对于原生工具带来的降维打击是束手无策的，除非 Babel 自己也引入 Rust/Go 的代码。

“Babel 自己也引入 Rust/Go 的代码”，我也没有找到任何的直接证据来证明 Babel 有这个打算，或许 Babel 9 会有，但谁知道呢？

如果你把“逆转颓势”理解成，Babel 8 能够重新夺回原生工具已经抢走的市场份额，那我认为几乎不可能。

Babel 8 可以让原本因为“隐式陷阱”和“历史坑”而讨厌 Babel 的开发者，可以重新以一个更合理的成本使用它，以及在未来，Babel 8 扮演着自己在新时代的角色，我们下面会讲。

## 4\. Babel 8 的未来，以及它和原生工具的共处

上一章我们说了，Babel 8 逆转不了颓势，但它也不会“死”。在存量的 Babel 生态中可以继续发挥作用，用 npm trends 来看，其实它的下载量也没有明显下降。

### 4.1 Babel 特性决定了它仍然是新特性的试验场

SWC 和 Esbuild 在策略上更偏向支持已经稳定、主流使用的特性，对仍在剧烈变化的实验性提案会相对谨慎。

Esbuild 的 FAQ 中\[^10\]也提到了，

> If you have very custom requirements then you should be using other tools.

Next.js 最新的文档\[^11\]中，也有这么一句话：

> If you have an existing Babel configuration or are using unsupported features, your application will opt-out of the Next.js Compiler and continue using Babel.

如果 SWC 能通过插件支持所有实验性特性，Next.js 就没必要设计这个“回退到 Babel”的机制。这至少说明，在处理一些非标准 / 实验性特性和高度定制的场景时，Next.js 仍然需要以 Babel 作为兜底方案。

当然，这没有对错之分，作为一个原生工具，SWC 和 Esbuild 当然是为了成熟的特性而设计的。我也是 SWC 用户，我当然希望 SWC 主要支持稳定的特性。而 Babel 毕竟是 JavaScript 写的，它可以更灵活地跟进 ECMAScript 提案的进展，快速实现和试验新特性。既然要快速验证原型，我认为没有必要用原生工具来做这件事，毕竟开发效率才是关键。

从事实上来看，Babel 也确实有大量的实验性特性插件（`babel-plugin-proposal-xxx`），都是在正式成为标准之前就被 Babel 支持了。

### 4.2 除试验场外，Babel 还可以专注特定情形下的用例

大家可能听说过 jscodeshift，是 Facebook 开源的一个工具。专门用于在大规模代码库中运行自动化的重构脚本。Ant Design 就使用了它，可以去看一下 @ant-design/codemod-v5 的依赖。

没错，它也用了 Babel，不过，它不是拿来转译代码的，而是用来做代码分析和重构的。

在构建场景下，我们关注输入的源码，输出的代码机器能正常跑就行，但是在 Codemod 场景下，我们会要求几乎无损地修改。

jscodeshift 依赖一个叫 recast 的库来重新打印代码以保留格式。而 recast 以及整个 JS 静态分析生态，默认通用的“语言”就是 Babel 定义的 AST 规范（@babel/types）。

Babel 在此角色确实做了退化，它作为解析存在。

但这并不是原生工具也能轻松代替的。

原生工具当然也能做 Parser，它也有自己的 AST。但它们的设计初衷是“编译”，它的 AST 是为了 Rust 编译器优化而设计的，结构上与 Babel 的 AST 存在差异。

而且用原生工具实在是杀鸡用牛刀，迁移脚本和编译不同，我的脚本跑一次节省几秒钟的时间，其实没那么重要。而且作为前端应用的开发者，他真的不一定会 Rust、Go 等语言，如果为了用原生工具，就得学一门新语言，这显然是不划算的。即使在 LLM 普及的今天，学一门编程语言，也真的不是特别容易。

只要我们还需要自动化重构工具，Babel 就依然是这一领域的首选。让原生工具为了这个边缘场景去重写一套保留格式的解析器，既不划算，也背离了它们“高性能编译器”的初衷。

如果你说完成这些工作靠 LLM，我觉得还是把这种情形的重构任务交给一个相对来说更能确定结果的工具更好。

#### 4.2.1 从更宏观的角度看，Babel 其实已经在“事实标准 AST”这条路差不多站稳了。

`@babel/parser` 的官方文档中介绍说，Babel 解析器根据 Babel AST 格式生成 AST，且是在 ESTree 规范上进行的微调，它还提供了 estree 插件，能抹掉这些不符合 estree 的偏差。

从实际情况上来看，@babel/parser 生成的 AST 已经成为了 JavaScript 静态分析领域的事实标准，我们熟悉的 Prettier ，就是基于 Babel AST 进行处理的。Eslint 也可也使用 @babel/eslint-parser 进行解析。

Dennis O'Keeffe 有一篇小教程，叫《Creating Your Own Language》，教你怎么自己做一个玩具语言的，关于 AST 部分，他也提到：

> **Babel is kind of the de facto standard for the AST** —— Babel 是 AST 的事实标准。

Babel 作为转译器，它在原生工具面前确实没有竞争力，可是 Babel 到今天可不止是一个转译器，它也成为了前端开发基础设施（转译器器）中的基础设施（转译器的基础）。

虽然有 Biome 等新的、用 Rust 编写的 Linter + Formatter 工具在冲击着 Eslint 和 Prettier，但从目前来看，后两者的统治地位仍然稳固，而它们对 Babel AST 的依赖也不会轻易改变。后两者依赖 Babel Parser 是比较出名的，还有更多的开源项目。

### 4.3 原生工具为了实用性，也支持 JS 插件，但是：

4.1 节我们已经其实已经提到了，Babel 的开发门槛相对较低，而且毕竟也是动态的语言，这使得它在快速迭代和试验新特性方面具有优势。

我觉得到这里，会有读者问，其实有原生工具已经支持用 JS 写插件了，你的论点并不可靠。

这里补充说一下。

现在很多原生工具也提供了 JS API，以 esbuild 为例，当构建过程触发特定钩子（Hooks，如 onResolve, onLoad）时，Go 进程会将控制权交还给 Node.js 里的 JS 插件，插件处理完后再将结果传回 Go。

这是有代价的，这就是序列化和反序列化的开销。

频繁地在原生进程和 JS 进程间切换会带来性能损失，尤其是当插件逻辑复杂、调用频繁时，这种损失会更加明显。如果插件逻辑过于频繁（例如处理每一个 AST 节点），这种开销可能会抵消原生工具带来的性能优势。

况且，JS 插件运行在“与内核不同的语言和运行时”中，调试体验、错误栈信息等都比“纯 JS 工具链”更复杂，对需要频繁修改和迭代的 DSL 编译逻辑而言，这种复杂度未必值得。

原生工具支持 JS 插件是一种实用主义的妥协，它承认了 JavaScript 在构建配置领域的统治地位。

### 4.4 存量的 Babel 生态，就算迁移到原生工具也需要时间和精力

这是倒数第二重要的，所以我放到后面讲。

Solidjs 不知道大家有没有听说过，这是一个很新的框架，它用法上类似 React，但是它不使用虚拟 DOM，而是通过编译时优化来实现高性能，可以理解成，“JSX 风格的 Svelte”。

截止到写这一段的时候（2025.11.23），SolidJS 官方提供的插件仍然是基于 Babel 而不是 SWC 的。

`babel-preset-solid` 依赖 `babel-plugin-jsx-dom-expressions` 进行转译，这是 SolidJS 转译的核心，篇幅有限，我们可以简单分析一下。

当然，`babel-plugin-jsx-dom-expressions` 是一个很极端的例子，Babel 生态环境中的相当多的插件并不会复杂到这个程度，但这正是“现有 Babel 生态过于复杂、原生工具难以完全替代”的一个典型样本。

React JSX 转译的主要工作，是把各种 JSX 变成 React.createElement(...)，本质上是一种较为单纯的语法糖映射。Solid 则完全不同，它几乎把“运行时该干的事”尽量搬到了编译期。

它会对每个 JSX 表达式做“静态 / 动态”判定、尽可能在编译期折叠出 HTML 字符串模板、只把真正需要响应式更新的点，记录到一个 dynamics 列表，交给运行时 effect 去更新。

插件有一个体量不小的 isDynamic 函数，专门回答一个问题：“这个表达式在运行时会不会变？”，它要考虑的远远不止“是不是字面量”这么简单，它围绕 Solid 自己的信号 / effect 模型精心写的一整套“静态分析 + 编译期调度”逻辑。

在 CSR 和 SSR 下的行为也不一样，具体不再赘述。诸位有兴趣可以拉下源码用 AI 分析一下。

综上所述，它实质上是一个利用 JavaScript 的动态能力，构建在 Babel AST 之上的“领域特定语言（DSL）编译器”和“浏览器环境模拟器”。

你要问 SWC 能不能实现一样的逻辑？当然没问题，我没有看出它有哪些东西是 SWC 做不到的，但是，重写这个插件，我觉得不是几周甚至小几个月就能做完的事情。

@vitejs/plugin-vue-jsx 也是如此，它仍然是依赖 Babel 的（`@vue/babel-plugin-jsx`），虽然不像 SolidJS 那么复杂，但它也有自己的一套 Vue 特有的 JSX，也要处理 Vue 独有语法糖和运行时优化。我目前也没有看到 VoidZero 旗下的项目在官方的 GitHub 仓库里有用 OXC 改写 Vue JSX 插件。虽然 Vue JSX 用 OXC 可能也只是时间问题，但短期内，Babel 仍然是第一选择。

### 4.5 Babel 会是一个备用选项

这节我放到最后说，也不会写太多，因为相对上面内容来说，它应该是最不重要的，或许，极端情况下，这种的“备用选项”甚至不会被用到。

Next.js 并没有完全抛弃 Babel，在最新的 Next.js 16 文档中，仍然保留了 Babel 的相关配置选项，用户仍然可以在 SWC 无法完成的情况下，使用 Babel 来处理转译任务。

Vite 也是，我知道 VoidZero 已经开发出了 OXC、Rolldown，@vitejs/plugin-react 默认仍然是基于 Babel 的。

## 5\. 结语

Babel 迎来了它自己的转折点。它的原型是人类因为自己的傲慢而被迫分散的象征。

但 JavaScript 世界里的 Babel，它却在相当长的一段时间里，抹平了不同环境、不同技术、不同年代的差异，让开发者能够专注于编写代码，而不是担心兼容性问题。如今原生工具的普及，Babel 不会停工，而是在新的时代里，找到自己的定位。

Node 社群
