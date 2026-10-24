---
title: 贪心与回溯
icon: compass

category:
  - Algorithms

tag:
  - Interview
  - DataStructure
---

# 贪心与回溯

> 贪心和回溯是两种「决策哲学」的两极：贪心**每步只做当下最优、从不回头**；回溯**穷举所有可能、走错了就退回来换一条路**。加上[动态规划](./dynamic-programming.md)的「记下走过的路」，三者构成了最优化问题的完整决策光谱。

## 贪心算法：局部最优堆出全局最优

### 核心特征

每一步做出**当前看似最优**的选择，且**绝不反悔**：

- 简单高效：通常排序 + 一遍扫描，O(n log n) 封顶
- 风险：局部最优 ≠ 全局最优——**贪心策略的正确性需要证明，不能靠感觉**

### 经典反例：零钱兑换

面额 `[1, 5, 11]`，凑 15：

- 贪心（每次拿最大）：11 + 1×4 = **5 枚**
- 最优：5 + 5 + 5 = **3 枚**

局部最优翻车，这题必须 DP。**什么情况贪心才对？** 面额有整除关系（如 1/5/10/50）时，大面额「性价比」严格占优，贪心安全。这个对比是理解贪心适用边界最好的例子。

### 贪心正确性的两种直觉

1. **交换论证（exchange argument）**：任何最优解都能在不变差的前提下调整成贪心解的形态 → 贪心解就是最优
2. **归纳论证**：第一步贪心后，剩下的问题与原问题同构且独立

面试不要求严格证明，但**要能说清「为什么这样贪不会更差」**。

## 实战一：区间调度（LeetCode 435 无重叠区间家族）⭐

> 给定区间集合，最多能保留多少个互不重叠的区间？（435 是求最少移除数，等价）

**贪心策略选择的艺术**——三种直觉策略对比：

| 策略 | 反例 | 结果 |
| ---- | ---- | ---- |
| 选开始最早的 | 长区间 [1,100] 直接霸占场地 | ✗ |
| 选长度最短的 | [1,3] [2,5] [4,6]：选 [2,5] 只能留 1 个，选 [1,3][4,6] 能留 2 个 | ✗ |
| **选结束最早的** | —— | ✓ |

**结束越早，给后面留的空间越大**——这是「机会成本」思维。正确性直觉：把结束时间排序后逐个选择，任何其他方案都能替换成这种「结束最早」方案而不减少数量。

```ts
function eraseOverlapIntervals(intervals: number[][]): number {
  // 按结束时间升序
  intervals.sort((a, b) => a[1] - b[1])

  let keep = 0
  let end = -Infinity // 上一个选中区间的结束时间

  for (const [start, finish] of intervals) {
    if (start >= end) {
      // 与已选区间不冲突，选中它
      keep++
      end = finish
    }
    // 冲突的直接丢弃（它的结束时间更晚，留着不如已选的那个）
  }
  return intervals.length - keep // 移除数 = 总数 - 保留数
}
```

区间贪心家族（换汤不换药）：

- 452 射气球（按右端排序数箭）、56 合并区间（按左端排序）、763 划分字母区间、621 任务调度器

**区间题口诀：要「尽可能多」的互不重叠区间 → 按右端点排序；要合并覆盖 → 按左端点排序。**

## 实战二：跳跃游戏（LeetCode 55 / 45）⭐

> 55：数组每格是最大跳跃力，能否跳到最后一格？45：求最少跳跃次数。

### 跳跃游戏 I：维护「可达最远」

不用模拟每条路径，只维护一个变量 `maxReach`——**能到达的最远下标**：

```ts
function canJump(nums: number[]): boolean {
  let maxReach = 0
  for (let i = 0; i < nums.length; i++) {
    if (i > maxReach) return false // 当前格子都到不了，更别提后面
    maxReach = Math.max(maxReach, i + nums[i])
    if (maxReach >= nums.length - 1) return true
  }
  return true
}
```

O(n) 一遍扫。这个「维护最远可达」的思路同时是 **55 的判定、45 的计数基础**。

### 跳跃游戏 II：贪心层数 = BFS 思想

最少跳跃数 = BFS 的层数（每一跳能覆盖的格子是下一层）：

```ts
function jump(nums: number[]): number {
  let jumps = 0
  let curEnd = 0 // 当前这一跳能到达的边界
  let farthest = 0 // 下一跳能到达的最远处

  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i])
    if (i === curEnd) {
      // 走到本层边界：无论从哪跳，都必须再跳一次
      jumps++
      curEnd = farthest
    }
  }
  return jumps
}
```

