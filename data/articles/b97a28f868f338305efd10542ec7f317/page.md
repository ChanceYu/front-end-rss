---
title: "淘天集团自营技术运营算法团队4年2次荣膺 INFORMS“杰出实践奖”决选荣誉：以策略正则化突破DRL在库存管理中的落地瓶颈"
link: "http://mp.weixin.qq.com/s?__biz=MzAxNDEwNjk5OQ==&mid=2650542682&idx=1&sn=4a56846c13628675c01337e79b01d614&chksm=8390da42b4e753547975ab94ed9e40a4f4524a989918423bba32591249c891bf11f0c5f16121#rd"
date: 2026-02-02
md5: b97a28f868f338305efd10542ec7f317
---

# 淘天集团自营技术运营算法团队4年2次荣膺 INFORMS“杰出实践奖”决选荣誉：以策略正则化突破DRL在库存管理中的落地瓶颈

![图片](./images/bf9f3706ad70860c352c2df62702ccb0.gif)

  

  

  

2025年10月，淘天集团自营技术运营算法团队的研究成果《DeepStock: Reinforcement Learning with Policy Regularizations for Inventory Management》荣获运筹学与管理科学领域极具声望的 “Daniel H. Wagner 杰出实践奖”（Daniel H. Wagner Prize for Excellence in the Practice of Advanced Analytics and Operations Research）决选荣誉。值得一提的是，这是该团队继 2022 年首次入选该奖项决选名单后，第二次获此殊荣，彰显其在工业级智能决策系统领域的持续领先能力。

  

![图片](./images/884771fe4ea9cf48158f0217ef298258.png)

  

![图片](./images/f37fdf1ea916bf33d85f9753ab39887f.webp)

前⾔

  

本研究创新性地将库存理论中的经典策略直觉融入深度强化学习（DRL）框架，提出“策略正则化”（Policy Regularization）方法，显著提升了 DRL 在复杂库存场景中的训练效率、可解释性与最终性能。论文巧妙建模，解决了工业界优化在架率周转等多个计算复杂的核心库存指标而非优化库存成本单一可累加指标的难点。目前，该算法已100% 全量部署于淘天集团自营体系（包括天猫超市、国际直营等业务），覆盖超过 100 万 SKU-仓库组合。在有货率（Service Rate）保持稳定的前提下，库存周转天数优化 7%，对于每50亿的库存规模，年化减少库存货值 3.5亿元，降低库存持有成本约 1500 万元。

  

![图片](./images/1d30e69cff4aab30903ee8b440fad449.png)

  

![图片](./images/085450880b60d0d699796ad0daf319e4.png)

背景：传统两阶段方法的局限与

端到端智能的兴起

  

长期以来，工业界主流的库存优化方案普遍采用“先预测、再决策”的两阶段范式——即先通过需求预测模型估计未来销量，再基于预测结果调用运筹优化或仿真模型生成补货策略。然而，这一方法存在根本性瓶颈：需求预测的精度直接决定了库存策略的性能上限。而现实中，高维上下文数据（如促销、季节性、社交媒体趋势、供应链波动等）使得精准预测极为困难。

  

尽管经典的库存理论模型（如报童模型）在理想假设下具备解析最优解，但其对需求分布的强依赖在实际业务中往往难以满足，导致效果大打折扣。

  

随着海量高维上下文数据的积累，端到端的深度强化学习（DRL）为库存管理提供了新范式——它无需显式预测需求，而是直接从历史交互与仿真环境推演中学习最优补货策略。然而，DRL 在工业落地中仍面临四大挑战：

- 黑箱性与不可解释性：一种常用做法是，将多周期库存控制问题笼统建模为通用的序列决策问题，直接应用现成的 DRL 方法，导致策略难以被业务方理解和信任；
- 数据效用：在电商中可用于预测与决策的数据其实十分有限，原因在于经营目标、竞争格局、营销节奏和运营策略快速变化，使大量历史数据失去对未来的预测与泛化能力，因此依赖“大数据 + 大模型 + 大算力”的方法往往难以奏效；
- 超参数敏感性：DRL 性能高度依赖超参数调优，过程耗时且成本高昂；
- 目标函数错配：学术研究普遍以“最小化缺货与持有成本之和”为奖励函数，但工业界难以准确量化成本参数；实际评估更关注缺货率（Service Rate）和周转天数（Turnover Time）等可操作指标，而这些指标难以分解为每步行动的即时奖励。

  

