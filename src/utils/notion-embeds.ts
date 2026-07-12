const CODEX_TOOL_DESIGN_MARKER = '{{codex-tool-design-map}}'
const CODEX_TOOL_SPEC_MARKER = '{{codex-tool-spec-layers}}'
const CODEX_SUBAGENT_MARKER = '{{codex-subagent-lifecycle}}'
const CODEX_VISION_MARKER = '{{codex-vision-pipeline}}'
const CLAUDE_MEMORY_TAXONOMY_MARKER = '{{claude-memory-taxonomy}}'
const CLAUDE_MEMORY_WRITE_RECALL_MARKER = '{{claude-memory-write-recall}}'
const CLAUDE_MEMORY_INJECTION_MARKER = '{{claude-memory-injection}}'
const CLAUDE_MEMORY_TRUST_MARKER = '{{claude-memory-trust-boundary}}'

const CODEX_TOOL_DESIGN_HTML = `
<section class="notion-codex-tool-map" aria-label="Codex 通用工具设计示意">
  <style>
    .notion-codex-tool-map {
      margin: 2.5rem 0;
      border: 1px solid hsl(214 18% 84%);
      border-radius: 16px;
      background: linear-gradient(135deg, hsl(42 42% 96%), hsl(165 22% 96%) 42%, hsl(218 35% 97%));
      color: hsl(218 26% 16%);
      overflow: hidden;
      box-shadow: 0 18px 55px hsl(218 32% 20% / 0.1);
    }

    .notion-codex-tool-map * {
      box-sizing: border-box;
    }

    .notion-codex-tool-map .map-heading {
      padding: 1.5rem 1.5rem 1rem;
      border-bottom: 1px solid hsl(214 18% 84% / 0.75);
    }

    .notion-codex-tool-map .eyebrow {
      margin: 0 0 0.35rem;
      color: hsl(165 42% 29%);
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .notion-codex-tool-map h2 {
      margin: 0;
      color: hsl(218 26% 16%);
      font-size: 1.35rem;
      line-height: 1.35;
    }

    .notion-codex-tool-map .map-heading p:last-child {
      max-width: 44rem;
      margin: 0.65rem 0 0;
      color: hsl(218 16% 36%);
      font-size: 0.95rem;
      line-height: 1.75;
    }

    .notion-codex-tool-map .runtime {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 2.25rem minmax(0, 1fr) 2.25rem minmax(0, 1fr);
      align-items: stretch;
      padding: 1.35rem 1.5rem 0.8rem;
    }

    .notion-codex-tool-map .node,
    .notion-codex-tool-map .tool-card {
      border: 1px solid hsl(214 18% 84%);
      border-radius: 12px;
      background: hsl(0 0% 100% / 0.8);
      padding: 1rem;
    }

    .notion-codex-tool-map .node {
      min-height: 9.5rem;
    }

    .notion-codex-tool-map .node span {
      display: inline-flex;
      width: 2rem;
      height: 2rem;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      background: hsl(218 24% 18%);
      color: white;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .notion-codex-tool-map .node strong {
      display: block;
      margin-top: 0.75rem;
      color: hsl(218 26% 16%);
      font-size: 1rem;
    }

    .notion-codex-tool-map .node p,
    .notion-codex-tool-map .tool-card p {
      margin: 0.5rem 0 0;
      color: hsl(218 16% 38%);
      font-size: 0.86rem;
      line-height: 1.65;
    }

    .notion-codex-tool-map .connector {
      position: relative;
      min-height: 9.5rem;
    }

    .notion-codex-tool-map .connector::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0.35rem;
      right: 0.35rem;
      height: 2px;
      background: hsl(165 42% 35%);
    }

    .notion-codex-tool-map .connector::after {
      content: "";
      position: absolute;
      top: calc(50% - 0.32rem);
      right: 0.28rem;
      width: 0.64rem;
      height: 0.64rem;
      border-top: 2px solid hsl(165 42% 35%);
      border-right: 2px solid hsl(165 42% 35%);
      transform: rotate(45deg);
    }

    .notion-codex-tool-map .tool-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.85rem;
      padding: 0.6rem 1.5rem 1.35rem;
    }

    .notion-codex-tool-map .tool-card {
      min-height: 9.75rem;
    }

    .notion-codex-tool-map .tool-card.edge { border-color: hsl(18 72% 55% / 0.58); }
    .notion-codex-tool-map .tool-card.core { border-color: hsl(165 36% 48% / 0.75); }
    .notion-codex-tool-map .tool-card.wide { border-color: hsl(218 58% 52% / 0.58); }
    .notion-codex-tool-map .tool-card.sense { border-color: hsl(44 82% 43% / 0.62); }

    .notion-codex-tool-map .tool-index {
      display: inline-block;
      border-radius: 999px;
      background: hsl(218 20% 92%);
      padding: 0.22rem 0.56rem;
      color: hsl(218 22% 24%);
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      font-size: 0.75rem;
    }

    .notion-codex-tool-map h3 {
      margin: 0.8rem 0 0.45rem;
      color: hsl(218 26% 16%);
      font-size: 0.98rem;
      line-height: 1.45;
    }

    .notion-codex-tool-map .feedback-loop {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1px;
      background: hsl(214 18% 84%);
      border-top: 1px solid hsl(214 18% 84%);
    }

    .notion-codex-tool-map .feedback-loop div {
      min-height: 5.9rem;
      background: hsl(218 24% 18%);
      padding: 1rem 1.5rem;
    }

    .notion-codex-tool-map .feedback-loop strong,
    .notion-codex-tool-map .feedback-loop span {
      display: block;
    }

    .notion-codex-tool-map .feedback-loop strong {
      color: hsl(42 68% 86%);
      font-size: 0.95rem;
    }

    .notion-codex-tool-map .feedback-loop span {
      margin-top: 0.35rem;
      color: hsl(210 26% 88%);
      font-size: 0.86rem;
      line-height: 1.65;
    }

    @media (max-width: 820px) {
      .notion-codex-tool-map .runtime {
        grid-template-columns: 1fr;
        gap: 0.75rem;
      }

      .notion-codex-tool-map .connector {
        display: none;
      }

      .notion-codex-tool-map .tool-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 560px) {
      .notion-codex-tool-map {
        border-radius: 12px;
      }

      .notion-codex-tool-map .map-heading,
      .notion-codex-tool-map .runtime,
      .notion-codex-tool-map .tool-grid {
        padding-left: 1rem;
        padding-right: 1rem;
      }

      .notion-codex-tool-map .tool-grid,
      .notion-codex-tool-map .feedback-loop {
        grid-template-columns: 1fr;
      }
    }
  </style>
  <div class="map-heading">
    <p class="eyebrow">Agent runtime map</p>
    <h2>把“会做事”的 Agent 拆成可控接口</h2>
    <p>模型负责判断下一步，工具负责把动作落到真实世界。工程设计的重点，是让每次动作都有边界、有返回、有恢复路径。</p>
  </div>
  <div class="runtime">
    <div class="node"><span>01</span><strong>用户目标</strong><p>自然语言任务、约束、偏好和验收标准。</p></div>
    <div class="connector" aria-hidden="true"></div>
    <div class="node"><span>02</span><strong>系统与策略</strong><p>权限、沙盒、上下文预算和不可越界的规则。</p></div>
    <div class="connector" aria-hidden="true"></div>
    <div class="node"><span>03</span><strong>模型决策</strong><p>选择读、写、探索、验证，或把子问题交给 subagent。</p></div>
  </div>
  <div class="tool-grid">
    <article class="tool-card edge"><div class="tool-index">exec_command</div><h3>和真实环境交互</h3><p>命令、目录、权限、超时、输出预算。</p></article>
    <article class="tool-card core"><div class="tool-index">apply_patch</div><h3>做最小代码变更</h3><p>补丁格式、目标文件、上下文行。</p></article>
    <article class="tool-card wide"><div class="tool-index">subagent</div><h3>并行探索和隔离上下文</h3><p>任务边界、可见资料、交付格式。</p></article>
    <article class="tool-card sense"><div class="tool-index">vision</div><h3>把界面状态转成证据</h3><p>截图、区域、识别目标、结论。</p></article>
  </div>
  <div class="feedback-loop">
    <div><strong>观察</strong><span>工具返回结构化结果、错误、日志或截图。</span></div>
    <div><strong>压缩</strong><span>保留与目标相关的证据，丢掉噪声。</span></div>
    <div><strong>修正</strong><span>模型根据新证据更新计划，继续下一步。</span></div>
  </div>
</section>
`

