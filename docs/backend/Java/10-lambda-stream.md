---
title: Lambda 与 Stream
category:
  - 后端
tag:
  - Java
---

# Lambda 与 Stream

> 本篇是《Java 从入门到精通》第 10 篇。Java 8 引入的 Lambda 与 Stream 是现代 Java 代码简洁性的核心，让集合操作从冗长的 for 循环变成声明式流水线。本篇覆盖函数式接口、Lambda、方法引用、Stream API 全套操作、收集器与 `Optional`。

---

## 1. 函数式接口

**只有一个抽象方法**的接口（default/static 方法不计），是 Lambda 的类型基础。用 `@FunctionalInterface` 标注（可选，编译器检查）：

```java
@FunctionalInterface
interface MathOp { int op(int a, int b); }

MathOp add = (a, b) -> a + b;
add.op(3, 4);    // 7
```

### 1.1 JDK 内置函数式接口

`java.util.function` 提供常用模板，无需自定义：

| 接口 | 签名 | 用途 |
|------|------|------|
| `Function<T,R>` | `R apply(T)` | 转换 T->R |
| `Predicate<T>` | `boolean test(T)` | 判断/过滤 |
| `Consumer<T>` | `void accept(T)` | 消费，无返回 |
| `Supplier<T>` | `T get()` | 提供/惰性求值 |
| `BiFunction<T,U,R>` | `R apply(T,U)` | 双参转换 |
| `UnaryOperator<T>` | `T apply(T)` | 同类型转换 |
| `BinaryOperator<T>` | `T apply(T,T)` | 同类型双参 |

```java
Function<String, Integer> len = String::length;
Predicate<String> isEmpty = String::isEmpty;
Consumer<String> printer = System.out::println;
Supplier<List<String>> factory = ArrayList::new;
```

::: tip 基本类型特化版
为避免装箱开销，有 `IntFunction`/`IntPredicate`/`ToIntFunction`/`IntUnaryOperator` 等基本类型版本。Stream 有 `mapToInt`/`sum`/`average` 等。
:::

---

## 2. Lambda 语法

Lambda 是函数式接口实例的简写，本质是"匿名方法"。

```java
// 完整
(String a, String b) -> { return a.length() - b.length(); }

// 类型推断省略
(a, b) -> a.length() - b.length()

// 单参数省略括号
x -> x * x

// 无参数
() -> System.out.println("hi")

// 多语句
(x) -> {
    int y = x + 1;
    return y * 2;
}
```

### 2.1 变量捕获

Lambda 可使用外部变量，但要求** effectively final**（事实不可变）：

```java
int factor = 10;
Function<Integer, Integer> mul = x -> x * factor;   // 捕获 factor，须 effectively final
// factor = 20;   // ❌ 改了之后上面 Lambda 编译错误
```

::: tip Lambda vs 匿名内部类
Lambda 比匿名内部类更简洁，但只能实现函数式接口（单方法）。匿名内部类可实现任意接口/继承类，且有 `this` 指向自身；Lambda 的 `this` 指向外部类。
:::

---

## 3. 方法引用

当 Lambda 只是调用某个已存在方法时，用 `::` 简化，四种形式：

```java
// 1. 静态方法引用
Function<String, Integer> parser = Integer::parseInt;

// 2. 特定对象的实例方法引用
String s = "hello";
Supplier<Integer> len = s::length;

// 3. 类的实例方法引用（第一个参数作为接收者）
Function<String, String> upper = String::toUpperCase;
BiFunction<String, Integer, Character> charAt = String::charAt;

// 4. 构造方法引用
Supplier<ArrayList<String>> factory = ArrayList::new;
Function<Integer, ArrayList<String>> sizedFactory = ArrayList::new;
```

等价于：

```java
Function<String, Integer> parser = str -> Integer.parseInt(str);
Supplier<Integer> len = () -> s.length();
```

::: tip 优先用方法引用
能用方法引用就别写 Lambda，更简洁易读。但 Lambda 能写复杂逻辑，方法引用只能转发单方法。
:::

---

## 4. Stream API 概览

