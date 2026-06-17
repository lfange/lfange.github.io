# 前端性能分析全面总结

> 本文系统梳理前端性能分析的核心指标、工具链、优化策略及监控体系，覆盖从理论到实践的完整知识图谱。

---

## 目录

- [一、前端性能核心指标体系](#一前端性能核心指标体系)
  - [1.1 Core Web Vitals（核心 Web 指标）](#11-core-web-vitals核心-web-指标)
  - [1.2 其他关键性能指标](#12-其他关键性能指标)
  - [1.3 自定义业务指标](#13-自定义业务指标)
- [二、性能分析工具详解](#二性能分析工具详解)
  - [2.1 Chrome DevTools](#21-chrome-devtools)
  - [2.2 Lighthouse](#22-lighthouse)
  - [2.3 WebPageTest](#23-webpagetest)
  - [2.4 Bundle 分析工具](#24-bundle-分析工具)
  - [2.5 Performance API](#25-performance-api)
  - [2.6 真实用户监控（RUM）](#26-真实用户监控rum)
- [三、首屏性能优化详解](#三首屏性能优化详解)
  - [3.1 网络层面优化](#31-网络层面优化)
  - [3.2 资源加载优化](#32-资源加载优化)
  - [3.3 渲染层面优化](#33-渲染层面优化)
  - [3.4 缓存策略](#34-缓存策略)
  - [3.5 图片优化](#35-图片优化)
- [四、构建层面优化](#四构建层面优化)
  - [4.1 Webpack 优化](#41-webpack-优化)
  - [4.2 Vite 优化](#42-vite-优化)
  - [4.3 代码分割策略](#43-代码分割策略)
  - [4.4 Tree Shaking 原理与实践](#44-tree-shaking-原理与实践)
- [五、运行时性能优化](#五运行时性能优化)
  - [5.1 长任务拆分与调度](#51-长任务拆分与调度)
  - [5.2 虚拟列表](#52-虚拟列表)
  - [5.3 重绘与回流优化](#53-重绘与回流优化)
  - [5.4 内存泄漏排查](#54-内存泄漏排查)
- [六、性能监控体系](#六性能监控体系)
  - [6.1 性能数据采集](#61-性能数据采集)
  - [6.2 监控平台设计](#62-监控平台设计)
  - [6.3 性能预算](#63-性能预算)
  - [6.4 CI/CD 性能回归检测](#64-cicd-性能回归检测)
- [七、相关核心知识](#七相关核心知识)
  - [7.1 浏览器渲染原理](#71-浏览器渲染原理)
  - [7.2 网络协议基础](#72-网络协议基础)
  - [7.3 构建工具原理](#73-构建工具原理)

---

## 一、前端性能核心指标体系

### 1.1 Core Web Vitals（核心 Web 指标）

Google 提出的 Core Web Vitals 是衡量 Web 用户体验的三大核心指标，直接影响 SEO 排名。

#### 1.1.1 LCP（Largest Contentful Paint，最大内容绘制）

**定义：** 从页面开始加载到视口内最大的图片、视频或文本块被渲染的时间。

**阈值：** | 评级 | 时间 | |------|------| | 🟢 良好 | ≤ 2.5s | | 🟡 需要改进 | 2.5s ~ 4.0s | | 🔴 差 | > 4.0s |

**LCP 元素类型：**

- `<img>` 元素
- `<image>` 元素内的 `<svg>`
- `<video>` 的封面图
- 通过 `url()` 加载背景图的元素
- 包含文本节点的块级元素

**测量方式：**

```javascript
// 使用 PerformanceObserver 监听 LCP
new PerformanceObserver((entryList) => {
  const entries = entryList.getEntries()
  const lastEntry = entries[entries.length - 1] // LCP 会多次触发，取最后一次
  console.log('LCP:', lastEntry.startTime, 'ms')
  console.log('LCP 元素:', lastEntry.element)
}).observe({ type: 'largest-contentful-paint', buffered: true })

// 或使用 web-vitals 库
import { onLCP } from 'web-vitals'
onLCP(console.log)
```

**优化方向：**

- 优化关键资源加载（预加载 LCP 元素）
- 使用 CDN 加速静态资源
- 服务端渲染（SSR）减少客户端渲染时间
- 优化图片格式与尺寸（WebP/AVIF）

---

#### 1.1.2 INP（Interaction to Next Paint，交互到下次绘制）

**定义：** INP 取代了 FID，衡量页面在整个生命周期内对所有用户交互（点击、触摸、键盘输入）的响应延迟。取所有交互中最差的（或接近最差的）延迟值。

**阈值：** | 评级 | 时间 | |------|------| | 🟢 良好 | ≤ 200ms | | 🟡 需要改进 | 200ms ~ 500ms | | 🔴 差 | > 500ms |

**INP 的组成：**

```
INP = Input Delay（输入延迟）
    + Processing Time（事件处理时间）
    + Presentation Delay（呈现延迟）
```

**测量方式：**

```javascript
// 使用 web-vitals 库
import { onINP } from 'web-vitals'
onINP(console.log)

// 手动测量（简化版）
let maxInteractionDelay = 0
document.addEventListener('pointerdown', () => {
  const start = performance.now()
  requestAnimationFrame(() => {
    const delay = performance.now() - start
    if (delay > maxInteractionDelay) {
      maxInteractionDelay = delay
    }
  })
})
```

**优化方向：**

- 拆分长任务（Long Tasks），使用 `scheduler.yield()` 或 `requestIdleCallback`
- 减少主线程 JavaScript 执行时间
- 使用 Web Worker 将计算密集任务移出主线程
- 防抖/节流高频事件

---

#### 1.1.3 CLS（Cumulative Layout Shift，累积布局偏移）

**定义：** 衡量页面生命周期内所有意外布局偏移的累积分数。每次布局偏移的分数 = 影响区域比例 × 距离比例。

**阈值：** | 评级 | 分数 | |------|------| | 🟢 良好 | ≤ 0.1 | | 🟡 需要改进 | 0.1 ~ 0.25 | | 🔴 差 | > 0.25 |

**测量方式：**

```javascript
// 使用 PerformanceObserver
let clsValue = 0
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    if (!entry.hadRecentInput) {
      // 排除用户交互后 500ms 内的偏移
      clsValue += entry.value
    }
  }
}).observe({ type: 'layout-shift', buffered: true })

// 使用 web-vitals
import { onCLS } from 'web-vitals'
onCLS(console.log)
```

**常见 CLS 问题与解决：** | 问题 | 解决方案 | |------|----------| | 无尺寸的图片/视频 | 设置 `width`、`height` 属性或 `aspect-ratio` | | 动态注入的广告 | 预留占位空间 | | Web 字体加载导致文字跳动 | 使用 `font-display: swap` + 预加载字体 | | 异步内容插入顶部 | 在视口下方插入，或使用 `scroll-anchoring` |

```html
<!-- 图片设置尺寸，避免加载时布局偏移 -->
<img src="hero.jpg" width="1200" height="600" alt="hero" />

<!-- 使用 aspect-ratio 预留空间 -->
<div style="aspect-ratio: 16/9; background: #f0f0f0;">
  <!-- 异步加载的内容 -->
</div>
```

---

### 1.2 其他关键性能指标

#### FCP（First Contentful Paint，首次内容绘制）

首次绘制任何文本、图片、非空白 Canvas/SVG 的时间。

```javascript
// 获取 FCP
performance.getEntriesByName('first-contentful-paint')[0]?.startTime

// 或使用 Observer
new PerformanceObserver((list) => {
  const fcp = list.getEntriesByName('first-contentful-paint')[0]
  console.log('FCP:', fcp?.startTime)
}).observe({ type: 'paint', buffered: true })
```

---

#### TTFB（Time to First Byte，首字节时间）

从浏览器发起请求到接收到第一个字节的时间，反映服务器响应速度。

```
TTFB = 重定向时间 + DNS 解析 + TCP 连接 + TLS 握手 + 服务器处理时间
```

```javascript
// 通过 Navigation Timing API 获取
const { responseStart, fetchStart } = performance.timing
const ttfb = responseStart - fetchStart

// 或使用 Navigation Timing Level 2
const navEntry = performance.getEntriesByType('navigation')[0]
const ttfb = navEntry.responseStart
```

**优化方向：**

- 使用 CDN，减少物理距离
- 服务端缓存（Redis、页面缓存）
- HTTP/2 或 HTTP/3
- 优化后端处理逻辑、数据库查询

---

#### TTI（Time to Interactive，可交互时间）

页面完全可交互的时间点。需同时满足：

1. 页面已绘制有意义内容（FCP 后）
2. 大部分可见元素已绑定事件（DOMContentLoaded 后）
3. TTI 后 5 秒内无长任务（>50ms 的任务）

**TTI 计算公式：**

```
TTI = (FCP 之后，5 秒窗口内无长任务且无超过 2 个 GET 请求) 的起始时间
```

```javascript
// TTI 需要通过 Lighthouse 或 web-vitals 测量（计算复杂）
// 简单近似：使用 DOMContentLoaded 作为参考
window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM ready:', performance.now())
})
```

---

#### TBT（Total Blocking Time，总阻塞时间）

FCP 到 TTI 之间，所有长任务（>50ms）的阻塞时间之和。

```
TBT = Σ(每个长任务执行时间 - 50ms)
```

**示例：** 一个 80ms 的长任务，其阻塞时间为 80 - 50 = 30ms。

---

#### SI（Speed Index，速度指数）

衡量页面内容可视化填充的速度，值越小越好。

**阈值：** | 评级 | SI | |------|-----| | 🟢 良好 | ≤ 3.4s | | 🟡 需改进 | 3.4s ~ 5.8s | | 🔴 差 | > 5.8s |

---

#### 指标关系图

```
用户导航
  │
  ▼
TTFB ─── 服务器响应
  │
  ▼
FCP ──── 首次绘制（用户看到内容）
  │
  ▼
LCP ──── 主要内容加载完成
  │
  ├── TBT（阻塞时间累积）
  │
  ▼
TTI ──── 页面可交互
  │
  ▼
CLS ──── 整个生命周期布局偏移
  │
  ▼
INP ──── 交互延迟（最差情况）
```

---

### 1.3 自定义业务指标

除了标准指标，通常还需要定义业务相关指标：

```javascript
// 1. 首屏业务内容可见时间
// 监控某个关键业务组件挂载时间
const firstScreenStart = performance.now()
// ...在关键组件 mounted 时：
const firstScreenTime = performance.now() - firstScreenStart

// 2. 自定义打点
performance.mark('hero-image-start')
// ...图片加载完成
performance.mark('hero-image-end')
performance.measure('hero-image-load', 'hero-image-start', 'hero-image-end')
const measure = performance.getEntriesByName('hero-image-load')[0]
console.log(`Hero 图片加载耗时: ${measure.duration}ms`)

// 3. 页面完全加载时间（含所有异步资源）
window.addEventListener('load', () => {
  console.log('Page fully loaded:', performance.now())
})
```

---

## 二、性能分析工具详解

### 2.1 Chrome DevTools

Chrome DevTools 是前端性能分析最核心、最常用的工具。

#### 2.1.1 Performance 面板（性能面板）

**用途：** 录制并分析页面运行时性能，查看 JavaScript 执行、渲染、绘制等完整时间线。

**关键操作：**

1. 打开 DevTools → Performance 标签
2. 点击录制按钮（●）或 `Ctrl + E`
3. 在页面上进行操作
4. 停止录制，分析结果

**火焰图解读：**

```
═══════════════════════════════════════════
══  Frames  ══════════════════════════════  ← 帧率（绿条 = 60fps）
═══════════════════════════════════════════
══  Main    ═══╗                           ← 主线程活动
══           ═══╣ Evaluate Script（黄色）
══           ═══╣ Layout（紫色）
══           ═══╣ Paint（绿色）
══           ═══╣ Composite（绿色）
═══════════════════════════════════════════
══  Raster  ══════════════════════════════  ← 光栅化线程
══  GPU     ══════════════════════════════  ← GPU 线程
═══════════════════════════════════════════
```

**关键指标查看：**

- **Summary 面板：** 各阶段耗时占比（Loading、Scripting、Rendering、Painting）
- **Bottom-Up：** 按函数耗时排序，定位瓶颈函数
- **Call Tree：** 按调用栈树形展示
- **Event Log：** 按时间顺序的事件列表

---

#### 2.1.2 Network 面板（网络面板）

**用途：** 分析资源加载时间线、请求瀑布图、资源大小等。

**关键列说明：** | 列名 | 含义 | |------|------| | Queueing | 请求排队时间（浏览器并发限制） | | Stalled | 请求等待发送时间 | | DNS Lookup | DNS 解析时间 | | Initial Connection | TCP 握手 + SSL 协商 | | Request Sent | 发送请求耗时 | | Waiting (TTFB) | 等待服务器响应 | | Content Download | 下载响应内容 |

**实用技巧：**

- 启用 `Disable cache` 模拟首次访问
- 使用 `Preserve log` 保留页面跳转前的请求
- 按域名、资源类型筛选
- 右键 → `Block request URL` 模拟资源加载失败

---

#### 2.1.3 Coverage 面板（代码覆盖率）

**用途：** 分析页面加载后 CSS/JS 代码的使用率，找到未使用的代码。

```bash
# 操作路径
DevTools → Ctrl+Shift+P → "Show Coverage" → 录制 → 操作页面 → 停止
```

**输出示例：** | URL | Type | Total Bytes | Unused Bytes | Usage |  
|-----|------|-------------|--------------|-------|  
| styles.css | CSS | 120KB | 85KB | 29% | | bundle.js | JS | 500KB | 200KB | 60% |

**优化建议：** 未使用率 > 50% 的代码应考虑代码分割或按需加载。

---

#### 2.1.4 Memory 面板（内存面板）

**用途：** 检测内存泄漏，分析堆快照。

**三种分析模式：** | 模式 | 用途 | |------|------| | Heap Snapshot | 拍摄堆快照，对比分析对象分配 | | Allocation instrumentation on timeline | 按时间线记录内存分配 | | Allocation sampling | 采样方式记录内存分配（低开销） |

```javascript
// 内存泄漏排查流程
// 1. 初始快照（Snapshot 1）
// 2. 执行疑似泄漏操作
// 3. 再次快照（Snapshot 2）
// 4. 对比 Snapshot 1 和 Snapshot 2，查找 Delta 异常增长的对象
```

---

#### 2.1.5 Lighthouse 面板

Chrome 内置 Lighthouse，路径：DevTools → Lighthouse 标签 → Generate report。

也可通过命令行使用：

```bash
# 安装
npm install -g lighthouse

# 运行
lighthouse https://example.com --view

# 指定设备与网络
lighthouse https://example.com --preset=desktop

# 输出 JSON/HTML
lighthouse https://example.com --output json --output html --output-path ./report
```

---

#### 2.1.6 Performance Monitor（性能监视器）

实时监控 CPU 使用率、JS 堆大小、DOM 节点数、布局/重绘次数。

```bash
DevTools → Ctrl+Shift+P → "Show Performance Monitor"
```

---

### 2.2 Lighthouse

Lighthouse 是 Google 开源的自动化网站质量检测工具，覆盖性能、可访问性、最佳实践、SEO、PWA 五大维度。

#### 2.2.1 使用方式

| 方式                 | 适用场景                        |
| -------------------- | ------------------------------- |
| Chrome DevTools 内置 | 本地开发调试                    |
| Chrome 扩展          | 一键运行                        |
| CLI 命令行           | CI/CD 集成                      |
| PageSpeed Insights   | 线上 URL 检测（含真实用户数据） |
| Lighthouse CI        | 持续集成性能回归检测            |

#### 2.2.2 报告解读

**性能评分权重（Lighthouse v10+）：** | 指标 | 权重 | |------|------| | TBT（Total Blocking Time） | 30% | | LCP（Largest Contentful Paint） | 25% | | CLS（Cumulative Layout Shift） | 25% | | SI（Speed Index） | 10% | | FCP（First Contentful Paint） | 10% |

**报告核心部分：**

1. **Metrics** — 各指标数值和评级
2. **Opportunities** — 可优化的机会点及预计节省时间
3. **Diagnostics** — 诊断信息（如 DOM 大小、关键请求链等）
4. **Passed Audits** — 已通过的项目

#### 2.2.3 Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @lhci/cli
      - run: lhci autorun --upload.target=temporary-public-storage
```

```javascript
// lighthouserc.js 配置
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
      },
    },
  },
}
```

---

### 2.3 WebPageTest

[WebPageTest](https://www.webpagetest.org/) 是一个强大的在线性能测试平台，支持多地域、多设备、多浏览器、多网络条件的真实环境测试。

#### 2.3.1 核心功能

- **多地域测试：** 全球各地服务器节点
- **多设备模拟：** iPhone、Android、Desktop
- **网络条件：** 4G、3G、Cable、自定义
- **多次运行取中位数**
- **视频录制：** 记录页面加载过程的视频
- **瀑布图：** 详细的请求时间线

#### 2.3.2 关键报告解读

```
═══════════════════════════════════════════
  Waterfall View（瀑布图）
═══════════════════════════════════════════
  资源 A ████░░░░░░░░░░░░
  资源 B ░░░░████████████
  资源 C ░░░░░░░░████░░░░

  Connection View（连接视图）—— 看并发连接使用情况
═══════════════════════════════════════════
  连接 1: [资源A][资源D][资源G]
  连接 2: [资源B][资源E]
  连接 3: [资源C][资源F]

  Filmstrip View（胶片视图）—— 各时间点的页面截图
═══════════════════════════════════════════
  0s │ 0.5s │ 1.0s │ 1.5s │ 2.0s │ 3.0s
  [白] [白] [部分] [更多] [完整] [完整]
```

#### 2.3.3 API 集成

```javascript
// 通过 API 触发测试
const API_KEY = 'your-api-key'
const response = await fetch(`https://www.webpagetest.org/runtest.php?url=${encodeURIComponent(url)}&k=${API_KEY}&f=json`)
const { data } = await response.json()
console.log('测试结果 URL:', data.summary)
```

---

### 2.4 Bundle 分析工具

#### 2.4.1 webpack-bundle-analyzer

```bash
npm install webpack-bundle-analyzer -D
```

```javascript
// webpack.config.js
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')

module.exports = {
  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: 'static', // 生成 HTML 报告
      reportFilename: 'bundle-report.html',
      openAnalyzer: false, // 不自动打开浏览器
      defaultSizes: 'parsed', // parsed | gzip | stat
    }),
  ],
}
```

**分析要点：**

- 查找体积过大的包（如 `moment.js`、`lodash` 全量引入）
- 识别重复打包的模块
- 发现未使用的依赖

---

#### 2.4.2 Rollup Visualizer（Vite 使用）

```bash
npm install rollup-plugin-visualizer -D
```

```javascript
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer'

export default {
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'stats.html',
    }),
  ],
}
```

---

#### 2.4.3 source-map-explorer

```bash
npm install source-map-explorer -D

# 分析打包后的文件
npx source-map-explorer dist/assets/*.js
```

---

### 2.5 Performance API

浏览器原生的 Performance API 是代码级性能采集的基础。

#### 2.5.1 Navigation Timing

```javascript
// Navigation Timing Level 2
const [entry] = performance.getEntriesByType('navigation')
const timingData = {
  // DNS 解析
  dns: entry.domainLookupEnd - entry.domainLookupStart,
  // TCP 连接
  tcp: entry.connectEnd - entry.connectStart,
  // 请求响应
  request: entry.responseStart - entry.requestStart,
  // 响应下载
  response: entry.responseEnd - entry.responseStart,
  // DOM 解析
  domParse: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
  // 完整加载
  load: entry.loadEventEnd - entry.loadEventStart,
  // 总耗时
  total: entry.loadEventEnd - entry.fetchStart,
}
console.table(timingData)
```

#### 2.5.2 Resource Timing

```javascript
// 获取所有资源加载时间
const resources = performance.getEntriesByType('resource')
resources.forEach((r) => {
  if (r.duration > 100) {
    // 筛选耗时 > 100ms 的资源
    console.log(`${r.name}: ${r.duration.toFixed(2)}ms (${r.initiatorType})`)
  }
})
```

#### 2.5.3 User Timing（自定义打点）

```javascript
// 打点标记
performance.mark('api-call-start')
await fetch('/api/data')
performance.mark('api-call-end')

// 测量区间
performance.measure('api-call', 'api-call-start', 'api-call-end')
const measure = performance.getEntriesByName('api-call')[0]
console.log(`API 调用耗时: ${measure.duration}ms`)

// 清理
performance.clearMarks()
performance.clearMeasures()
```

#### 2.5.4 Long Tasks API

```javascript
// 监听长任务（>50ms 的任务）
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    console.warn(`长任务: ${entry.duration}ms`, entry)
    // entry.attribution 包含导致长任务的框架信息
  }
})
observer.observe({ type: 'longtask', buffered: true })
```

---

### 2.6 真实用户监控（RUM）

RUM（Real User Monitoring）收集真实用户的性能数据，与实验室数据（Lighthouse）互补。

#### 2.6.1 数据采集方案

```javascript
// 基于 web-vitals + Performance API 的采集 SDK
import { onLCP, onFID, onCLS, onINP, onFCP, onTTFB } from 'web-vitals'

function sendToAnalytics(metric) {
  const data = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating, // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    id: metric.id,
    page: location.pathname,
    timestamp: Date.now(),
    // 附加用户环境信息
    userAgent: navigator.userAgent,
    connection: navigator.connection?.effectiveType,
    deviceMemory: navigator.deviceMemory,
  }

  // 使用 sendBeacon 确保页面卸载时也能发送
  if (navigator.sendBeacon) {
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
    navigator.sendBeacon('/api/metrics', blob)
  } else {
    fetch('/api/metrics', {
      method: 'POST',
      body: JSON.stringify(data),
      keepalive: true,
    })
  }
}

onCLS(sendToAnalytics)
onINP(sendToAnalytics)
onLCP(sendToAnalytics)
onFCP(sendToAnalytics)
onTTFB(sendToAnalytics)
```

#### 2.6.2 常见 RUM 方案对比

| 方案                     | 特点            | 适用场景             |
| ------------------------ | --------------- | -------------------- |
| web-vitals + 自建        | 轻量、可控      | 中小项目、有数据平台 |
| Sentry Performance       | 错误监控 + 性能 | 需要完整 APM         |
| Datadog RUM              | 企业级、全面    | 大型项目             |
| 阿里云 ARMS              | 国内生态好      | 国内业务             |
| Cloudflare Web Analytics | 免费、隐私友好  | 静态站点             |

---

## 三、首屏性能优化详解

### 3.1 网络层面优化

#### 3.1.1 DNS 优化

```html
<!-- DNS 预解析：提前解析第三方域名 -->
<link rel="dns-prefetch" href="//api.example.com" />
<link rel="dns-prefetch" href="//cdn.example.com" />
```

**使用场景：**

- 当前页面需要请求其他域名的资源
- 第三方 SDK、字体、统计脚本等

**注意：** 浏览器会对 `dns-prefetch` 的域名进行 DNS 预解析，即使该页面不会直接使用这些资源（后续页面的资源）。对于 HTTPS 站点，Chrome 会忽略非安全的 dns-prefetch。

---

#### 3.1.2 Preconnect（预连接）

```html
<!-- 预连接 = DNS 解析 + TCP 握手 + TLS 协商 -->
<link rel="preconnect" href="https://api.example.com" />
```

**适用场景：** 确定即将使用的关键第三方源。

**原则：** 只对 2-3 个最关键的源使用 preconnect，过多反而浪费连接。

---

#### 3.1.3 CDN 加速

**优化原理：**

- 就近访问：将资源分发到全球边缘节点
- 减少网络延迟：物理距离缩短
- 分担源站压力

**常见 CDN 服务商：**

- Cloudflare（免费套餐可用）
- AWS CloudFront
- 阿里云 CDN
- 腾讯云 CDN
- Fastly

**CDN 最佳实践：**

```nginx
# Nginx 配置 CDN 友好的缓存头
location /static/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

---

#### 3.1.4 HTTP 协议升级

| 协议          | 特点                                         |
| ------------- | -------------------------------------------- |
| HTTP/1.1      | 每个连接串行请求，有并发限制（6 个/域名）    |
| HTTP/2        | 多路复用、头部压缩、服务器推送               |
| HTTP/3 (QUIC) | 基于 UDP，减少握手延迟，更好的移动网络适应性 |

**HTTP/2 服务器推送（Server Push）：**

```nginx
# Nginx 配置 HTTP/2 Push
location / {
    http2_push /css/critical.css;
    http2_push /js/critical.js;
}
```

---

#### 3.1.5 资源压缩

```nginx
# Nginx 开启 Gzip
gzip on;
gzip_min_length 1k;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml;
gzip_vary on;

# Nginx 开启 Brotli（压缩率比 Gzip 高 20%）
brotli on;
brotli_comp_level 6;
brotli_types text/plain text/css application/json application/javascript;
```

**Gzip vs Brotli：** | 特性 | Gzip | Brotli | |------|------|--------| | 压缩率 | 基准 | 比 Gzip 高 ~20% | | 压缩速度 | 快 | 较慢 | | 解压速度 | 快 | 快 | | 浏览器支持 | 全部 | 主流现代浏览器 |

---

### 3.2 资源加载优化

#### 3.2.1 关键渲染路径优化

**关键资源内联：**

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- 内联关键 CSS（首屏样式），避免额外请求 -->
    <style>
      /* 首屏关键样式 */
      .header {
        ...;
      }
      .hero {
        ...;
      }
    </style>

    <!-- 非关键 CSS 异步加载 -->
    <link rel="preload" href="/css/full.css" as="style" onload="this.onload=null;this.rel='stylesheet'" />
    <noscript><link rel="stylesheet" href="/css/full.css" /></noscript>
  </head>
  <body>
    <!-- 页面内容 -->

    <!-- 非关键 JS 延迟加载 -->
    <script src="/js/non-critical.js" defer></script>
  </body>
</html>
```

---

#### 3.2.2 资源预加载与预获取

```html
<!-- Preload：告诉浏览器优先加载当前页面需要的资源 -->
<link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin />
<link rel="preload" href="/js/hero.js" as="script" />
<link rel="preload" href="/images/hero.webp" as="image" />

<!-- Prefetch：预获取未来可能需要的资源（低优先级） -->
<link rel="prefetch" href="/js/next-page.js" />

<!-- Prerender：预渲染整个页面（谨慎使用，开销大） -->
<link rel="prerender" href="/next-page.html" />
```

**Preload 使用原则：**

- 只 preload 当前页面即将使用的关键资源
- 必须设置 `as` 属性，否则浏览器不会按正确优先级加载
- 字体 preload 需要 `crossorigin` 属性

**Preload vs Prefetch 对比：** | 特性 | Preload | Prefetch | |------|---------|----------| | 优先级 | 高 | 低 | | 时机 | 当前页面 | 未来导航 | | 用途 | 关键资源提前加载 | 预加载下一页资源 |

---

#### 3.2.3 脚本加载策略

```html
<!-- 普通 script：阻塞 HTML 解析 -->
<script src="app.js"></script>

<!-- async：下载不阻塞，执行时阻塞（适合独立脚本如统计） -->
<script src="analytics.js" async></script>

<!-- defer：下载不阻塞，DOM 解析完再执行（推荐） -->
<script src="app.js" defer></script>

<!-- type="module" 默认 defer 行为 -->
<script type="module" src="app.js"></script>
```

**加载时机对比：**

```
普通:   HTML解析 ████░░░░░░░░████
        JS下载   ░░░░████████░░░░
        JS执行   ░░░░░░░░████░░░░

async:  HTML解析 ████████████░░░░
        JS下载   ░░░░████████░░░░
        JS执行   ░░░░░░░░████░░░░

defer:  HTML解析 ████████████████
        JS下载   ░░░░████████░░░░
        JS执行   ░░░░░░░░░░░░████
```

---

#### 3.2.4 路由懒加载

```javascript
// Vue Router 路由懒加载
const routes = [
  {
    path: '/dashboard',
    component: () => import(/* webpackChunkName: "dashboard" */ '@/views/Dashboard.vue'),
  },
  {
    path: '/settings',
    component: () => import(/* webpackChunkName: "settings" */ '@/views/Settings.vue'),
  },
]

// React 路由懒加载
import { lazy, Suspense } from 'react'
const Dashboard = lazy(() => import('./views/Dashboard'))
const Settings = lazy(() => import('./views/Settings'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/settings' element={<Settings />} />
      </Routes>
    </Suspense>
  )
}
```

---

#### 3.2.5 第三方库按需加载

```javascript
// ❌ 全量引入（ECharts 全量 ~1MB）
import * as echarts from 'echarts'

// ✅ 按需引入（可能只需 ~200KB）
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([BarChart, LineChart, GridComponent, TooltipComponent, CanvasRenderer])

// ✅ 条件加载（仅在需要时加载）
button.addEventListener('click', async () => {
  const { default: heavyLib } = await import('heavy-library')
  heavyLib.doSomething()
})
```

---

### 3.3 渲染层面优化

#### 3.3.1 SSR / SSG / ISR

| 方案          | 原理                        | 适用场景               | 框架                 |
| ------------- | --------------------------- | ---------------------- | -------------------- |
| SSR           | 服务端渲染 HTML 返回        | SEO 要求高、首屏要求快 | Next.js, Nuxt.js     |
| SSG           | 构建时生成静态 HTML         | 内容不频繁变化         | Next.js, Astro, Hugo |
| ISR           | 按需重新生成静态页面        | 内容有更新但可容忍延迟 | Next.js              |
| Streaming SSR | 流式返回 HTML，边渲染边传输 | 大数据量页面           | Next.js App Router   |

**SSR 性能收益：**

- FCP 可提前 50%~70%（与纯 CSR 对比）
- LCP 可提前 40%~60%
- SEO 友好，搜索引擎可直接抓取内容

**SSR 的代价：**

- 服务器成本增加
- TTFB 可能变差（取决于服务器性能）
- 水合（Hydration）阶段仍需客户端 JS

---

#### 3.3.2 骨架屏（Skeleton Screen）

```html
<!-- 方案一：index.html 中直接写骨架屏 HTML/CSS -->
<div id="app">
  <div class="skeleton">
    <div class="skeleton-header"></div>
    <div class="skeleton-content">
      <div class="skeleton-line"></div>
      <div class="skeleton-line short"></div>
      <div class="skeleton-line"></div>
    </div>
  </div>
</div>

<style>
  .skeleton-line {
    height: 16px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }
  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
</style>
```

```javascript
// 方案二：Vue 组件级骨架屏
// 利用 Suspense + 异步组件
<template>
  <Suspense>
    <template #default>
      <AsyncDashboard />
    </template>
    <template #fallback>
      <DashboardSkeleton />
    </template>
  </Suspense>
</template>
```

---

#### 3.3.3 虚拟列表（Virtual List）

大量数据列表的核心优化手段（详见 [5.2 节](#52-虚拟列表)）。

---

#### 3.3.4 避免渲染阻塞

```css
/* 避免在首屏使用昂贵的 CSS 属性 */
/* ❌ 强制重绘的属性 */
.box {
  box-shadow: 0 0 100px rgba(0, 0, 0, 0.5); /* 大面积模糊开销大 */
  filter: blur(5px);
}

/* ✅ 使用 transform 代替 position 变化 */
/* ❌ 触发布局 */
.element {
  left: 100px;
}
/* ✅ 仅触发合成 */
.element {
  transform: translateX(100px);
}
```

---

### 3.4 缓存策略

#### 3.4.1 HTTP 缓存

**强缓存：**

```http
# 资源在 1 年内不变（适合带 hash 的静态资源）
Cache-Control: public, max-age=31536000, immutable

# 资源缓存但每次需验证（适合 HTML 入口文件）
Cache-Control: no-cache
```

**协商缓存：**

```http
# 服务端配合 ETag/Last-Modified
# 请求头
If-None-Match: "abc123"
If-Modified-Since: Wed, 21 Oct 2023 07:28:00 GMT

# 响应（未变化）
HTTP/1.1 304 Not Modified
```

**缓存策略矩阵：** | 资源类型 | 缓存策略 | Cache-Control | |----------|----------|---------------| | HTML 入口 | 协商缓存 | `no-cache` | | JS/CSS（带 hash） | 强缓存 | `max-age=31536000, immutable` | | 图片/字体 | 强缓存 | `max-age=2592000` | | API 数据 | 不缓存 / 短缓存 | `no-store` / `max-age=60` |

---

#### 3.4.2 Service Worker 缓存

```javascript
// sw.js - Service Worker 缓存策略
const CACHE_NAME = 'app-v1'
const PRECACHE_URLS = ['/', '/css/critical.css', '/js/app.js']

// 安装阶段：预缓存关键资源
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)))
})

// 请求拦截：缓存优先 + 网络更新
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // 缓存命中，同时在后台更新缓存
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone())
        })
        return networkResponse
      })
      return cachedResponse || fetchPromise
    })
  )
})
```

**Service Worker 缓存策略：** | 策略 | 模式 | 适用场景 | |------|------|----------| | Cache First | 优先缓存，无缓存再网络 | 不常变的静态资源 | | Network First | 优先网络，失败回退缓存 | API 数据 | | Stale While Revalidate | 返回缓存，同时更新 | 平衡体验与新鲜度 | | Network Only | 仅网络 | 实时性要求高的请求 | | Cache Only | 仅缓存 | 离线应用资源 |

---

#### 3.4.3 浏览器缓存（Storage）

```javascript
// 1. localStorage（同步，5MB）
localStorage.setItem('data', JSON.stringify(data))

// 2. sessionStorage（会话级别，5MB）
sessionStorage.setItem('token', 'abc123')

// 3. IndexedDB（异步，容量大）
const db = await openDB('app-db', 1, {
  upgrade(db) {
    db.createObjectStore('keyval')
  },
})
await db.put('keyval', data, 'my-key')

// 4. Cache API（Service Worker 配合使用）
const cache = await caches.open('dynamic-v1')
await cache.put('/api/data', new Response(JSON.stringify(data)))
```

---

### 3.5 图片优化

#### 3.5.1 图片格式选择

| 格式 | 压缩率                  | 透明度 | 浏览器支持 | 适用场景     |
| ---- | ----------------------- | ------ | ---------- | ------------ |
| JPEG | 中等                    | ❌     | 所有       | 照片         |
| PNG  | 低                      | ✅     | 所有       | Logo、图标   |
| WebP | 高（比 JPEG 小 25-35%） | ✅     | ~97%       | 通用（推荐） |
| AVIF | 最高（比 WebP 小 20%）  | ✅     | ~93%       | 新一代首选   |
| SVG  | 矢量                    | ✅     | 所有       | 图标、图形   |

```html
<!-- 使用 <picture> 提供多格式降级 -->
<picture>
  <source srcset="hero.avif" type="image/avif" />
  <source srcset="hero.webp" type="image/webp" />
  <img src="hero.jpg" alt="hero" width="1200" height="600" loading="lazy" />
</picture>
```

---

#### 3.5.2 响应式图片

```html
<!-- 根据屏幕宽度加载不同尺寸 -->
<img
  src="hero-800w.jpg"
  srcset="hero-400w.jpg 400w, hero-800w.jpg 800w, hero-1200w.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="hero"
/>

<!-- 根据设备像素比 -->
<img src="hero-1x.jpg" srcset="hero-1x.jpg 1x, hero-2x.jpg 2x, hero-3x.jpg 3x" alt="hero" />
```

---

#### 3.5.3 图片懒加载

```html
<!-- 原生懒加载（Chrome 77+） -->
<img src="photo.jpg" loading="lazy" alt="photo" />

<!-- JS 实现（Intersection Observer） -->
<img data-src="photo.jpg" class="lazy" alt="photo" />

<script>
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.src = img.dataset.src
        img.onload = () => img.classList.add('loaded')
        observer.unobserve(img)
      }
    })
  })

  document.querySelectorAll('.lazy').forEach((img) => observer.observe(img))
</script>
```

---

#### 3.5.4 图片压缩与 CDN 处理

```bash
# 构建时自动压缩（使用 imagemin）
npm install imagemin imagemin-webp imagemin-avif -D
```

```javascript
// vite.config.js 图片压缩插件
import viteImagemin from 'vite-plugin-imagemin'

export default {
  plugins: [
    viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      webp: { quality: 80 },
    }),
  ],
}
```

**CDN 图片处理（以 Cloudflare 为例）：**

```
# URL 参数动态处理图片
https://cdn.example.com/photo.jpg?width=800&quality=80&format=webp
```

---

## 四、构建层面优化

### 4.1 Webpack 优化

#### 4.1.1 缩小构建范围

```javascript
// webpack.config.js
module.exports = {
  // 1. 使用 include/exclude 缩小 loader 范围
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'), // 只处理 src 目录
        exclude: /node_modules/, // 排除 node_modules
        use: 'babel-loader',
      },
    ],
  },

  // 2. resolve.extensions 减少后缀尝试
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // 尽量精简
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // 3. 指定模块查找路径
    modules: [path.resolve(__dirname, 'node_modules')],
  },

  // 4. 使用 noParse 跳过大型已打包库
  module: {
    noParse: /jquery|lodash/,
  },
}
```

---

#### 4.1.2 缓存优化

```javascript
module.exports = {
  cache: {
    type: 'filesystem', // 文件系统缓存，二次构建大幅提速
  },
}
```

---

#### 4.1.3 多线程/多进程构建

```javascript
// thread-loader：将后续 loader 放入 worker 池
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          'thread-loader', // 放在其他 loader 之前
          'babel-loader',
        ],
      },
    ],
  },
}