const CODEX_TOOL_SPEC_HTML = `
<section class="notion-codex-spec" aria-label="Codex ToolSpec 三层结构">
  <style>
    .notion-codex-spec { margin: 2.5rem 0; border: 1px solid hsl(214 18% 84%); border-radius: 16px; background: hsl(210 30% 98%); color: hsl(218 26% 16%); overflow: hidden; box-shadow: 0 18px 50px hsl(218 32% 20% / 0.08); }
    .notion-codex-spec * { box-sizing: border-box; }
    .notion-codex-spec .head { padding: 1.4rem 1.5rem 1rem; border-bottom: 1px solid hsl(214 18% 84%); }
    .notion-codex-spec .eyebrow { margin: 0 0 0.35rem; color: hsl(206 58% 34%); font-size: 0.78rem; font-weight: 700; letter-spacing: 0; text-transform: uppercase; }
    .notion-codex-spec h2 { margin: 0; color: hsl(218 26% 16%); font-size: 1.32rem; line-height: 1.35; }
    .notion-codex-spec .layers { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; padding: 1.35rem 1.5rem; }
    .notion-codex-spec .layer { min-height: 13rem; border: 1px solid hsl(214 18% 84%); border-radius: 12px; background: white; padding: 1rem; }
    .notion-codex-spec .layer strong { display: block; color: hsl(218 26% 16%); font-size: 1rem; }
    .notion-codex-spec .layer code { display: inline-block; margin-top: 0.55rem; border-radius: 999px; background: hsl(218 20% 92%); padding: 0.18rem 0.5rem; color: hsl(218 22% 24%); font-size: 0.74rem; }
    .notion-codex-spec .layer p { margin: 0.7rem 0 0; color: hsl(218 16% 38%); font-size: 0.86rem; line-height: 1.65; }
    .notion-codex-spec .flow { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 1px; background: hsl(214 18% 84%); border-top: 1px solid hsl(214 18% 84%); }
    .notion-codex-spec .flow div { min-height: 5.5rem; background: hsl(218 24% 18%); padding: 0.9rem 1rem; color: hsl(210 26% 88%); font-size: 0.82rem; line-height: 1.55; }
    .notion-codex-spec .flow span { display: block; color: hsl(42 68% 86%); font-weight: 700; }
    @media (max-width: 780px) { .notion-codex-spec .layers, .notion-codex-spec .flow { grid-template-columns: 1fr; } }
  </style>
  <div class="head"><p class="eyebrow">ToolSpec layers</p><h2>工具不是直接发给模型的一段代码，而是三层 contract</h2></div>
  <div class="layers">
    <div class="layer"><strong>内部规格</strong><code>ToolSpec</code><p>Codex 自己维护工具抽象：名称、描述、入参、内部 output schema，以及 runtime 需要的执行信息。</p></div>
    <div class="layer"><strong>通信层定义</strong><code>wire tool definition</code><p>序列化成 Responses API 请求里的 tools JSON。模型主要看到工具名、描述和入参 schema。</p></div>
    <div class="layer"><strong>执行层</strong><code>handler / runtime</code><p>本地 handler 校验参数、权限和文件范围，执行工具，再把结果作为 function_call_output 回填上下文。</p></div>
  </div>
  <div class="flow"><div><span>1. Model</span>选择工具并生成参数</div><div><span>2. Runtime</span>解析 function call</div><div><span>3. Handler</span>本地执行并校验权限</div><div><span>4. Output</span>生成结构化返回</div><div><span>5. Context</span>结果进入下一轮推理</div></div>
</section>
`

