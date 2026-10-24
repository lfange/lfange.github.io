---
title: 函数与模块
category:
  - 后端
tag:
  - Python
---

# 函数与模块

函数是 Python 中组织代码、复用逻辑的基本单元，模块则是组织多个相关函数与类的文件方式。掌握函数与模块，是从「会写脚本」迈向「会写工程」的关键一步。本篇基于 Python 3.12+，系统讲解函数定义、参数机制、作用域、高阶函数、递归、类型注解，以及模块与包的完整体系。

## 一、函数定义与调用

### 1.1 def 与 return

Python 用 `def` 关键字定义函数，用 `return` 返回值。一个最简单的例子：

```python
def add(a, b):
    """两数相加"""
    return a + b

print(add(3, 5))  # 输出: 8
```

如果函数没有 `return`，或者 `return` 后不跟任何表达式，则隐式返回 `None`：

```python
def greet(name):
    print(f"Hello, {name}!")

result = greet("Alice")  # 输出: Hello, Alice!
print(result)            # 输出: None

def do_nothing():
    return

print(do_nothing())      # 输出: None
```

::: tip
Python 中所有函数都有返回值，没有显式 `return` 时隐式返回 `None`。这一点和 JavaScript、C 等语言不同——那些语言里"无返回值函数"是 void/undefined 概念，而 Python 是统一的 None。
:::

### 1.2 多返回值（本质元组）

Python 函数可以"返回多个值"，本质是返回一个元组，调用方再解包：

```python
def min_max(numbers):
    return min(numbers), max(numbers)

lo, hi = min_max([3, 1, 4, 1, 5, 9, 2, 6])
print(lo, hi)  # 输出: 1 9

# 不解包时拿到的是元组
result = min_max([3, 1, 4, 1, 5])
print(result)        # 输出: (1, 5)
print(type(result))  # 输出: <class 'tuple'>

# 也可用星号解包
first, *rest = min_max([3, 1, 4, 1, 5])
print(first, rest)   # 输出: 1 [5]
```

### 1.3 文档字符串 docstring

函数、类、模块的第一个字符串表达式称为 docstring，可被 `help()` 读取，也被 IDE 悬浮提示使用。常见风格有三种：

```python
# Google 风格：可读性最好，推荐
def divide(a, b):
    """
    两数相除.

    Args:
        a (float): 被除数
        b (float): 除数，不能为 0

    Returns:
        float: 商

    Raises:
        ZeroDivisionError: 当 b 为 0
    """
    if b == 0:
        raise ZeroDivisionError("除数不能为 0")
    return a / b


# NumPy 风格：科学计算社区常用
def repeat(s, n):
    """
    将字符串重复 n 次.

    Parameters
    ----------
    s : str
        原始字符串
    n : int
        重复次数

    Returns
    -------
    str
        重复后的字符串
    """
    return s * n


# reST 风格：Sphinx 默认
def is_even(n):
    """
    判断是否为偶数.

    :param n: 整数
    :type n: int
    :rtype: bool
    """
    return n % 2 == 0


help(divide)
```

::: tip
团队协作时建议统一一种风格。Google 风格在纯文本里可读性最好，NumPy 风格在数据科学项目里常见，reST 是 Sphinx 老项目的默认。三者都能被 sphinx、pydoc、mkdocs 等工具解析。
:::

## 二、参数（重点）

Python 函数参数机制极其灵活，但也容易踩坑。我们逐一拆解。

### 2.1 位置参数、关键字参数、默认参数

```python
def power(base, exp):
    return base ** exp

# 位置参数：按顺序传
print(power(2, 3))     # 输出: 8

# 关键字参数：按名字传，顺序可变
print(power(exp=3, base=2))  # 输出: 8

# 混合：位置参数必须在关键字参数前面
print(power(2, exp=3))  # 输出: 8


# 默认参数：调用时可省略
def greet(name, greeting="Hello"):
    return f"{greeting}, {name}!"

print(greet("Alice"))              # 输出: Hello, Alice!
print(greet("Bob", greeting="Hi")) # 输出: Hi, Bob!
print(greet("Charlie", "Hey"))     # 输出: Hey, Charlie!
```

::: warning 可变默认参数陷阱（经典坑）
默认参数在函数**定义时**只创建一次，所有调用共享同一对象。若默认值是可变对象（list/dict/set），多次调用会"记忆"上一次的修改：

```python
def append_to(item, lst=[]):
    lst.append(item)
    return lst

print(append_to(1))  # 输出: [1]
print(append_to(2))  # 输出: [1, 2]  ← 期望 [2]，但得到了 [1, 2]!
print(append_to(3))  # 输出: [1, 2, 3]
```

正确做法：用 `None` 作哨兵，函数内部再创建可变对象：

```python
def append_to(item, lst=None):
    if lst is None:
        lst = []
    lst.append(item)
    return lst

print(append_to(1))  # 输出: [1]
print(append_to(2))  # 输出: [2]
```

:::

### 2.2 可变位置参数 *args 与可变关键字参数 **kwargs

