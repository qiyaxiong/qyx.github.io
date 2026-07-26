---
title: P2：线性回归与梯度下降
description: 对应 B 站 P2 与 CS229 Lecture 2，从监督学习记号、最小二乘目标推导批量/随机梯度下降和正规方程。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 监督学习设定

训练集写作：

$$
\mathcal D=
\left\{
(x^{(i)},y^{(i)})
\right\}_{i=1}^{m}
$$

$m$ 是样本数，$x^{(i)}\in\mathbb R^n$ 是第 $i$ 个样本的特征，$y^{(i)}\in\mathbb R$ 是连续目标。

为了把截距并入参数，增加固定特征：

$$
x_0^{(i)}=1
$$

于是：

$$
x^{(i)}
=
\begin{bmatrix}
1 & x_1^{(i)} & \cdots & x_n^{(i)}
\end{bmatrix}^{\top}
$$

参数 $\theta$ 也有 $n+1$ 个元素。

## 线性假设

线性回归假设预测值是特征的线性组合：

$$
h_\theta(x)
=\theta^\top x
=\sum_{j=0}^{n}\theta_jx_j
$$

“线性”是对参数 $\theta$ 而言。若先把输入变换为多项式特征：

$$
\phi(x)=
\begin{bmatrix}
1 & x & x^2
\end{bmatrix}^{\top}
$$

再用 $\theta^\top\phi(x)$，对原输入是曲线，对参数仍是线性模型。

模型假设决定了可表达范围。如果真实关系存在模型无法表达的结构，再长时间优化也只能找到当前函数族里的最好解。

## 最小二乘目标

单个样本残差为：

$$
e^{(i)}
=h_\theta(x^{(i)})-y^{(i)}
$$

平方损失目标定义为：

$$
J(\theta)
=\frac12
\sum_{i=1}^{m}
\left(
h_\theta(x^{(i)})-y^{(i)}
\right)^2
$$

$1/2$ 只为求导时抵消平方产生的 $2$，不改变最优参数。

有些实现使用均值：

$$
J(\theta)
=\frac{1}{2m}
\sum_{i=1}^{m}
\left(
h_\theta(x^{(i)})-y^{(i)}
\right)^2
$$

它只改变梯度尺度；相应学习率也会改变。

平方损失连续、可微且对线性回归是凸函数，因此不存在多个不同高度的局部极小值。

## 单样本梯度

先看一个样本：

$$
J_i(\theta)
=\frac12
\left(
h_\theta(x^{(i)})-y^{(i)}
\right)^2
$$

对 $\theta_j$ 求偏导：

$$
\frac{\partial J_i}{\partial\theta_j}
=
\left(
h_\theta(x^{(i)})-y^{(i)}
\right)x_j^{(i)}
$$

负梯度更新：

$$
\theta_j
\leftarrow
\theta_j
-\alpha
\left(
h_\theta(x^{(i)})-y^{(i)}
\right)x_j^{(i)}
$$

这就是 LMS 更新。误差决定修正方向，特征值决定该参数受到多大影响。

## 批量梯度下降

批量梯度下降每轮使用全部训练样本：

$$
\theta_j
\leftarrow
\theta_j
-\alpha
\sum_{i=1}^{m}
\left(
h_\theta(x^{(i)})-y^{(i)}
\right)x_j^{(i)}
$$

向量化后，令：

$$
X=
\begin{bmatrix}
---(x^{(1)})^\top---\\
\vdots\\
---(x^{(m)})^\top---
\end{bmatrix},
\qquad
y=
\begin{bmatrix}
y^{(1)}\\
\vdots\\
y^{(m)}
\end{bmatrix}
$$

则：

$$
\nabla_\theta J
=X^\top(X\theta-y)
$$

更新写成：

$$
\theta
\leftarrow
\theta-\alpha X^\top(X\theta-y)
$$

若目标除以 $m$，梯度也要除以 $m$。

## 随机与小批量梯度下降

随机梯度下降每次只用一个样本近似完整梯度：

