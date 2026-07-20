---
title: 并发编程
category:
  - 后端
tag:
  - Python
---

# 并发编程

并发是 Python 进阶路上必须翻过的一座山。和很多语言不同，Python 同时拥有三套并发方案：多线程 `threading`、多进程 `multiprocessing`、异步 `asyncio`。它们各自的适用场景、性能特征、心智模型差别很大，根本原因是 CPython 的 GIL（全局解释器锁）。本篇将围绕 GIL 把三套方案讲透，并给出选型方法与实战对比。

本篇基于 Python 3.12+，部分特性（如 `asyncio.TaskGroup`、`asyncio.timeout`、PEP 703 free-threaded）需要 3.11/3.13 才支持，会在用到处注明。

---

## 一、并发基础与选型

### 1.1 并发 vs 并行

- **并发（Concurrency）**：程序「结构」上能处理多个任务，任务可以在同一时段内交替推进。单核 CPU 也能并发——通过快速切换让多个任务「看起来」同时在跑。
- **并行（Parallelism）**：任务在「同一时刻」真正同时执行，必须有多个物理核心支持。

一个通俗的比喻：并发是一个厨师同时做三道菜（切菜、炖汤、烤面包交替进行），并行是三个厨师各做一道菜。并发关注「结构」与「调度」，并行关注「执行」与「硬件」。

### 1.2 IO 密集型 vs CPU 密集型

判断任务是 IO 密集还是 CPU 密集，是选型的第一步：

| 类型 | 特征 | 瓶颈 | 典型场景 |
|------|------|------|----------|
| IO 密集型 | 大部分时间在等待外部响应（网络、磁盘、数据库） | 等待时间 | 爬虫、API 调用、文件读写 |
| CPU 密集型 | 大部分时间在执行计算 | CPU 算力 | 数值计算、图像处理、压缩加密 |

- IO 密集型任务在等待时 CPU 空闲，适合用并发「填充」等待时间，让 CPU 去处理别的任务。
- CPU 密集型任务占满 CPU，并发带来的「切换」反而浪费，真正需要的是「并行」用上多核。

### 1.3 为什么 Python 有三套并发方案

```
IO 密集型       -> threading / asyncio
CPU 密集型      -> multiprocessing
混合任务        -> 组合使用（如 asyncio + ProcessPoolExecutor）
```

- **多线程**：上手简单，操作系统调度，IO 等待时自动切换。受 GIL 限制，CPU 密集并行无效。
- **多进程**：每个进程独立 Python 解释器和 GIL，能真正利用多核。代价是启动慢、内存大、数据要序列化。
- **asyncio**：单线程协作式调度，开销最小、可承载海量并发（数万协程）。要求代码全链路异步，一处阻塞全盘阻塞。

::: tip 选型一句话
「IO 密集选 asyncio（追求吞吐）或线程池（追求简单）；CPU 密集选进程池；阻塞老代码混入异步用 `asyncio.to_thread`。」
:::

---

## 二、GIL 全局解释器锁

GIL 是绕不开的话题，理解了 GIL，三套方案的边界自然清晰。

### 2.1 原理：为什么有 GIL

CPython 使用**引用计数**管理内存：每个对象内部有一个 `ob_refcnt` 计数器，引用加一就 `+1`，引用消失就 `-1`，归零时释放内存。

```python
import sys
a = [1, 2, 3]
print(sys.getrefcount(a))  # 2（a 本身 + getrefcount 的参数引用）
```

问题：如果多个线程同时修改同一个对象的引用计数，会出现竞态——两个线程同时读、各自加一再写回，结果只加了 1，导致内存泄漏或提前释放。

CPython 选择了最简单的方案：**一把全局锁（GIL）**，保证同一时刻只有一个线程在执行 Python 字节码。这样引用计数的增减天然串行，无需对每个对象加单独的锁。

::: details GIL 的本质
- GIL 是「解释器级别」的锁，保护的是 CPython 解释器自身的内部状态（首当其冲是引用计数）。
- GIL 不是语言特性，是 CPython 实现的产物。Jython、IronPython 没有 GIL，PyPy 也有 GIL。
- GIL 锁的是「Python 字节码执行权」，不是「整个进程」。
:::

### 2.2 GIL 对多线程的影响

#### CPU 密集型多线程：反而更慢

```python
import threading
import time

def cpu_work(n):
    total = 0
    for i in range(n):
        total += i * i

if __name__ == "__main__":
    N = 5_000_000
    # 串行
    t0 = time.perf_counter()
    cpu_work(N); cpu_work(N)
    t1 = time.perf_counter()
    print(f"串行: {t1 - t0:.3f}s")

    # 多线程
    t0 = time.perf_counter()
    threads = [threading.Thread(target=cpu_work, args=(N,)) for _ in range(2)]
    for t in threads: t.start()
    for t in threads: t.join()
    t1 = time.perf_counter()
    print(f"多线程: {t1 - t0:.3f}s")
```

