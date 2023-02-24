# Code

- 实现一个节流函数? 如果想要最后一次必须执行的话怎么实现?
- 实现一个批量请求函数, 能够限制并发量?

## 数组转树结构

<details>
<summary>
  
</summary>

```javascript
const arr = [
  { id: 2, name: '部门B', pid: 0 },
  { id: 3, name: '部门C', pid: 1 },
  { id: 1, name: '部门A', pid: 2 },
  { id: 4, name: '部门D', pid: 1 },
  { id: 5, name: '部门E', pid: 2 },
  { id: 6, name: '部门F', pid: 3 },
  { id: 7, name: '部门G', pid: 2 },
  { id: 8, name: '部门H', pid: 4 },
]

// 添加多条数据
// const rrr = new Array(300).fill().map((it, index) => {
//   return {
//     id: 9 + index,
//     name: `${index}部门H`,
//     pid: 2,
//   }
// })
// arr.push(...rrr)
```

```javascript
// 方法一
/**
 * @param {arr: array 原数组数组, id: number 父节点id}
 * @return {children: array 子数组}
 */
function getChildren(arr, id) {
  const res = []
  for (const item of arr) {
    if (item.pid === id) {
      // 找到当前id的子元素
      // 插入子元素，每个子元素的children通过回调生成
      res.push({
        ...item,
        children: getChildren(arr, item.id),
      })
    }
  }
  return res
}

// 方法二
function toTree(data) {
  const cache = {}
  data.forEach((it) => {
    cache[it.id] = it
  })

  const res = []
  data.forEach((it) => {
    const parent = cache[it.pid]
    if (parent) (parent.children || (parent.children = [])).push(it)
    else res.push(it)
  })

  return res[0]
}
```

树转数组

```javascript
// 方法一
function flat(obj, res = []) {
  // 默认初始结果数组为[]
  res.push(obj) // 当前元素入栈
  // 若元素包含children，则遍历children并递归调用使每一个子元素入栈
  if (obj.children && obj.children.length) {
    for (const item of obj.children) {
      flat(item, res)
    }
  }
  return res
}

// 方法二
function toLine(data) {
  const res = []
  const parent = { ...data }
  delete parent.children
  res.push(parent)
  const off = (ojb) => {
    ojb.children &&
      ojb.children.forEach((ii) => {
        if (ii.children && ii.children.length) off(ii)
        res.push(ii)
        delete ii.children
      })
  }
  off(data)
  return res
}
```

</details>

<details>
<summary>去除字符串中出现次数最少的字符，不改变原字符串的顺序。</summary>

```javascript
“ababac” —— “ababa”
“aaabbbcceeff” —— “aaabbb”
```

</details>

<details>
<summary>写出一个函数transs，将数字转换成汉语的输出，输入为不超过10000亿的数字。</summary>

- [Gin 官方文档](https://gin-gonic.com/zh-cn/docs/)
- [Gin 中文文档](https://www.kancloud.cn/shuangdeyu/gin_book/949411)
- [gin-vue-admin](https://www.gin-vue-admin.com/)
- [轻量级 Web 框架 Gin 结构分析](http://blog.itpub.net/31561269/viewspace-2637490/)
- [更多](https://www.bookstack.cn/explore?cid=168)

</details>
