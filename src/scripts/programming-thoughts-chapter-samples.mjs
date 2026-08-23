const samples = {
  'change-cohesion-coupling-srp': {
    stages: ['结算、折扣、支付和通知全挤在 checkout() 中，一次活动改动会碰完整流程', '第二种折扣出现后，定价规则开始反复修改结算函数', '支付供应商更换后，SDK 字段与错误码渗入业务流程', '邮件通知再次变化，结算用例需要只保留编排职责'],
    before: `def checkout(order, payment_sdk):
    subtotal = sum(item["price"] for item in order["items"])
    total = round(subtotal * (0.9 if order["vip"] else 1))
    trade = payment_sdk.pay(order["id"], total)
    print(f"paid:{trade}")
    return total`,
    after: `from dataclasses import dataclass
from typing import Protocol

class Discount(Protocol):
    def apply(self, subtotal: int) -> int: ...

class Payment(Protocol):
    def charge(self, order_id: str, cents: int) -> str: ...

@dataclass(frozen=True)
class Order:
    id: str
    prices: list[int]

class Checkout:
    def __init__(self, discount: Discount, payment: Payment) -> None:
        self.discount, self.payment = discount, payment

    def run(self, order: Order) -> tuple[int, str]:
        total = self.discount.apply(sum(order.prices))
        return total, self.payment.charge(order.id, total)`,
    test: `class VipDiscount:
    def apply(self, subtotal: int) -> int: return round(subtotal * 0.9)

class FakePayment:
    def charge(self, order_id: str, cents: int) -> str: return f"fake-{order_id}-{cents}"

assert Checkout(VipDiscount(), FakePayment()).run(Order("o1", [80, 20])) == (90, "fake-o1-90")`
  },
  'open-closed-principle-evolution': {
    stages: ['第三种优惠加入，if/elif 每次都要修改并重新回归', '优惠算法开始由不同团队交付，需要一个由结算方定义的稳定规则接口', '活动插件需要按名称启停，创建选择必须离开稳定计算流程'],
    before: `def total(subtotal: int, campaign: str) -> int:
    if campaign == "new_user": return subtotal - 20
    if campaign == "vip": return round(subtotal * 0.9)
    if campaign == "festival": return subtotal - 30
    return subtotal`,
    after: `from typing import Protocol

class DiscountRule(Protocol):
    def apply(self, subtotal: int) -> int: ...

class NewUser:
    def apply(self, subtotal: int) -> int: return max(0, subtotal - 20)

class Vip:
    def apply(self, subtotal: int) -> int: return round(subtotal * 0.9)

class DiscountRegistry:
    def __init__(self) -> None: self._rules: dict[str, DiscountRule] = {}
    def register(self, name: str, rule: DiscountRule) -> None: self._rules[name] = rule
    def total(self, name: str, subtotal: int) -> int: return self._rules[name].apply(subtotal)`,
    test: `registry = DiscountRegistry()
registry.register("new_user", NewUser())
registry.register("vip", Vip())
assert registry.total("new_user", 100) == 80
assert registry.total("vip", 100) == 90`
  },
  'dependency-inversion-di-contracts': {
    stages: ['下单用例直接创建生产支付和 SQL 审计，单元测试无法隔离', '测试环境需要注入内存实现，依赖必须在构造时显式出现', '第二家支付实现对金额和失败条件有不同限制，需要共同的行为契约', '审计调用方只写事件，不应被迫依赖查询、删除等无关能力'],
    before: `class PlaceOrder:
    def run(self, order_id: str, cents: int) -> str:
        sdk = VendorPaymentSdk("production-key")
        trade = sdk.pay(order_id, cents)
        SqlAudit().insert("paid", trade)
        return trade`,
    after: `from typing import Protocol

class Payment(Protocol):
    def charge(self, order_id: str, cents: int) -> str: ...

class Audit(Protocol):
    def append(self, event: str) -> None: ...

class PlaceOrder:
    def __init__(self, payment: Payment, audit: Audit) -> None:
        self.payment, self.audit = payment, audit

    def run(self, order_id: str, cents: int) -> str:
        if cents <= 0: raise ValueError("cents must be positive")
        trade = self.payment.charge(order_id, cents)
        self.audit.append(f"paid:{order_id}:{trade}")
        return trade`,
    test: `class FakePayment:
    def charge(self, order_id: str, cents: int) -> str: return "trade-1"

class MemoryAudit:
    def __init__(self) -> None: self.events: list[str] = []
    def append(self, event: str) -> None: self.events.append(event)

audit = MemoryAudit()
assert PlaceOrder(FakePayment(), audit).run("o1", 100) == "trade-1"
assert audit.events == ["paid:o1:trade-1"]`
  },
  'object-boundaries-demeter-composition': {
    stages: ['报价函数穿透 customer.profile.address 读取城市，依赖整棵对象图', '配送资格判断散落在调用方，应交回拥有订单数据的对象', '会员折扣与配送策略同时增长，继承会产生组合子类', '订单、策略和支付端口的所有权与生命周期需要明确'],
    before: `def quote(order) -> int:
    city = order.customer.profile.address.city
    level = order.customer.profile.membership.level
    shipping = 0 if city == "上海" else 12
    return int(sum(order.items) * (0.9 if level == "vip" else 1)) + shipping`,
    after: `from dataclasses import dataclass
from typing import Protocol

class Shipping(Protocol):
    def price(self, city: str) -> int: ...

class Discount(Protocol):
    def apply(self, subtotal: int) -> int: ...

@dataclass(frozen=True)
class Order:
    city: str
    prices: list[int]

    def quote(self, shipping: Shipping, discount: Discount) -> int:
        return discount.apply(sum(self.prices)) + shipping.price(self.city)`,
    test: `class LocalShipping:
    def price(self, city: str) -> int: return 0 if city == "上海" else 12
class Vip:
    def apply(self, subtotal: int) -> int: return round(subtotal * 0.9)

assert Order("上海", [100]).quote(LocalShipping(), Vip()) == 90
assert Order("北京", [100]).quote(LocalShipping(), Vip()) == 102`
  },
  'patterns-and-singleton-lifecycle': {
    stages: ['先用上下文、冲突、结构和后果描述配置目录问题，不急着选择模式', '配置加载昂贵且只需一次，开始比较立即创建与延迟创建', '模块被多处导入，唯一实例边界应由 Python 模块而非私有构造器表达', '注册表也要求唯一身份，但可变状态必须留在明确边界内', '延迟加载需要复用成熟缓存语义，避免手写锁', '业务对象仍显式接收 Catalog，单例只属于组合根的生命周期决策'],
    before: `catalog = None

def get_catalog():
    global catalog
    if catalog is None: catalog = load_from_disk()
    return catalog`,
    after: `from functools import lru_cache

class Catalog:
    def __init__(self, values: dict[str, str]) -> None: self.values = values
    def find(self, key: str) -> str | None: return self.values.get(key)

@lru_cache(maxsize=1)
def application_catalog() -> Catalog:
    return Catalog({"version": "1.0"})

class ShowVersion:
    def __init__(self, catalog: Catalog) -> None: self.catalog = catalog
    def run(self) -> str: return self.catalog.find("version") or "unknown"`,
    test: `assert application_catalog() is application_catalog()
assert ShowVersion(application_catalog()).run() == "1.0"
fake = Catalog({"version": "test"})
assert ShowVersion(fake).run() == "test"`
  },
  'simple-factory-method-registry': {
    stages: ['JSON 与 YAML 两种解析器出现，先把有限创建分支集中到一个入口', '不同导入任务开始拥有各自流程，创建决策需要跟随流程扩展', '第三方解析插件无法修改中央分支，改用启动时校验的显式注册表'],
    before: `def import_document(kind: str, text: str):
    if kind == "json": return JsonParser().parse(text)
    if kind == "yaml": return YamlParser().parse(text)
    raise ValueError(kind)`,
    after: `import json
from collections.abc import Callable
from typing import Protocol

class Parser(Protocol):
    def parse(self, text: str) -> dict[str, object]: ...

class JsonParser:
    def parse(self, text: str) -> dict[str, object]: return json.loads(text)

class ParserRegistry:
    def __init__(self) -> None: self._factories: dict[str, Callable[[], Parser]] = {}
    def register(self, kind: str, factory: Callable[[], Parser]) -> None: self._factories[kind] = factory
    def create(self, kind: str) -> Parser: return self._factories[kind]()

class ImportJob:
    def __init__(self, registry: ParserRegistry) -> None: self.registry = registry
    def run(self, kind: str, text: str) -> dict[str, object]: return self.registry.create(kind).parse(text)`,
    test: `registry = ParserRegistry()
registry.register("json", JsonParser)
job = ImportJob(registry)
assert job.run("json", '{"ok": true}') == {"ok": True}`
  },
  'abstract-factory-product-family': {
    stages: ['仓储与事务必须来自同一后端，单独创建会混搭产品', '组合根需要一次选择并装配整套存储实现', '切换数据库时还要同时替换方言、事务与仓储', '两套实现必须跑同一组保存、回滚和失败契约测试'],
    before: `def save_order(config, order):
    repository = PostgresOrderRepository(config.pg_url)
    transaction = SqliteTransaction(config.sqlite_file)
    transaction.begin()
    repository.save(order)
    transaction.commit()`,
    after: `from typing import Protocol

class Orders(Protocol):
    def save(self, order_id: str) -> None: ...
class Transaction(Protocol):
    def __enter__(self): return self
    def __exit__(self, *args): ...
class StorageFamily(Protocol):
    def orders(self) -> Orders: ...
    def transaction(self) -> Transaction: ...

def save_order(family: StorageFamily, order_id: str) -> None:
    with family.transaction(): family.orders().save(order_id)`,
    test: `class MemoryOrders:
    def __init__(self) -> None: self.values: list[str] = []
    def save(self, order_id: str) -> None: self.values.append(order_id)
class MemoryTx:
    def __enter__(self): return self
    def __exit__(self, *args): return None
class MemoryFamily:
    def __init__(self) -> None: self.repo = MemoryOrders()
    def orders(self): return self.repo
    def transaction(self): return MemoryTx()

family = MemoryFamily(); save_order(family, "o1")
assert family.repo.values == ["o1"]`
  },
  'prototype-copy-registry': {
    stages: ['每次创建工作流都重复解析相同固定模板，改为从基准实例复制', '浅拷贝让 steps 列表仍被多个副本共享，修改会污染原型', '模板进入命名注册表后，注册和读取两端都要防御性复制'],
    before: `templates = {"daily": {"title": "日报", "steps": ["collect", "render"]}}

first = templates["daily"]
second = templates["daily"]
first["steps"].append("email")
assert second["steps"] == ["collect", "render", "email"]  # 被意外污染`,
    after: `from copy import deepcopy
from dataclasses import dataclass

@dataclass
class Workflow:
    title: str
    steps: list[str]
    def clone(self) -> "Workflow": return deepcopy(self)

class PrototypeRegistry:
    def __init__(self) -> None: self._items: dict[str, Workflow] = {}
    def register(self, name: str, value: Workflow) -> None: self._items[name] = value.clone()
    def create(self, name: str) -> Workflow: return self._items[name].clone()`,
    test: `registry = PrototypeRegistry()
registry.register("daily", Workflow("日报", ["collect", "render"]))
first, second = registry.create("daily"), registry.create("daily")
first.steps.append("email")
assert second.steps == ["collect", "render"]`
  },
  'builder-object-invariants': {
    stages: ['请求构造函数出现大量位置参数和布尔开关，调用处无法表达意图', 'GET 带 body、负超时等非法组合必须在 build() 时统一阻止'],
    before: `request = Request("POST", url, None, 3, True, False, 5, {}, body)
# 第 4、5、6 个布尔参数分别是什么？body 与 method 是否兼容？`,
    after: `from dataclasses import dataclass

@dataclass(frozen=True)
class Request:
    method: str
    url: str
    timeout: float
    body: bytes | None

class RequestBuilder:
    def __init__(self, method: str, url: str) -> None:
        self.method, self.url, self.timeout, self.body = method, url, 3.0, None
    def with_timeout(self, seconds: float): self.timeout = seconds; return self
    def with_json(self, text: str): self.body = text.encode(); return self
    def build(self) -> Request:
        if self.method == "GET" and self.body is not None: raise ValueError("GET cannot have body")
        if self.timeout <= 0: raise ValueError("timeout must be positive")
        return Request(self.method, self.url, self.timeout, self.body)`,
    test: `request = RequestBuilder("POST", "/orders").with_timeout(5).with_json("{}").build()
assert request.timeout == 5 and request.body == b"{}"
try: RequestBuilder("GET", "/orders").with_json("{}").build()
except ValueError: pass
else: raise AssertionError("invalid request escaped builder")`
  },
  'adapter-anticorruption-layer': {
    stages: ['旧网关使用元、供应商字段和数字错误码，业务只想按分收费', '第二个调用方出现后，金额、回执与失败语义都必须在适配边界统一'],
    before: `result = legacy.pay(ref=order.id, amount_yuan=order.cents / 100)
if result["code"] == "0000": return result["trade_no"]
if result["code"] == "1003": raise Exception("余额不足")`,
    after: `from dataclasses import dataclass

@dataclass(frozen=True)
class Receipt:
    trade_id: str
    paid_cents: int

class LegacyGatewayAdapter:
    def __init__(self, sdk) -> None: self.sdk = sdk
    def charge(self, order_id: str, cents: int) -> Receipt:
        raw = self.sdk.pay(ref=order_id, amount_yuan=cents / 100)
        if raw["code"] != "0000": raise RuntimeError(f"payment rejected:{raw['code']}")
        return Receipt(raw["trade_no"], cents)`,
    test: `class FakeLegacy:
    def pay(self, **kwargs): return {"code": "0000", "trade_no": "t1"}

receipt = LegacyGatewayAdapter(FakeLegacy()).charge("o1", 1999)
assert receipt == Receipt("t1", 1999)`
  },
  'decorator-middleware-pipeline': {
    stages: ['重试、指标和缓存写在一个函数中，任意组合都要复制控制流', '指标包在重试内外含义不同，需要显式组合顺序并用调用次数验证'],
    before: `def fetch(url):
    start_metric("fetch")
    try:
        for _ in range(3):
            try: return cache.get(url) or http.get(url)
            except TimeoutError: pass
    finally: stop_metric("fetch")`,
    after: `from typing import Protocol

class Client(Protocol):
    def get(self, url: str) -> str: ...
class Retry:
    def __init__(self, inner: Client, attempts: int = 3) -> None: self.inner, self.attempts = inner, attempts
    def get(self, url: str) -> str:
        for attempt in range(self.attempts):
            try: return self.inner.get(url)
            except TimeoutError:
                if attempt + 1 == self.attempts: raise
class Metrics:
    def __init__(self, inner: Client, events: list[str]) -> None: self.inner, self.events = inner, events
    def get(self, url: str) -> str:
        self.events.append("start")
        try: return self.inner.get(url)
        finally: self.events.append("stop")`,
    test: `class Flaky:
    def __init__(self) -> None: self.calls = 0
    def get(self, url: str) -> str:
        self.calls += 1
        if self.calls < 2: raise TimeoutError()
        return "ok"
events: list[str] = []; flaky = Flaky()
assert Metrics(Retry(flaky), events).get("/") == "ok"
assert flaky.calls == 2 and events == ["start", "stop"]`
  },
  'proxy-access-facade': {
    stages: ['发布服务需要先控制谁能访问真实发布能力', '重复发布需要在同一访问入口加入缓存而不改变结果', '转码、封面、存储和通知应由外观提供一个稳定用例入口'],
    before: `def publish(user, source):
    if not user.is_admin: raise PermissionError()
    video = Transcoder().encode(source)
    cover = Thumbnailer().create(video)
    url = Storage().upload(video, cover)
    Notification().send(url)
    return url`,
    after: `from typing import Protocol

class Publisher(Protocol):
    def publish(self, source: str) -> str: ...
class PublishingFacade:
    def publish(self, source: str) -> str: return f"https://cdn/{source}.mp4"
class ProtectedPublisher:
    def __init__(self, inner: Publisher, allowed: set[str]) -> None: self.inner, self.allowed = inner, allowed
    def publish_as(self, user: str, source: str) -> str:
        if user not in self.allowed: raise PermissionError(user)
        return self.inner.publish(source)`,
    test: `publisher = ProtectedPublisher(PublishingFacade(), {"alice"})
assert publisher.publish_as("alice", "demo") == "https://cdn/demo.mp4"
try: publisher.publish_as("bob", "demo")
except PermissionError: pass
else: raise AssertionError("proxy did not protect facade")`
  },
  'bridge-independent-dimensions': {
    stages: ['报表格式与存储目标形成 PdfToS3、CsvToEmail 等组合子类', '格式和存储各自继续增加，改为两个可独立扩展并在运行时组合的维度'],
    before: `class PdfToS3Report: ...
class PdfToEmailReport: ...
class CsvToS3Report: ...
class CsvToEmailReport: ...
# 每新增一种格式或目标，都要继续增加组合子类。`,
    after: `from typing import Protocol

class Storage(Protocol):
    def put(self, name: str, data: bytes) -> str: ...
class Report:
    def __init__(self, storage: Storage) -> None: self.storage = storage
    def render(self, rows: list[str]) -> bytes: raise NotImplementedError
    def save(self, name: str, rows: list[str]) -> str: return self.storage.put(name, self.render(rows))
class CsvReport(Report):
    def render(self, rows: list[str]) -> bytes: return ",".join(rows).encode()
class MemoryStorage:
    def __init__(self) -> None: self.files: dict[str, bytes] = {}
    def put(self, name: str, data: bytes) -> str: self.files[name] = data; return name`,
    test: `storage = MemoryStorage()
assert CsvReport(storage).save("sales.csv", ["a", "b"]) == "sales.csv"
assert storage.files["sales.csv"] == b"a,b"`
  },
  'composite-recursive-tree': {
    stages: ['调用方为用户、用户组和组织节点分别写类型分支', '权限树继续嵌套后，叶子和容器需要共享 allows() 递归协议'],
    before: `def allows(node, action):
    if node["type"] == "user": return action in node["permissions"]
    if node["type"] == "group": return any(allows(child, action) for child in node["children"])
    if node["type"] == "org": return any(allows(child, action) for child in node["members"])
    return False`,
    after: `from typing import Protocol

class PermissionNode(Protocol):
    def allows(self, action: str) -> bool: ...
class User:
    def __init__(self, permissions: set[str]) -> None: self.permissions = permissions
    def allows(self, action: str) -> bool: return action in self.permissions
class Group:
    def __init__(self, children: list[PermissionNode]) -> None: self.children = children
    def allows(self, action: str) -> bool: return any(child.allows(action) for child in self.children)`,
    test: `tree = Group([User({"read"}), Group([User({"write"})])])
assert tree.allows("read")
assert tree.allows("write")
assert not tree.allows("delete")`
  },
  'flyweight-state-memory': {
    stages: ['百万瓦片各自保存同一纹理和通行规则，内存被重复状态占满', '把坐标留在瓦片，把不可变类型放入按键缓存，并用对象身份测量共享结果'],
    before: `tiles = [
    {"x": x, "y": y, "texture": load_texture("grass.png"), "walkable": True}
    for x in range(1000) for y in range(1000)
]
# 同一份纹理和规则被放进一百万个对象。`,
    after: `from dataclasses import dataclass

@dataclass(frozen=True)
class TileType:
    texture: str
    walkable: bool
@dataclass(frozen=True)
class Tile:
    x: int
    y: int
    kind: TileType
class TileTypes:
    def __init__(self) -> None: self._cache: dict[tuple[str, bool], TileType] = {}
    def get(self, texture: str, walkable: bool) -> TileType:
        key = (texture, walkable)
        return self._cache.setdefault(key, TileType(*key))`,
    test: `types = TileTypes()
tiles = [Tile(x, 0, types.get("grass.png", True)) for x in range(1000)]
assert len({id(tile.kind) for tile in tiles}) == 1
assert tiles[0].x != tiles[-1].x`
  }
}

export function getChapterSample(slug) {
  const sample = samples[slug]
  if (!sample) throw new Error(`Missing chapter sample: ${slug}`)
  return sample
}

export function getChapterProgram(slug) {
  const sample = getChapterSample(slug)
  return `from __future__ import annotations\n\n${sample.after}\n\n${sample.test}\n`
}
