---
title: "支配树算法原理及鸿蒙工具实践"
link: "http://mp.weixin.qq.com/s?__biz=MzAxNDEwNjk5OQ==&mid=2650542401&idx=1&sn=dce712be10c396be13745be4edd757e8&chksm=8390d959b4e7504f3861072f2195d3e9ce345c219eb9eff9a59f8bb5b4c8dac675cc86550a83#rd"
date: 2026-01-14
md5: 83a299d776844dc7f542f96017cd1d20
---

# 支配树算法原理及鸿蒙工具实践

![图片](./images/bf9f3706ad70860c352c2df62702ccb0.gif)

  

  

  

本文介绍了支配树（Dominator Tree）算法在鸿蒙系统 ArkTS 内存分析工具中的应用。为应对淘宝 App 鸿蒙版因内存溢出导致的 Crash 问题，作者构建了一套从客户端采集内存快照、服务端自动分析的工具链。文中对比了多种支配树构建算法（如朴素算法、Lengauer-Tarjan 算法和迭代算法），并说明选用优化后的迭代算法的原因：实现简单、便于验证、且适合存在大量循环引用的内存图结构。  

  

![图片](./images/f37fdf1ea916bf33d85f9753ab39887f.webp)

前言

  

随着淘宝App鸿蒙版UV⽇渐增⻓，ArkTS的内存溢出导致的Crash也在逐步上升，因此，团队实现了⼀套从客户端采集内存镜像⾄服务端⾃动分析聚合⼯具。本⽂介绍该⼯具的核⼼原理：内存对象的⽀配树算法  

  

## **▐**  **⽀配树是什么**

  

在⼀个有向图中，存在⼀个⼊⼝节点![图片](./images/e687060d4140150835edcc04ebf40c64.jpeg)，如果节点![图片](./images/14d3c2ad9f5ceeb3d347dcaa82d71e50.jpeg)⽀配节点![图片](./images/cc6f8146f992c4bf2403de12f0ceea11.jpeg)，当且仅当从![图片](./images/6374598a452490633b8536ac46c4088e.jpeg)→![图片](./images/e8de0f0f5fb664b516c2c380a2923444.jpeg)的所有路径都经过节点![图片](./images/2ab72dc5623fb49f3cac57c429fa083d.jpeg)，记![图片](./images/4d22220eb469b076632cd6414d7ffe82.png)如果不存在![图片](./images/30239e74f224ef9f438799fe1ae77fcf.jpeg)使得![图片](./images/75cf30ebee451c4db5ff6ba1ce2de34e.jpeg)且![图片](./images/66e588e23a261ac5600f5fd4952bd44e.jpeg)，则![图片](./images/58c09849d6e1d3ff3e80bbedfd242a30.jpeg)是![图片](./images/e0b1b650f9feed9ffd79eaa7b3eafc4b.jpeg)的直接⽀配节点，记做![图片](./images/8af5b6ea1119b1941729a76e2b65ff4a.jpeg) 。从⼊⼝![图片](./images/3e215bd960f677312190ea2afaa6c14b.jpeg)通过直接⽀配节点形成的树则称为⽀配树，即⽀配树中每个节点的⽗节点都是其直接⽀配节点。

。

▐  **⽀配树作⽤**

  

在分析内存泄漏或者内存溢出的时候，内存镜像中的对象通常会很多(数量可达百万)。⾸要的问题是如何找出占⽤内存较⼤那些对象，对象占⽤内存可以分为两类：

```code-snippet__js
class B {
  int c;
}
class A {
  B b = new B();
}


A a = new A();
```
  

1. ![图片](./images/8c4999dd9523529affbee371abb59bce.jpeg) ，指的是对象本身的内存⼤⼩。上⽅代码中，a对象中有⼀个引⽤指针b，![图片](./images/2da43c826fa4fab05bffcf174fab4677.jpeg)为4bytes。b对象中有⼀个变量c，![图片](./images/dc8aa619787c12b27c28569c6f95fdf7.jpeg)为4bytes
2. ![图片](./images/6ec4134d26dc0bdeb9db012c08caeae6.jpeg)，指的是回收该对象之后虚拟机能够回收的内存⼤⼩。a对象的![图片](./images/8bfac27dd348955f912bfc3697b6b822.jpeg)为8，释放a之后可以同时释放b，所以
  
  ![图片](./images/21110ffb7516c92d616a593c9e87ffda.jpeg)

  

显然，只要将那些![图片](./images/f0321fe57657252fd0285e2663410439.jpeg)占⽤较⾼的对象回收掉就可以解决内存溢出的问题。如果将对象抽象为有向图中的节点，对象间的引⽤关系则可以抽象为有向图中的边，例如上⾯的代码，a对象引⽤b对象，可以抽象为下图。

  

![图片](./images/bdeb2b4da541573dcb30658e2fe93bd8.png)

  

