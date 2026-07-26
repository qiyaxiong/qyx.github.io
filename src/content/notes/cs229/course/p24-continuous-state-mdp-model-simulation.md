---
title: P24：连续状态 MDP、环境模型与模拟
description: 对应 B 站 P24 与 CS229 Lecture 18，从经验转移模型进入连续状态离散化、函数近似和拟合价值迭代。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 已知模型与未知模型

上一节假设转移：

$$
P_{sa}(s')
$$

和奖励 $R(s,a)$ 已知。

真实问题中通常只能观察转移样本：

$$
(s,a,r,s')
$$

基于模型的方法先估计环境，再用规划算法求策略。

## 经验转移模型

离散状态下：

$$
\hat P_{sa}(s')
=
\frac{
N(s,a,s')
}{
\sum_{\tilde s}
N(s,a,\tilde s)
}
$$

奖励估计：

$$
\hat R(s,a)
=
\frac{
\sum_{i:(s_i,a_i)=(s,a)}r_i
}{
N(s,a)
}
$$

然后将 $\hat P$ 与 $\hat R$ 代入价值或策略迭代。

## 未见状态—动作

若：

$$
N(s,a)=0
$$

经验模型没有信息。把所有未见转移概率设为零，会让规划器把“未知”误认为“不可能”。

解决方向包括：

- 平滑或先验；
- 乐观探索；
- 不确定性惩罚；
- 限制策略只选择数据覆盖动作；
- 收集定向数据。

## 探索与利用

利用当前模型选择最佳动作能获得回报，但可能不再学习未知区域。

探索有助于改善模型，却可能产生即时成本。

在仿真环境可广泛探索；医疗、金融和机器人等真实系统必须设置安全约束、人工监督和回退策略。

## 连续状态困难

状态：

$$
s\in\mathbb R^d
$$

无法为每个可能状态存储一个表格值。

即使每一维只切成 $b$ 个格子，总状态数也为：

$$
b^d
$$

这就是维数灾难。

## 离散化

将连续状态映射到有限网格：

$$
\phi(s)\in\{1,\ldots,M\}
$$

在离散状态上学习转移和价值。

离散过粗会把动力学不同的状态合并；过细则数据稀疏、计算量爆炸。

自适应网格可以在策略常访问或价值变化快的区域使用更细划分。

## 价值函数近似

线性近似：

$$
V_\theta(s)
=\theta^\top\phi(s)
$$

$\phi(s)$ 可包含：

- 多项式特征；
- 径向基函数；
- Fourier 特征；
- 物理系统特征；
- 学习到的表示。

非线性近似可用神经网络。

## Bellman 目标

给定当前近似 $V_\theta$，对状态 $s^{(i)}$ 构造：

$$
y^{(i)}
=\max_a
\left[
R(s^{(i)},a)
+\gamma
E_{s'\sim P}
V_\theta(s')
\right]
$$

新价值函数拟合：

$$
\theta_{\mathrm{new}}
=\arg\min_\theta
\sum_i
\left(
V_\theta(s^{(i)})-y^{(i)}
\right)^2
$$

这就是拟合价值迭代。

## 用模拟估计期望

若能从模型采样下一状态：

$$
s'_1,\ldots,s'_M
\sim P(\cdot\mid s,a)
$$

则：

$$
E[V(s')]
\approx
\frac1M
\sum_{j=1}^{M}
V(s'_j)
$$

样本数影响目标噪声与计算成本。

可以使用共同随机数比较动作，降低 Monte Carlo 差异。

## 三类误差

拟合价值迭代同时存在：

1. 有限状态样本造成的估计误差；
2. 有限转移模拟造成的 Monte Carlo 误差；
3. 函数类无法表达真实价值的逼近误差。

每轮 Bellman bootstrap 还会传播前一轮价值误差。

因此监督回归损失低，不自动意味着最终策略回报高。

## 数据分布

训练状态若来自均匀采样，可能浪费在策略永远不访问的区域；若只来自当前策略，又可能缺少替代动作区域。

可以混合：

- 初始状态分布；
- 当前策略访问分布；
- 探索轨迹；
- 风险边界状态；
- 专家或历史数据。

验证集也要覆盖真正关心的状态区域。

## Model Bias

规划器会利用学到模型的误差，寻找模型预测很好、真实环境很差的动作。

模型滚动越长，这种偏差可能累积。

诊断包括：

- 一步预测误差；
- 多步 rollout 误差；
- 按状态区域切片；
- 真实环境策略回报；
- 不确定性与错误相关性。

## 从采样估计转移模型

离散状态下，若观察到转移计数：

$$
N(s,a,s')
$$

最大似然转移估计：

$$
\hat P(s'\mid s,a)
=
\frac{
N(s,a,s')
}{
\sum_{\tilde s}
N(s,a,\tilde s)
}
$$

若某个 $(s,a)$ 从未访问，分母为零。不能假装模型已知。

可使用平滑先验，但更重要的是探索收集数据，或在规划时对未知区域保持不确定性。

奖励估计：

$$
\hat R(s,a)
=
\frac1{N(s,a)}
\sum_{t:(s_t,a_t)=(s,a)}r_t
$$

学习模型后，可以在 $\hat P,\hat R$ 上运行价值迭代。这是基本 model-based RL。

## Model Bias

规划使用估计模型：

$$
\hat P\ne P
$$

单步误差会沿长时域累积。策略还可能主动访问模型最不准确、但估计回报虚高的区域。

这称为模型利用或 model exploitation。

诊断方法：

- 比较一步预测误差与多步 rollout 误差；
- 按状态区域报告模型误差；
- 检查策略访问分布是否偏离训练数据；
- 使用模型集成估计不确定性；
- 对高不确定区域加惩罚或限制。

模型训练误差低不代表规划可靠，必须在策略诱导的状态分布上验证。

## 连续状态离散化

对连续状态每个维度划分网格，把状态映射到格点或 bin。

若每个维度划分 $b$ 个区间、状态有 $d$ 维，格点数量约为：

$$
b^d
$$

这就是维数灾难。$b=10,d=8$ 时已有 $10^8$ 个状态。

均匀网格还可能浪费分辨率：某些区域需要精细划分，另一些区域很少访问。

可使用自适应离散化、tile coding、径向基函数或神经网络近似价值。

## 线性价值函数近似

选择状态特征：

$$
\phi(s)\in\mathbb R^d
$$

近似价值：

$$
\hat V_\theta(s)
=
\theta^\top\phi(s)
$$

给定 Bellman 目标：

$$
y
=
r
+
\gamma
\max_{a'}
\hat Q_{\bar\theta}(s',a')
$$

通过回归拟合：

$$
\min_\theta
\sum_i
\left(
\hat Q_\theta(s_i,a_i)-y_i
\right)^2
$$

目标依赖当前价值估计，因此训练分布和目标都在迭代变化。这与普通监督学习固定标签不同。

使用单独目标网络或延迟参数 $\bar\theta$ 可以让目标变化更慢。

## Fitted Value Iteration

在一组采样状态 $\{s^{(i)}\}$ 上：

1. 对每个动作模拟或估计下一状态；
2. 用当前价值函数计算 Bellman 目标；
3. 用监督回归拟合新价值函数；
4. 重复直到策略或 Bellman 残差稳定。

若转移随机，可对多个下一状态样本平均：

$$
\hat y_i
=
\max_a
\left[
R(s_i,a)
+
\frac{\gamma}{M}
\sum_{j=1}^{M}
V(s'_{ij})
\right]
$$

有限样本带来 Monte Carlo 误差，函数逼近带来投影误差，模型不准带来模型误差。

## Q-learning：不显式学习模型

Q-learning 更新：

$$
Q(s_t,a_t)
\leftarrow
Q(s_t,a_t)
+
\alpha
\left[
r_t
+
\gamma\max_{a'}Q(s_{t+1},a')
-
Q(s_t,a_t)
\right]
$$

方括号是 TD error：

$$
\delta_t
=
r_t
+
\gamma\max_{a'}Q(s_{t+1},a')
-
Q(s_t,a_t)
$$

它直接从转移样本估计最优 Bellman 方程，不需要显式存储 $P$。

Tabular Q-learning 在充分探索和合适学习率条件下可收敛。函数近似、离线数据和分布偏移会使稳定性复杂得多。

## On-policy 与 Off-policy

SARSA 使用实际下一动作：

$$
Q(s_t,a_t)
\leftarrow
Q(s_t,a_t)
+
\alpha
\left[
r_t
+
\gamma Q(s_{t+1},a_{t+1})
-
Q(s_t,a_t)
\right]
$$

它评估并改进当前行为策略，是 on-policy。

Q-learning 使用 $\max_{a'}$ 目标，即使数据由探索策略产生，仍学习贪心目标策略，是 off-policy。

Off-policy 能复用其他策略数据，但数据与目标策略差异过大时，估计可能高方差或外推错误。

## 模拟器应怎样验证

模拟器不是天然真相。应分别验证：

- 单步动力学误差；
- 多步 rollout 稳定性；
- 奖励与终止条件；
- 边界和异常状态；
- 随机性与种子；
- 与真实系统关键统计量的一致性。

策略可能发现模拟器漏洞。高模拟奖励必须经过真实约束、保守评估或安全测试。

## 三类误差的分层实验

要区分模型、规划和函数逼近误差，可以设计：

1. 在真实或高可信模拟器中执行策略；
2. 用真实模型 + 近似规划，隔离规划误差；
3. 用估计模型 + 精确小规模规划，隔离模型误差；
4. 增加采样数，观察 Monte Carlo 方差；
5. 增加特征或网络容量，观察逼近误差。

只看最终回报无法知道哪一层失败。

## 练习与答案思路

### 练习 1：未访问动作

某状态动作从未采样，MLE 转移概率能可靠估计吗？

答案：不能。需要探索、先验或不确定性处理。

### 练习 2：维数灾难

六维状态每维 20 个网格，共多少离散状态？

答案：

$$
20^6=64,000,000
$$

### 练习 3：TD error

若 $r=1,\gamma=0.9,\max Q(s',a')=5,Q(s,a)=3$，TD error 是多少？

答案：$1+0.9\times5-3=2.5$。

### 练习 4：模拟漏洞

策略只在模拟器中表现极好，下一步应直接部署吗？

答案：不应。先检查模型偏差、策略访问区域、真实约束和安全边界。

## Function Approximation 的投影

Bellman backup：

$$
TV
$$

可能不在选定函数类：

$$
\mathcal F
=
\{V_\theta\}
$$

所以 Fitted Value Iteration 实际执行：

$$
V_{k+1}
\approx
\Pi_\mathcal F
TV_k
$$

$\Pi_\mathcal F$ 是按训练状态分布定义的投影。

若采样状态只覆盖少量区域，即使回归误差低，策略访问的新区域也可能外推失败。

函数类、采样分布和 Bellman 算子共同决定稳定性。

## Deadly Triad

三个因素同时出现时，价值学习可能不稳定：

1. Function Approximation；
2. Bootstrapping；
3. Off-policy Learning。

Bootstrapping 用自己的预测构造目标。

Off-policy 让训练数据分布与目标策略不同。

Function Approximation 让一个状态更新影响其他状态。

三者反馈可能导致价值发散。Target Network、Replay、保守目标和稳定算法都是缓解手段，但没有消除所有风险。

## Experience Replay

把转移：

$$
(s_t,a_t,r_t,s_{t+1})
$$

存入 replay buffer，随机采样 mini-batch。

作用：

- 打破相邻轨迹相关；
- 重复利用数据；
- 混合不同阶段经验。

风险：

- buffer 中数据过旧；
- 行为策略与当前策略差异；
- 稀有关键经验被淹没；
- 非平稳环境下历史数据失效。

Prioritized Replay 按 TD error 采样，但要用 importance weight 修正采样偏差。

## Double Q-learning

Q-learning 的：

$$
\max_aQ(s',a)
$$

同时选择与评价动作，会对有噪声估计产生最大化偏差。

Double Q 思想分离选择和评价：

$$
a^\star
=
\arg\max_a
Q_{\theta}(s',a)
$$

目标使用另一组参数：

$$
y
=
r+\gamma
Q_{\bar\theta}(s',a^\star)
$$

它降低系统性过高估计。

## Exploration 方法

$\epsilon$-greedy 简单，但对所有非贪心动作一视同仁。

Softmax Exploration：

$$
\pi(a\mid s)
\propto
\exp
\left(
\frac{Q(s,a)}{\tau}
\right)
$$

温度 $\tau$ 大时更随机，小时时更贪心。

Count-based Bonus 鼓励少访问状态。

不确定性方法鼓励模型不确定但可能高价值的动作。

连续高维状态中“计数”需要密度或表示近似。

## Offline Evaluation

日志数据由行为策略 $\mu$ 产生，想评价目标策略 $\pi$。

Importance Sampling 权重：

$$
w(\tau)
=
\prod_t
\frac{
\pi(a_t\mid s_t)
}{
\mu(a_t\mid s_t)
}
$$

估计：

$$
\hat J(\pi)
=
\frac1N
\sum_i
w(\tau_i)G(\tau_i)
$$

长轨迹权重方差可能极大，行为策略概率还必须已知且有覆盖。

Weighted IS、Per-decision IS 和 Doubly Robust 可改善，但不能创造未覆盖动作证据。

## Model Predictive Control

MPC 每个时刻：

1. 从当前状态规划有限时域动作序列；
2. 只执行第一个动作；
3. 观察新状态；
4. 重新规划。

它利用反馈减轻模型误差，并能显式加入动作与状态约束。

若规划模型由数据学习，仍需不确定性和安全边界。

## 连续状态特征设计

可使用：

- 多项式；
- RBF；
- Fourier Features；
- Tile Coding；
- 神经网络。

RBF：

$$
\phi_j(s)
=
\exp
\left(
-\frac{\|s-c_j\|^2}{2\sigma_j^2}
\right)
$$

中心覆盖与宽度决定泛化范围。

特征尺度不一致会扭曲距离。

## 连续控制项目

在 CartPole 或 MountainCar：

1. 随机策略基线；
2. 状态分布可视化；
3. 网格或 tile coding；
4. Q-learning/SARSA；
5. 学习曲线多种子；
6. TD error；
7. 探索计划；
8. 价值过估计；
9. 模型学习与 rollout；
10. 安全失败分析。

不要只展示最好一条训练曲线。

## 补充练习

### 练习 5：Deadly Triad

表格 Q-learning 是否包含 Function Approximation？

答案：不包含共享参数函数逼近，每个状态动作独立存值。

### 练习 6：Double Q

Double Q 的核心分离是什么？

答案：用一组估计选择最大动作，另一组估计评价该动作。

### 练习 7：Off-policy 覆盖

Importance Sampling 分母 $\mu(a\mid s)=0$ 会怎样？

答案：权重未定义，说明行为数据没有覆盖目标动作。

## CartPole 状态与动作

典型状态：

$$
s=
\begin{bmatrix}
x&
\dot x&
\theta&
\dot\theta
\end{bmatrix}^\top
$$

动作是向左或向右施力。

只观察位置和角度，不观察速度，状态可能不满足 Markov 性。

奖励常为每保持一步给 1，但训练成功后要检查实际角度、位置和控制平滑，而不只看 episode 长度。

时间上限结束是截断，不一定是真实失败。

## Tile Coding

用多组错位网格覆盖连续状态。

每个状态在每组网格激活一个 tile，特征是稀疏二值向量。

多个 offset 降低单一网格边界不连续。

线性价值：

$$
Q(s,a)=\theta_a^\top\phi(s)
$$

更新只影响激活 tile，计算高效。

分辨率、tiling 数和状态缩放决定泛化。

## Target Network

神经 Q-learning 目标：

$$
y
=
r+\gamma
\max_{a'}
Q_{\bar\theta}(s',a')
$$

$\bar\theta$ 延迟更新：

$$
\bar\theta
\leftarrow
\theta
$$

每隔若干步，或软更新：

$$
\bar\theta
\leftarrow
\tau\theta
+
(1-\tau)\bar\theta
$$

这让目标变化更慢，缓解移动目标不稳定。

## Simulation-to-Real Gap

差异来自：

- 质量与摩擦；
- 传感器噪声；
- 动作延迟；
- 控制频率；
- 未建模接触；
- 安全边界。

Domain Randomization 在训练时随机化参数，让策略覆盖一组可能现实。

随机范围太窄无法泛化，太宽可能让学习过难或策略过保守。

真实系统仍需逐级安全验证。

## 讲义对照阅读路线

Lecture Notes 12 中先定位：

```text
model estimation
continuous states
discretization
value approximation
fitted value iteration
```

对每种方法写出三项：

```text
数据从哪里来
目标怎样构造
误差怎样传播
```

再用 CartPole 对应状态、动作、转移和评价。

## 补充练习

### 练习 8：速度缺失

CartPole 只给位置和角度，为什么未来不可预测？

答案：同一位置角度在不同速度下下一状态不同。

### 练习 9：Domain Randomization

随机化范围越大是否一定越好？

答案：不一定，过宽会增加训练难度并产生过度保守策略。

## 本节检查

- 能从转移样本估计离散 MDP；
- 能说明未见状态—动作不能当作不可能；
- 能解释连续状态的维数灾难；
- 能比较离散化与函数近似；
- 能写出拟合价值迭代 Bellman 目标；
- 能用模拟样本估计下一状态期望；
- 能区分估计、模拟与逼近误差；
- 能说明模型偏差怎样被规划器利用。

下一节是 [P25：机器学习批判讨论课](/notes/cs229/course/p25-section-critiques-of-ml)。

## 来源说明

- 视频：[B 站 P24：Lecture 18](https://www.bilibili.com/video/BV1fP4y127nn/?p=24)
- 讲义：[Lecture Notes 12，第 6–15 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes12.pdf)
- 作业：[Problem Set 4](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS4/ps4.pdf)

中文内容对应环境模型、连续状态与拟合价值迭代。
