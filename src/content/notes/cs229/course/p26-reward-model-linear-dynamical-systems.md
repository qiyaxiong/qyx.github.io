---
title: P26：状态—动作奖励与线性动力系统
description: 对应 B 站 P26 与 CS229 Lecture 19，从有限时域 MDP、线性动力学和二次代价推导 LQR 与 Riccati 递推。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 状态—动作奖励

基本 MDP 有时只写状态奖励 $R(s)$。更一般地：

$$
R(s,a)
$$

甚至：

$$
R(s,a,s')
$$

动作成本、碰撞惩罚和转移结果都可以进入奖励。

不同写法可通过扩展状态或取期望转换，但实现时必须明确奖励发生在动作前还是转移后。

## 有限时域 MDP

控制任务常有明确终点 $T$：

$$
E\left[
\sum_{t=0}^{T-1}
R_t(s_t,a_t)
+R_T(s_T)
\right]
$$

奖励和转移可以随时间变化，策略也写成：

$$
\pi_t(s)
$$

即使状态相同，剩余时间不同，最佳动作也可能不同。

## 反向动态规划

终止价值：

$$
V_T(s)=R_T(s)
$$

从 $T-1$ 向前：

$$
V_t(s)
=\max_a
\left[
R_t(s,a)
+E[V_{t+1}(s')]
\right]
$$

有限时域不需要折扣保证求和有限，但仍可使用折扣表达时间偏好。

## 动力系统

连续控制系统：

$$
x_{t+1}=f(x_t,u_t)
$$

$x_t$ 是位置、速度、角度等状态，$u_t$ 是力、转矩或其他控制输入。

模型可来自物理定律、系统辨识或数据学习。

## 线性动力学

LQR 假设：

$$
x_{t+1}
=A_tx_t+B_tu_t
$$

若有常数偏置，可扩展状态或围绕参考轨迹使用误差坐标。

线性模型只在一定工作区域内有效。执行器饱和、摩擦和接触会引入非线性。

## 二次代价

通常最小化代价：

$$
J
=
\sum_{t=0}^{T-1}
\left(
x_t^\top Q_tx_t
+u_t^\top R_tu_t
\right)
+x_T^\top Q_Tx_T
$$

$Q_t\succeq0$ 惩罚状态偏离目标，$R_t\succ0$ 惩罚控制强度。

不同状态量单位不同，权重必须结合尺度和真实代价设置。

## 二次价值假设

假设：

$$
V_{t+1}(x)
=x^\top\Phi_{t+1}x
$$

代入当前一步：

$$
x^\top Q_tx
+u^\top R_tu
+(A_tx+B_tu)^\top
\Phi_{t+1}
(A_tx+B_tu)
$$

这是关于 $u$ 的凸二次函数。

## 最优线性反馈

对 $u$ 求导并令零：

$$
u_t=K_tx_t
$$

其中：

$$
K_t
=-
\left(
R_t+B_t^\top\Phi_{t+1}B_t
\right)^{-1}
B_t^\top\Phi_{t+1}A_t
$$

最优控制是状态的线性反馈。

实际实现应解线性方程，不显式计算括号矩阵的逆。

## Riccati 递推

把 $u_t=K_tx_t$ 代回，可得到：

$$
\Phi_t
=Q_t
+A_t^\top\Phi_{t+1}A_t
-A_t^\top\Phi_{t+1}B_t
\left(
R_t+B_t^\top\Phi_{t+1}B_t
\right)^{-1}
B_t^\top\Phi_{t+1}A_t
$$

从：

$$
\Phi_T=Q_T
$$

向前反推到 $\Phi_0$。

## 开环与闭环

开环控制预先计算：

$$
u_0,\ldots,u_{T-1}
$$

执行时不根据实际状态调整。

闭环反馈：

$$
u_t=K_tx_t
$$

会响应扰动与模型误差。真实控制系统通常需要反馈。

## 可控性

线性系统可控性矩阵：

$$
\mathcal C
=
\begin{bmatrix}
B&AB&A^2B&\cdots&A^{n-1}B
\end{bmatrix}
$$

若：

$$
\operatorname{rank}(\mathcal C)=n
$$

系统状态在有限时间内可由输入驱动到任意位置。

不可控模式不能靠选择 $Q$、$R$ 或优化器修复。

## 非线性系统线性化

围绕参考轨迹 $(\bar x_t,\bar u_t)$：

$$
\delta x_{t+1}
\approx
A_t\delta x_t+B_t\delta u_t
$$

其中：

$$
A_t
=
\left.
\frac{\partial f}{\partial x}
\right|_{\bar x_t,\bar u_t}
$$

$$
B_t
=
\left.
\frac{\partial f}{\partial u}
\right|_{\bar x_t,\bar u_t}
$$

该近似只在局部可信，需要滚动重规划、线搜索或信赖域限制偏离。

## 安全边界

普通 LQR 不显式处理：

- 控制输入饱和；
- 状态硬约束；
- 碰撞；
- 模型不确定性；
- 延迟；
- 故障。

期望二次代价最优不等于安全保证。约束系统需要 MPC、鲁棒控制、安全过滤器或其他显式机制。

## 本节检查

- 能把奖励从状态扩展到状态—动作；
- 能写出有限时域反向 Bellman 递推；
- 能识别 LQR 的线性动力学和二次代价；
- 能从二次价值推出线性反馈；
- 能写出 Riccati 递推结构；
- 能区分开环序列与闭环反馈；
- 能用可控性判断输入是否能影响全部状态；
- 能说明无约束 LQR 不提供安全保证。

下一节进入 [P27：RL 调试、DDP 与 LQG](/notes/cs229/course/p27-rl-debugging-diagnostics)。

## 来源说明

- 视频：[B 站 P26：Lecture 19](https://www.bilibili.com/video/BV1fP4y127nn/?p=26)
- 讲义：[Lecture Notes 13，第 1–9 页](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes13.pdf)
- 作业：[Problem Set 4](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS4/ps4.pdf)

中文内容对应有限时域、动力系统、LQR 和 Riccati 方程。
