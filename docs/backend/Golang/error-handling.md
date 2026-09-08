---
title: Go 错误处理
icon: back-stage
category:
  - 后端
  - Golang
tag:
  - Golang
  - 错误处理
---

# Go 错误处理

Go 拒绝了 try/catch，选择了「**错误是值**」（errors are values）——错误和普通数据一样被创建、传递、检查。这个决定让 Go 的错误处理路径全部显式出现在代码里，代价是 `if err != nil` 的高频出现。本篇讲透：error 的本质、现代错误 API（Go 1.13+ 的 wrap 三件套）、panic 的定位、以及工程级的错误设计。

---

## 一、error 的本质：一个接口

```go
// 标准库定义 —— error 只有一个方法
type error interface {
  Error() string
}
```

任何实现了 `Error() string` 的类型都是 error。最常用的两个实现：

```go
// ① errors.New：静态错误
var ErrNotFound = errors.New("record not found")

// ② fmt.Errorf：格式化错误
err := fmt.Errorf("user %d not found", 42)

// 自定义错误类型：携带结构化信息（比字符串强得多）
type ValidationError struct {
  Field  string
  Reason string
}

func (e *ValidationError) Error() string {
  return fmt.Sprintf("validation failed on %s: %s", e.Field, e.Reason)
}
```

**为什么错误可以是 nil 但不出自 nil**——经典面试题（详见[高阶篇](./advanced.md)接口一节）：

```go
type MyErr struct{}
func (*MyErr) Error() string { return "boom" }

var err *MyErr = nil        // 类型是 *MyErr，值是 nil
var e error = err           // 装进接口后：接口的「类型」非空！
fmt.Println(e == nil)       // false —— 接口 = (type, value) 二元组，type 有值就不等于 nil
```

**规矩：返回 `error` 类型时永远显式 `return nil`，不要返回具体错误类型的 nil 指针。**

## 二、Go 1.13+ 错误三件套 ⭐

老式 `fmt.Errorf("...: %v", err)` 会丢失原始错误链（只剩字符串）。1.13 引入 wrap 机制：

### 2.1 %w 包装：保留错误链

```go
var ErrUserNotFound = errors.New("user not found")

func GetUser(id int) (*User, error) {
  u, err := repo.Find(id)
  if err != nil {
    return nil, fmt.Errorf("get user %d: %w", id, err) // %w 包装，%v 只是拼字符串
  }
  return u, nil
}

// 最外层可以一路追溯到根因
// get user 42: user not found
```

### 2.2 errors.Is：哨兵错误判断（替代 ==）

```go
err := GetUser(42)

// 错误：== 只能比较当前层，包装后失配
// if err == ErrUserNotFound { ... }

// 正确：Is 沿着 wrap 链逐层解开比对
if errors.Is(err, ErrUserNotFound) {
  // 走「用户不存在」分支
}
```

`Is` 的适用场景：**哨兵错误**（sentinel error）——预定义的全局错误值，如 `gorm.ErrRecordNotFound`、`io.EOF`、`context.DeadlineExceeded`、`sql.ErrNoRows`。

### 2.3 errors.As：提取结构化错误（替代类型断言）

```go
if err := parse(input); err != nil {
  var ve *ValidationError
  if errors.As(err, &ve) {       // 沿链找到第一个可赋给 ve 的错误
    fmt.Println("字段:", ve.Field) // 拿到结构化字段 —— 字符串永远做不到
    http.Error(w, ve.Error(), 400)
  }
}
```

### 2.4 三件套使用决策

| 想做什么 | 用什么 |
| ---- | ---- |
| 判断「是不是某个已知错误」 | `errors.Is(err, ErrXxx)` |
| 拿错误里的结构化信息 | `errors.As(err, &target)` |
| 给错误加上下文再上抛 | `fmt.Errorf("...: %w", err)` |
| 只是记日志，不再上抛 | `log.Printf("%+v", err)`，用 %v 即可 |

::: tip 铁律：错误只处理一次
「处理」= 要么上抛（加 %w 上下文），要么消费（记日志 + 转响应），**二选一**。既 log 又 return 的错误会被重复处理，日志里同一错误刷屏。上抛时永远 %w，让链上的人还能 Is/As。
:::

## 三、panic 与 recover：Go 的「异常」

### 3.1 panic 的语义

panic 不是「高级版 error」，而是**不可恢复的程序性错误**：数组越界、nil 解引用、类型断言失败——这些 bug 不该被「处理」，该被修复并让进程崩溃暴露问题。

```go
func mustParse(s string) time.Duration {
  d, err := time.ParseDuration(s)
  if err != nil {
    panic(err) // 只适合「约定输入必然合法」的场景（如硬编码配置）
  }
  return d
}
```

### 3.2 recover：只活在 defer 里

```go
func safeCall() (err error) {
  defer func() {
    if r := recover(); r != nil {
      err = fmt.Errorf("panic recovered: %v", r) // 转成错误向上传
    }
  }()
  return doWork() // doWork 内部 panic 会被这里兜住
}
```

要点：

- recover **只在 defer 的函数里直接调用才生效**（嵌套函数里无效）
- recover 后栈不再展开，goroutine 存活
- **panic 只能 recover 同一个 goroutine 的**——子 goroutine 的 panic 父协程接不住，会直接崩进程。子协程里必须自己 defer recover
- Gin 的 `Recovery()` 中间件就是这套机制：panic → recover → 500 响应 + 堆栈日志，见[Gin 篇](./gin.md)

