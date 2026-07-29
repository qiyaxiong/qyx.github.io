---
title: P27：强化学习调试、DDP 与 LQG
description: 对应 B 站 P27 与 CS229 Lecture 20，从奖励/环境/算法分层诊断进入 DDP、Kalman Filter、LQG 与分离原理。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## RL 调试为什么困难

最终回报差可能来自：

- 奖励函数写错；
- 环境转移错误；
- 状态遗漏；
- 探索不足；
- 价值估计偏差；
- 策略优化不稳定；
- 评估方差过大。

总回报把这些误差压成一个数字，不能直接指明根因。

## 分层验证

按层测试：

```text
奖励函数
→ 环境动力学
→ 状态与终止条件
→ 价值/模型估计
→ 策略改进
→ 完整训练
```

每层都应有小型确定性测试。

## 奖励函数检查

- 对手工轨迹逐步计算奖励；
- 检查折扣和终止奖励；
- 检查符号、单位与裁剪；
- 比较奖励与真正任务目标；
- 寻找 reward hacking；
- 观察各奖励分量的数量级。

如果奖励允许通过无意义循环积累，算法成功优化也会产生错误行为。

## 环境检查

对简单状态—动作对验证下一状态。

固定随机种子重复 rollout，检查：

- 转移是否符合物理或规则；
- 终止后是否仍更新；
- 观测与内部状态是否一致；
- 时间步长和单位是否正确；
- 动作是否被裁剪或延迟。

## 基线策略

至少比较：

- 随机策略；
- 固定策略；
- 简单启发式；
- 专家或控制器；
- oracle 小环境解。

若学习算法连简单基线都不能超过，先调查实现和评估，而不是扩大网络。

## 评估方差

单条轨迹回报噪声很大。应使用多随机种子、多 episode，报告：

- 平均回报；
- 中位数；
- 标准差或置信区间；
- 失败率；
- 最坏分位数；
- 样本效率。

训练期间探索策略与最终评估策略要分开。

## DDP 的目标

非线性动力学：

$$
x_{t+1}=f(x_t,u_t)
$$

非线性代价：

$$
J
=\sum_t\ell_t(x_t,u_t)+\ell_T(x_T)
$$

DDP 围绕当前名义轨迹构造局部二次控制问题并反复改进。

## DDP 迭代

1. 使用当前控制序列前向模拟；
2. 沿轨迹线性化动力学；
3. 对代价做二阶展开；
4. 从终点向后递推局部价值；
5. 得到控制修正；
6. 线搜索后重新前向模拟。

局部控制修正：

$$
\delta u_t
=k_t+K_t\delta x_t
$$

$k_t$ 是前馈改进，$K_t$ 是反馈稳定项。

## iLQR 与 DDP

iLQR 通常忽略动力学的二阶导数，只保留一阶线性化和代价二次项。

它计算更简单，是常用近似。

两者都依赖初始化和局部模型，非凸任务可能收敛到不同局部解。线搜索或信赖域用于防止局部近似外的大步更新。

## 部分可观测性

真实状态 $x_t$ 不一定可直接观察。系统只有：

$$
y_t=Cx_t+v_t
$$

其中 $v_t$ 是观测噪声。

控制器必须根据历史观测估计状态，再决定动作。

## 线性高斯系统

![Kalman Filter 在状态空间和观测空间之间传播与更新协方差](/images/notes/cs229/tikz/p27-kalman-covariance-update.png)

LQG 假设：

$$
x_{t+1}
=Ax_t+Bu_t+w_t
$$

$$
y_t
=Cx_t+v_t
$$

$w_t$、$v_t$ 为高斯噪声，并使用二次代价。

## Kalman Filter：预测

状态均值预测：

$$
\hat x_{t\mid t-1}
=A\hat x_{t-1\mid t-1}+Bu_{t-1}
$$

协方差预测：

$$
P_{t\mid t-1}
=AP_{t-1\mid t-1}A^\top+Q
$$

$Q$ 是过程噪声协方差。

## Kalman Filter：更新

