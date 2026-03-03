---
title: "【早阅】深入理解 Web Components：如何利用自定义元素和 Shadow DOM 打造可复用表单组件？"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278080&idx=1&sn=8c662524c3c1d64fff6d988898dbe8bd&chksm=bc3973b23de9ca62f3c7b9615bdb4d01651ae5305496415bde7b6d9b982082225f7b2364050a&scene=0#rd"
date: 2025-12-08
md5: 5c4ec178fbacf6efd6ef84d7fc009870
---

# 【早阅】深入理解 Web Components：如何利用自定义元素和 Shadow DOM 打造可复用表单组件？

介绍如何使用一个名为 form-group 的自定义 Web Component 来简化表单的错误处理和校验逻辑，并借此探讨 Web Components 的基本概念、使用方式以及设计取舍。

form-group.js：https://github.com/kevin-powell/form-groups-wc

#### 引言：使用 Web Component 增强表单

近期对表单功能进行了优化，引入了一个名为 `form-group` 的 Web Component，该组件旨在处理输入字段的验证和错误提示逻辑。该组件的引入使得在字段失去焦点时，可以自动显示如 “此字段为必填项” 或 “类型不匹配” 等错误信息。更进一步，该组件允许通过属性设置自定义的默认错误消息，例如可以指定 “您未在此处输入任何内容” 来覆盖默认提示，极大地增强了表单的交互性和反馈机制。

