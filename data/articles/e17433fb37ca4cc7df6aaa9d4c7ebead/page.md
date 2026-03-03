---
title: "【第3627期】从媒体查询到样式查询：Chrome 142 如何让 CSS 更懂“数值”"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278210&idx=1&sn=64ba5c14880aae308f0e311a22024cc6&chksm=bc4d2d1f95736eb50ac88941a0682f78d6a515e6f97a844c84501e112c74c6e9638a4fc42e4b&scene=0#rd"
date: 2025-12-18
md5: e17433fb37ca4cc7df6aaa9d4c7ebead
---

# 【第3627期】从媒体查询到样式查询：Chrome 142 如何让 CSS 更懂“数值”

前言

CSS 的响应式能力正在进入新阶段。Chrome 142 推出的 Range 语法，让样式查询可以直接基于数值范围作出判断，不再局限于屏幕尺寸或容器大小。这意味着，我们终于可以只用 CSS，就实现以往需要 JavaScript 才能完成的动态响应。

今日前端早读课文章由 @Amit Kumar 分享，@飘飘编译。

译文从这开始～～

上周我在调试一个响应式组件，发现自己一遍又一遍地写相同的样式规则。阈值不同、数值不同，但模式都一样。然后我看到 Chrome 142 新增了一个特性 —— 说实话，它感觉就像是我们一直在等待却不知道它已经存在的功能。

