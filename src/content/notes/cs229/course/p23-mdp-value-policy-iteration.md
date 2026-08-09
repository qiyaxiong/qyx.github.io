---
title: P23：MDP、价值迭代与策略迭代
description: 对应 B 站 P23 与 CS229 Lecture 17，从马尔可夫决策过程、价值函数和 Bellman 方程推导价值迭代与策略迭代。
publishDate: 2026-07-26
updatedDate: 2026-08-08
language: zh
---

## 一图理解本章

![MDP 从价值函数和 Bellman 方程到最优价值、价值迭代与策略迭代的六步图解](/images/notes/cs229/storyboards/p23-mdp-planning-storyboard.png)

先沿图中的六个步骤建立本章主线，再进入后文的公式推导、实现细节和失败诊断。

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

![Bellman 备份先沿下一状态求期望再沿动作轴取最大](/images/notes/cs229/tikz/p23-bellman-value-iteration.png)

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

![策略迭代在策略评估和贪心策略改进之间交替](/images/notes/cs229/tikz/p23-policy-iteration.png)

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

## MDP 的五个组成部分

一个折扣无限时域 MDP 写作：

$$
(\mathcal S,\mathcal A,P,R,\gamma)
$$

$\mathcal S$ 是状态集合，$\mathcal A$ 是动作集合。

转移模型：

