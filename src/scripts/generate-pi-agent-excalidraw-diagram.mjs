import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const sourceDir = join(root, 'docs/diagrams/pi-agent')
const outputDir = join(root, 'public/images/blog/pi-agent')
const name = 'qi-pi-v1-architecture'

const W = 2000
const H = 1500
const p = {
  paper: '#fffdf7',
  ink: '#263238',
  muted: '#667085',
  blue: '#dbeafe',
  blueStroke: '#2563eb',
  violet: '#ede9fe',
  violetStroke: '#7c3aed',
  teal: '#ccfbf1',
  tealStroke: '#0f766e',
  amber: '#fef3c7',
  amberStroke: '#b45309',
  rose: '#fce7f3',
  roseStroke: '#be185d',
  white: '#ffffff',
  soft: '#f8fafc',
}

const font = "'Comic Sans MS','Bradley Hand','Marker Felt','PingFang SC','Microsoft YaHei',sans-serif"
const specs = []

function add(spec) {
  specs.push(spec)
  return spec
}

function box(id, x, y, w, h, text, fill = p.white, stroke = p.ink, options = {}) {
  return add({ type: 'box', id, x, y, w, h, text, fill, stroke, size: options.size ?? 20, weight: options.weight ?? 600, radius: options.radius ?? 18, align: options.align ?? 'center', dash: options.dash ?? '', roughness: options.roughness ?? 1 })
}

function text(id, x, y, value, options = {}) {
  return add({ type: 'text', id, x, y, text: value, size: options.size ?? 20, color: options.color ?? p.ink, weight: options.weight ?? 400, align: options.align ?? 'start' })
}

function arrow(id, x1, y1, x2, y2, options = {}) {
  return add({ type: 'arrow', id, x1, y1, x2, y2, color: options.color ?? p.ink, width: options.width ?? 2.5, dash: options.dash ?? '', label: options.label ?? '', labelX: options.labelX, labelY: options.labelY, start: options.start ?? false })
}

function line(id, x1, y1, x2, y2, options = {}) {
  return add({ type: 'line', id, x1, y1, x2, y2, color: options.color ?? p.muted, width: options.width ?? 2, dash: options.dash ?? '' })
}

// Canvas title
text('title', 48, 54, 'qi-pi v1：一切皆插件', { size: 38, weight: 700 })
text('subtitle', 50, 96, '极小运行时只管理 Context、Service、Event 与生命周期；Agent 是一组插件在 Profile 中组合出来的结果。', { size: 19, color: p.muted })

// Outer process and composition flow
box('system-frame', 38, 128, 1924, 880, '', p.white, p.ink, { radius: 28, roughness: 2 })
text('system-label', 70, 166, 'qi-agent 进程', { size: 23, weight: 700 })
text('system-note', 1930, 165, '除了最小运行时与启动装配器，其余都是可替换插件', { size: 16, color: p.muted, align: 'end' })

text('compose-label', 72, 220, '① Profile 选择插件', { size: 18, weight: 700, color: p.amberStroke })
box('profile', 300, 184, 250, 74, 'Profile / Bundle\n选择插件与配置', p.amber, p.amberStroke, { size: 17 })
box('catalog', 650, 184, 250, 74, 'Plugin Catalog\n包 · Entry Point · 路径', p.amber, p.amberStroke, { size: 17 })
box('boot', 980, 184, 290, 74, 'Bootstrap / Loader\n解析配置树 · 导入插件 · 执行事务', p.blue, p.blueStroke, { size: 16 })
box('transaction', 1350, 184, 330, 74, 'Affected-node Transaction\n增量 reconcile · rollback', p.blue, p.blueStroke, { size: 16 })
arrow('compose-a1', 550, 221, 644, 221, { color: p.amberStroke, label: 'select', labelY: 203 })
arrow('compose-a2', 900, 221, 994, 221, { color: p.amberStroke, label: 'resolve', labelY: 203 })
arrow('compose-a3', 1270, 221, 1344, 221, { color: p.blueStroke, label: 'reconcile', labelY: 203 })

// Three-zone plugin architecture
text('runtime-label', 72, 330, '② 装配后的运行时：中心很小，外围全是插件', { size: 18, weight: 700, color: p.violetStroke })

box('foundation-frame', 82, 350, 520, 590, '', '#f8fbff', p.blueStroke, { radius: 22, dash: '9 7' })
text('foundation-title', 342, 392, '默认基础插件', { size: 23, weight: 700, align: 'middle' })
text('foundation-note', 342, 420, '标准 Agent Profile 默认装载，但仍可替换', { size: 14, color: p.muted, align: 'middle' })