const CODEX_SUBAGENT_HTML = `
<section class="notion-codex-subagents" aria-label="Codex Subagent 生命周期">
  <style>
    .notion-codex-subagents { margin: 2.5rem 0; border: 1px solid hsl(214 18% 84%); border-radius: 16px; background: linear-gradient(135deg, hsl(210 30% 98%), hsl(150 28% 96%)); color: hsl(218 26% 16%); overflow: hidden; box-shadow: 0 18px 50px hsl(218 32% 20% / 0.08); }
    .notion-codex-subagents * { box-sizing: border-box; }
    .notion-codex-subagents .head { padding: 1.4rem 1.5rem 1rem; border-bottom: 1px solid hsl(214 18% 84%); }
    .notion-codex-subagents .eyebrow { margin: 0 0 0.35rem; color: hsl(156 45% 31%); font-size: 0.78rem; font-weight: 700; letter-spacing: 0; text-transform: uppercase; }
    .notion-codex-subagents h2 { margin: 0; color: hsl(218 26% 16%); font-size: 1.32rem; line-height: 1.35; }
    .notion-codex-subagents .lane { padding: 1.35rem 1.5rem; }
    .notion-codex-subagents .steps { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0.75rem; align-items: stretch; }
    .notion-codex-subagents .step { position: relative; min-height: 9.25rem; border: 1px solid hsl(214 18% 84%); border-radius: 12px; background: white; padding: 0.95rem; }
    .notion-codex-subagents .step::after { content: ""; position: absolute; top: 2rem; right: -0.58rem; width: 0.75rem; height: 0.75rem; border-top: 2px solid hsl(156 45% 35%); border-right: 2px solid hsl(156 45% 35%); transform: rotate(45deg); }
    .notion-codex-subagents .step:last-child::after { display: none; }
    .notion-codex-subagents .step span { display: inline-block; border-radius: 999px; background: hsl(156 34% 91%); padding: 0.18rem 0.5rem; color: hsl(156 45% 27%); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; font-size: 0.72rem; font-weight: 700; }
    .notion-codex-subagents .step strong { display: block; margin-top: 0.7rem; color: hsl(218 26% 16%); font-size: 0.96rem; }
    .notion-codex-subagents .step p { margin: 0.45rem 0 0; color: hsl(218 16% 38%); font-size: 0.82rem; line-height: 1.58; }
    .notion-codex-subagents .notes { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; background: hsl(214 18% 84%); border-top: 1px solid hsl(214 18% 84%); }
    .notion-codex-subagents .notes div { background: hsl(218 24% 18%); padding: 1rem 1.5rem; color: hsl(210 26% 88%); font-size: 0.86rem; line-height: 1.65; }
    .notion-codex-subagents .notes strong { display: block; color: hsl(42 68% 86%); }
    @media (max-width: 860px) { .notion-codex-subagents .steps, .notion-codex-subagents .notes { grid-template-columns: 1fr; } .notion-codex-subagents .step::after { display: none; } }
  </style>
  <div class="head"><p class="eyebrow">Subagent lifecycle</p><h2>Subagent 是上下文隔离和并发委托，不是简单“多开模型”</h2></div>
  <div class="lane"><div class="steps"><div class="step"><span>spawn</span><strong>创建子 Agent</strong><p>runtime 返回 agent_id 和 nickname，主模型之后用 ID 继续操作。</p></div><div class="step"><span>send input</span><strong>分派任务</strong><p>主 Agent 向指定子 Agent 追加目标、上下文或新的探索方向。</p></div><div class="step"><span>wait</span><strong>等待结果</strong><p>不是 sleep，而是等待一个或多个 Agent 到 final state，类似 join / await。</p></div><div class="step"><span>close</span><strong>关闭会话</strong><p>让子 Agent 退出活跃状态，释放当前任务上下文。</p></div><div class="step"><span>resume</span><strong>恢复继续</strong><p>沿着旧子任务追加上下文，继续之前的探索或执行。</p></div></div></div>
  <div class="notes"><div><strong>触发条件</strong>Codex 的工具描述会约束：显式要求并发 / subagent 分派，或做深度代码库 research 时更容易 spawn。</div><div><strong>结果回填</strong>未被 wait 的子 Agent 完成后，runtime 也会把完成消息注入主 Agent 上下文，避免结果失联。</div></div>
</section>
`

