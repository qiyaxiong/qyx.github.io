---
title: P18：讨论课——期中复习
description: 对应 B 站 P18 和 2018-11-02 Discussion Section，按建模假设、目标、梯度、泛化和诊断串联期中前核心内容。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 复习不是重抄公式

期中复习的目标是看到问题后识别：

1. 输出变量是什么；
2. 概率或几何假设是什么；
3. 优化哪个目标；
4. 参数怎样求；
5. 怎样判断实现和泛化是否正确。

若只记最终更新式，题目稍改标签编码、损失缩放或矩阵布局就容易失去方向。

## 线性回归闭环

模型：

$$
h_\theta(x)=\theta^\top x
$$

目标：

$$
J(\theta)
=\frac12\|X\theta-y\|_2^2
$$

梯度：

$$
\nabla J
=X^\top(X\theta-y)
$$

正规方程：

$$
X^\top X\theta=X^\top y
$$

概率解释：若：

$$
y\mid x
\sim\mathcal N(\theta^\top x,\sigma^2)
$$

最大似然等价于最小二乘。

## 逻辑回归闭环

模型：

$$
P(y=1\mid x)
=\sigma(\theta^\top x)
$$

负对数似然：

$$
J
=-\sum_i
\left[
y_i\log h_i
+(1-y_i)\log(1-h_i)
\right]
$$

梯度：

$$
\nabla J=X^\top(h-y)
$$

Hessian：

$$
H=X^\top RX
$$

它半正定，因此负对数似然是凸函数。

## GLM 识别模板

看到新的输出分布：

1. 写成指数族；
2. 找到自然参数 $\eta$；
3. 令 $\eta=\theta^\top x$；
4. 用 $E[y\mid x]=a'(\eta)$ 得到响应函数；
5. 写出似然并求梯度。

Bernoulli 导出逻辑回归，Gaussian 导出线性回归，Poisson 导出指数均值。

## 生成式分类模板

建模：

$$
p(x\mid y)
\quad\text{和}\quad
p(y)
$$

预测：

$$
\arg\max_y
\left[
\log p(x\mid y)+\log p(y)
\right]
$$

GDA 使用连续高斯特征；Naive Bayes 常用于离散或文本特征。

答题时必须写清条件独立、共享协方差等假设。

## GDA 与逻辑回归比较

两者可产生相同形式的线性后验边界，但：

- GDA 最大化联合似然；
- 逻辑回归最大化条件似然；
- GDA 假设更强、参数有闭式估计；
- 逻辑回归对 $p(x)$ 误设更稳健。

比较模型时应从假设和数据量出发，而不是只比较边界形状。

## SVM 闭环

几何间隔：

$$
\gamma_i
=\frac{
y_i(w^\top x_i+b)
}{
\|w\|
}
$$

硬间隔原始问题：

$$
\min_{w,b}\frac12\|w\|^2
$$

$$
y_i(w^\top x_i+b)\ge1
$$

软间隔：

$$
\min
\frac12\|w\|^2+C\sum_i\xi_i
$$

对偶只包含内积，因此可替换为 Kernel。

## KKT 解题结构

写出：

- 原始可行性；
- 对偶可行性；
- 驻点；
- 互补松弛。

互补松弛：

$$
\alpha_i
\left[
y_if(x_i)-1+\xi_i
\right]
=0
$$

它连接了样本位置与对偶系数，是解释支持向量的关键。

## 偏差与方差

高偏差：

```text
训练误差高
验证误差也高
二者接近
```

高方差：

```text
训练误差低
验证误差明显更高
```

措施要对应诊断。高偏差时盲目增加数据可能收效有限；高方差时继续增加模型容量可能更糟。

## ERM 与泛化

经验风险：

$$
\hat\varepsilon(h)
$$

真风险：

$$
\varepsilon(h)
$$

有限假设类通过 Hoeffding 与 Union Bound 获得一致收敛；无限假设类使用 VC 维衡量有效复杂度。

