---
title: 动态规划
icon: grid

category:
  - Algorithms

tag:
  - Interview
  - DataStructure
---

# 动态规划

> 动态规划（DP）是面试的分水岭：会的人觉得是套路题，不会的人觉得是天书。其实 DP 只有一件事——**用空间存下「重叠子问题」的答案，让每个子问题只算一次**。

## 从暴力到 DP：以爬楼梯为例（LeetCode 70）

> 每次可以爬 1 或 2 个台阶，求爬到第 n 阶有多少种方法。

### 第一步：暴力递归

到达第 n 阶的最后一步，要么从 n-1 迈 1 步，要么从 n-2 迈 2 步：

```
f(n) = f(n-1) + f(n-2)      f(1) = 1, f(2) = 2
```

```ts
function climb(n: number): number {
  if (n <= 2) return n
  return climb(n - 1) + climb(n - 2)
}
```

O(2^n)——`climb(50)` 跑到天荒地老。**慢的原因**：递归树里 `f(45)` 被算了 2 次、`f(40)` 被算了 8 次……**同一个子问题被反复求解**（对照[递归与分治](./recursion-divide-conquer.md)：分治的子问题不重叠，所以不需要缓存）。

### 第二步：记忆化（自顶向下 DP）

```ts
function climbMemo(n: number, memo = new Map<number, number>()): number {
  if (n <= 2) return n
  if (memo.has(n)) return memo.get(n)! // 算过的直接拿

  const result = climbMemo(n - 1, memo) + climbMemo(n - 2, memo)
  memo.set(n, result)
  return result
}
```

每个 `f(i)` 只真正计算一次，O(n) 时间 + O(n) 空间。这已经就是动态规划了——**「递归 + 缓存 = 记忆化搜索」是 DP 的第一种形态**。

### 第三步：递推（自底向上 DP）

换个方向：从最小的 `f(1)`、`f(2)` 出发**正着推**，这就是 DP 数组：

```ts
function climbStairs(n: number): number {
  if (n <= 2) return n
  const dp = new Array(n + 1).fill(0)
  dp[1] = 1
  dp[2] = 2

  for (let i = 3; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2] // 状态转移方程
  }
  return dp[n]
}
```

### 第四步：空间压缩

`dp[i]` 只依赖前两个状态，整个数组可以压成两个变量：

```ts
function climbStairs(n: number): number {
  if (n <= 2) return n
  let prev = 1
  let cur = 2
  for (let i = 3; i <= n; i++) {
    ;[prev, cur] = [cur, prev + cur]
  }
  return cur
}
```

O(n) 时间 + **O(1) 空间**。这四步演进（暴力 → 记忆化 → 递推 → 压缩）是**所有 DP 题的通用优化路径**。

## DP 的两大前提与三要素

**使用 DP 的前提**（判断一道题是不是 DP）：

1. **最优子结构**：原问题的最优解由子问题的最优解构成
2. **重叠子问题**：递归展开后同一个子问题反复出现（这是 DP 与分治的分界线）

**解题三要素**（遇到任何 DP 题按这个顺序想）：

| 要素 | 问自己 | 爬楼梯的答案 |
| ---- | ---- | ---- |
| 状态定义 | `dp[i]` 的含义是什么？ | 爬到第 i 阶的方法数 |
| 转移方程 | `dp[i]` 由哪些更小的状态推出？ | `dp[i] = dp[i-1] + dp[i-2]` |
| 初始条件 + 边界 | 哪些状态不能由方程推出？ | `dp[1]=1, dp[2]=2` |

**状态定义是灵魂**。同一道题换一个状态定义，难度天差地别（见下文最长递增子序列的两种定义）。

## 实战一：打家劫舍（LeetCode 198）——选或不选

> 相邻房屋不能都偷，求最大偷窃金额。

每个屋子面临选择：**偷（前一家不能偷）或不偷（继承前一家的最优）**。「选/不选」是 DP 最基本的决策结构：

```ts
function rob(nums: number[]): number {
  const n = nums.length
  // dp[i]: 考虑前 i 间房能偷到的最大金额
  const dp = new Array(n + 1).fill(0)
  dp[1] = nums[0]

  for (let i = 2; i <= n; i++) {
    // 不偷第 i 间 vs 偷第 i 间（第 i-1 间必不偷）
    dp[i] = Math.max(dp[i - 1], dp[i - 2] + nums[i - 1])
  }
  return dp[n]
}
```

