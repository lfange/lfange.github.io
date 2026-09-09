---
title: HTTP 与 HTTPS 深入
icon: article
category:
  - 计算机网络
  - Guide
tag:
  - http
  - https
---

# HTTP 与 HTTPS 深入

## HTTP 基础回顾

HTTP 是应用层协议，基于 TCP（HTTP/3 基于 QUIC/UDP），默认端口 80（HTTPS 443）。

```text
请求：GET /api/user HTTP/1.1
      Host: example.com
      Connection: keep-alive

响应：HTTP/1.1 200 OK
      Content-Type: application/json
```

### HTTP 方法与幂等性

| 方法 | 幂等 | 安全（只读） | 典型用途 |
| --- | --- | --- | --- |
| GET | ✅ | ✅ | 查询 |
| POST | ❌ | ❌ | 创建、复杂提交 |
| PUT | ✅ | ❌ | 全量更新 |
| PATCH | ❌ | ❌ | 部分更新 |
| DELETE | ✅ | ❌ | 删除 |

> 幂等：同一请求执行多次与一次效果相同。重试逻辑只应作用于幂等请求。

### 状态码分类

| 类别 | 含义 | 常见 |
| --- | --- | --- |
| 1xx | 中间状态 | `101 Switching Protocols`（WebSocket 升级） |
| 2xx | 成功 | `200`、`204` 无内容、`206` 断点续传 |
| 3xx | 重定向 | `301` 永久、`302` 临时、`304` 协商缓存命中 |
| 4xx | 客户端错误 | `400`、`401` 未认证、`403` 无权限、`404`、`429` 限流 |
| 5xx | 服务端错误 | `500`、`502` 网关错误、`503` 不可用、`504` 网关超时 |

> 面试易考：`301` vs `302`（永久/临时，301 会被浏览器缓存）；`401` vs `403`（未登录 / 登录了但没权限）。

## HTTP 版本演进

### HTTP/1.0 → 1.1（1997）

```text
1.0：每请求一个 TCP 连接，代价大
1.1：keep-alive 默认长连接
     + 支持管道化（pipelining，但队头阻塞，实际没人用）
     + Host 头（虚拟主机）
     + 断点续传 Range、chunked 分块传输
```

**HTTP/1.1 的队头阻塞**：一个连接上请求必须按序响应，前面的慢了后面全排队 → 浏览器的 workaround 是开 6 个并发连接。

### HTTP/2（2015）

```text
二进制分帧：报文拆成二进制帧，机器友好
多路复用：一个 TCP 连接上并行多个流，解决 HTTP 层队头阻塞
     ⚠️ TCP 层队头阻塞仍在（丢一个包，所有流都得等重传）
头部压缩：HPACK 压缩重复 header
服务器推送：主动推资源（实践效果差，Chrome 已移除支持）
```

> 前端考点：**域名分片（domain sharding）在 HTTP/2 下反而有害**——多个 TCP 连接互相竞争带宽，不如单连接多路复用。

### HTTP/3（2022）

```text
传输层换成 QUIC（基于 UDP）：
  0/1-RTT 建连（TLS 1.3 内置，握手更快）
  彻底解决 TCP 队头阻塞（流之间独立）
  连接迁移（Connection ID，切 WiFi/4G 不断线）
```

## HTTPS = HTTP + TLS

```text
HTTP 明文传输三大风险：窃听、篡改、冒充
HTTPS = HTTP over TLS：加密（防窃听）+ 完整性校验（防篡改）+ 证书（防冒充）
```

### TLS 1.2 握手流程（RSA 交换，经典图）

```text
Client                                          Server
  │ ── ClientHello（支持的加密套件、随机数C）────▶ │
  │ ◀── ServerHello（选定套件、随机数S）───────── │
  │ ◀── Certificate（服务器证书）─────────────── │
  │ ── 客户端校验证书，生成预主密钥，用公钥加密 ──▶ │
  │      （之后双方用 C+S+预主密钥 生成会话密钥）   │
  │ ── Finished（用会话密钥加密的校验数据）─────▶ │
  │ ◀──────────────── Finished ──────────────── │
  │ ══════════ 之后全部对称加密通信 ══════════ │
```

要点：

- **非对称加密只用于交换密钥**（慢），通信用**对称加密**（快）
- TLS 1.3 握手降到 **1-RTT**，会话恢复可达 **0-RTT**（有重放风险，只用于幂等请求）

### 证书校验链

```text
浏览器内置根证书（Root CA）
  → 签发中间证书（Intermediate CA）
    → 签发站点证书（example.com）

校验：域名匹配 + 有效期 + 吊销状态 + 逐级验签到受信任的根
```

## HTTP 缓存（前端高频）

### 强缓存（不发请求）

```text
Cache-Control: max-age=31536000      # 优先级高于 Expires
Cache-Control: no-cache              # 有缓存但每次要协商
Cache-Control: no-store              # 完全不缓存
```

命中时浏览器直接用本地副本，DevTools 显示 `200 (from disk/memory cache)`。

### 协商缓存（发请求校验）

```text
方案一：Last-Modified / If-Modified-Since（秒级精度，有缺陷）
方案二：ETag / If-None-Match（内容哈希，优先级更高）

命中 → 304 Not Modified，无 body，继续用缓存
```

**实战策略**：

```text
带 hash 的静态资源（app.a3f9c2.js）→ Cache-Control: max-age=31536000（一年）
HTML 入口文件                     → no-cache（每次协商，保证拿到新 hash 引用）
API 响应                          → 按业务，通常 no-store 或短 max-age
```

## 跨域与 CORS

同源策略：协议 + 域名 + 端口全相同才是同源。跨域由**浏览器**执行（服务端之间没有限制）。

```text
简单请求：GET/POST/HEAD + 安全 header → 直接发，浏览器检查响应头
非简单请求（如 Content-Type: application/json）→ 先发 OPTIONS 预检
```

服务端响应头：

```text
Access-Control-Allow-Origin: https://a.com     # 或 *（不允许携带 cookie 时）
Access-Control-Allow-Methods: GET, POST
Access-Control-Allow-Headers: Content-Type
Access-Control-Max-Age: 86400                  # 预检结果缓存
Access-Control-Allow-Credentials: true         # 允许带 cookie
```

> 注意：`Allow-Credentials: true` 时 `Allow-Origin` 不能是 `*`。

## 常见面试题

1. **HTTP/1.1、2、3 的主要改进？** → 长连接；多路复用+二进制分帧；QUIC 解决 TCP 队头阻塞
2. **HTTPS 为什么既用非对称又用对称加密？** → 非对称解决密钥交换，对称保证性能
3. **浏览器输入 URL 到页面展示发生了什么？**（见 [Web 页面请求过程](./applicationlayer.md)）→ DNS → TCP → TLS → HTTP → 解析渲染
4. **强缓存和协商缓存的区别？** → 是否向服务器发请求校验
5. **GET 和 POST 的区别？** → 幂等性/语义/参数位置/缓存；本质都是 TCP 报文，长度限制来自浏览器和服务器实现

## 本系列导航

1. HTTP 与 HTTPS 深入（本篇）
2. [TCP 进阶实战](./02-tcp-advanced.md)
3. [DNS 与 CDN](./03-dns-cdn.md)
4. [实时通信：WebSocket/SSE](./04-realtime-communication.md)
5. [网络编程与 IO 模型](./05-network-programming.md)
6. [抓包与网络排查](./06-troubleshooting.md)
7. [计算机网络面试题集](./07-network-interview.md)
