---
title: P5：感知机、指数族与广义线性模型
description: 对应 B 站 P5 与 CS229 Lecture 4，从感知机更新进入指数族、GLM 构造、Poisson 回归与 Softmax 回归。
publishDate: 2026-07-26
updatedDate: 2026-08-08
language: zh
---

## 一图理解本章

![从感知机、指数族和自然参数到链接函数与广义线性模型的六步图解](/images/notes/cs229/storyboards/p05-glm-storyboard.png)

先沿图中的六个步骤建立本章主线，再进入后文的公式推导、实现细节和失败诊断。

## 感知机

![感知机如何区分连续 margin、错分掩码和参数更新](/images/notes/cs229/tikz/concept-perceptron-update.png)

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

![指数族自然参数、连接函数与广义线性模型的统一结构](/images/notes/cs229/tikz/p05-glm-exponential-family.png)

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

![Softmax 在线性 logits 的类别轴上进行稳定概率归一化](/images/notes/cs229/tikz/p05-softmax-class-axis.png)

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

## 感知机的几何意义

感知机使用标签 $y\in\{-1,+1\}$。若样本被误分类：

$$
y^{(i)}\theta^\top x^{(i)}\le0
$$

就执行：

$$
\theta
\leftarrow
\theta
+
\alpha y^{(i)}x^{(i)}
$$

当正样本被错分时，参数朝 $x^{(i)}$ 方向移动；负样本被错分时，参数远离该样本方向。

若数据线性可分，感知机收敛定理保证有限次更新后找到一个分离超平面。但它不保证找到最大间隔边界，也不输出校准概率。

若数据不可分，算法可能永远循环。工程实现通常限制 epoch、保存验证表现最好的参数，或使用 Pocket Algorithm。

## 指数族的统一形式

指数族分布写成：

$$
p(y;\eta)
=
b(y)
\exp\left(
\eta^\top T(y)-a(\eta)
\right)
$$

$\eta$ 是自然参数，$T(y)$ 是充分统计量，$a(\eta)$ 是对数配分函数。

归一化要求：

$$
\int
b(y)\exp\left(\eta^\top T(y)-a(\eta)\right)dy
=1
$$

因此：

$$
a(\eta)
=
\log
\int
b(y)\exp\left(\eta^\top T(y)\right)dy
$$

对 $a(\eta)$ 求导：

$$
\nabla_\eta a(\eta)
=
\mathbb E_\eta[T(y)]
$$

再求一次导数：

$$
\nabla_\eta^2a(\eta)
=
\operatorname{Cov}_\eta[T(y)]
\succeq0
$$

所以对数配分函数是凸函数。它的梯度给均值，Hessian 给协方差，这是指数族最重要的统一性质之一。

## 从指数族构造 GLM 的三步法

第一步，根据目标变量的取值范围选择指数族分布。

- 二元目标选择 Bernoulli；
- 非负计数选择 Poisson；
- 连续、近似对称目标选择 Gaussian；
- 多类别目标选择 Categorical。

第二步，让自然参数与特征线性相关：

$$
\eta=\theta^\top x
$$

这称为线性预测子。

第三步，通过均值与自然参数的关系得到响应函数：

$$
\mathbb E[y\mid x]
=
g^{-1}(\theta^\top x)
$$

$g$ 是链接函数，$g^{-1}$ 是逆链接函数。

对于 Bernoulli：

$$
\eta=\log\frac{\phi}{1-\phi}
$$

所以逆链接是 Sigmoid。

对于 Poisson：

$$
\eta=\log\lambda
$$

所以：

$$
\mathbb E[y\mid x]
=
\lambda
=
\exp(\theta^\top x)
$$

指数函数保证预测计数率为正。

## Poisson 回归完整推导

Poisson 分布为：

$$
p(y;\lambda)
=
\frac{e^{-\lambda}\lambda^y}{y!},
\qquad
y\in\{0,1,2,\ldots\}
$$

令 $\lambda=\exp(\theta^\top x)$，单样本对数似然：

$$
\ell_i(\theta)
=
-\exp(\theta^\top x^{(i)})
+
y^{(i)}\theta^\top x^{(i)}
-
\log(y^{(i)}!)
$$

梯度：

$$
\nabla_\theta\ell_i
=
\left(
y^{(i)}
-\exp(\theta^\top x^{(i)})
\right)x^{(i)}
$$

