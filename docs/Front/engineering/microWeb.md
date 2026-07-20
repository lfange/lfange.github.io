---
icon: article
category:
  - microWeb

tag:
  - Interview
---

# 微前端框架对比

**MicroApp** 是京东开源的一款微前端框架。它最核心的创新点在于：**用 WebComponent 的组件化思维来实现微前端**。

相比于传统的微前端框架（如 single-spa、qiankun），MicroApp 把复杂的“应用”包装成了一个简单的“自定义 HTML 标签”（Custom Element），让你可以像写组件一样去加载子应用。

下面为你深度拆解 MicroApp 的实现原理，并将其与其他主流微前端方案（qiankun、EMP/Module Federation、wujie）进行横向对比。

---

## 一、 MicroApp 的核心实现原理

MicroApp 的底层逻辑可以概括为：**WebComponent 容器 + 元素影子化（Shadow DOM 概念） + 运行时劫持**。

### 1. 声明式组件化（Custom Elements）

MicroApp 内部通过 `window.customElements.define` 注册了一个自定义元素（比如 `<micro-app>`）。

- **加载机制：** 当主应用在页面中渲染出 `<micro-app name="app1" url="..."></micro-app>` 时，由于浏览器的原生特性，会触发该自定义元素的生命周期钩子（`connectedCallback`）。
- **Fetch 资源：** 在钩子函数中，MicroApp 会自动去 `url` 地址请求子应用的 HTML 页面。

### 2. 元素影子化与 HTML 解析（HTMLES）

收到子应用的 HTML 字符串后，MicroApp 并没有像传统的 `iframe` 那样直接塞进去，而是通过自定义的解析器：

- **提取资源：** 过滤出其中的 `<style>`、`<script>` 和 `<body>`。
- **DOM 隔离：** 将子应用的 DOM 结构塞进 `<micro-app>` 标签内部。虽然它没有直接使用原生的 Shadow DOM（因为原生 Shadow DOM 有很多踩不完的坑，比如 React 事件冒泡失效、弹窗挂载问题），但它通过拦截、代理，在逻辑上实现了一个“类 Shadow DOM”的隔离沙箱。

### 3. 沙箱隔离（Sandbox）

为了防止子应用污染全局的 `window`、样式和事件，MicroApp 做了两层隔离：

- **JS 沙箱（Proxy Window）：** 为每个子应用创建一个虚拟的 `Proxy(window)`。子应用在执行时，所有的全局变量读写、事件监听（如 `window.addEventListener`）都会被拦截并绑定到这个代理对象上。当子应用卸载时，直接销毁该代理，实现零污染。
- **样式隔离（Scoped CSS）：** 默认通过重写 CSS 选择器来实现隔离。例如子应用里写了 `.btn { color: red; }`，MicroApp 在将其插入页面前，会动态改写为 `micro-app[name=app1] .btn { color: red; }`。这样就保证了样式绝不外泄。

---

```js
// main.js - 入口文件初始化
import microApp from '@micro-zoe/micro-app'
microApp.start()
```

```vue
<template>
  <div>
    <h1>主应用控制台</h1>
    <micro-app
      name="my-sub-app"
      url="http://localhost:3000/"
      baseroute="/my-sub-app"
      class="micro-app-container"
      disableSandbox
      keep-alive
    ></micro-app>
  </div>
</template>
```

## 二、 与主流微前端框架的对比原理

目前前端领域常见的微前端/模块化方案主要有 **qiankun(single-spa)**、**Emp(Webpack Module Federation)** 和 **wujie(微前端新秀)**。

### 1. qiankun (基于 single-spa)

- **实现原理：** 路由分发式。主应用监听路由变化（劫持了 `hashchange` 和 `popstate`），当路由命中规则时，通过 `import-html-entry` 异步加载子应用的 HTML，解析出 JS 和 CSS，然后手动调用子应用暴露出来的生命周期函数（`bootstrap`、`mount`、`unmount`）进行渲染。
- **与 MicroApp 对比：**
- **侵入性：** qiankun 的侵入性较强。子应用必须打包成 UMD 格式，且必须暴露出指定的生命周期钩子；而 MicroApp 几乎是零侵入，子应用不需要改动任何代码。
- **使用体验：** qiankun 是配置驱动/路由驱动的；MicroApp 是组件驱动的（直接写组件标签即可）。

#### 主应用 (Main App)

```js
// main.js - 注册并启动
import { registerMicroApps, start } from 'qiankun'

registerMicroApps([
  {
    name: 'vue-app',
    entry: '//localhost:8080',
    container: '#sub-container', // 子应用挂载的容器 DOM 节点
    activeRule: '/app-vue', // 命中该路由时加载
  },
])

start()
```

```vue
<template>
  <div id="layout">
    <div id="sub-container"></div>
  </div>
</template>
```

#### 子应用 (Sub App)

子应用（以 Vue 为例）需要修改入口文件，导出 bootstrap、mount、unmount 三个生命周期：

```js
// main.js (子应用)
let instance = null

function render(props = {}) {
  const { container } = props
  instance = new Vue({
    render: (h) => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app')
}

// 独立运行时直接渲染
if (!window.__POWERED_BY_QIANKUN__) {
  render()
}

// 导出 qiankun 要求的生命周期
export async function bootstrap() {}
export async function mount(props) {
  render(props)
}
export async function unmount() {
  instance.$destroy()
}
```

