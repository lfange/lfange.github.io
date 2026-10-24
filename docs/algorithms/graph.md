---
title: 图论基础
icon: share-2

category:
  - Algorithms

tag:
  - Interview
  - DataStructure
---

# 图论基础

> 图是最通用的数据结构：树是图的特例（无环连通图），链表是退化的树。社交网络、地图导航、依赖解析、网页链接——现实世界的多数关系型问题，建模后都是图问题。

## 图的概念与分类

图 G = (V, E)：顶点集合 V + 边集合 E。

| 分类维度 | 类型 | 说明 |
| ---- | ---- | ---- |
| 方向 | 无向图 / 有向图 | 微信好友（无向）vs 微博关注（有向） |
| 权重 | 无权图 / 带权图 | 地图上道路有长度（权重） |
| 稠密程度 | 稀疏图 / 稠密图 | E 接近 V（稀疏）或 V²（稠密） |

**度（degree）**：与顶点相连的边数；有向图分出度和入度。

**连通性**：无向图中任意两点可达 → 连通图；有向图中任意两点互相可达 → 强连通图。

**环（cycle）**：起点终点相同的路径。无环无向图 = 树/森林；无环有向图 = DAG（有向无环图），是依赖管理（npm、Maven）、任务编排、git 提交历史的模型。

## 图的存储：两种主流表示

### 邻接矩阵：二维数组

```ts
// matrix[i][j] = 1 表示 i 到 j 有边（无权）；带权图存权值，无边存 0 或 ∞
const graph: number[][] = [
  //    0  1  2  3
  /*0*/ [0, 1, 1, 0],
  /*1*/ [1, 0, 0, 1],
  /*2*/ [1, 0, 0, 1],
  /*3*/ [0, 1, 1, 0],
]
```

- 查询「i、j 是否相邻」O(1) —— 唯一优势
- 空间 O(V²)：1 万个顶点 = 1 亿个格子，稀疏图浪费严重
- 适合：稠密图、频繁查询边存在性、Floyd 算法

### 邻接表：每个顶点挂一个邻居列表

```ts
// Map<顶点, 邻居数组>，最通用的表达
const graph = new Map<number, number[]>([])
function addEdge(from: number, to: number): void {
  if (!graph.has(from)) graph.set(from, [])
  graph.get(from)!.push(to)
  // 无向图再加一条反向边
  if (!graph.has(to)) graph.set(to, [])
  graph.get(to)!.push(from)
}
```

- 空间 O(V + E)，遍历邻居高效
- 适合：稀疏图（绝大多数现实场景）、DFS/BFS 的标准载体

**选择口诀：稀疏用表、稠密用矩阵；遍历邻接表、判边邻接矩阵。**

## 图遍历：DFS 与 BFS

树遍历的直接推广，唯一的新问题：**图可能有环，必须记录已访问节点，否则死循环**。

### DFS 深度优先：一条路走到黑

```ts
function dfs(
  graph: Map<number, number[]>,
  start: number,
  visited = new Set<number>()
): void {
  visited.add(start)
  console.log('访问', start)

  for (const next of graph.get(start) ?? []) {
    if (!visited.has(next)) dfs(graph, next, visited)
  }
}
```

用显式栈的迭代版（防栈溢出，生产环境首选）：

```ts
function dfsIterative(graph: Map<number, number[]>, start: number): void {
  const visited = new Set<number>()
  const stack = [start]

  while (stack.length > 0) {
    const node = stack.pop()!
    if (visited.has(node)) continue // 可能重复入栈，弹出时再判一次
    visited.add(node)
    console.log('访问', node)

    for (const next of graph.get(node) ?? []) {
      if (!visited.has(next)) stack.push(next)
    }
  }
}
```

### BFS 广度优先：一圈一圈扩散

```ts
function bfs(graph: Map<number, number[]>, start: number): number[] {
  const visited = new Set([start])
  const queue = [start]
  const order: number[] = []

  while (queue.length > 0) {
    const node = queue.shift()!
    order.push(node)

    for (const next of graph.get(node) ?? []) {
      if (!visited.has(next)) {
        visited.add(next) // 入队时立刻标记，防止重复入队
        queue.push(next)
      }
    }
  }
  return order
}
```

::: warning 细节陷阱：BFS 标记时机
DFS 是「弹出时标记」，BFS 必须「**入队时标记**」。若 BFS 也等到出队才标记，同一节点可能被多个邻居各入队一次，队列爆炸。这个细节是面试高频扣分点。
:::

### BFS 的杀手锏：无权图最短路

