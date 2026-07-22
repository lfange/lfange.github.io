---
title: uniapp 常见面试题
icon: article
category:
  - 前端
  - 面试
tag:
  - Interview
  - uniapp
---

# uniapp 常见面试题

> 覆盖 uniapp 跨端原理、目录配置、生命周期、条件编译、样式、平台差异、小程序双线程、登录支付、分包优化、nvue 与常见坑。

---

## 一、基础概念

### 1.1 uniapp 是什么

uniapp 是 DCloud 推出的**一次开发、多端覆盖**框架，基于 Vue.js，一套代码可编译到 H5、各小程序（微信/支付宝/百度/字节等）、App（iOS/Android）。

核心价值：降低多端开发成本，复用业务逻辑与大部分 UI。

### 1.2 跨端原理

uniapp 用**条件编译 + 编译器 + 运行时**实现跨端：

- **编译器**：把 `.vue` 源码按目标平台编译成对应代码（H5 编译成 web、小程序编译成 wxml/wxss/js、App 走原生或 webview）。
- **运行时**：`uni.*` API 是各端原生 API 的统一封装，内部按平台分发。
- **条件编译**：用注释 `#ifdef` 处理平台差异代码。

```
.vue 源码 -> 编译器 -> [H5 / 小程序 / App] 各端代码
```

### 1.3 与 Vue 的关系

uniapp 基于 Vue：

- Vue2 版本（旧）。
- **Vue3 版本**（推荐，`@dcloudio/uni-app`，Composition API、性能更好）。
- **uni-app x（uvue）**：编译到 App 原生（Kotlin/Swift），性能接近原生，DSL 是 Vue3 子集。

### 1.4 uniapp vs 原生小程序 vs Taro

| 维度 | uniapp | 原生小程序 | Taro |
|------|--------|-----------|------|
| 语法 | Vue | 小程序原生 | React/Vue（编译型）|
| 多端 | H5/小程序/App | 仅小程序 | H5/小程序/RN |
| 生态 | uni-ui 丰富 | 原生 | 多端 React 生态 |
| 学习 | Vue 开发者友好 | 需学小程序语法 | React 开发者友好 |

---

## 二、目录结构与配置

### 2.1 目录结构

```
├── pages/            # 页面
├── static/           # 静态资源（不编译）
├── components/       # 组件
├── store/            # 状态管理
├── utils/            # 工具
├── App.vue           # 应用根组件
├── main.js           # 入口
├── pages.json        # 页面路由/样式配置
├── manifest.json     # 应用配置（appid、各平台）
└── uni.scss          # 全局样式变量
```

### 2.2 pages.json

页面路由、窗口样式、tabBar 的核心配置。

```json
{
  "pages": [
    { "path": "pages/index/index", "style": { "navigationBarTitleText": "首页" } }
  ],
  "globalStyle": {
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "App"
  },
  "tabBar": {
    "list": [
      { "pagePath": "pages/index/index", "text": "首页", "iconPath": "...", "selectedIconPath": "..." }
    ]
  },
  "subPackages": []   // 分包
}
```

**注意**：`pages` 数组第一项是首页。新增页面必须在此注册，否则编译报错。

### 2.3 manifest.json

应用元信息：`appid`、各平台配置（小程序 appid、H5 路由模式、App 权限等）。

### 2.4 条件编译（核心特性）

用注释区分平台代码，编译时只保留目标平台部分。

```vue
<!-- #ifdef H5 -->
<view>仅 H5 显示</view>
<!-- #endif -->

<!-- #ifdef MP-WEIXIN -->
<view>仅微信小程序</view>
<!-- #endif -->

<!-- #ifndef H5 -->
<view>非 H5 平台</view>
<!-- #endif -->

<!-- #ifdef APP-PLUS || MP-WEIXIN -->
<view>App 或微信小程序</view>
<!-- #endif -->
```

JS / CSS 中用 `// #ifdef` 注释形式。平台标识：`H5`、`MP-WEIXIN`、`MP-ALIPAY`、`APP-PLUS`、`APP-ANDROID`、`APP-IOS` 等。

---

## 三、生命周期

### 3.1 三类生命周期

**应用生命周期**（App.vue）：

- `onLaunch`：初始化完成（全局只一次）。
- `onShow`：从后台切到前台。
- `onHide`：从前台切到后台。

**页面生命周期**：