这与逻辑回归具有相同模板：

$$
\nabla_\theta\ell_i
=
\left(y^{(i)}-\mu^{(i)}\right)x^{(i)}
$$

区别在于条件均值 $\mu^{(i)}$ 由不同逆链接函数给出。

Poisson 假设条件均值等于条件方差。若真实计数数据存在明显过度离散，负二项回归可能更合适。

## Softmax 回归的似然与梯度

对 $K$ 个类别，为每类设置参数 $\theta_k$：

$$
p(y=k\mid x)
=
\frac{\exp(\theta_k^\top x)}
{\sum_{j=1}^{K}\exp(\theta_j^\top x)}
$$

用 one-hot 标签 $y_k^{(i)}$，负对数似然为：

$$
J(\Theta)
=
-\sum_{i=1}^{m}
\sum_{k=1}^{K}
y_k^{(i)}
\log p(y=k\mid x^{(i)})
$$

对第 $k$ 类参数求导：

$$
\nabla_{\theta_k}J
=
\sum_{i=1}^{m}
\left(
p_k^{(i)}-y_k^{(i)}
\right)x^{(i)}
$$

矩阵形式仍是“预测减标签，再乘输入”。这与二分类逻辑回归、线性输出层的反向传播完全一致。

Softmax 对所有 logits 加同一常数后概率不变。数值实现先减去最大 logit：

$$
z_k'=z_k-\max_jz_j
$$

这样不会改变结果，却能避免指数溢出。

## 偏差项与基准类别

在二分类逻辑回归中，截距控制未考虑其他特征时的基础 log-odds。

多分类 Softmax 的参数存在平移冗余，因为所有 $\theta_k$ 同时加上同一个向量不会改变概率。

一种处理方式是把某一类别设为基准，固定其参数为零；另一种方式是保留全部参数并使用正则化和稳定优化器。

解释系数时要注意：逻辑回归的 $\theta_j$ 表示特征增加一个单位时 log-odds 的变化，不是概率直接增加 $\theta_j$。

## 模型选择边界

GLM 很强，因为它把输出分布、均值函数和优化目标统一起来。但它仍假设自然参数是特征的线性函数。

若关系存在强非线性，可以先构造非线性特征、使用 Kernel，或改用树模型和神经网络。

若观测之间不独立，例如时间序列、患者重复测量或空间数据，还需要显式建模相关结构。

若输出分布选择错误，均值预测有时仍可用，但不确定性、置信区间和似然比较可能失真。

## 练习与答案思路

### 练习 1：选择 GLM

预测网站每分钟到达的请求数，应优先考虑哪种输出分布和链接函数？

答案思路：非负计数可从 Poisson 开始，使用对数链接，均值为 $\exp(\theta^\top x)$。

### 练习 2：解释系数

逻辑回归中某特征系数为 $\log2$，其他变量不变时意味着什么？

答案：该特征增加一个单位，odds 乘以 $2$，不是概率直接增加 $\log2$。

### 练习 3：Softmax 稳定性

为什么从全部 logits 中减去最大值不会改变概率？

答案思路：分子分母同时乘上 $\exp(-\max z)$，公共因子抵消。

### 练习 4：比较感知机与逻辑回归

两者都形成线性边界，主要差别是什么？

答案思路：感知机只在误分类时更新，不建模概率；逻辑回归最大化条件似然，输出概率并可自然加入正则化。

## Canonical Link 为什么简化梯度

GLM 把均值 $\mu$ 与线性预测子联系起来：

$$
g(\mu)=\theta^\top x
$$

若链接函数让线性预测子等于自然参数：

$$
\eta=\theta^\top x
$$

就称为 canonical link。

Bernoulli 的 canonical link 是 logit：

$$
\log\frac{\mu}{1-\mu}
=
\theta^\top x
$$

Poisson 的 canonical link 是 log：

$$
\log\mu
=
\theta^\top x
$$

在 canonical link 下，单样本 log-likelihood 对参数的梯度常简化为：

$$
\nabla_\theta\ell
=
(y-\mu)x
$$

这解释了线性回归、逻辑回归和 Poisson 回归为何共享“残差乘特征”的梯度结构。

## 均值与方差的联系

指数族中：

$$
\mathbb E[T(y)]
=
\nabla a(\eta)
$$

$$
\operatorname{Cov}[T(y)]
=
\nabla^2a(\eta)
$$

