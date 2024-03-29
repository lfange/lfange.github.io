---
icon: article
category:
  - JavaScript

tag:
  - Interview
---

# day

## 返回两个数组中相同的值

```javascript
const ar1 = (arr1, arr2) => {
  arr1.sort((a, b) => a - b)
  arr2.sort((a, b) => a - b)

  const res = []
  let p1 = (p2 = 0)
  while (p1 < arr1.length && p2 < arr2.length) {
    if (arr1[p1] > arr2[p2]) {
      p2++
    } else if (arr1[p1] < arr2[p2]) {
      p1++
    } else {
      res.push(arr1[p1])
      p1++
      p2++
    }
  }
  return res
}
```

## 深拷贝

`Object.assign`、`...`、`slice`、`concat`, 默认是对对象进行深拷贝的，但是我们需要注意的是，它只对最外层的进行深拷贝，也就是当对象内嵌套有对象的时候，被嵌套的对象进行的还是浅拷贝

### JSON.parse(JSON.stringify(obj))

`JSON.parse(JSON.stringify(obj))`一种深拷贝的方式，一般大部分的深拷贝都可以用 JSON 的方式进行解决，本质是因为 JSON 会自己去构建新的内存来存放新对象

- 会忽略 undefined 和 symbol；
- 不可以对 Function 进行拷贝，因为 JSON 格式字符串不支持 Function，在序列化的时候会自动删除；
- 诸如 Map, Set, RegExp, Date, ArrayBuffer 和其他内置类型在进行序列化时会丢失；
- 不支持循环引用对象的拷贝;（循环引用的可以大概地理解为一个对象里面的某一个属性的值是它自己）
