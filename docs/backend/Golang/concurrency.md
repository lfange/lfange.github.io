---
title: Go 并发编程
icon: back-stage
category:
  - 后端
  - Golang
tag:
  - Golang
  - 并发
  - goroutine
  - channel
---

# Go 并发编程

> 并发是 Go 的核心卖点。"不要通过共享内存来通信，而要通过通信来共享内存" --Go 并发哲学。本文覆盖 goroutine、channel、sync、context、并发模式与常见坑。

---

## 一、并发 vs 并行

- **并发（Concurrency）**：多任务交替执行，单核也能并发（时间片切换）。Go 的 goroutine 调度器在用户态调度。
- **并行（Parallelism）**：多任务在同一时刻真正同时执行，需要多核。

Go 的 GMP 调度器让并发程序可以自动利用多核并行。设置并行度：

```go
runtime.GOMAXPROCS(runtime.NumCPU())   // 1.5+ 默认就是 CPU 核数
```

---

## 二、Goroutine

goroutine 是 Go 的轻量级线程，由 runtime 调度，初始栈仅 ~2KB（线程通常是 MB 级）。

### 2.1 启动

```go
go func() {
    fmt.Println("hello from goroutine")
}()

go doSomething(arg)   // 函数调用前加 go
```

### 2.2 GMP 模型

- **G（Goroutine）**：用户协程。
- **M（Machine）**：操作系统线程，真正执行 G。
- **P（Processor）**：逻辑处理器，持有可运行 G 的本地队列，数量 = `GOMAXPROCS`。

调度：M 绑定 P，从 P 的本地队列取 G 执行；本地空了从全局队列或其他 P 偷（work stealing）。G 阻塞（如系统调用）时 M 会和 P 分离，让其他 M 接管 P 继续跑其他 G。

### 2.3 goroutine 生命周期

```go
func main() {
    go func() {
        fmt.Println("running")
    }()
    // main 不等 goroutine 就退出 -> goroutine 可能根本没执行！
}
```

**坑 1：main 退出，所有 goroutine 直接终止**。需要同步等待（WaitGroup）或阻塞（channel/select）。

**坑 2：goroutine 泄漏**：goroutine 阻塞且无人唤醒，永远不退出，持续占内存。

```go
// 泄漏示例：ch 永远没人读
func leak() {
    ch := make(chan int)
    go func() {
        ch <- 1   // 永远阻塞，泄漏
    }()
}
```

---

## 三、Channel 通道

channel 是 goroutine 间通信的管道，类型安全。

### 3.1 基本用法

```go
// 无缓冲通道（同步）
ch := make(chan int)
go func() { ch <- 1 }()   // 发送，必须有人接收才不阻塞
v := <-ch                 // 接收

// 有缓冲通道（异步）
ch := make(chan int, 3)
ch <- 1
ch <- 2
v := <-ch
```

| 操作 | 无缓冲 | 有缓冲 |
|------|--------|--------|
| 发送 | 阻塞直到有接收者 | 缓冲未满时不阻塞 |
| 接收 | 阻塞直到有发送者 | 缓冲非空时不阻塞 |
| 语义 | 同步握手 | 异步队列 |

### 3.2 方向

```go
func producer(out chan<- int) { out <- 1 }   // 只发送
func consumer(in <-chan int) { v := <-in }   // 只接收
```

### 3.3 关闭与遍历

```go
ch := make(chan int, 3)
ch <- 1; ch <- 2; ch <- 3
close(ch)

// 遍历直到关闭
for v := range ch {
    fmt.Println(v)
}

// 检测关闭
v, ok := <-ch   // ok=false 表示已关闭且无数据
```

**关闭规则**：

- 只能关闭一次，重复 close panic。
- 只能由**发送方**关闭，接收方关闭会导致发送方 panic（向已关闭 channel 发送）。
- 关闭后仍可接收已缓冲的数据，耗尽后返回零值。

### 3.4 channel 的坑

#### 坑 1：向已关闭 channel 发送 panic

```go
ch := make(chan int)
close(ch)
ch <- 1   // panic: send on closed channel
```

#### 坑 2：接收 nil channel 永久阻塞

```go
var ch chan int   // nil
<-ch              // 永久阻塞（可用于 select 动态禁用分支）
```

#### 坑 3：close 后接收不阻塞直到缓冲耗尽

