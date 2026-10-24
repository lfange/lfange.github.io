---
title: requests 进阶与页面解析
category:
  - 后端
tag:
  - Python
  - 爬虫
---

# requests 进阶与页面解析

本篇是《Python 从入门到精通》第 15 篇。上篇解决了「把请求发出去」，本篇解决两件事：**把请求发得像一个真正的客户端**（Session、代理、重试），以及**把数据从 HTML 里干净地提出来**（re / BeautifulSoup / lxml / XPath）。读完可以独立完成一只静态页面爬虫。

---

## 一、requests 核心进阶

### 1.1 params 与 data：两种传参方式

```python
import requests

# GET：params 自动做 URL 编码并拼接到 query string
resp = requests.get(
    "https://httpbin.org/get",
    params={"wd": "Python 爬虫", "page": 1},
    timeout=10,
)
# 实际请求 https://httpbin.org/get?wd=Python%20%E7%88%AC%E8%99%AB&page=1
print(resp.json()["args"])

# POST 表单：data → Content-Type: application/x-www-form-urlencoded
resp = requests.post("https://httpbin.org/post", data={"user": "lf", "pwd": "123"}, timeout=10)

# POST JSON：json= → Content-Type: application/json（现代接口的主流）
resp = requests.post("https://httpbin.org/post", json={"user": "lf", "pwd": "123"}, timeout=10)
```

`data=` 和 `json=` 的区别是新手第一大坑：**表单登录用 `data`，调用 API 用 `json`**，搞反了服务器解析不出参数（Debug 面板里看请求体就能发现）。

### 1.2 Session：登录态的正确打开方式

普通 `requests.get()` 每次都是全新连接，**服务器 Set 的 Cookie 下一次请求不会自动带上**。`requests.Session` 解决三件事：

1. **自动管理 Cookie**：响应里的 `Set-Cookie` 自动存，后续请求自动带
2. **复用 TCP 连接**（连接池）：抓 100 个页面不用握 100 次手，速度快得多
3. **统一默认配置**：headers、代理、超时设置一次，全程生效

```python
import requests

session = requests.Session()
session.headers.update({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                  " AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36",
    "Referer": "https://www.example.com",
})

# 第一步：模拟登录（假设是表单接口）
login_resp = session.post(
    "https://www.example.com/login",
    data={"username": "user", "password": "pass"},
    timeout=10,
)

# 第二步：之后的所有请求自动携带服务器下发的 Cookie —— 登录态保持
profile = session.get("https://www.example.com/profile", timeout=10)
print(session.cookies.get_dict())   # 查看当前持有的 Cookie
```

**Session 是爬虫项目的标准姿势**——除非一次性抓单个页面，否则永远用 Session 而不是裸函数调用。

### 1.3 模拟登录实战：从抓包到代码

以典型的「登录后才能看数据」站点为例，流程：

```
1. DevTools → Network → 勾选 Preserve log → 手动登录一次
2. 找到登录请求（通常是 POST /login）
3. 看它的表单字段：可能不止用户名密码
   —— 常见隐藏字段：csrf_token、lt、execution（防止 CSRF 攻击的一次性令牌）
4. 先 GET 登录页，从 HTML 里解析出这些隐藏字段，再连同账密一起 POST
```

```python
import re
import requests

session = requests.Session()
BASE = "https://quotes.toscrape.com"   # 免费练习站，内置登录

# 1. GET 登录页，提取 csrf token
page = session.get(f"{BASE}/login", timeout=10)
token = re.search(r'name="csrf_token" value="([^"]+)"', page.text).group(1)

# 2. 带着 token 提交登录
session.post(f"{BASE}/login", data={
    "csrf_token": token,
    "username": "admin",
    "password": "admin",
}, timeout=10)

# 3. 访问登录后才可见的页面
resp = session.get(f"{BASE}/", timeout=10)
print("Goodreads" in resp.text)   # True —— 登录成功后页面出现注销按钮
```

这个「**先 GET 拿令牌 → 再 POST 登录**」的两段式，是表单类登录的通用解法。若登录由 JS 加密（密码 RSA/AES 加密后提交），就进入逆向领域（18 篇）。

### 1.4 代理：换一个 IP 出门

```python
proxies = {
    "http": "http://127.0.0.1:7890",     # HTTP 代理
    "https": "http://127.0.0.1:7890",    # 注意：这里 http:// 指代理协议，走的流量仍是 https
}
resp = requests.get("https://httpbin.org/ip",
                    proxies=proxies, timeout=10)
print(resp.json())   # origin 变成代理的 IP
```

带账号密码的代理：

```python
proxies = {"https": "http://user:password@1.2.3.4:8080"}
```

