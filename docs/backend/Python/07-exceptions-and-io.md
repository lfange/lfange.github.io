---
title: 异常处理与文件 IO
category:
  - 后端
tag:
  - Python
---

# 异常处理与文件 IO

本篇是《Python 从入门到精通》第 07 篇，基于 Python 3.12+。我们将系统讲解 Python 的异常体系与处理机制，再深入文件 IO、pathlib、序列化与实战案例。掌握本篇后，你写的 Python 代码将更健壮、更 Pythonic。

---

## 一、异常体系

### 1.1 异常继承层级

Python 中所有异常都继承自 `BaseException`。它的直接子类主要分两类：

- `Exception`：绝大多数业务异常的根，程序代码应捕获的几乎都在这棵子树下。
- `SystemExit`、`KeyboardInterrupt`、`GeneratorExit`：与解释器/生成器生命周期相关，**不**属于 `Exception`。

文字版树状图如下（仅列关键节点）：

```
BaseException
├── Exception
│   ├── StopIteration
│   ├── ArithmeticError
│   │   ├── ZeroDivisionError
│   │   ├── FloatingPointError
│   │   └── OverflowError
│   ├── LookupError
│   │   ├── IndexError
│   │   └── KeyError
│   ├── OSError
│   │   ├── FileNotFoundError
│   │   ├── FileExistsError
│   │   ├── PermissionError
│   │   ├── IsADirectoryError
│   │   └── TimeoutError
│   ├── TypeError
│   ├── ValueError
│   │   └── UnicodeError
│   │       └── UnicodeDecodeError
│   ├── AttributeError
│   ├── NameError
│   ├── RuntimeError
│   │   └── RecursionError
│   └── ... (其它内置异常)
├── KeyboardInterrupt
├── SystemExit
└── GeneratorExit
```

### 1.2 为什么 KeyboardInterrupt / SystemExit 单独分出去

`KeyboardInterrupt` 是用户按 Ctrl+C 触发的，`SystemExit` 是 `sys.exit()` 抛出的。它们都表示**外部要求终止程序**，而不是普通业务错误。

如果把它们挂在 `Exception` 下，那么一个简单的 `try: ... except Exception: pass` 就会悄悄吃掉用户的终止信号，导致 Ctrl+C 不响应——这是非常糟糕的体验。所以 Python 把它们直接挂在 `BaseException` 下，确保 `except Exception` 不会误捕。

::: tip 实用建议
除非你明确知道自己在做什么，否则不要写 `except BaseException`，更不要写裸 `except:`——它们会捕获 Ctrl+C，让你的程序"按不掉"。
:::

### 1.3 常见内置异常速查

| 异常 | 触发场景 |
|------|----------|
| `ValueError` | 值的形状/内容不对，如 `int("abc")` |
| `TypeError` | 类型不适用，如 `"a" + 1` |
| `KeyError` | 字典键不存在 |
| `IndexError` | 索引越界 |
| `AttributeError` | 对象没有该属性 |
| `NameError` | 变量名未定义 |
| `FileNotFoundError` | 文件不存在 |
| `PermissionError` | 权限不足 |
| `ZeroDivisionError` | 除以零 |
| `StopIteration` | 迭代器耗尽 |
| `RuntimeError` | 其它运行时错误 |
| `RecursionError` | 递归过深 |

可运行示例：

```python
# 常见内置异常触发示例
demos = [
    ("ValueError", lambda: int("abc")),
    ("TypeError",  lambda: "a" + 1),
    ("KeyError",   lambda: {}["missing"]),
    ("IndexError", lambda: [1, 2][10]),
    ("ZeroDivisionError", lambda: 1 / 0),
    ("AttributeError", lambda: object().no_such_attr),
]
for name, fn in demos:
    try:
        fn()
    except Exception as e:
        print(f"{name}: {e!r}")
# 预期输出（顺序可能因实现略有不同，但类型一致）：
# ValueError: ValueError("invalid literal for int() with base 10: 'abc'")
# TypeError: TypeError("can only concatenate str (not "int") to str")
# KeyError: KeyError('missing')
# IndexError: IndexError('list index out of range')
# ZeroDivisionError: ZeroDivisionError('division by zero')
# AttributeError: AttributeError("'object' object has no attribute 'no_such_attr'")
```

::: details 异常也是对象
异常对象除了 `args`，还带 `__traceback__`、`__cause__`、`__context__` 等属性。可以用 `traceback` 模块完整打印：
```python
import traceback
try:
    1 / 0
except ZeroDivisionError as e:
    print("args:", e.args)
    print("traceback:")
    traceback.print_exc()
```
:::

---

## 二、try/except/else/finally 完整语义

### 2.1 四段各自的执行时机

```python
def demo(return_in_try=False):
    print("= 进入函数 =")
    try:
        print("try: 执行业务")
        if return_in_try:
            return "try 返回"
        x = 1 / 0          # 触发异常
    except ZeroDivisionError as e:
        print(f"except: 捕获 {e!r}")
    else:
        print("else: try 没抛异常时才执行")
    finally:
        print("finally: 总会执行")
    print("= 函数结束 =")
    return "正常结束"

demo()
# 预期输出：
# = 进入函数 =
# try: 执行业务
# except: 捕获 ZeroDivisionError('division by zero')
# finally: 总会执行
# = 函数结束 =

demo(return_in_try=True)
# 预期输出：
# = 进入函数 =
# try: 执行业务
# finally: 总会执行      <- 即使 return，finally 仍执行
```

执行规则总结：

| 段 | 执行时机 |
|----|----------|
| `try` | 正常业务代码 |
| `except` | try 中抛出**匹配**的异常时 |
| `else` | try 完成**且没有抛出任何异常**时 |
| `finally` | **无论是否异常、是否 return、是否 raise，都执行** |

