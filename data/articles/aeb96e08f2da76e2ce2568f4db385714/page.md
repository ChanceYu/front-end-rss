---
title: "【第3625期】写 TypeScript 不等于安全：边界设计才是关键"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278175&idx=1&sn=2da60babc2929aa6137423c66bf21839&chksm=bc96ef2f0161c5a2625b5a196ade70001eaf73842718424ae3e5913e03e6594be6a724393df8&scene=0#rd"
date: 2025-12-15
md5: aeb96e08f2da76e2ce2568f4db385714
---

# 【第3625期】写 TypeScript 不等于安全：边界设计才是关键

前言

在很多项目里，开发者以为用了 TypeScript 就等于 “类型安全”。但事实是，TypeScript 只能让代码在类型上自洽，并不能保证它在现实中正确运行。真正能保护你的，不是类型系统，而是清晰的边界设计与架构思维。

今日前端早读课文章由 @Christian Ekrem 分享，@飘飘编译。

译文从这开始～～

TypeScript 拯救不了你自己。

我知道这听起来有点刺耳，尤其是如果你花了好几年时间钻研泛型、条件类型和映射类型。但要知道，TypeScript 编译器给出的那个绿色对勾，只能说明你的代码在类型层面上是自洽的 —— 却不能保证它是正确的。

