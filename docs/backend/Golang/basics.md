---
title: Go 语法基础
icon: back-stage
category:
  - 后端
  - Golang
tag:
  - Golang
  - 基础
---

# Go 语法基础

> 适合有其他语言基础的开发者快速上手 Go。覆盖变量、类型、函数、流程控制、错误处理、defer、指针入门。数据结构（slice/map/struct）详见[数据结构篇](./data-structures.md)，并发详见[并发篇](./concurrency.md)。

---

## 一、Hello World

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go!")
}
```

要点：

- 每个 Go 程序必须有 `package main` 和 `func main()` 作为入口。
- `import` 导入标准库，单条用 `""`，多条用括号分组。
- 语句**结尾不需要分号**（编译器自动插入，由词法分析决定）。
- `{` 必须跟在函数签名同一行，不能换行（编译器规则）。

```bash
go run main.go      # 直接运行
go build -o app .   # 编译
```

---

## 二、变量与常量

### 2.1 变量声明

```go
// 1. var 关键字，显式类型
var name string
var age int = 18

// 2. 类型推断
var city = "beijing"

// 3. 短变量声明（只能在函数内，最常用）
name := "lfange"
count := 10

// 4. 多变量
var a, b int = 1, 2
x, y := 3, 4
```

> **注意**：`:=` 只能用于函数内部。包级变量必须用 `var`。`:=` 左侧至少有一个变量是新的才能用。

### 2.2 零值

Go 没有"未初始化"的变量，声明即有**零值**：

| 类型 | 零值 |
|------|------|
| 数值（int/float 等）| `0` |
| bool | `false` |
| string | `""`（空串）|
| 指针 / slice / map / chan / func / interface | `nil` |
| struct | 各字段零值 |

```go
var s string    // ""
var p *int      // nil
var m map[string]int  // nil（注意：nil map 不能直接写，要先 make）
```

### 2.3 常量 const

```go
const Pi = 3.14159
const (
    StatusOK = 200
    StatusNotFound = 404
)

// iota：常量计数器，从 0 开始，每行 +1
const (
    Sunday = iota    // 0
    Monday           // 1
    Tuesday          // 2
    Wednesday        // 3
)

// 位运算常用：权限位
const (
    Read = 1 << iota    // 1
    Write               // 2
    Execute             // 4
)
perm := Read | Write   // 3
```

### 2.4 变量作用域

- 函数内 `:=` 声明的变量是局部。
- **短变量声明会遮蔽外层同名变量**，这是常见 bug 源：

```go
var err error
if true {
    val, err := someFunc()   // 这里 err 是新的局部变量，外层 err 没被赋值！
    _ = val
    _ = err
}
fmt.Println(err)   // 仍是 nil
```

---

## 三、基本类型

### 3.1 类型一览

| 类别 | 类型 |
|------|------|
| 整数 | `int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 byte(rune 别名)` |
| 浮点 | `float32 float64` |
| 布尔 | `bool` |
| 字符串 | `string` |
| 字符 | `rune`（int32 别名，表示 Unicode 码点）|
| 复数 | `complex64 complex128`（少用）|

> `int` 在 64 位平台是 64 位，32 位平台是 32 位。需要确定大小用 `int64`。`byte` = `uint8`，`rune` = `int32`。

### 3.2 类型转换

Go **没有隐式类型转换**，必须显式：

```go
var a int = 10
var b int64 = int64(a)      // 必须显式
var c float64 = float64(a)

// 字符串与数值互转
s := strconv.Itoa(42)        // int -> string
n, err := strconv.Atoi("42") // string -> int
f := strconv.FormatFloat(3.14, 'f', 2, 64)
```

### 3.3 字符串

字符串是不可变的字节序列（UTF-8）。**注意 len 是字节数不是字符数**：

```go
s := "Hello,世界"
fmt.Println(len(s))                    // 13（字节）
fmt.Println(utf8.RuneCountInString(s)) // 8（字符）

// 遍历字节
for i := 0; i < len(s); i++ {
    fmt.Printf("%c", s[i])   // 中文会乱码
}

// 遍历 rune（正确）
for i, r := range s {
    fmt.Printf("%d:%c ", i, r)
}

// 拼接
s1 := "a" + "b"
s2 := fmt.Sprintf("%s=%d", "age", 18)
s3 := strings.Builder{}    // 大量拼接用 Builder，避免频繁分配
s3.WriteString("a")
s3.WriteString("b")
```

### 3.4 类型别名 vs 类型定义

```go
// 类型定义：新类型，不能直接赋值给原类型
type MyInt int
var a MyInt = 1
var b int = int(a)   // 需转换

// 类型别名：同类型，只是另一个名字
type MyInt2 = int
var c MyInt2 = 1
var d int = c         // 直接可以
```

---

## 四、函数

### 4.1 函数声明

```go
func add(a int, b int) int {
    return a + b
}

// 参数类型相同可简写
func add(a, b int) int { return a + b }

// 多返回值（Go 特色）
func divmod(a, b int) (int, int) {
    return a / b, a % b
}
q, r := divmod(10, 3)

// 命名返回值
func split(sum int) (x, y int) {
    x = sum * 4 / 9
    y = sum - x
    return   // 裸 return，用命名返回值
}
```

### 4.2 可变参数

```go
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}
sum(1, 2, 3)         // 6
nums := []int{1, 2, 3}
sum(nums...)         // 展开切片
```

### 4.3 函数是一等公民

```go
// 函数作为变量
var f func(int) int = func(x int) int { return x * 2 }

