import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const sourceDir = join(root, 'docs/diagrams/postgresql')
const outputDir = join(root, 'public/images/blog/postgresql')

const palette = {
  ink: '#1f2937',
  muted: '#64748b',
  paper: '#fffdf7',
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
}

const font = "'Comic Sans MS','Bradley Hand','Marker Felt','PingFang SC','Microsoft YaHei',sans-serif"

function esc(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

function multiline(textValue, x, y, size = 20, fill = palette.ink, weight = 400, anchor = 'start') {
  const lines = String(textValue).split('\n')
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${fill}" font-family="${font}" font-size="${size}" font-weight="${weight}">${lines.map((line, i) => `<tspan x="${x}" dy="${i ? size * 1.25 : 0}">${esc(line)}</tspan>`).join('')}</text>`
}

function rect(x, y, w, h, fill, stroke = palette.ink, radius = 18, opacity = 1) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="3" stroke-linejoin="round"/>`
}

function line(x1, y1, x2, y2, stroke = palette.ink, width = 3, dash = '') {
  return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
}

function arrow(x1, y1, x2, y2, label = '', labelX = (x1 + x2) / 2, labelY = (y1 + y2) / 2 - 10) {
  const angle = Math.atan2(y2 - y1, x2 - x1)
  const size = 11
  const a = `${x2 - size * Math.cos(angle - Math.PI / 6)},${y2 - size * Math.sin(angle - Math.PI / 6)}`
  const b = `${x2 - size * Math.cos(angle + Math.PI / 6)},${y2 - size * Math.sin(angle + Math.PI / 6)}`
  return `${line(x1, y1, x2, y2)}<path d="M ${a} L ${x2},${y2} L ${b}" fill="none" stroke="${palette.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${label ? multiline(label, labelX, labelY, 16, palette.muted, 400, 'middle') : ''}`
}

