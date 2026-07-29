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

![EM 在辅助后验与模型参数两个坐标上交替提高 ELBO](/images/notes/cs229/tikz/p20-em-elbo-coordinate-ascent.png)

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

![因子分析通过低秩载荷和对角噪声构造观测协方差](/images/notes/cs229/tikz/p20-factor-analysis-covariance.png)

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

## 不完整数据似然为什么难优化

设观测变量为 $x$，隐变量为 $z$。完整数据联合分布：

$$
p(x,z;\theta)
$$

但实际只观察 $x$，观测似然为：

$$
p(x;\theta)
=
\sum_z
p(x,z;\theta)
$$

或连续隐变量时：

$$
p(x;\theta)
=
\int
p(x,z;\theta)\,dz
$$

对数似然包含“对求和取对数”：

$$
\ell(\theta)
=
\sum_i
\log
\sum_z
p(x^{(i)},z;\theta)
$$

`log-sum` 让参数耦合，通常不能像完整数据那样直接分组求 MLE。

EM 引入当前参数下的隐变量分布，把困难的观测似然转为交替优化下界。

## Jensen 下界完整构造

对任意分布 $Q_i(z)$：

$$
\log p(x^{(i)};\theta)
=
\log
\sum_z
Q_i(z)
\frac{
p(x^{(i)},z;\theta)
}{
Q_i(z)
}
$$

由于 $\log$ 是凹函数，Jensen 不等式：

$$
\log
\mathbb E_Q[f(z)]
\ge
\mathbb E_Q[\log f(z)]
$$

所以：

$$
\log p(x^{(i)};\theta)
\ge
\sum_z
Q_i(z)
\log
\frac{
p(x^{(i)},z;\theta)
}{
Q_i(z)
}
$$

对所有样本求和得到 ELBO：

$$
\mathcal L(Q,\theta)
=
\sum_i
\mathbb E_{Q_i}
\left[
\log p(x^{(i)},z;\theta)
\right]
+
\sum_iH(Q_i)
$$

其中 $H(Q_i)$ 是熵。

## ELBO 与 KL 分解

观测对数似然可以精确分解：

$$
\log p(x;\theta)
=
\mathcal L(Q,\theta)
+
\operatorname{KL}
\left(
Q(z)\|
p(z\mid x;\theta)
\right)
$$

KL 散度非负，因此 ELBO 是下界。

E 步令：

$$
Q_i(z)
=
p(z\mid x^{(i)};\theta^{old})
$$

此时 KL 为零，下界在旧参数处贴紧真实似然。

M 步固定 $Q$，最大化：

$$
\theta^{new}
=
\arg\max_\theta
\sum_i
\mathbb E_{Q_i}
\left[
\log p(x^{(i)},z;\theta)
\right]
$$

熵项与 $\theta$ 无关，所以只需最大化期望完整数据 log-likelihood。

## EM 单调性链条

E 步后：

$$
\ell(\theta^{old})
=
\mathcal L(Q,\theta^{old})
$$

M 步保证：

$$
\mathcal L(Q,\theta^{new})
\ge
\mathcal L(Q,\theta^{old})
$$

同时：

$$
\ell(\theta^{new})
\ge
\mathcal L(Q,\theta^{new})
$$

串起来：

$$
\ell(\theta^{new})
\ge
\ell(\theta^{old})
$$

所以 EM 不降低观测似然。

但单调不等于全局最优。不同初始化可能收敛到不同局部最优或鞍点。

## Factor Analysis 的生成过程

对高维观测 $x\in\mathbb R^n$，使用低维隐因子 $z\in\mathbb R^k$：

$$
z\sim\mathcal N(0,I)
$$

$$
x
=
\mu+\Lambda z+\epsilon
$$

其中：

$$
\epsilon
\sim
\mathcal N(0,\Psi)
$$

$\Lambda\in\mathbb R^{n\times k}$ 是载荷矩阵，$\Psi$ 通常为对角矩阵。

边缘分布：

$$
x
\sim
\mathcal N
\left(
\mu,
\Lambda\Lambda^\top+\Psi
\right)
$$

完整协方差需要 $O(n^2)$ 参数，而 Factor Analysis 只需 $O(nk+n)$，适合用少量公共因子解释变量相关性。

