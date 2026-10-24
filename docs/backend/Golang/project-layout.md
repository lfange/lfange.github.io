---
title: Go 项目框架与工程实践
icon: back-stage
category:
  - 后端
  - Golang
tag:
  - Golang
  - 项目结构
  - Gin
  - 工程实践
---

# Go 项目框架与工程实践

> 本文回答"Go 一般项目框架长什么样"。覆盖标准目录结构、分层架构、Gin + GORM 完整项目模板、配置/日志/中间件/统一响应/参数校验/错误处理，以及主流框架选型。

---

## 一、项目目录结构

Go 官方推荐 [Standard Go Project Layout](https://github.com/golang-standards/project-layout)，但并非强制。中小项目常用简化版：

```
myapp/
├── api/                  # 对外 API 定义（OpenAPI/swagger 文档）
├── cmd/                  # 主入口
│   └── server/
│       └── main.go       # 程序入口，只做初始化和启动
├── internal/             # 私有代码，Go 编译器禁止外部 import（关键！）
│   ├── config/           # 配置加载
│   ├── handler/          # HTTP 处理器（控制器层）
│   ├── service/          # 业务逻辑层
│   ├── repository/       # 数据访问层（DAO）
│   ├── model/            # 数据模型（DB 实体、DTO）
│   ├── middleware/       # 中间件
│   └── router/           # 路由注册
├── pkg/                  # 可被外部引用的公共库
│   └── logger/
├── configs/              # 配置文件（yaml 等）
├── migrations/           # 数据库迁移
├── scripts/              # 脚本
├── docs/                 # 文档（swagger 生成）
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

### 1.1 internal 目录（重要）

`internal/` 是 Go 编译器**特殊对待**的目录：其中的包**只能被该模块内的代码 import**，外部模块无法引用。这是封装内部实现的标准方式，**所有业务代码放 internal**。

### 1.2 cmd 放主入口

每个可执行程序一个子目录，`main.go` 只做"组装依赖、启动"，不写业务：

```go
// cmd/server/main.go
package main

func main() {
    cfg := config.Load()
    db := db.MustConnect(cfg.DB)
    r := router.New(db, cfg)
    r.Run(":8080")
}
```

### 1.3 pkg 放可复用库

`pkg/` 下的代码假设会被其他项目引用，要保证通用、稳定。内部业务代码不要放这里。

---

## 二、分层架构

Go Web 项目常用三层（或四层）架构：

```
HTTP 请求
   │
   ▼
Handler（控制器）  ── 参数校验、解析、统一响应
   │
   ▼
Service（业务）    ── 核心业务逻辑、事务编排
   │
   ▼
Repository（数据）  ── DB / 缓存 / RPC 访问
   │
   ▼
Model（模型）      ── 实体定义
```

**依赖方向**：Handler -> Service -> Repository -> Model，单向不回头。

**原则**：

- Handler 不直接操作 DB，只调 Service。
- Service 不感知 HTTP（不接收 `*gin.Context`），用纯 Go 类型。
- Repository 只管数据存取，不含业务判断。

这样 Service 可被 HTTP/gRPC/CLI/定时任务复用，且易测试。

---

## 三、Gin + GORM 项目模板

下面构建一个完整的用户增删改查服务。

### 3.1 目录

```
myapp/
├── cmd/server/main.go
├── internal/
│   ├── config/config.go
│   ├── model/user.go
│   ├── repository/user_repo.go
│   ├── service/user_service.go
│   ├── handler/user_handler.go
│   ├── middleware/recover.go
│   └── router/router.go
├── configs/config.yaml
└── go.mod
```

### 3.2 配置管理

用 `viper` 读取 yaml + 环境变量：

```go
// internal/config/config.go
package config

import "github.com/spf13/viper"

type Config struct {
    Server struct {
        Port string `mapstructure:"port"`
    }
    DB struct {
        DSN string `mapstructure:"dsn"`
    }
}

func Load() *Config {
    viper.SetConfigName("config")
    viper.SetConfigType("yaml")
    viper.AddConfigPath("./configs")
    viper.AutomaticEnv()   // 支持环境变量覆盖
    if err := viper.ReadInConfig(); err != nil {
        panic(err)
    }
    var c Config
    if err := viper.Unmarshal(&c); err != nil {
        panic(err)
    }
    return &c
}
```

`configs/config.yaml`：

```yaml
server:
  port: "8080"
db:
  dsn: "root:pass@tcp(127.0.0.1:3306)/myapp?charset=utf8mb4&parseTime=True&loc=Local"
```

### 3.3 模型

```go
// internal/model/user.go
package model

import "time"

type User struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `gorm:"size:50;not null" json:"name"`
    Email     string    `gorm:"size:100;uniqueIndex" json:"email"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

// DTO：请求/响应结构，与实体分离
type CreateUserReq struct {
    Name  string `json:"name" binding:"required,min=2,max=50"`
    Email string `json:"email" binding:"required,email"`
}

type UpdateUserReq struct {
    Name  *string `json:"name" binding:"omitempty,min=2,max=50"`
    Email *string `json:"email" binding:"omitempty,email"`
}
```

### 3.4 Repository 数据层

```go
// internal/repository/user_repo.go
package repository

import "myapp/internal/model"
import "gorm.io/gorm"

type UserRepo struct {
    db *gorm.DB
}

func NewUserRepo(db *gorm.DB) *UserRepo {
    return &UserRepo{db: db}
}

func (r *UserRepo) Create(u *model.User) error {
    return r.db.Create(u).Error
}

func (r *UserRepo) GetByID(id uint) (*model.User, error) {
    var u model.User
    if err := r.db.First(&u, id).Error; err != nil {
        return nil, err   // gorm.ErrRecordNotFound
    }
    return &u, nil
}

func (r *UserRepo) List(page, size int) ([]model.User, int64, error) {
    var users []model.User
    var total int64
    r.db.Model(&model.User{}).Count(&total)
    err := r.db.Offset((page - 1) * size).Limit(size).Find(&users).Error
    return users, total, err
}

func (r *UserRepo) Update(u *model.User) error {
    return r.db.Save(u).Error
}

func (r *UserRepo) Delete(id uint) error {
    return r.db.Delete(&model.User{}, id).Error
}
```

### 3.5 Service 业务层

```go
// internal/service/user_service.go
package service

import (
    "errors"
    "myapp/internal/model"
    "myapp/internal/repository"
)

var ErrUserNotFound = errors.New("user not found")

type UserService struct {
    repo *repository.UserRepo
}

func NewUserService(repo *repository.UserRepo) *UserService {
    return &UserService{repo: repo}
}

func (s *UserService) Create(req *model.CreateUserReq) (*model.User, error) {
    u := &model.User{Name: req.Name, Email: req.Email}
    if err := s.repo.Create(u); err != nil {
        return nil, err   // 唯一索引冲突等
    }
    return u, nil
}

func (s *UserService) Get(id uint) (*model.User, error) {
    u, err := s.repo.GetByID(id)
    if err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, ErrUserNotFound
        }
        return nil, err
    }
    return u, nil
}

// ... List / Update / Delete 类似
```

### 3.6 Handler 控制器层 + 统一响应

```go
// internal/handler/response.go
package handler

import "github.com/gin-gonic/gin"

type Response struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

func Success(c *gin.Context, data interface{}) {
    c.JSON(200, Response{Code: 0, Message: "ok", Data: data})
}

func Fail(c *gin.Context, code int, msg string) {
    c.JSON(200, Response{Code: code, Message: msg})
}
```

```go
// internal/handler/user_handler.go
package handler

import (
    "net/http"
    "strconv"
    "myapp/internal/model"
    "myapp/internal/service"
    "github.com/gin-gonic/gin"
)

type UserHandler struct {
    svc *service.UserService
}

func NewUserHandler(svc *service.UserService) *UserHandler {
    return &UserHandler{svc: svc}
}

func (h *UserHandler) Create(c *gin.Context) {
    var req model.CreateUserReq
    if err := c.ShouldBindJSON(&req); err != nil {
        Fail(c, 400, err.Error())
        return
    }
    u, err := h.svc.Create(&req)
    if err != nil {
        Fail(c, 500, err.Error())
        return
    }
    Success(c, u)
}

func (h *UserHandler) Get(c *gin.Context) {
    id, _ := strconv.ParseUint(c.Param("id"), 10, 64)
    u, err := h.svc.Get(uint(id))
    if err != nil {
        if errors.Is(err, service.ErrUserNotFound) {
            Fail(c, 404, err.Error())
            return
        }
        Fail(c, 500, err.Error())
        return
    }
    Success(c, u)
}

// ... List / Update / Delete
```

### 3.7 路由注册

```go
// internal/router/router.go
package router

import (
    "myapp/internal/handler"
    "myapp/internal/middleware"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func New(db *gorm.DB) *gin.Engine {
    r := gin.New()
    r.Use(gin.Logger(), middleware.Recover())

    // 依赖注入
    userRepo := repository.NewUserRepo(db)
    userSvc := service.NewUserService(userRepo)
    userH := handler.NewUserHandler(userSvc)

    api := r.Group("/api/v1")
    {
        api.POST("/users", userH.Create)
        api.GET("/users/:id", userH.Get)
        api.GET("/users", userH.List)
        api.PUT("/users/:id", userH.Update)
        api.DELETE("/users/:id", userH.Delete)
    }
    return r
}
```

### 3.8 main 入口

```go
// cmd/server/main.go
package main

import (
    "log"
    "myapp/internal/config"
    "myapp/internal/router"
    "gorm.io/driver/mysql"
    "gorm.io/gorm"
)

func main() {
    cfg := config.Load()

    db, err := gorm.Open(mysql.Open(cfg.DB.DSN), &gorm.Config{})
    if err != nil {
        log.Fatalf("db connect: %v", err)
    }
    if err := db.AutoMigrate(&model.User{}); err != nil {
        log.Fatalf("migrate: %v", err)
    }

    r := router.New(db)
    log.Printf("server on %s", cfg.Server.Port)
    if err := r.Run(":" + cfg.Server.Port); err != nil {
        log.Fatal(err)
    }
}
```

---

## 四、中间件

Gin 中间件是 `func(c *gin.Context)`，通过 `c.Next()` 串联。

### 4.1 Recovery 恢复 panic

```go
// internal/middleware/recover.go
package middleware

import (
    "net/http"
    "runtime/debug"
    "github.com/gin-gonic/gin"
)

func Recover() gin.HandlerFunc {
    return func(c *gin.Context) {
        defer func() {
            if r := recover(); r != nil {
                log.Printf("panic: %v\n%s", r, debug.Stack())
                c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
                    "code": 500, "message": "internal error",
                })
            }
        }()
        c.Next()
    }
}
```

### 4.2 日志

```go
func Logger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()
        log.Printf("%s %s %d %v",
            c.Request.Method, c.Request.URL.Path,
            c.Writer.Status(), time.Since(start))
    }
}
```

生产用 `zap` / `slog` 结构化日志，带 traceID。

### 4.3 CORS 跨域

```go
func Cors() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", c.GetHeader("Origin"))
        c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
        c.Header("Access-Control-Allow-Credentials", "true")
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }
        c.Next()
    }
}
```

或直接用 `github.com/gin-contrib/cors`。

### 4.4 JWT 鉴权

```go
func Auth(jwtSecret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.AbortWithStatusJSON(401, gin.H{"message": "no token"})
            return
        }
        claims, err := parseJWT(token, jwtSecret)
        if err != nil {
            c.AbortWithStatusJSON(401, gin.H{"message": "invalid token"})
            return
        }
        c.Set("uid", claims.UID)
        c.Next()
    }
}

// 使用
api.Use(middleware.Auth(cfg.JWTSecret))
```

### 4.5 限流

用 `github.com/ulule/limiter` 或自己基于 `golang.org/x/time/rate` 实现 IP 维度限流。

---

## 五、参数校验

Gin 用 `go-playground/validator`，通过 struct tag 声明规则，`ShouldBindJSON` 自动校验：

```go
type CreateUserReq struct {
    Name     string `json:"name" binding:"required,min=2,max=50"`
    Email    string `json:"email" binding:"required,email"`
    Age      int    `json:"age" binding:"gte=0,lte=150"`
    Password string `json:"password" binding:"required,min=8"`
    Role     string `json:"role" binding:"oneof=admin user guest"`
}

if err := c.ShouldBindJSON(&req); err != nil {
    // err 是 validator.ValidationErrors，可翻译
    Fail(c, 400, translateErr(err))
    return
}
```

常用 tag：`required` `min` `max` `len` `oneof` `email` `url` `gte` `lte` `datetime` `dive`（切片元素校验）。

翻译错误信息用 `github.com/go-playground/validator/v10/translations/zh`。

---

## 六、错误处理规范

### 6.1 错误分层

- **Repository**：返回原始错误（如 `gorm.ErrRecordNotFound`）。
- **Service**：转换为业务错误（自定义 error 或 sentinel error），包装上下文。
- **Handler**：映射为 HTTP 状态码 + 统一响应。

### 6.2 自定义错误类型

```go
// internal/service/errors.go
package service

import "fmt"

type BizError struct {
    Code int
    Msg  string
}

func (e *BizError) Error() string { return fmt.Sprintf("[%d] %s", e.Code, e.Msg) }

var (
    ErrUserNotFound = &BizError{Code: 40401, Msg: "用户不存在"}
    ErrEmailExists  = &BizError{Code: 40901, Msg: "邮箱已存在"}
)
```

Handler 统一处理：

```go
func (h *UserHandler) Get(c *gin.Context) {
    u, err := h.svc.Get(id)
    if err != nil {
        var bizErr *service.BizError
        if errors.As(err, &bizErr) {
            Fail(c, bizErr.Code, bizErr.Msg)
            return
        }
        Fail(c, 500, "internal error")   // 未知错误不暴露细节
        return
    }
    Success(c, u)
}
```

### 6.3 全局错误处理中间件

可用 `r.Use` 统一捕获，但更常见在 Handler 用 `errors.As` 分支处理。

---

## 七、数据库实践

### 7.1 连接池配置

```go
sqlDB, _ := db.DB()
sqlDB.SetMaxOpenConns(100)      // 最大连接数
sqlDB.SetMaxIdleConns(10)       // 最大空闲
sqlDB.SetConnMaxLifetime(time.Hour)   // 连接最大生存时间
sqlDB.SetConnMaxIdleTime(10 * time.Minute)
```

### 7.2 事务

```go
err := db.Transaction(func(tx *gorm.DB) error {
    if err := tx.Create(&order).Error; err != nil { return err }
    if err := tx.Model(&product).Update("stock", gorm.Expr("stock - ?", qty)).Error; err != nil {
        return err   // 返回 error 自动回滚
    }
    return nil   // 返回 nil 自动提交
})
```

### 7.3 迁移

- 简单项目：`db.AutoMigrate(&User{})`（开发期）。
- 生产：用 `golang-migrate`、`goose`、`atlas` 等版本化迁移工具，SQL 文件入库管理。

### 7.4 N+1 问题

```go
// 错误：循环查询
for _, u := range users {
    db.First(&u.Profile, u.ID)   // N+1
}
// 正确：预加载
db.Preload("Profile").Find(&users)
```

### 7.5 软删除

```go
type User struct {
    gorm.DeletedAt `json:"-"`
    // ...
}
db.Delete(&user)            // UPDATE set deleted_at
db.Unscoped().Find(&users)  // 查含已删除
```

---

## 八、配置与环境

### 8.1 多环境

- `configs/config.dev.yaml` / `config.prod.yaml`
- 用环境变量 `APP_ENV=prod` 选择，敏感信息（密码、密钥）用环境变量，不进配置文件和 git。

```go
viper.SetConfigName("config." + os.Getenv("APP_ENV"))
```

### 8.2 热更新

`viper.WatchConfig()` + `viper.OnConfigChange` 监听文件变化。

---

## 九、日志规范

### 9.1 结构化日志（slog，1.21+）

```go
import "log/slog"

logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
slog.SetDefault(logger)

slog.Info("user created", "uid", u.ID, "name", u.Name)
// {"time":"...","level":"INFO","msg":"user created","uid":1,"name":"a"}
```

生产用 `zap`（性能最高）或 slog，**不要用 `fmt.Println`**。

### 9.2 traceID 串联

中间件生成 traceID 注入 context，日志从 context 取出，全链路可追踪。

---

## 十、测试

### 10.1 分层测试

```go
// service 层测试（mock repository）
type mockRepo struct{}
func (m *mockRepo) Create(u *User) error { return nil }

func TestCreate(t *testing.T) {
    svc := NewUserService(&mockRepo{})
    u, err := svc.Create(&CreateUserReq{Name: "a", Email: "a@b.com"})
    assert.NoError(t, err)
    assert.NotNil(t, u)
}
```

### 10.2 HTTP 集成测试

```go
func TestGetUser(t *testing.T) {
    r := router.New(testDB)
    w := httptest.NewRecorder()
    req, _ := http.NewRequest("GET", "/api/v1/users/1", nil)
    r.ServeHTTP(w, req)
    assert.Equal(t, 200, w.Code)
}
```

推荐 `github.com/stretchr/testify` 断言库。

---

## 十一、主流框架选型

### Web 框架

| 框架 | 特点 | 适用 |
|------|------|------|
| **Gin** | 最流行，路由快，生态全 | 中小项目、REST API（推荐入门）|
| **Echo** | 类 Gin，性能好 | 同 Gin |
| **Fiber** | 基于 fasthttp，极致性能，API 类 Express | 高性能场景（注意：fasthttp 不完全兼容 net/http）|
| **Chi** | 轻量，标准库风格，中间件友好 | 偏好标准库、定制化 |
| **go-zero** | 微服务全家桶（RPC、缓存、限流、代码生成）| 微服务 |
| **Kratos**（B 站）| 微服务框架 | 微服务 |
| **net/http**（1.22+）| 标准库路由增强 | 极简、零依赖 |

### ORM

| 库 | 特点 |
|----|------|
| **GORM** | 最流行，功能全，约定优于配置（推荐）|
| **ent**（Facebook）| 代码生成，强类型，图查询 |
| **sqlx** | 标准库 database/sql 增强，轻量 |
| **sqlc** | SQL 写 -> 生成 Go 代码，类型安全 |
| **database/sql** | 原生，最轻，需手写大量样板 |

选型：快速开发用 GORM，性能敏感 / 追求类型安全用 sqlc 或 ent。

### 其他常用

| 用途 | 推荐 |
|------|------|
| 配置 | viper |
| 日志 | zap / slog |
| 校验 | go-playground/validator |
| JWT | golang-jwt/jwt |
| Redis | redis/go-redis/v9 |
| 消息队列 | Kafka: segmentio/kafka-go；RocketMQ: apache/rocketmq-client-go |
| 分布式锁 | 自行 Redis + Lua，或 bitleak/lk |
| 依赖注入 | google/wire（编译期生成）|
| 文档 | swaggo/swag（注解生成 swagger）|

---

## 十二、Makefile 与工程化

```makefile
APP := myapp
.PHONY: run build test lint tidy

run:
	go run ./cmd/server

build:
	CGO_ENABLED=0 go build -ldflags="-s -w" -o bin/$(APP) ./cmd/server

test:
	go test -race -cover ./...

lint:
	golangci-lint run ./...

tidy:
	go mod tidy

docker:
	docker build -t $(APP) .

swagger:
	swag init -d ./internal/handler -o ./docs
```

---

## 十三、小结

| 维度 | 实践 |
|------|------|
| 目录 | `cmd/` 入口、`internal/` 私有业务、`pkg/` 公共库、`configs/` 配置 |
| 分层 | Handler -> Service -> Repository，单向依赖 |
| 配置 | viper + yaml + 环境变量，敏感信息不入库 |
| 响应 | 统一 `{code,message,data}` 结构 |
| 错误 | 自定义 BizError + errors.As，Handler 映射状态码 |
| 校验 | validator tag + ShouldBind |
| 日志 | 结构化（zap/slog）+ traceID |
| 数据库 | 连接池、事务、预加载防 N+1、版本化迁移 |
| 测试 | service mock、handler httptest，开发期 -race |

**核心**：Go 项目靠"约定 + 分层"组织，不强依赖框架。Gin + GORM 是中小项目主流组合，微服务上 go-zero / Kratos。`internal` 目录是封装利器，分层让业务可复用可测试。

> 下一篇：[Go 高阶知识与常见坑](./advanced.md)
