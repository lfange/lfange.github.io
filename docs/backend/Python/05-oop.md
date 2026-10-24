---
title: 面向对象编程
category:
  - 后端
tag:
  - Python
---

# 面向对象编程

Python 是一门"多范式"语言，它既支持面向过程，也支持函数式编程，但**面向对象**（Object-Oriented Programming, OOP）始终是它组织代码最自然、最常用的方式。本篇是《Python 从入门到精通》第 05 篇，基于 Python 3.12+，覆盖从类的基础到描述符、数据类、枚举与设计模式的全部核心内容。学完之后，你将能读懂绝大多数主流框架（Django、Flask、SQLAlchemy、FastAPI……）的源码风格，并能写出优雅、可维护的面向对象代码。

---

## 一、类与对象基础

### 1.1 用 `class` 定义类

Python 中定义类的关键字是 `class`，后面跟类名（按惯例使用 PascalCase）和冒号，类体缩进。最简单的类甚至可以只有一句 `pass`：

```python
class Empty:
    pass

e = Empty()
print(type(e))   # <class '__main__.Empty'>
```

类也是一种对象（`type` 的实例），它"工厂"一样能不断生产出实例。

### 1.2 `__init__` 构造与 `self`

`__init__` 是**初始化方法**，在对象被创建之后立刻调用，用来设置初始属性。它的第一个参数永远是当前实例，按惯例命名为 `self`（你也可以叫别的名字，但极不推荐）。

```python
class Point:
    def __init__(self, x: float, y: float):
        self.x = x          # 实例属性
        self.y = y

    def distance_to(self, other: "Point") -> float:
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5

p1 = Point(0, 0)
p2 = Point(3, 4)
print(p1.distance_to(p2))   # 5.0
```

::: tip
真正"创建"实例的方法是 `__new__`，`__init__` 只负责"初始化"。绝大多数场景下你只需要重写 `__init__`，后面讲到单例时再演示 `__new__`。
:::

### 1.3 实例属性 vs 类属性

类体内的赋值变量是**类属性**，被所有实例共享；在方法内通过 `self.xxx = ...` 赋值的是**实例属性**，每个实例独立持有。

```python
class Point:
    dimension = 2            # 类属性：所有实例共享

    def __init__(self, x, y):
        self.x = x           # 实例属性
        self.y = y

p1 = Point(1, 2)
p2 = Point(3, 4)

print(p1.dimension, p2.dimension)   # 2 2
print(Point.dimension)              # 2

# 通过实例修改"类属性"会怎样？
p1.dimension = 3
print(p1.dimension)    # 3   —— 此时在 p1 上新建了同名实例属性，遮蔽了类属性
print(p2.dimension)    # 2   —— p2 不受影响
print(Point.dimension) # 2   —— 类属性本身也没变
```

::: warning 陷阱：可变类属性
若类属性是列表、字典等可变对象，所有实例会共享同一个对象，常常引发莫名其妙 的 bug：

```python
class Bad:
    items = []          # 危险：所有实例共享同一个 list

Bad().items.append(1)
Bad().items.append(2)
print(Bad().items)      # [1, 2]
```

正确做法是在 `__init__` 中创建可变属性：`self.items = []`。
:::

### 1.4 实例方法

定义在类内部的普通函数就是**实例方法**，第一个参数接收实例本身。调用时无需手动传 `self`：`p1.distance_to(p2)` 等价于 `Point.distance_to(p1, p2)`。

---

## 二、封装

### 2.1 约定：单下划线 `_protected`

Python 没有真正的 `private`/`protected` 关键字，全靠**约定**：

- 单下划线前缀 `_name`：表示"内部使用"，外部仍可访问，但 IDE/规范层面提醒你不要。
- 双下划线前缀 `__name`：触发**名称改写**（name mangling），更强一些。

```python
class Account:
    def __init__(self, owner, balance):
        self.owner = owner         # 公开
        self._balance = balance    # 受保护（仅约定）

    def deposit(self, amount):
        self._balance += amount

a = Account("Tom", 100)
print(a._balance)     # 100 —— 技术上可以访问，但不推荐
```

