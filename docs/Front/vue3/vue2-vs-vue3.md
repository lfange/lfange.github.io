---
title: Vue2 与 Vue3 深度对比及常见面试题
icon: vue
category:
  - Vue3
tag:
  - Interview
---

# Vue2 与 Vue3 深度对比及常见面试题

> 本文从 API 范式、响应式、生命周期、模板指令、编译优化、源码架构等维度系统对比 Vue2 与 Vue3，并附高频面试题。
> 响应式与 Diff 的**源码级**剖析见 [响应式原理（change.md）](./change.md)。

---

## 目录

1. [总体对比速览](#一总体对比速览)
2. [API 范式：Options vs Composition](#二api-范式options-vs-composition)
3. [响应式原理：defineProperty vs Proxy](#三响应式原理defineproperty-vs-proxy)
4. [生命周期差异](#四生命周期差异)
5. [模板与指令变化](#五模板与指令变化)
6. [内置新组件：Fragment / Teleport / Suspense](#六内置新组件fragment--teleport--suspense)
7. [全局 API 与应用实例](#七全局-api-与应用实例)
8. [编译优化：靶向更新与静态提升](#八编译优化靶向更新与静态提升)
9. [TypeScript 与源码架构](#九typescript-与源码架构)
10. [性能与体积](#十性能与体积)
11. [常见面试题](#十一常见面试题)
12. [迁移注意事项](#十二迁移注意事项)

---

## 一、总体对比速览

| 维度 | Vue2 | Vue3 |
|------|------|------|
| API 范式 | Options API | Options + Composition API（`<script setup>`） |
| 响应式 | `Object.defineProperty`（递归、初始化即劫持） | `Proxy`（惰性、全监听） |
| 根节点 | 单根 | 支持多根（Fragment） |
| 生命周期 | `beforeDestroy` / `destroyed` | `onBeforeUnmount` / `onUnmounted` |
| 全局 API | `new Vue()`、`Vue.xxx` | `createApp()`、`app.xxx`，支持 Tree-shaking |
| v-model | `value` + `input`，`.sync` | `modelValue` + `update:modelValue`，多 `v-model` |
| 内置组件 | — | Fragment、Teleport、Suspense |
| 异步组件 | `() => import()` 配对象 | `defineAsyncComponent` |
| TS 支持 | 弱（需 class 装饰器） | 原生 TS 编写，推导完善 |
| 源码架构 | 单包 | monorepo（packages 拆分） |
| 编译优化 | 全量 diff | patchFlag + 静态提升 + Block tree + 事件缓存 |
| 包体积 | 较大 | ~22.5KB（gzip，运行时），按需引入 |

---

## 二、API 范式：Options vs Composition

### Options API（Vue2）

通过 `data`、`methods`、`computed`、`watch` 等 option 组织逻辑：

```javascript
export default {
  data() { return { count: 0 } },
  methods: { increment() { this.count++ } },
  computed: { double() { return this.count * 2 } },
}
```

**痛点**：同一功能的逻辑被拆散到不同 option 中。当组件变大，理解一个"搜索功能"需要在 data/methods/computed/watch 之间反复跳转；复用靠 mixin，存在命名冲突、来源不清晰的问题。

### Composition API（Vue3）

用函数按**功能**聚合逻辑：

```javascript
import { ref, computed } from 'vue'

export default {
  setup() {
    const count = ref(0)
    const double = computed(() => count.value * 2)
    function increment() { count.value++ }
    return { count, double, increment }
  },
}
```

`<script setup>` 进一步简化（编译宏，无需手写 return）：

```vue
<script setup>
import { ref, computed } from 'vue'
const count = ref(0)
const double = computed(() => count.value * 2)
function increment() { count.value++ }
</script>
```

### Composition API 的核心优势

1. **逻辑高内聚、易复用**：可抽取成 `useXxx` 函数，比 mixin 来源清晰、无命名冲突。
2. **类型推导友好**：不依赖 `this`，TS 能完整推导。
3. **更好的压缩**：函数局部变量可被压缩，`this.xxx` 不可。

```javascript
// 复用：抽离成 composable
function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  return { count, increment }
}
// 任意组件复用，互不干扰
const { count, increment } = useCounter()
```

> ⚠️ Vue3 仍**支持** Options API，两者可共存，并非二选一。

---

## 三、响应式原理：defineProperty vs Proxy

### 核心差异

| 对比项 | Object.defineProperty（Vue2） | Proxy（Vue3） |
|--------|------------------------------|---------------|
| 劫持方式 | 属性级 getter/setter | 对象级代理 |
| 初始化 | 递归遍历所有属性，初始化即深度劫持 | 惰性代理，访问到嵌套对象才递归 |
| 新增/删除属性 | ❌ 监听不到（需 `Vue.set` / `Vue.delete`） | ✅ 原生支持 |
| 数组索引/length | ❌ 监听不到（hack 原型方法） | ✅ 原生支持 |
| Map/Set/WeakMap | ❌ 不支持 | ✅ 支持（collectionHandlers） |
| 性能 | 初始化成本高（大对象递归深） | 初始化快，访问时按需转换 |

### Vue2 的局限示例

```javascript
// Vue2
this.obj.newProp = 1          // ❌ 非响应式
this.arr[0] = 2               // ❌ 非响应式
this.arr.length = 0           // ❌ 非响应式
// 必须：
this.$set(this.obj, 'newProp', 1)
```

### Vue3 的 Proxy 示例

```javascript
// Vue3
const state = reactive({ obj: { a: 1 }, list: [] })
state.obj.newProp = 1         // ✅ 响应式
state.list[0] = 2             // ✅ 响应式
state.list.length = 0         // ✅ 响应式
```

### ref 与 reactive

```javascript
import { ref, reactive } from 'vue'

const count = ref(0)              // 基本类型用 ref（.value 访问）
const state = reactive({ a: 1 })  // 对象用 reactive（直接访问）
```

- `ref` 包装任意值（含基本类型），通过 `.value` 触发 get/set；模板中自动解包。
- `reactive` 只能代理对象/数组，返回 Proxy。
- 原理：`ref` 内部用 `RefImpl` 类 + `Object.defineProperty` 定义 `value` 的 get/set，依赖 `track`/`trigger`；`reactive` 用 `Proxy` + `Reflect`。

> 源码级剖析（`createReactiveObject`、`createGetter`、`createSetter`）见 [响应式原理](./change.md#proxy)。

---

## 四、生命周期差异

Vue3 的 Options 生命周期改名（`destroy` → `unmount`），Composition 则用 `onXxx` 函数：

| Vue2 Options | Vue3 Options | Vue3 Composition |
|--------------|--------------|------------------|
| `beforeCreate` | `beforeCreate` | `setup()`（替代） |
| `created` | `created` | `setup()`（替代） |
| `beforeMount` | `beforeMount` | `onBeforeMount` |
| `mounted` | `mounted` | `onMounted` |
| `beforeUpdate` | `beforeUpdate` | `onBeforeUpdate` |
| `updated` | `updated` | `onUpdated` |
| `beforeDestroy` | **`beforeUnmount`** | `onBeforeUnmount` |
| `destroyed` | **`unmounted`** | `onUnmounted` |
| `activated` | `activated` | `onActivated` |
| `deactivated` | `deactivated` | `onDeactivated` |
| `errorCaptured` | `errorCaptured` | `onErrorCaptured` |
| — | `renderTracked` | `onRenderTracked`（调试） |
| — | `renderTriggered` | `onRenderTriggered`（调试） |

```javascript
import { onMounted, onBeforeUnmount } from 'vue'

onMounted(() => {
  console.log('挂载完成')
  timer = setInterval(tick, 1000)
})
onBeforeUnmount(() => {
  clearInterval(timer)  // 清理副作用
})
```

要点：
- `setup()` 本身处在 `beforeCreate` 与 `created` 之间，故这两个钩子在 Composition API 中直接写 `setup` 函数体即可。
- 生命周期钩子**必须在 `setup` 同步执行期间注册**，不能放异步回调里（否则无法绑定到当前实例）。

---

## 五、模板与指令变化

### 1. v-model

```vue
<!-- Vue2: value + input -->
<MyInput v-model="text" />
<!-- 等价 -->
<MyInput :value="text" @input="text = $event" />

<!-- Vue3: modelValue + update:modelValue -->
<MyInput v-model="text" />
<!-- 等价 -->
<MyInput :modelValue="text" @update:modelValue="text = $event" />
```

Vue3 新增能力：

```vue
<!-- 多个 v-model -->
<UserForm v-model:name="name" v-model:age="age" />

<!-- 自定义修饰符 -->
<MyInput v-model.capitalize="text" />
```

- 子组件通过 `defineProps` 接收 `modelValue` 和修饰符，`defineEmits` 派发 `update:modelValue`。
- `.sync` 被移除，由多 `v-model` 取代。

### 2. v-if 与 v-for 优先级

- Vue2：`v-for` 优先级 **高于** `v-if`。
- Vue3：`v-if` 优先级 **高于** `v-for`。

> 这意味着 Vue3 中 `v-if` 无法访问 `v-for` 作用域内的循环变量。两者不应同级使用，应通过计算属性先过滤。

### 3. key

- Vue2 中 `v-if`/`v-else` 分支建议加 `key` 防止复用错乱。
- Vue3 中分支已自动唯一，**不再需要**（也不建议）给 `v-if`/`v-else-if`/`v-else` 加 `key`。
- `<template v-for>` 的 `key` 应写在 `<template>` 上，而非子元素。

### 4. filter 移除

```vue
<!-- Vue2 -->
<p>{{ price | currency }}</p>

<!-- Vue3: 用 computed 或方法替代 -->
<p>{{ formatCurrency(price) }}</p>
```

### 5. $listeners 合并

```javascript
// Vue2: $attrs（非 props 属性）+ $listeners（事件）分离
// Vue3: $listeners 移除，事件也归入 $attrs
// $attrs 现在包含 class/style，且支持 inheritAttrs: false 后透传
```

### 6. v-bind 顺序影响

```vue
<!-- Vue3: 后写的覆盖先写的 -->
<div v-bind="{ id: 'a' }" id="b" />  <!-- 最终 id="b" -->
<div id="b" v-bind="{ id: 'a' }" />  <!-- 最终 id="a" -->
```

Vue2 中无论顺序，`v-bind` 总是覆盖单独属性。Vue3 修正为按书写顺序。

### 7. v-on.native 移除

```vue
<!-- Vue2: 加 .native 监听组件根元素原生事件 -->
<MyComp @click.native="onClick" />

<!-- Vue3: 组件 emit 声明过的事件为自定义事件，未声明的自动归入 $attrs 透传到根元素 -->
<!-- 子组件需 emits: ['click'] 声明，否则视为原生事件透传 -->
```

---

## 六、内置新组件：Fragment / Teleport / Suspense

### Fragment（多根节点）

Vue2 模板必须有单一根节点。Vue3 支持：

```vue
<template>
  <header>...</header>
  <main>...</main>
  <footer>...</footer>
</template>
```

原理：编译为 Fragment 类型 VNode，渲染时不产生真实 DOM 包裹节点。

### Teleport（传送门）

将子组件 DOM "传送"到文档其他位置，常用于弹窗/通知：

```vue
<teleport to="body">
  <div class="modal">...</div>
</teleport>
```

弹窗 DOM 直接挂到 `body` 下，避免被父级 `transform`/`overflow`/`z-index` 干扰，但逻辑仍属当前组件。

### Suspense（异步协调）

协调异步组件 / 异步 `setup`：

```vue
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <Loading />
  </template>
</Suspense>
```

```javascript
// 异步 setup（顶层 await）
export default {
  async setup() {
    const data = await fetchUser()  // 挂起，显示 fallback
    return { data }
  },
}
```

### 异步组件：defineAsyncComponent

```javascript
import { defineAsyncComponent } from 'vue'

const AsyncComp = defineAsyncComponent({
  loader: () => import('./Heavy.vue'),
  loadingComponent: Loading,
  errorComponent: Error,
  delay: 200,
  timeout: 3000,
})
```

---

## 七、全局 API 与应用实例

```javascript
// Vue2: 全局 API 挂在 Vue 构造函数上，会污染所有实例
import Vue from 'vue'
Vue.component('Comp', Comp)
Vue.directive('focus', Focus)
Vue.use(VueRouter)
Vue.prototype.$http = axios
Vue.config.productionTip = false
new Vue({ render: h => h(App) }).$mount('#app')
```

```javascript
// Vue3: 应用实例隔离，全局配置不再共享
import { createApp } from 'vue'
const app = createApp(App)
app.component('Comp', Comp)
app.directive('focus', Focus)
app.use(router)
app.config.globalProperties.$http = axios
app.mount('#app')
```

意义：
- 多个 `createApp` 实例互不影响（微前端、多页场景友好）。
- 全局 API（`nextTick`、`reactive` 等）改为**命名导出**，未被使用的可在打包时 Tree-shaking 掉。

```javascript
// Vue2: 即使没用也会被打包
import Vue from 'vue'
Vue.nextTick(() => {})

// Vue3: 按需引入，未用则消除
import { nextTick } from 'vue'
nextTick(() => {})
```

---

## 八、编译优化：靶向更新与静态提升

这是 Vue3 性能提升的关键来源，编译期做了大量工作（[源码级详解](./change.md#虚拟-dom)）。

### 1. patchFlag（靶向更新）

编译器为动态节点打上 patchFlag，标记它**具体哪部分是动态的**，diff 时只比对标记部分：

```javascript
// <div>{{ name }}</div>
// 编译为：
_createElementVNode('div', null, _toDisplayString(_ctx.name), 1 /* TEXT */)
//                                                              ^ patchFlag=TEXT，只比对文本
```

PatchFlag 取值：`TEXT=1`、`CLASS=2`、`STYLE=4`、`PROPS=8`、`FULL_PROPS=16`...等位或运算组合。Vue2 则对整个 VNode 全量比对。

### 2. 静态提升（hoistStatic）

纯静态节点提升到 render 函数外部，复用同一 VNode 引用，不走 diff：

```javascript
// <h1>静态标题</h1> 每次渲染都创建新 VNode（Vue2）
// Vue3:
const _hoisted_1 = /*#__PURE__*/_createElementVNode('h1', null, '静态标题', -1 /* HOISTED */)
// render 内直接引用 _hoisted_1
```

### 3. 事件缓存（cacheHandlers）

```vue
<!-- Vue2: 每次渲染创建新函数，子组件认为 props 变化而更新 -->
<button @click="onClick">...</button>
```

Vue3 编译后把事件处理函数缓存到 `_cache`，避免重复创建，配合 `inline` 让子组件 props 引用稳定。

### 4. Block tree（动态节点收集）

Vue3 把动态节点拍平到 Block 的 `dynamicChildren` 数组，diff 时**只遍历动态节点**，跳过所有静态节点。Vue2 的 diff 遍历整棵 VNode 树。

```
<div>                       Block
  <h1>静态</h1>              跳过
  <p>静态</p>                跳过
  <span>{{ name }}</span>    进入 dynamicChildren
</div>
```

### 编译优化小结

| 优化 | 作用 |
|------|------|
| patchFlag | 节点级靶向更新，只 diff 动态部分 |
| 静态提升 | 静态节点复用，不参与 diff |
| 事件缓存 | 稳定事件引用，避免无谓子组件更新 |
| Block tree | 树级只遍历动态节点 |

---

## 九、TypeScript 与源码架构

### TypeScript

- Vue2 用 JS 编写，TS 支持靠 `vue-class-component` + `vue-property-decorator`，写法繁琐，类型推导有限。
- Vue3 用 **TS 重写**，类型定义与源码一体，`<script setup lang="ts">` 开箱即用。

```vue
<script setup lang="ts">
import { ref } from 'vue'
interface User { id: number; name: string }
const user = ref<User>({ id: 1, name: 'lfan' })
// user.value.name 类型推导为 string
</script>
```

### 源码架构：monorepo

Vue3 拆分为 packages，各包独立、可单独使用：

| package | 职责 |
|---------|------|
| `@vue/reactivity` | 响应式系统（**可脱离 Vue 独立使用**） |
| `@vue/runtime-core` | 运行时核心（平台无关） |
| `@vue/runtime-dom` | DOM 运行时 |
| `@vue/compiler-core` | 编译器核心（平台无关） |
| `@vue/compiler-dom` | DOM 编译器 |
| `@vue/compiler-sfc` | 单文件组件编译 |
| `@vue/shared` | 内部工具 |
| `vue` | 完整入口包 |

意义：解耦、可独立复用（如自定义渲染器只依赖 `runtime-core`）、维护清晰。

---

## 十、性能与体积

| 指标 | Vue2 | Vue3 |
|------|------|------|
| 运行时体积（gzip） | ~30KB+ | ~22.5KB |
| 初次渲染 | 全量创建 | 静态提升 + Block |
| 更新 | 全量 diff | 靶向 diff（patchFlag） |
| 内存 | 较高 | 较低（惰性响应式） |
| Tree-shaking | ❌ 全局 API 不可摇 | ✅ 命名导出可摇 |

性能提升主要来自三处：
1. **编译期优化**：patchFlag / 静态提升 / Block tree（更新性能提升显著，尤大实测模板场景约提升 2-3 倍）。
2. **Proxy 惰性响应式**：初始化不再递归遍历，大对象初始化更快。
3. **Tree-shaking**：未用 API 不打包，体积更小。

---

## 十一、常见面试题

### Q1：Vue3 相比 Vue2 有哪些重要改进？

**要点**：
- **响应式重写**：`Object.defineProperty` → `Proxy`，支持新增/删除属性、数组索引、Map/Set，惰性劫持。
- **Composition API**：逻辑高内聚、易复用、TS 友好。
- **编译优化**：patchFlag 靶向更新、静态提升、Block tree、事件缓存。
- **新内置组件**：Fragment（多根）、Teleport（传送门）、Suspense（异步）。
- **TS 重写 + monorepo**：类型完善、包解耦可复用。
- **Tree-shaking**：全局 API 命名导出，按需打包。
- **应用实例隔离**：`createApp` 取代 `new Vue`，全局配置互不影响。

### Q2：为什么 Vue3 用 Proxy 替代 Object.defineProperty？

**要点**：
1. defineProperty 的局限：无法监听属性新增/删除（需 `Vue.set`）、数组索引/length、Map/Set。
2. defineProperty 初始化即递归遍历所有属性，大对象初始化成本高；Proxy 惰性代理，访问时才转换嵌套对象，初始化快。
3. Proxy 是对象级代理，语言层面全范围拦截，代码更简洁。
4. 代价：放弃 IE11（Proxy 无法 polyfill）。

> 详见 [响应式原理](./change.md#object-defineproperty)。

### Q3：Composition API 与 Options API 的区别与优势？

**要点**：
- **组织方式**：Options 按 option 类型分（data/methods/computed），同一功能被拆散；Composition 按功能聚合，相关逻辑在一起。
- **复用**：Options 靠 mixin（命名冲突、来源不清）；Composition 抽成 `useXxx`，来源清晰、类型安全、互不干扰。
- **类型**：Composition 不依赖 `this`，TS 推导完整；Options 的 `this` 类型推导困难。
- **压缩**：局部变量可被压缩，`this.xxx` 不可。
- Vue3 仍支持 Options，非二选一。

### Q4：ref 和 reactive 的区别？如何选择？

**要点**：
- `ref`：包装任意值（含基本类型），通过 `.value` 访问；模板自动解包。内部用 `RefImpl` + defineProperty。
- `reactive`：只代理对象/数组，返回 Proxy，直接访问属性。
- **解构陷阱**：`reactive` 对象解构会失去响应式，需用 `toRefs` / `toRef`。
- **选择**：基本类型必用 `ref`；对象两者皆可，一般 `reactive` 更自然，需要整体替换或解构时用 `ref`/`toRefs`。

```javascript
const state = reactive({ count: 0 })
const { count } = state         // ❌ 失去响应式
const { count } = toRefs(state) // ✅ 保持响应式
```

### Q5：Vue3 编译优化做了什么？

**要点**（详见 [第八节](#八编译优化靶向更新与静态提升)）：
- **patchFlag**：标记动态节点具体哪部分变化，diff 只比对标记部分。
- **静态提升**：静态节点提到 render 外复用，不参与 diff。
- **Block tree**：动态节点拍平到 `dynamicChildren`，只遍历动态节点。
- **事件缓存**：事件处理函数缓存，稳定子组件 props 引用。
- 核心思想：**把运行时能做的判断，提前到编译期完成**。

### Q6：Vue3 生命周期有哪些变化？

**要点**：
- `beforeDestroy`/`destroyed` → `beforeUnmount`/`unmounted`（语义更准确，卸载）。
- Composition API 用 `onXxx` 函数注册，`beforeCreate`/`created` 由 `setup()` 替代。
- 新增 `onRenderTracked`/`onRenderTriggered` 用于调试响应式依赖。
- 钩子必须在 `setup` 同步执行期间注册。

### Q7：Vue3 的 v-model 有什么变化？

**要点**：
- prop/event：`value`/`input` → `modelValue`/`update:modelValue`。
- 支持多个 `v-model`：`v-model:name`、`v-model:age`。
- 支持自定义修饰符。
- `.sync` 移除，由多 `v-model` 取代。

### Q8：Vue3 为什么支持多根节点（Fragment）？

**要点**：
- Vue2 编译器要求单根，是因为 patch 过程依赖单一根 VNode 比较。
- Vue3 引入 Fragment 类型 VNode，多根编译为一个 Fragment，渲染时不产生真实包裹 DOM，diff 时按数组处理。
- 好处：减少无意义包裹元素，CSS 更干净，性能略优。

### Q9：Teleport 和 Suspense 各解决什么问题？

**要点**：
- **Teleport**：把组件渲染的 DOM 传送到指定目标（如 `body`），常用于弹窗/通知，避免被父级 `transform`/`overflow`/`z-index` 影响，逻辑仍属原组件。
- **Suspense**：协调异步组件和异步 `setup`（顶层 `await`），在挂起期间显示 `fallback`，加载完成显示 `default`。

### Q10：watch 和 watchEffect 的区别？

**要点**：
- `watch`：显式声明依赖，可拿到新值/旧值，默认惰性（不立即执行，除非 `immediate`）。
- `watchEffect`：自动收集依赖（回调内用到的响应式数据），立即执行一次，无新旧值概念。
- `watch` 适合需要旧值或精确控制的场景；`watchEffect` 适合"用到谁就追踪谁"的副作用。
- 都返回 `stop` 函数可手动停止；`onCleanup` / `onScopeDispose` 清理副作用。

```javascript
watch(count, (newVal, oldVal) => { /* 有新旧值 */ }, { immediate: true })
watchEffect(() => { console.log(count.value) /* 自动依赖 count */ })
```

### Q11：`<script setup>` 有什么好处？

**要点**：
- 编译宏，无需手写 `setup` 函数和 `return`，顶层变量/函数自动暴露给模板。
- 更好的类型推导、更好的运行时性能（编译期优化）。
- 配套编译宏：`defineProps`、`defineEmits`、`defineExpose`、`defineOptions`、`defineSlots`。
- 默认**关闭**对外暴露实例属性，需通过 `defineExpose` 显式暴露。

### Q12：Vue3 如何实现 Tree-shaking？

**要点**：
- Vue2 全局 API 挂在 `Vue` 默认导出上，打包器无法判断是否使用，无法摇除。
- Vue3 改为**命名导出**（`import { nextTick, reactive } from 'vue'`），未引入的 API 在打包阶段被摇除。
- 内置组件/指令（`Transition`、`v-model` 等）也按需打包。
- 依赖打包器（webpack/rollup/vite）的 Tree-shaking 能力。

### Q13：Vue3 的 Diff 算法相比 Vue2 优化了什么？

**要点**：
- **编译期分流**：patchFlag 区分静态/动态、动态类型，静态节点直接跳过（Vue2 全量遍历）。
- **Block tree**：只比对 dynamicChildren。
- **核心算法**：带 key 的列表 diff 仍是**头尾双端 + 最长递增子序列（LIS）**，LIS 让需要移动的节点最少（Vue2 是双端比较，无 LIS，移动更多）。
- 详见 [Diff 优化源码](./change.md#diff-优化)。

### Q14：reactive 为什么会失去响应式？如何解决？

**要点**：
- **解构**：`const { a } = reactive({ a: 1 })` 解构出的基本类型变量与原对象断开。解决：`toRefs`。
- **整体替换**：`state = newObj` 丢失代理。解决：用 `ref` 包裹后 `state.value = newObj`，或 `Object.assign(state, newObj)`。
- **解包**：`reactive` 内的 `ref` 会被自动解包，直接赋值 `.value` 不需要。
- **传入非对象**：`reactive(1)` 返回原值。基本类型用 `ref`。

### Q15：provide / inject 如何保持响应式？

**要点**：
- 直接传值：`provide('count', count.value)` 传的是快照，**不响应**。
- 传 `ref`/`reactive` 本身：`provide('count', count)`，后代 `inject('count')` 拿到响应式引用，修改会更新。
- 只允许后代读不允许改：传 `readonly(count)`。

```javascript
// 祖先
const count = ref(0)
provide('count', count)            // 传 ref 本身
provide('count', readonly(count))  // 只读
// 后代
const count = inject('count')
```

### Q16：Vue2 升级 Vue3 的迁移成本主要在哪？

**要点**：
- 全局 API：`new Vue` → `createApp`，`Vue.prototype` → `app.config.globalProperties`。
- 响应式：移除 `Vue.set`/`Vue.delete`（不再需要），但要注意 reactive 解构陷阱。
- 生命周期：`destroyed` 系列改名。
- `v-model` prop/event 改名，`.sync` 移除，`filter` 移除。
- `v-if`/`v-for` 优先级反转。
- 第三方库（UI 组件库、路由、状态管理）需升级到 Vue3 兼容版本（Vue Router 4、Pinia 取代 Vuex）。
- 工具：官方 `@vue/compat`（迁移构建）可渐进迁移，运行时同时兼容 v2/v3 语法并给出警告。

---

## 十二、迁移注意事项

1. **优先用 Pinia 替代 Vuex**：Pinia 是 Vue3 官方推荐状态管理，TS 友好、无 mutation、更简洁。
2. **Vue Router 升级到 v4**：`new VueRouter` → `createRouter`，`mode: 'history'` → `history: createWebHistory()`。
3. **用 `@vue/compat` 渐进迁移**：兼容模式下同时支持 v2/v3 语法并打印废弃警告，便于定位问题。
4. **检查第三方依赖**：UI 库、图表库等需有 Vue3 适配版本。
5. **IE11 放弃**：Proxy 无法 polyfill，Vue3 不再支持 IE11。
6. **配合 Vite**：Vue3 生态推荐 Vite，开发体验和构建速度远优于 webpack。

---

## 参考

- [Vue3 官方迁移指南](https://v3.vuejs.org/guide/migration/introduction.html)
- [Vue3 官方文档](https://vuejs.org/)
- 本仓库 [响应式原理（change.md）](./change.md) —— Object.defineProperty / Proxy / patchFlag / Diff 源码级剖析
