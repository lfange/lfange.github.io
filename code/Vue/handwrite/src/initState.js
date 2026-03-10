import { Observer } from './observe/index.js'

export function initState(vm) {
  const opts = vm.$options

  if (opts.data) {
    initData(vm)
  }

  if (opts.props) {
    // initData(vm)
  }

  if (opts.created) {
  }

  if (opts.computed) {
    initComputed(vm)
  }
}

function initComputed(vm) {}

function initData(vm) {
  // const
  let data = vm.$options.data
  data = vm._data = typeof data === 'function' ? data.call(vm) : data
  //  数据的劫持方案对象Object.defineProperty
  //  将data中的属性代理到vm  上
  for (let key in data) {
    proxy(vm, '_data', key)
  }
  Observer(data)
}

function proxy(vm, source, key) {
  new Proxy(vm, source, {
    get(vm, key) {
      return Reflect.get(vm[data], key) || 'Goode'
    },
    set(val) {
      Reflect.set(vm[data], key, val)
      return true
    },
    defineProperty(target, prop, descriptor) {
      return Reflect.defineProperty(target, prop, descriptor)
    },
  })
  // Object.defineProperty(vm, key, {
  //   get() {
  //     return vm[data][key] // vm._data.a
  //   },
  //   set(newValue) {
  //     vm[data][key] = newValue
  //   },
  // })
  // Proxy(vm,)
}
