---
icon: back-stage
title: GORM 深度指南
category:
  - 后端
tag:
  - Golang
  - GORM
  - ORM
---

# GORM 深度指南

GORM 是 Go 生态最主流的 ORM（Object-Relational Mapping）：用 struct 表达表结构、用方法链表达 SQL，同时保留逃逸到原生 SQL 的出口。本篇按「连接 → 模型 → CRUD → 关联 → 事务 → Hook → 性能与坑」的顺序讲透，配合[项目架构篇](./project-layout.md)的分层模板食用。

> 版本约定：GORM v2（`gorm.io/gorm`），注意与老 GOPATH 时代的 jinzhu/gorm（v1）是**两套不兼容的模块**。

---

## 一、连接与初始化

### 1.1 连接 MySQL

```go
import (
  "gorm.io/driver/mysql"
  "gorm.io/gorm"
  "gorm.io/gorm/logger"
)

func NewDB(dsn string) (*gorm.DB, error) {
  return gorm.Open(mysql.Open(dsn), &gorm.Config{
    Logger: logger.Default.LogMode(logger.Warn), // Silent/Error/Warn/Info
    // 生产建议 Warn；开发期 Info 可打印生成的 SQL
  })
}
```

DSN 格式：`user:pass@tcp(127.0.0.1:3306)/dbname?charset=utf8mb4&parseTime=True&loc=Local`

- `parseTime=True`：**必加**，否则 TIME/DATE 列扫不进 `time.Time`
- `charset=utf8mb4`：emoji 与中文的保障
- `loc=Local`：时间戳按本地时区解析

PostgreSQL 用 `gorm.io/driver/postgres`，SQLite 用 `glebarez/sqlite`（纯 Go，免 CGO），DSN 各有格式，其余用法完全一致。

### 1.2 连接池配置（生产必做）

`gorm.Open` 返回的 `*gorm.DB` 内部持有 `*sql.DB`，池参数要显式设置：

```go
sqlDB, err := db.DB() // 取出底层 *sql.DB
if err != nil {
  return nil, err
}
sqlDB.SetMaxIdleConns(10)                 // 空闲连接数（过小 → 频繁建连抖动）
sqlDB.SetMaxOpenConns(100)                // 最大连接数（对照 MySQL max_connections）
sqlDB.SetConnMaxLifetime(time.Hour)       // 连接最长存活（短于 DB 侧 wait_timeout）
sqlDB.SetConnMaxIdleTime(10 * time.Minute)
```

::: tip 为什么 ConnMaxLifetime 很重要
MySQL 默认 `wait_timeout=8h` 会悄悄杀掉空闲连接，而连接池不知道，下次复用时拿到「尸体」报 `invalid connection`。把 lifetime 设成明显小于 wait_timeout 的值（如 1h）可彻底规避。
:::

---

## 二、模型定义

### 2.1 约定优于配置

GORM 的默认约定：

| Go 侧 | 表（复数蛇形） | 
| ---- | ---- |
| `type User struct` | 表名 `users` |
| 字段 `CreatedAt time.Time` | 自动维护的创建时间 |
| 字段 `UpdatedAt time.Time` | 自动维护的更新时间 |
| 字段 `ID uint` | 主键 `id`（自增） |
| 字段 `DeletedAt gorm.DeletedAt` | **软删除**支持 |

### 2.2 完整模型示例

```go
type User struct {
  ID        uint           `gorm:"primaryKey"`
  Name      string         `gorm:"size:64;not null;index"`
  Email     string         `gorm:"size:128;uniqueIndex"`
  Age       int            `gorm:"default:18"`
  MemberNum sql.NullString `gorm:"size:32"`  // 可空列用 sql.Null* 或指针
  Birthday  *time.Time                         // 指针 = 可空
  CreatedAt time.Time
  UpdatedAt time.Time
  DeletedAt gorm.DeletedAt `gorm:"index"`  // 软删除标记（见第六节）
}

// 覆盖默认表名
func (User) TableName() string { return "t_user" }
```

常用 tag 速查：

| tag | 作用 |
| ---- | ---- |
| `column:xxx` | 指定列名 |
| `size:64` | varchar 长度 |
| `not null` / `unique` / `index` / `uniqueIndex` | 约束与索引 |
| `default:18` | 默认值 |
| `->` | 只读（只 SELECT 不写入） |
| `-` | 忽略该字段 |
| `embedded` | 内嵌结构体打平到同一张表 |
| `serializer:json` | 字段自动 JSON 序列化存 TEXT |

### 2.3 自动迁移

```go
// 开发期：按 struct 自动建表/加列（只加不减，删列删索引需手动）
db.AutoMigrate(&User{}, &Order{})
```