### 2.2 多个 except 的顺序

`except` 子句按顺序匹配，**具体异常必须写在通用异常之前**，否则永远不会被匹配（Python 会在编译时给出 `SyntaxWarning`）。

```python
def handle(e):
    try:
        raise e
    except ZeroDivisionError:      # 先具体
        print("零除")
    except ArithmeticError:        # 再父类
        print("算术")
    except Exception:              # 最后兜底
        print("其它")

handle(ZeroDivisionError("x"))   # 零除
handle(OverflowError("x"))       # 算术
handle(KeyError("x"))            # 其它
```

::: warning 反模式
下面写法里第二个 `except` 永远进不去，因为 `ZeroDivisionError` 是 `ArithmeticError` 子类，已经被前者接住：
```python
try:
    1 / 0
except ArithmeticError:
    print("永远走这里")
except ZeroDivisionError:        # 死代码
    print("永远到不了")
```
:::

### 2.3 except Exception as e 与异常对象

`as e` 把异常对象绑定到 `e`，可以读取 `args`、`__class__` 等：

```python
try:
    {"a": 1}["b"]
except KeyError as e:
    print("缺失键:", e.args[0])   # 缺失键: b
    print("字符串:", str(e))       # 字符串: 'b'
```

### 2.4 finally 一定会执行（即使 return）

`finally` 最大的用途是**资源释放**——文件、锁、连接等。它甚至会在 `return`、`break`、`continue` 之后执行：

```python
def f():
    try:
        return "try"
    finally:
        print("finally 仍执行")  # 会先打印，再返回 "try"

print(f())
# 输出：
# finally 仍执行
# try
```

::: warning finally 中的 return 会"吞掉"异常
```python
def swallow():
    try:
        raise ValueError("boom")
    finally:
        return "ignored"   # 异常被丢弃！
print(swallow())           # 输出 ignored，无异常抛出
```
千万别在 `finally` 里写 `return`——它会让 try 中的异常悄悄消失，是极难排查的 bug。
:::

---

## 三、异常链：raise ... from

### 3.1 显式链 `__cause__`

在底层异常之上重新抛出新异常时，用 `raise X from Y` 把原始异常链上：

```python
def load_config(path):
    try:
        with open(path) as f:
            return f.read()
    except FileNotFoundError as e:
        # 转换为业务异常，但保留原始异常链
        raise RuntimeError(f"配置文件 {path} 缺失") from e

try:
    load_config("missing.toml")
except RuntimeError as e:
    print("新异常:", e)
    print("原始原因:", e.__cause__)
    # 输出类似：
    # 新异常: 配置文件 missing.toml 缺失
    # 原始原因: [Errno 2] No such file or directory: 'missing.toml'
```

### 3.2 隐式链 `__context__`

在 `except` 块里抛出**新**异常（不用 `from`），Python 会自动把当前正在处理的异常存到新异常的 `__context__`，方便调试：

```python
try:
    try:
        1 / 0
    except ZeroDivisionError:
        raise ValueError("包装一下")
except ValueError as e:
    print("显式 cause:", e.__cause__)      # None
    print("隐式 context:", e.__context__)  # ZeroDivisionError(...)
```

### 3.3 `from None` 抑制链

有时候你确实想"屏蔽"原始异常（比如对外只暴露业务异常）：

```python
def parse(s):
    try:
        return int(s)
    except ValueError:
        raise ValueError("无效输入") from None   # 链被抑制

try:
    parse("abc")
except ValueError as e:
    print(e.__cause__)     # None
    print(e.__context__)   # 仍存在，但 traceback 打印时被抑制
```

::: tip
`raise X from None` 主要影响 traceback 显示：默认会打印 "The above exception was the direct cause..." / "During handling of..."，加 `from None` 后这两段被省略。
:::

---

## 四、raise 与自定义异常

### 4.1 主动 raise

```python
def set_age(age):
    if not isinstance(age, int):
        raise TypeError("age 必须是整数")
    if age < 0 or age > 150:
        raise ValueError(f"age 取值非法: {age}")
    return age

set_age("x")    # 抛 TypeError
set_age(200)    # 抛 ValueError
```

`raise` 还可以不带表达式，在 `except` 内"重新抛出"当前异常：

```python
try:
    1 / 0
except ZeroDivisionError:
    print("记录一下")
    raise          # 原样抛出，保留 traceback
```

### 4.2 自定义异常：继承谁

绝大多数情况下继承 `Exception` 即可。如果你想表达"这是一个 IO/查找/值错误"的细化，可以继承对应的具体异常，让上层 `except OSError` 之类的捕获也能匹配。

### 4.3 添加业务属性

优秀的自定义异常往往带结构化字段，便于上层处理与日志：

```python
class AppError(Exception):
    """应用异常基类"""
    def __init__(self, message: str, *, code: str = "APP_ERROR"):
        super().__init__(message)
        self.message = message
        self.code = code

    def __str__(self):
        return f"[{self.code}] {self.message}"


class NotFoundError(AppError):
    def __init__(self, resource: str, ident):
        super().__init__(f"{resource} 不存在: {ident}", code="NOT_FOUND")
        self.resource = resource
        self.ident = ident


class ValidationError(AppError):
    def __init__(self, field: str, reason: str):
        super().__init__(f"字段 {field} 校验失败: {reason}", code="VALIDATION")
        self.field = field
        self.reason = reason


# 使用
def get_user(user_id):
    if user_id < 0:
        raise ValidationError("user_id", "必须非负")
    if user_id != 42:
        raise NotFoundError("User", user_id)
    return {"id": 42, "name": "Tom"}


for uid in (-1, 1, 42):
    try:
        print(get_user(uid))
    except AppError as e:
        print(f"调用失败: {e}  (code={e.code})")
# 预期输出：
# 调用失败: [VALIDATION] 字段 user_id 校验失败: 必须非负  (code=VALIDATION)
# 调用失败: [NOT_FOUND] User 不存在: 1  (code=NOT_FOUND)
# {'id': 42, 'name': 'Tom'}
```

