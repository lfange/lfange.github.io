---
title: 现代特性与最佳实践
category:
  - 后端
tag:
  - Java
---

# 现代特性与最佳实践

> 本篇是《Java 从入门到精通》第 13 篇，也是收官篇。汇总 Java 8~21 的关键新特性，详解新日期时间 API，并用 Spring Boot 做一次完整的现代项目实战，最后给出工程最佳实践与学习路线。

---

## 1. Java 版本演进全景

| 版本 | 年份 | 里程碑特性 |
|------|------|------------|
| 8 (LTS) | 2014 | Lambda、Stream、Optional、`java.time`、接口 default/static 方法 |
| 9 | 2017 | 模块化（JPMS）、JShell、`List.of` 不可变集合 |
| 10 | 2018 | `var` 局部变量类型推断 |
| 11 (LTS) | 2018 | HTTP Client、`var` 用于 Lambda、`Files.readString` |
| 14 | 2020 | switch 表达式转正 |
| 16 | 2021 | `record` 转正、`instanceof` 模式匹配 |
| 17 (LTS) | 2021 | 密封类（Sealed）、模式匹配增强 |
| 21 (LTS) | 2023 | 虚拟线程、switch 模式匹配转正、序列化过滤 |

::: tip 升级建议
8 -> 17 是最主流的升级路径（长期支持、生态成熟）。新项目直接 21。本教程前面已穿插讲解这些特性，这里做系统梳理。
:::

---

## 2. Java 8 核心新特性

已在第 10 篇详述 Lambda/Stream/Optional，这里补充接口增强与新日期 API。

### 2.1 接口 default/static 方法

让接口能演进而不破坏已有实现（第 04 篇已讲）：

```java
interface Vehicle {
    default void start() { System.out.println("启动"); }   // 默认实现
    static Vehicle create() { return new Car(); }          // 静态工厂
}
```

---

## 3. 模块化（Java 9）

`module-info.java` 声明模块的依赖与导出，强封装、防类冲突：

```java
// module-info.java
module com.lfange.app {
    requires java.net.http;          // 依赖
    requires org.slf4j;             // 依赖外部模块
    exports com.lfange.app.api;      // 只导出 api 包
    // com.lfange.app.internal 不导出，对外不可见
}
```

::: warning 模块化推广缓慢
模块化设计严谨但改造老项目成本高，多数库未提供 `module-info`。日常项目多用"classpath 模式"（不写 module-info），模块化主要用于 JDK 自身拆分和大型应用。了解即可，不强制使用。
:::

---

## 4. var 类型推断（Java 10）

```java
var list = new ArrayList<String>();      // ArrayList<String>
var map = new HashMap<String, Integer>();
var stream = Files.lines(path);          // Stream<String>

// var 是编译期推断，仍是静态类型，等价于写出完整类型
// 不能用于字段、方法参数、返回值
```

---

## 5. record 记录类（Java 16）

`record` 是不可变数据载体，一行替代 POJO 样板代码：

```java
// 旧 POJO：字段 + 构造 + getter + equals + hashCode + toString 几十行
// record：一行
public record Point(int x, int y) {}

Point p = new Point(3, 4);
p.x();            // 3（访问器是方法形式，无 get 前缀）
p.y();            // 4
System.out.println(p);              // Point[x=3, y=4]
System.out.println(p.equals(new Point(3, 4)));   // true
```

record 自动生成：全参构造、访问器（`x()`/`y()`）、`equals`/`hashCode`/`toString`。字段是 `final`，不可变。

### 5.1 紧凑构造（校验）

```java
public record Age(int value) {
    public Age {                       // 紧凑构造，做校验
        if (value < 0 || value > 150) {
            throw new IllegalArgumentException("年龄非法: " + value);
        }
    }
}
```

::: tip record vs Lombok @Data
- `record`：JDK 原生、不可变、适合数据传输（DTO）、可与模式匹配配合。
- `@Data`：可变、可继承、框架兼容性好（JPA 实体常用）。
新代码的 DTO/值对象优先 `record`；JPA 实体、需可变的用 Lombok。
:::

---

## 6. 密封类（Java 17）

`sealed` 限定哪些类可以继承/实现，配合模式匹配实现穷尽性检查：

```java
public sealed interface Shape permits Circle, Square, Triangle {}
record Circle(double r) implements Shape {}
record Square(double side) implements Shape {}
record Triangle(double base, double height) implements Shape {}
// 只有 permits 列出的类能实现 Shape

// switch 模式匹配 + 密封 = 编译器知道所有可能，无需 default
double area = switch (shape) {
    case Circle c -> Math.PI * c.r() * c.r();
    case Square s -> s.side() * s.side();
    case Triangle t -> 0.5 * t.base() * t.height();
};
```

