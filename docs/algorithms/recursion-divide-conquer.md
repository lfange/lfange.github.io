---
title: 递归与分治
icon: git-branch

category:
  - Algorithms

tag:
  - Interview
  - DataStructure
---

# 递归与分治

> 递归是算法世界的「自我相似」：分形结构、汉诺塔、DOM 树遍历、JSON 解析……凡是结构中包含同构子结构的场景，递归都是最自然的表达。分治则是递归的战略级应用——把大问题拆成独立子问题，各个击破。

## 递归的本质：调用栈与信任跳跃

函数调用自己时，**每次调用都有独立的栈帧**（参数、局部变量、返回地址）。递归依赖两个要素：

1. **递归公式**：原问题 → 更小的同构子问题
2. **基础情形（base case）**：最小子问题的直接答案，递归的退出条件

```ts
// 最简单的例子：阶乘
function factorial(n: number): number {
  if (n <= 1) return 1          // base case：1! = 1
  return n * factorial(n - 1)   // 递归公式：n! = n × (n-1)!
}
```

执行 `factorial(4)` 时的调用栈：

```
factorial(4)           ← 等待 4 × factorial(3)
 └─ factorial(3)       ← 等待 3 × factorial(2)
     └─ factorial(2)   ← 等待 2 × factorial(1)
         └─ factorial(1) = 1   ← base case，开始回传
     ← 2 × 1 = 2
 ← 3 × 2 = 6
← 4 × 6 = 24
```

**两个阶段**：递（不断压栈，问题变小）→ 归（触底后逐层返回，汇总结果）。

### 信任跳跃（The Leap of Faith）

写递归最重要的心法：**假设递归调用已经正确工作，只思考「如何用子问题的解组装原问题的解」**。不要试图在脑中展开完整的调用链——人脑栈深度是 3~5 层，展开到第 5 层必然晕掉。

写 `reverseList` 递归版时，不想 17 层嵌套，只想三件事：

1. base case 是什么？（空表 / 单节点，直接返回）
2. 假设 `reverseList(head.next)` 已经完美反转了后面的所有节点
3. 我这一层做什么？（把 head 接到子结果的尾部）

数学归纳法保证正确性：base case 正确 + 「假设 n-1 正确则 n 正确」⟹ 全部正确。这就是「先相信，后验证」。

### 递归的代价：栈溢出与重复计算

```ts
// 经典反面教材：斐波那契
function fib(n: number): number {
  if (n <= 2) return 1
  return fib(n - 1) + fib(n - 2)
}
```

调用树爆炸——`fib(50)` 需要约 2^50 次调用：

```
                fib(5)
              /        \
         fib(4)         fib(3)      ← fib(3) 被计算了 2 次
        /     \        /    \
    fib(3)   fib(2)  fib(2) fib(1)  ← fib(2) 被计算了 3 次
   /    \                ...
```

两个解法：

1. **记忆化**：算过的存哈希表，O(2^n) → O(n)——这正是动态规划的起点（见[动态规划](./dynamic-programming.md)）
2. **改迭代**：自底向上，只存前两个状态，空间 O(1)

```ts
function fib(n: number): number {
  if (n <= 2) return 1
  let prev = 1
  let cur = 1
  for (let i = 3; i <= n; i++) {
    ;[prev, cur] = [cur, prev + cur]
  }
  return cur
}
```

**尾递归**：若递归调用是函数的最后一步操作（如 `return fact(n-1, n*acc)`），理论上编译器可以优化成循环（复用栈帧）。**但 V8 等现代 JS 引擎已放弃尾调用优化（TCO）**，JS 中深递归仍会栈溢出，改写循环是唯一可靠方案。

## 分治：分而治之的三段式

分治 = 特殊的递归策略，要求子问题**相互独立**（可并行、无重叠）：

1. **分（Divide）**：把问题切成 k 个规模更小的同构子问题
2. **解（Conquer）**：递归求解子问题；足够小则直接解
3. **合（Combine）**：把子问题的解合并成原问题的解

```
分治的完整调用形态：

function divideAndConquer(problem): Solution {
  if (够小) return 直接解           // base case
  subproblems = split(problem)      // 分
  subs = subproblems.map(divideAndConquer)  // 解
  return merge(subs)                // 合
}
```

经典分治算法：

| 算法 | 分 | 合 | 复杂度 |
| ---- | ---- | ---- | ---- |
| 归并排序 | 数组对半切 | 有序数组合并 O(n) | O(n log n) |
| 快速排序 | 按 pivot 分区 | 无需合并（原地） | 平均 O(n log n) |
| 二分查找 | 保留一半 | 无需合并 | O(log n) |
| 大整数乘法（Karatsuba） | 数字对半 | 三次子乘法 | O(n^1.585) |
| 最近点对 | 平面对半 | 跨界检查 | O(n log n) |

