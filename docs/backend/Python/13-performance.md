---
title: 性能优化与最佳实践
category:
  - 后端
tag:
  - Python
---

# 性能优化与最佳实践

这是《Python 从入门到精通》系列的第 13 篇，也是收官篇。前面 12 篇我们走完了从语法、数据结构、函数、面向对象、迭代器生成器、装饰器、异常、并发、标准库、第三方库、测试到工程化的完整旅程。本篇把"写得对"推进到"写得快、写得好、写得稳"，系统地讲性能优化、内存管理、类型提示、PEP 规范、安全实践，并用一个综合案例把整本书的知识串起来。

本文基于 Python 3.12+。

---

## 一、优化原则：先正确，再快

性能优化最大的陷阱不是"不会优化"，而是"在不该优化的时候优化"。请把下面五条原则刻在脑子里：

1. **先正确，再快**：一个跑得快但算错的程序毫无价值。先让代码正确、可读、可测，再去优化。
2. **用数据说话**：不要凭感觉优化，必须用 profiler 测量出热点，再针对热点动手。
3. **避免过早优化**：Knuth 说"过早优化是万恶之源"。90% 的代码都不是热点，把精力花在剩下 10% 上。
4. **80/20 法则**：80% 的运行时间往往花在 20% 的代码上。先找到这 20%。
5. **不要盲目优化**：如果一段代码已经满足性能要求，就不要为了"更快"而牺牲可读性。优化往往会增加复杂度。

::: tip 优化决策三问
动手优化前问自己：
- 这段代码真的是瓶颈吗？（用 profiler 验证）
- 优化后的收益值得吗？（考虑可读性、维护成本）
- 有没有更优的算法/数据结构，而不是在同一层面硬抠？
:::

::: warning 优化的代价
优化通常会把"直白的代码"变成"绕弯的代码"。每一次优化都要配套注释说明**为什么**这么写，否则三个月后你自己都看不懂。
:::

---

## 二、性能分析工具（重点）

测量驱动是性能优化的核心。Python 生态有非常成熟的工具链。

### 2.1 手动计时：time.perf_counter 与 timeit

`time.time()` 精度受系统时钟影响，不适合测量短代码。`time.perf_counter()` 是高精度单调时钟，专门用于性能测量。

```python
import time

def slow_sum(n):
    s = 0
    for i in range(n):
        s += i
    return s

start = time.perf_counter()
result = slow_sum(10_000_000)
elapsed = time.perf_counter() - start
print(f"结果: {result}, 耗时: {elapsed:.4f}s")
# 结果: 49999995000000, 耗时: 0.3521s（具体数值随机器变化）
```

`timeit` 模块更专业：自动多次运行取最小值，避免系统抖动干扰。

```sh
# 命令行：对比两种列表构造方式
python -m timeit -n 1000 -r 5 "[i*i for i in range(1000)]"
python -m timeit -n 1000 -r 5 "list(map(lambda i: i*i, range(1000)))"
```

函数式调用：

```python
import timeit

# 测量列表推导式
t1 = timeit.timeit("[i*i for i in range(1000)]", number=10000)
# 测量 for + append
t2 = timeit.timeit(
    """
result = []
for i in range(1000):
    result.append(i*i)
""",
    number=10000,
)
print(f"列表推导式: {t1:.3f}s")
print(f"for + append: {t2:.3f}s")
# 典型输出（CPython 3.12）：
# 列表推导式: 0.312s
# for + append: 0.458s
```

### 2.2 cProfile + pstats：函数级性能分析

`cProfile` 是标准库的确定性 profiler，记录每个函数的调用次数和耗时。

```python
# demo.py
import cProfile
import pstats

def work():
    total = 0
    for i in range(1_000_000):
        total += sum(x * x for x in range(10))
    return total

cProfile.run("work()", "work.prof")
# 然后用 pstats 分析
p = pstats.Stats("work.prof")
p.strip_dirs().sort_stats("cumulative").print_stats(10)
```

命令行用法更常见：

```sh
# 直接运行并输出统计
python -m cProfile -s cumulative demo.py

# 输出到文件，再用 pstats 分析
python -m cProfile -o work.prof demo.py
python -m pstats work.prof
# 进入交互式：sort cumulative / stats 20 / callers
```

关键字段解读：

- `ncalls`：调用次数
- `tottime`：函数自身耗时（不含子调用）
- `cumtime`：累计耗时（含子调用）
- `percall`：每次调用的平均耗时

::: tip tottime vs cumtime
找热点看 `tottime`（谁自己耗时长），找调用链看 `cumtime`（谁连子调用一起耗时长）。两者都要看。
:::

### 2.3 可视化分析：snakeviz 与 py-spy

`snakeviz` 把 cProfile 输出画成火焰图或冰柱图，直观看出调用栈耗时分布。

```sh
pip install snakeviz
python -m cProfile -o work.prof demo.py
snakeviz work.prof
# 自动打开浏览器
```

`py-spy` 是**采样式** profiler，用 Rust 写成，无需修改代码、几乎零开销，可以 attach 到正在运行的生产进程上：

```sh
pip install py-spy

# 实时查看某个进程的调用栈
py-spy top --pid 12345

# 录制火焰图
py-spy record --pid 12345 --output flame.svg

# dump 单次调用栈
py-spy dump --pid 12345
```

::: tip 生产环境利器
py-spy 不需要重启进程、不需要修改代码、开销极小，是排查生产环境 Python 性能问题的首选工具。
:::

