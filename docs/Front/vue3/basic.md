---
icon: article
category:
  - Vue3

tag:
  - Quickly Start
---

# Vue3 新特性

## createApp

在 Vue 3 中，改变全局 Vue 行为的 API 现在被移动到了由新的 createApp 方法所创建的应用实例上。

```javascript
import { createApp } from 'vue'
const app = createApp({})
```

调用 createApp 返回一个应用实例。该实例提供了一个应用上下文。应用实例挂载的整个组件树共享
相同的上下文，该上下文提供了之前在 Vue 2.x 中“全局”的配置。  
另外，由于 _createApp_ 方法返回应用实例本身，因此可以在其后链式调用其它方法
vue3.0 中使用 createApp 来创建 vue 实例

```javascript
import { createApp } from 'vue'
const app = createApp({})
import { createApp } from 'vue'
import App from './App.vue'
const app = createApp(App)
app.mount('#app')
```

main.js 下加载 router、vuex

```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)
app.use(store)
app.use(router)
app.mount('#app')

// 合并之后的代码：
createApp(App).use(store).use(router).mount('#app')
```

## 组合式 API

Vue2 是 选项式 API（Option API），一个逻辑会散乱在文件不同位置（data、props、computed、watch、生命周期函数等），导致代码的可读性变差，需要上下来回跳转文件位置。Vue3 组合式 API（Composition API）则很好地解决了这个问题，可将同一逻辑的内容写到一起。

除了增强了代码的可读性、内聚性，组合式 API 还提供了较为完美的逻辑复用性方案，举个 🌰，如下所示公用鼠标坐标案例。

```vue
// main.vue
<template>
  <span>mouse position {{ x }} {{ y }}</span>
</template>

<script setup>
import { ref } from 'vue'
import useMousePosition from './useMousePosition'

const {x, y} = useMousePosition()

}
</script>
```

```javascript
// useMousePosition.js
import { ref, onMounted, onUnmounted } from 'vue'

function useMousePosition() {
  let x = ref(0)
  let y = ref(0)

  function update(e) {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => {
    window.addEventListener('mousemove', update)
  })

  onUnmounted(() => {
    window.removeEventListener('mousemove', update)
  })

  return {
    x,
    y
  }
}
</script>
```

## setup 函数

1. 简介  
   setup 函数是 vue3 中专门为组件提供的新属性。
2. 执行时机  
   创建组件实例，然后初始化 props，紧接着就调用 setup 函数，会在 beforeCreate 钩子之前被调用。
3. 模板中使用  
   如果 setup 返回一个对象，则对象的属性将会被合并到组件模板的渲染上下文。
4. 如何使用

```vue
<template>
  <div>
    {{ name }}
  </div>
</template>
<script>
import { reactive } from "vue"
export default {
  props: {
    item: String
  }
  //setup函数会在beforeCreate之后，created之前执行 setup相当于是预设配置
  //setup函数的第一个形参，接收props数据,通过props.item获取
  setup(props) {
    //创建响应式数据对象
    const state = reactive({
      name: 'abc'
    })
    //setup函数中将响应式数据对象return出去供template使用
    return state
  }
}
</script>
```

注意：在 setup()函数中无法访问到 this

## reactive 函数

1. 简介  
   reactive()函数接收一个普通对象，返回一个响应式的数据对象
2. 基本语法

```javascript
// 按需导入reactive函数
import { reactive } from 'vue'
// 创建响应式数据对象
const state = reactive({ id: 1 })
```

3. 定义响应式数据供 template 使用

```vue ts
<script lang="ts">
import { defineComponent } from 'vue'
// 1)按需导入reactive函数
import { reactive } from 'vue'
export default defineComponent({
  // 2)在setup()函数中调用reactive()函数，创建响应式数据对象
  setup() {
    //创建响应式数据对象
    const state = reactive({
      name: 'Jack',
    })
    //setup函数中将响应式数据对象return出去供template使用
    return state
  },
})
</script>

// 3)在template中访问响应式数据
<template>
  <div>
    {{ name }}
  </div>
</template>
```

## ref 的使用

