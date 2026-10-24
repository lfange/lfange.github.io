---
title: 栈与队列
icon: layers

category:
  - Algorithms

tag:
  - Interview
  - DataStructure
---

# 栈与队列

> 栈和队列是最简单的数据结构，却是大量复杂算法的基石：函数调用、递归、DFS 靠栈；BFS、消息队列、任务调度靠队列。

## 栈（Stack）：后进先出 LIFO

只允许在一端（栈顶）进出。生活类比：摞盘子——只能放在最上面，也只能从最上面拿。

```
push 1, 2, 3 →

│ 3 │ ← 栈顶（top，最后进的，最先出）
│ 2 │
│ 1 │
└───┘
```

### 栈的本质作用：颠倒处理顺序

记住这个心智模型：**凡是「后发生的先处理」的场景，就是栈**。

- 函数调用栈：最后调用的函数最先返回
- 括号匹配：最晚打开的括号必须最先闭合
- 撤销操作（Ctrl+Z）：最近的操作最先被撤销
- 浏览器前进/后退栈
- DFS 深度优先搜索：一条路走到黑再回头

### 手写栈

```ts
class Stack<T> {
  private items: T[] = []

  push(item: T): void {
    this.items.push(item) // O(1) 摊还
  }

  pop(): T | undefined {
    return this.items.pop() // O(1)
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1] // O(1)
  }

  get size(): number {
    return this.items.length
  }

  isEmpty(): boolean {
    return this.items.length === 0
  }
}
```

基于数组实现时 `push/pop` 都在尾部操作，O(1)；若错误地用 `shift/unshift` 在头部操作，每次都要搬移整个数组，退化为 O(n)。

## 队列（Queue）：先进先出 FIFO

一端进（队尾 rear），另一端出（队头 front）。**凡是「先来先服务」的场景，就是队列**：排队买票、消息队列、BFS 的待访问节点队列、CPU 就绪队列。

```ts
class Queue<T> {
  private items: T[] = []

  enqueue(item: T): void {
    this.items.push(item) // 入队：尾部
  }

  dequeue(): T | undefined {
    return this.items.shift() // 出队：头部 —— 问题是 O(n)！
  }

  get size(): number {
    return this.items.length
  }
}
```

### ⚠️ 上面这个实现有个性能陷阱

`shift()` 要把后续所有元素前移一位，出队 O(n)。正确的做法是**循环队列（环形缓冲区）**——用 `head` 指针标记队头，出队只移动指针不搬数据：

```ts
class CircularQueue<T> {
  private items: (T | undefined)[]
  private head = 0 // 队头指针
  private count = 0

  constructor(capacity: number) {
    this.items = new Array(capacity)
  }

  enqueue(item: T): boolean {
    if (this.count === this.items.length) return false // 队满
    this.items[(this.head + this.count) % this.items.length] = item
    this.count++
    return true
  }

  dequeue(): T | undefined {
    if (this.count === 0) return undefined
    const item = this.items[this.head]
    this.items[this.head] = undefined // 释放引用，利于 GC
    this.head = (this.head + 1) % this.items.length
    this.count--
    return item
  }
}
```

取模运算让指针绕到数组开头复用已出队的空间，入队出队都是 O(1)。

## 实战一：有效的括号（LeetCode 20）

栈的入门必刷题，考察「栈顶就是最近待匹配项」的直觉：

```ts
function isValid(s: string): boolean {
  const pairs: Record<string, string> = {
    ')': '(',
    ']': '[',
    '}': '{',
  }
  const stack: string[] = []

  for (const ch of s) {
    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch) // 左括号入栈
    } else {
      // 右括号：必须和栈顶（最近的左括号）匹配
      if (stack.pop() !== pairs[ch]) return false
    }
  }
  // 栈空说明所有括号都配对完成
  return stack.length === 0
}
```

三个失败分支：右括号不匹配栈顶、右括号来了但栈是空（`pop()` 返回 `undefined`）、遍历结束栈里还有剩（左括号多了）。

## 实战二：最小栈（LeetCode 155）

> 设计一个支持 push、pop、top 操作，并能在 O(1) 内检索到最小元素的栈。

核心思路：**空间换时间**。用辅助栈同步记录「当前栈状态下的最小值」：

```ts
class MinStack {
  private stack: number[] = []
  private minStack: number[] = [] // minStack[i] = stack 前 i+1 个元素的最小值

  push(val: number): void {
    this.stack.push(val)
    // 新最小值 = min(当前值, 之前的最小值)
    const prevMin = this.minStack[this.minStack.length - 1]
    this.minStack.push(
      this.minStack.length === 0 ? val : Math.min(val, prevMin)
    )
  }

  pop(): void {
    this.stack.pop()
    this.minStack.pop() // 两个栈同步增减
  }

  top(): number {
    return this.stack[this.stack.length - 1]
  }

  getMin(): number {
    return this.minStack[this.minStack.length - 1]
  }
}
```

为什么同步 pop 就正确？因为「前 n 个数的最小值」只依赖历史，删除最后一个数后，最小值恰好回退到上一个历史记录——辅助栈天然保存了每一步的快照。

## 实战三：用两个栈实现队列（LeetCode 232）⭐

栈颠倒顺序，两个栈负负得正：

