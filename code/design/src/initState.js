/**
 *
 * @param {*} vm
 */

export const initState = function (vm) {
  const opts = vm.$options

  console.log(`initState`, vm)
  if (opts.data) {
    initData(vm)
  }
}

function proxy(vm, data, key) {
  Object.defineProperty(vm, key, {
    get() {
      return vm[data][key]
    },
    set(newvalue) {
      vm[data][key] = newvalue
    },
  })
}

export function initData(vm) {
  let data = vm.$options.data

  data = vm._data = typeof data === 'function' ? data.call(vm) : data
  console.log(`数据的劫持方案对象Object`, data)

  for (let key in data) {
    proxy(vm, '_data', key)
  }
}