`flameprof` 可以把 cProfile 输出转火焰图：

```sh
pip install flameprof
python -m cProfile -o work.prof demo.py
flameprof work.prof > flame.svg
```

### 2.4 line_profiler：逐行分析

`cProfile` 只到函数级。想知道函数内部**哪一行**慢，用 `line_profiler`。

```python
# kernprof_demo.py
@profile  # 装饰器告诉 line_profiler 这里要逐行分析
def work():
    total = 0
    for i in range(1_000_000):
        total += sum(x * x for x in range(10))
    return total

work()
```

```sh
pip install line_profiler
kernprof -l kernprof_demo.py       # 生成 .lprof 文件
python -m line_profiler kernprof_demo.py.lprof
# 输出每行 Hits、Per Hit、% Time
```

输出会显示每行执行多少次、占总耗时百分比，精确定位热点行。

### 2.5 内存分析

#### memory_profiler：逐行内存

```python
# mem_demo.py
from memory_profiler import profile

@profile
def make_list():
    return [i * i for i in range(1_000_000)]

make_list()
```

```sh
pip install memory_profiler
python -m memory_profiler mem_demo.py
# 输出每行内存增量
```

#### tracemalloc：标准库的内存快照对比

`tracemalloc` 是 Python 3.4+ 标准库，可以对比两次快照找出内存泄漏点：

```python
import tracemalloc

tracemalloc.start()

# 模拟一段可能有泄漏的代码
cache = []

def leak():
    for i in range(10000):
        cache.append([x for x in range(100)])

snapshot1 = tracemalloc.take_snapshot()
leak()
snapshot2 = tracemalloc.take_snapshot()

# 对比两次快照
top_stats = snapshot2.compare_to(snapshot1, "lineno")
for stat in top_stats[:5]:
    print(stat)
# 典型输出：
# mem_demo.py:10: size=8.6 MiB (+8.6 MiB), count=99997 (+99997), average=88 B
```

::: tip 找内存泄漏的标准流程
1. tracemalloc.start() 启动跟踪
2. 跑一轮业务逻辑，take_snapshot() 得到 snapshot1
3. 再跑一轮（或多次），take_snapshot() 得到 snapshot2
4. compare_to 找出持续增长的内存块
:::

#### objgraph：找对象引用关系

```sh
pip install objgraph
```

```python
import objgraph

class Node:
    def __init__(self):
        self.parent = None
        self.children = []

# 构造循环引用
a, b = Node(), Node()
a.children.append(b)
b.parent = a

objgraph.show_backrefs([a], max_depth=5, filename="refs.png")
# 生成引用关系图，帮助定位为何对象没被回收
```

---

## 三、常见优化技巧

每条都配 before/after 与测量对比。

### 3.1 数据结构选择：set/dict 替代 list 做成员判断

`list` 的 `in` 操作是 O(n)，`set`/`dict` 的 `in` 是 O(1)。

```python
import timeit

data_list = list(range(100_000))
data_set = set(data_list)

# 查找一个靠后的元素
t_list = timeit.timeit("99999 in data_list", globals=globals(), number=10_000)
t_set = timeit.timeit("99999 in data_set", globals=globals(), number=10_000)
print(f"list.in: {t_list:.3f}s")  # 典型 ~1.2s
print(f"set.in:  {t_set:.3f}s")   # 典型 ~0.0005s
```

::: warning 别滥用 set
set 构造本身要 O(n) 时间。如果只查一次，构造 set 反而更慢。set 适合"一次构造多次查询"的场景。
:::

### 3.2 用 dict 查找替代长 if-elif 链

```python
# before: 长 if-elif 链
def get_discount_bef(user_type):
    if user_type == "normal":
        return 1.0
    elif user_type == "vip1":
        return 0.95
    elif user_type == "vip2":
        return 0.9
    elif user_type == "svip":
        return 0.8
    else:
        return 1.0

# after: dict 查表
DISCOUNT_TABLE = {
    "normal": 1.0,
    "vip1": 0.95,
    "vip2": 0.9,
    "svip": 0.8,
}

def get_discount_aft(user_type):
    return DISCOUNT_TABLE.get(user_type, 1.0)

# 测量
import timeit
args = ["normal", "vip1", "vip2", "svip", "unknown"] * 1000
t1 = timeit.timeit("[get_discount_bef(a) for a in args]", globals=globals(), number=10)
t2 = timeit.timeit("[get_discount_aft(a) for a in args]", globals=globals(), number=10)
print(f"if-elif: {t1:.4f}s")
print(f"dict:    {t2:.4f}s")
# dict 查表通常快 30-50%
```

dict 查表还有一个隐藏优势：增加分支只改数据不改代码，符合开闭原则。

### 3.3 字符串拼接：str.join 而非 += 循环

CPython 中字符串不可变，`+=` 每次都要创建新字符串对象。虽然 CPython 有优化（字符串会原地扩展），但 `join` 仍然更快更规范。

```python
import timeit

parts = [str(i) for i in range(10000)]

# before
def concat_plus():
    s = ""
    for p in parts:
        s += p
    return s

# after
def concat_join():
    return "".join(parts)

t1 = timeit.timeit(concat_plus, number=1000)
t2 = timeit.timeit(concat_join, number=1000)
print(f"+= 循环: {t1:.4f}s")
print(f"join:    {t2:.4f}s")
# join 通常快 2-5 倍
```

