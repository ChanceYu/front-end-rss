---
title: "v-model 淘汰！ Vue3 新玩法代码量减少 60%！"
link: "http://mp.weixin.qq.com/s?__biz=Mzg2NjY2NTcyNg==&mid=2247508687&idx=1&sn=1bc02b0bb9179310c90507c7544b4ea0&chksm=ce45b75ef9323e486a499cf929ec10cf18bf4c4b5682994f1c6dd5d1184986f2f540cfaf1e5b#rd"
date: 2026-02-04
md5: 8c0454e0cb7bc615df3ec95a469ee8c9
---

# v-model 淘汰！ Vue3 新玩法代码量减少 60%！

“为啥我写的v-model又不灵了？”

别笑，这可能是你团队里天天上演的对话。

Vue3.4早在2023年12月就把`defineModel`转正，可直到现在，还有人抱着Vue2的老套路不放——手写props+emit实现双向绑定，代码又长又臭，bug层出不穷。

## defineModel到底是个啥？

一句话说透：让子组件像原生`<input>`一样直接支持v-model的**编译期宏**。

它不是函数，而是语法糖——编译阶段直接展开成`props + emit`，**运行时零额外开销**。

划重点：

1. 无需import，天生自带；
2. 仅限`<script setup>`使用，普通`.js/.ts`文件不兼容。

**编译前后对比**

```
// 你写的代码
const model = defineModel<string>({ default: 'hello' })

// 编译后伪代码
const props = defineProps({
  modelValue: { type: String, default: 'hello' }
})
const emit = defineEmits(['update:modelValue'])
const model = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val)
})
```
## 3个例子，包教包会defineModel

所有示例基于`<script setup>`，复制即用。

### 1\. 单v-model：90%场景的最优解

**父组件**

```
<template>
  <UserName v-model="name" />
  <p>父组件值：{{ name }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UserName from './UserName.vue'

const name = ref('张三')
</script>
```
**子组件 UserName.vue**

```
<template>
  <input v-model="modelValue" />
</template>

<script setup lang="ts">
const modelValue = defineModel<string>() // 等价于{ required: true }
</script>
```
### 2\. 多v-model：表单组件刚需

**父组件**

```
<template>
  <UserForm v-model:name="form.name" v-model:age="form.age" v-model:phone="form.phone" />
  <pre>{{ form }}</pre>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import UserForm from './UserForm.vue'

const form = reactive({ name: '张三', age: 18, phone: '13800138000' })
</script>
```
**子组件 UserForm.vue**

```
<template>
  <input v-model="name" placeholder="姓名" />
  <input v-model="age" placeholder="年龄" />
  <input v-model="phone" placeholder="手机号" />
</template>

<script setup lang="ts">
const name = defineModel<string>('name')
const age = defineModel<number>('age')
const phone = defineModel<string>('phone')
</script>
```
### 3\. 修饰符+转换器：告别手动.trim

**父组件**

```
<template>
  <TrimInput v-model.trim="keyword" />
  <p>父组件值：{{ keyword }}</p>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TrimInput from './TrimInput.vue'

const keyword = ref('')
</script>
```
**子组件 TrimInput.vue**

```
<template>
  <input v-model="modelValue" />
</template>

<script setup lang="ts">
const [modelValue, modifiers] = defineModel<string, 'trim'>({
  set(val) {
    return modifiers.trim ? val.trim() : val
  }
})
</script>
```
## TypeScript高阶用法速查表



| 需求场景 | 写法示例 |
| --- | --- |
| 必填项 | defineModel<string>({ required: true }) |
| 可选+默认值 | defineModel<string>({ default: '张三' }) |
| 联合类型 | `defineModel<'male' |
| 复杂对象 | defineModel<User>() |
| 对象/数组默认值 | defineModel<string[]>({ default: () => ['A', 'B'] }) |


> 注意：对象/数组默认值必须用函数返回，避免引用共享。

## 最后一句

Vue3.6都要来了，别再抱着老黄历写代码！

## 结语

我是林三心，一个待过**小型toG型外包公司、大型外包公司、小公司、潜力型创业公司、大公司**的作死型前端选手

我建了一些**前端学习群**，如果大家想进群交流前端知识，可以关注我，回复**加群**

**![图片](./images/e91fb1f23e19c80e44012a0dbb56108a.webp)**
