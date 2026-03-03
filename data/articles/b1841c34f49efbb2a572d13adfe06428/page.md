---
title: "【第3616期】JavaScript 原型污染"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277982&idx=1&sn=7e2f24da357206da210422c8c0c33e61&chksm=bce0d7d15007212ac1422c3daaa995e072e9b749692591c48de8a2acd3db4c74be5ccf4422b6&scene=0#rd"
date: 2025-11-24
md5: b1841c34f49efbb2a572d13adfe06428
---

# 【第3616期】JavaScript 原型污染

前言

详细介绍了 JavaScript 原型污染漏洞，包括其原理、攻击方式和防御策略。原型污染是指攻击者能够修改对象原型的属性，导致应用程序中对象出现意外行为。今日前端早读课文章由 @飘飘编译。

译文从这开始～～

原型污染是一种漏洞，攻击者可以向对象的原型中添加或修改属性。这意味着恶意值可能会意外地出现在你的应用对象中，从而导致逻辑错误，甚至引发像跨站脚本攻击（XSS）这样的进一步攻击。

[【第3335期】XSS终结者-CSP理论与实践](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651272208&idx=1&sn=e7954aa10074ec2859c68224b184520e&scene=21#wechat_redirect)

#### JavaScript 中的原型

JavaScript 使用 “原型” 机制来实现继承。每个对象都有一个指向原型的引用，而原型本身也是一个对象，它又有自己的原型，以此类推，直到最基础的原型 ——`Object.prototype`，它的原型为 `null`。

当你访问对象的某个属性或方法时，如果这个属性或方法不存在，JavaScript 运行时会去对象的原型中查找；如果还没有找到，就会继续沿着原型链（prototype chain）往上查找，直到找到对应的属性或方法，或是到达原型为 `null` 的对象为止。

[【早阅】谷歌的 Vibe 编码：全新 AI Studio 的原型设计](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277573&idx=1&sn=c0e72abc28f7335fef5737ded4b488d0&scene=21#wechat_redirect)

这就是为什么可以这样写：

```
 const mySet = new Set([1, 2, 3]);
 // 原型链：
 // mySet -> Set.prototype -> Object.prototype -> null

 mySet.size;
 // 3
 // size 定义在 `mySet` 的原型上，也就是 `Set.prototype`

 mySet.propertyIsEnumerable("size");
 // false
 // propertyIsEnumerable() 定义在 `Set.prototype` 的原型上，也就是 `Object.prototype`
```
与许多其他语言不同，JavaScript 允许你在运行时修改对象的原型，从而动态地为对象添加继承的属性和方法：

```
 const mySet = new Set([1, 2, 3]);

 // 在运行时修改 Object 原型
 Object.prototype.extra = "来自 Object 原型的新属性！";

 // 在运行时修改 Set 原型
 Set.prototype.other = "来自 Set 原型的新属性！";

 mySet.extra;
 // "来自 Object 原型的新属性！"

 mySet.other;
 // "来自 Set 原型的新属性！"
```
在原型污染攻击中，攻击者会修改内置原型（如 `Object.prototype`），导致所有从它派生的对象都自动带有额外的属性 —— 即使这些对象攻击者无法直接访问。

#### 原型污染的原理

原型污染主要包括两个阶段：

1、污染阶段：攻击者向对象的原型中添加或修改属性。  
2、利用阶段：应用的正常代码访问到了被污染的属性，从而导致异常行为。

[【第1484期】被污染的 npm 包：event-stream](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651230782&idx=1&sn=a507bb9c9c61ad9f9cb4a30d6a4c2392&scene=21#wechat_redirect)

##### 污染来源

要实现原型污染，攻击者必须能往原型对象里随意添加属性。这有时可能是 XSS（跨站脚本）攻击的后果 —— 在这种情况下，攻击者直接获得了页面的 JavaScript 执行环境的访问权限。然而，拥有这种级别访问权限的攻击者可以更直接地造成破坏，因此原型污染通常被讨论为一种仅针对数据的攻击，即攻击者构造一个有效载荷，由应用程序代码处理，从而导致污染。

一个关键的攻击入口是 `__proto__` 属性，它可以访问任意对象的原型对象。还可以通过 `yourObject.constructor.prototype` 访问原型。

常见的漏洞代码模式如下：

```
 obj[key1][key2] = value;
```
如果 `obj` 是普通对象，`key1` 是 `"__proto__"`，而 `key2` 是某个属性名（如 `"test"`），那么这行代码会给 `Object.prototype` 添加一个名为 `test` 的属性。即使禁用了 `__proto__` 的 setter，攻击者仍可以通过 `.constructor.prototype` 的访问方式污染原型：

```
 obj[key1][key2][key3] = value;
```
其中 `key1` 是 `"constructor"`，`key2` 是 `"prototype"`，`key3` 是属性名（如 `"test"`）。

举个例子，假设有一个 API 接口接收用户名和字段列表，并返回一个包含这些字段的对象：

```
 function getUsers(request) {
   const result = {};
   const userNames = new URL(request.url).searchParams.getAll("names");
   const fields = new URL(request.url).searchParams.getAll("fields");
   for (const name of userNames) {
     const userInfo = database.lookup(name);
     result[name] ??= {};
     for (const field of fields) {
       // 污染来源
       result[name][field] = userInfo[field];
     }
   }
   return result;
 }
```
如果攻击者调用这个接口：`https://example.com/api?names=__proto__&fields=age`  
这段代码就会在 `Object.prototype` 上添加一个名为 `age` 的属性，值取决于数据库中名为 `__proto__` 的用户的 `age` 字段。如果攻击者能创建这样一个用户，他们就能完全控制这个属性值。

许多用于解析 URL 查询字符串的库特别容易受到此类攻击，因为它们允许通过查询参数构造深层对象结构，并使用动态属性赋值，例如：`?__proto__[test]=test` 或 `?__proto__.test=test`。

通常来说库比业务代码更容易中招，因为库通常不能限制合法的 key，也经常需要动态地修改属性来保持通用性。

在 JSON 中，`__proto__` 只是一个普通属性名。因此解析如下内容时不会立即触发污染：

```
 const options = JSON.parse('{"__proto__": {"test": "value"}}');
```
但如果后续代码使用 `Object.assign()`、`for...in` 等方式把这个对象合并到另一个对象中，就可能触发 setter，从而更改目标对象的原型。例如：

```
 const options = JSON.parse('{"__proto__": {"test": "value"}}');
 const withDefaults = Object.assign({ mode: "cors" }, options);
 // 在合并过程中执行了
 // withDefaults.__proto__ = { test: "value" }
 // 导致 `withDefaults` 的原型被更改
 console.log(withDefaults.test); // "value"
```
需要注意的是，使用扩展运算符（spread）不会触发这种攻击，因为扩展操作不会调用 setter。

##### 利用目标（Exploitation targets）

为了观察原型污染的效果，我们可以看看以下 `fetch()` 调用是如何被完全改变的。默认情况下，这是一条不携带内容的 GET 请求；但由于攻击者污染了 `Object.prototype`，为其添加了两个新的默认属性，这次请求就被改造成了一条 POST 请求，并且请求体中还包含了发送给服务器的恶意指令 —— 例如转账到任意账户：

```
 // 攻击者间接造成以下污染
 Object.prototype.body = "action=transfer&amount=1337&to=1337-1337-1337-1337";
 Object.prototype.method = "POST";

 fetch("https://example.com", {
   mode: "cors",
 });
 // Promise {status: "pending", body: "action=transfer&amount=1337&to=1337-1337-1337-1337", method: "POST"}

 // 任意新建的对象现在都默认包含这些属性
 console.log({}.method); // "POST"
 console.log({}.body); // "action=transfer&amount=1337&to=1337-1337-1337-1337"
```
另一个危险的攻击目标是 `HTMLIframeElement.srcdoc` 属性，它定义了 `<iframe>` 元素的内容。如果攻击者能覆盖它的值，就有可能执行任意代码：

```
 Object.prototype.srcdoc = "<script>alert(1)<\/script>";
```
像上面示例中的 `fetch()` 配置对象（`RequestInit` 对象）、`<iframe>` 的实例化配置，或 `SanitizerConfig`（HTML 清理配置）等配置对象，都是原型污染攻击的高危目标。  
数据对象同样可能被污染，例如：

```
 function accessDashboard(user) {
   if (!user.isAdmin) {
     return new Response("Access denied", { status: 403 });
   }
   // 展示管理员页面
 }
```
如果攻击者将 `Object.prototype.isAdmin` 设置为 `true`，而应用代码没有为普通用户显式地设置 `isAdmin = false`，那么所有用户都会被误认为是管理员，导致访问控制完全失效。

[【第2784期】从cdnjs 的漏洞来看前端的供应链攻击与防御](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651259060&idx=1&sn=58c1ed166831da720b06153949b25438&scene=21#wechat_redirect)

#### 防御原型污染（Defenses against prototype pollution）

防御原型污染可以从两个方向入手：

1、避免使用可能修改原型的代码；  
2、避免访问可能被污染的属性。

以下是几种常见的防御策略。

##### 1\. 验证用户输入

始终使用数据验证器（如 ajv 或 Zod）来验证用户输入，确保输入数据结构中只包含期望的属性和类型。  
为了防止原型污染，在 JSON Schema 中将 `additionalProperties` 设置为 `false`，拒绝未定义的额外属性。同时，使用 schema 还能为缺失属性设置默认值，从而避免触发原型链查找。

除非已验证键名的安全性，否则应避免使用动态属性赋值（例如 `obj[key] = value`）。  
在这种情况下，应明确禁止键名为 `__proto__`、`constructor` 或 `prototype`。

##### 2\. Node.js 启动参数：`--disable-proto`

如果你在 Node.js 环境下运行，可以使用 `--disable-proto=MODE` 参数禁用 `Object.prototype.__proto__`，其中 `MODE` 可以是：

1、`delete`：完全删除该属性；  
2、`throw`：访问该属性时抛出错误（错误代码为 `ERR_PROTO_ACCESS`）。

在非 Node 环境中，可通过 `delete Object.prototype.__proto__` 达到类似效果。

这不能完全防御原型污染（因为 `constructor.prototype` 仍可被访问），但至少关闭了一个主要入口点。

#### 冻结内建对象（Lock down built-in objects）

在高安全需求的环境中，可以采用 “领域锁定（realm lockdown） 策略，禁止对内建对象的任何修改。  
例如，SES（Secure EcmaScript） 提供的加固 JavaScript 机制（Hardened JS）就是基于 `Object.freeze()` 实现的。

`Object.freeze()` 可以阻止添加新属性，并将已有属性设为不可写、不可配置，是 JavaScript 提供的最高级别对象完整性。

其它相关方法包括：

1、`Object.seal()`：禁止新增属性，但允许修改现有可写属性；  
2、`Object.preventExtensions()`：仅阻止新增属性。

```
 Object.freeze(Object.prototype);
 const obj = {};
 const key1 = "__proto__";
 const key2 = "a";
 obj[key1][key2] = 1; // 在非严格模式下静默失败
 obj.a; // undefined
```
但请注意，有些合法场景（如 polyfill 实现）确实需要修改原型。在严格模式下，修改被冻结对象会抛出 `TypeError`；非严格模式下则静默失败。因此应在冻结前运行所有 polyfill 代码。

另外，`Object.freeze()` 默认只进行 “浅冻结”，不会递归冻结嵌套属性。若要实现真正的不可变对象，需要递归冻结或使用像 SES 这样的库，它会自动遍历所有内建对象，确保无遗漏。

#### 避免访问原型上的属性（Avoid lookups on the prototype）

当访问对象属性时，应确保该属性确实存在于对象自身上。可以使用 `Object.hasOwn()` 检查：

```
 // 不安全的写法
 if (!user.isAdmin) {
   return new Response("Access denied", { status: 403 });
 }

 // 推荐写法
 if (!Object.hasOwn(user, "isAdmin") || !user.isAdmin) {
   return new Response("Access denied", { status: 403 });
 }
```
当需要遍历对象属性时，`for...in` 会遍历原型链。应改用 `for...of` + `Object.keys()` 只访问对象自身的属性：

```
 // 会访问原型属性
 for (const key in payload) {
   doSomething(payload[key]);
 }

 // 只访问自身属性
 for (const key of Object.keys(payload)) {
   doSomething(payload[key]);
 }
```
此外，在函数中应显式设置默认参数，而不是依赖 `undefined`，以避免原型链查找。

```
 // 不推荐
 function doDangerousAction(options = {}) {
   if (!options.enableDangerousAction) return;
 }

 // 推荐
 function doDangerousAction(options = { enableDangerousAction: false }) {
   if (!options.enableDangerousAction) return;
 }
```
#### 创建无原型对象（Create JavaScript objects with null prototype）

无原型对象（null-prototype objects） 既能防止原型污染，又能避免通过原型链查找属性。  
可以通过以下两种方式创建：

1、`Object.create(null)`  
2、对象字面量写法 `{ __proto__: null }`

> 注意：在对象初始化中使用 `{ __proto__: null }` 是安全的，不会触发原型访问器。

如果某个 API（例如 `fetch()`）要求传入对象作为参数，应使用无原型对象。请注意，创建没有原型的对象并非默认行为，因此在每次实例化对象时，您都需要记得显式创建一个无原型对象，而不是使用常规的对象初始化器（ `const myObj = {}` ）。：

```
 Object.prototype.method = "POST";

 // 仍然发送 GET 请求，因为该对象没有原型
 fetch("https://example.com", {
   __proto__: null,
   mode: "cors",
 });
```
如果需要创建一个会被后续修改的对象（例如 `obj[key] = value`），也应创建为无原型对象：

```
 const result = { __proto__: null };
 const key1 = "__proto__";
 const key2 = "a";
 result[key1] ??= {};
 result[key1][key2] = 1; // 只修改 result，不影响 Object.prototype
```
使用 Map 和 Set 替代对象（Use Map and Set instead）

当 JavaScript 对象仅作为键值对容器使用时，建议改用 `Map` 或 `Set`。这两者不会受原型污染影响，因为它们不依赖对象属性查找。

```
 // 假设 Object 已被污染
 Object.prototype.admin = true;

 const config = new Map();
 config.set("admin", false);

 config.admin; // true
 config.get("admin"); // false
```
`Map.prototype.get()` 只会返回 Map 内部的键值，不会受到对象原型的影响。

#### 防御总结清单（Defense summary checklist）

**创建对象时：**

- 判断是否真的需要对象，或是否更适合使用 `Map` / `Set`；
- 当对象将被传入其他函数（如 `FetchInit`、`SanitizerConfig`）时，确保所有键都已定义，或使用无原型对象；
- 若对象会被动态修改（如 `obj[key] = value`），应创建为无原型对象。

**接收用户输入时，无论是通过 URL 查询字符串、JSON 数据包还是函数参数：**

- 始终使用 schema 验证器验证输入，拒绝未识别属性，并为缺失字段设置默认值；
- 对函数参数中的对象，在访问属性前先确认属性是否属于对象自身（如 `Object.hasOwn()`）；
- 遍历时优先使用 `for...of` 和 `Object.keys()`，避免 `for...in`。

**针对内建对象和第三方对象：**

- 考虑通过 SES 等工具冻结内建和第三方对象。

**运行时防护：**

- 在 Node.js 中使用 `--disable-proto` 禁用 `Object.prototype.__proto__`；
- 在非 Node 环境中使用 `delete Object.prototype.__proto__`。

关于本文  
译者：@飘飘  
作者：@mdn  
原文：https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