```python
def sum_all(*args):
    print(type(args))  # 输出: <class 'tuple'>
    return sum(args)

print(sum_all(1, 2, 3))        # 输出: 6
print(sum_all(1, 2, 3, 4, 5))  # 输出: 15


def show_info(name, **kwargs):
    print(f"name = {name}")
    for k, v in kwargs.items():
        print(f"  {k} = {v}")

show_info("Alice", age=30, city="Beijing", job="Engineer")
# 输出:
# name = Alice
#   age = 30
#   city = Beijing
#   job = Engineer
```

`*args` 把多余的位置参数收集为元组，`**kwargs` 把多余的关键字参数收集为字典。名字 `args`/`kwargs` 只是约定俗成，关键是 `*` 和 `**` 这两个符号。

参数解包（反向操作）：

```python
def add(a, b, c):
    return a + b + c

nums = [1, 2, 3]
print(add(*nums))  # 等价于 add(1, 2, 3)，输出: 6

kwargs = {"a": 1, "b": 2, "c": 3}
print(add(**kwargs))  # 等价于 add(a=1, b=2, c=3)，输出: 6
```

### 2.3 仅关键字参数

在参数列表中用裸 `*` 分隔，`*` 之后的参数必须用关键字传入：

```python
def connect(host, port, *, timeout=10, retry=3):
    print(f"connect {host}:{port}, timeout={timeout}, retry={retry}")

connect("localhost", 8080)              # OK
connect("localhost", 8080, timeout=5)   # OK
# connect("localhost", 8080, 5)         # 报错: timeout 是仅关键字参数
```

这种设计能避免调用方误把 `5` 当成位置参数（比如想传 retry 但传成了 timeout），提升 API 的可读性与稳定性。标准库中 `sorted(iterable, *, key=None, reverse=False)` 就是这种设计。

### 2.4 仅位置参数（Python 3.8+）

在参数列表中用 `/` 分隔，`/` 之前的参数只能按位置传：

```python
def f(x, y, /, z):
    print(x, y, z)

f(1, 2, 3)      # OK
f(1, 2, z=3)    # OK
# f(x=1, y=2, z=3)  # 报错: x, y 是仅位置参数
```

为什么需要仅位置参数？几个场景：
1. 内置 `len(obj)`——`len(obj=5)` 看起来很怪；
2. 参数名无意对外暴露，未来可以自由改名而不破坏调用方；
3. 允许参数名与关键字参数同名而不冲突。

### 2.5 综合签名

把上面所有机制组合起来，看一个"教科书"签名：

```python
def f(a, b=2, /, c=3, *args, d, e=5, **kwargs):
    """
    a:        仅位置参数（必填）
    b=2:      仅位置参数（有默认值）
    c=3:      普通参数（有默认值，可位置可关键字）
    *args:    可变位置参数
    d:        仅关键字参数（必填，*args 之后都是仅关键字）
    e=5:      仅关键字参数（有默认值）
    **kwargs: 可变关键字参数
    """
    print(f"a={a}, b={b}, c={c}, d={d}, e={e}, args={args}, kwargs={kwargs}")


f(10, d=100)
# 输出: a=10, b=2, c=3, d=100, e=5, args=(), kwargs={}

f(1, 2, 3, 4, 5, d=6, e=7, x=8, y=9)
# 输出: a=1, b=2, c=3, d=6, e=7, args=(4, 5), kwargs={'x': 8, 'y': 9}
```

记忆口诀：分隔符顺序是 `/` 在前、`*` 在后，两者之间的参数既可位置也可关键字；`/` 之前只能位置，`*` 之后只能关键字。

## 三、lambda 表达式

`lambda` 创建匿名函数，语法 `lambda 参数: 表达式`，函数体只能是单个表达式，不能包含语句（如赋值、for、if 块）：

```python
# 等价于 def square(x): return x * x
square = lambda x: x * x
print(square(5))  # 输出: 25

add = lambda x, y: x + y
print(add(3, 4))  # 输出: 7

# 也可以有默认参数
power = lambda x, n=2: x ** n
print(power(3))     # 输出: 9
print(power(3, 3))  # 输出: 27
```

`lambda` 最常见的场景是作为高阶函数的 key，避免为一次性逻辑单独定义函数：

```python
users = [
    {"name": "Alice", "age": 30},
    {"name": "Bob", "age": 25},
    {"name": "Charlie", "age": 35},
]

# 按 age 排序
sorted_users = sorted(users, key=lambda u: u["age"])
for u in sorted_users:
    print(u["name"], u["age"])
# 输出:
# Bob 25
# Alice 30
# Charlie 35

# 多关键字排序：先按 age 升序，age 相同按 name 降序
result = sorted(users, key=lambda u: (u["age"], -ord(u["name"][0])))
```

回调场景：

```python
def apply_twice(func, x):
    return func(func(x))

print(apply_twice(lambda x: x + 3, 5))  # 输出: 11
print(apply_twice(lambda x: x * x, 3))  # 输出: 81
```

::: warning 不要滥用 lambda
`lambda` 适合简短、一次性、一眼能看懂的逻辑。一旦逻辑复杂（多行、需要赋值、需要异常处理），应改用 `def`，可读性、可测试性、可调试性都更好。PEP 8 也建议：赋值给变量的 lambda 应改用 def：

```python
# 不推荐
f = lambda x: x * 2

# 推荐
def f(x):
    return x * 2
```

