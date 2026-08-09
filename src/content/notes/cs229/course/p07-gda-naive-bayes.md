---
title: P7：高斯判别分析与朴素贝叶斯
description: 对应 B 站 P7 与 CS229 Lecture 5，从判别式和生成式学习的差别，推导 GDA、Naive Bayes 与文本事件模型。
publishDate: 2026-07-26
updatedDate: 2026-08-08
language: zh
---

## 判别式与生成式学习

逻辑回归直接学习：

$$
P(y\mid x)
$$

这属于判别式学习。它关注给定输入后类别的条件分布。

生成式学习分别建模：

$$
P(x\mid y)
\quad\text{和}\quad
P(y)
$$

再用 Bayes 公式：

$$
P(y\mid x)
=\frac{P(x\mid y)P(y)}{P(x)}
$$

分类时只需比较：

$$
\arg\max_yP(x\mid y)P(y)
$$

因为分母 $P(x)$ 对所有类别相同。

## 多元高斯

高斯判别分析假设每一类的特征服从多元高斯：

$$
x\mid y=k
\sim\mathcal N(\mu_k,\Sigma)
$$

密度：

$$
p(x\mid y=k)
=\frac{1}{
(2\pi)^{n/2}|\Sigma|^{1/2}
}
\exp\left(
-\frac12
(x-\mu_k)^\top
\Sigma^{-1}
(x-\mu_k)
\right)
$$

$\mu_k$ 是类别中心，$\Sigma$ 描述各方向尺度和特征相关性。

## GDA 模型

![生成式分类从类先验与类条件分布、GDA 参数估计到朴素贝叶斯和平滑的六步图解](/images/notes/cs229/storyboards/p07-generative-classification-storyboard.png)

这张图把 GDA 与 Naive Bayes 放进同一条生成式主线；后文分别补足高斯边界推导和文本事件模型。

二分类 GDA 假设：

$$
y\sim\operatorname{Bernoulli}(\phi)
$$

$$
x\mid y=0\sim\mathcal N(\mu_0,\Sigma)
$$

$$
x\mid y=1\sim\mathcal N(\mu_1,\Sigma)
$$

训练最大化联合似然：

$$
L(\phi,\mu_0,\mu_1,\Sigma)
=\prod_{i=1}^{m}
p(x^{(i)}\mid y^{(i)})
p(y^{(i)})
$$

## GDA 的最大似然估计

类别先验：

$$
\phi
=\frac1m
\sum_{i=1}^{m}\mathbf1\{y^{(i)}=1\}
$$

类别均值：

$$
\mu_k
=
\frac{
\sum_i\mathbf1\{y^{(i)}=k\}x^{(i)}
}{
\sum_i\mathbf1\{y^{(i)}=k\}
}
$$

共享协方差：

$$
\Sigma
=\frac1m
\sum_{i=1}^{m}
\left(
x^{(i)}-\mu_{y^{(i)}}
\right)
\left(
x^{(i)}-\mu_{y^{(i)}}
\right)^\top
$$

这些都是闭式估计，不需要梯度下降。

## 为什么边界是线性的

比较两个类别的对数后验比：

$$
\log
\frac{P(y=1\mid x)}{P(y=0\mid x)}
$$

共享 $\Sigma$ 使二次项 $x^\top\Sigma^{-1}x$ 抵消，最终只剩：

$$
\theta^\top x+\theta_0
$$

因此 GDA 的后验可写成 Sigmoid 形式，决策边界为线性。

如果每个类别使用不同协方差 $\Sigma_k$，二次项不再抵消，会得到二次判别边界。

## GDA 与逻辑回归

GDA 对联合分布作更强假设。若高斯与共享协方差假设接近真实，它能更有效利用少量数据。

逻辑回归只建模 $P(y\mid x)$，假设更弱。在生成分布明显偏离高斯时，通常更稳健。

两者都可能形成线性边界，但这不表示学习过程相同：

- GDA 拟合类先验、均值和协方差；
- 逻辑回归直接拟合条件对数几率；
- GDA 能计算 $p(x)$ 相关量并生成特征；
- 逻辑回归更专注分类边界。

