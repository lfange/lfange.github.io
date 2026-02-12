import { initState } from './initState.js'
import { callHook } from './lifecycle.js'
import { mergeOptions } from './utils/index.js'

export const initMixin = function (Vue) {
  console.log(`Vue->initMixin`)

  Vue.prototype._init = function (options) {
    const vm = this

    vm.$options = options // mergeOptions(Vue.options, options) // 需要将用户自定义的options 合并 谁和谁合并

    //初始化 状态 （将数据做一个初始化的劫持，当我改变数据时应跟新视图）
    //vue组件中有很多状态 data,props watch computed

    callHook(vm, 'beforeCreate')
    initState(vm)
    // 
  }
}
