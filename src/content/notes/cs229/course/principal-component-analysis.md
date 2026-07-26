---
title: 第 16 章：主成分分析 PCA
description: 从数据中心化、最大方差与最小重建误差推导 PCA，理解特征分解、投影、白化和数据泄漏边界。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 降维问题

高维数据可能包含冗余、相关特征和噪声。PCA 寻找一个低维线性子空间，使投影后尽量保留数据变化。

用途包括可视化、压缩、去噪、加速下游模型和缓解共线性。

PCA 是无监督方法，只使用 $x$，不会主动保留对标签 $y$ 最有用的方向。低方差方向也可能具有强预测价值。

> 原版对应：PDF 第 1 页，Principal components analysis。

## 数据标准化

先计算训练集均值并中心化：

$$
\tilde x^{(i)}=x^{(i)}-\mu
$$

若特征单位不同，还可除以标准差。是否标准化取决于方差大小是否具有实际含义。

所有均值、标准差和主成分都只能在训练集拟合，再应用到验证和测试集。先对全数据做 PCA 会泄漏验证分布。

异常值会强烈影响均值和协方差，需要在 PCA 前检查或使用稳健方法。

> 原版对应：PDF 第 1–2 页，Preprocessing。

## 最大方差方向

寻找单位向量 $u$，使投影方差最大：

$$
\max_{\|u\|=1}
\frac1m\sum_i(u^\top\tilde x^{(i)})^2
$$

设协方差矩阵：

$$
\Sigma=\frac1m\sum_i
\tilde x^{(i)}\tilde x^{(i)\top}
$$

目标变为：

$$
\max_{\|u\|=1}u^\top\Sigma u
$$

最优 $u$ 是最大特征值对应的特征向量。

第二主成分在与第一主成分正交的方向中最大化剩余方差，依次类推。

> 原版对应：PDF 第 2–3 页，Maximum variance directions。

## 特征值推导

拉格朗日函数：

$$
\mathcal L(u,\lambda)
=u^\top\Sigma u-\lambda(u^\top u-1)
$$

令梯度为零：

$$
\Sigma u=\lambda u
$$

因此主成分是协方差矩阵特征向量，解释方差是对应特征值。

保留前 $k$ 个成分的解释方差比：

$$
\frac{\sum_{j=1}^{k}\lambda_j}
{\sum_{j=1}^{n}\lambda_j}
$$

它衡量保留总方差比例，不等于保留任务信息比例。

数值实现通常直接对中心化数据矩阵做 SVD，比显式构造协方差再特征分解更稳定。

> 原版对应：PDF 第 3–4 页，Eigenvalue derivation。

## 投影与重建

令 $U_k$ 包含前 $k$ 个主成分：

$$
z=U_k^\top(x-\mu)
$$

重建：

$$
\hat x=\mu+U_kz
$$

PCA 也等价于寻找使平方重建误差最小的 $k$ 维线性子空间：

$$
\min_{U_k^\top U_k=I}
\sum_i\|x^{(i)}-\hat x^{(i)}\|^2
$$

最大方差和最小重建误差是同一几何问题的两种表述。

白化进一步除以主成分标准差，使变换后协方差接近单位矩阵。小特征值会放大噪声，因此需要截断或加 $\epsilon$。

> 原版对应：PDF 第 4–5 页，Projection, reconstruction and whitening。

## PCA 与因子分析

PCA 是确定性几何投影，优化重建误差或投影方差。

Factor Analysis 是概率生成模型：

$$
x=\mu+\Lambda z+\epsilon
$$

并显式建模每个维度噪声。

PCA 没有独立噪声参数，所有未保留方向都被视为重建残差。Factor Analysis 可通过似然、后验和缺失值推断使用概率结构。

两者可能得到相似子空间，但解释和估计目标不同。

> 原版对应：PDF 第 5–6 页，PCA and probabilistic latent-factor methods。

## 本章检查

- 能说明中心化与标准化的区别；
- 能从最大方差目标推导特征值问题；
- 能解释特征值与解释方差；
- 能写出投影和重建公式；
- 能证明最大方差与最小重建等价；
- 能避免在全数据上拟合 PCA 的泄漏；
- 能区分 PCA 与 Factor Analysis；
- 能说明白化为何可能放大小方差噪声。

下一章进入 [ICA](/notes/cs229/course/independent-component-analysis)，目标从“不相关的最大方差方向”转向“统计独立的潜在源”。

## 来源说明

本章对应 [CS229 Lecture Notes 10](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes10.pdf)。中文内容为独立重构讲解。
