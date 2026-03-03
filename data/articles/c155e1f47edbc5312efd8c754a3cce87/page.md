---
title: "【第3632期】真相揭秘：JavaScript 中根本没有真正的“取消异步”"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278276&idx=1&sn=3f36efc7cba4f4d0e2108117f7d66f69&chksm=bc032f9918cf025bb50e9bf1c45f46e8e89df5abb5982c78fbb71109ee4d914ed4e6586f5964&scene=0#rd"
date: 2025-12-29
md5: c155e1f47edbc5312efd8c754a3cce87
---

# 【第3632期】真相揭秘：JavaScript 中根本没有真正的“取消异步”

前言

在 JavaScript 中，所谓 “取消异步操作” 其实只是停止等待结果。Promise、async/await 和 AbortController 从未真正终止过任务，所有的 “取消” 都只是协作式的放手，而非强制的中断。

今日前端早读课文章由 @Gabor Koos 分享，@飘飘编译。

译文从这开始～～

[【早阅】谁才是你的 AI 职场搭档？这份数据告诉你答案](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278272&idx=1&sn=7ca1a5f5d8554c86449b75c417c569e3&scene=21#wechat_redirect)

在某个时刻，每个 JavaScript 开发者都会问同样的问题：为什么我不能直接取消这个异步操作？

用户离开了页面、组件卸载了、一个新的请求取代了旧的请求 —— 按理说，应该有办法停止那些已经不再需要的任务吧！

实际上，我们经常会用一些熟悉的方式来处理：比如用 `Promise.race()` 加上超时限制，或者在结果返回后选择忽略，或者使用 `AbortController` 并以为问题已经解决。

这些方法在表面上似乎可行，但随着应用运行时间变长，往往会出现资源泄漏、延迟副作用，或者在高负载下出现不一致的行为。

问题的根本原因在于：JavaScript 本身并不提供 “任务取消” 的底层机制。一旦异步工作被调度执行，就没有通用的方式可以强制终止它。`Promise`、回调（callback）和 `async` 函数只是表示 “结果” 和 “后续动作”，而不是对底层执行的 “控制权”。

这就造成了意图与实际之间的脱节：开发者想的是 “停止工作”，而 JavaScript 的设计是 “让工作完成”，并在完成后再对结果作出反应。结果就是，许多所谓的 “取消技巧” 其实只是 “停止等待结果”，而不是真正 “停止工作”。

[【第3616期】JavaScript 原型污染](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277982&idx=1&sn=7e2f24da357206da210422c8c0c33e61&scene=21#wechat_redirect)

理解这一差距非常重要，因为这解释了 JavaScript 异步行为的许多现象：为什么 Promise 不能被取消、为什么超时不会真正中止执行、以及为什么 `AbortController` 被设计为 “信号机制” 而不是 “强制开关”。一旦你理解了这种模型，就会发现这些限制并非偶然，而是源自 JavaScript 的运行方式。

#### 取消（Cancellation） vs 超时（Timeout） vs 失败（Failure）

在 JavaScript 中，“取消” 操作常常被误解，是因为它经常与 “超时” 和 “失败” 混为一谈。  
虽然这三种情况都可能导致 “这个操作没有产生结果”，但它们本质上是完全不同的。

##### 取消（Cancellation）：“我不再需要这个结果”

取消是一种外部决定。操作本身可能完全正常，能够顺利完成，但外部因素（比如用户操作、应用状态变化、页面跳转、新请求到来）让这个结果变得无关紧要。

重要的是，取消并不代表出错。操作本身没有失败，只是因为结果不再需要而被要求停止。

在设计良好的系统中，取消是常规行为，而不是异常情况。

##### 超时（Timeout）：“我不想再等了”

超时并不会取消工作，它只是限制调用者等待结果的时间。

在 JavaScript 中，超时通常通过 `Promise.race()` 实现：

```
 await Promise.race([
   doWork(),
   timeout(1000)
 ]);
```
当超时率先完成时，等待的代码会恢复执行，但 `doWork()` 依然继续运行。它的副作用依然会发生，它占用的资源仍然存在，直到它自己结束或清理为止。

如今，大多数现代 API 都支持传入 `AbortSignal`。这让资源清理和意图传达更明确，但并没有改变核心模型：取消仍然是 “协作式” 的，只对支持它的代码有效。

这种区别容易被忽略，因为调用者重新获得了控制权，看起来好像 “任务停止了”。实际上，超时只是 “停止等待结果”，工作本身并没有停。

[【第3567期】React Suspense 的内部原理：抛出 Promise 与声明式异步 UI](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277190&idx=1&sn=673ab56d992bd74088941d7939fdf840&scene=21#wechat_redirect)

##### 失败（Failure）：“发生了错误”

失败描述的是内部问题：例如网络错误、输入无效、逻辑漏洞、资源不可用等。通常以被拒绝的 Promise 或抛出的错误来表示。

与取消不同，失败是非预期的。它意味着即便结果仍然需要，操作也无法成功完成。

把 “取消” 当作 “失败” 处理往往会导致尴尬的错误处理逻辑：代码可能会捕获并处理 “其实并不是错误” 的情况，或者误把真正的错误忽略掉。久而久之，真正的错误与正常的控制流程就变得难以区分。

##### 为什么区分这些很重要

在 JavaScript API 中，超时和失败常常被混用来表示取消。虽然在表面上可行，但这样做会模糊意图，让调用者难以判断到底发生了什么。

一旦你区分了这三种情况，就会发现一个规律：JavaScript 很擅长表示 “等待” 和 “失败”，但它并没有内建 “停止工作” 的概念。那些看似 “取消” 的机制，其实都是 “超时”、“忽略结果” 或 “协作协议”。

#### 为什么 Promise 不能被取消

当开发者问 “为什么取消在 JavaScript 中这么难” 时，他们通常指的是：“为什么我不能取消一个 Promise？” 毕竟，Promise 是 `async/await` 的基础，大多数异步操作都是用它表示的。  
如果 Promise 表示 “任务”，那么取消似乎应该很简单。

但实际上，Promise 从来就不是为了表示 “任务” 而设计的。

##### Promise 表示结果，而不是执行过程

Promise 是一个 “未来值” 的占位符。它并不关心这个值是如何产生的，甚至不保证当前是否有实际的任务在运行。当你拿到一个 Promise 时，底层任务可能早已完成、正在执行，或者被多个调用者共享。

[【第3602期】fluth-vue: 融合响应式的promise流](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277690&idx=1&sn=6b53700a4cbdd5a593e6827b222da4c2&scene=21#wechat_redirect)

这个区别非常关键：Promise 并不 “拥有” 它所代表的工作。

一旦创建，Promise 必须最终 “被解决”（fulfilled 或 rejected）。它没有 “被放弃” 或 “被取消” 这种第三种状态。否则就会破坏 Promise 的核心承诺：一旦你持有一个 Promise，就能可靠地附加回调并最终得到结果。

##### “取消 Promise” 的误区

想象一下我们为 Promise 添加一个 `.cancel()` 方法，它实际上会做什么？

```
 const p = fetchData();

 p.then(render);
 p.then(cacheResult);
```
如果某个调用者执行了 `p.cancel()`，那其他使用 `p` 的地方怎么办？  
它们的 `.then()` 回调是否也应该停止？Promise 是否应该被拒绝？用什么错误？如果之后又有新的 `.then()` 被添加呢？

这些问题没有一致的答案。Promise 是可共享、可组合的，一旦允许取消，取消行为就会带来全局副作用。

因此，取消逻辑不能存在于 Promise 自身。取消关乎 “控制任务”，而 Promise 关乎 “观察结果”。

##### 如果 Promise 可被取消，会有什么后果

让 Promise 支持取消，会对整个异步生态造成连锁影响：

- 共享的 Promise 会变得脆弱，因为任何消费者都可能影响其他人。
- 缓存和记忆化（memoization）将不再安全，因为缓存的 Promise 可能被意外取消。
- `async/await`
  
   的思维模型将被破坏，因为 `await` 不再能保证最终完成。

换句话说，取消会引入隐藏的耦合，让原本独立的代码块相互干扰。

[【第3613期】JavaScript 中的错误链：用 Error.cause 让调试更清晰](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277933&idx=1&sn=d6d1eacd20690c6271a78026f2eaed23&scene=21#wechat_redirect)

##### 为什么取消必须存在于别的地方

早期的库确实尝试过 “可取消的 Promise”，在标准化过程中也讨论过类似设计。  
结论是一致的：取消不是 Promise 的属性，而是调用者与被调用者之间的 “协作协议”。

这种协议需要一个独立的通道，能被传递、监听、响应，而不破坏 Promise 的语义。这就是为什么现代 JavaScript 把取消设计为 “信号（signal）”，而不是 “Promise 的操作”。

一旦你理解 Promise 是 “对未来结果的不可变观察”，而不是 “任务的句柄”，它不支持取消就不再是缺陷，而是让异步代码保持可预测性和可组合性的设计边界。

#### AbortController 的真正作用

如果 Promise 不能被取消，那我们要怎样控制或停止异步工作呢？这就是 `AbortController` 的用武之地。理解它 “能做什么” 和 “不能做什么”，是写出支持取消逻辑代码的关键。

##### AbortController 是一种 “信号机制”

`AbortController` 本质上只是一个信使，用来让代码的某一部分通知另一部分：任务不需要继续了。  
它通过 `AbortSignal` 来传递这一信号：

```
 const controller = new AbortController();
 const signal = controller.signal;

 fetch(url, { signal })
   .then(response => console.log('Fetched!', response))
   .catch(err => {
     if (err.name === 'AbortError') {
       console.log('Fetch 被中止');
     } else {
       console.error(err);
     }
   });

 // 稍后触发中止
 controller.abort();
```
这里的 `controller.abort()` 并不会 “神奇地” 停止所有 JavaScript 代码。它只是通知那些支持该信号的 API（比如 `fetch`）：工作不再需要了。`fetch` 会做出响应，拒绝 Promise 并关闭网络连接。仅此而已。

##### AbortController 能做什么

- 传递意图信号：任何监听该信号的代码都可以根据它作出反应。
- 帮助清理资源：比如 `fetch` 或 `stream` 可以关闭连接、释放句柄、停止生成数据。
- 传播取消请求：信号可以层层传递，让高层代码请求底层操作中止。

本质上，`AbortController` 提供了一种 “协作式取消协议”。只有那些选择 “配合” 的代码，才会响应取消信号。

[【第3389期】不要忽视 AbortController](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651273343&idx=1&sn=6f2d5e872649fbde8bfc7517ed745412&scene=21#wechat_redirect)

##### AbortController 做不到的事

- 无法停止任意的 JavaScript 执行：对于 CPU 密集的循环、同步函数或其他工作，如果它们没有主动检测信号，它们会一直运行到结束。
- 无法自动清理资源：只有响应信号的代码才能释放资源或终止任务。
- 无法通用地取消 Promise：它不会 “魔法般地” 取消底层的 Promise，它只是传达 “想要中止” 的意图。

#### Abort 是一种 “协作式” 的设计

`AbortController` 的协作性是有意为之的，原因如下：

- 它避免了意外破坏共享状态或中途终止运行中的代码；
- 它保留了 JavaScript 的 “执行到完成（run-to-completion）” 语义；
- 它让 API 作者可以灵活地决定如何响应中止信号，而不是强制统一行为。

例如，考虑一个长时间运行的计算：

```
 async function compute(signal) {
   let i = 0;
   while (i < 1e9) {
     if (signal.aborted) {
       console.log('计算被中止');
       return;
     }
     i++;
   }
   return i;
 }
```
如果函数没有主动检查 `signal.aborted`，是无法停止这段计算的。信号不会 “杀死” 函数，它只是提供了一种方式，让函数自己察觉并提前退出。

#### 资源清理 vs 任务终止

JavaScript 取消机制中一个常见的误解是：发出中止信号后，所有工作都会立即停止。实际上，“停止任务” 和 “清理资源” 是两个完全不同的概念。理解它们的区别，是写出健壮异步代码的关键。

##### 停止工作 vs 清理资源

当你对一个 `AbortController` 调用 `controller.abort()` 时，监听该信号的 API 通常会执行资源释放操作：

- `fetch`
  
   会关闭底层的网络连接；
- `Stream`
  
   会停止产生数据并释放缓冲区；
- 数据库或文件句柄（若支持中止信号）会被关闭。

这就是所谓的 “资源清理”：系统确保诸如套接字、内存缓冲区或文件描述符等资源不会被遗留。清理操作对于防止内存泄漏、连接耗尽或其他隐性问题至关重要。

但需要注意的是，资源清理并不等于停止所有正在进行的工作。任何 CPU 密集的计算、同步逻辑或不响应信号的代码仍会运行到自然结束。

##### 为什么 JavaScript 关注 “清理” 而非 “强制终止”

JavaScript 的执行模型遵循 “执行到完成” 的原则：一旦函数开始执行，就会一直运行到当前同步块的末尾。  
事件循环不支持 “抢占式中断”。因此：

- 如果强行在执行中途终止函数，可能会导致共享状态不一致；
- 部分副作用（如 DOM 只更新了一半、文件只写了一部分）可能造成系统损坏；
- 内存安全和可预测的执行顺序都会被破坏。

因此，JavaScript 更倾向于协作式取消：代码主动检测取消信号并安全退出。`AbortController` 正是符合这种模式的工具 —— 它传达中止意图，由 API 或函数决定如何响应。

##### AbortController 作为清理触发器

大多数支持 `AbortSignal` 的现代 API，主要用于实现资源的安全终止：

```
 const controller = new AbortController();
 const signal = controller.signal;

 const stream = someStreamAPI({ signal });

 controller.abort(); // 触发清理
```
此时，`stream` 可能会停止输出数据、关闭内部缓冲区并释放文件资源。任何监听到中止的代码也会停止进一步处理。工作并不会被 “强制终止”，而是通过 API 与调用方协作地安全退出。

对于 CPU 密集或自定义计算任务，开发者必须主动检测 `signal.aborted` 状态（参见前文示例）。

这种 “资源清理 + 协作退出” 的组合，是 JavaScript 提供的标准取消模式。它既保证安全，又能让开发者回收资源、优雅地停止长任务。

#### 为什么 JavaScript 无法强制停止代码

JavaScript 的取消机制之所以不同于其他语言，核心原因在于它的执行模型。理解这一点，就能明白为什么 `AbortController` 不能 “魔法般地” 终止函数或 Promise。

##### JavaScript 中没有 “抢占式执行”

JavaScript 运行在单线程的事件循环上。每个函数都会完整执行完后，事件循环才会执行下一个任务：

```
 function busyLoop() {
   for (let i = 0; i < 1e9; i++) {
     // CPU 密集型工作
   }
   console.log('完成！');
 }

 busyLoop();
 console.log('这行代码要等 busyLoop 执行完才会运行');
```
当 `busyLoop()` 在运行时，事件循环无法中断它。没有任何机制可以在中途强行插入代码来停止执行。这种设计保证了 JavaScript 的可预测性，但也意味着取消必须是 “协作式” 的。

##### 为什么强制终止不安全

假设 JavaScript 支持任意中断执行：

**1、共享状态可能被破坏：**

```
 obj.count++;
 // 若此时被终止 -> obj.count 未被正确修改
```
**2、部分更新可能导致数据损坏：**

```
 arr.push(newItem);
 // 若此时被终止 -> arr 处于不一致状态
```
**3、Promise 无法保证可观察性：**

如果任务被中途终止，等待结果的消费者将永远得不到通知。

由于 JavaScript 鼓励共享对象与可组合的异步代码，抢占式终止本质上是不安全的。

##### Web Worker 也无法从根本上改变这一点

有的开发者会想：“我可以把 CPU 密集的任务放进 Web Worker，然后直接终止它。” 从技术上讲，这确实可行：

```
 const worker = new Worker('worker.js');
 worker.terminate(); // 立即终止 worker 线程
```
但这是一种进程级别的终止，不是任务级别的取消：

- `terminate()`
  
   会停止整个 worker，无论它正在做什么；
- 无法对单个任务或 Promise 进行细粒度控制；
- 传输中的消息可能丢失，导致数据不完整。

Web Worker 适合隔离那些可能需要被 “强制杀死” 的任务，但在主线程中，JavaScript 仍无法安全地抢占代码执行。因此，像 `AbortController` 这样的 “协作信号” 模式才是推荐方案：让代码主动退出，同时安全清理资源。

#### 其他语言如何处理取消

JavaScript 的协作式取消机制看似有限，但对比其他语言后就会发现：不同的运行环境在 “安全性”、“控制性” 和 “可组合性” 之间做出了不同的权衡。

##### 协作式取消（Go、Rust async）

像 Go 和 Rust 这样的语言提供了明确的协作取消机制：

**Go：基于上下文（context）的取消**

```
 ctx, cancel := context.WithTimeout(context.Background(), time.Second)
 defer cancel()

 select {
 case <-doWork(ctx):
     fmt.Println("完成")
 case <-ctx.Done():
     fmt.Println("已取消")
 }
```
- `ctx`
  
   显式传递给可能需要取消的函数；
- 工作任务主动检查上下文并提前退出；
- 资源可以被结构化地清理。

这种模式与 JavaScript 的 `AbortController` 类似：都是通过信号传递、需要协作才能实现取消。

**Rust：异步取消**

- 在 Rust 中，`Future` 会被轮询（poll）并检测取消信号。
- 任务在 “让出控制权” 的时候，可以安全地停止。
- 同样，任务必须主动检查信号，不能被强制中断。

其核心思想仍是：协作式取消 —— 运行时发出信号，代码决定何时退出。

##### 结构化并发（Kotlin、Swift）

现代语言如 Kotlin（协程）和 Swift（async/await）通过 “结构化并发” 进一步完善了取消模型：

- 任务与父作用域绑定；
- 当父作用域取消时，所有子任务都会收到取消信号；
- 这样可以确保异步工作有界、可预测、且易于清理。

**Kotlin 示例：**

```
 val job = launch {
     val child = launch {
         repeat(1000) { i ->
             println("工作中 $i")
             delay(100)
         }
     }
     delay(500)
     child.cancel() // 协作式取消
 }
```
这种模式在不使用抢占的情况下，强制建立了生命周期和取消规则。

##### 抢占式取消（线程）

一些环境（如 Java、C#）提供基于线程的抢占式取消：可以在任意时刻中断或终止线程。但这会带来严重的安全问题：

- 共享状态可能不一致；
- 锁或资源可能永远不会被释放；
- 因此，许多库都不推荐使用强制终止。

JavaScript 在主线程上完全避免了这种风险，因为它依赖单线程和共享内存。强制中断会破坏系统的稳定性与可预测性。

#### JavaScript 的启示

- 协作式信号（如 AbortController），是 JavaScript 对 Go、Rust、Kotlin 等语言取消机制的等价设计；
- JavaScript 故意避免抢占，以保持安全与简洁；
- JavaScript 取消机制中的 “陷阱” 其实是各语言在安全与控制之间的权衡结果。

#### 当下 JavaScript 中的实用取消模式

理解取消机制的局限是一回事，如何有效地应用它又是另一回事。现代 JavaScript 提供了一些工具与模式，让我们能在安全且可预测的前提下处理取消逻辑 —— 主要依托于 AbortController 和协作式设计。

##### 1\. 到处传递 AbortSignal

一个良好的实践是：设计 API 时，让它显式接收 AbortSignal 作为参数：

```
 async function fetchWithSignal(url, signal) {
   const response = await fetch(url, { signal });
   const data = await response.json();
   return data;
 }
```
调用者可以创建控制器（controller），并在需要时中止请求：

```
 const controller = new AbortController();
 const signal = controller.signal;

 fetchWithSignal('/api/data', signal)
   .then(data => console.log(data))
   .catch(err => {
     if (err.name === 'AbortError') console.log('请求被取消');
     else console.error(err);
   });

 // 稍后
 controller.abort();
```
这种模式让 “取消信号” 可以在多层 API 调用之间向下传递，并在支持的地方触发资源清理。

### 2\. 让长耗时任务可被中止

对于 CPU 密集型任务 或长循环，你需要显式检测信号。将工作拆分为小块，并在合适的时机检查中止状态，可以实现协作式取消：

```
 async function heavyComputation(signal) {
   let result = 0;
   for (let i = 0; i < 1e9; i++) {
     if (signal.aborted) {
       console.log('计算被中止');
       return;
     }
     result += i;
     if (i % 1e6 === 0) await Promise.resolve(); // 让出事件循环
   }
   return result;
 }
```
- 检查 `signal.aborted` 可让函数提前退出；
- 偶尔 `await Promise.resolve()` 能防止长时间阻塞事件循环。

这种方式类似其他语言中的结构化并发（structured concurrency）：任务主动配合取消机制，保持系统响应性。

##### 3\. 设计支持取消的 API

在构建库或组件时：

- 接收 AbortSignal，而不是自定义取消标志；
- 清晰文档化取消行为：
- 是否中止网络请求？
- 是否释放内存或文件句柄？
- 是否停止计算？
- 避免隐藏的后台任务：确保被取消的任务不会继续修改共享状态；
- 向下传递信号：高层操作被中止时，所有子操作都应观察同一个信号。

示例：

```
 async function processBatch(batch, signal) {
   const results = [];
   for (const item of batch) {
     if (signal.aborted) break;
     results.push(await processItem(item, signal));
   }
   return results;
 }
```
这种模式确保取消行为可预测，避免部分任务未完成或资源未释放的情况。

##### 4\. 与 React 或 Node.js 结合使用

**React：**

在 `useEffect` 中为 `fetch` 或长时间运行的操作传入 `AbortSignal`，并在清理函数中调用 `abort()`，防止组件卸载后任务继续运行。

**Node.js：**

许多现代 API（如 `fs.promises`、`stream`、`fetch` 等）都支持传入 `signal`。可在服务器关闭或请求取消时使用它们，防止资源泄漏。

通过持续使用协作式模式、信号机制以及设计良好的 API，我们能在不破坏 Promise、不过度占用资源、也不依赖强制中断的前提下，实现健壮、可靠的取消逻辑。

#### 结论：别再试图 “杀掉 Promise”

JavaScript 中的取消机制，与其他语言的预期完全不同。Promise 是对未来结果的不可变占位符，而不是对 “执行任务” 的控制句柄。语言本身没有提供强制终止工作的机制，试图那样做往往会让代码变得脆弱且难以预测。

相反，JavaScript 通过 AbortController 与 AbortSignal 提供了协作式取消。

它们允许我们：

- 传达 “任务不再需要” 的信号；
- 清理诸如网络连接、数据流、文件句柄等资源；
- 让任务在检测到信号时主动退出。

核心理念是：

> 取消是一种 “意图”，不是 “强制”。  
> 工作只有在执行它的代码检测到信号并响应时才会停止。  
> CPU 密集型循环、同步代码或未配合的逻辑仍会继续运行，直到自然完成。

#### 通过接受这种模型：

- API 更加可预测、可组合；
- 资源泄漏与副作用最小化；
- 异步代码能优雅地处理用户触发的中断。

最终，JavaScript 的取消机制并不是在 “杀掉 Promise”，而是在让任务具备响应性和协作性。理解这一点，能帮助开发者编写出健壮、可维护的异步代码，而无需与语言的执行模型作斗争。

关于本文  
译者：@飘飘  
作者：@Gabor Koos  
原文：https://hackernoon.com/the-truth-about-cancelling-asyncawait-youre-mostly-just-ignoring-results

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
