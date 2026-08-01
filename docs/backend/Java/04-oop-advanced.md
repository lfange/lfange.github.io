---
title: 面向对象进阶
category:
  - 后端
tag:
  - Java
---

# 面向对象进阶

> 本篇是《Java 从入门到精通》第 04 篇，覆盖 Java OOP 的精华：**继承、多态、抽象类、接口、内部类、枚举、Object 通用方法**，并引入设计模式。学完之后，你将能读懂 Spring 等主流框架的设计思路。

---

## 1. 继承

继承让子类获得父类的字段和方法，实现代码复用。Java 用 `extends` 表示继承，**单继承**（一个类只能有一个直接父类）。

### 1.1 基本继承

```java
public class Animal {
    String name;

    public Animal(String name) {
        this.name = name;
    }

    public void eat() {
        System.out.println(name + " 在吃东西");
    }
}

public class Dog extends Animal {
    String breed;

    public Dog(String name, String breed) {
        super(name);          // 调用父类构造，必须放首行
        this.breed = breed;
    }

    public void bark() {
        System.out.println(name + " 汪汪叫");
    }
}

Dog d = new Dog("旺财", "金毛");
d.eat();      // 旺财 在吃东西（继承自父类）
d.bark();     // 旺财 汪汪叫
```

### 1.2 super 关键字

`super` 指向**父类**的引用，三种用途：

- `super(...)`：调用父类构造方法（首行）。
- `super.字段`：访问父类字段（被子类遮蔽时）。
- `super.方法()`：调用父类方法（被重写后仍想调用原版）。

### 1.3 Object 类

所有类的隐式根父类。一个类不写 `extends`，默认继承 `Object`。`Object` 提供了通用方法：

| 方法 | 用途 |
|------|------|
| `toString()` | 对象字符串表示，默认是 `类名@哈希` |
| `equals(Object)` | 判断相等，默认比较引用（`==`） |
| `hashCode()` | 哈希码，与 equals 协作用于哈希容器 |
| `getClass()` | 返回运行时类对象 |
| `clone()` | 浅拷贝（需实现 Cloneable） |
| `wait()/notify()/notifyAll()` | 线程同步（见第 09 篇） |

::: warning 单继承与接口
Java 类单继承（避免菱形继承复杂度），但一个类可实现**多个接口**，接口可多继承。这平衡了复用与灵活。
:::

---

## 2. 方法重写（Override）

子类可重写父类的非 final、非 private、非 static 方法，提供自己的实现。

### 2.1 基本重写

```java
public class Animal {
    public String sound() {
        return "...";
    }
}

public class Dog extends Animal {
    @Override                  // 注解，编译器检查是否正确重写
    public String sound() {
        return "汪汪";
    }
}

new Dog().sound();    // 汪汪
```

### 2.2 重写规则（"两同两小一大"）

- **两同**：方法名相同、参数列表相同。
- **两小**：子类返回值类型 ≤ 父类（协变返回，如父返回 Animal，子可返回 Dog）；子类抛出异常 ≤ 父类。
- **一大**：子类访问权限 ≥ 父类（父 protected，子可 public，不能 private）。

::: warning 不可重写的成员
- `private` 方法：子类访问不到，谈不上重写（写了叫"新方法"）。
- `static` 方法：不参与多态，子类同名 static 是"隐藏"（hide）非重写。
- `final` 方法：明确禁止重写。
:::

### 2.3 @Override 注解

强烈建议重写时加 `@Override`。它能：让编译器帮你检查方法签名是否真的重写了父类方法（拼错方法名、参数对不上时立即报错），是防错利器。

---

## 3. 多态

多态是 OOP 的核心威力：**父类引用指向子类对象**，调用重写方法时，运行时根据**实际对象类型**决定执行哪个实现（动态绑定）。

### 3.1 向上转型

