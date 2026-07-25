---
title: 安全工程
description: 从密码学基础到 Agent 工具权限，记录能够落到工程决策上的安全边界。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

安全笔记强调威胁模型：先说明要保护什么、攻击者具有什么能力，再选择算法、权限与审计机制。脱离场景讨论“是否安全”，通常没有可操作结论。

## 当前内容

- [AES 对称加密应用](/notes/security/aes-symmetric-encryption-application)：理解对称加密的适用边界、密钥与工程注意事项。
- [Pi Agent 深度解析](/blog/pi-agent-deep-dive)：从 Agent 的插件与工具机制理解最小权限、运行隔离和人工确认。

后续会补充密钥生命周期、敏感信息脱敏、工具调用授权，以及 Agent 执行外部操作时的审计链。
