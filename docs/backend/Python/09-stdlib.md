---
title: 标准库精选
category:
  - 后端
tag:
  - Python
---

# 标准库精选

Python 之所谓"自带电池"（batteries included），正源于其覆盖极广的标准库。本篇是《Python 从入门到精通》第 09 篇，基于 Python 3.12+，精选日常开发最高频的若干模块逐个剖析。`pathlib`/`json`/`dataclasses`/`enum` 已在前几篇详讲，本篇只在末尾一句话引用，重点放在 `os`/`sys`/`collections`/`itertools`/`functools`/`datetime`/`re`/`math`/`random`/`secrets`/`hashlib`/`hmac`/`subprocess`/`argparse`/`typing` 上，其中 `itertools` 与 `functools` 是重中之重。

::: tip 关于导入风格
标准库模块导入一般放在文件顶部，按"标准库 → 第三方 → 本地"三段式分组，每组之间空一行。本篇示例为了紧凑，有时会省略 import 行，实际书写时请补齐。
:::

---

## 一、os 与 sys：与解释器、操作系统打交道

### 1.1 os：操作系统接口

`os` 提供跨平台操作系统功能封装，是最常被滥用的模块之一。常用 API 分四类：环境变量、工作目录、目录浏览、路径操作。

```python
import os

# 环境变量
os.environ["MY_KEY"] = "123"        # 写入（仅当前进程及其子进程可见）
print(os.getenv("MY_KEY"))           # 123
print(os.getenv("NOT_EXIST", "默认值"))  # 不存在时返回默认值，避免 KeyError

# 工作目录
print(os.getcwd())                   # 当前工作目录
os.chdir("..")                       # 切换工作目录（影响相对路径解析）

# 列目录
for name in os.listdir("."):         # 返回字符串列表，不保证顺序
    print(name)

# scandir 比 listdir 快且能拿到 is_file/is_dir 信息，不再额外 stat
with os.scandir(".") as it:
    for entry in it:
        if entry.is_file():
            print(entry.name, entry.stat().st_size)
```

`os.path` 子模块提供路径字符串操作（注意：它只处理字符串，不访问文件系统除 `exists`/`getsize` 等少数外）：

```python
import os.path as p

p.join("a", "b", "c.txt")     # 'a/b/c.txt'（Windows 下反斜杠）
p.exists("/etc/hosts")        # True / False
p.abspath("./x.py")           # 转绝对路径
p.basename("/a/b/c.txt")      # 'c.txt'
p.dirname("/a/b/c.txt")       # '/a/b'
p.splitext("archive.tar.gz")  # ('archive.tar', '.gz')  只切最后一段扩展名
```

::: warning 不要用 os.system
`os.system("ls -l")` 简单但拿不到输出、不安全、跨平台差。一律改用 `subprocess.run([...], capture_output=True, text=True)`，详见后文。
:::

::: tip 推荐用 pathlib 替代 os.path
现代 Python 推荐使用 `pathlib.Path`（详见第 7 篇），它把路径当作对象，链式调用更优雅。`os.path` 仍需了解，因为大量老代码与第三方库仍使用它。
:::

### 1.2 sys：解释器自身

`sys` 模块关乎解释器运行时状态，而非操作系统。

```python
import sys

# 命令行参数：argv[0] 是脚本名
print(sys.argv)        # ['script.py', '--port', '8080']

# 模块搜索路径：import 时按序查找
print(sys.path)        # 列表，可 append 自定义目录

# 退出
sys.exit(0)            # 0 表示正常退出，非 0 表示出错
sys.exit("出错了")     # 打印消息到 stderr 并以 1 退出

# 标准流
sys.stdout.write("hello\n")
sys.stderr.write("warn\n")

# 整数上限（仅 Windows / 32 位平台有意义，64 位 Linux 上是 2**63-1）
print(sys.maxsize)

# 解释器版本信息
print(sys.version_info)        # sys.version_info(major=3, minor=12, ...)
if sys.version_info >= (3, 11):
    print("支持新异常组语法")

# 递归深度
print(sys.getrecursionlimit())  # 默认 1000
sys.setrecursionlimit(2000)     # 谨慎调高，可能引发 C 栈溢出崩溃
```

::: warning 别随便调高递归深度
默认 1000 是安全阈值。如果你的递归函数需要 2000+ 层，说明算法本身有问题，应改为迭代或分治。强行调高可能在某些平台上引发段错误。
:::

---

## 二、collections：容器扩展

`collections` 提供若干对内建容器的小型增强，是日常高频模块。

### 2.1 namedtuple：具名元组

```python
from collections import namedtuple

Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
print(p.x, p.y)          # 3 4
print(p[0], p[1])        # 3 4   仍可按下标访问
print(p._asdict())       # {'x': 3, 'y': 4}
```

3.7+ 起，更推荐用 `typing.NamedTuple` 写带类型注解的版本；3.7+ 后新代码也可直接用 `dataclasses`（见第 5 篇）替代。

