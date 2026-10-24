---
title: 语言基础
category:
  - 后端
tag:
  - Python
---

# 语言基础

本篇是《Python 从入门到精通》第 02 篇，将系统讲解 Python 的语言基础。基于 Python 3.12+，覆盖变量与动态类型、基本数据类型、运算符、流程控制、字符串、类型提示、输入输出等核心知识。每个知识点都配有可运行示例，并在注释中给出预期输出，方便你边读边验证。

---

## 一、变量与动态类型

### 1.1 一切皆对象

在 Python 中，**一切皆对象**。这听起来像一句口号，但它有非常具体的含义：整数、字符串、函数、类、模块，甚至 `None`、`True`、`False`，全部都是对象。对象有身份（`id`）、类型（`type`）和值，并且可以在其上调用方法或访问属性。

很多人以为 `int` 是基本类型，其实 Python 中的 `int` 是一个完整的对象，拥有自己的方法：

```python
x = 10
print(type(x))        # <class 'int'>
print(x.bit_length()) # 4   —— 10 的二进制是 1010，共 4 位
print((255).bit_length())  # 8
print(x.__add__(5))   # 15  —— + 运算符底层就是调用 __add__
```

甚至函数本身也是对象，可以被赋值、传递、作为参数：

```python
def greet(name):
    return f"Hello, {name}"

say = greet           # 把函数对象赋给另一个变量
print(say("Tom"))     # Hello, Tom
print(greet.__name__) # greet
```

### 1.2 动态类型

Python 是**动态类型**语言：变量名只是个"标签"，可以随时贴到不同类型的对象上，无需声明类型。

```python
x = 10          # 此时 x 指向 int
print(type(x))  # <class 'int'>
x = "hello"     # 现在 x 指向 str
print(type(x))  # <class 'str'>
x = [1, 2, 3]   # 又指向 list
print(type(x))  # <class 'list'>
```

### 1.3 强类型

虽然"动态"，但 Python 同时是**强类型**语言：不会做隐式的、不安全的类型转换。例如数字和字符串不能直接相加：

```python
# print(1 + "1")   # TypeError: unsupported operand type(s) for +: 'int' and 'str'
print(1 + int("1"))   # 2，需要显式转换
print(str(1) + "1")   # "11"
```

::: tip 强类型 vs 弱类型
JavaScript 中 `1 + "1"` 会得到 `"11"`，`"6" - 1` 会得到 `5`，那是弱类型；Python 直接抛 `TypeError`，要求你显式说明意图，避免隐藏 bug。
:::

### 1.4 id()、type()、isinstance()

- `id(obj)`：返回对象的唯一标识（在 CPython 中就是内存地址）。
- `type(obj)`：返回对象的类型。
- `isinstance(obj, cls)`：判断 obj 是否是 cls 或其子类的实例，推荐使用，比 `type(obj) == cls` 更健壮。

```python
a = 256
b = 256
print(id(a) == id(b))      # True  —— 小整数缓存
print(a is b)              # True

c = 1000
d = 1000
print(id(c) == id(d))      # False（在交互式环境中；同一脚本模块内可能为 True）
print(c is d)              # 视运行环境而定
print(c == d)              # True，值相等

print(isinstance(True, int))   # True，bool 是 int 的子类
print(isinstance(3.14, (int, float)))  # True，支持元组形式
```

### 1.5 is 与 == 的区别

- `==` 比较**值是否相等**，会调用对象的 `__eq__` 方法。
- `is` 比较**两个引用是否指向同一个对象**（即 `id` 是否相同）。

```python
lst1 = [1, 2, 3]
lst2 = [1, 2, 3]
print(lst1 == lst2)  # True，内容相同
print(lst1 is lst2)  # False，是两个不同的列表对象

s1 = "hello"
s2 = "hello"
print(s1 is s2)      # True，字符串驻留（intern）机制
```

::: warning 注意小整数与字符串驻留
CPython 默认缓存 `-5` 到 `256` 之间的整数对象，符合标识符规则的短字符串也会被驻留。这是实现优化，不要在生产代码中**依赖** `is` 来比较值是否相等，永远用 `==`。`is` 留给 `None`、`True`、`False` 这类单例对象的比较：

```python
if x is None: ...
if x is True: ...
```
:::

---

## 二、基本数据类型

### 2.1 int：任意精度大整数

Python 的 `int` 不像 C/Java 那样有 32 位/64 位限制，它**自动扩展**，可以表示任意大的整数：

```python
big = 10 ** 100
print(big)              # 10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
print(type(big))        # <class 'int'>
print(big + 1)          # 10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001

# Python 3.10+ 还支持数字下划线分组，便于阅读
million = 1_000_000
print(million)          # 1000000
```