$$
P(s'\mid s,a)
$$

奖励函数：

$$
R(s,a)
$$

折扣因子：

$$
0\le\gamma<1
$$

$\gamma$ 越大，策略越重视长期奖励。折扣还保证有界奖励下无限和收敛，并使 Bellman 算子具有收缩性。

## 价值函数从哪里来

策略 $\pi$ 下状态价值：

$$
V^\pi(s)
=
\mathbb E_\pi
\left[
\sum_{t=0}^{\infty}
\gamma^t r_t
\mid s_0=s
\right]
$$

把第一步奖励拆出：

$$
V^\pi(s)
=
\mathbb E_\pi
\left[
r_0
+
\gamma
\sum_{t=1}^{\infty}
\gamma^{t-1}r_t
\mid s_0=s
\right]
$$

后半部分从下一状态开始仍是价值函数，因此：

$$
V^\pi(s)
=
\sum_a\pi(a\mid s)
\left[
R(s,a)
+
\gamma
\sum_{s'}P(s'\mid s,a)V^\pi(s')
\right]
$$

这就是策略 Bellman 方程。

## 动作价值函数

动作价值：

$$
Q^\pi(s,a)
=
R(s,a)
+
\gamma
\sum_{s'}P(s'\mid s,a)V^\pi(s')
$$

状态价值是策略对动作价值的平均：

$$
V^\pi(s)
=
\sum_a
\pi(a\mid s)Q^\pi(s,a)
$$

最优价值满足：

$$
V^\star(s)
=
\max_a
\left[
R(s,a)
+
\gamma
\sum_{s'}P(s'\mid s,a)V^\star(s')
\right]
$$

最优策略可取：

$$
\pi^\star(s)
\in
\arg\max_a Q^\star(s,a)
$$

## 一个两状态例子

状态为 `healthy` 和 `sick`，动作是 `rest` 与 `work`。

假设在 `healthy` 工作获得奖励 2，但有 0.4 概率进入 `sick`；休息奖励 0.5，并有 0.9 概率保持健康。

在 `sick` 工作奖励 0 且恢复概率 0.2；休息奖励 -0.5 但恢复概率 0.8。

给定某个价值估计 $V$，健康状态下工作的 Bellman backup：

$$
Q(healthy,work)
=
2
+
\gamma
\left[
0.6V(healthy)+0.4V(sick)
\right]
$$

休息动作：

$$
Q(healthy,rest)
=
0.5
+
\gamma
\left[
0.9V(healthy)+0.1V(sick)
\right]
$$

价值迭代每轮计算两者并取最大。即时奖励较高的工作未必长期更优，取决于疾病状态的长期代价和 $\gamma$。

## Bellman 最优算子的收缩性

定义：

$$
(TV)(s)
=
\max_a
\left[
R(s,a)
+
\gamma
\sum_{s'}P(s'\mid s,a)V(s')
\right]
$$

对任意 $V,W$：

$$
\|TV-TW\|_\infty
\le
\gamma
\|V-W\|_\infty
$$

因为转移概率是非负且和为一，期望不会放大最大差异，最大操作也保持该上界。

$\gamma<1$，所以 $T$ 是压缩映射，有唯一不动点 $V^\star$。反复价值迭代：

$$
V_{k+1}=TV_k
$$

从任意初始值收敛到 $V^\star$。

## 价值迭代算法

```python
V = zeros(num_states)

while True:
    new_V = empty_like(V)
    for s in states:
        new_V[s] = max(
            reward(s, a)
            + gamma * sum(P[s, a, s2] * V[s2] for s2 in states)
            for a in actions
        )

    if max_abs(new_V - V) < tolerance:
        break
    V = new_V
```

同步更新使用旧 $V$ 计算整轮新值。异步更新可就地写入，在合适访问条件下也能收敛。

停止阈值应结合 $\gamma$ 解释。$\gamma$ 接近 1 时，同样的 Bellman 残差可能对应更大的价值误差。

## 策略评估是线性方程

固定策略 $\pi$，定义策略转移矩阵 $P^\pi$ 和奖励向量 $R^\pi$。

Bellman 方程：

$$
V^\pi
=
R^\pi
+
\gamma P^\pi V^\pi
$$

整理：

$$
(I-\gamma P^\pi)V^\pi
=
R^\pi
$$

小型状态空间可以直接解线性方程：

$$
V^\pi
=
(I-\gamma P^\pi)^{-1}R^\pi
$$

大型问题使用迭代策略评估，反复应用策略 Bellman backup。

## 策略改进与策略迭代

用当前 $V^\pi$ 构造贪心策略：

$$
\pi'(s)
\in
\arg\max_a
\left[
R(s,a)
+
\gamma
\sum_{s'}P(s'\mid s,a)V^\pi(s')
\right]
$$

策略改进定理保证：

$$
V^{\pi'}(s)\ge V^\pi(s)
$$

策略迭代交替：

```text
策略评估
→ 策略改进
→ 若策略不变则停止
```

有限 MDP 中策略数量有限，严格改进不可能无限持续，因此会收敛到最优策略。

## 价值迭代与策略迭代比较

价值迭代每轮只做一次最优 Bellman backup，可看成“截断的策略评估 + 立即改进”。

策略迭代每轮完整或近似评估当前策略，再改进。

价值迭代单轮便宜、轮数可能多；策略迭代单轮昂贵、策略更新次数通常少。

Modified Policy Iteration 在二者之间，每轮只做若干次策略评估。

## 练习与答案思路

### 练习 1：折扣

$\gamma=0$ 时最优策略依据什么？

答案：只依据当前即时奖励，不考虑未来状态。

### 练习 2：Bellman 方程

为什么 Bellman 方程可以递归表达无限回报？

答案：把第一步奖励拆出后，剩余折扣回报与下一状态开始的价值具有相同结构。

### 练习 3：策略评估

固定策略后 Bellman 方程为何不再有 `max`？

答案：动作由策略给定，只对策略动作分布求期望。

### 练习 4：未知模型

若不知道 $P(s'\mid s,a)$，能否直接执行这里的精确价值迭代？

答案：不能。需要先估计模型，或使用 Q-learning 等 model-free 方法。

## 有限时域 Bellman 递推

![有限时域 Bellman 方程从终点条件开始逆时间递推](/images/notes/cs229/tikz/concept-finite-horizon-backup.png)

有限时域价值带时间下标：

$$
V_t^\star(s)
=
\max_a
\left[
R_t(s,a)
+
\sum_{s'}
P_t(s'\mid s,a)
V_{t+1}^\star(s')
\right]
$$

终端条件：

$$
V_T^\star(s)=R_T(s)
$$

从 $T-1$ 向 $0$ 倒推。

最优策略通常是非平稳的：

$$
\pi_t^\star(s)
$$

同一状态在剩余时间不同的情况下，最优动作可能不同。

如果把剩余时间加入状态，也可以转成平稳策略问题。

## Stochastic Policy

固定随机策略的 Bellman 方程：

$$
V^\pi(s)
=
\sum_a
\pi(a\mid s)
\sum_{s'}
P(s'\mid s,a)
\left[
R(s,a,s')
+
\gamma V^\pi(s')
\right]
$$

在完全已知的标准 MDP 中，总存在确定性最优策略。

但随机策略在探索、约束、对抗、熵正则和部分可观测问题中很重要。

## Reward 的不同写法

奖励可能写成：

$$
R(s,a)
$$

或：

$$
R(s,a,s')
$$

前者可以定义为后者对下一状态的期望：

$$
R(s,a)
=
\sum_{s'}
P(s'\mid s,a)
R(s,a,s')
$$

实现 Bellman backup 时要确认环境 API 返回的奖励语义，不能重复求期望或漏掉转移依赖。

## State Occupancy

策略诱导折扣状态访问分布：

$$
d^\pi(s)
=(1-\gamma)
\sum_{t=0}^{\infty}
\gamma^t
P(s_t=s\mid\pi)
$$

策略性能可以写成对 occupancy 的奖励期望。

两个策略价值不同，不只是相同状态选动作不同，也因为它们访问的状态分布不同。

这对 off-policy 评价和分布偏移非常关键。

## Value Iteration 的误差界

由收缩性：

$$
\|V_k-V^\star\|_\infty
\le
\gamma^k
\|V_0-V^\star\|_\infty
$$

若 Bellman residual：

$$
\|TV-V\|_\infty
\le\epsilon
$$

可得到价值误差上界与：

$$
\frac{\epsilon}{1-\gamma}
$$

同阶。

$\gamma$ 接近 1 时，小 residual 也可能累积成较大价值误差。

## Policy Evaluation 的采样形式

模型未知时，可从策略轨迹估计：

Monte Carlo：

$$
V(s)
\leftarrow
V(s)
+
\alpha(G_t-V(s))
$$

TD(0)：

$$
V(s_t)
\leftarrow
V(s_t)
+
\alpha
\left[
r_t+\gamma V(s_{t+1})-V(s_t)
\right]
$$

Monte Carlo 使用完整回报，无 bootstrap、方差高。

TD 使用一步 bootstrap，偏差与方差结构不同，可在线更新。

## Asynchronous Dynamic Programming

不必每轮更新所有状态。

Gauss–Seidel 风格使用最新值就地更新。

Prioritized Sweeping 优先更新 Bellman residual 大或会影响重要前驱的状态。

大型稀疏 MDP 中，集中计算于受影响区域比完整扫表高效。

收敛仍需保证相关状态被充分更新。

## MDP 建模检查

状态是否包含：

- 未来转移需要的信息；
- 剩余资源；
- 时间或阶段；
- 约束状态；
- 必要历史摘要。

动作是否真实可执行，还是把连续控制粗暴离散后产生不可行跳变？

奖励是否与真实目标一致？

转移是否满足概率和为一？

终止状态价值与后续奖励是否正确？

## MDP 项目

实现 Gridworld：

1. 墙、终点和陷阱；
2. 随机动作滑移；
3. 价值迭代；
4. 策略迭代；
5. 不同 $\gamma$；
6. 收敛曲线；
7. Bellman residual；
8. 异步更新；
9. 策略可视化；
10. Monte Carlo 运行验证。

比较计算价值与模拟平均回报。

## 补充练习

### 练习 5：有限时域

为什么有限时域最优策略可能依赖时间？

答案：剩余步数改变未来收益，临近终点时同一状态的最优动作可能不同。

### 练习 6：收缩

$\gamma=1$ 时标准无限时域收缩证明是否仍成立？

答案：不成立，需要终止性或其他条件。

### 练习 7：Occupancy

两个策略在相同状态动作概率只差一点，长期数据分布一定只差一点吗？

答案：不一定，转移会累积差异并进入不同状态区域。

## Gridworld 手算一轮

设终点价值 0，普通移动奖励 -1，$\gamma=0.9$。

初始：

$$
V_0(s)=0
$$

对终点旁边状态，能一步进入终点：

$$
V_1(s)
=
-1+0.9\times0
=
-1
$$

离终点两步的确定性状态，第二轮：

$$
V_2(s)
=
-1+0.9(-1)
=
-1.9
$$

价值从终点向外传播。

若动作有 20% 滑移，backup 必须对多个下一状态求期望，而不是只用目标方向。

## Policy Tie

多个动作可能具有相同 $Q$。

策略提取可固定动作顺序、随机打破或保留所有最优动作。

不固定 tie-breaking 会让两次策略图不同，但价值相同。

测试应比较 Bellman optimality 与回报，而不是强制唯一动作。

## MDP 单元测试

建立极小环境验证：

- 转移概率每行和为 1；
- 终点不再累积奖励；
- $\gamma=0$ 只选即时奖励；
- 单状态 MDP 有解析解；
- 策略评估线性解与迭代一致；
- 价值迭代 residual 下降；
- 模拟回报接近计算价值。

单状态自循环、奖励 $r$：

$$
V=\frac{r}{1-\gamma}
$$

是最简单解析测试。

## 讲义对照阅读路线

Lecture Notes 12 前半按：

```text
MDP 定义
Value
Bellman
Value Iteration
Policy Iteration
```

每一节在 Gridworld 手算一次。

只读公式容易混淆 $V^\pi$ 与 $V^\star$。把 `固定策略期望` 和 `最优动作 max` 用不同颜色标注。

## 补充练习

### 练习 8：单状态

$r=2,\gamma=0.5$ 的自循环状态价值是多少？

答案：

$$
V=2/(1-0.5)=4
$$

### 练习 9：Tie

两个动作 $Q$ 相同，选择任意一个是否仍最优？

答案：是，二者都在 argmax 集合中。

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
