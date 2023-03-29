---
icon: article
category:
  - Javascript

tags:
  - 算法
---

# 数据扁平化

将多层级的数组 [1,[2,34,[12,4]],23],实现数组拍平都有哪些方法

## Array flat

> [flat()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/flat) 方法会按照一个可指定的深度递归遍历数组，并将所有元素与遍历到的子数组中的元素合并为一个新数组返回

```javascript
// 指定要提取嵌套数组的结构深度，默认值为 1。
var newArray = arr.flat([depth])
```

### flat 扁平化数组

```javascript
var arr1 = [1, 2, [3, 4]]
arr1.flat()
// [1, 2, 3, 4]

var arr2 = [1, 2, [3, 4, [5, 6]]]
arr2.flat()
// [1, 2, 3, 4, [5, 6]]

var arr3 = [1, 2, [3, 4, [5, 6]]]
arr3.flat(2)
// [1, 2, 3, 4, 5, 6]

//使用 Infinity，可展开任意深度的嵌套数组
var arr4 = [1, 2, [3, 4, [5, 6, [7, 8, [9, 10]]]]]
arr4.flat(Infinity)
// [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

## Array flatMap

> [flatMap()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/flatMap) 方法首先使用映射函数映射每个元素，然后将结果压缩成一个新数组。它与 map 连着深度值为 1 的 flat 几乎相同，但 flatMap 通常在合并成一种方法的效率稍微高一些

```javascript
var new_array = arr.flatMap(function callback(currentValue[, index[, array]]) {
    // return element for new_array
}[, thisArg])
```

### map() 与 flatMap()

```javascript
var arr1 = [1, 2, 3, 4]

arr1.map((x) => [x * 2])
// [[2], [4], [6], [8]]

arr1.flatMap((x) => [x * 2])
// [2, 4, 6, 8]

// only one level is flattened
arr1.flatMap((x) => [[x * 2]])
// [[2], [4], [6], [8]]
```

## 递归遍历

使用基础遍历的方式，然后遍历的 item 项是否为数组，如果是数组递归执行扁平化函数，并把执行的结果与之前 contact，如果 item 项非数组，则直接将值 push 到最初定义的数组中

```javascript
let array = [1, [2, 34, [12, 4]], 23]
function flatten(array) {
  let result = []
  for (const item of array) {
    if (Array.isArray(item)) {
      result = result.concat(flatten(item))
    } else {
      result.push(item)
    }
  }
  return result
}
console.log(flatten(array))
```

## reduce 遍历

```javascript
function flatten(array) {
  return array.reduce((pre, current, currentIndex, array) => {
    if (Array.isArray(current)) {
      return pre.concat(flatten(current))
    } else {
      return pre.concat(current)
    }
  }, [])
}
```

## while 循环结合 findIndex

> 实现思路: 使用 while 循环，循环判断条件，concat 以后的数组中是否包含数组类型，如果包含 然后使用 ... 扩展运算符进行展开并合并

```javascript
let array = [1, [2, 34, [12, 4]], 23]
function flatten(array) {
  while (array.findIndex((item) => Array.isArray(item) > 0)) {
    array = [].concat(...array)
  }
  return array
}
console.log(flatten(array))
```

## 数组强制类型转换

> 实现思路: 将数组进行强制类型转换，然后使用 split 分隔为数组，最后注意不要忘记转换为 Number 类型

```javascript
function flatten(array) {
  // 'array.toString() 转换后的结果 1,2,34,12,4,23'
  return array
    .toString()
    .split(',')
    .map((item) => Number(item))
}
console.log(flatten(array))
```

## JSON 的函数和正则表达式

> 先使用 JSON.stringify 将数组进行转换，然后使用正则匹配去掉[ ],在最外层增加[ ],最后使用 JSON.parse 转换

```javascript
let array = [1, [2, 34, [12, 4]], 23]
function flatten(array) {
  let result = JSON.stringify(array)
  // JSON.stringify 转换后的结果 '[1,[2,34,[12,4]],23]'
  result = result.replace(/(\[|\])/g, '')
  result = '[' + result + ']'
  return JSON.parse(result)
}
console.log(flatten(array))
```

## 栈和扩展运算符

```javascript
function flatten(arr) {
  let res = []
  const stack = [].concat(arr)
  console.log('哈哈哈', stack)
  while (stack.length > 0) {
    console.log(stack.length, stack)
    const item = stack.pop()
    if (Array.isArray(item)) {
      // 用扩展运算符展开一层
      stack.push(...item)
    } else {
      item !== undefined && res.unshift(item)
    }
  }
  return res
}
console.log(flatten(array))
```