### 2.2 float：IEEE 754 与精度问题

`float` 是双精度浮点数（64 位 IEEE 754），存在经典的精度问题：

```python
print(0.1 + 0.2)          # 0.30000000000000004
print(0.1 + 0.2 == 0.3)   # False
```

::: warning 不要用 float 表示金额
由于二进制无法精确表示 0.1 这类十进制小数，财务计算请使用 `decimal.Decimal`：

```python
from decimal import Decimal

# 错误做法
total = 0
for _ in range(10):
    total += 0.1
print(total)              # 0.9999999999999999

# 正确做法
total = Decimal("0")
for _ in range(10):
    total += Decimal("0.1")
print(total)              # 1.0
print(total == Decimal("1.0"))  # True
```

注意 `Decimal("0.1")` 必须传字符串，传 float 会让精度问题在创建时就被带入。
:::

### 2.3 bool：True/False 是 int 子类

`bool` 是 `int` 的子类，`True == 1`，`False == 0`：

```python
print(True + 1)            # 2
print(isinstance(True, int))  # True
print(True == 1)           # True
print(False == 0)          # True
print([True, False, True].count(True))  # 2

# 但身份不同
print(True is 1)           # False
```

常见的"假值"：`False`、`0`、`0.0`、`""`、`[]`、`{}`、`()`、`set()`、`None`。其他都是真值。

### 2.4 NoneType

`None` 表示"没有值"，是 `NoneType` 的唯一实例：

```python
x = None
print(x is None)     # True
print(type(x))       # <class 'NoneType'>

def say_hi():
    print("hi")

result = say_hi()    # hi
print(result)        # None，函数没有 return 默认返回 None
```

### 2.5 complex

复数在 Python 中是一等公民，用 `j` 表示虚部：

```python
z = 3 + 4j
print(z.real)        # 3.0
print(z.imag)        # 4.0
print(abs(z))        # 5.0，模长 √(3²+4²)
print(z.conjugate()) # (3-4j)，共轭复数
```

### 2.6 Decimal：金额计算案例

完整案例：模拟一个购物车，计算含税总价。

```python
from decimal import Decimal, getcontext, ROUND_HALF_UP

getcontext().prec = 28  # 设置全局精度

def calc_total(items, tax_rate):
    """items: [(name, price_str), ...], tax_rate: '0.08' 表示 8%"""
    subtotal = Decimal("0")
    for name, price in items:
        subtotal += Decimal(price)
    tax = (subtotal * Decimal(tax_rate)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    total = subtotal + tax
    return subtotal, tax, total

items = [
    ("键盘", "299.90"),
    ("鼠标", "88.50"),
    ("耳机", "599.00"),
]
subtotal, tax, total = calc_total(items, "0.08")
print(f"小计: ¥{subtotal}")  # 小计: ¥987.40
print(f"税额: ¥{tax}")       # 税额: ¥78.99
print(f"总价: ¥{total}")     # 总价: ¥1066.39
```

---

## 三、运算符

### 3.1 算术运算符

```python
print(7 / 2)     # 3.5   真除法，总是返回 float
print(7 // 2)    # 3     向下取整（向负无穷方向）
print(-7 // 2)   # -4    注意：不是 -3，而是向负无穷
print(7 % 2)     # 1     取余
print(-7 % 2)    # 1     Python 的 % 结果符号与除数一致
print(2 ** 10)   # 1024  幂运算
print(2 ** 0.5)  # 1.4142135623730951  开平方
```

::: warning 取整方向
Python 的 `//` 是"向下取整"（floor division），不是"截断"（truncation）。对正数没差别，对负数有差别：
- `-7 // 2` 得 `-4`（向下取整到 -4，因为 -3.5 向下是 -4）
- `int(-7 / 2)` 得 `-3`（截断小数部分）

`%` 的结果符号始终与**右侧除数**一致，这是 Python 与 C/Java 不同的地方。
:::

### 3.2 比较运算符

```python
print(1 < 2 < 3)        # True，链式比较，等价于 1 < 2 and 2 < 3
print(1 == 1.0)         # True，int 与 float 值比较
print("abc" < "abd")    # True，字符串按字典序比较
print([1, 2] < [1, 3])  # True，列表逐元素比较
```

### 3.3 逻辑运算符：and / or / not

Python 的逻辑运算符**返回的是操作数本身**，而不是布尔值（必要时会做布尔转换）：

