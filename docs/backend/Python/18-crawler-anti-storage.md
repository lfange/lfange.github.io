---
title: 反爬对抗与数据存储
category:
  - 后端
tag:
  - Python
  - 爬虫
---

# 反爬对抗与数据存储

本篇是《Python 从入门到精通》第 18 篇，爬虫系列的收官。前几篇解决了「怎么抓」，本篇解决「**怎么持续地抓**」（反爬对抗）和「**抓到之后怎么办**」（数据存储与工程化），并再次明确边界：所有对抗技术用于**合法合规的数据获取**，本篇会花一整节讲清楚红线在哪。

---

## 一、反爬的三个层次：识别你在对抗什么

知己知彼。网站识别爬虫的手段按检测介质分三层，**从浅到深对抗成本指数级上升**：

| 层次 | 检测手段 | 破解成本 | 应对 |
| ---- | ---- | ---- | ---- |
| 第一层：请求特征 | UA、Referer、Cookie 缺失 | 低 | 补齐/伪造请求头 |
| 第二层：行为特征 | 频率、节奏、轨迹、指纹一致性 | 中 | 限速随机化、代理池、模拟行为 |
| 第三层：客户端特征 | TLS/JA3 指纹、JS 挑战、验证码 | 高 | 指纹伪装库、渲染引擎、打码 |

**排查思路自下而上**：先看请求头（30 秒能试完）→ 再看频率与 IP → 最后才考虑指纹与 JS 挑战。90% 的站点死在第一层。

## 二、第一层：请求特征对抗

### 2.1 请求头补齐的「最小区间」法

别盲目把浏览器几十个头全抄上（有些头反而暴露指纹一致性）。做法：

```python
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    "Referer": "https://target-site.com/",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "zh-CN,zh;q=0.9",
}
```

从这四个开始，403 就逐个加 `Accept-Encoding`、`Cache-Control`……每次加完测试。**找出目标站真正检查的那几个头**，代码更干净，也更像真实流量。

### 2.2 UA 轮换

固定 UA 抓几千页 = 一个「人」看了几千页（机器行为）。轮换池：

```python
import random

UA_POOL = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/17.4",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
]

def random_ua() -> str:
    return random.choice(UA_POOL)
```

::: warning 轮换的一致性陷阱
**一个 Session（一个 Cookie 身份）配一个固定 UA**才合理——同一 Cookie 下 UA 每次都变，反而是明显的机器特征。正确姿势：UA 池与 Session/代理 IP 绑定成「身份包」，同一身份内保持一致。
:::

## 三、第二层：频率、IP 与代理池

### 3.1 被封 IP 的典型表现

- 请求开始全部 403/429，而浏览器正常访问
- 返回一个「请输入验证码」页面（200 但内容是验证码）
- 连接直接被 reset / 超时（IP 段被防火墙拦了）

### 3.2 代理的类型与选择

| 类型 | 特点 | 适用 |
| ---- | ---- | ---- |
| 数据中心代理 | 便宜、快、**容易被识别**（机房 IP 段公开） | 爬不怕封的站、测试 |
| 住宅代理 | 真实家庭宽带 IP，**最难识别**，贵 | 强风控站（按流量计费） |
| 移动代理 | 4G/5G 出口，天然动态 | 超强风控 |

```python
import requests

# 单次代理
proxies = {"http": "http://user:pass@proxy.example.com:8080",
           "https": "http://user:pass@proxy.example.com:8080"}
resp = requests.get("https://httpbin.org/ip", proxies=proxies, timeout=10)
print(resp.json()["origin"])   # 变成代理 IP
```

### 3.3 手搭简易代理池（核心逻辑）

生产可用的代理池 = **获取 → 校验 → 存储 → 策略**四步循环：

```python
"""简易代理池：定期拉取免费代理、校验存活、按需供给"""
import random
import time
import requests

class ProxyPool:
    def __init__(self, fetch_url: str, check_url: str = "https://httpbin.org/ip"):
        self.fetch_url = fetch_url      # 代理商的提取 API
        self.check_url = check_url      # 校验目标
        self.proxies: list[str] = []

    def fetch(self) -> None:
        """从代理商拉一批代理（每批通常 5~20 个）"""
        resp = requests.get(self.fetch_url, timeout=10)
        self.proxies = [f"http://{line.strip()}"
                        for line in resp.text.splitlines() if line.strip()]

    def validate(self) -> None:
        """过滤掉死代理 —— 免费代理存活率可能不到 30%"""
        alive = []
        for p in self.proxies:
            try:
                requests.get(self.check_url,
                             proxies={"http": p, "https": p}, timeout=5)
                alive.append(p)
            except requests.RequestException:
                continue
        self.proxies = alive

    def get(self) -> str | None:
        """随机取一个（进阶：按失败率加权淘汰、最少使用优先）"""
        return random.choice(self.proxies) if self.proxies else None


pool = ProxyPool("https://proxy-provider.example.com/get?num=10")
pool.fetch()
pool.validate()
```