1. 简介  
   ref()函数用来根据给定的值创建一个响应式的数据对象，ref()函数调用的返回值是一个对象，这个对象上只包含一个 value 属性
2. 基本用法

```vue
<template>
  <div>
    <p>{{ count }}</p>
    <button @click="change()">click</button>
  </div>
</template>
<script>
import { ref } from 'vue'
export default {
  setup() {
    var count = ref(10) //初始化值为10
    const change = () => {
      //方法的定义
      count.value += 1 //想改变值或获取值 必须.value
    }
    return {
      count,
      change,
    }
  },
}
</script>
```

在 reactive()函数中的使用

```vue
<template>
  <div>
    <p>{{ count }}</p>
  </div>
</template>
<script>
import { ref, reactive, onMounted } from 'vue'
export default {
  setup() {
    const state = reactive({
      count: ref(99),
    })
    onMounted(() => {
      //生命周期-挂载完成
      setInterval(function () {
        state.count += 10
      }, 1000)
    })
    return state
  },
}
</script>
```

## ref()和 reactive 的不同

reactive 的用法与 ref 的用法相似，也是将数据变成响应式数据，当数据发生变化时 UI 也会自动更新。不同的是 ref 用于基本数据类型，而 reactive 是用于复杂数据类型

```vue
<template>
  <div>
    <p>{{ count }}</p>
    <button @click="change()">click</button>
  </div>
</template>
<script>
import { reactive } from 'vue'
export default {
  setup() {
    let count = reactive(10)
    // let state = reactive({ count: 10 }); //对象可同步渲染
    function change() {
      console.log(count)
      count += 1 //页面不会同步渲染
      // state.count += 1
    }
    return { count, change }
  },
}
</script>
```

运行发现，基本数据传递给 reactive，reactive 并不会将它包装成 porxy 对象，并且当数据变化时，界面不会同步渲染变化

## toRefs

1. 简介  
   toRefs()函数可以将 reactive()创建出来的响应式对象，转换为普通对象，只不过这个对象上的每个属性节点，都是 ref()类型的响应式数据  
   比如：当想要从一个组合逻辑函数中返回响应式对象时，用 toRefs 是很有效的，该 API 让消费组件可以解构 / 扩展（使用 ... 操作符）返回的对象，并不会丢失响应性
2. 使用

```vue
<template>
  <div>
    <p>{{ count }}</p>
  </div>
</template>
<script>
import { reactive, toRefs } from 'vue'
export default {
  setup() {
    let state = reactive({ count: 10 })
    return {
      ...toRefs(state),
    }
  },
}
</script>
```

## computed

1. 简介  
   computed()用来创建计算属性，computed()函数的返回值是一个 ref 的实例

2. 使用

```vue
<template>
  <div>
    <p>{{ money }}</p>
    <button @click="change()">click</button>
  </div>
</template>
<script>
import { reactive, toRefs, computed } from 'vue'
export default {
  setup() {
    let state = reactive({
      id: 10,
      money: computed(() => state.id + 10), //计算属性的方式
    })
    function change() {
      state.id += 1
      console.log(state.id)
    }
    return {
      ...toRefs(state),
      change,
    }
  },
}
</script>
```

## watch

1. 简介  
   watch() 函数用来监视某些数据项的变化，从而触发某些特定的操作
2. 使用

```vue
<template>
  <div>
    <p>{{ id }}</p>
    <p>{{ type }}</p>
    <button @click="change()">click</button>
  </div>
</template>
<script>
import { reactive, toRefs, watch } from 'vue'
export default {
  setup() {
    let state = reactive({
      id: 10,
      type: '偶数',
    })
    //监听state.id的值的变化
    // 创建监听，并得到停止函数
    const stope = watch(
      () => state.id,
      (cur, old) => {
        if (cur % 2 == 0) {
          state.type = '偶数'
        } else {
          state.type = '奇数'
        }
      }
    )
    function change() {
      state.id += 1
      if (state.id == 15) {
        // 调用停止函数，清除对应的监听
        stop()
      }
    }
    return {
      ...toRefs(state),
      change,
    }
  },
}
</script>
```

## 生命周期钩子函数

### 用法

