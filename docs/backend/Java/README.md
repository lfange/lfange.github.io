---
icon: simple-icons:openjdk
title: Java
category:
  - 后端
tag:
  - Java
---

# Java 从入门到精通

一套从零基础到企业级项目实战的 Java 完整学习教程，涵盖**语言基础、面向对象、核心 API、并发编程、JVM 原理、现代特性与工程化**。每篇都配有可运行案例与输出，循序渐进。

## 学习路线

### 第一部分：入门基础

- [01 环境配置与工程化](./01-env-setup.md) -- JDK 安装、IDE、Maven/Gradle、项目结构、JShell
- [02 语言基础](./02-basics.md) -- 数据类型、运算符、流程控制、数组、字符串
- [03 面向对象基础](./03-oop-basics.md) -- 类与对象、封装、构造方法、this/static/final、包
- [04 面向对象进阶](./04-oop-advanced.md) -- 继承、多态、抽象类、接口、内部类、枚举

### 第二部分：核心 API

- [05 集合框架](./05-collections.md) -- List/Set/Map/Queue、迭代器、Collections
- [06 异常处理](./06-exceptions.md) -- 异常体系、try-catch、自定义异常、try-with-resources
- [07 IO 与 NIO](./07-io.md) -- 字节/字符流、缓冲流、NIO、序列化、Files
- [08 泛型与注解](./08-generics-annotations.md) -- 泛型类/方法/通配符、注解定义与处理
- [09 多线程与并发](./09-concurrency.md) -- 线程、synchronized、JUC、线程池、并发工具

### 第三部分：进阶与实战

- [10 Lambda 与 Stream](./10-lambda-stream.md) -- 函数式接口、Lambda、方法引用、Stream、Optional
- [11 反射与动态代理](./11-reflection.md) -- 反射 API、动态代理、类加载机制
- [12 JVM 基础与性能](./12-jvm.md) -- 内存区域、GC、类加载、调优、诊断工具
- [13 现代特性与最佳实践](./13-modern-features.md) -- Java 8~21 新特性、现代项目实战

## 学习建议

1. **入门篇务必动手敲一遍**：Java 是静态强类型编译语言，每段代码都建议在 IDE 中编译运行、观察输出。
2. **面向对象是分水岭**：第 03、04 篇是 Java 的核心，理解封装、继承、多态、接口之后，才能读懂 Spring 等主流框架。
3. **并发与 JVM 是进阶关键**：第 09、12 篇区分初级与中高级工程师，也是面试高频考点。
4. **实战篇以新特性收尾**：第 10、13 篇让代码更现代、更简洁，是写出"工程级 Java"的必经之路。

## 版本约定

本教程基于 **Java 21 LTS**，部分特性会标注引入版本（如 `record` 为 16+、switch 模式匹配为 21 正式转正）。当前主流长期支持版本为 **Java 17** 与 **Java 21**，新项目建议直接选 21。

## 参考资料

- [Java 官方文档](https://docs.oracle.com/en/java/javase/21/)
- [OpenJDK](https://openjdk.org/)
- [Baeldung Java 教程](https://www.baeldung.com/)
- [Java Language Specification (JLS)](https://docs.oracle.com/javase/specs/)
