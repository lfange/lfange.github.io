---
title: 前端高频面试题
icon: article
category:
  - 前端
  - 面试
tag:
  - Interview
  - 前端
---

# 前端高频面试题

> 覆盖 HTML/CSS、JavaScript 进阶、浏览器与 HTTP、Vue/React、性能优化、工程化的高频面试题。JS 基础（作用域/闭包/原型链/事件模型）见 [Interviewer Series](./README.md)，手写题见 [Code](./interCode.md)。本文每题给核心答案，不展开冗长论述。

---

## 一、HTML / CSS

### 1.1 HTML 语义化

用合适的标签表达内容结构（`header/nav/main/article/section/aside/footer`），而非全用 div。

好处：利于 SEO（爬虫理解）、无障碍访问（屏幕阅读器）、代码可读性、便于维护。

### 1.2 盒模型

- **标准盒模型**（`box-sizing: content-box`，默认）：`width = content`，总宽 = content + padding + border + margin。
- **IE 盒模型**（`box-sizing: border-box`，推荐）：`width = content + padding + border`，总宽 = width + margin。

```css
* { box-sizing: border-box; }   /* 全局推荐 */
```

### 1.3 BFC（块级格式化上下文）

BFC 是一个独立的渲染区域，内部元素不影响外部。

**触发条件**：

- `float` 不为 `none`。
- `position: absolute/fixed`。
- `display: inline-block/table-cell/flex/grid/flow-root`。
- `overflow` 不为 `visible`（如 `hidden/auto`）。

**作用**：

1. 清除浮动（父元素 `overflow: hidden` 或 `display: flow-root`）。
2. 阻止 margin 重叠（同 BFC 内相邻块才重叠）。
3. 阻止元素被浮动元素覆盖（实现两栏布局）。

### 1.4 元素水平垂直居中

```css
/* 1. Flex（最常用） */
.parent { display: flex; justify-content: center; align-items: center; }

/* 2. Grid */
.parent { display: grid; place-items: center; }

/* 3. 绝对定位 + transform（未知宽高） */
.child { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }

/* 4. 绝对定位 + margin auto（已知宽高） */
.child { position: absolute; inset: 0; margin: auto; }
```

### 1.5 CSS 选择器优先级

`!important > 内联 > ID > 类/伪类/属性 > 标签/伪元素 > 通配符`。

权重计算：`(a, b, c, d)` = (内联, ID, 类, 标签)。同权重后写覆盖前写。

### 1.6 重绘与重排（回流）

- **重排（Reflow）**：元素几何属性（宽高、位置）变化，重新计算布局。代价大。
- **重绘（Repaint）**：外观属性（颜色、背景）变化，重新绘制。代价小。

重排一定触发重绘，重绘不一定触发重排。优化：用 `transform`/`opacity`（合成层，不触发重排）、批量修改 DOM、`will-change`、避免逐条改样式。

### 1.7 Flex 布局

容器属性：`flex-direction` / `justify-content`（主轴）/ `align-items`（交叉轴）/ `flex-wrap` / `align-content`。

项目属性：`flex: 1`（= `flex-grow:1; flex-shrink:1; flex-basis:0%`）/ `order` / `align-self`。

### 1.8 响应式方案

- **媒体查询** `@media (max-width: 768px) { ... }`。
- **rem / vw / vh / %** 弹性单位。
- **Flex / Grid** 弹性布局。
- 移动端 `viewport` meta：`<meta name="viewport" content="width=device-width, initial-scale=1">`。

### 1.9 CSS3 新特性

圆角、阴影、渐变、`transform`、`transition`、`animation`、`flex`、`grid`、媒体查询、自定义属性（`--var`）。

---

## 二、JavaScript 进阶

### 2.1 数据类型

- **基本类型**（7）：`number string boolean null undefined symbol bigint`，存栈，按值传递。
- **引用类型**（1）：`object`（含 Array/Function/Date/RegExp/Map/Set），存堆，按引用传递。

`typeof` 判基本（null 除外），`instanceof` 判引用，`Object.prototype.toString.call()` 最准。

### 2.2 == vs ===

- `==` 比较前**类型转换**：`null == undefined` 为 true，`'' == 0` 为 true，`'1' == 1` 为 true。
- `===` 不转换，类型不同直接 false。

**永远用 `===`**，除了 `x == null`（同时判断 null 和 undefined）。

### 2.3 this 指向

| 调用方式 | this |
|----------|------|
| 普通函数 | window（严格模式 undefined）|
| 对象方法 | 调用对象 |
| 构造函数 | 新实例 |
| `call/apply/bind` | 指定的对象 |
| 箭头函数 | 定义时外层 this（不可改）|

