---
title: 性能优化实战
icon: article
category:
  - Database
  - Guide
tag:
  - mysql
  - performance
---

# 性能优化实战

## EXPLAIN 执行计划

任何 SQL 优化都从 `EXPLAIN` 开始：

```sql
EXPLAIN SELECT e.name, d.name
FROM employee e
JOIN department d ON e.dept_id = d.id
WHERE e.salary > 10000;
```

### 关键列解读

| 列 | 关注点 |
| --- | --- |
| **type** | 访问类型（性能从好到差）：`system > const > eq_ref > ref > range > index > ALL` |
| **key** | 实际使用的索引（NULL = 全表扫） |
| **rows** | 预估扫描行数 |
| **Extra** | 附加信息（见下） |

### type 详解

| type | 含义 | 例子 |
| --- | --- | --- |
| `const` | 主键/唯一索引等值查询 | `WHERE id = 1` |
| `eq_ref` | JOIN 时被驱动表走主键/唯一索引 | `ON e.dept_id = d.id`（d.id 是主键） |
| `ref` | 普通索引等值查询 | `WHERE dept_id = 1`（dept_id 有索引） |
| `range` | 索引范围扫描 | `WHERE id > 100`、`BETWEEN`、`IN` |
| `index` | 扫整棵索引树（比全表扫略好） | 覆盖索引但无过滤条件 |
| `ALL` | **全表扫描，必须优化** | 无索引的 WHERE |

> 及格线：至少 `range`；`ALL` 出现在大表上就是事故。

### Extra 常见值

| 值 | 含义 |
| --- | --- |
| `Using index` | 覆盖索引，好 |
| `Using where` | Server 层过滤 |
| `Using index condition` | 索引下推（ICP） |
| `Using filesort` | 额外排序，数据量大时需优化（排序列加索引） |
| `Using temporary` | 用了临时表（GROUP BY/ DISTINCT 列无索引），需优化 |

## 优化方法论

```text
慢查询定位 → EXPLAIN 分析 → 索引/改写 SQL → 验证
```

### 第一步：找到慢 SQL

```sql
-- 开启慢查询日志
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;   -- 超过 1 秒记录

-- 分析（pt-query-digest 更强大）
mysqldumpslow -s t -t 10 /var/log/mysql/slow.log   -- 按总耗时取 top 10
```

## SQL 层优化清单

### 1. 索引优化

见[索引篇](./04-mysql-storage-index.md)。核心：WHERE / JOIN / ORDER BY 列有索引、避免失效写法、利用覆盖索引。

### 2. 深分页优化

```sql
-- ❌ LIMIT 1000000, 20：扫描并丢弃 100 万行
SELECT * FROM orders ORDER BY id LIMIT 1000000, 20;

-- ✅ 书签/游标方式：记住上一页末尾 id
SELECT * FROM orders WHERE id > 1000020 ORDER BY id LIMIT 20;

-- ✅ 延迟关联：先在索引上定位，再回表
SELECT o.* FROM orders o
JOIN (SELECT id FROM orders ORDER BY id LIMIT 1000000, 20) t ON o.id = t.id;
```

### 3. 只查需要的列

`SELECT *` 拖宽 IO、破坏覆盖索引、增加网络传输。

### 4. JOIN 优化

- 被驱动表关联列建索引
- 小结果集驱动大表（straight_join 可强制顺序，慎用）
- 控制 JOIN 表数量，过多考虑拆分或冗余字段

### 5. 其他高频点

```sql
-- 批量操作分批
DELETE FROM logs WHERE created < '2025-01-01' LIMIT 1000;   -- 循环执行
INSERT INTO ... VALUES (...), (...), (...);                  -- 批量插入

-- UNION ALL 代替 UNION（无需去重时）
-- count(*) 大表统计：允许近似值用 EXPLAIN 的 rows 或统计表
-- 尽量不用 NOT IN（可能全表扫），改 NOT EXISTS
```

## 参数与架构层优化

### 常用 InnoDB 参数

| 参数 | 建议起点 | 说明 |
| --- | --- | --- |
| `innodb_buffer_pool_size` | 物理内存 50%~70% | 最重要的参数，缓存数据页 |
| `innodb_log_file_size` | 1-2G | redo log 大小，影响写吞吐 |
| `max_connections` | 按业务评估 | 配合连接池 |
| `innodb_flush_log_at_trx_commit` | 1（默认，安全）/ 2（快） | 1 每次提交刷盘；2 交 OS，宕机丢 1 秒 |

### 架构层手段（由近及远）

1. **缓存**：热点数据放 Redis，读请求不到 MySQL
2. **读写分离**：主库写、从库读，扩大读能力
3. **分库分表**：单表数据量过大（经验值：单表 1000 万行 / 20GB 考虑拆）
4. **冷热分离/归档**：历史数据搬到归档库或对象存储
5. **换 OLAP 引擎**：复杂分析查询迁移到 ClickHouse / Doris 等

## 优化案例

### 案例：列表页越翻越慢

现象：订单列表 `LIMIT 500000, 20` 耗时 3s。

分析：EXPLAIN 显示 `range` 但 rows=520000，回表后丢弃绝大部分行。

处理：改游标分页（`WHERE id > ?`），或前端限制跳页；报表导出走异步任务 + 延迟关联。

### 案例：COUNT(*) 统计慢

现象：后台仪表盘实时 `COUNT(*)` 全表，3 亿行。

处理：这类统计不要求精确，改为定时任务汇总到统计表 / Redis 计数器；或直接上 OLAP 库。

### 案例：一个隐式转换拖垮全表

现象：`WHERE phone = 13800138000`（phone 为 VARCHAR）全表扫。

处理：改传字符串 `phone = '13800138000'`，走 `idx_phone`。ORM 层统一参数类型。

## 性能压测与验证

```sh
# sysbench 快速压测
sysbench oltp_read_write --db-driver=mysql --mysql-host=127.0.0.1 \
  --mysql-user=root --mysql-password=xxx --tables=10 --table-size=1000000 prepare

sysbench oltp_read_write --db-driver=mysql --mysql-host=127.0.0.1 \
  --mysql-user=root --mysql-password=xxx --tables=10 --table-size=1000000 \
  --threads=32 --time=60 run
```

> 任何优化都要**用数据验证**：优化前后 EXPLAIN 对比、压测 QPS/RT 对比，避免「自我感觉良好」。

下一篇：[高可用与分布式架构](./07-high-availability.md)。
