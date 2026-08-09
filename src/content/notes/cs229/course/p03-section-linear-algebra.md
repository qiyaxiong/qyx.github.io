---
title: P3：讨论课——线性代数复习
description: 对应 B 站 P3 和 2018-09-28 Discussion Section，复习向量、矩阵、线性相关、秩、特征值、二次型与矩阵微分。
publishDate: 2026-07-26
updatedDate: 2026-08-08
language: zh
---

## 一图理解本章

![线性代数从向量与矩阵、秩和特征向量到 SVD 与最小二乘投影的六步图解](/images/notes/cs229/storyboards/p03-linear-algebra-storyboard.png)

先沿图中的六个步骤建立本章主线，再进入后文的公式推导、实现细节和失败诊断。

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

![矩阵乘法的收缩轴：左矩阵的一行与右矩阵的一列进行内积](/images/notes/cs229/tikz/p03-matrix-multiplication.png)

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

![正交投影的分析与合成：先求子空间坐标，再用基向量重建投影](/images/notes/cs229/tikz/p03-orthogonal-projection.png)

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

## 用一个矩阵贯穿核心概念

考虑矩阵：

$$
A=
\begin{bmatrix}
1&2\\
2&4\\
1&1
\end{bmatrix}
$$

它把二维向量映射到三维空间。两列分别为：

$$
a_1=
\begin{bmatrix}
1\\2\\1
\end{bmatrix},
\qquad
a_2=
\begin{bmatrix}
2\\4\\1
\end{bmatrix}
$$

两列不是倍数关系，因此线性无关，$\operatorname{rank}(A)=2$。列空间是三维空间中的一个二维平面。

对任意 $x=(x_1,x_2)^\top$：

$$
Ax=x_1a_1+x_2a_2
$$

所以矩阵乘法可以理解为按 $x$ 的系数组合矩阵的列。

矩阵 $A$ 不是方阵，没有普通逆矩阵。但因为满列秩，$A^\top A$ 可逆，左伪逆为：

$$
A^+=(A^\top A)^{-1}A^\top
$$

对于不一定落在列空间中的 $b\in\mathbb R^3$，$A^+b$ 给出最小二乘解。$AA^+b$ 是 $b$ 到列空间的正交投影。

## 二次型为什么在机器学习中反复出现

二次型写作：

$$
q(x)=x^\top Ax
$$

若 $A$ 对称，则梯度为：

$$
\nabla_x q(x)=2Ax
$$

更一般地：

$$
\nabla_x(x^\top Ax)
=(A+A^\top)x
$$

因为反对称部分对二次型没有贡献：

$$
x^\top(A-A^\top)x=0
$$

所以分析二次型时可以只看矩阵的对称部分。

若 $A$ 正半定，则：

$$
x^\top Ax\ge 0
$$

这意味着对应二次目标是凸的。线性回归的 Hessian 是 $X^\top X$，因此最小二乘目标凸。

正定矩阵还定义了 Mahalanobis 距离：

$$
d_A(x,z)
=
\sqrt{(x-z)^\top A(x-z)}
$$

欧氏距离对每个方向一视同仁，而 Mahalanobis 距离可以缩放并旋转空间。Gaussian、GDA 和异常检测会反复使用这一结构。

## 特征分解与主轴

对称矩阵可以正交对角化：

$$
A=Q\Lambda Q^\top
$$

$Q$ 的列是两两正交的特征向量，$\Lambda$ 的对角元素是特征值。

把 $x$ 写到特征向量基底下：

$$
z=Q^\top x
$$

则二次型变成：

$$
x^\top Ax
=
z^\top\Lambda z
=
\sum_j\lambda_jz_j^2
$$

原来耦合的方向被分解成互不干扰的主轴。特征值表示每个方向的拉伸、曲率或方差大小。

这正是后面理解优化条件数、Gaussian 协方差、PCA 和 LQR 的共同语言。

## SVD：比特征分解更通用

任意 $m\times n$ 矩阵都可以作奇异值分解：

$$
A=U\Sigma V^\top
$$

$V$ 的列给出输入空间方向，$U$ 的列给出输出空间方向，奇异值描述对应方向被放大的程度。

非零奇异值数量等于矩阵的秩。很小的奇异值意味着某个方向几乎不可辨识，也意味着数值求解可能不稳定。

伪逆可以由 SVD 构造：

$$
A^+=V\Sigma^+U^\top
$$

![SVD 与伪逆：旋转、按奇异方向缩放，以及在可辨识方向上取倒数](/images/notes/cs229/tikz/p03-svd-pseudoinverse.png)

$\Sigma^+$ 把非零奇异值取倒数，并对零奇异值保留零。实际数值库还会设置阈值，避免对极小奇异值放大噪声。

## 矩阵微分的实用规则

先记住结果，再用维度检查：

$$
\nabla_x(a^\top x)=a
$$

$$
\nabla_x(x^\top x)=2x
$$

$$
\nabla_x\frac12\|Ax-b\|_2^2
=
A^\top(Ax-b)
$$

最后一个公式可以用链式法则理解。设 $r=Ax-b$，外层 $\frac12r^\top r$ 对 $r$ 的梯度是 $r$，内层 $r$ 对 $x$ 的 Jacobian 是 $A$，于是结果为 $A^\top r$。

反向传播本质上也是这一规则的层层应用：上游梯度乘局部 Jacobian。

## 练习与答案思路

### 练习 1：判断能否相乘

若 $A\in\mathbb R^{4\times3}$、$B\in\mathbb R^{3\times2}$、$x\in\mathbb R^2$，写出 $ABx$ 的维度。

答案：$Bx\in\mathbb R^3$，再左乘 $A$ 得到 $\mathbb R^4$。

