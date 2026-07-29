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

![反向传播经过激活函数和线性层的向量 Jacobian 乘积](/images/notes/cs229/tikz/p16-vjp-chain-rule.png)

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

![线性层反向传播中参数梯度与输入梯度的两条矩阵收缩路径](/images/notes/cs229/tikz/p16-backprop-shape-flow.png)

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

## 两层网络的矩阵反向传播

前向传播：

$$
Z^{[1]}
=
W^{[1]}X+b^{[1]}
$$

$$
A^{[1]}
=
g(Z^{[1]})
$$

$$
Z^{[2]}
=
W^{[2]}A^{[1]}+b^{[2]}
$$

假设输出层与交叉熵组合后：

$$
dZ^{[2]}
=
A^{[2]}-Y
$$

第二层参数梯度：

$$
dW^{[2]}
=
\frac1m
dZ^{[2]}(A^{[1]})^\top
$$

$$
db^{[2]}
=
\frac1m
\sum_{i=1}^{m}
dZ_i^{[2]}
$$

传播到隐藏激活：

$$
dA^{[1]}
=
(W^{[2]})^\top dZ^{[2]}
$$

通过激活函数：

$$
dZ^{[1]}
=
dA^{[1]}
\odot
g'(Z^{[1]})
$$

第一层参数梯度：

$$
dW^{[1]}
=
\frac1m
dZ^{[1]}X^\top
$$

$$
db^{[1]}
=
\frac1m
\sum_{i=1}^{m}
dZ_i^{[1]}
$$

每个梯度必须与对应参数形状完全相同。这个不变量比死记公式更可靠。

## 反向传播就是向量—Jacobian 乘积

若中间变量：

$$
u=f(v)
$$

损失为 $L(u)$，链式法则：

$$
\frac{\partial L}{\partial v}
=
\left(
\frac{\partial u}{\partial v}
\right)^\top
\frac{\partial L}{\partial u}
$$

自动微分通常不会显式构造完整 Jacobian，而是计算上游梯度与局部 Jacobian 的乘积。

反向模式自动微分适合标量损失和大量参数，因为一次反向遍历就能得到所有参数梯度。

`detach`、原地修改和不必要的数据类型转换可能切断或破坏计算图。梯度缺失时先检查图连接，而不是只调优化器。

## Xavier 与 He 初始化的方差推导

设一层线性组合：

$$
z_j
=
\sum_{i=1}^{n_{\text{in}}}
w_{ji}x_i
$$

若权重与输入独立、均值为零：

$$
\operatorname{Var}(z_j)
\approx
n_{\text{in}}
\operatorname{Var}(w_{ji})
\operatorname{Var}(x_i)
$$

要保持前向方差不变，可令：

$$
\operatorname{Var}(w_{ji})
\approx
\frac1{n_{\text{in}}}
$$

这是 Xavier 初始化的核心。

ReLU 大约把一半负激活置零，因此使用：

$$
\operatorname{Var}(w_{ji})
\approx
\frac2{n_{\text{in}}}
$$

得到 He 初始化。

这些是近似方差保持原则，不保证任何网络都不会爆炸或消失。仍需监控逐层激活和梯度分布。

## Momentum、RMSProp 与 Adam

普通梯度下降：

$$
\theta_t
=
\theta_{t-1}
-\alpha g_t
$$

Momentum 累积平滑方向：

$$
v_t
=
\beta v_{t-1}
+
(1-\beta)g_t
$$

$$
\theta_t
=
\theta_{t-1}
-\alpha v_t
$$

RMSProp 跟踪平方梯度：

$$
s_t
=
\beta s_{t-1}
+
(1-\beta)g_t^2
$$

$$
\theta_t
=
\theta_{t-1}
-
\alpha
\frac{g_t}{\sqrt{s_t}+\epsilon}
$$

Adam 同时维护一阶矩和二阶矩，并做初期偏差修正。

Adam 往往容易快速得到可用结果，但并不自动解决学习率、正则化和泛化问题。SGD with Momentum 在一些视觉任务中可能有更好最终泛化。

## Batch Normalization 的训练与推理

