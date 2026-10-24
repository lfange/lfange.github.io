---
title: 集合框架
category:
  - 后端
tag:
  - Java
---

# 集合框架

> 本篇是《Java 从入门到精通》第 05 篇。集合是 Java 处理"一组数据"的核心工具，日常开发使用频率最高。本篇覆盖 `List`/`Set`/`Map`/`Queue` 的用法、底层原理与选型，迭代器、排序、不可变集合，以及金额计算必备的 `BigDecimal`。

---

## 1. 集合框架总览

Java 集合框架（Java Collections Framework, JCF）位于 `java.util`，分两大体系：

```
Collection（单列）                         Map（双列，键值对）
├── List（有序、可重复）                    ├── HashMap
│   ├── ArrayList                          ├── LinkedHashMap
│   ├── LinkedList                         └── TreeMap
│   └── Vector（古老，线程安全，已少用）
├── Set（无序、不可重复）                   ├── ConcurrentHashMap（线程安全，第09篇）
│   ├── HashSet
│   ├── LinkedHashSet
│   └── TreeSet
└── Queue/Deque（队列）
    ├── ArrayDeque
    ├── LinkedList（也实现 List）
    └── PriorityQueue
```

::: tip 集合 vs 数组
数组长度固定、类型单一；集合长度可变、API 丰富、有 Map。能用集合就别用数组（性能敏感场景除外）。
:::

---

## 2. List 接口

`List` 有序（按插入顺序）、可重复、可通过索引访问。

### 2.1 ArrayList（最常用）

底层是**动态数组**，随机访问 O(1)，尾插均摊 O(1)，中间插入删除 O(n)（需移动元素）。

```java
import java.util.*;

List<String> list = new ArrayList<>();
list.add("A");
list.add("B");
list.add("C");
list.add(1, "X");          // 在索引 1 插入：[A, X, B, C]

list.get(0);               // A
list.set(0, "AA");         // 替换：[AA, X, B, C]
list.remove(2);            // 按索引删：[AA, X, C]
list.remove("X");          // 按对象删：[AA, C]
list.size();               // 2
list.contains("C");        // true
list.indexOf("C");         // 1

// 遍历
for (String s : list) { System.out.println(s); }
list.forEach(System.out::println);          // 方法引用
list.stream().forEach(System.out::println); // 流式（第10篇）

// 转数组
String[] arr = list.toArray(new String[0]);
```

::: details ArrayList 扩容机制
- 默认初始容量 10（首次 add 时创建）。
- 容量不足时扩容到 `旧容量 * 1.5`（`oldCapacity + (oldCapacity >> 1)`），用 `Arrays.copyOf` 拷贝。
- 预知大小时用 `new ArrayList<>(capacity)` 预分配，避免反复扩容拷贝。
:::

### 2.2 LinkedList

底层是**双向链表**，随机访问 O(n)，头尾增删 O(1)。同时实现 `List` 和 `Deque`。

```java
LinkedList<Integer> list = new LinkedList<>();
list.addLast(1);
list.addLast(2);
list.addFirst(0);          // [0, 1, 2]
list.getFirst();           // 0
list.removeLast();         // [0, 1]
```

::: warning ArrayList vs LinkedList 选型
绝大多数场景用 `ArrayList`（CPU 缓存友好，连续内存）。`LinkedList` 仅在频繁头尾增删、几乎不随机访问时才考虑，且通常 `ArrayDeque`（数组实现的 deque）比它更优。实际项目中 `LinkedList` 很少用。
:::

### 2.3 遍历与删除陷阱

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4, 5));

// ❌ 错误：边遍历边 remove，索引错乱 / ConcurrentModificationException
for (int i = 0; i < list.size(); i++) {
    if (list.get(i) % 2 == 0) list.remove(i);
}

// ✅ 正确1：迭代器 remove
Iterator<Integer> it = list.iterator();
while (it.hasNext()) {
    if (it.next() % 2 == 0) it.remove();
}

