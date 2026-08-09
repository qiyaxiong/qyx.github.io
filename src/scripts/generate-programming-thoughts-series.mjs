import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'

import { programmingThoughtsSessions } from '../utils/programming-thoughts-sessions.ts'

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
  ['private 构造器被反射设置为可访问并再次调用', '把运行时能力和单例不变量一起纳入威胁模型', '理解语言访问控制不是绝对安全边界', '普通业务通常不需要对恶意反射做过度防御'],
  ['构造守卫在初始化顺序或序列化场景下仍有漏洞', '在 Java 中优先考虑枚举单例提供的运行时保证', '反射与序列化破坏面显著减少', '需要继承或受框架构造约束时要重新评估'],
  ['为了延迟初始化手写复杂锁代码', '利用 JVM 静态内部类按需加载与类初始化锁', '代码短、延迟加载且线程安全', '这依赖 Java 类加载语义，不能机械搬到其他语言'],
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

function buildDiagram(session, design) {
  const [smell, move, gain] = design
  const cards = [
    ['01 · 症状', smell],
    ['02 · 设计动作', move],
    ['03 · 可验证结果', gain]
  ]

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 980" role="img" aria-labelledby="title desc">
  <title id="title">P${session.page} ${escapeXml(session.title)}设计决策图</title>
  <desc id="desc">从问题症状、设计动作到可验证结果的三步图解</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#071b27"/>
      <stop offset="1" stop-color="#0f2630"/>
    </linearGradient>
    <filter id="shadow"><feDropShadow dx="0" dy="10" stdDeviation="14" flood-opacity=".24"/></filter>
  </defs>
  <rect width="720" height="980" rx="32" fill="url(#bg)"/>
  <circle cx="650" cy="70" r="190" fill="#2dd4bf" opacity=".07"/>
  <text x="60" y="70" fill="#5eead4" font-family="system-ui,sans-serif" font-size="18" font-weight="700" letter-spacing="2">PROGRAMMING THOUGHT · P${session.page}</text>
  ${textLines(session.title, 60, 120, 'heading', 22)}
  <style>
    .heading { fill: #f8fafc; font: 700 30px system-ui, sans-serif; }
    .label { fill: #5eead4; font: 700 18px system-ui, sans-serif; letter-spacing: 1px; }
    .body { fill: #d7e4e8; font: 500 24px system-ui, sans-serif; }
  </style>
  ${cards
    .map((card, index) => {
      const x = 60
      const y = 230 + index * 220
      return `<g filter="url(#shadow)">
        <rect x="${x}" y="${y}" width="600" height="170" rx="22" fill="#102f3a" stroke="#28505c"/>
        <text x="${x + 28}" y="${y + 42}" class="label">${card[0]}</text>
        ${textLines(card[1], x + 28, y + 88, 'body', 23)}
      </g>${index < 2 ? `<path d="M360 ${y + 176}v30" stroke="#5eead4" stroke-width="3"/><path d="m351 ${y + 200} 9 12 9-12" fill="none" stroke="#5eead4" stroke-width="3"/>` : ''}`
    })
    .join('\n')}
  <text x="60" y="930" fill="#8ba4ad" font-family="system-ui,sans-serif" font-size="19">案例：${escapeXml(session.example)} · 先解释变化，再选择结构</text>
</svg>`
}

function buildCodeSample(session) {
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
  async run(command: OrderCommand) { /* 业务规则 */ }
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

class ReadOnlyAssets implements BlobReader { /* ... */ }`,
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
}

function buildArticle(session, design) {
  const [smell, move, gain, cost] = design
  const diagramPath = `/images/notes/programming-thoughts/diagrams/p${String(session.page).padStart(2, '0')}-${session.slug}.svg`
  const sample = buildCodeSample(session)
  const firstTopic = session.topics[0]
  const remainingTopics = session.topics.slice(1).join('、')

  return `---
title: P${session.page}：${session.title}
description: 用“${session.example}”案例理解${firstTopic}，从坏味道、变化轴、重构结构到适用边界完成一次设计判断。
publishDate: 2026-08-09
updatedDate: 2026-08-09
language: zh
---

## 先从问题出发

本节不从类图开始，而从 **${session.example}** 的变化压力开始：${smell}。真正要回答的问题是：${session.question}

设计的目标不是消灭修改，而是让一次需求变化只触碰与它同方向的代码。下面这张图把本节决策压缩为“症状—动作—结果”三步。

![P${session.page} ${session.title}：从问题症状到设计动作与可验证结果](${diagramPath})

## 核心判断

**${firstTopic}** 在这里不是一条必须服从的口号。它是在提醒我们：${move}。其余关键词——${remainingTopics}——都服务于同一个目的：找到一个调用方能理解、实现方能独立变化的边界。

重构之后期待的不是“类更多了”，而是一个可以验证的结果：${gain}。如果做完重构仍然需要在五个文件里同步修改同一种规则，说明边界很可能放错了。

## 最小代码例子

下面的代码刻意只保留决定性的协作关系。真实项目还要补上输入校验、错误模型、日志和测试，但这些不应掩盖本节的依赖方向。

\`\`\`${session.page >= 17 && session.page <= 20 ? 'java' : 'ts'}
${sample}
\`\`\`

阅读时不要只数接口和类，依次检查：

1. 谁拥有业务决策；
2. 哪个方向会经常变化；
3. 调用方依赖的是业务语言还是供应商语言；
4. 新增一种实现时，稳定流程是否仍要修改。

## 设计前后对照

| 观察点 | 重构前 | 重构后 |
| --- | --- | --- |
| 变化位置 | ${smell} | ${move} |
| 依赖方向 | 稳定逻辑了解易变细节 | 稳定逻辑只依赖明确边界 |
| 验证方式 | 依赖整套环境做回归 | 可以替换协作者并做局部测试 |
| 新增成本 | 修改旧分支并承担连锁风险 | 在边界后新增实现并运行契约测试 |

表格并不保证右侧永远更好。如果变化频率低、实现只有一个且结构非常稳定，多一层抽象可能只是让跳转路径变长。

## 什么时候值得使用

- 已经观察到同一类修改反复发生，而不是只猜测未来；
- 稳定规则与易变实现有清楚的语言边界；
- 可以通过单元测试或契约测试证明替换后的行为；
- 新结构让调用方更接近业务意图，而不是更接近框架术语。

## 什么时候先不要用

本节方案的主要代价是：${cost}。如果团队还说不清变化轴，先保留简单实现、收集第二个真实用例，通常比立即建立通用框架更安全。

另一个检查方法是看删除成本：如果抽象失败，能否在一次小重构中回到直接实现？越难撤销的设计，越需要真实证据。

## 动手练习

为“${session.example}”再增加一个与现有实现差异明显的需求。先写出会被修改的文件清单，再用本节结构重构。要求至少写两个测试：一个验证稳定业务规则，一个验证新旧实现遵守相同契约。

最后用三句话复盘：变化轴是什么；边界为什么放在这里；为了这次解耦付出了什么复杂度。

## 本节小结

${move}。当你能用“变化原因”和“行为契约”解释这个决定时，${firstTopic} 才从名词变成了可迁移的编程思想。
`
}

await mkdir(notesDir, { recursive: true })
await mkdir(diagramsDir, { recursive: true })

for (const [index, session] of programmingThoughtsSessions.entries()) {
  const design = lessonDesigns[index]
  const pagePrefix = `p${String(session.page).padStart(2, '0')}`
  await writeFile(path.join(notesDir, `${session.slug}.md`), buildArticle(session, design))
  await writeFile(
    path.join(diagramsDir, `${pagePrefix}-${session.slug}.svg`),
    buildDiagram(session, design)
  )
}

process.stdout.write(`Generated ${programmingThoughtsSessions.length} articles and diagrams.\n`)
