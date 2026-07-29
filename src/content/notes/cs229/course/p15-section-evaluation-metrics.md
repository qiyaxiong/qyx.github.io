---
title: P15：讨论课——评估指标
description: 对应 B 站 P15 与 2018-10-26 Discussion Section，系统解释混淆矩阵、Precision/Recall、F1、ROC、PR 曲线与校准。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 指标必须对应决策代价

模型优化目标、离线评估指标和业务目标可能不同。

例如交叉熵适合训练概率模型，但上线决策可能关心：

- 漏诊成本；
- 误报审核成本；
- Top-K 名额；
- 延迟与吞吐；
- 不同群体的错误差异。

选择指标前必须先定义正类、错误代价和决策约束。

## 混淆矩阵

![从连续预测分数、阈值决策和混淆矩阵推导 Precision、Recall 与 F1](/images/notes/cs229/tikz/p15-confusion-matrix-metrics.png)

二分类结果分为：

|        | 预测正 | 预测负 |
| ------ | -----: | -----: |
| 实际正 |     TP |     FN |
| 实际负 |     FP |     TN |

TP、FP、FN、TN 的含义依赖“正类”定义。疾病筛查与垃圾邮件过滤中，正类的业务含义不同。

## Accuracy

$$
\operatorname{Accuracy}
=\frac{TP+TN}{TP+TN+FP+FN}
$$

类别均衡、错误代价相近时很直观。

若正类只占 $1\%$，永远预测负类也有 $99\%$ 准确率，却完全没有识别能力。

## Precision

$$
\operatorname{Precision}
=\frac{TP}{TP+FP}
$$

在模型预测为正的样本中，有多少真的为正。

当误报代价高，例如人工审核资源有限，Precision 很重要。

## Recall

$$
\operatorname{Recall}
=\frac{TP}{TP+FN}
$$

实际正类中，有多少被模型找到。

当漏报代价高，例如疾病筛查或欺诈检测，Recall 很重要。

Recall 也称 Sensitivity 或 True Positive Rate。

## Specificity

$$
\operatorname{Specificity}
=\frac{TN}{TN+FP}
$$

它衡量实际负类被正确排除的比例，也等于：

$$
1-\operatorname{FPR}
$$

## F1

Precision 与 Recall 的调和平均：

$$
F_1
=2
\frac{
\operatorname{Precision}\cdot\operatorname{Recall}
}{
\operatorname{Precision}+\operatorname{Recall}
}
$$

调和平均会惩罚其中一个指标很低的情况。

更一般的：

$$
F_\beta
=(1+\beta^2)
\frac{PR}{\beta^2P+R}
$$

$\beta>1$ 更重视 Recall，$\beta<1$ 更重视 Precision。

## 阈值

概率模型输出分数 $s(x)$，阈值 $t$ 决定：

$$
\hat y=\mathbf1\{s(x)\ge t\}
$$

降低阈值通常提高 Recall、降低 Precision；提高阈值通常相反。

阈值必须在验证集根据真实代价选择，不能在测试集挑出最好看的点。

## ROC 曲线

![ROC 曲线如何沿阈值轴生成多组预测、计数和坐标](/images/notes/cs229/tikz/p15-roc-threshold-sweep.png)

ROC 横轴：

$$
\operatorname{FPR}
=\frac{FP}{FP+TN}
$$

纵轴：

$$
\operatorname{TPR}
=\frac{TP}{TP+FN}
$$

改变阈值得到曲线。ROC-AUC 可理解为随机抽取一个正样本和负样本，模型把正样本排在更前面的概率。

## PR 曲线

PR 曲线横轴 Recall，纵轴 Precision。

正类稀少时，PR 曲线通常比 ROC 更能反映误报负担。大量 TN 会让 FPR 看起来很小，即使 FP 的绝对数量已不可接受。

比较 PR-AUC 时必须确认类别基准率一致；基准率变化会改变 Precision。

## 多分类指标

每个类别可使用 one-vs-rest 计算 Precision、Recall、F1。

Macro average：

$$
\frac1K\sum_{k=1}^{K}M_k
$$

每个类别权重相同，能暴露小类别失败。

Micro average 先汇总所有 TP/FP/FN，再计算指标，结果更受大类别影响。

Weighted macro 按类别样本数加权。

## 排序指标

推荐和检索系统常关心前几个结果：

- Precision@K；
- Recall@K；
- Mean Average Precision；
- NDCG；
- Mean Reciprocal Rank。

此时固定阈值分类指标可能无法反映用户真正看到的排序质量。

## 概率校准

若模型对一组样本输出约 $0.8$，理想情况下约 $80\%$ 应为正类。

准确率或 AUC 高不代表概率已校准。排序只关心相对次序，校准关心概率数值是否可信。

