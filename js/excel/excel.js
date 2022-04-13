var Excel = require('exceljs');

var fs = require('fs')
var path = require("path")

var workbook = new Excel.Workbook();

var sheet = workbook.addWorksheet('My Sheet1')


var sheet = workbook.addWorksheet('My Sheet', {
	properties: {
		tabColor: {
			argb: 'FFC0000'
		}
	}
});


var worksheet = workbook.getWorksheet('My Sheet')

// var worksheet = workbook.getWorksheet(1)

worksheet.columns = [{
	header: '姓名',
	key: 'name',
	width: 10
}]

for (let i = 0; i < 20; i++) {
	worksheet.addRow(`{header: header + ${i}}, key: ${i}`);
}

var filename = 'test.xlsx'; //生成的文件名
fpath = path.join(__dirname, '/' + filename) //文件存放路径
workbook.xlsx.writeFile(fpath) //将workbook生成文件
	.then(function(res) {
		//文件生成成功后执行的操作，这里是将路径返回客户端，你可以有自己的操作
		console.log('res', res)
		// res.send({
		// 	filePath: filename
		// })
	});
