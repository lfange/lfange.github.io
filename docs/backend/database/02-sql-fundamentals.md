---
title: SQL 基础语法
icon: article
category:
  - Database
  - Guide
tag:
  - sql
  - basics
---

# SQL 基础语法

## 准备示例数据

后续所有示例基于以下两张表：

```sql
CREATE TABLE department (
  id   INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE employee (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  name       VARCHAR(50) NOT NULL,
  age        INT,
  salary     DECIMAL(10, 2),
  dept_id    INT,
  hire_date  DATE,
  FOREIGN KEY (dept_id) REFERENCES department(id)
);

INSERT INTO department (name) VALUES ('技术部'), ('产品部'), ('市场部');

INSERT INTO employee (name, age, salary, dept_id, hire_date) VALUES
  ('张三', 28, 15000.00, 1, '2022-03-15'),
  ('李四', 35, 25000.00, 1, '2019-07-01'),
  ('王五', 26, 12000.00, 2, '2023-01-10'),
  ('赵六', 42, 30000.00, NULL, '2015-11-20'),
  ('孙七', 31, 18000.00, 2, '2021-06-08');
```

## 常用数据类型

### 数值

| 类型 | 大小 | 说明 |
| --- | --- | --- |
| `TINYINT` | 1 字节 | 小整数，`TINYINT(1)` 常当 bool 用 |
| `INT` | 4 字节 | 常规整数 |
| `BIGINT` | 8 字节 | 大整数（雪花 ID、主键推荐） |
| `DECIMAL(M,D)` | 变长 | 精确小数，**金额必用** |
| `FLOAT` / `DOUBLE` | 4/8 字节 | 浮点数，有精度误差，金额禁用 |

```sql
-- 金额用 DECIMAL，FLOAT 会丢精度
DECIMAL(10, 2)  -- 总共 10 位，小数 2 位，最大 99999999.99
```

### 字符串

| 类型 | 说明 |
| --- | --- |
| `CHAR(n)` | 定长，不足补空格，适合定长编码（手机号区号） |
| `VARCHAR(n)` | 变长，按实际长度存储，最常用 |
| `TEXT` | 长文本（65535 字节内用 VARCHAR 即可） |
| `BLOB` | 二进制大对象 |

### 时间

| 类型 | 格式 | 说明 |
| --- | --- | --- |
| `DATE` | `2026-09-09` | 日期 |
| `DATETIME` | `2026-09-09 12:30:00` | 与时区无关，8 字节 |
| `TIMESTAMP` | `2026-09-09 12:30:00` | 存 UTC 时间戳，4 字节，受时区影响，范围到 2038 年 |

> 经验：业务时间用 `DATETIME`；需要时区自动转换用 `TIMESTAMP`。

## DDL：定义结构

```sql
-- 建库
CREATE DATABASE IF NOT EXISTS demo DEFAULT CHARSET utf8mb4 COLLATE utf8mb4_general_ci;

-- 建表
CREATE TABLE t_user (
  id       BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  age      INT DEFAULT 0 COMMENT '年龄',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB CHARSET = utf8mb4 COMMENT '用户表';

-- 加列 / 改列 / 删列
ALTER TABLE t_user ADD COLUMN email VARCHAR(100);
ALTER TABLE t_user MODIFY COLUMN age TINYINT;
ALTER TABLE t_user CHANGE COLUMN age user_age TINYINT;  -- 可同时改名
ALTER TABLE t_user DROP COLUMN email;

-- 删表 vs 清空
DROP TABLE t_user;       -- 删除表结构和数据，不可回滚（DDL 隐式提交）
TRUNCATE TABLE t_user;   -- 清空数据保留结构，速度快，重置自增值，不可回滚
DELETE FROM t_user;      -- 逐行删除，可回滚，不重置自增，可加 WHERE
```

## DML：增删改

```sql
-- 插入
INSERT INTO employee (name, age, dept_id) VALUES ('周八', 24, 1);

-- 批量插入（推荐，减少网络往返）
INSERT INTO employee (name, age, dept_id) VALUES
  ('吴九', 29, 3),
  ('郑十', 33, 3);

-- 插入冲突时更新（UPSERT）
INSERT INTO employee (id, name, salary) VALUES (1, '张三', 16000)
ON DUPLICATE KEY UPDATE salary = 16000;

-- 更新（一定要带 WHERE！）
UPDATE employee SET salary = salary * 1.1 WHERE dept_id = 1;

-- 删除
DELETE FROM employee WHERE id = 10;
```

