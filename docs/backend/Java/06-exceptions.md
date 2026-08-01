---
title: 异常处理
category:
  - 后端
tag:
  - Java
---

# 异常处理

> 本篇是《Java 从入门到精通》第 06 篇。异常处理是健壮程序的关键。本篇覆盖 Java 异常体系、`try-catch-finally`、`try-with-resources`、自定义异常与异常链，以及生产级最佳实践。

---

## 1. 异常体系

所有异常的根是 `Throwable`，分两大分支：

```
Throwable
├── Error              // 严重错误，程序无法处理，不该 catch
│   ├── OutOfMemoryError
│   ├── StackOverflowError
│   └── ...
└── Exception
    ├── RuntimeException（运行时异常，非受检 Unchecked）
    │   ├── NullPointerException
    │   ├── ArrayIndexOutOfBoundsException
    │   ├── ClassCastException
    │   ├── IllegalArgumentException
    │   └── ArithmeticException
    └── 其他 Exception（受检异常 Checked，必须处理）
        ├── IOException
        ├── SQLException
        └── ClassNotFoundException
```

### 1.1 受检 vs 非受检异常

| 类型 | 父类 | 特点 | 代表 |
|------|------|------|------|
| 受检异常（Checked） | `Exception`（非 RuntimeException） | 编译器强制处理（try-catch 或 throws），否则编译不过 | `IOException`、`SQLException` |
| 非受检异常（Unchecked） | `RuntimeException` | 编译器不强制，通常是编程错误 | `NullPointerException`、`IllegalArgumentException` |
| 错误（Error） | `Error` | 系统级，不应 catch | `OutOfMemoryError` |

::: tip 为什么要分受检/非受检
- **受检异常**：表示可恢复的外部条件（文件不存在、网络断开），调用方应预见并处理。
- **非受检异常**：表示编程错误（空指针、越界），应在代码中避免，而非 catch。
- 现代实践倾向于多用非受检异常（如 Spring 全家桶统一用 RuntimeException），避免受检异常的传染性（每层都要 throws）。
:::

---

## 2. try-catch-finally

### 2.1 基本结构

```java
try {
    // 可能抛异常的代码
    int result = 10 / 0;
} catch (ArithmeticException e) {
    System.out.println("捕获算术异常: " + e.getMessage());
} finally {
    System.out.println("无论如何都执行（清理资源）");
}
// 输出：
// 捕获算术异常: / by zero
// 无论如何都执行（清理资源）
```

- `try`：包裹可能出错的代码。
- `catch`：捕获匹配类型的异常，可多个（从小到大写，父类在后）。
- `finally`：**无论是否异常、是否 return**，都执行（除非 `System.exit` 或 JVM 崩溃）。

### 2.2 多重 catch

```java
try {
    String s = null;
    s.length();
} catch (NullPointerException e) {
    System.out.println("空指针");
} catch (Exception e) {            // 父类放最后
    System.out.println("其他异常");
}
```

Java 7+ **multi-catch**，用 `|` 合并多个无关异常：

```java
try { ... }
catch (IOException | SQLException e) {   // 同一处理逻辑
    log.error("IO/SQL 异常", e);
}
```

### 2.3 finally 与 return 的执行顺序

```java
public int test() {
    try {
        return 1;
    } finally {
        System.out.println("finally 执行");   // 会执行，在 return 之前
    }
}
// 打印 "finally 执行"，返回 1
```

::: warning finally 中不要 return
```java
public int test() {
    try {
        throw new RuntimeException();
    } catch (Exception e) {
        return 1;
    } finally {
        return 2;        // ❌ 会覆盖 try/catch 的返回值，且吞掉异常！
    }
}
// 返回 2，异常被吞
```
finally 中 `return` 会覆盖前面的返回值并吞掉异常，是极差的实践，应绝对避免。
:::

::: tip finally 不执行的情况
- `System.exit(n)` 在 try 中被调用。
- JVM 崩溃或被 `kill -9`。
- 守护线程被强制终止。
:::

---

## 3. try-with-resources（Java 7+）

资源（文件、流、连接、锁）必须关闭，传统 `try-catch-finally` 写法繁琐易漏。`try-with-resources` 自动关闭实现 `AutoCloseable` 的资源。

### 3.1 传统写法（繁琐）

