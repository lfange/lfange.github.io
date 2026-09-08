---
title: Scrapy 框架实战
category:
  - 后端
tag:
  - Python
  - 爬虫
---

# Scrapy 框架实战

本篇是《Python 从入门到精通》第 17 篇。脚本爬虫写到几百个 URL、需要重试、断点续爬、多机分布时就会撞墙——Scrapy 用**内置的引擎调度、并发、重试、去重、管道**把这些工程问题一次性解决。本篇从架构讲到实战，目标是看完能独立搭起一个生产级 Scrapy 项目。

---

## 一、Scrapy 是什么：一架数据流水线

先建立正确认知：Scrapy 不是「更强的 requests」，而是**爬虫的工程化框架**——它更像 Web 世界的 Django/Flask 之于 HTTP。

| 你手写脚本时操心的事 | Scrapy 内置方案 |
| ---- | ---- |
| 并发控制、连接池 | 引擎 + Twisted 事件循环，自动并发 |
| 失败重试 | RetryMiddleware，可配置 |
| URL 去重 | DUPEFILTER（指纹集合），自动跳过重复请求 |
| 断点续爬 | JOB 存储（jobdir），中断后恢复 |
| 数据清洗入库 | Item Pipeline，责任链模式 |
| 限速礼貌抓取 | AutoThrottle 扩展，自动调节 |

**心智模型转换**：脚本思维是「我控制流程，循环抓每一页」；Scrapy 思维是「我只定义**怎么解析一个页面**，引擎负责调度全部请求」。后者是事件驱动 + 回调的风格，和前端的事件循环异曲同工。

## 二、架构：五个组件一条流

```
                          ┌─────────────┐
                          │  Scheduler  │  待抓请求队列（指纹去重）
                          └──────▲──────┘
                                 │ ④
     ① _________________________▼________ ②
URL →│ Engine（引擎，总调度，只做搬运工）│→ Downloader ──③──> 互联网
     └──────┬────────────────────────────▲
            │ ⑤ 初始请求 / ⑥ yield 新请求   │ ⑦ 响应
            ▼                              │
       ┌─────────┐   ⑧ Item               │
       │  Spider │ ───────────► Item Pipeline（清洗 → 校验 → 去重 → 入库）
       │（你写的）│                          │
       └─────────┘   ⑨ 新的 Request ──回到 Scheduler
```

数据流：**Spider 产生初始 Request → 引擎交给调度器排队 → 引擎取请求给下载器 → 下载器拿到 Response 交回 Spider → Spider 解析后 yield 两类东西**：

- `Item`：提取的数据 → 流向 Pipeline 处理入库
- `Request`：页面里发现的下一批 URL → 回到调度器，循环往复

**两条中间件链**横插在引擎与下载器之间（Downloader Middleware：改请求头、挂代理、处理重定向）和 Spider 与引擎之间（Spider Middleware：预处理响应/输出）。全部组件可插拔替换——这就是框架的扩展性来源。

## 三、十分钟上手：第一个 Spider

```sh
# 安装（建议 Python 3.9+ 虚拟环境）
pip install scrapy

# 创建项目 —— 注意：必须用 scrapy startproject，目录结构是框架约定
scrapy startproject demo
cd demo
```

生成的目录结构（**每个文件职责固定**）：

```
demo/
├── scrapy.cfg                # 部署配置（不用动）
└── demo/
    ├── items.py              #   数据模型（字段定义）
    ├── middlewares.py        #   下载器/爬虫中间件
    ├── pipelines.py          #   数据处理管道
    ├── settings.py           #   全局配置（核心）
    └── spiders/              #   你的爬虫都放这里
        └── __init__.py
```

创建第一个爬虫：

```sh
cd demo
scrapy genspider quotes quotes.toscrape.com
```

### 3.1 改写 Spider：抓取名言站

```python
# demo/spiders/quotes.py
import scrapy


class QuotesSpider(scrapy.Spider):
    name = "quotes"                       # 爬虫唯一标识（运行时按名字调用）
    allowed_domains = ["quotes.toscrape.com"]  # 域名白名单：防爬虫「跑飞」跳到外网
    start_urls = ["https://quotes.toscrape.com/"]  # 初始请求（框架自动发起）

    def parse(self, response):
        """引擎把每个响应都交回这里 —— 整个爬虫的核心就是这一个函数"""
        for quote in response.css("div.quote"):
            yield {
                "text": quote.css("span.text::text").get(),
                "author": quote.css("small.author::text").get(),
                "tags": quote.css("a.tag::text").getall(),
            }

        # 翻页：当前页解析完，yield 下一页的 Request → 回到调度器排队
        next_page = response.css("li.next a::attr(href)").get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)
            # response.follow 自动补全相对 URL，等价 Request(url, callback=...)
```

运行与导出：

```sh
scrapy crawl quotes                         # 运行并打印
scrapy crawl quotes -O quotes.json          # 覆盖导出 JSON（-o 是追加）
scrapy crawl quotes -O quotes.csv           # CSV
scrapy crawl quotes -O quotes.jsonlines     # JSON Lines（大文件推荐，逐行可解析）
```

