---
title: "【第3623期】从混乱到纯净：用 Effect System 重塑你的 JS 架构"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278107&idx=1&sn=93a5e42214119670b46eb3168701e2d4&chksm=bc25b4ab867e26e6e3ecab673c3a593d8c089b6b22361c6a7c9c91237402f9ccf1dce748177f&scene=0#rd"
date: 2025-12-09
md5: bbb17f36a1355c31eb52e34a92d1059e
---

# 【第3623期】从混乱到纯净：用 Effect System 重塑你的 JS 架构

前言

在日常的 JavaScript 开发中，我们经常把业务逻辑、数据库调用、HTTP 请求、日志打印混在一起，代码虽然能跑，但却难以测试、难以维护。本文带你用不到 30 行代码，从零实现一个简洁的 Effect System —— 让副作用变得可描述、可控制、可测试。将从命令式转向声明式思维，用 “函数式核心 + 命令式外壳” 的架构重构异步流程，让代码更纯粹、更优雅。

今日前端早读课文章由 @Aycan Gulez 分享，@飘飘编译。

译文从这开始～～

如果你查看一个典型应用程序的源代码，你很可能会发现业务逻辑和数据库调用混杂在一起，验证规则中间穿插着 HTTP 请求，代码里到处都是 try/catch 块。

