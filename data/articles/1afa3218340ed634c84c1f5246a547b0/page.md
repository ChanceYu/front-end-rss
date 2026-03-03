---
title: "用这 9 个 API，我把页面性能干到了 90+"
link: "http://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623436&idx=2&sn=438137b1ae67d3a54a3066d11c1d82c1&chksm=802247cdb755cedb0abf2190987ea07380ccc16d5907c5bd57867c3c78a2d5ea5adef73f9597#rd"
date: 2025-12-04
md5: 1afa3218340ed634c84c1f5246a547b0
---

# 用这 9 个 API，我把页面性能干到了 90+

最近项目上线，用户一多，页面就卡得不行。首屏加载 3 秒起，滚动掉帧，手机发烫……被 QA 喊去聊了好几次。

没办法，只能低头研究性能优化。翻了一圈文档和实战案例，发现现代浏览器其实给了我们很多“外挂”——那些你可能听过但一直没用起来的高级 API。

真正用上去之后，页面流畅度提升非常明显。今天就来分享我在项目中实测有效的 9 个 API，每一个都带来了实实在在的性能提升。

## 1. `IntersectionObserver`：懒加载的终极方案

以前做图片懒加载，都是监听 `scroll` 事件，手动判断元素位置。结果就是：一滚动，页面卡成 PPT。

后来改用 `IntersectionObserver`，直接交给浏览器去监听：

```
// 创建一个观察器实例
// entries 是所有被观察元素的状态集合
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    // 判断元素是否进入视口（可见）
    if (entry.isIntersecting) {
      const img = entry.target; // 获取当前图片元素
      // 将 data-src 中的真实图片地址赋给 src，开始加载
      img.src = img.dataset.src;
      // 加载完成后，停止观察，避免重复触发
      observer.unobserve(img);
    }
  });
});

// 找到所有带有 data-src 的图片（懒加载图片）
document.querySelectorAll('img[data-src]').forEach(img => {
// 让观察器开始监听每个图片
  observer.observe(img);
});
```
**效果**：首屏加载时间直接砍掉 40%，滚动丝滑，CPU 占用也降了。

关键是没有重排重绘，完全是浏览器层面的优化，比手动监听 `scroll` 强太多。

## 2. `requestIdleCallback`：把非关键任务丢到空闲时执行

有些事不着急，比如上报埋点、预加载下一页数据、清理缓存。但放在主线程里，总怕影响用户体验。

`requestIdleCallback` 就是干这个的——告诉浏览器：“等你空了再执行”。

```
// 浏览器会在主线程空闲时执行这个回调
// 不会阻塞高优先级任务（如渲染、用户输入）
requestIdleCallback(() => {
  // 发送用户行为埋点
  sendAnalytics();
  // 预加载下一页可能需要的资源
  preloadNextPage();
});
```
它不会抢占主线程，适合处理低优先级任务。用了之后，页面交互明显更跟手了。

## 3. `requestAnimationFrame`：动画就该这么写

以前用 `setTimeout` 做动画，总感觉卡卡的，还容易掉帧。

换成 `requestAnimationFrame` 后，动画终于和屏幕刷新率同步了：

```
function animate() {
  // 更新元素位置
  element.style.transform = `translateX(${x}px)`;
  // 如果还没到目标位置，继续下一帧动画
  if (x < 200) {
    requestAnimationFrame(animate);
  }
}
// 启动动画
requestAnimationFrame(animate);
```
**优势**：

- 自动适配 60fps / 120fps 屏幕
- 页面不可见时自动暂停，省电
- 比 `setTimeout` 更精准

动画类交互都建议换成这个。

## 4. `ResizeObserver`：监听元素尺寸变化

想监听某个 div 的宽高变化？别再用 `window.resize` + `getBoundingClientRect` 了，又慢又不准。

`ResizeObserver` 可以精确监听任意元素的尺寸变化：

```
const observer = new ResizeObserver(entries => {
  // entries 包含所有被观察元素的尺寸信息
  entries.forEach(entry => {
    // entry.contentRect 包含元素的宽高、位置等
    console.log('新尺寸:', entry.contentRect);
    // 可以在这里调整子元素布局或重绘图表
  });
});

// 开始监听指定元素
observer.observe(document.getElementById('chart-container'));
```
特别适合图表、自适应容器这类组件，再也不用手动触发 resize 事件了。

## 5. `performance.now()`：精准测量性能

`Date.now()` 精度不够，还可能被系统时间干扰。

`performance.now()` 是高精度时间戳，适合测量函数执行时间：