训练时对 mini-batch 激活计算均值和方差：

$$
\hat z
=
\frac{z-\mu_B}
{\sqrt{\sigma_B^2+\epsilon}}
$$

再学习缩放和平移：

$$
y=\gamma\hat z+\beta
$$

推理时不能依赖当前单样本 batch 统计，而使用训练期间维护的运行均值与方差。

因此 `train()` 和 `eval()` 模式错误会导致验证结果漂移。小 batch 时统计噪声大，可考虑 Layer Normalization 或 Group Normalization。

## Dropout 的期望保持

训练时生成掩码：

$$
m_j\sim\operatorname{Bernoulli}(q)
$$

Inverted Dropout：

$$
\tilde a_j
=
\frac{m_j}{q}a_j
$$

其条件期望：

$$
\mathbb E[\tilde a_j\mid a_j]
=
a_j
$$

所以推理时直接关闭 Dropout，无需再次缩放。

Dropout 是随机正则方法，不应在 BatchNorm 前后随意放置，也不一定适合所有架构。应通过验证实验决定。

## 梯度检查的完整协议

把所有参数展平为向量 $\theta$。第 $j$ 维中心差分：

$$
g_j^{\text{num}}
\approx
\frac{
J(\theta+\epsilon e_j)
-
J(\theta-\epsilon e_j)
}{
2\epsilon
}
$$

相对误差：

$$
\frac{
\|g^{\text{num}}-g^{\text{ana}}\|_2
}{
\|g^{\text{num}}\|_2
+
\|g^{\text{ana}}\|_2
+
10^{-12}
}
$$

检查时：

- 使用很小、确定的数据；
- 关闭 Dropout 和数据增强；
- 固定 BatchNorm 状态；
- 使用双精度；
- 避免刚好落在 ReLU 不可微点；
- 分层报告误差。

梯度检查计算昂贵，只用于开发和单元测试，不放进正式训练循环。

## 标准训练诊断

第一步，让模型过拟合一个很小 batch。失败说明模型、损失、梯度或更新有错误。

第二步，观察训练损失是否平滑下降，梯度和参数是否有限。

第三步，比较训练和验证曲线。两者都差可能是优化或高偏差；训练好验证差更像高方差或分布问题。

第四步，检查逐层激活均值、方差、零比例和梯度范数。

第五步，再调整学习率计划、正则、模型容量和数据增强。

## 练习与答案思路

### 练习 1：梯度形状

若 $W^{[2]}$ 为 $(10,64)$，则 $dW^{[2]}$ 应是什么形状？

答案：同样为 $(10,64)$。

### 练习 2：ReLU 导数

$z>0$ 与 $z<0$ 时 ReLU 导数分别是多少？

答案：分别为 $1$ 和 $0$；$z=0$ 处可选择一个合法次梯度。

### 练习 3：训练模式

验证时忘记调用 `eval()`，哪些层最可能导致结果不稳定？

答案：Dropout 和 Batch Normalization。

### 练习 4：小批量失败

模型无法过拟合 8 个样本，首先应增加训练数据吗？

答案：不应。先检查标签、前向、损失、梯度、学习率和参数更新。

## Mini-batch 梯度噪声

完整梯度：

$$
g
=
\frac1m
\sum_{i=1}^{m}
\nabla_\theta\ell_i
$$

Mini-batch 梯度：

$$
\hat g_B
=
\frac1{|B|}
\sum_{i\in B}
\nabla_\theta\ell_i
$$

若 batch 均匀采样，$\hat g_B$ 是完整梯度的无偏估计。

Batch 大，方向稳定、硬件利用好，但每个 epoch 更新次数少、显存需求高。

Batch 小，噪声大，可能帮助逃离狭窄区域，但吞吐和归一化统计可能变差。

学习率通常需要随 batch 大小调整，但线性缩放只是一条经验规则，必须通过 warmup 和验证确认。

## 学习率计划

Constant Learning Rate 简单，但后期可能在最优附近震荡。

Step Decay 在预定 epoch 降低。

Cosine Annealing：

