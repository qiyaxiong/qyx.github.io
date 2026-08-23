export const programmingThoughtsUmlSpecs = {
  'change-cohesion-coupling-srp': {
    kind: 'UML 类图', caption: 'Checkout 只负责编排，折扣和支付沿各自变化轴实现端口。',
    nodes: [
      ['checkout', 'Checkout', 'Application Service', ['+ run(order): Result'], 1, 0],
      ['discount', 'Discount', 'Protocol', ['+ apply(subtotal): int'], 0, 1],
      ['vip', 'VipDiscount', 'Implementation', ['+ apply(subtotal): int'], 0, 2],
      ['payment', 'Payment', 'Protocol', ['+ charge(order_id, cents): str'], 2, 1],
      ['fake', 'FakePayment', 'Implementation', ['+ charge(order_id, cents): str'], 2, 2]
    ],
    edges: [['checkout', 'discount', 'depends on', 'dependency'], ['checkout', 'payment', 'depends on', 'dependency'], ['vip', 'discount', 'implements', 'implements'], ['fake', 'payment', 'implements', 'implements']]
  },
  'open-closed-principle-evolution': {
    kind: 'UML 类图', caption: 'Registry 负责名称到规则的选择，计算流程只依赖 DiscountRule。',
    nodes: [
      ['registry', 'DiscountRegistry', 'Registry', ['- rules: dict', '+ register(name, rule)', '+ total(name, subtotal)'], 1, 0],
      ['rule', 'DiscountRule', 'Protocol', ['+ apply(subtotal): int'], 1, 1],
      ['new', 'NewUser', 'Rule', ['+ apply(subtotal): int'], 0, 2],
      ['vip', 'Vip', 'Rule', ['+ apply(subtotal): int'], 2, 2]
    ],
    edges: [['registry', 'rule', 'stores', 'composition'], ['new', 'rule', 'implements', 'implements'], ['vip', 'rule', 'implements', 'implements']]
  },
  'dependency-inversion-di-contracts': {
    kind: 'UML 端口图', caption: '高层用例拥有端口定义，生产适配器与测试替身都从外侧实现契约。',
    nodes: [
      ['usecase', 'PlaceOrder', 'Use Case', ['+ run(order_id, cents): str'], 1, 0],
      ['payment', 'Payment', 'Protocol', ['+ charge(...): str'], 0, 1],
      ['audit', 'Audit', 'Protocol', ['+ append(event): None'], 2, 1],
      ['vendor', 'VendorAdapter', 'Infrastructure', ['+ charge(...): str'], 0, 2],
      ['memory', 'MemoryAudit', 'Test / Infrastructure', ['+ events: list', '+ append(event)'], 2, 2]
    ],
    edges: [['usecase', 'payment', 'constructor injection', 'dependency'], ['usecase', 'audit', 'constructor injection', 'dependency'], ['vendor', 'payment', 'implements', 'implements'], ['memory', 'audit', 'implements', 'implements']]
  },
  'object-boundaries-demeter-composition': {
    kind: 'UML 对象关系图', caption: 'Order 拥有自己的数据，通过两个策略对象完成报价，不再暴露 customer.profile.address 导航链。',
    nodes: [
      ['order', 'Order', 'Entity', ['- city: str', '- prices: list[int]', '+ quote(shipping, discount)'], 1, 0],
      ['shipping', 'Shipping', 'Protocol', ['+ price(city): int'], 0, 1],
      ['discount', 'Discount', 'Protocol', ['+ apply(subtotal): int'], 2, 1],
      ['local', 'LocalShipping', 'Strategy', ['+ price(city): int'], 0, 2],
      ['vip', 'Vip', 'Strategy', ['+ apply(subtotal): int'], 2, 2]
    ],
    edges: [['order', 'shipping', 'uses', 'association'], ['order', 'discount', 'uses', 'association'], ['local', 'shipping', 'implements', 'implements'], ['vip', 'discount', 'implements', 'implements']]
  },
  'patterns-and-singleton-lifecycle': {
    kind: 'UML 对象与生命周期图', caption: '唯一实例由组合根缓存，业务用例仍通过构造函数显式接收 Catalog。',
    nodes: [
      ['root', 'application_catalog()', 'Composition Root', ['@lru_cache(maxsize=1)', '+ returns Catalog'], 0, 0],
      ['catalog', 'Catalog', 'Application Singleton', ['- values: dict', '+ find(key)'], 1, 1],
      ['usecase', 'ShowVersion', 'Use Case', ['- catalog: Catalog', '+ run(): str'], 2, 0],
      ['fake', 'Catalog(test data)', 'Test Object', ['version = test'], 2, 2]
    ],
    edges: [['root', 'catalog', 'creates once', 'lifecycle'], ['catalog', 'usecase', 'injects', 'dependency'], ['fake', 'usecase', 'replaces in test', 'dependency']]
  },
  'simple-factory-method-registry': {
    kind: 'UML 创建关系图', caption: 'ImportJob 请求抽象 Parser；Registry 集中创建，但允许插件注册新工厂。',
    nodes: [
      ['job', 'ImportJob', 'Client', ['+ run(kind, text)'], 0, 0],
      ['registry', 'ParserRegistry', 'Factory Registry', ['- factories: dict', '+ register(kind, factory)', '+ create(kind): Parser'], 1, 1],
      ['parser', 'Parser', 'Protocol', ['+ parse(text): dict'], 2, 0],
      ['json', 'JsonParser', 'Product', ['+ parse(text): dict'], 2, 2]
    ],
    edges: [['job', 'registry', 'asks to create', 'dependency'], ['registry', 'parser', 'creates', 'creates'], ['json', 'parser', 'implements', 'implements']]
  },
  'abstract-factory-product-family': {
    kind: 'UML 抽象工厂图', caption: 'StorageFamily 一次提供相容的 Orders 与 Transaction，阻止 PostgreSQL/SQLite 产品混搭。',
    nodes: [
      ['client', 'save_order()', 'Client', ['+ save_order(family, id)'], 0, 0],
      ['family', 'StorageFamily', 'Abstract Factory', ['+ orders(): Orders', '+ transaction(): Transaction'], 1, 1],
      ['orders', 'Orders', 'Abstract Product', ['+ save(order_id)'], 2, 0],
      ['tx', 'Transaction', 'Abstract Product', ['+ enter()', '+ exit()'], 2, 2],
      ['memory', 'MemoryFamily', 'Concrete Factory', ['+ orders()', '+ transaction()'], 0, 2]
    ],
    edges: [['client', 'family', 'uses', 'dependency'], ['memory', 'family', 'implements', 'implements'], ['family', 'orders', 'creates', 'creates'], ['family', 'tx', 'creates', 'creates']]
  },
  'prototype-copy-registry': {
    kind: 'UML 原型图', caption: '注册和取用都通过 clone()，调用方永远拿不到 Registry 内部保存的原型本体。',
    nodes: [
      ['client', 'Client', 'Caller', ['+ create daily workflow'], 0, 0],
      ['registry', 'PrototypeRegistry', 'Registry', ['- items: dict', '+ register(name, value)', '+ create(name): Workflow'], 1, 1],
      ['prototype', 'Workflow', 'Prototype', ['- title: str', '- steps: list[str]', '+ clone(): Workflow'], 2, 0],
      ['copy', 'Workflow copy', 'Independent Object', ['steps are deep-copied'], 2, 2]
    ],
    edges: [['client', 'registry', 'requests by name', 'dependency'], ['registry', 'prototype', 'owns prototype', 'composition'], ['prototype', 'copy', 'clone()', 'creates']]
  },
  'builder-object-invariants': {
    kind: 'UML 建造者图', caption: 'Builder 暂存可变配置；只有 build() 校验完成后才创建不可变 Request。',
    nodes: [
      ['client', 'Client', 'Caller', ['+ configure request'], 0, 0],
      ['builder', 'RequestBuilder', 'Builder', ['- method / url / timeout / body', '+ with_timeout()', '+ with_json()', '+ build(): Request'], 1, 1],
      ['request', 'Request', 'Immutable Product', ['+ method: str', '+ url: str', '+ timeout: float', '+ body: bytes?'], 2, 0],
      ['guard', 'Invariant checks', 'Build Boundary', ['GET cannot have body', 'timeout > 0'], 2, 2]
    ],
    edges: [['client', 'builder', 'configures', 'association'], ['builder', 'guard', 'validates', 'dependency'], ['builder', 'request', 'creates valid', 'creates']]
  },
  'adapter-anticorruption-layer': {
    kind: 'UML 适配器图', caption: '业务只认识 charge(cents) 与 Receipt；Adapter 独占供应商单位、字段和错误码。',
    nodes: [
      ['client', 'Checkout', 'Client', ['+ pay(order)'], 0, 0],
      ['target', 'Payment', 'Target Protocol', ['+ charge(order_id, cents): Receipt'], 1, 1],
      ['adapter', 'LegacyGatewayAdapter', 'Adapter', ['- sdk: LegacySdk', '+ charge(...): Receipt'], 2, 0],
      ['adaptee', 'LegacySdk', 'Adaptee', ['+ pay(ref, amount_yuan): dict'], 2, 2]
    ],
    edges: [['client', 'target', 'depends on', 'dependency'], ['adapter', 'target', 'implements', 'implements'], ['adapter', 'adaptee', 'translates & delegates', 'association']]
  },
  'decorator-middleware-pipeline': {
    kind: 'UML 装饰器图', caption: 'Metrics 与 Retry 都保持 Client 接口；包装顺序决定一次逻辑调用包含多少次物理请求。',
    nodes: [
      ['client', 'Client', 'Protocol', ['+ get(url): str'], 1, 0],
      ['metrics', 'Metrics', 'Decorator', ['- inner: Client', '+ get(url): str'], 0, 1],
      ['retry', 'Retry', 'Decorator', ['- inner: Client', '- attempts: int', '+ get(url): str'], 1, 2],
      ['http', 'HttpClient', 'Concrete Component', ['+ get(url): str'], 2, 1]
    ],
    edges: [['metrics', 'client', 'implements', 'implements'], ['retry', 'client', 'implements', 'implements'], ['http', 'client', 'implements', 'implements'], ['metrics', 'retry', 'wraps', 'composition'], ['retry', 'http', 'wraps', 'composition']]
  },
  'proxy-access-facade': {
    kind: 'UML 代理与外观图', caption: 'ProtectedPublisher 控制访问；PublishingFacade 在代理后面协调复杂发布子系统。',
    nodes: [
      ['publisher', 'Publisher', 'Protocol', ['+ publish(source): str'], 1, 0],
      ['proxy', 'ProtectedPublisher', 'Protection Proxy', ['- inner: Publisher', '- allowed: set', '+ publish_as(user, source)'], 0, 1],
      ['facade', 'PublishingFacade', 'Facade', ['+ publish(source): str'], 1, 2],
      ['subsystem', 'Publishing Subsystem', 'Transcode · Cover · Store', ['encode()', 'thumbnail()', 'upload()'], 2, 1]
    ],
    edges: [['proxy', 'publisher', 'protects', 'implements'], ['facade', 'publisher', 'implements', 'implements'], ['proxy', 'facade', 'delegates', 'association'], ['facade', 'subsystem', 'coordinates', 'composition']]
  },
  'bridge-independent-dimensions': {
    kind: 'UML 桥接图', caption: 'Report 与 Storage 是两个独立层次，通过组合连接，避免格式 × 后端的子类乘法。',
    nodes: [
      ['report', 'Report', 'Abstraction', ['- storage: Storage', '+ render(rows): bytes', '+ save(name, rows)'], 0, 0],
      ['csv', 'CsvReport', 'Refined Abstraction', ['+ render(rows): bytes'], 0, 2],
      ['storage', 'Storage', 'Implementor', ['+ put(name, data): str'], 2, 0],
      ['memory', 'MemoryStorage', 'Concrete Implementor', ['- files: dict', '+ put(name, data): str'], 2, 2]
    ],
    edges: [['csv', 'report', 'extends', 'inheritance'], ['report', 'storage', 'bridge / has-a', 'association'], ['memory', 'storage', 'implements', 'implements']]
  },
  'composite-recursive-tree': {
    kind: 'UML 组合模式图', caption: '叶子 User 和容器 Group 共享 PermissionNode；Group 递归组合零到多个子节点。',
    nodes: [
      ['node', 'PermissionNode', 'Component Protocol', ['+ allows(action): bool'], 1, 0],
      ['user', 'User', 'Leaf', ['- permissions: set', '+ allows(action): bool'], 0, 2],
      ['group', 'Group', 'Composite', ['- children: list[PermissionNode]', '+ allows(action): bool'], 2, 2]
    ],
    edges: [['user', 'node', 'implements', 'implements'], ['group', 'node', 'implements', 'implements'], ['group', 'node', 'children 0..*', 'composition']]
  },
  'flyweight-state-memory': {
    kind: 'UML 享元对象图', caption: 'Tile 保留外蕴坐标；大量 Tile 通过 TileTypes 共享少量不可变 TileType。',
    nodes: [
      ['tile', 'Tile', 'Context Object', ['+ x: int', '+ y: int', '+ kind: TileType'], 0, 0],
      ['factory', 'TileTypes', 'Flyweight Factory', ['- cache: dict', '+ get(texture, walkable)'], 1, 2],
      ['type', 'TileType', 'Flyweight', ['+ texture: str', '+ walkable: bool', 'immutable'], 2, 0],
      ['many', 'Tile × 1,000,000', 'Many Contexts', ['different x / y', 'same kind identity'], 0, 2]
    ],
    edges: [['many', 'tile', 'instances', 'association'], ['tile', 'type', 'shares', 'association'], ['factory', 'type', 'caches by key', 'composition']]
  }
}

export function getProgrammingThoughtsUmlSpec(slug) {
  const spec = programmingThoughtsUmlSpecs[slug]
  if (!spec) throw new Error(`Missing UML spec: ${slug}`)
  return spec
}
