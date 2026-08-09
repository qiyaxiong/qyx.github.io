---
title: P26：状态—动作奖励与线性动力系统
description: 对应 B 站 P26 与 CS229 Lecture 19，从有限时域 MDP、线性动力学和二次代价推导 LQR 与 Riccati 递推。
publishDate: 2026-07-26
updatedDate: 2026-08-08
language: zh
---

## 一图理解本章

![线性控制从动力学与二次成本到 Riccati 递推、线性反馈和闭环稳定性的六步图解](/images/notes/cs229/storyboards/p26-lds-lqr-storyboard.png)

先沿图中的六个步骤建立本章主线，再进入后文的公式推导、实现细节和失败诊断。

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

![LQR 将状态映射为最优控制并通过线性动力学传播](/images/notes/cs229/tikz/p26-lqr-state-control.png)

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

![Riccati 递推如何在控制空间形成 Hessian 并求反馈增益](/images/notes/cs229/tikz/p26-riccati-recursion.png)

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

## 有限时域最优控制

考虑时刻：

$$
t=0,\ldots,T-1
$$

动力学：

$$
x_{t+1}
=
Ax_t+Bu_t
$$

阶段代价：

$$
c_t(x_t,u_t)
=
x_t^\top Qx_t
+
u_t^\top Ru_t
$$

终端代价：

$$
c_T(x_T)
=
x_T^\top Q_Tx_T
$$

目标是选择控制序列最小化：

$$
J
=
\sum_{t=0}^{T-1}
c_t(x_t,u_t)
+
c_T(x_T)
$$

$Q,Q_T\succeq0$ 惩罚状态偏离，$R\succ0$ 惩罚控制力度。

## 二次价值函数假设

终端价值：

$$
V_T(x)
=
x^\top Q_Tx
$$

假设下一时刻价值为二次型：

$$
V_{t+1}(x)
=
x^\top P_{t+1}x
$$

Bellman 方程：

$$
V_t(x)
=
\min_u
\left[
x^\top Qx
+
u^\top Ru
+
(Ax+Bu)^\top
P_{t+1}
(Ax+Bu)
\right]
$$

展开与 $u$ 有关的项：

$$
u^\top
(R+B^\top P_{t+1}B)
u
+
2x^\top A^\top P_{t+1}Bu
$$

对 $u$ 求导并令零：

$$
2(R+B^\top P_{t+1}B)u
+
2B^\top P_{t+1}Ax
=0
$$

最优控制：

$$
u_t^\star
=
-K_tx_t
$$

其中：

$$
K_t
=
(R+B^\top P_{t+1}B)^{-1}
B^\top P_{t+1}A
$$

最优策略是状态的线性反馈。

## Riccati 递推

把最优控制代回 Bellman 方程：

$$
P_t
=
Q
+
A^\top P_{t+1}A
-
A^\top P_{t+1}B
(R+B^\top P_{t+1}B)^{-1}
B^\top P_{t+1}A
$$

从：

$$
P_T=Q_T
$$

向后递推到 $P_0$，即可得到每个时刻的反馈增益 $K_t$。

这是动态规划在连续状态、线性动力学和二次代价下的解析形式。

## 为什么反馈优于开环

开环控制提前计算：

$$
u_0,\ldots,u_{T-1}
$$

执行中不根据实际状态修正。模型误差或外部扰动会累积。

反馈控制每时刻观察状态：

$$
u_t=-K_tx_t
$$

若系统偏离计划轨迹，控制会立即调整。

LQR 反馈同时考虑状态误差和控制成本，通常比只跟踪预定动作序列稳健。

## 一个一维 LQR 例子

动力学：

$$
x_{t+1}=x_t+u_t
$$

单步代价：

$$
x_t^2+u_t^2
$$

终端代价：

$$
x_T^2
$$

在最后一步 $t=T-1$：

$$
V_{T-1}(x)
=
\min_u
\left[
x^2+u^2+(x+u)^2
\right]
$$

展开：

$$
2x^2+2xu+2u^2
$$

对 $u$ 求导：

$$
2x+4u=0
$$

所以：

$$
u^\star=-\frac12x
$$

控制不会一次把状态强行拉到零，因为控制本身也有代价。

## 可控性

离散线性系统：

$$
x_{t+1}=Ax_t+Bu_t
$$

可控性矩阵：

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

则系统可控：存在有限控制序列把任意初始状态移动到任意目标状态。

若某些不稳定方向不可控，再好的 LQR 权重也无法稳定它们。应先检查系统结构，而不是只调 $Q,R$。

## Q 与 R 怎样影响行为

增大 $Q$ 表示更强烈惩罚状态偏离，控制通常更积极。

