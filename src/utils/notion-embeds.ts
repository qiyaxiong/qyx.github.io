const CODEX_TOOL_DESIGN_MARKER = '{{codex-tool-design-map}}'
const CODEX_TOOL_SPEC_MARKER = '{{codex-tool-spec-layers}}'
const CODEX_SUBAGENT_MARKER = '{{codex-subagent-lifecycle}}'
const CODEX_VISION_MARKER = '{{codex-vision-pipeline}}'
const CLAUDE_MEMORY_TAXONOMY_MARKER = '{{claude-memory-taxonomy}}'
const CLAUDE_MEMORY_WRITE_RECALL_MARKER = '{{claude-memory-write-recall}}'
const CLAUDE_MEMORY_INJECTION_MARKER = '{{claude-memory-injection}}'
const CLAUDE_MEMORY_TRUST_MARKER = '{{claude-memory-trust-boundary}}'
const AGENT_TURN_TIMELINE_MARKER = '{{agent-turn-timeline}}'
const DEEPSEEK_HARNESS_ARCHITECTURE_MARKER = '{{deepseek-harness-architecture}}'
const DEEPSEEK_HARNESS_LOOP_MARKER = '{{deepseek-harness-loop}}'

const DEEPSEEK_HARNESS_ARCHITECTURE_HTML = `<section class="notion-harness-architecture" aria-label="DeepSeek Harness 四层架构">
  <style>
    .notion-harness-architecture { --ink: hsl(226 28% 12%); --muted: hsl(223 13% 42%); margin: 2.4rem 0; overflow: hidden; border: 1px solid hsl(220 19% 82%); border-radius: 18px; background: linear-gradient(145deg, hsl(215 50% 98%), hsl(166 36% 97%)); color: var(--ink); box-shadow: 0 20px 60px hsl(220 25% 18% / .1); }
    .notion-harness-architecture * { box-sizing: border-box; }
    .notion-harness-architecture .head { padding: 1.5rem 1.5rem 1.1rem; border-bottom: 1px solid hsl(220 19% 82%); }
    .notion-harness-architecture .eyebrow { margin: 0 0 .35rem; color: hsl(165 55% 29%); font-size: .72rem; font-weight: 800; letter-spacing: .12em; }
    .notion-harness-architecture h2 { margin: 0; color: var(--ink); font-size: 1.35rem; line-height: 1.35; }
    .notion-harness-architecture .intro { display: block; margin-top: .5rem; color: var(--muted); font-size: .88rem; }
    .notion-harness-architecture .layers { padding: 1.25rem 1.5rem; }
    .notion-harness-architecture .layer { display: grid; grid-template-columns: 3rem minmax(0, 1fr) minmax(12rem, .8fr); gap: 1rem; align-items: center; border: 1px solid hsl(220 18% 83%); border-left-width: 4px; border-radius: 13px; background: hsl(0 0% 100% / .86); padding: 1rem; }
    .notion-harness-architecture .composition { border-left-color: hsl(216 74% 58%); }
    .notion-harness-architecture .cordis { border-left-color: hsl(266 62% 61%); }
    .notion-harness-architecture .spine { border-left-color: hsl(164 53% 42%); }
    .notion-harness-architecture .capabilities { border-left-color: hsl(31 85% 57%); }
    .notion-harness-architecture .index { display: grid; width: 2.35rem; height: 2.35rem; place-items: center; border-radius: 999px; background: var(--ink); color: white; font-family: ui-monospace, monospace; font-size: .76rem; font-weight: 800; }
    .notion-harness-architecture .copy strong, .notion-harness-architecture .copy small { display: block; }
    .notion-harness-architecture .copy strong { color: var(--ink); font-size: 1rem; }
    .notion-harness-architecture .copy small { margin-top: .2rem; color: hsl(165 47% 30%); font-family: ui-monospace, monospace; font-size: .71rem; }
    .notion-harness-architecture .copy p { margin: .4rem 0 0; color: var(--muted); font-size: .82rem; line-height: 1.6; }
    .notion-harness-architecture .connector { height: 1.55rem; color: hsl(220 15% 54%); text-align: center; line-height: 1.55rem; }
    .notion-harness-architecture .chips, .notion-harness-architecture .capability-grid, .notion-harness-architecture .spine-flow { display: flex; flex-wrap: wrap; gap: .42rem; justify-content: flex-end; }
    .notion-harness-architecture .chips span, .notion-harness-architecture .capability-grid span, .notion-harness-architecture .spine-flow span { border-radius: 999px; background: hsl(220 28% 94%); padding: .3rem .58rem; color: hsl(222 25% 26%); font-family: ui-monospace, monospace; font-size: .7rem; }
    .notion-harness-architecture .spine-flow { align-items: center; }
    .notion-harness-architecture .spine-flow i { color: hsl(164 53% 35%); font-style: normal; }
    .notion-harness-architecture .capability-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); }
    .notion-harness-architecture .capability-grid span { text-align: center; }
    .notion-harness-architecture .foot { border-top: 1px solid hsl(220 19% 82%); background: hsl(226 28% 12%); padding: .9rem 1.5rem; color: hsl(215 24% 88%); font-size: .82rem; line-height: 1.6; }
    .notion-harness-architecture .foot strong { color: hsl(47 82% 75%); }
    @media (max-width: 720px) { .notion-harness-architecture .head, .notion-harness-architecture .layers { padding-right: 1rem; padding-left: 1rem; } .notion-harness-architecture .layer { grid-template-columns: 2.6rem minmax(0, 1fr); } .notion-harness-architecture .chips, .notion-harness-architecture .capability-grid, .notion-harness-architecture .spine-flow { grid-column: 1 / -1; justify-content: flex-start; margin-left: 3.6rem; } .notion-harness-architecture .capability-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  </style>
  <div class="head"><p class="eyebrow">COMPOSABLE AGENT RUNTIME</p><h2>从产品配置到 Agent 能力的四层组合</h2><span class="intro">上层决定装什么，下层提供模型可执行的真实能力</span></div>
  <div class="layers">
    <article class="layer composition"><div class="index">01</div><div class="copy"><strong>组合层</strong><small>Profile · Bundle · Patch</small><p>声明这次启动是 Web、Headless，还是一套定制 Agent 产品。</p></div><div class="chips"><span>web</span><span>headless</span><span>overlay</span></div></article>
    <div class="connector" aria-hidden="true">↓</div>
    <article class="layer cordis"><div class="index">02</div><div class="copy"><strong>Cordis 插件运行层</strong><small>Context · Service · Event · Effect</small><p>解决依赖注入、生命周期、类型化通信与卸载回滚。</p></div><div class="chips"><span>inject</span><span>waterfall</span><span>dispose</span></div></article>
    <div class="connector" aria-hidden="true">↓</div>
    <article class="layer spine"><div class="index">03</div><div class="copy"><strong>Agent 主干</strong><small>Session → Prompt → LLM → Tools → Loop</small><p>让一次任务可持续执行、可恢复、可回放，也能被 UI 观察。</p></div><div class="spine-flow"><span>Session</span><i>→</i><span>Prompt</span><i>→</i><span>LLM</span><i>→</i><span>Tools</span></div></article>
    <div class="connector" aria-hidden="true">↓</div>
    <article class="layer capabilities"><div class="index">04</div><div class="copy"><strong>能力插件层</strong><small>Replaceable capability seams</small><p>通过统一接口接入不同的 Provider、执行环境和产品能力。</p></div><div class="capability-grid"><span>FS</span><span>Shell</span><span>Sandbox</span><span>Skills</span><span>Subagent</span><span>Workflow</span><span>MCP</span><span>Telemetry</span></div></article>
  </div>
  <div class="foot"><strong>关键：</strong>Agent Loop 不需要知道每项能力的具体实现，只依赖稳定 Service 与 Event。</div>
</section>`

