---
title: P23：MDP、价值迭代与策略迭代
description: 对应 B 站 P23 与 CS229 Lecture 17，从马尔可夫决策过程、价值函数和 Bellman 方程推导价值迭代与策略迭代。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 马尔可夫决策过程

MDP 通常写作：

$$
(\mathcal S,\mathcal A,\{P_{sa}\},\gamma,R)
$$

其中：

- $\mathcal S$：状态集合；
- $\mathcal A$：动作集合；
- $P_{sa}(s')$：转移概率；
- $R(s,a)$：即时奖励；
- $\gamma\in[0,1)$：折扣因子。

马尔可夫性质：

$$
P(s_{t+1}\mid s_t,a_t,\text{history})
=P(s_{t+1}\mid s_t,a_t)
$$

## 策略

确定性策略：

$$
a=\pi(s)
$$

随机策略：

$$
\pi(a\mid s)
$$

策略不是单次动作，而是对所有可能状态的决策规则。

## 折扣回报

从时刻 $t$ 开始：

$$
G_t
=\sum_{k=0}^{\infty}
\gamma^kr_{t+k}
$$

$\gamma$ 同时表达未来奖励权重，并保证有界奖励下无限和收敛。

较小 $\gamma$ 更短视；接近 $1$ 时长期后果更重要，价值传播也更慢。

## 策略价值函数

$$
V^\pi(s)
=E_\pi
\left[
\sum_{t=0}^{\infty}
\gamma^tR(s_t,a_t)
\mid s_0=s
\right]
$$

分离第一步：

$$
V^\pi(s)
=
R(s,\pi(s))
+\gamma
\sum_{s'}
P_{s,\pi(s)}(s')
V^\pi(s')
$$

这是策略 Bellman 方程。

## 动作价值函数

$$
Q^\pi(s,a)
=R(s,a)
+\gamma
\sum_{s'}P_{sa}(s')
V^\pi(s')
$$

$V^\pi$ 评价状态；$Q^\pi$ 评价在状态先执行某动作、之后遵循策略的回报。

两者关系：

$$
V^\pi(s)
=Q^\pi(s,\pi(s))
$$

## 最优价值函数

$$
V^*(s)
=\max_\pi V^\pi(s)
$$

Bellman 最优方程：

$$
V^*(s)
=\max_a
\left[
R(s,a)
+\gamma
\sum_{s'}
P_{sa}(s')
V^*(s')
\right]
$$

最优策略：

$$
\pi^*(s)
=\arg\max_a
\left[
R(s,a)
+\gamma
\sum_{s'}
P_{sa}(s')
V^*(s')
\right]
$$

## 价值迭代

从任意 $V_0$ 开始：

$$
V_{k+1}(s)
=\max_a
\left[
R(s,a)
+\gamma
\sum_{s'}
P_{sa}(s')
V_k(s')
\right]
$$

当 $\gamma<1$ 时，Bellman 最优算子是最大范数下的压缩映射：

$$
\|TV-TU\|_\infty
\le\gamma
\|V-U\|_\infty
$$

因此迭代收敛到唯一不动点 $V^*$。

## 同步与异步更新

同步价值迭代使用旧 $V_k$ 计算全部新状态值，再整体替换。

异步更新可以立即使用刚更新的状态值，也可只更新部分状态。

只要更新覆盖满足条件，异步方法也能收敛，并可能利用状态访问结构更快传播价值。

## 策略评估

固定策略 $\pi$：

$$
V^\pi=R^\pi+\gamma P^\pi V^\pi
$$

因此：

$$
(I-\gamma P^\pi)V^\pi=R^\pi
$$

可直接解线性方程，也可迭代：

$$
V_{k+1}(s)
=R(s,\pi(s))
+\gamma
\sum_{s'}
P_{s,\pi(s)}(s')V_k(s')
$$

## 策略改进

根据当前 $V^\pi$：

$$
\pi_{\mathrm{new}}(s)
=\arg\max_a
\left[
R(s,a)
+\gamma
\sum_{s'}
P_{sa}(s')
V^\pi(s')
\right]
$$

若策略不变，则当前策略已最优。

## 策略迭代

反复执行：

1. 策略评估；
2. 策略改进。

每次改进不会降低价值。有限状态和动作下，策略数量有限，因此最终停止在最优策略。

价值迭代把评估与改进混合在每次 Bellman 更新中；策略迭代每轮评估更充分。

## 实现检查

- 转移概率沿下一状态求和应为 $1$；
- 终止状态处理必须一致；
- 区分奖励发生在转移前还是转移后；
- 用小 MDP 手算 Bellman 更新；
- 记录 Bellman residual：

$$
\|TV-V\|_\infty
$$

- 策略评估不要误用最优 `max`；
- tie-breaking 固定以保证复现；
- 检查高 $\gamma$ 下停止阈值是否足够严格。

## 本节检查

- 能写出 MDP 五元组；
- 能区分状态价值和动作价值；
- 能从回报定义推出策略 Bellman 方程；
- 能写出 Bellman 最优方程；
- 能解释价值迭代为何收敛；
- 能区分策略评估和策略改进；
- 能比较价值迭代与策略迭代；
- 能用 Bellman residual 检查实现。

下一节进入 [P24：连续状态 MDP 与模型模拟](/notes/cs229/course/p24-continuous-state-mdp-model-simulation)。

## 来源说明

- 视频：[B 站 P23：Lecture 17](https://www.bilibili.com/video/BV1fP4y127nn/?p=23)
- 讲义：[Lecture Notes 12，第 1–7 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes12.pdf)
- 作业：[Problem Set 4](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS4/ps4.pdf)

中文内容对应 MDP、Bellman 方程、价值迭代和策略迭代。
