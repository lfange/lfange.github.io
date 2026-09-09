---
title: 类型收窄与实战技巧
icon: article
category:
  - TypeScript
  - Guide
tag:
  - typescript
  - narrowing
---

# 类型收窄与实战技巧

联合类型的值只有「收窄」到具体成员后才能安全使用。本篇讲 TS 的全部收窄手段与日常实战技巧。

## typeof 收窄

```ts
function padLeft(value: string | number, padding: string | number) {
  if (typeof padding === 'number') {
    return ' '.repeat(padding) + value   // padding: number
  }
  return padding + value                 // padding: string
}
```

`typeof` 收窄只能区分 `'string' | 'number' | 'boolean' | 'bigint' | 'symbol' | 'undefined' | 'object' | 'function'`——注意 `typeof null === 'object'`。

## 真值收窄与等值收窄

```ts
// 真值收窄：排除 null/undefined/''/0/NaN/false
function printAll(strs: string | string[] | null) {
  if (strs && typeof strs === 'object') {
    for (const s of strs) {}   // strs: string[]
  }
}

// 等值收窄
function example(x: string | number, y: string | boolean) {
  if (x === y) {
    x.toUpperCase()   // 此处 x: string（两个联合只有 string 重叠）
  }
}
```

## in 操作符收窄

```ts
interface Bird { fly(): void }
interface Fish { swim(): void }

function move(animal: Bird | Fish) {
  if ('swim' in animal) {
    animal.swim()   // Fish
  } else {
    animal.fly()    // Bird
  }
}
```

## instanceof 收窄

```ts
function logValue(x: Date | string) {
  if (x instanceof Date) {
    x.toUTCString()   // Date
  } else {
    x.toUpperCase()   // string
  }
}
```

## 可辨识联合收窄（最常用）

```ts
type NetworkState =
  | { state: 'loading' }
  | { state: 'failed'; code: number }
  | { state: 'success'; response: string }

function render(state: NetworkState) {
  switch (state.state) {
    case 'loading': return '加载中'
    case 'failed':  return `失败：${state.code}`      // 收窄到 failed 分支
    case 'success': return state.response              // 收窄到 success 分支
  }
}
```

> Vue3 / React 的异步组件状态、接口返回的 status 字段都是这个模式。

## 类型谓词（自定义类型守卫）

```ts
// 返回「pet is Fish」而不是 boolean —— 这才是类型守卫的关键
function isFish(pet: Fish | Bird): pet is Fish {
  return 'swim' in pet   // 或 (pet as Fish).swim !== undefined
}

const pet: Fish | Bird = getPet()
if (isFish(pet)) {
  pet.swim()   // ✅ pet 被收窄为 Fish
}
```

### 实战：数组过滤后类型不变窄的经典问题

```ts
const list: (string | null)[] = ['a', null, 'b']

// ❌ filter 后类型还是 (string | null)[]
const bad = list.filter(x => x !== null)

// ✅ 用类型守卫重载，收窄为 string[]
const good: string[] = list.filter((x): x is string => x !== null)

// ✅ TS 5.5+ 能自动推断上面的写法，无需显式谓词
```

## 断言函数

```ts
// asserts 表示「函数正常返回则参数必须是 string」
function assertIsString(val: any): asserts val is string {
  if (typeof val !== 'string') throw new Error('不是字符串')
}

function maybeString(val: string | number) {
  assertIsString(val)
  val.toUpperCase()   // ✅ 此后 val: string
}
```

## 控制流分析

收窄沿控制流传播，TS 会跟踪赋值：

```ts
function example() {
  let x: string | number
  x = 'hello'
  x.toUpperCase()   // ✅ x: string
  x = 100
  x.toFixed()       // ✅ x: number
}
```

## satisfies 操作符（TS 4.9+）

「验证值匹配类型，但保留最具体的推断类型」——比直接标注更好用：

```ts
const themes = {
  dark: { color: '#000', bg: '#fff' },
  light: { color: '#fff', bg: '#000' },
} satisfies Record<string, { color: string; bg: string }>

themes.dark.color   // ✅ 类型仍是具体字面量 '#000'
// 对比：const t: Record<...> = {...} 之后 t.dark.color 是 string

// 经典场景：色值映射
type RGB = [red: number, green: number, blue: number]
const palette = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Record<string, string | RGB>

palette.red.at(0)        // ✅ 知道 red 是 RGB（元组）
palette.green.toUpperCase()  // ✅ 知道 green 是 string
```

## 常见实战技巧集

### 1. as const 一切配置

```ts
const PERMISSIONS = ['read', 'write', 'admin'] as const
type Permission = typeof PERMISSIONS[number]   // 'read' | 'write' | 'admin'
```

### 2. 可选链 + 空值合并配合收窄

```ts
function getUserName(user?: { name?: string }): string {
  return user?.name ?? '匿名'
}
```

### 3. 函数重在参数对象化

```ts
// ❌ 一堆可选参数难以维护
function createuser(name?: string, age?: number, email?: string) {}

// ✅ 选项对象 + Partial
interface CreateUserOptions { name: string; age?: number; email?: string }
function createUser(opts: CreateUserOptions) {}
```

### 4. 模板字面量做字符串枚举校验

```ts
type Size = `${number}px`
const s: Size = '16px'    // ✅
const t: Size = 'px'      // ❌
```

### 5. 非空断言的替代方案

```ts
// ❌ 危险
const el = document.getElementById('app')!

// ✅ 更安全
const el = document.getElementById('app')
if (!el) throw new Error('#app 不存在')
// 此后 el 自动收窄为 HTMLElement
```

### 6. unknown 处理接口返回

```ts
async function load(): Promise<void> {
  const data: unknown = await fetch('/api').then(r => r.json())

  if (isUserResponse(data)) {   // 自定义守卫校验结构
    console.log(data.name)
  }
}

function isUserResponse(v: unknown): v is { name: string } {
  return typeof v === 'object' && v !== null && 'name' in v
}
```

## 练习

```ts
// 1. 写一个守卫 isError(e: unknown): e is Error
// 2. 用可辨识联合重构一个 Promise 的三种状态并实现 then 的类型
```

下一篇：[工程实践与面试题](./08-ts-engineering.md)。
