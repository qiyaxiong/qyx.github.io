---
title: P22：独立成分分析与强化学习导论
description: 对应 B 站 P22 与 CS229 Lecture 16，从盲源分离、ICA 密度变换进入序列决策、状态、动作与奖励。
publishDate: 2026-07-26
updatedDate: 2026-08-08
language: zh
---

## 一图理解本章

![从 ICA 的信号混合与独立源恢复到强化学习状态、动作、奖励和策略的六步图解](/images/notes/cs229/storyboards/p22-ica-rl-intro-storyboard.png)

先沿图中的六个步骤建立本章主线，再进入后文的公式推导、实现细节和失败诊断。

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

![ICA 通过解混矩阵恢复独立非 Gaussian 潜在源](/images/notes/cs229/tikz/p22-ica-unmixing.png)

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

![强化学习中策略、动作、环境转移、奖励和折扣回报的轨迹结构](/images/notes/cs229/tikz/p22-rl-interaction-loop.png)

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

## ICA 的生成模型

观察信号由独立源线性混合：

$$
x=As
$$

$s\in\mathbb R^n$ 是未知独立源，$A$ 是未知可逆混合矩阵。

目标是学习解混矩阵：

$$
W=A^{-1}
$$

从而：

$$
s=Wx
$$

仅凭观测 $x$，ICA 存在两个不可辨识性。

第一，源的顺序不可辨识。交换 $A$ 的列和 $s$ 的顺序不会改变 $x$。

第二，源的尺度不可辨识。把一个源乘常数，同时把混合列除以该常数，观测不变。

因此恢复结果只能确定到排列和尺度。

## 为什么非 Gaussian 很重要

若独立源全是标准 Gaussian，任何正交旋转后的变量仍是联合 Gaussian，且协方差仍为单位矩阵。

仅凭分布无法识别哪个旋转是原始源。

ICA 通常假设至多一个源为 Gaussian，并利用非 Gaussian 性识别独立方向。

中心极限定理提供直觉：独立变量的混合通常比单个源更接近 Gaussian。因此寻找“最不 Gaussian”的投影有助于恢复源。

## 变量变换与似然

![ICA 解混、源密度与变量变换 Jacobian 行列式的完整似然链](/images/notes/cs229/tikz/concept-ica-change-of-variables.png)

若：

$$
s=Wx
$$

源分量独立：

$$
p_s(s)
=
\prod_{j=1}^{n}p_j(s_j)
$$

变量变换公式：

$$
p_x(x)
=
p_s(Wx)
|\det W|
$$

所以单样本 log-likelihood：

$$
\log p_x(x)
=
\sum_j
\log p_j(w_j^\top x)
+
\log|\det W|
$$

训练集目标：

$$
\ell(W)
=
\sum_i\sum_j
\log p_j(w_j^\top x^{(i)})
+
m\log|\det W|
$$

第一项鼓励输出符合非 Gaussian 源先验，行列式项保证变换不坍缩体积。

## ICA 梯度结构

令 score function：

$$
g_j(s_j)
=
\frac{d}{ds_j}
\log p_j(s_j)
$$

普通梯度包含：

$$
g(Wx)x^\top
+
W^{-\top}
$$

自然梯度可写成更稳定的形式：

$$
\Delta W
\propto
\left(
I+g(s)s^\top
\right)W
$$

具体符号取决于 score function 定义。

实践中通常先中心化并白化数据，使协方差为单位矩阵。这样剩余混合近似正交，优化更容易。

## ICA 与 PCA 的区别

PCA 只要求输出不相关：

$$
\operatorname{Cov}(z)
\text{ 为对角矩阵}
$$

ICA 追求统计独立：

$$
p(s)
=
\prod_jp(s_j)
$$

独立蕴含不相关，但不相关一般不蕴含独立。

PCA 方向按方差排序且正交；ICA 方向不以方差大小排序，也不必在原尺度下正交。

常见流程先 PCA 白化和降维，再执行 ICA。

## 盲源分离的验证

音频源分离不能只看目标函数。还应：

- 试听或可视化恢复信号；
- 检查分量相关性和高阶依赖；
- 与已知合成源比较；
- 在多个初始化下检查稳定性；
- 识别排列和符号差异。

若源真实相关、混合非线性或传感器有时间延迟，基本 ICA 假设不成立。

## 从静态表示进入序列决策

监督学习通常假设预测不会改变下一条数据。强化学习中，动作决定未来状态分布。

在状态 $s_t$ 执行动作 $a_t$：

$$
s_{t+1}
\sim
P(\cdot\mid s_t,a_t)
$$

并得到奖励：

$$
r_t=R(s_t,a_t)
$$

策略：

$$
\pi(a\mid s)
$$

决定动作分布。

目标不是最大化当前奖励，而是最大化长期回报：

