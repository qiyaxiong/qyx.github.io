import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const sourceDir = join(root, 'docs/diagrams/graphiti')
const outputDir = join(root, 'public/images/blog/graphiti')

const palette = {
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
}

const font = "'Comic Sans MS','Bradley Hand','Marker Felt','PingFang SC','Microsoft YaHei',sans-serif"

function esc(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function text(items, id, x, y, value, options = {}) {
  items.push({
    type: 'text', id, x, y, text: value,
    size: options.size ?? 20,
    color: options.color ?? palette.ink,
    weight: options.weight ?? 400,
    align: options.align ?? 'start',
  })
}

function box(items, id, x, y, w, h, value, fill, stroke, options = {}) {
  items.push({
    type: 'box', id, x, y, w, h, text: value, fill, stroke,
    size: options.size ?? 18,
    weight: options.weight ?? 600,
    radius: options.radius ?? 18,
    dash: options.dash ?? '',
    align: options.align ?? 'center',
  })
}

function arrow(items, id, x1, y1, x2, y2, options = {}) {
  items.push({
    type: 'arrow', id, x1, y1, x2, y2,
    color: options.color ?? palette.ink,
    width: options.width ?? 2.5,
    dash: options.dash ?? '',
    label: options.label ?? '',
    labelX: options.labelX,
    labelY: options.labelY,
  })
}

function line(items, id, x1, y1, x2, y2, options = {}) {
  items.push({
    type: 'line', id, x1, y1, x2, y2,
    color: options.color ?? palette.muted,
    width: options.width ?? 2,
    dash: options.dash ?? '',
  })
}

function svgText(value, x, y, size, color, weight, align = 'start') {
  const lines = String(value).split('\n')
  const anchor = align === 'middle' ? 'middle' : align === 'end' ? 'end' : 'start'
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="${font}" font-size="${size}" font-weight="${weight}">${lines.map((item, index) => `<tspan x="${x}" dy="${index ? size * 1.24 : 0}">${esc(item)}</tspan>`).join('')}</text>`
}

function renderSvg(item) {
  if (item.type === 'text') {
    return svgText(item.text, item.x, item.y, item.size, item.color, item.weight, item.align)
  }
  if (item.type === 'box') {
    const dash = item.dash ? ` stroke-dasharray="${item.dash}"` : ''
    const lines = item.text.split('\n')
    const total = (lines.length - 1) * item.size * 1.24
    const startY = item.y + item.h / 2 - total / 2 + item.size * 0.34
    const label = item.text
      ? svgText(item.text, item.x + item.w / 2, startY, item.size, palette.ink, item.weight, 'middle')
      : ''
    return `<rect x="${item.x}" y="${item.y}" width="${item.w}" height="${item.h}" rx="${item.radius}" fill="${item.fill}" stroke="${item.stroke}" stroke-width="2.5"${dash}/>${label}`
  }
  if (item.type === 'line') {
    return `<path d="M ${item.x1} ${item.y1} L ${item.x2} ${item.y2}" fill="none" stroke="${item.color}" stroke-width="${item.width}" stroke-linecap="round"${item.dash ? ` stroke-dasharray="${item.dash}"` : ''}/>`
  }
  const angle = Math.atan2(item.y2 - item.y1, item.x2 - item.x1)
  const size = 10
  const head = `${item.x2 - size * Math.cos(angle - Math.PI / 6)},${item.y2 - size * Math.sin(angle - Math.PI / 6)} ${item.x2},${item.y2} ${item.x2 - size * Math.cos(angle + Math.PI / 6)},${item.y2 - size * Math.sin(angle + Math.PI / 6)}`
  const path = `<path d="M ${item.x1} ${item.y1} L ${item.x2} ${item.y2}" fill="none" stroke="${item.color}" stroke-width="${item.width}" stroke-linecap="round"${item.dash ? ` stroke-dasharray="${item.dash}"` : ''}/><polyline points="${head}" fill="none" stroke="${item.color}" stroke-width="${item.width}" stroke-linecap="round"/>`
  if (!item.label) return path
  const x = item.labelX ?? (item.x1 + item.x2) / 2
  const y = item.labelY ?? (item.y1 + item.y2) / 2 - 10
  return `${path}${svgText(item.label, x, y, 14, palette.muted, 400, 'middle')}`
}

function baseElement(type, id, props) {
  return {
    id, type, x: props.x, y: props.y, width: props.width, height: props.height,
    angle: 0,
    strokeColor: props.strokeColor ?? palette.ink,
    backgroundColor: props.backgroundColor ?? 'transparent',
    fillStyle: 'solid', strokeWidth: props.strokeWidth ?? 2,
    strokeStyle: props.strokeStyle ?? 'solid', roughness: props.roughness ?? 1,
    opacity: 100, groupIds: [], frameId: null, index: null,
    roundness: props.roundness ?? null,
    seed: Math.abs([...id].reduce((acc, char) => ((acc * 31) + char.charCodeAt(0)) | 0, 17)),
    version: 1, versionNonce: 1, isDeleted: false,
    boundElements: props.boundElements ?? null, updated: 1,
    link: null, locked: false,
    ...props.extra,
  }
}

function toExcalidraw(item) {
  if (item.type === 'text') {
    const lines = item.text.split('\n')
    const width = Math.max(...lines.map((value) => value.length)) * item.size
    return [baseElement('text', item.id, {
      x: item.x - (item.align === 'middle' ? width / 2 : item.align === 'end' ? width : 0),
      y: item.y - item.size,
      width,
      height: lines.length * item.size * 1.25,
      strokeColor: item.color,
      strokeWidth: 1,
      roughness: 0,
      extra: {
        text: item.text, fontSize: item.size, fontFamily: 1,
        textAlign: item.align === 'middle' ? 'center' : item.align === 'end' ? 'right' : 'left',
        verticalAlign: 'top', containerId: null, originalText: item.text,
        autoResize: true, lineHeight: 1.25,
      },
    })]
  }
  if (item.type === 'box') {
    const labelId = `${item.id}-label`
    const rect = baseElement('rectangle', item.id, {
      x: item.x, y: item.y, width: item.w, height: item.h,
      strokeColor: item.stroke, backgroundColor: item.fill,
      strokeStyle: item.dash ? 'dashed' : 'solid',
      roundness: { type: 3 },
      boundElements: item.text ? [{ type: 'text', id: labelId }] : null,
    })
    if (!item.text) return [rect]
    const label = baseElement('text', labelId, {
      x: item.x + 12, y: item.y + 10, width: item.w - 24, height: item.h - 20,
      strokeColor: palette.ink, strokeWidth: 1, roughness: 0,
      extra: {
        text: item.text, fontSize: item.size, fontFamily: 1,
        textAlign: 'center', verticalAlign: 'middle', containerId: item.id,
        originalText: item.text, autoResize: true, lineHeight: 1.25,
      },
    })
    return [rect, label]
  }
  const width = item.x2 - item.x1
  const height = item.y2 - item.y1
  return [baseElement(item.type, item.id, {
    x: item.x1, y: item.y1, width, height,
    strokeColor: item.color, strokeWidth: item.width,
    strokeStyle: item.dash ? 'dashed' : 'solid',
    roundness: { type: 2 },
    extra: {
      points: [[0, 0], [width, height]],
      startBinding: null, endBinding: null,
      startArrowhead: null,
      endArrowhead: item.type === 'arrow' ? 'arrow' : null,
      elbowed: false,
    },
  })]
}

async function writeDiagram(name, width, height, titleValue, description, items) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(titleValue)}</title>
  <desc id="desc">${esc(description)}</desc>
  <rect width="${width}" height="${height}" fill="${palette.paper}"/>
  ${items.map(renderSvg).join('\n  ')}
</svg>\n`
  const excalidraw = {
    type: 'excalidraw', version: 2,
    source: 'codex-excalidraw-architecture-skill',
    elements: items.flatMap(toExcalidraw),
    appState: { viewBackgroundColor: palette.paper, gridSize: null, gridStep: 5 },
    files: {},
    metadata: {
      width, height, title: titleValue,
      reference: 'https://github.com/getzep/graphiti',
    },
  }
  await writeFile(join(sourceDir, `${name}.excalidraw`), `${JSON.stringify(excalidraw, null, 2)}\n`, 'utf8')
  await writeFile(join(outputDir, `${name}.svg`), svg, 'utf8')
}

await mkdir(sourceDir, { recursive: true })
await mkdir(outputDir, { recursive: true })

// 1. Core objects and provenance.
{
  const items = []
  text(items, 'title', 48, 58, 'Graphiti：从原始证据长出一张会随时间变化的图', { size: 32, weight: 700 })
  text(items, 'subtitle', 50, 94, 'Episode 保留“原话”，Entity 与 Fact 是可检索的派生结构；每条事实都能回到证据。', { size: 17, color: palette.muted })

  box(items, 'episode-frame', 55, 145, 360, 530, '', '#f8fbff', palette.blueStroke, { dash: '9 7', radius: 26 })
  text(items, 'episode-title', 235, 188, 'Episode：证据层', { size: 23, weight: 700, align: 'middle' })
  text(items, 'episode-note', 235, 220, '原始输入不被派生事实替代', { size: 15, color: palette.muted, align: 'middle' })
  box(items, 'episode-1', 92, 270, 286, 92, '1 月 10 日 · message\n“我现在在上海办公”', palette.blue, palette.blueStroke, { size: 17 })
  box(items, 'episode-2', 92, 410, 286, 92, '2 月 2 日 · message\n“1 月 20 日调到杭州了”', palette.blue, palette.blueStroke, { size: 17 })
  box(items, 'episode-3', 92, 550, 286, 82, 'JSON / 文本 / 对话\n都先成为 Episode', palette.white, palette.blueStroke, { size: 16 })

  box(items, 'graph-frame', 505, 145, 835, 530, '', '#f7fffd', palette.tealStroke, { radius: 26 })
  text(items, 'graph-title', 922, 188, 'Context Graph：派生的上下文层', { size: 23, weight: 700, align: 'middle' })
  box(items, 'person', 585, 300, 190, 88, 'Entity\n小洛', palette.violet, palette.violetStroke, { size: 18 })
  box(items, 'shanghai', 1060, 240, 190, 88, 'Entity\n上海', palette.amber, palette.amberStroke, { size: 18 })
  box(items, 'hangzhou', 1060, 460, 190, 88, 'Entity\n杭州', palette.amber, palette.amberStroke, { size: 18 })
  arrow(items, 'old-fact', 775, 328, 1054, 284, { color: palette.roseStroke, dash: '8 6', label: '办公地 · valid 1/1 → invalid 1/20', labelY: 270 })
  arrow(items, 'new-fact', 775, 360, 1054, 504, { color: palette.tealStroke, label: '办公地 · valid 1/20 → now', labelY: 455 })
  arrow(items, 'mention-1', 415, 316, 579, 326, { color: palette.blueStroke, dash: '7 6', label: 'MENTIONS / provenance', labelY: 292 })
  arrow(items, 'mention-2', 415, 456, 579, 370, { color: palette.blueStroke, dash: '7 6' })
  text(items, 'rule-1', 922, 606, '旧事实失效，但不会被删除；查询既能问“现在”，也能问“当时”。', { size: 17, color: palette.tealStroke, weight: 700, align: 'middle' })
  text(items, 'footer', 700, 744, '关键分工：Episode 是证据，Entity / Fact 是可更新、可检索、可追溯的解释。', { size: 18, color: palette.ink, weight: 700, align: 'middle' })
  await writeDiagram('graphiti-context-graph-overview', 1400, 800, 'Graphiti Context Graph 核心对象', '展示 Episode、Entity、Fact、有效时间和 provenance 的关系。', items)
}

// 2. Bi-temporal time model.
{
  const items = []
  text(items, 'title', 48, 58, '双时间：事情何时发生，与系统何时知道，是两回事', { size: 32, weight: 700 })
  text(items, 'subtitle', 50, 94, '迟到的消息可以修正过去，但不能抹掉系统当时掌握过什么。', { size: 17, color: palette.muted })

  text(items, 'valid-title', 75, 176, '有效时间（valid time）', { size: 22, weight: 700, color: palette.tealStroke })
  text(items, 'valid-note', 75, 205, '业务世界里，这件事什么时候是真的？', { size: 15, color: palette.muted })
  line(items, 'valid-axis', 160, 290, 1270, 290, { color: palette.ink, width: 3 })
  arrow(items, 'valid-axis-arrow', 1260, 290, 1310, 290, { color: palette.ink, width: 3 })
  for (const [id, x, label] of [['v1', 290, '1/1'], ['v2', 680, '1/20'], ['v3', 1070, '2/2']]) {
    line(items, `${id}-tick`, x, 275, x, 305, { color: palette.ink, width: 2 })
    text(items, `${id}-label`, x, 334, label, { size: 16, color: palette.muted, align: 'middle' })
  }
  box(items, 'valid-shanghai', 245, 230, 430, 58, '上海办公 · valid_at 1/1 · invalid_at 1/20', palette.rose, palette.roseStroke, { size: 15 })
  box(items, 'valid-hangzhou', 685, 300, 460, 58, '杭州办公 · valid_at 1/20 · 仍有效', palette.teal, palette.tealStroke, { size: 16 })

  text(items, 'system-title', 75, 452, '记录时间（system / transaction time）', { size: 22, weight: 700, color: palette.blueStroke })
  text(items, 'system-note', 75, 481, 'Graphiti 是什么时候收到并写入这条信息的？', { size: 15, color: palette.muted })
  line(items, 'system-axis', 160, 565, 1270, 565, { color: palette.ink, width: 3 })
  arrow(items, 'system-axis-arrow', 1260, 565, 1310, 565, { color: palette.ink, width: 3 })
  line(items, 's1-tick', 420, 550, 420, 580, { color: palette.ink, width: 2 })
  line(items, 's2-tick', 1020, 550, 1020, 580, { color: palette.ink, width: 2 })
  text(items, 's1-label', 420, 610, '1/10 系统收到第一条消息', { size: 16, color: palette.muted, align: 'middle' })
  text(items, 's2-label', 1020, 610, '2/2 系统才知道 1/20 已调动', { size: 16, color: palette.muted, align: 'middle' })
  box(items, 'system-old', 270, 505, 300, 58, 'created_at 1/10', palette.blue, palette.blueStroke, { size: 16 })
  box(items, 'system-new', 870, 505, 300, 58, 'created_at 2/2', palette.blue, palette.blueStroke, { size: 16 })
  arrow(items, 'late-correction', 1020, 505, 680, 360, { color: palette.amberStroke, dash: '8 6', label: '迟到信息修正有效时间', labelX: 850, labelY: 405 })
  box(items, 'question-one', 105, 680, 550, 68, '问“1 月 15 日在哪办公？” → 上海', palette.amber, palette.amberStroke, { size: 17 })
  box(items, 'question-two', 745, 680, 550, 68, '问“现在在哪办公？” → 杭州', palette.teal, palette.tealStroke, { size: 17 })
  await writeDiagram('graphiti-bitemporal-timeline', 1400, 800, 'Graphiti 双时间模型', '区分事实在业务世界中的有效时间与系统接收信息的记录时间。', items)
}

// 3. qi-pi integration boundary.
{
  const items = []
  text(items, 'title', 48, 58, '把 Graphiti 接进 qi-pi：它应是 Memory 插件，不是新的事实源', { size: 32, weight: 700 })
  text(items, 'subtitle', 50, 94, 'Session Event Log 负责运行恢复与审计；Graphiti 负责把事件派生为可检索的长期语义关系。', { size: 17, color: palette.muted })

  box(items, 'runtime-frame', 55, 145, 445, 520, '', '#f8fbff', palette.blueStroke, { radius: 26 })
  text(items, 'runtime-title', 277, 188, 'qi-pi Agent Runtime', { size: 23, weight: 700, align: 'middle' })
  box(items, 'channels', 100, 235, 355, 72, 'Web · Blog · Live2D · App', palette.amber, palette.amberStroke, { size: 18 })
  box(items, 'loop', 100, 355, 355, 92, 'Agent Loop\nTurn · Step · Tool · Approval', palette.blue, palette.blueStroke, { size: 18 })
  box(items, 'event-log', 100, 515, 355, 105, 'Session Event Log\nsequence · replay · recovery\n运行事实的唯一来源', palette.teal, palette.tealStroke, { size: 17 })
  arrow(items, 'channel-to-loop', 277, 307, 277, 349, { color: palette.amberStroke })
  arrow(items, 'loop-to-log', 277, 447, 277, 509, { color: palette.tealStroke, label: 'committed events', labelX: 365, labelY: 486 })

  box(items, 'plugin-frame', 555, 145, 340, 520, '', '#faf9ff', palette.violetStroke, { radius: 26, dash: '9 7' })
  text(items, 'plugin-title', 725, 188, 'Graphiti Memory Plugin', { size: 22, weight: 700, align: 'middle' })
  box(items, 'outbox', 600, 240, 250, 78, 'Memory Outbox\n去重 · 重试 · watermark', palette.violet, palette.violetStroke, { size: 16 })
  box(items, 'ingest', 600, 365, 250, 78, 'Episode Projector\nmessage / tool / domain event', palette.violet, palette.violetStroke, { size: 15 })
  box(items, 'context-provider', 600, 500, 250, 90, 'Context Provider\nsearch → facts + provenance\n注入下一次模型上下文', palette.violet, palette.violetStroke, { size: 15 })
  arrow(items, 'outbox-to-ingest', 725, 318, 725, 359, { color: palette.violetStroke })

  box(items, 'graph-frame', 950, 145, 395, 520, '', '#f7fffd', palette.tealStroke, { radius: 26 })
  text(items, 'graph-title', 1147, 188, 'Graphiti / Graph DB', { size: 23, weight: 700, align: 'middle' })
  box(items, 'episodes', 995, 245, 305, 72, 'Episodes\n原始记忆证据', palette.blue, palette.blueStroke, { size: 17 })
  box(items, 'entities-facts', 995, 370, 305, 90, 'Entities + Temporal Facts\n有效期 · 来源 · ontology', palette.teal, palette.tealStroke, { size: 16 })
  box(items, 'hybrid-search', 995, 515, 305, 78, 'Hybrid Retrieval\nsemantic + BM25 + graph', palette.amber, palette.amberStroke, { size: 16 })
  arrow(items, 'ingest-to-episode', 850, 404, 989, 281, { color: palette.violetStroke, label: 'add_episode', labelX: 914, labelY: 325 })
  arrow(items, 'episode-to-facts', 1147, 317, 1147, 364, { color: palette.tealStroke, label: 'extract / resolve / invalidate', labelX: 1250, labelY: 350 })
  arrow(items, 'context-to-search', 850, 545, 989, 554, { color: palette.amberStroke, label: 'query', labelY: 527 })
  arrow(items, 'search-to-context', 989, 580, 850, 580, { color: palette.tealStroke, label: 'ranked facts', labelY: 612 })
  arrow(items, 'log-to-outbox', 455, 568, 594, 279, { color: palette.violetStroke, dash: '8 6', label: 'async projection', labelX: 510, labelY: 405 })
  arrow(items, 'context-to-loop', 600, 545, 455, 405, { color: palette.violetStroke, dash: '8 6', label: 'context', labelX: 515, labelY: 485 })

  box(items, 'boundary', 145, 704, 1110, 54, '边界：Graphiti 可以丢弃后重建；Session Log、Tool Ledger、Approval 与崩溃恢复不能依赖它。', palette.rose, palette.roseStroke, { size: 17 })
  await writeDiagram('graphiti-qi-pi-integration', 1400, 800, 'Graphiti 作为 qi-pi Memory 插件', '展示 Session Event Log、Memory Outbox、Graphiti 和查询时 Context Provider 的边界。', items)
}

console.log('generated Graphiti Excalidraw sources and SVG exports')