```python
print(3 and 5)      # 5     —— 3 为真，返回右侧 5
print(0 and 5)      # 0     —— 0 为假，短路返回 0
print(3 or 5)       # 3     —— 3 为真，短路返回 3
print(0 or 5)       # 5     —— 0 为假，返回右侧 5
print(not 0)        # True
print(not "hi")     # False

# 经典用法：设置默认值
name = input_name or "匿名"
# 等价于
name = "匿名" if not input_name else input_name
```

短路求值的实用案例：

```python
# 避免 None 时 AttributeError
config = None
port = config and config.get("port") or 8080
print(port)   # 8080

# 更清晰的写法（推荐）
port = (config.get("port") if config else None) or 8080
```

### 3.4 位运算符

```python
print(5 & 3)      # 1   0101 & 0011 = 0001
print(5 | 3)      # 7   0101 | 0011 = 0111
print(5 ^ 3)      # 6   0101 ^ 0011 = 0110
print(~5)         # -6  按位取反
print(1 << 4)     # 16  左移 4 位
print(256 >> 2)   # 64  右移 2 位

# 实用：权限位掩码
READ, WRITE, EXEC = 1, 2, 4
perm = READ | WRITE       # 3
print(bool(perm & READ))  # True，有读权限
print(bool(perm & EXEC))  # False，无执行权限
```

### 3.5 赋值与增强赋值

```python
a = b = c = 1           # 链式赋值，三个变量指向同一个 int
print(a, b, c)          # 1 1 1

x, y, z = 1, 2, 3       # 多元赋值（元组解包）
print(x, y, z)          # 1 2 3

a, b = b, a             # 经典：交换两个变量，无需临时变量
# 底层是先把右侧打包成元组 (b, a)，再解包给左侧

x = 10
x += 5                  # 增强赋值，等价于 x = x + 5
x *= 2
print(x)                # 30

lst = [1, 2, 3]
lst += [4]              # 列表的 += 是原地扩展（调用 __iadd__），等价于 lst.extend([4])
print(lst)              # [1, 2, 3, 4]

# 解包扩展：* 收集剩余
first, *rest = [1, 2, 3, 4, 5]
print(first, rest)      # 1 [2, 3, 4, 5]

a, *middle, b = [1, 2, 3, 4, 5]
print(a, middle, b)     # 1 [2, 3, 4] 5
```

### 3.6 海象运算符 := （Python 3.8+）

海象运算符 `:=`（walrus operator）允许在表达式内部赋值，避免重复求值。

**场景 1：while 循环中读取输入**

```python
# 传统写法：要写两次 input()
# line = input()
# while line != "quit":
#     print(line)
#     line = input()

# 海象运算符：写一次即可
lines = []
while (line := input("输入内容（quit 退出）: ")) != "quit":
    lines.append(line)
print(f"你输入了 {len(lines)} 行")
```

**场景 2：列表推导中复用计算结果**

```python
def expensive(x):
    return x * x + 1

data = [1, 5, 10, 2, 8]

# 传统写法：expensive(x) 算两次
results = [expensive(x) for x in data if expensive(x) > 26]
print(results)  # [26, 101, 65]

# 海象运算符：只算一次
results = [y for x in data if (y := expensive(x)) > 26]
print(results)  # [26, 101, 65]
```

**场景 3：处理匹配正则的结果**

```python
import re
text = "价格 100 元，数量 5 个"
pattern = re.compile(r"\d+")
# 不用海象
m = pattern.search(text)
if m:
    print("第一个数字:", m.group())  # 第一个数字: 100

# 用海象
if (m := pattern.search(text)):
    print("第一个数字:", m.group())  # 第一个数字: 100
```

::: tip 何时使用海象
海象运算符的核心价值是"消除重复求值或重复语句"。当某个表达式既要被判断又要被使用时，用它可以让代码更紧凑。但也不要滥用，简单赋值不要为了用而用。
:::

---

## 四、流程控制

### 4.1 if / elif / else

```python
score = 85
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
elif score >= 60:
    grade = "D"
else:
    grade = "F"
print(grade)  # B

# 三元表达式（条件表达式）
status = "及格" if score >= 60 else "不及格"
print(status)  # 及格
```

### 4.2 while 循环（含 else）

```python
# 基础用法
n = 5
factorial = 1
i = 1
while i <= n:
    factorial *= i
    i += 1
print(factorial)  # 120

# while ... else：循环正常结束（没有被 break 打断）才执行 else
target = 7
i = 2
while i < target:
    if target % i == 0:
        print(f"{target} 不是质数，因子 {i}")
        break
    i += 1
else:
    print(f"{target} 是质数")   # 7 是质数
```

