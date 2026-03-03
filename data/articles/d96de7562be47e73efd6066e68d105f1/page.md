---
title: "借助图片懒加载触发 JavaScript 动态导入"
link: "http://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623523&idx=2&sn=86651ed0be205cc4b86a6efc43d8b6cb&chksm=802247a2b755ceb46f45aa6a45820970a51646279140427f120b786a24fdfa5f82cebe0eade0#rd"
date: 2025-12-15
md5: d96de7562be47e73efd6066e68d105f1
---

# 借助图片懒加载触发 JavaScript 动态导入

> 转自：网络

近年来 html 的最好改进之一是你可以添加到图像（也包括 iframe）的 `loading="lazy"` 属性，它将告诉浏览器直到图像出现在视口才加载图像。

```code-snippet__js
  <img src="/images/your-image.png" loading="lazy">
```
非常简单，非常实用。但如果你也能对脚本做同样的事情，那该多好。这样你就可以懒加载你的组件，只有当它们实际需要时才加载...

嗯， `<img>` 元素还有另一个功能，就是使用 `onload` 和 `onerror` 属性在图像加载（或未加载）后运行脚本。

```code-snippet__js
<img 
    src="/images/your-image.png" 
    loading="lazy"
    onload="() => console.log('image loaded')"
>
```
这个 `onload` “回调”只有在图像加载时才会触发，如果图像是懒加载的，那么它只会在图像出现在视口时触发。噔噔噔！一个懒加载的脚本。

很遗憾，像这样它并没有什么用处。首先，你会在页面上出现一个不需要的图片，其次，你需要将想要运行的 javascript 内联化，这有点违背了懒加载的初衷。所以，让我们做一些改变来改进这一点。

图片本身可以是任何东西，或者，更重要的是，什么都没有。正如我之前提到的，有 `onerror` 回调，正如其名称所暗示的，当图片没有加载成功时会触发。

这并不意味着你需要将 `src` 指向一个不存在的图片，那样会导致控制台充满关于缺失图片的红色 404 错误，没有人想要这样。

如果 `src` 图片实际上不是一个图片， `onerror` 回调也会触发，而最简单的方法是使用 `data:` 格式“错误地编码”一个图片。这也具有不向控制台填充缺失图片警告的好处。

```code-snippet__js
<img 
    src="data:," 
    loading="lazy"
    onerror="() => console.log('image not loaded')"
>
```
这仍然会导致页面出现"损坏的图像"缩略图，但我们会解决这个问题的。

好的，但我们仍然需要将想要运行的 javascript 内联，那么我们该如何修复这个问题呢？

既然 ES 模块支持几乎已经普及，我们可以使用非常强大的事件导入后默认 javascript 加载技术来在事件触发后加载脚本，如下所示：

```code-snippet__js
<img 
    src="data:," 
    loading="lazy"
    onerror="import('/js/some-component.js').then(_ => _.default(this))"
>
```
_注意：这也适用于 `onclick` 、 `onchange` 等事件。_

_注意：下划线只是访问模块的简写方式，你也可以写成 `.then(Module => Module.default(this))`_

好了，这里到底是怎么回事！？

首先让我们看看 some-component 可能的样子：

```code-snippet__js
// some-component.js


export default element => {
    element.outerHTML = `
        <div class="whatever">
            <p>Hello world!</p>
        </div>
    `;
}
```
所以，你可能已经注意到，在 `onerror` 回调中，我将 `this` 作为参数传递给了默认导出。我这样做的原因（抱歉用词不当😁）是为了给调用它的脚本提供 `<img>` ，因为在当前（我又犯错了🤦）的上下文中 `this = <img>` 。

现在你可以简单地 `element.outerHTML` 替换损坏的图片为你自己的 HTML 标记，然后你就有了懒加载的脚本！😱

#### 缓存和传递参数

如果，您在页面上多次使用此技术，那么您需要向 `data:,` 传递一个"缓存破坏"索引，或随机数，例如：

```code-snippet__js
<img 
    src="data:,abc123" 
    loading="lazy"
    onerror="import('/js/some-component.js').then(_ => _.default(this))"
>
<img 
    src="data:,xyz789" 
    loading="lazy"
    onerror="import('/js/some-other-component.js').then(_ => _.default(this))"
>
```
":,"后面的字符串可以是任何内容，只要它们不同即可。

将参数传递给函数的一个非常简单的方法是在 HTML 中使用 `data-something` 属性，如下所示：

```code-snippet__js
<img 
    src="data:," 
    loading="lazy"
    data-message="hello world"
    onerror="import('/js/some-component.js').then(_ => _.default(this))"
>
```
由于我们将 `this` 传递给了函数，你可以像这样访问 `data` 属性：

```code-snippet__js
export default element => {
    const { message } = element.dataset
    element.outerHTML = `
        <div class="whatever">
            <p>${message}</p>
        </div>
    `;
}
```
推荐阅读  点击标题可跳转

1、[JavaScript 性能提升 500% 的外挂！这是前端未来的趋势](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623513&idx=1&sn=8625e6907af8e112d66a5747e52490d1&scene=21#wechat_redirect)

2、[库克告别苹果，“九子夺嫡”争夺CEO大战开始了](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623494&idx=1&sn=2ac196889f093d858b4fca74804178cf&scene=21#wechat_redirect)

3、[HTML 的隐藏宝藏： 标签](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623494&idx=2&sn=36dd6338dd0696f95fce0603d8a6f5d5&scene=21#wechat_redirect)
