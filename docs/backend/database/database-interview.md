---
title: 数据库操作与面试常见问题
icon: database
category:
  - 后端
  - 数据库
tag:
  - mysql
  - redis
  - 面试
  - SQL
---

# 数据库操作与面试常见问题

> 本文整理数据库（以 MySQL 为主，Redis 为辅）的常见操作和高频面试题，覆盖 SQL 基础、索引、事务、锁、缓存等核心知识点，便于复习与面试速查。

---

## 一、SQL 基础操作

SQL 按功能分为四类：

| 分类 | 全称 | 作用 | 关键字 |
|------|------|------|--------|
| DDL | Data Definition Language | 定义结构 | `CREATE` `ALTER` `DROP` `TRUNCATE` |
| DML | Data Manipulation Language | 操作数据 | `INSERT` `UPDATE` `DELETE` |
| DQL | Data Query Language | 查询数据 | `SELECT` |
| DCL | Data Control Language | 权限控制 | `GRANT` `REVOKE` `COMMIT` `ROLLBACK` |

### 1.1 库与表操作

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS demo DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_general_ci;

-- 创建表
CREATE TABLE `user` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '用户名',
  `age` TINYINT UNSIGNED NOT NULL DEFAULT 0 COMMENT '年龄',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 修改表结构
ALTER TABLE `user` ADD COLUMN `email` VARCHAR(128) DEFAULT NULL COMMENT '邮箱';
ALTER TABLE `user` MODIFY COLUMN `name` VARCHAR(128) NOT NULL DEFAULT '';
ALTER TABLE `user` DROP COLUMN `email`;

-- 清空表（重置自增，无法回滚）
TRUNCATE TABLE `user`;
```

### 1.2 增删改查

```sql
-- 插入
INSERT INTO `user` (`name`, `age`) VALUES ('alice', 20), ('bob', 25);
-- 插入冲突时更新（upsert）
INSERT INTO `user` (`name`, `age`) VALUES ('alice', 21)
  ON DUPLICATE KEY UPDATE `age` = VALUES(`age`);

-- 更新
UPDATE `user` SET `age` = 22 WHERE `name` = 'alice';

-- 删除
DELETE FROM `user` WHERE `id` = 1;

-- 查询
SELECT `id`, `name`, `age` FROM `user` WHERE `age` >= 20 ORDER BY `age` DESC LIMIT 10;
```

### 1.3 多表连接

```sql
-- 内连接：只取两表匹配的行
SELECT u.`name`, o.`order_no`
FROM `user` u
INNER JOIN `order` o ON u.`id` = o.`user_id`;

-- 左连接：保留左表全部行，右表无匹配为 NULL
SELECT u.`name`, o.`order_no`
FROM `user` u
LEFT JOIN `order` o ON u.`id` = o.`user_id`;

-- 右连接：保留右表全部行
-- 全连接：MySQL 不支持 FULL JOIN，可用 LEFT JOIN UNION RIGHT JOIN 模拟
```

### 1.4 聚合与分组

```sql
-- 分组统计：每个年龄的人数
SELECT `age`, COUNT(*) AS cnt
FROM `user`
GROUP BY `age`
HAVING cnt > 1
ORDER BY cnt DESC;
```

> ⚠️ `WHERE` 用于分组前过滤行，`HAVING` 用于分组后过滤聚合结果。

### 1.5 常用函数与技巧

```sql
-- 时间格式化
SELECT DATE_FORMAT(`created_at`, '%Y-%m-%d') AS day FROM `user`;

-- 字符串拼接
SELECT CONCAT(`name`, '-', `age`) AS info FROM `user`;

-- 条件表达式
SELECT `name`, IF(`age` >= 18, '成年', '未成年') AS stage FROM `user`;
SELECT `name`,
  CASE WHEN `age` < 18 THEN '未成年'
       WHEN `age` < 60 THEN '成年'
       ELSE '老年' END AS stage