// ✅ 正确2：removeIf（Java 8+，推荐）
list.removeIf(n -> n % 2 == 0);
```

::: warning ConcurrentModificationException
集合的"快速失败"（fail-fast）机制：迭代时若结构被修改（非迭代器自身的 remove/add），抛 `ConcurrentModificationException`。这是为了尽早发现并发修改 bug，不要依赖它做并发控制。
:::

---

## 3. Set 接口

`Set` 不可重复（靠 `equals`/`hashCode` 判重）。

### 3.1 HashSet（最常用）

底层是 `HashMap`（元素作为 key，value 是固定占位对象），无序，增删查 O(1)。

```java
Set<String> set = new HashSet<>();
set.add("A");
set.add("B");
set.add("A");              // 重复，添加失败返回 false
System.out.println(set);   // [A, B]（无序）
set.contains("A");         // true
set.remove("B");
set.size();                // 1
```

### 3.2 LinkedHashSet

在 HashSet 基础上维护链表记录插入顺序，**按插入顺序遍历**：

```java
Set<Integer> set = new LinkedHashSet<>();
set.add(3); set.add(1); set.add(2);
System.out.println(set);   // [3, 1, 2]（保持插入顺序）
```

### 3.3 TreeSet

底层是红黑树，**自动排序**，增删查 O(log n)：

```java
Set<Integer> set = new TreeSet<>();
set.add(3); set.add(1); set.add(2);
System.out.println(set);   // [1, 2, 3]（升序）

TreeSet<Integer> nums = new TreeSet<>(Set.of(1, 3, 5, 7, 9));
nums.first();              // 1
nums.last();               // 9
nums.headSet(5);           // [1, 3]（小于 5）
nums.tailSet(5);           // [5, 7, 9]（大于等于 5）
nums.subSet(3, 7);         // [3, 5]（[3,7)）
```

::: tip 自定义对象入 Set
元素必须正确实现 `equals` 和 `hashCode`（HashSet）或实现 `Comparable`/传 `Comparator`（TreeSet），否则判重失效。
:::

---

## 4. Map 接口

`Map` 存键值对，键不可重复。

### 4.1 HashMap（最常用）

底层是**数组 + 链表/红黑树**，增删查平均 O(1)。

```java
Map<String, Integer> map = new HashMap<>();
map.put("Alice", 90);
map.put("Bob", 85);
map.put("Alice", 95);              // 覆盖旧值，返回旧值 90

map.get("Alice");                  // 95
map.getOrDefault("Tom", 0);        // 0（键不存在返回默认值）
map.containsKey("Bob");            // true
map.containsValue(85);             // true
map.remove("Bob");
map.size();                        // 1

// 遍历方式（推荐 entrySet）
for (Map.Entry<String, Integer> e : map.entrySet()) {
    System.out.println(e.getKey() + " = " + e.getValue());
}
map.forEach((k, v) -> System.out.println(k + " = " + v));

// 仅遍历键 / 值
map.keySet();
map.values();

