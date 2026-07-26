---
title: P5：感知机、指数族与广义线性模型
description: 对应 B 站 P5 与 CS229 Lecture 4，从感知机更新进入指数族、GLM 构造、Poisson 回归与 Softmax 回归。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 感知机

使用标签：

$$
y\in\{-1,+1\}
$$

感知机分类器：

$$
h_\theta(x)
=\operatorname{sign}(\theta^\top x)
$$

当样本被误分类：

$$
y^{(i)}\theta^\top x^{(i)}\le0
$$

执行更新：

$$
\theta
\leftarrow
\theta+\alpha y^{(i)}x^{(i)}
$$

正样本被分到负侧时沿 $x$ 方向增加参数；负样本被分到正侧时沿相反方向修正。

## 感知机与逻辑回归

二者都产生线性边界：

$$
\theta^\top x=0
$$

但学习目标不同：

- 感知机只在误分类时更新，不输出校准概率；
- 逻辑回归最大化条件似然，每个样本都有连续梯度；
- 感知机在严格线性可分且存在间隔时有错误次数上界；
- 数据不可分时，原始感知机可能持续震荡。

因此不能只因边界形式相同就把两个算法视为等价。

## 为什么引入指数族

逻辑回归看起来像人为选择了 Sigmoid。指数族提供统一方法：先指定 $y\mid x$ 的概率分布，再从分布结构推出均值与输入之间的连接函数。

指数族一般形式：

$$
p(y;\eta)
=b(y)
\exp\left(
\eta^\top T(y)-a(\eta)
\right)
$$

其中：

- $\eta$：自然参数；
- $T(y)$：充分统计量；
- $a(\eta)$：对数配分函数；
- $b(y)$：基准测度。

$a(\eta)$ 负责把密度或概率质量归一化。

## Bernoulli 的指数族形式

Bernoulli 分布：

$$
p(y;\phi)=\phi^y(1-\phi)^{1-y}
$$

改写为：

$$
p(y;\phi)
=\exp\left(
y\log\frac{\phi}{1-\phi}
+\log(1-\phi)
\right)
$$

所以自然参数：

$$
\eta=\log\frac{\phi}{1-\phi}
$$

反解：

$$
\phi=\frac{1}{1+e^{-\eta}}
$$

Sigmoid 因而是 Bernoulli 自然参数到均值参数的映射，不是随意拼接的压缩函数。

## Gaussian 的指数族形式

固定方差 $\sigma^2$ 时：

$$
p(y;\mu)
=\frac{1}{\sqrt{2\pi}\sigma}
\exp\left(
-\frac{(y-\mu)^2}{2\sigma^2}
\right)
$$

展开关于 $y$ 的项，可识别自然参数与 $\mu$ 的线性关系。

在单位方差的简化设定下：

$$
\eta=\mu
$$

均值与自然参数相同，因此 GLM 导出线性回归。

## 对数配分函数的性质

当 $T(y)=y$：

$$
E[y]=a'(\eta)
$$

$$
\operatorname{Var}(y)=a''(\eta)
$$

因为方差非负，所以：

$$
a''(\eta)\ge0
$$

即 $a(\eta)$ 是凸函数。这个结构解释了许多 GLM 对数似然的曲率性质。

## 构造广义线性模型

GLM 使用三个假设：

1. 给定 $x$，$y$ 服从某个指数族分布；
2. 预测目标是条件均值 $E[y\mid x]$；
3. 自然参数与输入线性相关：

$$
\eta=\theta^\top x
$$

均值响应：

$$
h_\theta(x)
=E[y\mid x]
=a'(\theta^\top x)
$$

选择输出分布后，响应函数由指数族结构决定。

## 逻辑回归作为 GLM

若：

$$
y\mid x
\sim\operatorname{Bernoulli}(\phi)
$$

自然参数：

$$
\eta=\log\frac{\phi}{1-\phi}
$$

令 $\eta=\theta^\top x$，得到：

$$
\phi
=g(\theta^\top x)
$$

因此逻辑回归是 Bernoulli 响应的 canonical-link GLM。

## Poisson 回归

计数目标可使用：

$$
y\mid x
\sim\operatorname{Poisson}(\lambda)
$$

概率质量：

$$
p(y;\lambda)
=\frac{e^{-\lambda}\lambda^y}{y!}
$$

自然参数：

$$
\eta=\log\lambda
$$

令 $\eta=\theta^\top x$：

$$
\lambda=e^{\theta^\top x}
$$

预测值始终为正，适合事件次数、访问量等计数数据。

Poisson 隐含均值等于方差。真实数据方差显著更大时存在过度离散，应考虑负二项、额外随机效应或稳健误差估计。

## 多项分布与 Softmax

多分类目标：

$$
y\in\{1,\ldots,K\}
$$

为每个类别定义参数 $\theta_k$。Softmax 概率：

$$
P(y=k\mid x)
=
\frac{
\exp(\theta_k^\top x)
}{
\sum_{j=1}^{K}
\exp(\theta_j^\top x)
}
$$

所有类别概率非负且和为 $1$。

为了可辨识性，可以固定一个参考类别参数为零，或接受整体平移不改变概率的冗余参数化。

## Softmax 的数值稳定

直接计算 $\exp(z_k)$ 可能上溢。利用所有 logits 同时减去常数不改变概率：

$$
\operatorname{softmax}(z)_k
=
\frac{
\exp(z_k-c)
}{
\sum_j\exp(z_j-c)
}
$$

通常取：

$$
c=\max_j z_j
$$

交叉熵应通过稳定的 `log-softmax` 或框架 logits 损失实现。

## GLM 的适用边界

选择 GLM 时必须同时检查：

- 输出支持集：实数、二元、非负计数或类别；
- 均值—方差关系是否合理；
- 线性预测子是否足够；
- 样本是否独立；
- 是否存在异常点、过度离散或类别严重不平衡。

连接函数能保证输出范围，却不能自动修复错误的数据生成假设。

## 本节检查

- 能写出感知机误分类条件和更新；
- 能区分感知机与逻辑回归的学习目标；
- 能指出指数族中的自然参数、充分统计量和配分函数；
- 能从 Bernoulli 自然参数推出 Sigmoid；
- 能用三条假设构造 GLM；
- 能从 Poisson 分布推出指数均值响应；
- 能写出 Softmax 概率并稳定实现；
- 能根据输出类型和方差结构判断 GLM 是否合适。

下一节是 [P6：概率论讨论课](/notes/cs229/course/p06-section-probability)。

## 来源说明

- 视频：[B 站 P5：Lecture 4](https://www.bilibili.com/video/BV1fP4y127nn/?p=5)
- 主讲义：[Lecture Notes 1，第 21–30 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes1.pdf)
- 补充讲义：[Online Learning and Perceptron](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes6.pdf)
- 作业：[Problem Set 1](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS1/ps1.pdf)

中文内容对应本节课堂主题，并补充 GLM 分布假设的诊断边界。