因此，内存镜像中的对象集合可以抽象为以GC root为⼊⼝节点的有向图，通过有向图构建出对应的⽀配树。假设在⽀配树中![图片](./images/456a1adbefbc55e0dcce378b6190d6ce.png)，根据⽀配树的特性，回收 a 对象，![图片](./images/e7ffe5facf29b24449a64f36dbcffaf9.jpeg)在内存中就成了孤⽴对象可以被GC，由此可以得出：

![图片](./images/744f12c42fe4beb368f3b6d3c8e314ca.png)

  

▐  **⽀配树算法种类**

  

1. 朴素算法，原理是对每个节点![图片](./images/350c4e6a6707ebc4282fbf8ce4d4a833.jpeg)，依次删除图中的其他节点，判断是否存在路径从根节点到达节点![图片](./images/3f1cdf47e06a69126ff9ebfc5c8781e6.jpeg)，算法复杂度为![图片](./images/6e385910c878f2911d450548383dc047.png)，复杂度过⾼，⼀般不使⽤。
2. Lengauer-Tarjan算法，经典的⽀配树算法，⼀般情况是![图片](./images/f5a7b5e4bd7199b9e66277deac6294a8.jpeg)优化后的算法复杂度![图片](./images/7a3ecbfe2622488f6c4247d870aef5f8.jpeg)， α 是阿克曼函数，可以理解为趋近于线性![图片](./images/9d38c744e051350be5c909dee59a542f.jpeg)。
3. 迭代算法，通常是用于在编译器的控制流当中，算法复杂度是![图片](./images/e68e85b7600bb6a80603356a1f9969e1.jpeg)，优化后算法复杂度![图片](./images/77de7e5429cab554295c958213edc8d3.jpeg)。

  

实现鸿蒙ArkTS内存镜像分析⼯具使⽤的是迭代算法，主要有以下⼏个原因：

1. Lengauer\-Tarjan算法原理及其优化⽐较复杂，⼯具类对于构建⽀配树的速度要求没有那么⾼；
2. 可以使⽤华为已实现的proﬁler插件以及chrome的开源代码作为对⽐，防⽌算法出错；
3. 在内存对象的引⽤关系中，存在很多循环引⽤，节点与节点之间的环⽐较严重，这让Lengauer-Tarjan算法在计算半⽀配节点的时候算法复杂度⼤⼤增加。

  

![图片](./images/5658abb9b289af65d23b784d1482f0a4.png)

Lengauer-Tarjan算法原理

  

介绍Lengauer-Tarjan算法的主要原因是⽹上对于该算法的介绍⼤部分证明过程都是论⽂翻译⽐较复杂，包括有时AI的解答也存在错误。

![图片](./images/d2266555a770f88a742590155f1b6678.png)

例如上⾯是⼀个AI关于半⽀配者的定义描述错误，正确的描述应当是所有节点的DFS编号都⼤于x。

  

▐  **基础知识**

  

下⾯是⼀张有序图通过DFS之后形成的节点和边的关系图，节点0-10是dfs遍历的顺序，下⾯称为dfs序，边的类型可以分为4种：

1. 树边，即DFS过程中建⽴的边，在下图中显示为⿊⾊；
2. 前向边，即祖先节点到⼦树⾮⼉⼦的边，在下图中显示蓝⾊,  2->6，1->4，0-\>2；
3. 返祖边，即节点到祖先节点的变，在下图中显示为橙⾊，4->2,3->2,6-\>2；
4. 横叉边，即从⾮⼦树、⾮祖先横叉过来的边，在下图中显示为绿⾊，8->5,9-\>8。

  

![图片](./images/2b7af044b71d3afef0d9a2bcfbdd1d21.png)

  

▐  **理**解半⽀配节点

  

如何理解半⽀配节点是理解Lengauer-Tarjan算法关键点，以下是半⽀配节点![图片](./images/4d1ef822dbc02fc112111496b20dc6a3.png)的定义：  

> 对于任意节点![图片](./images/8096e654631d2de52d6d307b728080f2.jpeg)，如果存在一个节点![图片](./images/eeaa1f88dda39c2a9169a2eb2d083c18.png)，且![图片](./images/ad54eb96b27c0384bf9094083c034714.jpeg) 的路径中所有节点![图片](./images/a1529d24aed8c7e0ebbf3ecebb5c3235.png)（![图片](./images/1166832cf8f0d4b49589c91f99c5775a.png)节点可以不存在)的序号都大于![图片](./images/5a7f8edc88e073fab24e2000bcb29e8a.jpeg)，则![图片](./images/f0fed47c4882a87335aea801baa7b844.jpeg)是![图片](./images/9dd50c48f60126d7913c67b4193aaccc.jpeg)的半支配候选，其中dfs序最小的![图片](./images/f111f3fece01b12ec31c60af80d9f82f.jpeg)被称为![图片](./images/ea48dd8d389217f5e49239729ca6c278.jpeg)的半支配节点。

  