### 3.2 Scrapy 的选择器：css() 与 xpath()

Scrapy 内置 parsel（lxml 封装），**响应对象直接带选择器**：

```python
response.css("h1 a::text").get()          # 取第一个的文本；没有返回 None（不抛异常）
response.css("a.tag::text").getall()      # 取全部 → list
response.css("a::attr(href)").get()       # 取属性
response.xpath("//span[@class='text']/text()").get()
response.css("div.quote").xpath(".//small/text()").get()   # css 与 xpath 可链式混用

# 实用属性
response.url            # 当前页 URL
response.status         # 状态码
response.headers        # 响应头
```

`::text` / `::attr(x)` 是 Scrapy CSS 选择器的扩展语法，**get() 返回 None 而不是报错**是防御式写法的基础。

## 四、Item：声明数据模型

裸 dict 无字段约束，拼错字段名运行期才会发现。Item 是**带声明和校验的字典**：

```python
# demo/items.py
import scrapy


class QuoteItem(scrapy.Item):
    text = scrapy.Field()
    author = scrapy.Field()
    tags = scrapy.Field()
```

Spider 里改用 Item：

```python
from demo.items import QuoteItem

def parse(self, response):
    for quote in response.css("div.quote"):
        item = QuoteItem()
        item["text"] = quote.css("span.text::text").get()
        item["author"] = quote.css("small.author::text").get()
        item["tags"] = quote.css("a.tag::text").getall()
        yield item
```

`Field()` 里可塞元数据（如 `scrapy.Field(processor=…)` 配合 Item Loader 做输入处理），简单项目用默认即可。

## 五、Pipeline：数据处理的流水线 ⭐

Spider 只管「提取」，清洗、校验、入库全部交给 Pipeline——**每类处理逻辑写成一个类，像流水线一样串联**：

```python
# demo/pipelines.py
import sqlite3


class CleanPipeline:
    """第一步：数据清洗（Strip、去引号）"""

    def process_item(self, item, spider):
        item["text"] = item["text"].strip("“”").strip()
        return item   # 必须 return，否则数据流在此中断
        # 丢弃不合格数据：raise DropItem("缺少作者")


class ValidationPipeline:
    """第二步：校验"""

    def process_item(self, item, spider):
        if not item.get("author"):
            from scrapy.exceptions import DropItem
            raise DropItem(f"缺 author: {item}")
        return item


class SQLitePipeline:
    """第三步：入库。open_spider / close_spider 是生命周期钩子"""

    def open_spider(self, spider):
        self.conn = sqlite3.connect("quotes.db")
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS quotes"
            "(text TEXT, author TEXT, tags TEXT)"
        )

    def process_item(self, item, spider):
        self.conn.execute(
            "INSERT INTO quotes VALUES (?, ?, ?)",
            (item["text"], item["author"], ",".join(item["tags"])),
        )
        return item

    def close_spider(self, spider):
        self.conn.commit()
        self.conn.close()
```

在 settings.py 中**按顺序**启用（数字越小越先执行）：

```python
# settings.py
ITEM_PIPELINES = {
    "demo.pipelines.CleanPipeline": 100,
    "demo.pipelines.ValidationPipeline": 200,
    "demo.pipelines.SQLitePipeline": 300,
}
```

::: tip 管道选型
轻量存 CSV/JSON 用内置导出（-O 参数）；正式项目 SQLite → MySQL/PostgreSQL；海量非结构化（原文、截图）配 MongoDB。Pipeline 与存储的更多细节见[反爬与存储](./18-crawler-anti-storage.md)。
:::

## 六、settings.py：必懂的核心配置

```python
# settings.py —— 按重要度注释

# 1. 礼貌抓取（生产必开）
ROBOTSTXT_OBEY = True              # 遵守 robots.txt（合规默认）
CONCURRENT_REQUESTS = 8            # 全局并发（对单站 8~16 足够）
DOWNLOAD_DELAY = 1                 # 每次请求间隔 1s（并发下也生效）
RANDOMIZE_DOWNLOAD_DELAY = True    # 间隔随机化 0.5~1.5 倍（默认 True）

# 2. 自动限速（推荐替代固定 delay：根据服务器响应快慢自适应）
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 1
AUTOTHROTTLE_MAX_DELAY = 10

# 3. 身份伪装
DEFAULT_REQUEST_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0",
    "Accept": "text/html,application/xhtml+xml",
}
USER_AGENT = "Mozilla/5.0 ..."     # 优先级高于 headers 里的 UA

# 4. 重试与超时
RETRY_ENABLED = True
RETRY_TIMES = 3
DOWNLOAD_TIMEOUT = 15

# 5. 断点续爬：指定 job 目录，Ctrl+C 中断后重启接着爬
# JOB = "jobs/quotes_job"          # 运行时: scrapy crawl quotes -s JOB=jobs/qj

# 6. 日志
LOG_LEVEL = "INFO"                 # DEBUG/INFO/WARNING/ERROR
```

**断点续爬**是 Scrapy 杀手级能力：请求队列和去重指纹持久化在 job 目录，中断后重启自动从断点继续——几百万 URL 的任务跑三天三夜也不怕。

