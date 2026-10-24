---
title: Go 标准库精选
icon: back-stage
category:
  - 后端
  - Golang
tag:
  - Golang
  - 标准库
---

# Go 标准库精选

Go 生态的哲学是「**电池 Included，但克制**」：标准库直接覆盖 80% 的日常需求——HTTP 服务、JSON、时间、IO、并发原语全内置，且跨平台零配置。会标准库有两个直接收益：**看懂框架在替你做什么**（Gin 是 net/http 的包装）、**少拉依赖**（每个三方库都是供应链风险）。本篇按使用频率精选最常用的一批。

---

## 一、fmt：格式化 IO

```go
// Printf 动词速查
fmt.Printf("%d %s %t\n", 42, "str", true)  // 常规
fmt.Printf("%v\n", user)                    // 默认格式（struct 打字段值）
fmt.Printf("%+v\n", user)                   // 带字段名 —— 调试神器
fmt.Printf("%#v\n", user)                   // Go 语法表示（可复制回代码）
fmt.Printf("%T\n", user)                    // 类型
fmt.Printf("%q\n", "hi")                    // 带引号字符串
fmt.Printf("%x\n", 255)                     // 十六进制 ff
fmt.Printf("%.2f\n", 3.14159)               // 3.14
fmt.Printf("%w", err)                       // error 包装（详见错误处理篇）
fmt.Printf("%p\n", &x)                      // 指针地址
```

**扫描**：`fmt.Sscan` 从字符串解析，`fmt.Sscanf` 带格式解析——轻量场景不必上正则：

```go
var name string
var age int
fmt.Sscan("fan 18", &name, &age) // name="fan", age=18
```

## 二、strings / strconv：字符串双雄

```go
import "strings"

// 判定（全部不会 panic，空串安全）
strings.Contains("hello", "ell")     // true
strings.HasPrefix("main.go", "main") // true
strings.EqualFold("Go", "go")        // true（忽略大小写，比 lower 后比较高效）

// 切分与合并
strings.Split("a,b,c", ",")          // [a b c]
strings.Join([]string{"a","b"}, "-") // "a-b"
strings.Fields("  a  b  c  ")        // [a b c]（按任意空白切，压空格）

// 修剪与替换
strings.TrimSpace("  hi  ")          // "hi"
strings.Trim(s, "\r\n")              // 去两端指定字符集
strings.ReplaceAll("a-b-c", "-", "+")
strings.Repeat("ab", 3)              // "ababab"

// strings.Builder：循环拼接必用（+= 每次都分配+拷贝，O(n²)）
var b strings.Builder
for _, s := range parts {
  b.WriteString(s)
}
result := b.String()
```

```go
import "strconv"

strconv.Itoa(42)                    // int → string（不是 string(42)！那是 rune 转换）
strconv.Atoi("42")                  // string → int (int, error)
strconv.ParseFloat("3.14", 64)
strconv.FormatFloat(3.14, 'f', 2, 64)
strconv.ParseBool("true")
```

::: warning `string(42)` 不是 "42"
`string(42)` 把 42 当 rune（'*'），得到 `"*"`。数字转字符串永远用 `strconv.Itoa`。
:::

## 三、slices / maps（Go 1.21+）：泛型容器操作

以前要自己写或拉三方库（`slices.Contains` 时代 go-funk/lodash 风），现在标准库全有：

```go
import "slices"

nums := []int{3, 1, 4, 1, 5}

slices.Contains(nums, 4)             // true
slices.Index(nums, 1)                // 1（找不到 -1）
slices.Sort(nums)                    // 原地排序 [1 1 3 4 5]
slices.SortFunc(users, func(a, b User) int { // 自定义比较
  return strings.Compare(a.Name, b.Name)
})
slices.Reverse(nums)
slices.Max(nums) / slices.Min(nums)
slices.Clone(nums)                   // 浅拷贝（防 append 共享底层数组）
slices.Equal(a, b)
slices.BinarySearch(sorted, 4)       // 二分（先 Sort）

// 函数式三件套
slices.Delete(nums, 0, 2)            // 删除 [0,2) 元素
```

```go
import "maps"

m := map[string]int{"a": 1, "b": 2}
m2 := maps.Clone(m)                  // 拷贝
maps.Copy(dst, src)                  // 批量合并（src 覆盖同键）
```

