---
title: "你发现了吗？前端这五个技术快“死”了"
link: "http://mp.weixin.qq.com/s/_0Vu_MUOB-fpcnem9-ndeA"
date: 2026-02-10
md5: 72156719a068c745a3c5298e33b56765
---

# 你发现了吗？前端这五个技术快“死”了

npm官方的一年期下载量对比，赤裸裸道尽了前端技术的更迭真相——市场早已用脚投出了选票。



| 技术 | 一年前日均下载 | 现在日均下载 | 变化 |
| --- | --- | --- | --- |
| create-react-app | 48万 | 7万 | 📉 -85% |
| redux | 380万 | 180万 | 📉 -52% |
| styled-components | 150万 | 65万 | 📉 -57% |
| zustand | 28万 | 120万 | 📈 +328% |
| @tanstack/react-query | 45万 | 180万 | 📈 +300% |


数据从不说谎，当一款技术的下载量暴跌85%，其实就已经在前端生态中宣告“落幕”。

今天就来盘点5个曾风光无限、如今被主流抛弃的前端技术，若你的项目还在主力使用，真的该考虑技术迭代了。

## 1\. Create React App（CRA）：官方亲儿子，终被亲爹放弃

**曾经的辉煌**： 作为React官方出品的脚手架，CRA一度是所有React项目的入门标配。“零配置”“开箱即用”的特性，让无数前端新手跳过繁琐的构建配置，直接上手开发，堪称React生态的“入门神器”。

**被抛弃的原因**：

- 构建速度拉胯，大项目启动耗时动辄30秒以上，开发体验大打折扣
- Webpack配置被深度封装成黑盒，想要自定义配置只能通过eject操作，改造成本极高
- React官方已明确转向，将Next.js、Vite列为推荐方案，CRA被移出核心推荐列表

💡 连亲爹都不再站台的技术，注定会被生态抛弃。

**替代方案**：

```
# 用Vite替代，轻量快速、配置透明
npm create vite@latest my-app -- --template react-ts

# 大型项目直接上Next.js，一站式解决方案
npx create-next-app@latest
```
**现状**：CRA的GitHub仓库长期处于停更状态，官方文档中也已将其从推荐脚手架列表中移除。

## 2\. Redux（作为默认全局状态管理）：过度设计的典型，样板代码拖垮开发

**曾经的辉煌**： “学React必学Redux”，这句话统治前端圈数年。action、reducer、store、dispatch的一套标准化流程，成了很多React项目的“标配操作”，哪怕是仅需局部状态的小项目，也会硬上Redux。

**被抛弃的原因**：

- 实现一个简单功能，需要创建action、reducer等多个配套文件，开发效率极低
- 样板代码冗余，80%的代码都是复制粘贴，毫无实际业务价值
- 绝大多数中小型项目，根本无需全局状态管理，纯属鸡肋式的“杀鸡用牛刀”

💡 Redux本身并非不好，而是被过度滥用，让简单的问题变得复杂。

**替代方案**：

```
// Zustand：3行代码搞定状态管理，极简轻量
import { create } from'zustand'

const useStore = create((set) => ({
count: 0,
inc: () =>set((state) => ({ count: state.count + 1 })),
}))

// Jotai：原子化状态管理，灵活适配各种场景
import { atom, useAtom } from'jotai'
const countAtom = atom(0)
```
**现状**：即便Redux Toolkit对原生Redux做了大量简化，但Zustand、Jotai、Recoil等轻量方案，早已成为开发者的首选，Redux仅在部分老项目和大型项目的特定场景中留存。

## 3\. CSS-in-JS（styled-components/Emotion）：为优雅牺牲性能，终究不切实际

**曾经的辉煌**： “组件与样式同层维护”的理念一度风靡前端圈，styled-components更是成了React生态的样式标配，就连Ant Design这类主流UI库也曾采用，被认为是“优雅的样式工程化解法”。

**被抛弃的原因**：

- 运行时动态生成样式，会产生明显的性能开销，直接影响用户体验
- 在SSR服务端渲染场景下，易出现样式闪烁、兼容异常等问题
- 调试时无法看到语义化类名，页面元素全是随机字符串类名，排障难度陡增

