# Golang

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