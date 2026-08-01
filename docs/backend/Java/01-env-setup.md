---
title: 环境配置与工程化
category:
  - 后端
tag:
  - Java
---

# Java 环境配置与工程化

> 本篇是《Java 从入门到精通》系列第 01 篇，面向已具备基础编程概念但首次系统学习 Java 的开发者。全文基于 **Java 21 LTS**，所有命令与配置均可直接复制使用。

学习一门语言，第一步从来不是写 `Hello World`，而是把"开发环境-构建工具-项目结构"这条流水线打通。Java 的工程化生态比大多数语言更成熟也更"重"，一个规范的工程化底座，能让你在后续学习语法、核心 API、框架时把精力集中在语言本身。本篇就带你一次性把这些"地基"打好。

---

## 1. Java 简介

### 1.1 语言定位

Java 是一门**静态强类型、编译+解释、自动垃圾回收**的通用编程语言，由 Sun 公司的 James Gosling 等人于 1995 年发布，现由 Oracle 维护（开源实现为 OpenJDK）。它的核心设计理念是 **WORA**——Write Once, Run Anywhere（一次编写，到处运行），这依赖 JVM 实现。

几个关键术语必须分清：

- **JVM（Java Virtual Machine）**：Java 虚拟机，负责执行字节码。它是"跨平台"的真正载体——不同操作系统有不同的 JVM 实现，但它们都能跑同一份 `.class` 字节码。
- **JRE（Java Runtime Environment）**：运行时环境 = JVM + 核心类库。**只运行** Java 程序装它就够。
- **JDK（Java Development Kit）**：开发工具包 = JRE + 编译器 `javac` + 工具（`jshell`、`javadoc`、`jdb` 等）。**开发**必须装 JDK。

```
JDK = JRE + 开发工具(javac, jshell, javadoc ...)
JRE = JVM + 核心类库(rt.jar / java.base 模块)
```

::: tip 现代 JDK 已不再单独提供 JRE
从 Java 11 起，Oracle 不再单独发布 JRE。`jlink` 工具可按需打包一个"迷你 JRE"。日常开发直接装 JDK 即可。
:::

- **静态类型（Statically Typed）**：每个变量在编译期就必须确定类型，且不可变（`int x = 1; x = "a";` 编译报错）。
- **强类型（Strongly Typed）**：不会做隐式窄化转换，`int + String` 必须显式转换。
- **编译 + 解释**：`.java` 源码先由 `javac` 编译为 `.class` 字节码，再由 JVM 解释执行（Hotspot 会用 JIT 把热点代码编译为本地机器码，兼顾跨平台与性能）。

### 1.2 应用领域

Java 的"企业级"属性使它长期统治后端开发：

| 领域 | 代表框架 / 技术 |
|------|----------------|
| Web 后端 | Spring Boot、Spring Cloud、Quarkus、Micronaut |
| 大数据 | Hadoop、Spark、Flink、Kafka |
| 安卓开发 | Android（早期 Java，现主推 Kotlin，但 Java 仍大量存在） |
| 企业信息系统 | Spring + MyBatis/JPA 的经典组合 |
| 分布式 | Dubbo、gRPC-Java、Netty |
| 桌面 GUI | JavaFX（Swing 已逐步边缘化） |

### 1.3 版本演进要点

Java 每 6 个月发布一个小版本，每 2 年（偶数年 9 月）发布一个 LTS。近年值得了解的里程碑：

- **Java 8（2014，LTS）**：Lambda、Stream API、`Optional`、新日期时间 API（`java.time`）——史上最重要的一次升级，至今仍是很多项目的基线。
- **Java 11（2018，LTS）**：`var` 局部变量类型推断、HTTP Client API、模块化成熟。
- **Java 17（2021，LTS）**：密封类（Sealed）、模式匹配初版（`instanceof` 增强）、记录类 `record` 转正。
- **Java 21（2023，LTS）**：虚拟线程（Virtual Thread）、switch 模式匹配转正、序列化过滤——本教程基线。
- **Java 25（2025，LTS）**：下一代 LTS，本教程部分新特性会提及。

::: tip 选哪个版本？
新项目直接选 **Java 21**；维护老项目至少升到 17。本系列代码在 21 上全部可运行，涉及高版本特性会标注。
:::

