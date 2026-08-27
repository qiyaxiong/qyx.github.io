/**
 * Short, dependency-free Python 3 examples for the 46 programming-thoughts lessons.
 *
 * The examples intentionally show the smallest useful collaboration boundary. They
 * are teaching snippets, not production-ready infrastructure.
 */
const samples = {
  1: `from typing import Protocol

class Notifier(Protocol):
    def send(self, message: str) -> None: ...

class ConsoleNotifier:
    def send(self, message: str) -> None:
        print(message)

class WelcomeUser:
    def __init__(self, notifier: Notifier) -> None:
        self.notifier = notifier

    def run(self, name: str) -> None:
        self.notifier.send(f"欢迎 {name}")

WelcomeUser(ConsoleNotifier()).run("小明")`,
  2: `from dataclasses import dataclass
from typing import Protocol

@dataclass(frozen=True)
class LineItem:
    name: str
    price: int

class DiscountPolicy(Protocol):
    def apply(self, subtotal: int) -> int: ...

class VipDiscount:
    def apply(self, subtotal: int) -> int:
        return round(subtotal * 0.9)

def total(items: list[LineItem], policy: DiscountPolicy) -> int:
    return policy.apply(sum(item.price for item in items))

print(total([LineItem("书", 100)], VipDiscount()))`,
  3: `from typing import Protocol

class PaymentPort(Protocol):
    def charge(self, order_id: str, cents: int) -> str: ...

class VendorSdk:
    def pay(self, *, ref: str, amount: int) -> dict[str, str]:
        return {"trade_no": f"vendor-{ref}", "status": "paid"}

class VendorAdapter:
    def __init__(self, sdk: VendorSdk) -> None:
        self.sdk = sdk

    def charge(self, order_id: str, cents: int) -> str:
        result = self.sdk.pay(ref=order_id, amount=cents)
        return result["trade_no"]

receipt: PaymentPort = VendorAdapter(VendorSdk())
print(receipt.charge("order-1", 1999))`,
  4: `from dataclasses import dataclass

@dataclass(frozen=True)
class Report:
    rows: list[dict[str, str]]

def load_report() -> Report:
    return Report([{"name": "Ada", "score": "100"}])

def render_markdown(report: Report) -> str:
    return "\\n".join(f"- {row['name']}: {row['score']}" for row in report.rows)

def save_file(text: str, path: str) -> None:
    print(f"保存到 {path}:\\n{text}")

def publish_report() -> None:
    save_file(render_markdown(load_report()), "report.md")

publish_report()`,
  5: `from typing import Protocol

class DiscountRule(Protocol):
    def apply(self, subtotal: int) -> int: ...

class NewUserDiscount:
    def apply(self, subtotal: int) -> int:
        return subtotal - 20

class Checkout:
    def __init__(self, rules: list[DiscountRule]) -> None:
        self.rules = rules

    def total(self, subtotal: int) -> int:
        for rule in self.rules:
            subtotal = rule.apply(subtotal)
        return subtotal

print(Checkout([NewUserDiscount()]).total(100))`,
  6: `from typing import Protocol

class Exporter(Protocol):
    def export(self, rows: list[dict[str, str]]) -> str: ...

class CsvExporter:
    def export(self, rows: list[dict[str, str]]) -> str:
        return "\\n".join(",".join(row.values()) for row in rows)

def download(rows: list[dict[str, str]], exporter: Exporter) -> str:
    return exporter.export(rows)

rows = [{"name": "Ada", "score": "100"}]
print(download(rows, CsvExporter()))`,
  7: `from collections.abc import Callable

def email(message: str) -> None:
    print(f"邮件：{message}")

def sms(message: str) -> None:
    print(f"短信：{message}")

channels: dict[str, Callable[[str], None]] = {"email": email, "sms": sms}

def notify(kind: str, message: str) -> None:
    try:
        channels[kind](message)
    except KeyError as exc:
        raise ValueError(f"未知渠道：{kind}") from exc

notify("email", "订单已发货")`,
  8: `from typing import Protocol

class AuditLog(Protocol):
    def append(self, event: str) -> None: ...

class MemoryAudit:
    def __init__(self) -> None:
        self.events: list[str] = []

    def append(self, event: str) -> None:
        self.events.append(event)

class PlaceOrder:
    def __init__(self, audit: AuditLog) -> None:
        self.audit = audit

    def run(self, order_id: str) -> None:
        self.audit.append(f"order.created:{order_id}")

PlaceOrder(MemoryAudit()).run("order-1")`,
  9: `class InMemoryCatalog:
    def find(self, sku: str) -> int:
        return {"book": 100}.get(sku, 0)

class CheckoutService:
    def __init__(self, catalog: InMemoryCatalog) -> None:
        self.catalog = catalog

    def total(self, sku: str, quantity: int) -> int:
        return self.catalog.find(sku) * quantity

def create_application() -> CheckoutService:
    return CheckoutService(InMemoryCatalog())

app = create_application()
assert app.total("book", 2) == 200`,
  10: `from typing import Optional, Protocol

class Reader(Protocol):
    def read(self, key: str) -> Optional[str]: ...

class MemoryReader:
    def __init__(self, values: dict[str, str]) -> None:
        self.values = values

    def read(self, key: str) -> Optional[str]:
        return self.values.get(key)

def show_profile(reader: Reader) -> str:
    return reader.read("profile") or "暂无资料"

print(show_profile(MemoryReader({"profile": "Ada"})))`,
  11: `from typing import Protocol

class Reader(Protocol):
    def read(self, name: str) -> str: ...

class Writer(Protocol):
    def write(self, name: str, text: str) -> None: ...

class ReadOnlyNotes:
    def read(self, name: str) -> str:
        return f"读取 {name}"

def preview(reader: Reader) -> None:
    print(reader.read("README.md"))

preview(ReadOnlyNotes())`,
  12: `from dataclasses import dataclass

@dataclass(frozen=True)
class Address:
    city: str

class Order:
    def __init__(self, address: Address) -> None:
        self._address = address

    def ships_to(self, city: str) -> bool:
        return self._address.city == city

order = Order(Address("上海"))
assert order.ships_to("上海")`,
  13: `from dataclasses import dataclass

@dataclass(frozen=True)
class DeliveryZone:
    cities: set[str]

class Order:
    def __init__(self, city: str, has_hazardous_goods: bool = False) -> None:
        self.city = city
        self.has_hazardous_goods = has_hazardous_goods

    def can_use_same_day_delivery(self, zone: DeliveryZone) -> bool:
        return self.city in zone.cities and not self.has_hazardous_goods

order = Order("上海")
if order.can_use_same_day_delivery(DeliveryZone({"上海"})):
    print("安排当天配送")`,
  14: `from typing import Protocol

class DiscountPolicy(Protocol):
    def apply(self, price: int) -> int: ...

class ShippingPolicy(Protocol):
    def price(self, distance: int) -> int: ...

class OrderTotal:
    def __init__(self, shipping: ShippingPolicy, discount: DiscountPolicy) -> None:
        self.shipping = shipping
        self.discount = discount

    def total(self, distance: int, goods: int) -> int:
        return self.discount.apply(goods + self.shipping.price(distance))`,
  15: `from dataclasses import dataclass
from typing import Protocol

class PaymentPort(Protocol):
    def charge(self, cents: int) -> str: ...

@dataclass
class Order:
    customer_name: str
    items: list[int]

    def total(self) -> int:
        return sum(self.items)

def pay(order: Order, gateway: PaymentPort) -> str:
    return gateway.charge(order.total())`,
  16: `from dataclasses import dataclass

@dataclass(frozen=True)
class DesignDecision:
    context: str
    conflict: str
    structure: str
    consequence: str

decision = DesignDecision(
    "通知渠道会增加",
    "稳定流程不应了解每个 SDK",
    "Notifier 协议 + 多个实现",
    "新增渠道只增加实现",
)
print(decision.structure)`,
  17: `from functools import lru_cache

class Config:
    def __init__(self, env: str) -> None:
        self.env = env

@lru_cache(maxsize=1)
def config() -> Config:
    return Config("production")

first = config()
second = config()
assert first is second
print(first.env)`,
  18: `class Config:
    def __init__(self, env: str) -> None:
        self.env = env

_shared = Config("production")

def config() -> Config:
    return _shared

# Python 模块本身就是自然的单例边界；不需要用反射绕过私有构造器。
assert config() is config()`,
  19: `from enum import Enum

class Registry(Enum):
    INSTANCE = "instance"

    def __init__(self, _: str) -> None:
        self.handlers: dict[str, str] = {}

    def register(self, name: str, handler: str) -> None:
        self.handlers[name] = handler

Registry.INSTANCE.register("welcome", "WelcomeHandler")
print(Registry.INSTANCE.handlers)`,
  20: `from functools import lru_cache

class MetadataCatalog:
    def __init__(self) -> None:
        self.values = {"version": "1.0"}

@lru_cache(maxsize=1)
def catalog() -> MetadataCatalog:
    return MetadataCatalog()

print(catalog().values["version"])
# 第一次调用才创建，缓存装饰器也让线程间的语义更清晰。`,
  21: `class Catalog:
    def find(self, sku: str) -> int:
        return {"book": 100}.get(sku, 0)

class CheckoutService:
    def __init__(self, catalog: Catalog) -> None:
        self.catalog = catalog

    def total(self, sku: str, count: int) -> int:
        return self.catalog.find(sku) * count

# 组合根决定共享范围；业务对象仍然显式接收依赖。
service = CheckoutService(Catalog())
assert service.total("book", 2) == 200`,
  22: `from typing import Union

class JsonParser:
    def parse(self, text: str) -> dict[str, object]:
        import json
        return json.loads(text)

class YamlLikeParser:
    def parse(self, text: str) -> dict[str, object]:
        return {line.split(":", 1)[0]: line.split(":", 1)[1].strip()
                for line in text.splitlines() if ":" in line}

def create_parser(kind: str) -> Union[JsonParser, YamlLikeParser]:
    factories = {"json": JsonParser, "yaml": YamlLikeParser}
    try:
        return factories[kind]()
    except KeyError as exc:
        raise ValueError(f"未知格式：{kind}") from exc

print(create_parser("json").parse('{"ok": true}'))`,
  23: `from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, message: str) -> None: ...

class EmailNotifier(Notifier):
    def send(self, message: str) -> None:
        print(f"邮件：{message}")

class NotificationJob(ABC):
    @abstractmethod
    def create_notifier(self) -> Notifier: ...

    def run(self, message: str) -> None:
        self.create_notifier().send(message)

class EmailJob(NotificationJob):
    def create_notifier(self) -> Notifier:
        return EmailNotifier()

EmailJob().run("欢迎")`,
  24: `from collections.abc import Callable

handlers: dict[str, Callable[[], str]] = {}

def register(name: str, factory: Callable[[], str]) -> None:
    if name in handlers:
        raise ValueError(f"重复注册：{name}")
    handlers[name] = factory

register("welcome", lambda: "WelcomeHandler")
print(handlers["welcome"]())`,
  25: `from typing import Protocol

class Button(Protocol):
    def draw(self) -> str: ...

class LightButton:
    def draw(self) -> str:
        return "浅色按钮"

class LightFactory:
    def button(self) -> Button:
        return LightButton()

def render(factory: LightFactory) -> None:
    print(factory.button().draw())

render(LightFactory())`,
  26: `from dataclasses import dataclass

@dataclass(frozen=True)
class Theme:
    name: str
    button: str
    dialog: str

def choose_theme(name: str) -> Theme:
    themes = {
        "light": Theme("浅色", "白底按钮", "白底对话框"),
        "dark": Theme("深色", "黑底按钮", "黑底对话框"),
    }
    return themes[name]

theme = choose_theme("dark")
print(theme.button, theme.dialog)`,
  27: `from typing import Protocol

class Repository(Protocol):
    def save(self, value: str) -> None: ...

class MemoryRepository:
    def __init__(self) -> None:
        self.values: list[str] = []

    def save(self, value: str) -> None:
        self.values.append(value)

class PersistenceFactory(Protocol):
    def orders(self) -> Repository: ...

class MemoryPersistenceFactory:
    def orders(self) -> Repository:
        return MemoryRepository()

factory: PersistenceFactory = MemoryPersistenceFactory()
factory.orders().save("order-1")`,
  28: `def repository_contract(factory: object) -> None:
    repository = factory.orders()  # type: ignore[attr-defined]
    repository.save("order-1")
    assert repository.values == ["order-1"]

class MemoryFactory:
    def orders(self):
        return MemoryRepository()

class MemoryRepository:
    def __init__(self) -> None:
        self.values: list[str] = []

    def save(self, value: str) -> None:
        self.values.append(value)

repository_contract(MemoryFactory())
print("契约通过")`,
  29: `from copy import copy
from dataclasses import dataclass

@dataclass
class ReportTemplate:
    title: str
    sections: list[str]

    def clone(self) -> "ReportTemplate":
        return copy(self)

weekly = ReportTemplate("周报", ["摘要", "指标"])
draft = weekly.clone()
draft.title = "团队周报"
print(weekly.title, draft.title)`,
  30: `from copy import deepcopy

template = {"name": "工作流", "steps": [{"name": "检查", "inputs": {}}]}
safe_copy = deepcopy(template)
safe_copy["steps"][0]["inputs"]["owner"] = "Ada"

assert "owner" not in template["steps"][0]["inputs"]
print(safe_copy)`,
  31: `from copy import deepcopy

class PrototypeRegistry:
    def __init__(self) -> None:
        self._templates: dict[str, dict[str, object]] = {}

    def register(self, name: str, value: dict[str, object]) -> None:
        self._templates[name] = deepcopy(value)

    def create(self, name: str) -> dict[str, object]:
        return deepcopy(self._templates[name])

registry = PrototypeRegistry()
registry.register("welcome", {"title": "欢迎", "color": "blue"})
card = registry.create("welcome")
card["title"] = "你好"
print(card, registry.create("welcome"))`,
  32: `from dataclasses import dataclass, field

@dataclass(frozen=True)
class HttpRequest:
    url: str
    method: str
    headers: dict[str, str] = field(default_factory=dict)
    body: str = ""

class RequestBuilder:
    def __init__(self, url: str) -> None:
        self._request = HttpRequest(url, "GET")

    def post_json(self, body: str) -> "RequestBuilder":
        self._request = HttpRequest(self._request.url, "POST", {"content-type": "json"}, body)
        return self

    def build(self) -> HttpRequest:
        return self._request

print(RequestBuilder("/reports").post_json("{}").build())`,
  33: `from dataclasses import dataclass

@dataclass(frozen=True)
class EmailMessage:
    to: tuple[str, ...]
    subject: str
    body: str

class EmailBuilder:
    def __init__(self) -> None:
        self.to: list[str] = []
        self.subject = ""
        self.body = ""

    def build(self) -> EmailMessage:
        if not self.to or not self.subject.strip():
            raise ValueError("收件人和主题不能为空")
        return EmailMessage(tuple(self.to), self.subject, self.body)

message = EmailBuilder()
message.to.append("ada@example.com")
message.subject = "报告"
print(message.build())`,
  34: `from typing import Protocol

class PaymentPort(Protocol):
    def charge(self, cents: int) -> str: ...

class LegacyGateway:
    def make_pay(self, yuan: float) -> dict[str, str]:
        return {"trade_no": "legacy-1", "code": "OK"}

class LegacyGatewayAdapter:
    def __init__(self, legacy: LegacyGateway) -> None:
        self.legacy = legacy

    def charge(self, cents: int) -> str:
        result = self.legacy.make_pay(cents / 100)
        if result["code"] != "OK":
            raise RuntimeError("支付失败")
        return result["trade_no"]

payment: PaymentPort = LegacyGatewayAdapter(LegacyGateway())
print(payment.charge(1999))`,
  35: `from dataclasses import dataclass

@dataclass(frozen=True)
class Weather:
    city: str
    celsius: float

class WeatherAdapter:
    def __init__(self, client: object) -> None:
        self.client = client

    def current(self, city: str) -> Weather:
        dto = self.client.fetch(city)  # type: ignore[attr-defined]
        if dto.get("temp_f") is None:
            raise RuntimeError(f"{city} 暂无天气")
        return Weather(city, (dto["temp_f"] - 32) * 5 / 9)

class FakeClient:
    def fetch(self, city: str) -> dict[str, float]:
        return {"temp_f": 68}

print(WeatherAdapter(FakeClient()).current("上海"))`,
  36: `from typing import Protocol

class Sender(Protocol):
    def send(self, message: str) -> None: ...

class ConsoleSender:
    def send(self, message: str) -> None:
        print(message)

class RetryingSender:
    def __init__(self, inner: Sender, attempts: int = 3) -> None:
        self.inner, self.attempts = inner, attempts

    def send(self, message: str) -> None:
        for _ in range(self.attempts):
            self.inner.send(message)
            return

sender: Sender = RetryingSender(ConsoleSender())
sender.send("已发送")`,
  37: `class BaseRequest:
    def send(self, url: str) -> str:
        return f"GET {url}"

class RetryRequest:
    def __init__(self, inner: BaseRequest, attempts: int = 3) -> None:
        self.inner, self.attempts = inner, attempts

    def send(self, url: str) -> str:
        for _ in range(self.attempts):
            return self.inner.send(url)
        raise RuntimeError("重试失败")

class MetricsRequest:
    def __init__(self, inner: RetryRequest) -> None:
        self.inner = inner

    def send(self, url: str) -> str:
        result = self.inner.send(url)
        print("只记录一次业务调用")
        return result

client = MetricsRequest(RetryRequest(BaseRequest()))
print(client.send("/health"))`,
  38: `class RealImage:
    def __init__(self, url: str) -> None:
        print(f"加载大图：{url}")
        self.url = url

    def render(self) -> None:
        print(f"显示：{self.url}")

class LazyImage:
    def __init__(self, url: str) -> None:
        self.url, self._real = url, None

    def render(self) -> None:
        if self._real is None:
            self._real = RealImage(self.url)
        self._real.render()

image = LazyImage("cover.png")
image.render()`,
  39: `class DocumentService:
    def read(self, user: str, document_id: str) -> str:
        return f"文档 {document_id} 内容"

class ProtectedDocuments:
    def __init__(self, real: DocumentService, allowed: set[str]) -> None:
        self.real, self.allowed = real, allowed

    def read(self, user: str, document_id: str) -> str:
        if user not in self.allowed:
            raise PermissionError("没有权限")
        return self.real.read(user, document_id)

print(ProtectedDocuments(DocumentService(), {"ada"}).read("ada", "doc-1"))`,
  40: `class VideoPublisher:
    def transcode(self, source: str) -> str: return f"{source}.mp4"
    def cover(self, video: str) -> str: return f"{video}.jpg"
    def upload(self, video: str, cover: str) -> str: return f"https://cdn/{video}"
    def announce(self, url: str) -> None: print(f"通知：{url}")

class PublishFacade:
    def __init__(self, publisher: VideoPublisher) -> None:
        self.publisher = publisher

    def publish(self, source: str) -> str:
        video = self.publisher.transcode(source)
        url = self.publisher.upload(video, self.publisher.cover(video))
        self.publisher.announce(url)
        return url

print(PublishFacade(VideoPublisher()).publish("lesson.mov"))`,
  41: `from typing import Protocol

class Channel(Protocol):
    def deliver(self, message: str) -> None: ...

class ConsoleChannel:
    def deliver(self, message: str) -> None:
        print(message)

class Notification:
    def __init__(self, channel: Channel) -> None:
        self.channel = channel

class UrgentNotification(Notification):
    def send(self, message: str) -> None:
        self.channel.deliver(f"[紧急] {message}")

UrgentNotification(ConsoleChannel()).send("服务器告警")`,
  42: `from typing import Protocol

class Storage(Protocol):
    def put(self, text: str) -> None: ...

class LocalStorage:
    def put(self, text: str) -> None:
        print(f"写入本地：{text}")

class Report:
    def __init__(self, storage: Storage) -> None:
        self.storage = storage

    def save(self, rows: list[str]) -> None:
        self.storage.put("\\n".join(rows))

Report(LocalStorage()).save(["标题", "数据"])`,
  43: `from dataclasses import dataclass, field
from typing import Protocol

class Node(Protocol):
    def size(self) -> int: ...

@dataclass
class File(Node):
    bytes: int
    def size(self) -> int: return self.bytes

@dataclass
class Folder(Node):
    children: list[Node] = field(default_factory=list)
    def size(self) -> int: return sum(child.size() for child in self.children)

home = Folder([File(10), Folder([File(5)])])
print(home.size())`,
  44: `from typing import Protocol

class PermissionNode(Protocol):
    def allows(self, action: str) -> bool: ...

class Permission:
    def __init__(self, actions: set[str]) -> None:
        self.actions = actions

    def allows(self, action: str) -> bool:
        return action in self.actions

class PermissionGroup:
    def __init__(self, children: list[PermissionNode]) -> None:
        self.children = children

    def allows(self, action: str) -> bool:
        return any(child.allows(action) for child in self.children)

tree = PermissionGroup([Permission({"read"}), Permission({"publish"})])
assert tree.allows("publish")`,
  45: `from dataclasses import dataclass

@dataclass(frozen=True)
class TextStyle:
    font: str
    size: int
    color: str

class StylePool:
    def __init__(self) -> None:
        self._styles: dict[tuple[str, int, str], TextStyle] = {}

    def get(self, font: str, size: int, color: str) -> TextStyle:
        key = (font, size, color)
        self._styles.setdefault(key, TextStyle(*key))
        return self._styles[key]

pool = StylePool()
print(pool.get("sans", 14, "black") is pool.get("sans", 14, "black"))`,
  46: `from dataclasses import dataclass

@dataclass(frozen=True)
class TileType:
    name: str
    texture: str

class TileTypePool:
    def __init__(self) -> None:
        self._cache: dict[str, TileType] = {}

    def get(self, name: str) -> TileType:
        if name not in self._cache:
            self._cache[name] = TileType(name, f"{name}.png")
        return self._cache[name]

@dataclass(frozen=True)
class Tile:
    x: int
    y: int
    kind: TileType

pool = TileTypePool()
tile = Tile(12, 8, pool.get("forest"))
print(tile, pool.get("forest") is tile.kind)`,
}

export function buildPythonCodeSample(page) {
  return samples[page] ?? `class Boundary:\n    def execute(self, value: str) -> str:\n        return value\n\nprint(Boundary().execute("${String(page)}"))`
}
