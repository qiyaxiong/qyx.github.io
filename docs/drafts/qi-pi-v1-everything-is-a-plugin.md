# qi-pi v1：当一切皆插件，Agent 就不再是一段 Loop

> 这篇文章基于 qi-pi v1 当前 Python 实现，讨论它为什么把 Session、Provider、Tool、Agent Loop、持久化、HTTP、Live2D 和 Voice 全部做成插件，以及这种设计真正解决了什么问题。

![qi-pi v1 一切皆插件总架构](/images/blog/pi-agent/qi-pi-v1-architecture.svg)

很多 Agent 项目最初都长得很像：准备一组消息，调用模型，发现工具调用就执行工具，再把结果交回模型。这个循环并不复杂，几十行代码就能跑起来。

真正困难的部分，往往在它开始成为产品以后才出现：

- 同一个 Agent 要同时服务 CLI、Web、Blog 和 Live2D；
- 不同场景需要不同 Provider、工具、记忆与权限；
- 插件更新时，已经运行的请求不能被半路换掉；
- 工具已经对外产生副作用，进程却在结果写入前崩溃；
- UI、模型历史、统计后台与恢复逻辑不能各自维护一份“真相”；
- 一个插件被卸载后，它注册的工具、监听器和后台任务必须一起消失。

这时，问题已经不再是“如何写好 Agent Loop”，而是：**如何构造一个可以持续装配、卸载、恢复和观察 Agent 的运行底座。**

qi-pi v1 的答案是：把运行时缩到足够小，其余一切都作为插件提供。

## 一、“一切皆插件”到底是什么意思

“一切皆插件”并不表示系统里一行固定代码都没有。如果连插件生命周期本身也是插件，就会陷入“由谁加载第一个插件”的递归。

qi-pi 保留的最小核心只有几类运行时原语：

- `Context Graph`：保存父子作用域与隔离关系；
- `Service Reflect`：维护当前真实存在的 Service；
- `Event Dispatch`：分发类型化事件；
- `PluginHandle / Activation`：维护插件身份与激活状态；
- `Effect Ownership`：记录副作用及其撤销方式。

这个核心不知道什么是大模型，不知道什么是工具，也不知道 FastAPI、SQLite、Live2D 或语音合成。

Session 是插件，Provider Registry 是插件，Tool 与 Approval 是插件，Sandbox 是插件，Agent Loop 也是插件。HTTP、SSE、Trace UI、Memory、MCP、LSP、Subagent、Live2D 和 Voice 仍然是普通插件。

Loader 位于 `qi_runtime.loader`，但在架构语义上属于外围启动基础设施。它负责 Catalog、配置解析、Tree diff、增量事务与回滚，不属于不可再缩小的 Context 原语。

CLI 也不是普通能力插件。它位于 Bootstrap 边界，负责加载配置、创建 Root Context 并启动插件挂载。HTTP、SSE、Host Routes 和 Trace UI 才是可以按产品组合挂载的插件。

Sandbox 插件默认提供 `PassThroughSandbox`。系统保留进程 Sandbox 的 Service seam 和可选实现，但默认 Profile 不代表所有工具都会被强制放入隔离进程。

因此，一个“Agent”不是某个巨大类的实例，而是下面这些能力装配完成后的结果：

```text
Session + Provider + Tool + Agent Loop + Capability + Product Adapter
                              ↓
                       可运行的 Agent
```

这带来一个重要变化：系统不再先假设 Agent 必须有哪些组成部分。它只要求产品 Profile 装配结束时，所需的 Service 已经存在。

## 二、Profile 决定这一台 Agent 是什么

同一套后端可以有多种产品形态。一个无界面的 Headless Agent 和一个 Blog Live2D 助手，可能共用 Session、Provider 与工具流水线，却拥有完全不同的入口、模型资产和语音能力。

qi-pi 用 Profile、Bundle、Overlay 和 Context Tree 表达这种差异。

![qi-pi Profile、Context Tree 与原子装配](/images/blog/pi-agent/qi-pi-profile-composition.svg)

Profile 不是一份平铺的插件名称列表，而是一棵待装配的 Context Tree：

- `PluginNode` 表示一个插件实例；
- `GroupNode` 创建派生 Context；
- `children` 表示插件或分组的包含关系；
- `isolate` 显式隔离某些 Service；
- Patch 可以修改节点的启用状态与配置；
- Overlay 可以在不同部署环境中叠加差异。

