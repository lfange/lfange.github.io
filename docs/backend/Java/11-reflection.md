---
title: 反射与动态代理
category:
  - 后端
tag:
  - Java
---

# 反射与动态代理

> 本篇是《Java 从入门到精通》第 11 篇。反射让程序在运行时"自省"--探查并操作类、字段、方法。Spring、MyBatis、JUnit 等框架的底层都靠它。本篇覆盖反射 API、动态代理、类加载机制，并讲清反射的代价。

---

## 1. 反射基础

反射是在**运行时**获取类信息、创建对象、调用方法、读写字段的能力。每个已加载的类在 JVM 中有一个 `Class` 对象，反射的入口。

### 1.1 获取 Class 对象

```java
// 三种方式
Class<?> c1 = String.class;                  // 类字面量（推荐，编译期检查）
Class<?> c2 = "hello".getClass();            // 实例的 getClass()
Class<?> c3 = Class.forName("java.lang.String");  // 全限定名（动态加载）

System.out.println(c1 == c2 && c2 == c3);    // true，同一份 Class
```

::: tip 三种方式区别
- `类.class`：编译期已知类型，性能最好，但需写死类名。
- `getClass()`：运行时从实例获取，多用于泛型方法。
- `Class.forName`：完全动态（读配置加载类），JDBC 加载驱动就用它。需处理 `ClassNotFoundException`。
:::

### 1.2 Class 常用方法

```java
Class<?> c = Student.class;
c.getName();           // 全限定名 com.lfange.Student
c.getSimpleName();     // Student
c.getPackage();        // 包
c.getSuperclass();     // 父类
c.getInterfaces();     // 实现的接口
c.getModifiers();      // 修饰符（用 Modifier 解码）
c.isInterface();       // 是否接口
c.isArray();           // 是否数组
c.getFields();         // 所有 public 字段（含继承）
c.getDeclaredFields(); // 本类声明的所有字段（含 private）
c.getMethods();        // 所有 public 方法（含继承）
c.getDeclaredMethods();// 本类声明的所有方法
c.getConstructors();   // 所有 public 构造
c.getDeclaredConstructors();  // 本类声明的所有构造
```

::: warning getXXX vs getDeclaredXXX
- `getXxx`：只返回 **public** 成员，含继承自父类的。
- `getDeclaredXxx`：返回本类声明的**所有**成员（含 private），不含继承。
反射操作私有成员需用 `getDeclaredXxx` + `setAccessible(true)`。
:::

---

## 2. 反射创建对象与调用

### 2.1 创建对象

```java
Class<?> clazz = Student.class;

// 1. 无参构造
Student s1 = (Student) clazz.getDeclaredConstructor().newInstance();

// 2. 有参构造
Constructor<?> con = clazz.getDeclaredConstructor(String.class, int.class);
con.setAccessible(true);          // 若构造私有
Student s2 = (Student) con.newInstance("Tom", 18);
```

::: warning 别用 Class.newInstance()
`Class.newInstance()`（已废弃）只能调无参 public 构造，且传播构造异常。推荐 `getDeclaredConstructor().newInstance()`，更灵活且正确处理异常。
:::

### 2.2 调用方法

```java
Method m = clazz.getDeclaredMethod("setName", String.class);
m.setAccessible(true);
m.invoke(s1, "Alice");            // 等价 s1.setName("Alice")

// 静态方法：invoke 第一个参数传 null
Method valueOf = Integer.class.getMethod("valueOf", String.class);
Integer n = (Integer) valueOf.invoke(null, "123");

// 获取返回值
Method get = clazz.getMethod("getName");
String name = (String) get.invoke(s1);
```

### 2.3 读写字段

```java
Field f = clazz.getDeclaredField("name");
f.setAccessible(true);
f.set(s1, "Bob");                  // 写
Object value = f.get(s1);          // 读

// 静态字段
Field count = clazz.getDeclaredField("count");
count.setAccessible(true);
count.set(null, 10);               // 静态字段传 null
```

---

## 3. 突破访问控制

`private` 成员默认不可反射访问，`setAccessible(true)` 可绕过：

```java
public class Secret {
    private String hidden = "secret";
    private void reveal() { System.out.println("私有方法被调用"); }
}

Secret obj = new Secret();
Class<?> c = Secret.class;

Field f = c.getDeclaredField("hidden");
f.setAccessible(true);             // 关键：绕过访问检查
System.out.println(f.get(obj));    // secret

Method m = c.getDeclaredMethod("reveal");
m.setAccessible(true);
m.invoke(obj);                     // 私有方法被调用
```

::: warning 反射的安全与代价
- `setAccessible(true)` 绕过封装，破坏设计意图，库代码不应滥用（破坏不可变性、违反安全）。
- Java 9+ 模块系统对反射加了更强限制，跨模块反射私有成员可能被拒（需 `--add-opens`）。
- 反射调用比直接调用慢（虽然 JIT 优化后差距缩小），热路径避免频繁反射。
:::