// 或使用 terser-webpack-plugin 多进程压缩
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true, // 多进程压缩
      }),
    ],
  },
}
```

---

#### 4.1.4 DLL 预编译（Webpack 4 及以下）

```javascript
// webpack.dll.js — 将不常变的库预先编译
module.exports = {
  entry: {
    vendor: ['vue', 'vue-router', 'axios', 'lodash'],
  },
  output: {
    path: path.resolve(__dirname, 'dll'),
    filename: '[name].dll.js',
    library: '[name]_library',
  },
  plugins: [
    new webpack.DllPlugin({
      name: '[name]_library',
      path: path.resolve(__dirname, 'dll/[name]-manifest.json'),
    }),
  ],
}
```

> Webpack 5 中，DLL 已被持久化缓存（`cache.type: 'filesystem'`）取代。

---

### 4.2 Vite 优化

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  // 1. 预构建优化
  optimizeDeps: {
    include: ['lodash-es', 'echarts/core'], // 强制预构建
    exclude: [], // 排除不需要预构建的
  },

  // 2. 构建优化
  build: {
    target: 'es2015', // 目标浏览器，减少 polyfill
    minify: 'esbuild', // esbuild 比 terser 快 20-40 倍
    cssCodeSplit: true, // CSS 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          // 手动分包
          vendor: ['vue', 'vue-router'],
          ui: ['ant-design-vue'],
        },
      },
    },
    // 3. chunk 大小警告阈值
    chunkSizeWarningLimit: 500, // KB
  },

  // 4. 压缩配置
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
```