**归并 vs 快排的分治哲学差异**（面试高频）：

- 归并：**先递归后合并**，分得简单（对半），合得费力（合并有序数组）——稳定、最坏 O(n log n)、需要 O(n) 辅助空间
- 快排：**先分区后递归**，分得费力（partition），合得免费——原地、缓存友好，但最坏 O(n²)

## 主定理（Master Theorem）：分治复杂度的一把尺

若 `T(n) = a·T(n/b) + O(n^d)`（a 个子问题、每个规模 n/b、合并代价 n^d），则：

```
比较 d 与 log_b(a)：

① d > log_b(a)  → T(n) = O(n^d)        // 合并占主导，叶子便宜
② d = log_b(a)  → T(n) = O(n^d log n)  // 各层均摊，平衡状态
③ d < log_b(a)  → T(n) = O(n^(log_b a)) // 叶子占主导，分裂太快
```

套用验证：

- **归并排序**：a=2, b=2, d=1；log₂2 = 1 = d → 情况② → O(n log n) ✓
- **二分查找**：a=1, b=2, d=0；log₂1 = 0 = d → 情况② → O(log n) ✓
- **快排（平均）**：a=2, b=2, d=0（分区 O(n)？注意 partition 是 O(n)）——把分区视为 d=1 的情况② → O(n log n) ✓

面试不要求背证明，但**「a 个 n/b 规格子问题 + n^d 合并成本」这一句话要能脱口而出**。

## 实战一：归并排序深度剖析

> [README 中的排序篇](./README.md) 已给出基础实现，这里补齐深度：归并环节 + 链表版 + 逆序对应用。

### 合并环节是灵魂

```ts
function mergeSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr // base case：单元素天然有序

  const mid = arr.length >> 1
  const left = mergeSort(arr.slice(0, mid))  // 解左半
  const right = mergeSort(arr.slice(mid))    // 解右半

  return merge(left, right)                  // 合并
}

function merge(left: number[], right: number[]): number[] {
  const result: number[] = []
  let i = 0
  let j = 0

  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]) // <= 保证稳定
    else result.push(right[j++])
  }
  // 双指针走到尽头，剩余部分直接追加
  while (i < left.length) result.push(left[i++])
  while (j < right.length) result.push(right[j++])
  return result
}
```

**稳定性来源**：相等时取左边（`<=`）——这是归并排序作为「稳定排序」的全部秘密。

### 链表版归并：快慢指针找中点

数组的 `slice` 是 O(n)，链表反而更适合归并（不需要辅助数组）：

```ts
function sortList(head: ListNode | null): ListNode | null {
  // base case：空或单节点
  if (!head || !head.next) return head

  // 1. 快慢指针找中点并断开
  let slow = head
  let fast = head.next
  while (fast && fast.next) {
    slow = slow.next!
    fast = fast.next.next
  }
  const rightHead = slow.next!
  slow.next = null // 关键：切断成两条独立链表

  // 2. 分：递归排序两半
  const left = sortList(head)
  const right = sortList(rightHead)

  // 3. 合：合并两个有序链表（O(1) 空间）
  const dummy = new ListNode(0)
  let tail = dummy
  while (left && right) {
    if (left.val <= right.val) {
      tail.next = left
      tail = left
      // left = left.next —— 见下
    } else {
      tail.next = right
      tail = right
    }
  }
  tail.next = left ?? right
  return dummy.next
}
```

（合并部分与[链表篇的 mergeTwoLists](./linked-list.md) 相同，此处从简。）链表归并是 **O(n log n) 时间 + O(log n) 空间（递归栈）**，是链表排序的最优选择——快排的 partition 在链表上失去原地优势，堆排序需要随机访问。

### 归并的经典应用：逆序对（剑指 Offer 51）

> 数组中「前面的数大于后面的数」的对数。暴力 O(n²)，归并统计 O(n log n)。

洞察：**合并两个有序子数组时，右半元素被选中 Ahead of 左半剩余元素，恰好说明左半剩余的所有元素都与它构成逆序对**——分治过程中「顺手」统计，不增加复杂度量级。