### 4.4 自定义异常层级设计案例

一个推荐的层级模式：

```
AppError (基类，所有业务异常的根)
├── ValidationError     # 入参校验
├── NotFoundError       # 资源未找到
├── AuthError           # 鉴权失败
│   ├── UnauthorizedError
│   └── ForbiddenError
├── ConflictError       # 资源冲突（如重复创建）
└── ExternalError       # 调用外部服务失败
    └── TimeoutError    # 已内置同名，可继承补充
```

设计原则：

1. **一个根类**：所有业务异常继承自 `AppError`，便于"捕获所有业务异常"。
2. **按错误性质分子类**：而不是按业务模块分。`NotFoundError` 可以是用户、订单、商品未找到——它们的处理逻辑（返回 404）是一致的。
3. **携带结构化字段**：`code` 给程序判断，`message` 给人看，业务字段（如 `resource`、`ident`）给上层做精细化处理。
4. **`__str__` 友好**：日志直接打异常对象就能看到关键信息。

::: tip 给异常加 code 的好处
程序可以根据 `code` 走不同分支（重试、降级、转人工），而 `message` 可以自由国际化而不影响逻辑。
:::

---

## 五、异常处理最佳实践

### 5.1 捕获具体异常，而非裸 except

```python
# 差：吞掉一切，连 Ctrl+C 都吃
try:
    do_something()
except:
    pass

# 差：吞掉所有 Exception，调试地狱
try:
    do_something()
except Exception:
    pass

# 好：捕获你预期会发生的具体异常
try:
    do_something()
except (FileNotFoundError, PermissionError) as e:
    log.warning("配置读取失败: %s", e)
    # 走默认配置
```

### 5.2 不要用异常做正常流程控制

```python
# 差：用异常判断键是否存在
try:
    v = d["k"]
except KeyError:
    v = None

# 好：用专用方法
v = d.get("k")
```

异常的创建与抛出是有开销的（采集 traceback），不应该用在每秒上万次的热路径上做"分支判断"。

### 5.3 记录日志后 raise

捕获后若仍要向上抛，最好先记日志，方便排查；不要"吞掉又不记"：

```python
import logging
logger = logging.getLogger(__name__)

try:
    data = fetch_remote()
except TimeoutError as e:
    logger.warning("远端超时，重试或降级: %s", e)
    raise   # 保留原 traceback 向上
```

### 5.4 EAFP vs LBYL

- **EAFP**（Easier to Ask Forgiveness than Permission，请求宽恕比许可容易）：先做，出错再处理。Python 推崇这种风格。
- **LBYL**（Look Before You Leap，三思而后行）：先检查，再做。

```python
# EAFP 风格（Pythonic）
try:
    value = data["user"]["name"]
except (KeyError, TypeError):
    value = "匿名"

# LBYL 风格
if isinstance(data, dict) and "user" in data and isinstance(data["user"], dict):
    value = data["user"].get("name", "匿名")
else:
    value = "匿名"
```

EAFP 的优势：

- 代码更短、更直接。
- 避免检查与使用之间的**竞态**（TOCTOU）：检查完到真正操作之间状态可能变了。
- 更符合 Python 鸭子类型哲学——只关心"能不能做"，不关心"是什么"。

LBYL 适合：检查成本低、操作成本高或不可回滚的场景（如删除文件前确认存在）。

---

## 六、assert 与 typing.assert_type

### 6.1 assert 的语义

`assert cond, msg` 等价于：

```python
if __debug__:
    if not cond:
        raise AssertionError(msg)
```

`__debug__` 默认为 `True`，但用 `python -O` 启动时会被设为 `False`，所有 `assert` 被编译期移除。

```python
def divide(a, b):
    assert b != 0, "除数不能为 0"   # 调试不变式
    return a / b
```

::: warning assert 不用于生产校验
因为 `python -O` 会把 assert 全部删掉，所以**不要**用 assert 做权限校验、参数校验等生产逻辑。这些应该用 `if ...: raise`。
:::

### 6.2 何时用 assert

- 函数内部的**不变式**（invariant）：开发者写代码时认定的"此时必然为真"的断言。
- 测试代码里断言结果。
- 调试期帮助尽早暴露 bug。

### 6.3 typing.assert_type（3.11+）

`typing.assert_type(val, T)` 是类型检查器（如 mypy）的断言：声明 `val` 此刻类型应为 `T`。它在运行时几乎无开销，只是检查并返回原值，主要给静态分析工具看：

```python
from typing import assert_type

def f(x: int | str) -> int | str:
    return x

v = f(1)
assert_type(v, int | str)   # 告诉 mypy：这里 v 的类型应是 int | str
```

它在运行时不抛异常，只是 mypy 等工具会在类型不匹配时报错。与普通 `assert` 完全不同——前者面向类型系统，后者面向运行时不变式。

---

## 七、文件 IO

### 7.1 open() 完整签名

```python
open(
    file,
    mode='r',
    buffering=-1,
    encoding=None,
    errors=None,
    newline=None,
    closefd=True,
    opener=None,
)
```

`mode` 由两部分字符拼成：

| 字符 | 含义 |
|------|------|
| `r` | 读（默认），文件必须存在 |
| `w` | 写，存在则**截断**，不存在则创建 |
| `a` | 追加，不存在则创建 |
| `x` | 独占创建，存在则抛 `FileExistsError` |
| `+` | 同时读写 |
| `b` | 二进制模式 |
| `t` | 文本模式（默认） |

常见组合：`'r'`、`'w'`、`'a'`、`'r+'`（读写不截断）、`'w+'`（读写并截断）、`'rb'`、`'wb'`、`'ab'` 等。

