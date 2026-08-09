import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const courseDir = join(root, "src/content/notes/cs229/course");
const imageDir = join(root, "public/images/notes/cs229/storyboards");

const storyboards = [
  ["p01-welcome-introduction.md", "p01-ml-workflow-storyboard", "机器学习项目从任务定义、数据、模型和优化到离线评价与线上监控的六步图解"],
  ["p02-linear-regression-gradient-descent.md", "p02-linear-regression-storyboard", "线性回归从矩阵预测、平方损失、梯度下降到正规方程与几何投影的六步图解"],
  ["p03-section-linear-algebra.md", "p03-linear-algebra-storyboard", "线性代数从向量与矩阵、秩和特征向量到 SVD 与最小二乘投影的六步图解"],
  ["p04-locally-weighted-logistic-regression.md", "p04-logistic-newton-storyboard", "Logistic 回归从线性分数、Sigmoid、似然、梯度和 Hessian 到 Newton 与 IRLS 的六步图解"],
  ["p05-perceptron-generalized-linear-models.md", "p05-glm-storyboard", "从感知机、指数族和自然参数到链接函数与广义线性模型的六步图解"],
  ["p06-section-probability.md", "p06-probability-storyboard", "概率论从随机变量、期望和联合分布到 Bayes、条件独立与大数定律的六步图解"],
  ["p07-gda-naive-bayes.md", "p07-generative-classification-storyboard", "生成式分类从类先验与类条件分布、GDA 参数估计到朴素贝叶斯和平滑的六步图解"],
  ["p08-support-vector-machines.md", "p08-svm-storyboard", "SVM 从最大间隔、拉格朗日乘子和 KKT 条件到支持向量与一维例子的六步图解"],
  ["p09-section-python.md", "p09-python-vectorization-storyboard", "NumPy 从数组形状、矩阵向量化和广播到掩码、数值稳定与断言验证的六步图解"],
  ["p10-kernels.md", "p10-kernel-methods-storyboard", "核方法从非线性映射、对偶内积和合法核到支持向量预测与超参数选择的六步图解"],
  ["p11-data-splits-model-selection-cross-validation.md", "p11-model-selection-storyboard", "模型选择从数据职责、交叉验证和时间切分到折内预处理与最终测试的六步图解"],
  ["p12-learning-theory-erm.md", "p12-learning-theory-storyboard", "学习理论从总体风险、经验风险和 ERM 到一致收敛、容量与正则化的六步图解"],
  ["p13-decision-trees-ensembles.md", "p13-trees-ensembles-storyboard", "树模型从递归切分和纯度到剪枝、随机森林与 Boosting 的六步图解"],
  ["p14-neural-networks-introduction.md", "p14-neural-network-storyboard", "神经网络从单个神经元和矩阵化层到非线性堆叠、任务输出与反向传播的六步图解"],
  ["p15-section-evaluation-metrics.md", "p15-evaluation-metrics-storyboard", "分类评价从混淆矩阵、Precision 和 Recall 到阈值曲线、校准与错误成本的六步图解"],
  ["p16-backprop-neural-network-training.md", "p16-backprop-storyboard", "反向传播从前向缓存、输出误差、激活层局部导数到线性层梯度和梯度检查的六步图解"],
  ["p17-ml-debugging-error-analysis.md", "p17-ml-debugging-storyboard", "机器学习调试从可靠基线、偏差方差和学习曲线到误差分桶与最小实验的六步图解"],
  ["p18-section-midterm-review.md", "p18-midterm-map-storyboard", "CS229 期中内容从线性回归、GLM、生成式分类和 SVM 到学习理论与解题模板的六步图解"],
  ["p19-kmeans-gmm-em.md", "p19-clustering-em-storyboard", "无监督学习从 K-means 硬分配到 GMM 概率建模与 EM 软责任度的六步图解"],
  ["p20-em-factor-analysis.md", "p20-em-storyboard", "EM 从困难似然、Jensen 下界、E 步和 M 步到单调改进与高斯混合例子的六步图解"],
  ["p21-pca.md", "p21-pca-storyboard", "PCA 从中心化、协方差和特征分解到低维投影、重建与解释方差的六步图解"],
  ["p22-ica-reinforcement-learning.md", "p22-ica-rl-intro-storyboard", "从 ICA 的信号混合与独立源恢复到强化学习状态、动作、奖励和策略的六步图解"],
  ["p23-mdp-value-policy-iteration.md", "p23-mdp-planning-storyboard", "MDP 从价值函数和 Bellman 方程到最优价值、价值迭代与策略迭代的六步图解"],
  ["p24-continuous-state-mdp-model-simulation.md", "p24-continuous-mdp-storyboard", "连续状态 MDP 从动力学模型和模拟轨迹到价值估计、函数逼近与模型诊断的六步图解"],
  ["p25-section-critiques-of-ml.md", "p25-ml-critiques-storyboard", "机器学习批判从代理目标、数据与标签偏差到分群评价、反馈回路和治理的六步图解"],
  ["p26-reward-model-linear-dynamical-systems.md", "p26-lds-lqr-storyboard", "线性控制从动力学与二次成本到 Riccati 递推、线性反馈和闭环稳定性的六步图解"],
  ["p27-rl-debugging-diagnostics.md", "p27-rl-lqg-debugging-storyboard", "强化学习从环境诊断与 DDP 到 Kalman Filter 状态估计和 LQG 控制的六步图解"],
  ["p28-section-convolutional-neural-networks.md", "p28-cnn-storyboard", "卷积神经网络从空间输入、局部连接和尺寸计算到多通道特征、感受野与分类头的六步图解"],
];

let changed = 0;

for (const [fileName, imageId, alt] of storyboards) {
  const filePath = join(courseDir, fileName);
  const imagePath = join(imageDir, `${imageId}.png`);
  if (!existsSync(filePath)) throw new Error(`Missing course file: ${fileName}`);
  if (!existsSync(imagePath)) throw new Error(`Missing storyboard image: ${imageId}.png`);

  let markdown = readFileSync(filePath, "utf8");
  markdown = markdown.replace(/^updatedDate: .*$/m, "updatedDate: 2026-08-08");

  const publicPath = `/images/notes/cs229/storyboards/${imageId}.png`;
  if (!markdown.includes(publicPath)) {
    const frontmatterEnd = markdown.indexOf("\n---\n", 4);
    if (frontmatterEnd === -1) throw new Error(`Invalid frontmatter: ${fileName}`);
    const insertion = `\n## 一图理解本章\n\n![${alt}](${publicPath})\n\n先沿图中的六个步骤建立本章主线，再进入后文的公式推导、实现细节和失败诊断。\n`;
    markdown = `${markdown.slice(0, frontmatterEnd + 5)}${insertion}${markdown.slice(frontmatterEnd + 5)}`;
  }

  writeFileSync(filePath, markdown);
  changed += 1;
}

console.log(`Verified and integrated ${changed} CS229 storyboards.`);
