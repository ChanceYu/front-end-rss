---
title: "仅用一个技巧，让 JavaScript 性能提速 500%！"
link: "http://mp.weixin.qq.com/s?__biz=Mzg2NjY2NTcyNg==&mid=2247508992&idx=1&sn=733842b0b0ece011008a3eea33d8fddb&chksm=ce45b191f9323887eb2aff395ee2cc4b155c6958ada947645c0f4208c9a87343162fe51cb51b#rd"
date: 2026-02-27
md5: 0af49c4bc19f7a84f6803f82691cd538
---

# 仅用一个技巧，让 JavaScript 性能提速 500%！

做Node.js后端的开发者，多半都经历过这种绝望时刻：业务系统跑的好好的，突然接了个CPU密集型需求——比如复杂的ID转换、加密运算，结果Node.js单线程直接卡死，Event Loop被彻底堵塞，接口响应时间从20ms飙升到2s，甚至整个服务直接假死。

这时候通常会听到两种声音：运维说“加机器！扩容！”（纯烧钱）；架构师说“Node.js不行，用Go/Java重写吧”（太费人）。但其实还有更“极客”的选择——“借刀杀人”：不改动Node.js整体架构，只把那1%拖慢性能的CPU密集型“烂代码”抽出来，用Rust重写，然后像调用普通npm包一样集成到项目里。今天就带大家体验NAPI-RS，5分钟让你的Node.js性能原地起飞。

## 为什么是Rust + Node.js？

Node.js的原生插件（Native Addons）以前堪称“劝退级”：得懂C++，还要和V8的API死磕，写错一行代码就可能触发Segmentation Fault，导致进程直接崩溃。但Rust不一样：

它天生内存安全（不会随便崩溃），而且现在的工具链（NAPI-RS）把开发体验做到了极致：

- 0配置：不用折腾node-gyp这个反人类的构建工具；
- 类型安全：自动生成.d.ts文件，TypeScript可以无缝调用；
- 极致性能：执行效率和C++处于同一级别。

## 1\. 极速开局

不多废话，直接上手实操。我们假设你的Node.js服务需要处理一个超复杂的计算任务（这里用斐波那契数列模拟，实际场景可能是复杂推荐算法打分、加密运算等）。

首先初始化一个Rust扩展项目（前提：已安装Node和Rust环境）：

```
# 全局安装napi-rs脚手架
npm install -g @napi-rs/cli
# 创建Rust扩展项目
napi new fast-calc-engine
```

脚手架会问几个简单问题，全部选默认即可。生成的目录结构比Create React App还简洁，毫无上手难度。

## 2\. 编写Rust核心逻辑

打开`src/lib.rs`文件，哪怕你从没学过Rust，这段代码也能一眼看懂。我们写一个递归版的斐波那契计算（故意写成低效递归，就是为了压榨CPU）：

```
#![deny(clippy::all)]

use napi_derive::napi;

#[napi] // 这个宏是核心：自动把Rust函数转换成Node可调用的函数
pub fn fibonacci_rust(n: u32) -> u32 {
  if n <= 1 {
    return n;
  }
  fibonacci_rust(n - 1) + fibonacci_rust(n - 2)
}
```

就这么简单？没错。`#[napi]`宏会自动处理所有类型转换：你从JS传入的Number，会自动转成Rust的u32；Rust返回的u32，又会自动转回JS的Number。

接下来构建项目：

```
npm run build
```

构建完成后，你的目录里会多出一个`index.js`和对应平台的二进制文件（比如macOS ARM64下是`fast-calc-engine.darwin-arm64.node`）。

## 3\. Node.js调用与惨烈对比

新建`test-bench.js`文件，来一场JS和Rust的“父子局”对决：

```
const { fibonacciRust } = require('./index.js'); // 引入编译好的Rust模块

// 用原生JS实现一模一样的递归逻辑
function fibonacciJS(n) {
if (n <= 1) return n;
return fibonacciJS(n - 1) + fibonacciJS(n - 2);
}

const N = 40; // 计算第40位斐波那契数，这个量级JS已经开始吃力

console.log('🏁 开始测试，计算 Fibonacci(' + N + ')...');

// 第一轮：原生Node.js（V8引擎）
console.time('🐢 Node.js (Pure JS)');
fibonacciJS(N);
console.timeEnd('🐢 Node.js (Pure JS)');

// 第二轮：Rust原生扩展
console.time('🚀 Rust (Native Module)');
fibonacciRust(N);
console.timeEnd('🚀 Rust (Native Module)');
```

运行结果（基于M1 Mac）：

```
🏁 开始测试，计算 Fibonacci(40)...
🐢 Node.js (Pure JS): 884.23ms
🚀 Rust (Native Module): 14.50ms
```

差距高达60倍！这意味着什么？如果这个计算逻辑嵌在你的HTTP接口里，用JS写的话QPS上限可能只有1；用Rust写，QPS能直接冲到60。更关键的是，这还只是单线程场景，Rust还能轻松利用多核CPU并行计算——这可是Node.js单线程模型的“死穴”。

## 4\. 什么时候该用这一招？

别看完文章就头脑发热，把所有if-else都用Rust重写。跨语言调用虽然成本极低（NAPI-RS已经做到极致），但并非零成本。

### 必须上Rust的场景：

- 图片/视频处理：缩放、加水印、编解码（和ffmpeg用C编写的原理一致）；
- 大规模数值计算：报表导出时的海量数据聚合、金融风控计算；
- 加密/解密/哈希：SM2/SM3/SM4国密算法、大批量bcrypt加密；
- 对象序列化/反序列化：当JSON.parse成为性能瓶颈时（比如simd-json）。

### 没必要用Rust的场景：

- 简单的CRUD业务；
- IO密集型任务（读写数据库、调用外部API）——Node.js在这方面已是世界级水平，Rust提升微乎其微。

## 5\. 总结

Node.js就像一把瑞士军刀，轻便、全能，能应对绝大多数业务场景；Rust则像一把重型机枪，火力拉满但上手稍沉。聪明的开发者不会二选一，而是把军刀变成机枪的刺刀——让Node.js负责IO和业务逻辑，让Rust承接CPU密集型计算。

下次再遇到Node.js性能瓶颈，别急着换语言、加机器。给你的package.json添一个Rust依赖，从“前端切图仔”升级成“系统工程师”，只需要这几百行代码。拒绝无意义的内耗，现在就动手试试！
