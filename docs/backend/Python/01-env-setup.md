---
title: 环境配置与工程化
category:
  - 后端
tag:
  - Python
---

# Python 环境配置与工程化

> 本篇是《Python 从入门到精通》系列第 01 篇，面向已具备基础编程概念但首次系统学习 Python 的开发者。全文基于 **Python 3.12+**，所有命令与配置均可直接复制使用。

学习一门语言，第一步从来不是写 `Hello World`，而是把"开发环境—依赖管理—代码质量—项目结构"这条流水线打通。一个规范的工程化底座，能让你在后续学习语法、标准库、第三方框架时，把精力集中在语言本身，而不是反复折腾"为什么这个包装不上""为什么我跑得起来别人跑不起来"。本篇就带你一次性把这些"地基"打好。

---

## 1. Python 简介

### 1.1 语言定位

Python 是一门**解释型、动态强类型、垃圾回收**的高级通用编程语言，由 Guido van Rossum 于 1989 年圣诞假期开始设计，1991 年正式发布。它的核心设计哲学写在了 `import this`（The Zen of Python）里，强调**可读性、简洁、明确**。

```python
import this
# 输出 19 条 Python 之禅，其中最经典的两句：
# Beautiful is better than ugly.（优美胜于丑陋）
# Explicit is better than implicit.（显式胜于隐式）
```

几个关键术语需要分清：

- **解释型（Interpreted）**：Python 源码 `.py` 先被编译为字节码 `.pyc`（缓存于 `__pycache__`），再由解释器逐条执行字节码。它没有独立的"编译阶段"产出可执行二进制，但也不是逐行纯解释。
- **动态类型（Dynamically Typed）**：变量本身没有类型，**对象**才有类型；同一变量可先后绑定不同类型的对象。
- **强类型（Strongly Typed）**：不会做隐式类型转换，`"3" + 3` 会抛 `TypeError`，而不是像 JavaScript 那样得到 `"33"`。

```python
x = 1        # x 绑定到 int
x = "hello"  # 同一变量绑定到 str，合法
# "3" + 3    # TypeError: can only concatenate str (not "int") to str
```

### 1.2 应用领域

Python 的"万能胶水"属性使它几乎渗透到所有技术领域：

| 领域 | 代表库 / 框架 |
|------|---------------|
| Web 后端 | Django、Flask、FastAPI、Tornado |
| 数据分析 | NumPy、Pandas、Matplotlib |
| 机器学习 / AI | PyTorch、TensorFlow、scikit-learn、Hugging Face Transformers |
| 自动化运维 | Ansible、Fabric、paramiko |
| 爬虫 | requests、Scrapy、BeautifulSoup |
| 脚本与系统工具 | 标准库 os / sys / subprocess / pathlib |
| 桌面 GUI | PyQt、Tkinter、PySide |
| 科学计算 | SciPy、SymPy |

### 1.3 版本演进要点

Python 2 已于 2020 年正式停止维护，本系列全程基于 Python 3。近几个版本值得了解的新特性：

- **3.9（2020）**：字典合并运算符 `|`、类型注解可直接用 `list[int]` 而非 `List[int]`（`from __future__ import annotations` 在 3.7 引入，3.11 后逐步默认）。
- **3.10（2021）**：结构化模式匹配 `match/case`（类似 switch 但更强）、类型联合运算符 `int | str`。
- **3.11（2022）**：解释器速度比 3.10 提升 10%~60%（Faster CPython 项目）、异常组 `ExceptionGroup`、`TaskGroup`。
- **3.12（2023）**：更友好的错误提示（建议拼写错误）、PEP 695 类型参数语法 `def f[T](x: T) -> T:`、f-string 嵌套与多行表达式的限制解除。
- **3.13（2024）**：实验性自由线程（no-GIL）构建、JIT 默认关闭但已可用、移除大量已废弃 API。

::: tip 选哪个版本？
生产环境建议跟随 **3.12 LTS 风格的稳定版**；学习新特性可上 3.13。本系列代码在 3.12 上全部可运行。
:::

### 1.4 主流实现

- **CPython**：官方参考实现，用 C 编写，`.pyc` 字节码运行在 C 虚拟机上。绝大多数人使用的就是它，"Python" 默认指 CPython。
- **PyPy**：用 RPython 实现的 JIT 解释器，长期运行速度常快 3~5 倍，但 C 扩展兼容性偶有问题，适合纯 Python 长跑服务。
- **Jython**：运行在 JVM 上，可与 Java 互操作，目前几乎停止维护。
- **IronPython**：.NET 平台实现，可调用 C# 库。
- **GraalPy**：Oracle 出品，运行在 GraalVM 上，对标多语言互操作场景。

::: warning 注意
本系列所有示例默认在 CPython 上验证。涉及 C 扩展（如部分科学计算库）时，PyPy 可能不可用。
:::

