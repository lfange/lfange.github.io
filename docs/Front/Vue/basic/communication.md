# 组件通信

## 父子组件

父子组件通信主要是`props/emit`、`parent/children`、`ref`

### props/$emit

父组件中，通过给子组件标签v-bind绑定属性的方式传入值
```html
<ComponentName v-bind:name="value"></ComponentName>
```
> 如果不使用v-bind传入的值为字符串，使用v-bind绑定传入的值为表达式。
<!-- more -->
子组件中，通过props对象接收值
```javascript
 props: {
    name: { // 接收父组件传入值
        type: String || ...,
        default: ''
    }
 }
```

#### 单向数据流
所有的 prop 都使得其父子 prop 之间形成了一个单向下行绑定：父级 prop 的更新会向下流动到子组件中，但是反过来则不行。这样会防止从子组件意外改变父级组件的状态，从而导致你的应用的数据流向难以理解。 

#### **子组件不能直接修改父组件传入的值**

这里有两种常见的试图改变一个 `prop` 的情形：

1. 这个 prop 用来传递一个初始值；这个子组件接下来希望将其作为一个本地的 prop 数据来使用。在这种情况下，最好定义一个本地的 data 属性并将这个 prop 用作其初始值：
```js
props: ['initialCounter'],
data: function () {
  return {
    counter: this.initialCounter
  }
}
```
2. 这个 prop 以一种原始的值传入且需要进行转换。在这种情况下，最好使用这个 prop 的值来定义一个计算属性：
```js
props: ['size'],
computed: {
  normalizedSize: function () {
    return this.size.trim().toLowerCase()
  }
}
```

### 子组件传值给父组件

[API](https://cn.vuejs.org/v2/guide/components.html#监听子组件事件)

子组件通过`$emit`派发事件和值给父组件（值可以有多个）
```js
this.$emit('fnX', value)
```
<!-- more -->
父组件通过`v-on`绑定子组件派发的事件，并触发一个新的事件，新的事件内可以接收传来的值
```html
<ComponentName @fnX="fnY"></ComponentName>

methods: {
	fnY(value) {
		console.log(value)
	}
}
```

### 父组件调用子组件方法传入值

通过`ref`引用调用子组件内的方法并传入参数

父组件：

```js
<子组件标签  ref="refName"></子组件标签>

methods: {
    fnX(x) {
      this.$refs.refName.fnY(x) // 调用子组件方法并传入值
    }
}
```

子组件：

```js
methods: {
    fnY(x) {
      this.x = x
    }
  }
}
```

## 向子|孙组件传值

向子孙传值主要是用`attrs/$listeners`、`provide/inject API`、`Vuex`

### $attrs/$listeners

用在父组件传递数据给子组件或者孙组件，`$attrs`继承所有的父组件属性（除了`prop`传递的属性、`class`和`style`）

当一个组件没有声明任何 prop 时，这里会包含所有父作用域的绑定 ( class 和 style 除外 )，并且可以通过 v-bind="$attrs" 传入内部组件。通常配合 inheritAttrs 选项一起使用。

`$listeners`是一个对象，包含了父作用域中的v-on事件监听器，可以配合v-on="$listeners"将所有的事件监听器指向这个组件的某个特定的子元素

### provide/inject

祖先组件中通过provider来提供变量，然后在孙组件中通过inject来注入变量

procide/inject API主要解决了跨域组件间的通讯问题，不过它的使用场景，主要是子组件获取上级组件的状态，跨级组件间建立了一种主动提供与依赖注入的关系


## 非父子组件间传值

子组件1中把值传到父组件,父组件获取值传入子组件2

父组件：

```js
<子组件1 @方法名x="方法名y"></子组件1>
<子组件2 :值名称x="值x"></子组件2 >
data() {
	return {
	 值x: ''
	}
},
methods: {
	方法名y(值) {
		this.值x = 值
	}
}

```

子组件1：

```js
this.$emit('方法名x', 值) // 传出值
```

子组件2：

```js
props: {
    值名称x: { // 接收父组件传入值
        type: String,
        default: ''
    }
}
```

当组件的嵌套多时，非父子组件间传值就显得复杂，除了上面的方法和使用[vuex](https://vuex.vuejs.org/zh/)实现之外，还可以通过`eventBus`（或者叫 总线/发布订阅模式/观察者模式）的方式实现非父子组件间传值。

<!-- more -->

```html
<div id="root">
    <child1 content="组件1：点我传出值"></child1>
    <child2 content="组件2"></child2>
</div>

<script type="text/javascript">
	Vue.prototype.bus = new Vue()
	// 每个Vue原型上都会有bus属性,而且指向同一个Vue实例
	Vue.component('child1', {
		props: {
			content: String
		},
		template: '<button @click="handleClick">{{content}}</button>',
		methods: {
			handleClick(){
				this.bus.$emit('change', '我是组件1过来的~') // 触发change事件，传出值
			}
		}
	})

	Vue.component('child2', {
		data() {
			return {
				childVal: ''
			}
		},
		props: {
			content: String,
		},
		template: '<button>{{content}} + {{childVal}}</button>',
		mounted() {
			this.bus.$on('change', (msg) => { // 绑定change事件，执行函数接收值
				this.childVal = msg
			})
		}
	})

	var vm = new Vue({
		el: '#root'
	})
</script>
```
上面代码中，在Vue原型上绑定一个`eventbus`属性，指向一个Vue实例，之后每个Vue实例都会有一个`eventbus`属性。

> 此方法传值，不限于兄弟组件之间，其他关系组件间都适用。
