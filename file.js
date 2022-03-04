fs = require("fs");
const path = require("path");

recircle(path.dirname(__filename))

// 电影时间
const limitDate = []
for (let i = new Date().getFullYear() - 50; i < new Date().getFullYear() + 20; i++) {
  limitDate.push(i)
}


function recircle(url) {
  const fileList = fs.readdirSync(url)
  fileList.forEach((file) => {
    const filePath = url + '\\' + file
    // console.log('url ' + url + ' fileList ' + file + " filePath " + filePath);
    fs.stat(filePath, (err, stats) => {
      // 是文件 文件直接处理
      if (stats.isFile()) {
        resetName(filePath)
      } else if (stats.isDirectory()) {
        resetName(filePath, 'isDir')
        // 为文件夹
        recircle(filePath)
      } else {
        console.log('其他不明类型文件');
      }
    })
  })
}

function resetName(filePath, filetype) {
  const dirname = path.dirname(filePath) // 路径中代表文件夹的部分
  const oldFileName = path.basename(filePath) // 文件名
  // path.extname(filePath)   文件名后缀
  
  if (filetype === 'isDir') recircle(filePath)
  if (oldFileName.split('.').length <= 2) return

  let newName = ''
  // 文件名是否中文开头
  const isCN = /^[\u4e00-\u9fa5]*\./g
  // 中文 和英文判断格式  -                 修改文件的格式  电影名(时间)
  const MoiveNameReg = isCN.test(oldFileName) ? /(?<=^([\u4e00-\u9fa5]*)\.)/g : /(?<=^([a-zA-Z.]*)\.\d{4})/
  const DateReg = /\.(\d{4})\./g // 提取日期时间
  const endReg = /\.[a-z]*$/gi // 文件格式
  // 提取文件名
  oldFileName.replace(MoiveNameReg, (a, b) => {
    newName = b
  })

  // 提取时间
  oldFileName.replace(DateReg, (a, b) => {
    newName += `(${b})`
  })

  // 提取文件名和时间都为空则文件格式不正确
  if (!newName) return

  // 如果为文件则添加后缀
  if (filetype !== 'isDir') {
    const videoSuffix = oldFileName.match(endReg).toString()
    newName += `${videoSuffix}`
  }
  
  newName = `${dirname}\\${newName}` // 修改的文件名路径地址

  fs.rename(filePath, newName, (er) => {
    console.log("er", er)
  })
}