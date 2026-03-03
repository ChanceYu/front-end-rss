---
title: "vue 难受了！solid.js 一个小改变，让 vue vapor 很尴尬"
link: "http://mp.weixin.qq.com/s?__biz=MzI3NTM5NDgzOA==&mid=2247517499&idx=1&sn=6c933f1e0cf2c0a78518513fabb9dd23&chksm=eb07bd42dc7034542a7eb89914f2d8545c985a818e1662cdcafb120a175e7fa6072e77b95fad#rd"
date: 2025-12-31
md5: 8b9d3e6489acd1a1b57b5135ea1419d6
---

# vue 难受了！solid.js 一个小改变，让 vue vapor 很尴尬

![图片](./images/aee93eba766bfab8cf9bdb90ce3be280.png)

这几天， `Vue JSX Vapor` 很火，被大家讨论得比较多。因为 `vue/vue-jsx-vapor@3.1` 正式发布。

由于 vue 正在开发中的 `vapor` 模式，彻底抛弃了虚拟 DOM，在性能上会有一个巨大的提升，甚至达到碾压 React 的程度。因此，许多人非常看好 Vue 的新版本。

> ✓
> 
> 当然模仿也不是什么丢人的事儿，毕竟 Svelte 5.0 的底层原理，也在深度模仿 `solid.js`

我们继续聊下一个问题，为什么 vue 生态那么执着于想要拥抱 JSX 呢？

深度用过 Vue 的朋友们基本上都能够知道，Vue 在 TS 的支持上，有点难受。 vue2 我就不说了，难受的地方比较多，Vue 3 在在 ts 的支持上，获得了巨大的改善，基本上**大多数情况下都还行**，

但是，依然存在很多问题

主要的原因有如下几个方面

### 1、template 与 ts 断层

这是 `vue ts` 开发中最核心的痛点，vue 文件是以 `.vue` 结束，`ts` 天生就不认识这个文件。

因此，vue 团队花费巨大的代价，开发了 `Volar/Official` 插件进行模拟检查。它本质上是把 template 转换成虚拟的海量的 TS 代码再进行推导。这一额外工作，带来的巨大痛点，就是：**项目大的时候，太卡了**，这个插件的性能开销非常大，在大型项目中，这种类型转换会导致保存代码后有几秒钟的延迟才能看到报错，极大地影响了 TS 实时反馈的优势

也正因为如此，当 template 中出现错误时，报错信息有时没那么直观，甚至会出现**类型实例化过深**或指向源码编译后的位置等额外情况，很难像在 `.ts` 文件中那样精准定位

还有一个比较常见的问题就是，当我们重命名一个变量之后，在 `template` 中，一些复杂的表达式和三元运算符没办法同步更新，从而导致运行时报错

说到底，就是难受！好消息就是，在他的最新版本(vue(Official) 2.x) 中，对这一情况进行了优化，他已经可以作为 ts 的原生插件来运行，性能得到了很多提升，内存占用也减低了很多，但依然存在很大的问题。

### 2、ref 在 JS 逻辑中与 template 中的不一致导致的类型模糊

我们都知道，当我们使用 `ref` 去创建一个响应式变量时，在 JS 逻辑中使用，必须要加上 `.value`

但是，在 `template` 中，又可以不写 `.value`

这个让 ts 的类型推导就很难办了。于是许多开发者在使用 ts 时就会出现一些漏判的情况，

举一个大家都还能容忍的简单例子

```
const count = ref(0)

// 此时应该对应一个逻辑错误，但是 ts 不会因此而提示你漏写了 `.value`
if (count) {
  // 永远执行，判断无效
}
```
又比如在类型推导上的一些麻烦

有这样一个对象

```
const state = {
  count: ref(0) // 嵌套在普通对象里的 ref
}
```
在 `template` 中，当我们这样写 `{{ state.count }}` 时，无法确保类型被 ts 解析为 `number`，因此，当你的数据结构变得复杂时，模板中的类型有可能会出现幽灵报错：你的代码是对的，但是 ts 认为你类型不匹配