::: tip 密封类的价值
传统继承是"开放"的（任何类都能 extends），密封类让作者**控制扩展点**，结合模式匹配让编译器检查是否覆盖所有子类（穷尽性），新增子类时编译器会提示漏处理的 switch。
:::

---

## 7. 模式匹配（Java 16/21）

### 7.1 instanceof 模式匹配（16）

```java
// 旧
if (obj instanceof String) {
    String s = (String) obj;
    use(s);
}
// 新
if (obj instanceof String s) {
    use(s);          // 同时转型+绑定变量
}
```

### 7.2 switch 模式匹配（21 转正）

```java
String describe(Object obj) {
    return switch (obj) {
        case Integer i when i > 0 -> "正整数 " + i;     // 守卫 when
        case Integer i -> "非正整数 " + i;
        case String s -> "字符串 " + s;
        case int[] arr -> "数组长度 " + arr.length;
        case null -> "null";                            // 显式处理 null
        default -> "其他";
    };
}
```

::: tip null 处理
传统 switch 对 null 直接 NPE。模式匹配 switch 支持 `case null` 显式处理，更安全。
:::

---

## 8. 新日期时间 API（java.time）

Java 8 引入的 `java.time` 修正了老 `Date`/`Calendar` 的所有设计缺陷（可变、月份从 0、线程不安全），**务必用新 API**。

### 8.1 核心类

| 类 | 含义 | 示例 |
|----|------|------|
| `LocalDate` | 日期（无时间无时区） | 2026-08-01 |
| `LocalTime` | 时间（无日期） | 14:30:00 |
| `LocalDateTime` | 日期+时间（无时区） | 2026-08-01T14:30 |
| `ZonedDateTime` | 带时区 | 2026-08-01T14:30+08:00[Asia/Shanghai] |
| `Instant` | 时间戳（UTC 时刻） | 2026-08-01T06:30:00Z |
| `Duration` | 时间段（时分秒） | PT2H30M |
| `Period` | 日期段（年月日） | P1Y2M |
| `DateTimeFormatter` | 格式化 | yyyy-MM-dd HH:mm:ss |

### 8.2 用法

```java
import java.time.*;
import java.time.format.*;

LocalDate today = LocalDate.now();          // 2026-08-01
LocalDate date = LocalDate.of(2026, 8, 1);
LocalTime time = LocalTime.of(14, 30, 0);
LocalDateTime dt = LocalDateTime.of(date, time);

// 不可变操作（返回新对象）
date.plusDays(7);           // 一周后
date.minusMonths(1);        // 一月前
date.withYear(2027);        // 改年
DayOfWeek dow = date.getDayOfWeek();

// 计算
LocalDate d1 = LocalDate.of(2026, 1, 1);
LocalDate d2 = LocalDate.of(2026, 12, 31);
Period p = Period.between(d1, d2);          // P11M30D
long days = java.time.temporal.ChronoUnit.DAYS.between(d1, d2);  // 364

// 格式化/解析
DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
String s = dt.format(fmt);                  // 2026-08-01 14:30:00
LocalDateTime parsed = LocalDateTime.parse("2026-08-01 14:30:00", fmt);

// 时区与时间戳
ZonedDateTime zdt = ZonedDateTime.now(ZoneId.of("Asia/Shanghai"));
Instant instant = Instant.now();            // UTC 时间戳
long epochMilli = instant.toEpochMilli();   // 毫秒时间戳
Instant fromTs = Instant.ofEpochMilli(epochMilli);
```

::: warning 别再用 Date/Calendar
- `Date` 可变（被 `setTime` 改）、月份从 0（1 月是 0）、线程不安全。
- `SimpleDateFormat` 线程不安全（多线程下解析错乱）。
新代码一律 `java.time`，`DateTimeFormatter` 线程安全。与遗留 `Date` 互转：
```java
Date d = Date.from(instant);          // Instant -> Date
Instant i = d.toInstant();            // Date -> Instant
```
:::

---

## 9. HTTP Client（Java 11）

内置现代 HTTP 客户端，支持 HTTP/2、异步：

```java
import java.net.URI;
import java.net.http.*;
import java.time.Duration;

HttpClient client = HttpClient.newBuilder()
    .version(HttpClient.Version.HTTP_2)
    .connectTimeout(Duration.ofSeconds(10))
    .build();

HttpRequest req = HttpRequest.newBuilder()
    .uri(URI.create("https://api.github.com/repos/openjdk/jdk"))
    .header("Accept", "application/json")
    .timeout(Duration.ofSeconds(10))
    .GET().build();

// 同步
HttpResponse<String> resp = client.send(req, HttpResponse.BodyHandlers.ofString());
System.out.println(resp.statusCode());     // 200
System.out.println(resp.body().substring(0, 100));

// 异步
client.sendAsync(req, HttpResponse.BodyHandlers.ofString())
      .thenApply(HttpResponse::body)
      .thenAccept(System.out::println);
```

