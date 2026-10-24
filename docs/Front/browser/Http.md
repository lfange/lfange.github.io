---
icon: article
category:
  - Brower

tag:
  - Interview
---

# HTTP

超文本传输协议（`HTTP`）是一个用于传输超媒体文档（例如 HTML）的`应用层`协议。它是为 Web 浏览器与 Web 服务器之间的通信而设计的，但也可以用于其他目的。HTTP 遵循经典的客户端 - 服务端模型，客户端打开一个连接以发出请求，然后等待直到收到服务器端响应。HTTP 是无状态协议，这意味着服务器不会在两个请求之间保留任何数据（状态）。尽管通常基于 TCP/IP 层，但它可以在任何可靠的传输层上使用，也就是说，该协议不会像 UDP 那样静默的丢失消息。RUDP——作为 UDP 的可靠化升级版本——是一种合适的替代选择。

## 一、强缓存

（不发请求，浏览器直接读缓存，200 (from disk/memory cache)）关键响应头：Cache-Control（HTTP/1.1 推荐）或 Expires（HTTP/1.0，优先级较低）。

技术设置方法

1. 在 Nginx 中配置

```bash
location ~* \.(jpg|png|css|js)$ {
    expires 7d;                      # 设置 Expires 和 Cache-Control max-age
    add_header Cache-Control "public, immutable";
}
expires 7d → Cache-Control: max-age=604800

immutable 表示资源不会变化（适用于带 hash 的文件）
```

2. 在 Node.js (Express) 中配置

```javascript
app.use(
  express.static('public', {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 毫秒 → Cache-Control: max-age=604800
    etag: false, // 可选：关闭协商缓存
    lastModified: false,
  })
)
```

3. 直接通过响应头设置（后端任意语言）

```http
Cache-Control: public, max-age=86400   # 缓存 1 天
Cache-Control: private, max-age=3600   # 仅浏览器私有缓存
Cache-Control: no-cache                # 跳过强缓存，每次必须走协商缓存
Cache-Control: no-store                # 完全禁止缓存
```

## 二、协商缓存

（向服务器验证，决定是否使用缓存）关键响应头：ETag（优先级高） 和 Last-Modified（备用）。浏览器下次请求时会带上 If-None-Match（对应 ETag）或 If-Modified-Since。

技术设置方法

1. 使用 ETag（推荐，更精确） Nginx：默认自动开启 ETag（基于文件修改时间和大小）。手动关闭/开启：etag on;

Node.js (Express)：静态文件默认启用 ETag。对动态内容可手动生成 hash：

```javascript
app.get('/data', (req, res) => {
  const data = JSON.stringify({ updated: Date.now() })
  const hash = require('crypto').createHash('md5').update(data).digest('hex')
  if (req.headers['if-none-match'] === hash) {
    return res.status(304).end() // Not Modified
  }
  res.set('ETag', hash)
  res.send(data)
})
```

2. 使用 Last-Modified（秒级精度，存在局限） Nginx：默认开启，会自动生成 Last-Modified（文件修改时间）。浏览器下次请求带 If-Modified-Since，Nginx 自动判断返回 200 或 304。

后端手动设置：

```javascript
const lastModified = new Date('2025-01-01').toUTCString()
res.set('Last-Modified', lastModified)
if (req.headers['if-modified-since'] === lastModified) {
  return res.status(304).end()
}
```

## 三、优先级

强缓存与协商缓存同时存在的优先级先判断强缓存：如果 Cache-Control 的 max-age 未过期且没有 no-cache，直接读本地缓存（200 from disk/memory cache）。

若强缓存过期或设置 no-cache，则发起请求，带上协商缓存头（If-None-Match / If-Modified-Since）。

服务端返回 304（Not Modified）则使用本地缓存；返回 200 则更新缓存。

四、典型配置示例（同时开启） Nginx 完整示例

```bash
nginx
location ~* \.(css|js|png|jpg)$ {
    expires 30d;
    add_header Cache-Control "public";
    # ETag 和 Last-Modified 默认自动开启
}
location /index.html {
    add_header Cache-Control "no-cache";  # 每次都验证
}
```

后端 API 动态资源（建议关闭强缓存，仅用协商缓存）

```javascript
res.set({
  'Cache-Control': 'no-cache', // 跳过强缓存
  ETag: generateETag(content),
  'Last-Modified': fileMtime,
})
```

## 默认配置

后端不配置响应头，浏览器依然会自动缓存资源

后端不配置响应头，浏览器依然会自动缓存资源浏览器有内置默认缓存策略，不靠后端配置也会走缓存（基于资源类型、上次响应信息、浏览器内置规则）：静态资源（css/js/img/ 字体）：浏览器默认强缓存，短期内不发请求，直接读本地缓存； HTML、接口数据：默认协商缓存，刷新时发请求校验；无 Cache-Control/Expires/Etag/Last-Modified 时，浏览器靠历史响应状态、启发式缓存算法自动算过期时间（启发式缓存：用(Date - Last-Modified)/10 作为缓存有效期）。简单：后端不配 = 浏览器瞎缓存，不可控，线上必手动配置缓存头。
