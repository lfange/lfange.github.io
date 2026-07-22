---
title: React 常见面试题
icon: article
category:
  - 前端
  - 面试
tag:
  - Interview
  - React
---

# React 常见面试题

> 覆盖 React 核心原理、Hooks、Fiber、状态管理、性能优化、React 18/19 新特性与手写题。配套 [前端高频面试题](./frontend.md) 的 React 基础部分，本文更深入。

---

## 一、基础概念

### 1.1 虚拟 DOM 是什么？优缺点？

虚拟 DOM 是用 JS 对象描述真实 DOM 的树结构（`{ type, props, children }`），先在内存中 diff 出最小变更，再批量更新真实 DOM。

**优点**：

- 跨平台（React Native、SSR）。
- 避免直接频繁操作 DOM，批量更新减少重排。
- 声明式编程，状态驱动视图。

**缺点**：

- 首次渲染需构建虚拟 DOM，比直接 innerHTML 慢。
- diff 仍有开销，超大型列表不如直接操作。

> 虚拟 DOM 不一定比直接 DOM 操作快，它的价值在于**可维护性和跨平台**，而非极致性能。

### 1.2 JSX 本质

JSX 是 `React.createElement` 的语法糖，编译后是普通 JS 对象。

```jsx
// JSX
const el = <div className="box" onClick={handler}>hi</div>

// 编译后
const el = React.createElement('div', { className: 'box', onClick: handler }, 'hi')
// { type: 'div', props: { className: 'box', onClick: handler, children: 'hi' } }
```

所以每个 JSX 文件要 `import React`（17+ 新 JSX 转换可省略，由编译器自动注入 `_jsx`）。

### 1.3 类组件 vs 函数组件

| 维度 | 类组件 | 函数组件 |
|------|--------|----------|
| 状态 | this.state | useState |
| 生命周期 | 生命周期方法 | useEffect |
| this | 有，需绑定 | 无 |
| 性能 | 略重 | 略轻 |
| 趋势 | 逐步淘汰 | 主流（Hooks）|

### 1.4 props vs state

- **props**：父传入，只读，组件内不可修改。
- **state**：组件内部维护，可变，变化触发重渲染。
- 两者变化都会触发重渲染。`props` 是外部接口，`state` 是内部状态。

### 1.5 受控 vs 非受控组件

```jsx
// 受控：值由 state 控制，onChange 同步
const [val, setVal] = useState('')
<input value={val} onChange={e => setVal(e.target.value)} />

// 非受控：值由 DOM 自己管，用 ref 读取
const inputRef = useRef()
<input ref={inputRef} defaultValue="默认" />
// 读取：inputRef.current.value
```

表单优先受控（数据驱动、易校验）；文件输入必须非受控。

---

## 二、Hooks

### 2.1 常用 Hooks 速查

| Hook | 用途 |
|------|------|
| `useState` | 声明状态 |
| `useEffect` | 副作用（订阅、请求、操作 DOM）|
| `useLayoutEffect` | 同步执行副作用，在 DOM 变更后、绘制前 |
| `useMemo` | 缓存计算值 |
| `useCallback` | 缓存函数引用 |
| `useRef` | 跨渲染保持可变值 / 获取 DOM |
| `useContext` | 消费 Context |
| `useReducer` | 复杂状态（类似 Redux）|
| `useImperativeHandle` | 自定义暴露给父组件的 ref 实例 |
| `useId` | 生成唯一 ID（SSR 安全）|

### 2.2 useEffect vs useLayoutEffect

- **useEffect**：异步，在浏览器**绘制后**执行，不阻塞页面。绝大多数副作用用它。
- **useLayoutEffect**：同步，在 DOM 变更后、**绘制前**执行，会阻塞绘制。用于读取 DOM 布局并同步修改（防闪烁）。

执行顺序：DOM 变更 -> `useLayoutEffect` -> 浏览器绘制 -> `useEffect`。

### 2.3 useEffect 依赖数组

```jsx
useEffect(() => {
  doSomething(count)
  return () => cleanup()   // 清理函数，卸载或下次 effect 前执行
}, [count])                // count 变化才执行；[] 只首次；省略数组每次都执行
```

**坑**：

- 依赖数组要写全（用 eslint-plugin-react-hooks 检查），漏写会读到旧值（stale closure）。
- 依赖引用类型（对象/函数）每次新引用会无限触发，需 `useMemo/useCallback` 稳定或改依赖原始值。

### 2.4 闭包陷阱（Stale Closure）

```jsx
function Counter() {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const t = setInterval(() => {
      console.log(count)        // 永远 0！闭包捕获了首次的 count
      setCount(count + 1)       // 永远设成 1
    }, 1000)
    return () => clearInterval(t)
  }, [])  // 空依赖，effect 只跑一次，count 被锁定为 0
}
```