::: details 为什么 join 更快
`"".join(parts)` 一次性知道所有待拼接字符串的总长度，分配一次内存；而 `+=` 在循环中每次都可能触发重新分配和拷贝。虽然 CPython 3 对 `s += x` 做了"原地扩展"优化（当 s 的引用计数为 1 时），但仍比 `join` 多了多次方法调用与判断开销。
:::

### 3.4 列表推导式比 for + append 快

```python
import timeit

# before
def make_list_loop():
    result = []
    for i in range(1000):
        result.append(i * i)
    return result

# after
def make_list_comp():
    return [i * i for i in range(1000)]

t1 = timeit.timeit(make_list_loop, number=10000)
t2 = timeit.timeit(make_list_comp, number=10000)
print(f"for + append: {t1:.4f}s")
print(f"列表推导式:   {t2:.4f}s")
# 列表推导式通常快 30-50%
```

字节码层面的解释：

```python
import dis

def loop():
    result = []
    for i in range(10):
        result.append(i)
    return result

def comp():
    return [i for i in range(10)]

print("--- loop ---")
dis.dis(loop)
print("--- comp ---")
dis.dis(comp)
# 列表推导式在字节码中用 LIST_APPEND 直接入栈，
# 而 for+append 每次循环要 LOAD_ATTR append、CALL_FUNCTION，开销更大
```

### 3.5 生成器/迭代器处理大序列省内存

```python
import sys

# 列表：一次性占内存
big_list = [x * x for x in range(1_000_000)]
print(f"列表占用: {sys.getsizeof(big_list)} bytes")  # ~8 MB

# 生成器：几乎不占内存
big_gen = (x * x for x in range(1_000_000))
print(f"生成器占用: {sys.getsizeof(big_gen)} bytes")  # ~200 bytes
```

```python
# 处理大文件时用生成器逐行读
def read_large_file(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            yield line.rstrip()

# 这样无论文件多大，内存占用都很稳定
```

### 3.6 局部变量比全局快（LEGB + LOAD_FAST）

Python 变量查找遵循 LEGB 规则：Local -> Enclosing -> Global -> Builtin。局部变量用 `LOAD_FAST` 字节码（数组索引访问），全局变量用 `LOAD_GLOBAL`（字典查找），慢得多。

```python
import timeit
import math

# 全局变量
GLOBAL_VAL = math.sqrt

def use_global(n):
    total = 0
    for i in range(n):
        total += GLOBAL_VAL(i)  # 每次都 LOAD_GLOBAL
    return total

def use_local(n):
    sqrt = math.sqrt  # 局部变量
    total = 0
    for i in range(n):
        total += sqrt(i)  # LOAD_FAST
    return total

t1 = timeit.timeit("use_global(10000)", globals=globals(), number=100)
t2 = timeit.timeit("use_local(10000)", globals=globals(), number=100)
print(f"用全局: {t1:.4f}s")
print(f"用局部: {t2:.4f}s")
# 局部变量通常快 15-30%
```

::: tip 热点循环内绑定局部变量
在性能敏感的循环里，把全局函数、模块属性、`self.method` 先绑定到局部变量。这是 Python 圈子里最经典、收益最稳定的微优化之一。
:::

### 3.7 优先用内置函数与标准库

`sum`、`max`、`min`、`sorted`、`map`、`filter` 都是 C 实现，比手写循环快。

```python
import timeit

data = list(range(10000))

# before
def manual_sum():
    s = 0
    for x in data:
        s += x
    return s

# after
def builtin_sum():
    return sum(data)

t1 = timeit.timeit(manual_sum, number=10000)
t2 = timeit.timeit(builtin_sum, number=10000)
print(f"手写循环: {t1:.4f}s")
print(f"内置 sum: {t2:.4f}s")
# 内置 sum 通常快 3-5 倍
```

### 3.8 functools.lru_cache 缓存纯函数

```python
import time
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

start = time.perf_counter()
print(fib(100))  # 几乎瞬间
print(f"耗时: {time.perf_counter() - start:.6f}s")

# 查看缓存信息
print(fib.cache_info())
# CacheInfo(hits=98, misses=101, maxsize=None, currsize=101)
```

::: warning lru_cache 的坑
1. 函数参数必须可哈希（list、dict 不能直接做参数）
2. 缓存会一直增长直到达到 maxsize，长生命周期进程要小心内存
3. 函数有副作用（IO、修改全局状态）时不能简单加缓存
4. 缓存的是返回值，如果返回可变对象，外部修改会污染缓存
:::

Python 3.9+ 还有 `functools.cache`，等价于 `lru_cache(maxsize=None)` 但更快。

### 3.9 __slots__ 减少实例内存与属性访问开销

默认情况下，Python 实例用 `__dict__` 存储属性，灵活但占内存。`__slots__` 固定属性列表，省内存、访问更快。

```python
import sys
from timeit import timeit

# before: 默认 __dict__
class PointDict:
    def __init__(self, x, y):
        self.x = x
        self.y = y

# after: __slots__
class PointSlots:
    __slots__ = ("x", "y")

    def __init__(self, x, y):
        self.x = x
        self.y = y

p1 = PointDict(1, 2)
p2 = PointSlots(1, 2)
print(f"普通实例: {sys.getsizeof(p1) + sys.getsizeof(p1.__dict__)} bytes")
print(f"slots 实例: {sys.getsizeof(p2)} bytes")
# 通常 100 万个 PointDict ~150MB，PointSlots ~50MB

# 属性访问也更快
t1 = timeit("p.x; p.y; p.x; p.y", globals={"p": p1}, number=1_000_000)
t2 = timeit("p.x; p.y; p.x; p.y", globals={"p": p2}, number=1_000_000)
print(f"dict 属性访问: {t1:.4f}s")
print(f"slots 属性访问: {t2:.4f}s")
```

