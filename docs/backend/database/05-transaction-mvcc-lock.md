---
title: 事务、MVCC 与锁
icon: article
category:
  - Database
  - Guide
tag:
  - mysql
  - transaction
  - lock
---

# 事务、MVCC 与锁

## 事务的 ACID

| 特性 | 含义 | 实现手段 |
| --- | --- | --- |
| **A**tomicity 原子性 | 全部成功或全部回滚 | undo log（回滚日志） |
| **C**onsistency 一致性 | 从一个合法状态到另一个合法状态 | A + I + D 共同保证 |
| **I**solation 隔离性 | 事务之间互不干扰 | MVCC + 锁 |
| **D**urability 持久性 | 提交即落盘，宕机不丢 | redo log（WAL） |

```sql
BEGIN;
UPDATE account SET balance = balance - 100 WHERE id = 1;
UPDATE account SET balance = balance + 100 WHERE id = 2;
COMMIT;   -- 或 ROLLBACK;
```

### redo log / undo log / binlog

| 日志 | 层级 | 作用 |
| --- | --- | --- |
| redo log | InnoDB | 崩溃恢复保证持久性（物理日志：某页某偏移改了什么） |
| undo log | InnoDB | 回滚 + MVCC（逻辑日志：反向操作） |
| binlog | Server 层 | 主从复制、数据恢复（逻辑日志：语句/行变更） |

**两阶段提交**保证 redo log 与 binlog 一致：

```text
1. 写 redo log（prepare 状态）
2. 写 binlog
3. 写 redo log（commit 状态）
```

## 并发事务的问题

| 问题 | 描述 |
| --- | --- |
| 脏读 | 读到别的事务**未提交**的数据 |
| 不可重复读 | 同一事务内两次读同一行，值不同（别人 UPDATE 了） |
| 幻读 | 同一事务内两次范围查询，行数不同（别人 INSERT 了） |

## 四种隔离级别

| 隔离级别 | 脏读 | 不可重复读 | 幻读 |
| --- | --- | --- | --- |
| READ UNCOMMITTED 读未提交 | ✅ 会 | ✅ 会 | ✅ 会 |
| READ COMMITTED 读已提交 | ❌ | ✅ 会 | ✅ 会 |
| **REPEATABLE READ 可重复读（MySQL 默认）** | ❌ | ❌ | ⚠️ 基本解决* |
| SERIALIZABLE 串行化 | ❌ | ❌ | ❌（性能差） |

> *InnoDB 的 RR 通过 **MVCC 解决快照读幻读**、**间隙锁解决当前读幻读**，但两者混用时仍可能出现幻读，这是面试常考点。

```sql
-- 查看/设置（尽量少改，用默认 RR）
SELECT @@transaction_isolation;
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;
```

## MVCC 多版本并发控制

核心思想：**读不加锁，读写不冲突**。每行数据保留多个版本，事务按规则读取自己可见的版本。

### 三个组成部分

1. **隐藏列**：每行有 `trx_id`（最近修改它的事务 ID）和 `roll_pointer`（指向 undo log 中的旧版本，构成版本链）
2. **Read View**：事务快照，记录生成时刻的活跃（未提交）事务集合
3. **版本链**：undo log 串成的历史版本

### 可见性判断（简化）

对版本链上的每个版本，比较其 `trx_id` 与 Read View：

- `trx_id` 是自己改的 → 可见
- `trx_id` 小于最小活跃事务 ID（已提交）→ 可见
- `trx_id` 在活跃集合中（还没提交）→ 不可见，沿 `roll_pointer` 找上一版本

### RC 与 RR 的本质区别

- **RC**：**每条 SELECT** 都生成新的 Read View → 能看到别人最新提交（不可重复读）
- **RR**：**第一次 SELECT** 时生成 Read View，整个事务复用 → 可重复读

### 快照读 vs 当前读

| 类型 | 语句 | 读取内容 |
| --- | --- | --- |
| 快照读 | 普通 `SELECT` | MVCC 版本链 |
| 当前读 | `SELECT ... FOR UPDATE` / `FOR SHARE`、`UPDATE`、`DELETE`、`INSERT` | 最新数据并加锁 |

## 锁

### 锁的粒度

- **全局锁**：`FLUSH TABLES WITH READ LOCK`，全库只读，用于逻辑备份（InnoDB 下推荐 `mysqldump --single-transaction`）
- **表级锁**：`LOCK TABLES ... READ/WRITE`；DDL 引发的 **MDL 元数据锁**（增删改查自动加 MDL 读锁，改表结构需 MDL 写锁——线上大表 DDL 被一个慢查询卡住的经典事故来源）
- **行级锁**：InnoDB 实现，锁的是**索引记录**

### 行锁的三种形式

| 锁 | 锁定范围 | 场景 |
| --- | --- | --- |
| Record Lock 记录锁 | 单条索引记录 | `WHERE id = 1` |
| Gap Lock 间隙锁 | 索引记录之间的间隙 | RR 级别防幻读插入 |
| Next-Key Lock | 记录锁 + 间隙锁（左开右闭） | RR 下的默认行锁 |

```sql
-- id 有 1, 5, 10 三条记录
-- Next-Key Lock 锁 (5, 10]，Gap Lock 锁 (5, 10)
SELECT * FROM t WHERE id = 10 FOR UPDATE;   -- 锁 (5, 10]，别人不能插 id=6/7/8
```

### 锁的兼容性（行锁模式）

| 已持有 \ 请求 | S 锁（共享/读） | X 锁（排他/写） |
| --- | --- | --- |
| S 锁 | 兼容 | 冲突 |
| X 锁 | 冲突 | 冲突 |

### 重要规则：行锁锁的是索引

```sql
-- name 列没有索引时：
SELECT * FROM employee WHERE name = '张三' FOR UPDATE;
-- ⚠️ 锁无法落在索引上 → 退化为锁全表（扫过的每条记录都加锁）！
```

### 死锁

```text
事务 A：锁 id=1，等 id=2
事务 B：锁 id=2，等 id=1   → 互相等待
```

InnoDB 死锁检测（`innodb_deadlock_detect=ON`）会回滚代价小的事务。规避手段：

- 多行操作**按固定顺序**（如按主键排序后再加锁）
- 事务尽量短，避免在事务里做 RPC 等耗时操作
- 同一行热点更新考虑拆分（账户拆子账户）或队列化

```sql
-- 排查锁
SHOW ENGINE INNODB STATUS\G   -- LATEST DETECTED DEADLOCK 段
SELECT * FROM performance_schema.data_locks;
```

## 两大经典问题

### 1. 丢失更新

两个事务都读-改-写同一行，后者覆盖前者。解决：

```sql
-- 悲观：读时就锁住
SELECT balance FROM account WHERE id = 1 FOR UPDATE;
UPDATE account SET balance = balance - 100 WHERE id = 1;

-- 乐观：CAS 思路，影响行数为 0 说明被并发修改，重试
UPDATE account SET balance = balance - 100, version = version + 1
WHERE id = 1 AND version = 5;
```

### 2. 长事务危害

- undo log 无法清理，版本链膨胀，查询沿链回溯变慢
- 占用锁和连接，拖垮连接池

```sql
-- 查长事务
SELECT * FROM information_schema.innodb_trx
WHERE TIME_TO_SEC(TIMEDIFF(NOW(), trx_started)) > 60;
```

下一篇：[性能优化实战](./06-performance-optimization.md)。
