---
title: P4：局部加权回归、逻辑回归与牛顿法
description: 对应 B 站 P4 与 CS229 Lecture 3，解释参数/非参数学习、局部加权回归、逻辑回归似然和牛顿法。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 从参数模型到非参数模型

线性回归学习固定维度参数 $\theta$。训练完成后，原始训练集可以不再参与预测：

$$
h_\theta(x)=\theta^\top x
$$

这类方法称为参数方法。无论数据增加多少，参数数量都由特征维度决定。

非参数方法不意味着“没有参数”，而是模型复杂度可以随数据增加。局部加权回归在每个查询点附近重新拟合，因此预测仍依赖训练数据。

## 局部加权线性回归

对查询点 $x$，给训练样本分配权重：

$$
w^{(i)}
=\exp\left(
-\frac{\|x^{(i)}-x\|_2^2}{2\tau^2}
\right)
$$

然后求解：

$$
\theta(x)
=\arg\min_\theta
\frac12\sum_{i=1}^{m}
w^{(i)}
\left(
y^{(i)}-\theta^\top x^{(i)}
\right)^2
$$

离查询点越近的样本权重越大。得到 $\theta(x)$ 后，只用它预测当前查询点。

矩阵形式为：

$$
\theta(x)
=(X^\top WX)^{-1}X^\top Wy
$$

$W$ 是以 $w^{(i)}$ 为对角元素的矩阵。实现时仍应求解线性方程，不显式求逆。

## 带宽参数

$\tau$ 控制邻域大小：

- $\tau$ 很大：多数样本权重接近，模型接近全局线性回归；
- $\tau$ 很小：只依赖极少邻居，能追随局部变化，但方差增大；
- 查询点附近数据稀疏：$X^\top WX$ 可能病态。

$\tau$ 应通过验证集或交叉验证选择。训练误差会偏爱很小带宽，因此不能用训练拟合程度决定。

局部加权回归预测成本高，需要保存数据并重复求解；大数据场景常用近邻索引或局部近似降低计算量。

## 从回归进入分类

二分类目标：

$$
y\in\{0,1\}
$$

直接用线性回归预测会产生小于 $0$ 或大于 $1$ 的值，也不符合概率输出范围。

逻辑回归先计算线性分数：

$$
z=\theta^\top x
$$

再通过 Sigmoid：

$$
g(z)
=\frac{1}{1+e^{-z}}
$$

定义：

$$
h_\theta(x)
=P(y=1\mid x;\theta)
=g(\theta^\top x)
$$

输出位于 $(0,1)$，可以解释为条件概率。

## Sigmoid 与决策边界

Sigmoid 满足：

$$
g'(z)=g(z)(1-g(z))
$$

若采用阈值 $0.5$：

$$
h_\theta(x)\ge0.5
\Longleftrightarrow
\theta^\top x\ge0
$$

所以原始特征下决策边界是：

$$
\theta^\top x=0
$$

概率输出是非线性的，但边界仍由特征表示决定。加入多项式或其他基函数后，原输入空间中可以形成非线性边界。

## 伯努利似然

给定 $x$，假设：

$$
y\mid x;\theta
\sim\operatorname{Bernoulli}(h_\theta(x))
$$

单样本概率可统一写成：

$$
p(y\mid x;\theta)
=h_\theta(x)^y
\left(1-h_\theta(x)\right)^{1-y}
$$

独立样本似然：

$$
L(\theta)
=\prod_{i=1}^{m}
h_\theta(x^{(i)})^{y^{(i)}}
\left(
1-h_\theta(x^{(i)})
\right)^{1-y^{(i)}}
$$

对数似然：

$$
\ell(\theta)
=\sum_{i=1}^{m}
\left[
y^{(i)}\log h_\theta(x^{(i)})
+(1-y^{(i)})
\log(1-h_\theta(x^{(i)}))
\right]
$$