const foundationRows = [
  ['fp-session', 'Session Service', 'append facts / branch'],
  ['fp-persist', 'Session Persistence', 'JSONL / Zstd'],
  ['fp-provider', 'Provider Registry', 'model stream adapters'],
  ['fp-tools', 'Tool + Approval', 'policy / execution'],
  ['fp-sandbox', 'Sandbox Service', 'default PassThrough'],
  ['fp-loop', 'Agent Loop', 'Turn / Step / Abort'],
  ['fp-inbox', 'Inbox + Compaction', 'steering / context'],
]
for (let i = 0; i < foundationRows.length; i += 1) {
  const [id, label, detail] = foundationRows[i]
  const y = 450 + i * 64
  box(id, 118, y, 448, 48, `${label}   ·   ${detail}`, p.blue, p.blueStroke, { size: 15 })
}

box('kernel-frame', 662, 350, 676, 590, '', '#faf9ff', p.violetStroke, { radius: 26, roughness: 2 })
text('kernel-title', 1000, 394, 'qi_runtime：不可再缩小的微内核', { size: 25, weight: 700, align: 'middle' })
text('kernel-note', 1000, 426, '不知道 LLM、Tool、Session、数据库或任何产品能力', { size: 15, color: p.muted, align: 'middle' })

box('context-graph', 730, 462, 540, 104, '', p.violet, p.violetStroke, { radius: 24 })
text('context-title', 1000, 500, 'Context Graph', { size: 26, weight: 700, align: 'middle' })
text('context-scope', 1000, 540, 'scope · inherit · isolate', { size: 15, color: p.muted, align: 'middle' })
box('context-service', 730, 608, 245, 88, 'Service Reflect\nctx.provide() = Truth', p.white, p.violetStroke, { size: 16 })
box('context-tree', 1025, 608, 245, 88, 'Event Dispatch\n类型事件 · 控制流 · 事实流', p.white, p.violetStroke, { size: 15 })
box('events', 730, 738, 245, 88, 'PluginHandle / Activation\nPENDING → ACTIVE', p.white, p.violetStroke, { size: 15 })
box('handle', 1025, 738, 245, 88, 'Effect Ownership\n可撤销 · 串行 LIFO', p.white, p.violetStroke, { size: 16 })
text('kernel-rule', 1000, 884, 'ctx.provide() 改变真实服务状态，Registry 动态推进受影响的 inject', { size: 14, color: p.violetStroke, weight: 700, align: 'middle' })
text('kernel-rule-2', 1000, 914, 'Loader 在外围装配，不拥有第二套 Service Registry', { size: 14, color: p.muted, align: 'middle' })

box('extension-frame', 1398, 350, 520, 590, '', '#f7fffd', p.tealStroke, { radius: 22, dash: '9 7' })
text('extension-title', 1658, 392, '能力与产品插件', { size: 23, weight: 700, align: 'middle' })
text('extension-note', 1658, 420, '按场景启用；不进入微内核', { size: 14, color: p.muted, align: 'middle' })

const extensionRows = [
  ['ep-system', 'FS · Search · Bash · Jobs'],
  ['ep-protocol', 'MCP · LSP · Terminal'],
  ['ep-agent', 'Subagent · Plan · Goal · Todo'],
  ['ep-knowledge', 'Memory · Skill · System Prompt'],
  ['ep-content', 'Blog · Web · Knowledge Source'],
  ['ep-avatar', 'Live2D · Voice · Channel'],
  ['ep-host', 'HTTP · SSE · Host Routes · Trace UI'],
]
for (let i = 0; i < extensionRows.length; i += 1) {
  const [id, label] = extensionRows[i]
  const y = 450 + i * 64
  box(id, 1434, y, 448, 48, label, p.teal, p.tealStroke, { size: 15 })
}

arrow('foundation-register', 602, 604, 654, 604, { color: p.blueStroke, dash: '7 6', label: 'provide services', labelY: 582 })
arrow('extensions-register', 1398, 674, 1346, 674, { color: p.tealStroke, dash: '7 6', label: 'provide services', labelY: 652 })
arrow('transaction-to-kernel', 1515, 258, 1278, 342, { color: p.blueStroke, label: 'reconcile affected nodes', labelX: 1410, labelY: 286 })

text('emergence', 1000, 974, 'Session + Provider + Tool + Loop + Capability 插件装配完成后，才“涌现”出一个可运行的 Agent', { size: 17, color: p.ink, weight: 700, align: 'middle' })

