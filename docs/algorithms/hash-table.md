---
title: 哈希表
icon: key

category:
  - Algorithms

tag:
  - Interview
  - DataStructure
---

# 哈希表

> 哈希表是「空间换时间」的极致：理论上 O(1) 的查找/插入/删除，让无数 O(n²) 暴力解法优化到 O(n)。它是前端工程师日常用得最多的数据结构（对象、Map、Set 的底层）。

## 核心思想：用计算代替搜索

数组支持 O(1) 随机访问的前提是**下标是整数且连续**。哈希表的思路：

1. 用一个**哈希函数**把任意类型的 key（字符串、数字、对象…）映射成整数下标
2. 用这个下标直接访问数组槽位

```
key = "name" → hash("name") = 3721 → 槽位 3721 % 8 = 1

┌───┬─────────┬───┬───┬───┬───┬───┬───┐
│ 0 │ "name"  │ 2 │ 3 │ 4 │ 5 │ 6 │ 7 │
└───┴─────────┴───┴───┴───┴───┴───┴───┘
              ↑ 直接定位，无需遍历
```

**用一次哈希计算 + 一次数组访问，替代整表遍历。**

## 哈希函数的设计

好的哈希函数要求：**确定性**（同 key 同结果）、**均匀性**（分布均匀减少冲突）、**高效**（计算快）。

常见做法（组合使用）：

1. **除留余数法**：`index = hash(key) % capacity`，capacity 通常取质数以打散规律性输入
2. **乘法哈希**：`index = floor(capacity * (hash * 0.618… % 1))`
3. **字符串常用**：多项式滚动哈希（如 djb2）：

```ts
// djb2 —— 简单但分布不错的经典字符串哈希
function hashCode(key: string): number {
  let hash = 5381
  for (let i = 0; i < key.length; i++) {
    // hash * 33 + charCode，33 是经验魔法数
    hash = (hash << 5) + hash + key.charCodeAt(i)
    hash |= 0 // 强制转 32 位整数（JS 位运算特性）
  }
  return Math.abs(hash)
}
```

::: tip JS 引擎实际怎么做？
V8 对象用「内联缓存 + 隐藏类」优化字符串 key；`Map` 则直接用对象引用的哈希。字符串 key 的对象会先经过字符串哈希。这也解释了 `Map` 和普通对象的差异：**Map 支持任意类型 key、保持插入顺序、频繁增删更快**。
:::

## 哈希冲突：不可避免的问题

鸽笼原理：key 的数量是无限的，槽位是有限的，冲突必然发生。两种主流解法：

### 1. 链地址法（Separate Chaining）

每个槽位挂一条链表（或数组），冲突的元素追加到链上：

```
槽位 3: → [key=A] → [key=F] → [key=K]    ← 三个 key 都 hash 到 3
```

- 查找：定位槽位 O(1) + 遍历链 O(链长)
- 负载因子（元素数/槽位数）可以超过 1
- Java 8 的 `HashMap` 在链长 ≥ 8 时把链表转红黑树，最坏从 O(n) 降到 O(log n)

### 2. 开放地址法（Open Addressing）

冲突了就按规则探测下一个空槽：

- **线性探测**：`+1, +2, +3…` 简单但容易「聚集」（clustering）导致长探测链
- **二次探测**：`+1², +2², +3²…` 缓解聚集
- **双重哈希**：用第二个哈希函数决定步长，分布最均匀

开放地址对**删除**很讲究：直接置空会截断后续探测链，必须打「墓碑标记（tombstone）」或定期重建。V8 的 `Map` 早期实现用了开放寻址的变体。

### 两种方案对比

| | 链地址 | 开放地址 |
| ---- | ---- | ---- |
| 负载因子上限 | > 1 | < 1（通常 0.75 触发扩容） |
| 缓存友好性 | 差（链表跳转） | 好（连续内存） |
| 删除 | 直接删链表节点 | 需要墓碑 |
| 典型实现 | Java HashMap | Python dict、Redis dict |

## 扩容与 rehash

负载因子超过阈值（如 0.75）时性能开始劣化，需要扩容：

1. 分配一个 2 倍大小的新数组
2. 把所有元素**重新哈希**放入新数组（`hash % capacity` 变了，不能直接搬）

**渐进式 rehash**（Redis 的经典设计）：一次性搬迁大表会卡顿，Redis 用新旧两张表，每次增删改查顺带搬迁一小批，把成本摊到每次操作里——这是「摊还思想」在工程里的完美应用。

## 手写哈希表（链地址法）