const CODEX_VISION_HTML = `
<section class="notion-codex-vision" aria-label="Codex Agentic Vision 输入管线">
  <style>
    .notion-codex-vision { margin: 2.5rem 0; border: 1px solid hsl(214 18% 84%); border-radius: 16px; background: hsl(44 48% 97%); color: hsl(218 26% 16%); overflow: hidden; box-shadow: 0 18px 50px hsl(218 32% 20% / 0.08); }
    .notion-codex-vision * { box-sizing: border-box; }
    .notion-codex-vision .head { padding: 1.4rem 1.5rem 1rem; border-bottom: 1px solid hsl(214 18% 84%); }
    .notion-codex-vision .eyebrow { margin: 0 0 0.35rem; color: hsl(33 74% 35%); font-size: 0.78rem; font-weight: 700; letter-spacing: 0; text-transform: uppercase; }
    .notion-codex-vision h2 { margin: 0; color: hsl(218 26% 16%); font-size: 1.32rem; line-height: 1.35; }
    .notion-codex-vision .pipeline { display: grid; grid-template-columns: 1.1fr 0.9fr 1.1fr; gap: 1rem; padding: 1.35rem 1.5rem; align-items: stretch; }
    .notion-codex-vision .panel { border: 1px solid hsl(214 18% 84%); border-radius: 12px; background: white; padding: 1rem; min-height: 11rem; }
    .notion-codex-vision .panel strong { display: block; color: hsl(218 26% 16%); font-size: 1rem; }
    .notion-codex-vision .panel p { margin: 0.55rem 0 0; color: hsl(218 16% 38%); font-size: 0.86rem; line-height: 1.65; }
    .notion-codex-vision .image-box { margin-top: 0.75rem; aspect-ratio: 16 / 9; border: 1px dashed hsl(33 64% 55%); border-radius: 10px; background: linear-gradient(135deg, hsl(33 88% 92%) 0 25%, transparent 25% 50%, hsl(206 66% 92%) 50% 75%, transparent 75%), hsl(42 60% 96%); background-size: 18px 18px; }
    .notion-codex-vision .runtime { background: hsl(218 24% 18%); color: hsl(210 26% 88%); }
    .notion-codex-vision .runtime strong { color: hsl(42 68% 86%); }
    .notion-codex-vision .chips { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.8rem; }
    .notion-codex-vision .chips span { border-radius: 999px; background: hsl(218 20% 92%); padding: 0.18rem 0.5rem; color: hsl(218 22% 24%); font-size: 0.72rem; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; }
    @media (max-width: 760px) { .notion-codex-vision .pipeline { grid-template-columns: 1fr; } }
  </style>
  <div class="head"><p class="eyebrow">Agentic vision</p><h2>模型会看图，但“把本地图片放进上下文”是 runtime 的工作</h2></div>
  <div class="pipeline"><div class="panel"><strong>1. 用户或任务给出路径</strong><p>例如本地截图、PDF 渲染图、页面截图。模型不能直接读取文件系统，只能请求 runtime 做桥接。</p><div class="image-box" aria-hidden="true"></div></div><div class="panel runtime"><strong>2. view_image 工具</strong><p>解析路径、读取文件、校验可访问性，把图片编码成模型可接受的 image input。</p><div class="chips"><span>path</span><span>read file</span><span>base64</span><span>function_call_output</span></div></div><div class="panel"><strong>3. 图像进入下一轮推理</strong><p>模型基于真实视觉输入判断 UI、PDF、截图或本地图片，而不是只靠文本猜测。</p><div class="chips"><span>VLM</span><span>evidence</span><span>verify</span><span>revise</span></div></div></div>
</section>
`

