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

## Kernel 等价于隐式特征内积

Kernel 函数满足：

$$
K(x,z)
=
\phi(x)^\top\phi(z)
$$

$\phi(x)$ 可以是高维甚至无限维映射，但算法不需要显式构造它。

例如二次多项式 Kernel：

$$
K(x,z)
=(x^\top z+c)^2
$$

对二维输入 $x=(x_1,x_2)$，可对应包含：

$$
x_1^2,\quad
\sqrt2x_1x_2,\quad
x_2^2,\quad
\sqrt{2c}x_1,\quad
\sqrt{2c}x_2,\quad
c
$$

的特征映射。

Kernel Trick 的价值不是“凭空创造非线性”，而是在只依赖样本内积的算法中，以可计算的 $K(x,z)$ 替换显式高维内积。

## 合法 Kernel 与 Gram 矩阵

给定样本 $x^{(1)},\ldots,x^{(m)}$，Gram 矩阵定义为：

$$
K_{ij}
=
K(x^{(i)},x^{(j)})
$$

合法 Kernel 的 Gram 矩阵必须对称半正定：

$$
c^\top Kc\ge0
$$

因为若 $K_{ij}=\phi(x^{(i)})^\top\phi(x^{(j)})$：

$$
c^\top Kc
=
\left\|
\sum_i c_i\phi(x^{(i)})
\right\|_2^2
\ge0
$$

Mercer 条件提供了 Kernel 对应某个特征空间内积的保证。

常用闭包性质：

- 若 $K_1,K_2$ 合法，则 $K_1+K_2$ 合法；
- 对 $a\ge0$，$aK_1$ 合法；
- $K_1K_2$ 合法；
- 对任意函数 $f$，$f(x)K_1(x,z)f(z)$ 合法。

任意“相似度函数”不一定是合法 Kernel。非半正定 Gram 矩阵可能破坏凸性和求解器假设。

## RBF Kernel 的尺度

高斯 RBF Kernel：

$$
K(x,z)
=
\exp\left(
-\frac{\|x-z\|_2^2}{2\sigma^2}
\right)
$$

$\sigma$ 很小，每个样本只与非常近的邻居相似，模型边界复杂、方差高。

$\sigma$ 很大，大多数样本彼此相似，模型趋于平滑、偏差高。

许多库使用：

$$
\gamma=\frac{1}{2\sigma^2}
$$

所以增大 $\gamma$ 等价于减小 $\sigma$。

RBF 依赖欧氏距离，因此特征必须缩放。否则数值范围最大的特征会主导相似度。

## Kernel SVM 的预测形式

硬间隔对偶中：

$$
w
=
\sum_i\alpha_i y^{(i)}\phi(x^{(i)})
$$

对新样本 $x$：

$$
f(x)
=
w^\top\phi(x)+b
$$

代入 $w$：

$$
f(x)
=
\sum_i
\alpha_i y^{(i)}
K(x^{(i)},x)
+b
$$

只有支持向量的 $\alpha_i$ 非零，因此预测成本与支持向量数量成正比，而不是只与特征数有关。

支持向量很多时，Kernel SVM 的线上延迟和内存开销会显著增加。

## SMO 为什么一次更新两个变量

软间隔对偶有等式约束：

$$
\sum_i\alpha_i y^{(i)}=0
$$

若只改变一个 $\alpha_i$，通常会破坏该约束。SMO 每次选择两个变量 $\alpha_i,\alpha_j$ 联合更新，其余保持不变。

等式约束可以用一个变量表示另一个，把子问题化为有上下界的一维二次优化，得到解析更新并裁剪到：

$$
0\le\alpha_i,\alpha_j\le C
$$

SMO 的关键不是单次公式，而是工作集选择、误差缓存和停止条件。优秀启发式会优先选择最可能违反 KKT 条件的样本。

## 正则强度与 Kernel 宽度联合调节

$C$ 和 $\gamma$ 控制不同维度：

- $C$ 控制违反间隔的惩罚；
- $\gamma$ 控制单个样本影响范围。

