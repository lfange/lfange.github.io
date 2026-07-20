# 数据库技术选型指南

## 关系型与非关系型数据库的全面分析

在软件开发中，数据库的选择对系统性能、可扩展性和维护成本有深远影响。本文将全面分析主流数据库类型的特点、适用场景及选择策略，帮助开发者做出明智的技术选型。

---

## 一、 数据库核心理论基础

在深入具体数据库之前，理解以下两个核心理论对于选型至关重要。

### 1.1 CAP 定理 (CAP Theorem)

分布式系统无法同时完全满足以下三个特性：

- **Consistency (一致性)**: 所有节点在同一时间看到相同的数据。
- **Availability (可用性)**: 每个请求都能收到成功或失败的响应（不保证是最新的数据）。
- **Partition Tolerance (分区容错性)**: 即使系统内部发生网络分区，系统仍能继续运行。

> **选型建议**：传统 RDBMS 通常倾向于 **CA**（单机）或 **CP**（分布式），而许多 NoSQL 数据库（如 Cassandra, CouchDB）则倾向于 **AP** 以获得极致的水平扩展能力。

```
┌─────────────────────────────────────────────────────┐
│                    CAP 定理可视化                      │
│                                                       │
│           C (一致性)                                   │
│           /\                                          │
│          /  \                                         │
│         /    \        CA: MySQL(单机), PostgreSQL     │
│        /  CA  \       CP: HBase, MongoDB(多数配置)     │
│       /        \      AP: Cassandra, CouchDB, DynamoDB│
│      /   CAP?   \     (三者不可兼得)                   │
│     /            \                                    │
│    /  CP      AP  \                                   │
│   /                \                                  │
│  A──────────────────P                                 │
│  (可用性)            (分区容错性)                       │
│                                                       │
│  现实: 分布式系统中 P 必须满足 → 只能在 C 和 A 之间权衡  │
└─────────────────────────────────────────────────────┘
```

### 1.2 ACID vs. BASE

- **ACID (RDBMS 核心)**: 原子性 (Atomicity)、一致性 (Consistency)、隔离性 (Isolation)、持久性 (Durability)。强调强一致性。
- **BASE (NoSQL 核心)**: 基本可用 (Basically Available)、软状态 (Soft state)、最终一致性 (Eventually consistent)。强调可用性和性能。

```
ACID 事务模型 (银行转账为例):
┌─────────────────────────────────────────────┐
│  BEGIN TRANSACTION                          │
│    UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- 扣款
│    UPDATE accounts SET balance = balance + 100 WHERE id = 2;  -- 入账
│    INSERT INTO transactions VALUES (...);                       -- 记录
│  COMMIT;  ← 要么全部成功，要么全部回滚           │
└─────────────────────────────────────────────┘

BASE 模型 (社交平台点赞为例):
┌─────────────────────────────────────────────┐
│  用户A点赞 → 写入节点1 (立即返回成功)           │
│            → 异步同步到节点2 (可能延迟100ms)    │
│            → 异步同步到节点3 (可能延迟200ms)    │
│                                            │
│  用户B查看 → 可能暂时看不到A的点赞 (最终一致性)  │
└─────────────────────────────────────────────┘
```

### 1.3 事务隔离级别 (Isolation Levels)

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 性能 | 默认使用 |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **READ UNCOMMITTED** | ✓ | ✓ | ✓ | 最高 | - |
| **READ COMMITTED** | ✗ | ✓ | ✓ | 高 | PostgreSQL, SQL Server, Oracle |
| **REPEATABLE READ** | ✗ | ✗ | ✓ | 中 | MySQL (InnoDB) |
| **SERIALIZABLE** | ✗ | ✗ | ✗ | 最低 | 严格场景 |

---

## 二、 数据库分类概览

数据库主要分为两大类：**关系型数据库 (RDBMS)** 和 **非关系型数据库 (NoSQL)**。

### 2.1 关系型数据库 (RDBMS)

1.  **主要特点**

    - 基于关系模型，使用结构化查询语言 (SQL)。
    - 预定义模式 (Schema)，数据存储在固定的表格中。
    - 强一致性支持，完善的事务处理 (ACID)。
    - 通过外键维护表间关联。

2.  **主流产品**

    - **MySQL/MariaDB**: 开源，Web 应用首选，生态极佳。
    - **PostgreSQL**: 开源，功能最强大，支持复杂数据类型（如 JSONB、GIS）。
    - **Oracle**: 商业巨头，企业级应用，功能极其丰富但成本高。
    - **SQL Server**: 微软生态，与 .NET 深度集成。
    - **SQLite**: 轻量级，嵌入式应用，单文件存储。

3.  **优缺点分析**
    - **优点**: 数据一致性高、成熟稳定、复杂查询能力强、标准化程度高。
    - **缺点**: 水平扩展困难（通常靠读写分离或分库分表）、高并发下写入瓶颈、模式变更（DDL）成本高。

### 2.2 非关系型数据库 (NoSQL)

1.  **主要分类**

    - **键值存储 (Key-Value)**:
      - _代表_: Redis, Memcached
      - _特点_: 极其高效的读写，简单的 O(1) 查询。
      - _场景_: 缓存、会话存储、计数器。
    - **文档存储 (Document)**:
      - _代表_: MongoDB, CouchDB
      - _特点_: 存储类似 JSON 的文档，模式灵活 (Schema-less)。
      - _场景_: 内容管理、产品目录、实时分析。
    - **列族存储 (Column-Family)**:
      - _代表_: Cassandra, HBase
      - _特点_: 高可扩展性，适合海量数据的稀疏存储。
      - _场景_: 日志数据、物联网数据、时间序列数据。
    - **图数据库 (Graph)**:
      - _代表_: Neo4j, ArangoDB
      - _特点_: 专注于处理节点间的复杂关系。
      - _场景_: 社交网络、推荐系统、反欺诈。
    - **向量数据库 (Vector Database) ✨ 新趋势**:
      - _代表_: Pinecone, Milvus, Weaviate
      - _特点_: 存储和检索高维向量，支持相似性搜索。
      - _场景_: AI/大模型 RAG 架构、图像检索、推荐系统。

2.  **优缺点分析**
    - **优点**: 高水平扩展能力、灵活的数据模型、高性能读写、适合非结构化数据。
    - **缺点**: 事务支持通常较弱、查询功能相对简单、标准化程度低、生态不如 RDBMS 成熟。

---

## 三、 RDBMS vs. NoSQL 深度对比

| 特性         | 关系型数据库 (RDBMS)             | 非关系型数据库 (NoSQL)               |
| :----------- | :------------------------------- | :----------------------------------- |
| **数据模型** | 结构化、预定义 Schema (表格)     | 灵活、Schema-less (文档, 键值, 图)   |
| **查询语言** | SQL (标准统一)                   | 各式各样 (如 MongoDB Query, Gremlin) |
| **扩展方式** | 垂直扩展 (Vertical/Up) 为主      | 水平扩展 (Horizontal/Out) 为主       |
| **事务支持** | 强 ACID 事务                     | 最终一致性 (BASE)，部分支持原子操作  |
| **数据关联** | 强大的 JOIN 操作                 | 倾向于数据去范式化 (Denormalization) |
| **一致性**   | 强一致性                         | 最终一致性                           |
| **适用场景** | 核心业务、财务系统、复杂关联查询 | 大数据量、高并发写入、快速迭代       |

---

## 四、 主流数据库深度对比分析

### 4.1 MySQL vs PostgreSQL — 开源 RDBMS 双雄对决

这是技术选型中最常见的二选一场景。两者都是成熟的开源关系型数据库，但设计哲学差异明显。

| 维度 | MySQL | PostgreSQL |
| :--- | :--- | :--- |
| **架构** | 多存储引擎架构 (InnoDB/MyISAM) | 统一引擎，进程模型 (每连接一进程) |
| **SQL 标准** | 部分遵循 SQL:2016 | 最完整遵循 SQL 标准 |
| **并发控制** | InnoDB: MVCC + 行级锁 | MVCC (无回滚段，多版本存储) |
| **索引类型** | B+Tree, Full-text, Spatial (R-Tree) | B+Tree, Hash, GiST, GIN, BRIN, SP-GiST |
| **JSON 支持** | JSON 类型 (5.7+)，函数有限 | JSONB (二进制JSON) + GIN 索引，功能强大 |
| **全文搜索** | 内置，仅 InnoDB (5.6+) | 内置 `tsvector`，功能更强大 |
| **窗口函数** | 8.0+ 支持 | 9.0+ 支持，更成熟 |
| **CTE/WITH** | 8.0+ 支持 (不支持递归CTE优化) | 完整支持 (WITH RECURSIVE) |
| **地理空间** | 基本 GIS 支持 | PostGIS 扩展，行业标准 |
| **复制** | 异步/半同步复制，Group Replication | 流复制 (异步/同步)，逻辑复制 |
| **扩展性** | 插件有限 | 丰富的扩展生态 (PostGIS, Citus, TimescaleDB) |
| **License** | GPL | PostgreSQL License (类似 MIT) |
| **社区/商业** | Oracle 主导，有企业版 | 纯社区驱动，无单一商业实体控制 |

**选型决策树:**

```
需要地理空间高级功能? ──Yes──> PostgreSQL + PostGIS
       │
      No
       │
      ▼
需要严格SQL标准/复杂查询? ──Yes──> PostgreSQL
       │
      No
       │
      ▼
简单CRUD为主/读多写少? ──Yes──> MySQL (更简单运维)
       │
      No
       │
      ▼
需要时序/分析扩展? ──Yes──> PostgreSQL (TimescaleDB/Citus)
       │
      No
       │
      ▼
团队更熟悉哪个? ──> 选择熟悉的 (两者都能胜任大多数场景)
```

### 4.2 MySQL InnoDB 存储引擎深度解析

InnoDB 是 MySQL 的默认存储引擎，理解其内部机制对性能优化至关重要。