const CLAUDE_MEMORY_TAXONOMY_HTML = `<section class="notion-memory-taxonomy" aria-label="Claude Code Memory taxonomy">
  <style>
    .notion-memory-taxonomy { margin: 2.5rem 0; border: 1px solid hsl(214 18% 84%); border-radius: 16px; background: linear-gradient(135deg, hsl(210 30% 98%), hsl(42 48% 96%)); color: hsl(218 26% 16%); overflow: hidden; box-shadow: 0 18px 50px hsl(218 32% 20% / 0.08); }
    .notion-memory-taxonomy * { box-sizing: border-box; }
    .notion-memory-taxonomy .head { padding: 1.4rem 1.5rem 1rem; border-bottom: 1px solid hsl(214 18% 84%); }
    .notion-memory-taxonomy .eyebrow { margin: 0 0 0.35rem; color: hsl(206 58% 34%); font-size: 0.78rem; font-weight: 700; letter-spacing: 0; text-transform: uppercase; }
    .notion-memory-taxonomy h2 { margin: 0; color: hsl(218 26% 16%); font-size: 1.32rem; line-height: 1.35; }
    .notion-memory-taxonomy .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; padding: 1.35rem 1.5rem; }
    .notion-memory-taxonomy .card { min-height: 12.5rem; border: 1px solid hsl(214 18% 84%); border-radius: 12px; background: white; padding: 1rem; }
    .notion-memory-taxonomy .card span { display: inline-block; border-radius: 999px; background: hsl(218 20% 92%); padding: 0.18rem 0.5rem; color: hsl(218 22% 24%); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; font-size: 0.72rem; font-weight: 700; }
    .notion-memory-taxonomy .card strong { display: block; margin-top: 0.7rem; color: hsl(218 26% 16%); font-size: 1rem; }
    .notion-memory-taxonomy .card p { margin: 0.5rem 0 0; color: hsl(218 16% 38%); font-size: 0.84rem; line-height: 1.62; }
    .notion-memory-taxonomy .foot { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; background: hsl(214 18% 84%); border-top: 1px solid hsl(214 18% 84%); }
    .notion-memory-taxonomy .foot div { min-height: 5.75rem; background: hsl(218 24% 18%); padding: 1rem 1.5rem; color: hsl(210 26% 88%); font-size: 0.84rem; line-height: 1.6; }
    .notion-memory-taxonomy .foot strong { display: block; color: hsl(42 68% 86%); }
    @media (max-width: 860px) { .notion-memory-taxonomy .grid, .notion-memory-taxonomy .foot { grid-template-columns: 1fr; } }
  </style>
  <div class="head"><p class="eyebrow">Auto Memory taxonomy</p><h2>Claude Code 的自动记忆先按语义分类，再决定如何写入和召回</h2></div>
  <div class="grid"><div class="card"><span>user</span><strong>用户是谁</strong><p>保存用户画像、偏好、协作方式和解释力度。它不记录项目事实，而是帮助 Agent 调整默认沟通方式。</p></div><div class="card"><span>feedback</span><strong>以后怎么做</strong><p>保存行为约束和正负反馈，例如不要 mock DB、某种 PR 打包方式是对的。重点是 rule、fact、why 和 how to apply。</p></div><div class="card"><span>project</span><strong>项目外部语境</strong><p>保存代码无法直接推出的现实约束，例如冻结期、合规原因、事故背景、业务决策。</p></div><div class="card"><span>reference</span><strong>去哪里查</strong><p>保存外部信息入口，例如 Linear 项目、看板、Slack channel 或其他检索位置，而不是保存外部系统的全部内容。</p></div></div>
  <div class="foot"><div><strong>不是时间线</strong>文件按语义主题命名，优先更新已有 topic，而不是每次创建一条时间戳笔记。</div><div><strong>不是代码索引</strong>它补充的是代码以外的记忆，不能替代读取当前仓库。</div><div><strong>不是绝对事实</strong>记忆只代表写入时的认知，使用前仍要验证。</div></div>
</section>`