大 $C$、大 $\gamma$ 常产生复杂边界和高方差；小 $C$、小 $\gamma$ 常产生过度平滑边界。

应在对数尺度上搜索：

```text
C ∈ {10^-3, 10^-2, ..., 10^3}
gamma ∈ {10^-4, 10^-3, ..., 10^2}
```

先做粗网格或随机搜索，再围绕较优区域细化。所有选择必须只看验证集或交叉验证结果。

## Kernel 方法的计算复杂度

完整 Gram 矩阵需要 $O(m^2)$ 存储。训练的时间复杂度依赖求解器和数据结构，最坏情况下可能接近立方级。

当样本数达到几十万或更多时，完整 Kernel SVM 往往不现实。可考虑：

- 线性模型加显式非线性特征；
- 随机 Fourier Features 近似 RBF；
- Nyström 低秩近似；
- 树模型或神经网络；
- 分块和预算化 Kernel 方法。

选择 Kernel 不是只看精度，还要评估训练内存、预测支持向量数量和线上延迟。

## Kernel 近似的直觉

对平移不变 Kernel，随机 Fourier Features 构造有限维映射 $z(x)$，使：

$$
K(x,z)
\approx
z(x)^\top z(z)
$$

之后可以使用普通线性模型训练，复杂度从依赖全部样本对转为依赖近似特征维度。

近似维度越大，Kernel 逼近更好，但计算和内存也增加。它把非参数 Kernel 方法转换成可扩展的显式特征方法。

## 诊断清单

训练前：

- 标准化连续特征；
- 固定训练、验证和测试划分；
- 检查类别不平衡；
- 先训练线性基线。

训练后：

- 比较训练与验证误差；
- 记录支持向量比例；
- 检查 $C$、$\gamma$ 的敏感性；
- 统计单次预测时间；
- 若需要概率，执行独立校准。

若支持向量接近全部训练样本，模型可能复杂、数据噪声高，或 Kernel 参数不合适。

## 练习与答案思路

### 练习 1：Kernel 组合

$K_1$ 和 $K_2$ 都合法，$3K_1+2K_2$ 是否合法？

答案：合法。合法 Kernel 的非负线性组合仍然合法。

### 练习 2：RBF 参数

验证集表现显示模型边界过于曲折，可怎样调整 $\gamma$？

答案思路：减小 $\gamma$，扩大相似范围，使边界更平滑；同时联合验证 $C$。

### 练习 3：预测复杂度

Kernel SVM 为什么可能比线性 SVM 预测慢？

答案：预测需计算新样本与所有支持向量的 Kernel，成本随支持向量数增长。

### 练习 4：大数据选择

一百万样本上是否应直接构造完整 RBF Gram 矩阵？

答案：通常不可行，矩阵有 $10^{12}$ 个元素。应使用线性方法、显式特征或 Kernel 近似。

## Representer Theorem 的意义

许多正则化 Kernel 问题的最优函数都可以写成训练样本 Kernel 的有限展开：

$$
f^\star(x)
=
\sum_{i=1}^{m}
\alpha_iK(x^{(i)},x)
$$

即使对应特征空间无限维，最优解仍位于训练样本映射张成的子空间中。

训练数据正交补方向不会改变训练预测，却增加 RKHS 范数，因此最优解不会包含它。

Representer Theorem 解释了为什么我们只需优化 $m$ 个系数 $\alpha$，而不必显式处理无限维函数。

## Kernel Ridge Regression

线性 Ridge 的特征空间形式：

$$
\min_w
\|y-\Phi w\|_2^2
+
\lambda\|w\|_2^2
$$

由 Representer 形式：

$$
w=\Phi^\top\alpha
$$

定义 Gram 矩阵：

$$
K=\Phi\Phi^\top
$$

可得：

$$
\alpha
=(K+\lambda I)^{-1}y
$$

新样本预测：

$$
f(x)
=
k(x)^\top\alpha
$$

其中：

