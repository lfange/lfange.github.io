---
title: 动态页面与接口爬取
category:
  - 后端
tag:
  - Python
  - 爬虫
---

# 动态页面与接口爬取

本篇是《Python 从入门到精通》第 16 篇。现代网站的数据几乎都不在初始 HTML 里——页面先加载骨架，JS 再发起 XHR/Fetch 请求拿 JSON 填充内容。应对之道按成本从低到高分三层：**直接抓接口（最优先）→ 异步并发抓接口（提速）→ 浏览器渲染（兜底）**。本篇把三层全部讲透。

---

## 一、为什么「requests 抓下来没有数据」

```python
import requests
resp = requests.get("https://spa-example.com/list", timeout=10)
print(resp.text)
# <div id="app"></div>   ← 只有空壳！数据不在这里
```

打开 DevTools 会看到：页面加载后 JS 发起了一个 XHR 请求，响应是：

```json
{"code": 0, "data": {"items": [{"name": "商品A", "price": 99}, ...], "total": 500}}
```

**这时的正确姿势不是上 Selenium，而是直接向这个接口发请求**——比渲染快 10~100 倍，且返回的 JSON 结构干净稳定。这就是「接口爬取」：爬虫从「模拟浏览器看页面」升级为「直接调 API」。

## 二、接口分析方法论

### 2.1 定位数据接口的标准流程

```
1. F12 → Network → Filter 选 Fetch/XHR（数据几乎都是这两类）
2. 刷新页面，观察请求列表；数据多时可按大小排序（JSON 数据包通常最大）
3. 用关键词定位：Filter 里直接搜页面上可见的文本（如某个商品名）
4. 检查目标请求：
   - URL 与规律（page=1 → page=2 是否可构造翻页）
   - Method：GET 还是 POST
   - 请求体/查询参数：哪些是固定的，哪些是变的
   - Response：数据是否在里面
5. 右键 → Copy as cURL → 转成 requests 代码验证（剔除无关 headers 找最小区间）
```

### 2.2 接口翻页的三种形态

```python
# 形态一：URL query 递增（最简单）
GET /api/items?page=1&size=20
GET /api/items?page=2&size=20

# 形态二：请求体里带游标（无限滚动 feed 的标配）
POST /api/feed  {"cursor": "abc123", "limit": 20}
# 每次响应返回 next_cursor，用它发起下一页 —— 逐次推进，不能跳页

# 形态三：时间戳/偏移量
GET /api/messages?before=1725800000&limit=50
```

### 2.3 实战：分析一个无限滚动接口（虚构示例）

```python
import requests

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 ...",
    "Referer": "https://spa-example.com/list",
})

items = []
cursor = None
while True:
    payload = {"limit": 20, **({"cursor": cursor} if cursor else {})}
    resp = session.post("https://spa-example.com/api/feed",
                        json=payload, timeout=10)
    data = resp.json()
    if data["code"] != 0:
        break   # 接口约定错误码即终止
    batch = data["data"]["items"]
    if not batch:
        break   # 空页 = 到底了
    items.extend(batch)
    cursor = data["data"].get("next_cursor")
    if not cursor:
        break

print(f"共抓 {len(items)} 条")
```

**注意 Referer**：接口的防盗链往往比对 Referer 是否来自本站，比页面请求更严格——接口 403 但页面能开时，先补 Referer。

### 2.4 请求头里的身份三件套

现代 SPA 接口常见三个身份字段，分析时逐一确认：

| 字段 | 来源 | 难度 |
| ---- | ---- | ---- |
| `Cookie` | 登录后服务器下发 | 低，直接复制 |
| `X-CSRF-Token` | 页面 HTML/meta 标签中 | 低，先 GET 页面解析出来 |
| `Authorization: Bearer xxx` | 登录接口返回的 JWT token | 低，先调登录接口 |
| `sign` / `X-Signature` | 前端 JS 算法生成 | 高，需要 JS 逆向（18 篇） |

前三类都好办——**先调「上游接口」拿凭证，再调数据接口**。第四类是真正的分水岭。

## 三、异步爬虫：asyncio + httpx

接口爬取的瓶颈是**网络 IO**：同步代码发 100 个请求 = 串行等待 100 次往返。并发是刚需，而爬虫场景「IO 密集 + 大量连接」正是 asyncio 的主场（详见[并发编程](./08-concurrency.md)）。

