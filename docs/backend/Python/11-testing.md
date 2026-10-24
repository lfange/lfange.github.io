---
title: 测试
category:
  - 后端
tag:
  - Python
---

# Python 测试：从入门到精通（pytest）

测试是软件工程里"工程质量"的最后一道防线。Python 生态里，`pytest` 几乎是事实标准——它比标准库 `unittest` 更简洁、更强大、生态更丰富。本篇面向"从入门到精通"，系统讲解 pytest 的核心机制（断言、fixture、参数化、mark、mock、覆盖率），并用一个"用户注册"实战把所有知识点串起来。

---

## 1. 为什么测试

### 1.1 测试的三大价值

1. **回归保护**：代码会变，行为不该变。测试是一道安全网——下次改动后跑一遍测试，能立刻发现"原本好的功能被改坏了"。
2. **重构信心**：没有测试的重构是"盲飞"。有测试撑腰，你才敢大刀阔斧地优化结构、抽函数、换实现。
3. **可执行的文档**：测试用例就是"代码如何使用"的最权威示例。看一个函数的测试，往往比看注释更快理解它的契约。

::: tip 测试不是银弹
测试不能证明代码"没有 bug"，只能证明"在某些用例下行为符合预期"。但即便如此，有测试的代码质量普遍远胜无测试的代码。
:::

### 1.2 测试金字塔

```
        /\
       /e2e\        # 少量：慢、脆、贵（浏览器/真实环境）
      /------\
     / integ \      # 适中：多模块协作
    /----------\
   /   unit     \   # 大量：快、稳、便宜
  /--------------\
```

- **单元测试**：测一个函数/类，隔离所有外部依赖。毫秒级，应有成百上千个。
- **集成测试**：测多个模块协作（如 service + repository + 真实数据库）。
- **端到端（E2E）**：从用户视角测整条链路（HTTP 请求到响应）。

底层越多越好，顶层越少越好。本篇主要聚焦单元测试与轻量集成测试。

### 1.3 unittest vs pytest

Python 标准库自带 `unittest`，为什么还要用 pytest？

| 维度 | unittest | pytest |
|------|----------|--------|
| 断言写法 | `self.assertEqual(a, b)` 等一堆方法 | 原生 `assert a == b` |
| 测试发现 | 需 `TestLoader` | 自动发现 `test_*.py` |
| fixture | `setUp/tearDown` 较死板 | 灵活的依赖注入 fixture |
| 参数化 | 需自己写循环或用第三方 | `@pytest.mark.parametrize` 原生支持 |
| 插件生态 | 一般 | 极其丰富（pytest-cov、pytest-mock、pytest-asyncio 等）|
| 失败信息 | 一般 | assert 魔法重写，显示中间值 |

```python
# unittest 风格
import unittest

class TestAdd(unittest.TestCase):
    def test_add(self):
        self.assertEqual(add(1, 2), 3)

# pytest 风格
def test_add():
    assert add(1, 2) == 3
```

结论：新项目直接上 pytest。本篇后续全部基于 pytest。

---

## 2. pytest 入门

### 2.1 安装

```bash
pip install pytest
# 推荐一并装上常用插件
pip install pytest-cov pytest-mock pytest-asyncio
```

::: tip Python 版本
本篇基于 Python 3.12+。如果你用的是 3.10 以下，部分类型注解语法（如 `X | Y`）需要调整。
:::

### 2.2 第一个测试

pytest 约定：**测试函数以 `test_` 开头，测试文件以 `test_` 开头**（或 `_test.py` 结尾）。

```python
# test_demo.py
def add(a, b):
    return a + b

def test_add_int():
    assert add(1, 2) == 3

def test_add_str():
    assert add("a", "b") == "ab"
```

运行：

```bash
pytest test_demo.py
# 预期输出：2 passed
```

### 2.3 assert 的"魔法重写"

pytest 会重写 assert 语句，失败时显示中间值，这是它最大的体验亮点之一。

```python
def test_dict():
    user = {"name": "lfange", "age": 18}
    assert user["age"] == 20
```

失败时 pytest 会输出类似：

```
E       assert 18 == 20
E        +  where 18 = {'name': 'lfange', 'age': 18}['age']
```

不像 unittest 只告诉你"不相等"，pytest 直接告诉你"哪个值、从哪来的、和什么比"。

### 2.4 常用运行参数

