import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const sourceDir = join(process.cwd(), 'docs/diagrams/pi-agent')
const outputDir = join(process.cwd(), 'public/images/blog/pi-agent')
const paper = '#fffdf7'
const ink = '#263238'
const muted = '#667085'
const colors = {
  blue: ['#dbeafe', '#2563eb'],
  violet: ['#ede9fe', '#7c3aed'],
  teal: ['#ccfbf1', '#0f766e'],
  amber: ['#fef3c7', '#b45309'],
  rose: ['#fce7f3', '#be185d'],
  white: ['#ffffff', ink],
}
const font = "'Comic Sans MS','Bradley Hand','Marker Felt','PingFang SC','Microsoft YaHei',sans-serif"

function box(items, id, x, y, w, h, label, color = 'white', size = 18, options = {}) {
  const [fill, stroke] = colors[color]
  items.push({ type: 'box', id, x, y, w, h, label, fill, stroke, size, weight: options.weight ?? 600, dash: options.dash ?? '', radius: options.radius ?? 18 })
}

function text(items, id, x, y, label, options = {}) {
  items.push({ type: 'text', id, x, y, label, size: options.size ?? 20, color: options.color ?? ink, weight: options.weight ?? 400, align: options.align ?? 'start' })
}

function arrow(items, id, x1, y1, x2, y2, label = '', color = ink, dash = '') {
  items.push({ type: 'arrow', id, x1, y1, x2, y2, label, color, dash })
}

function line(items, id, x1, y1, x2, y2, color = muted, dash = '') {
  items.push({ type: 'line', id, x1, y1, x2, y2, color, dash })
}

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function svgText(value, x, y, size, color, weight, align = 'start') {
  const lines = String(value).split('\n')
  const anchor = align === 'middle' ? 'middle' : align === 'end' ? 'end' : 'start'
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${color}" font-family="${font}" font-size="${size}" font-weight="${weight}">${lines.map((item, index) => `<tspan x="${x}" dy="${index ? size * 1.25 : 0}">${esc(item)}</tspan>`).join('')}</text>`
}

function renderSvg(item) {
  if (item.type === 'text') return svgText(item.label, item.x, item.y, item.size, item.color, item.weight, item.align)
  if (item.type === 'box') {
    const lines = item.label.split('\n')
    const total = (lines.length - 1) * item.size * 1.25
    const startY = item.y + item.h / 2 - total / 2 + item.size * 0.34
    const label = item.label ? svgText(item.label, item.x + item.w / 2, startY, item.size, ink, item.weight, 'middle') : ''
    return `<rect x="${item.x}" y="${item.y}" width="${item.w}" height="${item.h}" rx="${item.radius}" fill="${item.fill}" stroke="${item.stroke}" stroke-width="2.5"${item.dash ? ` stroke-dasharray="${item.dash}"` : ''}/>${label}`
  }
  if (item.type === 'line') return `<path d="M ${item.x1} ${item.y1} L ${item.x2} ${item.y2}" fill="none" stroke="${item.color}" stroke-width="2" stroke-linecap="round"${item.dash ? ` stroke-dasharray="${item.dash}"` : ''}/>`
  const angle = Math.atan2(item.y2 - item.y1, item.x2 - item.x1)
  const size = 10
  const points = `${item.x2 - size * Math.cos(angle - Math.PI / 6)},${item.y2 - size * Math.sin(angle - Math.PI / 6)} ${item.x2},${item.y2} ${item.x2 - size * Math.cos(angle + Math.PI / 6)},${item.y2 - size * Math.sin(angle + Math.PI / 6)}`
  const body = `<path d="M ${item.x1} ${item.y1} L ${item.x2} ${item.y2}" fill="none" stroke="${item.color}" stroke-width="2.5" stroke-linecap="round"${item.dash ? ` stroke-dasharray="${item.dash}"` : ''}/><polyline points="${points}" fill="none" stroke="${item.color}" stroke-width="2.5"/>`
  if (!item.label) return body
  return `${body}${svgText(item.label, (item.x1 + item.x2) / 2, (item.y1 + item.y2) / 2 - 10, 13, muted, 400, 'middle')}`
}

function seed(id) {
  return Math.abs([...id].reduce((value, char) => ((value * 31) + char.charCodeAt(0)) | 0, 17))
}

