---
title: P6：讨论课——概率论复习
description: 对应 B 站 P6 和 2018-10-05 Discussion Section，复习条件概率、Bayes 公式、随机变量、期望方差、常见分布与最大似然。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 概率模型在 CS229 中做什么

概率论不是只为处理“随机噪声”。它提供一套完整语言来描述：

- 数据怎样生成；
- 参数未知时如何根据数据估计；
- 观测后怎样更新不确定性；
- 模型输出怎样解释为概率；
- 多个变量之间怎样依赖。

线性回归的平方损失、逻辑回归的交叉熵、GDA、Naive Bayes、EM、Factor Analysis、LQG 都依赖概率建模。

## 样本空间与事件

随机试验的所有可能结果构成样本空间 $\Omega$，事件 $A$ 是其子集。

概率满足：

$$
P(A)\ge0
$$

$$
P(\Omega)=1
$$

互斥事件 $A_i$ 满足：

$$
P\left(\bigcup_iA_i\right)
=\sum_iP(A_i)
$$

补事件：

$$
P(A^c)=1-P(A)
$$

并集公式：

$$
P(A\cup B)
=P(A)+P(B)-P(A\cap B)
$$

## 条件概率

在已知 $B$ 发生后，$A$ 的条件概率：

$$
P(A\mid B)
=\frac{P(A\cap B)}{P(B)}
$$

因此乘法规则：

$$
P(A\cap B)
=P(A\mid B)P(B)
$$

对多个变量使用链式法则：

$$
p(x_1,\ldots,x_n)
=\prod_{i=1}^{n}
p(x_i\mid x_1,\ldots,x_{i-1})
$$

任何联合分布都能这样分解；模型的区别在于进一步加入哪些条件独立假设。

## Bayes 公式

由乘法规则：

$$
P(A\mid B)
=\frac{P(B\mid A)P(A)}{P(B)}
$$

在参数推断中：

$$
p(\theta\mid D)
=\frac{
p(D\mid\theta)p(\theta)
}{
p(D)
}
$$

可理解为：

```text
后验 ∝ 似然 × 先验
```

$p(D)$ 是归一化常数，也称证据：

$$
p(D)=\int p(D\mid\theta)p(\theta)\,d\theta
$$

## 全概率公式

若 $\{B_k\}$ 构成互斥且完备的划分：

$$
P(A)
=\sum_kP(A\mid B_k)P(B_k)
$$

隐变量模型中：

$$
p(x)
=\sum_zp(x\mid z)p(z)
$$

GMM 的观测密度就是对未观测类别 $z$ 求和。连续隐变量则把求和换成积分。

## 独立与条件独立

$A$ 与 $B$ 独立：

$$
P(A,B)=P(A)P(B)
$$

条件独立写作：

$$
A\perp B\mid C
$$

表示给定 $C$ 后：

$$
P(A,B\mid C)
=P(A\mid C)P(B\mid C)
$$

独立不蕴含条件独立，条件独立也不蕴含边缘独立。

Naive Bayes 假设各特征在类别 $y$ 给定时条件独立，而不是声称现实中特征彼此完全无关。

## 随机变量与分布

离散随机变量使用概率质量函数：

$$
p_X(x)=P(X=x)
$$

连续随机变量使用密度：

$$
P(a\le X\le b)
=\int_a^b f_X(x)\,dx
$$

连续变量在单点的概率为零，但密度值可以大于 $1$；真正的概率来自区间积分。

累积分布函数：

$$
F_X(x)=P(X\le x)
$$

同时适用于离散和连续变量。

## 期望

离散变量：

$$
E[X]
=\sum_xx\,p(x)
$$

连续变量：

$$
E[X]
=\int x f(x)\,dx
$$

函数的期望：

$$
E[g(X)]
=\sum_xg(x)p(x)
$$

或相应积分。

期望具有线性性，无需变量独立：

$$
E[aX+bY]
=aE[X]+bE[Y]
$$

## 方差与协方差

方差：

$$
\operatorname{Var}(X)
=E[(X-E[X])^2]
=E[X^2]-E[X]^2
$$

协方差：

$$
\operatorname{Cov}(X,Y)
=E[(X-E[X])(Y-E[Y])]
$$