```bash
pytest                       # 跑所有测试
pytest -v                    # verbose，每个用例一行
pytest -q                    # quiet，只看摘要
pytest test_xxx.py           # 只跑指定文件
pytest tests/test_a.py::test_case1   # 只跑指定用例
pytest -k "add and not str"  # 用表达式过滤用例名
pytest -x                    # 遇到第一个失败就停
pytest --maxfail=2           # 累计 2 个失败就停
pytest --lf                  # 只跑上次失败的（--last-failed）
pytest --ff                  # 先跑上次失败的，再跑其它
pytest --tb=short            # 失败堆栈用短格式
pytest --tb=line             # 每个失败一行
pytest -s                    # 不捕获 print（让 print 输出可见）
pytest -m "slow"             # 只跑带 slow 标记的
```

::: details -k 表达式示例
```bash
pytest -k "add"              # 名字含 add
pytest -k "add or sub"       # 名字含 add 或 sub
pytest -k "not slow"         # 名字不含 slow
pytest -k "test_add and not test_add_str"
```
:::

---

## 3. 测试结构：AAA

AAA = Arrange-Act-Assert（准备-执行-断言）。一个测试只做这三件事，结构清晰。

```python
def test_discount():
    # Arrange：准备数据
    price = 100
    rate = 0.8
    # Act：调用被测函数
    result = discount(price, rate)
    # Assert：断言结果
    assert result == 80
```

::: tip 一个测试只测一件事
如果一个测试里塞了 5 个不相关的断言，失败时你只知道"这个测试挂了"，定位成本高。建议一个测试聚焦一个行为点，但有多个相关的"期望"可以放一起（比如同一函数不同字段的断言）。
:::

下面是被测函数 + 多个测试用例的典型结构：

```python
# src/calc.py
def is_prime(n: int) -> bool:
    if n < 2:
        return False
    for i in range(2, int(n ** 0.5) + 1):
        if n % i == 0:
            return False
    return True

# tests/test_calc.py
from src.calc import is_prime

def test_is_prime_negative():
    assert is_prime(-1) is False

def test_is_prime_zero_and_one():
    assert is_prime(0) is False
    assert is_prime(1) is False

def test_is_prime_small_primes():
    assert is_prime(2) is True
    assert is_prime(3) is True
    assert is_prime(5) is True

def test_is_prime_composites():
    assert is_prime(4) is False
    assert is_prime(9) is False
```

---

## 4. fixture：pytest 的灵魂

fixture 是 pytest 的依赖注入机制。它解决的问题是：**测试需要的前置数据/对象/环境怎么来**。相比 `setUp/tearDown`，fixture 可复用、可组合、可按需注入。

### 4.1 基础 fixture

用 `@pytest.fixture` 装饰一个函数，它的返回值会作为同名参数注入到测试里。

```python
import pytest

@pytest.fixture
def sample_list():
    return [1, 2, 3]

def test_length(sample_list):
    assert len(sample_list) == 3

def test_sum(sample_list):
    assert sum(sample_list) == 6
```

两个测试都拿到了 `[1, 2, 3]`，无需各自构造。

### 4.2 scope：控制 fixture 生命周期

| scope | 作用范围 | 创建时机 |
|-------|---------|---------|
| `function`（默认）| 每个测试函数 | 每个测试前各创建一次 |
| `class` | 每个测试类 | 每个类一次 |
| `module` | 每个 .py 文件 | 每个模块一次 |
| `session` | 整个测试会话 | 全程一次 |

```python
@pytest.fixture(scope="module")
def db_connection():
    print("\n[setup] 建库连接")
    conn = {"connected": True}
    yield conn
    print("\n[teardown] 关库连接")

def test_query_a(db_connection):
    assert db_connection["connected"] is True

def test_query_b(db_connection):
    assert db_connection["connected"] is True
```

运行 `pytest -s` 会看到 setup 只打印一次。

::: warning scope 不要乱用
默认 `function` 是最安全的——每个测试拿到全新对象，互不干扰。提升到 `module`/`session` 是为性能（如建库连接很慢），但必须确保 fixture 是无状态或可重置的，否则会产生测试间耦合。
:::

### 4.3 conftest.py：共享 fixture

把 fixture 写在 `conftest.py` 里，同目录及子目录的所有测试**无需 import** 即可使用。这是 pytest 的约定大于配置。

```
project/
├── conftest.py          # 全局 fixture
├── tests/
│   ├── conftest.py      # tests/ 范围 fixture
│   ├── test_a.py
│   └── sub/
│       ├── conftest.py  # 更细范围
│       └── test_b.py
```