## 离散特征与 Naive Bayes

文本特征常是离散变量。Naive Bayes 假设给定类别后，各特征条件独立：

$$
p(x\mid y)
=\prod_{j=1}^{n}p(x_j\mid y)
$$

于是：

$$
p(y\mid x)
\propto
p(y)
\prod_{j=1}^{n}p(x_j\mid y)
$$

“Naive” 指条件独立假设很强，不代表算法没有价值。即使概率估计不完全正确，分类边界仍可能很好。

## Bernoulli 文本事件模型

词表大小为 $n$，用：

$$
x_j\in\{0,1\}
$$

表示第 $j$ 个词是否出现。

估计：

$$
\phi_{j\mid y=1}
=P(x_j=1\mid y=1)
$$

预测时累加对数概率：

$$
\log p(y)
+\sum_j\log p(x_j\mid y)
$$

使用对数避免许多小概率连乘下溢。

## Multinomial 事件模型

另一种表示把文档看作词序列或词频，建模每次词出现来自类别相关的多项分布。

与 Bernoulli 模型相比：

- Bernoulli 关心“词是否出现”；
- Multinomial 关心“词出现多少次”；
- 长文档中的重复词会在 Multinomial 中产生更强影响。

模型选择应通过验证集，而不是仅凭文本直觉。

## 拉普拉斯平滑预告

若训练集中某个类别从未出现某个词，最大似然估计给出零概率，整个文档似然会因一次未见事件变为零。

下一节会使用拉普拉斯平滑：

$$
\hat\phi
=\frac{\text{count}+\alpha}
{\text{total}+\alpha K}
$$

给未见事件保留非零概率。

## 实现检查

- 对协方差增加小的对角正则项以改善数值稳定；
- 不显式求 $\Sigma^{-1}$，使用线性方程或 Cholesky；
- 在对数空间计算 Naive Bayes 分数；
- 只用训练集构建词表，避免数据泄漏；
- 类别严重不平衡时检查先验和每类召回率；
- 用校准曲线单独评价概率质量。

## GDA 的判别函数完整推导

GDA 假设：

$$
y\sim\operatorname{Bernoulli}(\phi)
$$

$$
x\mid y=0
\sim
\mathcal N(\mu_0,\Sigma)
$$

$$
x\mid y=1
\sim
\mathcal N(\mu_1,\Sigma)
$$

由 Bayes 公式：

$$
p(y=1\mid x)
=
\frac{
p(x\mid y=1)p(y=1)
}{
p(x\mid y=0)p(y=0)
+
p(x\mid y=1)p(y=1)
}
$$

考虑后验 odds 的对数：

$$
\log
\frac{p(y=1\mid x)}
{p(y=0\mid x)}
=
\log
\frac{p(x\mid y=1)\phi}
{p(x\mid y=0)(1-\phi)}
$$

代入两个 Gaussian 密度。因为协方差相同，两个二次项中的 $x^\top\Sigma^{-1}x$ 抵消，只剩关于 $x$ 的线性项：

$$
\log
\frac{p(y=1\mid x)}
{p(y=0\mid x)}
=
\theta^\top x+\theta_0
$$

其中：

$$
\theta
=
\Sigma^{-1}(\mu_1-\mu_0)
$$

$$
\theta_0
=
-\frac12
\mu_1^\top\Sigma^{-1}\mu_1
+
\frac12
\mu_0^\top\Sigma^{-1}\mu_0
+
\log\frac{\phi}{1-\phi}
$$

因此：

$$
p(y=1\mid x)
=
\sigma(\theta^\top x+\theta_0)
$$

GDA 虽然从联合分布出发，最终也产生逻辑形式的后验概率。

若两个类别使用不同协方差 $\Sigma_0$ 和 $\Sigma_1$，二次项不再抵消，边界会变成二次曲面。这称为 Quadratic Discriminant Analysis。

## GDA 参数的最大似然估计

类别先验：