---

### 4.3 代码分割策略

#### 4.3.1 SplitChunks 配置（Webpack）

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // 第三方库单独打包
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            // 每个 npm 包单独打包
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1]
            return `npm.${packageName.replace('@', '')}`
          },
          priority: 10,
        },
        // 公共组件
        common: {
          minChunks: 3, // 被引用 3 次以上
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    },
  },
}
```

#### 4.3.2 分包原则

```
═══════════════════════════════════════════════
  推荐的分包结构：
═══════════════════════════════════════════════
  main.js        (~50KB)   入口运行时
  vendor-vue.js  (~120KB)  框架核心（变化极少，长期缓存）
  vendor-ui.js   (~200KB)  UI 库（变化少）
  vendor-lib.js  (~100KB)  其他第三方库
  page-a.js      (~30KB)   页面 A
  page-b.js      (~30KB)   页面 B
  common.js      (~20KB)   公共模块（被多个页面共享）
═══════════════════════════════════════════════
```

**分包原则：**

1. **框架单独打包** — Vue/React 核心极少变化，长期缓存
2. **UI 库单独打包** — 体积大，但变化少
3. **业务公共代码** — `minChunks` 策略自动抽离
4. **页面级代码** — 路由懒加载，按需加载
5. **单包不宜过大** — 控制在 200KB (gzip) 以内

---

### 4.4 Tree Shaking 原理与实践

#### 4.4.1 Tree Shaking 原理

Tree Shaking 通过 ES Module 的静态分析，移除未使用的代码（Dead Code Elimination）。

**前提条件：**

1. 必须使用 ES Module（`import`/`export`），CommonJS 不支持
2. 在 `package.json` 中标记副作用

```json
// package.json
{
  "sideEffects": false,
  // 或指定有副作用的文件
  "sideEffects": ["*.css", "*.scss", "src/polyfills.js"]
}
```

#### 4.4.2 确保 Tree Shaking 生效

```javascript
// ❌ 导入整个库（Tree Shaking 失败）
import _ from 'lodash'
_.debounce(fn, 300)

