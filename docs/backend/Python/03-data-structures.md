---
title: 数据结构
category:
  - 后端
tag:
  - Python
---

# 数据结构

数据结构是组织、存储和操作数据的方式，决定了程序的效率与可读性。Python 内置了四大数据结构：列表 `list`、元组 `tuple`、字典 `dict`、集合 `set`，它们覆盖了日常 90% 以上的需求。本篇基于 Python 3.12+，从概念到原理，从基础到进阶，循序渐进地讲透每种结构的用法、陷阱与选型思路。

::: tip 学习路线建议
先掌握 list（最常用）→ 理解可变/不可变后学 tuple → 字典 dict（最高频的键值结构）→ 集合 set（去重利器）→ 综合运用与选型。
:::

---

## 一、列表 list

列表是**有序、可变**的序列容器，可以存放任意类型的元素，是 Python 中使用频率最高的数据结构。

### 1.1 创建列表

```python
# 1. 字面量（最常用）
nums = [1, 2, 3, 4, 5]
mixed = [1, "hello", True, 3.14, [1, 2]]  # 元素类型可不同
empty = []

# 2. list() 构造函数：可把任意可迭代对象转为列表
from_str = list("Python")   # ['P', 'y', 't', 'h', 'o', 'n']
from_range = list(range(5)) # [0, 1, 2, 3, 4]
from_tuple = list((10, 20)) # [10, 20]

# 3. 列表推导式（list comprehension）
squares = [x * x for x in range(1, 6)]  # [1, 4, 9, 16, 25]

# 4. * 重复运算符
zeros = [0] * 5       # [0, 0, 0, 0, 0]
matrix = [[0] * 3 for _ in range(2)]  # [[0, 0, 0], [0, 0, 0]]
print(matrix)  # [[0, 0, 0], [0, 0, 0]]
```

::: warning `[[0]*3]*2` 陷阱
`[[0] * 3] * 2` 看起来也生成 2×3 矩阵，但内层列表是**同一个对象**的两次引用，修改一个会同时改变另一个。应使用推导式 `[[0] * 3 for _ in range(2)]` 让每行都是独立对象。
:::

```python
bad = [[0] * 3] * 2
bad[0][0] = 9
print(bad)  # [[9, 0, 0], [9, 0, 0]]  ← 两行都变了！

good = [[0] * 3 for _ in range(2)]
good[0][0] = 9
print(good)  # [[9, 0, 0], [0, 0, 0]]  ← 只改了第一行
```

### 1.2 增删改查

```python
lst = [1, 2, 3]

# 增
lst.append(4)          # 末尾追加: [1, 2, 3, 4]
lst.extend([5, 6])     # 扩展另一个序列: [1, 2, 3, 4, 5, 6]
lst.insert(0, 0)       # 指定位置插入: [0, 1, 2, 3, 4, 5, 6]

# 改
lst[0] = 100           # 按索引修改: [100, 1, 2, 3, 4, 5, 6]

# 删
lst.remove(100)        # 按值删除第一个匹配项: [1, 2, 3, 4, 5, 6]
popped = lst.pop()     # 弹出末尾元素: 6, lst -> [1, 2, 3, 4, 5]
first = lst.pop(0)     # 弹出索引 0: 1, lst -> [2, 3, 4, 5]
del lst[0]             # del 语句删除: lst -> [3, 4, 5]
lst.clear()            # 清空: []

# 查
lst = [10, 20, 30, 20]
print(lst[1])          # 20（索引访问，O(1)）
print(lst.index(20))   # 1（第一个匹配的索引）
print(lst.count(20))   # 2（出现次数）
print(30 in lst)       # True（成员检测，O(n)）

# 排序与反转（原地）
nums = [3, 1, 4, 1, 5, 9, 2, 6]
nums.sort()            # 原地升序: [1, 1, 2, 3, 4, 5, 6, 9]
nums.reverse()         # 原地反转: [9, 6, 5, 4, 3, 2, 1, 1]
print(nums)
```

### 1.3 切片

切片语法 `lst[start:stop:step]`，左闭右开，三个参数都可省略。

```python
lst = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

print(lst[2:5])     # [2, 3, 4]
print(lst[:4])      # [0, 1, 2, 3]
print(lst[6:])      # [6, 7, 8, 9]
print(lst[::2])     # [0, 2, 4, 6, 8]   步长 2
print(lst[::-1])    # [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]  反转
print(lst[-3:])     # [7, 8, 9]          负索引从末尾算

# 切片赋值（长度可不一致）
lst[1:3] = [100, 200, 300, 400]
print(lst)  # [0, 100, 200, 300, 400, 4, 5, 6, 7, 8, 9]

# 切片删除
lst[1:5] = []
print(lst)  # [0, 4, 5, 6, 7, 8, 9]

# 切片拷贝（浅拷贝）
copy = lst[:]
```

::: tip 切片越界不报错
切片时 `start`、`stop` 越界不会抛 `IndexError`，Python 会自动截断到合法范围；但单元素索引 `lst[100]` 会报错。这是切片与索引的重要差异。
:::

### 1.4 列表推导式

列表推导式用一行表达「从一个可迭代对象生成新列表」，比等价 `for` 循环更简洁，且在 CPython 中底层经过优化，通常更快。