预期输出（多核机器上）：

```
串行: 0.612s
多线程: 0.723s
```

多线程不仅没加速，还略慢——因为两个线程在争抢 GIL、上下文切换有开销。CPU 密集场景多线程在 Python 里是反模式。

#### IO 密集型多线程：有效

CPython 在执行阻塞 IO（`socket.recv`、`time.sleep`、文件 read 等）时**会主动释放 GIL**，让别的线程跑。所以 IO 密集场景多线程能提升吞吐。

```python
import threading
import time
import urllib.request

def fetch(url):
    urllib.request.urlopen(url).read()

urls = ["https://example.com"] * 5

t0 = time.perf_counter()
threads = [threading.Thread(target=fetch, args=(u,)) for u in urls]
for t in threads: t.start()
for t in threads: t.join()
print(f"多线程: {time.perf_counter() - t0:.3f}s")
# 预期：远小于串行 5 倍时间
```

::: tip GIL 释放的时机
- 阻塞 IO 系统调用前：`read`/`recv`/`sleep` 等会释放。
- 每执行若干条字节码（默认 5ms，3.2+ 改为时间片）检查一次，强制切换。
- C 扩展可手动 `Py_BEGIN_ALLOW_THREADS`/`Py_END_ALLOW_THREADS` 释放。
:::

### 2.3 C 扩展释放 GIL

像 `numpy`、`hashlib`（OpenSSL）、`regex` 等纯 C 实现的库，在执行密集计算时会通过 `Py_BEGIN_ALLOW_THREADS` 宏释放 GIL，从而让其他 Python 线程并行跑。

```python
import numpy as np
import threading
import time

def heavy():
    a = np.random.rand(2000, 2000)
    a @ a   # numpy 矩阵乘法会释放 GIL

if __name__ == "__main__":
    t0 = time.perf_counter()
    heavy(); heavy()
    print(f"串行: {time.perf_counter() - t0:.3f}s")

    t0 = time.perf_counter()
    ts = [threading.Thread(target=heavy) for _ in range(2)]
    for t in ts: t.start()
    for t in ts: t.join()
    print(f"多线程: {time.perf_counter() - t0:.3f}s")
    # 多核机器上多线程明显更快
```

这也是「为什么有些 Python 多线程 CPU 任务也能加速」的原因——计算在 C 层跑了。

### 2.4 GIL 的历史与未来

| 版本 | 改动 |
|------|------|
| 3.2 | GIL 切换从「字节码计数」改为「5ms 时间片」，减少 IO 线程饿死。 |
| 3.12 | PEP 684：**per-interpreter GIL**，每个子解释器有自己的 GIL。配合 `PEP 554` 子解释器模块，可在单进程内跑多解释器实现「真并行」。 |
| 3.13 | PEP 703：**实验性 free-threaded 构建**（no-GIL）。`python3.13t` 可禁用 GIL，对象改用 biased reference counting + 延迟回收。需自行编译或用官方 free-threaded 包。 |
| 3.14+ | free-threaded 进入稳定推进期，性能持续优化。 |

::: warning 当前建议
- 3.13 的 no-GIL 仍是实验性，生态库（numpy/Cython 等）需重新编译为 free-threaded 版本。
- 生产环境短期内仍以「多进程绕 GIL」为主，no-GIL 普及还需 2-3 年。
:::

---

## 三、多线程 threading

### 3.1 创建线程

#### 方式一：`Thread(target=...)`

```python
import threading
import time

def worker(name, delay=0.5):
    print(f"[{name}] 开始")
    time.sleep(delay)
    print(f"[{name}] 结束")

t = threading.Thread(target=worker, args=("A",), kwargs={"delay": 0.3})
t.start()
t.join()
print("主线程结束")
# 预期：
# [A] 开始
# [A] 结束
# 主线程结束
```

#### 方式二：继承 `Thread` 重写 `run`

```python
class MyThread(threading.Thread):
    def __init__(self, value):
        super().__init__()
        self.value = value

    def run(self):   # 重写 run，不要直接调用
        print(f"线程 {self.name} 跑 value={self.value}")

MyThread(42).start()
```

::: tip start 与 run 的区别
- `start()` 创建操作系统线程并调度 `run`，是异步的。
- 直接调 `run()` 是普通函数调用，**不会**新开线程。新手常犯的错。
:::

### 3.2 守护线程 `daemon=True`

守护线程在主线程退出时会被强制结束（不会等待它完成）。适合后台任务：心跳、监控、日志刷盘。

```python
import threading
import time

def heartbeat():
    while True:
        print("tick")
        time.sleep(1)

t = threading.Thread(target=heartbeat, daemon=True)
t.start()
time.sleep(3.2)
print("主线程结束，守护线程随之退出")
# 预期：打印 3 次 tick 后主线程结束，进程退出
```

### 3.3 线程安全与竞态条件

#### 竞态案例：多线程累加丢数