::: tip 循环 else 的语义
`while/for ... else` 中的 `else` 在循环**正常结束**时执行；如果被 `break` 中断，则不执行。这看似反直觉，但语义其实是"如果没有 break，就做点收尾"。常用于搜索/查找场景：找到了 break，没找到走 else。
:::

### 4.3 for 循环与可迭代对象

`for` 遍历任何**可迭代对象**（iterable），包括 list、tuple、str、dict、set、range、生成器等。

```python
# 遍历列表
for fruit in ["apple", "banana", "cherry"]:
    print(fruit)
# apple
# banana
# cherry

# range：range(start, stop, step)，左闭右开
for i in range(3):          # 0, 1, 2
    print(i, end=" ")
print()  # 0 1 2

for i in range(2, 8, 2):    # 2, 4, 6
    print(i, end=" ")
print()  # 2 4 6

for i in range(5, 0, -1):   # 5, 4, 3, 2, 1
    print(i, end=" ")
print()  # 5 4 3 2 1
```

**enumerate：带索引遍历**

```python
fruits = ["apple", "banana", "cherry"]
for idx, fruit in enumerate(fruits):
    print(idx, fruit)
# 0 apple
# 1 banana
# 2 cherry

# enumerate 第二个参数可指定起始索引
for idx, fruit in enumerate(fruits, start=1):
    print(idx, fruit)
# 1 apple
# 2 banana
# 3 cherry
```

**zip：并行遍历多个可迭代对象**

```python
names = ["Alice", "Bob", "Carol"]
ages = [25, 30, 35]
cities = ["北京", "上海", "广州"]

for name, age, city in zip(names, ages, cities):
    print(f"{name} {age}岁 {city}")
# Alice 25岁 北京
# Bob 30岁 上海
# Carol 35岁 广州

# zip 会以最短的可迭代对象为准；如需以最长为准，用 itertools.zip_longest
from itertools import zip_longest
for pair in zip_longest([1, 2, 3], [10, 20], fillvalue=0):
    print(pair)
# (1, 10)
# (2, 20)
# (3, 0)
```

### 4.4 break / continue / 循环 else

```python
# break：跳出整个循环
for i in range(10):
    if i == 5:
        break
    print(i, end=" ")
print()  # 0 1 2 3 4

# continue：跳过本次，进入下一次
for i in range(6):
    if i % 2 == 0:
        continue
    print(i, end=" ")
print()  # 1 3 5

# 配合 else：判断是否找到
def find_first_even(nums):
    for n in nums:
        if n % 2 == 0:
            return n
    else:
        return None  # 没找到才走这里

print(find_first_even([1, 3, 5, 6, 7]))  # 6
print(find_first_even([1, 3, 5]))        # None
```

### 4.5 match-case：结构化模式匹配（Python 3.10+）

`match-case` 是 Python 3.10 引入的强大特性，远不止"switch-case"。它支持**结构化模式匹配**，可以解构数据。

**字面量匹配**

```python
def http_status(code):
    match code:
        case 200:
            return "OK"
        case 301:
            return "Moved Permanently"
        case 404:
            return "Not Found"
        case 500 | 502 | 503:    # | 表示多个模式
            return "Server Error"
        case _:                   # _ 是通配符，匹配任意值
            return "Unknown"

print(http_status(404))  # Not Found
print(http_status(503))  # Server Error
print(http_status(999))  # Unknown
```

**变量绑定与解构匹配**

```python
def describe_point(p):
    match p:
        case (0, 0):
            return "原点"
        case (0, y):           # y 是变量，会绑定实际值
            return f"在 y 轴上，y={y}"
        case (x, 0):
            return f"在 x 轴上，x={x}"
        case (x, y):
            return f"在 ({x}, {y})"

print(describe_point((0, 0)))   # 原点
print(describe_point((0, 5)))   # 在 y 轴上，y=5
print(describe_point((3, 4)))   # 在 (3, 4)
```

**解构列表/字典**

```python
def handle_command(cmd):
    match cmd:
        case ["quit"]:
            return "退出程序"
        case ["help"]:
            return "显示帮助"
        case ["mkdir", name]:
            return f"创建目录 {name}"
        case ["cp", src, dst]:
            return f"复制 {src} -> {dst}"
        case ["rm", *files]:       # *files 收集剩余
            return f"删除文件: {files}"
        case _:
            return "未知命令"

print(handle_command(["mkdir", "test"]))      # 创建目录 test
print(handle_command(["cp", "a.txt", "b.txt"]))  # 复制 a.txt -> b.txt
print(handle_command(["rm", "x", "y", "z"]))  # 删除文件: ['x', 'y', 'z']
```

**类解构匹配**

