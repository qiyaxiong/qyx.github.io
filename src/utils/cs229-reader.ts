export interface Cs229ReaderSection {
  id: string
  zh: string
  en: string
  page: number
}

export interface Cs229ReaderConfig {
  storageKey: string
  sourceTitle: string
  sourceRepositoryUrl: string
  sourceDocumentUrl: string
  pdfUrl: string
  pageStart: number
  pageEnd: number
  sections: Cs229ReaderSection[]
}

type SectionTuple = [id: string, zh: string, en: string, page: number]

interface ReaderSource {
  slug: string
  file: string
  title: string
  pageStart: number
  pageEnd: number
  sections: SectionTuple[]
  directory?: 'notes' | 'materials'
}

const repository = 'maxim5/cs229-2018-autumn'

function createReaderConfig({
  slug,
  file,
  title,
  pageStart,
  pageEnd,
  sections,
  directory = 'notes'
}: ReaderSource): [string, Cs229ReaderConfig] {
  const sourcePath = `${directory}/${file}`
  const repositoryUrl = `https://github.com/${repository}/blob/main/${sourcePath}`
  const rawUrl = `https://raw.githubusercontent.com/${repository}/main/${sourcePath}`

  return [
    `cs229/course/${slug}`,
    {
      storageKey: `cs229-reader-${slug}`,
      sourceTitle: title,
      sourceRepositoryUrl: repositoryUrl,
      sourceDocumentUrl: repositoryUrl,
      pdfUrl: rawUrl,
      pageStart,
      pageEnd,
      sections: sections.map(([id, zh, en, page]) => ({ id, zh, en, page }))
    }
  ]
}