```python
# tests/conftest.py
import pytest

@pytest.fixture
def user():
    return {"name": "lfange", "role": "admin"}

# tests/test_user.py
def test_user_name(user):       # 直接用，无需 import
    assert user["name"] == "lfange"
```

::: tip conftest.py 是分层的
子目录的 conftest.py 可以"覆盖"父目录的同名 fixture，也可以定义新的。pytest 按就近原则查找。
:::

### 4.4 yield fixture：setup 与 teardown

在 fixture 里用 `yield` 分隔前后阶段：`yield` 之前是 setup，之后是 teardown。

```python
@pytest.fixture
def tmp_file(tmp_path):
    # setup
    p = tmp_path / "data.txt"
    p.write_text("hello", encoding="utf-8")
    yield p                    # 把 p 交给测试
    # teardown
    p.unlink()                 # 测试结束后清理
```

::: details 内置 tmp_path
`tmp_path` 是 pytest 内置 fixture，每个测试拿到一个独立的临时目录（`pathlib.Path`），测试结束自动清理。需要写临时文件时优先用它，别自己 `os.makedirs`。
:::

### 4.5 autouse：自动应用

`autouse=True` 的 fixture 会被自动应用到所有测试，无需显式声明参数。常用于全局准备/清理。

```python
@pytest.fixture(autouse=True)
def reset_env(monkeypatch):
    # 每个测试前清掉某个环境变量
    monkeypatch.delenv("DEBUG", raising=False)
    yield
```

### 4.6 fixture 依赖其他 fixture

fixture 可以作为参数引用其它 fixture，形成可组合的依赖图。

```python
@pytest.fixture
def db():
    return {"users": []}

@pytest.fixture
def user_repo(db):
    return UserRepo(db)

@pytest.fixture
def user_service(user_repo):
    return UserService(user_repo)

def test_register(user_service):
    user_service.register("lfange")
    assert user_repo.find("lfange") is not None
```

pytest 会按依赖顺序自动创建。

### 4.7 fixture 参数化（indirect）

普通参数化把参数传给测试函数；`indirect=True` 把参数传给指定 fixture，让 fixture 根据参数构造对象。

```python
@pytest.fixture
def user(request):
    # request.param 接收参数化传入的值
    return {"name": request.param["name"], "age": request.param["age"]}

@pytest.mark.parametrize("user", [
    {"name": "a", "age": 18},
    {"name": "b", "age": 30},
], indirect=True)
def test_user_age(user):
    assert user["age"] >= 18
```

---

## 5. 参数化测试

`@pytest.mark.parametrize` 让一个测试函数跑多组数据，避免为相似用例复制粘贴。

### 5.1 基本用法

```python
@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
    (100, 200, 300),
])
def test_add(a, b, expected):
    assert add(a, b) == expected
```

一个测试函数会展开成 4 个用例。

### 5.2 ids：给用例起名字

```python
@pytest.mark.parametrize("n, expected", [
    (2, True),
    (3, True),
    (4, False),
], ids=["prime_2", "prime_3", "not_prime_4"])
def test_is_prime(n, expected):
    assert is_prime(n) == expected
```

不指定 ids 时，pytest 会用参数值拼名字，但中文/复杂对象显示不友好，建议显式指定。

### 5.3 多参数交叉

```python
@pytest.mark.parametrize("x", [1, 2])
@pytest.mark.parametrize("y", [10, 20])
def test_cross(x, y):
    # 会跑 4 组：(1,10) (1,20) (2,10) (2,20)
    assert x + y > 0
```

多个 parametrize 装饰器会做笛卡尔积。

---

## 6. 标记 mark

### 6.1 内置标记

```python
import pytest
import sys

@pytest.mark.skip(reason="暂时跳过，等数据库就绪")
def test_db_only():
    ...

@pytest.mark.skipif(sys.platform == "win32", reason="不在 Windows 上跑")
def test_unix_only():
    ...

@pytest.mark.xfail(reason="已知 bug，#123，待修复")
def test_known_bug():
    assert buggy_func() == "fixed"
```

- `skip`：直接跳过。
- `skipif`：条件成立才跳过。
- `xfail`：期望失败——如果失败，标记为"预期内"不算挂；如果意外通过了，标记为 `xpassed`（提示你该更新标记了）。

### 6.2 自定义 mark 与注册

```python
@pytest.mark.slow
def test_big_data():
    # 跑很久的测试
    ...

@pytest.mark.integration
def test_real_db():
    ...
```

