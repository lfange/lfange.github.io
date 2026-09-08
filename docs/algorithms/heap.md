---
title: 堆与优先队列
icon: fire

category:
  - Algorithms

tag:
  - Interview
  - DataStructure
---

# 堆与优先队列

> 「优先队列」是需求：取的永远是优先级最高的元素；「堆」是实现满足这个需求的最优数据结构。Top-K、合并 K 路归并、任务调度、Dijkstra 最短路，全部依赖它。

## 从需求出发：为什么是堆

普通队列先来先服务；但很多时候需要**按优先级出队**：

- 操作系统调度：优先级最高的进程先跑
- 电商秒杀：出价最高的人中标
- 海量数据找最大的 100 个数

朴素做法：无序数组插入 O(1)、取最值 O(n)；有序数组取 O(1)、插入 O(n)。**堆两者都做到 O(log n)**，用二叉堆实现时还只需要一个数组。

## 二叉堆的结构：完全二叉树 + 数组存储

二叉堆是一棵**完全二叉树**（只允许最后一层右侧缺节点），且满足**堆序性质**：

- **大顶堆（max-heap）**：每个节点 ≥ 它的孩子，堆顶是全局最大
- **小顶堆（min-heap）**：每个节点 ≤ 它的孩子，堆顶是全局最小

```
大顶堆示例：              数组存储（层序填入，无空洞）：

        50                index:  0   1   2   3   4   5   6
       /  \                       50  30  40  10  20  35  25
     30    40                    val:  ↑堆顶
    / \   /  \
  10  20 35  25
```

完全二叉树 + 数组的绝配在于**下标计算**（设节点下标为 `i`，数组 0 起点）：

```ts
parent(i) = Math.floor((i - 1) / 2)
leftChild(i)  = 2 * i + 1
rightChild(i) = 2 * i + 2
```

不需要任何指针，父子关系靠算术直接得出——这是完全二叉树「不浪费任何槽位」带来的红利，也是堆比链式树缓存更友好的原因。

::: tip 为什么不直接用有序数组？
「找最值 O(1) + 插入 O(log n)」与有序数组的「找 O(1) + 插入 O(n)」相比，堆的关键优势是**插入和删除堆顶只扰动一条从根到叶的路径**，而有序数组插入要整体右移。堆牺牲了「全局有序」——它只保证父 ≥ 子，兄弟之间无序——换来维护成本的大幅降低。
:::

## 两个核心操作：上浮与下沉

### 上浮（swim / sift-up）：插入后向上修复

新元素插到**数组末尾**（保持完全二叉树形态），然后不断与父节点比较，比父大（大顶堆）就交换，直到不比父大或到顶：

```ts
private swim(arr: number[], i: number): void {
  while (i > 0) {
    const parent = (i - 1) >> 1
    if (arr[i] <= arr[parent]) break // 不比父大，修复完成
    ;[arr[i], arr[parent]] = [arr[parent], arr[i]]
    i = parent
  }
}
```

路径最长是叶子到根 = 树高 = **O(log n)**。

### 下沉（sink / sift-down）：删除堆顶后向下修复

删除堆顶的正确姿势：**把数组最后一个元素搬到堆顶**（保持形态），然后不断与「较大的孩子」比较交换，直到两个孩子都不比它大：

```ts
private sink(arr: number[], i: number, size: number): void {
  while (true) {
    const left = 2 * i + 1
    const right = 2 * i + 2
    let largest = i

    if (left < size && arr[left] > arr[largest]) largest = left
    if (right < size && arr[right] > arr[largest]) largest = right
    if (largest === i) break // 已经比两个孩子都大，修复完成

    ;[arr[i], arr[largest]] = [arr[largest], arr[i]]
    i = largest
  }
}
```

注意是和**较大的孩子**交换（大顶堆）——如果和较小的孩子换，换完还比另一个孩子小，堆序依旧破坏。

## 手写大顶堆

