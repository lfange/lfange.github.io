---
title: Node.js 高级知识
icon: engine
category:
  - 后端
  - Node.js
---

# Node.js 高级知识

> 本文整理 Node.js 进阶核心知识：事件循环、libuv 线程池、Stream、Buffer、内存与 V8 GC、Cluster 多进程、模块系统、错误处理与性能优化。

## 一、事件循环（Event Loop）

Node 的事件循环由 libuv 实现，JS 执行是单线程的，但 I/O 由底层异步驱动。

### 1. 六个阶段

一次 tick 按顺序经过以下阶段：

| 阶段 | 说明 |
|------|------|
| `timers` | 执行到期的 `setTimeout` / `setInterval` 回调 |
| `pending callbacks` | 执行上一轮延迟到本轮的系统级回调（如 TCP `errno`、DNS 错误） |
| `idle, prepare` | 内部使用 |
| `poll` | 取新的 I/O 事件，执行 I/O 回调；若无定时器到期会阻塞等待 |
| `check` | 执行 `setImmediate` 回调 |
| `close callbacks` | 执行 `close` 事件回调，如 `socket.on('close')` |

### 2. 微任务与宏任务

- 每个阶段切换之间，会清空**微任务队列**。
- 微任务有两类，`process.nextTick` 的优先级**高于** `Promise.then`：

```js
Promise.resolve().then(() => console.log('promise'))
process.nextTick(() => console.log('nextTick'))
// 输出：nextTick → promise
```

### 3. nextTick vs setImmediate vs setTimeout

| API | 执行时机 |
|-----|----------|
| `process.nextTick` | 当前同步代码后、下一阶段前，**最早** |
| `setImmediate` | `check` 阶段 |
| `setTimeout(fn, 0)` | `timers` 阶段 |

在主模块顶层，`setImmediate` 与 `setTimeout` 的先后**不确定**（取决于进程启动耗时）；但在 **I/O 回调中**，`setImmediate` 一定先于 `setTimeout`：

```js
const fs = require('fs')

fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0)
  setImmediate(() => console.log('immediate'))
})
// 输出：immediate → timeout
```

::: tip 关键结论
`process.nextTick` 的回调递归调用会**饿死**事件循环，导致 I/O 无法进行，慎用。
:::

## 二、libuv 线程池

「Node 是单线程」指的是 **JS 执行线程**单线程；底层 libuv 维护一个线程池处理无法异步的耗时操作。

- 默认 **4 个线程**，通过 `UV_THREADPOOL_SIZE` 调整（最大 1024）：

```js
process.env.UV_THREADPOOL_SIZE = 16 // 必须在加载任何使用线程池的模块前设置
```

- **走线程池**的操作：`fs`（部分）、`crypto.pbkdf2` / `crypto.scrypt`、`zlib`、`dns.lookup`。
- **不走线程池**（真异步，基于 epoll/kqueue/IOCP）：网络 I/O。

::: warning 陷阱
大量并发 `crypto.pbkdf2` 会被 4 线程卡住，提升 `UV_THREADPOOL_SIZE` 才能并行更多。
:::

## 三、Stream 流

流用于处理大数据或实时数据，避免一次性占用过多内存。

### 1. 四种类型

| 类型 | 说明 | 例子 |
|------|------|------|
| `Readable` | 可读流 | `fs.createReadStream` |
| `Writable` | 可写流 | `fs.createWriteStream` |
| `Duplex` | 双工（读写独立） | TCP socket |
| `Transform` | 转换（读入→变换→写出） | `zlib.createGzip` |

### 2. 背压（Backpressure）

写入慢于读取时数据堆积，需要暂停读取。`pipe` 会自动处理背压；手动处理需监听 `drain`：

```js
const readable = getReadableStream()
const writable = getWritableStream()

readable.on('data', (chunk) => {
  const ok = writable.write(chunk)
  if (!ok) {
    readable.pause()
    writable.once('drain', () => readable.resume())
  }
})

readable.on('end', () => writable.end())
```

### 3. highWaterMark