// ✅ 按需导入
import debounce from 'lodash/debounce'
debounce(fn, 300)

// ✅ 或使用 ES Module 版本的库
import { debounce } from 'lodash-es'
```

**Webpack 配置：**

```javascript
module.exports = {
  mode: 'production', // production 模式自动启用 Tree Shaking
  optimization: {
    usedExports: true, // 标记被使用的导出
    sideEffects: true, // 识别 package.json 的 sideEffects
  },
}
```

---

## 五、运行时性能优化

### 5.1 长任务拆分与调度

#### 5.1.1 使用 scheduler.yield()（推荐）

```javascript
// Chrome 129+ 原生支持
async function processLargeData(items) {
  for (let i = 0; i < items.length; i++) {
    processItem(items[i])

    // 每处理一项后让出主线程
    if (i % 50 === 0) {
      await scheduler.yield()
    }
  }
}
```

#### 5.1.2 使用 requestIdleCallback

```javascript
// 在浏览器空闲时执行低优先级任务
function scheduleWork(tasks) {
  let index = 0

  function processIdle(deadline) {
    // deadline.timeRemaining() 返回当前帧剩余时间
    while (index < tasks.length && deadline.timeRemaining() > 1) {
      tasks[index++]()
    }

    if (index < tasks.length) {
      requestIdleCallback(processIdle)
    }
  }

  requestIdleCallback(processIdle)
}
```

#### 5.1.3 使用 setTimeout 分段

```javascript
// 兼容方案：将长任务拆分为多个宏任务
function chunkTask(items, chunkSize = 100) {
  let i = 0
  function processChunk() {
    const end = Math.min(i + chunkSize, items.length)
    for (; i < end; i++) {
      processItem(items[i])
    }
    if (i < items.length) {
      setTimeout(processChunk, 0)
    }
  }
  processChunk()
}
```

#### 5.1.4 Web Worker

```javascript
// main.js
const worker = new Worker('/js/heavy-worker.js')
worker.postMessage({ data: largeArray })
worker.onmessage = (e) => {
  console.log('计算结果:', e.data)
}

