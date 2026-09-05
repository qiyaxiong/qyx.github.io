---
title: "qi-pi 2.0：从 Agent Kernel 到可恢复 Runtime Plane"
publishDate: "2026-09-05"
description: "基于 qi-pi 2.0 当前 Python 源码，沿 Submission、Worker、Session Actor、Turn、Tool Ledger 与 SQLite Event Log，拆解一个多 Channel Agent 服务如何可靠运行。"
category: ai
language: zh
tags:
  - agent
  - Python
  - Runtime Plane
  - Plugin Architecture
  - qi-pi
---

# qi-pi 2.0：从 Agent Kernel 到可恢复 Runtime Plane

> 本文固定到 qi-pi 2.0 提交 `5fc1efe672a87767a842a5a1e7afad91922e22cf`，不从设计愿景反推代码，而是沿一次真实请求的调用路径阅读实现。

qi-pi 最初要解决的问题很直接：同一套 Python Agent 后端既能接入 Web、Blog 和 Live2D，也能继续扩展 CLI、App、MCP、LSP 与外部 Subagent。

到了 2.0，仅有一个 Agent Loop 已经不够。请求可能在进程退出前只执行了一半；网页可能断线重连；审批可能跨越重启；同一 Session 还可能同时收到输入、Steer 与 Interrupt。

因此 2.0 的核心变化不是“插件更多了”，而是把系统明确拆成三层：Agent Kernel、单机 Runtime Plane 和 Host。

![qi-pi 2.0 Agent Kernel、Runtime Plane 与 Host 分层](/images/blog/pi-agent/qi-pi-v2-runtime-plane.svg)

## 一、为什么 1.x 的直接调用模型不够

一个最小 Agent 通常长这样：收到 Prompt，调用模型，执行工具，再把结果交给模型。只要进程始终在线、请求来源只有一个，这种结构完全可以工作。

问题出现在它成为长期服务以后。

- HTTP 返回时，Turn 可能还没结束；
- 浏览器断线后，需要从准确位置继续消费事件；
- 同一个 Session 不能同时启动两个 Turn；
- Interrupt 必须能越过正在等待的模型或审批；
- 修改型工具崩溃后，不能因为没看到结果就盲目重试；
- Host 不能绕过运行时，直接读取 Driver 私有状态。

这些问题都不属于“模型怎么回答”，而属于“命令怎样被可靠接纳、调度、恢复和观察”。这正是 Runtime Plane 存在的原因。

qi-pi 2.0 的定位可以压缩成一句话：

> 它是本地优先的 Agent Kernel 加单机 Runtime Plane；Context Graph 管进程内能力，Session Event Log 管持久事实。

## 二、先看源码地图：十个 Kernel/Runtime 包，外围全部插件化

根包 `qi-agent==2.0.0` 是纯元包，不保存一份新的业务实现。它负责把 Kernel、Runtime Plane、Host、本地基础设施和标准插件组合成默认发行版。

源码主要分为以下几组：

| 层 | 包 | 责任 |
| --- | --- | --- |
| 最小运行时 | `qi_runtime` | Context、Service、Event、PluginHandle、Activation、Effect |
| 模型协议 | `qi_llm` | Message、Model、Provider 与标准流事件 |
| 会话领域 | `qi_session` | Session Event、事务、Surface 与派生消息 |
| 工具领域 | `qi_tools` | Tool Registry、Policy、Approval、执行管线与恢复契约 |
| Agent 端口 | `qi_agent` | AgentDriver、RequestDraft、Input 与控制接口 |
| 默认执行器 | `qi_agent_loop` | Session Actor、Turn/Step 循环与恢复 reducer |
| 公共协议 | `qi_protocol` | Submission、Capability、JSON-RPC 与 Wire DTO |
| 运行平面 | `qi_runtime_plane` | Command、Query、Worker、Lease、Outbox 与 Stream |
| 启动装配 | `qi_boot` | Catalog、Profile、Bundle、兼容性指纹与组合根 |
| 传输宿主 | `qi_host` | FastAPI、鉴权、REST、SSE、WebSocket 与 UI 适配 |