```python
import threading

counter = 0

def add_n(n):
    global counter
    for _ in range(n):
        counter += 1   # 不是原子操作！

if __name__ == "__main__":
    threads = [threading.Thread(target=add_n, args=(100_000,)) for _ in range(4)]
    for t in threads: t.start()
    for t in threads: t.join()
    print(counter)   # 期望 400000，实际：随机小于 400000
```

`counter += 1` 在字节码层面是 3 步：`LOAD counter` -> `LOAD_CONST 1` -> `BINARY_ADD` -> `STORE counter`。GIL 保证「单条字节码」原子，但 `+=` 是多条字节码，线程可能在 `LOAD` 之后被切走，于是多个线程读到同一个旧值，写回时彼此覆盖。

::: warning 为什么有 GIL 还要加锁
GIL 保证「同一时刻只有一个线程执行字节码」，但**不保证「一个复合操作」不被打断**。GIL 在每 5ms 或 IO 时会切换线程，所以「读-改-写」这种多字节码操作必须显式加锁。
:::

#### Lock 与 RLock

```python
import threading

counter = 0
lock = threading.Lock()

def add_safe(n):
    global counter
    for _ in range(n):
        with lock:        # 加锁-解锁成对，with 自动释放
            counter += 1

threads = [threading.Thread(target=add_safe, args=(100_000,)) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(counter)   # 400000，正确
```

- `Lock`：基础互斥锁，同一线程二次 `acquire` 会死锁。
- `RLock`（可重入锁）：同一线程可多次 `acquire`，需等次数相同的 `release` 才真正释放。适合递归调用、回调嵌套场景。

```python
rlock = threading.RLock()

def recursive(n):
    with rlock:
        if n > 0:
            print(n)
            recursive(n - 1)   # 同线程再次获取 RLock 不会死锁

recursive(3)
```

### 3.4 同步原语一览

#### Event：等待事件

```python
import threading
import time

event = threading.Event()

def waiter():
    print("等待信号...")
    event.wait()         # 阻塞直到 event.set()
    print("收到信号，继续")

threading.Thread(target=waiter).start()
time.sleep(1)
event.set()
```

#### Condition：生产-消费

```python
import threading

cond = threading.Condition()
items = []

def producer():
    with cond:
        items.append("data")
        cond.notify()      # 通知一个等待者

def consumer():
    with cond:
        while not items:
            cond.wait()    # 释放锁并等待 notify
        print("拿到", items.pop())

c = threading.Thread(target=consumer)
c.start()
threading.Thread(target=producer).start()
c.join()
```

#### Semaphore：限流

```python
import threading
import time

sem = threading.Semaphore(3)   # 同时最多 3 个线程进入

def task(i):
    with sem:
        print(f"任务 {i} 进入")
        time.sleep(0.5)

ts = [threading.Thread(target=task, args=(i,)) for i in range(8)]
for t in ts: t.start()
for t in ts: t.join()
# 预期：每次最多 3 个「任务 X 进入」同时出现
```

#### Barrier：齐集再走

```python
import threading

b = threading.Barrier(3)

def runner(i):
    print(f"{i} 到达栅栏")
    b.wait()
    print(f"{i} 起跑")

for i in range(3):
    threading.Thread(target=runner, args=(i,)).start()
# 三个线程都到达后，才会同时「起跑」
```

### 3.5 queue.Queue：生产者-消费者

`queue.Queue` 内部已加锁，是线程间传数据的首选。

```python
import threading
import queue
import time
import random

q = queue.Queue(maxsize=10)
DONE = object()   # 哨兵

def producer():
    for i in range(5):
        q.put(f"产品{i}")
        time.sleep(random.random() * 0.3)
    q.put(DONE)

def consumer():
    while True:
        item = q.get()
        if item is DONE:
            q.put(DONE)   # 通知其他消费者
            break
        print(f"消费: {item}")
        q.task_done()

p = threading.Thread(target=producer)
c1 = threading.Thread(target=consumer)
c2 = threading.Thread(target=consumer)
p.start(); c1.start(); c2.start()
p.join(); c1.join(); c2.join()
```

::: tip 队列家族
- `queue.Queue`：FIFO。
- `queue.LifoQueue`：LIFO（栈）。
- `queue.PriorityQueue`：按优先级出队。
- `queue.SimpleQueue`（3.7+）：更轻量，无 task_done/join。
:::

### 3.6 threading.local：线程局部变量

每个线程看到独立的副本，避免相互污染。

```python
import threading

local = threading.local()

def worker():
    local.user = threading.current_thread().name
    print(f"{threading.current_thread().name} 看到 local.user={local.user}")

for i in range(3):
    threading.Thread(target=worker, name=f"T{i}").start()
# 每个线程看到自己的 local.user，不会读到别的线程的值
```

### 3.7 ThreadPoolExecutor：现代线程池

`concurrent.futures.ThreadPoolExecutor` 是 3.2+ 推荐的线程池 API，比手动管理 `Thread` 更简洁。