**生产环境不要用 AutoMigrate 做变更管理**——它不可回滚、无审查记录。生产用版本化迁移工具（golang-migrate、goose、atlas），把 SQL 变更纳入 code review。

---

## 三、CRUD

### 3.1 Create

```go
user := User{Name: "lfange", Age: 18}

// 单条
db.Create(&user)                    // user.ID 回填自增主键
// INSERT INTO users (name, age, ...) VALUES ('lfange', 18, ...)

// 批量（一条 INSERT 多组 VALUES，高效）
users := []User{{Name: "a"}, {Name: "b"}, {Name: "c"}}
db.CreateInBatches(users, 100)      // 每批 100 条，防超大 SQL

// 指定列插入（防止零值覆盖默认值）
db.Select("Name").Create(&user)     // 只写 name 列
// INSERT INTO users (name) VALUES ('lfange')

// Upsert（冲突时更新指定列，MySQL ON DUPLICATE KEY UPDATE）
db.Clauses(clause.OnConflict{
  Columns:   []clause.Column{{Name: "email"}},
  DoUpdates: clause.AssignmentColumns([]string{"name", "age"}),
}).Create(&user)
```

::: warning Create 与零值
`Age` 为 0 时 GORM **会写入 0**（Create 是全字段 INSERT）。若想用列默认值：用 `Select` 排除该列、把字段改成指针类型、或用 `default` tag 时传 `*int`。
:::

### 3.2 Read：查询链与三个「取一条」

```go
var user User

// 取一条：找不到时返回 ErrRecordNotFound（这是 GORM 唯一常见的 sentinel error）
db.First(&user, 1)                    // 按主键升序第一条
db.Take(&user)                        // 不排序取一条
db.Last(&user)                        // 按主键降序第一条

// 必须处理 ErrRecordNotFound —— 它不是 bug 而是常规业务分支
err := db.First(&user, "email = ?", "a@b.com").Error
if errors.Is(err, gorm.ErrRecordNotFound) {
    // 用户不存在：正常分支
}

// 条件查询
db.Where("age > ?", 18).Where("name LIKE ?", "%fan%").Find(&users)
// 永远用 ? 占位符传参 —— GORM 不会帮你转义拼接字符串，SQL 注入自己负责

// struct / map 条件（注意差异）
db.Where(&User{Name: "fan", Age: 0}).Find(&users) // struct：零值字段被忽略！只查 name
db.Where(map[string]any{"name": "fan", "age": 0}).Find(&users) // map：零值也作为条件
```

**查询链方法**（可自由组合）：

```go
db.Select("name, age").              // 选择列
  Where("age BETWEEN ? AND ?", 18, 30).
  Where(User{Name: "fan"}).          // AND 组合
  Or("status = ?", "vip").
  Order("created_at DESC").
  Limit(10).
  Offset(20).                        // 分页 offset = (page-1)*size
  Find(&users)

// 数量
var total int64
db.Model(&User{}).Where("age > ?", 18).Count(&total)

// 分组聚合 —— Scan 扫到自定义 struct
type Result struct {
  Status string
  Total  int
}
var results []Result
db.Model(&User{}).
  Select("status, COUNT(*) as total").
  Group("status").
  Having("COUNT(*) > ?", 10).
  Scan(&results)
```

### 3.3 Update：三兄弟与零值陷阱 ⭐

```go
// ① Save：全字段保存（包括零值），通常用于已 First 出来的对象
db.First(&user, 1)
user.Name = "new"
db.Save(&user)                       // UPDATE users SET name='new', age=18, ... WHERE id=1

// ② Update：更新单列
db.Model(&user).Update("name", "new")
db.Model(&User{}).Where("age = ?", 18).Update("status", "vip") // 带条件批量

// ③ Updates：更新多列
// struct 版：零值字段被忽略（只想改 name，age=0 不会被更新成 0）—— 常用
db.Model(&user).Updates(User{Name: "new", Age: 0})   // 只 SET name
// map 版：零值也更新 —— 需要把字段置 0/null 时用它
db.Model(&user).Updates(map[string]any{"name": "new", "age": 0}) // SET name AND age=0
```

**「想更新为零值」的三种姿势**：map 版 Updates / 指针字段 / `Select("Age").Updates(...)` 显式指定列。这是 GORM 面试与实战的第一坑。

### 3.4 Delete 与软删除

```go
db.Delete(&user)                     // WHERE id = 1
db.Where("age < ?", 18).Delete(&User{}) // 批量删除（需 Where，防止全表误删）

// 永久删除（绕过软删除）
db.Unscoped().Where("age < ?", 18).Delete(&User{})
```