结论不是“参数越少一定越好”，而是复杂度、样本量和允许误差必须匹配。

## 神经网络前向与反向

前向：

$$
Z^{[l]}
=W^{[l]}A^{[l-1]}+b^{[l]}
$$

$$
A^{[l]}=\phi(Z^{[l]})
$$

反向：

$$
dW^{[l]}
=\frac1m
dZ^{[l]}(A^{[l-1]})^\top
$$

$$
dA^{[l-1]}
=(W^{[l]})^\top dZ^{[l]}
$$

答题时先标 shape，能避免大部分转置错误。

## 常见推导错误

- 把最大化对数似然与最小化负对数似然的符号混淆；
- 忘记 $1/m$ 只改变梯度尺度；
- 把矩阵乘法写成逐元素乘法；
- 在乘积求导时漏掉链式法则；
- 把不相关当成独立；
- 把函数间隔当作几何距离；
- 忘记 Kernel 必须对应半正定 Gram 矩阵；
- 使用测试集选择超参数。

## 考试与实现共同检查法

对任何公式依次检查：

1. 维度是否正确；
2. 极端输入是否合理；
3. 符号是否符合优化方向；
4. 概率是否归一化；
5. 目标是否有界；
6. 特殊情况能否退化到熟悉模型；
7. 数值实现是否稳定。

## 统一解题框架

![CS229 期中模型从假设、目标、梯度到诊断的统一解题闭环](/images/notes/cs229/tikz/p18-midterm-unified-solution-loop.png)

遇到任何模型题，按以下顺序展开：

1. 写出样本、参数和维度；
2. 写出概率假设或预测函数；
3. 写出单样本损失或似然；
4. 汇总成训练目标；
5. 对参数求梯度或建立约束；
6. 写出更新、闭式解或推断步骤；
7. 检查凸性、唯一性和数值稳定性；
8. 说明泛化与验证方法。

这套框架能防止只记住最后公式，却不知道符号从哪里来。

## 综合题一：线性回归

给定：

$$
X\in\mathbb R^{m\times n},
\quad
y\in\mathbb R^m
$$

目标：

$$
J(\theta)
=
\frac1{2m}
\|X\theta-y\|_2^2
$$

展开微分：

$$
dJ
=
\frac1m
(X\theta-y)^\top X\,d\theta
$$

所以：

$$
\nabla_\theta J
=
\frac1m
X^\top(X\theta-y)
$$

Hessian：

$$
\nabla^2J
=
\frac1mX^\top X
\succeq0
$$

因此目标凸。若 $X$ 满列秩，则最优解唯一。

加入 Ridge：

$$
J_\lambda(\theta)
=
J(\theta)
+
\frac\lambda2\|\theta\|_2^2
$$

梯度增加 $\lambda\theta$，闭式解为：

$$
\hat\theta
=
\left(
X^\top X+m\lambda I
\right)^{-1}
X^\top y
$$

## 综合题二：逻辑回归

模型：

$$
p(y=1\mid x)
=
\sigma(\theta^\top x)
$$

单样本负对数似然：

$$
\ell_i
=
-y_i\log h_i
-(1-y_i)\log(1-h_i)
$$

梯度：

$$
\nabla_\theta J
=
\frac1m
X^\top(h-y)
$$

Hessian：

$$
H
=
\frac1m
X^\top RX
$$

其中 $R_{ii}=h_i(1-h_i)\ge0$，所以目标凸。

与线性回归不同，逻辑回归一般没有闭式解，需要梯度法或 Newton 类方法。

若数据完全可分且没有正则，参数范数可能无限增长，因此需要识别这种训练现象。

## 综合题三：GDA

假设：

$$
x\mid y=k
\sim
\mathcal N(\mu_k,\Sigma)
$$

共享协方差使两类 log-density 的二次项抵消，后验 log-odds 对 $x$ 为线性函数。