在基础知识中介绍过4种边的类型，对于任意节点![图片](./images/8a03575476dcf2fbab98a47728fcc8d0.jpeg)的半⽀配节点可以理解为是通过这四种边到达![图片](./images/540cd426b58d9539a0700528fb70dbd6.jpeg)最远祖先节点(⽐当前节点dfs序⼩的节点只有可能是祖先节点或者左⼦树节点，dfs必须遍历完左⼦树再遍历右⼦树，左⼦树节点不可能存在到右⼦树节点的边，只可能是祖先节点)。由半⽀配节点的定义可得：

1. ⽗节点是半⽀配候选，例如: 3-\>5
2. 前向边的节点是半⽀配候选，例如: 2-\>6
3. 返祖边的节点是半⽀配候选，例如：1->4-\>2
4. 横叉边的节点是半⽀配者选，例如: 1->7->8-\>5

换个说法，整个半⽀配候选的集合是![图片](./images/b4d3cdb2c19d266e0c07b341946bee5c.jpeg)的直接⽀配者，更进⼀步，从半⽀配候选增加⼀条边指向![图片](./images/0d868322ae149c2a84b8788a18fe5885.jpeg)不改变![图片](./images/ace3c4c4fb3e285b72c8f046e6a3bc22.jpeg)的⽀配关系，于是对于任意节点![图片](./images/e7c2c83ddd4d1d29c49294053de50366.jpeg)，都可以简化为下⾯的连接关系，其中

![图片](./images/95f5a1898e025c9715cba2e3139250be.png)

> 隐含的结论: 半⽀配候选都是在 ![图片](./images/1fb6d0d670f4b89e78dcf18388257220.jpeg)的树边上

  

![图片](./images/69f3702ef91a08bbf6f7c18e7ffb8c12.jpeg)

  

▐  计算直接⽀配节点

  

半⽀配节点![图片](./images/1c34cd4931452cd54df1deba03f0a385.jpeg)还不能直接⽀配节点，因为还不⽀配![图片](./images/0a9b0de3b30ffa3b6026524313d96679.jpeg)的树边，例如上⾯的dfs序为5的节点，它存在树边(3->5)和横叉边(1->7->8->5)，通过定义可以算出它的半⽀配节点![图片](./images/ac572b1ed224931dbe3369dc643b9ab5.png)。但实际上还存在0->2->3->5这条路径不经过1号节点，实际上![图片](./images/2f1ccf69a992b2d2ff74a18f1d2962f3.jpeg)。

计算直接⽀配节点的⽅式，计算从半⽀配节点出发经过树边到达![图片](./images/c6084b20221db60177a2b3b5b2d23270.jpeg)节点所有中间节点![图片](./images/ab3937da785d1418e7b08a9700b93e21.jpeg)的![图片](./images/3a1d866c1f068e2e71153d7aa97cb5dd.jpeg) 的最⼩dfs序![图片](./images/36b06a1ac2e4e49606416a52cf01045b.jpeg)。

![图片](./images/9a14125ccce7337a8dbaf8c073709d80.jpeg)

  

在论⽂中，这两个结论是通过反证法来进⾏证明，⽐较难理解，这⾥尝试通过⾃然语⾔来进⾏证明，不保证完全正确，如有错误，请以论⽂为准。

  