```java
Animal a = new Dog("旺财", "金毛");   // 子类对象赋给父类引用（向上转型，自动）
a.eat();        // 旺财 在吃东西（继承的方法）
a.sound();      // 汪汪（重写的方法，动态绑定到 Dog）
// a.bark();    // 编译错误：Animal 引用看不到 Dog 特有方法
```

### 3.2 动态绑定

```java
public class Main {
    public static void main(String[] args) {
        Animal[] animals = {
            new Dog(), new Cat(), new Dog()
        };
        for (Animal a : animals) {
            System.out.println(a.sound());   // 同一调用，不同结果
        }
        // 汪
        // 喵
        // 汪
    }
}
```

编译期看 `Animal.sound()`，运行期 JVM 根据 `a` 实际指向的对象类型（Dog/Cat）调用对应重写方法。这就是多态的本质。

### 3.3 向下转型与 instanceof

父类引用要调用子类特有方法，需**强转**回子类类型：

```java
Animal a = new Dog();
Dog d = (Dog) a;       // 向下转型，需强转
d.bark();

// 安全转型：先判断
if (a instanceof Dog) {
    Dog dog = (Dog) a;
    dog.bark();
}

// Java 16+ 模式匹配
if (a instanceof Dog dog) {     // 同时转型并声明变量
    dog.bark();
}
```

::: warning 强转风险
不兼容类型强转会抛 `ClassCastException`。强转前务必用 `instanceof` 检查，或用 16+ 的模式匹配语法。
:::

---

## 4. 抽象类

抽象类用 `abstract` 修饰，**不能实例化**，用于为子类定义通用模板。可含抽象方法（无实现）和具体方法。

```java
public abstract class Shape {
    // 抽象方法：无方法体，子类必须实现
    public abstract double area();

    public abstract double perimeter();

    // 具体方法：子类直接复用
    public void describe() {
        System.out.printf("面积=%.2f，周长=%.2f%n", area(), perimeter());
    }
}

public class Circle extends Shape {
    private double r;
    public Circle(double r) { this.r = r; }

    @Override
    public double area() { return Math.PI * r * r; }

    @Override
    public double perimeter() { return 2 * Math.PI * r; }
}

// Shape s = new Shape();    // 编译错误：抽象类不能实例化
Circle c = new Circle(2);
c.describe();   // 面积=12.57，周长=12.57
```

::: tip 抽象类 vs 普通类
抽象类只是多了"不能 new"和"可含抽象方法"两点。它可有构造方法（供子类 super 调用）、字段、具体方法。当一组类有共享的"模板逻辑 + 待实现的钩子"时用抽象类。
:::

---

## 5. 接口

接口是**纯抽象契约**，定义"能做什么"的能力。Java 8+ 后接口可含 `default` 和 `static` 方法，能力大增。

### 5.1 定义与实现

```java
public interface Flyable {
    void fly();                          // 抽象方法（默认 public abstract）
}

public interface Swimmer {
    void swim();
}

// 类可实现多个接口
public class Duck implements Flyable, Swimmer {
    @Override
    public void fly() { System.out.println("鸭子飞"); }

    @Override
    public void swim() { System.out.println("鸭子游"); }
}

Duck d = new Duck();
d.fly();     // 鸭子飞
d.swim();    // 鸭子游
```

### 5.2 default 方法（Java 8+）

接口方法可用 `default` 提供默认实现，解决接口升级的兼容问题（加方法不破坏已实现类）：

```java
public interface Vehicle {
    default void start() {
        System.out.println("启动引擎");
    }
    default void stop() {
        System.out.println("熄火");
    }
}

public class Car implements Vehicle {
    // 不写 start/stop，直接复用默认实现
}
new Car().start();   // 启动引擎
```

::: tip default 方法的价值
Java 8 给 `List`、`Collection` 加了 `stream()`、`forEach()` 等 default 方法，老代码无需改造即可用新 API。这是接口演进的关键能力。
:::