## 七、Spider 家族与进阶模式

### 7.1 分页 + 详情页：两段回调

列表页抓「链接」，详情页抓「数据」——用不同 callback：

```python
class BookSpider(scrapy.Spider):
    name = "books"
    start_urls = ["https://books.toscrape.com/"]

    def parse(self, response):
        """列表页：只负责发现详情页链接"""
        for href in response.css("h3 a::attr(href)").getall():
            yield response.follow(href, callback=self.parse_detail)

        next_page = response.css("li.next a::attr(href)").get()
        if next_page:
            yield response.follow(next_page, callback=self.parse)

    def parse_detail(self, response):
        """详情页：提取完整字段"""
        yield {
            "title": response.css("h1::text").get(),
            "price": response.css("p.price_color::text").get(),
            "desc": response.css("#product_description ~ p::text").get(),
        }
```

**回调链还可以更长**（parse → parse_detail → parse_reviews），每个 Request 带着自己的 callback——这就是「事件驱动」在爬虫里的样子。

### 7.2 CrawlSpider：规则化整站爬取

「跟随所有匹配 X 的链接」类需求用 CrawlSpider 声明式搞定：

```python
from scrapy.linkextractors import LinkExtractor
from scrapy.spiders import CrawlSpider, Rule


class ArticleSpider(CrawlSpider):
    name = "articles"
    allowed_domains = ["example.com"]
    start_urls = ["https://www.example.com/"]

    rules = [
        # 匹配 /article/xxx 的链接 → 用 parse_article 解析；follow 继续从响应里提取链接
        Rule(LinkExtractor(allow=r"/article/[\w-]+"),
             callback="parse_article", follow=True),
        # 列表页只跟随不解析
        Rule(LinkExtractor(allow=r"/list/\d+"), follow=True),
    ]

    def parse_article(self, response):
        yield {"title": response.css("h1::text").get()}
```

### 7.3 中间件：全局改请求（UA 轮换 / 代理）

```python
# middlewares.py
import random


class RotateUserAgentMiddleware:
    UA_POOL = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/17.4",
        "Mozilla/5.0 (X11; Linux x86_64) Firefox/127.0",
    ]

    def process_request(self, request, spider):
        request.headers["User-Agent"] = random.choice(self.UA_POOL)
        # 代理：request.meta["proxy"] = "http://1.2.3.4:8080"


# settings.py
DOWNLOADER_MIDDLEWARES = {
    "demo.middlewares.RotateUserAgentMiddleware": 400,
}
```

中间件的 `process_request` / `process_response` / `process_exception` 钩子在**每个请求**上触发，是挂 UA 轮换、代理池、重定向处理的统一入口（更多反爬手段见[下一篇](./18-crawler-anti-storage.md)）。

## 八、调试技巧

```sh
# 交互式 shell：在「某个已下载的响应」里现场试验选择器 —— 开发效率之王
scrapy shell "https://quotes.toscrape.com/"
>>> response.css("span.text::text").get()
'"The world as we have created it..."'
>>> view(response)        # 浏览器打开响应，所见即爬虫所得

# 只跑局部：parse 一层不跟进
scrapy crawl quotes -o test.json --nolog -L WARNING

# 日志定位：过滤单个 Spider 的输出
scrapy crawl quotes -L DEBUG 2>&1 | grep -i retry
```

**开发流程建议**：先 `scrapy shell` 调通选择器 → 写 Spider → 小范围跑（限制条数）→ 开 Pipeline 全量。别上来就全量跑，等基本错误（路径写错、编码问题）暴露完再说。

## 九、什么时候用 Scrapy，什么时候不用

**用 Scrapy**：整站爬取 / URL 量级上千 / 需要断点续爬、监控、失败恢复 / 团队协作需要统一结构 / 需要分布式（scrapy-redis）。

**不用 Scrapy**：单接口调用、几十个页面（requests 十行搞定，上框架是杀鸡用牛刀）；深度依赖 JS 渲染的站点（Scrapy 也不带浏览器，虽然可以配 scrapy-playwright 集成，但复杂度不如直接用 Playwright 脚本）。

**判断标准：问题的规模和持久性**。一次性小活用脚本，长期项目用框架。

## 十、本篇小结

- Scrapy = 工程化爬虫框架：调度、并发、重试、去重、断点续爬全内置
- 架构五组件：Engine 搬运、Scheduler 排队去重、Downloader 下载、**Spider（你写）解析**、Pipeline 处理数据
- 核心心法：**只定义「怎么解析一页」，yield Item + Request 驱动整个流程**
- 选择器：`css()` + `::text` + `get()/getall()`，get 不抛异常
- Pipeline 责任链 + settings 数字定序；`-s JOB=...` 断点续爬
- 两段回调处理「列表 → 详情」，CrawlSpider 处理规则化整站
- `scrapy shell` 是调试之王；规模决定要不要用框架

下一篇：[反爬对抗与数据存储](./18-crawler-anti-storage.md)——被封 IP 怎么办、TLS 指纹识别是什么、代理池怎么搭、抓到的数据怎么存。