$$
\hat\phi
=
\frac1m\sum_{i=1}^{m}
\mathbf1\{y^{(i)}=1\}
$$

类别均值：

$$
\hat\mu_0
=
\frac{
\sum_i
\mathbf1\{y^{(i)}=0\}x^{(i)}
}{
\sum_i
\mathbf1\{y^{(i)}=0\}
}
$$

$$
\hat\mu_1
=
\frac{
\sum_i
\mathbf1\{y^{(i)}=1\}x^{(i)}
}{
\sum_i
\mathbf1\{y^{(i)}=1\}
}
$$

共享协方差：

$$
\hat\Sigma
=
\frac1m
\sum_{i=1}^{m}
\left(
x^{(i)}-\mu_{y^{(i)}}
\right)
\left(
x^{(i)}-\mu_{y^{(i)}}
\right)^\top
$$

每个样本相对于自己类别均值计算偏差，再汇总估计共同的类内协方差。

高维小样本时 $\hat\Sigma$ 可能奇异。可使用对角协方差、收缩估计：

$$
\Sigma_\lambda
=(1-\lambda)\hat\Sigma+\lambda I
$$

或先降维。

## GDA 与逻辑回归如何选择

GDA 对 $p(x\mid y)$ 作较强 Gaussian 假设。假设近似成立时，它可以用较少样本高效估计。

逻辑回归直接建模 $p(y\mid x)$，对输入分布假设更少。数据量增加后，它往往更稳健。

两者比较不能只背“生成式与判别式”。应检查：

- 类条件分布是否近似椭球形；
- 各类是否可共享协方差；
- 样本量相对特征维度是否足够；
- 是否需要生成或处理缺失特征；
- 概率校准和决策边界哪个更重要。

## Naive Bayes 的对数判别

![Naive Bayes 将各特征条件似然沿特征轴累加为类别 log-score](/images/notes/cs229/tikz/p07-naive-bayes-log-score.png)

对离散特征 $x=(x_1,\ldots,x_n)$，朴素条件独立假设：

$$
p(x\mid y)
=
\prod_{j=1}^{n}
p(x_j\mid y)
$$

分类时比较：

$$
\hat y
=
\arg\max_y
p(y)\prod_jp(x_j\mid y)
$$

在对数空间：

$$
\hat y
=
\arg\max_y
\left[
\log p(y)
+
\sum_j\log p(x_j\mid y)
\right]
$$

这样把乘法变为加法，避免小概率连乘下溢。

条件独立通常不完全真实。例如文本中的词语明显相关，但模型仍可能有很好的分类边界。分类所需的是各类别分数的相对大小，不一定要求完整联合分布完美。

## Bernoulli 与 Multinomial 文本模型

Bernoulli 事件模型只关心词是否出现：

$$
x_j\in\{0,1\}
$$

似然同时包含出现和未出现的词：

$$
p(x\mid y)
=
\prod_j
\phi_{j\mid y}^{x_j}
(1-\phi_{j\mid y})^{1-x_j}
$$

Multinomial 事件模型关心每个词出现多少次。文档可以表示为词频向量，类别条件参数表示该类文本生成各词的概率。

短文本中“是否出现”可能足够；长文档或主题识别中，词频通常更有信息。应通过验证集选择，而不是凭名称决定。

## 拉普拉斯平滑的贝叶斯解释

若某词从未在某类训练样本出现，MLE 给它概率零。一个未见词会使整篇文档似然变零。

对 $K$ 个离散结果，加一平滑：

$$
\hat\phi_k
=
\frac{N_k+1}{N+K}
$$

它等价于在计数前为每个结果加入一个伪计数，也可解释为对多项分布参数使用对称 Dirichlet 先验。

更一般的加 $\alpha$ 平滑：

$$
\hat\phi_k
=
\frac{N_k+\alpha}{N+K\alpha}
$$

$\alpha$ 越大，估计越靠近均匀分布；数据越多，先验影响越弱。

## 一个小型垃圾邮件例子

