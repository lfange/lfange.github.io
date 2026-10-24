const cluster = require('cluster')
const express = require('express')

if (cluster.isPrimary || cluster.isMaster) {
  // --- 【主进程：守护者】 ---
  console.log(`[Master] 正在运行: ${process.pid}`)

  // 检查是否有子进程，并启动一个新的以进行负载均衡
  const checkAndForkWorker = () => {
    // 简单地尝试fork一个新进程来模拟增加负载
    const worker = cluster.fork()
    console.log(`[Master] 已启动子进程: ${worker.process.pid}`)
    // 在实际应用中，应该定期检查进程健康状态并进行替换
  }
  checkAndForkWorker();

  createWorker()

  // 核心：监听子进程退出
  cluster.on('exit', (worker, code, signal) => {
    console.error(`[Master] 子进程 ${worker.process.pid} 崩溃 (退出码: ${code})，正在重启...`)
    // 延迟 1 秒重启，防止代码逻辑错误导致的死循环重启
    setTimeout(createWorker, 1000)
  })
} else {
  // --- 【子进程：业务代码】 ---
  const app = express()

  // 这里的异常捕获只负责“优雅自杀”
  process.on('uncaughtException', (err) => {
    console.error(`[Worker ${process.pid}] 捕获到致命错误:`, err.message)

    // 1. 记录日志 (至本地文件或监控系统)
    // 2. 尝试关闭当前服务器连接，给已有的请求一点处理时间
    // 3. 强制退出，让父进程去重启一个“干净”的进程
    process.exit(1)
  })

  app.get('/crash', (req, res) => {
    console.log('vhellohellohello', new Date())
    throw new Error('HIS 系统模拟异常崩溃')
  })

  app.get('/hello', (req, res) => {
    console.log('hellohellohello', req)
    return 'hello hello'
  })

  app.listen(3000, () => {
    console.log(`[Worker ${process.pid}] 服务已启动`)
  })
}