模型带 `DeletedAt gorm.DeletedAt` 字段时自动启用软删除：

- `Delete` 实际执行 `UPDATE users SET deleted_at = now() WHERE id = 1`
- 所有查询自动追加 `WHERE deleted_at IS NULL`
- 唯一索引与软删除冲突（已删记录占着 unique 键）→ 索引改成 `(email, deleted_at)` 联合，或 deleted_at 存 ID 方案

---

## 四、关联：GORM 的重头戏

### 4.1 四种关系

```go
type User struct {
  ID       uint
  Name     string
  CompanyID uint                    // ① Belongs To：外键在「我」这
  Company  Company
  CreditCard CreditCard             // ② Has One：外键在对方（credit_cards.user_id）
  Orders   []Order                  // ③ Has Many：orders.user_id
  Languages []Language `gorm:"many2many:user_languages;"` // ④ 多对多
}
```

### 4.2 Preload 预加载：解决 N+1 ⭐

N+1 问题：查 100 个用户再逐个查订单 = 101 条 SQL。`Preload` 用两条 SQL 解决：

```go
// 反面：循环里查询（101 次 DB 往返）
for _, u := range users {
  db.Model(&u).Association("Orders").Find(&u.Orders)
}

// 正面：预加载（2 条 SQL）
var users []User
db.Preload("Orders").Find(&users)
// SELECT * FROM users;
// SELECT * FROM orders WHERE user_id IN (1,2,3,...);   ← 一次 IN 拿全

// 嵌套预加载 + 带条件
db.Preload("Orders", "status = ?", "paid").
  Preload("Orders.Items").          // 订单再带商品
  Preload("Company").
  Find(&users)

// Joins 预加载：单条 JOIN SQL（适合 Belongs To / Has One 取单条）
db.Joins("Company").First(&user, 1)
```

| 方式 | SQL 条数 | 适用 |
| ---- | ---- | ---- |
| `Preload` | 2（IN 子查询） | 通用，包括 Has Many / 多对多 |
| `Joins` | 1（JOIN） | 取一条时的 Belongs To / Has One，最快 |
| 循环查询 | 1+N | **永远禁止** |

### 4.3 关联操作

```go
// 替换关联（全删再加）
db.Model(&user).Association("Languages").Replace([]Language{goLang, enLang})

// 追加 / 删除 / 清空 / 计数
db.Model(&user).Association("Orders").Append(&newOrder)
db.Model(&user).Association("Orders").Delete(&order) // 删的是关联（中间表），不是订单本身
db.Model(&user).Association("Orders").Clear()
db.Model(&user).Association("Orders").Count()
```

### 4.4 级联创建与外键约束

```go
// Create 默认 Upsert 关联（用户连着订单一起插入，订单回填 user_id）
db.Create(&User{Name: "fan", Orders: []Order{{Amount: 100}}})

// Session 控制：FullSaveAssociations 改为全量更新关联
db.Session(&gorm.Session{FullSaveAssociations: true}).Save(&user)

// 物理外键（默认不建；需要时）
// 字段加 `gorm:"constraint:OnDelete:CASCADE"` + migrater 会建约束
```

**工程建议**：互联网业务普遍**不建物理外键**（锁竞争与迁移成本），一致性放业务层/Service 层保证——GORM 默认不建外键正合此意。

---

## 五、事务

### 5.1 自动事务与禁用

GORM v2 默认把**每次写操作**（Create/Update/Delete）包在事务里。写密集场景可全局关闭换性能：

```go
gorm.Config{ SkipDefaultTransaction: true }  // 单条写操作本身原子，包一层是浪费
```

### 5.2 函数式事务（推荐）

```go
err := db.Transaction(func(tx *gorm.DB) error {
  if err := tx.Create(&order).Error; err != nil {
    return err // 返回 error → 自动 ROLLBACK
  }
  if err := tx.Model(&user).Update("balance", gorm.Expr("balance - ?", 100)).Error; err != nil {
    return err
  }
  // 全部成功 → 自动 COMMIT
  return nil
})
// 三个要点：
// 1. 闭包内一律用 tx 而不是 db —— 用错变量 = 逃出事务，最隐蔽的 bug
// 2. panic 也会自动回滚（内部 recover）
// 3. 返回 nil 提交、返回 error 回滚，无需手写 Begin/Commit
```

### 5.3 手动事务与 SavePoint

