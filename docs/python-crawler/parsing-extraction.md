---
title: HTML 解析与数据提取
icon: code
order: 4
category:
  - Python 爬虫
tag:
  - Beautiful Soup
  - CSS Selector
  - XPath
  - lxml
---

# HTML 解析与数据提取

解析器的职责，是把一份已获取的响应转换成满足 Schema 的数据。它不应访问网络、写数据库或依赖全局状态。

## 先定位真实数据源

按下面顺序检查，越靠前通常越稳定：

1. 官方 API、开放数据或导出功能。
2. 页面调用的、允许使用的 JSON 接口。
3. HTML 中的语义结构、JSON-LD 或表格。
4. JavaScript 初始化状态。
5. 浏览器渲染后的 DOM。

不要为了练习浏览器自动化，而忽略已经存在的结构化数据源。

## Beautiful Soup

```python
from bs4 import BeautifulSoup

html = """
<article class="product" data-id="42">
  <h2><a href="/products/42">机械键盘</a></h2>
  <span class="price">¥ 399.00</span>
  <ul class="tags"><li>外设</li><li>键盘</li></ul>
</article>
"""

soup = BeautifulSoup(html, "html.parser")
product = soup.select_one("article.product")

if product is not None:
    name_node = product.select_one("h2 a")
    price_node = product.select_one(".price")
    tags = [node.get_text(" ", strip=True) for node in product.select(".tags li")]

    row = {
        "id": product.get("data-id"),
        "name": name_node.get_text(" ", strip=True) if name_node else None,
        "href": name_node.get("href") if name_node else None,
        "price_text": price_node.get_text(" ", strip=True) if price_node else None,
        "tags": tags,
    }
```

Beautiful Soup 的 `select()` 与 `select_one()` 支持 CSS 选择器，具体能力由 Soup Sieve 提供，参见[官方文档](https://www.crummy.com/software/BeautifulSoup/bs4/doc/#css-selectors)。

## CSS 选择器速查

| 选择器                 | 含义                            |
| ---------------------- | ------------------------------- |
| `article.product`      | class 包含 `product` 的 article |
| `#main`                | id 为 main 的元素               |
| `a[href]`              | 具有 href 属性的链接            |
| `a[href^="/product/"]` | href 以指定值开头               |
| `.card > h2`           | card 的直接子元素 h2            |
| `.card h2`             | card 内任意层级的 h2            |
| `li:nth-of-type(2)`    | 同类兄弟中的第二个 li           |

优先选择语义稳定的标识，例如 `article`、`itemprop`、`data-*` 或业务类名；避免复制开发者工具生成的超长 `nth-child` 路径。

## XPath 与 lxml

XPath 适合复杂树关系、属性条件和文本节点：

```python
from lxml import html

document = html.fromstring("<ul><li data-id='1'> A </li><li data-id='2'>B</li></ul>")

rows = [
    {
        "id": node.get("data-id"),
        "text": " ".join(node.text_content().split()),
    }
    for node in document.xpath("//ul/li[@data-id]")
]
```

常用 XPath：

```text
//article                     任意位置的 article
//a[@href]                    有 href 属性的链接
//div[contains(@class,'card')] class 包含 card 的 div
//h2/following-sibling::p[1]  h2 后第一个同级 p
string(//title)               取 title 的字符串值
```

当 class 中有多个词时，简单 `contains(@class, 'card')` 可能误匹配 `postcard`；更严格的写法是按空格归一化后判断完整类名。

## 安全地读取可选字段

页面并不总是完整，解析器要明确必填和可选字段：

```python
from bs4 import Tag


def text_or_none(parent: Tag, selector: str) -> str | None:
    node = parent.select_one(selector)
    if node is None:
        return None
    value = node.get_text(" ", strip=True)
    return value or None


def required_text(parent: Tag, selector: str) -> str:
    value = text_or_none(parent, selector)
    if value is None:
        raise ValueError(f"缺少必填字段: {selector}")
    return value
```

不要用一个宽泛的 `except Exception: pass` 吞掉所有问题。应统计“缺少价格”“日期格式改变”等具体错误，否则页面变化会悄悄污染数据。

## URL 规范化

```python
from urllib.parse import parse_qsl, urlencode, urljoin, urlsplit, urlunsplit

TRACKING_KEYS = {"utm_source", "utm_medium", "utm_campaign"}


def normalize_url(page_url: str, href: str) -> str:
    absolute = urljoin(page_url, href)
    parts = urlsplit(absolute)
    query = [
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if key not in TRACKING_KEYS
    ]
    return urlunsplit(
        (
            parts.scheme.lower(),
            parts.netloc.lower(),
            parts.path,
            urlencode(sorted(query)),
            "",  # fragment 不参与 HTTP 获取
        )
    )
```

规范化规则必须按业务定义。某些查询参数看似跟踪参数，实际可能影响内容或权限，不能随意删除。

## 提取 JSON-LD

很多内容页用 `application/ld+json` 提供结构化信息：

```python
import json

from bs4 import BeautifulSoup


def extract_json_ld(html_text: str) -> list[dict]:
    soup = BeautifulSoup(html_text, "html.parser")
    values: list[dict] = []

    for node in soup.select('script[type="application/ld+json"]'):
        try:
            data = json.loads(node.get_text())
        except (json.JSONDecodeError, TypeError):
            continue

        if isinstance(data, dict):
            values.append(data)
        elif isinstance(data, list):
            values.extend(item for item in data if isinstance(item, dict))

    return values
```

JSON-LD 仍是不可信输入，需要校验类型、长度和字段；它也可能与页面可见内容不一致。

## 数据清洗

解析与清洗最好分层：

```python
from decimal import Decimal, InvalidOperation
import re


def parse_price(raw: str | None) -> Decimal | None:
    if raw is None:
        return None
    normalized = re.sub(r"[^0-9.,-]", "", raw).replace(",", "")
    try:
        return Decimal(normalized)
    except InvalidOperation as error:
        raise ValueError(f"无法解析价格: {raw!r}") from error
```

金额用 `Decimal`，时间保存时区，枚举值做映射，文本只做业务需要的空白归一化。不要过早删除原始字段；保留原始值有助于审计和重新解析。

## 不要用正则解析完整 HTML

正则适合从已定位的小段文本中提取编号、价格或日期，不适合处理嵌套标签、属性顺序、转义和错误 HTML。先用 HTML 解析器定位元素，再对字段内容做正则处理。

## 解析器验收

- 使用保存的响应 fixture，测试正常、缺字段、空列表和异常编码。
- 必填字段缺失时失败并计数，而不是生成空记录。
- 相对 URL 能正确转换为绝对 URL。
- 同一输入重复解析产生相同输出。
- 选择器变化会让测试失败或触发质量告警。