```
InnoDB 架构图:
┌─────────────────────────────────────────────────────────┐
│                    InnoDB 存储引擎                         │
│                                                           │
│  ┌─────────────────────┐    ┌─────────────────────┐      │
│  │   Buffer Pool       │    │   Change Buffer      │      │
│  │   (内存缓存池)       │    │   (写缓冲优化)        │      │
│  │   - 数据页           │    │   - 缓存二级索引变更   │      │
│  │   - 索引页           │    │   - 合并到BP后写入     │      │
│  │   - 自适应哈希索引    │    └─────────────────────┘      │
│  │   - 默认128MB        │                                  │
│  └──────────┬──────────┘    ┌─────────────────────┐      │
│             │               │   Redo Log Buffer    │      │
│             ▼               │   (重做日志缓冲)      │      │
│  ┌─────────────────────┐    │   - 保证持久性        │      │
│  │   Doublewrite Buffer │    │   - 循环写入          │      │
│  │   (防止部分页写失效)  │    │   - innodb_log_file_  │      │
│  │   - 先写doublewrite  │    │     size (默认48M)    │      │
│  │   - 再写真实数据文件   │    └─────────────────────┘      │
│  └─────────────────────┘                                   │
│                                                           │
│  磁盘结构:                                                 │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 表空间 (Tablespace)                                │    │
│  │  ├── 段 (Segment): 一个索引分配2个段 (叶子+非叶子)  │    │
│  │  ├── 区 (Extent): 固定1MB, 64个页                  │    │
│  │  ├── 页 (Page): 默认16KB, 最小IO单位               │    │
│  │  └── 行 (Row): 实际数据                            │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### 4.3 PostgreSQL 高级特性

PostgreSQL 被称为"最先进的开源数据库"，其独特功能远超传统 RDBMS 范畴。

| 特性 | 说明 | 典型场景 |
| :--- | :--- | :--- |
| **JSONB** | 二进制 JSON，支持 GIN 索引 | 半结构化数据、API 响应缓存 |
| **PostGIS** | 地理空间扩展，OGC 标准 | 地图、LBS、物流路径规划 |
| **Citus** | 分布式扩展 (水平分片) | 多租户 SaaS、实时分析 |
| **TimescaleDB** | 时序数据库扩展 | IoT 数据、监控指标、金融K线 |
| **pgvector** | 向量相似性搜索 | AI RAG 架构、语义搜索 |
| **FDW** | 外部数据包装器 (跨库查询) | 数据联邦、异构数据整合 |
| **Table Inheritance** | 原生表继承 | 分区表、日志归档 |
| **LISTEN/NOTIFY** | 内置消息通知 | 实时推送、缓存失效通知 |
| **Row-Level Security** | 行级安全策略 | 多租户数据隔离 |
| **Parallel Query** | 并行查询执行 | 大表聚合、复杂分析 |

### 4.4 NoSQL 数据库横向对比

| 维度 | MongoDB | Redis | Cassandra | Elasticsearch | Neo4j |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **类型** | 文档型 | 键值/内存 | 列族宽表 | 搜索引擎 | 图数据库 |
| **数据模型** | BSON 文档 | 多种数据结构 | 宽行/列族 | JSON 文档(倒排索引) | 节点+关系+属性 |
| **查询方式** | MQL (类JSON) | 命令/脚本 | CQL (类SQL) | DSL (JSON) / SQL | Cypher (图查询) |
| **事务** | 多文档 ACID (4.0+) | 单命令原子性 | 行级原子性 | 无 | 完整 ACID |
| **扩展** | 自动分片 | 集群/哨兵 | 无主去中心化 | 自动分片 | 读副本集群 |
| **一致性** | 可配置 (多数写) | 主从最终一致 | 可调一致性 | 近实时 | 强一致 |
| **写入性能** | 高 (10万+/s) | 极高 (10万+/s 内存) | 极高 (线性扩展) | 中 (索引开销) | 中 |
| **读取性能** | 高 (索引查询) | 极高 (微秒级) | 高 (主键查询) | 极高 (全文搜索) | 高 (图遍历) |
| **典型QPS** | 1万~10万 | 10万~100万 | 10万~100万 | 1千~1万 | 1千~5千 |

### 4.5 Redis 深度解析

Redis 虽然被归类为键值存储，但其丰富的数据结构使其能胜任多种场景。

```
Redis 数据结构与应用场景映射:

String (字符串)
├── 缓存: SET key value EX 3600
├── 计数器: INCR page:view:article:123
├── 分布式锁: SET lock:order:123 uuid NX EX 30
└── 限流: INCR + EXPIRE (滑动窗口)

Hash (哈希表)
├── 用户信息: HSET user:1001 name "张三" age 25
├── 购物车: HSET cart:1001 sku:001 2 sku:002 1
└── 配置项: HSET config:app max_conn 100

List (链表)
├── 消息队列: LPUSH queue:task + BRPOP queue:task 0
├── 最新动态: LPUSH timeline:user:1 "新消息" + LTRIM (保留最近N条)
└── 栈结构: LPUSH + LPOP

Set (集合)
├── 标签系统: SADD article:1:tags "java" "redis"
├── 共同好友: SINTER user:1:friends user:2:friends
├── 抽奖去重: SADD lottery:round:5 user:1001
└── 可能认识: SDIFF user:2:friends user:1:friends → 推荐给 user:1

Sorted Set (有序集合)
├── 排行榜: ZADD leaderboard score player_id → ZREVRANGE
├── 延时队列: ZADD delay:queue timestamp task_json
├── 滑动窗口限流: ZADD rate:user:1 now score + ZREMRANGEBYSCORE
└── 带权重的标签: ZADD tags:article 10 "热门" 5 "推荐"

Stream (流, 5.0+)
├── 可靠消息队列: XADD + XREADGROUP + XACK
├── 事件溯源: 追加日志
└── 多播消息: 消费者组

Bitmap (位图)
├── 签到: SETBIT sign:2024:uid:1 100 1 (第100天签到)
├── 在线用户: BITCOUNT online:today
└── 布隆过滤器: 基于多个哈希函数的位图

HyperLogLog
├── UV 统计: PFADD uv:page:123 user_id → PFCOUNT
└── 大数据去重计数 (误差0.81%)

Geospatial (地理位置)
├── 附近的人: GEOADD + GEORADIUS
└── 配送范围: GEOADD stores 经 纬 "店名"
```

### 4.6 MongoDB vs PostgreSQL JSONB — 文档存储之争

PostgreSQL 的 JSONB 支持使其在功能上直接对标 MongoDB，这在选型时经常引发讨论。

| 维度 | MongoDB | PostgreSQL JSONB |
| :--- | :--- | :--- |
| **文档查询** | 原生、简洁的 MQL | SQL/JSON Path (稍复杂) |
| **索引** | 单字段、复合、多键、文本、地理、TTL | B-Tree, GIN, 表达式索引 |
| **Schema 灵活性** | 完全 Schema-less | JSONB 列可以 Schema-less (但表结构固定) |
| **ACID** | 4.0+ 多文档事务 | 完整、成熟的事务支持 |
| **JOIN** | $lookup (有限), 建议嵌套 | 强大的 JOIN + JSONB 混合 |
| **聚合管道** | 强大的 Aggregation Pipeline | SQL GROUP BY + 窗口函数 + JSON 函数 |
| **水平扩展** | 原生分片 | 需 Citus 扩展或应用层分片 |
| **运维复杂度** | 中等 | 成熟工具链 |
| **License** | SSPL (有争议) | PostgreSQL License |

**选型建议:**
- **选 MongoDB**: 纯文档型应用、数据模型高度动态、需要自动分片、团队偏好 JSON 优先
- **选 PostgreSQL + JSONB**: 同时需要关系型和文档型、强事务要求、已有 PostgreSQL 基础设施

---

## 五、 数据库选型决策流程

在决定使用哪种数据库时，请参考以下决策路径：

### 1. 核心考量因素

- **数据结构**: 结构化数据 (SQL) vs. 半结构化/非结构化数据 (NoSQL)。
- **一致性要求**: 必须实时准确 (SQL) vs. 允许短暂延迟 (NoSQL)。
- **扩展需求**: 预期数据量和 QPS 是否会达到单机瓶颈？
- **查询复杂度**: 是否需要频繁进行多表关联查询？
- **开发敏捷度**: 业务模型是否频繁变更？

### 2. 混合架构策略 (Polyglot Persistence)

现代互联网应用很少只使用一种数据库。典型组合如下：

- **核心业务数据**: MySQL / PostgreSQL (保存用户信息、订单、财务)
- **高性能缓存**: Redis (热点数据、Session、分布式锁)
- **用户行为/日志**: MongoDB / Cassandra (海量、非结构化、快速写入)
- **全文搜索**: Elasticsearch (复杂搜索、聚合分析)
- **AI 增强**: Milvus / Pinecone (存储向量嵌入)

```
典型电商系统数据库架构:

                    ┌─────────────┐
                    │   客户端     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  API 网关    │
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
  ┌─────▼─────┐    ┌──────▼──────┐    ┌──────▼──────┐
  │  Redis     │    │  MySQL/     │    │  Elastic-   │
  │  缓存       │◄──►│  PostgreSQL │    │  search     │
  │  · Session │    │  主库       │    │  搜索       │
  │  · 热点数据 │    │  · 用户     │    │  · 商品搜索  │
  │  · 计数/锁  │    │  · 订单     │    │  · 日志分析  │
  └───────────┘    │  · 库存     │    └─────────────┘
                   └──────┬──────┘
                          │ 读写分离
                   ┌──────▼──────┐
                   │  MySQL      │
                   │  从库(多台)  │
                   │  · 报表查询  │
                   │  · 数据分析  │
                   └─────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
  ┌─────▼─────┐    ┌─────▼─────┐    ┌──────▼──────┐
  │  MongoDB   │    │  Neo4j    │    │  Milvus     │
  │  行为日志  │    │  推荐引擎  │    │  向量搜索   │
  │  · 点击流  │    │  · 好友关系│    │  · 相似商品  │
  │  · 浏览记录 │    │  · 知识图谱│    │  · AI推荐   │
  └───────────┘    └───────────┘    └─────────────┘
