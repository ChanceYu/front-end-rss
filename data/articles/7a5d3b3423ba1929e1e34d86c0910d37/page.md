---
title: "【第3642期】document.currentScript：被忽视却超实用的前端小技巧"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278454&idx=1&sn=ddabfeba4caf5df58de80e05fc4d1a22&chksm=bc34b5159ca9f5b5a37eacdc08d5ce0d2e5a7f83738964a1a5a4302180a89ecbb6212e09e7b4&scene=0#rd"
date: 2026-01-16
md5: 7a5d3b3423ba1929e1e34d86c0910d37
---

# 【第3642期】document.currentScript：被忽视却超实用的前端小技巧

前言

看似冷门的 document.currentScript，其实能优雅地解决脚本配置、组件通信和加载控制等问题，让你的前端代码更简洁、更 “原生”。

今日前端早读课文章由 @Alex MacArthur 分享，@飘飘编译。

译文从这开始～～

在偶然发现它并一度不确定它的用途后，我才意识到，`document.currentScript` 在为 `<script>` 元素暴露配置属性（以及其他用途）时，其实非常方便。

有时候，我会碰到一些浏览器中存在已久的 JavaScript API—— 其实我早该知道它们的存在。比如 `window.screen` 属性和 `CSS.supports()` 方法。让我稍感安慰的是，我发现自己并不是唯一一个不知道的人。我记得我曾发帖提到 `window.screen`，结果收到了一堆评论，很多人也不知道它的存在，这让我觉得自己没那么 “蠢”。

