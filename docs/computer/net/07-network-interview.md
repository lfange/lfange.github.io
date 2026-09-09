---
title: 计算机网络面试题集
icon: article
category:
  - 计算机网络
  - Guide
tag:
  - interview
---

# 计算机网络面试题集

> 按主题整理的高频面试题，每题给出要点式答案，详细原理见对应篇章链接。

## 基础与分层

### 1. OSI 七层与 TCP/IP 四层分别是什么？

```text
OSI：物理、链路、网络、传输、会话、表示、应用
TCP/IP：网络接口、网络(IP)、传输(TCP/UDP)、应用(HTTP/DNS/...)
学习用五层折中。OSI 是理论标准，TCP/IP 是事实标准。
```

### 2. 各层设备与协议对应？

| 层 | 设备 | 协议/数据单位 |
| --- | --- | --- |
| 应用层 | 网关/代理 | HTTP、DNS、SMTP |
| 传输层 | —— | TCP/UDP，报文段 |
| 网络层 | 路由器 | IP/ICMP/ARP，分组 |
| 链路层 | 交换机/网桥 | 以太网，帧 |
| 物理层 | 集线器/中继器 | 比特 |

### 3. 从输入 URL 到页面展示发生了什么？

```text
URL 解析 → DNS 解析（缓存逐级查）→ TCP 三次握手 → TLS 握手
→ 发送 HTTP 请求 → 服务端处理 → 响应
→ 浏览器解析（DOM/CSSOM → 渲染树 → 布局 → 绘制）
→ 连接复用或关闭
每个环节都能被追问，展开见各层笔记。
```

## TCP / UDP

### 4. TCP 和 UDP 的区别及选型场景？

```text
TCP：连接、可靠、有序、流量/拥塞控制、字节流、点对点 —— 文件/页面/API
UDP：无连接、尽最大努力、报文、开销小、支持广播 —— 视频/DNS/游戏
```

### 5. 三次握手为什么不能两次？

```text
两次的问题：服务端无法确认「我能收到客户端的数据」；
历史重复的 SYN（旧连接）会让服务端白白建立连接浪费资源。
（RFC 拟人化解释：对话需要「你好」「我听到你，你能听到我吗」「能」三步）
```

### 6. 四次挥手为什么要 TIME_WAIT 等 2MSL？

```text
1. 最后的 ACK 可能丢，需重发 ACK 响应对方重传的 FIN
2. 让旧报文自然消亡，防止污染相同四元组的新连接
```

### 7. TCP 如何保证可靠传输？

```text
校验和 + 序号/确认应答 + 超时重传 + 快速重传
+ 滑动窗口（流量控制）+ 拥塞控制（慢启动/拥塞避免/快重传/快恢复）
```

### 8. 什么是粘包？怎么解决？

见 [TCP 进阶实战](./02-tcp-advanced.md)：字节流无边界，应用层用定长/分隔符/长度前缀划分消息。

### 9. TCP keepalive 和应用层心跳的区别？

内核 keepalive 默认 2 小时且只探测 TCP 孤儿连接；应用层心跳秒级、能探测应用假死、适配 NAT。生产用应用层心跳。

## HTTP / HTTPS

### 10. HTTP/1.1、HTTP/2、HTTP/3 的核心改进？

```text
1.1：长连接、Host、chunked；队头阻塞 → 并发 6 连接 workaround
2：二进制分帧、多路复用（解 HTTP 层队头阻塞）、HPACK；TCP 队头阻塞仍在
3：QUIC(UDP)，0/1-RTT、流独立无队头阻塞、连接迁移
```

### 11. HTTPS 握手过程？为什么对称+非对称混合？

```text
ClientHello/ServerHello 交换随机数与套件 → 证书下发校验 →
密钥交换（非对称）→ 生成会话密钥 → 之后对称加密通信。
非对称解决密钥交换（安全但慢），对称保证通信性能。
TLS 1.3 已压缩到 1-RTT。
```

### 12. HTTPS 绝对安全吗？

```text
不是。中间人攻击（信任的根被污染/企业代理证书）、证书私钥泄露、
TLS 版本/套件弱配置、0-RTT 重放。安全性取决于实现与信任链。
```

### 13. 强缓存与协商缓存？

```text
强：Cache-Control: max-age，不发请求
协商：ETag/Last-Modified，发请求，命中返回 304
最佳实践：hash 资源长强缓存，HTML 用 no-cache
```

### 14. 跨域是什么？CORS 预检触发条件？

