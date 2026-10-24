---
title: Requests 与 HTTP
icon: network-wired
order: 3
category:
  - Python 爬虫
tag:
  - Requests
  - HTTP
  - 重试
---

# Requests 与可靠 HTTP 客户端

Requests 负责发送同步 HTTP 请求。生产代码的关键不是 `requests.get()`，而是正确配置会话、超时、重试、状态处理、响应大小和日志。

## 基本请求

```python
import requests

response = requests.get(
    "https://httpbin.org/get",
    params={"page": 2},
    headers={"Accept": "application/json"},
    timeout=(5, 20),  # 连接超时、读取超时
)
response.raise_for_status()
data = response.json()
```

Requests 官方文档强调，生产请求几乎都应设置 `timeout`；未设置时可能无限等待。这里的读取超时也不是整个下载任务的总时限，而是等待网络继续返回字节的时限。详见 [Requests Quickstart](https://requests.readthedocs.io/en/stable/user/quickstart/#timeouts)。

## 使用 Session

`Session` 可以持久化 Cookie、复用 TCP 连接，并设置公共请求头：

```python
import requests

with requests.Session() as session:
    session.headers.update(
        {
            "User-Agent": "CatalogSync/1.2 (contact: data-team@example.com)",
            "Accept": "text/html,application/xhtml+xml",
        }
    )
    response = session.get("https://example.com/", timeout=(5, 20))
    response.raise_for_status()
```

User-Agent 应真实标识程序和联系方式，而不是伪装成人类浏览器。站方要求专用 Token 或客户端标识时，以官方接入规则为准。

## 有边界的自动重试

只对幂等读取请求和暂时性错误重试，并限制次数：

```python
from requests import Session
from requests.adapters import HTTPAdapter
from urllib3.util import Retry


def build_session() -> Session:
    retry = Retry(
        total=4,
        connect=4,
        read=2,
        status=2,
        backoff_factor=1.0,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=frozenset({"GET", "HEAD"}),
        respect_retry_after_header=True,
        raise_on_status=False,
    )
    adapter = HTTPAdapter(max_retries=retry, pool_connections=10, pool_maxsize=10)

    session = Session()
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers["User-Agent"] = "CatalogSync/1.2 (contact: data-team@example.com)"
    return session
```

指数退避会逐步增加等待时间，避免故障期间持续施压。超过重试上限后，应记录失败并交给后续补偿任务，不要无限循环。

## 统一获取函数

```python
from collections.abc import Collection
from urllib.parse import urlparse

import requests


def fetch_text(
    session: requests.Session,
    url: str,
    *,
    allowed_hosts: Collection[str],
    max_bytes: int = 2_000_000,
) -> str:
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or parsed.hostname not in allowed_hosts:
        raise ValueError(f"URL 不在允许范围内: {url}")

    with session.get(url, timeout=(5, 20), stream=True) as response:
        response.raise_for_status()
        content_type = response.headers.get("Content-Type", "")
        if "text/html" not in content_type:
            raise ValueError(f"不支持的内容类型: {content_type}")

        chunks: list[bytes] = []
        size = 0
        for chunk in response.iter_content(chunk_size=64 * 1024):
            size += len(chunk)
            if size > max_bytes:
                raise ValueError("响应超过大小上限")
            chunks.append(chunk)

        body = b"".join(chunks)
        return body.decode(response.encoding or "utf-8", errors="replace")
```

允许域名和响应大小限制也能降低 SSRF、重定向到内部地址、内存耗尽等风险。生产环境还要在每次重定向后重新验证目标地址。

## 编码

- HTTP 头或 HTML `<meta charset>` 可能声明编码。
- `response.content` 是原始字节，`response.text` 是解码后的字符串。
- 数据库和文件尽量统一保存 UTF-8。
- 出现乱码时先记录响应头和前几百个原始字节，不要随意删除异常字符。

对于 XML，应让 XML 解析器根据声明处理字节；对于 JSON，优先使用 `response.json()` 并捕获解析异常。

## 流式下载

下载大文件时不要一次读入内存：

```python
from pathlib import Path

import requests


def download_file(url: str, target: Path, max_bytes: int) -> None:
    written = 0
    with requests.get(url, stream=True, timeout=(5, 30)) as response:
        response.raise_for_status()
        with target.open("wb") as file:
            for chunk in response.iter_content(64 * 1024):
                written += len(chunk)
                if written > max_bytes:
                    raise ValueError("文件超过大小上限")
                file.write(chunk)
```

真实项目还应先检查允许的内容类型，将文件写到临时路径，校验哈希后再原子移动到目标位置。

## 错误分类

| 错误           | 是否重试     | 处理方式                     |
| -------------- | ------------ | ---------------------------- |
| DNS / 连接失败 | 有上限重试   | 退避，检查网络和域名         |
| 读取超时       | 有上限重试   | 降低并发，记录响应大小       |
| 401 / 403      | 通常不重试   | 检查授权和权限，不绕过       |
| 404 / 410      | 通常不重试   | 标记资源不存在或已删除       |
| 429            | 延后重试     | 遵守 `Retry-After`，降低速率 |
| 5xx            | 有上限重试   | 指数退避，触发服务端异常告警 |
| 解析失败       | 不应盲目重试 | 保存样本，检查内容变化       |

## 记录什么

建议记录请求 ID、URL 哈希或脱敏 URL、域名、状态码、耗时、响应字节数、重试次数、最终异常和解析版本。不要把认证头、完整 Cookie、个人信息或带敏感查询参数的 URL 写入普通日志。

更深入的 Session、连接池、TLS 和高级用法可参考 [Requests Advanced Usage](https://requests.readthedocs.io/en/stable/user/advanced/)。
