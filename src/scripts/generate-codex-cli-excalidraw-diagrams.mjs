import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const sourceDir = join(root, 'docs/diagrams/codex-cli')
const outputDir = join(root, 'public/images/blog/codex-cli')

const p = {
  paper: '#fffdf7', ink: '#263238', muted: '#667085', white: '#ffffff',
  blue: '#dbeafe', blueStroke: '#2563eb', violet: '#ede9fe', violetStroke: '#7c3aed',
  teal: '#ccfbf1', tealStroke: '#0f766e', amber: '#fef3c7', amberStroke: '#b45309',
  rose: '#fce7f3', roseStroke: '#be185d',
}
const font = "'Comic Sans MS','Bradley Hand','Marker Felt','PingFang SC','Microsoft YaHei',sans-serif"

const esc = (v) => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const addText = (a, id, x, y, value, o = {}) => a.push({ type: 'text', id, x, y, text: value, size: o.size ?? 19, color: o.color ?? p.ink, weight: o.weight ?? 400, align: o.align ?? 'start' })
const addBox = (a, id, x, y, w, h, value, fill, stroke, o = {}) => a.push({ type: 'box', id, x, y, w, h, text: value, fill, stroke, size: o.size ?? 17, weight: o.weight ?? 600, radius: o.radius ?? 18, dash: o.dash ?? '' })
const addArrow = (a, id, x1, y1, x2, y2, o = {}) => a.push({ type: 'arrow', id, x1, y1, x2, y2, color: o.color ?? p.ink, width: o.width ?? 2.5, dash: o.dash ?? '', label: o.label ?? '', labelX: o.labelX, labelY: o.labelY })
function svgText(value, x, y, size, color, weight, align = 'start') {
  const anchor = align === 'middle' ? 'middle' : align === 'end' ? 'end' : 'start'
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="${font}" font-size="${size}" font-weight="${weight}">${String(value).split('\n').map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.24 : 0}">${esc(line)}</tspan>`).join('')}</text>`
}

function renderSvg(item) {
  if (item.type === 'text') return svgText(item.text, item.x, item.y, item.size, item.color, item.weight, item.align)
  if (item.type === 'box') {
    const lines = item.text.split('\n')
    const startY = item.y + item.h / 2 - ((lines.length - 1) * item.size * 1.24) / 2 + item.size * 0.34
    return `<rect x="${item.x}" y="${item.y}" width="${item.w}" height="${item.h}" rx="${item.radius}" fill="${item.fill}" stroke="${item.stroke}" stroke-width="2.5"${item.dash ? ` stroke-dasharray="${item.dash}"` : ''}/>${item.text ? svgText(item.text, item.x + item.w / 2, startY, item.size, p.ink, item.weight, 'middle') : ''}`
  }
  if (item.type === 'line') return `<path d="M ${item.x1} ${item.y1} L ${item.x2} ${item.y2}" fill="none" stroke="${item.color}" stroke-width="${item.width}" stroke-linecap="round"${item.dash ? ` stroke-dasharray="${item.dash}"` : ''}/>`
  const angle = Math.atan2(item.y2 - item.y1, item.x2 - item.x1)
  const s = 10
  const head = `${item.x2 - s * Math.cos(angle - Math.PI / 6)},${item.y2 - s * Math.sin(angle - Math.PI / 6)} ${item.x2},${item.y2} ${item.x2 - s * Math.cos(angle + Math.PI / 6)},${item.y2 - s * Math.sin(angle + Math.PI / 6)}`
  const path = `<path d="M ${item.x1} ${item.y1} L ${item.x2} ${item.y2}" fill="none" stroke="${item.color}" stroke-width="${item.width}" stroke-linecap="round"${item.dash ? ` stroke-dasharray="${item.dash}"` : ''}/><polyline points="${head}" fill="none" stroke="${item.color}" stroke-width="${item.width}"/>`
  if (!item.label) return path
  return `${path}${svgText(item.label, item.labelX ?? (item.x1 + item.x2) / 2, item.labelY ?? (item.y1 + item.y2) / 2 - 10, 14, p.muted, 400, 'middle')}`
}