```

---

## 六、 实践 Demo — 各数据库入门操作

### 6.1 MySQL — 电商订单系统 Demo

```sql
-- ============================================
-- MySQL 电商订单系统 Demo
-- ============================================

-- 1. 创建数据库和表
CREATE DATABASE IF NOT EXISTS ecommerce DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce;

-- 用户表
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    status TINYINT DEFAULT 1 COMMENT '1:正常 0:禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_email (email),
    UNIQUE KEY uk_username (username),
    KEY idx_status (status),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 商品表
CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL COMMENT '价格，精确到分',
    stock INT NOT NULL DEFAULT 0 COMMENT '库存',
    category_id INT NOT NULL,
    status TINYINT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    KEY idx_category (category_id),
    KEY idx_price (price),
    KEY idx_category_price (category_id, price) COMMENT '复合索引：按分类+价格查询',
    FULLTEXT KEY ft_title_desc (title, description) COMMENT '全文索引，支持中文需 ngram parser'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';

-- 订单表
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL COMMENT '订单号',
    user_id BIGINT UNSIGNED NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending','paid','shipped','completed','cancelled') DEFAULT 'pending',
    pay_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_order_no (order_no),
    KEY idx_user_id (user_id),
    KEY idx_status_created (status, created_at) COMMENT '按状态+时间查询'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 订单明细表
CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL,
    product_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL COMMENT '下单时的单价（快照）',
    KEY idx_order_id (order_id),
    KEY idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单明细表';

-- 2. 插入测试数据
INSERT INTO users (username, email, phone) VALUES
('张三', 'zhangsan@example.com', '13800000001'),
('李四', 'lisi@example.com', '13800000002'),
('王五', 'wangwu@example.com', '13800000003');

INSERT INTO products (title, price, stock, category_id) VALUES
('iPhone 15 Pro', 8999.00, 100, 1),
('MacBook Pro 16', 19999.00, 50, 1),
('AirPods Pro', 1999.00, 200, 2),
('iPad Air', 5499.00, 80, 3);

-- 3. 事务示例：下单流程
-- 下单是一个典型的事务操作：扣库存 + 创建订单 + 创建订单明细
START TRANSACTION;

-- 3.1 检查库存（悲观锁）
SELECT id, stock, price FROM products WHERE id = 1 FOR UPDATE;
-- 假设 stock >= 购买数量

-- 3.2 扣减库存
UPDATE products SET stock = stock - 1 WHERE id = 1 AND stock >= 1;

-- 3.3 检查是否扣减成功
SELECT ROW_COUNT() INTO @affected;
-- 如果 @affected = 0，说明库存不足，ROLLBACK

-- 3.4 创建订单
INSERT INTO orders (order_no, user_id, total_amount, status)
VALUES (CONCAT('ORD', DATE_FORMAT(NOW(),'%Y%m%d%H%i%s'), LPAD(FLOOR(RAND()*10000),4,'0')),
        1, 8999.00, 'pending');

SET @order_id = LAST_INSERT_ID();

-- 3.5 创建订单明细
INSERT INTO order_items (order_id, product_id, quantity, unit_price)
VALUES (@order_id, 1, 1, 8999.00);

COMMIT;

-- 4. 复杂查询示例
-- 4.1 查询用户订单汇总（JOIN + GROUP BY）
SELECT
    u.username,
    COUNT(o.id) AS order_count,
    COALESCE(SUM(o.total_amount), 0) AS total_spent,
    MAX(o.created_at) AS last_order_time
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status != 'cancelled'
GROUP BY u.id, u.username
ORDER BY total_spent DESC;

-- 4.2 窗口函数：用户消费排名
SELECT
    u.username,
    o.order_no,
    o.total_amount,
    ROW_NUMBER() OVER (PARTITION BY u.id ORDER BY o.total_amount DESC) AS rank_in_user,
    SUM(o.total_amount) OVER (PARTITION BY u.id) AS user_total,
    RANK() OVER (ORDER BY o.total_amount DESC) AS global_rank
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'completed';

-- 4.3 递归 CTE：分类树查询
WITH RECURSIVE category_tree AS (
    SELECT id, name, parent_id, 0 AS depth, CAST(name AS CHAR(500)) AS path
    FROM categories
    WHERE parent_id IS NULL
    UNION ALL
    SELECT c.id, c.name, c.parent_id, ct.depth + 1, CONCAT(ct.path, ' > ', c.name)
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT * FROM category_tree ORDER BY path;

-- 4.4 EXPLAIN 分析查询计划
EXPLAIN SELECT u.username, o.order_no, o.total_amount
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'pending'
  AND o.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY);
```

### 6.2 PostgreSQL — 高级特性 Demo

```sql
-- ============================================
-- PostgreSQL 高级特性 Demo
-- ============================================

