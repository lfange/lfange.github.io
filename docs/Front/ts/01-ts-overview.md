---
title: TypeScript 概览与环境配置
icon: article
category:
  - TypeScript
  - Guide
tag:
  - typescript
  - basics
---

# TypeScript 概览与环境配置

## TypeScript 是什么

TypeScript = **Type + JavaScript**，是 JavaScript 的超集，由微软开发并开源。它在 JS 的基础上添加了**可选的静态类型系统**和现代 ECMAScript 特性，最终编译为纯 JavaScript 运行。

```text
┌──────────────────────────────┐
│  TypeScript = JavaScript     │
│    + 静态类型                 │
│    + 接口/泛型/枚举等扩展语法   │
│    + 未来 ES 特性（降级编译）   │
└──────────────────────────────┘
        │ tsc 编译（类型擦除）
        ▼
      JavaScript
```

关键认知：

- **类型在编译时全部被擦除**，运行时就是纯 JS（`enum` 等少数语法除外，会被编译成代码）
- TS **不做任何性能优化**，只做类型检查 + 语法转换
- TS 的类型系统是「结构化类型」（Structural Typing）：只看结构不看名字，两个结构相同的类型互相兼容

## 为什么要用 TS

| 痛点（JS） | TS 的解决 |
| --- | --- |
| 函数参数类型不明确，`Cannot read property of undefined` 运行时才炸 | 编译期标红，编码时编辑器直接提示 |
| 重构不敢动代码 | 改动类型不匹配的地方全部报错，重构有安全感 |
| 大项目交接靠读源码 | 类型即文档，接口签名一目了然 |
| 第三方库 API 全靠查文档 | d.ts 提供精准的自动补全 |

## 环境搭建

```bash
npm install -g typescript
tsc -v          # 查看版本

tsc --init      # 生成 tsconfig.json

tsc index.ts    # 编译单文件，生成 index.js
node index.js   # 运行

# 开发时免编译直接跑
npm i -g ts-node
ts-node index.ts

# 让 ts-node 支持直接跑 ES Module
npm i -g ts-node esm
```

现代项目一般不手动 `tsc`，而是由构建工具接管：

- **Vite**：`vite` 开发时用 esbuild 转译（不做类型检查），`vue-tsc`/`tsc --noEmit` 单独跑类型检查
- **Next.js**：内置 TS 支持，检测到 `.ts` 文件自动生成配置

## tsconfig.json 核心配置

```jsonc
{
  "compilerOptions": {
    /* 目标与模块 */
    "target": "ES2020",              // 编译出的 JS 版本
    "module": "ESNext",              // 模块体系
    "moduleResolution": "bundler",   // 模块解析策略（配合 vite）
    "lib": ["ES2020", "DOM"],        // 可用的全局 API 类型

    /* 严格性（新项目全部打开） */
    "strict": true,                  // 总开关，下面几项全开
    "noImplicitAny": true,           // 禁止隐式 any
    "strictNullChecks": true,        // null/undefined 不再是所有类型的子类型
    "noUnusedLocals": true,          // 未使用的变量报错
    "noUnusedParameters": true,      // 未使用的参数报错

    /* 输出 */
    "outDir": "./dist",              // 编译输出目录
    "rootDir": "./src",              // 源码根目录
    "declaration": true,             // 生成 .d.ts（打包库必须）
    "sourceMap": true,               // 生成 sourcemap
    "noEmit": true,                  // 只做类型检查不产出（交给 vite/esbuild 时用）

    /* 模块交互 */
    "esModuleInterop": true,         // 允许 default import 导入 CJS 模块
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,       // 可以 import json
    "skipLibCheck": true,            // 跳过 node_modules 里 d.ts 的检查，加速编译
    "baseUrl": ".",
    "paths": {                       // 路径别名
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],                // 参与编译的文件
  "exclude": ["node_modules", "dist"]
}
```

### 常用配置速记

| 配置 | 作用 | 不开的后果 |
| --- | --- | --- |
| `strict` | 严格模式总开关 | 一半的类型检查形同虚设 |
| `strictNullChecks` | null 检查 | 任何地方都可能 `undefined` 炸掉 |
| `noImplicitAny` | 禁止隐式 any | 类型系统到处是漏洞 |
| `noEmit` | 只检查不编译 | 和构建工具职责重叠时产出冲突 |

## 编译流程

```text
index.ts
   │ ① Scanner 扫描 → Token 流
   │ ② Parser 解析 → AST（语法树）
   │ ③ Binder 绑定 → Symbol（符号表）
   │ ④ Checker 检查 → 类型诊断（报错在这步）
   │ ⑤ Emit 产出 → .js + .d.ts + sourcemap
   ▼
index.js
```

> 语言服务（编辑器补全、悬浮提示）复用同一套管线，所以编辑器提示和 `tsc` 报错一致。

## 类型检查的范围

```ts
// 1. 变量声明
let name: string = 'lf'

// 2. 函数签名
function add(a: number, b: number): number {
  return a + b
}

// 3. 推断（最常用——不必处处写类型）
let age = 18          // 推断为 number（不能改成字符串了）
const brand = 'Vue'   // const 推断为字面量类型 'Vue'

// 4. any 是逃生舱（尽量别用）
let data: any = getData()
data.foo.bar.baz()    // 不报错，运行时爆炸
```

## 本系列导航

1. 概览与环境配置（本篇）
2. [基础类型](./02-basic-types.md)
3. [接口与类型别名](./03-interface-and-type.md)
4. [函数与泛型](./04-functions-and-generics.md)
5. [高级类型](./05-advanced-types.md)
6. [类与模块](./06-classes-and-modules.md)
7. [类型收窄与实战技巧](./07-type-narrowing-techniques.md)
8. [工程实践与面试题](./08-ts-engineering.md)
