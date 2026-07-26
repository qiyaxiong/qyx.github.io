---
title: 第 2 章：逻辑回归、指数族与 GLM
description: 从二分类的伯努利似然推导 Logistic Regression，再用指数族和 GLM 统一线性回归、逻辑回归与 Softmax。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 分类问题

回归预测连续数值，分类预测离散标签。二分类中通常令 $y\in\{0,1\}$，例如 1 表示垃圾邮件，0 表示正常邮件。

直接用线性回归预测类别存在两个问题：$\theta^\top x$ 可以小于 0 或大于 1；平方损失也没有表达“标签由伯努利分布产生”这一事实。

我们需要一个始终落在 $[0,1]$ 的函数，并希望输出能够解释为条件概率：

$$
h_\theta(x)=P(y=1\mid x;\theta)
$$

> 原版对应：PDF 第 16 页，Classification and logistic regression。

## 逻辑回归

逻辑回归把线性打分 $\theta^\top x$ 送入 Sigmoid：

$$
h_\theta(x)=\sigma(\theta^\top x)
=\frac{1}{1+\exp(-\theta^\top x)}
$$

Sigmoid 将整个实数轴压缩到 $(0,1)$。当打分为 0 时输出 0.5；打分趋向正无穷时概率趋向 1；趋向负无穷时概率趋向 0。

它的关键导数是：

$$
\sigma'(z)=\sigma(z)(1-\sigma(z))
$$

若用 0.5 作为分类阈值，决策边界满足 $\theta^\top x=0$。因此逻辑回归的概率是非线性的，但原始特征空间中的边界仍然是线性的。

阈值不是模型参数。训练得到概率后，应根据误报、漏报代价和业务约束选择阈值。

> 原版对应：PDF 第 16–17 页，Logistic regression。

## 伯努利似然

给定 $x$，标签服从参数为 $h_\theta(x)$ 的伯努利分布：

$$
p(y\mid x;\theta)
=h_\theta(x)^y(1-h_\theta(x))^{1-y}
$$

假设样本条件独立，联合似然是：

$$
L(\theta)=\prod_{i=1}^{m}
h_\theta(x^{(i)})^{y^{(i)}}
(1-h_\theta(x^{(i)}))^{1-y^{(i)}}
$$

取对数得到：

$$
\ell(\theta)=\sum_{i=1}^{m}
\left[
y^{(i)}\log h_\theta(x^{(i)})
+(1-y^{(i)})\log(1-h_\theta(x^{(i)}))
\right]
$$

最大化 $\ell$ 等价于最小化二元交叉熵。单个样本的梯度为：

$$
\frac{\partial \ell}{\partial\theta_j}
=(y-h_\theta(x))x_j
$$

它和线性回归的 LMS 更新长得相同，但 $h_\theta$ 已经改变，所以不是同一个算法。

数值实现不要先计算极小概率再取对数。应使用 `logaddexp`、`logsigmoid` 或框架提供的 logits 版本损失。

> 原版对应：PDF 第 18–19 页，Likelihood and gradient ascent。

## 牛顿法

梯度法只使用一阶导数。牛顿法同时使用 Hessian 描述局部曲率：

$$
\theta\leftarrow\theta-H^{-1}\nabla_\theta\ell(\theta)
$$

对于逻辑回归：

$$
H=-X^\top W X
$$

其中 $W$ 是对角矩阵，第 $i$ 个元素为 $h_i(1-h_i)$。Hessian 为半负定，因此对数似然是凹函数；负对数似然是凸函数。

牛顿法通常需要较少迭代，但每次要构造并求解涉及 Hessian 的线性系统。当特征维度很高时，L-BFGS、SGD 或一阶自适应方法更实用。

实现时应解线性方程，不要显式计算 $H^{-1}$。

> 原版对应：PDF 第 20–21 页，Newton–Raphson method。

## 指数族

指数族分布可写成：

$$
p(y;\eta)=b(y)\exp\left(\eta^\top T(y)-a(\eta)\right)
$$

$\eta$ 是自然参数，$T(y)$ 是充分统计量，$a(\eta)$ 是对数配分函数。配分函数保证概率归一化，并连接自然参数与期望。

伯努利分布的自然参数为：

$$
\eta=\log\frac{\phi}{1-\phi}
$$

反解得到：

$$
\phi=\frac{1}{1+\exp(-\eta)}
$$

因此 Sigmoid 不是随意挑选的压缩函数，而是伯努利分布自然参数映射回均值时产生的响应函数。

高斯、伯努利、Poisson、多项分布、Gamma 等都属于指数族，这为不同类型目标提供了统一建模入口。

> 原版对应：PDF 第 22–24 页，The exponential family。

## 广义线性模型

构造 GLM 使用三个决定：

1. 给定 $x$ 后，$y$ 来自某个指数族分布；
2. 模型预测 $E[T(y)\mid x]$；
3. 自然参数和输入线性相关：$\eta=\theta^\top x$。

若选择高斯分布，响应函数是恒等映射，得到普通线性回归。若选择伯努利分布，响应函数是 Sigmoid，得到逻辑回归。

若目标是计数，可以选择 Poisson 分布，对应指数响应函数。关键是先根据目标变量的支持集和噪声结构选择分布，再由 GLM 推出 link，而不是反过来套公式。

GLM 统一的是“分布—自然参数—线性预测器—均值”这条链，不保证所有现实数据都满足对应分布假设。

> 原版对应：PDF 第 24–26 页，Constructing generalized linear models。

## Softmax 回归

当 $y\in\{1,\ldots,k\}$ 时，用多项分布建模。为避免参数冗余，可以选择一个参考类别，或使用带平移不变性的 $k$ 组 logits。

Softmax 概率是：

$$
P(y=i\mid x;\theta)
=\frac{\exp(\theta_i^\top x)}
{\sum_{j=1}^{k}\exp(\theta_j^\top x)}
$$

所有类别概率非负且总和为 1。训练通过最大化多项分布对数似然，也就是最小化多类交叉熵。

计算时先减去最大 logit：

$$
\operatorname{softmax}(z)_i
=\frac{\exp(z_i-\max z)}
{\sum_j\exp(z_j-\max z)}
$$

这个变换不改变结果，却能避免指数溢出。

> 原版对应：PDF 第 26–30 页，Softmax regression。

## 本章检查

- 能从伯努利条件分布写出逻辑回归对数似然；
- 能解释概率、似然、阈值和类别预测之间的区别；
- 能推导 $\sigma'(z)$ 与单样本梯度；
- 能说明牛顿法为什么比梯度法单步更贵；
- 能从指数族的自然参数推出 Logistic 和 Softmax；
- 能使用 logits 版本损失，避免 `log(0)` 与指数溢出。

下一章进入 [生成式学习](/notes/cs229/course/generative-learning)，比较直接学习 $P(y\mid x)$ 和先学习 $P(x\mid y)P(y)$ 的不同。

## 来源说明

本章对应 [CS229 Lecture Notes 1 第 16–30 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes1.pdf)。中文内容为独立重构讲解。
