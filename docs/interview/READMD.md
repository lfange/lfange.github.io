<!--
 * @Author: fange 653398363@qq.com
 * @Date: 2023-02-09 14:18:02
 * @LastEditors: fange 653398363@qq.com
 * @LastEditTime: 2023-02-10 09:30:07
 * @FilePath: \lfange.github.io\docs\interview\READMD.md
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->

# Interview

## The Interviewer Series

- 闭包是什么? 闭包的用途?
- 简述事件循环原理
- 虚拟 dom 是什么? 原理? 优缺点?
- vue 和 react 在虚拟 dom 的 diff 上，做了哪些改进使得速度很快?
- vue 和 react 里的 key 的作用是什么? 为什么不能用 Index？用了会怎样? 如果不加 key 会怎样?
- vue 双向绑定的原理是什么?
- vue 的 keep-alive 的作用是什么？怎么实现的？如何刷新的?
- vue 是怎么解析 template 的? template 会变成什么?
- 如何解析指令? 模板变量? html 标签
- 用过 vue 的 render 吗? render 和 template 有什么关系

## code

- 实现一个节流函数? 如果想要最后一次必须执行的话怎么实现?
- 实现一个批量请求函数, 能够限制并发量?

### 数组转树结构

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
<summary>写出一个函数trans，将数字转换成汉语的输出，输入为不超过10000亿的数字。</summary>

- [Gin 官方文档](https://gin-gonic.com/zh-cn/docs/)
- [Gin 中文文档](https://www.kancloud.cn/shuangdeyu/gin_book/949411)
- [gin-vue-admin](https://www.gin-vue-admin.com/)
- [轻量级 Web 框架 Gin 结构分析](http://blog.itpub.net/31561269/viewspace-2637490/)
- [更多](https://www.bookstack.cn/explore?cid=168)

</details>
