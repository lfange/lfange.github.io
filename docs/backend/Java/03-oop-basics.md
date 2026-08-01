---
title: 面向对象基础
category:
  - 后端
tag:
  - Java
---

# 面向对象基础

> 本篇是《Java 从入门到精通》第 03 篇。Java 是纯面向对象语言--除 8 种基本类型外，一切皆对象。理解类、对象、封装、构造、`this`/`static`/`final` 与访问控制，是写出健壮 Java 代码的根基。

---

## 1. 面向对象思想

面向对象编程（OOP）以"对象"为核心组织代码。对象 = **状态（字段）** + **行为（方法）**。Java 的 OOP 有四大特性：

- **封装（Encapsulation）**：隐藏内部细节，对外暴露受控接口。
- **继承（Inheritance）**：子类复用父类的代码与类型。
- **多态（Polymorphism）**：同一调用，不同对象表现不同行为。
- **抽象（Abstraction）**：提取共性，忽略细节（接口/抽象类）。

::: tip 面向对象 vs 面向过程
面向过程关注"怎么做"（步骤），面向对象关注"谁来做"（对象职责）。Java 强制 OOP，所有代码都在类中。
:::

---

## 2. 类与对象

**类**是对象的模板/蓝图，**对象**是类的实例。

### 2.1 定义类

```java
public class Student {
    // 字段（属性 / 成员变量）--描述状态
    String name;
    int age;

    // 方法（行为）--描述能做什么
    void study() {
        System.out.println(name + " 正在学习");
    }
}
```

### 2.2 创建对象与使用

```java
public class Main {
    public static void main(String[] args) {
        Student s = new Student();   // 用 new 创建对象
        s.name = "Tom";              // 访问字段
        s.age = 18;
        s.study();                   // 调用方法 -> Tom 正在学习
    }
}
```

- `new Student()` 在堆中创建对象，返回其引用。
- 字段有默认值：`int` 为 0，`boolean` 为 false，引用类型为 `null`。
- 局部变量（方法内）无默认值，使用前必须初始化。

### 2.3 成员变量 vs 局部变量

| 特性 | 成员变量（字段） | 局部变量 |
|------|------------------|----------|
| 位置 | 类中方法外 | 方法内 |
| 默认值 | 有（0/false/null） | 无，必须初始化 |
| 生命周期 | 随对象创建/回收 | 随方法调用/返回 |
| 存储位置 | 堆（对象内） | 栈（方法栈帧） |

---

## 3. 构造方法

构造方法（Constructor）用于**初始化**对象，在 `new` 时自动调用。

### 3.1 基本语法

```java
public class Student {
    String name;
    int age;

    // 无参构造
    public Student() {
        System.out.println("创建了一个学生");
    }
}

Student s = new Student();   // 触发无参构造
```

特点：
- 方法名与类名**完全相同**。
- **无返回值类型**（连 `void` 都没有）。
- 不能被 `return` 返回值，但可 `return;` 提前结束。

### 3.2 默认构造

若类中**没有**写任何构造方法，编译器自动生成一个公开的无参构造（方法体为空）。一旦你写了任何构造方法，编译器**不再**生成默认无参构造。

```java
public class A {
    // 只有这个有参构造，编译器不再生成无参构造
    public A(int x) {}
}
// new A();   // 编译错误：无无参构造
```

::: warning 实体类必须保留无参构造
框架（如 Spring、JPA/Hibernate、Jackson）通过反射调用无参构造创建对象。POJO/实体类务必保留一个无参构造。
:::

### 3.3 构造方法重载与 this()

```java
public class Student {
    String name;
    int age;
    String school;

    // 全参构造
    public Student(String name, int age, String school) {
        this.name = name;
        this.age = age;
        this.school = school;
    }

    // 两参构造：复用上面的，school 默认
    public Student(String name, int age) {
        this(name, age, "未知学校");   // this() 调用本类其他构造，必须放首行
    }

    // 无参构造
    public Student() {
        this("匿名", 0);   // 链式调用两参构造
    }
}

new Student();                  // 匿名, 0, 未知学校
new Student("Tom", 18);         // Tom, 18, 未知学校
new Student("Jerry", 20, "清华");
```

`this(...)` 用于在一个构造方法中调用本类另一个构造方法，**必须位于第一行**，避免初始化逻辑重复。

---

## 4. this 关键字

`this` 代表**当前对象的引用**，三个主要用途：

### 4.1 区分字段与参数（最常见）

当参数名与字段名相同时，用 `this` 指代字段：

```java
public Student(String name, int age) {
    this.name = name;     // this.name 是字段，name 是参数
    this.age = age;
}
```

### 4.2 调用本类其他构造

见 3.3，`this(...)`。

### 4.3 调用本类方法 / 传递自身引用

