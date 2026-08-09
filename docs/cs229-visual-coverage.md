# CS229 28 章图解覆盖清单

## 目标

CS229 主课程笔记采用两层图解：

1. **六步故事板**：回答“这一章从什么问题出发，经过哪些关键步骤，最后得到什么”。
2. **局部细节图**：继续解释矩阵形状、几何关系、算法循环或具体公式，不因总览图而删除。

故事板不是正文截图，也不是装饰性封面。每一格只保留一个认知步骤，底部总结链负责把六个步骤重新连成完整机制。

## 28 章覆盖

| 章节 | 故事板主题 | 主要解释任务 | 图片 ID |
| --- | --- | --- | --- |
| P1 | 机器学习工作流 | 任务、数据、模型、优化、评价、部署闭环 | `p01-ml-workflow-storyboard` |
| P2 | 线性回归 | 矩阵预测、损失、梯度、正规方程、投影、求解选择 | `p02-linear-regression-storyboard` |
| P3 | 线性代数 | 向量、线性变换、秩、特征向量、SVD、投影 | `p03-linear-algebra-storyboard` |
| P4 | Logistic / Newton | Sigmoid、似然、梯度、Hessian、Newton、IRLS | `p04-logistic-newton-storyboard` |
| P5 | 感知机与 GLM | 感知机、指数族、自然参数、链接函数、GLM 实例 | `p05-glm-storyboard` |
| P6 | 概率论 | 随机变量、期望、联合分布、Bayes、独立性、大数定律 | `p06-probability-storyboard` |
| P7 | 生成式分类 | GDA 假设和估计、线性边界、Naive Bayes、平滑 | `p07-generative-classification-storyboard` |
| P8 | SVM | 最大间隔、拉格朗日、KKT、支持向量、一维例子 | `p08-svm-storyboard` |
| P9 | Python 与向量化 | Shape、矩阵计算、广播、掩码、数值稳定、断言 | `p09-python-vectorization-storyboard` |
| P10 | 核方法 | 特征映射、对偶内积、核技巧、PSD、预测、超参数 | `p10-kernel-methods-storyboard` |
| P11 | 模型选择 | 三份数据职责、CV、时间切分、折内拟合、测试协议 | `p11-model-selection-storyboard` |
| P12 | 学习理论 | 总体风险、经验风险、ERM、一致收敛、容量、正则化 | `p12-learning-theory-storyboard` |
| P13 | 树与集成 | 递归切分、纯度、剪枝、Bagging、随机森林、Boosting | `p13-trees-ensembles-storyboard` |
| P14 | 神经网络 | 神经元、矩阵化层、非线性、表示层级、输出、训练 | `p14-neural-network-storyboard` |
| P15 | 评估指标 | 混淆矩阵、P/R、F1、阈值曲线、校准、错误成本 | `p15-evaluation-metrics-storyboard` |
| P16 | 反向传播 | 前向缓存、输出误差、局部导数、三条梯度、形状检查 | `p16-backprop-storyboard` |
| P17 | ML 调试 | 基线、偏差方差、学习曲线、误差分桶、最小实验 | `p17-ml-debugging-storyboard` |
| P18 | 期中复习 | 线性模型、GLM、生成式分类、SVM、理论、解题模板 | `p18-midterm-map-storyboard` |
| P19 | K-means / GMM | 硬分配、中心更新、GMM、责任度、EM 参数更新 | `p19-clustering-em-storyboard` |
| P20 | EM | 困难似然、Jensen 下界、E/M 步、单调性、GMM | `p20-em-storyboard` |
| P21 | PCA | 中心化、协方差、特征分解、投影、重建、解释方差 | `p21-pca-storyboard` |
| P22 | ICA 与 RL 导论 | 混合/解混/独立源，以及状态/动作/奖励/长期回报 | `p22-ica-rl-intro-storyboard` |
| P23 | MDP 规划 | MDP、策略价值、Bellman、最优价值、两类迭代 | `p23-mdp-planning-storyboard` |
| P24 | 连续状态 MDP | 动力学、模拟、价值估计、函数逼近、模型误差 | `p24-continuous-mdp-storyboard` |
| P25 | ML 批判 | 代理目标、数据标签偏差、群体差异、反馈回路、治理 | `p25-ml-critiques-storyboard` |
| P26 | LDS / LQR | 线性动力学、二次成本、Riccati、反馈、稳定性 | `p26-lds-lqr-storyboard` |
| P27 | RL 调试 / LQG | 环境诊断、学习信号、DDP、Kalman Filter、LQG | `p27-rl-lqg-debugging-storyboard` |
| P28 | CNN | 空间输入、卷积、尺寸、通道、感受野、分类头 | `p28-cnn-storyboard` |

## 资产与生成

- 可编辑源文件：`src/visuals/tikz/cs229/storyboards/*.tex`
- 网站 PNG/PDF：`public/images/notes/cs229/storyboards/`
- 图像生成器：`src/scripts/generate-cs229-storyboard-diagrams.mjs`
- 正文接入器：`src/scripts/integrate-cs229-storyboards.mjs`

重新生成并接入：

```bash
node src/scripts/generate-cs229-storyboard-diagrams.mjs
node src/scripts/integrate-cs229-storyboards.mjs
```

P8 的 PNG 来自用户提供的 SVM 六格样板，因此没有对应的自动生成 PDF/TikZ；其余 27 章均可从 TikZ 重新生成。

## 编辑规则

- 故事板负责主线，正文负责证明、边界、代码、例题和失败诊断。
- 只有在故事板完整覆盖相同信息时，才删除重复图片或重复摘要。
- 不用一张总览图替代严格推导，也不在同一位置重复放置两张作用相同的图。
- 修改公开公式时，同时更新生成器、TikZ、PNG/PDF 与本清单。
- 每次发布前检查 28 个 Markdown 引用、28 个 PNG 响应和 27 个可编辑源文件。
