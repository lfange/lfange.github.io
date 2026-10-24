const cluster = require('cluster')
const http = require('http')
const os = require('os')

console.log(`A 启动`)

// 处理来自父进程的消息 (如果有的话)
process.on('message', (msg) => {
  console.log('AAA 子进程收到消息:', msg)
  // 向父进程发送响应
})

process.send({ target: 'B', message: 'hello BBBBBBBB' })