老代码里的 `sort.Ints / sort.Slice` 仍可用，新代码优先 `slices`（泛型、更快、API 全）。

## 四、time：时间的所有雷区

```go
// 获取
now := time.Now()                    // 带时区
t := time.Date(2026, 9, 8, 10, 0, 0, 0, time.Local)

// 格式化：Go 的怪设计——用「参考时间」当模板（2006-01-02 15:04:05 记忆：01/02 03:04:05 2006）
t.Format("2006-01-02 15:04:05")      // "2026-09-08 10:00:00"
t.Format(time.RFC3339)               // "2026-09-08T10:00:00+08:00"
t.Format("2006-01-02")               // 只取日期

// 解析（第二参是格式不是输入！和别的语言相反）
time.Parse("2006-01-02", "2026-09-08")
time.Parse(time.RFC3339, "2026-09-08T10:00:00+08:00")

// 运算
diff := time.Since(start)            // time.Duration
t.Add(24 * time.Hour)
deadline.Add(-30 * time.Minute)

// Duration 是 int64 纳秒
time.Second / time.Millisecond / time.Microsecond
fmt.Println(diff.Seconds())          // float 秒
time.Sleep(2 * time.Second)
```

**三大纪律**：

1. **存库与传输用 UTC + RFC3339**，展示时再转本地时区
2. 计时别用 `time.Now()` 相减的外部时钟（会被 NTP 跳变影响），**测耗时用 `time.Since(start)` 已经是这个用途**；更高精度要求 monotonic 时钟 Go 已自动内嵌（Now 返回值含单调时钟，Since 自动使用）
3. ticker 记得 `defer ticker.Stop()`（见[并发篇](./concurrency.md)）

## 五、io：一切流抽象的根

```go
// io.Reader / io.Writer 是 Go 最核心的两个接口
type Reader interface { Read(p []byte) (n int, err error) }
type Writer interface { Write(p []byte) (n int, err error) }

// 文件、网络连接、HTTP body、压缩流、数据库 blob…… 全是 Reader/Writer
// 于是它们可以任意组合（装饰器模式的语言级实现）
```

```go
import (
  "io"
  "os"
)

// 读文件
data, err := os.ReadFile("config.yaml")        // 小文件一把读
f, err := os.Open("big.log")                   // 大文件流式读
defer f.Close()
buf := make([]byte, 4096)
for {
  n, err := f.Read(buf)
  if err == io.EOF { break }
  process(buf[:n])
}

// 写文件
err := os.WriteFile("out.txt", data, 0644)
w, _ := os.Create("log.txt")
defer w.Close()

// 万能拷贝（io.Copy 管缓冲，别手动分配）
io.Copy(dst, src)                  // 文件→网络、流→文件，全都它

// 一行读完整个 Reader（HTTP body 常用）
body, err := io.ReadAll(resp.Body)

// 便捷组合
io.LimitReader(r, 1<<20)           // 最多读 1MB（防恶意大 body）
io.MultiWriter(f, os.Stdout)       // 同时写文件和标准输出（tee）
```

** bufio**：带缓冲的读写，`Scanner` 逐行是刚需：

```go
import "bufio"

scanner := bufio.NewScanner(f)
scanner.Buffer(make([]byte, 1024*1024), 1024*1024) // 行超 64KB 必须扩容（默认会悄悄截断）
for scanner.Scan() {
  line := scanner.Text()
  _ = line
}
err := scanner.Err() // Scan() 只返回 bool，错误要最后取
```

## 六、encoding/json

```go
type User struct {
  Name  string `json:"name"`           // 序列化后的键名
  Email string `json:"email,omitempty"` // 零值时省略
  Age   int    `json:"-"`               // 永不序列化（密码字段）
  Addr  string `json:"address"`         // 键名不一致的映射
}

// 序列化 / 反序列化
b, err := json.Marshal(user)               // 无缩进
b, _ := json.MarshalIndent(user, "", "  ") // 带缩进（调试/落盘）

var u User
err := json.Unmarshal(data, &u)            // 必须传指针

// 动态 JSON（结构未知）
var any map[string]any
json.Unmarshal(data, &any)                 // 数字会变 float64（经典坑）
name := any["name"].(string)               // 类型断言

// 流式（大 body 不走内存双份）
err := json.NewDecoder(resp.Body).Decode(&u)
enc := json.NewEncoder(w)
enc.Encode(user)
```

