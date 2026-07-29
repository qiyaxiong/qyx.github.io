---
title: 第 17 章：独立成分分析 ICA
description: 从盲源分离问题出发，理解 ICA 的非高斯独立性假设、不可辨识性、密度变换和最大似然算法。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 盲源分离

鸡尾酒会问题中，多个麦克风记录多个独立声源的线性混合。

设源信号：

$$
s\in\mathbb R^n
$$

观测：

$$
x=As
$$

$A$ 是未知混合矩阵。ICA 希望从观测 $x$ 同时恢复源 $s$ 和解混矩阵：

$$
W=A^{-1},\qquad s=Wx
$$

“盲”表示不知道原始源，也不知道混合方式。

> 原版对应：PDF 第 1 页，Independent components and blind source separation。

## ICA 假设

核心假设是源分量统计独立：

$$
p(s)=\prod_i p(s_i)
$$

并且至多一个源可以是高斯分布。

为什么需要非高斯？多个独立标准高斯经过正交旋转后仍是相同联合高斯，无法从分布中识别旋转方向。

ICA 使用高阶统计依赖，而 PCA 只消除二阶相关性。零相关不等于独立，除非变量联合高斯。

> 原版对应：PDF 第 1–2 页，ICA assumptions。

## 不可辨识性

ICA 无法确定源的绝对尺度。若把某个源乘以常数，同时把 $A$ 对应列除以同一常数，观测不变。

ICA 也无法确定源顺序。交换 $s$ 的分量和 $A$ 的列，仍得到相同 $x$。

因此恢复结果只在缩放、符号和排列意义下可辨识。

评估不能要求输出与真实源逐元素完全相同，应先做最佳排列、符号和尺度对齐，再比较相关性或分离指标。

> 原版对应：PDF 第 2–3 页，ICA ambiguities。

## 密度线性变换

![ICA 解混、源密度与变量变换 Jacobian 行列式的完整似然链](/images/notes/cs229/tikz/concept-ica-change-of-variables.png)

若 $s=Wx$，密度变换公式为：

$$
p_x(x)=p_s(Wx)|\det W|
$$

独立假设使：

$$
p_s(Wx)=\prod_i p_i(w_i^\top x)
$$

数据对数似然：

$$
\ell(W)
=\sum_{t}\sum_i\log p_i(w_i^\top x^{(t)})
+m\log|\det W|
$$

行列式项补偿线性变换对体积的伸缩。遗漏它会得到错误密度。

> 原版对应：PDF 第 3–4 页，Densities and linear transformations。

## ICA 算法

![ICA 通过解混矩阵恢复独立非 Gaussian 潜在源](/images/notes/cs229/tikz/p22-ica-unmixing.png)

选择非高斯源密度或其 score function，对 $\ell(W)$ 做梯度上升。

一种自然梯度形式近似为：

$$
W\leftarrow W+\alpha
\left[I-g(Wx)(Wx)^\top\right]W
$$

其中 $g$ 与源密度的对数导数有关。

实践中常先中心化和白化数据，使协方差为单位矩阵。这样剩余混合接近正交旋转，优化更稳定。

初始化、源分布假设和收敛准则都会影响结果。对时间信号还应检查源的时序结构，而不只看静态散点。

> 原版对应：PDF 第 4–6 页，ICA algorithm。

## 本章检查

- 能写出 $x=As$ 和 $s=Wx$；
- 能解释独立比不相关更强；
- 能说明为何多个高斯源无法识别旋转；
- 能列出尺度、符号和排列不可辨识性；
- 能写出密度变换中的 $|\det W|$；
- 能解释中心化和白化在 ICA 前的作用；
- 能用对齐后的分离指标评价结果。

下一部分进入 [强化学习与 MDP](/notes/cs229/course/reinforcement-learning-mdp)，模型开始处理动作会改变未来数据分布的序列决策问题。

## 来源说明

本章对应 [CS229 Lecture Notes 11](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes11.pdf)。中文内容为独立重构讲解。