function base(type, id, props) {
  return { id, type, x: props.x, y: props.y, width: props.width, height: props.height, angle: 0, strokeColor: props.strokeColor ?? p.ink, backgroundColor: props.backgroundColor ?? 'transparent', fillStyle: 'solid', strokeWidth: props.strokeWidth ?? 2, strokeStyle: props.strokeStyle ?? 'solid', roughness: props.roughness ?? 1, opacity: 100, groupIds: [], frameId: null, index: null, roundness: props.roundness ?? null, seed: Math.abs([...id].reduce((n, c) => ((n * 31) + c.charCodeAt(0)) | 0, 17)), version: 1, versionNonce: 1, isDeleted: false, boundElements: props.boundElements ?? null, updated: 1, link: null, locked: false, ...props.extra }
}

function toExcalidraw(item) {
  if (item.type === 'text') {
    const lines = item.text.split('\n'); const width = Math.max(...lines.map((v) => v.length)) * item.size
    return [base('text', item.id, { x: item.x - (item.align === 'middle' ? width / 2 : item.align === 'end' ? width : 0), y: item.y - item.size, width, height: lines.length * item.size * 1.25, strokeColor: item.color, strokeWidth: 1, roughness: 0, extra: { text: item.text, fontSize: item.size, fontFamily: 1, textAlign: item.align === 'middle' ? 'center' : item.align === 'end' ? 'right' : 'left', verticalAlign: 'top', containerId: null, originalText: item.text, autoResize: true, lineHeight: 1.25 } })]
  }
  if (item.type === 'box') {
    const labelId = `${item.id}-label`
    const rect = base('rectangle', item.id, { x: item.x, y: item.y, width: item.w, height: item.h, strokeColor: item.stroke, backgroundColor: item.fill, strokeStyle: item.dash ? 'dashed' : 'solid', roundness: { type: 3 }, boundElements: item.text ? [{ type: 'text', id: labelId }] : null })
    if (!item.text) return [rect]
    return [rect, base('text', labelId, { x: item.x + 12, y: item.y + 10, width: item.w - 24, height: item.h - 20, strokeColor: p.ink, strokeWidth: 1, roughness: 0, extra: { text: item.text, fontSize: item.size, fontFamily: 1, textAlign: 'center', verticalAlign: 'middle', containerId: item.id, originalText: item.text, autoResize: true, lineHeight: 1.25 } })]
  }
  const width = item.x2 - item.x1; const height = item.y2 - item.y1
  return [base(item.type, item.id, { x: item.x1, y: item.y1, width, height, strokeColor: item.color, strokeWidth: item.width, strokeStyle: item.dash ? 'dashed' : 'solid', roundness: { type: 2 }, extra: { points: [[0, 0], [width, height]], startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: item.type === 'arrow' ? 'arrow' : null, elbowed: false } })]
}

