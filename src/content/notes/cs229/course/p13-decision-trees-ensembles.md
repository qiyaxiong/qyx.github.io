---
title: P13：决策树与集成学习
description: 对应 B 站 P13 与 CS229 Lecture 10，从递归切分、纯度和剪枝进入 Bagging、随机森林、AdaBoost 与 Gradient Boosting。
publishDate: 2026-07-26
updatedDate: 2026-07-26
language: zh
---

## 树模型如何表示非线性

决策树用一系列条件把特征空间递归切成区域。

数值特征切分：

$$
x_j\le s
$$

样本根据条件进入左右子树。叶节点输出常数预测。

单个切分是轴对齐边界，多个切分组合后可以形成复杂的分段常数函数。

## 回归树

区域 $R$ 中以均值作为预测：

$$
\hat y_R
=\frac{1}{|R|}
\sum_{i:x^{(i)}\in R}
y^{(i)}
$$

平方误差：

$$
L(R)
=\sum_{i:x^{(i)}\in R}
\left(
y^{(i)}-\hat y_R
\right)^2
$$

选择特征 $j$ 与阈值 $s$，最小化左右区域总损失：

$$
L(R_{\mathrm{left}})
+L(R_{\mathrm{right}})
$$

## 分类树纯度

节点中类别 $k$ 比例为 $p_k$。

分类错误率：

$$
1-\max_kp_k
$$

Gini impurity：

$$
1-\sum_kp_k^2
$$

Entropy：

$$
-\sum_kp_k\log p_k
$$

选择使子节点加权不纯度下降最多的切分。

不同指标经常给出相近树，但在小样本和类别不平衡时仍需验证。

## 贪心递归切分

![决策树候选切分如何路由样本并计算加权不纯度下降](/images/notes/cs229/tikz/concept-tree-split-impurity.png)

寻找全局最优树通常计算困难，因此使用贪心算法：

1. 枚举当前节点候选切分；
2. 选择即时损失下降最大的切分；
3. 对子节点递归；
4. 满足停止条件后生成叶节点。

贪心切分不回溯，早期选择会限制后续结构。

## 类别与缺失特征

低基数类别可枚举类别子集，高基数类别会产生巨大搜索空间。

直接把类别编码成整数并使用大小切分，会人为引入顺序。应使用支持类别特征的算法、合理编码或目标统计，但目标编码必须避免泄漏。

缺失值可通过替代切分、单独类别、插补或模型原生缺失方向处理。训练和部署必须使用一致规则。

## 树的过拟合

不限制深度时，树可以为少量样本建立叶节点，训练误差很低、方差很高。

预剪枝参数包括：

- 最大深度；
- 叶节点最小样本数；
- 切分最小增益；
- 最大叶节点数。

后剪枝先生成较大树，再用验证目标删除收益不足的分支。

## 为什么 Bagging 有效

![Bagging 通过 Bootstrap 和模型轴平均降低预测方差](/images/notes/cs229/tikz/p13-bagging-variance-reduction.png)

训练多个模型 $f_b(x)$，平均预测：

$$
\bar f(x)
=\frac1B\sum_{b=1}^{B}f_b(x)
$$

若模型误差方差为 $\sigma^2$、两两相关系数为 $\rho$，平均误差方差近似：

$$
\rho\sigma^2
+\frac{1-\rho}{B}\sigma^2
$$

增加模型数只能消除不相关部分；降低模型相关性同样重要。

## Bootstrap

Bagging 每次从 $m$ 个训练样本中有放回采样 $m$ 次，得到不同 bootstrap 数据集，再训练一个基础模型。

单棵深树对数据扰动敏感，正适合通过平均降低方差。

未被某棵树抽到的样本称为 out-of-bag 样本，可用于近似验证。

## 随机森林

随机森林在 Bagging 基础上，每个节点只从随机特征子集中选择切分。

特征随机性降低树之间相关性。即使某个强特征能在多数节点占优，也不会让所有树形成几乎相同结构。