内部缓冲区水位上限，**字节流**默认 64KB，**对象流**默认 16 个。超过后 `write` 返回 `false` 触发背压。

### 4. 自定义流

继承 `Readable` 并实现 `_read(size)`：

```js
const { Readable } = require('stream')

class Counter extends Readable {
  constructor(opt) {
    super(opt)
    this._max = 5
    this._current = 0
  }
  _read() {
    this._current += 1
    if (this._current > this._max) this.push(null)
    else this.push(Buffer.from(`${this._current}\n`))
  }
}

new Counter().pipe(process.stdout)
```

## 四、Buffer

`Buffer` 是 Node 在 V8 堆**外**分配的二进制数据，不受 V8 堆大小限制，用于处理二进制流。

- `Buffer.alloc(size)`：分配并**清零**，安全。
- `Buffer.allocUnsafe(size)`：分配但**不清零**，可能残留旧数据，性能更好，安全敏感场景禁用。
- `Buffer.from(array | string)`：从数组或字符串创建。

```js
const buf = Buffer.alloc(8)        // <Buffer 00 00 00 00 00 00 00 00>
const unsafe = Buffer.allocUnsafe(8) // 内容不可预测
```

## 五、内存管理与 V8 垃圾回收

### 1. 分代回收

| 代 | 算法 | 特点 |
|----|------|------|
| 新生代（young） | Scavenge（Cheney） | From/To 两区复制存活对象，存活两次晋升老生代 |
| 老生代（old） | Mark-Sweep / Mark-Compact | 标记清除 / 标记整理，处理大对象与长期存活对象 |

### 2. 内存限额与调整

- 64 位机器老生代默认约 **1.4 GB**。
- `node --max-old-space-size=4096 app.js` 调整老生代上限（MB）。

### 3. 排查工具

```js
const v8 = require('v8')

// 进程内存占用
console.log(process.memoryUsage())
// { rss, heapTotal, heapUsed, external, arrayBuffers }

// V8 堆统计
console.log(v8.getHeapStatistics())
```

- `heapdump` / `v8-profiler-next` 生成堆快照，用 Chrome DevTools 分析。

### 4. 常见内存泄漏

- 全局变量 / 闭包长期持有大对象。
- 未清理的 `setInterval`、事件监听器（`EventEmitter` 默认上限 10）。
- 缓存无上限增长（用 LRU 限制大小）。

## 六、Cluster 与多进程

### 1. child_process

| 方法 | 特点 |
|------|------|
| `spawn` | 流式返回，适合大数据量 |
| `exec` | 缓冲输出，有 `maxBuffer` 限制，回调一次性返回 |
| `execFile` | 直接执行文件，不经 shell |
| `fork` | `spawn` 特例，**建立 IPC 通道**，用于父子通信 |

### 2. cluster

主进程 fork 多个 worker 共享同一端口（非 Windows 默认 round-robin 负载均衡）：

```js
const cluster = require('cluster')
const http = require('http')
const numCPUs = require('os').cpus().length

if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) cluster.fork()
  cluster.on('exit', (worker, code) => {
    console.log(`worker ${worker.process.pid} exited`)
    cluster.fork() // 自动重启
  })
} else {
  http.createServer((req, res) => res.end(`worker ${process.pid}`)).listen(8000)
}
```

### 3. IPC 通信

`fork` / `cluster` 会建立 IPC 通道：

```js
// 主进程
worker.send({ msg: 'hello' })
worker.on('message', (msg) => console.log('from worker:', msg))

// 子进程
process.on('message', (msg) => {
  process.send({ msg: 'got it' })
})
```

### 4. 守护进程

PM2 等工具基于 `cluster` + 进程守护实现：自动重启、零停机 reload、日志管理。

## 七、模块系统

### 1. CommonJS `require` 原理

一次 `require` 经历四步：

1. **路径解析**（`Module._resolveFilename`）：核心模块 → `node_modules` 逐级向上查找 → 补扩展名 → 目录则读 `package.json` 的 `main`。
2. **缓存检查**（`Module._cache`）：命中直接返回 `module.exports`。
3. **编译执行**：将文件内容包裹进函数：
   ```js
   ;(function (exports, require, module, __filename, __dirname) {
     /* 模块代码 */
   })
   ```