const DEEPSEEK_HARNESS_LOOP_HTML = `<section class="notion-harness-loop" aria-label="DeepSeek Harness Turn 与 Step 循环">
  <style>
    .notion-harness-loop { --bg: hsl(232 22% 9%); --card: hsl(231 18% 14%); --border: hsl(230 14% 26%); --text: hsl(220 25% 96%); --muted: hsl(226 10% 68%); margin: 2.4rem 0; overflow: hidden; border: 1px solid var(--border); border-radius: 18px; background: radial-gradient(circle at 80% 0%, hsl(266 77% 60% / .18), transparent 32%), var(--bg); color: var(--text); box-shadow: 0 20px 60px hsl(232 30% 4% / .24); }
    .notion-harness-loop * { box-sizing: border-box; }
    .notion-harness-loop .head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; border-bottom: 1px solid var(--border); padding: 1.4rem 1.5rem 1.1rem; }
    .notion-harness-loop .eyebrow { margin: 0 0 .35rem; color: hsl(179 79% 69%); font-size: .72rem; font-weight: 800; letter-spacing: .11em; }
    .notion-harness-loop h2 { margin: 0; color: var(--text); font-size: 1.35rem; line-height: 1.35; }
    .notion-harness-loop .counter { border: 1px solid hsl(266 70% 64% / .55); border-radius: 10px; background: hsl(266 70% 60% / .1); padding: .5rem .7rem; color: var(--muted); font-family: ui-monospace, monospace; font-size: .68rem; line-height: 1.5; text-align: right; }
    .notion-harness-loop .counter strong { color: hsl(266 85% 81%); }
    .notion-harness-loop .lane { display: grid; grid-template-columns: minmax(8rem, .9fr) 1.5rem minmax(10rem, 1.1fr) 1.5rem minmax(9rem, 1fr); grid-template-areas: "start a1 first a2 tool" ". . return return return" "second a3 end . ."; gap: .75rem; padding: 1.35rem 1.5rem; }
    .notion-harness-loop .boundary, .notion-harness-loop .step, .notion-harness-loop .tool { min-height: 10.5rem; border: 1px solid var(--border); border-radius: 12px; background: var(--card); padding: .95rem; }
    .notion-harness-loop .start { grid-area: start; } .notion-harness-loop .first { grid-area: first; } .notion-harness-loop .tool { grid-area: tool; } .notion-harness-loop .return { grid-area: return; } .notion-harness-loop .second { grid-area: second; } .notion-harness-loop .end { grid-area: end; }
    .notion-harness-loop .a1 { grid-area: a1; } .notion-harness-loop .a2 { grid-area: a2; } .notion-harness-loop .a3 { grid-area: a3; }
    .notion-harness-loop .boundary small, .notion-harness-loop .step small, .notion-harness-loop .tool small { display: inline-block; border-radius: 999px; padding: .2rem .48rem; font-family: ui-monospace, monospace; font-size: .66rem; font-weight: 800; }
    .notion-harness-loop .boundary small { background: hsl(179 56% 20%); color: hsl(179 75% 72%); }
    .notion-harness-loop .step small { background: hsl(266 52% 23%); color: hsl(266 84% 81%); }
    .notion-harness-loop .tool small { background: hsl(29 65% 23%); color: hsl(33 91% 75%); }
    .notion-harness-loop .boundary strong, .notion-harness-loop .step strong, .notion-harness-loop .tool strong { display: block; margin-top: .7rem; color: var(--text); font-size: .94rem; }
    .notion-harness-loop .boundary p, .notion-harness-loop .tool p, .notion-harness-loop .step li { color: var(--muted); font-size: .78rem; line-height: 1.55; }
    .notion-harness-loop .boundary p, .notion-harness-loop .tool p { margin: .45rem 0 0; }
    .notion-harness-loop .step ol { margin: .55rem 0 0; padding-left: 1.1rem; }
    .notion-harness-loop .arrow { display: grid; place-items: center; color: hsl(179 74% 67%); font-size: 1.15rem; }
    .notion-harness-loop .return { position: relative; height: 2.2rem; border-right: 1px dashed hsl(29 80% 62%); border-bottom: 1px dashed hsl(29 80% 62%); border-left: 1px dashed hsl(29 80% 62%); border-radius: 0 0 12px 12px; }
    .notion-harness-loop .return span { position: absolute; right: 1rem; bottom: -.65rem; border-radius: 999px; background: var(--bg); padding: .18rem .5rem; color: hsl(33 91% 75%); font-size: .68rem; }
    .notion-harness-loop .foot { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; border-top: 1px solid var(--border); background: var(--border); }
    .notion-harness-loop .foot div { min-height: 5.3rem; background: hsl(232 22% 11%); padding: .9rem 1.2rem; }
    .notion-harness-loop .foot strong, .notion-harness-loop .foot span { display: block; }
    .notion-harness-loop .foot strong { color: hsl(179 79% 69%); font-size: .8rem; }
    .notion-harness-loop .foot span { margin-top: .3rem; color: var(--muted); font-size: .76rem; line-height: 1.5; }
    @media (max-width: 760px) { .notion-harness-loop .head { display: block; padding-right: 1rem; padding-left: 1rem; } .notion-harness-loop .counter { display: inline-block; margin-top: .8rem; text-align: left; } .notion-harness-loop .lane { display: block; padding-right: 1rem; padding-left: 1rem; } .notion-harness-loop .boundary, .notion-harness-loop .step, .notion-harness-loop .tool { min-height: 0; margin-bottom: .75rem; } .notion-harness-loop .arrow, .notion-harness-loop .return { display: none; } .notion-harness-loop .foot { grid-template-columns: 1fr; } }
  </style>
  <div class="head"><div><p class="eyebrow">TURN / STEP STATE MACHINE</p><h2>一次 Turn，为什么会调用模型多次？</h2></div><div class="counter">1 TURN<br><strong>2+ STEPS</strong></div></div>
  <div class="lane">
    <div class="boundary start"><small>TURN START</small><strong>领取用户输入</strong><p>followup 与 pending steering 从 inbox 进入当前轮次。</p></div><div class="arrow a1">→</div>
    <div class="step first"><small>STEP 1</small><strong>模型决定调用工具</strong><ol><li>组装 Prompt 与 Tool Schema</li><li>LLM 流式输出</li><li>生成 tool-call</li></ol></div><div class="arrow a2">→</div>
    <div class="tool"><small>TOOL PIPELINE</small><strong>执行并记录结果</strong><p>审批、Guard、执行、post hook，最终写入 tool/result。</p></div>
    <div class="return"><span>工具结果回到上下文</span></div>
    <div class="step second"><small>STEP 2</small><strong>模型基于新证据继续</strong><ol><li>从 Session 派生历史</li><li>读到工具结果</li><li>继续工具或最终回答</li></ol></div><div class="arrow a3">→</div>
    <div class="boundary end"><small>TURN END</small><strong>不再欠下工作</strong><p>没有工具 continuation 与 steering，关闭轮次。</p></div>
  </div>
  <div class="foot"><div><strong>Turn</strong><span>任务交互边界，可能包含多个 Step。</span></div><div><strong>Step</strong><span>一次模型请求，加上它要求执行的工具。</span></div><div><strong>Session</strong><span>每个边界与模型可见事实都追加到日志。</span></div></div>
</section>`

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