-- 1. JSONB 操作：商品属性灵活存储
CREATE TABLE products_pg (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 插入灵活属性
INSERT INTO products_pg (title, attributes) VALUES
('iPhone 15 Pro', '{"brand":"Apple","color":"钛金属","storage":"256GB","specs":{"screen":6.1,"chip":"A17 Pro","ram":8}}'),
('MacBook Pro',   '{"brand":"Apple","color":"深空黑","storage":"512GB","specs":{"screen":16,"chip":"M3 Pro","ram":18}}'),
('Galaxy S24',    '{"brand":"Samsung","color":"黑色","storage":"256GB","specs":{"screen":6.2,"chip":"Exynos 2400","ram":8}}');

-- JSONB 索引：GIN 索引加速 JSONB 查询
CREATE INDEX idx_products_attributes ON products_pg USING GIN (attributes jsonb_path_ops);

-- JSONB 查询
-- 查找 Apple 品牌、屏幕>=6.1 的产品
SELECT title, attributes
FROM products_pg
WHERE attributes @> '{"brand": "Apple"}'
  AND (attributes #>> '{specs,screen}')::numeric >= 6.1;

-- JSONB 聚合
SELECT
    attributes->>'brand' AS brand,
    COUNT(*) AS count,
    JSONB_AGG(JSONB_BUILD_OBJECT('title', title, 'storage', attributes->>'storage')) AS products
FROM products_pg
GROUP BY attributes->>'brand';

-- 2. 窗口函数：复杂的分析查询
SELECT
    title,
    price,
    category_id,
    -- 分类内排名
    ROW_NUMBER() OVER w AS row_num,
    RANK() OVER w AS rank,
    DENSE_RANK() OVER w AS dense_rnk,
    -- 累计分布
    CUME_DIST() OVER w AS cume_dist,
    -- 分类内百分比
    ROUND(100.0 * RANK() OVER w / COUNT(*) OVER (PARTITION BY category_id), 2) AS percentile
FROM products_pg
WINDOW w AS (PARTITION BY category_id ORDER BY price DESC);

-- 3. CTE (公共表表达式) + 递归
-- 按月统计订单并计算环比增长
WITH monthly_stats AS (
    SELECT
        DATE_TRUNC('month', created_at) AS month,
        SUM(total_amount) AS revenue,
        COUNT(*) AS order_count
    FROM orders
    GROUP BY DATE_TRUNC('month', created_at)
),
with_growth AS (
    SELECT
        month,
        revenue,
        order_count,
        LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
        ROUND((revenue - LAG(revenue) OVER (ORDER BY month))
              / NULLIF(LAG(revenue) OVER (ORDER BY month), 0) * 100, 2) AS growth_rate
    FROM monthly_stats
)
SELECT * FROM with_growth ORDER BY month DESC;

-- 4. 物化视图：预计算报表
CREATE MATERIALIZED VIEW mv_daily_sales AS
SELECT
    DATE(created_at) AS sale_date,
    category_id,
    COUNT(DISTINCT user_id) AS unique_buyers,
    COUNT(*) AS order_count,
    SUM(total_amount) AS revenue,
    AVG(total_amount) AS avg_order_value
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
JOIN products p ON oi.product_id = p.id
WHERE o.status = 'completed'
GROUP BY DATE(created_at), category_id;

-- 创建唯一索引以支持并发刷新
CREATE UNIQUE INDEX idx_mv_daily_sales ON mv_daily_sales (sale_date, category_id);

-- 刷新物化视图（可并发刷新不阻塞查询）
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_sales;

-- 5. 表分区：按时间分区订单表
CREATE TABLE orders_partitioned (
    id BIGSERIAL,
    order_no VARCHAR(32) NOT NULL,
    user_id BIGINT NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- 创建月度分区
CREATE TABLE orders_2024_01 PARTITION OF orders_partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE orders_2024_02 PARTITION OF orders_partitioned
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
-- ... 可用 pg_partman 自动化

-- 6. LISTEN/NOTIFY：实时通知
-- Session A: 监听
-- LISTEN order_channel;
-- Session B: 通知
-- NOTIFY order_channel, 'New order created: ORD20240101001';
-- SELECT pg_notify('order_channel', '{"order_id":123,"status":"paid"}'::text);
```

### 6.3 Redis — 实战场景 Demo

```python
# ============================================
# Redis 实战 Demo (Python)
# pip install redis
# ============================================

import redis
import json
import time
from datetime import datetime, timedelta
from typing import Optional, List, Dict
import hashlib

# 连接 Redis
r = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True,  # 自动解码为字符串
    socket_connect_timeout=5,
    socket_keepalive=True,
    max_connections=50
)

# ==========================================
# 1. 缓存模式
# ==========================================

class CacheService:
    """Redis 缓存服务 — 常见缓存模式实现"""

    # 1.1 Cache-Aside (旁路缓存) — 最常用模式
    @staticmethod
    def get_user(user_id: int) -> Optional[Dict]:
        """先从缓存取，miss 则查 DB 并回填"""
        cache_key = f"user:{user_id}"

        # 1. 查缓存
        cached = r.get(cache_key)
        if cached:
            return json.loads(cached)

        # 2. 缓存未命中，查数据库 (模拟)
        user = CacheService._query_db_user(user_id)
        if not user:
            # 缓存空值防止穿透（设置较短过期时间）
            r.setex(cache_key, 60, 'null')
            return None

        # 3. 回填缓存，设置随机过期时间防止雪崩
        ttl = 3600 + (user_id % 300)  # 3600~3899秒
        r.setex(cache_key, ttl, json.dumps(user))
        return user

    # 1.2 缓存穿透防护 — 布隆过滤器
    @staticmethod
    def get_user_with_bloom(user_id: int) -> Optional[Dict]:
        """使用布隆过滤器防止缓存穿透"""
        # 先用布隆过滤器判断 key 是否可能存在
        if not r.bf().exists('user_bloom', str(user_id)):
            return None  # 确定不存在，直接返回
        return CacheService.get_user(user_id)

    # 1.3 缓存击穿防护 — 互斥锁
    @staticmethod
    def get_user_with_lock(user_id: int) -> Optional[Dict]:
        """热点 key 失效时，只允许一个请求去加载"""
        cache_key = f"user:{user_id}"
        lock_key = f"lock:user:{user_id}"

        cached = r.get(cache_key)
        if cached:
            return json.loads(cached)

        # 尝试获取锁
        if r.set(lock_key, '1', nx=True, ex=10):
            try:
                # 双重检查
                cached = r.get(cache_key)
                if cached:
                    return json.loads(cached)
                # 加载数据
                user = CacheService._query_db_user(user_id)
                if user:
                    r.setex(cache_key, 3600, json.dumps(user))
                return user
            finally:
                r.delete(lock_key)
        else:
            # 未获取到锁，等待后重试
            time.sleep(0.05)
            return CacheService.get_user_with_lock(user_id)

    @staticmethod
    def _query_db_user(user_id: int) -> Optional[Dict]:
        """模拟数据库查询"""
        return {"id": user_id, "name": f"User{user_id}", "age": 25}

# ==========================================
# 2. 分布式锁
# ==========================================

class DistributedLock:
    """基于 Redis 的分布式锁"""

    def __init__(self, redis_client, lock_key: str, expire_seconds: int = 30):
        self.redis = redis_client
        self.lock_key = f"dist_lock:{lock_key}"
        self.lock_value = hashlib.md5(f"{lock_key}:{time.time()}".encode()).hexdigest()
        self.expire = expire_seconds

    def acquire(self, timeout: float = 10) -> bool:
        """获取锁，支持超时等待"""
        deadline = time.time() + timeout
        while time.time() < deadline:
            if self.redis.set(self.lock_key, self.lock_value, nx=True, ex=self.expire):
                return True
            time.sleep(0.01)  # 10ms 轮询
        return False

    def release(self):
        """释放锁（Lua 脚本保证原子性）"""
        script = """
        if redis.call('GET', KEYS[1]) == ARGV[1] then
            return redis.call('DEL', KEYS[1])
        else
            return 0
        end
        """
        self.redis.eval(script, 1, self.lock_key, self.lock_value)

    def __enter__(self):
        if not self.acquire():
            raise TimeoutError(f"Failed to acquire lock: {self.lock_key}")
        return self

    def __exit__(self, *args):
        self.release()

# 使用示例
# with DistributedLock(r, 'order:create:123') as lock:
#     # 临界区代码
#     create_order(123)

# ==========================================
# 3. 限流器
# ==========================================

class RateLimiter:
    """基于 Redis 的限流器"""

    @staticmethod
    def sliding_window(user_id: int, limit: int = 10, window_sec: int = 60) -> bool:
        """
        滑动窗口限流
        - limit: 窗口内最大请求数
        - window_sec: 窗口大小（秒）
        """
        key = f"rate_limit:{user_id}"
        now = time.time()
        window_start = now - window_sec

        # Lua 脚本保证原子性
        script = """
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local limit = tonumber(ARGV[3])

        -- 删除窗口外的记录
        redis.call('ZREMRANGEBYSCORE', key, 0, now - window)
        -- 统计窗口内的请求数
        local count = redis.call('ZCARD', key)
        if count < limit then
            redis.call('ZADD', key, now, now .. '-' .. count)
            redis.call('EXPIRE', key, window)
            return 1
        end
        return 0
        """
        result = r.eval(script, 1, key, now, window_sec, limit)
        return result == 1

    @staticmethod
    def token_bucket(key: str, capacity: int = 10, rate: float = 1.0) -> bool:
        """
        令牌桶限流
        - capacity: 桶容量（突发流量上限）
        - rate: 令牌生成速率（个/秒）
        """
        script = """
        local key = KEYS[1]
        local capacity = tonumber(ARGV[1])
        local rate = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])

        local bucket = redis.call('HMGET', key, 'tokens', 'last_refill')
        local tokens = tonumber(bucket[1]) or capacity
        local last_refill = tonumber(bucket[2]) or now

        -- 计算新生成的令牌
        local elapsed = math.max(0, now - last_refill)
        tokens = math.min(capacity, tokens + elapsed * rate)

        if tokens >= 1 then
            redis.call('HMSET', key, 'tokens', tokens - 1, 'last_refill', now)
            redis.call('EXPIRE', key, math.ceil(capacity / rate) + 1)
            return 1
        end
        return 0
        """
        return r.eval(script, 1, key, capacity, rate, time.time()) == 1

# ==========================================
# 4. 排行榜
# ==========================================

class Leaderboard:
    """基于 Sorted Set 的排行榜"""

    def __init__(self, name: str):
        self.key = f"leaderboard:{name}"

    def update_score(self, member: str, score: float):
        """更新分数"""
        r.zadd(self.key, {member: score})

    def increment_score(self, member: str, increment: float = 1):
        """增加分数"""
        r.zincrby(self.key, increment, member)

    def get_rank(self, member: str) -> Optional[int]:
        """获取排名（从0开始，从高到低）"""
        rank = r.zrevrank(self.key, member)
        return rank + 1 if rank is not None else None

    def get_top_n(self, n: int = 10, with_scores: bool = True) -> List:
        """获取前N名"""
        return r.zrevrange(self.key, 0, n-1, withscores=with_scores)

    def get_range_by_score(self, min_score: float, max_score: float) -> List:
        """按分数范围获取"""
        return r.zrangebyscore(self.key, min_score, max_score, withscores=True)

    def get_nearby(self, member: str, count: int = 5) -> Dict:
        """获取某成员附近的排名（上下各N个）"""
        rank = r.zrevrank(self.key, member)
        if rank is None:
            return {}
        start = max(0, rank - count)
        end = rank + count
        return {
            'rank': rank + 1,
            'nearby': r.zrevrange(self.key, start, end, withscores=True)
        }

# ==========================================
# 5. 延时队列
# ==========================================

class DelayedQueue:
    """基于 Sorted Set 的延时队列"""

    def __init__(self, queue_name: str):
        self.key = f"delay_queue:{queue_name}"

    def add_task(self, task_id: str, delay_seconds: int, data: Dict):
        """添加延时任务"""
        execute_at = time.time() + delay_seconds
        task = json.dumps({'id': task_id, 'data': data, 'execute_at': execute_at})
        r.zadd(self.key, {task: execute_at})

    def poll(self, batch_size: int = 10) -> List[Dict]:
        """轮询到期任务"""
        script = """
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local batch = tonumber(ARGV[2])

        local tasks = redis.call('ZRANGEBYSCORE', key, 0, now, 'LIMIT', 0, batch)
        if #tasks > 0 then
            redis.call('ZREM', key, unpack(tasks))
        end
        return tasks
        """
        results = r.eval(script, 1, self.key, time.time(), batch_size)
        return [json.loads(t) for t in results] if results else []

# ==========================================
# 6. Stream 消息队列（可靠消费）
# ==========================================

class StreamMQ:
    """基于 Redis Stream 的可靠消息队列"""

    def __init__(self, stream_name: str, group_name: str = 'default_group'):
        self.stream = f"stream:{stream_name}"
        self.group = group_name
        self.consumer = f"consumer_{stream_name}"
        # 创建消费者组（从最新消息开始消费）
        try:
            r.xgroup_create(self.stream, self.group, id='$', mkstream=True)
        except redis.ResponseError:
            pass  # 消费者组已存在

    def produce(self, message: Dict, max_len: int = 10000):
        """生产消息"""
        r.xadd(self.stream, message, maxlen=max_len, id='*')

    def consume(self, batch_size: int = 10, block_ms: int = 5000) -> List:
        """消费消息"""
        try:
            messages = r.xreadgroup(
                self.group, self.consumer,
                {self.stream: '>'},  # '>' 表示只读新消息
                count=batch_size,
                block=block_ms
            )
            return messages
        except redis.ResponseError:
            return []

    def ack(self, message_id: str):
        """确认消息"""
        r.xack(self.stream, self.group, message_id)

    def pending(self) -> List:
        """查看待处理消息"""
        return r.xpending(self.stream, self.group)
```

### 6.4 MongoDB — 文档操作 Demo

```javascript
// ============================================
// MongoDB 电商系统 Demo (mongosh / Node.js)
// ============================================

// 1. 连接和数据库操作
use ecommerce_mongo;

// 2. 创建集合和索引
db.createCollection("products");
db.createCollection("orders");
db.createCollection("users");

// ==========================================
// 3. 文档设计：嵌入式 vs 引用式
// ==========================================

// 3.1 嵌入式设计 (推荐用于 1:1 或 1:few 关系)
// 商品文档 — 评论内嵌（每个商品评论量不大时适用）
db.products.insertOne({
    _id: ObjectId(),
    title: "iPhone 15 Pro",
    price: 8999.00,
    stock: 100,
    category: { id: 1, name: "手机", path: "数码 > 手机" },
    specs: {
        screen: 6.1,
        chip: "A17 Pro",
        storage: ["128GB", "256GB", "512GB", "1TB"],
        colors: ["钛金属", "蓝色", "白色", "黑色"]
    },
    // 嵌入少量评论（适用于评论数可控的场景）
    reviews: [
        {
            user_id: 101,
            username: "张三",
            rating: 5,
            comment: "非常好用",
            created_at: new Date()
        }
    ],
    // 多键索引：可以对数组字段建索引
    tags: ["旗舰", "5G", "拍照", "iOS"],
    created_at: new Date(),
    updated_at: new Date()
});

// 3.2 引用式设计 (推荐用于 1:N 或 M:N 关系)
// 用户文档
db.users.insertOne({
    _id: ObjectId(),
    username: "张三",
    email: "zhangsan@example.com",
    // 引用最近订单 ID（不嵌入所有订单）
    recent_order_ids: [ObjectId(), ObjectId()]
});

// 订单文档 — 引用商品
db.orders.insertOne({
    _id: ObjectId(),
    order_no: "ORD20240101001",
    user_id: ObjectId("..."),
    status: "paid",
    total_amount: 10998.00,
    items: [
        {
            product_id: ObjectId("..."),  // 引用商品
            title: "iPhone 15 Pro",       // 冗余部分信息（快照）
            quantity: 1,
            unit_price: 8999.00
        },
        {
            product_id: ObjectId("..."),
            title: "AirPods Pro",
            quantity: 1,
            unit_price: 1999.00
        }
    ],
    shipping_address: {
        province: "广东省",
        city: "深圳市",
        detail: "科技园路1号"
    },
    created_at: new Date(),
    updated_at: new Date()
});

// ==========================================
// 4. 索引策略
// ==========================================

// 单字段索引
db.products.createIndex({ title: 1 });

// 复合索引 (遵循 ESR 规则: Equality → Sort → Range)
db.orders.createIndex({ status: 1, created_at: -1 });

// 多键索引 (数组字段)
db.products.createIndex({ tags: 1 });

// 文本索引
db.products.createIndex({ title: "text", "specs.chip": "text" });

// TTL 索引 (自动过期，适用于临时数据)
db.sessions.createIndex({ created_at: 1 }, { expireAfterSeconds: 3600 });

// 部分索引 (只索引满足条件的文档)
db.orders.createIndex(
    { created_at: -1 },
    { partialFilterExpression: { status: "pending" } }
);

// 通配符索引 (灵活但需谨慎使用)
db.products.createIndex({ "attributes.$**": 1 });

// 查看索引使用情况
db.orders.find({ status: "paid" }).explain("executionStats");

// ==========================================
// 5. 聚合管道 (Aggregation Pipeline)
// ==========================================

// 5.1 销售统计：按分类统计销售额
db.orders.aggregate([
    // 阶段1: 只查已完成的订单
    { $match: { status: "completed" } },
    // 阶段2: 展开订单项
    { $unwind: "$items" },
    // 阶段3: 关联商品信息
    { $lookup: {
        from: "products",
        localField: "items.product_id",
        foreignField: "_id",
        as: "product"
    }},
    // 阶段4: 展开关联结果
    { $unwind: "$product" },
    // 阶段5: 按分类分组统计
    { $group: {
        _id: "$product.category.name",
        total_revenue: { $sum: { $multiply: ["$items.quantity", "$items.unit_price"] } },
        order_count: { $sum: 1 },
        avg_order: { $avg: "$items.unit_price" }
    }},
    // 阶段6: 排序
    { $sort: { total_revenue: -1 } },
    // 阶段7: 格式化输出
    { $project: {
        category: "$_id",
        total_revenue: 1,
        order_count: 1,
        avg_order: { $round: ["$avg_order", 2] }
    }}
]);

// 5.2 漏斗分析：用户购买转化
db.orders.aggregate([
    { $match: { created_at: { $gte: ISODate("2024-01-01") } } },
    { $group: {
        _id: "$user_id",
        stages: {
            $addToSet: "$status"  // 收集用户经历过的所有状态
        }
    }},
    { $facet: {
        "浏览商品": [{ $count: "count" }],
        "加入购物车": [{ $match: { "stages": "cart" } }, { $count: "count" }],
        "下单": [{ $match: { "stages": "pending" } }, { $count: "count" }],
        "支付": [{ $match: { "stages": "paid" } }, { $count: "count" }],
        "完成": [{ $match: { "stages": "completed" } }, { $count: "count" }]
    }}
]);

// ==========================================
// 6. 事务（4.0+ 多文档 ACID）
// ==========================================

const session = db.getMongo().startSession();
session.startTransaction();

try {
    const ordersCol = session.getDatabase("ecommerce_mongo").orders;
    const productsCol = session.getDatabase("ecommerce_mongo").products;

    // 扣库存
    const result = productsCol.updateOne(
        { _id: productId, stock: { $gte: 1 } },
        { $inc: { stock: -1 } }
    );

    if (result.modifiedCount === 0) {
        throw new Error("库存不足");
    }

    // 创建订单
    ordersCol.insertOne({
        order_no: generateOrderNo(),
        user_id: userId,
        items: [{ product_id: productId, quantity: 1, unit_price: price }],
        status: "pending",
        created_at: new Date()
    });

    await session.commitTransaction();
} catch (error) {
    await session.abortTransaction();
    throw error;
} finally {
    session.endSession();
}
```

### 6.5 Elasticsearch — 全文搜索 Demo

```json
// ============================================
// Elasticsearch 搜索服务 Demo
// ============================================

// 1. 创建索引（定义 Mapping）
PUT /products
{
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "ik_smart_analyzer": {
          "type": "custom",
          "tokenizer": "ik_smart"        // 中文分词器 (需安装 ik 插件)
        },
        "pinyin_analyzer": {
          "tokenizer": "pinyin"          // 拼音分词器 (需安装 pinyin 插件)
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id":           { "type": "long" },
      "title":        { "type": "text", "analyzer": "ik_max_word", "search_analyzer": "ik_smart",
                        "fields": { "keyword": { "type": "keyword" }, "pinyin": { "type": "text", "analyzer": "pinyin_analyzer" } } },
      "description":  { "type": "text", "analyzer": "ik_max_word" },
      "brand":        { "type": "keyword" },
      "category":     { "type": "keyword" },
      "price":        { "type": "scaled_float", "scaling_factor": 100 },
      "stock":        { "type": "integer" },
      "rating":       { "type": "float" },
      "tags":         { "type": "keyword" },
      "specs":        { "type": "nested",          // 嵌套对象（每个规格独立索引）
        "properties": { "name": { "type": "keyword" }, "value": { "type": "keyword" } } },
      "created_at":   { "type": "date" },
      "is_hot":       { "type": "boolean" }
    }
  }
}

// 2. 索引文档（批量）
POST /_bulk
{ "index": { "_index": "products", "_id": 1 } }
{ "id": 1, "title": "iPhone 15 Pro 钛金属 256GB", "description": "Apple 最新旗舰手机 A17 Pro 芯片 4800万像素", "brand": "Apple", "category": "手机", "price": 8999.00, "stock": 100, "rating": 4.8, "tags": ["5G", "旗舰", "拍照"], "specs": [{"name": "屏幕", "value": "6.1英寸"}, {"name": "芯片", "value": "A17 Pro"}, {"name": "存储", "value": "256GB"}], "created_at": "2024-01-15", "is_hot": true }
{ "index": { "_index": "products", "_id": 2 } }
{ "id": 2, "title": "MacBook Pro 16英寸 M3 Pro 芯片", "description": "Apple 笔记本电脑 18GB内存 512GB存储", "brand": "Apple", "category": "笔记本", "price": 19999.00, "stock": 50, "rating": 4.9, "tags": ["办公", "设计", "编程"], "specs": [{"name": "屏幕", "value": "16英寸"}, {"name": "芯片", "value": "M3 Pro"}, {"name": "内存", "value": "18GB"}], "created_at": "2024-01-10", "is_hot": true }
{ "index": { "_index": "products", "_id": 3 } }
{ "id": 3, "title": "Samsung Galaxy S24 Ultra", "description": "三星旗舰手机 AI智能 钛金属框架", "brand": "Samsung", "category": "手机", "price": 9999.00, "stock": 80, "rating": 4.5, "tags": ["5G", "AI", "旗舰"], "specs": [{"name": "屏幕", "value": "6.8英寸"}, {"name": "芯片", "value": "Snapdragon 8 Gen 3"}], "created_at": "2024-02-01", "is_hot": false }

// 3. 搜索查询
// 3.1 全文搜索 + 多字段
GET /products/_search
{
  "query": {
    "multi_match": {
      "query": "苹果手机",
      "fields": ["title^3", "description", "brand^2"],  // ^ 表示权重
      "type": "best_fields"
    }
  }
}

// 3.2 布尔查询 + 过滤 + 排序
GET /products/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "手机" } }
      ],
      "filter": [
        { "term": { "is_hot": true } },
        { "range": { "price": { "gte": 5000, "lte": 10000 } } },
        { "term": { "tags": "5G" } }
      ],
      "must_not": [
        { "term": { "brand": "Samsung" } }
      ]
    }
  },
  "sort": [
    { "rating": "desc" },
    { "_score": "desc" }
  ],
  "from": 0,
  "size": 20
}

