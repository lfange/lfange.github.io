---
title: Go 数据结构与指针
icon: back-stage
category:
  - 后端
  - Golang
tag:
  - Golang
  - 数据结构
  - slice
  - map
---

# Go 数据结构与指针

> 深入 Go 核心数据结构：数组、slice（重点，坑最多）、map、struct，以及指针与 JSON 处理。slice 底层原理是面试与实战的高频考点。

---

## 一、数组 Array

数组是**固定长度**、同类型的序列。长度是类型的一部分。

```go
var a [3]int              // [0 0 0]
b := [3]int{1, 2, 3}
c := [...]int{4, 5, 6}    // 长度由初始化推断 -> [3]int

fmt.Println(len(a))       // 3

// [3]int 和 [5]int 是不同类型，不能互相赋值
```

### 数组是值类型

```go
arr := [3]int{1, 2, 3}
modify(arr)
fmt.Println(arr)   // [1 2 3]，没变！传的是副本

func modify(a [3]int) {
    a[0] = 99
}
```

**重要**：Go 数组是值类型，赋值和传参都会**整体拷贝**。所以实际开发中很少直接用数组，**几乎都用 slice**。

---

## 二、Slice 切片（核心）

slice 是对底层数组的"动态视图"，是 Go 中最常用的序列类型。

### 2.1 底层结构

```go
type slice struct {
    array unsafe.Pointer  // 指向底层数组
    len   int             // 当前长度
    cap   int             // 容量（底层数组从 array 起的可用空间）
}
```

```
slice: [ptr | len=3 | cap=5]
              ↓
底层数组: [1][2][3][·][·]
              ← len →
              ←——— cap ———→
```

### 2.2 创建

```go
// 1. 字面量
s := []int{1, 2, 3}

// 2. make（推荐：明确 len/cap）
s := make([]int, 3)        // len=3, cap=3，元素为零值
s := make([]int, 3, 5)     // len=3, cap=5

// 3. 从数组切片
arr := [5]int{1, 2, 3, 4, 5}
s := arr[1:4]              // [2 3 4]，左闭右开

// 4. new（少用）
s := new([]int)            // *[]int，值为 nil
```

### 2.3 基本操作

```go
s := []int{1, 2, 3}
s = append(s, 4)            // [1 2 3 4]
s = append(s, 5, 6)         // [1 2 3 4 5 6]
s = append(s, []int{7, 8}...)  // 追加切片

len(s)                      // 8
cap(s)                      // 容量

// 切片（共享底层数组！）
sub := s[1:3]               // [2 3]

// 删除索引 i
i := 2
s = append(s[:i], s[i+1:]...)  // 删除第 i 个

// 复制
dst := make([]int, len(s))
copy(dst, s)
```

### 2.4 扩容机制

`append` 超过 cap 时会重新分配更大的底层数组，拷贝旧数据。扩容规则（Go 1.18+）：

- 原 cap < 256：新 cap ≈ 2 倍。
- 原 cap ≥ 256：新 cap ≈ 1.25 倍增长，趋向 1.25。
- 最终还要按元素大小、内存对齐调整。

```go
s := make([]int, 0)
for i := 0; i < 10; i++ {
    s = append(s, i)
    fmt.Printf("len=%d cap=%d\n", len(s), cap(s))
}
// 输出可见 cap 阶跃式增长：1 2 4 4 8 8 8 8 16 16
```

**性能要点**：已知大小务必 `make([]T, 0, n)` 预分配，避免多次扩容拷贝。

### 2.5 slice 的坑（高频面试）

#### 坑 1：切片共享底层数组

```go
a := []int{1, 2, 3, 4, 5}
b := a[1:3]        // b = [2 3]，与 a 共享底层数组
b[0] = 99
fmt.Println(a)     // [1 99 3 4 5]  ← a 被改了！
```

#### 坑 2：append 可能不共享

```go
a := make([]int, 3, 3)   // [0 0 0], cap=3
b := a[:2]               // [0 0], cap=3
b = append(b, 1)         // 写入 a 的第 3 个位置，a 变 [0 0 1]
b = append(b, 2)         // cap 不够，b 扩容到新数组，a 不再受影响
```

判断是否共享很烧脑，**安全做法**：需要独立副本就用 `copy` 或完整切片表达式。