### 3.1 为什么是 httpx 而不是 aiohttp

```python
# pip install httpx
import asyncio
import httpx

async def fetch(client: httpx.AsyncClient, url: str) -> dict:
    resp = await client.get(url, timeout=10)
    resp.raise_for_status()
    return resp.json()

async def main() -> None:
    async with httpx.AsyncClient(  # Session 的异步等价物：连接复用 + 统一配置
        headers={"User-Agent": "Mozilla/5.0"},
        follow_redirects=True,
    ) as client:
        urls = [f"https://httpbin.org/get?page={i}" for i in range(20)]
        # 信号量限流：最多 5 个并发，礼貌且防风控
        sem = asyncio.Semaphore(5)

        async def guarded(url: str) -> dict | None:
            async with sem:
                try:
                    return await fetch(client, url)
                except httpx.HTTPError as e:
                    print(f"失败: {url} {e}")
                    return None

        results = await asyncio.gather(*[guarded(u) for u in urls])
        ok = [r for r in results if r]
        print(f"成功 {len(ok)}/{len(urls)}")

asyncio.run(main())
```

选择 httpx 的三个理由：**API 与 requests 几乎一致**（迁移成本≈0）、同步异步双模式（`httpx.get` 同步可用）、支持 HTTP/2。aiohttp 性能略高但 API 风格迥异，新项目从 httpx 起步更顺。

### 3.2 并发控制的三个层次

| 机制 | 作用 | 代码 |
| ---- | ---- | ---- |
| `Semaphore` | 限制同时在途的请求数 | `async with sem:` |
| 批次间 sleep | 降低整体节奏 | `await asyncio.sleep(random.uniform(0.5, 1))` |
| 失败退避 | 失败请求不重试则等待 | 在 `guarded` 里 sleep 后重试 |

**并发不是越大越好**：100 并发对单站就是 CC 攻击级别的压力，一是触发风控封 IP，二是不道德。爬虫并发一般 3~10 足够。

### 3.3 生产级异步爬虫骨架

```python
import asyncio
import random
import httpx

async def crawl() -> None:
    sem = asyncio.Semaphore(5)
    async with httpx.AsyncClient(headers={"User-Agent": "Mozilla/5.0"}) as client:
        page = 1
        while True:
            data = await fetch_page(client, sem, page)
            if not data["items"]:
                break
            for item in data["items"]:
                print(item["name"])
            page += 1
            await asyncio.sleep(random.uniform(0.3, 0.8))  # 翻页间隔

async def fetch_page(client: httpx.AsyncClient, sem: asyncio.Semaphore,
                     page: int) -> dict:
    async with sem:
        for attempt in range(3):  # 重试三次
            try:
                resp = await client.get(
                    f"https://spa-example.com/api/items?page={page}", timeout=10)
                resp.raise_for_status()
                return resp.json()
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 404:
                    return {"items": []}   # 翻完了，不算错误
                await asyncio.sleep(2 ** attempt)  # 退避
            except httpx.TransportError:
                await asyncio.sleep(2 ** attempt)
        return {"items": []}   # 彻底失败，优雅降级

asyncio.run(crawl())
```

## 四、渲染引擎：Selenium 与 Playwright

当接口参数带加密签名、逆向成本过高时，**让真正的浏览器去执行 JS** 是最后手段（也是万能兜底）。

### 4.1 为什么 Playwright 是当下首选

| | Selenium | Playwright |
| ---- | ---- | ---- |
| 架构 | WebDriver 协议（经过中间层） | **CDP 直连**（DevTools 协议），快 |
| 等待机制 | 显式/隐式等待，需手写 | **自动等待**（auto-wait），默认处理 |
| 浏览器 | 需单独装驱动 | `playwright install` 一条命令装全家桶 |
| 异步支持 | 一般 | 原生 asyncio API |
| 反检测 | 弱（特征明显） | 较好（可配 stealth） |

```python
# pip install playwright && playwright install chromium
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(
        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0"
    )
    page.goto("https://quotes.toscrape.com/js/", timeout=30000)

    # Playwright 的王牌：自动等待 —— 等元素出现而不是死等几秒
    quotes = page.locator("div.quote")
    quotes.first.wait_for(state="visible")

    for q in quotes.all():
        print(q.locator("span.text").inner_text())

    browser.close()
```

