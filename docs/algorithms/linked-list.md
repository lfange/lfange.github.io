---
title: 链表
icon: link

category:
  - Algorithms

tag:
  - Interview
  - DataStructure
---

# 链表

> 链表是面试中考得最深的数据结构——它考察指针操作、边界意识、递归思维，一道「反转链表」就能筛掉一半候选人。

## 为什么需要链表

数组是最基础的线性结构，但它有两个天然短板：

1. **插入/删除是 O(n)**：内存连续，中间插入一个元素，后面所有元素都要搬家。
2. **长度固定**（静态数组）：扩容必须申请新内存再整体拷贝。

链表的思路是：**放弃内存连续性，换取插入删除的自由**。每个元素（节点）除了存数据，还存一个指向下一个节点的引用（指针），像糖葫芦一样串起来。

```
内存视角对比：

数组（连续内存）：  [1] [3] [5] [8] [9]     ← 地址可计算：base + i * size
链表（散落内存）：  [1·ptr]──→ [5·ptr]──→ [3·ptr]──→ [9·null]
                     0x7f2a     0x3a10      0x9c44     0x21e8   ← 地址随机分布
```

这就决定了链表的核心取舍：

| 操作 | 数组 | 链表 |
| ---- | ---- | ---- |
| 随机访问 `arr[i]` | O(1) | O(n)（必须从头走） |
| 头部插入/删除 | O(n) | **O(1)** |
| 尾部插入（有 tail 指针） | O(1) 摊还 | O(1) |
| 中间插入/删除（已知位置） | O(n) 搬移 | **O(1)** 改指针 |
| 缓存友好性 | 极好（预取命中） | 差（缓存行频繁失效） |

::: tip 面试常问：为什么链表实际性能往往不如数组？
CPU 缓存以缓存行（通常 64 字节）为单位加载内存。数组元素相邻，一次预取能带上后面十几个元素；链表节点散落在堆内存各处，每次跳转都是一次潜在的 cache miss。所以**理论复杂度占优的操作，实测未必快**——这是「算法复杂度 ≠ 真实性能」的经典例子。
:::

## 节点定义

```ts
class ListNode<T> {
  val: T
  next: ListNode<T> | null

  constructor(val: T, next: ListNode<T> | null = null) {
    this.val = val
    this.next = next
  }
}
```

LeetCode 中的链表题通常给出：

```ts
// 单向链表
interface ListNode {
  val: number
  next: ListNode | null
}
```

## 手写单链表

设计链表的完整实现（对应 LeetCode 707. 设计链表），这是检验链表基本功的题，**每一个边界都值得推敲**：

```ts
class MyLinkedList {
  private size = 0
  private head: ListNode<number> | null = null
  // 哨兵节点：next 永远指向真正的头节点
  // 有了它，「头部插入」和「中间插入」逻辑统一，不用单独判空
  private sentinel = new ListNode(0)

  get(index: number): number {
    if (index < 0 || index >= this.size) return -1
    let cur = this.sentinel.next!
    for (let i = 0; i < index; i++) cur = cur.next!
    return cur.val
  }

  addAtHead(val: number): void {
    this.addAtIndex(0, val)
  }

  addAtTail(val: number): void {
    this.addAtIndex(this.size, val)
  }

  // 核心方法：在第 index 个节点前插入
  addAtIndex(index: number, val: number): void {
    if (index > this.size) return
    index = Math.max(0, index)

    // 找到前驱节点（第 index - 1 个），哨兵让 index=0 也有前驱
    let prev = this.sentinel
    for (let i = 0; i < index; i++) prev = prev.next!

    // 插入三步曲：先接后断
    prev.next = new ListNode(val, prev.next)
    this.size++
  }

  deleteAtIndex(index: number): void {
    if (index < 0 || index >= this.size) return

    let prev = this.sentinel
    for (let i = 0; i < index; i++) prev = prev.next!

    prev.next = prev.next!.next
    this.size--
  }
}
```

**三个工程要点**：

1. **哨兵节点（dummy head）**：链表题第一直觉应该是「建个 dummy」。它消除了对头节点的特判，删除头节点和删除中间节点逻辑完全一致。
2. **删除节点必须找到前驱**：单向链表拿不到 `prev`，所以遍历时常让指针停在「前一个」位置。
3. **JS/TS 中无需手动释放内存**：被断开的节点没有引用后会被 GC 回收。但在 C/C++ 里必须 `free(node)`，否则内存泄漏——面试官可能会追问这点。

## 双向链表与循环链表

### 双向链表

每个节点多一个 `prev` 指针，代价是每个节点多 8 字节（64 位系统）+ 维护成本，收益是**O(1) 删除任意给定节点**（不用找前驱了）：