### 2.2 deque：双端队列

`list` 在头部插入/弹出是 O(n)，`deque` 两端都是 O(1)。

```python
from collections import deque

dq = deque([1, 2, 3])
dq.appendleft(0)         # deque([0, 1, 2, 3])
dq.append(4)             # deque([0, 1, 2, 3, 4])
dq.popleft()             # 0  O(1)
dq.pop()                 # 4

# 经典用法：定长滑动窗口
window = deque(maxlen=3)
for i in range(6):
    window.append(i)
    print(list(window))
# 输出：
# [0]
# [0, 1]
# [0, 1, 2]
# [1, 2, 3]   老的 0 被挤掉
# [2, 3, 4]
# [3, 4, 5]
```

### 2.3 Counter：计数器

```python
from collections import Counter

text = "the quick brown fox jumps over the lazy dog the"
words = text.split()
c = Counter(words)
print(c)                       # Counter({'the': 3, 'quick': 1, ...})
print(c["the"])                # 3
print(c.most_common(2))        # [('the', 3), ('quick', 1)]   TopN
print(c.total())               # 总数 9（3.7+）

# 数学运算
c1 = Counter(a=3, b=1)
c2 = Counter(a=1, b=2)
print(c1 + c2)                 # Counter({'a': 4, 'b': 3})
print(c1 - c2)                 # Counter({'a': 2})   只保留正数
```

### 2.4 OrderedDict：有序字典

3.7 起，普通 `dict` 已保证插入顺序，`OrderedDict` 的"保序"优势消失。它如今仍有用武之地：

- 代码需要在 3.6 及更早版本运行（极少见）。
- 需要 `move_to_end(key, last=False)`、`popitem(last=False)` 这类 LRU 缓存语义。
- 需要显式声明"顺序敏感"以提示读者。

```python
from collections import OrderedDict
od = OrderedDict()
od["a"] = 1; od["b"] = 2
od.move_to_end("a")            # 把 a 挪到末尾
print(list(od))                # ['b', 'a']
```

### 2.5 defaultdict：带默认值的字典

```python
from collections import defaultdict

# 分组：按首字母分组单词
words = ["apple", "ant", "banana", "berry", "cat"]
groups = defaultdict(list)
for w in words:
    groups[w[0]].append(w)
print(dict(groups))
# {'a': ['apple', 'ant'], 'b': ['banana', 'berry'], 'c': ['cat']}

# 计数
count = defaultdict(int)
for w in words:
    count[w] += 1
```

::: tip 工厂函数的选择
- `defaultdict(list)` 适合分组聚合
- `defaultdict(int)` 适合计数
- `defaultdict(set)` 适合去重分组
- 自定义 `defaultdict(lambda: defaultdict(int))` 适合嵌套结构
:::

### 2.6 ChainMap：多层映射查找

```python
from collections import ChainMap

defaults = {"host": "localhost", "port": 8080, "debug": False}
env = {"port": 9000}
cli = {"debug": True}

cfg = ChainMap(cli, env, defaults)   # 查找顺序：从前到后
print(cfg["port"])     # 9000   命中 env
print(cfg["host"])     # localhost   命中 defaults
print(cfg["debug"])    # True   命中 cli

# 写入只影响第一个映射
cfg["port"] = 7000
print(env)             # {'port': 7000}
```

`ChainMap` 比手动 `{**defaults, **env, **cli}` 合并更省内存，且对原字典的修改能反映出来——这正是配置层叠查找的理想模型。

---

## 三、itertools：迭代器工具（重点）

`itertools` 是 Python 函数式编程的核心武器。它把"流式处理"做到极致：所有函数都返回迭代器，惰性求值，几乎不占额外内存。掌握 `itertools` 是区分中级与高级 Python 程序员的分水岭。

### 3.1 无限迭代器

```python
from itertools import count, cycle, repeat

# count：从 start 起，每次加 step，无限
for i in count(10, 2):       # 10, 12, 14, 16, ...
    if i > 18: break
    print(i)

# cycle：循环遍历可迭代对象
turn = 0
for x in cycle("AB"):       # A B A B A B ...
    print(x); turn += 1
    if turn >= 5: break

# repeat：重复同一个元素
list(repeat("X", 3))        # ['X', 'X', 'X']
```

### 3.2 有限迭代器