### 7.2 为什么必须显式 encoding='utf-8'

在 Windows 上，`open()` 默认编码是 `gbk`（或 `cp936`），Linux/macOS 是 `utf-8`。如果你写文件用默认编码，跨平台读就会乱码或抛 `UnicodeDecodeError`。

::: tip 永远显式写 encoding
文本文件读写**永远**显式指定 `encoding='utf-8'`，这是跨平台兼容的第一守则。
:::

```python
# 差
with open("data.txt") as f:    # Windows 上是 gbk
    text = f.read()

# 好
with open("data.txt", encoding="utf-8") as f:
    text = f.read()
```

### 7.3 newline 参数

读写文本时，Python 内部统一用 `\n` 表示换行。`newline` 控制如何翻译：

- `newline=None`（默认）：读时把 `\r\n`、`\r` 都翻译为 `\n`；写时把 `\n` 翻译为系统默认（Windows 上是 `\r\n`）。
- `newline=''`：读时不翻译，原样保留；写时不翻译。
- `newline='\n'` / `'\r\n'` / `'\r'`：写时把 `\n` 翻译为指定字符。

```python
# 跨平台保持 LF（避免 Windows 自动转 CRLF）
with open("log.txt", "w", encoding="utf-8", newline="\n") as f:
    f.write("line1\nline2\n")
```

### 7.4 with open() 自动关闭

`with` 语句保证离开代码块时调用 `f.close()`，即使发生异常也如此——这是文件操作的首选写法：

```python
with open("a.txt", encoding="utf-8") as f:
    data = f.read()
# 离开 with 块后 f 已关闭
```

等价于：

```python
f = open("a.txt", encoding="utf-8")
try:
    data = f.read()
finally:
    f.close()
```

### 7.5 读取：read / readline / readlines / 迭代

```python
# read()：一次读完，返回 str 或 bytes
with open("a.txt", encoding="utf-8") as f:
    text = f.read()        # 整个文件

# readline()：读一行
with open("a.txt", encoding="utf-8") as f:
    first = f.readline()   # 含结尾的 \n

# readlines()：返回所有行的列表
with open("a.txt", encoding="utf-8") as f:
    lines = f.readlines()  # ['line1\n', 'line2\n', ...]
```

**直接迭代文件对象**是最 Pythonic 的逐行读法，内存友好（一次只缓一行）：

```python
with open("big.log", encoding="utf-8", errors="replace") as f:
    for line in f:               # 逐行迭代
        if "ERROR" in line:
            print(line.rstrip())
```

::: details readlines 的隐患
`readlines()` 会把整个文件读进内存生成列表，处理几个 GB 的日志时会直接 OOM。大文件务必用迭代或分块读。
:::

### 7.6 写入：write / writelines / flush

```python
with open("out.txt", "w", encoding="utf-8") as f:
    f.write("第一行\n")
    f.writelines(["第二行\n", "第三行\n"])   # 不会自动加换行
```

`write` / `writelines` 写入的是**缓冲区**，不一定立刻落盘。`close()` 或离开 `with` 时会自动 flush。需要立刻落盘时手动 `f.flush()`（也可用 `open(..., buffering=0)` 但只对二进制有效）：

```python
f = open("progress.txt", "w", encoding="utf-8")
for i in range(5):
    f.write(f"step {i}\n")
    f.flush()      # 让外部进程能立刻看到
f.close()
```

### 7.7 大文件处理与内存对比

| 操作 | 内存占用 |
|------|----------|
| `f.read()` | 整个文件大小 |
| `f.readlines()` | 整个文件（按行存为 list） |
| `for line in f` | 单行缓冲，O(1) |
| `f.read(chunk_size)` 循环 | O(chunk_size) |

```python
# 统计大文件行数，内存友好
def count_lines(path):
    n = 0
    with open(path, encoding="utf-8") as f:
        for _ in f:
            n += 1
    return n

# 二进制分块读，计算 MD5
import hashlib
def md5_of(path, chunk=1 << 16):   # 64 KB
    h = hashlib.md5()
    with open(path, "rb") as f:
        while buf := f.read(chunk):   # 海象运算符 3.8+
            h.update(buf)
    return h.hexdigest()
```

---

## 八、pathlib：现代首选

`pathlib` 自 Python 3.4 引入，是面向对象的路径操作库，比 `os.path` 更直观、更 Pythonic，自 3.6 起被广泛推荐。

### 8.1 Path 创建与 / 运算符

```python
from pathlib import Path

p = Path("docs") / "backend" / "Python" / "07.md"
print(p)              # docs\backend\Python\07.md  (Windows)
print(Path("/usr") / "local" / "bin")   # /usr/local/bin

# 与字符串拼接
base = Path("data")
p = base / "2024" / "07.csv"
```

`/` 运算符会自动用当前系统的分隔符，跨平台无需操心。

### 8.2 路径属性

```python
p = Path("/home/lfange/blog/hello-world.md")
print(p.name)      # hello-world.md     文件名（含扩展）
print(p.stem)      # hello-world        文件名（不含扩展）
print(p.suffix)    # .md                扩展名
print(p.suffixes)  # ['.md']            所有扩展名
print(p.parent)    # /home/lfange/blog  父目录
print(p.parents[0])# /home/lfange/blog
print(p.parents[1])# /home/lfange
print(p.anchor)    # /                  盘符或根（Windows 上如 C:\）
print(p.parts)     # ('/', 'home', 'lfange', 'blog', 'hello-world.md')
print(p.as_posix())# /home/lfange/blog/hello-world.md  强制 posix 风格
```

### 8.3 一次性读写：read_text / read_bytes / write_text / write_bytes

