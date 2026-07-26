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

## 平方损失的概率解释

平方损失不只是计算方便。假设目标由线性函数加独立高斯噪声产生：

$$
y^{(i)}
=
\theta^\top x^{(i)}
+
\epsilon^{(i)},
\qquad
\epsilon^{(i)}
\sim
\mathcal N(0,\sigma^2)
$$

于是条件分布为：

$$
p(y^{(i)}\mid x^{(i)};\theta)
=
\frac{1}{\sqrt{2\pi}\sigma}
\exp\left(
-\frac{
\left(y^{(i)}-\theta^\top x^{(i)}\right)^2
}{2\sigma^2}
\right)
$$

假设样本条件独立，整个训练集的似然是：

$$
L(\theta)
=
\prod_{i=1}^{m}
p(y^{(i)}\mid x^{(i)};\theta)
$$

乘积容易数值下溢，因此取对数：

$$
\ell(\theta)
=
\log L(\theta)
=
-m\log(\sqrt{2\pi}\sigma)
-
\frac{1}{2\sigma^2}
\sum_{i=1}^{m}
\left(y^{(i)}-\theta^\top x^{(i)}\right)^2
$$

前一项与 $\theta$ 无关。最大化对数似然等价于最小化残差平方和。

这说明平方损失隐含了一个噪声假设：误差近似独立、均值为零、方差相同且服从高斯分布。

如果大误差和小误差的方差不同，或者数据含有大量离群点，普通最小二乘可能不再合适。可以考虑加权最小二乘、Huber 损失或显式建模异方差。

## 正规方程的几何解释

最小二乘寻找列空间 $\operatorname{Col}(X)$ 中离 $y$ 最近的向量 $X\theta$。

最优预测 $\hat y=X\hat\theta$ 是 $y$ 在 $X$ 的列空间上的正交投影。残差：

$$
r=y-X\hat\theta
$$

必须与列空间中的每一个方向正交，因此：

$$
X^\top r=0
$$

代入残差：

$$
X^\top(y-X\hat\theta)=0
$$

整理后得到：

$$
X^\top X\hat\theta=X^\top y
$$

这就是正规方程。它不仅是“令梯度等于零”的代数结果，也表达了投影误差与所有特征方向正交。

如果特征列线性相关，$X^\top X$ 不可逆。此时预测向量可能仍然唯一，但产生该预测的参数不一定唯一。

伪逆会返回最小范数解：

$$
\hat\theta=X^+y
$$

这也是实际实现应优先使用 `lstsq` 或 SVD，而不是显式求逆的原因。

## 一个两参数数值例子

考虑只有一个特征的数据：

$$
(x,y)\in\{(1,2),(2,3),(3,5)\}
$$

模型包含截距：

$$
h_\theta(x)=\theta_0+\theta_1x
$$

设计矩阵和目标为：

$$
X=
\begin{bmatrix}
1&1\\
1&2\\
1&3
\end{bmatrix},
\qquad
y=
\begin{bmatrix}
2\\3\\5
\end{bmatrix}
$$

计算：

$$
X^\top X
=
\begin{bmatrix}
3&6\\
6&14
\end{bmatrix},
\qquad
X^\top y
=
\begin{bmatrix}
10\\23
\end{bmatrix}
$$

求解线性方程得到：

$$
\hat\theta_0=\frac13,
\qquad
\hat\theta_1=\frac32
$$

预测值分别为 $11/6$、$10/3$ 和 $29/6$。残差之和为零，残差与 $x$ 的加权和也为零，对应含截距时正规方程的两个正交条件。

这个例子适合手工验证实现。若代码结果不同，优先检查截距列、样本轴方向和矩阵乘法顺序。

## 凸性与 Hessian

最小二乘目标的梯度为：

$$
\nabla J(\theta)
=
X^\top(X\theta-y)
$$

再求一次导数：

$$
\nabla^2J(\theta)
=
X^\top X
$$

对任意向量 $z$：

