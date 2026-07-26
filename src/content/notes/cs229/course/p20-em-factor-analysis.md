---
title: P20：EM 算法与因子分析
description: 对应 B 站 P20 与 CS229 Lecture 15，用 Jensen 不等式解释 EM 下界、单调性，再用低维隐因子建模高维协方差。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## EM 的一般问题

含隐变量 $z$ 的观测似然：

$$
\ell(\theta)
=\sum_i
\log\sum_z
p(x^{(i)},z;\theta)
$$

若 $z$ 可见，完整数据对数似然：

$$
\sum_i\log p(x^{(i)},z^{(i)};\theta)
$$

通常更容易优化。EM 在“推断隐变量分布”和“更新参数”之间交替。

## Jensen 不等式

对凹函数 $f$：

$$
f(E[X])\ge E[f(X)]
$$

$\log$ 是凹函数。引入任意分布 $Q_i(z)$：

$$
\log\sum_zp(x_i,z;\theta)
=
\log\sum_z
Q_i(z)
\frac{p(x_i,z;\theta)}{Q_i(z)}
$$

应用 Jensen：

$$
\ge
\sum_zQ_i(z)
\log
\frac{p(x_i,z;\theta)}{Q_i(z)}
$$

得到似然下界。

## ELBO 与 KL 分解

定义：

$$
\mathcal L_i(\theta,Q_i)
=
\sum_zQ_i(z)
\log
\frac{p(x_i,z;\theta)}{Q_i(z)}
$$

则：

$$
\log p(x_i;\theta)
=
\mathcal L_i(\theta,Q_i)
+
D_{\mathrm{KL}}
\left(
Q_i(z)
\|
p(z\mid x_i;\theta)
\right)
$$

KL 非负，因此 $\mathcal L$ 是下界。

当：

$$
Q_i(z)
=p(z\mid x_i;\theta)
$$

KL 为零，下界与当前对数似然贴紧。

## E 步与 M 步

E 步：

$$
Q_i^{(t)}(z)
=p(z\mid x_i;\theta^{(t)})
$$

M 步：

$$
\theta^{(t+1)}
=\arg\max_\theta
\sum_i
E_{z\sim Q_i^{(t)}}
\left[
\log p(x_i,z;\theta)
\right]
$$

E 步是后验推断，M 步是完整数据对数似然的后验期望优化。

## 单调改进

E 步让下界在 $\theta^{(t)}$ 处贴紧；M 步提高下界：

$$
\ell(\theta^{(t+1)})
\ge
\mathcal L(\theta^{(t+1)},Q^{(t)})
\ge
\mathcal L(\theta^{(t)},Q^{(t)})
=
\ell(\theta^{(t)})
$$

因此似然单调不下降。

单调不下降不保证全局最优。EM 仍可能落入局部最优、鞍点或平坦区域。

## 为什么需要 Factor Analysis

高维高斯协方差矩阵有：

$$
\frac{n(n+1)}{2}
$$

个自由参数。

当样本数不大、维度很高时，完整协方差估计不稳定甚至奇异。

Factor Analysis 假设高维相关结构由少量低维隐因子产生。

## 因子分析生成模型

隐变量：

$$
z\sim\mathcal N(0,I_k)
$$

观测：

$$
x=\mu+\Lambda z+\epsilon
$$

噪声：

$$
\epsilon\sim\mathcal N(0,\Psi)
$$

$k\ll n$，$\Psi$ 通常为对角矩阵。

## 边缘分布

因为高斯变量的线性组合仍为高斯：

$$
x\sim
\mathcal N
\left(
\mu,
\Lambda\Lambda^\top+\Psi
\right)
$$

因此模型协方差：

$$
\Sigma
=\Lambda\Lambda^\top+\Psi
$$

$\Lambda\Lambda^\top$ 捕捉低秩共享变化，$\Psi$ 捕捉每个观测维度的独立噪声。

## 高斯条件分布

E 步需要：

$$
p(z\mid x)
$$

联合高斯条件分布仍为高斯。可用分块协方差公式计算后验均值和协方差。

后验均值是输入的线性函数，表示给定观测后对低维因子的最佳高斯估计。

## Factor Analysis 的 EM

E 步计算：

$$
E[z^{(i)}\mid x^{(i)}]
$$

以及：

$$
E[z^{(i)}(z^{(i)})^\top\mid x^{(i)}]
$$

M 步把这些后验矩作为软完整数据统计量，更新 $\mu$、$\Lambda$ 与 $\Psi$。

不能只用后验均值替代 $z$，因为二阶矩还包含后验不确定性。

## 可辨识性

对任意正交矩阵 $R$：

$$
\Lambda z
=\Lambda R^\top Rz
$$

由于标准高斯在正交旋转下分布不变，$\Lambda$ 的旋转通常不可辨识。

所以因子方向未必具有唯一语义。解释单个因子时需要额外旋转约束、领域知识或稳定性分析。

## Factor Analysis 与 PCA

Factor Analysis 是概率生成模型，显式区分共享因子和维度噪声。

PCA 是几何投影方法，寻找最大方差正交方向，通常不显式建模每维噪声。

两者都使用低维结构，但目标、假设与参数估计不同。

## 本节检查

- 能指出隐变量似然中的 log-sum 难点；
- 能用 Jensen 构造似然下界；
- 能用 KL 分解解释 E 步；
- 能证明 EM 似然单调不下降；
- 能说明单调性不保证全局最优；
- 能写出 Factor Analysis 生成模型；
- 能推出边缘协方差 $\Lambda\Lambda^\top+\Psi$；
- 能解释 E 步为何需要一阶和二阶后验矩。

下一节进入 [P21：PCA](/notes/cs229/course/p21-pca)。

## 来源说明

- 视频：[B 站 P20：Lecture 15](https://www.bilibili.com/video/BV1fP4y127nn/?p=20)
- EM：[Lecture Notes 8](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes8.pdf)
- Factor Analysis：[Lecture Notes 9](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes9.pdf)
- 作业：[Problem Set 3](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS3/ps3.pdf)

中文内容对应本节 EM 理论与 Factor Analysis 的连续讲解。
