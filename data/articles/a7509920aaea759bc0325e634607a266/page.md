---
title: "基于 AI 生成高质量 Mock 数据的实践"
link: "http://mp.weixin.qq.com/s/ASg4d4P9tneHQRKgodq9BA"
date: 2026-02-06
md5: a7509920aaea759bc0325e634607a266
---

# 基于 AI 生成高质量 Mock 数据的实践

> 在前后端分离的研发模式下，Mock 数据是并行开发的基础设施。本文介绍一套 Mock 工具的技术实现，核心解决四个问题：请求拦截、规则匹配、数据质量、团队共享。

## 背景

在实际业务开发中，前端和测试同学经常遇到这些问题：

- **联调阻塞**：后端接口未就绪时，前端只能等待或硬编码 `if (true) { ... }`
- **场景覆盖难**：想模拟边缘场景（异常、空数据、分页），往往需要后端改数据库
- **Mock 数据质量差**：Mock.js 生成的 `@cname`、`@integer` 缺乏业务语义，和真实数据差距大
- **数据难共享**：Mock 数据存在本地，换台电脑或换个同事就用不了

我们需要一套工具解决这些问题：

- 不侵入业务代码，npm 包引入即可
- 支持参数级别的规则匹配，同一接口可配置多个场景
- 根据接口文档自动生成符合业务语义的数据
- 支持团队共享 Mock 配置

---

## 业界常见方案



| 方案 | 优点 | 不足 |
| --- | --- | --- |
| 硬编码 Mock | 简单直接 | 侵入业务代码，发布前需手动删除 |
| Mock.js | 有数据生成能力 | 规则配置繁琐，数据缺乏业务语义 |
| whistle 代理 | 不侵入业务，使用简单 | 数据保存在本地，无法团队共享，无法匹配复杂场景 |
| MSW (Service Worker) | 网络层拦截 | 需注册 sw.js，依赖 HTTPS，接入成本高 |
| 浏览器插件 | 使用简单 无侵入式 | 规则在本地，无法接入内部接口平台 |


这些方案都无法同时满足"低侵入"、"规则灵活"、"数据质量高"、"团队可共享"四个需求。

---

## 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        业务项目                              │
│   import { mockInit } from '@zz-common/ai_mock'             │
│   mockInit({ rules: ['api.example.com'] })                  │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    ai_mock (npm 包)                         │
│      XHR/Fetch 拦截  →  规则匹配引擎  →  返回 Mock 数据         │
└────────────────────────────┬────────────────────────────────┘
                             │ 动态加载 sdk + CustomEvent 通信
┌────────────────────────────▼────────────────────────────────┐
│                  mock-sdk (可视化面板)                        │
│        请求列表  |  规则管理  |  Monaco Editor 编辑器           │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP
┌────────────────────────────▼────────────────────────────────┐
│                   node (后端服务)                            │
│         接口文档获取  →  AI 生成  →  数据持久化                 │
└─────────────────────────────────────────────────────────────┘
```
核心设计：

- `ai_mock` 只负责拦截和匹配，不包含 UI 代码
- `mock-sdk` 通过 CDN 动态注入，不增加业务包体积
- 两者通过 `CustomEvent` 松耦合通信
- 仅在非生产环境启用

---

## 核心实现一：请求拦截

### 问题

现代前端应用混合使用 `XMLHttpRequest` 和 `fetch`。拦截时需要解决：

1. 同时拦截 XHR 和 Fetch，且不破坏第三方库（如 Sentry）的监听逻辑
2. XHR 的 `readyState`、`status`、`responseText` 是只读属性，无法直接赋值
3. 拦截后发送真实请求会再次进入拦截逻辑，造成无限递归

### 实现

通过重写 `XMLHttpRequest.prototype.send` 和 `window.fetch` 实现拦截：

```
// 保存原始方法
const xhrSendNative = XMLHttpRequest.prototype.send
const originalFetch = window.fetch

// 防递归：标记真实请求
const isRealRequest = new WeakMap<XMLHttpRequest, boolean>()

