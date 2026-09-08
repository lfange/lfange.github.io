---
title: Go 测试
icon: back-stage
category:
  - 后端
  - Golang
tag:
  - Golang
  - 测试
  - pytest
---

# Go 测试

Go 把测试做成了**语言级一等公民**：`go test` 内置于工具链，测试文件与源码同目录，命名约定即框架。没有注解、没有反射魔法——一个测试就是一个普通函数。本篇覆盖单元测试、表驱动、基准测试（benchmark 在[高阶篇](./advanced.md)有性能视角，这里补齐测试视角）、testify、mock、HTTP 测试与模糊测试。

---

## 一、第一个测试：命名约定即框架

```go
// add.go
func Add(a, b int) int { return a + b }
```

```go
// add_test.go —— 与源文件同目录，名字必须是 xxx_test.go
package main

import "testing"

// 测试函数签名固定：func TestXxx(t *testing.T)
func TestAdd(t *testing.T) {
  got := Add(1, 2)
  want := 3
  if got != want {
    t.Errorf("Add(1, 2) = %d; want %d", got, want) // Errorf 记录失败但继续
    // t.Fatalf(...)                                 // Fatalf 记录失败并终止本函数
  }
}
```

```bash
go test ./...           # 当前模块全部包
go test -v              # 显示每个用例（默认只显示失败）
go test -run TestAdd    # 只跑名字匹配的用例（支持正则：-run 'TestAdd|TestSub'）
go test -cover          # 覆盖率
go test -coverprofile=c.out && go tool cover -html=c.out   # 覆盖率可视化
go test -count=1        # 禁用缓存强制重跑（结果缓存是默认行为）
```

**测试文件里可以写 `package main`（同包测试，能测未导出函数）或 `package main_test`（外部包，只能测导出 API）**——前者查 bug，后者验证契约。

## 二、表驱动测试：Go 的招牌模式 ⭐

一个函数的多种输入输出写成「用例表」，循环断言——新增用例只加一行：

```go
func TestAdd(t *testing.T) {
  tests := []struct {
    name string
    a, b int
    want int
  }{
    {"both positive", 1, 2, 3},
    {"both negative", -1, -2, -3},
    {"mixed sign", -1, 1, 0},
    {"zero", 0, 0, 0},
  }

  for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) { // 子测试：失败时单独定位
      if got := Add(tt.a, tt.b); got != tt.want {
        t.Errorf("Add(%d, %d) = %d; want %d", tt.a, tt.b, got, tt.want)
      }
    })
  }
}
```

运行单个子测试：`go test -run TestAdd/mixed_sign`。表驱动 + 子测试是 Go 社区的绝对主流写法。

## 三、testify：让断言体面起来

标准库的 `if got != want` 啰嗦，testify 提供 assert/require：

```go
import (
  "github.com/stretchr/testify/assert"
  "github.com/stretchr/testify/require"
)

func TestAdd(t *testing.T) {
  assert.Equal(t, 3, Add(1, 2))    // 失败记录但继续（可多个断言都看结果）
  assert.NotEqual(t, 4, Add(1, 2))

  u, err := GetUser(1)
  require.NoError(t, err)          // 失败立刻终止（err 不对后面必然 panic）
  assert.Equal(t, "fan", u.Name)
  assert.True(t, u.Active)
  assert.ErrorIs(t, err, ErrNotFound) // 包装错误判断，同 errors.Is
}
```

**assert vs require 的分工**：前置条件（err 为 nil）用 require，业务断言用 assert。

## 四、mock：接口是 mock 的前提

### 4.1 为什么 Go 好 mock

Go 的隐式接口让「依赖」天然可替换——**只要你的 Service 依赖的是接口而不是 `*gorm.DB`**：

```go
// service 依赖接口（生产实现：GORM；测试替身：手写 mock）
type UserRepo interface {
  Find(id int) (*User, error)
}

type UserService struct {
  repo UserRepo
}

func (s *UserService) GetProfile(id int) (*Profile, error) {
  u, err := s.repo.Find(id)
  if err != nil {
    return nil, fmt.Errorf("get profile: %w", err)
  }
  return &Profile{Name: u.Name}, nil
}
```

### 4.2 手写 stub：小场景最优解

```go
type stubRepo struct {
  user *User
  err  error
}

func (s *stubRepo) Find(id int) (*User, error) {
  return s.user, s.err
}

func TestGetProfile_NotFound(t *testing.T) {
  svc := &UserService{repo: &stubRepo{err: ErrUserNotFound}}
  _, err := svc.GetProfile(42)
  assert.ErrorIs(t, err, ErrUserNotFound)
}
```

### 4.3 gomock / mockery：大项目自动生成

接口方法多了以后手写累，用 mockery 从接口生成 mock：

```go
//go:generate mockery --name=UserRepo
type UserRepo interface { ... }
```

```go
func TestGetProfile(t *testing.T) {
  ctrl := gomock.NewController(t)
  repo := mocks.NewMockUserRepo(ctrl)

  repo.EXPECT().
    Find(42).                              // 期望以参数 42 被调用
    Return(&User{Name: "fan"}, nil)        // 返回值
    .Times(1)                              // 调用次数（缺省恰好一次）

  svc := &UserService{repo: repo}
  p, err := svc.GetProfile(42)
  require.NoError(t, err)
  assert.Equal(t, "fan", p.Name)
  // ctrl 验证：未按 EXPECT 调用（次数/参数不符）→ 测试失败
}
```

### 4.4 sqlmock：不碰真库测 SQL 层

