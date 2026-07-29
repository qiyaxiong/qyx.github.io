---
title: 第 19 章：有限时域控制、LQR、DDP 与 LQG
description: 从有限时域动态规划进入线性二次控制、Riccati 递推、非线性系统局部线性化、DDP 与部分可观测下的 LQG。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

## 有限时域 MDP

上一章考虑无限时域折扣回报。控制任务常有明确终点，例如机器人在 $T$ 步内到达目标，因此目标改写为有限和：

$$
E\left[
\sum_{t=0}^{T-1}R_t(s_t,a_t)+R_T(s_T)
\right]
$$

有限时域 MDP 允许转移概率和奖励随时间变化。即使状态相同，剩余时间不同，最佳动作也可能不同，因此策略通常写成 $\pi_t(s)$。

终止奖励 $R_T$ 很重要：它表达任务结束时对目标误差、碰撞或剩余能量的评价。若漏掉终止代价，系统可能在最后一步做出明显不合理的动作。

> 原版对应：PDF 第 1–2 页，Finite-horizon MDPs。

## 时间相关价值函数

![有限时域 Bellman 方程从终点条件开始逆时间递推](/images/notes/cs229/tikz/concept-finite-horizon-backup.png)

有限时域价值需要带时间下标：

$$
V_t^\pi(s)
=E\left[
\sum_{\tau=t}^{T-1}R_\tau(s_\tau,\pi_\tau(s_\tau))
+R_T(s_T)
\mid s_t=s
\right]
$$

边界条件是 $V_T(s)=R_T(s)$，随后从 $T-1$ 向前递推：

$$
V_t(s)
=\max_a\left[
R_t(s,a)
+E_{s'}V_{t+1}(s')
\right]
$$

这是一种反向动态规划：先知道终点怎样计分，再逐步推回当前动作。策略非平稳不是异常，而是有限剩余时间造成的自然结果。

> 原版对应：PDF 第 2–5 页，Time-dependent value functions and backward induction。

## 线性二次调节器

![LQR 如何把状态映射为最优控制并通过线性动力学传播](/images/notes/cs229/tikz/p26-lqr-state-control.png)

线性二次调节器（LQR）研究线性动力学与二次代价：

$$
x_{t+1}=A_tx_t+B_tu_t
$$

$$
J
=\sum_{t=0}^{T-1}
\left(x_t^\top Q_tx_t+u_t^\top R_tu_t\right)
+x_T^\top Q_Tx_T
$$

$x_t$ 是系统状态，$u_t$ 是控制输入。$Q_t\succeq0$ 惩罚状态偏离目标，$R_t\succ0$ 惩罚控制力度。

若目标轨迹不是零，可以先把状态改写成相对目标的误差。$Q$ 与 $R$ 并不是随意的“超参数”：它们表达状态精度、能耗、执行器使用和不同量纲之间的实际权衡。

在这些假设下，最优控制具有线性反馈形式：

$$
u_t=K_tx_t
$$

反馈控制会根据每一步实际状态重新计算输入，因此比只执行预先计算的开环动作序列更能抵抗小扰动。

> 原版对应：PDF 第 5–7 页，Linear quadratic regulation。

## Riccati 递推

![Riccati 递推如何形成控制 Hessian 并求反馈增益](/images/notes/cs229/tikz/p26-riccati-recursion.png)

假设下一时刻价值是二次型：

$$
V_{t+1}(x)=x^\top\Phi_{t+1}x
$$

把动力学代入当前代价：

$$
x^\top Q_tx+u^\top R_tu
+(A_tx+B_tu)^\top
\Phi_{t+1}(A_tx+B_tu)
$$

它关于 $u$ 是凸二次函数。令梯度为零，得到反馈矩阵：

$$
K_t
=-\left(R_t+B_t^\top\Phi_{t+1}B_t\right)^{-1}
B_t^\top\Phi_{t+1}A_t
$$

再把最优 $u_t=K_tx_t$ 代回，可得到 $\Phi_t$ 的 Riccati 反向递推。计算从终止条件 $\Phi_T=Q_T$ 开始，一直推到 $t=0$。

实现时不应显式求逆，而应解线性方程；同时检查矩阵对称性、正定性与维度。数值异常往往来自单位尺度悬殊、系统不可控或代价矩阵设定不合理。