默认 pytest 会警告 `unknown mark`。需要在配置文件注册：

```toml
# pyproject.toml
[tool.pytest.ini_options]
markers = [
    "slow: 标记慢测试，可用 -m 'not slow' 跳过",
    "integration: 需要真实外部依赖的集成测试",
]
```

或 `pytest.ini`：

```ini
[pytest]
markers =
    slow: 标记慢测试
    integration: 集成测试
```

注册后，可用 `-m` 选择运行：

```bash
pytest -m "slow"            # 只跑 slow
pytest -m "not slow"        # 跑除了 slow 的
pytest -m "slow and not integration"
```

::: tip CI 里分层跑
CI 默认跑 `pytest -m "not slow"`（快测），夜间或定时跑全量 `pytest`。这样开发反馈快、又能定期覆盖慢测试。
:::

---

## 7. mock：隔离外部依赖

单元测试的金科玉律：**不碰真实外部依赖**（网络、数据库、文件系统、时间）。mock 就是"用假对象替换真对象"的工具。

### 7.1 Mock 与 MagicMock

`unittest.mock.Mock` 是个"万能替身"——你访问它的任何属性、调用它的任何方法，它都不会报错，还会记录调用。

```python
from unittest.mock import Mock

m = Mock()
m.return_value = 42           # 调用 m() 返回 42
assert m() == 42
m.assert_called_once()        # 断言被调用过一次

# 配置方法返回值
m.get_user.return_value = {"name": "lfange"}
assert m.get_user(1) == {"name": "lfange"}
m.get_user.assert_called_with(1)
```

`side_effect` 更灵活：可以是异常、可迭代对象、或函数。

```python
m = Mock()
m.side_effect = ValueError("boom")   # 调用时抛异常
try:
    m()
except ValueError:
    print("caught")                  # caught

m2 = Mock()
m2.side_effect = [1, 2, 3]           # 依次返回 1, 2, 3
assert m2() == 1
assert m2() == 2
```

`MagicMock` 是 `Mock` 的增强版，支持魔术方法（`__len__`、`__iter__`、`__getitem__` 等），更常用。

### 7.2 常用断言

```python
m = Mock()
m(1, 2, key="v")
m(3)
m.assert_called()                    # 调用过
m.assert_called_twice() if False else None  # 没这个方法
m.call_count == 2                    # 调用了 2 次
m.assert_called_with(1, 2, key="v")  # 最后一次调用的参数
m.assert_any_call(3)                 # 历史上调用过 (3,)
m.assert_called_once()               # 仅调用一次（如果调了 2 次会报错）
```

### 7.3 patch：替换真实对象

`patch` 是 mock 最核心的工具。它临时把目标对象替换为 Mock，测试后自动还原。

有三种使用方式：

#### 方式一：装饰器

```python
from unittest.mock import patch

# 假设 src.notify 里有个 send_email 函数
@patch("src.notify.send_email")
def test_notify(mock_send):
    # 在测试期间，src.notify.send_email 被替换为 Mock
    mock_send.return_value = True
    notify_user("lfange")
    mock_send.assert_called_once_with("lfange")
```

::: warning patch 路径很关键
`@patch("src.notify.send_email")` 替换的是"src.notify 这个命名空间里的 send_email"。如果 `notify_user` 函数内部是 `from src.notify import send_email` 然后调用 `send_email(...)`，那要 patch 的是它**当前所在模块**看到的那个名字，可能要写 `@patch("src.service.send_email")`。原则：patch where it's looked up, not where it's defined。
:::

#### 方式二：上下文管理器

```python
def test_notify_ctx():
    with patch("src.notify.send_email") as mock_send:
        mock_send.return_value = True
        notify_user("lfange")
        mock_send.assert_called_once_with("lfange")
```

灵活控制作用域，适合只 patch 测试中某一段代码。

#### 方式三：手动 start/stop

```python
class TestX:
    def setup_method(self):
        self.patcher = patch("src.notify.send_email")
        self.mock_send = self.patcher.start()

    def teardown_method(self):
        self.patcher.stop()

    def test_a(self):
        self.mock_send.return_value = True
        ...
```

### 7.4 patch.object 与 patch.dict

`patch.object` patch 某个对象的属性/方法：

```python
class Clock:
    def now(self):
        import datetime
        return datetime.datetime.now()

def test_clock():
    with patch.object(Clock, "now", return_value="2026-01-01"):
        c = Clock()
        assert c.now() == "2026-01-01"
```

