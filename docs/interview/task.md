---
category:
  - Interview
---

# task

## ES5、ES6 如何实现继承

### 原型链继承

原型链继承的思想：一个引用类型继承另一个引用类型的属性和方法。

```javascript
function SuperType() {
  this.a = ['Super Type function', 'web']
}

function SubType() {}

SubType.prototype = new SuperType()
SubType.prototype.constructor = SuperType

const aty = new SubType()
const at1 = new SubType()
aty.a.push('Subtype i')
console.log('aty', aty.a) // ['Super Type function', 'web', 'Subtype i']
console.log('aty', at1.a) // ['Super Type function', 'web', 'Subtype i']
```

- 优点：
  父类新增原型方法/原型属性，子类都能访问到。
  简单、易于实现。

- 缺点：
  无法实现多继承。
  由于原型中的引用值被共享，导致实例上的修改会直接影响到原型。
  创建子类实例时，无法向父类构造函数传参。

### 构造函数继承

构造函数继承的思想：子类型构造函数中调用父类的构造函数，使所有需要继承的属性都定义在实例对象上。

```javascript
function SuperType(name) {
  this.name = name
  this.a = [1, 2, 3]
}

SuperType.prototype.say = function () {
  console.log('SuperType say', this.name)
}

function SubType(name) {
  SuperType.call(this, name)
}

var sub1 = new SubType()
var sub2 = new SubType()
// 传递参数
var sub3 = new SubType('Hzfe')
console.log(sub3.name) // Hzfe
// sub1.say() // 使用构造函数继承并没有访问到原型链，say 方法不能调用
sub1.a.push(4)

// 解决了原型链继承中子类实例共享父类引用属性的问题
console.log(sub1.a) // [1,2,3,4]
console.log(sub2.a) // [1,2,3]
console.log(sub1 instanceof SuperType) // false
```

- 优点：
  解决了原型链继承中子类实例共享父类引用属性的问题。
  可以在子类型构造函数中向父类构造函数传递参数。
  可以实现多继承（call 多个父类对象）。

- 缺点：
  实例并不是父类的实例，只是子类的实例。
  只能继承父类的实例属性和方法，不能继承原型属性和方法。
  无法实现函数复用，每个子类都有父类实例函数的副本，影响性能。

### 寄生组合式继承

借用构造函数来继承属性，使用混合式原型链继承方法。

```javascript
function inheritPrototype(subType, superType) {
  // prototype做一个浅拷贝
  subType.prototype = Object.create(superType.prototype)
  subType.prototype.constructor = subType
}

function SuperType(name) {
  this.name = name
}
SuperType.prototype.sayName = function () {
  return `Super call name is: ${this.name}`
}

function SubType(name, age) {
  SuperType.call(this, name)
  this.age = age
}
inheritPrototype(SubType, SuperType)

SubType.prototype.sayAge = function () {
  return `age is :${this.age}`
}
```

```javascript
function SuperType(name, age) {
  this.name = name
  this.age = age
}
SuperType.prototype.say = function () {
  return `name is ${this.name}, age is ${this.age}`
}

function Childs(name, age, color) {
  SuperType.call(this, name, age)
  const str = SuperType.prototype.say.call(this, name, age)
  console.log('Childs', str, this)
}

//过渡函数的原型继承父对象
function Over() {}
Over.prototype = SuperType.prototype
Childs.prototype = new Over()

let junjie = new Childs('junjie', 'not zero year old', 'greee')
console.log('junjie', junjie.say())
```

### ES6 Class

```javascript
class SuperType {
  constructor(a, b) {
    this.a = a
    this.b = b
  }

  getName() {
    return this.a + this.b
  }
}

class childs extends SuperType {
  constructor(a, b, age) {
    super(a, b)
    this.age = age
  }
  toString() {
    return `${this.getName()} is ${this.age}`
  }
}

let junjie = new childs('junjie', 'man', 'baby')
console.log('toString', junjie.toString()) // toString junjieman is baby
```

