---
title: 第 11 章：神经网络、向量化与反向传播
description: 从单个神经元、层级表示和矩阵化前向传播，推导反向传播、初始化、优化、正则化与参数共享。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 从神经元到网络

一个神经元先计算线性组合，再经过非线性激活：

$$
z=w^\top x+b,\qquad a=g(z)
$$

若每一层都没有非线性，多层线性变换仍可合并成一个线性变换。深度产生表达力的关键是层与层之间的非线性。

常用激活：

$$
\operatorname{ReLU}(z)=\max(0,z)
$$

$$
\sigma(z)=\frac1{1+e^{-z}}
$$

隐藏层学习中间表示。输入和标签由数据给出，隐藏单元没有直接监督，因此称为 hidden units。

网络结构是归纳偏置。全连接、卷积、注意力和图网络对数据关系作出不同假设。

> 原版对应：PDF 第 1–4 页，Neural Networks。

## 前向传播

第 $l$ 层：

$$
z^{[l]}=W^{[l]}a^{[l-1]}+b^{[l]}
$$

$$
a^{[l]}=g^{[l]}(z^{[l]})
$$

若第 $l-1$ 层有 $n_{l-1}$ 个单元，第 $l$ 层有 $n_l$ 个单元：

```text
W[l]: (n_l, n_{l-1})
b[l]: (n_l, 1)
a[l-1]: (n_{l-1}, batch)
a[l]: (n_l, batch)
```

前向传播应缓存反向计算所需的 $z$、$a$ 和参数版本。混淆样本维度和特征维度是手写网络最常见错误。

输出层激活与任务匹配：回归常用线性输出，二分类用一个 logit，多分类用 $k$ 个 logits。

> 原版对应：PDF 第 4–5 页，Forward computations。

## 向量化

逐神经元 Python 循环会浪费底层 BLAS/GPU 的并行能力。把一层所有权重堆成矩阵：

$$
z^{[l]}=W^{[l]}a^{[l-1]}+b^{[l]}
$$

一次矩阵乘法同时计算所有神经元。

向量化不是删除所有循环。层之间具有依赖，通常仍按层循环；应消除的是可以表示为批量张量运算的样本和单元循环。

广播规则必须显式检查。错误 shape 有时不会报错，却会把偏置沿错误维度重复。

> 原版对应：PDF 第 5–7 页，Vectorization。

## 跨样本向量化

把 $m$ 个样本按列堆叠：

$$
A^{[0]}=
\begin{bmatrix}
|&|&&|\\
x^{(1)}&x^{(2)}&\cdots&x^{(m)}\\
|&|&&|
\end{bmatrix}
$$

整批前向传播：

$$
Z^{[l]}=W^{[l]}A^{[l-1]}+b^{[l]}
$$

$b$ 通过广播复制到每个样本列。

现代框架常把 batch 放在第一维。约定不同不影响数学，但项目内必须统一，并在层边界写测试。

Mini-batch 在吞吐量、显存和梯度噪声之间平衡。batch size 还会影响 BatchNorm 统计和优化动态。

> 原版对应：PDF 第 7–8 页，Vectorization over training examples。

## 反向传播

反向传播是链式法则在计算图上的动态规划。每个节点接收上游梯度，乘以局部导数，再把贡献传给父节点。

对线性层：

$$
Z=WA+b
$$

若已知 $dZ$：

$$
dW=\frac1m dZ A^\top
$$

$$
db=\frac1m\sum_i dZ_i
$$

$$
dA=W^\top dZ
$$

激活层：

$$
dZ=dA\odot g'(Z)
$$

反向传播的效率来自复用前向中间量和局部梯度，不需要为每个参数单独重新计算整个函数。

手写实现必须做数值梯度检查：

$$
\frac{\partial J}{\partial\theta_j}
\approx
\frac{J(\theta+\epsilon e_j)-J(\theta-\epsilon e_j)}
{2\epsilon}
$$

> 原版对应：PDF 第 8–9 页，Backpropagation。

## 参数初始化

所有权重初始化为零会让同层神经元获得相同梯度，无法打破对称性。

随机初始化负责打破对称。方差还要维持信号在层间传播：

- Xavier 适合 tanh/近线性激活；
- He 初始化适合 ReLU。

ReLU 常用：

$$
W_{ij}\sim\mathcal N\left(0,\frac{2}{n_{\text{in}}}\right)
$$

初始化过大会让激活和梯度爆炸；过小会逐层衰减。应监控各层激活均值、方差、零值比例和梯度范数。

> 原版对应：PDF 第 9–11 页，Parameter initialization。

## 优化与正则化

SGD 使用 mini-batch 梯度；Momentum 累积平滑方向；Adam 为不同参数维护一阶和二阶矩估计。

优化器不能修复错误目标、错误标签或梯度实现。训练前先在极小数据集上过拟合，确认模型具备记忆能力。

L2 正则化限制权重规模。Dropout 在训练时随机屏蔽单元，减少特征共适应。Early stopping 使用验证性能限制有效训练时间。

参数共享让同一组权重在不同位置复用，例如卷积核。它降低参数量并编码平移结构，不只是计算优化。

深层网络还要诊断梯度消失、梯度爆炸、dead ReLU、数据归一化和训练/推理模式差异。

> 原版对应：PDF 第 11–16 页，Optimization, L2 regularization and parameter sharing。

## 本章检查

- 能写出每层 $W,b,Z,A$ 的 shape；
- 能解释非线性为何不能全部删除；
- 能从链式法则推导线性层的 $dW,db,dA$；
- 能使用中心差分检查梯度；
- 能说明零初始化为何导致对称；
- 能为 ReLU 选择 He 初始化并监控信号传播；
- 能区分优化失败、表达能力不足和数据问题；
- 能解释参数共享带来的归纳偏置。

下一部分进入 [K-means](/notes/cs229/course/kmeans)，训练数据不再提供标签，模型需要从输入分布中发现结构。

## 来源说明

本章对应 [CS229 Deep Learning Notes](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes-deep_learning.pdf) 与 Backprop 补充讲义。中文内容为独立重构讲解。