💡 开发的优雅，不能以牺牲用户体验和调试效率为代价，这是技术选型的核心底线。

**替代方案**：

```
<!-- Tailwind CSS：零运行时，极致性能，原子化样式开箱即用 -->
<button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
  按钮
</button>

<!-- CSS Modules：经典方案，样式隔离，无额外性能开销 -->
import styles from './Button.module.css'
<button className={styles.primary}>按钮</button>
```
**现状**：Tailwind CSS已成前端样式领域的事实标准，styled-components的GitHub仓库更新频率大幅下降，社区热度也持续走低，仅在少数老项目中被使用。

## 4\. 微前端（针对大多数公司）：大厂专属架构，中小团队的“架构癌症”

**曾经的辉煌**： “大厂都在做微前端”成了前端圈的“政治正确”，qiankun、single-spa、Module Federation等方案层出不穷，仿佛项目不做微前端，架构就跟不上潮流。

**被抛弃的原因**：

- 维护成本居高不下，是普通项目的3倍以上，人力和时间成本大幅增加
- 陷入调试地狱，子应用之间的样式冲突、状态隔离、跨应用通信，各类问题层出不穷
- 95%的公司实际业务场景中，根本无需微前端架构，纯粹是“为了架构而架构”

💡 微前端是大厂为了解决“团队多、项目杂、独立部署”的专属方案，中小团队盲目跟风，只会自讨苦吃。

**替代方案**： 先问自己3个核心问题，再决定是否使用：

1. 团队人数是否超过50人？
2. 项目是否需要多团队独立开发、独立部署？
3. 公司能否承受3倍于普通项目的维护成本？

如果答案都是“否”，老老实实用Monorepo即可，成熟方案任选：

- pnpm workspace：轻量易用，适合中小型项目
- Turborepo：构建提速，适合多包管理的大型项目

**现状**：微前端仅在大厂的特定业务场景中留存，越来越多的公司开始回归Monorepo，“简单够用就是最好的架构”重新成为行业共识。

## 5\. 手写API层：重复造轮子，被标准化方案全面替代

**曾经的辉煌**： 几乎每个前端项目，都会有一个专属的`api/`文件夹，里面全是开发者手写的fetch/axios封装，成了前端项目的“标配操作”。

```
// 曾经的手写API调用
export const getUsers = async () => {
  const res = await fetch('/api/users')
  return res.json()
}
```
**被抛弃的原因**：

- 异步请求的loading/error状态需要手动管理，逻辑繁琐且易出错
- 接口数据的缓存、刷新、失效，需要自己实现，重复造轮子
- 前后端类型完全脱节，毫无类型安全可言，接口字段报错屡见不鲜

💡 开发的核心是解决业务问题，能被自动化、标准化的基础功能，根本无需手写。

**替代方案**：

```
// React Query（TanStack Query）：缓存+状态+错误处理一站式解决
import { useQuery } from '@tanstack/react-query'

const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: () => fetch('/api/users').then(res => res.json())
})

// tRPC：端到端类型安全，无需手动定义接口类型，自动推导
const users = trpc.user.getAll.useQuery()
```
**现状**：TanStack Query已成前端数据获取的事实标准，tRPC则在全栈项目中快速普及，手写API层的场景越来越少，仅在一些极简的小项目中偶尔出现。

## 下一个会被抛弃的前端技术？我的预测

结合当前前端生态的发展趋势，这几个技术大概率会逐步凉透，而这几个则会持续坚挺：

### 可能会凉的技术

1. Webpack：被Vite、Turbopack等新一代构建工具替代，构建速度和开发体验差距悬殊
2. 传统REST API：被GraphQL、tRPC替代，前者按需获取数据，后者实现端到端类型安全
3. 手写表单验证：被React Hook Form + Zod替代，自动化校验+类型安全，效率翻倍

### 暂时安全的技术

1. TypeScript：生态持续强化，已成前端开发的基础标配，无替代方案
2. Next.js：尽管App Router争议不断，但生态壁垒已成，是React服务端渲染的事实标准
3. Tailwind CSS：样式领域的事实标准，生态完善，适配所有前端框架