### 2. EMP / Module Federation (模块联邦)

- **实现原理：** 构建时/运行时去中心化共享。它是 Webpack 5（及 Vite 插件）提供的能力，允许一个独立的构建应用在运行时动态地加载另一个应用暴露出来的组件或模块。它不是纯粹的“容器式”微前端，而是**代码级别的共享和动态组装**。
- **与 MicroApp 对比：**
- **隔离性：** Module Federation **完全没有沙箱隔离**。所有的 JS 都在同一个全局上下文运行，CSS 也是全剧污染。它信任所有的子模块。
- **技术栈限制：** 需要构建工具（如 Webpack 5 或 Vite）的支持，对老旧项目或者非打包工具项目不友好；而 MicroApp 是运行时的容器，无视子应用是用什么打包的。

模块联邦是 Webpack 5 / Vite 配置层面的联动。它不需要主应用充当“外壳容器”，而是应用 A 直接引用应用 B 的远程组件。

假设应用 B（Remote） 要把自己的 Button 组件共享给应用 A（Host）。

应用 B (Remote 端 - 提供者) 修改 webpack.config.js：

```js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app_remote', // 自身应用名
      filename: 'remoteEntry.js', // 导出的清单文件名
      exposes: {
        './Button': './src/components/Button.vue', // 暴露出具体组件
      },
      shared: ['vue'], // 共享依赖，避免重复加载
    }),
  ],
}
```

应用 A (Host 端 - 消费者) 修改 webpack.config.js 引入远程应用：

```js
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin')

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'app_host',
      remotes: {
        // 声明远程引用的别名和地址
        app_remote: 'app_remote@http://localhost:3002/remoteEntry.js',
      },
      shared: ['vue'],
    }),
  ],
}
```

在应用 A 的代码中直接消费：

```vue
<template>
  <div>
    <h1>我是 Host 主应用</h1>
    <RemoteButton />
  </div>
</template>

<script>
  export default {
    components: {
      // 语法：别名/exposes的key
      RemoteButton: () => import('app_remote/Button'),
    },
  }
</script>
```

### 3. wujie (无界)

- **实现原理：** WebComponent + iframe。无界提出了一个极其绝妙的方案：**把子应用的 DOM 结构放在 WebComponent 里面（解决样式隔离和渲染），而把子应用的 JS 代码放在一个隐藏的、纯净的 iframe 里面运行（解决 JS 隔离）。** 通过 `Proxy` 将 iframe 里的 JS 运行结果映射到 WebComponent 的 DOM 上。
- **与 MicroApp 对比：**
- **JS 沙箱隔离度：** 无界利用了原生的 `iframe`，其 JS 隔离性极其恐怖（接近 100% 完美隔离），甚至不需要像 MicroApp 那样用 Proxy 去一行行拦截 window 属性，彻底解决了像 `window.location` 这种 Proxy 很难完美拦截的死角。
- **性能与体验：** 两者由于都采用了 WebComponent 容器，体验上都很像组件化开发。无界在处理极度复杂的全局变量污染时可能更胜一筹。

#### 主应用 (Main App)

```js
// main.js
import WujieVue from 'wujie-vue2' // 或 wujie-vue3
Vue.use(WujieVue)
```

```vue
<template>
  <div>
    <h2>主应用</h2>
    <WujieVue
      width="100%"
      height="100%"
      name="angular-sub"
      class="WujieVue-app-container"
      url="http://localhost:4200/"
      :sync="true"
    ></WujieVue>
  </div>
</template>
```

## 三、 综合横向对比表

| 维度 | MicroApp | qiankun (single-spa) | wujie (无界) | Module Federation |
| --- | --- | --- | --- | --- |
| **核心机制** | WebComponent 容器 + 路由监听 | 路由劫持 + 生命周期钩子 | WebComponent + iframe 沙箱 | 构建工具联动的动态模块加载 |
| **子应用改造成本** | **极低** (基本零改造) | **中等** (需导出生命周期、打包 UMD) | **极低** (基本零改造) | **高** (需改造构建配置和导出) |
| **JS 沙箱隔离** | Proxy 代理沙箱 | Proxy 快照沙箱 | **原生 iframe 隔离** (最彻底) | **无** (共享全局全局) |
| **CSS 样式隔离** | 动态改写 CSS 选择器 (Scoped) | Shadow DOM / 运行时作用域 | **原生 WebComponent 隔离** | **无** (需靠规范/CSS Modules) |
| **接入方式** | 声明式组件 (`<micro-app>`) | 编程式 API 配置 | 声明式组件 (`<WujieVue>`) | `import('remote/button')` 异步引入 |
| **适用场景** | 跨技术栈大中型前台系统、老旧项目改造 | 规整的、有统一规范的前端矩阵系统 | 追求极高沙箱隔离度、跨技术栈的复杂系统 | 去中心化、强性能要求的组件/业务模块共享 |

## 总结

- **MicroApp** 最大的优势在于“好用、直观”。它用 WebComponent 讲了一个非常符合前端直觉的故事——大应用套小应用，就像写 `<img src="...">` 一样简单。
- 如果你追求**开发体验、极致的低侵入性**，MicroApp 和 wujie 是现在的首选。
- 如果你的项目需要**共享底层的代码、依赖，对性能要求极高，且团队有统一的技术栈和工具链**，Module Federation 是更好的现代解法。