**工程要点**：付费代理商一般自带「提取 API + 白名单」，不需要自建校验池；自建池的真正难点在**淘汰策略**（连续失败 N 次移除）与**成本**（免费代理池仅学习用）。在 Scrapy 里通过中间件挂代理池（见[上篇 7.3](./17-crawler-scrapy.md)），httpx 异步爬虫里用 `client = httpx.AsyncClient(proxy=pool.get())`。

### 3.4 频率控制：像人一样上网

```python
import random
import time

def human_pause() -> None:
    """随机间隔 + 偶发长停顿（模拟人走神/看内容）"""
    if random.random() < 0.1:
        time.sleep(random.uniform(5, 15))   # 10% 概率长停顿
    else:
        time.sleep(random.uniform(1, 4))
```

- **避峰**：目标站凌晨负载低，风控也相对宽松
- **总量控制**：估算数据量（页数 × 每页大小），别让目标站日志里你是流量第一名

## 四、第三层：指纹与 JS 挑战

### 4.1 TLS 指纹（JA3）：头补得再好也没用的原因

TLS 握手时（HTTPS 建立连接的第一步），客户端发送的 ClientHello 报文（支持的加密套件、扩展顺序等）构成**指纹**。Python 的 ssl 模块和 Chrome 的握手特征完全不同——**服务器在 HTTP 层之前就能认出你不是浏览器**。

```python
# curl_cffi：模拟真实浏览器 TLS 指纹的请求库（pip install curl_cffi）
from curl_cffi import requests

# impersonate 指定模拟的浏览器版本，连 TLS 指纹 + HTTP/2 帧顺序一起伪装
resp = requests.get("https://now.secure.example.com",
                    impersonate="chrome124", timeout=10)
print(resp.status_code)
```

**判断是不是 TLS 指纹检测**：同一请求用 requests 永远 403，用 curl_cffi 立刻 200，而两者 headers 完全一样——基本可以锤定。

### 4.2 JS 挑战与验证码

| 手段 | 原理 | 应对 |
| ---- | ---- | ---- |
| Cookie 挑战 | 返回一段 JS，算出 cookie 后刷新才放行（Cloudflare 的经典五秒盾） | Playwright 真实执行 JS；或 `curl_cffi` 直接过部分场景 |
| 滑动/点选验证码 | 行为轨迹验证（速度、加速度、抖动都要像人） | 付费打码平台（超级鹰等）；Playwright 模拟人类轨迹 |
| reCAPTCHA/hCaptcha | 综合信号评分 | 打码 API / 降低频率绕开触发 |

**成本视角**：对抗第三层的正确问法不是「技术上能不能破」，而是「**这个数据值多少钱**」。打码 + 住宅代理 + 渲染的每页成本可能超过 ¥0.1，几万页就是几千块——多数场景下换成官方 API/开放数据/商务合作才是正解。

## 五、数据存储：从 CSV 到数据库

### 5.1 存储选型

| 格式 | 适用 | 特点 |
| ---- | ---- | ---- |
| JSON / JSON Lines | 中小量、结构化、给程序消费 | **JSON Lines 逐行独立，坏一行不影响全局，追加友好** |
| CSV | 给 Excel / 人工查看 | 类型全变字符串、逗号转义坑 |
| SQLite | 单机持久化、百万级 | 零部署、单文件、SQL 查询，**爬虫默认数据库** |
| MySQL / PostgreSQL | 团队共享、亿级、事务 | 需要 DBA 心智（索引、连接池） |
| MongoDB | 字段不固定、嵌套深、原文留存 | Schema-free，爬虫天然的朋友 |

### 5.2 SQLite：爬虫的默认落地

```python
import sqlite3

conn = sqlite3.connect("data.db")
conn.execute("""CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT UNIQUE,          -- UNIQUE：天然去重约束
    title TEXT, body TEXT,
    crawled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)""")

def save(url: str, title: str, body: str) -> None:
    try:
        conn.execute(
            "INSERT INTO articles (url, title, body) VALUES (?, ?, ?)",
            (url, title, body),
        )
        conn.commit()
    except sqlite3.IntegrityError:
        pass   # url 重复 → 靠约束自动去重
```

三个工程细节：**参数化查询**（`?` 占位，防注入也防转义错误）；**URL 列 UNIQUE**（数据库层去重兜底）；**crawled_at 时间戳**（数据溯源）。

### 5.3 增量爬取：不重复抓旧数据

三种策略，按优先级：