const readerConfigs: Record<string, Cs229ReaderConfig> = Object.fromEntries([
  createReaderConfig({
    slug: 'linear-regression',
    file: 'cs229-notes1.pdf',
    title: 'CS229 Lecture Notes 1 · Linear Regression',
    pageStart: 1,
    pageEnd: 15,
    sections: [
      ['先建立问题：监督学习到底在学什么', '监督学习问题', 'Supervised learning', 1],
      ['线性假设：从特征到预测', '线性假设', 'Linear hypothesis', 3],
      ['最小二乘损失：为什么是平方', '最小二乘损失', 'Least squares cost', 4],
      ['lms-与梯度下降：参数怎样一步步更新', 'LMS 与梯度下降', 'LMS algorithm', 4],
      ['正规方程：不迭代直接求解', '正规方程', 'Normal equations', 7],
      ['概率解释：平方损失从哪里来', '概率与似然解释', 'Probabilistic interpretation', 11],
      [
        '局部加权线性回归：一个模型不必覆盖所有位置',
        '局部加权回归',
        'Locally weighted regression',
        13
      ],
      ['本章闭环：从公式到实现', '本章闭环', 'Chapter checklist', 15]
    ]
  }),
  createReaderConfig({
    slug: 'logistic-regression-glm',
    file: 'cs229-notes1.pdf',
    title: 'CS229 Lecture Notes 1 · Logistic Regression and GLMs',
    pageStart: 16,
    pageEnd: 30,
    sections: [
      ['分类问题', '分类问题', 'Classification', 16],
      ['逻辑回归', '逻辑回归', 'Logistic regression', 16],
      ['伯努利似然', '伯努利似然', 'Bernoulli likelihood', 18],
      ['牛顿法', '牛顿法', "Newton's method", 20],
      ['指数族', '指数族', 'Exponential family', 22],
      ['广义线性模型', '广义线性模型', 'Constructing GLMs', 24],
      ['softmax-回归', 'Softmax 回归', 'Softmax regression', 26],
      ['本章检查', '本章检查', 'Chapter checklist', 30]
    ]
  }),
  createReaderConfig({
    slug: 'generative-learning',
    file: 'cs229-notes2.pdf',
    title: 'CS229 Lecture Notes 2 · Generative Learning Algorithms',
    pageStart: 1,
    pageEnd: 14,
    sections: [
      ['生成式建模', '生成式建模', 'Generative learning', 1],
      ['多元高斯分布', '多元高斯', 'Multivariate Gaussian', 2],
      ['高斯判别分析', '高斯判别分析', 'Gaussian discriminant analysis', 5],
      ['gda-与逻辑回归', 'GDA 与逻辑回归', 'GDA vs. logistic regression', 6],
      ['朴素贝叶斯', '朴素贝叶斯', 'Naive Bayes', 8],
      ['拉普拉斯平滑', '拉普拉斯平滑', 'Laplace smoothing', 11],
      ['文本事件模型', '文本事件模型', 'Text event models', 13],
      ['本章检查', '本章检查', 'Chapter checklist', 14]
    ]
  }),
  createReaderConfig({
    slug: 'svm-kernels',
    file: 'cs229-notes3.pdf',
    title: 'CS229 Lecture Notes 3 · Support Vector Machines',
    pageStart: 1,
    pageEnd: 25,
    sections: [
      ['间隔直觉', '间隔直觉', 'Margins', 1],
      ['函数间隔与几何间隔', '两种间隔', 'Functional and geometric margins', 3],
      ['最优间隔分类器', '最优间隔', 'Optimal margin classifier', 5],
      ['拉格朗日对偶', '拉格朗日对偶', 'Lagrange duality', 7],
      ['核方法', '核方法', 'Kernels', 13],
      ['软间隔与正则化', '软间隔', 'Non-separable case', 19],
      ['smo-算法', 'SMO', 'Sequential minimal optimization', 20],
      ['本章检查', '本章检查', 'Chapter checklist', 25]
    ]
  }),
  createReaderConfig({
    slug: 'learning-theory',
    file: 'cs229-notes4.pdf',
    title: 'CS229 Lecture Notes 4 · Learning Theory',
    pageStart: 1,
    pageEnd: 11,
    sections: [
      ['偏差与方差', '偏差与方差', 'Bias and variance', 1],
      ['经验风险与泛化', '经验风险与泛化', 'Empirical risk and generalization', 2],
      ['有限假设类', '有限假设类', 'Finite hypothesis classes', 5],
      ['无限假设类', '无限假设类', 'Infinite hypothesis classes', 8],
      ['vc-维', 'VC 维', 'VC dimension', 9],
      ['本章检查', '本章检查', 'Chapter checklist', 11]
    ]
  }),
  createReaderConfig({
    slug: 'model-selection-regularization',
    file: 'cs229-notes5.pdf',
    title: 'CS229 Lecture Notes 5 · Model Selection',
    pageStart: 1,
    pageEnd: 8,
    sections: [
      ['模型选择问题', '模型选择问题', 'Model selection', 1],
      ['交叉验证', '交叉验证', 'Cross validation', 2],
      ['特征选择', '特征选择', 'Feature selection', 4],
      ['贝叶斯统计', '贝叶斯统计', 'Bayesian statistics', 6],
      ['正则化与先验', '正则化与先验', 'Regularization and priors', 6],
      ['本章检查', '本章检查', 'Chapter checklist', 8]
    ]
  }),
  createReaderConfig({
    slug: 'online-learning-perceptron',
    file: 'cs229-notes6.pdf',
    title: 'CS229 Lecture Notes 6 · Online Learning',
    pageStart: 1,
    pageEnd: 3,
    sections: [
      ['在线学习设定', '在线学习设定', 'Online learning', 1],
      ['感知机更新', '感知机更新', 'Perceptron update', 1],
      ['错误上界', '错误上界', 'Mistake bound', 2],
      ['证明结构', '证明结构', 'Proof structure', 2],
      ['本章检查', '本章检查', 'Chapter checklist', 3]
    ]
  }),
  createReaderConfig({
    slug: 'decision-trees',
    file: 'cs229-notes-dt.pdf',
    title: 'CS229 · Decision Trees',
    pageStart: 1,
    pageEnd: 9,
    sections: [
      ['树模型为什么非线性', '非线性分区', 'Non-linearity', 1],
      ['如何选择切分', '选择切分', 'Selecting regions', 2],
      ['损失与纯度', '损失与纯度', 'Loss functions', 4],
      ['类别变量', '类别变量', 'Categorical variables', 6],
      ['正则化与剪枝', '正则化', 'Regularization', 7],
      ['运行时与结构限制', '运行时与限制', 'Runtime and limitations', 7],
      ['本章检查', '本章检查', 'Chapter checklist', 9]
    ]
  }),
  createReaderConfig({
    slug: 'ensemble-learning',
    file: 'cs229-notes-ensemble.pdf',
    title: 'CS229 · Ensemble Learning',
    pageStart: 1,
    pageEnd: 7,
    sections: [
      ['为什么组合模型', '为什么组合', 'Why ensembles work', 1],
      ['bagging', 'Bagging', 'Bagging', 2],
      ['随机森林', '随机森林', 'Bagged decision trees', 3],
      ['boosting-直觉', 'Boosting 直觉', 'Boosting intuition', 4],
      ['adaboost', 'AdaBoost', 'AdaBoost', 5],
      ['梯度提升', '梯度提升', 'Gradient boosting', 7],
      ['本章检查', '本章检查', 'Chapter checklist', 7]
    ]
  }),
  createReaderConfig({
    slug: 'ml-strategy-error-analysis',
    file: 'ML-advice.pdf',
    title: 'CS229 · Advice for Applying Machine Learning',
    pageStart: 1,
    pageEnd: 30,
    directory: 'materials',
    sections: [
      ['诊断优先', '诊断优先', 'Diagnostics first', 1],
      ['偏差方差诊断', '偏差/方差诊断', 'Bias/variance diagnostics', 6],
      ['优化器还是目标函数', '优化器还是目标', 'Optimization vs. objective', 10],
      ['强化学习系统诊断', 'RL 系统诊断', 'Debugging an RL system', 16],
      ['误差分析', '误差分析', 'Error analysis', 20],
      ['消融分析', '消融分析', 'Ablative analysis', 23],
      ['快速建立基线', '快速建立基线', 'Build and fix', 25],
      ['本章检查', '本章检查', 'Chapter checklist', 29]
    ]
  }),
  createReaderConfig({
    slug: 'neural-networks-backprop',
    file: 'cs229-notes-deep_learning.pdf',
    title: 'CS229 · Deep Learning',
    pageStart: 1,
    pageEnd: 16,
    sections: [
      ['从神经元到网络', '从神经元到网络', 'Neural networks', 1],
      ['前向传播', '前向传播', 'Forward propagation', 4],
      ['向量化', '向量化', 'Vectorization', 5],
      ['跨样本向量化', '跨样本向量化', 'Vectorizing examples', 7],
      ['反向传播', '反向传播', 'Backpropagation', 8],
      ['参数初始化', '参数初始化', 'Parameter initialization', 9],
      ['优化与正则化', '优化与正则化', 'Optimization and regularization', 11],
      ['本章检查', '本章检查', 'Chapter checklist', 16]
    ]
  }),
  createReaderConfig({
    slug: 'kmeans',
    file: 'cs229-notes7a.pdf',
    title: 'CS229 Lecture Notes 7a · K-means',
    pageStart: 1,
    pageEnd: 3,
    sections: [
      ['聚类问题', '聚类问题', 'Clustering', 1],
      ['k-means-算法', 'K-means 算法', 'K-means algorithm', 1],
      ['失真函数', '失真函数', 'Distortion function', 2],
      ['收敛与局部最优', '收敛与局部最优', 'Convergence and local optima', 2],
      ['本章检查', '本章检查', 'Chapter checklist', 3]
    ]
  }),
  createReaderConfig({
    slug: 'gaussian-mixture-models',
    file: 'cs229-notes7b.pdf',
    title: 'CS229 Lecture Notes 7b · Gaussian Mixtures',
    pageStart: 1,
    pageEnd: 4,
    sections: [
      ['从硬聚类到软聚类', '硬聚类到软聚类', 'From hard to soft clustering', 1],
      ['高斯混合模型', '高斯混合模型', 'Mixtures of Gaussians', 1],
      ['隐变量与责任度', '隐变量与责任度', 'Latent variables and responsibilities', 2],
      ['em-更新', 'EM 更新', 'EM updates', 2],
      ['与-k-means-的关系', '与 K-means 的关系', 'Relation to K-means', 3],
      ['本章检查', '本章检查', 'Chapter checklist', 4]
    ]
  }),
  createReaderConfig({
    slug: 'em-algorithm',
    file: 'cs229-notes8.pdf',
    title: 'CS229 Lecture Notes 8 · The EM Algorithm',
    pageStart: 1,
    pageEnd: 8,
    sections: [
      ['为什么需要-em', '为什么需要 EM', 'Why EM', 1],
      ['jensen-不等式', 'Jensen 不等式', "Jensen's inequality", 1],
      ['构造下界', '构造下界', 'Lower bound', 2],
      ['e-步与-m-步', 'E 步与 M 步', 'E-step and M-step', 3],
      ['单调改进', '单调改进', 'Monotonic improvement', 5],
      ['高斯混合重访', '高斯混合重访', 'Gaussian mixtures revisited', 6],
      ['本章检查', '本章检查', 'Chapter checklist', 8]
    ]
  }),
  createReaderConfig({
    slug: 'factor-analysis',
    file: 'cs229-notes9.pdf',
    title: 'CS229 Lecture Notes 9 · Factor Analysis',
    pageStart: 1,
    pageEnd: 9,
    sections: [
      ['协方差建模问题', '协方差建模', 'Modeling covariance', 1],
      ['协方差限制', '协方差限制', 'Restrictions of covariance', 2],
      ['高斯边缘与条件分布', '高斯边缘与条件', 'Gaussian marginals and conditionals', 3],
      ['因子分析模型', '因子分析模型', 'Factor analysis model', 4],
      ['因子分析的-em', 'Factor Analysis 的 EM', 'EM for factor analysis', 6],
      ['本章检查', '本章检查', 'Chapter checklist', 9]
    ]
  }),
  createReaderConfig({
    slug: 'principal-component-analysis',
    file: 'cs229-notes10.pdf',
    title: 'CS229 Lecture Notes 10 · Principal Components Analysis',
    pageStart: 1,
    pageEnd: 6,
    sections: [
      ['降维问题', '降维问题', 'Dimensionality reduction', 1],
      ['数据标准化', '数据标准化', 'Preprocessing', 1],
      ['最大方差方向', '最大方差方向', 'Maximum variance direction', 2],
      ['特征值推导', '特征值推导', 'Eigenvalue derivation', 3],
      ['投影与重建', '投影与重建', 'Projection and reconstruction', 4],
      ['pca-与因子分析', 'PCA 与因子分析', 'PCA vs. factor analysis', 5],
      ['本章检查', '本章检查', 'Chapter checklist', 6]
    ]
  }),
  createReaderConfig({
    slug: 'independent-component-analysis',
    file: 'cs229-notes11.pdf',
    title: 'CS229 Lecture Notes 11 · Independent Components Analysis',
    pageStart: 1,
    pageEnd: 6,
    sections: [
      ['盲源分离', '盲源分离', 'Blind source separation', 1],
      ['ica-假设', 'ICA 假设', 'ICA assumptions', 1],
      ['不可辨识性', '不可辨识性', 'ICA ambiguities', 2],
      ['密度线性变换', '密度线性变换', 'Density transformations', 3],
      ['ica-算法', 'ICA 算法', 'ICA algorithm', 4],
      ['本章检查', '本章检查', 'Chapter checklist', 6]
    ]
  }),
  createReaderConfig({
    slug: 'reinforcement-learning-mdp',
    file: 'cs229-notes12.pdf',
    title: 'CS229 Lecture Notes 12 · Reinforcement Learning',
    pageStart: 1,
    pageEnd: 15,
    sections: [
      ['序列决策问题', '序列决策问题', 'Sequential decision making', 1],
      ['马尔可夫决策过程', 'MDP', 'Markov decision processes', 2],
      ['bellman-方程', 'Bellman 方程', 'Bellman equations', 3],
      ['价值迭代与策略迭代', '价值/策略迭代', 'Value and policy iteration', 4],
      ['学习环境模型', '学习环境模型', 'Learning an MDP model', 6],
      ['连续状态-mdp', '连续状态 MDP', 'Continuous-state MDPs', 7],
      ['拟合价值迭代', '拟合价值迭代', 'Fitted value iteration', 12],
      ['本章检查', '本章检查', 'Chapter checklist', 15]
    ]
  }),
  createReaderConfig({
    slug: 'control-lqr-lqg',
    file: 'cs229-notes13.pdf',
    title: 'CS229 Lecture Notes 13 · Control',
    pageStart: 1,
    pageEnd: 15,
    sections: [
      ['有限时域-mdp', '有限时域 MDP', 'Finite-horizon MDPs', 1],
      ['时间相关价值函数', '时间相关价值', 'Time-dependent value functions', 2],
      ['线性二次调节器', 'LQR', 'Linear quadratic regulation', 5],
      ['riccati-递推', 'Riccati 递推', 'Riccati recursion', 7],
      ['非线性动力学线性化', '动力学线性化', 'Linearizing dynamics', 9],
      ['ddp', 'DDP', 'Differential dynamic programming', 10],
      ['lqg-与部分可观测性', 'LQG', 'Linear quadratic Gaussian control', 12],
      ['本章检查', '本章检查', 'Chapter checklist', 15]
    ]
  })
])

export function getCs229ReaderConfig(path: string): Cs229ReaderConfig | undefined {
  return readerConfigs[path]
}
