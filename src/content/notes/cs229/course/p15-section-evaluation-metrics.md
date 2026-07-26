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
