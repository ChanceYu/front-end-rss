---
title: "【第3635期】用 JavaScript + JSDoc + tsc，优雅取代 TypeScript 的最佳实践"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278339&idx=1&sn=dbccbeb9b02e73028a780dc2543b8272&chksm=bca0ffbe96b15621c40adabadaa7dea82c5c57e29ca920c903bd94b6cfcf87bb5afbb0002ccf&scene=0#rd"
date: 2026-01-05
md5: 1c9a5995ee511f21a49f10f390a5d1bc
---

# 【第3635期】用 JavaScript + JSDoc + tsc，优雅取代 TypeScript 的最佳实践

前言

从自身长期使用 TypeScript 与 JavaScript 的经验出发，表达了对纯 JavaScript 的偏爱。认为代码应专注于行为逻辑，而类型信息更适合以注释的形式存在，从而兼具可读性与文档性。通过在 `.js` 文件中启用 `// @ts-check` 并使用 JSDoc 注解，再结合 TypeScript 编译器（tsc），开发者即可在无需编写 `.ts` 文件的情况下享受类型提示与静态检查的便利。

今日前端早读课文章由 @Jared White 分享，@飘飘编译。

译文从这开始～～

作为一个同时在 TypeScript 和 JavaScript 代码库中都有丰富经验的人，我想告诉你：我更偏爱 JavaScript。