转移方程 `dp[i] = max(dp[i-1], dp[i-2] + v)` 一行说清所有决策。进阶：213（首尾成环 → 拆成两条链分别跑）、337（树形 DP：`dp[节点][0/1]` 偷或不偷，后序遍历向上汇总）。

## 实战二：最长递增子序列 LIS（LeetCode 300）⭐

> 求最长严格递增子序列的长度。

### 定义一：以 i 结尾的 LIS —— O(n²)

`dp[i]` = **以 nums[i] 结尾**的 LIS 长度（「以 i 结尾」是这一族定义的关键——它把「全局最优」拆成了可递推的局部刻画）：

```ts
function lengthOfLIS(nums: number[]): number {
  const n = nums.length
  const dp = new Array(n).fill(1) // 至少包含自己

  for (let i = 1; i < n; i++) {
    for (let j = 0; j < i; j++) {
      // nums[j] 可以接在 nums[i] 前面时，尝试更新
      if (nums[j] < nums[i]) {
        dp[i] = Math.max(dp[i], dp[j] + 1)
      }
    }
  }
  return Math.max(...dp)
}
```

### 定义二：贪心 + 二分 —— O(n log n)

换一个完全不同的状态：维护数组 `tails`，`tails[k]` = **长度为 k+1 的递增子序列的最小可能结尾**。结尾越小，后面越容易接上去（贪心）：

```ts
function lengthOfLIS(nums: number[]): number {
  const tails: number[] = []

  for (const num of nums) {
    // 在 tails 中找第一个 >= num 的位置（二分）
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] < num) lo = mid + 1
      else hi = mid
    }

    if (lo === tails.length) tails.push(num) // 比所有结尾都大 → LIS 变长
    else tails[lo] = num // 替换：让该长度的结尾更小
  }
  return tails.length
}
```

`tails` 始终有序，所以二分查找有效。**这题展示了「状态定义」的决定性作用**——问「以 i 结尾」是 O(n²)，问「每个长度的最小结尾」是 O(n log n)。

## 实战三：0-1 背包（模板题）⭐⭐

> n 个物品，第 i 个重 `w[i]`、价值 `v[i]`，背包容量 C，每件只能选一次，求最大价值。

背包是**DP 问题的母题**：打家劫舍是「代价为 1 的背包」，零钱兑换是「完全背包」，分割等和子集是「能否恰好装满」。标准解法——二维转一维：

```ts
// dp[c] = 容量 c 下的最大价值
function knapsack(w: number[], v: number[], C: number): number {
  const dp = new Array(C + 1).fill(0)

  for (let i = 0; i < w.length; i++) {
    // 关键：容量倒序遍历！
    for (let c = C; c >= w[i]; c--) {
      dp[c] = Math.max(dp[c], dp[c - w[i]] + v[i])
    }
  }
  return dp[C]
}
```

**倒序是 0-1 背包的灵魂**（面试必问）：`dp[c]` 依赖上一轮的 `dp[c - w[i]]`（保证每件物品只用一次）。若正序遍历，`dp[c - w[i]]` 已被本轮更新，同一件物品会被选中两次——那就变成完全背包了。

### 完全背包：零钱兑换（LeetCode 322）

> 凑出 amount 的最少硬币数，每种硬币无限个。

物品无限 → **容量正序遍历**；求「最少」→ 方程取 min，初始为 ∞：

```ts
function coinChange(coins: number[], amount: number): number {
  const dp = new Array(amount + 1).fill(Infinity)
  dp[0] = 0 // 凑 0 元需要 0 枚硬币

  for (const coin of coins) {
    for (let c = coin; c <= amount; c++) {
      // dp[c - coin] + 1 = 用掉一枚 coin 后的最少硬币数
      dp[c] = Math.min(dp[c], dp[c - coin] + 1)
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount]
}
```

### 背包家族速查

