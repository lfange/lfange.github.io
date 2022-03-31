/**
 * 每个实例对象（object）都有一个私有属性（称之为 __proto__ ）指向它的构造函数的原型对象（prototype）。
 * 该原型对象也有一个自己的原型对象（__proto__），层层向上直到一个对象的原型对象为 null。
 * 根据定义，null 没有原型，并作为这个原型链中的最后一个环节。
 */

const obj = {
	num: 1,
	name: 'objp'
}

const myobj = Object.create(obj)
obj.num = 88
myobj.num += 1
// console.log('obj', obj.__proto__)
// console.log('myobj', myobj, myobj.num)


function f() {
	this.a = 1
	this.b = 2
}

const wa = new f()

// console.log('o', wa.__proto__)
// console.log('o', wa.constructor === f)
// console.log(Object.getPrototypeOf(f) === f.__proto__)


var a = {
	a: 2,
	m: function() {
		return this.a + 1;
	}
}

var p = Object.create(a)

// console.log('p', p.a, a.a)
p.a = 18231555
p.m()

// console.log('p', p.a, a.a, a.m())


function Graph() {
	this.vertices = [];
	this.edges = [];
}

Graph.prototype = {
	addVertex: function(v) {
		this.vertices.push(v);
	}
};

var g = new Graph();



// js垃圾回收《
var o = {
	a: {
		b: 2
	}
};
// 两个对象被创建，一个作为另一个的属性被引用，另一个被分配给变量o
// 很显然，没有一个可以被垃圾收集

var o2 = o; // o2变量是第二个对“这个对象”的引用

o = 1; // 现在，“这个对象”只有一个o2变量的引用了，“这个对象”的原始引用o已经没有
console.log('o', o)
console.log('o', o2)
var oa = o2.a; // 引用“这个对象”的a属性
// 现在，“这个对象”有两个引用了，一个是o2，一个是oa

o2 = "yo"; // 虽然最初的对象现在已经是零引用了，可以被垃圾回收了
// 但是它的属性a的对象还在被oa引用，所以还不能回收

oa = null; // a属性的那个对象现在也是零引用了
// 它可以被垃圾回收了
