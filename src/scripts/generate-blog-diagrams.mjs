import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

const root = process.cwd()
const sourceDir = path.join(root, 'public/images/blog/generated')

const palette = {
  ink: '#172033',
  muted: '#657083',
  line: '#CBD3DE',
  soft: '#F5F7FA',
  teal: '#4F8FA5',
  tealSoft: '#DDECF0',
  orange: '#EE995B',
  orangeSoft: '#FBE8D9',
  coral: '#C95B5B',
  coralSoft: '#F4DEDE',
  violet: '#8A74B5',
  violetSoft: '#E9E4F2',
  green: '#5D9872',
  greenSoft: '#E1EFE6',
  white: '#FFFFFF'
}

const esc = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const text = (x, y, value, options = {}) => {
  const {
    size = 28,
    weight = 500,
    fill = palette.ink,
    anchor = 'middle',
    family = 'Inter, PingFang SC, Noto Sans CJK SC, sans-serif',
    opacity = 1
  } = options

  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="${family}" font-size="${size}" font-weight="${weight}" fill="${fill}" opacity="${opacity}">${esc(value)}</text>`
}

const rect = (x, y, width, height, options = {}) => {
  const {
    fill = palette.white,
    stroke = palette.line,
    strokeWidth = 2,
    radius = 18,
    opacity = 1,
    dash = ''
  } = options

  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
}

const line = (x1, y1, x2, y2, options = {}) => {
  const {
    stroke = palette.line,
    strokeWidth = 3,
    marker = true,
    dash = '',
    opacity = 1
  } = options

  return `<path d="M ${x1} ${y1} L ${x2} ${y2}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"${dash ? ` stroke-dasharray="${dash}"` : ''}${marker ? ' marker-end="url(#arrow)"' : ''}/>`
}

const curve = (d, options = {}) => {
  const {
    stroke = palette.line,
    strokeWidth = 3,
    marker = true,
    dash = '',
    opacity = 1
  } = options
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" opacity="${opacity}"${dash ? ` stroke-dasharray="${dash}"` : ''}${marker ? ' marker-end="url(#arrow)"' : ''}/>`
}

const pill = (x, y, width, label, color, soft, options = {}) =>
  [
    rect(x, y, width, options.height ?? 60, {
      fill: soft,
      stroke: color,
      radius: options.radius ?? 14,
      strokeWidth: 2
    }),
    text(x + width / 2, y + (options.height ?? 60) / 2 + 10, label, {
      size: options.size ?? 24,
      weight: options.weight ?? 650,
      fill: color
    })
  ].join('')

const panelTitle = (x, y, label, color = palette.muted) =>
  text(x, y, label, { size: 25, weight: 700, fill: color })

const meaningBox = (rows) => {
  const y = 790
  const height = 155
  const labels = rows.map((row) => row[0])
  const values = rows.map((row) => row[1])

  return [
    rect(70, y, 1460, height, {
      fill: '#F8FAFC',
      stroke: '#D9E0E8',
      radius: 16,
      strokeWidth: 2
    }),
    ...labels.map((label, index) =>
      text(105, y + 39 + index * 45, label, {
        size: 21,
        weight: 700,
        fill: palette.ink,
        anchor: 'start'
      })
    ),
    ...values.map((value, index) =>
      text(245, y + 39 + index * 45, value, {
        size: 20,
        weight: 450,
        fill: palette.muted,
        anchor: 'start'
      })
    )
  ].join('')
}

const base = (body, subject, options = {}) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${options.width ?? 1600}" height="${options.height ?? 1000}" viewBox="0 0 ${options.width ?? 1600} ${options.height ?? 1000}" role="img" aria-label="${esc(subject)}">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke"/>
    </marker>
  </defs>
  <rect width="100%" height="100%" fill="#FFFFFF"/>
  ${body}
  ${text(800, 978, subject, { size: 17, weight: 450, fill: '#98A1AF' })}
