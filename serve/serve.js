const http = require('http');
const hostname = '0.0.0.0';
const port = 80;
const server = http.createServer((req, res) => { 
    res.statusCode = 200;
		res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'})
    res.end('此域名可售\n请联系653398363@qq.com');
}); 
server.listen(port, hostname, () => { 
    console.log(`Server running at http://${hostname}:${port}/`);
});