Stream 是对集合的**声明式**操作流水线，不是数据结构，不存储数据，而是描述"做什么"。

```java
List<String> result = list.stream()        // 1. 创建流
    .filter(s -> s.length() > 3)           // 2. 中间操作（惰性）
    .map(String::toUpperCase)              //    中间操作
    .sorted()                              //    中间操作
    .collect(Collectors.toList());         // 3. 终端操作（触发执行）
```

特点：
- **惰性求值**：中间操作不立即执行，直到终端操作才触发。
- **一次性**：一个 Stream 只能消费一次。
- **不修改源**：产生新结果，原数据不变（除非你显式修改元素）。

### 4.1 创建 Stream

```java
// 集合
List<Integer> list = List.of(1, 2, 3);
Stream<Integer> s1 = list.stream();

// 数组
int[] arr = {1, 2, 3};
IntStream s2 = Arrays.stream(arr);

// 直接
Stream<Integer> s3 = Stream.of(1, 2, 3);

// 区间
IntStream.range(1, 10);          // 1..9
IntStream.rangeClosed(1, 10);    // 1..10

// 无限流
Stream.generate(() -> "x");      // 无限生成
Stream.iterate(1, n -> n + 2);   // 1,3,5,...（Java 9+ 可加终止条件）
Stream.iterate(1, n -> n < 100, n -> n + 2);
```

---

## 5. 中间操作

### 5.1 filter 过滤

```java
List<Integer> evens = Stream.of(1,2,3,4,5,6).filter(n -> n % 2 == 0).toList();
// [2, 4, 6]
```

### 5.2 map 映射

```java
List<String> upper = Stream.of("a","b","c").map(String::toUpperCase).toList();
// [A, B, C]

List<Integer> lens = Stream.of("abc","de").map(String::length).toList();
// [3, 2]
```

### 5.3 flatMap 扁平化

把"流的流"拍平：

```java
List<List<Integer>> nested = List.of(List.of(1,2), List.of(3,4), List.of(5));
List<Integer> flat = nested.stream().flatMap(List::stream).toList();
// [1, 2, 3, 4, 5]

// 分词扁平化
List<String> words = Stream.of("hello world", "java stream")
    .flatMap(line -> Arrays.stream(line.split(" ")))
    .toList();
// [hello, world, java, stream]
```

### 5.4 sorted 排序

```java
Stream.of(3,1,2).sorted().toList();              // [1,2,3] 自然序
Stream.of(3,1,2).sorted(Comparator.reverseOrder()).toList();  // [3,2,1]
list.stream().sorted(Comparator.comparing(Student::getScore).reversed()).toList();
```

### 5.5 distinct / limit / skip / peek

```java
Stream.of(1,2,2,3,3,3).distinct().toList();      // [1,2,3] 去重
Stream.of(1,2,3,4,5).limit(3).toList();          // [1,2,3] 取前 N
Stream.of(1,2,3,4,5).skip(2).toList();           // [3,4,5] 跳过 N
Stream.of(1,2,3).peek(System.out::println).count();  // peek 调试（中间操作）
```

::: tip peek 用于调试
`peek` 是中间操作，常用于在不影响流水线时打印元素调试。但不要用 peek 改状态（有副作用，违反无状态原则）。
:::

---

## 6. 终端操作

终端操作触发流水线执行并产出结果。

### 6.1 归约 reduce

```java
int sum = Stream.of(1,2,3,4).reduce(0, Integer::sum);          // 10
Optional<Integer> product = Stream.of(1,2,3,4).reduce((a,b) -> a*b);  // Optional[24]
```

### 6.2 聚合 count/min/max

```java
long count = stream.count();
Optional<Integer> min = stream.min(Comparator.naturalOrder());
Optional<Integer> max = stream.max(Comparator.naturalOrder());
```

### 6.3 匹配与查找

```java
boolean anyMatch = stream.anyMatch(n -> n > 3);    // 任一满足
boolean allMatch = stream.allMatch(n -> n > 0);    // 全部满足
boolean noneMatch = stream.noneMatch(n -> n < 0);  // 全不满足
Optional<Integer> first = stream.findFirst();       // 第一个
```