`patch.dict` 临时修改字典（常用于环境变量）：

```python
import os
from unittest.mock import patch

def test_with_env():
    with patch.dict(os.environ, {"DEBUG": "1", "NEW_VAR": "x"}):
        assert os.environ["DEBUG"] == "1"
    # 退出 with 后环境变量恢复原样
    assert "NEW_VAR" not in os.environ
```

### 7.5 pytest-mock：mocker fixture

`pytest-mock` 提供了一个 `mocker` fixture，封装了 patch 的常用操作，更简洁：

```python
# pip install pytest-mock
def test_notify(mocker):
    mock_send = mocker.patch("src.notify.send_email", return_value=True)
    notify_user("lfange")
    mock_send.assert_called_once_with("lfange")
```

`mocker.patch` 等价于 `unittest.mock.patch`，但少写一行 `with` 或装饰器，是 pytest 项目的首选。

### 7.6 实战 1：mock requests.get 测外部 API

被测代码：

```python
# src/github_stats.py
import requests

def get_star_count(repo: str) -> int:
    url = f"https://api.github.com/repos/{repo}"
    resp = requests.get(url, timeout=5)
    resp.raise_for_status()
    return resp.json()["stargazers_count"]
```

测试：

```python
# tests/test_github_stats.py
from unittest.mock import Mock, patch
from src.github_stats import get_star_count

@patch("src.github_stats.requests.get")
def test_get_star_count(mock_get):
    # 构造假响应
    fake_resp = Mock()
    fake_resp.json.return_value = {"stargazers_count": 42}
    fake_resp.raise_for_status = Mock()
    mock_get.return_value = fake_resp

    assert get_star_count("python/cpython") == 42
    mock_get.assert_called_once()
    args, kwargs = mock_get.call_args
    assert "python/cpython" in args[0]
    assert kwargs["timeout"] == 5

@patch("src.github_stats.requests.get")
def test_get_star_count_http_error(mock_get):
    from requests import HTTPError
    fake_resp = Mock()
    fake_resp.raise_for_status.side_effect = HTTPError("404")
    mock_get.return_value = fake_resp

    try:
        get_star_count("xxx/yyy")
        assert False, "应该抛 HTTPError"
    except HTTPError:
        pass
```

运行：

```bash
pytest tests/test_github_stats.py -v
# 预期：2 passed
```

### 7.7 实战 2：mock 时间

时间相关的逻辑最该 mock，否则测试不可重复。

```python
# src/campaign.py
import datetime

def is_active(start: str, end: str) -> bool:
    today = datetime.date.today()
    return datetime.date.fromisoformat(start) <= today <= datetime.date.fromisoformat(end)
```

测试：

```python
# tests/test_campaign.py
from unittest.mock import patch
import datetime
from src.campaign import is_active

@patch("src.campaign.datetime.date")
def test_is_active(mock_date):
    # 固定"今天"为 2026-07-20
    mock_date.today.return_value = datetime.date(2026, 7, 20)
    # fromisoformat 是类方法，需要保留原实现
    mock_date.fromisoformat = datetime.date.fromisoformat

    assert is_active("2026-07-01", "2026-07-31") is True
    assert is_active("2026-08-01", "2026-08-31") is False
    assert is_active("2026-07-20", "2026-07-20") is True
```

::: warning mock datetime 的坑
直接 `patch("datetime.date.today")` 会影响整个 Python 进程的 `datetime.date`，包括 pytest 内部。推荐 patch "被测模块里的 datetime"，而不是全局 datetime。即 `@patch("src.campaign.datetime.date")`，并保留 `fromisoformat` 等还需要真用的方法。
:::

---

## 8. 覆盖率

覆盖率回答"测试跑到了多少行代码"。`pytest-cov` 是标配工具。

### 8.1 基本用法

```bash
pip install pytest-cov

pytest --cov=src --cov-report=term-missing
# --cov=src         统计 src/ 包的覆盖率
# --cov-report=term-missing   终端输出，并标出未覆盖的行号

pytest --cov=src --cov-report=html
# 生成 htmlcov/ 目录，浏览器打开 index.html 可看逐行高亮
```

终端输出示例：

```
Name                    Stmts   Miss  Cover   Missing
-----------------------------------------------------
src/__init__.py             0      0   100%
src/calc.py                10      2    80%   12-13
src/campaign.py             8      0   100%
-----------------------------------------------------
TOTAL                      18      2    88%
```