```ts
class MaxHeap {
  private heap: number[] = []

  get size(): number {
    return this.heap.length
  }

  peek(): number | undefined {
    return this.heap[0]
  }

  // 插入：追加到尾部 + 上浮
  push(val: number): void {
    this.heap.push(val)
    this.swim(this.heap.length - 1)
  }

  // 删除堆顶：尾部补位 + 下沉
  pop(): number | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]
    const last = this.heap.pop()!
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.sink(0, this.heap.length)
    }
    return top
  }

  private swim(i: number): void {
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.heap[i] <= this.heap[parent]) break
      ;[this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]]
      i = parent
    }
  }

  private sink(i: number, size: number): void {
    while (true) {
      const left = 2 * i + 1
      const right = 2 * i + 2
      let largest = i
      if (left < size && this.heap[left] > this.heap[largest]) largest = left
      if (right < size && this.heap[right] > this.heap[largest]) largest = right
      if (largest === i) break
      ;[this.heap[i], this.heap[largest]] = [this.heap[largest], this.heap[i]]
      i = largest
    }
  }
}
```

### 建堆：heapify 的 O(n) 复杂度 ⭐

把乱序数组变成堆，可以逐个 push（O(n log n)），但更快的做法是**自底而下、从最后一个非叶节点开始逐个下沉**：

```ts
function heapify(arr: number[]): void {
  // 最后一个非叶节点是 parent(n-1) = (n-2)/2
  for (let i = (arr.length - 2) >> 1; i >= 0; i--) {
    // 下沉修复（实现同上）
    sink(arr, i, arr.length)
  }
}
```

**为什么是 O(n) 而不是 O(n log n)**（面试高频追问）：下沉的成本正比于「到叶子的距离」。数组里**一半的节点是叶子（距离 0，不用处理），只有 1/4 的节点距离为 1，1/8 为 2…**。求和：

```
Σ (距离 d 的节点数 × d) = Σ (n/2^(d+1) × d) = n × Σ(d / 2^(d+1)) ≈ n × 常数 = O(n)
```

高度越大的节点越少，越贵的操作出现得越稀疏——这就是 heapify 比逐个插入快的数学本质。

## 堆排序

建堆 O(n) + n 次「堆顶与尾部交换 + sink 一次」，总体 O(n log n)、原地、空间 O(1)：

```ts
function heapSort(arr: number[]): number[] {
  // 1. 建大顶堆
  for (let i = (arr.length - 2) >> 1; i >= 0; i--) sink(arr, i, arr.length)

  // 2. 反复取堆顶放到尾部
  for (let end = arr.length - 1; end > 0; end--) {
    ;[arr[0], arr[end]] = [arr[end], arr[0]] // 最大值归位
    sink(arr, 0, end) // 堆大小减一后修复
  }
  return arr
}
```

堆排序的缺点：下沉每次跳到另一侧的节点，**缓存局部性差**，实测通常比快排/归并慢；且它是不稳定的。但它的 O(n log n) 是**最坏情况保证**（不像快排会退化），所以它是 `Introsort`（C++ `std::sort` 的实现）在快排表现不佳时的兜底。

## 实战一：Top-K 问题（LeetCode 215）⭐⭐

> 找数组中第 K 个最大元素。

这是堆最经典的应用，存在三种解法，复杂度与适用场景完全不同：

| 解法 | 时间 | 空间 | 适用场景 |
| ---- | ---- | ---- | ---- |
| 全排序 | O(n log n) | O(1)~O(n) | 能 AC 但没有考点 |
| 小顶堆维护 K 个 | **O(n log k)** | O(k) | 数据流、海量数据（k ≪ n） |
| 快速选择（ partition） | 平均 O(n) | O(1) | 内存放得下、允许平均复杂度 |

### 堆解法的反直觉之处

找**最大**的 K 个，用**小顶堆**——堆里维护「当前的 K 强」，堆顶是 K 强里最弱的，新来的选手只要打赢堆顶就能挤进去：

```ts
function findKthLargest(nums: number[], k: number): number {
  // 小顶堆：js 没有原生堆，用这层比较器区分大小顶
  const heap = new MinHeap()
  for (const num of nums) {
    heap.push(num)
    if (heap.size > k) heap.pop() // 超过 k 个，淘汰当前最小的
  }
  return heap.peek()! // 堆顶 = 第 k 大
}
```

**海量数据场景是堆解法的杀手锏**：10 亿个数找 top 100，排序需要全部载入内存；小顶堆只要 O(k) 空间，数据可以流式处理（甚至分布在多台机器上，每台出 top k 再汇总）。

### 快速选择：平均 O(n) 的替代方案

借用快排的 partition——pivot 归位后，如果恰好在第 k 位就找到了；否则只递归一侧：