XMLHttpRequest.prototype.send = function(...args) {
const xhr = this
const url = sliceUrlPath(xhr.originRequestUrl)

// 检查是否为标记的真实请求，防止无限递归
if (isRealRequest.get(xhr)) {
    return xhrSendNative.apply(xhr, args)
  }

// 检查是否命中 Mock 规则
if (mockInterface[url]?.isOpen) {
    const mockResult = getMockData(url, requestData)
    
    if (mockResult.matched) {
      // 1. 立即返回 Mock 响应给业务层
      applyMockResponseToXhr(xhr, mockResult.data, mockResult.httpStatusCode)
      
      // 2. 后台发送真实请求（用于数据对照，不触发业务回调）
      const realXhr = cloneXHR(xhr, false)  // 不复制事件监听器
      isRealRequest.set(realXhr, true)       // 标记，防止递归
      xhrSendNative.apply(realXhr, args)
      return
    }
  }

// 未命中：执行原生请求
  xhrSendNative.apply(this, args)
}
```
**覆写只读属性**：XHR 的 `readyState`、`status` 等属性是只读的，通过 `Object.defineProperties` 解决：

```
const applyMockResponseToXhr = (
  xhr: XMLHttpRequest,
  responseData: any,
  statusCode: number
) => {
const responseText = typeof responseData === 'string'
    ? responseData 
    : JSON.stringify(responseData)

// 通过 defineProperties 覆写只读属性
Object.defineProperties(xhr, {
    readyState: { get: () =>4, configurable: true },
    status: { get: () => statusCode, configurable: true },
    response: { get: () => responseData, configurable: true },
    responseText: { get: () => responseText, configurable: true }
  })

// 触发标准事件序列
  xhr.dispatchEvent(new Event('readystatechange'))
  xhr.dispatchEvent(new Event('load'))
  xhr.dispatchEvent(new Event('loadend'))
}
```
**立即响应 + 真实请求**：开启 Mock 后，业务层立即拿到 Mock 数据，同时后台会发送一份真实请求用于数据对照。面板提供「加载真实数据」按钮，可以一键将真实响应填入编辑器，方便基于真实数据微调。

---

## 核心实现二：规则匹配引擎

### 问题

实际业务中，同一个接口需要根据不同参数返回不同数据：

- `page=1` 返回第一页，`page=2` 返回第二页
- `userId=vip` 返回 VIP 数据，`userId=normal` 返回普通数据
- `header` 中带某个标识时返回调试数据

参数可能在 URL Query、Request Body、Header、Cookie、Path 中，需要一套灵活的规则匹配机制。

### 规则数据结构

```
interface MockRule {
  id: string;
  url: string;
  name: string;
  priority: number;  // 优先级，数字越小越优先
  enabled: boolean;
type: 1 | 2 | 3;   // 1=本地草稿，2=个人云端，3=团队共享
  paramConditions: ParamCondition[];  // 参数条件
  mockData: any;
  httpStatusCode: number;
  delay?: number;
}

interface ParamCondition {
  location: 'query' | 'body' | 'header' | 'cookie' | 'path';
  paramName: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 
            'greaterThan' | 'lessThan' | 'greaterOrEqual' | 'lessOrEqual';
  value: any;
}
```
### 匹配算法

```
function matchRule(rules: MockRule[], request: RequestInfo): MatchResult {
// 只匹配已启用的期望，按优先级排序
const enabledRules = rules
    .filter(rule => rule.enabled)
    .sort((a, b) => a.priority - b.priority);

const matched = enabledRules.find(rule => isRuleMatched(rule, request));

return matched 
    ? { matched: true, rule: matched, delay: matched.delay ?? 0 }
    : { matched: false };
}