| 问题 | 背包类型 | 遍历顺序 | 方程形式 |
| ---- | ---- | ---- | ---- |
| 0-1 背包 / 目标和（494） | 每件一次 | 容量**倒序** | max / 计数 |
| 零钱兑换（322）/ 零钱兑换 II（518） | 完全背包 | 容量**正序** | min / 组合计数 |
| 分割等和子集（416） | 0-1 背包可行性 | 倒序 | 布尔 or |
| 最后一块石头的石头 II（1049） | 0-1 背包 | 倒序 | max |

## 实战四：编辑距离（LeetCode 72）⭐⭐

> 把 word1 变成 word2，每次可以插入/删除/替换一个字符，求最少操作数。

**二维字符串 DP 的巅峰**。`dp[i][j]` = word1 前 i 个字符变成 word2 前 j 个字符的最少操作数。最后一步只有四种可能：

```
dp[i][j] =
  ① word1[i-1] === word2[j-1]：什么都不用做，dp[i][j] = dp[i-1][j-1]
  ② 替换：dp[i-1][j-1] + 1
  ③ 删除 word1 的一个字符：dp[i-1][j] + 1
  ④ 插入（等价于删除 word2 的一个字符）：dp[i][j-1] + 1
```

```ts
function minDistance(word1: string, word2: string): number {
  const m = word1.length
  const n = word2.length
  // dp[i][j]：word1 前 i 个 → word2 前 j 个的最少操作数
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0))

  // 边界：空串变成长度 k 的串需要 k 次插入（反之 k 次删除）
  for (let i = 1; i <= m; i++) dp[i][0] = i
  for (let j = 1; j <= n; j++) dp[0][j] = j

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (word1[i - 1] === word2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] // 字符相同，白嫖
      } else {
        dp[i][j] =
          Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]) + 1
      }
    }
  }
  return dp[m][n]
}
```

**画 DP 表是最好的 debug 工具**。`horse → ros` 的表（建议手推一遍，DP 手感暴涨）：

```
        ""  r  o  s
    ""   0  1  2  3
    h    1  1  2  3
    o    2  2  1  2
    r    3  2  2  2
    s    4  3  3  2
    e    5  4  4  3   ← 答案 3（horse → rorse → rose → ros）
```

同族题：最长公共子序列（1143）、不同的子序列（115）——二维表 + 「看最后一步」的分析方式完全一致。**而编辑距离就是 diff 工具和 git diff、DNA 序列比对、拼写纠错的实际算法。**

## DP 与贪心的区别

都能做「最优化」，分界线：

- **贪心**：每步做局部最优选择，**不回头**，希望局部最优堆出全局最优（需要证明贪心选择性，如跳跃游戏、区间调度）
- **DP**：枚举所有可能的选择（选/不选、插/删/换），**靠子问题的解比较出全局最优**

一句话判断：**能证明「局部最优 ⟹ 全局最优」用贪心（更快），需要权衡所有路径用 DP（更稳）**。例：零钱兑换任意面额必须 DP；但如果面额是 [1, 5, 10, 50] 这种「倍数体系」，贪心每次拿最大面额就是对的。

## DP 学习路线与题目地图

**按此顺序刷，每道题问「状态定义是什么」**：

1. 线性 DP：爬楼梯（70）→ 打家劫舍（198）→ 最大子数组和（53）→ 单词拆分（139）
2. 双串 DP：最长公共子序列（1143）→ 编辑距离（72）
3. 背包 DP：分割等和子集（416）→ 目标和（494）→ 零钱兑换（322）→ 完全背包排列（377）
4. 区间 DP：最长回文子串（5）→ 戳气球（312）
5. 树形 DP：打家劫舍 III（337）
6. 状态压缩 DP：旅行商问题（ bitmask 系）

## 面试要点清单

- [ ] 四步演进：暴力 → 记忆化 → 递推 → 空间压缩，能现场演示爬楼梯
- [ ] 三要素顺序：先定状态，再推方程，最后补边界
- [ ] LIS 两种解法的状态定义差异（O(n²) → O(n log n)）
- [ ] 0-1 背包为什么倒序、完全背包为什么正序（一维滚动数组）
- [ ] 编辑距离：最后一步四种情况的来源；会手画 DP 表
- [ ] DP vs 贪心的分界与互相转化（零钱兑换的反例）