const CLAUDE_MEMORY_WRITE_RECALL_HTML = `<section class="notion-memory-write-recall" aria-label="Claude Code Memory 写入和召回链路">
  <style>
    .notion-memory-write-recall { margin: 2.5rem 0; border: 1px solid hsl(214 18% 84%); border-radius: 16px; background: hsl(150 28% 96%); color: hsl(218 26% 16%); overflow: hidden; box-shadow: 0 18px 50px hsl(218 32% 20% / 0.08); }
    .notion-memory-write-recall * { box-sizing: border-box; }
    .notion-memory-write-recall .head { padding: 1.4rem 1.5rem 1rem; border-bottom: 1px solid hsl(214 18% 84%); }
    .notion-memory-write-recall .eyebrow { margin: 0 0 0.35rem; color: hsl(156 45% 31%); font-size: 0.78rem; font-weight: 700; letter-spacing: 0; text-transform: uppercase; }
    .notion-memory-write-recall h2 { margin: 0; color: hsl(218 26% 16%); font-size: 1.32rem; line-height: 1.35; }
    .notion-memory-write-recall .flow { display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 0.75rem; padding: 1.35rem 1.5rem; }
    .notion-memory-write-recall .step { position: relative; min-height: 10.5rem; border: 1px solid hsl(214 18% 84%); border-radius: 12px; background: white; padding: 0.95rem; }
    .notion-memory-write-recall .step::after { content: ""; position: absolute; top: 2rem; right: -0.58rem; width: 0.75rem; height: 0.75rem; border-top: 2px solid hsl(156 45% 35%); border-right: 2px solid hsl(156 45% 35%); transform: rotate(45deg); }
    .notion-memory-write-recall .step:last-child::after { display: none; }
    .notion-memory-write-recall .step span { display: inline-block; border-radius: 999px; background: hsl(156 34% 91%); padding: 0.18rem 0.5rem; color: hsl(156 45% 27%); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; font-size: 0.72rem; font-weight: 700; }
    .notion-memory-write-recall .step strong { display: block; margin-top: 0.7rem; color: hsl(218 26% 16%); font-size: 0.96rem; }
    .notion-memory-write-recall .step p { margin: 0.45rem 0 0; color: hsl(218 16% 38%); font-size: 0.82rem; line-height: 1.58; }
    @media (max-width: 900px) { .notion-memory-write-recall .flow { grid-template-columns: 1fr; } .notion-memory-write-recall .step::after { display: none; } }
  </style>
  <div class="head"><p class="eyebrow">write / update / recall</p><h2>记忆不是主 Agent 顺手写文件，而是 turn 结束后由提取 Agent 维护</h2></div>
  <div class="flow"><div class="step"><span>turn end</span><strong>一轮对话结束</strong><p>用户问题、工具调用轨迹和最终回答形成一个完整 turn。</p></div><div class="step"><span>extract</span><strong>fork 提取 Agent</strong><p>独立 Agent 读取对话轨迹，判断是否有值得长期保存的事实或规则。</p></div><div class="step"><span>manifest</span><strong>扫描清单</strong><p>先看 memory.md、front matter 和文件时间，了解已有 topic，避免重复创建。</p></div><div class="step"><span>upsert</span><strong>更新或新建</strong><p>按 user、feedback、project、reference 分类，优先更新相同主题文件。</p></div><div class="step"><span>select</span><strong>下次召回</strong><p>下一次请求时，selector 基于名称和描述最多挑出少量强相关记忆。</p></div></div>
</section>`