### 6.4 forEach 遍历

```java
stream.forEach(System.out::println);    // 终端操作，消费流
```

### 6.5 collect 收集（最常用）

见下一节。

---

## 7. 收集器 Collectors

`Collectors` 提供丰富的终端收集器。

### 7.1 toList / toSet / toMap

```java
List<String> list = stream.collect(Collectors.toList());
Set<String> set = stream.collect(Collectors.toSet());

// toMap：键冲突需指定合并函数
Map<String, Integer> map = students.stream()
    .collect(Collectors.toMap(Student::getName, Student::getScore, (a,b) -> a));
```

::: warning toMap 键重复
`toMap` 遇到重复键默认抛 `IllegalStateException`。必须传合并函数 `(old, new) -> ...` 决定保留哪个。
:::

### 7.2 joining 拼接

```java
String s = Stream.of("a","b","c").collect(Collectors.joining(", ", "[", "]"));
// [a, b, c]
```

### 7.3 groupingBy 分组

```java
// 按班级分组
Map<String, List<Student>> byClass = students.stream()
    .collect(Collectors.groupingBy(Student::getClassName));

// 二级分组 + 下游收集器
Map<String, Long> countByClass = students.stream()
    .collect(Collectors.groupingBy(Student::getClassName, Collectors.counting()));

// 按班级求平均分
Map<String, Double> avgByClass = students.stream()
    .collect(Collectors.groupingBy(Student::getClassName,
              Collectors.averagingDouble(Student::getScore)));

// 分区（true/false 两组）
Map<Boolean, List<Student>> passFail = students.stream()
    .collect(Collectors.partitioningBy(s -> s.getScore() >= 60));
```

### 7.4 统计

```java
IntSummaryStatistics stats = students.stream()
    .mapToInt(Student::getScore)
    .summaryStatistics();
stats.getCount();   // 数量
stats.getSum();     // 总和
stats.getAverage(); // 平均
stats.getMin();
stats.getMax();
```

---

## 8. 数值流与并行流

### 8.1 数值流

```java
int sum = IntStream.rangeClosed(1, 100).sum();      // 5050
double avg = IntStream.of(1,2,3,4).average().orElse(0);
IntStream.range(0, list.size()).forEach(i -> ...);  // 需要索引时
```

### 8.2 并行流

`.parallel()` 自动分片并行执行（底层 ForkJoinPool）：

```java
long count = list.parallelStream().filter(this::isPrime).count();
```

::: warning 并行流慎用
- 仅数据量大（万级以上）且任务计算密集时才有收益，小数据反而更慢（分片开销）。
- 任务之间无状态依赖、无顺序要求。
- 共享可变状态会引发线程安全问题。
- 底层用公共 ForkJoinPool，阻塞任务会拖慢其他并行流。简单场景用，复杂场景用自定义线程池 + CompletableFuture。
:::

---

## 9. Optional 空值安全

`Optional<T>` 是容器，明确表示"可能有值也可能没有"，强制调用方处理空值，替代 null。

```java
Optional<String> opt = Optional.of("hello");        // 非空包装（null 会 NPE）
Optional<String> opt2 = Optional.ofNullable(null);  // 允许 null
Optional<String> opt3 = Optional.empty();           // 空

// 判断与获取
opt.isPresent();      // true
opt.isEmpty();        // false（Java 11+）
opt.get();            // hello（空时 NoSuchElementException，慎用）

// 安全消费
opt.ifPresent(System.out::println);

// 默认值
String s1 = opt.orElse("default");                       // 空则默认
String s2 = opt.orElseGet(() -> expensiveDefault());     // 空则惰性计算
String s3 = opt.orElseThrow();                           // 空则抛 NoSuchElementException
String s4 = opt.orElseThrow(() -> new BizException());   // 空则抛指定异常

// 转换（链式）
opt.map(String::toUpperCase)         // Optional[HELLO]
   .filter(s -> s.length() > 3)
   .orElse("default");

// flatMap（函数返回 Optional 时用）
opt.flatMap(this::find)              // 避免 Optional<Optional<T>>
```