::: warning __slots__ 的代价
1. 不能再动态添加 `__slots__` 之外的属性
2. 继承时子类也要定义 `__slots__`，否则又会引入 `__dict__`
3. 与某些元类、ORM 框架可能冲突
4. 失去 `__weakref__` 除非显式加入 `__slots__`
:::

### 3.10 避免重复属性查找、循环内不变计算外提

```python
# before: 循环内反复访问 self.items
class Container:
    def __init__(self, items):
        self.items = items

    def process_bef(self, n):
        result = []
        for i in range(n):
            result.append(self.items[i] * 2)  # 每次都 LOAD_ATTR self.items
        return result

    def process_aft(self, n):
        items = self.items  # 提到循环外
        result = []
        append = result.append
        for i in range(n):
            append(items[i] * 2)
        return result
```

### 3.11 数值计算用 numpy 向量化

```python
import timeit
import numpy as np

# 纯 Python
def python_square_sum(n):
    total = 0
    for i in range(n):
        total += i * i
    return total

# numpy 向量化
def numpy_square_sum(n):
    arr = np.arange(n)
    return int((arr * arr).sum())

t1 = timeit.timeit("python_square_sum(1_000_000)", globals=globals(), number=10)
t2 = timeit.timeit("numpy_square_sum(1_000_000)", globals=globals(), number=10)
print(f"纯 Python: {t1:.4f}s")
print(f"numpy:     {t2:.4f}s")
# numpy 通常快 20-100 倍（取决于数组大小）
```

::: tip numpy 何时快何时慢
- 大数组（>1000 元素）的逐元素运算：numpy 完胜
- 小数组或大量分支逻辑：numpy 可能更慢（转换开销）
- 复杂数值算法：先用 numpy 向量化，必要时上 numba/cython
:::

### 3.12 用更优算法：bisect 与 heapq

有时候"快"不是靠微优化，而是换算法。

```python
# 维护有序列表 + 查找：用 bisect（二分）替代 list.insert + list.index
import bisect
import timeit

sorted_list = list(range(0, 100_000, 2))

# before: list.index 线性查找
def find_linear():
    return sorted_list.index(99998)

# after: bisect.bisect_left 二分查找
def find_bisect():
    i = bisect.bisect_left(sorted_list, 99998)
    return i if i < len(sorted_list) and sorted_list[i] == 99998 else -1

t1 = timeit.timeit(find_linear, number=1000)
t2 = timeit.timeit(find_bisect, number=1000)
print(f"线性查找: {t1:.4f}s")
print(f"二分查找: {t2:.4f}s")
# 二分查找快 100+ 倍
```

```python
# 求 TopK：用 heapq 替代 sorted + 切片
import heapq
import random
import timeit

data = [random.randint(0, 10_000_000) for _ in range(1_000_000)]

# before: 全排序后取前 10
def topk_sorted():
    return sorted(data, reverse=True)[:10]

# after: 堆求 TopK（O(n log k)）
def topk_heap():
    return heapq.nlargest(10, data)

t1 = timeit.timeit(topk_sorted, number=3)
t2 = timeit.timeit(topk_heap, number=3)
print(f"sorted+切片: {t1:.4f}s")
print(f"heapq.nlargest: {t2:.4f}s")
# heapq 通常快 2-5 倍
```

---

## 四、并发提速：选型决策

详细的并发模型见第 8 篇。这里给出选型决策树：

```
任务类型?
├── IO 密集（网络/磁盘/数据库）
│   ├── 单机、任务间无共享 -> asyncio（协程，单线程高并发）
│   ├── 需要阻塞库（requests 等）-> 线程池 ThreadPoolExecutor
│   └── 简单脚本 -> threading + Queue
├── CPU 密集（数值计算、压缩、加密）
│   ├── 单机 -> multiprocessing 多进程
│   └── 集群 -> concurrent.futures + 进程池 or 第三方（celery/ray）
└── 混合型
    └── 拆分：IO 部分用 asyncio，CPU 部分丢到 ProcessPoolExecutor
```

::: warning GIL 与多线程
CPython 的 GIL 让多线程无法真正并行执行 Python 字节码。所以 CPU 密集任务一定要用多进程，不要用多线程。
:::

```python
# CPU 密集任务用多进程
from concurrent.futures import ProcessPoolExecutor
import math

def cpu_task(n):
    # 模拟 CPU 密集
    s = 0
    for i in range(n):
        s += math.isqrt(i * i + 1)
    return s

if __name__ == "__main__":
    tasks = [5_000_000] * 8
    # 串行
    import time
    start = time.perf_counter()
    results = [cpu_task(n) for n in tasks]
    print(f"串行: {time.perf_counter() - start:.2f}s")

    # 多进程并行
    start = time.perf_counter()
    with ProcessPoolExecutor() as ex:
        results = list(ex.map(cpu_task, tasks))
    print(f"多进程: {time.perf_counter() - start:.2f}s")
    # 8 核机器通常 4-6 倍加速
```

---

## 五、进一步加速：重武器

当标准优化都不够用时，可以考虑下面这些"重武器"。但记住：**先用标准优化，再上重武器**。

### 5.1 PyPy：替代解释器

