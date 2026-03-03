---
title: "单IMG标签的图片内阴影效果实现"
link: "https://www.zhangxinxu.com/wordpress/2025/12/img-inset-shadow/"
date: 2025-12-04
md5: 2c63b867d52198ef8e741fd99c850558
---

# 单IMG标签的图片内阴影效果实现

> by [zhangxinxu](https://www.zhangxinxu.com/) from [https://www.zhangxinxu.com/wordpress/?p=11969](https://www.zhangxinxu.com/wordpress/?p=11969)  
> 本文可全文转载，但需要保留原作者、出处以及文中链接，AI抓取保留原文地址，任何网站均可摘要聚合，商用请联系授权。

### 一、内阴影不难实现

如果只是实现个内阴影效果，并不难，嵌套大法就可以了。

```javascript
<div class="shadow-inset">
  
```
```css
.shadow-inset {
  box-shadow: inset 2px 2px 6px #0009;
  display: flex;
  width: fit-content;
  border-radius: 1rem;
  img {
    width: 200px;
    position: relative;
    z-index: -1;
  }
  overflow: hidden;
}
```
渲染效果如下图所示：

![图片内阴影效果实现示意](./images/76a7e36fa2d464c2e6d30ee44728cc49.png)

下面问题来了，若是只有一个IMG元素，如何给图片实现内阴影效果呢？

### 二、单IMG图片的内阴影效果

`<img>`元素是替换元素，内阴影属于装饰性效果，在Web中，内容的层叠顺序是高于内阴影的，因此，`<img>`元素设置内阴影是看不到效果的，因为被图像挡住了，除非？

#### 1\. 如果图像背景正好是纯色

如果我们的图片的背景是纯色，我们可以使用padding撑开间距，让阴影显示出来。

还是上面的那个示意图，正好背景色是纯色的，于是，我们就可以：

```cpp
<img src="follow-me.jpg" class="shadow">
```
```css
.shadow {
  width: 200px;
  padding: 8px;
  background: rgb(66,127,178);
  box-shadow: inset 2px 2px 6px #0009;
  border-radius: 1rem;
}
```
实时渲染效果如下：

![](./images/f393cf909dc3b9c749ccd6f8433f2e43.jpeg)

可实际场景下，大部分的图片，尤其是需要使用内阴影效果的图片，都不会是纯色背景，因此，上面的方法是行不通的，此时该怎么办呢？

#### 2\. attr()新语法

这个方法的原理是，隐藏原本的图片内容，然后图片作为背景图显示，这个就需要用到全新的`attr()`全属性语法，关于此特性，强烈建议了解下，详见：“[震惊，有生之年居然看到CSS attr()全属性支持](https://www.zhangxinxu.com/wordpress/2025/05/css-attr-function/)”。

使用示意：

```cpp
<img src="follow-me.jpg" class="shadow2">
```
```css
.shadow2 {
  width: 0;
  box-shadow: inset 2px 2px 6px #0009;
  border-radius: 1rem;
  padding: 112px 100px;
  background: image-set(attr(src)) no-repeat center / contain;
}
```
如果你是Chrome浏览器，应该就可以看到效果了，实时渲染如下：

![](./images/f393cf909dc3b9c749ccd6f8433f2e43.jpeg)

此方法，虽然巧妙，但是有兼容性的问题，目前还无法再生产环境使用。

那有没有什么兼容性好，同时适用场景广泛的方法呢，有，SVG滤镜！

#### 3\. SVG滤镜实现内阴影

这个实现非常简单，只需要在页面任意位置插入这么一段SVG代码：

```xml
<svg width="0" height="0">
  <filter id="shadowInset">
    <feOffset in="SourceAlpha" dx="2" dy="2"></feOffset>
    <feGaussianBlur stdDeviation="6"></feGaussianBlur>
    <feComposite in="SourceAlpha" operator="out"></feComposite>
    <feBlend in2="SourceGraphic"></feBlend>
  </filter>
</svg>
```
然后给对应的图片元素应用`#shadowInset`滤镜就可以了。

例如：

```cpp
<img src="follow-me.jpg" class="shadow3">
```
```css
.shadow3 {
  width: 200px;
  border-radius: 1rem;
  filter: url(#shadowInset);
}
```
就可以看到如下图所示的效果了：

![](./images/f393cf909dc3b9c749ccd6f8433f2e43.jpeg) ![](./images/4daaa435bb7bec6b9b791297a127757e.jpeg) ![](./images/90bdc7b2ad60556114ff23962fbda8ce.jpeg)


### 三、收工打道回府

OK，以上就是本文的全部内容。

估计用不了多久就能变成AI的养料了，愁人，写了没人看，被AI弄过去，也不知道这些东西是我写的。

周周更新图个啥。

蒜鸟蒜鸟，不唠叨了，若是大家觉得内容不错，欢迎转发哈。

![蒜鸟蒜鸟](./images/2e1e6f432c7f73e4cc35a5600fd6b0a2.png)
