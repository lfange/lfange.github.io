---
title: JVM 基础与性能
category:
  - 后端
tag:
  - Java
---

# JVM 基础与性能

> 本篇是《Java 从入门到精通》第 12 篇，面试重灾区。覆盖 JVM 内存区域、对象内存布局、垃圾回收算法与收集器、调优参数、诊断工具与 OOM/CPU 排查。理解 JVM 才能真正"会调优、能排障"。

---

## 1. JVM 内存区域

JVM 运行时数据区分为几块，各有生命周期和用途：

```
┌─────────────────────────────────────────────┐
│  线程私有（每个线程一份）                      │
│  ┌──────────────┐ ┌──────────────────────┐  │
│  │ 程序计数器    │ │ 虚拟机栈（栈帧）       │  │
│  │（当前指令地址）│ │ 局部变量表/操作数栈    │  │
│  └──────────────┘ └──────────────────────┘  │
│  ┌──────────────────────┐                   │
│  │ 本地方法栈            │                   │
│  │（native 方法）        │                   │
│  └──────────────────────┘                   │
├─────────────────────────────────────────────┤
│  线程共享                                    │
│  ┌──────────────────────┐ ┌──────────────┐  │
│  │ 堆（Heap）            │ │ 方法区        │  │
│  │ 对象、数组（GC 主战场）│ │ 类元信息、常量 │  │
│  └──────────────────────┘ └──────────────┘  │
└─────────────────────────────────────────────┘
```

### 1.1 程序计数器（PC Register）

记录当前线程执行的字节码行号。线程私有，唯一不会 OOM 的区域。

### 1.2 虚拟机栈（VM Stack）

线程私有，每个方法调用创建一个**栈帧**（局部变量表、操作数栈、动态链接、方法出口）。方法调用即入栈，返回即出栈。

- 局部变量表存基本类型和对象引用。
- 栈深度超限 -> `StackOverflowError`（如无限递归）。
- 栈无法扩展 -> `OutOfMemoryError`。

```java
void recurse() { recurse(); }    // 无限递归 -> StackOverflowError
```

### 1.3 本地方法栈

为 native 方法服务，与虚拟机栈类似。HotSpot 把两者合二为一。

### 1.4 堆（Heap）

线程共享，存放**对象实例和数组**，GC 主战场。逻辑上分：

- **新生代（Young）**：Eden + 2 个 Survivor（S0/S1），新对象先分配在 Eden。
- **老年代（Old）**：经过多次 GC 仍存活的对象、大对象。

堆 OOM 是最常见的 `OutOfMemoryError: Java heap space`。

### 1.5 方法区（Method Area）

线程共享，存**类元信息、常量池、静态变量、JIT 编译后的代码**。

- JDK 7 及之前：方法区实现叫"永久代"（PermGen），`-XX:PermSize`/`-XX:MaxPermSize`。
- JDK 8+：移除永久代，改为**元空间（Metaspace）**，使用**本地内存**，`-XX:MetaspaceSize`/`-XX:MaxMetaspaceSize`。

::: tip 为什么用元空间替代永久代
永久代大小固定易 OOM（`PermGen space`），尤其动态生成大量类（CGLIB、Groovy）时。元空间用本地内存，大小随系统内存，更不易溢出。
:::

### 1.6 运行时常量池

方法区的一部分，存编译期生成的各种字面量和符号引用。JDK 7+ 字符串常量池移到了堆中。

::: tip 直接内存
NIO 的 `ByteBuffer.allocateDirect` 分配堆外内存，不受堆大小限制，但受 `-XX:MaxDirectMemorySize` 和物理内存约束。零拷贝 IO 用它。
:::

---

## 2. 对象创建与内存布局

### 2.1 对象创建过程

`new Student()` 时：