对 Bernoulli：

$$
\operatorname{Var}(y\mid x)
=
\mu(1-\mu)
$$

对 Poisson：

$$
\operatorname{Var}(y\mid x)
=
\mu
$$

对固定方差 Gaussian：

$$
\operatorname{Var}(y\mid x)
=
\sigma^2
$$

GLM 不只是规定均值函数，也通过所选分布规定均值—方差关系。

若真实方差结构与选择分布严重不同，系数均值模型可能仍有价值，但标准误、似然和预测区间会失真。

## Deviance 与模型比较

饱和模型为每个样本设置足够参数，使预测完全贴合观测。

Deviance 比较当前模型与饱和模型的 log-likelihood：

$$
D
=
2
\left[
\ell(\text{saturated})
-
\ell(\text{model})
\right]
$$

Deviance 越小，当前模型越接近饱和拟合。

Residual Deviance 可用于检查模型拟合和比较嵌套 GLM，但解释依赖渐近条件。

不能只追求 Deviance 最小。增加参数通常会改善训练似然，还需要正则、验证或信息准则控制复杂度。

## 过度离散

Poisson 假设：

$$
\operatorname{Var}(Y\mid X)
=
\mathbb E[Y\mid X]
$$

真实计数常有：

$$
\operatorname{Var}(Y\mid X)
>
\mathbb E[Y\mid X]
$$

这称为过度离散。

原因可能包括：

- 未观察到的群体差异；
- 事件成簇出现；
- 零值过多；
- 时间依赖；
- 模型遗漏特征。

可使用负二项回归、quasi-Poisson、零膨胀模型或更完整层级模型。

只调整标准误不一定修复预测分布，先确认任务究竟需要均值预测还是完整计数概率。

## Offset 与暴露量

计数必须考虑观察暴露量。商店营业 24 小时与 1 小时的到店人数不可直接比较。

若 $e_i$ 是暴露量，建模事件率：

$$
\lambda_i
=
e_i
\exp(\theta^\top x_i)
$$

取对数：

$$
\log\lambda_i
=
\log e_i
+
\theta^\top x_i
$$

$\log e_i$ 作为固定系数为 1 的 offset，不参与训练。

这让模型预测单位暴露量的率，同时恢复到实际期望计数。

## Perceptron 收敛定理的直觉

![感知机错误次数上界中正确方向进展与参数范数增长的两条夹逼](/images/notes/cs229/tikz/concept-perceptron-mistake-bound.png)

假设存在单位向量 $w^\star$，所有样本满足：

$$
y_i(w^\star)^\top x_i
\ge
\gamma
>0
$$

且：

$$
\|x_i\|\le R
$$

感知机每次错分更新后，当前参数在 $w^\star$ 方向上的投影至少增加 $\gamma$。

另一方面，每次更新的参数范数增长受到 $R$ 限制。

比较“沿正确方向至少线性增长”和“总范数至多平方根增长”，可以推出错分更新次数上界：

$$
M
\le
\left(
\frac{R}{\gamma}
\right)^2
$$

间隔越大，收敛越快。数据不可分时 $\gamma$ 不存在，该保证失效。

## GLM 项目任务

在一个同时包含二分类与计数目标的数据集上：

1. 用逻辑回归预测二元事件；
2. 用 Poisson 回归预测计数；
3. 检查训练与验证 Deviance；
4. 检查计数均值—方差关系；
5. 尝试正则强度；
6. 绘制校准与残差；
7. 检查 offset 是否需要；
8. 与常数均值和树模型比较。

报告不能只列系数。应解释系数在 link scale 上的含义。

Poisson 系数 $\theta_j$ 表示特征增加一个单位时，期望计数率乘以：

$$
e^{\theta_j}
$$

逻辑回归系数则对应 odds 乘以 $e^{\theta_j}$。

## 补充练习

### 练习 5：Poisson 系数

某系数为 $\log1.5$，其他变量不变时，期望计数怎样变化？

答案：乘以 $1.5$。

### 练习 6：过度离散

验证数据中各条件分组的方差远高于均值，应检查什么？

答案思路：遗漏异质性、事件聚集、零膨胀，并考虑负二项等模型。

### 练习 7：暴露量

预测每家商店投诉数，但商店营业时长不同，应怎样处理？

答案：用营业时长作为 exposure，并把其对数作为 offset。

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
