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