### 2.2 双下划线与名称改写

```python
class Account:
    def __init__(self, owner, balance):
        self.owner = owner
        self.__balance = balance      # 会被改写为 _Account__balance

    def get_balance(self):
        return self.__balance

a = Account("Tom", 100)
# print(a.__balance)      # AttributeError
print(a._Account__balance)  # 100 —— 仍然能访问，只是名字变了
print(a.get_balance())      # 100
```

::: details 名称改写的本质
`__x` 在类内部会被 Python 解释器改写为 `_ClassName__x`，从而避免子类同名属性冲突。它**不是访问控制**，只是"防误用"。任何"私 有"在 Python 中都不是强制的，正如 Python 之禅所说：*We are all consenting adults here.*（大家都是成年人）。
:::

### 2.3 `@property` 实现 getter/setter

如果想在读写属性时加入校验或副作用，用 `@property` 把方法包装成"属性"：

```python
class Temperature:
    def __init__(self, celsius: float):
        self.celsius = celsius        # 进入 setter 校验

    @property
    def celsius(self) -> float:
        return self._celsius

    @celsius.setter
    def celsius(self, value: float):
        if value < -273.15:
            raise ValueError("温度不能低于绝对零度 -273.15°C")
        self._celsius = value

    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9 / 5 + 32

t = Temperature(25)
print(t.celsius, t.fahrenheit)    # 25 77.0
t.celsius = 0
print(t.fahrenheit)               # 32.0
# t.celsius = -300                # ValueError: 温度不能低于绝对零度 -273.15°C
```

::: tip
`@property` 不但能做校验，还能让"计算属性"像普通属性一样访问（如 `fahrenheit`），调用者无需关心它是不是存储字段。
:::

---

## 三、继承

### 3.1 单继承与 `super()`

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} 发出声音"

class Dog(Animal):
    def __init__(self, name, breed):
        super().__init__(name)      # 调用父类构造
        self.breed = breed

    def speak(self):                # 覆写父类方法
        return f"{self.name}（{self.breed}）汪汪叫"

d = Dog("旺财", "金毛")
print(d.speak())    # 旺财（金毛）汪汪叫
print(isinstance(d, Animal))   # True
print(issubclass(Dog, Animal)) # True
```

### 3.2 多继承与菱形继承

Python 支持多继承，但当多个父类有共同祖先（菱形）时，方法解析顺序就成了关键：

```python
class A:
    def greet(self): return "A"

class B(A):
    def greet(self): return "B"

class C(A):
    def greet(self): return "C"

class D(B, C):
    pass

d = D()
print(d.greet())     # B —— 按 MRO 顺序找
```

### 3.3 MRO（Method Resolution Order）与 C3 线性化

Python 使用 **C3 线性化算法** 计算方法查找顺序，可以通过 `__mro__` 或 `mro()` 查看：

```python
print(D.__mro__)
# (<class 'D'>, <class 'B'>, <class 'C'>, <class 'A'>, <class 'object'>)
```

::: details C3 线性化简要规则
C3 算法对每个类 `K` 的 MRO 是：`K + merge(L[B1], L[B2], ..., [B1, B2, ...])`，其中 `merge` 不断取第一个"不在其他列表尾部"的类。它保证：

1. 子类在父类之前。
2. 多个父类的相对顺序保持不变。
3. 同一类只出现一次。

如果某个继承结构无法线性化，Python 会抛出 `TypeError: Cannot create a consistent method resolution order`。
:::

::: warning
`super()` 在多继承下并不"只调用父类"，而是按 MRO 调用**下一个类**的同名方法。所以在多继承协作场景下，所有类都应一致使用 `super()`，否则容易出现某个父类被跳过的 bug。
:::

---

## 四、多态与鸭子类型

### 4.1 鸭子类型

Python 不关心对象的类型，只关心它的行为。只要一个对象"走起来像鸭子，叫起来像鸭子"，就把它当鸭子用：

```python
class Dog:
    def speak(self): return "汪"

