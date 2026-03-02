---
title: "别再像新手一样使用 Tailwind 了！"
link: "http://mp.weixin.qq.com/s/Z0iy-a_9B1gX0SvNWWRdfg"
date: 2026-02-03
md5: cc69335def1cc26842d22bd7841ebf3e
---

# 别再像新手一样使用 Tailwind 了！

```js_darkmode__1
作者： Daniel Scott
原文地址：https://medium.com/full-stack-forge/stop-using-tailwind-like-a-beginner-heres-how-pros-do-it-4d2b6c712fa7 
```
去年，我打开了一个客户的 repo，发现里面有一个按钮组件，在一个 className 里硬塞了 **27 个 Tailwind class**。

看起来就像是有人把一袋 Scrabble 字母随手一摇，然后全倒进了 VS Code。

更离谱的是？

应用里的**每一个按钮**，都有一套自己“稍微不一样”的混乱版本。

不同深浅的蓝色。随意的 padding。border radius 像是靠掷飞镖算出来的。

就在那一刻我意识到：**大多数开发者并不是在用 Tailwind，而是在滥用它。**

这也不能全怪他们。

Tailwind 让你写内联 utility class 变得太容易了，以至于你会忘记，自己本来应该是在构建一个**可维护的系统**。

## 所以，是时候纠正一下了。  

## 1\. 停止编写“Utility 小说”

是的，Tailwind 是 utility-first。

但不代表你需要在每个组件里写一部 **14 个 class 的史诗巨著**。

如果你的 div 长这样：

```code-snippet__js
<div className="bg-blue-500 text-white p-4 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300 ease-in-out flex items-center justify-center gap-2 w-full max-w-sm mx-auto border border-blue-700" />
```
……恭喜，你刚刚让一个 code reviewer 流下了眼泪。

**专业做法：**把可复用的模式抽取出来，通过 CSS 里的 `@apply`，或者在 JS 里用 `clsx / classnames`。

```code-snippet__js
/* button.css */
```
现在你的 JSX 就变成了：

```code-snippet__js
<button className="btn-primary">Click Me</button>
```
更干净。可复用。未来的你一定会感谢现在的你。

---

## 2\. Design Token 不是摆设

如果你的 spacing、font size、color 全都是零散写在 utility class 里，那你根本没有发挥 Tailwind config 的威力。

你可以在 `tailwind.config.js` 里定义品牌色、间距体系和排版规范。

为什么要这么做？

因为当品牌团队决定把“primary” 蓝色调暗 **3%** 的时候，你就不用在 **93 个组件** 里挨个找 `bg-blue-500` 了。

```code-snippet__js
// tailwind.config.js
```
然后这样用：

```code-snippet__js
<div className="bg-brand-primary text-brand-secondary" />
```
---

## 3\. 用 Variants，不要 Copy-Paste

Tailwind 提供了 `@variants`，也有 `tailwind-variants`、`cva` 这类库，是有原因的。

如果你在每一个 error message 里都手动复制 `bg-red-500`，那你做错了。

你需要的是**组件样式的单一事实来源（single source of truth）**，而不是一坨从远处看起来像 DRY，走近了全是意大利面条的代码。

---

## 4\. 响应式和状态 class 不是随手撒的调料

初学者写的 Tailwind 代码，经常像是把 `md:`、`lg:`、`hover:` 当调料随便一撒。

没有规划。没有一致性。

专业开发者是用**设计系统**的思维在写：在每个 breakpoint 下，哪些东西会变化？哪些状态是真的重要？

你的响应式 class 应该是在**讲故事**，而不是突然来个反转剧情。

❌ 不好的示例：

```code-snippet__js
<p className="text-sm md:text-lg lg:text-base hover:underline hover:opacity-70 focus:text-xl">
```
✅ 更好的示例：

```code-snippet__js
<p className="text-sm md:text-lg hover:underline focus:opacity-70">
```
---

## 5\. 不要和 Tailwind 对抗 —— 去配置它

如果你发现自己在为 Tailwind 本来就能做的事情写一堆自定义 CSS，那大概率是你**还没配置够**。

想要特定的 grid 布局？加进 config。

需要自定义动画？Tailwind 支持 `keyframes`。

不想每次都敲 `rounded-xl`？把它设成默认值。

Tailwind 是一个**框架**，不是一桶 utility class。请把它当框架来用。

---

## 最后

Tailwind 很强，但前提是你用得**有意识**。如果你的代码库看起来像一锅 utility 汤，那它既不“干净”，也不“现代”——只是一个穿得好看的**维护噩梦**。

整理你的 class。善用 config。抽离模式。用系统化思维去写。

因为：

- **初学者手里的 Tailwind**，是快速交付“丑但能跑”代码的捷径
- **专业开发者手里的 Tailwind**，才是真正的超能力 🚀
