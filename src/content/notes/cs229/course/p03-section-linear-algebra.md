---
title: P3：讨论课——线性代数复习
description: 对应 B 站 P3 和 2018-09-28 Discussion Section，复习向量、矩阵、线性相关、秩、特征值、二次型与矩阵微分。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 为什么单独安排线性代数讨论课

CS229 后续推导大量使用矩阵形式。线性代数的作用不只是压缩记号，它还揭示：

- 参数是否能够唯一确定；
- 数据在哪些方向包含信息；
- 优化问题是否有唯一最优解；
- 协方差怎样描述方向与尺度；
- PCA、SVM 和 LQR 为什么可以化成特定矩阵问题。

这节讨论课的目标是能使用这些工具，而不是孤立背诵定义。

## 向量、矩阵与维度

列向量：

$$
x=
\begin{bmatrix}
x_1\\
\vdots\\
x_n
\end{bmatrix}
\in\mathbb R^n
$$

矩阵：

$$
A\in\mathbb R^{m\times n}
$$

表示 $m$ 行、$n$ 列。矩阵乘法 $AB$ 只有在 $A$ 的列数等于 $B$ 的行数时定义。

若：

$$
A\in\mathbb R^{m\times n},
\qquad
B\in\mathbb R^{n\times p}
$$

则：

$$
AB\in\mathbb R^{m\times p}
$$

矩阵乘法通常不交换：

$$
AB\ne BA
$$

推导时先写维度，往往能在计算前发现错误。

## 内积、范数与距离

向量内积：

$$
x^\top y
=\sum_{i=1}^{n}x_iy_i
$$

欧氏范数：

$$
\|x\|_2
=\sqrt{x^\top x}
$$

两个向量正交当且仅当：

$$
x^\top y=0
$$

机器学习中的距离、投影、相似度和间隔大量建立在内积之上。Kernel 方法进一步把高维特征空间的内积替换为可直接计算的核函数。

## 线性组合、张成与子空间

向量 $v_1,\ldots,v_k$ 的线性组合是：

$$
\sum_{i=1}^{k}\alpha_iv_i
$$

所有线性组合构成它们的张成空间：

$$
\operatorname{span}(v_1,\ldots,v_k)
$$

如果：

$$
\sum_{i=1}^{k}\alpha_iv_i=0
$$

只有全零系数这一种解，则这些向量线性无关。

在线性回归中，若某一特征列可以由其他特征列线性表示，参数就可能不唯一。预测仍可能确定，但不同参数组合产生相同 $X\theta$。

## 矩阵的列空间与零空间

矩阵 $A$ 的列空间是所有 $Ax$ 的集合：

$$
\mathcal C(A)
=\{Ax:x\in\mathbb R^n\}
$$

零空间为：

$$
\mathcal N(A)
=\{x:Ax=0\}
$$

方程 $Ax=b$ 有解，当且仅当 $b$ 位于 $A$ 的列空间。

若零空间只包含零向量，则不同 $x$ 不会映射到同一输出，参数具有可辨识性。

## 秩

矩阵的秩是最大线性无关列数，也等于最大线性无关行数：

$$
\operatorname{rank}(A)
$$

对 $A\in\mathbb R^{m\times n}$：

$$
\operatorname{rank}(A)\le\min(m,n)
$$

秩—零度定理：

$$
\operatorname{rank}(A)
+\dim\mathcal N(A)
=n
$$

线性回归正规方程中的 $X^\top X$ 可逆，需要 $X$ 的列满秩。重复或完全共线特征会破坏这个条件。

## 逆矩阵与线性方程

方阵 $A$ 的逆满足：

$$
A^{-1}A=AA^{-1}=I
$$

$A$ 可逆等价于：

- $A$ 满秩；
- $\mathcal N(A)=\{0\}$；
- $\det(A)\ne0$；
- 所有特征值都不为零。

数学推导常写 $A^{-1}b$，数值计算却应直接求解：

$$
Ax=b
$$

显式构造逆矩阵通常更慢，也会放大数值误差。

## 转置与常用恒等式

$$
(A^\top)^\top=A
$$

$$
(AB)^\top=B^\top A^\top
$$

$$
(A^{-1})^\top=(A^\top)^{-1}
$$

注意乘积转置会颠倒顺序。许多梯度推导错误都来自忘记这一点。

标量等于自己的转置，因此：

$$
x^\top Ay
=(x^\top Ay)^\top
=y^\top A^\top x
$$

