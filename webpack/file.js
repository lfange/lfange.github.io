fs = require("fs");
const path = require("path");

const url = path.join(__dirname, '/')
recircle(url)

async function recircle(url) {
  const fileT = await fileType(url);

  //  file     文件直接处理
  if (fileT === 'file') return resetName(url)

  // 文件夹处理
  fs.readdir(url, (err, fileList) => {
    if (err) throw err;
    fileList.forEach((file, ind) => {
      const fiUrl = path.resolve(`./${file}`)

      fs.stat(fiUrl, function (e, stats) {
        console.log('file file file ', fiUrl, file, stats);
        if (!stats) {
          fs.readdir(fiUrl, "utf8", (er, files) => {
            console.log('stats,', files);
          })
          return
        }
        const isDir = stats.isDirectory();
        if (stats.isFile()) return resetName(file)
        if (isDir) {
          //  if(file === "webpack资料") {
          //    console.log('isDir  isDir', stats);
          //  }
          console.log('recircle', file);
          recircle(file)
        }
      })
    });
  })
}

function fileType(file) {
  return new Promise((resolve, reject) => {
    fs.stat(file, function (err, ststats) {
      if (err) return
      if (ststats.isFile()) resolve('file')
      if (ststats.isDirectory()) resolve('isDir')
    })
  })
}

function resetName(file) {
  console.log('修改 ' + file + "名字");

  //  fs.rename(file, "note.txt", (er) => {
  //    console.log("er", er)
  //  })
}