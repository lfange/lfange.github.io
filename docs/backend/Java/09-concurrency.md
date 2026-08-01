---
title: 多线程与并发
category:
  - 后端
tag:
  - Java
---

# 多线程与并发

> 本篇是《Java 从入门到精通》第 09 篇，也是区分初级与中高级工程师的关键。覆盖线程基础、`synchronized`/`volatile`、`java.util.concurrent`（JUC）、线程池、`CompletableFuture` 与 Java 21 虚拟线程。面试高频，务必吃透。

---

## 1. 基本概念

- **进程**：程序运行的实例，有独立内存空间。JVM 是一个进程。
- **线程**：进程内的执行单元，共享进程内存。Java 程序至少有 main 线程。
- **并发（Concurrency）**：多线程交替执行（单核也可并发，靠时间片切换）。
- **并行（Parallelism）**：多线程同时执行（需多核）。
- **线程安全**：多线程访问共享资源时，无论调度顺序如何，结果都正确。

::: tip 并发三大特性
1. **原子性**：操作不可分割，要么全做要么不做。
2. **可见性**：一个线程修改了共享变量，其他线程能立即看到。
3. **有序性**：程序执行顺序符合预期（编译器/CPU 可能重排序）。
`synchronized` 保证三者；`volatile` 保证可见性和有序性，不保证复合操作原子性。
:::

---

## 2. 线程创建

### 2.1 继承 Thread

```java
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("线程 " + Thread.currentThread().getName());
    }
}
new MyThread().start();    // start 启动，run 只是普通调用
```

::: warning start vs run
`start()` 启动新线程并调用 `run()`；直接调 `run()` 只是普通方法调用，不创建新线程。
:::

### 2.2 实现 Runnable（推荐）

```java
Runnable task = () -> System.out.println("运行于 " + Thread.currentThread().getName());
new Thread(task, "worker-1").start();
```

`Runnable` 比 `Thread` 好：实现接口不占用继承位，且 `Runnable` 是函数式接口可 Lambda。

### 2.3 实现 Callable + Future（有返回值）

```java
import java.util.concurrent.*;

Callable<Integer> task = () -> {
    Thread.sleep(500);
    return 42;
};
FutureTask<Integer> future = new FutureTask<>(task);
new Thread(future).start();
System.out.println(future.get());    // 阻塞获取结果 42
```

`Callable` 有返回值、可抛受检异常；`Future` 表示异步结果，`get()` 阻塞等待。

---

## 3. 线程生命周期与常用方法

线程六态：`NEW` -> `RUNNABLE` ->（`BLOCKED`/`WAITING`/`TIMED_WAITING`）-> `TERMINATED`。

```java
Thread.sleep(1000);           // 当前线程睡眠 1 秒（静态方法）
thread.join();                // 等待 thread 执行结束
thread.join(2000);            // 最多等 2 秒
Thread.yield();               // 当前线程让出 CPU（提示，不保证）
thread.setDaemon(true);       // 设为守护线程（主线程结束它也结束）
thread.interrupt();           // 中断（设置中断标志）
Thread.currentThread().isInterrupted();   // 检查中断标志
```

### 3.1 正确处理中断

```java
Thread task = new Thread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            // sleep 被中断会清除标志位并抛异常，需重新设置或退出
            Thread.currentThread().interrupt();   // 恢复标志
            break;
        }
        // 工作
    }
});
```

::: warning 别用 stop/destroy
`Thread.stop()` 强制终止可能致数据不一致，已废弃。用 `interrupt()` + 协作式退出。
:::

---

## 4. 线程安全与同步

### 4.1 线程不安全示例

```java
class Counter {
    int count = 0;
    void inc() { count++; }    // count++ 非原子（读-改-写）
}
Counter c = new Counter();
for (int i = 0; i < 100; i++) {
    new Thread(() -> { for (int j = 0; j < 1000; j++) c.inc(); }).start();
}
// count 最终远小于 100000，丢失更新
```

### 4.2 synchronized

`synchronized` 保证同一时刻只有一个线程执行临界区，自动加锁释放（异常也会释放）。

```java
// 同步方法：锁 this
public synchronized void inc() { count++; }

// 同步代码块：锁指定对象（更细粒度，推荐）
private final Object lock = new Object();
public void inc() {
    synchronized (lock) { count++; }
}

// 静态同步方法：锁 Class 对象
public static synchronized void foo() { ... }
```

::: tip synchronized 特性
- **可重入**：同一线程可重复获取同一把锁（不会自己死锁自己）。
- **不可中断**：等待锁时不响应 `interrupt`。
- JDK 6 后优化了"锁升级"（无锁 -> 偏向锁 -> 轻量级锁 -> 重量级锁），性能大幅提升，日常多数场景够用。
:::