```python
import concurrent.futures
import time
import random

def fetch(url):
    time.sleep(random.uniform(0.2, 0.6))
    return f"{url} -> 200 OK"

urls = ["https://a.com", "https://b.com", "https://c.com", "https://d.com"]

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
    # 方式 1：submit + as_completed（可分别处理异常，乱序返回）
    futures = [ex.submit(fetch, u) for u in urls]
    for f in concurrent.futures.as_completed(futures):
        try:
            print(f.result())
        except Exception as e:
            print("失败:", e)

    # 方式 2：map（顺序与入参一致，异常会延迟到取结果时抛出）
    for r in ex.map(fetch, urls):
        print(r)
```

::: details Future 常用 API
- `f.result(timeout=None)`：阻塞取结果。
- `f.exception()`：取异常（无异常返回 None）。
- `f.done()`：是否完成。
- `f.cancel()`：尝试取消（未开始才有效）。
- `f.add_done_callback(fn)`：完成时回调。
:::

**实战：并发请求多个 URL**

```python
import concurrent.futures
import urllib.request

URLS = [
    "https://example.com",
    "https://www.python.org",
    "https://httpbin.org/delay/1",
    "https://httpbin.org/status/200",
]

def head(url):
    with urllib.request.urlopen(url, timeout=5) as resp:
        return url, resp.status, len(resp.read())

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as ex:
    for f in concurrent.futures.as_completed([ex.submit(head, u) for u in URLS]):
        try:
            print(f.result())
        except Exception as e:
            print("失败:", e)
```

---

## 四、多进程 multiprocessing

### 4.1 为何用多进程

每个进程有独立的 Python 解释器和 GIL，所以多进程能**真正并行**执行 Python 字节码，是绕开 GIL 利用多核的唯一原生方案。代价是：

- 启动开销大（每进程约 10-50ms + 数十 MB 内存）。
- 进程间数据必须 `pickle` 序列化，大对象传输昂贵。
- Windows 下需要 `if __name__ == "__main__"` 守卫（因为 Windows 用 spawn 方式重新 import 主模块）。

### 4.2 Process 与 Pool

#### Process

```python
import multiprocessing as mp
import os

def work(x):
    print(f"pid={os.getpid()} 处理 {x}")
    return x * x

if __name__ == "__main__":
    p = mp.Process(target=work, args=(10,))
    p.start()
    p.join()
    print("主进程结束")
```

#### Pool（推荐）

```python
import multiprocessing as mp

def square(x):
    return x * x

if __name__ == "__main__":
    data = list(range(10))

    with mp.Pool(processes=4) as pool:
        # map：阻塞，顺序返回
        print(pool.map(square, data))

        # starmap：参数解包，适合多参数函数
        def add(a, b): return a + b
        print(pool.starmap(add, [(1, 2), (3, 4), (5, 6)]))

        # apply_async：异步提交，返回 AsyncResult
        r = pool.apply_async(square, (100,))
        print(r.get(timeout=5))   # 10000
```

### 4.3 进程间通信

#### Queue / Pipe

```python
import multiprocessing as mp

def producer(q):
    for i in range(5):
        q.put(i)
    q.put(None)   # 结束信号

def consumer(q):
    while True:
        item = q.get()
        if item is None: break
        print("消费:", item)

if __name__ == "__main__":
    q = mp.Queue(maxsize=10)
    p1 = mp.Process(target=producer, args=(q,))
    p2 = mp.Process(target=consumer, args=(q,))
    p1.start(); p2.start()
    p1.join(); p2.join()
```

#### 共享内存 Value / Array

```python
import multiprocessing as mp

def add_to(counter):
    for _ in range(10000):
        with counter.get_lock():   # Value 自带锁
            counter.value += 1

if __name__ == "__main__":
    counter = mp.Value("i", 0)   # 'i' 表示 int
    ps = [mp.Process(target=add_to, args=(counter,)) for _ in range(4)]
    for p in ps: p.start()
    for p in ps: p.join()
    print(counter.value)   # 40000
```

#### Manager 代理对象（跨进程 dict/list）

`Manager` 启动一个独立进程，代理 dict/list 等，开销比 Value/Array 大但更灵活。

```python
import multiprocessing as mp

def worker(d, key):
    d[key] = f"由进程 {mp.current_process().name} 写入"

if __name__ == "__main__":
    with mp.Manager() as mgr:
        d = mgr.dict()
        ps = [mp.Process(target=worker, args=(d, i)) for i in range(3)]
        for p in ps: p.start()
        for p in ps: p.join()
        print(dict(d))   # {0: ..., 1: ..., 2: ...}
```

### 4.4 ProcessPoolExecutor

与 `ThreadPoolExecutor` API 一致，便于切换。