依赖方向由契约测试约束：Kernel 不能导入 Runtime Plane 或 Host；Runtime Plane 不能依赖 FastAPI、Starlette、Uvicorn 或 WebSocket 框架；Host 也不能直接拿到 Session Store 或 Driver 私有状态。

对应测试见 [`test_package_boundaries.py`](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/tests/contract/test_package_boundaries.py)。

这个边界很重要。否则 REST 路由很快就会直接调用 Agent Loop，兼容协议再实现一套审批，Live2D 又维护一份自己的状态，最终每个 Channel 都拥有不同的执行语义。

## 三、系统有两种“真相”，但它们不竞争

qi-pi 2.0 同时存在 Context Graph 和 Session Event Log。它们不是两份重复状态，而是回答不同问题。

### 3.1 Context Graph：现在进程里有哪些能力

Context 保存当前可见的 Service、插件拓扑、事件监听器、Isolation 与 Effect 所有权。`ctx.provide()` 成功后，Service 才真实存在。

它是进程内事实。进程退出后，无需把整棵 Context 和 Python 对象原样序列化。

### 3.2 Session Event Log：这个 Session 已经发生了什么

Session Event Log 保存输入、消息、Turn、Step、请求快照、工具、审批、恢复与 Context Window 操作。

它是持久事实。模型上下文、UI 时间线、Session 快照、Submission 状态和管理统计都可以从它派生。

![qi-pi 2.0 Context Graph 与 Session Event Log 的事实边界](/images/blog/pi-agent/qi-pi-v2-two-truths.svg)

这意味着 SQLite 中可以有很多表，但只有 `session_events` 承担领域事实源。`submissions`、`event_outbox`、`session_snapshots` 和查询视图都是投影，不应创造另一套 Agent 语义。

## 四、一次请求的第一步不是运行模型，而是持久接纳

外部 Channel 不直接调用 `driver.run()`。REST、WebSocket 与兼容协议都会先构造同一种 `SubmissionOp`。

```json
{
  "operationId": "client-op-1",
  "sessionId": "session-1",
  "kind": "user-input",
  "payload": {
    "model": {
      "id": "qwen3.7-max-2026-06-08",
      "provider": "dashscope",
      "display_name": "Qwen3.7 Max"
    },
    "content": [{"type": "text", "text": "分析这篇文章"}]
  },
  "source": {"transport": "rest"}
}
```