可使用可靠性图、Brier score、Expected Calibration Error，并在独立验证集上做 Platt scaling 或 isotonic regression。

## 回归指标

均方误差：

$$
\operatorname{MSE}
=\frac1m\sum_i(\hat y_i-y_i)^2
$$

对大误差惩罚强。

平均绝对误差：

$$
\operatorname{MAE}
=\frac1m\sum_i|\hat y_i-y_i|
$$

更稳健，也与目标同单位。

$R^2$ 衡量相对均值基线解释的方差比例，但可能为负，也不能说明预测误差是否满足业务要求。

## 指标切片

总体平均可能掩盖局部失败。应按以下维度切片：

- 类别；
- 时间；
- 数据来源；
- 地域或设备；
- 样本难度；
- 受保护群体；
- 置信度区间。

切片定义应在看到测试结果前确定，避免只挑有利结果。

## 从混淆矩阵计算全部核心指标

假设测试集有 1000 个样本：

```text
TP = 80
FP = 20
FN = 40
TN = 860
```

Accuracy：

$$
\frac{TP+TN}{TP+FP+FN+TN}
=
\frac{940}{1000}
=
0.94
$$

Precision：

$$
\frac{TP}{TP+FP}
=
\frac{80}{100}
=
0.80
$$

Recall：

$$
\frac{TP}{TP+FN}
=
\frac{80}{120}
\approx0.667
$$

Specificity：

$$
\frac{TN}{TN+FP}
=
\frac{860}{880}
\approx0.977
$$

F1：

$$
F_1
=
\frac{2PR}{P+R}
\approx0.727
$$

同一个模型可以同时有很高 Accuracy 和一般的 Recall。指标必须结合正类基率及错误代价解释。

## 阈值来自决策成本

概率模型输出：

$$
p=P(y=1\mid x)
$$

若预测正类的误报成本为 $C_{FP}$，预测负类的漏报成本为 $C_{FN}$，选择正类当：

$$
C_{FP}(1-p)
<
C_{FN}p
$$

整理：

$$
p
>
\frac{C_{FP}}
{C_{FP}+C_{FN}}
$$

当漏报成本远大于误报成本，最优阈值会低于 $0.5$。

现实中成本还可能依赖样本、人工审核容量和后续流程。阈值应在验证集上根据明确约束选择，并在测试集上一次性评估。

## ROC 与 PR 曲线的区别

ROC 横轴是假阳性率：

$$
FPR=\frac{FP}{FP+TN}
$$

纵轴是真阳性率：

$$
TPR=\frac{TP}{TP+FN}
$$

ROC-AUC 可解释为随机正样本得分高于随机负样本的概率。

PR 曲线横轴常为 Recall，纵轴为 Precision。它直接反映找到更多正类时，预测正类集合的纯度怎样变化。

类别极不平衡时，大量 TN 会让 FPR 看起来很小，ROC 曲线可能较乐观。PR 曲线通常更能反映稀有正类检索质量。

两类 AUC 都是排序指标，不保证给定阈值下满足业务约束，也不保证概率校准。

## Micro、Macro 与 Weighted 平均

多分类或多标签任务中：

Micro 平均先汇总所有类别的 TP、FP、FN，再计算指标。大类别贡献更多。

Macro 平均先对每个类别计算指标，再等权平均。小类别与大类别同等重要。

Weighted Macro 按每类样本数加权，介于两者的解释方式之间。

如果少数关键类别很重要，只报告 Micro F1 会掩盖问题。应同时报告逐类指标和 Macro 指标。

## 概率校准

若所有预测概率约为 $0.8$ 的样本中，约 $80\%$ 真为正类，则模型在该区域校准良好。

可靠性图把预测概率分箱，比较每箱平均预测与实际正类比例。

Brier Score：

$$
\operatorname{BS}
=
\frac1m
\sum_i
(p_i-y_i)^2
$$

它同时受区分能力和校准影响。

常见后处理包括 Platt Scaling 和 Isotonic Regression。校准模型必须使用独立验证数据拟合，不能在训练数据上校准后用同一数据评估。

类别先验变化会破坏校准。即使排序能力不变，线上正类比例改变也需要重新检查概率。

## 回归指标的选择

MAE：

$$
\operatorname{MAE}
=
\frac1m
\sum_i|\hat y_i-y_i|
$$

与目标同单位，对离群点比 MSE 稳健。

MSE：

$$
\operatorname{MSE}
=
\frac1m
\sum_i(\hat y_i-y_i)^2
$$

强烈惩罚大误差，适合大偏差代价增长很快的任务。

$R^2$：

$$
R^2
=
1-
\frac{
\sum_i(y_i-\hat y_i)^2
}{
\sum_i(y_i-\bar y)^2
}
$$