![Kalman Filter 从状态预测、观测创新到增益加权更新](/images/notes/cs229/tikz/p27-kalman-predict-update.png)

创新：

$$
r_t
=y_t-C\hat x_{t\mid t-1}
$$

创新协方差：

$$
S_t
=CP_{t\mid t-1}C^\top+R
$$

Kalman gain：

$$
K_t
=P_{t\mid t-1}C^\top S_t^{-1}
$$

状态更新：

$$
\hat x_{t\mid t}
=\hat x_{t\mid t-1}+K_tr_t
$$

## 分离原理

在线性、高斯、二次代价条件下：

1. 用 Kalman Filter 估计 $\hat x_t$；
2. 用 LQR 反馈：

$$
u_t=K_t^{\mathrm{LQR}}\hat x_t
$$

估计器与控制器可以分别设计，这称为分离原理。

系统运行时二者仍串联；错误估计会影响动作。

## 创新诊断

若模型正确，创新 $r_t$ 应近似零均值，协方差与 $S_t$ 一致。

长期有偏说明模型、传感器偏置或状态定义问题。

创新过大或相关性强，说明噪声协方差、动力学或观测模型可能错误。

## 适用边界

LQG 分离结论依赖线性、高斯、二次代价等条件。

以下情况需要额外方法：

- 非线性；
- 非高斯重尾噪声；
- 硬约束；
- 模型失配；
- 风险敏感目标；
- 对抗扰动；
- 传感器故障。

不能把期望意义最优解释成最坏情况安全。

## RL 指标必须拆开

只看平均回报无法定位问题。至少同时记录：

- episode return 的均值、中位数和分位数；
- episode 长度；
- 成功率与失败类型；
- 状态和动作覆盖；
- 探索率或策略熵；
- 价值估计与实际回报差异；
- TD error 分布；
- 多随机种子波动；
- 安全约束违反次数。

高平均回报可能由少数极端成功 episode 拉高，因此分布比单个均值更重要。

评估策略应关闭训练探索噪声，并使用固定但独立的一组环境种子。

## 奖励与真实评价分离

训练奖励是优化信号，业务指标或任务成功率是独立评价。

若训练奖励提高而真实评价不变或下降，可能存在 reward hacking。

建立奖励分项日志：

$$
r_t
=
w_1r_t^{task}
+
w_2r_t^{safety}
+
w_3r_t^{shaping}
$$

分别记录每项贡献，检查策略是否只利用某一容易获得的 shaping reward。

还应保留不参与训练的 holdout 指标，让策略无法直接针对它优化。

## 环境验证协议

先测试确定性短轨迹。给定状态和动作，手工计算下一状态与奖励，与环境输出比较。

检查终止与截断：

- 真正任务失败或成功是 `terminated`；
- 达到时间上限通常是 `truncated`；
- 两者对 bootstrap target 的处理可能不同。

测试随机种子能否复现。检查 observation 和 action bounds、单位、坐标系和时间步长。

若环境错误，算法可能稳定学到错误行为。任何算法调参都不能弥补动力学或奖励实现错误。

## 价值估计诊断

对一组固定状态执行多次 Monte Carlo rollout，估计真实策略回报：

$$
\hat V_{\text{MC}}(s)
=
\frac1N
\sum_{i=1}^{N}
G^{(i)}(s)
$$

与 critic 预测 $V_\theta(s)$ 比较。

若系统性高估，可能有 maximization bias、分布外动作或 target 泄漏。

若误差只在少数状态大，检查这些状态是否缺少数据、接近终止边界或存在多模态未来。

绘制预测价值与实际回报散点、校准曲线和按时间步误差。

## DDP 的局部二次展开

非线性动力学：

$$
x_{t+1}=f(x_t,u_t)
$$

总代价：

$$
J
=
\sum_{t=0}^{T-1}
l(x_t,u_t)
+
l_T(x_T)
$$

在名义轨迹 $(\bar x_t,\bar u_t)$ 附近定义扰动：

$$
\delta x_t=x_t-\bar x_t,
\qquad
\delta u_t=u_t-\bar u_t
$$

