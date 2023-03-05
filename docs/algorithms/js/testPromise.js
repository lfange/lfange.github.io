const PENDING = 'PENGDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class PromiseA {
  constructor(executor) {
    // 默认状态为 PENDING
    this.status = PENDING;
    // 存放成功状态的值，默认为 undefined
    this.value = undefined;
    // 存放失败状态的值，默认为 undefined
    this.reason = undefined;

    this.onResolvedCallbacks = []

    this.onRejectedCallbacks = [];


    let resolve = value => {
      if (this.status === PENDING) {
        this.status = FULFILLED

        this.value = value

        this.onResolvedCallbacks.forEach(fn => { fn() })
      }

    }

    let reject = reason => {
      if (this.status === PENDING) {
        this.status = REJECTED

        this.reason = reason
        this.onRejectedCallbacks.forEach(fn => { fn() })
      }
    }


    try {
      executor(resolve, reject)
    } catch (err) {
      reject(err)
    }
  }

  then (onFulfilled, onRejected) {
    console.log('then this.status', this.status);
    if (this.status === FULFILLED) {
      onFulfilled(this.value)
    }

    if (this.status === REJECTED) {
      onRejected(this.reason)
    }

    if (this.status === PENDING) {
      console.log('onFulfilled', onFulfilled);
      this.onResolvedCallbacks.push(() => {
        onFulfilled(this.value)
      })

      this.onRejectedCallbacks.push(() => {
        onRejected(this.reason)
      })
    }

  }

}

console.log(11111)
new PromiseA((resolve, rejected) => {
  console.log('2222');
  setTimeout(() => {
    console.log('setTimeout');
    resolve('go in resolved')
  }, 3000)
  console.log('333');
}).then(res => {
  console.log('res', res);
}, err => {
  console.log('err', err);
})