它比较模型与“预测均值”基线。测试集上 $R^2$ 可以为负，表示还不如均值预测。

MAPE 在真实值接近零时会爆炸，也对正负值解释困难。不能因为“百分比直观”就无条件使用。

## 置信区间与显著性

测试指标是有限样本估计。Bootstrap 可以反复有放回采样测试样本，计算指标分布和置信区间。

比较两个模型时应对同一测试样本做配对 Bootstrap，分析指标差值，而不是分别比较两个独立区间。

若数据有用户或时间相关性，应按群组或时间块重采样，普通逐样本 Bootstrap 会低估不确定性。

统计显著不等于业务显著。很大的测试集可能让极小差异显著，但差异不足以抵消复杂度、延迟或维护成本。

## 分群与最坏情况评估

总体平均值可能掩盖某些群体严重失败。至少按以下维度切片：

- 标签类别；
- 数据来源；
- 时间；
- 地区或设备；
- 输入长度或质量；
- 业务风险等级。

切片必须有足够样本并报告不确定性。不能在大量切片中只挑最好的结果，也不能用过小样本做确定结论。

对于安全关键系统，还应报告最坏组性能、风险覆盖曲线和拒绝预测后的剩余风险。

## 练习与答案思路

### 练习 1：指标计算

若 $TP=30,FP=10,FN=20$，Precision 和 Recall 分别是多少？

答案：Precision 为 $30/40=0.75$，Recall 为 $30/50=0.60$。

### 练习 2：不平衡任务

正类比例为 $0.1\%$，为什么只报告 Accuracy 不够？

答案：全部预测负类也有 $99.9\%$ Accuracy，却完全找不到正类。

### 练习 3：AUC 与阈值

ROC-AUC 更高是否保证生产阈值下 Recall 更高？

答案：不保证。AUC 汇总全部阈值，仍需在目标约束处比较。

### 练习 4：校准

两个模型排序完全相同，但一个把概率整体放大，AUC 是否改变？

答案：若放大保持单调排序，AUC 不变，但概率校准和基于成本的决策会改变。

## Top-K 与检索指标

推荐、搜索和候选审核常只展示前 $K$ 个结果。

Precision@K：

$$
\operatorname{P@K}
=
\frac{
\text{前 K 个结果中的相关项数}
}{K}
$$

Recall@K：

$$
\operatorname{R@K}
=
\frac{
\text{前 K 个结果中的相关项数}
}{
\text{全部相关项数}
}
$$

Mean Reciprocal Rank 关注第一个相关结果的位置：

$$
\operatorname{MRR}
=
\frac1N
\sum_{i=1}^{N}
\frac1{\operatorname{rank}_i}
$$

NDCG 对不同位置和相关性等级加权，适合 graded relevance。

$K$ 应对应真实界面或人工审核容量，而不是随意选择。

## Ranking 与分类的差别

分类关心每个样本是否越过阈值。

排序关心样本相对顺序。

对任意严格单调变换：

$$
f'(x)=g(f(x))
$$

排序指标不变，但概率和固定阈值决策可能改变。

所以一个模型可以 AUC 很高却校准很差，也可以概率较准但 Top-K 排序不够好。

先明确系统需要概率、分类决策还是排序。

## Cost Curve 与净收益

把错误映射为业务代价：

$$
\operatorname{ExpectedCost}(t)
=
C_{FP}P(FP;t)
+
C_{FN}P(FN;t)
$$

若正确识别也有收益：

$$
\operatorname{Utility}(t)
=
B_{TP}TP(t)
-
C_{FP}FP(t)
-
C_{FN}FN(t)
-
C_{\text{review}}N_{\text{positive}}(t)
$$

在验证集上画阈值—效用曲线。

成本估计本身可能不确定，可做敏感性分析，检查不同成本区间的最优阈值是否稳定。

## 拒绝预测与 Coverage

模型可对低置信样本拒绝自动决策，交给人工或回退系统。

Coverage：

$$
\operatorname{Coverage}(\tau)
=
\frac1m
\sum_i
\mathbf1\{confidence_i\ge\tau\}
$$

Selective Risk：

$$
R_{\text{selective}}(\tau)
=
\frac{
\sum_i
\ell_i
\mathbf1\{confidence_i\ge\tau\}
}{
\sum_i
\mathbf1\{confidence_i\ge\tau\}
}
$$

画 Risk–Coverage Curve，观察覆盖更多样本时风险怎样增加。

拒绝机制只有在置信度与错误相关时才有效，Softmax 最大概率不一定是可靠不确定性。

## 分布外检测的评价

OOD 检测把分布内与分布外样本作为二分类，可用 AUROC、AUPR 和 FPR@95TPR。