| 钩子 | 说明 |
|------|------|
| `onLoad` | 页面加载，可接收路由参数 |
| `onShow` | 页面显示（每次切回都触发）|
| `onReady` | 首次渲染完成 |
| `onHide` | 页面隐藏 |
| `onUnload` | 页面卸载 |
| `onPullDownRefresh` | 下拉刷新 |
| `onReachBottom` | 上拉触底 |
| `onShareAppMessage` | 分享给朋友 |
| `onPageScroll` | 页面滚动 |

**组件生命周期**：与 Vue 一致（`created/mounted/destroyed` 或 Vue3 `setup`），组件**没有** `onLoad` 等页面生命周期。

### 3.2 常见坑

- `onLoad` 只在页面级，组件内拿路由参数要用 props 传递或 `getCurrentPages`。
- `onShow` 在 tab 切换、返回时都触发，别只做一次性初始化。
- Vue3 `<script setup>` 中页面生命周期用 `onLoad`、`onShow` 等需从 `@dcloudio/uni-app` 导入。

```js
import { onLoad, onShow } from '@dcloudio/uni-app'
onLoad((options) => { console.log('参数', options) })
onShow(() => { console.log('显示') })
```

---

## 四、样式与 rpx

### 4.1 rpx 响应式像素

`rpx` 是 uniapp/小程序的响应式单位：**750rpx = 屏幕宽度**。设计稿宽 750px 时，1px = 1rpx，直接换算。

```
iPhone6 屏宽 375px -> 750rpx -> 1rpx = 0.5px
```

建议用 rpx 做布局，px 做边框/字号（按需）。

### 4.2 样式隔离

- `<style scoped>`：组件样式隔离（小程序编译为组件样式隔离）。
- 全局样式放 `App.vue` 或 `uni.scss`。
- `uni.scss` 是全局变量文件，预置主题色变量。

### 4.3 跨端样式差异

- 小程序不支持 `*` 通配符、某些伪元素。
- App nvue/uvue 样式限制大（基本只能 flex）。
- H5 支持完整 CSS。
- 谨慎用 `position: fixed`，各端表现可能不同。

### 4.4 内联样式与 class

```vue
<view :style="{ color: active ? 'red' : '#333' }" :class="['box', { active }]">文本</view>
```

---

## 五、路由与传参

### 5.1 跳转 API

| API | 行为 |
|-----|------|
| `uni.navigateTo` | 保留当前页，跳新页（可返回，最多 10 层）|
| `uni.redirectTo` | 关闭当前页，跳新页（不可返回）|
| `uni.reLaunch` | 关闭所有页，跳新页 |
| `uni.switchTab` | 跳 tabBar 页（必须用这个）|
| `uni.navigateBack` | 返回上一页 |

### 5.2 传参与接收

```js
// 传参
uni.navigateTo({ url: '/pages/detail/detail?id=123&name=abc' })

// 接收（目标页 onLoad）
onLoad((options) => {
  console.log(options.id, options.name)   // '123' 'abc'（都是字符串）
})
```

**注意**：URL 传参是字符串，对象/数组要 `encodeURIComponent(JSON.stringify())` 传，接收时反解。复杂参数用全局状态或 storage。

---

## 六、网络请求

### 6.1 uni.request 封装

```js
const BASE = 'https://api.example.com'
export function request(options) {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: { 'Authorization': `Bearer ${uni.getStorageSync('token')}`, ...options.header },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) resolve(res.data.data)
          else if (res.data.code === 401) { uni.reLaunch({ url: '/pages/login/login' }); reject(res.data) }
          else { uni.showToast({ title: res.data.msg, icon: 'none' }); reject(res.data) }
        } else reject(res)
      },
      fail: reject,
    })
  })
}
```

### 6.2 拦截器

uniapp 没内置拦截器，可：

- 用封装函数统一处理（如上）。
- 用 `uni.addInterceptor`（uniapp 3+）拦截 `uni.request`。
- 用第三方库 `uni-network`（uni-request）。

### 6.3 上传下载

```js
uni.uploadFile({ url, filePath, name: 'file', formData: {...}, success })
uni.downloadFile({ url, success: (res) => { /* res.tempFilePath */ } })
```

---

## 七、数据存储

### 7.1 本地存储

```js
uni.setStorageSync('token', 'xxx')
const token = uni.getStorageSync('token')
uni.removeStorageSync('token')
uni.clearStorageSync()
```