因为 `def` 后函数有 `__name__`，异常栈更友好（栈里显示函数名 `f` 而非匿名的 lambda 函数）。
:::

## 四、作用域 LEGB 规则

Python 查找变量名时按 LEGB 顺序：**L**ocal（函数内局部）→ **E**nclosing（外层嵌套函数）→ **G**lobal（模块级全局）→ **B**uiltin（内置）。

```python
x = "global"

def outer():
    x = "enclosing"

    def inner():
        x = "local"
        print(x)  # 输出: local（找到 Local，停止）
    inner()
    print(x)      # 输出: enclosing（找到 Enclosing，停止）

outer()
print(x)          # 输出: global（找到 Global）
```

再看一个 Builtin 层：

```python
# 不要这样做！
def my_code():
    list = [1, 2, 3]   # 把 list 这个名字绑定到了局部变量
    # 后面再调用 list(...) 会失败，因为 list 不再指向内置类型
    try:
        new = list("abc")
    except TypeError as e:
        print(e)  # 输出: 'list' object is not callable
```

::: warning
永远不要用 `list`、`dict`、`str`、`int`、`id`、`type`、`sum` 等内置名作变量名——它会遮蔽 builtin，导致后续代码诡异出错。
:::

### 4.1 global 声明

函数内默认只能读全局，不能**重新绑定**全局。要改需用 `global` 声明：

```python
counter = 0

def bad_increment():
    # counter += 1  # 报错: UnboundLocalError
    # 因为 += 既是读也是写，Python 看到赋值就把 counter 当 local
    pass

def good_increment():
    global counter
    counter += 1

good_increment()
good_increment()
print(counter)  # 输出: 2
```

### 4.2 nonlocal 声明

`nonlocal` 用于闭包中修改外层（非全局）函数的变量，是构造闭包计数器、状态机的关键：

```python
def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

c = make_counter()
print(c())  # 输出: 1
print(c())  # 输出: 2
print(c())  # 输出: 3

# 每次调用 make_counter 创建独立状态
c2 = make_counter()
print(c2())  # 输出: 1
print(c())   # 输出: 4（c 和 c2 互不影响）
```

### 4.3 可变全局对象的陷阱

```python
data = []

def append_one():
    data.append(1)  # 不需要 global！因为 data 是可变对象，append 是修改不是赋值

append_one()
append_one()
print(data)  # 输出: [1, 1]
```

::: warning
对全局可变对象调用方法（`append`/`update`/`extend` 等）不需要 `global`，因为这不是"重新绑定名字"。但也意味着全局状态很容易被无意修改。大型项目中应尽量避免用全局可变对象充当共享状态，改用类、闭包或依赖注入。
:::

## 五、高阶函数与函数式工具

Python 中函数是**一等公民**：可以赋值给变量、作为参数传递、作为返回值。这是函数式编程的基础。

### 5.1 函数是一等公民

```python
def shout(text):
    return text.upper()

def whisper(text):
    return text.lower()

def greet(func, name):
    """func 是一个函数，作为参数传入"""
    return func(f"Hello, {name}")

print(greet(shout, "Alice"))   # 输出: HELLO, ALICE
print(greet(whisper, "Bob"))   # 输出: hello, bob

# 函数赋值给变量
yell = shout
print(yell("hey"))             # 输出: HEY

# 函数作为返回值
def make_multiplier(factor):
    def multiply(x):
        return x * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(5))  # 输出: 10
print(triple(5))  # 输出: 15
```

### 5.2 map / filter / reduce

```python
from functools import reduce

nums = [1, 2, 3, 4, 5, 6]

# map: 对每个元素应用函数
squares = list(map(lambda x: x * x, nums))
print(squares)  # 输出: [1, 4, 9, 16, 25, 36]

# filter: 过滤
evens = list(filter(lambda x: x % 2 == 0, nums))
print(evens)  # 输出: [2, 4, 6]

# reduce: 累积归约
# 过程: ((((1+2)+3)+4)+5)+6
total = reduce(lambda a, b: a + b, nums)
print(total)  # 输出: 21

product = reduce(lambda a, b: a * b, nums)
print(product)  # 输出: 720

# 带初值的 reduce
total_with_init = reduce(lambda a, b: a + b, nums, 100)
print(total_with_init)  # 输出: 121
```

::: tip 推荐用列表推导式替代
`map` 和 `filter` 在 Python 中能用列表推导式/生成器表达式更优雅地表达：

```python
squares = [x * x for x in nums]              # 替代 map
evens = [x for x in nums if x % 2 == 0]      # 替代 filter
squares_evens = (x * x for x in nums if x % 2 == 0)  # 生成器，惰性求值
```

但 `reduce` 没有对应的推导式语法，仍需用 `functools.reduce`。一般来说，显式循环可读性更好，能用循环就别堆 reduce。
:::

### 5.3 sorted / min / max 的 key 参数