// heavy-worker.js
self.onmessage = (e) => {
  const result = e.data.data.map((item) => heavyComputation(item))
  self.postMessage(result)
}
```

---

### 5.2 虚拟列表

```javascript
// 虚拟列表核心实现
class VirtualList {
  constructor(container, itemHeight, totalItems, renderItem) {
    this.container = container
    this.itemHeight = itemHeight
    this.totalItems = totalItems
    this.renderItem = renderItem

    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2 // +2 缓冲
    this.startIndex = 0
    this.endIndex = this.visibleCount

    this.render()
    container.addEventListener('scroll', () => this.onScroll())
  }

  onScroll() {
    const scrollTop = this.container.scrollTop
    this.startIndex = Math.floor(scrollTop / this.itemHeight)
    this.endIndex = this.startIndex + this.visibleCount
    this.render()
  }

  render() {
    // 设置总高度占位
    const totalHeight = this.totalItems * this.itemHeight

    // 只渲染可视区域内的项
    const visibleItems = []
    for (let i = this.startIndex; i < Math.min(this.endIndex, this.totalItems); i++) {
      visibleItems.push(this.renderItem(i, i * this.itemHeight))
    }

    this.container.innerHTML = `
      <div style="height:${totalHeight}px; position:relative">
        ${visibleItems.join('')}
      </div>
    `
  }
}

