---
title: 第 9 章：Bagging、AdaBoost 与 Gradient Boosting
description: 理解 Bagging 如何通过重采样降低方差，以及 Boosting 如何把弱学习器逐步组合成强模型。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 为什么组合模型

如果多个模型的错误不完全相关，对预测取平均可以抵消部分波动。

设每个回归模型方差为 $\sigma^2$，两两相关系数为 $\rho$。$B$ 个模型平均值的方差近似为：

$$
\rho\sigma^2+\frac{1-\rho}{B}\sigma^2
$$

增加模型数量只能消除不相关部分。若所有模型高度相关，继续增加数量收益有限。

集成的两个主方向是：

- Bagging：并行训练多个高方差模型，再平均；
- Boosting：串行加入模型，逐步修正当前组合的错误。

> 原版对应：PDF 第 1–2 页，Ensemble motivation。

## Bagging

![Bagging 如何通过 Bootstrap 和模型轴平均降低预测方差](/images/notes/cs229/tikz/p13-bagging-variance-reduction.png)

Bootstrap 从原训练集有放回抽样，生成与原数据同样大小的重采样集。每个基学习器在不同 Bootstrap 样本上训练。

回归取平均：

$$
\hat f(x)=\frac1B\sum_{b=1}^{B}\hat f_b(x)
$$

分类可多数投票或平均概率。

Bagging 不主要降低单个模型偏差，而是利用数据扰动产生多个不同模型，再通过平均降低方差。

Out-of-bag 样本是某次 Bootstrap 未抽中的数据，可用于估计泛化误差和特征重要性，不必额外留出同样多的数据。

> 原版对应：PDF 第 2–4 页，Bootstrap and aggregation。

## 随机森林

只对树做 Bootstrap 仍可能得到高度相关的模型，因为强特征会反复成为根切分。

随机森林在每个节点只从随机特征子集中选择切分。这个额外随机性降低树之间的相关性，使平均更有效。

主要参数包括：

- 树数量；
- 每次候选特征数；
- 最大深度或叶子最少样本；
- 类别权重与抽样策略。

树数量增加通常不会像单棵树深度那样导致过拟合，但会增加训练、内存和推理成本。

基于 impurity 的特征重要性可能偏向高基数变量。Permutation importance 更接近“打乱该特征后验证性能下降多少”，但在强相关特征下也需谨慎解释。

> 原版对应：PDF 第 3–4 页，Bagging with decision trees。

## Boosting 直觉

Boosting 构造加法模型：

$$
F_M(x)=\sum_{m=1}^{M}\alpha_mG_m(x)
$$

每一步加入一个弱学习器，重点处理当前组合仍然做不好的样本或残差。

串行依赖使 Boosting 不能像 Bagging 那样完全并行。它往往能降低偏差，但也对噪声标签、异常点和超参数更敏感。

弱学习器不必比复杂模型强，关键是它们的错误方向能够互补。

> 原版对应：PDF 第 4–5 页，Boosting intuition。

## AdaBoost

![AdaBoost 如何根据错分掩码提高困难样本的权重](/images/notes/cs229/tikz/p13-adaboost-weight-update.png)

AdaBoost 维护样本权重。每轮：

1. 用当前权重训练弱分类器 $G_m$；
2. 计算加权错误率 $\operatorname{err}_m$；
3. 计算模型权重；
4. 提高被错分样本权重；
5. 重新归一化。

常见模型权重为：

$$
\alpha_m=\frac12\log
\frac{1-\operatorname{err}_m}{\operatorname{err}_m}
$$

最终预测：

$$
\operatorname{sign}
\left(\sum_m\alpha_mG_m(x)\right)
$$

AdaBoost 可解释为逐步最小化指数损失。错误样本会获得指数增长的关注，因此脏标签可能持续吸引后续模型。

> 原版对应：PDF 第 5–6 页，AdaBoost。

## 梯度提升

![Gradient Boosting 计算函数空间负梯度、拟合弱学习器并更新集成分数](/images/notes/cs229/tikz/concept-gradient-boosting-residual.png)

Gradient Boosting 把“关注错误样本”推广为函数空间梯度下降。

当前模型为 $F_{m-1}$，计算每个样本对损失的负梯度，也叫伪残差：

$$
r_{im}
=-\left[
\frac{\partial L(y_i,F(x_i))}
{\partial F(x_i)}
\right]_{F=F_{m-1}}
$$

训练新基学习器拟合 $r_{im}$，再以学习率 $\nu$ 加入：

$$
F_m(x)=F_{m-1}(x)+\nu\gamma_mG_m(x)
$$

树深度决定单轮可表达交互阶数；学习率与树数量强耦合。较小学习率通常需要更多树，但更容易获得稳健泛化。

现代 GBDT 还加入行/列采样、L1/L2、叶子约束、缺失值方向和高效直方图算法。

> 原版对应：PDF 第 6–7 页，Forward stagewise additive modeling and gradient boosting。

## 本章检查

- 能用“方差和相关性”解释 Bagging；
- 能说明随机特征子集为什么帮助随机森林；
- 能使用 OOB 误差但不把它和最终测试集混淆；
- 能写出 AdaBoost 的样本权重与模型权重直觉；
- 能把 Gradient Boosting 解释为函数空间梯度下降；
- 能说明学习率、树深度和树数量之间的关系；
- 能识别噪声标签对 Boosting 的影响。

下一章进入 [机器学习策略与误差分析](/notes/cs229/course/ml-strategy-error-analysis)，学习在模型表现不好时先定位哪一层出了问题。

## 来源说明

本章对应 [CS229 Ensemble Learning Notes](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes-ensemble.pdf)。中文内容为独立重构讲解。