// Bottom left: standard run and persistent truth
box('run-frame', 38, 1032, 1250, 422, '', p.white, p.blueStroke, { radius: 24, roughness: 2 })
text('run-title', 70, 1074, '③ 插件协作形成一次 Turn', { size: 25, weight: 700 })
text('run-subtitle', 70, 1106, '下面不是内核硬编码流程，而是默认 Profile 中多个插件通过 Service 与 Event 协作的结果。', { size: 16, color: p.muted })

const timeline = [
  ['t-session', 78, 'Session\nturn/start', p.blue, p.blueStroke],
  ['t-loop', 250, 'Agent Loop\nstep/start', p.blue, p.blueStroke],
  ['t-provider', 422, 'Provider\nassistant/chunk*', p.violet, p.violetStroke],
  ['t-decision', 594, 'Loop\ntool/call?', p.blue, p.blueStroke],
  ['t-tool', 766, 'Tool / Approval\nexecute', p.rose, p.roseStroke],
  ['t-facts', 938, 'Session\ntool/result', p.teal, p.tealStroke],
  ['t-end', 1110, 'Loop\nstep/end', p.blue, p.blueStroke],
]
for (const [id, x, label, fill, stroke] of timeline) box(id, x, 1142, 138, 72, label, fill, stroke, { size: 14 })
for (let i = 0; i < timeline.length - 1; i += 1) arrow(`t-arrow-${i}`, timeline[i][1] + 138, 1178, timeline[i + 1][1] - 6, 1178, { color: p.muted })

box('truth', 88, 1260, 260, 104, 'Session Event Log\n唯一持久事实\nappend-only', p.teal, p.tealStroke, { size: 17 })
box('messages', 425, 1260, 240, 104, 'Model Context\nderive_messages()\n随时重建', p.violet, p.violetStroke, { size: 16 })
box('projection', 742, 1260, 240, 104, 'SQLite Projection\n统计 · 审批 · Trace\n可清空重建', p.blue, p.blueStroke, { size: 16 })
box('presentation', 1059, 1260, 180, 104, 'UI / SDK\nTimeline\nReplay', p.amber, p.amberStroke, { size: 16 })
arrow('truth-to-messages', 348, 1312, 419, 1312, { color: p.violetStroke, dash: '7 6', label: 'derive', labelY: 1292 })
line('truth-project-down', 348, 1340, 348, 1392, { color: p.tealStroke, dash: '7 6' })
line('truth-project-across', 348, 1392, 708, 1392, { color: p.tealStroke, dash: '7 6' })
arrow('truth-to-projection', 708, 1392, 736, 1354, { color: p.tealStroke, dash: '7 6' })
text('truth-project-label', 528, 1384, 'project', { size: 13, color: p.muted, align: 'middle' })
arrow('projection-to-ui', 982, 1312, 1053, 1312, { color: p.blueStroke, label: 'query', labelY: 1292 })

// Bottom right: reversible plugin lifecycle
box('lifecycle-frame', 1320, 1032, 642, 422, '', p.white, p.roseStroke, { radius: 24, roughness: 2 })
text('lifecycle-title', 1352, 1074, '④ 注册是可逆副作用', { size: 25, weight: 700 })
text('lifecycle-subtitle', 1352, 1106, '热重载不是重复执行代码，而是旧 Activation 完整退出后再接管。', { size: 15, color: p.muted })

const lifecycle = [
  ['l-discover', 1360, 'discover\nvalidate', p.amber, p.amberStroke],
  ['l-mount', 1530, 'mount\nActivation', p.violet, p.violetStroke],
  ['l-active', 1700, 'ACTIVE\nserve', p.teal, p.tealStroke],
]
for (const [id, x, label, fill, stroke] of lifecycle) box(id, x, 1152, 140, 72, label, fill, stroke, { size: 15 })
arrow('l-a1', 1500, 1188, 1524, 1188, { color: p.muted })
arrow('l-a2', 1670, 1188, 1694, 1188, { color: p.muted })

box('owned-effects', 1394, 1270, 220, 96, 'Activation 拥有\nService · Listener\nTask · Route · Resource', p.blue, p.blueStroke, { size: 16 })
box('dispose-effects', 1668, 1270, 220, 96, 'reload / unload\nLIFO dispose\n失败则回滚旧版本', p.rose, p.roseStroke, { size: 16 })
arrow('active-to-owned', 1770, 1224, 1608, 1264, { color: p.tealStroke, label: 'owns', labelX: 1680, labelY: 1236 })
arrow('owned-to-dispose', 1614, 1318, 1662, 1318, { color: p.roseStroke, label: 'revoke', labelY: 1298 })
text('lifecycle-rule', 1641, 1410, '活动 Run 持有自己的不可变装配快照\n热重载不会在半路改变它', { size: 15, color: p.muted, align: 'middle' })