```python
# 基础形式
squares = [x * x for x in range(1, 6)]
print(squares)  # [1, 4, 9, 16, 25]

# 带条件过滤
evens = [x for x in range(10) if x % 2 == 0]
print(evens)  # [0, 2, 4, 6, 8]

# 带条件表达式（if-else 必须放在 for 前）
labels = ["偶" if x % 2 == 0 else "奇" for x in range(5)]
print(labels)  # ['偶', '奇', '偶', '奇', '偶']

# 嵌套循环
pairs = [(x, y) for x in range(1, 3) for y in range(1, 3)]
print(pairs)  # [(1, 1), (1, 2), (2, 1), (2, 2)]

# 嵌套推导式（生成矩阵）
matrix = [[i * j for j in range(1, 4)] for i in range(1, 4)]
print(matrix)  # [[1, 2, 3], [2, 4, 6], [3, 6, 9]]
```

::: warning 推导式可读性
当推导式超过两层嵌套或包含复杂表达式时，可读性会迅速下降。**规则**：一层推导式几乎总是比 `for` 循环好；两层要权衡；三层及以上请改回普通循环。Python 之禅说："Flat is better than nested（扁平胜于嵌套）"。
:::

### 1.5 排序：sort vs sorted

```python
# sorted()：返回新列表，不修改原对象
nums = [3, 1, 4, 1, 5, 9, 2, 6]
new = sorted(nums)
print(new)        # [1, 1, 2, 3, 4, 5, 6, 9]
print(nums)       # [3, 1, 4, 1, 5, 9, 2, 6]  原列表不变
print(sorted(nums, reverse=True))  # [9, 6, 5, 4, 3, 2, 1, 1]

# list.sort()：原地排序，返回 None
nums.sort()
print(nums)  # [1, 1, 2, 3, 4, 5, 6, 9]

# key 参数：指定排序依据
students = [("Alice", 90), ("Bob", 75), ("Charlie", 90), ("Dave", 88)]
# 按分数降序
by_score = sorted(students, key=lambda s: s[1], reverse=True)
print(by_score)  # [('Alice', 90), ('Charlie', 90), ('Dave', 88), ('Bob', 75)]

# 多关键字排序：先按分数降序，分数相同按姓名升序
multi = sorted(students, key=lambda s: (-s[1], s[0]))
print(multi)  # [('Alice', 90), ('Charlie', 90), ('Dave', 88), ('Bob', 75)]

# 用 operator.itemgetter 更快更简洁
from operator import itemgetter
by_score2 = sorted(students, key=itemgetter(1), reverse=True)
print(by_score2)  # 同上

# 字符串按长度排序
words = ["banana", "apple", "fig", "kiwi"]
print(sorted(words, key=len))  # ['fig', 'kiwi', 'apple', 'banana']
```

::: tip 排序稳定性
Python 的排序算法是 **Timsort**，**保证稳定**：相等元素的相对顺序保持不变。这让你可以用多次 `sort` 实现"多关键字排序"——先排次要关键字，再排主要关键字：

```python
data = [("A", 2), ("B", 1), ("C", 2), ("D", 1)]
data.sort(key=lambda x: x[0])       # 先按 name 升序
data.sort(key=lambda x: x[1])       # 再按 num 升序，num 相同时保留 name 顺序
print(data)  # [('B', 1), ('D', 1), ('A', 2), ('C', 2)]
```
:::

### 1.6 浅拷贝 vs 深拷贝

```python
import copy

# 浅拷贝：只复制最外层，内层对象仍是引用
original = [[1, 2], [3, 4]]
shallow1 = original.copy()           # 方法一
shallow2 = original[:]               # 方法二
shallow3 = list(original)            # 方法三
shallow4 = copy.copy(original)       # 方法四

shallow1[0][0] = 99
print(original)  # [[99, 2], [3, 4]]  ← 内层被改了！

# 深拷贝：递归复制所有层级
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0][0] = 99
print(original)  # [[1, 2], [3, 4]]   ← 原对象完全不受影响
print(deep)      # [[99, 2], [3, 4]]
```

::: warning 嵌套列表陷阱
对于一维列表，`copy()` 与 `deepcopy()` 行为一致；但只要存在嵌套（列表中的列表、字典中的列表等），`copy()` 只复制第一层，修改内层仍会牵连原对象。**规则**：嵌套结构要独立修改时，用 `deepcopy`。
:::

### 1.7 列表性能

| 操作 | 时间复杂度 | 说明 |
|------|----------|------|
| `lst[i]` 索引访问 | O(1) | 数组随机访问 |
| `lst.append(x)` | O(1) 均摊 | 末尾追加，偶尔扩容 |
| `lst.pop()` | O(1) | 末尾弹出 |
| `lst.insert(0, x)` | O(n) | 头部插入需整体后移 |
| `lst.pop(0)` | O(n) | 头部弹出需整体前移 |
| `x in lst` | O(n) | 线性扫描 |
| `lst.sort()` | O(n log n) | Timsort |
| `lst[i] = x` | O(1) | 索引赋值 |

::: tip 队列别用 list
`list` 在头部插入/删除是 O(n)，做队列性能极差。需要队列请用 `collections.deque`，两端操作均 O(1)：

