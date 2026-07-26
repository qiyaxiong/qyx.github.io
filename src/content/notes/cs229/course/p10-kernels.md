---
title: P10：核方法与支持向量机求解
description: 对应 B 站 P10 与 CS229 Lecture 7，从特征映射和对偶内积进入 Kernel Trick、Mercer 条件、软间隔与 SMO。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 从对偶问题观察内积

SVM 对偶目标：

$$
\max_\alpha
\sum_i\alpha_i
-\frac12
\sum_{i,j}
\alpha_i\alpha_jy^{(i)}y^{(j)}
(x^{(i)})^\top x^{(j)}
$$

训练与预测都只通过样本内积出现。

若把输入映射到特征空间：

$$
\phi:\mathcal X\to\mathcal H
$$

只需把内积替换为：

$$
\phi(x)^\top\phi(z)
$$

## Kernel Trick

核函数直接计算特征空间内积：

$$
K(x,z)
=\phi(x)^\top\phi(z)
$$

不必显式构造 $\phi(x)$。

例如二次多项式核：

$$
K(x,z)
=(x^\top z+c)^2
$$

隐式包含常数、一次项和二次交叉项。原空间线性分类器在特征空间中仍线性，但投回原空间可以形成非线性边界。

## 高斯 RBF Kernel

$$
K(x,z)
=\exp\left(
-\frac{\|x-z\|_2^2}{2\sigma^2}
\right)
$$

相近样本相似度接近 $1$，距离远时接近 $0$。

$\sigma$ 控制影响范围：

- 很小：每个样本只影响极近邻域，边界复杂；
- 很大：许多样本相似，边界更平滑。

常见实现使用：

$$
\gamma=\frac{1}{2\sigma^2}
$$

不同库的参数命名必须核对。

## 什么函数可以作为 Kernel

任意相似度函数不一定对应某个合法内积。

对任意样本 $x^{(1)},\ldots,x^{(m)}$，Gram 矩阵：

$$
K_{ij}=K(x^{(i)},x^{(j)})
$$

合法核应使 $K$ 对称半正定：

$$
z^\top Kz\ge0
$$

Mercer 条件为核函数对应某个特征空间内积提供判据。

## 核的组合

若 $K_1$、$K_2$ 合法，则在适当条件下：

$$
K(x,z)=K_1(x,z)+K_2(x,z)
$$

$$
K(x,z)=cK_1(x,z),
\quad c\ge0
$$

$$
K(x,z)=K_1(x,z)K_2(x,z)
$$

仍是合法核。

这允许为结构化输入组合不同相似性，例如文本核、序列核与图核。

## 软间隔 SVM

不可分数据引入松弛变量：

$$
\xi_i\ge0
$$

约束：

$$
y^{(i)}
\left(
w^\top\phi(x^{(i)})+b
\right)
\ge1-\xi_i
$$

目标：

$$
\min_{w,b,\xi}
\frac12\|w\|^2
+C\sum_i\xi_i
$$

$C$ 大时强烈惩罚违反间隔，倾向低训练错误；$C$ 小时更重视宽间隔和正则化。

## Hinge Loss

软间隔可写成无约束形式：

$$
\min_{w,b}
\frac12\|w\|^2
+C\sum_i
\max\left(
0,
1-y^{(i)}f(x^{(i)})
\right)
$$

其中：

$$
f(x)=w^\top\phi(x)+b
$$

Hinge loss 在间隔外为零；分类正确但离边界太近仍有损失。

## 软间隔对偶

对偶目标形式与硬间隔相同，但约束变为：

$$
0\le\alpha_i\le C
$$

不同 $\alpha_i$ 的含义：

- $\alpha_i=0$：位于间隔外；
- $0<\alpha_i<C$：恰在间隔边界；
- $\alpha_i=C$：在间隔内或被误分类。

预测：

$$
f(x)
=\sum_i\alpha_i y^{(i)}K(x^{(i)},x)+b
$$

只需保存非零 $\alpha_i$ 对应的支持向量。

## SMO

Sequential Minimal Optimization 每次选择两个对偶变量更新。

因为约束：

$$
\sum_i\alpha_i y^{(i)}=0
$$

只改变一个变量无法保持等式；改变两个变量时，可以把问题化为带区间约束的一维二次优化。

典型步骤：

1. 选择违反 KKT 条件的变量；
2. 选择第二个变量；
3. 计算允许区间；
4. 求一维无约束最优并裁剪；
5. 更新阈值 $b$ 与缓存。

变量选择启发式对实际速度影响很大。

## Kernel 的计算代价

完整 Gram 矩阵需要：

$$
O(m^2)
$$

存储，训练代价也可能很高。数据量很大时，可以考虑：

- 线性 SVM；
- 随机 Fourier 特征；
- Nyström 近似；
- 分块核计算；
- 其他可扩展非线性模型。

Kernel Trick 避免显式高维特征，却没有消除样本两两比较成本。

## 调参与诊断

$C$ 和核参数必须在验证集上联合选择。

RBF 前应标准化特征，否则大尺度维度主导欧氏距离。

诊断时观察：

- 训练与验证误差；
- 支持向量数量和比例；
- 不同类别的 Precision/Recall；
- $C$、$\gamma$ 改变后的边界稳定性；
- Gram 矩阵是否对称、是否出现明显负特征值；
- 训练时间和预测延迟。

## 本节检查

- 能从 SVM 对偶指出 Kernel 进入的位置；
- 能解释 Kernel Trick 避免了什么计算；
- 能判断 Gram 矩阵应满足的条件；
- 能说明 RBF 的 $\sigma$ 或 $\gamma$ 如何改变边界；
- 能写出软间隔原始目标和 Hinge loss；
- 能解释 $\alpha_i$ 与支持向量位置的关系；
- 能描述 SMO 为什么每次更新两个变量；
- 能指出核方法在大样本下的二次存储瓶颈。

下一节进入 [P11：数据划分、模型选择与交叉验证](/notes/cs229/course/p11-data-splits-model-selection-cross-validation)。

## 来源说明

- 视频：[B 站 P10：Lecture 7](https://www.bilibili.com/video/BV1fP4y127nn/?p=10)
- 讲义：[Lecture Notes 3，第 13–25 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes3.pdf)
- 算法论文：[Platt SMO](https://github.com/maxim5/cs229-2018-autumn/blob/main/materials/smo-paper-platt.pdf)
- 作业：[Problem Set 2](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS2/ps2.pdf)

中文内容对应 Kernel、软间隔与 SMO，并补充计算复杂度边界。
