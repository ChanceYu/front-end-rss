---
title: "大模型应用中，前端绕不开的 SSE"
link: "http://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623831&idx=2&sn=b368ddd2b32d75b14a65bfb1fe995df0&chksm=80224656b755cf406d6159786d69cfb21a5741d25d54cd28a3c4d73dd0cd1b1c1cc9afbb93f4#rd"
date: 2026-01-14
md5: 9cc92012c7c0a90dbf3f7be88e35d2d9
---

# 大模型应用中，前端绕不开的 SSE

> 作者：星始流年
> 
> https://juejin.cn/post/7459973855101943808

## 1\. 什么是 SSE？

大家好，今天我们来聊一聊 **Server-Sent Events (SSE)** ，这是一种非常适合实时数据推送的技术。与 WebSocket 不同，SSE 只支持服务器到客户端的单向通信。它是基于 **HTTP 协议**的，能够让服务器推送数据到客户端。简单来说，SSE 就是让服务器能够在不需要客户端不断请求的情况下，主动推送数据。

### 核心特点：

- 基于 HTTP 协议，易于配置
- **单向通信**（服务器到客户端），但不限制消息流的复杂性
- **自动重连**机制，连接中断后会自动重新建立
- 轻量级，使用简单，适合做实时更新
- **纯文本数据格式**，易于调试和查看

## 2\. SSE vs WebSocket

这里有一个对比表格，让我们看看 SSE 和 WebSocket 的区别：



| 特性 | SSE | WebSocket |
| --- | --- | --- |
| 通信方向 | 单向（服务器到客户端） | 双向（服务器与客户端互通） |
| 协议 | HTTP | WebSocket (ws/wss) |
| 复杂度 | 简单易用 | 相对复杂，需管理握手和数据流 |
| 自动重连 | 内置支持 | 需要自行实现 |
| 数据格式 | 纯文本（JSON、文本等） | 二进制和文本（如图像、二进制数据） |


### 如何选择？

- 如果你的需求是 **服务器推送实时数据**，而且只是 **单向通信**，SSE 是一个非常轻便高效的选择。
- 如果需要 **双向通信**，如聊天、多人协作等功能，WebSocket 则是更合适的解决方案。

## 3\. SSE 的应用场景

SSE 是为一些特定的 **实时数据推送**场景设计的，尤其适合以下几种使用场景：

- **大语言模型的流式输出**：比如 AI 辅助工具实时输出文本。
- **实时通知和提醒**：如实时的后台任务进度推送、消息提醒。
- **实时日志显示**：例如服务器日志实时更新、调试信息推送。
- **股票价格更新**：金融市场数据、实时股票价格变化等。
- **社交媒体信息流**：动态推送用户的更新信息。

## 4\. 代码实现

接下来，咱们通过代码来看看 SSE 是如何实现的。我们先从 **后端**（NodeJS）和 **前端**（React）两部分来展示。

### 4.1 后端实现

```
const http = require("http");

// 模拟大模型的响应内容
const mockResponses = [
"你好！我是AI助手，",
"我正在处理你的请求。",
"\n\n",
"这是一个流式输出的演示，",
"我会每隔一段时间发送消息。",
"现在演示即将结束。",
"\n\n",
"再见！",
];

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
// 设置响应头
 res.setHeader("Access-Control-Allow-Origin", "*");

// SSE 接口
if (req.url === "/stream") {
// 设置 SSE 相关的响应头
  res.writeHead(200, {
   "Content-Type": "text/event-stream",
   "Cache-Control": "no-cache",
   Connection: "keep-alive",
  });

let messageIndex = 0;

// 发送初始化消息
  res.write(`: This is comment\n`); // 这是一个注释
  res.write(`retry: 3000\n`); // 如果断开，3秒后重连

// 定义发送消息的函数
const sendMessage = () => {
   if (messageIndex < mockResponses.length) {
    // 发送消息
    res.write(`id: ${messageIndex + 1}\n`); // 消息ID
    res.write(`event: message\n`); // 事件类型
    res.write(
     `data: ${JSON.stringify({
      content: mockResponses[messageIndex],
     })}\n\n`
    );

    messageIndex++;

    // 随机延迟 500ms-1000ms
    const delay = Math.floor(Math.random() * 501) + 500;
    setTimeout(sendMessage, delay);
   } else {
    // 发送结束消息
    res.write(`id: final\n`);
    res.write(`event: complete\n`);
    res.write(`data: "stream completed"\n\n`);
    res.end();
   }
  };

// 开始发送消息
  sendMessage();

// 监听客户端断开连接
  req.on("close", () => {
   console.log("客户端断开连接");
  });
 }
});

// 服务器监听 3001 端口
const PORT = 3001;
server.listen(PORT, () => {
console.log(`服务器正在运行，端口: ${PORT}`);
});
```
#### 服务端实现要点