若独立，则协方差为零；反向通常不成立。高斯变量是一个重要例外：联合高斯下零协方差蕴含独立。

随机向量 $X\in\mathbb R^n$ 的协方差矩阵：

$$
\Sigma
=E[(X-\mu)(X-\mu)^\top]
$$

它是对称半正定矩阵。

## Bernoulli 与 Binomial

Bernoulli：

$$
X\sim\operatorname{Bernoulli}(\phi)
$$

$$
P(X=1)=\phi,
\qquad
P(X=0)=1-\phi
$$

$$
E[X]=\phi,
\qquad
\operatorname{Var}(X)=\phi(1-\phi)
$$

$n$ 次独立 Bernoulli 成功次数服从 Binomial：

$$
K\sim\operatorname{Binomial}(n,\phi)
$$

## Gaussian

一维高斯：

$$
X\sim\mathcal N(\mu,\sigma^2)
$$

$$
p(x)
=\frac{1}{\sqrt{2\pi}\sigma}
\exp\left(
-\frac{(x-\mu)^2}{2\sigma^2}
\right)
$$

多元高斯：

$$
X\sim\mathcal N(\mu,\Sigma)
$$

$$
p(x)
=\frac{1}{
(2\pi)^{n/2}|\Sigma|^{1/2}
}
\exp\left(
-\frac12
(x-\mu)^\top
\Sigma^{-1}
(x-\mu)
\right)
$$

指数中的量是 Mahalanobis 距离，协方差决定等密度椭球的方向和尺度。

## 最大似然估计

给定独立同分布样本：

$$
D=\{x^{(1)},\ldots,x^{(m)}\}
$$

似然：

$$
L(\theta)
=\prod_{i=1}^{m}p(x^{(i)};\theta)
$$

最大似然估计：

$$
\hat\theta_{\mathrm{MLE}}
=\arg\max_\theta L(\theta)
$$

通常最大化对数似然：

$$
\ell(\theta)
=\sum_{i=1}^{m}\log p(x^{(i)};\theta)
$$

对数把乘积变成求和，也改善数值稳定性。

## MAP 与 MLE

若参数有先验 $p(\theta)$，最大后验估计：

$$
\hat\theta_{\mathrm{MAP}}
=\arg\max_\theta
\left[
\log p(D\mid\theta)
+\log p(\theta)
\right]
$$

MLE 只最大化似然；MAP 还加入先验。

高斯先验：

$$
\theta\sim\mathcal N(0,\tau^2I)
$$

会产生 $L_2$ 正则项。正则化因此可以从优化稳定和概率先验两个角度理解。

## 变量变换

若一维变量：

$$
Y=g(X)
$$

且 $g$ 单调可逆，则：

$$
p_Y(y)
=p_X(g^{-1}(y))
\left|
\frac{d\,g^{-1}(y)}{dy}
\right|
$$

多维变换使用 Jacobian 行列式：

$$
p_Y(y)
=p_X(x)
\left|
\det\frac{\partial x}{\partial y}
\right|
$$

ICA 和现代生成模型都会使用这个密度变换规则。

## 概率建模检查

- 明确随机变量的支持集；
- 区分概率、密度和对数密度；
- 写出条件独立假设；
- 不把“不相关”直接当作“独立”；
- 连乘概率时改用对数；
- 检查协方差是否对称半正定；
- 区分参数估计与预测不确定性；
- 评估概率输出时检查校准，而不只看准确率。

## 联合分布、边缘分布与条件分布

两个离散随机变量的联合分布是：

$$
p(x,y)
$$

对另一个变量求和得到边缘分布：

$$
p(x)
=
\sum_y p(x,y)
$$

条件分布定义为：

$$
p(y\mid x)
=
\frac{p(x,y)}{p(x)}
$$

因此联合分布可以分解为：

$$
p(x,y)
=
p(x)p(y\mid x)
=
p(y)p(x\mid y)
$$

对于连续变量，把求和换成积分。生成式分类器建模 $p(x\mid y)p(y)$，再用 Bayes 公式得到 $p(y\mid x)$。

## 一个 Bayes 诊断例子

某疾病患病率为 $1\%$。检测在患者中的阳性率为 $95\%$，在健康者中的假阳性率为 $5\%$。

