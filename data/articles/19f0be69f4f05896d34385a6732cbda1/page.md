---
title: "写Tailwind CSS像在写屎山？这锅该不该它背"
link: "http://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247528781&idx=1&sn=f80e88a5d32b1ebda4632d7846412bd0&chksm=f992779ccee5fe8ab9915d3a73abc9f292ca6ba5b449f6eaace79e1db1b85ba61f0fd4207920#rd"
date: 2026-01-04
md5: 19f0be69f4f05896d34385a6732cbda1
---

# 写Tailwind CSS像在写屎山？这锅该不该它背

```js_darkmode__1
点击上方 程序员成长指北，关注公众号
回复1，加入高级Node交流群
```
原文地址：https://juejin.cn/post/7578683148209946676

我上次在群里吐槽 Tailwind，被几个大佬围攻了：“现在还在写传统 CSS 的怕不是还在用 jQuery？”、“都 2025 年了还用 BEM？”，整得我都不敢说话了。

作为一个前端搬砖工，我从 Nodejs 到 React 再到 Vue 都踩过一遍坑，今天就跟大伙儿聊聊这个让我又爱又恨的 Tailwind。

## 一、为什么我觉得 Tailwind 有时候真的很操蛋

#### 1\. 这 HTML 还能看吗？

这是我第一次看到 Tailwind 代码的反应：

```code-snippet__js
<div class="flex flex-col md:flex-row items-center justify-between p-4 md:p-6 lg:p-8 bg-white dark:bg-gray-900 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
  <!-- 还有一堆嵌套div，每个都带着几十个类名 -->
</div>
```
同事问我：“这坨代码什么意思？” 我看了半天说：“一个卡片，会动，能响应式，深色模式适配了……” 但我心里想的是：这 TM 跟当年在 HTML 里写`style="color: red; font-size: 14px;"`有啥本质区别？

#### 2\. 接手别人的 Tailwind 项目有多痛苦

上个月接了个离职同事的项目，打开一看差点没背过气去：

```code-snippet__js
<div className={`px-${size === 'large' ? 6 : size === 'small' ? 2 : 4} py-${hasIcon ? 3 : 2} ${variant === 'primary' ? 'bg-blue-500' : 'bg-gray-200'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}>
  {/* 还有50行类似的代码 */}