关键超参数包括树数、单节点候选特征数、树深和叶节点最小样本数。

## Boosting 的不同思路

Bagging 并行训练高方差模型后平均。Boosting 顺序训练弱学习器，让后续模型关注当前组合仍未解决的部分。

最终模型：

$$
F_T(x)
=\sum_{t=1}^{T}\alpha_th_t(x)
$$

每一轮添加一个新学习器。

## AdaBoost

![AdaBoost 根据错分掩码和弱学习器错误率更新样本权重](/images/notes/cs229/tikz/p13-adaboost-weight-update.png)

初始化样本权重：

$$
w_i^{(1)}=\frac1m
$$

第 $t$ 轮训练弱分类器 $h_t$，加权错误率：

$$
\varepsilon_t
=\sum_iw_i^{(t)}
\mathbf1\{h_t(x^{(i)})\ne y^{(i)}\}
$$

学习器权重：

$$
\alpha_t
=\frac12\log
\frac{1-\varepsilon_t}{\varepsilon_t}
$$

提高误分类样本权重：

$$
w_i^{(t+1)}
\propto
w_i^{(t)}
\exp\left(
-\alpha_ty^{(i)}h_t(x^{(i)})
\right)
$$

## Gradient Boosting

把加法模型视为函数空间中的梯度下降。

对损失：

$$
\sum_iL(y^{(i)},F(x^{(i)}))
$$

第 $t$ 轮计算负梯度伪残差：

$$
r_i^{(t)}
=-
\left.
\frac{\partial L(y^{(i)},F(x^{(i)}))}
{\partial F(x^{(i)})}
\right|_{F=F_{t-1}}
$$

训练新树拟合 $r_i^{(t)}$，然后：

$$
F_t(x)
=F_{t-1}(x)+\eta h_t(x)
$$

$\eta$ 是学习率。

## 集成方法的诊断

随机森林树数增加通常不会像单树深度那样直接导致过拟合，但计算和延迟增加。

Boosting 更容易受学习率、树深和轮数影响，标签噪声与异常点也可能被持续放大。

比较时记录：

- 训练/验证曲线；
- OOB 或交叉验证指标；
- 单类召回率；
- 推理延迟与模型大小；
- 特征重要性稳定性；
- 概率校准。

树的 impurity importance 会偏爱高基数特征，解释时应结合 permutation importance 或 SHAP，并检查相关特征的替代效应。

## 一次分类树切分的数值例子

假设一个节点有 10 个样本，其中 6 个正类、4 个负类。父节点 Gini impurity：

$$
G_{\text{parent}}
=
1-\left(\frac6{10}\right)^2-\left(\frac4{10}\right)^2
=
0.48
$$

候选切分产生左节点 4 正 1 负，右节点 2 正 3 负。

左节点：

$$
G_L
=
1-\left(\frac45\right)^2-\left(\frac15\right)^2
=
0.32
$$

右节点：

$$
G_R
=
1-\left(\frac25\right)^2-\left(\frac35\right)^2
=
0.48
$$

加权不纯度：

$$
G_{\text{split}}
=
\frac5{10}G_L+\frac5{10}G_R
=
0.40
$$

不纯度下降：

$$
\Delta G
=
0.48-0.40
=
0.08
$$

训练算法枚举候选特征和阈值，选择不纯度下降最大的切分。

回归树常使用节点内平方误差。给定叶节点样本，最优常数预测是该节点目标均值。

## 决策树为什么高方差

树使用贪心离散切分。训练数据的轻微变化可能让根节点选择另一个阈值，之后整棵子树结构都不同。

深树可以把训练集切成很小的叶节点，训练偏差低，但对采样扰动敏感。

控制复杂度的方法包括：

- 最大深度；
- 叶节点最小样本数；
- 最小不纯度下降；
- 最大叶节点数；
- 代价复杂度剪枝。

这些超参数必须在验证集或交叉验证中选择。