```python
from itertools import (
    chain, islice, takewhile, dropwhile,
    filterfalse, compress, starmap, accumulate, zip_longest
)

# chain：串联多个可迭代对象
list(chain([1, 2], [3, 4], [5]))           # [1, 2, 3, 4, 5]

# chain.from_iterable：从一个"可迭代对象的可迭代对象"打平
nested = [[1, 2], [3, 4], [5]]
list(chain.from_iterable(nested))          # [1, 2, 3, 4, 5]

# islice：切片（不支持负索引）
list(islice(range(100), 2, 8, 2))          # [2, 4, 6]

# takewhile / dropwhile：基于谓词取/丢
list(takewhile(lambda x: x < 3, [1, 2, 3, 4, 1, 2]))  # [1, 2]
list(dropwhile(lambda x: x < 3, [1, 2, 3, 4, 1, 2]))  # [3, 4, 1, 2]

# filterfalse：filter 的反面
list(filterfalse(lambda x: x % 2, range(6)))  # [0, 2, 4]

# compress：按"掩码"挑选
list(compress("ABCDEF", [1, 0, 1, 0, 1, 1]))  # ['A', 'C', 'E', 'F']

# starmap：把每行的多个参数解包传给函数
list(starmap(pow, [(2, 3), (3, 2), (10, 3)]))  # [8, 9, 1000]

# accumulate：前缀累积（默认求和）
list(accumulate([1, 2, 3, 4]))                 # [1, 3, 6, 10]
list(accumulate([1, 2, 3, 4], initial=10))     # [10, 11, 13, 16, 20]
list(accumulate([2, 3, 4], lambda a, b: a * b))  # [2, 6, 24]

# zip_longest：zip 的"等长"版本，缺失用 fillvalue
list(zip_longest("AB", "XYZ", fillvalue="-"))  # [('A','X'), ('B','Y'), ('-','Z')]
```

### 3.3 排列组合

```python
from itertools import product, permutations, combinations, combinations_with_replacement

# product：笛卡尔积
list(product("AB", "12"))          # [('A','1'), ('A','2'), ('B','1'), ('B','2')]
list(product("AB", repeat=2))      # AA AB BA BB

# permutations：排列（考虑顺序）
list(permutations("ABC", 2))       # AB AC BA BC CA CB

# combinations：组合（不考虑顺序，不重复）
list(combinations("ABC", 2))       # AB AC BC

# combinations_with_replacement：可重复组合
list(combinations_with_replacement("ABC", 2))  # AA AB AC BB BC CC
```

### 3.4 groupby：分组

`groupby` 类似 SQL 的 `GROUP BY`，但**要求输入已按 key 排序**，否则同一 key 会形成多组。

```python
from itertools import groupby

data = [("A", 1), ("A", 2), ("B", 3), ("A", 4)]
# 先按 key 排序
data.sort(key=lambda x: x[0])
for k, g in groupby(data, key=lambda x: x[0]):
    print(k, list(g))
# A [('A', 1), ('A', 2), ('A', 4)]
# B [('B', 3)]
```

### 3.5 内置 recipes

3.10 起内置了 `pairwise`：

```python
from itertools import pairwise
list(pairwise([1, 2, 3, 4]))   # [(1, 2), (2, 3), (3, 4)]
```

`flatten` 仍未内置，但可用 `chain.from_iterable` 实现。`unique` 在 3.12 起仍需手写：

```python
def unique(iterable, key=None):
    seen = set()
    for x in iterable:
        k = key(x) if key else x
        if k not in seen:
            seen.add(k)
            yield x

list(unique([1, 2, 2, 3, 1, 4]))   # [1, 2, 3, 4]
```

### 3.6 实战：数据管道

模拟一个日志分析管道：读取 → 过滤 → 转换 → 聚合，全程惰性求值。

```python
from itertools import islice, takewhile, groupby
from collections import Counter

# 假装的日志流（实际可能来自文件迭代器）
def log_stream():
    yield "INFO start"
    yield "ERROR disk full"
    yield "WARN slow"
    yield "ERROR oom"
    yield "INFO done"
    yield "ERROR disk full"

# 管道：只取前 100 条 → 只保留 ERROR → 提取错误描述 → 计数 TopN
errors = (
    msg.split(maxsplit=1)[1]
    for msg in log_stream()
    if msg.startswith("ERROR")
)
top = Counter(errors).most_common(2)
print(top)   # [('disk full', 2), ('oom', 1)]
```

整个管道没有中间列表，10GB 日志也能跑。这是 `itertools` 思想的精髓。

---

## 四、functools：函数工具（重点）

`functools` 提供"对函数本身进行操作"的工具，是元编程的入门钥匙。

### 4.1 lru_cache 与 cache：自动记忆化

```python
from functools import lru_cache, cache

@lru_cache(maxsize=256)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(100))   # 354224848179261915075

# 对比：未缓存的 fib(40) 已经要几秒；缓存后 fib(200) 瞬间完成

# cache 等价于 lru_cache(maxsize=None)，3.9+ 新增，更简洁
@cache
def parse(pattern):
    # 假设解析很慢
    return pattern.upper()
```

::: warning lru_cache 的坑
1. 被缓存的函数参数必须可哈希，所以 `list`/`dict`/`set` 不能直接做参数。
2. 缓存会持有返回值的引用，大对象可能导致内存泄漏——用 `cache_clear()` 或控制 `maxsize`。
3. 闭包捕获的可变状态不会让缓存失效，必要时手动 `cache_clear()`。
:::

### 4.2 partial：偏函数

固定部分参数，生成新函数。

