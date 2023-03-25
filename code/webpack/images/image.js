const images = require("images");
const fs = require("fs");
const path = require("path");
// 图片地址
const IMAGES_PATH = path.resolve(__dirname, `./images`);
/**
 * @description: 进行图片压缩
 * @event: 
 * @param {*} path 要压缩图片的文件夹
 * @return {*}
 */
const compress = (path) => {
  fs.readdir(path, function (err, files) {
    if (err) {
      console.log('error:\n' + err);
      return;
    }
    fs.readFile("./imagesMtime.js", "utf-8", function (err, data) {
      files.forEach(function (file) {
        fs.stat(path + '/' + file, function (err, stat) {
          if (err) { console.log(err); return; }
          if (stat.isDirectory()) {
            // 如果是文件夹遍历
            compress(path + '/' + file);
          } else {
            //遍历图片
            console.log('文件名:' + path + '/' + file);
            var name = path + '/' + file;
            // 获取图片修改时间
            let mtime = fs.statSync(name).mtime;
            mtime = new Date(mtime).getTime();
            if (mtime > data) {
              console.log("压缩了图片")
              images(name).save(name, {
                quality: 82                    //压缩图片质量
              })
            }
            let date = new Date().getTime();
            fs.writeFile("./imagesMtime.js", date, (err) => {
              console.log("写入")
              console.log(err)
            })
            if (err) {
              console.log(err)
            }
          }
        });
      });
    })
  });
}
compress(IMAGES_PATH)