增大 $R$ 表示控制动作昂贵，策略更保守、收敛更慢。

矩阵权重还可对不同状态和控制方向设置不同代价。

调参时应观察：

- 状态收敛时间；
- 最大控制幅度；
- 能量消耗；
- 超调与振荡；
- 对模型误差和扰动的敏感性；
- 是否触及真实约束。

标准 LQR 没有显式状态与动作硬约束。存在边界时需使用 MPC 或约束优化。

## 非线性系统的局部 LQR

非线性动力学：

$$
x_{t+1}=f(x_t,u_t)
$$

在参考轨迹 $(\bar x_t,\bar u_t)$ 附近线性化：

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
\right|_{\bar x_t,\bar u_t},
\qquad
B_t
=
\left.
\frac{\partial f}{\partial u}
\right|_{\bar x_t,\bar u_t}
$$

再对局部二次代价求 LQR 控制。

线性化只在邻域内可靠。状态偏离太远时，局部控制可能失效，需要重新规划或使用更全局方法。

## 安全与饱和

真实执行器有动作上限：

$$
u_{\min}\le u_t\le u_{\max}
$$

直接裁剪 LQR 输出会改变闭环动力学，可能导致积分饱和或稳定性变化。

上线前应在扰动、参数变化、传感器噪声和动作饱和下做压力测试。

控制系统还要设置独立安全层、状态边界和回退控制器，不能只依赖学习或优化策略。

## 练习与答案思路

### 练习 1：反馈符号

为什么 LQR 控制写成 $u=-Kx$？

答案：反馈方向抵消状态偏离；精确符号来自二次目标的一阶最优条件。

### 练习 2：控制成本

增大 $R$ 通常使控制动作怎样变化？

答案：动作幅度减小，策略更保守。

### 练习 3：不可控方向

系统某不稳定状态方向不受 $B$ 影响，调大 $Q$ 能解决吗？

答案：不能。该方向不可控，需要改变执行器或系统结构。

### 练习 4：硬约束

标准 LQR 能直接保证动作不超过上限吗？

答案：不能。需要显式约束方法或额外安全处理。

## Infinite-horizon LQR

时间不变系统与代价下，若满足稳定化条件，有限时域 Riccati 递推可收敛到固定矩阵 $P$。

Algebraic Riccati Equation：

$$
P
=
Q
+
A^\top PA
-
A^\top PB
(R+B^\top PB)^{-1}
B^\top PA
$$

固定反馈：

$$
u_t=-Kx_t
$$

$$
K
=(R+B^\top PB)^{-1}B^\top PA
$$

闭环动力学：

$$
x_{t+1}
=(A-BK)x_t
$$

稳定性由闭环矩阵特征值检查。

## Stability

离散线性系统渐近稳定，当：

$$
\rho(A-BK)<1
$$

$\rho$ 是谱半径。

连续时间系统则要求闭环矩阵特征值实部为负。

仿真有限时间不发散不等于数学稳定。应检查特征值和 Lyapunov 条件。

## Lyapunov Function

候选函数：

$$
V(x)=x^\top Px
$$

$P\succ0$。

若闭环系统满足：

$$
V(x_{t+1})-V(x_t)<0
$$

对所有非零状态成立，则 $V$ 沿轨迹下降。

LQR 的 Riccati 解与二次 Lyapunov 函数密切相关。

这提供比“轨迹看起来收敛”更强的稳定证据。

## Tracking 而不是 Regulating

标准 LQR 把状态调节到零。

跟踪参考：

$$
r_t
$$

定义误差：

$$
e_t=x_t-r_t
$$

代价：

$$
e_t^\top Qe_t+u_t^\top Ru_t
$$

参考若变化，需要前馈项或扩展状态。

存在持续扰动时，仅状态反馈可能有稳态误差，可加入积分状态。

## Augmented State

希望动作变化平滑，可把上一动作加入状态：

$$
\tilde x_t
=
\begin{bmatrix}
x_t\\u_{t-1}
\end{bmatrix}
$$

新控制为：

$$
\Delta u_t=u_t-u_{t-1}
$$

代价惩罚：

$$
\Delta u_t^\top R_\Delta\Delta u_t
$$

这样可限制控制抖动。

状态扩展也用于积分控制、延迟和有限记忆。

## Process Noise

随机动力学：

$$
x_{t+1}
=
Ax_t+Bu_t+w_t
$$

若 $w_t$ 零均值、与状态独立，在完整状态观测下，最优 LQ 控制增益与确定性 LQR 相同。

噪声会增加期望总代价，但不改变反馈形式。

若状态不可直接观测，需要估计器，进入 LQG。

