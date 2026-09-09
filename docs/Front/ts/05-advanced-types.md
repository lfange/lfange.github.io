---
title: 高级类型
icon: article
category:
  - TypeScript
  - Guide
tag:
  - typescript
  - advanced-types
---

# 高级类型

本篇是「精通」的分水岭：条件类型、映射类型、infer 与内置工具类型，覆盖 90% 的类型体操场景。

## keyof 与 typeof

```ts
// keyof：取对象类型的所有键，组成联合类型
interface User { id: number; name: string; age: number }
type UserKeys = keyof User   // 'id' | 'name' | 'age'

// typeof：从值反推类型（配置对象、常量的福音）
const config = {
  host: 'localhost',
  port: 8080,
  tags: ['a', 'b'],
}
type Config = typeof config
// { host: string; port: number; tags: string[] }

const direction = {
  up: 'UP',
  down: 'DOWN',
} as const
type Direction = keyof typeof direction   // 'up' | 'down'
type DirectionValue = typeof direction[keyof typeof direction]  // 'UP' | 'DOWN'
```

## 索引访问与 in 操作符

```ts
type V = User['name']   // string

// in：遍历联合类型（映射类型的基础）
type Keys = 'a' | 'b'
type Obj = { [K in Keys]: number }   // { a: number; b: number }
```

## 映射类型

```ts
// 把 T 的每个属性变成可选
type MyPartial<T> = {
  [K in keyof T]?: T[K]
}

// 变成只读
type MyReadonly<T> = {
  readonly [K in keyof T]: T[K]
}

// 加修饰符 + / -  可以添加或移除修饰
type Mutable<T> = {
  -readonly [K in keyof T]: T[K]      // 移除 readonly
}
type Required<T> = {
  [K in keyof T]-?: T[K]              // 移除可选
}

// 键的重映射（TS 4.1+）：as 子句
type Getters<T> = {
  [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K]
}
interface Person { name: string; age: number }
type PersonGetters = Getters<Person>
// { getName: () => string; getAge: () => number }

// 过滤键：映射到 never 的键会被丢弃
type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K]
}
```

## 条件类型

```ts
// 语法：T extends U ? X : Y —— 类型层面的三元表达式
type IsString<T> = T extends string ? true : false

type A = IsString<'hello'>   // true
type B = IsString<42>        // false

// 分布式条件类型：泛型参数是「裸类型参数」时，联合类型会被逐个分发
type ToArray<T> = T extends any ? T[] : never
type R = ToArray<string | number>   // string[] | number[]（分别计算再合并）

// 阻止分发：用方括号包裹
type ToArrayNonDist<T> = [T] extends [any] ? T[] : never
type R2 = ToArrayNonDist<string | number>   // (string | number)[]
```

## infer 类型推断

在 `extends` 子句中声明待推断的「类型占位符」：

```ts
// 提取函数参数 / 返回值
type Parameters<T> = T extends (...args: infer P) => any ? P : never
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// 提取 Promise 内部类型（递归）
type Awaited<T> = T extends Promise<infer V> ? Awaited<V> : T
type X = Awaited<Promise<Promise<string>>>   // string

// 提取数组元素
type Element<T> = T extends (infer E)[] ? E : never

// 提取元组第一项
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never
type F = First<[1, 2, 3]>   // 1

// infer 在多个位置时，取联合
type Foo<T> = T extends { a: infer A; b: infer B } ? A | B : never
```

## 模板字面量类型

```ts
type Greeting = `hello ${string}`   // 以 hello 开头的任意字符串
type G = 'hello world'              // ✅ 匹配 Greeting

// 四个内置字符串工具类型
type Upper = Uppercase<'abc'>       // 'ABC'
type Lower = Lowercase<'ABC'>       // 'abc'
type Cap = Capitalize<'abc'>        // 'Abc'
type Uncap = Uncapitalize<'Abc'>    // 'abc'

// 经典组合：属性名联动
type EventName<T extends string> = `on${Capitalize<T>}`
type ClickEvent = EventName<'click'>   // 'onClick'

// 与映射类型组合：生成路由参数类型
type Routes = 'user/:id' | 'post/:postId'
```

## 内置工具类型（必须熟练）

### Partial 系

```ts
interface Todo { title: string; description: string; done: boolean }

Partial<Todo>    // 所有属性可选 —— 更新场景
Required<Todo>   // 所有属性必选
Readonly<Todo>   // 所有属性只读
```

### 裁剪系

```ts
interface User { id: number; name: string; password: string; age: number }

Pick<User, 'id' | 'name'>            // { id: number; name: string }
Omit<User, 'password'>               // 除 password 外全部
Record<string, User>                 // { [k: string]: User } —— 字典
```

### 函数系

```ts
type F = (a: string, b: number) => boolean

Parameters<F>   // [a: string, b: number]
ReturnType<F>   // boolean
Awaited<Promise<string>>   // string
```

### 其他

```ts
Exclude<'a' | 'b' | 'c', 'a'>    // 'b' | 'c'  从联合中排除
Extract<'a' | 'b' | 'c', 'a' | 'b'>  // 'a' | 'b'  提取交集
NonNullable<string | null | undefined>   // string
```

## 手写高频工具类型（面试题）

```ts
// Partial
type MyPartial<T> = { [K in keyof T]?: T[K] }

// Pick
type MyPick<T, K extends keyof T> = { [P in K]: T[P] }

// Readonly
type MyReadonly<T> = { readonly [K in keyof T]: T[K] }

// Record
type MyRecord<K extends keyof any, V> = { [P in K]: V }

// Exclude：利用分布式条件类型
type MyExclude<T, U> = T extends U ? never : T

// Omit = Pick + Exclude
type MyOmit<T, K extends keyof any> = MyPick<T, MyExclude<keyof T, K>>

// ReturnType
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never

// DeepPartial（递归版）
type DeepPartial<T> = T extends object
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : T
```

## 可辨识联合

接口工程里最实用的高级模式——联合类型中用**字面量标签**区分成员：

```ts
interface Circle { kind: 'circle'; radius: number }
interface Rect { kind: 'rect'; width: number; height: number }
interface Triangle { kind: 'triangle'; side: number }

type Shape = Circle | Rect | Triangle

function area(s: Shape): number {
  switch (s.kind) {
    case 'circle':    return Math.PI * s.radius ** 2   // s 收窄为 Circle
    case 'rect':      return s.width * s.height        // s 收窄为 Rect
    case 'triangle':  return s.side ** 2               // s 收窄为 Triangle
  }
}
```

## 一道综合题：类型安全的事件系统

```ts
interface Events {
  login: { userId: string }
  logout: undefined
}

type EventKey = keyof Events

class Emitter<E extends Record<string, any>> {
  private handlers: { [K in EventKey]?: Function[] } = {}

  on<K extends keyof E>(event: K, cb: (payload: E[K]) => void) {
    ;(this.handlers[event] ||= []).push(cb)
  }

  emit<K extends keyof E>(event: K, payload: E[K]) {
    this.handlers[event]?.forEach(cb => cb(payload))
  }
}

const emitter = new Emitter<Events>()
emitter.on('login', p => p.userId)     // payload 自动类型化
emitter.emit('login', { userId: '1' }) // ✅
emitter.emit('login', { foo: 1 })      // ❌ 编译期报错
```

下一篇：[类与模块](./06-classes-and-modules.md)。