function isRuleMatched(rule: MockRule, request: RequestInfo): boolean {
// 没有参数条件，匹配所有请求
if (!rule.paramConditions?.length) returntrue;

// 所有条件都满足才匹配（AND 关系）
return rule.paramConditions.every(condition =>
    matchParamCondition(condition, request)
  );
}
```
### 参数值获取

根据 `location` 从不同位置取值：

```
function getParamValue(location: string, paramName: string, request: RequestInfo): any {
switch (location) {
    case'query':
      return request.query?.[paramName];
    case'body':
      // 支持嵌套路径，如 body.user.id
      return getNestedValue(parseBody(request.body), paramName);
    case'header':
      return request.headers?.[paramName];
    case'cookie':
      return parseCookie(request.headers?.cookie, paramName);
    case'path':
      return extractPathParam(request.url, paramName);
    default:
      returnundefined;
  }
}
```
比较时会做类型兼容处理，比如 `1` 和 `"1"` 视为相等，避免因类型不一致导致匹配失败。

### 使用示例



| 请求参数 | 规则配置 | 结果 |
| --- | --- | --- |
| ?page=1 | query.page equals 1 | 返回第一页数据 |
| ?page=2 | query.page equals 2 | 返回第二页数据 |
| body: {"user":{"type":"vip"}} | body.user.type equals "vip" | 返回 VIP 数据 |
| Header: X-Debug: true | header.X-Debug equals "true" | 返回调试数据 |


---

## 核心实现三：AI 生成高质量数据

### 问题

Mock.js 生成的数据缺乏业务语义：

```
// Mock.js 生成
{ name: "xxx", age: 82, status: 3 }

// 期望的业务数据
{ name: "张三", age: 28, status: 1 }  // status: 0=待审核, 1=已通过, 2=已拒绝
```
我们希望根据接口文档中的字段描述、枚举说明、字段命名来生成符合业务语义的数据, 这样文档备注越详细 字段名定义越清晰 生成数据会越准确。

### 实现思路

后端服务从 API文档平台 获取接口的 JSON Schema，构建 Prompt 调用 AI 生成数据。

**核心 Prompt 设计**：

```
const systemPrompt = `
你是 Mock 数据生成专家，根据 JSON Schema 生成符合业务场景的数据。

【生成规则 - 按优先级排序】
1. 若 description 中存在枚举说明（如 "0:成功, 1:失败"），优先使用枚举值本身（如 0、1）
2. 若无 description，则根据字段名的语义生成合理值
3. 数组类型默认生成 5 条数据
4. 若 description 中枚举值较多，数组应覆盖所有枚举值

【默认值规则】
- respCode / code：成功场景为 0，失败场景为 -1
- errorMsg：成功场景为 null，失败场景为 "系统异常"
- 图片 URL：使用统一的占位图地址
- 普通 URL：使用统一的域名地址

【输出格式】
仅输出 JSON，不附加任何解释文字
`;
```
**关键设计点**：

1. **description 优先**：接口文档中 `status: 0=待审核, 1=已通过` 这类描述会被优先使用
2. **字段名语义**：`userName` 生成中文姓名，`price` 生成合理价格
3. **枚举覆盖**：数组字段会尽量覆盖所有枚举值，便于测试
4. **默认成功场景**：除非用户指定，否则生成正常数据

### 数据校验

AI 生成的 JSON 可能格式有问题，通过 `jsonrepair` 验证修复：

```
const jsonMatch = result.match(/\{[\s\S]*\}/);
if (jsonMatch) {
  return jsonrepair(jsonMatch[0]);
}
```
生成后对比 Schema 和实际数据，字段缺失时发送告警。

### 生成模式

- **整体生成**：根据完整 Schema 生成所有字段
- **选区生成**：只替换选中的字段，保留其他字段不变
- **自定义 Prompt**：用户可输入额外要求，如"生成 VIP 用户数据"、"价格在 100-500 之间"、"生成10条数据"、"生成某个场景值的数据"等

---

## 核心实现四：三层作用域

### 问题

Mock 数据存在本地的问题：

- 换台电脑就没了
- 同事想用同一套数据，只能手动复制
- 团队标准测试数据无法统一管理

### 设计

三层作用域解决不同场景的需求：



| 作用域 | 存储位置 | 可见性 | 典型场景 |
| --- | --- | --- | --- |
| 本地草稿 | IndexedDB | 仅当前设备 | 临时调试 |
| 个人云端 | 远程数据库 | 仅创建者 | 跨设备同步 |
| 团队共享 | 远程数据库 | 所有团队成员 | 标准测试数据 |


**关键设计**：

1. **优先级和启用状态仅在本地维护**：避免团队成员互相干扰
2. **云端只存期望内容**：每个人独立控制"哪些期望启用、优先级如何排序"
3. **规则缓存**：加载后缓存在 `window.__mockRulesCache`，避免重复读取 IndexedDB

### 数据结构

```
interface MockRule {
  type: 1 | 2 | 3;  // 1=本地草稿，2=个人云端，3=团队共享
  enabled: boolean; // 本地维护
  priority: number; // 本地维护
  // ... 其他字段
}
```
### 事件通信

SDK 与 UI 面板通过 CustomEvent 通信：



| 事件名 | 方向 | 用途 |
| --- | --- | --- |
| mock-request-end | SDK → UI | 请求完成上报 |
| mock-interface-switch | UI → SDK | 单接口开关控制 |
| mock-rules-updated | UI → SDK | 规则更新通知 |


### 数据清理

自动清理 30 天未使用的本地数据，自动清理非活跃的数据 避免存储膨胀：

```
await cleanupInactiveData(30);
```
---

## 动态模板语法

支持在 Mock 数据中引用请求参数，实现"响应随请求变化"：



| 语法 | 说明 | 示例 |
| --- | --- | --- |
| {{Date.now()}} | 当前时间戳 | 1706432400000 |
| {{uuid()}} | 生成 UUID | "a1b2c3d4-..." |
| {{request.query.xxx}} | 获取 URL 参数 | {{request.query.page}} |
| {{request.body.xxx}} | 获取请求体字段 | {{request.body.userId}} |
| {{request.headers.xxx}} | 获取请求头 | {{request.headers.token}} |


示例：

```
{
  "code": 0,
  "data": {
    "requestId": "{{uuid()}}",
    "timestamp": "{{Date.now()}}",
    "userId": "{{request.body.userId}}",
    "page": "{{request.query.page}}"
  }
}
```
---

## 快速开始

```
// 1. 安装
npm install @zz-common/ai_mock

