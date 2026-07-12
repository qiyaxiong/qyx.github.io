const CODEX_TOOL_DESIGN_MARKER = '{{codex-tool-design-map}}'

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

export function renderNotionEmbeds(html: string): string {
  return html.replaceAll(`<p>${CODEX_TOOL_DESIGN_MARKER}</p>`, CODEX_TOOL_DESIGN_HTML)
}
