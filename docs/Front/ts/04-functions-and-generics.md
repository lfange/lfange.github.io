---
title: 函数与泛型
icon: article
category:
  - TypeScript
  - Guide
tag:
  - typescript
  - generics
---

# 函数与泛型

## 函数类型

```ts
// 完整写法
const add: (a: number, b: number) => number = function (a, b) {
  return a + b
}

// 常用写法（参数和返回值标注在定义处）
function subtract(a: number, b: number): number {
  return a - b
}

// 类型别名复用签名
type Handler = (data: string) => void
const h: Handler = (data) => {}
```

### 可选参数与默认值

```ts
// 可选参数必须在必选参数后面
function greet(name: string, greeting?: string) {
  return `${greeting ?? 'Hello'}, ${name}`
}

// 默认值（有默认值的参数自动可选）
function greet2(name: string, greeting: string = 'Hello') {
  return `${greeting}, ${name}`
}

// 剩余参数
function sum(...nums: number[]): number {
  return nums.reduce((a, b) => a + b, 0)
}
```

### 函数重载

```ts
// 重载签名（可多个）
function parse(input: string): string[]
function parse(input: number): number[]
// 实现签名（对外不可见）
function parse(input: string | number): string[] | number[] {
  if (typeof input === 'string') return input.split('')
  return [input]
}

parse('ab')   // string[]
parse(1)      // number[]
```

> 注意：实现签名不构成重载，调用方只能按重载签名调用。现代 TS 更推荐用**联合参数 + 类型守卫**代替简单重载，仅签名确实不同的场景才用重载。

### this 类型

```ts
interface Card {
  suit: string
  pick(this: Card): void   // 第一个参数声明 this
}
```

## 泛型：类型的参数化

问题起点——一个函数要同时支持多种类型：

```ts
// ❌ 写两遍，或用 any 丢掉类型
function firstOfNumbers(arr: number[]): number { return arr[0] }
function firstOfStrings(arr: string[]): string { return arr[0] }

// ✅ 泛型：T 是类型变量，调用时才确定
function first<T>(arr: T[]): T {
  return arr[0]
}

first<number>([1, 2, 3])   // 显式指定
first(['a', 'b'])          // 推断 T = string ✅（一般靠推断）
```

### 泛型约束：extends

```ts
// T 必须有 length 属性
function logLength<T extends { length: number }>(item: T): T {
  console.log(item.length)
  return item
}

logLength('abc')     // ✅ string 有 length
logLength([1, 2])    // ✅ 数组有 length
logLength(123)       // ❌ number 没有

// keyof 约束：经典的安全取值
function getProp<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
const user = { name: 'lf', age: 18 }
getProp(user, 'name')   // ✅ string
getProp(user, 'foo')    // ❌ 编译期就报错
```

### 泛型默认值

```ts
interface ApiResponse<T = unknown> {
  code: number
  data: T
}

const r1: ApiResponse = { code: 0, data: 'x' }        // T = unknown
const r2: ApiResponse<string[]> = { code: 0, data: [] }  // T = string[]
```

### 泛型接口 / 泛型类

```ts
// 泛型接口
interface Pair<A, B> {
  first: A
  second: B
}
const p: Pair<string, number> = { first: 'a', second: 1 }

// 泛型类
class Stack<T> {
  private items: T[] = []
  push(item: T) { this.items.push(item) }
  pop(): T | undefined { return this.items.pop() }
}
const s = new Stack<number>()
s.push(1)
```

### 多个类型参数

```ts
function swap<T, U>(tuple: [T, U]): [U, T] {
  return [tuple[1], tuple[0]]
}
swap(['a', 1])   // [number, string]
```

## 实战泛型示例

### 1. 类型安全的 API 请求

```ts
interface User { id: number; name: string }

async function request<T>(url: string): Promise<T> {
  const res = await fetch(url)
  return res.json() as Promise<T>
}

const user = await request<User>('/api/user/1')
user.name   // ✅ string，编辑器全补全
```

### 2. 泛型工具函数

```ts
// 数组去重
function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

// 防抖（保持原函数类型）
function debounce<F extends (...args: any[]) => void>(fn: F, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<F>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
```

### 3. keyof + 泛型实现 Partial

```ts
// 内置 Partial 的「手写版」
type MyPartial<T> = {
  [K in keyof T]?: T[K]
}

function updateTodo(todo: { id: number; title: string; done: boolean }, patch: MyPartial<typeof todo>) {
  return { ...todo, ...patch }
}
```

## 泛型 infer 初见

`infer` 在条件类型里「声明一个待推断的类型变量」，详见[高级类型](./05-advanced-types.md)：

```ts
// 提取数组元素类型
type ElementType<T> = T extends (infer E)[] ? E : never

type A = ElementType<string[]>   // string
type B = ElementType<number>     // never

// 提取函数返回值类型（内置 ReturnType 的原理）
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never
type R = MyReturnType<() => string>   // string
```

## 练习

```ts
// 1. 实现泛型函数 pick<T, K extends keyof T>(obj, keys: K[]): Pick<T, K>
// 2. 实现类型 Flaten<T> 提取 Promise 的最终 resolve 类型
```

```ts
// 参考答案
// 1
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(k => { result[k] = obj[k] })
  return result
}

// 2
type Flaten<T> = T extends Promise<infer V> ? Flaten<V> : T
// 递归解包嵌套的 Promise
type X = Flaten<Promise<Promise<string>>>   // string
```

下一篇：[高级类型](./05-advanced-types.md)。