- 同步版（Sync）和异步版（`uni.setStorage` 回调/Promise）。
- 小程序单 key 上限 1MB，总上限 10MB；H5 底层是 localStorage。
- **与 localStorage 区别**：uni 存储可存对象（自动序列化），localStorage 只能存字符串。

---

## 八、平台差异与小程序原理

### 8.1 小程序双线程模型

微信小程序采用**双线程**：

- **渲染层**：多个 webview（每个页面一个），跑 wxml/wxss。
- **逻辑层**：单独的 JS 引擎（iOS 的 JSCore、Android 的 V8），跑 JS。

两线程通过 **Native（微信客户端）中转通信**。

**为什么双线程**：

1. **安全**：逻辑层无 DOM API，不能直接操作界面，防止恶意脚本篡改。
2. **性能**：渲染与逻辑并行，JS 执行不阻塞渲染。

**代价**：通信有开销，`setData` 要跨线程传递数据，频繁/大数据 setData 卡顿。

### 8.2 setData 通信开销

```js
this.setData({ list: hugeArray })   // 整个 list 序列化跨线程
```

优化：

- 只 setData 变化的字段，别整对象覆盖。
- 合并多次 setData。
- 列表局部更新用 `list[index].field`（小程序支持路径更新）。
- 不把与渲染无关的数据放 data。

### 8.3 常见平台差异

| 差异点 | 说明 |
|--------|------|
| DOM 操作 | 小程序无 document，不能操作 DOM，用数据驱动 |
| 事件 | `@tap` 推荐代替 `@click`（部分端 click 有延迟）|
| 富文本 | 用 `rich-text` 组件，不支持 v-html |
| 图片 | 小程序有域名白名单限制 |
| 网络请求 | 小程序需在后台配 request 合法域名 |
| 支付 | 各端 SDK 不同，用条件编译 |

---

## 九、登录与支付

### 9.1 小程序登录流程

```
1. 前端 uni.login() -> 临时 code
2. 前端把 code 发给自己的后端
3. 后端用 code + appid + secret 调微信接口 -> openid + session_key
4. 后端生成自定义登录态（token），返回前端
5. 前端存 token，后续请求带上
```

```js
uni.login({
  provider: 'weixin',
  success: (res) => {
    const code = res.code
    request({ url: '/login', method: 'POST', data: { code } })
      .then((token) => uni.setStorageSync('token', token))
  },
})
```

**安全**：`session_key` 不能下发给前端，`appid + secret` 只在后端。

### 9.2 支付流程

```
1. 前端选商品 -> 后端创建订单 -> 后端调微信统一下单 -> 返回支付参数
2. 前端 uni.requestPayment(payParams) 唤起支付
3. 支付结果回调 -> 后端验签确认
```

```js
uni.requestPayment({
  provider: 'wxpay',
  timeStamp, nonceStr, package, signType, paySign,
  success: () => uni.showToast({ title: '支付成功' }),
  fail: () => uni.showToast({ title: '支付失败', icon: 'none' }),
})
```

---

## 十、性能优化

### 10.1 分包加载

主包过大影响启动速度，用分包按需加载：

```json
// pages.json
{
  "subPackages": [
    { "root": "subpkgA", "pages": [{ "path": "detail/index" }] }
  ],
  "preloadRule": {
    "pages/index/index": {
      "networks": ["wifi"],
      "packages": ["subpkgA"]   // 进首页预下载分包
    }
  }
}
```

跳分包：`uni.navigateTo({ url: '/subpkgA/detail/index' })`。

**主包限制**：微信小程序主包 ≤ 2MB，总包 ≤ 20MB（可提审放大）。

### 10.2 setData 优化

见 8.2。核心：少次少量、局部更新、不相关数据不放 data。

### 10.3 长列表

- 短列表用普通循环。
- 长列表用**虚拟列表**（`<scroll-view>` + 只渲染可见项）或 uniapp 的 `<list>`（nvue recycle-list）。
- 分页加载 + 触底加载（`onReachBottom`）。

### 10.4 其他

- 图片懒加载（`<image lazy-load>`）、用 CDN、WebP。
- 减少 `onPageScroll` 中的重逻辑。
- 启动时减少同步 API 调用。
- 避免大对象放 data。

---

## 十一、组件

### 11.1 easycom 自动导入

`components/组件名/组件名.vue` 命名的组件可直接用，无需 import 和注册。

```
components/my-button/my-button.vue  -> 直接 <my-button />
```

