import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import {
  getProgrammingThoughtsChapterSessions,
  programmingThoughtsChapters,
  programmingThoughtsSessions
} from '../utils/programming-thoughts-sessions.ts'
import { buildPythonCodeSample } from './programming-thoughts-python-samples.mjs'
import { getChapterSample } from './programming-thoughts-chapter-samples.mjs'

const root = process.cwd()
const notesDir = path.join(root, 'src/content/notes/programming-thoughts/course')
const diagramsDir = path.join(root, 'public/images/notes/programming-thoughts/diagrams')

const lessonDesigns = [
  ['业务规则、数据库和第三方 SDK 混在一个函数里', '先识别会独立变化的方向，再给它们命名并划边界', '修改被限制在一个局部，测试可以替换边界实现', '抽象本身也有维护成本，不要为想象中的变化建框架'],
  ['一个 OrderService 同时定价、发券、写库和发消息', '把围绕同一业务目标的数据与行为聚到小模块', '阅读代码时不必在多个无关概念之间来回跳转', '高内聚不是文件越小越好，而是变化原因一致'],
  ['业务层直接使用支付 SDK 的请求对象和错误码', '定义业务所需的 PaymentPort，让适配器翻译外部协议', '更换供应商时核心结算流程保持不动', '接口过细会制造调用噪音，边界应围绕完整能力'],
  ['ReportService 既取数、排版、保存又发送邮件', '按照独立变化原因拆成数据查询、渲染和交付协作者', '格式或发送渠道变化时不再碰同一大类', '不要按每个方法机械拆类，先找真实的责任主体'],
  ['新增一种折扣就修改越来越长的 if/else', '把折扣变化收进统一策略接口，由稳定结算流程调用', '新增规则以新增实现完成，旧规则回归风险下降', '只有一两个稳定分支时，简单条件往往更清楚'],
  ['导出流程知道 CSV、JSON、PDF 的全部细节', '让稳定流程依赖 Exporter 抽象，格式细节留给实现', '业务流程与文件格式可以独立演进', '抽象应由调用方需要定义，而不是复制实现方法'],
  ['执行流程用 switch 判断渠道，并在每个分支创建不同实现', '让渠道实现统一接口，把类型到实现的映射移到创建边界', '新增渠道只注册新实现，稳定发送流程不再修改', '类型集合很小且长期稳定时，直接 switch 可能更清楚'],
  ['下单用例内部直接创建数据库审计仓储', '由业务层声明 AuditLog 端口，基础设施反向实现它', '核心规则可以在内存中快速测试', '倒置的是源码依赖，不是运行时调用方向'],
  ['依赖藏在方法内部，测试只能连接真实服务', '用构造器注入必需依赖，并在组合根一次装配', '对象一创建就处于可用状态，依赖关系也能被看见', '不要把容器传进业务对象形成 Service Locator'],
  ['某个子类型会拒绝父类型允许的正常调用', '用行为契约检查前置条件、后置条件与副作用', '调用方只依赖父类型也能安全替换实现', '继承复用代码不代表存在真正的 is-a 关系'],
  ['只读客户端被迫依赖 upload、delete 等无关方法', '按调用角色拆出 Reader、Writer 等能力接口', '实现与调用方只受相关变化影响', '接口过度碎片化会让一次业务操作拼装过多依赖'],
  ['结算代码穿透 user.profile.address.city 读取对象图', '让调用方只与直接朋友协作，把导航封装进边界对象', '内部结构变化不再传播到远处', 'DTO 是数据载体，合理读取字段不必强行套对象法则'],
  ['调用方取出多个字段后在外部拼业务判断', '把问题交给拥有数据和规则的对象回答', '规则与数据保持一致，调用代码表达业务意图', '避免把所有行为塞进实体，跨聚合流程仍属于应用服务'],
  ['会员等级 × 配送方式通过子类组合导致类数量相乘', '把折扣和运费建成两个策略对象并组合', '两个维度可以分别增加，不需要组合子类', '稳定且真正满足 is-a 的层次仍可使用继承'],
  ['类图中的连线随意使用，代码也说不清谁拥有谁的生命周期', '按临时使用、长期引用、整体部分、继承与接口实现区分六种关系', '关系强度与所有权变得可见，复用选择不再只靠继承', 'UML 名称必须服务于设计沟通，不能取代代码中的明确所有权'],
  ['看到模式名就照搬类图，却说不清问题', '用“上下文—冲突力量—结构—后果”描述设计', '团队讨论从类名转向真正的工程权衡', '模式不是目标，简单函数能解决时无需引入角色'],
  ['多个线程可能同时创建懒加载实例', '比较启动时创建、同步懒加载与双重检查的保证', '明确初始化时机与并发语义', '全局实例会隐藏依赖并污染测试，不要默认使用'],
  ['模块级状态被不同入口重复创建或随意修改', '优先使用模块对象和显式工厂守住唯一实例边界', '调用方不需要模拟私有构造器，测试也能替换依赖', '普通业务不需要为了假想的反射攻击制造复杂框架'],
  ['模块级状态被不同入口重复创建或随意修改', '用 Python 模块、Enum 或显式注册表承载唯一实例不变量', '实例边界清楚，调用方不需要绕过构造器', '进程单例仍可能隐藏依赖，不要把请求态数据放进去'],
  ['为了延迟初始化手写复杂锁代码', '利用 Python 的缓存函数按需创建并复用实例', '代码短，初始化时机和缓存范围都可见', '这不是并发共享状态的万能方案，先确认生命周期'],
  ['把“只有一个实例”误写成任意位置都能访问的全局变量', '区分实例数量、生命周期和获取方式', '可由容器管理单实例，同时仍显式注入', '请求态、租户态和测试态数据不应放进进程单例'],
  ['每个调用方都复制 parser 类型判断与 new 表达式', '用一个简单工厂集中有限且稳定的创建分支', '创建规则只有一个修改点，调用方拿到统一接口', '产品频繁由第三方扩展时中央 switch 仍会成为瓶颈'],
  ['任务流程和具体产品创建紧紧绑定', '把创建步骤留给 Creator 的工厂方法，流程只用 Product', '新增整套流程变体时可以一起扩展创建决策', '只有创建差异、没有流程继承需求时简单工厂更直接'],
  ['用类名字符串反射创建对象，拼写错误到线上才暴露', '用类型安全注册表或显式元数据完成发现与创建', '保留扩展性，同时可在启动时统一校验', '反射减少源代码分支，却会增加调试和部署复杂度'],
  ['同一主题的按钮、菜单和对话框可能被混搭', '用抽象工厂一次提供一整个兼容产品族', '切换主题时产品保持一致', '新增产品种类会修改所有工厂，是该模式的主要代价'],
  ['业务代码分别 new 多个具体主题组件', '在入口选择一个具体工厂，再把它传给页面装配器', '选择产品族的决策被集中到组合根', '不要让业务代码根据工厂具体类型再次分支'],
  ['数据库差异散落在 SQL、事务和仓储实现中', '用工厂成组提供 Repository、Transaction 与 Dialect', '切换后端时整族替换，避免半套 PostgreSQL 半套 SQLite', '数据库行为差异仍需契约测试，抽象不能消除差异'],
  ['接口相同就假定两套数据库实现行为相同', '对每个产品族运行同一组契约测试', '替换从“能编译”提升为可验证的行为兼容', '测试环境必须覆盖事务、并发和错误映射'],
  ['创建一份报表模板需要重复解析大量固定配置', '保存可复制原型，并从基准实例派生新对象', '避免重复构造，也能保留运行时配置', '复制语义必须明确定义，尤其是嵌套可变对象'],
  ['浅拷贝后修改 steps 数组也改变了原模板', '为有所有权的可变字段执行深拷贝，安全值可共享', '副本可以独立修改而不污染来源', '盲目深拷贝整个对象图可能昂贵且破坏共享语义'],
  ['调用方拿到注册表中的原型本体并直接修改', '注册时防御性复制，读取时再次 clone', '命名模板保持稳定，每次取得独立副本', '模板版本和缓存淘汰仍需单独治理'],
  ['HTTP 请求构造器有十几个位置参数和布尔开关', '用具名步骤收集可选配置，最后统一创建对象', '调用代码可读，新增可选项不破坏旧调用', '只有两三个参数时对象字面量通常已经足够'],
  ['对象在构造一半时就能被外部使用', '把校验和冻结集中在 build()，只返回完整不可变对象', '非法状态无法逃出构建阶段', 'Builder 不应复制一遍领域逻辑形成两个真相来源'],
  ['业务层被迫理解旧网关的字段名、单位和错误码', '在边界实现 Target 接口并委托给 Adaptee', '核心业务继续使用自己的语言', '若能直接修改并统一被适配对象，适配层可能多余'],
  ['外部天气 API 的 null、华氏度和异常结构渗入页面', '适配器统一完成 DTO、单位和错误语义转换', '系统内部模型保持稳定可预测', '转换失败要显式返回，不能静默伪造业务值'],
  ['日志、压缩、重试的各种组合催生大量子类', '每个附加职责实现同一接口并包装下一个组件', '能力可按需叠加，无需子类排列组合', '顺序会影响语义，装饰链过长也更难调试'],
  ['重试装饰器包在指标外侧，导致一次调用被统计多次', '明确每层关注的调用范围，并用测试锁定装饰顺序', '横切能力组合后仍有可解释的行为', '复杂中间件栈需要可视化与统一装配入口'],
  ['大图对象在列表渲染前就做昂贵网络加载', '代理与真实对象保持同一接口，控制首次访问时机', '调用方无感获得延迟加载或远程访问', '代理若改变业务语义，就不再只是访问控制'],
  ['每个调用点分别做鉴权、缓存和真实服务调用', '保护代理集中访问策略，并委托给真实文档服务', '安全与缓存策略有统一入口', '授权结果应与用户和资源绑定，避免错误缓存'],
  ['发布一段视频需要调用转码、封面、存储、通知四个子系统', '用 Facade 暴露面向用例的 publish() 入口', '普通调用方只理解一个稳定流程', '外观不是万能上帝类，高级调用仍可使用底层接口'],
  ['通知类型和发送渠道都用继承表达，子类数量相乘', '把业务抽象与渠道实现拆成两个层次并通过组合连接', '两个维度可以独立扩展', '只有一个变化维度时策略模式或简单组合更轻'],
  ['PDF/CSV 报表分别复制本地、S3、邮件保存代码', '报表格式持有 Storage 实现，渲染与交付分别变化', '新增格式或后端只增加一个维度的实现', '桥接应在设计早期识别稳定的两个正交维度'],
  ['遍历文件时到处判断当前节点是文件还是目录', '让 Leaf 与 Composite 实现统一 Node 接口', '调用方可以用递归统一计算大小或执行操作', '叶子不支持的修改方法不应假装成功'],
  ['权限树的父节点和叶子节点使用完全不同的处理流程', '在组合节点递归聚合孩子结果，叶子提供基本结果', '任意子树都能作为整体处理', '深树要注意循环引用、栈深和批量查询性能'],
  ['十万个字符对象各自保存重复字体、字号和颜色', '共享不可变样式，把位置等上下文状态留在调用处', '大量细粒度对象的重复内存下降', '可变状态一旦进入享元，会造成难以追踪的串扰'],
  ['地图每个格子都创建完整纹理与碰撞配置', '享元工厂按稳定键缓存不可变 TileType，坐标留给 Tile', '纹理和规则只保存一次，实例只保留外部状态', '先用内存剖析验证收益，低基数对象不值得引入缓存']
]

