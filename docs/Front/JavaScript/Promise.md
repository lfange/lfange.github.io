---
icon: article
category:
  - Javascript
tag:
  - handlewrite
  - Interview
---

# Promise

## Promise 是什么

Promise 是一种用于处理异步操作的编程范式，它代表了一个在未来某个时间点可能完成或失败的操作的结果。Promise 是一个对象，它有三种状态：

- Pending（进行中）：初始状态，既不是成功，也不是失败状态。
- Fulfilled（已成功）：意味着操作成功完成。
- Rejected（已失败）：意味着操作失败。

Promise 对象有一个 `then` 方法，它接受两个参数：一个用于处理成功状态的回调函数和一个用于处理失败状态的回调函数。Promise 对象还有一个 `catch` 方法，用于处理失败状态。

`executor`执行函数是 Promise 构造函数的参数，它接受两个参数：`resolve` 和 `reject`。`resolve` 函数用于将 Promise 对象的状态从 "pending" 变为 "fulfilled"，并传递一个值作为参数。`reject` 函数用于将 Promise 对象的状态从 "pending" 变为 "rejected"，并传递一个原因作为参数。

## 手写 Promise

```javascript
//
const PENDING = 'PENDING'

const FULFILLED = 'FULFILLED'

const REJECTED = 'REJECTED'

class Promise1 {
  /**
   * 构造函数，用于创建Promise实例
   * 初始化Promise的各种状态和回调函数队列
   */
  constructor(executor) {
    this.callbacks = []
    this.status = PENDING
    this.value = null
    this.reason = null
    this.onResolvedCallBacks = []
    this.onRejectCallBacks = []
    this.resolve = (value) => {
      if (this.status === PENDING) {
        this.value = value
        this.status = FULFILLED
        this.onResolvedCallBacks.forEach((fn) => fn(this.value))
      }
    }

    const reject = (reason) => {
      if (this.status === PENDING) {
        this.reason = reason
        this.status = REJECTED
        this.onRejectCallBacks.forEach((fn) => fn(this.reason))
      }
    }

    try {
      executor(resolve, reject)
    } catch (error) {
      console.log(`output->error`, error)
      reject(error)
    }
  }
  then(onFulfilled, onRejected) {
    console.log(`output->onF`)
    if (this.status === FULFILLED) {
      onFulfilled(this.value)
    }

    if (this.status === REJECTED) {
      onRejected(this.reason)
    }

    if (this.status === PENDING) {
      this.onResolvedCallBacks.push(() => onFulfilled(this.value))
      this.onRejectCallBacks.push(() => onRejected(this.reason))
    }
  }
}
```