```python
from pathlib import Path

p = Path("note.txt")
p.write_text("你好\n世界\n", encoding="utf-8")   # 一次写入
print(p.read_text(encoding="utf-8"))              # 一次读出
# 预期输出：
# 你好
# 世界

p.write_bytes(b"\x00\x01\x02")                    # 写二进制
print(p.read_bytes())                             # b'\x00\x01\x02'
```

::: tip 简洁但要看场景
`read_text` / `write_text` 内部仍是 `open + read/write + close`，适合小文件。大文件仍应 `open()` 后逐行处理。
:::

### 8.4 存在性判断与创建目录

```python
from pathlib import Path

p = Path("tmp/a/b/c")
p.mkdir(parents=True, exist_ok=True)   # 递归创建，已存在不报错
# 等价于 mkdir -p

print(p.exists())       # True
print(p.is_dir())       # True
print(p.is_file())      # False

# 删除空目录
p.rmdir()
# 删除文件
# p.unlink(missing_ok=True)   # 3.8+，不存在不报错
```

### 8.5 glob / rglob / iterdir

```python
from pathlib import Path

root = Path("docs")
# 当前层级匹配
for md in root.glob("*.md"):
    print(md)

# 递归匹配
for md in root.rglob("*.md"):
    print(md)

# 遍历目录下所有条目
for entry in root.iterdir():
    print(entry, "目录" if entry.is_dir() else "文件")
```

`rglob` 等价于 `glob("**/pattern")`。3.12 起 `glob`/`rglob` 的 `pattern` 参数支持 `case_sensitive` 与递归符号更明确的语义。

::: details 隐藏文件
`iterdir()` 会返回包括隐藏文件（以 `.` 开头）在内的所有条目。需要过滤时用 `if not entry.name.startswith('.')`。
:::

### 8.6 pathlib vs os.path 对比

| 操作 | os.path | pathlib |
|------|---------|---------|
| 拼接 | `os.path.join(a, b, c)` | `Path(a) / b / c` |
| 父目录 | `os.path.dirname(p)` | `Path(p).parent` |
| 文件名 | `os.path.basename(p)` | `Path(p).name` |
| 扩展名 | `os.path.splitext(p)[1]` | `Path(p).suffix` |
| 是否存在 | `os.path.exists(p)` | `Path(p).exists()` |
| 是否文件 | `os.path.isfile(p)` | `Path(p).is_file()` |
| 展开 ~ | `os.path.expanduser(p)` | `Path(p).expanduser()` |
| 绝对路径 | `os.path.abspath(p)` | `Path(p).resolve()` |
| 遍历目录 | `os.listdir(p)` | `Path(p).iterdir()` |
| 递归 glob | `glob.glob("**/*", recursive=True)` | `Path(p).rglob("*")` |

pathlib 把"路径"作为一个对象来组织操作，链式调用更流畅：

```python
# 找到所有 .py 文件，按修改时间排序，打印相对路径
from pathlib import Path
root = Path(".")
files = sorted(root.rglob("*.py"), key=lambda p: p.stat().st_mtime, reverse=True)
for f in files[:5]:
    print(f.relative_to(root))
```

新代码**优先用 pathlib**，老代码维护时可逐步迁移。

### 8.7 与 open() 配合

`Path` 对象可以直接传给 `open()`：

```python
from pathlib import Path

p = Path("config.toml")
with open(p, encoding="utf-8") as f:   # Path 直接作为参数
    text = f.read()
```

也可以用 `Path.open()` 方法：

```python
with p.open(encoding="utf-8") as f:
    ...
```

---

## 九、os 与 shutil

### 9.1 os.path 残留用法

老代码里常见的 `os.path` 写法仍可工作，理解即可：

```python
import os
os.path.join("a", "b", "c")
os.path.exists("x.txt")
os.path.isdir("x")
os.path.basename("/a/b/c.txt")
os.path.dirname("/a/b/c.txt")
os.path.abspath("c.txt")
os.path.expanduser("~/notes")
```

其它常用 `os` 函数：

```python
import os
os.getcwd()            # 当前工作目录
os.chdir("/tmp")       # 切换工作目录
os.getenv("HOME")      # 读取环境变量
os.environ["FOO"] = "1"  # 设置环境变量
os.remove("file.txt")  # 删除文件
os.rename("a", "b")    # 重命名/移动
os.stat("file.txt")    # 文件元信息
```

### 9.2 shutil：高阶文件操作

```python
import shutil

# 复制文件（保留权限）
shutil.copy("src.txt", "dst.txt")           # 复制内容+权限
shutil.copy2("src.txt", "dst.txt")          # 额外保留元信息（mtime 等）

# 复制目录树
shutil.copytree("project", "project_backup")

# 删除目录树（不可恢复，慎用）
shutil.rmtree("project_backup")

# 移动/重命名
shutil.move("a.txt", "sub/b.txt")

# 压缩
shutil.make_archive("backup", "zip", "project")   # 生成 backup.zip
shutil.unpack_archive("backup.zip", "extracted")
```

::: warning shutil.rmtree 是不可逆操作
`rmtree` 会递归删除整个目录树，且不进回收站。删除前务必校验路径，避免传错变量删错盘。
:::

---

## 十、序列化

### 10.1 json

`json` 是最通用的文本序列化格式，跨语言、可读、可 diff。

```python
import json

# 基本读写
data = {"name": "李雷", "age": 18, "tags": ["python", "go"]}

# 对象 <-> 字符串
s = json.dumps(data, ensure_ascii=False, indent=2)   # 序列化为字符串
print(s)
# 预期输出：
# {
#   "name": "李雷",
#   "age": 18,
#   "tags": [
#     "python",
#     "go"
#   ]
# }

obj = json.loads(s)                                  # 反序列化
print(obj["name"])   # 李雷

# 对象 <-> 文件
with open("data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

with open("data.json", encoding="utf-8") as f:
    obj2 = json.load(f)
```