// 计算式更新（Java 8+）
map.merge("Alice", 5, Integer::sum);   // 95+5=100，键存在则按函数合并
map.putIfAbsent("Tom", 60);            // 仅当不存在时放入
map.computeIfAbsent("Jerry", k -> k.length() * 10);  // 不存在则计算放入
```

::: details HashMap 原理（面试高频）
- **结构**：`Node[]` 数组，每个槽位是链表头；链表长度 ≥ 8 且数组长度 ≥ 64 时转红黑树（≤ 6 退回链表）。
- **定位**：`hash = (h = key.hashCode()) ^ (h >>> 16)`（扰动，减少冲突），`index = (n - 1) & hash`。
- **扩容**：默认初始容量 16，负载因子 0.75，元素数 > 容量×0.75 时扩容为 2 倍并重哈希。
- **线程不安全**：多线程下可能死循环（JDK7 头插法）、数据丢失。并发用 `ConcurrentHashMap`。
:::

::: warning 自定义对象作 Key
作为 key 的对象必须正确实现 `equals` 和 `hashCode`，且最好是**不可变**的（否则修改后 key "丢失"）。String、Integer 等不可变类是天然的优质 key。
:::

### 4.2 LinkedHashMap

维护插入顺序（或访问顺序），实现 LRU 缓存的基础：

```java
// 访问顺序模式：最近访问的放最后
Map<String, Integer> map = new LinkedHashMap<>(16, 0.75f, true);
map.put("A", 1); map.put("B", 2); map.put("C", 3);
map.get("A");               // 访问 A，A 移到末尾
System.out.println(map.keySet());   // [B, C, A]
```

### 4.3 TreeMap

底层红黑树，**按键排序**：

```java
TreeMap<String, Integer> map = new TreeMap<>();
map.put("banana", 2); map.put("apple", 5); map.put("cherry", 3);
System.out.println(map.keySet());           // [apple, banana, cherry]（按 key 排序）
map.firstKey();            // apple
map.lastKey();             // cherry
map.subMap("apple", "cherry");   // {apple=5, banana=2}
```

### 4.4 Map 选型表

| Map | 顺序 | 线程安全 | 性能 | 适用 |
|-----|------|----------|------|------|
| `HashMap` | 无 | 否 | O(1) | 默认选择 |
| `LinkedHashMap` | 插入/访问 | 否 | O(1) | 需保持顺序、LRU |
| `TreeMap` | 按 key 排序 | 否 | O(log n) | 需排序遍历、范围查找 |
| `ConcurrentHashMap` | 无 | 是 | O(1) | 并发场景（第 09 篇） |

---

## 5. Queue / Deque

`Queue` 先进先出（FIFO），`Deque` 双端队列（两端都可进出）。

```java
// ArrayDeque：数组实现的双端队列，推荐替代 Stack 和 LinkedList
Deque<Integer> deque = new ArrayDeque<>();
deque.offerLast(1); deque.offerLast(2);   // [1, 2]
deque.offerFirst(0);                       // [0, 1, 2]
deque.peekFirst();    // 0（查看不删）
deque.pollFirst();    // 0（取出删除）-> [1, 2]

// 当栈用
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); stack.push(2);   // [2, 1]（头进头出）
stack.pop();                    // 2
```

::: warning 别用 Stack
`java.util.Stack` 继承 Vector，所有方法加锁，性能差。需要栈语义请用 `ArrayDeque`。
:::

### PriorityQueue 优先队列

出队按优先级（最小堆默认）：

```java
PriorityQueue<Integer> pq = new PriorityQueue<>();   // 默认小顶堆
pq.offer(3); pq.offer(1); pq.offer(2);
pq.poll();    // 1
pq.poll();    // 2

// 大顶堆
PriorityQueue<Integer> maxHeap = new PriorityQueue<>(Comparator.reverseOrder());
```

---

## 6. 迭代器 Iterator / Iterable

`Collection` 继承 `Iterable`，故都能用 `for-each`（底层是迭代器）和 `forEach`。

```java
List<String> list = List.of("A", "B", "C");

// for-each（语法糖，编译为迭代器）
for (String s : list) { ... }

// 显式迭代器（需 remove 时用）
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    if (s.equals("B")) it.remove();   // 迭代器自身的 remove，安全
}

// forEach + Lambda
list.forEach(s -> System.out.println(s));
```

::: tip Iterable vs Iterator
- `Iterable`：可迭代的，有 `iterator()` 方法返回 `Iterator`，是 `for-each` 的前提。
- `Iterator`：迭代器本身，有 `hasNext()`/`next()`/`remove()`。
:::

---

## 7. Collections 工具类

`Collections` 提供集合的静态工具方法：

```java
List<Integer> list = new ArrayList<>(List.of(3, 1, 2));