::: tip Optional 使用原则
- **作方法返回类型**，明确表达"可能无结果"，强制调用方处理。
- **不要作字段类型**（不被序列化，浪费空间）。
- **不要作方法参数**（增加调用复杂度，直接用可空参数即可）。
- 不要 `opt.get()` 不检查，那就退化回 null 的危险。
:::

::: warning Optional 不是万能
`Optional` 仍可能在内容为 null 时出问题，且 `orElseThrow()` 后续链式会 NPE。它降低了 NPE 概率但不能根除。返回值用，局部变量少用。
:::

---

## 10. 综合案例：学生成绩分析

综合 Stream 全套操作：

```java
import java.util.*;
import java.util.stream.*;

record Student(String name, String className, int score) {}

public class GradeAnalysis {
    public static void main(String[] args) {
        List<Student> students = List.of(
            new Student("Tom", "A班", 85),
            new Student("Jerry", "A班", 92),
            new Student("Alice", "B班", 78),
            new Student("Bob", "B班", 65),
            new Student("Eve", "A班", 55),
            new Student("Mike", "B班", 95)
        );

        // 1. 所有及格学生姓名（大写）
        List<String> passed = students.stream()
            .filter(s -> s.score() >= 60)
            .map(s -> s.name().toUpperCase())
            .sorted()
            .toList();
        System.out.println("及格: " + passed);   // [ALICE, BOB, JERRY, MIKE, TOM]

        // 2. 按班级分组
        Map<String, List<Student>> byClass = students.stream()
            .collect(Collectors.groupingBy(Student::className));
        System.out.println("分组: " + byClass);

        // 3. 各班平均分
        Map<String, Double> avg = students.stream()
            .collect(Collectors.groupingBy(Student::className,
                      Collectors.averagingInt(Student::score)));
        System.out.println("各班均分: " + avg);   // {A班=77.33..., B班=79.33...}

        // 4. 最高分学生
        Student top = students.stream()
            .max(Comparator.comparingInt(Student::score))
            .orElseThrow();
        System.out.println("最高分: " + top);     // Student[name=Mike, className=B班, score=95]

        // 5. 每班最高分（groupingBy + downstream max）
        Map<String, Optional<Student>> topPerClass = students.stream()
            .collect(Collectors.groupingBy(Student::className,
                      Collectors.maxBy(Comparator.comparingInt(Student::score))));
        topPerClass.forEach((c, s) -> System.out.println(c + " 最高: " + s.get()));

        // 6. 总分
        int total = students.stream().mapToInt(Student::score).sum();
        System.out.println("总分: " + total);     // 470

        // 7. 成绩分布（分区）
        Map<Boolean, List<Student>> passFail = students.stream()
            .collect(Collectors.partitioningBy(s -> s.score() >= 60));
        System.out.println("不及格: " + passFail.get(false).stream().map(Student::name).toList());
    }
}
```

这个案例串联了 `filter`/`map`/`sorted`/`groupingBy`/`max`/`partitioningBy`/`mapToInt` 等核心操作，展示了声明式数据处理的表达力。

---

## 小结

| 主题 | 关键点 |
|------|--------|
| 函数式接口 | 单抽象方法；JDK 内置 `Function`/`Predicate`/`Consumer`/`Supplier` |
| Lambda | `(a,b) -> expr`；捕获 effectively final 变量 |
| 方法引用 | `::` 四种形式，优先于 Lambda |
| Stream | 惰性中间操作 + 触发终端操作；一次性 |
| 中间操作 | filter/map/flatMap/sorted/distinct/limit/skip/peek |
| 终端操作 | reduce/count/min/max/match/find/forEach/collect |
| 收集器 | toList/toMap/groupingBy/partitioningBy/joining |
| 并行流 | 大数据计算密集用，慎共享状态 |
| Optional | 返回值表达"可能空"，链式 map/filter/orElse |

下一篇进入**反射与动态代理**，揭开框架底层的魔法。

::: tip 下一篇预告
《11 - 反射与动态代理》：`Class` 对象、运行时获取/调用成员、`setAccessible` 突破访问控制、JDK 动态代理、类加载与双亲委派。
:::
