---
title: "【AI Coding】借助cursor实现业务需求全栈交付实践"
link: "http://mp.weixin.qq.com/s/wf3l4ngPTENl7rk88piRLg"
date: 2026-02-06
md5: 6dcf295b3585664b2d4e1af6492b0310
---

# 【AI Coding】借助cursor实现业务需求全栈交付实践

![图片](./images/a68eea7ee21a6945904aba3fcbe012de.gif)

  

  

  

本文记录了借助Cursor完成红包签到页“单品返子玩法”前端功能全栈交付的实践过程，涵盖需求拆解、AI生成方案与代码、弹窗动画（Lottie衔接+飞入效果）、Feeds插卡与去重、问题排查（预加载失效、回退刷新、状态管理等），强调AI辅助下需人工把控逻辑、样式和交互细节，并总结了日志定位、知识补缺等关键经验。  

  

![图片](./images/2e42c21a17e94b846927e55b2251e289.webp)

背景

  

伴随着AI模型和工具能力的快速发展，AI coding正在不断的改变着我们日常的研发模式，同时也拓展了我们的技术边界。借助AI工具，可以快速的去了解一个代码库的业务逻辑和使用的技术栈，甚至基于此做迭代研发。本文主要从一个服务端的视角出发，使用AI工具（cursor）完成一次实际业务需求AI coding 的全栈交付实践，主要包含前端的交互逻辑、样式、动画等内容，服务端部分忽略。 主要目的是对AI coding过程中遇到的问题记录、总结和尝试，当然目前对前端的知识了解还比较浅薄，过程中如果有理解和使用上的偏差欢迎指正～

  

![图片](./images/817abfea533a4d7ae5f463be2274e439.png)

需求简介

  

核心功能：在红包签到首页对单品返子玩法作引导强化。

- 首页展示单品返子玩法商品POP，包括：弹窗前置动画、动画与POP过度、关闭弹窗收入二排动画等；
- 首页Feeds展示单品返子玩法商品卡片，包括：单商品卡片和多商品卡片两种样式。

单品返首页弹窗

单品返首页插卡

![图片](./images/1b13dc1c9a1964c8464687528c7f5c05.png)

![图片](./images/3ff30601494e691939c378fcdabcd362.png)

  

![图片](./images/bb2bd7d8a5ba341dde446ba760dcab53.png)

AI Coding实践

  

AI coding，关键流程和日常研发流程类似，只是更多的是让AI去做具体的执行，而我们做好过程管理、决策和CR部分。一般我们会遵循以下流程：

![图片](./images/4846ec0c5fdc6711f77d10186c40be6e.png)

下面从这个具体的需求出发，展开实践过程。

  

▐  STEP 1: 确定需求点、修改范围，编写需求描述

  

- 需求澄清

  

首页根据PRD和设计稿的要求，进行需求澄清，提炼需求点。再结合对工程了解程度，确定大致的方案和修改点，如果对需要修改的工程结构比较陌生，也可以借助cursor帮忙总结。

![图片](./images/7ac280ee56e7923cb29d314e79eebb35.png)

  

初步分析本次需求，前端涉及的改动：

- 首页新增一个Pop（需要回调疲劳度、动画、Pop上需要展示商品）-只在老版本；
- 首页Feeds增加单品返商品插卡（可复用首页渠道插卡） - 新老版本都需要；
- 首页Feeds和单品返插卡商品双向去重 - 新老版本都需要。

涉及的前端工程：hbqd5（老版本主页）、qd（新版本主页）、order-withdraw-feeds（子玩法）。

  

- 创建变更

  

分仓库建迭代、拉变更（不同业务的前端发布平台可能不同，具体可咨询对应前端同学），编写需求描述- task.md

![图片](./images/126587a93ffe8be5b5f7f65cdaac2e97.png)

![图片](./images/85f2ba7448a27de55683a32fca7df1d0.png)

  

▐  STEP 2: 使用AI工具编写实现方案，并review方案

  

- AI初版方案

  

使用Cursor的plan模式，引用编写好的需求澄清文档，生成执行计划，并review，持续和AI交互迭代

![图片](./images/fdf3be458960425cab0e950ec6c13e5a.png)