```python
from functools import partial

int2 = partial(int, base=2)        # 二进制转整数
print(int2("1010"))                # 10

print_at = partial(print, sep=" | ", end="\n---\n")
print_at("a", "b", "c")
# a | b | c
# ---
```

### 4.3 wraps：保留被装饰函数元信息

```python
from functools import wraps

def timed(fn):
    @wraps(fn)              # 不加这行，被装饰函数的 __name__/__doc__ 会变成 wrapper 的
    def wrapper(*a, **kw):
        import time
        t = time.time()
        r = fn(*a, **kw)
        print(f"{fn.__name__} 耗时 {time.time()-t:.3f}s")
        return r
    return wrapper

@timed
def work():
    """干点活"""
    return 42

print(work.__name__, work.__doc__)   # work 干点活
```

### 4.4 reduce：折叠

```python
from functools import reduce

nums = [1, 2, 3, 4, 5]
print(reduce(lambda a, b: a + b, nums))      # 15
print(reduce(lambda a, b: a * b, nums, 1))   # 120   带初值
```

::: tip 何时用 reduce
能用 `sum`/`max`/`min`/`any`/`all` 就别用 `reduce`，可读性更高。`reduce` 仅在"两两合并"的语义不明显时使用，例如实现 `flatten` 或并集：
:::

```python
reduce(lambda a, b: a | b, [{1}, {2}, {3}])   # {1, 2, 3}
```

### 4.5 singledispatch：按第一参数类型分发

写一个 `to_json`，不同类型走不同逻辑：

```python
from functools import singledispatch
import datetime, decimal

@singledispatch
def to_json(obj):
    raise TypeError(f"不支持 {type(obj)}")

@to_json.register
def _(obj: datetime.datetime):
    return obj.isoformat()

@to_json.register
def _(obj: decimal.Decimal):
    return str(obj)

@to_json.register
def _(obj: list):
    return [to_json(x) for x in obj]

print(to_json(datetime.datetime(2026, 7, 20)))   # '2026-07-20T00:00:00'
print(to_json([decimal.Decimal("1.5"), 2]))      # ['1.5', 2]
```

新增类型只需 `@to_json.register` 一个新函数，无需修改原函数——典型的开闭原则。

### 4.6 total_ordering：补全比较方法

定义了 `__eq__` 和 `__lt__` 后，自动补全 `__le__`/`__gt__`/`__ge__`。

```python
from functools import total_ordering

@total_ordering
class Version:
    def __init__(self, v): self.v = v
    def __eq__(self, o): return self.v == o.v
    def __lt__(self, o): return self.v < o.v

print(Version(1) < Version(2))    # True
print(Version(2) >= Version(1))   # True
```

### 4.7 cmp_to_key：把老式 cmp 转为 key

```python
from functools import cmp_to_key

# 老式比较函数：返回 负/0/正
def cmp_len(a, b):
    return len(a) - len(b)

words = ["aaa", "b", "cc"]
print(sorted(words, key=cmp_to_key(cmp_len)))   # ['b', 'cc', 'aaa']
```

3.x 起 `sorted` 不再接受 `cmp` 参数，老代码迁移用 `cmp_to_key` 包装。

---

## 五、datetime：时间与日期

### 5.1 四个核心类型

```python
from datetime import date, time, datetime, timedelta

d = date(2026, 7, 20)
t = time(8, 30, 0)
dt = datetime(2026, 7, 20, 8, 30, 0)
td = timedelta(days=7)

print(d + td)                  # 2026-07-27
print(dt + timedelta(hours=2)) # 2026-07-20 10:30:00
print(dt - datetime(2026, 1, 1))   # 200 days, 8:30:00
```

### 5.2 格式化与解析

```python
from datetime import datetime

now = datetime.now()
print(now.strftime("%Y-%m-%d %H:%M:%S"))   # 2026-07-20 08:30:00
print(now.strftime("%Y年%m月%d日 %A"))       # 2026年07月20日 Monday

s = "2026-07-20 08:30:00"
print(datetime.strptime(s, "%Y-%m-%d %H:%M:%S"))

# fromisoformat：3.11+ 大幅增强，能解析大多数 ISO 8601 字符串
print(datetime.fromisoformat("2026-07-20T08:30:00+08:00"))
print(date.fromisoformat("20260720"))        # 3.11+ 支持紧凑格式
```

### 5.3 时间戳

```python
from datetime import datetime, timezone

dt = datetime.now(timezone.utc)
ts = dt.timestamp()                 # 浮点秒数，UTC
print(ts)                           # 例 1784567400.0
print(datetime.fromtimestamp(ts, tz=timezone.utc))
```

### 5.4 时区：aware vs naive

`datetime` 分两类：

- **naive**：不带时区信息，"墙上时间"，意义含糊。
- **aware**：带时区信息，是绝对时刻。

3.9+ 内置 `zoneinfo`，使用 IANA 时区数据库。

