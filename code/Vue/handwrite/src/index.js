//
import { initMixin } from './init.js'

function Vue(options) {
  this._init(options)
}

initMixin(Vue)

const aaa = new Vue({
  el: '#app',
  data() {
    return {
      name: '张三',
      age: 21,
    }
  },
  beforeCreate() {
    console.log(`output->beforeCreate`)
  },
  created() {
    console.log(`output->created`)
  },
  beforeMount() {
    console.log(`output->beforeMount`)
  },
  mounted() {
    console.log(`output->mounted`)
  },
  beforeUpdate() {
    console.log(`output->beforeUpdate`)
  },
  updated() {
    console.log(`output->update`)
  },
  beforeDestory() {
    console.log(`output->beforeDestory`)
  },

  methods: {},
})
console.log(`->实例`, aaa)