```python
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

@dataclass
class Circle:
    center: Point
    radius: int

def describe_shape(shape):
    match shape:
        case Point(x=0, y=0):
            return "位于原点的点"
        case Point(x=x, y=y):
            return f"点 ({x}, {y})"
        case Circle(center=Point(x=cx, y=cy), radius=r):
            return f"圆心 ({cx}, {cy})，半径 {r}"

print(describe_shape(Point(0, 0)))              # 位于原点的点
print(describe_shape(Point(3, 4)))              # 点 (3, 4)
print(describe_shape(Circle(Point(0, 0), 5)))   # 圆心 (0, 0)，半径 5
```

**守卫子句 `if`**

```python
def classify_number(n):
    match n:
        case x if x < 0:
            return "负数"
        case 0:
            return "零"
        case x if x < 100:
            return "小正数"
        case _:
            return "大正数"

print(classify_number(-5))   # 负数
print(classify_number(0))    # 零
print(classify_number(50))   # 小正数
print(classify_number(500))  # 大正数
```

**`as` 绑定**

```python
def process(data):
    match data:
        case [1, 2, *rest] as full if len(rest) > 0:
            return f"匹配 {full}，剩余 {rest}"
        case _:
            return "未匹配"

print(process([1, 2, 3, 4]))  # 匹配 [1, 2, 3, 4]，剩余 [3, 4]
```

::: details match-case 与 if-elif 该用哪个？
当判断条件是"某个变量的几个具体值"，二者均可；当需要**解构数据**（拆解元组/列表/字典/对象）、按结构分支时，`match-case` 远比 `if-elif` 清晰。但注意 `match-case` 中的变量名会被当作"待绑定的变量"，而不是"比较目标"。如果要比较某个已知变量的值，需用句点限定：`case Point(x=0, y=0)` 中的 `0` 是字面量，而 `x` 是变量。
:::

---

## 五、字符串

### 5.1 创建字符串

```python
s1 = 'hello'           # 单引号
s2 = "hello"           # 双引号（与单引号完全等价）
s3 = "It's OK"         # 内部有单引号，用双引号包裹
s4 = 'He said "hi"'    # 内部有双引号，用单引号包裹
s5 = """多行
字符串"""               # 三引号支持多行
s6 = '''也是多行
字符串'''
print(s5)              # 多行\n字符串（实际换行）

# 转义字符
print("a\tb\nc")       # a    b（换行）c
print("C:\\new\\test") # C:\new\test
```

### 5.2 索引与切片

字符串是不可变序列，支持索引（正向从 0 开始，负向从 -1 开始）和切片。

```python
s = "Hello, Python!"
print(s[0])            # H
print(s[-1])           # !
print(s[7:13])         # Python，左闭右开
print(s[:5])           # Hello
print(s[7:])           # Python!
print(s[::2])          # Hlo yhn，步长为 2
print(s[::-1])         # !nohtyP ,olleH，反转字符串
print(s[-6:-1])        # ytho，负索引切片

# 字符串不可变
# s[0] = "h"   # TypeError: 'str' object does not support item assignment
```

::: tip 切片公式
`seq[start:stop:step]`，三个参数都可省略。规律：
- 省略 `start`：从开头开始
- 省略 `stop`：到结尾结束
- 省略 `step`：默认 1
- `step` 为负：从右往左取，反转字符串就用 `[::-1]`
:::

### 5.3 常用方法

```python
s = "  Hello, World!  "
print(s.strip())          # "Hello, World!"   去两端空白
print(s.lstrip())         # "Hello, World!  " 去左端
print(s.rstrip())         # "  Hello, World!" 去右端
print(s.strip().lower())  # "hello, world!"
print(s.strip().upper())  # "HELLO, WORLD!"

print("Hello, World".replace("World", "Python"))  # Hello, Python
print("Hello, World".split(", "))                 # ['Hello', 'World']
print(",".join(["a", "b", "c"]))                  # a,b,c
print("Hello".startswith("He"))                   # True
print("Hello".endswith("lo"))                     # True
print("Hello".find("l"))                          # 2，找不到返回 -1
print("Hello".index("l"))                         # 2，找不到抛 ValueError
print("Hello".count("l"))                         # 2

# splitlines：按行分割
text = "line1\nline2\nline3"
print(text.splitlines())  # ['line1', 'line2', 'line3']

# split 不传参：按任意空白符分割（包括多个空格、制表符、换行）
print("  a  b\tc\n".split())  # ['a', 'b', 'c']
```

### 5.4 字符串格式化的演进

**1）% 格式化（C 风格，老式）**

```python
name = "Tom"
age = 18
print("我叫 %s，今年 %d 岁" % (name, age))  # 我叫 Tom，今年 18 岁
print("圆周率 %.2f" % 3.14159)              # 圆周率 3.14
```