</div>
```
这种动态拼接类名的操作，让我调试的时候想砸键盘。查了半天发现有个按钮在某种状态下 padding 不对，原来是`px-${size}`这种骚操作导致的。

#### 3\. 这玩意真的能提高开发效率吗？

老板跟我说：“用 Tailwind 开发速度快啊！” 但真实情况是：

- 边写边查文档：`m-4`和`p-4`到底哪个是 margin 哪个是 padding？`mt-4`和`mr-4`又是啥？
- 遇到复杂布局：用 flex 还是 grid？Tailwind 的 grid 类名又长又难记
- 调个细节样式：想微调一个阴影，得查半天文档才知道`shadow-lg`和`shadow-xl`的区别

有这查文档的时间，我 CSS 早写完了。

## 二、但为什么大佬们都在吹爆 Tailwind？

#### 1\. 等我真的用起来之后……

两个月后，当我对常用类名烂熟于心后，发现有些场景真香：

**「快速原型开发」**：产品经理站我身后：“这里改个间距，那里调个颜色，这个按钮 hover 效果换一下……”

以前：切到 CSS 文件 -> 找到对应的类 -> 修改 -> 切回来预览 -> 重复 现在：直接在 HTML 里改几个类名 -> 实时预览

**「设计一致性」**：以前团队里每个开发者对 “大间距” 的理解都不一样，有人写`margin: 20px`，有人写`margin: 24px`，还有人写`margin: 1.5rem`。现在统一用`m-5`或`m-6`，UI 终于统一了。

#### 2\. 性能确实牛逼

我原来不信，直到对比了项目打包后的 CSS 文件大小：

- 之前的项目（手写 CSS）：`main.css` 87KB
- 现在的项目（Tailwind + JIT）：`main.css` 12KB

因为 Tailwind 只生成你用到的样式，不会有未使用的 CSS 代码。

#### 3\. 再也不用想类名了

还记得那些年被 BEM 命名支配的恐惧吗？

```code-snippet__js
.card {}
.card__header {}
.card__header--active {}
.card__body {}
.card__footer {}
.card__footer__button {}
.card__footer__button--disabled {}
```
现在？直接写样式就行了，不用再想`header-wrapper-inner-content`这种傻逼名字了。

## 三、我从抗拒到真香的转变

转折点是我开始**「用正确的方式写 Tailwind」**。

#### 错误示范 ❌

```code-snippet__js
// 直接把所有类名堆在组件里
function BadButton() {
  return (
    <button class>
      提交
    </button>
  );
}
```
#### 正确姿势 ✅

```code-snippet__js
// 1. 先封装基础组件
function Button({ 
  children, 
  variant = 'primary',
  size = 'medium',
  fullWidth = false 
}) {
  const baseClasses = "font-bold rounded transition-colors";


  const variants = {
    primary: "bg-blue-500 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    danger: "bg-red-500 hover:bg-red-700 text-white"
  };


  const sizes = {
    small: "py-1 px-3 text-sm",
    medium: "py-2 px-4",
    large: "py-3 px-6 text-lg"
  };


  const widthClass = fullWidth ? "w-full" : "";


  return (
    <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass}`}>
      {children}
    </button>
  );
}


// 2. 使用 cva 库管理变体（更优雅）
import { cva } from 'class-variance-authority';


const buttonVariants = cva(
  "font-bold rounded transition-colors", // 基础样式
  {
    variants: {
      variant: {
        primary: "bg-blue-500 hover:bg-blue-700 text-white",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
      },
      size: {
        small: "py-1 px-3 text-sm",
        medium: "py-2 px-4",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "medium"
    }
  }
);


// 3. 实际使用
function GoodButton() {
  return (
    <Button variant="primary" size="large">
      提交
    </Button>
  );
}
```
## 四、什么时候该用，什么时候不该用

#### 赶紧用起来吧 👍

1. **「新项目，尤其是 React/Vue/Svelte 项目」**：组件化能很好解决 Tailwind 的可维护性问题
2. **「需要统一设计规范」**：设计系统配好了，大家就按这个来，别 TM 再自己发挥了
3. **「内部管理系统、后台项目」**：快速迭代，老板天天改需求，这种场景 Tailwind 无敌
4. **「团队协作项目」**：不用再解释为什么这里用`margin-top: 8px`而不是`10px`

#### 算了，别用了 ❌

1. **「静态小网站」**：就几个页面，写点 CSS 完事了，别折腾
2. **「老项目迁移」**：除非你想加班加到死
3. **「完全不懂 CSS 的新手」**：Tailwind 不是 CSS 的替代品，它是工具。连 CSS 盒模型都不懂就用 Tailwind，等于不会开车就用自动驾驶
4. **「设计师天马行空」**：如果你们设计师每个页面风格都不一样，用 Tailwind 配置会把你逼疯

## 五、我总结的血泪经验

1. **「不要直接在 JSX 里堆类名」**：这是所有屎山的源头！一定一定要封装成组件
2. **「配置好自己的设计系统」**：别用默认配置，根据项目需求配一套自己的`tailwind.config.js`
3. **「善用 @apply」**：重复出现的样式组合，用`@apply`提取

```code-snippet__js
/* 在CSS文件中 */
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}
```
1. **「结合现代工具链」**：`clsx`处理条件类名，`tailwind-merge`解决类名冲突
2. **「定期重构」**：发现重复的样式组合就抽象，别懒！

## 最后说句实话

用不用 Tailwind，其实跟你用什么技术关系不大，关键看你怎么用。

那些说 Tailwind 垃圾的，多半是看到了滥用它的项目；那些吹爆 Tailwind 的，多半是用对了方法。

就像当年大家吵 jQuery 和原生 JS，吵 React 和 Vue 一样，最后你会发现：**工具没有对错，只有适不适合。**牛逼的程序员用记事本都能写出好代码，菜鸡用再牛逼的框架也能写出屎山。

所以，别吵了，赶紧去写代码吧。老板又改需求了，今天还得加班呢。

Node 社群