```ts
class HashTable<K, V> {
  private buckets: Array<Array<{ key: K; value: V }>>
  private size = 0
  private static readonly DEFAULT_CAPACITY = 16
  private static readonly LOAD_FACTOR = 0.75

  constructor(capacity = HashTable.DEFAULT_CAPACITY) {
    this.buckets = new Array(capacity).fill(null).map(() => [])
  }

  private hash(key: K): number {
    const str = String(key)
    let h = 5381
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) + h + str.charCodeAt(i)) | 0
    }
    return Math.abs(h) % this.buckets.length
  }

  set(key: K, value: V): void {
    const bucket = this.buckets[this.hash(key)]

    // key 已存在则覆盖
    for (const entry of bucket) {
      if (entry.key === key) {
        entry.value = value
        return
      }
    }
    bucket.push({ key, value })
    this.size++

    // 超过负载因子 → 扩容 + 全量 rehash
    if (this.size / this.buckets.length > HashTable.LOAD_FACTOR) {
      this.rehash()
    }
  }

  get(key: K): V | undefined {
    const bucket = this.buckets[this.hash(key)]
    return bucket.find((entry) => entry.key === key)?.value
  }

  delete(key: K): boolean {
    const bucket = this.buckets[this.hash(key)]
    const index = bucket.findIndex((entry) => entry.key === key)
    if (index === -1) return false
    bucket.splice(index, 1)
    this.size--
    return true
  }

  private rehash(): void {
    const oldBuckets = this.buckets
    this.buckets = new Array(oldBuckets.length * 2)
      .fill(null)
      .map(() => [])
    this.size = 0

    // capacity 变了，每个 key 的槽位都要重算
    for (const bucket of oldBuckets) {
      for (const entry of bucket) {
        this.set(entry.key, entry.value)
      }
    }
  }
}
```

## 实战一：两数之和（LeetCode 1）⭐

> 给定数组和 target，找出和为 target 的两个数，返回下标。

**思路反转是精髓**：不是「对每个 x 搜索 target - x」（O(n) 搜索 × n 次 = O(n²)），而是遍历到每个数时问：**「我需要的搭档（target - x）之前出现过吗？」**——把「搜索过去」变成哈希表 O(1) 查询：

```ts
function twoSum(nums: number[], target: number): number[] {
  const seen = new Map<number, number>() // 值 → 下标

  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i]
    if (seen.has(need)) {
      return [seen.get(need)!, i]
    }
    // 先查再存，保证不会用到自己（同一元素不能重复用）
    seen.set(nums[i], i)
  }
  return []
}
```

一次遍历 O(n)。**「一边遍历一边把已见元素存入哈希表，用 O(1) 查询替代内层搜索」——这个模式叫哈希表预热/查表法，适用于一大类问题。**

## 实战二：字母异位词分组（LeetCode 49）

> 把字母异位词（字母相同、顺序不同，如 ate/eat/tea）分到同一组。

异位词需要一个「与顺序无关」的 key，两种构造：

```ts
function groupAnagrams(strs: string[]): string[][] {
  // 方案一：排序后的字符串作为 key —— eat/tea/tea 排序后都是 "aet"
  // 方案二（更优）：26 个字母的计数编码作为 key，O(L) 而非 O(L log L)
  const map = new Map<string, string[]>()

  for (const str of strs) {
    const count = new Array(26).fill(0)
    for (const ch of str) count[ch.charCodeAt(0) - 97]++
    // "1,0,0,...,1" 形式的编码，同字母组合必然同码
    const key = count.join(',')
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(str)
  }
  return [...map.values()]
}
```

**核心套路：为「等价类」设计规范 key**（排序结果 / 计数编码），让哈希表自动完成分组。

## 实战三：最长连续序列（LeetCode 128）⭐

> 无序数组，找出最长连续数字序列的长度（如 [100,4,200,1,3,2] → 1,2,3,4 长度 4），要求 O(n)。

排序是 O(n log n)，达不到要求。哈希解法的关键洞察：**只从「序列起点」开始数**。一个数 x 是起点当且仅当 x-1 不在集合里，这样每个数最多被访问两次：

```ts
function longestConsecutive(nums: number[]): number {
  const set = new Set(nums)
  let longest = 0

  for (const num of set) {
    // 只从起点出发：num - 1 不存在，说明 num 是某个连续序列的开头
    if (!set.has(num - 1)) {
      let cur = num
      let length = 1
      while (set.has(cur + 1)) {
        cur++
        length++
      }
      longest = Math.max(longest, length)
    }
  }
  return longest
}
```

复杂度分析是本题的灵魂：看似双重循环，但**每个数字只会在它所在的唯一序列中被完整访问一次**（非起点直接被 `if` 拦下），总次数 O(2n) = O(n)。

## 哈希表思维定式总结

遇到以下信号，优先想到哈希表：

| 信号 | 典型题 | 套路 |
| ---- | ---- | ---- |
| 「存在吗 / 出现几次」 | 存在重复元素、第一个唯一字符 | 计数 Map |
| 「两数之和 / 找搭档」 | 两数之和、三数之和优化 | 边查边存 |
| 「分组 / 归类」 | 异位词分组 | 设计规范 key |
| 「O(1) 定位 + 高频移动」 | LRU 缓存 | 哈希 + 双向链表 |
| 「去重」 | 数组去重、交集 | Set |

**代价意识**（面试加分点）：

- 空间 O(n)，数据量超大时要考虑内存
- 最坏情况退化：哈希碰撞攻击（构造大量同哈希 key 打挂服务），防御方案是随机化哈希种子
- 需要有序遍历时用有序 Map（红黑树底层，O(log n)）而不是普通哈希 Map

## 面试要点清单

- [ ] 哈希函数三要求：确定性、均匀性、高效
- [ ] 两种冲突解法的原理与取舍（链地址 vs 开放地址）
- [ ] 负载因子、扩容 rehash、Redis 渐进式 rehash
- [ ] JS 中 Object 与 Map 的底层差异与选型
- [ ] 两数之和「先查后存」为什么能防止重复使用自身
- [ ] 最长连续序列为什么是 O(n)：只有序列起点才启动内层循环