1. ![图片](./images/6bf31540c5c5b7382127195a88f8f306.jpeg)⽐较好推导，说明不存在有![图片](./images/aa62295a031fd1286f4cbcd2d03649e7.jpeg)的祖先节点不通过![图片](./images/5a200b2307c81e3f75b01692f02ac8b1.jpeg)到达![图片](./images/d162c63cb7f8481ac0d50a193f1da3f5.jpeg)，⼜由于半⽀配集合都是处于![图片](./images/b722b4b71580658190cd65d165dcae39.jpeg)的树边上，所以到达半⽀配集合都得通过![图片](./images/fe591db6dbe2b9afbc4d1cbaaefacc03.jpeg) ，故![图片](./images/5bb64af4044f4d1f152549bfe044cae4.jpeg)
2. ![图片](./images/c73c5a8e2c721538cb58a1868f9ff255.jpeg)说明⾄少存在⼀个节点![图片](./images/d5fbc655cd113c581d70ca43d2c46bf4.jpeg)不通过 ![图片](./images/ca6bec1d871a6e47bf4e34fe20b245bc.jpeg)可以到达节点![图片](./images/e6fe9793afa970a25eb638eac97c9141.jpeg)，其中![图片](./images/f95c318c9fa923f4a54470aece1bbfbd.jpeg)，可以证明 ![图片](./images/e28a985e6f3ab9cc4274f498ecf2bb27.jpeg)不⽀配![图片](./images/6b32480de2b092ac6990c78ef2ef2d80.jpeg)，可以⼤致得到下图的节点关系，最主要问题是为何不需要考虑其他![图片](./images/6ed41673e53d98c4861f2851d39be709.jpeg)的情况，例如：![图片](./images/987a182ae0270057bbd81b85952af80d.jpeg)。可以假设![图片](./images/7574a631bd000e9bee267c1744a35b25.jpeg)，则存在![图片](./images/fabfa0e009910d276ff707ba433a0165.jpeg)不经过![图片](./images/5fffb0719faf3d31a3317eefe46b9725.jpeg)到达![图片](./images/3b6d09024481015d536e6ab1c581e5ec.jpeg)，但是该条路径必须经过![图片](./images/df0b88a4df9f65df931ec6aaa75035c4.jpeg)的半⽀配候选集，根据前⾯半⽀配节点隐含的结论，![图片](./images/48330663c28f5dd13a80d8843a83fae0.jpeg)的半⽀配候选集都在![图片](./images/11f579716d85f647e205ee708dd92bac.jpeg)的树边上，且![图片](./images/b5856cb8847e113cda65ade49bcce26e.jpeg)，由于![图片](./images/db9dd2248ef139109c8be62af487f5f6.jpeg)存在树边到达![图片](./images/6ae54612a241dcd1d9054583a3c684fc.jpeg)，这与![图片](./images/1db614ae094f18c18ff771144d711d79.jpeg)的定义相悖，故![图片](./images/a8e259d72234ff074b59c4c23405653e.jpeg)。

  

![图片](./images/c93f07eb27b644b738c8dbd9735f0dfe.png)

  

Lengauer-Tarjan算法实现代码可以参考 Android perﬂib（cs.android.com/android-studio/platform/tools/base/+/mirror-goog-studio-main:perflib/src/main/java/com/android/tools/perflib/heap/analysis/LinkEvalDominators.kt）

  

![图片](./images/586c4011536856b66fce8dd568230fdc.png)

迭代算法

  

▐  算法原理

  

迭代算法的原理利⽤了⽀配节点存在传递性，即![图片](./images/09db53a1b639749fe86fbec4d0342a49.jpeg)⽀配节点![图片](./images/3021eeca8540077d7806b7652479101d.jpeg)当且仅当⽀配其前驱节点![图片](./images/36b65c8b50f23b7d701c4c53be212a68.png)，简要⽤公式表达:

![图片](./images/962e5b33e6ccac0df59f0e51d7165378.jpeg)

迭代算法过程如下

> 1\. 初始化根节点 s , Dom(s) = {s}
> 
> 2\. 初始化其他节点 n ， Dom(n) = {全集}
> 
> 3\. 对于⾮根节点 n ， Dom(n) = n ∪ (∩Dom(p)) ，即当前节点 n 并上所有前驱节点 p的⽀配节点的交集
> 
> 4\. 重复步骤3，直到所有的 Dom(n) 不再变化

  

▐  JS内存镜像分析

  

js内存镜像实际上是⼀个json⽂件，分为以下⼏个部分

```code-snippet__js
{"snapshot":
{"meta":
{"node_fields":
["type","name","id","self_size","edge_count","trace_node_id","detachedne
ss","native_size"],
"node_types":
[["hidden","array","string","object","code","closure","regexp","number",
"native","synthetic","concatenated
string","slicedstring","symbol","bigint"],"string","number","number","nu
mber","number","number"],
"edge_fields":["type","name_or_index","to_node"],
"edge_types":
[["context","element","property","internal","hidden","shortcut","weak"],
"string_or_number","node"],
"trace_function_info_fields":[...],
"trace_node_fields":[...],
"sample_fields":[...],
"location_fields":[...]
},
"node_count":100056,
"edge_count":384773,
"trace_function_count":0
},
"nodes":[...],
"edges":[...],
"trace_function_infos":[],"trace_tree":[],"samples":[],"locations":[],
"strings":[...],
}
```
  

- meta: 定义了节点和边的结构
- node\_ﬁelds: 定义了单个内存节点(node)的属性
- node\_types:内存节点(node)的类型
- edge\_ﬁelds:定义了单个边(edge)的属性
- edge\_types: 定义了边的类型
- node\_count: 节点数量
- edge\_count: 边的数量
- nodes: 节点的集合
- edges: 边的集合
- strings:所有的字符串，包括边的名称，内存节点的名称等等

  

- 内存节点node

  

在nodes中，每⼀⾏代表⼀个节点，其中⾏中的每个数字由node\_ﬁelds来描述，例如：

