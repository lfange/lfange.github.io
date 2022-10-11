# Golang

## feature

- 简洁、快速、安全
- 并行、有趣、开源
- 内存管理、数组安全、编译迅速

与`JavaScript`类似, Go 语言接受了函数式编程的一些想法，支持匿名函数与闭包，函数式声明的方法，与`JavaScript`数组类似的 `slice 切片`
与`C`类似的指针语法，`interface`、`struct结构`

再如，Go 语言接受了以`Erlang`语言为代表的面向消息编程思想，支持`goroutine`和`通道`，并推荐使用消息而不是共享内存来进行并发编程。总体来说，Go 语言是一个非常现代化的语言，精小但非常强大

- 自动垃圾回收
- 更丰富的内置类型
- 函数多返回值
- 错误处理
- 匿名函数和闭包
- 类型和接口
- 并发编程
- 反射
- 语言交互性

## 配置 GOPROXY

Go1.12 版本之后，开始使用 go mod 模式来管理依赖环境了

由于国内访问不到默认的 GOPROXY 配置链接，所以我们需要换一个 PROXY，这里推荐使用https://goproxy.io或https://goproxy.cn。

可以执行下面的命令修改 GOPROXY：

```javascript
go env -w GOPROXY=https://goproxy.cn,direct
```

## GO MOD

golang 提供了 go mod 命令来管理包。 go mod 有以下命令：
| 命令 | 说明 |
| ----------- | ----------- |
| download | download modules to local cache(下载依赖包) |
| edit | edit go.mod from tools or scripts（编辑 go.mod) |
| graph | print module requirement graph (打印模块依赖图) |
| verify | initialize new module in current directory（在当前目录初始化 mod） |
| tidy | add missing and remove unused modules(拉取缺少的模块，移除不用的模块) |
| vendor | make vendored copy of dependencies(将依赖复制到 vendor 下) |
| verify | verify dependencies have expected content (验证依赖是否正确）
| why | explain why packages or modules are needed(解释为什么需要依赖)

### Golang 路径设置

[Go module 本地开发](https://go.dev/doc/tutorial/call-module-code)  
由于`go`的`package包`需要下载，而本地的包没有发布，所有需要改路径

```javascript
go mod edit -replace example.com/greetings=../greetings
```

要启用 go module 支持首先要设置环境变量 GO111MODULE，通过它可以开启或关闭模块支持，它有三个可选值：off、on、auto，默认值是 auto。

1. GO111MODULE=off 禁用模块支持，编译时会从 GOPATH 和 vendor 文件夹中查找包。
2. GO111MODULE=on 启用模块支持，编译时会忽略 GOPATH 和 vendor 文件夹，只根据 go.mod 下载依赖。
3. GO111MODULE=auto，当项目在$GOPATH/src 外且项目根目录有 go.mod 文件时，开启模块支持。
   通过以下命令修改

```javascript
go env -w GO111MODULE=on
```

使用 go module 模式新建项目时，我们需要通过 `go mod init` 项目名命令对项目进行初始化，该命令会在项目根目录下生成 go.mod 文件。例如，我们使用 hello 作为我们第一个 Go 项目的名称，执行如下命令。

```javascript
go mod init hello
```

运行之前可以使用 `​go mod tidy`​ 命令将所需依赖添加到 go.mod 文件中，并且能去掉项目中不需要的依赖

```javascript
$ go mod tidy
go: found example.com/greetings in example.com/greetings v0.0.0-00010101000000-000000000000
```

## Updating modules

有时候在项目中需要更新 github 上的依赖包，则需要手动执行更新 module 操作，我们使用`go get`

- 运行 `go get -u` 以使用最新的 minor 版本或修补程序版本（即它将从 1.0.0 更新到例如 1.0.1，或者，如果可用，则更新为 1.1.0）
- 运行 `go get -u=patch` 以使用最新的 修补程序 版本（即，将更新为 1.0.1 但不更新 为 1.1.0）
- 运行 `go get package@version` 以更新到特定版本（例如 github.com/lfange/daydayup@v1.0.1）

```javascript
// 更新最新
$ go get -u
$ go get -u=patch
//指定包，指定版本
$ go get github.com/lfange/daydayup@v1.0.1
```

操作完，go.mod 文件会修改如下:

```javascript
go 1.19.1

require (
    github.com/lfange/daydayup v1.0.1
)
```

如果在项目中使用两个不同大版本,则可以用别名

```javascript
package main

import (
    "fmt"
    "github.com/lfange/daydayup"
    mv2 "github.com/lfange/daydayup/v2"
)

func main() {
    g, err := mv2.SayHi("Roberto", "pt")
    if err != nil {
        panic(err)
    }
    fmt.Println(g)

    fmt.Println(daydayup.SayHi("Roberto"))
}
```
执行一下 go mod tidy

## Go 跨域

Gin 框架配置处理跨域的中间件：

```javascript
func Cors(context *gin.Context) {
	method := context.Request.Method
	// 必须，接受指定域的请求，可以使用*不加以限制，但不安全
	//context.Header("Access-Control-Allow-Origin", "*")
	context.Header("Access-Control-Allow-Origin", context.GetHeader("Origin"))
	fmt.Println(context.GetHeader("Origin"))
	// 必须，设置服务器支持的所有跨域请求的方法
	context.Header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS")
	// 服务器支持的所有头信息字段，不限于浏览器在"预检"中请求的字段
	context.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Token")
	// 可选，设置XMLHttpRequest的响应对象能拿到的额外字段
	context.Header("Access-Control-Expose-Headers", "Access-Control-Allow-Headers, Token")
	// 可选，是否允许后续请求携带认证信息Cookir，该值只能是true，不需要则不设置
	context.Header("Access-Control-Allow-Credentials", "true")
	// 放行所有OPTIONS方法
	if method == "OPTIONS" {
		context.AbortWithStatus(http.StatusNoContent)
		return
	}
	context.Next()
}
```