而在使用时，也会为此感到困扰，如果向一个函数或者组件传入 props 时，这个参数的类型应该约定为 `Ref<T>` 还是 `T`？

这种类型系统的双重标准，感觉用起来非常繁琐，不知道其他人有没有跟我一样的感受 ～

除此之外，vue3 在泛型的使用、指令类型的缺失、宏需要特殊处理等方面都多多少少有点难受

所以 vue 3 在每个版本中都在试图解决这些问题，这些问题也导致了，vue 生态中，总有人更愿意拥抱 `JSX`

因为，ts 对 jsx 的支持非常自然与丝滑。

而 `solid.js`，是目前前端框架中，与 ts 结合得最完美的框架之一。他完全没有 `vue` 在这方面的痛点。

那为什么我要在标题里说，solid.js 的一个小改变，就可以让 `vue vapor` 很尴尬呢，因为，我们只需要对 `solid.js` 稍作封装，就可以轻松的把 `vue` 的 ref 语法，带到 `solid` 里面来

代码如下所示

```
import { createSignal, SignalOptions } from"solid-js";

export interface Ref<T> {
get value(): T;
set value(v: T);
}

export function ref<T>(initialValue: T, options?: SignalOptions<T>): Ref<T>;
export function ref<T = any>(): Ref<T | undefined>;

export function ref<T>(initialValue?: T, options?: SignalOptions<T | undefined>): Ref<T | undefined> {
const [get, set] = createSignal(initialValue, options);

  return {
    get value() {
      returnget();
    },
    set value(v: T | undefined) {
      set(() => v);
    }
  };
}
```
简单封装过后，使用如下所示

```
import { createEffect } from"solid-js";
// 假设上面的代码保存在 ref.ts
import { ref } from"./ref"; 

function App() {
const count = ref(0);

// 在副作用中自动追踪
  createEffect(() => {
    console.log("Count 改变了:", count.value);
  });

return (
    <div>
      <p>当前值: {count.value}</p>
      <button onClick={() => count.value++}>
        增加
      </button>
      <button onClick={() => (count.value = 0)}>
        重置
      </button>
    </div>
  );
}
```
大家看到了吗，**最完美的 `vue + jsx` 形态，就这么出现了**。他拥有比 `vue 3.6` 的 vapor 模式还要高的性能、他在 ts 的使用上毫无心智负担，他不需要内置一个性能损耗巨大的 `volar/official` 编辑器插件。

轻松，丝滑，毫无压力。

为什么，`solid.js` 可以如此轻松的模仿 `vue` 的 ref 语法？**还不会出现其他副作用**？

其根本原因，就在于，他们的底层实现原理实在是太像了。vue3 在底层原理上，深度模仿了 solid.js，因此，他们在基础语法上的使用特性，实际上是基本一致的

**甚至连他们面对的响应数据解构失去响应性的问题，都完全一致**。`solid.js` 已经是 `vue` 最想成为的样子。