$$
G_t
=
\sum_{k=0}^{\infty}
\gamma^k r_{t+k}
$$

## 状态必须满足 Markov 性

Markov 性要求：

$$
p(s_{t+1}\mid s_t,a_t,\text{history})
=
p(s_{t+1}\mid s_t,a_t)
$$

状态应包含预测未来所需的信息。

如果只观察位置而忽略速度，控制系统的“状态”可能不完整，因为相同位置、不同速度会产生不同未来。

当观测不能完整表示状态时，问题成为 POMDP，需要维护历史、belief state 或循环表示。

## 探索与利用

利用选择当前估计最好的动作，探索选择信息不足的动作。

只利用可能永远错过更优动作；过度探索又损失即时回报。

Bandit 中常见 $\epsilon$-greedy：

$$
a_t=
\begin{cases}
\text{随机动作},&\text{概率 }\epsilon\\
\arg\max_aQ(s_t,a),&\text{其他}
\end{cases}
$$

序列决策中探索还会改变访问到的状态，风险比普通监督学习更复杂。

安全系统不能把任意随机动作直接部署到现实环境。可使用模拟器、离线数据、约束策略和人工安全边界。

## 奖励设计

奖励定义了优化方向。代理指标若与真实目标错位，策略可能找到“投机”方式获得高奖励。

例如只奖励点击率，推荐系统可能推送夸张内容；只奖励存活时间，游戏智能体可能躲避任务。

奖励设计应检查：

- 是否包含真正关心的结果；
- 是否存在容易利用的漏洞；
- 稀疏奖励是否让学习过难；
- 各奖励项尺度是否平衡；
- 优化后行为是否符合约束。

## 练习与答案思路

### 练习 1：Gaussian 源

为什么多个 Gaussian 独立源难以用 ICA 唯一恢复？

答案：白化后任意正交旋转仍具有相同标准 Gaussian 联合分布。

### 练习 2：不相关与独立

PCA 输出不相关是否保证独立？

答案：一般不保证；联合 Gaussian 等特殊情形除外。

### 练习 3：Markov 状态

控制摆杆时只用角度、不用角速度，状态是否充分？

答案：通常不充分，相同角度下未来运动取决于角速度。

### 练习 4：奖励漏洞

策略奖励上升但真实任务变差，应先检查什么？

答案：奖励定义、环境实现和评价指标是否允许策略通过非预期行为投机。

## Mutual Information 与独立性

互信息：

$$
I(X;Y)
=
\operatorname{KL}
\left(
p(x,y)
\|
p(x)p(y)
\right)
$$

互信息非负，且：

$$
I(X;Y)=0
$$

当且仅当 $X,Y$ 独立。

ICA 可理解为寻找线性变换，使输出分量间互信息尽量小。

仅让协方差为零只消除二阶依赖，互信息捕获更高阶依赖。

直接估计高维互信息困难，因此算法使用非 Gaussian 对比函数、score function 或近似。

## Kurtosis 与非 Gaussian 性

零均值变量的 kurtosis：

$$
\operatorname{kurt}(s)
=
\mathbb E[s^4]
-
3(\mathbb E[s^2])^2
$$

Gaussian 的 kurtosis 为零。

正 kurtosis 常表示重尾/尖峰，负值表示较平。

可寻找最大绝对 kurtosis 投影，但它对离群点敏感。

Negentropy 更稳健地衡量与 Gaussian 的差异，FastICA 使用非二次近似。

## FastICA 固定点更新

对单个白化分量方向 $w$，典型更新：

$$
w^{new}
\leftarrow
\mathbb E
\left[
xg(w^\top x)
\right]
-
\mathbb E
\left[
g'(w^\top x)
\right]w
$$

再归一化：

$$
w
\leftarrow
\frac{w}{\|w\|}
$$

多个分量时还需正交化，避免都收敛到同一源。

$g$ 可取 `tanh` 等非线性，选择取决于源分布与稳健性。

## ICA 预处理

先中心化：

$$
x\leftarrow x-\mu
$$

再白化：

$$
z
=
\Lambda^{-1/2}
U^\top x
$$

白化后：

$$
\operatorname{Cov}(z)=I
$$

混合矩阵的剩余自由度主要是正交旋转。

若存在很小特征值，应降维或加稳定项，避免白化放大噪声。

## RL 的轨迹概率

一条轨迹：

$$
\tau
=(s_0,a_0,r_0,\ldots,s_T)
$$

在策略 $\pi$ 下概率：

$$
p_\pi(\tau)
=
p(s_0)
\prod_{t=0}^{T-1}
\pi(a_t\mid s_t)
P(s_{t+1}\mid s_t,a_t)
$$

策略不仅选择动作，也改变未来状态分布。

这解释了为什么旧策略数据不等同于新策略的独立监督样本。

## Return、Reward 与 Value