PyPy 是另一个 Python 实现，带 JIT 编译器，对纯 Python 代码通常提速 3-10 倍。

```sh
# 安装
pip install pypy  # 或从官网下载

# 运行
pypy your_script.py
```

::: warning PyPy 兼容性
- C 扩展（如 numpy、pandas 部分 C 模块）兼容性持续改善，但仍可能有问题
- 启动比 CPython 慢（JIT 预热）
- 长跑任务收益大，短脚本收益小
- 部分小众第三方库可能不支持
:::

### 5.2 Cython：编译为 C 扩展

```python
# fib.pyx
def fib(int n):  # cdef 类型声明
    if n < 2:
        return n
    cdef int a = 0, b = 1, i
    for i in range(2, n + 1):
        a, b = b, a + b
    return b
```

```python
# setup.py
from setuptools import setup
from Cython.Build import cythonize

setup(ext_modules=cythonize("fib.pyx"))
```

```sh
cythonize fib.pyx
python setup.py build_ext --inplace
# 生成 fib*.pyd / .so，可直接 import fib
```

Cython 适合数值计算、热点函数，提速 10-100 倍常见。

### 5.3 C 扩展 / ctypes / cffi

- **C 扩展**：手写 C 代码 + Python C API，性能最高但开发成本最大
- **ctypes**：标准库，调用动态链接库，无需编译 C 代码但无类型检查
- **cffi**：第三方，性能与开发成本介于两者之间，PyPy 推荐方式

```python
# ctypes 调用 C 标准库示例
import ctypes
libc = ctypes.CDLL("msvcrt.dll" if __import__("os").name == "nt" else "libc.so.6")
libc.printf(b"Hello from C, %d\n", 42)
```

### 5.4 Numba：@jit 数值加速

```python
from numba import jit
import time

@jit(nopython=True)  # 强制使用 LLVM，不回退到对象模式
def matrix_sum(n):
    total = 0
    for i in range(n):
        for j in range(n):
            total += i * j
    return total

# 第一次调用会编译，慢
start = time.perf_counter()
print(matrix_sum(2000))
print(f"首次: {time.perf_counter() - start:.3f}s")

# 第二次走编译后代码，飞快
start = time.perf_counter()
print(matrix_sum(2000))
print(f"二次: {time.perf_counter() - start:.3f}s")
```

Numba 对数值循环、numpy 运算特别友好，但涉及 Python 对象（dict、自定义类）效果大打折扣。

::: tip 何时考虑重武器
- 已经用了最优算法、内置函数、局部变量、numpy 等标准优化
- profiler 显示瓶颈仍然在纯 Python 循环或函数调用上
- 性能需求明确（如游戏逻辑、科学计算、实时数据处理）
- 否则，老老实实写 Pythonic 代码
:::

---

## 六、内存管理

### 6.1 引用计数 + 分代回收

CPython 用两种机制管理内存：

1. **引用计数**（主）：每个对象维护 `ob_refcnt`，引用 +1、释放 -1，归零时立即回收
2. **分代回收**（辅）：处理循环引用，把对象分 0/1/2 三代，越老越少扫描

```python
import sys
import gc

a = [1, 2, 3]
print(sys.getrefcount(a))  # 2（a 本身 + getrefcount 的参数引用）

b = a
print(sys.getrefcount(a))  # 3

del b
print(sys.getrefcount(a))  # 2

# 查看分代回收计数
print(gc.get_count())  # (阈值下剩余, 1代计数, 2代计数)
```

### 6.2 gc 模块

```python
import gc

# 手动触发回收
gc.collect()

# 查看阈值
print(gc.get_threshold())  # (700, 10, 10)

# 临时禁用 gc（在确认无循环引用的高性能场景）
gc.disable()
# ... 性能敏感代码 ...
gc.enable()
```

::: warning 何时禁用 gc
仅在**所有**条件满足时考虑禁用：
1. 确认代码中没有循环引用
2. 性能极端敏感（如高频交易、游戏循环）
3. 已经用 profiler 确认 gc 是瓶颈

否则禁用 gc 风险极大，可能导致内存泄漏。
:::

### 6.3 __del__ 的坑

`__del__` 不可靠：循环引用时可能不被调用，且如果 `__del__` 中抛异常会被吞掉。**不要依赖 `__del__` 做资源释放**，用 `with` 上下文管理器替代。

```python
# 反例：依赖 __del__ 关闭文件
class BadFile:
    def __init__(self, path):
        self.f = open(path)
    def __del__(self):
        self.f.close()  # 循环引用时不一定调用

# 正例：用上下文管理器
class GoodFile:
    def __init__(self, path):
        self.f = open(path)
    def __enter__(self):
        return self
    def __exit__(self, *exc):
        self.f.close()

with GoodFile("a.txt") as gf:
    ...
```

### 6.4 weakref 弱引用

`weakref` 引用对象但不增加引用计数，对象可被正常回收。适合缓存、观察者模式。

```python
import weakref

class BigData:
    def __init__(self, data):
        self.data = data

obj = BigData([1] * 1_000_000)
ref = weakref.ref(obj)

print(ref())  # <BigData object at 0x...>

del obj
print(ref())  # None（对象已被回收）

# WeakValueDictionary：值是弱引用，对象消失则自动移除该 key
cache = weakref.WeakValueDictionary()
cache["a"] = BigData([1, 2, 3])
import gc
gc.collect()
# 当外部不再持有该 BigData 时，cache["a"] 自动消失
```

### 6.5 大对象与 del、sys.getsizeof