词表只有“优惠”和“会议”。垃圾邮件类中观察到 8 次“优惠”、2 次“会议”；正常邮件类中分别为 1 次和 9 次。

加一平滑后：

$$
p(\text{优惠}\mid spam)=\frac{9}{12}
$$

$$
p(\text{优惠}\mid normal)=\frac{2}{12}
$$

新邮件中“优惠”出现较多时，spam 类的对数似然增加更快。

实际系统还要考虑停用词、未知词、词表冻结、类别不平衡和阈值。任何预处理都只能在训练集上拟合。

## 练习与答案思路

### 练习 1：边界形状

GDA 两类共享协方差时边界为什么是线性的？

答案思路：对数 Gaussian 密度中的共同二次项 $x^\top\Sigma^{-1}x$ 相互抵消，只留下线性项和常数项。

### 练习 2：协方差奇异

当特征数大于样本数时，GDA 的协方差估计可能出现什么问题？

答案：样本协方差秩不足、不可逆。可用对角协方差、收缩、正则化或降维。

### 练习 3：零概率

为什么 Naive Bayes 必须平滑？

答案：任何一个条件概率为零都会让整条特征似然乘积为零，使其他证据全部失效。

### 练习 4：模型比较

若输入明显非 Gaussian、样本充足且只关心分类，应优先尝试 GDA 还是逻辑回归？

答案思路：优先逻辑回归，并用验证集与适当基线比较；它不需要正确建模输入分布。

## 生成式模型怎样处理缺失特征

生成式模型给出联合或类条件分布，因此可以对缺失变量积分。

把特征分为已观察 $x_O$ 和缺失 $x_M$。分类需要：

$$
p(y\mid x_O)
\propto
p(y)p(x_O\mid y)
$$

其中：

$$
p(x_O\mid y)
=
\int
p(x_O,x_M\mid y)
\,dx_M
$$

Gaussian 的边缘分布仍是 Gaussian，只需取对应均值子向量与协方差子矩阵。

Naive Bayes 在条件独立假设下，可以直接忽略未观察特征对应的似然因子。

这不表示缺失机制可以不管。若“是否缺失”本身与标签或决策流程有关，应把缺失指示作为信息，并检查训练与线上缺失模式。

## 生成式模型与半监督学习

有标签数据：

$$
\{(x^{(i)},y^{(i)})\}
$$

无标签数据：

$$
\{x^{(j)}\}
$$

生成式模型可以用无标签样本的边缘似然：

$$
p(x)
=
\sum_y
p(y)p(x\mid y)
$$

共同估计输入分布参数。

若生成假设正确，无标签数据可能改善估计；若模型对 $p(x)$ 的假设错误，大量无标签数据也可能把决策边界推向错误方向。

半监督不是“免费增加训练数据”。必须与只使用有标签数据的判别式基线比较。

## GDA 的概率校准

GDA 后验依赖类条件 Gaussian 和类别先验。

若部署基率从 $\phi_{\text{train}}$ 变为 $\phi_{\text{deploy}}$，即使 $p(x\mid y)$ 不变，后验也会改变。

可以调整先验 odds：

$$
\operatorname{logit}
p_{\text{deploy}}(y=1\mid x)
=
\operatorname{logit}
p_{\text{train}}(y=1\mid x)
+
\log
\frac{
\phi_{\text{deploy}}/(1-\phi_{\text{deploy}})
}{
\phi_{\text{train}}/(1-\phi_{\text{train}})
}
$$

该修正依赖“只发生 prior shift”的假设。若类条件分布也变了，需重新估计或更完整漂移处理。

## Naive Bayes 的高维稀疏实现

文本词表可能有数十万维。不能构造稠密文档—词矩阵。

使用稀疏计数矩阵，只存非零词频。

训练时统计每类词计数与文档数，得到 log prior 和 log conditional probabilities。

预测时计算：

$$
\log p(y)
+
x^\top
\log\phi_y
$$

稀疏矩阵乘法只访问出现的词。

Multinomial NB 的训练与预测几乎是线性扫描非零项，因此常是文本分类强基线。

## 文本特征的边界

