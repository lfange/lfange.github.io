# 客户端存储

客户端存储是由 JavaScript APIs 组成的因此允许你在客户端存储数据 (比如在用户的机器上)，而且可以在需要的时候重新取得需要的数据。这有很多明显的用处

localStorage,sessionStorage,cookie 等等。这些功能主要用于缓存一些必要的数据，比如用户信息。比如需要携带到后端的参数。亦或者是一些列表数据等等。

不过这里需要注意。像 localStorage，sessionStorage 这种用户缓存数据的功能，他只能保存 5M 左右的数据，多了不行。cookie 则更少，大概只能有 4kb 的数据。

## Cookie

[Cookie](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Cookies) 是服务器发送到用户浏览器并保存在本地的一小块数据。浏览器会存储 cookie 并在下次向同一服务器再发起请求时携带并发送到服务器上。通常，它用于告知服务端两个请求是否来自同一浏览器——如保持用户的登录状态。Cookie 使基于无状态的 HTTP 协议记录稳定的状态信息成为了可能。

Cookie 主要用于以下三个方面
  会话状态管理
    如用户登录状态、购物车、游戏分数或其它需要记录的信息

  个性化设置
    如用户自定义设置、主题和其他设置

  浏览器行为跟踪
    如跟踪分析用户行为等

浏览器的每次请求都会携带 Cookie 数据，会带来额外的性能开销（尤其是在移动环境下, 新的浏览器 API 已经允许开发者直接将数据存储到本地，如使用 Web storage API（localStorage 和 sessionStorage）或 IndexedDB 。

[Document.cookie API](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/cookie) 无法访问带有 HttpOnly 属性的 cookie

## Web Storage API 

[Web Storage API](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_Storage_API) 提供了一种非常简单的语法，用于存储和检索较小的、由名称和相应值组成的数据项。当您只需要存储一些简单的数据时，比如用户的名字，用户是否登录，屏幕背景使用了什么颜色等等，这是非常有用的

### sessionStorage
`sessionStorage` 为每一个给定的源（given origin）维持一个独立的存储区域，该存储区域在页面会话期间可用（即只要浏览器处于打开状态，包括页面重新加载和恢复）。

- 页面会话在浏览器打开期间一直保持，并且重新加载或恢复页面仍会保持原来的页面会话。
- **在新标签或窗口打开一个页面时会复制顶级浏览会话的上下文作为新会话的上下文，**这点和 session cookies 的运行方式不同。
- 打开多个相同的 URL 的 Tabs 页面，会创建各自的 sessionStorage。
- 关闭对应浏览器标签或窗口，会清除对应的 sessionStorage。

### localStorage

`localStorage` 同样的功能，但是在浏览器关闭，然后重新打开后数据仍然存在
## IndexedDB API

