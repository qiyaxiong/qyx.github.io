---
title: P13：决策树与集成学习
description: 对应 B 站 P13 与 CS229 Lecture 10，从递归切分、纯度和剪枝进入 Bagging、随机森林、AdaBoost 与 Gradient Boosting。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 树模型如何表示非线性

决策树用一系列条件把特征空间递归切成区域。

数值特征切分：

$$
x_j\le s
$$

样本根据条件进入左右子树。叶节点输出常数预测。

单个切分是轴对齐边界，多个切分组合后可以形成复杂的分段常数函数。

## 回归树

区域 $R$ 中以均值作为预测：

$$
\hat y_R
=\frac{1}{|R|}
\sum_{i:x^{(i)}\in R}
y^{(i)}
$$

平方误差：

$$
L(R)
=\sum_{i:x^{(i)}\in R}
\left(
y^{(i)}-\hat y_R
\right)^2
$$

选择特征 $j$ 与阈值 $s$，最小化左右区域总损失：

$$
L(R_{\mathrm{left}})
+L(R_{\mathrm{right}})
$$

## 分类树纯度

节点中类别 $k$ 比例为 $p_k$。

分类错误率：

$$
1-\max_kp_k
$$

Gini impurity：

$$
1-\sum_kp_k^2
$$

Entropy：

$$
-\sum_kp_k\log p_k
$$

选择使子节点加权不纯度下降最多的切分。

不同指标经常给出相近树，但在小样本和类别不平衡时仍需验证。

## 贪心递归切分

寻找全局最优树通常计算困难，因此使用贪心算法：

1. 枚举当前节点候选切分；
2. 选择即时损失下降最大的切分；
3. 对子节点递归；
4. 满足停止条件后生成叶节点。

贪心切分不回溯，早期选择会限制后续结构。

## 类别与缺失特征

低基数类别可枚举类别子集，高基数类别会产生巨大搜索空间。

直接把类别编码成整数并使用大小切分，会人为引入顺序。应使用支持类别特征的算法、合理编码或目标统计，但目标编码必须避免泄漏。

缺失值可通过替代切分、单独类别、插补或模型原生缺失方向处理。训练和部署必须使用一致规则。

## 树的过拟合

不限制深度时，树可以为少量样本建立叶节点，训练误差很低、方差很高。

预剪枝参数包括：

- 最大深度；
- 叶节点最小样本数；
- 切分最小增益；
- 最大叶节点数。

后剪枝先生成较大树，再用验证目标删除收益不足的分支。

## 为什么 Bagging 有效

训练多个模型 $f_b(x)$，平均预测：

$$
\bar f(x)
=\frac1B\sum_{b=1}^{B}f_b(x)
$$

若模型误差方差为 $\sigma^2$、两两相关系数为 $\rho$，平均误差方差近似：

$$
\rho\sigma^2
+\frac{1-\rho}{B}\sigma^2
$$

增加模型数只能消除不相关部分；降低模型相关性同样重要。

## Bootstrap

Bagging 每次从 $m$ 个训练样本中有放回采样 $m$ 次，得到不同 bootstrap 数据集，再训练一个基础模型。

单棵深树对数据扰动敏感，正适合通过平均降低方差。

未被某棵树抽到的样本称为 out-of-bag 样本，可用于近似验证。

## 随机森林

随机森林在 Bagging 基础上，每个节点只从随机特征子集中选择切分。

特征随机性降低树之间相关性。即使某个强特征能在多数节点占优，也不会让所有树形成几乎相同结构。

关键超参数包括树数、单节点候选特征数、树深和叶节点最小样本数。

## Boosting 的不同思路

Bagging 并行训练高方差模型后平均。Boosting 顺序训练弱学习器，让后续模型关注当前组合仍未解决的部分。

最终模型：

$$
F_T(x)
=\sum_{t=1}^{T}\alpha_th_t(x)
$$

每一轮添加一个新学习器。

## AdaBoost

初始化样本权重：

$$
w_i^{(1)}=\frac1m
$$

第 $t$ 轮训练弱分类器 $h_t$，加权错误率：

$$
\varepsilon_t
=\sum_iw_i^{(t)}
\mathbf1\{h_t(x^{(i)})\ne y^{(i)}\}
$$

学习器权重：

$$
\alpha_t
=\frac12\log
\frac{1-\varepsilon_t}{\varepsilon_t}
$$

提高误分类样本权重：

$$
w_i^{(t+1)}
\propto
w_i^{(t)}
\exp\left(
-\alpha_ty^{(i)}h_t(x^{(i)})
\right)
$$

## Gradient Boosting

把加法模型视为函数空间中的梯度下降。

对损失：

$$
\sum_iL(y^{(i)},F(x^{(i)}))
$$

第 $t$ 轮计算负梯度伪残差：

$$
r_i^{(t)}
=-
\left.
\frac{\partial L(y^{(i)},F(x^{(i)}))}
{\partial F(x^{(i)})}
\right|_{F=F_{t-1}}
$$

训练新树拟合 $r_i^{(t)}$，然后：

$$
F_t(x)
=F_{t-1}(x)+\eta h_t(x)
$$

$\eta$ 是学习率。

## 集成方法的诊断

随机森林树数增加通常不会像单树深度那样直接导致过拟合，但计算和延迟增加。

Boosting 更容易受学习率、树深和轮数影响，标签噪声与异常点也可能被持续放大。

比较时记录：

- 训练/验证曲线；
- OOB 或交叉验证指标；
- 单类召回率；
- 推理延迟与模型大小；
- 特征重要性稳定性；
- 概率校准。

树的 impurity importance 会偏爱高基数特征，解释时应结合 permutation importance 或 SHAP，并检查相关特征的替代效应。

## 本节检查

- 能写出回归树区域损失；
- 能比较 Gini、Entropy 与分类错误率；
- 能解释树为什么容易高方差；
- 能用误差相关性解释 Bagging；
- 能说明随机森林怎样降低树之间相关性；
- 能写出 AdaBoost 的加权错误和样本权重更新；
- 能把 Gradient Boosting 解释为函数空间梯度下降；
- 能指出特征重要性与概率输出的诊断风险。

下一节进入 [P14：神经网络基础](/notes/cs229/course/p14-neural-networks-introduction)。

## 来源说明

- 视频：[B 站 P13：Lecture 10](https://www.bilibili.com/video/BV1fP4y127nn/?p=13)
- 决策树：[Decision Trees Notes](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes-dt.pdf)
- 集成学习：[Ensemble Learning Notes](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes-ensemble.pdf)
- 作业：[Problem Set 2](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS2/ps2.pdf)

中文内容对应树、Bagging、随机森林与 Boosting 的课堂顺序。