#### 坑 3：完整切片表达式 `a[low:high:max]`

```go
a := []int{1, 2, 3, 4, 5}
b := a[1:3:3]      // len=2, cap=2（max=3，cap=max-low=2）
b = append(b, 9)   // cap=2 不够，b 扩容到新数组，不影响 a
```

用 `a[low:high:max]` 限制 cap，避免 append 污染原数组。

#### 坑 4：大切片内存泄漏

```go
// 场景：从大数组切一小片并长期持有
big := make([]byte, 1<<20)   // 1MB
small := big[:10]            // 只用 10 字节
// big 整个 1MB 底层数组无法被 GC，因为 small 还引用着！
```

解决：拷贝出来。

```go
small := make([]byte, 10)
copy(small, big[:10])
```

#### 坑 5：for range 的值是副本

```go
type User struct{ Name string }
users := []User{{"a"}, {"b"}}
for _, u := range users {
    u.Name = "x"   // 改的是副本 u，原 slice 不变
}
fmt.Println(users)   // [{a} {b}]

// 正确改法 1：用索引
for i := range users {
    users[i].Name = "x"
}
// 正确改法 2：Go 1.22+ range 自带循环变量，但仍需注意 u 是值拷贝
```

#### 坑 6：nil slice vs empty slice

```go
var s1 []int          // nil slice: ptr=nil, len=0, cap=0
s2 := []int{}         // empty slice: ptr!=nil, len=0, cap=0

len(s1) == len(s2)    // 都 0
s1 == nil             // true
s2 == nil             // false

// 两者都能 append、range，行为一致
// JSON 编码：nil -> null，empty -> []
```

#### 坑 7：循环变量捕获（1.22 前经典）

```go
// Go 1.21 及之前
for _, v := range items {
    go func() { fmt.Println(v) }()  // 全打印最后一个 v！
}
// 修复（1.22 前）：传参
for _, v := range items {
    v := v   // 或 func(v T)
    go func() { fmt.Println(v) }()
}
// Go 1.22+ 修复了：每次迭代 v 是新变量，不再共享
```

---

## 三、Map

map 是无序的哈希表，引用类型。

### 3.1 创建与基本操作

```go
// 1. make
m := make(map[string]int)
m["a"] = 1
m["b"] = 2

// 2. 字面量
m := map[string]int{"a": 1, "b": 2}

// 3. var（nil map，只能读，不能写）
var m map[string]int   // nil
fmt.Println(m["a"])    // 0（零值，不报错）
m["a"] = 1             // panic: assignment to entry in nil map！

// 操作
v := m["a"]            // 取值，不存在返回零值
v, ok := m["a"]        // comma-ok 模式，ok=false 表示不存在
delete(m, "a")
len(m)

// 遍历（无序！）
for k, v := range m {
    fmt.Println(k, v)
}
```

### 3.2 map 的坑

#### 坑 1：并发读写 panic

```go
m := make(map[int]int)
go func() { for { m[1] = 1 } }()
go func() { for { _ = m[1] } }()   // fatal error: concurrent map read and map write
```

map **不是并发安全的**，并发读写会直接 panic（不是数据错乱，是致命错误）。并发场景用 `sync.Map` 或加锁（见并发篇）。

#### 坑 2：遍历顺序不确定

每次 range map 顺序可能不同（Go 故意随机化，防止依赖顺序）。需要有序结果，先取 key 排序：

```go
keys := make([]string, 0, len(m))
for k := range m { keys = append(keys, k) }
sort.Strings(keys)
for _, k := range keys { fmt.Println(k, m[k]) }
```

#### 坑 3：取值的 value 不可寻址

```go
m := map[string]User{"a": {"name"}}
m["a"].Name = "b"   // 编译错误：cannot assign to struct field
// 因为 map value 可能随扩容移动，不可寻址
// 修复：整体赋值
u := m["a"]
u.Name = "b"
m["a"] = u
// 或用指针 map
m := map[string]*User{"a": {}}
m["a"].Name = "b"   // OK
```

#### 坑 4：大 map 删除不释放内存

`delete` 只清空条目，底层数组不缩容。map 占用的内存只增不减。需要彻底释放：