4. **缓存写入**：缓存到 `Module._cache`，下次直接复用。

::: tip 循环依赖
CommonJS 遇到循环引用时返回**当时已执行部分**的 `exports`（可能不完整），不会死循环。
:::

### 2. CJS vs ESM

| 维度 | CommonJS | ESM |
|------|----------|-----|
| 加载 | 同步、运行时 | 异步、静态分析（可 tree-shaking） |
| 导出 | `module.exports` | `export` / `export default` |
| 顶层 `this` | `module.exports` | `undefined` |
| 动态 | `require` 可任意位置 | 静态 `import`；动态用 `import()` |

- `package.json` 设 `"type": "module"` 开启 ESM；`.cjs` / `.mjs` 扩展名可覆盖。
- ESM 导入 CJS：默认导出 = `module.exports` 整体。
- CJS 导入 ESM：必须用 `await import()`。

## 八、错误处理与进程退出

未捕获的错误会导致进程退出，生产环境必须兜底：

```js
process.on('uncaughtException', (err) => {
  console.error('uncaughtException:', err)
  // 记录日志后退出，交给守护进程重启
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  console.error('unhandledRejection:', reason)
  process.exit(1)
})
```

- `uncaughtException`：未捕获的**同步**异常（或 async 函数内未 catch 的抛出若未走 promise）。监听后进程不再自动退出，但状态已不可靠，建议退出。
- `unhandledRejection`：未处理的 Promise rejection。**Node 15+ 默认终止进程**。
- 退出码：`0` 正常，`1` 未捕获异常。

## 九、性能优化

### 1. V8 优化要点

- **隐藏类（hidden classes）**：保持对象「形状」稳定，初始化时把所有属性一次性赋值，避免动态增删、避免用不同顺序初始化同类对象。
- **内联缓存**：函数参数类型稳定时 V8 会内联优化；类型多态（megamorphic）会回退。
- 热路径避免 `try/catch`（旧 V8 会阻碍优化，新版已改善但仍建议分离）。

### 2. 避免阻塞事件循环

- 禁止在请求路径用同步 API：`fs.readFileSync`、`crypto.pbkdf2Sync` 等。
- CPU 密集任务拆分到子进程或用 Worker Threads。

### 3. 分析工具

| 工具 | 用途 |
|------|------|
| `perf_hooks` | 内置性能测量 |
| `node --prof` | V8 采样分析 |
| `clinic.js` / `0x` | 火焰图 |
| `--inspect` | Chrome DevTools 调试与 CPU/堆 profile |

```js
const { performance, PerformanceObserver } = require('perf_hooks')

const obs = new PerformanceObserver((list) => {
  console.log(list.getEntries()[0].duration)
})
obs.observe({ entryTypes: ['measure'], buffered: false })

performance.mark('start')
// ... 待测量代码
performance.mark('end')
performance.measure('耗时', 'start', 'end')
```

---

## 小结

| 主题 | 核心要点 |
|------|----------|
| 事件循环 | 6 阶段 + 微任务；`nextTick` > `Promise` > `setImmediate`/`setTimeout`（I/O 回调中 `immediate` 先） |
| 线程池 | 默认 4，`UV_THREADPOOL_SIZE` 可调，fs/crypto/zlib/dns.lookup 走线程池 |
| Stream | 四种流 + 背压 + `highWaterMark` |
| Buffer | 堆外内存，`alloc` 安全 / `allocUnsafe` 高危 |
| GC | 新生代 Scavenge / 老生代 Mark-Sweep；`--max-old-space-size` |
| Cluster | `child_process` + `cluster` 共享端口 + IPC |
| 模块 | `require` 四步 + 缓存；CJS vs ESM |
| 错误 | `uncaughtException` / `unhandledRejection` 兜底退出 |
| 性能 | 隐藏类、不阻塞事件循环、`--prof` |
