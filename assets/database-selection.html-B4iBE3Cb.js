import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as s,o as a,b as t}from"./app-ByTKU10L.js";const e={},p=t(`<h1 id="数据库技术选型指南" tabindex="-1"><a class="header-anchor" href="#数据库技术选型指南"><span>数据库技术选型指南</span></a></h1><h2 id="关系型与非关系型数据库的全面分析" tabindex="-1"><a class="header-anchor" href="#关系型与非关系型数据库的全面分析"><span>关系型与非关系型数据库的全面分析</span></a></h2><p>在软件开发中，数据库的选择对系统性能、可扩展性和维护成本有深远影响。本文将全面分析主流数据库类型的特点、适用场景及选择策略，帮助开发者做出明智的技术选型。</p><hr><h2 id="一、-数据库核心理论基础" tabindex="-1"><a class="header-anchor" href="#一、-数据库核心理论基础"><span>一、 数据库核心理论基础</span></a></h2><p>在深入具体数据库之前，理解以下两个核心理论对于选型至关重要。</p><h3 id="_1-1-cap-定理-cap-theorem" tabindex="-1"><a class="header-anchor" href="#_1-1-cap-定理-cap-theorem"><span>1.1 CAP 定理 (CAP Theorem)</span></a></h3><p>分布式系统无法同时完全满足以下三个特性：</p><ul><li><strong>Consistency (一致性)</strong>: 所有节点在同一时间看到相同的数据。</li><li><strong>Availability (可用性)</strong>: 每个请求都能收到成功或失败的响应（不保证是最新的数据）。</li><li><strong>Partition Tolerance (分区容错性)</strong>: 即使系统内部发生网络分区，系统仍能继续运行。</li></ul><blockquote><p><strong>选型建议</strong>：传统 RDBMS 通常倾向于 <strong>CA</strong>（单机）或 <strong>CP</strong>（分布式），而许多 NoSQL 数据库（如 Cassandra, CouchDB）则倾向于 <strong>AP</strong> 以获得极致的水平扩展能力。</p></blockquote><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>┌─────────────────────────────────────────────────────┐
│                    CAP 定理可视化                      │
│                                                       │
│           C (一致性)                                   │
│           /\\                                          │
│          /  \\                                         │
│         /    \\        CA: MySQL(单机), PostgreSQL     │
│        /  CA  \\       CP: HBase, MongoDB(多数配置)     │
│       /        \\      AP: Cassandra, CouchDB, DynamoDB│
│      /   CAP?   \\     (三者不可兼得)                   │
│     /            \\                                    │
│    /  CP      AP  \\                                   │
│   /                \\                                  │
│  A──────────────────P                                 │
│  (可用性)            (分区容错性)                       │
│                                                       │
│  现实: 分布式系统中 P 必须满足 → 只能在 C 和 A 之间权衡  │
└─────────────────────────────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_1-2-acid-vs-base" tabindex="-1"><a class="header-anchor" href="#_1-2-acid-vs-base"><span>1.2 ACID vs. BASE</span></a></h3><ul><li><strong>ACID (RDBMS 核心)</strong>: 原子性 (Atomicity)、一致性 (Consistency)、隔离性 (Isolation)、持久性 (Durability)。强调强一致性。</li><li><strong>BASE (NoSQL 核心)</strong>: 基本可用 (Basically Available)、软状态 (Soft state)、最终一致性 (Eventually consistent)。强调可用性和性能。</li></ul><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>ACID 事务模型 (银行转账为例):
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_1-3-事务隔离级别-isolation-levels" tabindex="-1"><a class="header-anchor" href="#_1-3-事务隔离级别-isolation-levels"><span>1.3 事务隔离级别 (Isolation Levels)</span></a></h3><table><thead><tr><th style="text-align:left;">隔离级别</th><th style="text-align:center;">脏读</th><th style="text-align:center;">不可重复读</th><th style="text-align:center;">幻读</th><th style="text-align:center;">性能</th><th style="text-align:left;">默认使用</th></tr></thead><tbody><tr><td style="text-align:left;"><strong>READ UNCOMMITTED</strong></td><td style="text-align:center;">✓</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓</td><td style="text-align:center;">最高</td><td style="text-align:left;">-</td></tr><tr><td style="text-align:left;"><strong>READ COMMITTED</strong></td><td style="text-align:center;">✗</td><td style="text-align:center;">✓</td><td style="text-align:center;">✓</td><td style="text-align:center;">高</td><td style="text-align:left;">PostgreSQL, SQL Server, Oracle</td></tr><tr><td style="text-align:left;"><strong>REPEATABLE READ</strong></td><td style="text-align:center;">✗</td><td style="text-align:center;">✗</td><td style="text-align:center;">✓</td><td style="text-align:center;">中</td><td style="text-align:left;">MySQL (InnoDB)</td></tr><tr><td style="text-align:left;"><strong>SERIALIZABLE</strong></td><td style="text-align:center;">✗</td><td style="text-align:center;">✗</td><td style="text-align:center;">✗</td><td style="text-align:center;">最低</td><td style="text-align:left;">严格场景</td></tr></tbody></table><hr><h2 id="二、-数据库分类概览" tabindex="-1"><a class="header-anchor" href="#二、-数据库分类概览"><span>二、 数据库分类概览</span></a></h2><p>数据库主要分为两大类：<strong>关系型数据库 (RDBMS)</strong> 和 <strong>非关系型数据库 (NoSQL)</strong>。</p><h3 id="_2-1-关系型数据库-rdbms" tabindex="-1"><a class="header-anchor" href="#_2-1-关系型数据库-rdbms"><span>2.1 关系型数据库 (RDBMS)</span></a></h3><ol><li><p><strong>主要特点</strong></p><ul><li>基于关系模型，使用结构化查询语言 (SQL)。</li><li>预定义模式 (Schema)，数据存储在固定的表格中。</li><li>强一致性支持，完善的事务处理 (ACID)。</li><li>通过外键维护表间关联。</li></ul></li><li><p><strong>主流产品</strong></p><ul><li><strong>MySQL/MariaDB</strong>: 开源，Web 应用首选，生态极佳。</li><li><strong>PostgreSQL</strong>: 开源，功能最强大，支持复杂数据类型（如 JSONB、GIS）。</li><li><strong>Oracle</strong>: 商业巨头，企业级应用，功能极其丰富但成本高。</li><li><strong>SQL Server</strong>: 微软生态，与 .NET 深度集成。</li><li><strong>SQLite</strong>: 轻量级，嵌入式应用，单文件存储。</li></ul></li><li><p><strong>优缺点分析</strong></p><ul><li><strong>优点</strong>: 数据一致性高、成熟稳定、复杂查询能力强、标准化程度高。</li><li><strong>缺点</strong>: 水平扩展困难（通常靠读写分离或分库分表）、高并发下写入瓶颈、模式变更（DDL）成本高。</li></ul></li></ol><h3 id="_2-2-非关系型数据库-nosql" tabindex="-1"><a class="header-anchor" href="#_2-2-非关系型数据库-nosql"><span>2.2 非关系型数据库 (NoSQL)</span></a></h3><ol><li><p><strong>主要分类</strong></p><ul><li><strong>键值存储 (Key-Value)</strong>: <ul><li><em>代表</em>: Redis, Memcached</li><li><em>特点</em>: 极其高效的读写，简单的 O(1) 查询。</li><li><em>场景</em>: 缓存、会话存储、计数器。</li></ul></li><li><strong>文档存储 (Document)</strong>: <ul><li><em>代表</em>: MongoDB, CouchDB</li><li><em>特点</em>: 存储类似 JSON 的文档，模式灵活 (Schema-less)。</li><li><em>场景</em>: 内容管理、产品目录、实时分析。</li></ul></li><li><strong>列族存储 (Column-Family)</strong>: <ul><li><em>代表</em>: Cassandra, HBase</li><li><em>特点</em>: 高可扩展性，适合海量数据的稀疏存储。</li><li><em>场景</em>: 日志数据、物联网数据、时间序列数据。</li></ul></li><li><strong>图数据库 (Graph)</strong>: <ul><li><em>代表</em>: Neo4j, ArangoDB</li><li><em>特点</em>: 专注于处理节点间的复杂关系。</li><li><em>场景</em>: 社交网络、推荐系统、反欺诈。</li></ul></li><li><strong>向量数据库 (Vector Database) ✨ 新趋势</strong>: <ul><li><em>代表</em>: Pinecone, Milvus, Weaviate</li><li><em>特点</em>: 存储和检索高维向量，支持相似性搜索。</li><li><em>场景</em>: AI/大模型 RAG 架构、图像检索、推荐系统。</li></ul></li></ul></li><li><p><strong>优缺点分析</strong></p><ul><li><strong>优点</strong>: 高水平扩展能力、灵活的数据模型、高性能读写、适合非结构化数据。</li><li><strong>缺点</strong>: 事务支持通常较弱、查询功能相对简单、标准化程度低、生态不如 RDBMS 成熟。</li></ul></li></ol><hr><h2 id="三、-rdbms-vs-nosql-深度对比" tabindex="-1"><a class="header-anchor" href="#三、-rdbms-vs-nosql-深度对比"><span>三、 RDBMS vs. NoSQL 深度对比</span></a></h2><table><thead><tr><th style="text-align:left;">特性</th><th style="text-align:left;">关系型数据库 (RDBMS)</th><th style="text-align:left;">非关系型数据库 (NoSQL)</th></tr></thead><tbody><tr><td style="text-align:left;"><strong>数据模型</strong></td><td style="text-align:left;">结构化、预定义 Schema (表格)</td><td style="text-align:left;">灵活、Schema-less (文档, 键值, 图)</td></tr><tr><td style="text-align:left;"><strong>查询语言</strong></td><td style="text-align:left;">SQL (标准统一)</td><td style="text-align:left;">各式各样 (如 MongoDB Query, Gremlin)</td></tr><tr><td style="text-align:left;"><strong>扩展方式</strong></td><td style="text-align:left;">垂直扩展 (Vertical/Up) 为主</td><td style="text-align:left;">水平扩展 (Horizontal/Out) 为主</td></tr><tr><td style="text-align:left;"><strong>事务支持</strong></td><td style="text-align:left;">强 ACID 事务</td><td style="text-align:left;">最终一致性 (BASE)，部分支持原子操作</td></tr><tr><td style="text-align:left;"><strong>数据关联</strong></td><td style="text-align:left;">强大的 JOIN 操作</td><td style="text-align:left;">倾向于数据去范式化 (Denormalization)</td></tr><tr><td style="text-align:left;"><strong>一致性</strong></td><td style="text-align:left;">强一致性</td><td style="text-align:left;">最终一致性</td></tr><tr><td style="text-align:left;"><strong>适用场景</strong></td><td style="text-align:left;">核心业务、财务系统、复杂关联查询</td><td style="text-align:left;">大数据量、高并发写入、快速迭代</td></tr></tbody></table><hr><h2 id="四、-主流数据库深度对比分析" tabindex="-1"><a class="header-anchor" href="#四、-主流数据库深度对比分析"><span>四、 主流数据库深度对比分析</span></a></h2><h3 id="_4-1-mysql-vs-postgresql-—-开源-rdbms-双雄对决" tabindex="-1"><a class="header-anchor" href="#_4-1-mysql-vs-postgresql-—-开源-rdbms-双雄对决"><span>4.1 MySQL vs PostgreSQL — 开源 RDBMS 双雄对决</span></a></h3><p>这是技术选型中最常见的二选一场景。两者都是成熟的开源关系型数据库，但设计哲学差异明显。</p><table><thead><tr><th style="text-align:left;">维度</th><th style="text-align:left;">MySQL</th><th style="text-align:left;">PostgreSQL</th></tr></thead><tbody><tr><td style="text-align:left;"><strong>架构</strong></td><td style="text-align:left;">多存储引擎架构 (InnoDB/MyISAM)</td><td style="text-align:left;">统一引擎，进程模型 (每连接一进程)</td></tr><tr><td style="text-align:left;"><strong>SQL 标准</strong></td><td style="text-align:left;">部分遵循 SQL:2016</td><td style="text-align:left;">最完整遵循 SQL 标准</td></tr><tr><td style="text-align:left;"><strong>并发控制</strong></td><td style="text-align:left;">InnoDB: MVCC + 行级锁</td><td style="text-align:left;">MVCC (无回滚段，多版本存储)</td></tr><tr><td style="text-align:left;"><strong>索引类型</strong></td><td style="text-align:left;">B+Tree, Full-text, Spatial (R-Tree)</td><td style="text-align:left;">B+Tree, Hash, GiST, GIN, BRIN, SP-GiST</td></tr><tr><td style="text-align:left;"><strong>JSON 支持</strong></td><td style="text-align:left;">JSON 类型 (5.7+)，函数有限</td><td style="text-align:left;">JSONB (二进制JSON) + GIN 索引，功能强大</td></tr><tr><td style="text-align:left;"><strong>全文搜索</strong></td><td style="text-align:left;">内置，仅 InnoDB (5.6+)</td><td style="text-align:left;">内置 <code>tsvector</code>，功能更强大</td></tr><tr><td style="text-align:left;"><strong>窗口函数</strong></td><td style="text-align:left;">8.0+ 支持</td><td style="text-align:left;">9.0+ 支持，更成熟</td></tr><tr><td style="text-align:left;"><strong>CTE/WITH</strong></td><td style="text-align:left;">8.0+ 支持 (不支持递归CTE优化)</td><td style="text-align:left;">完整支持 (WITH RECURSIVE)</td></tr><tr><td style="text-align:left;"><strong>地理空间</strong></td><td style="text-align:left;">基本 GIS 支持</td><td style="text-align:left;">PostGIS 扩展，行业标准</td></tr><tr><td style="text-align:left;"><strong>复制</strong></td><td style="text-align:left;">异步/半同步复制，Group Replication</td><td style="text-align:left;">流复制 (异步/同步)，逻辑复制</td></tr><tr><td style="text-align:left;"><strong>扩展性</strong></td><td style="text-align:left;">插件有限</td><td style="text-align:left;">丰富的扩展生态 (PostGIS, Citus, TimescaleDB)</td></tr><tr><td style="text-align:left;"><strong>License</strong></td><td style="text-align:left;">GPL</td><td style="text-align:left;">PostgreSQL License (类似 MIT)</td></tr><tr><td style="text-align:left;"><strong>社区/商业</strong></td><td style="text-align:left;">Oracle 主导，有企业版</td><td style="text-align:left;">纯社区驱动，无单一商业实体控制</td></tr></tbody></table><p><strong>选型决策树:</strong></p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>需要地理空间高级功能? ──Yes──&gt; PostgreSQL + PostGIS
       │
      No
       │
      ▼
需要严格SQL标准/复杂查询? ──Yes──&gt; PostgreSQL
       │
      No
       │
      ▼
简单CRUD为主/读多写少? ──Yes──&gt; MySQL (更简单运维)
       │
      No
       │
      ▼
需要时序/分析扩展? ──Yes──&gt; PostgreSQL (TimescaleDB/Citus)
       │
      No
       │
      ▼
团队更熟悉哪个? ──&gt; 选择熟悉的 (两者都能胜任大多数场景)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-2-mysql-innodb-存储引擎深度解析" tabindex="-1"><a class="header-anchor" href="#_4-2-mysql-innodb-存储引擎深度解析"><span>4.2 MySQL InnoDB 存储引擎深度解析</span></a></h3><p>InnoDB 是 MySQL 的默认存储引擎，理解其内部机制对性能优化至关重要。</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>InnoDB 架构图:
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-3-postgresql-高级特性" tabindex="-1"><a class="header-anchor" href="#_4-3-postgresql-高级特性"><span>4.3 PostgreSQL 高级特性</span></a></h3><p>PostgreSQL 被称为&quot;最先进的开源数据库&quot;，其独特功能远超传统 RDBMS 范畴。</p><table><thead><tr><th style="text-align:left;">特性</th><th style="text-align:left;">说明</th><th style="text-align:left;">典型场景</th></tr></thead><tbody><tr><td style="text-align:left;"><strong>JSONB</strong></td><td style="text-align:left;">二进制 JSON，支持 GIN 索引</td><td style="text-align:left;">半结构化数据、API 响应缓存</td></tr><tr><td style="text-align:left;"><strong>PostGIS</strong></td><td style="text-align:left;">地理空间扩展，OGC 标准</td><td style="text-align:left;">地图、LBS、物流路径规划</td></tr><tr><td style="text-align:left;"><strong>Citus</strong></td><td style="text-align:left;">分布式扩展 (水平分片)</td><td style="text-align:left;">多租户 SaaS、实时分析</td></tr><tr><td style="text-align:left;"><strong>TimescaleDB</strong></td><td style="text-align:left;">时序数据库扩展</td><td style="text-align:left;">IoT 数据、监控指标、金融K线</td></tr><tr><td style="text-align:left;"><strong>pgvector</strong></td><td style="text-align:left;">向量相似性搜索</td><td style="text-align:left;">AI RAG 架构、语义搜索</td></tr><tr><td style="text-align:left;"><strong>FDW</strong></td><td style="text-align:left;">外部数据包装器 (跨库查询)</td><td style="text-align:left;">数据联邦、异构数据整合</td></tr><tr><td style="text-align:left;"><strong>Table Inheritance</strong></td><td style="text-align:left;">原生表继承</td><td style="text-align:left;">分区表、日志归档</td></tr><tr><td style="text-align:left;"><strong>LISTEN/NOTIFY</strong></td><td style="text-align:left;">内置消息通知</td><td style="text-align:left;">实时推送、缓存失效通知</td></tr><tr><td style="text-align:left;"><strong>Row-Level Security</strong></td><td style="text-align:left;">行级安全策略</td><td style="text-align:left;">多租户数据隔离</td></tr><tr><td style="text-align:left;"><strong>Parallel Query</strong></td><td style="text-align:left;">并行查询执行</td><td style="text-align:left;">大表聚合、复杂分析</td></tr></tbody></table><h3 id="_4-4-nosql-数据库横向对比" tabindex="-1"><a class="header-anchor" href="#_4-4-nosql-数据库横向对比"><span>4.4 NoSQL 数据库横向对比</span></a></h3><table><thead><tr><th style="text-align:left;">维度</th><th style="text-align:left;">MongoDB</th><th style="text-align:left;">Redis</th><th style="text-align:left;">Cassandra</th><th style="text-align:left;">Elasticsearch</th><th style="text-align:left;">Neo4j</th></tr></thead><tbody><tr><td style="text-align:left;"><strong>类型</strong></td><td style="text-align:left;">文档型</td><td style="text-align:left;">键值/内存</td><td style="text-align:left;">列族宽表</td><td style="text-align:left;">搜索引擎</td><td style="text-align:left;">图数据库</td></tr><tr><td style="text-align:left;"><strong>数据模型</strong></td><td style="text-align:left;">BSON 文档</td><td style="text-align:left;">多种数据结构</td><td style="text-align:left;">宽行/列族</td><td style="text-align:left;">JSON 文档(倒排索引)</td><td style="text-align:left;">节点+关系+属性</td></tr><tr><td style="text-align:left;"><strong>查询方式</strong></td><td style="text-align:left;">MQL (类JSON)</td><td style="text-align:left;">命令/脚本</td><td style="text-align:left;">CQL (类SQL)</td><td style="text-align:left;">DSL (JSON) / SQL</td><td style="text-align:left;">Cypher (图查询)</td></tr><tr><td style="text-align:left;"><strong>事务</strong></td><td style="text-align:left;">多文档 ACID (4.0+)</td><td style="text-align:left;">单命令原子性</td><td style="text-align:left;">行级原子性</td><td style="text-align:left;">无</td><td style="text-align:left;">完整 ACID</td></tr><tr><td style="text-align:left;"><strong>扩展</strong></td><td style="text-align:left;">自动分片</td><td style="text-align:left;">集群/哨兵</td><td style="text-align:left;">无主去中心化</td><td style="text-align:left;">自动分片</td><td style="text-align:left;">读副本集群</td></tr><tr><td style="text-align:left;"><strong>一致性</strong></td><td style="text-align:left;">可配置 (多数写)</td><td style="text-align:left;">主从最终一致</td><td style="text-align:left;">可调一致性</td><td style="text-align:left;">近实时</td><td style="text-align:left;">强一致</td></tr><tr><td style="text-align:left;"><strong>写入性能</strong></td><td style="text-align:left;">高 (10万+/s)</td><td style="text-align:left;">极高 (10万+/s 内存)</td><td style="text-align:left;">极高 (线性扩展)</td><td style="text-align:left;">中 (索引开销)</td><td style="text-align:left;">中</td></tr><tr><td style="text-align:left;"><strong>读取性能</strong></td><td style="text-align:left;">高 (索引查询)</td><td style="text-align:left;">极高 (微秒级)</td><td style="text-align:left;">高 (主键查询)</td><td style="text-align:left;">极高 (全文搜索)</td><td style="text-align:left;">高 (图遍历)</td></tr><tr><td style="text-align:left;"><strong>典型QPS</strong></td><td style="text-align:left;">1万~10万</td><td style="text-align:left;">10万~100万</td><td style="text-align:left;">10万~100万</td><td style="text-align:left;">1千~1万</td><td style="text-align:left;">1千~5千</td></tr></tbody></table><h3 id="_4-5-redis-深度解析" tabindex="-1"><a class="header-anchor" href="#_4-5-redis-深度解析"><span>4.5 Redis 深度解析</span></a></h3><p>Redis 虽然被归类为键值存储，但其丰富的数据结构使其能胜任多种场景。</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>Redis 数据结构与应用场景映射:

String (字符串)
├── 缓存: SET key value EX 3600
├── 计数器: INCR page:view:article:123
├── 分布式锁: SET lock:order:123 uuid NX EX 30
└── 限流: INCR + EXPIRE (滑动窗口)

Hash (哈希表)
├── 用户信息: HSET user:1001 name &quot;张三&quot; age 25
├── 购物车: HSET cart:1001 sku:001 2 sku:002 1
└── 配置项: HSET config:app max_conn 100

List (链表)
├── 消息队列: LPUSH queue:task + BRPOP queue:task 0
├── 最新动态: LPUSH timeline:user:1 &quot;新消息&quot; + LTRIM (保留最近N条)
└── 栈结构: LPUSH + LPOP

Set (集合)
├── 标签系统: SADD article:1:tags &quot;java&quot; &quot;redis&quot;
├── 共同好友: SINTER user:1:friends user:2:friends
├── 抽奖去重: SADD lottery:round:5 user:1001
└── 可能认识: SDIFF user:2:friends user:1:friends → 推荐给 user:1

Sorted Set (有序集合)
├── 排行榜: ZADD leaderboard score player_id → ZREVRANGE
├── 延时队列: ZADD delay:queue timestamp task_json
├── 滑动窗口限流: ZADD rate:user:1 now score + ZREMRANGEBYSCORE
└── 带权重的标签: ZADD tags:article 10 &quot;热门&quot; 5 &quot;推荐&quot;

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
└── 配送范围: GEOADD stores 经 纬 &quot;店名&quot;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-6-mongodb-vs-postgresql-jsonb-—-文档存储之争" tabindex="-1"><a class="header-anchor" href="#_4-6-mongodb-vs-postgresql-jsonb-—-文档存储之争"><span>4.6 MongoDB vs PostgreSQL JSONB — 文档存储之争</span></a></h3><p>PostgreSQL 的 JSONB 支持使其在功能上直接对标 MongoDB，这在选型时经常引发讨论。</p><table><thead><tr><th style="text-align:left;">维度</th><th style="text-align:left;">MongoDB</th><th style="text-align:left;">PostgreSQL JSONB</th></tr></thead><tbody><tr><td style="text-align:left;"><strong>文档查询</strong></td><td style="text-align:left;">原生、简洁的 MQL</td><td style="text-align:left;">SQL/JSON Path (稍复杂)</td></tr><tr><td style="text-align:left;"><strong>索引</strong></td><td style="text-align:left;">单字段、复合、多键、文本、地理、TTL</td><td style="text-align:left;">B-Tree, GIN, 表达式索引</td></tr><tr><td style="text-align:left;"><strong>Schema 灵活性</strong></td><td style="text-align:left;">完全 Schema-less</td><td style="text-align:left;">JSONB 列可以 Schema-less (但表结构固定)</td></tr><tr><td style="text-align:left;"><strong>ACID</strong></td><td style="text-align:left;">4.0+ 多文档事务</td><td style="text-align:left;">完整、成熟的事务支持</td></tr><tr><td style="text-align:left;"><strong>JOIN</strong></td><td style="text-align:left;">$lookup (有限), 建议嵌套</td><td style="text-align:left;">强大的 JOIN + JSONB 混合</td></tr><tr><td style="text-align:left;"><strong>聚合管道</strong></td><td style="text-align:left;">强大的 Aggregation Pipeline</td><td style="text-align:left;">SQL GROUP BY + 窗口函数 + JSON 函数</td></tr><tr><td style="text-align:left;"><strong>水平扩展</strong></td><td style="text-align:left;">原生分片</td><td style="text-align:left;">需 Citus 扩展或应用层分片</td></tr><tr><td style="text-align:left;"><strong>运维复杂度</strong></td><td style="text-align:left;">中等</td><td style="text-align:left;">成熟工具链</td></tr><tr><td style="text-align:left;"><strong>License</strong></td><td style="text-align:left;">SSPL (有争议)</td><td style="text-align:left;">PostgreSQL License</td></tr></tbody></table><p><strong>选型建议:</strong></p><ul><li><strong>选 MongoDB</strong>: 纯文档型应用、数据模型高度动态、需要自动分片、团队偏好 JSON 优先</li><li><strong>选 PostgreSQL + JSONB</strong>: 同时需要关系型和文档型、强事务要求、已有 PostgreSQL 基础设施</li></ul><hr><h2 id="五、-数据库选型决策流程" tabindex="-1"><a class="header-anchor" href="#五、-数据库选型决策流程"><span>五、 数据库选型决策流程</span></a></h2><p>在决定使用哪种数据库时，请参考以下决策路径：</p><h3 id="_1-核心考量因素" tabindex="-1"><a class="header-anchor" href="#_1-核心考量因素"><span>1. 核心考量因素</span></a></h3><ul><li><strong>数据结构</strong>: 结构化数据 (SQL) vs. 半结构化/非结构化数据 (NoSQL)。</li><li><strong>一致性要求</strong>: 必须实时准确 (SQL) vs. 允许短暂延迟 (NoSQL)。</li><li><strong>扩展需求</strong>: 预期数据量和 QPS 是否会达到单机瓶颈？</li><li><strong>查询复杂度</strong>: 是否需要频繁进行多表关联查询？</li><li><strong>开发敏捷度</strong>: 业务模型是否频繁变更？</li></ul><h3 id="_2-混合架构策略-polyglot-persistence" tabindex="-1"><a class="header-anchor" href="#_2-混合架构策略-polyglot-persistence"><span>2. 混合架构策略 (Polyglot Persistence)</span></a></h3><p>现代互联网应用很少只使用一种数据库。典型组合如下：</p><ul><li><strong>核心业务数据</strong>: MySQL / PostgreSQL (保存用户信息、订单、财务)</li><li><strong>高性能缓存</strong>: Redis (热点数据、Session、分布式锁)</li><li><strong>用户行为/日志</strong>: MongoDB / Cassandra (海量、非结构化、快速写入)</li><li><strong>全文搜索</strong>: Elasticsearch (复杂搜索、聚合分析)</li><li><strong>AI 增强</strong>: Milvus / Pinecone (存储向量嵌入)</li></ul><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>典型电商系统数据库架构:

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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="六、-实践-demo-—-各数据库入门操作" tabindex="-1"><a class="header-anchor" href="#六、-实践-demo-—-各数据库入门操作"><span>六、 实践 Demo — 各数据库入门操作</span></a></h2><h3 id="_6-1-mysql-—-电商订单系统-demo" tabindex="-1"><a class="header-anchor" href="#_6-1-mysql-—-电商订单系统-demo"><span>6.1 MySQL — 电商订单系统 Demo</span></a></h3><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token comment">-- ============================================</span>
<span class="token comment">-- MySQL 电商订单系统 Demo</span>
<span class="token comment">-- ============================================</span>

<span class="token comment">-- 1. 创建数据库和表</span>
<span class="token keyword">CREATE</span> <span class="token keyword">DATABASE</span> <span class="token keyword">IF</span> <span class="token operator">NOT</span> <span class="token keyword">EXISTS</span> ecommerce <span class="token keyword">DEFAULT</span> <span class="token keyword">CHARSET</span> utf8mb4 <span class="token keyword">COLLATE</span> utf8mb4_unicode_ci<span class="token punctuation">;</span>
<span class="token keyword">USE</span> ecommerce<span class="token punctuation">;</span>

<span class="token comment">-- 用户表</span>
<span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> users <span class="token punctuation">(</span>
    id <span class="token keyword">BIGINT</span> <span class="token keyword">UNSIGNED</span> <span class="token keyword">AUTO_INCREMENT</span> <span class="token keyword">PRIMARY</span> <span class="token keyword">KEY</span><span class="token punctuation">,</span>
    username <span class="token keyword">VARCHAR</span><span class="token punctuation">(</span><span class="token number">50</span><span class="token punctuation">)</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    email <span class="token keyword">VARCHAR</span><span class="token punctuation">(</span><span class="token number">100</span><span class="token punctuation">)</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    phone <span class="token keyword">VARCHAR</span><span class="token punctuation">(</span><span class="token number">20</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">status</span> <span class="token keyword">TINYINT</span> <span class="token keyword">DEFAULT</span> <span class="token number">1</span> <span class="token keyword">COMMENT</span> <span class="token string">&#39;1:正常 0:禁用&#39;</span><span class="token punctuation">,</span>
    created_at <span class="token keyword">DATETIME</span> <span class="token keyword">DEFAULT</span> <span class="token keyword">CURRENT_TIMESTAMP</span><span class="token punctuation">,</span>
    updated_at <span class="token keyword">DATETIME</span> <span class="token keyword">DEFAULT</span> <span class="token keyword">CURRENT_TIMESTAMP</span> <span class="token keyword">ON</span> <span class="token keyword">UPDATE</span> <span class="token keyword">CURRENT_TIMESTAMP</span><span class="token punctuation">,</span>
    <span class="token keyword">UNIQUE</span> <span class="token keyword">KEY</span> uk_email <span class="token punctuation">(</span>email<span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">UNIQUE</span> <span class="token keyword">KEY</span> uk_username <span class="token punctuation">(</span>username<span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">KEY</span> idx_status <span class="token punctuation">(</span><span class="token keyword">status</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">KEY</span> idx_created_at <span class="token punctuation">(</span>created_at<span class="token punctuation">)</span>
<span class="token punctuation">)</span> <span class="token keyword">ENGINE</span><span class="token operator">=</span><span class="token keyword">InnoDB</span> <span class="token keyword">DEFAULT</span> <span class="token keyword">CHARSET</span><span class="token operator">=</span>utf8mb4 <span class="token keyword">COMMENT</span><span class="token operator">=</span><span class="token string">&#39;用户表&#39;</span><span class="token punctuation">;</span>

<span class="token comment">-- 商品表</span>
<span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> products <span class="token punctuation">(</span>
    id <span class="token keyword">BIGINT</span> <span class="token keyword">UNSIGNED</span> <span class="token keyword">AUTO_INCREMENT</span> <span class="token keyword">PRIMARY</span> <span class="token keyword">KEY</span><span class="token punctuation">,</span>
    title <span class="token keyword">VARCHAR</span><span class="token punctuation">(</span><span class="token number">200</span><span class="token punctuation">)</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    description <span class="token keyword">TEXT</span><span class="token punctuation">,</span>
    price <span class="token keyword">DECIMAL</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">)</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span> <span class="token keyword">COMMENT</span> <span class="token string">&#39;价格，精确到分&#39;</span><span class="token punctuation">,</span>
    stock <span class="token keyword">INT</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span> <span class="token keyword">DEFAULT</span> <span class="token number">0</span> <span class="token keyword">COMMENT</span> <span class="token string">&#39;库存&#39;</span><span class="token punctuation">,</span>
    category_id <span class="token keyword">INT</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    <span class="token keyword">status</span> <span class="token keyword">TINYINT</span> <span class="token keyword">DEFAULT</span> <span class="token number">1</span><span class="token punctuation">,</span>
    created_at <span class="token keyword">DATETIME</span> <span class="token keyword">DEFAULT</span> <span class="token keyword">CURRENT_TIMESTAMP</span><span class="token punctuation">,</span>
    <span class="token keyword">KEY</span> idx_category <span class="token punctuation">(</span>category_id<span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">KEY</span> idx_price <span class="token punctuation">(</span>price<span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">KEY</span> idx_category_price <span class="token punctuation">(</span>category_id<span class="token punctuation">,</span> price<span class="token punctuation">)</span> <span class="token keyword">COMMENT</span> <span class="token string">&#39;复合索引：按分类+价格查询&#39;</span><span class="token punctuation">,</span>
    FULLTEXT <span class="token keyword">KEY</span> ft_title_desc <span class="token punctuation">(</span>title<span class="token punctuation">,</span> description<span class="token punctuation">)</span> <span class="token keyword">COMMENT</span> <span class="token string">&#39;全文索引，支持中文需 ngram parser&#39;</span>
<span class="token punctuation">)</span> <span class="token keyword">ENGINE</span><span class="token operator">=</span><span class="token keyword">InnoDB</span> <span class="token keyword">DEFAULT</span> <span class="token keyword">CHARSET</span><span class="token operator">=</span>utf8mb4 <span class="token keyword">COMMENT</span><span class="token operator">=</span><span class="token string">&#39;商品表&#39;</span><span class="token punctuation">;</span>

<span class="token comment">-- 订单表</span>
<span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> orders <span class="token punctuation">(</span>
    id <span class="token keyword">BIGINT</span> <span class="token keyword">UNSIGNED</span> <span class="token keyword">AUTO_INCREMENT</span> <span class="token keyword">PRIMARY</span> <span class="token keyword">KEY</span><span class="token punctuation">,</span>
    order_no <span class="token keyword">VARCHAR</span><span class="token punctuation">(</span><span class="token number">32</span><span class="token punctuation">)</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span> <span class="token keyword">COMMENT</span> <span class="token string">&#39;订单号&#39;</span><span class="token punctuation">,</span>
    user_id <span class="token keyword">BIGINT</span> <span class="token keyword">UNSIGNED</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    total_amount <span class="token keyword">DECIMAL</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">)</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    <span class="token keyword">status</span> <span class="token keyword">ENUM</span><span class="token punctuation">(</span><span class="token string">&#39;pending&#39;</span><span class="token punctuation">,</span><span class="token string">&#39;paid&#39;</span><span class="token punctuation">,</span><span class="token string">&#39;shipped&#39;</span><span class="token punctuation">,</span><span class="token string">&#39;completed&#39;</span><span class="token punctuation">,</span><span class="token string">&#39;cancelled&#39;</span><span class="token punctuation">)</span> <span class="token keyword">DEFAULT</span> <span class="token string">&#39;pending&#39;</span><span class="token punctuation">,</span>
    pay_time <span class="token keyword">DATETIME</span><span class="token punctuation">,</span>
    created_at <span class="token keyword">DATETIME</span> <span class="token keyword">DEFAULT</span> <span class="token keyword">CURRENT_TIMESTAMP</span><span class="token punctuation">,</span>
    <span class="token keyword">UNIQUE</span> <span class="token keyword">KEY</span> uk_order_no <span class="token punctuation">(</span>order_no<span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">KEY</span> idx_user_id <span class="token punctuation">(</span>user_id<span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">KEY</span> idx_status_created <span class="token punctuation">(</span><span class="token keyword">status</span><span class="token punctuation">,</span> created_at<span class="token punctuation">)</span> <span class="token keyword">COMMENT</span> <span class="token string">&#39;按状态+时间查询&#39;</span>
<span class="token punctuation">)</span> <span class="token keyword">ENGINE</span><span class="token operator">=</span><span class="token keyword">InnoDB</span> <span class="token keyword">DEFAULT</span> <span class="token keyword">CHARSET</span><span class="token operator">=</span>utf8mb4 <span class="token keyword">COMMENT</span><span class="token operator">=</span><span class="token string">&#39;订单表&#39;</span><span class="token punctuation">;</span>

<span class="token comment">-- 订单明细表</span>
<span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> order_items <span class="token punctuation">(</span>
    id <span class="token keyword">BIGINT</span> <span class="token keyword">UNSIGNED</span> <span class="token keyword">AUTO_INCREMENT</span> <span class="token keyword">PRIMARY</span> <span class="token keyword">KEY</span><span class="token punctuation">,</span>
    order_id <span class="token keyword">BIGINT</span> <span class="token keyword">UNSIGNED</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    product_id <span class="token keyword">BIGINT</span> <span class="token keyword">UNSIGNED</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    quantity <span class="token keyword">INT</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    unit_price <span class="token keyword">DECIMAL</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">)</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span> <span class="token keyword">COMMENT</span> <span class="token string">&#39;下单时的单价（快照）&#39;</span><span class="token punctuation">,</span>
    <span class="token keyword">KEY</span> idx_order_id <span class="token punctuation">(</span>order_id<span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">KEY</span> idx_product_id <span class="token punctuation">(</span>product_id<span class="token punctuation">)</span>
<span class="token punctuation">)</span> <span class="token keyword">ENGINE</span><span class="token operator">=</span><span class="token keyword">InnoDB</span> <span class="token keyword">DEFAULT</span> <span class="token keyword">CHARSET</span><span class="token operator">=</span>utf8mb4 <span class="token keyword">COMMENT</span><span class="token operator">=</span><span class="token string">&#39;订单明细表&#39;</span><span class="token punctuation">;</span>

<span class="token comment">-- 2. 插入测试数据</span>
<span class="token keyword">INSERT</span> <span class="token keyword">INTO</span> users <span class="token punctuation">(</span>username<span class="token punctuation">,</span> email<span class="token punctuation">,</span> phone<span class="token punctuation">)</span> <span class="token keyword">VALUES</span>
<span class="token punctuation">(</span><span class="token string">&#39;张三&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;zhangsan@example.com&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;13800000001&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
<span class="token punctuation">(</span><span class="token string">&#39;李四&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;lisi@example.com&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;13800000002&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
<span class="token punctuation">(</span><span class="token string">&#39;王五&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;wangwu@example.com&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;13800000003&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">INSERT</span> <span class="token keyword">INTO</span> products <span class="token punctuation">(</span>title<span class="token punctuation">,</span> price<span class="token punctuation">,</span> stock<span class="token punctuation">,</span> category_id<span class="token punctuation">)</span> <span class="token keyword">VALUES</span>
<span class="token punctuation">(</span><span class="token string">&#39;iPhone 15 Pro&#39;</span><span class="token punctuation">,</span> <span class="token number">8999.00</span><span class="token punctuation">,</span> <span class="token number">100</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
<span class="token punctuation">(</span><span class="token string">&#39;MacBook Pro 16&#39;</span><span class="token punctuation">,</span> <span class="token number">19999.00</span><span class="token punctuation">,</span> <span class="token number">50</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
<span class="token punctuation">(</span><span class="token string">&#39;AirPods Pro&#39;</span><span class="token punctuation">,</span> <span class="token number">1999.00</span><span class="token punctuation">,</span> <span class="token number">200</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
<span class="token punctuation">(</span><span class="token string">&#39;iPad Air&#39;</span><span class="token punctuation">,</span> <span class="token number">5499.00</span><span class="token punctuation">,</span> <span class="token number">80</span><span class="token punctuation">,</span> <span class="token number">3</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">-- 3. 事务示例：下单流程</span>
<span class="token comment">-- 下单是一个典型的事务操作：扣库存 + 创建订单 + 创建订单明细</span>
<span class="token keyword">START</span> <span class="token keyword">TRANSACTION</span><span class="token punctuation">;</span>

<span class="token comment">-- 3.1 检查库存（悲观锁）</span>
<span class="token keyword">SELECT</span> id<span class="token punctuation">,</span> stock<span class="token punctuation">,</span> price <span class="token keyword">FROM</span> products <span class="token keyword">WHERE</span> id <span class="token operator">=</span> <span class="token number">1</span> <span class="token keyword">FOR</span> <span class="token keyword">UPDATE</span><span class="token punctuation">;</span>
<span class="token comment">-- 假设 stock &gt;= 购买数量</span>

<span class="token comment">-- 3.2 扣减库存</span>
<span class="token keyword">UPDATE</span> products <span class="token keyword">SET</span> stock <span class="token operator">=</span> stock <span class="token operator">-</span> <span class="token number">1</span> <span class="token keyword">WHERE</span> id <span class="token operator">=</span> <span class="token number">1</span> <span class="token operator">AND</span> stock <span class="token operator">&gt;=</span> <span class="token number">1</span><span class="token punctuation">;</span>

<span class="token comment">-- 3.3 检查是否扣减成功</span>
<span class="token keyword">SELECT</span> ROW_COUNT<span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">INTO</span> <span class="token variable">@affected</span><span class="token punctuation">;</span>
<span class="token comment">-- 如果 @affected = 0，说明库存不足，ROLLBACK</span>

<span class="token comment">-- 3.4 创建订单</span>
<span class="token keyword">INSERT</span> <span class="token keyword">INTO</span> orders <span class="token punctuation">(</span>order_no<span class="token punctuation">,</span> user_id<span class="token punctuation">,</span> total_amount<span class="token punctuation">,</span> <span class="token keyword">status</span><span class="token punctuation">)</span>
<span class="token keyword">VALUES</span> <span class="token punctuation">(</span>CONCAT<span class="token punctuation">(</span><span class="token string">&#39;ORD&#39;</span><span class="token punctuation">,</span> DATE_FORMAT<span class="token punctuation">(</span><span class="token function">NOW</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token string">&#39;%Y%m%d%H%i%s&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span> LPAD<span class="token punctuation">(</span>FLOOR<span class="token punctuation">(</span>RAND<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token operator">*</span><span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">,</span><span class="token number">4</span><span class="token punctuation">,</span><span class="token string">&#39;0&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">8999.00</span><span class="token punctuation">,</span> <span class="token string">&#39;pending&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">SET</span> <span class="token variable">@order_id</span> <span class="token operator">=</span> LAST_INSERT_ID<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">-- 3.5 创建订单明细</span>
<span class="token keyword">INSERT</span> <span class="token keyword">INTO</span> order_items <span class="token punctuation">(</span>order_id<span class="token punctuation">,</span> product_id<span class="token punctuation">,</span> quantity<span class="token punctuation">,</span> unit_price<span class="token punctuation">)</span>
<span class="token keyword">VALUES</span> <span class="token punctuation">(</span><span class="token variable">@order_id</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token number">8999.00</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">COMMIT</span><span class="token punctuation">;</span>

<span class="token comment">-- 4. 复杂查询示例</span>
<span class="token comment">-- 4.1 查询用户订单汇总（JOIN + GROUP BY）</span>
<span class="token keyword">SELECT</span>
    u<span class="token punctuation">.</span>username<span class="token punctuation">,</span>
    <span class="token function">COUNT</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span>id<span class="token punctuation">)</span> <span class="token keyword">AS</span> order_count<span class="token punctuation">,</span>
    <span class="token keyword">COALESCE</span><span class="token punctuation">(</span><span class="token function">SUM</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span>total_amount<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> total_spent<span class="token punctuation">,</span>
    <span class="token function">MAX</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span>created_at<span class="token punctuation">)</span> <span class="token keyword">AS</span> last_order_time
<span class="token keyword">FROM</span> users u
<span class="token keyword">LEFT</span> <span class="token keyword">JOIN</span> orders o <span class="token keyword">ON</span> u<span class="token punctuation">.</span>id <span class="token operator">=</span> o<span class="token punctuation">.</span>user_id <span class="token operator">AND</span> o<span class="token punctuation">.</span><span class="token keyword">status</span> <span class="token operator">!=</span> <span class="token string">&#39;cancelled&#39;</span>
<span class="token keyword">GROUP</span> <span class="token keyword">BY</span> u<span class="token punctuation">.</span>id<span class="token punctuation">,</span> u<span class="token punctuation">.</span>username
<span class="token keyword">ORDER</span> <span class="token keyword">BY</span> total_spent <span class="token keyword">DESC</span><span class="token punctuation">;</span>

<span class="token comment">-- 4.2 窗口函数：用户消费排名</span>
<span class="token keyword">SELECT</span>
    u<span class="token punctuation">.</span>username<span class="token punctuation">,</span>
    o<span class="token punctuation">.</span>order_no<span class="token punctuation">,</span>
    o<span class="token punctuation">.</span>total_amount<span class="token punctuation">,</span>
    ROW_NUMBER<span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">OVER</span> <span class="token punctuation">(</span><span class="token keyword">PARTITION</span> <span class="token keyword">BY</span> u<span class="token punctuation">.</span>id <span class="token keyword">ORDER</span> <span class="token keyword">BY</span> o<span class="token punctuation">.</span>total_amount <span class="token keyword">DESC</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> rank_in_user<span class="token punctuation">,</span>
    <span class="token function">SUM</span><span class="token punctuation">(</span>o<span class="token punctuation">.</span>total_amount<span class="token punctuation">)</span> <span class="token keyword">OVER</span> <span class="token punctuation">(</span><span class="token keyword">PARTITION</span> <span class="token keyword">BY</span> u<span class="token punctuation">.</span>id<span class="token punctuation">)</span> <span class="token keyword">AS</span> user_total<span class="token punctuation">,</span>
    RANK<span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">OVER</span> <span class="token punctuation">(</span><span class="token keyword">ORDER</span> <span class="token keyword">BY</span> o<span class="token punctuation">.</span>total_amount <span class="token keyword">DESC</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> global_rank
<span class="token keyword">FROM</span> orders o
<span class="token keyword">JOIN</span> users u <span class="token keyword">ON</span> o<span class="token punctuation">.</span>user_id <span class="token operator">=</span> u<span class="token punctuation">.</span>id
<span class="token keyword">WHERE</span> o<span class="token punctuation">.</span><span class="token keyword">status</span> <span class="token operator">=</span> <span class="token string">&#39;completed&#39;</span><span class="token punctuation">;</span>

<span class="token comment">-- 4.3 递归 CTE：分类树查询</span>
<span class="token keyword">WITH</span> RECURSIVE category_tree <span class="token keyword">AS</span> <span class="token punctuation">(</span>
    <span class="token keyword">SELECT</span> id<span class="token punctuation">,</span> name<span class="token punctuation">,</span> parent_id<span class="token punctuation">,</span> <span class="token number">0</span> <span class="token keyword">AS</span> depth<span class="token punctuation">,</span> CAST<span class="token punctuation">(</span>name <span class="token keyword">AS</span> <span class="token keyword">CHAR</span><span class="token punctuation">(</span><span class="token number">500</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> path
    <span class="token keyword">FROM</span> categories
    <span class="token keyword">WHERE</span> parent_id <span class="token operator">IS</span> <span class="token boolean">NULL</span>
    <span class="token keyword">UNION</span> <span class="token keyword">ALL</span>
    <span class="token keyword">SELECT</span> c<span class="token punctuation">.</span>id<span class="token punctuation">,</span> c<span class="token punctuation">.</span>name<span class="token punctuation">,</span> c<span class="token punctuation">.</span>parent_id<span class="token punctuation">,</span> ct<span class="token punctuation">.</span>depth <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">,</span> CONCAT<span class="token punctuation">(</span>ct<span class="token punctuation">.</span>path<span class="token punctuation">,</span> <span class="token string">&#39; &gt; &#39;</span><span class="token punctuation">,</span> c<span class="token punctuation">.</span>name<span class="token punctuation">)</span>
    <span class="token keyword">FROM</span> categories c
    <span class="token keyword">JOIN</span> category_tree ct <span class="token keyword">ON</span> c<span class="token punctuation">.</span>parent_id <span class="token operator">=</span> ct<span class="token punctuation">.</span>id
<span class="token punctuation">)</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> category_tree <span class="token keyword">ORDER</span> <span class="token keyword">BY</span> path<span class="token punctuation">;</span>

<span class="token comment">-- 4.4 EXPLAIN 分析查询计划</span>
<span class="token keyword">EXPLAIN</span> <span class="token keyword">SELECT</span> u<span class="token punctuation">.</span>username<span class="token punctuation">,</span> o<span class="token punctuation">.</span>order_no<span class="token punctuation">,</span> o<span class="token punctuation">.</span>total_amount
<span class="token keyword">FROM</span> orders o
<span class="token keyword">JOIN</span> users u <span class="token keyword">ON</span> o<span class="token punctuation">.</span>user_id <span class="token operator">=</span> u<span class="token punctuation">.</span>id
<span class="token keyword">WHERE</span> o<span class="token punctuation">.</span><span class="token keyword">status</span> <span class="token operator">=</span> <span class="token string">&#39;pending&#39;</span>
  <span class="token operator">AND</span> o<span class="token punctuation">.</span>created_at <span class="token operator">&gt;</span> DATE_SUB<span class="token punctuation">(</span><span class="token function">NOW</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token keyword">INTERVAL</span> <span class="token number">7</span> <span class="token keyword">DAY</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_6-2-postgresql-—-高级特性-demo" tabindex="-1"><a class="header-anchor" href="#_6-2-postgresql-—-高级特性-demo"><span>6.2 PostgreSQL — 高级特性 Demo</span></a></h3><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token comment">-- ============================================</span>
<span class="token comment">-- PostgreSQL 高级特性 Demo</span>
<span class="token comment">-- ============================================</span>

<span class="token comment">-- 1. JSONB 操作：商品属性灵活存储</span>
<span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> products_pg <span class="token punctuation">(</span>
    id <span class="token keyword">SERIAL</span> <span class="token keyword">PRIMARY</span> <span class="token keyword">KEY</span><span class="token punctuation">,</span>
    title <span class="token keyword">VARCHAR</span><span class="token punctuation">(</span><span class="token number">200</span><span class="token punctuation">)</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    attributes JSONB <span class="token operator">NOT</span> <span class="token boolean">NULL</span> <span class="token keyword">DEFAULT</span> <span class="token string">&#39;{}&#39;</span><span class="token punctuation">,</span>
    created_at TIMESTAMPTZ <span class="token keyword">DEFAULT</span> <span class="token function">NOW</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">-- 插入灵活属性</span>
<span class="token keyword">INSERT</span> <span class="token keyword">INTO</span> products_pg <span class="token punctuation">(</span>title<span class="token punctuation">,</span> attributes<span class="token punctuation">)</span> <span class="token keyword">VALUES</span>
<span class="token punctuation">(</span><span class="token string">&#39;iPhone 15 Pro&#39;</span><span class="token punctuation">,</span> <span class="token string">&#39;{&quot;brand&quot;:&quot;Apple&quot;,&quot;color&quot;:&quot;钛金属&quot;,&quot;storage&quot;:&quot;256GB&quot;,&quot;specs&quot;:{&quot;screen&quot;:6.1,&quot;chip&quot;:&quot;A17 Pro&quot;,&quot;ram&quot;:8}}&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
<span class="token punctuation">(</span><span class="token string">&#39;MacBook Pro&#39;</span><span class="token punctuation">,</span>   <span class="token string">&#39;{&quot;brand&quot;:&quot;Apple&quot;,&quot;color&quot;:&quot;深空黑&quot;,&quot;storage&quot;:&quot;512GB&quot;,&quot;specs&quot;:{&quot;screen&quot;:16,&quot;chip&quot;:&quot;M3 Pro&quot;,&quot;ram&quot;:18}}&#39;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
<span class="token punctuation">(</span><span class="token string">&#39;Galaxy S24&#39;</span><span class="token punctuation">,</span>    <span class="token string">&#39;{&quot;brand&quot;:&quot;Samsung&quot;,&quot;color&quot;:&quot;黑色&quot;,&quot;storage&quot;:&quot;256GB&quot;,&quot;specs&quot;:{&quot;screen&quot;:6.2,&quot;chip&quot;:&quot;Exynos 2400&quot;,&quot;ram&quot;:8}}&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">-- JSONB 索引：GIN 索引加速 JSONB 查询</span>
<span class="token keyword">CREATE</span> <span class="token keyword">INDEX</span> idx_products_attributes <span class="token keyword">ON</span> products_pg <span class="token keyword">USING</span> GIN <span class="token punctuation">(</span>attributes jsonb_path_ops<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">-- JSONB 查询</span>
<span class="token comment">-- 查找 Apple 品牌、屏幕&gt;=6.1 的产品</span>
<span class="token keyword">SELECT</span> title<span class="token punctuation">,</span> attributes
<span class="token keyword">FROM</span> products_pg
<span class="token keyword">WHERE</span> attributes @<span class="token operator">&gt;</span> <span class="token string">&#39;{&quot;brand&quot;: &quot;Apple&quot;}&#39;</span>
  <span class="token operator">AND</span> <span class="token punctuation">(</span>attributes <span class="token comment">#&gt;&gt; &#39;{specs,screen}&#39;)::numeric &gt;= 6.1;</span>

<span class="token comment">-- JSONB 聚合</span>
<span class="token keyword">SELECT</span>
    attributes<span class="token operator">-</span><span class="token operator">&gt;&gt;</span><span class="token string">&#39;brand&#39;</span> <span class="token keyword">AS</span> brand<span class="token punctuation">,</span>
    <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> count<span class="token punctuation">,</span>
    JSONB_AGG<span class="token punctuation">(</span>JSONB_BUILD_OBJECT<span class="token punctuation">(</span><span class="token string">&#39;title&#39;</span><span class="token punctuation">,</span> title<span class="token punctuation">,</span> <span class="token string">&#39;storage&#39;</span><span class="token punctuation">,</span> attributes<span class="token operator">-</span><span class="token operator">&gt;&gt;</span><span class="token string">&#39;storage&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> products
<span class="token keyword">FROM</span> products_pg
<span class="token keyword">GROUP</span> <span class="token keyword">BY</span> attributes<span class="token operator">-</span><span class="token operator">&gt;&gt;</span><span class="token string">&#39;brand&#39;</span><span class="token punctuation">;</span>

<span class="token comment">-- 2. 窗口函数：复杂的分析查询</span>
<span class="token keyword">SELECT</span>
    title<span class="token punctuation">,</span>
    price<span class="token punctuation">,</span>
    category_id<span class="token punctuation">,</span>
    <span class="token comment">-- 分类内排名</span>
    ROW_NUMBER<span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">OVER</span> w <span class="token keyword">AS</span> row_num<span class="token punctuation">,</span>
    RANK<span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">OVER</span> w <span class="token keyword">AS</span> rank<span class="token punctuation">,</span>
    DENSE_RANK<span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">OVER</span> w <span class="token keyword">AS</span> dense_rnk<span class="token punctuation">,</span>
    <span class="token comment">-- 累计分布</span>
    CUME_DIST<span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">OVER</span> w <span class="token keyword">AS</span> cume_dist<span class="token punctuation">,</span>
    <span class="token comment">-- 分类内百分比</span>
    <span class="token function">ROUND</span><span class="token punctuation">(</span><span class="token number">100.0</span> <span class="token operator">*</span> RANK<span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token keyword">OVER</span> w <span class="token operator">/</span> <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token keyword">OVER</span> <span class="token punctuation">(</span><span class="token keyword">PARTITION</span> <span class="token keyword">BY</span> category_id<span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> percentile
<span class="token keyword">FROM</span> products_pg
WINDOW w <span class="token keyword">AS</span> <span class="token punctuation">(</span><span class="token keyword">PARTITION</span> <span class="token keyword">BY</span> category_id <span class="token keyword">ORDER</span> <span class="token keyword">BY</span> price <span class="token keyword">DESC</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">-- 3. CTE (公共表表达式) + 递归</span>
<span class="token comment">-- 按月统计订单并计算环比增长</span>
<span class="token keyword">WITH</span> monthly_stats <span class="token keyword">AS</span> <span class="token punctuation">(</span>
    <span class="token keyword">SELECT</span>
        DATE_TRUNC<span class="token punctuation">(</span><span class="token string">&#39;month&#39;</span><span class="token punctuation">,</span> created_at<span class="token punctuation">)</span> <span class="token keyword">AS</span> <span class="token keyword">month</span><span class="token punctuation">,</span>
        <span class="token function">SUM</span><span class="token punctuation">(</span>total_amount<span class="token punctuation">)</span> <span class="token keyword">AS</span> revenue<span class="token punctuation">,</span>
        <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> order_count
    <span class="token keyword">FROM</span> orders
    <span class="token keyword">GROUP</span> <span class="token keyword">BY</span> DATE_TRUNC<span class="token punctuation">(</span><span class="token string">&#39;month&#39;</span><span class="token punctuation">,</span> created_at<span class="token punctuation">)</span>
<span class="token punctuation">)</span><span class="token punctuation">,</span>
with_growth <span class="token keyword">AS</span> <span class="token punctuation">(</span>
    <span class="token keyword">SELECT</span>
        <span class="token keyword">month</span><span class="token punctuation">,</span>
        revenue<span class="token punctuation">,</span>
        order_count<span class="token punctuation">,</span>
        LAG<span class="token punctuation">(</span>revenue<span class="token punctuation">)</span> <span class="token keyword">OVER</span> <span class="token punctuation">(</span><span class="token keyword">ORDER</span> <span class="token keyword">BY</span> <span class="token keyword">month</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> prev_revenue<span class="token punctuation">,</span>
        <span class="token function">ROUND</span><span class="token punctuation">(</span><span class="token punctuation">(</span>revenue <span class="token operator">-</span> LAG<span class="token punctuation">(</span>revenue<span class="token punctuation">)</span> <span class="token keyword">OVER</span> <span class="token punctuation">(</span><span class="token keyword">ORDER</span> <span class="token keyword">BY</span> <span class="token keyword">month</span><span class="token punctuation">)</span><span class="token punctuation">)</span>
              <span class="token operator">/</span> <span class="token keyword">NULLIF</span><span class="token punctuation">(</span>LAG<span class="token punctuation">(</span>revenue<span class="token punctuation">)</span> <span class="token keyword">OVER</span> <span class="token punctuation">(</span><span class="token keyword">ORDER</span> <span class="token keyword">BY</span> <span class="token keyword">month</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">100</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> growth_rate
    <span class="token keyword">FROM</span> monthly_stats
<span class="token punctuation">)</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> with_growth <span class="token keyword">ORDER</span> <span class="token keyword">BY</span> <span class="token keyword">month</span> <span class="token keyword">DESC</span><span class="token punctuation">;</span>

<span class="token comment">-- 4. 物化视图：预计算报表</span>
<span class="token keyword">CREATE</span> MATERIALIZED <span class="token keyword">VIEW</span> mv_daily_sales <span class="token keyword">AS</span>
<span class="token keyword">SELECT</span>
    <span class="token keyword">DATE</span><span class="token punctuation">(</span>created_at<span class="token punctuation">)</span> <span class="token keyword">AS</span> sale_date<span class="token punctuation">,</span>
    category_id<span class="token punctuation">,</span>
    <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token keyword">DISTINCT</span> user_id<span class="token punctuation">)</span> <span class="token keyword">AS</span> unique_buyers<span class="token punctuation">,</span>
    <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> order_count<span class="token punctuation">,</span>
    <span class="token function">SUM</span><span class="token punctuation">(</span>total_amount<span class="token punctuation">)</span> <span class="token keyword">AS</span> revenue<span class="token punctuation">,</span>
    <span class="token function">AVG</span><span class="token punctuation">(</span>total_amount<span class="token punctuation">)</span> <span class="token keyword">AS</span> avg_order_value
<span class="token keyword">FROM</span> orders o
<span class="token keyword">JOIN</span> order_items oi <span class="token keyword">ON</span> o<span class="token punctuation">.</span>id <span class="token operator">=</span> oi<span class="token punctuation">.</span>order_id
<span class="token keyword">JOIN</span> products p <span class="token keyword">ON</span> oi<span class="token punctuation">.</span>product_id <span class="token operator">=</span> p<span class="token punctuation">.</span>id
<span class="token keyword">WHERE</span> o<span class="token punctuation">.</span><span class="token keyword">status</span> <span class="token operator">=</span> <span class="token string">&#39;completed&#39;</span>
<span class="token keyword">GROUP</span> <span class="token keyword">BY</span> <span class="token keyword">DATE</span><span class="token punctuation">(</span>created_at<span class="token punctuation">)</span><span class="token punctuation">,</span> category_id<span class="token punctuation">;</span>

<span class="token comment">-- 创建唯一索引以支持并发刷新</span>
<span class="token keyword">CREATE</span> <span class="token keyword">UNIQUE</span> <span class="token keyword">INDEX</span> idx_mv_daily_sales <span class="token keyword">ON</span> mv_daily_sales <span class="token punctuation">(</span>sale_date<span class="token punctuation">,</span> category_id<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">-- 刷新物化视图（可并发刷新不阻塞查询）</span>
REFRESH MATERIALIZED <span class="token keyword">VIEW</span> CONCURRENTLY mv_daily_sales<span class="token punctuation">;</span>

<span class="token comment">-- 5. 表分区：按时间分区订单表</span>
<span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> orders_partitioned <span class="token punctuation">(</span>
    id BIGSERIAL<span class="token punctuation">,</span>
    order_no <span class="token keyword">VARCHAR</span><span class="token punctuation">(</span><span class="token number">32</span><span class="token punctuation">)</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    user_id <span class="token keyword">BIGINT</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    total_amount <span class="token keyword">DECIMAL</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">)</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    <span class="token keyword">status</span> <span class="token keyword">VARCHAR</span><span class="token punctuation">(</span><span class="token number">20</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    created_at TIMESTAMPTZ <span class="token keyword">DEFAULT</span> <span class="token function">NOW</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">)</span> <span class="token keyword">PARTITION</span> <span class="token keyword">BY</span> RANGE <span class="token punctuation">(</span>created_at<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">-- 创建月度分区</span>
<span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> orders_2024_01 <span class="token keyword">PARTITION</span> <span class="token keyword">OF</span> orders_partitioned
    <span class="token keyword">FOR</span> <span class="token keyword">VALUES</span> <span class="token keyword">FROM</span> <span class="token punctuation">(</span><span class="token string">&#39;2024-01-01&#39;</span><span class="token punctuation">)</span> <span class="token keyword">TO</span> <span class="token punctuation">(</span><span class="token string">&#39;2024-02-01&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> orders_2024_02 <span class="token keyword">PARTITION</span> <span class="token keyword">OF</span> orders_partitioned
    <span class="token keyword">FOR</span> <span class="token keyword">VALUES</span> <span class="token keyword">FROM</span> <span class="token punctuation">(</span><span class="token string">&#39;2024-02-01&#39;</span><span class="token punctuation">)</span> <span class="token keyword">TO</span> <span class="token punctuation">(</span><span class="token string">&#39;2024-03-01&#39;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">-- ... 可用 pg_partman 自动化</span>

<span class="token comment">-- 6. LISTEN/NOTIFY：实时通知</span>
<span class="token comment">-- Session A: 监听</span>
<span class="token comment">-- LISTEN order_channel;</span>
<span class="token comment">-- Session B: 通知</span>
<span class="token comment">-- NOTIFY order_channel, &#39;New order created: ORD20240101001&#39;;</span>
<span class="token comment">-- SELECT pg_notify(&#39;order_channel&#39;, &#39;{&quot;order_id&quot;:123,&quot;status&quot;:&quot;paid&quot;}&#39;::text);</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_6-3-redis-—-实战场景-demo" tabindex="-1"><a class="header-anchor" href="#_6-3-redis-—-实战场景-demo"><span>6.3 Redis — 实战场景 Demo</span></a></h3><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code><span class="token comment"># ============================================</span>
<span class="token comment"># Redis 实战 Demo (Python)</span>
<span class="token comment"># pip install redis</span>
<span class="token comment"># ============================================</span>

<span class="token keyword">import</span> redis
<span class="token keyword">import</span> json
<span class="token keyword">import</span> time
<span class="token keyword">from</span> datetime <span class="token keyword">import</span> datetime<span class="token punctuation">,</span> timedelta
<span class="token keyword">from</span> typing <span class="token keyword">import</span> Optional<span class="token punctuation">,</span> List<span class="token punctuation">,</span> Dict
<span class="token keyword">import</span> hashlib

<span class="token comment"># 连接 Redis</span>
r <span class="token operator">=</span> redis<span class="token punctuation">.</span>Redis<span class="token punctuation">(</span>
    host<span class="token operator">=</span><span class="token string">&#39;localhost&#39;</span><span class="token punctuation">,</span>
    port<span class="token operator">=</span><span class="token number">6379</span><span class="token punctuation">,</span>
    db<span class="token operator">=</span><span class="token number">0</span><span class="token punctuation">,</span>
    decode_responses<span class="token operator">=</span><span class="token boolean">True</span><span class="token punctuation">,</span>  <span class="token comment"># 自动解码为字符串</span>
    socket_connect_timeout<span class="token operator">=</span><span class="token number">5</span><span class="token punctuation">,</span>
    socket_keepalive<span class="token operator">=</span><span class="token boolean">True</span><span class="token punctuation">,</span>
    max_connections<span class="token operator">=</span><span class="token number">50</span>
<span class="token punctuation">)</span>

<span class="token comment"># ==========================================</span>
<span class="token comment"># 1. 缓存模式</span>
<span class="token comment"># ==========================================</span>

<span class="token keyword">class</span> <span class="token class-name">CacheService</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">&quot;&quot;&quot;Redis 缓存服务 — 常见缓存模式实现&quot;&quot;&quot;</span>

    <span class="token comment"># 1.1 Cache-Aside (旁路缓存) — 最常用模式</span>
    <span class="token decorator annotation punctuation">@staticmethod</span>
    <span class="token keyword">def</span> <span class="token function">get_user</span><span class="token punctuation">(</span>user_id<span class="token punctuation">:</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> Optional<span class="token punctuation">[</span>Dict<span class="token punctuation">]</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;先从缓存取，miss 则查 DB 并回填&quot;&quot;&quot;</span>
        cache_key <span class="token operator">=</span> <span class="token string-interpolation"><span class="token string">f&quot;user:</span><span class="token interpolation"><span class="token punctuation">{</span>user_id<span class="token punctuation">}</span></span><span class="token string">&quot;</span></span>

        <span class="token comment"># 1. 查缓存</span>
        cached <span class="token operator">=</span> r<span class="token punctuation">.</span>get<span class="token punctuation">(</span>cache_key<span class="token punctuation">)</span>
        <span class="token keyword">if</span> cached<span class="token punctuation">:</span>
            <span class="token keyword">return</span> json<span class="token punctuation">.</span>loads<span class="token punctuation">(</span>cached<span class="token punctuation">)</span>

        <span class="token comment"># 2. 缓存未命中，查数据库 (模拟)</span>
        user <span class="token operator">=</span> CacheService<span class="token punctuation">.</span>_query_db_user<span class="token punctuation">(</span>user_id<span class="token punctuation">)</span>
        <span class="token keyword">if</span> <span class="token keyword">not</span> user<span class="token punctuation">:</span>
            <span class="token comment"># 缓存空值防止穿透（设置较短过期时间）</span>
            r<span class="token punctuation">.</span>setex<span class="token punctuation">(</span>cache_key<span class="token punctuation">,</span> <span class="token number">60</span><span class="token punctuation">,</span> <span class="token string">&#39;null&#39;</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span> <span class="token boolean">None</span>

        <span class="token comment"># 3. 回填缓存，设置随机过期时间防止雪崩</span>
        ttl <span class="token operator">=</span> <span class="token number">3600</span> <span class="token operator">+</span> <span class="token punctuation">(</span>user_id <span class="token operator">%</span> <span class="token number">300</span><span class="token punctuation">)</span>  <span class="token comment"># 3600~3899秒</span>
        r<span class="token punctuation">.</span>setex<span class="token punctuation">(</span>cache_key<span class="token punctuation">,</span> ttl<span class="token punctuation">,</span> json<span class="token punctuation">.</span>dumps<span class="token punctuation">(</span>user<span class="token punctuation">)</span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> user

    <span class="token comment"># 1.2 缓存穿透防护 — 布隆过滤器</span>
    <span class="token decorator annotation punctuation">@staticmethod</span>
    <span class="token keyword">def</span> <span class="token function">get_user_with_bloom</span><span class="token punctuation">(</span>user_id<span class="token punctuation">:</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> Optional<span class="token punctuation">[</span>Dict<span class="token punctuation">]</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;使用布隆过滤器防止缓存穿透&quot;&quot;&quot;</span>
        <span class="token comment"># 先用布隆过滤器判断 key 是否可能存在</span>
        <span class="token keyword">if</span> <span class="token keyword">not</span> r<span class="token punctuation">.</span>bf<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span>exists<span class="token punctuation">(</span><span class="token string">&#39;user_bloom&#39;</span><span class="token punctuation">,</span> <span class="token builtin">str</span><span class="token punctuation">(</span>user_id<span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
            <span class="token keyword">return</span> <span class="token boolean">None</span>  <span class="token comment"># 确定不存在，直接返回</span>
        <span class="token keyword">return</span> CacheService<span class="token punctuation">.</span>get_user<span class="token punctuation">(</span>user_id<span class="token punctuation">)</span>

    <span class="token comment"># 1.3 缓存击穿防护 — 互斥锁</span>
    <span class="token decorator annotation punctuation">@staticmethod</span>
    <span class="token keyword">def</span> <span class="token function">get_user_with_lock</span><span class="token punctuation">(</span>user_id<span class="token punctuation">:</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> Optional<span class="token punctuation">[</span>Dict<span class="token punctuation">]</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;热点 key 失效时，只允许一个请求去加载&quot;&quot;&quot;</span>
        cache_key <span class="token operator">=</span> <span class="token string-interpolation"><span class="token string">f&quot;user:</span><span class="token interpolation"><span class="token punctuation">{</span>user_id<span class="token punctuation">}</span></span><span class="token string">&quot;</span></span>
        lock_key <span class="token operator">=</span> <span class="token string-interpolation"><span class="token string">f&quot;lock:user:</span><span class="token interpolation"><span class="token punctuation">{</span>user_id<span class="token punctuation">}</span></span><span class="token string">&quot;</span></span>

        cached <span class="token operator">=</span> r<span class="token punctuation">.</span>get<span class="token punctuation">(</span>cache_key<span class="token punctuation">)</span>
        <span class="token keyword">if</span> cached<span class="token punctuation">:</span>
            <span class="token keyword">return</span> json<span class="token punctuation">.</span>loads<span class="token punctuation">(</span>cached<span class="token punctuation">)</span>

        <span class="token comment"># 尝试获取锁</span>
        <span class="token keyword">if</span> r<span class="token punctuation">.</span><span class="token builtin">set</span><span class="token punctuation">(</span>lock_key<span class="token punctuation">,</span> <span class="token string">&#39;1&#39;</span><span class="token punctuation">,</span> nx<span class="token operator">=</span><span class="token boolean">True</span><span class="token punctuation">,</span> ex<span class="token operator">=</span><span class="token number">10</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
            <span class="token keyword">try</span><span class="token punctuation">:</span>
                <span class="token comment"># 双重检查</span>
                cached <span class="token operator">=</span> r<span class="token punctuation">.</span>get<span class="token punctuation">(</span>cache_key<span class="token punctuation">)</span>
                <span class="token keyword">if</span> cached<span class="token punctuation">:</span>
                    <span class="token keyword">return</span> json<span class="token punctuation">.</span>loads<span class="token punctuation">(</span>cached<span class="token punctuation">)</span>
                <span class="token comment"># 加载数据</span>
                user <span class="token operator">=</span> CacheService<span class="token punctuation">.</span>_query_db_user<span class="token punctuation">(</span>user_id<span class="token punctuation">)</span>
                <span class="token keyword">if</span> user<span class="token punctuation">:</span>
                    r<span class="token punctuation">.</span>setex<span class="token punctuation">(</span>cache_key<span class="token punctuation">,</span> <span class="token number">3600</span><span class="token punctuation">,</span> json<span class="token punctuation">.</span>dumps<span class="token punctuation">(</span>user<span class="token punctuation">)</span><span class="token punctuation">)</span>
                <span class="token keyword">return</span> user
            <span class="token keyword">finally</span><span class="token punctuation">:</span>
                r<span class="token punctuation">.</span>delete<span class="token punctuation">(</span>lock_key<span class="token punctuation">)</span>
        <span class="token keyword">else</span><span class="token punctuation">:</span>
            <span class="token comment"># 未获取到锁，等待后重试</span>
            time<span class="token punctuation">.</span>sleep<span class="token punctuation">(</span><span class="token number">0.05</span><span class="token punctuation">)</span>
            <span class="token keyword">return</span> CacheService<span class="token punctuation">.</span>get_user_with_lock<span class="token punctuation">(</span>user_id<span class="token punctuation">)</span>

    <span class="token decorator annotation punctuation">@staticmethod</span>
    <span class="token keyword">def</span> <span class="token function">_query_db_user</span><span class="token punctuation">(</span>user_id<span class="token punctuation">:</span> <span class="token builtin">int</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> Optional<span class="token punctuation">[</span>Dict<span class="token punctuation">]</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;模拟数据库查询&quot;&quot;&quot;</span>
        <span class="token keyword">return</span> <span class="token punctuation">{</span><span class="token string">&quot;id&quot;</span><span class="token punctuation">:</span> user_id<span class="token punctuation">,</span> <span class="token string">&quot;name&quot;</span><span class="token punctuation">:</span> <span class="token string-interpolation"><span class="token string">f&quot;User</span><span class="token interpolation"><span class="token punctuation">{</span>user_id<span class="token punctuation">}</span></span><span class="token string">&quot;</span></span><span class="token punctuation">,</span> <span class="token string">&quot;age&quot;</span><span class="token punctuation">:</span> <span class="token number">25</span><span class="token punctuation">}</span>

<span class="token comment"># ==========================================</span>
<span class="token comment"># 2. 分布式锁</span>
<span class="token comment"># ==========================================</span>

<span class="token keyword">class</span> <span class="token class-name">DistributedLock</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">&quot;&quot;&quot;基于 Redis 的分布式锁&quot;&quot;&quot;</span>

    <span class="token keyword">def</span> <span class="token function">__init__</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> redis_client<span class="token punctuation">,</span> lock_key<span class="token punctuation">:</span> <span class="token builtin">str</span><span class="token punctuation">,</span> expire_seconds<span class="token punctuation">:</span> <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">30</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        self<span class="token punctuation">.</span>redis <span class="token operator">=</span> redis_client
        self<span class="token punctuation">.</span>lock_key <span class="token operator">=</span> <span class="token string-interpolation"><span class="token string">f&quot;dist_lock:</span><span class="token interpolation"><span class="token punctuation">{</span>lock_key<span class="token punctuation">}</span></span><span class="token string">&quot;</span></span>
        self<span class="token punctuation">.</span>lock_value <span class="token operator">=</span> hashlib<span class="token punctuation">.</span>md5<span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f&quot;</span><span class="token interpolation"><span class="token punctuation">{</span>lock_key<span class="token punctuation">}</span></span><span class="token string">:</span><span class="token interpolation"><span class="token punctuation">{</span>time<span class="token punctuation">.</span>time<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">}</span></span><span class="token string">&quot;</span></span><span class="token punctuation">.</span>encode<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">.</span>hexdigest<span class="token punctuation">(</span><span class="token punctuation">)</span>
        self<span class="token punctuation">.</span>expire <span class="token operator">=</span> expire_seconds

    <span class="token keyword">def</span> <span class="token function">acquire</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> timeout<span class="token punctuation">:</span> <span class="token builtin">float</span> <span class="token operator">=</span> <span class="token number">10</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> <span class="token builtin">bool</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;获取锁，支持超时等待&quot;&quot;&quot;</span>
        deadline <span class="token operator">=</span> time<span class="token punctuation">.</span>time<span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span> timeout
        <span class="token keyword">while</span> time<span class="token punctuation">.</span>time<span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">&lt;</span> deadline<span class="token punctuation">:</span>
            <span class="token keyword">if</span> self<span class="token punctuation">.</span>redis<span class="token punctuation">.</span><span class="token builtin">set</span><span class="token punctuation">(</span>self<span class="token punctuation">.</span>lock_key<span class="token punctuation">,</span> self<span class="token punctuation">.</span>lock_value<span class="token punctuation">,</span> nx<span class="token operator">=</span><span class="token boolean">True</span><span class="token punctuation">,</span> ex<span class="token operator">=</span>self<span class="token punctuation">.</span>expire<span class="token punctuation">)</span><span class="token punctuation">:</span>
                <span class="token keyword">return</span> <span class="token boolean">True</span>
            time<span class="token punctuation">.</span>sleep<span class="token punctuation">(</span><span class="token number">0.01</span><span class="token punctuation">)</span>  <span class="token comment"># 10ms 轮询</span>
        <span class="token keyword">return</span> <span class="token boolean">False</span>

    <span class="token keyword">def</span> <span class="token function">release</span><span class="token punctuation">(</span>self<span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;释放锁（Lua 脚本保证原子性）&quot;&quot;&quot;</span>
        script <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
        if redis.call(&#39;GET&#39;, KEYS[1]) == ARGV[1] then
            return redis.call(&#39;DEL&#39;, KEYS[1])
        else
            return 0
        end
        &quot;&quot;&quot;</span>
        self<span class="token punctuation">.</span>redis<span class="token punctuation">.</span><span class="token builtin">eval</span><span class="token punctuation">(</span>script<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> self<span class="token punctuation">.</span>lock_key<span class="token punctuation">,</span> self<span class="token punctuation">.</span>lock_value<span class="token punctuation">)</span>

    <span class="token keyword">def</span> <span class="token function">__enter__</span><span class="token punctuation">(</span>self<span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token keyword">if</span> <span class="token keyword">not</span> self<span class="token punctuation">.</span>acquire<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
            <span class="token keyword">raise</span> TimeoutError<span class="token punctuation">(</span><span class="token string-interpolation"><span class="token string">f&quot;Failed to acquire lock: </span><span class="token interpolation"><span class="token punctuation">{</span>self<span class="token punctuation">.</span>lock_key<span class="token punctuation">}</span></span><span class="token string">&quot;</span></span><span class="token punctuation">)</span>
        <span class="token keyword">return</span> self

    <span class="token keyword">def</span> <span class="token function">__exit__</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> <span class="token operator">*</span>args<span class="token punctuation">)</span><span class="token punctuation">:</span>
        self<span class="token punctuation">.</span>release<span class="token punctuation">(</span><span class="token punctuation">)</span>

<span class="token comment"># 使用示例</span>
<span class="token comment"># with DistributedLock(r, &#39;order:create:123&#39;) as lock:</span>
<span class="token comment">#     # 临界区代码</span>
<span class="token comment">#     create_order(123)</span>

<span class="token comment"># ==========================================</span>
<span class="token comment"># 3. 限流器</span>
<span class="token comment"># ==========================================</span>

<span class="token keyword">class</span> <span class="token class-name">RateLimiter</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">&quot;&quot;&quot;基于 Redis 的限流器&quot;&quot;&quot;</span>

    <span class="token decorator annotation punctuation">@staticmethod</span>
    <span class="token keyword">def</span> <span class="token function">sliding_window</span><span class="token punctuation">(</span>user_id<span class="token punctuation">:</span> <span class="token builtin">int</span><span class="token punctuation">,</span> limit<span class="token punctuation">:</span> <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">10</span><span class="token punctuation">,</span> window_sec<span class="token punctuation">:</span> <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">60</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> <span class="token builtin">bool</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;
        滑动窗口限流
        - limit: 窗口内最大请求数
        - window_sec: 窗口大小（秒）
        &quot;&quot;&quot;</span>
        key <span class="token operator">=</span> <span class="token string-interpolation"><span class="token string">f&quot;rate_limit:</span><span class="token interpolation"><span class="token punctuation">{</span>user_id<span class="token punctuation">}</span></span><span class="token string">&quot;</span></span>
        now <span class="token operator">=</span> time<span class="token punctuation">.</span>time<span class="token punctuation">(</span><span class="token punctuation">)</span>
        window_start <span class="token operator">=</span> now <span class="token operator">-</span> window_sec

        <span class="token comment"># Lua 脚本保证原子性</span>
        script <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local window = tonumber(ARGV[2])
        local limit = tonumber(ARGV[3])

        -- 删除窗口外的记录
        redis.call(&#39;ZREMRANGEBYSCORE&#39;, key, 0, now - window)
        -- 统计窗口内的请求数
        local count = redis.call(&#39;ZCARD&#39;, key)
        if count &lt; limit then
            redis.call(&#39;ZADD&#39;, key, now, now .. &#39;-&#39; .. count)
            redis.call(&#39;EXPIRE&#39;, key, window)
            return 1
        end
        return 0
        &quot;&quot;&quot;</span>
        result <span class="token operator">=</span> r<span class="token punctuation">.</span><span class="token builtin">eval</span><span class="token punctuation">(</span>script<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> key<span class="token punctuation">,</span> now<span class="token punctuation">,</span> window_sec<span class="token punctuation">,</span> limit<span class="token punctuation">)</span>
        <span class="token keyword">return</span> result <span class="token operator">==</span> <span class="token number">1</span>

    <span class="token decorator annotation punctuation">@staticmethod</span>
    <span class="token keyword">def</span> <span class="token function">token_bucket</span><span class="token punctuation">(</span>key<span class="token punctuation">:</span> <span class="token builtin">str</span><span class="token punctuation">,</span> capacity<span class="token punctuation">:</span> <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">10</span><span class="token punctuation">,</span> rate<span class="token punctuation">:</span> <span class="token builtin">float</span> <span class="token operator">=</span> <span class="token number">1.0</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> <span class="token builtin">bool</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;
        令牌桶限流
        - capacity: 桶容量（突发流量上限）
        - rate: 令牌生成速率（个/秒）
        &quot;&quot;&quot;</span>
        script <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
        local key = KEYS[1]
        local capacity = tonumber(ARGV[1])
        local rate = tonumber(ARGV[2])
        local now = tonumber(ARGV[3])

        local bucket = redis.call(&#39;HMGET&#39;, key, &#39;tokens&#39;, &#39;last_refill&#39;)
        local tokens = tonumber(bucket[1]) or capacity
        local last_refill = tonumber(bucket[2]) or now

        -- 计算新生成的令牌
        local elapsed = math.max(0, now - last_refill)
        tokens = math.min(capacity, tokens + elapsed * rate)

        if tokens &gt;= 1 then
            redis.call(&#39;HMSET&#39;, key, &#39;tokens&#39;, tokens - 1, &#39;last_refill&#39;, now)
            redis.call(&#39;EXPIRE&#39;, key, math.ceil(capacity / rate) + 1)
            return 1
        end
        return 0
        &quot;&quot;&quot;</span>
        <span class="token keyword">return</span> r<span class="token punctuation">.</span><span class="token builtin">eval</span><span class="token punctuation">(</span>script<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> key<span class="token punctuation">,</span> capacity<span class="token punctuation">,</span> rate<span class="token punctuation">,</span> time<span class="token punctuation">.</span>time<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token operator">==</span> <span class="token number">1</span>

<span class="token comment"># ==========================================</span>
<span class="token comment"># 4. 排行榜</span>
<span class="token comment"># ==========================================</span>

<span class="token keyword">class</span> <span class="token class-name">Leaderboard</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">&quot;&quot;&quot;基于 Sorted Set 的排行榜&quot;&quot;&quot;</span>

    <span class="token keyword">def</span> <span class="token function">__init__</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> name<span class="token punctuation">:</span> <span class="token builtin">str</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        self<span class="token punctuation">.</span>key <span class="token operator">=</span> <span class="token string-interpolation"><span class="token string">f&quot;leaderboard:</span><span class="token interpolation"><span class="token punctuation">{</span>name<span class="token punctuation">}</span></span><span class="token string">&quot;</span></span>

    <span class="token keyword">def</span> <span class="token function">update_score</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> member<span class="token punctuation">:</span> <span class="token builtin">str</span><span class="token punctuation">,</span> score<span class="token punctuation">:</span> <span class="token builtin">float</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;更新分数&quot;&quot;&quot;</span>
        r<span class="token punctuation">.</span>zadd<span class="token punctuation">(</span>self<span class="token punctuation">.</span>key<span class="token punctuation">,</span> <span class="token punctuation">{</span>member<span class="token punctuation">:</span> score<span class="token punctuation">}</span><span class="token punctuation">)</span>

    <span class="token keyword">def</span> <span class="token function">increment_score</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> member<span class="token punctuation">:</span> <span class="token builtin">str</span><span class="token punctuation">,</span> increment<span class="token punctuation">:</span> <span class="token builtin">float</span> <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;增加分数&quot;&quot;&quot;</span>
        r<span class="token punctuation">.</span>zincrby<span class="token punctuation">(</span>self<span class="token punctuation">.</span>key<span class="token punctuation">,</span> increment<span class="token punctuation">,</span> member<span class="token punctuation">)</span>

    <span class="token keyword">def</span> <span class="token function">get_rank</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> member<span class="token punctuation">:</span> <span class="token builtin">str</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> Optional<span class="token punctuation">[</span><span class="token builtin">int</span><span class="token punctuation">]</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;获取排名（从0开始，从高到低）&quot;&quot;&quot;</span>
        rank <span class="token operator">=</span> r<span class="token punctuation">.</span>zrevrank<span class="token punctuation">(</span>self<span class="token punctuation">.</span>key<span class="token punctuation">,</span> member<span class="token punctuation">)</span>
        <span class="token keyword">return</span> rank <span class="token operator">+</span> <span class="token number">1</span> <span class="token keyword">if</span> rank <span class="token keyword">is</span> <span class="token keyword">not</span> <span class="token boolean">None</span> <span class="token keyword">else</span> <span class="token boolean">None</span>

    <span class="token keyword">def</span> <span class="token function">get_top_n</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> n<span class="token punctuation">:</span> <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">10</span><span class="token punctuation">,</span> with_scores<span class="token punctuation">:</span> <span class="token builtin">bool</span> <span class="token operator">=</span> <span class="token boolean">True</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> List<span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;获取前N名&quot;&quot;&quot;</span>
        <span class="token keyword">return</span> r<span class="token punctuation">.</span>zrevrange<span class="token punctuation">(</span>self<span class="token punctuation">.</span>key<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">,</span> n<span class="token operator">-</span><span class="token number">1</span><span class="token punctuation">,</span> withscores<span class="token operator">=</span>with_scores<span class="token punctuation">)</span>

    <span class="token keyword">def</span> <span class="token function">get_range_by_score</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> min_score<span class="token punctuation">:</span> <span class="token builtin">float</span><span class="token punctuation">,</span> max_score<span class="token punctuation">:</span> <span class="token builtin">float</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> List<span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;按分数范围获取&quot;&quot;&quot;</span>
        <span class="token keyword">return</span> r<span class="token punctuation">.</span>zrangebyscore<span class="token punctuation">(</span>self<span class="token punctuation">.</span>key<span class="token punctuation">,</span> min_score<span class="token punctuation">,</span> max_score<span class="token punctuation">,</span> withscores<span class="token operator">=</span><span class="token boolean">True</span><span class="token punctuation">)</span>

    <span class="token keyword">def</span> <span class="token function">get_nearby</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> member<span class="token punctuation">:</span> <span class="token builtin">str</span><span class="token punctuation">,</span> count<span class="token punctuation">:</span> <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">5</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> Dict<span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;获取某成员附近的排名（上下各N个）&quot;&quot;&quot;</span>
        rank <span class="token operator">=</span> r<span class="token punctuation">.</span>zrevrank<span class="token punctuation">(</span>self<span class="token punctuation">.</span>key<span class="token punctuation">,</span> member<span class="token punctuation">)</span>
        <span class="token keyword">if</span> rank <span class="token keyword">is</span> <span class="token boolean">None</span><span class="token punctuation">:</span>
            <span class="token keyword">return</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
        start <span class="token operator">=</span> <span class="token builtin">max</span><span class="token punctuation">(</span><span class="token number">0</span><span class="token punctuation">,</span> rank <span class="token operator">-</span> count<span class="token punctuation">)</span>
        end <span class="token operator">=</span> rank <span class="token operator">+</span> count
        <span class="token keyword">return</span> <span class="token punctuation">{</span>
            <span class="token string">&#39;rank&#39;</span><span class="token punctuation">:</span> rank <span class="token operator">+</span> <span class="token number">1</span><span class="token punctuation">,</span>
            <span class="token string">&#39;nearby&#39;</span><span class="token punctuation">:</span> r<span class="token punctuation">.</span>zrevrange<span class="token punctuation">(</span>self<span class="token punctuation">.</span>key<span class="token punctuation">,</span> start<span class="token punctuation">,</span> end<span class="token punctuation">,</span> withscores<span class="token operator">=</span><span class="token boolean">True</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>

<span class="token comment"># ==========================================</span>
<span class="token comment"># 5. 延时队列</span>
<span class="token comment"># ==========================================</span>

<span class="token keyword">class</span> <span class="token class-name">DelayedQueue</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">&quot;&quot;&quot;基于 Sorted Set 的延时队列&quot;&quot;&quot;</span>

    <span class="token keyword">def</span> <span class="token function">__init__</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> queue_name<span class="token punctuation">:</span> <span class="token builtin">str</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        self<span class="token punctuation">.</span>key <span class="token operator">=</span> <span class="token string-interpolation"><span class="token string">f&quot;delay_queue:</span><span class="token interpolation"><span class="token punctuation">{</span>queue_name<span class="token punctuation">}</span></span><span class="token string">&quot;</span></span>

    <span class="token keyword">def</span> <span class="token function">add_task</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> task_id<span class="token punctuation">:</span> <span class="token builtin">str</span><span class="token punctuation">,</span> delay_seconds<span class="token punctuation">:</span> <span class="token builtin">int</span><span class="token punctuation">,</span> data<span class="token punctuation">:</span> Dict<span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;添加延时任务&quot;&quot;&quot;</span>
        execute_at <span class="token operator">=</span> time<span class="token punctuation">.</span>time<span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token operator">+</span> delay_seconds
        task <span class="token operator">=</span> json<span class="token punctuation">.</span>dumps<span class="token punctuation">(</span><span class="token punctuation">{</span><span class="token string">&#39;id&#39;</span><span class="token punctuation">:</span> task_id<span class="token punctuation">,</span> <span class="token string">&#39;data&#39;</span><span class="token punctuation">:</span> data<span class="token punctuation">,</span> <span class="token string">&#39;execute_at&#39;</span><span class="token punctuation">:</span> execute_at<span class="token punctuation">}</span><span class="token punctuation">)</span>
        r<span class="token punctuation">.</span>zadd<span class="token punctuation">(</span>self<span class="token punctuation">.</span>key<span class="token punctuation">,</span> <span class="token punctuation">{</span>task<span class="token punctuation">:</span> execute_at<span class="token punctuation">}</span><span class="token punctuation">)</span>

    <span class="token keyword">def</span> <span class="token function">poll</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> batch_size<span class="token punctuation">:</span> <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">10</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> List<span class="token punctuation">[</span>Dict<span class="token punctuation">]</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;轮询到期任务&quot;&quot;&quot;</span>
        script <span class="token operator">=</span> <span class="token triple-quoted-string string">&quot;&quot;&quot;
        local key = KEYS[1]
        local now = tonumber(ARGV[1])
        local batch = tonumber(ARGV[2])

        local tasks = redis.call(&#39;ZRANGEBYSCORE&#39;, key, 0, now, &#39;LIMIT&#39;, 0, batch)
        if #tasks &gt; 0 then
            redis.call(&#39;ZREM&#39;, key, unpack(tasks))
        end
        return tasks
        &quot;&quot;&quot;</span>
        results <span class="token operator">=</span> r<span class="token punctuation">.</span><span class="token builtin">eval</span><span class="token punctuation">(</span>script<span class="token punctuation">,</span> <span class="token number">1</span><span class="token punctuation">,</span> self<span class="token punctuation">.</span>key<span class="token punctuation">,</span> time<span class="token punctuation">.</span>time<span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> batch_size<span class="token punctuation">)</span>
        <span class="token keyword">return</span> <span class="token punctuation">[</span>json<span class="token punctuation">.</span>loads<span class="token punctuation">(</span>t<span class="token punctuation">)</span> <span class="token keyword">for</span> t <span class="token keyword">in</span> results<span class="token punctuation">]</span> <span class="token keyword">if</span> results <span class="token keyword">else</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>

<span class="token comment"># ==========================================</span>
<span class="token comment"># 6. Stream 消息队列（可靠消费）</span>
<span class="token comment"># ==========================================</span>

<span class="token keyword">class</span> <span class="token class-name">StreamMQ</span><span class="token punctuation">:</span>
    <span class="token triple-quoted-string string">&quot;&quot;&quot;基于 Redis Stream 的可靠消息队列&quot;&quot;&quot;</span>

    <span class="token keyword">def</span> <span class="token function">__init__</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> stream_name<span class="token punctuation">:</span> <span class="token builtin">str</span><span class="token punctuation">,</span> group_name<span class="token punctuation">:</span> <span class="token builtin">str</span> <span class="token operator">=</span> <span class="token string">&#39;default_group&#39;</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        self<span class="token punctuation">.</span>stream <span class="token operator">=</span> <span class="token string-interpolation"><span class="token string">f&quot;stream:</span><span class="token interpolation"><span class="token punctuation">{</span>stream_name<span class="token punctuation">}</span></span><span class="token string">&quot;</span></span>
        self<span class="token punctuation">.</span>group <span class="token operator">=</span> group_name
        self<span class="token punctuation">.</span>consumer <span class="token operator">=</span> <span class="token string-interpolation"><span class="token string">f&quot;consumer_</span><span class="token interpolation"><span class="token punctuation">{</span>stream_name<span class="token punctuation">}</span></span><span class="token string">&quot;</span></span>
        <span class="token comment"># 创建消费者组（从最新消息开始消费）</span>
        <span class="token keyword">try</span><span class="token punctuation">:</span>
            r<span class="token punctuation">.</span>xgroup_create<span class="token punctuation">(</span>self<span class="token punctuation">.</span>stream<span class="token punctuation">,</span> self<span class="token punctuation">.</span>group<span class="token punctuation">,</span> <span class="token builtin">id</span><span class="token operator">=</span><span class="token string">&#39;$&#39;</span><span class="token punctuation">,</span> mkstream<span class="token operator">=</span><span class="token boolean">True</span><span class="token punctuation">)</span>
        <span class="token keyword">except</span> redis<span class="token punctuation">.</span>ResponseError<span class="token punctuation">:</span>
            <span class="token keyword">pass</span>  <span class="token comment"># 消费者组已存在</span>

    <span class="token keyword">def</span> <span class="token function">produce</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> message<span class="token punctuation">:</span> Dict<span class="token punctuation">,</span> max_len<span class="token punctuation">:</span> <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">10000</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;生产消息&quot;&quot;&quot;</span>
        r<span class="token punctuation">.</span>xadd<span class="token punctuation">(</span>self<span class="token punctuation">.</span>stream<span class="token punctuation">,</span> message<span class="token punctuation">,</span> maxlen<span class="token operator">=</span>max_len<span class="token punctuation">,</span> <span class="token builtin">id</span><span class="token operator">=</span><span class="token string">&#39;*&#39;</span><span class="token punctuation">)</span>

    <span class="token keyword">def</span> <span class="token function">consume</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> batch_size<span class="token punctuation">:</span> <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">10</span><span class="token punctuation">,</span> block_ms<span class="token punctuation">:</span> <span class="token builtin">int</span> <span class="token operator">=</span> <span class="token number">5000</span><span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> List<span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;消费消息&quot;&quot;&quot;</span>
        <span class="token keyword">try</span><span class="token punctuation">:</span>
            messages <span class="token operator">=</span> r<span class="token punctuation">.</span>xreadgroup<span class="token punctuation">(</span>
                self<span class="token punctuation">.</span>group<span class="token punctuation">,</span> self<span class="token punctuation">.</span>consumer<span class="token punctuation">,</span>
                <span class="token punctuation">{</span>self<span class="token punctuation">.</span>stream<span class="token punctuation">:</span> <span class="token string">&#39;&gt;&#39;</span><span class="token punctuation">}</span><span class="token punctuation">,</span>  <span class="token comment"># &#39;&gt;&#39; 表示只读新消息</span>
                count<span class="token operator">=</span>batch_size<span class="token punctuation">,</span>
                block<span class="token operator">=</span>block_ms
            <span class="token punctuation">)</span>
            <span class="token keyword">return</span> messages
        <span class="token keyword">except</span> redis<span class="token punctuation">.</span>ResponseError<span class="token punctuation">:</span>
            <span class="token keyword">return</span> <span class="token punctuation">[</span><span class="token punctuation">]</span>

    <span class="token keyword">def</span> <span class="token function">ack</span><span class="token punctuation">(</span>self<span class="token punctuation">,</span> message_id<span class="token punctuation">:</span> <span class="token builtin">str</span><span class="token punctuation">)</span><span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;确认消息&quot;&quot;&quot;</span>
        r<span class="token punctuation">.</span>xack<span class="token punctuation">(</span>self<span class="token punctuation">.</span>stream<span class="token punctuation">,</span> self<span class="token punctuation">.</span>group<span class="token punctuation">,</span> message_id<span class="token punctuation">)</span>

    <span class="token keyword">def</span> <span class="token function">pending</span><span class="token punctuation">(</span>self<span class="token punctuation">)</span> <span class="token operator">-</span><span class="token operator">&gt;</span> List<span class="token punctuation">:</span>
        <span class="token triple-quoted-string string">&quot;&quot;&quot;查看待处理消息&quot;&quot;&quot;</span>
        <span class="token keyword">return</span> r<span class="token punctuation">.</span>xpending<span class="token punctuation">(</span>self<span class="token punctuation">.</span>stream<span class="token punctuation">,</span> self<span class="token punctuation">.</span>group<span class="token punctuation">)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_6-4-mongodb-—-文档操作-demo" tabindex="-1"><a class="header-anchor" href="#_6-4-mongodb-—-文档操作-demo"><span>6.4 MongoDB — 文档操作 Demo</span></a></h3><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code><span class="token comment">// ============================================</span>
<span class="token comment">// MongoDB 电商系统 Demo (mongosh / Node.js)</span>
<span class="token comment">// ============================================</span>

<span class="token comment">// 1. 连接和数据库操作</span>
use ecommerce_mongo<span class="token punctuation">;</span>

<span class="token comment">// 2. 创建集合和索引</span>
db<span class="token punctuation">.</span><span class="token function">createCollection</span><span class="token punctuation">(</span><span class="token string">&quot;products&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
db<span class="token punctuation">.</span><span class="token function">createCollection</span><span class="token punctuation">(</span><span class="token string">&quot;orders&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
db<span class="token punctuation">.</span><span class="token function">createCollection</span><span class="token punctuation">(</span><span class="token string">&quot;users&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// ==========================================</span>
<span class="token comment">// 3. 文档设计：嵌入式 vs 引用式</span>
<span class="token comment">// ==========================================</span>

<span class="token comment">// 3.1 嵌入式设计 (推荐用于 1:1 或 1:few 关系)</span>
<span class="token comment">// 商品文档 — 评论内嵌（每个商品评论量不大时适用）</span>
db<span class="token punctuation">.</span>products<span class="token punctuation">.</span><span class="token function">insertOne</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">_id</span><span class="token operator">:</span> <span class="token function">ObjectId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&quot;iPhone 15 Pro&quot;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">price</span><span class="token operator">:</span> <span class="token number">8999.00</span><span class="token punctuation">,</span>
    <span class="token literal-property property">stock</span><span class="token operator">:</span> <span class="token number">100</span><span class="token punctuation">,</span>
    <span class="token literal-property property">category</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">id</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token literal-property property">name</span><span class="token operator">:</span> <span class="token string">&quot;手机&quot;</span><span class="token punctuation">,</span> <span class="token literal-property property">path</span><span class="token operator">:</span> <span class="token string">&quot;数码 &gt; 手机&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token literal-property property">specs</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">screen</span><span class="token operator">:</span> <span class="token number">6.1</span><span class="token punctuation">,</span>
        <span class="token literal-property property">chip</span><span class="token operator">:</span> <span class="token string">&quot;A17 Pro&quot;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">storage</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;128GB&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;256GB&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;512GB&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;1TB&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
        <span class="token literal-property property">colors</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;钛金属&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;蓝色&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;白色&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;黑色&quot;</span><span class="token punctuation">]</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// 嵌入少量评论（适用于评论数可控的场景）</span>
    <span class="token literal-property property">reviews</span><span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span>
            <span class="token literal-property property">user_id</span><span class="token operator">:</span> <span class="token number">101</span><span class="token punctuation">,</span>
            <span class="token literal-property property">username</span><span class="token operator">:</span> <span class="token string">&quot;张三&quot;</span><span class="token punctuation">,</span>
            <span class="token literal-property property">rating</span><span class="token operator">:</span> <span class="token number">5</span><span class="token punctuation">,</span>
            <span class="token literal-property property">comment</span><span class="token operator">:</span> <span class="token string">&quot;非常好用&quot;</span><span class="token punctuation">,</span>
            <span class="token literal-property property">created_at</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token comment">// 多键索引：可以对数组字段建索引</span>
    <span class="token literal-property property">tags</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;旗舰&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;5G&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;拍照&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;iOS&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token literal-property property">created_at</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token literal-property property">updated_at</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 3.2 引用式设计 (推荐用于 1:N 或 M:N 关系)</span>
<span class="token comment">// 用户文档</span>
db<span class="token punctuation">.</span>users<span class="token punctuation">.</span><span class="token function">insertOne</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">_id</span><span class="token operator">:</span> <span class="token function">ObjectId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token literal-property property">username</span><span class="token operator">:</span> <span class="token string">&quot;张三&quot;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">email</span><span class="token operator">:</span> <span class="token string">&quot;zhangsan@example.com&quot;</span><span class="token punctuation">,</span>
    <span class="token comment">// 引用最近订单 ID（不嵌入所有订单）</span>
    <span class="token literal-property property">recent_order_ids</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token function">ObjectId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span> <span class="token function">ObjectId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">]</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 订单文档 — 引用商品</span>
db<span class="token punctuation">.</span>orders<span class="token punctuation">.</span><span class="token function">insertOne</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
    <span class="token literal-property property">_id</span><span class="token operator">:</span> <span class="token function">ObjectId</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token literal-property property">order_no</span><span class="token operator">:</span> <span class="token string">&quot;ORD20240101001&quot;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">user_id</span><span class="token operator">:</span> <span class="token function">ObjectId</span><span class="token punctuation">(</span><span class="token string">&quot;...&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token literal-property property">status</span><span class="token operator">:</span> <span class="token string">&quot;paid&quot;</span><span class="token punctuation">,</span>
    <span class="token literal-property property">total_amount</span><span class="token operator">:</span> <span class="token number">10998.00</span><span class="token punctuation">,</span>
    <span class="token literal-property property">items</span><span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span>
            <span class="token literal-property property">product_id</span><span class="token operator">:</span> <span class="token function">ObjectId</span><span class="token punctuation">(</span><span class="token string">&quot;...&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>  <span class="token comment">// 引用商品</span>
            <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&quot;iPhone 15 Pro&quot;</span><span class="token punctuation">,</span>       <span class="token comment">// 冗余部分信息（快照）</span>
            <span class="token literal-property property">quantity</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
            <span class="token literal-property property">unit_price</span><span class="token operator">:</span> <span class="token number">8999.00</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span>
            <span class="token literal-property property">product_id</span><span class="token operator">:</span> <span class="token function">ObjectId</span><span class="token punctuation">(</span><span class="token string">&quot;...&quot;</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
            <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&quot;AirPods Pro&quot;</span><span class="token punctuation">,</span>
            <span class="token literal-property property">quantity</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
            <span class="token literal-property property">unit_price</span><span class="token operator">:</span> <span class="token number">1999.00</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token literal-property property">shipping_address</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">province</span><span class="token operator">:</span> <span class="token string">&quot;广东省&quot;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">city</span><span class="token operator">:</span> <span class="token string">&quot;深圳市&quot;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">detail</span><span class="token operator">:</span> <span class="token string">&quot;科技园路1号&quot;</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token literal-property property">created_at</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token literal-property property">updated_at</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// ==========================================</span>
<span class="token comment">// 4. 索引策略</span>
<span class="token comment">// ==========================================</span>

<span class="token comment">// 单字段索引</span>
db<span class="token punctuation">.</span>products<span class="token punctuation">.</span><span class="token function">createIndex</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token number">1</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 复合索引 (遵循 ESR 规则: Equality → Sort → Range)</span>
db<span class="token punctuation">.</span>orders<span class="token punctuation">.</span><span class="token function">createIndex</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">status</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token literal-property property">created_at</span><span class="token operator">:</span> <span class="token operator">-</span><span class="token number">1</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 多键索引 (数组字段)</span>
db<span class="token punctuation">.</span>products<span class="token punctuation">.</span><span class="token function">createIndex</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">tags</span><span class="token operator">:</span> <span class="token number">1</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 文本索引</span>
db<span class="token punctuation">.</span>products<span class="token punctuation">.</span><span class="token function">createIndex</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">title</span><span class="token operator">:</span> <span class="token string">&quot;text&quot;</span><span class="token punctuation">,</span> <span class="token string-property property">&quot;specs.chip&quot;</span><span class="token operator">:</span> <span class="token string">&quot;text&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// TTL 索引 (自动过期，适用于临时数据)</span>
db<span class="token punctuation">.</span>sessions<span class="token punctuation">.</span><span class="token function">createIndex</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">created_at</span><span class="token operator">:</span> <span class="token number">1</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">expireAfterSeconds</span><span class="token operator">:</span> <span class="token number">3600</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 部分索引 (只索引满足条件的文档)</span>
db<span class="token punctuation">.</span>orders<span class="token punctuation">.</span><span class="token function">createIndex</span><span class="token punctuation">(</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">created_at</span><span class="token operator">:</span> <span class="token operator">-</span><span class="token number">1</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">partialFilterExpression</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">status</span><span class="token operator">:</span> <span class="token string">&quot;pending&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 通配符索引 (灵活但需谨慎使用)</span>
db<span class="token punctuation">.</span>products<span class="token punctuation">.</span><span class="token function">createIndex</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token string-property property">&quot;attributes.$**&quot;</span><span class="token operator">:</span> <span class="token number">1</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 查看索引使用情况</span>
db<span class="token punctuation">.</span>orders<span class="token punctuation">.</span><span class="token function">find</span><span class="token punctuation">(</span><span class="token punctuation">{</span> <span class="token literal-property property">status</span><span class="token operator">:</span> <span class="token string">&quot;paid&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">explain</span><span class="token punctuation">(</span><span class="token string">&quot;executionStats&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// ==========================================</span>
<span class="token comment">// 5. 聚合管道 (Aggregation Pipeline)</span>
<span class="token comment">// ==========================================</span>

<span class="token comment">// 5.1 销售统计：按分类统计销售额</span>
db<span class="token punctuation">.</span>orders<span class="token punctuation">.</span><span class="token function">aggregate</span><span class="token punctuation">(</span><span class="token punctuation">[</span>
    <span class="token comment">// 阶段1: 只查已完成的订单</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">$match</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">status</span><span class="token operator">:</span> <span class="token string">&quot;completed&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// 阶段2: 展开订单项</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">$unwind</span><span class="token operator">:</span> <span class="token string">&quot;$items&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// 阶段3: 关联商品信息</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">$lookup</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">from</span><span class="token operator">:</span> <span class="token string">&quot;products&quot;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">localField</span><span class="token operator">:</span> <span class="token string">&quot;items.product_id&quot;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">foreignField</span><span class="token operator">:</span> <span class="token string">&quot;_id&quot;</span><span class="token punctuation">,</span>
        <span class="token keyword">as</span><span class="token operator">:</span> <span class="token string">&quot;product&quot;</span>
    <span class="token punctuation">}</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// 阶段4: 展开关联结果</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">$unwind</span><span class="token operator">:</span> <span class="token string">&quot;$product&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// 阶段5: 按分类分组统计</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">$group</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">_id</span><span class="token operator">:</span> <span class="token string">&quot;$product.category.name&quot;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">total_revenue</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">$sum</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">$multiply</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;$items.quantity&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;$items.unit_price&quot;</span><span class="token punctuation">]</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token literal-property property">order_count</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">$sum</span><span class="token operator">:</span> <span class="token number">1</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token literal-property property">avg_order</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">$avg</span><span class="token operator">:</span> <span class="token string">&quot;$items.unit_price&quot;</span> <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// 阶段6: 排序</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">$sort</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">total_revenue</span><span class="token operator">:</span> <span class="token operator">-</span><span class="token number">1</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token comment">// 阶段7: 格式化输出</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">$project</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">category</span><span class="token operator">:</span> <span class="token string">&quot;$_id&quot;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">total_revenue</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
        <span class="token literal-property property">order_count</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
        <span class="token literal-property property">avg_order</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">$round</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;$avg_order&quot;</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">]</span> <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// 5.2 漏斗分析：用户购买转化</span>
db<span class="token punctuation">.</span>orders<span class="token punctuation">.</span><span class="token function">aggregate</span><span class="token punctuation">(</span><span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">$match</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">created_at</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">$gte</span><span class="token operator">:</span> <span class="token function">ISODate</span><span class="token punctuation">(</span><span class="token string">&quot;2024-01-01&quot;</span><span class="token punctuation">)</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">$group</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token literal-property property">_id</span><span class="token operator">:</span> <span class="token string">&quot;$user_id&quot;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">stages</span><span class="token operator">:</span> <span class="token punctuation">{</span>
            <span class="token literal-property property">$addToSet</span><span class="token operator">:</span> <span class="token string">&quot;$status&quot;</span>  <span class="token comment">// 收集用户经历过的所有状态</span>
        <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token literal-property property">$facet</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token string-property property">&quot;浏览商品&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">$count</span><span class="token operator">:</span> <span class="token string">&quot;count&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
        <span class="token string-property property">&quot;加入购物车&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">$match</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token string-property property">&quot;stages&quot;</span><span class="token operator">:</span> <span class="token string">&quot;cart&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">$count</span><span class="token operator">:</span> <span class="token string">&quot;count&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
        <span class="token string-property property">&quot;下单&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">$match</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token string-property property">&quot;stages&quot;</span><span class="token operator">:</span> <span class="token string">&quot;pending&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">$count</span><span class="token operator">:</span> <span class="token string">&quot;count&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
        <span class="token string-property property">&quot;支付&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">$match</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token string-property property">&quot;stages&quot;</span><span class="token operator">:</span> <span class="token string">&quot;paid&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">$count</span><span class="token operator">:</span> <span class="token string">&quot;count&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
        <span class="token string-property property">&quot;完成&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">$match</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token string-property property">&quot;stages&quot;</span><span class="token operator">:</span> <span class="token string">&quot;completed&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> <span class="token literal-property property">$count</span><span class="token operator">:</span> <span class="token string">&quot;count&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">]</span>
    <span class="token punctuation">}</span><span class="token punctuation">}</span>
<span class="token punctuation">]</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// ==========================================</span>
<span class="token comment">// 6. 事务（4.0+ 多文档 ACID）</span>
<span class="token comment">// ==========================================</span>

<span class="token keyword">const</span> session <span class="token operator">=</span> db<span class="token punctuation">.</span><span class="token function">getMongo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">.</span><span class="token function">startSession</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
session<span class="token punctuation">.</span><span class="token function">startTransaction</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">try</span> <span class="token punctuation">{</span>
    <span class="token keyword">const</span> ordersCol <span class="token operator">=</span> session<span class="token punctuation">.</span><span class="token function">getDatabase</span><span class="token punctuation">(</span><span class="token string">&quot;ecommerce_mongo&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span>orders<span class="token punctuation">;</span>
    <span class="token keyword">const</span> productsCol <span class="token operator">=</span> session<span class="token punctuation">.</span><span class="token function">getDatabase</span><span class="token punctuation">(</span><span class="token string">&quot;ecommerce_mongo&quot;</span><span class="token punctuation">)</span><span class="token punctuation">.</span>products<span class="token punctuation">;</span>

    <span class="token comment">// 扣库存</span>
    <span class="token keyword">const</span> result <span class="token operator">=</span> productsCol<span class="token punctuation">.</span><span class="token function">updateOne</span><span class="token punctuation">(</span>
        <span class="token punctuation">{</span> <span class="token literal-property property">_id</span><span class="token operator">:</span> productId<span class="token punctuation">,</span> <span class="token literal-property property">stock</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">$gte</span><span class="token operator">:</span> <span class="token number">1</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span> <span class="token literal-property property">$inc</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token literal-property property">stock</span><span class="token operator">:</span> <span class="token operator">-</span><span class="token number">1</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span>
    <span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">if</span> <span class="token punctuation">(</span>result<span class="token punctuation">.</span>modifiedCount <span class="token operator">===</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
        <span class="token keyword">throw</span> <span class="token keyword">new</span> <span class="token class-name">Error</span><span class="token punctuation">(</span><span class="token string">&quot;库存不足&quot;</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span>

    <span class="token comment">// 创建订单</span>
    ordersCol<span class="token punctuation">.</span><span class="token function">insertOne</span><span class="token punctuation">(</span><span class="token punctuation">{</span>
        <span class="token literal-property property">order_no</span><span class="token operator">:</span> <span class="token function">generateOrderNo</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
        <span class="token literal-property property">user_id</span><span class="token operator">:</span> userId<span class="token punctuation">,</span>
        <span class="token literal-property property">items</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span> <span class="token literal-property property">product_id</span><span class="token operator">:</span> productId<span class="token punctuation">,</span> <span class="token literal-property property">quantity</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token literal-property property">unit_price</span><span class="token operator">:</span> price <span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
        <span class="token literal-property property">status</span><span class="token operator">:</span> <span class="token string">&quot;pending&quot;</span><span class="token punctuation">,</span>
        <span class="token literal-property property">created_at</span><span class="token operator">:</span> <span class="token keyword">new</span> <span class="token class-name">Date</span><span class="token punctuation">(</span><span class="token punctuation">)</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

    <span class="token keyword">await</span> session<span class="token punctuation">.</span><span class="token function">commitTransaction</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span> <span class="token keyword">catch</span> <span class="token punctuation">(</span>error<span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token keyword">await</span> session<span class="token punctuation">.</span><span class="token function">abortTransaction</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token keyword">throw</span> error<span class="token punctuation">;</span>
<span class="token punctuation">}</span> <span class="token keyword">finally</span> <span class="token punctuation">{</span>
    session<span class="token punctuation">.</span><span class="token function">endSession</span><span class="token punctuation">(</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_6-5-elasticsearch-—-全文搜索-demo" tabindex="-1"><a class="header-anchor" href="#_6-5-elasticsearch-—-全文搜索-demo"><span>6.5 Elasticsearch — 全文搜索 Demo</span></a></h3><div class="language-json line-numbers-mode" data-ext="json" data-title="json"><pre class="language-json"><code><span class="token comment">// ============================================</span>
<span class="token comment">// Elasticsearch 搜索服务 Demo</span>
<span class="token comment">// ============================================</span>

<span class="token comment">// 1. 创建索引（定义 Mapping）</span>
PUT /products
<span class="token punctuation">{</span>
  <span class="token property">&quot;settings&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;number_of_shards&quot;</span><span class="token operator">:</span> <span class="token number">3</span><span class="token punctuation">,</span>
    <span class="token property">&quot;number_of_replicas&quot;</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span>
    <span class="token property">&quot;analysis&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;analyzer&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;ik_smart_analyzer&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;custom&quot;</span><span class="token punctuation">,</span>
          <span class="token property">&quot;tokenizer&quot;</span><span class="token operator">:</span> <span class="token string">&quot;ik_smart&quot;</span>        <span class="token comment">// 中文分词器 (需安装 ik 插件)</span>
        <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token property">&quot;pinyin_analyzer&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
          <span class="token property">&quot;tokenizer&quot;</span><span class="token operator">:</span> <span class="token string">&quot;pinyin&quot;</span>          <span class="token comment">// 拼音分词器 (需安装 pinyin 插件)</span>
        <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;mappings&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;properties&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;id&quot;</span><span class="token operator">:</span>           <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;long&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;title&quot;</span><span class="token operator">:</span>        <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;text&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;analyzer&quot;</span><span class="token operator">:</span> <span class="token string">&quot;ik_max_word&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;search_analyzer&quot;</span><span class="token operator">:</span> <span class="token string">&quot;ik_smart&quot;</span><span class="token punctuation">,</span>
                        <span class="token property">&quot;fields&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;keyword&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;keyword&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token property">&quot;pinyin&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;text&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;analyzer&quot;</span><span class="token operator">:</span> <span class="token string">&quot;pinyin_analyzer&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;description&quot;</span><span class="token operator">:</span>  <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;text&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;analyzer&quot;</span><span class="token operator">:</span> <span class="token string">&quot;ik_max_word&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;brand&quot;</span><span class="token operator">:</span>        <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;keyword&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;category&quot;</span><span class="token operator">:</span>     <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;keyword&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;price&quot;</span><span class="token operator">:</span>        <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;scaled_float&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;scaling_factor&quot;</span><span class="token operator">:</span> <span class="token number">100</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;stock&quot;</span><span class="token operator">:</span>        <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;integer&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;rating&quot;</span><span class="token operator">:</span>       <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;float&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;tags&quot;</span><span class="token operator">:</span>         <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;keyword&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;specs&quot;</span><span class="token operator">:</span>        <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;nested&quot;</span><span class="token punctuation">,</span>          <span class="token comment">// 嵌套对象（每个规格独立索引）</span>
        <span class="token property">&quot;properties&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;keyword&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token property">&quot;value&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;keyword&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;created_at&quot;</span><span class="token operator">:</span>   <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;date&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;is_hot&quot;</span><span class="token operator">:</span>       <span class="token punctuation">{</span> <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;boolean&quot;</span> <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 2. 索引文档（批量）</span>
POST /_bulk
<span class="token punctuation">{</span> <span class="token property">&quot;index&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;_index&quot;</span><span class="token operator">:</span> <span class="token string">&quot;products&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;_id&quot;</span><span class="token operator">:</span> <span class="token number">1</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span>
<span class="token punctuation">{</span> <span class="token property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token number">1</span><span class="token punctuation">,</span> <span class="token property">&quot;title&quot;</span><span class="token operator">:</span> <span class="token string">&quot;iPhone 15 Pro 钛金属 256GB&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;description&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Apple 最新旗舰手机 A17 Pro 芯片 4800万像素&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;brand&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Apple&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;category&quot;</span><span class="token operator">:</span> <span class="token string">&quot;手机&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;price&quot;</span><span class="token operator">:</span> <span class="token number">8999.00</span><span class="token punctuation">,</span> <span class="token property">&quot;stock&quot;</span><span class="token operator">:</span> <span class="token number">100</span><span class="token punctuation">,</span> <span class="token property">&quot;rating&quot;</span><span class="token operator">:</span> <span class="token number">4.8</span><span class="token punctuation">,</span> <span class="token property">&quot;tags&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;5G&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;旗舰&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;拍照&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token property">&quot;specs&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;屏幕&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;value&quot;</span><span class="token operator">:</span> <span class="token string">&quot;6.1英寸&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;芯片&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;value&quot;</span><span class="token operator">:</span> <span class="token string">&quot;A17 Pro&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;存储&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;value&quot;</span><span class="token operator">:</span> <span class="token string">&quot;256GB&quot;</span><span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token property">&quot;created_at&quot;</span><span class="token operator">:</span> <span class="token string">&quot;2024-01-15&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;is_hot&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span> <span class="token punctuation">}</span>
<span class="token punctuation">{</span> <span class="token property">&quot;index&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;_index&quot;</span><span class="token operator">:</span> <span class="token string">&quot;products&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;_id&quot;</span><span class="token operator">:</span> <span class="token number">2</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span>
<span class="token punctuation">{</span> <span class="token property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token number">2</span><span class="token punctuation">,</span> <span class="token property">&quot;title&quot;</span><span class="token operator">:</span> <span class="token string">&quot;MacBook Pro 16英寸 M3 Pro 芯片&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;description&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Apple 笔记本电脑 18GB内存 512GB存储&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;brand&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Apple&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;category&quot;</span><span class="token operator">:</span> <span class="token string">&quot;笔记本&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;price&quot;</span><span class="token operator">:</span> <span class="token number">19999.00</span><span class="token punctuation">,</span> <span class="token property">&quot;stock&quot;</span><span class="token operator">:</span> <span class="token number">50</span><span class="token punctuation">,</span> <span class="token property">&quot;rating&quot;</span><span class="token operator">:</span> <span class="token number">4.9</span><span class="token punctuation">,</span> <span class="token property">&quot;tags&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;办公&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;设计&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;编程&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token property">&quot;specs&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;屏幕&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;value&quot;</span><span class="token operator">:</span> <span class="token string">&quot;16英寸&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;芯片&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;value&quot;</span><span class="token operator">:</span> <span class="token string">&quot;M3 Pro&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;内存&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;value&quot;</span><span class="token operator">:</span> <span class="token string">&quot;18GB&quot;</span><span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token property">&quot;created_at&quot;</span><span class="token operator">:</span> <span class="token string">&quot;2024-01-10&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;is_hot&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span> <span class="token punctuation">}</span>
<span class="token punctuation">{</span> <span class="token property">&quot;index&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;_index&quot;</span><span class="token operator">:</span> <span class="token string">&quot;products&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;_id&quot;</span><span class="token operator">:</span> <span class="token number">3</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span>
<span class="token punctuation">{</span> <span class="token property">&quot;id&quot;</span><span class="token operator">:</span> <span class="token number">3</span><span class="token punctuation">,</span> <span class="token property">&quot;title&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Samsung Galaxy S24 Ultra&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;description&quot;</span><span class="token operator">:</span> <span class="token string">&quot;三星旗舰手机 AI智能 钛金属框架&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;brand&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Samsung&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;category&quot;</span><span class="token operator">:</span> <span class="token string">&quot;手机&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;price&quot;</span><span class="token operator">:</span> <span class="token number">9999.00</span><span class="token punctuation">,</span> <span class="token property">&quot;stock&quot;</span><span class="token operator">:</span> <span class="token number">80</span><span class="token punctuation">,</span> <span class="token property">&quot;rating&quot;</span><span class="token operator">:</span> <span class="token number">4.5</span><span class="token punctuation">,</span> <span class="token property">&quot;tags&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;5G&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;AI&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;旗舰&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token property">&quot;specs&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token punctuation">{</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;屏幕&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;value&quot;</span><span class="token operator">:</span> <span class="token string">&quot;6.8英寸&quot;</span><span class="token punctuation">}</span><span class="token punctuation">,</span> <span class="token punctuation">{</span><span class="token property">&quot;name&quot;</span><span class="token operator">:</span> <span class="token string">&quot;芯片&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;value&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Snapdragon 8 Gen 3&quot;</span><span class="token punctuation">}</span><span class="token punctuation">]</span><span class="token punctuation">,</span> <span class="token property">&quot;created_at&quot;</span><span class="token operator">:</span> <span class="token string">&quot;2024-02-01&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;is_hot&quot;</span><span class="token operator">:</span> <span class="token boolean">false</span> <span class="token punctuation">}</span>

<span class="token comment">// 3. 搜索查询</span>
<span class="token comment">// 3.1 全文搜索 + 多字段</span>
GET /products/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;multi_match&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token string">&quot;苹果手机&quot;</span><span class="token punctuation">,</span>
      <span class="token property">&quot;fields&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;title^3&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;description&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;brand^2&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>  <span class="token comment">// ^ 表示权重</span>
      <span class="token property">&quot;type&quot;</span><span class="token operator">:</span> <span class="token string">&quot;best_fields&quot;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 3.2 布尔查询 + 过滤 + 排序</span>
GET /products/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;bool&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;must&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;match&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;title&quot;</span><span class="token operator">:</span> <span class="token string">&quot;手机&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span>
      <span class="token punctuation">]</span><span class="token punctuation">,</span>
      <span class="token property">&quot;filter&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;term&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;is_hot&quot;</span><span class="token operator">:</span> <span class="token boolean">true</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;range&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;price&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;gte&quot;</span><span class="token operator">:</span> <span class="token number">5000</span><span class="token punctuation">,</span> <span class="token property">&quot;lte&quot;</span><span class="token operator">:</span> <span class="token number">10000</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;term&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;tags&quot;</span><span class="token operator">:</span> <span class="token string">&quot;5G&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span>
      <span class="token punctuation">]</span><span class="token punctuation">,</span>
      <span class="token property">&quot;must_not&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
        <span class="token punctuation">{</span> <span class="token property">&quot;term&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;brand&quot;</span><span class="token operator">:</span> <span class="token string">&quot;Samsung&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span>
      <span class="token punctuation">]</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;sort&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
    <span class="token punctuation">{</span> <span class="token property">&quot;rating&quot;</span><span class="token operator">:</span> <span class="token string">&quot;desc&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token punctuation">{</span> <span class="token property">&quot;_score&quot;</span><span class="token operator">:</span> <span class="token string">&quot;desc&quot;</span> <span class="token punctuation">}</span>
  <span class="token punctuation">]</span><span class="token punctuation">,</span>
  <span class="token property">&quot;from&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">20</span>
<span class="token punctuation">}</span>

<span class="token comment">// 3.3 聚合分析：品牌分布 + 价格区间</span>
GET /products/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
  <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;brand_distribution&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;terms&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;brand&quot;</span><span class="token punctuation">,</span> <span class="token property">&quot;size&quot;</span><span class="token operator">:</span> <span class="token number">10</span> <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token property">&quot;price_ranges&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;range&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;price&quot;</span><span class="token punctuation">,</span>
        <span class="token property">&quot;ranges&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span>
          <span class="token punctuation">{</span> <span class="token property">&quot;to&quot;</span><span class="token operator">:</span> <span class="token number">5000</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
          <span class="token punctuation">{</span> <span class="token property">&quot;from&quot;</span><span class="token operator">:</span> <span class="token number">5000</span><span class="token punctuation">,</span> <span class="token property">&quot;to&quot;</span><span class="token operator">:</span> <span class="token number">10000</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
          <span class="token punctuation">{</span> <span class="token property">&quot;from&quot;</span><span class="token operator">:</span> <span class="token number">10000</span><span class="token punctuation">,</span> <span class="token property">&quot;to&quot;</span><span class="token operator">:</span> <span class="token number">20000</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
          <span class="token punctuation">{</span> <span class="token property">&quot;from&quot;</span><span class="token operator">:</span> <span class="token number">20000</span> <span class="token punctuation">}</span>
        <span class="token punctuation">]</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token property">&quot;avg_price_by_category&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;terms&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;category&quot;</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;aggs&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
        <span class="token property">&quot;avg_price&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;avg&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;price&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span>
      <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 3.4 搜索建议 (自动补全)</span>
GET /products/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;suggest&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;title_suggest&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;prefix&quot;</span><span class="token operator">:</span> <span class="token string">&quot;iph&quot;</span><span class="token punctuation">,</span>
      <span class="token property">&quot;completion&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;field&quot;</span><span class="token operator">:</span> <span class="token string">&quot;title.suggest&quot;</span> <span class="token punctuation">}</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

<span class="token comment">// 3.5 高亮显示</span>
GET /products/_search
<span class="token punctuation">{</span>
  <span class="token property">&quot;query&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;match&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;description&quot;</span><span class="token operator">:</span> <span class="token string">&quot;AI 智能&quot;</span> <span class="token punctuation">}</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
  <span class="token property">&quot;highlight&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
    <span class="token property">&quot;fields&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span>
      <span class="token property">&quot;title&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;number_of_fragments&quot;</span><span class="token operator">:</span> <span class="token number">0</span> <span class="token punctuation">}</span><span class="token punctuation">,</span>
      <span class="token property">&quot;description&quot;</span><span class="token operator">:</span> <span class="token punctuation">{</span> <span class="token property">&quot;fragment_size&quot;</span><span class="token operator">:</span> <span class="token number">150</span><span class="token punctuation">,</span> <span class="token property">&quot;number_of_fragments&quot;</span><span class="token operator">:</span> <span class="token number">3</span> <span class="token punctuation">}</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token property">&quot;pre_tags&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;&lt;em&gt;&quot;</span><span class="token punctuation">]</span><span class="token punctuation">,</span>
    <span class="token property">&quot;post_tags&quot;</span><span class="token operator">:</span> <span class="token punctuation">[</span><span class="token string">&quot;&lt;/em&gt;&quot;</span><span class="token punctuation">]</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="七、-数据库性能优化深度总结" tabindex="-1"><a class="header-anchor" href="#七、-数据库性能优化深度总结"><span>七、 数据库性能优化深度总结</span></a></h2><h3 id="_7-1-优化全景图" tabindex="-1"><a class="header-anchor" href="#_7-1-优化全景图"><span>7.1 优化全景图</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>数据库性能优化全景:

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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-2-索引优化-—-最有效的优化手段" tabindex="-1"><a class="header-anchor" href="#_7-2-索引优化-—-最有效的优化手段"><span>7.2 索引优化 — 最有效的优化手段</span></a></h3><p>索引是数据库优化的第一利器。好的索引能让查询性能提升几个数量级。</p><h4 id="_7-2-1-索引类型与选择" tabindex="-1"><a class="header-anchor" href="#_7-2-1-索引类型与选择"><span>7.2.1 索引类型与选择</span></a></h4><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>MySQL/InnoDB 索引类型决策:

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
  前缀匹配 → B+Tree (like &#39;abc%&#39; 走索引)
  后缀匹配 → 反转存储 + B+Tree 或全文索引
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_7-2-2-索引设计黄金法则" tabindex="-1"><a class="header-anchor" href="#_7-2-2-索引设计黄金法则"><span>7.2.2 索引设计黄金法则</span></a></h4><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token comment">-- ============================================</span>
<span class="token comment">-- 索引设计黄金法则 + 实践</span>
<span class="token comment">-- ============================================</span>

<span class="token comment">-- 法则1: 高选择性列优先建索引</span>
<span class="token comment">-- 选择性 = DISTINCT 值数 / 总行数，越高越好</span>
<span class="token keyword">SELECT</span> <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token keyword">DISTINCT</span> email<span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token function">COUNT</span><span class="token punctuation">(</span><span class="token operator">*</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> selectivity <span class="token keyword">FROM</span> users<span class="token punctuation">;</span>
<span class="token comment">-- 选择性 &gt; 0.1 的列适合建索引</span>

<span class="token comment">-- 法则2: 复合索引遵循&quot;最左前缀&quot;原则</span>
<span class="token comment">-- 查询: WHERE status = &#39;active&#39; AND created_at &gt; &#39;2024-01-01&#39; ORDER BY created_at</span>
<span class="token comment">-- 正确的索引顺序: (status, created_at) — 等值在前，范围在后</span>
<span class="token keyword">CREATE</span> <span class="token keyword">INDEX</span> idx_status_created <span class="token keyword">ON</span> orders <span class="token punctuation">(</span><span class="token keyword">status</span><span class="token punctuation">,</span> created_at<span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">-- ❌ 错误: 范围列在前，后面的列无法用到索引</span>
<span class="token comment">-- CREATE INDEX idx_created_status ON orders (created_at, status);</span>

<span class="token comment">-- 法则3: 覆盖索引避免回表</span>
<span class="token comment">-- 查询只涉及: SELECT user_id, status, created_at FROM orders WHERE status = &#39;pending&#39;</span>
<span class="token comment">-- 覆盖索引包含所有需要的列，直接从索引返回数据，不回表</span>
<span class="token keyword">CREATE</span> <span class="token keyword">INDEX</span> idx_covering <span class="token keyword">ON</span> orders <span class="token punctuation">(</span><span class="token keyword">status</span><span class="token punctuation">,</span> user_id<span class="token punctuation">,</span> created_at<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">-- 用 EXPLAIN 验证: Extra 列显示 &quot;Using index&quot; 即为覆盖索引</span>

<span class="token comment">-- 法则4: 避免在索引列上使用函数</span>
<span class="token comment">-- ❌ 错误: WHERE DATE(created_at) = &#39;2024-01-01&#39;  -- 索引失效!</span>
<span class="token comment">-- ✅ 正确: WHERE created_at &gt;= &#39;2024-01-01&#39; AND created_at &lt; &#39;2024-01-02&#39;</span>

<span class="token comment">-- 法则5: 隐式类型转换导致索引失效</span>
<span class="token comment">-- ❌ 错误: WHERE phone = 13800000001  -- phone 是 VARCHAR，隐式转换导致索引失效!</span>
<span class="token comment">-- ✅ 正确: WHERE phone = &#39;13800000001&#39;</span>

<span class="token comment">-- 法则6: 联合索引的&quot;最左匹配&quot;验证</span>
<span class="token keyword">CREATE</span> <span class="token keyword">INDEX</span> idx_a_b_c <span class="token keyword">ON</span> test <span class="token punctuation">(</span>a<span class="token punctuation">,</span> b<span class="token punctuation">,</span> c<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">-- WHERE a = 1 AND b = 2 AND c = 3  ✅ 全匹配</span>
<span class="token comment">-- WHERE a = 1 AND b = 2            ✅ 匹配 a,b</span>
<span class="token comment">-- WHERE a = 1 AND c = 3            ✅ 只匹配 a (c 无法使用)</span>
<span class="token comment">-- WHERE b = 2 AND c = 3            ❌ 不使用索引 (缺少 a)</span>
<span class="token comment">-- WHERE a = 1 AND b &gt; 2 AND c = 3  ✅ 匹配 a,b (范围后的 c 不匹配)</span>

<span class="token comment">-- 法则7: ORDER BY + LIMIT 优化</span>
<span class="token comment">-- 场景: 分页查询</span>
<span class="token comment">-- ❌ 深分页慢: SELECT * FROM orders ORDER BY id LIMIT 100000, 20;</span>
<span class="token comment">-- ✅ 延迟关联优化:</span>
<span class="token keyword">SELECT</span> o<span class="token punctuation">.</span><span class="token operator">*</span> <span class="token keyword">FROM</span> orders o
<span class="token keyword">INNER</span> <span class="token keyword">JOIN</span> <span class="token punctuation">(</span>
    <span class="token keyword">SELECT</span> id <span class="token keyword">FROM</span> orders <span class="token keyword">ORDER</span> <span class="token keyword">BY</span> id <span class="token keyword">LIMIT</span> <span class="token number">100000</span><span class="token punctuation">,</span> <span class="token number">20</span>
<span class="token punctuation">)</span> <span class="token keyword">AS</span> tmp <span class="token keyword">ON</span> o<span class="token punctuation">.</span>id <span class="token operator">=</span> tmp<span class="token punctuation">.</span>id<span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_7-2-3-索引监控与维护" tabindex="-1"><a class="header-anchor" href="#_7-2-3-索引监控与维护"><span>7.2.3 索引监控与维护</span></a></h4><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token comment">-- 查看未使用的索引（MySQL 8.0+）</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> sys<span class="token punctuation">.</span>schema_unused_indexes<span class="token punctuation">;</span>

<span class="token comment">-- 查看冗余索引</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> sys<span class="token punctuation">.</span>schema_redundant_indexes
<span class="token keyword">WHERE</span> table_schema <span class="token operator">=</span> <span class="token string">&#39;ecommerce&#39;</span><span class="token punctuation">;</span>

<span class="token comment">-- 查看索引使用统计</span>
<span class="token keyword">SELECT</span>
    table_name<span class="token punctuation">,</span>
    index_name<span class="token punctuation">,</span>
    rows_selected<span class="token punctuation">,</span>
    rows_inserted<span class="token punctuation">,</span>
    rows_updated<span class="token punctuation">,</span>
    rows_deleted
<span class="token keyword">FROM</span> sys<span class="token punctuation">.</span>schema_index_statistics
<span class="token keyword">WHERE</span> table_schema <span class="token operator">=</span> <span class="token string">&#39;ecommerce&#39;</span><span class="token punctuation">;</span>

<span class="token comment">-- 查看表统计信息（影响优化器选择）</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> mysql<span class="token punctuation">.</span>innodb_table_stats <span class="token keyword">WHERE</span> database_name <span class="token operator">=</span> <span class="token string">&#39;ecommerce&#39;</span><span class="token punctuation">;</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> mysql<span class="token punctuation">.</span>innodb_index_stats <span class="token keyword">WHERE</span> database_name <span class="token operator">=</span> <span class="token string">&#39;ecommerce&#39;</span><span class="token punctuation">;</span>

<span class="token comment">-- 重建索引（碎片整理）</span>
<span class="token comment">-- 碎片率 = (data_free / (data_length + index_length)) * 100</span>
<span class="token keyword">SELECT</span>
    table_name<span class="token punctuation">,</span>
    <span class="token function">ROUND</span><span class="token punctuation">(</span>data_free <span class="token operator">/</span> <span class="token number">1024</span> <span class="token operator">/</span> <span class="token number">1024</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> data_free_mb<span class="token punctuation">,</span>
    <span class="token function">ROUND</span><span class="token punctuation">(</span>data_length <span class="token operator">/</span> <span class="token number">1024</span> <span class="token operator">/</span> <span class="token number">1024</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> data_length_mb<span class="token punctuation">,</span>
    <span class="token function">ROUND</span><span class="token punctuation">(</span>index_length <span class="token operator">/</span> <span class="token number">1024</span> <span class="token operator">/</span> <span class="token number">1024</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> index_length_mb<span class="token punctuation">,</span>
    <span class="token function">ROUND</span><span class="token punctuation">(</span>data_free <span class="token operator">/</span> <span class="token punctuation">(</span>data_length <span class="token operator">+</span> index_length<span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">100</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> fragment_pct
<span class="token keyword">FROM</span> information_schema<span class="token punctuation">.</span><span class="token keyword">tables</span>
<span class="token keyword">WHERE</span> table_schema <span class="token operator">=</span> <span class="token string">&#39;ecommerce&#39;</span> <span class="token operator">AND</span> data_free <span class="token operator">&gt;</span> <span class="token number">0</span><span class="token punctuation">;</span>

<span class="token comment">-- 当碎片率 &gt; 20% 时考虑重建</span>
<span class="token comment">-- OPTIMIZE TABLE orders;  -- 会锁表，谨慎使用</span>
<span class="token comment">-- ALTER TABLE orders ENGINE=InnoDB;  -- 效果相同（MySQL 8.0 可用 ONLINE DDL）</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-3-sql-查询优化" tabindex="-1"><a class="header-anchor" href="#_7-3-sql-查询优化"><span>7.3 SQL 查询优化</span></a></h3><h4 id="_7-3-1-explain-解读指南" tabindex="-1"><a class="header-anchor" href="#_7-3-1-explain-解读指南"><span>7.3.1 EXPLAIN 解读指南</span></a></h4><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token comment">-- EXPLAIN 输出列解读</span>
<span class="token keyword">EXPLAIN</span> FORMAT<span class="token operator">=</span>JSON
<span class="token keyword">SELECT</span> u<span class="token punctuation">.</span>username<span class="token punctuation">,</span> o<span class="token punctuation">.</span>order_no<span class="token punctuation">,</span> o<span class="token punctuation">.</span>total_amount
<span class="token keyword">FROM</span> orders o
<span class="token keyword">JOIN</span> users u <span class="token keyword">ON</span> o<span class="token punctuation">.</span>user_id <span class="token operator">=</span> u<span class="token punctuation">.</span>id
<span class="token keyword">WHERE</span> o<span class="token punctuation">.</span><span class="token keyword">status</span> <span class="token operator">=</span> <span class="token string">&#39;paid&#39;</span> <span class="token operator">AND</span> o<span class="token punctuation">.</span>created_at <span class="token operator">&gt;</span> <span class="token string">&#39;2024-01-01&#39;</span><span class="token punctuation">;</span>

<span class="token comment">/*
关键指标解读:
┌──────────────┬──────────────────────────────────────────────┐
│ type         │ 访问类型 (从好到差):                           │
│              │ system &gt; const &gt; eq_ref &gt; ref &gt; range &gt;       │
│              │ index &gt; ALL                                   │
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
*/</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="_7-3-2-常见-sql-反模式与优化" tabindex="-1"><a class="header-anchor" href="#_7-3-2-常见-sql-反模式与优化"><span>7.3.2 常见 SQL 反模式与优化</span></a></h4><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token comment">-- ============================================</span>
<span class="token comment">-- 常见 SQL 反模式与优化方案</span>
<span class="token comment">-- ============================================</span>

<span class="token comment">-- 反模式1: SELECT * (取出所有列)</span>
<span class="token comment">-- ❌ SELECT * FROM users WHERE id = 1;</span>
<span class="token comment">-- ✅ 只取需要的列，利于覆盖索引</span>
<span class="token comment">-- SELECT id, username, email FROM users WHERE id = 1;</span>

<span class="token comment">-- 反模式2: 在 WHERE 中使用 OR (可能导致全表扫描)</span>
<span class="token comment">-- ❌ SELECT * FROM orders WHERE user_id = 1 OR status = &#39;paid&#39;;</span>
<span class="token comment">-- ✅ 使用 UNION ALL 替代（每个子查询都能用上索引）</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> orders <span class="token keyword">WHERE</span> user_id <span class="token operator">=</span> <span class="token number">1</span>
<span class="token keyword">UNION</span> <span class="token keyword">ALL</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> orders <span class="token keyword">WHERE</span> <span class="token keyword">status</span> <span class="token operator">=</span> <span class="token string">&#39;paid&#39;</span> <span class="token operator">AND</span> user_id <span class="token operator">!=</span> <span class="token number">1</span><span class="token punctuation">;</span>

<span class="token comment">-- 反模式3: 大范围 LIMIT 深分页</span>
<span class="token comment">-- ❌ SELECT * FROM orders ORDER BY id LIMIT 100000, 20;</span>
<span class="token comment">-- ✅ 方案A: 延迟关联</span>
<span class="token keyword">SELECT</span> o<span class="token punctuation">.</span><span class="token operator">*</span> <span class="token keyword">FROM</span> orders o
<span class="token keyword">JOIN</span> <span class="token punctuation">(</span><span class="token keyword">SELECT</span> id <span class="token keyword">FROM</span> orders <span class="token keyword">ORDER</span> <span class="token keyword">BY</span> id <span class="token keyword">LIMIT</span> <span class="token number">100000</span><span class="token punctuation">,</span> <span class="token number">20</span><span class="token punctuation">)</span> t <span class="token keyword">ON</span> o<span class="token punctuation">.</span>id <span class="token operator">=</span> t<span class="token punctuation">.</span>id<span class="token punctuation">;</span>
<span class="token comment">-- ✅ 方案B: 游标分页 (记住上次的 id)</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> orders <span class="token keyword">WHERE</span> id <span class="token operator">&gt;</span> <span class="token number">100000</span> <span class="token keyword">ORDER</span> <span class="token keyword">BY</span> id <span class="token keyword">LIMIT</span> <span class="token number">20</span><span class="token punctuation">;</span>

<span class="token comment">-- 反模式4: 在 WHERE 中对列做运算</span>
<span class="token comment">-- ❌ SELECT * FROM orders WHERE YEAR(created_at) = 2024;</span>
<span class="token comment">-- ✅ SELECT * FROM orders WHERE created_at &gt;= &#39;2024-01-01&#39; AND created_at &lt; &#39;2025-01-01&#39;;</span>

<span class="token comment">-- 反模式5: JOIN 过多</span>
<span class="token comment">-- ❌ 一次 JOIN 10 张表</span>
<span class="token comment">-- ✅ 拆分为多次简单查询，在应用层组装；或将冗余数据整合</span>

<span class="token comment">-- 反模式6: 在循环中执行 SQL (N+1 问题)</span>
<span class="token comment">-- ❌</span>
<span class="token comment">-- for user in users:</span>
<span class="token comment">--     orders = db.query(&quot;SELECT * FROM orders WHERE user_id = ?&quot;, user.id)</span>
<span class="token comment">-- ✅ 批量查询</span>
<span class="token comment">-- user_ids = [u.id for u in users]</span>
<span class="token comment">-- orders = db.query(&quot;SELECT * FROM orders WHERE user_id IN (?)&quot;, user_ids)</span>
<span class="token comment">-- 按 user_id 分组后在应用层关联</span>

<span class="token comment">-- 反模式7: 大量数据的 COUNT(*)</span>
<span class="token comment">-- ❌ SELECT COUNT(*) FROM orders;  -- MyISAM 快，InnoDB 全表扫描</span>
<span class="token comment">-- ✅ 使用近似值（EXPLAIN 中的 rows 估计值）或单独维护计数表</span>
<span class="token comment">-- 或用 Redis 计数器: INCR order:count</span>

<span class="token comment">-- 反模式8: NOT IN 子查询 (NULL 陷阱)</span>
<span class="token comment">-- ❌ SELECT * FROM users WHERE id NOT IN (SELECT user_id FROM orders);</span>
<span class="token comment">--   如果 orders.user_id 有 NULL，整个 NOT IN 返回空!</span>
<span class="token comment">-- ✅ SELECT * FROM users u WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);</span>

<span class="token comment">-- 反模式9: 大事务长事务</span>
<span class="token comment">-- ❌ 一个事务包含多次网络调用、文件处理</span>
<span class="token comment">-- ✅ 事务只包裹必要的数据库操作，越短越好</span>

<span class="token comment">-- 反模式10: 未使用预处理语句 (Prepared Statements)</span>
<span class="token comment">-- ❌ 每次拼接 SQL 字符串 → 无法重用执行计划，有 SQL 注入风险</span>
<span class="token comment">-- ✅ 使用参数化查询，执行计划可重用</span>
<span class="token comment">-- PREPARE stmt FROM &#39;SELECT * FROM users WHERE id = ?&#39;;</span>
<span class="token comment">-- EXECUTE stmt USING @user_id;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-4-schema-与表结构优化" tabindex="-1"><a class="header-anchor" href="#_7-4-schema-与表结构优化"><span>7.4 Schema 与表结构优化</span></a></h3><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token comment">-- ============================================</span>
<span class="token comment">-- Schema 设计优化</span>
<span class="token comment">-- ============================================</span>

<span class="token comment">-- 1. 数据类型优化 — 越小越好</span>
<span class="token comment">-- ❌ 用 VARCHAR(255) 存性别</span>
<span class="token comment">-- ✅ 用 TINYINT 或 ENUM</span>
<span class="token comment">-- ❌ 用 BIGINT 做主键（如果数据量不超过 42 亿）</span>
<span class="token comment">-- ✅ 用 INT UNSIGNED (42亿)</span>

<span class="token comment">-- 数据类型选择指南:</span>
<span class="token comment">-- IP 地址:     INT UNSIGNED (INET_ATON)  ← 而非 VARCHAR(15)</span>
<span class="token comment">-- 状态枚举:    TINYINT                     ← 而非 VARCHAR</span>
<span class="token comment">-- 时间戳:      TIMESTAMP (4字节)           ← 而非 DATETIME (8字节) 如果范围够用</span>
<span class="token comment">-- 布尔值:      TINYINT(1)                  ← 而非 CHAR(1)</span>
<span class="token comment">-- UUID 主键:   BINARY(16)                  ← 而非 CHAR(36)</span>

<span class="token comment">-- 2. 适当反范式化 (以空间换时间)</span>
<span class="token comment">-- 范式化: 订单表 + 订单详情表 + 商品表 → JOIN 3 张表</span>
<span class="token comment">-- 反范式: 订单详情表中冗余存储商品名、价格（快照）</span>

<span class="token comment">-- 3. 垂直拆分 — 将大字段分离到独立表</span>
<span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> orders_main <span class="token punctuation">(</span>
    id <span class="token keyword">BIGINT</span> <span class="token keyword">PRIMARY</span> <span class="token keyword">KEY</span><span class="token punctuation">,</span>
    order_no <span class="token keyword">VARCHAR</span><span class="token punctuation">(</span><span class="token number">32</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    user_id <span class="token keyword">BIGINT</span><span class="token punctuation">,</span>
    total_amount <span class="token keyword">DECIMAL</span><span class="token punctuation">(</span><span class="token number">10</span><span class="token punctuation">,</span><span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">status</span> <span class="token keyword">TINYINT</span><span class="token punctuation">,</span>
    created_at <span class="token keyword">DATETIME</span>
<span class="token punctuation">)</span> <span class="token keyword">ENGINE</span><span class="token operator">=</span><span class="token keyword">InnoDB</span><span class="token punctuation">;</span>

<span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> orders_extra <span class="token punctuation">(</span>
    order_id <span class="token keyword">BIGINT</span> <span class="token keyword">PRIMARY</span> <span class="token keyword">KEY</span><span class="token punctuation">,</span>
    shipping_address <span class="token keyword">TEXT</span><span class="token punctuation">,</span>    <span class="token comment">-- 大字段</span>
    user_remark <span class="token keyword">TEXT</span><span class="token punctuation">,</span>          <span class="token comment">-- 大字段</span>
    internal_notes <span class="token keyword">TEXT</span>        <span class="token comment">-- 大字段</span>
<span class="token punctuation">)</span> <span class="token keyword">ENGINE</span><span class="token operator">=</span><span class="token keyword">InnoDB</span><span class="token punctuation">;</span>

<span class="token comment">-- 4. 水平拆分 — 分区表</span>
<span class="token comment">-- 按时间范围分区（MySQL 8.0+）</span>
<span class="token keyword">CREATE</span> <span class="token keyword">TABLE</span> order_logs <span class="token punctuation">(</span>
    id <span class="token keyword">BIGINT</span> <span class="token keyword">AUTO_INCREMENT</span><span class="token punctuation">,</span>
    user_id <span class="token keyword">BIGINT</span><span class="token punctuation">,</span>
    <span class="token keyword">action</span> <span class="token keyword">VARCHAR</span><span class="token punctuation">(</span><span class="token number">50</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    detail JSON<span class="token punctuation">,</span>
    created_at <span class="token keyword">DATETIME</span> <span class="token operator">NOT</span> <span class="token boolean">NULL</span><span class="token punctuation">,</span>
    <span class="token keyword">PRIMARY</span> <span class="token keyword">KEY</span> <span class="token punctuation">(</span>id<span class="token punctuation">,</span> created_at<span class="token punctuation">)</span>
<span class="token punctuation">)</span> <span class="token keyword">PARTITION</span> <span class="token keyword">BY</span> RANGE <span class="token punctuation">(</span>TO_DAYS<span class="token punctuation">(</span>created_at<span class="token punctuation">)</span><span class="token punctuation">)</span> <span class="token punctuation">(</span>
    <span class="token keyword">PARTITION</span> p202401 <span class="token keyword">VALUES</span> LESS THAN <span class="token punctuation">(</span>TO_DAYS<span class="token punctuation">(</span><span class="token string">&#39;2024-02-01&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">PARTITION</span> p202402 <span class="token keyword">VALUES</span> LESS THAN <span class="token punctuation">(</span>TO_DAYS<span class="token punctuation">(</span><span class="token string">&#39;2024-03-01&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">PARTITION</span> p202403 <span class="token keyword">VALUES</span> LESS THAN <span class="token punctuation">(</span>TO_DAYS<span class="token punctuation">(</span><span class="token string">&#39;2024-04-01&#39;</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">,</span>
    <span class="token keyword">PARTITION</span> p_future <span class="token keyword">VALUES</span> LESS THAN MAXVALUE
<span class="token punctuation">)</span><span class="token punctuation">;</span>
<span class="token comment">-- 优势: 查询仅扫描相关分区，删除旧数据只需 TRUNCATE PARTITION</span>

<span class="token comment">-- 5. 自增主键 vs UUID 主键</span>
<span class="token comment">-- 自增主键: 插入快、索引小、但不适合分布式</span>
<span class="token comment">-- UUID: 全局唯一、适合分布式、但插入慢（页分裂）、索引大</span>
<span class="token comment">-- 折中方案: 雪花算法 (Snowflake) — 趋势递增 + 全局唯一 (如 Twitter Snowflake 64位)</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-5-连接池与并发优化" tabindex="-1"><a class="header-anchor" href="#_7-5-连接池与并发优化"><span>7.5 连接池与并发优化</span></a></h3><div class="language-python line-numbers-mode" data-ext="py" data-title="py"><pre class="language-python"><code><span class="token comment"># ============================================</span>
<span class="token comment"># 数据库连接池优化 (Python)</span>
<span class="token comment"># ============================================</span>

<span class="token comment"># MySQL 连接池配置 (使用 SQLAlchemy)</span>
<span class="token keyword">from</span> sqlalchemy <span class="token keyword">import</span> create_engine<span class="token punctuation">,</span> pool
<span class="token keyword">from</span> sqlalchemy<span class="token punctuation">.</span>orm <span class="token keyword">import</span> sessionmaker

<span class="token comment"># 连接池大小计算公式:</span>
<span class="token comment"># 池大小 = ((core_count * 2) + effective_spindle_count)</span>
<span class="token comment"># 例如: 4核 + 1 SSD = (4*2 + 1) = 9</span>
<span class="token comment"># 但实际按业务峰值 QPS 和平均查询耗时计算更准确:</span>
<span class="token comment"># connections = (peak_qps * avg_query_time_ms / 1000) * 1.2 (冗余)</span>

engine <span class="token operator">=</span> create_engine<span class="token punctuation">(</span>
    <span class="token string">&#39;mysql+pymysql://user:pass@host:3306/db&#39;</span><span class="token punctuation">,</span>
    poolclass<span class="token operator">=</span>pool<span class="token punctuation">.</span>QueuePool<span class="token punctuation">,</span>
    pool_size<span class="token operator">=</span><span class="token number">10</span><span class="token punctuation">,</span>              <span class="token comment"># 常驻连接数</span>
    max_overflow<span class="token operator">=</span><span class="token number">20</span><span class="token punctuation">,</span>           <span class="token comment"># 最大溢出连接数 (pool_size + max_overflow = 最大连接数)</span>
    pool_timeout<span class="token operator">=</span><span class="token number">30</span><span class="token punctuation">,</span>           <span class="token comment"># 获取连接超时 (秒)</span>
    pool_recycle<span class="token operator">=</span><span class="token number">3600</span><span class="token punctuation">,</span>         <span class="token comment"># 连接最大存活时间 (秒, 防止 MySQL wait_timeout 断开)</span>
    pool_pre_ping<span class="token operator">=</span><span class="token boolean">True</span><span class="token punctuation">,</span>        <span class="token comment"># 每次检出前 ping 检测连接有效性 (重要!)</span>
    echo_pool<span class="token operator">=</span><span class="token boolean">False</span><span class="token punctuation">,</span>           <span class="token comment"># 调试用: 打印连接池日志</span>

    <span class="token comment"># 客户端超时</span>
    connect_args<span class="token operator">=</span><span class="token punctuation">{</span>
        <span class="token string">&#39;connect_timeout&#39;</span><span class="token punctuation">:</span> <span class="token number">10</span><span class="token punctuation">,</span>      <span class="token comment"># 建连超时</span>
        <span class="token string">&#39;read_timeout&#39;</span><span class="token punctuation">:</span> <span class="token number">30</span><span class="token punctuation">,</span>         <span class="token comment"># 读超时</span>
        <span class="token string">&#39;write_timeout&#39;</span><span class="token punctuation">:</span> <span class="token number">30</span><span class="token punctuation">,</span>        <span class="token comment"># 写超时</span>
        <span class="token string">&#39;charset&#39;</span><span class="token punctuation">:</span> <span class="token string">&#39;utf8mb4&#39;</span><span class="token punctuation">,</span>
        <span class="token string">&#39;autocommit&#39;</span><span class="token punctuation">:</span> <span class="token boolean">False</span><span class="token punctuation">,</span>
    <span class="token punctuation">}</span>
<span class="token punctuation">)</span>

SessionLocal <span class="token operator">=</span> sessionmaker<span class="token punctuation">(</span>bind<span class="token operator">=</span>engine<span class="token punctuation">,</span> autocommit<span class="token operator">=</span><span class="token boolean">False</span><span class="token punctuation">,</span> autoflush<span class="token operator">=</span><span class="token boolean">False</span><span class="token punctuation">)</span>

<span class="token comment"># ============================================</span>
<span class="token comment"># MySQL 服务端关键配置 (my.cnf)</span>
<span class="token comment"># ============================================</span>
<span class="token triple-quoted-string string">&quot;&quot;&quot;
[mysqld]
# InnoDB 核心配置
innodb_buffer_pool_size = 8G           # 核心参数! 设为物理内存的 50%-70%
innodb_buffer_pool_instances = 8       # 多实例减少锁竞争 (&gt;= 1GB 时建议)
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
&quot;&quot;&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-6-读写分离与分库分表" tabindex="-1"><a class="header-anchor" href="#_7-6-读写分离与分库分表"><span>7.6 读写分离与分库分表</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>读写分离架构:

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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-7-缓存策略深度解析" tabindex="-1"><a class="header-anchor" href="#_7-7-缓存策略深度解析"><span>7.7 缓存策略深度解析</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>缓存层级架构:

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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-8-监控与慢查询分析" tabindex="-1"><a class="header-anchor" href="#_7-8-监控与慢查询分析"><span>7.8 监控与慢查询分析</span></a></h3><div class="language-sql line-numbers-mode" data-ext="sql" data-title="sql"><pre class="language-sql"><code><span class="token comment">-- ============================================</span>
<span class="token comment">-- MySQL 性能监控关键指标</span>
<span class="token comment">-- ============================================</span>

<span class="token comment">-- 1. 全局状态概览</span>
<span class="token keyword">SHOW</span> <span class="token keyword">GLOBAL</span> <span class="token keyword">STATUS</span> <span class="token operator">LIKE</span> <span class="token string">&#39;%Connection%&#39;</span><span class="token punctuation">;</span>
<span class="token keyword">SHOW</span> <span class="token keyword">GLOBAL</span> <span class="token keyword">STATUS</span> <span class="token operator">LIKE</span> <span class="token string">&#39;%Threads%&#39;</span><span class="token punctuation">;</span>
<span class="token keyword">SHOW</span> <span class="token keyword">GLOBAL</span> <span class="token keyword">STATUS</span> <span class="token operator">LIKE</span> <span class="token string">&#39;%Innodb_rows%&#39;</span><span class="token punctuation">;</span>
<span class="token keyword">SHOW</span> <span class="token keyword">GLOBAL</span> <span class="token keyword">STATUS</span> <span class="token operator">LIKE</span> <span class="token string">&#39;%Innodb_buffer_pool%&#39;</span><span class="token punctuation">;</span>
<span class="token keyword">SHOW</span> <span class="token keyword">GLOBAL</span> <span class="token keyword">STATUS</span> <span class="token operator">LIKE</span> <span class="token string">&#39;%Created_tmp%&#39;</span><span class="token punctuation">;</span>  <span class="token comment">-- 临时表创建统计</span>

<span class="token comment">-- 2. InnoDB Buffer Pool 命中率 (最关键的指标)</span>
<span class="token keyword">SELECT</span>
    <span class="token function">ROUND</span><span class="token punctuation">(</span><span class="token punctuation">(</span>
        <span class="token punctuation">(</span><span class="token keyword">SELECT</span> VARIABLE_VALUE <span class="token keyword">FROM</span> performance_schema<span class="token punctuation">.</span>global_status <span class="token keyword">WHERE</span> VARIABLE_NAME <span class="token operator">=</span> <span class="token string">&#39;Innodb_buffer_pool_read_requests&#39;</span><span class="token punctuation">)</span>
        <span class="token operator">-</span> <span class="token punctuation">(</span><span class="token keyword">SELECT</span> VARIABLE_VALUE <span class="token keyword">FROM</span> performance_schema<span class="token punctuation">.</span>global_status <span class="token keyword">WHERE</span> VARIABLE_NAME <span class="token operator">=</span> <span class="token string">&#39;Innodb_buffer_pool_reads&#39;</span><span class="token punctuation">)</span>
    <span class="token punctuation">)</span> <span class="token operator">/</span> <span class="token punctuation">(</span><span class="token keyword">SELECT</span> VARIABLE_VALUE <span class="token keyword">FROM</span> performance_schema<span class="token punctuation">.</span>global_status <span class="token keyword">WHERE</span> VARIABLE_NAME <span class="token operator">=</span> <span class="token string">&#39;Innodb_buffer_pool_read_requests&#39;</span><span class="token punctuation">)</span> <span class="token operator">*</span> <span class="token number">100</span><span class="token punctuation">,</span> <span class="token number">2</span>
<span class="token punctuation">)</span> <span class="token keyword">AS</span> buffer_pool_hit_rate<span class="token punctuation">;</span>
<span class="token comment">-- 目标: &gt; 99%</span>

<span class="token comment">-- 3. 慢查询分析</span>
<span class="token comment">-- 启用慢查询日志后:</span>
<span class="token comment">-- mysqldumpslow -s t -t 10 /var/log/mysql/slow.log   # 按时间排序 TOP 10</span>
<span class="token comment">-- pt-query-digest /var/log/mysql/slow.log             # Percona Toolkit 详细分析</span>

<span class="token comment">-- 4. 实时查看正在执行的查询</span>
<span class="token keyword">SHOW</span> <span class="token keyword">FULL</span> PROCESSLIST<span class="token punctuation">;</span>

<span class="token comment">-- 5. 查看锁等待</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> information_schema<span class="token punctuation">.</span>INNODB_TRX<span class="token punctuation">;</span>          <span class="token comment">-- 当前事务</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> information_schema<span class="token punctuation">.</span>INNODB_LOCKS<span class="token punctuation">;</span>         <span class="token comment">-- 当前锁 (8.0 前)</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> performance_schema<span class="token punctuation">.</span>data_locks<span class="token punctuation">;</span>           <span class="token comment">-- 当前锁 (8.0+)</span>
<span class="token keyword">SELECT</span> <span class="token operator">*</span> <span class="token keyword">FROM</span> performance_schema<span class="token punctuation">.</span>data_lock_waits<span class="token punctuation">;</span>      <span class="token comment">-- 锁等待 (8.0+)</span>

<span class="token comment">-- 6. 查看表锁竞争</span>
<span class="token keyword">SHOW</span> <span class="token keyword">STATUS</span> <span class="token operator">LIKE</span> <span class="token string">&#39;Table_locks%&#39;</span><span class="token punctuation">;</span>

<span class="token comment">-- 7. 死锁分析</span>
<span class="token keyword">SHOW</span> <span class="token keyword">ENGINE</span> <span class="token keyword">INNODB</span> <span class="token keyword">STATUS</span>\\G  <span class="token comment">-- 查看 LATEST DETECTED DEADLOCK 部分</span>

<span class="token comment">-- 8. Performance Schema 分析 (MySQL 5.7+)</span>
<span class="token comment">-- 找出哪类 SQL 消耗最多时间</span>
<span class="token keyword">SELECT</span>
    DIGEST_TEXT<span class="token punctuation">,</span>
    COUNT_STAR <span class="token keyword">AS</span> exec_count<span class="token punctuation">,</span>
    <span class="token function">ROUND</span><span class="token punctuation">(</span>AVG_TIMER_WAIT <span class="token operator">/</span> <span class="token number">1000000000</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> avg_ms<span class="token punctuation">,</span>
    <span class="token function">ROUND</span><span class="token punctuation">(</span>SUM_TIMER_WAIT <span class="token operator">/</span> <span class="token number">1000000000</span><span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> total_ms<span class="token punctuation">,</span>
    <span class="token function">ROUND</span><span class="token punctuation">(</span>SUM_ROWS_EXAMINED <span class="token operator">/</span> COUNT_STAR<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> avg_rows_examined<span class="token punctuation">,</span>
    <span class="token function">ROUND</span><span class="token punctuation">(</span>SUM_ROWS_SENT <span class="token operator">/</span> COUNT_STAR<span class="token punctuation">,</span> <span class="token number">0</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> avg_rows_sent
<span class="token keyword">FROM</span> performance_schema<span class="token punctuation">.</span>events_statements_summary_by_digest
<span class="token keyword">WHERE</span> SCHEMA_NAME <span class="token operator">=</span> <span class="token string">&#39;ecommerce&#39;</span>
<span class="token keyword">ORDER</span> <span class="token keyword">BY</span> SUM_TIMER_WAIT <span class="token keyword">DESC</span>
<span class="token keyword">LIMIT</span> <span class="token number">20</span><span class="token punctuation">;</span>

<span class="token comment">-- 9. 找出未使用索引</span>
<span class="token keyword">SELECT</span>
    t<span class="token punctuation">.</span>TABLE_SCHEMA<span class="token punctuation">,</span> t<span class="token punctuation">.</span>TABLE_NAME<span class="token punctuation">,</span> t<span class="token punctuation">.</span>ROWS_READ<span class="token punctuation">,</span> t<span class="token punctuation">.</span>ROWS_CHANGED<span class="token punctuation">,</span>
    t<span class="token punctuation">.</span>ROWS_CHANGED_X_INDEXES<span class="token punctuation">,</span>
    <span class="token punctuation">(</span><span class="token keyword">CASE</span> <span class="token keyword">WHEN</span> t<span class="token punctuation">.</span>ROWS_CHANGED <span class="token operator">&gt;</span> <span class="token number">0</span>
          <span class="token keyword">THEN</span> <span class="token function">ROUND</span><span class="token punctuation">(</span><span class="token number">100</span> <span class="token operator">-</span> <span class="token number">100</span> <span class="token operator">*</span> t<span class="token punctuation">.</span>ROWS_CHANGED_X_INDEXES <span class="token operator">/</span> t<span class="token punctuation">.</span>ROWS_CHANGED<span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span>
          <span class="token keyword">ELSE</span> <span class="token number">0</span> <span class="token keyword">END</span><span class="token punctuation">)</span> <span class="token keyword">AS</span> pct_index_not_used
<span class="token keyword">FROM</span> sys<span class="token punctuation">.</span>schema_table_statistics t
<span class="token keyword">WHERE</span> t<span class="token punctuation">.</span>TABLE_SCHEMA <span class="token operator">=</span> <span class="token string">&#39;ecommerce&#39;</span> <span class="token operator">AND</span> t<span class="token punctuation">.</span>ROWS_CHANGED <span class="token operator">&gt;</span> <span class="token number">1000</span>
<span class="token keyword">ORDER</span> <span class="token keyword">BY</span> pct_index_not_used <span class="token keyword">DESC</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-9-优化检查清单-checklist" tabindex="-1"><a class="header-anchor" href="#_7-9-优化检查清单-checklist"><span>7.9 优化检查清单 (Checklist)</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>数据库优化检查清单:
□ 1. 所有 WHERE/JOIN/ORDER BY 的列是否有合适索引？
□ 2. 是否有冗余或未使用的索引？（定期清理）
□ 3. 慢查询是否已全部分析和优化？
□ 4. SELECT 是否只取需要的列？（避免 SELECT *）
□ 5. 大表是否考虑分区或分表？
□ 6. Buffer Pool 命中率是否 &gt; 99%？
□ 7. 是否有热点数据未使用缓存？
□ 8. 连接池大小是否合理？
□ 9. 事务是否尽可能短？
□ 10. 是否有隐式类型转换导致索引失效？
□ 11. 分页是否使用游标或延迟关联？
□ 12. 是否有大字段可以拆分到独立表？
□ 13. 读写是否分离？从库延迟是否可控？
□ 14. 备份策略是否完善？恢复演练是否做过？
□ 15. 监控告警是否覆盖核心指标？
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="八、-新兴趋势与未来" tabindex="-1"><a class="header-anchor" href="#八、-新兴趋势与未来"><span>八、 新兴趋势与未来</span></a></h2><ol><li><strong>NewSQL (分布式 SQL)</strong>: 结合了 RDBMS 的 ACID 特性和 NoSQL 的水平扩展能力 (如 <strong>TiDB</strong>, <strong>CockroachDB</strong>)。</li><li><strong>云原生数据库 (Serverless/Cloud-Native)</strong>: 极致的弹性缩放，按需付费 (如 <strong>Amazon Aurora</strong>, <strong>PlanetScale</strong>, <strong>Neon</strong>)。</li><li><strong>多模型数据库 (Multi-model)</strong>: 单个数据库支持多种模型（文档+关系+图），如 <strong>ArangoDB</strong>, <strong>CosmosDB</strong>。</li><li><strong>HTAP (混合事务/分析处理)</strong>: 同一个数据库既能处理高频事务，也能进行复杂的分析查询。</li></ol><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>技术栈演进趋势:

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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="九、-结论" tabindex="-1"><a class="header-anchor" href="#九、-结论"><span>九、 结论</span></a></h2><p>没有&quot;最好&quot;的数据库，只有&quot;最适合&quot;的数据库。</p><ul><li><strong>优先选择 RDBMS (如 PostgreSQL)</strong>：如果你的数据关系复杂、一致性要求高，且处于项目早期。</li><li><strong>考虑引入 NoSQL</strong>：当你遇到 RDBMS 的性能瓶颈、数据模型极度灵活、或者有特殊的数据结构（如图或向量）需求时。</li></ul><p><strong>最终决策应基于具体业务场景的 POC (概念验证) 测试结果，并结合团队的技术储备和运维成本。</strong></p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>总结:

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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,109),o=[p];function l(c,i){return a(),s("div",null,o)}const d=n(e,[["render",l],["__file","database-selection.html.vue"]]),k=JSON.parse('{"path":"/backend/database/database-selection.html","title":"数据库技术选型指南","lang":"zh-CN","frontmatter":{"description":"数据库技术选型指南 关系型与非关系型数据库的全面分析 在软件开发中，数据库的选择对系统性能、可扩展性和维护成本有深远影响。本文将全面分析主流数据库类型的特点、适用场景及选择策略，帮助开发者做出明智的技术选型。 一、 数据库核心理论基础 在深入具体数据库之前，理解以下两个核心理论对于选型至关重要。 1.1 CAP 定理 (CAP Theorem) 分布式...","head":[["meta",{"property":"og:url","content":"https://lfange.github.io/backend/database/database-selection.html"}],["meta",{"property":"og:site_name","content":"哓番茄"}],["meta",{"property":"og:title","content":"数据库技术选型指南"}],["meta",{"property":"og:description","content":"数据库技术选型指南 关系型与非关系型数据库的全面分析 在软件开发中，数据库的选择对系统性能、可扩展性和维护成本有深远影响。本文将全面分析主流数据库类型的特点、适用场景及选择策略，帮助开发者做出明智的技术选型。 一、 数据库核心理论基础 在深入具体数据库之前，理解以下两个核心理论对于选型至关重要。 1.1 CAP 定理 (CAP Theorem) 分布式..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2026-07-20T04:27:28.000Z"}],["meta",{"property":"article:author","content":"哓番茄"}],["meta",{"property":"article:modified_time","content":"2026-07-20T04:27:28.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"数据库技术选型指南\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2026-07-20T04:27:28.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"哓番茄\\",\\"url\\":\\"https://lfange.github.io/\\"}]}"]]},"headers":[{"level":2,"title":"关系型与非关系型数据库的全面分析","slug":"关系型与非关系型数据库的全面分析","link":"#关系型与非关系型数据库的全面分析","children":[]},{"level":2,"title":"一、 数据库核心理论基础","slug":"一、-数据库核心理论基础","link":"#一、-数据库核心理论基础","children":[{"level":3,"title":"1.1 CAP 定理 (CAP Theorem)","slug":"_1-1-cap-定理-cap-theorem","link":"#_1-1-cap-定理-cap-theorem","children":[]},{"level":3,"title":"1.2 ACID vs. BASE","slug":"_1-2-acid-vs-base","link":"#_1-2-acid-vs-base","children":[]},{"level":3,"title":"1.3 事务隔离级别 (Isolation Levels)","slug":"_1-3-事务隔离级别-isolation-levels","link":"#_1-3-事务隔离级别-isolation-levels","children":[]}]},{"level":2,"title":"二、 数据库分类概览","slug":"二、-数据库分类概览","link":"#二、-数据库分类概览","children":[{"level":3,"title":"2.1 关系型数据库 (RDBMS)","slug":"_2-1-关系型数据库-rdbms","link":"#_2-1-关系型数据库-rdbms","children":[]},{"level":3,"title":"2.2 非关系型数据库 (NoSQL)","slug":"_2-2-非关系型数据库-nosql","link":"#_2-2-非关系型数据库-nosql","children":[]}]},{"level":2,"title":"三、 RDBMS vs. NoSQL 深度对比","slug":"三、-rdbms-vs-nosql-深度对比","link":"#三、-rdbms-vs-nosql-深度对比","children":[]},{"level":2,"title":"四、 主流数据库深度对比分析","slug":"四、-主流数据库深度对比分析","link":"#四、-主流数据库深度对比分析","children":[{"level":3,"title":"4.1 MySQL vs PostgreSQL — 开源 RDBMS 双雄对决","slug":"_4-1-mysql-vs-postgresql-—-开源-rdbms-双雄对决","link":"#_4-1-mysql-vs-postgresql-—-开源-rdbms-双雄对决","children":[]},{"level":3,"title":"4.2 MySQL InnoDB 存储引擎深度解析","slug":"_4-2-mysql-innodb-存储引擎深度解析","link":"#_4-2-mysql-innodb-存储引擎深度解析","children":[]},{"level":3,"title":"4.3 PostgreSQL 高级特性","slug":"_4-3-postgresql-高级特性","link":"#_4-3-postgresql-高级特性","children":[]},{"level":3,"title":"4.4 NoSQL 数据库横向对比","slug":"_4-4-nosql-数据库横向对比","link":"#_4-4-nosql-数据库横向对比","children":[]},{"level":3,"title":"4.5 Redis 深度解析","slug":"_4-5-redis-深度解析","link":"#_4-5-redis-深度解析","children":[]},{"level":3,"title":"4.6 MongoDB vs PostgreSQL JSONB — 文档存储之争","slug":"_4-6-mongodb-vs-postgresql-jsonb-—-文档存储之争","link":"#_4-6-mongodb-vs-postgresql-jsonb-—-文档存储之争","children":[]}]},{"level":2,"title":"五、 数据库选型决策流程","slug":"五、-数据库选型决策流程","link":"#五、-数据库选型决策流程","children":[{"level":3,"title":"1. 核心考量因素","slug":"_1-核心考量因素","link":"#_1-核心考量因素","children":[]},{"level":3,"title":"2. 混合架构策略 (Polyglot Persistence)","slug":"_2-混合架构策略-polyglot-persistence","link":"#_2-混合架构策略-polyglot-persistence","children":[]}]},{"level":2,"title":"六、 实践 Demo — 各数据库入门操作","slug":"六、-实践-demo-—-各数据库入门操作","link":"#六、-实践-demo-—-各数据库入门操作","children":[{"level":3,"title":"6.1 MySQL — 电商订单系统 Demo","slug":"_6-1-mysql-—-电商订单系统-demo","link":"#_6-1-mysql-—-电商订单系统-demo","children":[]},{"level":3,"title":"6.2 PostgreSQL — 高级特性 Demo","slug":"_6-2-postgresql-—-高级特性-demo","link":"#_6-2-postgresql-—-高级特性-demo","children":[]},{"level":3,"title":"6.3 Redis — 实战场景 Demo","slug":"_6-3-redis-—-实战场景-demo","link":"#_6-3-redis-—-实战场景-demo","children":[]},{"level":3,"title":"6.4 MongoDB — 文档操作 Demo","slug":"_6-4-mongodb-—-文档操作-demo","link":"#_6-4-mongodb-—-文档操作-demo","children":[]},{"level":3,"title":"6.5 Elasticsearch — 全文搜索 Demo","slug":"_6-5-elasticsearch-—-全文搜索-demo","link":"#_6-5-elasticsearch-—-全文搜索-demo","children":[]}]},{"level":2,"title":"七、 数据库性能优化深度总结","slug":"七、-数据库性能优化深度总结","link":"#七、-数据库性能优化深度总结","children":[{"level":3,"title":"7.1 优化全景图","slug":"_7-1-优化全景图","link":"#_7-1-优化全景图","children":[]},{"level":3,"title":"7.2 索引优化 — 最有效的优化手段","slug":"_7-2-索引优化-—-最有效的优化手段","link":"#_7-2-索引优化-—-最有效的优化手段","children":[]},{"level":3,"title":"7.3 SQL 查询优化","slug":"_7-3-sql-查询优化","link":"#_7-3-sql-查询优化","children":[]},{"level":3,"title":"7.4 Schema 与表结构优化","slug":"_7-4-schema-与表结构优化","link":"#_7-4-schema-与表结构优化","children":[]},{"level":3,"title":"7.5 连接池与并发优化","slug":"_7-5-连接池与并发优化","link":"#_7-5-连接池与并发优化","children":[]},{"level":3,"title":"7.6 读写分离与分库分表","slug":"_7-6-读写分离与分库分表","link":"#_7-6-读写分离与分库分表","children":[]},{"level":3,"title":"7.7 缓存策略深度解析","slug":"_7-7-缓存策略深度解析","link":"#_7-7-缓存策略深度解析","children":[]},{"level":3,"title":"7.8 监控与慢查询分析","slug":"_7-8-监控与慢查询分析","link":"#_7-8-监控与慢查询分析","children":[]},{"level":3,"title":"7.9 优化检查清单 (Checklist)","slug":"_7-9-优化检查清单-checklist","link":"#_7-9-优化检查清单-checklist","children":[]}]},{"level":2,"title":"八、 新兴趋势与未来","slug":"八、-新兴趋势与未来","link":"#八、-新兴趋势与未来","children":[]},{"level":2,"title":"九、 结论","slug":"九、-结论","link":"#九、-结论","children":[]}],"git":{"createdTime":1777442674000,"updatedTime":1784521648000,"contributors":[{"name":"FanGe","email":"653398363@qq.com","commits":1}]},"readingTime":{"minutes":37.72,"words":11316},"filePathRelative":"backend/database/database-selection.md","localizedDate":"2026年4月29日","excerpt":"","autoDesc":true}');export{d as comp,k as data};