class Cat:
    def speak(self): return "喵"

class Robot:     # 没有 speak 方法
    pass

def make_speak(x):
    return x.speak()

print(make_speak(Dog()))    # 汪
print(make_speak(Cat()))    # 喵
# make_speak(Robot())       # AttributeError: 'Robot' object has no attribute 'speak'
```

### 4.2 抽象基类 `abc.ABC`

如果希望**强制子类实现某些方法**，用 `abc.ABC` + `@abstractmethod`：

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self) -> float:
        ...

    @abstractmethod
    def perimeter(self) -> float:
        ...

class Circle(Shape):
    def __init__(self, r): self.r = r
    def area(self): return 3.14159 * self.r ** 2
    def perimeter(self): return 2 * 3.14159 * self.r

# s = Shape()              # TypeError: 不能实例化抽象类
c = Circle(2)
print(c.area())            # 12.56636
```

### 4.3 `typing.Protocol` 结构化子类型

从 3.8 起（3.12 转正为稳定特性），`Protocol` 允许"鸭子类型也能静态类型检查"：

```python
from typing import Protocol

class Speaker(Protocol):
    def speak(self) -> str: ...

def make_speak(x: Speaker) -> str:
    return x.speak()

class Duck:
    def speak(self) -> str: return "嘎"

make_speak(Duck())    # 类型检查器通过：Duck 结构上满足 Speaker
```

::: tip ABC vs Protocol
- ABC 是** nominal subtyping**（按继承关系），子类必须显式继承。
- Protocol 是 **structural subtyping**（按结构匹配），无需继承，类型检查器只看方法签名。
- 库的公共 API 用 ABC 强约束；内部协作用 Protocol 更灵活。
:::

---

## 五、三种方法：实例方法 / 类方法 / 静态方法

```python
class Date:
    def __init__(self, year, month, day):
        self.year, self.month, self.day = year, month, day

    # 实例方法：第一个参数是 self
    def display(self):
        return f"{self.year}-{self.month:02d}-{self.day:02d}"

    # 类方法：第一个参数是类本身
    @classmethod
    def from_string(cls, s: str) -> "Date":
        y, m, d = map(int, s.split("-"))
        return cls(y, m, d)         # 用 cls 而非 Date，便于子类继承

    # 静态方法：和普通函数一样，只是逻辑上属于这个类
    @staticmethod
    def is_leap_year(year: int) -> bool:
        return year % 4 == 0 and (year % 100 != 0 or year % 400 == 0)

d1 = Date(2024, 7, 20)
d2 = Date.from_string("2024-07-20")     # 替代构造器
print(d1.display(), d2.display())       # 2024-07-20 2024-07-20
print(Date.is_leap_year(2024))          # True
print(Date.is_leap_year(2100))          # False
```

::: tip `@classmethod` 的典型用途
- **替代构造器**（`from_xxx`），如 `datetime.fromtimestamp()`、`dict.fromkeys()`。
- 在继承体系中，`cls` 会自动指向子类，比硬编码类名更灵活。
:::

---

## 六、魔法方法（dunder methods）

魔法方法是以双下划线包裹的方法（`__xxx__`，读作 dunder xxx），它们是 Python 实现**运算符重载、容器协议、上下文管理**等的钩子。下面用 `Vector2D` 类贯穿大部分示例。

### 6.1 对象表示：`__str__` / `__repr__` / `__format__`

```python
class Vector2D:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __repr__(self):
        # 给开发者看，最好能 eval 还原对象
        return f"Vector2D({self.x!r}, {self.y!r})"

    def __str__(self):
        # 给终端用户看
        return f"({self.x}, {self.y})"

    def __format__(self, fmt_spec):
        if fmt_spec == "p":           # 极坐标
            import math
            r = math.hypot(self.x, self.y)
            theta = math.atan2(self.y, self.x)
            return f"r={r:.2f}, θ={theta:.2f}"
        return str(self)

v = Vector2D(3, 4)
print(repr(v))        # Vector2D(3, 4)
print(str(v))         # (3, 4)
print(f"{v}")         # (3, 4)
print(f"{v:p}")       # r=5.00, θ=0.93
```