1. **类加载检查**：常量池定位符号引用，检查类是否已加载，未加载则先加载。
2. **分配内存**：在堆分配内存（指针碰撞 / 空闲列表，取决于 GC 收集器是否有压缩）。
3. **内存初始化**：空间清零（字段默认值）。
4. **设置对象头**：Mark Word（哈希、GC 年龄、锁状态）+ 类元数据指针。
5. **`<init>` 执行**：构造方法初始化字段为指定值。

### 2.2 对象内存布局

对象在内存分三部分：

- **对象头（Header）**：Mark Word（8 字节）+ 类型指针（4/8 字节，指针压缩）。
- **实例数据（Instance Data）**：各字段值。
- **对齐填充（Padding）**：补齐 8 字节整数倍。

::: tip 指针压缩
堆小于 32GB 时，JVM 默认开启指针压缩（`-XX:+UseCompressedOops`），把 8 字节指针压成 4 字节，省内存。所以 64 位 JVM 堆建议不超过 32GB。
:::

---

## 3. 垃圾回收

### 3.1 判断对象是否存活：可达性分析

从 **GC Roots** 出发，沿引用链遍历，不可达的对象为垃圾。GC Roots 包括：

- 虚拟机栈中局部变量引用的对象。
- 方法区中静态变量、常量引用的对象。
- 本地方法栈中 JNI 引用的对象。
- 活跃线程、同步锁持有的对象。

::: tip 不再使用引用计数法
引用计数无法解决循环引用（A 引用 B，B 引用 A，都不为 0 但实际已无外部引用）。Java 用可达性分析。
:::

### 3.2 引用的强度

- **强引用**：`Object o = new Object()`，只要强引用在就不回收。
- **软引用**：`SoftReference`，内存不足时才回收（适合缓存）。
- **弱引用**：`WeakReference`，下次 GC 必回收（`WeakHashMap`）。
- **虚引用**：`PhantomReference`，不影响对象生命周期，仅做回收通知。

### 3.3 GC 算法

- **标记-清除**：标记垃圾后清除。缺点：内存碎片。
- **标记-复制**：将存活对象复制到另一半，清空原区。新生代用此（Eden + S0/S1）。
- **标记-整理**：标记存活对象后整理到一端，清除边界外。老年代用，无碎片但要移动。
- **分代收集**：新生代用复制（朝生夕死），老年代用标记-整理/清除。

### 3.4 新生代 GC 流程（Minor GC）

1. 对象先分配在 Eden。
2. Eden 满，触发 Minor GC，Eden 存活对象复制到 S0，年龄 +1。
3. 下次 GC，Eden + S0 存活对象复制到 S1，年龄 +1。S0/S1 角色互换。
4. 年龄达阈值（默认 15）晋升老年代。

::: tip 为什么两个 Survivor
复制算法需要一块空区接收存活对象。两 Survivor 交替使用，保证始终有一个空着，避免内存浪费。
:::

### 3.5 GC 收集器演进

| 收集器 | 作用域 | 算法 | 特点 |
|--------|--------|------|------|
| Serial / Serial Old | 新生代/老年代 | 复制/整理 | 单线程，客户端模式 |
| ParNew / Parallel Scavenge | 新生代 | 复制 | 多线程并行 |
| Parallel Old | 老年代 | 整理 | 多线程并行，注重吞吐 |
| CMS | 老年代 | 标记清除 | 低延迟，已废弃（JDK 14 移除） |
| G1 | 整堆 | Region+整理 | 可预测停顿，JDK 9+ 默认 |
| ZGC | 整堆 | 着色指针 | <10ms 停顿，TB 级堆（JDK 15 转正） |
| Shenandoah | 整堆 | 转移指针 | 低停顿，RedHat 主导 |

::: tip 生产怎么选
- JDK 8：Parallel（吞吐优先）或 G1（响应优先）。
- JDK 11/17+：默认 G1，够用。
- 超大堆、超低延迟：ZGC（`-XX:+UseZGC`）。
- 避免用 CMS（已移除）。
:::

---

## 4. JVM 调优参数