text('legend', 50, 1482, '图例：外框 = 包含关系　实线 = 协作 / 数据流　虚线 = 插件贡献 / 派生 / 投影　蓝色 = 默认插件　绿色 = 可选插件　紫色 = 微内核原语', { size: 15, color: p.muted })

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function svgText(value, x, y, size, color, weight, align = 'start') {
  const lines = String(value).split('\n')
  const anchor = align === 'middle' ? 'middle' : align === 'end' ? 'end' : 'start'
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="${font}" font-size="${size}" font-weight="${weight}">${lines.map((item, index) => `<tspan x="${x}" dy="${index ? size * 1.24 : 0}">${esc(item)}</tspan>`).join('')}</text>`
}

function renderSvg(spec) {
  if (spec.type === 'text') return svgText(spec.text, spec.x, spec.y, spec.size, spec.color, spec.weight, spec.align)
  if (spec.type === 'box') {
    const dash = spec.dash ? ` stroke-dasharray="${spec.dash}"` : ''
    const lines = spec.text.split('\n')
    const total = (lines.length - 1) * spec.size * 1.24
    const startY = spec.y + spec.h / 2 - total / 2 + spec.size * 0.34
    const label = spec.text ? svgText(spec.text, spec.align === 'center' ? spec.x + spec.w / 2 : spec.x + 18, startY, spec.size, p.ink, spec.weight, spec.align === 'center' ? 'middle' : 'start') : ''
    return `<rect x="${spec.x}" y="${spec.y}" width="${spec.w}" height="${spec.h}" rx="${spec.radius}" fill="${spec.fill}" stroke="${spec.stroke}" stroke-width="2.5"${dash}/>${label}`
  }
  if (spec.type === 'line') {
    return `<path d="M ${spec.x1} ${spec.y1} L ${spec.x2} ${spec.y2}" fill="none" stroke="${spec.color}" stroke-width="${spec.width}" stroke-linecap="round"${spec.dash ? ` stroke-dasharray="${spec.dash}"` : ''}/>`
  }
  const angle = Math.atan2(spec.y2 - spec.y1, spec.x2 - spec.x1)
  const head = (x, y, reverse = false) => {
    const a = reverse ? angle + Math.PI : angle
    const s = 10
    return `${x - s * Math.cos(a - Math.PI / 6)},${y - s * Math.sin(a - Math.PI / 6)} ${x},${y} ${x - s * Math.cos(a + Math.PI / 6)},${y - s * Math.sin(a + Math.PI / 6)}`
  }
  const dash = spec.dash ? ` stroke-dasharray="${spec.dash}"` : ''
  const body = `<path d="M ${spec.x1} ${spec.y1} L ${spec.x2} ${spec.y2}" fill="none" stroke="${spec.color}" stroke-width="${spec.width}" stroke-linecap="round"${dash}/><polyline points="${head(spec.x2, spec.y2)}" fill="none" stroke="${spec.color}" stroke-width="${spec.width}" stroke-linecap="round"/>${spec.start ? `<polyline points="${head(spec.x1, spec.y1, true)}" fill="none" stroke="${spec.color}" stroke-width="${spec.width}"/>` : ''}`
  if (!spec.label) return body
  const x = spec.labelX ?? (spec.x1 + spec.x2) / 2
  const y = spec.labelY ?? (spec.y1 + spec.y2) / 2 - 10
  return `${body}${svgText(spec.label, x, y, 13, p.muted, 400, 'middle')}`
}

function baseElement(type, id, props) {
  return {
    id,
    type,
    x: props.x,
    y: props.y,
    width: props.width,
    height: props.height,
    angle: 0,
    strokeColor: props.strokeColor ?? p.ink,
    backgroundColor: props.backgroundColor ?? 'transparent',
    fillStyle: 'solid',
    strokeWidth: props.strokeWidth ?? 2,
    strokeStyle: props.strokeStyle ?? 'solid',
    roughness: props.roughness ?? 1,
    opacity: 100,
    groupIds: props.groupIds ?? [],
    frameId: null,
    index: null,
    roundness: props.roundness ?? null,
    seed: Math.abs([...id].reduce((acc, char) => ((acc * 31) + char.charCodeAt(0)) | 0, 17)),
    version: 1,
    versionNonce: 1,
    isDeleted: false,
    boundElements: props.boundElements ?? null,
    updated: 1,
    link: null,
    locked: false,
    ...props.extra,
  }
}

function toExcalidraw(spec) {
  if (spec.type === 'text') {
    const lines = spec.text.split('\n')
    const width = Math.max(...lines.map((item) => item.length)) * spec.size
    return [baseElement('text', spec.id, {
      x: spec.x - (spec.align === 'middle' ? width / 2 : spec.align === 'end' ? width : 0),
      y: spec.y - spec.size,
      width,
      height: lines.length * spec.size * 1.25,
      strokeColor: spec.color,
      strokeWidth: 1,
      roughness: 0,
      extra: { text: spec.text, fontSize: spec.size, fontFamily: 1, textAlign: spec.align === 'middle' ? 'center' : spec.align === 'end' ? 'right' : 'left', verticalAlign: 'top', containerId: null, originalText: spec.text, autoResize: true, lineHeight: 1.25 },
    })]
  }
  if (spec.type === 'box') {
    const labelId = `${spec.id}-label`
    const rect = baseElement('rectangle', spec.id, {
      x: spec.x, y: spec.y, width: spec.w, height: spec.h,
      strokeColor: spec.stroke, backgroundColor: spec.fill,
      strokeStyle: spec.dash ? 'dashed' : 'solid', roughness: spec.roughness,
      roundness: { type: 3 }, boundElements: spec.text ? [{ type: 'text', id: labelId }] : null,
    })
    if (!spec.text) return [rect]
    const label = baseElement('text', labelId, {
      x: spec.x + 12, y: spec.y + 10, width: spec.w - 24, height: spec.h - 20,
      strokeColor: p.ink, strokeWidth: 1, roughness: 0,
      extra: { text: spec.text, fontSize: spec.size, fontFamily: 1, textAlign: spec.align, verticalAlign: 'middle', containerId: spec.id, originalText: spec.text, autoResize: true, lineHeight: 1.25 },
    })
    return [rect, label]
  }
  const width = spec.x2 - spec.x1
  const height = spec.y2 - spec.y1
  const el = baseElement(spec.type, spec.id, {
    x: spec.x1, y: spec.y1, width, height,
    strokeColor: spec.color, backgroundColor: 'transparent', strokeWidth: spec.width,
    strokeStyle: spec.dash ? 'dashed' : 'solid', roughness: 1,
    roundness: { type: 2 },
    extra: { points: [[0, 0], [width, height]], startBinding: null, endBinding: null, startArrowhead: spec.type === 'arrow' && spec.start ? 'arrow' : null, endArrowhead: spec.type === 'arrow' ? 'arrow' : null, elbowed: false },
  })
  return [el]
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="title desc">
  <title id="title">qi-pi v1 一切皆插件架构图</title>
  <desc id="desc">展示 Profile 如何把基础插件、能力插件和产品插件装配到极小 Context 微内核，并形成 Agent、事件事实与可逆生命周期。</desc>
  <rect width="${W}" height="${H}" fill="${p.paper}"/>
  ${specs.map(renderSvg).join('\n  ')}
</svg>\n`

const excalidraw = {
  type: 'excalidraw',
  version: 2,
  source: 'codex-excalidraw-architecture-skill',
  elements: specs.flatMap(toExcalidraw),
  appState: { viewBackgroundColor: p.paper, gridSize: null, gridStep: 5 },
  files: {},
  metadata: {
    width: W,
    height: H,
    title: 'qi-pi v1 everything-is-a-plugin architecture',
    sourceRepository: '/Users/qiluo/program/pi-agent-py',
    generatedFrom: 'current qi-pi v1 implementation and architecture docs',
  },
}

await mkdir(sourceDir, { recursive: true })
await mkdir(outputDir, { recursive: true })
await writeFile(join(sourceDir, `${name}.excalidraw`), `${JSON.stringify(excalidraw, null, 2)}\n`, 'utf8')
await writeFile(join(outputDir, `${name}.svg`), svg, 'utf8')
console.log(`generated ${name}`)

function diagramBox(items, id, x, y, w, h, label, fill, stroke, size = 18, options = {}) {
  items.push({ type: 'box', id, x, y, w, h, text: label, fill, stroke, size, weight: options.weight ?? 600, radius: options.radius ?? 18, align: options.align ?? 'center', dash: options.dash ?? '', roughness: options.roughness ?? 1 })
}

function diagramText(items, id, x, y, label, options = {}) {
  items.push({ type: 'text', id, x, y, text: label, size: options.size ?? 20, color: options.color ?? p.ink, weight: options.weight ?? 400, align: options.align ?? 'start' })
}

function diagramArrow(items, id, x1, y1, x2, y2, options = {}) {
  items.push({ type: 'arrow', id, x1, y1, x2, y2, color: options.color ?? p.ink, width: options.width ?? 2.5, dash: options.dash ?? '', label: options.label ?? '', labelX: options.labelX, labelY: options.labelY, start: false })
}

async function writeArticleDiagram(diagramName, width, height, titleValue, description, items) {
  const content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(titleValue)}</title>
  <desc id="desc">${esc(description)}</desc>
  <rect width="${width}" height="${height}" fill="${p.paper}"/>
  ${items.map(renderSvg).join('\n  ')}
</svg>\n`
  const source = {
    type: 'excalidraw',
    version: 2,
    source: 'codex-excalidraw-architecture-skill',
    elements: items.flatMap(toExcalidraw),
    appState: { viewBackgroundColor: p.paper, gridSize: null, gridStep: 5 },
    files: {},
    metadata: { width, height, title: titleValue, sourceRepository: '/Users/qiluo/program/pi-agent-py' },
  }
  await writeFile(join(sourceDir, `${diagramName}.excalidraw`), `${JSON.stringify(source, null, 2)}\n`, 'utf8')
  await writeFile(join(outputDir, `${diagramName}.svg`), content, 'utf8')
  console.log(`generated ${diagramName}`)
}

// Figure 2: profile composition and atomic activation.
{
  const items = []
  diagramText(items, 'pc-title', 48, 58, 'Profile 不是配置清单，而是一棵待装配的 Context Tree', { size: 32, weight: 700 })
  diagramText(items, 'pc-subtitle', 50, 94, 'Bundle 负责复用组合，Patch 只覆盖节点；Loader 在事务中解析、挂载、检查健康并提交。', { size: 17, color: p.muted })

  diagramBox(items, 'pc-profile', 60, 155, 250, 100, 'Profile\nheadless / live2d / ...', p.amber, p.amberStroke, 18)
  diagramBox(items, 'pc-bundle', 375, 155, 250, 100, 'Bundle + Overlay\n组合与差异覆盖', p.amber, p.amberStroke, 18)
  diagramBox(items, 'pc-tree', 690, 135, 300, 140, 'Context Tree\nPluginNode · GroupNode\nchildren · isolate', p.violet, p.violetStroke, 18)
  diagramBox(items, 'pc-loader', 1055, 155, 280, 100, 'Bootstrap / Loader\n解析配置树 · 导入插件\n不推断 Service Graph', p.blue, p.blueStroke, 16)
  diagramArrow(items, 'pc-a1', 310, 205, 369, 205, { color: p.amberStroke, label: 'select', labelY: 184 })
  diagramArrow(items, 'pc-a2', 625, 205, 684, 205, { color: p.amberStroke, label: 'merge', labelY: 184 })
  diagramArrow(items, 'pc-a3', 990, 205, 1049, 205, { color: p.blueStroke, label: 'resolve', labelY: 184 })

  diagramBox(items, 'pc-transaction', 105, 335, 1190, 330, '', '#f8fbff', p.blueStroke, 18, { radius: 28 })
  diagramText(items, 'pc-transaction-title', 700, 375, 'Affected-node Incremental Reconciliation', { size: 24, weight: 700, align: 'middle' })
  const steps = [
    ['pc-preflight', 130, '1  Preflight\naffected candidates'],
    ['pc-mount', 370, '2  Dispose\naffected old subtree'],
    ['pc-stable', 610, '3  Mount\naffected new subtree'],
    ['pc-health', 850, '4  Quiescence\nContext lifecycle'],
    ['pc-commit', 1090, '5  Postcondition\nthen commit'],
  ]
  for (const [id, x, label] of steps) diagramBox(items, id, x, 430, 180, 92, label, id === 'pc-commit' ? p.teal : p.blue, id === 'pc-commit' ? p.tealStroke : p.blueStroke, 14)
  for (let i = 0; i < steps.length - 1; i += 1) diagramArrow(items, `pc-step-${i}`, steps[i][1] + 180, 476, steps[i + 1][1] - 6, 476, { color: p.muted })
  diagramBox(items, 'pc-rollback', 345, 570, 710, 52, '失败 → 释放已创建节点 → 重新挂载 previous tree，恢复旧节点', p.rose, p.roseStroke, 16)
  diagramText(items, 'pc-note', 700, 720, '关键点：运行中的 Run 持有自己的装配快照，不会在热重载中途被换掉。', { size: 17, color: p.muted, align: 'middle' })
  await writeArticleDiagram('qi-pi-profile-composition', 1400, 780, 'qi-pi Profile 与原子装配', 'Profile、Bundle、Context Tree 和 Activation Transaction 的关系。', items)
}

// Figure 3: context ownership and reversible effects.
{
  const items = []
  diagramText(items, 'co-title', 48, 58, '插件为什么能安全卸载：每个副作用都有主人', { size: 32, weight: 700 })
  diagramText(items, 'co-subtitle', 50, 94, '注册工具、监听事件、启动任务或打开连接时，资源会自动归属当前 Activation。', { size: 17, color: p.muted })

  diagramBox(items, 'co-root', 70, 145, 1260, 500, '', '#faf9ff', p.violetStroke, 18, { radius: 28 })
  diagramText(items, 'co-root-title', 110, 185, 'Root Context', { size: 24, weight: 700 })
  diagramBox(items, 'co-handle', 140, 230, 310, 110, 'PluginHandle\n稳定插件身份\n拥有 child Context', p.violet, p.violetStroke, 18)
  diagramBox(items, 'co-activation', 545, 230, 310, 110, 'Activation\n一次 apply() 的生命\nreload 时可替换', p.blue, p.blueStroke, 18)
  diagramBox(items, 'co-plugin-context', 950, 230, 310, 110, 'handle.context\nService 可见性\n事件与子插件边界', p.violet, p.violetStroke, 17)
  diagramArrow(items, 'co-a1', 450, 285, 539, 285, { color: p.violetStroke, label: 'owns current', labelY: 264 })
  diagramArrow(items, 'co-a2', 855, 285, 944, 285, { color: p.violetStroke, label: 'executes in', labelY: 264 })

  const effects = [
    ['co-service', 150, 'Service\nctx.provide()'],
    ['co-event', 390, 'Listener\nctx.on()'],
    ['co-task', 630, 'Task / Timer\nctx.effect()'],
    ['co-route', 870, 'Route / Tool\nregister()'],
    ['co-resource', 1110, 'Socket / File\nexternal resource'],
  ]
  for (const [id, x, label] of effects) diagramBox(items, id, x, 435, 180, 84, label, p.teal, p.tealStroke, 15)
  for (const [id, x] of effects) diagramArrow(items, `${id}-owner`, 700, 340, x + 90, 429, { color: p.tealStroke, dash: '7 6' })

  diagramBox(items, 'co-dispose', 260, 565, 880, 52, 'reload / unload → 串行 LIFO dispose → 注册撤销、任务停止、连接关闭', p.rose, p.roseStroke, 17)
  diagramText(items, 'co-note', 700, 716, '因此热重载不是“再执行一遍代码”，而是旧实例干净退出、新实例原子接管。', { size: 17, color: p.muted, align: 'middle' })
  await writeArticleDiagram('qi-pi-context-ownership', 1400, 780, 'qi-pi Context 与 Activation 所有权', 'PluginHandle、Activation、Context 和可逆副作用之间的包含与生命周期关系。', items)
}

// Figure 4: plugin collaboration during one turn.
{
  const items = []
  diagramText(items, 'tc-title', 48, 58, '一次 Turn，不是一个函数，而是多个插件的协作', { size: 32, weight: 700 })
  diagramText(items, 'tc-subtitle', 50, 94, 'Agent Loop 只负责推进状态；消息、模型、工具、审批和持久化分别属于不同插件。', { size: 17, color: p.muted })

  const lanes = [
    ['tc-session-label', 150, 'Session Plugin', p.tealStroke],
    ['tc-loop-label', 360, 'Agent Loop Plugin', p.blueStroke],
    ['tc-provider-label', 570, 'Provider Plugin', p.violetStroke],
    ['tc-tool-label', 780, 'Tool / Approval', p.roseStroke],
    ['tc-cap-label', 990, 'Capability Plugin', p.tealStroke],
    ['tc-ui-label', 1200, 'UI / Control', p.amberStroke],
  ]
  for (const [id, x, label, stroke] of lanes) {
    diagramBox(items, id, x - 80, 135, 160, 54, label, p.white, stroke, 14)
    items.push({ type: 'line', id: `${id}-line`, x1: x, y1: 189, x2: x, y2: 690, color: p.muted, width: 1.5, dash: '8 7' })
  }

  const events = [
    ['tc-e1', 360, 225, 150, 225, 'turn/start', p.blueStroke],
    ['tc-e2', 360, 285, 150, 285, 'derive_messages()', p.blueStroke],
    ['tc-e3', 360, 345, 570, 345, 'stream request', p.violetStroke],
    ['tc-e4', 570, 405, 360, 405, 'assistant/chunk*', p.violetStroke],
    ['tc-e5', 360, 465, 780, 465, 'tool/call', p.roseStroke],
    ['tc-e6', 780, 525, 990, 525, 'approved execute', p.roseStroke],
    ['tc-e7', 990, 585, 780, 585, 'ToolResult', p.tealStroke],
    ['tc-e8', 780, 635, 150, 635, 'tool/result + checkpoint', p.tealStroke],
    ['tc-e9', 150, 675, 1200, 675, 'persistent facts / realtime control', p.amberStroke],
  ]
  for (const [id, x1, y1, x2, y2, label, color] of events) diagramArrow(items, id, x1, y1, x2, y2, { color, label, labelY: y1 - 10 })
  diagramText(items, 'tc-loop-note', 700, 742, '如果模型继续请求工具，就回到下一 Step；没有工具调用时才结束 Turn。', { size: 17, color: p.muted, align: 'middle' })
  await writeArticleDiagram('qi-pi-turn-collaboration', 1400, 780, 'qi-pi Turn 插件协作时序', 'Session、Agent Loop、Provider、Tool、Capability 与 UI 插件协作完成一次 Turn。', items)
}

// Figure 5: single source of truth and rebuildable projections.
{
  const items = []
  diagramText(items, 'sf-title', 48, 58, 'Session Event Log：把“现在发生了什么”变成可恢复事实', { size: 32, weight: 700 })
  diagramText(items, 'sf-subtitle', 50, 94, '模型历史、UI 时间线、统计和崩溃恢复都从同一份 append-only 事件流派生。', { size: 17, color: p.muted })

  diagramBox(items, 'sf-input', 70, 190, 250, 100, '运行时事件\nturn / step / message\ntool / approval / checkpoint', p.blue, p.blueStroke, 17)
  diagramBox(items, 'sf-log', 420, 155, 310, 170, 'Session Event Log\nseq · time · type · data\nJSONL / Zstd\n唯一持久事实', p.teal, p.tealStroke, 19)
  diagramArrow(items, 'sf-ingest', 320, 240, 414, 240, { color: p.tealStroke, label: 'append + flush', labelY: 218 })

  diagramBox(items, 'sf-model', 870, 135, 360, 100, 'Model Context\nderive_messages()\n压缩后仍可重建', p.violet, p.violetStroke, 17)
  diagramBox(items, 'sf-recovery', 870, 285, 360, 100, 'Recovery State\ncheckpoint + ledger\n不序列化协程栈', p.rose, p.roseStroke, 17)
  diagramArrow(items, 'sf-to-model', 730, 205, 864, 185, { color: p.violetStroke, dash: '7 6', label: 'derive', labelY: 170 })
  diagramArrow(items, 'sf-to-recovery', 730, 275, 864, 335, { color: p.roseStroke, dash: '7 6', label: 'reduce', labelY: 292 })

  diagramBox(items, 'sf-projection-frame', 115, 450, 1170, 225, '', '#f8fbff', p.blueStroke, 18, { radius: 24 })
  diagramText(items, 'sf-projection-title', 700, 490, '可重建投影：坏了可以删，不能反过来污染事实源', { size: 22, weight: 700, align: 'middle' })
  diagramBox(items, 'sf-sqlite', 170, 540, 250, 82, 'SQLite\nSession / Run / Usage', p.blue, p.blueStroke, 16)
  diagramBox(items, 'sf-trace', 475, 540, 250, 82, 'Trace Timeline\nTurn / Step / Tool', p.amber, p.amberStroke, 16)
  diagramBox(items, 'sf-stats', 780, 540, 250, 82, 'Statistics\nToken / Cost / Error', p.blue, p.blueStroke, 16)
  diagramBox(items, 'sf-sdk', 1085, 540, 150, 82, 'SDK\nReplay', p.amber, p.amberStroke, 16)
  diagramArrow(items, 'sf-project', 575, 325, 575, 444, { color: p.blueStroke, dash: '7 6', label: 'subscribe / rebuild', labelX: 490, labelY: 408 })
  diagramText(items, 'sf-note', 700, 735, 'Telemetry 投影失败不会阻塞 Agent Run；它只是事实流的消费者。', { size: 17, color: p.muted, align: 'middle' })
  await writeArticleDiagram('qi-pi-session-facts', 1400, 780, 'qi-pi Session 唯一事实源', 'Session Event Log 如何派生模型上下文、恢复状态、SQLite、Trace 和统计投影。', items)
}