---

## 4. 反射操作泛型与数组

### 4.1 获取泛型类型

由于类型擦除，`field.getType()` 拿不到泛型参数，需用 `getGenericType()`：

```java
class Box { List<String> items; }

Field f = Box.class.getDeclaredField("items");
f.getType();                  // interface java.util.List（拿不到 String）
f.getGenericType();           // java.util.List<java.lang.String>（带泛型）

ParameterizedType pt = (ParameterizedType) f.getGenericType();
pt.getRawType();              // interface java.util.List
pt.getActualTypeArguments();  // [class java.lang.String]
```

这是 Jackson `TypeReference`、Spring `ResolvableType` 获取运行时泛型的原理。

### 4.2 反射数组

```java
import java.lang.reflect.Array;

Object arr = Array.newInstance(int.class, 5);   // 创建 int[5]
Array.set(arr, 0, 10);
Array.get(arr, 0);              // 10
Array.getLength(arr);          // 5

// 数组的 Class
int[].class.getComponentType();  // int（元素类型）
```

---

## 5. 动态代理

动态代理在运行时生成代理对象，拦截方法调用，是 AOP（面向切面编程）的底层。

### 5.1 JDK 动态代理

代理**接口**，用 `Proxy.newProxyInstance`：

```java
import java.lang.reflect.*;

interface UserService {
    String getName(int id);
}

class UserServiceImpl implements UserService {
    public String getName(int id) { return "用户" + id; }
}

// 代理处理器
class LogHandler implements InvocationHandler {
    private final Object target;
    public LogHandler(Object target) { this.target = target; }

    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        System.out.println("[前置] 调用 " + method.getName() + " 参数 " + Arrays.toString(args));
        Object result = method.invoke(target, args);      // 委托真实对象
        System.out.println("[后置] 返回 " + result);
        return result;
    }
}

// 生成代理
UserService real = new UserServiceImpl();
UserService proxy = (UserService) Proxy.newProxyInstance(
    real.getClass().getClassLoader(),
    real.getClass().getInterfaces(),
    new LogHandler(real)
);
System.out.println(proxy.getName(1));
// [前置] 调用 getName 参数 [1]
// [后置] 返回 用户1
// 用户1
```

::: tip JDK 动态代理原理
`Proxy.newProxyInstance` 运行时生成一个实现了指定接口的代理类（`.class` 字节码），每个方法调用转发给 `InvocationHandler.invoke`。Spring AOP（默认）用的就是它。
:::

### 5.2 CGLIB 动态代理

JDK 代理只能代理接口，**类**没有接口时无法用。CGLIB 通过**生成子类**代理类（不要求接口）：

```java
// CGLIB（需引入依赖 net.sf.cglib）
// 原理：Enhancer 生成目标类的子类，重写非 final 方法，拦截 MethodInterceptor
// Spring AOP 在目标无接口时自动切到 CGLIB
```

::: warning JDK Proxy vs CGLIB
- **JDK Proxy**：代理接口，JDK 内置无需依赖，被代理对象需实现接口。
- **CGLIB**：生成子类代理类，无需接口，但不能代理 final 类/方法。Spring Boot 2.x+ 默认用 CGLIB。
:::

---

## 6. 类加载机制

理解类加载，才能理解反射的时机和框架的扩展点。

### 6.1 类加载过程

类从被加载到 JVM 到可用，经历：

1. **加载**：通过类全限定名获取字节码（从 class 文件、JAR、网络），生成 `Class` 对象。
2. **链接**：
   - 验证：检查字节码合法性。
   - 准备：为静态字段分配内存并赋默认值（0/null）。
   - 解析：常量池中的符号引用转为直接引用。
3. **初始化**：执行静态变量赋值和 `<clinit>` 静态代码块。

::: tip 何时触发类初始化
- new 实例化、访问静态字段（非 final 常量除外）、调用静态方法。
- 反射调用（`Class.forName`）。
- 初始化子类时父类先初始化。
- main 方法所在类。

被动引用（如通过子类访问父类静态字段）不触发子类初始化。
:::

### 6.2 类加载器与双亲委派

JVM 有层次化类加载器：

```
BootstrapClassLoader（C++，加载 java.lang 等核心类）
    ↑
ExtClassLoader / PlatformClassLoader（加载扩展模块）
    ↑
AppClassLoader（加载 classpath 应用类）
    ↑
自定义 ClassLoader
```

**双亲委派模型**：收到加载请求时，先委派父加载器加载，父加载不到再自己加载。

::: details 双亲委派示意
```java
// 自定义类加载器需继承 ClassLoader，重写 findClass
class MyClassLoader extends ClassLoader {
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] bytes = loadClassData(name);   // 自定义读取字节码
        return defineClass(name, bytes, 0, bytes.length);
    }
}
```
:::

