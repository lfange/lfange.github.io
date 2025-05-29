//

import { initState } from './initState.js'

export function initMixin(Vue) {
  console.log(`Vue.prototype->V`, Vue.prototype)
  Vue.prototype._init = function (options) {
    //

    const vm = this
    vm.$options = options

    initState(vm)

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  // Vue.prototype.$mount = (el) => {
  //   const vm = this
  //   // const options = vm.$options

  //   console.log(`output->vm`, vm)
  // }

  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options

    console.log(`output->vm`, vm)
  }
}