### 5.3 static 方法（Java 8+）

接口可含静态方法，常用于工具方法：

```java
public interface StringHelper {
    static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}

StringHelper.isBlank("  ");    // true
```

### 5.4 接口继承

接口可多继承接口：

```java
public interface Readable { String read(); }
public interface Writable { void write(String s); }
public interface IO extends Readable, Writable {   // 多继承
    default void copy(IO other) {
        other.write(this.read());
    }
}
```

### 5.5 抽象类 vs 接口

| 特性 | 抽象类 | 接口 |
|------|--------|------|
| 关系 | `extends` 单继承 | `implements` 多实现 |
| 字段 | 可有实例字段（任意状态） | 只能有 `public static final` 常量 |
| 构造方法 | 有 | 无 |
| 方法 | 抽象 + 具体均可 | 抽象 + default + static |
| 设计语义 | "是什么"（is-a，有共同本质） | "能做什么"（can-do，有能力契约） |

::: tip 怎么选
有共享**状态与代码**、明确的继承层级 -> 抽象类（如 `AbstractList`）。
定义**能力契约**、需要多继承/混入 -> 接口（如 `Comparable`、`Runnable`）。
Java 生态更推崇**面向接口编程**。
:::

### 5.6 函数式接口

**只有一个抽象方法**的接口（`default`/`static` 方法不计），可用 `@FunctionalInterface` 标注。这是 Lambda 的基础（第 10 篇详述）：

```java
@FunctionalInterface
public interface Greeter {
    void greet(String name);
}

Greeter g = name -> System.out.println("Hi, " + name);   // Lambda
g.greet("Tom");   // Hi, Tom
```

---

## 6. 内部类

定义在类内部的类。Java 有四种内部类，各有用途。

### 6.1 成员内部类

持有外部类引用，可访问外部类私有成员：

```java
public class Outer {
    private int x = 10;

    class Inner {
        void show() {
            System.out.println(x);      // 访问外部类私有字段
            System.out.println(Outer.this.x);   // 显式引用外部实例
        }
    }
}

Outer.Inner inner = new Outer().new Inner();
inner.show();   // 10
```

### 6.2 静态内部类（最常用）

不持有外部类引用，类似独立类，只是逻辑上归属外部类。集合框架大量使用（如 `Map.Entry`）：

```java
public class Outer {
    static int x = 10;

    static class StaticInner {
        void show() {
            System.out.println(x);      // 只能访问外部类静态成员
        }
    }
}

Outer.StaticInner inner = new Outer.StaticInner();   // 无需外部实例
```

::: tip 优先用静态内部类
当内部类不需要访问外部类实例成员时，声明为 `static`，避免无谓持有外部引用（内存泄漏隐患）。Builder 模式、Map.Entry 都是静态内部类。
:::

### 6.3 局部内部类

定义在方法内，作用域仅限方法：

```java
public void process() {
    class Helper {
        void run() { System.out.println("局部内部类"); }
    }
    new Helper().run();
}
```

### 6.4 匿名内部类

没有名字的内部类，常用于"即时实现接口/继承类"：

```java
Runnable r = new Runnable() {       // 匿名实现 Runnable
    @Override
    public void run() {
        System.out.println("运行中");
    }
};
r.run();

// 匿名子类
Animal a = new Animal("无名") {     // 匿名继承 Animal
    @Override
    public void eat() {
        System.out.println("匿名动物在吃");
    }
};
```

::: tip Lambda 替代匿名内部类
Java 8+，函数式接口的匿名内部类可用更简洁的 Lambda 替代：

```java
Runnable r = () -> System.out.println("运行中");   // 比 new Runnable 更简洁
```
:::

---

## 7. 枚举（enum）

枚举表示一组有限的常量值，是类型安全的（编译期检查，避免魔法字符串）。Java 的 `enum` 本质是继承 `java.lang.Enum` 的 final 类。