```python
import concurrent.futures

def fib(n):
    if n < 2: return n
    a, b = 0, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b

if __name__ == "__main__":
    nums = [35, 36, 37, 38, 39]
    with concurrent.futures.ProcessPoolExecutor() as ex:
        for n, r in zip(nums, ex.map(fib, nums)):
            print(f"fib({n})={r}")
```

::: warning 进程池注意事项
- 函数和参数必须可 pickle（lambda、闭包、嵌套函数不行）。
- 进程数默认等于 CPU 逻辑核心数，`max_workers` 可调。
- 大数据传递会被序列化两次（入参与返回），尽量传索引或用共享内存。
:::

### 4.5 实战：多进程计算平方和对比

```python
import multiprocessing as mp
import time
import random

def heavy_sum(n):
    s = 0
    for i in range(n):
        s += i * i
    return s

if __name__ == "__main__":
    N = 5_000_000
    sizes = [N] * 8

    # 串行
    t0 = time.perf_counter()
    s1 = sum(heavy_sum(n) for n in sizes)
    print(f"串行: {time.perf_counter() - t0:.3f}s, sum={s1}")

    # 并行
    t0 = time.perf_counter()
    with mp.Pool() as pool:
        results = pool.map(heavy_sum, sizes)
    s2 = sum(results)
    print(f"多进程: {time.perf_counter() - t0:.3f}s, sum={s2}")
```

8 核机器上的预期输出：

```
串行: 2.412s, sum=...
多进程: 0.538s, sum=...
```

接近 8 核线性加速。

---

## 五、asyncio 异步 IO（重点）

`asyncio` 是 Python 3.4+ 引入、3.7+ 稳定的异步并发框架。它用**单线程协作式调度**实现高并发，相比线程更轻量、相比多进程更适合海量 IO 任务。

### 5.1 协程与事件循环

#### async def 定义协程

```python
async def hello():
    print("hello")
    return 42
```

调用 `hello()` 不会执行它，而是返回一个**协程对象**：

```python
c = hello()
print(c)   # <coroutine object hello at 0x...>
```

要执行协程，必须用以下三种方式之一：

1. `await c`：在另一个协程里等待它完成。
2. `asyncio.create_task(c)`：把协程包装成 Task 交给事件循环调度。
3. `asyncio.run(c)`：在主线程启动事件循环跑顶层协程。

#### 事件循环 event loop

事件循环是 asyncio 的核心：它是一个无限循环，不断从「就绪队列」取任务执行，遇到 `await` 就挂起当前任务，调度别的就绪任务，等到 IO 完成再唤醒挂起的任务。

```python
import asyncio

async def main():
    print("开始")
    await asyncio.sleep(1)   # 让出控制权，1 秒后继续
    print("结束")

asyncio.run(main())   # 3.7+ 标准入口
```

::: tip asyncio.run 做了什么
1. 创建新事件循环。
2. 把 `main()` 协程包装成 Task 跑到完成。
3. 关闭循环、清理异步生成器。
4. 同一时刻一个线程只能有一个运行的 `asyncio.run`。
:::

### 5.2 awaitable 与 Task

凡是能 `await` 的对象叫 **awaitable**，包括三类：

- **coroutine**：`async def` 调用的产物。
- **Task**：`asyncio.create_task(coro)` 包装，被事件循环调度。
- **Future**：低层 awaitable，代表「未来某个时刻会有结果」，一般不直接用。

```python
import asyncio

async def work(n):
    await asyncio.sleep(0.5)
    return n * n

async def main():
    # 串行：两次 await 共 1 秒
    t0 = asyncio.get_event_loop().time()
    a = await work(2)
    b = await work(3)
    print(a, b, "耗时约", asyncio.get_event_loop().time() - t0, "s")

asyncio.run(main())
# 预期：4 9 耗时约 1.0s
```

### 5.3 并发调度：create_task / gather / TaskGroup

#### create_task：把协程提交给循环

```python
import asyncio
import time

async def work(n):
    await asyncio.sleep(0.5)
    return n * n

async def main():
    t0 = time.perf_counter()
    task1 = asyncio.create_task(work(2))   # 立即调度
    task2 = asyncio.create_task(work(3))
    a = await task1   # 等两个任务完成
    b = await task2
    print(a, b, "耗时约", f"{time.perf_counter() - t0:.3f}s")

asyncio.run(main())
# 预期：4 9 耗时约 0.5s（并发）
```

#### gather：批量并发

```python
import asyncio

async def work(n):
    await asyncio.sleep(0.3)
    return n * n

async def main():
    results = await asyncio.gather(work(1), work(2), work(3))
    print(results)   # [1, 4, 9]

    # 异常处理：return_exceptions=True 不抛
    async def boom():
        raise ValueError("x")
    results = await asyncio.gather(work(1), boom(), return_exceptions=True)
    print(results)   # [1, ValueError('x')]

asyncio.run(main())
```

#### TaskGroup：结构化并发（3.11+，推荐）

`TaskGroup` 是 3.11 引入的现代 API，相比 `gather` 有更好的错误传播与取消语义：