// 作为参数
func apply(nums []int, fn func(int) int) []int {
    res := make([]int, len(nums))
    for i, n := range nums {
        res[i] = fn(n)
    }
    return res
}

// 闭包：捕获外部变量
func counter() func() int {
    count := 0
    return func() int {
        count++
        return count
    }
}
c := counter()
c()  // 1
c()  // 2
```

### 4.4 init 函数

每个包可有多个 `init()`，在 `main` 之前自动执行，用于初始化（注册驱动、配置等）：

```go
package main

import _ "github.com/go-sql-driver/mysql"  // 只执行 init，不用其导出内容

func init() {
    // 初始化逻辑
}

func main() { ... }
```

执行顺序：包级变量初始化 -> `init()`（按文件名顺序）-> `main()`。

---

## 五、流程控制

### 5.1 if

```go
if x > 0 {
    fmt.Println("正")
} else if x == 0 {
    fmt.Println("零")
} else {
    fmt.Println("负")
}

// if 可带初始化语句（短变量）
if n, err := strconv.Atoi("42"); err == nil {
    fmt.Println(n)
} else {
    fmt.Println(err)
}
// n 和 err 的作用域仅限 if-else 块
```

### 5.2 for（Go 只有 for，没有 while）

```go
// 经典三段式
for i := 0; i < 5; i++ {
    fmt.Println(i)
}

// 类 while
n := 10
for n > 0 {
    n--
}

// 无限循环
for {
    if cond { break }
}

// 遍历
for i, v := range []int{10, 20, 30} {
    fmt.Println(i, v)
}
for k, v := range map[string]int{"a": 1} {
    fmt.Println(k, v)
}
for i, c := range "abc" {  // i 是字节索引，c 是 rune
    _ = i; _ = c
}
```

> **Go 没有 while / do-while**，全部用 for。`break`/`continue` 用法同其他语言，可带 label 跳出多层。

### 5.3 switch

```go
// 不需要 break（默认不穿透）
switch day {
case "Sat", "Sun":
    fmt.Println("周末")
default:
    fmt.Println("工作日")
}

// 穿透用 fallthrough（少用）
switch x {
case 1:
    fmt.Println("一")
    fallthrough
case 2:
    fmt.Println("二")
}

