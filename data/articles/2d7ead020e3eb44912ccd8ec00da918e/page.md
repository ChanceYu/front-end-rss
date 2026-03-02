---
title: "打包工具 rollup.js 入门教程"
link: "http://www.ruanyifeng.com/blog/2022/05/rollup.html"
date: 2022-05-05
md5: 2d7ead020e3eb44912ccd8ec00da918e
---

# 打包工具 rollup.js 入门教程

[rollup.js](https://rollupjs.org/) 是一个 JavaScript 打包工具。本文介绍它的基本用法。

![](./images/74fd1afc07a874d5df7c3dafa56a3abb.webp)

## 一、简介

打包工具的作用是，将多个 JavaScript 脚本合并成一个脚本，供浏览器使用。

浏览器需要脚本打包，主要原因有三个。

> （1）早期的浏览器不支持模块，大型网页项目只能先合并成单一脚本再执行。
> 
> （2）Node.js 的模块机制与浏览器不兼容，必须通过打包工具进行兼容处理。
> 
> （3）浏览器加载一个大脚本，要比加载多个小脚本，性能更好。

目前，最常用的打包工具是 Webpack。它的功能强大，但是难学难用，一直被人诟病。

![](./images/b9089c3f60ca1dbc41950f47e635ebbd.webp)

rollup.js 的开发本意，是打造一款简单易用的 ES 模块打包工具，不必配置，直接使用。这一点，它确实做到了。

后来经过不断发展，它也可以打包 CommonJS 模块。但是，这时需要经过复杂配置，实际上并没有比 Webpack 简单多少。

因此建议，**只把 rollup.js 用于打包 ES 模块**，这样才能充分发挥它的优势。下面你会看到，那是多么简单的一件事。

如果你的项目使用 CommonJS 模块，不推荐使用 rollup.js，优势不大。

如果你还不了解 ES 模块与 CommonJS 模块之间的差异，详见 [ES6 教程](https://wangdoc.com/es6/module-loader.html#es6-%E6%A8%A1%E5%9D%97%E4%B8%8E-commonjs-%E6%A8%A1%E5%9D%97%E7%9A%84%E5%B7%AE%E5%BC%82)。

## 二、安装

本文采用全局安装 rollup.js。

```bash
$ npm install --global rollup
```
但是，你也可以不安装直接使用，就是把下面所有命令中的`rollup`，替换成`npx rollup`（参见[《npx 使用教程》](https://www.ruanyifeng.com/blog/2019/02/npx.html)）。

第一次使用，可以运行下面的命令，查看一下帮助。

```bash
$ rollup --help
# 或者
$ npx rollup --help
```
## 三、示例

下面，就用 rollup.js 打包两个简单的脚本：库文件 add.js 和入口脚本 main.js。

```javascript
// add.js
const PI = 3.14;
const E = 2.718;

export function addPi(x) {
  return x + PI;
}

export function addE(x) {
  return x + E; 
}
```
上面代码中，模块 add.js 输出了两个工具函数`addPi()`和`addE()`。

```javascript
// main.js
import { addPi } from './add.js';

console.log(addPi(10));
```
上面代码中，入口脚本 main.js 加载了 add.js 里面的工具函数`addPi()`。

接着，就用 rollup.js 打包。

```bash
$ rollup main.js
```
打包时只需给出入口脚本 main.js，rollup 会自动把依赖项打包进去。

打包结果默认输出到屏幕。

```javascript
const PI = 3.14;

function addPi(x) {
  return x + PI;
}

console.log(addPi(10));
```
可以看到，`import`和`export`语句都没了，被换成了原始代码。

另外，函数`addE()`没有打包进去，因为没有用到它。这种特性叫做摇树（tree-shaking），即打包时自动删除没有用到的代码。

由于上面两点，rollup 输出的代码非常整洁，而且体积小于其他打包工具。

使用参数`--file [FILENAME]`，将打包结果保存到指定文件。

```bash
$ rollup main.js --file bundle.js
```
上面命令将打包结果保存到 bundle.js。

## 四、使用注意点

（1）如果有多个入口脚本，就依次填写它们的文件名，并使用参数`--dir`指定输出目录。

```bash
$ rollup m1.js m2.js --dir dist
```
上面命令会在目录`dist`，打包生成多个文件：m1.js、m2.js、以及它们共同的依赖项（如果有的话）。

（2）参数`--format iife`，会把打包结果放在一个自动执行函数里面。

```bash
$ rollup main.js --format iife
```
（3）如果希望打包后代码最小化，使用参数`--compact`。

```bash
$ rollup main.js --compact
```
另一种方法是使用专门工具。

```bash
$ rollup main.js | uglifyjs --output bundle.js
```
上面命令分成两步，第一步是 rollup 打包，第二步是 uglifyjs 进行代码最小化，最后写入 bundle.js。

（4）rollup 支持使用[配置文件](https://rollupjs.org/guide/en/#configuration-files)（rollup.config.js），把参数都写在里面，下面是一个例子。

```javascript
// rollup.config.js
export default {
  input: 'main.js',
  output: {
    file: 'bundle.js',
    format: 'es'
  }
};
```
参数`-c`启用配置文件。

```bash
$ rollup -c
```
我不推荐使用配置文件，这样会增加额外的复杂性。默认场景下，命令行参数已经够用了，也更容易阅读。

## 五、转成 CommonJS 模块

最后，rollup 还支持 ES 模块转成 CommonJS 模块，使用参数`--format cjs`就可以了。

```bash
$ rollup add.js --format cjs
```
转换后的 CommonJS 模块，代码如下。

```javascript
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const PI = 3.14;
const E = 2.718;

function addPi(x) {
  return x + PI;
}

function addE(x) {
  return x + E; 
}

exports.addE = addE;
exports.addPi = addPi;
```
（完）