下面是一段简化后的配置：

```yaml
- name: session-persistence-jsonl
  config:
    root: .pi-agent-py/sessions

- name: session
- name: providers
- name: approvals
- name: sandbox
- name: tools
- name: command-inbox
- name: compaction
- name: react-agent-loop

- name: live2d
  config:
    model_path: ./assets/avatar/model3.json

- name: voice
  config:
    provider: dashscope
    voice: my_voice_id
```

这段配置不是让 Bootstrap 根据 `inject / provide` 建立静态 Service Graph。Bootstrap 与 Loader 只解析配置树、导入插件并执行增量 reconciliation。

一次 reload 的正常路径是：

1. Preflight 受影响节点的候选插件；
2. 保留 identity 未变化的节点；
3. Dispose 发生变化的旧子树；
4. Mount 受影响的新子树；
5. 等待 Context 生命周期进入 quiescence；
6. 执行产品 postcondition，确认关键 Service 已存在；
7. 提交新的活动树。

事务范围是受影响节点集合，不是创建一套完整候选 Runtime 再做整体指针交换。失败时，Loader 释放已创建节点，并重新挂载 previous tree 恢复旧状态。

所以热重载不会把运行时暴露在“新旧插件各装了一半”的状态里。

## 三、Context 是运行时唯一真相

传统插件系统经常同时维护多个注册表：工具一个、Provider 一个、事件监听器一个、路由一个，最后再由某个全局容器把它们拼起来。这样做的风险是，不同注册表的生命周期很容易漂移。

qi-pi 的规则更简单：**插件只能通过 Context 贡献能力。**

一个最小工具插件可以这样写：

```python
from typing import Any

from qi_runtime import Context, ServiceKey
from qi_tools import TOOLS, ToolDefinition


class GreetPlugin:
    id = "greet"
    inject: tuple[ServiceKey[Any], ...] = (TOOLS,)

    async def apply(self, ctx: Context) -> None:
        tool = ToolDefinition(
            name="greet",
            description="Greet someone by name.",
            parameters={
                "type": "object",
                "properties": {"name": {"type": "string"}},
                "required": ["name"],
            },
            execute=lambda args, _ctx: f"Hello, {args['name']}!",
            output_schema={"type": "string"},
        )
        ctx.require(TOOLS).register(tool)
```

这里有两个容易混淆的概念：

- `inject = (TOOLS,)` 只表示插件生命周期依赖 ToolService；
- `ctx.require(TOOLS)` 才是在运行时获取真实服务。

Loader 不会读取一堆静态 `provide` 元数据，提前猜测完整服务图。Service 是否存在，最终以 Context 中的实际状态为准。

最关键的动态链路是：

```text
ctx.provide(LLM)
→ Context Service Truth 改变
→ Registry 标记依赖 LLM 的 PluginHandle
→ 重算受影响 inject
→ PENDING 插件进入 Activation
```

`inject` 决定插件生命周期，不能代替 Service Truth。即使插件元数据声称自己会提供某个 Service，只要 `ctx.provide()` 尚未成功执行，这个 Service 就不存在。

这种设计让 Context 同时承担了三件事：

1. **依赖边界**：插件只能看到当前 Context 及其父级允许继承的服务；
2. **生命周期边界**：插件何时可以激活，取决于所需 Service 是否可用；
3. **资源所有权边界**：插件注册的服务、事件、任务和外部资源都归属当前 Activation。

## 四、注册必须是可逆副作用

插件系统最容易被低估的问题，不是“怎么加载”，而是“怎么卸载干净”。

假设一个插件注册了同名工具、订阅了 Session 事件，还启动了一个后台任务。如果热重载只重新执行一遍代码，就会出现：

- 同名工具重复；
- 监听器叠加，一次事件处理多遍；
- 旧后台任务继续运行；
- Socket、文件和模型客户端没有关闭；
- 新旧插件同时修改状态。

qi-pi 用 Activation ownership 解决这个问题。

![qi-pi Context、Activation 与可逆副作用](/images/blog/pi-agent/qi-pi-context-ownership.svg)

`ctx.provide()`、`ctx.on()`、`ctx.plugin()`、Tool 注册和 Route 注册，都会自动归属当前 Activation。外部连接则通过 `ctx.effect()` 注册，并返回对应的 disposer。

卸载时，运行时按照严格的 LIFO 顺序释放：