### 8.2 分支覆盖率

行覆盖率有盲区——比如 `if x:` 只跑过 True 分支，行覆盖率显示 100%，但 False 分支从未测过。分支覆盖率更严格：

```bash
pytest --cov=src --cov-branch --cov-report=term-missing
```

### 8.3 配置文件 .coveragerc

```ini
# .coveragerc
[run]
source = src
branch = True
omit =
    */tests/*
    */__init__.py
    src/migrations/*

[report]
show_missing = True
skip_covered = False
fail_under = 80
exclude_lines =
    pragma: no cover
    if __name__ == .__main__.:
    raise NotImplementedError
```

`fail_under = 80` 表示覆盖率低于 80% 时命令以非零退出码结束，CI 可据此失败构建。

::: warning 不要盲目追 100%
100% 覆盖率不代表没有 bug——它只代表"每行都被执行过"，不代表"每个分支都被充分断言"。防御性 `if`、错误处理分支追 100% 性价比很低。一般项目 70-85% 是健康区间，关键模块可要求更高。
:::

---

## 9. 测试 Web 应用（FastAPI）

FastAPI 内置 `TestClient`（基于 httpx），无需启动真实服务器即可测 HTTP 接口。

```python
# src/app.py
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}")
def get_user(user_id: int):
    if user_id == 1:
        return {"id": 1, "name": "lfange"}
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="not found")
```

测试：

```python
# tests/test_app.py
import pytest
from fastapi.testclient import TestClient
from src.app import app

@pytest.fixture
def client():
    return TestClient(app)

def test_get_user_ok(client):
    resp = client.get("/users/1")
    assert resp.status_code == 200
    assert resp.json() == {"id": 1, "name": "lfange"}

def test_get_user_not_found(client):
    resp = client.get("/users/999")
    assert resp.status_code == 404
    assert resp.json()["detail"] == "not found"
```

::: tip 测试数据库
测带数据库的接口时，常用做法：
1. 用 fixture 在测试前创建一个独立的测试库（如 `test_xxx`），session 结束销毁。
2. 每个测试函数前 `BEGIN TRANSACTION`，测试后 `ROLLBACK`，保证数据互不污染。
3. 或用 SQLite 内存库替换生产库（通过 fixture 注入不同连接字符串）。
:::

```python
# 简化示例：用 SQLite 内存库做测试库
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.models import Base

@pytest.fixture(scope="session")
def engine():
    e = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(e)
    yield e
    e.dispose()

@pytest.fixture
def db_session(engine):
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.rollback()
    session.close()
```

---

## 10. 测试最佳实践

### 10.1 测行为，不测实现

```python
# 坏：测了内部实现，重构即坏
def test_stack_uses_list(self):
    s = Stack()
    assert isinstance(s._items, list)        # 内部细节

# 好：只测公开行为
def test_stack_push_pop():
    s = Stack()
    s.push(1)
    assert s.pop() == 1
    assert s.is_empty()
```

实现可以变（换成链表、换成 deque），但行为契约不变，测试不该跟着重写。

### 10.2 命名：test_行为_条件_期望

```python
def test_register_returns_false_when_email_exists():
    ...
def test_register_sends_welcome_email_on_success():
    ...
```

读名字就知道在测什么，失败时一眼定位。

### 10.3 一个测试只断言一件事

```python
# 坏
def test_user():
    assert user.name == "x"
    assert user.age == 18
    assert user.role == "admin"
    assert user.email_sent is True

# 好（或至少把强相关的合并）
def test_user_basic_fields():
    assert user.name == "x"
    assert user.age == 18

def test_user_sends_email():
    assert user.email_sent is True
```

### 10.4 避免测试间依赖

每个测试应能独立运行、任意顺序运行、重复运行结果一致。需要状态时用 fixture 隔离，不要让 `test_b` 依赖 `test_a` 留下的数据。

### 10.5 不要 mock 被测对象本身

```python
# 错误：你在测 Mock，不是在测 UserService
def test_register(mocker):
    service = mocker.MagicMock()
    service.register("x")
    service.register.assert_called_once()    # 这只验证了 mock 被调过
```

被测对象永远用真实实例，mock 的是它的**依赖**。

### 10.6 用 faker 造随机数据

手写测试数据又长又重复，`faker` 能生成看起来真实的随机数据，配合 `random.seed` 可复现。

```python
# pip install faker
from faker import Faker
fake = Faker()

def test_user_name():
    name = fake.name()
    assert len(name) > 0
```

