# 5555

## MVVM模式

MVVM模式，`M`即 model，数据模型；`V`即 view，视图；`VM`即 view-model，视图模型。
<!-- more -->
![](https://cdn.jsdelivr.net/gh/lfange/image_store/blog/20200204123438.png)

**理解**
首先，数据Model通过Data Bindings把数据绑定在View视图上，
当View视图有交互（有改变）的时候，Dom listeners会自动监听，然后更新数据Model。


**Q：什么是MVVM模式？**

A：MVVM模式，第一个M代表数据模型，V代表视图，VM代表视图模型；
它的实际操作原理是：后台数据通过视图模型来渲染视图，就是页面。当用户在页面上进行操作的时候，
视图模型会自动监听到用户的操作，从而改变后台数据。

## 生命周期

### 实例生命周期钩子

[实例生命周期钩子API](https://cn.vuejs.org/v2/guide/instance.html#实例生命周期钩子)

简单理解，生命周期钩子函数就是vue实例在某一个时间点会自动执行的函数。
<!-- more -->

```html
<div id="app">{{msg}}</div>

<script src="https://cdn.bootcss.com/vue/2.4.2/vue.js"></script>
<script>
  var vm = new Vue({
    el: '#app',
    data: {
      msg: 'Vue的生命周期'
    },
    beforeCreate: function() {
      console.group('------beforeCreate创建前状态------');
      console.log("el     : " + this.$el); //undefined
      console.log("data   : " + this.$data); //undefined 
      console.log("msg: " + this.msg) //undefined 
    },
    created: function() {
      console.group('------created创建完毕状态------');
      console.log("el     : " + this.$el); //undefined
      console.log("data   : " + this.$data); //已被初始化 
      console.log("msg: " + this.msg); //已被初始化
    },
    beforeMount: function() {
      console.group('------beforeMount挂载前状态------');
      console.log(this.$el);// <div id="app">{{msg}}</div> 挂载前状态
    },
    mounted: function() {
      console.group('------mounted 挂载结束状态------');
      console.log(this.$el);// <div id="app">Vue的生命周期</div>   msg内容被挂载并渲染到页面
    },
      // 当data被修改之前
    beforeUpdate: function () {
      console.group('beforeUpdate 更新前状态===============》');
      console.log("el     : " + this.$el);
      console.log(this.$el);   
      console.log("data   : " + this.$data); 
      console.log("msg: " + this.msg); 
    },
      // 触发beforeUpdate之后，虚拟DOM重新渲染并应用更新
      // 当data被修改之后
    updated: function () {
      console.group('updated 更新完成状态===============》');
      console.log("el     : " + this.$el);
      console.log(this.$el); 
      console.log("data   : " + this.$data); 
      console.log("msg: " + this.msg); 
    },
      // 调用vm.$destroy() 销毁前
    beforeDestroy: function () {
      console.group('beforeDestroy 销毁前状态===============》');
      console.log("el     : " + this.$el);
      console.log(this.$el);    
      console.log("data   : " + this.$data); 
      console.log("msg: " + this.msg); 
    },
       // 调用vm.$destroy() 销毁后
    destroyed: function () {
      console.group('destroyed 销毁完成状态===============》');
      console.log("el     : " + this.$el);
      console.log(this.$el);  
      console.log("data   : " + this.$data); 
      console.log("msg: " + this.msg)
    }
  })
</script>
```

## Demo

<p class="codepen" data-height="265" data-theme-id="light" data-default-tab="js,result" data-user="lfange" data-slug-hash="GRJZWjb" style="height: 265px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; border: 2px solid; margin: 1em 0; padding: 1em;" data-pen-title="生命周期钩子">
  <span>See the Pen <a href="https://codepen.io/lfange/pen/GRJZWjb">
  生命周期钩子</a> by lfange (<a href="https://codepen.io/lfange">@lfange</a>)
  on <a href="https://codepen.io">CodePen</a>.</span>
</p>
<script async src="https://static.codepen.io/assets/embed/ei.js"></script>



## 生命周期图示

![](https://cdn.jsdelivr.net/gh/lfange/image_store/blog/20200204152241.png)