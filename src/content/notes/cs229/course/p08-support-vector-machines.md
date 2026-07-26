---
title: P8：拉普拉斯平滑与支持向量机
description: 对应 B 站 P8 与 CS229 Lecture 6，先解决 Naive Bayes 零概率，再从函数间隔、几何间隔推导最大间隔分类器。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 拉普拉斯平滑

离散变量共有 $K$ 种取值，最大似然估计：

$$
\hat\phi_k
=\frac{\#\{x^{(i)}=k\}}{m}
$$

未见取值概率为零。拉普拉斯平滑给每类增加一个伪计数：

$$
\hat\phi_k
=\frac{\#\{x^{(i)}=k\}+1}{m+K}
$$

更一般地使用 $\alpha$：

$$
\hat\phi_k
=\frac{\#\{x^{(i)}=k\}+\alpha}{m+\alpha K}
$$

它等价于对多项概率使用对称 Dirichlet 先验后的 MAP 或后验均值思想。

## 从概率分类转向间隔

逻辑回归优化概率似然，SVM 直接关注分类边界及样本离边界的距离。

使用标签：

$$
y\in\{-1,+1\}
$$

线性分类器：

$$
h_{w,b}(x)
=\operatorname{sign}(w^\top x+b)
$$

若 $y(w^\top x+b)>0$，样本分类正确。数值越大，分类置信方向越强。

## 函数间隔

样本 $(x^{(i)},y^{(i)})$ 的函数间隔：

$$
\hat\gamma^{(i)}
=y^{(i)}
\left(
w^\top x^{(i)}+b
\right)
$$

训练集函数间隔：

$$
\hat\gamma
=\min_i\hat\gamma^{(i)}
$$

问题是：把 $(w,b)$ 同时乘以正数 $c$，决策边界不变，函数间隔却放大 $c$ 倍。因此它不是与参数尺度无关的真实距离。

## 几何间隔

点到超平面：

$$
w^\top x+b=0
$$

的带符号距离为：

$$
\frac{w^\top x+b}{\|w\|_2}
$$

结合标签得到几何间隔：

$$
\gamma^{(i)}
=
\frac{
y^{(i)}(w^\top x^{(i)}+b)
}{
\|w\|_2
}
$$

它对参数整体缩放不敏感，真正表示点到决策面的距离。

## 最大间隔分类

希望最大化训练集最小几何间隔：

$$
\max_{w,b}\min_i
\frac{
y^{(i)}(w^\top x^{(i)}+b)
}{
\|w\|_2
}
$$

利用尺度自由度，把最小函数间隔固定为 $1$：

$$
y^{(i)}(w^\top x^{(i)}+b)\ge1
$$

此时最大化 $1/\|w\|$ 等价于最小化：

$$
\min_{w,b}\frac12\|w\|_2^2
$$

约束为：

$$
y^{(i)}(w^\top x^{(i)}+b)\ge1,
\quad i=1,\ldots,m
$$

这就是硬间隔 SVM 的原始问题。

## 支持向量

只有满足：

$$
y^{(i)}(w^\top x^{(i)}+b)=1
$$

的边界样本直接决定最优超平面，它们称为支持向量。

远离边界的样本只要约束严格满足，小幅移动通常不改变解。SVM 因而得到一种稀疏表示：预测函数最终只依赖支持向量。

## 拉格朗日乘子

把约束写成：

$$
g_i(w,b)
=1-y^{(i)}(w^\top x^{(i)}+b)\le0
$$

拉格朗日函数：

$$
\mathcal L(w,b,\alpha)
=\frac12\|w\|^2
+\sum_i\alpha_i
\left[
1-y^{(i)}(w^\top x^{(i)}+b)
\right]
$$

其中：

$$
\alpha_i\ge0
$$

对 $w$ 求驻点：

$$
w=\sum_i\alpha_i y^{(i)}x^{(i)}
$$

这说明最优权重是训练样本的线性组合。

## KKT 条件

凸优化下，最优点满足：

- 原始可行；
- 对偶可行；
- 驻点条件；
- 互补松弛：

$$
\alpha_i
\left[
y^{(i)}(w^\top x^{(i)}+b)-1
\right]
=0
$$

若样本严格在间隔外，括号大于零，所以 $\alpha_i=0$。只有支持向量可能有非零对偶系数。

## 对偶问题

消去 $w$ 和 $b$ 后：

$$
\max_\alpha
\sum_i\alpha_i
-\frac12
\sum_{i,j}
\alpha_i\alpha_jy^{(i)}y^{(j)}
(x^{(i)})^\top x^{(j)}
$$

约束：

$$
\alpha_i\ge0
$$

$$
\sum_i\alpha_i y^{(i)}=0
$$

对偶形式只通过样本内积出现。这为下一节 Kernel Trick 打开入口。

## 线性不可分怎么办

硬间隔要求所有训练点正确且在间隔外，异常点或标签噪声会使问题不可行。

软间隔将在下一节加入松弛变量：

$$
\xi_i\ge0
$$

允许个别样本违反间隔，并通过超参数 $C$ 平衡大间隔与训练错误。

## 实现与诊断

- 特征尺度会直接影响欧氏距离和间隔，应先标准化；
- 线性可分不代表应使用无限大的惩罚系数；
- 类别不平衡时考虑每类权重；
- 只看训练准确率无法判断 $C$ 与 Kernel 是否合适；
- 应记录支持向量比例；
- 对偶求解后用 KKT 残差检查实现；
- 大样本核 SVM 的存储和计算可能成为瓶颈。

## 本节检查

- 能解释 Laplace 平滑如何消除零概率；
- 能区分函数间隔与几何间隔；
- 能从最大几何间隔推出硬间隔原始问题；
- 能说明支持向量为何决定边界；
- 能从驻点条件得到 $w$ 的样本展开；
- 能使用互补松弛解释稀疏对偶系数；
- 能写出只含内积的对偶目标；
- 能指出硬间隔对噪声的脆弱性。

下一节先完成 [P9：Python 与向量化讨论课](/notes/cs229/course/p09-section-python)，随后在 P10 进入 Kernel。

## 来源说明

- 视频：[B 站 P8：Lecture 6](https://www.bilibili.com/video/BV1fP4y127nn/?p=8)
- Naive Bayes：[Lecture Notes 2，第 11–14 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes2.pdf)
- SVM：[Lecture Notes 3，第 1–13 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes3.pdf)
- 作业：[Problem Set 1](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS1/ps1.pdf)

中文内容对应平滑、间隔、硬间隔 SVM 与对偶入口。