到达 `curEnd` 时必须起跳（哪怕还站在原地附近），跳到历史最远——这就是「当前层结束 = 进入下一层」的 BFS 语义。

## 回溯：系统化穷举的艺术

### 从全排列说起（LeetCode 46）

> 输出 [1,2,3] 的所有排列。

排列 = 一系列决策（第 1 位放谁？第 2 位放谁？……）构成的**决策树**，回溯就是在这棵树上做 DFS：

```
                    []
          /         |         \
        [1]        [2]        [3]        ← 第 1 位的选择
       /   \      /   \      /   \
     [1,2][1,3][2,1][2,3][3,1][3,2]      ← 第 2 位的选择（排除已用的）
       |    |    |    |    |    |
     [1,2,3][1,3,2][2,1,3][2,3,1][3,1,2][3,2,1]   ← 叶子 = 完整排列
```

### 回溯三件套模板 ⭐

```ts
function permute(nums: number[]): number[][] {
  const result: number[][] = []
  const path: number[] = []        // 当前路径（已做的决策）
  const used = new Set<number>()   // 已用元素（剪枝信息）

  const backtrack = () => {
    // 触发结束条件：决策链完整
    if (path.length === nums.length) {
      result.push([...path]) // ⚠️ 必须拷贝！path 还要继续被修改
      return
    }

    for (let i = 0; i < nums.length; i++) {
      if (used.has(i)) continue // 排除不合法选择

      // ① 做选择
      path.push(nums[i])
      used.add(i)

      // ② 进入下一层决策
      backtrack()

      // ③ 撤销选择（回溯的名字由此而来）
      path.pop()
      used.delete(i)
    }
  }

  backtrack()
  return result
}
```

**模板的三个组件**——`for 循环`（本层的所有选择）、`递归`（深入下一层）、`撤销`（回到本层状态）。「撤销选择」保证每条分支都从同一个干净状态出发，这是回溯与普通递归的关键差异。

### 为什么 `result.push([...path])` 必须拷贝？

`path` 是贯穿全程的唯一数组，递归返回后它的内容还会被修改。直接 push 引用，最后 result 里所有项都指向同一个（空的）数组——**这是回溯题第一大坑**。

## 子集与组合：模板的两种变体（LeetCode 78 / 77）

**排列在乎顺序，组合不在乎**——组合用「start 参数」禁止回头选，天然去重：

```ts
// 78. 子集：每个节点都是一个答案（不只叶子）
function subsets(nums: number[]): number[][] {
  const result: number[][] = []
  const path: number[] = []

  const backtrack = (start: number) => {
    result.push([...path]) // 子集题：进入每个节点就收获一次

    // i 从 start 开始：只向后看，保证组合不重（[1,2] 不会再来一次 [2,1]）
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i])
      backtrack(i + 1)
      path.pop()
    }
  }
  backtrack(0)
  return result
}
```

**「什么时候收获答案」区分了三类题**：

| 题型 | 收获时机 | 收获条件 |
| ---- | ---- | ---- |
| 子集 | 每个节点 | 无条件 push |
| 组合/排列 | 叶子 | path 满足长度/和 |
| 切割/棋盘 | 叶子 + 合法性 | 满足约束（回文/N 皇后不互攻） |

### 剪枝：让回溯从「能跑」到「能 AC」

以组合总和 III（找出 k 个数和为 n）为例，两种剪枝：

```ts
const backtrack = (start: number, remaining: number) => {
  // 剪枝①：剩余数字不够凑 k 个，提前终止
  if (path.length > k) return
  // 剪枝②：已超过目标（如果全是正数），不可能再回头变小
  if (remaining < 0) return

  if (path.length === k && remaining === 0) {
    result.push([...path])
    return
  }

  for (let i = start; i <= 9; i++) {
    path.push(i)
    backtrack(i + 1, remaining - i)
    path.pop()
  }
}
```

**剪枝 = 提前识别「这条分支不可能产生答案」**。越早剪掉，决策树越小。常见剪枝：剩余量判断、可行性下界（剩余元素全选也不够）、排序后跳过重复分支。

### 去重剪枝：排序 + 同层跳过（LeetCode 40/47）

输入含重复元素时（如 [1,1,2] 的全排列），`used[i-1]` 技巧：

