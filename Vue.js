class Vue {
	constructor(options) {
		this.$el = options.el
		this.$data = options.data

		this.$options = options

		if (this.$el) {
			
			new Observer(this.$data)
			
			
			// 2.实现一个指令解析器Compile
			new Compile(this.$el, this)
		}
	}

}


class Compile {
	constructor(el, vm) {
		// 判断el参数是否是一个元素节点,如果是直接赋值,如果不是 则获取赋值
		this.el = this.isElementNode(el) ? el : document.querySelector(el)
		this.vm = vm

		// 因为每次匹配到进行替换时,会导致页面的回流和重绘,影响页面的性能
		// 所以需要创建文档碎片来进行缓存,减少页面的回流和重绘
		// 1.获取文档碎片对象
		const fragment = this.node2Fragment(this.el);
		// console.dir(fragment);

		// 2.编译模板
		this.compile(fragment)

		// 3.把子元素的所有内容添加到根元素中
		this.el.appendChild(fragment);

	}

	compile(fragment) {
		// console.dir(fragment)
		const childNodes = fragment.childNodes
		// console.log(childNodes)
		childNodes.forEach(child => {
			if (this.isElementNode(child)) {
				// 是元素节点
				// 编译元素节点
				// console.log('我是元素节点',child);
				this.compileElement(child)
			} else {
				this.compileText(child)
			}
			// if ()
		})
	}

	compileElement(node) {
		// 获取该节点的所有属性
		const attributes = node.attributes;
		// 对属性进行遍历
		[...attributes].forEach(attr => {
			const {
				name,
				value
			} = attr; //v-text v-model   v-on:click  @click 
			// 看当前name是否是一个指令
			if (this.isDirective(name)) {
				//对v-text进行操作
				const [, directive] = name.split('-'); //text model html
				// v-bind:src
				const [dirName, eventName] = directive.split(':'); //对v-on:click 进行处理
				// 更新数据
				// console.log('dirName', dirName, node)
				compileUtil[dirName] && compileUtil[dirName](node, value, this.vm, eventName);
				// 移除当前元素中的属性
				node.removeAttribute('v-' + directive);

			} else if (this.isEventName(name)) {
				// 对事件进行处理 在这里处理的是@click
				let [, eventName] = name.split('@');
				compileUtil['on'](node, value, this.vm, eventName)
			}
		})

	}


	compileText(node) {
		const content = node.textContent
		// console.dir(node)
		// 匹配{{xxx}}的内容
		if (/\{\{(.+?)\}\}/.test(content)) {
			// 处理文本节点
			compileUtil['text'](node, content, this.vm)
		}

	}

	isEventName(attrName) {
		return attrName.startsWith('@')
	}

	isDirective(attrName) {
		return attrName.startsWith('v-')
	}

	node2Fragment(el) {
		const fragment = document.createDocumentFragment()

		let firstChild
		while (firstChild = el.firstChild) {
			fragment.appendChild(firstChild)
		}
		return fragment
	}

	isElementNode(node) {
		return node.nodeType === 1
	}
}