```code-snippet__js
"node_fields":
["type","name","id","self_size","edge_count","trace_node_id","detachedne
ss","native_size"],


"nodes":[9,11693,1,0,6386,0,0,0
,8,11696,3,48,1,0,0,0
,8,11696,5,48,1,0,0,0
,...]
```
以第⼀⾏ 9,11693,1,0,6386,0,0,0 为例，解析后是这样

```code-snippet__js
type: 9, //节点类型的偏移
name: 11693, //节点名字，大概率是文件名，对应strings中的index
id: 1, //无特殊含义，节点的标号
self_size: 0, //大概率是shallow_size，0大概率是数组
edge_count: 6386, //跟其他内存节点的引用关系
```
nodes\_type存储了节点的14种类型，这个例⼦中，节点的类型是synthetic，不过这种类型似乎是虚拟机内部类型，不展示

```code-snippet__js
"node_types":
[["hidden","array","string","object","code","closure","regexp","number",
"native","synthetic","concatenated
string","slicedstring","symbol","bigint"],"string","number","number","nu
mber","number","number"],
```
strings存储了所有的字符串，包括了节点名字，在这个例⼦中name转为字符串是SyntheticRoot。

  

- 引⽤关系edge

  

edges中存储了内存节点的引⽤关系，每⼀⾏代表⼀条边，⾏中的每⼀个数字通过edge\_ﬁelds进⾏表示

```code-snippet__js
"edge_fields":["type","name_or_index","to_node"],


"edges":[5,11673,527080
,5,11673,527072
,5,11673,527056
,...]
```
type存储的边的类型，也是节点之间引⽤关系的类型，例如：第⼀⾏的例⼦代表这条边的类型是⼀个shotcut

```code-snippet__js
"edge_types":
[["context","element","property","internal","hidden","shortcut","weak"],
"string_or_number","node"],
context //暂时没有用处
element //DOMTree中的元素
property //类当中的属性
internal //内部属性
hidden //隐藏属性
shortcut //和property中差不多，通过赋值得到的引用
weak //弱引用
```
name or\_\_index存储的是strings中的名字index，11673对应的是-subroot-字符串to\_node代表的是这条边指向的节点索引，因为内存引用构成是一个有向图，所以还需要知道这条边来自于哪个节点。**边属于哪个节点的计算是通过内存节点索引**+**边来进行计算的，举个例子：如果一个节点的序号是**0**，有**10**条边，那么**edges\[0,10)**就是属于节点**0**的，如果序号**1**的节点有**5**条边，那么**edges\[10,15)**就是属于节点**1**的。**

  

▐  构建边的索引

  

内存节点的属性edge\_count，代表该节点持有的边的数量，由此可以算出每个节点持有边的索引范围\[ﬁrstEdgeIndexes\[nodeOrdinal\], ﬁrstEdgeIndexes\[nodeOrdinal+1\])

```code-snippet__js
private void buildEdgeIndexes() { 
    firstEdgeIndexes[nodeCount] = edges.length; 
    int nodeOrdinal = 0; 


    for (int edgeIndex = 0; nodeOrdinal < nodeCount; ++nodeOrdinal) { 
        firstEdgeIndexes[nodeOrdinal] = edgeIndex; 
        //nodes[nodeOrdinal * nodeFieldCount + nodeEdgeCountOffset]当前节点持有边的个数 
        edgeIndex += nodes[nodeOrdinal * nodeFieldCount + nodeEdgeCountOffset] * edgeFieldsCount; 
    } 


}
```
  

▐  构建前驱节点

  

构建前驱节点的算法⽐较巧妙  

1\. 遍历所有的边，找到边的toNode，然后计算toNode的前驱节点(retainer)的数量存储在 firstRetainerIndex 中，和firstEdgeIndexes类型，每个节点的前驱节点的范围也计算出来了，就是

\[ﬁrstRetainerIndex\[nodeOrdinal\], ﬁrstRetainerIndex\[nodeOrdinal+1\])

```code-snippet__js
int edgeLength = edges.length; 
for (int edgeToNodeIndex = edgeToNodeOffset; edgeToNodeIndex < edgeLength; edgeToNodeIndex += edgeFieldsCount) { 
    int toNodeIndex = edges[edgeToNodeIndex]; 
    if (toNodeIndex % nodeFieldCount != 0) { 
        TBPLogger.error("Invalid toNodeIndex is {}", new Object[] {toNodeIndex}); 
    } else { 
        int toNodeOrdinal = toNodeIndex / nodeFieldCount; 
        if (isValid(toNodeOrdinal, firstRetainerIndex.length)) { 
            firstRetainerIndex[toNodeOrdinal]++; 
        } 
    } 
}
```
  

2\. 遍历所有的节点，然后为前驱节点预留好位置，retainingNodes是前驱节点的集合