此外，不同品类（如畅销品 vs. 长尾品）、不同供应商在业务目标、需求模式和履约约束上差异显著，导致早期 RL 系统需为每类商品分组训练独立模型，运维成本极高，难以规模化。

我们提出了策略正则化，将库存理论的一些经典策略或简单直觉融入DRL中，有效解决以上问题。

  

![图片](./images/5539c3f80fac1718a6025104413fee7c.png)

文献调研：策略正则化、库存领域DS与DRL对比分析、

DRL大规模线上部署均开创历史先河

  

#### **▐**  策略正则化

  

许多先前的工作已将库存策略结构编码到RL中。例如，De Moor et al.（2022）通过嵌入启发式库存策略的结构来修改奖励函数，将其作为教师策略；Qi et al.（2023）使用一种标签方法，捕捉历史观察下最优动态规划解的行为，然后将其作为学习策略的正则化器；Maggiar et al.（2025）在目标函数中施加惩罚项，当学习策略违反某些已知的最优策略结构性质时（如文献中所证明）。这些工作通常与我们的不同之处在于将惩罚项纳入目标函数，而非直接限制策略空间。

  

最后，注意到我们的策略正则化是问题特定的，不应与RL中常用的通用正则化技术混淆，如熵正则化（Haarnoja et al. 2018）或信赖域策略优化中使用的正则化（Schulman et al. 2015a）。

  

#### **▐**  可微分仿真器（DS）与传统DRL用于库存

  

近年来一些电商平台例如亚马逊构建可微分的仿真器来求解库存问题，不同于DRL会计算连续周期之间的状态转移，直接计算仿真环境下多周期总成本的梯度，我们简称其为DS算法。

  

虽然 Madeka et al.（2022）以及同期的 Alvo et al.（2023）积极推动将 DS 应用于库存管理，并强调了其优势（如调参相对方便、经验效果良好），但这些工作并未对 DS 与传统 DRL 方法进行系统且严格的对比。相比之下，本文在充分进行超参数调优的前提下，对 DS 与传统 DRL 进行了公平而严格的比较。我们的实验揭示了DS的一个新缺陷：当没有足够的并行轨迹时，它无法跨时间学习。不过如果给定足够的独立同分布轨迹，DS在人工生成的数据集中仍然表现出色，这与Alvo et al.（2023）的实验发现一致。

  

#### **▐**  大规模DRL库存部署

  

电商通过深度学习来管理库存变得越来越普遍，包括阿里巴巴（Liu et al. 2023）、亚马逊（Madeka et al. 2022）和京东（Qi et al. 2023）。不同的是，本研究实现了在天猫自营补货场景中所有商品100%全覆盖。

  

![图片](./images/d4b2a69f6f8db2ee120a649d492232dc.png)

核心创新：策略正则化——

让 DRL 学会“库存常识”

  

▐  **库存动态**

  

设 T、P 和 L 为正整数。我们考虑 t = 1, ..., T 天的离散时间范围，补货周期为P，供应商送货到库存到仓时间间隔为 L ，即在第 1+L, P+1+L, ... 天开始时到达。设![图片](./images/262180a40b8709d717f919e1d2956b14.jpeg)表示第 t 天开始时的库存状态向量，其中 ![图片](./images/30fa49045786c360bce03c04cec0f5db.jpeg)表示在仓库存，![图片](./images/a835e87e266dfcf687772f9c4099cc31.jpeg)表示未来![图片](./images/700561d4b47568e9ad5cfae01609d92b.jpeg)天将到达的库存，对所有![图片](./images/cbe152e29b0704d47ac59c4a9e304187.png)。我们初始化 ![图片](./images/9b51aa07af031e006bace7d77021011c.jpeg)。

  