---

## 2. 解释器安装

### 2.1 Windows

**方式一：官方安装包**

到 [python.org/downloads](https://www.python.org/downloads/) 下载 3.12+ 安装包，**务必勾选 "Add python.exe to PATH"**，再点 "Install Now"。安装完成后打开 PowerShell 验证：

```powershell
python --version
# Python 3.12.0

python -m pip --version
# pip 24.0 from ... (python 3.12)
```

**方式二：winget（推荐）**

Windows 10/11 自带的包管理器更省心：

```powershell
winget install Python.Python.3.12
```

::: tip 64 位优先
安装时选择 64-bit 版本（x86-64）。许多科学计算库（如 PyTorch）已不再提供 32-bit wheel。
:::

### 2.2 macOS

```bash
# 安装 Homebrew（如尚未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Python 3.12
brew install python@3.12

# 验证
python3.12 --version
# Python 3.12.0
```

也可以下载官方 `.pkg` 安装包，但 Homebrew 升级更方便。

### 2.3 Linux

Ubuntu / Debian 系：

```bash
sudo apt update
sudo apt install -y python3.12 python3.12-venv python3-pip
```

CentOS / RHEL 系：

```bash
sudo dnf install -y python3.12 python3-pip
```

发行版仓库的版本若偏低，需源码编译：

```bash
# 安装编译依赖
sudo apt install -y build-essential zlib1g-dev libncurses5-dev \
    libgdbm-dev libnss3-dev libssl-dev libreadline-dev libffi-dev \
    libsqlite3-dev wget curl

# 下载并编译
wget https://www.python.org/ftp/python/3.12.0/Python-3.12.0.tgz
tar -xf Python-3.12.0.tgz
cd Python-3.12.0
./configure --enable-optimizations --prefix=/usr/local/python3.12
make -j$(nproc)
sudo make altinstall   # 用 altinstall 避免覆盖系统 python3
```

::: warning 不要覆盖系统 Python
Linux 发行版的 `python3` 通常被系统工具（如 `apt`、`firewall-config`）依赖。覆盖升级会导致系统命令异常。永远用 `altinstall` 或用 pyenv 隔离管理。
:::

### 2.4 多版本管理：pyenv

`pyenv` 让你在同一台机器上安装并切换多个 Python 版本，原理是 shim（垫片）拦截 `python` 命令。

**安装 pyenv**

```bash
# macOS
brew install pyenv

# Linux（一键脚本）
curl https://pyenv.run | bash
```

配置 shell（以 bash 为例，写入 `~/.bashrc`）：

```bash
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init --path)"
eval "$(pyenv init -)"
```

**常用命令**

```bash
pyenv install --list          # 列出所有可装版本
pyenv install 3.12.0          # 安装指定版本
pyenv versions                # 查看已安装版本
pyenv global 3.12.0           # 设置全局默认
pyenv local 3.11.9            # 在当前目录设置 .python-version
pyenv shell 3.10.13           # 仅在当前 shell 生效
pyenv uninstall 3.10.13       # 卸载某版本
```

`pyenv local` 会在当前目录生成 `.python-version` 文件，进入该目录自动切换版本，非常适合多项目并行开发。

### 2.5 conda / miniconda

`conda` 是 Anaconda 公司出品的包与环境管理器，既能管 Python 版本也能管非 Python 依赖（如 CUDA、MKL）。

| 工具 | 适用场景 | 优势 | 劣势 |
|------|----------|------|------|
| pyenv + pip | 纯 Python 项目 | 轻量、生态原生 | 非 Python 依赖需手动装 |
| conda / miniconda | 数据科学、机器学习 | 一键装 NumPy/PyTorch 含二进制依赖 | 体积大、解析慢、与 pip 混用易冲突 |
| uv（见下文） | 现代纯 Python 项目 | 极快、兼容 pip 接口 | 较新，部分边缘场景尚在完善 |

::: tip 经验法则
做 ML / 数据科学优先 conda；做 Web / 后端 / 脚本优先 pyenv + pip 或 uv。两者不要在同一环境里混用，否则依赖解析容易打架。
:::

---

## 3. pip 与镜像源

### 3.1 pip 常用命令

`pip` 是 Python 官方包管理器，安装解释器时附带。

```bash
pip install requests                # 安装最新版
pip install requests==2.31.0        # 指定版本
pip install "requests>=2.28,<3"     # 版本范围
pip install -r requirements.txt     # 批量安装
pip install --upgrade requests      # 升级
pip uninstall requests              # 卸载
pip list                            # 已安装包列表
pip list --outdated                 # 可升级的包
pip show requests                   # 查看某包元信息
pip freeze > requirements.txt       # 导出当前环境依赖
pip cache purge                     # 清缓存
```

::: warning pip freeze 的局限
`pip freeze` 会把**所有间接依赖**也固化进 `requirements.txt`，导致文件又长又脆。生产环境更推荐用 `pip-tools` 或 `poetry` 生成锁文件（见第 5 节）。
:::

### 3.2 国内镜像源配置

由于 PyPI 官方源在国内访问慢，建议配置镜像。常用镜像：

- 清华：`https://pypi.tuna.tsinghua.edu.cn/simple`
- 阿里：`https://mirrors.aliyun.com/pypi/simple/`
- 中科大：`https://pypi.mirrors.ustc.edu.cn/simple/`
- 腾讯：`https://mirrors.cloud.tencent.com/pypi/simple/`

**Windows**（路径 `%APPDATA%\pip\pip.ini`，即 `C:\Users\<用户名>\AppData\Roaming\pip\pip.ini`）：

```ini
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
trusted-host = pypi.tuna.tsinghua.edu.cn
timeout = 120

[install]
# 可选：默认 --user 安装，避免污染系统 site-packages
# user = true
```

**Linux / macOS**（路径 `~/.pip/pip.conf` 或 `~/.config/pip/pip.conf`）：

```ini
[global]
index-url = https://pypi.tuna.tsinghua.edu.cn/simple
trusted-host = pypi.tuna.tsinghua.edu.cn
timeout = 120
```

也可单次命令临时指定：

```bash
pip install requests -i https://pypi.tuna.tsinghua.edu.cn/simple
```

### 3.3 `--user` 与系统级冲突

在没有虚拟环境的情况下：

- `pip install xxx`（无 `--user`、无虚拟环境）会装到系统 site-packages，可能需要管理员权限，且会影响所有项目。
- `pip install --user xxx` 装到用户级目录（`~/.local/lib/python3.12/site-packages`），无需管理员权限，但仍可能被多个项目共享。

::: warning PEP 668 与 "externally-managed-environment"
从 Python 3.11 起，部分 Linux 发行版（Debian 12+、Ubuntu 23.04+、Fedora 38+）在系统 Python 上启用了 PEP 668 保护，直接 `pip install` 会报错 `externally-managed-environment`。这是为了防止 pip 破坏系统包。**正确做法是使用虚拟环境**，或用 `pipx` 安装命令行工具，而不是绕过保护。
:::

---

## 4. 虚拟环境

### 4.1 为什么需要虚拟环境

设想你同时维护两个项目：A 用 Django 3.2，B 用 Django 4.2。如果都装到系统 Python，二者必有一个起不来。虚拟环境（Virtual Environment）为每个项目维护一份**独立的 site-packages**，让依赖互不干扰。

它解决三大问题：

1. **依赖隔离**：不同项目可用不同版本的同一库。
2. **避免污染系统 Python**：不动系统包，不会搞坏发行版工具。
3. **可重现性**：配合锁文件，任何人都能复刻完全一致的环境。

### 4.2 venv 用法

`venv` 是 Python 3.3+ 内置的虚拟环境模块，**无需额外安装**。

```bash
# 在项目根目录创建虚拟环境（约定俗成名为 .venv）
python -m venv .venv
```

各平台激活命令：

| 平台 | Shell | 激活命令 |
|------|-------|----------|
| Windows | PowerShell | `.venv\Scripts\Activate.ps1` |
| Windows | CMD | `.venv\Scripts\activate.bat` |
| Linux/macOS | bash/zsh | `source .venv/bin/activate` |
| Linux/macOS | fish | `source .venv/bin/activate.fish` |

激活后命令行前会出现 `(.venv)` 前缀，此时 `python`、`pip` 都指向虚拟环境内部：

```bash
# 激活后
which python
# /path/to/project/.venv/bin/python  (Linux/macOS)

pip install requests          # 只装到 .venv 内
python -c "import requests; print(requests.__version__)"
# 2.31.0

deactivate                   # 退出虚拟环境
```

::: details Windows PowerShell 执行策略报错
若激活时提示 `无法加载文件 ... 因为在此系统上禁止运行脚本`，执行一次：

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

之后再激活即可。这是 PowerShell 的安全策略，与 Python 无关。
:::

::: tip 把 `.venv` 加入 `.gitignore`
虚拟环境体积大且与平台相关，**永远不要**提交到 Git。在项目根目录 `.gitignore` 里加一行 `.venv/`。
:::

### 4.3 virtualenv vs venv

| 特性 | venv | virtualenv |
|------|------|------------|
| 是否内置 | 是（3.3+） | 否，需 `pip install virtualenv` |
| 速度 | 一般 | 更快 |
| 可指定基础 Python | 否（只能用当前 `python`） | 是（`virtualenv -p python3.11`） |
| pip 升级 | 不能升级 venv 自身 | 可独立升级 |
| 建议 | 大多数场景够用 | 需要更灵活指定基础解释器时用 |

日常开发推荐 `venv`，需要跨版本切换配合 `pyenv local` 即可。

---

## 5. 包管理进阶

### 5.1 pyproject.toml 与 PEP 518/621

`requirements.txt` 只是一行行包名，缺乏项目元数据。PEP 518 引入 `pyproject.toml` 作为**统一的 Python 项目配置入口**，PEP 621 又规范了其中 `[project]` 段的元数据字段。今天的主流工具（poetry、hatch、flit、pip、build、ruff、black……）都从 `pyproject.toml` 读取配置。

一个最小示例：

```toml
[project]
name = "myproj"
version = "0.1.0"
description = "My first Python project"
readme = "README.md"
requires-python = ">=3.12"
authors = [{ name = "Lfange", email = "me@example.com" }]
license = { text = "MIT" }
dependencies = [
    "requests>=2.31,<3",
    "rich>=13.0",
]

[project.optional-dependencies]
dev = [
    "ruff>=0.5",
    "black>=24.0",
    "mypy>=1.10",
    "pytest>=8.0",
]

[project.scripts]
myproj = "myproj.cli:main"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

字段说明：

- `dependencies`：运行时必需依赖。
- `optional-dependencies`：可选依赖组（如 `dev`、`test`、`docs`），用 `pip install ".[dev]"` 安装。
- `project.scripts`：声明命令行入口，安装后可直接执行 `myproj` 命令。
- `build-system`：告诉 `pip` 如何构建该项目的 wheel/sdist。

### 5.2 Poetry

[Poetry](https://python-poetry.org/) 是目前最流行的"一站式"依赖管理与打包工具，自带锁文件、版本解析、虚拟环境管理。

**安装**

```bash
# 官方推荐（隔离安装，避免污染系统 pip）
curl -sSL https://install.python-poetry.org | python3 -

# Windows PowerShell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

**核心命令**

```bash
poetry new myproj            # 创建新项目（生成标准结构）
poetry init                  # 在已有目录初始化
poetry add requests          # 添加依赖并写入 pyproject.toml + poetry.lock
poetry add pytest --group dev   # 添加到 dev 依赖组
poetry remove requests       # 移除依赖
poetry install               # 按 lock 文件安装全部依赖
poetry install --no-dev      # 不装开发依赖（生产部署用）
poetry update                # 升级可升级的依赖并更新 lock
poetry lock                  # 仅重新生成 lock，不安装
poetry shell                 # 进入虚拟环境 shell
poetry run python xxx.py     # 在虚拟环境中运行命令
poetry build                 # 构建 wheel + sdist
poetry publish               # 发布到 PyPI
```

::: details Poetry 生成的完整 pyproject.toml
```toml
[tool.poetry]
name = "myproj"
version = "0.1.0"
description = "My first Python project"
authors = ["Lfange <me@example.com>"]
readme = "README.md"

[tool.poetry.dependencies]
python = "^3.12"
requests = "^2.31"
rich = "^13.0"

[tool.poetry.group.dev.dependencies]
ruff = "^0.5"
black = "^24.0"
mypy = "^1.10"
pytest = "^8.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"

[tool.poetry.scripts]
myproj = "myproj.cli:main"
```
:::

`poetry.lock` 文件**必须提交到 Git**，它精确锁定每个直接依赖与间接依赖的版本与哈希，保证团队成员与 CI 环境完全一致。

### 5.3 uv

[uv](https://github.com/astral-sh/uv) 是 Astral 公司（ruff 的作者）用 Rust 写的极速 Python 包管理器，**接口兼容 pip**，速度比 pip 快 10~100 倍。

```bash
# 安装
curl -LsSf https://astral.sh/uv/install.sh | sh    # Linux/macOS
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"   # Windows

# 兼容 pip 接口（几乎可平替）
uv pip install requests
uv pip install -r requirements.txt
uv pip freeze

# 创建虚拟环境
uv venv                    # 默认在 .venv 创建
uv venv --python 3.12      # 指定 Python 版本

# uv 项目管理（类似 poetry）
uv init myproj
uv add requests
uv add --dev pytest
uv sync                    # 按 uv.lock 安装
uv run python xxx.py
uv build
```

::: tip uv 的核心优势
1. **极快**：并发表下载 + Rust 实现 + 全局缓存硬链接，10 倍起步。
2. **自带 Python 安装**：`uv python install 3.12` 不用 pyenv。
3. **兼容性**：`uv pip` 子命令可直接替换 `pip`，无需改造老项目。
4. **一体化**：项目管理 + 虚拟环境 + Python 版本管理 + 工具安装（`uv tool install`）一站式。

新项目建议直接上 `uv`；老项目可先用 `uv pip install -r requirements.txt` 享受速度红利，再逐步迁移到 `uv` 项目模式。
:::

### 5.4 pip-tools

[pip-tools](https://github.com/jazzband/pip-tools) 适合"我就想用 `requirements.txt`，但要解决依赖锁定问题"的场景。它由两个命令组成：

- `pip-compile`：把 `requirements.in`（仅直接依赖）编译成 `requirements.txt`（含全部锁定版本）。
- `pip-sync`：让当前环境**精确对齐** `requirements.txt`，多余包会被卸载。

```bash
pip install pip-tools

# requirements.in
echo "requests" > requirements.in
echo "rich" >> requirements.in

# 编译生成锁定文件
pip-compile requirements.in -o requirements.txt

# 让环境精确同步
pip-sync requirements.txt
```

`pip-tools` 适合对依赖"洁癖"的场景（如生产镜像构建），但日常开发用 poetry/uv 体验更好。

---

## 6. IDE 配置

### 6.1 VS Code

**必备扩展**

- **Python**（Microsoft 官方）：调试、IntelliSense、代码导航、测试管理。
- **Pylance**（Microsoft 官方）：基于 Pyright 的快速类型检查与补全，安装 Python 扩展会自动装。
- **Ruff**（Astral 官方）：格式化与 lint 一体化。
- **Black Formatter**（Microsoft）：如不用 ruff，可单独装。
- **isort**：import 排序（ruff 也能做）。
- **Jupyter**：编辑 `.ipynb` 笔记本。

**选择解释器**

`Ctrl+Shift+P` → `Python: Select Interpreter` → 选择项目 `.venv` 内的 Python。状态栏左下角会显示当前解释器路径。

**settings.json 关键项**

在项目根目录 `.vscode/settings.json`：

```json
{
  "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
  "python.analysis.typeCheckingMode": "basic",
  "python.analysis.autoImportCompletions": true,
  "python.analysis.inlayHints.variableTypes": true,
  "python.analysis.inlayHints.functionReturnTypes": true,
  "[python]": {
    "editor.defaultFormatter": "charliermarsh.ruff",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  },
  "ruff.lineLength": 100,
  "ruff.lint.enable": true,
  "ruff.format.enable": true
}
```

**launch.json 调试配置**

`.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Run current file",
      "type": "debugpy",
      "request": "launch",
      "program": "${file}",
      "console": "integratedTerminal",
      "justMyCode": true,
      "args": ["--name", "Alice", "--count", "3"]
    },
    {
      "name": "Pytest",
      "type": "debugpy",
      "request": "launch",
      "module": "pytest",
      "args": ["-v"],
      "justMyCode": false
    }
  ]
}
```

字段说明：

- `program: "${file}"`：运行当前打开的文件。
- `console: "integratedTerminal"`：用集成终端，能正确显示颜色与输入。
- `justMyCode: true`：只调试自己写的代码，不进入第三方库（提速、降噪）；调库源码时改成 `false`。
- `args`：传给脚本的命令行参数。
- `module`：等价于 `python -m pytest`，调试模块而非单文件。

在代码行号左侧点击设置**断点**，按 `F5` 启动调试，可查看变量、调用栈、监视表达式。

### 6.2 PyCharm

PyCharm 是 JetBrains 出品的商业 IDE，社区版免费、专业版付费。

- **配置解释器**：`File → Settings → Project → Python Interpreter`，点击齿轮 → `Add Interpreter → Add Local Interpreter` → 选择 `.venv` 内的 `python.exe` 或 `bin/python`。
- **运行配置**：右上角 → `Edit Configurations` → `+ Python`，填 Script path / Parameters / Working directory / Python interpreter。
- **调试**：点击行号设置断点 → 点绿色虫子图标启动 Debug。PyCharm 的调试器功能比 VS Code 更强（条件断点、求值监视、异步调用栈）。

### 6.3 Jupyter Notebook

Jupyter 适合**数据分析、探索式编程、教学演示**——代码按单元格（cell）执行，可保留中间输出与图表。

```bash
pip install jupyterlab
jupyter lab                # 启动浏览器 IDE

# 或在 VS Code 中直接打开 .ipynb 文件
```

::: warning 何时用 / 不用 Notebook
- 用：数据探索、可视化、机器学习实验、教学。
- 不用：写库、写后端服务、写需版本管理的复杂逻辑——Notebook 的执行顺序与单元格顺序不一定一致，难以调试与复用。
:::

---

## 7. 代码风格与质量工具链

### 7.1 black：无脑格式化

[black](https://github.com/psf/black) 是"不妥协的格式化器"——它不给你配置选项，按固定风格统一代码，团队不再为格式争论。

```bash
pip install black
black .                    # 格式化整个项目
black --check .            # 只检查不改
black --diff path/to/file.py
```

常用配置（`pyproject.toml`）：

```toml
[tool.black]
line-length = 100
target-version = ["py312"]
skip-string-normalization = false   # 不跳过字符串引号统一
```

`blue` 是 black 的一个分支，默认不强制双引号，但生态远不如 black 主流。

### 7.2 isort：import 排序

```bash
pip install isort
isort .
```

```toml
[tool.isort]
profile = "black"          # 与 black 兼容
line_length = 100
known_first_party = ["myproj"]
```

### 7.3 ruff：极速 linter + formatter

[ruff](https://github.com/astral-sh/uv) 用 Rust 实现，**一个工具替代 flake8 + pylint + isort + pyupgrade + autopep8**，速度比传统 linter 快 10~100 倍，已成为新项目事实标准。

```bash
pip install ruff
ruff check .               # lint
ruff check --fix .         # 自动修复
ruff format .              # 格式化（替代 black）
```

`pyproject.toml` 配置：

```toml
[tool.ruff]
line-length = 100
target-version = "py312"
src = ["src", "tests"]
exclude = [".venv", "build", "dist"]

[tool.ruff.lint]
# 启用规则集：E/W pycodestyle, F pyflakes, I isort, B bugbear,
# UP pyupgrade, SIM simplify, N pep8-naming, ANN annotations
select = ["E", "W", "F", "I", "B", "UP", "SIM", "N"]
ignore = ["E501"]   # 行长度交给 formatter 管

[tool.ruff.lint.per-file-ignores]
"tests/*" = ["ANN"]   # 测试文件不强制类型注解

[tool.ruff.format]
quote-style = "double"
indent-style = "space"
```

::: tip ruff vs black
`ruff format` 与 black 输出**几乎完全一致**，故二选一即可。推荐 ruff——一个工具搞定 lint + format，配置统一在 `pyproject.toml`。
:::

### 7.4 mypy：静态类型检查

Python 3.5+ 支持类型注解，但解释器**不强制检查**。mypy 是最主流的第三方类型检查器。

```python
def greet(name: str, times: int = 1) -> str:
    return f"hello {name}! " * times

greet("Alice", 3)         # OK
greet("Alice", "3")       # mypy 报错：Argument 2 has incompatible type "str"
```

`mypy.ini` 或 `pyproject.toml` 配置：

```toml
[tool.mypy]
python_version = "3.12"
strict = true                # 启用所有严格检查
warn_return_any = true
warn_unused_configs = true
disallow_untyped_defs = true
no_implicit_optional = true

[[tool.mypy.overrides]]
module = "tests.*"
disallow_untyped_defs = false   # 测试可宽松
```

`strict` 模式包含的检查：未类型注解的函数、隐式 Any、可选参数默认值、返回值类型等。新项目建议**从一开始就上 mypy strict**， retrofit（回炉）成本远高于一开始就遵守。

### 7.5 pre-commit：Git 钩子自动化

[pre-commit](https://pre-commit.com/) 在 `git commit` 前自动跑质量工具，不合格就拒绝提交。

```bash
pip install pre-commit
pre-commit install         # 安装 git hook
pre-commit run --all-files # 手动全量跑一次
```

`.pre-commit-config.yaml`：

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.5.6
    hooks:
      - id: ruff
        args: [--fix]
      - id: ruff-format

  - repo: https://github.com/pre-commit/mirrors-mypy
    rev: v1.11.0
    hooks:
      - id: mypy
        additional_dependencies: [types-requests]
        args: [--strict]

  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.6.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files
      - id: check-merge-conflict
      - id: debug-statements
```

配置完成后，每次 `git commit` 都会自动跑这些钩子；失败时 commit 被拒绝，强制你修复或 `git commit --no-verify` 跳过（不推荐）。

---

## 8. 运行 Python 程序的多种方式

### 8.1 直接运行脚本

```bash
python script.py
python script.py arg1 arg2
```

### 8.2 `python -m module`

```bash
python -m http.server 8000          # 启动静态文件服务器
python -m json.tool data.json       # 格式化 JSON
python -m venv .venv                # 创建虚拟环境
python -m pip install requests      # 装 pip 包
python -m pytest                    # 运行测试
```

::: tip 为什么用 `-m`？
直接 `python script.py` 时，脚本所在目录被加入 `sys.path[0]`，可能与脚本期望的模块导入路径不符。`python -m package.module` 则把**当前工作目录**加入 `sys.path`，并按包结构正确解析相对导入，更适合运行作为模块组织起来的代码。也避免 Windows 上 `.py` 文件关联被破坏导致 `pytest` 与 `python -m pytest` 行为不一致的问题。
:::

### 8.3 REPL 与 IPython

**REPL**（Read-Eval-Print Loop）即交互式解释器，命令行输入 `python` 进入：

```python
>>> 2 + 2
4
>>> [x * 2 for x in range(5)]
[0, 2, 4, 6, 8]
>>> import this
...
>>> exit()
```

**IPython** 是增强版 REPL，强烈推荐：

```bash
pip install ipython
ipython
```

它提供：

- `%magic` 命令：`%timeit`、`%run`、`%pwd`、`%hist` 等。
- `?` 查看文档：`sum?` 显示函数文档；`sum??` 显示源码。
- `!` 执行 shell：`!ls`、`!pip list`。
- 自动补全、语法高亮、历史回溯。

```python
In [1]: %timeit sum(range(1000))
3.2 µs ± 12 ns per loop (mean ± std. dev. of 7 runs, 100,000 loops each)

In [2]: len??
Signature: len(obj, /)
Docstring: Return the number of items in a container.
Source:   <built-in function len>

In [3]: !pip list | grep requests
requests            2.31.0
```

### 8.4 shebang 与可执行脚本

Linux/macOS 下，给脚本第一行加 shebang 并赋可执行权限，即可像命令一样调用：

```python
#!/usr/bin/env python3
"""可执行脚本示例。"""
import sys
print("argv:", sys.argv)
```

```bash
chmod +x demo.py
./demo.py hello
# argv: ['./demo.py', 'hello']
```

`#!/usr/bin/env python3` 比 `#!/usr/bin/python3` 更可移植——它通过 `env` 在 `PATH` 里找 `python3`，尊重虚拟环境与 pyenv 设置。

---

## 9. 第一个程序：命令行问候

把前面学到的"虚拟环境 + 项目结构 + argparse"串起来，写一个真正可用的命令行工具。

### 9.1 需求

接收 `--name` 参数（默认 `World`），可选 `--count` 次数（默认 1），打印对应次数的问候语；支持 `--upper` 大写输出。

### 9.2 代码

```python
#!/usr/bin/env python3
"""第一个 Python 程序：命令行问候工具。

用法示例：
    python hello.py --name Alice --count 3 --upper
"""
from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass


@dataclass
class GreetingConfig:
    """问候配置。"""
    name: str
    count: int
    upper: bool


def parse_args(argv: list[str] | None = None) -> GreetingConfig:
    """解析命令行参数。argv=None 时使用 sys.argv[1:]。"""
    parser = argparse.ArgumentParser(
        prog="hello",
        description="打印问候语",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument("--name", default="World", help="被问候者名字")
    parser.add_argument("--count", type=int, default=1, help="重复次数")
    parser.add_argument("--upper", action="store_true", help="是否大写")
    args = parser.parse_args(argv)

    if args.count <= 0:
        parser.error(f"--count 必须为正整数，得到 {args.count}")

    return GreetingConfig(name=args.name, count=args.count, upper=args.upper)


def greet(cfg: GreetingConfig) -> list[str]:
    """生成问候语列表。"""
    msg = f"Hello, {cfg.name}!"
    if cfg.upper:
        msg = msg.upper()
    return [msg] * cfg.count


def main(argv: list[str] | None = None) -> int:
    """入口函数，返回退出码。0 表示成功。"""
    cfg = parse_args(argv)
    for line in greet(cfg):
        print(line)
    return 0


if __name__ == "__main__":
    sys.exit(main())   # 用 main 的返回值作为进程退出码
```

### 9.3 运行

```bash
python hello.py
# Hello, World!

python hello.py --name Alice --count 3
# Hello, Alice!
# Hello, Alice!
# Hello, Alice!

python hello.py --name Bob --upper
# HELLO, BOB!

python hello.py --count 0
# usage: hello [-h] [--name NAME] [--count COUNT] [--upper]
# hello: error: --count 必须为正整数，得到 0

python hello.py --help
# usage: hello [-h] [--name NAME] [--count COUNT] [--upper]
#
# 打印问候语
#
# options:
#   -h, --help       show this help message and exit
#   --name NAME      被问候者名字 (default: World)
#   --count COUNT    重复次数 (default: 1)
#   --upper          是否大写 (default: False)
```

### 9.4 关键点解析

- `if __name__ == "__main__":`：仅当**直接运行**该文件时为真，被 `import` 时不执行。这是 Python 写可执行脚本的惯例，保证文件既能当脚本跑也能当模块导入。
- `argparse.ArgumentParser`：标准库命令行解析器，自动生成 `--help`、支持类型校验、子命令。后续讲 CLI 框架（click、typer）时你会看到它们都基于 argparse 或自实现类似机制。
- `dataclass`：3.7+ 引入，自动生成 `__init__`、`__repr__`、`__eq__`。比手写 `__init__` 简洁、比 dict 有类型提示。
- `list[str] | None`：3.10+ 类型语法，等价于 `Optional[List[str]]`。
- `sys.exit(main())`：把 `main` 的返回值作为进程退出码，便于 shell 脚本判断成功失败（`$?`）。

---

## 10. 推荐项目结构

一个标准 Python 库 / 应用项目推荐采用 **src layout**：

```
myproj/
├── .github/                    # CI/CD 配置
│   └── workflows/
│       └── ci.yml
├── .vscode/                    # VS Code 配置（可选）
│   ├── settings.json
│   └── launch.json
├── docs/                       # 文档源码
├── src/                        # 源码根目录（src layout）
│   └── myproj/
│       ├── __init__.py         # 包初始化，导出公开 API
│       ├── __main__.py         # 支持 python -m myproj 运行
│       ├── cli.py              # 命令行入口
│       ├── core.py             # 核心业务逻辑
│       └── utils.py            # 工具函数
├── tests/                      # 测试目录
│   ├── conftest.py             # pytest 公共 fixture
│   ├── unit/                   # 单元测试
│   │   └── test_core.py
│   └── integration/            # 集成测试
│       └── test_cli.py
├── .gitignore
├── .pre-commit-config.yaml
├── pyproject.toml              # 项目元数据 + 工具配置
├── README.md
├── LICENSE
└── CHANGELOG.md
```

### 10.1 为什么用 src layout

把源码放在 `src/` 而非项目根目录，初看多一层，实则有两大好处：

1. **强制"安装后测试"**：开发时 `pip install -e .` 把包以可编辑模式装进虚拟环境。如果包代码直接在根目录，测试可能误用当前目录的代码而非已安装版本，掩盖打包错误。src layout 强制你**必须安装**才能 import，更接近用户实际使用方式。
2. **避免意外 import**：项目根目录常放着 `conftest.py`、`setup.py`、文档等，如果根目录直接是包，`import myproj` 可能命中意想不到的同名文件。

### 10.2 关键文件作用

| 文件 / 目录 | 作用 |
|-------------|------|
| `pyproject.toml` | 项目元数据、依赖、工具配置（ruff/black/mypy/pytest）的唯一入口 |
| `src/myproj/__init__.py` | 包标识，定义公开 API `__all__` |
| `src/myproj/__main__.py` | 让 `python -m myproj` 能跑，内容通常 `from myproj.cli import main; main()` |
| `tests/conftest.py` | pytest 公共 fixture，被所有测试自动发现 |
| `.gitignore` | 至少忽略 `.venv/`、`__pycache__/`、`*.pyc`、`.pytest_cache/`、`.mypy_cache/`、`.ruff_cache/`、`dist/`、`build/`、`*.egg-info/` |
| `.pre-commit-config.yaml` | pre-commit 钩子配置 |
| `README.md` | 项目说明、安装、用法 |
| `LICENSE` | 开源协议（MIT/Apache-2.0/GPL 等） |
| `CHANGELOG.md` | 版本变更记录 |

### 10.3 推荐的 `.gitignore`

```gitignore
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
*.egg
*.egg-info/
dist/
build/
.eggs/

# 虚拟环境
.venv/
venv/
env/

# 测试 / lint 缓存
.pytest_cache/
.mypy_cache/
.ruff_cache/
.coverage
htmlcov/

# Jupyter
.ipynb_checkpoints/

# IDE
.idea/
.vscode/
!.vscode/settings.json
!.vscode/launch.json

# 系统
.DS_Store
Thumbs.db
```

### 10.4 推荐的 pytest 配置

`pyproject.toml`：

```toml
[tool.pytest.ini_options]
minversion = "8.0"
testpaths = ["tests"]
addopts = "-ra --strict-markers --strict-config"
markers = [
    "slow: 标记跑得慢的测试",
    "integration: 集成测试",
]
```

---

## 小结

本篇覆盖了从"装好一个 Python"到"建立可交付项目骨架"的全流程：

1. **解释器**：CPython 是默认选择，多版本用 pyenv，数据科学用 conda。
2. **包管理**：pip 是底层，poetry / uv 是上层一体化方案，pip-tools 适合洁癖场景。
3. **虚拟环境**：每项目一个 `.venv`，永不污染系统 Python。
4. **IDE**：VS Code 轻快、PyCharm 强大、Jupyter 适合数据探索。
5. **质量工具**：ruff（lint+format）+ mypy（类型）+ pre-commit（钩子）三件套，新项目从第一天就上。
6. **运行方式**：脚本、`-m` 模块、REPL/IPython、shebang 四种场景各有适用。
7. **项目结构**：src layout + `pyproject.toml` + `tests/` + `.gitignore` 是现代 Python 项目的事实标准。

把这些地基打牢后，从下一篇开始我们将正式进入语言本身：变量与数据类型、流程控制、函数、类与对象、装饰器、生成器、异步 IO……每一篇都建立在本篇的工程化底座之上。

::: tip 下一篇预告
《02 - 变量与数据类型》：深入 Python 的对象模型，讲清"一切皆对象"在内存层面的真实含义，覆盖 int / float / str / bytes / bool / NoneType / list / tuple / dict / set 的全部细节与常见陷阱。
:::
