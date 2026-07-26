---
title: 第 5 章：学习理论与 VC 维
description: 从偏差—方差、经验风险和一致收敛出发，理解有限与无限假设类的泛化界，以及 VC 维如何描述模型容量。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 偏差与方差

训练误差低、测试误差高通常表示高方差：模型能够贴合训练集，却对数据采样变化敏感。

训练误差本身就很高通常表示高偏差：当前假设类无法表达数据中的主要结构，或优化过程没有找到足够好的解。

这个诊断不是绝对二分。数据噪声、标签错误、分布漂移和指标不匹配也会造成类似现象。

学习曲线比单个误差数字更有信息。随着训练样本增加，高方差模型的验证误差通常继续下降；高偏差模型的训练和验证误差则较早靠拢在一个较高水平。

> 原版对应：PDF 第 1–2 页，Bias/variance tradeoff。

## 经验风险与泛化

真实风险是模型在数据分布上的期望错误：

$$
\varepsilon(h)=P_{(x,y)\sim\mathcal D}[h(x)\ne y]
$$

训练集上的经验风险是：

$$
\hat\varepsilon(h)
=\frac1m\sum_{i=1}^{m}
1\{h(x^{(i)})\ne y^{(i)}\}
$$

经验风险最小化 ERM 从假设类 $\mathcal H$ 中选择训练错误最小的模型。

核心问题不是某个固定模型的训练误差是否接近真实误差，而是当模型也是用这批数据选出来时，整个假设类能否同时保持这种接近。

这引出一致收敛：

$$
\sup_{h\in\mathcal H}
|\varepsilon(h)-\hat\varepsilon(h)|
$$

若上式足够小，ERM 选出的模型就不会因为在大量候选中“碰巧”适合训练集而严重过拟合。

> 原版对应：PDF 第 2–5 页，Preliminaries and empirical risk minimization。

## 有限假设类

对固定假设 $h$，Hoeffding 不等式给出经验误差偏离真实误差的概率上界。

当 $\mathcal H$ 有限时，可以对所有假设使用 union bound：

$$
P\left[
\exists h\in\mathcal H:
|\varepsilon(h)-\hat\varepsilon(h)|>\gamma
\right]
\le2|\mathcal H|\exp(-2\gamma^2m)
$$

令失败概率不超过 $\delta$，可以看到样本复杂度近似随：

$$
\frac{\log|\mathcal H|+\log(1/\delta)}{\gamma^2}
$$

增长。

假设数量以对数形式进入上界。真正危险的不是候选模型“多”本身，而是模型类容量相对数据量过大。

> 原版对应：PDF 第 5–8 页，The case of finite hypothesis classes。

## 无限假设类

线性分类器的参数是连续实数，因此假设类无限，不能直接用 $|\mathcal H|$。

关键转变是：对于有限的 $m$ 个输入点，一个假设类能够产生多少种不同标签划分？即使参数无限，实际可实现的划分数量仍可能受限。

增长函数 $\Pi_{\mathcal H}(m)$ 表示 $\mathcal H$ 在任意 $m$ 个点上最多能实现多少种标记。

若能把 union bound 中的 $|\mathcal H|$ 替换成增长函数，就能把有限假设类的思路推广到无限参数空间。

> 原版对应：PDF 第 8–9 页，The case of infinite hypothesis classes。

## VC 维

若存在一组 $d$ 个点，$\mathcal H$ 能实现它们全部 $2^d$ 种二元标记，就说这组点被 $\mathcal H$ 打散。

VC 维是能够被打散的最大点数：

$$
\operatorname{VC}(\mathcal H)=d
$$

二维线性分类器的 VC 维为 3：可以找到三个点实现全部标记，但一般无法打散四个点。

VC 维描述的是最坏情况下的表达容量，不等于参数个数，也不直接等于实际测试误差。

典型样本复杂度随 VC 维近似线性增长，并额外包含对数和置信度项。容量越大，需要越多数据保证一致收敛。

正则化、间隔约束和数据几何可能让实际有效容量远小于形式上的假设类。

> 原版对应：PDF 第 9–11 页，VC dimension and uniform convergence。

## 本章检查

- 能通过训练/验证学习曲线区分高偏差和高方差；
- 能区分真实风险、经验风险与验证误差；
- 能解释为什么固定模型集中界不足以证明 ERM 泛化；
- 能说出 union bound 在有限假设类中的作用；
- 能用“打散”解释 VC 维，而不是只背数值；
- 能说明泛化界给出保证，不是测试误差的精确预测。

下一章进入 [模型选择与正则化](/notes/cs229/course/model-selection-regularization)，把容量控制落实到验证流程、特征选择和先验。

## 来源说明

本章对应 [CS229 Lecture Notes 4](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes4.pdf)。中文内容为独立重构讲解。