- 优点：
  解决了原型链继承中子类实例共享父类引用属性的问题。
  可以在子类型构造函数中向父类构造函数传递参数。
  可以实现多继承（call 多个父类对象）。

- 缺点：
  实例并不是父类的实例，只是子类的实例。
  只能继承父类的实例属性和方法，不能继承原型属性和方法。
  无法实现函数复用，每个子类都有父类实例函数的副本，影响性能。

###

## instanceOf 实现

`instanceof` 运算符用于检测构造函数的 `prototype` 属性是否出现在某个实例对象的原型链上

```javascript
function MyinstanceOf(left, right) {
  if (typeof left !== 'object' || left == null) return false
  //**`Object.getPrototypeOf()`** 方法返回指定对象的原型 ( 即, 内部[[Prototype]]属性）。
  let pro = Object.getPrototypeOf(left)
  while (true) {
    if (pro === right.prototype) return true
    if (pro === null) return false
    pro = Object.getPrototypeOf(pro)
  }
}
```

https://juejin.cn/post/7142690757722243102

前言
图片

省流：最终拿到了 58、UMU、便利蜂、虾皮、快手、腾讯、字节的 offer。

一面
闭包是什么? 闭包的用途?
简述事件循环原理
虚拟 dom 是什么? 原理? 优缺点?
vue 和 react 在虚拟 dom 的 diff 上，做了哪些改进使得速度很快?
vue 和 react 里的 key 的作用是什么? 为什么不能用 Index？用了会怎样? 如果不加 key 会怎样?
vue 双向绑定的原理是什么?
vue 的 keep-alive 的作用是什么？怎么实现的？如何刷新的?
vue 是怎么解析 template 的? template 会变成什么?
如何解析指令? 模板变量? html 标签
用过 vue 的 render 吗? render 和 template 有什么关系
【代码题】 实现一个节流函数? 如果想要最后一次必须执行的话怎么实现?

终面
【代码题】 去除字符串中出现次数最少的字符，不改变原字符串的顺序。

“ababac” —— “ababa”
“aaabbbcceeff” —— “aaabbb”
【代码题】 写出一个函数 trans，将数字转换成汉语的输出，输入为不超过 10000 亿的数字。

trans(123456) —— 十二万三千四百五十六
trans（100010001）—— 一亿零一万零一
58 (offer)
整体面试比较顺利, 就是没想到三轮远程面试后, 最终还去现场经历了一次交叉面和业务负责人面试, 不过 HR 确实是很热情也很专业。不过最终选择了其他 offer, 甚至有点感觉对不起大家的热情。

一面二面三面都很不错, 交叉面和业务负责人面试有点水, 就随便问问。

一面
对前端工程化的理解
前端性能优化都做了哪些工作
Nodejs 异步 IO 模型
libuv
设计模式
微前端
节流和防抖
react 有自己封装一些自定义 hooks 吗? vue 有自己封装一些指令吗
vue 向 react 迁移是怎么做的? 怎么保证兼容的
vue 的双向绑定原理
Node 的日志和负载均衡怎么做的
那前后端的分工是怎样的？哪些后端做哪些 node 做
给出代码的输出顺序
async function async1() {
console.log('async1 start');
await async2();
console.log('async1 end');
}
async function async2() {
console.log('async2');
}
console.log('script start');
setTimeout(function () {
console.log('setTimeout');
}, 0)
async1();
new Promise(function (resolve) {
console.log('promise1');
resolve();
console.log('promise2')
}).then(function () {
console.log('promise3');
});
console.log('script end');
【代码题】 给几个数组, 可以通过数值找到对应的数组名称

// 比如这个函数输入一个 1，那么要求函数返回 A
const A = [1,2,3];
const B = [4,5,6];
const C = [7,8,9];

function test(num) {

}
二面
了解过 vue3 吗?
webscoket 的连接原理
react 生命周期
redux 原理
vue 父子组件的通信方式
async await 的原理是什么?
async/await, generator, promise 这三者的关联和区别是什么?
【场景设计】 设计一个转盘组件, 需要考虑什么, 需要和业务方协调好哪些技术细节? 前端如何防刷