解决：

1. 函数式更新：`setCount(c => c + 1)`（推荐）。
2. 把 count 加进依赖数组（但定时器会反复重建）。
3. 用 `useRef` 存最新值。

### 2.5 useMemo vs useCallback

- `useMemo(() => compute(a, b), [a, b])`：缓存**计算结果**。
- `useCallback(fn, [deps])`：缓存**函数引用**，等价 `useMemo(() => fn, [deps])`。

用途：避免子组件因 props 引用变化而无效重渲染（配合 `React.memo`）。

**不要滥用**：缓存本身有开销，简单计算/未传给子组件的函数无需缓存。

### 2.6 useRef 的两种用途

```jsx
// 1. 获取 DOM
const inputRef = useRef(null)
<input ref={inputRef} />
inputRef.current.focus()

// 2. 存可变值，不触发重渲染
const timerRef = useRef(null)
timerRef.current = setInterval(...)   // 改 .current 不重渲染
```

### 2.7 自定义 Hook

以 `use` 开头的函数，复用状态逻辑（不复用 UI）。

```jsx
function useWindowSize() {
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return size
}
// 用法：const { w, h } = useWindowSize()
```

### 2.8 Hooks 规则

1. 只在**顶层**调用，不能在循环/条件/嵌套函数中（依赖调用顺序定位）。
2. 只能在**函数组件或自定义 Hook** 中调用。

**原理**：React 用链表按调用顺序存每个 Hook 的状态，顺序错乱会导致状态错配。

### 2.9 自定义 Hook vs HOC vs render props

| 方案 | 复用 | 缺点 |
|------|------|------|
| HOC | 嵌套地狱、props 来源不清、命名冲突 |
| render props | 嵌套、回调 |
| 自定义 Hook | 最简洁，无嵌套，推荐 |

---

## 三、事件系统

### 3.1 合成事件（SyntheticEvent）

React 把事件包装成 `SyntheticEvent`，抹平浏览器差异，拥有和原生事件相同的接口。

```jsx
function handleClick(e) {
  e.preventDefault()
  e.stopPropagation()
  // e 是合成事件，e.nativeEvent 是原生
}
```

### 3.2 事件绑定位置变化

- **React 16 及以前**：事件委托到 `document`。
- **React 17+**：委托到**根容器**（`root` 节点），避免多个 React 应用同 document 冲突，也便于微前端。

### 3.3 类组件 this 绑定

```jsx
class C extends React.Component {
  // 1. 构造函数绑定
  constructor() { super(); this.handleClick = this.handleClick.bind(this) }
  // 2. 箭头函数类属性（推荐）
  handleClick = () => { console.log(this) }
  // 3. render 内箭头函数（每次新建，不推荐）
  render() { return <button onClick={() => this.handleClick()}>btn</button> }
}
```

函数组件没有 this 问题。

---

## 四、Fiber 与渲染

### 4.1 Fiber 架构

React 16 引入。把不可中断的递归渲染拆成**可中断、可恢复的链表结构**（Fiber 节点），利用浏览器空闲时间分片执行，避免长任务阻塞交互。

每个 Fiber 节点是一个工作单元，含 `child/sibling/return` 指针形成链表，可暂停、可复用。

### 4.2 两阶段渲染

- **Render 阶段**（可中断）：计算变更，构建 Fiber 树。纯计算，无副作用。
- **Commit 阶段**（不可中断）：把变更应用到 DOM，执行生命周期/useEffect。

### 4.3 Concurrent Mode / 并发渲染

React 18 默认开启并发特性。可中断渲染、优先级调度。`startTransition` 标记低优先级更新，不阻塞高优先级交互（如输入）。

### 4.4 diff 算法与 key

**三个假设**：

1. 同层比较，跨层不复用。
2. 类型不同直接销毁重建。
3. 用 `key` 标识同层兄弟节点。

**key 的作用**：diff 时通过 key 匹配旧新节点，复用而非重建。**不用 index**：列表增删导致 index 错位，错误复用引发 bug（输入框串值、动画错乱）。

### 4.5 Reconciliation 协调

从根递归对比新旧 Fiber 树，标记副作用（增删改），Commit 阶段执行。

---

## 五、setState

### 5.1 批处理

React 把多次 setState 合并为一次更新，减少重渲染。

- **React 17**：仅在合成事件/生命周期中批处理；定时器、Promise 回调、原生事件中不批处理（同步多次渲染）。
- **React 18+**：**Automatic Batching**，所有更新都自动批处理（包括 Promise/setTimeout/原生事件）。

### 5.2 同步还是异步