```code-snippet__js
int firstUnusedRetainerSlot = 0; 
for (int nodeOrdinal = 0; nodeOrdinal < nodeCount; ++nodeOrdinal) { 
    int retainerCount = firstRetainerIndex[nodeOrdinal]; 
    firstRetainerIndex[nodeOrdinal] = firstUnusedRetainerSlot; 
    if (isValid(firstUnusedRetainerSlot, edgeCount)) { 
        retainingNodes[firstUnusedRetainerSlot] = retainerCount; 
        firstUnusedRetainerSlot += retainerCount;  
    }
}
```
  

3\. 遍历所有的节点，再根据节点持有的边找到toNode，那么该节点就是toNode的前驱节点

```code-snippet__js
for (srcNodeOrdinal = 0; srcNodeOrdinal < nodeCount; ++srcNodeOrdinal) { 
    firstEdgeIndex = nextNodeFirstEdgeIndex; 
    nextNodeFirstEdgeIndex = firstEdgeIndexes[srcNodeOrdinal + 1]; 
    srcNodeIndex = srcNodeOrdinal * nodeFieldCount; 
   
    for (int edgeIndex = firstEdgeIndex; edgeIndex < nextNodeFirstEdgeIndex; edgeIndex += edgeFieldsCount) { 
        int index = edgeIndex + edgeToNodeOffset; 
        if (isValid(index, edges.length)) { 
            int toNodeIndex = edges[index]; 
            if (toNodeIndex % nodeFieldCount != 0) { 
                TBPLogger.error("Invalid toNodeIndex is {}.", new Object[]{toNodeIndex}); 
            } else if (isValid(toNodeIndex / nodeFieldCount, firstRetainerIndex.length)) { 
                //retainningNodes的起点 
                int firstRetainerSlotIndex = firstRetainerIndex[toNodeIndex / nodeFieldCount]; 
                //由后向前添加，直到retainingNodes[firstRetainerSlotIndex]变为了0 
                int nextUnusedRetainerSlotIndex = firstRetainerSlotIndex + (--retainingNodes[firstRetainerSlotIndex]); 
                if (isValid(nextUnusedRetainerSlotIndex, retainingNodes.length) && isValid(nextUnusedRetainerSlotIndex, retainingEdges.length)) { 
                    retainingNodes[nextUnusedRetainerSlotIndex] = srcNodeIndex; 
                    retainingEdges[nextUnusedRetainerSlotIndex] = edgeIndex; 
                } 
            } 
        } 
    }
} 
```
  

▐  计算节点distance

  

计算节点就是使⽤bfs进⾏遍历

```code-snippet__js
private void calculateDistances() {
    for (int nodeOrdinal = 0; nodeOrdinal < nodeCount; nodeOrdinal++) {
        nodeDistances[nodeOrdinal] = noDistance;
    }
    int[] nodesToVisit = new int[nodeCount];
    int nodesToVisitLength = 0;
    //遍历根节点
    for (int edgeIndex = firstEdgeIndexes[rootNodeIndexInternal];
         edgeIndex < firstEdgeIndexes[rootNodeIndexInternal + 1];edgeIndex += edgeFieldsCount) {
        int childNodeIndex = edges[edgeIndex + edgeToNodeOffset];
        int childNodeOrdinal = childNodeIndex / nodeFieldCount;
        if (isUserRoot(childNodeIndex)) {
            nodeDistances[childNodeOrdinal] = 1;
            bfsNodes[bfsIndex++] = childNodeOrdinal;
            nodesToVisit[nodesToVisitLength++] = childNodeIndex;
        }
    }
    //从根节点进行遍历
    bfs(nodesToVisit, nodesToVisitLength, nodeDistances);
    nodeDistances[rootNodeIndexInternal / nodeFieldCount] =nodesToVisitLength > 0 ? -1 : 0;;
    nodesToVisit[0] = rootNodeIndexInternal;
    nodesToVisitLength = 1;
    //遍历其他单独的节点，synthetic节点
    bfs(nodesToVisit, nodesToVisitLength, nodeDistances);
}
```
  

▐  构建⽀配树

  

chrome的开发者⼯具和鸿蒙IDE的proﬁler插件使⽤的都是优化过的迭代算法，参考论⽂《A  Simple, Fast Dominance Algorithm》，有两个重要的优化点：

1. 计算节点的Dom顺序不是采⽤先序遍历，⽽是采⽤逆后序进⾏遍历加速收敛。从基础知识那⾥可以得知dfs树有四种边，其中前向边和树边，先序遍历和逆后序遍历都是⼀次遍历就可以计算，对于返祖边，都是需要多次遍历才能计算，但对于横叉边，逆后序只需要⼀次遍历⽽先序遍历就要多次。
2. 在计算 Dom(p) 的交集的朴素算法是对所有前驱节点的⽀配节点⼀⼀查找匹配，这样的效率很低很低，甚⾄可以到达 O(n2) 。论⽂中提出了⼀个新的⽅案，由于前驱节点的dom树已经构建完成，例如下图dom(7) = {7,1,0}, dom(6) = {6,2,1,0}， dom(3) ={3,2,1,0}，此时求dom(5)，通过观察很容易发现dom(5)={5,1,0}。根据树的特点，求解 idom(n)就转换为求解n的前驱节点在⽀配树上的公共祖先节点。

  