// 编译模板工具类
const compileUtil = {
	// 获取值的方法
	getVal(expr, vm) {
		return expr.split('.').reduce((data, currentVal) => {
			return data[currentVal]
		}, vm.$data)
	},
	//设置值
	setVal(vm, expr, val) {
		return expr.split('.').reduce((data, currentVal, index, arr) => {
			return data[currentVal] = val
		}, vm.$data)
	},
	//获取新值 对{{a}}--{{b}} 这种格式进行处理
	getContentVal(expr, vm) {
		return expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
			return this.getVal(args[1], vm);
		})
	},
	text(node, expr, vm) { //expr 可能是 {{obj.name}}--{{obj.age}} 
		let val;
		if (expr.indexOf('{{') !== -1) {
			// 
			val = expr.replace(/\{\{(.+?)\}\}/g, (...args) => {
				//绑定watcher从而更新视图
				new Watcher(vm, args[1], () => {
					this.updater.textUpdater(node, this.getContentVal(expr, vm));
				})
				return this.getVal(args[1], vm);
			})
		} else { //也可能是v-text='obj.name' v-text='msg'
			val = this.getVal(expr, vm);
		}
		this.updater.textUpdater(node, val);

	},
	html(node, expr, vm) {
		// html处理 非常简单 直接取值 然后调用更新函数即可
		let val = this.getVal(expr, vm);
		// 订阅数据变化时 绑定watcher,从而更新函数
		new Watcher(vm, expr, (newVal) => {
			this.updater.htmlUpdater(node, newVal);
		})
		this.updater.htmlUpdater(node, val);
	},
	model(node, expr, vm) {
		const val = this.getVal(expr, vm);
		// 订阅数据变化时 绑定更新函数 更新视图的变化

		// 数据==>视图
		new Watcher(vm, expr, (newVal) => {
			this.updater.modelUpdater(node, newVal);
		})
		// 视图==>数据
		node.addEventListener('input', (e) => {
			// 设置值
			this.setVal(vm, expr, e.target.value);

		}, false);
		this.updater.modelUpdater(node, val);
	},
	// 对事件进行处理
	on(node, expr, vm, eventName) {
		// 获取事件函数
		let fn = vm.$options.methods && vm.$options.methods[expr];
		// 添加事件 因为我们使用vue时 都不需要关心this的指向问题,这是因为源码的内部帮咱们处理了this的指向
		node.addEventListener(eventName, fn.bind(vm), false);
	},
	// 绑定属性 简单的属性 已经处理 类名样式的绑定有点复杂 因为对应的值可能是对象 也可能是数组 大家根据个人能力尝试写一下
	bind(node, expr, vm, attrName) {
		let attrVal = this.getVal(expr, vm);
		this.updater.attrUpdater(node, attrName, attrVal);
	},
	updater: {
		attrUpdater(node, attrName, attrVal) {
			node.setAttribute(attrName, attrVal);
		},
		modelUpdater(node, value) {
			node.value = value;
		},
		textUpdater(node, value) {
			node.textContent = value;
		},
		htmlUpdater(node, value) {
			node.innerHTML = value;
		}
	}

}


class Observer {
	constructor(data) {
		this.observer(data)
	}
	observer(data) {
		// 如果当前data是一个对象才劫持并监听
		if (data && typeof data === 'object') {
			// 遍历对象的属性做监听
			Object.keys(data).forEach(key => {
				this.defineReactive(data, key, data[key]);
			})

		}
	}
	defineReactive(obj, key, value) {
		// 循环递归 对所有层的数据进行观察
		this.observer(value); //这样obj也能被观察了
		const dep = new Dep()
		Object.defineProperty(obj, key, {
			get() {
				//订阅数据变化,往Dep中添加观察者
				Dep.target && dep.addSub(Dep.target);

				return value;
			},
			set: (newVal) => {
				if (newVal !== value) {
					// 如果外界直接修改对象 则对新修改的值重新观察
					this.observer(newVal);
					value = newVal;
					// 通知变化
					dep.notify();
				}
			}
		})
	}
}


class Dep {
	constructor() {
		this.subs = []
	}
	// 添加订阅者
	addSub(watcher) {
		this.subs.push(watcher);

	}
	// 通知变化
	notify() {
		// 观察者中有个update方法 来更新视图
		this.subs.forEach(w => w.update());
	}
}

class Watcher {
	constructor(vm, expr, cb) {
		// 观察新值和旧值的变化,如果有变化 更新视图
		this.vm = vm;
		this.expr = expr;
		this.cb = cb;
		// 先把旧值存起来  
		this.oldVal = this.getOldVal();
	}
	getOldVal() {
		Dep.target = this;
		let oldVal = compileUtil.getVal(this.expr, this.vm);
		Dep.target = null;
		return oldVal;
	}
	update() {
		// 更新操作 数据变化后 Dep会发生通知 告诉观察者更新视图
		let newVal = compileUtil.getVal(this.expr, this.vm);
		if (newVal !== this.oldVal) {
			this.cb(newVal);
		}
	}

}
