---
title: API、分页与会话
icon: plug
order: 5
category:
  - Python 爬虫
tag:
  - JSON API
  - Pagination
  - Session
  - Authentication
---

# API、分页与授权会话

如果网站提供官方 API、数据导出或开放数据集，应优先使用。结构化接口通常比 HTML 更稳定，也更容易表达授权、分页和速率限制。

## 判断接口是否可用

使用浏览器开发者工具观察自己的、已授权的会话请求时，确认：

- 接口是否公开记录在开发者文档中。
- 服务条款是否允许自动访问和保存结果。
- 是否需要 API Key、OAuth Scope 或专用客户端。
- 返回数据中是否包含无权保存的个人或内部字段。
- 是否有速率、分页、缓存和删除要求。

“浏览器能看到请求”不代表可以绕过授权或批量调用未公开接口。

## JSON API

```python
import requests


def fetch_page(session: requests.Session, page: int) -> dict:
    response = session.get(
        "https://api.example.com/v1/articles",
        params={"page": page, "page_size": 100},
        headers={"Accept": "application/json"},
        timeout=(5, 20),
    )
    response.raise_for_status()

    if "application/json" not in response.headers.get("Content-Type", ""):
        raise ValueError("接口没有返回 JSON")

    data = response.json()
    if not isinstance(data, dict) or not isinstance(data.get("items"), list):
        raise ValueError("API 响应结构不符合预期")
    return data
```

状态码成功不等于数据正确。仍要验证根类型、字段类型、必填值和业务约束。

## 四种分页方式

| 类型     | 请求示例                | 终止条件                   | 特点                           |
| -------- | ----------------------- | -------------------------- | ------------------------------ |
| 页码     | `?page=3`               | items 为空或到 total_pages | 简单，但更新时可能重复或遗漏   |
| Offset   | `?offset=200&limit=100` | 返回数量小于 limit         | 大偏移可能变慢                 |
| Cursor   | `?cursor=abc`           | next_cursor 为空           | 对变化中的数据更稳定           |
| 时间窗口 | `?updated_after=...`    | 到达当前水位               | 适合增量同步，需要处理同秒数据 |

Cursor 分页示例：

```python
def iter_items(session: requests.Session):
    cursor: str | None = None

    while True:
        response = session.get(
            "https://api.example.com/v1/items",
            params={"cursor": cursor, "limit": 100},
            timeout=(5, 20),
        )
        response.raise_for_status()
        payload = response.json()

        for item in payload.get("items", []):
            yield item

        next_cursor = payload.get("next_cursor")
        if not next_cursor or next_cursor == cursor:
            break
        cursor = next_cursor
```

记录每页游标和完成状态，任务中断后才能从安全位置恢复。

## 增量同步与水位

增量任务不要只保存最后时间戳。更稳妥的水位通常是 `(updated_at, unique_id)`，并在边界处重叠一个小窗口，然后按唯一键幂等写入。

```text
上次成功水位：2026-10-01T08:30:00Z, id=9182
下次查询起点：稍早于该时间，重新读取边界记录
写入方式：按 source + external_id 更新或插入
新水位：只在整批数据提交成功后推进
```

这样可以处理同一时间戳的多条记录、延迟到达和任务重跑。

## 条件请求

服务器提供 `ETag` 或 `Last-Modified` 时，可以避免重复下载：

```python
headers = {}
if previous_etag:
    headers["If-None-Match"] = previous_etag
if previous_modified:
    headers["If-Modified-Since"] = previous_modified

response = session.get(url, headers=headers, timeout=(5, 20))
if response.status_code == 304:
    print("内容没有变化")
else:
    response.raise_for_status()
```

缓存验证减少带宽和站点压力，但仍要控制检查频率。

## Cookie 与 Session

Session 会自动保存响应设置的 Cookie：

```python
with requests.Session() as session:
    first = session.get("https://example.com/start", timeout=(5, 20))
    first.raise_for_status()

    second = session.get("https://example.com/next", timeout=(5, 20))
    second.raise_for_status()
```

Cookie 可能代表登录身份，必须像密码一样保护。不要提交到 Git、打印到日志或在多个用户之间共用。

## 登录和认证

只自动化你有权使用的账号和流程，优先采用官方 API Key、OAuth、服务账号或导出接口。

若站方明确允许表单登录：

1. 先 GET 登录页，读取站方要求的 CSRF Token。
2. POST 合法凭证和 Token。
3. 检查登录结果和账号权限。
4. 使用最小权限账号，并设置凭证轮换和吊销。
5. 出现验证码、多因素认证或风险确认时停止自动化，采用官方接入方式或人工流程。

不要把关闭 TLS 验证当作解决证书问题的方法，也不要自动接受异常证书。

## 秘密管理

本地开发可从环境变量读取，但不要把真实值写进示例：

```python
import os

api_token = os.environ["CRAWLER_API_TOKEN"]
headers = {"Authorization": f"Bearer {api_token}"}
```

生产环境使用专用秘密管理系统，限制读取身份，定期轮换，并确保错误追踪和 HTTP 调试日志会清除认证头。

## API 采集检查清单

- 使用官方或明确获准的接口与 Scope。
- 设置超时、速率限制、分页上限和最大响应体。
- 校验 Content-Type、JSON 结构和业务 Schema。
- 处理 401、403、429、5xx 与 Token 过期。
- 游标、水位和批次提交可以从中断处恢复。
- 删除和更新能够同步，而不只是不断追加。
- 日志不包含 Token、Cookie 和敏感字段。