```python
from collections import deque
q = deque([1, 2, 3])
q.appendleft(0)   # O(1)  deque([0, 1, 2, 3])
q.pop()           # O(1)  3
q.popleft()       # O(1)  0
```
:::

---

## 二、元组 tuple

元组是**有序、不可变**的序列，一旦创建不能增删改元素（但元素本身如果是可变对象，其内部仍可变）。

### 2.1 创建与不可变性

```python
# 创建
t = (1, 2, 3)
t = 1, 2, 3          # 括号可省略
t = tuple([4, 5, 6]) # 从可迭代对象转换
empty = ()
single = (1,)        # ⚠ 单元素元组必须带逗号
not_tuple = (1)      # 这只是整数 1，不是元组！

print(type(single))    # <class 'tuple'>
print(type(not_tuple)) # <class 'int'>
print(single)          # (1,)

# 不可变性
t = (1, 2, 3)
# t[0] = 99  # ❌ TypeError: 'tuple' object does not support item assignment

# 但元素若可变，仍可修改其内部
t = ([1, 2, 3], "hello")
t[0].append(4)
print(t)  # ([1, 2, 3, 4], 'hello')
```

::: warning 单元素元组陷阱
`(1)` 是表达式 `1` 加括号，等价于 `1`；只有 `(1,)` 或 `1,` 才是元组。这是初学者最常踩的坑之一。
:::

### 2.2 解包

```python
# 基础解包
point = (3, 4, 5)
x, y, z = point
print(x, y, z)  # 3 4 5

# 星号收集剩余
first, *rest = [1, 2, 3, 4, 5]
print(first, rest)  # 1 [2, 3, 4, 5]

*init, last = [1, 2, 3, 4, 5]
print(init, last)   # [1, 2, 3, 4] 5

a, *middle, b = [1, 2, 3, 4]
print(a, middle, b)  # 1 [2, 3] 4

# 用 _ 忽略
_, y, _ = (10, 20, 30)
print(y)  # 20

# 交换变量（本质就是元组解包）
a, b = 1, 2
a, b = b, a
print(a, b)  # 2 1
```

### 2.3 namedtuple 命名元组

普通元组只能用索引访问，可读性差。`namedtuple` 让元组像类一样用属性名访问，兼具元组的轻量和类的可读性。

```python
from collections import namedtuple

# collections.namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x, p.y)    # 3 4
print(p[0], p[1])  # 3 4（仍可索引访问）
print(p._asdict()) # {'x': 3, 'y': 4}

# typing.NamedTuple（推荐，支持类型注解）
from typing import NamedTuple

class Student(NamedTuple):
    name: str
    age: int
    score: float = 0.0  # 可设默认值

s = Student("Alice", 20, 95.5)
print(s.name, s.age, s.score)  # Alice 20 95.5
print(s._replace(score=99.0))  # 替换某字段返回新实例
```

::: tip 何时用 namedtuple
- 表示一条记录（如数据库行、CSV 一行、坐标点），且字段数固定、不可变。
- 比普通 `class` 更省内存（每个实例无 `__dict__`），比普通 `tuple` 更可读。
- 在 3.7+ 也可用 `dataclasses.dataclass(frozen=True)` 实现类似效果，功能更全。
:::

### 2.4 元组作为字典键

```python
# 元组可哈希（元素全为不可变类型时），可作字典键
locations = {
    (39.9, 116.4): "北京",
    (31.2, 121.5): "上海",
    (23.1, 113.3): "广州",
}
print(locations[(39.9, 116.4)])  # 北京

# 列表不可哈希，不能作键
# d = {[1, 2]: "x"}  # ❌ TypeError: unhashable type: 'list'
```

::: details 为何元组比列表省内存？
列表为支持增删改，预分配了额外空间（over-allocation），便于 `append` 均摊 O(1)；元组不可变，无需预留空间，结构体只有 `ob_item` 指针数组本身。此外元组的 `__sizeof__` 通常更小：

```python
import sys
print(sys.getsizeof([1, 2, 3]))   # 88（64 位 CPython）
print(sys.getsizeof((1, 2, 3)))   # 64
```
对大量小记录（如读取上千万行 CSV），用元组而非列表能显著节省内存。
:::

---

## 三、字典 dict

字典是**键值对**结构，Python 3.7+ 保证**插入顺序**。基于哈希表实现，平均 O(1) 完成查找、插入、删除。

### 3.1 创建字典

```python
# 1. 字面量
d = {"name": "Alice", "age": 20}
empty = {}

# 2. dict() 构造（关键字参数，键必须是合法标识符）
d = dict(name="Alice", age=20)
d = dict([("name", "Alice"), ("age", 20)])  # 可迭代键值对

# 3. 字典推导式
squares = {x: x * x for x in range(1, 4)}
print(squares)  # {1: 1, 2: 4, 3: 9}

# 4. fromkeys：用序列生成键，统一默认值
keys = ["a", "b", "c"]
d = dict.fromkeys(keys, 0)
print(d)  # {'a': 0, 'b': 0, 'c': 0}
d = dict.fromkeys(keys)  # 默认值 None
print(d)  # {'a': None, 'b': None, 'c': None}
```

### 3.2 增删改查