## 隐因子的后验

因为 $(z,x)$ 联合 Gaussian，条件分布仍是 Gaussian。

定义：

$$
M
=
I+\Lambda^\top\Psi^{-1}\Lambda
$$

则：

$$
\mathbb E[z\mid x]
=
M^{-1}
\Lambda^\top
\Psi^{-1}
(x-\mu)
$$

条件协方差：

$$
\operatorname{Cov}(z\mid x)
=
M^{-1}
$$

E 步需要：

$$
\mathbb E[z^{(i)}\mid x^{(i)}]
$$

以及：

$$
\mathbb E[z^{(i)}(z^{(i)})^\top\mid x^{(i)}]
=
M^{-1}
+
\mathbb E[z\mid x]
\mathbb E[z\mid x]^\top
$$

这些期望替代不可见的真实因子，进入 M 步参数更新。

## Factor Analysis 的 M 步直觉

固定隐因子后，模型类似多输出线性回归：

$$
x^{(i)}-\mu
\approx
\Lambda z^{(i)}
$$

M 步用 E 步得到的 $z$ 一阶与二阶矩更新 $\Lambda$。

$\Psi$ 使用每个观测维度无法被公共因子解释的剩余方差更新，并保持对角结构。

$\mu$ 通常是样本均值或相应期望更新。

实现中应避免显式矩阵求逆，使用 Cholesky 或线性方程求解，并监控 $\Psi$ 的对角元素不能趋近零。

## 可辨识性与旋转

对任意正交矩阵 $R$：

$$
\Lambda z
=
(\Lambda R)(R^\top z)
$$

由于标准 Gaussian 在正交旋转后分布不变，$\Lambda$ 的旋转通常不可辨识。

因此单个因子的方向和符号不是天然唯一。解释因子时常使用旋转准则，或结合领域约束。

模型能稳定解释协方差结构，不代表每一列载荷都有唯一因果含义。

## Factor Analysis、PCA 与 PPCA

PCA 寻找最大方差的正交投影方向，主要是几何与重建方法。

Factor Analysis 是概率生成模型，显式区分公共因子和各维独立噪声 $\Psi$。

Probabilistic PCA 是特殊情况：

$$
\Psi=\sigma^2I
$$

即各方向噪声相同。

Factor Analysis 允许每个观测维度有不同独立噪声，更适合“不同测量变量可靠性不同”的场景。

## EM 的工程检查

每轮记录观测 log-likelihood。若下降，优先检查 E 步归一化、期望统计量和 M 步公式。

使用多个随机初始化，比较最终似然和下游表现。

设置协方差或噪声方差下限，防止退化。

不要仅因参数变化小就认为模型正确。还应检查重建、后验因子、残差协方差和验证似然。

## 练习与答案思路

### 练习 1：E 步

E 步优化的变量是模型参数还是隐变量后验分布？

答案：固定模型参数，令辅助分布等于当前后验，使 ELBO 贴紧似然。

### 练习 2：M 步

M 步为什么可以忽略 $Q$ 的熵？

答案：固定 $Q$ 后，熵与模型参数 $\theta$ 无关。

### 练习 3：局部最优

EM 似然单调增加是否保证找到全局最大值？

答案：不保证，只保证不下降；初始化仍然重要。

### 练习 4：PCA 比较

Factor Analysis 比 PCA 多建模了什么？

答案：显式生成分布、隐因子后验和每个观测维度的独立噪声。

## Generalized EM

标准 M 步寻找 ELBO 对 $\theta$ 的全局最大：

$$
\theta^{new}
=
\arg\max_\theta
\mathcal L(Q,\theta)
$$

有些模型 M 步也没有闭式解。

Generalized EM 只要求找到使 ELBO 增加的参数：

$$
\mathcal L(Q,\theta^{new})
\ge
\mathcal L(Q,\theta^{old})
$$

例如在 M 步做若干次梯度上升。

只要每轮确实改善下界，观测似然仍保持非下降链条。

实现要记录内层优化是否充分和 ELBO 是否提高。

## Variational EM

复杂模型中真实后验：

$$
p(z\mid x;\theta)
$$

