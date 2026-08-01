# Blog Live2D Agent

Live2D 的正式 UI 是全站 `BaseLayout` 中的浮动组件，不是独立页面。模型、Session、LLM 和统计仍
由独立的 `/Users/qiluo/program/pi-agent-py` 服务负责；Blog 只包含 Pixi Renderer、输入框和 SSE
客户端。

## 本地启动

先在 Agent 仓库启动后端：

```bash
export DASHSCOPE_API_KEY='replace-with-your-key'
export PI_AGENT_DEFAULT_PROVIDER='dashscope'
export PI_AGENT_DEFAULT_MODEL='qwen-plus'
export PI_AGENT_LIVE2D_MODEL_PATH='<model-root>/huimeng/huimeng.agent.model3.json'
uv run pi-agent serve
```

从官方 Cubism SDK for Web 取得 `live2dcubismcore.min.js`，放到 Blog 的 `public/`。该文件受许可
约束且已加入 `.gitignore`。然后启动 Blog：

```bash
pnpm install
pnpm dev
```

Astro 开发服务器把 `/agent-api` 代理到 `http://127.0.0.1:8765`。可用仅服务端的
`PI_AGENT_DEV_SERVER_URL` 改写开发地址；生产 SSR 路由读取 `PI_AGENT_SERVER_URL`。

本地临时验收也可以显式使用官方开发地址：

```bash
PUBLIC_LIVE2D_CUBISM_CORE_URL=\
'https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js' pnpm dev
```

## 浏览器配置

```dotenv
PUBLIC_LIVE2D_ENABLED="true"
PUBLIC_PI_AGENT_API_BASE="/agent-api"
PUBLIC_PI_AGENT_PROVIDER="dashscope"
PUBLIC_PI_AGENT_MODEL="qwen-plus"
PUBLIC_LIVE2D_CUBISM_CORE_URL="/live2dcubismcore.min.js"
PI_AGENT_SERVER_URL="http://127.0.0.1:8765"
PI_AGENT_ADMIN_TOKEN=""
PI_AGENT_BFF_SECRET="replace-with-at-least-32-random-characters"
PI_AGENT_GUEST_PROVIDER="dashscope"
PI_AGENT_GUEST_MODEL="qwen-plus"
```

所有 `PUBLIC_` 值都会进入浏览器 Bundle，绝不能放 Provider Key 或管理 Token。组件使用
`localStorage` 保存非敏感的随机 Session ID，并用 Web Lock 避免多标签页并发创建后覆盖 Guest
Cookie；签名所有权只存在 HttpOnly Cookie。刷新时先恢复 Snapshot，再从其 Sequence 续接 SSE。

## 生产反向代理

Blog 自带 `src/pages/agent-api/[...path].ts` 生产 Guest BFF。它用签名 HttpOnly Cookie 绑定访客
Session，只返回当前访客的 Session ID，固定 Provider/Model，移除客户端对 Extension 的控制，
并限制 Prompt 为 2000 字符、请求体为 16 KiB、每分钟/每天 Run 数量。BFF 只转发下列方法；可从
服务端 `PI_AGENT_ADMIN_TOKEN` 注入管理 Bearer Token，但绝不把 Token 或任意管理面能力交给访客：

- `GET /api/v1/live2d/model`
- `GET /api/v1/live2d/assets/*`
- `POST /api/v1/sessions`
- `GET /api/v1/sessions/{id}`
- `POST /api/v1/runs`
- `POST /api/v1/speech/synthesize`
- `GET /api/v1/live2d/sessions/{id}/snapshot`
- `GET /api/v1/live2d/sessions/{id}/events`

语音接口返回 `audio/pcm` 分块流，并通过响应头声明 24 kHz、单声道、signed 16-bit
little-endian（s16le）格式。浏览器先积累 180 ms 启动水位，随后按 120 ms 音频批次通过
Web Audio 连续播放；原始 PCM 振幅同时驱动 Live2D 嘴型。

`PI_AGENT_BFF_SECRET` 必须是至少 32 字符的独立随机 Secret。内置速率计数是单实例的最后一道
保护；多实例生产部署还应在 CDN/网关配置共享速率限制和成本预算。Agent 服务应位于私网或只接受
BFF 的管理 Token，不要把 `PI_AGENT_ADMIN_TOKEN` 交给前端。

## 正式组件烟测

先启动 Python 后端与 Blog，再运行：

```bash
pnpm smoke:live2d
```

该脚本用 Chromium 操作 `BaseLayout` 中的正式组件，断言模型 Canvas、Agent 回复、Expression、
Motion 和刷新后的 Session/Snapshot 恢复。可用 `LIVE2D_BLOG_URL` 改写目标地址；CI 若不把 Core
放进 `public/`，可用 `LIVE2D_CORE_SOURCE_URL` 临时提供已获许可的 Core 地址且不落盘。
要在开发环境专门验收生产 Guest BFF，可用 `PI_AGENT_DEV_PROXY_DISABLED=true` 启动 Blog，使请求
进入 Astro SSR Route，而不是 Vite 直连代理；烟测时增加 `LIVE2D_EXPECT_BFF=true` 还会验证跨
Session 访问被拒绝、超长 Prompt 被拦截和并发标签页共用 Session。只验证 BFF 安全边界而不调用
真实 Provider 时，可同时设置 `LIVE2D_SKIP_AGENT=true`。

## 代码边界

- `src/components/live2d/Live2DAgent.astro`：浮动 UI、Pixi/Cubism 生命周期和状态映射。
- `src/components/live2d/client.ts`：Agent REST/SSE 协议、Session 恢复和 URL 代理。
- `src/pages/agent-api/[...path].ts`：生产 Guest BFF、Session 所有权、固定模型、配额与公开路由
  allowlist。
- `src/layouts/BaseLayout.astro`：全站挂载点。
- Python Agent、模型文件、SQLite、Provider Key 均不进入 Blog 仓库。