```go
ch := make(chan int, 2)
ch <- 1; ch <- 2
close(ch)
fmt.Println(<-ch)   // 1，不阻塞
fmt.Println(<-ch)   // 2，不阻塞
fmt.Println(<-ch)   // 0（零值），不阻塞
```

---

## 四、select 多路复用

`select` 同时监听多个 channel，哪个就绪执行哪个。

```go
select {
case v := <-ch1:
    fmt.Println("ch1:", v)
case ch2 <- 42:
    fmt.Println("sent to ch2")
case <-time.After(2 * time.Second):
    fmt.Println("timeout")
default:
    fmt.Println("no channel ready")   // 非阻塞模式
}
```

- 多个 case 就绪，**随机**选一个（避免饥饿）。
- `default` 使 select 非阻塞，无就绪时立即走 default。
- `time.After` 实现超时（注意：每次创建新 timer，高频场景用 `time.NewTimer` 复用）。

### 经典：超时控制

```go
select {
case res := <-doWork():
    handle(res)
case <-time.After(3 * time.Second):
    fmt.Println("timeout")
}
```

---

## 五、sync 包并发原语

channel 适合"通信"，但有些场景共享内存 + 锁更直接，用 `sync` 包。

### 5.1 WaitGroup 等待一组 goroutine

```go
var wg sync.WaitGroup
for i := 0; i < 5; i++ {
    wg.Add(1)
    go func(i int) {
        defer wg.Done()
        fmt.Println(i)
    }(i)
}
wg.Wait()
```

**坑**：`wg.Add(1)` 必须在 goroutine 外调用（否则可能 Wait 时 Add 还没执行）。

### 5.2 Mutex / RWMutex 互斥锁

```go
var (
    mu    sync.Mutex
    count int
)

func increment() {
    mu.Lock()
    defer mu.Unlock()
    count++
}

// 读写锁：多读单写
var rw sync.RWMutex
func read() { rw.RLock(); defer rw.RUnlock(); /* ... */ }
func write() { rw.Lock(); defer rw.Unlock(); /* ... */ }
```

**坑**：

- **不可重入**：同一 goroutine 二次 Lock 会死锁。Go 的 Mutex 不是可重入锁。
- **不要复制**：`sync.Mutex` 含状态，复制会破坏互斥。结构体含 Mutex 用指针传递。
- **`go vet` 能检测**锁拷贝。

### 5.3 Once 单次执行

```go
var (
    once sync.Once
    instance *DB
)
func GetDB() *DB {
    once.Do(func() {
        instance = connectDB()
    })
    return instance
}
```

线程安全的单例/初始化。

### 5.4 Cond 条件变量

```go
var (
    mu   sync.Mutex
    cond = sync.NewCond(&mu)
    ready bool
)
// 等待方
mu.Lock()
for !ready {
    cond.Wait()   // 释放锁并阻塞，被 Signal 后重新加锁
}
mu.Unlock()
// 通知方
mu.Lock(); ready = true; cond.Signal()   // 或 Broadcast
mu.Unlock()
```

### 5.5 atomic 原子操作

```go
var count int64
atomic.AddInt64(&count, 1)
atomic.LoadInt64(&count)
atomic.StoreInt64(&count, 0)
n := atomic.AddInt64(&count, 1)

// CompareAndSwap：无锁编程基础
if atomic.CompareAndSwapInt64(&count, old, new) { ... }

// 1.19+ 类型参数版本
var c atomic.Int64
c.Add(1)
c.Load()
```

简单计数器用 atomic 比 Mutex 更轻快。

### 5.6 sync.Map 并发安全 map

```go
var m sync.Map
m.Store("a", 1)
v, ok := m.Load("a")
m.LoadOrStore("b", 2)   // 不存在则存，返回 (值, 是否新存)
m.Delete("a")
m.Range(func(k, v any) bool { return true })   // 遍历
```

适用：读多写少、key 集合稳定。写密集用 map + RWMutex 可能更快。

### 5.7 sync.Pool 对象复用

```go
var bufPool = sync.Pool{
    New: func() any { return new(bytes.Buffer) },
}
buf := bufPool.Get().(*bytes.Buffer)
buf.Reset()
buf.WriteString("...")
// 用完归还
bufPool.Put(buf)
```

复用对象减少 GC 压力（如 buffer、临时对象）。注意：Pool 在 GC 时会清空，不保证存留。

---

## 六、context 上下文（必学）