```python
from datetime import datetime, timezone, timedelta
from zoneinfo import ZoneInfo

# aware UTC
utc_now = datetime.now(timezone.utc)

# 转 Asia/Shanghai
sh = utc_now.astimezone(ZoneInfo("Asia/Shanghai"))
print(sh)                           # 2026-07-20 16:30:00+08:00

# 转 America/New_York
ny = utc_now.astimezone(ZoneInfo("America/New_York"))
print(ny)
```

::: warning 生产环境务必用 aware datetime
naive datetime 在跨时区系统里是 bug 之源。规则：**永远存 UTC，展示时再转本地时区**。
:::

### 5.5 实战

```python
from datetime import date, timedelta
import calendar

# 两个日期相差多少天
print((date(2026, 12, 31) - date(2026, 1, 1)).days)   # 364

# 本月最后一天
today = date(2026, 7, 20)
last_day = today.replace(day=calendar.monthrange(today.year, today.month)[1])
print(last_day)                     # 2026-07-31

# UTC 转本地
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
print(datetime.now(timezone.utc).astimezone(ZoneInfo("Asia/Shanghai")))
```

---

## 六、re：正则表达式

### 6.1 核心函数

```python
import re

# search：在任意位置搜第一个匹配
m = re.search(r"\d+", "abc123def")
print(m.group())                    # 123

# match：只在开头匹配
print(re.match(r"\d+", "abc123"))   # None
print(re.match(r"\d+", "123abc"))   # <Match 123>

# fullmatch：要求整串匹配
print(re.fullmatch(r"\d+", "123"))  # <Match 123>
print(re.fullmatch(r"\d+", "12a"))  # None

# findall：所有匹配，返回字符串列表
print(re.findall(r"\d+", "a1b22c333"))   # ['1', '22', '333']

# finditer：返回 Match 对象迭代器，可拿位置信息
for m in re.finditer(r"\d+", "a1b22"):
    print(m.group(), m.span())

# sub/subn：替换；subn 返回 (新串, 替换次数)
print(re.sub(r"\d+", "N", "a1b22c333"))       # aNbNcN
print(re.subn(r"\d+", "N", "a1b22c333"))      # ('aNbNcN', 3)

# split：按模式切分
print(re.split(r"[,\s]+", "a, b ,c d"))       # ['a', 'b', 'c', 'd']

# compile：预编译，多次使用时提速
pat = re.compile(r"\b\w+\b")
print(pat.findall("hello world"))
```

### 6.2 元字符与字符类

| 元字符 | 含义 |
|--------|------|
| `.` | 任意字符（默认不含换行） |
| `\d` `\D` | 数字 / 非数字 |
| `\w` `\W` | 单词字符 `[A-Za-z0-9_]` / 非 |
| `\s` `\S` | 空白 / 非空白 |
| `^` `$` | 行首 / 行尾 |
| `\b` | 单词边界 |
| `[abc]` `[^abc]` | 字符类 / 取反 |
| `|` | 或 |

### 6.3 量词与贪婪

| 量词 | 含义 |
|------|------|
| `*` | 0 或多次 |
| `+` | 1 或多次 |
| `?` | 0 或 1 次 |
| `{m,n}` | m 到 n 次 |
| `*?` `+?` `??` | 非贪婪（懒惰） |

```python
import re
# 贪婪 vs 非贪婪
s = "<a>x</a><b>y</b>"
print(re.findall(r"<.*>", s))       # ['<a>x</a><b>y</b>']   贪婪
print(re.findall(r"<.*?>", s))      # ['<a>', '</a>', '<b>', '</b>']   非贪婪
```

::: warning 提醒
正文里展示尖括号务必放进代码块或反引号。本篇所有含尖括号的字符都已在代码块/反引号内。
:::

### 6.4 分组与命名分组

```python
import re

# 捕获组
m = re.match(r"(\d+)-(\d+)", "2026-07")
print(m.group(1), m.group(2))       # 2026 07
print(m.groups())                   # ('2026', '07')

# 命名分组
m = re.match(r"(?P<year>\d+)-(?P<month>\d+)", "2026-07")
print(m.group("year"), m.group("month"))

# 在 sub 里用反向引用 \1 或 \g<name>
print(re.sub(r"(\w+)@(\w+)", r"\2-\1", "user@host"))   # host-user

# 非捕获组 (?:...) 不占用组号
re.match(r"(?:abc)+", "abcabc")
```

### 6.5 标志位

| 标志 | 含义 |
|------|------|
| `re.I` | 忽略大小写 |
| `re.M` | 多行模式，`^`/`$` 匹配每行 |
| `re.S` | `.` 也匹配换行符 |
| `re.X` | 详细模式，可加注释与空白 |

```python
import re
pat = re.compile(r"""
    ^           # 行首
    (?P<key>\w+)
    \s*=\s*     # 等号两侧可有空白
    (?P<val>.+)
    $           # 行尾
""", re.X | re.M)

text = "name = Tom\nage = 18"
for m in pat.finditer(text):
    print(m.group("key"), "->", m.group("val"))
```

