---
title: TypeScript 基础类型
icon: article
category:
  - TypeScript
  - Guide
tag:
  - typescript
  - basics
---

# TypeScript 基础类型

## 原始类型

```ts
let str: string = 'hello'
let num: number = 42
let bool: boolean = true
let big: bigint = 100n
let sym: symbol = Symbol('id')

// 注意：都是小写！String/Number/Boolean 是包装对象类型，语义不同
let wrong: String = 'x'   // 能过，但它是对象类型，不要这样写
```

## 数组与元组

```ts
// 数组两种写法
let arr1: number[] = [1, 2, 3]
let arr2: Array<string> = ['a', 'b']   // 泛型写法

// 元组：长度和每个位置的类型都固定
let tuple: [string, number] = ['age', 18]
tuple[0]   // string
tuple[1]   // number

// 具名元组（更好的可读性）
let point: [x: number, y: number] = [1, 2]

// 元组变体
let rest: [string, ...number[]] = ['a', 1, 2, 3]  // 第一个之后任意个 number
```

## any / unknown / never / void

这是 TS 类型系统的四个特殊值，面试必考：

```ts
// any：放弃类型检查——逃生舱，能不用就不用
let a: any = 1
a = 'str'      // ✅
a.foo()        // ✅ 不报错（危险！）

// unknown：安全的 any——「不知道是什么，但用之前必须收窄」
let u: unknown = getData()
u.foo()        // ❌ 报错，不能直接用
if (typeof u === 'string') {
  u.toUpperCase()  // ✅ 收窄后可用
}
const n: number = u as number  // ✅ 或断言（责任自负）

// void：函数没有返回值
function log(msg: string): void {
  console.log(msg)
}

// never：永远不可能有值
function throwError(msg: string): never {
  throw new Error(msg)
}
function infiniteLoop(): never {
  while (true) {}
}
```

### unknown vs any 对比

| | any | unknown |
| --- | --- | --- |
| 接收任意值 | ✅ | ✅ |
| 直接使用（调方法/赋给具体类型） | ✅ | ❌ 必须先收窄或断言 |
| 使用建议 | 禁用 | 接口返回、catch 的 error 默认用它 |

> TS 4.4+ 中 `useUnknownInCatchVariables`（strict 自带）使 `catch (e)` 的 e 是 `unknown`。

### never 的两个经典用途

```ts
// 1. 联合类型的完备性检查（新增成员忘了处理会编译报错）
type Shape = Circle | Square

function area(s: Shape) {
  switch (s.kind) {
    case 'circle': return 1
    case 'square': return 2
    default:
      // 如果 Shape 新增 Triangle 且这里没处理，_exhaustive 会报错
      const _exhaustive: never = s
      return _exhaustive
  }
}

// 2. 过滤联合类型
type NonNullable<T> = T extends null | undefined ? never : T
```

## 枚举

```ts
// 数字枚举：默认从 0 递增，可设初始值
enum Direction {
  Up = 1,
  Down,     // 2
  Left,     // 3
}

// 字符串枚举（更推荐：可读、序列化后有意义）
enum Status {
  Loading = 'LOADING',
  Success = 'SUCCESS',
  Error = 'ERROR',
}

// const enum：编译时内联，不生成任何对象代码（体积最优）
const enum Color { Red, Green }
let c = Color.Red   // 编译成 let c = 0

// 反向映射（仅数字枚举）
Direction[1]  // 'Up'
```

> 实践趋势：字符串枚举或用 `as const` 对象 + 类型推导替代 enum（enum 会产生运行时代码）：

```ts
const Direction = { Up: 'UP', Down: 'DOWN' } as const
type Direction = typeof Direction[keyof typeof Direction]  // 'UP' | 'DOWN'
```

## 字面量类型

```ts
let a: 'hello' = 'hello'
a = 'world'   // ❌

// 最常见的场景：联合字面量
type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'

function request(url: string, method: Method) {}
request('/api', 'GET')     // ✅
request('/api', 'FETCH')   // ❌ 编辑器直接提示可选值
```

## 类型断言与类型收窄初步

```ts
// 断言：告诉编译器「我比你清楚」（编译期行为，无任何运行时检查）
const input = document.getElementById('input') as HTMLInputElement
input.value

const num = str as unknown as number   // 双重断言（极少用，等于绕过检查）

// 非空断言
function len(s: string | null) {
  return s!.length   // ❗ 危险，等价于「保证不为空」，运行时可能炸
}

// const 断言：把值「冻」成最窄的字面量类型
let x = 'hello' as const        // 类型是 'hello' 而非 string
let obj = { name: 'a', age: 1 } as const
// obj.name: 'a'，obj.age: 1，且都是 readonly
```

## 联合类型与交叉类型初步

```ts
// 联合：或
let id: string | number
id = 'abc'
id = 123

// 使用联合类型的值时，只能访问所有成员共有的属性
function print(id: string | number) {
  console.log(id.toString())  // ✅ 共有
  // id.toUpperCase()         // ❌ number 没有此方法
}

// 交叉：且（多用于对象类型的合并）
type Person = { name: string }
type Employee = { company: string }
type Staff = Person & Employee   // { name: string; company: string }
```

## 类型推断

能省的类型注解就省，让编译器干活：

```ts
let x = 3                 // number
const y = 3               // 3（字面量类型）
let z = [1, 'a']          // (string | number)[]（最好显式标 (number | string)[]）
let s = 'hello'           // string
const s2 = 'hello'        // 'hello'

// 函数返回值推断（递归、复杂函数建议显式标注）
function add(a: number, b: number) {
  return a + b            // 推断返回 number
}

// let 与 const 推断差异的原因：
// let 以后会变 → 宽化为 string
// const 不会变 → 收窄为字面量 'hello'
```

## 练习

```ts
// 1. 声明一个用户类型：名字字符串、年龄数字、可选邮箱、只读 id
// 2. 写一个函数接收 string | number，返回其长度（字符串）或二倍（数字）
// 3. 解释 never 和 void 的区别
```

```ts
// 参考答案
// 1
interface User {
  readonly id: number
  name: string
  age: number
  email?: string
}

// 2
function handle(x: string | number): number {
  if (typeof x === 'string') return x.length
  return x * 2
}

// 3
// void：函数正常结束但没有返回值（调用后表达式类型是 void）
// never：函数根本不会正常结束（抛错/死循环），是所有类型的子类型
```

下一篇：[接口与类型别名](./03-interface-and-type.md)。