```go
m = make(map[string]int)   // 重新分配，旧的等 GC
// 或 m = nil
```

---

## 四、Struct 结构体

### 4.1 定义与使用

```go
type User struct {
    ID   int
    Name string
    Email string
}

// 创建
u1 := User{ID: 1, Name: "a"}    // 按字段名（推荐）
u2 := User{1, "a", ""}          // 按顺序（脆弱，少用）
u3 := &User{ID: 1}              // 指针

// 访问与修改
u1.Name = "b"
u3.Name = "c"   // 指针也用 . 访问，Go 自动解引用

// 嵌套（组合，Go 没有继承）
type Admin struct {
    User           // 匿名字段，提升 User 的字段
    Role string
}
admin := Admin{User: User{ID: 1}, Role: "admin"}
admin.Name        // 直接访问提升字段
admin.User.Name   // 也可显式
```

### 4.2 结构体标签（tag）

用反引号标注元信息，常用于 JSON、ORM、校验：

```go
type User struct {
    ID    int    `json:"id" gorm:"primaryKey"`
    Name  string `json:"name" validate:"required"`
    Email string `json:"email,omitempty"`   // omitempty: 空值不输出
    Pass  string `json:"-"`                  // - : 不序列化
}
```

### 4.3 方法

```go
type User struct{ Name string }

// 值接收者
func (u User) Greet() string {
    return "hi " + u.Name
}

// 指针接收者（可修改字段，大结构体避免拷贝）
func (u *User) Rename(name string) {
    u.Name = name
}

u := &User{Name: "a"}
u.Rename("b")        // Go 自动取地址
u.Greet()            // 自动解引用
```

### 4.4 值接收者 vs 指针接收者

| 维度 | 值接收者 `func (u User)` | 指针接收者 `func (u *User)` |
|------|------------------------|--------------------------|
| 修改字段 | 否（副本）| 是 |
| 拷贝开销 | 每次拷贝整个结构 | 只拷贝指针 |
| 方法集 | T 的方法集 | T 和 *T 的方法集（接口实现相关）|

**原则**：同一类型的方法集**统一**用值或指针，不要混。一般小且不可变的用值，其余用指针。

### 4.5 结构体比较

- 所有字段都可比较的结构体，本身可比较（可用作 map key、`==`）。
- 含 slice / map / function 字段的结构体**不可比较**，`==` 编译错误。

```go
type Point struct{ X, Y int }
p1 := Point{1, 2}
p2 := Point{1, 2}
p1 == p2   // true
m := map[Point]string{p1: "a"}   // 可作 key
```

### 4.6 空结构体 `struct{}`

零内存占用，常用于信号通道、set 实现：

```go
var x struct{}        // 不占内存
set := make(map[string]struct{})
set["a"] = struct{}{}
_, ok := set["a"]     // set 判断存在

done := make(chan struct{})   // 信号通道
```

---

## 五、指针深入

### 5.1 何时必须用指针

1. 方法需要修改接收者状态。
2. 结构体大，避免拷贝开销。
3. 需要修改函数参数（如 `*int` 出参）。
4. 一致性：类型一旦有指针方法，新增方法也用指针。

### 5.2 值传递的本质

Go **所有传参都是值拷贝**，包括指针--拷贝的是指针的副本（指向同一地址）。

```go
func modify(s []int) {
    s[0] = 99          // 改底层数组，外部可见（slice 头拷贝，但 ptr 同）
    s = append(s, 1)   // 改的是 s 副本的头，外部不可见
}
```

### 5.3 逃逸分析

编译器决定变量分配在栈还是堆：

```go
func newInt() *int {
    x := 1
    return &x   // x 逃逸到堆（返回了局部变量地址）
}
```

栈分配快（无需 GC），堆分配需 GC 回收。`go build -gcflags="-m"` 可看逃逸分析结果。详见[高阶篇](./advanced.md)。

### 5.4 不要返回局部变量的"引用"

```go
// 错误：返回局部 slice 的元素指针，slice 底层可能随扩容失效（实际 Go 会逃逸到堆，安全但不推荐）
func bad() *int {
    s := []int{1, 2, 3}
    return &s[0]
}
```

虽然 Go 会逃逸处理不会野指针，但语义混乱，避免这种写法。