> 原版对应：PDF 第 7–9 页，Riccati recursion。

## 非线性动力学线性化

真实系统常满足非线性动力学：

$$
x_{t+1}=f(x_t,u_t)
$$

在参考轨迹 $(\bar x_t,\bar u_t)$ 附近做一阶展开：

$$
\delta x_{t+1}
\approx A_t\delta x_t+B_t\delta u_t
$$

其中：

$$
A_t=\left.\frac{\partial f}{\partial x}\right|_{\bar x_t,\bar u_t},
\qquad
B_t=\left.\frac{\partial f}{\partial u}\right|_{\bar x_t,\bar u_t}
$$

对代价做二阶近似后，可以在局部构造一个 LQR 子问题。这里的关键词是“局部”：离参考轨迹越远，线性化误差越大，直接应用反馈增益可能失效。

工程实现应使用滚动重规划、信赖域或线搜索限制每次轨迹更新，并用真实非线性动力学重新仿真，而不是只相信局部二次近似。

> 原版对应：PDF 第 9–10 页，Linearizing nonlinear dynamics。

## DDP

![DDP 沿名义轨迹建立局部二次模型并执行反向求解与正向 rollout](/images/notes/cs229/tikz/concept-ddp-local-quadratic.png)

微分动态规划（DDP）围绕一条名义轨迹反复改进控制序列：

1. 用当前控制序列前向模拟，得到状态轨迹；
2. 沿轨迹线性化动力学、二次近似代价；
3. 从终点向后求局部价值函数和反馈增益；
4. 用线搜索后的控制更新再次前向模拟。

局部控制律通常同时包含前馈修正和反馈项：

$$
\delta u_t=k_t+K_t\delta x_t
$$

$k_t$ 推动名义轨迹朝更低代价移动，$K_t$ 修正执行过程中偏离名义轨迹的误差。

iLQR 常忽略动力学的二阶导数，是 DDP 的常用近似。两者都依赖初始化；非凸任务可能收敛到不同局部解，碰撞约束和控制边界也不能由普通无约束 LQR 自动满足。

> 原版对应：PDF 第 10–12 页，Differential dynamic programming。

## LQG 与部分可观测性

![Kalman Filter 从状态预测、观测创新到增益加权更新](/images/notes/cs229/tikz/p27-kalman-predict-update.png)

LQG 在线性动力学中加入高斯过程噪声和观测噪声：

$$
x_{t+1}=Ax_t+Bu_t+w_t
$$

$$
y_t=Cx_t+v_t
$$

其中 $w_t$ 与 $v_t$ 为高斯噪声。控制器看不到真实 $x_t$，只能根据观测 $y_{0:t}$ 估计状态。

![Kalman Filter 在状态空间和观测空间之间传播与更新协方差](/images/notes/cs229/tikz/p27-kalman-covariance-update.png)

在线性、高斯、二次代价等条件成立时，可以把问题分成两部分：

- Kalman filter 计算状态后验均值 $\hat x_t$；
- LQR 把 $\hat x_t$ 当状态，输出 $u_t=K_t\hat x_t$。

这称为分离原理。估计器与控制器可以分别设计，但系统运行时二者仍串联：错误估计会直接影响控制动作。

分离结论依赖模型结构。非线性、非高斯、硬约束、模型失配和风险敏感目标都可能破坏这些条件。安全系统还要显式处理饱和、状态约束、延迟、故障和最坏情况，不能把 LQG 的期望最优误解为安全保证。

> 原版对应：PDF 第 12–15 页，LQG and partially observed control。

## 本章检查

- 能解释有限时域策略为何需要时间下标；
- 能从终止价值写出反向 Bellman 递推；
- 能识别 LQR 的线性动力学、二次代价和矩阵条件；
- 能从二次价值假设推出线性反馈与 Riccati 递推；
- 能区分开环控制序列与闭环状态反馈；
- 能说明非线性系统线性化只在参考轨迹附近可信；
- 能描述 DDP 的前向—反向迭代和前馈/反馈两部分；
- 能说明 LQG 分离原理的适用假设及其安全边界。

至此，19 章主线完成。回到 [CS229 双语完整课程](/notes/cs229/course)，可以按主题复习，也可以切换英文原版逐页核对。

## 来源说明

本章对应 [CS229 Lecture Notes 13](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes13.pdf)。中文内容为独立重构讲解。