```python
phone = {"Alice": "13800000001", "Bob": "13800000002"}

# 增 / 改
phone["Charlie"] = "13800000003"   # 新增
phone["Alice"] = "13800000099"     # 修改

# 查
print(phone["Alice"])   # 13800000099
# print(phone["Dave"])  # ❌ KeyError

# 安全查找
print(phone.get("Dave"))             # None
print(phone.get("Dave", "未登记"))   # 未登记

# setdefault：键不存在时设置默认值并返回，存在则返回现有值
phone.setdefault("Alice", "000")     # 返回 13800000099，不改
phone.setdefault("Dave", "13800000004")
print(phone["Dave"])  # 13800000004

# 删
del phone["Dave"]
popped = phone.pop("Charlie")  # 弹出并返回值
print(popped)  # 13800000003

# popitem：弹出最后插入的键值对（3.7+）
last = phone.popitem()
print(last)  # ('Bob', '13800000002')

# update：合并另一个字典或键值对
phone.update({"Eve": "13800000005", "Frank": "13800000006"})
phone.update(Gina="13800000007")
print(phone)
```

### 3.3 遍历

```python
scores = {"Alice": 90, "Bob": 75, "Charlie": 88}

# 遍历键
for name in scores.keys():
    print(name, end=" ")  # Alice Bob Charlie
print()

# 遍历值
for score in scores.values():
    print(score, end=" ")  # 90 75 88
print()

# 遍历键值对（最常用）
for name, score in scores.items():
    print(f"{name}: {score}")
# Alice: 90
# Bob: 75
# Charlie: 88
```

::: tip 字典视图是动态的
`keys()` / `values()` / `items()` 返回的不是列表，而是**视图对象**，会动态反映字典变化：

```python
d = {"a": 1, "b": 2}
ks = d.keys()
print(ks)        # dict_keys(['a', 'b'])
d["c"] = 3
print(ks)        # dict_keys(['a', 'b', 'c'])  ← 视图自动更新
print(list(ks))  # ['a', 'b', 'c']  需要快照时转 list
```
:::

### 3.4 合并运算符 `|` 与 `|=`（3.9+）

```python
d1 = {"a": 1, "b": 2}
d2 = {"b": 3, "c": 4}

# | 返回合并后的新字典（后者覆盖前者同键）
merged = d1 | d2
print(merged)  # {'a': 1, 'b': 3, 'c': 4}

# |= 原地更新
d1 |= d2
print(d1)  # {'a': 1, 'b': 3, 'c': 4}
```

### 3.5 collections 三剑客：defaultdict / Counter / OrderedDict

#### defaultdict：自动补默认值

```python
from collections import defaultdict

# 传统做法：分组时需要判断键是否存在
words = ["apple", "banana", "avocado", "berry", "cherry", "cat"]
groups = {}
for w in words:
    key = w[0]
    if key not in groups:
        groups[key] = []
    groups[key].append(w)

# defaultdict 一行搞定
groups = defaultdict(list)  # 默认值是 list()
for w in words:
    groups[w[0]].append(w)
print(dict(groups))  # {'a': ['apple', 'avocado'], 'b': ['banana', 'berry'], 'c': ['cherry', 'cat']}

# 计数
counts = defaultdict(int)
for w in words:
    counts[w[0]] += 1
print(dict(counts))  # {'a': 2, 'b': 2, 'c': 2}
```

#### Counter：词频统计利器

```python
from collections import Counter

text = "the quick brown fox jumps over the lazy dog the fox"
words = text.split()
c = Counter(words)
print(c)                # Counter({'the': 3, 'fox': 2, 'quick': 1, ...})
print(c.most_common(2)) # [('the', 3), ('fox', 2)]
print(c["the"])         # 3
print(c["cat"])         # 0  不存在的键返回 0（不报错）

# 统计字符频次
char_count = Counter("abracadabra")
print(char_count.most_common(3))  # [('a', 5), ('b', 2), ('r', 2)]

# 数学运算
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
print(c1 + c2)  # Counter({'a': 4, 'b': 3})
print(c1 - c2)  # Counter({'a': 2})  只保留正计数
```

::: details 案例：统计文章 Top-10 高频词
```python
from collections import Counter
import re

text = """
Python is an interpreted, high-level programming language.
Python is dynamically typed and garbage-collected.
Python supports multiple programming paradigms.
"""
# 提取单词并转小写
words = re.findall(r"[a-z]+", text.lower())
top10 = Counter(words).most_common(10)
for word, cnt in top10:
    print(f"{word}: {cnt}")
# python: 3
# is: 2
# programming: 2
# ...
```
:::

#### OrderedDict：现在的意义

自 3.7 起，普通 `dict` 已保证插入有序，`OrderedDict` 不再是"有序字典"的唯一选择。但它仍有两个独门特性：

```python
from collections import OrderedDict

# 1. 相等比较时考虑顺序
d1 = {"a": 1, "b": 2}
d2 = {"b": 2, "a": 1}
print(d1 == d2)                       # True（普通 dict 不看顺序）
print(OrderedDict(d1) == OrderedDict(d2))  # False（顺序不同即不等）

# 2. move_to_end / popitem(last=) 控制位置
od = OrderedDict.fromkeys("abcde")
od.move_to_end("a")          # 移到末尾
od.move_to_end("e", last=False)  # 移到开头
print(list(od.keys()))       # ['e', 'b', 'c', 'd', 'a']

# 实现 LRU 缓存的标配
od.popitem(last=False)       # 弹出最早插入的项（FIFO）
```