不可计算。

选择可处理分布族 $\mathcal Q$，E 步求：

$$
Q^\star
=
\arg\min_{Q\in\mathcal Q}
\operatorname{KL}
\left(
Q(z)\|
p(z\mid x;\theta)
\right)
$$

等价于最大化 ELBO。

由于 $\mathcal Q$ 受限，KL 通常不能降到零，ELBO 与真实 log-likelihood 之间留有 approximation gap。

Mean-field 假设：

$$
Q(z)
=
\prod_jQ_j(z_j)
$$

简化计算，但可能低估变量后验相关性。

VAE 可以看作使用神经网络 amortize 变分后验的一种现代扩展。

## EM 与 Coordinate Ascent

EM 在两个变量块间交替：

```text
Q：隐变量分布
θ：模型参数
```

E 步优化 $Q$，M 步优化 $\theta$。

它与 Coordinate Ascent 类似，但目标是 ELBO。

这个视角帮助理解：

- 为什么每步不下降；
- 为什么可能停在局部最优；
- 为什么初始化重要；
- 为什么收敛速度可能慢；
- 为什么可做 partial update。

## EM 收敛判断

常用相对变化：

$$
\frac{
\ell_t-\ell_{t-1}
}{
|\ell_{t-1}|+\epsilon
}
<\tau
$$

不能只看参数逐元素变化，因为隐变量模型存在排列、旋转和尺度不可辨识。

还要设置最大迭代数，并检查：

- log-likelihood 是否有限；
- 是否真的单调；
- 成分或噪声是否退化；
- 梯度或 M 步方程残差；
- 多初始化结果。

似然变化小也可能是 EM 在平台区域缓慢移动。

## Missing at Random 的边界

缺失数据建模要区分：

MCAR：缺失与观测和未观测值都无关。

MAR：给定已观察变量后，缺失与未观察值无关。

MNAR：缺失仍依赖未观察值。

普通 EM 对缺失值积分并不自动解决 MNAR。若高收入者更不愿报告收入，缺失机制本身需要建模或敏感性分析。

“EM 能处理缺失”必须连同缺失机制假设说明。

## 选择因子数量

因子数 $k$ 增大，模型能解释更多协方差，但参数与过拟合风险增加。

可使用：

- 验证 log-likelihood；
- AIC/BIC；
- 残差协方差；
- 下游任务；
- 因子稳定性；
- 领域可解释性。

只看重建误差会偏好更大 $k$。

由于旋转不可辨识，比较两次因子载荷应对齐子空间，而不是逐列直接比较。

## Woodbury Identity 的计算价值

Factor Analysis 协方差：

$$
C=\Lambda\Lambda^\top+\Psi
$$

当 $n$ 大、$k\ll n$ 时，直接求 $n\times n$ 逆昂贵。

Woodbury Identity：

$$
C^{-1}
=
\Psi^{-1}
-
\Psi^{-1}\Lambda
\left(
I+\Lambda^\top\Psi^{-1}\Lambda
\right)^{-1}
\Lambda^\top\Psi^{-1}
$$

核心求逆降到 $k\times k$。

Matrix Determinant Lemma 也可高效计算 log determinant。

这展示了利用低秩结构降低计算的重要性。

## 因子分析项目

在高维连续数据上：

1. 标准化或合理中心化；
2. PCA 基线；
3. Factor Analysis 多个 $k$；
4. 验证 likelihood；
5. 残差协方差；
6. 后验因子；
7. 多初始化稳定性；
8. 因子旋转；
9. 缺失数据实验；
10. 下游预测。

报告哪些相关结构由公共因子解释，哪些留在独立噪声中。

## 补充练习

### 练习 5：Generalized EM

M 步只做一次能提高 ELBO 的梯度更新，是否仍可称为有效 EM 变体？

答案：可以，是 Generalized EM，只要确保下界不下降。

### 练习 6：Variational Gap

受限 $Q$ 无法等于真实后验时，ELBO 与 log-likelihood 是否相等？

答案：不相等，差值是非零 KL。

### 练习 7：旋转

两次训练载荷列不同，是否证明模型不稳定？

答案：不一定，应先考虑正交旋转与符号/排列不可辨识。

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
