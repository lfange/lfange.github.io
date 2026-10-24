---
title: 爬虫基础与 HTTP 协议
category:
  - 后端
tag:
  - Python
  - 爬虫
---

# 爬虫基础与 HTTP 协议

本篇是《Python 从入门到精通》第 14 篇，爬虫系列的开篇。爬虫的本质只有一句话：**用程序模拟浏览器（或任何 HTTP 客户端）发起请求、解析响应、提取数据**。所以想把爬虫写好，HTTP 协议必须吃透——本篇先打地基，后面的 requests、动态渲染、Scrapy 全部建立在这些概念之上。

---

## 一、爬虫是什么：一次完整的浏览器行为拆解

你在地址栏输入 URL 按下回车，浏览器做了这些事：

```
1. DNS 解析        www.example.com → 93.184.216.34
2. 建立 TCP 连接    三次握手（HTTPS 再加 TLS 握手）
3. 发送 HTTP 请求   GET / HTTP/1.1 + 一堆请求头
4. 等待服务器响应   状态行 + 响应头 + 响应体（HTML）
5. 浏览器解析 HTML  遇到 <img>/<script>/<link> 再发起新请求
6. 渲染页面 + 执行 JS（JS 可能再发起 Ajax 请求，动态加载数据）
```

爬虫做的事是 **3 + 4 + 手动做 5**（解析 HTML 提取数据），必要时还要模拟 6（数据由 JS 动态生成时）。理解这条链路，就能回答爬虫学习的三大核心问题：

| 现象 | 原因 | 对策（对应后续篇章） |
| ---- | ---- | ---- |
| 请求返回 403/418 | 服务器发现客户端不是浏览器 | 伪造 Headers（本篇 + 15 篇） |
| 响应里没有想要的数据 | 数据由 JS 发起 Ajax 动态加载 | 分析接口 / 渲染引擎（16 篇） |
| 请求几次就被封 IP | 频率过高触发风控 | 代理池 + 限速（18 篇） |

## 二、HTTP 协议核心：请求与响应

### 2.1 一次完整的 HTTP 报文

用 `curl -v https://httpbin.org/get`（或浏览器 DevTools）可以看到原始报文。**请求**长这样：

```http
GET /get HTTP/1.1                    ← 请求行：方法 路径 版本
Host: httpbin.org                    ← 以下全部是请求头
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...
Accept: text/html,application/xhtml+xml
Accept-Language: zh-CN,zh;q=0.9
Cookie: session_id=abc123            ← 请求头结束后一个空行，然后是请求体（GET 通常没有）
```

**响应**长这样：

```http
HTTP/1.1 200 OK                      ← 状态行：版本 状态码 短语
Content-Type: application/json       ← 响应头
Content-Length: 287
Set-Cookie: token=xyz; Path=/; HttpOnly

{ "origin": "1.2.3.4", "headers": {...} }   ← 响应体
```

爬虫代码里的每一个参数（headers、cookies、params）最终都会变成上面报文里的某一行。**调试爬虫的黄金手段：对比「浏览器发的报文」和「程序发的报文」差在哪**。

### 2.2 常见请求方法

| 方法 | 语义 | 爬虫场景 |
| ---- | ---- | ---- |
| GET | 获取资源 | 90% 的爬虫请求；参数拼在 URL query 上 |
| POST | 提交数据 | 登录表单、搜索接口、翻页参数放在 body 里 |
| PUT / DELETE / PATCH | 修改/删除 | Restful 接口，爬虫少用 |

::: warning GET 和 POST 的真正区别
不是「GET 不能带 body、POST 更安全」这种表层差异。语义上 GET 是幂等的获取，POST 是会产生副作用的提交。对爬虫的实际影响：**GET 参数暴露在 URL 里（好构造、好缓存），POST 参数在 body 里（要看 Content-Type，如 `application/x-www-form-urlencoded` 或 `application/json`，格式错了服务器直接解析失败）**。
:::