### 4.3 volatile

`volatile` 保证**可见性**（修改立即刷主内存，读强制从主内存读）和**有序性**（禁止指令重排），但不保证原子性。

```java
class Flag {
    volatile boolean running = true;     // 可见性：其他线程能立即看到修改
    void stop() { running = false; }
}

// ❌ volatile 不能保证 count++ 原子
volatile int count = 0;
// count++ 仍可能丢更新，要用 synchronized 或 Atomic
```

::: details volatile 的典型用途：双重检查锁单例
```java
class Singleton {
    private static volatile Singleton instance;   // volatile 防指令重排
    public static Singleton get() {
        if (instance == null) {
            synchronized (Singleton.class) {
                if (instance == null) {
                    instance = new Singleton();   // new 非原子，volatile 防"半初始化"泄露
                }
            }
        }
        return instance;
    }
}
```
`new` 分配内存、初始化、赋引用三步可能重排，volatile 禁止重排保证其他线程看到完整对象。
:::

---

## 5. JUC 锁

`java.util.concurrent.locks` 提供比 `synchronized` 更灵活的锁。

### 5.1 ReentrantLock

```java
import java.util.concurrent.locks.ReentrantLock;

ReentrantLock lock = new ReentrantLock();
lock.lock();
try {
    // 临界区
} finally {
    lock.unlock();          // 必须在 finally 释放
}
```

相比 `synchronized` 的优势：可中断（`lockInterruptibly`）、可超时（`tryLock`）、可公平（`new ReentrantLock(true)`）、可绑定多个条件（`Condition`）。

::: warning 一定要 finally 释放
`synchronized` 异常自动释放，`ReentrantLock` 不会！必须 `try-finally`，否则死锁。
:::

### 5.2 读写锁 ReadWriteLock

读读共享、读写互斥、写写互斥，适合读多写少：

```java
import java.util.concurrent.locks.ReentrantReadWriteLock;

ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
ReentrantReadWriteLock.ReadLock r = rwLock.readLock();
ReentrantReadWriteLock.WriteLock w = rwLock.writeLock();

// 读
r.lock();
try { /* 读数据 */ } finally { r.unlock(); }

// 写
w.lock();
try { /* 写数据 */ } finally { w.unlock(); }
```

---

## 6. 原子类与 CAS

`java.util.concurrent.atomic` 提供无锁原子操作，基于 **CAS（Compare-And-Swap）**。

```java
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();    // ++count，原子
count.getAndAdd(10);        // 加 10 返回旧值
count.compareAndSet(0, 1);  // 若为 0 则设为 1，返回是否成功
```

::: tip CAS 原理
CAS(V, expected, new)：若变量 V 当前等于 expected，则设为 new，返回 true；否则返回 false。它是 CPU 指令级原子操作，无锁性能高。`AtomicXXX` 内部用 `Unsafe.compareAndSwapXXX`。
缺点：ABA 问题（用 `AtomicStampedReference` 加版本号解决）、自旋开销、只能单变量。
:::

`AtomicReference`、`AtomicLong`、`LongAdder`（高并发计数更优，分段累加）等同理。

---

## 7. 并发集合

### 7.1 ConcurrentHashMap（线程安全 HashMap）

```java
ConcurrentHashMap<String, Integer> map = new ConcurrentHashMap<>();
map.put("a", 1);
map.merge("a", 1, Integer::sum);    // 原子合并
```

::: details ConcurrentHashMap 演进
- Java 7：分段锁（Segment），默认 16 段，并发度 16。
- Java 8+：数组 + 链表/红黑树，锁粒度到桶（Node），用 CAS + synchronized。并发度更高，null 键值不再允许。
:::

### 7.2 CopyOnWriteArrayList

写时复制：写操作复制出新数组，读无锁。适合**读远多于写**且可接受写延迟的场景（如监听器列表）。

```java
CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>();
list.add("a");    // 复制新数组
list.get(0);      // 无锁读
```

### 7.3 阻塞队列 BlockingQueue

生产者-消费者模型的核心，阻塞操作：

```java
BlockingQueue<String> queue = new ArrayBlockingQueue<>(10);
queue.put("task");           // 满了阻塞
String task = queue.take();  // 空了阻塞
queue.offer("task", 1, TimeUnit.SECONDS);   // 超时入队
```

常用实现：`ArrayBlockingQueue`（数组有界）、`LinkedBlockingQueue`（链表可选有界）、`SynchronousQueue`（直接交接）、`PriorityBlockingQueue`（优先级）。线程池的排队策略就用它们。

