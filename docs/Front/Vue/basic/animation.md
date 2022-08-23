# transition过渡&动画

[API](https://cn.vuejs.org/v2/guide/transitions.html)

## 使用

需要设置动画的元素或组件要在外边包裹一个`<transition>`标签，设置自定义的`name`，vue会根据元素的切换（进入/离开）过程添加相应的css类名，你可以**自由地使用css类名来设置css过渡&动画**。
<!-- more -->
## 过渡的类名

在进入/离开的过渡中，会有 6 个 class 切换。

**各类名的生命周期**

* 进入
  * `v-enter` 只存在于第一帧
  * `v-enter-active` 第一帧到最后一帧，结束后移除
  * `v-enter-to` 第二帧到最后一帧，结束后移除

* 离开
  * `v-leave` 只存在于第一帧
  * `v-leave-active` 第一帧到最后一帧，结束后移除
  * `v-leave-to` 第二帧到最后一帧，结束后移除

如果你使用一个没有`name`的`<transition>` ，则 `v-` 是这些类名的默认前缀。如果你使用了`name="fade"`，那么 `v-` 前缀会替换为 `fade-`。


### 组件中使用的示例

```html
<template>
    <transition name="slide">
         <div class="add-song">
             ...
        </div>
    </transition>    
<template>
```

```css
 .add-song
    &.slide-enter-active, &.slide-leave-active
      transition: all 0.3s
    &.slide-enter, &.slide-leave-to
      transform: translate3d(100%, 0, 0)
```

## vue中使用Animate.css库

### 自定义过渡类名

我们可以通过以下 attribute 来自定义过渡类名：

- `enter-class`
- `enter-active-class`
- `enter-to-class` (2.1.8+)
- `leave-class`
- `leave-active-class`
- `leave-to-class` (2.1.8+)
<!-- more -->
他们的优先级高于普通的类名，这对于 Vue 的过渡系统和其他第三方 CSS 动画库，如 [Animate.css](https://daneden.github.io/animate.css/)结合使用十分有用。



## 使用Animate.css库

```html
<transition
            name="custom-classes-transition"
            enter-active-class="animated tada"
            leave-active-class="animated bounceOutRight"
            >
    <p v-if="show">hello</p>
</transition>
```

按 [官方文档](https://github.com/daneden/animate.css) 引入Animate.css库，再配合vue的自定义过渡类名，指定`enter-active-class`和`leave-active-class`的自定义类，两者都要有`animated`类，用于说明其使用的是Animate.css库，再根据需求定义另外一个`动画类名`。

动画类名：在 [Animate官网](https://daneden.github.io/animate.css/) 获取。

## transition-group列表过渡

### 列表的进入/离开过渡

```html
<transition-group tag="ul"> <!--tag转为ul-->
    <li v-for="item in list" :key="item">{{item}}</li> <!--子元素要有key-->
</transition-group>
```

**注意**：列表元素一定要有`key`
<!-- more -->
```css
.v-enter,.v-leave-to{
  opacity: 0;
  transform: translateX(30px);
}
.v-enter-active,.v-leave-active{
  transition: all 1s;
}
```

## 列表的排序过渡

```css
.v-move {
  transition: transform 1s;
}
```