function frame(width, height, title, subtitle, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${esc(title)}</title><desc id="desc">${esc(subtitle)}</desc>
  <rect width="${width}" height="${height}" fill="${palette.paper}"/>
  ${multiline(title, 48, 58, 32, palette.ink, 700)}
  ${multiline(subtitle, 50, 95, 18, palette.muted)}
  ${body}
</svg>`
}

function element(type, id, props) {
  return { type, id, ...props, version: 1, versionNonce: 1, isDeleted: false, seed: 1, groupIds: [], frameId: null, boundElements: props.boundElements ?? null, updated: 1, link: null, locked: false }
}

function sourceFile(name, elements, width, height) {
  return JSON.stringify({
    type: 'excalidraw',
    version: 2,
    source: 'codex-excalidraw-skill',
    elements,
    appState: { viewBackgroundColor: palette.paper, gridSize: null, gridStep: 5 },
    files: {},
    metadata: { width, height, purpose: 'PostgreSQL article architecture diagram' },
  }, null, 2) + '\n'
}

function labelInBox(id, x, y, w, h, textValue, fill, stroke, size = 20) {
  const labelId = `${id}-label`
  return [
    element('rectangle', id, { x, y, width: w, height: h, backgroundColor: fill, fillStyle: 'solid', strokeColor: stroke, strokeWidth: 2, roughness: 2, roundness: { type: 3 }, boundElements: [{ id: labelId, type: 'text' }] }),
    element('text', labelId, { x: x + 12, y: y + h / 2 - size * 0.6, width: w - 24, height: h, text: textValue, fontSize: size, fontFamily: 1, textAlign: 'center', verticalAlign: 'middle', containerId: id, strokeColor: palette.ink }),
  ]
}

function arrowElement(id, x1, y1, x2, y2, stroke = palette.ink) {
  return element('arrow', id, {
    x: x1,
    y: y1,
    width: x2 - x1,
    height: y2 - y1,
    points: [[0, 0], [x2 - x1, y2 - y1]],
    endArrowhead: 'arrow',
    strokeColor: stroke,
    strokeWidth: 2,
    roughness: 2,
  })
}

const diagrams = {
  'pg-query-path': {
    width: 1200,
    height: 690,
    title: '一次 SELECT：先理解，再规划，最后取数据',
    subtitle: '把 SQL 想成一张订单，数据库内部的每一站都有自己的职责',
    body: () => `${rect(48, 135, 1104, 490, '#ffffff', palette.ink, 26)}
      ${multiline('SQL 查询', 98, 190, 24, palette.ink, 700)}
      ${rect(78, 220, 280, 120, palette.amber, palette.amberStroke)}
      ${multiline('SELECT name, price\nFROM products\nWHERE price < 100', 218, 264, 20, palette.ink, 400, 'middle')}
      ${multiline('数据库内部', 600, 190, 24, palette.ink, 700, 'middle')}
      ${rect(410, 220, 210, 115, palette.blue, palette.blueStroke)}
      ${multiline('Parser +\nAnalyzer', 515, 266, 23, palette.ink, 700, 'middle')}
      ${rect(690, 220, 210, 115, palette.violet, palette.violetStroke)}
      ${multiline('Planner', 795, 276, 23, palette.ink, 700, 'middle')}
      ${rect(970, 220, 145, 115, palette.teal, palette.tealStroke)}
      ${multiline('Executor', 1042, 276, 22, palette.ink, 700, 'middle')}
      ${arrow(358, 280, 404, 280, '语法和对象', 382, 255)}
      ${arrow(620, 280, 684, 280, '选路径', 652, 255)}
      ${arrow(900, 280, 964, 280, '拿页面', 932, 255)}
      ${rect(140, 420, 900, 132, '#f8fafc', palette.muted, 20)}
      ${multiline('Planner 会比较两条路：', 185, 465, 20, palette.ink, 700)}
      ${rect(430, 435, 230, 72, palette.blue, palette.blueStroke, 14)}
      ${multiline('全表扫描', 545, 480, 20, palette.ink, 700, 'middle')}
      ${rect(710, 435, 230, 72, palette.violet, palette.violetStroke, 14)}
      ${multiline('走 B-Tree 索引', 825, 480, 20, palette.ink, 700, 'middle')}
      ${multiline('结果：只把真正需要的行交给客户端', 600, 595, 21, palette.muted, 400, 'middle')}`,
    elements: [
      element('rectangle', 'query-paper', { x: 0, y: 0, width: 1200, height: 690, backgroundColor: palette.paper, fillStyle: 'solid', strokeColor: 'transparent', strokeWidth: 0, roughness: 0 }),
      ...labelInBox('query-sql', 78, 220, 280, 120, 'SELECT\nWHERE', palette.amber, palette.amberStroke),
      ...labelInBox('query-parser', 410, 220, 210, 115, 'Parser + Analyzer', palette.blue, palette.blueStroke),
      ...labelInBox('query-planner', 690, 220, 210, 115, 'Planner', palette.violet, palette.violetStroke),
      ...labelInBox('query-executor', 970, 220, 145, 115, 'Executor', palette.teal, palette.tealStroke),
      arrowElement('query-arrow-parse', 358, 280, 404, 280),
      arrowElement('query-arrow-plan', 620, 280, 684, 280),
      arrowElement('query-arrow-execute', 900, 280, 964, 280),
    ],
  },
  'pg-page': {
    width: 1200,
    height: 650,
    title: '一张 8KB 数据页，里面到底装了什么？',
    subtitle: '页面是 PostgreSQL 读写磁盘时真正搬运的“小箱子”',
    body: () => `${rect(60, 140, 720, 440, '#ffffff', palette.ink, 26)}
      ${multiline('Page（通常 8KB）', 420, 190, 26, palette.ink, 700, 'middle')}
      ${rect(105, 220, 630, 60, palette.blue, palette.blueStroke, 12)}${multiline('Page Header：页头，记录页面自己的信息', 420, 258, 19, palette.ink, 700, 'middle')}
      ${rect(105, 295, 630, 58, palette.violet, palette.violetStroke, 12)}${multiline('Line Pointer Array：行目录，指向每条记录', 420, 332, 19, palette.ink, 700, 'middle')}
      ${rect(105, 368, 630, 48, palette.paper, palette.muted, 12)}${multiline('Free Space：还可以继续放数据的空闲区', 420, 399, 18, palette.muted, 700, 'middle')}
      ${rect(105, 431, 630, 105, palette.teal, palette.tealStroke, 12)}${multiline('Tuple Data：真正的行数据\n旧版本和新版本可能同时存在', 420, 470, 19, palette.ink, 700, 'middle')}
      ${rect(835, 205, 300, 280, palette.rose, palette.roseStroke, 22)}
      ${multiline('MVCC', 985, 260, 28, palette.ink, 700, 'middle')}
      ${multiline('一次 UPDATE 不会\n直接抹掉旧行。\n\n读事务看旧版本，\n新事务看新版本。', 985, 310, 19, palette.ink, 400, 'middle')}
      ${arrow(735, 468, 828, 340, '版本可见性', 790, 404)}
      ${multiline('所以 VACUUM 要清理“已经没人需要”的旧版本', 600, 615, 19, palette.muted, 400, 'middle')}`,
    elements: [
      element('rectangle', 'page-paper', { x: 0, y: 0, width: 1200, height: 650, backgroundColor: palette.paper, fillStyle: 'solid', strokeColor: 'transparent', strokeWidth: 0, roughness: 0 }),
      ...labelInBox('page-header', 105, 220, 630, 60, 'Page Header', palette.blue, palette.blueStroke, 18),
      ...labelInBox('page-pointers', 105, 295, 630, 58, 'Line Pointer Array', palette.violet, palette.violetStroke, 18),
      ...labelInBox('page-free', 105, 368, 630, 48, 'Free Space', palette.paper, palette.muted, 18),
      ...labelInBox('page-tuples', 105, 431, 630, 105, 'Tuple Data\nMVCC versions', palette.teal, palette.tealStroke, 18),
      ...labelInBox('page-mvcc', 835, 205, 300, 280, 'MVCC\nold + new versions', palette.rose, palette.roseStroke, 22),
      arrowElement('page-arrow-mvcc', 735, 468, 828, 340),
    ],
  },
  'pg-btree-wal': {
    width: 1200,
    height: 720,
    title: 'B-Tree 负责找路，WAL 负责留证据',
    subtitle: '一个解决“怎么快点找到”，一个解决“崩溃后怎么恢复”',
    body: () => `${rect(55, 135, 1090, 290, palette.blue, palette.blueStroke, 26)}
      ${multiline('B-Tree 索引：像一本按字母排列的电话簿', 600, 180, 24, palette.ink, 700, 'middle')}
      ${rect(155, 230, 170, 82, '#ffffff', palette.blueStroke, 16)}${multiline('root', 240, 281, 22, palette.ink, 700, 'middle')}
      ${line(240, 312, 170, 345, palette.ink, 3)}${line(240, 312, 310, 345, palette.ink, 3)}
      ${rect(95, 345, 150, 55, '#ffffff', palette.blueStroke, 14)}${multiline('A–M', 170, 380, 20, palette.ink, 700, 'middle')}
      ${rect(260, 345, 150, 55, '#ffffff', palette.blueStroke, 14)}${multiline('N–Z', 335, 380, 20, palette.ink, 700, 'middle')}
      ${rect(500, 225, 540, 125, '#ffffff', palette.blueStroke, 18)}${multiline('找到键以后，索引给出 TID：\n“去第几页、这一页的第几行取货”', 770, 276, 21, palette.ink, 700, 'middle')}
      ${arrow(410, 372, 492, 300, '定位', 452, 333)}
      ${rect(55, 465, 1090, 170, palette.amber, palette.amberStroke, 26)}
      ${multiline('WAL：像改货物前先写好的收据', 600, 515, 24, palette.ink, 700, 'middle')}
      ${rect(135, 550, 310, 58, '#ffffff', palette.amberStroke, 14)}${multiline('UPDATE：余额 100 → 80', 290, 586, 20, palette.ink, 700, 'middle')}
      ${rect(520, 550, 310, 58, '#ffffff', palette.amberStroke, 14)}${multiline('先写 WAL，再改数据页', 675, 586, 20, palette.ink, 700, 'middle')}
      ${rect(905, 550, 170, 58, '#ffffff', palette.amberStroke, 14)}${multiline('可重放', 990, 586, 20, palette.ink, 700, 'middle')}
      ${arrow(445, 579, 512, 579, '', 0, 0)}${arrow(830, 579, 897, 579, '', 0, 0)}`,
    elements: [
      element('rectangle', 'btree-wal-paper', { x: 0, y: 0, width: 1200, height: 720, backgroundColor: palette.paper, fillStyle: 'solid', strokeColor: 'transparent', strokeWidth: 0, roughness: 0 }),
      ...labelInBox('btree-root', 155, 230, 170, 82, 'root', '#ffffff', palette.blueStroke, 20),
      ...labelInBox('btree-left', 95, 345, 150, 55, 'A–M', '#ffffff', palette.blueStroke, 18),
      ...labelInBox('btree-right', 260, 345, 150, 55, 'N–Z', '#ffffff', palette.blueStroke, 18),
      ...labelInBox('wal-update', 135, 550, 310, 58, 'UPDATE', '#ffffff', palette.amberStroke, 18),
      ...labelInBox('wal-write', 520, 550, 310, 58, 'WAL → Page', '#ffffff', palette.amberStroke, 18),
      ...labelInBox('wal-replay', 905, 550, 170, 58, 'Replay', '#ffffff', palette.amberStroke, 18),
      arrowElement('btree-arrow-left', 240, 312, 170, 345),
      arrowElement('btree-arrow-right', 240, 312, 335, 345),
      arrowElement('btree-arrow-tid', 410, 372, 492, 300),
      arrowElement('wal-arrow-write', 445, 579, 512, 579),
      arrowElement('wal-arrow-replay', 830, 579, 897, 579),
    ],
  },
  'pg-process-cache': {
    width: 1200,
    height: 690,
    title: '连接很多，不等于数据库要开很多份缓存',
    subtitle: '每个连接有自己的 Backend，但 Shared Buffers 是大家共享的暂存区',
    body: () => `${rect(55, 140, 1090, 450, '#ffffff', palette.ink, 26)}
      ${multiline('客户端侧', 180, 195, 23, palette.ink, 700, 'middle')}
      ${rect(90, 230, 180, 92, palette.amber, palette.amberStroke, 16)}${multiline('Web / API', 180, 286, 21, palette.ink, 700, 'middle')}
      ${rect(320, 230, 180, 92, palette.amber, palette.amberStroke, 16)}${multiline('PgBouncer', 410, 286, 21, palette.ink, 700, 'middle')}
      ${arrow(270, 276, 312, 276, '复用连接', 291, 250)}
      ${multiline('PostgreSQL 内部', 815, 195, 23, palette.ink, 700, 'middle')}
      ${rect(610, 220, 210, 115, palette.blue, palette.blueStroke, 18)}${multiline('Backend 1', 715, 274, 22, palette.ink, 700, 'middle')}
      ${rect(875, 220, 210, 115, palette.blue, palette.blueStroke, 18)}${multiline('Backend 2', 980, 274, 22, palette.ink, 700, 'middle')}
      ${arrow(500, 276, 602, 276, '', 0, 0)}
      ${rect(335, 400, 530, 115, palette.violet, palette.violetStroke, 20)}${multiline('Shared Buffers\n所有 Backend 共享的热数据暂存区', 600, 450, 23, palette.ink, 700, 'middle')}
      ${line(715, 335, 600, 395, palette.ink, 3)}${line(980, 335, 715, 395, palette.ink, 3)}
      ${rect(900, 400, 185, 115, palette.teal, palette.tealStroke, 18)}${multiline('磁盘\n持久数据', 992, 448, 21, palette.ink, 700, 'middle')}
      ${arrow(865, 458, 892, 458, '淘汰/写回', 878, 430)}
      ${multiline('连接池减少连接开销；共享缓冲区减少磁盘读取。两者解决的不是同一个问题。', 600, 560, 18, palette.muted, 400, 'middle')}`,
    elements: [
      element('rectangle', 'process-paper', { x: 0, y: 0, width: 1200, height: 690, backgroundColor: palette.paper, fillStyle: 'solid', strokeColor: 'transparent', strokeWidth: 0, roughness: 0 }),
      ...labelInBox('process-client', 90, 230, 180, 92, 'Web / API', palette.amber, palette.amberStroke, 19),
      ...labelInBox('process-pool', 320, 230, 180, 92, 'PgBouncer', palette.amber, palette.amberStroke, 19),
      ...labelInBox('process-backend1', 610, 220, 210, 115, 'Backend 1', palette.blue, palette.blueStroke, 19),
      ...labelInBox('process-backend2', 875, 220, 210, 115, 'Backend 2', palette.blue, palette.blueStroke, 19),
      ...labelInBox('process-buffers', 335, 400, 530, 115, 'Shared Buffers', palette.violet, palette.violetStroke, 22),
      ...labelInBox('process-disk', 900, 400, 185, 115, 'Disk', palette.teal, palette.tealStroke, 20),
      arrowElement('process-arrow-pool', 270, 276, 312, 276),
      arrowElement('process-arrow-backend', 500, 276, 602, 276),
      arrowElement('process-arrow-buffer-1', 715, 335, 600, 395),
      arrowElement('process-arrow-buffer-2', 980, 335, 715, 395),
      arrowElement('process-arrow-disk', 865, 458, 892, 458),
    ],
  },
}

await mkdir(sourceDir, { recursive: true })
await mkdir(outputDir, { recursive: true })

for (const [name, diagram] of Object.entries(diagrams)) {
  await writeFile(join(sourceDir, `${name}.excalidraw`), sourceFile(name, diagram.elements, diagram.width, diagram.height), 'utf8')
  await writeFile(join(outputDir, `${name}.svg`), frame(diagram.width, diagram.height, diagram.title, diagram.subtitle, diagram.body()), 'utf8')
  console.log(`generated ${name}`)
}