1. 设置正确的响应头：`Content-Type: text/event-stream`：指定数据流格式为 SSE。`Cache-Control: no-cache`：避免缓存。`Connection: keep-alive`：保持连接活跃。
2. 以`:`开头的行会被当作注释，服务器可以用它发送调试信息，但客户端会忽略这些行。
3. 以`retry:`开头的行用于指定自动重连的时间间隔，单位为毫秒。
4. 以`id:`开头的行用于指定消息的 ID，用于区分不同的消息。客户端可以通过 eventSource.lastEventId 获取最后收到的消息 ID，当需要断线重连时，请求会自动发送 Last-Event-ID 头，服务器可以用它来续传消息。
5. 以`event:`开头的行用于指定消息的类型，如果不指定，默认为 `message` 事件。客户端可以用 `addEventListener(event, callback)` 来监听响应的事件(`message`事件使用 `onmessage`监听)。另外，自定义的事件类型也必须包含 `data` 字段，否则不会被触发。
6. 以`data:`开头的行用于指定消息的内容，客户端可以通过 `event.data` 获取消息的内容，并且消息必须以 JSON 格式传递，结尾必须是`\n\n`。
7. 每个字段都必须独占一行，多个字段之间不需要特定顺序，但通常的顺序是：

```
id: 消息ID
event: 事件类型
data: 消息内容
```
### 4.2 前端实现

```
import { useState, useRef, useEffect } from"react";
import"./App.css";

function App() {
const [messages, setMessages] = useState([]);
const [isStreaming, setIsStreaming] = useState(false);
const [connectionStatus, setConnectionStatus] = useState("未连接");
const eventSourceRef = useRef(null);

const startSSEStream = async () => {
  setIsStreaming(true);
  setMessages([]);

const connect = () => {
   setConnectionStatus("正在连接");

   const eventSource = new EventSource("http://localhost:3001/stream");
   eventSourceRef.current = eventSource;

   eventSource.onopen = () => {
    setConnectionStatus("已连接");
   };

   // 监听完成事件
   eventSource.addEventListener("complete", (event) => {
    eventSource.close();
    handleStop();
    setConnectionStatus("已完成");
   });

   eventSource.onmessage = (event) => {
    setMessages((prev) => [
     ...prev,
     JSON.parse(event.data).content,
    ]);
   };

   eventSource.onerror = (error) => {
    console.error("SSE: 连接错误", error);
    setConnectionStatus("连接断开，等待自动重连");
   };
  };

  connect();
 };

const handleStart = () => {
  startSSEStream();
 };

const handleStop = () => {
  setIsStreaming(false);
  setConnectionStatus("未连接");

if (eventSourceRef.current) {
   eventSourceRef.current.close();
   eventSourceRef.current = null;
  }
 };

 useEffect(() => {
return() => {
   handleStop();
  };
 }, []);

return (
<div className="container">
   <div className="controls">
    <button onClick={handleStart} disabled={isStreaming}>
     {isStreaming ? "正在接收数据..." : "开始流式输出"}
    </button>
    <button onClick={handleStop} disabled={!isStreaming}>
     停止
    </button>
    <span style={{ marginLeft: "10px" }}>
     状态: {connectionStatus}
    </span>
   </div>

   <div
    className="message-container"
    style={{
     color: "#000",
     textAlign: "left",
     whiteSpace: "pre-line",
    }}
   >
    {messages.join("")}
   </div>
  </div>
 );
}

exportdefault App;
```
#### 前端实现要点：

