---
title: P12：近似误差、估计误差与经验风险最小化
description: 对应 B 站 P12 与 CS229 Lecture 9，用 ERM、Hoeffding 不等式、Union Bound 和 VC 维解释训练误差怎样推广。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 真风险与经验风险

对假设 $h$，真风险：

$$
\varepsilon(h)
=P_{(x,y)\sim P_{\text{data}}}
\left(
h(x)\ne y
\right)
$$

训练集上的经验风险：

$$
\hat\varepsilon(h)
=\frac1m
\sum_{i=1}^{m}
\mathbf1
\left\{
h(x^{(i)})\ne y^{(i)}
\right\}
$$

经验风险可计算，真风险未知。学习理论研究两者在什么条件下接近。

## 经验风险最小化

给定假设类 $\mathcal H$：

$$
\hat h
=\arg\min_{h\in\mathcal H}
\hat\varepsilon(h)
$$

这称为 ERM。

仅说“选择训练误差最低模型”并不保证泛化。若 $\mathcal H$ 过于丰富，它可能记住全部训练样本。

## 近似误差

假设类内部最优模型：

$$
h^*
=\arg\min_{h\in\mathcal H}
\varepsilon(h)
$$

若 Bayes 最优决策不在 $\mathcal H$ 内，即使无限数据，也存在无法消除的差距。这部分称为近似误差。

线性分类器处理弯曲边界时，近似误差可能很大。

## 估计误差

有限样本使 ERM 选择的 $\hat h$ 可能不同于类内真最优 $h^*$：

$$
\varepsilon(\hat h)-\varepsilon(h^*)
$$

这是估计误差。

扩大假设类通常降低近似误差，却增加估计难度；这正是偏差—方差权衡的理论版本。

## 固定假设的集中界

对固定 $h$，每个错误指示变量都在 $[0,1]$。Hoeffding 不等式给出：

$$
P\left(
|\hat\varepsilon(h)-\varepsilon(h)|>\gamma
\right)
\le2e^{-2\gamma^2m}
$$

样本量增大时，经验风险偏离真风险的概率指数下降。

但 $h$ 必须在看数据之前固定。训练后选出的 $\hat h$ 依赖数据，不能直接套固定假设结论。

## 有限假设类与 Union Bound

![有限假设类中经验风险、真风险与统一收敛界的归约过程](/images/notes/cs229/tikz/p12-erm-generalization-bound.png)

若：

$$
|\mathcal H|=K
$$

对每个 $h$ 使用 Hoeffding，再用并集界：

$$
P\left(
\exists h\in\mathcal H:
|\hat\varepsilon(h)-\varepsilon(h)|>\gamma
\right)
\le2K e^{-2\gamma^2m}
$$

令右侧不超过 $\delta$，得到：

$$
m
\ge
\frac{1}{2\gamma^2}
\log\frac{2K}{\delta}
$$

即可使所有假设的经验风险同时接近真风险，概率至少为 $1-\delta$。

## 一致收敛

一致收敛要求：

$$
\sup_{h\in\mathcal H}
|\hat\varepsilon(h)-\varepsilon(h)|
\le\gamma
$$

一旦这个事件成立：

$$
\varepsilon(\hat h)
\le\hat\varepsilon(\hat h)+\gamma
$$

ERM 性质给出：

$$
\hat\varepsilon(\hat h)
\le\hat\varepsilon(h^*)
$$

再应用一致收敛：

$$
\hat\varepsilon(h^*)
\le\varepsilon(h^*)+\gamma
$$

所以：

$$
\varepsilon(\hat h)
\le\varepsilon(h^*)+2\gamma
$$

## 无限假设类

线性分类器参数连续，$\mathcal H$ 是无限集合，不能直接把 $|\mathcal H|$ 代入有限假设界。

重要的不是参数取值有无穷多个，而是假设类能在有限样本上实现多少种不同标记模式。

这引出增长函数与 VC 维。

## Shattering

如果假设类能对某组 $d$ 个点实现全部：

$$
2^d
$$

种二元标记，则称该点集被 $\mathcal H$ 打散。

这衡量假设类在有限样本上的组合表达能力。

## VC 维

![VC 维要求同一假设类实现一组点的全部二进制标记](/images/notes/cs229/tikz/concept-vc-shattering.png)

VC 维是能被假设类打散的最大点数：

$$
d_{\mathrm{VC}}(\mathcal H)
$$

一维阈值分类器 VC 维为 $1$；二维线性分类器的 VC 维为 $3$；一般 $n$ 维带截距线性分类器 VC 维约为 $n+1$。

VC 维不是参数数目的机械同义词，但对许多常见模型与有效自由度有关。

