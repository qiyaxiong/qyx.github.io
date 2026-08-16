export type ProgrammingThoughtsPhase =
  | 'design-foundations'
  | 'singleton'
  | 'factory'
  | 'creation'
  | 'structural'

export interface ProgrammingThoughtsSession {
  page: number
  cid: number
  slug: string
  title: string
  sourceTitle: string
  durationSeconds: number
  phase: ProgrammingThoughtsPhase
  topics: string[]
  example: string
  question: string
}

export interface ProgrammingThoughtsPhaseInfo {
  id: ProgrammingThoughtsPhase
  label: string
  title: string
  description: string
  range: string
}

export const programmingThoughtsPhases: ProgrammingThoughtsPhaseInfo[] = [
  {
    id: 'design-foundations',
    label: '第一阶段',
    title: '从坏味道到设计原则',
    description: '先学会识别变化、职责、依赖与边界，再讨论模式。原则不是口号，而是降低修改成本的判断工具。',
    range: 'P1–P16'
  },
  {
    id: 'singleton',
    label: '第二阶段',
    title: '单例：看似简单的全局状态',
    description: '比较饿汉、懒汉、静态内部类和反射问题，同时辨认单例带来的测试与生命周期代价。',
    range: 'P17–P21'
  },
  {
    id: 'factory',
    label: '第三阶段',
    title: '工厂族：把创建决策移出业务代码',
    description: '从简单工厂走到工厂方法和抽象工厂，用解析器与数据库产品族理解三者真正不同的变化轴。',
    range: 'P22–P28'
  },
  {
    id: 'creation',
    label: '第四阶段',
    title: '原型与建造者：复制和分步构造',
    description: '处理深浅拷贝、模板注册表、复杂对象的可读构造与不变量校验。',
    range: 'P29–P33'
  },
  {
    id: 'structural',
    label: '第五阶段',
    title: '结构型模式：组合对象而不扩大复杂度',
    description: '用适配器、装饰器、代理、外观、桥接、组合与享元组织协作关系，并明确它们容易混淆的边界。',
    range: 'P34–P46'
  }
]

