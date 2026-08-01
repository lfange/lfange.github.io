---
title: Electron 性能瓶颈分析与解决方案
icon: speed
category:
  - 前端
  - 桌面开发
---

# Electron 性能瓶颈分析与解决方案

> 面向运行时性能：启动慢、内存高、CPU 飙升、渲染卡顿、IPC 开销的系统化定位与解决思路。
> 打包体积/打包速度请见 [Electron 打包优化指南](./electron-optimization-guide.md)，架构与进程模型请见 [Electron 深度分析](./electron-deep-analysis.md)。

---

## 目录

1. [为什么 Electron 容易出性能问题](#1-为什么-electron-容易出性能问题)
2. [性能瓶颈全景图](#2-性能瓶颈全景图)
3. [启动性能瓶颈](#3-启动性能瓶颈)
4. [内存占用瓶颈](#4-内存占用瓶颈)
5. [CPU 瓶颈与主进程阻塞](#5-cpu-瓶颈与主进程阻塞)
6. [渲染与交互卡顿](#6-渲染与交互卡顿)
7. [IPC 通信开销](#7-ipc-通信开销)
8. [GPU 与图形性能](#8-gpu-与图形性能)
9. [网络与资源加载](#9-网络与资源加载)
10. [测量与诊断工具清单](#10-测量与诊断工具清单)
11. [优化检查清单](#11-优化检查清单)

---

## 1. 为什么 Electron 容易出性能问题

Electron = Chromium + Node.js + 原生 API，这套组合带来三个结构性成本：

1. **多进程内存开销**：每个 `BrowserWindow`/`<webview>` 默认是独立进程，各自带一份 Chromium 渲染引擎、V8 堆、Node 运行时。开 5 个窗口 ≠ 5 倍内存，而是基线 + N × 单进程开销。
2. **JS 单线程模型**：主进程和每个渲染进程的 JS 都跑在单线程上。一个同步的文件读写、一次 CPU 密集计算、一段长循环，会阻塞整个进程的事件循环，表现为界面冻结、IPC 无响应。
3. **跨进程通信成本**：主进程 ↔ 渲染进程的数据传递需要序列化/反序列化（结构化克隆），大对象、高频调用会累积成可观的开销。

理解这三点，后续每个瓶颈都能对号入座。

---

## 2. 性能瓶颈全景图

```
                        ┌─────────────────────────────────────┐
                        │          Electron 应用性能           │
                        └───────────────┬─────────────────────┘
                                        │
        ┌───────────────┬───────────────┼───────────────┬───────────────┐
        ▼               ▼               ▼               ▼               ▼
   ┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
   │ 启动慢   │    │ 内存占用高│    │ CPU 飙升  │    │ 渲染卡顿  │    │ IPC 开销 │
   └────┬────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘    └────┬─────┘
        │              │               │               │               │
   主进程阻塞      多进程冗余       主进程长任务      重排/重绘        同步 IPC
   preload 重      泄漏(闭包/监听)  渲染进程长任务    合成层缺失       频繁序列化
   首屏资源多      webview 滥用     定时器/轮询       大列表未虚拟化   大对象传输
   session 冷      未 destroy      GC 压力           动画走 CPU       通道未复用
```

定位问题的总原则：**先测量，再优化**。凭直觉优化往往改错地方。

---

## 3. 启动性能瓶颈

### 3.1 启动阶段拆解

Electron 应用的"冷启动"由若干阶段串成，每个阶段都可能是瓶颈：

```
app ready ──> 主进程初始化 ──> createBrowserWindow ──> preload 执行 ──> 首屏 HTML/CSS/JS ──> 首屏可交互
   ▲              ▲                    ▲                    ▲                  ▲                  ▲
   │              │                    │                    │                  │                  │
 原生模块加载  依赖 require       窗口创建/             业务代码          资源加载/         框架 hydration
 (native)      顶级副作用        session 初始化         bundle 执行         主线程任务
```

### 3.2 测量：知道慢在哪一段

#### 主进程侧

```javascript
// main.js
const { app } = require('electron')

const t0 = Date.now()
console.log('[perf] entry:', 0)

app.whenReady().then(() => {
  console.log('[perf] app.ready:', Date.now() - t0, 'ms')
  const win = new BrowserWindow({ /* ... */ })
  win.webContents.on('did-finish-load', () => {
    console.log('[perf] did-finish-load:', Date.now() - t0, 'ms')
  })
  win.webContents.on('did-start-loading', () => {
    console.log('[perf] did-start-loading:', Date.now() - t0, 'ms')
  })
})
```

#### 渲染进程侧（Navigation Timing）

```javascript
// renderer
window.addEventListener('load', () => {
  const t = performance.getEntriesByType('navigation')[0]
  console.table({
    domContentLoaded: t.domContentLoadedEventEnd,
    loadEventEnd: t.loadEventEnd,
    domInteractive: t.domInteractive,
  })
  // 首屏可交互的关键指标
  console.log('[perf] TTI 附近:', performance.now())
})
```

#### 用 contentTracing 抓底层 trace

```javascript
const { contentTracing } = require('electron')

app.whenReady().then(async () => {
  await contentTracing.startRecording({
    categories: ['blink', 'v8', 'toplevel'],
    options: 'record-as-much-as-possible',
  })
  setTimeout(async () => {
    const path = await contentTracing.stopRecording()
    console.log('trace saved to', path) // 用 chrome://tracing 打开
  }, 10000)
})
```

### 3.3 常见瓶颈与解决

#### 瓶颈 1：主进程顶层 require 了重型模块

```javascript
// ❌ 不好：启动即加载所有依赖，哪怕这次用不到
const heavyLib = require('heavy-lib')        // 50ms+
const dbClient = require('./db-client')      // 连接数据库 200ms+
const autoUpdater = require('electron-updater')

app.whenReady().then(() => { /* ... */ })
```

```javascript
// ✅ 好：延迟到真正需要时再加载
app.whenReady().then(async () => {
  // 首屏只加载首屏需要的
  createWindow()

  // 后台静默预热，不阻塞首屏
  setImmediate(async () => {
    const { initDB } = await import('./db-client')
    await initDB()
  })
})
```

#### 瓶颈 2：preload 脚本太重

preload 在页面加载前同步执行，越重首屏越慢。

```javascript
// ❌ 不好：preload 里 require 了一堆东西
const { contextBridge } = require('electron')
const bigSdk = require('big-sdk')   // 拖慢所有页面
contextBridge.exposeInMainWorld('api', { /* ... */ })
```

```javascript
// ✅ 好：preload 只做桥接，重逻辑放主进程或动态加载
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  doHeavyWork: (data) => ipcRenderer.invoke('heavy-work', data),
  // 主进程里再动态 import bigSdk
})
```

#### 瓶颈 3：窗口创建时白屏

`backgroundThrottling`、`show: false` + `ready-to-show` 是经典手段：

```javascript
const win = new BrowserWindow({
  show: false,                    // 先不显示
  backgroundColor: '#fff',        // 避免白闪
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    backgroundThrottling: true,   // 后台窗口节流
    spellcheck: false,            // 不需要拼写检查就关掉
  },
})

win.once('ready-to-show', () => win.show())  // 首帧就绪再显示
```

#### 瓶颈 4：首屏 JS bundle 过大

详见 [Electron 打包优化指南](./electron-optimization-guide.md) 的 Code Splitting 一节。核心是：

- 路由级懒加载（`import()`）
- 大依赖动态加载（如 PDF/Excel 解析库按需 `await import()`）
- 主进程/渲染进程 bundle 分离，避免互相拖累

### 3.4 进阶：预拉取与 session 预热

```javascript
// 应用启动后空闲时，预热一个隐藏窗口加载常用页面
app.whenReady().then(() => {
  createMainWindow()
  setImmediate(() => {
    const warmup = new BrowserWindow({ show: false })
    warmup.loadFile('next-page.html')  // 提前编译/缓存
    warmup.webContents.on('did-finish-load', () => {
      warmup.destroy()  // 用完即销毁，保留缓存效果
    })
  })
})
```

---

## 4. 内存占用瓶颈

### 4.1 多进程内存模型

```
┌──────────────────────────────────────────────────────┐
│                  Main Process                         │
│  (窗口管理、原生 API、Node 主逻辑)                     │
└──────────────────────────────────────────────────────┘
        │           │           │           │
        ▼           ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
   │Renderer│  │Renderer│  │Renderer│  │  GPU   │
   │  进程1  │  │  进程2  │  │  进程3  │  │  进程  │
   └────────┘  └────────┘  └────────┘  └────────┘
```

每个 Renderer 进程独立持有：V8 堆、Blink DOM 树、JS 引擎实例、可能还有一份 Node 运行时。**窗口越多，内存线性增长是常态**。

### 4.2 测量内存

#### Electron 内置：`app.getAppMetrics()`

```javascript
const metrics = app.getAppMetrics()
metrics.forEach((m) => {
  console.log(m.pid, m.type, {
    rss: Math.round(m.memory.workingSetSize / 1024) + 'MB', // 工作集
    // 私有内存、共享内存等
  })
})
```

可以周期性采集，画成趋势图找泄漏。

#### 渲染进程：Chrome DevTools Memory 面板

- Heap snapshot：对比两次快照的 delta，找只增不减的对象
- Allocation timeline：录制一段时间，看哪些对象持续分配不释放

#### 抓主进程堆快照

```javascript
// 主进程里
const v8 = require('v8')
fs.writeFileSync('main.heapsnapshot', v8.writeHeapSnapshot())
// 用 Chrome DevTools 的 Memory 面板加载分析
```

### 4.3 常见内存瓶颈与解决

#### 瓶颈 1：窗口/页面不释放

```javascript
// ❌ 不好：关了窗口但引用还在，GC 回收不掉
let cachedWin = new BrowserWindow({ /* */ })
cachedWin.on('closed', () => {
  // 忘了置空，cachedWin 仍持有引用
})
```

```javascript
// ✅ 好
let cachedWin = null
function openWin() {
  cachedWin = new BrowserWindow({ /* */ })
  cachedWin.on('closed', () => {
    cachedWin = null   // 释放引用
  })
}
```

#### 瓶颈 2：渲染进程里的监听器/定时器泄漏

```javascript
// ❌ 不好：每次进页面都注册，离开不清理
function setup() {
  ipcRenderer.on('tick', updateChart)
  setInterval(refresh, 1000)
}
```

```javascript
// ✅ 好：页面卸载时清理
let timer = null
function setup() {
  ipcRenderer.on('tick', updateChart)
  timer = setInterval(refresh, 1000)
}
function teardown() {
  ipcRenderer.removeListener('tick', updateChart)
  clearInterval(timer)
  timer = null
}
// 在路由离开 / beforeunload 时调用 teardown()
```

#### 瓶颈 3：webview / BrowserView 滥用

| 方案 | 内存 | 隔离 | 备注 |
|------|------|------|------|
| `<webview>` tag | 高 | 强 | 官方不推荐，进程开销大、维护停滞 |
| `BrowserView`（旧） | 中 | 强 | 已被 `WebContentsView` 取代 |
| `WebContentsView`（新） | 中 | 强 | Electron 30+ 推荐 |
| iframe | 低 | 弱 | 同源限制，跨域受限 |

优先用 `WebContentsView` 替代 `<webview>`，并在不用时 `webContents.destroy()`。

#### 瓶颈 4：每个窗口各开一份 session

```javascript
// ❌ 每个窗口独立 session = 各自一份缓存/cookie 存储
new BrowserWindow({ webPreferences: { session: session.fromPartition('persist:win1') } })
new BrowserWindow({ webPreferences: { session: session.fromPartition('persist:win2') } })
```

```javascript
// ✅ 共享默认 session，复用缓存
new BrowserWindow({ /* 默认 session */ })
```

只有需要强隔离（如登录不同账号）才用独立 partition。

#### 瓶颈 5：nodeIntegration / contextIsolation 配置不当

```javascript
// ❌ 旧式配置，渲染进程带完整 Node，内存高且不安全
webPreferences: { nodeIntegration: true, contextIsolation: false }
```

```javascript
// ✅ 推荐：隔离 + preload 桥接
webPreferences: {
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true,            // 沙箱进一步降低开销与风险
  preload: './preload.js',
}
```

---

## 5. CPU 瓶颈与主进程阻塞

### 5.1 主进程是单线程的，这点最致命

主进程负责所有窗口管理、原生 API 调用、IPC 分发。**主进程一旦被阻塞，所有窗口的 IPC 都会卡住**，表现为整个应用"假死"。

```javascript
// ❌ 主进程里做 CPU 密集 / 同步 IO
ipcMain.handle('process-data', (e, data) => {
  const result = heavyCompute(data)   // 阻塞主进程 2s
  syncWriteFileSync(result)           // 同步写盘再阻塞
  return result
})
```

### 5.2 解决：把重活移出主进程

#### 方案 A：Worker Threads（适合纯计算）

```javascript
// main.js
const { Worker } = require('worker_threads')

ipcMain.handle('process-data', (e, data) => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, 'worker.js'), {
      workerData: data,
    })
    worker.on('message', resolve)
    worker.on('error', reject)
  })
})
```

```javascript
// worker.js
const { parentPort, workerData } = require('worker_threads')
const result = heavyCompute(workerData)  // 不阻塞主进程
parentPort.postMessage(result)
```

#### 方案 B：UtilityProcess（Electron 推荐，适合需要 Electron API 的子进程）

```javascript
const { utilityProcess } = require('electron')

const child = utilityProcess.fork(path.join(__dirname, 'task.js'))
child.postMessage({ payload: data })
child.on('message', (result) => {
  // 拿到结果
})
```

`UtilityProcess` 比 `Worker` 更适合 Electron 生态：能用部分 Node API、生命周期与 app 绑定、通信走 MessageChannel。

#### 方案 C：子进程（适合调外部程序或隔离任务）

```javascript
const { fork } = require('child_process')
const child = fork('./heavy-task.js')
child.send(data)
child.on('message', (result) => { /* */ })
```

### 5.3 渲染进程的长任务

渲染进程的 JS 同样单线程，长任务会掉帧。

```javascript
// ❌ 一次性处理 10w 条，主线程卡死
const all = data.map(transform).filter(pred)
render(all)
```

```javascript
// ✅ 分片处理，让出主线程
function chunked(data, fn, onChunk) {
  let i = 0
  function step() {
    const end = Math.min(i + 1000, data.length)
    while (i < end) fn(data[i++])
    onChunk(i / data.length)
    if (i < data.length) requestIdleCallback(step) // 或 setTimeout(step, 0)
  }
  step()
}
```

> React 的 `startTransition`、Vue 的 shallowRef + 虚拟列表都是同一思路：把可中断的计算与不可中断的渲染分开。

### 5.4 测量 CPU

- **Chrome DevTools Performance 面板**：录制渲染进程，看 Long Task（>50ms 黄色条）
- **`app.getAppMetrics()` 周期采样**：看哪个进程 CPU 百分比异常
- **`contentTracing`**：抓底层 `toplevel`/`v8` 类别，看主线程任务分布

---

## 6. 渲染与交互卡顿

渲染层的问题本质和 Web 一致（Electron 渲染进程就是一个 Chromium），但桌面端对流畅度期望更高（60fps 甚至 120fps）。

### 6.1 常见卡顿源

| 卡顿源 | 表现 | 定位 |
|--------|------|------|
| 频繁重排重绘 | 滚动/拖拽时掉帧 | DevTools → Rendering → Paint flashing |
| 大列表全量渲染 | 滚动卡、内存涨 | 看节点数 / Elements 面板 |
| 动画走主线程 | 动画抖动 | Performance 看是否触发 layout/paint |
| 同步样式读取 | 强制同步布局 | Performance 的紫色 Layout 块 |
| 图层过多 | 合成开销大 | Layers 面板看图层数量 |

### 6.2 解决方案

#### 虚拟化长列表

```javascript
// 不要一次性渲染 10000 行
// 用 react-window / vue-virtual-scroller / @tanstack/virtual 只渲染可视区
import { FixedSizeList } from 'react-window'

<FixedSizeList height={600} itemCount={10000} itemSize={35} width={400}>
  {({ index, style }) => <div style={style}>{items[index]}</div>}
</FixedSizeList>
```

#### 动画用合成属性

```css
/* ❌ 触发 layout */
.move { left: 100px; top: 100px; transition: all .3s; }

/* ✅ 只触发 composite，走 GPU */
.move {
  transform: translate(100px, 100px);
  will-change: transform;  /* 提示浏览器提升为合成层 */
}
```

`will-change` 不要滥用——常驻会多吃内存，用在确实要动画的元素上即可。

#### 避免强制同步布局

```javascript
// ❌ 读写在同一帧交替，反复触发 reflow
for (const el of list) {
  el.style.height = el.offsetHeight + 10 + 'px'
}
```

```javascript
// ✅ 先读后写，批量处理
const heights = list.map((el) => el.offsetHeight + 10)
list.forEach((el, i) => (el.style.height = heights[i] + 'px'))
```

### 6.3 DevTools Rendering 面板

打开 `View → Toggle Developer Tools`，More tools → Rendering，勾选：

- **Paint flashing**：高亮重绘区域
- **Layout Shift Regions**：高亮布局偏移
- **Frame Rendering Stats**：实时 FPS

---

## 7. IPC 通信开销

IPC 是 Electron 性能的高频陷阱，因为序列化成本和阻塞风险容易被忽略。

### 7.1 三类 IPC 调用

| API | 是否阻塞 | 适用场景 |
|-----|---------|---------|
| `ipcRenderer.send` / `ipcMain.on` | 异步 | 事件通知 |
| `ipcRenderer.invoke` / `ipcMain.handle` | 异步（Promise） | 请求-响应 |
| `ipcRenderer.sendSync` / `ipcMain.on` (同步) | **同步阻塞** | 尽量别用 |

```javascript
// ❌ 同步 IPC：渲染进程阻塞，主进程也阻塞，最差
const result = ipcRenderer.sendSync('get-config')
```

```javascript
// ✅ 异步 invoke
const result = await ipcRenderer.invoke('get-config')
```

### 7.2 序列化开销

IPC 传参使用结构化克隆（Structured Clone），能传 ArrayBuffer、Map、Set 等，但：

- **不能直接传函数、DOM 节点、Proxy**
- **大对象每次都全量拷贝**

```javascript
// ❌ 每帧把整个画布像素数据 IPC 传一遍
ipcRenderer.send('frame', hugePixelArray)  // 几 MB × 60fps = 灾难
```

#### 解决 1：用 MessagePort 建立专用通道

```javascript
// 主进程
const { port1, port2 } = new MessageChannelMain()
win.webContents.postMessage('port', null, [port1])
// 之后 port2 <-> port1 直连，少一层中转
```

#### 解决 2：用 SharedArrayBuffer 共享内存（零拷贝）

```javascript
// 主进程和渲染进程共享同一段内存，无需序列化
const sab = new SharedArrayBuffer(1024 * 1024)
const view = new Uint8Array(sab)
// 通过 IPC 把 sab 传过去（只传句柄，不拷贝内容）
```

> 注意：SharedArrayBuffer 需要安全的 COOP/COEP 头，Electron 里要相应配置。

#### 解决 3：批量 + 节流

```javascript
// ❌ 高频事件逐条发
input.on('change', (v) => ipcRenderer.send('change', v))
```

```javascript
// ✅ 批量打包 + 节流
let pending = []
let scheduled = false
input.on('change', (v) => {
  pending.push(v)
  if (!scheduled) {
    scheduled = true
    requestAnimationFrame(() => {
      ipcRenderer.send('batch-change', pending)
      pending = []
      scheduled = false
    })
  }
})
```

### 7.3 大数据走文件而非 IPC

需要传几十 MB 的数据（如导出视频、大日志），优先写临时文件，IPC 只传路径：

```javascript
// 主进程写文件，渲染进程读
ipcMain.handle('export', async (e, data) => {
  const tmp = path.join(app.getPath('temp'), `export-${Date.now()}.bin`)
  await fs.promises.writeFile(tmp, data)
  return tmp  // 只回传路径
})
```

---

## 8. GPU 与图形性能

### 8.1 硬件加速

Electron 默认开启 GPU 硬件加速（Chromium 合成）。**绝大多数情况应保持开启**，关闭会导致动画/视频/Canvas 大幅退化为 CPU 软件渲染。

```javascript
// 仅在确有需要时关闭（如某些虚拟机/远程桌面 GPU 驱动有 bug）
app.disableHardwareAcceleration()
```

判断是否该关：先看 `chrome://gpu`（在渲染进程里打开）是否有"Hardware accelerated"为 false 的项，结合实际崩溃日志决定，不要无脑关。

### 8.2 GPU 进程崩溃

GPU 进程独立，崩溃后 Chromium 会自动重启它，但频繁崩溃会拖累体验。常见原因：

- 显卡驱动过旧 / 虚拟机无 GPU
- 使用了不兼容的 WebGL 扩展
- 大量 Canvas/WebGL 上下文未释放（每个 context 占显存）

```javascript
// 监控 GPU 崩溃
app.on('gpu-process-crashed', (event) => {
  log.error('GPU crashed', event)
})
```

### 8.3 显存泄漏

```javascript
// ❌ 每次切页面新建 WebGL context 不释放
function initScene() {
  const gl = canvas.getContext('webgl')
  // 离开页面没释放
}
```

```javascript
// ✅ 离开时主动释放
function destroyScene(gl) {
  const ext = gl.getExtension('WEBGL_lose_context')
  ext?.loseContext()
}
```

---

## 9. 网络与资源加载

桌面应用的网络优化和 Web 类似，但有几个 Electron 特有点：

### 9.1 复用 session 缓存

```javascript
// 默认 session 自带磁盘缓存（HTTP cache、cookie）
// 多窗口共享同一 session 即可复用，避免重复下载
const win1 = new BrowserWindow({ /* 默认 session */ })
const win2 = new BrowserWindow({ /* 默认 session */ })
```

### 9.2 本地资源优先 loadFile

```javascript
// ✅ 本地页面用 loadFile，走文件系统，无网络开销
win.loadFile(path.join(__dirname, 'dist/index.html'))

// 远程页面才用 loadURL
win.loadURL('https://...')
```

### 9.3 预加载与 Service Worker

```javascript
// 在隐藏窗口里预加载下一页的资源（预连接、预取）
const warmup = new BrowserWindow({ show: false })
warmup.loadURL('https://api.example.com/warmup') // 触发 DNS/TLS 预热
```

渲染进程里也可注册 Service Worker 做离线缓存（Electron 支持），适合需要离线运行的场景。

### 9.4 protocol 注册自定义协议

把本地资源映射成自定义协议，可避免 file:// 的限制并启用更灵活的缓存策略：

```javascript
const { protocol } = require('electron')

protocol.handle('app', async (request) => {
  const filePath = path.join(__dirname, new URL(request.url).pathname)
  return new Response(await fs.promises.readFile(filePath))
})
// 之后 <img src="app://assets/logo.png">
```

---

## 10. 测量与诊断工具清单

| 工具 | 用途 | 范围 |
|------|------|------|
| `app.getAppMetrics()` | 进程级 CPU/内存 | 全应用 |
| `contentTracing` | Chromium 底层 trace | 主/渲染进程 |
| Chrome DevTools Performance | JS 火焰图、Long Task | 单渲染进程 |
| Chrome DevTools Memory | 堆快照、分配时间线 | 单渲染进程 |
| `v8.writeHeapSnapshot()` | 主进程堆快照 | 主进程 |
| Electron Process Explorer | 可视化进程树与资源 | 全应用（需 `--inspect`） |
| `chrome://gpu` | GPU 加速状态 | 渲染进程 |
| `chrome://tracing` | 打开 contentTracing 产物 | 全应用 |
| Lighthouse | 渲染进程 Web 指标 | 单页面 |

> 启动主进程调试：`electron --inspect=5858 .`，然后用 Chrome `chrome://inspect` 连接，可对主进程下断点、看 profile。

---

## 11. 优化检查清单

### 启动

- [ ] 主进程顶层只 require 启动必需的模块，重型依赖动态 `import()`
- [ ] preload 只做桥接，不加载重型 SDK
- [ ] `BrowserWindow` 用 `show: false` + `ready-to-show`
- [ ] 测量了 `app.ready` → `did-finish-load` 各阶段耗时
- [ ] 首屏 JS 做了 Code Splitting

### 内存

- [ ] 窗口关闭后置空引用，监听器/定时器清理
- [ ] 用 `WebContentsView` 替代 `<webview>`
- [ ] 不需要的 `webContents` 主动 `destroy()`
- [ ] 共享默认 session，仅在需要隔离时用 partition
- [ ] 开启 `contextIsolation` + `sandbox`
- [ ] 周期性采集 `getAppMetrics` 监控泄漏

### CPU

- [ ] 主进程无同步 IO、无 CPU 密集计算
- [ ] 重计算移到 `Worker` / `UtilityProcess` / 子进程
- [ ] 渲染进程长任务分片（`requestIdleCallback`）
- [ ] 无 `sendSync` 同步 IPC

### 渲染

- [ ] 长列表虚拟化
- [ ] 动画用 `transform`/`opacity` + `will-change`
- [ ] 避免读写交替的强制同步布局
- [ ] DevTools 无 >50ms 的 Long Task

### IPC

- [ ] 全部用 `invoke`/`handle` 异步
- [ ] 高频事件批量 + 节流
- [ ] 大数据走文件或 `SharedArrayBuffer`
- [ ] 频繁通信用 `MessagePort` 专用通道

### GPU

- [ ] 保持硬件加速开启，仅在驱动问题时关闭
- [ ] 监控 `gpu-process-crashed`
- [ ] WebGL/Canvas context 用完释放

---

## 总结

Electron 性能优化的底层逻辑只有三条：

1. **少占内存**：减少进程数、共享 session、及时释放、用更隔离的沙箱配置。
2. **不阻塞主线程**：主进程和渲染进程都是单线程，重活一律移出去（Worker / UtilityProcess / 子进程 / 分片）。
3. **少跨进程**：IPC 异步化、批量化、零拷贝化，大数据走文件而非通道。

而贯穿始终的方法论是：**先测量再优化**。用 `getAppMetrics`、`contentTracing`、DevTools Performance/Memory 把瓶颈定位到具体进程、具体函数，再对症下药——而不是凭感觉改代码。

> 相关文档：[Electron 打包优化指南](./electron-optimization-guide.md)（打包体积与速度）、[Electron 深度分析](./electron-deep-analysis.md)（架构原理与进程模型）。