参数 MLE：

$$
\phi
=
\frac1m\sum_i\mathbf1\{y_i=1\}
$$

$$
\mu_k
=
\frac{
\sum_i\mathbf1\{y_i=k\}x_i
}{
\sum_i\mathbf1\{y_i=k\}
}
$$

$$
\Sigma
=
\frac1m
\sum_i
(x_i-\mu_{y_i})
(x_i-\mu_{y_i})^\top
$$

若每类使用不同协方差，判别边界为二次。

## 综合题四：SVM

硬间隔原问题：

$$
\min_{w,b}
\frac12\|w\|^2
$$

满足：

$$
y_i(w^\top x_i+b)\ge1
$$

拉格朗日函数：

$$
\mathcal L
=
\frac12\|w\|^2
-
\sum_i\alpha_i
\left[
y_i(w^\top x_i+b)-1
\right]
$$

驻点条件给：

$$
w=\sum_i\alpha_i y_ix_i
$$

和：

$$
\sum_i\alpha_i y_i=0
$$

对偶中样本只通过 $x_i^\top x_j$ 出现，可以替换为 Kernel。

互补松弛说明只有支持向量的 $\alpha_i$ 可能非零。

## 综合题五：学习理论

固定假设的 Hoeffding 界：

$$
P
\left(
|\hat R(h)-R(h)|>\epsilon
\right)
\le
2e^{-2m\epsilon^2}
$$

有限假设类通过 Union Bound：

$$
P
\left(
\exists h\in\mathcal H:
|\hat R(h)-R(h)|>\epsilon
\right)
\le
2|\mathcal H|e^{-2m\epsilon^2}
$$

扩大假设类降低近似误差，却提高估计难度。验证集、正则化和结构风险最小化都在处理这一权衡。

## 综合题六：神经网络

线性层：

$$
Z=WA+b
$$

若上游梯度为 $dZ$：

$$
dW=dZ\,A^\top
$$

$$
db=\sum_{\text{batch}}dZ
$$

$$
dA=W^\top dZ
$$

激活层：

$$
dZ=dA\odot g'(Z)
$$

反向传播从输出向输入依次应用链式法则。每个梯度的形状必须与对应变量或参数一致。

## 高频概念比较

| 对比                 | 核心差异                                      |
| -------------------- | --------------------------------------------- |
| 生成式 vs 判别式     | 建模联合/类条件分布 vs 直接建模条件分布或边界 |
| MLE vs MAP           | 只用似然 vs 似然加参数先验                    |
| 参数 vs 超参数       | 训练估计 vs 验证选择                          |
| 函数间隔 vs 几何间隔 | 受参数缩放影响 vs 除以 $\|w\|$ 后具有距离意义 |
| Bias vs Variance     | 模型系统性不足 vs 对训练样本扰动敏感          |
| Train vs Dev vs Test | 拟合参数 vs 选择方案 vs 最终无偏评估          |
| 梯度下降 vs Newton   | 一阶、单步便宜 vs 使用曲率、单步昂贵          |

## 推导自检方法

先做维度检查。梯度必须与参数同形状，标量损失的最终表达不能留下自由向量维度。

再做极端值检查。例如 $\lambda\to\infty$ 时正则模型参数应趋近零；Kernel 宽度极大时样本相似度应趋近一。

检查符号。最大化对数似然用梯度上升，最小化负对数似然用梯度下降，两者不能混写。

检查归一化。概率分布对全部结果求和或积分应为一。

最后用有限差分检查实现梯度。

## 模拟练习与答案思路

### 练习 1

为什么逻辑回归不能使用平方损失的正规方程？

答案：Sigmoid 使目标不再是参数的二次函数，梯度方程不能整理为固定线性系统。

### 练习 2

Naive Bayes 某词概率为零会发生什么？

答案：整篇文档对应类别似然变为零，需要拉普拉斯或 Dirichlet 平滑。