三面
【代码题】 数组转树, 写完后问如果要在树中新增节点或者删除节点, 函数应该怎么扩展

const arr = [{
id: 2,
name: '部门 B',
parentId: 0
},
{
id: 3,
name: '部门 C',
parentId: 1
},
{
id: 1,
name: '部门 A',
parentId: 2
},
{
id: 4,
name: '部门 D',
parentId: 1
},
{
id: 5,
name: '部门 E',
parentId: 2
},
{
id: 6,
name: '部门 F',
parentId: 3
},
{
id: 7,
name: '部门 G',
parentId: 2
},
{
id: 8,
name: '部门 H',
parentId: 4
}
]
交叉面
虚拟列表怎么实现?
做过哪些性能优化?
终面
都是一些项目相关
金山
一面感觉不错, 面试官非常专业, 态度也和蔼可亲; 终面的大哥比较盛气凌人, 疯狂 PUA, 聊完后让我降薪, 就直接告辞了。

一面
react 和 vue 在技术层面的区别
常用的 hook 都有哪些?
用 hook 都遇到过哪些坑?
了解 useReducer 吗
组件外侧 let a 1 组件内侧点击事件更改 a，渲染的 a 会发生改变吗？如果 let a 放在组件内部，有什么变化吗？和 useState 有什么区别？
了解过 vue3 吗?
Node 是怎么部署的? pm2 守护进程的原理?
Node 开启子进程的方法有哪些?
进程间如何通信?
css 三列等宽布局如何实现? flex 1 是代表什么意思？分别有哪些属性?
前端安全都了解哪些? xss csrf
csp 是为了解决什么问题的?
https 是如何安全通信的?
前端性能优化做了哪些工作?
【代码题】 不定长二维数组的全排列

// 输入 [['A', 'B', ...], [1, 2], ['a', 'b'], ...]

// 输出 ['A1a', 'A1b', ....]
【代码题】 两个字符串对比, 得出结论都做了什么操作, 比如插入或者删除

pre = 'abcde123'
now = '1abc123'

a 前面插入了 1, c 后面删除了 de
终面
【场景设计】 大数据列表如何设计平滑滚动和加载，下滑再上滑的操作，上下两个 buffer 区间如何变化和加载数据。

便利蜂 (offer)
整体面试比较顺利, 三位面试官也都比较健谈, 最终给了一个很高的总包。不过感觉面试题太简单, 给的钱又多, 有点担心就选择了其他 offer。

一面
纯聊项目

二面
js 中的闭包
解决过的一些线上问题
线上监控 对于 crashed 这种怎么监控? 对于内存持续增长，比如用了 15 分钟之后才会出现问题怎么监控
对于 linux 熟吗? top 命令的属性大概聊一下?
301 302 304 的区别
三面
【代码题】 sleep 函数

【代码题】 节流防抖

小红书
整体给我的感觉是为了面试而面试, 体验极差。

一面面试官只是机械的提问, 提问完也不认真听我的回答, 上一个问题跟下一个问题根本没有关联性, 就像是在对着题库随便选题。

二面面试时好像一直在电脑上聊天, 结束后说是会约三面, 过了大概两周说是只招 leader, 我不符合。

一面
输出什么? 为什么?
var b = 10;
(function b(){
b = 20;
console.log(b);
})();
代码输出顺序题
async function async1() {
console.log('1');
await async2();
console.log('2');
}

async function async2() {
console.log('3');
}

console.log('4');

setTimeout(function() {
console.log('5');
}, 0);

async1();

new Promise(function(resolve) {
console.log('6');
resolve();
}).then(function() {
console.log('7');
});

console.log('8');
async await 的原理是什么?
async/await, generator, promise 这三者的关联和区别是什么?
BFC 是什么? 哪些属性可以构成一个 BFC 呢?
postion 属性大概讲一下, static 是什么表现? static 在文档流里吗?
Webpack 的原理, plugin loader 热更新等等
Set 和 Map
vue 的 keep-alive 原理以及生命周期
vuex
【代码题】 ES5 和 ES6 的继承? 这两种方式除了写法, 还有其他区别吗?

