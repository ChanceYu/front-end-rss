---
title: "【第3653期】一个 CLAUDE.md，让 AI 真正懂你的项目：从配置到长期提效的完整指南"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278571&idx=1&sn=66e4f199ff6c325a9415c9c4bf3dcaad&chksm=bceeb354069809f66f10e42dd77ee53ddd2fe6b4bd73767e65eb964d87b7d2e268380ae6d6c9&scene=0#rd"
date: 2026-02-03
md5: d424a9040a2d0e97c0434de3f0e7a7db
---

# 【第3653期】一个 CLAUDE.md，让 AI 真正懂你的项目：从配置到长期提效的完整指南

前言

CLAUDE.md 是一个让 Claude 在每次会话中自动记住项目背景、代码规范和工作流程的配置文件，通过持续维护，它能显著减少重复沟通并提升 AI 编程效率。今日前端早读课文章由 @Vishwas Gopinath 分享，@飘飘编译。

译文从这开始～～

![图片](./images/ca4910602ec728e64141150a30315b6a.jpeg)

一个文件。每次对话前都会被加载。如果你在使用 Claude Code，这里是最值得投入配置时间的地方。

CLAUDE.md 是一个 Markdown 文件，Claude 会在每个会话开始时自动读取。它用于存放项目级的指令，这些内容如果没有它，你往往需要在每次提示中反复说明，比如：结构约定、代码规范、工作流、风格等。