::: tip 精度坑：float64
`json.Unmarshal` 到 `any` 时所有数字都是 `float64`——大 int64（如订单号 12233344445555666）会丢精度。对策：定义具体 struct、用 `json.Number`（`Decoder.UseNumber()`）、或数字键值全走 string。
:::

## 七、net/http：最小 Web 服务器

```go
func main() {
  // handler 就是一个接口：ServeHTTP(ResponseWriter, *Request)
  // 任何 struct 实现它即可挂载 —— Gin 的 Engine 实现的正是这个
  http.HandleFunc("/hello", func(w http.ResponseWriter, r *http.Request) {
    name := r.URL.Query().Get("name")
    fmt.Fprintf(w, "hello, %s", name)
  })

  srv := &http.Server{
    Addr:         ":8080",
    ReadTimeout:  5 * time.Second,
    WriteTimeout: 10 * time.Second,
  }
  log.Fatal(srv.ListenAndServe())
}
```

```go
// 客户端：http.Get 一行版
resp, err := http.Get("https://httpbin.org/get")
defer resp.Body.Close() // 必须关，否则连接泄漏
body, _ := io.ReadAll(resp.Body)

// 带控制版
req, _ := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(payload))
req.Header.Set("Content-Type", "application/json")
client := &http.Client{Timeout: 10 * time.Second} // 默认 Client 无超时！
resp, err := client.Do(req)
```

**认识 ServerMux（Go 1.22+）**：标准库路由已支持方法与路径参数（`mux.HandleFunc("GET /users/{id}", h)`，`r.PathValue("id")`）——简单服务不用框架也够用。Gin 的路由树、中间件链是其超集。

## 八、其他高频速查

```go
// os：环境变量与退出
os.Getenv("PORT")                    // 缺省返回 ""
port := os.Getenv("PORT"); if port == "" { port = "8080" }
os.Exit(1)                           // 立即退出（defer 不执行！）

// sync：并发原语（详见并发篇）
var mu sync.Mutex
mu.Lock(); defer mu.Unlock()

var wg sync.WaitGroup
wg.Add(1); go func(){ defer wg.Done(); work() }(); wg.Wait()

var once sync.Once
once.Do(initFn)                      // 全局只执行一次

// atomic：无锁计数
var n atomic.Int64
n.Add(1); n.Load()

// path/filepath：跨平台路径（永远别拼 "/"）
filepath.Join("data", "logs", "a.log")  // Windows 自动变 data\logs\a.log
filepath.Ext("a.tar.gz")                // ".gz"
filepath.Base("/a/b/c.txt")             // "c.txt"

// regexp：够用就好（语法子集 RE2，保证线性时间，无回溯爆炸）
re := regexp.MustCompile(`^(\d{4})-(\d{2})-(\d{2})$`)
m := re.FindStringSubmatch("2026-09-08")  // [2026-09-08 2026 09 08]

// embed（1.16+）：把静态资源打进二进制
//go:embed static/*
var staticFS embed.FS
```

## 九、小结：标准库雷达图

| 模块 | 一句话 |
| ---- | ---- |
| `fmt` / `strconv` | 格式化与类型转换；`%+v` 调试、`Itoa/Atoi` 转换 |
| `strings` / `slices` / `maps` | 字符串与容器操作全覆盖，先查标准库再想三方 |
| `time` | 参考时间格式串；UTC 存储；Duration 是纳秒 int64 |
| `io` / `bufio` | Reader/Writer 万物皆流；`io.Copy`、`Scanner` 逐行 |
| `encoding/json` | tag 控制；`any` 里数字是 float64 |
| `net/http` | Client 必设 Timeout；1.22 路由支持参数；框架是它的包装 |
| `sync` / `atomic` | 并发原语，详见[并发篇](./concurrency.md) |

**习惯**：写代码前花 30 秒查 pkg.go.dev 搜标准库有没有——大概率有，而且被几十亿行生产代码验证过。

配套阅读：[并发篇](./concurrency.md)（sync/context 深入）、[Gin 深度指南](./gin.md)（框架与 net/http 的关系）、[测试篇](./testing.md)。
