import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const courseDir = resolve(here, "../content/notes/cs229/course");

const integrations = [
  ["p01-welcome-introduction.md", "## 什么叫机器学习", "p01-learning-system-map", "机器学习系统从数据、学习算法、参数、预测到经验风险的完整闭环"],
  ["p04-locally-weighted-logistic-regression.md", "## 局部加权回归的矩阵解", "p04-locally-weighted-newton", "局部加权回归的样本权重以及 Newton 法的曲率更新"],
  ["p05-perceptron-generalized-linear-models.md", "## 构造广义线性模型", "p05-glm-exponential-family", "指数族自然参数、连接函数与广义线性模型的统一结构"],
  ["p06-section-probability.md", "## Bayes 公式", "p06-bayes-update", "Bayes 更新中先验与似然的逐点乘法及证据归一化"],
  ["p07-gda-naive-bayes.md", "## GDA 模型", "p07-gda-generative-classification", "GDA 使用共享协方差计算每个类别的生成式判别分数"],
  ["p08-support-vector-machines.md", "## 支持向量", "p08-svm-margin-kkt", "SVM 几何间隔、对偶系数和 KKT 支持向量之间的关系"],
  ["p09-section-python.md", "## 广播", "p09-broadcasting-vectorization", "NumPy 批量矩阵乘法、偏置广播与输出形状传播"],
  ["p11-data-splits-model-selection-cross-validation.md", "## K 折交叉验证", "p11-cross-validation-model-selection", "K 折交叉验证沿验证折平均并在候选超参数中完成选择"],
  ["p12-learning-theory-erm.md", "## 有限假设类与 Union Bound", "p12-erm-generalization-bound", "有限假设类中经验风险、真风险与统一收敛界的归约过程"],
  ["p13-decision-trees-ensembles.md", "## 为什么 Bagging 有效", "p13-bagging-variance-reduction", "Bagging 通过 Bootstrap 和模型轴平均降低预测方差"],
  ["p14-neural-networks-introduction.md", "## 前向传播", "p14-neural-network-forward", "神经网络批量前向传播中的通道收缩、偏置广播与激活"],
  ["p15-section-evaluation-metrics.md", "## 混淆矩阵", "p15-confusion-matrix-metrics", "从连续预测分数、阈值决策和混淆矩阵推导 Precision、Recall 与 F1"],
  ["p16-backprop-neural-network-training.md", "## 线性层反向传播", "p16-backprop-shape-flow", "线性层反向传播中参数梯度与输入梯度的两条矩阵收缩路径"],
  ["p17-ml-debugging-error-analysis.md", "## 一套从现象到行动的诊断树", "p17-ml-diagnostic-gaps", "机器学习系统从训练验证差异、误差类型到下一步行动的诊断链"],
  ["p18-section-midterm-review.md", "## 统一解题框架", "p18-midterm-unified-solution-loop", "CS229 期中模型从假设、目标、梯度到诊断的统一解题闭环"],
  ["p19-kmeans-gmm-em.md", "## 从 K-means 到 GMM", "p19-kmeans-gmm-responsibilities", "从 K-means 硬分配转向 GMM 责任度矩阵和加权参数更新"],
  ["p20-em-factor-analysis.md", "## ELBO 与 KL 分解", "p20-em-elbo-coordinate-ascent", "EM 在辅助后验与模型参数两个坐标上交替提高 ELBO"],
  ["p21-pca.md", "## 重建", "p21-pca-projection-reconstruction", "PCA 使用正交主轴完成低维投影和低秩重建"],
  ["p22-ica-reinforcement-learning.md", "## ICA 学习", "p22-ica-unmixing", "ICA 通过解混矩阵恢复独立非 Gaussian 潜在源"],
  ["p23-mdp-value-policy-iteration.md", "## 价值迭代", "p23-bellman-value-iteration", "Bellman 备份先沿下一状态求期望再沿动作轴取最大"],
  ["p24-continuous-state-mdp-model-simulation.md", "## 价值函数近似", "p24-fitted-value-iteration", "连续状态下通过模拟构造 Bellman 目标并拟合价值函数"],
  ["p25-section-critiques-of-ml.md", "## 部署反馈循环", "p25-distribution-deployment-feedback", "模型部署如何改变行为、选择机制和下一轮训练数据分布"],
  ["p26-reward-model-linear-dynamical-systems.md", "## 最优线性反馈", "p26-lqr-state-control", "LQR 将状态映射为最优控制并通过线性动力学传播"],
  ["p27-rl-debugging-diagnostics.md", "## Kalman Filter：更新", "p27-kalman-predict-update", "Kalman Filter 从状态预测、观测创新到增益加权更新"],
  ["p28-section-convolutional-neural-networks.md", "## 多通道卷积", "p28-multichannel-convolution", "多通道卷积在局部空间窗口和输入通道上的联合收缩"],
  ["p04-locally-weighted-logistic-regression.md", "## IRLS 视角", "p04-logistic-irls", "Logistic 回归如何通过概率曲率形成 IRLS 加权最小二乘更新"],
  ["p05-perceptron-generalized-linear-models.md", "## 多项分布与 Softmax", "p05-softmax-class-axis", "Softmax 在线性 logits 的类别轴上进行稳定概率归一化"],
  ["p06-section-probability.md", "## 方差与协方差", "p06-covariance-gaussian", "中心化批数据沿样本轴聚合形成对称半正定协方差矩阵"],
  ["p07-gda-naive-bayes.md", "## Naive Bayes 的对数判别", "p07-naive-bayes-log-score", "Naive Bayes 将各特征条件似然沿特征轴累加为类别 log-score"],
  ["p08-support-vector-machines.md", "## 对偶问题", "p08-svm-dual-gram", "SVM 对偶目标中的样本 Gram 矩阵、标签外积与对偶变量"],
  ["p11-data-splits-model-selection-cross-validation.md", "## 正则化", "p11-ridge-regularization", "Ridge 正则化在特征 Gram 矩阵对角线上平移特征值"],
  ["p12-learning-theory-erm.md", "## ERM 的泛化误差分解", "p12-generalization-error-decomposition", "模型超额风险中的近似误差与估计误差分解"],
  ["p13-decision-trees-ensembles.md", "## AdaBoost", "p13-adaboost-weight-update", "AdaBoost 根据错分掩码和弱学习器错误率更新样本权重"],
  ["p14-neural-networks-introduction.md", "## 多层网络", "p14-multilayer-shape-flow", "多层神经网络前向传播中通道轴变化与批次轴保持"],
  ["p15-section-evaluation-metrics.md", "## ROC 曲线", "p15-roc-threshold-sweep", "ROC 曲线如何沿阈值轴生成多组预测、计数和坐标"],
  ["p16-backprop-neural-network-training.md", "## 计算图与局部导数", "p16-vjp-chain-rule", "反向传播经过激活函数和线性层的向量 Jacobian 乘积"],
  ["p19-kmeans-gmm-em.md", "## K-means", "p19-kmeans-hard-assignment", "K-means 从距离矩阵、簇 ID 和 one-hot 掩码到中心更新"],
  ["p20-em-factor-analysis.md", "## 因子分析生成模型", "p20-factor-analysis-covariance", "因子分析通过低秩载荷和对角噪声构造观测协方差"],
  ["p21-pca.md", "## 特征值推导", "p21-pca-covariance-eigen", "PCA 对中心化数据协方差进行特征分解并选取主方向"],
  ["p22-ica-reinforcement-learning.md", "## 动作、奖励与策略", "p22-rl-interaction-loop", "强化学习中策略、动作、环境转移、奖励和折扣回报的轨迹结构"],
  ["p23-mdp-value-policy-iteration.md", "## 策略迭代", "p23-policy-iteration", "策略迭代在策略评估和贪心策略改进之间交替"],
  ["p24-continuous-state-mdp-model-simulation.md", "## 经验转移模型", "p24-empirical-transition-model", "从离散转移三元组计数构造行归一化经验 MDP 模型"],
  ["p26-reward-model-linear-dynamical-systems.md", "## Riccati 递推", "p26-riccati-recursion", "Riccati 递推如何在控制空间形成 Hessian 并求反馈增益"],
  ["p27-rl-debugging-diagnostics.md", "## 线性高斯系统", "p27-kalman-covariance-update", "Kalman Filter 在状态空间和观测空间之间传播与更新协方差"],
  ["p28-section-convolutional-neural-networks.md", "## 二维卷积的具体计算", "p28-im2col-convolution", "使用 im2col 将局部多通道卷积转换为矩阵乘法"],
  ["p02-linear-regression-gradient-descent.md", "## 批量梯度下降", "concept-gradient-descent-update", "批量梯度下降从预测、残差、梯度聚合到参数更新的完整形状链"],
  ["p04-locally-weighted-logistic-regression.md", "## 伯努利似然", "concept-logistic-likelihood", "逻辑回归从线性 logits、Sigmoid 概率到 Bernoulli 负对数似然的计算链"],
  ["p05-perceptron-generalized-linear-models.md", "## 感知机", "concept-perceptron-update", "感知机如何区分连续 margin、错分掩码和参数更新"],
  ["p05-perceptron-generalized-linear-models.md", "## Perceptron 收敛定理的直觉", "concept-perceptron-mistake-bound", "感知机错误次数上界中正确方向进展与参数范数增长的两条夹逼"],
  ["p12-learning-theory-erm.md", "## VC 维", "concept-vc-shattering", "VC 维要求同一假设类实现一组点的全部二进制标记"],
  ["p11-data-splits-model-selection-cross-validation.md", "## 贝叶斯视角", "concept-map-prior", "Gaussian 似然与 Gaussian 参数先验如何得到 Ridge MAP 目标"],
  ["p13-decision-trees-ensembles.md", "## 贪心递归切分", "concept-tree-split-impurity", "决策树候选切分如何路由样本并计算加权不纯度下降"],
  ["p13-decision-trees-ensembles.md", "## 剪枝", "concept-tree-pruning", "代价复杂度剪枝如何在训练误差和叶节点数量之间选择子树"],
  ["p13-decision-trees-ensembles.md", "## Gradient Boosting 是函数空间梯度下降", "concept-gradient-boosting-residual", "Gradient Boosting 计算函数空间负梯度、拟合弱学习器并更新集成分数"],
  ["p19-kmeans-gmm-em.md", "## GMM 的 M 步", "concept-gmm-em-updates", "GMM 责任度沿样本轴形成软计数和加权均值更新"],
  ["p20-em-factor-analysis.md", "## Jensen 不等式", "concept-jensen-elbo-gap", "观测证据、ELBO 与辅助分布到真实后验之间的 KL 缺口"],
  ["p20-em-factor-analysis.md", "## 隐因子的后验", "concept-factor-posterior", "因子分析如何从观测残差计算潜因子的 Gaussian 条件后验"],
  ["p22-ica-reinforcement-learning.md", "## 变量变换与似然", "concept-ica-change-of-variables", "ICA 解混、源密度与变量变换 Jacobian 行列式的完整似然链"],
  ["p23-mdp-value-policy-iteration.md", "## 有限时域 Bellman 递推", "concept-finite-horizon-backup", "有限时域 Bellman 方程从终点条件开始逆时间递推"],
  ["p27-rl-debugging-diagnostics.md", "## DDP 的局部二次展开", "concept-ddp-local-quadratic", "DDP 沿名义轨迹建立局部二次模型并执行反向求解与正向 rollout"],

  ["linear-regression.md", "## 先建立问题：监督学习到底在学什么", "p01-learning-system-map", "机器学习从数据、学习算法、参数、预测到经验风险的完整闭环"],
  ["linear-regression.md", "## LMS 与梯度下降：参数怎样一步步更新", "concept-gradient-descent-update", "批量梯度下降从预测、残差、梯度聚合到参数更新的完整形状链"],
  ["linear-regression.md", "## 正规方程：不迭代直接求解", "p02-normal-equation", "正规方程如何沿样本轴形成参数空间中的线性系统"],
  ["linear-regression.md", "## 最小二乘损失：为什么是平方", "p02-least-squares-projection", "最小二乘把目标分解为可解释投影与正交残差"],
  ["linear-regression.md", "## 局部加权线性回归：一个模型不必覆盖所有位置", "p04-locally-weighted-newton", "局部加权回归如何形成查询相关的样本权重与局部解"],

  ["logistic-regression-glm.md", "## 伯努利似然", "concept-logistic-likelihood", "逻辑回归从线性 logits、Sigmoid 概率到 Bernoulli 负对数似然的计算链"],
  ["logistic-regression-glm.md", "## 牛顿法", "p04-logistic-irls", "逻辑回归通过概率曲率形成 IRLS 加权最小二乘更新"],
  ["logistic-regression-glm.md", "## 广义线性模型", "p05-glm-exponential-family", "指数族自然参数、连接函数与广义线性模型的统一结构"],
  ["logistic-regression-glm.md", "## Softmax 回归", "p05-softmax-class-axis", "Softmax 在线性 logits 的类别轴上完成稳定概率归一化"],

  ["online-learning-perceptron.md", "## 感知机更新", "concept-perceptron-update", "感知机如何区分连续 margin、错分掩码和参数更新"],
  ["online-learning-perceptron.md", "## 错误上界", "concept-perceptron-mistake-bound", "感知机错误次数上界中正确方向进展与参数范数增长的两条夹逼"],

  ["generative-learning.md", "## 多元高斯分布", "p06-covariance-gaussian", "中心化批数据如何沿样本轴形成对称半正定协方差矩阵"],
  ["generative-learning.md", "## 高斯判别分析", "p07-gda-generative-classification", "GDA 使用共享协方差计算每个类别的生成式判别分数"],
  ["generative-learning.md", "## 朴素贝叶斯", "p07-naive-bayes-log-score", "Naive Bayes 将各特征条件似然累加成类别 log-score"],

  ["svm-kernels.md", "## 函数间隔与几何间隔", "p08-svm-margin-kkt", "SVM 几何间隔、约束边界和 KKT 支持向量之间的关系"],
  ["svm-kernels.md", "## 拉格朗日对偶", "p08-svm-dual-gram", "SVM 对偶目标中的样本 Gram 矩阵、标签外积和对偶变量"],
  ["svm-kernels.md", "## 核方法", "p10-kernel-gram", "Kernel 函数如何直接构造样本间的 Gram 矩阵"],
  ["svm-kernels.md", "Kernel Trick 节省的是显式特征构造，不会消除样本规模带来的 Gram 矩阵成本。", "p10-kernel-svm-prediction", "Kernel SVM 如何筛选支持向量并完成加权预测"],

  ["learning-theory.md", "## 偏差与方差", "p12-generalization-error-decomposition", "模型超额风险中的近似误差和估计误差分解"],
  ["learning-theory.md", "## 有限假设类", "p12-erm-generalization-bound", "有限假设类中经验风险、真风险与统一收敛界的归约"],
  ["learning-theory.md", "## VC 维", "concept-vc-shattering", "VC 维要求同一假设类实现一组点的全部二进制标记"],

  ["model-selection-regularization.md", "## 交叉验证", "p11-cross-validation-model-selection", "K 折交叉验证如何沿验证折平均并选择超参数"],
  ["model-selection-regularization.md", "其负对数先验与 $\\|\\theta\\|_2^2$ 成正比，因此 MAP 对应 L2 正则化：", "p11-ridge-regularization", "Ridge 正则化如何平移 Gram 矩阵的对角谱"],
  ["model-selection-regularization.md", "## 正则化与先验", "concept-map-prior", "Gaussian 似然与 Gaussian 参数先验如何得到 Ridge MAP 目标"],

  ["decision-trees.md", "## 如何选择切分", "concept-tree-split-impurity", "决策树候选切分如何路由样本并计算加权不纯度下降"],
  ["decision-trees.md", "## 正则化与剪枝", "concept-tree-pruning", "代价复杂度剪枝如何在训练误差和叶节点数量之间选择子树"],

  ["ensemble-learning.md", "## Bagging", "p13-bagging-variance-reduction", "Bagging 如何通过 Bootstrap 和模型轴平均降低预测方差"],
  ["ensemble-learning.md", "## AdaBoost", "p13-adaboost-weight-update", "AdaBoost 如何根据错分掩码提高困难样本的权重"],
  ["ensemble-learning.md", "## 梯度提升", "concept-gradient-boosting-residual", "Gradient Boosting 计算函数空间负梯度、拟合弱学习器并更新集成分数"],

  ["neural-networks-backprop.md", "## 前向传播", "p14-neural-network-forward", "神经网络批量前向传播中的通道收缩、偏置广播与激活"],
  ["neural-networks-backprop.md", "## 跨样本向量化", "p14-multilayer-shape-flow", "多层神经网络前向传播中通道轴变化与批次轴保持"],
  ["neural-networks-backprop.md", "若已知 $dZ$：", "p16-backprop-shape-flow", "线性层反向传播中参数梯度与输入梯度的两条矩阵收缩路径"],
  ["neural-networks-backprop.md", "## 反向传播", "p16-vjp-chain-rule", "反向传播经过激活函数和线性层的向量 Jacobian 乘积"],

  ["ml-strategy-error-analysis.md", "## 偏差方差诊断", "p17-ml-diagnostic-gaps", "从训练验证差异和误差类型到下一步行动的机器学习诊断链"],
  ["ml-strategy-error-analysis.md", "## 误差分析", "p15-confusion-matrix-metrics", "从连续分数、阈值决策和混淆矩阵推导分类指标"],

  ["kmeans.md", "## K-means 算法", "p19-kmeans-hard-assignment", "K-means 从距离矩阵、簇 ID、one-hot 掩码到中心更新"],

  ["gaussian-mixture-models.md", "## 从硬聚类到软聚类", "p19-kmeans-gmm-responsibilities", "从 K-means 硬分配过渡到 GMM 责任度矩阵"],
  ["gaussian-mixture-models.md", "## EM 更新", "concept-gmm-em-updates", "GMM 责任度沿样本轴形成软计数和加权均值更新"],
  ["gaussian-mixture-models.md", "## 与 K-means 的关系", "p19-kmeans-hard-assignment", "K-means 从距离矩阵、簇 ID、one-hot 掩码到中心更新"],

  ["em-algorithm.md", "## Jensen 不等式", "concept-jensen-elbo-gap", "观测证据、ELBO 与辅助分布到真实后验之间的 KL 缺口"],
  ["em-algorithm.md", "## E 步与 M 步", "p20-em-elbo-coordinate-ascent", "EM 在辅助后验和模型参数两个坐标上交替提高 ELBO"],
  ["em-algorithm.md", "## 高斯混合重访", "concept-gmm-em-updates", "GMM 责任度沿样本轴形成软计数和加权均值更新"],

  ["factor-analysis.md", "## 因子分析模型", "p20-factor-analysis-covariance", "因子分析如何用低秩载荷和对角噪声构造观测协方差"],
  ["factor-analysis.md", "## 高斯边缘与条件分布", "concept-factor-posterior", "因子分析如何从观测残差计算潜因子的 Gaussian 条件后验"],
  ["factor-analysis.md", "## 因子分析的 EM", "p20-em-elbo-coordinate-ascent", "EM 在潜变量后验和模型参数之间交替优化"],

  ["principal-component-analysis.md", "## 特征值推导", "p21-pca-covariance-eigen", "PCA 对中心化协方差矩阵进行特征分解并选择主方向"],
  ["principal-component-analysis.md", "## 投影与重建", "p21-pca-projection-reconstruction", "PCA 使用正交主轴完成低维投影和低秩重建"],

  ["independent-component-analysis.md", "## ICA 算法", "p22-ica-unmixing", "ICA 通过解混矩阵恢复独立非 Gaussian 潜在源"],
  ["independent-component-analysis.md", "## 密度线性变换", "concept-ica-change-of-variables", "ICA 解混、源密度与变量变换 Jacobian 行列式的完整似然链"],

  ["reinforcement-learning-mdp.md", "## 序列决策问题", "p22-rl-interaction-loop", "强化学习中策略、动作、环境转移、奖励和折扣回报的轨迹结构"],
  ["reinforcement-learning-mdp.md", "## Bellman 方程", "p23-bellman-value-iteration", "Bellman 备份先沿下一状态求期望再沿动作轴取最大"],
  ["reinforcement-learning-mdp.md", "## 价值迭代与策略迭代", "p23-policy-iteration", "策略迭代如何在策略评估和贪心改进之间交替"],
  ["reinforcement-learning-mdp.md", "## 学习环境模型", "p24-empirical-transition-model", "从转移三元组计数构造行归一化经验 MDP 模型"],
  ["reinforcement-learning-mdp.md", "## 拟合价值迭代", "p24-fitted-value-iteration", "连续状态下如何用模拟构造 Bellman 目标并拟合价值函数"],

  ["control-lqr-lqg.md", "## 时间相关价值函数", "concept-finite-horizon-backup", "有限时域 Bellman 方程从终点条件开始逆时间递推"],
  ["control-lqr-lqg.md", "## 线性二次调节器", "p26-lqr-state-control", "LQR 如何把状态映射为最优控制并通过线性动力学传播"],
  ["control-lqr-lqg.md", "## Riccati 递推", "p26-riccati-recursion", "Riccati 递推如何形成控制 Hessian 并求反馈增益"],
  ["control-lqr-lqg.md", "## DDP", "concept-ddp-local-quadratic", "DDP 沿名义轨迹建立局部二次模型并执行反向求解与正向 rollout"],
  ["control-lqr-lqg.md", "## LQG 与部分可观测性", "p27-kalman-predict-update", "Kalman Filter 从状态预测、观测创新到增益加权更新"],
  ["control-lqr-lqg.md", "其中 $w_t$ 与 $v_t$ 为高斯噪声。控制器看不到真实 $x_t$，只能根据观测 $y_{0:t}$ 估计状态。", "p27-kalman-covariance-update", "Kalman Filter 在状态空间和观测空间之间传播与更新协方差"],
];

for (const [file, heading, id, alt] of integrations) {
  const path = join(courseDir, file);
  const image = `![${alt}](/images/notes/cs229/tikz/${id}.png)`;
  let source = readFileSync(path, "utf8");
  if (source.includes(image)) continue;
  const marker = `${heading}\n`;
  if (!source.includes(marker)) {
    throw new Error(`Missing integration heading "${heading}" in ${file}`);
  }
  source = source.replace(marker, `${marker}\n${image}\n`);
  writeFileSync(path, source, "utf8");
  console.log(`integrated ${id} into ${file}`);
}