```text
最后创建的资源
    ↓
最后注册的监听器
    ↓
后台任务
    ↓
服务与子插件
    ↓
最早建立的外部连接
```

这和函数调用栈的退出顺序一致：后创建的资源往往依赖先创建的资源，因此必须先关闭。

`PluginHandle` 与 `Activation` 也不是同一个东西。Handle 是稳定身份；Provider 发生变化或插件执行 `retry()` 时，只替换内部 Activation。只有最终 `handle.dispose()`，才会关闭插件 Context 和全部子插件。

## 五、一次 Turn 是多个插件协作的结果

在 qi-pi 中，Agent Loop 仍然重要，但它不再拥有整个世界。

它负责推进状态机：开始 Turn、准备 Step、发起模型请求、处理工具调用、决定进入下一 Step 或结束 Turn。消息保存、Provider 调用、工具审批、能力执行和 UI 通知分别由其他插件完成。

![qi-pi 一次 Turn 的插件协作时序](/images/blog/pi-agent/qi-pi-turn-collaboration.svg)

一次典型 Turn 会产生下面的事实：

```text
input/enqueued → turn/start → input/entered → user/message
→ step/start → request/header + request/context
→ assistant/chunk* → assistant/message
→ [tool/call → policy → approval? → execute → tool/result → next step]*
→ step/end → turn/end
```

这里需要区分 Turn 与 Step：

- **Turn** 是用户发起的一次完整交互；
- **Step** 是其中的一轮模型调用；
- 模型调用工具后，工具结果会进入上下文，再启动下一 Step；
- 模型不再请求工具时，Turn 才结束。

这也是为什么错误定位不能只有 `session_id`、`run_id` 或 `message_id`。只有明确的 Turn、Step 和 Tool Call 边界，UI 才能回答：失败发生在第几轮模型请求、哪次工具调用之后，以及恢复时应该从哪里继续。

## 六、Tool 不是一个回调，而是一条受控流水线

直接把 Python 函数暴露给模型很容易，但这不足以运行真实产品。qi-pi 的 ToolService 把一次调用拆成受控阶段：

```text
schema validation
→ pre-execute
→ monotonic policy
→ approval?
→ execution wrappers / sandbox
→ tool body
→ output validation
→ finalize_content
→ freeze
→ realtime tool/result
→ persistent tool/result
```

策略是单调的：

```text
abstain < require_approval < deny
```

多个 Gate 同时参与时，只能把决定变得更严格，后面的插件不能把已经判定为 `deny` 的操作重新放行。Gate 抛错时也默认阻止执行。

对于可能产生外部副作用的工具，系统还记录一条 Tool Ledger：

```text
prepared
→ dispatched
→ external-result-recorded
→ committed
```

如果进程在 `dispatched` 之后崩溃，系统不会简单地再执行一次。只读或幂等工具可以使用相同 idempotency key 恢复；结果不明确的非幂等工具则进入人工确认，避免重复扣款、重复发送或重复写入。

## 七、Session Event Log 是唯一持久事实

很多 Agent 实现同时保存三份状态：模型消息数组、数据库中的会话记录、UI 自己拼出的时间线。它们在正常路径上看起来一致，一旦发生流式中断、工具失败或 Compaction，很容易相互漂移。

qi-pi 只承认一份持久事实：Session Event Log。

![qi-pi Session Event Log 与可重建投影](/images/blog/pi-agent/qi-pi-session-facts.svg)

每个事件使用稳定外壳：

```json
{
  "seq": 42,
  "time": 1787328000000,
  "type": "tool/result",
  "data": {
    "turn": 3,
    "step": 2,
    "callId": "call_abc"
  }
}
```

模型下一次请求所需的消息，不从第二份 `Agent.messages` 获取，而是通过：

```python
messages = session.derive_messages()
```

从事件 surface 派生。

SQLite 中的 Session、Run、Usage、Error 与 Trace 数据都只是可重建投影。它们可以为了查询效率建立索引、汇总小时与天级统计，但不能反过来成为模型历史真相。

这种设计有三个直接收益：

1. **恢复明确**：从事件与 checkpoint 重新进入，不序列化协程栈；
2. **观察一致**：UI、模型和统计看到的是同一条事实流；
3. **故障隔离**：Telemetry 投影失败不会阻塞 Agent Run。

## 八、与 DSH 对齐的语义，以及 qi-pi 自己的增强

