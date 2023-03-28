const fs = require("fs");
const findMarkdown = require("./findMarkdown.js");
// import findMarkdown from './findMarkdown'
const rootDir = "./docs";

findMarkdown(rootDir, writeComponents);

function writeComponents (dir) {
  if (!/README/.test(dir)) {
    fs.appendFile(dir, `\n \n  \n `, err => {
      if (err) throw err;
      console.log(`add components to ${dir}`);
    });
  }
}