Collections.sort(list);                  // 排序：[1, 2, 3]
Collections.reverse(list);               // 反转：[3, 2, 1]
Collections.shuffle(list);               // 随机打乱
Collections.max(list);                   // 最大值
Collections.min(list);                   // 最小值
Collections.frequency(list, 2);          // 元素出现次数
Collections.binarySearch(list, 2);       // 二分查找（需先排序）

// 不可变封装
List<Integer> unmod = Collections.unmodifiableList(list);
// unmod.add(4);   // UnsupportedOperationException

// 空集合 / 单元素集合
Collections.emptyList();
Collections.singletonList("only");
Collections.emptyMap();

// 同步包装（线程安全，但粗粒度，并发场景仍推荐 ConcurrentHashMap 等）
List<Integer> syncList = Collections.synchronizedList(list);
```

::: tip Java 8+ 优先用 List.of
创建不可变小集合用 `List.of(...)`/`Set.of(...)`/`Map.of(...)` 比 `Collections.singletonList` 更简洁。但 `Collections` 在排序、查找等操作上仍不可替代。
:::

---

## 8. Comparable 与 Comparator 排序

### 8.1 Comparable（自然排序）

类实现 `Comparable<T>`，定义自身默认排序规则：

```java
public class Student implements Comparable<Student> {
    String name;
    int score;

    public Student(String name, int score) { this.name = name; this.score = score; }

    @Override
    public int compareTo(Student o) {
        return Integer.compare(this.score, o.score);   // 按分数升序
    }

    @Override public String toString() { return name + ":" + score; }
}

List<Student> list = new ArrayList<>(List.of(
    new Student("B", 80), new Student("A", 95), new Student("C", 70)
));
Collections.sort(list);          // 按 compareTo 排序
System.out.println(list);        // [C:70, B:80, A:95]
```

### 8.2 Comparator（定制排序）

不修改类、临时定义排序规则，配合 Lambda 极简：

```java
List<Student> list = ...;

// 按分数降序
list.sort(Comparator.comparingInt((Student s) -> s.score).reversed());

// 按姓名升序，姓名相同按分数降序
list.sort(Comparator.comparing((Student s) -> s.name)
                    .thenComparingInt(s -> -s.score));

// 空安全
list.sort(Comparator.comparing(s -> s.name, Comparator.nullsFirst(Comparator.naturalOrder())));
```

::: tip Comparable vs Comparator
- `Comparable`：类内部定义"我如何与自己比较"，一个默认规则。
- `Comparator`：外部定义"两个对象如何比较"，灵活、可多规则、不侵入类。
日常多用 `Comparator`（尤其 Lambda），`Comparable` 用于类的自然顺序。
:::

---

## 9. 不可变集合（Java 9+）

`List.of`/`Set.of`/`Map.of`/`Map.ofEntries` 创建**不可变**集合，简洁高效：

```java
List<Integer> list = List.of(1, 2, 3);          // 不可变
Set<String> set = Set.of("A", "B", "C");
Map<String, Integer> map = Map.of("A", 1, "B", 2);          // ≤10 对
Map<String, Integer> big = Map.ofEntries(
    Map.entry("X", 10), Map.entry("Y", 20)
);

// list.add(4);   // UnsupportedOperationException

// 从可变集合转不可变
List<Integer> immutable = List.copyOf(new ArrayList<>(List.of(1, 2, 3)));
```

::: warning Set.of/Map.of 不允许 null 和重复
`Set.of` 传重复元素会抛 `IllegalArgumentException`；所有 `of` 集合都不允许 null 键值。HashMap 则允许 null。
:::

---

## 10. BigDecimal 精确计算

`double` 无法精确表示十进制小数，金额计算必须用 `BigDecimal`。

```java
import java.math.BigDecimal;
import java.math.RoundingMode;

// ⚠️ 用字符串构造，别用 double 构造（double 已不精确）
BigDecimal a = new BigDecimal("0.1");
BigDecimal b = new BigDecimal("0.2");
a.add(b);                          // 0.3（精确）
// new BigDecimal(0.1).add(new BigDecimal(0.2))   // 0.30000000000000004（错！）