```javascript
// 1)新版的生命周期函数，可以按需导入到组件中，且只能在 setup() 函数中使用
import { onMounted, onUpdated, onUnmounted} from "vue";
// 2)在setup()函数中调用computed()函数
setup(){
  onMounted(() => {
    console.log('mounted!')
  })
  onUpdated(() => {
    console.log('updated!')
  })
  onUnmounted(() => {
    console.log('unmounted!')
  })
}
```

### 新旧对比

| Vue2.x        | Vue3            |
| ------------- | --------------- |
| beforeCreate  | Not needed\*    |
| created       | Not needed\*    |
| beforeMount   | onBeforeMount   |
| mounted       | onMounted       |
| beforeUpdate  | onBeforeUpdate  |
| updated       | onUpdated       |
| beforeDestroy | onBeforeUnmount |
| destroyed     | onUnmounted     |
| errorCaptured | onErrorCaptured |

2. 使用

```vue
<template>
  <div>
    <p>{{ num }}</p>
    <p>{{ type }}</p>
  </div>
</template>
<script>
import { reactive, toRefs, onMounted, onUpdated, onUnmounted } from 'vue'
export default {
  setup() {
    var timer = null
    let state = reactive({
      num: 1,
      type: '奇数',
    })
    const autoPlay = () => {
      state.num++
      if (state.num == 5) {
        state.num = 0
      }
    }
    const play = () => {
      timer = setInterval(autoPlay, 1000)
    }
    onMounted(() => {
      //挂载完成
      play()
    })
    onUpdated(() => {
      if (state.num % 2 == 0) {
        state.type = '偶数'
      } else {
        state.type = '奇数'
      }
    })
    onUnmounted(() => {
      //销毁
      clearInterval(timer)
    })
    return {
      ...toRefs(state),
    }
  },
}
</script>
```

::: tip
setup 是围绕 beforeCreate 和 created 生命周期钩子运行的，所以不需要显式地去定义。
:::

## provide 和 inject

1. 简介  
   provide()和 inject()可以实现嵌套组件之间的数据传递。这两个函数只能在 setup()函数中使用。父级组
   件中使用 provide()函数向下传递数据；子级组件中使用 inject()获取上层传递过来的数据
2. 使用
   父组件

```vue
<template>
  <div id="app">
    <h1>根组件</h1>
    <Demo1 />
    <Demo2 />
  </div>
</template>
<script>
import Demo1 from '@/components/demo1'
import Demo2 from '@/components/demo2'
// 1. 按需导入 provide
import { reactive, toRefs, provide } from 'vue'
export default {
  setup() {
    // 父级组件通过 provide 函数向子级组件共享数据
    //provide('要共享的数据名称', 被共享的数据)
    provide('globalColor', 'red')
  },
  components: {
    Demo1,
    Demo2,
  },
}
</script>
```

子组件 1

```vue
<template>
  <div>{{ name }}----{{ color }}</div>
</template>
<script>
import { reactive, computed, provide, inject, toRefs } from 'vue'
export default {
  setup(props) {
    //创建响应式数据对象
    const state = reactive({
      name: 'demo1',
      //调用 inject 函数时，通过指定的数据名称，获取到父级共享的数据
      color: inject('globalColor'),
    })
    return state
  },
}
</script>
```

子组件 2

```vue
<template>
  <div>{{ name }}----{{ color }}</div>
</template>
<script>
import { reactive, computed, provide, inject, toRefs } from 'vue'
export default {
  setup(props) {
    //创建响应式数据对象
    const state = reactive({
      name: 'demo2',
      //调用 inject 函数时，通过指定的数据名称，获取到父级共享的数据
      color: inject('globalColor'),
    })
    return state
  },
}
</script>
```

## Teleport

Teleport 组件可将部分 DOM 移动到 Vue app 之外的位置。比如项目中常见的 Dialog 组件

```vue
<button @click="dialogVisible = true">点击</button>
<teleport to="body">
   <div class="dialog" v-if="dialogVisible">
   </div>
</teleport>
```

## Suspense 异步组件

1. 简介  
   Suspense 组件用于在等待某个异步组件解析时显示后备内容。如 loading ，使用户体验更平滑。使用它，需在模板中声明，并包括两个命名插槽：default 和 fallback。Suspense 确保加载完异步内容时显示默认插槽，并将 fallback 插槽用作加载状态。