关心的是阳性后真正患病的概率：

$$
p(D\mid +)
=
\frac{
p(+\mid D)p(D)
}{
p(+\mid D)p(D)
+
p(+\mid \neg D)p(\neg D)
}
$$

代入：

$$
p(D\mid +)
=
\frac{0.95\times0.01}
{0.95\times0.01+0.05\times0.99}
\approx0.161
$$

检测本身并不差，但由于先验患病率低，大多数阳性仍是假阳性。

这个例子说明不能把 $p(+\mid D)$ 与 $p(D\mid +)$ 混淆，也说明类别基率会强烈影响后验概率。

## 全期望公式

若 $Y$ 是随机变量，$X$ 是条件变量：

$$
\mathbb E[Y]
=
\mathbb E_X
\left[
\mathbb E[Y\mid X]
\right]
$$

可以理解为先在每个 $X$ 分组内求平均，再对各组平均。

全方差公式为：

$$
\operatorname{Var}(Y)
=
\mathbb E_X
\left[
\operatorname{Var}(Y\mid X)
\right]
+
\operatorname{Var}_X
\left(
\mathbb E[Y\mid X]
\right)
$$

总方差等于组内不确定性加组间均值差异。

这两个公式在 EM、Gaussian 混合、强化学习回报分析和误差分解中都会出现。

## 协方差矩阵

对向量随机变量 $X\in\mathbb R^n$，均值为：

$$
\mu=\mathbb E[X]
$$

协方差矩阵为：

$$
\Sigma
=
\mathbb E
\left[
(X-\mu)(X-\mu)^\top
\right]
$$

对角元素是每个变量的方差，非对角元素描述两个变量共同变化的方向。

协方差矩阵必然半正定，因为对任意 $a$：

$$
a^\top\Sigma a
=
\operatorname{Var}(a^\top X)
\ge0
$$

若 $\Sigma$ 奇异，说明至少有一个线性组合没有方差，变量之间存在确定的线性约束。

相关系数是标准化后的协方差：

$$
\rho_{ij}
=
\frac{\Sigma_{ij}}
{\sqrt{\Sigma_{ii}\Sigma_{jj}}}
$$

零协方差一般不代表独立；只有在某些特殊分布族中，例如联合 Gaussian，才可以推出独立。

## 多元 Gaussian 的结构

多元 Gaussian 密度为：

$$
p(x)
=
\frac{1}
{(2\pi)^{n/2}|\Sigma|^{1/2}}
\exp\left(
-\frac12
(x-\mu)^\top
\Sigma^{-1}
(x-\mu)
\right)
$$

指数项中的二次型是 Mahalanobis 距离。协方差大的方向惩罚较小，协方差小的方向惩罚较大。

$|\Sigma|$ 描述分布椭球体积。协方差接近奇异时，体积趋近零，密度计算和矩阵求逆都会不稳定。

实现对数密度时应使用 Cholesky 分解和 `logdet`，不要直接计算行列式和逆矩阵。

## MLE 的两个完整例子

### Bernoulli 参数

设 $y^{(i)}\in\{0,1\}$，$p(y=1)=\phi$。似然：

$$
L(\phi)
=
\prod_{i=1}^{m}
\phi^{y^{(i)}}
(1-\phi)^{1-y^{(i)}}
$$

对数似然求导并令零：

$$
\hat\phi
=
\frac1m\sum_{i=1}^{m}y^{(i)}
$$

即正样本比例。

### Gaussian 均值

设方差已知、样本独立：

$$
x^{(i)}\sim\mathcal N(\mu,\sigma^2)
$$

忽略与 $\mu$ 无关的项：

$$
\ell(\mu)
=
-\frac{1}{2\sigma^2}
\sum_i(x^{(i)}-\mu)^2
$$

令导数为零：

$$
\hat\mu
=
\frac1m\sum_i x^{(i)}
$$

样本均值既是直觉上的中心，也是 Gaussian 均值的最大似然估计。

## MAP 与先验

最大后验估计：

$$
\theta_{\text{MAP}}
=
\arg\max_\theta
p(\theta\mid\mathcal D)
$$

由 Bayes 公式：

$$
p(\theta\mid\mathcal D)
\propto
p(\mathcal D\mid\theta)p(\theta)
$$