::: tip
如果你只实现一个，请实现 `__repr__`：当没有 `__str__` 时，`str()` 和 `print()` 会回退到 `__repr__`。
:::

### 6.2 比较：`__eq__` / `__hash__` / `__lt__` + `total_ordering`

```python
from functools import total_ordering

@total_ordering
class Vector2D:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __eq__(self, other):
        if not isinstance(other, Vector2D):
            return NotImplemented
        return self.x == other.x and self.y == other.y

    def __hash__(self):
        return hash((self.x, self.y))

    def __lt__(self, other):
        if not isinstance(other, Vector2D):
            return NotImplemented
        return (self.x ** 2 + self.y ** 2) < (other.x ** 2 + other.y ** 2)

a, b, c = Vector2D(1, 1), Vector2D(1, 1), Vector2D(3, 4)
print(a == b)        # True
print(a < c)         # True
print(c >= a)        # True   —— total_ordering 自动补全
print({a, b, c})     # {Vector2D(1, 1), Vector2D(3, 4)}   —— 可哈希才能放进 set
```

::: warning 可哈希与字典键
一个对象能作为 `dict` 的键或放入 `set`，必须实现 `__hash__` 且与 `__eq__` 一致（相等的对象必须哈希相等）。默认 `__hash__` 基于 `id()`，但当你重写了 `__eq__` 后，`__hash__` 会被自动设为 `None`，对象变成不可哈希，除非你显式实现。
:::

### 6.3 容器协议：实现自定义序列

下面实现一个只读的二维向量序列：

```python
class Vector2D:
    def __init__(self, x, y):
        self._coords = [x, y]

    def __len__(self):
        return len(self._coords)

    def __getitem__(self, index):
        if isinstance(index, slice):
            return self._coords[index]
        if index not in (0, 1):
            raise IndexError("Vector2D 索引只能是 0 或 1")
        return self._coords[index]

    def __setitem__(self, index, value):
        self._coords[index] = value

    def __delitem__(self, index):
        raise TypeError("Vector2D 不支持删除元素")

    def __contains__(self, item):
        return item in self._coords

    def __iter__(self):
        return iter(self._coords)

    def __next__(self):
        # 一般不实现，迭代交给 __iter__ 即可
        raise StopIteration

v = Vector2D(3, 4)
print(len(v))         # 2
print(v[0], v[1])     # 3 4
print(3 in v)         # True
for x in v:
    print(x, end=" ") # 3 4
print()
```

### 6.4 运算符重载：`__add__` / `__radd__` / `__iadd__` / `__mul__`

```python
class Vector2D:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __add__(self, other):
        if isinstance(other, Vector2D):
            return Vector2D(self.x + other.x, self.y + other.y)
        if isinstance(other, (int, float)):
            return Vector2D(self.x + other, self.y + other)
        return NotImplemented

    def __radd__(self, other):       # other + self，other 不是 Vector2D 时调用
        return self + other

    def __iadd__(self, other):       # += 运算
        self.x += other.x
        self.y += other.y
        return self                  # 必须返回 self

    def __mul__(self, k):
        return Vector2D(self.x * k, self.y * k)

    def __rmul__(self, k):
        return self * k

v1 = Vector2D(1, 2)
v2 = Vector2D(3, 4)
print((v1 + v2).x, (v1 + v2).y)     # 4 6
print((v1 + 10).x, (v1 + 10).y)     # 11 12
print((10 + v1).x, (10 + v1).y)     # 11 12   —— 走 __radd__
v1 += v2
print(v1.x, v1.y)                   # 4 6
print((v2 * 3).x, (v2 * 3).y)       # 9 12
print((3 * v2).x, (3 * v2).y)       # 9 12
```