setState 本身**同步执行**，但把更新放入队列异步合并，所以"读"上是异步的（更新后立刻读 state 是旧值）。

```jsx
const [count, setCount] = useState(0)
const handleClick = () => {
  setCount(count + 1)
  setCount(count + 1)
  console.log(count)   // 0（还没更新）
}
// 最终 count = 1（两次基于同一 count）
```

### 5.3 函数式更新

连续多次更新基于前一次结果，用函数式：

```jsx
setCount(c => c + 1)
setCount(c => c + 1)   // 最终 +2
```

---

## 六、性能优化

### 6.1 避免不必要重渲染

- `React.memo`：组件级 memo，props 浅比较不变则跳过渲染。
- `useMemo`：缓存传给子组件的对象/计算值。
- `useCallback`：缓存传给子组件的函数。
- 状态下放：把频繁变化的 state 放到最小子组件，避免整棵树重渲染。
- 拆分组件，让 `memo` 粒度更细。

### 6.2 列表优化

- 稳定唯一 `key`。
- 长列表用虚拟滚动（`react-window` / `react-virtualized`）。
- 列表项 `React.memo`。

### 6.3 代码分割 / 懒加载

```jsx
const LazyComp = React.lazy(() => import('./LazyComp'))
;<Suspense fallback={<Loading />}>
  <LazyComp />
</Suspense>
```

路由级懒加载大幅减小首屏包。

### 6.4 其他

- `useTransition` / `useDeferredValue` 降低大列表/搜索的更新优先级。
- 避免在 render 中创建新对象/函数。
- 图片懒加载、按需引入第三方库（lodash-es）。

---

## 七、状态管理

### 7.1 Context + useReducer

轻量全局状态，无需第三方库。缺点：Context 值变化会让所有消费者重渲染，高频更新场景需拆分。

```jsx
const StoreCtx = createContext()
function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initState)
  return <StoreCtx.Provider value={{ state, dispatch }}>{children}</StoreCtx.Provider>
}
```

### 7.2 Redux

单向数据流：`Action -> Dispatcher -> Reducer -> Store -> View`。

- 单一 store、状态不可变、纯函数 reducer。
- **Redux Toolkit（RTK）**：官方推荐，`createSlice` 简化 reducer/action，内置 immer 不可变更新、RTK Query 数据请求。

### 7.3 选型

| 方案 | 特点 |
|------|------|
| Context + useReducer | 轻量，小型应用 |
| Redux Toolkit | 中大型，可预测，生态成熟 |
| Zustand | 极简 API，无 Provider，按需订阅 |
| Jotai / Recoil | 原子化状态，细粒度订阅 |
| MobX | 响应式，自动追踪依赖 |

新项目推荐 Zustand（简单）或 RTK（规范）。

---

## 八、组件模式

### 8.1 高阶组件 HOC

接收组件返回新组件的函数，增强功能（鉴权、埋点、数据注入）。

```jsx
function withAuth(Wrapped) {
  return function Authed(props) {
    if (!isLogin()) return <Login />
    return <Wrapped {...props} />
  }
}
const Dashboard = withAuth(Panel)
```

缺点：嵌套地狱、props 透传不清、ref 需 forwardRef。

### 8.2 render props

通过 props 传递渲染函数共享逻辑。

```jsx
;<Mouse render={pos => <Dot x={pos.x} y={pos.y} />} />
```

### 8.3 三者对比

HOC / render props 都能用自定义 Hook 替代，新代码优先 Hook。

---

## 九、React Router

### 9.1 v6 要点

- `<BrowserRouter>` / `<Routes>` / `<Route>` / `<Outlet>` / `<Link>`。
- 路由配置声明式，`element` 替代 `component`。
- 嵌套路由用 `<Outlet>` 占位。
- `useNavigate` 替代 `useHistory`，`useParams` / `useSearchParams`。

```jsx
<Routes>
  <Route path="/" element={<Layout />}>
    <Route index element={<Home />} />
    <Route path="user/:id" element={<User />} />
    <Route path="*" element={<NotFound />} />
  </Route>
</Routes>
```

### 9.2 懒加载路由

```jsx
const Home = lazy(() => import('./Home'))
<Route path="/" element={<Suspense fallback={<Loading/>}><Home/></Suspense>} />
```

---

## 十、高级特性

### 10.1 错误边界 Error Boundary

类组件，捕获子组件渲染错误，防止整树崩溃（函数组件无法做，需用类）。

```jsx
class EB extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(err, info) { logError(err, info) }
  render() {
    return this.state.hasError ? <Fallback /> : this.props.children
  }
}
```

不捕获：事件回调、异步、SSR 错误。

### 10.2 forwardRef + useImperativeHandle

