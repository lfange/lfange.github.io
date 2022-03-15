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
console.log('obj', obj, obj.num)
console.log('myobj', myobj, myobj.num)


function f() {
	this.a = 1
	this.b = 2
}

const o = new f()

// console.log('o', o.__proto__)
// console.log('o', o.constructor === f)
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
  addVertex: function(v){
    this.vertices.push(v);
  }
};

var g = new Graph();

// console.log('g', g)
// console.dir(Graph)