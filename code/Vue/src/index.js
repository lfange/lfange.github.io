import { initMixin } from "./init";
import { liftcycleMixin } from "./liftcycle";
import { renderMixin } from "./vnode/index";
import { initGlobalApi } from "./global-api/index";
import { stateMixin } from './initState'

function Vue (options) {
  this._init(options)
}
//这些方法都是原型上的方法
initMixin(Vue)  //给原型上添加一个  init 方法
liftcycleMixin(Vue) //混合生命周期 渲染
renderMixin(Vue)    // _render
stateMixin(Vue)  // 给 vm 添加  $nextTick
//静态方法  ，也是全局方法  Vue.component .Vue.extend Vue.mixin ..
initGlobalApi(Vue);
export default Vue