```java
BufferedReader reader = null;
try {
    reader = new BufferedReader(new FileReader("a.txt"));
    String line = reader.readLine();
    System.out.println(line);
} catch (IOException e) {
    e.printStackTrace();
} finally {
    if (reader != null) {
        try {
            reader.close();     // close 本身也抛 IOException，再套一层
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### 3.2 try-with-resources（推荐）

```java
try (BufferedReader reader = new BufferedReader(new FileReader("a.txt"))) {
    String line = reader.readLine();
    System.out.println(line);
} catch (IOException e) {
    e.printStackTrace();
}
// reader 自动 close，即使发生异常
```

声明在 `try(...)` 中的资源（实现 `AutoCloseable`），无论正常结束还是异常，都会自动按**声明逆序**关闭。

### 3.3 多个资源

```java
try (FileInputStream fis = new FileInputStream("in.txt");
     FileOutputStream fos = new FileOutputStream("out.txt")) {
    byte[] buf = new byte[1024];
    int n;
    while ((n = fis.read(buf)) != -1) {
        fos.write(buf, 0, n);
    }
} catch (IOException e) {
    e.printStackTrace();
}
// 先关 fos，再关 fis（逆序）
```

::: tip Java 9 简化
Java 9+，若资源是 effectively final 的外部变量，可直接引用，无需在 try() 中重新声明：

```java
BufferedReader reader = Files.newBufferedReader(Path.of("a.txt"));
try (reader) {           // 直接引用外部变量
    System.out.println(reader.readLine());
}
```
:::

### 3.4 自定义 AutoCloseable

```java
public class MyResource implements AutoCloseable {
    public MyResource() { System.out.println("打开资源"); }
    public void use() { System.out.println("使用资源"); }

    @Override
    public void close() {       // 实现接口
        System.out.println("关闭资源");
    }
}

try (MyResource r = new MyResource()) {
    r.use();
}
// 打开资源 -> 使用资源 -> 关闭资源
```

---

## 4. throw 与 throws

### 4.1 throw 抛出异常

```java
public void setAge(int age) {
    if (age < 0 || age > 150) {
        throw new IllegalArgumentException("年龄非法: " + age);   // 手动抛出
    }
    this.age = age;
}
```

### 4.2 throws 声明异常

方法可能抛出**受检异常**时，必须用 `throws` 声明（非受检异常声明与否都行，通常不声明）：

```java
public String readFile(String path) throws IOException {   // 声明受检异常
    return Files.readString(Path.of(path));
}

// 调用方必须处理：要么 try-catch，要么继续 throws
public void caller() throws IOException {
    String s = readFile("a.txt");   // 继续上抛
}
```

::: warning throws 的传染性
受检异常沿调用栈向上传播，每层都要处理或声明，代码侵入性强。这也是现代框架倾向用 RuntimeException 的原因--不强制调用方处理。
:::

---

## 5. 自定义异常

业务异常应自定义，语义清晰。建议继承 `RuntimeException`（非受检，灵活）。

```java
// 业务异常基类
public class BusinessException extends RuntimeException {
    private final int code;

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }

    public BusinessException(int code, String message, Throwable cause) {
        super(message, cause);
        this.code = code;
    }

    public int getCode() { return code; }
}

// 具体业务异常
public class UserNotFoundException extends BusinessException {
    public UserNotFoundException(String userId) {
        super(4041, "用户不存在: " + userId);
    }
}

public class InsufficientBalanceException extends BusinessException {
    public InsufficientBalanceException(double need, double has) {
        super(4001, String.format("余额不足，需要 %.2f，实际 %.2f", need, has));
    }
}
```

使用：

```java
public User findUser(String id) {
    User u = db.findById(id);
    if (u == null) {
        throw new UserNotFoundException(id);
    }
    return u;
}

try {
    findUser("u123");
} catch (BusinessException e) {
    System.out.println("错误码 " + e.getCode() + ": " + e.getMessage());
    // 全局可统一转为 HTTP 响应
}
```

::: tip 自定义异常的设计
- 继承 `RuntimeException`（非受检）或 `Exception`（受检）--按团队规范，现代多用前者。
- 携带业务错误码，便于前端处理与日志检索。
- 提供带 `cause` 的构造方法，支持异常链。
:::

---

## 6. 异常链（Exception Chaining）

底层异常转成业务异常抛出时，**保留原始异常**作为 cause，不丢失堆栈：

```java
public User loadUser(String id) {
    try {
        return queryFromDb(id);
    } catch (SQLException e) {
        // 包装为业务异常，保留原 cause
        throw new BusinessException(5001, "加载用户失败: " + id, e);
    }
}
```

::: warning 不要吞掉异常
```java
// ❌ 极差：吞掉异常，问题无从排查
try { ... } catch (Exception e) { }

// ❌ 差：只打印，丢失堆栈且控制流混乱
try { ... } catch (Exception e) { e.printStackTrace(); }

// ✅ 好：包装上抛或记录完整日志
try { ... } catch (Exception e) {
    log.error("处理失败", e);
    throw new BusinessException(500, "处理失败", e);
}
```
:::

---

## 7. 异常最佳实践

### 7.1 精确捕获，不要 catch Exception

```java
// ❌ 太宽泛，掩盖 bug
try {
    int n = Integer.parseInt(s);
    files.read(path);
} catch (Exception e) { ... }

