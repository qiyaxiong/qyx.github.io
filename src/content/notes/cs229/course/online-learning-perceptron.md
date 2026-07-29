---
title: 第 7 章：在线学习与感知机错误上界
description: 理解在线学习的预测—揭晓—更新循环，并推导线性可分且存在间隔时感知机的有限错误次数上界。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 在线学习设定

批量学习先拿到训练集，训练结束后再到测试集评估。在线学习中，样本按顺序到达，算法必须边预测边学习。

第 $t$ 轮执行：

```text
看到 x_t
→ 输出预测 ŷ_t
→ 得到真实标签 y_t
→ 根据是否预测错误更新参数
```

评价指标通常是累计错误或 regret，而不是一次固定测试集准确率。

在线设定适合广告点击、推荐、风控和持续变化的数据流，但还要区分“在线更新”和“概念漂移”。错误上界通常依赖数据可分、顺序或损失的假设。

> 原版对应：PDF 第 1 页，Online learning setting。

## 感知机更新

![感知机如何区分连续 margin、错分掩码和参数更新](/images/notes/cs229/tikz/concept-perceptron-update.png)

令 $y_t\in\{-1,+1\}$，预测：

$$
\hat y_t=\operatorname{sign}(\theta^\top x_t)
$$

预测正确时不更新。预测错误时：

$$
\theta\leftarrow\theta+y_tx_t
$$

因为错误意味着：

$$
y_t(\theta^\top x_t)\le0
$$

更新会增加正确类别方向上的打分。

感知机输出硬标签，不提供校准概率，也不是最大似然模型。它与逻辑回归更新形式相似，但目标和理论性质不同。

> 原版对应：PDF 第 1–2 页，The perceptron update。

## 错误上界

![感知机错误次数上界中正确方向进展与参数范数增长的两条夹逼](/images/notes/cs229/tikz/concept-perceptron-mistake-bound.png)

假设所有输入满足：

$$
\|x_t\|\le D
$$

并存在单位向量 $u$，使每个样本都有至少 $\gamma$ 的间隔：

$$
y_tu^\top x_t\ge\gamma
$$

则感知机累计错误次数 $M$ 满足：

$$
M\le\left(\frac{D}{\gamma}\right)^2
$$

这个上界不显式依赖样本数量或维度。真正决定困难程度的是样本半径与可分间隔之比。

若 $\gamma$ 很小，上界会迅速变差；若数据不可分，有限错误保证不再成立。

> 原版对应：PDF 第 2 页，Perceptron mistake bound。

## 证明结构

只观察发生错误的更新。

第一条链证明参数朝正确分隔方向累积。每次错误更新后：

$$
\theta_{k+1}^\top u
=\theta_k^\top u+y_ku^\top x_k
\ge\theta_k^\top u+\gamma
$$

因此发生 $M$ 次错误后：

$$
\theta_M^\top u\ge M\gamma
$$

第二条链控制参数范数。由于错误时 $y_k\theta_k^\top x_k\le0$：

$$
\|\theta_{k+1}\|^2
\le\|\theta_k\|^2+D^2
$$

所以：

$$
\|\theta_M\|\le\sqrt M D
$$

由 Cauchy–Schwarz：

$$
M\gamma
\le\theta_M^\top u
\le\|\theta_M\|
\le\sqrt M D
$$

整理得到错误上界。

证明的核心不是代数，而是同时维护“向正确方向的进展下界”和“参数规模的增长上界”。

> 原版对应：PDF 第 2–3 页，Proof of the mistake bound。

## 本章检查

- 能写出在线学习每轮的交互顺序；
- 能解释感知机为什么只在错误时更新；
- 能说明错误上界依赖 $D/\gamma$ 而非显式维度；
- 能复述证明中的进展下界和范数上界；
- 能指出数据不可分或存在噪声时原定理为什么失效；
- 能区分感知机、逻辑回归与 SVM 的目标和输出含义。

下一部分进入 [决策树](/notes/cs229/course/decision-trees)，模型不再通过单一线性打分划分空间，而是递归建立条件区域。

## 来源说明

本章对应 [CS229 Lecture Notes 6](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes6.pdf)。中文内容为独立重构讲解。
