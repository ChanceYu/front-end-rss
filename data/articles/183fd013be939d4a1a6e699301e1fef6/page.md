---
title: "从崩溃到优雅：Node.js 错误处理的正确姿势"
link: "http://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247528526&idx=1&sn=4fd1d8ec5631d9e3da7e632569839185&chksm=f992769fcee5ff8995420219b5d8fbdb0e4edd25a581d1fdea033825a6c3ea516ede8449e164#rd"
date: 2025-12-11
md5: 183fd013be939d4a1a6e699301e1fef6
---

# 从崩溃到优雅：Node.js 错误处理的正确姿势

点击上方 程序员成长指北，关注公众号

回复1，加入高级Node交流群

前言

关于 Node.js 错误处理的全面指南，介绍了 Node.js 中错误的定义、传递错误的四种常见模式（异常、错误优先回调、Promise 拒绝和事件发射器），以及如何通过扩展 Error 对象来创建自定义错误类。今日前端早读课文章由 @Ayooluwa Isaiah 分享，@飘飘编译。

译文从这开始～～

如果你编写的程序不止是 “Hello world” 这样的简单示例，那么一定对编程中的错误（error）有所了解。错误，也常被称作 “bug”，是代码中的问题，可能导致程序运行失败或出现异常行为。与 Go、Rust 等语言不同，在 JavaScript 和 Node.js 中，即使没有一个系统的错误处理策略，程序也能 “凑合跑起来”。

不过其实完全没必要这样。只要熟悉 Node.js 常用的错误创建、传递和处理方式，错误处理就会变得很简单。本文将介绍这些常见模式，帮助你让程序更加健壮，确保在上线前能及时发现并妥善处理潜在错误。

#### Node.js 中的错误是什么？

在 Node.js 中，错误就是 Error 对象的实例。常见的内置错误类包括：  
`ReferenceError`、`RangeError`、`TypeError`、`URIError`、`EvalError` 和 `SyntaxError` 等。这些错误通常用来提示运行时错误或开发者错误。

当然，你也可以通过继承基础的 `Error` 对象、某个内置错误类，或其他自定义错误类，来创建自定义错误。在创建错误时，你需要传入一段描述性的字符串信息，这个信息可以通过对象的 `message` 属性访问。此外，`Error` 对象还包含 `name` 和 `stack` 属性，分别表示错误名称和出错时的调用堆栈位置。

```
 const userError = new TypeError("Something happened!");
 console.log(userError.name); // TypeError
 console.log(userError.message); // Something happened!
 console.log(userError.stack);
 /*TypeError: Something happened!
     at Object.<anonymous> (/home/ayo/dev/demo/main.js:2:19)
     <truncated for brevity>
     at node:internal/main/run_main_module:17:47 */
```
创建好 `Error` 对象后，你可以将它作为函数参数传递、从函数返回，或者直接使用 `throw` 抛出。  

一旦抛出错误，它会沿着调用栈向上传递，直到被捕获为止。若没有任何地方捕获，它就会变成未捕获异常（uncaught exception），并可能导致应用崩溃。

#### 错误的传递方式

在 Javascript 函数中传递错误的方式取决于它是同步的还是异步的。下面介绍 Node.js 中最常见的四种错误传递模式。

##### 1\. 抛出异常（Exceptions）

最常见的错误传递方式就是抛出异常。当你用 `throw` 抛出一个错误时，它需要在调用栈的上层通过 `try/catch` 捕获。如果没有捕获，错误会成为 `uncaughtException`，导致程序提前退出。

例如，内置的 `JSON.parse()` 在解析非法 JSON 字符串时会抛出错误：

```
 function parseJSON(data) {
   return JSON.parse(data);
 }

 try {
   const result = parseJSON('A string');
 } catch (err) {
   console.log(err.message); // Unexpected token A in JSON at position 0
 }
```
要在函数中使用此模式，只需在错误实例前添加 `throw` 关键字即可。这种错误报告和处理方式对于执行同步操作的函数来说是惯用的。

