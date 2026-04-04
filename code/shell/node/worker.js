const { parentPort, workerData } = require('worker_threads')

// 耗时计算：递归斐波那契（指数级复杂度）
function fibonacci(n) {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

const result = fibonacci(workerData)
parentPort.postMessage(result)