if (lessonDesigns.length !== programmingThoughtsSessions.length) {
  throw new Error('lessonDesigns must map 1:1 to the 46 sessions')
}

const escapeXml = (value) =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const wrap = (value, max = 16) => {
  const chars = [...value]
  const lines = []
  while (chars.length) {
    let take = Math.min(max, chars.length)
    const isAsciiWord = (char) => /[A-Za-z0-9_-]/.test(char ?? '')

    if (take < chars.length && isAsciiWord(chars[take - 1]) && isAsciiWord(chars[take])) {
      let safeTake = take
      while (safeTake > Math.floor(max * 0.6) && isAsciiWord(chars[safeTake - 1])) safeTake -= 1
      if (safeTake > Math.floor(max * 0.6)) take = safeTake
    }

    lines.push(chars.splice(0, take).join(''))
  }
  return lines.slice(0, 3)
}

function textLines(value, x, y, className, max = 16) {
  return wrap(value, max)
    .map(
      (line, index) =>
        `<text x="${x}" y="${y + index * 28}" class="${className}">${escapeXml(line)}</text>`
    )
    .join('\n')
}

// The teaching source is intentionally kept in a separate table so every lesson
// uses the same Python 3 vocabulary and can be checked independently.
function buildDiagram(session, design) {
  const [smell, move, gain, cost] = design
  const cards = [
    ['看见问题', smell, '#f59e0b', '#fff7ed'],
    ['换成 Python 结构', move, '#2563eb', '#eff6ff'],
    ['得到什么', gain, '#059669', '#ecfdf5']
  ]
  const cardMarkup = cards.map(([label, body, accent, fill], index) => {
    const x = 44 + index * 344
    return `<g>
      <rect x="${x}" y="218" width="300" height="250" rx="24" fill="${fill}" stroke="${accent}" stroke-width="2"/>
      <circle cx="${x + 38}" cy="260" r="18" fill="${accent}"/>
      <text x="${x + 38}" y="267" text-anchor="middle" class="number">${index + 1}</text>
      <text x="${x + 68}" y="267" class="cardLabel">${escapeXml(label)}</text>
      ${textLines(body, x + 24, 316, 'cardBody', 15)}
    </g>${index < 2 ? `<path d="M${x + 310} 342h24" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/><path d="m${x + 326} 332 12 10-12 10" fill="none" stroke="#94a3b8" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>` : ''}`
  }).join('\n')

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1120 620" role="img" aria-labelledby="title desc">
  <title id="title">P${session.page} ${escapeXml(session.title)}：Python 设计决策图</title>
  <desc id="desc">用一个易懂的案例说明问题、Python 结构和收益</desc>
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#e2e8f0"/></linearGradient>
    <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M 28 0 L 0 0 0 28" fill="none" stroke="#cbd5e1" stroke-width="1" opacity=".45"/></pattern>
    <filter id="shadow"><feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="#0f172a" flood-opacity=".15"/></filter>
  </defs>
  <rect width="1120" height="620" rx="30" fill="url(#paper)"/>
  <rect x="20" y="20" width="1080" height="580" rx="22" fill="url(#grid)" opacity=".75"/>
  <text x="44" y="64" class="eyebrow">PROGRAMMING THOUGHT · P${session.page}</text>
  ${textLines(session.title, 44, 108, 'heading', 24)}
  <rect x="44" y="132" width="1032" height="52" rx="16" fill="#0f172a"/>
  <text x="70" y="165" class="exampleLabel">现实例子</text>
  <text x="184" y="165" class="exampleText">${escapeXml(session.example)}</text>
  ${cardMarkup}
  <rect x="44" y="510" width="1032" height="66" rx="18" fill="#ffffff" stroke="#cbd5e1"/>
  <text x="70" y="551" class="boundaryLabel">边界提醒</text>
  <text x="190" y="551" class="boundaryText">${escapeXml(cost)}</text>
  <style>
    .eyebrow { fill: #2563eb; font: 700 17px system-ui, sans-serif; letter-spacing: 2px; }
    .heading { fill: #0f172a; font: 700 30px system-ui, sans-serif; }
    .exampleLabel { fill: #93c5fd; font: 700 17px system-ui, sans-serif; }
    .exampleText { fill: #f8fafc; font: 500 19px system-ui, sans-serif; }
    .number { fill: white; font: 700 16px system-ui, sans-serif; }
    .cardLabel { fill: #0f172a; font: 700 20px system-ui, sans-serif; }
    .cardBody { fill: #334155; font: 500 21px system-ui, sans-serif; }
    .boundaryLabel { fill: #b45309; font: 700 18px system-ui, sans-serif; }
    .boundaryText { fill: #475569; font: 500 18px system-ui, sans-serif; }
  </style>
</svg>`
}

function buildCodeSample(session) {
  return buildPythonCodeSample(session.page)

  /* legacy samples retained below for historical diff context; unreachable
  const topic = session.topics[0]
  const example = session.example

  if (session.page === 17) {
    return `public final class ConfigCatalog {
  private static final ConfigCatalog INSTANCE = new ConfigCatalog();
  private ConfigCatalog() {}
  public static ConfigCatalog getInstance() { return INSTANCE; }
}`
  }

  if (session.page === 18) {
    return `var constructor = ConfigCatalog.class.getDeclaredConstructor();
constructor.setAccessible(true);

var first = ConfigCatalog.getInstance();
var second = constructor.newInstance();

assert first != second; // private 并不是反射的安全边界`
  }

  if (session.page === 19) {
    return `public enum Registry {
  INSTANCE;

  private final Map<String, Handler> handlers = new HashMap<>();
  public Handler get(String name) { return handlers.get(name); }
}`
  }

  if (session.page === 20) {
    return `public final class MetadataCatalog {
  private MetadataCatalog() {}
  private static class Holder {
    private static final MetadataCatalog INSTANCE = new MetadataCatalog();
  }
  public static MetadataCatalog getInstance() { return Holder.INSTANCE; }
}`
  }

  if (session.page === 21) {
    return `// “单实例”由组合根管理，“依赖”仍然显式传入
const catalog = new Catalog()
const service = new CheckoutService(catalog)

// 测试可传入独立实例，不共享全局可变状态
const testService = new CheckoutService(new InMemoryCatalog())`
  }

  const samples = {
    1: `interface Notifier { send(message: string): Promise<void> }

class WelcomeUser {
  constructor(private notifier: Notifier) {}
  async run(name: string) {
    await this.notifier.send(\`欢迎 \${name}\`)
  }
}`,
    2: `class PriceQuote {
  constructor(private lines: LineItem[], private policy: DiscountPolicy) {}
  subtotal() { return this.lines.reduce((sum, line) => sum + line.total(), 0) }
  total() { return this.policy.apply(this.subtotal()) }
}`,
    3: `interface PaymentPort { charge(orderId: string, cents: number): Promise<Receipt> }

class VendorAdapter implements PaymentPort {
  constructor(private sdk: VendorSdk) {}
  async charge(orderId: string, cents: number) {
    return mapReceipt(await this.sdk.pay({ ref: orderId, amount: cents }))
  }
}`,
    4: `const report = await reportQuery.load(input)
const file = renderer.render(report)
await storage.save(file)
await delivery.send(file)

// 四个协作者分别对应数据、格式、存储和交付的变化。`,
    5: `interface DiscountRule { apply(subtotal: number): number }

const total = rules.reduce(
  (price, rule) => rule.apply(price),
  subtotal
)`,
    6: `interface Exporter { export(rows: Row[]): Uint8Array }

function download(rows: Row[], exporter: Exporter) {
  return exporter.export(rows)
}`,
    7: `const channels = new Map<string, () => Notifier>()
channels.set('email', () => new EmailNotifier())

function createChannel(name: string) {
  const factory = channels.get(name)
  if (!factory) throw new Error(\`Unknown channel: \${name}\`)
  return factory()
}`,
    8: `interface AuditLog { append(event: AuditEvent): Promise<void> }

class PlaceOrder {
  constructor(private audit: AuditLog) {}
  async run(command: OrderCommand) { // 业务规则 }
}`,
    9: `function createApplication(config: Config) {
  const database = connectDatabase(config.databaseUrl)
  const payments = new VendorPaymentAdapter(config.paymentKey)
  return new CheckoutService(database.orders(), payments)
}`,
    10: `interface CacheReader { get(key: string): Promise<string | null> }

async function loadProfile(cache: CacheReader) {
  // 任意实现都必须遵守：不存在时返回 null，而不是抛“不支持”
  return cache.get('profile')
}`,
    11: `interface BlobReader { get(key: string): Promise<Uint8Array> }
interface BlobWriter { put(key: string, data: Uint8Array): Promise<void> }

class ReadOnlyAssets implements BlobReader { // ... }`,
    12: `// 不要：order.customer.profile.address.city
class Order {
  shipsTo(city: string) {
    return this.deliveryAddress.city === city
  }
}`,
    13: `class Order {
  canUseSameDayDelivery(zone: DeliveryZone) {
    return zone.accepts(this.deliveryAddress) && !this.hasHazardousGoods()
  }
}

if (order.canUseSameDayDelivery(zone)) schedule(order)`,
    14: `class ShippingQuote {
  constructor(
    private shipping: ShippingPolicy,
    private discount: DiscountPolicy
  ) {}
  total(order: Order) { return this.discount.apply(this.shipping.price(order)) }
}`,
    15: `interface PricingPolicy { price(lines: OrderLine[]): number } // 实现

class Order { // 与 Customer 关联，组合拥有 OrderLine
  constructor(
    readonly customer: Customer,
    private lines: OrderLine[],
    private pricing: PricingPolicy
  ) {}
  pay(gateway: PaymentPort) { // gateway 只是方法级依赖
    return gateway.charge(this.pricing.price(this.lines))
  }
}`,
    16: `type PatternDecision = {
  context: string
  forces: string[]
  structure: string
  consequences: { gain: string[]; cost: string[] }
}

// 类图只是 structure，不能丢掉其余三项。`,
    22: `type Parser = { parse(input: string): Document }

function createParser(kind: 'json' | 'yaml'): Parser {
  return kind === 'json' ? new JsonParser() : new YamlParser()
}`,
    23: `abstract class NotificationJob {
  protected abstract createNotifier(): Notifier
  async run(messages: Message[]) {
    const notifier = this.createNotifier()
    for (const message of messages) await notifier.send(message)
  }
}`,
    24: `const handlers = new Map<string, () => CommandHandler>()

export function register(name: string, factory: () => CommandHandler) {
  if (handlers.has(name)) throw new Error(\`Duplicate: \${name}\`)
  handlers.set(name, factory)
}`,
    25: `interface WidgetFactory {
  button(): Button
  dialog(): Dialog
  menu(): Menu
}

renderSettings(new DarkWidgetFactory())`,
    26: `class DarkWidgetFactory implements WidgetFactory {
  button() { return new DarkButton() }
  dialog() { return new DarkDialog() }
  menu() { return new DarkMenu() }
}

const factory = theme === 'dark' ? new DarkWidgetFactory() : new LightWidgetFactory()`,
    27: `interface PersistenceFactory {
  users(): UserRepository
  orders(): OrderRepository
  transactions(): TransactionManager
}

const persistence = new PostgresPersistenceFactory(pool)`,
    28: `for (const factory of [sqliteFactory, postgresFactory]) {
  contract('saved order can be loaded', async () => {
    const orders = factory.orders()
    await orders.save(exampleOrder)
    expect(await orders.get(exampleOrder.id)).toEqual(exampleOrder)
  })
}`,
    29: `class ReportTemplate {
  clone() {
    return new ReportTemplate(this.layout, [...this.sections])
  }
}

const weekly = registry.get('weekly').clone()`,
    30: `clone(): WorkflowTemplate {
  return new WorkflowTemplate(
    this.name,
    this.steps.map(step => ({ ...step, inputs: { ...step.inputs } }))
  )
}`,
    31: `class PrototypeRegistry {
  private templates = new Map<string, CardTemplate>()
  register(name: string, value: CardTemplate) { this.templates.set(name, value.clone()) }
  create(name: string) { return this.templates.get(name)?.clone() }
}`,
    32: `const request = new RequestBuilder('/reports')
  .method('POST')
  .header('authorization', token)
  .json({ range: 'weekly' })
  .timeout(3000)
  .build()`,
    33: `build(): EmailMessage {
  if (this.to.length === 0) throw new Error('recipient required')
  if (!this.subject.trim()) throw new Error('subject required')
  return Object.freeze(new EmailMessage(this.to, this.subject, this.body))
}`,
    34: `class LegacyGatewayAdapter implements PaymentPort {
  constructor(private legacy: LegacyGateway) {}
  async charge(command: Charge) {
    const result = await this.legacy.makePay(command.cents / 100, command.orderId)
    return { id: result.trade_no, status: mapStatus(result.code) }
  }
}`,
    35: `class WeatherAdapter implements WeatherPort {
  async current(city: string): Promise<Weather> {
    const dto = await this.client.fetch(city)
    if (dto.temp_f == null) throw new WeatherUnavailable(city)
    return { city, celsius: (dto.temp_f - 32) * 5 / 9 }
  }
}`,
    36: `let sender: Sender = new HttpSender()
sender = new RetryingSender(sender)
sender = new CompressingSender(sender)
sender = new MetricsSender(sender)

await sender.send(message)`,
    37: `// 外层指标记录一次逻辑调用；内层重试记录每次尝试
const client = new RequestMetrics(
  new RetryMetrics(
    new RetryingClient(new BaseHttpClient(), { attempts: 3 })
  )
)`,
    38: `class LazyImage implements ImageResource {
  private real?: RemoteImage
  render() {
    this.real ??= new RemoteImage(this.url)
    return this.real.render()
  }
}`,
    39: `class ProtectedDocuments implements DocumentService {
  constructor(private real: DocumentService, private policy: AccessPolicy) {}
  async read(user: User, id: string) {
    if (!this.policy.canRead(user, id)) throw new ForbiddenError()
    return this.real.read(user, id)
  }
}`,
    40: `class VideoPublishingFacade {
  async publish(source: File) {
    const video = await this.transcoder.encode(source)
    const cover = await this.thumbnails.create(video)
    const url = await this.storage.upload(video, cover)
    await this.notifications.announce(url)
    return url
  }
}`,
    41: `abstract class Notification {
  constructor(protected channel: Channel) {}
  abstract send(message: string): Promise<void>
}

class UrgentNotification extends Notification {
  send(message: string) { return this.channel.deliver(\`[URGENT] \${message}\`) }
}`,
    42: `abstract class Report {
  constructor(protected storage: Storage) {}
  abstract render(data: Data): Uint8Array
  save(data: Data) { return this.storage.put(this.render(data)) }
}

new PdfReport(new S3Storage()).save(data)`,
    43: `interface Node { size(): number }
class FileNode implements Node { size() { return this.bytes } }
class Directory implements Node {
  size() { return this.children.reduce((sum, child) => sum + child.size(), 0) }
}`,
    44: `class PermissionGroup implements PermissionNode {
  allows(action: Action) {
    return this.children.some(child => child.allows(action))
  }
}

const canPublish = organizationPermissions.allows('publish')`,
    45: `type TextStyle = Readonly<{ font: string; size: number; color: string }>

// style 可共享；x、y 与字符内容属于每次绘制的上下文
function drawGlyph(glyph: Glyph, style: TextStyle, x: number, y: number) {
  canvas.draw(glyph, style, x, y)
}`,
    46: `class TileTypeFactory {
  private cache = new Map<string, TileType>()
  get(key: string, create: () => TileType) {
    if (!this.cache.has(key)) this.cache.set(key, Object.freeze(create()))
    return this.cache.get(key)!
  }
}

const tile = { x: 12, y: 8, type: factory.get('forest', loadForest) }`
  }

  return (
    samples[session.page] ??
    `// ${topic}：${example}
interface Boundary { execute(input: Input): Promise<Output> }

class UseCase {
  constructor(private boundary: Boundary) {}
  run(input: Input) { return this.boundary.execute(input) }
}`
  )
  */
}

function buildProgressiveStep(chapter, session, sample, step) {
  const topic = session.topics[0]
  return `## 第 ${step + 1} 轮需求：先解决问题，最后再叫它 ${topic}（P${session.page}）

我们继续修改同一个“${chapter.caseStudy}”，不另起一个玩具项目。上一轮代码能工作，但新的需求让这个薄弱处出现：**${sample.stages[step]}**。先不要套类图，先写下如果沿用原结构，需要改哪些判断、对象和测试。

这一轮真正的问题是：${session.question} 最直接的选择仍然是继续修改原函数；第一次这样做通常最便宜。等相同方向的修改再次出现，我们才获得足够证据，知道应该把哪部分从主流程中分离。

### 这一轮只做一个设计动作

本轮只落实 **${session.title}**：围绕“${session.topics.join('、')}”移动一个边界，不同时引入后续模式。验证标准也很具体——完成本轮需求后，再增加同方向实现时，上一轮已经稳定的业务结果不需要改写。

完成动作后再给它命名：这一轮对应 **${session.topics.join('、')}**。名称只是压缩沟通，不是推导起点。如果无法从“需求如何变化”推回这个结构，就说明我们只记住了答案。

这一轮也增加了一层命名和间接调用。下一轮需求会继续检验它；如果修改清单没有缩短，就退回更直接的版本，而不是继续叠抽象。
`
}

function buildChapterComparisonDiagram(chapter, sessions, sample) {
  const topics = sessions.map((session) => session.topics[0]).join(' · ')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="620" viewBox="0 0 1320 620" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(chapter.title)}重构前后对照</title><desc id="desc">从直接实现到可验证边界的结构变化</desc>
  <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#a78bfa"/></marker></defs>
  <style>.bg{fill:#0b1220}.panel{fill:#111c30;stroke:#334155;stroke-width:2}.before{stroke:#f97316}.after{stroke:#34d399}.title{font:700 28px system-ui;fill:#f8fafc}.head{font:700 20px system-ui;fill:#e2e8f0}.label{font:700 14px system-ui;fill:#94a3b8}.body{font:16px system-ui;fill:#cbd5e1}.good{fill:#a7f3d0}.arrow{stroke:#a78bfa;stroke-width:5;fill:none}</style>
  <rect width="100%" height="100%" rx="30" class="bg"/><text x="60" y="62" class="title">${escapeXml(chapter.shortTitle)} · 同一份代码的前后对照</text>
  <rect x="60" y="120" width="500" height="410" rx="28" class="panel before"/><text x="95" y="170" class="head">起点：直接实现</text><text x="95" y="215" class="label">当前压力</text>${textLines(sample.stages[0], 95, 250, 'body', 24)}<text x="95" y="365" class="label">修改方式</text>${textLines('继续在原函数中增加判断；业务决定与实现细节一起变化', 95, 400, 'body', 24)}
  <path d="M 585 325 H 720" class="arrow" marker-end="url(#arrow)"/><text x="610" y="298" class="label">逐轮需求</text>
  <rect x="750" y="120" width="510" height="410" rx="28" class="panel after"/><text x="785" y="170" class="head">演进后：最小稳定边界</text><text x="785" y="215" class="label">形成的工具</text>${textLines(topics, 785, 250, 'body good', 24)}<text x="785" y="365" class="label">验证结果</text>${textLines(chapter.outcome, 785, 400, 'body', 24)}
  <text x="60" y="580" class="label">不是“右边永远更好”：只有左边已经反复为同类变化付费，重构才值得。</text></svg>`
}

function buildChapterDiagram(chapter, sessions, sample) {
  const width = 1320
  const cardWidth = Math.floor((width - 120 - (sessions.length - 1) * 24) / sessions.length)
  const cards = sessions.map((session, index) => {
    const x = 60 + index * (cardWidth + 24)
    const title = textLines(`需求 ${index + 1} · P${session.page}`, x + 18, 172, 'stage', 18)
    const problem = textLines(sample.stages[index], x + 18, 230, 'body', Math.max(10, Math.floor(cardWidth / 18)))
    const action = textLines(session.title, x + 18, 342, 'body action', Math.max(10, Math.floor(cardWidth / 18)))
    const arrow = index < sessions.length - 1 ? `<path d="M ${x + cardWidth + 4} 310 H ${x + cardWidth + 20}" class="arrow" marker-end="url(#arrow)"/>` : ''
    return `<g><rect x="${x}" y="140" width="${cardWidth}" height="300" rx="24" class="card"/>${title}<text x="${x + 18}" y="210" class="label">暴露问题</text>${problem}<text x="${x + 18}" y="322" class="label">只做一步</text>${action}${arrow}</g>`
  }).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="520" viewBox="0 0 ${width} 520" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(chapter.title)}渐进推导图</title><desc id="desc">同一个案例随 P${chapter.startPage} 到 P${chapter.endPage} 的需求逐步演进</desc>
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#60a5fa"/></marker></defs>
  <style>.bg{fill:#0b1220}.card{fill:#111c30;stroke:#334155;stroke-width:2}.title{font:700 27px system-ui;fill:#f8fafc}.subtitle{font:16px system-ui;fill:#94a3b8}.stage{font:700 17px system-ui;fill:#e2e8f0}.label{font:700 13px system-ui;fill:#60a5fa}.body{font:14px system-ui;fill:#cbd5e1}.action{fill:#a7f3d0}.arrow{stroke:#60a5fa;stroke-width:3;fill:none}</style>
  <rect width="100%" height="100%" rx="30" class="bg"/><text x="60" y="60" class="title">${escapeXml(chapter.shortTitle)}</text><text x="60" y="96" class="subtitle">同一个案例 · 需求出现后才重构 · 结构完成后才命名</text>${cards}
  <text x="60" y="485" class="subtitle">直接实现 → 记录修改扩散 → 放置最小边界 → 用业务测试验证 → 继续接受下一轮需求</text></svg>`
}

function buildArticle(chapter) {
  const sessions = getProgrammingThoughtsChapterSessions(chapter)
  const sample = getChapterSample(chapter.slug)
  const steps = sessions.map((session, step) => {
    return buildProgressiveStep(chapter, session, sample, step)
  }).join('\n')
  const topicRows = sessions.map((session, index) => `| ${index + 1} | P${session.page} | ${session.question} | ${session.topics[0]} |`).join('\n')
  return `---
title: P${chapter.startPage}–P${chapter.endPage}：${chapter.title}
description: 以“${chapter.caseStudy}”为贯穿案例，按视频顺序从朴素实现、需求失败到重构命名，渐进理解 ${sessions.map((session) => session.topics[0]).join('、')}。
publishDate: 2026-08-23
updatedDate: 2026-08-23
language: zh
---

这不是把 P${chapter.startPage}–P${chapter.endPage} 的定义拼成一篇词典，而是让一个系统连续经历几轮需求。我们从 **${chapter.caseStudy}** 的最直接实现出发；每当代码真的承受不住下一次变化，才引入一个新边界。

最终要回答的是：**${chapter.question}** 学完的验收标准也不是记住名词，而是${chapter.outcome}。

## 先看完整推导路线

| 阶段 | 原视频 | 新出现的问题 | 到最后才命名 |
| --- | --- | --- | --- |
${topicRows}

这张表只是地图，不是答案。阅读正文时建议停在每个“第二个需求”之前，先自己修改一次朴素代码，再比较后面的重构。模式真正进入肌肉记忆，靠的不是看懂类图，而是亲手感受修改范围如何扩大。

![${chapter.title}：同一案例随需求逐步演进](/images/notes/programming-thoughts/diagrams/chapter-${chapter.slug}.svg)

## 起点：先写最直接、能工作的版本

这一版故意把决策和实现放在一起。它不是“错误代码”，而是需求尚少时合理的最低成本方案。请先运行它，并标出每个业务决定；接下来的 P${chapter.startPage}–P${chapter.endPage} 会连续修改同一案例。

\`\`\`python
${sample.before}
\`\`\`

${steps}

## 演进完成后的 Python 实现

下面不是另一个示例，而是起点代码承受完上述需求后的版本。每个新增角色都能追溯到前面某一轮真实修改压力；删掉任何一层，都应该能说出哪项需求会重新变难。

\`\`\`python
${sample.after}
\`\`\`

## 用真实业务结果验证，而不是测试模式名

测试不关心类图里有几个角色，只验证稳定业务结果、替换能力和关键失败边界。下面代码与上一个代码块拼接后可直接由 Python 3.12 执行。

\`\`\`python
${sample.test}
\`\`\`

![${chapter.title}：同一份代码重构前后结构对照](/images/notes/programming-thoughts/diagrams/chapter-${chapter.slug}-comparison.svg)

## 把连续重构放回一张决策表

| 检查项 | 仍然简单时 | 变化已经重复时 | 抽象后的验证 |
| --- | --- | --- | --- |
| 修改范围 | 一个分支或一个函数 | 同类判断散落到多个模块 | 新需求主要新增实现 |
| 依赖语言 | 具体类名与外部字段 | 业务规则被实现细节牵着走 | 调用方只看自己的业务能力 |
| 测试方式 | 端到端手工验证 | 每次都要启动整套环境 | 稳定规则可用替身局部测试 |
| 撤销成本 | 几乎没有 | 继续堆分支的成本持续上升 | 抽象仍能被一次小重构移除 |

这四行里最容易被忽略的是“撤销成本”。好的演进式设计不是层数最多，而是每一步都能解释、能验证、也能退回去。没有第二个真实用例时，保留直接实现通常更诚实；出现重复变化后仍拒绝命名边界，则会把复杂度转移给未来维护者。

## 为什么这些分 P 必须连在一起读

单独看每个名词，很容易把设计理解成一组互不相关的技巧。放回同一条演进链后会发现，前一步通常在制造后一步所需的条件：先把变化聚到局部，才看得见稳定边界；先让依赖显式，才谈得上替换；先定义替换契约，才有资格把实现交给工厂、注册表或组合根。

同样，后一种结构并不会淘汰前一种。一个系统完全可能在入口保留简单分支，在核心流程使用协议，在基础设施侧使用注册表。选择标准不是“哪个模式更高级”，而是当前变化由谁发起、发生频率多高、失败后需要谁负责。

可以用三次追问检查理解是否连贯。第一，去掉新抽象后，哪一个真实需求会重新变难？第二，新增一种实现时，哪些稳定代码仍然会被修改？第三，实现抛错、超时或返回边界值时，调用方依赖的行为是否仍然成立？如果答不出来，先回到上一个更简单的版本。

本文把代码拆成多个小切片，是为了让每次决策清楚，并不建议在项目中为每个概念各建一层。真正落地时，应该把相邻且同向变化的角色合并，把仅服务一个调用点的抽象留在模块内部，只把跨模块需要共同遵守的契约公开出去。这样既保留演进路径，也不会把教学结构原样搬成生产结构。

## 容易走偏的地方

1. **第一版就设计最终形态。** 这会跳过最重要的证据收集，也让团队无法解释每层抽象来自哪个需求。
2. **用类的数量衡量设计。** 类少不等于简单，类多也不等于解耦；真正要看的是一次变化传播多远。
3. **只画重构后的图。** 没有“之前为什么痛”，读者只能背结构，无法迁移到新的问题。
4. **把 Protocol 当作自动解耦。** 如果接口仍然复制供应商语言，业务只是隔着一层继续依赖供应商。
5. **忽略运行时与失败语义。** 能正常返回只是契约的一部分，超时、重复、并发和部分失败同样决定实现能否替换。

## 什么时候停在更简单的版本

如果实现只有一个、变化方向长期稳定、团队无法给出第二个真实需求，先停在函数或小类即可。本文的每次重构都有前提：旧结构已经让某种变化重复付费。没有这个前提，所谓扩展性很容易变成需要长期维护的猜测。

反过来，如果同一个条件分支已经复制三次、测试必须连接真实基础设施、或一个调用方需要穿过三层对象才能回答业务问题，就不要再用“以后再说”掩盖结构债务。此时先写修改清单，再选择本文最小的一步，而不是一次引入所有模式。

## 练习：把视频推导重新走一遍

为“${chapter.caseStudy}”增加一个与现有实现明显不同的需求。第一轮禁止增加接口，只修改朴素版本并记录触碰点；第二轮使用本文对应步骤重构；第三轮再加入一个变化，验证旧流程是否保持不动。

提交物包括：重构前后的修改清单、一张依赖方向图、至少两个业务测试、一个共享契约测试，以及一段不超过 150 字的代价说明。最后回看 P${chapter.startPage}–P${chapter.endPage}，确认每个结构都能追溯到一个真实失败，而不是追溯到一个想背下来的名词。

## 小结

本章真正形成的是一条推理链：直接实现 → 新需求暴露耦合 → 找到变化轴 → 放置最小边界 → 用测试证明 → 写下代价。做到这一步，${sessions.map((session) => session.topics[0]).join('、')} 才不再是彼此分散的知识点，而是同一段代码演进过程中自然出现的工具。
`
}

await mkdir(notesDir, { recursive: true })
await mkdir(diagramsDir, { recursive: true })

for (const [index, session] of programmingThoughtsSessions.entries()) {
  const design = lessonDesigns[index]
  const pagePrefix = `p${String(session.page).padStart(2, '0')}`
  await writeFile(
    path.join(diagramsDir, `${pagePrefix}-${session.slug}.svg`),
    buildDiagram(session, design)
  )
}

for (const session of programmingThoughtsSessions) {
  await unlink(path.join(notesDir, `${session.slug}.md`)).catch((error) => {
    if (error.code !== 'ENOENT') throw error
  })
}

for (const chapter of programmingThoughtsChapters) {
  await writeFile(path.join(notesDir, `${chapter.slug}.md`), buildArticle(chapter))
  await writeFile(path.join(diagramsDir, `chapter-${chapter.slug}.svg`), buildChapterDiagram(chapter, getProgrammingThoughtsChapterSessions(chapter), getChapterSample(chapter.slug)))
  await writeFile(path.join(diagramsDir, `chapter-${chapter.slug}-comparison.svg`), buildChapterComparisonDiagram(chapter, getProgrammingThoughtsChapterSessions(chapter), getChapterSample(chapter.slug)))
}

process.stdout.write(`Generated ${programmingThoughtsChapters.length} progressive articles and ${programmingThoughtsSessions.length} diagrams.\n`)
