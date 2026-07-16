---
title: GDA 和 Logistic Regression 的关系
description: 比较 GDA 与 Logistic Regression 的建模方向、共同线性边界、参数估计和样本效率。
publishDate: 2026-07-16
updatedDate: 2026-07-16
language: zh
---

GDA 与 Logistic Regression 都能产生线性决策边界，但原因和假设不同。

## 两种建模方向

Logistic Regression 直接建模：

$$
p(y\mid x;\theta).
$$

GDA 建模联合分布的组成部分：

$$
p(y),\qquad p(x\mid y),
$$

再通过 Bayes 规则得到 $p(y\mid x)$。前者是判别式方法，后者是生成式方法。

## GDA 的假设

二分类、共享协方差时：

$$
y\sim\operatorname{Bernoulli}(\phi),
$$

$$
x\mid y=0\sim\mathcal{N}(\mu_0,\Sigma),\qquad
x\mid y=1\sim\mathcal{N}(\mu_1,\Sigma).
$$

考察 posterior odds：

$$
\log\frac{p(y=1\mid x)}{p(y=0\mid x)}.
$$

展开两个高斯密度后，关于 $x$ 的二次项因为共享 $\Sigma$ 相消，最终只剩

$$
\theta^Tx+\theta_0.
$$

因此后验具有 sigmoid 形式，决策边界是线性的。

## 为什么它们仍不是同一个模型

相同的是条件分布的函数形式；不同的是参数如何被约束和估计。

| 维度     | GDA                        | Logistic Regression |
| -------- | -------------------------- | ------------------- |
| 建模对象 | $p(x\mid y)$ 与 $p(y)$     | $p(y\mid x)$        |
| 假设强度 | 较强，需要类别条件高斯     | 较弱，不规定 $p(x)$ |
| 参数估计 | 类别均值、共享协方差、先验 | 直接优化条件似然    |
| 小样本   | 假设正确时可能更省样本     | 通常需要更多数据    |
| 假设错误 | 可能产生较大模型偏差       | 通常更稳健          |

## 协方差不共享时

若两个类别分别使用 $\Sigma_0$ 和 $\Sigma_1$，二次项不再相消，log-odds 对 $x$ 成为二次函数，得到 Quadratic Discriminant Analysis 的二次边界。

这说明“线性边界”不是高斯分布自动带来的，而是共享协方差这一结构性假设的结果。

## 实验建议

用同一组二维数据比较三种情况：

1. 类别确实近似高斯且协方差相同；
2. 协方差不同；
3. 分布明显非高斯。

分别改变样本量，观察 GDA 的样本效率和 Logistic Regression 的稳健性。实验重点不是比较一次准确率，而是理解假设何时成为帮助、何时成为偏差。
