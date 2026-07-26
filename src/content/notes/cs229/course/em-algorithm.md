---
title: 第 14 章：EM 算法与隐变量模型
description: 用 Jensen 不等式构造对数似然下界，推导 E 步、M 步和单调改进性质，再回看 GMM 的更新来源。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 为什么需要 EM

含隐变量 $z$ 的模型观测似然是：

$$
\ell(\theta)
=\sum_i\log p(x^{(i)};\theta)
=\sum_i\log\sum_zp(x^{(i)},z;\theta)
$$

对数外面包着求和，使参数无法像完整数据那样直接分解优化。

若 $z$ 可见，很多模型会变成简单的带标签估计。EM 的思路是用当前参数推断 $z$ 的分布，再在这个软完整数据上更新参数。

> 原版对应：PDF 第 1 页，The latent-variable likelihood。

## Jensen 不等式

对凹函数 $f$：

$$
f(E[X])\ge E[f(X)]
$$

$\log$ 是凹函数，因此：

$$
\log E[X]\ge E[\log X]
$$

等号在相关随机量为常数时成立。

EM 用一个任意分布 $Q_i(z)$ 把隐变量求和改写为期望：

$$
\log\sum_zp(x_i,z;\theta)
=\log\sum_zQ_i(z)
\frac{p(x_i,z;\theta)}{Q_i(z)}
$$

然后应用 Jensen 得到可优化下界。

> 原版对应：PDF 第 1–2 页，Jensen's inequality。

## 构造下界

下界为：

$$
\mathcal L(\theta,Q)
=\sum_i\sum_zQ_i(z)
\log\frac{p(x_i,z;\theta)}{Q_i(z)}
$$

它也可写成：

$$
\log p(x_i;\theta)
=\mathcal L_i(\theta,Q_i)
+D_{\mathrm{KL}}
\left(Q_i(z)\,\|\,p(z\mid x_i;\theta)\right)
$$

KL 散度非负，因此 $\mathcal L$ 是对数似然下界。

当：

$$
Q_i(z)=p(z\mid x_i;\theta)
$$

KL 为零，下界与当前对数似然贴紧。

> 原版对应：PDF 第 2–3 页，Lower bound construction。

## E 步与 M 步

E 步固定参数 $\theta^{(t)}$，选择：

$$
Q_i^{(t)}(z)
=p(z\mid x_i;\theta^{(t)})
$$

它让下界在当前参数处等于真实似然。

M 步固定 $Q$，更新：

$$
\theta^{(t+1)}
=\arg\max_\theta
\sum_iE_{z\sim Q_i^{(t)}}
[\log p(x_i,z;\theta)]
$$

熵项 $-\sum Q\log Q$ 与 $\theta$ 无关，因此 M 步常被描述为最大化完整数据对数似然的后验期望。

E 步是推断，M 步是参数学习。

> 原版对应：PDF 第 3–5 页，The E-step and M-step。

## 单调改进

E 步让下界贴紧当前似然；M 步提高下界。因此：

$$
\ell(\theta^{(t+1)})
\ge\mathcal L(\theta^{(t+1)},Q^{(t)})
\ge\mathcal L(\theta^{(t)},Q^{(t)})
=\ell(\theta^{(t)})
$$

所以 EM 对数似然单调不下降。

单调不下降不代表到达全局最大值。EM 可能停在局部最优或鞍点，也可能在平坦区域收敛缓慢。

实际停止应同时检查似然改进、参数变化、最大迭代和数值异常。

> 原版对应：PDF 第 4–6 页，Monotonic likelihood improvement。

## 高斯混合重访

GMM 的 E 步责任度就是：

$$
Q_i(z=k)=P(z_i=k\mid x_i;\theta)
$$

M 步最大化软完整数据对数似然，得到混合权重、均值和协方差的加权估计。

这说明 GMM 更新不是孤立技巧，而是一般 EM 模板在特定概率模型上的实例。

当 E 步后验无法精确计算时，可以使用变分近似、Monte Carlo EM 或其他近似推断方法。此时优化的可能是近似下界，而非精确似然。

> 原版对应：PDF 第 6–8 页，Mixture of Gaussians revisited。

## 本章检查

- 能指出隐变量似然中 `log-sum` 的困难；
- 能写出 Jensen 下界；
- 能用 KL 分解解释 E 步为何让下界贴紧；
- 能区分 E 步的后验推断和 M 步的参数优化；
- 能证明 EM 似然单调不下降；
- 能说明单调性为什么不保证全局最优；
- 能把 GMM 责任度和参数更新放回一般 EM 框架。

下一章进入 [Factor Analysis](/notes/cs229/course/factor-analysis)，用低维隐因子解释高维数据的协方差结构。

## 来源说明

本章对应 [CS229 Lecture Notes 8](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes8.pdf)。中文内容为独立重构讲解。
