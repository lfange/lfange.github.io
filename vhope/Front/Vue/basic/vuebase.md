---
icon: article
title: Vue基础
category:
  - Vue
---

## MVVM 模式

MVVM 模式，`M`即 model，数据模型；`V`即 view，视图；`VM`即 view-model，视图模型。

<!-- more -->

![](https://cdn.jsdelivr.net/gh/lfange/image_store/blog/20200204123438.png)

**理解**
首先，数据 Model 通过 Data Bindings 把数据绑定在 View 视图上，
当 View 视图有交互（有改变）的时候，Dom listeners 会自动监听，然后更新数据 Model。

**Q：什么是 MVVM 模式？**

A：MVVM 模式，第一个 M 代表数据模型，V 代表视图，VM 代表视图模型；
它的实际操作原理是：后台数据通过视图模型来渲染视图，就是页面。当用户在页面上进行操作的时候，
视图模型会自动监听到用户的操作，从而改变后台数据。

## 生命周期

### 实例生命周期钩子

[实例生命周期钩子 API](https://cn.vuejs.org/v2/guide/instance.html#实例生命周期钩子)

简单理解，生命周期钩子函数就是 vue 实例在某一个时间点会自动执行的函数。

<!-- more -->

```html
<div id="app">{{msg}}</div>

<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script>
  var vm = new Vue({
    el: '#app',
    data: {
      msg: 'Vue的生命周期',
    },
    beforeCreate: function () {
      console.group('------beforeCreate创建前状态------')
      console.log('el     : ' + this.$el) //undefined
      console.log('data   : ' + this.$data) //undefined
      console.log('msg: ' + this.msg) //undefined
    },
    created: function () {
      console.group('------created创建完毕状态------')
      console.log('el     : ' + this.$el) //undefined
      console.log('data   : ' + this.$data) //已被初始化
      console.log('msg: ' + this.msg) //已被初始化
    },
    beforeMount: function () {
      console.group('------beforeMount挂载前状态------')
      console.log(this.$el) // <div id="app">{{msg}}</div> 挂载前状态
    },
    mounted: function () {
      console.group('------mounted 挂载结束状态------')
      console.log(this.$el) // <div id="app">Vue的生命周期</div>   msg内容被挂载并渲染到页面
    },
    // 当data被修改之前
    beforeUpdate: function () {
      console.group('beforeUpdate 更新前状态===============》')
      console.log('el     : ' + this.$el)
      console.log(this.$el)
      console.log('data   : ' + this.$data)
      console.log('msg: ' + this.msg)
    },
    // 触发beforeUpdate之后，虚拟DOM重新渲染并应用更新
    // 当data被修改之后
    updated: function () {
      console.group('updated 更新完成状态===============》')
      console.log('el     : ' + this.$el)
      console.log(this.$el)
      console.log('data   : ' + this.$data)
      console.log('msg: ' + this.msg)
    },
    // 调用vm.$destroy() 销毁前
    beforeDestroy: function () {
      console.group('beforeDestroy 销毁前状态===============》')
      console.log('el     : ' + this.$el)
      console.log(this.$el)
      console.log('data   : ' + this.$data)
      console.log('msg: ' + this.msg)
    },
    // 调用vm.$destroy() 销毁后
    destroyed: function () {
      console.group('destroyed 销毁完成状态===============》')
      console.log('el     : ' + this.$el)
      console.log(this.$el)
      console.log('data   : ' + this.$data)
      console.log('msg: ' + this.msg)
    },
  })
</script>
```

## v-if vs v-show

[API](https://cn.vuejs.org/v2/guide/conditional.html#v-if-vs-v-show)

`v-if` 根据渲染条件决定是否把元素渲染到 DOM 页面，而`v-show`不管渲染条件是什么，都会把元素渲染到 DOM 页面，只是简单的切换 CSS 的显示隐藏。

<!-- more -->

如果需要非常频繁地切换，则使用 `v-show` 较好；如果在运行时条件很少改变，则使用 `v-if` 较好。

## 计算属性 vs 方法 vs 侦听属性

[API](https://cn.vuejs.org/v2/guide/computed.html#计算属性缓存-vs-方法)

如果一个功能同时可以使用计算属性(computed)、方法(methods)、侦听属性(watch)来实现的时候推荐使用计算属性。

<!-- more -->

| 计算属性                                 | 方法                                               | 侦听属性                                     |
| ---------------------------------------- | -------------------------------------------------- | -------------------------------------------- |
| 计算属性是基于它们的响应式依赖进行缓存的 | 每当触发重新渲染时，调用方法将**总会**再次执行函数 | 有缓存，但相比计算属性，实现起来要复杂很多。 |

## 列表渲染

[数组更新检测 API](https://cn.vuejs.org/v2/guide/list.html#数组更新检测) [对象更新检测 API](https://cn.vuejs.org/v2/guide/list.html#对象变更检测注意事项)

## 数组更新检测

#### 变异方法 (mutation method)

Vue 将被侦听的数组的变异方法进行了包裹，所以它们也将会触发视图更新。这些被包裹过的方法包括：

<!-- more -->

- `push()`末尾添加
- `pop()`末尾删除
- `shift()` 首位删除
- `unshift() ` 首位添加
- `splice()` 拼合
- `sort()` 排序
- `reverse()` 反转

[数组实例方法](https://lfange.com/pages/74d2ab3fbfeaaa68/#_3、实例方法)

### 替换数组

变异方法，顾名思义，会改变调用了这些方法的原始数组。相比之下，也有非变异 (non-mutating method) 方法，例如 `filter()`、`concat()` 和 `slice()` 。它们不会改变原始数组，而**总是返回一个新数组**。当使用非变异方法时，可以用新数组替换旧数组：

```js
example1.items = example1.items.filter(function (item) {
  return item.message.match(/Foo/)
})
```

你可能认为这将导致 Vue 丢弃现有 DOM 并重新渲染整个列表。幸运的是，事实并非如此。Vue 为了使得 DOM 元素得到最大范围的重用而实现了一些智能的启发式方法，所以用一个含有相同元素的数组去替换原来的数组是非常高效的操作。

### 注意事项

**由于 JavaScript 的限制，Vue 不能检测以下数组的变动**

1. 当你利用索引直接设置一个数组项时，例如：`vm.items[indexOfItem] = newValue`
2. 当你修改数组的长度时，例如：`vm.items.length = newLength`

为了解决第一类问题，以下两种方式都可以实现和 `vm.items[indexOfItem] = newValue` 相同的效果，同时也将在响应式系统内触发状态更新：

```js
// Vue.set
Vue.set(vm.items, indexOfItem, newValue)
// Array.prototype.splice
vm.items.splice(indexOfItem, 1, newValue)
```

你也可以使用 [`vm.$set`](https://cn.vuejs.org/v2/api/#vm-set) 实例方法，该方法是全局方法 `Vue.set` 的一个别名：

```js
vm.$set(vm.items, indexOfItem, newValue)
```

为了解决第二类问题，你可以使用 `splice`：

```js
vm.items.splice(newLength)
```

### 对象变更检测注意事项

> 列表循环对象示例
>
> ```html
> <div v-for="(item, key, index) in obj"></div>
> ```

还是由于 JavaScript 的限制，**Vue 不能检测对象属性的添加或删除**：

```js
var vm = new Vue({
  data: {
    a: 1,
  },
})
// `vm.a` 现在是响应式的

vm.b = 2
// `vm.b` 不是响应式的
```

对于已经创建的实例，Vue 不允许动态添加根级别的响应式属性。

但是，可以使用 `Vue.set(object, propertyName, value)` 方法向嵌套对象添加响应式属性。例如，对于：

```js
var vm = new Vue({
  data: {
    userProfile: {
      name: 'Anika',
    },
  },
})
```

你可以添加一个新的 `age` 属性到嵌套的 `userProfile` 对象：

```js
Vue.set(vm.userProfile, 'age', 27)
```

你还可以使用 `vm.$set` 实例方法，它只是全局 `Vue.set` 的别名：

```js
vm.$set(vm.userProfile, 'age', 27)
```

有时你可能需要为已有对象赋值多个新属性，比如使用 `Object.assign()` 或 `_.extend()`。在这种情况下，你应该用两个对象的属性创建一个新的对象。所以，如果你想添加新的响应式属性，不要像这样：

```js
Object.assign(vm.userProfile, {
  age: 27,
  favoriteColor: 'Vue Green',
})
```

你应该这样做：

```js
vm.userProfile = Object.assign({}, vm.userProfile, {
  age: 27,
  favoriteColor: 'Vue Green',
})
```

### 总结

一、使数组更新具有响应式可使用的办法：

1. 使用变异方法 （push、pop、unshift、shift、splice、sort、reverse）
2. 替换数组引用 （对不改变原数组的方法可使用替换数组）
3. 使用 Vue.set()方法

二、使对象属性的添加或删除具有响应式可使用的办法：

1. 替换对象引用
2. 使用 Vue.set()方法

三、Vue.set() 语法：

```js
// 向数组更新数据
Vue.set(vm.items, indexOfItem, newValue)
即 Vue.set(原数组, 索引, 新数据)

// 向对象更新数据
Vue.set(object, propertyName, value)
即 Vue.set(原对象, 属性名, 值)
```

> vm.$set() 实例方法是 Vue.set() 全局方法的别名

## Mixin 混入

### 基础

混入 (mixin) 提供了一种非常灵活的方式，来分发 Vue 组件中的可复用功能。一个混入对象可以包含任意组件选项。当组件使用混入对象时，所有混入对象的选项将被“混合”进入该组件本身的选项。

<!-- more -->

> 组件选项：指的是组件对象中的 `data`、`created`、`methods` 等等选项。
>
> 可通过 `this.$options` 查看选项

例子：

```js
// 定义一个混入对象
var myMixin = {
  created: function () {
    this.hello()
  },
  methods: {
    hello: function () {
      console.log('hello from mixin!')
    },
  },
}

// 定义一个使用混入对象的组件
var Component = Vue.extend({
  mixins: [myMixin],
})

var component = new Component() // => "hello from mixin!"
```

**通俗讲，就是把组件的部分代码抽离出来，再"混合"进入组件。当多个组件有相同的选项代码时，可以把相同的选项代码抽离到一个文件，再混入到每个组件，从而达到共享部分代码的目的。**

### 选项合并

当组件和混入对象含有同名选项时，这些选项将以恰当的方式进行“合并”。

比如，数据对象在内部会进行递归合并，并**在发生冲突时以组件数据优先**。

```js
var mixin = {
  data: function () {
    return {
      message: 'hello',
      foo: 'abc',
    }
  },
}

new Vue({
  mixins: [mixin],
  data: function () {
    return {
      message: 'goodbye',
      bar: 'def',
    }
  },
  created: function () {
    console.log(this.$data)
    // => { message: "goodbye", foo: "abc", bar: "def" }
    // message同名，组件数据优先，而foo被混入
  },
})
```

**同名钩子函数将合并为一个数组，因此都将被调用**。另外，混入对象的钩子将在组件自身钩子**之前**调用。

```js
var mixin = {
  created: function () {
    console.log('混入对象的钩子被调用')
  },
}

new Vue({
  mixins: [mixin],
  created: function () {
    console.log('组件钩子被调用')
  },
})

// => "混入对象的钩子被调用"
// => "组件钩子被调用"
```

值为对象的选项，例如 `methods`、`components` 和 `directives`，将被合并为同一个对象。两个对象键名冲突时，取组件对象的键值对。

```js
var mixin = {
  methods: {
    foo: function () {
      console.log('foo')
    },
    conflicting: function () {
      console.log('from mixin')
    },
  },
}

var vm = new Vue({
  mixins: [mixin],
  methods: {
    bar: function () {
      console.log('bar')
    },
    conflicting: function () {
      console.log('from self')
    },
  },
})

vm.foo() // => "foo"
vm.bar() // => "bar"
vm.conflicting() // => "from self"
```

注意：`Vue.extend()` 也使用同样的策略进行合并。

### 某项目中使用的 Mixin 示例

抽离各组件相同的代码：

```js
// mixin.js
export const playlistMixin = {
  computed: {
    ...mapGetters(['playlist']),
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    },
  },
  methods: {
    // 根据选项合并策略，此方法和组件中的方法同名时，则被覆盖。如组件中没有相同名称方法时则会使用此方法，从而抛出错误。
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method')
    },
  },
}
```

混入到组件：

```js
// 使用，可在多个组件中共用mixin的代码
import { playlistMixin } from '@/common/js/mixin' // 共享代码的引入
export default {
    mixins: [playlistMixin],
    methods: {
        handlePlaylist(playlist) { // 此方法可针对不同组件做不同处理
            ...
        }
    }
}
```