`context` 用于在 goroutine 间传递截止时间、取消信号、请求作用域的值。**所有可能阻塞的操作都应接受 context**。

### 6.1 四个核心

```go
ctx := context.Background()              // 根，主函数/初始化用
ctx := context.TODO()                    // 占位，还不确定用啥

// 派生
ctx, cancel := context.WithCancel(parent)         // 手动取消
ctx, cancel := context.WithTimeout(parent, 3*time.Second)  // 超时取消
ctx, cancel := context.WithDeadline(parent, time.Now().Add(3*time.Second))
ctx := context.WithValue(parent, "uid", 123)      // 传值（少用）
```

`cancel` 必须调用（`defer cancel()`），否则泄漏 context。

### 6.2 取消传播

```go
func handler(ctx context.Context) {
    ctx, cancel := context.WithTimeout(ctx, 2*time.Second)
    defer cancel()

    go work(ctx)

    select {
    case <-ctx.Done():
        fmt.Println("ctx done:", ctx.Err())   // context.DeadlineExceeded / Canceled
    }
}

func work(ctx context.Context) {
    for {
        select {
        case <-ctx.Done():
            return   // 收到取消，退出
        default:
            doStep()
        }
    }
}
```

取消信号从父 context 向所有子 context 传播，子 goroutine 监听 `ctx.Done()` 退出。

### 6.3 实战：HTTP 请求超时

```go
ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
defer cancel()
req, _ := http.NewRequestWithContext(ctx, "GET", url, nil)
resp, err := http.DefaultClient.Do(req)
```

### 6.4 context 的坑

#### 坑 1：WithValue 滥用

context 不是用来传业务参数的，只传请求级元数据（traceID、userID）。业务参数走函数参数。而且要用自定义类型作 key，避免冲突：

```go
type ctxKey int
const keyUserID ctxKey = 0
ctx = context.WithValue(ctx, keyUserID, 123)
uid := ctx.Value(keyUserID).(int)
```

#### 坑 2：忘记 cancel 泄漏

```go
// 错误：cancel 未调用
ctx, _ := context.WithTimeout(parent, 10*time.Second)
go work(ctx)   // context 在父取消或超时才回收
// 正确
ctx, cancel := context.WithTimeout(parent, 10*time.Second)
defer cancel()
```

即使 goroutine 提前结束，也要 cancel 以释放 context 资源。

#### 坑 3：context.Background() 在业务逻辑里滥用

业务函数应接受 context 参数，由顶层传入。内部不要随便 `context.Background()`，否则丢失超时/取消链路。

---

## 七、常见并发模式

### 7.1 Fan-out / Fan-in 扇出扇入

```go
func fanOutFanIn(inputs []int) []int {
    out := make(chan int)
    // fan-out：N 个 worker 并行处理
    for _, in := range inputs {
        go func(in int) {
            out <- process(in)
        }(in)
    }
    // fan-in：收集结果
    results := make([]int, 0, len(inputs))
    for i := 0; i < len(inputs); i++ {
        results = append(results, <-out)
    }
    return results
}
```

### 7.2 Worker Pool 工作池

```go
func workerPool(jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
    defer wg.Done()
    for j := range jobs {
        results <- process(j)
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)
    var wg sync.WaitGroup

    // 启动 N 个 worker
    for w := 0; w < 10; w++ {
        wg.Add(1)
        go workerPool(jobs, results, &wg)
    }
    // 派发任务
    for j := 0; j < 50; j++ { jobs <- j }
    close(jobs)
    wg.Wait()
    close(results)
}
```

控制 goroutine 数量，避免无限制创建。

### 7.3 Pipeline 流水线

```go
func gen(ctx context.Context, nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for _, n := range nums {
            select {
            case <-ctx.Done(): return
            case out <- n:
            }
        }
    }()
    return out
}

func square(ctx context.Context, in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for n := range in {
            select {
            case <-ctx.Done(): return
            case out <- n * n:
            }
        }
    }()
    return out
}

// 串联
ctx, cancel := context.WithCancel(context.Background())
defer cancel()
for r := range square(ctx, gen(ctx, 1, 2, 3)) {
    fmt.Println(r)   // 1 4 9
}
```

### 7.4 限流（令牌桶）

```go
import "golang.org/x/time/rate"
limiter := rate.NewLimiter(10, 5)   // 每秒 10 个，桶容量 5
if err := limiter.Wait(ctx); err != nil { ... }
handle()
```