$$
z^\top X^\top Xz
=
\|Xz\|_2^2
\ge 0
$$

所以 $X^\top X$ 半正定，目标函数是凸函数。

若 $X$ 满列秩，则 $X^\top X$ 正定，最优参数唯一。若不满列秩，目标仍然凸，但可能存在一整组同样好的参数。

凸性保证局部极小值也是全局极小值，却不保证梯度下降一定快速。收敛速度仍受条件数和学习率影响。

## 特征缩放为什么改善收敛

假设房屋面积在 $[20,300]$，卧室数在 $[1,8]$。面积方向上的梯度尺度可能远大于卧室数方向。

损失等高线会成为狭长椭圆。固定学习率在陡峭方向容易过冲，在平缓方向又移动缓慢，参数轨迹呈之字形。

标准化把不同特征放到相近尺度，使 Hessian 的特征值比例缩小。梯度方向更接近直指最优点，允许使用更大的稳定学习率。

标准化参数必须只从训练集计算。验证集和测试集使用训练集的均值与标准差，否则会泄漏未来数据分布。

## 线性回归的完整实现

下面的伪代码强调数据协议和诊断，而不是库函数名称：

```python
# X_train: (m, n), y_train: (m,)
mu = X_train.mean(axis=0)
scale = X_train.std(axis=0)
scale = where(scale == 0, 1, scale)

X_train = (X_train - mu) / scale
X_dev = (X_dev - mu) / scale

X_train = add_intercept_column(X_train)
X_dev = add_intercept_column(X_dev)

theta = zeros(X_train.shape[1])

for step in range(max_steps):
    residual = X_train @ theta - y_train
    loss = 0.5 * mean(residual ** 2)
    gradient = X_train.T @ residual / len(y_train)
    theta = theta - learning_rate * gradient

    assert isfinite(loss)
    assert all_finite(theta)
    log(step, loss, norm(gradient), dev_mse(X_dev, y_dev, theta))
```

实现时要把训练预处理参数与模型一起保存。线上输入必须执行完全相同的缺失值处理、特征顺序和标准化。

## 常见失败模式

### 损失立即变成 `NaN`

通常是学习率过大、输入尺度悬殊、原始数据含无穷值，或平方运算溢出。

### 损失几乎不下降

检查梯度是否除错维度、参数是否真的更新、特征是否为常数，以及学习率是否过小。

### 训练误差低但验证误差高

可能是特征过多、样本少、数据划分漂移或泄漏。解决方向是简化模型、正则化、增加数据和修正划分。

### 闭式解与梯度下降结果不同

先统一目标的平均系数、截距、标准化和正则项，再比较预测值而不仅是参数值。共线情况下，不同参数也可能产生相同预测。

## 练习与答案思路

### 练习 1：手推梯度

对单样本目标：

$$
J(\theta)=\frac12(\theta^\top x-y)^2
$$

写出向量梯度。

答案：

$$
\nabla_\theta J
=(\theta^\top x-y)x
$$

先对外层平方求导得到残差，再乘内层 $\theta^\top x$ 对 $\theta$ 的导数 $x$。

### 练习 2：判断矩阵维度

若 $X\in\mathbb R^{m\times(n+1)}$，$\theta\in\mathbb R^{n+1}$，写出 $X\theta-y$ 和 $X^\top(X\theta-y)$ 的维度。

答案：前者为 $\mathbb R^m$，后者为 $\mathbb R^{n+1}$，与参数维度一致。

### 练习 3：解释共线性

若一个特征始终等于另一个特征的两倍，会发生什么？

答案思路：设计矩阵列相关，$X^\top X$ 奇异，参数不能唯一识别。应删除冗余特征、使用伪逆或加入正则化。

### 练习 4：选择求解器

当 $m=10^8$、$n=100$ 且数据流式到达，应优先考虑正规方程还是小批量梯度下降？

答案思路：优先小批量或在线梯度方法。构造完整矩阵和一次性求解不适合流式海量数据。

## 残差诊断

训练得到参数后，残差为：

