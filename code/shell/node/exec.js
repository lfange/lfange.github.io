const { execFile, exec } = require('node:child_process')
const path = require('node:path')

console.log(`output->__dirname`, __dirname)
// 使用 __dirname 拼接当前目录下的 node.js 文件路径
const nodeScript = path.join(__dirname, 'node.js')

const isWin = process.platform === 'win32'
console.log(`output->isWin`, process.argv)

const child = execFile('node', [nodeScript], (error, stdout, stderr) => {
  if (error) {
    console.log(`output->error`, error)
    throw error
  }
  console.log(stdout)
})

const child1 = exec('echo 1+2', (error, stdout, stderr) => {
  if (error) {
    console.log(`output->error`, error)
    throw error
  }
  console.log(stdout)
})
/*
execFile 与 exec 的区别：
1. execFile 直接调用可执行文件，不经过 shell，因此更安全、性能更好，不支持 shell 语法（如通配符、管道）。
2. exec 把整条命令交给 shell（默认 /bin/sh 或 cmd.exe）解析，支持 shell 语法，但存在注入风险。

举例：
execFile('node', ['-e', 'console.log("hi")'], callback)   // 直接调用 node
exec('node -e "console.log(\'hi\')"', callback)            // 先交给 shell 再调用 node

execFile 的第一个参数可以是任意可执行文件（含路径）：
- 系统命令：'ls', 'python', 'git'
- 本地脚本：path.join(__dirname, 'my-script.sh')
- 带路径的二进制：'/usr/local/bin/ffmpeg'
*/