```ts
function reversePairs(nums: number[]): number {
  let count = 0

  const mergeSort = (arr: number[]): number[] => {
    if (arr.length <= 1) return arr
    const mid = arr.length >> 1
    const left = mergeSort(arr.slice(0, mid))
    const right = mergeSort(arr.slice(mid))
    return merge(left, right)
  }

  const merge = (left: number[], right: number[]): number[] => {
    const result: number[] = []
    let i = 0
    let j = 0
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        result.push(left[i++])
      } else {
        // 左半从 i 到末尾都 > right[j]，全部构成逆序对
        count += left.length - i
        result.push(right[j++])
      }
    }
    while (i < left.length) result.push(left[i++])
    while (j < right.length) result.push(right[j++])
    return result
  }

  mergeSort(nums)
  return count
}
```

「在归并的合并环节嵌入额外统计」是通用套路：区间和、翻转对（493）同理。

## 实战二：快速排序的深度补全

[README 排序篇](./README.md) 的实现需要两个认知升级：

**① 最坏情况是什么**：数组已有序 + pivot 总取端点 → 每次只切掉一个元素，退化 O(n²)。防御手段：

```ts
// 随机化 pivot：让最坏情况概率上不可能被构造
function randomizedPartition(arr: number[], lo: number, hi: number): number {
  const randomIdx = lo + Math.floor(Math.random() * (hi - lo + 1))
  ;[arr[randomIdx], arr[hi]] = [arr[hi], arr[randomIdx]] // 换到末尾走老流程
  return partition(arr, lo, hi)
}
```

**② 快排的分治树不均衡**：最好每次对半分（O(n log n)），最坏全偏（O(n²)）——对比归并的绝对均衡。这也是快排空间复杂度「平均 O(log n)、最坏 O(n)」的来源（递归栈深度 = 树高）。

## 实战三：Pow(x, n)（LeetCode 50）

> 计算 x 的 n 次幂。

朴素连乘 O(n)。分治洞察：**xⁿ = (x^(n/2))²**——子问题规模减半且只算一次：

```ts
function myPow(x: number, n: number): number {
  // 处理负指数
  if (n < 0) return 1 / myPow(x, -n)

  const pow = (x: number, n: number): number => {
    if (n === 0) return 1
    const half = pow(x, n >> 1) // 只递归一次！
    return n % 2 === 0 ? half * half : half * half * x
  }
  return pow(x, n)
}
```

O(n) → O(log n)。关键在 `const half = pow(...)` 存起来复用，若写成 `pow(x, n/2) * pow(x, n/2)` 就重复计算退回 O(n)。**「分治 + 子结果缓存」是快速幂、矩阵快速幂（Fibonacci O(log n) 解法）的共同骨架。**

## 递归转迭代的通用方法论

面试追问「不会栈溢出的递归怎么写」时，给出这三层答案：

1. **手动栈模拟**：把递归栈显式化（树的前序迭代版就是这个思路），任何递归都能这样机械转换
2. **自底向上递推**：找到「最简单的 base case」从它出发正着推——动态规划的本质
3. **尾递归改写**：把「依赖递归返回值的操作」改成参数传递（累加器模式），配合语言 TCO；但注意 JS 引擎不支持 TCO，仍需转 while

```ts
// 尾递归改写示例：阶乘
// 普通版 return n * fact(n-1) —— 乘法依赖返回值，非尾递归
// 尾递归版：结果通过 acc 参数「随身携带」
function factTail(n: number, acc = 1): number {
  if (n <= 1) return acc
  return factTail(n - 1, n * acc)
}
// 语义：acc 始终持有「已经算好的部分」
```

## 分治 vs 动态规划的边界

| | 分治 | 动态规划 |
| ---- | ---- | ---- |
| 子问题关系 | **独立**（不重叠） | **重叠**（被反复使用） |
| 每个子问题 | 只解一次 | 解一次 + 存表复用 |
| 典型 | 归并、快排、二分 | 斐波那契、背包、最短路 |
| 判断信号 | 子问题天然不相遇 | 递归展开出现重复节点 |

**斐波那契是分治吗？** 形式上像（拆成两个子问题），但子问题大量重叠，纯分治会指数爆炸——**重叠子问题把它推向动态规划的怀抱**。分治不缓存，DP 缓存，一字之差。

## 面试要点清单

- [ ] 递归两要素：base case + 递归公式；信任跳跃心法
- [ ] 调用栈的两阶段（递/归）；栈溢出的成因与三种规避
- [ ] 归并排序：稳定性的来源、链表版为什么优于快排
- [ ] 快排最坏退化原因 + 随机化 pivot
- [ ] 主定理三情况，能套算归并/二分的复杂度
- [ ] 归并统计逆序对：合并时「顺手」计数
- [ ] 快速幂：子问题减半且复用子结果，O(log n)
- [ ] 分治与 DP 的分界：子问题是否重叠