```python
import sys

big = [i for i in range(1_000_000)]
print(f"列表对象本身: {sys.getsizeof(big)} bytes")
# 注意：sys.getsizeof 只算容器本身，不算内部元素的递归大小

# 递归测量
def total_size(obj, seen=None):
    if seen is None:
        seen = set()
    obj_id = id(obj)
    if obj_id in seen:
        return 0
    seen.add(obj_id)
    size = sys.getsizeof(obj)
    if isinstance(obj, (list, tuple, set, frozenset)):
        size += sum(total_size(x, seen) for x in obj)
    elif isinstance(obj, dict):
        size += sum(total_size(k, seen) + total_size(v, seen) for k, v in obj.items())
    return size

print(f"列表递归大小: {total_size(big)} bytes")

del big  # 释放引用，让 gc 回收
```

---

## 七、类型提示最佳实践

类型提示从 Python 3.5（PEP 484）开始标准化，3.9+ 大幅增强。运行时不影响性能（CPython 不强制检查），但能极大提升可维护性和 IDE 体验。

### 7.1 完整标注

```python
from typing import Optional, Union, Iterable, Callable

def greet(name: str, times: int = 1) -> str:
    """向某人打招呼 times 次"""
    return (f"Hello, {name}! " * times).rstrip()

def find_first(items: Iterable[int], predicate: Callable[[int], bool]) -> Optional[int]:
    """返回第一个满足 predicate 的元素，找不到返回 None"""
    for x in items:
        if predicate(x):
            return x
    return None

# Python 3.10+ 可用 | 替代 Union / Optional
def parse(s: str | bytes) -> int | None:
    try:
        return int(s)
    except (TypeError, ValueError):
        return None
```

### 7.2 mypy strict 模式

```sh
pip install mypy
mypy --strict your_module.py
```

`--strict` 等价于打开一组严格选项，常用包括：

- `disallow_untyped_defs`：函数必须有完整类型标注
- `disallow_incomplete_defs`：部分标注也不行
- `disallow_untyped_calls`：不能调用未标注的函数
- `warn_return_any`：返回 Any 报警
- `no_implicit_optional`：禁止隐式 Optional

在 `pyproject.toml` 中配置：

```toml
[tool.mypy]
python_version = "3.12"
strict = true
warn_unused_ignores = true
warn_redundant_casts = true
```

### 7.3 typing 高级特性

#### typing.overload：函数重载签名

```python
from typing import overload

@overload
def process(x: int) -> int: ...
@overload
def process(x: str) -> str: ...
def process(x):
    if isinstance(x, int):
        return x + 1
    return x.upper()

# mypy 能根据参数类型推断返回类型
```

#### Protocol：结构化类型（鸭子类型的形式化）

```python
from typing import Protocol

class Drawable(Protocol):
    def draw(self) -> None: ...

class Circle:
    def draw(self) -> None:
        print("画圆")

def render(obj: Drawable) -> None:
    obj.draw()

render(Circle())  # Circle 不需要继承 Drawable，只要实现了 draw 方法即可
```

#### Generic 与 TypeVar

```python
from typing import TypeVar, Generic

T = TypeVar("T")

class Stack(Generic[T]):
    def __init__(self) -> None:
        self._items: list[T] = []
    def push(self, x: T) -> None:
        self._items.append(x)
    def pop(self) -> T:
        return self._items.pop()

s: Stack[int] = Stack()
s.push(1)
```

#### ParamSpec：传递参数签名

```python
from typing import ParamSpec, TypeVar, Callable
import functools

P = ParamSpec("P")
R = TypeVar("R")

def log(fn: Callable[P, R]) -> Callable[P, R]:
    @functools.wraps(fn)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(f"调用 {fn.__name__}")
        return fn(*args, **kwargs)
    return wrapper

@log
def add(a: int, b: int) -> int:
    return a + b
# mypy 能保留 add 的原始签名
```

---

## 八、PEP 规范与代码风格

### 8.1 PEP 8：风格指南

- 行宽 79 字符（或 99/120，团队约定即可）
- 缩进 4 空格，不用 Tab
- 命名：函数/变量 `snake_case`，类 `PascalCase`，常量 `UPPER_SNAKE`
- 运算符两侧空格，逗号后空格，括号内紧贴
- 一行只 import 一个模块（`from x import a, b` 可以）

### 8.2 PEP 257：docstring

```python
def fetch_user(user_id: int) -> User:
    """根据 ID 获取用户。

    一句话概述后空一行，再写详细说明。

    Args:
        user_id: 用户 ID，必须为正整数。

    Returns:
        User 对象。

    Raises:
        ValueError: user_id 非正时抛出。
        LookupError: 用户不存在时抛出。
    """
    if user_id <= 0:
        raise ValueError(f"user_id 必须为正，得到 {user_id}")
    ...
```

### 8.3 PEP 484 / 526：类型提示

```python
# 484：函数注解
def add(a: int, b: int) -> int:
    return a + b

# 526：变量注解
count: int = 0
names: list[str] = []
config: dict[str, int] = {}
```

### 8.4 PEP 518 / 621：pyproject.toml

```toml
# pyproject.toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "my-awesome-pkg"
version = "1.0.0"
description = "一个示例项目"
readme = "README.md"
requires-python = ">=3.12"
authors = [{name = "Lfange", email = "fan@example.com"}]
license = {text = "MIT"}
dependencies = [
    "requests>=2.31",
    "pydantic>=2.5",
]

[project.optional-dependencies]
dev = ["pytest", "mypy", "ruff", "black"]

[project.scripts]
mycli = "my_pkg.cli:main"

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.black]
line-length = 100
```