BFS 按层扩散，**第一次到达某点时走过的层数就是最短距离**——这是无权图求最短路的标配方法（DFS 做不到，它一条路走到黑，第一条找到的路径未必最短）。

```ts
// 无权图 start 到 target 的最短距离
function shortestPath(
  graph: Map<number, number[]>,
  start: number,
  target: number
): number {
  if (start === target) return 0
  const visited = new Set([start])
  const queue: number[] = [start]
  let step = 0

  while (queue.length > 0) {
    step++
    const size = queue.length // 层序快照，同二叉树层序遍历
    for (let i = 0; i < size; i++) {
      const node = queue.shift()!
      for (const next of graph.get(node) ?? []) {
        if (next === target) return step
        if (!visited.has(next)) {
          visited.add(next)
          queue.push(next)
        }
      }
    }
  }
  return -1
}
```

## 实战一：岛屿数量（LeetCode 200）⭐

> 二维网格中 '1' 是陆地、'0' 是水，求岛屿数量（水平/垂直相连的 1 组成一个岛）。

网格是最常见的图伪装形态：**每个格子是一个顶点，上下左右四格是邻居**。解法骨架：扫描每个格子，遇到 '1' 就启动一次 BFS/DFS 把整个岛「淹掉」（标记已访问），启动次数 = 岛数量。

```ts
function numIslands(grid: string[][]): number {
  const rows = grid.length
  const cols = grid[0].length
  let count = 0

  const dfs = (r: number, c: number) => {
    // 越界或碰到水，扩散停止
    if (r < 0 || r >= rows || c < 0 || c >= cols) return
    if (grid[r][c] !== '1') return
    grid[r][c] = '2' // 标记已访问（直接改网格，省一个 visited 数组）
    dfs(r + 1, c)
    dfs(r - 1, c)
    dfs(r, c + 1)
    dfs(r, c - 1)
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++ // 发现新岛
        dfs(r, c) // 淹没整座岛
      }
    }
  }
  return count
}
```

复杂度 O(M×N)：每个格子至多被访问常数次。同族题：岛屿最大面积（695）、被围绕的区域（130）、太平洋大西洋水流（417）——骨架完全一致，只改「扩散时做什么」。

## 实战二：课程表 / 拓扑排序（LeetCode 207 / 210）⭐

> n 门课有先修关系（如学《算法》前必须学《数据结构》），判断能否修完 / 给出修课顺序。

建模为**有向图**：课程是顶点，先修关系是边。能修完 ⟺ **图中无环（DAG）**。检测 DAG 的标准方法：拓扑排序（Kahn 算法，BFS 逐层剥离零入度节点）：

```ts
// 207: 能否修完；210: 返回修课顺序
function findOrder(numCourses: number, prerequisites: number[][]): number[] {
  // 1. 建邻接表 + 统计入度
  const graph: number[][] = Array.from({ length: numCourses }, () => [])
  const indegree = new Array(numCourses).fill(0)
  for (const [course, prereq] of prerequisites) {
    graph[prereq].push(course)
    indegree[course]++
  }

  // 2. 入度为 0 的课程（无先修）先入队
  const queue: number[] = []
  for (let i = 0; i < numCourses; i++) {
    if (indegree[i] === 0) queue.push(i)
  }

  // 3. 逐个取出，修完一门，其后继课程的入度减一
  const order: number[] = []
  while (queue.length > 0) {
    const course = queue.shift()!
    order.push(course)
    for (const next of graph[course]) {
      if (--indegree[next] === 0) queue.push(next)
    }
  }

  // 4. 全部修完 = 无环；order 不足说明存在环
  return order.length === numCourses ? order : []
}
```

**入度 = 被依赖次数**。剥离零入度节点后，新暴露的零入度节点 = 现在可以学的课。若最终剥离数量 < 总数，说明剩下的节点互相依赖成环——这正是 npm 循环依赖、构建系统死锁检测的原理。

DFS + 三色标记法（白/灰/黑：未访问/递归中/已完成）是另一解法：遇到「灰色」节点（正在递归栈中又被访问）说明有环。

## 实战三：单词接龙（LeetCode 127）—— BFS 建模题

> 每次只能变换一个字母，求从 beginWord 到 endWord 的最短转换序列长度。

「求最少变换次数」= 无权最短路 = **BFS**。难点在图是隐式的：用通配符建图——`hot` 的模式 `*ot / h*t / ho*`，同模式的单词互通：

