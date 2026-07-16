---
title: Kernel trick 笔记
description: 从显式二次特征开始理解 kernel trick、Gram matrix、常用核和核方法的适用边界。
publishDate: 2026-07-16
updatedDate: 2026-07-16
language: zh
---

Kernel trick 的核心不是“把数据升到无限维”，而是：当算法只通过样本内积依赖特征时，用一个函数直接计算映射后特征的内积。

## 从显式特征开始

对二维输入 $x=(x_1,x_2)$，可以构造二次特征：

$$
\phi(x)=(x_1^2,\sqrt{2}x_1x_2,x_2^2).
$$

映射后的内积为

$$
\phi(x)^T\phi(z)=(x^Tz)^2.
$$

因此多项式核 $K(x,z)=(x^Tz)^2$ 可以直接得到这个值，不必显式创建所有二次特征。

## Kernel trick 的条件

如果原算法能写成样本内积的组合，就可以尝试把

$$
x^{(i)T}x^{(j)}
$$

替换为

$$
K(x^{(i)},x^{(j)}).
$$

这也是 SVM 的对偶形式适合 kernelization 的原因。若算法显式依赖每一个特征坐标，就不能只靠替换内积完成 kernel 化。

## Gram matrix

对训练样本定义

$$
K_{ij}=K(x^{(i)},x^{(j)}).
$$

有效 kernel 对任意有限样本产生的 Gram matrix 应为半正定。这保证它可以被解释为某个特征空间中的内积。

## 常用核

### Polynomial kernel

$$
K(x,z)=(x^Tz+c)^d.
$$

它对应有限阶特征交互。$d$ 越大，边界表达能力越强，也更容易过拟合。

### RBF kernel

$$
K(x,z)=\exp\left(-\frac{\lVert x-z\rVert^2}{2\sigma^2}\right).
$$

$\sigma$ 控制相似性的尺度。太小会让每个样本只影响极小邻域，太大则让所有样本看起来相似。

## 容易误解的地方

- kernel 不是凭空避免高维代价：Gram matrix 需要 $O(m^2)$ 存储；
- kernel 选择编码了相似性假设，不只是调参；
- 特征必须缩放，否则距离型 kernel 会被量纲支配；
- kernel 方法对大量样本可能比显式低维近似更昂贵。

## 检查问题

遇到一个新 kernel 时，问：

1. 它把什么样的样本视为相似？
2. 它对应有限维还是可能的无限维映射？
3. 参数改变了哪一种归纳偏置？
4. Gram matrix 是否数值半正定？
5. 样本规模下的时间与空间代价是否可接受？