::: tip 中文乱码的根源
`json.dumps` 默认 `ensure_ascii=True`，会把中文转成 `\uXXXX` 转义。**处理中文一定要 `ensure_ascii=False`**，并配合 `encoding='utf-8'` 写文件。
:::

### 10.2 自定义对象序列化

`json` 只能直接序列化基本类型（dict/list/str/int/float/bool/None）。要序列化 `datetime` 或自定义对象，需提供 `default` 钩子：

```python
import json
from datetime import datetime, date

class User:
    def __init__(self, name, birthday):
        self.name = name
        self.birthday = birthday

def default(o):
    if isinstance(o, (datetime, date)):
        return o.isoformat()
    if isinstance(o, User):
        return {"name": o.name, "birthday": o.birthday}
    raise TypeError(f"不可序列化: {type(o)}")

u = User("韩梅梅", date(2000, 1, 1))
s = json.dumps(u, default=default, ensure_ascii=False)
print(s)
# 预期输出：{"name": "韩梅梅", "birthday": "2000-01-01"}
```

也可以子类化 `JSONEncoder`：

```python
class MyEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        if isinstance(o, set):
            return sorted(o)
        return super().default(o)

print(json.dumps({"now": datetime(2024, 1, 1, 12, 0), "s": {3, 1, 2}},
                 cls=MyEncoder, ensure_ascii=False))
# {"now": "2024-01-01T12:00:00", "s": [1, 2, 3]}
```

反序列化要还原对象，用 `object_hook`：

```python
def as_user(d):
    if set(d.keys()) == {"name", "birthday"}:
        return User(d["name"], datetime.fromisoformat(d["birthday"]).date())
    return d

obj = json.loads('{"name": "韩梅梅", "birthday": "2000-01-01"}', object_hook=as_user)
print(obj.name, obj.birthday)   # 韩梅梅 2000-01-01
```

### 10.3 pickle：能序列化任意对象但有安全风险

```python
import pickle

class User:
    def __init__(self, name):
        self.name = name

u = User("Tom")
data = pickle.dumps(u)       # 字节流
u2 = pickle.loads(data)      # 还原
print(u2.name)               # Tom
```

`pickle` 能序列化几乎所有 Python 对象（包括自定义类实例、函数、闭包），但它有几个问题：

1. **不安全**：`pickle.loads` 可以执行任意代码。**绝对不要** `pickle.loads` 不可信来源的数据（如网络上传的文件）。
2. **Python 专有**：跨语言几乎不可读。
3. **版本耦合**：类定义变化后老 pickle 可能加载失败。

::: warning 安全红线
`pickle.loads(恶意数据)` 等价于 `eval(恶意代码)`。跨进程/跨网络传输一律用 JSON、MessagePack 等安全格式。
:::

| 维度 | json | pickle |
|------|------|--------|
| 格式 | 文本 | 二进制 |
| 跨语言 | 是 | 否 |
| 安全 | 是 | **否** |
| 支持类型 | 基本类型 | 几乎所有 |
| 可读性 | 好 | 差 |

### 10.4 csv

```python
import csv

# 写
rows = [["name", "age"], ["Tom", 18], ["Jerry", 20]]
with open("users.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerows(rows)

# 读
with open("users.csv", encoding="utf-8", newline="") as f:
    r = csv.reader(f)
    for row in r:
        print(row)
# 预期输出：
# ['name', 'age']
# ['Tom', '18']
# ['Jerry', '20']
```

`DictReader` / `DictWriter` 更友好，直接以字典形式处理：

```python
import csv

users = [{"name": "Tom", "age": 18}, {"name": "Jerry", "age": 20}]

with open("users.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["name", "age"])
    w.writeheader()
    w.writerows(users)

with open("users.csv", encoding="utf-8", newline="") as f:
    r = csv.DictReader(f)
    for row in r:
        print(row["name"], row["age"])
# 预期输出：
# Tom 18
# Jerry 20
```

::: tip 别忘 newline=""
`csv` 模块自己处理换行，`open` 时务必 `newline=""`，否则 Windows 上会多出空行。
:::

### 10.5 tomllib（3.11+ 内置）

TOML 是配置文件的事实标准（`pyproject.toml` 就是）。Python 3.11 起内置 `tomllib`（只读）：

```python
import tomllib

# 假设 config.toml 内容：
# [app]
# name = "demo"
# [app.db]
# url = "postgres://localhost/demo"

with open("config.toml", "rb") as f:   # 注意是 rb
    cfg = tomllib.load(f)
print(cfg["app"]["name"])          # demo
print(cfg["app"]["db"]["url"])     # postgres://localhost/demo

# 也可以从字符串解析
cfg2 = tomllib.loads('''
[server]
host = "0.0.0.0"
port = 8080
''')
print(cfg2["server"]["port"])      # 8080
```

写 TOML 需要第三方库 `tomli-w` 或 `tomlkit`：

```python
# pip install tomli-w
import tomli_w
data = {"app": {"name": "demo", "version": "1.0"}}
with open("out.toml", "wb") as f:
    tomli_w.dump(data, f)
```

### 10.6 configparser 读 ini

老式 `.ini` 文件用 `configparser`：

```python
import configparser

# 假设 config.ini：
# [db]
# host = localhost
# port = 5432

cp = configparser.ConfigParser()
cp.read("config.ini", encoding="utf-8")
print(cp["db"]["host"])              # localhost
print(cp.getint("db", "port"))       # 5432  (自动转 int)
```

新项目优先用 TOML，可读性与类型支持都更好。

---

## 十一、tempfile

`tempfile` 提供安全的临时文件与目录创建。

