---
title: "【第3657期】Visual Agentic Dev：让前端开发工程师告别繁琐的代码修改流程"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278606&idx=1&sn=f1ef8cbb6ce6ecd37d06843f7799ae4b&chksm=bc95f3cd4ca1b7276db8fb4d258f47cd2574e070b9f2c6ff4df21ce5e8d208a13acb0dc0c3c1&scene=0#rd"
date: 2026-02-25
md5: 892485f5dad06929ddf848563c631bbd
---

# 【第3657期】Visual Agentic Dev：让前端开发工程师告别繁琐的代码修改流程

前言

介绍了一种名为 Visual Agentic Dev 的新开发范式，旨在通过连接 Chrome 浏览器和本地开发环境，解决传统 AI 编程工具中存在的 “上下文切换成本” 问题，提升前端开发效率。今日前端早读课文章由 @Brucetooo 投稿分享。

正文从这开始～～

大家在用现在的 AI 编程工具（比如 Claude Code CLI, Cursor, Windsurf）时，有没有遇到这样的痛点：

你看着浏览器里的页面，发现一个样式有问题，或者想改一个文案（简单），甚至复杂的需求开发  
你都需要：

- 切换到编辑器。
- 搜索文案或组件名，找到对应的文件。
- 定位到具体的代码行。
- 复制代码上下文，或者把文件路径告诉 AI：“帮我改一下这里”。

这个过程频繁打断思路，被称为 “Context Switching Cost”。

既然浏览器是渲染结果的地方，为什么不能直接在浏览器里点击那个组件，告诉 AI：“把这个颜色改深一点”，然后 AI 直接去修改本地代码呢？

#### Visual Agentic Dev 是什么？

Visual Agentic Dev 正是为解决这个问题而生的开源工具。它连接了 Chrome 浏览器和你的本地开发环境。

🔗 visual-agentic-dev Github：https://github.com/brucetoo/visual-agentic-dev

##### 👉 核心功能：

- 🎯 零配置源码定位：利用 React Fiber 自动识别源码位置，无需在业务代码中插入冗余属性。
- 📂 多项目并行开发：自动识别当前 Tab 所属项目，并智能切换到对应的终端会话。
- 🤖 动态 Agent 注册体系：可扩展架构支持多种 AI Agent（如 Claude Code, CCR 等），具备动态就绪检测能力。
- 🖱️ 批量元素修改：支持选中多个页面元素并发送给 Agent 进行批量修改。
- ⌨️ 便捷快捷键：仅需 Cmd + Shift + S (Mac) 或 Ctrl + Shift + S (Windows/Linux) 即可快速访问。
- 🛠 内置终端集成：深度集成的终端，具备会话持久化、历史记录恢复及智能上下文切换功能。  
  🧐 所见即所得：你对 AI 说出的指令，AI 修改完代码后，页面自动热更新，立即看到效果。

#### 效果演示

示例任务描述：add one more todo item, not done state, task name is "hey it's new one", clike this new item show dialog and say "you click me"

![图片](./images/bbb09c6b76e2f39f7ef7db3328708f5a.gif)

点击页面上的 Todo Item，侧边栏直接弹出 AI 对话框，输入指令后，本地代码自动更新

#### 技术实现原理

这个项目主要包含三个部分：

##### 1、Chrome Extension (前端)

负责在页面上注入遮罩层，捕获用户的点击事件。最关键的技术点是 React Fiber 遍历。我们通过查找 DOM 节点对应的 \_\_reactFiber$ 属性，向上追溯找到对应的组件源文件路径 (\_source)。这意味着你不需要在编译时做复杂的 AST 注入，只要是 React Dev Mode 运行的项目，大概率都能直接支持。

##### 2、Bridge Server (ws 服务)

一个运行在本地的 WebSocket 服务端。它像一座桥梁，一端连接 Chrome Extension，另一端连接本地的 Shell 会话。它负责把浏览器里选中的文件路径、代码片段发送给 Agent，同时也把 Agent 在终端的输出实时流式传输回浏览器。

##### 3、Agent Integration (Agent)

我们设计了一个 AgentRegistry，可以适配各种终端 AI 工具。目前完美支持 Claude Code。当你在浏览器选中组件时，工具会自动把组件的代码上下文以 Prompt 的形式喂给 Agent，让 AI 能够基于精准的上下文进行修改。

#### 为什么做这个？

现在的 AI 编码工具很强，但它们大多还是 “编辑器中心” 的。而前端开发的很多时间其实花在浏览器里 “看效果”。

Visual Agentic Dev 的愿景是打造一个以视觉为中心 (Visual-First) 的开发流。让 AI 不仅仅是在代码库里游走，而是能 “看到” 你指出的 UI 元素，真正像一个坐在你旁边的结对编程伙伴。

#### 快速开始

安装只需两步：

##### 1、启动 Bridge Server:

```
 npm install -g @visual-agentic-dev/bridge-server
 vdev-server
```
##### 2、项目接入 React Devtools:

```
 npm install @visual-agentic-dev/react-devtools
```
关于本文  
作者：Brucetooo  
原文：https://juejin.cn/post/7605114266023624755

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