```ts
function findKthLargest(nums: number[], k: number): number {
  const target = nums.length - k // 第 k 大 = 升序第 n-k 位

  let lo = 0
  let hi = nums.length - 1
  while (true) {
    const p = partition(nums, lo, hi)
    if (p === target) return nums[p]
    if (p < target) lo = p + 1
    else hi = p - 1
  }
  // 每轮只保留一侧 → n + n/2 + n/4 + ... = 2n = O(n)
}

function partition(nums: number[], lo: number, hi: number): number {
  const pivot = nums[hi]
  let i = lo
  for (let j = lo; j < hi; j++) {
    if (nums[j] < pivot) {
      ;[nums[i], nums[j]] = [nums[j], nums[i]]
      i++
    }
  }
  ;[nums[i], nums[hi]] = [nums[hi], nums[i]]
  return i
}
```

快速选择平均 O(n) 但最坏 O(n²)（可随机化 pivot 规避）；堆解法稳定 O(n log k)。面试先讲堆，追问优化再上快速选择。

## 实战二：合并 K 个升序链表（LeetCode 23）⭐

> K 个有序链表合成一个。K 路归并是外部排序（大文件排序）的核心子问题。

两两合并是 O(N·K)；把「K 个链表的当前头节点」放进小顶堆，每次弹出全局最小的，再把它链表的下一个节点入堆：

```ts
function mergeKLists(lists: Array<ListNode | null>): ListNode | null {
  const dummy = new ListNode(0)
  let tail = dummy

  // 小顶堆按节点值比较
  const heap = new MinHeap<ListNode>((a, b) => a.val - b.val)
  for (const head of lists) {
    if (head) heap.push(head)
  }

  while (heap.size > 0) {
    const node = heap.pop()!
    tail.next = node
    tail = node
    if (node.next) heap.push(node.next) // 该链表后继接棒入堆
  }

  return dummy.next
}
```

N 为总节点数：每个节点入堆出堆各一次，每次 O(log K)，总 **O(N log K)**——K 越大相对越划算。

## 实战三：前 K 个高频元素（LeetCode 347）

> 返回数组中出现频率前 K 高的元素。

哈希统计 + Top-K 小顶堆，两种结构的组合拳：

```ts
function topKFrequent(nums: number[], k: number): number[] {
  // 1. 哈希表统计频率
  const freq = new Map<number, number>()
  for (const num of nums) freq.set(num, (freq.get(num) ?? 0) + 1)

  // 2. 小顶堆维护 K 个高频元素（按频率比较）
  const heap = new MinHeap<[number, number]>((a, b) => a[1] - b[1])
  for (const entry of freq) {
    heap.push(entry)
    if (heap.size > k) heap.pop() // 淘汰频率最低的
  }

  return heap.toArray().map((entry) => entry[0])
}
```

桶排序可以达到严格 O(n)（频率范围 1~n，按频率建桶），但堆解法更通用，是面试首选讲法。

## 工程中的堆

| 系统 | 用法 |
| ---- | ---- |
| JS 事件循环 | 按到期时间排序的定时器，小顶堆管理 |
| 浏览器渲染 | 渲染任务按优先级调度（Chromium 的 task queue 底层有堆思想） |
| Linux 调度器 | CFS 用红黑树，实时进程用优先级堆 |
| Dijkstra / A* | 小顶堆取「当前距离最小的未定点」 |
| 定时任务系统 | 海量定时器的最近到期时间查询 |
| 大文件外部排序 | 内存装不下时切块排序，K 路归并用堆 |

::: tip JS 生态现状
JavaScript 没有原生优先队列。V8 内部有实现但不暴露。实际工程：小规模可用排序数组模拟（`sort + pop`），高性能场景用 `jsbinaryheap`、`heap-js` 等库，或面试手写（本文实现约 40 行）。2025 年起 TC39 有 `BinaryHeap` 提案在讨论中。
:::

## 面试要点清单

- [ ] 数组下标公式：parent/left/right 的算术关系
- [ ] 上浮 vs 下沉各自修复什么场景；下沉为什么和较大的孩子换
- [ ] heapify 为什么是 O(n)：按高度分层的求和直觉
- [ ] Top-K 找最大用小顶堆、找最小用大顶堆（反着的，想清楚为什么）
- [ ] 堆解法 vs 快速选择的复杂度与场景取舍
- [ ] 堆排序不稳定、缓存不友好，但最坏 O(n log n)
- [ ] 合并 K 路为什么是 O(N log K)