$$
\theta
\leftarrow
\theta-\alpha
\left(
h_\theta(x^{(i)})-y^{(i)}
\right)x^{(i)}
$$

它单次更新便宜，能够快速移动，但方向有噪声。

小批量梯度下降在两者之间：每次使用一组样本，既利用矩阵运算，又保留频繁更新。

比较三种方法时不能只看 epoch 数。应该比较处理过的样本数、墙钟时间、目标函数和验证误差。

## 学习率与收敛

学习率 $\alpha$ 太小，损失下降缓慢；太大，更新可能越过最低点并震荡或发散。

线性回归的 Hessian 与 $X^\top X$ 有关。不同特征尺度差异很大时，损失等高线狭长，固定学习率会在陡峭方向来回摆动。

标准化连续特征：

$$
x_j'
=\frac{x_j-\mu_j}{\sigma_j}
$$

通常能改善条件数，让梯度下降更稳定。截距列不应标准化。

训练时至少记录：

- 每轮训练损失；
- 梯度范数；
- 参数是否出现 `NaN` 或无穷大；
- 验证集误差；
- 更新前后的张量维度。

## 正规方程

矩阵形式目标为：

$$
J(\theta)
=\frac12(X\theta-y)^\top(X\theta-y)
$$

梯度：

$$
\nabla_\theta J
=X^\top X\theta-X^\top y
$$

令梯度为零：

$$
X^\top X\theta=X^\top y
$$

若 $X^\top X$ 可逆：

$$
\theta
=(X^\top X)^{-1}X^\top y
$$

这就是正规方程。

实际实现不要显式计算逆矩阵。应使用线性方程求解、QR、SVD 或伪逆：

$$
\theta=X^+y
$$

它们在特征共线或矩阵接近奇异时更稳定。

## 梯度下降还是闭式求解

正规方程不需要选择学习率，适合特征数不太大的问题；但构造和分解 $X^\top X$ 的代价会随特征数快速增加。

梯度方法适合样本量或特征量很大、数据流式到达，或者后续模型没有闭式解的情况。

选择算法要考虑：

- $m$ 与 $n$ 的数量级；
- 数据是否能放入内存；
- 矩阵是否稀疏；
- 是否需要在线更新；
- 数值条件是否良好。

## 从代码验证梯度

随机选择很小的数据集与参数，对第 $j$ 维使用中心差分：

$$
\frac{\partial J}{\partial\theta_j}
\approx
\frac{
J(\theta+\epsilon e_j)
-J(\theta-\epsilon e_j)
}{2\epsilon}
$$

把数值梯度与解析梯度比较：

$$
\text{relative error}
=
\frac{
\|g_{\text{analytic}}-g_{\text{numeric}}\|
}{
\|g_{\text{analytic}}\|
+\|g_{\text{numeric}}\|
+\varepsilon
}
$$

若误差异常，应优先检查符号、求和维度、平均系数和广播行为，而不是先调整学习率。

## 本节检查

- 能说明 $m$、$n$、$x^{(i)}$、$y^{(i)}$ 和 $\theta$ 的含义；
- 能从平方损失推出 LMS 更新；
- 能写出批量梯度的矩阵形式并检查维度；
- 能区分 batch、stochastic 和 mini-batch 更新；
- 能解释特征缩放为什么影响优化速度；
- 能从目标函数推导正规方程；
- 知道实际代码不应显式求逆；
- 能用有限差分检查解析梯度。

下一节是 [P3：线性代数讨论课](/notes/cs229/course/p03-section-linear-algebra)，补齐后续推导需要的矩阵语言。

## 来源说明

- 视频：[B 站 P2：Lecture 2](https://www.bilibili.com/video/BV1fP4y127nn/?p=2)
- 讲义：[Lecture Notes 1，第 1–13 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes1.pdf)
- 作业：[Problem Set 0](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS0/ps0.pdf)

中文内容按本节课堂知识顺序重构，并与原讲义页码对应。
