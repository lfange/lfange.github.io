---
title: 二叉树
icon: tree

category:
  - Algorithms

tag:
  - Interview
  - DataStructure
---

# 二叉树

> 二叉树是递归思想的最佳载体：几乎每一道树题的解法都是「对根节点做什么 + 对左右子树递归」。掌握了树，递归、DFS、BFS、回溯全部打通。

## 为什么树如此重要

链表是「一维」的线性结构，数组支持随机访问；而**树是「半线性」结构——牺牲随机访问，换取层级化的组织能力**：

- 二叉树：每个节点最多两个子节点
- 高度 h 的满二叉树能容纳 2^h - 1 个节点——**每多一层，容量翻倍**，这是 O(log n) 复杂度的结构性来源
- 真实应用：DOM 树、文件系统、数据库索引（B+ 树）、表达式语法树、JSON 解析结构

```ts
interface TreeNode {
  val: number
  left: TreeNode | null
  right: TreeNode | null
}
```

### 必须分清的四个概念

| 概念 | 定义 | 例 |
| ---- | ---- | ---- |
| 高度（height） | 节点到叶子节点的最长路径边数 | 从下往上数 |
| 深度（depth） | 节点到根节点的路径边数 | 从上往下数 |
| 层（level） | 深度 + 1 | 根在第 1 层 |
| 平衡（balanced） | 任意节点左右子树高度差 ≤ 1 | AVL 树的定义 |

「高度从叶子往上报，深度从根往下算」——记不清时想：楼层的高度是从地面往上算的（从下往上）。

### 特殊的二叉树

- **满二叉树**：每层都塞满，第 k 层恰好 2^(k-1) 个节点
- **完全二叉树**：只在最后一层右侧缺节点——堆的底层结构，可以用数组无浪费地存储（见[堆](./heap.md)）
- **二叉搜索树（BST）**：左子树所有节点 < 根 < 右子树所有节点，中序遍历恰好升序
- **平衡二叉树（AVL）/ 红黑树**：自动维持平衡的 BST，防止退化成链表

## 遍历：树题的通用骨架

四种遍历是一切树题的基础。位置口诀：**「前中后」指的是根节点的位置**。

```
        1
       / \
      2   3     前序：1 2 4 5 3     （根左右）
     / \        中序：4 2 5 1 3     （左根右）
    4   5       后序：4 5 2 3 1     （左右根）
                层序：1 2 3 4 5     （按层，BFS）
```

### 递归三行版（前/中/后序同一模板）

```ts
// 前序遍历 —— 根左右的顺序只需移动一行代码的位置
function preorder(root: TreeNode | null, res: number[] = []): number[] {
  if (!root) return res
  res.push(root.val)        // ① 根 —— 在递归前处理 = 前序
  preorder(root.left, res)  // ② 左
  preorder(root.right, res) // ③ 右
  return res
}
```

**理解递归遍历的关键**：①②③ 位置上的代码，分别在「进入每个节点时」「从左子树返回后」「从左右子树都返回后」执行。把处理逻辑放在不同位置，就得到不同的遍历语义——这就是递归的「位置感」。

### 迭代版：用显式栈模拟递归

递归本质是隐式调用栈，换成显式栈就得到迭代解法。前序的迭代版：

```ts
function preorderTraversal(root: TreeNode | null): number[] {
  const res: number[] = []
  if (!root) return res
  const stack: TreeNode[] = [root]

  while (stack.length > 0) {
    const node = stack.pop()!
    res.push(node.val)
    // 先压右再压左，出栈顺序才是 左→右
    if (node.right) stack.push(node.right)
    if (node.left) stack.push(node.left)
  }
  return res
}
```

中序迭代版要一路压左到头再回头（略），后序 = 前序变形（根右左 → 反转数组）。**面试一般只要求写熟一种迭代版**，递归版必须三序全秒。

### 层序遍历（BFS）：队列驱动

```ts
function levelOrder(root: TreeNode | null): number[][] {
  const res: number[][] = []
  if (!root) return res
  const queue: TreeNode[] = [root]

  while (queue.length > 0) {
    // 关键技巧：先记录本层长度，一次处理完一整层
    const levelSize = queue.length
    const level: number[] = []
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!
      level.push(node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
    res.push(level)
  }
  return res
}
```

`levelSize` 快照是分层的通用手法：进入循环时队列里恰好是当前层的全部节点，中途入队的是下一层的，不影响本层计数。

## 树题的万能思考框架 ⭐

遇到任何树题，按顺序问自己三个问题：

