---
title: 第 4 章：支持向量机与 Kernel
description: 从函数间隔、几何间隔与拉格朗日对偶，推导硬间隔和软间隔 SVM、Kernel Trick 与 SMO。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 间隔直觉

对线性可分数据，很多超平面都能做到训练错误为零。SVM 不满足于“分对”，而是选择距离最近训练点最远的边界。

令标签 $y\in\{-1,+1\}$，分类器是：

$$
h_{w,b}(x)=\operatorname{sign}(w^\top x+b)
$$

离边界最近的点决定间隔，它们叫支持向量。移动远离边界的普通样本，通常不会改变最终分类器；移动支持向量则可能改变边界。

最大间隔可以看作一种容量控制：在能够正确分类训练数据的解中，选择对小扰动更不敏感的一个。

> 原版对应：PDF 第 1–3 页，Margins intuition。

## 函数间隔与几何间隔

单个样本的函数间隔是：

$$
\hat\gamma^{(i)}
=y^{(i)}(w^\top x^{(i)}+b)
$$

它的符号表示是否分类正确，但数值会随 $(w,b)$ 同比例缩放，因此不能直接表示几何距离。

几何间隔消除缩放：

$$
\gamma^{(i)}
=\frac{y^{(i)}(w^\top x^{(i)}+b)}{\|w\|}
$$

训练集间隔是所有样本几何间隔的最小值。SVM 要最大化这个最坏情况距离。

理解两种间隔的区别，是看懂约束为何能规范化为 $y^{(i)}(w^\top x^{(i)}+b)\ge1$ 的关键。

> 原版对应：PDF 第 3–5 页，Functional and geometric margins。

## 最优间隔分类器

固定函数间隔为 1 后，最大化几何间隔等价于：

$$
\min_{w,b}\frac12\|w\|^2
$$

满足：

$$
y^{(i)}(w^\top x^{(i)}+b)\ge1
$$

目标是凸二次函数，约束是线性的，因此这是凸优化问题。若可行，局部最优就是全局最优。

约束等号成立的样本是支持向量。它们位于两条间隔边界上，并决定 $w$。

> 原版对应：PDF 第 5–7 页，Optimal margin classifier。

## 拉格朗日对偶

为每个约束引入乘子 $\alpha_i\ge0$：

$$
\mathcal L(w,b,\alpha)
=\frac12\|w\|^2
-\sum_i\alpha_i
\left[y^{(i)}(w^\top x^{(i)}+b)-1\right]
$$

对 $w,b$ 最小化后得到：

$$
w=\sum_i\alpha_i y^{(i)}x^{(i)}
$$

以及：

$$
\sum_i\alpha_i y^{(i)}=0
$$

代回得到只包含样本内积 $x^{(i)\top}x^{(j)}$ 的对偶问题。

KKT 条件说明：若某样本严格位于间隔外，则 $\alpha_i=0$；只有支持向量拥有非零乘子。这解释了预测为何只依赖少量训练样本。

> 原版对应：PDF 第 7–13 页，Lagrange duality and optimal margin classifiers。

## 核方法

若原空间中无法用直线分开，可以把输入映射到特征空间：

$$
\phi(x)
$$

对偶问题只需要计算：

$$
\phi(x)^\top\phi(z)
$$

Kernel 直接给出这个内积：

$$
K(x,z)=\phi(x)^\top\phi(z)
$$

因此不必显式构造可能非常高维的 $\phi(x)$。常用 RBF Kernel：

$$
K(x,z)=\exp\left(-\frac{\|x-z\|^2}{2\sigma^2}\right)
$$

合法 Kernel 对任意样本集合产生的 Gram 矩阵必须对称半正定。相似度“看起来合理”不代表一定对应某个内积空间。

Kernel Trick 节省的是显式特征构造，不会消除样本规模带来的 Gram 矩阵成本。

> 原版对应：PDF 第 13–19 页，Kernels。

## 软间隔与正则化

现实数据通常不可完全分。引入松弛变量 $\xi_i\ge0$：

$$
y^{(i)}(w^\top x^{(i)}+b)\ge1-\xi_i
$$

优化目标变为：

$$
\min_{w,b,\xi}
\frac12\|w\|^2+C\sum_i\xi_i
$$

$C$ 大时更重视训练错误，边界可能复杂；$C$ 小时更强正则化，允许更多间隔违反。

等价的 Hinge Loss 形式是：

$$
\frac12\|w\|^2
+C\sum_i\max(0,1-y^{(i)}f(x^{(i)}))
$$

调参必须同时考虑特征尺度、$C$ 和 Kernel 参数。未标准化特征会让距离与间隔被少数尺度大的维度支配。

> 原版对应：PDF 第 19–20 页，Regularization and the non-separable case。

## SMO 算法

对偶变量受约束 $\sum_i\alpha_i y_i=0$，因此不能只更新一个 $\alpha_i$。SMO 每次选择两个变量，在保持约束的情况下求一个小型解析子问题。

基本循环是：

```text
选择违反 KKT 条件的两个变量
→ 计算可行区间
→ 更新两个 alpha
→ 更新阈值 b 和误差缓存
→ 直到 KKT 违反足够小
```

SMO 避免通用二次规划器处理整个大矩阵，是经典 Kernel SVM 的核心训练方法。

工程上更重要的是使用成熟实现，并通过支持向量数量、KKT 残差、验证误差和训练时间判断配置。

> 原版对应：PDF 第 20–25 页，Sequential Minimal Optimization。

## 本章检查

- 能区分函数间隔与几何间隔；
- 能从最大间隔写出硬间隔原始问题；
- 能解释对偶问题为何只依赖内积；
- 能判断 Kernel Gram 矩阵的半正定要求；
- 能解释 $C$ 与 RBF 带宽的偏差—方差影响；
- 能说明只有支持向量参与最终预测；
- 能描述 SMO 为什么一次更新两个变量。

下一章进入 [学习理论](/notes/cs229/course/learning-theory)，正式回答训练误差何时能够代表测试误差。

## 来源说明

本章对应 [CS229 Lecture Notes 3](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes3.pdf)。中文内容为独立重构讲解。
