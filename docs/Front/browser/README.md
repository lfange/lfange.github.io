<!--
 * @Author: fange 653398363@qq.com
 * @Date: 2023-02-02 09:49:22
 * @LastEditors: fange 653398363@qq.com
 * @LastEditTime: 2023-02-16 17:20:59
 * @FilePath: \lfange.github.io\docs\Front\browser\README.md
 * @Description: lfange`s personal blog!!! Good memory than rotten written!!!
 *
 * Copyright (c) 2023 by fange, All Rights Reserved.
-->

# 浏览器相关原理

## 浏览器是多进程

进程是 CPU 分配资源的最小单位

- Browser 进程：浏览器的主进程（负责协调、主控），只有一个。作用有

  1. 负责浏览器界面显示，与用户交互。如前进，后退等
  2. 负责各个页面的管理，创建和销毁其他进程
  3. 将 Renderer 进程得到的内存中的 Bitmap，绘制到用户界面上
  4. 网络资源的管理，下载等

- 第三方插件进程：每种类型的插件对应一个进程，仅当使用该插件时才创建
- GPU 进程：最多一个，用于 3D 绘制等
- 浏览器渲染进程（浏览器内核）（Renderer 进程，内部是多线程的）：默认每个 Tab 页面一个进程，互不影响。主要作用为

页面渲染，脚本执行，事件处理等

### 浏览器渲染进程（浏览器内核）

- GUI 渲染线程

  负责渲染浏览器界面，解析 HTML，CSS，构建 DOM 树和 RenderObject 树，布局和绘制等。
  当界面需要重绘（Repaint）或由于某种操作引发回流(reflow)时，该线程就会执行
  注意，GUI 渲染线程与 JS 引擎线程是互斥的，当 JS 引擎执行时 GUI 线程会被挂起（相当于被冻结了），GUI 更新会被保存在一个队列中等到 JS 引擎空闲时立即被执行。

- JS 引擎线程

  也称为 JS 内核，负责处理 Javascript 脚本程序。（例如 V8 引擎）
  JS 引擎线程负责解析 Javascript 脚本，运行代码。
  JS 引擎一直等待着任务队列中任务的到来，然后加以处理，一个 Tab 页（renderer 进程）中无论什么时候都只有一个 JS 线程在运行 JS 程序
  同样注意，GUI 渲染线程与 JS 引擎线程是互斥的，所以如果 JS 执行的时间过长，这样就会造成页面的渲染不连贯，导致页面渲染加载阻塞。

- 事件触发线程

  归属于浏览器而不是 JS 引擎，用来控制事件循环（可以理解，JS 引擎自己都忙不过来，需要浏览器另开线程协助）
  当 JS 引擎执行代码块如 setTimeOut 时（也可来自浏览器内核的其他线程,如鼠标点击、AJAX 异步请求等），会将对应任务添加到事件线程中
  当对应的事件符合触发条件被触发时，该线程会把事件添加到待处理队列的队尾，等待 JS 引擎的处理
  注意，由于 JS 的单线程关系，所以这些待处理队列中的事件都得排队等待 JS 引擎处理（当 JS 引擎空闲时才会去执行）

- 定时触发器线程

  传说中的 setInterval 与 setTimeout 所在线程
  浏览器定时计数器并不是由 JavaScript 引擎计数的,（因为 JavaScript 引擎是单线程的, 如果处于阻塞线程状态就会影响记计时的准确）
  因此通过单独线程来计时并触发定时（计时完毕后，添加到事件队列中，等待 JS 引擎空闲后执行）
  注意，W3C 在 HTML 标准中规定，规定要求 setTimeout 中低于 4ms 的时间间隔算为 4ms。

- 异步 http 请求线程

  在 XMLHttpRequest 在连接后是通过浏览器新开一个线程请求
  将检测到状态变更时，如果设置有回调函数，异步线程就产生状态变更事件，将这个回调再放入事件队列中。再由 JavaScript 引擎执行。

## 事件循环

JavaScript 的任务分为 `同步` 和 `异步`

- 同步任务： 同步任务都在**主线程(JS 引擎)**上执行，形成一个**执行栈**，在主线程上排队执行的任务，只有一个任务执行完毕才能执行下一个任务！
- 异步任务： **事件出发线程**管理着**任务队列**，异步任务不进入主线程，将异步任务压入事件任务队列，若有多个异步任务则需要在任务队列中排队等待，任务队列类似于缓冲区，任务下一步会被移到执行栈然后主线程执行调用执行栈的任务。

主线程运行时会产生执行栈，
栈中的代码调用某些 api 时，它们会在事件队列中添加各种事件（当满足触发条件后，如 ajax 请求完毕）

而栈中的代码执行完毕，就会读取事件队列中的事件，去执行那些回调
如此循环，这就是事件循环
注意，总是要等待栈中的代码执行完毕后才会去读取事件队列中的事件

## 宏任务和微任务

任务队列其实不止一种，根据任务种类的不同，可以分为**微任务（micro task）**队列和**宏任务（macro task）**队列。常见的任务如下：

- 宏任务： script( 整体代码)、setTimeout、setInterval、I/O、UI 交互事件、setImmediate(Node.js 环境)。
- 微任务： Promise、MutaionObserver、process.nextTick(Node.js 环境)。

## refenrence

[How browsers work](https://web.dev/howbrowserswork/)
[browsers_work](https://developer.mozilla.org/zh-CN/docs/Web/Performance/How_browsers_work)
