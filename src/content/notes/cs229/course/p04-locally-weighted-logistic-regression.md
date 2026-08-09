---
title: P4：局部加权回归、逻辑回归与牛顿法
description: 对应 B 站 P4 与 CS229 Lecture 3，解释参数/非参数学习、局部加权回归、逻辑回归似然和牛顿法。
publishDate: 2026-07-26
updatedDate: 2026-08-08
language: zh
---

## 从参数模型到非参数模型

线性回归学习固定维度参数 $\theta$。训练完成后，原始训练集可以不再参与预测：

$$
h_\theta(x)=\theta^\top x
$$

这类方法称为参数方法。无论数据增加多少，参数数量都由特征维度决定。

非参数方法不意味着“没有参数”，而是模型复杂度可以随数据增加。局部加权回归在每个查询点附近重新拟合，因此预测仍依赖训练数据。

## 局部加权线性回归

对查询点 $x$，给训练样本分配权重：

$$
w^{(i)}
=\exp\left(
-\frac{\|x^{(i)}-x\|_2^2}{2\tau^2}
\right)
$$

然后求解：

$$
\theta(x)
=\arg\min_\theta
\frac12\sum_{i=1}^{m}
w^{(i)}
\left(
y^{(i)}-\theta^\top x^{(i)}
\right)^2
$$

离查询点越近的样本权重越大。得到 $\theta(x)$ 后，只用它预测当前查询点。

矩阵形式为：

$$
\theta(x)
=(X^\top WX)^{-1}X^\top Wy
$$

$W$ 是以 $w^{(i)}$ 为对角元素的矩阵。实现时仍应求解线性方程，不显式求逆。

## 带宽参数

$\tau$ 控制邻域大小：

- $\tau$ 很大：多数样本权重接近，模型接近全局线性回归；
- $\tau$ 很小：只依赖极少邻居，能追随局部变化，但方差增大；
- 查询点附近数据稀疏：$X^\top WX$ 可能病态。

$\tau$ 应通过验证集或交叉验证选择。训练误差会偏爱很小带宽，因此不能用训练拟合程度决定。

局部加权回归预测成本高，需要保存数据并重复求解；大数据场景常用近邻索引或局部近似降低计算量。

## 从回归进入分类

二分类目标：

$$
y\in\{0,1\}
$$

直接用线性回归预测会产生小于 $0$ 或大于 $1$ 的值，也不符合概率输出范围。

逻辑回归先计算线性分数：

$$
z=\theta^\top x
$$

再通过 Sigmoid：

$$
g(z)
=\frac{1}{1+e^{-z}}
$$

定义：

$$
h_\theta(x)
=P(y=1\mid x;\theta)
=g(\theta^\top x)
$$

输出位于 $(0,1)$，可以解释为条件概率。

## Sigmoid 与决策边界

Sigmoid 满足：

$$
g'(z)=g(z)(1-g(z))
$$

若采用阈值 $0.5$：

$$
h_\theta(x)\ge0.5
\Longleftrightarrow
\theta^\top x\ge0
$$

所以原始特征下决策边界是：

$$
\theta^\top x=0
$$

概率输出是非线性的，但边界仍由特征表示决定。加入多项式或其他基函数后，原输入空间中可以形成非线性边界。

## 伯努利似然

![逻辑回归从线性 logits、Sigmoid 概率到 Bernoulli 负对数似然的计算链](/images/notes/cs229/tikz/concept-logistic-likelihood.png)

给定 $x$，假设：

$$
y\mid x;\theta
\sim\operatorname{Bernoulli}(h_\theta(x))
$$

单样本概率可统一写成：

$$
p(y\mid x;\theta)
=h_\theta(x)^y
\left(1-h_\theta(x)\right)^{1-y}
$$

独立样本似然：

$$
L(\theta)
=\prod_{i=1}^{m}
h_\theta(x^{(i)})^{y^{(i)}}
\left(
1-h_\theta(x^{(i)})
\right)^{1-y^{(i)}}
$$

