---
title: P19：K-means、高斯混合与 EM
description: 对应 B 站 P19 与 CS229 Lecture 14，从硬聚类、失真函数进入高斯混合、隐变量、责任度与 EM 基本结构。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 无监督学习设定

数据没有外部标签：

$$
\mathcal D=
\{x^{(1)},\ldots,x^{(m)}\}
$$

目标是发现潜在结构。聚类希望把样本分组，使组内相似、组间不同。

“相似”必须通过距离、概率模型或下游任务明确定义。不同特征缩放会改变欧氏距离，因而直接改变聚类结果。

## K-means

设簇数为 $K$，每个簇中心：

$$
\mu_1,\ldots,\mu_K
$$

每个样本分配标签：

$$
c^{(i)}\in\{1,\ldots,K\}
$$

目标函数：

$$
J(c,\mu)
=\sum_{i=1}^{m}
\left\|
x^{(i)}-\mu_{c^{(i)}}
\right\|_2^2
$$

## 分配步骤

固定中心，为每个样本选择最近簇：

$$
c^{(i)}
\leftarrow
\arg\min_k
\left\|
x^{(i)}-\mu_k
\right\|_2^2
$$

这一步对固定 $\mu$ 精确最小化 $J$。

## 更新步骤

固定分配，中心更新为簇内均值：

$$
\mu_k
\leftarrow
\frac{
\sum_i\mathbf1\{c^{(i)}=k\}x^{(i)}
}{
\sum_i\mathbf1\{c^{(i)}=k\}
}
$$

均值是平方距离和的最优中心。

## 收敛与局部最优

两步都不增加目标，因此：

$$
J^{(t+1)}\le J^{(t)}
$$

分配方式有限，所以算法最终稳定。但它只保证收敛到局部最优或稳定点。

应使用多次随机初始化，保留失真最小且结构稳定的结果。K-means++ 能改善初始中心选择。

## K-means 的几何假设

K-means 偏好：

- 近似球形簇；
- 各方向尺度相近；
- 簇大小和密度相近；
- 欧氏距离有意义。

细长、非凸、密度差异大的簇可能被错误切分。标准化特征是起点，但不能修复不适合欧氏距离的问题。

## 从硬分配到概率模型

K-means 给每个样本唯一标签。高斯混合模型允许软归属：

$$
P(z^{(i)}=k\mid x^{(i)})
$$

生成过程：

$$
z\sim\operatorname{Categorical}(\phi)
$$

$$
x\mid z=k
\sim\mathcal N(\mu_k,\Sigma_k)
$$

观测密度：

$$
p(x)
=\sum_{k=1}^{K}
\phi_k
\mathcal N(x;\mu_k,\Sigma_k)
$$

## 隐变量困难

若 $z^{(i)}$ 可见，参数估计只是按类别计算频率、均值和协方差。

但实际只观察 $x$，对数似然：

$$
\ell(\theta)
=\sum_i
\log
\sum_k
\phi_k
\mathcal N(x^{(i)};\mu_k,\Sigma_k)
$$

对数外包着求和，不能像完整数据似然那样直接分解。

## E 步

用当前参数计算责任度：

$$
w_k^{(i)}
=P(z^{(i)}=k\mid x^{(i)};\theta)
$$

Bayes 公式：

$$
w_k^{(i)}
=
\frac{
\phi_k\mathcal N(x^{(i)};\mu_k,\Sigma_k)
}{
\sum_j
\phi_j\mathcal N(x^{(i)};\mu_j,\Sigma_j)
}
$$

对每个样本：

$$
\sum_kw_k^{(i)}=1
$$

## M 步

有效样本数：

$$
N_k=\sum_iw_k^{(i)}
$$

更新混合权重：

$$
\phi_k=\frac{N_k}{m}
$$

更新均值：

$$
\mu_k
=\frac{1}{N_k}
\sum_iw_k^{(i)}x^{(i)}
$$

更新协方差：

$$
\Sigma_k
=\frac{1}{N_k}
\sum_iw_k^{(i)}
(x^{(i)}-\mu_k)
(x^{(i)}-\mu_k)^\top
$$

## GMM 与 K-means

若各分量使用相同球形协方差：

$$
\Sigma_k=\sigma^2I
$$

并让 $\sigma^2$ 很小，责任度趋近 one-hot，GMM 的软分配接近 K-means 硬分配。

但一般 GMM 能表达不同方向、尺度和重叠程度，K-means 只是其受限极端情形。

## 数值与退化

若某个高斯中心落在单一样本上并让协方差趋近零，似然可能趋向无穷，导致奇异解。

实践中：

- 对协方差加入 $\epsilon I$；
- 使用 Cholesky 和 log-sum-exp；
- 监控最小特征值和有效样本数；
- 重启塌缩分量；
- 使用多次初始化；
- 不只按训练似然选择 $K$。

## 本节检查

- 能写出 K-means 失真函数；
- 能证明分配和更新步骤不增加目标；
- 能说明局部收敛为何需要多次初始化；
- 能写出 GMM 生成过程；
- 能解释隐变量为何导致 log-sum；
- 能计算 E 步责任度；
- 能写出 M 步加权参数估计；
- 能说明 GMM 退化与协方差正则化。

下一节进入 [P20：EM 与 Factor Analysis](/notes/cs229/course/p20-em-factor-analysis)。

## 来源说明

- 视频：[B 站 P19：Lecture 14](https://www.bilibili.com/video/BV1fP4y127nn/?p=19)
- K-means：[Lecture Notes 7a](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes7a.pdf)
- GMM：[Lecture Notes 7b](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes7b.pdf)
- EM：[Lecture Notes 8](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes8.pdf)
- 作业：[Problem Set 3](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS3/ps3.pdf)

中文内容按本节从硬聚类到软隐变量模型的推进顺序组织。
