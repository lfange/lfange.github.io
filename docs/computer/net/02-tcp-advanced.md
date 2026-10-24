---
title: TCP 进阶实战
icon: article
category:
  - 计算机网络
  - Guide
tag:
  - tcp
  - advanced
---

# TCP 进阶实战

基础部分（三次握手、四次挥手、滑动窗口、拥塞控制）见[传输层](./transmission.md)，本篇讲工程实战中真正会遇到的问题。

## 三次握手的工程细节

```text
半连接队列（SYN queue）：收到 SYN，还没完成握手
全连接队列（accept queue）：完成三次握手，等待应用 accept

相关内核参数：
  tcp_max_syn_backlog        # 半连接队列长度
  somaxconn                  # 全连接队列上限
  tcp_syncookies = 1         # SYN Flood 攻击防护（队列满时不占资源，用 cookie 校验）
```

**SYN Flood 攻击**：伪造源地址狂发 SYN 不回 ACK，占满半连接队列。防御：`tcp_syncookies`。

### 为什么握手是三次、挥手是四次？（进阶回答）

```text
握手 3 次：双方各确认「我发你收 / 你发我收」四个能力，SYN+ACK 可合并 → 3 次够了
挥手 4 次：TCP 全双工，被动方收到 FIN 时可能还有数据没发完，
          ACK 先回，等数据发完再发自己的 FIN → 中间不能合并
```

## TIME_WAIT 深入

主动关闭方最后回 ACK 后进入 TIME_WAIT，停留 **2MSL**（Linux 共 60s）。

### 为什么需要 TIME_WAIT

1. 最后的 ACK 若丢了，对方重发 FIN，还得能重答（保证连接正常关闭）
2. 让旧连接的报文在网络中自然死亡，避免污染**相同四元组**的新连接

### TIME_WAIT 过多的危害与治理

```text
危害：高并发短连接场景，主动关闭方（通常是服务器）大量端口被占用，
     连接表爆炸，新连接创建失败

✅ 正确做法：
  1. 用长连接 / 连接池（HTTP keep-alive、数据库连接池）—— 治本
  2. 开启 tcp_tw_reuse（仅客户端出方向，依赖时间戳）
  3. 扩大端口范围 net.ipv4.ip_local_port_range

❌ 危险做法：
  tcp_tw_recycle（NAT 环境下丢弃合法连接，内核 4.12 已移除该参数）
```

## TCP 粘包与拆包

TCP 是**字节流**协议，没有消息边界，`send` 三次可能被合并成一段，也可能一次被拆开。

```text
发送：AB | CDEFG | HI   （应用层以为发了 3 条消息）
接收：ABC | DEFGHI      （read 两次拿到的是这样的东西）

本质：不是 TCP 的问题——字节流本来就无边界，是应用层没有定义消息边界
```

### 解决方案

```text
1. 固定长度：每条消息定长，不足补齐（浪费）
2. 分隔符：\r\n（Redis、HTTP 头都这么做），消息体内要转义
3. 长度前缀（最常用）：header(4字节长度) + body
   ┌────────┬──────────────┐
   │ len=18 │   payload    │
   └────────┴──────────────┘
   Netty 的 LengthFieldBasedFrameDecoder 就是干这个的
```

```go
// Go 的长度前缀读法
var lenBuf [4]byte
io.ReadFull(conn, lenBuf[:])
length := binary.BigEndian.Uint32(lenBuf[:])
body := make([]byte, length)
io.ReadFull(conn, body)
```

## TCP Keepalive vs 应用层心跳

```text
TCP keepalive：内核机制，默认 2 小时无数据才探测（tcp_keepalive_time），
              且只能证明「TCP 连接活着」，不能证明「应用活着」
应用层心跳：自己定时发 ping/pong，秒级发现问题，NAT 友好

实践：IM/游戏/长连接网关一律用应用层心跳，不依赖内核 keepalive
```

## Nagle 与延迟确认

```text
Nagle 算法：小包攒够 MSS 或收到 ACK 才发 —— 省带宽，增延迟
延迟确认：收到的数据先不回 ACK，等捎带或超时 —— 省包，增延迟

两者叠加 = 40ms 左右的莫名延迟（经典线上事故）

解决：实时性敏感的场景关 Nagle
  setsockopt(fd, IPPROTO_TCP, TCP_NODELAY, 1)
  （Redis、Nginx 对上游、WebSocket 默认都开了 TCP_NODELAY）
```

## 拥塞控制在现代的表现

传统：慢启动 → 拥塞避免 → 快重传 → 快恢复（Reno）。

现代内核默认 **CUBIC**，Google 的 **BBR** 是另一种思路：

```text
Reno/CUBIC：丢包 = 拥塞信号，降窗重来（在长肥管道、WiFi 丢包环境下太保守）
BBR：主动测量带宽和 RTT，按瓶颈带宽*RTT 控速，不依赖丢包信号
     高延迟、弱网环境吞吐显著提升
```

## TCP vs UDP 选型

| 场景 | 选择 | 原因 |
| --- | --- | --- |
| 网页/API | TCP（HTTP） | 可靠有序 |
| 视频通话、直播 | UDP（RTP） | 实时性 > 完整性，丢帧不重传 |
| 游戏（MOBA/FPS） | UDP | 低延迟，逻辑层自己做可靠性 |
| DNS 查询 | UDP | 一问一答，短小 |
| 文件传输 | TCP | 不能错不能丢 |

> QUIC（HTTP/3）= 在 UDP 上重造了可靠传输 + TLS + 多路复用，说明「TCP 的可靠 + UDP 的灵活」可以兼得。

## 一道经典题：大量 CLOSE_WAIT 说明什么

```text
CLOSE_WAIT：对方关了连接（收到 FIN 回了 ACK），本方应用还没调 close()

大量 CLOSE_WAIT = 代码 bug：忘记关闭连接
  - 连接泄漏（连接数缓慢上涨直到耗尽）
  - 排查：lsof -i | grep CLOSE_WAIT 找进程，审查代码里所有
    拿到连接的地方是否都正确 close/defer close
```

## 实用命令速查

```bash
ss -s                       # 连接数总览
ss -tan state time-wait     # TIME_WAIT 数量
ss -tan state close-wait    # CLOSE_WAIT（异常指标）
netstat -s | grep -i retrans    # 重传统计
ss -ti dst 10.0.0.1         # 看 cwnd、rtt 等内部指标

# 内核参数（/etc/sysctl.conf）
net.ipv4.tcp_syncookies = 1
net.ipv4.tcp_tw_reuse = 1
net.core.somaxconn = 4096
net.ipv4.ip_local_port_range = 10240 65000
```

下一篇：[DNS 与 CDN](./03-dns-cdn.md)。
