---
title: P19：K-means、高斯混合与 EM
description: 对应 B 站 P19 与 CS229 Lecture 14，从硬聚类、失真函数进入高斯混合、隐变量、责任度与 EM 基本结构。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 无监督学习设定

数据没有外部标签：

$$
\mathcal D=
\{x^{(1)},\ldots,x^{(m)}\}
$$

目标是发现潜在结构。聚类希望把样本分组，使组内相似、组间不同。

“相似”必须通过距离、概率模型或下游任务明确定义。不同特征缩放会改变欧氏距离，因而直接改变聚类结果。

## K-means

![K-means 从距离矩阵、簇 ID 和 one-hot 掩码到中心更新](/images/notes/cs229/tikz/p19-kmeans-hard-assignment.png)

设簇数为 $K$，每个簇中心：

$$
\mu_1,\ldots,\mu_K
$$

每个样本分配标签：

$$
c^{(i)}\in\{1,\ldots,K\}
$$

目标函数：

$$
J(c,\mu)
=\sum_{i=1}^{m}
\left\|
x^{(i)}-\mu_{c^{(i)}}
\right\|_2^2
$$

## 分配步骤

固定中心，为每个样本选择最近簇：

$$
c^{(i)}
\leftarrow
\arg\min_k
\left\|
x^{(i)}-\mu_k
\right\|_2^2
$$

这一步对固定 $\mu$ 精确最小化 $J$。

## 更新步骤

固定分配，中心更新为簇内均值：

$$
\mu_k
\leftarrow
\frac{
\sum_i\mathbf1\{c^{(i)}=k\}x^{(i)}
}{
\sum_i\mathbf1\{c^{(i)}=k\}
}
$$

均值是平方距离和的最优中心。

## 收敛与局部最优

两步都不增加目标，因此：

$$
J^{(t+1)}\le J^{(t)}
$$

分配方式有限，所以算法最终稳定。但它只保证收敛到局部最优或稳定点。

应使用多次随机初始化，保留失真最小且结构稳定的结果。K-means++ 能改善初始中心选择。

## K-means 的几何假设

K-means 偏好：

- 近似球形簇；
- 各方向尺度相近；
- 簇大小和密度相近；
- 欧氏距离有意义。

细长、非凸、密度差异大的簇可能被错误切分。标准化特征是起点，但不能修复不适合欧氏距离的问题。

## 从硬分配到概率模型

K-means 给每个样本唯一标签。高斯混合模型允许软归属：

$$
P(z^{(i)}=k\mid x^{(i)})
$$

生成过程：

$$
z\sim\operatorname{Categorical}(\phi)
$$

$$
x\mid z=k
\sim\mathcal N(\mu_k,\Sigma_k)
$$

观测密度：

$$
p(x)
=\sum_{k=1}^{K}
\phi_k
\mathcal N(x;\mu_k,\Sigma_k)
$$

## 隐变量困难

若 $z^{(i)}$ 可见，参数估计只是按类别计算频率、均值和协方差。

但实际只观察 $x$，对数似然：

$$
\ell(\theta)
=\sum_i
\log
\sum_k
\phi_k
\mathcal N(x^{(i)};\mu_k,\Sigma_k)
$$

对数外包着求和，不能像完整数据似然那样直接分解。

## E 步

用当前参数计算责任度：

$$
w_k^{(i)}
=P(z^{(i)}=k\mid x^{(i)};\theta)
$$

Bayes 公式：

$$
w_k^{(i)}
=
\frac{
\phi_k\mathcal N(x^{(i)};\mu_k,\Sigma_k)
}{
\sum_j
\phi_j\mathcal N(x^{(i)};\mu_j,\Sigma_j)
}
$$

对每个样本：

$$
\sum_kw_k^{(i)}=1
$$

## M 步

有效样本数：

$$
N_k=\sum_iw_k^{(i)}
$$

更新混合权重：

$$
\phi_k=\frac{N_k}{m}
$$

更新均值：

$$
\mu_k
=\frac{1}{N_k}
\sum_iw_k^{(i)}x^{(i)}
$$

更新协方差：

$$
\Sigma_k
=\frac{1}{N_k}
\sum_iw_k^{(i)}
(x^{(i)}-\mu_k)
(x^{(i)}-\mu_k)^\top
$$

## GMM 与 K-means

若各分量使用相同球形协方差：

$$
\Sigma_k=\sigma^2I
$$

并让 $\sigma^2$ 很小，责任度趋近 one-hot，GMM 的软分配接近 K-means 硬分配。

但一般 GMM 能表达不同方向、尺度和重叠程度，K-means 只是其受限极端情形。

## 数值与退化

若某个高斯中心落在单一样本上并让协方差趋近零，似然可能趋向无穷，导致奇异解。