![图片](./images/17ada4a8c4d23b2069d332b988c33785.jpeg)

  

这⾥给出论⽂中的伪代码⽅便理解。具体实现代码可以参考chrome的代码HeapSnapshot.ts（github.com/ChromeDevTools/devtools-frontend/blob/chromium/6194/front\_end/entrypoints/heap\_snapshot\_worker/HeapSnapshot.ts）

![图片](./images/28cca20c60cd10d9a921ca4b0f15fb24.png)

  

计算⽀配节点的核⼼就在intersect⽅法中，找当前节点的dom和前驱节点之间的最近公共祖先，优化后的迭代算法可以降低到![图片](./images/7d709ae37c09541e1ca92a44919a506e.jpeg)，m是遍历次数logn是⽀配树的深度，更进⼀步，如果m是⼀个常量的话，⼀般算法复杂度可以做到![图片](./images/ad88e1757623b06b8a5b584f7226ec43.png)。

  

▐  计算retainSize

  

retainSize就是如果通过GC释放这个内存节点，能释放的内存⼤⼩。计算⽀配树的⽬的就是确定节点的retainSize = 当前节点的shallowSize(⾃身⼤⼩) + ⽀配节点的retainSize。

```code-snippet__js
void calculateRetainedSizes(int[] postOrderIndex2NodeOrdinal) {
    int postOrderIndex;
    for (postOrderIndex = 0; postOrderIndex < nodeCount;++postOrderIndex) {
        retainedSizes[postOrderIndex] = nodes[postOrderIndex *nodeFieldCount + nodeSelfSizeOffset];
        if (nodeNativeSizeOffset != 0) {
            retainedNativeSizes[postOrderIndex] = (long)nodes[postOrderIndex * nodeFieldCount + nodeNativeSizeOffset];
        }
   }
   //后序遍历，让被支配节点先于支配节点计算retainSize
   for (postOrderIndex = 0; postOrderIndex < nodeCount - 1;++postOrderIndex) {
        int nodeOrdinal = postOrderIndex2NodeOrdinal[postOrderIndex];
        int dominatorOrdinal = 0;
        if (isValid(nodeOrdinal, dominatorsTree.length)) {
            dominatorOrdinal = dominatorsTree[nodeOrdinal];
        }


        if (isValid(dominatorOrdinal, retainedSizes.length) &&isValid(nodeOrdinal, retainedSizes.length)) {
            retainedSizes[dominatorOrdinal] +=retainedSizes[nodeOrdinal];
            if (nodeNativeSizeOffset != 0) {
                retainedNativeSizes[dominatorOrdinal] +=retainedNativeSizes[nodeOrdinal];
            }
        }
    }


}
```
  

▐  聚合计算

  

虽然最难的部分⽀配树已经计算完成，但还需要将引⽤链聚合起来，⽅便⼈⼯分析和上报到平台进⾏⾃动化分析。

具体流程如下：

1\. 先遍历所有节点，拿到所有节点的stringIndex，根据stringIndex进⾏聚合，可以得到对象类型的retainSize和个数，然后进⾏过滤掉⼀些泄漏不多的对象类型，得到⼤对象类型。

```code-snippet__js
public Map<Integer, ConstructorNode> getBigHeapNode() {
    Map<Integer, ConstructorNode> heapNodes = new HashMap<>(nodeCount);
    for (int nodeOrdinal = 0; nodeOrdinal < nodeCount; nodeOrdinal++) {
        int nodeIndex = nodeOrdinal * nodeFieldCount;
        if (isHidden(nodeIndex)) {
            continue;
        }
        if (isSynthetic(nodeIndex)) {
            continue;
        }
        int stringIndex = nodes[nodeIndex + nodeNameOffset];
        if (heapNodes.containsKey(stringIndex)) {
            ConstructorNode heapNode = heapNodes.get(stringIndex);
            heapNode.addRetainedSize(1, retainedSizes[nodeOrdinal]);
        } else {
            String constructorName = strings.get(stringIndex);
            if (HarmonyAnalyzeUtils.containsTaobao(constructorName)) {
                ConstructorNode heapNode = new ConstructorNode(stringIndex, constructorName, 1,retainedSizes[nodeOrdinal]);
                heapNodes.put(stringIndex, heapNode);
            }


        }
    }
    ConfigParams configParams = CmdArgs.getInstance().getConfigParams();
    Map<Integer, ConstructorNode> bigNodes = new HashMap<>();
    for (ConstructorNode heapNode : heapNodes.values()) {
        if (heapNode.getRetainedSize() >= configParams.minRetainedSize || heapNode.getCount() >= configParams.minLeakCount) {
            bigNodes.put(heapNode.getStringIndex(), heapNode);
        }
    }
    return bigNodes;
}
```
  