::: tip `NotImplemented` vs `NotImplementedError`
- `NotImplemented`（单值）：在 `__add__` 等方法里返回，告诉解释器"我不会处理这种类型，去试试对方的 `__radd__`"。
- `NotImplementedError`（异常）：表示"这个方法本应被实现但还没实现"，常用于抽象占位。
:::

### 6.5 可调用对象：`__call__`

```python
class Multiplier:
    def __init__(self, factor):
        self.factor = factor

    def __call__(self, x):
        return x * self.factor

double = Multiplier(2)
print(double(5))          # 10   —— 对象像函数一样被调用
print(callable(double))   # True
```

`__call__` 的典型用途：状态保留的函数、装饰器类、`functools.partial` 的底层实现、神经网络的层（PyTorch 的 `nn.Module`）等。

### 6.6 上下文管理器：`__enter__` / `__exit__`

```python
class Timer:
    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self                  # as 后拿到的就是它

    def __exit__(self, exc_type, exc_val, exc_tb):
        import time
        self.elapsed = time.perf_counter() - self.start
        print(f"耗时 {self.elapsed:.4f}s")
        return False                 # 不吞异常

with Timer() as t:
    s = sum(range(1_000_000))
# 耗时 0.0xxx s
```

`__exit__` 返回 `True` 会**吞掉** `with` 块里抛出的异常，一般不要这么做。也可以用 `contextlib.contextmanager` 装饰器以生成器写法实现，更简洁。

### 6.7 创建：`__new__` vs `__init__`

`__new__` 是**类方法**，负责**创建并返回**实例；`__init__` 负责**初始化**已创建的实例。`__new__` 在以下场景必须重写：

- 不可变类型（`int`、`str`、`tuple`）的子类化，因为它们的值在 `__init__` 时已无法改变。
- 单例模式（见下文设计模式章节）。
- 元类编程。

```python
class Singleton:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

a = Singleton()
b = Singleton()
print(a is b)    # True
```

### 6.8 `__slots__`：节省内存与限制属性

默认情况下，每个实例都有一个 `__dict__` 存放属性，灵活但有内存开销。定义 `__slots__` 后，实例不再有 `__dict__`，属性按固定槽位存储：

```python
class Point:
    __slots__ = ("x", "y")

    def __init__(self, x, y):
        self.x, self.y = x, y

p = Point(1, 2)
# p.z = 3      # AttributeError: 'Point' object has no attribute 'z'
# p.__dict__   # AttributeError: 'Point' object has no attribute '__dict__'
```

::: tip `__slots__` 何时值得用
- 对象数量极大（如百万级数据点），可显著节省内存（典型 40%~50%）。
- 想强制限制属性集合，防止拼写错误带来的"幽灵属性"。
- 但要注意：有 `__slots__` 的类默认不支持弱引用，需要时可加 `"__weakref__"` 到 slots 中；子类若没定义 `__slots__`，仍会有 `__dict__`。
:::

---

## 七、描述符（Descriptor）

描述符是一个实现了 `__get__` / `__set__` / `__delete__` 中至少一个的类。它作为**类属性**出现时，对实例属性的访问会被它接管。`property`、`classmethod`、`staticmethod`、`super()` 本质上都是描述符。

### 7.1 一个类型校验字段

```python
class TypedField:
    def __init__(self, type_):
        self.type_ = type_

    def __set_name__(self, owner, name):
        self.name = name            # 3.6+：自动获取属性名

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__.get(self.name)

    def __set__(self, instance, value):
        if not isinstance(value, self.type_):
            raise TypeError(f"{self.name} 必须是 {self.type_.__name__}")
        instance.__dict__[self.name] = value

class User:
    name = TypedField(str)
    age = TypedField(int)

u = User()
u.name = "Tom"
u.age = 18
# u.age = "18"   # TypeError: age 必须是 int
```

### 7.2 `property` 本质是描述符

`property` 其实是一个用 C 实现的**数据描述符**，等价的纯 Python 实现大致如下：