### 8.5 PEP 20：The Zen of Python

```python
import this
# 输出 19 条"Python 之禅"，核心精神：
# Simple is better than complex.
# Explicit is better than implicit.
# Readability counts.
# There should be one-- and preferably only one --obvious way to do it.
```

### 8.6 ruff / black 自动格式化

```sh
pip install ruff black

# ruff：超快的 linter + formatter（Rust 实现）
ruff check .              # 检查
ruff check . --fix        # 自动修复
ruff format .             # 格式化

# black：opinionated formatter
black .
```

`ruff` 已经几乎取代了 flake8、isort、pyupgrade 等一众工具，是 2024 年后的首选。

---

## 九、Pythonic 之道

Pythonic 不是炫技，是写出"符合 Python 习惯"的代码——更短、更清晰、更易读。

```python
# 1. 列表推导式替代 map+filter
nums = [1, 2, 3, 4, 5, 6]
evens_sq = [x * x for x in nums if x % 2 == 0]
# 比 list(map(lambda x: x*x, filter(lambda x: x%2==0, nums))) 干净得多

# 2. enumerate 替代 range(len)
for i, name in enumerate(["a", "b", "c"]):
    print(i, name)

# 3. zip 并行迭代
names = ["Alice", "Bob"]
ages = [30, 25]
for name, age in zip(names, ages):
    print(name, age)

# 4. 解包
a, b, c = 1, 2, 3
first, *rest = [1, 2, 3, 4]  # first=1, rest=[2,3,4]

# 5. with 上下文管理器管理资源
with open("a.txt") as f:
    data = f.read()
# 文件自动关闭，即使异常也安全

# 6. 生成器
def naturals():
    n = 1
    while True:
        yield n
        n += 1

# 7. 鸭子类型：不关心类型，只关心行为
def make_sound(animal):
    animal.speak()  # 任何有 speak() 方法的对象都行

# 8. EAFP：请求宽恕比许可容易
try:
    value = data["key"]
except KeyError:
    value = default
# 比 if "key" in data: value = data["key"] 更 Pythonic
```

::: tip EAFP vs LBYL
- EAFP（Easier to Ask Forgiveness than Permission）：先做，错了再处理
- LBYL（Look Before You Leap）：先检查，再做

Python 推荐 EAFP，因为：
1. 避免了"检查"和"使用"之间的竞态条件
2. 异常处理在 Python 中开销很小
3. 代码更简洁
:::

---

## 十、安全最佳实践

### 10.1 禁用 eval/exec 处理不可信输入

```python
# 反例：用户输入直接 eval
user_input = input("输入表达式: ")
result = eval(user_input)  # 灾难！用户可以输入 __import__("os").system("rm -rf /")

# 正例：用 ast.literal_eval 处理字面量
import ast
user_input = "[1, 2, 3]"
result = ast.literal_eval(user_input)  # 只接受 Python 字面量，安全

# 或：自己写解析器
```

### 10.2 用 secrets 而非 random 做密码

```python
# 反例：random 不安全
import random
token = "".join(random.choices("0123456789abcdef", k=32))  # 可预测

# 正例：secrets 用系统熵源
import secrets
token = secrets.token_hex(16)  # 32 字符的十六进制令牌
password = secrets.token_urlsafe(16)  # URL 安全的随机串
```

### 10.3 SQL 参数化防注入

```python
import sqlite3

conn = sqlite3.connect("app.db")

# 反例：字符串拼接（SQL 注入！）
def bad_query(username):
    cur = conn.execute(f"SELECT * FROM users WHERE name = '{username}'")
    # username = "admin' OR '1'='1" 会返回所有用户

# 正例：参数化查询
def safe_query(username):
    cur = conn.execute("SELECT * FROM users WHERE name = ?", (username,))
    return cur.fetchone()
```

### 10.4 pickle 不反序列化不可信数据

```python
import pickle

# pickle 反序列化会执行任意代码！
# 永远不要 pickle.loads 来自不可信来源的数据
# 攻击示例：构造一个 pickle 可以在加载时执行任意 shell 命令

# 替代方案：
# - 数据交换用 JSON
# - 需要复杂对象用 PyYAML（safe_load）/msgpack
```

### 10.5 subprocess 不用 shell=True

```python
import subprocess

# 反例：shell=True + 字符串拼接（命令注入！）
def bad_run(filename):
    subprocess.run(f"cat {filename}", shell=True)
    # filename = "a.txt; rm -rf /" 会执行两个命令

# 正例：参数列表，不经过 shell
def safe_run(filename):
    subprocess.run(["cat", filename], check=True)
```

### 10.6 路径穿越防护

```python
from pathlib import Path

BASE = Path("/var/www/uploads")

def read_file(filename: str) -> bytes:
    # 反例：直接拼接
    # path = BASE / filename  # filename = "../../etc/passwd" 会逃逸

    # 正例：resolve 后检查是否在 BASE 下
    path = (BASE / filename).resolve()
    if not path.is_relative_to(BASE):
        raise ValueError(f"非法路径: {filename}")
    return path.read_bytes()
```

### 10.7 依赖漏洞扫描

```sh
# pip-audit：扫描已安装依赖的已知漏洞
pip install pip-audit
pip-audit                 # 扫描当前环境
pip-audit -r requirements.txt

# bandit：扫描代码中的安全反模式
pip install bandit
bandit -r your_package/
```

