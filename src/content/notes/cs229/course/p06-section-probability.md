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
