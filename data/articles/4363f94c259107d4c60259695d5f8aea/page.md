---
title: "只需几行代码！Vue和React终于可以一起使用了！"
link: "http://mp.weixin.qq.com/s/Mp_WQBo6PUjrwuBxZkXbOg"
date: 2026-02-05
md5: 4363f94c259107d4c60259695d5f8aea
---

# 只需几行代码！Vue和React终于可以一起使用了！

Veaury是一款**基于 Vue 和 React 构建的跨框架工具库**，专为前端开发者解决 Vue/React 技术栈的融合与迁移问题，无需改造现有组件即可实现跨框架复用。

![图片](./images/fa731e2f371cefe3c8f9a766f96d0a43.png) 

## 核心特性

- 🌞 原生支持 Vue3（历史版本完美兼容 Vue2 与 React 互用）
- 🌈 跨框架上下文共享——Vue/React 组件可互通框架上下文
- 💗 跨框架 Hooks 调用——Vue 组件中用 React Hooks，Reac- 组件中可写 Vue setup 并使用 Vue Hooks
- 🪂 纯净模式——转换后的组件无额外外层容器，避免 DOM 结构冗余、样式污染
- ⚙️ 无侵入式集成——无需大幅改造项目配置，兼容 Webpack/Vite/SSR 环境

## 快速安装

地址：https://github.com/gloriasoft/veaury?tab=readme-ov-file

支持 yarn/npmp 一键安装，无额外前置依赖：

```
# yarn 安装
yarn add veaury
# npm 安装
npm i veaury -S
```
## 项目基础配置

**核心原则**：仅复用已构建的 npm 跨框架组件（无 .vue/JSX 源码），无需额外配置；若项目中同时开发 Vue/React（源码含 .vue+JSX），需做简单构建工具配置。

### Webpack

Vue CLI 项目配置 React、create-react-app 项目配置 Vue，直接参考官方对应配置文档即可，无复杂自定义。

### Vite（主流推荐，核心配置精简）

先安装依赖插件：`npm i @vitejs/plugin-react @vitejs/plugin-vue @vitejs/plugin-vue-jsx -D`

#### 主项目为 Vue

```
import { defineConfig } from'vite'
import veauryVitePlugins from'veaury/vite/index.js'

exportdefault defineConfig({
plugins: [
    // 关闭原生 vue/vueJsx 插件，使用 veaury 统一解析
    veauryVitePlugins({
      type: 'vue', // 主框架为Vue
      // 可按需配置各插件原生参数：vueOptions/reactOptions/vueJsxOptions
    })
  ]
})
```
#### 主项目为 React

```
import { defineConfig } from 'vite'
import veauryVitePlugins from 'veaury/vite/index.js'

export default defineConfig({
  plugins: [
    // 关闭原生 react 插件
    veauryVitePlugins({
      type: 'react', // 主框架为React
    })
  ]
})
```
#### 自定义 JSX 解析范围（可选）

将 `type` 设为 `custom`，通过 `vueJsxInclude/vueJsxExclude` 指定解析规则，其余文件自动按 React JSX 解析。

## SSR 项目兼容

Veaury 完美支持 Next.js/Nuxt.js 等 SSR 框架，**仅需将转换后的组件标记为客户端组件**，即可在 Next.js 中创建 .vue 文件、在 Nuxt.js 中创建 React JSX 文件，核心用法与客户端项目一致。

## 核心使用方法（最常用场景，精简核心代码）

Veaury 核心通过**高阶组件（HOC）** 实现组件跨框架转换，纯净模式的 `applyPureXXX` 系列 API 为**推荐首选**（无额外容器）。

### 1\. 基础互用

#### React 中使用 Vue 组件

```
import { applyVueInReact, applyPureVueInReact } from'veaury'
import MyVueComp from'./MyVueComp.vue'// 原生Vue组件
import { useState } from'react'

// 转换为React组件（普通模式/纯净模式）
const VueCompInReact = applyVueInReact(MyVueComp)
const PureVueCompInReact = applyPureVueInReact(MyVueComp)

// 像普通React组件一样使用，props直接传递
exportdefault () => {
const [msg] = useState('Hello Veaury')
return<PureVueCompInReact foo={msg}>默认插槽内容</PureVueCompInReact>
}
```
#### Vue 中使用 React 组件

**注意**：react-dom ≥19 需全局配置 `createRoot`，仅需配置一次；推荐使用 `applyPureReactInVue`。

```
// 入口文件全局配置（react-dom ≥19 必加）
import { createRoot } from 'react-dom/client'
import { setVeauryOptions } from 'veaury'
setVeauryOptions({ react: { createRoot } })
```
```
<template>
  <!-- 像普通Vue组件一样使用，props/插槽正常传递 -->
  <MyReactComp :foo="msg">默认插槽内容</MyReactComp>
</template>

<script setup>
import { applyPureReactInVue } from 'veaury'
import MyReactComp from './react_app/MyReactComp.jsx' // 原生React组件
import { ref } from 'vue'

// 转换为Vue组件（纯净模式）
const MyReactCompInVue = applyPureReactInVue(MyReactComp)
const msg = ref('Hello Veaury')
</script>
```
### 2\. 跨框架事件传递

