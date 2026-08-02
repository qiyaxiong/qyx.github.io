# Live2D 网站动作

Live2D 通过 `pi-agent-py` 提出结构化网站动作意图，浏览器端负责第二次校验和用户确认。Live2D 本身不拥有任意浏览器控制权。

## 当前支持

- 基于当前页面路径把上下文传给 Agent
- 站内白名单页面跳转
- 当前页面章节定位和滚动
- 结构化动作卡片
- 用户点击后执行动作
- SSE 重连时回放动作意图

## 安全边界

允许的站内路径包括 `/blog/`、`/notes/`、`/pages/`、`/collection/`、`/projects/`、`/search`、`/about`、`/links` 和 `/academic`。

前端和 BFF 都拒绝外部 URL、`javascript:`、协议相对 URL、路径穿越和未知路由。动作不能修改文章、评论、账户或站点数据。

## 用户体验

Agent 说“打开这篇文章”时，Live2D 展示“打开”卡片；只有用户点击后才跳转。章节定位会展示“定位”按钮。用户可以关闭卡片，动作不会自动执行。

## Cubism Core

`pixi-live2d-display` 只包含渲染框架，不包含 Live2D Cubism Core。组件会先加载
`PUBLIC_LIVE2D_CUBISM_CORE_URL`（默认 `/live2dcubismcore.min.js`），失败后使用可配置的
`PUBLIC_LIVE2D_CUBISM_CORE_FALLBACK_URL` 做本地开发兜底。生产部署建议从官方 Cubism SDK 获取
符合许可的 Core 文件，放入 `public/live2dcubismcore.min.js`，避免依赖外部网络。

## 下一阶段

在同一协议上增加 Blog Knowledge：`blog_search`、`blog_open`、`blog_related`。搜索结果必须返回稳定的 `document_id` 和 canonical route，由后端生成导航意图，模型不能自由拼接 URL。
