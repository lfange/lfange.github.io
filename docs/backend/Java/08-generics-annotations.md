---
title: 泛型与注解
category:
  - 后端
tag:
  - Java
---

# 泛型与注解

> 本篇是《Java 从入门到精通》第 08 篇。泛型让代码类型安全、可复用；注解让代码携带元数据、驱动框架。两者是读懂 Spring、MyBatis 等框架的前提。

---

## 1. 为什么需要泛型

没有泛型时，集合存 `Object`，取出来要强转，运行期才报错：

```java
// 泛型前（Java 5 之前）
List list = new ArrayList();
list.add("hello");
list.add(123);              // 编译通过，混入异类
String s = (String) list.get(1);   // 运行时 ClassCastException

// 泛型后
List<String> list2 = new ArrayList<>();
list2.add("hello");
// list2.add(123);          // 编译期就报错，类型安全
String s2 = list2.get(0);   // 无需强转
```

泛型的好处：**编译期类型检查**、**消除强转**、**代码复用**（一份算法适用多类型）。

---

## 2. 泛型类与接口

### 2.1 泛型类

```java
public class Box<T> {       // T 是类型参数
    private T item;
    public void put(T item) { this.item = item; }
    public T get() { return item; }
}

Box<String> strBox = new Box<>();
strBox.put("hello");
String s = strBox.get();    // 无需强转

Box<Integer> intBox = new Box<>();
intBox.put(100);
```

### 2.2 多类型参数

```java
public class Pair<K, V> {
    private final K key;
    private final V value;
    public Pair(K key, V value) { this.key = key; this.value = value; }
    public K getKey() { return key; }
    public V getValue() { return value; }
}

Pair<String, Integer> p = new Pair<>("age", 18);
```

### 2.3 泛型接口

```java
public interface Repository<T> {
    void save(T entity);
    T findById(String id);
}

public class UserRepository implements Repository<User> {   // 指定 T = User
    @Override public void save(User u) { ... }
    @Override public User findById(String id) { ... }
}

// 也可保留泛型
public abstract class BaseRepo<T> implements Repository<T> { ... }
```

::: tip 类型参数命名约定
`T` Type、`E` Element（集合元素）、`K` Key、`V` Value、`R` Result、`N` Number。单字母大写。
:::

---

## 3. 泛型方法

泛型方法在**返回值前**声明类型参数，作用域仅限该方法：

```java
public class Util {
    // <T> 声明类型参数，T 是返回类型
    public static <T> T pick(T a, T b, boolean useFirst) {
        return useFirst ? a : b;
    }

    // 多类型
    public static <K, V> Pair<K, V> makePair(K k, V v) {
        return new Pair<>(k, v);
    }
}

String s = Util.pick("A", "B", true);          // T 推断为 String
Integer i = Util.pick(1, 2, false);            // T 推断为 Integer
Pair<String, Integer> p = Util.makePair("age", 18);
```

::: tip 泛型类 vs 泛型方法
泛型类的 `T` 作用整个类；泛型方法的 `<T>` 作用单个方法，且独立于类是否泛型。静态方法不能用类的类型参数，必须自己声明 `<T>`。
:::

---

## 4. 类型通配符与 PECS

通配符 `?` 表示"未知类型"，配合 `extends`/`super` 限定边界。**PECS 原则**是泛型使用的核心：

- **P**roducer **E**xtends：如果集合是**生产者**（只读取出），用 `? extends T`。
- **C**onsumer **S**uper：如果集合是**消费者**（只写入），用 `? super T`。

### 4.1 上界通配符 ? extends

```java
// Number 的子类（Integer、Double 等）
public static double sum(List<? extends Number> nums) {
    double total = 0;
    for (Number n : nums) {     // 读：安全，能当 Number 读
        total += n.doubleValue();
    }
    // nums.add(1);             // ❌ 写：不允许（编译器不知具体是哪个子类）
    return total;
}

sum(List.of(1, 2, 3));          // List<Integer>
sum(List.of(1.0, 2.0));         // List<Double>
```

`? extends Number` 是**生产者**：能读出 Number，但不能写入（不知具体子类）。

### 4.2 下界通配符 ? super

```java
// Number 或其父类
public static void addNumbers(List<? super Number> nums) {
    nums.add(1);                // ✅ 写：安全，Number 的子类都能加
    nums.add(2.0);
    // Number n = nums.get(0);  // ❌ 读：只能读出 Object（不知具体父类）
}

addNumbers(new ArrayList<Number>());
addNumbers(new ArrayList<Object>());
```