const CLAUDE_MEMORY_INJECTION_HTML = `<section class="notion-memory-injection" aria-label="Claude Code Memory 注入到 Agent Loop">
  <style>
    .notion-memory-injection { margin: 2.5rem 0; border: 1px solid hsl(214 18% 84%); border-radius: 16px; background: hsl(210 30% 98%); color: hsl(218 26% 16%); overflow: hidden; box-shadow: 0 18px 50px hsl(218 32% 20% / 0.08); }
    .notion-memory-injection * { box-sizing: border-box; }
    .notion-memory-injection .head { padding: 1.4rem 1.5rem 1rem; border-bottom: 1px solid hsl(214 18% 84%); }
    .notion-memory-injection .eyebrow { margin: 0 0 0.35rem; color: hsl(206 58% 34%); font-size: 0.78rem; font-weight: 700; letter-spacing: 0; text-transform: uppercase; }
    .notion-memory-injection h2 { margin: 0; color: hsl(218 26% 16%); font-size: 1.32rem; line-height: 1.35; }
    .notion-memory-injection .layers { display: grid; grid-template-columns: 0.95fr 1.05fr 1.05fr; gap: 1rem; padding: 1.35rem 1.5rem; }
    .notion-memory-injection .panel { border: 1px solid hsl(214 18% 84%); border-radius: 12px; background: white; padding: 1rem; min-height: 12rem; }
    .notion-memory-injection .panel.dark { background: hsl(218 24% 18%); color: hsl(210 26% 88%); }
    .notion-memory-injection .panel strong { display: block; color: hsl(218 26% 16%); font-size: 1rem; }
    .notion-memory-injection .panel.dark strong { color: hsl(42 68% 86%); }
    .notion-memory-injection .panel p { margin: 0.55rem 0 0; color: hsl(218 16% 38%); font-size: 0.86rem; line-height: 1.65; }
    .notion-memory-injection .panel.dark p { color: hsl(210 26% 88%); }
    .notion-memory-injection .chips { display: flex; flex-wrap: wrap; gap: 0.45rem; margin-top: 0.8rem; }
    .notion-memory-injection .chips span { border-radius: 999px; background: hsl(218 20% 92%); padding: 0.18rem 0.5rem; color: hsl(218 22% 24%); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; font-size: 0.72rem; }
    @media (max-width: 760px) { .notion-memory-injection .layers { grid-template-columns: 1fr; } }
  </style>
  <div class="head"><p class="eyebrow">wire layer</p><h2>Memory 最终要变成远端模型请求体里的上下文</h2></div>
  <div class="layers"><div class="panel"><strong>System policy</strong><p>告诉模型什么时候需要获取记忆、如何判断相关性、以及使用记忆前必须注意什么。</p><div class="chips"><span>rules</span><span>when to fetch</span></div></div><div class="panel"><strong>User / project context</strong><p>CLAUDE.md、项目规则和当前会话上下文以 user message 等形式注入，而不是都塞进稳定 system prompt。</p><div class="chips"><span>CLAUDE.md</span><span>session</span><span>project</span></div></div><div class="panel dark"><strong>Relevant memories</strong><p>selector 只把强相关 topic 注入 agent loop，让 Agent 在行动前获得偏好、约束和外部线索。</p><div class="chips"><span>select</span><span>max few files</span><span>inject</span></div></div></div>
</section>`