FROM `user`;
```

---

## 二、索引相关操作与面试题

### 2.1 索引操作

```sql
-- 创建索引
CREATE INDEX idx_age ON `user`(`age`);
-- 创建联合索引
CREATE INDEX idx_name_age ON `user`(`name`, `age`);
-- 创建唯一索引
CREATE UNIQUE INDEX uk_email ON `user`(`email`);
-- 查看索引
SHOW INDEX FROM `user`;
-- 删除索引
DROP INDEX idx_age ON `user`;
-- 查看执行计划
EXPLAIN SELECT * FROM `user` WHERE `age` = 20;
```

### 2.2 索引面试高频题

**Q1：MySQL 索引底层用什么数据结构？为什么用 B+ 树？**

- InnoDB 索引底层是 **B+ 树**。
- 相比 B 树：非叶子节点只存索引不存数据，单个节点能容纳更多索引，树更矮，磁盘 IO 次数更少；所有数据都在叶子节点且用双向链表相连，范围查询高效。
- 相比红黑树/二叉树：树太高，磁盘 IO 多。
- 相比 Hash：Hash 查询 O(1) 快，但不支持范围查询和排序。

**Q2：聚簇索引和非聚簇索引的区别？**

- **聚簇索引**：叶子节点存的是整行数据。InnoDB 的主键索引就是聚簇索引，一张表只能有一个。
- **非聚簇索引（二级索引）**：叶子节点存的是主键值。查到主键后需再回表查数据（除非走覆盖索引）。
- MyISAM 的索引都是非聚簇索引，叶子节点存数据行的物理地址。

**Q3：什么是回表？什么是覆盖索引？**

- **回表**：通过二级索引查到主键后，再回到聚簇索引查整行数据的过程。
- **覆盖索引**：查询的字段全部被索引覆盖，不需要回表。`EXPLAIN` 中 `Extra` 显示 `Using index`。

**Q4：联合索引的最左前缀原则？**

联合索引 `(a, b, c)` 的 B+ 树按 a → b → c 排序。能命中索引的场景：
- `a` / `a, b` / `a, b, c`
- `a, c`（仅 a 走索引，c 不走，因为中间 b 缺失）
- 范围查询（`>`, `<`, `BETWEEN`, `LIKE 'x%'`）之后的字段不再走索引。

**Q5：索引失效的常见场景？**

1. 对索引列使用函数或运算：`WHERE YEAR(created_at) = 2024`
2. 隐式类型转换：字段是字符串，查询 `WHERE name = 123`
3. `LIKE` 以 `%` 开头：`WHERE name LIKE '%abc'`
4. `OR` 连接的条件中有一个无索引
5. 违反最左前缀原则
6. 优化器认为全表扫描更快（数据量小或区分度低）

**Q6：什么时候不该建索引？**

- 数据量小的表
- 频繁增删改的字段（索引维护成本高）
- 区分度低的字段（如性别，只有男/女）
- `WHERE` 中用不到的字段

---

## 三、事务与隔离级别

### 3.1 事务四大特性（ACID）

| 特性 | 含义 |
|------|------|
| 原子性 Atomicity | 事务中的操作要么全部成功，要么全部失败回滚 |
| 一致性 Consistency | 事务执行前后数据保持一致（如转账总金额不变） |
| 隔离性 Isolation | 并发事务之间互不干扰 |
| 持久性 Durability | 事务提交后对数据的修改是永久的 |

- 原子性由 **undo log** 实现；
- 持久性由 **redo log** 实现；
- 隔离性由 **锁 + MVCC** 实现；
- 一致性是最终目标，由前三者共同保证。

### 3.2 事务操作

```sql
-- 开启事务
START TRANSACTION;  -- 或 BEGIN;
UPDATE account SET balance = balance - 100 WHERE id = 1;
UPDATE account SET balance = balance + 100 WHERE id = 2;
-- 提交
COMMIT;
-- 回滚
ROLLBACK;
-- 设置保存点
SAVEPOINT sp1;
ROLLBACK TO sp1;
```

### 3.3 四种隔离级别与并发问题

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
|----------|:----:|:----------:|:----:|
| 读未提交 Read Uncommitted | ✅ | ✅ | ✅ |
| 读已提交 Read Committed | ❌ | ✅ | ✅ |
| 可重复读 Repeatable Read（MySQL 默认） | ❌ | ❌ | ✅* |
| 串行化 Serializable | ❌ | ❌ | ❌ |

> \* MySQL 的可重复读通过 **MVCC + Next-Key Lock** 在很大程度上解决了幻读。

**三种并发问题：**

- **脏读**：事务 A 读到了事务 B 未提交的修改，B 回滚后 A 读到的是脏数据。
- **不可重复读**：事务 A 两次读同一行，中间事务 B 修改并提交，两次结果不同（针对 **修改**）。
- **幻读**：事务 A 两次范围查询，中间事务 B 新增/删除了符合条件的行，结果集行数变化（针对 **新增/删除**）。

```sql
-- 查看与设置隔离级别
SELECT @@transaction_isolation;
SET SESSION TRANSACTION ISOLATION LEVEL REPEATABLE READ;
```

### 3.4 事务面试高频题

**Q1：MySQL 默认隔离级别是什么？为什么？**

- 默认 **可重复读（RR）**。
- 历史原因：MySQL 早期主从复制基于 SQL 语句 binlog，RR 级别下语句顺序执行能保证主从一致；RC 级别下可能出现主从不一致。如今基于行的 binlog 已无此问题，但默认值保留 RR。
- 相比其他数据库（多为 RC），MySQL 的 RR 配合 MVCC 已解决大部分幻读问题。

**Q2：MVCC 是什么？怎么实现的？**

- MVCC（多版本并发控制）通过保存数据的历史版本，让读不阻塞写、写不阻塞读。
- InnoDB 每行隐含字段：`DB_TRX_ID`（最近修改的事务 ID）、`DB_ROLL_PTR`（指向 undo log 的指针）。
- **ReadView**：事务开启时生成的一个快照，记录当前活跃事务列表。读时根据可见性算法判断哪个版本对当前事务可见。
- RC 级别每次 SELECT 都生成新 ReadView（所以能看到别人已提交的修改）；RR 级别只在第一次 SELECT 时生成 ReadView（所以可重复读）。

**Q3： undo log 和 redo log 的区别？**

| | undo log | redo log |
|---|---|---|
| 作用 | 回滚 + MVCC | 保证持久性、崩溃恢复 |
| 内容 | 修改前的旧数据 | 修改后的新数据 |
| 写入时机 | 修改前先写 undo | 修改时先写 redo（先写日志，再改数据，WAL） |
| 落盘 | 随机 IO | 顺序 IO，性能高 |

---

## 四、锁机制

### 4.1 锁分类

- **按粒度**：表锁、页锁、行锁。InnoDB 默认行锁，开销大但并发高；MyISAM 只有表锁。
- **按性质**：共享锁（S 锁，读锁）、排他锁（X 锁，写锁）。
- **按算法**：记录锁（Record Lock，锁单行）、间隙锁（Gap Lock，锁区间但不锁记录）、临键锁（Next-Key Lock = Record + Gap，锁区间并含记录，解决幻读）。

```sql
-- 共享锁（读锁）
SELECT * FROM `user` WHERE id = 1 LOCK IN SHARE MODE;
-- 排他锁（写锁）
SELECT * FROM `user` WHERE id = 1 FOR UPDATE;
```

### 4.2 锁面试高频题

**Q1：什么是死锁？怎么排查和避免？**

- 死锁：两个或多个事务互相持有对方需要的锁，导致都无法继续。
- 排查：`SHOW ENGINE INNODB STATUS` 查看最近一次死锁信息。
- 避免：事务内按固定顺序访问表和行；大事务拆小；尽量用索引访问数据（避免行锁升级为表锁）；设置合理的锁超时 `innodb_lock_wait_timeout`。

**Q2：`SELECT ... FOR UPDATE` 什么时候锁表，什么时候锁行？**

- 当查询条件**命中索引**时，锁的是符合条件的行（行锁）。
- 当查询条件**未命中索引**时，会扫描全表，每行都加锁，效果等同于锁表。
- 因此 `FOR UPDATE` 务必走索引。

**Q3：乐观锁和悲观锁的区别？**

- **悲观锁**：认为冲突一定发生，先加锁再操作（`FOR UPDATE`）。适合写多读少。
- **乐观锁**：认为冲突很少发生，提交时通过版本号/CAS 检测冲突。适合读多写少。

```sql
-- 乐观锁示例：更新时带版本号校验
UPDATE `user` SET age = 22, version = version + 1
WHERE id = 1 AND version = 5;
-- 受影响行数为 0 说明已被别人修改，需重试
```

---

## 五、Redis 常见操作与面试题

### 5.1 常用数据类型与操作

| 类型 | 典型场景 | 常用命令 |
|------|----------|----------|
| String | 缓存、计数器、分布式锁 | `SET` `GET` `INCR` `SETNX` |
| Hash | 对象存储 | `HSET` `HGET` `HGETALL` |
| List | 消息队列、最新列表 | `LPUSH` `RPOP` `LRANGE` |
| Set | 去重、共同好友 | `SADD` `SINTER` `SUNION` |
| ZSet | 排行榜、延时队列 | `ZADD` `ZRANGE` `ZRANGEBYSCORE` |

```bash
# String
SET name alice EX 60      # 设置并 60 秒过期
GET name
INCR counter              # 原子自增