### 练习 3

SVM 中 $0<\alpha_i<C$ 的样本位于哪里？

答案：位于间隔边界上，满足 $y_if(x_i)=1$。

### 练习 4

训练误差与验证误差都高，增加训练数据一定有用吗？

答案：不一定。这更像高偏差或优化失败，应先检查容量、特征和训练过程。

### 练习 5

测试集可以用来选择正则强度吗？

答案：不可以。应使用验证集或交叉验证，测试集只评估最终流程。

## 公式地图

### 线性回归

$$
h_\theta(x)=\theta^\top x
$$

$$
J=\frac1{2m}\|X\theta-y\|^2
$$

$$
\nabla J=\frac1mX^\top(X\theta-y)
$$

### 逻辑回归

$$
h_\theta(x)=\sigma(\theta^\top x)
$$

$$
J=-\frac1m\sum_i
\left[
y_i\log h_i+(1-y_i)\log(1-h_i)
\right]
$$

$$
\nabla J=\frac1mX^\top(h-y)
$$

### Gaussian

$$
p(x)
\propto
|\Sigma|^{-1/2}
\exp
\left[
-\frac12
(x-\mu)^\top
\Sigma^{-1}
(x-\mu)
\right]
$$

### SVM

$$
\min_{w,b}
\frac12\|w\|^2
+
C\sum_i\xi_i
$$

$$
y_i(w^\top x_i+b)\ge1-\xi_i
$$

### 泛化

$$
\text{总误差}
=
\text{近似误差}
+
\text{估计误差}
+
\text{不可约噪声}
$$

### 神经网络线性层

$$
Z=WA+b
$$

$$
dW=dZ\,A^\top,
\quad
dA=W^\top dZ
$$

这张地图用于快速定位，不替代推导。

## 易混符号

$m$ 通常是样本数，$n$ 是特征数。

$x^{(i)}$ 上标括号表示第 $i$ 个样本，不是幂。

$x_j$ 表示第 $j$ 个特征。

$\ell(\theta)$ 常表示 log-likelihood，但不同材料也可能用 $\ell$ 表示 loss。先看上下文。

$J(\theta)$ 通常是要最小化的目标。

$\lambda$ 可能是正则强度、特征值或拉格朗日乘子，必须结合章节。

$\alpha$ 可能是学习率或 SVM 对偶变量。

考试和代码中先写符号定义，可避免大量歧义。

## 推导题评分点

完整推导通常包括：

1. 正确概率或目标；
2. 对数化与常数项处理；
3. 每步链式法则；
4. 维度一致；
5. 令梯度为零或写更新；
6. 说明条件；
7. 最终结果。

只写背诵结果，即使答案对，也无法证明理解中间逻辑。

若使用矩阵微分，说明采用的样本轴和梯度约定。

## 概念题回答模板

比较两个模型时：

```text
共同点
核心假设差异
目标函数差异
优化差异
样本效率
输出解释
失败条件
适用场景
```

例如 GDA 与逻辑回归都可给线性边界，但 GDA 建模类条件输入分布，假设更强；逻辑回归直接建模后验。

## 代码题检查

写出 shape：

```python
X      # (m, n)
theta  # (n,)
y      # (m,)
```

检查：

- 是否有意广播；
- loss 是否标量；
- gradient 是否与参数同 shape；
- 平均系数；
- 稳定的 log/exp；
- 不显式 inverse；
- 训练预处理不读取验证；
- 更新前清梯度。

用两三个样本手算期望输出。

## 模拟题七：正则化

Ridge：

$$
\lambda\|\theta\|_2^2
$$

平滑压缩系数、改善条件数。

Lasso：

$$
\lambda\|\theta\|_1
$$

促进稀疏，但零点不可微。

增大 $\lambda$ 通常提高偏差、降低方差。

特征必须缩放，截距通常不惩罚。

## 模拟题八：模型选择

流程：