### 6.6 常见模式案例

```python
import re

# 邮箱（简化版）
email_re = re.compile(r"[\w.+-]+@[\w-]+(?:\.[\w-]+)+")
print(email_re.findall("联系: a@b.com, c.d@e-f.org"))   # ['a@b.com', 'c.d@e-f.org']

# 中国手机号
phone_re = re.compile(r"1[3-9]\d{9}")
print(phone_re.findall("电话 13812345678 或 19987654321"))

# URL（简化）
url_re = re.compile(r"https?://[\w./\-?=&%]+")

# 提取 kv
kv_re = re.compile(r"(\w+)\s*[:=]\s*([^,;\n]+)")
print(dict(kv_re.findall("name:Tom; age=18, city:北京")))
```

::: warning 不要用正则解析 HTML/JSON
HTML 用 `html.parser` 或第三方 `BeautifulSoup`；JSON 用 `json` 模块。正则解析嵌套结构几乎必踩坑。
:::

---

## 七、math 与 statistics

### 7.1 math

```python
import math

print(math.sqrt(16))         # 4.0
print(math.pow(2, 10))       # 1024.0
print(math.log(8, 2))        # 3.0   以 2 为底
print(math.log(math.e))      # 1.0   自然对数
print(math.ceil(3.2))        # 4
print(math.floor(3.8))       # 3
print(math.factorial(5))     # 120
print(math.gcd(12, 18))      # 6
print(math.pi, math.e)       # 3.141592653589793 2.718281828459045
print(math.isfinite(1.0))    # True
print(math.isinf(float("inf")))  # True
print(math.isnan(float("nan")))  # True

# 3.8+ 新增：comb/perm
print(math.comb(5, 2))       # 10   组合数
print(math.perm(5, 2))       # 20   排列数
```

### 7.2 statistics

```python
import statistics as st

data = [1, 2, 2, 3, 4, 5, 5, 5, 6]

print(st.mean(data))         # 3.666...
print(st.median(data))       # 4
print(st.mode(data))         # 5     众数
print(st.multimode(data))    # [5]   3.8+ 所有众数
print(st.variance(data))     # 方差（样本）
print(st.stdev(data))        # 标准差（样本）
print(st.quantiles(data, n=4))  # 四分位数 3.8+
```

::: tip 样本方差 vs 总体方差
`statistics.variance` 用 n-1（无偏估计），适合样本；若要总体方差用 `pvariance`。
:::

---

## 八、random 与 secrets

### 8.1 random：伪随机

```python
import random

random.seed(42)              # 固定种子，结果可复现（测试常用）
print(random.randint(1, 100))       # [1, 100] 闭区间整数
print(random.randrange(0, 10, 2))   # 0,2,4,6,8
print(random.choice("ABCDEF"))      # 随机一个
print(random.sample(range(100), 5)) # 不重复抽样 5 个
print(random.choices("ABC", k=5))   # 可重复抽样 3.6+

lst = [1, 2, 3, 4, 5]
random.shuffle(lst)          # 原地洗牌
print(lst)
```

::: danger random 不可用于密码学
`random` 基于 Mersenne Twister，状态可预测。生成密码、token、密钥务必用 `secrets`。
:::

### 8.2 secrets：密码学安全随机

```python
import secrets

print(secrets.token_hex(16))        # 32 位十六进制串
print(secrets.token_urlsafe(16))    # URL 安全的 base64 串
print(secrets.choice("ABCDEFGH"))   # 安全选一个

# 生成一个 8 位的不易猜测验证码
print("".join(secrets.choice("0123456789") for _ in range(6)))
```

---

## 九、hashlib 与 hmac

### 9.1 hashlib：哈希摘要

```python
import hashlib

print(hashlib.md5(b"hello").hexdigest())         # 5d41402abc4b2a76b9719d911017c592
print(hashlib.sha256(b"hello").hexdigest())      # 2cf24dba...
print(hashlib.sha512(b"hello").hexdigest()[:32])

# 大文件分块哈希，避免一次读入内存
def file_sha256(path, chunk=1 << 16):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while buf := f.read(chunk):
            h.update(buf)
    return h.hexdigest()

# 派生密钥：pbkdf2_hmac 用于"由密码生成可存的密钥"，加盐多次迭代抗彩虹表
dk = hashlib.pbkdf2_hmac("sha256", b"password", b"salt-xxx", 100_000, dklen=32)
print(dk.hex())
```

::: warning MD5/SHA1 已不安全
不要用于安全场景（数字签名、密码存储）。文件完整性校验可用，密码存储用 `pbkdf2_hmac`/`scrypt` 或第三方 `bcrypt`/`argon2`。
:::

### 9.2 hmac：消息认证码