// 3.3 聚合分析：品牌分布 + 价格区间
GET /products/_search
{
  "size": 0,
  "aggs": {
    "brand_distribution": {
      "terms": { "field": "brand", "size": 10 }
    },
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [
          { "to": 5000 },
          { "from": 5000, "to": 10000 },
          { "from": 10000, "to": 20000 },
          { "from": 20000 }
        ]
      }
    },
    "avg_price_by_category": {
      "terms": { "field": "category" },
      "aggs": {
        "avg_price": { "avg": { "field": "price" } }
      }
    }
  }
}

// 3.4 搜索建议 (自动补全)
GET /products/_search
{
  "suggest": {
    "title_suggest": {
      "prefix": "iph",
      "completion": { "field": "title.suggest" }
    }
  }
}

// 3.5 高亮显示
GET /products/_search
{
  "query": { "match": { "description": "AI 智能" } },
  "highlight": {
    "fields": {
      "title": { "number_of_fragments": 0 },
      "description": { "fragment_size": 150, "number_of_fragments": 3 }
    },
    "pre_tags": ["<em>"],
    "post_tags": ["</em>"]
  }
}
```

---

## 七、 数据库性能优化深度总结

### 7.1 优化全景图

```
数据库性能优化全景:

                    ┌──────────────────────────────────┐
                    │         SQL / 查询优化             │
                    │  · SQL 写法优化                    │
                    │  · 索引优化                        │
                    │  · 执行计划分析                    │
                    │  · 慢查询治理                      │
                    └──────────────┬───────────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        │                          │                          │
  ┌─────▼─────┐            ┌──────▼──────┐           ┌───────▼───────┐
  │ Schema 优化 │            │ 架构层优化   │           │ 基础设施优化   │
  │ · 表结构设计 │            │ · 读写分离    │           │ · 硬件选型     │
  │ · 数据类型   │            │ · 分库分表    │           │ · 操作系统调优 │
  │ · 范式/反范式│            │ · 缓存体系    │           │ · 网络优化     │
  │ · 分区表    │            │ · 连接池      │           │ · 存储引擎配置 │
  └─────────────┘            └──────────────┘           └───────────────┘
                                   │
                          ┌────────▼────────┐
                          │   监控与持续优化   │
                          │  · 慢查询日志     │
                          │  · 性能监控告警   │
                          │  · 定期巡检       │
                          │  · 压测与容量规划  │
                          └─────────────────┘