局部线性化动力学：

$$
\delta x_{t+1}
\approx
f_x\delta x_t+f_u\delta u_t
$$

对 Bellman $Q$ 函数作二阶展开：

$$
Q(\delta x,\delta u)
\approx
Q_0
+
Q_x^\top\delta x
+
Q_u^\top\delta u
+
\frac12
\begin{bmatrix}
\delta x\\\delta u
\end{bmatrix}^\top
\begin{bmatrix}
Q_{xx}&Q_{xu}\\
Q_{ux}&Q_{uu}
\end{bmatrix}
\begin{bmatrix}
\delta x\\\delta u
\end{bmatrix}
$$

对 $\delta u$ 最小化：

$$
\delta u^\star
=
k+K\delta x
$$

其中：

$$
k=-Q_{uu}^{-1}Q_u
$$

$$
K=-Q_{uu}^{-1}Q_{ux}
$$

$k$ 是前馈轨迹修正，$K$ 是局部反馈增益。

## DDP 的前后向迭代

后向阶段从终点向前计算局部价值二次近似和控制增益。

前向阶段执行：

$$
u_t^{new}
=
\bar u_t
+
\alpha k_t
+
K_t(x_t^{new}-\bar x_t)
$$

并用真实非线性动力学 rollout 新轨迹。

$\alpha$ 通过 line search 选择，确保总代价下降。

若 $Q_{uu}$ 非正定，控制子问题不稳定。常对其加入正则：

$$
Q_{uu}+\lambda I
$$

并根据前向改进调整 $\lambda$。

## 从观测到状态估计

线性高斯系统：

$$
x_{t+1}
=
Ax_t+Bu_t+w_t
$$

$$
y_t
=
Cx_t+v_t
$$

过程噪声：

$$
w_t\sim\mathcal N(0,Q)
$$

观测噪声：

$$
v_t\sim\mathcal N(0,R)
$$

Kalman Filter 维护状态后验均值 $\hat x_{t\mid t}$ 和协方差 $P_{t\mid t}$。

## Kalman 预测步骤

状态预测：

$$
\hat x_{t\mid t-1}
=
A\hat x_{t-1\mid t-1}
+
Bu_{t-1}
$$

协方差预测：

$$
P_{t\mid t-1}
=
AP_{t-1\mid t-1}A^\top
+
Q
$$

动力学推进均值，过程噪声增加不确定性。

## Kalman 更新步骤

创新：

$$
\tilde y_t
=
y_t-C\hat x_{t\mid t-1}
$$

创新协方差：

$$
S_t
=
CP_{t\mid t-1}C^\top+R
$$

Kalman Gain：

$$
K_t
=
P_{t\mid t-1}
C^\top
S_t^{-1}
$$

均值更新：

$$
\hat x_{t\mid t}
=
\hat x_{t\mid t-1}
+
K_t\tilde y_t
$$

协方差更新：

$$
P_{t\mid t}
=
(I-K_tC)P_{t\mid t-1}
$$

观测噪声 $R$ 大时，更相信模型预测；预测协方差大而观测可靠时，更相信新观测。

实现使用线性方程求解，不显式计算 $S_t^{-1}$。

## 创新序列诊断

模型正确时，归一化创新应近似零均值、时间上不相关，并具有合理方差。

创新持续偏正或偏负，可能表示模型有系统偏差。

创新方差远大于预测，可能低估 $Q$ 或 $R$，或存在未建模动力学。

创新具有自相关，说明状态或动力学没有吸收全部时间结构。

Normalized Innovation Squared：

$$
\operatorname{NIS}_t
=
\tilde y_t^\top
S_t^{-1}
\tilde y_t
$$

可与卡方分布范围比较，检查滤波一致性。

## LQG 与分离原理

当动力学与观测线性、噪声 Gaussian、代价二次时：

1. Kalman Filter 给状态估计；
2. LQR 把估计状态当作状态计算控制。

控制：

$$
u_t=-L_t\hat x_{t\mid t}
$$

分离原理说明最优估计器和最优控制器可以分别设计。