取负对数：

$$
\theta_{\text{MAP}}
=
\arg\min_\theta
\left[
-\log p(\mathcal D\mid\theta)
-\log p(\theta)
\right]
$$

若参数先验是零均值 Gaussian，$-\log p(\theta)$ 对应 $L_2$ 正则；若是 Laplace 先验，对应 $L_1$ 正则。

因此正则化既可以看成控制复杂度，也可以看成加入参数先验。

## 数值概率计算

许多小概率相乘会下溢为零，应在对数空间计算：

$$
\log\prod_i p_i
=
\sum_i\log p_i
$$

计算：

$$
\log\sum_j e^{z_j}
$$

时使用 LogSumExp：

$$
\operatorname{LSE}(z)
=
a+\log\sum_j e^{z_j-a},
\qquad
a=\max_j z_j
$$

减去最大值避免指数溢出。这一技巧会在 Softmax、Naive Bayes、GMM 和 HMM 中反复使用。

## 练习与答案思路

### 练习 1：条件独立

若 $X\perp Y\mid Z$，联合条件分布如何分解？

答案：

$$
p(x,y\mid z)=p(x\mid z)p(y\mid z)
$$

### 练习 2：期望线性

$X$ 与 $Y$ 不独立时，是否仍有 $\mathbb E[X+Y]=\mathbb E[X]+\mathbb E[Y]$？

答案：仍然成立。期望的线性不要求独立；方差相加才需要协方差为零。

### 练习 3：方差缩放

若 $Z=aX+b$，写出期望与方差。

答案：

$$
\mathbb E[Z]=a\mathbb E[X]+b,
\qquad
\operatorname{Var}(Z)=a^2\operatorname{Var}(X)
$$

### 练习 4：MLE 与 MAP

数据很少时，为什么 MAP 往往比 MLE 稳定？

答案思路：先验提供额外约束，防止参数被少量偶然样本推到极端值；数据增加后似然逐渐主导。

## 条件 Gaussian

将联合 Gaussian 分块：

$$
\begin{bmatrix}
x_A\\x_B
\end{bmatrix}
\sim
\mathcal N
\left(
\begin{bmatrix}
\mu_A\\\mu_B
\end{bmatrix},
\begin{bmatrix}
\Sigma_{AA}&\Sigma_{AB}\\
\Sigma_{BA}&\Sigma_{BB}
\end{bmatrix}
\right)
$$

条件分布：

$$
x_A\mid x_B
\sim
\mathcal N(\mu_{A\mid B},\Sigma_{A\mid B})
$$

条件均值：

$$
\mu_{A\mid B}
=
\mu_A
+
\Sigma_{AB}
\Sigma_{BB}^{-1}
(x_B-\mu_B)
$$

条件协方差：

$$
\Sigma_{A\mid B}
=
\Sigma_{AA}
-
\Sigma_{AB}
\Sigma_{BB}^{-1}
\Sigma_{BA}
$$

观察 $x_B$ 后，$x_A$ 的均值按相关关系调整，不确定性通常下降。

这个公式会在 Factor Analysis 的隐因子后验、Gaussian Process 和 Kalman Filter 中反复出现。

## Gaussian 的线性变换

若：

$$
x\sim\mathcal N(\mu,\Sigma)
$$

且：

$$
y=Ax+b
$$

则：

$$
y
\sim
\mathcal N
\left(
A\mu+b,
A\Sigma A^\top
\right)
$$

均值通过线性函数变换，协方差左右分别乘 $A$ 与 $A^\top$。

若再加独立 Gaussian 噪声：

$$
\epsilon\sim\mathcal N(0,Q)
$$

则：

$$
y=Ax+b+\epsilon
$$

有：

$$
\operatorname{Cov}(y)
=
A\Sigma A^\top+Q
$$

这正是 Kalman Filter 预测协方差公式。

## 协方差与独立

若 $X,Y$ 独立：

$$
\mathbb E[XY]
=
\mathbb E[X]\mathbb E[Y]
$$

所以：

$$
\operatorname{Cov}(X,Y)=0
$$

反方向一般不成立。

例如令 $X$ 关于零对称，$Y=X^2$。则：

