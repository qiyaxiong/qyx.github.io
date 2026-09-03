---
title: "拆解 Codex CLI：从一条命令到可恢复的 Agent Runtime"
publishDate: "2026-09-03"
description: "基于 Codex CLI 0.152.1 官方源码，沿启动、Turn、模型流、工具、安全、持久化与 App Server 协议，拆解一个本地 Coding Agent 如何真正运行。"
category: "ai"
language: "zh"
tags:
  - Codex
  - Agent
  - CLI
  - Rust
  - App Server
  - Agent Harness
---

# 拆解 Codex CLI：从一条命令到可恢复的 Agent Runtime

很多人第一次使用 Codex CLI，会把它理解成“在终端里和模型聊天”。这个描述没有错，但只描述了最外面的一层。

真正值得分析的不是输入框，而是输入之后发生了什么：谁加载配置，谁维护会话，谁反复请求模型，谁执行工具，谁处理审批，进程退出后又是谁恢复现场。

本文不从宣传术语出发，而是固定一个源码版本，沿真实调用路径阅读。

分析基线是本机安装的 `codex-cli 0.152.1`，对应官方仓库标签 `rust-v0.152.1`，提交 `5adb68a49933ae446bf11935662c83dba55a0804`。

官方把 Codex CLI 定义为可在本地仓库中检查文件、修改代码并调用本机工具的 Coding Agent；它既可交互使用，也可通过 `codex exec` 进入脚本与 CI。[Codex CLI 官方文档](https://developers.openai.com/codex/cli)

但从源码看，更准确的定义是：

> Codex CLI 是一个多入口的本地 Agent Harness。终端 UI 只是 Host，`codex-core` 才是执行语义所在。

![Codex CLI 多入口与共享 Agent Runtime](/images/blog/codex-cli/codex-cli-layer-map.svg)

## 一、先建立源码地图：不要从 TUI 反推整个系统

Codex 的 Rust 工程不是一个巨大的 `main.rs`，而是由大量职责明确的 crate 组成。

如果只看与一次任务最相关的部分，可以先缩成下面几层：

| 层 | 主要 crate | 责任 |
| --- | --- | --- |
| 命令入口 | `codex-cli` | 解析命令、选择运行模式、传递配置 |
| 交互宿主 | `codex-tui` | 终端渲染、输入、增量事件展示 |
| 自动化宿主 | `codex-exec` | 非交互执行、JSONL 输出、退出码 |
| 宿主协议 | `codex-app-server` | 把 Thread、Turn、Item 暴露为双向 RPC |
| Agent 核心 | `codex-core` | 上下文、模型采样、工具调度、取消、压缩 |
| 公共语义 | `codex-protocol` | `Op`、`EventMsg`、模型与工具数据结构 |
| 会话事实 | `codex-rollout`、`codex-thread-store` | 追加历史、恢复、分叉与会话查询 |
| 查询投影 | `codex-state` | 从 rollout 提取元数据并镜像到 SQLite |
| 安全执行 | `codex-sandboxing` 等 | 权限策略与平台沙箱 |

这里最重要的依赖方向是：TUI、Exec 与 App Server 都消费 Core，而不是各自实现一套 Agent Loop。

源码入口可以从 [`codex-rs/cli/src/main.rs`](https://github.com/openai/codex/blob/5adb68a49933ae446bf11935662c83dba55a0804/codex-rs/cli/src/main.rs#L132) 开始。`Subcommand` 枚举把一个二进制变成了多工具入口。

没有子命令时进入交互 TUI；`exec` 进入无头执行；`review` 复用 Exec；`app-server` 暴露宿主协议；`mcp-server` 则把 Codex 反向暴露为 MCP Server。

因此，“Codex CLI 的架构”不能等同于“Codex TUI 的架构”。前者是运行系统，后者只是其中一个客户端。

## 二、一条 `codex` 命令是怎么启动的

启动过程可以拆成四段：解析入口、合并配置、建立运行时、启动或恢复 Thread。

### 2.1 CLI 是分发器，不是 Agent

`MultitoolCli::parse()` 先把根级参数与子命令参数拆开，再把 `--enable`、`--disable` 和 `-c key=value` 合并为配置覆盖。

随后 `match subcommand` 决定 Host：交互模式调用 TUI，`exec` 调用 `codex_exec::run_main`，App Server 则启动协议服务。

这里没有模型循环，也没有工具执行。CLI 的职责是“选择系统怎样被使用”，而不是“决定 Agent 下一步做什么”。

### 2.2 配置不是读一个 TOML，而是合并一组来源

Codex 的配置 Loader 会生成 `ConfigLayerStack`。它不仅给出最终配置，还保留每个键来自哪一层，以及每层的稳定指纹。

按源码说明，配置来源包括系统配置、企业托管配置、用户配置、Profile、项目 `.codex/config.toml`、命令行 Session Flags，以及更高优先级的托管限制。

这解决了一个真实问题：当 `sandbox_mode` 或 `model` 不符合预期时，系统不能只告诉你最终值，还要能解释“是谁覆盖了它”。

项目是否可信也参与配置加载。未受信任项目不会自动启用项目本地 `.codex/` 下的配置、Hook 与规则，从源头避免“打开仓库即执行仓库指令”。

官方配置表把 `approval_policy` 与 `sandbox_mode` 分开：前者决定何时暂停等待批准，后者决定命令真正能访问哪些文件和网络。[配置参考](https://developers.openai.com/codex/config-reference)

### 2.3 `codex exec` 也没有绕过 App Server 语义

一个很有意思的源码事实是：0.152.1 的 `codex exec` 会启动 `InProcessAppServerClient`。

也就是说，非交互模式不是直接调用一个简化版 Core API。它仍通过 `thread/start`、`thread/resume`、`thread/fork` 与 `turn/start` 这些 App Server 请求工作，只是客户端和服务端同进程运行。

这一步可以在 [`codex-rs/exec/src/lib.rs`](https://github.com/openai/codex/blob/5adb68a49933ae446bf11935662c83dba55a0804/codex-rs/exec/src/lib.rs#L795) 中看到。

这种设计避免了两套生命周期：TUI 一套、自动化再造一套。两者的展示不同，但 Thread、Turn、审批与事件语义可以保持一致。

## 三、真正的运行对象：Thread、Turn、Item 与内部 Step

### 3.1 Thread 是可延续的会话容器

Thread 持有一段可恢复历史、当前配置快照、工作目录、模型、权限、父子关系与运行状态。

`CodexThread` 对外提供的核心动作很少：提交 `Op`、接收 Event、关闭、读取配置与恢复相关状态。它更像一条双向会话通道，而不是一条消息记录。

源码甚至直接把它描述为：组成一个 Thread 的双向消息流通道。[`CodexThread`](https://github.com/openai/codex/blob/5adb68a49933ae446bf11935662c83dba55a0804/codex-rs/core/src/codex_thread.rs#L206)

### 3.2 Turn 是一次用户目标的执行边界

用户说“修复这个测试”，会启动一个 Turn。这个 Turn 可能包含多次模型请求、多个工具调用、审批等待、上下文压缩和中途 Steering。

所以 Turn 不是“一次 LLM API 调用”。它更接近“从用户输入开始，到 Agent 停止继续行动为止的一次任务执行”。

### 3.3 Item 是 UI 可观察的工作单元

Item 可以是用户消息、Assistant 消息、Reasoning、命令执行、文件修改、MCP Tool Call、Web Search、压缩或 Review 生命周期。

流式 Item 通常先出现 `item/started`，中间出现若干 delta，最后以 `item/completed` 给出权威完成态。

官方 App Server 文档明确要求客户端把 `item/completed` 作为最终状态，而不是把若干增量文本自己猜成结果。[App Server Item 生命周期](https://developers.openai.com/codex/app-server)

### 3.4 Step 是 Core 内部的一次“模型看到的世界”

公开协议强调 `Thread → Turn → Item`，但源码的 `run_turn` 内部还有 `StepContext`。

每次采样前，Core 会固定本 Step 的模型、工具路由、MCP 状态、环境与权限。工具即使稍后异步执行，也继续持有当时的 `StepContext`。

这避免了一个隐蔽竞态：模型在 Step A 看到了某个工具，执行前配置发生刷新，如果调用转而使用 Step B 的 Registry，就会出现“模型调用了已不存在或语义已变化的工具”。

因此 Step 不是面向用户的第三层会话，而是采样一致性边界。

![Codex Turn 内部的 Sampling Step 循环](/images/blog/codex-cli/codex-turn-sampling-loop.svg)

## 四、一次 Turn 如何真正跑起来

核心入口是 [`run_turn`](https://github.com/openai/codex/blob/5adb68a49933ae446bf11935662c83dba55a0804/codex-rs/core/src/session/turn.rs#L156)。它的注释已经把主循环说得很清楚：模型要么返回函数调用，要么返回 Assistant Message。

可以把主干改写成下面这段 Python 风格伪代码：

```python
async def run_turn(session, turn, user_input):
    record_input(user_input)
    client = session.model_client.new_session()

    while True:
        step = await session.capture_step_context(turn)
        prompt = session.history.for_prompt(step.model)
        output = await stream_model(prompt, step.tools)

        tool_calls = collect_tool_calls(output)
        if tool_calls:
            results = await execute_tools(tool_calls, step)
            session.history.extend(results)
            continue

        if session.has_pending_input():
            continue

        break
```

真实实现更复杂，但复杂度主要来自边界，而不是 `while` 本身。

### 4.1 采样前先处理上下文，而不是盲目发请求

Core 会先处理上一次异步 Hook 的结果、判断是否需要预压缩、解析显式 Skill 与 Plugin Mention、等待必要的 MCP Server，并记录本轮世界状态。

随后 `history.for_prompt()` 才生成真正发送给模型的 `ResponseItem` 列表。

源码对模型上下文还有明确约束：历史增量构建，避免频繁重写；注入内容必须有界；单个注入项不能无限增长。

这些约束并不华丽，却直接决定缓存命中、恢复一致性与长会话稳定性。

### 4.2 模型流不是只拼接文本

模型流会产生 `Created`、`OutputItemAdded`、各种 Delta、`OutputItemDone`、Token Usage 与 Completed 等事件。

Core 一边把增量映射成 UI Event，一边维护 active Item、参数增量消费者、最后一条 Agent Message、是否需要 follow-up，以及仍在执行的工具 Future。

所以流式处理器同时服务三个对象：模型上下文、用户界面和工具调度。任何一个处理不一致，都可能让 UI 看见的内容与下一次模型请求中的内容不同。

### 4.3 为什么工具执行后还要再次请求模型

模型返回 Tool Call 时，Core 先记录 Call，再异步执行工具，并把结果转换成 `FunctionCallOutput` 或相应输出 Item。

工具结果进入历史后，`needs_follow_up` 为真，循环再次采样。下一次模型请求才能基于真实结果决定继续调用工具，还是向用户给出最终答案。

这就是 Agent Loop 最小而关键的反馈闭环：

```text
model intent → real-world action → observed result → model decision
```

### 4.4 Steering 不是另起一个 Turn

用户可在 Turn 运行时追加输入。App Server 的 `turn/steer` 要求携带当前 `expectedTurnId`，并明确不会发出新的 `turn/started`。

Core 在采样之间检查 pending input，把它写入历史，再捕获新的 StepContext。这样可以修正正在运行的任务，而不把一个目标错误拆成两个并发 Turn。

官方协议对 start、steer 与 event stream 的边界有完整说明。[App Server Turn API](https://developers.openai.com/codex/app-server)

## 五、Tool Call：路由、Hook、审批与沙箱不是一回事

“模型调用 Shell”听起来像一个动作，源码里却至少分成五类责任：调用解析、工具选择、生命周期 Hook、安全决策、实际执行。

![Codex Tool Call、Hook、审批与沙箱流水线](/images/blog/codex-cli/codex-tool-safety-pipeline.svg)

### 5.1 ToolRouter 负责把模型输出变成可执行调用

`ToolRouter::build_tool_call` 能识别普通 Function Call、Custom Tool Call，以及客户端执行的 Tool Search Call。

它把不同 Response Item 统一成内部 `ToolCall`：工具名、`call_id`、Payload、来源与可选加密参数。

随后 Registry 检查工具是否存在、Payload 类型是否匹配，再进入实际 Handler。

### 5.2 通用 Registry 管生命周期，不包办每种安全策略

在 [`dispatch_any_with_terminal_outcome`](https://github.com/openai/codex/blob/5adb68a49933ae446bf11935662c83dba55a0804/codex-rs/core/src/tools/registry.rs#L493) 中，通用顺序大致是：

```text
resolve tool
→ validate payload kind
→ pre-tool hook（允许阻止或改写输入）
→ tool-start lifecycle
→ handler
→ post-tool hook（允许反馈或阻止结果进入模型）
→ tool-finish lifecycle
→ accept result
```

这里要特别注意：Post Hook 即使阻止结果，也不能撤销一个已经发生的外部副作用。源码明确把它解释为“拒绝结果，而不是撤销已完成执行”。

因此有副作用的 Gate 必须发生在 Handler 执行前，不能寄希望于 Post Hook 补救。

### 5.3 审批与沙箱是两个正交维度

审批回答“这次动作是否允许继续”；沙箱回答“即使继续，进程实际上能访问什么”。

用户批准一条命令，不代表它自动获得整台机器的读写权限。反过来，命令处于 Workspace Sandbox，也不代表每个高风险动作都可以无提示执行。

对 `exec_command`，Handler 会解析工作目录、环境与额外权限，计算 ExecPolicy，必要时发出 Approval Request，再让 `SandboxManager` 选择平台实现。

macOS 对应 Seatbelt，Linux 可使用 Landlock/Bubblewrap 相关能力，Windows 有受限执行实现。远程 Environment 则可能由远端执行器落实 URI 级权限。

### 5.4 并发不是简单 `gather`

每个工具声明是否支持并行。`ToolCallRuntime` 用读写锁协调：支持并行的调用持有读锁，不支持并行的调用持有写锁。

这让多个只读或独立工具可以并发，同时给必须串行的工具一个明确屏障。

更重要的是，工具 Future 持有产生它的 StepContext。即使调用排队，它仍按模型当时看到的工具与环境执行。

### 5.5 取消要区分“没完成”和“已经完成”

工具运行受 `CancellationToken` 控制。如果取消发生时还没有终局结果，任务会被中止，并生成明确的 aborted output。

如果工具已经到达 terminal outcome，系统不会仅因取消信号晚到，就把真实完成结果改写成“未执行”。

这条边界对于写文件、发请求和启动进程尤其重要。取消是控制流，不是时光倒流。

## 六、双向协议：为什么 App Server 使用 JSON-RPC

TUI 面向人，App Server 面向宿主。IDE、桌面应用或其他客户端不仅要提交 Prompt，还要接收增量事件、回答审批、补充输入和控制进程。

单向 HTTP 请求不足以自然表达这些交互，因此 App Server 使用双向 JSON-RPC 2.0 语义；默认 stdio 传输是一行一个 JSON，WebSocket 传输目前仍标为实验能力。[App Server Protocol](https://developers.openai.com/codex/app-server)

连接建立后，客户端必须先 `initialize`，再发送 `initialized`。随后才能 start/resume/fork Thread，并启动 Turn。

协议里同时存在三类消息：

| 类型 | 例子 | 用途 |
| --- | --- | --- |
| Request / Response | `thread/start`、`turn/start` | 客户端请求一个动作，并等待明确结果 |
| Notification | `item/started`、delta、`item/completed` | 服务端持续推送状态变化 |
| Server Request | command approval、user input、dynamic tool | 服务端暂停某段工作，要求客户端作答 |

第三类非常关键。审批不是普通 Event，因为服务端需要一个与 `requestId` 关联的决定，才能继续或终止当前 Item。

### 6.1 为什么不是把 Core 直接暴露给每个客户端

Core 内部使用 `Op` 与 `EventMsg`。`Op` 包括 Turn Input、Interrupt、审批响应、MCP Elicitation、Compact、Review 与 Shutdown 等命令。

`EventMsg` 则覆盖 Turn、Message、Reasoning、工具、审批、流错误、Token 和环境状态。

App Server 的价值不是把枚举换成 JSON，而是稳定宿主边界：握手、能力协商、对象 ID、订阅、服务端请求和兼容性都在这里完成。

### 6.2 JSON-RPC 不是 Agent Loop

把协议替换为别的传输，并不会自动得到上下文管理、工具循环、恢复与安全。

JSON-RPC 解决的是跨进程控制与双向交互。Agent Loop 解决的是模型如何观察行动结果并继续推理。两者连接紧密，但属于不同层。

## 七、持久化：Rollout 是历史，SQLite 是投影

![Codex Thread、Turn、Item 与恢复关系](/images/blog/codex-cli/codex-thread-turn-item-recovery.svg)

### 7.1 Rollout JSONL 保存可重放事实

`RolloutRecorder` 的职责是把会话 Item 追加到 JSONL。它通过后台 Writer 接受 `AddItems`、`Persist`、`Flush` 与 `Shutdown` 命令。

源码入口位于 [`codex-rs/rollout/src/recorder.rs`](https://github.com/openai/codex/blob/5adb68a49933ae446bf11935662c83dba55a0804/codex-rs/rollout/src/recorder.rs#L86)。文件可以直接用 `jq` 检查，这对故障诊断很有价值。

Thread Resume 会读取已存历史，重建 Session，再在其后开始新的 Turn。Fork 则从已有历史派生新 Thread，同时保留父子来源。

### 7.2 SQLite 不应被误解为唯一会话事实源

`codex-state` 的模块注释很直接：它从 JSONL rollout 提取元数据，并镜像到本地 SQLite。

SQLite 适合做 Thread 列表、搜索、分页、状态与其他查询投影；Rollout 更接近会话重放和审计所需的追加历史。

源码还包含 Backfill 与 Fallback 逻辑，说明设计目标不是“数据库坏了所有会话一起消失”，而是允许从 rollout 重新构建一部分查询状态。

### 7.3 压缩不是删除历史文件

当模型上下文接近限制且 Turn 仍需继续时，Core 会运行 inline compaction，再继续下一次采样。

压缩改变的是“下一次模型看见什么”，不是简单删除完整 rollout。App Server 也把手动压缩显示为正常的 Item 生命周期。

这正是运行历史与模型上下文必须分开的原因：模型不可能永远看到全部记录，但系统仍需要恢复、审计和解释执行过程。

## 八、交互 CLI、`codex exec` 与 App Server 的真实差别

### 8.1 交互 CLI：为人优化

TUI 负责输入编辑、流式渲染、审批对话、Diff 展示、Session Picker 与恢复体验。

它消费 Event，却不应该成为执行真相来源。终端崩溃后，恢复依赖 Thread 历史，而不是依赖上一次屏幕画了什么。

### 8.2 `codex exec`：为自动化优化

Exec 关心标准输出、JSONL、最终消息文件、结构化输出、退出码和 CI 可组合性。

它默认不能像交互界面那样随时等人回答，所以无头模式的审批策略必须更谨慎。源码中 Exec 会先建立完整配置，再通过进程内 App Server 启动或恢复 Thread。

官方命令参考支持 `codex exec resume [SESSION_ID]`，也支持 `--last` 继续当前目录最近的会话。[CLI 命令参考](https://developers.openai.com/codex/cli/reference)

### 8.3 App Server：为其他产品做 Harness 边界

App Server 让客户端操纵 Thread、Turn、Item、审批、账户、模型、配置与进程。

它适合 IDE、桌面应用和长期宿主，但并不是面向公网多租户产品的完整业务 Gateway。鉴权、租户、持久 Event Replay 与公共 API 稳定性仍需更外层系统承担。

## 九、Codex CLI 可靠性的真正来源

Codex 的可靠性不来自某个神奇 Prompt，而来自许多小边界同时成立。

### 9.1 采样状态有快照

StepContext 把模型、工具、权限和环境固定在一次采样视图中，避免动态系统在 Call 与执行之间漂移。

### 9.2 工具结果总会回到模型可理解的协议

普通失败会转换为模型可见的 Tool Output，让模型有机会修正；真正破坏不变量的错误才升级为 Fatal。

### 9.3 取消有协作边界

模型流、工具 Future 与 Turn 都使用取消令牌，但已经发生的副作用不会被虚构为未发生。

### 9.4 配置有来源与信任边界

系统不仅算 Effective Config，还保存 Origin；项目配置与 Hook 受 Trust 限制；托管策略可以压制较低层覆盖。

### 9.5 UI 只消费生命周期，不拥有生命周期

`item/completed` 是权威完成态；Thread Resume 来自持久历史；TUI 与 Exec 只是不同 Host。

这些设计合在一起，才让 Agent 能从“会调用工具的 Demo”变成“可以在真实仓库工作并解释自己做过什么的系统”。

## 十、它仍有哪些代价与限制

第一，crate 数量很多，Core 仍然很大。官方仓库自己的 `AGENTS.md` 甚至明确提醒维护者不要继续把新概念塞进 `codex-core`。

第二，内部同时存在 Core Event、Rollout Item、App Server Item 与兼容旧客户端的 Legacy Event 映射。语义更稳定，但理解与维护成本也更高。

第三，安全不是“一次审批解决全部”。Shell、Patch、MCP、动态工具、网络与额外权限有不同路径，客户端必须正确展示请求类型。

第四，App Server 的 WebSocket 仍是实验能力。它适合可信本地宿主，不应未经额外网关与鉴权设计就直接暴露到公网。

第五，快速演进意味着文章必须绑定版本。0.152.1 的内部组织不能被当作所有未来版本永久不变的契约。

## 十一、对 qi-pi 最值得吸收的五点

Codex CLI 不适合被 qi-pi 整体复制。Codex 更偏本地 Harness；qi-pi 的目标是 Python、多 Channel 与长期 Agent Service。

但下面五点很值得吸收。

### 11.1 让所有 Host 复用同一 Runtime Protocol

CLI、HTTP、Blog、Live2D 与管理后台不应各自调用 Agent Loop 私有方法。

可以定义内部的 Request、Response、Notification 与 Server Request 协议，再由 HTTP/SSE/WebSocket Adapter 转换。

### 11.2 给每个 Step 一个不可变执行视图

qi-pi 已有插件热重载和 Registry Snapshot，下一步应把 Provider、Tool、Hook、权限和 Environment 统一绑定到 Step Snapshot。

活动调用继续使用旧快照，新 Turn 或新 Step 才看到新 Registry。

### 11.3 把审批做成可关联的 Server Request

Approval 需要 `thread_id`、`turn_id`、`item_id/call_id` 与 `request_id`，并拥有 resolved、cancelled 和 timeout 终态。

只发一条普通 Event，会让多 Channel 不知道由谁回答，也难以处理重复响应。

### 11.4 区分事实日志与查询投影

Session Event Log 继续承担恢复真相；SQLite 负责列表、统计与 Trace 查询。投影损坏时可以重建，而不是反向污染会话事实。

这与 qi-pi 当前方向一致，应继续保持。

### 11.5 把“是否允许”与“实际隔离”分开

Tool Policy、Approval、Permission Grant 与 Sandbox Provider 不应揉成一个布尔值。

一个动作可以被批准但仍在受限环境运行，也可以无需人工批准但受到严格文件与网络边界约束。

## 十二、如何自己继续读 Codex 源码

如果想验证本文，而不是继续阅读二手概念，建议按下面顺序：

1. 从 `codex-rs/cli/src/main.rs` 看命令如何分流；
2. 从 `codex-rs/exec/src/lib.rs` 看无头模式如何使用进程内 App Server；
3. 从 `codex-rs/core/src/codex_thread.rs` 看双向 `Op/Event` 通道；
4. 从 `codex-rs/core/src/session/turn.rs` 看一次 Turn 的采样循环；
5. 从 `stream_events_utils.rs` 追踪 Output Item 如何变成 Tool Future；
6. 从 `tools/router.rs` 与 `tools/registry.rs` 看 Tool 生命周期；
7. 再进入具体 Handler，观察审批与沙箱在哪里发生；
8. 最后阅读 `rollout`、`thread-store` 与 `state`，理解恢复与查询投影。

这种顺序先建立主链，再进入分支。否则很容易在大量工具、协议类型与兼容代码里迷路。

## 结语

Codex CLI 最值得学习的，不是终端动画，也不是某个 Prompt 模板。

它真正成熟的地方，是把一次不确定的模型生成，放进了一组明确边界：Thread 保存连续性，Turn 表达目标，Step 固定采样世界，Item 描述可观察工作，Tool Runtime 管执行，Rollout 管恢复，Host 只负责交互。

因此，一个更准确的总结是：

> Codex CLI 是一个以本地代码执行为场景、以 Thread/Turn/Item 为公开协议、以反复采样与工具反馈为核心、并用审批、沙箱和追加历史收紧风险的 Agent Harness。

当我们把这些层次拆开后，也更容易回答“哪些能力应该放进 qi-pi”：不是照搬 TUI，而是吸收它的执行边界、双向控制协议、不可变 Step 视图与可恢复历史。

## 参考资料

- [Codex CLI 官方文档](https://developers.openai.com/codex/cli)
- [Codex CLI 命令参考](https://developers.openai.com/codex/cli/reference)
- [Codex App Server 协议](https://developers.openai.com/codex/app-server)
- [Codex 配置参考](https://developers.openai.com/codex/config-reference)
- [OpenAI Codex 源码：rust-v0.152.1](https://github.com/openai/codex/tree/5adb68a49933ae446bf11935662c83dba55a0804)