## Bagging 降低方差的公式

设每棵树预测误差方差为 $\sigma^2$，两棵树误差相关系数为 $\rho$。平均 $B$ 棵树后：

$$
\operatorname{Var}
\left(
\frac1B\sum_{b=1}^{B}T_b
\right)
=
\rho\sigma^2
+
\frac{1-\rho}{B}\sigma^2
$$

增加树数会让第二项趋近零，但相关误差项 $\rho\sigma^2$ 不会消失。

Bagging 通过 Bootstrap 让每棵树看到不同样本。随机森林还在每个节点只考虑随机特征子集，进一步降低树之间相关性。

这解释了为什么随机森林不只是“更多树”：关键是强学习器之间要有差异。

## Bootstrap 与袋外评估

每棵树从 $m$ 个样本中有放回抽取 $m$ 次。某个样本一次都没被抽中的概率：

$$
\left(1-\frac1m\right)^m
\approx e^{-1}
\approx0.368
$$

因此每棵树大约有 $36.8\%$ 的袋外样本。

对每个训练样本，可以只使用未见过它的树预测，形成 Out-of-Bag 评估。

OOB 分数能提供低成本验证估计，但若数据有时间或群组结构，普通 Bootstrap 仍可能破坏部署协议，不能代替正确划分。

## AdaBoost 的加法模型视角

AdaBoost 构造：

$$
F_T(x)
=
\sum_{t=1}^{T}
\alpha_t h_t(x)
$$

其中弱分类器 $h_t(x)\in\{-1,+1\}$。

第 $t$ 轮使用样本权重 $w_i^{(t)}$ 训练弱分类器，计算加权错误率：

$$
\epsilon_t
=
\frac{
\sum_iw_i^{(t)}
\mathbf1\{h_t(x_i)\ne y_i\}
}{
\sum_iw_i^{(t)}
}
$$

分类器权重：

$$
\alpha_t
=
\frac12
\log\frac{1-\epsilon_t}{\epsilon_t}
$$

更新样本权重：

$$
w_i^{(t+1)}
=
w_i^{(t)}
\exp\left(
-\alpha_t y_i h_t(x_i)
\right)
$$

错分样本的权重增加，正确样本权重下降。最终预测为 $\operatorname{sign}(F_T(x))$。

AdaBoost 可解释为逐步最小化指数损失：

$$
\sum_i\exp(-y_iF(x_i))
$$

它会高度关注难例，也因此对错误标签和离群点敏感。

## Gradient Boosting 是函数空间梯度下降

![Gradient Boosting 计算函数空间负梯度、拟合弱学习器并更新集成分数](/images/notes/cs229/tikz/concept-gradient-boosting-residual.png)

Gradient Boosting 构造加法模型：

$$
F_t(x)
=
F_{t-1}(x)
+
\eta h_t(x)
$$

每轮计算损失对当前预测的负梯度，也称伪残差：

$$
r_i^{(t)}
=
-
\left.
\frac{\partial
\ell(y_i,F(x_i))}
{\partial F(x_i)}
\right|_{F=F_{t-1}}
$$

训练一棵小树拟合 $r_i^{(t)}$，再以学习率 $\eta$ 加入模型。

平方损失下，伪残差就是普通残差 $y_i-F_{t-1}(x_i)$。

学习率小、树多通常比学习率大、树少更稳健，但训练成本更高。树深决定每个基学习器能表达的交互阶数。

## 特征重要性的边界

基于不纯度下降的重要性容易偏向可切分点多或基数高的特征。

Permutation Importance 在验证集上打乱一个特征，观察性能下降，更接近“模型依赖程度”，但相关特征之间会互相替代。

SHAP 等方法解释的是给定模型的预测分解，不自动证明因果关系。

任何重要性分析都应在独立数据上进行，并结合特征相关性、数据生成过程和稳定性检查。

## 练习与答案思路

### 练习 1：树的偏差与方差

增加最大深度通常怎样影响训练偏差和模型方差？

