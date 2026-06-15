---
title: 从 Prompt Engineer 到 Content Engineer 再到 Harness Engineer
description: 一条关于 AI 应用工程角色边界变化的笔记：从优化问法，到组织内容，再到搭建可靠运行外壳。
publishDate: 2026-06-15
language: zh
---

AI 应用工程里的角色重心，正在从 prompt 迁移到 content，再迁移到 harness。

这不是三个互相替代的岗位名，而是同一条能力链的三层扩展：

```text
Prompt Engineer  ->  Content Engineer  ->  Harness Engineer
优化问法             组织材料              搭建运行系统
```

## Prompt Engineer

Prompt Engineer 关注的是“怎么问”。

早期大模型输出高度依赖措辞、角色设定、示例、输出格式和约束条件。这个阶段的核心问题是：

```text
怎样写输入，模型才更容易给出预期结果？
```

它的典型交付物是：

- system prompt
- task prompt
- few-shot examples
- 输出格式约束
- 拒答规则
- prompt 版本和评测样例

这个角色解决的是一次模型调用的可控性。但 prompt 的边界也很明显：它很难单独解决知识过期、内容污染、工具失败、权限控制、长期记忆和线上可观测性。

## Content Engineer

Content Engineer 关注的是“给模型什么材料”。

这里的 content 不是单篇文章，而是可被系统复用的知识资产，包括内容模型、元数据、分类体系、结构化字段、审核流程、更新机制和知识库。

它的核心问题是：

```text
模型基于什么内容回答？这些内容如何生产、清洗、标注、更新和复用？
```

如果说 Prompt Engineer 优化的是“问法”，Content Engineer 优化的是“可被问的材料”。

在 RAG、AI Search、知识库问答、客服、销售助手、文档助手里，内容质量通常比 prompt 技巧更决定系统上限。内容脏、重复、过期、缺少来源，模型就会在一个坏信息环境里生成看似合理的答案。

## Harness Engineer

Harness Engineer 关注的是“如何让模型可靠地干活”。

Harness 可以理解为包在模型外面的运行外壳：

- prompt
- context
- tools
- memory
- workflow
- agent loop
- guardrails
- evals
- tracing
- retry and recovery
- human-in-the-loop

它的核心问题是：

```text
怎样让模型在真实环境里稳定执行任务，并且失败时可观察、可恢复、可评估？
```

一个 agent 不是一次模型调用。它会计划、调用工具、读取文件、执行命令、处理状态、根据观察继续行动。到了这个阶段，模型只是系统中的一个推理部件，真正的产品能力来自模型、内容、工具、状态、评测和治理的组合。

## 三者的区别

| 角色 | 核心对象 | 主要问题 | 典型交付物 |
|---|---|---|---|
| Prompt Engineer | 指令 | 怎么问 | prompt、示例、格式约束 |
| Content Engineer | 内容资产 | 给什么材料 | 知识库、元数据、内容模型、更新流程 |
| Harness Engineer | 运行系统 | 怎么可靠执行 | agent loop、工具编排、guardrails、evals、tracing |

可以用一句话概括：

```text
Prompt Engineer 把模型叫醒。
Content Engineer 给模型喂对材料。
Harness Engineer 让模型在生产环境里干活并承担后果。
```

所以，能力升级不是从“会写 prompt”跳到“会写代码”这么简单，而是从一次交互走向系统设计。

Prompt 仍然重要，但它只是入口。内容决定模型看到什么，harness 决定模型怎么行动、怎么失败、怎么被修复。AI 应用越接近真实业务，价值就越不在某句神奇提示词里，而在整套可维护的运行机制里。

## 参考

- [OpenAI Prompt Engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)
- [Anthropic Prompt Engineering Overview](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview)
- [OpenAI Agents SDK](https://openai.github.io/openai-agents-python/)
- [Content Engineering Guide](https://www.airops.com/blog/content-engineering)
- [The Prompt Report](https://arxiv.org/abs/2406.06608)
- [Harness Engineering as Categorical Architecture](https://arxiv.org/abs/2605.12239)