## 对称矩阵与二次型

若：

$$
A=A^\top
$$

则 $A$ 是对称矩阵。

二次型为：

$$
x^\top Ax
$$

若对任意非零 $x$：

$$
x^\top Ax>0
$$

则 $A$ 正定，记作 $A\succ0$。若允许等于零，则为半正定 $A\succeq0$。

线性回归 Hessian 是：

$$
\nabla^2J(\theta)=X^\top X
$$

因为：

$$
z^\top X^\top Xz=\|Xz\|_2^2\ge0
$$

所以目标是凸的；若 $X$ 列满秩，则 Hessian 正定，最优解唯一。

## 特征值与特征向量

非零向量 $v$ 若满足：

$$
Av=\lambda v
$$

则 $v$ 是特征向量，$\lambda$ 是对应特征值。

它表示矩阵作用在方向 $v$ 上时，只改变尺度而不改变方向。

实对称矩阵可以正交对角化：

$$
A=Q\Lambda Q^\top
$$

$Q$ 的列是正交单位特征向量，$\Lambda$ 对角线是特征值。

PCA 使用协方差矩阵最大的特征向量寻找最大方差方向；优化中的条件数则与最大、最小特征值的比值有关。

## 投影

把 $x$ 投影到单位向量 $u$ 上：

$$
\operatorname{proj}_u(x)
=(u^\top x)u
$$

若 $U$ 的列是相互正交的单位向量，则投影到其列空间：

$$
\hat x=UU^\top x
$$

投影矩阵：

$$
P=UU^\top
$$

满足：

$$
P^\top=P,
\qquad
P^2=P
$$

最小二乘可以理解为把目标向量 $y$ 投影到 $X$ 的列空间。

## 梯度与 Hessian

标量函数 $f:\mathbb R^n\to\mathbb R$ 的梯度：

$$
\nabla_xf
=
\begin{bmatrix}
\frac{\partial f}{\partial x_1}\\
\vdots\\
\frac{\partial f}{\partial x_n}
\end{bmatrix}
$$

梯度指向函数增长最快的方向。Hessian 收集二阶偏导：

$$
H_{ij}
=\frac{\partial^2f}{\partial x_i\partial x_j}
$$

常用结果：

$$
\nabla_x(a^\top x)=a
$$

$$
\nabla_x(x^\top x)=2x
$$

$$
\nabla_x(x^\top Ax)
=(A+A^\top)x
$$

若 $A$ 对称：

$$
\nabla_x(x^\top Ax)=2Ax
$$

## 最小二乘的几何解释

最小二乘寻找：

$$
\hat\theta
=\arg\min_\theta\|X\theta-y\|_2^2
$$

$X\theta$ 必须位于 $X$ 的列空间。最优残差：

$$
r=y-X\hat\theta
$$

必须与整个列空间正交：

$$
X^\top r=0
$$

因此：

$$
X^\top(y-X\hat\theta)=0
$$

重新排列得到正规方程：

$$
X^\top X\hat\theta=X^\top y
$$

这个几何视角说明正规方程不是突然出现的代数技巧，而是正交投影条件。

## 数值实现检查

- 不用 `A.I` 或 `inv(A) @ b` 代替线性方程求解；
- 用 `shape` 断言区分 `(n,)`、`(n,1)` 与 `(1,n)`；
- 不依赖不明确的广播行为；
- 检查矩阵是否对称时使用容差；
- 用奇异值判断近似秩，而不是要求浮点数严格为零；
- 特征值差距很大时关注条件数和尺度；
- 用小矩阵手算结果验证代码。

## 本节检查

- 能在乘法前写出矩阵维度；
- 能解释列空间、零空间、秩和参数唯一性的关系；
- 能说明 $X^\top X$ 为什么半正定；
- 能用投影解释最小二乘；
- 能写出常见二次型的梯度；
- 能说明对称矩阵特征分解为何重要；
- 知道代码中应求解线性方程而不是显式求逆；
- 能用维度、秩和条件数诊断线性模型实现。

下一节回到主课：[P4：局部加权回归、逻辑回归与牛顿法](/notes/cs229/course/p04-locally-weighted-logistic-regression)。

## 来源说明

- 视频：[B 站 P3：Linear Algebra Section](https://www.bilibili.com/video/BV1fP4y127nn/?p=3)
- 讲义：[Linear Algebra Review and Reference，共 26 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/section/cs229-linalg.pdf)

中文内容按照本次 Discussion Section 的能力目标重构。