```
 function square(num) {
   if (typeof num !== 'number') {
     throw new TypeError(`Expected number but got: ${typeof num}`);
   }
   return num * num;
 }

 try {
   square('8');
 } catch (err) {
   console.log(err.message); // Expected number but got: string
 }
```
##### 2\. 错误优先回调（Error-first Callbacks）

由于 Node.js 的异步特性，它大量使用回调函数来处理错误。回调函数作为参数传入另一个函数中，在异步操作完成后被调用。

  

Node.js 的约定是错误优先回调模式（Error-first Callback），以确保在使用操作结果之前正确检查错误。此回调函数通常是启动异步操作的函数的最后一个参数，并且在发生错误或操作有结果可用时调用一次。

- 回调函数的第一个参数用于接收错误对象。
- 若发生错误，`err` 参数会包含错误信息，而 `result` 为 `undefined`；
- 若没有错误，`err` 为 `null` 或 `undefined`，`result` 则包含结果数据。

函数签名如下：

```
 function (err, result) {}
```
例如，使用内置的 `fs.readFile()` 读取文件：

```
 const fs = require('fs');

 fs.readFile('/path/to/file.txt', (err, result) => {
   if (err) {
     console.error(err);
     return;
   }
   console.log(result);
 });
```
如所见，`readFile()` 的最后一个参数是回调函数，它遵循错误优先的规范：

- 当读取成功时，`result` 包含文件内容；
- 若失败，它为 undefined，而 `err` 中包含错误信息（例如文件不存在或权限不足）。

在这种模式下，回调函数应始终先检查错误，再访问结果内容。忽略错误是不安全的。

如果你想在自定义异步函数中使用这种模式，只需让函数最后一个参数为回调函数，并在操作完成后以 `(err, result)` 的形式调用它：

```
 function square(num, callback) {
   if (typeof callback !== 'function') {
     throw new TypeError(`Callback must be a function. Got: ${typeof callback}`);
   }

   setTimeout(() => {
     if (typeof num !== 'number') {
       callback(new TypeError(`Expected number but got: ${typeof num}`));
       return;
     }
     const result = num * num;
     callback(null, result);
   }, 100);
 }
```
任何调用此 square 函数的调用者都需要传递一个回调函数来访问其结果或错误。请注意，如果回调参数不是函数，则会发生运行时异常。调用示例：

```
 square('8', (err, result) => {
   if (err) {
     console.error(err);
     return;
   }
   console.log(result);
 });
```
不必在回调函数中直接处理错误。可以通过将其传递给另一个回调函数来将其沿调用栈向上传播，但请确保不要在函数内部抛出异常，即使将代码用 `try/catch` 块包围也是如此。异步异常是无法捕获的，因为周围的 `try/catch` 块会在回调函数执行之前退出。因此，异常将传播到调用栈的顶部，导致应用程序崩溃，除非已为 process.on ('uncaughtException') 注册了处理程序

```
 try {
   square('8', (err, result) => {
     if (err) {
       throw err; // ❌ 不推荐
     }
     console.log(result);
   });
 } catch (err) {
   console.error("Caught error: ", err); // 不会被执行
 }
```
##### 3\. Promise 拒绝（Promise Rejections）

在现代 Node.js 开发中，Promise 是处理异步操作的首选方式，比回调更易读、逻辑更清晰。

Node.js 提供了内置的 `util.promisify()` 方法，可以将使用错误优先回调的 API 转换为 Promise 版本。例如：

```
 const fs = require('fs');
 const util = require('util');

 const readFile = util.promisify(fs.readFile);
```
此时，`readFile` 就是 Promise 版的 `fs.readFile()`，通过拒绝（reject）报告错误，这些错误可以通过链接一个 catch 方法来捕获：

```
 readFile('/path/to/file.txt')
   .then((result) => console.log(result))
   .catch((err) => console.error(err));
```
还可以在 async 函数中使用 Promise 化的 API，例如下面所示的示例。这是在现代 JavaScript 中使用 Promise 的主要方式，因为代码读起来像同步代码，并且可以使用熟悉的 try-catch 机制来处理错误。在异步方法前使用 await 很重要，这样 Promise 在函数恢复执行之前就会被解决（完成或拒绝）。如果 Promise 被拒绝，await 表达式会抛出拒绝的值，随后在周围的 try-catch 块中捕获。