</svg>`

function piFourLayers() {
  const layers = [
    ['交互层 · pi-coding-agent', 'TUI · CLI · session tree · extensions', palette.violet, palette.violetSoft],
    ['执行层 · agent loop', 'message → model → tool → observation → stop', palette.teal, palette.tealSoft],
    ['核心层 · pi-agent-core', 'state · events · tool contract · context management', palette.orange, palette.orangeSoft],
    ['模型层 · pi-ai', 'OpenAI · Anthropic · Google · local providers', palette.green, palette.greenSoft]
  ]

  const body = [
    text(800, 72, 'Pi 的四层不是四张海报，而是四组稳定接口', {
      size: 40,
      weight: 750
    }),
    text(800, 120, '上层只依赖下层契约；模型、工具和界面都可以独立替换', {
      size: 24,
      fill: palette.muted
    }),
    ...layers.flatMap(([title, subtitle, color, soft], index) => {
      const y = 180 + index * 135
      return [
        rect(220, y, 1160, 100, { fill: soft, stroke: color, radius: 18, strokeWidth: 2 }),
        text(270, y + 40, title, { size: 27, weight: 750, fill: color, anchor: 'start' }),
        text(270, y + 76, subtitle, { size: 21, fill: palette.ink, anchor: 'start' }),
        index < layers.length - 1
          ? line(800, y + 101, 800, y + 130, { stroke: color, strokeWidth: 3 })
          : ''
      ]
    }),
    pill(50, 315, 130, '扩展 API', palette.coral, palette.coralSoft, { size: 20 }),
    line(180, 345, 218, 345, { stroke: palette.coral }),
    pill(1420, 315, 130, '工具契约', palette.coral, palette.coralSoft, { size: 20 }),
    line(1420, 345, 1382, 345, { stroke: palette.coral }),
    meaningBox([
      ['边界', 'Provider 只负责模型协议；Core 维护状态；Loop 调度工具；UI/Extension 面向用户。'],
      ['契约', '层间传递结构化 message、tool schema、event 与 result，不共享隐式实现细节。'],
      ['替换', '更换模型、终端界面或扩展包时，Agent Core 与会话状态无需重写。']
    ])
  ].join('')

  return base(body, 'Pi 四层可替换架构')
}

function piAgentLoop() {
  const stages = [
    ['请求', 'user message', palette.teal, palette.tealSoft],
    ['推理', 'model response', palette.violet, palette.violetSoft],
    ['校验', 'schema + permission', palette.orange, palette.orangeSoft],
    ['执行', 'tool handler', palette.coral, palette.coralSoft],
    ['观察', 'structured result', palette.green, palette.greenSoft]
  ]
  const xs = [90, 380, 670, 960, 1250]

  const body = [
    text(800, 72, '下一步 = f（当前会话状态，模型输出，工具结果）', {
      size: 38,
      weight: 750
    }),
    text(800, 122, '循环不是无限重试：每一轮都有类型检查、权限边界和明确退出条件', {
      size: 23,
      fill: palette.muted
    }),
    ...stages.flatMap(([title, subtitle, color, soft], index) => [
      rect(xs[index], 275, 220, 145, { fill: soft, stroke: color, radius: 18 }),
      text(xs[index] + 110, 330, title, { size: 30, weight: 750, fill: color }),
      text(xs[index] + 110, 375, subtitle, { size: 19, fill: palette.ink }),
      index < stages.length - 1
        ? line(xs[index] + 220, 347, xs[index + 1] - 18, 347, { stroke: palette.muted })
        : ''
    ]),
    curve('M 1360 420 C 1360 610, 490 650, 490 435', {
      stroke: palette.teal,
      strokeWidth: 4
    }),
    text(910, 618, '需要继续：把 observation 追加到会话，再次调用模型', {
      size: 23,
      weight: 650,
      fill: palette.teal
    }),
    line(1360, 420, 1360, 690, { stroke: palette.green, strokeWidth: 4 }),
    pill(1220, 690, 280, '完成 / 拒绝 / 预算耗尽', palette.green, palette.greenSoft, {
      size: 21
    }),
    pill(650, 500, 300, '失败 → 结构化错误 → 模型恢复', palette.coral, palette.coralSoft, {
      size: 20
    }),
    line(1070, 420, 930, 500, { stroke: palette.coral, dash: '8 7' }),
    curve('M 650 530 C 540 530, 490 485, 490 435', {
      stroke: palette.coral,
      strokeWidth: 3,
      dash: '8 7'
    }),
    meaningBox([
      ['状态', '会话历史、工具结果、预算、取消信号和当前分支共同决定下一轮。'],
      ['边界', '模型只提出 tool call；运行时负责 schema 校验、授权和真正执行。'],
      ['退出', '最终回答、显式拒绝、不可恢复错误、取消或资源预算耗尽都会停止循环。']
    ])
  ].join('')

  return base(body, 'Pi Agent Loop')
}

function piExtensions() {
  const xs = [70, 310, 550, 790, 1030, 1270]
  const stages = [
    ['发现', '扫描包/目录', palette.teal, palette.tealSoft],
    ['声明', 'manifest', palette.violet, palette.violetSoft],
    ['校验', 'schema/version', palette.orange, palette.orangeSoft],
    ['注册', 'registry', palette.green, palette.greenSoft],
    ['分发', 'name → handler', palette.coral, palette.coralSoft],
    ['返回', 'result/error', palette.teal, palette.tealSoft]
  ]

  const body = [
    text(800, 68, '插件即插即用 = 发现 + 契约 + 注册 + 隔离执行', {
      size: 40,
      weight: 760
    }),
    text(800, 116, 'Agent Core 不认识插件实现，只认识能力声明与统一调用协议', {
      size: 24,
      fill: palette.muted
    }),
    ...stages.flatMap(([title, subtitle, color, soft], index) => [
      rect(xs[index], 245, 180, 130, { fill: soft, stroke: color, radius: 16 }),
      text(xs[index] + 90, 294, title, { size: 29, weight: 750, fill: color }),
      text(xs[index] + 90, 338, subtitle, { size: 18, fill: palette.ink }),
      index < stages.length - 1
        ? line(xs[index] + 180, 310, xs[index + 1] - 18, 310, { stroke: palette.muted })
        : ''
    ]),
    panelTitle(800, 455, 'Extension Registry：能力名与处理器的稳定映射'),
    rect(315, 485, 970, 205, {
      fill: '#FAFBFC',
      stroke: '#B8C1CD',
      radius: 18
    }),
    pill(350, 525, 250, 'tool: browser.search', palette.teal, palette.tealSoft, { size: 19 }),
    pill(675, 525, 250, 'command: /review', palette.violet, palette.violetSoft, { size: 19 }),
    pill(1000, 525, 250, 'provider: local-llm', palette.orange, palette.orangeSoft, { size: 19 }),
    pill(350, 610, 250, 'prompt: coding-style', palette.green, palette.greenSoft, { size: 19 }),
    pill(675, 610, 250, 'ui: status-panel', palette.coral, palette.coralSoft, { size: 19 }),
    pill(1000, 610, 250, 'lifecycle: dispose()', palette.teal, palette.tealSoft, { size: 19 }),
    meaningBox([
      ['契约', 'manifest 声明名称、版本、能力、输入 schema、权限需求和生命周期钩子。'],
      ['隔离', '加载失败、执行超时与结构化错误停留在插件边界，不污染 Agent Core 状态。'],
      ['卸载', '从 registry 移除 handler 并执行 dispose；其他插件和会话协议保持不变。']
    ])
  ].join('')

  return base(body, 'Pi 插件即插即用机制')
}

function attentionQkv() {
  const matrix = (x, y, cols, rows, color, label, shape) => {
    const cell = 23
    const cells = []
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        cells.push(
          rect(x + col * cell, y + row * cell, cell - 3, cell - 3, {
            fill: row === col ? color : `${color}99`,
            stroke: '#FFFFFF',
            strokeWidth: 1,
            radius: 3
          })
        )
      }
    }
    return [
      ...cells,
      text(x + (cols * cell) / 2, y + rows * cell + 32, label, {
        size: 23,
        weight: 700,
        fill: color
      }),
      text(x + (cols * cell) / 2, y + rows * cell + 57, shape, {
        size: 13,
        fill: palette.muted
      })
    ].join('')
  }

  const body = [
    text(800, 62, 'A = softmax((QK^T + M) / sqrt(d_h))   ·   O = AV', {
      size: 42,
      weight: 720,
      family: 'STIX Two Math, Times New Roman, serif'
    }),
    text(800, 112, 'Q、K、V 来自同一个 X，但承担“查询、索引、内容”三种不同语义', {
      size: 23,
      fill: palette.muted
    }),
    panelTitle(150, 195, '输入与线性投影'),
    panelTitle(620, 195, '相关性与因果遮罩'),
    panelTitle(1115, 195, '概率加权与输出'),
    matrix(80, 255, 5, 4, palette.teal, 'X', 'B × T × d'),
    line(205, 302, 315, 302, { stroke: palette.muted }),
    matrix(330, 255, 3, 4, palette.violet, 'Q', 'B × h × T × d_h'),
    matrix(445, 255, 3, 4, palette.orange, 'K', 'B × h × T × d_h'),
    matrix(560, 255, 3, 4, palette.green, 'V', 'B × h × T × d_h'),
    line(630, 302, 710, 302, { stroke: palette.muted }),
    matrix(725, 255, 4, 4, palette.coral, 'S = QK^T/sqrt(d_h)', 'B × h × T × T'),
    text(847, 310, '+', { size: 38, weight: 700, fill: palette.muted }),
    matrix(905, 255, 4, 4, '#8D96A5', 'M', 'causal mask · T × T'),
    line(1005, 302, 1082, 302, { stroke: palette.muted }),
    matrix(1095, 255, 4, 4, palette.orange, 'A = softmax', 'B × h × T × T'),
    text(1215, 310, '×', { size: 38, weight: 700, fill: palette.muted }),
    matrix(1265, 255, 3, 4, palette.green, 'V', 'B × h × T × d_h'),
    line(1342, 302, 1405, 302, { stroke: palette.muted }),
    matrix(1420, 255, 3, 4, palette.teal, 'O', 'B × T × d'),
    rect(725, 520, 360, 160, {
      fill: '#FAFBFC',
      stroke: '#B8C1CD',
      radius: 14
    }),
    ...Array.from({ length: 5 }, (_, row) =>
      Array.from({ length: 5 }, (_, col) =>
        rect(755 + col * 56, 545 + row * 24, 49, 19, {
          fill: col <= row ? palette.orange : palette.white,
          stroke: '#FFFFFF',
          strokeWidth: 1,
          radius: 2,
          opacity: col <= row ? 0.35 + ((row + col) % 3) * 0.2 : 1
        })
      ).join('')
    ).join(''),
    text(905, 713, '每一行只能关注当前位置及其左侧 token', {
      size: 21,
      weight: 650,
      fill: palette.coral
    }),
    meaningBox([
      ['轴', 'B=batch，T=token 位置，h=注意力头数，d_h=d/h；QK^T 收缩最后一个 d_h。'],
      ['对象', 'S 是实数 logits；M 是结构化 mask；A 是每行和为 1 的概率；V 是内容向量。'],
      ['机制', '第 t 行的 A[t,s] 决定从每个历史位置 s 取多少 V[s]，再汇总为 O[t]。']
    ])
  ].join('')

  return base(body, 'Attention 的 QKV、Mask 与加权汇总')
}

function kvCache() {
  const tokenRow = (x, y, count, color, label) => [
    ...Array.from({ length: count }, (_, index) =>
      rect(x + index * 48, y, 40, 48, {
        fill: index === count - 1 ? color : `${color}88`,
        stroke: palette.white,
        strokeWidth: 2,
        radius: 7
      })
    ),
    text(x + (count * 48) / 2 - 4, y + 82, label, {
      size: 19,
      weight: 650,
      fill: color
    })
  ].join('')

  const body = [
    text(800, 65, 'Prefill 写入 K/V；Decode 只追加新 K/V，并复用全部历史缓存', {
      size: 37,
      weight: 740
    }),
    text(800, 112, '缓存省下的是历史 token 的 K/V 投影，不是注意力读取，也不是模型参数', {
      size: 23,
      fill: palette.muted
    }),
    panelTitle(800, 185, 'Prefill · 一次处理完整提示词'),
    tokenRow(95, 245, 7, palette.teal, 'tokens · B × T'),
    line(435, 270, 535, 270, { stroke: palette.muted }),
    pill(550, 230, 230, 'QKV projection', palette.violet, palette.violetSoft, { size: 20, height: 80 }),
    line(780, 270, 880, 270, { stroke: palette.muted }),
    rect(895, 215, 520, 110, {
      fill: '#F8FAFC',
      stroke: palette.orange,
      radius: 14
    }),
    tokenRow(925, 238, 7, palette.orange, 'K cache · B × h × T × d_h'),
    text(1380, 260, '+', { size: 32, weight: 700, fill: palette.muted }),
    text(1380, 300, 'V', { size: 25, weight: 750, fill: palette.green }),
    panelTitle(800, 430, 'Decode · 每次只处理一个新 token'),
    tokenRow(95, 490, 1, palette.teal, 'x_t · B × 1'),
    line(155, 515, 285, 515, { stroke: palette.muted }),
    pill(300, 475, 230, 'q_t, k_t, v_t', palette.violet, palette.violetSoft, {
      size: 22,
      height: 80
    }),
    line(530, 515, 650, 515, { stroke: palette.muted }),
    rect(665, 460, 390, 125, {
      fill: '#F8FAFC',
      stroke: palette.orange,
      radius: 14
    }),
    tokenRow(695, 486, 7, palette.orange, '历史 K/V'),
    text(1018, 527, '+', { size: 28, weight: 700, fill: palette.muted }),
    rect(1065, 483, 40, 48, {
      fill: palette.coral,
      stroke: palette.white,
      strokeWidth: 2,
      radius: 7
    }),
    text(1085, 563, '追加 1 格', { size: 18, weight: 650, fill: palette.coral }),
    line(1110, 515, 1210, 515, { stroke: palette.muted }),
    pill(1225, 475, 285, 'q_t K_1:t^T → 1 × T', palette.green, palette.greenSoft, {
      size: 21,
      height: 80
    }),
    text(800, 690, '计算量：每步仍需读取长度 T 的 K/V；显存：每生成一个 token，缓存沿 T 轴增长一格', {
      size: 24,
      weight: 650,
      fill: palette.coral
    }),
    meaningBox([
      ['复用', '历史 K/V 不再重复投影；新 token 仍要生成 q_t、k_t、v_t，并把 k_t、v_t 追加到缓存。'],
      ['形状', 'prefill 的 Q/K/V 含 T 行；decode 的 q_t 只有 1 行，但会与 T 行历史 K 做点积。'],
      ['边界', 'KV cache 降低重复计算，却不会消除随上下文长度增长的读取成本和显存占用。']
    ])
  ].join('')

  return base(body, 'KV Cache：Prefill 与 Decode')
}

function backpropOutput() {
  const body = [
    text(800, 62, '∂C/∂w = (∂C/∂a) · (∂a/∂z) · (∂z/∂w)', {
      size: 44,
      weight: 720,
      family: 'STIX Two Math, Times New Roman, serif'
    }),
    text(800, 112, '链式法则把“一条依赖路径”拆成三个可以局部计算的导数', {
      size: 23,
      fill: palette.muted
    }),
    panelTitle(800, 190, '前向：保存中间量'),
    pill(90, 245, 230, 'w, a⁽ᴸ⁻¹⁾', palette.teal, palette.tealSoft, { size: 24, height: 90 }),
    line(320, 290, 425, 290, { stroke: palette.muted }),
    pill(440, 245, 260, 'z = wa⁽ᴸ⁻¹⁾ + b', palette.violet, palette.violetSoft, {
      size: 23,
      height: 90
    }),
    line(700, 290, 805, 290, { stroke: palette.muted }),
    pill(820, 245, 230, 'a = σ(z)', palette.orange, palette.orangeSoft, { size: 24, height: 90 }),
    line(1050, 290, 1155, 290, { stroke: palette.muted }),
    pill(1170, 245, 340, 'C = ½(a − y)²', palette.coral, palette.coralSoft, {
      size: 24,
      height: 90
    }),
    panelTitle(800, 430, '反向：梯度沿相反方向相乘'),
    pill(1190, 485, 300, '∂C/∂a = a − y', palette.coral, palette.coralSoft, {
      size: 22,
      height: 85
    }),
    line(1190, 527, 1070, 527, { stroke: palette.coral }),
    pill(780, 485, 275, '∂a/∂z = σ′(z)', palette.orange, palette.orangeSoft, {
      size: 22,
      height: 85
    }),
    line(780, 527, 660, 527, { stroke: palette.orange }),
    pill(370, 485, 275, '∂z/∂w = a⁽ᴸ⁻¹⁾', palette.violet, palette.violetSoft, {
      size: 22,
      height: 85
    }),
    line(370, 527, 250, 527, { stroke: palette.violet }),
    pill(70, 485, 165, '∂C/∂w', palette.teal, palette.tealSoft, { size: 24, height: 85 }),
    text(800, 690, '数值检查：前向缓存 a⁽ᴸ⁻¹⁾、z、a；反向时每个局部导数只使用相邻节点', {
      size: 23,
      weight: 650,
      fill: palette.teal
    }),
    meaningBox([
      ['对象', 'w、z、a、C 在单神经元例子中是标量；批量版本会额外保留 batch 轴。'],
      ['路径', 'w 只通过 z 和 a 影响 C，因此总导数等于这条路径上三个局部导数的乘积。'],
      ['实现', '自动微分保存前向计算图和必要中间量，反向按依赖的逆序累积梯度。']
    ])
  ].join('')

  return base(body, '输出层链式法则')
}

function backpropHidden() {
  const node = (x, y, label, color, soft) => [
    `<circle cx="${x}" cy="${y}" r="42" fill="${soft}" stroke="${color}" stroke-width="3"/>`,
    text(x, y + 9, label, { size: 24, weight: 750, fill: color })
  ].join('')

  const body = [
    text(800, 62, 'δ⁽ᴸ⁻¹⁾ = (W⁽ᴸ⁾)ᵀ δ⁽ᴸ⁾ ⊙ σ′(z⁽ᴸ⁻¹⁾)', {
      size: 42,
      weight: 720,
      family: 'STIX Two Math, Times New Roman, serif'
    }),
    text(800, 112, '隐藏单元影响多个下一层节点：每条路径贡献一个梯度，最终在隐藏轴上求和', {
      size: 23,
      fill: palette.muted
    }),
    panelTitle(800, 185, '多条前向路径与一次反向汇总'),
    node(250, 360, 'a_k', palette.teal, palette.tealSoft),
    node(650, 255, 'z_1', palette.violet, palette.violetSoft),
    node(650, 360, 'z_2', palette.violet, palette.violetSoft),
    node(650, 465, 'z_3', palette.violet, palette.violetSoft),
    node(1060, 255, 'C_1', palette.coral, palette.coralSoft),
    node(1060, 360, 'C_2', palette.coral, palette.coralSoft),
    node(1060, 465, 'C_3', palette.coral, palette.coralSoft),
    line(292, 350, 602, 270, { stroke: palette.teal }),
    line(292, 360, 602, 360, { stroke: palette.teal }),
    line(292, 370, 602, 450, { stroke: palette.teal }),
    line(692, 255, 1012, 255, { stroke: palette.violet }),
    line(692, 360, 1012, 360, { stroke: palette.violet }),
    line(692, 465, 1012, 465, { stroke: palette.violet }),
    curve('M 1010 235 C 820 205, 440 220, 290 325', {
      stroke: palette.coral,
      strokeWidth: 3,
      dash: '8 7'
    }),
    curve('M 1010 360 C 820 600, 430 590, 290 395', {
      stroke: palette.coral,
      strokeWidth: 3,
      dash: '8 7'
    }),
    curve('M 1010 485 C 800 690, 390 655, 276 405', {
      stroke: palette.coral,
      strokeWidth: 3,
      dash: '8 7'
    }),
    pill(1190, 320, 290, 'Σ 路径贡献', palette.orange, palette.orangeSoft, {
      size: 24,
      height: 85
    }),
    curve('M 1102 255 C 1145 255, 1145 345, 1175 345', {
      stroke: palette.orange,
      strokeWidth: 3
    }),
    line(1102, 360, 1175, 360, { stroke: palette.orange }),
    curve('M 1102 465 C 1145 465, 1145 380, 1175 380', {
      stroke: palette.orange,
      strokeWidth: 3
    }),
    text(800, 690, '(n_L × n_L-1)^T · (n_L) → (n_L-1)：转置后的 W 把下一层梯度映射回隐藏层', {
      size: 23,
      weight: 650,
      fill: palette.violet
    }),
    meaningBox([
      ['形状', 'W⁽ᴸ⁾∈Rⁿᴸ×ⁿᴸ⁻¹，δ⁽ᴸ⁾∈Rⁿᴸ；乘 Wᵀ 后得到每个隐藏单元的梯度。'],
      ['求和', '矩阵乘法第 k 个输出是 sum_j W[j,k] delta[j]，把所有下游路径贡献相加。'],
      ['门控', '再逐元素乘 σ′(z⁽ᴸ⁻¹⁾)，表示隐藏单元的局部激活斜率。']
    ])
  ].join('')

  return base(body, '隐藏层梯度的多路径求和')
}

function grpoAdvantage() {
  const rewards = [0.2, 0.8, 0.5, -0.1]
  const advantages = [-0.52, 1.36, 0.42, -1.26]
  const colors = [palette.teal, palette.green, palette.orange, palette.coral]

  const body = [
    text(800, 62, 'Âᵢ = (rᵢ − mean(r₁…rᴳ)) / (std(r₁…rᴳ) + ε)', {
      size: 40,
      weight: 720,
      family: 'STIX Two Math, Times New Roman, serif'
    }),
    text(800, 112, 'GRPO 在同一个 prompt 的候选组内部建立相对基线，不需要单独训练 value network', {
      size: 23,
      fill: palette.muted
    }),
    panelTitle(230, 190, '同一 prompt 采样 G 个回答'),
    pill(70, 230, 320, 'x：一道可验证问题', palette.violet, palette.violetSoft, {
      size: 22,
      height: 82
    }),
    ...rewards.flatMap((reward, index) => {
      const y = 365 + index * 82
      return [
        pill(70, y, 245, `回答 y${index + 1}`, colors[index], `${colors[index]}22`, {
          size: 21,
          height: 60
        }),
        text(350, y + 39, `r${index + 1} = ${reward.toFixed(1)}`, {
          size: 22,
          weight: 700,
          fill: colors[index],
          anchor: 'start'
        })
      ]
    }),
    line(430, 500, 570, 500, { stroke: palette.muted }),
    rect(590, 310, 370, 380, {
      fill: '#F8FAFC',
      stroke: palette.orange,
      radius: 18
    }),
    panelTitle(775, 360, '组内统计量'),
    text(775, 435, 'μ = mean(r)', { size: 28, weight: 700, fill: palette.orange }),
    text(775, 485, 'σ = std(r)', { size: 28, weight: 700, fill: palette.orange }),
    text(775, 560, '只比较同一问题的回答', {
      size: 21,
      fill: palette.muted
    }),
    text(775, 600, '不同 prompt 不共享基线', {
      size: 21,
      fill: palette.muted
    }),
    line(960, 500, 1080, 500, { stroke: palette.muted }),
    panelTitle(1280, 190, '标准化优势 Â'),
    ...advantages.flatMap((advantage, index) => {
      const y = 365 + index * 82
      const width = Math.abs(advantage) * 110
      const x = advantage >= 0 ? 1280 : 1280 - width
      return [
        text(1110, y + 39, `Â${index + 1}`, {
          size: 21,
          weight: 700,
          fill: colors[index]
        }),
        rect(x, y + 14, Math.max(width, 8), 30, {
          fill: colors[index],
          stroke: colors[index],
          radius: 5,
          opacity: 0.8
        }),
        text(1475, y + 39, advantage.toFixed(2), {
          size: 20,
          weight: 650,
          fill: colors[index]
        })
      ]
    }),
    line(1280, 345, 1280, 690, { stroke: '#AEB7C3', strokeWidth: 2, marker: false }),
    meaningBox([
      ['轴', '每个 prompt 形成一个大小为 G 的回答组；奖励和优势都是沿 group 轴长度为 G 的向量。'],
      ['对象', 'rᵢ 是可验证奖励或奖励模型分数；Âᵢ 是组内标准化后的相对优势。'],
      ['更新', '正优势提高对应回答的概率，负优势降低概率；PPO/GRPO 目标再限制更新幅度。']
    ])
  ].join('')

  return base(body, 'GRPO 的组内相对优势')
}

const diagrams = [
  {
    name: 'pi-four-layers',
    svg: piFourLayers(),
    outputs: [
      {
        file: 'public/images/blog/pi-agent/pi-agent-four-layers.webp',
        format: 'webp'
      }
    ]
  },
  {
    name: 'pi-agent-loop',
    svg: piAgentLoop(),
    outputs: [{ file: 'public/images/blog/pi-agent/pi-agent-loop.webp', format: 'webp' }]
  },
  {
    name: 'pi-plugin-hot-swap',
    svg: piExtensions(),
    outputs: [{ file: 'public/images/blog/pi-agent/pi-agent-extensions.webp', format: 'webp' }]
  },
  {
    name: 'attention-qkv',
    svg: attentionQkv(),
    outputs: [{ file: 'public/images/blog/generated/attention-qkv.png', format: 'png' }]
  },
  {
    name: 'kv-cache-prefill-decode',
    svg: kvCache(),
    outputs: [{ file: 'public/images/blog/generated/kv-cache-prefill-decode.png', format: 'png' }]
  },
  {
    name: 'backprop-output-chain-rule',
    svg: backpropOutput(),
    outputs: [
      {
        file: 'public/images/blog/deep-learning-visual/backprop-output-chain-rule.png',
        format: 'png'
      }
    ]
  },
  {
    name: 'backprop-hidden-activation-paths',
    svg: backpropHidden(),
    outputs: [
      {
        file: 'public/images/blog/deep-learning-visual/backprop-hidden-activation-paths.png',
        format: 'png'
      }
    ]
  },
  {
    name: 'grpo-group-relative-advantage',
    svg: grpoAdvantage(),
    outputs: [{ file: 'public/images/blog/grpo-video-grpo.jpg', format: 'jpeg' }]
  }
]

await mkdir(sourceDir, { recursive: true })

for (const diagram of diagrams) {
  const sourcePath = path.join(sourceDir, `${diagram.name}.svg`)
  await writeFile(sourcePath, diagram.svg)

  for (const output of diagram.outputs) {
    const outputPath = path.join(root, output.file)
    await mkdir(path.dirname(outputPath), { recursive: true })

    const pipeline = sharp(Buffer.from(diagram.svg)).resize(1600, 1000)
    if (output.format === 'webp') {
      await pipeline.webp({ quality: 92 }).toFile(outputPath)
    } else if (output.format === 'jpeg') {
      await pipeline.jpeg({ quality: 94, chromaSubsampling: '4:4:4' }).toFile(outputPath)
    } else {
      await pipeline.png({ compressionLevel: 9 }).toFile(outputPath)
    }
  }
}

console.log(`Generated ${diagrams.length} editable SVG diagrams in ${sourceDir}`)
