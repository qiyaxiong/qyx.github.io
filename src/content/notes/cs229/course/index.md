---
title: CS229 双语完整课程
description: 19 章中文重构讲义，逐章对应英文原版 PDF，可在中文、英文与中英对照模式之间切换。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

这套课程把 CS229 Autumn 2018 仓库中的主讲义、深度学习补充讲义和机器学习实践建议，整理为 19 个按知识依赖排列的章节。

它不是逐句复制 Stanford 讲义。中文部分独立重构问题、假设、推导、实现与诊断；英文模式由 PDF.js 直接读取原仓库文件。每个章节按钮都对应原讲义页码。

## 第一部分：监督学习

1. [线性回归](/notes/cs229/course/linear-regression)
2. [逻辑回归、指数族与 GLM](/notes/cs229/course/logistic-regression-glm)
3. [生成式学习：GDA 与 Naive Bayes](/notes/cs229/course/generative-learning)
4. [支持向量机与 Kernel](/notes/cs229/course/svm-kernels)

## 第二部分：泛化与模型选择

5. [学习理论与 VC 维](/notes/cs229/course/learning-theory)
6. [模型选择、正则化与贝叶斯视角](/notes/cs229/course/model-selection-regularization)
7. [在线学习与感知机错误上界](/notes/cs229/course/online-learning-perceptron)

## 第三部分：树模型与机器学习实践

8. [决策树](/notes/cs229/course/decision-trees)
9. [集成学习：Bagging、AdaBoost 与 Gradient Boosting](/notes/cs229/course/ensemble-learning)
10. [机器学习策略、诊断与误差分析](/notes/cs229/course/ml-strategy-error-analysis)

## 第四部分：神经网络

11. [神经网络、向量化与反向传播](/notes/cs229/course/neural-networks-backprop)

## 第五部分：无监督学习

12. [K-means](/notes/cs229/course/kmeans)
13. [高斯混合模型](/notes/cs229/course/gaussian-mixture-models)
14. [EM 算法](/notes/cs229/course/em-algorithm)
15. [Factor Analysis](/notes/cs229/course/factor-analysis)
16. [PCA](/notes/cs229/course/principal-component-analysis)
17. [ICA](/notes/cs229/course/independent-component-analysis)

## 第六部分：强化学习与控制

18. [强化学习、MDP 与价值迭代](/notes/cs229/course/reinforcement-learning-mdp)
19. [有限时域控制、LQR、DDP 与 LQG](/notes/cs229/course/control-lqr-lqg)

## 怎样判断一章学完

每章都按同一个闭环组织：

```text
问题 → 假设 → 目标函数 → 求解方法 → 实现检查 → 失败边界
```

只看完中文或英文都不算完成。你应该能合上讲义，重新写出主要变量和目标函数，并知道用什么实验检查实现是否正确。
