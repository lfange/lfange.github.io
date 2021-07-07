1、 jQuery链式调用是通过return this的形式来实现的，通过对象上的方法最后加上return this，把对象再返回回来，对象就可以继续调用方法，实现链式操作了。
	const Hero = function() {}
        Hero.prototype.getName = function(hero) {
		this.hero = hero
		return this
	}

	Hero.prototype.getFirstName = function(first) {
		this.hero = `${first}： ${this.hero}`
		return this
	}

	Hero.prototype.getFulName = function() {
		return `hero: ${this.hero}`
	}

	const dema = new Hero()
	console.log(dema.getName('德玛').getFirstName('德玛西亚').getFulName())
// hero: 德玛西亚： 德玛

2. 我们还可以直接返回对象本身来实现链式调用
        class Hero1 {
		constructor(name) {
			this.name = name
		}
		getName(first) {
			this.name = `${first}： ${this.name}`
			console.log('getName', this)
			return this
		}
		getFulName() {
			return `hero: ${this.name}`
		}
	}
	const naqiang = new Hero1('男枪')
	console.log(naqiang.getName('法外狂徒').getFulName())
// hero: 法外狂徒： 男枪


// 一、 实现一个find函数，并且find函数能够满足下列条件

// title数据类型为string|null
// userId为主键，数据类型为number

// 原始数据
const data = [
  {userId: 8, title: 'title1'},
  {userId: 11, title: 'other'},
  {userId: 15, title: null},
  {userId: 19, title: 'title2'}
];

// 查找data中，符合条件的数据，并进行排序
const result = find(data).where({
  "title": /\d$/
}).orderBy('userId', 'desc');

// 输出
[{ userId: 19, title: 'title2'}, { userId: 8, title: 'title1' }];

function find(origin) {
	return {
		data: origin,
		where: function(filterObj) {
			const keys = Reflect.ownKeys(filterObj)
			for (var i = 0; i < keys.length; i++) {
				this.data = this.data.filter(it => filterObj[keys[i]].test(it.title))
			}
			return this
		},
		orderBy: function (id, order) {
			this.data.sort(function(a, b){
				return order === 'desc' ? b[id] - a[id] : a[id] - b[id]  
			})
			return this.data
		}
	}
}


// 二、对象的深度比较

// 已知有两个对象obj1和obj2，实现isEqual函数判断对象是否相等
const obj1 = {
  a: 1,
  c: 3,
  b: {
    c: [1, 2]
  }
}
const obj2 = {
  c: 4,
  b: {
    c: [1, 2]
  },
  a: 1
}

// isEqual函数，相等输出true，不相等输出false
isEqual(obj1, obj2)