# Hash
HSET user:1 name alice age 20
HGET user:1 name
HGETALL user:1

# ZSet（排行榜）
ZADD rank 90 alice 85 bob 78 carol
ZREVRANGE rank 0 2 WITHSCORES   # 取前三
```

### 5.2 Redis 面试高频题

**Q1：缓存穿透、缓存击穿、缓存雪崩的区别与解决方案？**

| 问题 | 描述 | 解决方案 |
|------|------|----------|
| 穿透 | 查询根本不存在的数据，缓存和 DB 都没有 | 缓存空值（短过期）；布隆过滤器拦截 |
| 击穿 | 单个热点 key 过期瞬间，大量请求打到 DB | 互斥锁重建缓存；热点 key 永不过期 |
| 雪崩 | 大量 key 同时过期，或 Redis 宕机 | 过期时间加随机值；多级缓存；Redis 集群高可用 |

**Q2：Redis 为什么这么快？**

1. 纯内存操作。
2. 单线程模型（核心命令执行），避免多线程上下文切换和锁竞争。
3. IO 多路复用（epoll）。
4. 高效的数据结构（如 ziplist、skiplist、intset）。

**Q3：Redis 持久化方式 RDB 和 AOF 的区别？**

| | RDB | AOF |
|---|---|---|
| 原理 | 定时把内存数据快照写入磁盘 | 记录每条写命令 |
| 体积 | 小（压缩二进制） | 大（文本命令） |
| 恢复速度 | 快 | 慢 |
| 数据安全 | 可能丢失最近一次快照后的数据 | 丢失少（可配 `always`/`everysec`/`no`） |
| 推荐 | 备份、灾难恢复 | 对数据安全要求高 |

**Q4：如何用 Redis 实现分布式锁？**

基础版：

```bash
SET lock:order:1 <uuid> NX PX 30000   # 加锁并设过期
# 释放锁用 Lua 脚本保证「判断 + 删除」原子性
```

要点：
1. `SET ... NX PX` 保证加锁和设置过期是原子的。
2. value 设为唯一标识（UUID），释放时校验，避免误删别人的锁。
3. 释放锁用 Lua 脚本保证原子性。
4. 过期时间要大于业务执行时间；业务超时可引入「看门狗」自动续期（如 Redisson）。
5. 集群下主从切换可能丢锁，强一致场景可用 Redlock 算法。

**Q5：Redis 6.0 为什么引入多线程？**

- Redis 核心命令执行仍是单线程，保证无锁。
- 多线程只用于**网络 IO 读写**（接收、解析、回写），把最耗时的网络 IO 并行化，提升吞吐。
- 命令执行仍单线程，不破坏原有模型。

---

## 六、综合高频面试题

**Q1：`DELETE`、`TRUNCATE`、`DROP` 的区别？**

| | DELETE | TRUNCATE | DROP |
|---|---|---|---|
| 类型 | DML | DDL | DDL |
| 作用 | 删除行（可带 WHERE） | 清空整表数据 | 删除整张表（含结构） |
| 回滚 | 可回滚 | 不可回滚 | 不可回滚 |
| 自增 | 不重置 | 重置为 1 | 表都没了 |
| 速度 | 慢（逐行记录日志） | 快 | 最快 |

**Q2：`COUNT(*)` / `COUNT(1)` / `COUNT(字段)` 的区别？**

- `COUNT(*)`：统计总行数，InnoDB 优化器会选最小的索引扫描，**不取值**，包含 NULL 行。
- `COUNT(1)`：与 `COUNT(*)` 基本等价，性能相近。
- `COUNT(字段)`：统计该字段非 NULL 的行数，需要取值判断，性能略差。

**Q3：MySQL 主从复制原理？**

1. 主库（Master）执行写操作，将变更记录到 **binlog**。
2. 从库（Slave）的 IO 线程拉取主库 binlog，写入本地 **relay log**（中继日志）。
3. 从库的 SQL 线程读取 relay log，回放执行，实现数据同步。
4. 复制方式：异步复制（默认）、半同步复制、组复制（MGR）。

**Q4：一条 SQL 语句的执行流程？**

`客户端 → 连接器 → 查询缓存（8.0 已移除） → 分析器（词法/语法解析） → 优化器（生成执行计划、选索引） → 执行器（调用存储引擎接口） → 存储引擎（InnoDB，操作数据、记录日志） → 返回结果`

**Q5：分库分表什么时候做？怎么做？**

- 信号：单表数据量过大（千万级以上）、写 QPS 过高、单库连接数瓶颈。
- 垂直拆分：按业务字段拆分（如用户表拆出扩展信息表）。
- 水平拆分：按 hash、范围、时间等把数据分散到多张表/库。
- 关键问题：跨库 JOIN、分布式事务、全局唯一 ID（雪花算法）、分页深翻。
- 中间件：ShardingSphere、MyCat。

**Q6：`EXPLAIN` 中重点看哪些字段？**

- `type`：访问类型，从好到差：`system > const > eq_ref > ref > range > index > ALL`，一般要求达到 `ref`/`range`，避免 `ALL`（全表扫描）。
- `key`：实际使用的索引。
- `rows`：预估扫描行数，越小越好。
- `Extra`：额外信息，`Using index`（覆盖索引）为佳，`Using filesort`（文件排序）、`Using temporary`（临时表）需优化。

---

## 七、小结

数据库面试的核心脉络可以归纳为一条线：

**结构（B+ 树索引） → 并发（事务 + 隔离级别 + MVCC + 锁） → 性能（执行计划 + 优化 + 分库分表） → 高可用（主从复制 + 缓存）**

掌握这条主线，再结合 Redis 缓存层的穿透/击穿/雪崩、分布式锁等场景题，基本能覆盖大部分后端数据库面试考点。