```python
words = ["banana", "apple", "cherry", "date"]

# 默认字典序
print(sorted(words))                          # ['apple', 'banana', 'cherry', 'date']

# 按长度
print(sorted(words, key=len))                 # ['date', 'apple', 'banana', 'cherry']

# 按长度降序
print(sorted(words, key=len, reverse=True))   # ['banana', 'cherry', 'apple', 'date']

# max/min 也支持 key
print(max(words, key=len))  # 输出: banana 或 cherry（长度相同取第一个）
print(min(words, key=len))  # 输出: date

# 复杂排序：先按长度，长度相同按字典序
sorted(words, key=lambda w: (len(w), w))
```

### 5.4 operator 模块

`operator` 模块把运算符封装为函数，避免写 `lambda`：

```python
from operator import itemgetter, attrgetter, mul, add
from functools import reduce

students = [("Alice", 90), ("Bob", 85), ("Charlie", 95)]

# itemgetter: 按下标取值，比 lambda u: u[1] 快且清晰
sorted_by_score = sorted(students, key=itemgetter(1))
print(sorted_by_score)
# 输出: [('Bob', 85), ('Alice', 90), ('Charlie', 95)]

# 多下标
sorted_by_score_then_name = sorted(students, key=itemgetter(1, 0))

# mul: 乘法
product = reduce(mul, [1, 2, 3, 4, 5])
print(product)  # 输出: 120

total = reduce(add, [1, 2, 3, 4, 5])
print(total)    # 输出: 15


# attrgetter: 按属性名取值
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __repr__(self):
        return f"Point({self.x}, {self.y})"

points = [Point(3, 4), Point(1, 2), Point(5, 1)]
sorted_points = sorted(points, key=attrgetter("x"))
print(sorted_points)  # 输出: [Point(1, 2), Point(3, 4), Point(5, 1)]
```

::: tip itertools 预告
`itertools` 提供了大量高效迭代工具（`chain`、`groupby`、`product`、`combinations`、`permutations`、`accumulate`、`islice` 等），是函数式编程的瑞士军刀。本系列第 9 篇会专门详解，这里先留个印象。
:::

## 六、递归

递归是函数调用自身。两个最经典的例子：

```python
# 阶乘: n! = n * (n-1)!
def factorial(n):
    if n <= 1:        # 基线条件
        return 1
    return n * factorial(n - 1)  # 递归条件

print(factorial(5))  # 输出: 120
# 过程: 5 * 4 * 3 * 2 * 1 = 120


# 斐波那契: fib(n) = fib(n-1) + fib(n-2)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(10))  # 输出: 55
```

### 6.1 递归深度限制

Python 默认递归深度 1000，超过会抛 `RecursionError`：

```python
import sys
print(sys.getrecursionlimit())  # 输出: 1000

# 可调整上限（但栈仍受操作系统限制）
sys.setrecursionlimit(2000)

# 调太高反而可能直接段错误（栈溢出 OS 直接杀进程）
```

### 6.2 Python 不支持尾递归优化

很多函数式语言（Scheme、Scala、Erlang）支持尾递归优化（TCO），把尾位置的递归调用转为循环避免栈溢出。**Python 不支持**——Guido 认为这会让调试栈更难，且 Python 强调"显式优于隐式"。所以即使把递归写成尾递归形式，照样会栈溢出。

### 6.3 递归转迭代

对深递归，应手动改写为循环：

```python
# 阶乘迭代版
def factorial_iter(n):
    result = 1
    for i in range(2, n + 1):
        result *= i
    return result

print(factorial_iter(5))  # 输出: 120


# 斐波那契迭代版：只用两个变量，O(n) 时间 O(1) 空间
def fib_iter(n):
    if n < 2:
        return n
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

print(fib_iter(100))  # 输出: 354224848179261915075
```

::: tip 记忆化装饰器
对重复子问题多的递归（如朴素 fib，时间复杂度 O(2^n)），可用 `functools.lru_cache` 自动记忆化，降到 O(n)：

```python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(100))  # 输出: 354224848179261915075，瞬间完成
```

装饰器将在第 5 篇详解。
:::

## 七、类型注解函数

Python 3.5+ 支持类型注解，3.9+ 后注解语法进一步简化（可直接用 `list[int]` 替代 `List[int]`）。注解**不影响运行**，但能被 IDE、mypy、pyright 用作静态检查。

### 7.1 参数与返回值注解

```python
def greet(name: str, times: int = 1) -> str:
    return (f"Hello, {name}! " * times).strip()

print(greet("Alice"))        # 输出: Hello, Alice!
print(greet("Bob", 3))       # 输出: Hello, Bob! Hello, Bob! Hello, Bob!
```

### 7.2 复合类型

```python
from typing import Optional, Union, Callable

# Optional[int] 等价于 int | None（Python 3.10+ 推荐后者）
def find_first_even(nums: list[int]) -> Optional[int]:
    for n in nums:
        if n % 2 == 0:
            return n
    return None

print(find_first_even([1, 3, 4, 5]))  # 输出: 4
print(find_first_even([1, 3, 5]))     # 输出: None


# Union 多类型（Python 3.10+ 可写 int | str）
def parse_value(s: str) -> Union[int, float, str]:
    try:
        return int(s)
    except ValueError:
        try:
            return float(s)
        except ValueError:
            return s

print(parse_value("42"))     # 输出: 42（int）
print(parse_value("3.14"))   # 输出: 3.14（float）
print(parse_value("hello"))  # 输出: hello（str）


# Callable 类型注解：参数类型列表 + 返回类型
def apply(func: Callable[[int, int], int], a: int, b: int) -> int:
    return func(a, b)

print(apply(lambda x, y: x + y, 3, 5))  # 输出: 8


# 字典/元组注解
def count_words(text: str) -> dict[str, int]:
    result: dict[str, int] = {}
    for word in text.split():
        result[word] = result.get(word, 0) + 1
    return result

print(count_words("hello world hello"))
# 输出: {'hello': 2, 'world': 1}
```

