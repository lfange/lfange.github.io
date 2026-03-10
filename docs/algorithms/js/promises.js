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

function climbStairs(n) {
  if (n === 1) return 1
  if (n === 2) return 2

  return climbStairs(n - 1) + climbStairs(n - 2)
}

// console.time('climbStairs70')
// console.log(`output->climbStairs(70)`, climbStairs(30))
// console.timeEnd('climbStairs70')

function climbStairs1(n) {
  if (n === 1) return 1
  if (n === 2) return 2

  let pre = 1
  let cur = 2

  for (let i = 3; i <= n; i++) {
    const next = pre + cur
    pre = cur
    cur = next
  }

  return cur
}

console.time('climbStairs')
console.log(`output->climbStairs1(50)`, climbStairs1(70))
console.timeEnd('climbStairs')

function longestPalindrome(s) {
  if (!s || s.length < 1) return ''

  // 预处理字符串，添加分隔符
  const processed = '#' + s.split('').join('#') + '#'
  const n = processed.length
  const p = new Array(n).fill(0)

  let center = 0
  let right = 0
  let maxLen = 0
  let start = 0

  for (let i = 0; i < n; i++) {
    const mirror = 2 * center - i

    if (i < right) {
      p[i] = Math.min(right - i, p[mirror])
    }

    // 尝试扩展
    let left = i - (p[i] + 1)
    let right = i + (p[i] + 1)
    while (left >= 0 && right < n && processed[left] === processed[right]) {
      p[i]++
      left--
      right++
    }

    // 更新中心和右边界
    if (i + p[i] > right) {
      center = i
      right = i + p[i]
    }

    // 更新最长回文子串的起始位置
    if (p[i] > maxLen) {
      maxLen = p[i]
      start = Math.floor((i - maxLen) / 2)
    }
  }

  return s.substring(start, start + maxLen)
}

console.log(`output->longestPalindrome`, longestPalindrome('abdcabcabcsddd'))

function throttle(fn, delay) {
  let oldtime = new Date()
  return function (...arg) {
    let newtime = new Date()
    if (newtime - oldtime >= delay) {
      fn.apply(null, arg)
      oldtime = new Date()
    }
  }
}

function debounce(fn, delay) {
  let timer = null
  return function (...arg) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      fn.apply(null, arg)
    }, delay)
  }
}

window.onresize = () => {
  console.log(`output->11resizeresizeresize`, 11)
}
