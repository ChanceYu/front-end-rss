---
title: "Vue3.5 重磅级新特性！会取代 Ref 吗？"
link: "http://mp.weixin.qq.com/s?__biz=Mzg2NjY2NTcyNg==&mid=2247506802&idx=1&sn=e41e86dd6e9cf5b74e1bedeb1845b249&chksm=ce45cee3f93247f57cda82203fc84375112cf399e3974441205bfe2a2fa84ecb933122782d3d#rd"
date: 2025-12-05
md5: 8158b28a29cfbacc6ab220a2550386c6
---

# Vue3.5 重磅级新特性！会取代 Ref 吗？

## 前言

> 我建了 **5000人前端学习群**，群内分享**前端知识/Vue/React/Nodejs/全栈**，关注我，回复**加群**，即可加入~ 

## 那些年，我们一起追的 ref

在 Vue 3.0 到 3.4 版本中，模板引用功能一直存在几个令人困扰的问题：



| 痛点场景 | 具体问题 | 影响 |
| --- | --- | --- |
| 命名强耦合 | 模板中 ref="foo" 必须对应脚本中的 const foo = ref(null)，一个字母都不能错 | 一处修改，处处同步，容易出错 |
| 类型推断缺失 | 默认类型为 any，无法自动推断出具体的 HTML 元素类型 | IDE 智能提示失效，开发体验差 |
| 动态引用困难 | 在 v-for 循环中使用 :ref="el-${index}" 后，脚本中难以获取对应引用 | 需要复杂的手动管理 |
| 逻辑复用障碍 | 想在 useFocus() 等组合式函数中封装 ref 逻辑时，必须预先知道变量名 | 封装性差，代码耦合度高 |


Vue 3.5 版本悄然引入了一个新的 API——\*\*`useTemplateRef`\*\*。本文将带你全面了解这一新特性，帮助你从“痛苦调试”转向“愉悦编码”。

## 回顾传统：我们曾经如何管理模板引用

### 基础 ref 使用模式

```
<template>
  <input ref="username" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 变量名必须与模板中的 ref 值保持完全一致
const username = ref<HTMLInputElement | null>(null)

onMounted(() => {
  // 类型安全完全依赖可选链操作符
  username.value?.focus()
})
</script>
```
**存在的问题：**

- **同步成本高**：模板中的 ref 名称修改后，必须手动更新脚本中的变量名
- **类型安全弱**：如果不显式指定 `<HTMLInputElement | null>` 类型，默认为 `any`，失去类型检查

### v-for 中的动态引用困境

```
<template>
  <div v-for="(item, i) in list" :key="i">
    <input :ref="`input-${i}`" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 官方文档明确不推荐在 <script setup> 中使用动态 ref
// 开发者需要寻找替代方案
</script>
```
面对这种情况，开发者通常需要回归到手动维护引用映射表的方式，增加了代码复杂度。

## Vue 3.5 革新：useTemplateRef 深度解析

### API 设计概览

```
function useTemplateRef<T = Element>(
  key: string
): Readonly<Ref<T | null>>
```
**核心特性：**

- **参数**：接收模板中 ref 属性使用的字符串键名
- **返回值**：返回一个只读的 Ref 对象，类型可自动推断
- **优势**：可以在任何组合式函数中调用，完全解耦了模板与脚本的变量命名

### 基础应用示例

```
<template>
  <input ref="username" />
</template>

<script setup lang="ts">
import { useTemplateRef, onMounted } from 'vue'

// 变量名可以自由定义，不再受模板约束
const inputEl = useTemplateRef('username')

onMounted(() => {
  inputEl.value?.focus() // 完整的类型提示和智能补全
})
</script>
```
**改进亮点：**

- 模板中的 `ref="username"` 定义保持不变
- 脚本中可以自由命名变量（如 `inputEl`、`el`、`foo` 等）
- IDE 能够准确识别元素类型为 `HTMLInputElement`

## 实战对比：三大典型应用场景

### 场景一：表单元素自动聚焦



| 对比维度 | 传统写法 | useTemplateRef 写法 |
| --- | --- | --- |
| 变量声明 | const username = ref<HTMLInputElement \| null>(null) | const username = useTemplateRef('username') |
| 命名约束 | 必须与模板 ref 值完全一致 | 完全自由，零耦合 |
| 类型支持 | 需要手动编写完整类型 | 自动推断，精准提示 |


### 场景二：动态列表中的元素操作

```
<template>
  <div v-for="(item, index) in items" :key="index">
    <input :ref="`input-${index}`" />
    <button @click="focus(index)">聚焦</button>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from 'vue'

const focus = (index: number) => {
  const el = useTemplateRef<HTMLInputElement>(`input-${index}`)
  el.value?.focus()
}
</script>
```
**对比分析：**

- **传统方式**：需要手动维护 `Map<string, Element>` 结构，在渲染函数中赋值管理
- **新方式**：通过 `useTemplateRef` 直接按名称获取，即使处理上万条数据也游刃有余

### 场景三：逻辑抽象与复用

**封装为组合式函数：**

```
// hooks/useFocus.ts
import { useTemplateRef, nextTick } from 'vue'

export function useFocus(refKey: string) {
  const target = useTemplateRef<HTMLInputElement>(refKey)

  const focus = () => nextTick(() => target.value?.focus())

  return { focus }
}
```
**在组件中使用：**

```
<template>
  <input ref="email" />
  <button @click="focus">聚焦邮箱输入框</button>
</template>

<script setup lang="ts">
import { useFocus } from '@/hooks/useFocus'

const { focus } = useFocus('email')
</script>
```
**架构优势：**

- **传统限制**：ref 必须在组件作用域内声明，组合式函数无法预知变量名
- **新方案优势**：`useTemplateRef` 基于运行时键名查找，实现逻辑与命名的完全解耦

## 性能解析：为何如此高效？

Vue 3.5 在编译阶段会将模板中的静态 ref 收集到专门的引用队列中。`useTemplateRef(key)` 本质上是从这个预先生成的队列中读取对应的虚拟节点引用，这个过程不会触发额外的依赖收集，性能表现接近原生操作。

## 版本要求与兼容性



| 项目 | 要求 | 说明 |
| --- | --- | --- |
| Vue 版本 | ≥ 3.5.0 | 该版本于 2024 年 9 月发布 |
| 开发工具 | Volar / VSCode 插件 ≥ 2.1.0 | 确保获得完整的类型提示支持 |
| 迁移策略 | 完全向后兼容 | 支持渐进式替换，无破坏性变更 |


## 结语

我是林三心，一个待过**小型toG型外包公司、大型外包公司、小公司、潜力型创业公司、大公司**的作死型前端选手

我建了一些**前端学习群**，如果大家想进群交流前端知识，可以关注我，回复**加群**

![图片](./images/e91fb1f23e19c80e44012a0dbb56108a.webp)
