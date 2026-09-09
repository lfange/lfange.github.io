---
title: 数据库基础概念
icon: article
category:
  - Database
  - Guide
tag:
  - database
  - basics
---

# 数据库基础概念

## 什么是数据库

数据库（Database）是按照一定数据结构来组织、存储和管理数据的仓库。数据库管理系统（DBMS, Database Management System）是操作和管理数据库的软件，如 MySQL、PostgreSQL、Redis 等。

日常开发中所说的「数据库」通常指 DBMS。

### 为什么需要数据库

| 直接用文件存储的问题 | 数据库的解决方案 |
| --- | --- |
| 并发读写冲突 | 事务 + 锁机制保证一致性 |
| 数据量大了查询慢 | 索引（B+ 树、哈希等）加速查询 |
| 没有统一的查询方式 | SQL 标准语言 |
| 程序崩溃数据丢失 | 持久化（redo log、WAL） |
| 权限无法控制 | 用户/角色权限体系 |

## 数据库的分类

### 关系型数据库（RDBMS）

以**二维表**（行和列）组织数据，表与表之间可以通过外键关联。

代表产品：MySQL、PostgreSQL、Oracle、SQL Server、SQLite。

**优点：**

- 结构化强，数据完整性好（约束、外键、事务）
- 支持 SQL，查询能力强大
- 数据一致性强，适合金融、电商订单等场景

**缺点：**

- 水平扩展（加机器）较困难
- 表结构固定，灵活性差
- 高并发海量数据下读写性能有瓶颈

### 非关系型数据库（NoSQL）

不采用关系模型，常见四类：

| 类型 | 特点 | 代表产品 | 典型场景 |
| --- | --- | --- | --- |
| 键值型 | KV 存储，极快读写 | Redis、Memcached | 缓存、会话、计数器 |
| 文档型 | JSON 风格，模式灵活 | MongoDB、CouchDB | 内容管理、用户画像 |
| 列式存储 | 按列存储，利于聚合分析 | HBase、Cassandra | 日志、大数据分析 |
| 图数据库 | 节点+边，关系查询强 | Neo4j | 社交关系、推荐、风控 |

### NewSQL

兼具 NoSQL 的扩展性和关系型数据库的 ACID 能力，如 TiDB、CockroachDB、Google Spanner。国内使用 TiDB 较多。

## 关系模型核心概念

### 表、行、列

以一个用户表为例：

| id | name | age | email |
| --- | --- | --- | --- |
| 1 | Alice | 25 | alice@example.com |
| 2 | Bob | 30 | bob@example.com |

- **表（Table/关系）**：`users`
- **列（Column/属性）**：`id`、`name`、`age`、`email`，每列有数据类型
- **行（Row/元组）**：一条记录，如 `(1, 'Alice', 25, ...)`

### 常见术语

- **主键（Primary Key）**：唯一标识一行记录，非空且唯一，如 `id`
- **外键（Foreign Key）**：指向另一张表的主键，建立表间关联
- **候选键**：能够唯一标识一行的最小属性集合
- **超键**：包含候选键的任意属性集合
- **索引（Index）**：加速查询的数据结构（详见[索引篇](./04-mysql-storage-index.md)）

### 表间关系

- **一对一（1:1）**：用户 — 用户详情，可拆表存敏感字段
- **一对多（1:N）**：部门 — 员工，多方持外键
- **多对多（M:N）**：学生 — 课程，需中间表 `student_course`

```sql
-- 多对多通常用中间表
CREATE TABLE student_course (
  student_id BIGINT NOT NULL,
  course_id  BIGINT NOT NULL,
  PRIMARY KEY (student_id, course_id)
);
```

## 数据库设计三范式

范式是设计关系型数据库表结构的规范，目的是减少数据冗余。

### 第一范式（1NF）：字段原子性

每个字段不可再分。

```text
❌ 违反：contacts 字段存 "手机:138xxx,邮箱:a@x.com"
✅ 满足：拆成 phone、email 两个字段
```

### 第二范式（2NF）：消除部分依赖

在 1NF 基础上，非主键字段必须**完全依赖**于主键（针对联合主键）。

```text
❌ 违反：订单明细表 (order_id, product_id) 联合主键，
   但 product_name 只依赖 product_id（部分依赖）
✅ 满足：product_name 拆到商品表
```

### 第三范式（3NF）：消除传递依赖

在 2NF 基础上，非主键字段不能依赖于其他非主键字段。

```text
❌ 违反：员工表中有 dept_id、dept_name，
   dept_name 依赖 dept_id（传递依赖：emp → dept_id → dept_name）
✅ 满足：dept_name 拆到部门表
```

### 反范式

范式过高会导致多表 JOIN 频繁、查询变慢。实际生产中常**适当冗余**换查询性能：

```text
订单表冗余存 user_name、商品快照价格 —— 用空间换时间，避免 JOIN，
且历史订单不随商品改价而变化。
```

> 设计口诀：**先按三范式设计，再按查询需求适度反范式。**

## SQL 语言分类

| 分类 | 全称 | 作用 | 关键字 |
| --- | --- | --- | --- |
| DDL | Data Definition Language | 定义结构 | `CREATE`、`ALTER`、`DROP`、`TRUNCATE` |
| DML | Data Manipulation Language | 操作数据 | `INSERT`、`UPDATE`、`DELETE` |
| DQL | Data Query Language | 查询数据 | `SELECT` |
| DCL | Data Control Language | 控制权限 | `GRANT`、`REVOKE` |
| TCL | Transaction Control Language | 事务控制 | `COMMIT`、`ROLLBACK`、`BEGIN` |

## MySQL 体系结构概览

以最常用的 MySQL 为例，自上而下分为几层：

```text
┌─────────────────────────────────────┐
│  连接层：连接管理、认证鉴权、线程池      │
├─────────────────────────────────────┤
│  服务层：SQL 解析器、优化器、执行器      │
│         缓存（8.0 已移除查询缓存）      │
├─────────────────────────────────────┤
│  存储引擎层：InnoDB、MyISAM、Memory   │
│         （插件式，表级别可指定）        │
├─────────────────────────────────────┤
│  文件系统：数据文件、日志文件（redo/undo/binlog）│
└─────────────────────────────────────┘
```

- **Server 层**跨存储引擎，负责 SQL 解析与优化
- **存储引擎层**负责数据的存储与提取，InnoDB 是 5.5+ 的默认引擎

## 本系列导航

1. 数据库基础概念（本篇）
2. [SQL 基础语法](./02-sql-fundamentals.md)
3. [SQL 进阶查询](./03-sql-advanced.md)
4. [存储引擎与索引](./04-mysql-storage-index.md)
5. [事务、MVCC 与锁](./05-transaction-mvcc-lock.md)
6. [性能优化实战](./06-performance-optimization.md)
7. [高可用与分布式架构](./07-high-availability.md)
8. [运维与生产实践](./08-database-ops.md)