### 7.1 基本枚举

```java
public enum Color {
    RED, GREEN, BLUE
}

Color c = Color.RED;
System.out.println(c);             // RED
System.out.println(c.name());      // RED
System.out.println(c.ordinal());   // 0（序号，慎用，易因顺序变化出 bug）

Color[] all = Color.values();
Color g = Color.valueOf("GREEN");  // 按名查
```

### 7.2 带属性与方法的枚举

```java
public enum OrderStatus {
    PENDING(0, "待支付"),
    PAID(1, "已支付"),
    SHIPPED(2, "已发货"),
    DONE(3, "已完成");

    private final int code;
    private final String desc;

    // 构造默认 private
    OrderStatus(int code, String desc) {
        this.code = code;
        this.desc = desc;
    }

    public int getCode() { return code; }
    public String getDesc() { return desc; }

    public static OrderStatus of(int code) {
        for (OrderStatus s : values()) {
            if (s.code == code) return s;
        }
        throw new IllegalArgumentException("未知状态码: " + code);
    }
}

OrderStatus s = OrderStatus.PAID;
System.out.println(s.getCode() + ":" + s.getDesc());   // 1:已支付
System.out.println(OrderStatus.of(2));                 // SHIPPED
```

### 7.3 枚举实现接口 / 含抽象方法

```java
public enum Operation {
    PLUS("+") { public double apply(double a, double b) { return a + b; } },
    MINUS("-") { public double apply(double a, double b) { return a - b; } },
    TIMES("*") { public double apply(double a, double b) { return a * b; } };

    private final String symbol;
    Operation(String s) { this.symbol = s; }
    public abstract double apply(double a, double b);   // 每个枚举常量各自实现
}

System.out.println(Operation.PLUS.apply(3, 4));   // 7.0
```

::: tip 枚举实现单例
枚举实例天然单例、线程安全、防反序列化破坏，是《Effective Java》推荐的实现单例最佳方式：

```java
public enum Singleton {
    INSTANCE;
    public void doWork() { ... }
}
// 使用：Singleton.INSTANCE.doWork();
```
:::

### 7.4 枚举与 switch 完美配合

```java
switch (status) {
    case PENDING -> handlePending();
    case PAID -> handlePaid();
    case SHIPPED -> handleShipped();
    case DONE -> handleDone();
    // 无需 default：编译器能检查是否覆盖所有枚举值
}
```

---

## 8. Object 通用方法重写

### 8.1 toString()

返回对象字符串表示，便于调试与日志。默认返回 `类名@十六进制哈希`，应重写：

```java
@Override
public String toString() {
    return "Student{name='" + name + "', age=" + age + "}";
}
```

`println(obj)`、字符串拼接 `"" + obj` 会自动调用 `toString()`。

### 8.2 equals() 与 hashCode()

默认 `equals` 比较引用（同 `==`）。业务上常需按"内容"判等，须重写。**契约：相等的对象必须有相同的 hashCode**。

```java
public class Student {
    private String name;
    private int age;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                       // 同一引用
        if (!(o instanceof Student student)) return false; // 类型检查 + 模式匹配
        return age == student.age && Objects.equals(name, student.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name, age);     // 用参与 equals 的字段算哈希
    }
}
```

::: warning 为什么重写 equals 必须重写 hashCode
`HashSet`/`HashMap` 先用 hashCode 定位桶、再用 equals 判等。若两个对象 equals 相等但 hashCode 不同，会被放进不同桶，导致集合中出现"重复"对象。**equals 用了哪些字段，hashCode 就必须用哪些字段。**
:::

::: tip IDE / Lombok 自动生成
IDEA 右键 Generate -> equals() and hashCode() 可自动生成。Lombok 的 `@EqualsAndHashCode` 注解一键生成。Java 16+ 的 `record` 自动生成 equals/hashCode/toString（见第 13 篇）。
:::