```python
# 策略一：内容指纹（ETag / Last-Modified）—— 服务器告诉你变没变
resp = session.get(url, headers={
    "If-None-Match": cached_etag,        # 上次响应的 ETag
    "If-Modified-Since": cached_date,
}, timeout=10)
if resp.status_code == 304:
    skip()   # 内容没变，省流量省解析

# 策略二：时间戳水位 —— 只抓比上次新的
last_crawled = load_watermark()
for item in fetch_list():
    if item["publish_time"] <= last_crawled:
        break                            # 列表按时间倒序，见到旧的即停
save_watermark(newest_time)

# 策略三：URL 集合去重 —— 已抓过的 URL 不再进队列
seen: set[str] = load_seen_urls()
if url not in seen:
    crawl(url); seen.add(url)
```

百万级以上用 Redis 的 `SADD`（O(1) 且持久化、跨进程共享）替代内存 set，分布式爬虫的标配。

### 5.4 数据清洗入门

原始数据入库前过一遍 `pandas`（哪怕只是简单去重和空值处理）：

```python
import pandas as pd

df = pd.read_json("raw.jsonlines", lines=True)
df = (df
      .drop_duplicates(subset="url")           # 去重
      .dropna(subset=["title", "price"])       # 关键字段缺失的丢弃
      .assign(price=lambda d: d["price"]       # 字符串 '£51.77' → 51.77
              .str.replace("£", "").astype(float))
      )
df.to_parquet("clean.parquet")   # parquet：列存、压缩、分析友好
print(df.describe())
```

## 六、合规红线（重申并展开）

前一篇讲过底线，这里从工程角度补全决策框架：

### 6.1 判断矩阵

```
数据是公开的（无需登录即可见）？
├─ 是 → 频率克制 + 遵守 robots.txt → 风险低，注意服务条款
└─ 否（需登录/付费） → 停。技术上「能」不等于法律上「可以」
     └─ 破解认证/付费墙抓取 → 《刑法》285/286 条风险区

数据含个人信息？
├─ 是 → 《个人信息保护法》：收集需告知同意，处理需最小必要
└─ 否 → 知识产权层面评估（转卖/公开传播有风险）

用途是什么？
├─ 个人学习/研究 → 基本安全
├─ 商业产品（转卖数据/训练集/公开服务） → 评估不正当竞争与版权
└─ 舆情/价格监控等灰色场景 → 找官方 API 或数据供应商
```

### 6.2 替代方案优先级

```
官方开放 API > 政府开放数据 > 数据供应商 > RSS/sitemap > 自己爬
```

**工程师的成熟度体现**：接需求先问「有没有合规的数据源」，而不是直接开写爬虫。爬虫是工具箱里最后拿出来的那把螺丝刀。

## 七、爬虫工程化清单（本系列总复习）

一个「能上线」的爬虫项目应具备：

```text
├── 配置分离        账号/代理/URL 全部进环境变量或 .env（不硬编码、不进 git）
├── 日志            结构化日志 + 失败明细（哪页挂了、什么状态码）
├── 重试与退避      只对幂等请求 + 瞬时故障
├── 断点续爬        Scrapy JOB / 自维护水位
├── 数据校验        Pipeline 里校验必填字段，脏数据打标不入库
├── 监控告警        成功率跌破阈值通知（哪怕只是一封邮件）
├── 礼貌限速        随机间隔 + 避峰 + 总量预算
└── 出口            数据落地格式明确（DB schema / parquet / API）
```

回顾整个爬虫系列的方法论：

| 篇 | 解决的问题 | 核心思想 |
| ---- | ---- | ---- |
| [14 HTTP 基础](./14-crawler-http-basics.md) | 看懂协议 | 报文里藏着成败的答案 |
| [15 requests 与解析](./15-crawler-requests-parsing.md) | 抓取静态页 | Session + XPath，模型/解析/调度分层 |
| [16 动态页面](./16-crawler-dynamic.md) | 抓取 SPA | 接口 > HTML > 渲染，永远最后开浏览器 |
| [17 Scrapy](./17-crawler-scrapy.md) | 规模化 | 只定义怎么解析一页，框架驱动一切 |
| 18 本篇 | 持续抓取 | 分层识别对抗；存储与增量；合规优先 |

## 八、本篇小结

- 反爬三层：请求头（低成本）→ 行为/IP（中）→ TLS 指纹与 JS 挑战（高）
- UA 轮换要和 Session 绑定「身份包」，指纹一致性比轮换本身更重要
- 代理池四步：获取 → 校验 → 存储 → 淘汰策略；数据中心 vs 住宅代理的取舍
- curl_cffi 一行 `impersonate="chrome124"` 解决 TLS 指纹
- 存储：JSON Lines / SQLite（默认）/ MongoDB（schema-free）；参数化查询 + UNIQUE 去重 + 时间戳
- 增量三策略：ETag 协商缓存 > 时间水位 > URL 集合（大规模用 Redis）
- **对抗前先算账：数据价值 vs 对抗成本 vs 合规风险，官方 API 永远优先**
