---
title: 工程实践与面试题
icon: article
category:
  - TypeScript
  - Guide
tag:
  - typescript
  - engineering
  - interview
---

# 工程实践与面试题

## 在 Vue3 中使用 TS

### 组件 Props

```vue
<script setup lang="ts">
import { defineProps, withDefaults } from 'vue'

interface Props {
  title: string
  items?: string[]
  count?: number
}

// 带默认值
const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  count: 0,
})
</script>
```

### Emits

```ts
const emit = defineEmits<{
  (e: 'change', value: string): void
  (e: 'update', id: number, patch: Partial<Item>): void
}>()

emit('change', 'new')   // 参数类型全校验
```

### ref / reactive / computed

```ts
import { ref, computed } from 'vue'

const count = ref<number>(0)       // Ref<number>
count.value++                       // ✅

const user = ref({ name: 'lf' })   // 自动推断 Ref<{ name: string }>

const double = computed(() => count.value * 2)   // 自动推断 ComputedRef<number>
```

### 类型化 provide/inject

```ts
import { inject, InjectionKey } from 'vue'

const userKey: InjectionKey<User> = Symbol('user')
// 提供方
provide(userKey, { name: 'lf' })
// 注入方（类型 + 默认值，非空）
const user = inject(userKey)   // User | undefined
```

## 在 React 中使用 TS

### 函数组件与 Props

```tsx
interface ButtonProps {
  variant: 'primary' | 'ghost'
  disabled?: boolean
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  children: React.ReactNode
}

function Button({ variant, disabled, onClick, children }: ButtonProps) {
  return (
    <button className={`btn-${variant}`} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
```

### Hooks

```tsx
function useToggle(initial = false) {
  const [on, setOn] = useState<boolean>(initial)
  const toggle = useCallback(() => setOn(v => !v), [])
  return { on, toggle } as const   // as const：返回值收窄为元组
}

const { on, toggle } = useToggle()   // on: boolean, toggle: () => void
```

### 事件与表单

```tsx
function Form() {
  const [text, setText] = useState('')

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }
  return <input value={text} onChange={onChange} />
}
```

## monorepo / 库的实践

```text
packages/
  utils/     → 源码 + package.json "types" 指向 dist/index.d.ts
  ui/
```

要点：

- 库项目 `tsconfig` 开 `declaration: true`，用 `tsc` 或 `tsup` 产出 d.ts
- 导出的一切公共类型显式 `export type`，避免内部类型泄漏到公共 API
- 公共 API 变更跑 `tsc --noEmit` 全量检查，CI 中强制

## 常见报错与解决

| 报错 | 原因与解决 |
| --- | --- |
| `Property 'x' does not exist on type 'Y'` | 联合类型没收窄，加类型守卫或断言 |
| `Type 'string' is not assignable to type 'number'` | 类型不匹配，检查推断结果（悬浮查看） |
| `Object is possibly 'undefined'` | strictNullChecks 生效，加 `?.`、`??` 或先判空 |
| `Argument of type ... is not assignable to parameter` | 结构不兼容，常是数组/对象字面量直接传参触发多余属性检查 |
| `... could be instantiated with a different subtype` | 泛型被推断宽了，显式传类型参数 |
| 模块找不到类型 | 装 `@types/xxx` 或自己写 `declare module` |

调试技巧：**选中变量悬浮看推断类型**、用 `type Debug<T> = ...` 打印中间类型：

```ts
type Debug<T> = { [K in keyof T]: T[K] }
const d: Debug<SomeComplexType> = null as any   // 悬浮 d 看展开结果
```

## 高频面试题

### 1. interface 和 type 的区别？

见[接口与类型别名](./03-interface-and-type.md)：type 功能更全（联合/映射/条件），interface 可声明合并、extends 语义更清晰。对象结构推荐 interface，其余 type。

### 2. any 和 unknown 的区别？

any 关闭检查（任何操作合法），unknown 保留检查（必须收窄后使用）。unknown 是 any 的类型安全版本，接口返回值和 catch 建议用 unknown。

### 3. never 和 void 的区别？

void 表示「没有有意义的返回值」；never 表示「不会正常返回」（抛错/死循环），是所有类型的子类型，用于穷尽检查和类型过滤。

### 4. 泛型中 keyof T、T[keyof T]、T extends keyof U 分别是什么？

```ts
keyof T        // T 的所有键组成的联合
T[keyof T]     // T 的所有值类型组成的联合
K extends keyof T // 约束 K 必须是 T 的键（安全访问的前提）
```

### 5. 什么是结构化类型系统？

类型兼容只看结构（形状）不看声明名（名义类型）。`{ x: number }` 和 `interface Point { x: number }` 互相兼容。

### 6. 类型体操：实现 TupleToUnion

```ts
type TupleToUnion<T extends any[]> = T[number]
type U = TupleToUnion<['a', 'b', 1]>   // 'a' | 'b' | 1
```

### 7. 类型体操：实现 DeepReadonly

```ts
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T
```

### 8. 类型体操：实现 UnionToIntersection

```ts
// 利用函数参数逆变的特性
type UnionToIntersection<U> =
  (U extends any ? (arg: U) => void : never) extends (arg: infer I) => void ? I : never

type I = UnionToIntersection<{ a: 1 } | { b: 2 }>   // { a: 1 } & { b: 2 }
```

### 9. 项目里怎么渐进式迁移 TS？

1. `allowJs: true` 让 JS/TS 共存
2. 从新文件、工具函数开始写 TS
3. 旧文件逐步改后缀，配 `strict` 渐进打开（先 `noImplicitAny` 再 `strictNullChecks`）
4. 借助 JSDoc 注释给暂不迁移的 JS 提供类型

## 性能建议

- 大项目 `skipLibCheck: true`
- 避免超大的单文件类型（如巨型 union），拆分
- 优先 `import type` 减少模块图
- 循环引用只保留类型时用 `import type` 断开运行时环

## 系列总结

| 篇目 | 核心掌握 |
| --- | --- |
| [概览与环境](./01-ts-overview.md) | 定位、tsconfig、编译流程 |
| [基础类型](./02-basic-types.md) | any/unknown/never/void、枚举、字面量 |
| [接口与类型别名](./03-interface-and-type.md) | interface vs type、结构化类型 |
| [函数与泛型](./04-functions-and-generics.md) | 重载、泛型约束、infer 初见 |
| [高级类型](./05-advanced-types.md) | 条件/映射类型、工具类型、可辨识联合 |
| [类与模块](./06-classes-and-modules.md) | 修饰符、抽象类、d.ts |
| [类型收窄](./07-type-narrowing-techniques.md) | typeof/in/谓词/satisfies |
| 工程实践（本篇） | Vue/React 集成、面试题 |

延伸：[TypeScript 官方文档](https://www.typescriptlang.org/docs/) · [类型挑战](https://github.com/type-challenges/type-challenges) · [基础类型笔记](./baseType.md)