答案：训练偏差下降，方差通常上升。

### 练习 2：随机森林随机性

随机特征子集为什么可能提高整体表现？

答案思路：单棵树可能略弱，但树之间相关性下降，平均后方差降低。

### 练习 3：Boosting 难例

错误标签为什么会伤害 AdaBoost？

答案：错误标签持续被错分，权重不断增大，后续模型会过度追逐不可解释的噪声。

### 练习 4：比较 Bagging 与 Boosting

两者主要解决什么不同问题？

答案思路：Bagging 并行平均高方差模型；Boosting 顺序拟合前一轮残差或难例，主要降低偏差并形成强加法模型。

## 类别特征怎样切分

无序类别特征不能按任意整数编码直接使用“小于阈值”。

低基数类别可以枚举类别子集：

$$
x_j\in S
$$

但 $K$ 个类别有指数数量的子集。

常见实现会按目标统计排序、使用启发式搜索或原生类别算法。

Target Encoding 必须在训练 fold 内计算，并对低频类别平滑。直接用全数据标签均值编码会产生严重泄漏。

高基数 ID 类特征容易让树记忆训练实体，应检查新实体泛化。

## 缺失值处理

可以先统一填充并增加缺失指示。

部分树算法在每个切分学习缺失值默认方向。

还有 surrogate split：主特征缺失时，使用与主切分最相似的备选特征。

缺失本身可能带信息，但也可能反映数据管道故障。应比较训练与线上缺失机制。

## 剪枝

![代价复杂度剪枝如何在训练误差和叶节点数量之间选择子树](/images/notes/cs229/tikz/concept-tree-pruning.png)

先长出较深树，再最小化：

$$
R_\alpha(T)
=
R(T)+\alpha|T|
$$

$R(T)$ 是叶节点经验误差，$|T|$ 是叶节点数。

$\alpha$ 大时更偏好小树。

Weakest Link Pruning 生成一串嵌套子树，再用验证或交叉验证选择。

预剪枝通过最大深度、最小叶样本等提前停止；后剪枝允许先观察完整结构再简化。

## Random Forest 的超参数

树数增加通常不会导致传统意义上的过拟合，而是让平均趋于稳定，但训练、内存和预测成本增长。

`max_features` 小会降低树相关性，但单树更弱。

`min_samples_leaf` 增大使叶预测更平滑。

`max_depth` 控制单树复杂度。

Bootstrap 是否开启、类别权重和切分准则也会影响结果。

应观察 OOB/验证曲线随树数是否平台化，而不是盲目使用极大树数。

## Boosting 的正则化

Learning Rate：

$$
F_t=F_{t-1}+\eta h_t
$$

$\eta$ 小使每棵树贡献有限，通常需要更多轮。

树深控制交互阶数。深度 1 的 stump 主要表达加性效应，深树表达高阶交互。

Subsampling 每轮只用部分样本，形成 Stochastic Gradient Boosting，可降低方差。

列采样、叶节点约束、$L_1/L_2$ 叶权重和早停都是常见正则。

Boosting 轮数必须在验证集选择。

## 类别概率与校准

随机森林概率通常是各树叶节点类别比例的平均。

Boosting 分类概率来自加法 logits 的链接函数。

两者都可能未校准。深叶或类别重采样会进一步改变概率。

若决策依赖概率，应画可靠性图并使用独立校准。

Ranking 很好不代表概率准确。

## 树模型的外推

回归树叶节点输出训练目标均值。对于超出训练特征范围的新样本，它仍落入某个边界叶节点，通常输出常数。

树不会像线性模型那样自然延伸趋势。

时间增长、物理关系等需要外推的任务，应特别检查。

可加入趋势特征、混合线性模型，或选择具有适当结构的模型。

## 表格任务项目

比较：

```text
线性/逻辑回归
单棵树
随机森林
Gradient Boosting
```

统一数据切分和搜索预算。

报告：

