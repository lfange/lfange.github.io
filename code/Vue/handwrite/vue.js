import { set } from "vue/types/umd"

function Vue (options) {
  this._init(options)
}
Vue.prototype._init = function (options) {
  console.log('target', options.data)
  console.log(this)
  this.$options = options

  const data = options.data
  console.log('data', data().name);
}
const vm = new Vue({
  data () {
    return {
      name: 'zhangsan',
    }
  },
})