$$
k(x)
=
\begin{bmatrix}
K(x^{(1)},x)&\cdots&K(x^{(m)},x)
\end{bmatrix}^\top
$$

Kernel Ridge 目标光滑、有闭式线性系统，但训练仍需处理 $m\times m$ Kernel 矩阵。

## Kernel 与 Gaussian Process 的联系

Kernel 在 SVM 中定义相似度和特征空间内积。

在 Gaussian Process 中，Kernel 定义函数值之间的先验协方差：

$$
f
\sim
\mathcal{GP}(0,K)
$$

相近输入若 Kernel 值高，先验认为其函数值更相关。

Kernel Ridge 的预测均值与带 Gaussian 噪声 GP 回归的后验均值形式密切相关。

GP 进一步给出预测不确定性，但计算同样受 $O(m^3)$ 分解和 $O(m^2)$ 存储限制。

## Kernel Centering

某些 Kernel 方法需要在特征空间中心化。

令：

$$
H
=
I-\frac1m\mathbf1\mathbf1^\top
$$

中心化 Gram 矩阵：

$$
K_c
=
HKH
$$

它对应把隐式特征：

$$
\phi(x_i)
$$

减去训练集特征均值。

Kernel PCA 使用中心化 Kernel 做特征分解。忘记中心化会让第一方向受特征空间均值影响。

测试样本的 Kernel 向量也必须用训练集统计做相应中心化。

## 自定义 Kernel 检查

若设计领域 Kernel，先对代表性数据计算 Gram 矩阵。

检查：

```text
K 是否近似对称
最小特征值是否只存在数值级负值
对角元素是否有限且非负
尺度是否极端
参数变化是否符合相似度直觉
```

数值误差可能产生很小负特征值，可做对称化和轻微 jitter：

$$
\frac12(K+K^\top)+\epsilon I
$$

若存在大幅负特征值，说明函数可能不是合法 PSD Kernel，不能只靠 jitter 掩盖。

## 多 Kernel 与特征融合

不同数据模态可有不同 Kernel：

$$
K
=
\beta_1K_{\text{text}}
+
\beta_2K_{\text{image}}
+
\beta_3K_{\text{metadata}}
$$

当 $\beta_j\ge0$ 时，非负组合保持合法。

各 Kernel 应先适当归一化，否则数值尺度大的 Kernel 主导组合。

权重可通过验证选择或 Multiple Kernel Learning 学习。

这提供一种插件式融合视角：每种模态只需提供合法相似度接口，主算法使用统一 Gram 矩阵。

## 选择 Kernel 的实验路径

先训练线性 Kernel，建立数据是否近似线性可分的基线。

再尝试 RBF，联合搜索 $C,\gamma$。

若有明确结构，尝试多项式、字符串、图或领域 Kernel。

记录：

- Gram 矩阵构建时间；
- 峰值内存；
- 训练时间；
- 支持向量数；
- 预测延迟；
- 指标与校准。

精度提升很小但支持向量数量巨大时，生产系统可能更适合显式特征和线性模型。

## Kernel 方法项目

选一个中等规模非线性分类数据集：

1. 标准化特征；
2. 训练线性 SVM；
3. 训练 RBF SVM；
4. 画二维子集决策边界；
5. 搜索 $C,\gamma$；
6. 统计支持向量比例；
7. 实现随机 Fourier Features；
8. 比较近似维度、精度和延迟。

报告要说明非线性收益来自哪里，以及完整 Kernel 在样本规模上何时不可接受。

## 补充练习

### 练习 5：Kernel Ridge

训练系数 $\alpha$ 的线性系统是什么？

答案：

$$
(K+\lambda I)\alpha=y
$$

### 练习 6：Kernel Centering

中心化矩阵 $H$ 满足什么投影性质？

答案：

$$
H^\top=H,
\qquad
H^2=H
$$

### 练习 7：多模态组合

两个合法 Kernel 的差 $K_1-K_2$ 是否一定合法？

答案：不一定。合法性闭包要求非负线性组合。

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