```
 (async function callReadFile() {
   try {
     const result = await readFile('/path/to/file.txt');
     console.log(result);
   } catch (err) {
     console.error(err);
   }
 })();
```
如果要让你自己的函数支持 Promise，只需返回一个新的 Promise，在其中执行异步操作：

- 出错时调用 `reject(error)`
- 成功时调用 `resolve(result)`

```
 function square(num) {
   return new Promise((resolve, reject) => {
     setTimeout(() => {
       if (typeof num !== 'number') {
         reject(new TypeError(`Expected number but got: ${typeof num}`));
         return;
       }
       const result = num * num;
       resolve(result);
     }, 100);
   });
 }

 square('8')
   .then((result) => console.log(result))
   .catch((err) => console.error(err));
```
##### 4\. 事件触发器（Event Emitters）

当你处理长时间运行的异步操作时，这些操作可能会产生多个结果或错误。在这种情况下，可以让函数返回一个 `EventEmitter` 对象，并针对成功或失败分别触发事件。

下面是一个示例代码：

```
 const { EventEmitter } = require('events');

 function emitCount() {
   const emitter = new EventEmitter();
   let count = 0;

   // 异步操作
   const interval = setInterval(() => {
     count++;

     if (count % 4 == 0) {
       emitter.emit('error', new Error(`Something went wrong on count: ${count}`));
       return;
     }

     emitter.emit('success', count);

     if (count === 10) {
       clearInterval(interval);
       emitter.emit('end');
     }
   }, 1000);

   return emitter;
 }
```
`emitCount()` 函数返回一个新的事件触发器（EventEmitter），在异步操作中报告成功或失败事件。它每秒让计数器自增一次：

- 每当 `count` 能被 4 整除时触发 `error` 事件；
- 其他时候触发 `success` 事件；
- 当计数达到 10 时触发 `end` 事件。

这种模式的好处是：可以像数据流一样在结果产生时逐步处理，而不是等整个操作完成后一次性获取。

你可以这样监听这些事件：

```
 const counter = emitCount();

 counter.on('success', (count) => {
   console.log(`Count is: ${count}`);
 });

 counter.on('error', (err) => {
   console.error(err.message);
 });

 counter.on('end', () => {
   console.info('Counter has ended');
 });
```
如上所示，每个事件监听器的回调函数会在事件被触发后立即执行。

⚠️ 注意：

`error` 事件在 Node.js 中是个特殊事件 —— 如果没有为它注册监听器，应用会直接崩溃。你可以注释掉 `error` 事件监听器后运行代码试试看。

#### 扩展 Error 对象

仅使用内置的 `Error` 类或通用的错误对象，往往不足以表达各种不同类型的错误，尤其是那些意料之外的错误。因此，可以通过创建自定义错误类，更精确地反映应用中的错误类型。

例如：`ValidationError`：表示输入验证失败；`DatabaseError`：表示数据库操作错误；`TimeoutError`：表示操作超时等。

自定义错误类继承自 `Error`，不仅保留了基本属性（如 `message`、`name`、`stack`），还可以添加自定义字段。例如，`ValidationError` 可以增加一个 `cause` 属性，用来说明导致错误的输入内容。

示例代码：

```
 class ApplicationError extends Error {
   constructor(message) {
     super(message);
     this.name = this.constructor.name; // 自动设置错误名为类名
   }
 }

 class ValidationError extends ApplicationError {
   constructor(message, cause) {
     super(message);
     this.cause = cause;
   }
 }
```
上述的 ApplicationError 类是应用程序的通用错误类，而 ValidationError 类则表示在验证用户输入时发生的任何错误。它继承自 ApplicationError 类，并添加了一个 cause 属性来指定引发错误的输入。您可以在代码中像使用普通错误一样使用自定义错误。

使用方法如下：

```
 function validateInput(input) {
   if (!input) {
     throw new ValidationError('Only truthy inputs allowed', input);
   }
   return input;
 }

 try {
   validateInput(userJson);
 } catch (err) {
   if (err instanceof ValidationError) {
     console.error(`Validation error: ${err.message}, caused by: ${err.cause}`);
     return;
   }

   console.error(`Other error: ${err.message}`);
 }
```
在判断错误类型时，应使用 `instanceof`，而不是 `err.name === 'ValidationError'`，因为子类继承时错误名可能不完全一致。