async function writeDiagram(name, width, height, title, desc, items) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(desc)}</desc><rect width="${width}" height="${height}" fill="${p.paper}"/>${items.map(renderSvg).join('')}</svg>\n`
  const source = { type: 'excalidraw', version: 2, source: 'codex-excalidraw-architecture-skill', elements: items.flatMap(toExcalidraw), appState: { viewBackgroundColor: p.paper, gridSize: null, gridStep: 5 }, files: {}, metadata: { width, height, title, sourceSnapshot: 'openai/codex@5adb68a (rust-v0.152.1)' } }
  await writeFile(join(outputDir, `${name}.svg`), svg)
  await writeFile(join(sourceDir, `${name}.excalidraw`), `${JSON.stringify(source, null, 2)}\n`)
}

await mkdir(sourceDir, { recursive: true })
await mkdir(outputDir, { recursive: true })

// 1. Product entry points and shared runtime.
{
  const a = []
  addText(a, 'title', 48, 58, 'Codex CLI 不是一个 Loop，而是一组入口共用一个 Agent Runtime', { size: 32, weight: 700 })
  addText(a, 'sub', 50, 94, 'cli/main.rs 只做解析与分发；交互、自动化和宿主协议最终都落到 codex-core。', { size: 17, color: p.muted })
  addBox(a, 'outer', 45, 130, 1510, 690, '', p.white, p.ink, { radius: 28 })
  addText(a, 'outer-title', 78, 174, 'Codex 本地运行系统', { size: 24, weight: 700 })
  const entries = [
    ['tui', 95, 'codex\n交互 TUI', p.blue, p.blueStroke],
    ['exec', 355, 'codex exec\n非交互 / JSONL', p.blue, p.blueStroke],
    ['review', 615, 'codex review\n专用自动化入口', p.blue, p.blueStroke],
    ['app', 875, 'codex app-server\nJSON-RPC 宿主边界', p.amber, p.amberStroke],
    ['mcp', 1135, 'mcp-server / tools\n扩展与互操作', p.amber, p.amberStroke],
  ]
  for (const [id, x, label, fill, stroke] of entries) addBox(a, id, x, 220, 220, 86, label, fill, stroke, { size: 17 })
  addText(a, 'adapter-label', 78, 360, 'Host / Adapter 层：不同交互方式，不复制 Agent 逻辑', { size: 18, color: p.blueStroke, weight: 700 })
  addBox(a, 'manager', 170, 400, 1210, 100, 'ThreadManager + CodexThread\nstart · resume · fork · submit(Op) · next_event()', p.violet, p.violetStroke, { size: 20 })
  addBox(a, 'core', 170, 555, 1210, 155, 'codex-core / Session\nTurn loop · context · model stream · ToolRouter · hooks · approvals · cancellation', p.teal, p.tealStroke, { size: 21 })
  for (let i = 0; i < entries.length; i++) addArrow(a, `e-${i}`, 205 + i * 260, 306, 300 + i * 220, 394, { color: i < 3 ? p.blueStroke : p.amberStroke })
  addArrow(a, 'm-core', 775, 500, 775, 549, { color: p.violetStroke, label: 'shared runtime API', labelX: 880, labelY: 535 })
  addText(a, 'footer', 800, 780, '关键判断：TUI 可以被替换，App Server 可以远程化，但 Thread / Turn / Tool 的语义仍由 Core 决定。', { size: 18, weight: 700, align: 'middle' })
  await writeDiagram('codex-cli-layer-map', 1600, 860, 'Codex CLI 分层架构', '展示多种命令入口、ThreadManager 和 codex-core 运行时的依赖关系。', a)
}

// 2. One user turn contains repeated sampling steps.
{
  const a = []
  addText(a, 'title', 48, 58, '一次用户 Turn，内部可能跑很多次 Sampling Step', { size: 32, weight: 700 })
  addText(a, 'sub', 50, 94, '模型只要返回 Tool Call，Core 就执行工具、记录结果，再带着新历史发起下一次采样。', { size: 17, color: p.muted })
  const rows = [
    ['input', 75, 170, '① 接受输入', 'TurnInput + pending input\nhooks / skills / plugin mentions', p.blue, p.blueStroke],
    ['snapshot', 405, 170, '② 固定 Step 快照', 'StepContext\nmodel · tools · permissions · env', p.violet, p.violetStroke],
    ['sample', 735, 170, '③ 请求模型', 'history.for_prompt()\nResponses stream', p.violet, p.violetStroke],
    ['route', 1065, 170, '④ 解析输出', 'message / reasoning\nor tool call', p.amber, p.amberStroke],
  ]
  for (const [id, x, y, title, body, fill, stroke] of rows) { addText(a, `${id}-t`, x + 125, y - 18, title, { size: 19, weight: 700, align: 'middle', color: stroke }); addBox(a, id, x, y, 250, 112, body, fill, stroke, { size: 16 }) }
  for (let i = 0; i < 3; i++) addArrow(a, `top-${i}`, 325 + i * 330, 226, 399 + i * 330, 226, { color: p.ink })
  addBox(a, 'tool-branch', 1030, 365, 320, 104, 'Tool Call\n先持久化 call，再异步执行', p.rose, p.roseStroke, { size: 18 })
  addBox(a, 'tool-result', 650, 365, 300, 104, 'Tool Result\n进入 history + Event', p.teal, p.tealStroke, { size: 18 })
  addBox(a, 'assistant', 1030, 575, 320, 104, 'Assistant Final\n没有 follow-up → Turn 完成', p.teal, p.tealStroke, { size: 18 })
  addArrow(a, 'route-tool', 1190, 282, 1190, 359, { color: p.roseStroke, label: '有工具', labelX: 1245, labelY: 330 })
  addArrow(a, 'tool-result-a', 1030, 417, 956, 417, { color: p.tealStroke })
  addArrow(a, 'loop-up', 650, 417, 530, 288, { color: p.violetStroke, label: 'needs_follow_up = true', labelX: 540, labelY: 365 })
  addArrow(a, 'route-final', 1310, 282, 1310, 569, { color: p.tealStroke, label: '仅最终回答', labelX: 1390, labelY: 430 })
  addBox(a, 'compact', 90, 575, 640, 104, '上下文接近上限且仍需继续\n→ inline compaction → 保持同一 Turn，再进入下一 Step', p.amber, p.amberStroke, { size: 18 })
  addArrow(a, 'compact-loop', 410, 575, 480, 288, { color: p.amberStroke, dash: '8 6' })
  addBox(a, 'boundary', 170, 745, 1260, 60, '公开协议用 Thread → Turn → Item；StepContext 是 Core 内部“本次采样看到的世界”，不是另一个用户会话。', p.white, p.ink, { size: 18 })
  await writeDiagram('codex-turn-sampling-loop', 1600, 850, 'Codex 一次 Turn 的内部循环', '展示 Turn 内部的 StepContext、模型采样、工具执行、follow-up 与压缩。', a)
}

// 3. Tool execution and safety boundaries.
{
  const a = []
  addText(a, 'title', 48, 58, 'Tool Call：通用生命周期包裹具体工具，审批与沙箱由工具运行时落实', { size: 31, weight: 700 })
  addText(a, 'sub', 50, 94, '这不是一条“所有工具都完全相同”的流水线：Router 管生命周期，exec / MCP 等 Handler 决定自己的安全细节。', { size: 17, color: p.muted })
  const nodes = [
    ['call', 55, 'ResponseItem\nFunctionCall', p.blue, p.blueStroke],
    ['build', 285, 'ToolRouter\nbuild_tool_call', p.blue, p.blueStroke],
    ['pre', 515, 'PreToolUse Hook\nblock / rewrite', p.amber, p.amberStroke],
    ['parallel', 745, '并发闸门\nread / write lock', p.violet, p.violetStroke],
    ['handler', 975, '具体 Handler\napproval + sandbox', p.rose, p.roseStroke],
    ['post', 1205, 'PostToolUse Hook\nfeedback / block result', p.amber, p.amberStroke],
  ]
  for (const [id, x, label, fill, stroke] of nodes) addBox(a, id, x, 190, 190, 92, label, fill, stroke, { size: 15 })
  for (let i = 0; i < nodes.length - 1; i++) addArrow(a, `n-${i}`, 245 + i * 230, 236, 279 + i * 230, 236, { color: p.ink })
  addBox(a, 'exec-zone', 760, 365, 590, 260, '', '#fff7f9', p.roseStroke, { dash: '9 7', radius: 24 })
  addText(a, 'exec-title', 1055, 405, '以 exec_command 为例：安全决策在 Handler 内', { size: 21, weight: 700, align: 'middle', color: p.roseStroke })
  addBox(a, 'parse', 800, 445, 150, 70, '解析参数\n解析 cwd / env', p.white, p.roseStroke, { size: 14 })
  addBox(a, 'policy', 980, 445, 150, 70, 'ExecPolicy\n是否需审批', p.white, p.roseStroke, { size: 14 })
  addBox(a, 'approval', 1160, 445, 150, 70, 'Approval\n缓存会话决定', p.white, p.roseStroke, { size: 14 })
  addBox(a, 'sandbox', 890, 545, 240, 58, 'SandboxManager\nSeatbelt / Landlock / Windows', p.rose, p.roseStroke, { size: 14 })
  addBox(a, 'retry', 1160, 545, 150, 58, '失败后按策略\n升级 / 返回模型', p.white, p.roseStroke, { size: 13 })
  addArrow(a, 'p-pol', 950, 480, 974, 480, { color: p.roseStroke }); addArrow(a, 'pol-app', 1130, 480, 1154, 480, { color: p.roseStroke }); addArrow(a, 'app-san', 1235, 515, 1125, 539, { color: p.roseStroke }); addArrow(a, 'san-retry', 1130, 574, 1154, 574, { color: p.roseStroke })
  addArrow(a, 'handler-zone', 1070, 282, 1070, 359, { color: p.roseStroke, dash: '8 6' })
  addBox(a, 'result', 250, 700, 1100, 74, 'AnyToolResult → tool finish lifecycle → ResponseItemEnvelope → history → 下一次模型采样', p.teal, p.tealStroke, { size: 19 })
  addArrow(a, 'post-result', 1300, 282, 1300, 694, { color: p.tealStroke })
  addText(a, 'note', 250, 835, '取消边界：若工具尚未到 terminal outcome，CancellationToken 会中止任务并生成 aborted result；已完成结果不会被伪装成“未执行”。', { size: 17, weight: 700 })
  await writeDiagram('codex-tool-safety-pipeline', 1600, 890, 'Codex Tool Call 与安全流水线', '展示 ToolRouter 生命周期、具体 Handler 的审批与沙箱职责，以及取消和结果回灌。', a)
}

// 4. State model and recovery.
{
  const a = []
  addText(a, 'title', 48, 58, 'Thread → Turn → Item：UI 状态与持久历史通过事件连接', { size: 32, weight: 700 })
  addText(a, 'sub', 50, 94, 'App Server 暴露对象生命周期；Core 同时把关键事实追加到 rollout，SQLite 主要承担索引与投影。', { size: 17, color: p.muted })
  addBox(a, 'thread', 55, 145, 900, 560, '', '#f8fbff', p.blueStroke, { radius: 26 })
  addText(a, 'thread-title', 90, 190, 'Thread  thr_123', { size: 25, weight: 700, color: p.blueStroke })
  addBox(a, 'turn1', 100, 230, 375, 390, '', p.white, p.violetStroke, { radius: 22 })
  addText(a, 'turn1-title', 130, 275, 'Turn 1 · completed', { size: 20, weight: 700, color: p.violetStroke })
  addBox(a, 'u1', 135, 315, 305, 56, 'Item · userMessage', p.blue, p.blueStroke, { size: 16 })
  addBox(a, 'c1', 135, 395, 305, 72, 'Item · commandExecution\nstarted → delta* → completed', p.amber, p.amberStroke, { size: 15 })
  addBox(a, 'a1', 135, 492, 305, 72, 'Item · agentMessage\ndelta* → authoritative completed', p.teal, p.tealStroke, { size: 15 })
  addBox(a, 'turn2', 520, 230, 375, 390, '', p.white, p.violetStroke, { radius: 22 })
  addText(a, 'turn2-title', 550, 275, 'Turn 2 · interrupted', { size: 20, weight: 700, color: p.violetStroke })
  addBox(a, 'u2', 555, 315, 305, 56, 'Item · userMessage', p.blue, p.blueStroke, { size: 16 })
  addBox(a, 'r2', 555, 395, 305, 72, 'Item · reasoning\nstreaming lifecycle', p.violet, p.violetStroke, { size: 15 })
  addBox(a, 'err2', 555, 492, 305, 72, 'Turn status\ninterrupted / failed / completed', p.rose, p.roseStroke, { size: 15 })
  addBox(a, 'wire', 1015, 145, 520, 210, '', '#fffaf0', p.amberStroke, { radius: 24 })
  addText(a, 'wire-title', 1275, 190, 'App Server：双向 JSON-RPC', { size: 22, weight: 700, align: 'middle' })
  addText(a, 'wire-body', 1060, 240, 'request / response：thread/start、turn/start\nnotification：item/started、delta、completed\nserver request：approval、user input、dynamic tool', { size: 17 })
  addBox(a, 'rollout', 1015, 405, 245, 176, 'Rollout JSONL\n追加式会话事实\nresume / fork / inspect', p.teal, p.tealStroke, { size: 18 })
  addBox(a, 'sqlite', 1290, 405, 245, 176, 'SQLite State\nmetadata index\nlist / search / projections', p.violet, p.violetStroke, { size: 18 })
  addArrow(a, 'events', 955, 250, 1009, 250, { color: p.amberStroke, label: 'map events', labelY: 225 })
  addArrow(a, 'persist', 955, 500, 1009, 500, { color: p.tealStroke, label: 'append', labelY: 475 })
  addArrow(a, 'project', 1260, 493, 1284, 493, { color: p.violetStroke, label: 'project / backfill', labelY: 465 })
  addBox(a, 'resume', 1015, 635, 520, 70, 'resume：读取已存历史 → 重建 Core Session → 继续新的 Turn', p.blue, p.blueStroke, { size: 18 })
  addText(a, 'footer', 800, 790, '不要把 notification 当持久日志本身：客户端用完成态更新 UI，服务端恢复依赖 rollout / thread store。', { size: 18, weight: 700, align: 'middle' })
  await writeDiagram('codex-thread-turn-item-recovery', 1600, 840, 'Codex Thread、Turn、Item 与恢复模型', '展示公开对象层级、JSON-RPC 消息、rollout JSONL 和 SQLite 投影的关系。', a)
}

console.log('generated Codex CLI Excalidraw sources and SVG exports')
