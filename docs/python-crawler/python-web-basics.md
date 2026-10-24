---
title: Python 与 Web 基础
icon: lightbulb
order: 2
category:
  - Python 爬虫
tag:
  - Python
  - HTTP
  - HTML
---

# Python 与 Web 基础

## 开发环境

为每个项目建立独立虚拟环境，避免依赖互相污染：

```bash
python -m venv .venv
source .venv/bin/activate        # macOS / Linux
# .venv\Scripts\activate         # Windows PowerShell

python -m pip install --upgrade pip
python -m pip install requests beautifulsoup4
```

生产项目应锁定依赖版本，并使用 `pyproject.toml` 管理项目。不要把 Cookie、密码、代理凭证或 API Key 写进代码仓库。

## 需要掌握的 Python 知识

开始前至少熟悉：

- 字符串、字节、列表、字典、集合与推导式。
- 函数、生成器、上下文管理器和异常处理。
- `pathlib`、`json`、`csv`、`datetime`、`logging`。
- 类型提示、`dataclass` 或数据校验模型。
- 虚拟环境、包管理与基本单元测试。

爬虫的大部分 Bug 都发生在边界：编码、空字段、重复数据、错误重试和资源未释放，而不是选择器本身。

## URL 的组成

```text
https://example.com:443/products?page=2&sort=price#reviews
└─scheme └──host──┘ port └─path──┘ └────query────┘ fragment
```

Fragment 不会随 HTTP 请求发送给服务器。相对链接要用 `urllib.parse.urljoin()` 与当前页面 URL 合并，不要直接字符串拼接。

```python
from urllib.parse import urljoin

page_url = "https://example.com/catalog/page/1"
detail_url = urljoin(page_url, "../item/42")
print(detail_url)  # https://example.com/catalog/item/42
```

## HTTP 请求与响应

客户端发送方法、URL、请求头和可选请求体；服务器返回状态码、响应头和响应体。

| 状态码                | 含义           | 爬虫应如何处理                  |
| --------------------- | -------------- | ------------------------------- |
| 200                   | 成功           | 解析内容，同时检查 Content-Type |
| 301 / 302 / 307 / 308 | 重定向         | 限制跳转次数，记录最终 URL      |
| 400 / 404             | 请求或资源问题 | 通常不应无限重试                |
| 401 / 403             | 未认证或无权限 | 停止并检查授权，不尝试绕过      |
| 429                   | 请求过多       | 尊重 `Retry-After`，降低速率    |
| 500 / 502 / 503 / 504 | 服务端暂时错误 | 有上限地指数退避重试            |

GET 通常用于读取资源，POST 常用于提交数据。不要假设 POST 可以安全重试：它可能创建重复操作。

## HTML、DOM 与数据位置

浏览器把 HTML 解析为 DOM 树。数据可能位于：

- 标签文本，例如 `<h1>标题</h1>`。
- 属性，例如 `<a href="/detail/1">`。
- `meta`、`data-*` 属性或表格。
- 页面中的 JSON-LD 或初始化 JSON。
- JavaScript 后续调用的 JSON API。

先检查响应源代码中是否已有数据。开发者工具“Elements”里看到的节点可能是 JavaScript 运行后生成的，并不在最初响应里。

## 第一个完整爬虫

下面使用 Scrapy 官方教程采用的练习站点 `quotes.toscrape.com`：

```python
import json
import time
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

START_URL = "https://quotes.toscrape.com/"
OUTPUT = Path("quotes.jsonl")


def parse_page(html: str, page_url: str) -> tuple[list[dict], str | None]:
    soup = BeautifulSoup(html, "html.parser")
    rows: list[dict] = []

    for quote in soup.select("div.quote"):
        text = quote.select_one("span.text")
        author = quote.select_one("small.author")
        if text is None or author is None:
            continue

        rows.append(
            {
                "text": text.get_text(strip=True),
                "author": author.get_text(strip=True),
                "source_url": page_url,
            }
        )

    next_link = soup.select_one("li.next a[href]")
    next_url = urljoin(page_url, next_link["href"]) if next_link else None
    return rows, next_url


def crawl() -> None:
    url: str | None = START_URL
    seen: set[str] = set()

    with requests.Session() as session, OUTPUT.open("w", encoding="utf-8") as file:
        session.headers["User-Agent"] = "LearningCrawler/1.0 (contact: you@example.com)"

        while url and url not in seen:
            seen.add(url)
            response = session.get(url, timeout=(5, 20))
            response.raise_for_status()

            rows, url = parse_page(response.text, response.url)
            for row in rows:
                file.write(json.dumps(row, ensure_ascii=False) + "\n")

            time.sleep(1)  # 保守限速；真实项目按站方规则配置


if __name__ == "__main__":
    crawl()
```

这个示例包含了最小闭环：会话、身份说明、超时、状态检查、解析、分页去重、JSONL 输出和限速。

## 分离获取与解析

不要把网络请求写进解析函数。推荐接口：

```python
def fetch(url: str) -> str:
    """负责网络与错误处理。"""


def parse_page(html: str, page_url: str) -> list[dict]:
    """只解析输入，不访问网络。"""
```

这样可以保存一份授权响应作为测试 fixture，在离线环境反复测试解析器。

## 入门排错顺序

1. 打印状态码、最终 URL 和 `Content-Type`。
2. 保存响应体，确认它是不是预期 HTML / JSON，而非登录页或错误页。
3. 在保存的响应上测试最小选择器。
4. 检查字段为空时是否被安全处理。
5. 再检查分页、去重和存储。

不要一遇到空结果就添加更多请求头或换代理；先确定数据究竟位于哪里，以及你是否有权访问。
