---
title: "【第3644期】构建类型安全的复合组件：让灵活与安全兼得的最佳实践"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278480&idx=1&sn=e8e4caef1b2b3253b6922cd7cd30e483&chksm=bc6e71e5b890a9047670d7455687099643d3800e442ab46f22542f0e2a066c89cd91e07c99e2&scene=0#rd"
date: 2026-01-20
md5: d05d403eb82ee3e168922cd10cc162ec
---

# 【第3644期】构建类型安全的复合组件：让灵活与安全兼得的最佳实践

前言

深入探讨了复合组件在前端设计系统中的应用场景与局限，并介绍了一种通过 “组件工厂模式” 实现类型安全的实用方案，让组件既灵活又稳健。今日前端早读课文章由 @TkDodo 分享，@飘飘编译。

译文从这开始～～

我认为在构建组件库时，“复合组件（compound components）” 是一种非常出色的设计模式。它能让组件的使用者在组合组件时拥有更高的灵活性，而不必把所有变体都塞进一个拥有大量 props 的单一 API 中。此外，它还能让组件之间的层级关系在标记结构中更加清晰。

[【早阅】深入理解 Web Components：如何利用自定义元素和 Shadow DOM 打造可复用表单组件？](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278080&idx=1&sn=8c662524c3c1d64fff6d988898dbe8bd&scene=21#wechat_redirect)

当然，这并不意味着复合组件在任何情况下都是最优选择。有时候，直接用 props 来实现会更合适。

#### 一个不太好的例子

我们经常看到用复合组件来实现的例子，比如一个带有多个选项（Options）的下拉选择框（Select）。之所以常见，是因为这种结构和原生 HTML 的 Select 用法很相似。

```
 import { Select, Option } from '@/components/select'

 function ThemeSwitcher({ value, onChange }) {
   return (
     <Select value={value} onChange={onChange}>
       <Option value="system">🤖</Option>
       <Option value="light">☀️</Option>
       <Option value="dark">🌑</Option>
     </Select>
   )
 }
```
我认为这个例子并不能很好地体现复合组件的优势，主要有两个原因：

##### 1\. 固定布局

复合组件最大的优势在于 —— 它允许使用者灵活地排列子组件的布局。但对于 Select 组件来说，我们几乎不需要这种灵活性。选项都会放在菜单里，按顺序一个接一个显示即可。

正因为如此，很多人希望能在类型层面限制传入的子组件 —— 例如，只允许 `Option` 被传入 `Select`。不过，这目前在类型系统中还做不到（相关 issue 从 2018 年就开着），而且我认为这种限制也没必要。

如果你的目标是限制子组件类型，那么复合组件可能根本就不是合适的抽象方式。

##### 2\. 动态内容

复合组件非常适合用于 “内容相对固定” 的场景。上面的例子中确实是写死了三个选项，看起来似乎没问题。

但在真实项目中，我们几乎不会有只有三个选项的下拉框。更多时候，选项数据来自 API 调用，结果是动态的。同时，大多数设计规范也会建议：当选项少于 5 个时，不应使用下拉框，因为那会增加用户点击次数和认知负担。

以 Adverity 的实践为例，我们一开始也是用复合组件来实现 Select，但后来在大多数使用场景中不得不写出类似这样的映射代码：

```
 import { Select, Option } from '@/components/select'

 function UserSelect({ value, onChange }) {
   const userQuery = useSuspenseQuery(userOptions)

   return (
     <Select value={value} onChange={onChange}>
       {userQuery.data.map((option) => (
         <Option value={option.value}>{option.label}</Option>
       ))}
     </Select>
   )
 }
```
写久了，我们发现这种映射非常繁琐，于是改成了使用 props 的形式：

```
 import { Select } from '@/components/select'

 function UserSelect({ value, onChange }) {
   const userQuery = useSuspenseQuery(userOptions)

   return (
     <Select
       value={value}
       onChange={onChange}
       options={userQuery.data}
     />
   )
 }
```
这种方式不仅让我们摆脱了重复的映射代码，还带来了更好的类型安全性，因为不再需要去限制子组件类型。同时，我们还可以轻松让 Select 成为一个泛型组件，确保 `value`、`onChange` 和 `options` 的类型完全匹配：

```
 type SelectValue = string | number
 type SelectOption<T> = { value: T; label: string }
 type SelectProps<T extends SelectValue> = {
   value: T
   onChange: (value: T) => void
   options: ReadonlyArray<SelectOption<T>>
 }
```
#### 插槽（Slots）

另一个例子是 ModalDialog（模态对话框） 组件。在这种情况下，我们并不希望让用户像使用复合组件那样拥有完全的自由。毕竟，让用户把 `DialogFooter` 放在 `DialogHeader` 上面是没有意义的；我们也不希望有人误删 `DialogBackdrop`，或随意改变 `DialogBody` 与 `DialogFooter` 之间的间距。

在这种 “结构固定、顺序重要” 的场景中，使用插槽（slots）通常是一种更好的抽象方式：

```
 function ModalDialog({ header, body, footer }) {
   return (
     <DialogRoot>
       <DialogBackdrop />
       <DialogContent>
         <DialogHeader>{header}</DialogHeader>
         <DialogBody>{body}</DialogBody>
         <DialogFooter>{footer}</DialogFooter>
       </DialogContent>
     </DialogRoot>
   )
 }

 // 使用示例：
 <ModalDialog header="Hello" body="World" />
```
这种方式依然保留了一定的灵活性：我们可以在固定的位置注入任意 React 组件，同时又避免了在每个地方重复编写相同的模板代码。当然，把这些对话框基础组件放在设计系统里是有价值的，但我不会直接暴露它们给最终使用者。

综上，我们可以总结出两个判断指标，帮助决定何时不适合使用复合组件：

- 1、布局是固定的
- 2、内容是动态的

如果同时具备这两点，那么复合组件可能就不是最好的选择。

那么，什么时候复合组件才真正适用呢？又该如何让它们在类型层面更加安全呢？

#### 一个更好的例子

复合组件更适合那些：

- 子组件布局可灵活调整
- 内容基本固定

的场景，比如 `<ButtonGroup>`、`<TabBar>` 或 `<RadioGroup>`。

```
 import { RadioGroup, RadioGroupItem } from '@/components/radio'
 import { Flex } from '@/components/layout'

 function ThemeSwitcher({ value, onChange }) {
   return (
     <RadioGroup value={value} onChange={onChange}>
       <Flex direction={['row', 'column']} gap="sm">
         <RadioGroupItem value="system">🤖</RadioGroupItem>
         <RadioGroupItem value="light">☀️</RadioGroupItem>
         <RadioGroupItem value="dark">🌑</RadioGroupItem>
       </Flex>
     </RadioGroup>
   )
 }
```
与 `Select` 的区别在于：我们明确希望子组件不仅限于 `RadioGroupItem`。我们可能想自定义布局、添加辅助文字等。即使在部分场景中选项是动态的，写一个循环渲染也不是什么麻烦事。

不过，接下来就要考虑类型安全性了。例如，`ThemeSwitcher` 的 `value` 很可能不是任意字符串，而是特定的字面量类型：

```
 type ThemeValue = 'system' | 'light' | 'dark'
```
我们可以像前面那样，让 `RadioGroup` 成为泛型组件，以便 `value` 和 `onChange` 都使用 `ThemeValue`。但问题是 —— `RadioGroupItem` 怎么保证它的 `value` 也能被静态检查呢？

#### 类型安全（Type Safety）

当然，我们可以让 `RadioGroupItem` 也成为泛型组件。但这样做的问题是：子组件不会自动继承父组件的类型参数。换句话说，即使 `RadioGroup` 已经正确地推断出 `<ThemeValue>`，我们仍然需要在每个子项中手动写上类型参数：

[【第3377期】剪贴板如何存储不同类型的数据](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651273075&idx=1&sn=f14ee8fdb0c1c821a5d896d25adc0a1d&scene=21#wechat_redirect)

```
 import { RadioGroup, RadioGroupItem } from '@/components/radio'
 import { Flex } from '@/components/layout'

 type ThemeValue = 'system' | 'light' | 'dark'

 function ThemeSwitcher({ value, onChange }) {
   return (
     <RadioGroup value={value} onChange={onChange}>
       <Flex direction={['row', 'column']} gap="sm">
         <RadioGroupItem<ThemeValue> value="system">🤖</RadioGroupItem>
         <RadioGroupItem<ThemeValue> value="light">☀️</RadioGroupItem>
         <RadioGroupItem<ThemeValue> value="dark">🌑</RadioGroupItem>
       </Flex>
     </RadioGroup>
   )
 }
```
这种写法显然不太理想 —— 手动标注类型既麻烦又容易忘。我个人更喜欢类型能自动推断出来的设计。对于复合组件而言，实现这一点的最佳方式不是直接暴露这些组件，而是只给用户提供一个调用方法。

#### 组件工厂模式（Component Factory Pattern）

这个模式的名字可能不太严格，但概念很好理解。我们无法彻底消除手动类型标注，但可以把它隐藏起来，让用户只需在一个地方显式指定类型。

做法是：我们不直接导出 `RadioGroup` 和 `RadioGroupItem`，而是导出一个叫 `createRadioGroup` 的函数。这个函数接收一个类型参数，然后返回一个带有类型绑定的 `RadioGroup` 和 `RadioGroupItem`：

```
 import { RadioGroup, RadioGroupItem } from './internal/radio'

 export const createRadioGroup = <T extends GroupValue = never>(): {
   RadioGroup: (props: RadioGroupProps<T>) => JSX.Element
   RadioGroupItem: (props: Item<T>) => JSX.Element
 } => ({ RadioGroup, RadioGroupItem })
```
运行时，这个函数什么都没做，只是简单地返回组件对象。但在类型层面，它把 `RadioGroup` 和 `RadioGroupItem` 的类型参数绑定在一起。并且因为泛型默认是 `never`，用户必须显式传入类型参数才能正常使用。

使用示例如下：

```
 import { createRadioGroup } from '@/components/radio'
 import { Flex } from '@/components/layout'

 type ThemeValue = 'system' | 'light' | 'dark'

 const Theme = createRadioGroup<ThemeValue>()

 function ThemeSwitcher({ value, onChange }) {
   return (
     <Theme.RadioGroup value={value} onChange={onChange}>
       <Flex direction={['row', 'column']} gap="sm">
         <Theme.RadioGroupItem value="system">🤖</Theme.RadioGroupItem>
         <Theme.RadioGroupItem value="light">☀️</Theme.RadioGroupItem>
         <Theme.RadioGroupItem value="dark">🌑</Theme.RadioGroupItem>
       </Flex>
     </Theme.RadioGroup>
   )
 }
```
当然，这种方式也不是绝对安全的 —— 理论上我们仍然可以创建另一个不同类型的 `RadioGroup`，然后错误地把它的子项传给 `Theme.RadioGroup`。但这种错误的可能性已经非常低了。

总体来看，这种 “组件工厂模式” 既保留了复合组件的灵活性，又增强了类型安全性。唯一的代价是：使用者不能直接导入组件，而是需要通过函数创建一个带类型的组件实例。

我认为这是一个非常值得的权衡 —— 它能让设计系统里的复合组件，既灵活又类型安全。

关于本文  
译者：@飘飘  
作者：@TkDodo  
原文：https://tkdodo.eu/blog/building-type-safe-compound-components

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
