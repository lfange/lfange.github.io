# web 缓存

web 缓存主要指的是两部分：浏览器缓存和 http 缓存。

其中 http 缓存是 web 缓存的核心，是最难懂的那一部分,也是最重要的那一部分。

## 浏览器缓存

localStorage,sessionStorage,cookie 等等。这些功能主要用于缓存一些必要的数据，比如用户信息。比如需要携带到后端的参数。亦或者是一些列表数据等等。

不过这里需要注意。像 localStorage，sessionStorage 这种用户缓存数据的功能，他只能保存 5M 左右的数据，多了不行。cookie 则更少，大概只能有 4kb 的数据。

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
const http = require("http");
const fs = require("fs");

http
  .createServer((req, res) => {
    res.writeHead(200, {
      Expires: new Date("2023-7-30 23:59:59").toUTCString(),
    });
  })
  .listen(8000, () => {
    console.log("web Server Starting!!!");
  });
```

因为 Expires 判断强缓存是否过期的机制是:获取本地时间戳，并对先前拿到的资源文件中的 Expires 字段的时间做比较。来判断是否需要对服务器发起请求。这里有一个巨大的漏洞：“如果我本地时间不准咋办？”
是的，Expires 过度依赖本地时间，如果本地与服务器时间不同步，就会出现资源无法被缓存或者资源永远被缓存的情况。所以，Expires 字段几乎不被使用了。现在的项目中，我们并不推荐使用 Expires，强缓存功能通常使用 cache-control 字段来代替 Expires 字段。

#### Cache-control

Cache-control 这个字段在 http1.1 中被增加，Cache-control 完美解决了 Expires 本地时间和服务器时间不同步的问题。是当下的项目中实现强缓存的最常规方法。  
Cache-control 的使用方法页很简单，只要在资源的响应头上写上需要缓存多久就好了，单位是秒。

```javascript
//往响应头中写入需要缓存的时间
res.writeHead(200, {
  "Cache-Control": "max-age=10",
});
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

no-cache和no-store是一组互斥属性，这两个属性不能同时出现在Cache-Control中

### 协商缓存

基于last-modified的协商缓存实现方式是:

1. 首先需要在服务器端读出文件修改时间，
2. 将读出来的修改时间赋给响应头的last-modified字段。
3. 最后设置Cache-control:no-cache


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

当客户端读取到last-modified的时候，会在下次的请求标头中携带一个字段:If-Modified-Since。

而这个请求头中的If-Modified-Since就是服务器第一次修改时候给他的时间 `res.setHeader('last-modified', mtime.toUTCString())`

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