```text
同源=协议+域名+端口全同。浏览器执行（不是服务端）。
非简单请求（自定义头/json content-type/PUT/DELETE）先 OPTIONS 预检。
带 cookie 时 Allow-Origin 不能为 *。
```

### 15. Cookie / Session / Token(JWT) 对比？

```text
Cookie：浏览器存储，自动携带，可 HttpOnly/Secure/SameSite
Session：服务端存状态，Cookie 只存 session id（服务端有状态）
JWT：自包含签名 token，无状态易水平扩展；难主动失效（黑名单/短有效期）
```

## DNS / CDN

### 16. DNS 解析过程？递归和迭代的区别？

```text
浏览器缓存→hosts→LocalDNS→根→.com→权威，结果按 TTL 缓存。
递归：客户端只问 LocalDNS 一句，剩下的它代办。
迭代：LocalDNS 逐级自己问（根给你 .com 地址，你去问 .com……）
```

### 17. CDN 工作原理？

CNAME 到调度系统 → 按用户 IP/负载返回最近边缘节点 → 边缘缓存 miss 则回源。详见 [DNS 与 CDN](./03-dns-cdn.md)。

## 实时通信 / 编程

### 18. WebSocket 和轮询、长轮询、SSE 的对比？

见 [实时通信](./04-realtime-communication.md)。要点：单向推送用 SSE，双向实时用 WebSocket。

### 19. select/poll/epoll 区别？epoll 为什么快？

```text
select：1024 上限，每次全量拷贝+O(n) 扫描
poll：去上限，其余同 select
epoll：注册一次（红黑树），就绪回调入链表，epoll_wait O(1)，
       支持 ET 边缘触发
快的原因：把「每次传全部 fd」变成「就绪的直接给你」。
```

### 20. Reactor 模式是什么？

事件分发（epoll）+ 事件处理器。单 Reactor 单线程（Redis）、主从 Reactor（Netty）。详见 [网络编程与 IO 模型](./05-network-programming.md)。

## 排查实战题

### 21. 线上接口慢，怎么定位？

```text
1. curl -w 拆分 DNS/TCP/TLS/TTFB/下载 各阶段耗时
2. TTFB 长 → 后端慢：查服务端日志/链路追踪
3. 建连长 → 网络问题：mtr 看链路，跨机房考虑就近接入
4. 全链路：DevTools Timing、网关日志、APM（trace 串起来）
```

### 22. 服务大量 CLOSE_WAIT，说明什么？

对方已关闭而本方应用没调 close —— 连接泄漏，代码问题。排查见 [抓包与网络排查](./06-troubleshooting.md)。

## 冷门但高频的坑

### 23. ping 用什么协议？traceroute 原理？

```text
ping：ICMP echo request/reply
traceroute：TTL 从 1 递增，每跳路由器回 ICMP Time Exceeded，
           最后目的地回 echo reply，逐跳还原路径
```

### 24. GET 请求有 body 吗？URL 长度限制？

```text
HTTP 规范不禁止 GET 带 body，但语义上不该有，很多代理/服务器直接丢弃。
URL 长度没有协议级限制，2083 字节是 IE 的实现限制；
实践里 URL 过长会触发服务器 414。
```

### 25. 301 和 302 的区别？304 是什么？

```text
301 永久重定向（浏览器缓存，SEO 权重转移）
302 临时重定向（不长期缓存）
304 协商缓存命中：Not Modified，无响应体
```

## 系列总结

| 篇目 | 主题 |
| --- | --- |
| [HTTP 与 HTTPS 深入](./01-http-https.md) | 版本演进、TLS、缓存、CORS |
| [TCP 进阶实战](./02-tcp-advanced.md) | TIME_WAIT、粘包、心跳、调优 |
| [DNS 与 CDN](./03-dns-cdn.md) | 解析、调度、DoH、回源 |
| [实时通信](./04-realtime-communication.md) | WebSocket、SSE、WebRTC |
| [网络编程与 IO 模型](./05-network-programming.md) | Socket、epoll、Reactor |
| [抓包与网络排查](./06-troubleshooting.md) | tcpdump、Wireshark、实战 |
| 面试题集（本篇） | 高频题速答 |

配合理论篇食用：[网络体系结构](./network-architecture.md) · [应用层](./applicationlayer.md) · [传输层](./transmission.md) · [网络层](./networklayer.md) · [数据链路层](./datalinklayer.md) · [物理层](./physicallayer.md)