### 4.2 Playwright 三个高频技能

**① 网络拦截——监听接口响应（比解析 DOM 更稳）**：

```python
# 渲染页面的同时捕获它发出的 XHR，直接拿 JSON —— 渲染与接口爬取的合体
import json

captured: list[dict] = []

def on_response(response):
    if "/api/items" in response.url:
        try:
            captured.append(response.json())
        except Exception:
            pass

page.on("response", on_response)
page.goto("https://spa-example.com/list")
page.wait_for_load_state("networkidle")   # 网络空闲 = 数据加载完了
print(json.dumps(captured[:1], ensure_ascii=False, indent=2))
```

这个模式极其实用：**JS 帮你把加密参数算好了，你只要在响应出口处截获数据**——完全绕开签名逆向。

**② 无限滚动——模拟人类操作**：

```python
while True:
    count = page.locator("div.item").count()
    page.mouse.wheel(0, 2000)          # 滚轮事件（比 evaluate 更像真人）
    page.wait_for_timeout(random.randint(800, 1500))
    if page.locator("div.item").count() == count:   # 不再增长 = 到底
        break
```

**③ 屏蔽图片/字体——渲染提速**：

```python
page.route("**/*.{png,jpg,jpeg,gif,svg,woff,woff2,mp4}",
           lambda route: route.abort())   # 拦截并放弃资源请求，快 2~3 倍
page.goto(url)
```

### 4.3 什么时候才需要渲染引擎

```
数据在初始 HTML / 静态接口可复现  → requests/httpx（快，本系列 15 篇）
接口需要登录态/简单 token         → Session + 先调上游接口（本篇第二节）
接口参数加密且逆向成本高          → Playwright 拦截响应（本节 ①）
页面交互极复杂 / WebGL / canvas   → Playwright 完整渲染 + 截图/录屏
```

渲染引擎的成本必须心里有数：**每次启动浏览器吃 100~300MB 内存，单页加载 2~10s**。1000 个页面 = 一小时起。能用接口解决绝不开浏览器。

### 4.4 反检测对抗（简要）

无头浏览器有大量可检测特征（`navigator.webdriver=true`、无 GPU、字体列表异常），简单站补个 UA 就过，强风控站需要：

```python
browser = p.chromium.launch(
    headless=True,
    args=[
        "--disable-blink-features=AutomationControlled",  # 移除自动化标记
        "--no-sandbox",
    ],
)
# 更强的伪装用 playwright-stealth 补丁库；终极方案是 headful（有头）+ 住宅 IP
```

检测与对抗是持续军备竞赛，详见[反爬对抗](./18-crawler-anti-storage.md)。

## 五、三种方案对比总结

| 方案 | 速度 | 资源 | 开发成本 | 适用 |
| ---- | ---- | ---- | ---- | ---- |
| requests + 解析 HTML | ★★★★★ | 极低 | 低 | 静态页面 |
| httpx 异步 + 接口 | ★★★★★ | 低 | 中 | 有 JSON 接口（**首选**） |
| Playwright 渲染 | ★★ | 高 | 中 | 接口加密、重交互 |

**决策流程**：DevTools 分析 → 数据能通过接口拿到吗 → 能 → httpx 异步抓接口；不能（加密难破）→ Playwright 拦截响应或渲染。永远把渲染当兜底。

## 六、本篇小结

- 动态页面的本质：**数据在 XHR 响应里，不在 HTML 里**——优先抓接口
- 接口定位：Network → Fetch/XHR 过滤 → 关键词搜索 → Copy as cURL 验证
- 翻页三形态：页码递增 / cursor 游标 / 时间戳
- 异步爬虫：httpx（API 同 requests）+ Semaphore 限流 + 指数退避
- Playwright 王牌三技：**网络拦截拿 JSON**、无限滚动、资源屏蔽提速
- 渲染引擎是最后的手段：慢、重，但万能

下一篇：[Scrapy 框架实战](./17-crawler-scrapy.md)——当项目规模变大（几千 URL、失败重试、断点续爬、分布式），手写脚本开始吃力，专业框架接棒。