对数似然：

$$
\ell(\theta)
=\sum_{i=1}^{m}
\left[
y^{(i)}\log h_\theta(x^{(i)})
+(1-y^{(i)})
\log(1-h_\theta(x^{(i)}))
\right]
$$

最大化它等价于最小化二元交叉熵。

## 逻辑回归梯度

利用 Sigmoid 导数，可得到：

$$
\frac{\partial\ell}{\partial\theta_j}
=\sum_{i=1}^{m}
\left(
y^{(i)}-h_\theta(x^{(i)})
\right)x_j^{(i)}
$$

向量形式：

$$
\nabla_\theta\ell
=X^\top(y-h)
$$

若最小化负对数似然，梯度符号相反：

$$
\nabla_\theta J
=X^\top(h-y)
$$

公式看起来像线性回归，但误差来自概率模型，目标函数也不同。

## 数值稳定的损失实现

直接计算：

$$
\log g(z)
\quad\text{和}\quad
\log(1-g(z))
$$

在 $|z|$ 很大时可能产生上溢、下溢或 `log(0)`。

实际应使用 logits 形式的稳定交叉熵，例如：

$$
\max(z,0)-yz+\log(1+e^{-|z|})
$$

成熟框架的 `binary_cross_entropy_with_logits` 会处理这些细节。不要先算 Sigmoid 再把概率传给 logits 版本损失。

## 牛顿法

一维函数求根时，牛顿法用当前点的切线估计根：

