# Golang

## slice 类型切片

Go 数组的长度不可改变，在特定场景中这样的集合就不太适用，Go 中提供了一种灵活，功能强悍的内置类型切片("动态数组")，与数组相比切片的长度是不固定的，可以追加元素，在追加时可能使切片的容量增大。

```Golang
var identifier []type
```

初始化
```Golang
var slice1 []type = make([]type, len)
也可以简写为
slice1 := make([]type, len)
```

```Go
s :=make([]int,len,cap) 
```
通过内置函数 make() 初始化切片s，[]int 标识为其元素类型为 int 的切片  
切片是可索引的，并且可以由 len() 方法获取长度。

切片提供了计算容量的方法 cap() 可以测量切片最长可以达到多少。