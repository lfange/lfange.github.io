---
title: 运维与生产实践
icon: article
category:
  - Database
  - Guide
tag:
  - mysql
  - ops
---

# 运维与生产实践

## 备份与恢复

备份是数据库最后一道防线。策略遵循 **3-2-1 原则**：至少 3 份数据、2 种介质、1 份异地。

### 逻辑备份 vs 物理备份

| 方式 | 工具 | 优点 | 缺点 |
| --- | --- | --- | --- |
| 逻辑备份 | `mysqldump`、`mydumper` | 通用、可跨版本、可单表恢复 | 大库慢（GB 级可用，TB 级不行） |
| 物理备份 | XtraBackup、快照 | 速度快、支持增量 | 需要同版本恢复 |

### mysqldump 实战

```sh
# 全量备份（InnoDB 一致性快照，不锁表）
mysqldump -u root -p --single-transaction --triggers --routines \
  --master-data=2 dbname > dbname_$(date +%F).sql

# 恢复
mysql -u root -p dbname < dbname_2026-09-09.sql

# 单库 / 单表
mysqldump dbname table_name > table.sql
```

- `--single-transaction`：InnoDB 用一致性快照，不锁表
- `--master-data=2`：记录 binlog 位点（CHANGE MASTER 注释），用于搭从库

### XtraBackup（大库）

```sh
xtrabackup --backup --target-dir=/data/backup/full -u root -p xxx
xtrabackup --prepare --target-dir=/data/backup/full
# 增量
xtrabackup --backup --target-dir=/data/backup/inc1 \
  --incremental-basedir=/data/backup/full
```

### 延迟从库：误删的后悔药

```sql
-- 从库延迟 1 小时，主库误删（DROP/误 UPDATE）后，
-- 在延迟窗口内到延迟从库停住复制、导出数据
CHANGE MASTER TO MASTER_DELAY = 3600;
```

### binlog 精确恢复

```sh
# 误操作前后位点已知的场景，重放这段 binlog
mysqlbinlog --start-position=1234 --stop-position=5678 mysql-bin.000123 \
  | mysql -u root -p
```

> 配合定时备份 + binlog 保留 ≥ 7 天，可恢复到**任意时间点**（PITR, Point-In-Time Recovery）。

## 监控要点

| 指标 | 告警参考 | 说明 |
| --- | --- | --- |
| 连接数 `Threads_connected` | > 80% max_connections | 连接泄漏或容量不足 |
| 慢查询数 | 每分钟 > N 条 | 回归 or 突发流量 |
| 主从延迟 `Seconds_Behind_Master` | > 5s | 影响读写分离正确性 |
| 缓冲池命中率 `Innodb_buffer_pool_read%` | < 99% | 内存不足 |
| QPS / TPS | 突增/突降 | 流量异常 |
| 磁盘空间与 binlog 占用 | > 80% | 写满 = 数据库只读 |

```sql
-- 快速体检
SHOW GLOBAL STATUS LIKE 'Threads%';
SHOW GLOBAL STATUS LIKE 'Innodb_buffer_pool_read%';
SHOW SLAVE STATUS\G          -- 8.0.22+ 用 SHOW REPLICA STATUS
```

生产建议接 Prometheus + mysqld_exporter + Grafana（或云厂商监控）。

## 用户与权限规范

```sql
-- 最小权限：应用账号只给目标库的 DML，不给 DDL/超级权限
CREATE USER 'shop_app'@'10.0.%' IDENTIFIED BY '强密码';
GRANT SELECT, INSERT, UPDATE, DELETE ON shop.* TO 'shop_app'@'10.0.%';

-- 迁移/DDL 走独立账号，用完回收
-- 密码策略与轮换：caching_sha2_password（8.0 默认）
```

## 线上 DDL 变更规范

大表 DDL 是经典事故源（MDL 锁互斥可拖垮整库）：

1. **优先用 Online DDL**（8.0 大部分操作 INPLACE，加列秒级）
2. 大表/敏感表用 **gh-ost / pt-online-schema-change**（影子表 + binlog 回放，可限流可暂停）
3. 低峰期执行；执行前确认无长事务、长查询：

```sql
SELECT * FROM information_schema.innodb_trx;
SHOW PROCESSLIST;
```

4. 变更走工单/审核流程（Archery、Yearning 等 SQL 审核平台）

## 安全清单

- 禁止 root 远程登录、禁止 `skip-grant-tables` 上生产
- 不存明文密码（应用侧加密，密钥独立管理）
- SQL 注入防护：**永远参数化查询**，不用字符串拼接

```go
// ✅ 参数化
db.Query("SELECT * FROM user WHERE id = ?", id)
// ❌ 拼接
db.Query("SELECT * FROM user WHERE id = " + id)
```

- 敏感数据（手机号、身份证）脱敏存储或加密列
- 定期审计：`general_log` 临时排查用，常开会拖性能

## 连接池配置

```text
max_connections 默认 151 太小；常见设 1000~3000
应用侧连接池（以 Go 的配置为例）：
  MaxOpenConns: 50~100     # 别把数据库连接打满
  MaxIdleConns: 10~20
  ConnMaxLifetime: 30min   # 防止内存脏数据/优雅配合 LB 摘除
```

## 生产事故排查思路

```text
1. 现象收集：QPS/RT 曲线、错误信息、最近变更（发布/DDL/配置）
2. 现状止血：kill 慢查询、降级读从库、限流、必要时重启应用
   SELECT Id FROM information_schema.processlist
     WHERE Command='Query' AND Time > 10;
   -- KILL <id>
3. 根因定位：慢日志 + EXPLAIN + 锁等待 + 监控关联
4. 复盘沉淀：加监控告警、加审核流程、补预案演练
```

## SQL 上线规范（团队约定模板）

```text
1. 所有查询必须走索引（EXPLAIN type >= range）
2. 禁止 SELECT * / 不带 WHERE 的 UPDATE、DELETE
3. 单条 INSERT 批量 ≤ 500 行
4. 大表 DDL 走 gh-ost，低峰执行
5. 金额用 DECIMAL，禁 FLOAT
6. 表必备：id 主键、created_at、updated_at、utf8mb4
7. 事务内不做 RPC/耗时操作
8. 上线前 SQL 过审核平台
```

## 系列总结

| 篇目 | 核心掌握 |
| --- | --- |
| [基础概念](./01-db-basics.md) | 关系模型、三范式、分类选型 |
| [SQL 基础](./02-sql-fundamentals.md) | 类型、DDL/DML/DQL、执行顺序 |
| [SQL 进阶](./03-sql-advanced.md) | JOIN、窗口函数、CTE、经典题 |
| [索引](./04-mysql-storage-index.md) | B+ 树、最左前缀、失效场景 |
| [事务与锁](./05-transaction-mvcc-lock.md) | ACID、MVCC、Next-Key Lock |
| [性能优化](./06-performance-optimization.md) | EXPLAIN、慢查询、参数调优 |
| [高可用](./07-high-availability.md) | 主从、分库分表、分布式事务 |
| 运维实践（本篇） | 备份恢复、监控、变更规范 |

延伸阅读：[MySQL 安装](./mysql.md) · [Redis 笔记](./redis.md) · [数据库选型](./database-selection.md) · [数据库面试题](./database-interview.md)