### 2.3 状态码：服务器在跟你说话

| 状态码 | 含义 | 爬虫应对 |
| ---- | ---- | ---- |
| 200 | 成功 | 解析响应 |
| 301 / 302 | 永久/临时重定向 | requests 自动跟随（默认 `allow_redirects=True`），但要小心重定向丢失 POST body |
| 304 | Not Modified | 协商缓存命中，配合 If-None-Match 使用，是增量爬取的利器 |
| 403 | Forbidden | **反爬最常见**：UA 被识别、缺少 Referer、IP 被封 |
| 404 | 资源不存在 | 跳过并记录，别重试 |
| 418 | I'm a teapot | 彩蛋码，部分网站（如豆瓣）拿它当反爬暗号 |
| 429 | Too Many Requests | 触发限流：降低频率、加代理、读 Retry-After 头等待 |
| 500 / 502 / 503 | 服务器错误 | 503 常伴随反爬（认证失败），值得重试几次 |

**经验法则：4xx 是「你的问题」（改请求），5xx 是「它的问题」（可重试）**。其中 403 和 429 是爬虫工程师每天打交道最多的两个码。

### 2.4 必须认识的请求头

服务器靠请求头判断「你是谁、从哪来」，也是反爬的第一道防线。按重要性排序：

```python
headers = {
    # 身份标识：不设或设成 python-requests/x.x 会被很多站直接拒绝
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    # 来源页：图片防盗链、接口防盗链几乎都查它
    "Referer": "https://www.example.com/index.html",
    # 想要的内容类型，告诉服务器「我是浏览器」而不是别的客户端
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    # 语言、编码，中文站常需要
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
}
```

- **User-Agent（UA）**：标识客户端。Python 的 `requests` 默认 UA 是 `python-requests/2.x`，等于自报家门「我是爬虫」。
- **Referer**：从哪个页面跳转而来。图片站、漫画站、视频站的资源 URL 直接访问 403，带上 Referer 就通了——**防盗链的本质是检查 Referer**。
- **Cookie**：登录态的载体。带上 Cookie 服务器才认为你「已登录」。

::: tip 反爬视角
把请求头补得「像浏览器」是性价比最高的伪装。但现代风控（如某书、某宝）会做 **TLS 指纹检测**（JA3）：Python 的 TLS 握手特征和 Chrome 不一样，头补得再全也能被识别出来。这类站点需要 `curl_cffi` 等模拟浏览器 TLS 指纹的库（18 篇详述）。
:::

### 2.5 Cookie 与 Session：登录态是怎么回事

HTTP 是**无状态**协议——服务器默认不记得你是谁。登录的实现机制：

```
1. 客户端 POST 账号密码
2. 服务器验证通过，生成 session（服务端存储），返回 Set-Cookie: session_id=xxx
3. 浏览器自动保存 Cookie，之后每个请求自动带上
4. 服务器靠 Cookie 里的 session_id 认出你
```

爬虫处理登录态的两种方式：

```python
# 方式一：浏览器登录后，把 Cookie 整个复制进代码（简单直接，最常用）
headers = {"Cookie": "session_id=xxx; token=yyy"}

# 方式二：程序模拟登录请求，从响应中拿 Set-Cookie（详见 15 篇 Session）
```

## 三、Chrome DevTools：爬虫的第一工具

不会抓包分析 = 不会爬虫。以 Chrome 为例（F12 打开），爬虫最常用的四个面板：

| 面板 | 用途 | 关键操作 |
| ---- | ---- | ---- |
| **Network** | 分析所有网络请求，**找数据接口的主战场** | 勾选 Preserve log（跳转不丢记录）、Filter 选 XHR/Fetch、右键 Copy as cURL |
| **Elements** | 查看 DOM 结构，写选择器的依据 | 右键元素 → Copy → Copy selector / XPath |
| **Console** | 试验 JS、观察变量 | 可直接 `$x('//div')` 试验 XPath |
| **Sources** | 断点调试 JS，破解加密参数时用 | 搜索关键词（如 sign、token）定位加密函数 |