export const programmingThoughtsSessions: ProgrammingThoughtsSession[] = [
  {
    page: 1,
    cid: 763350916,
    slug: 'programming-thoughts-introduction',
    title: '编程思想：先控制变化，再选择模式',
    sourceTitle: '1、编程思想介绍（重要）',
    durationSeconds: 1530,
    phase: 'design-foundations',
    topics: ['变化成本', '抽象', '边界', '可测试性'],
    example: '可插拔通知服务',
    question: '代码“能运行”之后，怎样让下一次需求变化仍然容易？'
  },
  {
    page: 2,
    cid: 763426727,
    slug: 'high-cohesion',
    title: '高内聚：让一起变化的代码待在一起',
    sourceTitle: '2、高内聚',
    durationSeconds: 1185,
    phase: 'design-foundations',
    topics: ['内聚度', '模块职责', '局部推理', '命名'],
    example: '订单定价模块',
    question: '一个模块里的成员为什么应该围绕同一个目标协作？'
  },
  {
    page: 3,
    cid: 763425995,
    slug: 'low-coupling',
    title: '低耦合：让协作依赖稳定接口',
    sourceTitle: '3、低耦合',
    durationSeconds: 529,
    phase: 'design-foundations',
    topics: ['耦合类型', '接口', '端口', '替换成本'],
    example: '第三方支付适配',
    question: '模块必须协作时，怎样避免了解彼此太多细节？'
  },
  {
    page: 4,
    cid: 763426650,
    slug: 'single-responsibility-principle',
    title: '单一职责：一个模块只对一种变化负责',
    sourceTitle: '4、单一职责原则',
    durationSeconds: 2037,
    phase: 'design-foundations',
    topics: ['SRP', '变化原因', '职责拆分', '协作者'],
    example: '报表生成与发送',
    question: '“只做一件事”为什么不是按代码行数拆类？'
  },
  {
    page: 5,
    cid: 763427301,
    slug: 'open-closed-principle-definition',
    title: '开放封闭（一）：把新需求变成新增代码',
    sourceTitle: '5、开放封闭原则(1)',
    durationSeconds: 1199,
    phase: 'design-foundations',
    topics: ['OCP', '扩展点', '条件分支', '变化轴'],
    example: '促销折扣规则',
    question: '为什么每加一种业务规则都修改旧分支，是危险信号？'
  },
  {
    page: 6,
    cid: 763427446,
    slug: 'open-closed-principle-abstraction',
    title: '开放封闭（二）：用抽象隔离真正的变化',
    sourceTitle: '6、开放封闭原则（2）',
    durationSeconds: 1249,
    phase: 'design-foundations',
    topics: ['策略接口', '多态', '稳定核心', '扩展实现'],
    example: '文件导出器',
    question: '抽象应该放在哪里，才能保护稳定逻辑而不是增加空壳？'
  },
  {
    page: 7,
    cid: 763427405,
    slug: 'open-closed-principle-boundaries',
    title: '开放封闭（三）：用多态移除类型分支',
    sourceTitle: '7、开放封闭原则(3)',
    durationSeconds: 878,
    phase: 'design-foundations',
    topics: ['多态', '类型分支', '注册表', '扩展边界'],
    example: '通知渠道注册表',
    question: '当 switch 只是在选择不同实现时，怎样让新增类型不再修改执行流程？'
  },
  {
    page: 8,
    cid: 763426979,
    slug: 'dependency-inversion-principle',
    title: '依赖倒置（一）：业务规则不依赖基础设施',
    sourceTitle: '8、依赖倒置原则（1）',
    durationSeconds: 807,
    phase: 'design-foundations',
    topics: ['DIP', '高层策略', '端口', '基础设施'],
    example: '审计日志存储',
    question: '为什么核心业务直接 new 数据库客户端会越来越难测试？'
  },
  {
    page: 9,
    cid: 763430729,
    slug: 'dependency-inversion-with-di',
    title: '依赖倒置（二）：依赖注入不是容器魔法',
    sourceTitle: '9、依赖倒置原则(2)',
    durationSeconds: 1415,
    phase: 'design-foundations',
    topics: ['依赖注入', '构造器注入', '组合根', '测试替身'],
    example: '支付用例编排',
    question: '如何让依赖显式可见，并在程序入口统一装配？'
  },
  {
    page: 10,
    cid: 763427449,
    slug: 'liskov-substitution-principle',
    title: '里氏替换：子类型必须守住行为契约',
    sourceTitle: '10、里式替换原则',
    durationSeconds: 213,
    phase: 'design-foundations',
    topics: ['LSP', '前置条件', '后置条件', '行为兼容'],
    example: '可读缓存与只读缓存',
    question: '类型签名相同，为什么替换后仍可能破坏程序？'
  },
  {
    page: 11,
    cid: 763428969,
    slug: 'interface-segregation-principle',
    title: '接口隔离：让调用方只依赖自己需要的能力',
    sourceTitle: '11、接口隔离原则',
    durationSeconds: 618,
    phase: 'design-foundations',
    topics: ['ISP', '角色接口', '胖接口', '能力拆分'],
    example: '云存储读写接口',
    question: '一个“大而全”的接口为什么会把无关变化传播给所有实现？'
  },
  {
    page: 12,
    cid: 763427948,
    slug: 'law-of-demeter-boundaries',
    title: '迪米特法则（一）：不要穿透对象边界取数据',
    sourceTitle: '12、迪米特原则（1）',
    durationSeconds: 943,
    phase: 'design-foundations',
    topics: ['最少知识', '对象边界', '导航链', '封装'],
    example: '结算页读取收货地区',
    question: '长长的 getter 链为什么会让调用方依赖整个对象图？'
  },
  {
    page: 13,
    cid: 763428382,
    slug: 'law-of-demeter-refactoring',
    title: '迪米特法则（二）：把问题交回拥有数据的对象',
    sourceTitle: '13、迪米特原则',
    durationSeconds: 1333,
    phase: 'design-foundations',
    topics: ['Tell, Don’t Ask', '委托', '门面方法', '封装变化'],
    example: '订单配送资格判断',
    question: '如何把“取数据再判断”重构为对对象发出有意义的命令？'
  },
  {
    page: 14,
    cid: 763427688,
    slug: 'composition-over-inheritance',
    title: '合成复用（一）：优先组合，而不是继承排列组合',
    sourceTitle: '13、合成复用原则（1）',
    durationSeconds: 1016,
    phase: 'design-foundations',
    topics: ['组合', '继承', '委托', '独立变化'],
    example: '运费与会员优惠',
    question: '两个独立变化轴为什么不该通过子类数量相乘来实现？'
  },
  {
    page: 15,
    cid: 763428713,
    slug: 'composition-reuse-practice',
    title: '合成复用（二）：看懂六种类关系与复用强度',
    sourceTitle: '14、合成复用原则（2）',
    durationSeconds: 1630,
    phase: 'design-foundations',
    topics: ['依赖与关联', '聚合与组合', '泛化与实现', '生命周期'],
    example: '订单领域对象关系',
    question: '如何根据所有权和生命周期，区分代码中的六种类关系？'
  },
  {
    page: 16,
    cid: 769316590,
    slug: 'design-patterns-introduction',
    title: '设计模式导入：从名字回到问题、约束与代价',
    sourceTitle: '15、设计模式导入',
    durationSeconds: 881,
    phase: 'design-foundations',
    topics: ['模式语言', '适用场景', '权衡', '反模式'],
    example: '支付渠道演进',
    question: '为什么不理解约束，照着类图也会写出错误的设计模式？'
  },
  {
    page: 17,
    cid: 769318359,
    slug: 'eager-lazy-singleton',
    title: '单例（一）：饿汉式、懒汉式与线程安全',
    sourceTitle: '16、饿汉式&懒汉式单例模式',
    durationSeconds: 2040,
    phase: 'singleton',
    topics: ['饿汉式', '懒汉式', '线程安全', '生命周期'],
    example: '只读配置目录',
    question: '延迟创建换来了什么，又必须补上哪些并发保证？'
  },
  {
    page: 18,
    cid: 769318717,
    slug: 'singleton-reflection-problem',
    title: '单例（二）：Python 模块如何守住唯一实例',
    sourceTitle: '17、反射&单例(1)',
    durationSeconds: 1295,
    phase: 'singleton',
    topics: ['模块对象', '构造边界', '不变量', '攻击面'],
    example: 'Python 配置中心',
    question: '为什么 Python 更适合用模块边界，而不是模拟私有构造器？'
  },
  {
    page: 19,
    cid: 769319106,
    slug: 'singleton-reflection-defense',
    title: '单例（三）：反射防护与枚举方案',
    sourceTitle: '18、反射&单例(2)',
    durationSeconds: 303,
    phase: 'singleton',
    topics: ['构造守卫', 'Enum 单例', '序列化', '边界'],
    example: 'Python 模块级注册表',
    question: '哪些防护只是补丁，哪些保证由 Python 运行时提供？'
  },
  {
    page: 20,
    cid: 769319043,
    slug: 'static-holder-singleton',
    title: '单例（四）：缓存函数的延迟初始化',
    sourceTitle: '19、内部静态类实现单例',
    durationSeconds: 398,
    phase: 'singleton',
    topics: ['缓存函数', '延迟初始化', '生命周期', '线程安全'],
    example: 'Python 延迟元数据目录',
    question: '如何利用 Python 的缓存函数避免手写双重检查锁？'
  },
  {
    page: 21,
    cid: 769319163,
    slug: 'singleton-tradeoffs',
    title: '单例总结：唯一实例不等于全局可访问',
    sourceTitle: '20、单例设计模式总结',
    durationSeconds: 223,
    phase: 'singleton',
    topics: ['全局状态', '作用域', '可测试性', '替代方案'],
    example: '请求上下文与应用服务',
    question: '什么时候需要一个实例，什么时候只是为了少传一个参数？'
  },
  {
    page: 22,
    cid: 769319191,
    slug: 'simple-factory',
    title: '简单工厂：集中管理有限的创建分支',
    sourceTitle: '21、简单工厂设计模式',
    durationSeconds: 1036,
    phase: 'factory',
    topics: ['创建封装', '类型分支', '返回抽象', '演进边界'],
    example: '文档解析器',
    question: '何时把 new 和 switch 集中起来，就已经足够好？'
  },
  {
    page: 23,
    cid: 769319360,
    slug: 'factory-method',
    title: '工厂方法：让子类决定创建哪种产品',
    sourceTitle: '22、工厂方法设计模式',
    durationSeconds: 848,
    phase: 'factory',
    topics: ['工厂方法', 'Creator', 'Product', '扩展'],
    example: '批量通知任务',
    question: '当创建决策需要跟随流程扩展时，简单工厂为什么不够？'
  },
  {
    page: 24,
    cid: 769319535,
    slug: 'reflection-driven-factory',
    title: '工厂与反射：从硬编码分支到显式注册表',
    sourceTitle: '23、工厂设计模式与反射',
    durationSeconds: 1242,
    phase: 'factory',
    topics: ['反射创建', '配置', '注册表', '类型安全'],
    example: '命令处理器注册',
    question: '删除 switch 之后，如何避免把错误推迟到运行时？'
  },
  {
    page: 25,
    cid: 777022345,
    slug: 'abstract-factory-introduction',
    title: '抽象工厂（一）：创建相互兼容的产品族',
    sourceTitle: '24、抽象工厂设计模式导入',
    durationSeconds: 843,
    phase: 'factory',
    topics: ['抽象工厂', '产品族', '一致性', '变化轴'],
    example: '跨平台 UI 组件',
    question: '为什么“创建一组必须配套使用的对象”不同于创建一个对象？'
  },
  {
    page: 26,
    cid: 777022485,
    slug: 'abstract-factory-implementation',
    title: '抽象工厂（二）：实现产品族与装配入口',
    sourceTitle: '25、抽象工厂设计模式实现',
    durationSeconds: 814,
    phase: 'factory',
    topics: ['产品接口', '具体工厂', '组合根', '一致装配'],
    example: '明暗主题组件族',
    question: '如何保证按钮、对话框和菜单来自同一个主题族？'
  },
  {
    page: 27,
    cid: 777022894,
    slug: 'database-family-abstract-factory',
    title: '抽象工厂（三）：切换数据库实现而不污染业务',
    sourceTitle: '26、抽象工厂更换数据库案例(1)',
    durationSeconds: 966,
    phase: 'factory',
    topics: ['数据库产品族', 'Repository', '事务', '方言'],
    example: 'PostgreSQL 与 SQLite 仓储',
    question: '数据库切换为什么不仅是替换一条连接字符串？'
  },
  {
    page: 28,
    cid: 777026872,
    slug: 'abstract-factory-case-wrapup',
    title: '抽象工厂（四）：用契约测试校验产品族',
    sourceTitle: '27、抽象工厂更换数据库案例(2)',
    durationSeconds: 62,
    phase: 'factory',
    topics: ['契约测试', '事务边界', '替换验证', '总结'],
    example: '双数据库契约测试',
    question: '换了整套实现后，怎样证明业务看到的行为仍然一致？'
  },
  {
    page: 29,
    cid: 777026976,
    slug: 'prototype-pattern-basics',
    title: '原型模式（一）：从已有实例复制复杂配置',
    sourceTitle: '28、原型模式(1)',
    durationSeconds: 1412,
    phase: 'creation',
    topics: ['Prototype', 'clone', '构造成本', '模板'],
    example: '报表模板实例',
    question: '对象创建依赖大量配置时，复制一个基准实例是否更清晰？'
  },
  {
    page: 30,
    cid: 777028132,
    slug: 'deep-shallow-copy',
    title: '原型模式（二）：深拷贝、浅拷贝与共享引用',
    sourceTitle: '29、原型模式(2)',
    durationSeconds: 793,
    phase: 'creation',
    topics: ['浅拷贝', '深拷贝', '可变对象', '所有权'],
    example: '带步骤列表的工作流模板',
    question: '复制外层对象后，修改嵌套数据为什么会影响原对象？'
  },
  {
    page: 31,
    cid: 777028684,
    slug: 'prototype-pattern-practice',
    title: '原型模式（三）：用原型注册表管理命名模板',
    sourceTitle: '30、原型模式(2)',
    durationSeconds: 339,
    phase: 'creation',
    topics: ['原型注册表', '命名模板', '防御性复制', '边界'],
    example: '消息卡片模板库',
    question: '如何避免调用方拿到注册表中的原对象并意外修改它？'
  },
  {
    page: 32,
    cid: 777028792,
    slug: 'builder-pattern-basics',
    title: '建造者（一）：把复杂对象的构造步骤命名出来',
    sourceTitle: '31、建造者设计模式(1)',
    durationSeconds: 690,
    phase: 'creation',
    topics: ['Builder', '分步构造', '可选参数', '可读性'],
    example: 'HTTP 请求对象',
    question: '构造参数越来越多时，如何让调用代码表达意图而不是位置？'
  },
  {
    page: 33,
    cid: 777029126,
    slug: 'builder-pattern-practice',
    title: '建造者（二）：在 build 时统一校验不变量',
    sourceTitle: '32、建造者设计模式(2)',
    durationSeconds: 1029,
    phase: 'creation',
    topics: ['Fluent API', '不变量', '不可变对象', '校验'],
    example: '邮件消息构建器',
    question: '怎样既支持灵活配置，又不允许产生半初始化对象？'
  },
  {
    page: 34,
    cid: 811734668,
    slug: 'adapter-pattern-theory',
    title: '适配器（一）：转换接口，不改变业务意图',
    sourceTitle: '33、适配器设计模式理论',
    durationSeconds: 660,
    phase: 'structural',
    topics: ['Adapter', 'Target', 'Adaptee', '边界转换'],
    example: '旧支付网关接入',
    question: '第三方接口与业务接口不一致时，转换代码应该放在哪里？'
  },
  {
    page: 35,
    cid: 811735133,
    slug: 'adapter-pattern-practice',
    title: '适配器（二）：把外部数据模型挡在系统边界',
    sourceTitle: '34、适配器设计模式实现',
    durationSeconds: 534,
    phase: 'structural',
    topics: ['对象适配器', '错误映射', 'DTO', '反腐层'],
    example: '天气服务客户端',
    question: '除了改方法名，适配器还应处理哪些语义差异？'
  },
  {
    page: 36,
    cid: 811735253,
    slug: 'decorator-pattern-theory',
    title: '装饰器（一）：沿同一接口叠加职责',
    sourceTitle: '35、装饰器设计模式理论',
    durationSeconds: 775,
    phase: 'structural',
    topics: ['Decorator', '透明包装', '职责组合', '顺序'],
    example: '消息发送管道',
    question: '怎样不制造大量子类，也能按需组合日志、重试和压缩？'
  },
  {
    page: 37,
    cid: 811735320,
    slug: 'decorator-pattern-practice',
    title: '装饰器（二）：组合重试、缓存与可观测性',
    sourceTitle: '36、装饰器设计模式实现',
    durationSeconds: 1458,
    phase: 'structural',
    topics: ['装饰链', '执行顺序', '横切能力', '调试'],
    example: 'HTTP 客户端能力栈',
    question: '装饰器顺序为什么会改变超时、重试与指标的含义？'
  },
  {
    page: 38,
    cid: 811735455,
    slug: 'proxy-pattern-theory',
    title: '代理（一）：控制对真实对象的访问',
    sourceTitle: '37、代理设计模式理论',
    durationSeconds: 778,
    phase: 'structural',
    topics: ['Proxy', '访问控制', '延迟加载', '远程代理'],
    example: '大图资源服务',
    question: '代理和装饰器类图相似，意图为什么不同？'
  },
  {
    page: 39,
    cid: 811735636,
    slug: 'proxy-pattern-practice',
    title: '代理（二）：在访问入口加入鉴权与缓存',
    sourceTitle: '38、代理设计模式应用',
    durationSeconds: 1226,
    phase: 'structural',
    topics: ['保护代理', '缓存代理', '权限', '生命周期'],
    example: '受保护的文档服务',
    question: '哪些策略属于访问控制，哪些不应偷偷改变业务结果？'
  },
  {
    page: 40,
    cid: 838013624,
    slug: 'facade-pattern',
    title: '外观模式：为复杂子系统提供稳定入口',
    sourceTitle: '39、外观设计模式',
    durationSeconds: 542,
    phase: 'structural',
    topics: ['Facade', '子系统', '用例入口', '简化协作'],
    example: '视频发布流水线',
    question: '如何减少调用方需要理解的对象数量，又不封死高级能力？'
  },
  {
    page: 41,
    cid: 838013755,
    slug: 'bridge-pattern-theory',
    title: '桥接（一）：拆开两个会独立增长的维度',
    sourceTitle: '40、桥接设计模式理论',
    durationSeconds: 506,
    phase: 'structural',
    topics: ['Bridge', '抽象层次', '实现层次', '组合爆炸'],
    example: '通知类型与发送渠道',
    question: '两个维度各自增加时，怎样避免子类数量相乘？'
  },
  {
    page: 42,
    cid: 838013878,
    slug: 'bridge-pattern-practice',
    title: '桥接（二）：让报表格式与存储后端独立演进',
    sourceTitle: '41、桥接设计模式应用',
    durationSeconds: 740,
    phase: 'structural',
    topics: ['Abstraction', 'Implementor', '运行时组合', '独立演进'],
    example: '报表格式 × 存储后端',
    question: '如何新增 PDF 格式而不修改本地、S3 与邮件三个后端？'
  },
  {
    page: 43,
    cid: 838014105,
    slug: 'composite-pattern-theory',
    title: '组合（一）：用同一接口表示叶子与容器',
    sourceTitle: '42、组合设计模式理论',
    durationSeconds: 616,
    phase: 'structural',
    topics: ['Composite', '树结构', 'Leaf', '递归'],
    example: '文件与目录树',
    question: '调用方如何不区分单个对象和对象集合就完成递归操作？'
  },
  {
    page: 44,
    cid: 838014055,
    slug: 'composite-pattern-practice',
    title: '组合（二）：递归计算权限树与菜单树',
    sourceTitle: '43、组合设计模式案例',
    durationSeconds: 1253,
    phase: 'structural',
    topics: ['递归遍历', '透明性', '安全性', '聚合结果'],
    example: '组织权限树',
    question: '父节点如何聚合子节点结果，同时阻止叶子节点添加孩子？'
  },
  {
    page: 45,
    cid: 838014248,
    slug: 'flyweight-pattern-theory',
    title: '享元（一）：分离可共享状态与上下文状态',
    sourceTitle: '44、享元设计模式理论',
    durationSeconds: 1541,
    phase: 'structural',
    topics: ['Flyweight', '内蕴状态', '外蕴状态', '对象池'],
    example: '文本字符样式',
    question: '大量相似对象真正重复的是什么，哪些状态不能共享？'
  },
  {
    page: 46,
    cid: 838014294,
    slug: 'flyweight-pattern-practice',
    title: '享元（二）：用共享瓦片降低地图对象开销',
    sourceTitle: '45、享元设计模式应用',
    durationSeconds: 810,
    phase: 'structural',
    topics: ['享元工厂', '缓存键', '不可变共享', '性能测量'],
    example: '游戏地图瓦片',
    question: '怎样证明对象共享真的节省内存，而不是凭感觉增加复杂度？'
  }
]

export function getProgrammingThoughtsDuration(session: ProgrammingThoughtsSession): string {
  const minutes = Math.floor(session.durationSeconds / 60)
  const seconds = session.durationSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function getProgrammingThoughtsVideoUrl(session: ProgrammingThoughtsSession): string {
  return `https://www.bilibili.com/video/BV1Xv4y1T7by/?p=${session.page}`
}

export function getProgrammingThoughtsEmbedUrl(session: ProgrammingThoughtsSession): string {
  return `https://player.bilibili.com/player.html?bvid=BV1Xv4y1T7by&cid=${session.cid}&page=${session.page}&high_quality=1&danmaku=0`
}

export function getProgrammingThoughtsSession(path: string): ProgrammingThoughtsSession | undefined {
  const prefix = 'programming-thoughts/course/'
  if (!path.startsWith(prefix)) return undefined

  const slug = path.slice(prefix.length)
  return programmingThoughtsSessions.find((session) => session.slug === slug)
}