// 使用
const list = new VirtualList(
  document.getElementById('list'),
  50, // 每项高度
  100000, // 总项数
  (index, top) => `<div style="position:absolute;top:${top}px;height:50px">Item ${index}</div>`
)
```

**成熟方案：**

- React: `react-window`、`@tanstack/virtual`
- Vue: `vue-virtual-scroller`、`vxe-table`

---

### 5.3 重绘与回流优化

#### 5.3.1 回流（Reflow）触发条件

回流（Layout）触发条件——任何改变元素几何属性的操作：

```
修改 width/height、padding、margin、border
修改 display、position、float
添加/删除 DOM 元素
修改字体大小
读取 offsetWidth/offsetHeight、scrollTop 等属性（强制同步布局）
```

#### 5.3.2 重绘（Repaint）触发条件

```
修改 color、background-color、box-shadow 等不影响布局的属性
```

#### 5.3.3 优化策略

```javascript
// ❌ 多次读写导致多次回流
element.style.width = '100px'
element.style.height = '100px'
const w = element.offsetWidth // 强制回流
element.style.margin = '10px'

// ✅ 批量修改
element.style.cssText = 'width:100px; height:100px; margin:10px'
// 或使用 class
element.classList.add('new-style')

// ✅ 读写分离：先读后写
const width = element.offsetWidth // 读
// ... 计算
element.style.width = width + 10 + 'px' // 写

// ✅ 离线 DOM 操作
const fragment = document.createDocumentFragment()
for (let i = 0; i < 100; i++) {
  const div = document.createElement('div')
  div.textContent = `Item ${i}`
  fragment.appendChild(div)
}
document.body.appendChild(fragment) // 一次性插入

// ✅ 使用 transform 代替 top/left
// ❌ 触发布局+绘制+合成
element.style.left = '100px'
// ✅ 仅触发合成（Composite-only）
element.style.transform = 'translateX(100px)'
```

**CSS 属性触发层级：**

```
仅合成（最优）:  transform, opacity
绘制+合成:       color, background, box-shadow, border-color
布局+绘制+合成:  width, height, padding, margin, top, left, font-size
```

#### 5.3.4 will-change 提示

```css
/* 提前告知浏览器该元素将发生的变化 */
.animated-element {
  will-change: transform, opacity;
}

/* ⚠️ 不要滥用，仅在动画前设置，动画结束后移除 */
```

#### 5.3.5 CSS Containment

```css
/* 告诉浏览器该元素的渲染是独立的，限制回流范围 */
.widget {
  contain: layout style paint;
  /* 等价于 */
  contain: strict;
}

/* 仅限制布局 */
.list-item {
  contain: layout;
}

