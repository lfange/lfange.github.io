---
title: DNS 与 CDN
icon: article
category:
  - 计算机网络
  - Guide
tag:
  - dns
  - cdn
---

# DNS 与 CDN

## DNS 解析完整流程

输入 `www.example.com` 后：

```text
浏览器缓存 → 系统缓存（hosts）→ 本地 DNS 服务器（运营商/公共 DNS）
  → 根域名服务器（. 返回 .com 的 NS）
  → 顶级域服务器（.com 返回 example.com 的 NS）
  → 权威 DNS 服务器（返回 A 记录 IP）
← 逐级缓存，按 TTL 失效
```

> 递归查询（客户端→本地 DNS）vs 迭代查询（本地 DNS→各级服务器）是面试经典区分点。

### 解析记录类型

| 类型 | 含义 |
| --- | --- |
| A | 域名 → IPv4 |
| AAAA | 域名 → IPv6 |
| CNAME | 域名 → 别名（CDN 接入的核心） |
| MX | 邮件服务器 |
| NS | 该域的权威 DNS |
| TXT | 任意文本（域名验证、SPF） |

```bash
dig www.example.com            # 完整解析过程
dig +trace www.example.com     # 模拟从根开始迭代
dig www.example.com CNAME      # 指定记录类型
nslookup www.example.com       # Windows/Linux 通用
```

## CDN 原理

CDN（内容分发网络）= 把内容缓存到离用户最近的边缘节点。

```text
用户请求 static.example.com
  1. DNS 解析：CNAME 指向 CDN 智能调度系统
     （static.example.com → CNAME → cdn.provider.com）
  2. 调度系统根据 用户IP、节点负载、网络质量 返回最近的边缘节点 IP
  3. 用户从该边缘节点拉取内容
  4. 边缘未命中 → 回源站拉取并缓存（Cache-Control 决定缓存多久）
```

### 调度方式

| 方式 | 原理 |
| --- | --- |
| DNS 调度（主流） | CNAME + 智能DNS，按用户 IP 所在区域返回节点 |
| HTTP 302 调度 | 请求先到调度中心，302 跳转到最近节点（更精准，多一跳） |
| Anycast | 同一 IP 广播到多地，BGP 路由就近（DNS 服务常用，如 8.8.8.8） |

### 缓存与回源策略

```text
静态资源：hash 文件名 + 长缓存，发布即失效（新 URL 天然 miss）
HTML：短缓存或不缓存
回源：边缘 miss、缓存过期、可配置「遵循源站 Cache-Control」

刷新：CDN 控制台提交 URL 刷新（强制 miss）——热更新/紧急修复用
```

### CDN 带来的典型问题

```text
1. 获取用户真实 IP：回源时 CDN 会带 X-Forwarded-For（第一跳是真实 IP）
2. 缓存击穿：热门资源过期瞬间大量回源 → 源站压力骤增
   → 合理 TTL、边缘预刷新、源站限流
3. HTTPS：CDN 需要证书。方案：CDN 托管证书 或 回源全程 TLS
```

## 前端工程里的 DNS 优化

```text
1. dns-prefetch：<link rel="dns-prefetch" href="//cdn.example.com">
   提前解析第三方域名（兼容性最好）
2. preconnect：dns + tcp + tls 全提前，代价更大，只给关键域
   <link rel="preconnect" href="//api.example.com">
3. 减少域名数量：HTTP/2 下同域多路复用，不必再域名分片
```

## 劫持与安全

| 劫持类型 | 表现 | 防御 |
| --- | --- | --- |
| DNS 劫持 | 解析到错误 IP（插广告、钓鱼） | DoH/DoT（DNS over HTTPS/TLS）、HTTPDNS |
| 运营商缓存劫持 | 200 带广告字节流 | 全站 HTTPS |
| CDN 污染 | 源站被攻破 | 源站只允许 CDN 回源 IP 访问 |

```text
DoH：RFC 8484，DNS 查询走 HTTPS（443），加密防窃听篡改
     浏览器内置（Chrome 安全 DNS、Firefox 默认开启）
HTTPDNS：客户端直接 HTTP 请求 DNS 服务商接口拿 IP，
        绕过运营商 LocalDNS（移动端 App 常用，解决调度不准）
```

## 实战排查

```bash
# 域名解析异常
dig @8.8.8.8 www.example.com        # 换公共 DNS 对比，判断 LocalDNS 问题
dig +trace www.example.com           # 看各级授权是否正常

# CDN 是否命中：看响应头
curl -sI https://cdn.example.com/a.js | grep -i x-cache
# X-Cache: HIT（命中）/ MISS（回源了）

# 指定源站测试（绕过 CDN）
curl -H "Host: www.example.com" http://源站IP/
```

下一篇：[实时通信：WebSocket/SSE](./04-realtime-communication.md)。