#### 错误的类型

在 Node.js 应用中，区分不同类型的错误非常重要。通常可以分为两大类：

1. 程序员错误（Programmer Errors）
2. 运行性错误（Operational Errors）

向函数传递错误或不正确的参数是第一类问题的一个例子，而处理外部 API 时出现的暂时性故障则明确属于第二类问题。

##### 1\. 运行性错误（Operational Errors）

这类错误是在程序运行过程中可能预期会发生的，它们不是代码 bug，而是外部环境导致的运行中断。  
这些错误通常可以被理解并被妥善处理。

常见示例包括：

- API 请求失败（如服务器宕机、超出速率限制等）；
- 数据库连接丢失（网络异常）；
- 操作系统无法打开或写入文件；
- 用户提交了无效的输入（例如错误的邮箱或手机号）。

这些问题虽然不是代码逻辑错误，但仍需要正确处理，否则可能引发更严重的后果。

##### 2\. 程序员错误（Programmer Errors）

程序员错误是代码逻辑或语法上的错误，必须通过修改源码来修复。这类错误无法在运行时 “优雅地处理”，因为它们本身就是 bug。

常见示例包括：

- 语法错误（如忘记关闭大括号）；
- 类型错误（对不同类型的值执行非法操作）；
- 调用函数时传入错误的参数；
- 拼写错误导致的 `ReferenceError`；
- 访问数组越界；
- 忽略了对运行性错误的处理。

#### 处理运行性错误的策略

运行性错误通常是可预测的，因此应在开发阶段预先考虑：

- 操作可能失败的原因；
- 失败后应采取的措施。

下面介绍几种常见的应对方式：

##### 1\. 将错误向上报告

在许多情况下，正确的做法是：

- 停止当前操作；
- 清理未完成的任务；
- 将错误 “上报” 给调用者，以便在更高层统一处理。

当错误发生的函数在调用栈的较底层，以至于没有足够的信息直接处理该错误时，这通常是解决错误的正确方法。报告错误可以通过本文前面讨论的任何错误传递方法来完成。

##### 2\. 重试操作

网络请求等外部服务调用可能会偶尔失败，即使请求本身是正确的。例如，服务器过载或网络波动导致的短暂错误。这类问题往往是暂时性的，因此可以通过重试机制提高成功率。

重试前需考虑：

- 是否适合重试（例如响应码为 `500`、`503` 或 `429` 时可尝试重试）；
- 响应中是否包含 `Retry-After` 头，指示需要等待的时间；
- 如果没有该头信息，可以采用指数退避（exponential backoff）策略：每次重试前等待的时间递增；
- 设定最大等待时间与最大重试次数。

若仍未成功，应向调用者报告目标服务暂时不可用。

##### 3\. 向客户端返回错误

当处理来自用户的外部输入时，应默认假设输入是有问题的。因此，在开始任何处理流程之前，首先要验证输入的有效性，并尽快把错误反馈给用户，以便他们能及时更正并重新提交。

在向客户端返回错误时，确保返回的信息足够清晰，让客户端能够生成对用户有意义的提示消息。

##### 4\. 中止程序

对于无法恢复的系统级错误，唯一合理的做法是记录错误日志，并立即终止程序。如果异常严重到无法在 JavaScript 层面恢复，可能连服务器都无法 “优雅关闭”。此时，需要系统管理员介入，排查并修复问题后才能重新启动程序。

#### 防止程序员错误

由于程序员错误本质上是代码逻辑或语法错误，它们无法通过运行时机制修复，只能通过修改源代码来解决。  
不过，你可以通过以下方法大幅减少这类错误的发生。

##### 1\. 使用 TypeScript

TypeScript 是 JavaScript 的强类型超集，它的主要目标是在编译阶段静态发现潜在错误，而不会带来运行时性能损耗。

在项目中采用 TypeScript（并启用最严格的编译选项）后，可以在编译期消除一大类常见错误。例如，Airbnb 在一次 bug 复盘中发现，其代码库中约有 38% 的错误，本可以通过 TypeScript 预防。