### 3.3 什么时候用 panic

| 场景 | 用 error 还是 panic |
| ---- | ---- |
| 业务失败（用户不存在、余额不足） | **error**，调用方要分支处理 |
| 程序 bug（越界、nil 指针） | panic（崩溃即暴露） |
| 初始化失败（配置读不到、端口被占） | panic / log.Fatal，启动期快速失败 |
| 库代码面对非法参数 | 返回 error；「程序员错误」类（如 regexp.MustCompile 语法错误）可 panic |
| 想跨层「抛异常」图省事 | **禁止**——Go 社区共识，破坏显式错误流 |

## 四、工程级错误设计 ⭐

### 4.1 错误分层：领域定义，出口翻译

```go
// 领域层：只定义业务语义，不知道 HTTP/DB 的存在
var (
  ErrUserNotFound = errors.New("user not found")
  ErrDuplicated   = errors.New("user already exists")
)

// repository 层：把 GORM 错误翻译成领域错误（翻译点，只此一处）
func (r *UserRepo) Find(id int) (*User, error) {
  var u User
  if err := r.db.First(&u, id).Error; err != nil {
    if errors.Is(err, gorm.ErrRecordNotFound) {
      return nil, fmt.Errorf("repo: %w", ErrUserNotFound)
    }
    return nil, fmt.Errorf("repo find user: %w", err)
  }
  return &u, nil
}

// handler 层：把领域错误翻译成 HTTP 状态码（翻译点，只此一处）
func getUser(c *gin.Context) {
  u, err := svc.GetUser(id)
  switch {
  case errors.Is(err, ErrUserNotFound):
    c.JSON(404, gin.H{"error": "用户不存在"})
  case err != nil:
    c.JSON(500, gin.H{"error": "服务异常"}) // 内部错误不泄漏细节
  default:
    c.JSON(200, u)
  }
}
```

**两层翻译点是这套架构的核心**：领域层不 import gin/gorm，handler 层不碰 SQL 错误码。错误在任何一层只被「翻译或透传」，绝不 log 后再 return。

### 4.2 错误信息规范

```go
// 差：无上下文，出问题只能猜
return err

// 差：丢失链路
return fmt.Errorf("failed: %v", err)

// 好：动宾结构 + 关键参数 + %w 保链
return fmt.Errorf("load config from %s: %w", path, err)
```

堆栈需求：`%w` 不含堆栈。需要完整调用栈时用 `github.com/pkg/errors`（`errors.Wrap` 自带堆栈）或 `xerrors`，标准库目前不带堆栈是已知取舍。

### 4.3 Go 1.20+ 的多错误与 errors.Join

```go
// 批量任务收集所有错误而不是碰到第一个就返回
var errs []error
for _, t := range tasks {
  if err := run(t); err != nil {
    errs = append(errs, err)
  }
}
return errors.Join(errs...) // nil 切片 Join 返回 nil；Error() 用换行拼接

// 配合 errors.Is：Join 的结果对任意成员错误 Is 都为 true
```

## 五、context 与错误：取消传播

```go
ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
defer cancel()

u, err := repo.Find(ctx, id)
if err != nil {
  switch {
  case errors.Is(err, context.DeadlineExceeded): // 超时（DB 调用会收到 ctx 并中断）
    return fmt.Errorf("query timeout: %w", err)
  case errors.Is(err, context.Canceled): // 上游主动取消（用户关了页面）
    return err
  }
}
```

**所有可能阻塞的函数都带 `ctx context.Context` 作为第一参数**——这是 Go 1.7 后的硬约定，让超时与取消沿调用链自动传播。详见[并发篇](./concurrency.md) context 一节。

## 六、常见坑速查

| 坑 | 后果 | 规矩 |
| ---- | ---- | ---- |
| 返回类型化 nil 指针 | 调用方判 nil 失败 | `return nil` 显式写 |
| 用 `==` 比较包装过的错误 | 永远 false | errors.Is |
| `%v` 包装再上抛 | 链断，下游 Is/As 失效 | 上抛用 `%w` |
| 同一错误又 log 又 return | 日志刷屏 | 错误只处理一次 |
| defer 外 recover | 接不住 panic | 只在 defer 函数内直接调用 |
| 子 goroutine panic | 整个进程崩 | 子协程自己 defer recover |
| 错误信息写「失败」没参数 | 排查全靠猜 | 动词 + 对象 + 关键参数 |
| panic 当异常跨层抛 | 调用方无法分支 | 业务错误一律 error |

## 七、小结

- error 是值：显式创建、显式检查、显式传递——可读性用工具解决（defer + wrap），不靠异常
- 三件套：`%w` 保链、`errors.Is` 查哨兵、`errors.As` 取结构化信息
- 错误只处理一次：翻译（加上下文）或消费（log/响应），二者取一
- panic 只用于 bug 与启动失败；recover 只在 defer；跨 goroutine 接不住
- 工程设计：领域错误哨兵化 + repository/handler 两个翻译点 + errors.Join 批量收集

配套阅读：[并发篇](./concurrency.md)（context 取消传播）、[Gin 深度指南](./gin.md)（Recovery 中间件）、[GORM 深度指南](./gorm.md)（ErrRecordNotFound 翻译实践）、[项目架构篇](./project-layout.md)（错误分层全貌）。