### 3.1 「数据到底在哪」的标准排查流程

打开目标页面 → F12 → Network → 刷新 → 在 Filter 里搜数据关键词（比如页面显示的商品价格「299」）：

```
情形 A：响应在 Doc（第一个文档请求）里
        → 静态页面，直接 requests + 解析 HTML（15 篇）

情形 B：搜到某个 XHR/Fetch 请求，它的 Response 是 JSON，数据就在里面
        → 接口爬取，比解析 HTML 又快又稳（16 篇）—— 最理想的情况

情形 C：JS 加密/混淆，请求参数带 sign、_token 且会变化
        → 逆向 JS 或直接上渲染引擎（16 篇 + 18 篇）
```

::: tip 优先级永远是：接口 > 静态 HTML > 渲染引擎
能用 JSON 接口绝不解析 HTML（接口稳定、结构干净、性能高）；能解析 HTML 绝不开浏览器渲染（渲染比纯 HTTP 请求慢一个数量级还吃内存）。
:::

### 3.2 Copy as cURL：你的请求「标准答案」

Network 面板右键任意请求 → Copy → **Copy as cURL (bash)**，得到该请求的完整复刻（含全部 headers/cookies）。它有两个用途：

1. 直接在终端执行，验证「只靠这些参数能否拿到数据」（剔除无关变量）
2. 粘贴到 [curlconverter.com](https://curlconverter.com/) 一键转成 Python requests 代码，再删减无关头，找出**最小区间**——哪些头是必须的、哪些可以不带。这是逆向请求的最高效路径。

## 四、第一个爬虫：从 urllib 到 requests

### 4.1 标准库 urllib（了解即可）

Python 自带，零依赖，但 API 反人类：

```python
from urllib.request import Request, urlopen
from urllib.parse import quote

# 中文需要手动 URL 编码，requests 会自动做
url = "https://www.baidu.com/s?wd=" + quote("Python 爬虫")

req = Request(url, headers={"User-Agent": "Mozilla/5.0"})  # UA 必须自己塞进 Request
with urlopen(req, timeout=10) as resp:
    print(resp.status)                 # 200
    html = resp.read().decode("utf-8") # 字节要手动解码
print(len(html))
```

结论：**知道它存在即可，生产一律用 requests**（本系列示例全部基于 requests/httpx）。

### 4.2 requests 版本（三行起步）

```python
import requests

resp = requests.get("https://httpbin.org/get", timeout=10,
                    headers={"User-Agent": "Mozilla/5.0"})
print(resp.status_code)   # 200
print(resp.json())        # 自动反序列化 JSON
print(resp.headers)       # 响应头，CaseInsensitiveDict（大小写不敏感）
```

`resp` 对象的常用成员：

```python
resp.text          # 响应体 str（按 charset 解码，可 resp.encoding = "utf-8" 强制指定）
resp.content       # 响应体 bytes（下载图片/文件用它）
resp.json()        # 解析 JSON → dict/list
resp.status_code   # 状态码
resp.url           # 最终 URL（跟随重定向之后）
resp.cookies       # 响应中的 Cookie
```

### 4.3 完整示例：抓取一个真实页面

以抓取 [httpbin.org](https://httpbin.org/html) 的标题为例，走通「请求 → 编码 → 提取」全流程：

```python
import re
import requests

def fetch_title(url: str) -> str:
    resp = requests.get(url, timeout=10, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    })
    resp.raise_for_status()          # 非 2xx 直接抛 HTTPError，尽早失败
    resp.encoding = resp.apparent_encoding  # 防中文乱码：按内容探测编码
    # 正则提取 <title>（正式解析用 BeautifulSoup，下篇讲）
    m = re.search(r"<title>(.*?)</title>", resp.text, re.S)
    return m.group(1).strip() if m else ""

print(fetch_title("https://httpbin.org/html"))  # Moby Dick 之类
```

三个工程习惯从第一天就要养成：

1. **`timeout` 永远显式传**——requests 默认**无超时**，网络卡住会让整个爬虫永久挂起
2. **`raise_for_status()` 尽早失败**——拿到 403 还继续解析只会得到误导性的空结果
3. **`resp.encoding = resp.apparent_encoding`**——中文网站乱码的头号解决方案（服务器声明的 charset 与实际不符时，`apparent_encoding` 用 chardet 思路从内容推断真实编码）

## 五、抓取策略与 robots.txt：先讲清楚边界

写爬虫之前必须建立合规意识，这不是免责声明，是工程师的职业素养：

### 5.1 robots.txt：网站的爬虫公约

`https://目标站/robots.txt` 是站点声明「允许/禁止爬什么」的约定文件：

```
User-agent: *            # 对所有爬虫生效
Disallow: /admin/        # 禁止爬后台
Disallow: /search        # 禁止爬搜索

User-agent: Googlebot    # 单独对 Google 开放
Allow: /
```

搜索引擎遵守它（Googlebot、Bingbot），requests 写的爬虫默认不遵守，但**正规项目应该遵守**——它反映了站点运营者的意愿。用标准库检查：

```python
from urllib.robotparser import RobotFileParser

rp = RobotFileParser()
rp.set_url("https://www.example.com/robots.txt")
rp.read()
print(rp.can_fetch("*", "https://www.example.com/page/1"))  # True/False
```

### 5.2 法律与道德红线（中国语境）

| 行为 | 风险等级 |
| ---- | ---- |
| 抓取公开数据、自用学习、控制频率 | 低（注意仍需遵守 ToS） |
| 抓取后公开传播/转卖数据 | 中高，可能侵犯著作权、不正当竞争 |
| 破解登录/付费墙、绕过技术措施抓非公开数据 | 高，可能触犯《刑法》285 条「非法获取计算机信息系统数据罪」 |
| 抓取并倒卖个人身份信息（手机号、住址） | 极高，触犯《个人信息保护法》《数据安全法》 |

**三条自律底线**：不碰个人隐私数据；不破解认证机制；请求频率把目标站当自己家服务器心疼（错峰、限速、避开高峰）。实践中「写代码爬」往往不是问题，「爬了之后干什么」才是问题。

### 5.3 礼貌抓取的最小清单

```python
import time
import random

def polite_get(url: str) -> requests.Response:
    resp = requests.get(url, timeout=10, headers=HEADERS)
    time.sleep(random.uniform(1, 3))   # 随机间隔 1~3s，避免固定节奏被识别
    return resp
```

- 固定 1s 间隔的机器特征比随机 0.5~3s 更明显——**人类操作是不均匀的**
- 夜间抓取对目标站压力小（避开其业务高峰）
- 站点有sitemap.xml / RSS / 开放 API 时，优先用它们——这是官方提供的数据通道

## 六、本篇小结与下一步

本篇建立了爬虫的核心心智模型：

- 爬虫 = 模拟 HTTP 请求 + 解析响应，**HTTP 报文的每一行都可能影响成败**
- 状态码会说话：403 查伪装、429 降频率、5xx 可重试
- DevTools 的 Network 面板是主战场：**接口 > 静态 HTML > 渲染**的优先级铁律
- timeout / raise_for_status / apparent_encoding 三个习惯从第一天养成
- robots.txt 与三条法律红线，合规是工程能力的一部分

下一篇：[requests 进阶与页面解析](./15-crawler-requests-parsing.md)——Session 保持登录态、代理与重试、BeautifulSoup/XPath 提取数据，完成第一只「合格」的爬虫。