该结论依赖特定假设。非线性、非 Gaussian、硬约束和模型错误下不能无条件套用。

## 练习与答案思路

### 练习 1：奖励诊断

训练回报上升、独立成功率下降说明什么？

答案：奖励可能与真实任务错位，策略正在利用代理目标。

### 练习 2：Kalman 权重

观测噪声 $R$ 极大时，Kalman Gain 通常怎样变化？

答案：变小，更新更依赖模型预测。

### 练习 3：创新偏差

创新长期非零均值意味着什么？

答案思路：模型、传感器偏置或状态估计存在系统误差。

### 练习 4：DDP 局部性

DDP 为什么需要多次前后向迭代？

答案：每次只在当前名义轨迹附近建立局部近似，需要 rollout 后重新线性化和二次化。

## 多随机种子评价

RL 训练分布由策略产生，早期随机动作可能让后续数据和性能完全不同。

至少运行多个独立 seed，报告：

- 每 seed 学习曲线；
- 最终回报分布；
- 成功率；
- 达到阈值所需样本；
- 最差 seed；
- 失败 seed 类型。

只挑最好一条曲线是选择偏差。

种子数量应根据波动与计算预算决定。方法差异若小于种子方差，结论不可靠。

## Evaluation Protocol

训练过程中每隔固定环境步数冻结策略。

用独立环境种子运行多个 episode，不添加探索噪声。

同时报告训练回报和评价回报。

若环境有随机初始状态，评价初始分布应固定协议。

比较算法时统一：

```text
环境交互步数
网络规模
评价频率
seed
超参数搜索预算
```

## Reward Scale

奖励乘常数不会改变精确 MDP 最优策略，但会改变梯度、价值范围和优化稳定性。

价值尺度约为：

$$
\frac{R_{\max}}{1-\gamma}
$$

$\gamma$ 接近 1 或奖励大时，目标可能很大。

可做奖励缩放或归一化，但要记录并保持训练/评价解释一致。

奖励裁剪会改变不同幅度奖励的相对信息，可能改变最优策略。

## Entropy 诊断

随机策略熵：

$$
H(\pi(\cdot\mid s))
=
-\sum_a
\pi(a\mid s)
\log\pi(a\mid s)
$$

熵过快降到零，策略可能过早停止探索。

熵长期很高且回报不升，策略可能未学到偏好或熵奖励过强。

按状态切片看熵，比总体均值更有信息。

连续 Gaussian 策略还要监控标准差与动作饱和。

## Offline RL 检查

日志数据审计：

- 行为策略覆盖；
- 动作分布；
- episode 边界；
- reward/terminal；
- 缺失 transition；
- 策略版本；
- 高风险状态。

训练策略的动作若偏离数据支持，Q 值可能严重外推。

比较：

```text
Behavior Cloning
日志策略
保守 Offline RL
```

没有可信离线评价或安全模拟，不应只根据训练 Q 值上线。

## Kalman Filter 数值稳定

简单协方差更新：

$$
P=(I-KC)P^-
$$

有限精度下可能破坏对称或半正定。

Joseph Form：

$$
P
=(I-KC)P^-(I-KC)^\top
+
KRK^\top
$$

数值更稳健。

每步对称化：

$$
P\leftarrow\frac12(P+P^\top)
$$

并检查最小特征值。

Square-root Filter 传播 Cholesky 因子，可进一步改善病态问题。

## Q 与 R 调节

过程噪声 $Q$ 大：

```text
认为动力学不确定
预测协方差增大
更愿意相信观测
```

观测噪声 $R$ 大：

```text
认为传感器不可靠
Kalman Gain 降低
更依赖模型
```

不能只调到轨迹“看起来顺滑”。用创新统计、已知传感器规格和预测误差估计。

过小 $Q$ 会让滤波器过度自信，真实变化跟不上。

## Extended Kalman Filter

非线性系统：

$$
x_{t+1}=f(x_t,u_t)+w_t
$$

$$
y_t=h(x_t)+v_t
$$

EKF 在当前均值附近线性化：