::: warning 常见误区
`https` 键的值写 `https://` 开头往往连不上——**键是目标流量的协议，值是代理服务器的协议**，市面代理基本都是 HTTP 协议的代理服务器（即使用来代理 HTTPS 流量）。连不通时先试试把值的协议改成 `http://`。
:::

### 1.5 重试与鲁棒性：生产级请求封装

网络抖动、偶发 502 是常态。用 `urllib3` 的 `Retry` 做指数退避重试：

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def make_session() -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=3,                          # 最多重试 3 次
        backoff_factor=0.5,               # 退避：0.5s → 1s → 2s
        status_forcelist=[429, 500, 502, 503, 504],  # 这些状态码才值得重试
        allowed_methods=["GET", "HEAD"],  # 只重试幂等方法（POST 重试可能重复下单）
    )
    adapter = HTTPAdapter(max_retries=retry,
                          pool_connections=10, pool_maxsize=10)  # 连接池
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({"User-Agent": "Mozilla/5.0"})
    return session

session = make_session()
resp = session.get("https://httpbin.org/status/503", timeout=10)
# 抛出 MaxRetryError —— 4 次尝试后放弃，避免静默失败
```

把这个封装存成工具模块，所有爬虫项目复用。**要点**：重试只针对幂等请求与瞬时故障；4xx（除了 429）重试是浪费，403 重试只会封得更狠。

## 二、解析利器：从正则到 XPath

拿到 HTML 后如何提取数据？三条技术路线：

| 工具 | 上手难度 | 速度 | 适用 |
| ---- | ---- | ---- | ---- |
| `re` 正则 | 高（易碎） | 快 | 规则简单的文本、JSONP、script 标签里的数据 |
| `BeautifulSoup` | 低 | 慢（纯 Python） | 快速原型、结构简单页面 |
| `lxml` / XPath | 中 | **最快**（C 实现） | 生产主力、复杂页面 |

### 2.1 正则：能用但不推荐

```python
import re

html = '<a href="/book/123" title="三体">三体</a>'
m = re.search(r'href="([^"]+)" title="([^"]+)"', html)
print(m.groups())   # ('/book/123', '三体')
```

正则解析 HTML 的致命问题：**HTML 不是正则语言**。属性顺序一变、多一个空格、换行风格一改，正则就碎。仅用于：script 标签内嵌 JSON（`re.search(r'window\.__DATA__ = (\{.*?\});')`）这类「文本模式明确」的场景。

### 2.2 BeautifulSoup：原型神器

```python
from bs4 import BeautifulSoup
import requests

resp = requests.get("https://quotes.toscrape.com/", timeout=10)
soup = BeautifulSoup(resp.text, "lxml")   # 指定 lxml 解析器（快且容错好）

# ---- 四种查找方式 ----
soup.find("h1")                       # 第一个 h1 标签
soup.find_all("a", class_="tag")      # 所有 class 含 tag 的 <a>（class 是关键字，加下划线）
soup.select("div.quote > span.text")  # CSS 选择器（前端同学零成本上手）
soup.select_one("h1 a")

# ---- 取值的三个 API ----
tag = soup.find("a", class_="author")
tag.get("href")        # 属性值
tag.text               # 所有子孙节点的文本拼接（自动 strip 可用 .get_text(strip=True))
tag["href"]            # 等价 get，但属性不存在时抛 KeyError
```

### 2.3 CSS 选择器速查（前端视角秒懂）

```python
soup.select("div.quote")                    # 标签
soup.select(".tags a")                      # class
soup.select("#header .nav li")              # id 后代
soup.select("div.quote > span")             # 直接子元素
soup.select("a[href^='/author']")           # 属性以…开头
soup.select("li:nth-child(2)")              # 第 2 个
```

### 2.4 lxml + XPath：生产主力 ⭐

XPath 是 XML/HTML 的查询语言，表达力比 CSS 强（**能向上找父节点、能取文本/属性、能写条件**），且 lxml 是 C 实现，速度比 BeautifulSoup 快 5~10 倍：

```python
from lxml import etree
import requests

resp = requests.get("https://quotes.toscrape.com/", timeout=10)
tree = etree.HTML(resp.text)

# 基础路径
tree.xpath("//h1/a/text()")                       # 所有 h1 下 a 的文本 → ['Quotes to Scrape']
tree.xpath("//div[@class='quote']")               # 所有 class=quote 的 div

# 提取一个条目的多个字段
quotes = []
for div in tree.xpath("//div[@class='quote']"):
    quotes.append({
        "text": div.xpath(".//span[@class='text']/text()")[0],   # .// 从当前节点向下找
        "author": div.xpath(".//small[@class='author']/text()")[0],
        "tags": div.xpath(".//a[@class='tag']/text()"),
    })