### 7.3 TypeVar 泛型函数

```python
from typing import TypeVar

T = TypeVar("T")

def first(items: list[T]) -> T:
    """返回列表第一个元素，类型与列表元素一致."""
    if not items:
        raise IndexError("empty list")
    return items[0]

print(first([1, 2, 3]))         # 返回 int
print(first(["a", "b", "c"]))   # 返回 str
```

::: tip
注解只是元信息，运行时不强制。`greet(123)` 在解释器里照样执行（最后 `f"Hello, {123}!"` 也能成立），但 mypy 会报错。注解的核心价值是文档化 + 静态检查 + IDE 提示。大型项目几乎都会强制使用 mypy/pyright。
:::

## 八、模块 module

一个 `.py` 文件就是一个模块。模块让我们把代码按职责拆分、复用、避免单文件膨胀。

### 8.1 import 语句

假设我们有 `math_utils.py`：

```python
# math_utils.py
def add(a, b):
    return a + b

def multiply(a, b):
    return a * b

PI = 3.14159
```

在另一个文件中使用：

```python
# main.py
import math_utils

print(math_utils.add(2, 3))        # 输出: 5
print(math_utils.PI)               # 输出: 3.14159

# from ... import ...
from math_utils import add, multiply, PI
print(add(4, 5))                   # 输出: 9
print(multiply(2, 6))              # 输出: 12

# as 别名
import math_utils as mu
print(mu.add(7, 8))                # 输出: 15

from math_utils import add as plus
print(plus(1, 2))                  # 输出: 3
```

::: tip 选择 import 风格
- `import module`：最安全，名字空间清晰，避免重名。
- `from module import name`：写起来短，但要小心名字冲突。
- `from module import *`：**强烈不推荐**，会污染名字空间，且 IDE 无法追踪。

PEP 8 建议：始终用 `from module import name` 或 `import module`，不要用 `*`。
:::

### 8.2 import 执行机制

首次 `import` 一个模块时，Python 会：
1. 在 `sys.modules` 缓存中查找，命中则直接返回；
2. 否则在 `sys.path` 列表的目录中查找该模块文件；
3. 找到后**执行模块顶层代码**（函数定义、类定义、顶层语句都会执行）；
4. 把模块对象存入 `sys.modules`，再次 import 直接复用，**不再执行**。

```python
import sys
print("math" in sys.modules)  # 输出: True（已被 import 过）
```

演示只执行一次——`counter_module.py`：

```python
# counter_module.py
print("module loaded!")  # 顶层 print
x = 0
def inc():
    global x
    x += 1
    return x
```

```python
# main.py
import counter_module   # 打印: module loaded!
import counter_module   # 不再打印！直接从 sys.modules 取
import counter_module   # 同上
```

::: warning
不要在模块顶层放有副作用的代码（如启动服务、写文件、发起网络请求、连数据库）。这些应放进函数或 `if __name__ == "__main__":` 块中，否则被 import 时就会执行，造成意外且难以调试。
:::

### 8.3 __name__ 与 __main__

每个模块都有 `__name__` 属性。直接运行时为 `"__main__"`，被 import 时为模块名（不含 `.py`）：

```python
# greet_module.py
def hello():
    print("Hi!")

if __name__ == "__main__":
    # 只有直接运行 greet_module.py 才执行
    hello()
    print("This is main")
```

- 直接运行 `python greet_module.py`：会打印 `Hi!` 和 `This is main`。
- `import greet_module`：`__name__` 变成 `"greet_module"`，`if` 块内代码不执行。

这种模式让模块既能作为库被导入，又能作为脚本独立运行（常用于自测、CLI 入口）。

### 8.4 __all__ 控制 from module import *

```python
# my_module.py
__all__ = ["public_func", "PUBLIC_VAR"]

PUBLIC_VAR = 42
_PRIVATE_VAR = "secret"

def public_func():
    return "I am public"

def _helper():
    return "I am internal"
```

```python
# main.py
from my_module import *

print(public_func())  # OK
print(PUBLIC_VAR)     # OK
# print(_helper())    # NameError: 未导入
# print(_PRIVATE_VAR) # NameError: 未导入
```

::: tip
`__all__` 只影响 `from module import *`，显式 `from my_module import _helper` 仍然可以。约定俗成：以 `_` 开头的名字是"内部"的，不应该被外部使用。即便没有 `__all__`，`import *` 也不会导入下划线开头的名字。
:::

### 8.5 模块搜索路径 sys.path 与 PYTHONPATH

```python
import sys
for p in sys.path:
    print(p)
```