$$
F_t
=
\frac{\partial f}{\partial x}
$$

$$
H_t
=
\frac{\partial h}{\partial x}
$$

再使用 Kalman 预测和更新结构。

非线性强或后验多峰时，局部 Gaussian 近似可能失败。

可考虑 Unscented Kalman Filter、Particle Filter 或其他估计方法。

## RL 调试项目

在小环境中故意构造：

1. 错误 terminal；
2. 奖励符号反转；
3. observation 缺一维；
4. Q 目标未 detach；
5. 评价仍有探索；
6. replay 数据错位；
7. 环境 seed 不生效；
8. Kalman $Q,R$ 错设。

为每个错误建立单元测试和诊断图。

## 补充练习

### 练习 5：seed

只报告五个 seed 中最好一个有什么问题？

答案：选择偏差，无法表示方法平均稳定性。

### 练习 6：Reward Scale

奖励放大 100 倍是否必然保持神经网络训练行为相同？

答案：不保持，理论最优策略可能相同，但梯度尺度和优化不同。

### 练习 7：Joseph Form

Joseph Form 比简单协方差更新多保留了什么？

答案：显式保留两侧变换和观测噪声项，更易维持半正定。

## 训练事故案例：终止状态仍在 Bootstrap

某 DQN 在 episode 结束后仍使用：

$$
y
=
r+\gamma\max_aQ(s',a)
$$

真实终止状态没有未来回报，正确目标应为：

$$
y=r
$$

错误实现让终点价值被任意网络预测污染。

症状：

- 终点附近 Q 值异常大；
- TD error 周期性尖峰；
- 训练回报偶尔高但不稳定；
- 不同 seed 差异巨大。

修复：

$$
y
=
r
+
\gamma(1-done)
\max_aQ(s',a)
$$

但时间截断是否视为 `done` 取决于任务语义。若只是评估时间上限，通常仍应 bootstrap。

回归测试创建一步终止 MDP，目标必须精确等于即时奖励。

## Filter Divergence 案例

Kalman Filter 的 $Q$ 设得过小，滤波器认为模型几乎完美。

真实系统动力学变化后，预测协方差仍小，Kalman Gain 不足，估计跟不上观测。

创新持续有偏，NIS 超出合理范围。

修复不是盲目增大 $R$，而是重新建模过程不确定性、检查传感器和可能的模型切换。

## 讲义对照阅读路线

Lecture Notes 13 后半：

```text
DDP
局部二次展开
Kalman Filter
LQG
```

阅读 DDP 时对每个矩阵写 shape。

阅读 Kalman 时分：

```text
预测均值
预测协方差
创新
Gain
更新均值
更新协方差
```

用一维位置传感器手算三步，再写矩阵实现。

## 补充练习

### 练习 8：Terminal

真正终止状态为什么不应 bootstrap？

答案：episode 之后没有未来奖励，下一状态价值应为零。

### 练习 9：过程噪声

$Q$ 严重低估时滤波器通常怎样？

答案：过度相信模型、协方差过小、对真实变化响应迟缓。

## 本节检查

- 能把 RL 故障拆成奖励、环境、估计、优化和评估；
- 能设计奖励与环境的确定性测试；
- 能用多种基线和多随机种子评估；
- 能描述 DDP 的前向—反向迭代；
- 能区分前馈修正与反馈增益；
- 能写出 Kalman Filter 预测和更新；
- 能解释 LQG 分离原理；
- 能指出分离原理与安全保证的边界。

下一节是课程最后一个 B 站分集：[P28：CNN 讨论课](/notes/cs229/course/p28-section-convolutional-neural-networks)。

## 来源说明

- 视频：[B 站 P27：Lecture 20](https://www.bilibili.com/video/BV1fP4y127nn/?p=27)
- RL 调试：[ML Advice，第 16–19 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/materials/ML-advice.pdf)
- 控制：[Lecture Notes 13，第 9–15 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes13.pdf)
- 作业：[Problem Set 4](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS4/ps4.pdf)

中文内容对应 RL 调试、DDP、Kalman Filter 与 LQG。