```python
import tempfile

# 1. 临时文件，离开 with 自动删除（匿名，文件名不可移植）
with tempfile.TemporaryFile(mode="w+", encoding="utf-8") as f:
    f.write("hello")
    f.seek(0)
    print(f.read())    # hello
# 离开 with 后文件已删除

# 2. 命名临时文件，可在文件系统里看到，默认离开 with 删除
with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8",
                                 suffix=".log", delete=True) as f:
    f.write("log line")
    print(f.name)      # 类似 C:\Users\xxx\AppData\Local\Temp\tmpXXX.log

# 3. 临时目录
with tempfile.TemporaryDirectory(prefix="myapp_") as d:
    print("临时目录:", d)
    # 在这里放置文件、跑子进程等
# 离开 with 后整个目录树被删除

# 4. mkdtemp：手动管理（不自动删除，需自己 rmtree）
import shutil
d = tempfile.mkdtemp()
try:
    # 使用 d
    pass
finally:
    shutil.rmtree(d, ignore_errors=True)
```

::: tip NamedTemporaryFile 的 delete=False
Windows 上 `delete=True` 时其它进程难以打开同一文件。若需要把临时文件交给子进程读，可用 `delete=False` 并在结束时手动 `unlink`。
:::

---

## 十二、实战案例

### 12.1 配置文件读写工具（原子替换 + 异常处理）

需求：读配置文件，不存在或格式错时返回默认值；写配置时保证原子性（中途崩溃不能让旧配置损坏）。

```python
"""config_io.py：基于 pathlib + json 的配置读写工具"""
from __future__ import annotations
import json
import os
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class ConfigError(Exception):
    """配置相关异常基类"""
    def __init__(self, message: str, *, path: Path | None = None):
        super().__init__(message)
        self.message = message
        self.path = path

    def __str__(self):
        if self.path:
            return f"[{self.__class__.__name__}] {self.message} (path={self.path})"
        return f"[{self.__class__.__name__}] {self.message}"


class ConfigReadError(ConfigError):
    pass


class ConfigWriteError(ConfigError):
    pass


def load_config(path: str | Path, default: Any | None = None) -> Any:
    """读取 JSON 配置；文件不存在或解析失败时返回 default。"""
    p = Path(path)
    if not p.exists():
        logger.info("配置文件不存在，使用默认值: %s", p)
        return default
    try:
        text = p.read_text(encoding="utf-8")
    except OSError as e:
        # 文件存在但读不了（权限、被占用等）→ 抛业务异常
        raise ConfigReadError(f"读取失败: {e}", path=p) from e
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.warning("配置文件 %s 格式错误，使用默认值: %s", p, e)
        return default


def save_config(path: str | Path, data: Any, *, indent: int = 2) -> None:
    """原子写入 JSON 配置：先写临时文件，再 rename 替换。

    优势：写一半崩溃时不会损坏旧文件（rename 在同分区是原子的）。
    """
    p = Path(path)
    try:
        p.parent.mkdir(parents=True, exist_ok=True)
    except OSError as e:
        raise ConfigWriteError(f"创建目录失败: {e}", path=p.parent) from e

    tmp = p.with_suffix(p.suffix + ".tmp")
    try:
        # 1. 写临时文件
        with tmp.open("w", encoding="utf-8", newline="\n") as f:
            json.dump(data, f, ensure_ascii=False, indent=indent)
            f.write("\n")
            f.flush()
            os.fsync(f.fileno())        # 强制落盘
        # 2. 原子替换（Windows 上 os.replace 等价于 MoveFileEx REPLACE_EXISTING）
        os.replace(tmp, p)
    except OSError as e:
        tmp.unlink(missing_ok=True)     # 清理残留临时文件
        raise ConfigWriteError(f"写入失败: {e}", path=p) from e


# 使用示例
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    cfg_path = Path("app_config.json")
    default_cfg = {"theme": "light", "lang": "zh-CN"}

    # 读：第一次文件不存在，返回默认
    cfg = load_config(cfg_path, default=default_cfg)
    print("当前配置:", cfg)

    # 改并保存
    cfg["theme"] = "dark"
    save_config(cfg_path, cfg)

    # 再读一次验证
    print("重读配置:", load_config(cfg_path))

    # 故意写入非法 JSON 触发降级
    cfg_path.write_text("{ 不是合法 JSON", encoding="utf-8")
    print("损坏后读:", load_config(cfg_path, default=default_cfg))

    # 清理
    cfg_path.unlink(missing_ok=True)
# 预期输出（日志部分略）：
# 当前配置: {'theme': 'light', 'lang': 'zh-CN'}
# 重读配置: {'theme': 'dark', 'lang': 'zh-CN'}
# 损坏后读: {'theme': 'light', 'lang': 'zh-CN'}
```

**关键点解析**：

1. **自定义异常层级**：`ConfigError` 是基类，带 `path` 字段；`ConfigReadError` / `ConfigWriteError` 区分场景。上层可 `except ConfigError` 统一处理，也可分别捕获。
2. **降级策略**：读不到 / 读出错 / 解析错时返回 `default`，而不是抛——读配置是"启动期"行为，应尽量宽容。但磁盘读不了（OSError）属于真异常，抛出来。
3. **原子写入**：先写 `.tmp` 再 `os.replace`。`os.replace` 在同分区是原子操作，即使写完 `.tmp` 后进程崩了，原配置依然完好。
4. **`os.fsync`**：保证数据真正写到磁盘而非停留在 OS 缓冲区，断电也不丢。
5. **临时文件清理**：失败时用 `unlink(missing_ok=True)` 清理 `.tmp`，避免下次启动看到垃圾文件。

### 12.2 日志文件分析脚本

需求：统计日志文件中 ERROR 行数，并按 IP（每行开头形如 `2024-07-20 12:00:00 192.168.1.10 ERROR xxx`）取 Top3。