$$
\operatorname{Cov}(X,Y)
=
\mathbb E[X^3]
-
\mathbb E[X]\mathbb E[X^2]
=0
$$

但 $Y$ 完全由 $X$ 决定，显然不独立。

联合 Gaussian 是重要例外：零协方差能够推出独立。

## 变量变换与 Jacobian

若一维单调变换：

$$
y=g(x)
$$

则：

$$
p_Y(y)
=
p_X(g^{-1}(y))
\left|
\frac{d}{dy}g^{-1}(y)
\right|
$$

多维可逆变换 $y=g(x)$：

$$
p_Y(y)
=
p_X(g^{-1}(y))
\left|
\det
\frac{\partial g^{-1}(y)}
{\partial y}
\right|
$$

Jacobian 行列式补偿空间体积的拉伸或压缩。

ICA 的似然中出现 $|\det W|$，Normalizing Flow 也建立在同一公式上。

## Beta-Bernoulli 共轭更新

对 Bernoulli 参数 $\phi$ 使用 Beta 先验：

$$
\phi
\sim
\operatorname{Beta}(\alpha,\beta)
$$

观察 $s$ 次成功、$f$ 次失败后，后验：

$$
\phi\mid\mathcal D
\sim
\operatorname{Beta}
(\alpha+s,\beta+f)
$$

先验参数可以理解为伪计数。

后验均值：

$$
\mathbb E[\phi\mid\mathcal D]
=
\frac{\alpha+s}
{\alpha+\beta+s+f}
$$

数据少时受先验影响大，数据多时由观察比例主导。

这为拉普拉斯平滑提供概率解释。

## 期望、概率与采样估计

若：

$$
X_1,\ldots,X_N
\overset{iid}{\sim}p(x)
$$

则 Monte Carlo 估计：

$$
\mathbb E_p[f(X)]
\approx
\frac1N
\sum_{i=1}^{N}
f(X_i)
$$

大数定律保证样本均值收敛到期望。

中心极限定理说明在适当条件下：

$$
\sqrt N
\left(
\bar f-\mathbb E[f]
\right)
$$

近似 Gaussian，标准误随 $1/\sqrt N$ 下降。

要把 Monte Carlo 误差减半，通常需要约四倍独立样本。

强化学习 rollout、模拟积分和 Bootstrap 都依赖采样估计思想。

## 概率模型调试

检查分布是否归一化：

$$
\sum_y p(y)=1
$$

或：

$$
\int p(x)\,dx=1
$$

检查参数范围，例如概率在 $[0,1]$、方差为正、协方差半正定。

在合成数据上验证 MLE 是否能随样本增加恢复真实参数。

对数空间实现与直接实现应在小数值范围内一致。

检查采样统计量是否接近理论均值和方差。

## 补充练习

### 练习 5：线性 Gaussian

若 $x\sim\mathcal N(0,I)$，$y=Ax$，$y$ 的协方差是什么？

答案：

$$
AA^\top
$$

### 练习 6：共轭更新

先验 $\operatorname{Beta}(2,2)$，观察 8 次成功、2 次失败，后验是什么？

答案：

$$
\operatorname{Beta}(10,4)
$$

### 练习 7：Monte Carlo

希望标准误缩小到原来的三分之一，样本量约需多少倍？

答案：九倍，因为标准误与 $1/\sqrt N$ 成正比。

## 本节检查

- 能从条件概率推出 Bayes 公式；
- 能用全概率公式消去隐变量；
- 能区分独立与条件独立；
- 能计算期望、方差与协方差；
- 能写出 Bernoulli 和 Gaussian 的基本形式；
- 能区分 MLE 与 MAP；
- 能解释为什么使用对数似然；
- 能写出一维变量变换的 Jacobian 修正。

下一节进入 [P7：GDA 与 Naive Bayes](/notes/cs229/course/p07-gda-naive-bayes)。

## 来源说明

- 视频：[B 站 P6：Probability Section](https://www.bilibili.com/video/BV1fP4y127nn/?p=6)
- Notes：[Probability Review，共 12 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/section/cs229-prob.pdf)
- Slides：[Probability Review，共 66 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/section/cs229-prob-slide.pdf)

中文内容按照讨论课所需的概率工具重新组织。