```
// 获取当前高精度时间（毫秒，精确到微秒）
const start = performance.now();

// 执行一个耗时操作
heavyCalculation();

// 再次获取时间
const end = performance.now();

// 计算耗时，结果非常精确
console.log(`耗时: ${end - start}ms`);

```
## 6. `preload` 和 `prefetch`：资源预加载

### `preload`：关键资源，立刻加载

```
<!-- 告诉浏览器：这个 CSS 很重要，马上就要用，优先加载 -->
<link rel="preload" href="critical.css" as="style">

<!-- 预加载字体文件，避免文字闪动 -->
<link rel="preload" href="font.woff2" as="font" type="font/woff2" crossorigin>

```
用于首屏必须用到的资源，浏览器会优先加载，提升首屏速度。

### `prefetch`：未来可能用到的资源

```
<!-- 告诉浏览器：用户可能会访问下一页，空闲时预加载这个 JS -->
<link rel="prefetch" href="/user/profile.js">

```
在空闲时预加载下一页的 JS 或数据，实现“秒开”跳转。

这两个配合使用，体验提升非常明显。

## 7. `Cache API` + `Service Worker`：让页面离线可用

PWA 的核心就是缓存。用 `Cache API`，可以把静态资源存到客户端：

```
// service-worker.js
self.addEventListener('fetch', event => {
  // 拦截网络请求
  event.respondWith(
    // 先在缓存中查找是否有匹配的请求
    caches.match(event.request).then(cached => {
      // 如果缓存中有，直接返回缓存内容
      // 否则发起网络请求
      return cached || fetch(event.request);
    })
  );
});

```
第一次访问正常加载，第二次直接从缓存读，速度快到飞起。

而且即使断网，核心页面也能打开，用户体验直接拉满。

## 8. `Web Workers`：把重任务移出主线程

项目里有个功能要处理上万条数据，一执行页面就卡死。

后来用 `Web Workers` 把计算放到后台线程：

```
// main.js - 主线程
// 创建一个 Web Worker，运行 worker.js 文件
const worker = new Worker('worker.js');

// 发送数据给 Worker
worker.postMessage(data);

// 监听 Worker 的返回结果
worker.onmessage = (e) => {
console.log('处理完成:', e.data);
};

// worker.js - 后台线程
// 监听来自主线程的消息
self.onmessage = function(e) {
// 执行耗时的数据处理
const result = heavyProcess(e.data);
// 将结果返回给主线程
  self.postMessage(result);
};
```
主线程再也不卡了，用户可以正常操作页面，处理完再通知前端。

## 9. `document.visibilityState`：页面不可见时节省资源

用户切到别的标签页，页面还在疯狂发请求、跑动画？太浪费了。

用 `visibilityState` 判断页面是否激活：

```
document.addEventListener('visibilitychange', () => {
// visibilityState 的值可能是：
// 'visible'：页面在前台
// 'hidden'：页面在后台（最小化、切标签）
if (document.visibilityState === 'hidden') {
    // 页面不可见时，暂停视频播放
    stopVideo();
    // 停止定时轮询接口
    stopPolling();
  } else {
    // 页面回到前台，恢复视频播放
    resumeVideo();
  }
});
```
页面不可见时暂停轮询、视频、动画，回来再恢复。省电、省流量、省服务器压力。

## 总结

这 9 个 API 不是“炫技”，而是真正在解决性能问题：

- `IntersectionObserver` → 懒加载
- `requestIdleCallback` → 空闲任务
- `requestAnimationFrame` → 流畅动画
- `ResizeObserver` → 尺寸监听
- `performance.now()` → 性能测量
- `preload/prefetch` → 资源预加载
- `Cache API` → 离线缓存
- `Web Workers` → 后台计算
- `visibilityState` → 节流优化

每一个都能在特定场景下带来显著提升。建议从 `IntersectionObserver` 和 `preload` 开始，逐步引入，效果立竿见影。

性能优化不是一蹴而就，但每一步都值得。

推荐阅读  点击标题可跳转

1、[Vue 3.6 进“养老模式”了吗？一年没大更新，稳得让我有点慌](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623385&idx=1&sn=d6b1e45bfeb08fd8fa470ff10dc7626d&scene=21#wechat_redirect)

2、[Vue3 + 一个冷门 API，实现了浏览器多屏投屏，效果太惊艳了！](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651622684&idx=1&sn=ca2cd517988544bfffa2849fd5070aed&scene=21#wechat_redirect)

3、[Ant Design 6.0 来了！这一次它终于想通了什么？](https://mp.weixin.qq.com/s?__biz=MzAxODE2MjM1MA==&mid=2651623418&idx=1&sn=7c3f560db0837b29a5d6bbd301c9ea0b&scene=21#wechat_redirect)
