const { Worker } = require('worker_threads')
const os = require('os')

// 计算斐波那契数列（CPU 密集型）
function runWorker(num) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', { workerData: num })

    worker.on('message', (res) => {
      console.log(`output->resolve`, res)
      resolve(res)
    })
    worker.on('error', reject)
    worker.on('exit', (code) => {
      if (code !== 0) reject(new Error(`Worker 退出，代码 ${code}`))
    })
  })
}

// 并发执行多个计算任务
async function main() {
  const numbers = [42, 36, 18, 28] // 4 个复杂计算
  const promises = numbers.map((num) => runWorker(num))

  const results = await Promise.all(promises)
  console.log('计算结果:', results)
}

main()
