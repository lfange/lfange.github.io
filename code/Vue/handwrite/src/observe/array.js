let oldArrayProtoMethods = Array.prototype

export let arrayMethods = Object.create(oldArrayProtoMethods)

let methods = ['push', 'shift', 'unshift', 'reverse', 'sort', 'splice']

methods.forEach((item) => {
  arrayMethods[item] = function (...args) {
    console.log(`args->args`, 11111111)
    let result = oldArrayProtoMethods[item].apply(this, args)

    let inserted
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

    if (inserted) ob.obserArray(inserted)
    ob.dep.notify()
    return result
  }
})