将整个项目迁移到 TypeScript 后，诸如 “undefined is not a function”、语法错误、引用错误等问题将不再存在。

##### 2\. 为错误参数定义行为

许多程序员错误来自传递了错误的参数。这类错误既可能是显而易见的（比如传入字符串而非数字），也可能比较隐蔽（比如参数类型正确，但值超出函数可处理范围）。

这种情况下，程序可能会静默失败并返回错误结果（如 `NaN`），而在错误传播到多层函数调用后，定位问题会变得非常困难。

因此，应为错误参数定义明确的处理方式：

- 当问题可在本地解决时，可选择抛出错误或返回特殊值（如 `null`、`undefined` 或 `-1`）；
- 例如，`JSON.parse()` 在解析无效 JSON 时会抛出 `SyntaxError`；  
  而 `string.indexOf()` 则返回 `-1` 表示未找到。

无论采用哪种方式，都应清晰记录函数在错误场景下的行为，以便调用者知道如何应对。

##### 3\. 自动化测试

JavaScript 本身并不会帮你发现逻辑错误，因此你需要运行代码才能验证其正确性。一个自动化测试体系能显著提升你发现与修复逻辑错误的概率。

测试还能验证函数在异常输入下的表现是否合理。建议使用 Jest、Mocha 等测试框架，为 Node.js 应用编写单元测试。

#### 未捕获异常与未处理的 Promise 拒绝

未捕获异常（uncaught exceptions） 和 未处理的 Promise 拒绝（unhandled rejections） 通常源于程序员错误，即未能捕获被抛出的异常或 Promise 拒绝。

当一个异常在事件循环前未被捕获时，Node.js 会触发 `uncaughtException` 事件。如果未被处理，应用会立即崩溃。你可以注册一个事件监听器来自定义处理逻辑，例如：

```
 // ⚠️ 不推荐做法
 process.on('uncaughtException', (err) => {
   console.error(err);
 });
```
然而，这种对事件的使用是不正确的，因为未捕获的异常的存在表明应用程序处于未定义的状态。因此，在未从错误中恢复的情况下尝试正常恢复被认为是不安全的，并可能导致进一步的问题，例如内存泄漏和挂起的套接字。 uncaughtException 处理程序的正确用法是清理任何已分配的资源、关闭连接，并记录错误以供以后评估，然后再退出进程。

```
 // ✅ 推荐写法
 process.on('uncaughtException', (err) => {
   Honeybadger.notify(err); // 将错误上报至错误监控平台

   // 尝试优雅关闭
   server.close(() => {
     process.exit(1); // 退出程序
   });

   // 若 1 秒后仍未成功关闭，则强制退出
   setTimeout(() => {
     process.abort(); // 立即退出并生成 core dump
   }, 1000).unref();
 });
```
#### 集中化错误上报

没有完善日志策略的错误处理体系是不完整的。当系统发生故障时，你需要通过日志了解原因。

集中化日志管理可以让你更全面地掌握应用的运行状态：

- 对错误进行分类、筛选与排序；
- 追踪最常见的问题；
- 订阅错误提醒，第一时间获知新问题。

例如，Honeybadger 提供了一整套生产环境错误监控解决方案。

##### 使用步骤：

**1️⃣ 安装依赖**

```
 npm install @honeybadger-io/js --save
```
**2️⃣ 引入并配置**

```
 const Honeybadger = require('@honeybadger-io/js');

 Honeybadger.configure({
   apiKey: '[ YOUR API KEY HERE ]'
 });
```
**3️⃣ 上报错误**

```
 try {
   // ... 可能抛出错误的代码
 } catch (error) {
   Honeybadger.notify(error);
 }
```
想了解更多与 Node.js Web 框架的集成方式，可以参考官方文档或 GitHub 上的示例 Express 项目。

https://github.com/honeybadger-io/crywolf-node

#### Node.js 错误处理最佳实践

遵循成熟的错误处理规范，可以让你的 Node.js 应用更稳定、更易调试。以下是五条值得采纳的关键实践：

##### 1️⃣ 始终使用 Error 对象