// ✅ 精确
try {
    int n = Integer.parseInt(s);
} catch (NumberFormatException e) { ... }
```

### 7.2 不要用异常控制流程

```java
// ❌ 用异常判断结束（性能差、可读性差）
try {
    int i = 0;
    while (true) {
        process(list.get(i++));
    }
} catch (IndexOutOfBoundsException e) { ... }

// ✅ 用条件判断
for (int i = 0; i < list.size(); i++) {
    process(list.get(i));
}
```

异常用于"异常情况"，不用于正常流程控制。

### 7.3 异常信息要可定位

```java
// ❌ 信息无用
throw new IllegalArgumentException("error");

// ✅ 信息含上下文
throw new IllegalArgumentException("用户年龄非法: " + age + "，应在 0~150");
```

### 7.4 及时释放资源

用 `try-with-resources`，绝不依赖 GC 或 finally 手动管理（易漏）。

### 7.5 受检异常的取舍

新代码优先用非受检异常（继承 `RuntimeException`），只在"调用方必须且能够恢复"时用受检异常。Spring 体系下数据访问异常统一是 `DataAccessException`（非受检）。

### 7.6 全局异常处理

Web 应用通常用 `@ControllerAdvice` + `@ExceptionHandler` 统一捕获、转 HTTP 响应（Spring 篇会讲），避免每个方法各自 try-catch。

---

## 8. 综合案例：用户注册服务

综合自定义异常、异常链、try-with-resources：

```java
import java.io.*;
import java.nio.file.*;
import java.util.*;

// 自定义异常
class BusinessException extends RuntimeException {
    private final int code;
    public BusinessException(int code, String msg) { super(msg); this.code = code; }
    public BusinessException(int code, String msg, Throwable cause) { super(msg, cause); this.code = code; }
    public int getCode() { return code; }
}
class UserExistsException extends BusinessException {
    public UserExistsException(String name) { super(4091, "用户已存在: " + name); }
}

// 用户服务
class UserService {
    private final Set<String> existingUsers = new HashSet<>(Set.of("admin", "tom"));
    private final Path logFile = Path.of("register.log");

    public void register(String username, int age) {
        // 1. 参数校验（非受检异常）
        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException("用户名不能为空");
        }
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("年龄非法: " + age);
        }
        // 2. 业务校验
        if (existingUsers.contains(username)) {
            throw new UserExistsException(username);
        }
        // 3. 持久化（受检异常包装为业务异常，保留 cause）
        try {
            Files.writeString(logFile,
                "注册: " + username + "," + age + "\n",
                StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (IOException e) {
            throw new BusinessException(5001, "写入日志失败", e);   // 异常链
        }
        existingUsers.add(username);
        System.out.println("注册成功: " + username);
    }
}

// 测试
public class Demo {
    public static void main(String[] args) {
        UserService service = new UserService();
        List<Runnable> cases = List.of(
            () -> service.register("", 20),         // 参数非法
            () -> service.register("admin", 20),    // 已存在
            () -> service.register("jerry", 25),    // 成功
            () -> service.register("jerry", 25)     // 已存在
        );
        for (Runnable c : cases) {
            try {
                c.run();
            } catch (IllegalArgumentException e) {
                System.out.println("[参数错误] " + e.getMessage());
            } catch (BusinessException e) {
                System.out.println("[业务错误 code=" + e.getCode() + "] " + e.getMessage());
                if (e.getCause() != null) {
                    System.out.println("  原因: " + e.getCause());
                }
            }
        }
    }
}
```

输出：

```
[参数错误] 用户名不能为空
[业务错误 code=4091] 用户已存在: admin
注册成功: jerry
[业务错误 code=4091] 用户已存在: jerry
```

这个案例体现了：参数校验用非受检异常、业务异常自定义带错误码、IO 受检异常包装为业务异常并保留 cause、调用方按异常类型分别处理。

---

## 小结

| 主题 | 关键点 |
|------|--------|
| 异常体系 | `Throwable` -> `Error` / `Exception`；`RuntimeException` 非受检 |
| 受检 vs 非受检 | 受检强制处理、有传染性；非受检表示编程错误，现代多用 |
| try-catch-finally | finally 必执行；finally 中别 return |
| try-with-resources | 自动关闭 `AutoCloseable`，逆序关，推荐 |
| throw/throws | throw 抛出，throws 声明受检异常 |
| 自定义异常 | 继承 RuntimeException，带错误码，提供 cause 构造 |
| 异常链 | 包装时传 cause，不丢堆栈 |
| 最佳实践 | 精确捕获、不吞异常、不用于流程控制、信息可定位 |

下一篇进入**IO 与 NIO**：字节/字符流、缓冲流、NIO、序列化、`Files` 工具类。

::: tip 下一篇预告
《07 - IO 与 NIO》：字节流 `InputStream`/`OutputStream`、字符流 `Reader`/`Writer`、缓冲流、NIO 的 Buffer/Channel/Selector、对象序列化、`Path`/`Files` 现代 API。
:::