1. 事件处理,需要处理以下三个关键事件：
  
  `onmessage`：接收消息 `onerror`：处理错误 `onopen`：连接建立 其余事件使用`addEventListener`监听
2. 避免内存泄漏： 在请求完成或者组件卸载时，记得调用 `eventSource.close()` 关闭连接。

### 4.3 重连续传的实现

SSE 的自动重连机制是基于 `EventSource` 的自动重连机制实现的，这是一个非常简单的机制，在连接错误断开的情况下，浏览器会自动重新发起请求。和`websocket`不同，在这个过程中，我们并不需要手动介入。

但是重连机制是重新发起请求，所有的数据都会从头开始获取。为了实现续传功能，前后端都需要进行一些额外的处理。 首先需要了解的是，续传功能的核心是`last-event-id`请求头，这个请求头不需要手动指定（也无法手动指定，因为`EventSource`不支持手动设置请求头），这个字段关联的我们在服务端指定的`id:`，它会自动关联为上一次请求中最后一条消息的`id`。

#### 后端实现

```
// ···
const server = http.createServer((req, res) => {
// ···
// 获取 Last-Event-ID
const lastEventId = req.headers["last-event-id"];

// 确定开始发送的消息索引
let messageIndex = lastEventId ? parseInt(lastEventId, 10) : 0;

// 如果 lastEventId 无效或超出范围，从头开始
if (
isNaN(messageIndex) ||
  messageIndex < 0 ||
  messageIndex >= mockResponses.length
 ) {
  messageIndex = 0;
 }
// ···
});
// ···
```
## 5\. EventSource 的缺点

EventSource API 存在很多限制，它允许传递的参数只有 url 和 withCredentials。所以会有以下缺点：

1. 无法传递请求体，所有参数都必须编码在 url 中，而浏览器对 url 的长度有限制(大多在 2000 字符左右)；
2. 无法自定义请求头；
3. 只能使用 GET 请求；
4. 自动重连机制无法手动控制；

## 6\. 使用 fetch 模拟 EventSource

为了解决以上问题，我们可以使用`fetch`来模拟`EventSource`，因为他们本质上都是基于 HTTP 的请求。

```
/**
 * FetchEventSource 类用于模拟原生 EventSource 的功能
 * 由于原生 EventSource 存在一些限制（如不能自定义请求头、不支持POST等），
 * 这里使用 fetch API 来实现相同的功能
 */
class FetchEventSource {
/**
  * @param {string} url - SSE服务器端点URL
  * @param {object} options - fetch请求的配置选项
  */
constructor(url, options = {}) {
this.url = url;
this.options = options;
this.isActive = false;
this.lastEventId = null; // 用于断线重连时的消息追踪
this.eventListeners = newMap(); // 存储不同类型的事件监听器

this.start();
 }

/**
  * 启动SSE连接的核心方法
  * 实现了：
  * 1. 自动重连机制
  * 2. 断点续传（通过lastEventId）
  * 3. 数据流的解析
  */
async start() {
if (this.isActive) return;
this.isActive = true;

// 支持断点续传：如果存在lastEventId，添加到查询参数中
const params = this.lastEventId
   ? { lastEventId: this.lastEventId }
   : {};
const queryString = new URLSearchParams(params).toString();
const requestUrl = queryString
   ? `${this.url}?${queryString}`
   : this.url;

// 触发 open 事件，通知连接已建立
if (this.eventListeners.has("open")) {
   this.eventListeners.get("open").forEach((listener) => listener());
  }

try {
   // 外层循环：处理重连逻辑
   while (this.isActive) {
    const response = await fetch(requestUrl, this.options);

    // 核心部分：使用 ReadableStream 处理数据流
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    // 内层循环：处理数据流的读取
    while (this.isActive) {
     const { value, done } = await reader.read();
     if (done) break;

     // 将二进制数据解码为文本，并处理粘包问题
     buffer += decoder.decode(value, { stream: true });
     const lines = buffer.split("\n");
     buffer = lines.pop() || ""; // 保留最后一个不完整的行

     // 解析每一行数据
     for (const line of lines) {
      this.parseEvent(line.trim());
     }
    }
   }
  } catch (error) {
   console.error("FetchEventSource error:", error);
   this.close();
  }
 }

/**
  * 解析SSE事件数据
  * 支持标准SSE字段：
  * - id: 消息ID
  * - event: 事件类型
  * - data: 消息数据
  */
 parseEvent(line) {
// console.log("line: ", line);
if (!line || line.startsWith(":")) return; // 忽略空行和注释行

const [key, ...rest] = line.split(":");
const value = rest.join(":").trim();

if (key === "id") {
   this.lastEventId = value;
  } elseif (key === "event") {
   this.currentEvent = value;
  } elseif (key === "data") {
   const event = {
    id: this.lastEventId,
    event: this.currentEvent || "message",
    data: value,
   };

   this.dispatchEvent(event);
  }
 }

/**
  * 事件分发处理
  * 支持两种监听方式：
  * 1. addEventListener方式
  * 2. onmessage回调方式
  */
 dispatchEvent(event) {
const eventType = event.event;

// 触发特定事件监听器
if (this.eventListeners.has(eventType)) {
   this.eventListeners
    .get(eventType)
    .forEach((listener) => listener(event));
  }

// 支持传统的onmessage回调
if (eventType === "message" && typeofthis.onmessage === "function") {
   this.onmessage(event);
  }
 }

/**
  * 添加事件监听器
  * 支持监听自定义事件类型
  */
 addEventListener(eventType, listener) {
if (!this.eventListeners.has(eventType)) {
   this.eventListeners.set(eventType, []);
  }
this.eventListeners.get(eventType).push(listener);
 }

/**
  * 关闭SSE连接
  */
 close() {
this.isActive = false;
 }
}

exportdefault FetchEventSource;
```
这段代码中实现了 EventSource 中的几个基本功能。其中最核心的部分是如下内容：

