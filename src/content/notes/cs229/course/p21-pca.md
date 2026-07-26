---
title: P21：主成分分析
description: 对应 B 站 P21 的 2018-11-12 原始课堂录像，用最大方差和最小重建误差两种视角推导 PCA。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 关于这一分集的编号

B 站 P21 的原始标题只有录像日期：

```text
CS229_on_11_12_2018_(Mon)
```

没有正常 Lecture 标题。官方 Autumn 2018 课表将 11 月 12 日内容列为 Principal Component Analysis 与 Independent Component Analysis；后续 P22 明确从 ICA 继续并进入 RL。

因此本页按日期、前后课堂顺序和 Lecture Notes 10 对应 PCA，同时保留原始录像命名，不伪造 Lecture 编号。

## 降维问题

高维数据可能存在：

- 特征冗余；
- 强相关维度；
- 噪声方向；
- 可视化困难；
- 存储和计算成本高。

PCA 寻找低维线性子空间，使投影保留尽可能多的变化信息。

## 数据中心化

样本均值：

$$
\mu
=\frac1m\sum_i x^{(i)}
$$

中心化：

$$
\tilde x^{(i)}
=x^{(i)}-\mu
$$

如果不同维度单位或尺度差异大，还可除以标准差。

是否标准化取决于任务：若绝对方差本身具有含义，不一定应强制所有维度同方差。

## 最大方差方向

寻找单位向量 $u$，使投影方差最大：

$$
\max_u
\frac1m
\sum_i
\left(
u^\top\tilde x^{(i)}
\right)^2
$$

约束：

$$
\|u\|_2=1
$$

定义经验协方差：

$$
\Sigma
=\frac1m
\sum_i
\tilde x^{(i)}
(\tilde x^{(i)})^\top
$$

目标变为：

$$
\max_{\|u\|=1}
u^\top\Sigma u
$$

## 特征值推导

拉格朗日函数：

$$
\mathcal L(u,\lambda)
=u^\top\Sigma u
-\lambda(u^\top u-1)
$$

驻点：

$$
2\Sigma u-2\lambda u=0
$$

所以：

$$
\Sigma u=\lambda u
$$

目标值：

$$
u^\top\Sigma u=\lambda
$$

因此第一主成分是最大特征值对应的特征向量。

## 多个主成分

取前 $k$ 个最大特征值对应的正交单位特征向量：

$$
U_k=
\begin{bmatrix}
u_1&\cdots&u_k
\end{bmatrix}
$$

低维表示：

$$
z^{(i)}
=U_k^\top
\left(
x^{(i)}-\mu
\right)
$$

$z^{(i)}\in\mathbb R^k$。

## 重建

从低维表示重建：

$$
\hat x^{(i)}
=\mu+U_kz^{(i)}
$$

即：

$$
\hat x^{(i)}
=\mu
+U_kU_k^\top
\left(
x^{(i)}-\mu
\right)
$$

$U_kU_k^\top$ 是到主成分子空间的正交投影。

## 最小重建误差视角

PCA 也等价于选择 $k$ 维正交子空间，最小化：

$$
\sum_i
\left\|
\tilde x^{(i)}
-U_kU_k^\top\tilde x^{(i)}
\right\|_2^2
$$

最大保留方差与最小平方重建误差是同一问题的两种表达。

## SVD 实现

将中心化数据矩阵写成：

$$
\tilde X=USV^\top
$$

若样本按行，右奇异向量 $V$ 给出特征空间主方向。

实际通常直接对数据矩阵做 SVD，不显式构造协方差矩阵，因为数值更稳定，也避免平方条件数。

## 选择维度

第 $j$ 个主成分解释的方差为 $\lambda_j$。

累计解释方差比：

$$
\frac{
\sum_{j=1}^{k}\lambda_j
}{
\sum_{j=1}^{n}\lambda_j
}
$$

可用作参考，但不能机械地把 $95\%$ 当成所有任务的标准。

最终 $k$ 应结合下游指标、重建质量、压缩成本与解释需求选择。

## PCA 与数据泄漏

PCA 方向必须只在训练集拟合：

```text
训练集拟合均值/尺度/PCA
→ 变换训练集
→ 用同一变换处理验证和测试集
```

在全部数据上拟合 PCA 会让验证与测试分布信息进入训练 pipeline。

交叉验证时，PCA 也必须放在每一折内部重新拟合。

## PCA 的限制

- 只寻找线性子空间；
- 最大方差不一定对应预测相关信息；
- 对异常值敏感；
- 主成分符号任意；
- 特征缩放改变结果；
- 主方向可能缺乏稳定语义；
- 降维后仍需验证下游性能。

无监督预处理不能因“不使用标签”就自动视为无泄漏。

## 本节检查

- 能说明 P21 的日期与讲义对应证据；
- 能正确中心化数据；
- 能从最大方差推导协方差特征向量；
- 能写出投影与重建公式；
- 能解释最大方差与最小重建误差等价；
- 能使用 SVD 计算主成分；
- 能用解释方差与下游指标选择 $k$；
- 能避免 PCA 预处理泄漏。

下一节进入 [P22：ICA 与强化学习导论](/notes/cs229/course/p22-ica-reinforcement-learning)。

## 来源说明

- 视频：[B 站 P21：2018-11-12 原始课堂录像](https://www.bilibili.com/video/BV1fP4y127nn/?p=21)
- 官方课表：[11/12 · PCA and ICA](https://github.com/maxim5/cs229-2018-autumn/blob/main/syllabus-autumn2018.html)
- 讲义：[Lecture Notes 10 · PCA](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes10.pdf)
- 作业：[Problem Set 4](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS4/ps4.pdf)

本页明确记录 B 站标题缺失及对应依据。