```ts
class MyQueue {
  private inStack: number[] = [] // 只负责进
  private outStack: number[] = [] // 只负责出

  push(x: number): void {
    this.inStack.push(x)
  }

  pop(): number {
    // outStack 空了才倒一次，保证顺序不乱
    if (this.outStack.length === 0) this.transfer()
    return this.outStack.pop()!
  }

  peek(): number {
    if (this.outStack.length === 0) this.transfer()
    return this.outStack[this.outStack.length - 1]
  }

  private transfer(): void {
    // 把 inStack 全部倒入 outStack，顺序反转两次 = 恢复 FIFO
    while (this.inStack.length > 0) {
      this.outStack.push(this.inStack.pop()!)
    }
  }
}
```

**摊还分析**（面试必讲）：每个元素最多经历一次入栈、一次倒入、一次出栈，共 3 次操作。n 个元素总代价 3n，摊还到每次 `pop` 是 O(1)。关键是「outStack 空才倒」，避免反复搬运。

## 实战四：单调栈 ⭐⭐

单调栈是栈的最高频考点：**栈内元素保持单调递增/递减，用于高效解决「下一个/上一个更大（小）元素」类问题**。

### 模板：每日温度（LeetCode 739）

> 给定气温列表，对每一天求「还要等几天才会升温」，不存在则为 0。

暴力双重循环 O(n²)。单调栈优化：**栈里存下标，从栈底到栈顶温度递减**——栈顶就是「还没等到升温」的日子。

```ts
function dailyTemperatures(temperatures: number[]): number[] {
  const n = temperatures.length
  const answer = new Array(n).fill(0)
  const stack: number[] = [] // 存下标，对应温度单调递减

  for (let i = 0; i < n; i++) {
    // 当前温度比栈顶那天高 → 栈顶那天等到了答案
    while (stack.length > 0 && temperatures[i] > temperatures[stack[stack.length - 1]]) {
      const prevIndex = stack.pop()!
      answer[prevIndex] = i - prevIndex
    }
    stack.push(i)
  }
  // 循环结束后还留在栈里的下标 = 永远等不到升温，answer 保持 0
  return answer
}
```

**为什么是 O(n)**：每个下标最多入栈一次、出栈一次，总操作 2n 次。虽然代码里有双重循环（for 套 while），但内层循环的总执行次数被入栈次数封顶——这是分析单调栈复杂度的关键。

### 单调栈问题家族

| 问题 | 栈内单调性 | LeetCode |
| ---- | ---- | ---- |
| 下一个更大元素 | 递减栈 | 496 / 739 |
| 每日温度 | 递减栈 | 739 |
| 柱状图中最大的矩形 | 递增栈 | 84 |
| 接雨水 | 递减栈 | 42 |
| 股票跨度 | 递减栈 | 901 |
| 移除 K 个数字使数字最小 | 递增栈 | 402 |

记忆口诀：**找右边更大的元素 → 维护递减栈；找右边更小的元素 → 维护递增栈**（栈里存的是「还在等待答案」的元素）。

## 实战五：滑动窗口最大值（LeetCode 239）⭐⭐

> 数组 nums、窗口大小 k，窗口每次右移一位，返回每个窗口的最大值。

这是「单调队列」的代表作：双端队列（deque）存下标，保持对应值从队头到队尾单调递减——**队头永远是当前窗口最大值**。

```ts
function maxSlidingWindow(nums: number[], k: number): number[] {
  const deque: number[] = [] // 存下标；nums[deque] 从头到尾递减
  const result: number[] = []

  for (let i = 0; i < nums.length; i++) {
    // 1. 队尾比当前小的都不可能是未来窗口的最大值，弹掉
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= nums[i]) {
      deque.pop()
    }
    deque.push(i)

    // 2. 队头下标滑出窗口范围（<= i - k），从队头移除
    if (deque[0] <= i - k) deque.shift()

    // 3. 窗口形成后，队头即最大值
    if (i >= k - 1) result.push(nums[deque[0]])
  }
  return result
}
```

每个下标最多入队一次、出队一次，O(n)。

## 栈与队列的相互实现与工程对应物

| 组合 | 实现 | LeetCode |
| ---- | ---- | ---- |
| 两栈实现队列 | inStack + outStack，摊还 O(1) | 232 |
| 两队列实现栈 | 入队 O(n)：新元素转圈插到队头 | 225 |

工程世界的对应物：

- **函数调用栈**：每个函数调用压入一个栈帧（参数、局部变量、返回地址），递归过深 → 栈溢出（Stack Overflow 网站名字的由来）
- **消息队列**（Kafka/RabbitMQ）：生产者消费者解耦，本质是分布式队列
- **浏览器事件循环**：JS 的宏任务队列 + 微任务队列，队列结构决定执行顺序

## 面试要点清单

- [ ] 栈/队列的定义与实现，循环队列为什么比数组 shift 快
- [ ] 两栈实现队列的摊还分析：每个元素最多被搬运一次
- [ ] 最小栈：辅助栈快照思想
- [ ] 单调栈：模板 + 复杂度证明（每个元素进出各一次）+ 口诀
- [ ] 滑动窗口最大值：单调双端队列，队头过期下标的清理时机
- [ ] 能立刻说出 3 个栈、3 个队列的真实工程应用