1. **能否用一次遍历解决？**（前序=自顶向下传递信息，后序=自底向上汇总信息）
2. **需要遍历的顺序吗？** 层序适合「按层/锯齿形/右视图」类问题
3. **是 BST 吗？** BST 自带有序性，中序遍历升序，可用二分思想

**前序 vs 后序的选择**：需要父节点信息传给子节点（如「从根到叶的路径」）→ 前序；需要先知道子树结果才能算自己（如「树的高度」「平衡判断」）→ 后序。**绝大多数统计类树题都是后序**。

## 实战一：最大深度（LeetCode 104）——后序的教科书

> 求二叉树的最大深度。

「我的深度 = max(左子树深度, 右子树深度) + 1」——典型的自底向上：

```ts
function maxDepth(root: TreeNode | null): number {
  if (!root) return 0
  return Math.max(maxDepth(root.left), maxDepth(root.right)) + 1
}
```

一行胜千言。对比它的前序版（自顶向下，把当前深度作为参数下传）：

```ts
function maxDepth(root: TreeNode | null): number {
  let answer = 0
  const dfs = (node: TreeNode | null, depth: number) => {
    if (!node) return
    answer = Math.max(answer, depth)
    dfs(node.left, depth + 1)
    dfs(node.right, depth + 1)
  }
  dfs(root, 1)
  return answer
}
```

两种写法都要会：**后序「分解子问题」，前序「回溯思路」**。

### 延伸：判断平衡二叉树（LeetCode 110）

> 任意节点左右子树高度差 ≤ 1。

若对每个节点单独调用 `maxDepth`，是 O(n²)。优化：**后序计算高度时顺带剪枝**——子树不平衡直接抛出 -1 短路返回，O(n)：

```ts
function isBalanced(root: TreeNode | null): boolean {
  // 返回高度；不平衡返回 -1
  const height = (node: TreeNode | null): number => {
    if (!node) return 0
    const left = height(node.left)
    if (left === -1) return -1
    const right = height(node.right)
    if (right === -1) return -1
    if (Math.abs(left - right) > 1) return -1
    return Math.max(left, right) + 1
  }
  return height(root) !== -1
}
```

## 实战二：翻转二叉树（LeetCode 226）

```ts
function invertTree(root: TreeNode | null): TreeNode | null {
  if (!root) return null
  // 每个节点只需做一件事：交换左右孩子
  [root.left, root.right] = [root.right, root.left]
  invertTree(root.left)
  invertTree(root.right)
  return root
}
```

题源八卦：Homebrew 作者 Max Howell 面试 Google 就是挂在这题上。树题不难，但**「每个节点做什么」+「递归左右」的分解思维必须成为肌肉记忆**。

## 实战三：最近公共祖先 LCA（LeetCode 236）⭐

> 找出二叉树中两个节点 p、q 的最近公共祖先。

后序思维的巅峰题——**「我能不能当祖先」要问完左右子树才知道**：

```ts
function lowestCommonAncestor(
  root: TreeNode | null,
  p: TreeNode | null,
  q: TreeNode | null
): TreeNode | null {
  // root 为空，或 root 就是 p/q 之一 —— 直接返回自己
  if (!root || root === p || root === q) return root

  const left = lowestCommonAncestor(root.left, p, q)
  const right = lowestCommonAncestor(root.right, p, q)

  // p、q 分居两侧 → 当前节点就是 LCA
  if (left && right) return root
  // 都在左侧（或都在右侧）→ 答案在子树里
  return left ?? right
}
```

理解 `left && right` 的含义：左右子树各报告「找到一个目标」，说明 p、q 分居两侧，当前节点就是分岔点。`left ?? right` 则是把子树找到的答案原样上传。

## 实战四：验证二叉搜索树（LeetCode 98）⭐

> 判断一棵树是否是合法 BST。

**经典陷阱**：只比较 `node.left.val < node.val < node.right.val` 是错的——

```
      5
     / \
    4   8
       / \
      3   9     ← 3 < 6? 错！3 违反了「必须大于根 5」的约束
```

正确理解：BST 的约束是**对整棵子树生效的区间**。左子树所有节点必须 < 根，右子树所有节点必须 > 根。

**解法一：传递上下界（前序）**

```ts
function isValidBST(root: TreeNode | null): boolean {
  const validate = (
    node: TreeNode | null,
    min: number,
    max: number
  ): boolean => {
    if (!node) return true
    // 当前节点必须在开区间 (min, max) 内
    if (node.val <= min || node.val >= max) return false
    // 进入左子树收紧上界；进入右子树收紧下界
    return (
      validate(node.left, min, node.val) &&
      validate(node.right, node.val, max)
    )
  }
  return validate(root, -Infinity, Infinity)
}
```

**解法二：中序遍历必须严格递增**