`sys.path` 通常包含：
1. 当前脚本所在目录（或交互式启动时的当前目录）；
2. `PYTHONPATH` 环境变量中的目录（Windows 用 `;` 分隔，类 Unix 用 `:`）；
3. Python 安装的标准库目录；
4. 第三方包安装目录（site-packages）。

可以通过设置环境变量 `PYTHONPATH=/my/libs python main.py` 来添加自定义搜索路径，或在代码中 `sys.path.insert(0, "/my/libs")`（不推荐，破坏可移植性，应改用包安装）。

### 8.6 标准库导入示例

Python 自带 200+ 标准库模块，"电池齐全"：

```python
import random
print(random.randint(1, 100))          # 1~100 随机整数
print(random.choice(["a", "b", "c"]))  # 随机选一个
print(random.random())                 # 0~1 浮点数
print(random.sample([1, 2, 3, 4, 5], 3))  # 不重复抽样 3 个


import datetime
now = datetime.datetime.now()
print(now)                              # 例如: 2026-07-20 14:30:00.123456
print(now.strftime("%Y-%m-%d %H:%M:%S"))  # 例如: 2026-07-20 14:30:00
print(datetime.date.today())            # 例如: 2026-07-20


import math
print(math.sqrt(16))       # 输出: 4.0
print(math.pi)             # 输出: 3.141592653589793
print(math.factorial(5))   # 输出: 120
print(math.log2(1024))     # 输出: 10.0
print(math.gcd(12, 18))    # 输出: 6


import os
print(os.getcwd())         # 当前工作目录
print(os.cpu_count())      # CPU 核数
```

## 九、包 package

包是模块的集合，本质是一个含 `__init__.py` 的目录（Python 3.3+ 也支持命名空间包，可省略 `__init__.py`，但普通项目仍建议显式写）。

### 9.1 绝对导入 vs 相对导入

```text
myproject/
├── math_tools/
│   ├── __init__.py
│   ├── basic.py
│   └── advanced.py
└── main.py
```

在 `advanced.py` 中引用 `basic.py`：

```python
# advanced.py
# 绝对导入（推荐，IDE 友好，重构时易追踪）
from math_tools.basic import add

# 相对导入（在包内部使用，跨包重构时方便）
from .basic import add       # . 表示当前包
from ..other import foo      # .. 表示上一级包
```

::: warning
相对导入**只能在包内部使用**，不能在作为主脚本运行的文件中使用（即 `__name__ == "__main__"` 的文件）。否则会报 `ImportError: attempted relative import with no known parent package`。需要相对导入测试时，用 `python -m package.module` 而非 `python package/module.py`。
:::

### 9.2 __init__.py 的作用

`__init__.py` 在包被导入时执行，常用于：
- 初始化包级状态；
- 把子模块的符号"提升"到包级 API（让用户少写一层路径）；
- 通过 `__all__` 控制 `from package import *` 的导出；
- 标记目录为包（Python 3.3 之前必需，3.3+ 命名空间包可省略，但普通项目仍建议写）。

### 9.3 完整多文件包示例

下面是一个完整可运行的 `math_tools` 包，包含 4 个文件：

```text
math_tools/
├── __init__.py
├── basic.py
├── advanced.py
└── __main__.py
```

**`math_tools/basic.py`**：

```python
"""基础数学运算."""

__all__ = ["add", "subtract", "multiply", "divide"]

def add(a: float, b: float) -> float:
    """加法."""
    return a + b

def subtract(a: float, b: float) -> float:
    """减法."""
    return a - b

def multiply(a: float, b: float) -> float:
    """乘法."""
    return a * b

def divide(a: float, b: float) -> float:
    """除法，b 不能为 0."""
    if b == 0:
        raise ZeroDivisionError("除数不能为 0")
    return a / b
```

**`math_tools/advanced.py`**：

```python
"""进阶数学运算."""

import math
from typing import Sequence

from .basic import multiply  # 相对导入，复用基础运算

__all__ = ["sqrt", "power", "factorial", "mean", "variance"]

def sqrt(x: float) -> float:
    """平方根."""
    if x < 0:
        raise ValueError("不能对负数开平方")
    return math.sqrt(x)

def power(base: float, exp: float) -> float:
    """幂运算."""
    return base ** exp

def factorial(n: int) -> int:
    """阶乘."""
    if n < 0:
        raise ValueError("负数没有阶乘")
    return math.factorial(n)

def mean(nums: Sequence[float]) -> float:
    """平均值."""
    if not nums:
        raise ValueError("空序列无平均值")
    return sum(nums) / len(nums)

def variance(nums: Sequence[float]) -> float:
    """方差（总体方差）."""
    m = mean(nums)
    return mean([(x - m) ** 2 for x in nums])
```

**`math_tools/__init__.py`**：

```python
"""math_tools 包的初始化文件.

把子模块的常用函数提升到包级 API，调用方可以直接：
    from math_tools import add, sqrt
而不必写：
    from math_tools.basic import add
"""

from .basic import add, subtract, multiply, divide
from .advanced import sqrt, power, factorial, mean, variance

__all__ = [
    # 来自 basic
    "add", "subtract", "multiply", "divide",
    # 来自 advanced
    "sqrt", "power", "factorial", "mean", "variance",
]

__version__ = "1.0.0"
```

**`math_tools/__main__.py`**：让包可被 `python -m math_tools` 调用：