```

### 7.2 索引优化 — 最有效的优化手段

索引是数据库优化的第一利器。好的索引能让查询性能提升几个数量级。

#### 7.2.1 索引类型与选择

```
MySQL/InnoDB 索引类型决策:

        需要加速什么查询?
              │
    ┌─────────┼─────────┐
    │         │         │
    ▼         ▼         ▼
 等值查询   范围查询   全文搜索
    │         │         │
    ▼         ▼         ▼
 B+Tree    B+Tree    FULLTEXT
 (默认)    (默认)    (ngram/MeCab)
    │         │
    ├─ 单列索引 (key单字段)
    ├─ 复合索引 (遵循最左前缀)
    └─ 覆盖索引 (包含所有查询列)

特殊场景:
  地理位置 → SPATIAL (R-Tree)
  JSON 查询 → GIN (PostgreSQL) / 虚拟列+索引 (MySQL)
  前缀匹配 → B+Tree (like 'abc%' 走索引)
  后缀匹配 → 反转存储 + B+Tree 或全文索引
```

#### 7.2.2 索引设计黄金法则

```sql
-- ============================================
-- 索引设计黄金法则 + 实践
-- ============================================

-- 法则1: 高选择性列优先建索引
-- 选择性 = DISTINCT 值数 / 总行数，越高越好
SELECT COUNT(DISTINCT email) / COUNT(*) AS selectivity FROM users;
-- 选择性 > 0.1 的列适合建索引

-- 法则2: 复合索引遵循"最左前缀"原则
-- 查询: WHERE status = 'active' AND created_at > '2024-01-01' ORDER BY created_at
-- 正确的索引顺序: (status, created_at) — 等值在前，范围在后
CREATE INDEX idx_status_created ON orders (status, created_at);

-- ❌ 错误: 范围列在前，后面的列无法用到索引
-- CREATE INDEX idx_created_status ON orders (created_at, status);

-- 法则3: 覆盖索引避免回表
-- 查询只涉及: SELECT user_id, status, created_at FROM orders WHERE status = 'pending'
-- 覆盖索引包含所有需要的列，直接从索引返回数据，不回表
CREATE INDEX idx_covering ON orders (status, user_id, created_at);
-- 用 EXPLAIN 验证: Extra 列显示 "Using index" 即为覆盖索引

-- 法则4: 避免在索引列上使用函数
-- ❌ 错误: WHERE DATE(created_at) = '2024-01-01'  -- 索引失效!
-- ✅ 正确: WHERE created_at >= '2024-01-01' AND created_at < '2024-01-02'

-- 法则5: 隐式类型转换导致索引失效
-- ❌ 错误: WHERE phone = 13800000001  -- phone 是 VARCHAR，隐式转换导致索引失效!
-- ✅ 正确: WHERE phone = '13800000001'

-- 法则6: 联合索引的"最左匹配"验证
CREATE INDEX idx_a_b_c ON test (a, b, c);
-- WHERE a = 1 AND b = 2 AND c = 3  ✅ 全匹配
-- WHERE a = 1 AND b = 2            ✅ 匹配 a,b
-- WHERE a = 1 AND c = 3            ✅ 只匹配 a (c 无法使用)
-- WHERE b = 2 AND c = 3            ❌ 不使用索引 (缺少 a)
-- WHERE a = 1 AND b > 2 AND c = 3  ✅ 匹配 a,b (范围后的 c 不匹配)

-- 法则7: ORDER BY + LIMIT 优化
-- 场景: 分页查询
-- ❌ 深分页慢: SELECT * FROM orders ORDER BY id LIMIT 100000, 20;
-- ✅ 延迟关联优化:
SELECT o.* FROM orders o
INNER JOIN (
    SELECT id FROM orders ORDER BY id LIMIT 100000, 20
) AS tmp ON o.id = tmp.id;
```

#### 7.2.3 索引监控与维护

```sql
-- 查看未使用的索引（MySQL 8.0+）
SELECT * FROM sys.schema_unused_indexes;

-- 查看冗余索引
SELECT * FROM sys.schema_redundant_indexes
WHERE table_schema = 'ecommerce';

-- 查看索引使用统计
SELECT
    table_name,
    index_name,
    rows_selected,
    rows_inserted,
    rows_updated,
    rows_deleted
FROM sys.schema_index_statistics
WHERE table_schema = 'ecommerce';

-- 查看表统计信息（影响优化器选择）
SELECT * FROM mysql.innodb_table_stats WHERE database_name = 'ecommerce';
SELECT * FROM mysql.innodb_index_stats WHERE database_name = 'ecommerce';

-- 重建索引（碎片整理）
-- 碎片率 = (data_free / (data_length + index_length)) * 100
SELECT
    table_name,
    ROUND(data_free / 1024 / 1024, 2) AS data_free_mb,
    ROUND(data_length / 1024 / 1024, 2) AS data_length_mb,
    ROUND(index_length / 1024 / 1024, 2) AS index_length_mb,
    ROUND(data_free / (data_length + index_length) * 100, 2) AS fragment_pct
FROM information_schema.tables
WHERE table_schema = 'ecommerce' AND data_free > 0;

-- 当碎片率 > 20% 时考虑重建
-- OPTIMIZE TABLE orders;  -- 会锁表，谨慎使用
-- ALTER TABLE orders ENGINE=InnoDB;  -- 效果相同（MySQL 8.0 可用 ONLINE DDL）
```

### 7.3 SQL 查询优化

#### 7.3.1 EXPLAIN 解读指南

```sql
-- EXPLAIN 输出列解读
EXPLAIN FORMAT=JSON
SELECT u.username, o.order_no, o.total_amount
FROM orders o
JOIN users u ON o.user_id = u.id
WHERE o.status = 'paid' AND o.created_at > '2024-01-01';

/*
关键指标解读:
┌──────────────┬──────────────────────────────────────────────┐
│ type         │ 访问类型 (从好到差):                           │
│              │ system > const > eq_ref > ref > range >       │
│              │ index > ALL                                   │
│              │ 目标: 至少达到 range, 最好 ref 及以上           │
├──────────────┼──────────────────────────────────────────────┤
│ key          │ 实际使用的索引                                 │
├──────────────┼──────────────────────────────────────────────┤
│ key_len      │ 使用的索引长度 (可判断用了联合索引的几列)       │
├──────────────┼──────────────────────────────────────────────┤
│ rows         │ 预估扫描行数 (越小越好)                        │
├──────────────┼──────────────────────────────────────────────┤
│ filtered     │ 按条件过滤后剩余行百分比 (越高越好)             │
├──────────────┼──────────────────────────────────────────────┤
│ Extra        │ Using index = 覆盖索引 ✅                      │
│              │ Using filesort = 需要额外排序 ⚠️               │
│              │ Using temporary = 使用临时表 ⚠️⚠️              │
│              │ Using where = 在 server 层过滤 ⚠️             │
│              │ Using index condition = ICP 优化 ✅           │
│              │ Using join buffer = join 无索引 ⚠️⚠️          │
└──────────────┴──────────────────────────────────────────────┘
*/
```

#### 7.3.2 常见 SQL 反模式与优化

```sql
-- ============================================
-- 常见 SQL 反模式与优化方案
-- ============================================

-- 反模式1: SELECT * (取出所有列)
-- ❌ SELECT * FROM users WHERE id = 1;
-- ✅ 只取需要的列，利于覆盖索引
-- SELECT id, username, email FROM users WHERE id = 1;

-- 反模式2: 在 WHERE 中使用 OR (可能导致全表扫描)
-- ❌ SELECT * FROM orders WHERE user_id = 1 OR status = 'paid';
-- ✅ 使用 UNION ALL 替代（每个子查询都能用上索引）
SELECT * FROM orders WHERE user_id = 1
UNION ALL
SELECT * FROM orders WHERE status = 'paid' AND user_id != 1;

