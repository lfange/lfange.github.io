---
title: 网络编程与 IO 模型
icon: article
category:
  - 计算机网络
  - Guide
tag:
  - socket
  - io
---

# 网络编程与 IO 模型

## Socket 编程基础

Socket 是对 TCP/UDP 的编程抽象（IP + 端口标识一个连接端点）。

### TCP 服务端/客户端模型

```text
服务端                    客户端
socket()                 socket()
bind()    绑定端口
listen()  监听（backlog）
accept()  ──阻塞等连接──   connect()
read/write ══════ 数据交换 ══════ read/write
close()                   close()
```

```go
// Go 实现一个最小 TCP 回显服务
func main() {
  ln, _ := net.Listen("tcp", ":8080")
  for {
    conn, _ := ln.Accept()
    go func(c net.Conn) {           // 每连接一个 goroutine
      defer c.Close()
      buf := make([]byte, 4096)
      for {
        n, err := c.Read(buf)
        if err != nil { return }
        c.Write(buf[:n])            // 回显
      }
    }(conn)
  }
}
```

### 一次 read 的完整链路（理解 IO 模型的关键）

```text
1. 数据到达网卡 → DMA 拷入内核缓冲区（RingBuffer）
2. 内核协议栈处理 → 数据放入 Socket 接收缓冲区
3. read()：等缓冲区有数据（阻塞在这一步）
4. 数据从内核缓冲区 拷贝到 用户缓冲区（CPU 拷贝）

「阻塞/非阻塞」说的是第 3 步等不等；
「同步/异步」说的是第 4 步拷贝谁来干（同步=自己 read 拷，异步=内核拷完通知你）
```

## 五种 IO 模型

| 模型 | 等数据阶段 | 拷数据阶段 |
| --- | --- | --- |
| 阻塞 IO（BIO） | 阻塞等 | 阻塞拷 |
| 非阻塞 IO（NIO） | 轮询（忙等） | 阻塞拷 |
| **IO 多路复用** | select/poll/epoll 统一等 | 自己拷（同步） |
| 信号驱动 IO | 内核发信号通知 | 自己拷 |
| 异步 IO（AIO） | 内核全包 | **内核拷完再通知**（真异步） |

> 面试标准答案：**epoll 属于同步 IO**（数据就绪后仍需用户自己 read 拷贝）；Linux 的 AIO 支持不完善，io_uring（5.1+）才是现代异步方案。

## IO 多路复用：select / poll / epoll

### 对比

| | select | poll | epoll |
| --- | --- | --- | --- |
| fd 上限 | 1024（FD_SETSIZE） | 无硬限制 | 无硬限制 |
| 传参方式 | 每次全量拷贝 fd 集合 | 同左 | 注册一次（红黑树管理） |
| 就绪检测 | O(n) 线性扫描 | O(n) | O(1) 回调（就绪链表） |
| 触发模式 | LT | LT | LT + **ET** |

### epoll 三连

```c
int epfd = epoll_create1(0);              // 创建实例

struct epoll_event ev = { .events = EPOLLIN, .data.fd = listen_fd };
epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &ev);  // 注册 fd（内核红黑树）

epoll_wait(epfd, events, MAX, -1);        // 等就绪事件（就绪链表）
```

### LT vs ET（水平触发 vs 边缘触发）

```text
LT（默认）：缓冲区还有数据就一直通知 → 编程简单，可以分多次 read
ET：只在状态变化时通知一次 → 必须一次把数据读完（循环 read 到 EAGAIN），
    配合非阻塞 fd 使用，减少事件次数，性能更高
```

## Reactor 模式

高并发网络服务的标准架构（Redis、Nginx、Netty 都基于它）：

```text
单 Reactor 单线程（Redis 6 以前）
  ┌─────────┐
  │ Reactor │ epoll_wait + 分发
  └────┬────┘
       │ 串行处理所有事件
  （简单无锁，但一个慢操作阻塞全部）

单 Reactor 多线程
  Reactor 只管事件分发，业务处理丢给线程池

主从 Reactor（Netty 默认，Nginx 多 worker 同理）
  mainReactor：只管 accept 新连接
  subReactor ×N：各自 epoll 管一批连接的读写
  ┌─ accept ──▶ 分发给 subReactor
  mainR            subR1 ─▶ 线程池（业务）
                   subR2 ─▶ 线程池
                   subR3 ─▶ 线程池
```

## 各语言的封装

```text
Go   net 标准库：goroutine-per-connection，阻塞写法背后是 netpoller（epoll）
     —— 语法上 BIO，运行时帮你多路复用
Node.js 事件循环本身就是 Reactor；libuv 封装 epoll/kqueue/IOCP
Java NIO → Netty（主从 Reactor + 零拷贝 + 对象池）
Redis 单线程 + epoll（命令执行快，瓶颈不在线程模型）
Nginx master-worker + epoll（ET + 非阻塞）
```

## C10K → C10M

```text
C10K 问题（1999）：一万个并发连接，fork-per-connection 模型崩溃
  解法：IO 多路复用 + 事件驱动（epoll + Reactor）

C10M 问题：千万级连接
  思路：内核旁路（DPDK/用户态协议栈）、SO_REUSEPORT 多队列、
       io_uring、绑定 CPU/NUMA 亲和、无锁数据结构
```

## 常用网络编程选项

```c
SO_REUSEADDR   // 重启服务立刻绑定 TIME_WAIT 中的端口（服务端必开）
SO_REUSEPORT   // 多进程/线程绑同一端口，内核负载均衡（Nginx reuseport）
SO_KEEPALIVE   // TCP 保活（见 TCP 进阶篇）
TCP_NODELAY    // 关 Nagle，低延迟场景必开
SO_SNDBUF / SO_RCVBUF  // 收发缓冲区大小
```

## 练习

1. 用任意语言实现一个 TCP echo server，并用 `nc` 测试
2. 分析：为什么 Redis 单线程也能扛 10w QPS？（epoll + 纯内存 + 无锁 + 短命令）
3. 用 Go 写一个并发端口扫描器（`net.DialTimeout` + goroutine 池）

下一篇：[抓包与网络排查](./06-troubleshooting.md)。
