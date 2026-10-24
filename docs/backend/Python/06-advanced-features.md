---
title: 高级语言特性
category:
  - 后端
tag:
  - Python
---

# 高级语言特性

本篇是《Python 从入门到精通》第 06 篇，基于 Python 3.12+。我们将系统讲解 Python 的"灵魂特性"：闭包、装饰器、迭代器、生成器、上下文管理器、元类。这些特性是写出 Pythonic 代码、读懂主流框架源码（Django、Flask、SQLAlchemy、FastAPI）的必备基础。

建议边读边在交互式终端敲一遍示例。每个知识点都配可运行代码，并标注预期输出。

---

## 一、闭包深入

### 1.1 什么是闭包

闭包（Closure）是指：**一个函数记住了它定义时所在的作用域里的变量，即使那个作用域已经退出，函数依然能访问这些变量**。

构成闭包的三要素：
1. 存在函数嵌套（外层函数内定义内层函数）。
2. 内层函数引用了外层函数的局部变量（自由变量）。
3. 外层函数把内层函数作为返回值返回出去。

一个最简例子：

```python
def make_adder(n):
    def adder(x):
        return x + n   # n 是自由变量，来自外层 make_adder 的作用域
    return adder

add10 = make_adder(10)
add20 = make_adder(20)

print(add10(5))   # 15
print(add20(5))   # 25
print(add10(5))   # 15  —— add10 记住的是 10，不是 20
```

`make_adder(10)` 调用结束后，按理说它的局部变量 `n` 应该被销毁。但 `adder` 仍然能访问 `n=10`，这就是闭包的力量：**自由变量被内层函数"俘获"，跟随内层函数存活**。

### 1.2 `__closure__` 与 cell 对象

每个函数对象都有一个 `__closure__` 属性，如果它是闭包，这个属性就是一个 cell 对象元组，每个 cell 对应一个被捕获的自由变量。

```python
def make_counter():
    count = 0                # 自由变量
    def counter():
        nonlocal count       # 声明修改外层变量
        count += 1
        return count
    return counter

c = make_counter()
print(c())   # 1
print(c())   # 2
print(c())   # 3

# 查看 __closure__
print(c.__closure__)              # 输出类似 (<cell at 0x...: int object at 0x...>,)
print(c.__closure__[0].cell_contents)   # 3 —— 直接读出被俘获的变量当前值
```

::: tip
`nonlocal` 是 Python 3 引入的关键字，用于在闭包内层函数中**修改**外层（非全局）变量。不加 `nonlocal` 而直接赋值 `count = count + 1` 会把 `count` 当成内层局部变量，触发 `UnboundLocalError`。
:::

### 1.3 经典陷阱：循环中的延迟绑定

下面这段代码是面试高频题：

```python
funcs = []
for i in range(3):
    funcs.append(lambda: i)

print([f() for f in funcs])   # [2, 2, 2] —— 不是 [0, 1, 2]！
```

为什么所有 lambda 都返回 2？因为 lambda 体内的 `i` 是**自由变量**，绑定的不是"循环到 i=0 时的 0"，而是"外层作用域里那个变量 i 本身"。等循环跑完，`i` 已经是 2，三个 lambda 一起读到 2。

这就是"延迟绑定"：闭包捕获的是变量本身，而不是它当前的值。

**修复方法一：默认参数立即求值**

```python
funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])   # [0, 1, 2]
```

默认参数 `i=i` 在函数定义时立即求值，把当时的 `i` 值固化到参数里。

**修复方法二：`functools.partial`**

```python
from functools import partial

funcs = [partial(lambda i: i, i) for i in range(3)]
print([f() for f in funcs])   # [0, 1, 2]
```

**修复方法三：再包一层工厂函数**

```python
def make_func(i):
    return lambda: i

funcs = [make_func(i) for i in range(3)]
print([f() for f in funcs])   # [0, 1, 2]
```

每次调用 `make_func(i)` 都创建一个**新的作用域**，`i` 是该作用域的局部变量，互不干扰。

### 1.4 闭包应用：计数器与配置工厂

**计数器**（带状态的函数）：

```python
def make_counter(start=0, step=1):
    current = start
    def counter():
        nonlocal current
        current += step
        return current
    return counter

c = make_counter(100, 5)
print(c(), c(), c())   # 105 110 115
```

**配置工厂**（根据参数生成定制函数）：

```python
def make_url_formatter(host, scheme="https"):
    def fmt(path):
        return f"{scheme}://{host}/{path.lstrip('/')}"
    return fmt

github = make_url_formatter("github.com")
local  = make_url_formatter("localhost", scheme="http")

print(github("lfange/lfange.github.io"))   # https://github.com/lfange/lfange.github.io
print(local("api/users"))                  # http://localhost/api/users
```

闭包本质上是一种**轻量的对象**：把"状态 + 行为"打包，但比写一个类更简洁。

---

## 二、装饰器（重点）

装饰器是 Python 最优雅的特性之一，广泛用于日志、计时、缓存、权限校验、路由注册等场景。

### 2.1 装饰器本质

理解装饰器只需要三句话：
1. **函数是一等公民**：函数可以赋值给变量、作为参数传递、作为返回值。
2. **闭包**：内层函数可以捕获外层变量。
3. **语法糖**：`@deco` 修饰 `def f(): ...` 等价于 `f = deco(f)`。