---

## 9. 设计模式入门

### 9.1 单例模式

确保全局唯一实例。推荐枚举实现（见 7.3），经典双重检查锁实现：

```java
public class Logger {
    private static volatile Logger instance;   // volatile 防指令重排

    private Logger() {}                        // 私有构造

    public static Logger getInstance() {
        if (instance == null) {
            synchronized (Logger.class) {
                if (instance == null) {        // 双重检查
                    instance = new Logger();
                }
            }
        }
        return instance;
    }
}
```

::: warning 单例的副作用
单例带来全局状态，增加测试难度、隐藏依赖。现代 Spring 项目用 IoC 容器管理单例 Bean，而非手写。
:::

### 9.2 工厂方法

将对象创建与使用分离：

```java
public interface Animal { String sound(); }
public class Dog implements Animal { public String sound() { return "汪"; } }
public class Cat implements Animal { public String sound() { return "喵"; } }

public class AnimalFactory {
    public static Animal create(String kind) {
        return switch (kind) {
            case "dog" -> new Dog();
            case "cat" -> new Cat();
            default -> throw new IllegalArgumentException("未知动物: " + kind);
        };
    }
}

Animal a = AnimalFactory.create("dog");
a.sound();    // 汪
```

### 9.3 模板方法

抽象类定义算法骨架，子类实现各步骤：

```java
public abstract class AbstractGame {
    public final void play() {       // 模板方法，final 防重写
        init();
        start();
        end();
    }
    protected abstract void init();
    protected abstract void start();
    protected void end() { System.out.println("游戏结束"); }
}

public class Chess extends AbstractGame {
    @Override protected void init() { System.out.println("摆棋盘"); }
    @Override protected void start() { System.out.println("下棋"); }
}
```

### 9.4 策略模式

将可变算法封装，运行时切换。Java 8+ 常配合 Lambda：

```java
public interface DiscountStrategy {
    double apply(double total);
}

public class PricingContext {
    private DiscountStrategy strategy;
    public PricingContext(DiscountStrategy s) { this.strategy = s; }
    public void setStrategy(DiscountStrategy s) { this.strategy = s; }
    public double calculate(double total) { return strategy.apply(total); }
}

PricingContext ctx = new PricingContext(t -> t);              // 不打折
ctx.calculate(400);   // 400.0
ctx.setStrategy(t -> t * 0.8);                               // VIP 八折
ctx.calculate(400);   // 320.0
ctx.setStrategy(t -> t >= 300 ? t - 50 : t);                 // 满 300 减 50
ctx.calculate(400);   // 350.0
```

---

## 10. 综合案例：电商商品模型

综合抽象类、接口、枚举、封装：