```python
import asyncio

async def work(n):
    await asyncio.sleep(0.3)
    return n * n

async def main():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(work(1))
        t2 = tg.create_task(work(2))
        t3 = tg.create_task(work(3))
    # 退出 with 时所有任务已结束；任一异常会取消其他任务并抛 ExceptionGroup
    print(t1.result(), t2.result(), t3.result())

asyncio.run(main())
```

::: warning TaskGroup vs gather
- `gather` 任一任务抛异常时，**默认**会等其它任务跑完，然后抛第一个异常，其他异常被吞。
- `TaskGroup` 任一任务抛异常，**立即取消**组内所有任务，所有异常汇总成 `ExceptionGroup` 抛出。
- 新代码推荐 `TaskGroup`，更安全、更结构化。
:::

#### wait_for / timeout

```python
import asyncio

async def slow():
    await asyncio.sleep(10)
    return "done"

async def main():
    # 3.11 之前
    try:
        result = await asyncio.wait_for(slow(), timeout=0.5)
    except asyncio.TimeoutError:
        print("超时了")

    # 3.11+ 推荐：asyncio.timeout
    try:
        async with asyncio.timeout(0.5):
            await slow()
    except TimeoutError:
        print("超时了 again")

asyncio.run(main())
```

### 5.4 真实异步 IO：aiohttp 并发请求

`requests` 是同步库，会阻塞事件循环。异步 HTTP 推荐 `aiohttp`：

```python
import asyncio
import aiohttp

async def fetch(session, url):
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
        text = await resp.text()
        return url, resp.status, len(text)

async def main():
    urls = [
        "https://example.com",
        "https://www.python.org",
        "https://httpbin.org/delay/1",
    ]
    async with aiohttp.ClientSession() as session:
        async with asyncio.TaskGroup() as tg:
            tasks = [tg.create_task(fetch(session, u)) for u in urls]
        for t in tasks:
            print(t.result())

asyncio.run(main())
```

::: tip 同步库不能直接 await
`requests.get()` 是普通函数，调用即阻塞当前线程，在协程里调用会把整个事件循环卡住。必须用 `aiohttp`/`httpx.AsyncClient`/`anyio` 等异步库。
:::

### 5.5 异步同步原语

asyncio 单线程协作式调度，**通常不需要锁**（因为协程只在 await 时切换）。但跨多个 await 的复合操作仍可能竞态，所以也提供了一套异步同步原语。

```python
import asyncio

# Semaphore：限流并发
sem = asyncio.Semaphore(3)

async def fetch(i):
    async with sem:
        print(f"开始 {i}")
        await asyncio.sleep(0.5)

async def main():
    async with asyncio.TaskGroup() as tg:
        for i in range(8):
            tg.create_task(fetch(i))

asyncio.run(main())
# 预期：每次最多 3 个「开始 X」同时出现
```

```python
# asyncio.Lock：保护跨 await 的临界区
lock = asyncio.Lock()

async def update_shared_state():
    async with lock:
        # 多个 await 的复合操作
        await asyncio.sleep(0.1)
```

```python
# asyncio.Queue：异步生产者-消费者
import asyncio

async def producer(q):
    for i in range(5):
        await q.put(i)
        await asyncio.sleep(0.1)
    await q.put(None)

async def consumer(q):
    while True:
        item = await q.get()
        if item is None: break
        print("消费:", item)
        q.task_done()

async def main():
    q = asyncio.Queue()
    async with asyncio.TaskGroup() as tg:
        tg.create_task(producer(q))
        tg.create_task(consumer(q))

asyncio.run(main())
```

### 5.6 异步上下文管理器与异步迭代

#### async with

```python
import asyncio

class AsyncTimer:
    async def __aenter__(self):
        self.t0 = asyncio.get_event_loop().time()
        print("进入")
        return self

    async def __aexit__(self, exc_type, exc, tb):
        print("退出，耗时", asyncio.get_event_loop().time() - self.t0)

async def main():
    async with AsyncTimer():
        await asyncio.sleep(0.3)

asyncio.run(main())
```

#### async for

```python
import asyncio

class AsyncRange:
    def __init__(self, n): self.n = n; self.i = 0
    def __aiter__(self): return self
    async def __anext__(self):
        if self.i >= self.n: raise StopAsyncIteration
        await asyncio.sleep(0.1)
        v = self.i; self.i += 1
        return v

async def main():
    async for x in AsyncRange(3):
        print(x)

asyncio.run(main())
```

### 5.7 在协程里跑阻塞代码

事件循环最怕「阻塞调用」——一次 `time.sleep(5)` 会让所有协程卡 5 秒。两种方案：

#### asyncio.to_thread（3.9+，推荐）

```python
import asyncio
import time

def blocking_io():
    time.sleep(2)   # 同步阻塞
    return "done"

async def main():
    # 把阻塞函数丢到线程池，事件循环不被卡
    result = await asyncio.to_thread(blocking_io)
    print(result)

asyncio.run(main())
```