2\. 重新通过bfs的顺序遍历节点，如果是⼤对象类型就进⾏回溯，找到到根节点的路径并记录下来，最后进⾏根据引⽤路径进⾏聚合成aggregatedRefTree。

```code-snippet__js
private void aggregateReferenceTree() {
    Map<Integer, ConstructorNode> bigNodes = getTBHeapNode();
    //对节点进行bfs
    for (int i = 0; i < bfsIndex; i++) {
        int nodeOrdinal = bfsNodes[i];
        int nodeIndex = nodeOrdinal * nodeFieldCount;
        int stringIndex = nodes[nodeIndex + nodeNameOffset];
        if (bigNodes.containsKey(stringIndex)) {
            Map<String, List<ConstructorNode>> referenceTrees = new HashMap<>();
            calculateReferenceTree(nodeOrdinal, new StringBuilder(), new ArrayList<>(), referenceTrees);
            for (String key : referenceTrees.keySet()) {
                List<ConstructorNode> refChain = referenceTrees.get(key);
                if (aggregatedRefTree.containsKey(key)) {
                    ConstructorNode cached = aggregatedRefTree.get(key).get(0);
                    //相同节点的链路不用相加
                    if (cached == refChain.get(0)) {
                        continue;
                    }
                    cached.addCount();
                    cached.addRetainedSize(retainedSizes[nodeOrdinal]);
                    cached.addShallowSize(nodes[nodeIndex + nodeSelfSizeOffset]);
                } else {
                    if (!refChain.isEmpty()) {
                        aggregatedRefTree.put(key, refChain);
                    }
                }
            }
        }
    }
}
private void calculateReferenceTree(int nodeOrdinal, StringBuilder pathKey, List<ConstructorNode> refChain,
                                        Map<String, List<ConstructorNode>> referenceTree) {
    int nodeIndex = nodeOrdinal * nodeFieldCount;
    int stringIndex = nodes[nodeIndex + nodeNameOffset];
    pathKey.append(stringIndex).append('-');
    ConstructorNode node = new ConstructorNode(stringIndex, strings.get(stringIndex), nodeDistances[nodeOrdinal]);
    refChain.add(node);
    if (nodeDistances[nodeOrdinal] == 1) {
        String key = pathKey.toString();
        List<ConstructorNode> newRefChain = new ArrayList<>(refChain);
        referenceTree.put(key, newRefChain);
        return;
    }
    List<Integer> retainers = findRetainers(nodeOrdinal);
    for (Integer retainer : retainers) {
        StringBuilder newPathKey = new StringBuilder(pathKey);
        List<ConstructorNode> newRefChain = new ArrayList<>(refChain);
        calculateReferenceTree(retainer, newPathKey, newRefChain, referenceTree);
    }
}
```
  

![图片](./images/c74f562aeb4e1b559546ecba861176ee.png)

总结

  

⽀配树算法属于是内存泄漏/溢出分析的核⼼算法，我们基于此算法实现鸿蒙ArkTS内存镜像分析⼯具，希望本⽂对⼤家实现类似功能的⼯具有⼀定帮助。

  

![图片](./images/325f772acbb8c43e6ef168952f77c1e6.png)

参考⽂档

  

- 《A Simple, Fast Dominance Algorithm》：
  
  https://www.cs.tufts.edu/~nr/cs257/archive/keith-cooper/dom14.pdf
- 《A New, Simpler Linear-Time Dominators Algorithm》：
  
  http://adambuchsbaum.com/papers/dom-toplas.pdf
- 《A Fast Algorithm for Finding Dominators in a Flowgraph》：
  
  https://faculty.cc.gatech.edu/~harrold/6340/cs6340\_fall2009/Readings/lengauer91jul.pdf

  

![图片](./images/828e1b90733487ce309ebfc66c812352.png)

团队介绍

  

本文作者灵貎，来自淘天集团-终端平台基础工程团队，团队负责淘宝App基础架构和基础链路业务，致力于通过技术创新和系统优化，打造一个更稳定、更流畅的手机淘宝。同时我们也在持续探索通过AI搭建高效、智能的研发体系，提升团队的研发效能。

  

  

**¤** **拓展阅读** **¤**

  

[3DXR技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=2565944923443904512#wechat_redirect) | [终端技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1533906991218294785#wechat_redirect) | [音视频技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1592015847500414978#wechat_redirect)

[服务端技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1539610690070642689#wechat_redirect) | [技术质量](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=2565883875634397185#wechat_redirect) | [数据算法](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1522425612282494977#wechat_redirect)