先写一个最简装饰器，拆解等价关系：

```python
def my_decorator(func):
    def wrapper(*args, **kwargs):
        print(f"[before] calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"[after]  {func.__name__} done")
        return result
    return wrapper

@my_decorator
def hello(name):
    return f"hello, {name}"

# @my_decorator 等价于：hello = my_decorator(hello)
print(hello("Lfange"))
# [before] calling hello
# [after]  hello done
# hello, Lfange
```

`@my_decorator` 只是个语法糖。装饰器接收一个函数，返回一个新函数（这里是 `wrapper`），新函数通常在内层调用原函数并在前后做增强。

### 2.2 `functools.wraps` 保留元信息

装饰器有一个常见坑：被装饰后的函数，`__name__`、`__doc__` 都变成了 `wrapper` 的。

```python
@my_decorator
def hello(name):
    """say hello"""
    return f"hello, {name}"

print(hello.__name__)   # wrapper —— 元信息丢失！
print(hello.__doc__)    # None
```

修复方法：用 `functools.wraps` 把原函数的元信息复制到 wrapper 上。

```python
from functools import wraps

def my_decorator(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        print(f"[before] calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

@my_decorator
def hello(name):
    """say hello"""
    return f"hello, {name}"

print(hello.__name__)   # hello
print(hello.__doc__)    # say hello
```

::: warning
写生产级装饰器**永远**要加 `@wraps(func)`，否则后续依赖函数名/文档字符串的工具（如 pytest、Sphinx、FastAPI）会出错。
:::

### 2.3 带参数的装饰器（三层嵌套）

如果装饰器自身需要参数（比如日志级别、重试次数），就要再多一层：

```python
from functools import wraps

def repeat(times):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            result = None
            for _ in range(times):
                result = func(*args, **kwargs)
            return result
        return wrapper
    return decorator

@repeat(3)
def greet(name):
    print(f"hi {name}")

greet("Tom")
# hi Tom
# hi Tom
# hi Tom
```

等价关系：`greet = repeat(3)(greet)`。`repeat(3)` 返回真正的装饰器 `decorator`，`decorator(greet)` 返回 `wrapper`。

三层结构记忆口诀：**最外层收参、中层收函数、最内层收调用时的参数**。

### 2.4 类装饰器（用 `__call__`）

类只要实现 `__call__` 方法，其实例就可以像函数一样被调用，因此也可以做装饰器。类装饰器的优势是可以保存状态：

```python
class CountCalls:
    def __init__(self, func):
        self.func = func
        self.count = 0

    def __call__(self, *args, **kwargs):
        self.count += 1
        print(f"{self.func.__name__} 被调用第 {self.count} 次")
        return self.func(*args, **kwargs)

@CountCalls
def say_hi():
    print("hi")

say_hi(); say_hi(); say_hi()
# say_hi 被调用第 1 次
# hi
# say_hi 被调用第 2 次
# hi
# say_hi 被调用第 3 次
# hi
```

### 2.5 装饰类（给类加方法 / 注册）

除了装饰函数，装饰器也可以装饰类——接收类、返回类。常见用途是给类动态添加方法或把类注册到某张表里。

```python
def add_repr(cls):
    def __repr__(self):
        attrs = ", ".join(f"{k}={v!r}" for k, v in self.__dict__.items())
        return f"{cls.__name__}({attrs})"
    cls.__repr__ = __repr__
    return cls

@add_repr
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

print(Point(1, 2))   # Point(x=1, y=2)
```

### 2.6 多个装饰器的执行顺序

```python
@deco_a
@deco_b
@deco_c
def f(): ...
```

等价于 `f = deco_a(deco_b(deco_c(f)))`。也就是说：

- **装饰阶段（包装顺序）**：自下而上，`deco_c` 先包装 `f`，然后 `deco_b` 包装结果，最后 `deco_a` 包装最外层。
- **调用阶段（执行顺序）**：自上而下，调用 `f()` 时先进入 `deco_a` 的 wrapper，再到 `deco_b`，再到 `deco_c`，最后才执行真正的 `f`。

一个直观例子：

```python
def deco_a(func):
    def wrapper():
        print("A-before")
        func()
        print("A-after")
    return wrapper

def deco_b(func):
    def wrapper():
        print("B-before")
        func()
        print("B-after")
    return wrapper

@deco_a
@deco_b
def f():
    print("f")

f()
# A-before
# B-before
# f
# B-after
# A-after
```

像洋葱模型：从外往里穿进去，再从里往外穿出来。

### 2.7 内置常用装饰器

#### `@property`：把方法变成属性访问

```python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value <= 0:
            raise ValueError("radius must be positive")
        self._radius = value

    @property
    def area(self):
        import math
        return math.pi * self._radius ** 2

c = Circle(2)
print(c.radius, c.area)   # 2 12.566370614359172
c.radius = 3
print(c.area)             # 28.274333882308138
# c.radius = -1   # 抛 ValueError
```

#### `@staticmethod` / `@classmethod`

```python
class Date:
    def __init__(self, year, month, day):
        self.year, self.month, self.day = year, month, day

    @classmethod
    def from_string(cls, s):
        y, m, d = map(int, s.split("-"))
        return cls(y, m, d)        # cls 是当前类，便于子类继承时使用

    @staticmethod
    def is_leap(year):
        return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

d = Date.from_string("2026-07-20")
print(d.year, d.month, d.day)   # 2026 7 20
print(Date.is_leap(2024))       # True
print(Date.is_leap(2100))       # False
```