```python
"""python -m math_tools 运行时的入口."""

from . import add, sqrt, factorial, mean, variance

def main():
    print("add(2, 3) =", add(2, 3))
    print("sqrt(16) =", sqrt(16))
    print("factorial(5) =", factorial(5))
    print("mean([1, 2, 3, 4, 5]) =", mean([1, 2, 3, 4, 5]))
    print("variance([1, 2, 3, 4, 5]) =", variance([1, 2, 3, 4, 5]))

if __name__ == "__main__":
    main()
```

调用方使用：

```python
# 直接从包顶层导入（推荐，因为 __init__.py 已经提升了 API）
from math_tools import add, sqrt, factorial, mean, variance, __version__

print(add(2, 3))              # 输出: 5
print(sqrt(16))               # 输出: 4.0
print(factorial(5))           # 输出: 120
print(mean([1, 2, 3, 4, 5]))  # 输出: 3.0
print(variance([1, 2, 3, 4, 5]))  # 输出: 2.0
print(__version__)            # 输出: 1.0.0

# 也可从子模块导入（适合只需要某个子模块的场景）
from math_tools.advanced import power
print(power(2, 10))           # 输出: 1024
```

命令行运行：

```bash
$ python -m math_tools
add(2, 3) = 5
sqrt(16) = 4.0
factorial(5) = 120
mean([1, 2, 3, 4, 5]) = 3.0
variance([1, 2, 3, 4, 5]) = 2.0
```

::: tip 包级 API 设计
通过 `__init__.py` 把内部模块结构隐藏起来，对外只暴露稳定的 API（`from math_tools import add`）。日后即使把 `add` 从 `basic.py` 移到 `core.py`，调用方代码也不需要改——这就是包级封装的价值，也是大型库（如 `pandas`、`numpy`）的通用做法。
:::

## 十、第三方包安装与使用

Python 生态有数十万第三方包（PyPI 上），统一通过 `pip` 安装：

```bash
# 安装
pip install requests

# 指定版本
pip install requests==2.31.0

# 版本范围
pip install "requests>=2.28,<3.0"

# 升级
pip install --upgrade requests

# 卸载
pip uninstall requests

# 列出已安装
pip list

# 导出依赖清单
pip freeze > requirements.txt

# 批量安装
pip install -r requirements.txt
```

安装后即可在代码中 `import`：

```python
import requests

response = requests.get("https://api.github.com")
print(response.status_code)  # 输出: 200
data = response.json()
print(data.get("current_user_url"))  # 输出: https://api.github.com/user

# 带查询参数
resp = requests.get(
    "https://api.github.com/search/repositories",
    params={"q": "python", "sort": "stars", "per_page": 3}
)
print(resp.status_code)
for item in resp.json().get("items", []):
    print(item["full_name"], item["stargazers_count"])
```

::: warning 虚拟环境
强烈建议用虚拟环境（`venv` / `virtualenv` / `conda`）隔离项目依赖，不要直接往全局 Python 装包：

```bash
# 创建虚拟环境
python -m venv .venv

# 激活（Windows PowerShell）
.venv\Scripts\Activate.ps1

# 激活（Windows CMD）
.venv\Scripts\activate.bat

# 激活（macOS/Linux）
source .venv/bin/activate

# 之后 pip install 装的包都在 .venv 内，与全局隔离
# 退出
deactivate
```