如果在第![图片](./images/b2153940f60ff90f4df92cbffffeb1c5.jpeg)天需要订货，我们在第![图片](./images/1ca0ee32fb09d8bb51ada26de8a8cbce.jpeg)天开始时决定数量![图片](./images/8819852fe93f294f2aa2f19aeb6be750.jpeg)；否则设![图片](./images/f75db19558ceeb5aaa6a3ca30bdc85b0.jpeg)。用户需求为![图片](./images/997db56e231cb51843e3513714ea0d60.jpeg)，实际销售量为![图片](./images/60102351cc1c9de64245348bdc2911d7.jpeg)，下一天的库存向量更新为：

![图片](./images/d13d876ab90557ec79a77bc42b6145e9.png)

  

▐  **性能指标**

  

在库存理论中，要最小化的标准损失目标是：

![图片](./images/5a19731e14d85ea8dc6904f3eafd90c7.jpeg)

即在每天![图片](./images/a144cc52d93529c9d1e9fc609763a71b.jpeg)结束时：如果![图片](./images/ce2e36384092e687d2fa1bd83022c908.jpeg)（即库存缺货），则我们被惩罚 b 乘以未满足需求![图片](./images/7e5a84e17d8296d189e00355a352c1ac.jpeg)；否则，我们被惩罚![图片](./images/cb50d236c861568c824a25ce245a97d4.jpeg)乘以剩余库存![图片](./images/ce830b27d3c51451d172c5561c19cfea.jpeg)。

然而，![图片](./images/dcd09f84e40830d27b7429e817706198.jpeg)不是一个实用的评估指标，因为在实践中量化 b 和 h 很困难，特别是因为当![图片](./images/8a4cf6943b76fdf729805e853695cff4.png)未知时，缺货期间的未满足需求无法直接观察。因此，在阿里巴巴，我们改为评估以下两个指标：

![图片](./images/26626d6ac7d0dbb36c1d63f6de14f112.png)

  

这里，"缺货率"损失![图片](./images/09af40a59660eaa3e7f068c041e216f3.jpeg)衡量以缺货结束的天数百分比，惩罚库存过少。另一方面，"周转时间"损失![图片](./images/78763acf093cf737eee7cff083811955.png)计算平均日末库存除以平均销售量，衡量一单位库存在手的平均持续时间，惩罚库存过多。

在我们人工生成数据实验中，我们使用标准目标![图片](./images/55fd0e27ea6135951a5fae5cae6ee8e4.jpeg)训练和评估策略。我们注意到损失目标![图片](./images/96dc5a5df2c98ed61638cb4cf61fc0bc.jpeg)在时间![图片](./images/83a21e270807916c83aa8d299aeb03b0.jpeg)上自然可加，为RL训练期间采取的每个行动提供奖励信号。在阿里巴巴，策略使用![图片](./images/bd9688a10e1b758cb8a742a510710fdb.jpeg)和![图片](./images/4c2247051c55279f58546c6d773a6d97.png)的加权组合进行训练和评估。我们可以调整相对权重来权衡![图片](./images/f9410f8cb311d409495e6f431184826f.jpeg)和![图片](./images/3fa3f8038f2d2e620021ec98ffcf3619.png)，理想情况下获得![图片](./images/aa460a8b8e75eee4b978d9a419798e84.jpeg)和![图片](./images/e54ea54cbe818d6f2a9410656f0cb7af.png)都下降的帕累托改进。

  

▐  **DRL建模**

  

问题建模我们采用下图的方式。第T天发起补货动作，将第T-1期末库存相关特征拼接为当前状态。reward设计相对复杂，![图片](./images/f23b44da642b733e2d0728da4f47e546.png)不能精确分解为每周期损失。一种处理方式是将reward定义为本次补货到货，到下次补货到货期间的库存指标与库存目标之间的偏差，以此近似本次action的即时损失，但存在若干问题。无法处理送货时长波动大，尤其引发cross order的情况；此外考虑到需求侧、供给侧都存在不确定性，销量、送货时间、送满率等参数波动大，我们不会关注每一次补货时段的库存指标是否完美，更关注一段时间的综合指标。为此我们设计终止态时reward为整段周期指标统计做一个比较大的奖惩，其余reward为0，此外引入shaping reward，中间挑选几个check点给予小的惩罚信号，相应配合在状态中加入时间和历史进销存相关信息。

  

![图片](./images/d9b1807cff05da5959d8424c6f4db4e9.png)

  

