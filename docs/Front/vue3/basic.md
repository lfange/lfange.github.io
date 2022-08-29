# Vue3 新特性

## createApp

在 Vue 3 中，改变全局 Vue 行为的 API 现在被移动到了由新的 createApp 方法所创建的应用实例上。

```javascript
import { createApp } from "vue";
const app = createApp({});
```

调用 createApp 返回一个应用实例。该实例提供了一个应用上下文。应用实例挂载的整个组件树共享
相同的上下文，该上下文提供了之前在 Vue 2.x 中“全局”的配置。  
另外，由于 _createApp_ 方法返回应用实例本身，因此可以在其后链式调用其它方法
vue3.0 中使用 createApp 来创建 vue 实例

```javascript
import { createApp } from "vue";
const app = createApp({});
import { createApp } from "vue";
import App from "./App.vue";
const app = createApp(App);
app.mount("#app");
```

main.js 下加载 router、vuex

```javascript
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

const app = createApp(App);
app.use(store);
app.use(router);
app.mount("#app");

// 合并之后的代码：
createApp(App).use(store).use(router).mount("#app");
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
import { reactive } from "vue";
// 创建响应式数据对象
const state = reactive({ id: 1 });
```

3. 定义响应式数据供 template 使用

```vue ts
<script lang="ts">
import { defineComponent } from 'vue';
// 1)按需导入reactive函数
import { reactive } from "vue"
export default defineComponent({
  // 2)在setup()函数中调用reactive()函数，创建响应式数据对象
  setup() {
    //创建响应式数据对象
    const state = reactive({
      name: 'Jack'
    })
    //setup函数中将响应式数据对象return出去供template使用
    return state
  }
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

### 简介

ref()函数用来根据给定的值创建一个响应式的数据对象，ref()函数调用的返回值是一个对象，这个对象上只包含一个 value 属性

### 基本用法

```vue
<template>
  <div>
    <p>{{ count }}</p>
    <button @click="change()">click</button>
  </div>
</template>
<script>
import { ref } from "vue"
export default {
  setup() {
    var count = ref(10); //初始化值为10
    const change = () => { //方法的定义
      count.value += 1; //想改变值或获取值 必须.value
    }
    return {
      count,
      change
    };
  }
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
import { ref, reactive, onMounted } from "vue"
export default {
  setup() {
    const state = reactive({
      count: ref(99)
    })
    onMounted(() => { //生命周期-挂载完成
      setInterval(function () {
        state.count += 10
      }, 1000)
    })
    return state;
  }
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
import { reactive } from "vue";
export default {
  setup() {
    let count = reactive(10);
    // let state = reactive({ count: 10 }); //对象可同步渲染
    function change() {
      console.log(count);
      count += 1; //页面不会同步渲染
      // state.count += 1
    }
    return { count, change };
  },
};
</script>
```

运行发现，基本数据传递给 reactive，reactive 并不会将它包装成 porxy 对象，并且当数据变化时，界面不会同步渲染变化

## toRefs

### 简介

toRefs()函数可以将 reactive()创建出来的响应式对象，转换为普通对象，只不过这个对象上的每个属性节点，都是 ref()类型的响应式数据  
比如：当想要从一个组合逻辑函数中返回响应式对象时，用 toRefs 是很有效的，该 API 让消费组件可以解构 / 扩展（使用 ... 操作符）返回的对象，并不会丢失响应性

### 使用

```vue
<template>
  <div>
    <p>{{ count }}</p>
  </div>
</template>
<script>
import { reactive, toRefs } from "vue";
export default {
  setup() {
    let state = reactive({ count: 10 });
    return {
      ...toRefs(state)
    };
  }
};
</script>
```

## computed
### 简介
computed()用来创建计算属性，computed()函数的返回值是一个 ref 的实例

### 使用
```vue
<template>
  <div>
    <p>{{ money }}</p>
    <button @click="change()">click</button>
  </div>
</template>
<script>
import { reactive, toRefs, computed } from "vue";
export default {
  setup() {
    let state = reactive({
      id: 10,
      money: computed(() => state.id + 10) //计算属性的方式
    });
    function change() {
      state.id += 1;
      console.log(state.id);
    }
    return {
      ...toRefs(state),
      change
    }
  },
};
</script>
```

## watch
### 简介
watch() 函数用来监视某些数据项的变化，从而触发某些特定的操作
### 使用
```vue
<template>
  <div>
    <p>{{ id }}</p>
    <p>{{ type }}</p>
    <button @click="change()">click</button>
  </div>
</template>
<script>
import { reactive, toRefs, watch } from "vue";
export default {
  setup() {
    let state = reactive({
      id: 10,
      type: '偶数'
    });
    //监听state.id的值的变化
    // 创建监听，并得到停止函数
    const stope = watch(() => state.id, (cur, old) => {
      if (cur % 2 == 0) {
        state.type = '偶数'
      } else {
        state.type = '奇数'
      }
    })
    function change() {
      state.id += 1;
      if(state.id == 15){
        // 调用停止函数，清除对应的监听
        stop()
      }
    }
    return {
      ...toRefs(state),
      change
    }
  },
};
</script>
```

## watch
### 简介

### 使用