---
title: "Pinia 超进化！从此不需要 Axios！"
link: "http://mp.weixin.qq.com/s?__biz=Mzg2NjY2NTcyNg==&mid=2247508754&idx=1&sn=14e7a5bfc29c7be4eb24f07ea07fe70c&chksm=ce45b683f9323f9527c4b6d3ff6ab2b4ea353b3f1878b42aaea38d5669059383d7c5fda30185#rd"
date: 2026-02-11
md5: 250c96f64aa17bf872fd43cc05ac7a2b
---

# Pinia 超进化！从此不需要 Axios！

### Pinia Colada

Pinia Colada 让 Vue 应用中的数据请求变得轻而易举。它构建于 Pinia 之上，彻底消除了数据请求带来的所有复杂度与样板代码。它具备完整的类型支持、可摇树优化，并且遵循与 Pinia 和 Vue 一致的设计理念：简单易上手、灵活可扩展、功能强大，还能实现渐进式接入。

![图片](./images/382ef43243fd475181812f25d7a5cbad.png)

### 核心特性

- ⚡️ 自动缓存：智能客户端缓存，自带请求去重能力
- 🗄️ 异步状态：简化异步状态管理逻辑
- 🔌 插件系统：功能强大的插件扩展体系
- ✨ 乐观更新：服务端响应返回前即可更新 UI
- 💡 合理默认配置：开箱即用，同时保持全量可配置性
- 🧩 内置插件：自动重新请求、加载延迟等功能一键启用
- 📚 类型脚本支持：业界领先的 TypeScript 类型体验
- 💨 极小包体积：基础核心仅约 2kb，且完全支持摇树优化
- 📦 零外部依赖：除 Pinia 外无任何第三方依赖
- ⚙️ 服务端渲染（SSR）：原生支持服务端渲染

> 📝 注意：Pinia Colada 始终致力于持续改进和演进。我们非常欢迎大家针对现有功能或新功能方向提供反馈！同时也高度赞赏对文档、Issue、PR（代码合并请求）的贡献。

### 安装

```
npm install pinia @pinia/colada
```
安装你所需功能对应的插件：

```
import { createPinia } from 'pinia'
import { PiniaColada } from '@pinia/colada'

app.use(createPinia())
// 需在 Pinia 之后安装
app.use(PiniaColada, {
  // 可选配置项
})
```
### 使用方式

Pinia Colada 的核心是 `useQuery` 和 `useMutation` 两个函数，分别用于数据查询和数据写入。以下是简单示例：

```
<script lang="ts" setup>
import { useRoute } from 'vue-router'
import { useMutation, useQuery, useQueryCache } from '@pinia/colada'
import { patchContact, getContactById } from '~/api/contacts'

const route = useRoute()
const queryCache = useQueryCache()

// 数据查询
const { data: contact, isPending } = useQuery({
  // 缓存中该查询的唯一标识
  key: () => ['contacts', route.params.id],
  // 实际执行的查询逻辑
  query: () => getContactById(route.params.id),
})

// 数据变更
const { mutate: updateContact, isLoading } = useMutation({
  // 实际执行的变更逻辑
  mutation: patchContact,
  async onSettled({ id }) {
    // 使上述查询失效，触发数据重新请求
    await queryCache.invalidateQueries({ key: ['contacts', id], exact: true })
  },
})
</script>

<template>
  <section>
    <p v-if="isPending">加载中...</p>
    <ContactCard
      v-else
      :key="contact.id"
      :contact="contact"
      :is-updating="isLoading"
      @update:contact="updateContact"
    />
  </section>
</template>
```
想了解更多核心概念及使用方式，请查阅官方文档。

> https://pinia-colada.esm.dev/