实践中：

- 对协方差加入 $\epsilon I$；
- 使用 Cholesky 和 log-sum-exp；
- 监控最小特征值和有效样本数；
- 重启塌缩分量；
- 使用多次初始化；
- 不只按训练似然选择 $K$。

## K-means 的目标函数

设有 $K$ 个簇，簇中心为 $\mu_1,\ldots,\mu_K$，样本分配为 $c^{(i)}\in\{1,\ldots,K\}$。

K-means 最小化簇内平方距离：

$$
J(c,\mu)
=
\sum_{i=1}^{m}
\left\|
x^{(i)}-\mu_{c^{(i)}}
\right\|_2^2
$$

分配步骤固定中心，对每个样本选择最近中心：

$$
c^{(i)}
\leftarrow
\arg\min_k
\|x^{(i)}-\mu_k\|_2^2
$$

这一步逐样本得到当前中心下的最优分配，因此目标不会增加。

更新步骤固定分配，对每个簇选择样本均值：

$$
\mu_k
\leftarrow
\frac{
\sum_i
\mathbf1\{c^{(i)}=k\}x^{(i)}
}{
\sum_i
\mathbf1\{c^{(i)}=k\}
}
$$

样本均值是平方距离和的最优常数中心，所以目标同样不会增加。

两个步骤交替执行，目标单调不增。由于可能分配有限，算法最终停在局部最优或稳定点，但不保证全局最优。

## 初始化与空簇

随机选取 $K$ 个样本作为中心简单，但可能选到相近位置，导致差的局部解。

K-means++ 先随机选择一个中心，之后按样本到已有最近中心的平方距离比例选择新中心。它倾向让初始中心分散。

实践中应运行多个随机初始化，选择最终目标最小且验证更稳定的结果。

若某簇在分配后没有样本，均值无法计算。可重新把该中心放到当前误差最大的样本，或从大簇中拆分一个中心。

空簇不是简单设为零。零向量可能与数据空间无关，并导致后续结果异常。

## K-means 的假设与预处理

欧氏距离隐含各方向尺度可比较、簇近似球形且方差相似。

特征量纲不同会让大尺度特征主导距离，因此通常先标准化。

类别特征、周期变量和文本需要合适表示。不能把类别 ID 直接当连续数值计算距离。

离群点会强烈拉动均值。可先处理异常值，或考虑 K-medoids、稳健混合模型和基于密度的方法。

$K$ 可通过肘部图、Silhouette、稳定性和下游任务选择。仅观察训练失真会总是偏好更大的 $K$。

## 从 K-means 到 GMM

![从 K-means 硬分配转向 GMM 责任度矩阵和加权参数更新](/images/notes/cs229/tikz/p19-kmeans-gmm-responsibilities.png)

K-means 给每个样本一个硬分配。GMM 假设样本由多个 Gaussian 成分生成：

$$
p(x)
=
\sum_{k=1}^{K}
\phi_k
\mathcal N(x;\mu_k,\Sigma_k)
$$

其中：

$$
\phi_k\ge0,
\qquad
\sum_k\phi_k=1
$$

引入隐变量 $z^{(i)}$ 表示第 $i$ 个样本来自哪个成分。

若 $z^{(i)}$ 已知，每个成分的参数估计只是带分组的 Gaussian MLE。困难在于只观察到 $x^{(i)}$，没有观察到 $z^{(i)}$。

## GMM 的 E 步

责任度定义为：

$$
\gamma_{ik}
=
p(z^{(i)}=k\mid x^{(i)})
$$

由 Bayes 公式：

$$
\gamma_{ik}
=
\frac{
\phi_k
\mathcal N(x^{(i)};\mu_k,\Sigma_k)
}{
\sum_{j=1}^{K}
\phi_j
\mathcal N(x^{(i)};\mu_j,\Sigma_j)
}
$$

对每个样本：

$$
\sum_k\gamma_{ik}=1
$$

责任度是软分配。一个位于两个簇之间的样本可以同时对两个成分产生部分贡献。

实现必须在对数空间计算各成分 log-density，再使用 LogSumExp 归一化。

## GMM 的 M 步

![GMM 责任度沿样本轴形成软计数和加权均值更新](/images/notes/cs229/tikz/concept-gmm-em-updates.png)

有效样本数：

$$
N_k
=
\sum_{i=1}^{m}
\gamma_{ik}
$$

混合权重：

$$
\phi_k
\leftarrow
\frac{N_k}{m}
$$

均值：

$$
\mu_k
\leftarrow
\frac1{N_k}
\sum_i
\gamma_{ik}x^{(i)}
$$

协方差：