```java
import java.util.*;

// 枚举：订单状态
enum OrderStatus { PENDING, PAID, SHIPPED, DONE }

// 接口：商品描述能力
interface Describable {
    String describe();
}

// 抽象类：商品基类，含模板方法
abstract class Product implements Describable {
    protected final String sku;
    protected final String name;
    protected double price;

    public Product(String sku, String name, double price) {
        if (price <= 0) throw new IllegalArgumentException("价格须为正");
        this.sku = sku;
        this.name = name;
        this.price = price;
    }

    public double getPrice() { return price; }

    // 模板方法：描述格式固定，子类可扩展 details()
    @Override
    public final String describe() {
        return String.format("[%s] %s ¥%.2f %s", sku, name, price, details());
    }

    protected abstract String details();
}

// 具体商品：书
class Book extends Product {
    private final String author;
    public Book(String sku, String name, double price, String author) {
        super(sku, name, price);
        this.author = author;
    }
    @Override protected String details() { return "作者:" + author; }
}

// 具体商品：电子产品
class Electronics extends Product {
    private final int warrantyMonths;
    public Electronics(String sku, String name, double price, int warranty) {
        super(sku, name, price);
        this.warrantyMonths = warranty;
    }
    @Override protected String details() { return "保修:" + warrantyMonths + "月"; }
}

// 订单项
class OrderItem {
    final Product product;
    final int qty;
    OrderItem(Product p, int qty) { this.product = p; this.qty = qty; }
    double subtotal() { return product.getPrice() * qty; }
}

// 订单
class Order {
    private final String orderId;
    private final List<OrderItem> items = new ArrayList<>();
    private OrderStatus status = OrderStatus.PENDING;

    public Order(String orderId) { this.orderId = orderId; }
    public void addItem(Product p, int qty) { items.add(new OrderItem(p, qty)); }
    public double total() { return items.stream().mapToDouble(OrderItem::subtotal).sum(); }
    public void pay() {
        if (status != OrderStatus.PENDING) throw new IllegalStateException("不可支付: " + status);
        status = OrderStatus.PAID;
    }
    public OrderStatus getStatus() { return status; }
    public String getOrderId() { return orderId; }
    public List<OrderItem> getItems() { return Collections.unmodifiableList(items); }
}

// 测试
public class Demo {
    public static void main(String[] args) {
        Product p1 = new Book("B001", "Java 核心技术", 119.0, "Cay Horstmann");
        Product p2 = new Electronics("E001", "机械键盘", 499.0, 12);

        Order order = new Order("ORD-20260801-0001");
        order.addItem(p1, 2);
        order.addItem(p2, 1);

        System.out.println(p1.describe());   // [B001] Java 核心技术 ¥119.00 作者:Cay Horstmann
        System.out.println(p2.describe());   // [E001] 机械键盘 ¥499.00 保修:12月
        System.out.printf("订单 %s 总价: ¥%.2f%n", order.getOrderId(), order.total()); // ¥737.00
        System.out.println("状态: " + order.getStatus());   // PENDING

        // 多态：遍历打印每个商品描述
        for (OrderItem item : order.getItems()) {
            System.out.println(item.product.describe() + " x" + item.qty);
        }

        order.pay();
        System.out.println("支付后: " + order.getStatus());   // PAID
    }
}
```

这个案例体现了：
- **抽象类 + 模板方法**：`Product.describe()` 固定格式，`details()` 留给子类。
- **接口**：`Describable` 定义描述能力。
- **多态**：`Book`/`Electronics` 都按 `Product` 处理，调用各自 `details()`。
- **枚举**：订单状态封闭集合。
- **封装**：`Order.getItems()` 返回不可修改视图，防止外部篡改。

---

## 小结

| 主题 | 关键点 |
|------|--------|
| 继承 | `extends` 单继承；`super` 调父类；所有类继承 `Object` |
| 重写 | `@Override`；两同两小一大；private/static/final 不可重写 |
| 多态 | 父引用指子对象；动态绑定；向上/向下转型 + `instanceof` |
| 抽象类 | `abstract` 不能实例化；可有构造/字段/具体方法；is-a |
| 接口 | `implements` 多实现；default/static 方法；can-do；函数式接口 |
| 内部类 | 成员/静态（优先）/局部/匿名；优先静态内部类 |
| 枚举 | 类型安全常量；可带属性方法、实现接口、做单例 |
| Object 方法 | `toString`/`equals`/`hashCode` 重写；equals 与 hashCode 契约 |
| 设计模式 | 单例（枚举/双检锁）、工厂、模板方法、策略 |

到这里，Java OOP 的核心已经讲完。下一篇进入日常开发最常用的**集合框架**：`List`/`Set`/`Map`/`Queue` 的用法、原理与选型。

::: tip 下一篇预告
《05 - 集合框架》：`ArrayList`/`LinkedList`/`HashMap`/`HashSet`/`TreeMap` 的用法与底层原理，迭代器、`Collections` 工具类、`Comparable`/`Comparator`，以及 `BigDecimal` 精确计算。
:::
