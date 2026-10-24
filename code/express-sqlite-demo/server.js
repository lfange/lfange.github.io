const express = require('express');
const { initDb } = require('./db');

const app = express();
const port = 3000;

// 中间件：解析 JSON 请求体
app.use(express.json());

// 获取所有用户
app.get('/api/users', async (req, res) => {
    try {
        const db = await initDb();
        const users = await db.all('SELECT * FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 获取单个用户
app.get('/api/users/:id', async (req, res) => {
    try {
        const db = await initDb();
        const user = await db.get('SELECT * FROM users WHERE id = ?', req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 创建新用户
app.post('/api/users', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }
    try {
        const db = await initDb();
        const result = await db.run('INSERT INTO users (name, email) VALUES (?, ?)', name, email);
        res.status(201).json({ id: result.lastID, name, email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 根路由提示
app.get('/', (req, res) => {
    res.send('Express + SQLite Demo Server Running! Try /api/users');
});

// 启动服务器并初始化数据库
(async () => {
    try {
        await initDb();
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
    }
})();