[【第3551期】使用 Bun/TypeScript 在 10 秒内解析 10 亿行数据](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651276991&idx=1&sn=1e374e8041e320a3c4de3a10f23edc7e&scene=21#wechat_redirect)

这并不是对 TypeScript 的攻击，而是要击碎一个常见的误区：“有类型就等于类型安全”。

问题不在于工具，而在思维模式。我经常看到这样的情况：开发人员因为 “类型会帮我捕获错误” 就不再思考边界情况；因为 “反正有类型” 就跳过了验证逻辑；因为太相信编译器，而放松了警惕。

TypeScript 给了你一种 “安全感”，但不是 “安全” 的保证。而那种 “感觉与现实之间、编译时与运行时之间、代码与真实世界之间” 的差距 —— 正是线上 Bug 滋生的地方。

#### 安全的幻觉

TypeScript 是一款极好的工具。它能捕获大量错误，让代码重构更安全，也显著提升开发体验。我每天都在用它，也不会在关键生产项目中回到原生 JavaScript。

[【第3613期】JavaScript 中的错误链：用 Error.cause 让调试更清晰](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277933&idx=1&sn=d6d1eacd20690c6271a78026f2eaed23&scene=21#wechat_redirect)

但它保护不了你免受 “外部世界” 的伤害。更糟的是，语言本身到处都留了 “逃生通道”。

#### 关于 “逃生通道”

让我给你举个例子，这是完全有效的 TypeScript 代码：

```
 interface User {
   id: number;
   name: string;
   email: string;
 }

 async function getUser(id: number): Promise<User> {
   const response = await fetch(`/api/users/${id}`);
   return await response.json();
 }

 const firstUser = await getUser(1);

 console.log(`Greetings, ${firstUser.name}!`);
```
编译器没报错，你的 IDE 也很满意 —— 在输入 `firstUser.` 时甚至能自动提示属性。但其实，你刚刚欺骗了类型系统。

没有写 `as User`（甚至没有用更脏的 `as unknown as User`），你就让 TypeScript 相信一个可能返回 “任何东西”（甚至可能什么都不返回）的函数，永远会返回一个 `User`。API 可能返回 `undefined`、错误对象，或者完全不同的数据结构，而 TypeScript 永远不会知道。

这种通过返回类型进行的隐式类型断言只是其中一个 “逃生口”。TypeScript 还提供了更多：

- `any`
  
  （终极核武器）
- `@ts-ignore`
  
  （把问题扫到地毯下面）
- `as unknown as T`
  
  （双重谎言，永远能通过）
- 无法验证的类型断言

在一个大型代码库里，你怎么知道没人 “作弊”？答案是：你不知道。你的安全性取决于最薄弱的那个 any。

对比一下 Elm：在 Elm 里，作弊是根本不可能的。没有任何 “逃生通道”。如果编译器说它是安全的，那它就真的是安全的。

#### 边界问题

更深层的问题在于：TypeScript 只了解你的代码，它对外部世界一无所知。

每当数据进入你的系统 —— 无论来自 API、用户输入、本地存储还是 URL 参数 —— 它都是不可信的。TypeScript 无法验证这些数据。你写的类型，只是 “期望”，直到你真正校验之前，它都只是 “想当然”。

而现代前端开发让这个问题更加严重：大多数项目把框架逻辑和基础设施代码紧紧耦合在一起。

[【第3621期】浅谈 AI 搜索前端打字机效果的实现方案演进](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278059&idx=1&sn=5a5447da3d7484b5b9d7178a3aa36ad9&scene=21#wechat_redirect)

来看一个典型的 React 组件：

```
 function UserProfile({ userId }: { userId: string }) {
   const [user, setUser] = useState<User | null>(null);

   useEffect(() => {
     fetch(`/api/users/${userId}`)
       .then(res => res.json())
       .then(data => setUser(data as User)); // ??
   }, [userId]);

   if (!user) return <div>Loading...</div>;

   return (
     <div>
       <h1>{user.name}</h1>
       <p>{user.email}</p>
     </div>
   );
 }
```
这就是常态！UI 逻辑、状态管理、副作用、数据请求 —— 全都搅在一起。这个组件同时在：

- 管理 React 的状态和生命周期
- 从网络获取数据
- 用类型断言 “转换” 数据
- 渲染 UI

在这里，“安全数据” 和 “不安全数据” 之间根本没有明确的边界。基础设施层（数据请求）和框架层（Hooks、Effect）混在一起，而 TypeScript 让你误以为 `data as User` 之后数据就 “安全” 了。

但在一个良好设计的系统中，你的领域层和应用层应该只处理安全、已验证的数据。只有基础设施层，才该去应对来自外部世界的混乱与无类型现实。

##### 在 Elm 中：默认即安全

Elm 会强制你采用特定的架构。来看一下如何在 Elm 中处理 API 数据：

```
 type alias User =
     { id : Int
     , name : String
     , email : String
     }

 userDecoder : Decoder User
 userDecoder =
     Decode.map3 User
         (Decode.field "id" Decode.int)
         (Decode.field "name" Decode.string)
         (Decode.field "email" Decode.string)

 -- 这个函数返回 Result Error User
 -- 编译器会强制你处理这两种情况
 decodeUser : String -> Result Error User
 decodeUser json =
     Decode.decodeString userDecoder json
```
一旦你的领域层中获得了一个 `User`，就可以确定它是合法的。类型系统不会让无效数据流入你的业务逻辑。你代码的内部层只会处理安全、经过验证的数据。

#### 在 TypeScript 中：没有边界

在 TypeScript 里，没有这样的强制机制。你可以把未经验证的数据传到任何地方：

```
 // 基础设施层——获取原始数据
 async function fetchUser(id: number): Promise<User> {
   const response = await fetch(`/api/users/${id}`);
   return await response.json(); // ?? 希望这真的是个 User
 }

 // 领域层——假设数据是安全的
 function sendWelcomeEmail(user: User) {
   // 如果 user 是 null 或者类型错误，这里就会崩溃
   emailService.send(user.email, "Welcome!");
 }
```
TypeScript 无法告诉你 `fetchUser` 可能不会返回一个真正的 `User`，也无法提醒你领域层正在处理潜在的无效数据。

当然，你可以在 TypeScript 中建立合理的边界，比如使用 Zod 或 io-ts 这类库在边界处进行验证：

```
 import { z } from "zod";

 const UserSchema = z.object({
   id: z.number(),
   name: z.string(),
   email: z.string().email(),
 });

 type User = z.infer<typeof UserSchema>;

 async function fetchUser(id: number): Promise<User> {
   const response = await fetch(`/api/users/${id}`);
   const data = await response.json();
   return UserSchema.parse(data); // 真正进行了验证！
 }
```
但请注意：这完全取决于你自己是否 “记得” 去做。TypeScript 不会提醒你，也不会因为你忘了验证而编译失败。而在一个有几十个开发者的大型项目中，总会有人忘记。

你也可以 —— 甚至应该 —— 考虑使用 Effect 这种更全面的方案，不过那又是另一个话题了。

#### 运行时 vs 编译时

这正好揭示了一个根本区别：TypeScript 在运行时完全消失，而在编译时对很多事情一无所知。

当代码真正运行在生产环境中时，那些漂亮的类型全都没了。剩下的只是 JavaScript—— 动态的、无类型的，而且非常 “乐意” 让一个 `undefined` 直接导致应用崩溃。

[【第3402期】编译拦截？](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651273720&idx=1&sn=7bdc19d3cf3cac4ae4c1b6e0377cdf19&scene=21#wechat_redirect)

TypeScript 是一个编译时工具。它能检查代码内部的一致性，却无法检查代码与 “现实” 的一致性。除非你明确告诉它，否则它不会理解或关心架构层次、领域边界，也不会意识到外部世界的危险。

而 Elm 的类型系统 是在整个架构中持续发挥作用的。解码器不仅仅是 “加上类型注释”—— 它真的会去验证数据。`Maybe` 类型也不仅仅是告诉你某个值可能不存在 —— 它会强制你处理这种情况，否则代码无法编译。

#### 更深层的问题：思维模式

TypeScript 带来了一种虚假的安全感。

我看到许多开发者会这样做：

- 因为 “有类型” 就跳过数据验证
- 因为 “编译器检查过” 就不测边界情况
- 因为赶时间而随手加上 `as` 断言
- 用 `any` 来 “让错误消失”
- 相信 “只要能编译，就没问题”

这才是真正的危险。问题不在于 TypeScript 不好 —— 它非常优秀。危险在于我们把它当成了它不是的东西。

TypeScript 本质上是一个非常先进的 Linter（代码检查工具）。它非常擅长捕捉拼写错误、重构失误，以及在代码内部误用 API 的问题。但它不是安全保证，不是验证机制，更不是替代思考的工具。

最重要的是：它不等于真正的类型安全。

#### 什么才是真正能 “拯救” 你的

如果 TypeScript 拯救不了你，那什么能呢？

答案是：理解边界。

[【早说】轻度介入-边界感](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651260551&idx=2&sn=774e8751ccb2213cad21041afe9a25d2&scene=21#wechat_redirect)

在任何系统中 —— 无论是 TypeScript、Elm，还是其他语言 —— 你都需要清楚：哪些地方是不安全的，哪些地方才变得安全。你需要有负责验证的 “基础设施层”，以及只处理已验证数据的 “领域层”。

在 Elm 中，语言本身会强制这种架构：边界层使用解码器（decoder），核心层只包含纯函数，副作用留在最外层。你根本无法 “作弊”。

而在 TypeScript 中，这一切都要靠你自己去建立规范和自律：

- 在边界处验证（或解析）数据 —— 使用 Zod、io-ts、Effect 等库。永远不要信任外部输入。
- 创建安全的类型 —— 一旦数据验证通过，使用带品牌的类型或类，防止无效数据被构造出来。
- 禁用逃生通道 —— 配置项目，强制标记 `any`、`as`、`@ts-ignore`。让 “投机取巧” 变得难受。
- 分离关注点 —— 将 “基础设施逻辑”（如 fetch、parse）与 “领域逻辑” 分离。不要把 useEffect 和业务规则混在一起。
- 测试失败场景 —— 类型无法防止坏数据，但测试可以。

#### 类型安全的 “手艺”

这让我想到一个我经常提到的主题：编程是一门手艺。

一个优秀的手艺人，懂得自己的工具 —— 既了解它的强项，也了解它的局限。锤子钉钉子没问题，但你不会因为手里只有锤子就拿它去拧螺丝。

TypeScript 也是一样，当你真正了解它的边界时，它是个极好的工具：

- 它能捕捉代码内部的错误
- 它让重构更安全
- 它能清晰表达你的意图
- 它让开发体验更好

但它不能：

- 验证外部数据
- 防止运行时错误
- 保证类型绝对安全
- 阻止坏数据进入系统

无论你使用的是 TypeScript、Elm，还是别的语言，关键都在于：你真正理解自己手里的工具能带来什么。  
工具很好，但它们不是思考的替代品。

#### 学习 “真正的类型安全”

如果你想亲身体验 “真正的类型安全”—— 那种 “只要能编译就能运行” 的感觉 —— 那就去试试 Elm。  
当然，还有其他同样安全且函数式的语言，但我常说：对前端开发者（尤其是熟悉 React 的人）来说，Elm 是通往真正类型安全的最短路径。

你不一定要在生产环境中用它（虽然我确实用，而且很喜欢），但它能让你理解：当一种语言认真对待类型安全时，它会是什么样。当没有逃生通道、编译器真正 “保护你” 时，开发体验会如何不同。

一旦你体验过真正的类型安全，你就会在任何语言中开始自觉地构建更清晰的边界。

#### 结论

TypeScript 拯救不了你。但理解它的局限，也许能。

使用 TypeScript。享受它的强大。但不要盲目信任它。在边界处验证数据，测试错误路径，构建清晰架构。永远记住：那个绿色的对勾，只代表你的代码在自身逻辑上是一致的 —— 不是它是正确的。

最好的代码，来自那些会思考的开发者，来自真正懂得 “打磨技艺” 的工程师与架构师，而不是追逐框架和流行语、只满足于 “类型正确” 的人。

关于本文  
译者：@飘飘  
作者：@Christian Ekrem  
原文：https://cekrem.github.io/posts/why-typescript-wont-save-you/

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
