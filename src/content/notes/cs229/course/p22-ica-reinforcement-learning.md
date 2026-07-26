---
title: P22：独立成分分析与强化学习导论
description: 对应 B 站 P22 与 CS229 Lecture 16，从盲源分离、ICA 密度变换进入序列决策、状态、动作与奖励。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 盲源分离

假设存在独立源信号：

$$
s\in\mathbb R^n
$$

观测是未知线性混合：

$$
x=As
$$

$A$ 是未知混合矩阵。ICA 希望仅根据观测 $x$ 找到解混矩阵：

$$
W\approx A^{-1}
$$

恢复：

$$
\hat s=Wx
$$

## ICA 与 PCA

PCA 寻找不相关的正交方向：

$$
\operatorname{Cov}(z_i,z_j)=0
$$

ICA 寻找统计独立成分：

$$
p(s)=\prod_ip(s_i)
$$

独立比不相关更强。非高斯分布下，零协方差不能保证独立。

PCA 常作为 ICA 的中心化和白化预处理，但不能取代独立性目标。

## ICA 的关键假设

- 源分量相互独立；
- 混合近似线性；
- 源数与观测数适合可逆或可识别；
- 至多一个源是 Gaussian。

如果多个源都是 Gaussian，旋转后的联合分布不变，无法仅靠独立性识别原方向。

## 不可辨识性

尺度不可辨识：

$$
As
=(Ac)(c^{-1}s)
$$

排列不可辨识：交换源顺序并交换 $A$ 对应列，观测不变。

因此 ICA 最多恢复到尺度和排列不确定性。评估时必须允许这两种等价变换。

## 密度线性变换

若：

$$
s=Wx
$$

根据变量变换：

$$
p_X(x)
=p_S(Wx)|\det W|
$$

源独立：

$$
p_S(s)=\prod_ip_{S_i}(s_i)
$$

因此：

$$
\log p_X(x)
=
\sum_i\log p_{S_i}(w_i^\top x)
+\log|\det W|
$$

第一项鼓励恢复分量符合假设的非高斯边缘分布；行列式项修正体积变化并防止退化缩放。

## ICA 学习

对数据最大化：

$$
\ell(W)
=\sum_{j}
\left[
\sum_i
\log p_{S_i}
\left(
w_i^\top x^{(j)}
\right)
+\log|\det W|
\right]
$$

梯度包含源密度 score function 与：

$$
(W^{-1})^\top
$$

实际算法常使用自然梯度或 FastICA，提高尺度不变性和收敛稳定性。

## 预处理与验证

通常先：

1. 去均值；
2. 白化，使协方差接近 $I$；
3. 运行 ICA；
4. 对齐尺度和排列；
5. 检查分量独立性与重构。

音频分离可以比较恢复波形；没有真源时，需要用独立性指标、稳定性和领域解释共同判断。

## 从表示学习转向决策

课程后半段从“从数据恢复结构”进入“通过行动影响未来”。

强化学习轨迹：

$$
s_0,a_0,r_0,s_1,a_1,r_1,\ldots
$$

智能体根据状态选择动作，环境返回奖励并转移。

## 状态

状态 $s_t$ 应包含预测未来所需的信息。

马尔可夫性质：

$$
P(s_{t+1}\mid s_t,a_t,\text{history})
=P(s_{t+1}\mid s_t,a_t)
$$

真实世界可能有记忆；建模要求把必要历史压缩进状态。

若仅观察位置而忽略速度，很多控制系统就不满足这个条件。

## 动作、奖励与策略

动作：

$$
a_t\in\mathcal A
$$

奖励：

$$
r_t=R(s_t,a_t)
$$

策略：

$$
\pi(a\mid s)
$$

指定在状态下选择动作的分布。

目标不是最大化当前奖励，而是长期回报：

$$
G_t
=\sum_{k=0}^{\infty}
\gamma^k r_{t+k}
$$

## 探索与利用

只选择当前认为最优的动作，可能永远无法发现更好策略；盲目探索又可能带来成本和风险。

探索策略必须与环境安全级别匹配。真实系统不能仅因算法需要数据，就允许危险动作。

离线强化学习还要处理数据覆盖：数据未包含的动作，其价值估计可能是不可验证的外推。

## 本节检查

- 能写出 ICA 混合与解混模型；
- 能区分 PCA 的不相关与 ICA 的独立；
- 能说明 ICA 为什么要求非高斯源；
- 能指出尺度和排列不可辨识性；
- 能用 Jacobian 写出观测密度；
- 能描述 ICA 的预处理和验证；
- 能定义状态、动作、奖励与策略；
- 能说明马尔可夫状态和探索风险。

下一节进入 [P23：MDP、价值迭代与策略迭代](/notes/cs229/course/p23-mdp-value-policy-iteration)。

## 来源说明

- 视频：[B 站 P22：Lecture 16](https://www.bilibili.com/video/BV1fP4y127nn/?p=22)
- ICA：[Lecture Notes 11](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes11.pdf)
- RL 导论：[Lecture Notes 12，第 1–3 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes12.pdf)
- 作业：[Problem Set 4](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS4/ps4.pdf)

中文内容对应本节从 ICA 结束到 RL 开始的课堂转折。