### 11.2 uni-ui

官方跨端 UI 库，`uni_modules` 方式引入，兼容多端。

### 11.3 组件通信

与 Vue 一致：props / emit / provide-inject / Vuex-Pinia。跨页面用全局状态或事件总线（`uni.$emit/$on`）。

```js
// 全局事件
uni.$emit('refresh', data)
uni.$on('refresh', (data) => { /* ... */ })
uni.$off('refresh')
```

---

## 十二、nvue / uni-app x

### 12.1 nvue 是什么

nvue 页面用**原生渲染**（weex 引擎，uni-app x 用 uvue 编译到原生），不走 webview，性能更好、动画流畅。

适用：长列表、复杂动画、对性能敏感的页面。可与 vue 页面混用。

### 12.2 nvue vs vue

| 维度 | vue 页面 | nvue 页面 |
|------|----------|-----------|
| 渲染 | webview（H5/小程序）/ 原生（App）| 原生渲染 |
| CSS | 完整 | 仅 flex 子集，限制多 |
| 性能 | 一般 | 好（长列表/动画）|
| 兼容 | 全端 | 主要是 App |

### 12.3 uni-app x

新一代，uvue 编译到 **Kotlin/Swift 原生**，性能接近原生 App，DSL 是 Vue3 子集，类型更严格。适合对 App 性能要求高的场景。

---

## 十三、状态管理

- **全局数据**：`App.vue` 的 `globalData`（`getApp().globalData`），轻量但不响应式。
- **storage**：持久化，非响应式。
- **Vuex / Pinia**：响应式全局状态，推荐 Pinia（Vue3）。

```js
// Pinia 示例
import { defineStore } from 'pinia'
export const useUserStore = defineStore('user', {
  state: () => ({ token: '', info: {} }),
  actions: {
    setToken(t) { this.token = t; uni.setStorageSync('token', t) },
  },
})
```

---

## 十四、打包发布

| 平台 | 方式 |
|------|------|
| H5 | HBuilderX 发布网站 / CLI `npm run build:h5`，部署 dist/build/h5 |
| 小程序 | HBuilderX 发行到微信 / CLI，用微信开发者工具上传提审 |
| App | 云打包（DCloud 服务器打包）/ 本地打包，生成 apk/ipa |

条件编译保证各端正确。App 需在 manifest 配权限、证书。

---

## 十五、常见坑

| 坑 | 说明 | 解决 |
|----|------|------|
| 页面不显示 | 未在 pages.json 注册 | 注册页面路径 |
| 样式不生效 | scoped / 选择器不支持 / nvue 限制 | 检查选择器，nvue 用 flex |
| setData 卡顿 | 频繁/大数据 | 局部更新、合并、不相关数据移出 data |
| onShow 重复执行 | tab 切换/返回触发 | 用标志位避免重复初始化 |
| 跨端 API 差异 | 某端无该 API | 条件编译 + 兜底 |
| 图片不显示 | 小程序域名白名单 | 后台配合法域名 |
| 跳 tabBar 失败 | 用了 navigateTo | tabBar 页用 switchTab |
| 参数是字符串 | URL 传参 | 数字要 parseInt，对象 JSON 序列化 |
| v-html 不支持 | 小程序无 | 用 rich-text 组件 |
| 包体积超限 | 主包 >2MB | 分包、静态资源压缩、按需引入 |

---

## 十六、速记表

| 高频 | 一句话 |
|------|--------|
| 跨端原理 | 编译器 + 运行时 + 条件编译 |
| 条件编译 | `#ifdef 平台` / `#endif` |
| rpx | 750rpx = 屏宽 |
| 页面生命周期 | onLoad 接参、onShow 每次显示 |
| 小程序双线程 | 渲染 webview + 逻辑 jscore，setData 跨线程 |
| 登录 | uni.login 拿 code -> 后端换 openid -> 发 token |
| 分包 | subPackages，主包 ≤2MB |
| setData 优化 | 少次少量局部更新 |
| nvue | 原生渲染，长列表/动画 |
| easycom | 规范命名自动导入组件 |

**核心心法**：一套代码多端 + 条件编译处理差异、数据驱动无 DOM、setData 是性能关键、分包控制体积、登录支付敏感逻辑在后端。

> 配套：[前端高频面试题](./frontend.md) · [React 面试题](./react.md) · [JS 基础面试](./README.md)