```text
训练集拟合参数
验证集选择模型/超参数/阈值/epoch
测试集一次性评估完整流程
```

交叉验证中，预处理必须在每个训练 fold 内拟合。

时间或群组数据不能随意随机切分。

## 模拟题九：错误诊断

情形 A：

```text
训练误差高
验证误差高
```

检查优化与高偏差。

情形 B：

```text
训练误差低
验证误差高
```

检查高方差、泄漏和分布差异。

情形 C：

```text
离线好
线上差
```

检查服务一致性、漂移和反馈。

## 期中自测

在不查资料情况下完成：

1. 推导线性回归梯度和正规方程；
2. 从 Bernoulli 似然推导逻辑回归梯度；
3. 推导共享协方差 GDA 的线性边界；
4. 写出 Naive Bayes 平滑；
5. 从 SVM 原问题得到 $w=\sum_i\alpha_iy_ix_i$；
6. 解释 KKT 与支持向量；
7. 用 Hoeffding 和 Union Bound 写有限类样本界；
8. 手算两层网络前向和梯度 shape；
9. 设计无泄漏交叉验证；
10. 根据学习曲线给下一步行动。

每题不仅写公式，还要写一个假设和一个常见失败。

## 补充练习

### 练习 6

为什么 $X^\top X$ 总半正定？

答案：

$$
z^\top X^\top Xz=\|Xz\|^2\ge0
$$

### 练习 7

GDA 协方差估计奇异时有哪些选择？

答案：收缩、对角协方差、伪逆、降维或增加数据。

### 练习 8

Softmax logits 全部加 100，概率是否改变？

答案：不改变，公共指数因子在分子分母抵消。

## 三天复习计划

### Day 1：监督学习推导

不看答案推导：

```text
线性回归
逻辑回归
GDA
Naive Bayes
SVM
```

每题写维度、概率假设、目标、梯度与失败条件。

### Day 2：模型选择与理论

完成：

```text
Bias/Variance 诊断
正则化
交叉验证
Hoeffding
Union Bound
VC 维例子
```

为一个错误数据划分找出泄漏。

### Day 3：神经网络与综合题

手算两层网络前向和反向 shape。

做一套混合题，并按错误类型复盘：

```text
概念
代数
符号
维度
概率
数值
```

只重做错题对应依赖，不再从第一页全部重看。

## 口头解释测试

尝试不用公式解释：

- 逻辑回归为什么适合分类；
- GDA 为什么得到线性边界；
- SVM 为什么只依赖支持向量；
- 正则化为什么改善泛化；
- 交叉验证为什么不能提前标准化；
- 神经网络为什么需要非线性。

若只能复述术语，回到数值例子。

再用公式精确补充口头解释，避免“只有直觉没有定义”。

## 最小实现测试

从零实现：

```text
Linear Regression loss/gradient
Logistic loss/gradient
Naive Bayes counts
Linear SVM subgradient
Two-layer forward
```

每个实现用小数据、成熟库和有限差分验证。

理论、手算和代码三者结果一致，才是可靠掌握证据。

## 本节检查

- 能从概率假设推回损失；
- 能独立推导线性与逻辑回归梯度；
- 能比较生成式与判别式学习；
- 能写出 SVM 原始/对偶结构与 KKT；
- 能用偏差/方差决定改进方向；
- 能解释 ERM 的泛化条件；
- 能写出神经网络前向和反向 shape；
- 能使用统一检查法发现推导错误。

下一节进入无监督学习：[P19：K-means、GMM 与 EM](/notes/cs229/course/p19-kmeans-gmm-em)。

## 来源说明

- 视频：[B 站 P18：Midterm Review Section](https://www.bilibili.com/video/BV1fP4y127nn/?p=18)
- 讲义：[Midterm Review，共 54 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/materials/cs229-mt-review.pdf)

中文内容按照期中知识依赖重新串联，不替代官方题目与课堂讲解。