### 练习 2：证明半正定

证明任意矩阵 $X$ 都有 $X^\top X\succeq0$。

答案：

$$
z^\top X^\top Xz=\|Xz\|_2^2\ge0
$$

对所有 $z$ 成立，因此是半正定矩阵。

### 练习 3：解释零空间

若 $Av=0$ 且 $v\ne0$，为什么方程 $Ax=b$ 的解不唯一？

答案思路：若 $x_0$ 是一个解，则 $x_0+cv$ 对任意 $c$ 都满足 $A(x_0+cv)=b$。

### 练习 4：投影检查

若 $\hat y$ 是 $y$ 到 $\operatorname{Col}(X)$ 的投影，应满足什么残差条件？

答案：

$$
X^\top(y-\hat y)=0
$$

残差与列空间的所有基方向正交。

## 线性代数在后续算法中的位置

线性回归使用：

$$
X^\top X\theta=X^\top y
$$

列空间解释预测，零空间解释参数不唯一，条件数解释梯度下降与数值求解速度。

逻辑回归的 Newton 法使用 Hessian：

$$
H=X^\top RX
$$

半正定性保证负对数似然凸。

GDA 使用协方差逆矩阵：

$$
\Sigma^{-1}(\mu_1-\mu_0)
$$

它根据数据各方向方差缩放类别均值差。

SVM 对偶只依赖样本内积。Kernel 把内积替换为隐式特征空间内积。

PCA 对协方差作特征分解，主成分是最大特征值方向。

LQR 使用 Riccati 矩阵递推，Kalman Filter 使用协方差传播和线性观测更新。

所以线性代数不是一周后结束的预备知识，而是整门课程共享的表达语言。

## 条件数与数值稳定

对对称正定矩阵 $A$，二范数条件数：

$$
\kappa(A)
=
\frac{\lambda_{\max}(A)}
{\lambda_{\min}(A)}
$$

条件数大表示某些方向被强烈放大，某些方向几乎不可见。

在线性回归中：

$$
A=X^\top X
$$

若 $X$ 的条件数为 $\kappa(X)$，则：

$$
\kappa(X^\top X)
\approx
\kappa(X)^2
$$

显式形成正规方程会平方条件数，因此 QR 或 SVD 往往更稳定。

标准化、删除重复特征和正则化可以改善条件数。

数值错误不是“理论公式错了”，而是有限精度计算对病态问题非常敏感。

## QR 分解求最小二乘

若 $X$ 满列秩，作薄 QR 分解：

$$
X=QR
$$

$Q^\top Q=I$，$R$ 为上三角矩阵。

目标：

$$
\|X\theta-y\|_2^2
=
\|QR\theta-y\|_2^2
$$

利用正交变换保持范数，可得到三角系统：

$$
R\theta=Q^\top y
$$

再用回代求 $\theta$。

QR 避免形成 $X^\top X$，比正规方程稳定，又通常比完整 SVD 便宜。

SVD 更适合秩亏、近奇异或需要伪逆与低秩分析的情况。

## Jacobian、梯度与 Hessian 的维度

标量函数：

$$
f:\mathbb R^n\to\mathbb R
$$

梯度：

$$
\nabla f(x)\in\mathbb R^n
$$

向量函数：

$$
g:\mathbb R^n\to\mathbb R^m
$$

Jacobian：

$$
J_g(x)\in\mathbb R^{m\times n}
$$

标量函数的 Hessian：

$$
\nabla^2f(x)\in\mathbb R^{n\times n}
$$

对二阶连续可微函数，Hessian 对称。

机器学习文献对梯度使用行向量或列向量的约定不完全一致。不要只看公式形状，先确定当前材料的约定，再检查最终更新能否与参数相加。

## Trace Trick

矩阵微分常把标量写成 trace：

$$
a^\top b
=
\operatorname{tr}(a^\top b)
$$

利用循环性质：

$$
\operatorname{tr}(ABC)
=
\operatorname{tr}(BCA)
=
\operatorname{tr}(CAB)
$$

例如：

$$
f(X)
=
\|AX-B\|_F^2
$$

写成：

$$
f(X)
=
\operatorname{tr}
\left[
(AX-B)^\top(AX-B)
\right]
$$

梯度：

$$
\nabla_X f
=
2A^\top(AX-B)
$$

这与向量最小二乘具有相同结构。

## 实现实验

构造几乎共线的两列：

```python
x1 = rng.normal(size=m)
x2 = x1 + 1e-8 * rng.normal(size=m)
X = np.column_stack([np.ones(m), x1, x2])
```

分别用：

```text
显式 inverse
linear solve
QR / lstsq
SVD / pinv
```

求解最小二乘。

比较参数、预测、残差和条件数。你会看到参数可能剧烈变化，但预测仍较接近。

再加入 Ridge，观察参数稳定性怎样改善。

这个实验把“秩、零空间、条件数、伪逆、正则化”连接成一个可观察现象。

## 补充练习

### 练习 5：正交矩阵

若 $Q^\top Q=I$，证明：

$$
\|Qx\|_2=\|x\|_2
$$

答案：

$$
\|Qx\|_2^2
=
x^\top Q^\top Qx
=
x^\top x
$$

### 练习 6：投影矩阵

若 $P=P^\top=P^2$，其特征值只能是什么？

答案：若 $Pv=\lambda v$，则 $P^2v=\lambda^2v$，又等于 $\lambda v$，所以 $\lambda\in\{0,1\}$。

### 练习 7：矩阵梯度

求：

$$
\nabla_x\frac12\|Ax-b\|_2^2
$$

答案：

$$
A^\top(Ax-b)
$$

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