```js
const obj = {
  a: 1,
  fn() { console.log(this.a) },          // 1
  arrow: () => console.log(this.a),      // undefined（外层是全局）
}
const f = obj.fn; f()   // undefined（丢失 this）
```

### 2.4 call / apply / bind 区别

- `call(this, arg1, arg2)`：立即调用，参数逐个传。
- `apply(this, [args])`：立即调用，参数数组传。
- `bind(this, args)`：不立即调用，返回绑定了 this 的新函数。

### 2.5 闭包应用与内存泄漏

闭包：函数访问其词法作用域外的变量。应用：模块化（私有变量）、柯里化、防抖节流、回调保存状态。

泄漏：闭包持有不再需要的引用（如 DOM 元素移除后闭包仍引用）。解决：置 `null`、用 `WeakMap/WeakSet`。

### 2.6 原型链与继承

见 [README 原型链](./README.md#原型与原型链)。继承演进：

- **原型链继承**：`Child.prototype = new Parent()`，缺点：共享引用属性、无法传参。
- **构造函数继承**：`Parent.call(this)`，缺点：拿不到原型方法。
- **组合继承**：两者结合，最常用（但调了两次 Parent）。
- **寄生组合继承**：`Child.prototype = Object.create(Parent.prototype)`，最优。
- **ES6 class**：`extends` + `super`，语法糖，本质寄生组合。

### 2.7 Promise

三种状态：`pending -> fulfilled / rejected`，不可逆。

```js
new Promise((resolve, reject) => { ... })
  .then(onFulfilled, onRejected)
  .catch(err => {})    // = then(null, onRejected)
  .finally(() => {})

Promise.all([p1, p2])        // 全成功才成功，一个失败即失败
Promise.allSettled([p1, p2]) // 全部完成（无论成败）
Promise.race([p1, p2])       // 第一个完成（成功或失败）
Promise.any([p1, p2])        // 第一个成功
```

### 2.8 async/await

`async` 函数返回 Promise，`await` 暂停执行等 Promise 完成。是 Generator + Promise 的语法糖。

```js
async function fetchAll() {
  try {
    const [a, b] = await Promise.all([fetchA(), fetchB()])
    return { a, b }
  } catch (e) { console.error(e) }
}
```

**坑**：串行 `await` 慢，并发用 `Promise.all`；`await` 错误要用 `try/catch`。

### 2.9 事件循环（Event Loop）

JS 单线程，靠事件循环处理异步。

- **宏任务**：script、setTimeout、setInterval、I/O、UI 事件、postMessage。
- **微任务**：Promise.then/catch/finally、queueMicrotask、MutationObserver、async/await 后续。

执行顺序：**同步代码 -> 微任务队列清空 -> 一个宏任务 -> 微任务清空 -> 宏任务...**

```js
console.log(1)
setTimeout(() => console.log(2))
Promise.resolve().then(() => console.log(3))
console.log(4)
// 输出：1 4 3 2
```

### 2.10 浏览器与 Node 事件循环差异

- 浏览器：每轮执行一个宏任务后清空所有微任务。
- Node（11 前）：每轮阶段执行完该阶段所有宏任务才清微任务；Node 11+ 对齐浏览器（单个宏任务后清微任务）。
- Node 有阶段（timers/poll/check 等）和 `process.nextTick`（优先级高于微任务）。

### 2.11 深拷贝与浅拷贝

- 浅拷贝：`Object.assign`、展开 `{...obj}`、`Array.from`、`slice`，只拷一层。
- 深拷贝：
  - `structuredClone(obj)`（推荐，原生，支持循环引用、Date，不支持函数）。
  - `JSON.parse(JSON.stringify(obj))`（简单，但丢函数/undefined/Date/Symbol，不支持循环引用）。
  - 手写递归（处理循环引用用 WeakMap）。

### 2.12 模块化

| 规范 | 用法 | 特点 |
|------|------|------|
| CommonJS | `require/module.exports` | 同步、运行时加载、值为拷贝 |
| ES Module | `import/export` | 异步、编译时确定、值为引用（动态绑定）、支持 tree-shaking |

ESM 是标准，CommonJS 用于 Node 兼容。ESM 支持 `import()` 动态导入。

### 2.13 ES6+ 高频

- `let/const`：块级作用域、暂存性死区（TDZ）、不可重复声明。
- 箭头函数：无自己的 this/arguments/prototype，不能 new。
- 解构默认值、剩余参数 `...args`。
- `Set`（去重）、`Map`（任意键）、`WeakMap/WeakSet`（弱引用，键只能是对象，不阻止 GC）。
- `Proxy/Reflect`：Vue 3 响应式基础，拦截对象操作。
- `Symbol`：唯一、作私有键、内置 Symbol（`Symbol.iterator`）。
- `Iterator/Generator`：可迭代协议，`for...of` 基础。
- 可选链 `?.`、空值合并 `??`、`??=`、`||=`、`&&=`。

---

## 三、浏览器与 HTTP

### 3.1 强缓存与协商缓存

| 类型 | 机制 | 字段 |
|------|------|------|
| **强缓存** | 不请求，直接用本地 | `Cache-Control: max-age=N`（优先）/ `Expires`（旧）|
| **协商缓存** | 请求服务器验证 | `Last-Modified/If-Modified-Since`、`ETag/If-None-Match` |

流程：先强缓存，过期后协商缓存（返回 304 用本地，200 返回新资源）。

`Cache-Control`：`max-age`、`no-cache`（协商）、`no-store`（不缓存）、`public/private`、`immutable`。

### 3.2 跨域及解决方案

**同源策略**：协议、域名、端口三者相同才同源，跨域限制 AJAX、DOM、Cookie。

解决方案：

1. **CORS**（推荐）：服务端设 `Access-Control-Allow-Origin`。复杂请求先发 OPTIONS 预检。
2. **代理**：开发用 webpack/vite proxy，生产用 Nginx 反代。同源请求到代理，代理转发。
3. **JSONP**：仅 GET，利用 `<script>` 不受同源限制，已过时。
4. `postMessage`：跨窗口通信。
5. WebSocket 不受同源限制。

### 3.3 Cookie / Session / Token / JWT

- **Cookie**：浏览器存储，随请求自动带，有大小限制（4KB）、域名限制。可设 `HttpOnly`（防 XSS）、`Secure`、`SameSite`（防 CSRF）。
- **Session**：服务端存储会话，靠 Cookie 中的 sessionId 关联。
- **Token**：服务端无状态，签发 token 给前端，前端请求头携带（`Authorization: Bearer xxx`）。
- **JWT**：自包含的 token（Header.Payload.Signature），服务端用密钥验签，无需查库。缺点：签发后难主动失效。

### 3.4 HTTP 状态码

| 类别 | 含义 | 常见 |
|------|------|------|
| 1xx | 信息 | 101 WebSocket |
| 2xx | 成功 | 200、201、204 |
| 3xx | 重定向 | 301 永久、302 临时、304 协商缓存 |
| 4xx | 客户端错 | 400、401 未认证、403 无权限、404、413、429 限流 |
| 5xx | 服务端错 | 500、502 网关、503 不可用、504 超时 |

### 3.5 HTTP / HTTPS / HTTP2 / HTTP3

- **HTTP**：明文，端口 80。
- **HTTPS**：HTTP + TLS/SSL，加密传输，端口 443。对称加密（数据）+ 非对称加密（交换密钥）+ 证书（防中间人）。
- **HTTP2**：二进制分帧、多路复用（一个连接并发多请求）、头部压缩（HPACK）、服务端推送。
- **HTTP3**：基于 QUIC（UDP），解决队头阻塞，0-RTT 连接。

### 3.6 TCP 三次握手 / 四次挥手

- **三次握手**（建连）：SYN -> SYN+ACK -> ACK。为什么三次：确认双方收发能力，防止历史连接。
- **四次挥手**（断连）：FIN -> ACK -> FIN -> ACK。为什么四次：服务端收到 FIN 后可能还有数据要发，先 ACK 再单独 FIN。

### 3.7 从输入 URL 到页面渲染

1. DNS 解析域名 -> IP（递归查询，浏览器/系统/路由器/ISP 缓存）。
2. TCP 三次握手（HTTPS 还有 TLS 握手）。
3. 发送 HTTP 请求。
4. 服务器处理返回响应。
5. 浏览器解析：构建 DOM（HTML）-> 构建 CSSOM（CSS）-> 合成 Render Tree -> Layout 布局 -> Paint 绘制 -> Composite 合成。
6. JS 阻塞 DOM 解析（除非 async/defer）。

### 3.8 存储

| 方式 | 大小 | 生命周期 | 作用域 |
|------|------|----------|--------|
| Cookie | 4KB | 可设过期 | 同源+路径 |
| localStorage | 5~10MB | 永久 | 同源 |
| sessionStorage | 5~10MB | 关闭标签 | 同源+同标签 |
| IndexedDB | 大 | 永久 | 同源，异步，可索引 |

### 3.9 XSS / CSRF

- **XSS（跨站脚本）**：注入恶意脚本执行。防：输入过滤、输出转义、`HttpOnly` Cookie、CSP。
- **CSRF（跨站请求伪造）**：冒用用户身份发请求。防：`SameSite` Cookie、CSRF Token、Referer 校验。

---

## 四、Vue

### 4.1 生命周期

Vue2：`beforeCreate/created/beforeMount/mounted/beforeUpdate/updated/beforeDestroy/destroyed`。

Vue3：`setup`（最早）-> `onBeforeMount/onMounted/onBeforeUpdate/onUpdated/onBeforeUnmount/onUnmounted`。

父子的挂载顺序：父 beforeMount -> 子 beforeMount -> 子 mounted -> 父 mounted。

### 4.2 响应式原理

- **Vue2**：`Object.defineProperty` 劫持 getter/setter，数组改 7 个方法。缺点：无法监听新增属性（要 `Vue.set`）、无法监听数组索引/length、深度监听一次性递归性能差。
- **Vue3**：`Proxy` 代理整个对象，配合 `Reflect`。优点：能监听新增/删除、数组、Map/Set，惰性响应式（访问才递归），性能更好。

### 4.3 虚拟 DOM 与 diff

虚拟 DOM：用 JS 对象描述真实 DOM，先 diff 再最小化更新。

diff 策略：

- 同层比较，跨层不复用。
- **Vue2**：双端比较（头头、尾尾、头尾、尾头）。
- **Vue3**：最长递增子序列（LIS）算法，减少移动。
- **React**：单向从左到右，配合 Fiber 可中断。

### 4.4 key 的作用

diff 时用 key 标识节点，复用同 key 节点。**不用 index**：列表顺序变化（插入/删除）会导致 key 错位，错误复用，引发 bug（如表单状态串）。不用 key 默认按 index，性能差且可能错。

### 4.5 组件通信

- 父子：props / `$emit`、`ref`。
- 兄弟：状态提升、事件总线（Vue3 用 mitt）、Vuex/Pinia。
- 跨层：`provide/inject`。
- 任意：状态管理（Pinia）。

### 4.6 computed vs watch

- `computed`：计算属性，有缓存，依赖不变不重算，必须有返回值。
- `watch`：监听值变化执行副作用，可异步。`watchEffect`：自动收集依赖，立即执行。

### 4.7 nextTick

数据变化后 DOM 异步更新，`nextTick` 在 DOM 更新后执行回调（基于 Promise.then）。

### 4.8 keep-alive

缓存不活动的组件实例，保留状态。属性 `include/exclude/max`。生命周期 `activated/deactivated`。原理：LRU 缓存 + 抽离为 `vnode` 不销毁。

### 4.9 Vue3 其他高频

- `Composition API`：逻辑复用聚合，替代 mixin（命名冲突、来源不清）。
- `<script setup>`：编译宏，更简洁。
- `Teleport`：传送 DOM 到指定位置（弹窗）。
- `Fragment`：多根节点。
- `Suspense`：异步组件加载态。

---

## 五、React

### 5.1 生命周期 / Hooks

类组件：`mount（constructor/render/DidMount）/ update（ShouldUpdate/render/DidUpdate）/ unmount（WillUnmount）`。

函数组件用 Hooks：

- `useState`：状态。
- `useEffect`：副作用（didMount + didUpdate + willUnmount）。
- `useMemo`：缓存计算值。
- `useCallback`：缓存函数。
- `useRef`：跨渲染保持引用，访问 DOM。
- `useContext`：消费 context。
- `useReducer`：复杂状态。

### 5.2 setState 是同步还是异步

React 18 前：合成事件/生命周期中"异步"（批量更新），原生事件/定时器中同步。React 18+：全部自动批量（Automatic Batching）。

本质：setState 本身同步执行，但 React 把更新放入队列异步合并，表现为"异步"。

### 5.3 Fiber

React 16 架构，把渲染拆成可中断的小任务单元（Fiber 节点），利用空闲时间分片执行，避免长任务阻塞交互。支持 Concurrent 模式。

### 5.4 React diff

同层比较 + `key` 标识。三个假设：同层、类型不同直接替换、key 标识。Vue/React 都靠 key 提升复用。

### 5.5 性能优化

`React.memo`（组件 memo）、`useMemo/useCallback`、`key`、虚拟列表、`useTransition`（18+，降低更新优先级）。

---

## 六、性能优化

### 6.1 防抖与节流

- **防抖（debounce）**：事件停止触发 N 秒后执行一次。场景：搜索输入、窗口 resize。
- **节流（throttle）**：N 秒内只执行一次。场景：滚动、按钮防连点。

```js
// 防抖
function debounce(fn, delay) {
  let timer
  return function (...args) {
    clearTimeout(timer)
    timer = setTimeout(() => fn.apply(this, args), delay)
  }
}
// 节流
function throttle(fn, delay) {
  let last = 0
  return function (...args) {
    const now = Date.now()
    if (now - last >= delay) { last = now; fn.apply(this, args) }
  }
}
```

### 6.2 首屏优化

- 路由懒加载（`import()`）、组件按需加载。
- 资源压缩（gzip/brotli）、代码分割。
- 图片优化（WebP/AVIF、懒加载、响应式 `srcset`、CDN）。
- 关键 CSS 内联、预加载 `preload`、预连接 `preconnect`。
- SSR / 首屏骨架屏。
- HTTP2 多路复用、缓存策略。

### 6.3 打包优化

- Tree Shaking（ESM 静态分析，删未用代码）。
- Code Splitting（SplitChunks、动态 import）。
- 依赖按需引入（lodash-es、moment -> dayjs）。
- 持久化缓存（contenthash）。
- Scope Hoisting（webpack，减少闭包）。

### 6.4 渲染优化

减少重排重绘、用 `transform`/`opacity` 做动画、`will-change`、虚拟列表（长列表）、`requestAnimationFrame`、避免布局抖动（强制同步布局）。

---

## 七、工程化

### 7.1 Webpack vs Vite

| 维度 | Webpack | Vite |
|------|---------|------|
| 开发启动 | 全量打包后启动，慢 | 原生 ESM 按需加载，秒级启动 |
| 热更新 | 重新构建受影响模块 | 精准模块热替换，极快 |
| 构建 | 自带打包 | 用 Rollup 打包 |
| 生态 | 最全 | 趋于成熟 |

### 7.2 Loader 与 Plugin

- **Loader**：转换文件内容（链式，从右到左）。如 `babel-loader`、`css-loader`、`file-loader`。
- **Plugin**：扩展构建流程（事件钩子）。如 `HtmlWebpackPlugin`、`DefinePlugin`、`MiniCssExtractPlugin`。

### 7.3 Tree Shaking 原理

基于 ESM 静态结构，编译时分析哪些 export 未被 import，标记删除。要求：ESM、`mode: production`、`sideEffects: false`（package.json）。

### 7.4 Source Map

源码到构建产物的映射，便于调试定位。`devtool` 选项：`eval-cheap-module-source-map`（开发）、`hidden-source-map`/`nosources-source-map`（生产，不暴露源码）。

### 7.5 Babel

JS 编译器：解析（Parse）-> 转换（Transform，靠插件/preset）-> 生成（Generate）。`@babel/preset-env` 按目标环境转译语法，`polyfill` 补运行时 API（`core-js`）。

---

## 八、其他高频

### 8.1 前端安全

XSS、CSRF（见 3.9）、点击劫持（`X-Frame-Options`）、中间人攻击（HTTPS）、依赖漏洞（`npm audit`）。

### 8.2 前端监控

- 性能：`PerformanceObserver`、Web Vitals（LCP/FID/CLS/INP）。
- 错误：`window.onerror`、`unhandledrejection`、`error` 事件（资源）、try/catch。
- 行为：埋点（PV/UV/点击）。
- 上报：`navigator.sendBeacon`（页面卸载也可靠）。

### 8.3 单页应用路由

- **Hash 路由**：`#/path`，`hashchange` 事件，兼容好但不美观。
- **History 路由**：`pushState/replaceState` + `popstate`，需服务端配置回退到 index.html（Nginx `try_files`）。

### 8.4 微前端

将多个独立前端应用整合为一个。方案：qiankun（基于 single-spa）、Module Federation（webpack5）、iframe、Web Components。解决巨石应用、独立部署、技术栈无关。

---

## 九、速记表

| 高频 | 一句话 |
|------|--------|
| 事件循环 | 同步 -> 微任务清空 -> 一个宏任务 -> 循环 |
| 缓存 | 强缓存不请求，协商缓存 304 |
| 跨域 | CORS / 代理 / JSONP |
| this | 谁调用指谁，箭头看定义 |
| Promise | 三态不可逆，微任务 |
| 虚拟 DOM diff | 同层比较 + key 复用 |
| Vue3 响应式 | Proxy 替代 defineProperty |
| 防抖节流 | 防抖停了才执行，节流定时执行一次 |
| Tree Shaking | ESM 静态分析删死代码 |
| HTTP2 | 多路复用 + 头部压缩 + 二进制 |

> 配套：[JS 基础面试](./README.md) · [手写题](./interCode.md)
