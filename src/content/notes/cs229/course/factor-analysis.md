---
title: 第 15 章：Factor Analysis
description: 用低维高斯隐因子和噪声解释高维协方差，推导边缘分布、后验推断与 EM 参数学习。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 协方差建模问题

高维高斯的完整协方差有 $O(n^2)$ 个参数。当维度接近或超过样本数时，样本协方差估计不稳定甚至奇异。

对角协方差只需 $O(n)$ 参数，却假设所有观测维度条件独立，可能过于受限。

Factor Analysis 在两者之间：少数隐因子解释主要相关结构，每个观测维度再带独立噪声。

> 原版对应：PDF 第 1–2 页，Motivation for factor analysis。

## 协方差限制

完整协方差灵活但数据需求大；对角协方差稳定但不能表达相关性。

Factor Analysis 假设：

$$
x=\mu+\Lambda z+\epsilon
$$

其中：

$$
z\sim\mathcal N(0,I_k)
$$

$$
\epsilon\sim\mathcal N(0,\Psi)
$$

$k\ll n$，$\Psi$ 通常为对角矩阵。

因此：

$$
\operatorname{Cov}(x)
=\Lambda\Lambda^\top+\Psi
$$

低秩项表达共享变化，$\Psi$ 表达每个维度特有噪声。

> 原版对应：PDF 第 2–3 页，Restrictions of covariance matrices。

## 高斯边缘与条件分布

联合高斯分块：

$$
\begin{bmatrix}x_A\\x_B\end{bmatrix}
\sim\mathcal N
\left(
\begin{bmatrix}\mu_A\\\mu_B\end{bmatrix},
\begin{bmatrix}
\Sigma_{AA}&\Sigma_{AB}\\
\Sigma_{BA}&\Sigma_{BB}
\end{bmatrix}
\right)
$$

边缘分布直接取对应均值和协方差块。

条件分布：

$$
x_A\mid x_B
\sim\mathcal N
\left(
\mu_A+\Sigma_{AB}\Sigma_{BB}^{-1}(x_B-\mu_B),
\Sigma_{AA}-\Sigma_{AB}\Sigma_{BB}^{-1}\Sigma_{BA}
\right)
$$

这套公式让我们能够计算隐因子后验 $p(z\mid x)$，也是 Factor Analysis E 步的基础。

> 原版对应：PDF 第 3–4 页，Marginals and conditionals of Gaussians。

## 因子分析模型

由线性高斯变换可得边缘：

$$
x\sim\mathcal N
(\mu,\Lambda\Lambda^\top+\Psi)
$$

载荷矩阵 $\Lambda$ 的列描述隐因子如何共同影响观测维度。

隐因子存在旋转不可辨识性。对任意正交矩阵 $R$：

$$
\Lambda z=(\Lambda R)(R^\top z)
$$

边缘分布不变。因此因子方向本身需要约束或旋转规则才能获得稳定解释。

Factor Analysis 是概率模型，显式区分共享信号与观测噪声；这与只寻找最大方差方向的 PCA 不同。

> 原版对应：PDF 第 4–6 页，The factor analysis model。

## 因子分析的 EM

隐变量是每个样本的 $z_i$。

E 步计算：

$$
E[z_i\mid x_i]
$$

和：

$$
E[z_iz_i^\top\mid x_i]
$$

M 步使用这些期望更新 $\mu$、$\Lambda$ 与对角噪声 $\Psi$。

实现中应利用线性代数求解，不显式求逆；对 $\Psi$ 设置最小方差，避免数值塌缩。

收敛后不仅检查似然，还要检查重建、留出数据似然、因子稳定性和不同初始化。

> 原版对应：PDF 第 6–9 页，EM for factor analysis。

## 本章检查

- 能说明完整和对角协方差各自的问题；
- 能写出 $x=\mu+\Lambda z+\epsilon$ 的生成过程；
- 能推出 $\operatorname{Cov}(x)=\Lambda\Lambda^\top+\Psi$；
- 能使用联合高斯条件分布理解隐因子后验；
- 能解释因子的旋转不可辨识性；
- 能区分 Factor Analysis 与 PCA 的建模目标；
- 能说出 E 步需要的两个后验矩。

下一章进入 [PCA](/notes/cs229/course/principal-component-analysis)，从几何投影和最大方差角度解决降维。

## 来源说明

本章对应 [CS229 Lecture Notes 9](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes9.pdf)。中文内容为独立重构讲解。