qi-pi 的 Context-first 插件语义已经与 DSH 的核心模型基本对齐，但它不是简单的 Python 逐行翻译。

已经对齐的部分包括：

- 插件挂在共享 Context，而不是挂在 Agent 或 FastAPI 上；
- Service 只有在 `ctx.provide()` 成功后才真实存在；
- `inject` 决定插件生命周期，不决定 Service Truth；
- Service、Event、Tool、Route 与 Effect 绑定到 Activation；
- 卸载插件会自动撤销注册并释放资源；
- Agent Loop、Session、Tools、Provider 与 Sandbox 都由插件提供；
- Session Event Log 是模型历史、恢复、UI 与审计的共同事实源；
- Conversation 与 Trajectory UI 可以直接消费统一协议。

qi-pi 在这些语义之上增加了更偏恢复、产品化与 Python 运行环境的能力：

- Tool Operation Ledger；
- 非幂等工具的未知结果保护；
- 持久 Inbox；
- Subagent descriptor v2；
- owned-child continuation graph；
- 自动 settlement notice；
- Agent Preset fingerprint；
- JSONL/Zstd 强制 flush 与撕裂尾恢复；
- SQLite 可重建管理投影；
- 独立 Trace 管理后台。

因此更准确的定位是：qi-pi 继承 Context-first、Everything is a Plugin 的运行时思想，再用 Python 重建并补强工具恢复、持久会话、Subagent continuation 和本地产品接入。

## 九、Live2D 为什么应该是普通插件

Live2D 很适合验证这套架构是否真的做到了产品无关。

如果把 Avatar、TTS、嘴型、动作与 Blog 跳转直接写入 Agent Loop，那么这套 Agent 很快就只能服务一个网页。qi-pi 把它们拆成独立能力：

- Blog 插件提供文章检索与安全导航动作；
- Live2D 插件提供模型资产、Snapshot、Command 与动作事件；
- Voice 插件提供流式 PCM 语音合成；
- HTTP Route 插件暴露对应接口；
- Agent Loop 只看见稳定的 Service 与 Tool；
- 前端消费 Control Stream，驱动嘴型、表情和身体动作。

于是相同 Session 与 Agent 能力可以被多个 Channel 使用：Blog 浮窗、独立桌面角色、游戏 NPC 或其他网站都只需要换产品插件与前端适配器。

这才是“一套统一 Agent 后端”的真正含义：不是让所有产品共用同一个页面，而是让它们共享同一套事实、权限、工具和恢复语义。

## 十、这套设计的代价

一切皆插件并不免费。

首先，调试成本会上升。一个 Service 为什么不存在，可能是插件未加载、`inject` 未满足、Context 隔离错误、配置表达式失败或 Activation 回滚。为此必须提供清楚的生命周期诊断和 Context Reflect。

其次，插件粒度需要克制。不是每个小函数都值得成为插件。适合插件化的通常是具有独立生命周期、外部资源、替换需求或产品边界的能力。

再次，热重载不能假装所有代码都能无损替换。已经安装的 Python Package 如果代码版本变化，往往仍需要重启；真正安全的热重载主要针对配置、本地插件与可控 Activation。

最后，恢复兼容性必须严格。Session Header 会记录 Profile、插件版本和 recovery fingerprint。配置或工具恢复语义发生变化时，系统应该要求显式迁移，而不是勉强读取旧状态。

## 十一、从“写一个 Agent”到“构造 Agent 产品”

qi-pi v1 最重要的变化，不是多支持了几个 Provider 或工具，而是把问题换了一个层次。

过去的问题是：

> Agent Loop 里还缺什么能力？

现在的问题是：

> 当前 Profile 应该装配哪些插件？它们提供什么 Service？副作用归谁所有？哪些事实必须持久化？失败后如何恢复？

前一个问题容易产生越来越大的 Agent 类；后一个问题则把 Agent 变成可组合、可替换、可观察的产品运行时。

最终，qi-pi 的核心可以浓缩成三句话：

1. **Context Graph 是唯一运行时真相。**
2. **Session Event Log 是唯一持久事实。**
3. **除最小运行时与启动装配外，一切能力皆插件。**

当这三条约束成立以后，Live2D、Voice、Memory、MCP、Subagent 或未来的新 Channel 都不需要侵入 Agent Core。它们只是在同一套生命周期与事实协议上，装配出不同的 Agent 产品。
