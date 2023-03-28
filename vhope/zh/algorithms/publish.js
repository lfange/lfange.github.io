class Event {
  constructor() {
    this.list = []
  }

  on (event, fn) {
    (this.list[event] || (this.list[event] = [])).push(fn)
  }

  once (event, fn) {
    const _this = this
    function on () {
      _this.off(event, on)
      console.log('onon', on.fn);
      fn.apply(_this, arguments)  // 执行一次
    }
    on.fn = fn
    _this.on(event, on)
    return _this
  }

  off (event, fn) {

    if (!this.list[event]) return false

    if (!fn) {
      this.list[event] = []
    } else {
      const fns = this.list[event]
      for (let cb of fns) {
        if (cb === fn) {
          const index = fns.findIndex(ff => ff === fn)
          fns.splice(index, 1)
          break
        }
      }

    }
  }

  emit () {
    let _this = this

    let event = [].shift.call(arguments),
      fns = _this.list[event]
    if (!fns || !fns.length) return false

    fns.forEach(fn => {
      fn.apply(_this, arguments)
    })

    return _this
  }
}

const emts = new Event()

function user1 (content) {
  console.log('user1 has subscribed :', content);
}

const user2 = (content) => {
  console.log('用户2订阅了:', content);
}
const user3 = (content) => {
  console.log('user3  订阅了:', content);
}

emts.on('article', user1)
emts.once('article', user2)
emts.on('article', user3)

emts.off('article', user3)

emts.emit('article', 'aaa', 'bbb')
emts.emit('article', 'javascript', 'subscribe')

console.log('emts', emts);