#### run_in_executor（更底层）

```python
import asyncio
import concurrent.futures

def blocking():
    import time; time.sleep(1); return "ok"

async def main():
    loop = asyncio.get_running_loop()
    # 用默认 ThreadPoolExecutor
    r = await loop.run_in_executor(None, blocking)
    print(r)
    # 用自定义 ProcessPoolExecutor 跑 CPU 密集
    with concurrent.futures.ProcessPoolExecutor() as ex:
        r = await loop.run_in_executor(ex, blocking)
        print(r)

asyncio.run(main())
```

::: tip 全链路异步原则
asyncio 协程切换是**协作式**的——只有协程主动 `await` 才会让出 CPU。一旦某处调用同步阻塞函数（`time.sleep`、`requests.get`、`open().read()` 大文件），整个事件循环都会停在那。所以「全链路异步」是写好 asyncio 的铁律，不能阻塞的代码用 `asyncio.to_thread` 包一层。
:::

### 5.8 协程 vs 线程

| 维度 | 协程（asyncio） | 线程（threading） |
|------|-----------------|-------------------|
| 切换方式 | 协作式（`await` 主动让出） | 抢占式（OS 调度） |
| 并发数 | 单线程内可数万协程 | 一般数百线程（每线程约 8MB 栈） |
| 锁的需求 | 大多数场景不需要 | 共享数据必须加锁 |
| 阻塞影响 | 一处阻塞全盘停 | 阻塞只影响自己，GIL 释放后别的线程可跑 |
| 心智成本 | 高（全链路异步） | 低（同步代码思维） |
| 适用场景 | 海量 IO、高并发服务 | 中等并发、改造同步代码 |

---

## 六、三种方案选型对比

| 方案 | 并行能力 | 切换开销 | 内存占用 | 适合任务 | 主要缺点 |
|------|----------|----------|----------|----------|----------|
| `threading` | 受 GIL 限制，IO 时并行 | 中（OS 调度） | 中（每线程 MB 级栈） | IO 密集、少量并发、改同步代码简单 | CPU 密集无效；锁与竞态复杂 |
| `multiprocessing` | 真并行（多核） | 大（进程切换） | 大（每进程数十 MB） | CPU 密集、需独立解释器 | 启动慢、数据要 pickle、IPC 复杂 |
| `asyncio` | 单线程并发（IO 时切换） | 极小（用户态） | 极小（每协程 KB 级） | 海量 IO、高并发网络服务 | 需全链路异步、心智成本高 |

### 选型决策树

```
任务主要是 IO 等待？
├─ 是
│   ├─ 并发量级 < 几百  -> ThreadPoolExecutor
│   ├─ 并发量级 > 几千  -> asyncio（新项目首选）
│   └─ 需混合同步库     -> asyncio + asyncio.to_thread
└─ 否（CPU 密集）
    ├─ 单机多核         -> ProcessPoolExecutor / multiprocessing.Pool
    └─ 跨机器           -> 分布式（Celery/Ray/Dask）
```

### 常见搭配

- **asyncio + ProcessPoolExecutor**：异步服务里偶尔跑 CPU 密集任务，用 `loop.run_in_executor` 派给进程池。
- **asyncio + ThreadPoolExecutor**：异步服务里调用同步阻塞 SDK，用 `asyncio.to_thread` 派给线程池。
- **multiprocessing + 多线程**：进程池跑计算，进程内用线程跑 IO（少见，谨慎用）。

---

## 七、实战对比：三种方式并发"下载"

下面用同一个任务——并发「下载」N 个 URL（用 `sleep` 模拟 IO 等待），分别用三种方案实现，对比代码风格、耗时与适用场景。

### 任务定义

N=6 个任务，每个任务「下载」耗时 0.5 秒。理论并发后总耗时约 0.5 秒。

### 7.1 多线程版本

```python
import concurrent.futures
import time
import random

def download(url):
    time.sleep(0.5)   # 模拟 IO 等待
    cost = random.uniform(0.4, 0.6)
    return f"{url} 完成（耗时 {cost:.2f}s）"

def main():
    urls = [f"https://example.com/{i}" for i in range(6)]
    t0 = time.perf_counter()
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
        futures = {ex.submit(download, u): u for u in urls}
        for f in concurrent.futures.as_completed(futures):
            print(f.result())
    print(f"总耗时 {time.perf_counter() - t0:.3f}s")

if __name__ == "__main__":
    main()
```

预期输出（顺序可能不同）：

```
https://example.com/2 完成（耗时 0.45s）
https://example.com/0 完成（耗时 0.51s）
...
总耗时 0.512s
```

### 7.2 多进程版本