在底层原理的实现上，他们同样基于 `Proxy` 实现了信号系统。他们在[编译阶段，进行静态提升，并且，将动态代码直接编译成为了 DOM 操作](https://mp.weixin.qq.com/s?__biz=MzI4NjE3MzQzNg==&mid=2649871984&idx=1&sn=fa7a15baecfb0ced6781f296bbfb50d3&scene=21#wechat_redirect)。从而使得可以完全放弃虚拟 DOM，不再需要繁杂的 diff 程序，就可以做到更新节点

由于静态提升的存在，`solid.js` 在打包体积这一块，也做到了极致的优化。vue vapor 同样也在这个方向做了努力。

还由于 `signal` 机制的存在，`solid.js` 的更新是精准的定向更新，时间复杂度为 `O(1)` 的最佳更新效率。因此，`solid.js` 在对外宣传自己的性能时，常常用：媲美原生 DOM 的性能这样的描述。

`svelte` 在之前的版本中，虽然也使用预编译来提高自己的性能，也没有使用虚拟 DOM，也有超高的运行时性能，但是，其底层的机制导致了它的打包体积会随着页面的增多而极大的增加。甚至比 React 的包体积还夸张得多。因此，`svelte` 非常适合做一些轻量的官网应用，而不适合重型应用。

但是，`svelte` 5.x 的版本中，在底层实现上，也进一步模仿了 `solid.js`，这足以说明 `solid.js` 在策略上的成熟与先进。

因此，当你深入了解 `solid.js` 之后你就会发现，`vue vapor` 也没有那么值得期待了。因为他的 `vue vapor` 发布之后，由于历史的原因，他还要兼容混合模型，可以说是负重前行，这就导致了他的性能必然不可能比 `solid.js` 做得更好

而如果你又非常喜欢 `vue + jsx`，直接用 `solid` 稍微改一下他的响应式语法，你就可以获得完全形态的 `vue + jsx` 开发体验。和 vue vapor 相比

1、比 vue vapor 有更强的性能

2、与 ts 完美结合

3、更简单的 props 传参

4、更轻量的本地开发环境

5、完全一致的 `ref` 语法

### 3、`solid.js` 2.0 最值得期待的特性

2025 年年初，`solid.js` 团队宣布正式进入 2.0 的研发工作，其中，他们要解决的一个最核心的问题就是

要支持 `props` 的解构。

对于 React 开发者来说，这具备致命的吸引力。

在之前的版本中，如果我们将状态作为 `props` 传入到子组件，子组件只能通过 `props.count` 的方式使用

如下的方式使用，就会失去响应性

```
function MyComponent(props) {
  // 在这一行，props.count 的值被读取并赋值给了一个普通的局部变量 count
  // 此时 count 只是一个死数字（比如 0），后续 props.count 变化，这个变量也不会动
  const { count, title } = props;

  return (
    <div>
      <h1>{title}</h1>
      <button>{count}</button>
    </div>
  );
}
```
并且，在设置默认值上也很麻烦， 跟 vue 一样， 都需要借助额外的工具方法才能很好的完成

```
import { mergeProps, splitProps } from"solid-js";

function MyComponent(initialProps) {
// 设置默认值需要 mergeProps
const props = mergeProps({ title: "Default" }, initialProps);

// 拆分属性需要 splitProps
const [local, others] = splitProps(props, ["count", "title"]);

return (
    <div>
      <h1>{local.title}</h1>
      {/* 必须始终带上前缀 */}
      <button>{local.count}</button>
      <div {...others} />
    </div>
  );
}
```
`2.0` 之后，我们就可以像写 `React` 组件那样，把函数组件当成标准的 `js` 一样解构，编译器会利用编译魔法，自动帮我们处理好响应性。

```
// 直接在参数位置解构，甚至支持 ES6 默认值
function MyComponent({ count, title = "Default", ...others }) {
  
  // 在 2.0 中，这里的 count 依然是响应式的！
  return (
    <div>
      <h1>{title}</h1>
      <button>{count}</button>
      <div {...others} />
    </div>
  );
}
```
长得就跟 React 一毛一样。

### 4、soli.js 这么强，为什么对 React 的冲击很微弱

`solid.js` 并非一位年轻选手，他早在 2018 年就已经正式开源，在前端框架这个领域，打拼了快要 8 年了。

但是，为什么在市场上， `solid.js` 对 react 的冲击依然非常微弱呢？

**a、生态惯性**

`React` 具备庞大到可怕的完整生态。哪怕是一个很小众的 md 渲染方向，都有大量的三方库进行支持. 所有的开源库，第一时间的目标，就是想要支持 React

因此，到目前为止，React 代表的已经不仅仅是一个 UI 库那么简单了，它是一个庞大的**工业标准**

假如你要使用一个前端框架来开发你的应用，我依然会首先推荐你选择 React，因为其庞大的生态系统，不会出现：**突然就遇到一个小众的需求市面上没有开源库**的情况。

而这，在其他的框架使用中会经常遇到。

在过去，很多三方库野心勃勃，想要同时兼顾多个热门框架。但是，维护一段时间之后，你就会发现，由于 React 的使用者最多，他们也不得不把核心的精力都转向 React，从而导致其他框架的支持力度不够，慢慢出现偏科的情况

当然，在 2025 年，逐渐开始有更多的开源库走**框架无关**的路线，这一现象可能会在未来被这一趋势改变，但这依然需要很多年的发展。

**b、战场转移：React 始终保持了概念上的领先**

React 不断的在转移新的战场，逼迫其他框架只能苦苦跟随。除了目前已经被所有框架追平的 `hooks` 理念之外，还有其他的特性。

例如**并发模式**，在追求交互体验的时代，并发模式的必要性越来越被凸显出现。让不支持并发模式的框架平白多出来一个短板。在并发模式的支持力度上，`solid.js` 对 `useTransition + Suspense` 进行了深度的模仿，`vue` 也搞出来了 `Suspense`，但是还没完全支持，svelte 在 `5.x` 版本中模仿了 `solid.js` 的底层原理，也为并发模式的实现留下了理论基础，做好了前置准备

又例如 `react server component`，由于这一理念的领先，其他框架不得不跟进支持，例如 `nuxt` 已经把 `server component` 作为了实验性特性，`solid.js` 虽然声称 rsc 不是那么紧迫的需求，但是也已经在 `solidStart` 中准备跟进，只不过距离成熟还有很长一段路要走

而 `nextjs` 不仅已经将 `rsc` 完整落地，甚至在缓存方案上面已经走了几年的坑，目前已经趋于成熟，`next.js` 开发者已经马上就能很舒服的享受 rsc 部分更新的特性。这一理念又可以领先好几年

**其他框架，疲于追逐啊** ～

**c、性能**

我们都知道，在许多性能的基准测试中，有许多框架表现都比 `react` 更好，大多数都把 react 按在地方疯狂摩擦。

但是，除了 react 19 中剔除 useEffect 的影响之外，`nextjs` 的 rsc 让 react 项目的性能有一个巨大的提升。不管是纯静态的客户端项目，还是结合服务端渲染的 ssr 项目，他可以把项目一些庞大的运行时静态内容，在构建时执行，或者在服务端运行。

例如 md 渲染、大列表渲染等场景。这一方式，让 react 在**客户端初始化**渲染时，直接获得远远超过 `solid.js` 的显示性能。solid.js 虽然非常快，但是他依然需要基于 JS 逻辑去创建列表，而 rsc 直接就是已经渲染好的静态 HTML 内容.

> ✓
> 
> 我们目前可以结合 Astro + solid.js 来追平 RSC 的大部分体验

当然，在重交互的场景中，rsc 无法获得这样的性能优势。在这种场景之下，许多 react 高手的做法是，用 next.js 套壳进行初始化运行，然后另外内置一套原生级的发布订阅模块，来直接获得原生级别的更新效果。最终出来的页面运行性能，不会比 `solid.js` 差。

因此，现在形成的局面就是，react 在性能的体验上，并没有全面落后，大家各有千秋。而在许多大厂团队的项目中，初始化渲染性能相关的指标，又显得极为重要，甚至很多团队都是**面向指标开发**。轻交互的项目涵盖了我们 90% 的项目场景，在这种情况下，得益于 `next.js` 的 rsc 特性，react 依然保持了领先

并且，`next.js` 将战场，从浏览器渲染性能，转移**全栈数据结构**之后，其他框架想要跟进，所花费的时间成本就更高了。

  

---

  

- 我是 ssh，工作 6 年+，阿里云、字节跳动 Web infra 一线拼杀出来的资深前端工程师 + 面试官，非常熟悉大厂的面试套路，Vue、React 以及前端工程化领域深入浅出的文章帮助无数人进入了大厂。
- 欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2025 陪你一起度过！
- ![图片](./images/069dacab1d5241065a517ed4a3872cb9.png)
- 关注公众号，发送消息：
  
  指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。
  
  简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。
  
  面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！