```python
import hmac, hashlib

key = b"shared-secret"
msg = b"transfer:100USD:toAlice"

sig = hmac.new(key, msg, hashlib.sha256).hexdigest()
print(sig)

# 验证：用 compare_digest 防止时序攻击
expected = hmac.new(key, b"transfer:100USD:toAlice", hashlib.sha256).hexdigest()
print(hmac.compare_digest(sig, expected))   # True
```

---

## 十、subprocess：执行外部命令

```python
import subprocess

# run：高层封装，推荐日常使用
r = subprocess.run(
    ["python", "--version"],
    capture_output=True,    # 捕获 stdout/stderr
    text=True,              # 自动按 utf-8 解码为 str
    check=True,             # 返回码非 0 抛 CalledProcessError
    timeout=5,              # 超时抛 TimeoutExpired
)
print(r.stdout)            # Python 3.12.x\n
print(r.returncode)        # 0

# 输入传递
r = subprocess.run(["wc", "-l"], input="a\nb\nc\n", text=True, capture_output=True)
print(r.stdout.strip())    # 3

# Popen：底层，需要流式交互时用
p = subprocess.Popen(["grep", "Error"], stdin=subprocess.PIPE, text=True)
p.communicate("Error A\nOK\nError B\n")
```

::: danger 永远不要 shell=True 拼接用户输入
`subprocess.run(f"ls {user_input}", shell=True)` 等同于把控制权交给攻击者（命令注入）。规则：
- 优先用列表参数 `["ls", user_input]`，由系统负责转义。
- 必须用 `shell=True` 时，输入要做白名单校验或用 `shlex.quote`。
:::

---

## 十一、argparse：命令行接口

```python
import argparse

parser = argparse.ArgumentParser(
    prog="mytool",
    description="一个示例 CLI",
    epilog="示例: mytool -n 3 --verbose input.txt",
)
parser.add_argument("path", help="输入文件路径")                # 位置参数
parser.add_argument("-n", "--num", type=int, default=1, help="重复次数")
parser.add_argument("--mode", choices=["fast", "slow"], default="fast")
parser.add_argument("-v", "--verbose", action="store_true")     # 开关
parser.add_argument("--tags", nargs="+", default=[])            # 多值
args = parser.parse_args()
print(args)
```

调用 `python tool.py data.txt -n 3 --tags a b -v`，得到：

```
Namespace(path='data.txt', num=3, mode='fast', verbose=True, tags=['a', 'b'])
```

### 子命令：像 git 一样

```python
import argparse

p = argparse.ArgumentParser(prog="repo")
sub = p.add_subparsers(dest="cmd", required=True)

p_add = sub.add_parser("add", help="添加文件")
p_add.add_argument("files", nargs="+")

p_commit = sub.add_parser("commit", help="提交")
p_commit.add_argument("-m", "--message", required=True)

args = p.parse_args()
# args.cmd == "add" -> args.files
# args.cmd == "commit" -> args.message
```

---

## 十二、typing：类型注解

3.10 起，`Optional[X]`/`Union[X, Y]` 都可用 `X | None`/`X | Y` 替代。

```python
from typing import (
    Any, Callable, TypeVar, Generic, Protocol,
    ParamSpec, TypeAlias, Literal, Final, ClassVar, overload,
)
from collections.abc import Sequence  # 3.9+ 推荐从这里导入

# 类型别名
Vector: TypeAlias = list[float]

# TypeVar + Generic：泛型
T = TypeVar("T")
class Stack(Generic[T]):
    def __init__(self) -> None:
        self._s: list[T] = []
    def push(self, x: T) -> None: self._s.append(x)
    def pop(self) -> T: return self._s.pop()

# ParamSpec：装饰器里转发签名
P = ParamSpec("P")
R = TypeVar("R")
def log(fn: Callable[P, R]) -> Callable[P, R]:
    def wrapper(*a: P.args, **kw: P.kwargs) -> R:
        return fn(*a, **kw)
    return wrapper

# Protocol：结构化类型（鸭子类型）
class Drawable(Protocol):
    def draw(self) -> None: ...

# Literal：字面量类型
def mode_color(mode: Literal["r", "g", "b"]) -> int: ...
# Final：禁止再赋值
MAX: Final[int] = 100

# ClassVar：标记类变量（而非实例变量）
class Config:
    DEBUG: ClassVar[bool] = False

# overload：多重签名
@overload
def parse(x: int) -> int: ...
@overload
def parse(x: str) -> str: ...
def parse(x):
    return x
```

::: tip 推荐从 collections.abc 导入
3.9+ 起，`Sequence`/`Iterable`/`Mapping`/`Callable` 等推荐从 `collections.abc` 导入而非 `typing`，`typing` 的对应名字仅为兼容保留。
:::

---

## 十三、其他模块简介

- **pathlib**：面向对象的路径操作，详见第 7 篇。
- **json**：JSON 编解码，详见第 7 篇。
- **dataclasses**：用装饰器自动生成 `__init__`/`__repr__`/`__eq__`，详见第 5 篇。
- **enum**：枚举类型，详见第 5 篇。
- **logging**：日志系统，详见第 12 篇。

