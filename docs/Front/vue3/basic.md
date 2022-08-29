# VUE3 新特性

## vue3 项目的创建

### 安装 vue-cli 脚手架构建工具

vue-cli 提供一个官方命令行工具，可用于快速搭建大型单页应用。
输入命令

```javascript
cnpm install -g @vue/cli
```

查看版本，要求 vue-cli 版本在 4.5 以上，可以创建 vue3 项目

### 创建 vue3 项目

vue create 项目名称
手动安装  
createApp
在 Vue 3 中，改变全局 Vue 行为的 API 现在被移动到了由新的 createApp 方法所创建的应用实例上。

```javascript
import { createApp } from "vue";
const app = createApp({});
```

调用 createApp 返回一个应用实例。该实例提供了一个应用上下文。应用实例挂载的整个组件树共享
相同的上下文，该上下文提供了之前在 Vue 2.x 中“全局”的配置。
另外，由于 createApp 方法返回应用实例本身，因此可以在其后链式调用其它方法
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

```javascript
// 1)按需导入reactive函数
import { reactive} from "vue"
// 2)在setup()函数中调用reactive()函数，创建响应式数据对象
setup(){
//创建响应式数据对象
const state = reactive({
name:'abc'
})
//setup函数中将响应式数据对象return出去供template使用
return state
}
// 3)在template中访问响应式数据
<template>
<div>
{{name}}
</div>
</template>
```

## ref 的使用