```ts
class DoublyNode<T> {
  val: T
  prev: DoublyNode<T> | null = null
  next: DoublyNode<T> | null = null
  constructor(val: T) {
    this.val = val
  }
}
```

双向链表 + 哈希表 = **LRU 缓存**的标准底层结构（见下文实战）。

### 循环链表

尾节点的 `next` 指回头节点。典型应用：约瑟夫环问题、CPU 时间片轮转调度的就绪队列。判断链表是否有环也是高频题（见下文）。

## 实战一：反转链表（LeetCode 206）

> 给你单链表的头节点 head，请你反转链表，并返回反转后的链表。

### 迭代法（三指针）

```ts
function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null
  let cur = head

  while (cur) {
    const next = cur.next // 1. 先保存后继，否则断链
    cur.next = prev       // 2. 反转当前指针
    prev = cur            // 3. prev 前进
    cur = next            // 4. cur 前进
  }
  // 循环结束时 cur === null，prev 恰好是新的头
  return prev
}
```

执行过程演示（以 `1→2→3→null` 为例）：

```
初始:  prev=null   cur=1→2→3
第1轮: prev=1→null      cur=2→3
第2轮: prev=2→1→null    cur=3
第3轮: prev=3→2→1→null  cur=null  → 结束，返回 3→2→1
```

时间 O(n)，空间 O(1)。

### 递归法

```ts
function reverseList(head: ListNode | null): ListNode | null {
  // base case：空链表或只剩一个节点，无需反转
  if (head === null || head.next === null) return head

  // 递归反转 head 之后的部分，得到 newHead（原链表的尾）
  const newHead = reverseList(head.next)

  // head.next 是反转后子链表的尾节点，让它指回 head
  head.next.next = head
  head.next = null // head 变成新的尾，必须断开防止成环

  return newHead
}
```

递归的优雅在于视角：**「反转整个链表」=「反转 head.next 开始的链表，再把 head 接到尾部」**。时间 O(n)，空间 O(n)（递归栈），所以生产代码用迭代版。

### 进阶：反转区间 [left, right]（LeetCode 92）

头插法：把 `[left, right]` 内的节点逐个插到区间头部前面。

```ts
function reverseBetween(
  head: ListNode | null,
  left: number,
  right: number
): ListNode | null {
  const dummy = new ListNode(0, head)

  // 1. 走到 left 的前驱
  let prev = dummy
  for (let i = 0; i < left - 1; i++) prev = prev.next!

  // 2. 头插法反转区间
  let cur = prev.next!
  for (let i = 0; i < right - left; i++) {
    const next = cur.next!
    cur.next = next.next
    next.next = prev.next
    prev.next = next
  }

  return dummy.next
}
```

## 实战二：环形链表（LeetCode 141 / 142）

> 判断链表中是否有环；如果有，返回入环的第一个节点。

### 哈希表法（能做，但不是最优）

遍历并把节点塞进 `Set`，遇到重复即有环。时间 O(n)，空间 O(n)。

### Floyd 判圈（快慢指针）——必会

**判断是否有环（141）**：慢指针一次走一步，快指针一次走两步。若无环，快指针先到 `null`；若有环，快指针终将追上慢指针（差距每次缩小 1，必然追平）。

```ts
function hasCycle(head: ListNode | null): boolean {
  let slow = head
  let fast = head

  while (fast && fast.next) {
    slow = slow!.next
    fast = fast.next.next
    if (slow === fast) return true
  }
  return false
}
```

**找入环点（142）**——数学推导是面试亮点：

设头到入环点距离为 `a`，入环点到相遇点为 `b`，环剩余部分为 `c`。

- 相遇时：慢指针走了 `a + b`，快指针走了 `a + b + n(b + c)`（n 为快指针多绕的圈数）
- 快指针速度是慢指针 2 倍：`a + b + n(b+c) = 2(a + b)`
- 化简得：`a = (n - 1)(b + c) + c`

结论：**一个指针从 head 出发，另一个从相遇点出发，都一次走一步，它们会在入环点相遇**。

```ts
function detectCycle(head: ListNode | null): ListNode | null {
  let slow = head
  let fast = head

  // 第一阶段：找相遇点
  while (fast && fast.next) {
    slow = slow!.next
    fast = fast.next.next
    if (slow === fast) {
      // 第二阶段：同速前进找入环点
      let p = head
      while (p !== slow) {
        p = p!.next
        slow = slow!.next
      }
      return p
    }
  }
  return null
}
```

时间 O(n)，空间 O(1)。

## 实战三：合并两个有序链表（LeetCode 21）

