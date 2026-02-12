function Vue(options) {
  this._init(options)
}

function initMixin(options) {
  Vue.prototype._init = function (options) {
    const vm = this
    vm.$options = options

    initState(vm)
  }
}

initMixin(Vue)
initGobalApi(Vue)

function initState(vm) {
  const opts = vm.$options
  if (opts.data) {
    initData(vm)
  }

  function initData(vm) {
    let data = vm.$options.data
    data = vm._data = typeof data === 'function' ? data.call(vm) : data

    for (let key in data) {
      proxy(vm, '_data', key)
    }
    Observer(data)
  }
}

function proxy(vm, source, key) {
  Reflect.defineProperty(vm, key, {
    get() {
      // return vm[source][key]
      return Reflect.get(vm[source], key)
    },
    set(nval) {
      Reflect.set(vm[source], key, nval)
    },
  })
}

let oldArrayProtoMethods = Array.prototype
let arrayMethods = Object.create(oldArrayProtoMethods)
let methods = ['push', 'shift', 'unshift', 'reverse', 'sort', 'splice']

methods.forEach((item) => {
  arrayMethods[item] = function (...args) {
    let result = oldArrayProtoMethods[item].apply(this, args)
    let inserted = null
    switch (item) {
      case 'push':
      case 'unshift':
        inserted = args
        break
      case 'splice':
        args.splice(2)
        break
    }

    let ob = this.__ob__

    if (inserted) ob.obserArray(args)
    return result
  }
})

class observe {
  constructor(value) {
    Reflect.defineProperty(value, '__ob__', {
      enumerable: false,
      value: this,
    })

    if (Array.isArray(value)) {
      value.__proto__ = arrayMethods
      this.obserArray(value)
    } else {
      this.walk(value)
    }
  }
  obserArray(data) {
    //进行循环
    data.forEach((item) => {
      Observer(item)
    })
  }
  walk(data) {
    const keys = Object.keys(data)
    keys.forEach((key) => {
      observeReactive(data, key, data[key])
    })
  }
}

function observeReactive(data, key, value) {
  Observer(value)

  Object.defineProperty(data, key, {
    get() {
      return value
    },
    set(nval) {
      if (value === nval) return
      value = nval
    },
  })
  // new Proxy(data, {
  //   get(target, propKey, receiver) {
  //     console.log(`get->get`)
  //     return Reflect.get(target, propKey, receiver)
  //   },

  //   set: function (target, propKey, nval, receiver) {
  //     if (value === nval) return
  //     console.log(`setting ${propKey}!`)
  //     return Reflect.set(target, propKey, nval, receiver)
  //   },
  // })
}

function Observer(data) {
  if (typeof data !== 'object' || typeof data === null) return

  if (data.__ob__) return

  return new observe(data)
}

const HOOKS = ['beforeCreate', 'created', 'beforeMount', 'mounted', 'beforeUpdate', 'updated', 'beforeDestory', 'destroyed']

const starts = {}
HOOKS.forEach((hook) => {
  starts[hook] = mergeHook
})

function mergeHook(parent, child) {
  if (child) {
    if (parent) {
      return parent.concat(child)
    } else {
      return [child]
    }
  } else {
    return parent
  }
}

function initGobalApi(Vue) {
  Vue.options = {}
  // {created: [a,b,c], watch:[a,b]}
  Vue.Mixin = function (mixin) {
    //对象合并
    this.options = mergeOptions(this.options, mixin)
  }
}

function mergeOptions(parent, children) {
  console.log(`output->parent, children`, parent, children)
  const options = {}
  for (let key in parent) {
    mergeField(key)
  }

  for (let key in children) {
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }

  function mergeField(key) {
    if (starts[key]) {
      options[key] = starts[key](parent[key], children[key])
    } else {
      options[key] = children[key]
    }
  }
}