更现代的工具是 [`uv`](https://github.com/astral-sh/uv)，速度比 pip 快 10-100 倍，且能管理 Python 版本。
:::

::: details 综合练习：实现一个支持链式调用的简易计算器模块

要求：
- 包 `calculator` 提供一个 `Calculator` 类；
- 支持链式调用：`Calculator(10).add(5).multiply(2).subtract(3).value` 得到 `27`；
- 支持加减乘除、幂运算；
- 除法时除数为 0 抛 `ZeroDivisionError`；
- 提供 `reset()` 重置、`result()` 取结果；
- 用类型注解；
- 编写 `__all__` 与 docstring；
- 支持 `python -m calculator` 运行示例。

**目录结构**：

```text
calculator/
├── __init__.py
├── core.py
└── __main__.py
```

**`calculator/__init__.py`**：

```python
"""简易链式计算器包."""

from .core import Calculator

__all__ = ["Calculator"]
__version__ = "1.0.0"
```

**`calculator/core.py`**：

```python
"""Calculator 核心实现."""

from __future__ import annotations

__all__ = ["Calculator"]


class Calculator:
    """支持链式调用的简易计算器.

    每个运算方法返回 self，从而支持链式调用。

    Examples:
        >>> calc = Calculator(10)
        >>> calc.add(5).multiply(2).subtract(3).result()
        27
        >>> Calculator(2).add(3).multiply(4).power(2).value
        400.0
    """

    def __init__(self, initial: float = 0) -> None:
        self._value: float = initial

    @property
    def value(self) -> float:
        """当前值（只读）."""
        return self._value

    def result(self) -> float:
        """返回当前结果（与 value 等价，语义更清晰）."""
        return self._value

    def reset(self, initial: float = 0) -> "Calculator":
        """重置为指定值，默认 0，返回 self 以便继续链式调用."""
        self._value = initial
        return self

    def add(self, n: float) -> "Calculator":
        """加 n."""
        self._value += n
        return self

    def subtract(self, n: float) -> "Calculator":
        """减 n."""
        self._value -= n
        return self

    def multiply(self, n: float) -> "Calculator":
        """乘以 n."""
        self._value *= n
        return self

    def divide(self, n: float) -> "Calculator":
        """除以 n，n 不能为 0."""
        if n == 0:
            raise ZeroDivisionError("除数不能为 0")
        self._value /= n
        return self

    def power(self, n: float) -> "Calculator":
        """取 n 次幂."""
        self._value **= n
        return self

    def __repr__(self) -> str:
        return f"Calculator(value={self._value!r})"

    def __eq__(self, other: object) -> bool:
        if isinstance(other, Calculator):
            return self._value == other._value
        if isinstance(other, (int, float)):
            return self._value == other
        return NotImplemented
```

**`calculator/__main__.py`**：

```python
"""python -m calculator 运行时的示例."""

from . import Calculator


def main() -> None:
    # 链式调用
    r1 = Calculator(10).add(5).multiply(2).subtract(3).result()
    print("Calculator(10).add(5).multiply(2).subtract(3) =", r1)
    # 输出: 27

    # 复合运算: ((2 + 3) * 4) ^ 2 = 400
    r2 = Calculator(2).add(3).multiply(4).power(2).value
    print("Calculator(2).add(3).multiply(4).power(2) =", r2)
    # 输出: 400.0

    # reset 后复用
    calc = Calculator()
    calc.add(100).multiply(2)
    print("after add(100).multiply(2):", calc.result())  # 输出: 200
    calc.reset().add(1)
    print("after reset().add(1):", calc.result())        # 输出: 1

    # 异常
    try:
        Calculator(10).divide(0)
    except ZeroDivisionError as e:
        print("divide by zero:", e)  # 输出: 除数不能为 0

    # 比较
    print("Calculator(5) == 5:", Calculator(5) == 5)               # 输出: True
    print("Calculator(5) == Calculator(5):", Calculator(5) == Calculator(5))  # 输出: True


if __name__ == "__main__":
    main()
```

**调用示例**：

```python
from calculator import Calculator

# 链式调用
result = Calculator(10).add(5).multiply(2).subtract(3).result()
print(result)  # 输出: 27

# 复合运算: ((2 + 3) * 4) ^ 2 = 400
v = Calculator(2).add(3).multiply(4).power(2).value
print(v)  # 输出: 400.0

# reset 后复用
calc = Calculator()
calc.add(100).multiply(2)
print(calc.result())  # 输出: 200
calc.reset().add(1)
print(calc.result())  # 输出: 1

# 异常
try:
    Calculator(10).divide(0)
except ZeroDivisionError as e:
    print(e)  # 输出: 除数不能为 0

# 比较
print(Calculator(5) == 5)                  # 输出: True
print(Calculator(5) == Calculator(5))      # 输出: True
```

**设计要点**：
1. 每个运算方法返回 `self`，从而支持链式调用（Fluent Interface 模式）；
2. 用 `@property` 让 `value` 只读，外部不能直接 `calc.value = 100` 绕过校验；
3. `from __future__ import annotations` 让注解字符串化，可直接写 `"Calculator"` 而无需在 3.10 之前用字符串；
4. 实现 `__repr__` 让调试时打印更友好（显示 `Calculator(value=27)` 而非默认对象表示）；
5. 实现 `__eq__` 让计算器能直接和数字、其他计算器比较，提升易用性；
6. `__main__.py` 让包可被 `python -m calculator` 调用，便于演示与自测。
:::

## 小结

本篇覆盖了 Python 函数与模块的核心知识：

- **函数定义**：`def`、`return`、多返回值（本质元组）、docstring 三种风格（Google/NumPy/reST）；
- **参数机制**：位置/关键字/默认/`*args`/`**kwargs`/仅关键字/仅位置，以及可变默认参数陷阱；
- **lambda**：匿名函数，适合简短一次性逻辑（排序 key、回调），不宜滥用；
- **LEGB 作用域**：`global` 改全局、`nonlocal` 改闭包外层、可变全局对象的隐式修改陷阱；
- **函数式工具**：`map`/`filter`/`reduce`、`sorted` 的 `key`、`operator` 模块（`itemgetter`/`attrgetter`/`mul`）；
- **递归**：阶乘、斐波那契、深度限制、Python 不支持尾递归优化、转迭代、`lru_cache` 记忆化；
- **类型注解**：`Optional`/`Union`/`list[int]`/`Callable`/`TypeVar`，运行不强制但提升可读性与 IDE/mypy 检查；
- **模块**：`import` 机制（首次执行+缓存到 `sys.modules`）、`__name__` 与 `__main__`、`__all__`、`sys.path` 与 `PYTHONPATH`；
- **包**：`__init__.py`、绝对/相对导入、包级 API 设计、`__main__.py` 让包可被 `python -m` 调用；
- **第三方包**：`pip install`、虚拟环境隔离依赖。

下一篇我们将进入 **装饰器与生成器**——它们是 Python 中最优雅的两个高级特性，也是写出"Pythonic"代码的关键。