**2）str.format()（Python 2.6+）**

```python
print("我叫 {}，今年 {} 岁".format(name, age))
print("我叫 {0}，{0}今年 {1} 岁".format(name, age))  # 重复引用
print("我叫 {name}，{age} 岁".format(name="Tom", age=18))
print("{:>10}".format("hi"))    #         hi，右对齐宽度 10
print("{:<10}|".format("hi"))   # hi        |，左对齐
print("{:^10}".format("hi"))    #     hi    ，居中
print("{:,.2f}".format(1234567.891))  # 1,234,567.89，千分位+两位小数
```

**3）f-string（Python 3.6+，强烈推荐）**

```python
name = "Tom"
age = 18
print(f"我叫 {name}，今年 {age} 岁")  # 我叫 Tom，今年 18 岁

# 表达式直接写在大括号里
print(f"明年我 {age + 1} 岁")        # 明年我 19 岁
print(f"{'Python':^10}")             #   Python  ，居中宽度 10
print(f"{3.14159:.2f}")              # 3.14
print(f"{1234567:,}")                # 1,234,567
print(f"{1234567.891:,.2f}")         # 1,234,567.89

# = 调试语法（3.8+），自动打印变量名和值
x = 42
print(f"{x = }")                     # x = 42
print(f"{x * 2 = }")                 # x * 2 = 84

# 日期格式化
from datetime import datetime
now = datetime.now()
print(f"{now:%Y-%m-%d %H:%M:%S}")    # 2026-07-20 14:30:05
print(f"{now:%Y年%m月%d日}")          # 2026年07月20日

# 进制与对齐
n = 255
print(f"{n:b}")      # 11111111，二进制
print(f"{n:o}")      # 377，八进制
print(f"{n:x}")      # ff，十六进制
print(f"{n:#x}")     # 0xff，带前缀
print(f"{n:08b}")    # 11111111，宽度 8 前补 0
```

::: tip f-string 性能
f-string 在 Python 3.6+ 是性能最好的格式化方式，比 `%` 和 `str.format()` 都更快，可读性也最佳，新代码优先使用。
:::

### 5.5 原始字符串与正则

`r""` 原始字符串会**禁用反斜杠转义**，正则表达式中非常常用：

```python
# 普通字符串：\n 是换行
print("a\nb")          # a（换行）b

# 原始字符串：\n 是字面两个字符
print(r"a\nb")         # a\nb

# 正则中尤其重要：匹配一个数字 \d
import re

# 普通字符串要写双反斜杠
pattern1 = "\\d+"
# 原始字符串更直观
pattern2 = r"\d+"

print(re.findall(pattern1, "abc123def45"))  # ['123', '45']
print(re.findall(pattern2, "abc123def45"))  # ['123', '45']

# Windows 路径也推荐用 r""
path = r"C:\new\test\file.txt"
print(path)  # C:\new\test\file.txt
```

### 5.6 字符串不可变性与拼接性能

字符串不可变，每次"修改"其实都创建了新对象：

```python
s = "hello"
# s[0] = "H"  # TypeError
s = "H" + s[1:]   # 这是新字符串
print(s)           # Hello
```

大量拼接时，`+` 会在每次循环都创建新字符串，性能很差；`join` 是 O(n) 的一次性分配：

```python
import time

# 慢：每次 + 都创建新字符串
start = time.perf_counter()
s = ""
for i in range(100000):
    s += str(i)
print(f"+ 用时 {time.perf_counter() - start:.3f}s")

# 快：join 一次性分配
start = time.perf_counter()
s = "".join(str(i) for i in range(100000))
print(f"join 用时 {time.perf_counter() - start:.3f}s")
```

在我的机器上输出大概是：

```
+ 用时 0.025s
join 用时 0.011s
```

数量级越大，差距越明显（`+` 是 O(n²)，`join` 是 O(n)）。

::: warning 不要在循环里用 +=
虽然 CPython 对 `s += x` 做了优化（当 s 引用计数为 1 时会原地扩展），但这只是实现细节，不要依赖。规范写法是收集到列表里再 `"".join(parts)`。
:::

---

## 六、类型提示入门

Python 3.5+ 引入**类型提示**（type hints），它是**可选的、不影响运行时**的注解，但配合静态检查工具（mypy、pyright）能在写代码时发现类型错误。

### 6.1 变量与函数注解