- 单树可视化；
- 深度与训练/验证误差；
- 树数曲线；
- OOB 与验证差异；
- Boosting 学习率—轮数；
- 缺失与类别特征处理；
- 校准；
- 推理成本；
- 特征重要性稳定性。

用 Permutation Importance 和错误分析验证模型是否依赖可疑特征。

## 补充练习

### 练习 5：Bagging 方差

树数趋于无穷时，相关误差项会消失吗？

答案：不会，方差下限约为 $\rho\sigma^2$，所以降低树相关性很重要。

### 练习 6：Boosting 早停

训练损失持续下降但验证损失开始上升，应怎样处理？

答案：使用验证早停、增强正则或减小树复杂度。

### 练习 7：外推

训练目标随时间近似线性增长，测试时间超出训练范围，普通回归树会怎样？

答案：通常输出边界叶的常数，无法自然延伸线性趋势。

## Monotonic Constraints

某些任务有可信单调关系，例如其他条件不变，债务增加不应降低风险预测。

树 Boosting 可加入：

$$
\frac{\partial f}{\partial x_j}\ge0
$$

的单调约束。

约束减少不合理局部波动，并可能改善小数据泛化。

但只有在因果与业务语义可信时使用。相关变量、交互和测量误差可能让表面单调假设失效。

## Histogram-based Trees

精确枚举连续特征所有阈值成本高。

Histogram 算法先把特征分箱，在 bin 边界上搜索切分。

优点：

- 降低计算与内存；
- 可缓存梯度统计；
- 适合大规模 Boosting。

分箱是近似，极端值、缺失与类别特征要专门处理。

## Leaf Value in Gradient Boosting

每棵树先决定叶结构，再为每个叶求最优输出。

二阶 Boosting 使用梯度 $g_i$ 和 Hessian $h_i$。

叶权重近似：

$$
w^\star
=
-
\frac{
\sum_{i\in leaf}g_i
}{
\sum_{i\in leaf}h_i+\lambda
}
$$

切分增益比较切分前后最优目标下降。

这解释了 XGBoost 类算法为什么同时累积一阶和二阶统计。

## 讲义对照阅读路线

先读 Decision Trees：

```text
递归分区
切分准则
停止/剪枝
分类与回归叶
```

再读 Ensemble：

```text
Bootstrap
Bagging
Random Forest
Boosting
```

画一张二维数据的单树边界，再画多树平均，观察方差降低。

对 Boosting 逐轮画 residual，观察新树怎样修补旧模型。

## 补充练习

### 练习 8：单调约束

单调约束是否证明特征对结果有因果作用？

答案：不证明，它只是模型形状约束。

### 练习 9：Histogram

分箱树为何比精确阈值搜索快？

答案：候选阈值数量大幅减少，统计可按 bin 聚合。

## 本节检查

- 能写出回归树区域损失；
- 能比较 Gini、Entropy 与分类错误率；
- 能解释树为什么容易高方差；
- 能用误差相关性解释 Bagging；
- 能说明随机森林怎样降低树之间相关性；
- 能写出 AdaBoost 的加权错误和样本权重更新；
- 能把 Gradient Boosting 解释为函数空间梯度下降；
- 能指出特征重要性与概率输出的诊断风险。

下一节进入 [P14：神经网络基础](/notes/cs229/course/p14-neural-networks-introduction)。

## 来源说明

- 视频：[B 站 P13：Lecture 10](https://www.bilibili.com/video/BV1fP4y127nn/?p=13)
- 决策树：[Decision Trees Notes](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes-dt.pdf)
- 集成学习：[Ensemble Learning Notes](https://github.com/maxim5/cs229-2018-autumn/blob/main/notes/cs229-notes-ensemble.pdf)
- 作业：[Problem Set 2](https://github.com/maxim5/cs229-2018-autumn/blob/main/problem-sets/PS2/ps2.pdf)

中文内容对应树、Bagging、随机森林与 Boosting 的课堂顺序。