```ts
function ladderLength(
  beginWord: string,
  endWord: string,
  wordList: string[]
): number {
  const wordSet = new Set(wordList)
  if (!wordSet.has(endWord)) return 0

  const queue: string[] = [beginWord]
  let step = 1

  while (queue.length > 0) {
    const size = queue.length
    for (let i = 0; i < size; i++) {
      const word = queue.shift()!
      // 尝试每一位换 a~z
      for (let j = 0; j < word.length; j++) {
        for (let c = 97; c <= 122; c++) {
          const next =
            word.slice(0, j) + String.fromCharCode(c) + word.slice(j + 1)
          if (next === endWord) return step + 1
          if (wordSet.has(next)) {
            wordSet.delete(next) // 访问过即删除，等价于标记
            queue.push(next)
          }
        }
      }
    }
    step++
  }
  return 0
}
```

**识别信号：题目出现「最少 / 最短 / 最少步数」且每步代价相同 → 直接 BFS。**

## 加权最短路：Dijkstra 一瞥

BFS 只能处理无权图；带权图最短路用 **Dijkstra**——贪心 + 小顶堆（见[堆](./heap.md)）：

```ts
// graph: Map<顶点, Array<[邻居, 权重]>>
function dijkstra(
  graph: Map<string, Array<[string, number]>>,
  start: string
): Map<string, number> {
  const dist = new Map<string, number>()
  dist.set(start, 0)
  // 小顶堆按 [距离, 顶点] 排序
  const heap = new MinHeap<[number, string]>((a, b) => a[0] - b[0])
  heap.push([0, start])

  while (heap.size > 0) {
    const [d, node] = heap.pop()!
    // 堆里可能有过期记录（之后又发现了更短路），跳过
    if (d > (dist.get(node) ?? Infinity)) continue

    for (const [next, weight] of graph.get(node) ?? []) {
      const newDist = d + weight
      if (newDist < (dist.get(next) ?? Infinity)) {
        dist.set(next, newDist)
        heap.push([newDist, next])
      }
    }
  }
  return dist
}
```

每次弹出「当前距离最小的未确定点」（贪心：它的距离已不可能更短），松弛它的邻居。用堆优化后 **O(E log V)**。适用前提：**边权非负**——负权要用 Bellman-Ford。

## 并查集（Union-Find）⭐

处理**动态连通性**的利器：高效回答「x 和 y 是否在同一集合」并支持合并。场景：好友圈（547）、冗余连接（684）、最小生成树 Kruskal 的环检测。

```ts
class UnionFind {
  private parent: number[]

  constructor(n: number) {
    // 初始每个元素自成一派
    this.parent = Array.from({ length: n }, (_, i) => i)
  }

  // 路径压缩：查找途中把节点直接挂到根上，树越来越扁
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x])
    }
    return this.parent[x]
  }

  // 按秩合并可以再优化；只压缩也足够快
  union(x: number, y: number): void {
    this.parent[this.find(x)] = this.find(y)
  }

  isConnected(x: number, y: number): boolean {
    return this.find(x) === this.find(y)
  }
}
```

**为什么快**：`find` 的递归把整条路径压扁，配合按秩合并，单次操作摊还 **O(α(n))**——反阿克曼函数，增长极慢，n 达到宇宙原子数量级时 α(n) 仍 < 5，实际可当 O(1)。

用并查集解「岛屿数量」的等价类视角：相邻的 1 合并，最后数集合个数——网格巨大、且是动态加边（在线查询）时比 DFS 更合适。

## 图问题识别速查表

| 题面信号 | 建模 | 算法 |
| ---- | ---- | ---- |
| 网格连通块（岛屿/感染/涂色） | 格子=点，四方向=边 | DFS/BFS |
| 最少步数 / 最少变换 / 每步等价 | 隐式图 | **BFS** |
| 先修关系 / 依赖解析 / 能否完成 | 有向图 + 入度 | 拓扑排序 |
| 带权最短路（导航/耗时） | 带权图 + 非负边 | Dijkstra + 堆 |
| 朋友圈 / 分组 / 是否连通 | 并查集 | Union-Find |
| 克隆图 / 复制结构 | 哈希表记访问 | DFS/BFS + Map |

## 面试要点清单

- [ ] 邻接表 vs 邻接矩阵的时空取舍
- [ ] DFS/BFS 模板；BFS「入队时标记」防重复入队
- [ ] 无权最短路为什么是 BFS 而不是 DFS
- [ ] 拓扑排序 Kahn 算法：入度数组 + 队列，环检测靠「剥离数量 < 总数」
- [ ] Dijkstra 的贪心本质、堆优化、为何不能有负权
- [ ] 并查集两个优化（路径压缩、按秩合并）与摊还 O(α(n))
- [ ] 网格题的通用「淹岛」骨架，能秒变体（最大面积/封闭岛屿）