▐  **两种关键正则化形式**

  

DRL方法学习一个由深度神经网络表示的策略![图片](./images/b904e566c751bba6f8ca5605adba1f04.png)，该策略可以根据任何状态决定订货行为。在我们的问题中，某个SKU在时间![图片](./images/29feadb0147d78657856562c1cd5a099.jpeg)的状态包括外生特征![图片](./images/6e898b646fd8a7e384ccf44a1194c7ab.jpeg)，由静态属性（如商品类别、需求规模、供应商、送货时长、补货周期、利润率）和随时间演变的动态属性（如即将到来的促销活动、季节性、近期社交媒体趋势）组成。此外，状态还包括关于即将发生的库存转移的内生信息![图片](./images/d8682a39986b8a2ae45fc099b837c350.jpeg)，这取决于先前的行动，即先前下发的补货订单。

  

当DRL算法直接应用时，策略![图片](./images/57694f283072401d741cbf919063b5ea.jpeg)通常是一个单一的神经网络，根据输入状态![图片](./images/5623b6611b01ccfc1c8dcd508c4b5a0a.jpeg), ![图片](./images/6cc0ee9df19a9ea52d853889207308f6.jpeg)输出订货量![图片](./images/8b044228a0046df1d5e0c4a9c5b62d65.jpeg)。

团队提出策略正则化（Policy Regularization）框架，将库存管理中的经典直觉硬编码进 DRL 策略结构中，而非仅作为软性奖励惩罚。

  

- Base Stock 正则化：我们的第一种策略正则化要求订货量采用以下函数形式，直接嵌入“基础库存”思想，提高策略网络学习稳定性，大幅降低策略搜索空间。

![图片](./images/5fc9543bdbb63d1985789e5955263d65.png)

其中![图片](./images/559461083b422a7f43990030a39a8add.jpeg)是学习到的神经网络，![图片](./images/eb65f9e389263e853971de8f6d9ef646.jpeg)表示![图片](./images/f0ce4301d38c3dd0a4a976886c696b7d.jpeg)中包含的当前库存水平（包括即将到达的补货量）。这里，Base代表"基础库存"，其中![图片](./images/8ed3fc1613a6def507ec3e0b205c70cc.jpeg)表示总库存的目标水平，订货量![图片](./images/cc92f3571bee3419131efc06ddbf966e.jpeg)等于该目标水平减去我们已有的总库存![图片](./images/746f6a2e56a6c5b9011733ef171590e6.png)。直觉上，学习到的目标![图片](./images/6781631b1985b61cae37c2d28f0005b5.jpeg)应主要取决于预测即将到来需求的外生特征![图片](./images/13d7d312106dafac16b507d8e0fa2ee8.png)，而库存信息![图片](./images/c9cfd5f204d0e1f1e82d5f00157b2ed1.jpeg)通过![图片](./images/879d0892d2b2ea955039e0f5bce7417e.png)项纳入决策。有个容易出错的关键点，在Lost sales背景下，目标库存水平也直接会受![图片](./images/364ef7b33fb1e4ec2d91b0a00ae5adfb.jpeg)影响。总体来说在Base正则化下，更容易近似![图片](./images/ad55257f73bb3fdb9e01ff6f610d544c.jpeg)，因为最佳行动![图片](./images/8ca1fad12d1f4aac1ea9fa50bcb5d4d0.jpeg)在不同库存状态![图片](./images/7821353a20e9568254e9606be61eb23c.jpeg)间是相同或相近的，从而导致Q目标的更稳定学习。

  

- Coefficients 正则化：以下为函数形式，系数由神经网络动态生成，提升策略的结构合理性与泛化能力。

![图片](./images/6fc37142361e71764f2e295da20bc4ab.jpeg)

