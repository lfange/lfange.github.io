const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

async function initDb() {
    // 打开数据库文件，如果不存在会自动创建
    const db = await open({
        filename: path.join(__dirname, 'database.db'),
        driver: sqlite3.Database
    });

    // 创建一个简单的 users 表
    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )
    `);

    // 插入一些初始数据（如果表为空）
    const count = await db.get('SELECT COUNT(*) as count FROM users');
    if (count.count === 0) {
        await db.run('INSERT INTO users (name, email) VALUES (?, ?)', 'Alice', 'alice@example.com');
        await db.run('INSERT INTO users (name, email) VALUES (?, ?)', 'Bob', 'bob@example.com');
        console.log('Database initialized with seed data.');
    }

    return db;
}

module.exports = { initDb };