【代码题】 EventEmitter

二面
浏览器从输入 url 开始发生了什么
react 生命周期
redux 的原理
vue 父子组件的通信方式
vue 的双向绑定原理
对 vue3 的了解? vue3 是怎么做的双向绑定?
【代码题】 使用 Promise 实现一个异步流量控制的函数, 比如一共 10 个请求, 每个请求的快慢不同, 最多同时 3 个请求发出, 快的一个请求返回后, 就从剩下的 7 个请求里再找一个放进请求池里, 如此循环。

UMU (offer)
前两面都是远程, 终面去了公司现场。到了之后先做了一份测试题, 大概就是考察基本认知能力的。完事后 CTO 来面试, 直接在现场小黑板上写题。大佬对各种技术都能侃侃而谈, 确实很厉害, 不过听说周六可能要加班, 而且担心稳定性, 就没选择这里。

一面
除了项目, 基本都是问的日常开发相关的东西, 比较实在

node.js 如何调试
charles map local/map remote
chrome devtool 如何查看内存情况
二面
koa 洋葱模型
中间件的异常处理是怎么做的？
在没有 async await 的时候, koa 是怎么实现的洋葱模型?
body-parser 中间件了解过吗
如果浏览器端用 post 接口上传图片和一些其他字段, header 里会有什么? koa 里如果不用 body-parser，应该怎么解析?
webscoket 的连接原理
https 是如何保证安全的? 是如何保证不被中间人攻击的?
终面
【代码题】 给一个字符串, 找到第一个不重复的字符

ababcbdsa
abcdefg
时间复杂度是多少?
除了给的两个用例, 还能想到什么用例来测试一下?
网易
一面直接挂掉, 代码题整体写的乱七八糟, 挂掉理所应当...

一面
你觉得 js 里 this 的设计怎么样? 有没有什么缺点啥的
vue 的响应式开发比命令式有什么好处
装饰器
vuex
generator 是如何做到中断和恢复的
function 和 箭头函数的定义有什么区别? 导致了在 this 指向这块表现不同
导致 js 里 this 指向混乱的原因是什么?
浏览器的事件循环
宏任务和微任务的区分是为了做什么? 优先级?
【代码题】 实现 compose 函数, 类似于 koa 的中间件洋葱模型

// 题目需求

let middleware = []
middleware.push((next) => {
console.log(1)
next()
console.log(1.1)
})
middleware.push((next) => {
console.log(2)
next()
console.log(2.1)
})
middleware.push((next) => {
console.log(3)
next()
console.log(3.1)
})

let fn = compose(middleware)
fn()

/_
1
2
3
3.1
2.1
1.1
_/

//实现 compose 函数
function compose(middlewares) {

}

【代码题】 遇到退格字符就删除前面的字符, 遇到两个退格就删除两个字符

// 比较含有退格的字符串，"<-"代表退格键，"<"和"-"均为正常字符
// 输入："a<-b<-", "c<-d<-"，结果：true，解释：都为""
// 输入："<-<-ab<-", "<-<-<-<-a"，结果：true，解释：都为"a"
// 输入："<-<ab<-c", "<<-<a<-<-c"，结果：false，解释："<ac" !== "c"

function fn(str1, str2) {

}

快手 (offer)
整体面试的感觉很专业, 面试态度也很认真, 考察的比较全面, 不过比较蛋疼的是 HR 面结束后拖了好久, 我 Shopee、腾讯、字节口头 offer 都拿到了, 快手最后才给的口头 offer, 也可能是想对比一下其他家的价格吧。

一面
小程序的架构? 双线程分别做的什么事情?
为什么小程序里拿不到 dom 相关的 api
代码输出题
console.log(typeof typeof typeof null);
console.log(typeof console.log(1));
this 指向题
var name = '123';

var obj = {
name: '456',
print: function() {
function a() {
console.log(this.name);
}
a();
}
}

