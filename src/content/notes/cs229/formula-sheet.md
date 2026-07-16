---
title: CS229 公式卡片
description: 为 CS229 核心模型记录公式、变量 shape、成立条件、优化方向和数值注意点。
publishDate: 2026-07-16
updatedDate: 2026-07-16
language: zh
---

公式卡片不是公式清单。每张卡片必须同时写：公式、变量 shape、成立条件、用途和数值注意点。

## Linear Regression

$$
J(\theta)=\frac{1}{2m}\lVert X\theta-y\rVert_2^2,
\qquad
\nabla_\theta J=\frac{1}{m}X^T(X\theta-y).
$$

- $X\in\mathbb{R}^{m\times n}$，$\theta\in\mathbb{R}^n$；
- 正规方程需要处理 $X^TX$ 不可逆或病态的情况；
- 实现时优先线性求解或伪逆，不显式求逆。

## Sigmoid

$$
\sigma(z)=\frac{1}{1+e^{-z}},
\qquad
\sigma'(z)=\sigma(z)(1-\sigma(z)).
$$

- 输出位于 $(0,1)$；
- 大幅值输入需要稳定实现；
- 导数最大值为 $1/4$。

## Logistic Regression

$$
J(\theta)=-\frac{1}{m}\sum_{i=1}^m
\left[y^{(i)}\log h_\theta(x^{(i)})+
(1-y^{(i)})\log(1-h_\theta(x^{(i)}))\right].
$$

$$
\nabla_\theta J=\frac{1}{m}X^T(h-y).
$$

- 标签约定为 $\{0,1\}$；
- 若优化 log-likelihood，梯度方向相反；
- 稳定实现应直接基于 logits 计算 loss。

## Gaussian

$$
p(x)=\frac{1}{(2\pi)^{n/2}|\Sigma|^{1/2}}
\exp\left(-\frac12(x-\mu)^T\Sigma^{-1}(x-\mu)\right).
$$

- $\Sigma$ 对称半正定；
- 计算密度时使用 Cholesky 或线性求解；
- 共享协方差的 GDA 导出线性 log-odds。

## Kernel

$$
K(x,z)=\phi(x)^T\phi(z).
$$

- 有效 kernel 的 Gram matrix 应半正定；
- kernel trick 只适用于算法通过内积使用特征的部分；
- RBF kernel 的带宽控制相似性的局部尺度。