Reward $r_t$ 是单步反馈。

Return：

$$
G_t
=
\sum_{k=0}^{\infty}
\gamma^k r_{t+k}
$$

Value：

$$
V^\pi(s)
=
\mathbb E_\pi[G_t\mid s_t=s]
$$

不能把即时 Reward 与长期 Value 混为一谈。

某动作即时奖励低，却可能进入长期高价值状态。

## Episodic 与 Continuing Tasks

Episodic 任务有终止状态，例如一局游戏。

Continuing 任务持续运行，例如资源调度。

Episodic 可使用有限时域或终止回报。

Continuing 常使用折扣回报或平均奖励。

终止和时间截断的语义不同，价值目标要正确 bootstrap。

## Policy 类型

确定性策略：

$$
a=\pi(s)
$$

随机策略：

$$
a\sim\pi(\cdot\mid s)
$$

随机策略可表达探索和在部分可观测环境中的混合行为。

离散动作可用 Categorical，连续动作可用 Gaussian 参数化。

动作范围和概率密度变换必须正确处理。

## Off-policy 数据的覆盖

若目标策略会选择行为数据从未覆盖的动作，无法从数据可靠估计结果。

支持条件可粗略写作：

$$
\pi(a\mid s)>0
\Rightarrow
\mu(a\mid s)>0
$$

$\mu$ 是行为策略。

离线 RL 最大风险之一是对分布外动作过度估值。

需要保守目标、不确定性和严格离线评价，不能让策略自由外推。

## 本节双主题项目

ICA 部分：

1. 合成三个独立非 Gaussian 信号；
2. 随机混合；
3. PCA 白化；
4. FastICA；
5. 对齐排列和符号；
6. 比较恢复误差。

RL 部分：

1. 定义小型环境状态；
2. 检查 Markov 性；
3. 写奖励与独立成功指标；
4. 比较随机与规则策略；
5. 记录轨迹；
6. 找出一个奖励漏洞。

## 补充练习

### 练习 5：互信息

互信息为零代表什么？

答案：联合分布分解为边缘分布乘积，即独立。

### 练习 6：轨迹分布

更换策略后状态数据分布为什么改变？

答案：策略改变动作概率，动作通过转移模型改变未来状态。

### 练习 7：离线覆盖

日志策略从未执行某危险动作，能否仅凭该日志准确估计新策略频繁执行它的回报？

答案：不能，缺乏支持和反事实证据。

## 鸡尾酒会合成实验

生成三个源：

```text
正弦波
方波
稀疏脉冲
```

标准化后构造随机可逆矩阵 $A$：

$$
X=AS
$$

观察混合信号通常看不出原源。

执行：

1. 中心化；
2. PCA 白化；
3. FastICA；
4. 得到 $\hat S$；
5. 对齐排列和符号；
6. 计算相关或重建。

对照实验把源换成 Gaussian，观察恢复不唯一。

再加入传感器噪声，测试稳健性。

## RL 问题定义模板

以仓库机器人为例：

状态：

```text
位置
速度
电量
载荷
障碍物
剩余任务
```

动作：

```text
移动方向
速度
充电
接单
```

奖励：

```text
完成订单
- 延迟
- 能耗
- 碰撞
```

终止与安全：

```text
任务完成
电量耗尽
碰撞
时间上限
```

若状态缺少速度或电量，Markov 性可能失败。

## Reward Shaping

稀疏终点奖励难学习，可以加入势函数 shaping：

$$
F(s,a,s')
=
\gamma\Phi(s')-\Phi(s)
$$

在适当条件下，它不改变最优策略，只改变学习信号。

任意距离奖励可能引入局部投机，例如在终点附近循环。

Shaping 项与真实任务奖励必须分别记录。

## Safety Constraint

约束 MDP 可写：

$$
\max_\pi J_R(\pi)
$$

满足：

$$
J_C(\pi)\le d
$$

$J_C$ 是碰撞、能耗或风险成本。

把安全只编码成巨大负奖励不一定可靠，策略仍可能在估计误差下违反。

现实系统需要独立约束、shield、回退和保守验证。

## 讲义对照阅读路线

Lecture Notes 11：

```text
线性混合
密度变换
独立源
ICA 梯度
```

Lecture Notes 12 开头：

```text
状态
动作
转移
奖励
策略
```

本分集是课程从表示学习转向序列决策的桥。先完成 ICA 的统计独立，再重新定义 RL 中“数据由谁产生”。

## 补充练习

### 练习 8：Gaussian 对照

为什么合成 ICA 实验应包含 Gaussian 源失败对照？

答案：验证非 Gaussian 可辨识假设，而不只展示成功案例。

### 练习 9：Shaping

任意奖励 shaping 是否都保持最优策略？

答案：不是，势函数形式有特定保证，任意代理可能改变任务。

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