### 4.1 堆与内存

```bash
-Xms4g                    # 初始堆大小（建议与 Xmx 相同，避免动态扩缩的开销）
-Xmx4g                    # 最大堆大小
-Xmn1g                    # 新生代大小
-XX:NewRatio=2            # 老年代:新生代 = 2:1
-XX:SurvivorRatio=8       # Eden:S0:S1 = 8:1:1
-XX:MetaspaceSize=256m    # 元空间初始大小（触发 GC 阈值）
-XX:MaxMetaspaceSize=512m # 元空间最大
-XX:MaxDirectMemorySize=1g
```

### 4.2 GC 相关

```bash
-XX:+UseG1GC              # 使用 G1
-XX:MaxGCPauseMillis=200  # 目标最大停顿时间（G1/ZGC）
-XX:+PrintGCDetails       # 打印 GC 详情（JDK 8）
-Xlog:gc*:/path/gc.log    # JDK 9+ 统一日志
-XX:+HeapDumpOnOutOfMemoryError    # OOM 时自动 dump 堆
-XX:HeapDumpPath=/path/dump.hprof
```

::: tip 生产标配
```
-Xms4g -Xmx4g -XX:+UseG1GC -XX:MaxGCPauseMillis=200
-Xlog:gc*:file=gc.log:time,uptime:filecount=10,filesize=100m
-XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/data/dumps/
```
:::

### 4.3 线程栈

```bash
-Xss512k                 # 每个线程栈大小（默认 1M，小栈可开更多线程）
```

---

## 5. 诊断工具

### 5.1 JDK 自带命令

```bash
jps -lvm                  # 查看 Java 进程
jstat -gc <pid> 1000 10   # 每 1 秒打印 GC 情况，共 10 次
jmap -heap <pid>          # 堆内存概况
jmap -histo <pid> | head  # 对象直方图（按实例数排序）
jmap -dump:format=b,file=heap.hprof <pid>   # 导出堆 dump
jstack <pid>              # 打印线程栈（排查死锁、CPU 飙高）
jstack -l <pid>           # 含锁信息
```

### 5.2 CPU 飙高排查

```bash
# 1. 找占 CPU 最高的 Java 进程
top -c

# 2. 找该进程占 CPU 最高的线程
top -Hp <pid>

# 3. 线程 ID 转 16 进制
printf "%x\n" <tid>

# 4. jstack 中搜索该 nid
jstack <pid> | grep <hex_tid> -A 30
```

### 5.3 可视化工具

- **JConsole / JVisualVM**：JDK 自带，监控内存、线程、GC。
- **JDK Mission Control (JMC)**：基于 JFR 的事件分析，低开销。
- **MAT**：分析 heap dump，找内存泄漏。

### 5.4 Arthas（阿里，强烈推荐）