```jsx
const Input = React.forwardRef((props, ref) => {
  const realRef = useRef()
  useImperativeHandle(ref, () => ({
    focus: () => realRef.current.focus(),
    clear: () => { realRef.current.value = '' },
  }))
  return <input ref={realRef} />
})
// 父组件：<Input ref={inputRef} />  inputRef.current.focus()
```

### 10.3 Portal

把子节点渲染到 DOM 树其他位置（如 body 末尾），用于弹窗、Tooltip，避免父级 `overflow:hidden` / `z-index` 影响。

```jsx
createPortal(<Modal />, document.body)
```

### 10.4 StrictMode

开发模式双调用渲染/effect，暴露副作用问题。生产无影响。

---

## 十一、React 18 / 19 新特性

### 18

- **Automatic Batching**：所有更新自动批处理。
- **Transitions**：`useTransition` / `startTransition` 标记非紧急更新。
- **Suspense for Data Fetching**：Suspense 配合数据请求。
- **useDeferredValue**：延迟更新值，让位高优先级。
- **新 createRoot API**：`ReactDOM.createRoot(root).render(<App/>)`。

### 19

- **Actions**：表单异步动作，`useFormStatus` / `useFormState`。
- **useOptimistic**：乐观更新。
- **`use`**：在渲染中读取 Promise / Context（条件式 Hook）。
- **Server Components 稳定**：服务端组件，减小客户端包。
- **Document Metadata**：组件内直接写 `<title>` / `<meta>`。

---

## 十二、手写题

### 12.1 简化 useState

```jsx
let state = []
let index = 0
function myUseState(init) {
  const cur = index
  state[cur] = state[cur] ?? (typeof init === 'function' ? init() : init)
  const setState = (val) => {
    state[cur] = typeof val === 'function' ? val(state[cur]) : val
    render()   // 触发重渲染
  }
  index++
  return [state[cur], setState]
}
function render() {
  index = 0
  // 重新执行组件函数...
}
```

### 12.2 简化 useReducer

```jsx
function useReducer(reducer, init) {
  const [state, setState] = useState(init)
  const dispatch = (action) => setState(s => reducer(s, action))
  return [state, dispatch]
}
```

### 12.3 Promise 并发控制

```js
async function pool(tasks, limit) {
  const results = []
  const executing = new Set()
  for (const task of tasks) {
    const p = task().then(r => { results.push(r); executing.delete(p) })
    executing.add(p)
    if (executing.size >= limit) await Promise.race(executing)
  }
  await Promise.all(executing)
  return results
}
```

### 12.4 简易 Redux

```js
function createStore(reducer, init) {
  let state = init
  const listeners = []
  return {
    getState: () => state,
    dispatch: (action) => { state = reducer(state, action); listeners.forEach(f => f()) },
    subscribe: (f) => { listeners.push(f); return () => listeners.splice(listeners.indexOf(f), 1) },
  }
}
```

---

## 十三、常见坑

| 坑 | 说明 | 解决 |
|----|------|------|
| useEffect 死循环 | 依赖引用类型每次新 | useMemo 稳定 / 依赖原始值 |
| 闭包陷阱 | 定时器读到旧 state | 函数式更新 / useRef |
| key 用 index | 列表错乱 | 用唯一 id |
| 直接改 state | `state.push()` 不触发 | 不可变更新 / immer |
| 异步拿不到最新 state | setState 后立即读 | useEffect 监听 / 函数式更新 |
| useEffect 漏依赖 | 读到旧值 | 写全依赖 + eslint 校验 |
| 事件 this 丢失 | 类组件回调 | 箭头函数 / bind |
| Context 全局重渲染 | 值变所有消费者更新 | 拆分 Context / 用 Zustand |
| memo 失效 | props 传新对象/函数 | useMemo/useCallback |

---

## 十四、速记表

| 高频 | 一句话 |
|------|--------|
| 虚拟 DOM | JS 对象描述 DOM，diff 最小更新，价值在跨平台与可维护性 |
| Hooks 原理 | 链表按调用顺序存，所以必须顶层调用 |
| 闭包陷阱 | effect 锁定旧值，用函数式更新/ref |
| Fiber | 可中断链表，分片渲染，两阶段 |
| key | diff 复用标识，不用 index |
| setState | 队列异步合并，函数式更新连加 |
| React 18 | 自动批处理 + Transitions |
| 性能优化 | memo + useMemo/useCallback + 虚拟列表 + 懒加载 |

**核心心法**：状态驱动视图、单向数据流、不可变更新、Hooks 顶层调用、依赖数组写全、性能优化先测量再优化。

> 配套：[前端高频面试题](./frontend.md) · [JS 基础面试](./README.md) · [手写题](./interCode.md)