```python
# 变量注解
age: int = 18
name: str = "Tom"
pi: float = 3.14

# 函数注解：参数和返回值
def add(a: int, b: int) -> int:
    return a + b

def greet(name: str, times: int = 1) -> str:
    return (f"Hello, {name}! " * times).strip()

print(add(3, 5))           # 8
print(greet("Tom", 2))     # Hello, Tom! Hello, Tom!
```

注意：类型提示**不强制运行时检查**，下面代码也能跑（但 mypy 会报错）：

```python
def add(a: int, b: int) -> int:
    return a + b

# add("3", "5")   # 运行时返回 "35"，但 mypy 会报类型错误
```

### 6.2 Optional 与 Union

```python
from typing import Optional, Union

# Optional[X] 等价于 X | None
def find_user(user_id: int) -> Optional[str]:
    users = {1: "Tom", 2: "Jerry"}
    return users.get(user_id)   # 找不到返回 None

print(find_user(1))   # Tom
print(find_user(99))  # None

# Union[X, Y] 等价于 X | Y（Python 3.10+）
def double(x: Union[int, str]) -> Union[int, str]:
    if isinstance(x, int):
        return x * 2
    return x + x

# Python 3.10+ 可直接用 | 语法
def double_new(x: int | str) -> int | str:
    if isinstance(x, int):
        return x * 2
    return x + x
```

### 6.3 内置泛型（Python 3.9+）

Python 3.9+ 支持直接用 `list[int]`、`dict[str, int]`、`tuple[int, ...]`，无需从 `typing` 导入 `List`/`Dict`/`Tuple`：

```python
# Python 3.9+ 写法
def sum_list(nums: list[int]) -> int:
    return sum(nums)

def count_words(text: str) -> dict[str, int]:
    result: dict[str, int] = {}
    for word in text.split():
        result[word] = result.get(word, 0) + 1
    return result

# 元组：固定长度与可变长度
def get_point() -> tuple[int, int]:
    return (3, 4)

def get_all() -> tuple[int, ...]:
    return (1, 2, 3, 4)   # 任意长度，元素都是 int

print(sum_list([1, 2, 3]))            # 6
print(count_words("a b a c b a"))     # {'a': 3, 'b': 2, 'c': 1}
print(get_point())                    # (3, 4)
```

### 6.4 配合 mypy 做静态检查

安装：`pip install mypy`

把以下代码存为 `demo.py`：

```python
def add(a: int, b: int) -> int:
    return a + b

result: str = add(1, 2)   # 类型不匹配：返回值是 int，却赋给 str
add("1", 2)               # 参数类型错误
```

运行 `mypy demo.py`，会得到类似输出：

```
demo.py:4: error: Incompatible types in assignment (expression has type "int", variable has type "str")
demo.py:5: error: Argument 1 to "add" has incompatible type "str"; expected "int"
```

::: tip 类型提示的最佳实践
- 公共 API（对外暴露的函数）一定要加类型提示
- 复杂的内部函数也建议加
- 配合 mypy/Pyright 在 CI 中检查
- 类型提示是"文档 + 工具辅助"，不改变 Python 动态类型的本质
:::

---

## 七、输入输出

### 7.1 print 的全部参数

```python
print("hello", "world")            # hello world（默认 sep=" "）
print("hello", "world", sep="")    # helloworld
print("hello", "world", sep=", ")  # hello, world
print("a", "b", "c", sep="-")      # a-b-c

# end：默认是 "\n"，可改为不换行或自定义
for i in range(3):
    print(i, end=" ")
print()  # 0 1 2

# file：输出到文件
import sys
print("到标准错误", file=sys.stderr)

with open("output.txt", "w", encoding="utf-8") as f:
    print("写入文件", file=f)

# flush：立即刷新缓冲区（默认 False，遇到换行才刷新）
import time
for i in range(3):
    print(f"\r倒计时 {i}", end="", flush=True)
    time.sleep(0.5)
print()
```

### 7.2 input：始终返回 str

```python
# name = input("请输入姓名：")
# print(f"你好，{name}")

# input 返回的永远是 str，做运算前必须类型转换
age_str = "18"   # 假设用户输入
age = int(age_str)
print(age + 1)   # 19

# 安全的类型转换
def read_int(prompt: str) -> int:
    while True:
        try:
            return int(input(prompt))
        except ValueError:
            print("请输入有效的整数")

# 实际开发中要处理异常，因为用户可能输入 "abc" 或留空
```

### 7.3 格式化输出综合案例

```python
students = [
    ("Tom", 92.5, "北京"),
    ("Jerry", 88.0, "上海"),
    ("Alice", 95.3, "广州"),
]

# 表头
print(f"{'姓名':<10}{'分数':>8}{'城市':>10}")
print("-" * 28)
for name, score, city in students:
    print(f"{name:<10}{score:>8.2f}{city:>10}")

# 汇总
avg = sum(s[1] for s in students) / len(students)
print("-" * 28)
print(f"平均分: {avg:.2f}")
print(f"最高分: {max(s[1] for s in students):.2f}")
print(f"总人数: {len(students):,} 人")   # 千分位
```