[Arthas](https://arthas.aliyun.com/) 是线上诊断神器，无需重启应用：

```bash
# 启动
java -jar arthas-boot.jar

# 常用命令
dashboard                 # 总览（线程、内存、GC）
thread                    # 线程情况（thread <id> 看栈）
thread -n 3               # CPU 占用最高的 3 个线程
jad ClassName             # 反编译类（看运行时实际代码）
watch Class method params returnObj  # 观察方法调用参数返回值
trace Class method        # 方法调用链耗时
profiler start; profiler stop    # 生成火焰图
```

::: tip Arthas 解决的痛点
线上问题难复现时，Arthas 可在不改代码、不重启的情况下查看方法参数、耗时、反编译验证是否部署了最新代码，是排查线上 bug 的利器。
:::

---

## 6. 常见问题与排查

### 6.1 OOM 类型

| 类型 | 含义 | 常见原因 |
|------|------|----------|
| `Java heap space` | 堆内存不足 | 内存泄漏、大对象、堆太小 |
| `GC overhead limit` | GC 花费 98% 时间回收不到 2% | 堆几乎耗尽，疯狂 GC |
| `Metaspace` | 元空间不足 | 动态生成大量类（CGLIB） |
| `Direct buffer memory` | 直接内存不足 | NIO 堆外内存泄漏 |
| `Unable to create new native thread` | 无法创建线程 | 线程数超限（系统/进程） |
| `StackOverflowError` | 栈溢出 | 递归无终止 |

### 6.2 内存泄漏排查

1. 用 `jmap -dump` 或 `HeapDumpOnOutOfMemoryError` 导出 hprof。
2. 用 MAT 分析支配树（Dominator Tree）与 GC Roots 引用链。
3. 找出意外持有对象引用的" GC Roots 路径"（如静态集合不断 add 不 remove、ThreadLocal 未 remove、监听器未注销）。

::: warning 常见内存泄漏场景
- 静态 `Map`/`List` 不断 add 不清理。
- `ThreadLocal` 用完不 `remove`（线程池中线程复用，导致值泄漏）。
- 数据库连接/IO 流未关闭（用 try-with-resources）。
- 监听器/回调注册后未注销。
- 缓存无淘汰策略（用 `WeakHashMap` 或 Caffeine 等带淘汰的缓存）。
:::

### 6.3 频繁 Full GC

- 老年代空间不足：大对象直接进老年代、内存泄漏、Survivor 太小导致提前晋升。
- Metaspace 不足：动态生成类。
- 显式 `System.gc()`：代码或框架调用了，可 `-XX:+DisableExplicitGC` 禁用。
- 用 `jstat -gc` 观察各代变化，结合 GC 日志定位。

---

## 7. 综合案例：制造与排查 OOM

```java
import java.util.*;

public class OomDemo {
    static List<byte[]> cache = new ArrayList<>();   // 静态集合持有，永不释放

    public static void main(String[] args) {
        try {
            while (true) {
                cache.add(new byte[1024 * 1024]);    // 每次 1MB，不断堆积
                System.out.println("已缓存 " + cache.size() + " MB");
            }
        } catch (OutOfMemoryError e) {
            System.err.println("OOM: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
```

运行（限制堆 32M 观察快速溢出）：

```bash
java -Xms32m -Xmx32m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=./oom.hprof OomDemo
```

排查步骤：

1. 程序抛 `OutOfMemoryError: Java heap space`，生成 `oom.hprof`。
2. 用 MAT 打开 hprof，看 Dominator Tree，发现 `OomDemo.cache` 这个 `ArrayList` 占了绝大部分堆。
3. 查看 GC Roots 引用链，确认是静态变量 `cache` 持有。
4. 修复：限制缓存大小或用弱引用/带淘汰策略的缓存。

::: tip 实际排查思路
OOM 本质是"某些对象本该被回收却没被回收"。定位思路永远是：**dump 堆 -> 找占内存最大的对象 -> 查它的 GC Roots 引用链 -> 看是谁意外持有**。MAT 的 "Leak Suspects" 报告会自动给出可疑点。
:::

---

## 小结

| 主题 | 关键点 |
|------|--------|
| 内存区域 | 堆（对象）、方法区/元空间（类元信息）、栈（栈帧）、PC、本地方法栈 |
| 对象布局 | 对象头 + 实例数据 + 对齐；指针压缩省内存 |
| GC | 可达性分析 + GC Roots；分代复制/整理；G1/ZGC 选型 |
| 调优 | Xms=Xmx、G1、GC 日志、OOM 自动 dump |
| 诊断 | jstat/jmap/jstack + MAT + Arthas |
| OOM | 区分 heap/metaspace/thread/stack，dump 后查引用链 |

本系列倒数第二篇。下一篇用现代新特性与项目实战收尾，把所学串成完整能力。

::: tip 下一篇预告
《13 - 现代特性与最佳实践》：Java 8~21 新特性全景、新日期 `java.time`、Spring Boot 快速实战、工程最佳实践与后续学习路线。
:::