[【第3616期】JavaScript 原型污染](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277982&idx=1&sn=7e2f24da357206da210422c8c0c33e61&scene=21#wechat_redirect)

这种耦合带来的最大问题就是 —— 可测试性。比如说，你要测试一个计算用户折扣的函数，这很容易，对吧？

但如果这个函数除了计算折扣外，还要去数据库查找用户的忠诚度状态，然后再给他们发优惠券邮件呢？你就不能简单地直接运行这个函数了。你得启动一个测试数据库，或者使用模拟库（mocking library）来拦截对 `db.findUser` 的调用。这样一来，你的单元测试就不再是测试逻辑，而是在测试你的 mock 设置。久而久之，你会发现自己花在配置测试环境上的时间，比写业务代码还多。

幸运的是，还有另一种方式。起初可能有点陌生，但思路其实非常简单：

**先别马上干活。先把活儿描述一下。**

想想做饭和写菜谱的区别：

- 命令式（Imperative）：一步步执行操作，比如 “走进厨房 → 切洋葱 → 哭了就停下 → 打开炉子”。
- 声明式（Declarative）：你写下菜谱 ——“第 1 步：切洋葱；第 2 步：炒香”。你可以把菜谱交给别人去做；你甚至可以分析它是否包含过敏原（漏洞），而不用真的做这道菜。

在本文结束时，我们将实现一个简单但功能完整的 JavaScript “效果系统”（Effect System）。我们将不再编写直接执行副作用的函数，而是编写返回这些副作用描述的函数。

[【第3613期】JavaScript 中的错误链：用 Error.cause 让调试更清晰](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277933&idx=1&sn=d6d1eacd20690c6271a78026f2eaed23&scene=21#wechat_redirect)

不过在此之前，让我们先看看一个典型的命令式例子，它执行以下用户注册步骤：

- 1、验证输入；
- 2、检查数据库中是否存在该邮箱；
- 3、如果是新用户，就对密码进行哈希处理并保存信息。

```
 async function registerUser(input) {
     try {
         const { email, password } = input;
         if (!email?.includes('@')) {
             throw new Error('Invalid email format.');
         }
         if (password?.length < 8) {
             throw new Error('Password too short.');
         }

         const foundUser = await db.findUserByEmail(email);
         if (foundUser) {
             throw new Error('Email already in use.');
         }

         const userToSave = { email, password: hashPassword(password) };
         const savedUser = await db.saveUser(userToSave);

         console.log('User Created:', savedUser);
         return savedUser;
     } catch (error) {
         console.error('Registration error:', error);
         return { error: error.message };
     }
 }
```
这段代码可读性很好，但隐藏了不少成本：

- 你无法在不 mock 数据库调用的情况下测试逻辑；
- 如果不 mock，同样的输入不能调用两次，否则第二次可能失败；
- 逻辑通过 `throw/catch` 在不同地方跳转，带来了不可见的控制流。

由于任何函数都可能抛出异常，你永远无法完全确定某个代码块中的下一行是否一定会执行。

#### 效果系统（The Effect System）

与其立即执行任务，效果系统（Effect System）选择返回一个描述任务的对象，稍后再执行。

[【第3563期】主题化设计系统的多种形式](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277132&idx=1&sn=120fafe385a1819913a5e028e50ddf6e&scene=21#wechat_redirect)

我们先定义三个基础对象，用来表示程序的三种状态：

- Success（成功）：上一步执行成功，并返回结果（`value`）。
- Failure（失败）：执行过程中出现错误（`error`）。
- Command（命令）：将异步副作用函数存储在 `cmd` 中，但暂时不执行。如果 `cmd` 返回 `Success`，则会继续执行 `next` 中定义的函数。

```
 const Success = (value) => ({ type: 'Success', value });
 const Failure = (error) => ({ type: 'Failure', error });
 const Command = (cmd, next) => ({ type: 'Command', cmd, next });
```
接下来，我们需要一个组合函数 `chain`，用于将这些效果连接起来。它的作用是接受一个已有的 `effect` 对象，并将它与下一步的函数（`fn`）衔接起来。

```
 const chain = (effect, fn) => {
     switch (effect.type) {
         case 'Success':
             // 将成功结果传递给下一个函数 fn
             return fn(effect.value);
         case 'Failure':
             // 遇到错误则中断执行
             return effect;
         case 'Command':
             // 创建一个新的命令，递归地将命令的结果传递给 fn
             const next = (result) => chain(effect.next(result), fn);
             return Command(effect.cmd, next);
     }
 };
```
然后我们还需要一个辅助函数 `effectPipe`。它接受一系列函数并按顺序运行，每一步的输出会传给下一步，但只有前一步返回成功（`Success`）时才会继续执行（这就是 `chain` 发挥作用的地方）。

```
 const effectPipe = (...fns) => {
     return (start) => fns.reduce(chain, Success(start));
 };
```
最后，我们需要一个 “解释器”（interpreter）来真正执行这些命令。到目前为止，我们只是在构建一个描述任务的对象，还没有实际运行。`runEffect` 是唯一使用 `async/await` 的地方，它会循环执行命令：

```
 async function runEffect(effect) {
     while (effect.type === 'Command') {
         try {
             effect = effect.next(await effect.cmd());
         } catch (e) {
             return Failure(e);
         }
     }
     return effect;
 }
```
就是这样！即使你现在还没完全理解这些函数如何协同工作也没关系。接下来，我们用效果系统（Effect System）来重构最初的 `registerUser` 函数，看看代码会变成什么样。

[【第3587期】检查 JavaScript 原生函数是否被 monkey patch 过](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277417&idx=1&sn=3c266637264771e1a91b4364ca196509&scene=21#wechat_redirect)

#### 从命令式到声明式

首先，我们把输入验证逻辑提取出来，并且返回 `Success` 或 `Failure` 对象，而不是直接抛出异常：

```
 function validateRegistration(input) {
     const { email, password } = input;
     if (!email?.includes('@')) {
         return Failure('Invalid email format.');
     }
     if (password?.length < 8) {
         return Failure('Password must be at least 8 characters long.');
     }
     return Success(input);
 }
```
接下来处理数据库查询。我们把 `db.findUserByEmail` 封装进一个函数中，并将其作为 `cmd` 参数传入。在 `next` 参数中，我们定义一个函数来接收未来的 `foundUser`，并将其包裹在 `Success` 中。注意：此时没有执行任何操作，我们只是描述了命令及其后续步骤。

```
 function findUserByEmail(email) {
     const cmdFindUser = () => db.findUserByEmail(email);
     const next = (foundUser) => Success(foundUser);
     return Command(cmdFindUser, next);
 }
```
我们把邮箱可用性检查单独写成一个函数：

```
 function ensureEmailIsAvailable(foundUser) {
     return foundUser ? Failure('Email already in use.') : Success(true);
 }
```
最后是保存操作。我们对密码进行哈希处理后，就像前面的读取操作一样，我们将 `db.saveUser` 的执行封装在一个函数中，并将其作为 `cmd` 传递。在下一个参数中，我们定义一个函数，该函数将接收 `savedUser` 并将其封装在一个 `Success` 对象中。这里同样没有任何操作被执行。

```
 function saveUser(input) {
     const { email, password } = input;
     const userToSave = { email, password: hashPassword(password) };

     const cmdSaveUser = () => db.saveUser(userToSave);
     const next = (savedUser) => Success(savedUser);
     return Command(cmdSaveUser, next);
 }
```
现在，我们用 `effectPipe` 把这些步骤组合成一个完整的 “菜谱”。在流程中，我们用箭头函数 `() => ...` 捕获最初的 `input`，这样即使前一步返回不同的值（例如 `true`），也能继续访问最初的输入数据。

```
 const registerUserFlow = (input) =>
     effectPipe(
         validateRegistration,
         () => findUserByEmail(input.email),
         ensureEmailIsAvailable,
         () => saveUser(input)
     )(input);
```
最后，运行我们的程序：

```
 async function registerUser(input) {
     return await runEffect(registerUserFlow(input));
 }
```
让我们稍微停下来思考一下到目前为止的变化。我们不仅仅是把代码 “挪了个位置”，而是从根本上改变了程序的结构。

通过将 “工作流程的描述” 与 “执行过程” 解耦，我们获得了两种传统 `async/await` 模式下难以同时实现的优势。

[【第2933期】使用 ChatGPT 和 json-server 快速实现 mock API](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651262433&idx=1&sn=b009525fa4ff68415d49b9538add34a0&scene=21#wechat_redirect)

#### 无需 Mock 的测试（Testing without Mocks）

在我们新的版本中，`registerUserFlow` 是一个纯函数。它不会直接操作数据库，而是返回一个描述数据库交互的数据结构。这意味着我们可以在不启动测试数据库、也不依赖复杂 Mock 库的情况下，直接测试业务逻辑。

测试失败场景就像下面这样简单，只需检查是否返回了 `Failure` 状态：

```
 const input = { email: 'bad-email', password: '123' };
 const effect = await registerUser(input);
 assert.deepEqual(effect, Failure('Invalid email format.'));
```
我们甚至可以检查代码的意图，验证它是否 “打算” 执行某些操作，而无需真正执行。

```
 const input = { email: 'test@test.com', password: 'password123' };
 const step1 = registerUserFlow(input);
 assert.equal(step1.type, 'Command');
 assert.equal(step1.cmd.name, 'cmdFindUser');

 const step2 = step1.next(null);
 assert.equal(step2.type, 'Command');
 assert.equal(step2.cmd.name, 'cmdSaveUser');
```
#### 免费获得日志与性能分析（Free Logging & Profiling）

由于所有数据库调用和 API 请求都必须经过 `runEffect` 解释器，我们可以在一个地方集中处理日志、性能分析和错误上报等横切关注点。

与其在业务逻辑中到处插入分散的 `console.log` 语句造成污染，我们只需将这些功能接入引擎即可。我们只需更新一次解释器，整个应用程序就会变得智能起来。

下面是一个简单示例，用于记录每个异步操作的日志并测量执行时间：

```
 async function runEffect(effect) {
     console.log('--- Starting Pipeline ---');
     while (effect.type === 'Command') {
         const start = performance.now();
         try {
             const result = await effect.cmd();
             const duration = (performance.now() - start).toFixed(1);
             console.log(`✅ [${effect.cmd.name}] completed in ${duration} ms`);

             effect = effect.next(result);
         } catch (e) {
             console.error(`❌ [${effect.cmd.name}] failed:`, e);
             return Failure(e);
         }
     }
     console.log('--- Pipeline Finished ---');
     return effect;
 }
```
当我们运行未修改的 `registerUser` 代码时，就能得到这样的输出：

```
 --- Starting Pipeline ---
 ✅ [cmdFindUser] completed in 12.2 ms
 ✅ [cmdSaveUser] completed in 32.5 ms
 --- Pipeline Finished ---
```
#### 关于 “M” 字（The M Word）

如果你有函数式编程语言（如 Haskell）的背景，你可能已经注意到：我们在不到 30 行代码中实现了两个 Monad：

1. **Either Monad（错误处理）**

通过区分 `Success` 与 `Failure`，我们的管道自动处理了 “出错路径（Sad Path）”。

1. **Free Monad（副作用抽象）**

把副作用表示为数据对象（`Command`）而非不透明函数，就能构建一个程序的可检查语法树（syntax tree）。这使我们可以**分析、测试、解释**代码，而无需实际执行它。

“Monad” 这个词常被视为可怕的数学概念，但其实它的核心思想很简单：将一个值放入一个容器中，并附带额外的信息（元数据）来管理复杂性。

#### 函数式核心与命令式外壳（The Functional Core and the Imperative Shell）

我们构建的这个系统，本质上是一个经典架构模式的微型实现：函数式核心，命令式外壳（Functional Core, Imperative Shell）。

这个架构的目标是：把所有副作用都推到应用的边界上，让核心部分保持纯净、可预测。

**1、函数式核心（Functional Core）**：

在我们的例子中，`registerUserFlow` 就是核心。它包含了业务规则、验证逻辑和决策流程，是 100% 纯净的，没有外部依赖，只处理数据，因此极易测试。

**2、命令式外壳（Imperative Shell）**：

`runEffect` 函数充当外壳的引擎，它与数据库适配器、API、外部系统交互，负责处理现实世界中不可控的副作用。

通过严格区分这两个层面，我们最大限度地减少了 Bug 的产生空间：“应用要做什么” 的逻辑安全地封装在核心中，而 “如何去做” 的逻辑被隔离在外壳层。

pure-effect：https://github.com/aycangulez/pure-effect

关于本文  
译者：@飘飘  
作者：@Aycan Gulez  
原文：https://lackofimagination.org/2025/11/managing-side-effects-a-javascript-effect-system-in-30-lines-or-less/

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
