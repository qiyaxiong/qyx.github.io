export type Cs229SessionKind = 'lecture' | 'section'

export interface Cs229SessionMaterial {
  label: string
  path: string
  detail?: string
}

export interface Cs229Session {
  order: number
  videoPage: number
  cid: number
  kind: Cs229SessionKind
  label: string
  date?: string
  slug: string
  titleZh: string
  titleEn: string
  duration: string
  topics: string[]
  materials: Cs229SessionMaterial[]
  assignment?: Cs229SessionMaterial
}

const note = (label: string, file: string, detail?: string): Cs229SessionMaterial => ({
  label,
  path: `notes/${file}`,
  detail
})

const material = (label: string, file: string, detail?: string): Cs229SessionMaterial => ({
  label,
  path: `materials/${file}`,
  detail
})

const section = (label: string, file: string, detail?: string): Cs229SessionMaterial => ({
  label,
  path: `section/${file}`,
  detail
})

const assignment = (number: 0 | 1 | 2 | 3 | 4, detail: string): Cs229SessionMaterial => ({
  label: `Problem Set ${number}`,
  path: `problem-sets/PS${number}/ps${number}.pdf`,
  detail
})

export const cs229Sessions: Cs229Session[] = [
  {
    order: 1,
    videoPage: 1,
    cid: 888088508,
    kind: 'lecture',
    label: 'Lecture 1',
    slug: 'p01-welcome-introduction',
    titleZh: '课程导论与机器学习基本概念',
    titleEn: 'Welcome and Introduction',
    duration: '1:15:20',
    topics: ['课程结构', '机器学习定义', '监督学习', '无监督学习', '强化学习'],
    materials: [],
    assignment: assignment(0, '本节发布；2018-10-03 截止')
  },
  {
    order: 2,
    videoPage: 2,
    cid: 888086072,
    kind: 'lecture',
    label: 'Lecture 2',
    slug: 'p02-linear-regression-gradient-descent',
    titleZh: '线性回归与梯度下降',
    titleEn: 'Linear Regression and Gradient Descent',
    duration: '1:18:17',
    topics: ['监督学习设定', '线性模型', '最小二乘', 'LMS', '正规方程'],
    materials: [note('Lecture Notes 1', 'cs229-notes1.pdf', 'PDF 第 1–13 页')],
    assignment: assignment(0, '配套数学与编程预备作业')
  },
  {
    order: 3,
    videoPage: 3,
    cid: 888094755,
    kind: 'section',
    label: 'Discussion Section',
    date: '2018-09-28',
    slug: 'p03-section-linear-algebra',
    titleZh: '讨论课：线性代数复习',
    titleEn: 'Discussion Section: Linear Algebra',
    duration: '1:32:11',
    topics: ['向量与矩阵', '秩', '逆矩阵', '特征值', '矩阵微分'],
    materials: [section('Linear Algebra Review', 'cs229-linalg.pdf', '完整 Section 讲义')]
  },
  {
    order: 4,
    videoPage: 4,
    cid: 888095092,
    kind: 'lecture',
    label: 'Lecture 3',
    slug: 'p04-locally-weighted-logistic-regression',
    titleZh: '局部加权回归、逻辑回归与牛顿法',
    titleEn: 'Locally Weighted and Logistic Regression',
    duration: '1:19:35',
    topics: ['局部加权回归', '分类', 'Sigmoid', '伯努利似然', '牛顿法'],
    materials: [note('Lecture Notes 1', 'cs229-notes1.pdf', 'PDF 第 13–21 页')],
    assignment: assignment(1, '本节之后开始进入 PS1 对应算法')
  },
  {
    order: 5,
    videoPage: 5,
    cid: 888078000,
    kind: 'lecture',
    label: 'Lecture 4',
    slug: 'p05-perceptron-generalized-linear-models',
    titleZh: '感知机、指数族与广义线性模型',
    titleEn: 'Perceptron and Generalized Linear Models',
    duration: '1:22:02',
    topics: ['感知机', '指数族', 'GLM', 'Softmax 回归'],
    materials: [
      note('Lecture Notes 1', 'cs229-notes1.pdf', 'PDF 第 21–30 页'),
      note('Online Learning and Perceptron', 'cs229-notes6.pdf', '补充阅读')
    ],
    assignment: assignment(1, '本节发布；2018-10-17 截止')
  },
  {
    order: 6,
    videoPage: 6,
    cid: 888072063,
    kind: 'section',
    label: 'Discussion Section',
    date: '2018-10-05',
    slug: 'p06-section-probability',
    titleZh: '讨论课：概率论复习',
    titleEn: 'Discussion Section: Probability',
    duration: '57:39',
    topics: ['条件概率', 'Bayes 公式', '期望与方差', '常见分布', '最大似然'],
    materials: [
      section('Probability Review Notes', 'cs229-prob.pdf'),
      section('Probability Review Slides', 'cs229-prob-slide.pdf')
    ]
  },
  {
    order: 7,
    videoPage: 7,
    cid: 888133305,
    kind: 'lecture',
    label: 'Lecture 5',
    slug: 'p07-gda-naive-bayes',
    titleZh: '高斯判别分析与朴素贝叶斯',
    titleEn: 'GDA and Naive Bayes',
    duration: '1:18:52',
    topics: ['生成式学习', '多元高斯', 'GDA', 'Naive Bayes', '事件模型'],
    materials: [note('Lecture Notes 2', 'cs229-notes2.pdf', '完整讲义')],
    assignment: assignment(1, 'GDA 与分类题直接对应本节')
  },
  {
    order: 8,
    videoPage: 8,
    cid: 888076923,
    kind: 'lecture',
    label: 'Lecture 6',
    slug: 'p08-support-vector-machines',
    titleZh: '拉普拉斯平滑与支持向量机',
    titleEn: 'Support Vector Machines',
    duration: '1:20:57',
    topics: ['Laplace 平滑', '函数间隔', '几何间隔', '最大间隔', '对偶问题'],
    materials: [
      note('Lecture Notes 2', 'cs229-notes2.pdf', 'PDF 第 11–14 页'),
      note('Lecture Notes 3', 'cs229-notes3.pdf', 'PDF 第 1–13 页')
    ],
    assignment: assignment(1, '分类与概率模型作业')
  },
  {
    order: 9,
    videoPage: 9,
    cid: 888074346,
    kind: 'section',
    label: 'Discussion Section',
    date: '2018-10-12',
    slug: 'p09-section-python',
    titleZh: '讨论课：Python 与向量化',
    titleEn: 'Discussion Section: Python',
    duration: '1:29:01',
    topics: ['NumPy', '向量化', '数组维度', 'Notebook', '实现检查'],
    materials: [
      section('Python Tutorial Slides', 'cs229_python_tutorial/cs229_python_friday.pdf'),
      section('Python Tutorial Notebook', 'cs229_python_tutorial/Spring_2020_Notebook.ipynb')
    ]
  },
  {
    order: 10,
    videoPage: 10,
    cid: 888087510,
    kind: 'lecture',
    label: 'Lecture 7',
    slug: 'p10-kernels',
    titleZh: '核方法与支持向量机求解',
    titleEn: 'Kernels',
    duration: '1:20:25',
    topics: ['特征映射', 'Kernel Trick', 'Mercer 条件', '软间隔', 'SMO'],
    materials: [
      note('Lecture Notes 3', 'cs229-notes3.pdf', 'PDF 第 13–25 页'),
      material('SMO Paper', 'smo-paper-platt.pdf', '算法原始论文')
    ],
    assignment: assignment(2, 'Kernel 构造、Kernelized Perceptron 与垃圾邮件分类')
  },
  {
    order: 11,
    videoPage: 11,
    cid: 888080891,
    kind: 'lecture',
    label: 'Lecture 8',
    slug: 'p11-data-splits-model-selection-cross-validation',
    titleZh: '数据划分、模型选择与交叉验证',
    titleEn: 'Data Splits, Models and Cross Validation',
    duration: '1:23:26',
    topics: ['训练/验证/测试集', '交叉验证', '特征选择', '正则化', '贝叶斯视角'],
    materials: [
      note('Lecture Notes 5', 'cs229-notes5.pdf', '完整讲义'),
      material('ML Advice', 'ML-advice.pdf', '模型选择与诊断补充')
    ],
    assignment: assignment(2, '本节发布；2018-10-31 截止')
  },
  {
    order: 12,
    videoPage: 12,
    cid: 888086362,
    kind: 'lecture',
    label: 'Lecture 9',
    slug: 'p12-learning-theory-erm',
    titleZh: '近似误差、估计误差与经验风险最小化',
    titleEn: 'Approximation/Estimation Error and ERM',
    duration: '1:26:03',
    topics: ['偏差与方差', 'ERM', '泛化', '有限假设类', 'VC 维'],
    materials: [
      note('Lecture Notes 4', 'cs229-notes4.pdf', '完整讲义'),
      note('Bias/Variance and Error Analysis', 'error-analysis.pdf', '补充讲义')
    ],
    assignment: assignment(2, '训练稳定性、校准和正则化题与本节相关')
  },
  {
    order: 13,
    videoPage: 13,
    cid: 888101598,
    kind: 'lecture',
    label: 'Lecture 10',
    slug: 'p13-decision-trees-ensembles',
    titleZh: '决策树与集成学习',
    titleEn: 'Decision Trees and Ensemble Methods',
    duration: '1:20:41',
    topics: ['决策树', '切分准则', 'Bagging', '随机森林', 'Boosting'],
    materials: [
      note('Decision Trees', 'cs229-notes-dt.pdf', '完整讲义'),
      note('Ensemble Learning', 'cs229-notes-ensemble.pdf', '完整讲义')
    ],
    assignment: assignment(2, '模型组合与分类实践')
  },
  {
    order: 14,
    videoPage: 14,
    cid: 888097684,
    kind: 'lecture',
    label: 'Lecture 11',
    slug: 'p14-neural-networks-introduction',
    titleZh: '神经网络基础',
    titleEn: 'Introduction to Neural Networks',
    duration: '1:20:14',
    topics: ['神经元', '激活函数', '多层网络', '前向传播', '向量化'],
    materials: [note('Deep Learning Notes', 'cs229-notes-deep_learning.pdf', 'PDF 第 1–8 页')],
    assignment: assignment(3, '两层神经网络实现')
  },
  {
    order: 15,
    videoPage: 15,
    cid: 888098200,
    kind: 'section',
    label: 'Discussion Section',
    date: '2018-10-26',
    slug: 'p15-section-evaluation-metrics',
    titleZh: '讨论课：评估指标',
    titleEn: 'Discussion Section: Evaluation Metrics',
    duration: '1:29:00',
    topics: ['混淆矩阵', 'Precision/Recall', 'F1', 'ROC', '类别不平衡'],
    materials: [
      section(
        'Evaluation Metrics Slides',
        'evaluation_metrics_spring2020.pdf',
        '仓库中的后续版本；2018 课表原链接文件未保留'
      )
    ]
  },
  {
    order: 16,
    videoPage: 16,
    cid: 888102478,
    kind: 'lecture',
    label: 'Lecture 12',
    slug: 'p16-backprop-neural-network-training',
    titleZh: '反向传播与神经网络训练改进',
    titleEn: 'Backprop and Improving Neural Networks',
    duration: '1:16:38',
    topics: ['反向传播', '计算图', '初始化', '优化', '正则化'],
    materials: [
      note('Deep Learning Notes', 'cs229-notes-deep_learning.pdf', 'PDF 第 8–16 页'),
      note('Backpropagation Notes', 'cs229-notes-backprop.pdf', '补充推导')
    ],
    assignment: assignment(3, '本节发布；2018-11-14 截止')
  },
  {
    order: 17,
    videoPage: 17,
    cid: 888111337,
    kind: 'lecture',
    label: 'Lecture 13',
    slug: 'p17-ml-debugging-error-analysis',
    titleZh: '机器学习调试与误差分析',
    titleEn: 'Debugging ML Models and Error Analysis',
    duration: '1:18:55',
    topics: ['诊断优先', '偏差/方差', '误差分析', '消融实验', '快速基线'],
    materials: [
      material('Advice for Applying Machine Learning', 'ML-advice.pdf', '完整讲义'),
      note('Error Analysis', 'error-analysis.pdf', '补充讲义')
    ],
    assignment: assignment(3, '神经网络与无监督学习实践')
  },
  {
    order: 18,
    videoPage: 18,
    cid: 888102947,
    kind: 'section',
    label: 'Discussion Section',
    date: '2018-11-02',
    slug: 'p18-section-midterm-review',
    titleZh: '讨论课：期中复习',
    titleEn: 'Discussion Section: Midterm Review',
    duration: '1:29:00',
    topics: ['监督学习', '生成式模型', 'SVM', '学习理论', '神经网络'],
    materials: [material('Midterm Review', 'cs229-mt-review.pdf', '完整复习讲义')]
  },
  {
    order: 19,
    videoPage: 19,
    cid: 888109322,
    kind: 'lecture',
    label: 'Lecture 14',
    slug: 'p19-kmeans-gmm-em',
    titleZh: 'K-means、高斯混合与 EM',
    titleEn: 'Expectation-Maximization Algorithms',
    duration: '1:20:32',
    topics: ['K-means', 'GMM', '隐变量', '责任度', 'EM'],
    materials: [
      note('K-means', 'cs229-notes7a.pdf'),
      note('Mixture of Gaussians', 'cs229-notes7b.pdf'),
      note('EM Algorithm', 'cs229-notes8.pdf', 'PDF 第 1–6 页')
    ],
    assignment: assignment(3, 'GMM 与 K-means 编程题')
  },
  {
    order: 20,
    videoPage: 20,
    cid: 888111606,
    kind: 'lecture',
    label: 'Lecture 15',
    slug: 'p20-em-factor-analysis',
    titleZh: 'EM 算法与因子分析',
    titleEn: 'EM Algorithm and Factor Analysis',
    duration: '1:19:48',
    topics: ['Jensen 不等式', '似然下界', 'E/M 步', 'Factor Analysis'],
    materials: [
      note('EM Algorithm', 'cs229-notes8.pdf', '完整讲义'),
      note('Factor Analysis', 'cs229-notes9.pdf', '完整讲义')
    ],
    assignment: assignment(3, '隐变量模型实践')
  },
  {
    order: 21,
    videoPage: 21,
    cid: 888445596,
    kind: 'lecture',
    label: 'Raw Class Recording',
    date: '2018-11-12',
    slug: 'p21-pca',
    titleZh: '主成分分析',
    titleEn: 'Principal Component Analysis',
    duration: '1:29:01',
    topics: ['数据标准化', '最大方差', '特征值', '投影', '重建'],
    materials: [note('PCA', 'cs229-notes10.pdf', '完整讲义')],
    assignment: assignment(4, '本周进入 PS4 的降维与控制部分')
  },
  {
    order: 22,
    videoPage: 22,
    cid: 888411093,
    kind: 'lecture',
    label: 'Lecture 16',
    slug: 'p22-ica-reinforcement-learning',
    titleZh: '独立成分分析与强化学习导论',
    titleEn: 'Independent Component Analysis and RL',
    duration: '1:18:10',
    topics: ['盲源分离', 'ICA', '密度变换', '强化学习', 'MDP'],
    materials: [
      note('ICA', 'cs229-notes11.pdf', '完整讲义'),
      note('Reinforcement Learning', 'cs229-notes12.pdf', 'PDF 第 1–3 页')
    ],
    assignment: assignment(4, '本节发布；2018-12-05 截止')
  },
  {
    order: 23,
    videoPage: 23,
    cid: 888417769,
    kind: 'lecture',
    label: 'Lecture 17',
    slug: 'p23-mdp-value-policy-iteration',
    titleZh: 'MDP、价值迭代与策略迭代',
    titleEn: 'MDPs and Value/Policy Iteration',
    duration: '1:19:15',
    topics: ['MDP', '价值函数', 'Bellman 方程', '价值迭代', '策略迭代'],
    materials: [note('Reinforcement Learning', 'cs229-notes12.pdf', 'PDF 第 1–7 页')],
    assignment: assignment(4, 'CartPole 与强化学习题')
  },
  {
    order: 24,
    videoPage: 24,
    cid: 888418452,
    kind: 'lecture',
    label: 'Lecture 18',
    slug: 'p24-continuous-state-mdp-model-simulation',
    titleZh: '连续状态 MDP、环境模型与模拟',
    titleEn: 'Continuous-State MDP and Model Simulation',
    duration: '1:20:15',
    topics: ['环境模型', '连续状态', '离散化', '价值近似', '拟合价值迭代'],
    materials: [note('Reinforcement Learning', 'cs229-notes12.pdf', 'PDF 第 6–15 页')],
    assignment: assignment(4, '连续状态控制与价值近似')
  },
  {
    order: 25,
    videoPage: 25,
    cid: 888408315,
    kind: 'section',
    label: 'Discussion Section',
    date: '2018-11-30',
    slug: 'p25-section-critiques-of-ml',
    titleZh: '讨论课：对机器学习的批判性审视',
    titleEn: 'Discussion Section: Critiques of Machine Learning',
    duration: '1:29:00',
    topics: ['数据偏差', '评价局限', '因果与相关', '公平性', '社会影响'],
    materials: [material('Critiques of Machine Learning', 'critiques-ml.pdf', '完整 Slides')]
  },
  {
    order: 26,
    videoPage: 26,
    cid: 888434723,
    kind: 'lecture',
    label: 'Lecture 19',
    slug: 'p26-reward-model-linear-dynamical-systems',
    titleZh: '状态—动作奖励与线性动力系统',
    titleEn: 'Reward Model and Linear Dynamical Systems',
    duration: '1:21:07',
    topics: ['状态—动作奖励', '有限时域 MDP', '动力系统', 'LQR', 'Riccati 方程'],
    materials: [note('LQR, DDP and LQG', 'cs229-notes13.pdf', 'PDF 第 1–9 页')],
    assignment: assignment(4, '控制问题与本节直接相关')
  },
  {
    order: 27,
    videoPage: 27,
    cid: 888429710,
    kind: 'lecture',
    label: 'Lecture 20',
    slug: 'p27-rl-debugging-diagnostics',
    titleZh: '强化学习调试、DDP 与 LQG',
    titleEn: 'RL Debugging and Diagnostics',
    duration: '1:12:43',
    topics: ['RL 诊断', '奖励设计', 'DDP', 'Kalman Filter', 'LQG'],
    materials: [
      material('ML Advice', 'ML-advice.pdf', 'PDF 第 16–19 页：RL 调试'),
      note('LQR, DDP and LQG', 'cs229-notes13.pdf', 'PDF 第 9–15 页')
    ],
    assignment: assignment(4, '本节为 Problem Set 4 截止日')
  },
  {
    order: 28,
    videoPage: 28,
    cid: 888427288,
    kind: 'section',
    label: 'Discussion Section',
    date: '2018-12-07',
    slug: 'p28-section-convolutional-neural-networks',
    titleZh: '讨论课：卷积神经网络',
    titleEn: 'Discussion Section: Convolutional Neural Networks',
    duration: '1:29:01',
    topics: ['卷积', '参数共享', '感受野', 'Pooling', 'CNN 训练'],
    materials: [
      section('Deep Learning Friday Slides', 'cs229_deep_learning_friday.pptx', '原始 PPTX')
    ]
  }
]

const repositoryBase = 'https://github.com/maxim5/cs229-2018-autumn'
const bilibiliBvid = 'BV1fP4y127nn'

export function getCs229Session(path: string): Cs229Session | undefined {
  return cs229Sessions.find((session) => path === `cs229/course/${session.slug}`)
}

export function getCs229MaterialUrl(material: Cs229SessionMaterial): string {
  return `${repositoryBase}/blob/main/${encodeURI(material.path)}`
}

export function getCs229VideoUrl(session: Cs229Session): string {
  return `https://www.bilibili.com/video/${bilibiliBvid}/?p=${session.videoPage}`
}

export function getCs229EmbedUrl(session: Cs229Session): string {
  return `https://player.bilibili.com/player.html?bvid=${bilibiliBvid}&cid=${session.cid}&page=${session.videoPage}&high_quality=1&danmaku=0`
}