::: tip 双亲委派的意义
1. **安全**：核心类（如 `java.lang.String`）由 Bootstrap 加载，防止恶意自定义类冒充。
2. **避免重复加载**：同一类只加载一次（同一加载器+同一类名=同一 Class）。

打破双亲委派的场景：Tomcat（每个 webapp 独立类加载器实现隔离）、SPI（`ServiceLoader` 用线程上下文类加载器）、OSGi。Java 9 模块化对加载器做了重构。
:::

---

## 7. 反射的应用与代价

### 7.1 典型应用

- **Spring IoC**：扫描 `@Component`，反射创建 Bean，`@Autowired` 反射注入字段。
- **Spring AOP**：动态代理生成增强对象。
- **MyBatis**：`@Insert`/`@Select` 注解 + 反射映射结果到 POJO。
- **JUnit**：扫描 `@Test`，反射调用测试方法。
- **ORM**：`@Entity`/`@Table` 注解驱动表映射。
- **JSON 框架**：反射读写对象字段做序列化。

### 7.2 反射的代价与优化

- **性能**：反射调用比直接调用慢（类型检查、参数装箱、方法查找）。JIT 与 `MethodHandle`/`LambdaMetafactory` 可大幅缩小差距。
- **安全**：绕过访问控制，需谨慎（`setAccessible` 在沙箱环境可能被拒）。
- **可维护性**：编译期无法检查类型，重构易出运行时错误。

::: tip 反射优化手段
1. 缓存 `Method`/`Field` 对象（查找开销大，重复用应缓存）。
2. 高频调用用 `MethodHandle` 或 `LambdaMetafactory.metafactory` 生成直接调用器。
3. 框架级用动态字节码生成（ASM、ByteBuddy）替代反射，如 CGLIB。
:::

---

## 8. 综合案例：简易 ORM 映射器

用反射 + 注解实现把数据库行映射到对象：

```java
import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

// 注解
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@interface Column { String value(); }

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@interface Table { String value(); }

// 实体
@Table("t_user")
class User {
    @Column("user_id") private int id;
    @Column("user_name") private String name;
    @Column("age") private int age;

    public User() {}
    @Override public String toString() { return "User{id=" + id + ", name=" + name + ", age=" + age + "}"; }
}

// ORM 映射器
class OrmMapper {
    // 模拟数据库行：列名 -> 值
    public static <T> T map(Map<String, Object> row, Class<T> clazz) throws Exception {
        T obj = clazz.getDeclaredConstructor().newInstance();
        for (Field f : clazz.getDeclaredFields()) {
            Column col = f.getAnnotation(Column.class);
            if (col == null) continue;
            Object value = row.get(col.value());        // 按注解列名取值
            if (value == null) continue;
            f.setAccessible(true);
            // 简化：直接 set（生产需类型转换）
            f.set(obj, value);
        }
        return obj;
    }

    public static String tableName(Class<?> clazz) {
        Table t = clazz.getAnnotation(Table.class);
        return t != null ? t.value() : clazz.getSimpleName();
    }
}

// 测试
public class Demo {
    public static void main(String[] args) throws Exception {
        Map<String, Object> row = Map.of("user_id", 1, "user_name", "Tom", "age", 18);
        User u = OrmMapper.map(row, User.class);
        System.out.println(u);                          // User{id=1, name=Tom, age=18}
        System.out.println(OrmMapper.tableName(User.class));  // t_user
    }
}
```

这个案例展示了反射读取类注解（`@Table`）、字段注解（`@Column`），运行时创建对象并按注解列名赋值--MyBatis、Hibernate 结果映射的极简内核。

---

## 小结

| 主题 | 关键点 |
|------|--------|
| 获取 Class | `类.class` / `getClass()` / `Class.forName` |
| 反射操作 | `getDeclaredConstructor().newInstance()` 创建；`Method.invoke` 调用；`Field.get/set` 读写 |
| 访问控制 | `setAccessible(true)` 绕过 private |
| 泛型/数组 | `getGenericType` 取泛型；`java.lang.reflect.Array` 操作数组 |
| 动态代理 | JDK Proxy（代理接口）+ `InvocationHandler`；CGLIB（代理类，生成子类） |
| 类加载 | 加载-链接-初始化；双亲委派保安全防重复 |
| 应用/代价 | 框架基石；性能、安全、可维护性需权衡 |

下一篇进入 JVM 内部原理--**JVM 基础与性能调优**。

::: tip 下一篇预告
《12 - JVM 基础与性能》：JVM 内存区域、对象创建与内存布局、垃圾回收算法与收集器、类加载、调优参数、`jstack`/`jmap`/Arthas 诊断工具与 OOM 排查。
:::