obj.print();
【代码题】 实现一个函数, 可以间隔输出

function createRepeat(fn, repeat, interval) {}

const fn = createRepeat(console.log, 3, 4);

fn('helloWorld'); // 每 4 秒输出一次 helloWorld, 输出 3 次
【代码题】 删除链表的一个节点

function (head, node) {}
【代码题】 实现 LRU 算法

class LRU {
get(key) {
}

set(key, value) {
}
}
二面
Promise then 第二个参数和 catch 的区别是什么?
Promise finally 怎么实现的
作用域链
Electron 架构
微前端
webpack5 模块联邦
Webworker
三面
没有记录, 应该都是问的项目

高德
一面直接挂掉, 面试官一直怼着各种 api 考察记忆力, 都是一些非常偏非常不常用的 api。

比如 css 有没有用过 xx 属性, 是做什么的?
Promise 有个 xx 方法, 你知道是做什么的吗?
最终就是挂在了 css 的各种属性背诵上, 麻了, 面试的时候让候选人从头背这些 api 真的有意义吗?

一面
Symbol
useRef / ref / forwardsRef 的区别是什么?
useEffect 的第二个参数, 传空数组和传依赖数组有什么区别?
如果 return 了一个函数, 传空数组的话是在什么时候执行? 传依赖数组的时候是在什么时候执行?
flex 布局
ES5 继承
ES6 继承, 静态方法/属性和实例方法/属性 是什么时候挂载的
Promise 各种 api
各种 css 属性
Shopee (offer)
面试比较痛快, 一共两面。一下午直接搞定, 一面结束后直接约了一个小时后二面, 二面结束后直接约了一个小时后的 HR 面。但是最后谈薪的时候 HR 也是比较磨叽, 一直说要等快手或者字节的价格出来, 他们才会给价格, 说是这样才更有竞争力。

一面
各种缓存的优先级, memory disk http2 push?
小程序为什么会有两个线程? 怎么设计?
xss? 如何防范?
日志 如果大量日志堆在内存里怎么办?
【代码题】 深拷贝

const deepClone = (obj, m) => {

};

需要手写一个深拷贝函数 deepClone，输入可以是任意 JS 数据类型
【代码题】 二叉树光照，输出能被光照到的节点, dfs 能否解决?

输入: [1,2,3,null,5,null,4]
输出: [1,3,4]

输入: []
输出: []

/\*\*

- @param {TreeNode} root
- @return {number[]}
  \*/
  function exposedElement(root) {

};

【代码题】 输出顺序题
setTimeout(function () {
console.log(1);
}, 100);

new Promise(function (resolve) {
console.log(2);
resolve();
console.log(3);
}).then(function () {
console.log(4);
new Promise((resove, reject) => {
console.log(5);
setTimeout(() => {
console.log(6);
}, 10);
})
});
console.log(7);
console.log(8);
【代码题】 作用域

var a=3;
function c(){
alert(a);
}
(function(){
var a=4;
c();
})();
【代码题】 输出题

function Foo(){
Foo.a = function(){
console.log(1);
}
this.a = function(){
console.log(2)
}
}

Foo.prototype.a = function(){
console.log(3);
}

Foo.a = function(){
console.log(4);
}

Foo.a();
let obj = new Foo();
obj.a();
Foo.a();
终面
错误捕捉
前端稳定性监控
前端内存处理
【代码题】 好多请求, 耗时不同, 按照顺序输出, 尽可能保证快, 写一个函数.

const promiseList = [
new Promise((resolve) => {
setTimeout(resolve, 1000)
}),
new Promise((resolve) => {
setTimeout(resolve, 1000)
}),
new Promise((resolve) => {
setTimeout(resolve, 1000)
})
]

fn(promiseList);
【代码题】 一个数组的全排列

输入一个数组 arr = [1,2,3]
输出全排列

[[1], [2], [3], [1, 2], [1, 3], ...., [1,2,3], [1,2,4] ....]
腾讯 (offer)
腾讯的整体流程是最长的, 一共面了 5 次, 整体面试难度倒不高, 只有前三轮是正经问技术问题, 后面更像是在聊天聊项目。