不要抛出字符串、数字或普通对象。应始终使用 `Error` 类或其子类，以保留堆栈信息和调试上下文。

```
 // ❌ 错误做法
 throw 'Something went wrong';

 // ✅ 正确做法
 throw new Error('Something went wrong');

 // 💡 更佳做法
 throw new ValidationError('Invalid email format');
```
这样可以确保你始终能访问 `message`、`stack`、`name` 等属性，从而大幅提升调试效率。

##### 2️⃣ 区分运行性错误与程序员错误

理解两者的区别是正确处理错误的前提。

- 运行性错误（Operational Errors）：程序逻辑正确，但运行中出现问题（如网络故障、无效输入等），应优雅处理。
- 程序员错误（Programmer Errors）：代码中的 bug，如类型错误、引用错误、逻辑错误，应立即终止并修复。

示例：

```
 // ✅ 运行性错误：优雅处理
 function fetchUser(id) {
   return fetch(`/api/users/${id}`)
     .catch(err => {
       console.log('Failed to fetch user, retrying...');
       return retryRequest(id);
     });
 }

 // ❌ 程序员错误：应让程序崩溃并修复
 function calculateTotal(items) {
   if (!Array.isArray(items)) {
     throw new TypeError('items must be an array');
   }
   return items.reduce((sum, item) => sum + item.price, 0);
 }
```
##### 3️⃣ 永远不要忽略错误

静默失败是最危险的做法。每个错误都应被妥善处理或显式抛出。

```
 // ❌ 错误示例：忽略错误
 fs.readFile('/path/to/file', (err, data) => {
   console.log(data); // err 可能存在！
 });

 // ✅ 正确示例：检查错误
 fs.readFile('/path/to/file', (err, data) => {
   if (err) {
     console.error('Failed to read file:', err);
     return;
   }
   console.log(data);
 });
```
如果确实认为某个错误可以安全忽略，请添加注释说明原因，方便后续维护。

##### 4️⃣ 使用 async/await + try/catch

`async/await` 让异步代码更直观，并能使用熟悉的 `try/catch` 捕获错误。

```
 // ❌ 较差示例：Promise 链式写法
 function getUserData(userId) {
   return fetch(`/api/users/${userId}`)
     .then(res => res.json())
     .then(user => processUser(user))
     .catch(err => console.error(err));
 }

 // ✅ 推荐写法：async/await
 async function getUserData(userId) {
   try {
     const response = await fetch(`/api/users/${userId}`);
     const user = await response.json();
     return processUser(user);
   } catch (err) {
     console.error('Failed to get user data:', err);
     throw err;
   }
 }
```
记得在 `try` 块中调用异步函数时使用 `await`，否则错误不会被捕获。

##### 5️⃣ 实现集中式错误处理

不要把错误处理逻辑分散到各处。  
应建立统一的错误处理机制：

- 在 Express 应用中使用错误处理中间件；
- 在一般 Node.js 项目中创建独立的错误处理工具模块。

集中化处理可确保整个应用的错误记录与处理方式一致，方便维护与扩展。

#### 结语：用正确方式处理 Node.js 错误

在代码中应始终使用 `Error` 类（或其子类）来传递错误。  
虽然 JavaScript 技术上允许抛出任意类型的值，但这会让错误信息失去意义，  
并让 Node.js 的错误处理变得不可靠。

运行性错误是不可避免的，应为它们制定恢复策略，确保程序能平稳运行；  
而严重错误则应优雅关闭并重启程序。

程序员错误无法通过捕获来修复，但可以通过类型检查和自动化测试提前预防。  
当出现未捕获异常或未处理的 Promise 拒绝时，应让程序崩溃并重新启动，而不是试图继续运行。

最后，像 Honeybadger 这样的错误监控服务能帮助你捕获并分析错误，加快调试和修复速度。  
现在你已经掌握了 Node.js 错误处理的核心要点，不妨前往 Honeybadger 官网注册一个免费账号，  
亲自体验完整的错误监控流程。

关于本文  
译者：@飘飘  
作者：@Ayooluwa Isaiah  
原文：https://www.honeybadger.io/blog/errors-nodejs/

  

Node 社群
