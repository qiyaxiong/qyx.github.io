---
title: P7：高斯判别分析与朴素贝叶斯
description: 对应 B 站 P7 与 CS229 Lecture 5，从判别式和生成式学习的差别，推导 GDA、Naive Bayes 与文本事件模型。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 判别式与生成式学习

逻辑回归直接学习：

$$
P(y\mid x)
$$

这属于判别式学习。它关注给定输入后类别的条件分布。

生成式学习分别建模：

$$
P(x\mid y)
\quad\text{和}\quad
P(y)
$$

再用 Bayes 公式：

$$
P(y\mid x)
=\frac{P(x\mid y)P(y)}{P(x)}
$$

分类时只需比较：

$$
\arg\max_yP(x\mid y)P(y)
$$

因为分母 $P(x)$ 对所有类别相同。

## 多元高斯

高斯判别分析假设每一类的特征服从多元高斯：

$$
x\mid y=k
\sim\mathcal N(\mu_k,\Sigma)
$$

密度：

$$
p(x\mid y=k)
=\frac{1}{
(2\pi)^{n/2}|\Sigma|^{1/2}
}
\exp\left(
-\frac12
(x-\mu_k)^\top
\Sigma^{-1}
(x-\mu_k)
\right)
$$

$\mu_k$ 是类别中心，$\Sigma$ 描述各方向尺度和特征相关性。

## GDA 模型

二分类 GDA 假设：

$$
y\sim\operatorname{Bernoulli}(\phi)
$$

$$
x\mid y=0\sim\mathcal N(\mu_0,\Sigma)
$$

$$
x\mid y=1\sim\mathcal N(\mu_1,\Sigma)
$$

训练最大化联合似然：

$$
L(\phi,\mu_0,\mu_1,\Sigma)
=\prod_{i=1}^{m}
p(x^{(i)}\mid y^{(i)})
p(y^{(i)})
$$

## GDA 的最大似然估计

类别先验：

$$
\phi
=\frac1m
\sum_{i=1}^{m}\mathbf1\{y^{(i)}=1\}
$$

类别均值：

$$
\mu_k
=
\frac{
\sum_i\mathbf1\{y^{(i)}=k\}x^{(i)}
}{
\sum_i\mathbf1\{y^{(i)}=k\}
}
$$

共享协方差：

$$
\Sigma
=\frac1m
\sum_{i=1}^{m}
\left(
x^{(i)}-\mu_{y^{(i)}}
\right)
\left(
x^{(i)}-\mu_{y^{(i)}}
\right)^\top
$$

这些都是闭式估计，不需要梯度下降。

## 为什么边界是线性的

比较两个类别的对数后验比：

$$
\log
\frac{P(y=1\mid x)}{P(y=0\mid x)}
$$

共享 $\Sigma$ 使二次项 $x^\top\Sigma^{-1}x$ 抵消，最终只剩：

$$
\theta^\top x+\theta_0
$$

因此 GDA 的后验可写成 Sigmoid 形式，决策边界为线性。

如果每个类别使用不同协方差 $\Sigma_k$，二次项不再抵消，会得到二次判别边界。

## GDA 与逻辑回归

GDA 对联合分布作更强假设。若高斯与共享协方差假设接近真实，它能更有效利用少量数据。

逻辑回归只建模 $P(y\mid x)$，假设更弱。在生成分布明显偏离高斯时，通常更稳健。

两者都可能形成线性边界，但这不表示学习过程相同：

- GDA 拟合类先验、均值和协方差；
- 逻辑回归直接拟合条件对数几率；
- GDA 能计算 $p(x)$ 相关量并生成特征；
- 逻辑回归更专注分类边界。

## 离散特征与 Naive Bayes

文本特征常是离散变量。Naive Bayes 假设给定类别后，各特征条件独立：

$$
p(x\mid y)
=\prod_{j=1}^{n}p(x_j\mid y)
$$

于是：

$$
p(y\mid x)
\propto
p(y)
\prod_{j=1}^{n}p(x_j\mid y)
$$

“Naive” 指条件独立假设很强，不代表算法没有价值。即使概率估计不完全正确，分类边界仍可能很好。

## Bernoulli 文本事件模型

词表大小为 $n$，用：

$$
x_j\in\{0,1\}
$$

表示第 $j$ 个词是否出现。

估计：

$$
\phi_{j\mid y=1}
=P(x_j=1\mid y=1)
$$

预测时累加对数概率：

$$
\log p(y)
+\sum_j\log p(x_j\mid y)
$$

使用对数避免许多小概率连乘下溢。

## Multinomial 事件模型

另一种表示把文档看作词序列或词频，建模每次词出现来自类别相关的多项分布。

与 Bernoulli 模型相比：

- Bernoulli 关心“词是否出现”；
- Multinomial 关心“词出现多少次”；
- 长文档中的重复词会在 Multinomial 中产生更强影响。

模型选择应通过验证集，而不是仅凭文本直觉。

## 拉普拉斯平滑预告

若训练集中某个类别从未出现某个词，最大似然估计给出零概率，整个文档似然会因一次未见事件变为零。

下一节会使用拉普拉斯平滑：

$$
\hat\phi
=\frac{\text{count}+\alpha}
{\text{total}+\alpha K}
$$

给未见事件保留非零概率。

## 实现检查

- 对协方差增加小的对角正则项以改善数值稳定；
- 不显式求 $\Sigma^{-1}$，使用线性方程或 Cholesky；
- 在对数空间计算 Naive Bayes 分数；
- 只用训练集构建词表，避免数据泄漏；
- 类别严重不平衡时检查先验和每类召回率；
- 用校准曲线单独评价概率质量。

## 本节检查

- 能区分判别式和生成式学习；
- 能写出 GDA 的生成假设与闭式参数估计；
- 能解释共享协方差为何产生线性边界；
- 能比较 GDA 和逻辑回归的假设强弱；
- 能写出 Naive Bayes 条件独立分解；
- 能区分 Bernoulli 与 Multinomial 文本模型；
- 能说明零计数为什么需要平滑；
- 能在对数空间实现稳定预测。

下一节进入 [P8：支持向量机](/notes/cs229/course/p08-support-vector-machines)。

## 来源说明

- 视频：[B 站 P7：Lecture 5](https://www.bilibili.com/video/BV1fP4y127nn/?p=7)
- 讲义：[Lecture Notes 2](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes2.pdf)
- 作业：[Problem Set 1](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS1/ps1.pdf)

中文内容对应 GDA、Naive Bayes 与文本事件模型的课堂主线。
