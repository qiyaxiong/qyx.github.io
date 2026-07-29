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