---

## 六、JSON 处理

### 6.1 序列化 / 反序列化

```go
type User struct {
    ID   int    `json:"id"`
    Name string `json:"name"`
    Email string `json:"email,omitempty"`
}

u := User{ID: 1, Name: "a"}

// 序列化
data, err := json.Marshal(u)
data, err = json.MarshalIndent(u, "", "  ")   // 带缩进

// 反序列化
var u2 User
err = json.Unmarshal(data, &u2)
```

### 6.2 tag 选项

| tag | 作用 |
|-----|------|
| `json:"name"` | 字段映射为 name |
| `json:"-"` | 忽略该字段 |
| `json:",omitempty"` | 零值不输出 |
| `json:"name,string"` | 数字字段输出为字符串 |
| `json:",inline"` | 嵌套结构体字段提升（需第三方支持）|

### 6.3 动态 JSON

```go
// map[string]interface{}
var m map[string]interface{}
json.Unmarshal(data, &m)
name := m["name"].(string)   // 类型断言，有风险

// 更安全：定义结构体
```

### 6.4 常见坑

#### 坑 1：字段未导出无法序列化

```go
type User struct {
    name string   // 小写，json 看不到，序列化结果为 {}
}
```

#### 坑 2：时间格式

`time.Time` 默认序列化为 RFC3339 字符串（`2006-01-02T15:04:05Z07:00`）。自定义需实现 `MarshalJSON`。

#### 坑 3：数字精度丢失

JSON 数字默认按 `float64` 解析，大整数会丢精度。用 `json.Number`：

```go
dec := json.NewDecoder(bytes.NewReader(data))
dec.UseNumber()
var m map[string]interface{}
dec.Decode(&m)
n := m["id"].(json.Number).String()
```

#### 坑 4：nil slice vs empty slice

```go
var s []int            // nil
json.Marshal(s)        // -> null
s2 := []int{}          // empty
json.Marshal(s2)       // -> []
```

前端常常期望 `[]` 而非 `null`，初始化用 `make([]T, 0)`。

---

## 七、常用容器与技巧

### 7.1 Set 实现

Go 没有 set，用 `map[T]struct{}`：

```go
type Set[T comparable] map[T]struct{}   // Go 1.18+ 泛型

func NewSet[T comparable]() Set[T] { return make(Set[T]) }
func (s Set[T]) Add(v T)        { s[v] = struct{}{} }
func (s Set[T]) Has(v T) bool   { _, ok := s[v]; return ok }
func (s Set[T]) Delete(v T)     { delete(s, v) }
```

### 7.2 优先队列：container/heap

```go
import "container/heap"

type IntHeap []int
func (h IntHeap) Len() int           { return len(h) }
func (h IntHeap) Less(i, j int) bool { return h[i] < h[j] }
func (h IntHeap) Swap(i, j int)      { h[i], h[j] = h[j], h[i] }
func (h *IntHeap) Push(x any)        { *h = append(*h, x.(int)) }
func (h *IntHeap) Pop() any {
    old := *h; n := len(old); x := old[n-1]; *h = old[:n-1]; return x
}

h := &IntHeap{2, 1, 5}
heap.Init(h)
heap.Push(h, 3)
heap.Pop(h)   // 1
```

### 7.3 链表：container/list

双向链表，O(1) 插入删除：

```go
import "container/list"
l := list.New()
e := l.PushBack(1)
l.PushFront(0)
l.InsertAfter(2, e)
l.Remove(e)
```

---

## 八、小结

| 结构 | 值/引用 | 关键点 |
|------|---------|--------|
| 数组 | 值 | 固定长度，长度是类型一部分，传参拷贝 |
| slice | 引用（头是值）| 底层数组共享、扩容、append 可能换底层数组 |
| map | 引用 | 无序、nil 不可写、并发不安全、删不缩容 |
| struct | 值 | tag 元信息、值/指针方法、组合代替继承 |
| 指针 | - | 无运算、GC 管理、逃逸分析决定栈堆 |

**核心记忆**：slice 三大坑（共享底层数组、append 扩容换数组、大切片内存泄漏）、map 三大坑（并发 panic、无序、删不缩容）。

> 下一篇：[Go 并发编程](./concurrency.md)