---

## 10. 虚拟线程（Java 21）

第 09 篇已详述。用同步阻塞写法获得高并发，是服务端开发的范式转变：

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i ->
        executor.submit(() -> {
            var resp = client.send(req, HttpResponse.BodyHandlers.ofString());  // 阻塞但不浪费线程
            return resp.body();
        })
    );
}
```

---

## 11. 现代项目实战：Spring Boot 快速入门

Spring Boot 是 Java 后端事实标准，用最少配置快速构建生产级应用。

### 11.1 创建项目

用 [Spring Initializr](https://start.spring.io/) 或 IDE 生成，选 Spring Web 依赖。`pom.xml` 核心依赖：

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.2</version>
</parent>
<dependencies>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

### 11.2 第一个 REST API

```java
package com.lfange.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

// 实体（record）
record Todo(Long id, String title, boolean done) {}

// 控制器
@RestController
@RequestMapping("/todos")
class TodoController {
    private final List<Todo> store = new CopyOnWriteArrayList<>();
    private final AtomicLong seq = new AtomicLong();

    @GetMapping
    public List<Todo> list() { return store; }

    @GetMapping("/{id}")
    public Todo get(@PathVariable Long id) {
        return store.stream().filter(t -> t.id().equals(id)).findFirst()
                .orElseThrow(() -> new NoSuchElementException("todo " + id + " 不存在"));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Todo create(@RequestBody Map<String, String> body) {
        Todo todo = new Todo(seq.incrementAndGet(), body.get("title"), false);
        store.add(todo);
        return todo;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        store.removeIf(t -> t.id().equals(id));
    }
}
```

运行 `mvn spring-boot:run`，访问：

```bash
curl -X POST http://localhost:8080/todos -H "Content-Type: application/json" -d '{"title":"学Java"}'
# {"id":1,"title":"学Java","done":false}

curl http://localhost:8080/todos
# [{"id":1,"title":"学Java","done":false}]
```

### 11.3 全局异常处理

```java
@RestControllerAdvice
class GlobalExceptionHandler {
    @ExceptionHandler(NoSuchElementException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, Object> notFound(NoSuchElementException e) {
        return Map.of("code", 404, "message", e.getMessage());
    }
}
```

::: tip Spring Boot 的"魔法"
- `@SpringBootApplication` 启用自动配置 + 组件扫描。
- `@RestController` = `@Controller` + `@ResponseBody`，返回值自动转 JSON（Jackson）。
- 内嵌 Tomcat，`main` 方法直接启动 Web 服务，无需部署 WAR。
- `application.properties`/`application.yml` 外部化配置。
:::

---

## 12. 工程最佳实践

### 12.1 编码规范

- 遵循 [Google Java Style](https://google.github.io/styleguide/javaguide.html) 或阿里 Java 手册。
- 用 Checkstyle / SpotBugs / SonarLint 静态检查。
- IDE 用 IDEA，开启 inspections。

### 12.2 测试

```java
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CalculatorTest {
    @Test
    void shouldAddTwoNumbers() {
        var calc = new Calculator();
        assertEquals(5, calc.add(2, 3), "2 + 3 应等于 5");
    }
}
```

- 单元测试用 JUnit 5 + AssertJ + Mockito。
- 测试目录 `src/test/java`，与源码同包。
- CI 中 `mvn test` 自动跑测试。

### 12.3 日志

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

class MyService {
    private static final Logger log = LoggerFactory.getLogger(MyService.class);

    public void process(String id) {
        log.info("开始处理 id={}", id);            // 用占位符，别字符串拼接
        try { ... }
        catch (Exception e) {
            log.error("处理失败 id={}", id, e);     // 异常作为最后参数，打印堆栈
        }
    }
}
```

::: warning 日志规范
- 用 SLF4J + Logback/Log4j2，别用 `System.out.println`。
- 占位符 `{}` 而非字符串拼接（性能、可读性）。
- 异常必须连堆栈一起记录。
- 生产别用 `e.printStackTrace()`（输出到 stderr，不走日志框架）。
:::

### 12.4 其他

- **依赖管理**：Maven/Gradle 锁版本，定期升级修漏洞。
- **代码质量**：SonarQube 扫描，控制圈复杂度。
- **CI/CD**：GitHub Actions / Jenkins 自动构建测试部署。
- **容器化**：多阶段 Dockerfile 构建瘦镜像，或 GraalVM 原生镜像。
- **可观测性**：Micrometer + Prometheus + Grafana 监控，OpenTelemetry 链路追踪。

---

## 13. 综合案例：完整能力串联

综合本系列所学，一个体现现代 Java 风格的片段：

```java
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.*;

public sealed interface Shape permits Circle, Rectangle {}
record Circle(double r) implements Shape {}
record Rectangle(double w, double h) implements Shape {}

class Geometry {
    // 用 switch 模式匹配 + 密封类，编译器保证穷尽
    public static double area(Shape s) {
        return switch (s) {
            case Circle c -> Math.PI * c.r() * c.r();
            case Rectangle r -> r.w() * r.h();
        };
    }

    // Stream + Optional 风格
    public static Optional<Shape> largest(List<Shape> shapes) {
        return shapes.stream().max(Comparator.comparingDouble(Geometry::area));
    }

    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Circle(3), new Rectangle(4, 5), new Circle(1));

        // Stream 处理
        Map<String, Double> byType = shapes.stream()
            .collect(Collectors.groupingBy(
                s -> s.getClass().getSimpleName(),
                Collectors.summingDouble(Geometry::area)));
        System.out.println("按类型面积: " + byType);   // {Circle=31.41..., Rectangle=20.0}

        largest(shapes).ifPresent(s ->
            System.out.println("最大: " + s + " 面积=" + area(s)));
        // 最大: Circle[r=3.0] 面积=28.27...

        // 虚拟线程并发计算
        try (var exec = Executors.newVirtualThreadPerTaskExecutor()) {
            var futures = shapes.stream()
                .map(s -> exec.submit(() -> area(s)))
                .toList();
            for (var f : futures) System.out.println("面积: " + f.get());
        }
    }
}
```

这段代码集成了：密封类 + record、switch 模式匹配、Stream + 收集器、Optional、虚拟线程--现代 Java 的典型风貌。

---

## 14. 学习路线与后续方向

学完本系列，你已具备 Java 工程师的扎实基础。后续深入方向：

| 方向 | 内容 | 资源 |
|------|------|------|
| Spring 生态 | Spring Boot、Spring MVC、Spring Security、Spring Cloud | [Spring 官方文档](https://spring.io/projects/spring-framework) |
| 数据访问 | MyBatis、JPA/Hibernate、连接池、Redis | — |
| 中间件 | Kafka、RabbitMQ、Elasticsearch、Zookeeper | — |
| 微服务 | Spring Cloud、Dubbo、服务注册/配置/网关 | — |
| 性能调优 | JVM 调优、Arthas、压测（JMeter/Gatling） | — |
| 设计模式 | 《Effective Java》《设计模式》 | — |
| 并发深入 | JUC 源码、Netty、反应式（Reactor/Vert.x） | — |
| JDK 源码 | 集合、并发、IO 源码阅读 | — |

::: tip 推荐书籍
- 入门：《Java 核心技术》（Core Java）
- 进阶：《Effective Java》（必读）、《Java 并发编程实战》
- JVM：《深入理解 Java 虚拟机》（周志明）
- 框架：Spring 官方文档 + 《Spring 实战》
:::

---

## 小结

| 主题 | 关键点 |
|------|--------|
| record | 不可变数据载体，一行替代 POJO |
| 密封类 + 模式匹配 | 控制扩展、switch 穷尽性检查 |
| var | 局部变量类型推断，静态类型 |
| java.time | 不可变、线程安全的日期时间，替代 Date |
| HTTP Client | 内置 HTTP/2，同步/异步 |
| 虚拟线程 | 同步写法高并发 IO |
| Spring Boot | 约定优于配置、内嵌容器、自动装配 |
| 工程实践 | JUnit 测试、SLF4J 日志、CI/CD、容器化、可观测性 |

---

## 系列总结

《Java 从入门到精通》13 篇到此完结：

1. **入门基础**（01-04）：环境、语法、面向对象--打地基。
2. **核心 API**（05-09）：集合、异常、IO、泛型注解、并发--日常武器库。
3. **进阶实战**（10-13）：Lambda/Stream、反射、JVM、现代特性--区分中高级。

Java 生态庞大，本系列给了你一张地图和一辆基础战车。真正成为高手，靠的是**读源码、做项目、排线上故障**的反复锤炼。祝你在 Java 之路上越走越远。

::: tip 写在最后
技术更新很快，但 Java 的核心（OOP、JVM、并发、集合）几十年来稳定如一。把本系列的核心吃透，新框架、新特性都是这些基础上的组合。保持学习，保持动手。
:::
