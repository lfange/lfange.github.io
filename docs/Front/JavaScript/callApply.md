# call bind apply

## 作用和区别
1. apply 、 call 、bind 三者都是用来改变函数的this对象的指向的；
2. apply 、 call 、bind 三者第一个参数都是this要指向的对象，也就是想指定的上下文；
3. apply 、 call 、bind 三者都可以利用后续参数传参；  
bind 是返回对应函数，便于稍后调用；apply 、call 则是立即调用 。

 - 第二个参数的区别：
	 - call的参数是直接放进去的，第二第三第n个参数全都用逗号分隔，直接放到后面obj.myFun.call(db,'成都',...'string' );
	 - apply的所有参数都必须放在一个数组里面传进去  obj.myFun.apply(db,['成都', ..., 'string' ]);
	 - bind除了返回是**函数**以外，它的参数和call 一样。  
当然，三者的参数不限定是string类型，允许是各种类型，包括函数 、 object 等等！

## apply、call

在 javascript 中，call 和 apply 都是为了改变某个函数运行时的上下文（context）而存在的，换句话说，就是为了改变函数体内部 this 的指向。
JavaScript 的一大特点是，函数存在「定义时上下文」和「运行时上下文」以及「上下文是可以改变的」这样的概念。

```javascript
function Color() {}
 
Color.prototype = {
    color: "red",
    say: function() {
        console.log("My color is " + this.color);
    }
}
 
var cColor = new Color;
cColor.say();    //My color is red

const myfruits = {
	color: 'yellow'
}
```

call apply 使用cColor的方法
```javascript
cColor.say.call(myfruits);     //My color is yellow
cColor.say.apply(myfruits);    //My color is yellow
```

## 验证是否是数组
```javascript
functionisArray(obj){ 
    return Object.prototype.toString.call(obj) === '[object Array]' ;
}
```

## 定义一个 log 方法，让它可以代理 console.log 方法
```javascript
function log(){
  console.log.apply(console, arguments);
};
log(1);    //1
log(1,2);    //1 2
```
### 如果要给log打印加个前缀
```javascript
function log(){
  var args = Array.prototype.slice.call(arguments);
  args.unshift('log content: ');
 
  console.log.apply(console, args);
};
```

## bind
bind()方法会创建一个新函数，称为绑定函数，当调用这个绑定函数时，绑定函数会以创建它时传入 bind()方法的第一个参数作为 this，传入 bind() 方法的第二个以及以后的参数加上绑定函数运行时本身的参数按照顺序作为原函数的参数来调用原函数

### bind
```javascript
var unboundSlice = Array.prototype.slice;
var slice = Function.prototype.call.bind(unboundSlice);

// bind返回一个新函数调用
slice(arguments);
```

## call bind apply实现
### call的实现
 通过对象属性的方式调用函数，这个函数里面的this指向这个对象
  每次调用新增一个symbol属性，调用完毕删除
  这个symbol属性就是调用mycall方法的函数
  函数形参中使用...arg是将多个形参都塞到一个数组里，在函数内部使用arg这个变量时，就是包含所有形参的数组
  在调用 context[fn](...arg)时候，...arg是为了展开数组，依次传入参数调用函数

```javascript
Function.prototype.myCall = function(context, ...arg) {
	const fn = Symbol('临时属性')
	context[fn] = this
	context[fn](...arg)
	delete context[fn]
}
```

### apply实现
```javascript
Function.prototype.myApply = function(context, arg) {
	const fn = Symbol('临时属性')
	context[fn] = this
	context[fn](...arg)
	delete context[fn]
}
```

### bind实现
```javascript
Function.prototype.myBind = function(context, ...firstarg) {
	const that = this
	const bindFn = function(...secoundarg) {
		return that.myCall(context, ...firstarg, ...secoundarg)
	}
	bindFn.prototype = Object.create(that.prototype)
	return bindFn
}

Function.prototype.myBind = function(objThis, ...params) {
	const thisFn = this; // 存储源函数以及上方的params(函数参数)
	// 对返回的函数 secondParams 二次传参
	let fToBind = function(...secondParams) {
		console.log('secondParams', secondParams, ...secondParams)
     // this是否是fToBind的实例 也就是返回的fToBind是否通过new调用
		const isNew = this instanceof fToBind
    // new调用就绑定到this上,否则就绑定到传入的objThis上
		const context = isNew ? this : Object(objThis) 
    // 用call调用源函数绑定this的指向并传递参数,返回执行结果
		return thisFn.call(context, ...params, ...secondParams); 
	};
   // 复制源函数的prototype给fToBind
	fToBind.prototype = Object.create(thisFn.prototype);
	return fToBind; // 返回拷贝的函数
}


const obj2 = {
	a: 1
}

var fnbind = test.myBind(obj2, 2)
fnbind(3)

function test() {
	console.log(this);
};

console.log(test.myCall(obj2, 2, 3, 4))
```