预期输出：

```
姓名          分数        城市
----------------------------
Tom           92.50      北京
Jerry         88.00      上海
Alice         95.30      广州
----------------------------
平均分: 91.93
最高分: 95.30
总人数: 3 人
```

---

## 八、综合练习：猜数字游戏

下面把本篇学的流程控制、输入输出、字符串、类型提示等综合应用，写一个完整的"猜数字游戏"。游戏规则：随机生成 1~100 的整数，玩家反复输入猜测，程序提示"大了"或"小了"，直到猜中。统计猜测次数，并支持多轮游戏。

::: details 点击查看完整代码

```python
"""猜数字游戏 - 综合练习"""
import random


def get_guess() -> int | None:
    """读取玩家输入，返回整数；输入 'quit' 返回 None 表示放弃"""
    while True:
        raw = input("请输入 1~100 的整数（输入 quit 放弃）: ").strip()
        if raw.lower() == "quit":
            return None
        try:
            num = int(raw)
        except ValueError:
            print("  ⚠ 不是有效整数，请重试")
            continue
        if not 1 <= num <= 100:
            print("  ⚠ 超出范围，必须是 1~100")
            continue
        return num


def play_once() -> bool:
    """玩一局，返回是否猜中"""
    target = random.randint(1, 100)
    attempts = 0
    print("\n=== 新一局开始 ===")
    print("我心里想了一个 1~100 之间的整数，来猜猜看？")

    while True:
        guess = get_guess()
        if guess is None:
            print(f"  你放弃了，答案是 {target}")
            return False
        attempts += 1

        if guess < target:
            print(f"  太小了（第 {attempts} 次尝试）")
        elif guess > target:
            print(f"  太大了（第 {attempts} 次尝试）")
        else:
            print(f"  🎉 恭喜！你用了 {attempts} 次猜中！")
            return True


def main() -> None:
    print("=" * 40)
    print("       欢迎来到 猜数字游戏")
    print("=" * 40)

    total_games = 0
    won_games = 0
    best_score: int | None = None  # 最少尝试次数

    while True:
        total_games += 1
        won = play_once()
        if won:
            won_games += 1
            # 这一局的次数从内部无法直接拿，简化：用 total 估算
            # 更严谨的写法是 play_once 返回 (won, attempts)

        choice = input("\n再来一局？(y/n): ").strip().lower()
        if choice not in ("y", "yes", "是"):
            break

    print("\n" + "=" * 40)
    print(f"总游戏局数: {total_games}")
    print(f"获胜局数:   {won_games}")
    print("=" * 40)
    print("感谢游玩，再见！")


if __name__ == "__main__":
    main()
```

:::

::: tip 进阶改进建议
1. 把 `play_once` 改为返回 `(won: bool, attempts: int)`，从而精确记录最佳成绩。
2. 用 `match-case` 重写玩家输入 "y/n" 的判断逻辑。
3. 把历史最佳成绩用 `Decimal` 或 `int` 存到文件，跨次启动保留。
4. 用类型提示完善每个函数，并跑 `mypy` 检查。
:::

---

## 小结

本篇系统讲解了 Python 的语言基础：

- **变量与动态类型**：一切皆对象，动态类型但强类型；`is` 比身份、`==` 比值；小整数与字符串驻留是优化细节，不要依赖。
- **基本数据类型**：`int` 任意精度、`float` 有精度问题、`bool` 是 `int` 子类、`Decimal` 适合金额计算。
- **运算符**：注意 `/` 与 `//` 区别、负数取整方向、`and/or` 返回值而非布尔、海象 `:=` 消除重复。
- **流程控制**：循环 `else` 在"正常结束"时触发；`match-case` 不只是 switch，支持结构化解构匹配。
- **字符串**：切片 `[::-1]` 反转、f-string 是首选格式化、大量拼接用 `join`。
- **类型提示**：可选但强烈推荐，配合 mypy 静态检查；3.9+ 可直接用 `list[int]`、3.10+ 可用 `X | Y`。
- **输入输出**：`print` 的 `sep/end/file/flush`、`input` 永远返回 `str`。

掌握这些基础，你已经能写出大部分日常脚本。下一篇将进入**函数与作用域**，讲解函数定义、参数传递（位置/关键字/默认/可变参数）、闭包、装饰器、生成器等更进阶的内容。

