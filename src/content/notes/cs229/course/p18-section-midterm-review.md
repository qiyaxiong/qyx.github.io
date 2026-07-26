---
title: P18：讨论课——期中复习
description: 对应 B 站 P18 和 2018-11-02 Discussion Section，按建模假设、目标、梯度、泛化和诊断串联期中前核心内容。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 复习不是重抄公式

期中复习的目标是看到问题后识别：

1. 输出变量是什么；
2. 概率或几何假设是什么；
3. 优化哪个目标；
4. 参数怎样求；
5. 怎样判断实现和泛化是否正确。

若只记最终更新式，题目稍改标签编码、损失缩放或矩阵布局就容易失去方向。

## 线性回归闭环

模型：

$$
h_\theta(x)=\theta^\top x
$$

目标：

$$
J(\theta)
=\frac12\|X\theta-y\|_2^2
$$

梯度：

$$
\nabla J
=X^\top(X\theta-y)
$$

正规方程：

$$
X^\top X\theta=X^\top y
$$

概率解释：若：

$$
y\mid x
\sim\mathcal N(\theta^\top x,\sigma^2)
$$

最大似然等价于最小二乘。

## 逻辑回归闭环

模型：

$$
P(y=1\mid x)
=\sigma(\theta^\top x)
$$

负对数似然：

$$
J
=-\sum_i
\left[
y_i\log h_i
+(1-y_i)\log(1-h_i)
\right]
$$

梯度：

$$
\nabla J=X^\top(h-y)
$$

Hessian：

$$
H=X^\top RX
$$

它半正定，因此负对数似然是凸函数。

## GLM 识别模板

看到新的输出分布：

1. 写成指数族；
2. 找到自然参数 $\eta$；
3. 令 $\eta=\theta^\top x$；
4. 用 $E[y\mid x]=a'(\eta)$ 得到响应函数；
5. 写出似然并求梯度。

Bernoulli 导出逻辑回归，Gaussian 导出线性回归，Poisson 导出指数均值。

## 生成式分类模板

建模：

$$
p(x\mid y)
\quad\text{和}\quad
p(y)
$$

预测：

$$
\arg\max_y
\left[
\log p(x\mid y)+\log p(y)
\right]
$$

GDA 使用连续高斯特征；Naive Bayes 常用于离散或文本特征。

答题时必须写清条件独立、共享协方差等假设。

## GDA 与逻辑回归比较

两者可产生相同形式的线性后验边界，但：

- GDA 最大化联合似然；
- 逻辑回归最大化条件似然；
- GDA 假设更强、参数有闭式估计；
- 逻辑回归对 $p(x)$ 误设更稳健。

比较模型时应从假设和数据量出发，而不是只比较边界形状。

## SVM 闭环

几何间隔：

$$
\gamma_i
=\frac{
y_i(w^\top x_i+b)
}{
\|w\|
}
$$

硬间隔原始问题：

$$
\min_{w,b}\frac12\|w\|^2
$$

$$
y_i(w^\top x_i+b)\ge1
$$

软间隔：

$$
\min
\frac12\|w\|^2+C\sum_i\xi_i
$$

对偶只包含内积，因此可替换为 Kernel。

## KKT 解题结构

写出：

- 原始可行性；
- 对偶可行性；
- 驻点；
- 互补松弛。

互补松弛：

$$
\alpha_i
\left[
y_if(x_i)-1+\xi_i
\right]
=0
$$

它连接了样本位置与对偶系数，是解释支持向量的关键。

## 偏差与方差

高偏差：

```text
训练误差高
验证误差也高
二者接近
```

高方差：

```text
训练误差低
验证误差明显更高
```

措施要对应诊断。高偏差时盲目增加数据可能收效有限；高方差时继续增加模型容量可能更糟。

## ERM 与泛化

经验风险：

$$
\hat\varepsilon(h)
$$

真风险：

$$
\varepsilon(h)
$$

有限假设类通过 Hoeffding 与 Union Bound 获得一致收敛；无限假设类使用 VC 维衡量有效复杂度。

结论不是“参数越少一定越好”，而是复杂度、样本量和允许误差必须匹配。

## 神经网络前向与反向

前向：

$$
Z^{[l]}
=W^{[l]}A^{[l-1]}+b^{[l]}
$$

$$
A^{[l]}=\phi(Z^{[l]})
$$

反向：

$$
dW^{[l]}
=\frac1m
dZ^{[l]}(A^{[l-1]})^\top
$$

$$
dA^{[l-1]}
=(W^{[l]})^\top dZ^{[l]}
$$

答题时先标 shape，能避免大部分转置错误。

## 常见推导错误

- 把最大化对数似然与最小化负对数似然的符号混淆；
- 忘记 $1/m$ 只改变梯度尺度；
- 把矩阵乘法写成逐元素乘法；
- 在乘积求导时漏掉链式法则；
- 把不相关当成独立；
- 把函数间隔当作几何距离；
- 忘记 Kernel 必须对应半正定 Gram 矩阵；
- 使用测试集选择超参数。

## 考试与实现共同检查法

对任何公式依次检查：

1. 维度是否正确；
2. 极端输入是否合理；
3. 符号是否符合优化方向；
4. 概率是否归一化；
5. 目标是否有界；
6. 特殊情况能否退化到熟悉模型；
7. 数值实现是否稳定。

## 本节检查

- 能从概率假设推回损失；
- 能独立推导线性与逻辑回归梯度；
- 能比较生成式与判别式学习；
- 能写出 SVM 原始/对偶结构与 KKT；
- 能用偏差/方差决定改进方向；
- 能解释 ERM 的泛化条件；
- 能写出神经网络前向和反向 shape；
- 能使用统一检查法发现推导错误。

下一节进入无监督学习：[P19：K-means、GMM 与 EM](/notes/cs229/course/p19-kmeans-gmm-em)。

## 来源说明

- 视频：[B 站 P18：Midterm Review Section](https://www.bilibili.com/video/BV1fP4y127nn/?p=18)
- 讲义：[Midterm Review，共 54 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/materials/cs229-mt-review.pdf)

中文内容按照期中知识依赖重新串联，不替代官方题目与课堂讲解。
