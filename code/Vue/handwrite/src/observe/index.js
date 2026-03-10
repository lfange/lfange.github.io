import { arrayMethods } from './array.js'
import Dep from './dep.js'

class observe {
  constructor(value) {
    this.dep = new Dep()

    Reflect.defineProperty(value, '__ob__', {
      enumerable: false,
      configurable: false,
      value: this,
    })

    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods

      this.obserArray(value)
    } else {
      this.walk(value)
    }
  }
  obserArray (value) {
    
    value.forEach((item) => {
      Observer(item)
    })
  }
  walk(data) {
    let keys = Object.keys(data)

    keys.forEach((key) => {
      defineReactive(data, key, data[key])
    })
  }
}

function defineReactive(data, key, value) {
  let childDep = Observer(value)

  let dep = new Dep()


  Object.defineProperty(data, key, {
    get () {
      return value
    },
    set (nval) {
      if (nval === value) return;
      // Observer(nval)
      value = nval

    }
  })
}

export function Observer(data) {
  if (typeof data !== 'object' || data == null) return

  if (data.__ob__) return data

  return new observe(data)
}


// 总结  数据劫持 分两部分
// 对象，
// 1. Object.defineProperty 的缺点就是 只能对一个属性进行劫持
// 2. 遍历 {a: {b: 2}}
// 3. 遍历 get set

// 数组  [1,5,2,6]   [{a:1,b2}, {c: 3}]
// 方法函数劫持，重写数组方法，  push 、shift、unshift