#### `@functools.lru_cache`：LRU 缓存

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def fib(n):
    if n < 2:
        return n
    return fib(n-1) + fib(n-2)

print(fib(50))            # 12586269025 —— 几乎瞬间返回
print(fib.cache_info())   # CacheInfo(hits=48, misses=51, maxsize=128, currsize=51)
```

`hits` 表示命中次数，`misses` 表示未命中（实际计算）次数。`maxsize=None` 等价于无界缓存，3.9+ 推荐用更简洁的 `@functools.cache`。

::: tip
`lru_cache` 默认按所有参数（位置 + 关键字）做缓存键，要求参数都是可哈希的。如果传入 list/dict 会抛 `TypeError`。
:::

#### `@functools.singledispatch`：单分派泛函数

详见本篇第七节。

### 2.8 装饰器实战案例（5+ 个）

#### 案例 1：计时装饰器

```python
import time
from functools import wraps

def timing(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"[timing] {func.__name__} 耗时 {elapsed*1000:.2f} ms")
        return result
    return wrapper

@timing
def slow_sum(n):
    return sum(range(n))

print(slow_sum(1_000_000))
# [timing] slow_sum 耗时 18.32 ms
# 499999500000
```

#### 案例 2：日志装饰器（带参数）

```python
import logging
from functools import wraps

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

def log(level=logging.INFO, logger=None):
    def decorator(func):
        log_fn = (logger or logging).log

        @wraps(func)
        def wrapper(*args, **kwargs):
            log_fn(level, f"调用 {func.__name__} args={args} kwargs={kwargs}")
            try:
                result = func(*args, **kwargs)
                log_fn(level, f"{func.__name__} 返回 {result!r}")
                return result
            except Exception as e:
                logging.exception(f"{func.__name__} 抛出 {e!r}")
                raise
        return wrapper
    return decorator

@log(level=logging.INFO)
def divide(a, b):
    return a / b

print(divide(10, 2))
# 调用 divide args=(10, 2) kwargs={}
# divide 返回 5.0
# 5.0
```

#### 案例 3：重试装饰器（带指数退避）

```python
import time
import random
from functools import wraps