-- 反模式3: 大范围 LIMIT 深分页
-- ❌ SELECT * FROM orders ORDER BY id LIMIT 100000, 20;
-- ✅ 方案A: 延迟关联
SELECT o.* FROM orders o
JOIN (SELECT id FROM orders ORDER BY id LIMIT 100000, 20) t ON o.id = t.id;
-- ✅ 方案B: 游标分页 (记住上次的 id)
SELECT * FROM orders WHERE id > 100000 ORDER BY id LIMIT 20;

-- 反模式4: 在 WHERE 中对列做运算
-- ❌ SELECT * FROM orders WHERE YEAR(created_at) = 2024;
-- ✅ SELECT * FROM orders WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';

-- 反模式5: JOIN 过多
-- ❌ 一次 JOIN 10 张表
-- ✅ 拆分为多次简单查询，在应用层组装；或将冗余数据整合

-- 反模式6: 在循环中执行 SQL (N+1 问题)
-- ❌
-- for user in users:
--     orders = db.query("SELECT * FROM orders WHERE user_id = ?", user.id)
-- ✅ 批量查询
-- user_ids = [u.id for u in users]
-- orders = db.query("SELECT * FROM orders WHERE user_id IN (?)", user_ids)
-- 按 user_id 分组后在应用层关联

-- 反模式7: 大量数据的 COUNT(*)
-- ❌ SELECT COUNT(*) FROM orders;  -- MyISAM 快，InnoDB 全表扫描
-- ✅ 使用近似值（EXPLAIN 中的 rows 估计值）或单独维护计数表
-- 或用 Redis 计数器: INCR order:count

-- 反模式8: NOT IN 子查询 (NULL 陷阱)
-- ❌ SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders);
--   如果 orders.user_id 有 NULL，整个 NOT IN 返回空!
-- ✅ SELECT * FROM users u WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);

-- 反模式9: 大事务长事务
-- ❌ 一个事务包含多次网络调用、文件处理
-- ✅ 事务只包裹必要的数据库操作，越短越好

-- 反模式10: 未使用预处理语句 (Prepared Statements)
-- ❌ 每次拼接 SQL 字符串 → 无法重用执行计划，有 SQL 注入风险
-- ✅ 使用参数化查询，执行计划可重用
-- PREPARE stmt FROM 'SELECT * FROM users WHERE id = ?';
-- EXECUTE stmt USING @user_id;
```

### 7.4 Schema 与表结构优化

```sql
-- ============================================
-- Schema 设计优化
-- ============================================

-- 1. 数据类型优化 — 越小越好
-- ❌ 用 VARCHAR(255) 存性别
-- ✅ 用 TINYINT 或 ENUM
-- ❌ 用 BIGINT 做主键（如果数据量不超过 42 亿）
-- ✅ 用 INT UNSIGNED (42亿)

-- 数据类型选择指南:
-- IP 地址:     INT UNSIGNED (INET_ATON)  ← 而非 VARCHAR(15)
-- 状态枚举:    TINYINT                     ← 而非 VARCHAR
-- 时间戳:      TIMESTAMP (4字节)           ← 而非 DATETIME (8字节) 如果范围够用
-- 布尔值:      TINYINT(1)                  ← 而非 CHAR(1)
-- UUID 主键:   BINARY(16)                  ← 而非 CHAR(36)

-- 2. 适当反范式化 (以空间换时间)
-- 范式化: 订单表 + 订单详情表 + 商品表 → JOIN 3 张表
-- 反范式: 订单详情表中冗余存储商品名、价格（快照）

-- 3. 垂直拆分 — 将大字段分离到独立表
CREATE TABLE orders_main (
    id BIGINT PRIMARY KEY,
    order_no VARCHAR(32),
    user_id BIGINT,
    total_amount DECIMAL(10,2),
    status TINYINT,
    created_at DATETIME
) ENGINE=InnoDB;

CREATE TABLE orders_extra (
    order_id BIGINT PRIMARY KEY,
    shipping_address TEXT,    -- 大字段
    user_remark TEXT,          -- 大字段
    internal_notes TEXT        -- 大字段
) ENGINE=InnoDB;