### 3.6 字典推导式

```python
# 反转键值
d = {"a": 1, "b": 2, "c": 3}
reversed_d = {v: k for k, v in d.items()}
print(reversed_d)  # {1: 'a', 2: 'b', 3: 'c'}

# 过滤
scores = {"Alice": 90, "Bob": 55, "Charlie": 88, "Dave": 40}
passed = {name: s for name, s in scores.items() if s >= 60}
print(passed)  # {'Alice': 90, 'Charlie': 88}

# 字符串长度映射
words = ["apple", "fig", "banana"]
length_map = {w: len(w) for w in words}
print(length_map)  # {'apple': 5, 'fig': 3, 'banana': 6}
```

---

## 四、集合 set

集合是**无序、不重复、可变**的容器，基于哈希表实现，成员检测 O(1)，是去重和集合运算的利器。

### 4.1 创建集合

```python
# 字面量
s = {1, 2, 3, 4}
s = {1, 2, 3, 2, 1}   # 自动去重
print(s)              # {1, 2, 3}

# set() 构造：从可迭代对象
s = set([1, 2, 2, 3])
print(s)  # {1, 2, 3}
s = set("hello")
print(s)  # {'h', 'e', 'l', 'o'}

# ⚠ 空集合必须用 set()，不能用 {}
empty = set()
print(type(empty))    # <class 'set'>
not_set = {}
print(type(not_set))  # <class 'dict'>  ← {} 是空字典！
```

::: warning 空集合陷阱
`{}` 在 Python 中是空字典，不是空集合。创建空集合必须用 `set()`。这是无数初学者踩过的坑。
:::

### 4.2 集合运算

```python
a = {1, 2, 3, 4}
b = {3, 4, 5, 6}

# 交集
print(a & b)              # {3, 4}
print(a.intersection(b))  # {3, 4}

# 并集
print(a | b)           # {1, 2, 3, 4, 5, 6}
print(a.union(b))      # {1, 2, 3, 4, 5, 6}

# 差集（a 有但 b 没有）
print(a - b)           # {1, 2}
print(a.difference(b)) # {1, 2}

# 对称差（不同时在 a 和 b 中）
print(a ^ b)                       # {1, 2, 5, 6}
print(a.symmetric_difference(b))   # {1, 2, 5, 6}

# 子集 / 超集
print({1, 2} <= a)        # True  是子集
print({1, 2, 3, 4} <= a)  # True  是子集（相等也算）
print({1, 2} < a)         # True  是真子集
print(a >= {1, 2})        # True  是超集
print(a > {1, 2})         # True  是真超集

# 不相交
print(a.isdisjoint({7, 8}))  # True  无公共元素
```

::: tip 实战：找两份名单的共同好友
```python
my_friends = {"Alice", "Bob", "Charlie", "Dave"}
coworkers = {"Bob", "Eve", "Frank", "Charlie"}
common = my_friends & coworkers
print(common)  # {'Bob', 'Charlie'}

# 推荐给同事但还不是好友的人
recommend = coworkers - my_friends
print(recommend)  # {'Eve', 'Frank'}
```
:::

### 4.3 增删

```python
s = {1, 2, 3}

s.add(4)
print(s)  # {1, 2, 3, 4}

s.add(2)  # 已存在，无变化
print(s)  # {1, 2, 3, 4}

# remove vs discard：区别在于键不存在时是否报错
s.remove(4)    # 删除 4
# s.remove(99) # ❌ KeyError
s.discard(99)  # 不报错，静默忽略
print(s)       # {1, 2, 3}

# pop：随机弹出一个元素（集合无序）
popped = s.pop()
print(popped, s)

s.clear()
print(s)  # set()
```

::: tip remove vs discard 选择
- 确定元素存在：用 `remove`，能早暴露逻辑错误。
- 不确定或允许不存在：用 `discard`，避免 `KeyError`。
:::

### 4.4 集合推导式

```python
# 平方去重
squares = {x * x for x in range(-3, 4)}
print(squares)  # {0, 1, 4, 9}

# 过滤
nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
evens = {x for x in nums if x % 2 == 0}
print(evens)  # {2, 4, 6, 8, 10}
```

### 4.5 frozenset：不可变集合

```python
# 集合是可变的，不可哈希，不能作字典键
# d = {{1, 2}: "x"}  # ❌ unhashable type: 'set'

# frozenset 不可变，可哈希，可作键
fs = frozenset([1, 2, 3])
print(fs)              # frozenset({1, 2, 3})
# fs.add(4)            # ❌ AttributeError
d = {frozenset({1, 2}): "pair"}
print(d[frozenset({1, 2})])  # pair

# 也可作集合元素
nested = {frozenset({1, 2}), frozenset({3, 4})}
print(nested)  # {frozenset({1, 2}), frozenset({3, 4})}
```

### 4.6 去重与 O(1) 成员检测