## 样本复杂度

非正式地，PAC 风格样本复杂度随以下量增加：

$$
m
=O\left(
\frac{
d_{\mathrm{VC}}\log(1/\gamma)
+\log(1/\delta)
}{
\gamma^2
}
\right)
$$

$\gamma$ 是允许误差尺度，$\delta$ 是失败概率。

这类界往往较保守，但定性说明：假设类越复杂，要稳定泛化通常需要越多数据。

## 结构风险最小化

考虑嵌套假设类：

$$
\mathcal H_1
\subset
\mathcal H_2
\subset
\cdots
$$

选择模型时同时考虑经验风险与复杂度惩罚：

$$
\hat\varepsilon(h)
+\operatorname{complexity}(\mathcal H)
$$

正则化、模型选择和早停都可以从这个角度理解。

## 理论界与实际诊断

理论界不会直接告诉你某个具体网络的测试准确率，但能阻止几种错误推理：

- 训练误差低不等于真风险低；
- 搜索过更多模型后，验证集也会被过拟合；
- 更大模型需要更多数据或更强结构约束；
- 数据分布变化会破坏 i.i.d. 假设；
- 标签噪声和选择偏差不会因样本量自动消失。

## Hoeffding 不等式怎样进入泛化分析

固定一个假设 $h$。定义单样本 0–1 损失：

$$
Z_i
=
\mathbf1
\left\{
h(x^{(i)})\ne y^{(i)}
\right\}
$$

$Z_i\in[0,1]$，其期望是真风险：

$$
\mathbb E[Z_i]=R(h)
$$

经验风险是样本均值：

$$
\hat R(h)
=
\frac1m\sum_{i=1}^{m}Z_i
$$

Hoeffding 不等式给出：

$$
P
\left(
\left|
\hat R(h)-R(h)
\right|
>\epsilon
\right)
\le
2\exp(-2m\epsilon^2)
$$

样本数 $m$ 增加时，经验误差偏离真实误差的概率指数下降。

但这个结论只针对训练数据确定前就固定的 $h$。学习算法会根据同一训练集从假设类中选择模型，因此还要同时控制整个假设类。

## 有限假设类与 Union Bound

若假设类 $\mathcal H$ 有 $N$ 个元素，对每个假设的坏事件使用并集界：

$$
P
\left(
\exists h\in\mathcal H:
\left|
\hat R(h)-R(h)
\right|
>\epsilon
\right)
\le
2N\exp(-2m\epsilon^2)
$$

令右侧不超过 $\delta$：

$$
2N\exp(-2m\epsilon^2)\le\delta
$$

解得：

$$
m
\ge
\frac{
\log(2N/\delta)
}{
2\epsilon^2
}
$$

复杂度只通过 $\log N$ 进入，但要求与误差精度的平方成反比。

一致收敛意味着以至少 $1-\delta$ 的概率，所有假设的经验风险都接近真实风险。这样用经验风险选择模型才有理论保证。

## ERM 的泛化误差分解

![模型超额风险中的近似误差与估计误差分解](/images/notes/cs229/tikz/p12-generalization-error-decomposition.png)

设：

$$
\hat h
=
\arg\min_{h\in\mathcal H}
\hat R(h)
$$

以及假设类中的最优模型：

$$
h^\star
=
\arg\min_{h\in\mathcal H}
R(h)
$$

若对所有 $h$ 都有：

$$
|\hat R(h)-R(h)|\le\epsilon
$$

则：

$$
R(\hat h)
\le
\hat R(\hat h)+\epsilon
\le
\hat R(h^\star)+\epsilon
\le
R(h^\star)+2\epsilon
$$

第二个不等式来自 $\hat h$ 最小化经验风险。

这说明 ERM 学到的模型，其真实风险最多比假设类中最好模型多 $2\epsilon$。

总体误差还包括假设类本身的近似误差：

$$
R(\hat h)-R_{\text{Bayes}}
=
\underbrace{
R(h^\star)-R_{\text{Bayes}}
}_{\text{近似误差}}
+
\underbrace{
R(\hat h)-R(h^\star)
}_{\text{估计误差}}
$$

扩大模型类可能降低近似误差，却提高估计难度。

## Shattering 与 VC 维例子

一维阈值分类器：

$$
h_\theta(x)=\mathbf1\{x\ge\theta\}
$$

可以打散一个点，但不能打散两个点的所有标记。例如左点为正、右点为负无法由单个递增阈值表示，因此 VC 维为 $1$。

一维区间分类器把区间内标为正，可以打散两个点，但不能打散三个点的正—负—正标记，因此 VC 维为 $2$。

