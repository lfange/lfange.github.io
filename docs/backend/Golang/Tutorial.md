# Tutorial

## slice 类型切片

Go 数组的长度不可改变，在特定场景中这样的集合就不太适用，Go 中提供了一种灵活，功能强悍的内置类型切片("动态数组")，与数组相比切片的长度是不固定的，可以追加元素，在追加时可能使切片的容量增大。

```javascript
var identifier []type
```

初始化

```javascript
var slice1 []type = make([]type, len)
也可以简写为
slice1 := make([]type, len)
```

```Go
s :=make([]int,len,cap)
```

通过内置函数 `make()` 初始化切片`s`，`[]int` 标识为其元素类型为 `int` 的切片  
切片是可索引的，并且可以由 len() 方法获取长度。

切片提供了计算容量的方法 cap() 可以测量切片最长可以达到多少。

### nil

一个切片在未初始化之前默认为 nil，长度为 0

## Map

`Map` 是一种无序的键值对的集合。Map 最重要的一点是通过 key 来快速检索数据，key 类似于索引，指向数据的值。

`Map` 是一种集合，所以我们可以像迭代数组和切片那样迭代它。不过，Map 是**无序的**，我们无法决定它的返回顺序，这是因为 Map 是使用 hash 表来实现的。

```javascript
/* 声明变量，默认 map 是 nil */
var map_variable map[key_data_type]value_data_type

/* 使用 make 函数 */
map_variable := make(map[key_data_type]value_data_type)
```

## 接口

Go 语言提供了另外一种数据类型即接口，它把所有的具有共性的方法定义在一起，任何其他类型只要实现了这些方法就是实现了这个接口。

```javascript
/* 定义接口 */
type interface_name interface {
   method_name1 [return_type]
   method_name2 [return_type]
   method_name3 [return_type]
   ...
   method_namen [return_type]
}

/* 定义结构体 */
type struct_name struct {
   /* variables */
}

/* 实现接口方法 */
func (struct_name_variable struct_name) method_name1() [return_type] {
   /* 方法实现 */
}
...
func (struct_name_variable struct_name) method_namen() [return_type] {
   /* 方法实现*/
}
```

## Golang 路径设置

[Go module 本地开发](https://go.dev/doc/tutorial/call-module-code)

由于`go`的`package包`需要下载，而本地的包没有发布，所有需要改路径

```javascript
go mod edit -replace example.com/greetings=../greetings
```

```javascript
$ go mod tidy
go: found example.com/greetings in example.com/greetings v0.0.0-00010101000000-000000000000
```