const AGENT_TURN_TIMELINE_HTML = `<section class="notion-agent-turn-trace" aria-label="一次 Agent Run 的事件时序">
  <style>
    .notion-agent-turn-trace { --bg: hsl(240 16% 8%); --card: hsl(240 13% 12%); --border: hsl(240 10% 24%); --text: hsl(0 0% 96%); --muted: hsl(240 7% 68%); --cyan: hsl(184 85% 66%); --violet: hsl(259 83% 78%); --orange: hsl(29 94% 69%); margin: 2.5rem 0; overflow: hidden; border: 1px solid var(--border); border-radius: 18px; background: radial-gradient(circle at 100% 0%, hsl(259 70% 60% / .13), transparent 32%), var(--bg); color: var(--text); box-shadow: 0 18px 55px hsl(240 30% 4% / .24); }
    .notion-agent-turn-trace * { box-sizing: border-box; }
    .notion-agent-turn-trace .head { display: flex; justify-content: space-between; gap: 1rem; padding: 1.5rem 1.5rem 1rem; }
    .notion-agent-turn-trace .eyebrow, .notion-agent-turn-trace .label { color: var(--cyan); font: .65rem/1.2 ui-monospace, SFMono-Regular, Menlo, monospace; letter-spacing: .08em; text-transform: uppercase; }
    .notion-agent-turn-trace .eyebrow { margin: 0 0 .45rem; }
    .notion-agent-turn-trace h2 { margin: 0; color: var(--text); font-size: 1.35rem; line-height: 1.35; }
    .notion-agent-turn-trace .intro { max-width: 44rem; margin: .6rem 0 0; color: var(--muted); font-size: .88rem; line-height: 1.7; }
    .notion-agent-turn-trace .pill { flex: 0 0 auto; border: 1px solid hsl(151 65% 62% / .25); border-radius: 10px; background: hsl(151 65% 62% / .09); padding: .55rem .7rem; color: hsl(151 65% 62%); font: .65rem/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; white-space: nowrap; }
    .notion-agent-turn-trace .pill small { display: block; color: hsl(151 35% 72%); }
    .notion-agent-turn-trace .stages { display: flex; align-items: center; gap: .4rem; margin: 0 1.5rem 1.4rem; overflow-x: auto; border: 1px solid hsl(240 10% 24% / .8); border-radius: 11px; background: hsl(240 20% 5% / .5); padding: .75rem; }
    .notion-agent-turn-trace .stage { min-width: 6rem; border-left: 2px solid hsl(151 65% 62%); padding: .2rem .45rem; }
    .notion-agent-turn-trace .stage.turn { border-color: var(--violet); }
    .notion-agent-turn-trace .stage.tool { border-color: var(--orange); }
    .notion-agent-turn-trace .stage strong, .notion-agent-turn-trace .stage small { display: block; white-space: nowrap; }
    .notion-agent-turn-trace .stage strong { color: var(--text); font-size: .7rem; }
    .notion-agent-turn-trace .stage small { margin-top: .16rem; color: var(--muted); font-size: .6rem; }
    .notion-agent-turn-trace .arrow { color: hsl(240 7% 48%); }
    .notion-agent-turn-trace .grid { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(14rem, .65fr); gap: 1rem; padding: 0 1.5rem 1.4rem; }
    .notion-agent-turn-trace ol { position: relative; margin: 0; padding: 0; list-style: none; }
    .notion-agent-turn-trace ol::before { content: ''; position: absolute; top: 1.2rem; bottom: 1.2rem; left: .85rem; width: 1px; background: linear-gradient(var(--cyan), var(--violet) 45%, var(--orange) 70%, var(--cyan)); opacity: .55; }
    .notion-agent-turn-trace li { position: relative; display: grid; grid-template-columns: 1.7rem minmax(0, 1fr); gap: .7rem; align-items: start; padding: .22rem 0; }
    .notion-agent-turn-trace .number { z-index: 1; display: grid; width: 1.7rem; height: 1.7rem; place-items: center; border: 1px solid var(--border); border-radius: 7px; background: var(--bg); color: hsl(240 7% 50%); font: .55rem ui-monospace, SFMono-Regular, Menlo, monospace; }
    .notion-agent-turn-trace li.turn .number { border-color: hsl(259 83% 78% / .5); }
    .notion-agent-turn-trace li.tool .number { border-color: hsl(29 94% 69% / .5); }
    .notion-agent-turn-trace details { border: 1px solid var(--border); border-radius: 9px; background: var(--card); }
    .notion-agent-turn-trace details[open] { border-color: hsl(184 85% 66% / .42); background: linear-gradient(100deg, hsl(184 85% 66% / .1), var(--card)); }
    .notion-agent-turn-trace summary { cursor: pointer; padding: .62rem .75rem; color: var(--text); font-size: .78rem; font-weight: 600; }
    .notion-agent-turn-trace summary::marker { color: var(--cyan); }
    .notion-agent-turn-trace .label { display: block; margin-bottom: .18rem; color: hsl(240 7% 52%); font-size: .55rem; }
    .notion-agent-turn-trace .copy { margin: 0; border-top: 1px solid hsl(240 10% 24% / .75); padding: .65rem .75rem .75rem; color: var(--muted); font-size: .72rem; line-height: 1.65; }
    .notion-agent-turn-trace code { display: block; overflow-wrap: anywhere; margin-top: .45rem; border: 1px solid hsl(240 10% 24%); border-radius: 6px; background: hsl(240 20% 5% / .72); padding: .42rem .5rem; color: hsl(151 65% 62%); font: .6rem/1.5 ui-monospace, SFMono-Regular, Menlo, monospace; }
    .notion-agent-turn-trace aside { align-self: start; border: 1px solid var(--border); border-radius: 11px; background: hsl(240 13% 15% / .82); padding: 1rem; }
    .notion-agent-turn-trace aside h3 { margin: 0 0 .65rem; color: var(--text); font-size: .95rem; }
    .notion-agent-turn-trace aside p { margin: 0 0 .7rem; color: var(--muted); font-size: .75rem; line-height: 1.7; }
    .notion-agent-turn-trace .rule { margin-top: .7rem; border-top: 1px solid var(--border); padding-top: .7rem; color: var(--cyan); font: .6rem/1.6 ui-monospace, SFMono-Regular, Menlo, monospace; }
    .notion-agent-turn-trace .foot { display: flex; gap: .55rem; margin: 0 1.5rem 1.5rem; border-top: 1px solid hsl(240 10% 24% / .8); padding-top: 1rem; color: var(--muted); font-size: .74rem; line-height: 1.65; }
    .notion-agent-turn-trace .foot strong { color: var(--text); }
    @media (max-width: 720px) { .notion-agent-turn-trace .head { display: block; padding: 1.1rem 1rem .9rem; } .notion-agent-turn-trace .pill { width: fit-content; margin-top: .8rem; } .notion-agent-turn-trace .stages { margin-right: 1rem; margin-left: 1rem; } .notion-agent-turn-trace .grid { display: block; padding: 0 1rem 1rem; } .notion-agent-turn-trace aside { margin-top: .8rem; } .notion-agent-turn-trace .foot { margin-right: 1rem; margin-left: 1rem; } }
  </style>
  <div class="head"><div><p class="eyebrow">event trace / 01</p><h2>一次 Agent Run，沿时间发生了什么？</h2><p class="intro">把抽象的 Loop 拆成可观察事件。展开任意节点，可以看到它的职责、事件名和典型数据。</p></div><div class="pill">● 1 RUN<small>2 TURNS · 1 TOOL</small></div></div>
  <div class="stages" aria-label="运行阶段概览"><div class="stage"><strong>Agent Run</strong><small>任务边界</small></div><span class="arrow">→</span><div class="stage turn"><strong>Turn 1</strong><small>请求工具</small></div><span class="arrow">→</span><div class="stage tool"><strong>Tool</strong><small>执行 read</small></div><span class="arrow">→</span><div class="stage turn"><strong>Turn 2</strong><small>最终回答</small></div><span class="arrow">→</span><div class="stage"><strong>Agent End</strong><small>保存恢复</small></div></div>
  <div class="grid"><ol>
    <li><span class="number">01</span><details open><summary><span class="label">Agent Run · lifecycle</span>Agent Start</summary><p class="copy">整次任务的起点，建立 Session、取消信号、事件订阅和运行统计。<code>agent_start · runId · sessionId · prompt</code></p></details></li>
    <li class="turn"><span class="number">02</span><details><summary><span class="label">Turn 1 · model call</span>Turn Start</summary><p class="copy">第一次模型调用开始。模型看到当前上下文、工具定义和前面的消息，决定下一步动作。<code>turn_start · model · contextTokens</code></p></details></li>
    <li class="turn"><span class="number">03</span><details><summary><span class="label">Turn 1 · assistant stream</span>Message Start</summary><p class="copy">创建正在生成的 Assistant 消息，UI 可以先画出空消息壳，但它还不是最终持久消息。<code>message_start · messageId · role=assistant</code></p></details></li>
    <li class="turn"><span class="number">04</span><details><summary><span class="label">Turn 1 · assistant stream</span>Message Update × N</summary><p class="copy">文本、思考、工具名和参数以增量到达，适合驱动实时渲染。<code>message_update · delta=text|thinking|toolCall</code></p></details></li>
    <li class="turn"><span class="number">05</span><details><summary><span class="label">Turn 1 · assistant stream</span>Message End</summary><p class="copy">Assistant 流式消息收束，但不代表任务完成，因为这条消息可能刚刚提出了工具调用。<code>message_end · stopReason=toolUse</code></p></details></li>
    <li class="tool"><span class="number">06</span><details><summary><span class="label">Tool Execution · start</span>Tool Execution Start</summary><p class="copy">运行时校验参数、检查权限，并把结构化调用交给真正的工具函数。<code>tool_execution_start · tool=read · path=src/...</code></p></details></li>
    <li class="tool"><span class="number">07</span><details><summary><span class="label">Tool Execution · progress</span>Tool Execution Update × N</summary><p class="copy">长时间工具持续报告进度，例如已读取多少文件、测试运行到哪个阶段。<code>tool_execution_update · progress · stdout</code></p></details></li>
    <li class="tool"><span class="number">08</span><details><summary><span class="label">Tool Execution · end</span>Tool Execution End</summary><p class="copy">工具结束，得到成功、失败或取消结果；结果必须结构化，模型才能修正行动。<code>tool_execution_end · isError · durationMs</code></p></details></li>
    <li><span class="number">09</span><details><summary><span class="label">Run boundary · context</span>Tool Result 入上下文</summary><p class="copy">工具结果被追加成新消息，成为下一次模型调用可以读取的事实。<code>message_added · role=tool · content</code></p></details></li>
    <li class="turn"><span class="number">10</span><details><summary><span class="label">Turn 2 · model call</span>Turn Start</summary><p class="copy">第二次模型调用开始。上下文里已经有 Tool Result，模型可以继续调用工具，也可以直接收束。<code>turn_start · turnId=2 · context += toolResult</code></p></details></li>
    <li class="turn"><span class="number">11</span><details><summary><span class="label">Turn 2 · assistant stream</span>Message Start → Update → End</summary><p class="copy">第二条 Assistant 消息流式完成；这次 stopReason 不是 toolUse，所以循环可以退出。<code>message_start · update × N · message_end · stop</code></p></details></li>
    <li><span class="number">12</span><details><summary><span class="label">Agent Run · lifecycle</span>Turn End → Agent End</summary><p class="copy">只有模型不再请求工具时，运行时才发出 Turn End，随后 Agent End 标记任务结束。<code>turn_end · agent_end · usage · finalState</code></p></details></li>
  </ol><aside><h3>关键边界</h3><p>Tool Result 会进入上下文，才会开启下一个 Turn；如果模型继续请求工具，就从 Turn Start 再次循环。</p><p>流式内容、工具进度和最终持久消息处于不同阶段，UI 应订阅事件，而不是只轮询消息数组。</p><div class="rule">NO TOOL CALL → TURN END → AGENT END</div></aside></div>
  <div class="foot"><span aria-hidden="true">↳</span><span><strong>可观测性：</strong>Run 有多少 Turn、每个 Turn 的模型延迟、工具占用时间、哪次 Tool Result 后发生重试，都可以从这条事件流自然计算出来。</span></div>
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
    .replaceAll(`<p>${AGENT_TURN_TIMELINE_MARKER}</p>`, AGENT_TURN_TIMELINE_HTML)
    .replaceAll(
      `<p>${DEEPSEEK_HARNESS_ARCHITECTURE_MARKER}</p>`,
      DEEPSEEK_HARNESS_ARCHITECTURE_HTML
    )
    .replaceAll(`<p>${DEEPSEEK_HARNESS_LOOP_MARKER}</p>`, DEEPSEEK_HARNESS_LOOP_HTML)
}