```java
public class Calculator {
    int value;

    Calculator add(int n) {
        this.value += n;
        return this;          // 返回 this，支持链式调用
    }
}

Calculator c = new Calculator();
c.add(1).add(2).add(3);       // 链式调用，value=6
```

---

## 5. 封装

封装 = **私有化字段** + **提供公共的 getter/setter**，在存取时加入校验，隐藏内部实现。

### 5.1 访问修饰符

| 修饰符 | 本类 | 同包 | 子类 | 其他包 |
|--------|------|------|------|--------|
| `public` | ✅ | ✅ | ✅ | ✅ |
| `protected` | ✅ | ✅ | ✅ | ❌ |
| 默认（package-private） | ✅ | ✅ | ❌ | ❌ |
| `private` | ✅ | ❌ | ❌ | ❌ |

### 5.2 标准封装写法

```java
public class Account {
    private String owner;
    private double balance;

    public Account(String owner, double balance) {
        this.owner = owner;
        setBalance(balance);    // 复用 setter 校验
    }

    public String getOwner() {
        return owner;
    }

    public double getBalance() {
        return balance;
    }

    public void setBalance(double balance) {
        if (balance < 0) {
            throw new IllegalArgumentException("余额不能为负：" + balance);
        }
        this.balance = balance;
    }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("存款须为正");
        this.balance += amount;
    }
}
```

::: tip 为什么要封装
1. **数据保护**：`setBalance` 拦截非法值，避免对象进入不一致状态。
2. **灵活变更**：内部实现可变（如余额改用分存储），getter/setter 接口不变，调用方无感。
3. **框架契约**：JavaBean 规范要求 getter/setter，IDE / 反射框架依赖它。
:::

### 5.3 Lombok 简化样板代码

