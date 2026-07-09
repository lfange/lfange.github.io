# Node.js 高级应用指南

> 本文档涵盖 Node.js 性能调优、内存管理、异步编程、生产部署等高级主题

---

## 目录

1. [性能优化](#性能优化)
2. [内存管理](#内存管理)
3. [异步编程进阶](#异步编程进阶)
4. [集群与负载均衡](#集群与负载均衡)
5. [生产环境部署](#生产环境部署)
6. [错误处理与日志](#错误处理与日志)
7. [安全最佳实践](#安全最佳实践)

---

## 性能优化

### 使用异步 I/O

Node.js 的核心优势在于异步 I/O，避免阻塞事件循环。

```javascript
// 不好 - 同步 I/O 会阻塞事件循环
const fs = require('fs');
const data = fs.readFileSync('file.txt');

// 好 - 异步 I/O
fs.readFile('file.txt', (err, data) => {
    if (err) throw err;
    // 处理数据
});

// 更好 - Promise + async/await
const { readFile } = require('fs/promises');

async function readData() {
    try {
        const data = await readFile('file.txt');
        // 处理数据
    } catch (err) {
        console.error(err);
    }
}
```

### 流式处理

对于大文件，使用流式处理可以降低内存消耗。

```javascript
const fs = require('fs');
const zlib = require('zlib');

const readStream = fs.createReadStream('largefile.txt');
const writeStream = fs.createWriteStream('largefile.txt.gz');
const gzip = zlib.createGzip();

readStream
    .pipe(gzip)
    .pipe(writeStream)
    .on('finish', () => {
        console.log('文件压缩完成');
    });
```

### 缓存优化

使用内存缓存减少重复计算。

```javascript
// 使用 lru-cache
const LRU = require('lru-cache');

const cache = new LRU({
    max: 500,
    ttl: 1000 * 60 * 60  // 1小时
});

function getData(key) {
    let data = cache.get(key);
    if (!data) {
        data = fetchDataFromDB(key);  // 数据库查询等耗时操作
        cache.set(key, data);
    }
    return data;
}
```

---

## 内存管理

### 监控内存使用

```javascript
// 监控内存使用
setInterval(() => {
    const mem = process.memoryUsage();
    console.log({
        rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
        external: `${Math.round(mem.external / 1024 / 1024)} MB`
    });
}, 5000);

// 手动触发垃圾回收（需要 --expose-gc 参数）
if (global.gc) {
    global.gc();
    console.log('触发垃圾回收');
}
```

### 避免内存泄漏

常见的内存泄漏情况：

```javascript
// 全局变量未释放
let cache = [];  // 全局变量不断增长

// 正确做法：使用后清理或使用局部变量
function processData(data) {
    const localCache = [];
    // 处理数据
    return result;
}

// 未清理的事件监听器
const emitter = new EventEmitter();
emitter.on('data', () => { /* ... */ });
// 使用完后移除
emitter.removeAllListeners('data');

// 闭包保留引用
let theThing = null;
const replaceThing = () => {
    const originalThing = theThing;
    const unused = () => {
        if (originalThing) { /* 引用 originalThing */ }
    };
    theThing = { longStr: new Array(1000000).join('*') };
};
setInterval(replaceThing, 1000);
```

### Buffer 使用优化

```javascript
// 避免创建大量小 Buffer
// 使用 Buffer.allocUnsafe() 比 Buffer.alloc() 快，但不安全
const buf = Buffer.allocUnsafe(1024);

// 使用 Buffer.concat() 一次拼接多个 Buffer
const bufs = [buf1, buf2, buf3];
const result = Buffer.concat(bufs);

// 使用 TypedArray 提高性能
const uint8 = new Uint8Array(1024);
```

---

## 异步编程进阶

### Promise 最佳实践

```javascript
// 并行执行多个异步操作
async function parallelTasks() {
    const [result1, result2, result3] = await Promise.all([
        fetch('url1'),
        fetch('url2'),
        fetch('url3')
    ]);
    return { result1, result2, result3 };
}

// 容错的并行执行
async function parallelWithFailsafe() {
    const [result1, result2, result3] = await Promise.allSettled([
        fetch('url1'),
        fetch('url2'),
        fetch('url3')
    ]);
    return { result1, result2, result3 };
}

// Promise 链
fetch('url')
    .then(res => res.json())
    .then(data => process(data))
    .catch(err => console.error(err))
    .finally(() => cleanup());
```

### 使用 async/await

```javascript
// try-catch 错误处理
async function asyncFunction() {
    try {
        const result1 = await asyncOperation1();
        const result2 = await asyncOperation2(result1);
        return result2;
    } catch (err) {
        console.error('发生错误:', err);
        throw err;  // 重新抛出以便上层处理
    }
}

// 带超时的异步操作
function asyncWithTimeout(promise, timeout) {
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('操作超时')), timeout);
    });
    return Promise.race([promise, timeoutPromise]);
}
```

### 使用 EventEmitter

```javascript
const { EventEmitter } = require('events');

class MyService extends EventEmitter {
    constructor() {
        super();
    }
    
    async process(data) {
        this.emit('start', data);
        try {
            const result = await this._doProcess(data);
            this.emit('success', result);
            return result;
        } catch (err) {
            this.emit('error', err);
            throw err;
        }
    }
    
    async _doProcess(data) {
        // 实际处理逻辑
    }
}

// 使用
const service = new MyService();
service.on('start', data => console.log('开始处理', data));
service.on('success', result => console.log('处理成功', result));
service.on('error', err => console.error('处理失败', err));
```

---

## 集群与负载均衡

### 使用 cluster 模块

```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log(`主进程 ${process.pid} 正在运行`);
    
    // 衍生工作进程
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`工作进程 ${worker.process.pid} 已退出`);
        // 自动重启
        cluster.fork();
    });
} else {
    // 工作进程 - 创建服务器
    const http = require('http');
    const server = http.createServer((req, res) => {
        res.writeHead(200);
        res.end('Hello World\n');
    });
    
    server.listen(8000);
    console.log(`工作进程 ${process.pid} 已启动`);
}
```

### PM2 管理

```bash
# 安装 PM2
npm install pm2 -g

# 启动应用
pm2 start app.js

# 集群模式启动
pm2 start app.js -i max

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart app

# 停止应用
pm2 stop app

# 删除应用
pm2 delete app

# 生成启动脚本
pm2 startup
pm2 save
```

---

## 生产环境部署

### 环境变量管理

```javascript
// 使用 dotenv
require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    },
    env: process.env.NODE_ENV || 'development'
};

// 验证必需的环境变量
const requiredEnvs = ['DB_NAME', 'DB_USER', 'DB_PASSWORD'];
for (const env of requiredEnvs) {
    if (!process.env[env]) {
        throw new Error(`缺少必需的环境变量: ${env}`);
    }
}

module.exports = config;
```

### 优雅关闭

```javascript
const server = http.createServer(app);

server.listen(3000);

// 优雅关闭
process.on('SIGINT', () => {
    console.log('收到 SIGINT 信号，正在关闭服务...');
    
    server.close(() => {
        console.log('HTTP 服务已关闭');
        process.exit(0);
    });
    
    // 超时强制关闭
    setTimeout(() => {
        console.error('强制关闭进程');
        process.exit(1);
    }, 10000);
});
```

---

## 错误处理与日志

### 统一错误处理

```javascript
class AppError extends Error {
    constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

// Express 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err.isOperational) {
        res.status(err.statusCode).json({
            code: err.code,
            message: err.message
        });
    } else {
        res.status(500).json({
            code: 'INTERNAL_ERROR',
            message: '服务器内部错误'
        });
    }
});
```

### 日志记录

```javascript
// 使用 winston 或 pino
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// 生产环境也输出到控制台
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple()
    }));
}

// 使用
logger.info('应用启动');
logger.error('发生错误', { error: err });
```

---

## 安全最佳实践

### 输入验证

```javascript
const Joi = require('joi');

const userSchema = Joi.object({
    username: Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),
    email: Joi.string()
        .email()
        .required(),
    password: Joi.string()
        .min(8)
        .required()
});

function validateUser(data) {
    const result = userSchema.validate(data);
    if (result.error) {
        throw new AppError(result.error.message, 400, 'VALIDATION_ERROR');
    }
    return result.value;
}
```

### 防止常见攻击

```javascript
const helmet = require('helmet');

// 使用 helmet 保护 Express 应用
app.use(helmet());

// 防止 SQL 注入 - 使用参数化查询
const db = require('some-db-library');
async function getUser(id) {
    // 安全
    return db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    // 不安全 - 不要这样做！
    // return db.query(`SELECT * FROM users WHERE id = ${id}`);
}

// XSS 防护 - 输出编码
function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}
```

### 安全配置

```javascript
// 隐藏框架信息
app.disable('x-powered-by');

// 限制请求体大小
app.use(express.json({ limit: '10kb' }));

// 设置 CSP
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'trusted-scripts.com']
    }
}));
```

---

## 调试与性能分析

### 使用调试工具

```javascript
// VS Code 调试配置
// 在 .vscode/launch.json 中
{
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "启动程序",
            "program": "${workspaceFolder}/app.js"
        }
    ]
}
```

### 性能分析

```javascript
// 使用 console.time
console.time('my-operation');
// 执行操作
console.timeEnd('my-operation');  // 输出执行时间

// 使用 process.hrtime
const start = process.hrtime();
// 执行操作
const [sec, nanosec] = process.hrtime(start);
console.log(`执行时间: ${sec}秒 ${nanosec/1000000}毫秒`);
```

---

## 参考资料

- [Node.js 官方文档](https://nodejs.org/docs/latest/api/)
- [Node.js 最佳实践](https://github.com/goldbergyoni/nodebestpractices)
- [Express 安全最佳实践](https://expressjs.com/en/advanced/best-practice-security.html)
- [PM2 文档](https://pm2.keymetrics.io/docs/usage/quick-start/)