```python
class Property:
    def __init__(self, fget=None, fset=None, fdel=None):
        self.fget, self.fset, self.fdel = fget, fset, fdel

    def __get__(self, instance, owner):
        if instance is None: return self
        return self.fget(instance)

    def __set__(self, instance, value):
        if self.fset is None: raise AttributeError("不可设置")
        self.fset(instance, value)

    def setter(self, fn):
        self.fset = fn
        return self
```

### 7.3 数据描述符 vs 非数据描述符

- **数据描述符**（data descriptor）：同时定义 `__get__` 和 `__set__`（或 `__delete__`）。
- **非数据描述符**（non-data descriptor）：只定义 `__get__`。

两者在属性查找时的优先级不同：

```
数据描述符  >  实例 __dict__  >  非数据描述符  >  类 __dict__
```

::: details 优先级验证
```python
class DataDesc:
    def __get__(self, *a): return "data"
    def __set__(self, *a): pass

class NonDataDesc:
    def __get__(self, *a): return "nondata"

class A:
    d = DataDesc()
    n = NonDataDesc()

a = A()
a.__dict__["d"] = "instance-d"     # 数据描述符优先，看不到实例属性
a.__dict__["n"] = "instance-n"     # 非数据描述符被实例属性遮蔽
print(a.d)    # data
print(a.n)    # instance-n
```
:::

---

## 八、数据类 `dataclasses`

3.7 引入的 `dataclasses` 模块可以用极简语法定义"数据载体"类，自动生成 `__init__` / `__repr__` / `__eq__` 等。

### 8.1 基本用法

```python
from dataclasses import dataclass, field

@dataclass
class Point:
    x: float
    y: float
    label: str = "origin"

p = Point(3, 4, "P1")
print(p)               # Point(x=3, y=4, label='P1')
print(p == Point(3, 4, "P1"))   # True
```

### 8.2 `field(default_factory=...)`

可变默认值不能用 `[]`、`{}`，必须用 `default_factory`：

```python
@dataclass
class Student:
    name: str
    scores: list[int] = field(default_factory=list)

s = Student("Tom")
s.scores.append(90)
print(s)    # Student(name='Tom', scores=[90])
```

### 8.3 `frozen=True` 不可变

```python
@dataclass(frozen=True)
class Const:
    x: int
    y: int

c = Const(1, 2)
# c.x = 3        # FrozenInstanceError
```

::: tip 不可变 + 可哈希
`frozen=True` 的数据类会自动生成 `__hash__`，可以放进 `set` / 当 `dict` 键。普通 `@dataclass` 默认 `eq=True, frozen=False`，会令 `__hash__ = None`，对象不可哈希。
:::

### 8.4 `slots=True`（3.10+）

```python
@dataclass(slots=True)
class FastPoint:
    x: float
    y: float
# 自动生成 __slots__，实例没有 __dict__，更省内存
```

### 8.5 `order=True` 自动生成比较方法

```python
@dataclass(order=True)
class Priority:
    score: float
    name: str = field(compare=False)   # 不参与比较

tasks = [Priority(3, "A"), Priority(1, "B"), Priority(2, "C")]
print(sorted(tasks))
# [Priority(score=1, name='B'), Priority(score=2, name='C'), Priority(score=3, name='A')]
```

---

## 九、枚举 `Enum`

当变量只能取一组有限的值时，用枚举比裸字符串/整数更安全。

```python
from enum import Enum, auto, unique, IntEnum

class Color(Enum):
    RED = 1
    GREEN = 2
    BLUE = 3

print(Color.RED)         # Color.RED
print(Color.RED.value)   # 1
print(Color.RED.name)    # RED
print(Color["RED"])      # Color.RED   —— 按名字查
print(Color(1))          # Color.RED   —— 按值查

# auto() 自动赋值
class Status(Enum):
    PENDING = auto()
    RUNNING = auto()
    DONE = auto()

# @unique 禁止重复值
@unique
class Weekday(IntEnum):    # IntEnum 可与 int 直接比较
    MON = 1
    TUE = 2
    WED = 3
    THU = 4
    FRI = 5

print(Weekday.MON == 1)     # True
print(Weekday.MON < 3)      # True
```