$$
r^{(i)}
=
y^{(i)}-\hat y^{(i)}
$$

只报告 MSE 会掩盖模型假设是否失效。应画残差与预测值、主要特征和时间的关系。

理想情况下，残差围绕零随机波动。

若残差随预测值呈漏斗形，噪声方差可能随输入变化，即异方差。

若残差呈明显曲线，线性表示缺少非线性结构。

若残差随时间连续偏正，数据分布或系统基线可能漂移。

若少数样本残差极大，检查数据错误、离群点和高杠杆样本。

训练残差模式用于诊断，最终误差仍要在独立验证与测试数据上计算。

## 杠杆值与影响点

Hat Matrix：

$$
H
=
X(X^\top X)^{-1}X^\top
$$

预测：

$$
\hat y=Hy
$$

对角元素 $H_{ii}$ 称为 leverage，表示样本 $i$ 的特征位置对自身拟合的影响。

远离大多数训练样本的输入可能具有高 leverage。若它同时残差很大，会强烈改变回归系数。

这不表示应该自动删除。高影响点可能是录入错误，也可能是业务中真实且重要的稀有区域。

应结合数据来源、稳健回归和带/不带该样本的敏感性实验判断。

## Ridge 回归作为下一步

特征共线或参数方差大时，加入 $L_2$ 正则：

$$
J_\lambda(\theta)
=
\frac12\|X\theta-y\|_2^2
+
\frac\lambda2\|\theta\|_2^2
$$

梯度：

$$
\nabla J_\lambda
=
X^\top(X\theta-y)
+
\lambda\theta
$$

闭式解：

$$
\hat\theta_\lambda
=
(X^\top X+\lambda I)^{-1}X^\top y
$$

正则让原本很小的特征值增加 $\lambda$，改善条件数并压缩不稳定方向。

如果模型包含截距，通常不对截距惩罚。可使用对角矩阵：

$$
\Gamma
=
\operatorname{diag}(0,1,\ldots,1)
$$

目标正则项写为 $\theta^\top\Gamma\theta$。

$\lambda$ 必须通过验证选择，不能根据测试集调节。

## 不确定性与外推

点预测 $\hat y$ 不等于确定答案。

在线性 Gaussian 假设下，参数估计和预测可以构造置信区间，但它们依赖噪声、线性形式和独立性假设。

离训练分布很远的输入属于外推。线性函数仍会给出数值，却没有足够数据证据支持。

系统应记录输入到训练分布的距离、特征范围越界和预测不确定性。

价格不能为负、概率必须位于 $[0,1]$ 等输出约束也要考虑。普通线性回归不会自动满足这些约束。

## 线性回归项目验收

实现至少包含：

1. 训练集拟合标准化；
2. 截距处理；
3. 向量化损失和梯度；
4. 有限差分梯度检查；
5. 梯度下降与 `lstsq` 预测对比；
6. 学习率实验；
7. Ridge 正则实验；
8. 训练与验证学习曲线；
9. 残差图；
10. 切片误差和异常样本报告。

验收不能只写“程序运行成功”。应回答：

- 两种求解器预测是否一致？
- 标准化怎样改变收敛速度？
- 最大误差样本有什么共同特征？
- 增大 $\lambda$ 怎样影响参数范数和验证误差？
- 模型在哪些输入区域属于外推？

## 补充练习

### 练习 5：Ridge Hessian

写出 Ridge 目标的 Hessian。

答案：

$$
\nabla^2J_\lambda
=
X^\top X+\lambda I
$$

当 $\lambda>0$ 且所有参数都正则时，它正定。

### 练习 6：异方差

残差方差随房价增加而增大，可以做什么？

答案思路：对目标取对数、使用加权最小二乘、稳健标准误或显式异方差模型，并在验证集比较。

### 练习 7：外推

训练面积最大为 300 平方米，却预测 3000 平方米房屋，线性输出可信度如何？

答案：属于远距离外推。公式能输出数值，但数据未验证该区域关系，应标记低可信或限制使用。

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