但 OOD 不是单一分布。近分布异常、远分布噪声和对抗输入难度不同。

测试集应包含与真实部署相关的多种异常来源。

不能在固定 OOD benchmark 上调参后仍称其为完全未知分布评价。

## 分割与检测指标

图像分割使用 Intersection over Union：

$$
\operatorname{IoU}
=
\frac{
|A\cap B|
}{
|A\cup B|
}
$$

Dice：

$$
\operatorname{Dice}
=
\frac{
2|A\cap B|
}{
|A|+|B|
}
$$

目标检测先按 IoU 阈值匹配预测框与真实框，再计算 Precision–Recall 与 Average Precision。

同名“Accuracy”无法覆盖不同任务结构，指标必须基于预测对象定义。

## 离线指标与在线实验

离线指标衡量历史数据上的预测质量。

在线 A/B 实验衡量模型进入真实产品后的因果影响。

离线提升不保证在线收益，因为：

- 用户会响应系统；
- 延迟影响体验；
- 曝光改变反馈；
- 指标代理不完全；
- 其他系统组件限制收益。

上线前设定主要在线指标、护栏指标、实验单位和停止规则。

## 评价报告模板

完整报告包括：

```text
任务与决策
测试集构造
样本量与基率
主指标
约束指标
置信区间
阈值选择方法
混淆矩阵
校准
关键切片
错误样本
延迟与成本
已知限制
```

指标表必须注明“越大越好”或“越小越好”、单位和计算版本。

## 补充练习

### 练习 5：Top-K

前 10 个结果中 6 个相关，全部共有 20 个相关项，P@10 与 R@10 是多少？

答案：P@10 为 0.6，R@10 为 0.3。

### 练习 6：Coverage

提高拒绝阈值通常怎样影响 Coverage？

答案：Coverage 下降；若置信度有效，剩余自动决策风险也应下降。

### 练习 7：在线实验

离线 AUC 提升是否证明新推荐模型增加用户长期满意度？

答案：不能，需要在线实验和长期护栏指标验证因果影响。

## 指标卡模板

为每个生产指标建立 Metric Card：

```text
名称：
公式：
统计单位：
正类定义：
阈值：
数据窗口：
包含/排除：
切片：
置信区间：
负责人：
版本：
```

例如 Recall 如果没有固定正类定义、窗口和去重单位，不同团队算出的数不能比较。

指标实现应有手算样例单元测试。

## 阈值回放实验

保存测试集每个样本：

```text
真实标签
预测概率
群体
业务成本
时间
```

枚举阈值，计算：

$$
TP(t),FP(t),FN(t),TN(t)
$$

以及：

$$
\operatorname{Utility}(t)
$$

画：

- Precision–Recall；
- ROC；
- Threshold–Metric；
- Threshold–Utility；
- 各群体错误率；
- 审核量。

选定阈值后写明理由，并冻结到测试评价。

## 讲义对照阅读路线

Evaluation Metrics Slides 按四层阅读：

1. 计数：混淆矩阵；
2. 单阈值：Precision、Recall、F1；
3. 全阈值：ROC、PR、AUC；
4. 决策：成本、校准、切片。

每看到一个指标，都问：

```text
忽略了什么？
对基率是否敏感？
是否依赖阈值？
能否直接对应业务决策？
```

最后用同一组 20 个手算样本复现全部指标。

## 补充练习

### 练习 8：指标版本

同名 F1 是否一定可直接比较？

答案：不一定，要确认正类、micro/macro、阈值、去重和数据窗口。

### 练习 9：阈值冻结

为什么不能在测试集上枚举阈值并报告最优？

答案：阈值是模型选择的一部分，会过拟合测试数据。

## 本节检查

- 能从混淆矩阵计算 Accuracy、Precision、Recall 与 Specificity；
- 能根据误报/漏报成本选择指标；
- 能解释阈值如何改变 Precision/Recall；
- 能说明类别不平衡时为何优先看 PR；
- 能区分 Macro、Micro 和 Weighted average；
- 能区分排序能力与概率校准；
- 能为回归任务选择 MSE 或 MAE；
- 能设计总体指标之外的关键数据切片。

下一节进入 [P16：反向传播与神经网络训练](/notes/cs229/course/p16-backprop-neural-network-training)。

## 来源说明

- 视频：[B 站 P15：Evaluation Metrics Section](https://www.bilibili.com/video/BV1fP4y127nn/?p=15)
- Slides：[Evaluation Metrics，共 31 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/section/evaluation_metrics_spring2020.pdf)

2018 课表中的原 Slides 文件未保留在该仓库；页面明确采用仓库中的 Spring 2020 后续版本，并与本节录像主题对应。
