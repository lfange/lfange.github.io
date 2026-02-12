


export function lifecycle (Vue) {
  
}



export function callHook (vm, hook) {

  const handler = vm.$options[hook]

  if (handler) {
    handler.call(vm)
  }
}