### 1.4 主流发行版

OpenJDK 是开源参考实现，各厂商基于它发布自己的发行版，**本质都兼容**：

- **Oracle JDK**：Oracle 官方商业版，17 起又可免费用于生产。
- **OpenJDK**：社区开源版，无长期支持承诺。
- **Eclipse Temurin（Adoptium）**：Eclipse 基金会维护，最流行的免费 LTS 发行版，推荐。
- **Amazon Corretto**：AWS 维护，含 AWS 自家性能优化。
- **Azul Zulu**：Azul 公司维护，提供高性能 C4 GC 的商业版。
- **GraalVM**：Oracle 出品，支持 AOT 原生镜像编译（`native-image`），启动极快、内存极省。

::: tip 生产环境选哪个？
个人/中小项目用 **Temurin**；云原生、追求启动速度用 **GraalVM 原生镜像**；在 AWS 上用 **Corretto**。功能上它们都通过 TCK 兼容认证，可放心替换。
:::

---

## 2. JDK 安装

### 2.1 Windows

**方式一：官方安装包**

到 [adoptium.net](https://adoptium.net/) 下载 Temurin 21（JDK）安装包，勾选 "Set JAVA_HOME variable" 和 "Add to PATH"，一路下一步。验证：

```powershell
java -version
# openjdk version "21.0.4" 2024-07-16 LTS
# OpenJDK Runtime Environment Temurin-21.0.4+7 (build 21.0.4+7-LTS)
# OpenJDK 64-Bit Server VM Temurin-21.0.4+7 (build 21.0.4+7-LTS, mixed mode, sharing)

javac -version
# javac 21.0.4
```

**方式二：winget**

```powershell
winget install EclipseAdoptium.Temurin.21.JDK
```

**手动配置环境变量**（若安装包未自动配置）：

```powershell
# 系统环境变量
JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-21.0.4.7-hotspot
Path 追加 = %JAVA_HOME%\bin
```

### 2.2 macOS

```bash
# 安装 Homebrew（如尚未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Temurin 21（需先 tap Adoptium 仓库）
brew tap homebrew/cask-versions
brew install --cask temurin@21

# 验证
java -version
```

也可以用 SDKMAN!（推荐，支持多版本切换，见 2.4）。

### 2.3 Linux

Ubuntu / Debian 系：

```bash
sudo apt update
sudo apt install -y openjdk-21-jdk
```

CentOS / RHEL 系：

```bash
sudo dnf install -y java-21-openjdk-devel
```

### 2.4 多版本管理：SDKMAN! / jenv

Java 项目常需在 8/17/21 间切换。`SDKMAN!`（Unix/macOS）是最流行的版本管理器。

```bash
# 安装 SDKMAN!
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"

# 安装多版本 JDK
sdk list java                       # 列出所有可装版本
sdk install java 21.0.4-tem         # 安装 Temurin 21
sdk install java 17.0.12-tem        # 安装 Temurin 17

# 切换
sdk use java 17.0.12-tem            # 当前 shell 切换
sdk default java 21.0.4-tem         # 设为默认
```

Windows 下可用 [jabba](https://github.com/shyiko/jabba) 跨平台管理多版本 JDK。

---

## 3. 第一个程序：Hello World

### 3.1 编写并运行

Java 是纯面向对象语言，一切代码都在类中。新建 `Hello.java`：

```java
public class Hello {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

编译并运行：

```bash
javac Hello.java          # 生成 Hello.class 字节码
java Hello                # 由 JVM 执行，输出 Hello, World!
```

::: warning 文件名必须与 public 类名一致
`public class Hello` 必须放在 `Hello.java` 中，否则编译报错。一个 `.java` 文件只能有一个 `public` 类，但可以有多个非 public 类。
:::

### 3.2 main 方法解剖

```java
public static void main(String[] args)
```

- `public`：JVM 从外部调用，必须公开。
- `static`：静态方法，无需创建对象即可调用（JVM 启动时还没有对象）。
- `void`：无返回值。
- `String[] args`：命令行参数数组，`args[0]` 是第一个参数（注意不是程序名）。

```java
public class ArgsDemo {
    public static void main(String[] args) {
        System.out.println("参数个数: " + args.length);
        for (int i = 0; i < args.length; i++) {
            System.out.println("args[" + i + "] = " + args[i]);
        }
    }
}
```

```bash
java ArgsDemo Alice Bob
# 参数个数: 2
# args[0] = Alice
# args[1] = Bob
```

### 3.3 单文件源码直接运行（Java 11+）

Java 11 起，单文件程序无需先 `javac`，可直接运行源码：

```bash
java Hello.java          # 自动编译并运行，不产生 .class（内存中）
```

适合写小脚本和 demo，本教程的多数单类示例都可用此方式。

---

## 4. IDE 配置

### 4.1 IntelliJ IDEA（推荐）

IDEA 是 JetBrains 出品的 Java 首选 IDE，社区版免费、旗舰版（含 Spring/Web/DB 支持）付费。

- **配置 JDK**：`File -> Project Structure -> SDK`，点 `+` 添加已安装的 JDK 目录。
- **创建项目**：`New Project` 选择构建工具（Maven/Gradle）和 JDK 版本。
- **常用快捷键（Windows/Linux）**：
  - `psvm` + Tab：生成 `public static void main`。
  - `sout` + Tab：生成 `System.out.println`。
  - `Ctrl+Alt+L`：格式化代码。
  - `Shift+F6`：重命名（重构）。
  - `Ctrl+Shift+T`：为当前类生成测试。
  - `F8`/`F7`：单步跳过/进入（调试）。

### 4.2 VS Code

安装 **Extension Pack for Java**（Microsoft 官方扩展包，含 Language Support、Debugger、Test Runner、Maven/Gradle 集成）。

`.vscode/settings.json` 关键项：

```json
{
  "java.configuration.runtimes": [
    { "name": "JavaSE-21", "path": "C:/Program Files/Eclipse Adoptium/jdk-21.0.4.7-hotspot", "default": true }
  ],
  "java.format.enabled": true,
  "java.saveActions.organizeImports": true,
  "[java]": { "editor.formatOnSave": true }
}
```

::: tip 选哪个？
写 Java 重度项目（Spring 全家桶）首选 **IDEA 旗舰版**；轻量脚本/多语言混编用 **VS Code**。本教程示例两者皆可。
:::

---

## 5. Maven 构建工具

Maven 是 Java 生态最经典的构建与依赖管理工具，通过 `pom.xml` 声明式描述项目。

### 5.1 核心概念

- **坐标（GAV）**：`groupId:artifactId:version` 唯一标识一个构件，如 `org.springframework.boot:spring-boot-starter:3.3.0`。
- **仓库**：本地仓库（`~/.m2/repository`）→ 私服（可选）→ 中央仓库（Maven Central）的查找顺序。
- **生命周期**：`clean`、`validate`、`compile`、`test`、`package`、`verify`、`install`、`deploy`。
- **POM**：Project Object Model，`pom.xml` 是项目元数据的根。

### 5.2 安装

```bash
# Windows
winget install Apache.Maven

# macOS
brew install maven

# 验证
mvn -version
```

::: tip IDEA / VS Code 自带 Maven
现代 IDE 内置 Maven Wrapper（`mvnw`），项目可不强依赖系统 Maven。但命令行操作仍建议装一份。
:::

### 5.3 最小 pom.xml

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <!-- 坐标 -->
    <groupId>com.lfange</groupId>
    <artifactId>hello-java</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <properties>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.34</version>
            <scope>provided</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.3</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

字段说明：

- `packaging`：`jar`（默认）/`war`/`pom`（聚合工程）。
- `properties`：集中管理版本与编码。`maven.compiler.source/target` 指定编译的 Java 版本。
- `dependencies/dependency/scope`：依赖范围。`compile`（默认，编译+运行+测试）、`test`（仅测试）、`provided`（编译+测试，运行由环境提供，如 Servlet API、Lombok）、`runtime`（运行+测试）。

### 5.4 常用命令

```bash
mvn clean                # 清理 target/
mvn compile              # 编译主代码
mvn test                 # 运行测试
mvn package              # 打包（jar/war）
mvn install              # 打包并安装到本地仓库
mvn deploy               # 发布到远程仓库
mvn dependency:tree      # 查看依赖树（排查冲突神器）
mvn clean package -DskipTests   # 打包跳过测试
```

### 5.5 国内镜像源

中央仓库国内访问慢，配置阿里云镜像。编辑 `~/.m2/settings.xml`（Windows 为 `%USERPROFILE%\.m2\settings.xml`）：

```xml
<settings>
  <mirrors>
    <mirror>
      <id>aliyun</id>
      <mirrorOf>central</mirrorOf>
      <name>Aliyun Maven Mirror</name>
      <url>https://maven.aliyun.com/repository/public</url>
    </mirror>
  </mirrors>
</settings>
```

---

## 6. Gradle 构建工具

Gradle 用 Groovy/Kotlin DSL 编写构建脚本，比 Maven 更灵活、构建更快（增量编译、构建缓存），是 Android 与新一代 Spring 项目的首选。

### 6.1 最小 build.gradle.kts

```kotlin
plugins {
    application
}

group = "com.lfange"
version = "1.0.0"

java {
    toolchain {
        languageVersion = JavaLanguageVersion.of(21)
    }
}

application {
    mainClass.set("com.lfange.Hello")
}

repositories {
    maven { url = uri("https://maven.aliyun.com/repository/public") }
    mavenCentral()
}

dependencies {
    compileOnly("org.projectlombok:lombok:1.18.34")
    testImplementation("org.junit.jupiter:junit-jupiter:5.10.3")
}

tasks.test {
    useJUnitPlatform()
}
```

### 6.2 常用命令

```bash
gradle build             # 编译+测试+打包
gradle run               # 运行 application 插件指定的主类
gradle test              # 仅测试
gradle clean             # 清理
./gradlew build          # 用项目自带的 wrapper（推荐，版本一致）
```

### 6.3 Maven vs Gradle

| 特性 | Maven | Gradle |
|------|-------|--------|
| 配置语言 | XML（声明式） | Groovy/Kotlin DSL（可编程） |
| 灵活性 | 较低，约定优于配置 | 高，可写逻辑 |
| 构建速度 | 一般 | 快（增量、缓存、守护进程） |
| 依赖管理 | `pom.xml` + scope | configuration + 依赖图 |
| 学习曲线 | 平缓 | 较陡 |
| 适用 | 传统企业项目、稳定性优先 | Android、新 Spring 项目、性能优先 |

::: tip 新项目怎么选？
服务端 Java 后端、团队习惯约定式管理 -> Maven；Android 或追求极致构建速度 -> Gradle。两者都成熟，本教程示例以 Maven 为主。
:::

---

## 7. 标准项目结构

Maven 约定的标准目录结构（Gradle 同样适用）：

```
hello-java/
├── pom.xml                          # 构建配置
├── src/
│   ├── main/
│   │   ├── java/                    # 主源码
│   │   │   └── com/lfange/
│   │   │       ├── Hello.java
│   │   │       └── App.java
│   │   └── resources/               # 资源文件（配置、模板等）
│   │       ├── application.properties
│   │       └── logback.xml
│   └── test/
│       ├── java/                    # 测试源码
│       │   └── com/lfange/
│       │       └── HelloTest.java
│       └── resources/               # 测试资源
├── target/                          # 构建输出（gitignore）
├── .gitignore
└── README.md
```

::: tip 为什么源码要在 src/main/java 下？
Maven/Gradle 按约定查找源码：主代码在 `src/main/java`，测试在 `src/test/java`，资源在 `src/main/resources`。遵循约定即可零配置编译、测试、打包。
:::

推荐的 `.gitignore`：

```gitignore
# Maven / Gradle
target/
build/
!.mvn/wrapper/maven-wrapper.jar
!gradle/wrapper/gradle-wrapper.jar

# IDE
.idea/
*.iml
.vscode/
.settings/
.classpath
.project
bin/

# 系统
.DS_Store
Thumbs.db
```

---

## 8. 包（package）与导入

Java 用"包"组织类，类似命名空间，避免类名冲突，也控制访问权限。

```java
// 文件 src/main/java/com/lfange/util/StringUtils.java
package com.lfange.util;            // 声明所属包

public class StringUtils {
    public static boolean isEmpty(String s) {
        return s == null || s.isEmpty();
    }
}
```

使用时需导入：

```java
package com.lfange;

import com.lfange.util.StringUtils;   // 导入单个类
// import com.lfange.util.*;         // 导入整个包（不推荐，易冲突）

public class Main {
    public static void main(String[] args) {
        System.out.println(StringUtils.isEmpty(""));    // true
    }
}
```

::: warning 包命名规范
- 全小写，域名倒写作为前缀，如 `com.lfange.xxx`（域名 lfange.com -> `com.lfange`）。
- `java.lang` 包下的类（`String`、`System`、`Math` 等）自动导入，无需 `import`。
:::

---

## 9. JShell 交互式 REPL

Java 9 引入 `jshell`，可像 Python REPL 一样逐行试验，非常适合学习：

```bash
jshell
|  Welcome to JShell -- Version 21.0.4
|  For an introduction type: /help intro

jshell> int x = 10;
x ==> 10

jshell> x * 2 + 1
$2 ==> 21

jshell> String s = "hello";
s ==> "hello"

jshell> s.toUpperCase()
$4 ==> "HELLO"

jshell> /methods          # 查看已定义方法
jshell> /vars             # 查看已定义变量
jshell> /exit             # 退出
```

::: tip 学习时多用 jshell
本教程的许多语法示例可直接粘进 `jshell` 验证，免去写类和 `main` 方法的开销。注意 `jshell` 中可省略类和 `;`（部分场景）。
:::

---

## 10. 命令行问候程序

把本章知识串起来，写一个带命令行参数解析的问候程序（用 JDK 内置方式，不依赖第三方库）。

```java
package com.lfange;

import java.util.Arrays;

public class Greet {

    public static void main(String[] args) {
        String name = "World";
        int count = 1;
        boolean upper = false;

        // 简易参数解析
        for (int i = 0; i < args.length; i++) {
            switch (args[i]) {
                case "--name" -> name = args[++i];
                case "--count" -> count = Integer.parseInt(args[++i]);
                case "--upper" -> upper = true;
                case "-h", "--help" -> {
                    System.out.println("用法: java Greet [--name N] [--count N] [--upper]");
                    return;
                }
                default -> {
                    System.err.println("未知参数: " + args[i]);
                    System.exit(1);
                }
            }
        }

        if (count <= 0) {
            System.err.println("--count 必须为正整数");
            System.exit(1);
        }

        String msg = "Hello, " + name + "!";
        if (upper) {
            msg = msg.toUpperCase();
        }
        for (int i = 0; i < count; i++) {
            System.out.println(msg);
        }
    }
}
```

运行：

```bash
java Greet.java --name Alice --count 3
# Hello, Alice!
# Hello, Alice!
# Hello, Alice!

java Greet.java --name Bob --upper
# HELLO, BOB!
```

::: tip 语法预告
上面用了 Java 14+ 的 **switch 表达式**（`->` 箭头语法）。第 02 篇会系统讲解流程控制，第 13 篇会汇总现代特性。生产环境参数解析推荐用 [Picocli](https://picocli.info/) 库。
:::

---

## 小结

本篇覆盖了从"装好一个 JDK"到"建立可交付项目骨架"的全流程：

1. **JDK/JRE/JVM**：开发装 JDK，JVM 是跨平台核心，11 起不再单独发布 JRE。
2. **发行版**：推荐 Temurin，云原生用 GraalVM，版本管理用 SDKMAN!。
3. **第一个程序**：`javac` 编译 -> `java` 运行；11+ 单文件可 `java Xxx.java` 直跑。
4. **IDE**：IDEA 是 Java 首选，VS Code 装扩展包亦可。
5. **构建工具**：Maven 声明式、约定优于配置；Gradle 灵活快速。新项目 Maven 为主。
6. **项目结构**：`src/main/java` + `src/test/java` + `pom.xml` 是事实标准。
7. **包**：域名倒写，组织类与控制访问。
8. **JShell**：学习利器，逐行试验语法。

地基打牢后，下一篇我们正式进入语言本身：数据类型、运算符、流程控制、数组与字符串。

::: tip 下一篇预告
《02 - 语言基础》：深入 Java 的类型系统，讲清 8 种基本类型与包装类的内存模型，覆盖运算符、流程控制、数组、`String`/`StringBuilder` 的全部细节与常见陷阱。
:::