// 2. 初始化
import { mockInit } from '@zz-common/ai_mock'

mockInit({
  rules: ['api.example.com'],      // 拦截的域名
  excludeRules: [/static/, /cdn/]  // 排除的资源
})
```
## 推荐工作流

下面演示从请求采集到 AI 生成 Mock 数据的完整流程：

1. **接入 npm 包**：在非生产环境启用拦截
2. **从真实请求创建 Mock**：打开面板，点击请求日志的"创建期望"
3. **配置参数条件**：同一接口不同参数返回不同数据
4. **AI 生成补充**：用 AI 生成符合业务语义的数据
5. **团队共享**：将稳定的测试数据推送到团队共享

---

## 总结

本文介绍的 Mock 工具解决了四个核心问题：



| 问题 | 解决方案 |
| --- | --- |
| 请求拦截 | Monkey Patch 重写 XHR/Fetch，通过 WeakMap 防递归 |
| 规则匹配 | 支持 5 种参数位置 × 8 种操作符，按优先级排序 |
| 数据质量 | AI 根据接口文档的 description、字段名语义生成数据 |
| 团队共享 | 三层作用域，本地维护启用状态和优先级 |


目前这套工具已在公司内部使用，可以减少联调阻塞、提高场景覆盖率。

## 未来规划

- **流量录制回放**：基于真实流量生成 Mock 数据，数据更贴近线上场景
- **AI生成数据时基于真实数据**：进一步提升AI生成数据质量 贴近真实业务场景
- **移动端支持**：真机环境下配合 PC 端使用 Mock 数据验证
- **规则推荐**：基于历史请求，自动推荐可能需要的 Mock 场景

  

  

---

  


- 我是 ssh，工作 6 年+，阿里云、字节跳动 Web infra 一线拼杀出来的资深前端工程师 + 面试官，非常熟悉大厂的面试套路，Vue、React 以及前端工程化领域深入浅出的文章帮助无数人进入了大厂。
- 欢迎`长按图片加 ssh 为好友`，我会第一时间和你分享前端行业趋势，学习途径等等。2025 陪你一起度过！
- ![图片](./images/b5ad3289d79a880519f191ffa435f343.png)
- 关注公众号，发送消息：
  
  指南，获取高级前端、算法**学习路线**，是我自己一路走来的实践。
  
  简历，获取大厂**简历编写指南**，是我看了上百份简历后总结的心血。
  
  面经，获取大厂**面试题**，集结社区优质面经，助你攀登高峰

因为微信公众号修改规则，如果不标星或点在看，你可能会收不到我公众号文章的推送，请大家将本**公众号星标**，看完文章后记得**点下赞**或者**在看**，谢谢各位！