因为当时整体其他 offer 都快到 ddl 了, 就赶紧催 hr 给个数字, 最终薪资不及预期就没去了。

一面
普通函数和箭头函数的 this 指向问题
const obj = {
fn1: () => console.log(this),
fn2: function() {console.log(this)}
}

obj.fn1();
obj.fn2();

const x = new obj.fn1();
const y = new obj.fn2();
promise 相关的特性
vue 父子组件, 生命周期执行顺序 created mounted
vue3 添加了哪些新特性?
xss 的特点以及如何防范?
Http 2.0 和 http3.0 对比之前的版本, 分别做了哪些改进?
HTTP 3.0 基于 udp 的话, 如何保证可靠的传输?
TCP 和 UDP 最大的区别是什么?
CSP 除了能防止加载外域脚本, 还能做什么?
typescript is 这个关键字是做什么呢?
【代码题】 多叉树, 获取每一层的节点之和

function layerSum(root) {

}

const res = layerSum({
value: 2,
children: [
{ value: 6, children: [ { value: 1 } ] },
{ value: 3, children: [ { value: 2 }, { value: 3 }, { value: 4 } ] },
{ value: 5, children: [ { value: 7 }, { value: 8 } ] }
]
});

console.log(res);

二面
没记录, 应该是和前面遇到的面试题重复了

【代码题】 虚拟 dom 转真实 dom

const vnode = {
tag: 'DIV',
attrs: {
id: 'app'
},
children: [{
tag: 'SPAN',
children: [{
tag: 'A',
children: []
}]
},
{
tag: 'SPAN',
children: [{
tag: 'A',
children: []
},
{
tag: 'A',
children: []
}
]
}
]
}

function render(vnode) {

}
三面
前端安全 xss 之类的
Https 中间人攻击
前端 History 路由配置 nginx
【代码题】 有序数组原地去重

四面(gm?忘记了)
如何估算一个城市中的井盖数量

终面
都是项目

字节 (offer)
之前听说字节各种 hard, 给我吓惨了, 不过可能是运气好, 碰到的题都很简单。

一面
【代码题】 二叉树层序遍历, 每层的节点放到一个数组里

给定一个二叉树，返回该二叉树层序遍历的结果，（从左到右，一层一层地遍历）
例如：
给定的二叉树是{3,9,20,#,#,15,7},
该二叉树层序遍历的结果是 [ [3], [9,20], [15,7]
]
【代码题】 实现一个函数, fetchWithRetry 会自动重试 3 次，任意一次成功直接返回

【代码题】 链表中环的入口节点

对于一个给定的链表，返回环的入口节点，如果没有环，返回 null
二面
截图怎么实现
qps 达到峰值了，怎么去优化
谷歌图片, 如果要实现一个类似的系统或者页面, 你会怎么做?
最小的 k 个数
节流防抖
sleep 函数
js 超过 Number 最大值的数怎么处理?
64 个运动员, 8 个跑道, 如果要选出前四名, 至少跑几次?
前端路由 a -> b -> c 这样前进, 也可以返回 c -> b -> a, 用什么数据结构来存比较高效
node 服务治理
【代码题】 多叉树指定层节点的个数

三面
【代码题】 叠词的数量

Input: 'abcdaaabbccccdddefgaaa'
Output: 4

1. 输出叠词的数量
2. 输出去重叠词的数量
3. 用正则实现
   写在后面
   最近的整体行情好像更差了, Shopee 也传出了很多毁 offer 的事情, 当时幸亏没去...

不过劝想看机会的大伙还是骑驴找马, 可以先简单试试水, 看看行情到底如何, 不要只听网友怎么说。

最终愿大家变成 offer 收割机, 每个人都能拿到自己心仪的 offer。

往期推荐

我相信这是 Vue3 复用代码的正确姿势！
面试官：你工作 2 年了，这么简单的问题你都答不上来？
你只会用前端数据埋点 SDK 吗？

最后

```

```