::: warning
`UPDATE` / `DELETE` 不带 `WHERE` 会操作全表。执行前先用同条件 `SELECT` 确认影响范围。
:::

## DQL：查询

### 基础查询

```sql
SELECT * FROM employee;                          -- 生产禁用 SELECT *
SELECT name, salary FROM employee;
SELECT DISTINCT dept_id FROM employee;           -- 去重
SELECT name, salary * 12 AS annual_salary
FROM employee;                                   -- 表达式与别名
```

### 条件查询

```sql
SELECT * FROM employee
WHERE dept_id = 1 AND age > 26;

-- 常用运算符
-- = <> > >= < <=
-- BETWEEN ... AND ...          范围（闭区间）
-- IN (1, 2, 3)                 集合
-- LIKE '张%'                   模糊匹配：%
-- IS NULL / IS NOT NULL        NULL 判断（不能写 = NULL）
SELECT * FROM employee WHERE hire_date BETWEEN '2020-01-01' AND '2023-12-31';
SELECT * FROM employee WHERE dept_id IN (1, 2);
SELECT * FROM employee WHERE dept_id IS NULL;
```

::: warning
`NULL` 与任何值比较结果都是 `NULL`（非真即假），`WHERE col != 1` **不会**返回 `col` 为 `NULL` 的行。
:::

### 排序与分页

```sql
SELECT * FROM employee ORDER BY salary DESC, age ASC;   -- 多字段排序
SELECT * FROM employee ORDER BY salary DESC LIMIT 10;   -- 前 10
SELECT * FROM employee ORDER BY salary DESC LIMIT 20, 10; -- 跳过 20 条取 10 条（第 3 页）

-- 深分页优化写法（页码大时先定位 id）
SELECT * FROM employee
WHERE id > (SELECT id FROM employee ORDER BY id LIMIT 100000, 1)
ORDER BY id LIMIT 10;
```

### 聚合函数与分组

```sql
SELECT COUNT(*) FROM employee;                    -- 总行数
SELECT AVG(salary), MAX(salary), MIN(salary), SUM(salary)
FROM employee;

-- GROUP BY + HAVING
SELECT dept_id, COUNT(*) AS headcount, AVG(salary) AS avg_salary
FROM employee
GROUP BY dept_id
HAVING AVG(salary) > 10000          -- HAVING 过滤分组后的结果，WHERE 过滤行
ORDER BY avg_salary DESC;

-- 统计所有部门数（含没有员工的）
SELECT d.name, COUNT(e.id) AS headcount
FROM department d
LEFT JOIN employee e ON e.dept_id = d.id   -- 用 COUNT(e.id) 而非 COUNT(*)，不统计 NULL
GROUP BY d.id;
```

**SQL 执行顺序**（面试高频）：

```text
FROM → ON → JOIN → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT
```

这也是为什么 `WHERE` 里不能用 `SELECT` 定义的别名，而 `ORDER BY` 可以。

## DCL：权限控制

```sql
-- 创建用户
CREATE USER 'app'@'%' IDENTIFIED BY 'password';

-- 授权（生产原则：最小权限）
GRANT SELECT, INSERT, UPDATE ON demo.* TO 'app'@'%';

-- 查看与回收
SHOW GRANTS FOR 'app'@'%';
REVOKE INSERT ON demo.* FROM 'app'@'%';
```

## 练习

1. 查询市场部（id=3）工资最高的员工姓名和工资
2. 统计每个部门的人数和平均工资，只显示人数 >= 2 的部门
3. 把 2023 年之前入职且无部门的员工，分配到技术部

```sql
-- 参考答案
-- 1
SELECT name, salary FROM employee WHERE dept_id = 3 ORDER BY salary DESC LIMIT 1;

-- 2
SELECT dept_id, COUNT(*) AS cnt, AVG(salary) AS avg_salary
FROM employee GROUP BY dept_id HAVING COUNT(*) >= 2;

-- 3
UPDATE employee SET dept_id = 1
WHERE hire_date < '2023-01-01' AND dept_id IS NULL;
```

下一篇：[SQL 进阶查询](./03-sql-advanced.md) —— 多表 JOIN、子查询、窗口函数。