print(quotes[0])
# {'text': '“The world as we have created it...”', 'author': 'Albert Einstein',
#  'tags': ['change', 'deep-thoughts', 'thinking', 'world']}
```

### 2.5 XPath 核心语法表

| 表达式 | 含义 |
| ---- | ---- |
| `//div` | 全局所有 div（不管多深） |
| `/div` | 根节点的直接子 div |
| `.//span` | **从当前节点**出发的所有 span |
| `..` | 父节点（CSS 做不到！） |
| `@class` / `@href` | 属性 |
| `text()` | 文本节点 |
| `//div[@class='quote' and @id='q1']` | 多条件 |
| `//li[1]` / `//li[last()]` / `//li[position()<3]` | 下标筛选（从 1 开始！） |
| `//a[contains(@href, 'author')]` | 模糊匹配，**动态 class 的克星** |
| `//div[starts-with(@class,'quote-')]` | 前缀匹配 |

::: tip 获取 XPath 的捷径
DevTools → Elements → 右键节点 → Copy → **Copy XPath**。但自动生成的路径绝对定位（`/html/body/div[2]/div[1]...`），页面一改版就全废。**手写相对路径 + contains 模糊匹配**（如 `//div[contains(@class, 'quote')]`）抗改版能力最强。
:::

### 2.6 动态 class 与反爬加扰

不少站点（如某团、各类 Vue/React 应用）的 class 是构建时生成的（`quote_X3f2`、`css-1a2b3c`），每次发版都变。对策：

1. **不依赖 class，用结构定位**：`//div[2]/ul/li` 或稳定的 id/data-* 属性
2. **用 contains/startswith 匹配不变的前缀**：`//div[starts-with(@class, "quote")]`
3. **用文本定位**（最抗改版）：`//span[text()='下一页']`、`//a[contains(., '作者')]`

## 三、实战：书页翻页爬虫（完整项目）

综合运用本篇全部知识：Session + 解析 + 翻页 + 礼貌限速。目标站 [books.toscrape.com](https://books.toscrape.com)（官方练习站）：

```python
"""books.py —— 抓取 books.toscrape.com 全站书名与价格"""
import time
import random
from dataclasses import dataclass, asdict

import requests
from lxml import etree

BASE = "https://books.toscrape.com/catalogue/"


@dataclass
class Book:
    title: str
    price: float
    rating: int
    in_stock: bool


def parse_page(html: str) -> list[Book]:
    tree = etree.HTML(html)
    # class 含 price_color 的 p → 提取价格；rating 是 class="star-rating Three"
    rating_map = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}
    books = []
    for art in tree.xpath("//article[@class='product_pod']"):
        title = art.xpath(".//h3/a/@title")[0]
        price = float(art.xpath(".//p[@class='price_color']/text()")[0].strip("£"))
        rating_word = art.xpath(".//p[contains(@class,'star-rating')]/@class")[0].split()[-1]
        stock = "In stock" in art.xpath(".//p[@class='instock availability']/text()")[0]
        books.append(Book(title, price, rating_map[rating_word], stock))
    return books


def main() -> None:
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0"
    })
    all_books: list[Book] = []
    page = 1

    while True:
        url = f"{BASE}page-{page}.html"
        resp = session.get(url, timeout=10)
        if resp.status_code == 404:
            break   # 翻完了
        resp.raise_for_status()

        books = parse_page(resp.text)
        if not books:
            break
        all_books.extend(books)
        print(f"第 {page} 页: 抓到 {len(books)} 本")

        # 翻页发现的两种方式：解析 next 按钮 / 404 即止
        page += 1
        time.sleep(random.uniform(0.5, 1.5))   # 礼貌限速

    print(f"共 {len(all_books)} 本，示例: {asdict(all_books[0])}")


if __name__ == "__main__":
    main()
```

**代码结构值得注意**：`Book` dataclass 定义数据模型（比裸 dict 可维护），`parse_page` 纯函数（HTML 进、数据出，方便单测），`main` 只做调度。这个「**模型 / 解析 / 调度**」三层结构放大到 Scrapy 就是 Item / Spider / Pipeline（下下篇）。

## 四、本篇小结

- `data=` vs `json=` 两种请求体；`params` 自动 URL 编码
- **Session 三大价值**：自动 Cookie、连接池、统一配置——默认就用它
- 表单登录两段式：GET 拿 csrf token → POST 账密
- 代理键值语义：键=流量协议，值=代理协议
- 重试封装：只对幂等方法 + 瞬时故障，指数退避
- 解析选型：**原型用 BeautifulSoup，生产用 lxml + XPath**
- 动态 class 对策：结构定位 / contains / 文本定位

下一篇：[动态页面与接口爬取](./16-crawler-dynamic.md)——真实世界里一大半数据不在 HTML 里，而是 JS 发起的 XHR 请求返回的 JSON。分析接口、异步爬虫、Playwright 渲染，三管齐下。