### 7.5 熔断与重试

用 `github.com/sony/gobreaker` 等库，避免手写。重试注意指数退避 + 最大次数。

---

## 八、errgroup（推荐）

`golang.org/x/sync/errgroup` 简化"并行 + 错误收集 + context 取消"：

```go
import "golang.org/x/sync/errgroup"

g, ctx := errgroup.WithContext(context.Background())
for _, url := range urls {
    url := url
    g.Go(func() error {
        return fetch(ctx, url)   // 任一返回 error，ctx 自动 cancel，其他 goroutine 收到取消
    })
}
if err := g.Wait(); err != nil {   // 返回第一个 error
    log.Fatal(err)
}
```

并发请求场景比手写 WaitGroup + channel 优雅得多。

---

## 九、常见并发坑总结

### 坑 1：循环变量捕获（1.22 前经典）

见[数据结构篇](./data-structures.md) slice 坑 7。1.22+ 已修复，老代码注意。

### 坑 2：goroutine 泄漏

goroutine 永久阻塞无人唤醒。排查：`runtime.NumGoroutine()` 监控，或 pprof goroutine profile。

### 坑 3：map 并发读写 panic

用 `sync.Map` 或 `map + Mutex`。开发期开 `-race` 检测。

### 坑 4：Mutex 复制死锁

```go
type S struct{ mu sync.Mutex }
s1 := S{}
s2 := s1   // 复制了 Mutex！两个独立的锁，失去互斥
// 用 *S 指针传递，`go vet` 报警
```

### 坑 5：忘记 close channel 导致 range 死锁

```go
ch := make(chan int)
go func() { ch <- 1; ch <- 2 /* 忘 close */ }()
for v := range ch { fmt.Println(v) }   // 永久阻塞
```

### 坑 6：select 的 time.After 内存泄漏

```go
// 错误：每次 select 创建新 timer，case 成功时 timer 未回收，泄漏
for {
    select {
    case v := <-ch: handle(v)
    case <-time.After(time.Second):   // 高频循环下严重泄漏
    }
}
// 正确：复用 timer
t := time.NewTimer(time.Second)
defer t.Stop()
for {
    t.Reset(time.Second)
    select {
    case v := <-ch: handle(v)
    case <-t.C:
    }
}
```

### 坑 7：data race 数据竞争

多个 goroutine 读写同一变量且至少一个写，无同步。**不是一定崩，是未定义行为**。开发期必须 `go test -race` / `go build -race` 检测。

```go
// 数据竞争
var count int
go func() { count++ }()
go func() { count++ }()
// 修复：atomic 或 Mutex
```

### 坑 8：goroutine 与 for 循环退出时机

```go
for i := 0; i < 3; i++ {
    go func() { fmt.Println(i) }()
}
// main 退出，goroutine 可能打印 3 3 3 或不打印
// 需要 WaitGroup 等待
```

---

## 十、并发调试与排查

### 10.1 race detector

```bash
go test -race ./...
go run -race main.go
```

数据竞争时打印详细调用栈，开发期必开。

### 10.2 pprof goroutine

```go
import _ "net/http/pprof"
go http.ListenAndServe("localhost:6060", nil)
```

```bash
go tool pprof http://localhost:6060/debug/pprof/goroutine
(pprof) top
(pprof) traces
```

定位 goroutine 泄漏、阻塞位置。

### 10.3 NumGoroutine 监控

```go
log.Printf("goroutines: %d", runtime.NumGoroutine())
// 数量持续增长 -> 泄漏
```

---

## 十一、小结

| 主题 | 要点 |
|------|------|
| goroutine | 轻量，main 退出即终止，警惕泄漏 |
| channel | 无缓冲=同步，有缓冲=异步；发送方 close |
| select | 多路复用，随机选就绪，default 非阻塞 |
| sync | Mutex 不可重入不可复制，atomic 计数，Once 单例，Pool 复用 |
| context | 超时/取消/传值，必须 defer cancel，WithValue 仅传元数据 |
| 模式 | fan-out/in、worker pool、pipeline、errgroup |
| 排查 | `-race` 查数据竞争，pprof 查 goroutine 泄漏 |

**核心哲学**：优先用 channel 通信；共享状态用 sync；所有阻塞操作带 context；开发期开 race detector。

> 下一篇：[Go 项目框架与工程实践](./project-layout.md)