```go
tx := db.Begin()
defer func() {
    if r := recover(); r != nil {
        tx.Rollback()
        panic(r) // 回滚后继续 panic，别吞掉
    }
}()

if err := tx.Create(&a).Error; err != nil {
    tx.Rollback()
    return err
}
tx.Commit() // 别忘了，漏掉 = 连接带着未提交事务归还池子

// 嵌套事务（SavePoint）
err := db.Transaction(func(tx *gorm.DB) error {
  tx.Create(&a)
  err := tx.Transaction(func(tx2 *gorm.DB) error { // 实际是 SAVEPOINT
    tx2.Create(&b)
    return errors.New("rollback b") // 只回滚到保存点，a 不受影响
  })
  return nil
})
```

### 5.4 乐观锁模式（工程必备）

```go
type Product struct {
  ID      uint
  Stock   int
  Version int    // 乐观锁版本号
}

// CAS 式更新：WHERE 带版本号，影响行数=0 说明有人抢先
res := db.Model(&Product{}).
  Where("id = ? AND version = ?", id, oldVersion).
  Updates(map[string]any{
    "stock":   gorm.Expr("stock - 1"),
    "version": oldVersion + 1,
  })
if res.RowsAffected == 0 {
  return errors.New("并发冲突，请重试")
}
```

---

## 六、Hook

Hook 是模型上的约定方法，在 CRUD 前后自动调用——适合做审计字段、数据修正、密码加密：

```go
func (u *User) BeforeCreate(tx *gorm.DB) error {
  if u.Name == "" {
    return errors.New("name 不能为空") // 返回 error 中断操作
  }
  if u.Password != "" {
    hash, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
    if err != nil { return err }
    u.Password = string(hash)
  }
  return nil
}
```

约定清单：`BeforeCreate/AfterCreate`、`BeforeUpdate/AfterUpdate`、`BeforeDelete/AfterDelete`、`BeforeSave/AfterSave`（Create 和 Update 都触发）、`AfterFind`（查询后，做字段填充）。

**注意**：Hook 挂在模型上意味着数据逻辑渗入模型层，多了会难测试。简单场景用 Hook，复杂规则放 Service 层。

---

## 七、性能与诊断

### 7.1 Session 级优化

```go
db.Session(&gorm.Session{
  PrepareStmt: true, // 缓存预编译语句，高频相同 SQL 提升明显
}).Find(&users)
```

### 7.2 DryRun：只生成 SQL 不执行

```go
stmt := db.Session(&gorm.Session{DryRun: true}).
  Where("age > ?", 18).Find(&users).Statement
db.Dialector.Explain(stmt.SQL.String(), stmt.Vars...) // 打印带参数的完整 SQL
```

调试期必备：先 DryRun 看生成的 SQL 对不对，再真跑。

### 7.3 索引原则（SQL 层面，ORM 帮不了你）

- WHERE / ORDER BY / JOIN 涉及的列建索引；组合查询用联合索引（最左前缀）
- 大表分页 `Offset` 深翻页退化 → 改游标分页 `WHERE id > ? LIMIT n`
- `EXPLAIN` 每个 100ms+ 的查询

---

## 八、常见坑大全

| 坑 | 现象 | 解法 |
| ---- | ---- | ---- |
| `ErrRecordNotFound` 未处理 | 首页用户不存在直接 500 | `errors.Is` 捕获，转业务错误 |
| struct 条件忽略零值 | `Where(&User{Age: 0})` 查全表 | 用 map 或字符串条件 |
| Updates 零值丢失 | 想置 0 失败 | map 版 / Select 列 |
| 闭包事务里用了 db | 事务没生效 | 闭包内只用 tx |
| N+1 | 列表页 SQL 洪水 | Preload / Joins |
| 软删除 + 唯一索引 | 新插入报重复 | 联合唯一索引含 deleted_at |
| `invalid connection` | 跑几小时后报错 | ConnMaxLifetime < wait_timeout |
| `parseTime` 未开 | time 字段报错 | DSN 加 `parseTime=True` |
| map 传参类型不匹配 | 索引失效 / 隐式转换 | 参数类型与列类型一致 |
| 大事务 | 长时间持锁 | 事务里只放 DB 操作，IO/ RPC 移出去 |

---

## 九、小结

- DSN 三件套（charset/parseTime/loc）+ 连接池四参数是上线前的检查清单
- `First/Take/Last` 返回 `ErrRecordNotFound`；条件与更新的 struct/map 零值语义差异是第一坑
- **Preload 杀 N+1**，Joins 取单条最快，循环查询永远禁止
- 函数式事务 + 闭包内只用 tx；乐观锁用 `RowsAffected` 判断
- 生产禁用 AutoMigrate，用版本化迁移工具；SkipDefaultTransaction + PrepareStmt 是免费性能

配套阅读：[Gin 深度指南](./gin.md)、[项目架构与工程实践](./project-layout.md)（分层结构中 Repository 层的完整实践）。