::: tip Enum vs dataclass
枚举强调"成员身份"，成员是**单例**；数据类强调"数据容器"，每次实例化产生新对象。当一组值是封闭集合（状态机、权限级别）时用 `Enum`，否则用 `dataclass`。
:::

---

## 十、设计模式实战

### 10.1 单例模式

Python 中实现单例有多种方式，各有取舍：

#### (1) 模块级单例（推荐）

Python 模块天然是单例：模块第一次被导入时执行，之后所有导入都拿到同一个模块对象。

```python
# config.py
class _Config:
    def __init__(self):
        self.debug = True

config = _Config()      # 模块级变量，全局唯一

# 使用方
# from config import config
```

#### (2) `__new__` 实现

```python
class Singleton:
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

a, b = Singleton(), Singleton()
print(a is b)     # True
```

#### (3) 装饰器实现

```python
def singleton(cls):
    instances = {}
    def get_instance(*args, **kwargs):
        if cls not in instances:
            instances[cls] = cls(*args, **kwargs)
        return instances[cls]
    return get_instance

@singleton
class DB:
    pass

print(DB() is DB())   # True
```

#### (4) 元类实现

```python
class SingletonMeta(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Logger(metaclass=SingletonMeta):
    pass

print(Logger() is Logger())   # True
```

::: warning 单例的副作用
- 多线程下需要加锁，否则可能创建多个实例。
- 单例会让单元测试难以隔离，慎用。
- 实际工程中，更推荐"模块级单例 + 依赖注入"，避免类内部强耦合全局状态。
:::

### 10.2 工厂方法

把对象的创建逻辑交给工厂方法，调用者无需关心具体类。

```python
from abc import ABC, abstractmethod

class Animal(ABC):
    @abstractmethod
    def speak(self): ...

class Dog(Animal):
    def speak(self): return "汪"

class Cat(Animal):
    def speak(self): return "喵"

class AnimalFactory:
    @staticmethod
    def create(kind: str) -> Animal:
        mapping = {"dog": Dog, "cat": Cat}
        if kind not in mapping:
            raise ValueError(f"未知动物: {kind}")
        return mapping[kind]()

print(AnimalFactory.create("dog").speak())   # 汪
```

### 10.3 策略模式

把"可变的算法"封装成对象，运行时切换：

```python
from dataclasses import dataclass
from typing import Callable

@dataclass
class Order:
    total: float

# 策略：不同的折扣算法
def no_discount(total): return total
def vip_discount(total): return total * 0.8
def full_cut(total): return total - 50 if total >= 300 else total

class PricingContext:
    def __init__(self, strategy: Callable[[float], float]):
        self.strategy = strategy

    def calculate(self, order: Order) -> float:
        return self.strategy(order.total)

ctx = PricingContext(no_discount)
print(ctx.calculate(Order(400)))     # 400

ctx.strategy = vip_discount
print(ctx.calculate(Order(400)))     # 320.0

ctx.strategy = full_cut
print(ctx.calculate(Order(400)))     # 350
```

::: tip Python 中的策略模式
因为 Python 函数是一等对象，很多场景下"策略"就是一个普通函数，无需先定义抽象类再实例化。如果策略带有状态或多个行为，再用类来组织。
:::

---

## 综合案例：电商商品 / 订单模型

下面用 `ABC` + 描述符 + `dataclass` 实现一个简易电商模型，展示三者的协作：