`? super Number` 是**消费者**：能写入 Number 及子类，但读出只能当 Object。

### 4.3 PECS 实战：复制方法

```java
// src 是生产者（读出 T），dst 是消费者（写入 T）
public static <T> void copy(List<? super T> dst, List<? extends T> src) {
    for (T item : src) {
        dst.add(item);
    }
}

List<Integer> ints = List.of(1, 2, 3);
List<Number> nums = new ArrayList<>();
copy(nums, ints);              // Number 消费 Integer，OK
```

`Collections.copy` 就是这样设计的。记住 PECS，泛型 API 设计不迷糊。

::: tip 无界通配符 ?
`List<?>` 表示"某种未知类型的 List"，只能读出 Object，不能写入（除 null）。用于"我不关心元素类型，只想用 List 的通用方法"（如 `size()`、`contains(null)`）。
:::

---

## 5. 类型擦除

Java 泛型是**编译期**机制：编译时检查类型，运行时**擦除**泛型信息，`List<String>` 和 `List<Integer>` 运行时都是同一个 `List` 类。

```java
List<String> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
System.out.println(a.getClass() == b.getClass());   // true，运行时无泛型
```

### 5.1 擦除的后果

```java
// ❌ 不能用基本类型作类型参数（要包装类）
// List<int> wrong;        // 编译错误
List<Integer> ok;

// ❌ 不能 new 泛型类型
// T item = new T();       // 编译错误
// new T[10];              // 编译错误

// ❌ 不能用泛型类类型做 instanceof
// if (x instanceof List<String>)   // 编译错误
if (x instanceof List<?>) {}        // ✅ 只能用无界通配

// ❌ 不能创建泛型数组
// List<String>[] arr = new List<String>[10];   // 编译错误

// 静态字段/方法不能用类的类型参数
class Foo<T> {
    // static T x;          // 编译错误
}
```

### 5.2 运行时获取泛型

擦除后无法直接获取 `T.class`，但可通过反射从继承/签名中提取（如 Spring 的 `ResolvableType`、`TypeReference<T>` 模式）：

```java
// 通过匿名子类保留泛型签名（Jackson TypeReference 原理）
abstract class TypeRef<T> {}
TypeRef<String> ref = new TypeRef<>() {};   // 匿名子类，签名保留
// 反射可提取 String（见第11篇反射）
```

::: tip 为什么 Java 选擦除
Java 5 引入泛型时为兼容 1.4 的非泛型集合（同一份 `List` 类），选择擦除实现，牺牲了部分表达力换取二进制兼容。Kotlin/Scala 在 JVM 上同样受此约束。
:::

---

## 6. 注解基础

注解（Annotation）是附加在代码上的元数据，本身不执行逻辑，由编译器或框架读取处理。

### 6.1 内置注解

```java
@Override              // 标记重写父类方法，编译器检查
public String toString() { return "..."; }

@Deprecated            // 标记废弃，使用会有警告
public void oldMethod() {}

@SuppressWarnings("unchecked")    // 抑制警告
List raw = new ArrayList();

@FunctionalInterface   // 标记函数式接口（见第04/10篇）
interface Foo { void bar(); }
```

### 6.2 元注解

元注解是"注解注解的注解"，定义注解的行为：

| 元注解 | 作用 |
|--------|------|
| `@Target` | 注解能用在哪些位置（TYPE/FIELD/METHOD/PARAMETER 等） |
| `@Retention` | 注解保留到何时（SOURCE/CLASS/RUNTIME） |
| `@Documented` | 出现在 Javadoc 中 |
| `@Inherited` | 子类可继承（仅对类有效） |
| `@Repeatable` | 可重复标注 |

---

## 7. 自定义注解

### 7.1 定义注解

```java
import java.lang.annotation.*;

@Target(ElementType.METHOD)                 // 只能用于方法
@Retention(RetentionPolicy.RUNTIME)         // 运行时保留（反射可读）
public @interface TestCase {
    String name() default "";               // 注解属性，default 给默认值
    int timeout() default 0;
    String[] tags() default {};
}
```

注解属性语法像方法调用，类型只能是：基本类型、String、枚举、Class、注解、及它们的数组。

### 7.2 使用注解

```java
public class Calc {
    @TestCase(name = "加法测试", tags = {"basic", "math"})
    public int add(int a, int b) { return a + b; }

    @TestCase(name = "除法测试", timeout = 100)
    public double div(int a, int b) { return (double) a / b; }

    @TestCase                              // 用默认值
    public int sub(int a, int b) { return a - b; }
}
```