[【第3632期】真相揭秘：JavaScript 中根本没有真正的“取消异步”](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278276&idx=1&sn=3f36efc7cba4f4d0e2108117f7d66f69&scene=21#wechat_redirect)

这并不是因为我不喜欢为变量或函数定义类型。事实上，我非常喜欢！我甚至在写 Ruby 时也会这样做。😲

但问题在于，我并不喜欢 “类型” 成为代码本身的一部分。对我来说，代码应该只关注行为 —— 它叫什么、它做什么。而那些描述代码的 “元信息”—— 比如 “这是字符串”、“那是整数”—— 其实更适合作为文档的一部分，存在于代码注释中。毕竟，你本来就应该为自己的代码写文档。那种 “不要在代码中写太多注释” 的说法，实在是大错特错。

是的，我真心认为你应该尽可能为你的函数、值对象、类以及各种结构写注释（当然别写得太啰嗦…… 通常一两句话就够了）。这就引出了我们今天的主角 ——JSDOC

[【第1639期】如何使用 JSDoc 保证你的 Javascript 类型安全性](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651232576&idx=2&sn=f3b5abed35075c078002493ea555d667&scene=21#wechat_redirect)

在为 JavaScript 编写文档时，JSDoc 是首选工具。即便你从未用它来生成 API 网站（我个人也从没这样做过！），JSDoc 注释也能被各种工具和编辑器识别和解析。说到这里，我们就自然引出了 ——TypeScript。

**等等，你不是更喜欢 JavaScript 吗？那为什么又在讲 TypeScript？**

因为即使你写的是纯 JavaScript，只要使用 JSDoc，TypeScript 也能帮你做类型检查。（是不是有点绕？🥴）

举个例子，在标准的 TypeScript 中声明一个字符串变量可以这样写：

```
 let str: string

 str = "Hello world"
 str = 123 // 这会报类型错误！
```
但其实，在纯 JavaScript 文件中，你也可以通过在文件开头加上 `// @ts-check` 并用 JSDoc 标注类型，获得同样的类型检查效果：

```
 // @ts-check

 /** @type {string} */
 let str

 str = "Hello world"
 str = 123 // 这会报类型错误！
```
如果你用的是 VSCode 或 Zed 这样的编辑器，类型提示和错误通常会自动显示。不过，最好还是执行一次 `npm install typescript -D`，因为你可能希望在 CI 流程中独立运行 TypeScript 编译器（`tsc`）来生成类型声明文件或单独检查类型。

在我的 `package.json` 中，我会加上这样一个脚本：

```
 "build:types": "npx tsc"
```
你可以通过在项目根目录添加一个 `jsconfig.json` 文件来配置类型检查的行为，比如：

```
 {
   "compilerOptions": {
     "strictNullChecks": false,
     "target": "es2022"
   }
 }
```
同时，你可能还需要创建一个 `tsconfig.json` 文件，例如：

```
 {
   // 按项目结构修改这里
   "include": ["src/**/*"],
   "compilerOptions": {
     // 允许读取 JS 文件，否则默认会忽略
     "allowJs": true,
     // 生成 .d.ts 声明文件
     "declaration": true,
     // 只生成声明文件而不输出 JS
     "emitDeclarationOnly": true,
     // 声明文件输出目录
     "outDir": "types",
     // 在编辑器中“转到定义”时跳转到 JS 源文件
     "declarationMap": true
   }
 }
```
我知道这一切看起来有点多，但别担心，一旦你配置好编辑器和命令行工具，这套流程可以轻松复用到无数个项目中，慢慢就变得驾轻就熟了。

与其光说不练，不如直接看看实际例子吧！

[【第3523期】程序员专属提示词工程实战手册](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651276627&idx=1&sn=7bf690fbb30e67dfb8c10ef1bc6db2d2&scene=21#wechat_redirect)

#### JSDoc 实战

下面是一个带有多个参数的类构造函数示例：

```
 class ReciprocalProperty {
   /**
    * @param {HTMLElement} element - 要绑定的元素
    * @param {string} name - 属性名
    * @param {(value: any) => any} signalFunction - 用于创建信号的函数
    * @param {() => any} effectFunction - 用于建立副作用的函数
    */
   constructor(element, name, signalFunction, effectFunction) {
     this.element = element
     this.name = name
     this.type = this.determineType()
     // 等等……
   }
 }
```
可以看到，当你不太在意变量的具体类型时，使用 `any` 也是完全没问题的。而且，把类型信息写进注释的好处是 —— 你现在不仅有类型提示，还顺带有了文档！🙌

再比如，一个对象类型（在 TypeScript 中叫做 “record”）的声明方式：

```
 /** @type {Record<string, ReciprocalProperty>} */
 const attrProps = this.element["_reciprocalProperties"]
```
这里我们用 `this.element["_reciprocalProperties"]` 而不是点语法，是因为 TypeScript 对访问未知属性会发出警告。用 `[]` 的方式可以避免报错（前提是你确实清楚自己在干什么）。

下面是一个在 `for…of` 循环中内联声明类型的例子：

```
 for (const stop of /** @type {StreetcarStatementElement[]} */ ([...this.children])) {
   stop.operate()
 }
```
这种语法我也是摸索了好一阵子 😅。一般来说，当你需要在某段代码中使用内联类型时，可以把 `/** @type */` 放在一段用括号包裹的代码前面，这样通常都能生效。

另一个例子是在函数参数中内联声明类型：

```
 htmx.defineExtension("streetcar", {
   handleSwap: (swapStyle, _target, /** @type {Element} */ fragment) => {
     // ...
   },
 })
```
再来看如何通过 `@typedef` 语法导入仅类型（不是普通的 JS 导入）：

```
 /**
  * @typedef { import("./HostEffects.js").default } HostEffects
  */

 // 后面使用：
 /**
  * @param {HostEffects}
  */
```
你还可以用 `@typedef` 来定义相当于 TypeScript 中 `interface` 的结构，官方文档中也有详细说明。

最后，有时你可能需要写一些 TypeScript 不太喜欢的代码，这种情况也没关系！

正如官方文档所说：

> 当 TypeScript 给出的错误你认为不合理时，可以在前一行加上  
> `// @ts-ignore` 或 `// @ts-expect-error` 来忽略该错误。

#### JavaScript + JSDoc + tsc 应该成为业界默认组合

我已经多次表达过一个观点：让 TypeScript 成为行业默认选择，其实是个巨大的错误。我真心希望每一位开发者都能开始编写真正符合开放 Web 标准的 `.js` 文件 —— 这些文件无需任何构建步骤或额外工具，就能直接运行。

[【第3625期】写 TypeScript 不等于安全：边界设计才是关键](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278175&idx=1&sn=2da60babc2929aa6137423c66bf21839&scene=21#wechat_redirect)

与此同时，只要结合使用 JSDoc + tsc，你就能在 IDE 中获得类型提示，在 CI 中实现类型检查，享受到几乎和 TypeScript 一样的体验。这种方式可谓是 “鱼与熊掌兼得”。而真正必须转向 `.ts` 文件的情况，其实少之又少。

当然，也确实存在某些框架 “强制” 要求你用 TypeScript 编写代码。这种情况下就接受吧，没问题。  
但如果你对项目的结构和技术选型有发言权，我真心希望你能考虑使用纯粹的 JavaScript。

毕竟，ECMAScript 才是 Web 世界真正的通用语言，而不是 TypeScript。

关于本文  
译者：@飘飘  
作者：@Jared White  
原文：https://thathtml.blog/2025/12/nuances-of-typing-with-jsdoc/

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
