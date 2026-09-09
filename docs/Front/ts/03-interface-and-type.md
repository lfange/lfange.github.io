---
title: 接口与类型别名
icon: article
category:
  - TypeScript
  - Guide
tag:
  - typescript
  - interface
---

# 接口与类型别名

## interface 基础

`interface` 描述**对象的结构**：

```ts
interface User {
  name: string
  age: number
}

const u: User = { name: 'lf', age: 18 }
```

### 可选属性与只读属性

```ts
interface User {
  readonly id: number      // 只读，初始化后不可改
  name: string
  email?: string           // 可选
}

const u: User = { id: 1, name: 'lf' }
// u.id = 2                // ❌ 只读

// ⚠️ readonly 是编译期检查，深层次对象不递归只读
interface Obj { data: { x: number } }
const o: Readonly<Obj> = { data: { x: 1 } }
o.data.x = 2   // ✅ 仍然可以改（浅只读）——深只读用第三方 DeepReadonly
```

### 任意属性 / 索引签名

```ts
interface AnyObj {
  name: string
  [key: string]: any     // 允许任意字符串键
}

// 数值索引
interface StringArray {
  [index: number]: string
}
const arr: StringArray = ['a', 'b']
```

### 方法签名

```ts
interface Counter {
  (start: number): string          // 本身可调用（函数接口）
  interval: number
  reset(): void
}
```

### 接口继承

```ts
interface Animal {
  name: string
}
interface Dog extends Animal {
  bark(): void
}

// 多继承
interface Pet extends Animal, Dog {}
```

### 声明合并（interface 独有能力）

```ts
interface Window {
  myGlobal: string
}
interface Window {
  other: number
}
// 合并为 { myGlobal: string; other: number }
// 扩展全局对象/第三方库类型时就靠它
```

## type 类型别名

`type` 给**任何类型**起名字：

```ts
type ID = string | number              // 联合
type Point = { x: number; y: number }  // 对象
type Handler = (e: Event) => void      // 函数
type Tree = Node | null                // 递归引用
type Pair<T> = [T, T]                  // 泛型
```

## interface vs type（面试高频）

| 能力 | interface | type |
| --- | --- | --- |
| 描述对象结构 | ✅ | ✅ |
| 联合/元组/原始类型别名 | ❌ | ✅ |
| extends 继承 | ✅（可多继承） | 通过 `&` 交叉近似 |
| 声明合并 | ✅ | ❌（重名直接报错） |
| 映射类型等类型运算 | ❌ | ✅ |
| 报错信息可读性 | 名称直出 | 早期版本展开显示（新版本已改善） |

> 团队约定常见两种：**公共 API / 对象结构用 interface**（可被使用者合并扩展），其余用 type；或全部用 type（一致性）。任选其一，统一即可。

## 交叉类型的细节

```ts
type A = { a: string }
type B = { b: number }
type AB = A & B
const ab: AB = { a: 'x', b: 1 }

// ⚠️ 同名属性类型冲突 → 变成 never
type C = { x: string } & { x: number }
const c: C = { x: 1 as any }
// c.x 的类型是 string & number = never，永远无法正确赋值
```

## 索引访问类型

```ts
interface Person {
  name: string
  age: number
  address: {
    city: string
  }
}

type Name = Person['name']          // string
type City = Person['address']['city']  // string
type Keys = keyof Person            // 'name' | 'age' | 'address'
type Values = Person[keyof Person]  // string | number | { city: string }
```

## 类型兼容性（结构化类型系统）

TS 是**鸭子类型**：「长得像就兼容」，不关心声明用的什么名字：

```ts
interface Point { x: number; y: number }
interface Point2D { x: number; y: number }

const p: Point = { x: 1, y: 2 }
const p2: Point2D = p   // ✅ 结构相同，兼容

// 多余属性检查：直接字面量赋值会严格检查
const p3: Point = { x: 1, y: 2, z: 3 }   // ❌ 对象字面量只能指定已知属性
const tmp = { x: 1, y: 2, z: 3 }
const p4: Point = tmp                     // ✅ 通过变量中转则不报（结构上满足）

// 函数参数兼容：接收参数更少的函数可以赋给要求更多的签名（双变协变）
type LogFn = (msg: string, level: number) => void
const log: LogFn = (msg) => console.log(msg)   // ✅ 少用参数没问题
```

## 常见边界场景

### 可索引的动态 key 对象

```ts
// ❌ 常见误区
interface Wrong {
  [key: string]: string | number
  ok: boolean   // ❌ 不在索引类型范围内
}

// ✅ 正确
interface Config {
  name: string
  [key: string]: unknown
}
```

### 接口定义事件回调

```ts
interface EventEmitter {
  on(event: string, cb: (...args: any[]) => void): void
  emit(event: string, ...args: any[]): void
}
```

## 练习

```ts
// 1. 定义 Todo 接口：id 只读、title 必填、done 可选默认场景、标签数组
// 2. 用 type 提取 todo 数组中单个元素的类型
```

```ts
// 参考答案
// 1
interface Todo {
  readonly id: number
  title: string
  done?: boolean
  tags: string[]
}

// 2
type TodoList = Todo[]
type SingleTodo = TodoList[number]   // 索引访问：Todo
```

下一篇：[函数与泛型](./04-functions-and-generics.md)。