[【第3619期】让字距随字体自适应变化的 CSS 技巧](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278003&idx=1&sn=72f8517f9201eabd058015706fcacc14&scene=21#wechat_redirect)

我说的就是 CSS 样式查询（Style Queries）的区间语法（Range Syntax）。

随着 CSS 的发展，我们先有了响应式设计，然后是容器查询（Container Queries），现在又有了带范围语法的样式查询。今天我会带你了解如何跳出「精确匹配」的限制，构建能够根据数值阈值灵活响应的组件系统。我在构建灵活组件系统时已经尝试过它 —— 这功能能帮你大大减少摩擦。我们将看看它是如何工作的、有哪些实际用途，以及为什么它会改变一切。

让我们直接进入精彩的部分。

#### CSS 中的自适应样式匹配

现在，让我们来了解这个功能 —— 它能让你在不写 JavaScript 的情况下，根据数值区间创建响应式样式。

以前的样式查询是这样的：你的自定义属性要么匹配某个值，要么不匹配。比如 `style(--rainy: true)` 只能匹配 `true`，其他都不行。

```
 /* 样式查询必须精确匹配（旧写法） */
 @container style(--rainy: true) {
   .weather-card {
     background: linear-gradient(140deg, skyblue, lightblue);
   }
 }
```
但如果你需要更精细的控制呢？

比如你的间距变量是 `--padding: 1.5em`，你只希望当它超过 `1em` 时才触发布局变化；  
又或者你的组件透明度是 `--opacity: 0.75`，你想在超过 50% 时改变视觉样式。

你卡主了，以前，你只能用 `calc()` 来变通，或者直接上 JavaScript。

而 Chrome 142 改变了这一切。

[【第3483期】如何在 Node.js 中选择 SQL、查询构建器和 ORM](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651276114&idx=1&sn=775732ccf24a78288480c12f83ad89eb&scene=21#wechat_redirect)

现在你可以在样式查询中直接使用比较运算符：`>`, `<`, `>=`, `<=`。这意味着你可以比较数值，而不是仅仅匹配固定值。

```
 /* 旧写法：只能精确匹配 */
 @container style(--inner-padding: 1em) {
   .card { border: 2px solid; }
 }

 /* 新写法：支持范围比较 */
 @container style(--inner-padding > 1em) {
   .card {
     border: 2px solid;
     padding: 2rem;
   }
 }
```
在上面的例子中，当 `padding` 超过 `1em` 时，第二条规则就会生效。这样，阈值就变成了动态的，而不是写死的。

#### 区间语法在背后是如何运作的

当样式查询运行时，浏览器会检查比较两边的值类型是否一致。如果类型相同，就判断条件是否成立；如果不同，查询直接返回 `false`。

[【第3324期】媒体查询与容器查询——该使用哪个以及何时使用？](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651272007&idx=1&sn=1cc858943adf0a6ab1261fec8fb5e8e9&scene=21#wechat_redirect)

只有当两边解析为相同的数值类型时，比较才是有效的。CSS 支持以下数值类型用于区间比较：

- length（长度）：px、em、rem、vh 等
- number（纯数字）：整数或小数
- percentage（百分比）：25%、100% 等
- angle（角度）：deg、grad、turn、rad
- time（时间）：ms、s
- frequency（频率）：Hz、kHz
- resolution（分辨率）：dpi、dpcm

你可以比较自定义属性、字面值，甚至是通过 `attr()` 从 HTML 属性中获取的值。这就是它的强大之处 —— 你不再受限于硬编码的数字。

```
 /* 比较自定义属性与字面值 */
 @container style(--font-scale > 1.5) { }

 /* 比较 HTML 属性与自定义属性 */
 @container style(attr(data-level type(<integer>)) >= 50) { }

 /* 比较两个 HTML 属性 */
 @container style(attr(data-current) > attr(data-threshold)) { }
```
浏览器会先解析两边的值，然后再进行比较。如果类型匹配，查询成立；如果不匹配，规则就不会生效。

#### 为什么这个功能这么酷

来看看我为什么会爱上这个新特性：

- 减少重复代码：以前我得写好几个样式查询，或者用 JavaScript 监听事件。现在一个范围查询就能搞定原来要写三次的逻辑。
- 彻底告别 JS 依赖：不需要再用跟踪库、状态管理器或事件处理函数 —— 浏览器原生就能完成。
- 组件更灵活：一个卡片组件不需要预先知道所有可能的间距值，它只需声明：“当 `padding` 超过 `1em` 时，切换布局。” 这对任何设计系统中的 padding 值都有效。

#### 将范围语法与 `if()` 结合使用

`if()` 函数与范围语法搭配使用时，可以在 CSS 中直接写出条件逻辑，非常直观：

```
 .component {
   background-color: if(
     style(--brightness > 60%): white;
     style(--brightness > 30%): lightgray;
     else: #222
   );

   border-width: if(
     style(--emphasis > 7): 3px;
     else: 1px
   );
 }
```
这就像写三元运算符一样，多个条件，一个声明：当亮度大于 `60%` 时用白色；在 `30%` 到 `60%` 之间用浅灰；低于 `30%` 时则用深色背景。整个主题样式能随着一个自定义属性的数值自动变化。

#### 类型匹配要求：可能出错的地方

这里有个需要格外注意的点 —— 类型必须一致，否则样式查询会失效。

两边的比较值必须是同一种数值类型。比如你不能直接比较 `20px` 和 `1.5em`，这会出错。

```
 /* 正确：两者都是长度类型 */
 @container style(--spacing > 1em) { }

 /* 错误：长度 vs 无单位数字 */
 @container style(--spacing > 50) { } /* 如果 --spacing 是 1.5em，这样会错 */

 /* 正确：两者都是整数 */
 @container style(attr(data-count type(<integer>)) > 5) { }

 /* 错误：整数 vs 百分比 */
 @container style(attr(data-count type(<integer>)) > 50%) { }
```
所以，如果你的设计系统定义了 `--gutter: 2rem`，那你只能把它和其他长度单位（如 em、px、vh）比较，而不能与百分比或无单位数值混用。否则查询会静默失败。

👉 建议：在写比较逻辑前，先检查你的设计 Token 类型。保持类型一致，是关键。

[【早阅】将 Claude 代码变成自己的超赞 UI 设计师（使用 Playwright MCP ）](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277548&idx=1&sn=e49bd502f1e80c922686833f064a9898&scene=21#wechat_redirect)

##### 示例 1：动态卡片颜色变化

让我们看一个简单的例子。假设你要做一个天气组件，API 会返回降雨百分比。以前没有范围语法时，你得为不同数值写多个精确匹配的查询。

现在看看只用纯 CSS 就能实现的效果：

```
 <!DOCTYPE html>
 <html>
   <head>
     <title>Page Title</title>
     <style>
       .weather-container {
         container-name: weather;
         --rain-percent: attr(data-rain-percent type(<percentage>));
       }

       .weather-card {
         background: linear-gradient(140deg, #ffd89b, #ffe6b3);
         padding: 2rem;
         border-radius: 8px;
       }

       /* 小雨：0-30% */
       @container style(--rain-percent <= 30%) {
         .weather-card {
           background: linear-gradient(140deg, #ffd89b, #ffe6b3);
         }
       }

       /* 中雨：30-60% */
       @container style(--rain-percent > 30%) and style(--rain-percent <= 60%) {
         .weather-card {
           background: linear-gradient(140deg, #87ceeb, #b0e0e6);
         }
       }

       /* 大雨：超过 60% */
       @container style(--rain-percent > 60%) {
         .weather-card {
           background: linear-gradient(140deg, #4682b4, #5f9ea0);
         }
       }
     </style>
   </head>
   <body>
     <div class="weather-container" data-rain-percent="90%">
       <div class="weather-card">
         <h3>Tomorrow</h3>
         <p>Rain expected</p>
       </div>
     </div>
   </body>
 </html>
```
只要修改 `data-rain-percent` 属性的值，卡片的背景就会立即随之变化 —— 小雨时是浅色渐变，大雨时是深色渐变，全程无 JS，纯 CSS 响应。

##### 示例 2：用 `attr()` 把数据直接引入样式

更酷的是，现在可以通过 `attr()` 直接在 CSS 中读取 HTML 属性！

[【第3586期】从规范看 JavaScript 数组：隐藏的对象属性](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277413&idx=1&sn=6cd7cd4a8dce0820aaca7d58b53af513&scene=21#wechat_redirect)

想象一个商品卡片，库存数量就写在 HTML 属性中：

```
 <!DOCTYPE html>
 <html>
   <head>
     <title>Page Title</title>
     <style>
       .container {
         container-name: cardcontainer;
         --data-stock: attr(data-stock type(<integer>));
       }

       .product {
         border: 1px solid gray;
       }

       /* 库存少于 10 时 */
       @container cardcontainer style(attr(data-stock type(<integer>)) < 10) {
         .product {
           border: 2px solid orange;
           background-color: if(
             style(--data-stock < 4): orange;
             style(--data-stock < 8): yellow;
             else: white
           );
         }

         [data-label="stock"] {
           color: #ff6b35;
           font-weight: bold;
         }
       }

       /* 库存少于 5 时显示提示 */
       @container cardcontainer style(attr(data-stock type(<integer>)) < 5) {
         [data-label="stock"]::after {
           content: " — Hurry!";
         }
       }
     </style>
   </head>
   <body>
     <div class="container" data-stock="9">
       <div class="product">
         <h3>Awesome Widget</h3>
         <p data-label="stock">9 in stock</p>
       </div>
     </div>
   </body>
 </html>
```
当库存低于 10 时，边框会变成橙色；当低于 5 时，还会自动显示警告文字 “— Hurry!”。

整个效果完全由 CSS 实现，不需要任何 JavaScript。

#### 浏览器支持情况：目前只有 Chrome 领先，其它浏览器正在跟进

现实情况是：截至 2025 年 12 月，区间语法（Range Syntax）仅在 Chrome 142 及以上版本中可用，其他浏览器（如 Firefox、Safari、Edge）虽然已经在跟进标准，但还没有正式发布支持。

如果你现在就要在生产环境中使用，那就必须准备一个 回退方案（fallback）。

可以用 `@supports` 来检测浏览器是否支持相关特性：

```
 .component {
   color: darkgray; /* 不支持的浏览器使用的回退样式 */
 }

 @supports (background: if(style(--theme: dark): black; else: white)) {
   .component {
     color: if(style(--theme: dark): white; else: black);
   }
 }
```
目前，你应该把它视为一种 渐进增强（progressive enhancement）。非常适合在 内部仪表盘、设计系统、组件库 等场景中使用 —— 这些地方的用户通常会运行较新的浏览器版本。

#### 最后的总结

样式查询（Style Queries）的区间语法，并不是为了取代媒体查询或容器尺寸查询。它无法解决所有响应式设计问题。

但如果你需要样式根据 设计 Token 中的数值阈值 自动响应，那它就是完美的工具。

它的魅力在于简单。一旦你开始使用，就会发现 JavaScript 曾经带来了多少额外的复杂性。你甚至会想在所有地方都用它 —— 但要克制！只在那些确实需要「语义自适应」的地方使用它。

现在就可以在 Chrome 中开始尝试：试着在样式中引用属性值、比较自定义属性，构建那些能自动响应、却完全不依赖 JavaScript 的组件。

[【第3613期】JavaScript 中的错误链：用 Error.cause 让调试更清晰](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277933&idx=1&sn=d6d1eacd20690c6271a78026f2eaed23&scene=21#wechat_redirect)

关于本文  
译者：@飘飘  
作者：@Amit Kumar  
原文：https://amit08255.medium.com/css-just-got-its-most-addictive-combo-ever-you-will-love-in-2026-3f4cad0111f2

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