$$
\Sigma_k
\leftarrow
\frac1{N_k}
\sum_i
\gamma_{ik}
(x^{(i)}-\mu_k)
(x^{(i)}-\mu_k)^\top
$$

这些是带软权重的 Gaussian MLE。

E 步计算当前参数下的后验分配，M 步使用分配更新参数，交替使观测对数似然不下降。

## GMM 退化问题

某个 Gaussian 成分可能把均值放到单个样本，并让协方差趋近零。该样本密度趋于无穷，似然没有有限上界。

常见防护：

- 在协方差对角线上加 $\epsilon I$；
- 约束最小成分权重；
- 使用共享或对角协方差；
- 删除极小有效样本数的成分；
- 使用先验做 MAP 估计。

还应监控每轮 log-likelihood、最小协方差特征值和 $N_k$。

## K-means 是 GMM 的极限直觉

若所有成分协方差相同且为：

$$
\Sigma_k=\sigma^2I
$$

后验责任度主要由到中心的平方距离决定。

当 $\sigma^2\to0$，最近中心的责任度趋近 1，其他趋近 0，软分配接近 K-means 硬分配。

因此 K-means 可看成一种受限、小方差 GMM 的极限算法，但两者目标和不确定性表达仍不同。

## 练习与答案思路

### 练习 1：单调性

K-means 为什么每次分配步骤不会增加目标？

答案：固定中心后，每个样本独立选择平方距离最小的簇，得到当前条件下的最优分配。

### 练习 2：特征尺度

年龄范围 18–80、收入范围 0–1,000,000，直接做 K-means 会发生什么？

答案：收入差异会主导欧氏距离，应根据语义缩放或设计合适距离。

### 练习 3：责任度

$\gamma_{ik}$ 的两层含义是什么？

答案：它是样本 $i$ 属于成分 $k$ 的后验概率，也是 M 步中该样本对成分参数的软权重。

### 练习 4：协方差退化

GMM 某个成分只捕获一个样本且协方差持续缩小时，应如何处理？

答案思路：加入协方差下限或正则、限制成分权重，并考虑重新初始化或删除该成分。

## 怎样选择簇数

K-means 训练目标随 $K$ 增加不会上升，因此直接选择最小失真会得到最大允许 $K$。

Elbow Method 观察：

$$
J_K
$$

随 $K$ 的下降何时明显变缓。拐点常带主观性。

Silhouette 对样本 $i$：

$$
s_i
=
\frac{
b_i-a_i
}{
\max(a_i,b_i)
}
$$

$a_i$ 是同簇平均距离，$b_i$ 是最近其他簇平均距离。

接近 1 表示簇内紧、簇间远，接近 0 表示边界，负值表示可能分错。

GMM 可使用验证 log-likelihood、AIC 或 BIC。

BIC：

$$
\operatorname{BIC}
=
-2\ell(\hat\theta)
+
d\log m
$$

$d$ 是自由参数数。它在拟合与模型复杂度间权衡。

最终 $K$ 还应结合稳定性、解释和下游任务。

## 聚类稳定性

对数据重采样或更换初始化，重复聚类。

由于簇编号可置换，不能直接比较标签数字。可使用 Adjusted Rand Index、Normalized Mutual Information 或先做最佳标签匹配。

如果轻微扰动导致簇结构完全变化，说明数据没有强聚类结构，或算法/参数不稳。

稳定不等于有业务意义。一个稳定簇也可能只反映数据来源或设备批次。

## 高维距离集中

高维空间中，不同样本间欧氏距离可能趋于相近，最近与最远邻居差别变小。

无关维度累积噪声，使 K-means 难以识别真正结构。

可进行：

- 特征选择；
- 标准化；
- PCA；
- 领域距离；
- 稀疏聚类；
- 子空间聚类。

但 PCA 只保留高方差方向，不保证保留聚类分离方向，应验证。

## 协方差结构与参数量

GMM 每个全协方差成分参数约：

$$
\frac{n(n+1)}2
$$

高维、小样本时非常昂贵。

常见结构：

```text
spherical：每成分一个方差
diag：每成分每维一个方差
tied：所有成分共享全协方差
full：每成分完整协方差
```

结构越灵活，拟合能力和退化风险越高。

通过验证 likelihood、BIC、稳定性和计算预算选择。

## 缺失数据与 GMM

若每个样本只观察部分维度，Gaussian 的边缘分布仍可计算。

E 步责任度基于已观察维度的边缘 density。

M 步需要缺失变量的一阶与二阶条件期望。

这也是 EM 的典型用途：把缺失值当隐变量，而不是先用单一均值填充后假装完整观察。

实现复杂度更高，且缺失机制若不是随机，模型仍可能偏置。

## 聚类结果怎样解释

