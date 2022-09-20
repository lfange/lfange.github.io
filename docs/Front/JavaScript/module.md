# 前端模块化

前端模块化的开发方式可以提高代码复用率，方便进行代码的管理。通常一个文件就是一个模块，有自己的作用域，只向外暴露特定的变量和函数。目前流行的 js 模块化规范有 CommonJS、AMD、CMD 以及 ES6 的模块系统

## CommonJS (Sync)

`commonJS`用**同步的方式加载模块**。在服务端，模块文件都存在本地磁盘，读取非常快，所以服务端基本使用, `Node.js`是`commonJS`规范的主要实践者，它有四个重要的环境变量为模块化的实现提供支持：`module`、`exports`、`require`、`global`。实际使用时，用`module.exports`定义当前模块对外输出的接口（不推荐直接用 exports），用 require 加载模块。

但是在浏览器端，限于网络原因，更合理的方案是使用异步加载。

```javascript
// 定义模块math.js
var basicNum = 0;
function add(a, b) {
  return a + b;
}
module.exports = { //在这里写上需要向外暴露的函数、变量
  add: add,
  basicNum: basicNum
}

// 引用自定义的模块时，参数包含路径，可省略.js
var math = require('./math');
math.add(2, 5);

// 引用核心模块时，不需要带路径
var http = require('http');
http.createService(...).listen(3000);
```

## AMD (Async) [require.js] 

`AMD`规范采用异步方式加载模块，模块的加载不影响它后面语句的运行。所有依赖这个模块的语句，都定义在一个回调函数中，等到加载完成之后，这个回调函数才会运行。这里介绍用`require.js`实现 AMD 规范的模块化：用 require.config()指定引用路径等，用 define()定义模块，用 require()加载模块。  
首先我们需要引入 require.js 文件和一个入口文件 main.js。main.js 中配置 require.config()并规定项目中用到的基础模块。

```javascript
/** 网页中引入require.js及main.js **/
<script src="js/require.js" data-main="js/main"></script>;

/** main.js 入口文件/主模块 **/
// 首先用config()指定各模块路径和引用名
require.config({
  baseUrl: "js/lib",
  paths: {
    jquery: "jquery.min", //实际路径为js/lib/jquery.min.js
    underscore: "underscore.min",
  },
});
// 执行基本操作
require(["jquery", "underscore"], function ($, _) {
  // some code here
});
```

引用模块的时候，我们将模块名放在`[]`中作为`reqiure()`的**第一参数**；如果我们定义的模块本身也依赖其他模块,那就需要将它们放在`[]`中作为`define()`的第一参数。

```javascript
// 定义math.js模块
define(function () {
  var basicNum = 0;
  var add = function (x, y) {
    return x + y;
  };
  return {
    add: add,
    basicNum: basicNum,
  };
});
// 定义一个依赖underscore.js的模块
define(["underscore"], function (_) {
  var classify = function (list) {
    _.countBy(list, function (num) {
      return num > 30 ? "old" : "young";
    });
  };
  return {
    classify: classify,
  };
});

// 引用模块，将模块放在[]内
require(["jquery", "math"], function ($, math) {
  var sum = math.add(10, 20);
  $("#sum").html(sum);
});
```

## CMD 和 sea.js

`require.js`在申明依赖的模块时会在第一时间加载并执行模块内的代码

```javascript
define(["a", "b", "c", "d", "e", "f"], function (a, b, c, d, e, f) {
  // 等于在最前面声明并初始化了要用到的所有模块
  if (false) {
    // 即便没用到某个模块 b，但 b 还是提前执行了
    b.foo();
  }
});
```

`CMD`也是一种模块化方式，不同点在于：**AMD 推崇依赖前置、提前执行**，**CMD 推崇依赖就近、延迟执行**。此规范其实是在 sea.js 推广过程中产生的。

```javascript
/** AMD写法 **/
define(["a", "b", "c", "d", "e", "f"], function(a, b, c, d, e, f) { 
     // 等于在最前面声明并初始化了要用到的所有模块
    a.doSomething();
    if (false) {
        // 即便没用到某个模块 b，但 b 还是提前执行了
        b.doSomething()
    } 
});

/** CMD写法 **/
define(function(require, exports, module) {
    var a = require('./a'); //在需要时申明
    a.doSomething();
    if (false) {
        var b = require('./b');
        b.doSomething();
    }
});

/** sea.js **/
// 定义模块 math.js
define(function(require, exports, module) {
    var $ = require('jquery.js');
    var add = function(a,b){
        return a+b;
    }
    exports.add = add;
});
// 加载模块
seajs.use(['math.js'], function(math){
    var sum = math.add(1+2);
});
```
## ES6 Module

ES6 在语言标准的层面上，实现了模块功能，而且实现得相当简单，旨在成为浏览器和服务器通用的模块解决方案。其模块功能主要由两个命令构成：export和import。export命令用于规定模块的对外接口，import命令用于输入其他模块提供的功能。

```javascript
/** 定义模块 math.js **/
var basicNum = 0;
var add = function (a, b) {
    return a + b;
};
export { basicNum, add };

/** 引用模块 **/
import { basicNum, add } from './math';
function test(ele) {
    ele.textContent = add(99 + basicNum);
}
```

如上例所示，使用import命令的时候，用户需要知道所要加载的变量名或函数名。其实ES6还提供了export default命令，为模块指定默认输出，对应的import语句不需要使用大括号。这也更趋近于ADM的引用写法。

```javascript
/** export default **/
//定义输出
export default { basicNum, add };
//引入
import math from './math';
function test(ele) {
    ele.textContent = math.add(99 + math.basicNum);
}
```

ES6的模块不是对象，import命令会被 JavaScript 引擎静态分析，在编译时就引入模块代码，而不是在代码运行时加载，所以无法实现条件加载。也正因为这个，使得静态分析成为可能。

## ES6 模块与 CommonJS 模块的差异

- CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。
- CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。
- CommonJS 模块的 require()是同步加载模块，ES6 模块的 import 命令是异步加载，有一个独立的模块依赖的解析阶段。

> CommonJS 加载的是一个对象（即 module.exports 属性），该对象只有在脚本运行完才会生成。而 ES6 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成

## reference

[JavaScript modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
[module-loader](https://es6.ruanyifeng.com/#docs/module-loader)
[前端模块化](https://juejin.cn/post/6844903576309858318)
