---
title: 存储引擎与索引
icon: article
category:
  - Database
  - Guide
tag:
  - mysql
  - index
---

# 存储引擎与索引

## InnoDB vs MyISAM

| 特性 | InnoDB（默认） | MyISAM |
| --- | --- | --- |
| 事务 | 支持 | 不支持 |
| 锁粒度 | 行锁 | 表锁 |
| 外键 | 支持 | 不支持 |
| 聚簇索引 | 是（主键即数据） | 否（索引与数据分离） |
| 崩溃恢复 | redo log 保证 | 无 |
| 全文索引 | 5.6+ 支持 | 支持 |
| COUNT(*) 无 WHERE | 扫表 | 直接返回元数据行数（极快） |

> 结论：无特殊理由一律用 InnoDB。读多写少、可容忍丢数据的统计表才考虑 MyISAM。

## 聚簇索引与 B+ 树

### InnoDB 的数据组织方式

InnoDB 表本身就是一棵按主键组织的 **B+ 树**（聚簇索引）：

- **叶子节点 = 完整的行数据**
- 二级索引（普通索引）的叶子节点存的是**主键值**，查到后需回主键树再查一次（**回表**）

```text
聚簇索引（主键 id）          二级索引（name）
    [30]                       ['王五']
   /     \                       |
[10,20]  [40,50]            叶子: id=3 → 回聚簇索引查整行
   |
叶子: (1,'张三',...) (2,'李四',...)
```

### 为什么是 B+ 树而不是别的结构

| 结构 | 问题 |
| --- | --- |
| 哈希表 | 不支持范围查询、排序 |
| 二叉/红黑树 | 树太高，磁盘 IO 次数 = 树高 |
| B 树 | 非叶子节点也存数据，单页放的关键字少，树更高 |
| **B+ 树** | 非叶子只存键（一页 16KB 可放几百个键，3-4 层撑千万级数据）；叶子成链表，范围查询友好 |

> 量级概念：3 层 B+ 树 ≈ 2000 × 2000 × 每页十几行 ≈ **千万级行**，一次主键查询只需 3 次页 IO。

### 主键设计原则

- 一定要有显式主键（否则 InnoDB 用唯一列，再没有就生成隐藏的 `ROW_ID`）
- **推荐趋势递增**（如自增 ID、雪花 ID）：追加写，不分裂页
- 避免 UUID 字符串做主键：随机插入导致页分裂，且空间大
- 避免业务含义字段做主键（以后会变）

## 索引类型

```sql
-- 普通索引
CREATE INDEX idx_name ON employee(name);

-- 唯一索引（含约束语义）
CREATE UNIQUE INDEX uk_phone ON employee(phone);

-- 联合索引（最常用！）
CREATE INDEX idx_dept_salary ON employee(dept_id, salary);

-- 前缀索引（长字符串列，只索引前 N 个字符）
CREATE INDEX idx_email ON employee(email(20));

-- 覆盖索引的查看
SHOW INDEX FROM employee;
```

## 联合索引与最左前缀原则

联合索引 `(a, b, c)` 相当于建了 `(a)`、`(a,b)`、`(a,b,c)` 三个索引，排序结构类似电话簿（先按姓，再按名）。

```sql
-- ✅ 走索引
WHERE a = 1
WHERE a = 1 AND b = 2
WHERE a = 1 AND b = 2 AND c = 3
WHERE a = 1 AND b > 2          -- a 走索引，b 用索引排序过滤（范围列是最后用到的一列）

-- ❌ 不走索引（缺少最左列 a）
WHERE b = 2
WHERE b = 2 AND c = 3
```

### 索引下推（ICP，5.6+）

`WHERE a = 1 AND c = 3 AND b > 0`：存储引擎层先按 `(a, b)` 过滤，再判断 c，减少回表次数。

## 索引失效场景（面试 + 生产高频）

```sql
-- 1. 对索引列使用函数或运算
WHERE YEAR(hire_date) = 2023        -- ❌
WHERE hire_date >= '2023-01-01'
  AND hire_date < '2024-01-01'      -- ✅ 改为范围

-- 2. 隐式类型转换（phone 是 VARCHAR）
WHERE phone = 13800138000           -- ❌ 数字比较，列被 CAST
WHERE phone = '13800138000'         -- ✅

-- 3. 前导模糊
WHERE name LIKE '%三'               -- ❌
WHERE name LIKE '张%'               -- ✅

-- 4. OR 连接了无索引的列
WHERE dept_id = 1 OR age = 30       -- age 无索引则全表扫

-- 5. 负向条件（优化器估算返回比例大时放弃索引）
WHERE status != 1
WHERE col NOT IN (1, 2)

-- 6. 联合索引不满足最左前缀（见上节）
```

> 判断是否走索引不能靠背规则，用 `EXPLAIN` 看执行计划（[性能优化篇](./06-performance-optimization.md)）。

## 覆盖索引

如果查询的列**全部包含在索引中**，无需回表：

```sql
-- 索引 idx_dept_salary(dept_id, salary)
SELECT dept_id, salary FROM employee WHERE dept_id = 1;  -- 覆盖索引，Extra: Using index

SELECT name FROM employee WHERE dept_id = 1;             -- 需要回表取 name
```

高频查询可以刻意设计覆盖索引，这是仅次于「给 WHERE 列加索引」的第二大优化手段。

## 索引的代价与设计规范

索引不是越多越好：

- 每个索引都是一棵 B+ 树，占磁盘空间
- **写放大**：INSERT/UPDATE/DELETE 要维护所有索引
- 优化器选择成本上升

设计规范：

1. 单表索引建议不超过 5-6 个
2. 联合索引把**区分度高的列放前面**（等值条件优先于范围条件列）
3. 频繁更新的列少建索引
4. 区分度太低的列（如性别）单独建索引无意义，但可作为联合索引的一部分
5. `SELECT *` 语义上杜绝，才可能用上覆盖索引

## 一道经典题：为什么推荐自增主键

1. **页写满追加，不分裂**：随机主键（UUID）插入会频繁导致页分裂与碎片
2. **二级索引更小**：叶子存主键值，BIGINT 8 字节 vs UUID 36 字节
3. **主键本身有序**：范围扫描、排序友好

反面：分库分表下自增 ID 会冲突，用雪花算法等分布式 ID（趋势递增，同样友好）。

下一篇：[事务、MVCC 与锁](./05-transaction-mvcc-lock.md)。