为每个簇报告：

- 样本数；
- 中心或均值；
- 方差与关键分位数；
- 代表样本；
- 与总体的差异；
- 时间与来源分布；
- 稳定性；
- 下游指标。

不要只给簇起“高价值用户”等名字。命名需要独立业务证据，且同一簇内部仍可能异质。

可视化降维图只用于辅助，二维投影可能夸大或掩盖高维关系。

## GMM 的初始化

常用 K-means 结果初始化均值。

协方差用簇内样本协方差并加入 jitter。

混合权重用簇样本比例。

运行多个初始化，选择最终验证 likelihood 较好且没有退化的解。

如果某成分有效样本数极小，可重新初始化到高残差区域。

## 无监督项目

选择一个没有天然标签的数据集：

1. 数据审计与缩放；
2. K-means 多初始化；
3. $K$ 的失真与 Silhouette；
4. 稳定性分析；
5. GMM 不同协方差结构；
6. 训练与验证 likelihood；
7. BIC；
8. 代表样本；
9. 下游任务或人工审查；
10. 失败边界。

若有隐藏标签，只用于外部评价，不参与聚类训练和调参。

## 补充练习

### 练习 5：BIC

增加成分一定降低 BIC 吗？

答案：不一定。Likelihood 改善，但参数惩罚也增加。

### 练习 6：标签置换

两次聚类结构相同但簇编号互换，直接 Accuracy 会怎样？

答案：会错误认为完全不同，应使用置换不变指标或匹配编号。

### 练习 7：协方差结构

高维小样本时为什么 `full` covariance 危险？

答案：参数量二次增长，估计易奇异和过拟合。

## 图像颜色压缩案例

把每个像素表示为 RGB 向量：

$$
x^{(i)}
\in
\mathbb R^3
$$

使用 K-means 聚成 $K$ 个颜色中心。

压缩时，每个像素只保存最近中心编号：

$$
c^{(i)}
\in
\{1,\ldots,K\}
$$

解码时用：

$$
\mu_{c^{(i)}}
$$

替换原颜色。

$K=16$ 时每个像素索引只需 4 bit，另保存 16 个 RGB 中心。

评价包括重建 MSE、感知质量、压缩率和不同初始化稳定性。

颜色分布未必球形，但这个案例直观展示了向量量化。

## Anomaly Detection with GMM

训练 GMM 后，样本 log-density：

$$
\log p(x)
$$

低于阈值可标记异常。

阈值在独立验证异常数据上选择。

高维 density 受维度和模型错设影响，低 density 不一定是业务异常。

还应检查成分责任度、最近训练样本和异常类型。

## EM 的调试数据

使用一维两成分合成数据：

$$
0.4\mathcal N(-2,1)
+
0.6\mathcal N(3,0.5^2)
$$

验证：

- 责任度每行和为 1；
- log-likelihood 单调；
- 均值接近真实值；
- 标签置换视为同一解；
- 多初始化；
- 协方差下限。

先在一维画 density 和责任度，再扩展高维。

## 讲义对照阅读路线

Lecture Notes 7a：

```text
K-means 目标
分配
均值更新
局部最优
```

Lecture Notes 7b：

```text
GMM 生成模型
隐类别
责任度
Gaussian 参数
```

Lecture Notes 8 前半：

```text
EM 一般结构
观测与完整似然
```

把三份讲义连接为“硬分配 → 概率软分配 → 一般隐变量优化”。

## 补充练习

### 练习 8：颜色压缩

K-means 中每个颜色中心是什么？

答案：分到该簇的像素 RGB 均值。

### 练习 9：异常阈值

能否只根据训练 density 最小值设置生产异常阈值？

答案：不可靠，应使用独立验证、真实异常与成本选择。

## 本节检查

- 能写出 K-means 失真函数；
- 能证明分配和更新步骤不增加目标；
- 能说明局部收敛为何需要多次初始化；
- 能写出 GMM 生成过程；
- 能解释隐变量为何导致 log-sum；
- 能计算 E 步责任度；
- 能写出 M 步加权参数估计；
- 能说明 GMM 退化与协方差正则化。

下一节进入 [P20：EM 与 Factor Analysis](/notes/cs229/course/p20-em-factor-analysis)。

## 来源说明

- 视频：[B 站 P19：Lecture 14](https://www.bilibili.com/video/BV1fP4y127nn/?p=19)
- K-means：[Lecture Notes 7a](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes7a.pdf)
- GMM：[Lecture Notes 7b](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes7b.pdf)
- EM：[Lecture Notes 8](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes8.pdf)
- 作业：[Problem Set 3](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS3/ps3.pdf)

中文内容按本节从硬聚类到软隐变量模型的推进顺序组织。
