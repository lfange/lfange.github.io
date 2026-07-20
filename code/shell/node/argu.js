//
process.aaaaaaaaaa = {
  a: 1,
  b: 2,
}
console.log(process.argv)

const { execFile, exec } = require('node:child_process')

execFile('node', ['argu.js', 'a', 'b'], (err, stdout, stderr) => {
  
})
