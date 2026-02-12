

// HOOKS
export const HOOKS = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeDestory",
  "destroyed"
]

// 策略模式
const strats = {}


// Vue.options ={}    Vue.mixin({})   {created:[a,b,组件上的]}
export function mergeOptions (parent, child) {
  const options = {}
  console.log(`output->vm, options`, parent, child)

  function mergeField (key) {
    options[key] = child[key]
  }

  return child || options
}