其中![图片](./images/d7ef55c8283baf9ca7e94c24a43f5436.png)是一个学习到的具有![图片](./images/908ceb6a324a7473f744631e620229c7.jpeg)维输出的神经网络，为通过映射![图片](./images/5ff8db4b7a5bc695d8b79764234443fa.jpeg)从![图片](./images/4d562362a3bf04c6ab5b83becc47e25b.jpeg)提取的![图片](./images/fcff3e9c8771821840dc8c308b45cae8.jpeg)个特征提供系数（Coefficients）。在阿里巴巴，我们设置![图片](./images/f7a323ed57ce4357c40349baf4fc8150.jpeg)\= 5，其中![图片](./images/817c20c4a05e8e8f945bf4bcfddfa68b.png)由近期和远期周期内的4个历史和预测需求特征以及一个常数偏置项组成。直觉上，期望的订货量应与这些特征呈正相关关系。将订货量表示为关键特征（如历史/预测需求）的线性组合。

最后，我们可以组合两种策略正则化，在这种情况下，我们要求订货量采用以下函数形式：![图片](./images/ea5961622ca9b7c14408a386f88a76b2.jpeg)

其中![图片](./images/e055d9719b9e90cc87b321dfe49169d9.jpeg)是学习到的具有![图片](./images/f09e30134756621088452ffdfb183008.jpeg)维输出的神经网络。

  

▐  **模型训练**

  

我们通常用![图片](./images/cd9a5a545af18fdda491eb1eb4713518.jpeg)表示轨迹![图片](./images/eae15c7be1b70c7d736df4bfb82f8394.jpeg)的数据集，我们区分用于训练、验证和测试的数据集，分别用![图片](./images/5fcf8f05d1d78bb2fdc3f121182e8be6.jpeg)、![图片](./images/9520af7245437aec47ccc60f2658e876.jpeg)和![图片](./images/ea62b49ca8f1c13aad405359e5ba2058.jpeg)表示。对于任何![图片](./images/48c1a10633da167002178fd7d96c82ac.jpeg)和![图片](./images/b8b444d4807ab20ae41a3855aafd9224.jpeg)，我们定义：

![图片](./images/7f098daf751b4c9440ac1463b6acbf4b.png)

这是策略![图片](./images/0c5df5515e8963b9d8dd55ca771ede5c.jpeg)在轨迹![图片](./images/8fbc058ed0779e2a239ae7511619c6b9.jpeg)上损失![图片](./images/00fe1c05782388aa6d68bb0aa014d74a.jpeg)的平均值。

  

对于传统DRL算法，我们主要考虑深度确定性策略梯度（DDPG）和近端策略优化（PPO）。PPO模拟一个随机化的![图片](./images/5e3288bb81ecd41f7e1e7af2fba5644c.jpeg)并强化在同策略轨迹下产生高奖励的行动，是一种现代策略梯度方法，通过"裁剪"更新来防止![图片](./images/a7db930bd53f8f10a863f848ec26123e.jpeg)变化过快。DDPG使用目标网络来稳定策略和Q函数更新。最后，我们考虑DS，即通过可微算子计算整个轨迹的损失函数，直接求梯度进行网络更新。

  

DRL方法指定如何训练![图片](./images/eafd12ddeb4c04ef11badaa6cb43f6e9.jpeg)，与我们的策略正则化结合使用。对于![图片](./images/3edfdebd9e27aa093fde173f6802af4b.png)和![图片](./images/0977a641cea5820d5b49481f5ee94483.png), （其中None指"无正则化"，即![图片](./images/6d5c12c42f9b084e786e3329c36c8b75.jpeg)直接输出订货量）的每种组合，我们用![图片](./images/ee8b870e358bbba43fa1444d1258608d.jpeg)表示最终学习到的策略。

  

![图片](./images/f12276d17c707eb17af5a7cae504649b.png)

离线实验：深度对比策略正则化

如何帮助 DRL超越DS

  

我们固定 P = 2, L = 1, m = 1，并设 T = 29，除非另有说明。人工生成的数据集如下：

- INDEP分布，20个样本轨迹，分割使得 ![图片](./images/6f63eb0af821e8edace07380b5f17f7a.jpeg) 
- AR(1)分布，20个样本轨迹，分割使得![图片](./images/410916bc3c4cdb896c8e7e45e1603e3e.jpeg)
- AR(1)分布，10个样本轨迹，分割使得![图片](./images/870da84f5126a37228363a28d91c0c99.jpeg)
- IID分布，样本量![图片](./images/cbda5b22106a6e6c3db8f3385c226be5.png)，时间长度![图片](./images/857b12815c3abb456ab18d47d6dc6674.jpeg) 

  