**核心规则**：Vue 组件通过 `$emit` 触发事件，React 中直接传回调 props；React 组件通过 `props.xxx()` 触发事件，Vue 中用 `@xxx` 监听。

#### Vue 组件在 React 中触发事件

```
// Vue组件内：$emit('click', '参数')
// React中使用：
<PureVueCompInReact onClick={(val) => console.log('触发Vue事件：', val)} />
```
#### React 组件在 Vue 中触发事件

```
// React组件内：props.onClick('参数')
// Vue中使用：
<MyReactCompInVue @click="(val) => console.log('触发React事件：', val)" />
```
### 3\. 插槽/渲染属性互用（跨框架核心难点）

**核心映射规则**：Vue 具名/作用域插槽 ↔ React 渲染属性（render props）；Vue 默认插槽 ↔ React `props.children`；Vue 前缀 `node:` 的具名插槽 ↔ React 原生节点。

#### React 中使用 Vue 插槽

```
const vSlots = {
  slot1: <div>具名插槽</div>, // 对应Vue <slot name="slot1" />
  slot2: ({ val }) => <div>作用域插槽，接收值：{val}</div>, // 对应Vue <slot name="slot2" :val="xxx" />
  default: <div>默认插槽</div>
}
// 传递插槽
<PureVueCompInReact v-slots={vSlots} />
```
#### Vue 中使用 React 渲染属性

```
<MyReactCompInVue>
  <!-- 对应React props.slot1() -->
  <template v-slot:slot1>渲染属性1</template>
  <!-- 对应React props.slot2(xxx)，接收React传递的参数 -->
  <template v-slot:slot2="val">渲染属性2，接收值：{{val}}</template>
  <!-- 对应React props.slot3（原生节点），前缀node: -->
  <template v-slot:node:slot3>React原生节点</template>
</MyReactCompInVue>
```
### 4\. 双向绑定注意事项

使用纯净模式转换 React 表单组件做双向绑定时，可能出现**值频繁修改更新不及时**的问题，通过 `injectSyncUpdateForPureReactInVue` 全局注入一次即可解决：

```
<template>
  <MyReactInput :value="msg" @change="msg = $event.target.value" />
</template>

<script setup>
import { applyPureReactInVue, injectSyncUpdateForPureReactInVue } from 'veaury'
import MyReactInput from './react_app/Input.jsx'
import { ref } from 'vue'

// 全局仅需注入一次，指定更新钩子
injectSyncUpdateForPureReactInVue(MyReactInput, {
  onChange(args) { return { value: args.target.value } }
})
const MyReactInputInVue = applyPureReactInVue(MyReactInput)
const msg = ref('')
</script>
```
### 5\. 跨框架获取组件实例

转换后的组件可通过专属属性获取**原框架组件真实实例**，用于调用组件内部方法/获取属性：

#### Vue 中获取 React 组件实例

```
<template>
  <MyReactComp ref="reactRef" />
</template>
<script setup>
import { ref, onMounted } from 'vue'
const reactRef = ref(null)
onMounted(() => {
  // 通过 __veauryReactRef__ 获取React真实实例
  console.log(reactRef.value.__veauryReactRef__)
})
</script>
```
#### React 中获取 Vue 组件实例

```
import { createRef, useEffect } from 'react'
const vueRef = createRef(null)
useEffect(() => {
  // 通过 __veauryVueRef__ 获取Vue真实实例
  console.log(vueRef.current.__veauryVueRef__)
}, [])
return <PureVueCompInReact ref={vueRef} />
```
### 6\. 跨框架懒加载（性能优化）

支持异步加载跨框架组件，与原框架懒加载用法一致，推荐使用纯净模式系列 API：

#### Vue 中懒加载 React 组件

```
<script setup>
import { lazyPureReactInVue } from 'veaury'
// 懒加载React组件，支持defineAsyncComponent原生参数
const MyReactComp = lazyPureReactInVue(() => import('./react_app/MyReactComp.jsx'))
</script>
```
#### React 中懒加载 Vue 组件

```
import { lazyPureVueInReact } from 'veaury'
// 懒加载Vue组件
const MyVueComp = lazyPureVueInReact(() => import('./MyVueComp.vue'))
```
### 总结

Veaury 作为前端跨框架工具库，核心价值是**无侵入式实现 Vue/React 技术栈融合**，无需改造现有组件和项目核心配置，通过简单的 API 即可实现跨框架组件复用、互迁，同时解决了事件、插槽、上下文、Hooks 等跨框架核心痛点，兼容主流构建工具和 SSR 环境，是前端项目技术栈融合、迁移的高效解决方案。

## 结语

我是林三心，一个待过**小型toG型外包公司、大型外包公司、小公司、潜力型创业公司、大公司**的作死型前端选手

我建了一些**前端学习群**，如果大家想进群交流前端知识，可以关注我，回复**加群**

![图片](./images/e91fb1f23e19c80e44012a0dbb56108a.webp)
