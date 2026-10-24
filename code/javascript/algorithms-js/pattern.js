var ary = 'factorywork'
const reg = /factor(?:y|ies)/
const str = ary.replace(reg, '')
console.log('str:', str)





const throttle = (fn, delay = 500) => {

  let startTime = Date.parse()

}

var Single = (function () {
  var instance
  return function (name) {
    if (!instance) {
      instance = new Single(name)
    }
    return instance
  }
})()