const CLAUDE_MEMORY_TRUST_HTML = `<section class="notion-memory-trust" aria-label="Claude Code Memory 信任边界">
  <style>
    .notion-memory-trust { margin: 2.5rem 0; border: 1px solid hsl(214 18% 84%); border-radius: 16px; background: hsl(44 48% 97%); color: hsl(218 26% 16%); overflow: hidden; box-shadow: 0 18px 50px hsl(218 32% 20% / 0.08); }
    .notion-memory-trust * { box-sizing: border-box; }
    .notion-memory-trust .head { padding: 1.4rem 1.5rem 1rem; border-bottom: 1px solid hsl(214 18% 84%); }
    .notion-memory-trust .eyebrow { margin: 0 0 0.35rem; color: hsl(18 72% 38%); font-size: 0.78rem; font-weight: 700; letter-spacing: 0; text-transform: uppercase; }
    .notion-memory-trust h2 { margin: 0; color: hsl(218 26% 16%); font-size: 1.32rem; line-height: 1.35; }
    .notion-memory-trust .compare { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; background: hsl(214 18% 84%); }
    .notion-memory-trust .cell { min-height: 10.5rem; background: white; padding: 1rem 1.5rem; }
    .notion-memory-trust .cell.dark { background: hsl(218 24% 18%); color: hsl(210 26% 88%); }
    .notion-memory-trust .cell span { display: inline-block; border-radius: 999px; background: hsl(18 72% 92%); padding: 0.18rem 0.5rem; color: hsl(18 72% 31%); font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; font-size: 0.72rem; font-weight: 700; }
    .notion-memory-trust .cell strong { display: block; margin-top: 0.7rem; color: hsl(218 26% 16%); font-size: 1rem; }
    .notion-memory-trust .cell.dark strong { color: hsl(42 68% 86%); }
    .notion-memory-trust .cell p { margin: 0.5rem 0 0; color: hsl(218 16% 38%); font-size: 0.86rem; line-height: 1.65; }
    .notion-memory-trust .cell.dark p { color: hsl(210 26% 88%); }
    @media (max-width: 760px) { .notion-memory-trust .compare { grid-template-columns: 1fr; } }
  </style>
  <div class="head"><p class="eyebrow">memory is not source of truth</p><h2>“记忆说 X 存在”不等于“X 现在仍然存在”</h2></div>
  <div class="compare"><div class="cell"><span>memory</span><strong>历史线索</strong><p>保存写入那一刻的认知：曾经有某个文件、函数、flag、约束或协作偏好。</p></div><div class="cell dark"><span>verify</span><strong>回到当前现场</strong><p>真正给建议或改代码前，要读取当前仓库、当前分支、当前工具结果。</p></div><div class="cell"><span>answer</span><strong>带边界地使用</strong><p>把记忆当作行动约束和检索线索，而不是当作无需验证的事实库。</p></div></div>
</section>`

export function renderNotionEmbeds(html: string): string {
  return html
    .replaceAll(`<p>${CODEX_TOOL_DESIGN_MARKER}</p>`, CODEX_TOOL_DESIGN_HTML)
    .replaceAll(`<p>${CODEX_TOOL_SPEC_MARKER}</p>`, CODEX_TOOL_SPEC_HTML)
    .replaceAll(`<p>${CODEX_SUBAGENT_MARKER}</p>`, CODEX_SUBAGENT_HTML)
    .replaceAll(`<p>${CODEX_VISION_MARKER}</p>`, CODEX_VISION_HTML)
    .replaceAll(`<p>${CLAUDE_MEMORY_TAXONOMY_MARKER}</p>`, CLAUDE_MEMORY_TAXONOMY_HTML)
    .replaceAll(`<p>${CLAUDE_MEMORY_WRITE_RECALL_MARKER}</p>`, CLAUDE_MEMORY_WRITE_RECALL_HTML)
    .replaceAll(`<p>${CLAUDE_MEMORY_INJECTION_MARKER}</p>`, CLAUDE_MEMORY_INJECTION_HTML)
    .replaceAll(`<p>${CLAUDE_MEMORY_TRUST_MARKER}</p>`, CLAUDE_MEMORY_TRUST_HTML)
}