手写 getter/setter 繁琐，[Lombok](https://projectlombok.org/) 用注解编译期生成：

```java
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Getter @Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
public class Student {
    private String name;
    private int age;
}

Student s = new Student("Tom", 18);
s.getName();                 // Tom（编译期生成）
s.setAge(20);
System.out.println(s);       // Student(name=Tom, age=20)
```

::: tip Lombok 常用注解
`@Getter/@Setter`、`@ToString`、`@EqualsAndHashCode`、`@NoArgsConstructor`/`@AllArgsConstructor`/`@RequiredArgsConstructor`、`@Data`（前四个合集）、`@Builder`（构建者模式）。Spring 项目几乎标配。
:::

---

## 6. static 关键字

`static` 修饰的成员属于**类**而非某个对象，所有实例共享。

### 6.1 静态变量

```java
public class User {
    private String name;
    static int count = 0;     // 所有 User 共享

    public User(String name) {
        this.name = name;
        count++;              // 每创建一个对象，计数 +1
    }
}

new User("A");
new User("B");
System.out.println(User.count);    // 2，用类名访问
```

### 6.2 静态方法

```java
public class MathUtil {
    public static int square(int n) {
        return n * n;
    }
}

MathUtil.square(5);          // 25，用类名调用，无需创建对象
```

静态方法特点：
- 属于类，可通过类名直接调用。
- **不能直接访问实例变量/实例方法**（没有 `this`）。
- **不能被重写**（可被隐藏，但非多态）。
- 常用于工具方法（`Math.abs`、`Collections.sort`）。

::: warning 为什么 main 是 static
JVM 启动时还没有任何对象，必须通过类名调用 `main`，所以它必须是 `static`。
:::

### 6.3 静态代码块

类加载时执行一次，用于初始化静态资源：

```java
public class Config {
    static Map<String, String> map = new HashMap<>();

    static {
        map.put("key1", "value1");
        map.put("key2", "value2");
        System.out.println("静态代码块执行，类被加载");
    }
}
```

### 6.4 实例初始化块

每次创建对象时执行（在构造方法前）：

```java
public class Demo {
    { System.out.println("实例初始化块"); }   // 每次 new 都执行
    public Demo() { System.out.println("构造方法"); }
}
new Demo();   // 实例初始化块 -> 构造方法
```

执行顺序：**父类静态 -> 子类静态 -> 父类实例块+构造 -> 子类实例块+构造**。

---

## 7. final 关键字

`final` 三种用法，含义都是"不可变"：

### 7.1 final 变量

```java
final int MAX = 100;          // 基本类型：值不可变
final StringBuilder sb = new StringBuilder("a");
sb.append("b");               // 合法：引用不变，内容可变
// sb = new StringBuilder();  // 编译错误：引用不可重新赋值
```

`final` 局部变量只能赋值一次；`final` 字段必须在声明时、构造方法中或实例块中初始化。

### 7.2 final 方法

不可被子类重写（可重载）：

```java
public class Parent {
    public final void show() { }   // 子类不能 override show()
}
```

### 7.3 final 类

不可被继承（如 `String`、`Integer`、`Math`）：

```java
public final class Config { }   // 不能有子类
```

::: tip final 的性能
`final` 方法/类让 JVM 更容易内联优化。`final` 局部变量被 lambda/匿名内部类捕获时，要求 effectively final（事实上的 final，可不显式写 final）。
:::

---

## 8. 包与访问控制

### 8.1 包

包是类的命名空间，避免类名冲突，控制访问（见 5.1）。命名：域名倒写，全小写。

```java
package com.lfange.model;     // 声明包
import java.util.List;        // 导入
import static java.lang.Math.PI;   // 静态导入，直接用 PI
```

### 8.2 包访问控制实践

- 顶层类只声明为 `public` 或默认（包级私有）。一个 `.java` 文件只能有一个 `public` 类。
- 字段一般 `private`，通过 getter/setter 暴露。
- 辅助类/工具方法若仅供同包用，用默认访问。

---

## 9. 方法重载（Overload）

重载是**同一类中**多个同名方法，参数列表不同（个数、类型、顺序），与返回值无关。编译期决定调用哪个（静态分派）。

```java
public class Printer {
    public void print(int n) {
        System.out.println("整数: " + n);
    }
    public void print(String s) {
        System.out.println("字符串: " + s);
    }
    public void print(int a, int b) {
        System.out.println("两个整数: " + a + ", " + b);
    }
}

Printer p = new Printer();
p.print(1);            // 整数: 1
p.print("hi");         // 字符串: hi
p.print(1, 2);         // 两个整数: 1, 2
```

::: warning 重载 vs 重写
- **重载（Overload）**：同类中、同名不同参、编译期绑定。
- **重写（Override）**：父子类间、同名同参、运行期绑定（多态）。
重写是第 04 篇的内容。
:::

---

## 10. 综合案例：银行账户

综合封装、构造、`this`、`static`：

```java
public class BankAccount {
    private static int nextId = 1000;     // 自增账号

    private final int id;                 // 账号，final 不可变
    private String owner;
    private double balance;

    public BankAccount(String owner, double balance) {
        this.id = nextId++;               // this 区分字段
        this.owner = owner;
        setBalance(balance);              // 复用校验
    }

    // 存款
    public void deposit(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("存款金额须为正");
        }
        balance += amount;
        System.out.printf("账户 %d 存入 %.2f，余额 %.2f%n", id, amount, balance);
    }

    // 取款
    public void withdraw(double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("取款金额须为正");
        }
        if (amount > balance) {
            throw new IllegalStateException("余额不足");
        }
        balance -= amount;
        System.out.printf("账户 %d 取出 %.2f，余额 %.2f%n", id, amount, balance);
    }

    public int getId() { return id; }
    public String getOwner() { return owner; }
    public double getBalance() { return balance; }

    @Override
    public String toString() {
        return String.format("账户[%d] %s 余额 %.2f", id, owner, balance);
    }

    public static void main(String[] args) {
        BankAccount a = new BankAccount("Tom", 1000);
        BankAccount b = new BankAccount("Jerry", 500);
        a.deposit(500);          // 账户 1000 存入 500.00，余额 1500.00
        b.withdraw(200);         // 账户 1001 取出 200.00，余额 300.00
        // b.withdraw(10000);    // IllegalStateException: 余额不足
        System.out.println(a);   // 账户[1000] Tom 余额 1500.00
        System.out.println(b);   // 账户[1001] Jerry 余额 300.00
    }
}
```

这个案例体现了：
- **封装**：`balance` 私有，通过 `deposit`/`withdraw` 受控修改并校验。
- **构造 + this**：初始化账号与字段。
- **static**：`nextId` 全类共享，自动分配账号。
- **final**：账号 `id` 创建后不可变。

---

## 小结

| 主题 | 关键点 |
|------|--------|
| 类与对象 | 类是模板，`new` 创建实例；字段有默认值，局部变量无 |
| 构造方法 | 与类同名、无返回值；可重载；`this()` 链式调用须首行 |
| this | 当前对象引用；区分字段参数、调用构造、链式返回 |
| 封装 | private 字段 + getter/setter；四类访问修饰符 |
| static | 静态成员属于类；静态方法无 this、不能访问实例成员 |
| final | 变量不可变、方法不可重写、类不可继承 |
| 包 | 命名空间；域名倒写；导入与静态导入 |
| 重载 | 同类同名不同参，编译期绑定 |

下一篇进入面向对象进阶：继承、多态、抽象类、接口、内部类、枚举--这些才是 Java OOP 的精华所在。

::: tip 下一篇预告
《04 - 面向对象进阶》：`extends` 继承、方法重写、多态与动态绑定、抽象类、接口（含 `default`/`static` 方法）、内部类、枚举、`Object` 通用方法，附设计模式入门。
:::