/* 使用 content-visibility 自动跳过视口外元素的渲染 */
.off-screen {
  content-visibility: auto;
  contain-intrinsic-size: 0 200px; /* 预估高度，避免滚动条跳动 */
}
```

---

### 5.4 内存泄漏排查

#### 5.4.1 常见内存泄漏场景

| 场景                  | 原因                           | 解决                                      |
| --------------------- | ------------------------------ | ----------------------------------------- |
| 未清理的定时器        | `setInterval` 持续引用         | `clearInterval`                           |
| 未移除的事件监听      | DOM 已移除但事件引用仍在       | `removeEventListener` / `AbortController` |
| 闭包引用              | 闭包持有大对象引用             | 手动释放引用                              |
| 全局变量              | 意外的全局变量不会被 GC        | 使用 `let`/`const`                        |
| 分离的 DOM 节点       | JS 引用了已从 DOM 树移除的节点 | 设为 `null`                               |
| WebSocket/EventSource | 连接未关闭                     | 组件卸载时关闭                            |
| console.log 大对象    | 控制台保留对象引用             | 生产环境移除                              |

#### 5.4.2 排查方法

```javascript
// 1. 使用 AbortController 统一管理可取消的监听
const controller = new AbortController()

element.addEventListener('click', handler, { signal: controller.signal })
fetch('/api', { signal: controller.signal })

// 组件卸载时
controller.abort() // 一键取消所有监听和请求

// 2. WeakRef 和 FinalizationRegistry（高级用法，用于监控）
const registry = new FinalizationRegistry((heldValue) => {
  console.log(`对象 ${heldValue} 被 GC 回收`)
})
registry.register(myObject, 'myObject')
```

#### 5.4.3 Chrome DevTools Memory 面板操作步骤

```
1. 打开 DevTools → Memory 面板
2. 选择 "Heap snapshot"
3. 拍快照（Snapshot 1 — 基线）
4. 执行可疑操作（如反复打开/关闭弹窗）
5. 拍快照（Snapshot 2）
6. 拍快照（Snapshot 3 — 再执行一次操作后）
7. 对比 Snapshot 1 vs Snapshot 3
   - 按 "Delta" 排序
   - 查看 "# New"、"# Deleted"、"# Delta"
   - 重点关注 Delta 持续增长的对象
8. 展开异常对象 → 查看 Retainers（引用链）→ 定位泄漏源
```

---

## 六、性能监控体系

### 6.1 性能数据采集

#### 6.1.1 完整采集 SDK 设计

```javascript
// performance-collector.js
class PerformanceCollector {
  constructor(config) {
    this.config = {
      reportUrl: '/api/metrics',
      sampleRate: 1, // 采样率 100%
      ...config,
    }
  }

  init() {
    this.collectNavigation()
    this.collectWebVitals()
    this.collectResources()
    this.collectLongTasks()
    this.collectMemory()
  }

  // 1. 收集导航性能
  collectNavigation() {
    if (performance.getEntriesByType) {
      const [nav] = performance.getEntriesByType('navigation')
      if (nav) {
        this.report({
          type: 'navigation',
          dns: nav.domainLookupEnd - nav.domainLookupStart,
          tcp: nav.connectEnd - nav.connectStart,
          ttfb: nav.responseStart - nav.requestStart,
          domParse: nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart,
          loadTime: nav.loadEventEnd - nav.fetchStart,
        })
      }
    }
  }

  // 2. 收集 Web Vitals
  collectWebVitals() {
    // FCP
    new PerformanceObserver((list) => {
      const fcp = list.getEntriesByName('first-contentful-paint')[0]
      if (fcp) this.report({ type: 'fcp', value: fcp.startTime })
    }).observe({ type: 'paint', buffered: true })

    // LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const last = entries[entries.length - 1]
      this.report({ type: 'lcp', value: last.startTime })
    }).observe({ type: 'largest-contentful-paint', buffered: true })

    // CLS
    let clsValue = 0
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) clsValue += entry.value
      }
      this.report({ type: 'cls', value: clsValue })
    }).observe({ type: 'layout-shift', buffered: true })
  }

  // 3. 收集资源加载
  collectResources() {
    const resources = performance.getEntriesByType('resource')
    const slowResources = resources.filter((r) => r.duration > 500)
    slowResources.forEach((r) => {
      this.report({
        type: 'resource',
        name: r.name,
        duration: r.duration,
        size: r.transferSize,
        initiatorType: r.initiatorType,
      })
    })
  }

  // 4. 收集长任务
  collectLongTasks() {
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.report({
          type: 'long-task',
          duration: entry.duration,
          attribution: entry.attribution?.[0],
        })
      }
    }).observe({ type: 'longtask', buffered: true })
  }

  // 5. 内存信息
  collectMemory() {
    if (performance.memory) {
      setInterval(() => {
        this.report({
          type: 'memory',
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
        })
      }, 30000) // 每 30 秒上报一次
    }
  }

  report(data) {
    // 采样
    if (Math.random() > this.config.sampleRate) return

    const payload = {
      ...data,
      page: location.pathname,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      connection: navigator.connection?.effectiveType,
    }

    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.config.reportUrl, JSON.stringify(payload))
    } else {
      fetch(this.config.reportUrl, {
        method: 'POST',
        body: JSON.stringify(payload),
        keepalive: true,
      })
    }
  }
}

// 初始化
new PerformanceCollector({ sampleRate: 0.1 }).init()
```

---

### 6.2 监控平台设计

#### 6.2.1 架构概览

```
═══════════════════════════════════════════════════════
                    性能监控平台架构
═══════════════════════════════════════════════════════

  [浏览器 SDK] ──── HTTP/Beacon ────→ [数据接入层 (Nginx/Kafka)]
                                          │
                                          ▼
                                     [数据处理层 (Flink/Spark)]
                                          │
                                          ▼
                                     [时序数据库 (InfluxDB/Prometheus)]
                                          │
                                          ▼
                                     [查询 & 展示 (Grafana/自建)]
                                          │
                                          ▼
                                     [告警 (钉钉/飞书/邮件)]