[【早阅】将 Claude 代码变成自己的超赞 UI 设计师（使用 Playwright MCP ）](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277548&idx=1&sn=e49bd502f1e80c922686833f064a9898&scene=21#wechat_redirect)

我已经持续优化自己的 CLAUDE.md 配置一段时间了。这篇指南总结了我在创建、组织、维护以及不断演进这些文件过程中学到的全部经验。如果你使用的是其他 AI 编程工具，同样的思路也适用于 AGENTS.md（这是 Cursor、Zed、OpenCode 等 AI 编程工具使用的等效文件）。

#### 为什么你需要一个 CLAUDE.md 文件

Claude 每次会话开始时，都是 “失忆” 的。它不知道你代码风格偏好，不知道该如何运行你的测试，也不知道你的团队使用特定的分支命名规范，或者你的认证模块里有某个奇怪但必要的绕行方案。

结果就是，你要么不断重复说明这些事情；更糟糕的是，忘了提到某个关键信息，最后不得不花时间修复那些不符合你约定的代码。

CLAUDE.md 正是为了解决这个问题而存在的。Claude 会自动读取它，因此你的偏好可以在不同会话之间持续生效。

[【第3589期】写好工具，智能体才更聪明：Claude 的自我优化实践](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277436&idx=1&sn=c42d1bb443644528beae154177405565&scene=21#wechat_redirect)

#### 如何创建你的 CLAUDE.md 文件

最快的方式是使用 `/init` 命令。在项目目录中运行它，Claude 会根据你的项目结构和检测到的技术栈，生成一个初始版本的 CLAUDE.md。

有些人建议从零开始手写，但我更喜欢把 `/init` 生成的内容当作起点，然后删除不需要的部分。相比从头写，删除要容易得多。生成的文件里通常会包含一些显而易见、不需要特别说明的内容，或者对你来说没有实际价值的填充说明。

你可能会想，既然生成器都帮你写好了，为什么不全部保留？原因很简单：上下文是宝贵的。CLAUDE.md 里的每一行，都会和你真正想让 Claude 做的工作争夺注意力。

你可以把 CLAUDE.md 放在以下几个位置：

- 项目根目录：最常见的位置。把它提交到版本控制中，确保团队成员共享同一套上下文。
- .claude/CLAUDE.md：如果你更喜欢把配置文件集中放在子目录里，这是一个可选方案。
- ~/.claude/CLAUDE.md：用户级默认配置，对你所有项目生效。

对于不希望纳入版本控制的个人偏好（比如你编辑器的使用习惯、你偏好的输出详细程度），可以使用 CLAUDE.local.md。把它加入 `.gitignore`，避免被提交到仓库中。

文件名是区分大小写的。必须严格命名为 CLAUDE.md（CLAUDE 全大写，`.md` 小写）。Claude Code 在加载记忆文件时，只会查找这个特定的文件名。官方文档中并没有明确写出这一点，但当我询问官方文档的 AI 助手时，它确认：记忆文件和技能文件一样，同样区分大小写。

#### 如何组织你的 CLAUDE.md 文件

这部分是核心内容：到底哪些东西应该写进这个文件？

##### 必备内容

**1、项目背景（Project context）**

这是一个什么项目？用一句话让 Claude 快速进入状态。比如：“这是一个使用 Stripe 支付的 Next.js 电商应用。” 这样一句话，提供的信息比你想象中要多得多。

**2、代码风格（Code style）**

你的格式和代码模式偏好。是用 ES modules 还是 CommonJS？是否偏好具名导出？一定要具体。“代码格式规范一点” 这种说法太模糊了。

**3、命令（Commands）**

如何运行测试、构建、Lint、部署。当你让 Claude 运行相关操作时，它会直接使用这里写明的命令。

**4、坑点 / 注意事项（Gotchas）**

项目中特有的警告和陷阱。比如：

- 那个带有奇怪重试逻辑的认证模块
- 需要特定 Header 格式的 API 接口
- 绝对不能直接修改的文件

##### 一个完整示例

下面是一个适用于 Next.js 项目的 CLAUDE.md 示例：

```
 # Project: ShopFront

 Next.js 14 e-commerce application with App Router, Stripe payments, and Prisma ORM.

 ## Code Style

 - TypeScript strict mode, no `any` types
 - Use named exports, not default exports
 - CSS: Tailwind utility classes, no custom CSS files

 ## Commands

 - `npm run dev`: Start development server (port 3000)
 - `npm run test`: Run Jest tests
 - `npm run test:e2e`: Run Playwright end-to-end tests
 - `npm run lint`: ESLint check
 - `npm run db:migrate`: Run Prisma migrations

 ## Architecture

 - `/app`: Next.js App Router pages and layouts
 - `/components/ui`: Reusable UI components
 - `/lib`: Utilities and shared logic
 - `/prisma`: Database schema and migrations
 - `/app/api`: API routes

 ## Important Notes

 - NEVER commit .env files
 - The Stripe webhook handler in /app/api/webhooks/stripe must validate signatures
 - Product images are stored in Cloudinary, not locally
 - See @docs/authentication.md for auth flow details
```
Claude 之所以能高效处理这些内容，是因为它们结构清晰：有明确的标题，使用列表便于快速浏览，而且给出的都是具体命令，而不是模糊的指示。

##### 应该写多长？

一般建议控制在 300 行以内。越短越好，因为上下文 token 是非常宝贵的。

[【第3337期】解密Cookies和Tokens](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651272252&idx=1&sn=d282ef75f5fe1ba185bbf5c4cc7bf7f3&scene=21#wechat_redirect)

不过，我也见过一些项目，CLAUDE.md 写得更长反而更合理。如果你的代码库约定复杂，或者存在不常见的模式，提前把这些背景信息交代清楚，可以避免 Claude 做出错误假设，从而减少返工。

我的做法是：只放 Claude 在开始工作前必须知道的内容。如果某些信息只在特定场景下才有用，我会放到单独的文件里，再通过引用的方式引入。

##### @imports 引用机制

CLAUDE.md 支持使用 `@path/to/file` 的方式导入其他文件，例如：

```
 See @README.md for project overview
 See @docs/api-patterns.md for API conventions
 See @package.json for available npm scripts
```
这对于保持主文件精简非常有用。把详细说明放在独立的 Markdown 文件中，需要时再引用。Claude 会在相关场景下自动加载这些内容。

你可以引用任何位置的文件：

- 相对路径：`@docs/style-guide.md`
- 绝对路径也可以
- 甚至是用户级文件：`@~/.claude/my-preferences.md`

引用导入是可以递归的，也就是说，被引用的文件还可以再引用其他文件。但要谨慎使用，避免形成复杂难懂的引用迷宫。

我最终采用的模式是：CLAUDE.md 只保留核心要点，具体的专题说明放在独立文件中，通过 @imports 引用。

##### 使用 .claude/rules/ 实现模块化规则

对于更大的项目，还有一种方式：使用 `.claude/rules/` 目录。与其把所有内容都堆在一个文件里，不如拆分成多个聚焦的规则文件。

```
 your-project/
 ├── .claude/
 │   ├── CLAUDE.md           # 主项目说明
 │   └── rules/
 │       ├── code-style.md   # 代码风格规范
 │       ├── testing.md      # 测试约定
 │       └── security.md     # 安全要求
```
`.claude/rules/` 目录下的所有 Markdown 文件，都会和主 CLAUDE.md 以同等优先级自动加载。  
不需要手动 import，只要放进去就会生效。

当不同团队成员负责不同规则时，这种方式尤其好用：

- 前端团队维护 `code-style.md`，
- 安全团队维护 `security.md`，

不再需要在一个巨大文件里反复解决合并冲突。

我自己目前还没用到这一层结构，因为项目规模还不够大。但如果你在一个大型团队、且职责划分清晰，这种方式非常合理。

##### 子目录中的 CLAUDE.md

层级里还有最后一层：项目子目录中的 CLAUDE.md。

当 Claude 在某个子目录中工作时，会自动读取该目录及其父级路径中的 CLAUDE.md。这些文件不会在启动时统一加载，而是只有当 Claude 实际进入那部分代码时才会生效。

这对于 monorepo 或模块区分明确的项目非常有用：

- /api 目录可以有自己的 CLAUDE.md，专门定义 API 相关规范
- /packages/ui 目录可以有组件开发的独立规则

Claude 会根据当前工作位置，加载对应的上下文。

#### 如何维护你的 CLAUDE.md 文件

CLAUDE.md 不是 “一次写完就不管” 的东西。项目在演进，你的偏好也会变，文件也应该随之更新。

##### 在工作中不断补充规则

当 Claude 做出一个你想纠正的假设时，不要只在当下修正它，而是让 Claude 把这条规则写进你的 CLAUDE.md。

我经常这样做。比如 Claude 用 `console.log` 调试，但我希望统一使用日志工具。与其每次纠正，不如直接说：“把这条规则加进我的 CLAUDE.md：始终使用 logger，不要使用 console.log。”

这样一来，这条偏好在后续会话中都会生效。

CLAUDE.md 就会这样自然生长起来。你不需要一开始就预见所有情况，而是在实际使用中不断记录经验。就像开会时做笔记，只不过这些笔记真的会被用到。

> 注意：早期版本的 Claude Code 曾经有一个 `#` 键盘快捷方式，用于快速添加指令。但这个功能在 2.0.70 版本中被移除了。现在的做法是，直接让 Claude 编辑你的 CLAUDE.md。

#### 定期回顾和整理

每隔几周，我都会让 Claude 帮我审查并优化一次 CLAUDE.md。随着时间推移，规则会不断累积：有些变得多余，有些和新规则产生冲突。

一句简单的 “审查这个 CLAUDE.md，并提出改进建议”，就能暴露这些问题。删掉过时内容，合并重复规则，澄清模糊表述。

听起来像是额外的维护成本。确实是。但它远比你在每个会话中反复解释，或者事后修复不符合规范的代码，要省事得多。

#### 对关键规则进行强调

对于绝对不能违反的规则，使用强调词可以提高注意力，比如：

- “IMPORTANT：绝不要直接修改 migrations 文件夹”
- “YOU MUST：提交前必须运行测试”

当然，这并不是百分之百可靠。随着对话变长、上下文变得拥挤，Claude 仍然可能越界。但根据我的经验，这样做确实能提高它遵守规则的概率。

要克制使用。如果每条规则都写成 IMPORTANT，那等于一条都不重要。

#### 如何随着时间不断改进你的 CLAUDE.md

最有价值的更新，往往来自代码评审（Code Review）。

当一次 PR 暴露出某个之前没有文档化的约定，或者评审者指出了违反既有模式的写法，这就是一个信号：把它加进 CLAUDE.md。这样同样的错误就不会再发生。

如果你在使用 Claude Code 的 GitHub Action（通过 `/install-github-action` 安装），你可以直接在 PR 评论中 @claude 来完成这些更新。  
例如：

> “@claude add to CLAUDE.md: never use enums, always prefer string literal unions.”

Claude 会更新 CLAUDE.md，并将改动作为 PR 的一部分提交。这个工作流最早是 Boris Cherny 分享的，现在已经成为我理解和维护 CLAUDE.md 的一部分。

这样就形成了一个反馈闭环：真实项目中出现的问题 → 转化为明确指令 → 防止未来再犯同样的错误。你的 CLAUDE.md 会逐渐演变成一个活的文档，记录着团队长期积累下来的经验和共识。

我会把它看作代码库本身的一部分。你不可能第一次就写出完美的代码，你会重构、会优化。CLAUDE.md 同样值得这样对待。

#### CLAUDE.md 最佳实践

- 开头用一句话说明项目是什么
- 代码风格偏好要具体、可执行
- 包含关键命令（测试、构建、Lint、部署）
- 对坑点的描述要足够具体，真正能防止犯错
- 控制在 300 行以内，或者确保每一行都有存在价值
- 把详细说明移动到通过 @import 引用的文件中
- 删除任何过时的、或与新规则冲突的内容
- 对真正关键的规则进行强调，但只限于 “真的关键” 的
- 在工作过程中持续添加指令，而不是只在一开始写
- 当 PR 评审中暴露出约定时，及时更新
- 定期审查，清理过时或冲突的规则

**对于更大的项目：**

- 约定差异明显的子目录，可能需要各自的 CLAUDE.md
- 把规则拆分到 `.claude/rules/` 文件中，有助于不同团队明确各自的责任边界

#### 从今天开始

如果你还没有 CLAUDE.md，现在就运行 `/init`。检查它生成的内容，删除不适用的部分，加入你自己的代码风格偏好。

如果你已经有了，下次 Claude 做出你不想要的假设时，直接让它更新 CLAUDE.md。看着这个文件在真实使用中一点点成长。

一个文件。几分钟的配置。长期下来，节省的是成小时的时间。

关于本文  
译者：@飘飘  
作者：@Vishwas Gopinath  
原文：https://www.builder.io/blog/claude-md-guide

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
