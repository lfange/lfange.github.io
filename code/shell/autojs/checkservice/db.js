const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'checkin.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS checkin_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_name TEXT,
        check_type TEXT,
        raw_message TEXT,
        check_time TEXT,
        checkin_time INTEGER
    )`, (err) => {
        if (err) {
            console.error('Could not create table', err);
        } else {
            console.log('Table checkin_logs is ready');
        }
    });
});

module.exports = db;