[`LocalRuntimeCommandService.submit()`](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/packages/qi_runtime_plane/src/qi_runtime_plane/application.py#L115) 依次处理幂等 operation、队列上限、Session 存在性和附件准入。

然后它在同一 Session 事务中追加 `submission/accepted`。SQLite Adapter 会在同一数据库事务中写入：

```text
session_events
+ submissions projection
+ event_outbox
```

只有事务提交成功，接口才返回 `202 Accepted` 和 durable receipt。

![qi-pi 2.0 从 Submission 接纳到 Session Actor 的写路径](/images/blog/pi-agent/qi-pi-v2-submission-path.svg)

这里最容易误解的是：`202` 不等于“Agent 回答完成”，甚至不等于“Worker 已经开始执行”。它只证明命令已经持久接纳，重启后不会凭空消失。

`submission/completed` 也不等于 `turn/end`。普通用户输入被 Actor 接纳后，Worker 就可以完成这条命令；Turn 仍可能继续进行模型调用、工具调用和审批等待。

客户端判断回答是否结束，应该观察 `turn/end` 及其 reason，而不是把 HTTP Receipt 或 Submission 终态当作 Assistant 完成态。

## 五、Worker 为什么不能直接执行 Turn

Runtime Worker 从持久 Submission Queue claim 命令，并为目标 Session 获取 Lease。Lease 带 generation，后续 Session 写入使用它作为 fencing token。

如果旧 Worker 暂停过久、Lease 已被新 Worker 接管，旧 generation 的写入会被拒绝。这防止“已经失去所有权的旧执行者”在恢复后继续污染 Session。

Worker 只负责把命令分派给 Kernel 的 Session Actor。它不等待整个 Turn，因此 Active Turn 运行期间，后续 Interrupt、Steer 和 Approval 仍能被领取并送进同一个 Actor。

[`LocalRuntimeWorker`](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/packages/qi_runtime_plane/src/qi_runtime_plane/worker.py) 还维护 Lease 续期、Session 级分派锁和最大并发，但这些都没有进入 Agent Loop。

这条边界为未来替换 Queue、Lease 或多机 Scheduler 留出了位置：新增 Adapter 即可，Kernel 的 Turn、Tool 和 Session 语义不需要跟着重写。

## 六、Session Actor：同一会话串行，跨会话并行

每个活跃 Session 对应一个 `_SessionSubmissionActor`。Actor 内部只有一个命令接收循环、一条 Pending Turn FIFO，以及最多一个 Active Turn Task。

![qi-pi 2.0 Session Actor 如何排序输入、Steer、Interrupt 与 Approval](/images/blog/pi-agent/qi-pi-v2-session-actor.svg)

Actor 接收的不只是 Prompt：

- User Input：通常创建下一个 Turn；
- Steer：进入当前 Turn 的下一 Step；
- Interrupt：终止 Active Turn 并完成持久结算；
- Approval Resolve：唤醒等待中的 Tool；
- Recover：从持久边界重建未完成执行；
- Maintenance：在统一顺序中执行维护动作。

Actor 等待命令和 Active Turn 两类任务。当二者同时完成时，它优先处理已经进入队列的控制命令，让 Steering 与 Interrupt 的归属由 Submission 顺序决定。

同一 Session 因而不会并行执行两个 Turn；不同 Session 则由不同 Actor 并行。这比一个全局锁更精确，也比允许每个 HTTP 请求随意启动协程更容易恢复。

Actor 的内存队列不是事实源。空闲 Actor 会回收，Session 投影从内存卸载；下次访问时，运行时从 SQLite Event Log 冷恢复。

## 七、Turn 与 Step：一次用户目标可能调用模型很多次

Turn 是一次用户目标的完整执行边界，Step 是其中一轮模型请求。

正常路径大致如下：

```text
turn/start
→ input/entered + user/message
→ step/start
→ request/header + request/context
→ transient model delta*
→ assistant/message
→ [tool/call → tool/result]*
→ step/end
→ 有 Tool Call：进入下一 Step
→ 无 Tool Call：turn/end
```

模型上下文不是从 Driver 自己维护的 `messages` 数组读取，而是由 `session.derive_messages()` 从事件 Surface 重建。

每个 Step 先创建 `RequestDraft`，再经过 `agent/request` waterfall。System Prompt、Memory、Skill、附件和工具可见性都可以在这里组合，但最终请求必须写入 `request/header` 与 `request/context`。

Token delta 属于临时低延迟流，不保证断线重放。最终 `assistant/message` 才是持久事实；客户端丢失 delta 后，应从最后消息收敛 UI，而不是把碎片当作历史。

当前代码还有一个应明确记录的限制：`RequestDraft` 虽然暴露 `model` 字段，但插件替换它还不能完整切换 Provider。Driver 的模型选择和持久请求头仍使用 `_drive()` 原始 model 参数。

这不是宣传中的“可扩展性”，而是源码中真实存在的边界。插件作者目前不应依赖 Request Waterfall 动态换模型。

## 八、Tool 不只是函数调用，而是可恢复操作

[`ToolService.run_batch()`](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/packages/qi_tools/src/qi_tools/runtime.py#L718) 把模型返回的 Tool Call 分为准备、执行、后处理和提交几个阶段。

当前准确顺序是：

```text
冻结参数与生成 operation_id
→ destructive 默认提升为 require_approval
→ pre-execute waterfall
→ deny 检查
→ approval
→ monotonic guards
→ ledger prepared
→ ledger dispatched
→ execute wrappers / tool body
→ schema materialize
→ post-execute
→ result finalize + freeze
→ persistent tool/result
→ ledger committed + flush
```

Guard 位于审批之后，只能拒绝或弃权，不能把已经更严格的决定降级。Pre-execute 异常和 Guard 异常都会失败关闭，不会继续执行工具主体。

相邻的 Parallel Tool 可以让“执行主体”重叠，但准备、后处理和结果提交仍按照模型给出的顺序完成。Exclusive Tool 会在前后形成屏障。

![qi-pi 2.0 Tool 执行、Ledger 与崩溃恢复](/images/blog/pi-agent/qi-pi-v2-tool-ledger.svg)

### 8.1 为什么需要 Tool Operation Ledger

对只读工具，失败后再次调用通常问题不大。对“发送通知”“创建订单”“写入第三方系统”这类工具，进程在请求发出后崩溃，就会出现未知结果。

qi-pi 为此记录四个边界：

```text
prepared
→ dispatched
→ external-result-recorded（可选）
→ committed
```

恢复时，Driver 先检查是否已经保存外部 canonical value，再尝试 `reconcile()`。只有 READ_ONLY、IDEMPOTENT，或能够证明 `not_found` 等于“没有副作用”的工具，才允许使用原 idempotency key 重试。

无法证明结果的修改型工具进入 `attention_required`。系统宁愿要求人工确认，也不会假装“没有 tool/result 就等于没有执行”。

这正是 Tool Call 与可靠外部操作的分界。

## 九、SQLite WAL：事实、投影和 Outbox 在一个提交边界里

默认 Runtime Store 是 SQLite，启动时启用：

```text
journal_mode = WAL
synchronous = FULL
foreign_keys = ON
busy_timeout = configured value
```

每个 Session 的 `seq` 连续递增。写入时会检查 expected sequence；持有 Lease 时还会检查 fencing generation。

[`_insert_event()`](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/plugins/infrastructure/qi_runtime_sqlite/src/qi_runtime_sqlite/store.py#L531) 在同一事务里写入事件、Outbox，并更新可重建投影。

因此外部 Listener 只会看到已经提交的事件，不会先收到 SSE，随后才发现数据库事务失败。

### 9.1 Durable Stream 与 Transient Stream 必须分开

Session Event、Approval、Turn 和最终 Message 走 durable cursor，可在重连时从 `afterCursor` 继续读取。

模型 delta 和部分运行状态属于 transient stream。慢消费者可以丢失这些帧，必要时收到 `runtime/overflow` 后断开，再用持久事件恢复最终画面。

这种区分避免为了保存每个 Token 而放大数据库，同时又保证 UI 最终能收敛到正确状态。

## 十、Agent Protocol v3：多个 Channel 共用一种命令语义

HTTP 负责清晰的命令和查询边界，SSE 负责单向 Session 重放，WebSocket JSON-RPC 负责需要双向交互的长连接。

WebSocket 初始化后，客户端可以调用 `session.create`、`session.history`、`submission.submit` 和 `approval.resolve`。服务端也能反向发出 `approval/request` 与 `userInput/request`。

这两类 Server Request 都有持久 ID。客户端断线不会自动批准，也不会自动回答；重连后，运行时会再次暴露尚未解决的问题。

Capability Token 把权限拆成 `session:read`、`session:write` 与 `approval:resolve`，并可限制到指定 Session。同一 Token 同时适用于 REST、SSE 和 WebSocket。

所以 Blog、App、Live2D 与管理后台不需要各自发明 Agent API。它们只是在不同 Transport 上产生同一种 Submission，并消费同一条 Session Event Stream。

## 十一、“一切皆插件”在 2.0 中仍然成立，但 Kernel 更清楚了

2.0 没有放弃 Context-first 插件模型。真正不可插件化的仍然只有最小运行时原语：

- Context Graph 与 Service Reflect；
- 类型化 Event Dispatch；
- PluginHandle 与 Activation；
- Effect Ownership；
- 启动时创建 Root Context 所需的 Bootstrap 边界。

Session、LLM、Tool、Agent Loop、Runtime Store、Sandbox、Provider、Memory、Blog、Live2D、Voice 和 Host Route 都通过插件贡献。

![qi-pi 2.0 插件 Distribution、Profile 与 Context 生命周期](/images/blog/pi-agent/qi-pi-v2-plugin-composition.svg)

`inject` 只决定插件何时激活；Service Truth 仍由 `ctx.provide()` 决定。Provider identity 变化时，依赖它的 Consumer 会重新激活。

插件注册的 Service、Listener、Tool、Route、Task 和外部连接都归属于当前 Activation。卸载时按照严格串行 LIFO 回收，一个 disposer 失败也不会阻止其他资源清理。

Loader 负责配置树、Tree diff、Preflight、受影响子树替换、Quiescence 和回滚，但它不维护第二套 Service Registry，也不会根据 Manifest 猜测运行时 Service 是否存在。

### 11.1 安装能力不等于启用能力

标准插件拆成五个 Distribution：

| Distribution | 能力范围 |
| --- | --- |
| `qi-agent-standard` | Attachment、Title、System Prompt、Context Window、Notes、History |
| `qi-agent-workflow` | Plan、Goal、Todo、Schedule、Skill |
| `qi-agent-coding` | Filesystem、Shell、Terminal、Jobs、MCP、LSP、Web Search |
| `qi-agent-collaboration` | Channel、Subagent、ACP、Claude、Codex 与 Peer Adapter |
| `qi-agent-persona` | Soul、Emotion 与 Local Refiner |

安装 Distribution 只让 Catalog 能发现它。真正启用哪些 PluginSpec，由 Profile、Bundle 和 `cordis.yml` 中的 Context Tree 决定。

Memory、媒体与 Blog 则通过 extras 安装：

```bash
pip install 'qi-agent[memory]'
pip install 'qi-agent[media]'
pip install 'qi-agent[blog]'
pip install 'qi-agent[full]'
```

## 十二、Host 是适配器，不是隐藏的第二个 Agent

`qi_host` 负责鉴权、Origin、CSRF、请求体限制、DTO 映射和响应编码。它只能调用 Runtime Command/Query/Stream Service。

例如 REST Submission Route 只做 Session 范围检查，把 body 交给 `commands.submit()`，并返回 Receipt。它不能直接修改 Driver 的 Pending Turn，也不能绕过 Event Log 写 UI 状态。

这让多 Channel 真正共享后端语义：增加一个新的入口，主要工作是 Wire Adapter，而不是复制 Agent Loop。

CLI 也位于 Bootstrap 边界。它负责选择配置、创建 Root Context 和启动 Host，不应被描述成普通能力插件。

## 十三、安全边界：Approval、Context 与 Sandbox 不能混为一谈

Approval 回答“这次操作是否得到允许”；Context Isolation 回答“插件能看到哪些 Service”；Sandbox 回答“进程实际上能访问哪些系统资源”。

三者互补，但不能互相替代。

默认 `base-runtime` 启用的是 `PassThroughSandbox`。它不会创建隔离进程，也不会增加操作系统级文件或网络限制。

可选 Process Sandbox 只包装显式声明进程能力的工具，控制环境、工作目录与基础资源。它不是容器，也不等同于内核级隔离。

因此，“工具经过审批”不能写成“工具已经被沙箱隔离”；“插件运行在子 Context”也不意味着它可以安全执行不可信代码。

## 十四、崩溃恢复不是恢复 Python 协程，而是从事实边界重新决策

进程启动后，Runtime Plane 会先启动 Worker，领取 pending 或 Lease 过期的 Submission，再扫描 Active Turn 和尚未形成 `turn/start` 的 next-turn 输入。

需要恢复的 Session 会获得一条幂等 Recover Submission。它仍经过持久 Queue 和同一个 Actor，不存在一条隐藏的恢复旁路。

恢复 reducer 根据 Event Log 判断：

- 模型流中断：从新 Step 重新请求；
- 审批未完成：回到 `approval_waiting`；
- 外部结果已持久化：直接渲染并提交；
- 可对账工具：调用 reconcile；
- 只读或幂等工具：使用原 idempotency key 重试；
- 修改型工具结果未知：进入 `attention_required`。

系统恢复的是领域状态机，不是序列化一条正在运行的协程栈。这让恢复逻辑可以测试、审计，也可以在升级时做兼容性判断。

## 十五、1.x 到 2.0 不是原地兼容升级

1.x 使用 JSONL/Zstd Session 文件；2.0 默认使用 `<data-dir>/runtime.sqlite3`。新 Host 不保留旧 JSONL 在线读取器。

迁移必须在 Host 停止时离线执行：

```bash
qi-agent migrate runtime-v2 --data-dir /path/to/data
```

迁移成功后才切换新数据库，旧目录保留为只读备份。发现旧数据但没有新数据库时，Host 会拒绝启动并提示迁移，而不是静默丢失或混合读取。

这是一条刻意的兼容性边界：恢复语义变化时，显式迁移比“尽量读出来”更可靠。

## 十六、当前实现的边界与下一步

qi-pi 2.0 已经具备完整的单机 Runtime Plane，但没有假装自己已经是 Cloud Control Plane。

仓库当前不实现 Tenant、Billing、跨机 Scheduler、PostgreSQL、Redis、NATS 或云端 Plugin Registry。本地 SQLite、Lease 与 Stream 都是接口实现，未来可以增加远程 Adapter。

当前还有几项值得继续拆深：

1. `driver.py` 同时包含 Actor、Turn 执行与恢复，公开替换边界仍是整个 AgentDriver；
2. `qi_tools/runtime.py` 同时承担 Registry、Policy、执行管线和 Ledger；
3. RequestDraft 的动态 model 替换尚未贯穿 Provider 选择；
4. Process Sandbox 是基础实现，不应被当成强隔离环境；
5. Cloud 调度必须保持 Kernel Protocol，不应把租户和计费语义写回 Agent Loop。

把这些限制写进文章，比把所有组件都描述成“已经完成”更重要。架构分析的价值不是堆名词，而是说明真实边界在哪里。

## 十七、最后总结：2.0 真正新增的是可靠执行平面

qi-pi 2.0 仍然坚持“一切能力皆插件”，但它已经不只是插件化 Agent Loop。

它形成了四条清晰主线：

1. Context Graph 管理当前进程中的能力与生命周期；
2. Runtime Plane 持久接纳命令，并用 Worker、Lease 和 Actor 排序执行；
3. Session Event Log 保存唯一持久事实，Outbox 与投影跟随同一提交边界；
4. Host 用 REST、SSE 与双向 JSON-RPC 把同一语义暴露给多个 Channel。

所以更准确的项目定义是：

> qi-pi 是一个面向 Python 与多 Channel 产品集成的 Agent Service Kernel。它把插件生命周期、命令接纳、会话执行、工具副作用和断线恢复放在同一套可验证边界中。

当 Blog、Live2D、Voice、Memory 或新的 App 接入时，它们不需要拥有另一套 Agent。它们只需要贡献能力、提交命令，并消费已经发生的事实。

## 源码与文档索引

- [qi-pi 2.0 README](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/README.md)
- [Runtime Plane 架构](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/docs/architecture/runtime-plane.md)
- [Agent Protocol v3](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/docs/protocols/agent-protocol-v3.md)
- [Session Store Schema 3](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/docs/protocols/session-format.md)
- [Context-first Plugin Runtime](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/docs/protocols/plugin-runtime.md)
- [ReactAgentDriver](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/packages/qi_agent_loop/src/qi_agent_loop/driver.py)
- [ToolService](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/packages/qi_tools/src/qi_tools/runtime.py)
- [SQLite Runtime Store](https://github.com/qiyaxiong/pi-agent-py/blob/5fc1efe672a87767a842a5a1e7afad91922e22cf/plugins/infrastructure/qi_runtime_sqlite/src/qi_runtime_sqlite/store.py)
