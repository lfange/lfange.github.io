---
title: 类与模块
icon: article
category:
  - TypeScript
  - Guide
tag:
  - typescript
  - oop
---

# 类与模块

## 类的基本语法

```ts
class Person {
  // 属性声明（类里必须先声明）
  name: string
  age: number = 18
  private _secret = 'xxx'

  // 静态成员：挂在类上而非实例上
  static species = 'human'

  // 构造函数
  constructor(name: string) {
    this.name = name
  }

  // 方法
  greet(): string {
    return `I'm ${this.name}`
  }
}

const p = new Person('lf')
Person.species   // 'human'
```

### 构造函数属性简写

```ts
// 等价于：声明属性 + 构造函数赋值
class Person {
  constructor(
    public name: string,        // 自动成为公有属性
    private id: number,         // 私有属性
    readonly age: number,       // 只读属性
    protected email?: string,   // 受保护属性
  ) {}
}
```

## 访问修饰符

| 修饰符 | 本类 | 子类 | 外部 |
| --- | --- | --- | --- |
| `public`（默认） | ✅ | ✅ | ✅ |
| `private` | ✅ | ❌ | ❌ |
| `protected` | ✅ | ✅ | ❌ |

```ts
class Animal {
  public name = 'cat'
  private id = 1
  protected family = 'feline'

  getId() { return this.id }   // ✅ 内部可用
}

class Cat extends Animal {
  getFamily() { return this.family }   // ✅ 子类可用
}

const cat = new Cat()
cat.name     // ✅
cat.id       // ❌ private
cat.family   // ❌ protected
```

### ES 私有字段 `#` vs `private`

```ts
class A {
  private x = 1      // TS 编译期私有（运行时 JS 里仍可访问）
  #y = 2             // ES2022 运行时真私有（编译后也存在）
}
```

## 存取器 getter/setter

```ts
class User {
  private _age = 0

  get age(): number {
    return this._age
  }

  set age(value: number) {
    if (value < 0) throw new Error('age 不能为负')
    this._age = value
  }
}

const u = new User()
u.age = 18        // 调用 setter
console.log(u.age) // 调用 getter
```

## 抽象类

```ts
abstract class Shape {
  // 抽象方法：只声明，强制子类实现
  abstract area(): number

  // 具体方法：子类直接复用
  describe(): string {
    return `面积是 ${this.area()}`
  }
}

// new Shape()   // ❌ 抽象类不能实例化

class Circle extends Shape {
  constructor(private radius: number) { super() }

  area(): number {
    return Math.PI * this.radius ** 2
  }
}

const c = new Circle(2)
c.describe()   // ✅
```

### 类实现接口

```ts
interface Serializable {
  serialize(): string
}

class Point implements Serializable {
  constructor(public x: number, public y: number) {}
  serialize() { return JSON.stringify(this) }
}
```

## 类的泛型与 this 类型

```ts
class Container<T> {
  constructor(private items: T[] = []) {}

  add(item: T): this {     // 返回 this 支持链式调用，子类也能正确推断
    this.items.push(item)
    return this
  }

  get first(): T | undefined {
    return this.items[0]
  }
}

new Container<number>().add(1).add(2).first
```

## 装饰器（TS 5.0 标准装饰器）

```ts
// 方法装饰器：记录执行耗时
function log(target: any, context: ClassMethodDecoratorContext) {
  return function (this: any, ...args: any[]) {
    console.time(String(context.name))
    const result = target.apply(this, args)
    console.timeEnd(String(context.name))
    return result
  }
}

class Service {
  @log
  getData() {
    return 'data'
  }
}
```

> 需要 `tsconfig` 开启 `experimentalDecorators` 的旧版装饰器在 NestJS 等框架中仍大量使用，两种写法不兼容，注意项目用的是哪套。

## 模块

```ts
// export
export interface User { id: number }
export type ID = string | number
export const version = '1.0'

export default class Api {}   // 每个模块最多一个 default

// import
import Api, { User, version } from './api'
import type { User, ID } from './api'   // 仅导入类型（编译后擦除，推荐）
export * from './utils'
export type { User } from './api'       // re-export 类型
```

### `import type` 的意义

纯类型导入确保编译后不产生任何运行时 import——避免「类型文件被误打包」「循环引用只剩类型导致报错」等问题。

## 命名空间（了解即可）

模块普及前的组织方式，现在主要用于**给全局变量/旧库补类型**：

```ts
namespace jQuery {
  export function ajax(options: object) {}
}
```

## 声明文件 .d.ts

为没有类型的 JS 库「补类型」：

```ts
// types/my-lib.d.ts
declare module 'my-lib' {
  export function init(options: { host: string }): void
}

// 或扩展已有类型
declare module 'axios' {
  export interface AxiosRequestConfig {
    skipErrorHandler?: boolean   // 给 axios 配置加自定义字段
  }
}

// 扩展全局对象
declare global {
  interface Window {
    __APP_VERSION__: string
  }
}
export {}   // 有 declare global 时文件需要是模块
```

### @types 三方类型库

```bash
npm i -D @types/lodash   # 大多数流行库官方/社区提供
```

查找顺序：包自带类型（`package.json` 的 `types` 字段）→ `@types/xxx` → 自己写 d.ts。

## 练习

```ts
// 1. 实现抽象类 Storage，子类 LocalStorage / MemoryStorage
// 2. 给 window.fetch 包一个泛型 request 函数并声明返回类型
```

下一篇：[类型收窄与实战技巧](./07-type-narrowing-techniques.md)。
