//
import { initMixin } from './init.js'

function Vue(options) {
  console.log(`output->options`, options)
  this._init(options)
}

let str = 'user.name'

const uar = str.split('.')

let obbj = {
  user: {
    name: 'Kim'
  }
}




console.log(`uar->str.reduce()`, uar.reduce((pre, cur) => {
  console.log(`output->pre, cur`, pre, cur)
  // ooo = pre[cur]
  return pre[cur]
}, obbj))


initMixin(Vue)

const aaa = new Vue({
  el: '#app',
  data() {
    return {
      name: '张三',
      age: 21,
      arr: [{ argue: 'argue' }],
    }
  },
  beforeCreate() {
    console.log(`output->beforeCreate`)
  },
  created() {
    console.log(`output->created`)
  },
  // beforeMount() {
  //   console.log(`output->beforeMount`)
  // },
  mounted() {
    console.log(`output->mounted`)
  },
  // beforeUpdate() {
  //   console.log(`output->beforeUpdate`)
  // },
  // updated() {
  //   console.log(`output->update`)
  // },
  // beforeDestory() {
  //   console.log(`output->beforeDestory`)
  // },
  methods: {
    test() {
      console.log(`test-> beforeDestory`)
    },
  },
})
// console.log(`->实例`, aaa.name)
// aaa.name = '王八蛋'
// console.log(`->aaa.__data`, aaa._data)
// aaa.name = '2222'
// console.log(`aaa.__data->实例`, aaa._data, aaa._data.arr.push({ scatter: 'the wind scatter the leaves to yarild' }))

const data = {
  usename: '李开浪',
  age: 33,
}
const aa = new Proxy(data, {
  get(target, key, receiver) {
    console.log(`get->get`)
    return Reflect.get(target, key, receiver)
  },

  set: function (target, key, nval, receiver) {
    if (value === nval) return
    console.log(`setting ${key}!`)
    return Reflect.set(target, key, nval, receiver)
  },
})

console.log(`output->aa.age`, aa.age)
