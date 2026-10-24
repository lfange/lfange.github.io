---
icon: back-stage
title: Golang
category:
  - 后端
tag:
  - Golang
---

# Go 从入门到精通

一套从零基础到生产实战的 Go 完整学习教程，涵盖**语法基础、数据结构与指针、并发编程、错误处理、标准库、Web 框架（Gin）、ORM（GORM）、测试、项目工程化与性能调优**。每篇配有可运行示例与高频坑位标注。

> Go 语言一句话画像：**简洁、编译快、原生并发、直接部署单二进制**。它接受函数式编程的匿名函数与闭包、类似 C 的指针语法、类似 JS 数组的 slice；并以 goroutine/channel 实践「通过通信共享内存」的并发哲学——精小但强大。

## 学习路线

### 第一部分：入门基础

- [环境配置与工程化](./env-setup.md) —— 安装、环境变量、Go Modules、工具链、IDE、交叉编译
- [语法基础](./basics.md) —— 变量、常量、流程控制、函数、错误处理入门、defer、指针入门
- [数据结构与指针](./data-structures.md) —— 数组、slice 底层与扩容、map、struct、指针深入、JSON 处理

### 第二部分：语言进阶

- [并发编程](./concurrency.md) —— GMP 调度、goroutine、channel、sync、context、并发模式
- [高阶知识与常见坑](./advanced.md) —— 接口、泛型、反射、GC 三色标记、逃逸分析、pprof
- [错误处理](./error-handling.md) —— error 本质、%w/Is/As 三件套、panic/recover、错误分层设计
- [标准库精选](./stdlib.md) —— fmt/strings/slices/time/io/bufio/encoding-json/net-http/sync

### 第三部分：生产实战

- [Gin 深度指南](./gin.md) —— 路由、参数绑定与校验、中间件机制、优雅关停、路由工程化
- [GORM 深度指南](./gorm.md) —— 连接池、模型、CRUD、关联与 Preload、事务、Hook、坑大全
- [测试](./testing.md) —— 表驱动、testify、mock、httptest、benchmark、Fuzz
- [项目框架与工程实践](./project-layout.md) —— 分层架构、Gin+GORM 模板、中间件、JWT、日志、Makefile

## 学习建议

1. **入门篇动手优先**：Go 是为工程效率设计的语言，`go run` 即刻反馈，边读边写。
2. **并发是 Go 的灵魂**：goroutine/channel/context 是面试与实战的双重点，值得反复读。
3. **进阶篇是分水岭**：接口底层、逃逸分析、GC 决定你能否看懂框架源码与排查线上问题。
4. **实战篇按项目串联**：Gin + GORM + 分层架构三篇合起来是一个完整后端骨架。

## 版本约定

本教程基于 **Go 1.22+**（部分特性标注最低版本：泛型 1.18+、slices/maps 标准库 1.21+、路由参数 1.22+、`b.Loop` 1.24+）。

## 参考资料

::: details Go 资料

- [Go 中文官网](https://go-zh.org/)
- [Go by Example 中文版](https://gobyexample-cn.github.io/)
- [Go 入门指南](https://fuckcloudnative.io/the-way-to-go/)
- [Go 语言圣经](https://book.itsfun.top/gopl-zh/)
- [Go 语言中文文档](http://www.topgoer.com/)
- [Go2 编程指南](https://chai2010.cn/go2-book/)
- [Go 语言高级编程](https://chai2010.cn/advanced-go-programming-book/)
- [Go Web 编程](https://www.kancloud.cn/kancloud/web-application-with-golang/44105)
- [组织 Go 代码](https://blog.go-zh.org/organizing-go-code)
- [Go 切片：用法和本质](https://blog.go-zh.org/go-slices-usage-and-internals)
- [Go 面向包的设计和架构分层](https://github.com/danceyoung/paper-code/blob/master/package-oriented-design/packageorienteddesign.md)
- [更多](https://www.bookstack.cn/explore?cid=10&tab=popular)

:::

<details>
<summary>Gin</summary>

- [Gin 官方文档](https://gin-gonic.com/zh-cn/docs/)
- [Gin 中文文档](https://www.kancloud.cn/shuangdeyu/gin_book/949411)
- [gin-vue-admin](https://www.gin-vue-admin.com/)
- [轻量级 Web 框架 Gin 结构分析](http://blog.itpub.net/31561269/viewspace-2637490/)
- [更多](https://www.bookstack.cn/explore?cid=168)

</details>

<details>
<summary>Gorm</summary>

- [GORM 官方文档](https://gorm.io/zh_CN/)
- [GORM 中文文档](http://gorm.book.jasperxu.com/)

</details>

<details>
<summary>Swag</summary>

- [Swag 开源地址](https://github.com/swaggo/swag)
- [Swag 中文说明](https://github.com/swaggo/swag/blob/master/README_zh-CN.md)

</details>

<details>
<summary>数据库</summary>

- [PostgreSQL 官网](https://www.postgresql.org/)
- [PostgreSQL 教程](https://www.runoob.com/postgresql/postgresql-tutorial.html)
- [PostgreSQL 手册](http://www.postgres.cn/docs/13/)
- [PostgreSQL 新手入门](http://www.ruanyifeng.com/blog/2013/12/getting_started_with_postgresql.html)
- [更多](https://www.bookstack.cn/explore?cid=166)

---

- [MySQL](https://www.bookstack.cn/explore?cid=38)
- [SQLite](https://www.bookstack.cn/explore?cid=43)
- [Redis](https://www.bookstack.cn/explore?cid=42)

</details>

<details>
<summary>Elasticsearch</summary>

- [Elasticsearch 中文官网](https://www.elastic.co/cn/elasticsearch/)
- [Elasticsearch 下载地址](https://www.elastic.co/cn/downloads/elasticsearch)
- [Elasticsearch 权威指南](https://www.elastic.co/guide/cn/elasticsearch/guide/current/index.html)
- [Elasticsearch 参考文档](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)

</details>

<details>
<summary>Git + GitLab</summary>

- [Git 官方教程](https://git-scm.com/book/zh/v2)
- [Git 中文教程 - runoob](https://www.runoob.com/git/git-tutorial.html)
- [GitLab 官方教程](https://docs.gitlab.com/ee/README.html)

</details>