$$
\theta
\leftarrow
\theta
-\frac{f(\theta)}{f'(\theta)}
$$

为了最大化 $\ell(\theta)$，寻找梯度为零的位置。多维牛顿更新为：

$$
\theta
\leftarrow
\theta-H^{-1}\nabla\ell(\theta)
$$

$H$ 是对数似然的 Hessian。

逻辑回归 Hessian：

$$
H=-X^\top RX
$$

其中：

$$
R_{ii}=h_i(1-h_i)
$$

负号说明对数似然是凹函数。最小化负对数似然时 Hessian 为 $X^\top RX\succeq0$。

## IRLS 视角

![Logistic 回归从线性分数、Sigmoid、似然、梯度和 Hessian 到 Newton 与 IRLS 的六步图解](/images/notes/cs229/storyboards/p04-logistic-newton-storyboard.png)

图中串起了概率建模到二阶更新的主线；正文继续解释 IRLS 等价关系和完全可分时的数值边界。

牛顿法更新可改写为迭代重加权最小二乘。每轮根据当前预测构造权重 $R$ 和工作响应，再解一个加权线性系统。

这揭示了两个性质：

- 高置信度概率接近 $0$ 或 $1$ 时，$h_i(1-h_i)$ 很小；
- 决策边界附近的样本对局部曲率影响更大。

不要显式求 Hessian 的逆，应解：

$$
H\Delta=\nabla\ell
$$

再更新 $\theta\leftarrow\theta-\Delta$。高维场景通常改用一阶或拟牛顿方法。

## 完全可分问题

若存在一个超平面把训练数据完全分开，无正则逻辑回归的似然可能通过不断放大 $\|\theta\|$ 接近上确界，却没有有限最大值。

表现包括：

- 参数绝对值持续增大；
- 训练分类完全正确；
- Hessian 越来越病态；
- 概率极端但泛化未必可靠。

$L_2$ 正则化可让目标具有有限解：

$$
J(\theta)
=-\ell(\theta)
+\frac{\lambda}{2}\|\theta\|_2^2
$$

通常不惩罚截距项。

## 局部加权回归的矩阵解

![局部加权回归的样本权重以及 Newton 法的曲率更新](/images/notes/cs229/tikz/p04-locally-weighted-newton.png)

对查询点 $x$，给第 $i$ 个训练样本权重：

$$
w^{(i)}
=
\exp\left(
-\frac{\|x^{(i)}-x\|_2^2}{2\tau^2}
\right)
$$

查询点越近，权重越大。带宽 $\tau$ 控制“局部”的范围。

加权目标为：

$$
J_x(\theta)
=
\frac12
\sum_{i=1}^{m}
w^{(i)}
\left(
y^{(i)}-\theta^\top x^{(i)}
\right)^2
$$

令：

$$
W=
\operatorname{diag}
\left(
w^{(1)},\ldots,w^{(m)}
\right)
$$

目标的矩阵形式为：

$$
J_x(\theta)
=
\frac12(X\theta-y)^\top W(X\theta-y)
$$

梯度为：

$$
\nabla_\theta J_x
=
X^\top W(X\theta-y)
$$

令梯度为零：

$$
\theta_x
=(X^\top WX)^{-1}X^\top Wy
$$

注意参数带下标 $x$。每次查询都会产生一组局部参数，因此它是非参数方法：训练阶段主要保存数据，预测阶段才执行拟合。

$\tau$ 很小时模型方差高，曲线容易追随噪声；$\tau$ 很大时所有权重接近相同，退化为普通线性回归。

## 从概率模型推导逻辑回归

对二分类目标 $y\in\{0,1\}$，假设：

$$
p(y=1\mid x;\theta)
=
h_\theta(x)
=
\sigma(\theta^\top x)
$$

$$
p(y=0\mid x;\theta)
=
1-h_\theta(x)
$$

两种情况可以合写：

$$
p(y\mid x;\theta)
=
h_\theta(x)^y
\left(1-h_\theta(x)\right)^{1-y}
$$

训练集对数似然：

$$
\ell(\theta)
=
\sum_{i=1}^{m}
\left[
y^{(i)}\log h_\theta(x^{(i)})
+
\left(1-y^{(i)}\right)
\log\left(1-h_\theta(x^{(i)})\right)
\right]
$$

对一个样本求导。由于：

$$
\sigma'(z)=\sigma(z)(1-\sigma(z))
$$

链式法则中的分母会与 Sigmoid 导数抵消，最终得到：

$$
\nabla_\theta\ell(\theta)
=
\sum_{i=1}^{m}
\left(
y^{(i)}-h_\theta(x^{(i)})
\right)x^{(i)}
$$

最大化似然的梯度上升为：

$$
\theta
\leftarrow
\theta
+
\alpha
X^\top(y-h)
$$

若改为最小化负对数似然，更新写成梯度下降，两者方向完全一致。

## 决策边界与概率

当阈值为 $0.5$：

$$
h_\theta(x)\ge0.5
\iff
\theta^\top x\ge0
$$

因此逻辑回归的决策边界是：

$$
\theta^\top x=0
$$

Sigmoid 是非线性的，但边界对原始特征仍是线性的。加入多项式或其他非线性特征后，边界才会在原输入空间中弯曲。

输出概率不等于天然可信。若训练数据采样比例与线上不同，或模型形式不正确，概率可能失准。应在独立数据上检查可靠性图和校准误差。

## Newton 法与 Hessian

单样本负对数似然的 Hessian 可以累加为：

$$
H
=
X^\top RX
$$

其中：

$$
R=
\operatorname{diag}
\left(
h^{(i)}(1-h^{(i)})
\right)
$$

因为 $R$ 的对角元素非负，$H$ 半正定，负对数似然是凸函数。

Newton 更新为：

$$
\theta
\leftarrow
\theta-H^{-1}\nabla J(\theta)
$$

实际实现应解线性方程：

$$
H\Delta=\nabla J(\theta),
\qquad
\theta\leftarrow\theta-\Delta
$$

不要显式构造 $H^{-1}$。

Newton 法利用曲率，靠近最优点时收敛快，但每轮需要形成或近似 Hessian。特征很多时，梯度法、L-BFGS 或共轭梯度通常更合适。

## 完全可分为什么会让参数发散

若存在方向 $\theta$ 能把所有正负样本严格分开，把参数放大为 $c\theta$ 会使每个训练概率更接近正确的 0 或 1。

当 $c\to\infty$ 时，对数似然不断接近上界，但有限参数处没有达到最大值。因此优化器可能表现为损失继续下降、参数范数不断增大。

常见解决方式是加入 $L_2$ 正则：

$$
J_\lambda(\theta)
=
-\ell(\theta)
+
\frac{\lambda}{2}\|\theta_{1:}\|_2^2
$$

通常不惩罚截距。正则项让目标具有有限最优解，也能降低方差。

## 数值实现模板

直接计算 $\log\sigma(z)$ 在 $z$ 很小时可能得到负无穷。稳定的二分类交叉熵可以写成：

$$
\operatorname{softplus}(z)-yz
$$

其中：

$$
\operatorname{softplus}(z)
=
\log(1+e^z)
$$

程序应使用库中稳定的 `logaddexp`、`softplus` 或“带 logits 的交叉熵”实现。

训练时记录：

- 负对数似然和正则项；
- 梯度范数与参数范数；
- 训练集和验证集的分类指标；
- 概率分布与阈值敏感性；
- 是否存在近乎完全分离。

## 练习与答案思路

### 练习 1：阈值对应的 logit

若业务阈值为 $p=0.8$，对应的线性分数是多少？

答案：

$$
\operatorname{logit}(0.8)
=
\log\frac{0.8}{0.2}
=
\log4
$$

所以预测为正类的条件是 $\theta^\top x\ge\log4$。

### 练习 2：比较两种回归

普通线性回归和局部加权回归在训练与预测成本上有什么差别？

答案思路：普通线性回归训练一次、预测便宜；局部加权回归主要保存数据，每个查询点都要重新计算权重并求解局部模型。

### 练习 3：推导梯度符号

对负对数似然写出梯度。

答案：

$$
\nabla J(\theta)=X^\top(h-y)
$$

若实现成 $X^\top(y-h)$ 却仍做梯度下降，更新方向会反。

### 练习 4：识别发散原因

训练损失缓慢下降，但参数范数持续增大、训练数据已完全分类，最可能是什么？

答案思路：数据近似完全可分且没有正则化。应检查分离情况并加入合适的正则约束。

## Logistic Loss 的几何与统计性质

用 $y\in\{-1,+1\}$ 表示标签，Logistic Loss 可写成：

$$
\ell(y,f)
=
\log(1+e^{-yf})
$$

$yf$ 是带符号间隔。

当 $yf$ 很大且为正，样本分类正确且置信度高，损失接近零。

当 $yf=0$，损失为 $\log2$。

当 $yf$ 为负，损失近似线性增长。

它不像 0–1 Loss 那样只看分类是否正确，还连续惩罚置信度不足与高置信错分，因此便于梯度优化。

Logistic Loss 是 0–1 Loss 的凸替代。优化它不能保证任何有限样本上直接最小化错误率，但在适当条件下具有分类一致性。

## $L_1$ 与 $L_2$ 正则

$L_2$ 正则目标：

$$
J(\theta)
=
\operatorname{NLL}(\theta)
+
\frac\lambda2\|\theta\|_2^2
$$

梯度增加：

$$
\lambda\theta
$$

它平滑压缩参数，改善共线与完全可分问题。

$L_1$ 正则：

$$
J(\theta)
=
\operatorname{NLL}(\theta)
+
\lambda\|\theta\|_1
$$

更容易得到稀疏系数，但零点不可微。常用坐标下降或近端梯度。

两种正则都要求特征尺度一致，否则参数惩罚不可比较。

若需要可解释系数，稀疏不等于因果，也不保证相关特征中的选择稳定。

## 多分类扩展

互斥 $K$ 类使用 Softmax：

$$
p(y=k\mid x)
=
\frac{
\exp(\theta_k^\top x)
}{
\sum_{j=1}^{K}
\exp(\theta_j^\top x)
}
$$

负对数似然：

$$
J(\Theta)
=
-\sum_i
\log
p(y^{(i)}\mid x^{(i)})
$$

梯度：

$$
\nabla_{\theta_k}J
=
\sum_i
\left[
p(y=k\mid x^{(i)})
-
\mathbf1\{y^{(i)}=k\}
\right]
x^{(i)}
$$

One-vs-Rest 也可训练 $K$ 个二分类器，但分数不一定归一化，类别之间独立训练。

Softmax 联合建模类别竞争，更适合互斥类别。多标签任务则使用每类独立 Sigmoid。

## 类别不平衡

若正类很少，默认阈值 $0.5$ 可能并不合适。

可使用类别加权负对数似然：

$$
J
=
-\sum_i
\left[
w_+y_i\log p_i
+
w_-(1-y_i)\log(1-p_i)
\right]
$$

权重改变训练关注与概率含义。加权后输出未必仍对应原始真实先验下的校准概率。

另一种方法保持概率模型训练，再根据业务成本选择阈值。

不应只用过采样后数据上的 Accuracy 评估。验证集应反映目标部署分布。

## 概率校准与阈值选择

校准检查：

```text
预测概率约 0.7 的样本中，真实正类是否约占 70%？
```

若排序好但校准差，可在独立校准集上使用 Platt Scaling 或 Isotonic Regression。

阈值选择要明确代价：

$$
\operatorname{Cost}(t)
=
C_{FP}FP(t)
+
C_{FN}FN(t)
$$

或明确约束，例如 Recall 至少 95% 时最大化 Precision。

阈值必须在验证集确定，测试集只报告最终结果。

## 局部加权回归的扩展实验

在一维非线性数据上比较：

```text
全局线性回归
多项式回归
局部加权回归
```

对多个 $\tau$ 绘制预测曲线。

观察：

- $\tau$ 很小时曲线如何跟随噪声；
- $\tau$ 很大时如何接近全局线性；
- 边界区域为何更不稳定；
- 样本密度低区域为何预测不可靠；
- 每个查询点求解的成本。

再用验证集选择 $\tau$，而不是凭曲线“看起来顺滑”决定。

## Logistic 回归项目验收

实现与报告应包含：

1. 稳定的 logits loss；
2. 向量化梯度；
3. 有限差分检查；
4. 梯度下降与成熟库对比；
5. $L_1/L_2$ 正则实验；
6. 参数范数和收敛曲线；
7. 混淆矩阵、ROC 与 PR；
8. 阈值—成本曲线；
9. 校准图；
10. 高置信错误样本分析。

额外检查完全可分数据，观察无正则时参数范数增长，再验证正则化怎样稳定解。

## 补充练习

### 练习 5：正则梯度

$L_2$ 正则 Logistic 目标的梯度是什么？

答案：

$$
X^\top(h-y)+\lambda\theta
$$

若截距不正则，应把对应分量排除。

### 练习 6：多标签任务

一张图片可同时包含猫和狗，应使用 Softmax 还是独立 Sigmoid？

答案：独立 Sigmoid，因为标签不互斥。

### 练习 7：类别加权

加权训练后是否仍应在平衡后的训练分布上选择生产阈值？

答案：不应。应在反映真实部署基率与成本的独立验证集上选择。

## 本节检查

- 能区分参数方法和非参数方法；
- 能写出局部加权回归目标并解释 $\tau$；
- 能从伯努利模型写出逻辑回归似然；
- 能推出 $X^\top(h-y)$ 梯度；
- 能说明概率输出与线性决策边界的关系；
- 能解释牛顿法如何使用 Hessian；
- 知道代码中如何稳定计算交叉熵；
- 能识别完全可分导致的参数发散。

下一节进入 [P5：感知机、指数族与 GLM](/notes/cs229/course/p05-perceptron-generalized-linear-models)。

## 来源说明

- 视频：[B 站 P4：Lecture 3](https://www.bilibili.com/video/BV1fP4y127nn/?p=4)
- 讲义：[Lecture Notes 1，第 13–21 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes1.pdf)
- 作业：[Problem Set 1](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS1/ps1.pdf)

中文内容按课堂顺序重构，并补充实现中的数值稳定与完全可分边界。