### 7.3 Retention 三种策略

```java
@Retention(RetentionPolicy.SOURCE)     // 仅源码，编译后丢弃（如 @Override、Lombok）
@Retention(RetentionPolicy.CLASS)      // 编译进 class，运行时不保留（默认）
@Retention(RetentionPolicy.RUNTIME)    // 运行时可反射读取（框架用，如 Spring）
```

::: tip 框架注解都用 RUNTIME
`@Component`、`@RequestMapping`、`@Test` 等需要在运行时被反射读取，故 `@Retention(RUNTIME)`。Lombok 的 `@Data` 是 `SOURCE`（编译期生成代码后丢弃）。
:::

---

## 8. 注解处理实战

运行时通过反射读取注解（反射第 11 篇详述，这里先演示注解的作用）：

```java
import java.lang.reflect.*;

public class TestRunner {
    public static void main(String[] args) throws Exception {
        Class<?> clazz = Calc.class;
        for (Method m : clazz.getDeclaredMethods()) {
            if (m.isAnnotationPresent(TestCase.class)) {      // 是否有该注解
                TestCase tc = m.getAnnotation(TestCase.class); // 获取注解
                System.out.printf("运行测试 [%s] tags=%s timeout=%d%n",
                        tc.name(), java.util.Arrays.toString(tc.tags()), tc.timeout());

                // 反射调用方法（参数按需构造，此处以无参为例）
                m.setAccessible(true);
                // m.invoke(new Calc(), ...);
            }
        }
    }
}
```

::: tip 注解 + 反射 = 框架基石
Spring 扫描 `@Component` 注册 Bean、Junit 发现 `@Test` 运行测试、MyBatis 映射 `@Insert` 执行 SQL--本质都是"运行时反射读注解 + 按注解元数据执行逻辑"。第 11 篇会深入反射。
:::

---

## 9. 综合案例：简易依赖注入

用自定义注解 + 反射模拟一个极简依赖注入：

```java
import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

// 1. 定义注解
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@interface Autowired {}

class UserDao {
    public String findName() { return "Tom"; }
}

class UserService {
    @Autowired
    private UserDao userDao;        // 字段注入标记

    public String greet() { return "Hello, " + userDao.findName(); }
}

// 简易容器：扫描 @Component，注入 @Autowired 字段
class Container {
    private final Map<Class<?>, Object> beans = new HashMap<>();

    public void register(Class<?>... classes) throws Exception {
        for (Class<?> c : classes) {
            Object bean = c.getDeclaredConstructor().newInstance();
            beans.put(c, bean);
        }
        // 注入依赖
        for (Object bean : beans.values()) {
            for (Field f : bean.getClass().getDeclaredFields()) {
                if (f.isAnnotationPresent(Autowired.class)) {
                    Object dep = beans.get(f.getType());
                    f.setAccessible(true);
                    f.set(bean, dep);        // 反射注入
                }
            }
        }
    }

    @SuppressWarnings("unchecked")
    public <T> T get(Class<T> type) { return (T) beans.get(type); }
}

// 测试
public class Demo {
    public static void main(String[] args) throws Exception {
        Container c = new Container();
        c.register(UserDao.class, UserService.class);
        UserService service = c.get(UserService.class);
        System.out.println(service.greet());   // Hello, Tom
    }
}
```

这个案例展示了注解定义、`@Retention(RUNTIME)`、反射读字段注解、反射设值注入的完整链路--Spring IoC 的极简内核。

---

## 小结

| 主题 | 关键点 |
|------|--------|
| 泛型类/接口/方法 | `<T>` 类型参数；泛型方法在返回值前声明 |
| 通配符 | `? extends T` 读（生产者）、`? super T` 写（消费者），PECS |
| 类型擦除 | 编译期检查、运行时擦除；不能 new T、不能基本类型参数 |
| 内置注解 | `@Override`/`@Deprecated`/`@SuppressWarnings`/`@FunctionalInterface` |
| 元注解 | `@Target`/`@Retention`/`@Inherited`/`@Repeatable` |
| 自定义注解 | `@interface`，属性像方法，RUNTIME 才能反射读 |
| 注解处理 | 反射 `isAnnotationPresent`/`getAnnotation`，框架基石 |

下一篇进入 Java 进阶的硬核领域--**多线程与并发**。

::: tip 下一篇预告
《09 - 多线程与并发》：线程创建、生命周期、`synchronized`/`volatile`、`java.util.concurrent`（锁、原子类、并发集合）、线程池、`CompletableFuture`、虚拟线程。
:::
