---
title: 实时通信：WebSocket 与 SSE
icon: article
category:
  - 计算机网络
  - Guide
tag:
  - websocket
  - realtime
---

# 实时通信：WebSocket 与 SSE

## 为什么需要「实时」方案

HTTP 是请求-响应模型，服务端无法主动推送。传统 workaround：

| 方案 | 原理 | 问题 |
| --- | --- | --- |
| 短轮询 | 客户端定时请求 | 延迟=轮询间隔，大量空请求 |
| 长轮询 | 服务端 hold 住请求直到有数据 | 每次返回后要重建请求；并发大时连接压力大 |
| SSE | 服务端单向流式推送 | 只能服务端→客户端，纯文本 |
| WebSocket | 全双工长连接 | 需要单独维护连接体系 |

## WebSocket 协议

### 建连：HTTP 升级

```text
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

── 服务端同意 ──
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Sec-WebSocket-Accept: s3pAAWJhNGU2YjI5...

之后这个 TCP 连接不再说 HTTP，改说 WebSocket 帧协议
```

### 数据帧（了解结构）

```text
FIN + opcode（text/binary/ping/pong/close）+ mask + payload
- 客户端→服务端必须掩码（mask），服务端→客户端不掩码
- opcode 0x9/0xA 是 ping/pong 心跳帧
- 控制帧（关闭/心跳）载荷 ≤ 125 字节，不分级
```

### 使用示例

```js
// 浏览器
const ws = new WebSocket('wss://example.com/chat')

ws.onopen = () => ws.send(JSON.stringify({ type: 'msg', text: 'hi' }))
ws.onmessage = e => console.log(JSON.parse(e.data))
ws.onclose = e => console.log('closed', e.code, e.reason)

// 心跳 + 断线重连（生产必备）
let timer
ws.onopen = () => {
  timer = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) ws.send('{"type":"ping"}')
  }, 15000)
}
ws.onclose = () => {
  clearInterval(timer)
  setTimeout(reconnect, backoff())   // 指数退避重连
}
```

```js
// Node.js 服务端（ws 库）
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', ws => {
  ws.on('message', data => {
    // 广播给所有连接
    wss.clients.forEach(c => c.readyState === 1 && c.send(data.toString()))
  })
})
```

### 生产化要点

```text
1. 心跳：应用层 ping/pong（15~30s），3 次未响应判定假死，主动断开
   （不能只依赖 TCP keepalive，见 TCP 进阶篇）
2. 重连：指数退避（1s→2s→4s...封顶），避免雪崩
3. 鉴权：URL query 带 token 或首条消息鉴权（101 阶段带 cookie 也可）
4. 网关/代理配置：
   Nginx: proxy_http_version 1.1 + Upgrade/Connection 头透传 + 读超时调大
5. 集群：多实例下消息路由 —— 网关层（如根据 userId hash 到节点）
   或引入 Redis Pub/Sub / MQ 广播
6. 消息可靠性：WebSocket 本身基于 TCP 可靠，但断线期间的消息会丢
   → 消息带序号 ID，重连后增量拉取
```

## SSE（Server-Sent Events）

服务端 → 客户端的单向流，本质是**长连接的 HTTP 响应**（`Content-Type: text/event-stream`）。

```js
// 客户端（浏览器原生 EventSource，自动重连）
const es = new EventSource('/api/stream')

es.onmessage = e => console.log(e.data)
es.addEventListener('update', e => console.log(JSON.parse(e.data)))
```

```js
// Node.js 服务端
res.writeHead(200, {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
})

setInterval(() => {
  res.write(`event: update\ndata: ${JSON.stringify({ t: Date.now() })}\n\n`)
}, 1000)

// 注意：消息以空行分隔；断开后 EventSource 自动重连（Last-Event-ID 可续传）
```

### SSE vs WebSocket 选型

| | SSE | WebSocket |
| --- | --- | --- |
| 方向 | 单向（服务端→客户端） | 全双工 |
| 协议 | 纯 HTTP | 独立协议（升级握手） |
| 自动重连 | ✅ 浏览器内置 | ❌ 自己实现 |
| 浏览器兼容 | EventSource（除老 IE） | 全支持 |
| 数据格式 | 文本（UTF-8） | 文本 + 二进制 |
| 代理/防火墙友好 | ✅ 就是 HTTP | 需要配置 Upgrade |
| 典型场景 | 通知、进度条、AI 流式输出 | 聊天、游戏、协同编辑 |

> 经验：只需要「服务端推」就用 SSE（AI 应用的打字机输出就是 SSE）；需要双向实时才上 WebSocket。

## WebRTC 简介

浏览器间 P2P 音视频/数据传输（视频会议、屏幕共享）：

```text
信令（交换 SDP/ICE）→ STUN（发现公网地址）→ P2P 直连
                     → 打洞失败走 TURN 中继
媒体传输用 SRTP，不经过服务器（省带宽）
信令本身可以用 WebSocket 承载
```

## 面试常见题

1. **WebSocket 和 HTTP 什么关系？** 借 HTTP 101 握手升级，之后是独立的帧协议，共用同一个 TCP 连接
2. **WebSocket 会丢消息吗？** TCP 保证有序可靠；但断线期间的消息收不到，需应用层做消息补偿（序号+补拉）
3. **为什么大厂消息推送不用 WebSocket 长连？** 海量长连接的内存/调度成本高，会用 UDP+自研协议 或专用推送网关
4. **SSE 如何实现 AI 流式输出？** LLM 逐 token 生成，服务端 res.write 每个 chunk，前端 EventSource/onmessage 渐进渲染

下一篇：[网络编程与 IO 模型](./05-network-programming.md)。