[IndexedDB](https://developer.mozilla.org/zh-CN/docs/Web/API/IndexedDB_API)是一种底层 API，用于在客户端存储大量的结构化数据（也包括文件/二进制大型对象（blobs））
IndexedDB 可以在 Web Worker 中可用，IndexedDB 是一个事务型数据库系统，类似于基于 SQL 的 RDBMS。然而，不像 RDBMS 使用固定列表，IndexedDB 是一个基于 JavaScript 的面向对象数据库。IndexedDB 允许您存储和检索用键索引的对象；可以存储结构化克隆算法支持的任何对象。您只需要指定数据库模式，打开与数据库的连接，然后检索和更新一系列事务。

```javascript
let db;
function openDB() {
 const DBOpenRequest = window.indexedDB.open('toDoList');
 DBOpenRequest.onsuccess = (e) => {
   db = DBOpenRequest.result;
 }
}
```

web 缓存主要指的是两部分：浏览器缓存和 http 缓存。

其中 http 缓存是 web 缓存的核心，是最难懂的那一部分,也是最重要的那一部分。

## http 缓存

> 官方介绍:Web 缓存是可以自动保存常见文档副本的 HTTP 设备。当 Web 请求抵达缓存时， 如果本地有“已缓存的”副本，就可以从本地存储设备而不是原始服务器中提取这 个文档。

缓存主要是针对 html,css,img 等静态资源，常规情况下，我们不会去缓存一些动态资源

1. 优点

- 减少不必要的网络传输，节约宽带（就是省钱）
- 更快的加载页面（就是加速）
- 减少服务器负载，避免服务器过载的情况出现。（就是减载）

2. 缺点

占内存（有些缓存会被存到内存中）

### 强制缓存

强制缓存，我们简称强缓存。

从强制缓存的角度触发，如果浏览器判断请求的目标资源有效命中强缓存，如果命中，则可以直接从内存中读取目标资源，无需与服务器做任何通讯

#### Expires

Expires 字段的作用是，设定一个强缓存时间。在此时间范围内，则从内存（或磁盘）中读取缓存返回。

比如说将某一资源设置响应头为: `Expires:new Date("2023-7-30 23:59:59")`

```javascript
// node
const http = require('http')
const fs = require('fs')

http
  .createServer((req, res) => {
    res.writeHead(200, {
      Expires: new Date('2023-7-30 23:59:59').toUTCString(),
    })
  })
  .listen(8000, () => {
    console.log('web Server Starting!!!')
  })
```

因为 Expires 判断强缓存是否过期的机制是:获取本地时间戳，并对先前拿到的资源文件中的 Expires 字段的时间做比较。来判断是否需要对服务器发起请求。这里有一个巨大的漏洞：“如果我本地时间不准咋办？”
是的，Expires 过度依赖本地时间，如果本地与服务器时间不同步，就会出现资源无法被缓存或者资源永远被缓存的情况。所以，Expires 字段几乎不被使用了。现在的项目中，我们并不推荐使用 Expires，强缓存功能通常使用 cache-control 字段来代替 Expires 字段。

#### Cache-control

Cache-control 这个字段在 http1.1 中被增加，Cache-control 完美解决了 Expires 本地时间和服务器时间不同步的问题。是当下的项目中实现强缓存的最常规方法。  
Cache-control 的使用方法页很简单，只要在资源的响应头上写上需要缓存多久就好了，单位是秒。

```javascript
//往响应头中写入需要缓存的时间
res.writeHead(200, {
  'Cache-Control': 'max-age=10',
})
```

[cache-Control 属性](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Cache-Control)

```javascript
'Cache-Control': public, private, no-store, no-cache, max-age=0, must-revalidate, proxy-revalidate
```

`public` 表示资源即可以被浏览器缓存也可以被代理服务器缓存  
`private` 表示资源只能被浏览器缓存  
`no-cache` 表示是**强制进行协商缓存**  
`no-store` 是表示**禁止任何缓存策略**  
`max-age` 决定客户端资源被缓存多久  
`s-maxage` 决定代理服务器缓存的时长

no-cache 和 no-store 是一组互斥属性，这两个属性不能同时出现在 Cache-Control 中

### 协商缓存

基于 last-modified 的协商缓存实现方式是:

1. 首先需要在服务器端读出文件修改时间，
2. 将读出来的修改时间赋给响应头的 last-modified 字段。
3. 最后设置 Cache-control:no-cache

```javascript
// node
const http = require("http");
const fs = require("fs");

http
  .createServer((req, res) => {
    res.writeHead(200, {
      const data = fs.readFileSync('./xx.png') // 读取资源
      const { mtime } = fs.statSync('./xx.png') // 读取修改时间
      res.setHeader('last-modified', mtime.toUTCString())
      res.setHeader('Catch-Control', 'no=cache')
      res.end(data)
    });
  })
  .listen(8000, () => {
    console.log("web Server Starting!!!");
  });
```

当客户端读取到 last-modified 的时候，会在下次的请求标头中携带一个字段:If-Modified-Since。

而这个请求头中的 If-Modified-Since 就是服务器第一次修改时候给他的时间 `res.setHeader('last-modified', mtime.toUTCString())`

```javascript
const data = fs.readFileSync('./xx.png') // 读取资源
const { mtime } = fs.statSync('./xx.png') // 读取修改时间

const ifModifiedSince = req.headers['if-modified-since']
// 比较第一次的修改时间和资源文件当前的修改时间是否一致
if (ifModifiedSince === mtime.toUTCString()) {
  // 如果一致，则说明文件没有被修改过，返回304
  res.statusCode = 304

  res.end()
  return
}

res.setHeader('last-modified', mtime.toUTCString())
res.setHeader('Cache-Control', 'no-cache')

res.end(data)
```

## reference

[http 缓存](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Caching)