═══════════════════════════════════════════════════════
```

#### 6.2.2 关键监控维度

| 维度       | 指标               | 告警阈值示例 |
| ---------- | ------------------ | ------------ |
| 页面加载   | LCP, FCP, TTFB     | LCP > 3s     |
| 交互响应   | INP, FID           | INP > 300ms  |
| 视觉稳定性 | CLS                | CLS > 0.15   |
| 资源加载   | JS/CSS 加载时间    | 单资源 > 2s  |
| 错误率     | JS Error, 资源 404 | 错误率 > 1%  |
| 接口性能   | API 响应时间       | P95 > 500ms  |

#### 6.2.3 Grafana 仪表盘示例

```json
{
  "dashboard": {
    "title": "前端性能监控",
    "panels": [
      {
        "title": "LCP P75 (7天)",
        "targets": [{ "expr": "histogram_quantile(0.75, lcp_seconds)" }]
      },
      {
        "title": "CLS 趋势",
        "targets": [{ "expr": "avg(cls_score)" }]
      },
      {
        "title": "各页面性能分布",
        "targets": [{ "expr": "avg by(page)(lcp_seconds)" }]
      }
    ]
  }
}
```

---

### 6.3 性能预算

#### 6.3.1 制定性能预算

```javascript
// .perf-budget.json
{
  "budgets": [
    {
      "resourceType": "script",
      "budget": 170  // KB (gzip)
    },
    {
      "resourceType": "style",
      "budget": 50   // KB (gzip)
    },
    {
      "resourceType": "image",
      "budget": 200  // KB
    },
    {
      "resourceType": "font",
      "budget": 50   // KB
    },
    {
      "resourceType": "total",
      "budget": 500  // KB (gzip) — 总 JS
    }
  ],
  "metrics": {
    "FCP": 1800,     // ms
    "LCP": 2500,     // ms
    "TTI": 3500,     // ms
    "CLS": 0.1,
    "TBT": 200       // ms
  }
}
```

#### 6.3.2 Webpack Performance Hints

```javascript
// webpack.config.js
module.exports = {
  performance: {
    maxAssetSize: 200 * 1024, // 单个资源最大 200KB
    maxEntrypointSize: 400 * 1024, // 入口最大 400KB
    hints: 'warning', // 'error' | 'warning' | false
  },
}
```

---

### 6.4 CI/CD 性能回归检测

#### 6.4.1 Lighthouse CI 配置

```yaml
# .github/workflows/perf.yml
name: Performance Regression
on: [pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - run: |
          npm install -g @lhci/cli
          lhci autorun \
            --upload.target=temporary-public-storage \
            --collect.url=http://localhost:3000/ \
            --collect.numberOfRuns=3
```

#### 6.4.2 Bundle Size 检测

```yaml
# 使用 bundlesize 检测
- run: npx bundlesize
```

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/assets/*.js",
      "maxSize": "200 kB",
      "compression": "gzip"
    },
    {
      "path": "./dist/assets/*.css",
      "maxSize": "50 kB",
      "compression": "gzip"
    }
  ]
}
```

---

## 七、相关核心知识

### 7.1 浏览器渲染原理

#### 7.1.1 渲染流水线

```
══════════════════════════════════════════════════════════
                  浏览器渲染流水线
══════════════════════════════════════════════════════════

  HTML ──→ [DOM Tree]
                          ──→ [Render Tree] ──→ [Layout] ──→ [Paint] ──→ [Composite]
  CSS  ──→ [CSSOM Tree]
                                                          ↑
                                              [JavaScript 可在此介入]
══════════════════════════════════════════════════════════
```

**各阶段详解：**

| 阶段       | 产物        | 说明                                     |
| ---------- | ----------- | ---------------------------------------- |
| Parse HTML | DOM Tree    | 解析 HTML 生成 DOM 树                    |
| Parse CSS  | CSSOM Tree  | 解析 CSS 生成 CSSOM 树                   |
| Style      | Render Tree | 合并 DOM + CSSOM，计算每个节点的最终样式 |
| Layout     | 布局信息    | 计算每个节点的几何位置和尺寸             |
| Paint      | 绘制指令    | 生成绘制指令（绘制顺序、图层）           |
| Composite  | 图层合成    | 将各图层合并为最终画面                   |

#### 7.1.2 关键渲染路径

```html
<!-- 关键渲染路径示例 -->
<!DOCTYPE html>
<html>
  <head>
    <!-- 1. CSS 是渲染阻塞资源 -->
    <link rel="stylesheet" href="style.css" />

    <!-- 2. 同步 JS 是解析阻塞资源 -->
    <script src="app.js"></script>

    <!-- 3. 异步 JS 不阻塞 -->
    <script src="analytics.js" async></script>
    <script src="vendor.js" defer></script>
  </head>
  <body>
    <!-- 内容 -->
  </body>
</html>
```

**渲染阻塞规则：**

1. CSS 阻塞渲染（Render Tree 需要 CSSOM）
2. 同步 JS 阻塞 HTML 解析（可能修改 DOM）
3. JS 需等待前序 CSS 加载完成（可能查询样式）

---

### 7.2 网络协议基础

#### 7.2.1 HTTP 请求完整生命周期

```
DNS 解析         查找域名对应的 IP 地址
    │
    ▼
TCP 连接         三次握手建立连接 (SYN → SYN-ACK → ACK)
    │
    ▼
TLS 握手         密钥交换 + 证书验证（HTTPS）
    │
    ▼
发送请求         浏览器发送 HTTP 请求
    │
    ▼
服务器处理        服务器处理请求、查询数据库等
    │
    ▼
接收响应         浏览器接收响应数据
    │
    ▼
TCP 关闭         四次挥手断开连接 (FIN → ACK → FIN → ACK)
```

#### 7.2.2 HTTP 各版本对比

| 特性       | HTTP/1.1   | HTTP/2           | HTTP/3 (QUIC)        |
| ---------- | ---------- | ---------------- | -------------------- |
| 传输层     | TCP        | TCP              | UDP                  |
| 多路复用   | ❌（串行） | ✅（流）         | ✅（流，无队头阻塞） |
| 头部压缩   | ❌         | HPACK            | QPACK                |
| 服务器推送 | ❌         | ✅               | ✅                   |
| 连接建立   | 1 RTT      | 1 RTT            | 0-RTT（恢复连接）    |
| 队头阻塞   | TCP 层     | TCP 层（流之间） | 无                   |

---

### 7.3 构建工具原理

#### 7.3.1 Webpack 核心流程

```
═══════════════════════════════════════════════
            Webpack 构建流程
═══════════════════════════════════════════════

  Entry ──→ Module Resolution ──→ Loader Pipeline
                │
                ▼
          Dependency Graph（依赖图）
                │
                ▼
          Module Concatenation（模块合并）
                │
                ▼
          Optimization（优化）
          ├── Tree Shaking
          ├── Code Splitting
          ├── Minification
          └── Scope Hoisting
                │
                ▼
          Output（输出文件）
═══════════════════════════════════════════════
```

**性能瓶颈定位：**

```bash
# Webpack 构建速度分析
npx webpack --profile --json > stats.json
# 在 https://webpack.github.io/analyse/ 上传分析

# 或使用 speed-measure-webpack-plugin
npm install speed-measure-webpack-plugin -D
```

```javascript
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin')
const smp = new SpeedMeasurePlugin()
module.exports = smp.wrap(webpackConfig)
```

---

#### 7.3.2 Vite 核心原理

```
═══════════════════════════════════════════════
              Vite 开发 vs 构建
═══════════════════════════════════════════════

  开发模式（Dev）:
  Native ESM ──→ 按需编译 ──→ esbuild 预构建依赖
  （秒级冷启动，HMR 极快）

  生产构建（Build）:
  Rollup ──→ Tree Shaking ──→ Code Splitting ──→ 压缩
  （与开发共享 esbuild 的预构建缓存）
═══════════════════════════════════════════════
```

**Vite 为什么快：**

1. 开发时使用 Native ESM，按需编译，不打包
2. esbuild 预构建依赖（Go 编写，比 JS 快 10-100 倍）
3. HMR 基于 ESM，只更新变动模块
4. 生产构建使用 Rollup，成熟的 Tree Shaking 和代码分割

---

## 附录：优化清单速查

### 首屏优化检查清单

- [ ] CDN 部署静态资源
- [ ] 启用 Gzip/Brotli 压缩
- [ ] HTTP/2 或 HTTP/3
- [ ] 关键 CSS 内联，非关键 CSS 异步加载
- [ ] JS 使用 `defer` 或 `async`
- [ ] 路由懒加载
- [ ] 图片使用 WebP/AVIF 格式
- [ ] 图片设置 `width`/`height` 防止 CLS
- [ ] 图片懒加载
- [ ] 字体 `font-display: swap` + preload
- [ ] 第三方库按需引入
- [ ] 骨架屏或 Loading 动画
- [ ] DNS Prefetch / Preconnect 关键域名
- [ ] Preload 关键资源
- [ ] 合理设置缓存策略
- [ ] Service Worker 离线缓存
- [ ] 长任务拆分
- [ ] Webpack/Vite 构建优化

### 性能分析检查清单

- [ ] Chrome DevTools Performance 面板分析
- [ ] Chrome DevTools Network 面板分析
- [ ] Lighthouse 报告（本地 + PageSpeed Insights）
- [ ] WebPageTest 多地域测试
- [ ] Bundle 体积分析（webpack-bundle-analyzer）
- [ ] Code Coverage 代码覆盖率检查
- [ ] Memory 面板内存泄漏排查
- [ ] Performance API 关键指标打点
- [ ] RUM 真实用户数据收集
- [ ] CI/CD 性能回归检测

---

> **参考资源：**
>
> - [Web Vitals 官方文档](https://web.dev/vitals/)
> - [Chrome DevTools 性能分析文档](https://developer.chrome.com/docs/devtools/performance/)
> - [Lighthouse 性能审计](https://developer.chrome.com/docs/lighthouse/)
> - [WebPageTest 文档](https://docs.webpagetest.org/)
> - [webpack 构建性能](https://webpack.js.org/guides/build-performance/)
> - [Vite 构建优化](https://vitejs.dev/guide/build.html)
