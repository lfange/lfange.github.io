---
title: SQL 进阶查询
icon: article
category:
  - Database
  - Guide
tag:
  - sql
  - advanced
---

# SQL 进阶查询

## 多表连接 JOIN

```sql
-- 内连接：只返回两表都能匹配上的行
SELECT e.name, d.name AS dept
FROM employee e
INNER JOIN department d ON e.dept_id = d.id;

-- 左连接：左表全保留，右表匹配不上的补 NULL
SELECT e.name, d.name AS dept
FROM employee e
LEFT JOIN department d ON e.dept_id = d.id;

-- 右连接：右表全保留
SELECT e.name, d.name
FROM employee e
RIGHT JOIN department d ON e.dept_id = d.id;
```

### 常用 JOIN 模式（面试高频）

```sql
-- 1. 查 A 表中不匹配 B 表的行（如：没有员工的部门）
SELECT d.name
FROM department d
LEFT JOIN employee e ON e.dept_id = d.id
WHERE e.id IS NULL;

-- 2. 查两表的交集之外的行（对称差）
SELECT e.name FROM employee e LEFT JOIN department d ON e.dept_id = d.id WHERE d.id IS NULL
UNION ALL
SELECT d.name FROM department d LEFT JOIN employee e ON e.dept_id = d.id WHERE e.id IS NULL;

-- 3. 自连接：查同一部门工资高于自己的同事（经典）
SELECT a.name, b.name AS higher_colleague
FROM employee a
JOIN employee b ON a.dept_id = b.dept_id AND a.salary < b.salary;
```

### 连接算法

| 算法 | 原理 | 触发条件 |
| --- | --- | --- |
| `NLJ`（Nested Loop Join） | 外层每行去内层全表扫 | 无索引时 |
| `INLJ`（Index NLJ） | 外层每行走内层索引 | 被驱动表关联列有索引（最优） |
| `BNL`（Block Nested Loop） | 把外层装入 join buffer，内层批量比较 | 无索引时的优化 |
| `hash join` | 内表建哈希表 | MySQL 8.0.18+，无等值索引时自动替代 BNL |

> 优化要点：**被驱动表的关联列建索引**，小表做驱动表。

## 子查询

```sql
-- 标量子查询：结果只有一行一列，可出现在任何位置
SELECT name, salary,
  (SELECT AVG(salary) FROM employee) AS company_avg
FROM employee;

-- WHERE 中使用
SELECT name FROM employee
WHERE salary > (SELECT AVG(salary) FROM employee);

-- IN 子查询：工资高于部门内平均的员工（关联子查询）
SELECT name FROM employee e
WHERE salary > (
  SELECT AVG(salary) FROM employee WHERE dept_id = e.dept_id
);

-- EXISTS：存在性判断，通常比 IN 快（大表驱动小表时）
SELECT d.name FROM department d
WHERE EXISTS (SELECT 1 FROM employee e WHERE e.dept_id = d.id AND e.salary > 20000);
```

### IN vs EXISTS

- `IN`：先执行子查询，结果集小好用；子查询表大时开销大
- `EXISTS`：外表逐行探测子查询，子查询表上有索引时快

经验法则：**小表 IN 大表，大表 EXISTS 小表**；MySQL 8.0 优化器多数场景已能自动改写。

### 派生表（FROM 子查询）

```sql
-- 每部门平均工资的排名
SELECT dept_id, avg_salary
FROM (
  SELECT dept_id, AVG(salary) AS avg_salary
  FROM employee GROUP BY dept_id
) t
ORDER BY avg_salary DESC;
```

## 窗口函数（MySQL 8.0+）

窗口函数**不合并行**，对每行在其所在「窗口」内计算，是分析类 SQL 的核心。

语法：`函数() OVER (PARTITION BY ... ORDER BY ...)`

### 排名类

```sql
-- 每个部门内按工资排名
SELECT name, dept_id, salary,
  ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS row_num,
  RANK()       OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rk,
  DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dense_rk
FROM employee;
```

三者区别（同分时）：

| 函数 | 并列处理 | 结果示例（工资 1.5w, 1.5w, 1.2w） |
| --- | --- | --- |
| `ROW_NUMBER()` | 不并列 | 1, 2, 3 |
| `RANK()` | 并列跳号 | 1, 1, 3 |
| `DENSE_RANK()` | 并列不跳号 | 1, 1, 2 |

**经典题：取每组 Top N**（每个部门工资前 2 名）：

```sql
SELECT * FROM (
  SELECT e.*,
    ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rn
  FROM employee e
) t WHERE rn <= 2;
```

### 聚合类与偏移类

```sql
-- 累计求和、移动平均
SELECT name, hire_date, salary,
  SUM(salary) OVER (ORDER BY hire_date) AS running_total,
  AVG(salary) OVER (ORDER BY hire_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS ma3
FROM employee;

-- LAG / LEAD：与上一行/下一行比较（环比、同比）
SELECT name, hire_date, salary,
  LAG(salary, 1)  OVER (ORDER BY hire_date) AS prev_salary,
  salary - LAG(salary, 1) OVER (ORDER BY hire_date) AS diff
FROM employee;
```

## CTE 公用表表达式

```sql
-- 非递归 CTE：让多层嵌套变清晰
WITH dept_avg AS (
  SELECT dept_id, AVG(salary) AS avg_salary
  FROM employee GROUP BY dept_id
)
SELECT e.name, e.salary, d.avg_salary
FROM employee e
JOIN dept_avg d ON e.dept_id = d.dept_id
WHERE e.salary > d.avg_salary;

-- 递归 CTE：查树形结构（如组织架构、菜单）
WITH RECURSIVE sub_tree AS (
  SELECT id, name, manager_id, 1 AS level FROM employee WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id, t.level + 1
  FROM employee e JOIN sub_tree t ON e.manager_id = t.id
)
SELECT * FROM sub_tree;
```

## 集合操作

```sql
-- UNION：去重合并（需列数与类型一致）
SELECT name FROM employee WHERE dept_id = 1
UNION
SELECT name FROM employee WHERE salary > 20000;

-- UNION ALL：不去重，性能更好，确认无重复时优先用
SELECT name FROM employee WHERE dept_id = 1
UNION ALL
SELECT name FROM employee WHERE salary > 20000;
```

## 经典面试题集

### 1. 第 N 高的工资

```sql
-- 去重后降序第 N（写法一：窗口函数）
SELECT DISTINCT salary
FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rk
  FROM employee
) t WHERE rk = 2;

-- 写法二：子查询计数
SELECT MAX(salary) FROM employee
WHERE salary < (SELECT MAX(salary) FROM employee);
```

### 2. 连续登录 3 天的用户（经典）

```sql
-- 思路：日期减去按用户分组的行号，若连续则差值相同
WITH t AS (
  SELECT user_id, login_date,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY login_date) AS rn
  FROM user_login
)
SELECT user_id, MIN(login_date) AS start_date, COUNT(*) AS days
FROM t
GROUP BY user_id, DATE_SUB(login_date, INTERVAL rn DAY)
HAVING COUNT(*) >= 3;
```

### 3. 行转列

```sql
-- 每人每科成绩一行 -> 每人一行、科目为列
SELECT name,
  MAX(CASE WHEN subject = '语文' THEN score END) AS chinese,
  MAX(CASE WHEN subject = '数学' THEN score END) AS math,
  MAX(CASE WHEN subject = '英语' THEN score END) AS english
FROM scores
GROUP BY name;
```

下一篇：[存储引擎与索引](./04-mysql-storage-index.md) —— B+ 树、索引设计与失效场景。