---

## 综合案例：统计目录下 Python 文件的 import Top10

下面把 `argparse` + `re` + `collections.Counter` + `pathlib` 串起来，写一个真实可用的小工具。把它存为 `import_top.py`，用 `python import_top.py --dir .` 调用。

::: details 完整源码
```python
"""
import_top.py — 统计目录下所有 .py 文件的 import 次数 TopN

用法：
    python import_top.py --dir ./myproject -n 10
    python import_top.py -d . --exclude tests
"""
from __future__ import annotations

import argparse
import re
import sys
from collections import Counter
from pathlib import Path

# 匹配：
#   import os, sys
#   import numpy as np
#   from collections import Counter, defaultdict
#   from . import foo
#   from ..utils import bar
IMPORT_RE = re.compile(
    r"""
    ^\s*                           # 行首允许空白
    (?:from\s+(?P<from>[\w.]+)     # from 模块
        \s+import\s+
    )?                             # from 部分可选
    import\s+(?P<names>[\w.,\s()\\]+?)
    \s*(?:#.*)?$                   # 行尾允许注释
    """,
    re.VERBOSE | re.MULTILINE,
)


def iter_py_files(root: Path, exclude: list[str]) -> list[Path]:
    """遍历目录，返回所有 .py 文件，跳过 exclude 关键字命中的路径。"""
    files = []
    for p in root.rglob("*.py"):
        s = str(p)
        if any(ex in s for ex in exclude):
            continue
        files.append(p)
    return files


def extract_modules(path: Path) -> list[str]:
    """从一个 .py 文件提取被 import 的顶层模块名。"""
    try:
        text = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return []

    modules: list[str] = []
    for m in IMPORT_RE.finditer(text):
        if m.group("from"):
            # from a.b.c import x  ->  顶层模块 a
            top = m.group("from").lstrip(".").split(".")[0]
            if top:
                modules.append(top)
        else:
            # import a, b as c, (d, e) -> 拆出 a / b / d / e
            raw = m.group("names")
            # 去掉括号和续行符
            raw = raw.replace("(", " ").replace(")", " ").replace("\\", " ")
            for part in raw.split(","):
                part = part.strip().split(" as ")[0].strip()
                if part:
                    modules.append(part.split(".")[0])
    return modules


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        prog="import_top",
        description="统计目录下所有 .py 文件的 import 次数 TopN",
    )
    parser.add_argument("-d", "--dir", type=Path, default=Path("."), help="目标目录")
    parser.add_argument("-n", "--top", type=int, default=10, help="取前 N 名")
    parser.add_argument(
        "--exclude", nargs="*", default=[".venv", "site-packages", "node_modules"],
        help="路径包含这些关键字的文件跳过",
    )
    args = parser.parse_args(argv)

    if not args.dir.is_dir():
        print(f"不是目录: {args.dir}", file=sys.stderr)
        return 1

    files = iter_py_files(args.dir, args.exclude)
    if not files:
        print("没有找到 .py 文件")
        return 0

    counter: Counter[str] = Counter()
    for f in files:
        counter.update(extract_modules(f))

    total = counter.total()
    print(f"扫描 {len(files)} 个 .py 文件，共 {total} 条 import\n")
    print(f"{'排名':<6}{'模块':<25}{'次数':<8}{'占比'}")
    print("-" * 50)
    for i, (mod, cnt) in enumerate(counter.most_common(args.top), 1):
        pct = cnt / total * 100
        print(f"{i:<6}{mod:<25}{cnt:<8}{pct:.1f}%")
    return 0


if __name__ == "__main__":
    sys.exit(main())
```
:::

运行示例（在本仓库 `docs/backend/Python` 目录下执行）：

```text
$ python import_top.py -d . -n 5
扫描 9 个 .py 文件，共 27 条 import

排名  模块                     次数    占比
--------------------------------------------------
1     re                       6      22.2%
2     pathlib                  4      14.8%
3     argparse                 3      11.1%
4     collections              3      11.1%
5     sys                      2      7.4%
```

这个案例综合体现了：用 `pathlib.Path.rglob` 走目录、用 `re.VERBOSE` 写可读的正则、用 `Counter.most_common` 做 TopN、用 `argparse` 暴露 CLI、用 `sys.exit` 控制退出码。把它丢进自己的工具箱，将来分析任何 Python 项目的依赖分布都能立刻用上。

---

## 小结

标准库的精髓是"小工具、可组合"。`itertools` + `functools` + `collections` 三件套足以让你在不写新数据结构的前提下解决 80% 的"流式处理"问题；`datetime` + `zoneinfo` 是处理时间问题的唯一推荐组合；`re` 是文本处理的瑞士军刀，但务必警惕"用正则解析一切"的诱惑；`argparse` + `subprocess` + `pathlib` 是写 CLI 工具的标配。下一节我们将走进异常处理与上下文管理器，看看 Python 如何用 `with` 把资源管理写得优雅又安全。
