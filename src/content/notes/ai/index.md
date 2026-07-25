---
title: AI Engineering
description: 从提示词、上下文与多模态输入，逐步走到工具、Agent 循环、评测和生产可靠性。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

这个专题研究的不是某个模型排行榜，而是怎样把模型能力变成可维护的系统能力。

推荐按“输入质量 → 推理接口 → 行动系统 → 评测反馈”的顺序阅读。这样先弄清模型看见了什么，再讨论它如何调用工具、怎样确认结果。

## 推荐路径

1. [从 Prompt Engineer 到 Content Engineer 再到 Harness Engineer](/notes/ai/prompt-content-harness-engineer)：建立 AI 应用工程的三层框架。
2. [多模态图片分析：从“看见”到可验证结论](/notes/ai/multimodal-image-analysis)：把图片理解拆成证据、推断与验证。
3. [LangChain 模型 reasoning_content](/notes/langchain-model-reasoning-content)：理解模型推理字段在框架中的传递方式。
4. [TRL RewardTrainer 与奖励模型代码流](/notes/trl-reward-trainer-reward-model-code-flow)：沿代码路径理解奖励模型训练。
5. [Pi Agent 深度解析](/blog/pi-agent-deep-dive)：观察极简 Agent 内核如何承载可插拔工具与扩展。

## 一条核心判断

Prompt 决定任务怎样被表达，Content 决定模型能看到什么，Harness 决定模型怎样行动、失败后怎样恢复。真正可靠的 AI 产品，需要三层共同工作。
