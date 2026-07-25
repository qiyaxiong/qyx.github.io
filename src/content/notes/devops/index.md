---
title: DevOps 与交付
description: 记录从本地运行到线上发布所需的容器、代理、灰度、回滚与可观测性方法。
publishDate: 2026-07-25
updatedDate: 2026-07-25
language: zh
---

交付不是“把服务启动起来”，而是让一次变更能够安全进入生产环境，并在异常时快速发现、停止和恢复。

## 阅读路线

1. [Docker 与 Nginx](/notes/devops/docker-nginx)：理解应用进程、容器网络和反向代理之间的边界。
2. [平滑滚动发布通用脚本模板](/notes/smooth-rolling-release-generic-script-template)：把健康检查、流量切换和失败回滚编排成可重复流程。

后续笔记会继续补充 CI 检查、可观测性、数据库迁移和事故复盘，让“部署成功”升级为“变更可证明地安全”。