```go
import "github.com/DATA-DOG/go-sqlmock"

db, mock, _ := sqlmock.New()
// 期望一条 SQL 并给出返回行
mock.ExpectQuery("SELECT id, name FROM users WHERE id = ?").
  WithArgs(42).
  WillReturnRows(sqlmock.NewRows([]string{"id", "name"}).AddRow(42, "fan"))

var u User
gormDB, _ := gorm.Open(mysql.New(mysql.Config{Conn: db}), &gorm.Config{})
gormDB.First(&u, 42)
// 断言所有期望都被满足
assert.NoError(t, mock.ExpectationsWereMet())
```

**分层策略**：Repository 层用真库（docker 起一次性 MySQL/SQLite 内存库）做集成测试；Service 层用 mock 隔离 DB——单元测试快而稳，集成测试少而真。

## 五、HTTP 测试：测 Gin handler 不起端口

### 5.1 httptest 标准姿势

```go
func TestPingRoute(t *testing.T) {
  router := setupRouter() // 你的路由注册函数

  w := httptest.NewRecorder()                  // 假 ResponseWriter
  req := httptest.NewRequest("GET", "/ping", nil)
  router.ServeHTTP(w, req)                     // 直接调用，不监听端口、不走网络

  assert.Equal(t, 200, w.Code)
  assert.Contains(t, w.Body.String(), "pong")
}

func TestCreateUser(t *testing.T) {
  body := `{"name":"fan","email":"a@b.com"}`
  req := httptest.NewRequest("POST", "/api/v1/users", strings.NewReader(body))
  req.Header.Set("Content-Type", "application/json")
  w := httptest.NewRecorder()
  router.ServeHTTP(w, req)

  assert.Equal(t, 200, w.Code)
}
```

### 5.2 测试服务器（需要完整 URL 的场景，如测客户端）

```go
srv := httptest.NewServer(router) // 真实端口，可当上游服务
defer srv.Close()

resp, err := srv.Client().Get(srv.URL + "/ping")
```

## 六、基准测试与模糊测试

### 6.1 Benchmark

```go
func BenchmarkConcat(b *testing.B) {
  for b.Loop() { // Go 1.24+ 推荐写法（替代 for i := 0; i < b.N; i++）
    _ = strings.Join([]string{"a", "b", "c"}, "-")
  }
}
```

```bash
go test -bench=. -benchmem
# BenchmarkConcat-8   10000000    105 ns/op    48 B/op    2 allocs/op
#                     ↑次数        ↑单次耗时    ↑单次分配   ↑分配次数
```

对比两个实现时看 `ns/op` 与 `allocs/op`（后者常常是热点的元凶）。更多性能视角见[高阶篇](./advanced.md) benchmark 一节。

### 6.2 Fuzz 模糊测试（Go 1.18+）

让引擎自动生成海量随机输入轰炸解析函数，专抓 panic：

```go
func FuzzParseInt(f *testing.F) {
  f.Add("123")     // 种子用例（会作为回归用例常跑）
  f.Add("-1")
  f.Add("abc")

  f.Fuzz(func(t *testing.T, s string) {
    // 只要求「不 panic」：任何输入都不允许崩
    got, err := strconv.Atoi(s)
    if err == nil {
      _ = got + 1
    }
  })
}
```

```bash
go test -fuzz=FuzzParseInt -fuzztime=10s   # 随机轰炸 10 秒
# 发现崩溃 → 用例自动写入 testdata/fuzz/FuzzParseXxx，之后 go test 自动重放
```

适合解析器、序列化、任何「外部输入直接进来」的函数。

## 七、工程实践清单

**好测试的标准**（按优先级）：

1. **快**：全量单测秒级。慢的（真库、网络）划到集成测试，加 build tag 区分
2. **确定**：不依赖时间（注入 clock）、不依赖随机（注入 seed）、不依赖执行顺序
3. **失败即线索**：断言信息带输入与期望（表驱动的 t.Run 命名就是这个目的）
4. **测行为不测实现**：测 `Add(1,2)==3`，不测内部调了几次循环——实现重构测试不改

**目录与命令约定**：

```text
service/
├── user.go
├── user_test.go          # 同包单元测试
└── testdata/             # 测试夹具固定目录（go test 自动忽略）
    └── golden.json
```

**t.Cleanup 与 t.TempDir**：

```go
func TestWithDB(t *testing.T) {
  dir := t.TempDir() // 测试结束自动删除，零配置
  db, err := gorm.Open(sqlite.Open(filepath.Join(dir, "t.db")), nil)
  require.NoError(t, err)

  t.Cleanup(func() { // 测试结束自动执行（跨 defer 顺序更清晰）
    sqlDB, _ := db.DB()
    sqlDB.Close()
  })
}
```

**测试覆盖率的态度**：覆盖率是「没测到什么」的探测器，不是 KPI。核心业务逻辑高覆盖，胶水代码（main、配置装载）不必强求——**改代码后覆盖率下降的包先补测试再合并**。

## 八、小结

- 命名即框架：`xxx_test.go` + `func TestXxx(t *testing.T)` + `go test`
- **表驱动 + 子测试**是 Go 测试的标准形态，新用例只加一行
- testify：require 管前置，assert 管断言
- mock 的前提是依赖接口——这正是 Go 隐式接口的工程红利
- httptest 测 handler 不起端口；`b.Loop()` 跑基准；Fuzz 轰炸解析器
- 好测试三要素：快、确定、失败即线索

配套阅读：[项目架构篇](./project-layout.md)（分层测试与集成测试）、[高阶篇](./advanced.md)（benchmark 性能分析）、[错误处理篇](./error-handling.md)（测试错误分支）。
