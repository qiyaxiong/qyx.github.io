---
title: 第 3 章：生成式学习、GDA 与 Naive Bayes
description: 从多元高斯、GDA 到 Naive Bayes，理解生成式模型如何先描述类别与特征的联合分布，再得到分类规则。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 生成式建模

逻辑回归直接学习：

$$
P(y\mid x)
$$

生成式分类器则分别学习：

$$
P(x\mid y),\qquad P(y)
$$

预测时利用贝叶斯公式：

$$
P(y\mid x)
=\frac{P(x\mid y)P(y)}{P(x)}
$$

比较类别时，分母 $P(x)$ 对所有类别相同，因此只需比较 $P(x\mid y)P(y)$。

生成式方法对数据分布施加更强假设。假设合理且数据少时，它可能更快得到好结果；假设明显错误时，判别式方法通常更稳健。

> 原版对应：PDF 第 1 页，Generative learning algorithms。

## 多元高斯分布

![中心化批数据如何沿样本轴形成对称半正定协方差矩阵](/images/notes/cs229/tikz/p06-covariance-gaussian.png)

多元高斯写成：

$$
x\sim\mathcal N(\mu,\Sigma)
$$

$\mu$ 决定分布中心，$\Sigma$ 描述各方向方差和特征之间的协方差。

密度为：

$$
p(x;\mu,\Sigma)
=\frac{1}{(2\pi)^{n/2}|\Sigma|^{1/2}}
\exp\left(
-\frac12(x-\mu)^\top\Sigma^{-1}(x-\mu)
\right)
$$

二次型衡量样本到均值的 Mahalanobis 距离。协方差大的方向允许更大偏移，协方差小的方向对偏离更敏感。

协方差必须对称半正定。若样本数量小于维度或特征高度共线，样本协方差可能不可逆，需要正则化或降维。

> 原版对应：PDF 第 2–5 页，The multivariate normal distribution。

## 高斯判别分析

![GDA 使用共享协方差计算每个类别的生成式判别分数](/images/notes/cs229/tikz/p07-gda-generative-classification.png)

GDA 假设：

$$
y\sim\operatorname{Bernoulli}(\phi)
$$

$$
x\mid y=0\sim\mathcal N(\mu_0,\Sigma)
$$

$$
x\mid y=1\sim\mathcal N(\mu_1,\Sigma)
$$

两个类别拥有不同均值，但共享协方差。联合似然最大化后得到：

$$
\phi=\frac1m\sum_i1\{y^{(i)}=1\}
$$

$$
\mu_k=
\frac{\sum_i1\{y^{(i)}=k\}x^{(i)}}
{\sum_i1\{y^{(i)}=k\}}
$$

$$
\Sigma=\frac1m\sum_i
(x^{(i)}-\mu_{y^{(i)}})
(x^{(i)}-\mu_{y^{(i)}})^\top
$$

共享协方差使对数后验比中的二次项抵消，最终决策边界是线性的。若每个类别使用不同协方差，就得到二次判别分析 QDA。

> 原版对应：PDF 第 5–6 页，Gaussian Discriminant Analysis。

## GDA 与逻辑回归

在 GDA 假设成立时，可以推出：

$$
P(y=1\mid x)
=\frac{1}{1+\exp(-\theta^\top x)}
$$

因此 GDA 会产生 Logistic 形式的后验，但反过来并不成立。逻辑回归只约束条件概率形状，不要求 $x\mid y$ 为高斯。

GDA 假设更强，参数结构利用得更多；逻辑回归假设较弱，通常需要更多数据，但对特征分布偏离高斯更有韧性。

选择时不要背“谁一定更好”。应检查样本量、分布形状、协方差稳定性和概率校准，并在验证集上比较。

> 原版对应：PDF 第 6–8 页，GDA and logistic regression。

## 朴素贝叶斯

![Naive Bayes 将各特征条件似然累加成类别 log-score](/images/notes/cs229/tikz/p07-naive-bayes-log-score.png)

文本等高维离散任务很难直接估计完整 $P(x\mid y)$。Naive Bayes 作出条件独立假设：

$$
P(x\mid y)=\prod_{j=1}^{n}P(x_j\mid y)
$$

“朴素”在于给定类别后，各特征被假设相互独立。真实词语显然相关，但分类器仍可能有效，因为决策只需要类别之间的相对证据。

对于二值词特征，估计：

$$
\phi_{j\mid y=1}=P(x_j=1\mid y=1)
$$

预测时比较对数分数：

$$
\log P(y=k)+\sum_j\log P(x_j\mid y=k)
$$

使用对数既把乘积变成求和，也避免许多小概率相乘造成下溢。

> 原版对应：PDF 第 8–11 页，Naive Bayes。

## 拉普拉斯平滑

如果训练集中某类别从未出现某个词，最大似然估计会给出概率 0。测试文档一旦包含这个词，整个类别联合概率就变成 0。

拉普拉斯平滑给每个可能结果增加伪计数。对于有 $K$ 个取值的离散变量：

$$
\hat P(x=j)
=\frac{\operatorname{count}(x=j)+1}{m+K}
$$

更一般的 Add-$\alpha$ 平滑使用 $\alpha$ 代替 1。它可以解释为带 Dirichlet/Beta 先验的后验预测。

平滑不是把所有词变得同样可能，而是防止有限样本把“尚未观察到”错误解释成“绝不可能”。

> 原版对应：PDF 第 11–12 页，Laplace smoothing。

## 文本事件模型

Bernoulli 事件模型只关心一个词是否出现。Multinomial 事件模型把文档看作多次词语抽取，因此保留词频。

对于长度为 $L$ 的文档：

$$
P(x\mid y)=\prod_{t=1}^{L}P(x_t\mid y)
$$

两者的特征含义不同，不能只看公式相似。短文本、重复词、文档长度和词表规模都会影响选择。

实现时应明确 tokenization、词表、未知词和平滑规则，并把这些预处理和模型参数一起保存。

> 原版对应：PDF 第 13–14 页，Event models for text classification。

## 本章检查

- 能解释生成式与判别式模型分别学习什么；
- 能写出 GDA 的分布假设和闭式参数估计；
- 能说明共享协方差为何产生线性边界；
- 能解释条件独立假设为何错误但仍可能有用；
- 能使用对数概率与拉普拉斯平滑；
- 能区分 Bernoulli 和 Multinomial 文本事件模型。

下一章进入 [SVM 与 Kernel](/notes/cs229/course/svm-kernels)，从概率建模切换到最大间隔几何。

## 来源说明

本章对应 [CS229 Lecture Notes 2](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes2.pdf)。中文内容为独立重构讲解。