---

## 8. 线程池（重点）

手动 `new Thread` 开销大且不可控，生产环境**必须用线程池**复用线程。

### 8.1 ThreadPoolExecutor

```java
import java.util.concurrent.*;

ThreadPoolExecutor pool = new ThreadPoolExecutor(
    2,                                  // corePoolSize 核心线程数
    4,                                  // maximumPoolSize 最大线程数
    60, TimeUnit.SECONDS,              // 空闲存活时间（非核心线程）
    new ArrayBlockingQueue<>(100),      // 任务队列
    Executors.defaultThreadFactory(),   // 线程工厂
    new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
);

pool.execute(() -> System.out.println("任务"));       // 无返回值
Future<Integer> f = pool.submit(() -> 42);            // 有返回值
f.get();                                               // 获取结果
pool.shutdown();        // 平滑关闭（等任务完成）
pool.shutdownNow();     // 立即关闭（中断）
```

### 8.2 执行流程

1. 任务来，若核心线程未满，创建核心线程执行。
2. 核心满，任务入队列。
3. 队列满，创建非核心线程（直至最大线程数）。
4. 最大线程也满，触发拒绝策略。

### 8.3 拒绝策略

| 策略 | 行为 |
|------|------|
| `AbortPolicy`（默认） | 抛 `RejectedExecutionException` |
| `CallerRunsPolicy` | 由提交任务的线程执行（背压，降速） |
| `DiscardPolicy` | 静默丢弃 |
| `DiscardOldestPolicy` | 丢弃队列最老任务，重试 |

### 8.4 Executors 快捷方法（慎用）

```java
Executors.newFixedThreadPool(10);      // 固定大小
Executors.newCachedThreadPool();       // 可缓存（0~Integer.MAX）
Executors.newSingleThreadExecutor();   // 单线程
Executors.newScheduledThreadPool(2);   // 定时
```

::: warning 阿里规范禁用 Executors
- `newFixedThreadPool`/`newSingleThreadExecutor` 队列是 `LinkedBlockingQueue`（无界），可能 OOM。
- `newCachedThreadPool` 最大线程 `Integer.MAX_VALUE`，可能创建大量线程 OOM。

**生产环境用 `ThreadPoolExecutor` 显式指定参数**，并根据 CPU 密集（N+1）还是 IO 密集（2N 或更多）估算线程数。
:::

---

## 9. 并发工具

### 9.1 CountDownLatch（一次性等待）

等待 N 个任务完成：

```java
CountDownLatch latch = new CountDownLatch(3);
for (int i = 0; i < 3; i++) {
    final int k = i;
    new Thread(() -> {
        System.out.println("任务 " + k + " 完成");
        latch.countDown();
    }).start();
}
latch.await();             // 阻塞至 count 减到 0
System.out.println("全部完成");
```

### 9.2 CyclicBarrier（可重用屏障）

N 个线程互相等待到齐后一起继续：

```java
CyclicBarrier barrier = new CyclicBarrier(3, () -> System.out.println("齐了，开跑"));
for (int i = 0; i < 3; i++) {
    new Thread(() -> {
        System.out.println(Thread.currentThread().getName() + " 就绪");
        barrier.await();
        System.out.println(Thread.currentThread().getName() + " 起跑");
    }).start();
}
```

### 9.3 Semaphore（信号量，限流）

```java
Semaphore sem = new Semaphore(3);   // 3 个许可
sem.acquire();                      // 获取许可（满则阻塞）
try { /* 限流执行 */ } finally { sem.release(); }
```

---

## 10. CompletableFuture（异步编排）

Java 8 的 `CompletableFuture` 支持链式异步编排，比 `Future` 强大得多：

```java
CompletableFuture<Integer> future = CompletableFuture
    .supplyAsync(() -> {             // 异步执行（默认 ForkJoinPool）
        sleep(100); return 10;
    })
    .thenApply(n -> n * 2)           // 上一步结果 *2
    .thenCompose(n -> CompletableFuture.supplyAsync(() -> n + 5))  // 再异步
    .thenAccept(System.out::println) // 消费结果
    .exceptionally(e -> {            // 异常处理
        System.err.println("出错: " + e.getMessage()); return null;
    });
future.join();    // 25

// 并行多个任务
CompletableFuture<String> f1 = CompletableFuture.supplyAsync(() -> "A");
CompletableFuture<String> f2 = CompletableFuture.supplyAsync(() -> "B");
CompletableFuture.allOf(f1, f2).join();          // 等全部完成
CompletableFuture.anyOf(f1, f2).join();          // 任一完成
```

