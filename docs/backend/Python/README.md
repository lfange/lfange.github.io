---
icon: simple-icons:python
title: Python
category:
  - 后端
tag:
  - Python
---

# Python 从入门到精通

一套从零基础到企业级项目实战的 Python 完整学习教程，涵盖**语言特性、标准库、Web 开发、并发编程、测试与工程化部署、网络爬虫**。每篇都配有可运行案例与输出，循序渐进。

## 学习路线

### 第一部分：入门基础

- [01 环境配置与工程化](./01-env-setup.md) —— 解释器安装、虚拟环境、pip/Poetry、IDE 配置、镜像源
- [02 语言基础](./02-basics.md) —— 变量、数据类型、运算符、流程控制、字符串与 f-string
- [03 数据结构](./03-data-structures.md) —— 列表、元组、字典、集合、推导式与解包
- [04 函数与模块](./04-functions-and-modules.md) —— 参数传递、lambda、作用域、模块与包

### 第二部分：进阶特性

- [05 面向对象编程](./05-oop.md) —— 类与对象、继承、多态、魔法方法、描述符、数据类
- [06 高级语言特性](./06-advanced-features.md) —— 闭包、装饰器、生成器、迭代器、上下文管理器、元类
- [07 异常处理与文件 IO](./07-exceptions-and-io.md) —— 异常体系、自定义异常、文件读写、pathlib、序列化
- [08 并发编程](./08-concurrency.md) —— 多线程、多进程、asyncio、GIL 原理与选型

### 第三部分：实战应用

- [09 标准库精选](./09-stdlib.md) —— os/sys/collections/itertools/functools/datetime/re/json 等
- [10 Web 开发](./10-web-development.md) —— Flask 与 FastAPI 实战、RESTful API、中间件
- [11 测试](./11-testing.md) —— pytest、fixture、mock、覆盖率与 TDD
- [12 企业级项目实战](./12-enterprise-project.md) —— 分层架构、配置管理、日志、SQLAlchemy ORM、Docker、CI/CD
- [13 性能优化与最佳实践](./13-performance.md) —— 性能分析、优化技巧、类型提示、PEP 规范

### 第四部分：爬虫实战

- [14 爬虫基础与 HTTP 协议](./14-crawler-http-basics.md) —— HTTP 报文、状态码、请求头、DevTools 抓包分析、robots.txt 与合规
- [15 requests 进阶与页面解析](./15-crawler-requests-parsing.md) —— Session 登录态、代理与重试、BeautifulSoup/XPath、静态页实战
- [16 动态页面与接口爬取](./16-crawler-dynamic.md) —— XHR 接口分析、httpx 异步爬虫、Playwright 渲染与网络拦截
- [17 Scrapy 框架实战](./17-crawler-scrapy.md) —— 架构组件、Spider/Pipeline/中间件、断点续爬、并发调优
- [18 反爬对抗与数据存储](./18-crawler-anti-storage.md) —— 反爬三层识别、代理池、TLS 指纹、SQLite/MongoDB 存储、增量爬取、法律合规

## 学习建议

1. **入门篇务必动手敲一遍**：Python 是 REPL 友好的语言，打开 `python` 交互式终端边读边试，效果最好。
2. **进阶篇是分水岭**：装饰器、生成器、上下文管理器是 Python 的"灵魂特性"，理解后看主流框架源码会豁然开朗。
3. **实战篇以项目为导向**：第 12 篇给出一个完整的企业级项目骨架，建议 clone 下来跑通，再按需改造。

## 版本约定

本教程基于 **Python 3.12+**，部分特性（如 match-case、类型参数语法、`tomllib`）需要 3.10+ 才支持，文中会标注最低版本要求。

## 参考资料

- [Python 官方文档](https://docs.python.org/zh-cn/3/)
- [PEP 索引](https://peps.python.org/)
- [Real Python 教程](https://realpython.com/)
- [Awesome Python](https://github.com/vinta/awesome-python)
