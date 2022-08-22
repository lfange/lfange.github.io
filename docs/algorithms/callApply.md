# 实现call bind apply

### call bind apply的区别
 > call 、bind 、 apply 这三个函数的第一个参数都是 this 的指向对象，第二个参数差别就来了：
 >　call的参数是直接放进去的，第二第三第n个参数全都用逗号分隔，直接放到后面  obj.myFun.call(db,'成都', ... ,'string' )；
 >　　　apply的所有参数都必须放在一个数组里面传进去  obj.myFun.apply(db,['成都', ..., 'string' ]);
 >　　　bind除了返回是函数以外，它 的参数和call 一样。
 　　当然，三者的参数不限定是string类型，允许是各种类型，包括函数 、 object 等等！

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