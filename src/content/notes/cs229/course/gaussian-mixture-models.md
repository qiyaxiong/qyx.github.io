---
title: 第 13 章：高斯混合模型
description: 从 K-means 的硬分配走向概率软分配，理解 GMM 的隐变量、责任度、EM 更新与聚类不确定性。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 从硬聚类到软聚类

K-means 为每个样本选择唯一簇。靠近边界的样本即使与两个中心距离相近，也会被硬分到一边。

概率混合模型输出：

$$
P(z^{(i)}=k\mid x^{(i)})
$$

其中 $z$ 是不可直接观察的簇标签。责任度表达每个成分对样本的解释比例，也保留聚类不确定性。

软分配不只是“更平滑的 K-means”，它来自完整概率模型，可以计算似然、生成样本并比较不同协方差结构。

> 原版对应：PDF 第 1 页，Mixtures of Gaussians。

## 高斯混合模型

先抽取成分：

$$
z\sim\operatorname{Categorical}(\phi_1,\ldots,\phi_K)
$$

再从对应高斯生成样本：

$$
x\mid z=k\sim\mathcal N(\mu_k,\Sigma_k)
$$

边缘密度：

$$
p(x)=\sum_{k=1}^{K}
\phi_k\mathcal N(x;\mu_k,\Sigma_k)
$$

混合权重满足 $\phi_k\ge0$ 且 $\sum_k\phi_k=1$。

完整协方差可表达椭球簇，但参数多；对角或球形协方差更稳定。协方差选择就是簇形状的归纳偏置。

> 原版对应：PDF 第 1–2 页，Gaussian mixture model。

## 隐变量与责任度

若 $z^{(i)}$ 已知，可以分别统计每个成分的样本并估计参数。困难在于训练数据只观察到 $x$。

给定当前参数，使用贝叶斯公式计算责任度：

$$
w_{ik}
=P(z^{(i)}=k\mid x^{(i)})
=
\frac{
\phi_k\mathcal N(x^{(i)};\mu_k,\Sigma_k)
}{
\sum_j\phi_j\mathcal N(x^{(i)};\mu_j,\Sigma_j)
}
$$

每个样本的责任度总和为 1。它是后验概率，不是任意距离权重。

数值实现应在 log-space 中计算并使用 log-sum-exp。

> 原版对应：PDF 第 2 页，Latent variables and posterior responsibilities。

## EM 更新

E 步使用当前参数计算 $w_{ik}$。

M 步把责任度当作软计数：

$$
N_k=\sum_iw_{ik}
$$

$$
\phi_k=\frac{N_k}{m}
$$

$$
\mu_k=\frac1{N_k}\sum_iw_{ik}x^{(i)}
$$

$$
\Sigma_k
=\frac1{N_k}\sum_iw_{ik}
(x^{(i)}-\mu_k)(x^{(i)}-\mu_k)^\top
$$

两步交替直到对数似然改进足够小。

GMM 似然非凸，EM 依赖初始化。某个协方差还可能向单个样本塌缩，使似然趋于无穷，需要协方差下限、先验或其他正则化。

> 原版对应：PDF 第 2–3 页，EM updates for Gaussian mixtures。

## 与 K-means 的关系

若所有成分协方差是相同且趋近于零的球形矩阵，责任度会越来越接近 one-hot，GMM 的均值更新趋近 K-means。

两者区别：

| 维度   | K-means    | GMM                |
| ------ | ---------- | ------------------ |
| 分配   | 硬分配     | 概率软分配         |
| 簇形状 | 球形距离   | 由协方差决定       |
| 目标   | 平方失真   | 数据似然           |
| 输出   | 中心与标签 | 密度、责任度与参数 |

不要只用最终标签比较。GMM 的价值还包括异常密度、生成能力和不确定性。

> 原版对应：PDF 第 3–4 页，Relation between EM and K-means。

## 本章检查

- 能写出 GMM 的生成过程和边缘密度；
- 能用贝叶斯公式推导责任度；
- 能解释 E 步和 M 步分别固定什么；
- 能用软计数推导权重、均值和协方差更新；
- 能说明协方差结构如何限制簇形状；
- 能识别似然非凸、初始化和协方差塌缩问题；
- 能解释 GMM 在什么极限下接近 K-means。

下一章进入 [一般 EM 算法](/notes/cs229/course/em-algorithm)，用 Jensen 不等式解释为什么这种交替更新会单调改进似然。

## 来源说明

本章对应 [CS229 Lecture Notes 7b](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes7b.pdf)。中文内容为独立重构讲解。