def retry(max_retries=3, delay=0.1, backoff=2, exceptions=(Exception,)):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            current_delay = delay
            last_exc = None
            for attempt in range(1, max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exc = e
                    print(f"[retry] {func.__name__} 第 {attempt} 次失败: {e!r}")
                    if attempt < max_retries:
                        time.sleep(current_delay)
                        current_delay *= backoff
            raise last_exc
        return wrapper
    return decorator

@retry(max_retries=4, delay=0.05, exceptions=(ValueError,))
def flaky():
    if random.random() < 0.7:
        raise ValueError("随机失败")
    return "ok"

print(flaky())
# [retry] flaky 第 1 次失败: ValueError('随机失败')
# [retry] flaky 第 2 次失败: ValueError('随机失败')
# ok
```

#### 案例 4：路由注册装饰器（简易 web 路由表）

```python
ROUTES = {}

def route(path):
    def decorator(func):
        ROUTES[path] = func
        @wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorator

@route("/")
def index():
    return "welcome"

@route("/users")
def users():
    return ["alice", "bob"]

@route("/users/<id>")
def user_detail(id):
    return {"id": id, "name": "alice"}

def dispatch(path):
    # 简化：直接精确匹配
    if path in ROUTES:
        return ROUTES[path]()
    # 演示参数路由
    for pattern, func in ROUTES.items():
        if "<" in pattern:
            prefix, suffix = pattern.split("<")
            suffix = suffix.split(">", 1)[1]
            if path.startswith(prefix) and path.endswith(suffix):
                arg = path[len(prefix):len(path)-len(suffix) or None]
                return func(arg)
    return "404"

print(dispatch("/"))            # welcome
print(dispatch("/users"))       # ['alice', 'bob']
print(dispatch("/users/42"))    # {'id': '42', 'name': 'alice'}
```

#### 案例 5：缓存装饰器（手写版，支持 TTL）

```python
import time
from functools import wraps

def cache_with_ttl(ttl=60):
    def decorator(func):
        store = {}  # key -> (result, expire_at)

        @wraps(func)
        def wrapper(*args, **kwargs):
            key = (args, tuple(sorted(kwargs.items())))
            now = time.time()
            if key in store:
                result, expire_at = store[key]
                if now < expire_at:
                    return result
            result = func(*args, **kwargs)
            store[key] = (result, now + ttl)
            return result

        wrapper.cache_clear = store.clear
        return wrapper
    return decorator

@cache_with_ttl(ttl=1)
def now_str():
    return time.strftime("%H:%M:%S")

print(now_str())   # 14:00:01
print(now_str())   # 14:00:01 —— 1 秒内复用缓存
time.sleep(1.1)
print(now_str())   # 14:00:02 —— 过期后重新计算
```

#### 案例 6：权限校验装饰器

```python
from functools import wraps

class User:
    def __init__(self, name, roles):
        self.name = name
        self.roles = set(roles)

# 用全局变量模拟"当前请求用户"，实际工程里常从上下文变量取
_current_user = User("alice", {"admin", "editor"})

def require_roles(*roles):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            if not (_current_user.roles & set(roles)):
                raise PermissionError(
                    f"{_current_user.name} 缺少角色 {set(roles)}"
                )
            return func(*args, **kwargs)
        return wrapper
    return decorator

@require_roles("admin")
def delete_user(uid):
    print(f"删除用户 {uid}")

delete_user(1)   # 删除用户 1
# 假设当前用户只有 editor 角色，会抛 PermissionError
```

---

## 三、迭代器协议

### 3.1 可迭代对象与迭代器

Python 的 `for` 循环、解包、生成器表达式、`sum/max/min` 等都依赖**迭代器协议**。先厘清两个概念：

- **可迭代对象 Iterable**：实现了 `__iter__()` 方法，返回一个迭代器。list、tuple、dict、set、str 都是可迭代对象。
- **迭代器 Iterator**：实现了 `__iter__()` 和 `__next__()`。`__next__()` 每次返回下一个值，没有更多值时抛 `StopIteration`。

```python
from collections.abc import Iterable, Iterator

lst = [1, 2, 3]
print(isinstance(lst, Iterable))    # True
print(isinstance(lst, Iterator))    # False —— list 是可迭代，但不是迭代器

it = iter(lst)
print(isinstance(it, Iterator))     # True
print(next(it), next(it), next(it)) # 1 2 3
# next(it)   # 抛 StopIteration
```

::: tip
迭代器是"一次性"的——遍历完就空了。可迭代对象（如 list）每次调用 `iter()` 都会生成一个新的迭代器，所以可以反复遍历。
:::

### 3.2 手写一个 Range 迭代器

```python
class MyRange:
    def __init__(self, start, stop, step=1):
        self.start, self.stop, self.step = start, stop, step

    def __iter__(self):
        # __iter__ 返回真正的迭代器对象
        return _MyRangeIterator(self.start, self.stop, self.step)

class _MyRangeIterator:
    def __init__(self, start, stop, step):
        self.current = start
        self.stop = stop
        self.step = step

    def __iter__(self):
        return self   # 迭代器的 __iter__ 返回自身

    def __next__(self):
        if self.current >= self.stop:
            raise StopIteration
        value = self.current
        self.current += self.step
        return value

for x in MyRange(1, 6, 2):
    print(x, end=" ")   # 1 3 5
print()

# 一次性
r = MyRange(1, 4)
print(list(r))   # [1, 2, 3]
print(list(r))   # [1, 2, 3] —— 每次调用 iter() 生成新迭代器
```

### 3.3 无限计数迭代器

```python
class Count:
    def __init__(self, start=0):
        self.current = start
    def __iter__(self):
        return self
    def __next__(self):
        value = self.current
        self.current += 1
        return value

c = Count(10)
print(next(c), next(c), next(c))   # 10 11 12

# 配合 itertools 或 islice 取前 N 个
from itertools import islice
print(list(islice(Count(), 5)))    # [0, 1, 2, 3, 4]
```

### 3.4 `for` 循环底层原理

```python
for x in obj:
    do(x)
```

等价于：

```python
_iter = iter(obj)        # 调用 obj.__iter__()
while True:
    try:
        x = next(_iter)  # 调用 _iter.__next__()
    except StopIteration:
        break
    do(x)
```

理解了这一点，就能解释为什么自定义类实现了 `__iter__` 就可以用 `for`，也可以解释为什么 `list(it)` 能消费一个迭代器。

---

## 四、生成器（重点）

生成器是"用函数语法写的迭代器"。普通函数用 `return` 返回一个值就结束，生成器函数用 `yield` 产生一个值后**暂停**，下次再继续从暂停处执行。

### 4.1 生成器函数 vs 生成器表达式

```python
# 生成器函数
def gen_squares(n):
    for i in range(n):
        yield i * i

g = gen_squares(4)
print(g)                # <generator object gen_squares at 0x...>
print(next(g), next(g)) # 0 1
print(list(g))          # [4, 9] —— 接着上次的位置继续

# 生成器表达式（注意是小括号）
ge = (i * i for i in range(4))
print(list(ge))         # [0, 1, 4, 9]
print(sum(i*i for i in range(4)))   # 14 —— 直接传入求和函数
```

::: warning
生成器表达式用小括号 `(...)`，列表推导式用中括号 `[...]`。前者惰性、后者立即求值。
:::

### 4.2 惰性求值与内存优势

生成器是**惰性求值**：不到要用时不计算。处理大序列时内存占用几乎恒定。

```python
import sys

# 用 list 一次性生成 1000 万个数
big_list = [i for i in range(10_000_000)]
print(sys.getsizeof(big_list))    # 约 8000 万字节 ≈ 80 MB

# 用生成器
big_gen = (i for i in range(10_000_000))
print(sys.getsizeof(big_gen))     # 约 200 字节，与规模无关
```

对比处理一个大文件的两种方式：

```python
# 方式一：一次性读入，大文件会撑爆内存
# lines = [line.strip() for line in open('huge.log')]
# total = sum(len(line) for line in lines)

# 方式二：生成器逐行处理，内存恒定
# total = sum(len(line.strip()) for line in open('huge.log'))
```

### 4.3 `yield from` 委托给子生成器（3.3+）

`yield from` 让一个生成器把产出值的工作**委托**给另一个可迭代对象/子生成器，且会正确传递 `send/throw/close`。

```python
def sub_gen():
    yield 1
    yield 2
    yield 3

def main_gen():
    yield 0
    yield from sub_gen()     # 相当于 for x in sub_gen(): yield x，但语义更强
    yield 4

print(list(main_gen()))   # [0, 1, 2, 3, 4]
```

更实际的用途——拍平嵌套：

```python
def flatten(items):
    for item in items:
        if isinstance(item, (list, tuple)):
            yield from flatten(item)    # 递归委托
        else:
            yield item

print(list(flatten([1, [2, [3, 4], 5], 6, (7, 8)])))
# [1, 2, 3, 4, 5, 6, 7, 8]
```

### 4.4 生成器高级方法：`send` / `throw` / `close`

生成器不只是产出值，还可以接收值——这是 Python 早期协程的雏形。

```python
def echo():
    print("生成器启动")
    while True:
        received = yield          # yield 表达式接收 send 的值
        print(f"收到: {received}")

e = echo()
# 必须先 "启动" 生成器，让它执行到第一个 yield
print(next(e))                    # 生成器启动 / None

e.send("hello")                   # 收到: hello
e.send("world")                   # 收到: world
e.close()                         # 关闭生成器
# 再调 next(e) 会抛 StopIteration
```

- `send(value)`：把 `yield` 表达式的返回值设为 `value`，并推进到下一个 `yield`。
- `throw(exc)`：在 `yield` 处抛出异常，可被生成器内部 try/except 捕获。
- `close()`：在 `yield` 处抛出 `GeneratorExit`，正常结束生成器。

`send` 是双向通信的关键，理解它就理解了 `asyncio` 早期基于生成器的协程原理。

### 4.5 生成器实战

#### 实战 1：无限斐波那契生成器

```python
def fib():
    a, b = 0, 1
    while True:
        yield a
        a, b = b, a + b

from itertools import islice
print(list(islice(fib(), 10)))
# [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

无限序列用 list 根本存不下，但生成器可以"想要多少算多少"。

#### 实战 2：文件逐行处理管道（grep 风格）

```python
import os

def follow(filename):
    """类似 tail -f，持续读取文件新增内容"""
    with open(filename, "r", encoding="utf-8") as f:
        f.seek(0, os.SEEK_END)
        while True:
            line = f.readline()
            if not line:
                time.sleep(0.1)
                continue
            yield line

def grep(pattern, lines):
    for line in lines:
        if pattern in line:
            yield line.rstrip()

# 假设有日志文件 app.log：
# log_lines = follow("app.log")
# for line in grep("ERROR", log_lines):
#     print(line)
```

把多个生成器像水管一样串起来，每一段都惰性处理，是 Unix 管道思想在 Python 里的体现。

#### 实战 3：用生成器实现 flatten

见 4.3 节的 `flatten` 例子。

---

## 五、上下文管理器

### 5.1 `with` 语句与 `__enter__` / `__exit__`

`with` 语句用于"获取资源 → 使用 → 释放资源"的固定模式，无论中间是否抛异常，资源都会被正确释放。

```python
class File:
    def __init__(self, path, mode):
        self.path = path
        self.mode = mode
        self.f = None

    def __enter__(self):
        print(f"打开 {self.path}")
        self.f = open(self.path, self.mode, encoding="utf-8")
        return self.f       # 作为 with ... as x 的 x

    def __exit__(self, exc_type, exc_val, exc_tb):
        print(f"关闭 {self.path}")
        if self.f:
            self.f.close()
        return False         # 返回 False/None：不抑制异常；返回 True：异常被吞掉

with File("demo.txt", "w") as f:
    f.write("hello")
# 打开 demo.txt
# 关闭 demo.txt
```

`__exit__` 的三个参数是异常信息，没异常时都是 `None`。返回 `True` 会"吞掉"异常——慎用，容易掩盖 bug。

### 5.2 `contextlib.contextmanager`：用生成器写上下文管理器

写一个完整的类有点重。`contextlib.contextmanager` 让你用一个生成器函数搞定：

```python
from contextlib import contextmanager

@contextmanager
def open_file(path, mode):
    f = open(path, mode, encoding="utf-8")
    try:
        yield f          # yield 之前的代码对应 __enter__，yield 的值作为 as 的目标
    finally:
        f.close()        # yield 之后的代码对应 __exit__

with open_file("demo.txt", "w") as f:
    f.write("hi")
```

::: tip
`yield` 之前的部分是"进入"，之后是"退出"。如果 with 块内抛了异常，异常会在 `yield` 处被重新抛出，所以用 `try/finally` 确保资源释放；如果想在上下文里处理异常，用 `try/except` 包住 `yield`。
:::

### 5.3 `contextlib.suppress` / `ExitStack`

**suppress**：忽略指定异常，等价于 `try/except/pass` 的语义化写法。

```python
from contextlib import suppress

with suppress(FileNotFoundError):
    os.remove("nonexistent.txt")
# 不会抛异常，直接跳过
```

**ExitStack**：动态管理多个资源，数量不定时尤其有用。

```python
from contextlib import ExitStack

files = []
with ExitStack() as stack:
    for name in ["a.txt", "b.txt", "c.txt"]:
        f = stack.enter_context(open(name, "w", encoding="utf-8"))
        files.append(f)
    # 离开 with 块时，所有文件按 enter 的逆序被关闭
```

`ExitStack` 还可以做"事务式"回滚：每个步骤用 `callback` 注册清理函数，全部成功后用 `pop_all()` 取消清理。

### 5.4 上下文管理器实战

#### 实战 1：计时上下文

```python
import time
from contextlib import contextmanager

@contextmanager
def timer(label="block"):
    start = time.perf_counter()
    try:
        yield
    finally:
        print(f"[{label}] 耗时 {(time.perf_counter()-start)*1000:.2f} ms")

with timer("数据处理"):
    s = sum(range(1_000_000))
print(s)
# [数据处理] 耗时 15.45 ms
# 499999500000
```

#### 实战 2：数据库事务上下文（伪代码）

```python
from contextlib import contextmanager

class Connection:
    def commit(self): print("commit")
    def rollback(self): print("rollback")
    def close(self): print("close")

@contextmanager
def transaction(conn):
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

conn = Connection()
with transaction(conn) as c:
    print("执行 SQL...")
    # 如果这里抛异常，会触发 rollback
# 执行 SQL...
# commit
# close
```

#### 实战 3：临时切换工作目录

```python
import os
from contextlib import contextmanager

@contextmanager
def cd(path):
    old = os.getcwd()
    os.chdir(path)
    try:
        yield path
    finally:
        os.chdir(old)

# with cd("/tmp"):
#     print(os.getcwd())   # /tmp
# print(os.getcwd())       # 自动切回原目录
```

---

## 六、元类 metaclass

元类是"创建类的类"。普通类用来创建实例，元类用来创建类。这一节概念较抽象，但理解后能看懂 Django ORM、SQLAlchemy、dataclass 的核心原理。

### 6.1 `type` 既是类也是元类

在 Python 中，**一切皆对象**，类也是对象。类这个"对象"是 `type` 的实例：

```python
class Dog:
    def bark(self):
        print("woof")

print(type(Dog))     # <class 'type'>
print(type(Dog()))   # <class '__main__.Dog'>
```

`type` 不仅是查看类型的内置函数，还可以**动态创建类**：

```python
def bark(self):
    print("woof")

# type(name, bases, namespace) 三参数形式创建类
Dog = type("Dog", (object,), {"bark": bark, "kind": "canine"})

d = Dog()
d.bark()            # woof
print(d.kind)       # canine
print(type(Dog))    # <class 'type'>
```

`type` 就是 Python 默认的元类。所有 `class Xxx:` 背后都是 `type` 在创建类对象。

### 6.2 自定义元类

通过 `class Foo(metaclass=Meta)` 指定元类。元类的 `__new__` / `__init__` 会在类**定义时**被调用，可以拦截类的创建过程。

```python
class Meta(type):
    def __new__(mcs, name, bases, namespace):
        print(f"Meta.__new__ 创建类 {name}")
        cls = super().__new__(mcs, name, bases, namespace)
        # 可以在这里给类加属性、修改 namespace、收集信息等
        cls._created_by = "Meta"
        return cls

class Foo(metaclass=Meta):
    pass

# Meta.__new__ 创建类 Foo
print(Foo._created_by)   # Meta
```

注意：元类的 `__new__` 第一个参数 `mcs` 是元类自身（对应普通类的 `cls`）。

### 6.3 `__init_subclass__`（3.6+）——更简单的替代

大多数"插件注册 / 字段校验"场景不需要写完整元类，用 `__init_subclass__` 就够了。它在**子类定义时**被调用，钩子更轻量：

```python
class Plugin:
    registry = []

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        Plugin.registry.append(cls.__name__)

class A(Plugin): pass
class B(Plugin): pass

print(Plugin.registry)   # ['A', 'B']
```

或者做字段校验：

```python
class NamedModel:
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if not hasattr(cls, "name") or not isinstance(cls.name, str):
            raise TypeError(f"{cls.__name__} 必须定义字符串类属性 name")

class User(NamedModel):
    name = "user"

# class Bad(NamedModel): pass   # 抛 TypeError: Bad 必须定义字符串类属性 name
```

### 6.4 元类实战：ORM 字段收集

模仿 Django/SQLAlchemy 的思路——用户在类体里声明带类型注解的字段，元类自动收集到 `__fields__` 字典里。

```python
class Field:
    def __init__(self, column_type, primary_key=False):
        self.column_type = column_type
        self.primary_key = primary_key

    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, instance, owner):
        return instance.__dict__.get(self.name) if instance else self

    def __set__(self, instance, value):
        instance.__dict__[self.name] = value

class ModelMeta(type):
    def __new__(mcs, name, bases, namespace):
        fields = {}
        # 收集当前类中的 Field 实例
        for key, value in namespace.items():
            if isinstance(value, Field):
                fields[key] = value
        cls = super().__new__(mcs, name, bases, namespace)
        cls.__fields__ = fields
        # 继承父类的字段
        for base in bases:
            if hasattr(base, "__fields__"):
                cls.__fields__ = {**base.__fields__, **cls.__fields__}
        return cls

class Model(metaclass=ModelMeta):
    pass

class User(Model):
    id   = Field("INT", primary_key=True)
    name = Field("VARCHAR(50)")

print(User.__fields__)
# {'id': <Field ...>, 'name': <Field ...>}
print(User.__fields__["id"].column_type, User.__fields__["id"].primary_key)
# INT True

u = User()
u.id = 1
u.name = "alice"
print(u.id, u.name)   # 1 alice
```

有了 `__fields__`，再写一个 `save()` 方法、根据字段生成 SQL，就是一个迷你 ORM 雏形。

### 6.5 何时用元类

::: warning
"元类是深魔法，99% 的场景你都不需要它。" —— Tim Peters
:::

优先级建议：
1. **能用 `__init_subclass__` 就别用元类**——更简单、不引入新概念。
2. **能用装饰器装饰类就别用元类**——比如 `@dataclass`。
3. **能用 `dataclasses.dataclass` / `pydantic.BaseModel` 就别自己造轮子**。
4. 真正需要元类的场景：框架级 API 设计（ORM、序列化库、依赖注入容器）、需要拦截**所有子类**创建的全局行为。

---

## 七、`functools.singledispatch` 单分派泛函数

面向对象的多态通过子类重写父类方法实现。但有时候我们想**根据参数类型**选择不同实现，又不想塞一堆 `if isinstance` ——`singledispatch` 提供了另一种多态：单分派泛函数。

```python
from functools import singledispatch
from html import escape

@singledispatch
def to_html(obj):
    return f"<span>{escape(str(obj))}</span>"

@to_html.register(int)
def _(obj):
    return f"<int>{obj}</int>"

@to_html.register(list)
def _(obj):
    items = "".join(to_html(x) for x in obj)
    return f"<ul>{items}</ul>"

@to_html.register(dict)
def _(obj):
    rows = "".join(
        f"<tr><td>{escape(k)}</td><td>{to_html(v)}</td></tr>"
        for k, v in obj.items()
    )
    return f"<table>{rows}</table>"

print(to_html(42))
# <int>42</int>

print(to_html("hi"))
# <span>hi</span>

print(to_html([1, 2, "x"]))
# <ul><int>1</int><int>2</int><span>x</span></ul>

print(to_html({"a": 1, "b": "x"}))
# <table><tr><td>a</td><td><int>1</int></td></tr><tr><td>b</td><td><span>x</span></td></tr></table>
```

特点：
- 根据**第一个参数**的实际类型分发到对应注册的函数。
- 没匹配到具体类型时走默认实现。
- 3.7+ 还可以用类型注解语法：`@to_html.register` 然后函数签名写 `def _(obj: int):`。
- 3.11+ 有 `functools.singledispatchmethod` 用于类方法。

适用场景：处理多种数据类型的工具函数（序列化、渲染、校验），又不希望污染各数据类型自己的类。

---

## 八、`typing.Protocol` 结构化子类型

Python 历来推崇"鸭子类型"：只关心对象有没有需要的方法，不关心它是不是某个类的实例。`typing.Protocol`（3.8+）把鸭子类型**形式化**：声明一个 Protocol，静态类型检查器（mypy/pyright）会据此检查。

```python
from typing import Protocol

class SupportsClose(Protocol):
    def close(self) -> None: ...

def safe_close(resource: SupportsClose) -> None:
    resource.close()

class FileLike:
    def close(self) -> None:
        print("closed")

class Door:
    def close(self) -> None:
        print("door closed")

safe_close(FileLike())   # closed
safe_close(Door())       # door closed
# safe_close(42)         # 类型检查器会报错：int 没有 close 方法
```

`Protocol` 与传统抽象基类（ABC）的区别：
- ABC 是**名义子类型**：必须显式继承 `class Foo(ABC)`，否则即使方法齐全也不算。
- Protocol 是**结构化子类型**：只要"长得像"（有对应方法/属性签名）就算，不需要继承。

这意味着你可以为第三方库的对象定义 Protocol，而不需要修改第三方代码。PEP 544 的核心思想就是"鸭子类型有了静态检查"。

`@runtime_checkable` 装饰的 Protocol 还能用 `isinstance` 检查（但只检查方法存在性，不检查签名）：

```python
from typing import Protocol, runtime_checkable

@runtime_checkable
class SizedProtocol(Protocol):
    def __len__(self) -> int: ...

print(isinstance([1, 2], SizedProtocol))   # True
print(isinstance(42, SizedProtocol))       # False
```

---

## 九、综合案例：简易任务流水线

下面这个案例把装饰器、生成器、上下文管理器三件套串起来，实现一个"任务流水线"：每个任务自动计时、失败自动重试（指数退避）、整个流水线用上下文管理器统一管理资源、用生成器把多阶段处理串成惰性管道。

::: details 综合案例：任务流水线
```python
import time
import random
from contextlib import contextmanager
from functools import wraps


# === 1. 装饰器：计时 + 重试 ===

def timing(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = (time.perf_counter() - start) * 1000
        print(f"  [timing] {func.__name__} 耗时 {elapsed:.2f} ms")
        return result
    return wrapper


def retry(max_retries=3, delay=0.05, backoff=2, exceptions=(Exception,)):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            current_delay = delay
            last_exc = None
            for attempt in range(1, max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exc = e
                    print(f"  [retry] {func.__name__} 第 {attempt}/{max_retries} 次失败: {e!r}")
                    if attempt < max_retries:
                        time.sleep(current_delay)
                        current_delay *= backoff
            raise last_exc
        return wrapper
    return decorator


# === 2. 上下文管理器：流水线资源管理 ===

@contextmanager
def pipeline(name):
    print(f"\n=== 流水线 [{name}] 启动 ===")
    start = time.perf_counter()
    resources = []
    try:
        yield resources
        print(f"=== 流水线 [{name}] 成功结束 ===")
    except Exception as e:
        print(f"=== 流水线 [{name}] 异常: {e!r} ===")
        raise
    finally:
        # 按入栈逆序释放资源
        for r in reversed(resources):
            try:
                r.close()
            except Exception:
                pass
        elapsed = (time.perf_counter() - start) * 1000
        print(f"=== 总耗时 {elapsed:.2f} ms，已释放 {len(resources)} 个资源 ===\n")


class FakeResource:
    """模拟一个需要释放的资源（数据库连接、文件句柄等）"""
    def __init__(self, tag):
        self.tag = tag
        print(f"  [resource] 打开 {self.tag}")

    def close(self):
        print(f"  [resource] 关闭 {self.tag}")


# === 3. 生成器：多阶段惰性管道 ===

def generate_numbers(n):
    """阶段 1：产生原始数据"""
    for i in range(n):
        yield i


def filter_even(source):
    """阶段 2：过滤偶数"""
    for x in source:
        if x % 2 == 0:
            yield x


def transform(source):
    """阶段 3：变换"""
    for x in source:
        yield x * x


# === 4. 业务任务（被装饰）===

@timing
@retry(max_retries=4, delay=0.02, exceptions=(ValueError,))
def process_batch(batch):
    # 模拟偶发失败
    if random.random() < 0.3:
        raise ValueError("随机抖动失败")
    return sum(batch)


# === 5. 主流程：把三件套串起来 ===

def run_pipeline():
    with pipeline("数据流水线 v1") as resources:
        # 注册两个资源，with 结束时自动逆序关闭
        resources.append(FakeResource("db-conn"))
        resources.append(FakeResource("cache"))

        # 用生成器构建惰性管道
        source = generate_numbers(20)
        stage1 = filter_even(source)     # 过滤偶数
        stage2 = transform(stage1)       # 平方变换

        # 分批处理
        batch = []
        results = []
        for value in stage2:
            batch.append(value)
            if len(batch) == 4:
                results.append(process_batch(batch))   # 自动计时 + 重试
                batch = []
        if batch:
            results.append(process_batch(batch))

        print(f"  最终结果: {results}")


if __name__ == "__main__":
    random.seed(42)
    run_pipeline()
```

预期输出大致如下（重试和计时数值会因随机种子和机器性能而异）：

```
=== 流水线 [数据流水线 v1] 启动 ===
  [resource] 打开 db-conn
  [resource] 打开 cache
  [timing] process_batch 耗时 0.05 ms
  [retry] process_batch 第 1/4 次失败: ValueError('随机抖动失败')
  [timing] process_batch 耗时 0.03 ms
  [timing] process_batch 耗时 0.02 ms
  [retry] process_batch 第 1/4 次失败: ValueError('随机抖动失败')
  [retry] process_batch 第 2/4 次失败: ValueError('随机抖动失败')
  [timing] process_batch 耗时 0.02 ms
  最终结果: [20, 420, 164, 1300]
=== 流水线 [数据流水线 v1] 成功结束 ===
  [resource] 关闭 cache
  [resource] 关闭 db-conn
=== 总耗时 230.45 ms，已释放 2 个资源 ===
```

这个案例展示了三大特性的协同：
- **装饰器**让 `process_batch` 无侵入地获得"计时 + 重试"能力，业务函数本身一行不用改。
- **生成器**把"产生 → 过滤 → 变换"三个阶段串成惰性管道，理论上可以处理无穷流，内存恒定。
- **上下文管理器**统一管理资源生命周期，无论流水线成功还是抛异常，资源都会按入栈逆序释放。

把它们组合起来，就是大多数 Python 框架（web、爬虫、数据管道）的核心写法。
:::

---

## 小结

| 特性 | 本质 | 典型用途 |
|------|------|----------|
| 闭包 | 函数记住定义时的作用域变量 | 计数器、配置工厂、装饰器底层 |
| 装饰器 | `f = deco(f)` 的语法糖 | 日志、计时、缓存、重试、路由、权限 |
| 迭代器 | `__iter__` + `__next__` 协议 | 自定义可迭代类型、`for` 循环底层 |
| 生成器 | `yield` 暂停的函数 | 惰性序列、流式处理、协程雏形 |
| 上下文管理器 | `__enter__`/`__exit__` 或 `@contextmanager` | 资源管理、事务、临时状态切换 |
| 元类 | "创建类的类" | 框架级 API、ORM 字段收集 |
| `singledispatch` | 按第一参数类型分发 | 多类型工具函数、跨类型多态 |
| `Protocol` | 结构化鸭子类型 | 静态类型检查、解耦第三方类型 |

掌握这些特性后，再去读 FastAPI、Django、SQLAlchemy、asyncio 的源码，会发现它们正是把这些"灵魂特性"用到了极致。建议每个知识点都自己手敲一遍示例，再尝试改造一两个生产场景下的真实代码——只有动手写出来，才能真正内化。

下一篇我们将进入面向对象进阶，讲 `__init_subclass__`、描述符协议、抽象基类 ABC、混入 Mixin 等更深入的话题。