```ts
function isValidBST(root: TreeNode | null): boolean {
  let prev: number | null = null
  let valid = true

  const inorder = (node: TreeNode | null) => {
    if (!node || !valid) return
    inorder(node.left)
    // 中序位置：每个值必须大于前一个
    if (prev !== null && node.val <= prev) {
      valid = false
      return
    }
    prev = node.val
    inorder(node.right)
  }
  inorder(root)
  return valid
}
```

**BST 的有序性带来的所有套路**：中序升序、第 K 小（中序计数）、范围搜索（前序剪枝）、BST 转有序数组/累加树，全部源于「左 < 根 < 右」这一条性质。

## 实战五：路径总和（LeetCode 112 / 113）

> 112：是否存在根到叶路径和等于 targetSum；113：找出所有这样的路径。

112 是前序 + 短路：

```ts
function hasPathSum(root: TreeNode | null, targetSum: number): boolean {
  if (!root) return false
  // 到达叶子节点：判断是否恰好减到 0
  if (!root.left && !root.right) return root.val === targetSum
  return (
    hasPathSum(root.left, targetSum - root.val) ||
    hasPathSum(root.right, targetSum - root.val)
  )
}
```

113 需要**回溯**——用一条共享路径数组，进入时 push、离开时 pop，避免每条路径都复制数组：

```ts
function pathSum(root: TreeNode | null, targetSum: number): number[][] {
  const result: number[][] = []
  const path: number[] = []

  const dfs = (node: TreeNode | null, remaining: number) => {
    if (!node) return
    path.push(node.val) // 做选择

    if (!node.left && !node.right && remaining === node.val) {
      result.push([...path]) // 注意：拷贝快照，path 还要继续用
    }
    dfs(node.left, remaining - node.val)
    dfs(node.right, remaining - node.val)

    path.pop() // 撤销选择 —— 回溯的标志
  }
  dfs(root, targetSum)
  return result
}
```

`push / 递归 / pop` 三件套就是回溯的标准形态，详见[贪心与回溯](./greedy-backtracking.md)。

## 层序家族：BFS 的花式玩法

基于 `levelOrder` 模板的小变形（面试高频）：

- **右视图（199）**：每层最后一个节点 → 取 `level[level.length - 1]`
- **锯齿形遍历（103）**：偶数层反转 `level.reverse()`
- **最小深度（111）**：BFS 首个叶子节点所在层 —— **BFS 找最短路天然比 DFS 全遍历快**，遇到即可提前返回
- **层平均值（637）**：每层求和除以 `levelSize`

最小深度示例（注意与最大深度 104 的解法差异）：

```ts
function minDepth(root: TreeNode | null): number {
  if (!root) return 0
  const queue: TreeNode[] = [root]
  let depth = 0

  while (queue.length > 0) {
    depth++
    const size = queue.length
    for (let i = 0; i < size; i++) {
      const node = queue.shift()!
      // 第一个碰到的叶子就在最浅层，立即返回
      if (!node.left && !node.right) return depth
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }
  }
  return depth
}
```

::: warning 为什么最小深度不能用最大深度的写法？
`min(minDepth(left), minDepth(right)) + 1` 在只有单侧子树时会算错——`min(0, 3) + 1 = 1`，但单侧子树的「深度 1」那个方向根本没有叶子。BFS 版天然规避了这个问题。
:::

## 从二叉树到工程：平衡树的必要性

普通 BST 插入有序数据会退化成链表（O(log n) → O(n)）：

```
依次插入 1,2,3,4,5：

1                    3
 \                  / \
  2       平衡后    2   4
   \      ──→     /     \
    3            1       5
     \
      4
       \
        5
```

工程解法：

- **AVL 树**：严格平衡（高度差 ≤ 1），查询极快，插入删除旋转较多——读多写少场景
- **红黑树**：近似平衡（最长路径 ≤ 2×最短），旋转次数少——C++ `map`、Java `TreeMap`、Linux 进程调度的选择
- **B/B+ 树**：多叉、矮胖，一个节点对齐磁盘页（4KB）——数据库索引、文件系统的标配，**树越矮，磁盘 IO 越少**

## 面试要点清单

- [ ] 前中后序递归秒写；理解「处理位置决定遍历语义」
- [ ] 层序遍历的 levelSize 技巧；BFS 求最短路的提前终止
- [ ] 前序（自顶向下传参）vs 后序（自底向上返回值）的选择依据
- [ ] 验证 BST 的陷阱：必须传区间 / 中序递增
- [ ] LCA 的分侧判断逻辑
- [ ] 回溯三件套：push / 递归 / pop
- [ ] BST 退化问题与红黑树、B+ 树的工程动机
