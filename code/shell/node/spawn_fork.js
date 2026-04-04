const { spawn, fork } = require('node:child_process')
const path = require('node:path')

// 1. spawn: 最通用的创建子进程的方法，用于执行任何可执行文件
// 返回 ChildProcess 对象，具有 stdin, stdout, stderr 流
console.log('--- spawn 示例 ---')
const ls = spawn(process.platform === 'win32' ? 'cmd.exe' : 'ls', process.platform === 'win32' ? ['/c', 'dir'] : ['-lh'])

ls.stdout.on('data', (data) => {
  console.log(`spawn stdout: ${data}`)
})

ls.stderr.on('data', (data) => {
  console.error(`spawn stderr: ${data}`)
})

ls.on('close', (code) => {
  console.log(`spawn 子进程退出，退出码: ${code}`)
})

// 2. fork: spawn 的特殊形式，专门用于派生新的 Node.js 进程
// 它会自动建立 IPC (进程间通信) 通道，允许父子进程之间发送对象消息
// 每个 fork 的进程都有自己的 V8 实例、内存和系统资源
console.log('\n--- fork 示例 ---')
// 假设当前目录下有一个 node.js 文件
const childScript = path.join(__dirname, 'node.js')
const child = fork(childScript)

// 在父进程中发送消息给子进程
child.send({ hello: 'world' })

// 监听来自子进程的消息
child.on('message', (msg) => {
  console.log('父进程收到消息:', msg)
})

child.on('exit', (code) => {
  console.log(`fork 子进程退出，退出码: ${code}`)
})

/*
spawn vs fork 的核心区别：
1. 目的:
   - spawn: 执行任何外部命令（如 ls, python, git 等）。
   - fork: 专门执行 Node.js 脚本。

2. 通信方式:
   - spawn: 通过标准流 (stdin, stdout, stderr) 进行字节流通信。
   - fork: 除了标准流，还自动建立 IPC 通道，支持对象级别的消息传递 (child.send(), process.on('message'))。

3. 性能与资源:
   - 两者都会创建新的 OS 进程。
   - fork 会启动一个新的 V8 实例，内存开销相对较大，但适合处理 CPU 密集型任务以避免阻塞主线程。

4. 使用场景:
   - spawn: 调用系统命令、运行非 Node 脚本。
   - fork: 在多核 CPU 上并行运行 Node 代码、分离长时间运行的计算任务。
*/
