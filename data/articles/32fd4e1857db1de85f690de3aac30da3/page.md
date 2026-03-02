---
title: "出圈了？JS的try...catch新写法，被质疑抄袭Go语言！"
link: "http://mp.weixin.qq.com/s?__biz=Mzg2NjY2NTcyNg==&mid=2247508595&idx=1&sn=411032c33ea7ad74c5cbf9be85b6d7d4&chksm=ce45b7e2f9323ef4692897ea57b48ae7461f4ed7e8b7649e7ecebc62037e494f2dfa9982fa49#rd"
date: 2026-01-30
md5: 32fd4e1857db1de85f690de3aac30da3
---

# 出圈了？JS的try...catch新写法，被质疑抄袭Go语言！

JavaScript异步编程中，try/catch是传统错误处理方案，但冗余嵌套与割裂逻辑饱受诟病。近年来兴起的轻量化结构化写法，因与Go语言“返回值式错误处理”高度重合，陷入“抄袭”争议，引发对“借鉴”与“抄袭”的讨论。

## 传统try/catch的困境：催生替代方案的土壤

作为JS原生机制，try/catch虽能解决问题，但在多异步场景中冗余感突出，重复包裹的代码割裂业务逻辑，还易因批量包裹导致错误定位困难。

典型冗余写法：

```
try {
  const data = await fetchUser();
  doSomething(data);
} catch (e) {
  console.error('出错了', e);
}
```
多异步调用时，重复封装会让代码臃肿，批量包裹try/catch更会埋下定位隐患。

这种困境促使开发者借鉴其他语言，Go的“返回值携错误”方案成为灵感来源，也开启了争议。

## 方案一：语言层提案try操作符——神似Go的语法构想

处于Stage 1的JS提案（https://github.com/arthurfiorette/proposal-try-operator），将try升级为表达式，返回\[状态, 错误, 结果\]三元组，写法与Go高度相似：

```
const [ok, err, result] = try await fetchUser();
```
其逻辑复刻Go的`val, err := fn()`，通过线性判断替代catch跳转，简化错误处理：

```
const [ok, err, user] = await safeAwait(fetchUser());
if (!ok) {
  console.error('请求失败:', err);
  return;
}
console.log('用户数据:', user);
```
支持者视其为JS错误处理的进化，质疑者则认为是对Go语法的无创新复刻。该提案尚未落地，最终形态仍不确定。

## 方案二：自定义封装safeAwait——复刻Go的核心逻辑

无需等待提案，开发者可自行封装safeAwait，本质是将Go的错误处理逻辑适配JS，统一返回\[状态, 错误, 数据\]三元组。

TypeScript封装实现（含类型推导）：

```
export type SafeAwaitResult<T> =
  | [true, null, T]
  | [false, Error, null];

exportasyncfunction safeAwait<T>(promise: Promise<T>): Promise<SafeAwaitResult<T>> {
try {
    const result = await promise;
    return [true, null, result];
  } catch (err: any) {
    const error = err instanceofError ? err : newError(String(err));
    return [false, error, null];
  }
```
使用方式与Go一脉相承，无嵌套更简洁：

```
const [ok, err, user] = await safeAwait(fetchUser());
if (!ok) {
  console.error('请求失败:', err);
  return;
}
```
该封装语义清晰、支持链式调用，但也遭“拿来主义”质疑。多数开发者认为，这是适配JS生态的合理借鉴，而非抄袭。

## 方案三：第三方库await-to-js——开箱即用的“Go式方案”

社区库await-to-js将Go模式封装为工具，简化为\[错误, 结果\]二元组，适配JS习惯，开箱即用。

安装与使用：

```
npm install await-to-js
```
```
import to from 'await-to-js';

const [err, data] = await to(fetchUser());
if (err) return handle(err);
render(data);
```
该库降低了接入成本，却也放大了抄袭争议。支持者认为其价值在于标准化，质疑者则诟病缺乏创新。

## 争议背后：是抄袭，还是语言间的思想融合？

三种写法均借鉴了Go“返回值承载错误”的核心，但称其“抄袭”有失偏颇。编程语言的发展本就伴随思想交叉，JS的借鉴是痛点驱动下的合理适配。

各方案对比：



| 方案 | 与Go的关联 | 优点 | 缺点 | 适用场景 |
| --- | --- | --- | --- | --- |
| 原生try/catch | 无关联，原生异常捕获 | 原生支持，语义明确 | 冗长、嵌套多、逻辑割裂 | 控制分支复杂的少量异步逻辑 |
| 自定义safeAwait | 复刻Go三元组返回逻辑 | 语法灵活，类型安全，可定制 | 需自行维护封装代码 | 中大型项目，追求统一错误处理风格 |
| await-to-js库 | 简化Go二元组返回逻辑 | 即装即用，社区成熟，稳定性高 | 增加第三方依赖 | 快速落地，团队协作项目 |
| Go语言原生写法 | 核心思想源头 | 简洁高效，结构化强 | 不适配JS异步生态 | Go语言后端开发 |


## 结语：JS错误处理的进化，无关抄袭，重在适配

try/catch已难适配复杂异步场景，JS借鉴Go的思路，本质是为解决自身痛点，实现错误处理的轻量化。

“抄袭”争议是对跨语言思想复用的过度解读，技术的核心是解决问题。对开发者而言，选对适配项目的方案，远比纠结“借鉴”与否更有意义。

## 结语

我是林三心，一个待过**小型toG型外包公司、大型外包公司、小公司、潜力型创业公司、大公司**的作死型前端选手

我建了一些**前端学习群**，如果大家想进群交流前端知识，可以关注我，回复**加群**

![图片](./images/e91fb1f23e19c80e44012a0dbb56108a.webp)
