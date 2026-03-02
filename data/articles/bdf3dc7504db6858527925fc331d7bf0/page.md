---
title: "jQuery 发布重大更新4.0"
link: "http://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623922&idx=2&sn=837f3a8fbf5fe32e95ceaf5ba6bd7055&chksm=80224633b755cf250c2ef0a6bd170abfbdb7caaaaf35d08c8485b0b5632f2006a447c08c7c00#rd"
date: 2026-01-21
md5: bdf3dc7504db6858527925fc331d7bf0
---

# jQuery 发布重大更新4.0

转自：OSC开源社区

2006 年 1 月 14 日，John Resig 在纽约市的 BarCamp 推出了一个名为 jQuery 的 JavaScript 库。

现在，20 年后，jQuery 团队正式发布了 jQuery 4.0.0 版本。

![图片](./images/0b795cbd916e0e1ff9e02c2d4d082890.png)

经过漫长的开发周期和几次预发布，jQuery 4.0.0 带来了许多改进和现代化。

**主要变化与亮点**

- **移除旧版浏览器支持**：不再支持 IE 11 以下版本（即仅支持 IE11+），同时也放弃了对 Edge Legacy、iOS <11、Firefox <65 和旧版 Android 浏览器的支持。
- **删减遗留代码与弃用 API**：
- 移除了大量已弃用的 API，如`jQuery.isArray`、`jQuery.parseJSON`、`jQuery.trim`、`jQuery.isFunction`等。
- 移除了 jQuery 原型中的`push`、`sort`、`splice` 等 Array 方法，这些方法是内部使用的，现在推荐使用标准数组方法。
- **引入“slim”版本**：提供了精简版（slim build），不包含 AJAX 和动画模块，体积更小（约减少 8KB gzip 压缩后大小）。
- **其他改进**：
- 修复并简化了事件处理（如`focusin`和`focusout`事件顺序）。
- 提高了与现代浏览器标准的兼容性，减少 “魔法” 行为，提升性能与可维护性。

jQuery 团队表示，这是近 10 年来的首个大版本更新，包含一些重大变化，许多破坏性变化是团队多年来一直想做出的，但在补丁或次要版本中做不到的。

我们已经修剪了遗留代码，删除了一些以前被弃用的 API，删除了一些从未记录的公共函数的内部参数，并放弃了对一些过于复杂的“神奇”行为的支持。

因此在升级之前请务必通读迁移文档。尽管如此，我们预计大多数用户将能够在对代码进行最少的更改后进行升级。

详情查看发布说明：https://blog.jquery.com/2026/01/17/jquery-4-0-0/
