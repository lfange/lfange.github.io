---
title: Python 爬虫：从入门到工程化
icon: spider
order: 1
category:
  - Python
  - 后端
tag:
  - Python 爬虫
  - Web Scraping
  - Scrapy
---

# Python 爬虫：从入门到工程化

爬虫是按照明确边界自动访问网络资源、解析内容并生成结构化数据的程序。真正可靠的爬虫，不只是“把页面下载下来”，还要处理授权、限速、失败恢复、数据质量、页面变化和长期运维。

> 爬虫系统 = 合法数据源 + 请求调度 + 内容解析 + 数据处理 + 存储 + 质量监控 + 安全边界

本专题只讨论公开允许或你有明确授权采集的数据。`robots.txt` 不是授权机制，允许抓取也不自动等于允许复制、再发布或处理个人信息；开始前仍要检查服务条款、版权、隐私和适用规则。

## 一张图理解完整链路

```mermaid
flowchart LR
    S[种子 URL / API] --> P[访问策略与 robots 检查]
    P --> Q[请求队列与去重]
    Q --> F[HTTP / 浏览器获取]
    F --> X[解析与字段提取]
    X --> V[清洗 / 校验 / 去重]
    V --> D[文件 / 数据库 / 对象存储]
    D --> M[质量监控与告警]
    M --> Q
```

## 学习地图

| 阶段       | 核心问题                                         | 章节                                           |
| ---------- | ------------------------------------------------ | ---------------------------------------------- |
| 入门       | HTTP、HTML 和第一个采集脚本怎么工作？            | [Python 与 Web 基础](./python-web-basics.md)   |
| 稳定请求   | 如何处理超时、会话、重试、编码和大文件？         | [Requests 与 HTTP](./requests-http.md)         |
| 提取数据   | CSS、XPath、JSON-LD 和数据清洗如何选择？         | [HTML 解析与数据提取](./parsing-extraction.md) |
| API 与状态 | 如何采集 JSON API、分页和授权会话？              | [API、分页与会话](./apis-sessions.md)          |
| 动态页面   | 什么时候才需要浏览器？Playwright 如何稳定等待？  | [动态网页与 Playwright](./dynamic-pages.md)    |
| 提升规模   | 线程、异步、队列、背压和分域限速怎么设计？       | [并发与调度](./concurrency-scheduling.md)      |
| 框架化     | Scrapy 的 Spider、Scheduler、Pipeline 如何协作？ | [Scrapy 工程化](./scrapy-engineering.md)       |
| 管理数据   | 如何设计 Schema、增量、幂等、版本和血缘？        | [数据存储与质量](./data-storage.md)            |
| 长期运行   | 如何测试解析器、发现页面漂移、部署和告警？       | [测试、监控与可靠性](./quality-reliability.md) |
| 守住边界   | 如何处理 robots、隐私、SSRF 和不可信内容？       | [合规、伦理与安全](./ethics-security.md)       |
| 综合实战   | 如何按阶段完成一个生产级项目？                   | [项目与进阶路线](./projects-roadmap.md)        |

## 工具如何选择

| 场景                       | 推荐起点                  | 说明                                    |
| -------------------------- | ------------------------- | --------------------------------------- |
| 少量静态页面               | Requests + Beautiful Soup | 容易理解和调试                          |
| 有稳定 JSON API            | Requests / aiohttp        | 直接消费结构化数据，通常比解析页面可靠  |
| XPath 或高性能解析         | lxml / Parsel             | 适合复杂结构和批量解析                  |
| JavaScript 动态渲染        | Playwright                | 浏览器成本高，应作为必要时的选择        |
| 多站点、递归抓取、长期任务 | Scrapy                    | 提供调度、去重、中间件、Pipeline 和统计 |
| 高并发 I/O                 | aiohttp / Scrapy          | 必须同时设置并发上限和每域名速率        |

工具不是成熟度等级。一个正确限速、可测试的 Requests 脚本，可能比配置失控的分布式爬虫更专业。

## 开发前的五个问题

1. **是否有权访问和保存？** 明确数据所有者、服务条款、隐私与版权边界。
2. **是否有官方 API、导出或开放数据集？** 有时根本不需要抓网页。
3. **更新要求是什么？** 一次性迁移、每日增量，还是近实时同步？
4. **数据质量如何验收？** 必填字段、准确率、完整率和新鲜度是多少？
5. **目标站点能承受什么速率？** 遵守 `robots.txt`、`Retry-After` 和站方给出的限制。

## 推荐工程结构

```text
crawler-project/
├── pyproject.toml
├── README.md
├── src/crawler/
│   ├── fetch.py          # 网络访问
│   ├── parse.py          # 无副作用解析
│   ├── models.py         # 数据模型
│   ├── pipeline.py       # 清洗、校验与存储
│   ├── policy.py         # robots、速率与允许域名
│   └── main.py           # 调度入口
├── tests/
│   ├── fixtures/         # 经过授权、脱敏的固定响应
│   └── test_parse.py
└── var/                  # 本地运行产物，不提交敏感数据
```

把“获取”和“解析”分开非常重要：解析函数只接收保存的响应并返回结构化对象，就可以离线测试，不必反复访问真实网站。

## 从入门到进阶的能力标准

- **入门**：能解释请求、响应、DOM、CSS 选择器和分页，完成小型静态站采集。
- **熟练**：能处理会话、API、动态页面、增量更新、重试、限速和数据校验。
- **进阶**：能设计 Scrapy 或异步架构，进行容量规划、漂移检测、监控和故障恢复。
- **工程化**：数据与代码可追溯，目标站点影响可控，任务可审计、可暂停、可回放。

## 权威资料

- [Requests 官方文档](https://requests.readthedocs.io/en/stable/)
- [Beautiful Soup 官方文档](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Playwright Python 官方文档](https://playwright.dev/python/docs/intro)
- [Scrapy 官方文档](https://docs.scrapy.org/en/latest/)
- [aiohttp 官方文档](https://docs.aiohttp.org/en/stable/)
- [Python urllib.robotparser](https://docs.python.org/3/library/urllib.robotparser.html)
- [RFC 9309：Robots Exclusion Protocol](https://www.rfc-editor.org/rfc/rfc9309.html)

> 最重要的进阶不是“突破更多限制”，而是用更少的请求获得更稳定、更可信、可合法使用的数据。