// 无表达式 switch（替代 if-else 链）
switch {
case score >= 90:
    grade = "A"
case score >= 60:
    grade = "B"
default:
    grade = "C"
}

// 类型 switch（配合 interface）
switch v := x.(type) {
case int:
    fmt.Println("int", v)
case string:
    fmt.Println("string", v)
default:
    fmt.Println("unknown")
}
```

### 5.4 goto / label（少用）

```go
for i := 0; i < 3; i++ {
    for j := 0; j < 3; j++ {
        if i+j == 2 {
            goto done   // 跳出多层
        }
    }
}
done:
    fmt.Println("done")
```

---

## 六、错误处理

Go **没有 try-catch**，错误作为返回值显式处理。这是 Go 最具争议也最重要的设计。

### 6.1 error 接口

```go
type error interface {
    Error() string
}
```

任何实现了 `Error() string` 方法的类型都是 error。

### 6.2 基本用法

```go
func divide(a, b int) (int, error) {
    if b == 0 {
        return 0, errors.New("division by zero")
    }
    return a / b, nil
}

result, err := divide(10, 0)
if err != nil {
    fmt.Println("error:", err)
    return
}
fmt.Println(result)
```

**约定**：错误总是最后一个返回值；`nil` 表示成功。

### 6.3 错误包装（1.13+）

```go
// 自定义错误
var ErrNotFound = errors.New("not found")

// fmt.Errorf 包装上下文，%w 保留原错误链
if err := query(); err != nil {
    return fmt.Errorf("query user %d: %w", id, err)
}

// 拆包判断
if errors.Is(err, ErrNotFound) {
    // 是 ErrNotFound 或包装了它
}

// 取出特定类型错误
var perr *MyError
if errors.As(err, &perr) {
    // err 链中有 *MyError
}
```

### 6.4 panic / recover（仅严重错误）

```go
// panic：不可恢复错误，会向上传播直到程序崩溃
func mustDo() {
    panic("something terrible")
}

// recover：在 defer 中捕获 panic
func safeRun() {
    defer func() {
        if r := recover(); r != nil {
            fmt.Println("recovered:", r)
        }
    }()
    panic("boom")
}
```

> **原则**：业务错误用 `error` 返回，**不要用 panic 当异常**。panic 仅用于"程序员错误"（如数组越界、nil 解引用）或程序初始化失败。库一般不 panic。

### 6.5 错误处理最佳实践

1. **尽早 return**（happy path 左对齐），避免深层嵌套：

```go
// 好
func work() error {
    if err := step1(); err != nil { return err }
    if err := step2(); err != nil { return err }
    return nil
}

// 不好：嵌套地狱
func work() error {
    if err := step1(); err == nil {
        if err := step2(); err == nil {
            return nil
        } else { return err }
    } else { return err }
}
```

2. **包装错误加上下文**：`fmt.Errorf("doing X: %w", err)`，但不要在每层都包（最底层包一次）。
3. **判断用 `errors.Is` / `errors.As`**，不要 `err.Error() == "..."` 字符串比较。
4. **不要忽略错误**：`_, _ = doSomething()` 是坏味道，至少 `_ = doSomething()` 并加注释。

---

## 七、defer

`defer` 在函数返回前执行（LIFO 后进先出），常用于资源释放。

```go
func readFile(path string) {
    f, err := os.Open(path)
    if err != nil { return }
    defer f.Close()    // 确保关闭，即使中途 return/panic

    // 多个 defer 按 LIFO 顺序执行
    defer fmt.Println("1")
    defer fmt.Println("2")   // 先输出 2 再 1
}
```

### defer 三条规则

1. **参数立即求值**：`defer fmt.Println(x)` 的 x 在 defer 语句时求值，不是执行时。

```go
x := 1
defer fmt.Println(x)   // 输出 1，不是 2
x = 2
```

2. **defer 在 return 之后、函数退出之前执行**：能修改命名返回值。

```go
func f() (result int) {
    defer func() { result++ }()   // return 1 变成 2
    return 1
}
```

3. **defer 有性能开销**：会注册到 defer 链表。热路径上避免滥用，1.14 后开销已大幅降低（开放编码 defer）。

### defer 与闭包变量坑

```go
for i := 0; i < 3; i++ {
    defer fmt.Println(i)   // 输出 2 1 0（i 是循环变量，defer 执行时已遍历完）
}
// 想要 0 1 2：传参
for i := 0; i < 3; i++ {
    defer func(i int) { fmt.Println(i) }(i)
}
```

---

## 八、指针入门

```go
x := 10
p := &x          // p 是 *int，指向 x
fmt.Println(*p)  // 10，解引用
*p = 20          // 通过指针改 x
fmt.Println(x)   // 20