2. 什么时候使用

- 在页面加载之前显示加载动画
- 显示占位符内容
- 处理延迟加载的图像

3. 使用

```vue
// 插槽包裹异步组件
<Suspense>
  <template #default>
    <Async/>
  </template>
</Suspense>
// 具名插槽的缩写是在vue2.6.0新增，跟 v-on 和 v-bind 一样，v-slot
缩写,替换为字符 #。 // 例如 v-slot:header 可以被重写为 #header
```

真实的项目中踩过坑，若想在 setup 中调用异步请求，需在 setup 前加 async 关键字。这时，会受到警告 async setup() is used without a suspense boundary。

解决方案：在父页面调用当前组件外包裹一层 Suspense 组件。

```vue
// 插槽包裹渲染异步组件之前的内容
<Suspense>
  <template #fallback>
    <h1>Loading...</h1>
  </template>
</Suspense>
```

4. 如何运用
   父组件中定义

```vue
<Suspense>
  <template #default>
    <List />
  </template>
  <template #fallback>
    <div>loading......</div>
  </template>
</Suspense>
```

List 子组件中的处理

```javascript
import { getPage } from '@/api/http'
export default {
  async setup() {
    const res = await getPage()
    const state = reactive({
      items: res.data.data,
    })
    return {
      ...toRefs(state),
    }
  },
}
```



1. 响应式系统：Proxy vs Object.defineProperty
核心话术： “Vue 3 使用 Proxy 重构了响应式系统，解决了 Vue 2 无法监听新增属性、删除属性以及数组索引修改的痛点，同时带来了更好的性能。”

初始化性能： Vue 2 在 data 初始化时必须递归遍历对象的所有属性；Vue 3 的 Proxy 是懒处理（Lazy），只有在你访问到深层对象时，才会对其进行响应式转换。

多维拦截： Proxy 可以拦截多达 13 种操作（如 has、deleteProperty 等），而 defineProperty 只能拦截 get 和 set。

2. 虚拟 DOM：编译时优化 (Compiler-informed)
核心话术： “Vue 3 的 VDOM 不再是纯运行时的对比，它利用模板编译的信息，实现了‘动静分离’。”

Patch Flags (静态标记)： 在 VNode 创建时，如果节点是动态的，会打上标记（如数字 1 代表文本动态）。Diff 算法只比对有标记的属性，比对量级从“树的规模”下降到“动态节点的规模”。

Block Tree (块树)： Vue 3 会将模板切分成多个块，内部结构稳定的部分会被视为整体，更新时直接通过一个数组平级遍历动态节点，跳过整个静态子树。

3. Diff 算法：最长递增子序列 (LIS)
面试杀手锏： 如果面试官问“Vue 3 的 Diff 算法比 Vue 2 好在哪？”，一定要提到 最长递增子序列。

Vue 2 (双端比较)： 从两头向中间凑，处理简单位移还行，但复杂乱序时效率一般。

Vue 3 (快速 Diff)： 1.  先处理相同的前缀和后缀。
2.  对于中间的乱序部分，通过 最长递增子序列 算法计算出“哪些节点是可以保持原地不动的”，从而实现最小化移动次数。

💡 常见的面试连环追问
追问 1：为什么 ref 需要 .value 而 reactive 不需要？

答案： reactive 拦截的是对象。对于基本类型（字符串、数字），Proxy 无法拦截。Vue 3 通过把基本类型包装在一个对象的 value 属性上，利用该对象的 get/set 来实现响应式。

追问 2：Vue 3 既然用了 Proxy 这么快，为什么还要 Patch Flags 这种编译优化？

答案： Proxy 优化的是数据拦截，而 Patch Flags 优化的是 DOM 比对。两者维度不同。编译优化能让 Runtime 知道“哪里不需要动”，这比任何运行时算法都快。

追问 3：Composition API 相比 Options API 解决了什么问题？

答案： 逻辑复用（取代 Mixins 的命名冲突和来源不明问题）和代码组织（让同一功能的代码聚集在一起，而不是散落在 data/methods/mounted 中）。