词袋忽略词序。“not good”和“good”可能共享大部分词。

可增加 bigram、字符 n-gram 或领域词典，但维度和稀疏性会上升。

停用词不一定应该删除。在作者识别、情感和风格任务中，功能词可能有信息。

词表只能从训练集构建。验证和测试中的新词映射到未知标记或被忽略。

特征选择也必须在训练 fold 内完成。

## 生成式分类项目

在同一二分类数据上实现：

```text
逻辑回归
GDA
Bernoulli Naive Bayes
Multinomial Naive Bayes
```

连续表格数据比较 GDA 与逻辑回归；文本数据比较两种事件模型。

报告：

- 训练样本量变化下的学习曲线；
- 生成假设检查；
- 协方差条件数；
- 平滑强度；
- 概率校准；
- 类别先验变化；
- 错误样本。

重点不是宣布某类模型永远更好，而是说明数据假设与样本量怎样决定结果。

## 补充练习

### 练习 5：不同协方差

若 $\Sigma_0\ne\Sigma_1$，GDA 的决策边界通常是什么形状？

答案：二次边界，因为 $x^\top\Sigma_k^{-1}x$ 项不再抵消。

### 练习 6：先验变化

垃圾邮件比例显著下降，但词条件分布不变，应该检查什么？

答案：更新类别先验并重新校准后验和阈值。

### 练习 7：半监督风险

为什么无标签数据可能伤害生成式分类？

答案：若 $p(x\mid y)$ 模型错误，无标签边缘似然会强化错误分布假设。

## 生成式模型上线检查

训练产物不仅包含分类参数，还包含：

```text
类别先验
类别均值
协方差结构
词表
平滑参数
未知词规则
预处理版本
```

线上监控类别先验和类条件特征分布。

若：

$$
p_{\text{online}}(y)
\ne
p_{\text{train}}(y)
$$

后验与阈值都可能失准。

若：

$$
p_{\text{online}}(x\mid y)
\ne
p_{\text{train}}(x\mid y)
$$

只修正先验不够。

Naive Bayes 还要监控未知词比例。未知词突然增多可能表示新主题、编码变化或词表过旧。

GDA 要监控 Mahalanobis 距离与协方差条件数。大量样本远离所有类均值时，分类概率不应被盲目信任。

## 讲义对照阅读路线

Lecture Notes 2 按：

```text
生成式/判别式
多元 Gaussian
GDA
Naive Bayes
事件模型
```

阅读 GDA 时完整展开两类 log-density，亲自划掉共同二次项。

阅读 Naive Bayes 时在三词词表上手算先验、平滑和 log-score。

最后用同一数据比较生成式与逻辑回归学习曲线，观察小样本与模型错设下的差异。

## 补充练习

### 练习 8：未知词

线上未知词比例突然从 1% 升到 30%，最可能提示什么？

答案：数据或主题分布变化、分词/编码管道变化，需先定位而非只重调平滑。

### 练习 9：远离均值

样本远离两个 GDA 类分布，但后验仍接近 1，能否认为绝对可信？

答案：不能。后验是类间相对概率，两个类都低密度时仍可极端。

## 本节检查

- 能区分判别式和生成式学习；
- 能写出 GDA 的生成假设与闭式参数估计；
- 能解释共享协方差为何产生线性边界；
- 能比较 GDA 和逻辑回归的假设强弱；
- 能写出 Naive Bayes 条件独立分解；
- 能区分 Bernoulli 与 Multinomial 文本模型；
- 能说明零计数为什么需要平滑；
- 能在对数空间实现稳定预测。

下一节进入 [P8：支持向量机](/notes/cs229/course/p08-support-vector-machines)。

## 来源说明

- 视频：[B 站 P7：Lecture 5](https://www.bilibili.com/video/BV1fP4y127nn/?p=7)
- 讲义：[Lecture Notes 2](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes2.pdf)
- 作业：[Problem Set 1](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS1/ps1.pdf)

中文内容对应 GDA、Naive Bayes 与文本事件模型的课堂主线。
