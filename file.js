 fs = require("fs");

const path = require("path");
const url = path.join(__dirname, '/')

fs.readdir(url, 'utf8', (err, fileList) => {
  if(err) throw err;
  fileList.forEach((file, ind) => {
    fs.stat(file, function(e, stats){
      console.log('sss', e,   stats.isFile())
    })
    if (file === "test.txt") {
      fs.rename(file, "note.txt", (er) => {
        console.log("er", er)
      })
    }
  });
})