function base(type, id, values) {
  return {
    id, type, x: values.x, y: values.y, width: values.width, height: values.height,
    angle: 0, strokeColor: values.strokeColor ?? ink,
    backgroundColor: values.backgroundColor ?? 'transparent', fillStyle: 'solid',
    strokeWidth: values.strokeWidth ?? 2, strokeStyle: values.strokeStyle ?? 'solid',
    roughness: values.roughness ?? 1, opacity: 100, groupIds: [], frameId: null,
    index: null, roundness: values.roundness ?? null, seed: seed(id), version: 1,
    versionNonce: 1, isDeleted: false, boundElements: values.boundElements ?? null,
    updated: 1, link: null, locked: false, ...values.extra,
  }
}

function toExcalidraw(item) {
  if (item.type === 'text') {
    const width = Math.max(...item.label.split('\n').map((part) => part.length)) * item.size
    return [base('text', item.id, {
      x: item.x - (item.align === 'middle' ? width / 2 : 0), y: item.y - item.size,
      width, height: item.label.split('\n').length * item.size * 1.25,
      strokeColor: item.color, strokeWidth: 1, roughness: 0,
      extra: { text: item.label, fontSize: item.size, fontFamily: 1, textAlign: item.align === 'middle' ? 'center' : 'left', verticalAlign: 'top', containerId: null, originalText: item.label, autoResize: true, lineHeight: 1.25 },
    })]
  }
  if (item.type === 'box') {
    const labelId = `${item.id}-label`
    const shape = base('rectangle', item.id, {
      x: item.x, y: item.y, width: item.w, height: item.h,
      strokeColor: item.stroke, backgroundColor: item.fill,
      strokeStyle: item.dash ? 'dashed' : 'solid', roundness: { type: 3 },
      boundElements: item.label ? [{ type: 'text', id: labelId }] : null,
    })
    if (!item.label) return [shape]
    return [shape, base('text', labelId, {
      x: item.x + 12, y: item.y + 10, width: item.w - 24, height: item.h - 20,
      strokeColor: ink, strokeWidth: 1, roughness: 0,
      extra: { text: item.label, fontSize: item.size, fontFamily: 1, textAlign: 'center', verticalAlign: 'middle', containerId: item.id, originalText: item.label, autoResize: true, lineHeight: 1.25 },
    })]
  }
  const width = item.x2 - item.x1
  const height = item.y2 - item.y1
  return [base(item.type, item.id, {
    x: item.x1, y: item.y1, width, height, strokeColor: item.color,
    strokeStyle: item.dash ? 'dashed' : 'solid', roundness: { type: 2 },
    extra: { points: [[0, 0], [width, height]], startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: item.type === 'arrow' ? 'arrow' : null, elbowed: false },
  })]
}

async function writeDiagram(name, width, height, titleValue, description, items) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(titleValue)}</title>
  <desc id="desc">${esc(description)}</desc>
  <rect width="${width}" height="${height}" fill="${paper}"/>
  ${items.map(renderSvg).join('\n  ')}
