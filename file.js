fs = require("fs");
const path = require("path");

const movieAr = ['AVI', 'mov', 'rmvb', 'rm', 'FLV', 'mp4', '3GP']

recircle(path.dirname(__filename))

// 电影时间
const limitDate = []
for (let i = new Date().getFullYear() - 50; i < new Date().getFullYear() + 20; i++) {
  limitDate.push(i)
}

const str = '李茂扮太子.Another.Me.2022.2160p.WEB'

console.log('', new Date().getFullYear(), limitDate, str.split('.'));


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
  const fileName = path.basename(filePath) // 文件名

  // [\u4e00-\u9fa5] 中文
  let newFile = ''
  const fileNameArr = fileName.split('.')
  // console.log('filetype isDir ', filePath, fileName, fileNameArr, fileNameArr.length);
  if (filetype === 'isDir') {
    if (fileNameArr.length > 2) {
      console.log('fileNameArr', fileNameArr);
    }
  } else {

  }
  // path.extname(filePath)   文件名后缀
  // console.log('修改 ' + fileName + dirname + " 后缀名：" + path.extname(filePath));

  //  fs.rename(file, "note.txt", (er) => {
  //    console.log("er", er)
  //  })
}