```python
import multiprocessing as mp
import time
import random

def download(url):
    time.sleep(0.5)
    cost = random.uniform(0.4, 0.6)
    return f"{url} 完成（耗时 {cost:.2f}s）"

def main():
    urls = [f"https://example.com/{i}" for i in range(6)]
    t0 = time.perf_counter()
    with mp.Pool(processes=6) as pool:
        for r in pool.map(download, urls):
            print(r)
    print(f"总耗时 {time.perf_counter() - t0:.3f}s")

if __name__ == "__main__":
    main()
```

预期输出：

```
https://example.com/0 完成（耗时 0.51s）
...
总耗时 0.712s
```

注意：总耗时比线程多 0.2s 左右——这是进程启动开销。**纯 IO 任务用进程池是浪费**，因为 IO 期间 CPU 本来就空闲，进程的「并行」没意义，反而吃了启动开销。

### 7.3 asyncio 版本

```python
import asyncio
import random

async def download(url):
    await asyncio.sleep(0.5)   # 异步等待，不阻塞循环
    cost = random.uniform(0.4, 0.6)
    return f"{url} 完成（耗时 {cost:.2f}s）"

async def main():
    urls = [f"https://example.com/{i}" for i in range(6)]
    t0 = asyncio.get_event_loop().time()
    async with asyncio.TaskGroup() as tg:
        tasks = [tg.create_task(download(u)) for u in urls]
    for t in tasks:
        print(t.result())
    print(f"总耗时 {asyncio.get_event_loop().time() - t0:.3f}s")

if __name__ == "__main__":
    asyncio.run(main())
```

预期输出：

```
https://example.com/0 完成（耗时 0.51s）
...
总耗时 0.503s
```

### 7.4 三种方式对比小结

| 方案 | 总耗时 | 代码风格 | 适用场景 |
|------|--------|----------|----------|
| `ThreadPoolExecutor` | ~0.51s | 同步代码、最简单 | 中等并发 IO、改同步代码 |
| `multiprocessing.Pool` | ~0.71s | 同步代码、需 `__main__` 守卫 | **CPU 密集**（IO 场景不划算） |
| `asyncio.TaskGroup` | ~0.50s | async/await、心智成本高 | **海量并发 IO**、新项目 |

::: tip 一个常被忽略的细节
当任务量从 6 涨到 10000 时：
- 线程池：需要排队或限制 max_workers，否则创建上万线程会爆栈/爆调度。
- 进程池：同样排队，且启动开销巨大。
- asyncio：单线程跑 10000 个协程毫无压力，每个协程 KB 级内存，是真正的高并发方案。
:::

### 7.5 注意事项汇总

1. **Windows 多进程必须加守卫**：`if __name__ == "__main__":` 包裹入口，否则 spawn 会导致递归 import 崩溃。
2. **进程间数据必须可 pickle**：lambda、闭包、`socket`、文件句柄等不能跨进程传。
3. **asyncio 不能跑同步阻塞**：`requests.get`、`time.sleep`、`open().read()` 大文件都会卡住循环，用 `asyncio.to_thread` 或换异步库。
4. **线程安全靠锁**：GIL 不保护复合操作，共享状态必加 `Lock`。
5. **TaskGroup 取消语义**：3.11+ 任一任务异常会取消所有同级任务，比 gather 更安全。
6. **CPU 密集别用 asyncio**：单线程跑 CPU 计算无法并行，应派给 `ProcessPoolExecutor`。

---

## 八、总结

- **GIL 是 CPython 的实现选择**，保护引用计数，使多线程在 Python 里**不能真正并行**执行 Python 字节码。3.13 起的 no-GIL 实验构建正在改变这一切。
- **IO 密集型**：`asyncio`（新项目，高并发）或 `ThreadPoolExecutor`（小并发，简单）。阻塞 IO 会释放 GIL，所以多线程对 IO 有效。
- **CPU 密集型**：`multiprocessing.Pool` / `ProcessPoolExecutor`，绕开 GIL 用多核。代价是启动开销和数据序列化。
- **混合任务**：异步服务里用 `asyncio.to_thread` 跑阻塞 SDK，用 `run_in_executor` 跑 CPU 密集。
- **线程安全**：GIL 不保证复合操作原子，共享状态必须显式加锁。
- **全链路异步**：asyncio 一处阻塞全盘停，写协程代码要么用异步库，要么用 `to_thread` 包一层。

理解了 GIL 与三种并发模型的边界，你就能根据任务特征（IO/CPU、并发量级、是否新项目）做出正确选型。下一章我们会进入 Python 的内存管理与垃圾回收，那是与 GIL、引用计数紧密相关的另一块底层拼图。

::: details 延伸阅读
- PEP 684：Per-Interpreter GIL（3.12）
- PEP 703：Making the GIL Optional（3.13 free-threaded）
- PEP 654：Exception Groups and TaskGroup（3.11）
- 标准库文档：`threading`、`multiprocessing`、`concurrent.futures`、`asyncio`
- 第三方：`aiohttp`（异步 HTTP）、`httpx`（同步/异步 HTTP）、`uvloop`（高性能事件循环）、`anyio`（asyncio/trio 抽象层）
:::