我们比较![图片](./images/5dda94d82e137bd7832aa6bd98c94e6f.jpeg)和![图片](./images/883fb258b979c37baaaed81888289619.jpeg)组合的策略![图片](./images/716a8b821f681aec3df32c7e716e84c0.jpeg)，因为![图片](./images/f60af39aef4ea074e545b2fe68ca0f51.jpeg)是一维的所以省略Coeff正则化。使用相同的![图片](./images/dd3ede29a6079490d2baed59bda783f9.jpeg)指标进行训练、验证和测试，其中 b = 0.9 和 h = 0.1。

  

![图片](./images/13d42ac515fc2a41dbbda2f95cd4220b.jpeg)

  

下图1所示，Base 正则化可以显著改进测试损失。 

![图片](./images/f66a0a7ad32d5703a4b834cbe3787e1e.png)

  

图2显示了第一组设置下进行超参数试验时每个![图片](./images/e9e9322319173531eea1d42a5eb24d15.jpeg)的最佳性能曲线。对于三种DRL方法，超参搜索越复杂，从![图片](./images/7379aab4afc0dcdfe515af6a1cb7c8f9.jpeg)到![图片](./images/3251916db1f9f68db39bcb62ad0e6671.jpeg)的改进越大，策略正则化降低了DRL效果超越DS的难度。为了解释DDPG和PPO击败DS，我们比较不同设置下的结果。在设置3中（带Base正则化），我们可以看到DS的验证损失比DDPG好但测试损失更差，这表明DS正在过拟合。这是因为DS直接对![图片](./images/4c7a0eecdd892f0aa4335dd267d25bac.jpeg)中的轨迹损失采取策略梯度，强制样本内最小化。此外，由于DS不从 (s, a, r, s') 转换中学习，它缺乏传统DRL方法核心的跨时间学习，因此DS的样本效率较低。

![图片](./images/dbcdc50b074b73b03b1d5937d95bbed5.png)

  

为了进一步研究DS的学习行为，我们最后在不同样本量和时间长度下训练DS（带Base正则化）。在图3中，当样本量较小（![图片](./images/0b24f42be9880073a1aa6291316c7037.jpeg)）时，即使在简单的IID分布下 T = 129，测试损失差距仍保持在约8%。这表明增加时间长度 T 只能带来有限的改进，突出了DS内部跨时间学习的不足。当![图片](./images/be2fb058db67191425430c32039e0f1f.jpeg)从5增加到10再到20时，所有时间长度的测试损失整体改善，表明DS确实从跨轨迹（即跨SKU）的元学习中受益，但尽管如此，我们在更长时间长度下没有看到收敛。我们发现在样本数量有限的情况下，DS在验证和测试损失之间表现出较大差距，证明了它对观察轨迹特异性有过拟合的倾向。

![图片](./images/80c034d4f178097ab64546810f620f1c.png)

  

总结，本研究通过严格对照实验发现：

- DS 在样本内表现优异，但存在严重过拟合：因其直接对训练轨迹求梯度，缺乏跨时间步的泛化能力；
- DS 样本效率低下：在轨迹数量有限时（如长尾 SKU），性能显著劣于带正则化的 DRL；
- 策略正则化使传统 DRL（如 DDPG、PPO）在同等条件下，带正则化的 DRL 不仅训练更快，最终效果也优于 DS。

这一发现为工业界在 DRL 与 DS 路线选择上提供了重要实证依据。

  

![图片](./images/2e74c1912f2a2864f416cd93ba57d8bd.png)

线上效果：从试点到全量，实现帕累托改进

  

结果1：小规模验证（2024年7月）

在 10% 的高潜力国际 SKU 上试点，采用双重差分（DiD）分析显示：

- 缺货率降低 0.83%
- 周转天数减少 9.53 天

  

结果2：大规模推广（2025年4月）

通过我们DRL训练的库存策略推广到100%的国际SKU和87%的国内SKU。此时无法使用DID，我们进行了反事实分析，用工业级别的仿真环境，模拟对比了同时段不同算法效果。缺货率没有明显差异的情况下，周转实现了1-2天的降低，按销量的进一步细分如表2所示。周转天数的降低折合可观的金额收益，对于每50亿的库存规模，可带来库存货值年化减少3.5亿元，库存持有成本年化降低约1500万。

![图片](./images/de8f24b98a20ab6f5c4a81be42bc5a2d.png)

  

结果3：全量稳定运行（2025年10月）

DRL算法全量上线后我们持续监控库存指标。图4展示了2025年7-8月国际SKU的平均周转时间，这段时期涵盖了DRL策略的重新训练，并将其与2024年同期，我们大规模推出DRL之前国际SKU的平均周转时间进行比较。2025年缺货率没恶化的情况下，周转时间大幅减少了20%。它为我们DRL部署的稳定性提供了高层管理信心，因此截至2025年10月，我们的策略已完全部署到自营技术100%超过100万个SKU-仓库对。

![图片](./images/be979aa54742e59dbb09bf32dfe7ee09.png)

  

通用补货大模型：一套模型，全域覆盖

得益于策略正则化，DeepStock 实现了真正的通用补货大模型：

- 单一模型适配所有品类，无需分组训练；
- 通过状态特征工程与自动化超参优化（田口实验），高效捕捉商品、供应商、渠道的多样性；
- 与业务系统深度集成，自动将运营目标（如服务水平、周转要求）转化为奖励权重。

这不仅大幅降低工程与运维成本，也为 DRL 在复杂供应链场景的规模化应用树立了新标杆。

  

![图片](./images/c69466426940effa8f9294b966cfd193.webp)

论文附录

  

1. Liu, Jiaxi and Lin, Shuyi and Xin, Linwei and Zhang, Yidong, AI vs. Human Buyers: A Study of Alibaba's Inventory Replenishment System. INFORMS Journal on Applied Analytics, 53(5) 372-387, 2023：https://pubsonline.informs.org/doi/10.1287/inte.2023.1160
2. Xie, Yaqi and Hao, Xinru and Liu, Jiaxi and Ma, Will and Xin, Linwei and Cao, Lei and Zhang, Yidong, DeepStock: Reinforcement Learning with Policy Regularizations for Inventory Management (November 21, 2025). Available at SSRN : http://dx.doi.org/10.2139/ssrn.5784782

  

![图片](./images/2ea55193d489851cf864f3cc61e0dd02.png)

团队介绍：产学研协同共探AI技术新前沿

  

淘天集团自营技术运营算法团队长期深耕于天猫超市、国际直营等自营业务的供应链计划与物流执行场景，在仓网规划、补货调拨、需求预测、订单履约、仓内作业及干线物流等多个关键环节持续发力。团队深度融合运筹优化、深度学习、强化学习与大模型等前沿技术，显著提升决策精准度与系统效率，为业务带来可观的规模化收益。

  

秉持“产学研深度融合、创新驱动发展”的理念，团队始终致力于打造世界一流的供应链智能决策技术体系。近年来，已与哥伦比亚大学、康奈尔大学、芝加哥大学、四川大学、浙江大学、上海交通大学等全球顶尖高校建立紧密合作关系，产出多项具有国际影响力的科研成果。此次发布的《DeepStock》研究正是这一合作传统的又一典范——不仅巧妙融合了理论洞察与工程实践，更通过真实业务场景的全量验证，充分展现了AI技术在复杂工业系统中的规模化落地价值。

  

面向未来，团队将持续推进“链接数字世界与物理世界的超级AI”这一战略愿景，聚焦构建可解释、可泛化、可信赖的智能决策基础设施，在大模型、运筹优化、强化学习等方向不断突破算法边界，加速推动前沿技术向产业级应用的深度赋能。

  

  

**¤** **拓展阅读** **¤**

  

[3DXR技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=2565944923443904512#wechat_redirect) | [终端技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1533906991218294785#wechat_redirect) | [音视频技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1592015847500414978#wechat_redirect)

[服务端技术](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1539610690070642689#wechat_redirect) | [技术质量](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=2565883875634397185#wechat_redirect) | [数据算法](https://mp.weixin.qq.com/mp/appmsgalbum?__biz=MzAxNDEwNjk5OQ==&action=getalbum&album_id=1522425612282494977#wechat_redirect)