::: tip 随机数据的两面性
随机数据能让测试更"接近真实"，但也可能让测试不可复现。建议在 fixture 里 `Faker.seed(0)` 固定种子，或用 property-based testing 库（如 hypothesis）做更严谨的随机测试。
:::

---

## 11. TDD 简介

TDD（Test-Driven Development，测试驱动开发）的核心是"红-绿-重构"循环：

1. **红**：先写一个失败的测试（描述你想要的功能）。
2. **绿**：用最简单的方式让测试通过（哪怕硬编码返回值）。
3. **重构**：在测试保护下改进代码结构。

```python
# 红：写测试
def test_fizzbuzz():
    assert fizzbuzz(1) == "1"
    assert fizzbuzz(3) == "Fizz"
    assert fizzbuzz(5) == "Buzz"
    assert fizzbuzz(15) == "FizzBuzz"

# 此时 fizzbuzz 还不存在，测试必然失败 → 红

# 绿：最小实现
def fizzbuzz(n):
    if n % 15 == 0: return "FizzBuzz"
    if n % 3 == 0: return "Fizz"
    if n % 5 == 0: return "Buzz"
    return str(n)

# 测试通过 → 绿

# 重构：抽函数、加类型、优化……测试保护你不犯错
```

::: details TDD 适合什么
- 适合：逻辑复杂、边界多、需求清晰的功能（算法、规则引擎、解析器）。
- 不太适合：UI 布局、探索性原型、需求频繁变化的原型阶段。
- 不必教条：可以先写实现再补测试，但要保证"有测试"。
:::

---

## 12. 实战：用户注册测试套件

把前面所有知识点串起来，给一个"用户注册"服务写完整测试。

### 12.1 被测代码

```python
# src/user_service.py
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str
    email: str
    age: int

class DuplicateEmailError(Exception):
    pass

class InvalidAgeError(Exception):
    pass

class EmailSender:
    def send_welcome(self, email: str) -> None:
        # 真实实现会调用 SMTP，测试时必须 mock
        ...

class UserRepo:
    def exists_by_email(self, email: str) -> bool:
        # 真实实现查数据库，测试时必须 mock
        ...

    def save(self, user: User) -> User:
        ...

class UserService:
    def __init__(self, repo: UserRepo, emailer: EmailSender):
        self.repo = repo
        self.emailer = emailer

    def register(self, name: str, email: str, age: int) -> User:
        if age < 0 or age > 150:
            raise InvalidAgeError(f"非法年龄: {age}")
        if self.repo.exists_by_email(email):
            raise DuplicateEmailError(f"邮箱已注册: {email}")
        user = User(id=0, name=name, email=email, age=age)
        saved = self.repo.save(user)
        self.emailer.send_welcome(email)
        return saved
```

### 12.2 测试代码

```python
# tests/test_user_service.py
import pytest
from unittest.mock import Mock
from src.user_service import (
    UserService, UserRepo, EmailSender,
    User, DuplicateEmailError, InvalidAgeError,
)

@pytest.fixture
def mock_repo():
    r = Mock(spec=UserRepo)
    r.exists_by_email.return_value = False
    r.save.side_effect = lambda u: User(id=1, name=u.name, email=u.email, age=u.age)
    return r

@pytest.fixture
def mock_emailer():
    return Mock(spec=EmailSender)

@pytest.fixture
def service(mock_repo, mock_emailer):
    return UserService(mock_repo, mock_emailer)

# 正常用例
def test_register_success(service, mock_repo, mock_emailer):
    user = service.register("lfange", "lf@example.com", 18)
    assert user.id == 1
    assert user.name == "lfange"
    assert user.email == "lf@example.com"
    mock_repo.exists_by_email.assert_called_once_with("lf@example.com")
    mock_repo.save.assert_called_once()
    mock_emailer.send_welcome.assert_called_once_with("lf@example.com")

# 参数化异常用例
@pytest.mark.parametrize("age", [-1, -100, 151, 200], ids=["-1", "-100", "151", "200"])
def test_register_invalid_age(service, age):
    with pytest.raises(InvalidAgeError):
        service.register("x", "x@example.com", age)

# 邮箱重复
def test_register_duplicate_email(service, mock_repo):
    mock_repo.exists_by_email.return_value = True
    with pytest.raises(DuplicateEmailError):
        service.register("x", "dup@example.com", 20)
    # 注意：重复时不应 save，也不应发邮件
    mock_repo.save.assert_not_called()
    # mock_emailer.send_welcome.assert_not_called()  # 同理

# 边界：年龄 0 与 150 应放行
@pytest.mark.parametrize("age", [0, 150], ids=["age_0", "age_150"])
def test_register_boundary_age(service, age):
    user = service.register("x", "x@example.com", age)
    assert user.age == age

# 邮件发送失败时不应影响注册结果（取决于业务，这里假设容错）
def test_register_email_failure_does_not_rollback(service, mock_emailer):
    mock_emailer.send_welcome.side_effect = RuntimeError("smtp down")
    # 注册本身应成功，邮件失败可由调用方处理
    user = service.register("x", "x@example.com", 20)
    assert user.id == 1

# 验证 save 拿到的对象的字段
def test_register_save_called_with_correct_user(service, mock_repo):
    service.register("lfange", "lf@example.com", 25)
    saved_user = mock_repo.save.call_args[0][0]
    assert saved_user.name == "lfange"
    assert saved_user.email == "lf@example.com"
    assert saved_user.age == 25
```