a.subtract(b);
a.multiply(b);
a.divide(b, 2, RoundingMode.HALF_UP);    // 除法必须指定精度和舍入模式，否则除不尽会抛异常

// 比较：用 compareTo，别用 equals
new BigDecimal("1.0").equals(new BigDecimal("1.00"));      // false（equals 比 scale）
new BigDecimal("1.0").compareTo(new BigDecimal("1.00"));   // 0（相等）

// 设置小数位
new BigDecimal("3.14159").setScale(2, RoundingMode.HALF_UP);   // 3.14
```

::: warning BigDecimal 三大坑
1. **构造用字符串**：`new BigDecimal(0.1)` 仍带 double 误差，用 `new BigDecimal("0.1")` 或 `BigDecimal.valueOf(0.1)`。
2. **除法指定舍入**：`1/3` 除不尽，不指定 `RoundingMode` 会抛 `ArithmeticException`。
3. **比较用 compareTo**：`equals` 会区分小数位数（1.0 ≠ 1.00）。
:::

---

## 11. 综合案例：词频统计

综合 Map、List、排序、不可变集合：

```java
import java.util.*;
import java.util.stream.*;

public class WordCount {
    public static void main(String[] args) {
        String text = "the quick brown fox jumps over the lazy dog the end";

        // 1. 分词并统计词频
        Map<String, Integer> freq = new HashMap<>();
        for (String word : text.split(" ")) {
            freq.merge(word, 1, Integer::sum);    // 计数 +1
        }
        System.out.println("词频: " + freq);
        // {over=1, lazy=1, end=1, fox=1, dog=1, quick=1, the=3, brown=1, jumps=1}

        // 2. 按词频降序、词频相同按字母升序
        List<Map.Entry<String, Integer>> sorted = new ArrayList<>(freq.entrySet());
        sorted.sort(Map.Entry.<String, Integer>comparingByValue().reversed()
                .thenComparing(Map.Entry.comparingByKey()));

        System.out.println("排序后:");
        sorted.forEach(e -> System.out.println("  " + e.getKey() + ": " + e.getValue()));
        // the: 3
        // brown: 1
        // dog: 1
        // ...

        // 3. 取前 3 高频词
        List<String> top3 = sorted.stream()
                .limit(3)
                .map(Map.Entry::getKey)
                .toList();                        // Java 16+ 不可变 List
        System.out.println("Top3: " + top3);     // [the, brown, dog]
    }
}
```

这个案例体现了 `HashMap.merge`、`Map.Entry` 排序、`Comparator` 链式、Stream（第 10 篇）与不可变 `List` 的协作。

---

## 小结

| 集合 | 实现 | 特点 | 选型 |
|------|------|------|------|
| List | ArrayList / LinkedList | 有序可重复 | 默认 ArrayList |
| Set | HashSet / LinkedHashSet / TreeSet | 不可重复 | 默认 HashSet，需排序 TreeSet |
| Map | HashMap / LinkedHashMap / TreeMap | 键值对 | 默认 HashMap，需排序 TreeMap |
| Queue/Deque | ArrayDeque / PriorityQueue | 队列/栈/优先级 | 栈和队列用 ArrayDeque |
| 排序 | Comparable / Comparator | 自然/定制 | 优先 Comparator + Lambda |
| 不可变 | List.of / Map.of / copyOf | 只读 | 小常量集合 |
| 精确计算 | BigDecimal | 十进制精确 | 金额必用 |

下一篇进入**异常处理**：异常体系、try-catch、自定义异常、try-with-resources。

::: tip 下一篇预告
《06 - 异常处理》：Java 异常体系（Error/Exception/RuntimeException）、受检 vs 非受检、`try-catch-finally`、`try-with-resources`、自定义异常与异常链、最佳实践。
:::