[【第3635期】用 JavaScript + JSDoc + tsc，优雅取代 TypeScript 的最佳实践](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278339&idx=1&sn=dbccbeb9b02e73028a780dc2543b8272&scene=21#wechat_redirect)

我认为，一个 API 的知名度，更多取决于它在我们解决问题时的适用性，而不是它存在了多久。如果 `window.screen` 这种 API 没有太多实际应用场景，人们自然容易忘记它。

不过，偶尔也会有一些机会，让这些不太被注意的特性派上用场。而我最近就发现了一个这样的例子 ——`document.currentScript`，而且我打算好好利用它一阵子。

#### 它是做什么的？

从定义上看，`document.currentScript` 的作用很简单：它能返回当前正在执行的 `<script>` 元素本身的引用。

```
 <script>
   console.log("tag name:", document.currentScript.tagName);
   console.log(
     "script element?",
     document.currentScript instanceof HTMLScriptElement
   );

   // tag name: SCRIPT
   // script element? true
 </script>
```
既然拿到了这个元素本身，你就能像操作任何 DOM 节点一样访问它的属性。

```
 <script data-external-key="123urmom" defer>
   console.log("external key:", document.currentScript.dataset.externalKey);

   if (document.currentScript.defer) {
     console.log("script is deferred!");
   }
 </script>

 // external key: 123urmom
 // script is deferred!
```
非常直观。而且显而易见，浏览器兼容性完全不是问题 —— 这个特性在所有主流浏览器中已经存在十多年了，换算成 “网页年龄”，都能变成钻石了。

[【第3632期】真相揭秘：JavaScript 中根本没有真正的“取消异步”](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278276&idx=1&sn=3f36efc7cba4f4d0e2108117f7d66f69&scene=21#wechat_redirect)

#### 模块脚本（Module）的限制

`document.currentScript` 有个重要的限制：它在模块脚本中不可用。不过奇怪的是，如果你在模块中访问它，不会得到 `undefined`，而是 `null`：

```
 <script type="module">
   console.log(document.currentScript);
   console.log(document.doesNotExist);

   // null
   // undefined
 </script>
```
这其实是标准中明确规定的行为。文档创建时，`currentScript` 会被初始化为 `null`：

> currentScript 属性在获取时，必须返回最近一次被设置的值。当 Document 被创建时，currentScript 必须初始化为 null。

此外，当脚本执行完毕后，它也会恢复为 `null`。所以如果你在异步代码中访问它，同样会得到 `null`：

```
 <script>
   console.log(document.currentScript);
   // <script> 标签

   setTimeout(() => {
     console.log(document.currentScript);
     // null
   }, 1000);
 </script>
```
也就是说，在 `<script type="module">` 内部，是没有办法访问当前脚本标签的。如果你只是想知道代码是否在模块中运行，可以简单地通过判断是否为 `null` 来实现（注意：只能在同步执行时判断）。

```
 function isInModule() {
   return document.currentScript === null;
 }
```
顺带一提，不要尝试用 `import.meta` 来检测，即使放在 `try/catch` 里也不行。因为只要它出现在普通 `<script>` 标签中，浏览器在解析时就会直接抛出 `SyntaxError`，甚至不需要执行代码。

```
 <script>
   // 还没执行就会抛出 SyntaxError！
   function isInModule() {
     try {
       return !!import.meta;
     } catch (e) {
       return false;
     }
   };

   // 这也会报错：
   console.log(typeof import?.meta);
 </script>
```
由于模块脚本目前还不支持类似 `document.currentScript` 的机制，未来如何解决这个问题还在讨论中。标准文档中也提到：

> 该 API 在实现者和标准社区中逐渐被弃用，因为它会全局暴露 script 或 SVG script 元素。因此，在模块脚本或 shadow tree 等新上下文中不可用。我们正在探索新的解决方案，以便在不全局暴露的情况下识别正在运行的脚本。

这个相关的 issue（[#1013](javascript:;)）其实早在 2016 年就已经被提出，至今仍在活跃讨论中。在那之前，最简单的替代方案就是 —— 直接通过 DOM 查询脚本元素：

```
 <script type="module" id="moduleScript">
   const scriptTag = document.getElementById("moduleScript");

   // 在这里操作 scriptTag。
 </script>
```
#### 需求：传递配置属性

我在 PicPerf 的网站上使用了 Stripe 的定价表，它是一个可以直接嵌入的原生 Web 组件。使用方式非常简单：加载一个脚本，在 HTML 中放入组件标签，并设置几个属性：

[【第3575期】解锁 AI 响应中的丰富 UI 组件渲染](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277284&idx=1&sn=c96010fa50abd506a21064e332bbf967&scene=21#wechat_redirect)

```
 <script
   async
   src="https://js.stripe.com/v3/pricing-table.js">
 </script>

 <stripe-pricing-table
   pricing-table-id="prctbl_blahblahblah"
   publishable-key="pk_test_blahblahblah"
 >
 </stripe-pricing-table>
```
如果 HTML 渲染时就能取到一些环境变量，这种方式完全没问题。但我想把这个表格嵌入到 Markdown 文件里。Markdown 虽然支持原生 HTML，但在里面拿到这些属性值可不像使用 `import.meta.env` 或 `process.env` 那么容易。因此，我需要一种方法，在页面渲染后再动态注入这些值。

不幸的是，Stripe 的定价表组件在初始化时就需要这些属性值，也就是说，无法将组件的渲染和配置分开。  
所以我不得不通过客户端脚本，连同属性值一起，把整个元素动态插入页面。做法是先在 Markdown 里放一个占位符元素，然后在脚本中填充它的内容。

**我的定价表**

```
 <div data-pricing-table></div>
 <script>
   document.querySelectorAll('[data-pricing-table]').forEach(table => {
     table.innerHTML = `
       <stripe-pricing-table
         pricing-table-id="STAY_TUNED"
         publishable-key="STAY_TUNED"
         client-reference-id="picperf"
       ></stripe-pricing-table>
     `;
   })
 </script>
```
到这一步，我唯一缺少的就是属性值本身。我可以选择在服务器端把这些值写入全局对象（如 `window`），但那种方式让我感觉不太舒服 —— 我不喜欢随意往全局作用域里塞数据。

#### 承认一下

老实说，我完全可以在 14 秒内解决这个问题。PicPerf.io 是用 Astro 构建的，而它提供了一个非常方便的 `define:vars` 指令，可以让服务端变量轻松传递给客户端脚本：

```
 ---
 const truth = "Taxation is theft.";
 ---

 <style define:vars={{ truth }}>
   console.log(truth);

   // Taxation is theft.
 </style>
```
但那样问题解决得太快了，既没什么乐趣，也写不出一篇博客 😂。

更重要的是，`define:vars` 是 Astro 独有的特性，而类似的配置需求在许多其他平台和内容管理系统中也普遍存在（我都用过）。

#### 一个比想象中更常见的问题

很多 CMS（内容管理系统）出于安全或架构考虑，往往会严格限制编辑器能控制的内容。编辑者可能能修改页面的一些结构或内容，但几乎无法改动 `<script>` 标签里的内容 —— 这是有道理的，毕竟那会引入很多潜在的安全风险。

更复杂的是，这些脚本往往引用外部团队维护的共享包，但又需要某些配置参数。在这种情况下，就算想在服务器端把变量渲染到脚本里，也做不到。

```
 <!-- 共享库，但仍需要配置！ -->
 <script src="path/to/shared/signup-form.js"></script>
```
在类似的场景中，我见过一种常用做法：通过服务器渲染的数据属性（data attributes）传递配置值。服务端定义这些属性，脚本在客户端读取即可。这种模式在单页应用（SPA）中尤其常见，比如配置写在根节点上：

```
 <div
   id="app"
   data-recaptcha-site-key="{{ siteKey }}"
 ></div>
```
```
 import React from 'react';
 import ReactDOM from 'react-dom/client';
 import App from './App';

 const appNode = document.getElementById('app');
 const root = ReactDOM.createRoot(appNode);

 root.render(
   // 从根节点读取配置值
   <App recaptchaSiteKey={appNode.dataset.recaptchaSiteKey} />
 );
```
应该已经很明显我接下来要说什么了：使用 data 属性，是从服务器传递特定值到客户端的一种简洁方式。

在上面的单页应用例子里，唯一略显麻烦的地方是 —— 在访问属性前，你得先查询对应的元素。

但在我的场景中，既然是 `<script>` 标签本身在执行代码，那连这一步都可以省掉。因为 `document.currentScript` 能直接提供当前脚本的引用。

```
 <script
   data-stripe-pricing-table="{{pricingTableId}}"
   data-stripe-publishable-key="{{publishableKey}}"
 >
   const scriptData = document.currentScript.dataset;

   document.querySelectorAll('[data-pricing-table]').forEach(table => {
     table.innerHTML = `
       <stripe-pricing-table
         pricing-table-id="${scriptData.stripePricingTable}"
         publishable-key="${scriptData.stripePublishableKey}"
         client-reference-id="picperf"
       ></stripe-pricing-table>
     `;
   })
 </script>
```
这感觉就很完美了。既没有依赖什么神秘的框架特性，也没污染全局作用域，而且还能自豪地发帖说我是在 “用平台本身的能力解决问题”。可以说是皆大欢喜。

#### 其他应用场景

在研究 `document.currentScript` 的过程中，我又想到了一些潜在的用法，其中一个甚至是在这篇文章发表后有人提到的。

[【第3616期】JavaScript 原型污染](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277982&idx=1&sn=7e2f24da357206da210422c8c0c33e61&scene=21#wechat_redirect)

##### 安装提示（Installation Guidance）

假设你维护着一个 必须异步加载 的 JavaScript 库。你可以利用 `document.currentScript` 为开发者提供清晰直接的加载反馈：

```
 <script defer src="./script.js"></script>
```
```
 // script.js
 if (!document.currentScript.async) {
   throw new Error("这个脚本必须以异步方式加载！！！");
 }

 // 你的库的其他代码……
```
你甚至还能强制要求脚本加载在页面的某个特定位置。比如要求它必须紧跟在 `<body>` 标签的开始处加载：

```
 const isFirstBodyChild =
   document.body.firstElementChild === document.currentScript;

 if (!isFirstBodyChild) {
   throw new Error(
     "这个脚本必须紧贴在 <body> 标签的开头加载。"
   );
 }
```
这样的报错几乎没有歧义：

总体来看，这种方式能给出友好、直观的加载指导。算是良好文档的一个有力补充。

#### 行为局部性（Locality of Behaviour）

这个思路来自 Reddit 用户 ShotgunPayDay。“行为局部性原则” 认为：你应该能够仅通过查看某段代码本身，就理解它的行为。像 Vue、Svelte 这样的 “单文件组件（SFC）” 框架，就是这种理念的体现 —— 逻辑、样式、结构都集中在一起。

与 `document.currentScript` 结合时，这个原则意味着：你可以仅凭相邻元素的存在，就构建出可移植的小型交互功能。

例如，下面的例子可以让任意表单在提交时自动通过 AJAX 异步提交。只需把脚本标签放在表单后面即可。脚本会自动找到它前面的那个元素：

```
 // form-submitter.js

 const form = document.currentScript.previousElementSibling;

 form.addEventListener("submit", async (e) => {
   e.preventDefault();

   const formData = new FormData(form);
   const method = form.method || "POST";

   const submitGet = () =>
     fetch(`${form.action}?${params}`, { method: "GET" });

   const submitPost = () =>
     fetch(form.action, { method, body: formData });

   const submit = method === "GET" ? submitGet : submitPost;
   const response = await submit();

   form.reset();

   alert(response.ok ? "提交成功！" : "发生错误！");
 });
```
然后，只需在表单后面引入这个脚本即可：

```
 <form action="/endpoint-one" method="POST">
   <input type="text" name="firstName"/>
   <input type="text" name="lastName"/>
   <input type="submit" value="提交" />
 </form>
 <script src="form-submitter.js"></script>

 <form action="/endpoint-two" method="POST">
   <input type="email" name="emailAddress" />
   <input type="submit" value="提交" />
 </form>
 <script src="form-submitter.js"></script>
```
这种模式我短期内可能不会主动使用，但能知道这种可能性确实挺有意思。

#### 感觉真不错（Feel’s Good）

终于搞清楚这些 “老旧但被忽视” 的 Web 特性到底有多实用，这种感觉非常棒。它让我对早期 Web API 的设计者们多了一份敬意 —— 毕竟他们当年要面对的，正是像我们这些 “现代程序员” 一样的挑剔用户。

我现在也开始期待自己还能发现哪些被遗忘的宝藏。说不定哪天我们会惊讶地发现 ——AGI 其实早就在 HTML 规范里，只是我们还没注意到。

关于本文  
译者：@飘飘  
作者：@Alex MacArthur  
原文：https://macarthur.me/posts/current-script/

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