```python
# 去重：最经典用法
nums = [1, 2, 2, 3, 3, 3, 4, 4, 4, 4]
unique = list(set(nums))
print(unique)  # 顺序可能丢失 [1, 2, 3, 4]

# 保序去重
def dedup(lst):
    seen = set()
    return [x for x in lst if not (x in seen or seen.add(x))]

print(dedup([1, 3, 2, 3, 1, 5, 2]))  # [1, 3, 2, 5]
```

::: details O(1) vs O(n) 成员检测性能对比
```python
import time

n = 10_000_000
big_list = list(range(n))
big_set = set(big_list)

# 在 list 中查找（O(n)）
start = time.perf_counter()
_ = n + 1 in big_list  # 不在末尾附近，全表扫描
print(f"list 查找: {time.perf_counter() - start:.4f}s")

# 在 set 中查找（O(1)）
start = time.perf_counter()
_ = n + 1 in big_set
print(f"set  查找: {time.perf_counter() - start:.6f}s")
```
实测在 1000 万元素规模下，`list` 查找约 0.1 秒级，`set` 查找在微秒级，差距数千倍。需要频繁 `in` 检测时，务必先转 `set`。
:::

---

## 五、通用解包与星号

### 5.1 函数参数中的 `*` 和 `**`

```python
# *args 收集位置参数到元组，**kwargs 收集关键字参数到字典
def show(*args, **kwargs):
    print("位置参数:", args)
    print("关键字参数:", kwargs)

show(1, 2, 3, name="Alice", age=20)
# 位置参数: (1, 2, 3)
# 关键字参数: {'name': 'Alice', 'age': 20}

# 函数调用时用 * 和 ** 展开
def add(a, b, c):
    return a + b + c

nums = [1, 2, 3]
print(add(*nums))  # 6   等价于 add(1, 2, 3)

opts = {"a": 1, "b": 2, "c": 3}
print(add(**opts)) # 6   等价于 add(a=1, b=2, c=3)
```

### 5.2 序列解包的多种姿势

```python
# 同时赋值
a, *middle, b = [1, 2, 3, 4, 5]
print(a, middle, b)  # 1 [2, 3, 4] 5

# 字符串解包
first, *rest = "Python"
print(first, rest)  # P ['y', 't', 'h', 'o', 'n']

# 嵌套解包
(a, b), (c, d) = (1, 2), (3, 4)
print(a, b, c, d)  # 1 2 3 4

# 忽略中间
record = ("Alice", 20, "Beijing", 90)
name, *_, score = record
print(name, score)  # Alice 90
```

::: tip Python 3 之"星号三兄弟"
- `*args`：函数定义中收集位置参数为元组。
- `*iterable`：函数调用中展开可迭代对象为位置参数。
- `a, *rest = seq`：解包时收集剩余元素为列表。

`**` 对应关键字参数 / 字典的两套用法。
:::

---

## 六、推导式与生成器表达式

### 6.1 三种推导式统一对比

```python
# 列表推导式：返回 list
lst = [x * x for x in range(5)]
print(lst, type(lst))  # [0, 1, 4, 9, 16] <class 'list'>

# 集合推导式：返回 set
st = {x * x for x in range(-3, 4)}
print(st, type(st))  # {0, 1, 4, 9} <class 'set'>

# 字典推导式：返回 dict
dc = {x: x * x for x in range(5)}
print(dc, type(dc))  # {0: 0, 1: 1, 2: 4, 3: 9, 4: 16} <class 'dict'>
```

### 6.2 生成器表达式：惰性求值

把列表推导式的 `[]` 换成 `()`，就得到生成器表达式。它**不一次性生成所有元素**，而是按需产出，省内存。

```python
# 列表推导式：立即生成全部
lst = [x * x for x in range(5)]
print(lst)  # [0, 1, 4, 9, 16]

# 生成器表达式：返回生成器对象
gen = (x * x for x in range(5))
print(gen)  # <generator object <genexpr> at 0x...>
print(next(gen))  # 0
print(next(gen))  # 1
print(list(gen))  # [4, 9, 16]  剩余的

# 最常见用法：直接喂给 sum/max/any/构造器
total = sum(x * x for x in range(1, 101))
print(total)  # 328350
```

::: details 内存优势对比：处理大文件行数
```python
import sys

# 列表推导式：一次性把所有行读入内存
# lines = [line for line in open("huge.log")]   # 占用大

# 生成器表达式：逐行产出，几乎不占内存
lines_gen = (line for line in open("huge.log"))
print(sys.getsizeof(lines_gen))  # 约 200 字节，与文件大小无关

# 直接传给 sum/count，全程无需一次性持有所有行
count = sum(1 for _ in open("huge.log"))
```
规则：**只遍历一次、不需要随机访问、数据量大** → 用生成器表达式；需要多次访问、切片、`len()` → 用列表推导式。
:::

::: warning 生成器只能迭代一次
生成器是**一次性**的，遍历完就空了：

```python
g = (x for x in range(3))
print(list(g))  # [0, 1, 2]
print(list(g))  # []  ← 第二次为空

# 需要多次遍历时，要么重新创建生成器，要么用 list
```
:::

---

## 七、可变/不可变 + 浅拷贝/深拷贝原理

### 7.1 可变 vs 不可变