最大化它等价于最小化二元交叉熵。

## 逻辑回归梯度

利用 Sigmoid 导数，可得到：

$$
\frac{\partial\ell}{\partial\theta_j}
=\sum_{i=1}^{m}
\left(
y^{(i)}-h_\theta(x^{(i)})
\right)x_j^{(i)}
$$

向量形式：

$$
\nabla_\theta\ell
=X^\top(y-h)
$$

若最小化负对数似然，梯度符号相反：

$$
\nabla_\theta J
=X^\top(h-y)
$$

公式看起来像线性回归，但误差来自概率模型，目标函数也不同。

## 数值稳定的损失实现

直接计算：

$$
\log g(z)
\quad\text{和}\quad
\log(1-g(z))
$$

在 $|z|$ 很大时可能产生上溢、下溢或 `log(0)`。

实际应使用 logits 形式的稳定交叉熵，例如：

$$
\max(z,0)-yz+\log(1+e^{-|z|})
$$

成熟框架的 `binary_cross_entropy_with_logits` 会处理这些细节。不要先算 Sigmoid 再把概率传给 logits 版本损失。

## 牛顿法

一维函数求根时，牛顿法用当前点的切线估计根：

$$
\theta
\leftarrow
\theta
-\frac{f(\theta)}{f'(\theta)}
$$

为了最大化 $\ell(\theta)$，寻找梯度为零的位置。多维牛顿更新为：

$$
\theta
\leftarrow
\theta-H^{-1}\nabla\ell(\theta)
$$

$H$ 是对数似然的 Hessian。

逻辑回归 Hessian：

$$
H=-X^\top RX
$$

其中：

$$
R_{ii}=h_i(1-h_i)
$$

负号说明对数似然是凹函数。最小化负对数似然时 Hessian 为 $X^\top RX\succeq0$。

## IRLS 视角

牛顿法更新可改写为迭代重加权最小二乘。每轮根据当前预测构造权重 $R$ 和工作响应，再解一个加权线性系统。

这揭示了两个性质：

- 高置信度概率接近 $0$ 或 $1$ 时，$h_i(1-h_i)$ 很小；
- 决策边界附近的样本对局部曲率影响更大。

不要显式求 Hessian 的逆，应解：

$$
H\Delta=\nabla\ell
$$

再更新 $\theta\leftarrow\theta-\Delta$。高维场景通常改用一阶或拟牛顿方法。

## 完全可分问题

若存在一个超平面把训练数据完全分开，无正则逻辑回归的似然可能通过不断放大 $\|\theta\|$ 接近上确界，却没有有限最大值。

表现包括：

- 参数绝对值持续增大；
- 训练分类完全正确；
- Hessian 越来越病态；
- 概率极端但泛化未必可靠。

$L_2$ 正则化可让目标具有有限解：

$$
J(\theta)
=-\ell(\theta)
+\frac{\lambda}{2}\|\theta\|_2^2
$$

通常不惩罚截距项。

## 本节检查

- 能区分参数方法和非参数方法；
- 能写出局部加权回归目标并解释 $\tau$；
- 能从伯努利模型写出逻辑回归似然；
- 能推出 $X^\top(h-y)$ 梯度；
- 能说明概率输出与线性决策边界的关系；
- 能解释牛顿法如何使用 Hessian；
- 知道代码中如何稳定计算交叉熵；
- 能识别完全可分导致的参数发散。

下一节进入 [P5：感知机、指数族与 GLM](/notes/cs229/course/p05-perceptron-generalized-linear-models)。

## 来源说明

- 视频：[B 站 P4：Lecture 3](https://www.bilibili.com/video/BV1fP4y127nn/?p=4)
- 讲义：[Lecture Notes 1，第 13–21 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes1.pdf)
- 作业：[Problem Set 1](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS1/ps1.pdf)

中文内容按课堂顺序重构，并补充实现中的数值稳定与完全可分边界。
