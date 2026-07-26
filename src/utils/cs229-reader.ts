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
  directory?: 'notes' | 'materials' | 'section'
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
    slug: 'p02-linear-regression-gradient-descent',
    file: 'cs229-notes1.pdf',
    title: 'CS229 Lecture 2 · Linear Regression and Gradient Descent',
    pageStart: 1,
    pageEnd: 13,
    sections: [
      ['监督学习设定', '监督学习设定', 'Supervised learning setup', 1],
      ['线性假设', '线性假设', 'Linear hypothesis', 3],
      ['最小二乘目标', '最小二乘目标', 'Least squares cost', 4],
      ['批量梯度下降', '批量梯度下降', 'Batch gradient descent', 4],
      ['随机与小批量梯度下降', '随机与小批量', 'Stochastic gradient descent', 6],
      ['正规方程', '正规方程', 'Normal equations', 7],
      ['从代码验证梯度', '梯度检查', 'Implementation check', 10],
      ['本节检查', '本节检查', 'Session checklist', 13]
    ]
  }),
  createReaderConfig({
    slug: 'p03-section-linear-algebra',
    file: 'cs229-linalg.pdf',
    title: 'CS229 Discussion Section · Linear Algebra Review',
    pageStart: 1,
    pageEnd: 26,
    directory: 'section',
    sections: [
      ['向量、矩阵与维度', '向量、矩阵与维度', 'Vectors and matrices', 2],
      ['内积、范数与距离', '内积、范数与距离', 'Inner products and norms', 4],
      ['线性组合、张成与子空间', '线性组合与子空间', 'Linear independence', 7],
      ['矩阵的列空间与零空间', '列空间与零空间', 'Range and nullspace', 9],
      ['秩', '秩', 'Rank', 11],
      ['逆矩阵与线性方程', '逆矩阵与线性方程', 'Matrix inverse', 13],
      ['特征值与特征向量', '特征值与特征向量', 'Eigenvalues', 17],
      ['梯度与-hessian', '梯度与 Hessian', 'Matrix calculus', 22],
      ['本节检查', '本节检查', 'Session checklist', 26]
    ]
  }),
  createReaderConfig({
    slug: 'p04-locally-weighted-logistic-regression',
    file: 'cs229-notes1.pdf',
    title: 'CS229 Lecture 3 · Locally Weighted and Logistic Regression',
    pageStart: 13,
    pageEnd: 21,
    sections: [
      ['从参数模型到非参数模型', '参数与非参数模型', 'Parametric vs. non-parametric', 13],
      ['局部加权线性回归', '局部加权回归', 'Locally weighted regression', 13],
      ['从回归进入分类', '分类问题', 'Classification', 16],
      ['sigmoid-与决策边界', 'Sigmoid 与决策边界', 'Logistic hypothesis', 16],
      ['伯努利似然', '伯努利似然', 'Bernoulli likelihood', 18],
      ['逻辑回归梯度', '逻辑回归梯度', 'Logistic gradient', 19],
      ['牛顿法', '牛顿法', "Newton's method", 20],
      ['本节检查', '本节检查', 'Session checklist', 21]
    ]
  }),
  createReaderConfig({
    slug: 'p05-perceptron-generalized-linear-models',
    file: 'cs229-notes1.pdf',
    title: 'CS229 Lecture 4 · Perceptron and Generalized Linear Models',
    pageStart: 21,
    pageEnd: 30,
    sections: [
      ['感知机', '感知机', 'Perceptron', 21],
      ['为什么引入指数族', '指数族', 'Exponential family', 22],
      ['bernoulli-的指数族形式', 'Bernoulli', 'Bernoulli as exponential family', 23],
      ['构造广义线性模型', '构造 GLM', 'Constructing GLMs', 24],
      ['逻辑回归作为-glm', '逻辑回归 GLM', 'Logistic regression', 25],
      ['poisson-回归', 'Poisson 回归', 'Poisson regression', 26],
      ['多项分布与-softmax', 'Softmax 回归', 'Softmax regression', 27],
      ['本节检查', '本节检查', 'Session checklist', 30]
    ]
  }),
  createReaderConfig({
    slug: 'p06-section-probability',
    file: 'cs229-prob.pdf',
    title: 'CS229 Discussion Section · Probability Review',
    pageStart: 1,
    pageEnd: 12,
    directory: 'section',
    sections: [
      ['样本空间与事件', '样本空间与事件', 'Sample spaces and events', 1],
      ['条件概率', '条件概率', 'Conditional probability', 2],
      ['bayes-公式', 'Bayes 公式', "Bayes' rule", 3],
      ['独立与条件独立', '独立与条件独立', 'Independence', 4],
      ['期望', '期望', 'Expectation', 6],
      ['方差与协方差', '方差与协方差', 'Variance and covariance', 7],
      ['gaussian', 'Gaussian', 'Gaussian distribution', 8],
      ['最大似然估计', '最大似然估计', 'Maximum likelihood', 10],
      ['本节检查', '本节检查', 'Session checklist', 12]
    ]
  }),
  createReaderConfig({
    slug: 'p07-gda-naive-bayes',
    file: 'cs229-notes2.pdf',
    title: 'CS229 Lecture 5 · GDA and Naive Bayes',
    pageStart: 1,
    pageEnd: 14,
    sections: [
      ['判别式与生成式学习', '判别式与生成式', 'Discriminative vs. generative', 1],
      ['多元高斯', '多元高斯', 'Multivariate Gaussian', 2],
      ['gda-模型', 'GDA 模型', 'Gaussian discriminant analysis', 5],
      ['为什么边界是线性的', '线性决策边界', 'GDA decision boundary', 6],
      ['gda-与逻辑回归', 'GDA 与逻辑回归', 'GDA vs. logistic regression', 7],
      ['离散特征与-naive-bayes', 'Naive Bayes', 'Naive Bayes', 8],
      ['bernoulli-文本事件模型', 'Bernoulli 事件模型', 'Bernoulli event model', 12],
      ['multinomial-事件模型', 'Multinomial 事件模型', 'Multinomial event model', 13],
      ['本节检查', '本节检查', 'Session checklist', 14]
    ]
  }),
  createReaderConfig({
    slug: 'p08-support-vector-machines',
    file: 'cs229-notes3.pdf',
    title: 'CS229 Lecture 6 · Support Vector Machines',
    pageStart: 1,
    pageEnd: 13,
    sections: [
      ['从概率分类转向间隔', '从概率到间隔', 'Margins', 1],
      ['函数间隔', '函数间隔', 'Functional margin', 3],
      ['几何间隔', '几何间隔', 'Geometric margin', 4],
      ['最大间隔分类', '最大间隔分类', 'Optimal margin classifier', 5],
      ['支持向量', '支持向量', 'Support vectors', 6],
      ['拉格朗日乘子', '拉格朗日乘子', 'Lagrange duality', 7],
      ['kkt-条件', 'KKT 条件', 'KKT conditions', 9],
      ['对偶问题', '对偶问题', 'Dual problem', 11],
      ['本节检查', '本节检查', 'Session checklist', 13]
    ]
  }),
  createReaderConfig({
    slug: 'p09-section-python',
    file: 'cs229_python_tutorial/cs229_python_friday.pdf',
    title: 'CS229 Discussion Section · Python and Vectorization',
    pageStart: 1,
    pageEnd: 40,
    directory: 'section',
    sections: [
      ['ndarray-与-shape', 'ndarray 与 shape', 'NumPy arrays', 4],
      ['索引与切片', '索引与切片', 'Indexing and slicing', 9],
      ['广播', '广播', 'Broadcasting', 14],
      ['矩阵乘法与逐元素乘法', '矩阵与逐元素运算', 'Matrix operations', 18],
      ['向量化线性回归', '向量化线性回归', 'Vectorized linear regression', 23],
      ['向量化逻辑回归', '向量化逻辑回归', 'Vectorized logistic regression', 27],
      ['数据泄漏', '数据泄漏', 'Data leakage', 32],
      ['最小实现验证', '最小实现验证', 'Implementation checks', 37],
      ['本节检查', '本节检查', 'Session checklist', 40]
    ]
  }),
  createReaderConfig({
    slug: 'p10-kernels',
    file: 'cs229-notes3.pdf',
    title: 'CS229 Lecture 7 · Kernels',
    pageStart: 13,
    pageEnd: 25,
    sections: [
      ['从对偶问题观察内积', '对偶中的内积', 'Inner products in the dual', 13],
      ['kernel-trick', 'Kernel Trick', 'Kernel trick', 14],
      ['高斯-rbf-kernel', 'RBF Kernel', 'Gaussian kernel', 15],
      ['什么函数可以作为-kernel', '合法 Kernel', 'Valid kernels', 16],
      ['软间隔-svm', '软间隔 SVM', 'Non-separable case', 19],
      ['hinge-loss', 'Hinge Loss', 'Hinge loss', 20],
      ['smo', 'SMO', 'Sequential minimal optimization', 21],
      ['kernel-的计算代价', 'Kernel 计算代价', 'Computational cost', 24],
      ['本节检查', '本节检查', 'Session checklist', 25]
    ]
  }),
  createReaderConfig({
    slug: 'p11-data-splits-model-selection-cross-validation',
    file: 'cs229-notes5.pdf',
    title: 'CS229 Lecture 8 · Model Selection and Cross Validation',
    pageStart: 1,
    pageEnd: 8,
    sections: [
      ['训练、验证与测试', '训练、验证与测试', 'Train/dev/test splits', 1],
      ['划分不是随机切一刀', '数据划分策略', 'Split strategy', 2],
      ['k-折交叉验证', 'K 折交叉验证', 'Cross validation', 2],
      ['模型复杂度', '模型复杂度', 'Model complexity', 3],
      ['特征选择', '特征选择', 'Feature selection', 4],
      ['正则化', '正则化', 'Regularization', 6],
      ['贝叶斯视角', '贝叶斯视角', 'Bayesian interpretation', 6],
      ['本节检查', '本节检查', 'Session checklist', 8]
    ]
  }),
  createReaderConfig({
    slug: 'p12-learning-theory-erm',
    file: 'cs229-notes4.pdf',
    title: 'CS229 Lecture 9 · Learning Theory and ERM',
    pageStart: 1,
    pageEnd: 11,
    sections: [
      ['真风险与经验风险', '真风险与经验风险', 'Generalization error', 2],
      ['经验风险最小化', 'ERM', 'Empirical risk minimization', 3],
      ['近似误差', '近似误差', 'Approximation error', 3],
      ['估计误差', '估计误差', 'Estimation error', 4],
      ['固定假设的集中界', 'Hoeffding 界', "Hoeffding's inequality", 5],
      ['有限假设类与-union-bound', '有限假设类', 'Finite hypothesis classes', 6],
      ['一致收敛', '一致收敛', 'Uniform convergence', 7],
      ['vc-维', 'VC 维', 'VC dimension', 9],
      ['本节检查', '本节检查', 'Session checklist', 11]
    ]
  }),
  createReaderConfig({
    slug: 'p13-decision-trees-ensembles',
    file: 'cs229-notes-dt.pdf',
    title: 'CS229 Lecture 10 · Decision Trees and Ensemble Methods',
    pageStart: 1,
    pageEnd: 9,
    sections: [
      ['树模型如何表示非线性', '树的非线性表示', 'Decision trees', 1],
      ['回归树', '回归树', 'Regression trees', 2],
      ['分类树纯度', '分类树纯度', 'Classification trees', 4],
      ['贪心递归切分', '递归切分', 'Recursive splitting', 5],
      ['树的过拟合', '剪枝与正则化', 'Tree regularization', 7],
      ['为什么-bagging-有效', 'Bagging', 'Bagging', 8],
      ['随机森林', '随机森林', 'Random forests', 8],
      ['boosting-的不同思路', 'Boosting', 'Boosting', 9],
      ['本节检查', '本节检查', 'Session checklist', 9]
    ]
  }),
  createReaderConfig({
    slug: 'p14-neural-networks-introduction',
    file: 'cs229-notes-deep_learning.pdf',
    title: 'CS229 Lecture 11 · Introduction to Neural Networks',
    pageStart: 1,
    pageEnd: 8,
    sections: [
      ['从线性模型到表示学习', '表示学习', 'From linear models to networks', 1],
      ['多层网络', '多层网络', 'Multilayer networks', 3],
      ['参数维度', '参数维度', 'Parameter shapes', 4],
      ['激活函数', '激活函数', 'Activation functions', 4],
      ['前向传播', '前向传播', 'Forward propagation', 5],
      ['跨样本向量化', '跨样本向量化', 'Vectorizing examples', 7],
      ['参数初始化', '参数初始化', 'Initialization', 8],
      ['本节检查', '本节检查', 'Session checklist', 8]
    ]
  }),
  createReaderConfig({
    slug: 'p15-section-evaluation-metrics',
    file: 'evaluation_metrics_spring2020.pdf',
    title: 'CS229 Discussion Section · Evaluation Metrics',
    pageStart: 1,
    pageEnd: 31,
    directory: 'section',
    sections: [
      ['混淆矩阵', '混淆矩阵', 'Confusion matrix', 3],
      ['accuracy', 'Accuracy', 'Accuracy', 5],
      ['precision', 'Precision', 'Precision', 7],
      ['recall', 'Recall', 'Recall', 8],
      ['f1', 'F1', 'F1 score', 10],
      ['roc-曲线', 'ROC 曲线', 'ROC curve', 13],
      ['pr-曲线', 'PR 曲线', 'Precision-recall curve', 16],
      ['多分类指标', '多分类指标', 'Multiclass metrics', 21],
      ['概率校准', '概率校准', 'Calibration', 25],
      ['本节检查', '本节检查', 'Session checklist', 31]
    ]
  }),
  createReaderConfig({
    slug: 'p16-backprop-neural-network-training',
    file: 'cs229-notes-deep_learning.pdf',
    title: 'CS229 Lecture 12 · Backprop and Improving Neural Networks',
    pageStart: 8,
    pageEnd: 16,
    sections: [
      ['反向传播要解决什么', '反向传播', 'Backpropagation', 8],
      ['计算图与局部导数', '计算图', 'Computation graphs', 8],
      ['线性层反向传播', '线性层反向传播', 'Layer gradients', 9],
      ['梯度消失与爆炸', '梯度消失与爆炸', 'Vanishing/exploding gradients', 10],
      ['初始化', '初始化', 'Initialization', 11],
      ['优化方法', '优化方法', 'Optimization', 12],
      ['batch-normalization', 'Batch Normalization', 'Batch normalization', 13],
      ['dropout', 'Dropout', 'Dropout', 14],
      ['梯度检查', '梯度检查', 'Gradient checking', 15],
      ['本节检查', '本节检查', 'Session checklist', 16]
    ]
  }),
  createReaderConfig({
    slug: 'p17-ml-debugging-error-analysis',
    file: 'ML-advice.pdf',
    title: 'CS229 Lecture 13 · Debugging ML Models and Error Analysis',
    pageStart: 1,
    pageEnd: 30,
    directory: 'materials',
    sections: [
      ['诊断优先', '诊断优先', 'Diagnostics first', 1],
      ['建立可靠基线', '建立基线', 'Build a baseline', 3],
      ['偏差诊断', '偏差诊断', 'Bias diagnostics', 6],
      ['方差诊断', '方差诊断', 'Variance diagnostics', 7],
      ['学习曲线', '学习曲线', 'Learning curves', 8],
      ['优化误差与统计误差', '优化与统计误差', 'Optimization vs. objective', 10],
      ['手工误差分析', '误差分析', 'Error analysis', 20],
      ['消融实验', '消融实验', 'Ablative analysis', 23],
      ['本节检查', '本节检查', 'Session checklist', 29]
    ]
  }),
  createReaderConfig({
    slug: 'p18-section-midterm-review',
    file: 'cs229-mt-review.pdf',
    title: 'CS229 Discussion Section · Midterm Review',
    pageStart: 1,
    pageEnd: 54,
    directory: 'materials',
    sections: [
      ['线性回归闭环', '线性回归', 'Linear regression', 4],
      ['逻辑回归闭环', '逻辑回归', 'Logistic regression', 9],
      ['glm-识别模板', 'GLM', 'Generalized linear models', 14],
      ['生成式分类模板', '生成式分类', 'Generative learning', 18],
      ['svm-闭环', 'SVM', 'Support vector machines', 26],
      ['kkt-解题结构', 'KKT', 'KKT conditions', 31],
      ['偏差与方差', '偏差与方差', 'Bias and variance', 37],
      ['erm-与泛化', 'ERM 与泛化', 'Learning theory', 41],
      ['神经网络前向与反向', '神经网络', 'Neural networks', 47],
      ['本节检查', '本节检查', 'Session checklist', 54]
    ]
  }),
  createReaderConfig({
    slug: 'p19-kmeans-gmm-em',
    file: 'cs229-notes8.pdf',
    title: 'CS229 Lecture 14 · K-means, GMM and EM',
    pageStart: 1,
    pageEnd: 8,
    sections: [
      ['k-means', 'K-means', 'K-means', 1],
      ['收敛与局部最优', '收敛与局部最优', 'Convergence and local optima', 2],
      ['从硬分配到概率模型', '从硬到软聚类', 'From hard to soft clustering', 3],
      ['隐变量困难', '隐变量困难', 'Latent-variable likelihood', 3],
      ['e-步', 'E 步', 'E-step', 4],
      ['m-步', 'M 步', 'M-step', 5],
      ['gmm-与-k-means', 'GMM 与 K-means', 'GMM vs. K-means', 6],
      ['数值与退化', '数值与退化', 'Numerical degeneracy', 7],
      ['本节检查', '本节检查', 'Session checklist', 8]
    ]
  }),
  createReaderConfig({
    slug: 'p20-em-factor-analysis',
    file: 'cs229-notes9.pdf',
    title: 'CS229 Lecture 15 · EM and Factor Analysis',
    pageStart: 1,
    pageEnd: 9,
    sections: [
      ['em-的一般问题', 'EM 一般问题', 'The EM algorithm', 1],
      ['jensen-不等式', 'Jensen 不等式', "Jensen's inequality", 1],
      ['elbo-与-kl-分解', 'ELBO 与 KL', 'Lower bound', 2],
      ['e-步与-m-步', 'E 步与 M 步', 'E-step and M-step', 3],
      ['为什么需要-factor-analysis', '为什么需要因子分析', 'Covariance modeling', 4],
      ['因子分析生成模型', '因子分析模型', 'Factor analysis model', 4],
      ['边缘分布', '边缘分布', 'Marginal distribution', 5],
      ['factor-analysis-的-em', 'Factor Analysis 的 EM', 'EM for factor analysis', 6],
      ['本节检查', '本节检查', 'Session checklist', 9]
    ]
  }),
  createReaderConfig({
    slug: 'p21-pca',
    file: 'cs229-notes10.pdf',
    title: 'CS229 2018-11-12 · Principal Component Analysis',
    pageStart: 1,
    pageEnd: 6,
    sections: [
      ['降维问题', '降维问题', 'Dimensionality reduction', 1],
      ['数据中心化', '数据中心化', 'Preprocessing', 1],
      ['最大方差方向', '最大方差方向', 'Maximum variance direction', 2],
      ['特征值推导', '特征值推导', 'Eigenvalue derivation', 3],
      ['多个主成分', '多个主成分', 'Multiple principal components', 4],
      ['重建', '重建', 'Reconstruction', 4],
      ['svd-实现', 'SVD 实现', 'SVD implementation', 5],
      ['pca-的限制', 'PCA 的限制', 'Limitations', 6],
      ['本节检查', '本节检查', 'Session checklist', 6]
    ]
  }),
  createReaderConfig({
    slug: 'p22-ica-reinforcement-learning',
    file: 'cs229-notes11.pdf',
    title: 'CS229 Lecture 16 · Independent Component Analysis and RL',
    pageStart: 1,
    pageEnd: 6,
    sections: [
      ['盲源分离', '盲源分离', 'Blind source separation', 1],
      ['ica-与-pca', 'ICA 与 PCA', 'ICA vs. PCA', 1],
      ['ica-的关键假设', 'ICA 假设', 'ICA assumptions', 2],
      ['不可辨识性', '不可辨识性', 'ICA ambiguities', 2],
      ['密度线性变换', '密度线性变换', 'Density transformations', 3],
      ['ica-学习', 'ICA 学习', 'ICA algorithm', 4],
      ['从表示学习转向决策', '进入强化学习', 'Introduction to RL', 6],
      ['本节检查', '本节检查', 'Session checklist', 6]
    ]
  }),
  createReaderConfig({
    slug: 'p23-mdp-value-policy-iteration',
    file: 'cs229-notes12.pdf',
    title: 'CS229 Lecture 17 · MDPs and Value/Policy Iteration',
    pageStart: 1,
    pageEnd: 7,
    sections: [
      ['马尔可夫决策过程', 'MDP', 'Markov decision processes', 2],
      ['策略', '策略', 'Policies', 2],
      ['折扣回报', '折扣回报', 'Discounted return', 2],
      ['策略价值函数', '策略价值函数', 'Value function', 3],
      ['动作价值函数', '动作价值函数', 'Action-value function', 3],
      ['最优价值函数', '最优价值函数', 'Bellman optimality', 4],
      ['价值迭代', '价值迭代', 'Value iteration', 4],
      ['策略迭代', '策略迭代', 'Policy iteration', 5],
      ['本节检查', '本节检查', 'Session checklist', 7]
    ]
  }),
  createReaderConfig({
    slug: 'p24-continuous-state-mdp-model-simulation',
    file: 'cs229-notes12.pdf',
    title: 'CS229 Lecture 18 · Continuous-State MDP and Model Simulation',
    pageStart: 6,
    pageEnd: 15,
    sections: [
      ['已知模型与未知模型', '已知与未知模型', 'Learning an MDP model', 6],
      ['经验转移模型', '经验转移模型', 'Empirical transition model', 6],
      ['探索与利用', '探索与利用', 'Exploration and exploitation', 7],
      ['连续状态困难', '连续状态 MDP', 'Continuous-state MDPs', 7],
      ['离散化', '离散化', 'Discretization', 8],
      ['价值函数近似', '价值函数近似', 'Value approximation', 10],
      ['bellman-目标', 'Bellman 目标', 'Bellman targets', 12],
      ['用模拟估计期望', '模型模拟', 'Model simulation', 13],
      ['本节检查', '本节检查', 'Session checklist', 15]
    ]
  }),
  createReaderConfig({
    slug: 'p25-section-critiques-of-ml',
    file: 'critiques-ml.pdf',
    title: 'CS229 Discussion Section · Critiques of Machine Learning',
    pageStart: 1,
    pageEnd: 78,
    directory: 'materials',
    sections: [
      ['数据不是世界本身', '数据与世界', 'Data and representation', 5],
      ['选择偏差', '选择偏差', 'Selection bias', 11],
      ['标签并非天然真值', '标签问题', 'Labels and measurement', 18],
      ['相关与因果', '相关与因果', 'Correlation and causality', 27],
      ['目标函数塑造行为', '目标与行为', 'Objectives and behavior', 34],
      ['总体指标掩盖群体差异', '群体差异', 'Group-level metrics', 42],
      ['公平性定义冲突', '公平性', 'Fairness definitions', 49],
      ['部署反馈循环', '反馈循环', 'Deployment feedback loops', 58],
      ['隐私与安全', '隐私与安全', 'Privacy and security', 69],
      ['本节检查', '本节检查', 'Session checklist', 78]
    ]
  }),
  createReaderConfig({
    slug: 'p26-reward-model-linear-dynamical-systems',
    file: 'cs229-notes13.pdf',
    title: 'CS229 Lecture 19 · Reward Model and Linear Dynamical Systems',
    pageStart: 1,
    pageEnd: 9,
    sections: [
      ['状态—动作奖励', '状态—动作奖励', 'State-action rewards', 1],
      ['有限时域-mdp', '有限时域 MDP', 'Finite-horizon MDPs', 1],
      ['反向动态规划', '反向动态规划', 'Backward dynamic programming', 2],
      ['动力系统', '动力系统', 'Dynamical systems', 4],
      ['线性动力学', '线性动力学', 'Linear dynamics', 5],
      ['二次代价', '二次代价', 'Quadratic cost', 5],
      ['最优线性反馈', '最优线性反馈', 'LQR feedback', 7],
      ['riccati-递推', 'Riccati 递推', 'Riccati recursion', 8],
      ['本节检查', '本节检查', 'Session checklist', 9]
    ]
  }),
  createReaderConfig({
    slug: 'p27-rl-debugging-diagnostics',
    file: 'cs229-notes13.pdf',
    title: 'CS229 Lecture 20 · RL Debugging, DDP and LQG',
    pageStart: 9,
    pageEnd: 15,
    sections: [
      ['rl-调试为什么困难', 'RL 调试', 'RL debugging', 9],
      ['分层验证', '分层验证', 'Layered diagnostics', 9],
      ['ddp-的目标', 'DDP', 'Differential dynamic programming', 10],
      ['ddp-迭代', 'DDP 迭代', 'DDP iterations', 11],
      ['部分可观测性', '部分可观测性', 'Partial observability', 12],
      ['线性高斯系统', '线性高斯系统', 'Linear Gaussian systems', 12],
      ['kalman-filter：预测', 'Kalman 预测', 'Kalman prediction', 13],
      ['kalman-filter：更新', 'Kalman 更新', 'Kalman update', 13],
      ['分离原理', '分离原理', 'Separation principle', 14],
      ['本节检查', '本节检查', 'Session checklist', 15]
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