| 类型 | 可变性 | 示例 |
|------|--------|------|
| `int` / `float` / `bool` | 不可变 | `x = 1; x += 1` 创建了新对象 |
| `str` | 不可变 | `"a" + "b"` 生成新字符串 |
| `tuple` | 不可变 | 不能增删元素 |
| `list` / `dict` / `set` | 可变 | 可原地修改 |

```python
# 不可变：函数内修改不影响外部
def modify(x):
    x = x + 1
    print("函数内:", x)

n = 10
modify(n)        # 函数内: 11
print("函数外:", n)  # 函数外: 10  未变

# 可变：函数内修改影响外部
def append_one(lst):
    lst.append(1)
    print("函数内:", lst)

data = [0]
append_one(data)  # 函数内: [0, 1]
print("函数外:", data)  # 函数外: [0, 1]  变了！
```

::: warning 默认参数陷阱
可变对象作默认参数会"记住"上次调用状态：

```python
def add_item(item, lst=[]):   # ❌ 共享同一个列表
    lst.append(item)
    return lst

print(add_item(1))  # [1]
print(add_item(2))  # [1, 2]  ← 不是 [2]！

# 正确写法
def add_item(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst

print(add_item(1))  # [1]
print(add_item(2))  # [2]
```
:::

### 7.2 浅拷贝 vs 深拷贝原理图解

```
原始对象 original = [[1, 2], [3, 4]]

  外层容器 ──┐
            ├─→ 内层对象 [1, 2]   ──→ 1, 2
            └─→ 内层对象 [3, 4]   ──→ 3, 4

浅拷贝 shallow = original.copy()

  shallow 外层 ──┐
                ├─→ 内层对象 [1, 2]   ← 同 original！（共享）
                └─→ 内层对象 [3, 4]   ← 同 original！（共享）
  original 外层 ─┘
  ↑ 两个外层独立，但内层是同一份

深拷贝 deep = copy.deepcopy(original)

  deep 外层 ──┐
             ├─→ 内层对象 [1, 2] 副本 ──→ 1, 2 副本
             └─→ 内层对象 [3, 4] 副本 ──→ 3, 4 副本
  ↑ 与 original 完全独立，递归复制所有层级
```

```python
import copy

original = [[1, 2], [3, 4]]

# 浅拷贝
shallow = original.copy()
shallow[0][0] = 99
print(original)  # [[99, 2], [3, 4]]  ← 内层被牵连

original = [[1, 2], [3, 4]]
shallow = original.copy()
shallow[0] = ["X"]   # 只改外层
print(original)  # [[1, 2], [3, 4]]  ← 外层不影响

# 深拷贝
original = [[1, 2], [3, 4]]
deep = copy.deepcopy(original)
deep[0][0] = 99
print(original)  # [[1, 2], [3, 4]]  ← 完全独立
print(deep)      # [[99, 2], [3, 4]]
```

---

## 八、数据结构选型指南与复杂度表

### 8.1 如何选型

| 场景 | 首选 | 备选 |
|------|------|------|
| 有序、可改、可重复 | `list` | `deque`（双端频繁操作） |
| 有序、不可变、可哈希 | `tuple` | `namedtuple` / `NamedTuple`（要字段名） |
| 键值映射、O(1) 查找 | `dict` | `defaultdict`（缺省值）/ `Counter`（计数） |
| 去重、集合运算、O(1) 成员检测 | `set` | `frozenset`（要不可变 / 可哈希） |
| 队列（FIFO） | `collections.deque` | `queue.Queue`（线程安全） |
| 栈（LIFO） | `list`（用 append/pop） | `collections.deque` |
| 大量记录、字段固定 | `tuple` / `NamedTuple` | `dataclasses.dataclass` |
| 唯一键 + 顺序敏感 | `dict`（3.7+ 保序） | `OrderedDict`（要 `move_to_end`） |

### 8.2 时间复杂度速查表

| 操作 | `list` | `tuple` | `dict` | `set` |
|------|--------|---------|--------|-------|
| 索引访问 `x[i]` | O(1) | O(1) | — | — |
| 按键查找 `x[k]` / `in` | O(n) | O(n) | O(1) 均摊 | O(1) 均摊 |
| 末尾追加 `append` / `add` | O(1) 均摊 | — | O(1) 均摊 | O(1) 均摊 |
| 头部插入 `insert(0, x)` | O(n) | — | — | — |
| 任意位置删除 | O(n) | — | O(1) 均摊 | O(1) 均摊 |
| `pop()` 末尾 | O(1) | — | O(1) | — |
| `pop(0)` 头部 | O(n) | — | — | — |
| 长度 `len()` | O(1) | O(1) | O(1) | O(1) |
| 排序 | O(n log n) | — | — | — |
| 遍历 | O(n) | O(n) | O(n) | O(n) |
| 相等比较 `==` | O(n) | O(n) | O(n) | O(n) 均摊 |
| 哈希（能否作 dict 键） | ❌ | ✅ | ❌ | ❌（frozenset ✅） |

::: tip 一句话总结
- 需要**顺序+可变**：list
- 需要**顺序+不可变+可哈希**：tuple
- 需要**键值映射**：dict
- 需要**去重或集合运算**：set
- 需要**频繁 `in` 检测**：set（O(1)）远胜 list（O(n)）
:::

---

## 九、综合案例：学生成绩管理