### 12.3 运行与输出

```bash
pytest tests/test_user_service.py -v --cov=src --cov-report=term-missing
```

预期输出（注释里说明）：

```
tests/test_user_service.py::test_register_success PASSED
tests/test_user_service.py::test_register_invalid_age[-1] PASSED
tests/test_user_service.py::test_register_invalid_age[-100] PASSED
tests/test_user_service.py::test_register_invalid_age[151] PASSED
tests/test_user_service.py::test_register_invalid_age[200] PASSED
tests/test_user_service.py::test_register_duplicate_email PASSED
tests/test_user_service.py::test_register_boundary_age[age_0] PASSED
tests/test_user_service.py::test_register_boundary_age[age_150] PASSED
tests/test_user_service.py::test_register_email_failure_does_not_rollback PASSED
tests/test_user_service.py::test_register_save_called_with_correct_user PASSED

---------- coverage: platform win32, python 3.12 ----------
Name                     Stmts   Miss  Cover   Missing
------------------------------------------------------
src/user_service.py         20      0   100%
------------------------------------------------------
TOTAL                       20      0   100%
========================= 10 passed in 0.12s ==========================
```

### 12.4 设计要点回顾

- **fixture 分层**：`mock_repo`/`mock_emailer` → `service`，测试只声明它要的层，依赖自动注入。
- **Mock(spec=Class)**：用 `spec` 限定 Mock 只能访问真实类有的方法，拼错方法名会立刻报错。
- **side_effect 用函数**：`save.side_effect = lambda u: User(id=1, ...)` 模拟"保存并回填 id"的真实行为。
- **参数化异常**：一个测试函数覆盖多个非法年龄，避免重复代码。
- **断言"不该发生的事"**：`assert_not_called()` 验证重复邮箱时没有 save，这是行为契约的一部分。
- **覆盖率 100% 但不骄傲**：这里 100% 行覆盖是因为代码很小；真实项目里要关注分支覆盖与边界。

::: tip 测试不止于"通过"
写完测试后，故意改坏被测代码（如把 `if age < 0` 改成 `if age < 1`），看测试是否报警。如果测试仍然全绿，说明测试写得不够好——这叫"突变测试"（mutation testing），手动做一遍能发现测试的真实质量。
:::

---

## 小结

本篇系统覆盖了 pytest 的核心能力：

- **断言与运行**：原生 `assert` + 魔法重写，丰富的命令行参数。
- **AAA 结构**：让测试可读、可维护。
- **fixture**：依赖注入、scope、conftest、yield、autouse、indirect——pytest 的灵魂。
- **参数化**：一份代码跑多组数据。
- **mark**：skip/xfail/自定义，配合 `-m` 分层运行。
- **mock**：Mock/MagicMock、patch 三种形式、patch.object/patch.dict、pytest-mock 的 mocker、mock 外部 API 与时间。
- **覆盖率**：pytest-cov、分支覆盖、配置文件、合理目标。
- **Web 测试**：FastAPI TestClient、测试数据库 fixture。
- **最佳实践**：测行为不测实现、命名、独立性、不 mock 被测对象、faker。
- **TDD**：红绿重构循环。
- **实战**：用户注册测试套件把所有知识点串起来。

测试是一项"长期复利"投资：今天多写 10 分钟测试，未来每次改动都省下 30 分钟调试。掌握 pytest，你就拥有了 Python 项目工程化的基石。下一篇我们将进入异步编程（asyncio）的世界。