::: details 综合案例完整代码
```python
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Optional


# 1) 描述符：校验价格为正数
class PositiveFloat:
    def __set_name__(self, owner, name):
        self.name = name

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__.get(self.name)

    def __set__(self, instance, value):
        if not isinstance(value, (int, float)) or value <= 0:
            raise ValueError(f"{self.name} 必须是正数，得到 {value!r}")
        instance.__dict__[self.name] = float(value)


# 2) 抽象基类：商品必须实现 describe
class ProductBase(ABC):
    @abstractmethod
    def describe(self) -> str: ...


# 3) 枚举：订单状态
class OrderStatus(Enum):
    PENDING = auto()
    PAID = auto()
    SHIPPED = auto()
    DONE = auto()


# 4) 具体商品类：用描述符保护 price
class Product(ProductBase):
    price = PositiveFloat()

    def __init__(self, sku: str, name: str, price: float):
        self.sku = sku
        self.name = name
        self.price = price          # 进入描述符校验

    def describe(self) -> str:
        return f"[{self.sku}] {self.name} ¥{self.price:.2f}"


# 5) 订单项：用 dataclass 简化代码
@dataclass
class OrderItem:
    product: Product
    qty: int = 1

    @property
    def subtotal(self) -> float:
        return self.product.price * self.qty


# 6) 订单：聚合多个订单项
@dataclass
class Order:
    order_id: str
    items: list[OrderItem] = field(default_factory=list)
    status: OrderStatus = OrderStatus.PENDING

    def add_item(self, product: Product, qty: int = 1):
        self.items.append(OrderItem(product, qty))

    @property
    def total(self) -> float:
        return sum(item.subtotal for item in self.items)

    def pay(self):
        if self.status != OrderStatus.PENDING:
            raise RuntimeError(f"订单 {self.order_id} 状态不可支付: {self.status}")
        self.status = OrderStatus.PAID


# 测试
p1 = Product("A001", "Python 编程书", 89.0)
p2 = Product("A002", "机械键盘", 499.0)
# p3 = Product("A003", "测试", -5)    # ValueError: price 必须是正数，得到 -5

order = Order("ORD-20260720-0001")
order.add_item(p1, 2)
order.add_item(p2, 1)

print(p1.describe())                  # [A001] Python 编程书 ¥89.00
print(p2.describe())                  # [A002] 机械键盘 ¥499.00
print(f"订单 {order.order_id} 总价: ¥{order.total:.2f}")  # ¥677.00
print("状态:", order.status)          # 状态: OrderStatus.PENDING

order.pay()
print("支付后状态:", order.status)    # 支付后状态: OrderStatus.PAID
```
:::

这个案例中：

- **描述符** `PositiveFloat` 把"价格必须为正"的校验逻辑从 `Product.__init__` 中剥离，可复用到任何需要"正浮点"的字段。
- **抽象基类** `ProductBase` 强制所有商品子类实现 `describe`，保证 API 一致。
- **数据类** 让 `OrderItem` / `Order` 的样板代码大幅减少，专注于业务字段。
- **枚举** 让订单状态有明确的取值集合，避免魔法字符串。

---

## 小结

| 主题 | 关键点 |
|------|--------|
| 类与对象 | `class` / `__init__` / `self`；实例属性 vs 类属性 |
| 封装 | `_x` 约定、`__x` 名称改写、`@property` 校验 |
| 继承 | `super()`、多继承、C3 MRO |
| 多态 | 鸭子类型、`ABC` 强约束、`Protocol` 结构化类型 |
| 三种方法 | 实例方法 / `@classmethod` / `@staticmethod` |
| 魔法方法 | `__str__`/`__repr__`/`__eq__`/`__hash__`/`__add__`/`__call__`/`__enter__`/`__new__`/`__slots__` |
| 描述符 | `__get__`/`__set__`/`__delete__`，`property` 本质是数据描述符 |
| 数据类 | `@dataclass` + `field` + `frozen` + `slots` + `order` |
| 枚举 | `Enum` / `IntEnum` / `auto()` / `@unique` |
| 设计模式 | 单例（模块级 / `__new__` / 元类 / 装饰器）、工厂方法、策略模式 |

掌握以上内容后，你已经具备了写**优雅、可扩展、可维护的 Python OOP 代码**的全部基础。下一篇我们将进入**迭代器、生成器与异步编程**，把这些 OOP 能力应用到更高效的数据处理与并发模型中。