[【第3418期】HTML 表单验证：未被充分利用的利器](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651274171&idx=1&sn=ca167beaaa451e0fb55286663bf46a15&scene=21#wechat_redirect)

##### Web Component 的价值与后续计划

本次探讨的重点是探索 Web Components 是什么以及如何在现有项目中应用已有的组件。组件的创建过程，即如何从零开始构建此类组件，将被留待后续的第二部分视频中进行详细讲解。当前的目标是探索如何将外部发现的、有用的 Web Component 集成到当前项目中，并利用其封装的功能，同时保持原有的表单样式和结构。

> “我看到人们在实现事物时，我就在想，‘哦，那可以是一个 Web Component。’”，

#### 什么是 Web Component

Web Components 是一个伞形术语，它涵盖了几个核心的原生规范，其中最主要的是 HTML 的模板元素（template elements）、Shadow DOM（或 Shadow Roots）以及自定义元素（Custom Elements）。自定义元素允许开发者定义任何带有连字符的随机标签名称，浏览器过去无法识别这些标签，但现在可以通过 JavaScript 类和 Shadow Roots 赋予它们行为和逻辑能力。

[【第2888期】使用Svelte来构建Web Component](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651261321&idx=1&sn=5444a1521954e6b42d495aae8855cabf&scene=21#wechat_redirect)

##### 与传统逻辑封装的区别

与早期的 jQuery 等库通过附加逻辑到现有元素的方式不同，Web Component 的方法是创建一个具有自定义名称的真实 DOM 元素，并将其内部逻辑完全封装在自身之中。这种封装方式确保了组件的独立性，避免了与页面上其他原生元素的钩子或插件产生冲突，提供了更清晰的结构化解决方案。

- HTML 模板元素（Template Elements）
- Shadow Roots 或 Shadow DOM
- 自定义元素（Custom Elements）

#### 引入 Web Component 替换现有代码

将 `form-group.js` 文件引入项目后，需要确定如何替换原有的表单结构。组件作者指出，`form-group` 组件不会处理表单提交（form submission）等高级功能，例如聚焦第一个无效元素或执行数据重置。因此，原有的 `form.js` 文件中关于表单提交的逻辑仍需保留，但可以移除其中所有针对字段有效性检查的函数，因为这些功能现在由 Web Component 接管。

[【早阅】更好的表单设计：一种新的方法](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651272145&idx=2&sn=aaa1b34778cb54c5931b6fb8fc818a13&scene=21#wechat_redirect)

##### 保留的外部逻辑

在表单提交时，如果表单有效，应继续执行数据重置操作；如果无效，则保持原样。对于原先手动检查有效性的脚本部分，应当被移除。核心的浏览器原生验证逻辑，如 `e.target.validity.valid`，仍然可以在表单提交处理函数中用于判断整体表单状态。

- 所有用于检查字段有效性的函数
- 手动进行的有效性状态检查

#### 使用 Web Component

一旦 `form-group.js` 脚本被加载，它会自动定义一个名为``的新自定义元素。要使用它，只需将原先包裹标签、输入和错误提示的`div class="form-group"`替换为``标签。该组件采用渐进式增强（Progressive Enhancement）方法，这意味着它不负责处理表单元素本身的样式，这些样式仍由页面上原有的`.form-group` 类负责。

##### 利用插槽和浏览器验证

Web Component 要求表单上移除 `novalidate` 属性，以便让浏览器控制验证过程。组件内部使用 Shadow DOM 的插槽（slot）机制，将作为子元素的标签（label）和输入（input）放置到预定位置，并在输入下方自动插入用于显示错误信息的 \`\` 元素。这种方式确保了即使 JavaScript 未加载，基础的 DOM 结构也已存在。



| 方面 | 旧有 DIV 结构 | 新 Web Component 结构 |
| --- | --- | --- |
| 标签 | div class="form-group" |   |
| 验证控制 | 主要依赖 JavaScript 脚本 | 主要依赖浏览器原生验证 |
| 错误显示 | 手动添加 / 移除 SPAN | 组件内部通过 Slot 自动管理 |


为了使新字段具有验证可能性，需要为其添加约束，例如 `required` 属性。一旦添加，当用户交互后留空并离开输入框时，组件便会显示默认的错误消息 “此字段为必填项”，这证明了组件已成功接管了错误信息的展示逻辑。

#### 自定义错误消息的样式

Shadow DOM 的封装特性使得外部样式无法直接影响组件内部的元素，这既是优点也是限制。为了允许外部配置组件的内部样式，组件作者必须暴露特定的配置机制。对于错误消息的样式定制，主要有两种机制可以利用，它们都能够穿透 Shadow Root 的样式隔离层。

[【第3620期】从崩溃到优雅：Node.js 错误处理的正确姿势](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278024&idx=1&sn=60cc64389d04ede80e9340f888a8fc1a&scene=21#wechat_redirect)

##### 通过 CSS 变量定制颜色

第一种机制是使用 CSS 自定义属性，即 CSS 变量。组件内部为错误消息的颜色暴露了一个名为 `--error-message-color` 的变量。设置此变量的值（例如，设置为蓝色或紫色）将立即影响错误消息的显示颜色，因为 CSS 变量会跨越 Shadow Root 继承。

##### 使用 CSS Part 暴露元素

第二种机制是使用 CSS Part。组件内部的错误消息元素被标记了一个名为 `error-message` 的 CSS Part。通过使用 `form-group::part(error-message)` 这样的选择器，开发者可以像操作普通元素一样，对该内部元素进行填充、边距、边框半径或背景色等所有 CSS 属性的样式调整。

> “CSS Part 是另一种可以用来样式化 Part 所在的整个 DOM 元素的方式。”

选择哪种机制取决于样式需求：CSS 变量主要用于影响特定属性（如颜色），而 CSS Part 则针对整个被标记的元素，允许修改任何 CSS 属性。组件作者需要明确记录这些可配置的变量和 Part 名称，以便外部使用者能够有效进行定制。

[【第3619期】让字距随字体自适应变化的 CSS 技巧](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278003&idx=1&sn=72f8517f9201eabd058015706fcacc14&scene=21#wechat_redirect)

#### 自定义错误消息内容

Web Component 扩展了浏览器原生的约束验证（Constraint Validation）功能，允许为不同的验证失败情况提供定制化的错误提示。浏览器验证基于输入元素上设置的约束属性，例如 `required`、`minlength`、`maxlength` 以及数字类型的 `min`/`max`。

##### 处理多种约束错误

一个输入字段可能同时违反多项约束，例如，一个设置了 `minlength` 为三的字段若为空，则同时触发 “值缺失”（value missing）和 “太短”（too short）两种错误。然而，为了用户体验，组件被设计为只显示最优先的错误信息，通常是 “值缺失” 优先于 “太短”。

- value-missing-message：用于自定义 “必填” 失败的提示。
- too-short-message：用于自定义 “长度不足” 的提示。
- type-mismatch-message：用于自定义电子邮件等类型验证失败的提示。

对于电子邮件类型验证，浏览器仅检查值是否包含一个 “@” 符号，这可能与用户期望的更严格的格式验证存在差异。此外，对于 `maxlength` 属性，出于可访问性考虑，不推荐使用，因为它会阻止用户输入超出限制的字符，而应允许用户输入后再进行验证。

#### 修复字段集（Fieldset）布局

当 Web Component 被用作包裹一组单选按钮（radio buttons）的`中的子元素时，可能会破坏原有的CSS Grid布局。这是因为原布局预期`的直接子元素是两个表单组的 `div`，但现在被 \`\` 组件包裹成了一个单一的 Grid 子项，导致布局错位。

##### 使用 Display Contents 恢复 Grid 结构

解决此问题的技巧是针对位于`内部的`元素应用 `display: contents`。此 CSS 属性会使浏览器忽略该元素作为 Grid 的子项，转而将其直接子元素提升到 Grid 布局中，从而恢复了原有的结构预期。此方法在处理 Slot 元素时也常见，因为 Slot 默认就是 `display: contents`。

[【第3600期】CSS Grid：一个实用的思维模型与网格线的强大之处](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651277638&idx=1&sn=c62633fdee3bb8c02004898d5e9d366b&scene=21#wechat_redirect)

“display: contents 的本质是，就浏览器而言，它就像这个东西不存在一样。”  
虽然 `display: contents` 在语义上存在潜在的可访问性风险（因为它会移除元素的语义意义），但在本例中，由于 \`\` 本质上只是一个包裹元素，且其内部内容通过 Slot 投影，因此使用此属性是安全且有效的。

#### 错误处理的更多细节

组件的错误处理逻辑大部分是自动完成的，事件监听器在组件加载时即被触发。组件作者强调了用户体验方面的严格立场：绝不应在用户输入过程中显示错误消息。组件通过监听 `input` 事件来移除任何现有错误，仅在 `blur` 事件发生时才执行验证并决定是否显示错误提示。

##### 禁用原生浏览器提示

组件还禁用了浏览器默认的验证弹出提示框。这主要是因为原生工具提示（tooltips）的可访问性存在不确定性。相比之下，使用带有 `aria-live` 属性的 \`\` 元素来显示错误消息，可以确保错误信息不仅在视觉上可见，还能被辅助技术（如屏幕阅读器）朗读出来，提供了更可靠的可访问性保障。

- Input 事件：移除所有错误消息，不予显示。
- Blur 事件：执行验证，如果发现错误则显示。
- Submit 事件：聚焦所有无效字段（由浏览器处理）。

这种设计确保了用户在填写表单时拥有流畅体验，避免了在输入过程中被中断。组件的这种封装和对浏览器标准的利用，使其能够在任何框架或无框架的环境中运行，充分利用了浏览器标准 API 的强大能力。

#### 早读洞察

1、Web Components 核心规范: Web Components 是一个总括术语，涵盖了模板元素、Shadow DOM 和自定义元素等原生规范，用于在标签内封装逻辑。

2、渐进式增强策略的应用：采用渐进式增强方法，确保即使 JavaScript 未加载或失败，页面的基础结构和功能仍可保持可用性。

3、Shadow DOM 的样式封装: Shadow DOM 的封装性阻止了外部全局样式渗透到组件内部，同时也防止组件内部样式泄漏到外部页面。

4、定制 Shadow DOM 内部样式：组件内部样式定制依赖于两种机制：可跨越 Shadow Root 的 CSS 变量或通过暴露的 CSS Part 选择器。

5、利用 CSS 变量定制颜色：通过设置名为 `--error-message-color` 的 CSS 变量，可以轻松修改错误消息的颜色，因为它会穿透 Shadow Root 并被继承。

6、使用 CSS Part 进行深度样式调整: CSS Part（如 `error-message`）允许对整个内部元素进行更广泛的样式控制，包括边距、填充和背景色等属性。

7、浏览器约束验证的利用: Web Component 利用浏览器原生的约束验证（如 required, too short），减少了编写重复 JavaScript 验证逻辑的需求。

8、优化错误消息显示的 UX: 为了提升用户体验，组件设计为一次只显示最优先的错误信息，即使输入可能同时违反多项约束。

9、处理字段集（Fieldset）布局：当 Web Component 嵌套在 CSS Grid 布局的 `` `内时，使用 `` display: contents\` 可恢复预期的网格子元素结构。

10、错误消息显示时机原则：最佳实践是绝不在用户输入过程中显示错误，仅在输入事件的 `blur` 事件触发验证时才显示错误提示。

原文：https://youtube.com/watch?v=qUhtlnL48yA

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