::: details 常见安全反模式（bandit 会检测）
- assert 用于生产逻辑（被 -O 优化掉）
- subprocess shell=True
- yaml.load 而非 yaml.safe_load
- 使用 hashlib.md5 做密码哈希
- 硬编码密码
- except: pass 吞异常
:::

---

## 十一、综合优化案例

需求：统计一段文本中每个词的频率，取出现次数最多的前 10 个。

### 版本 1：初学者写法

```python
import re
from collections.abc import Iterable

def top10_words_v1(text: str) -> list[tuple[str, int]]:
    words = re.findall(r"\w+", text.lower())
    # 用 list 统计词频
    result = []
    seen = []
    for w in words:
        if w in seen:  # list.in 是 O(n)
            continue
        seen.append(w)
        result.append((w, words.count(w)))  # 每个词又 O(n) 扫一遍
    result.sort(key=lambda x: x[1], reverse=True)
    return result[:10]
```

复杂度约 O(n^2)，对 10 万词的文本要好几秒。

### 版本 2：用 dict 统计词频

```python
def top10_words_v2(text: str) -> list[tuple[str, int]]:
    words = re.findall(r"\w+", text.lower())
    counter: dict[str, int] = {}
    for w in words:
        counter[w] = counter.get(w, 0) + 1  # O(1)
    result = sorted(counter.items(), key=lambda x: x[1], reverse=True)
    return result[:10]
```

复杂度 O(n log n)（主要在排序），对 10 万词几十毫秒。

### 版本 3：用 collections.Counter

```python
from collections import Counter

def top10_words_v3(text: str) -> list[tuple[str, int]]:
    words = re.findall(r"\w+", text.lower())
    return Counter(words).most_common(10)  # C 实现的堆求 TopK
```

`Counter.most_common(k)` 内部用 `heapq.nlargest`，O(n log k)，比全排序快。

### 版本 4：局部变量优化

```python
def top10_words_v4(text: str) -> list[tuple[str, int]]:
    findall = re.findall  # 局部化
    lower = text.lower
    words = findall(r"\w+", lower())
    return Counter(words).most_common(10)
```

### 版本 5：可缓存（适合重复统计相同文本）

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def top10_words_cached(text: str) -> tuple[tuple[str, int], ...]:
    # 返回 tuple 以便可哈希、可缓存
    words = re.findall(r"\w+", text.lower())
    return tuple(Counter(words).most_common(10))
```

### 性能对比

```python
import timeit
import random
import string

# 生成测试文本：10 万个随机词
vocab = ["".join(random.choices(string.ascii_lowercase, k=random.randint(3, 8)))
         for _ in range(1000)]
text = " ".join(random.choice(vocab) for _ in range(100_000))

for name in ["top10_words_v1", "top10_words_v2", "top10_words_v3", "top10_words_v4"]:
    t = timeit.timeit(f"{name}(text)", globals={**globals(), "text": text}, number=3)
    print(f"{name}: {t:.3f}s (3 次平均)")
```

典型输出（CPython 3.12，10 万词文本）：

```
top10_words_v1: 12.450s
top10_words_v2: 0.082s
top10_words_v3: 0.061s
top10_words_v4: 0.055s
```

从 v1 到 v4 提速约 200 倍。这就是"算法 + 数据结构 + 微优化"叠加的效果。

::: tip 优化的层次
这个案例展示了三个优化层次：
1. **算法层**（v1 -> v2）：O(n^2) 变 O(n log n)，收益最大
2. **标准库层**（v2 -> v3）：用 Counter 的 C 实现替代手写
3. **微优化层**（v3 -> v4）：局部变量绑定，收益较小但稳定

永远先优化算法，再优化实现，最后做微优化。
:::

---

## 系列总结

恭喜你走到了这里。从第 1 篇的"Hello, World"到现在能熟练讨论 GIL、内存模型、类型系统、性能 profiler，你已经从一个 Python 初学者成长为真正能独立交付项目的开发者。

13 篇内容回顾：

1. 入门与环境
2. 数据结构与内置类型
3. 函数与作用域
4. 面向对象编程
5. 迭代器与生成器
6. 装饰器与闭包
7. 异常处理
8. 并发编程（asyncio / 多线程 / 多进程）
9. 标准库精选
10. 常用第三方库
11. 测试与调试
12. 项目工程化
13. 性能优化与最佳实践（本篇）

这些知识构成了一张完整的地图。但地图不等于旅程，真正的成长来自动手：

- 选一个你感兴趣的小项目从头写起（一个爬虫、一个 CLI 工具、一个 Web 服务）
- 把它部署上线（GitHub Pages / VPS / Docker）
- 给它写测试、加类型提示、跑 profiler、做优化
- 给别人看你的代码，听取反馈

性能优化的核心是"测量驱动"，工程化的核心是"分而治之"，Pythonic 的核心是"简洁胜于复杂"。这三句话能陪你走很远。

写代码是一件可以持续精进一辈子的手艺。愿你写得更快、更稳、更优雅，也写得开心。

下一站，由你来定义。

::: details 拓展阅读
- 书籍：《High Performance Python》（Micha Gorelick 等）
- 书籍：《Robust Python》（Patrick Viafore）
- 文档：docs.python.org 的 HOWTO 章节
- 视频：Brett Slatkin 的 "Effective Python" 系列
- 工具：ruff、mypy、pytest、py-spy、memray
:::