</svg>\n`
  const source = {
    type: 'excalidraw', version: 2, source: 'codex-excalidraw-architecture-skill',
    elements: items.flatMap(toExcalidraw),
    appState: { viewBackgroundColor: paper, gridSize: null, gridStep: 5 }, files: {},
    metadata: { width, height, title: titleValue, sourceRepository: 'qiyaxiong/pi-agent-py', sourceCommit: '5fc1efe672a87767a842a5a1e7afad91922e22cf' },
  }
  await writeFile(join(sourceDir, `${name}.excalidraw`), `${JSON.stringify(source, null, 2)}\n`, 'utf8')
  await writeFile(join(outputDir, `${name}.svg`), svg, 'utf8')
}

await mkdir(sourceDir, { recursive: true })
await mkdir(outputDir, { recursive: true })

{
  const items = []
  text(items, 'rp-title', 50, 58, 'qi-pi 2.0：一个进程里的三层架构', { size: 34, weight: 700 })
  text(items, 'rp-sub', 52, 94, 'Host 只做传输，Runtime Plane 负责可靠接纳与调度，Kernel 负责 Agent 语义。', { size: 17, color: muted })
  const layers = [
    ['rp-host', 145, 'Host / Channel Adapters\nREST · SSE · WebSocket JSON-RPC · UI', 'amber'],
    ['rp-plane', 305, 'Runtime Plane\nCommand · Query · Submission · Worker · Lease · Stream', 'blue'],
    ['rp-kernel', 465, 'Agent Kernel\nContext · Session Actor · Turn · Step · Tool · Approval', 'violet'],
    ['rp-store', 625, 'SQLite WAL Runtime Store\nSession Event Log · Outbox · Projection · Snapshot', 'teal'],
  ]
  for (const [id, y, label, color] of layers) box(items, id, 135, y, 1130, 108, label, color, 20)
  for (let i = 0; i < layers.length - 1; i += 1) arrow(items, `rp-a${i}`, 700, layers[i][1] + 108, 700, layers[i + 1][1] - 6, i === 0 ? 'Submission / Query / Stream' : i === 1 ? 'Agent Protocol' : 'append / replay')
  text(items, 'rp-left', 80, 395, '替换 Transport\n不改 Agent', { size: 16, color: colors.blue[1], align: 'middle' })
  text(items, 'rp-right', 1320, 395, '替换 Store\n不改 Kernel', { size: 16, color: colors.teal[1], align: 'middle' })
  await writeDiagram('qi-pi-v2-runtime-plane', 1400, 800, 'qi-pi 2.0 三层架构', 'Host、Runtime Plane、Agent Kernel 与 SQLite Runtime Store 的分层。', items)
}

{
  const items = []
  text(items, 'tt-title', 50, 58, '两种真相，各自回答一个问题', { size: 34, weight: 700 })
  text(items, 'tt-sub', 52, 94, 'Context Graph 管“现在有什么能力”；Session Event Log 管“已经发生了什么”。', { size: 17, color: muted })
  box(items, 'tt-context-frame', 70, 145, 580, 500, '', 'violet', 18, { dash: '10 7', radius: 28 })
  text(items, 'tt-context-title', 360, 190, 'Context Graph · 进程内事实', { size: 24, weight: 700, align: 'middle' })
  box(items, 'tt-service', 125, 240, 220, 82, 'Service Truth\nctx.provide()', 'violet', 17)
  box(items, 'tt-plugin', 375, 240, 220, 82, 'Plugin Lifecycle\nActivation', 'blue', 17)
  box(items, 'tt-events', 125, 370, 220, 82, 'Event Listener\nDispatch', 'blue', 17)
  box(items, 'tt-effect', 375, 370, 220, 82, 'Effect Owner\nLIFO dispose', 'violet', 17)
  box(items, 'tt-rebuild', 150, 510, 420, 80, '进程重启后由 Profile 重新装配\n不序列化 Python 对象', 'white', 16)
  box(items, 'tt-log-frame', 750, 145, 580, 500, '', 'teal', 18, { dash: '10 7', radius: 28 })
  text(items, 'tt-log-title', 1040, 190, 'Session Event Log · 持久事实', { size: 24, weight: 700, align: 'middle' })
  box(items, 'tt-log', 840, 235, 400, 110, 'session_events\nseq · type · time · data', 'teal', 19)
  const projections = [['tt-model', 800, 'Model Context'], ['tt-ui', 980, 'UI Timeline'], ['tt-snapshot', 1160, 'Snapshot']]
  for (const [id, x, label] of projections) box(items, id, x, 420, 145, 75, label, 'blue', 15)
  for (const [id, x] of projections) arrow(items, `${id}-a`, 1040, 345, x + 72, 414, 'derive', colors.teal[1], '7 6')
  box(items, 'tt-projection-note', 820, 545, 440, 58, '投影可删可重建，不能反写业务真相', 'amber', 16)
  line(items, 'tt-divider', 700, 135, 700, 675, muted, '8 7')
  await writeDiagram('qi-pi-v2-two-truths', 1400, 720, 'qi-pi 2.0 两个事实边界', 'Context Graph 与 Session Event Log 分别承担进程内事实和持久事实。', items)
}

{
  const items = []
  text(items, 'sp-title', 50, 58, '一次输入先成为 Durable Submission，再进入 Agent', { size: 32, weight: 700 })
  text(items, 'sp-sub', 52, 94, '202 Accepted 只证明命令已落盘；真正完成要等待 turn/end。', { size: 17, color: muted })
  const steps = [
    ['sp-channel', 45, 'Web / Blog\nLive2D / App', 'amber'],
    ['sp-host', 260, 'Host\nauth + DTO', 'amber'],
    ['sp-command', 475, 'Command Service\nadmission + idempotency', 'blue'],
    ['sp-tx', 720, 'SQLite Transaction\naccepted + projection + outbox', 'teal'],
    ['sp-worker', 995, 'Worker + Lease\nclaim + fencing', 'blue'],
    ['sp-actor', 1205, 'Session Actor\nFIFO dispatch', 'violet'],
  ]
  for (const [id, x, label, color] of steps) box(items, id, x, 230, id === 'sp-tx' ? 230 : 170, 105, label, color, 16)
  for (let i = 0; i < steps.length - 1; i += 1) {
    const width = steps[i][0] === 'sp-tx' ? 230 : 170
    arrow(items, `sp-a${i}`, steps[i][1] + width, 282, steps[i + 1][1] - 6, 282, i === 2 ? 'commit' : '')
  }
  box(items, 'sp-receipt', 520, 430, 300, 90, 'HTTP 202 Receipt\noperationId · submissionId\ndurableCursor', 'amber', 17)
  arrow(items, 'sp-receipt-a', 835, 335, 700, 424, '提交后即可返回', colors.amber[1])
  box(items, 'sp-turn', 1030, 430, 300, 90, 'Active Turn\nmodel · tools · approval\n最终产生 turn/end', 'violet', 17)
  arrow(items, 'sp-turn-a', 1290, 335, 1180, 424, '异步继续', colors.violet[1])
  box(items, 'sp-rule', 230, 600, 940, 64, 'submission/completed ≠ turn/end　　Receipt 生命周期 ≠ Agent 回答生命周期', 'rose', 19)
  await writeDiagram('qi-pi-v2-submission-path', 1400, 730, 'qi-pi 2.0 Durable Submission 写路径', '命令从 Channel 经 Host、Command Service、SQLite、Worker 和 Lease 进入 Session Actor。', items)
}

{
  const items = []
  text(items, 'sa-title', 50, 58, 'Session Actor：控制命令可以穿过正在运行的 Turn', { size: 32, weight: 700 })
  text(items, 'sa-sub', 52, 94, '同一 Session 严格排序，跨 Session 并行；内存队列不是事实源。', { size: 17, color: muted })
  box(items, 'sa-in', 65, 160, 245, 430, '', 'amber', 18, { dash: '9 7', radius: 25 })
  text(items, 'sa-in-title', 187, 205, 'Submission Queue', { size: 22, weight: 700, align: 'middle' })
  const commands = ['User Input', 'Steer', 'Interrupt', 'Approval', 'Recover', 'Maintenance']
  commands.forEach((label, index) => box(items, `sa-c${index}`, 95, 240 + index * 52, 185, 38, label, 'white', 14))
  box(items, 'sa-loop', 400, 160, 410, 430, '', 'violet', 18, { radius: 25 })
  text(items, 'sa-loop-title', 605, 205, '一个长期 submission loop', { size: 23, weight: 700, align: 'middle' })
  box(items, 'sa-receive', 455, 245, 300, 70, '按 sequence 接收命令\n控制命令优先结算归属', 'violet', 16)
  box(items, 'sa-pending', 455, 355, 300, 70, 'Pending Turn FIFO\n有界队列', 'blue', 16)
  box(items, 'sa-active', 455, 465, 300, 70, '最多一个 Active Turn Task', 'rose', 17)
  arrow(items, 'sa-a1', 310, 375, 394, 375, 'submit')
  arrow(items, 'sa-a2', 605, 315, 605, 349, '')
  arrow(items, 'sa-a3', 605, 425, 605, 459, '')
  box(items, 'sa-cross', 900, 165, 425, 190, '跨 Session 并行\nSession A Actor　Session B Actor\nSession C Actor　Session D Actor', 'teal', 19)
  box(items, 'sa-cold', 900, 405, 425, 150, '空闲 600s 后回收\n下次从 SQLite Event Log 冷恢复\nActor state 不进入持久化', 'blue', 17)
  text(items, 'sa-rule', 700, 675, '不需要全局锁；也不允许每个 HTTP 请求绕过 Actor 随意启动 Turn。', { size: 18, color: muted, align: 'middle' })
  await writeDiagram('qi-pi-v2-session-actor', 1400, 730, 'qi-pi 2.0 Session Actor', '同一 Session 的输入、Steer、Interrupt、Approval 和 Recover 如何排序。', items)
}

{
  const items = []
  text(items, 'tl-title', 50, 58, 'Tool 的难点不是调用函数，而是知道崩溃前走到了哪里', { size: 31, weight: 700 })
  text(items, 'tl-sub', 52, 94, '准备与提交按模型顺序；只有执行主体可以并行。', { size: 17, color: muted })
  const flow = [
    ['tl-freeze', 35, 'freeze args\noperation id', 'blue'],
    ['tl-pre', 225, 'pre-execute\ndeny check', 'violet'],
    ['tl-approval', 415, 'approval\nmonotonic guards', 'amber'],
    ['tl-prepared', 605, 'LEDGER\nprepared', 'teal'],
    ['tl-dispatched', 795, 'LEDGER\ndispatched', 'rose'],
    ['tl-body', 985, 'wrappers\ntool body', 'violet'],
    ['tl-post', 1175, 'materialize + post\nfinalize + freeze', 'blue'],
    ['tl-commit', 1365, 'persistent result\nledger committed', 'teal'],
  ]
  for (const [id, x, label, color] of flow) box(items, id, x, 180, 155, 90, label, color, 14)
  for (let i = 0; i < flow.length - 1; i += 1) arrow(items, `tl-a${i}`, flow[i][1] + 155, 225, flow[i + 1][1] - 6, 225)
  box(items, 'tl-crash', 700, 350, 350, 90, 'CRASH WINDOW\n请求可能已到外部系统\n但本地尚无最终结果', 'rose', 17)
  arrow(items, 'tl-crash-a', 875, 270, 875, 344, 'process dies', colors.rose[1])
  const decisions = [
    ['tl-value', 100, '有 durable value\n直接完成', 'teal'],
    ['tl-reconcile', 375, '可 reconcile\n查询外部结果', 'blue'],
    ['tl-retry', 650, '只读 / 幂等\n原 key 重试', 'amber'],
    ['tl-attention', 925, '修改型结果未知\nattention_required', 'rose'],
  ]
  for (const [id, x, label, color] of decisions) box(items, id, x, 535, 225, 90, label, color, 16)
  arrow(items, 'tl-recovery-a', 875, 440, 875, 510, 'recovery reducer')
  text(items, 'tl-rule', 800, 700, '“没有 tool/result”不能推出“工具没有产生副作用”。', { size: 20, weight: 700, color: colors.rose[1], align: 'middle' })
  await writeDiagram('qi-pi-v2-tool-ledger', 1600, 750, 'qi-pi 2.0 Tool Ledger', '工具执行边界以及进程崩溃后的恢复决策。', items)
}

{
  const items = []
  text(items, 'pc-title', 50, 58, '安装插件包，只是让 Catalog 看见它', { size: 33, weight: 700 })
  text(items, 'pc-sub', 52, 94, 'Profile、Bundle 与 cordis.yml 才决定当前 Context Tree 激活哪些能力。', { size: 17, color: muted })
  box(items, 'pc-distributions', 55, 155, 360, 490, '', 'blue', 18, { dash: '9 7', radius: 25 })
  text(items, 'pc-dist-title', 235, 200, 'Installed Distributions', { size: 23, weight: 700, align: 'middle' })
  const distributions = ['qi-agent-standard', 'qi-agent-workflow', 'qi-agent-coding', 'qi-agent-collaboration', 'qi-agent-persona', 'providers / products / media']
  distributions.forEach((label, index) => box(items, `pc-d${index}`, 95, 235 + index * 57, 280, 42, label, 'white', 14))
  box(items, 'pc-compose', 505, 155, 360, 490, '', 'amber', 18, { radius: 25 })
  text(items, 'pc-compose-title', 685, 200, 'Bootstrap / Loader', { size: 23, weight: 700, align: 'middle' })
  const loader = ['Catalog discovery', 'Profile + Bundle', 'Context Tree diff', 'Preflight candidates', 'Mount + quiescence', 'Postcondition / rollback']
  loader.forEach((label, index) => box(items, `pc-l${index}`, 555, 235 + index * 57, 260, 42, label, index > 2 ? 'amber' : 'white', 14))
  box(items, 'pc-context', 955, 155, 390, 490, '', 'violet', 18, { radius: 25 })
  text(items, 'pc-context-title', 1150, 200, 'Active Context Tree', { size: 23, weight: 700, align: 'middle' })
  box(items, 'pc-service', 1010, 245, 280, 75, 'ctx.provide()\nService Truth', 'violet', 17)
  box(items, 'pc-inject', 1010, 355, 280, 75, 'inject\nActivation dependency', 'blue', 17)
  box(items, 'pc-owner', 1010, 465, 280, 105, 'Activation owns\nService · Event · Tool\nRoute · Task · Resource', 'teal', 16)
  arrow(items, 'pc-a1', 415, 400, 499, 400, 'discover')
  arrow(items, 'pc-a2', 865, 400, 949, 400, 'mount')
  text(items, 'pc-rule', 700, 705, 'Loader 不根据 Manifest 猜 Service Graph；真实服务状态只来自 Context。', { size: 19, color: colors.violet[1], weight: 700, align: 'middle' })
  await writeDiagram('qi-pi-v2-plugin-composition', 1400, 760, 'qi-pi 2.0 插件组合', 'Distribution、Loader、Profile 与 Active Context Tree 的关系。', items)
}

console.log('generated 6 qi-pi 2.0 diagrams')