::: tip 异步建议传线程池
`supplyAsync` 默认用 `ForkJoinPool.commonPool()`（CPU 密集场景）。IO 密集任务应传自定义线程池：`supplyAsync(supplier, executor)`，避免占用公共池。
:::

---

## 11. 虚拟线程（Java 21）

Java 21 的**虚拟线程**（Project Loom）是轻量级线程，由 JVM 调度在少量平台线程上，创建成本极低（可创建百万级），让"同步阻塞写法"获得异步高并发：

```java
// 创建百万虚拟线程
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 1_000_000; i++) {
        executor.submit(() -> {
            // 同步阻塞写法，但底层不占用平台线程
            Thread.sleep(Duration.ofSeconds(1));
            return fetchFromDb();
        });
    }
}
```

::: tip 虚拟线程的核心价值
传统线程（平台线程）1:1 映射 OS 线程，开销大（约 1MB 栈），池容量有限（数千）。虚拟线程由 JVM 调度，阻塞时让出载体线程，开销极小。**用同步阻塞的简单写法写高并发 IO 程序**，替代复杂的异步回调。

注意：虚拟线程适合 IO 密集（阻塞多），CPU 密集任务仍用平台线程池。`synchronized` 在虚拟线程中会"pin"载体线程，高并发虚拟线程场景建议用 `ReentrantLock`。
:::

---

## 12. 综合案例：并发下载器

综合线程池、`CompletableFuture`、`CountDownLatch`，并发下载多个 URL：

```java
import java.util.concurrent.*;
import java.util.List;

class Downloader {
    private final ExecutorService pool;

    // IO 密集：用较多线程
    public Downloader(int threads) {
        this.pool = Executors.newFixedThreadPool(threads);
    }

    // 串行模拟下载
    String download(String url) throws InterruptedException {
        Thread.sleep(200);             // 模拟网络 IO
        return "[" + Thread.currentThread().getName() + "] " + url + " OK";
    }

    // 并发下载全部
    List<String> downloadAll(List<String> urls) throws Exception {
        // 每个任务用 CompletableFuture 异步
        List<CompletableFuture<String>> futures = urls.stream()
            .map(url -> CompletableFuture.supplyAsync(() -> {
                try { return download(url); }
                catch (InterruptedException e) { throw new RuntimeException(e); }
            }, pool))
            .toList();

        // 等全部完成
        CompletableFuture.allOf(futures.toArray(CompletableFuture[]::new)).join();

        return futures.stream().map(CompletableFuture::join).toList();
    }

    public void close() { pool.shutdown(); }
}

// 测试
public class Demo {
    public static void main(String[] args) throws Exception {
        Downloader d = new Downloader(4);
        List<String> urls = List.of("a.com", "b.com", "c.com", "d.com", "e.com");
        long start = System.currentTimeMillis();
        List<String> results = d.downloadAll(urls);
        long cost = System.currentTimeMillis() - start;
        results.forEach(System.out::println);
        System.out.println("耗时: " + cost + "ms");   // 约 400ms（5 个任务，4 线程，两批）
        d.close();
    }
}
```

这个案例用 `CompletableFuture.supplyAsync` + 自定义线程池并发执行 IO 任务，`allOf().join()` 等待全部完成--这是 Java 异步编程的典型范式。

---

## 小结

| 主题 | 关键点 |
|------|--------|
| 线程创建 | Thread / Runnable（推荐）/ Callable+Future |
| 生命周期 | start/sleep/join/interrupt；协作式停止 |
| 同步 | synchronized（可重入自动释放）；volatile（可见性有序性非原子） |
| JUC 锁 | ReentrantLock（try-finally 释放）、ReadWriteLock（读多写少） |
| 原子类 | AtomicInteger 等，基于 CAS，无锁 |
| 并发集合 | ConcurrentHashMap、CopyOnWriteArrayList、BlockingQueue |
| 线程池 | ThreadPoolExecutor 显式配参；禁 Executors 防 OOM |
| 并发工具 | CountDownLatch、CyclicBarrier、Semaphore |
| 异步编排 | CompletableFuture 链式组合 |
| 虚拟线程 | Java 21，同步写法高并发 IO |

下一篇进入现代 Java 的灵魂--**Lambda 与 Stream**。

::: tip 下一篇预告
《10 - Lambda 与 Stream》：函数式接口、Lambda 语法、方法引用、Stream API（过滤/映射/归约/收集）、`Optional` 空值安全，让 Java 代码简洁十倍。
:::