```python
"""log_analyzer.py：大日志文件分析脚本"""
from __future__ import annotations
import re
import sys
from collections import Counter
from pathlib import Path

# 行格式示例：2024-07-20 12:00:00 192.168.1.10 ERROR 用户登录失败
LINE_RE = re.compile(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} (\d{1,3}(?:\.\d{1,3}){3}) (INFO|WARN|ERROR|DEBUG) ")


class LogFileError(Exception):
    """日志文件相关异常"""
    def __init__(self, message: str, *, path: Path | None = None):
        super().__init__(message)
        self.path = path

    def __str__(self):
        return f"[LogFileError] {self.message}" + (
            f" (path={self.path})" if self.path else "")


def analyze(path: str | Path) -> dict:
    """分析日志：返回 {'error_count': int, 'top3_ip': [(ip, count), ...]}。

    内存策略：逐行迭代，不一次性 readlines，可处理超大日志。
    """
    p = Path(path)
    if not p.is_file():
        raise LogFileError("日志文件不存在或不是文件", path=p)

    error_count = 0
    ip_counter: Counter[str] = Counter()
    total = 0
    bad = 0

    # errors='replace'：遇到非法 UTF-8 不抛异常，用 ? 占位
    with p.open(encoding="utf-8", errors="replace") as f:
        for lineno, line in enumerate(f, 1):
            total += 1
            m = LINE_RE.match(line)
            if not m:
                bad += 1
                continue
            ip, level = m.group(1), m.group(2)
            if level == "ERROR":
                error_count += 1
                ip_counter[ip] += 1

    return {
        "total_lines": total,
        "bad_lines": bad,
        "error_count": error_count,
        "top3_ip": ip_counter.most_common(3),
    }


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print(f"用法: python {Path(argv[0]).name} <日志文件>", file=sys.stderr)
        return 2
    try:
        report = analyze(argv[1])
    except LogFileError as e:
        print(f"分析失败: {e}", file=sys.stderr)
        return 1
    print(f"日志文件: {argv[1]}")
    print(f"总行数  : {report['total_lines']}")
    print(f"格式异常: {report['bad_lines']}")
    print(f"ERROR 行: {report['error_count']}")
    print("Top3 IP :")
    for ip, cnt in report["top3_ip"]:
        print(f"  {ip:<16} {cnt}")
    return 0


# 生成一份测试日志后跑分析
if __name__ == "__main__":
    sample = Path("demo.log")
    sample.write_text(
        "2024-07-20 10:00:00 192.168.1.10 INFO  启动\n"
        "2024-07-20 10:00:01 192.168.1.12 ERROR 登录失败\n"
        "2024-07-20 10:00:02 192.168.1.10 ERROR 连接超时\n"
        "2024-07-20 10:00:03 192.168.1.12 ERROR 登录失败\n"
        "2024-07-20 10:00:04 192.168.1.99 WARN  限流\n"
        "2024-07-20 10:00:05 10.0.0.5       ERROR 内部错误\n"
        "这一行格式不对，应该被跳过\n",
        encoding="utf-8",
    )
    main([__file__, str(sample)])
    sample.unlink(missing_ok=True)
# 预期输出：
# 日志文件: demo.log
# 总行数  : 7
# 格式异常: 1
# ERROR 行: 4
# Top3 IP :
#   192.168.1.12    2
#   192.168.1.10    1
#   10.0.0.5        1
```

**关键点解析**：

1. **逐行迭代**：`for line in f` 不预读全部到内存，处理 10 GB 日志也无压力。
2. **`errors='replace'`**：日志常有非 UTF-8 字符（被破坏、混编码），用替换模式避免中途崩溃。
3. **正则匹配 + 跳过坏行**：格式不对的行不抛异常，记数后继续，保证脚本"容错跑完"。
4. **Counter.most_common**：一行实现 TopN，比手写字典排序简洁。
5. **自定义异常**：把"文件不存在"这类问题封装成 `LogFileError`，调用方可用统一的 `except` 处理，错误信息也带 `path` 字段便于排查。
6. **`main` 返回退出码**：脚本风格，0 成功 / 1 业务失败 / 2 用法错误，便于 shell 集成。

---

## 小结

本篇核心回顾：

- **异常体系**：`BaseException` 下分 `Exception`（业务）与 `KeyboardInterrupt` / `SystemExit`（外部终止），后者不挂在 `Exception` 下是有意为之，确保 `except Exception` 不会误捕 Ctrl+C。
- **try/except/else/finally**：四段执行时机清晰；多个 `except` 具体在前；`finally` 必执行，**不要在 finally 里 return**。
- **异常链**：`raise X from Y` 显式 `__cause__`；隐式 `__context__`；`from None` 抑制链。
- **自定义异常**：继承 `Exception` 或具体类，带 `code` / `message` / 业务字段，按错误性质（NotFound / Validation / Auth…）分层而非按模块分。
- **最佳实践**：捕获具体异常、不用异常做流程控制、记日志后 raise、EAFP 优先。
- **文件 IO**：`open` 显式 `encoding='utf-8'`；`with` 自动关；大文件用迭代或分块读；`newline` 控制换行翻译。
- **pathlib**：面向对象的路径 API，`/` 拼接、`rglob` 递归查找、`read_text` / `write_text` 一次性读写，**新代码首选**。
- **os / shutil**：`os.path` 残留用法可读；`shutil` 提供复制目录树、压缩、移动等高阶操作。
- **序列化**：`json` 跨语言首选（中文用 `ensure_ascii=False`）；`pickle` 强大但**不安全**，不接不可信数据；`csv` 配合 `newline=""`；3.11+ 内置 `tomllib` 读 TOML。
- **tempfile**：`TemporaryFile` / `NamedTemporaryFile` / `TemporaryDirectory` 配合 `with` 自动清理。

下一篇我们将进入**函数进阶与装饰器**，继续打通 Python 进阶之路。