-- 4. 水平拆分 — 分区表
-- 按时间范围分区（MySQL 8.0+）
CREATE TABLE order_logs (
    id BIGINT AUTO_INCREMENT,
    user_id BIGINT,
    action VARCHAR(50),
    detail JSON,
    created_at DATETIME NOT NULL,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (TO_DAYS(created_at)) (
    PARTITION p202401 VALUES LESS THAN (TO_DAYS('2024-02-01')),
    PARTITION p202402 VALUES LESS THAN (TO_DAYS('2024-03-01')),
    PARTITION p202403 VALUES LESS THAN (TO_DAYS('2024-04-01')),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
-- 优势: 查询仅扫描相关分区，删除旧数据只需 TRUNCATE PARTITION

-- 5. 自增主键 vs UUID 主键
-- 自增主键: 插入快、索引小、但不适合分布式
-- UUID: 全局唯一、适合分布式、但插入慢（页分裂）、索引大
-- 折中方案: 雪花算法 (Snowflake) — 趋势递增 + 全局唯一 (如 Twitter Snowflake 64位)
```

### 7.5 连接池与并发优化

```python
# ============================================
# 数据库连接池优化 (Python)
# ============================================

# MySQL 连接池配置 (使用 SQLAlchemy)
from sqlalchemy import create_engine, pool
from sqlalchemy.orm import sessionmaker

# 连接池大小计算公式:
# 池大小 = ((core_count * 2) + effective_spindle_count)
# 例如: 4核 + 1 SSD = (4*2 + 1) = 9
# 但实际按业务峰值 QPS 和平均查询耗时计算更准确:
# connections = (peak_qps * avg_query_time_ms / 1000) * 1.2 (冗余)

engine = create_engine(
    'mysql+pymysql://user:pass@host:3306/db',
    poolclass=pool.QueuePool,
    pool_size=10,              # 常驻连接数
    max_overflow=20,           # 最大溢出连接数 (pool_size + max_overflow = 最大连接数)
    pool_timeout=30,           # 获取连接超时 (秒)
    pool_recycle=3600,         # 连接最大存活时间 (秒, 防止 MySQL wait_timeout 断开)
    pool_pre_ping=True,        # 每次检出前 ping 检测连接有效性 (重要!)
    echo_pool=False,           # 调试用: 打印连接池日志

    # 客户端超时
    connect_args={
        'connect_timeout': 10,      # 建连超时
        'read_timeout': 30,         # 读超时
        'write_timeout': 30,        # 写超时
        'charset': 'utf8mb4',
        'autocommit': False,
    }
)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# ============================================
# MySQL 服务端关键配置 (my.cnf)
# ============================================
"""
[mysqld]
# InnoDB 核心配置
innodb_buffer_pool_size = 8G           # 核心参数! 设为物理内存的 50%-70%
innodb_buffer_pool_instances = 8       # 多实例减少锁竞争 (>= 1GB 时建议)
innodb_log_file_size = 1G              # redo log 大小 (影响写入性能和恢复时间)
innodb_log_buffer_size = 64M           # redo log buffer
innodb_flush_log_at_trx_commit = 1     # 1=最安全 2=高性能(最多丢1秒数据)
innodb_flush_method = O_DIRECT         # 绕过 OS 缓存 (避免双重缓存)
innodb_io_capacity = 2000              # SSD 设为 2000+, HDD 保持 200
innodb_io_capacity_max = 4000          # 最大 IO 能力
innodb_read_io_threads = 8             # 读 IO 线程
innodb_write_io_threads = 8            # 写 IO 线程
innodb_thread_concurrency = 0          # 0=不限制并发线程数

# 连接相关
max_connections = 500                  # 最大连接数
thread_cache_size = 100                # 线程缓存 (避免频繁创建/销毁)
wait_timeout = 600                     # 非交互连接超时
interactive_timeout = 600              # 交互连接超时

# 查询缓存 (MySQL 8.0 已移除，用 Redis 替代)
# query_cache_type = 0

# 临时表
tmp_table_size = 64M                   # 内存临时表最大大小
max_heap_table_size = 64M              # 内存表最大大小

# 排序和 JOIN 缓冲区
sort_buffer_size = 4M                  # 排序缓冲区 (按需分配，不要设太大)
join_buffer_size = 4M                  # JOIN 缓冲区

# 慢查询日志
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 1                    # 超过1秒记录
log_queries_not_using_indexes = 1      # 记录未使用索引的查询
"""
```

### 7.6 读写分离与分库分表

```
读写分离架构:

           ┌─────────────┐
           │   应用层     │
           └──────┬──────┘
                  │
          ┌───────▼───────┐
          │  路由中间件    │  (ShardingSphere / ProxySQL / MyCat)
          │  · 写→主库     │
          │  · 读→从库     │
          │  · 负载均衡    │
          │  · 故障转移    │
          └───┬───────┬───┘
              │       │
    ┌─────────▼─┐  ┌──▼──────────┐
    │  Master   │  │  Slave 1..N │
    │  (写)     │──▶  (读)       │
    │           │  │              │
    └───────────┘  └──────────────┘
          │
     异步/半同步复制

分库分表策略:

  垂直拆分 (按业务):                    水平拆分 (按数据):
  ┌─────────────┐                    ┌─────────────────────┐
  │ 用户服务 DB  │                    │ order_db_0          │
  ├─────────────┤                    │  └── orders_0 (uid%4=0)│
  │ 订单服务 DB  │                    │  └── orders_1 (uid%4=1)│
  ├─────────────┤                    ├─────────────────────┤
  │ 商品服务 DB  │                    │ order_db_1          │
  ├─────────────┤                    │  └── orders_2 (uid%4=2)│
  │ 支付服务 DB  │                    │  └── orders_3 (uid%4=3)│
  └─────────────┘                    └─────────────────────┘

分片键选择原则:
  ✅ 选择: 查询中最常用的过滤条件
  ✅ 选择: 数据分布均匀的列 (如 user_id 取模)
  ❌ 避免: 数据倾斜严重的列 (如 status, 大部分是同一状态)
  ❌ 避免: 频繁更新的列

分片带来的挑战:
  1. 跨分片 JOIN → 应用层组装 或 冗余存储
  2. 跨分片事务 → 分布式事务 (Seata / TCC / SAGA)
  3. 全局唯一 ID → 雪花算法
  4. 扩容迁移 → 一致性哈希 / 双写迁移
```

### 7.7 缓存策略深度解析

```
缓存层级架构:

  ┌────────────────────────────────────────────┐
  │  L1: 应用本地缓存 (Caffeine/Guava)          │
  │  延迟: 纳秒级 | 容量: MB级                  │
  │  场景: 配置项、极热数据                      │
  ├────────────────────────────────────────────┤
  │  L2: 分布式缓存 (Redis/Memcached)           │
  │  延迟: 毫秒级 | 容量: GB-TB级               │
  │  场景: Session、热点数据、计数器             │
  ├────────────────────────────────────────────┤
  │  L3: 数据库查询缓存                          │
  │  延迟: 毫秒~秒级 | 容量: TB级               │
  │  场景: 复杂查询结果、物化视图                │
  ├────────────────────────────────────────────┤
  │  L4: 数据库 (MySQL/PostgreSQL)              │
  │  延迟: 毫秒~秒级 | 容量: 无限                │
  └────────────────────────────────────────────┘

缓存更新策略:
┌──────────────┬─────────────────────┬──────────────────────┐
│ 策略         │ 流程                 │ 适用场景              │
├──────────────┼─────────────────────┼──────────────────────┤
│ Cache-Aside  │ 读: 缓存→miss→DB→回填│ 最常用，读多写少       │
│              │ 写: 更新DB→删除缓存   │                      │
├──────────────┼─────────────────────┼──────────────────────┤
│ Read-Through │ 缓存自动查DB回填     │ 缓存层封装DB访问       │
├──────────────┼─────────────────────┼──────────────────────┤
│ Write-Through│ 同步写缓存+写DB      │ 数据强一致性要求       │
├──────────────┼─────────────────────┼──────────────────────┤
│ Write-Behind │ 先写缓存，异步刷DB    │ 高写入吞吐，允许丢数据  │
└──────────────┴─────────────────────┴──────────────────────┘

缓存三大问题:
  穿透: 查不存在的数据 → 布隆过滤器 + 缓存空值
  击穿: 热点key过期 → 互斥锁 + 永不过期(异步刷新)
  雪崩: 大量key同时过期 → TTL加随机值 + 多级缓存 + 限流降级
```

### 7.8 监控与慢查询分析

```sql
-- ============================================
-- MySQL 性能监控关键指标
-- ============================================

-- 1. 全局状态概览
SHOW GLOBAL STATUS LIKE '%Connection%';
SHOW GLOBAL STATUS LIKE '%Threads%';
SHOW GLOBAL STATUS LIKE '%Innodb_rows%';
SHOW GLOBAL STATUS LIKE '%Innodb_buffer_pool%';
SHOW GLOBAL STATUS LIKE '%Created_tmp%';  -- 临时表创建统计

-- 2. InnoDB Buffer Pool 命中率 (最关键的指标)
SELECT
    ROUND((
        (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests')
        - (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_reads')
    ) / (SELECT VARIABLE_VALUE FROM performance_schema.global_status WHERE VARIABLE_NAME = 'Innodb_buffer_pool_read_requests') * 100, 2
) AS buffer_pool_hit_rate;
-- 目标: > 99%

-- 3. 慢查询分析
-- 启用慢查询日志后:
-- mysqldumpslow -s t -t 10 /var/log/mysql/slow.log   # 按时间排序 TOP 10
-- pt-query-digest /var/log/mysql/slow.log             # Percona Toolkit 详细分析

-- 4. 实时查看正在执行的查询
SHOW FULL PROCESSLIST;

-- 5. 查看锁等待
SELECT * FROM information_schema.INNODB_TRX;          -- 当前事务
SELECT * FROM information_schema.INNODB_LOCKS;         -- 当前锁 (8.0 前)
SELECT * FROM performance_schema.data_locks;           -- 当前锁 (8.0+)
SELECT * FROM performance_schema.data_lock_waits;      -- 锁等待 (8.0+)

-- 6. 查看表锁竞争
SHOW STATUS LIKE 'Table_locks%';

-- 7. 死锁分析
SHOW ENGINE INNODB STATUS\G  -- 查看 LATEST DETECTED DEADLOCK 部分

-- 8. Performance Schema 分析 (MySQL 5.7+)
-- 找出哪类 SQL 消耗最多时间
SELECT
    DIGEST_TEXT,
    COUNT_STAR AS exec_count,
    ROUND(AVG_TIMER_WAIT / 1000000000, 2) AS avg_ms,
    ROUND(SUM_TIMER_WAIT / 1000000000, 2) AS total_ms,
    ROUND(SUM_ROWS_EXAMINED / COUNT_STAR, 0) AS avg_rows_examined,
    ROUND(SUM_ROWS_SENT / COUNT_STAR, 0) AS avg_rows_sent
FROM performance_schema.events_statements_summary_by_digest
WHERE SCHEMA_NAME = 'ecommerce'
ORDER BY SUM_TIMER_WAIT DESC
LIMIT 20;

-- 9. 找出未使用索引
SELECT
    t.TABLE_SCHEMA, t.TABLE_NAME, t.ROWS_READ, t.ROWS_CHANGED,
    t.ROWS_CHANGED_X_INDEXES,
    (CASE WHEN t.ROWS_CHANGED > 0
          THEN ROUND(100 - 100 * t.ROWS_CHANGED_X_INDEXES / t.ROWS_CHANGED, 2)
          ELSE 0 END) AS pct_index_not_used
FROM sys.schema_table_statistics t
WHERE t.TABLE_SCHEMA = 'ecommerce' AND t.ROWS_CHANGED > 1000
ORDER BY pct_index_not_used DESC;
```

### 7.9 优化检查清单 (Checklist)

```
数据库优化检查清单:
□ 1. 所有 WHERE/JOIN/ORDER BY 的列是否有合适索引？
□ 2. 是否有冗余或未使用的索引？（定期清理）
□ 3. 慢查询是否已全部分析和优化？
□ 4. SELECT 是否只取需要的列？（避免 SELECT *）
□ 5. 大表是否考虑分区或分表？
□ 6. Buffer Pool 命中率是否 > 99%？
□ 7. 是否有热点数据未使用缓存？
□ 8. 连接池大小是否合理？
□ 9. 事务是否尽可能短？
□ 10. 是否有隐式类型转换导致索引失效？
□ 11. 分页是否使用游标或延迟关联？
□ 12. 是否有大字段可以拆分到独立表？
□ 13. 读写是否分离？从库延迟是否可控？
□ 14. 备份策略是否完善？恢复演练是否做过？
□ 15. 监控告警是否覆盖核心指标？
```

---

## 八、 新兴趋势与未来

1.  **NewSQL (分布式 SQL)**: 结合了 RDBMS 的 ACID 特性和 NoSQL 的水平扩展能力 (如 **TiDB**, **CockroachDB**)。
2.  **云原生数据库 (Serverless/Cloud-Native)**: 极致的弹性缩放，按需付费 (如 **Amazon Aurora**, **PlanetScale**, **Neon**)。
3.  **多模型数据库 (Multi-model)**: 单个数据库支持多种模型（文档+关系+图），如 **ArangoDB**, **CosmosDB**。
4.  **HTAP (混合事务/分析处理)**: 同一个数据库既能处理高频事务，也能进行复杂的分析查询。

```
技术栈演进趋势:

2010s:  LAMP (Linux + Apache + MySQL + PHP)
        ↓
2015s:  RDBMS + Redis + MongoDB (多数据库并存)
        ↓
2020s:  分布式 NewSQL + 多模型数据库 + 向量数据库 (AI 时代)
        ↓
2025s+: 云原生 Serverless DB + AI-Native 数据库
        · TiDB Serverless / PlanetScale / Neon
        · 数据库内置 AI 推理 (pgvector, PostgresML)
        · 自然语言查询数据库 (Text-to-SQL)
        · 自适应调优 (AI-driven 索引建议、参数调优)
```

---

## 九、 结论

没有"最好"的数据库，只有"最适合"的数据库。

- **优先选择 RDBMS (如 PostgreSQL)**：如果你的数据关系复杂、一致性要求高，且处于项目早期。
- **考虑引入 NoSQL**：当你遇到 RDBMS 的性能瓶颈、数据模型极度灵活、或者有特殊的数据结构（如图或向量）需求时。

**最终决策应基于具体业务场景的 POC (概念验证) 测试结果，并结合团队的技术储备和运维成本。**

```
总结:

  ┌─────────────────────────────────────────────────────┐
  │                   选型决策速查表                       │
  │                                                       │
  │  你的需求                          → 推荐方案           │
  │  ─────────────────────────────────────────────────   │
  │  传统 Web 应用 (CRUD)              → PostgreSQL/MySQL │
  │  高并发读写 + 简单查询              → Redis (缓存)      │
  │  海量日志/时序数据                  → ClickHouse/ES    │
  │  灵活 Schema + 快速迭代            → MongoDB          │
  │  复杂关系查询 (社交/推荐)           → Neo4j            │
  │  全文搜索                         → Elasticsearch     │
  │  分布式事务 + 水平扩展              → TiDB/CockroachDB  │
  │  AI 向量搜索                       → Milvus/Pinecone  │
  │  物联网/时序监控                    → TimescaleDB      │
  │  嵌入式/移动端                     → SQLite           │
  │  企业级/合规要求                    → Oracle/SQL Server │
  └─────────────────────────────────────────────────────┘
```