$$
\alpha_t
=
\alpha_{\min}
+
\frac12
(\alpha_{\max}-\alpha_{\min})
\left(
1+\cos\frac{\pi t}{T}
\right)
$$

Warmup 从小学习率逐渐增大，减少训练初期大更新不稳定。

Reduce-on-Plateau 根据验证指标停滞降学习率，但对噪声敏感。

任何 schedule 都应记录实际每步学习率，避免配置与执行不一致。

## Weight Decay 与 $L_2$

普通 SGD 中，将 $L_2$ 正则梯度加入更新：

$$
\theta
\leftarrow
\theta
-
\alpha
(g+\lambda\theta)
$$

等价于：

$$
\theta
\leftarrow
(1-\alpha\lambda)\theta-\alpha g
$$

这表现为权重衰减。

在 Adam 等自适应优化器中，把 $\lambda\theta$ 混入梯度会被坐标缩放，通常不等同于直接 Weight Decay。

AdamW 将衰减与自适应梯度更新解耦。

偏置和归一化层缩放参数是否衰减，应根据架构和实践协议决定。

## Gradient Clipping

按范数裁剪：

$$
g
\leftarrow
g
\cdot
\min
\left(
1,
\frac{c}{\|g\|_2}
\right)
$$

当梯度范数超过阈值 $c$ 时缩放。

它常用于循环网络、长序列和不稳定 RL。

裁剪可以防止单步爆炸，但不应掩盖持续的数值问题。

记录裁剪发生比例。若几乎每步都裁剪，应检查学习率、初始化、损失尺度和数据异常。

## Label Smoothing

多分类 one-hot 标签可平滑为：

$$
y_k'
=
(1-\epsilon)y_k
+
\frac{\epsilon}{K}
$$

它抑制模型过度自信，并可改善泛化和校准。

但它会改变目标概率，对知识蒸馏、长尾类别和严格概率解释有影响。

$\epsilon$ 必须验证，不能把它当作总是有益的默认值。

## 混合精度训练

低精度可提高吞吐并降低显存。

Forward 和部分梯度使用 FP16/BF16，关键累积与参数主副本保留更高精度。

FP16 小梯度可能下溢，使用 Loss Scaling：

$$
L'=sL
$$

反向得到放大梯度，更新前再除以 $s$。

动态 Loss Scaling 在检测溢出后调整 $s$。

BF16 指数范围接近 FP32，通常更不易溢出，但有效尾数精度较低。

## Checkpoint 与恢复

完整 checkpoint 不只保存权重，还包括：

```text
优化器状态
学习率调度器
当前 epoch/step
随机数状态
混合精度 scaler
最佳验证指标
配置与代码版本
```

只加载权重后继续训练，Momentum 和 Adam 矩估计会丢失，轨迹可能改变。

定期测试从 checkpoint 恢复，而不是事故发生后才发现保存不完整。

## 训练稳定性实验

固定数据与模型，运行多个随机种子。

报告：

$$
\text{mean}\pm\text{std}
$$

以及最差种子。

若种子差异远大于方法改进，应先提高稳定性或增加重复实验。

比较优化器时统一搜索预算，不能只为新方法精调。

## 神经网络训练项目验收

基于 P14 网络完成：

1. 手写两层反向传播；
2. 梯度检查；
3. 与自动微分对比；
4. Xavier/He 初始化；
5. SGD、Momentum、Adam；
6. 学习率曲线；
7. Dropout 或 Weight Decay；
8. 小批量过拟合；
9. 多种子报告；
10. checkpoint 恢复测试。

保存激活和梯度直方图，解释至少一个失败实验。

## 补充练习

### 练习 5：裁剪

梯度范数 20，裁剪阈值 5，缩放因子是多少？

答案：$5/20=0.25$。

### 练习 6：AdamW

为什么 Adam 中 $L_2$ 梯度与 Weight Decay 不完全等价？

答案：正则梯度也会被自适应二阶矩坐标缩放，而解耦 Weight Decay 直接缩小参数。

### 练习 7：恢复训练

只保存模型权重能否精确恢复 Adam 训练轨迹？

答案：不能，还需要一阶/二阶矩、step、调度器和随机状态。

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