(待确认的问题，这里忘记截图了，，，，

cursor会根据编写的执行计划中不确定的点给出待确认的问题，问题一般预设好了答案/是在不确定的会让你自己给答案，对预设答案的问题，还会标识推荐选项。按序号回复即可。

  

- 方案Review

  

对编写的执行计划进行review，有任何觉得不可行的实现都可以进行修改（这里还没输出到solution.md....

![图片](./images/a5f987b01b89de44d487e944467de072.png)

![图片](./images/634fbbdc3f6b233e3a0095a4a8929a0b.png)

![图片](./images/a53e8212c9b9683eb624f90e0adf6670.png)

生成执行计划之后，若还有其他问题，可以继续确认再修改执行计划，直到方案满足要求

![图片](./images/81f75365d318eb8eae2c7a5fc00a1856.png)

![图片](./images/e1e2d8bffdebd9526cf3e44a4dcf12dc.png)

  

▐  STEP 3: AI 生码，完成需求基础框架

  

前两步已完成执行方案生成，这里可以按照方案，让AI工具一次性完成前端需求的大体框架和内容

![图片](./images/0ac478b8659a39b948493993a073b213.png)

![图片](./images/4e8aff83f8f35fb3f1bd3ae4a697ebea.png)

  

▐  STEP 4: 自测并完善样式、动画、交互等功能

  

- 弹窗样式细节调整

  

本地调试观察实现和交互稿的差异，直接通过视觉稿截图和AI交互，让其修改

(这里可以使用D2C插件，生成样式，但当时比较头铁....

![图片](./images/d3b8014d8be127272d856c262e0b1122.png)

![图片](./images/61e822735ace8d732e3181dd453bbf74.png)

![图片](./images/9899142c1fb79c1a64eaa740d9c4062d.png)

![图片](./images/255dd8cadffd2e7f945285410fb2769b.png)

经验手调：结合视觉交互稿中的布局、字体、尺寸，调整样式文件

![图片](./images/e74c23ed7352d2c2a2dd3f4ac2f1cea3.png)

  

- 动效实现

  

![图片](./images/e8b805d0c2bd5853c423db66dd9ae6fd.png)

动效和视觉确认后，拆分成两个部分，Pop前使用lottie动画播放，Pop后入口引导手搓一下。

  

1\. lottie动画实现

![图片](./images/5efa732608a108a400a8f1941fb825c9.png)

![图片](./images/b076139a2625920ac6541e67b5d5f4ce.png)

lottie动画简单来说，就是播一段素材就行，代码库中有现成的组件，比较难的点是，动画和静态素材之间的过渡。需要但前置动画播放完之后，正好衔接POP弹窗，动画的结束位置在POP弹窗的顶部。

  

![图片](./images/8fdf738769269e250bc0e2b0129c7de0.gif)

  

那这里就需要拆成两步，基础实现+微调。基础的功能实现交给AI：

![图片](./images/f8e4b01e2e5890106a80377e95a71d01.png)

![图片](./images/c2ab8d0ecd5750a877554368bd90e220.png)

![图片](./images/e3d45a3047700d64332e59cc7d1ad906.png)

  

pop弹窗和lottie动画的衔接处理：增加弹窗状态，通过lottie动画组件回调控制弹窗的隐藏和可见。

![图片](./images/18bf7eed876a5fdb2de3ec41042d6cda.png)

![图片](./images/447f03338391d696fada9986b1623056.png)

在onLoad中设置sleep，大致在动画播放完成时正好让弹窗可见，达到视觉效果。

  

动画结束位置、阴影表达：通过布局样式定位。

![图片](./images/9589cba4dce5fb3d2e83c570f6c0f7d9.jpeg)

![图片](./images/fafec22b2bafc8ab54088ece53295f5c.png)

![图片](./images/f8f8aedf51a8aabebb86707f20b54257.png)

![图片](./images/68b674b0b7c511449eddc4e4e110e4b2.png)

![图片](./images/0798abb757c7799dbdfb429b02e30af0.png)

最外层样式itemsPop设置position：relative；动画和pop主体平级，动画样式设置position：absolute。

  

使用relative为子组件提供一个“锚点”

![图片](./images/005c2b785ab5b281abf262fea8927df3.png)

![图片](./images/df37e318c03413892f23ae88efba4f92.png)

通过过程中和AI的不断交互，补充知识盲区，最终实现效果。

  

#### 2\. 飞入动画实现

原始诉求：点击或者关闭时，Pop需要缩放收入二排的单品返坑位。

![图片](./images/52be748fc076847dbd533675b8cb2da5.png)

  

具体实现：计算飞入动画的开始和结束位置，调用飞入动画函数，给定动画时间，复用已有的飞入动画组件。

![图片](./images/dd65bdcc6646cd816e552f680d5e34e3.png)

  

AI实现过程遇到的问题（谁写的Bug谁修 ![图片](./images/97b1299acf37ac0fd203c94279a923a8.jpeg) ...AI修）：

- 先关闭了弹窗，然后再获取起始位置，导致无法获取开始位置，动画不生效
  
  ![图片](./images/79bc49a8307a9995574739f8eae0dce7.png)
- 动画重复，一个弹窗缩放的，一个飞入二排的
  
  ![图片](./images/4fac6ab00efd2ab4c0daff0119b0bb1a.png)
- Pop动画和商品加载完成后，点击Pop无跳转效果
- 怀疑是动画添加后，覆盖了什么组件，导致点击事件失效；
- 让cursor增加点击事件日志，根据控制台输出的日志，排查问题；
- 调整lottie动画的z-index：1，Pop其他组件z-index调高，避免被覆盖。

![图片](./images/3f6de1a8abcf77592e7bc775d1683cd4.png)

![图片](./images/4aea65d22e5438a6c8b05657e1e372c6.png)

![图片](./images/e1ba2e1b1b13f88137492b49c71586a7.png)

###   

- ### Feeds商品插卡-签到首页Feeds和渠道卡片商品去重

  

Feeds去重服务端处理，但需要前端请求Feeds接口时带上已曝光的商品列表

- 签到首页：携带单品返现渠道卡片曝光商品
- 单品返渠道卡片：携带首页Feeds曝光商品

![图片](./images/7c87c09cc839916fcdbbf9ebd522c0cc.png)

![图片](./images/38e32f16e47c1dbd2be57f5c74144665.png)

  

实现过程中遇到的问题与优化：

#### 1\. 预期的预加载的逻辑和实际不符

签到首页Feeds有预加载逻辑，在首次进入页面或者下拉刷新时，请求Feeds第一页时，会预加载第二页请求，通过Feeds插件配置实现，但实际表现是：当用户在首页加载完成后，滑动页面，加载完第二页后，才会加载单品返现插卡商品。

  

写让cursor确认下逻辑

![图片](./images/52b24db213ba26d3614f11203a9235ee.png)

![图片](./images/b994c5bfef18fd046637bd712be3afbb.png)

![图片](./images/121333802c6444f433e4b6b575e08546.png)

![图片](./images/1bc03319521d072d7d941b21ba1d0808.png)

  

看起来链路上一切都没问题，那就继续找吧

![图片](./images/9798cd99e5efcba3e3bbf448e944a8be.png)

  

说是状态判断的问题：

![图片](./images/6fbf8e9cbe16333fca93a8673e5738e0.png)

  

修复了之后依旧有问题，继续找

![图片](./images/6b7155c4212e540f4c7e291a710e9c57.png)

![图片](./images/584c1cd6e71575b77d167caed1388da4.png)

  

重复请求的问题fix了，没解决滑动加载的问题

![图片](./images/6d2109b80650e0ab9acd6f8c5fdd7a9e.png)

![图片](./images/c720fa776b955994c62b1c4c6ee73d3a.png)

给出了修复方案，但依旧未解决，甚至罢工了。。。。

  

AI解决不了，那就“开发”看看...

看组件的实现逻辑，FeedsList -> hudong-common-feeds中的InfiniteList -> coinhub-react-infinite-list中waterfallList

![图片](./images/aa66e40c99edb124687ab49ae8a8d86e.png)

  

hudong-common-feeds:

![图片](./images/55ec662d301a7f5af658ad0f4de845b3.png)

  

coinhub-react-infinite-list包：

![图片](./images/777ebe78e7257bec8ecbf112111fd87c.png)

  

找到Feeds初始化逻辑

![图片](./images/b2cd1dab1b023aa32ebd171241807d17.png)

  

让cursor帮忙确认这里逻辑：

![图片](./images/279a579bbcc6d017035ce9b907fc8950.png)

  

到这里，大概明确了问题原因，CSR链路下，在预发环境下，受Feeds接口请求耗时的影响，预加载会失效，只有等待用户翻页，才会继续请求，SSR链路下，没问题。总结：组件的代码，首次请求和预加载的执行是同步的，但请求feeds接口是异步的，会存在预加载失败的问题，应该等待首次请求结束后，再执行预加载。

  

#### 2\. 首页Feeds直通车回退插卡，导致单品返插卡商品刷新

问题表现是：直通车回退时，商品卡片商品刷新。先和cursor交互，先定位问题，梳理逻辑，再解决问题。

![图片](./images/1b6e63658181790cfe830f610a47b9d1.png)

![图片](./images/ab136b7764253243a8835bbaf856ea68.png)

![图片](./images/05a08aca074f0a3e9b4395f05600f200.png)

![图片](./images/ef927b065003d08a07256f05e77fbb4c.png)

![图片](./images/e4723c513c2f6b2a3bdef69ef3efa1ed.png)

![图片](./images/7b4b9e724841bf01615367096d029f1e.png)

  

再确认逻辑，确认其他优化：

- 数据请求失败，不清空数据，只清楚标识，允许重试
- updateFeedsData事件：清空数据

问题总结：

- 核心问题：单品返渠道插卡作为主页Feeds依赖的子组件，数据只需要请求一次，但因为依赖数组中包含了首页曝光商品，直通车回退时
- 曝光商品改变
- 组件重新挂载（点击的商品在渠道卡片之前），导致状态丢失，接口重新请求
- 解决方式：将渠道卡片的Feeds请求的状态和数据提升到父组件中，保证当前会话不变。

####   

#### 3\. 页面加载状态优化

因为首页需要商品去重，首页单品返渠道卡片Feeds的请求和主页Feeds存在时序，cursor一开始实现时，采用双状态：page1Loaded、page2Loaded来分别记录页面的加载状态，但综合来开，最后对状态的使用时机，单个状态即可满足要求，让AI帮忙优化。

![图片](./images/c9062464369033046f2fc541e4e99d45.jpeg)

加载单品返Feeds判断

  

![图片](./images/9e2d3a9c3eb7dd06fc09e2ba83afb927.png)

![图片](./images/e9561b6cd382d4304cee23aac046c097.png)

![图片](./images/e06a5c80abdc5ea76993441c2c4d7c5b.png)

![图片](./images/995f15026ee4e3bc6e747298e968b52a.png)

紧急撤回...

  

![图片](./images/37ced2abdfaa801f9c8d204f745c62bc.png)

给我急得...

  

![图片](./images/7ad0a918252e9ac887b71c1938f7722e.png)

#### 都这么说了，蒜了蒜了

####   

#### 4\. 单品渠道卡片区分单商品和多商品，组件优化

AI在实现时，是根据不同的渠道卡片不同的biztype，使用不同的css样式，来完成不同卡片样式的渲染，但服务端的经验告诉我们，应该抽出可复用的组件。让cursor抽取组件相同的样式文件、公共参数等，使得结构更加清晰。

![图片](./images/a6e646f6b6ea3bdba141e8c5d16b566b.png)

![图片](./images/785461708c749e10d4bed15ed8bc346b.png)

![图片](./images/18efb3118e49283d9fd5bd910a78e33d.png)

##   

## ▐  STEP 5: 视觉验收、埋点

##   

验收过程，测试阶段，通过截图或者让视觉体验，发现问题，根据要求修改。

![图片](./images/27ad28a866badaf51a859fae18130228.png)

![图片](./images/b63b09612973fbda11b731121cf3dafa.png)

![图片](./images/91b8f8277f98fc97812199bf8b962ff7.png)

  

埋点，让PD梳理好埋点相关信息，让AI执行，去埋点平台验证。

![图片](./images/af7fcc9e7abedcb1014f7a49535a67fa.png)

#   

![图片](./images/3ce5a1e6a0fc2d8fd804f676ef791be4.png)

总结

#   

AI coding充满想象力，也不断拓展着技术的边界。从这个具体的业务需求实践去看，虽然遇到了各种各样的问题，但借助AI去梳理逻辑、定位问题，在不需要完备的知识体系背景下，也能最终解决问题，达到预期效果，但还是会走不少弯路。所以全栈交付的过程中，还是建议去多了解技术栈的基础知识，再搭配AI工具，会更加的游刃有余。

  

还有一个AI coding问题排查的心得：描述问题，让AI去增加日志埋点，然后直接把控制台的输出丢给他。

  

![图片](./images/72c53265aeb0157276cdb7f4e69a6dc3.png)

![图片](./images/b4218306e3e70175e604d599d70a935a.png)

#   

![图片](./images/864ebf2fffe946fbc37ac8f0cbdef9b9.png)

团队介绍

##   

本文作者凌由，来自淘天集团-用户互动团队。团队支撑数亿级用户的互动业务（淘金币、芭芭农场、红包签到）的产品能力建设及演进，支持双十一、春节大促互动玩法的架构和开发，保障数亿权益的精准发放，通过多种互动形式提升用户规模和订单增长。我们正承担着捍卫电商主板块增长的重要使命，是阿里核心电商战场的参与者，用持续的技术创新来驱动阿里电商引擎的稳步前行。

  

  

  

**¤** **拓展阅读** **¤**

  

[3DXR技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=2565944923443904512#wechat_redirect) | [终端技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1533906991218294785#wechat_redirect) | [音视频技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1592015847500414978#wechat_redirect)

[服务端技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1539610690070642689#wechat_redirect) | [技术质量](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=2565883875634397185#wechat_redirect) | [数据算法](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1522425612282494977#wechat_redirect)
