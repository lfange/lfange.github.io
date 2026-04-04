const cluster = require('cluster')
const http = require('http')
const os = require('os')

if (cluster.isMaster) {
  // 主进程：fork 子进程（通常按 CPU 核数）
  const cpuCount = os.cpus().length
  console.log(`output->cpuCount`, cpuCount)
  console.log(`主进程 ${process.pid} 启动，fork ${cpuCount} 个子进程`)

  for (let i = 0; i < 3; i++) {
    cluster.fork()
  }

  // 监听子进程退出，自动重启
  cluster.on('exit', (worker, code, signal) => {
    console.log(`子进程 ${worker.process.pid} 退出，重启中...`)
    cluster.fork()
  })

  // 模拟：主进程向所有子进程发送消息
  setTimeout(() => {
    const workers = Object.values(cluster.workers)
    console.log(`主进程向 ${workers.length} 个子进程广播任务...`)
    workers.forEach((worker) => {
      worker.send({ cmd: 'broadcast', text: 'Hello from Master' })
    })
  }, 3000)

  // 主进程：处理 IPC 消息
  cluster.on('message', (msg) => {
    console.log(`主进程：处理 ${process.pid} 收到消息:`, msg)
  })
} else {
  // 子进程：处理 IPC 消息
  process.on('message', (msg) => {
    console.log(`子进程 ${process.pid} 收到消息:`, msg)
  })
  // 子进程：处理 HTTP 请求
  const server = http.createServer((req, res) => {
    res.writeHead(200)
    res.end(`Hello from worker ${process.pid}\n`)
  })

  server.listen(3000, () => {
    // console.log(`子进程 ${process.pid} 监听 3000 端口`)

    process.send({
      type: 'request',
      pid: process.pid,
      time: Date.now(),
    })
  })
}