// new：分配零值并返回指针
p2 := new(int)   // *int，值为 0
```

### 何时用指针

- 函数要修改实参 -> 用 `*T`。
- 结构体较大 -> 传指针避免拷贝。
- 一致性 -> 同一类型的方法集要么全指针要么全值，别混。

### Go 指针 vs C 指针

- **没有指针运算**：`p++`、`p[1]` 都不行（除非 `unsafe`）。
- **没有 -> 操作符**：指针访问字段也用 `.`，如 `p.Name`。
- **GC 管理**：不用手动 free。

> 详见[数据结构篇](./data-structures.md)的指针章节。

---

## 九、包与可见性

### 9.1 包组织

```
myapp/
├── go.mod
├── main.go              // package main
├── user/
│   ├── user.go          // package user
│   └── service.go       // package user（同包多文件）
└── util/
    └── util.go          // package util
```

### 9.2 可见性规则

Go 用**首字母大小写**控制可见性，没有 public/private 关键字：

- **首字母大写**：导出（public），包外可访问。如 `fmt.Println`、`http.Handler`。
- **首字母小写**：未导出（private），仅包内可见。

```go
package user

type User struct {
    Name  string   // 导出，外部可访问
    email string   // 未导出，仅 user 包内可访问
}

func NewUser() *User { ... }   // 导出
func validate() bool { ... }   // 未导出
```

### 9.3 import

```go
import "fmt"                       // 标准库
import "github.com/gin-gonic/gin"  // 第三方
import myapp "github.com/x/y"      // 别名
import . "github.com/x/y"          // dot import，直接用导出名（少用）
import _ "github.com/lib/pq"       // 仅执行 init，不用（注册驱动常用）
```

---

## 十、常用标准库速查

| 库 | 用途 |
|----|------|
| `fmt` | 格式化 IO |
| `strings` / `strconv` | 字符串 / 类型转换 |
| `os` / `io` | 系统 IO、文件、环境变量 |
| `errors` | 错误创建与处理 |
| `log` / `log/slog` | 日志（1.21+ 推荐结构化 slog）|
| `time` | 时间 |
| `context` | 上下文、超时、取消 |
| `encoding/json` | JSON |
| `net/http` | HTTP 服务与客户端 |
| `sync` | 并发原语 |
| `testing` | 测试 |
| `strconv` / `unicode` | 字符处理 |

---

## 十一、小结

| 要点 | 说明 |
|------|------|
| 变量 | 包级用 `var`，函数内用 `:=` |
| 零值 | 没有"未初始化"，nil 是引用类型零值 |
| 类型转换 | 必须显式，无隐式转换 |
| 错误处理 | 显式返回 error，无 try-catch；用 `errors.Is/As` |
| defer | LIFO，参数立即求值，能改命名返回值 |
| 指针 | 无运算，GC 管理，首字母大写控制可见性 |
| for | 唯一循环，range 遍历 |
| switch | 默认不穿透，类型 switch 配合 interface |

> 下一篇：[Go 数据结构与指针](./data-structures.md)