```ts
function mergeTwoLists(
  l1: ListNode | null,
  l2: ListNode | null
): ListNode | null {
  const dummy = new ListNode(0)
  let tail = dummy

  while (l1 && l2) {
    if (l1.val <= l2.val) {
      tail.next = l1
      l1 = l1.next
    } else {
      tail.next = l2
      l2 = l2.next
    }
    tail = tail.next
  }
  // 剩余部分直接接上（剩余的本身就是有序的）
  tail.next = l1 ?? l2

  return dummy.next
}
```

这道题是**归并排序的合并环节**，也是「合并 K 个升序链表（LeetCode 23）」的基础——K 个链表用小顶堆优化到 O(N log K)，见[堆](./heap.md)一篇。

## 实战四：LRU 缓存（LeetCode 146）⭐

> 设计并实现数据结构，满足 `get(key)` 和 `put(key, value)`，要求 O(1)。容量超出时淘汰「最近最少使用」的键。

这是链表 + 哈希的经典组合题，考察双向链表的完整功力：

- **哈希表**：key → 链表节点，O(1) 定位
- **双向链表**：按使用时间排序，头最新尾最旧；双向指针让删除任意节点 O(1)

```ts
class LRUCache {
  private capacity: number
  private map = new Map<number, DoublyNode>() // key → node
  // 两个哨兵：head侧最新，tail侧最旧
  private head = new DoublyNode(0)
  private tail = new DoublyNode(0)

  constructor(capacity: number) {
    this.capacity = capacity
    this.head.next = this.tail
    this.tail.prev = this.head
  }

  get(key: number): number {
    const node = this.map.get(key)
    if (!node) return -1
    this.moveToFront(node) // 访问过 = 最新，移到头部
    return node.val as number
  }

  put(key: number, value: number): void {
    let node = this.map.get(key)
    if (node) {
      node.val = value
      this.moveToFront(node)
      return
    }

    // 容量满：先淘汰尾部（最旧）
    if (this.map.size >= this.capacity) {
      const oldest = this.tail.prev!
      this.remove(oldest)
      this.map.delete(oldest.key as number)
    }

    node = new DoublyNode(value)
    node.key = key
    this.addToFront(node)
    this.map.set(key, node)
  }

  // ---- 双向链表四个原子操作 ----

  private addToFront(node: DoublyNode): void {
    node.prev = this.head
    node.next = this.head.next
    this.head.next!.prev = node
    this.head.next = node
  }

  private remove(node: DoublyNode): void {
    node.prev!.next = node.next
    node.next!.prev = node.prev
  }

  private moveToFront(node: DoublyNode): void {
    this.remove(node)
    this.addToFront(node)
  }
}

class DoublyNode {
  key: number | null = null
  val: number | null = null
  prev: DoublyNode | null = null
  next: DoublyNode | null = null
  constructor(val?: number) {
    if (val !== undefined) this.val = val
  }
}
```

::: warning 为什么不用单链表？
`get` 命中后要把节点移到头部 = 「删除中间节点 + 头部插入」。单链表删除需要前驱，只能 O(n)；双向链表节点自带 `prev`，O(1) 完成。
:::

::: tip 工程捷径
JS 的 `Map` 本身就按插入顺序迭代，且 `get` 后重新 `set` 会刷新顺序，所以用两个 Map API 也能实现：`map.delete(key)` + `map.set(key, value)`。面试时可以先讲清双向链结构，再提这个简化版。
:::

## 快慢指针家族

快慢指针不止用于判圈，是链表的通用技巧：

| 问题 | 快慢策略 |
| ---- | ---- |
| 找链表中点（148/109） | 快走 2 步、慢走 1 步，快到尾时慢在中点 |
| 删除倒数第 N 个节点（19） | 快指针先走 n 步，然后同速前进，慢指针停在待删节点前驱 |
| 判断回文链表（234） | 找中点 → 反转后半段 → 双向比对 |

删除倒数第 N 个节点示例（一次遍历）：

```ts
function removeNthFromEnd(head: ListNode | null, n: number): ListNode | null {
  const dummy = new ListNode(0, head)
  let fast: ListNode | null = dummy
  let slow: ListNode | null = dummy

  for (let i = 0; i < n; i++) fast = fast.next!

  while (fast.next) {
    fast = fast.next
    slow = slow!.next
  }
  slow!.next = slow!.next!.next
  return dummy.next
}
```

## 面试要点清单

- [ ] 反转链表：迭代 + 递归双解法，能白板写出三指针过程
- [ ] 哨兵节点的作用：统一头部/中间操作，消灭特判
- [ ] Floyd 判圈：为什么快慢一定相遇？入环点公式怎么推？
- [ ] LRU：为什么必须双向链表 + 哈希，缺一个会怎样？
- [ ] 合并有序链表是归并排序的子过程，复杂度 O(m+n)
- [ ] 链表 vs 数组的真实性能差异：CPU 缓存行的角度