```ts
nums.sort((a, b) => a - b) // 前提：排序让重复元素相邻

for (let i = 0; i < nums.length; i++) {
  // 同层中相同的值只允许「第一个」被选：
  // !used[i-1] 表示 nums[i-1] 同层已被撤销 —— 说明这一层已经用过这个值
  if (i > 0 && nums[i] === nums[i - 1] && !used.has(i - 1)) continue
  ...
}
```

口诀：**「树层去重」（同层不重复）用 `!used[i-1]`，「树枝去重」（同一条链上）用 `used[i-1]`**。组合总和 II、全排列 II 都靠这一行。

## 实战三：N 皇后（LeetCode 51）⭐

> n×n 棋盘放 n 个皇后，互不攻击（不同行、不同列、不同对角线）。

回溯解决「约束满足问题」的代表。技巧在**约束的 O(1) 判断**：

- 列冲突：`cols` 集合
- 主对角线（↘）：**同一条线上 row - col 恒定**
- 副对角线（↙）：**同一条线上 row + col 恒定**

```ts
function solveNQueens(n: number): string[][] {
  const result: string[][] = []
  const queens: number[] = [] // queens[row] = 该行皇后所在的列

  const cols = new Set<number>()
  const diag1 = new Set<number>() // row - col
  const diag2 = new Set<number>() // row + col

  const backtrack = (row: number) => {
    if (row === n) {
      // 所有行都放好了，渲染棋盘
      result.push(
        queens.map(
          (col) => '.'.repeat(col) + 'Q' + '.'.repeat(n - col - 1)
        )
      )
      return
    }

    for (let col = 0; col < n; col++) {
      if (cols.has(col) || diag1.has(row - col) || diag2.has(row + col)) {
        continue // 剪枝：与已有皇后冲突
      }

      // 做选择：row 行 col 列
      queens.push(col)
      cols.add(col)
      diag1.add(row - col)
      diag2.add(row + col)

      backtrack(row + 1)

      // 撤销选择
      queens.pop()
      cols.delete(col)
      diag1.delete(row - col)
      diag2.delete(row + col)
    }
  }

  backtrack(0)
  return result
}
```

**每行恰放一个皇后**——这个观察把问题从 n² 个格子降到每行 n 种选择。约束用三个 Set 而非每次 O(n) 扫描，是「空间换时间」的又一次应用。

## 贪心 vs 回溯 vs DP：一张表看懂选型

| | 贪心 | 回溯 | 动态规划 |
| ---- | ---- | ---- | ---- |
| 决策方式 | 每步一个选择，不回头 | 穷举所有选择，可撤销 | 穷举 + 记忆化 |
| 时间复杂度 | 通常 O(n log n) | 指数级 O(2^n) / O(n!) | 多项式 O(n²) 等 |
| 适用前提 | 贪心选择性成立 | 解空间可树状枚举 | 重叠子问题 + 最优子结构 |
| 输出 | 一个最优解 | **所有**解 / 任意可行解 | 最优值（可回溯出解） |
| 典型题 | 跳跃游戏、区间调度 | 全排列、N 皇后、数独 | 背包、编辑距离 |

**选型顺序**：先想贪心（最快，能证明就用）→ 不行看是否有重叠子问题（DP）→ 要求所有解或解空间小（回溯）。很多题回溯是暴力 baseline，DP 是优化版（如单词拆分 139 既有回溯解也有 DP 解）。

## 工程里的回溯：正则与语法分析

正则表达式的回溯引擎就是「选择 + 撤销」：`/(a*)*b/` 匹配长串 a 时，`*` 的每种分割都被逐一尝试，失败就回退——**灾难性回溯（Catastrophic Backtracking）**会导致正则匹配复杂度爆炸，这曾是 Cloudflare 大规模宕机的原因（2019 年正则引发的 ReDoS）。工程启示：**回溯的解空间必须被剪枝约束，否则指数爆炸**。

## 面试要点清单

- [ ] 贪心的适用前提；能用零钱兑换反例说明贪心失效场景
- [ ] 区间调度：为什么按「结束最早」排序（对比另两种策略的反例）
- [ ] 跳跃游戏 II 与 BFS 层数的等价关系
- [ ] 回溯三件套模板：做选择 → 递归 → 撤销
- [ ] `[...path]` 拷贝的原因；子集/组合/排列「收获时机」的差异
- [ ] 剪枝两大类：可行性剪枝 + 去重剪枝（`!used[i-1]` 树层去重）
- [ ] N 皇后对角线 O(1) 判断：row-col / row+col
- [ ] 灾难性回溯与 ReDoS：解空间必须受控