二维线性分类器可以打散一般位置的三个点，但不能打散任意四点，因此 VC 维为 $3$。

更一般地，$\mathbb R^n$ 中带截距的线性分类器 VC 维为 $n+1$。

VC 维衡量模型类能实现多少种标记模式，而不是参数个数的简单同义词。某些模型参数很多但受到结构约束，二者可能不同。

## 增长函数与 Sauer 引理的作用

增长函数 $\Pi_\mathcal H(m)$ 表示假设类在任意 $m$ 个点上最多能产生多少种不同标记。

若 VC 维为 $d$，当 $m>d$ 时，Sauer 引理给出多项式上界：

$$
\Pi_\mathcal H(m)
\le
\sum_{i=0}^{d}
{m\choose i}
\le
\left(\frac{em}{d}\right)^d
$$

即使 $\mathcal H$ 是无限集合，它在有限样本上能实现的有效标记数量仍可由 $d$ 控制。

把 $|\mathcal H|$ 替换为增长函数，就能把有限假设类的一致收敛思路推广到无限假设类。

## 结构风险最小化

设有嵌套假设类：

$$
\mathcal H_1
\subset
\mathcal H_2
\subset
\cdots
$$

更大的类经验误差通常更低，但复杂度罚项更大。

结构风险最小化选择：

$$
\hat h
=
\arg\min_{h\in\mathcal H_k}
\left[
\hat R(h)
+
\operatorname{complexity}(k,m,\delta)
\right]
$$

这与正则化、AIC/BIC、模型选择和现代容量控制具有共同直觉：不能只看训练拟合，还要为选择空间付出复杂度代价。

## 理论界为什么常常很松

泛化界通常追求对最坏情况成立，因此可能远大于实际测试误差。

界很松不代表理论无用。它揭示：

- 样本量增加能改善估计；
- 选择空间越大，越容易过拟合；
- 用同一数据尝试更多模型需要付出选择代价；
- 训练误差低不足以证明泛化。

实际系统仍应使用独立验证、学习曲线、正则化和误差分析。理论界提供方向，不替代实验。

## 数据依赖与分布变化

经典结果通常假设样本独立同分布。时间序列、推荐反馈、强化学习轨迹和社交网络数据往往违反这一条件。

训练分布与部署分布变化时，即使训练集内的一致收敛成立，也不能保证新分布风险。

因此理论保证的适用条件必须与数据生成过程一起说明。没有验证前提，就不能机械引用结论。

## 练习与答案思路

### 练习 1：样本复杂度方向

希望误差容忍度 $\epsilon$ 减半，Hoeffding 型样本上界大约增加多少倍？

答案：因为依赖 $1/\epsilon^2$，大约增加四倍。

### 练习 2：扩大假设类

扩大 $\mathcal H$ 对近似误差和估计误差通常有什么影响？

答案思路：近似误差可能下降，估计误差和过拟合风险通常上升。

### 练习 3：VC 维

二维轴对齐矩形分类器至少能打散多少个一般位置的点？

答案思路：其 VC 维为 $4$。四个方向的边界可以独立包围适当布置的四点。

### 练习 4：前提检查

用随机划分估计股票未来收益是否满足经典 i.i.d. 假设？

答案：通常不满足。时间依赖和分布变化要求时间顺序评估及更合适的依赖数据分析。

## PAC 学习的两种保证

Probably Approximately Correct 的语言：

```text
以至少 1-δ 的概率，
学到的假设真实误差不超过 ε。
```

$\epsilon$ 控制“approximately”，$\delta$ 控制“probably”。

Realizable 情形假设真实标记规则在 $\mathcal H$ 中，存在零风险假设。

Agnostic 情形不作这一假设，只要求学到的模型接近假设类中最好模型：

$$
R(\hat h)
\le
\inf_{h\in\mathcal H}R(h)
+
\epsilon
$$

现实数据通常更接近 agnostic 情形，因为标签噪声和模型错设普遍存在。

## 一致收敛不是唯一分析路径

一致收敛要求同时控制所有 $h\in\mathcal H$，可能较保守。

算法稳定性分析研究删除或替换一个训练样本后，学到的模型变化多大。

强正则化算法通常更稳定，稳定性可直接导出泛化界。

Compression Bound 研究模型是否能由少量训练样本或信息重建。

Margin Bound 对分类器不仅看是否正确，还看间隔大小。

不同分析工具捕获不同归纳偏置，不能把 VC 维当作所有现代泛化现象的唯一解释。

## Rademacher Complexity

给定样本 $S=\{x_1,\ldots,x_m\}$，经验 Rademacher Complexity：