```
const response = await fetch(requestUrl, this.options);

// 使用 ReadableStream 处理数据流
const reader = response.body.getReader();
const decoder = new TextDecoder("utf-8");
let buffer = "";

// 内层循环：处理数据流的读取
while (this.isActive) {
const { value, done } = await reader.read();
if (done) break;

// 将二进制数据解码为文本，并处理粘包问题
 buffer += decoder.decode(value, { stream: true });
const lines = buffer.split("\n");
 buffer = lines.pop() || ""; // 保留最后一个不完整的行

// 解析每一行数据
for (const line of lines) {
this.parseEvent(line.trim());
 }
}
```
后端返回来的是一段不断在输入的`ReadableStream`，我们在前端处理时使用`getReader`和`TextDecoder`来将流数据解码为 UTF-8 格式的文本。 结合 sse 的标准格式，我们可以使用 `split('\n')` 来对数据进行分段。最后将这些数据解析为事件并触发相应的事件监听器，最后将处理后的数据返回给前端。

这里的代码只是一个简单的示例，实际应用中我们一般会使用`@microsoft/fetch-event-source`这个库，它是一个完整的实现，可以自动处理断线重连，支持自定义请求头等等，其原理和我们刚刚的示例代码差别不大。感兴趣的可以继续查看`@microsoft/fetch-event-source`的源码。

## 7\. 总结

SSE 是一种非常轻量级、易用且高效的技术，特别适合在需要 实时数据流 的应用场景中使用。无论是 实时消息推送，还是 实时日志展示，SSE 都能很好地满足需求。希望本文能够帮助大家更好地理解并应用这一技术。

推荐阅读  点击标题可跳转

1、[面试官：如果 100 个请求，你怎么用 Promise 去控制并发？](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623815&idx=2&sn=cb533b7be11d6ca4cfd983afdb259870&scene=21#wechat_redirect)

2、[常被忽视的 Node.js 功能，彻底改善了日志体验](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623789&idx=2&sn=ac04573daaee6ca8ff6399f774435419&scene=21#wechat_redirect)

3、[浅谈 import.meta.env 和 process.env 的区别](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623769&idx=2&sn=c23242a271497304d0d5ff9d361ce275&scene=21#wechat_redirect)
