---
title: P16：反向传播与神经网络训练改进
description: 对应 B 站 P16 与 CS229 Lecture 12，从链式法则推导反向传播，并解释初始化、优化、正则化与梯度检查。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 反向传播要解决什么

前向传播计算：

$$
J
\left(
W^{[1]},b^{[1]},\ldots,W^{[L]},b^{[L]}
\right)
$$

训练需要所有参数梯度。逐参数展开会重复大量中间计算。

反向传播是链式法则在计算图上的动态规划：复用后续节点对损失的局部梯度，从输出层向输入层传播。

## 计算图与局部导数

若：

$$
u=f(x),
\qquad
v=g(u),
\qquad
J=h(v)
$$

则：

$$
\frac{\partial J}{\partial x}
=
\frac{\partial J}{\partial v}
\frac{\partial v}{\partial u}
\frac{\partial u}{\partial x}
$$

每个节点只需知道上游梯度和自己的局部导数。

## 输出层误差

对 Sigmoid 加二元交叉熵，输出层 logits 梯度简化为：

$$
dZ^{[L]}
=A^{[L]}-Y
$$

Softmax 加多分类交叉熵也有相同形式：

$$
dZ^{[L]}
=\hat Y-Y
$$

这种简化来自输出激活与对数似然损失的配对结构。

## 线性层反向传播

前向：

$$
Z^{[l]}
=W^{[l]}A^{[l-1]}+b^{[l]}
$$

对 batch 大小 $m$：

$$
dW^{[l]}
=\frac1m
dZ^{[l]}
(A^{[l-1]})^\top
$$

$$
db^{[l]}
=\frac1m
\sum_{i=1}^{m}
dZ_{:,i}^{[l]}
$$

$$
dA^{[l-1]}
=(W^{[l]})^\top dZ^{[l]}
$$

具体转置方向取决于样本按行还是按列，但维度必须闭合。

## 激活层反向传播

若：

$$
A^{[l]}=\phi(Z^{[l]})
$$

则：

$$
dZ^{[l]}
=dA^{[l]}
\odot
\phi'(Z^{[l]})
$$

$\odot$ 表示逐元素乘法。

ReLU 导数在正区间为 $1$、负区间为 $0$。零点导数可约定为 $0$。

## 反向传播顺序

每层执行：

1. 从后一层得到 $dA^{[l]}$；
2. 通过激活函数得到 $dZ^{[l]}$；
3. 计算 $dW^{[l]}$ 与 $db^{[l]}$；
4. 计算并传递 $dA^{[l-1]}$。

更新参数必须等所有梯度计算完成后再统一执行，避免后层反传时使用已修改权重。

## 梯度消失与爆炸

深层链式法则会反复乘权重矩阵与激活导数。

若这些因子的典型尺度小于 $1$，梯度随层数指数缩小；大于 $1$ 时可能爆炸。

表现包括：

- 前层梯度接近零；
- 损失不下降；
- 参数或激活出现 `NaN`；
- 不同层梯度范数相差多个数量级。

## 初始化

Xavier 初始化适合 Tanh 等近似对称激活：

$$
\operatorname{Var}(W_{ij})
\approx\frac{1}{n_{\mathrm{in}}}
$$

He 初始化适合 ReLU：

$$
\operatorname{Var}(W_{ij})
\approx\frac{2}{n_{\mathrm{in}}}
$$

目标是让前向激活和反向梯度在各层保持合理尺度。

## 优化方法

普通梯度下降：

$$
\theta_{t+1}
=\theta_t-\alpha g_t
$$

Momentum：

$$
v_t=\beta v_{t-1}+(1-\beta)g_t
$$

$$
\theta_{t+1}
=\theta_t-\alpha v_t
$$

Adam 同时维护一阶与二阶矩估计，为不同参数调整步长。

优化器能改善搜索过程，但不能修复标签错误、损失不匹配或数据泄漏。

## Batch Normalization

BatchNorm 对 mini-batch 激活标准化，再学习缩放与平移：

$$
\hat z
=\frac{z-\mu_B}
\sqrt{\sigma_B^2+\epsilon}
$$

$$
y=\gamma\hat z+\beta
$$

训练和推理使用的统计量不同。忘记切换 `train/eval` 模式会造成线上结果漂移。

## Dropout

训练时随机屏蔽激活：

$$
\tilde a
=\frac{m\odot a}{1-p}
$$

$m$ 是 Bernoulli mask，$p$ 是丢弃概率。

推理时不再随机丢弃。反向传播必须使用与前向相同的 mask。

## 梯度检查

对参数展开后的第 $j$ 维：

$$
g_j^{\mathrm{num}}
\approx
\frac{
J(\theta+\epsilon e_j)
-J(\theta-\epsilon e_j)
}{
2\epsilon
}
$$

相对误差：

$$
\frac{
\|g^{\mathrm{num}}-g^{\mathrm{backprop}}\|
}{
\|g^{\mathrm{num}}\|
+\|g^{\mathrm{backprop}}\|
+\varepsilon
}
$$

梯度检查只在小网络、小 batch 和无随机层状态下运行；它太慢，不用于正常训练。

## 训练诊断顺序

1. 检查输入与标签；
2. 检查各层 shape 和有限值；
3. 关闭正则化，在极小数据集上过拟合；
4. 做数值梯度检查；
5. 记录每层激活与梯度分布；
6. 再调学习率、优化器和正则化；
7. 最后扩大数据和模型。

如果连 20 个样本都无法拟合，优先怀疑实现、目标或优化，而不是泛化。

## 本节检查

- 能把反向传播解释为链式法则的复用；
- 能写出线性层的 $dW$、$db$ 和 $dA$；
- 能解释输出层梯度为何常简化为预测减标签；
- 能识别梯度消失与爆炸；
- 能选择 Xavier 或 He 初始化；
- 能说明 BatchNorm 训练/推理差异；
- 能正确处理 Dropout mask；
- 能用小网络完成梯度检查和过拟合测试。

下一节进入 [P17：机器学习调试与误差分析](/notes/cs229/course/p17-ml-debugging-error-analysis)。

## 来源说明

- 视频：[B 站 P16：Lecture 12](https://www.bilibili.com/video/BV1fP4y127nn/?p=16)
- 主讲义：[Deep Learning Notes，第 8–16 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes-deep_learning.pdf)
- 补充推导：[Backpropagation Notes](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes-backprop.pdf)
- 作业：[Problem Set 3](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS3/ps3.pdf)

中文内容对应反向传播与训练改进，并加入可执行诊断顺序。