$$
\hat{\mathfrak R}_S(\mathcal H)
=
\mathbb E_\sigma
\left[
\sup_{h\in\mathcal H}
\frac1m
\sum_{i=1}^{m}
\sigma_i h(x_i)
\right]
$$

其中 $\sigma_i\in\{-1,+1\}$ 是随机符号。

它衡量假设类拟合随机噪声的能力。

与 VC 维不同，它依赖实际样本分布和函数值尺度，因此可给出更数据依赖的界。

正则化限制参数范数，会降低可实现函数波动，从而降低 Rademacher Complexity。

## Margin 与分类泛化

线性分类器即使参数数量相同，间隔也可能不同。

若训练样本具有大几何间隔：

$$
\frac{
y_i(w^\top x_i+b)
}{
\|w\|
}
\ge\gamma
$$

模型对小扰动更稳定。

SVM 最大化间隔，可获得与 $R/\gamma$ 相关的容量控制，其中 $R$ 是样本半径。

这说明参数数量不是唯一复杂度指标，参数范数、输入尺度和间隔同样重要。

## Regularization 的理论角色

经验风险最小化：

$$
\min_h\hat R(h)
$$

正则化风险最小化：

$$
\min_h
\hat R(h)
+
\lambda\Omega(h)
$$

$\Omega(h)$ 限制函数复杂度或参数范数。

$\lambda$ 越大，搜索更偏向简单稳定函数。

统计视角中它控制容量；贝叶斯视角中它对应先验；数值视角中它改善条件数。

同一正则项可以同时承担多种作用。

## Double Descent

经典 Bias–Variance 图描述模型复杂度增加后测试误差先下降、再上升。

现代过参数化模型中，测试误差有时在插值阈值附近达到峰值，随后随容量继续增加再次下降，形成 Double Descent。

这不否定容量控制，而说明“复杂度”不能只用参数数目表示。

优化偏置、参数范数、数据结构、增强和训练动态共同决定实际函数复杂度。

不能据此推出“模型越大永远越好”。计算、数据、稳定性与分布外泛化仍需验证。

## No Free Lunch 的正确理解

若对所有可能数据生成分布平均，没有学习算法普遍优于其他算法。

学习之所以可能，是因为现实问题具有结构，算法带有与结构匹配的归纳偏置。

线性模型偏好线性关系，树偏好递归分区，CNN 偏好局部和平移结构。

“模型没有假设”是不可能的。选择模型就是选择关于世界结构的假设。

## 泛化理论与实验的接口

理论提出可检查方向：

- 样本量是否足够；
- 假设类是否过大；
- 正则是否限制有效复杂度；
- 间隔是否稳定；
- 数据是否近似 i.i.d.；
- 选择尝试是否过多。

实验给出实际证据：

- 学习曲线；
- 训练—验证 gap；
- 多种子波动；
- 分布切片；
- 扰动稳定性；
- 独立测试。

两者不是互相替代。理论不匹配前提时要说明，实验没有独立数据时也不能证明泛化。

## 补充练习

### 练习 5：PAC 参数

减小 $\delta$ 表示希望什么？

答案：希望失败概率更低，即保证以更高概率成立，通常需要更多样本。

### 练习 6：随机标签

一个模型能完美拟合随机标签说明什么？

答案：模型/算法组合容量很高，但不直接说明它在真实结构数据上一定无法泛化。

### 练习 7：间隔

保持分类结果不变，把 $w,b$ 同时乘 100，几何间隔是否变化？

答案：不变，因为分子和 $\|w\|$ 同时缩放；函数间隔会变化。

## 本节检查

- 能区分经验风险与真风险；
- 能区分近似误差与估计误差；
- 能说明固定假设的 Hoeffding 界为何不能直接用于 ERM；
- 能用 Union Bound 得到有限假设类的一致收敛；
- 能解释 Shattering 和 VC 维；
- 能说明模型复杂度怎样影响样本量；
- 能把正则化理解为风险与复杂度之间的权衡；
- 能指出分布漂移为何超出标准泛化界假设。

下一节进入 [P13：决策树与集成学习](/notes/cs229/course/p13-decision-trees-ensembles)。

## 来源说明

- 视频：[B 站 P12：Lecture 9](https://www.bilibili.com/video/BV1fP4y127nn/?p=12)
- 学习理论：[Lecture Notes 4](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes4.pdf)
- 误差分析：[Bias/Variance and Error Analysis](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/error-analysis.pdf)
- 作业：[Problem Set 2](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS2/ps2.pdf)

中文内容对应 ERM、泛化界、VC 维以及近似/估计误差主线。
