/**
 * 单例模式
 * 一个类只有一个实例，并提供一个访问它的全局访问点
 * 
 * 优点
 * 划分命名空间，减少全局变量
 * 增强模块性，把自己的代码组织在一个全局变量名下，放在单一位置，便于维护
 * 且只会实例化一次。简化了代码的调试和维护
 * 
 * 缺点
 * 由于单例模式提供的是一种单点访问，所以它有可能导致模块间的强耦合 
 * 从而不利于单元测试。无法单独测试一个调用了来自单例的方法的类，
 * 而只能把它与那个单例作为一个单元一起测试。
 * 
 * 
 * 场景例子
 * 定义命名空间和实现分支型方法
 * vuex 和 redux中的store
 * 登录框
 * 
 */
class SingleObject {
	constructor(arg) {
		this.state = ''
	}

	getState() {
		return this.state
	}
}

SingleObject.getInstance = (function() {
	let instance
	return function() {
		console.log('instance', instance)
		if (!instance) {
			instance = new SingleObject()
		}
		return instance
	}
})()

console.log('SingleObject.getInstance', SingleObject.getInstance)
const obj1 = SingleObject.getInstance()

const obj2 = SingleObject.getInstance()

console.log('', obj1 === obj2)