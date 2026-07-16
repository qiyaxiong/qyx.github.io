---
title: Logistic Regression 推导笔记
description: 从 Bernoulli 条件模型推导 Logistic Regression 的对数似然、梯度、Hessian 与 Newton 更新。
publishDate: 2026-07-16
updatedDate: 2026-07-16
language: zh
---

## 模型

令 $y\in\{0,1\}$，并定义

$$
h_\theta(x)=\sigma(\theta^Tx).
$$

把它解释为条件概率：

$$
p(y=1\mid x;\theta)=h_\theta(x),\qquad
p(y=0\mid x;\theta)=1-h_\theta(x).
$$

两种情况可以合并为

$$
p(y\mid x;\theta)=h_\theta(x)^y(1-h_\theta(x))^{1-y}.
$$

## 对数似然

假设样本条件独立：

$$
\ell(\theta)=\sum_{i=1}^m\left[
y^{(i)}\log h_\theta(x^{(i)})+
(1-y^{(i)})\log(1-h_\theta(x^{(i)}))
\right].
$$

最大化 $\ell$ 等价于最小化负对数似然，也就是常见的 binary cross-entropy。

## 梯度

利用 $\sigma'(z)=\sigma(z)(1-\sigma(z))$，单个样本对参数的梯度化简为

$$
\nabla_\theta \ell_i(\theta)=
(y^{(i)}-h_\theta(x^{(i)}))x^{(i)}.
$$

矩阵形式为

$$
\nabla_\theta \ell=X^T(y-h).
$$

若使用平均负对数似然 $J=-\ell/m$，则

$$
\nabla_\theta J=\frac1mX^T(h-y).
$$

正负号取决于最大化还是最小化，必须与更新方向一起检查。

## Hessian 与 Newton's Method

对 log-likelihood，有

$$
H=-X^TRX,
$$

其中 $R$ 是对角矩阵，$R_{ii}=h_i(1-h_i)$。因此 $H$ 半负定，对数似然是凹函数。

Newton 更新写作

$$
\theta\leftarrow\theta-H^{-1}\nabla\ell(\theta).
$$

实现时求解 $H\Delta=\nabla\ell$，再更新 $\theta\leftarrow\theta-\Delta$，不要显式计算逆矩阵。

## 决策边界

以 $0.5$ 为阈值时，$\sigma(\theta^Tx)=0.5$ 等价于

$$
\theta^Tx=0.
$$

因此原始特征空间中的边界是线性的；非线性边界来自特征变换，而不是 sigmoid 本身。

## 数值检查

- 用有限差分验证梯度；
- 对极大和极小 logits 测试 loss 是否有限；
- 检查加入常数特征后的 bias shape；
- 分离数据上参数可能不断增大，需要正则化或停止条件。