## System Identification

若 $A,B$ 未知，可从数据回归：

$$
x_{t+1}
\approx
\begin{bmatrix}
A&B
\end{bmatrix}
\begin{bmatrix}
x_t\\u_t
\end{bmatrix}
$$

普通最小二乘要求数据对相关方向有足够激励。

若控制策略从不探索某些动作，$B$ 的相应方向无法可靠估计。

闭环数据中输入与噪声可能相关，需要更谨慎识别方法。

模型误差应传播到控制压力测试。

## Controllability 与 Observability

可控性检查动作能否影响所有状态方向。

可观性矩阵：

$$
\mathcal O
=
\begin{bmatrix}
C\\CA\\CA^2\\\vdots\\CA^{n-1}
\end{bmatrix}
$$

若：

$$
\operatorname{rank}(\mathcal O)=n
$$

内部状态可从输出序列恢复。

不可观不稳定方向会让状态估计与控制失败。

## Model Predictive Control

MPC 每步解有限时域优化，并显式加入：

$$
x_{\min}\le x_t\le x_{\max}
$$

$$
u_{\min}\le u_t\le u_{\max}
$$

只执行首个动作，再根据新状态重算。

线性二次 MPC 是带约束二次规划。

相比 LQR，它能处理硬约束，但在线计算更昂贵。

## 控制项目

对倒立摆线性化模型：

1. 检查 $A,B$ 维度；
2. 可控性；
3. 选择 $Q,R$；
4. Riccati 解；
5. 闭环特征值；
6. 初始状态响应；
7. 扰动；
8. 动作饱和；
9. 模型参数偏差；
10. 与开环比较。

报告稳定性与安全边界，不只展示最好轨迹。

## 补充练习

### 练习 5：闭环矩阵

反馈 $u=-Kx$ 后动力学矩阵是什么？

答案：

$$
A-BK
$$

### 练习 6：跟踪

标准调零 LQR 直接用于非零固定参考可能有什么问题？

答案：可能存在偏置，应平移状态、加入前馈或积分。

### 练习 7：系统识别

动作始终为零，能否估计 $B$？

答案：不能，数据没有对控制方向提供激励。

## Discretization

连续时间系统：

$$
\dot x
=
A_cx+B_cu
$$

采样间隔 $\Delta t$ 后：

$$
x_{t+1}
=
Ax_t+Bu_t
$$

精确：

$$
A=e^{A_c\Delta t}
$$

$$
B=
\int_0^{\Delta t}
e^{A_c\tau}B_c\,d\tau
$$

简单 Euler 近似：

$$
A\approx I+\Delta tA_c
$$

$$
B\approx\Delta tB_c
$$

采样过粗会改变稳定性与控制质量。

## Feedforward 与 Feedback

跟踪参考轨迹时：

$$
u_t
=
\bar u_t
-
K_t(x_t-\bar x_t)
$$

$\bar u_t$ 是名义前馈动作，负责沿参考轨迹运动。

反馈项纠正扰动与模型误差。

只有反馈而没有正确前馈，可能产生稳态偏差；只有前馈又不稳健。

## Actuator Delay

若动作延迟一拍：

$$
x_{t+1}
=
Ax_t+Bu_{t-1}
$$

把上一动作加入扩展状态：

$$
\tilde x_t
=
\begin{bmatrix}
x_t\\u_{t-1}
\end{bmatrix}
$$

恢复 Markov 线性系统。

忽略延迟会导致相位滞后、振荡和不稳定。

## Robustness Test Matrix

对控制器组合测试：

| 维度       | 范围        |
| ---------- | ----------- |
| 质量/摩擦  | 标称值 ±20% |
| 传感器噪声 | 多个方差    |
| 动作延迟   | 0–数步      |
| 饱和       | 不同上限    |
| 初始状态   | 安全域边界  |
| 外部扰动   | 脉冲/持续   |

报告成功域，而不是只给标称轨迹。

## 讲义对照阅读路线

Lecture Notes 13 前半：

```text
有限时域
线性动力学
二次代价
Bellman
Riccati
反馈
```

每一页都保持 shape：

$$
x\in\mathbb R^n,
\quad
u\in\mathbb R^m,
\quad
A\in\mathbb R^{n\times n},
\quad
B\in\mathbb R^{n\times m}
$$

手推一维例子，再实现矩阵递推。

## 补充练习

### 练习 8：离散化

减小采样间隔通常怎样影响 Euler 近似？

答案：局部近似更准确，但控制更新和计算频率提高。

### 练习 9：延迟

如何让包含上一动作的系统恢复 Markov 状态？

答案：把上一动作加入扩展状态。

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