::: details 综合案例：用 dict + list 实现简易学生成绩管理
```python
"""
简易学生成绩管理系统
数据结构：
  self.students: list[dict]  每个学生是一个字典
                  {"name": str, "age": int, "scores": dict[str, int]}
  self.by_name: dict[str, int]  姓名 -> 在 self.students 中的索引，O(1) 查找
"""
from collections import defaultdict


class StudentManager:
    def __init__(self):
        self.students = []          # 列表保存所有学生（保序）
        self.by_name = {}           # 字典加速按名查找

    def add(self, name, age, scores=None):
        """新增学生。scores 形如 {"math": 90, "english": 85}"""
        if name in self.by_name:
            raise ValueError(f"学生 {name} 已存在")
        student = {
            "name": name,
            "age": age,
            "scores": dict(scores) if scores else {},
        }
        self.by_name[name] = len(self.students)
        self.students.append(student)
        return student

    def remove(self, name):
        """按姓名删除"""
        if name not in self.by_name:
            raise KeyError(f"学生 {name} 不存在")
        idx = self.by_name.pop(name)
        self.students.pop(idx)
        # 重建索引（因为列表删除后后面的元素下标变了）
        self.by_name = {s["name"]: i for i, s in enumerate(self.students)}

    def get(self, name):
        """按姓名查找，O(1)"""
        idx = self.by_name.get(name)
        return self.students[idx] if idx is not None else None

    def update_score(self, name, subject, score):
        """更新某科成绩"""
        s = self.get(name)
        if s is None:
            raise KeyError(f"学生 {name} 不存在")
        s["scores"][subject] = score

    def average(self, name):
        """计算某学生平均分"""
        s = self.get(name)
        if not s or not s["scores"]:
            return 0.0
        return sum(s["scores"].values()) / len(s["scores"])

    def rank(self, subject=None):
        """按平均分（或指定科目）降序排序，返回 [(name, score), ...]"""
        def key_fn(s):
            if subject:
                return s["scores"].get(subject, 0)
            return sum(s["scores"].values()) / len(s["scores"]) if s["scores"] else 0
        return sorted(
            [(s["name"], key_fn(s)) for s in self.students],
            key=lambda x: x[1], reverse=True,
        )

    def subject_stats(self, subject):
        """统计某科目：最高/最低/平均"""
        scores = [s["scores"].get(subject) for s in self.students if subject in s["scores"]]
        if not scores:
            return None
        return {
            "max": max(scores),
            "min": min(scores),
            "avg": sum(scores) / len(scores),
            "count": len(scores),
        }

    def __repr__(self):
        return f"StudentManager({len(self.students)} 人)"


# ---------- 演示 ----------
mgr = StudentManager()
mgr.add("Alice", 20, {"math": 90, "english": 85})
mgr.add("Bob", 21, {"math": 75, "english": 92})
mgr.add("Charlie", 19, {"math": 88, "english": 70})
mgr.add("Dave", 22, {"math": 95, "english": 60})

print(mgr)                       # StudentManager(4 人)
print(mgr.get("Bob"))            # {'name': 'Bob', 'age': 21, 'scores': {'math': 75, 'english': 92}}

mgr.update_score("Bob", "math", 80)
print(mgr.average("Bob"))        # 86.0  即 (80+92)/2

print("排名（按平均分）:")
for name, avg in mgr.rank():
    print(f"  {name}: {avg:.1f}")

print("数学统计:", mgr.subject_stats("math"))
# 数学统计: {'max': 95, 'min': 80, 'avg': 88.25, 'count': 4}

mgr.remove("Charlie")
print(mgr)                       # StudentManager(3 人)
print(mgr.get("Charlie"))        # None

# 利用 set 一键找哪些学生同时有数学和英语成绩
both = {s["name"] for s in mgr.students if {"math", "english"} <= set(s["scores"])}
print("两科都有:", both)         # 两科都有: {'Alice', 'Bob', 'Dave'}
```
:::

---

## 小结

| 结构 | 是否可变 | 是否有序 | 是否可重复 | 是否可哈希 | 典型用途 |
|------|---------|---------|----------|----------|---------|
| `list` | ✅ | ✅ | ✅ | ❌ | 通用有序集合 |
| `tuple` | ❌ | ✅ | ✅ | ✅ | 不可变记录、字典键 |
| `dict` | ✅ | ✅（3.7+） | 键不重复 | ❌ | 键值映射 |
| `set` | ✅ | ❌ | ❌ | ❌ | 去重、集合运算 |
| `frozenset` | ❌ | ❌ | ❌ | ✅ | 不可变集合、字典键 |

掌握四大内置结构 + 推导式 + 解包 + 拷贝原理，是 Python 数据处理的基础。下一篇我们将进入**流程控制**（if / for / while / 异常处理），把数据结构与控制流结合起来，就能写出真正实用的程序。

::: tip 思考题
1. 为什么 `tuple` 比 `list` 省内存？(提示：over-allocation)
2. `defaultdict(list)` 与 `dict.setdefault(k, [])` 有何异同？
3. 给定一个含 100 万元素的列表，找出所有重复元素最快的方案是什么？(提示：`Counter` 或 `set`)
4. 为什么 `[[0]*3]*2` 会出问题，而 `[[0]*3 for _ in range(2)]` 不会？
:::
