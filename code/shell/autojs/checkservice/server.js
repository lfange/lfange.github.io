const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = 8080;

app.use(cors());
app.use(bodyParser.json());

const router = express.Router();


// 字段名驼峰转换工具函数 (递归处理对象键名)
const toCamelCase = (obj) => {
    if (Array.isArray(obj)) {
        return obj.map(v => toCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            const camelKey = key.replace(/([-_][a-z])/ig, ($1) => {
                return $1.toUpperCase().replace('-', '').replace('_', '');
            });
            result[camelKey] = toCamelCase(obj[key]);
            return result;
        }, {});
    }
    return obj;
};

// 全局响应拦截中间件：自动将返回给前端的字段转为驼峰
app.use((req, res, next) => {
    const originalJson = res.json;
    res.json = function (data) {
        // 只对对象或数组进行转换
        if (typeof data === 'object' && data !== null) {
            data = toCamelCase(data);
        }
        return originalJson.call(this, data);
    };
    next();
});

// POST /api/iot/checkin
router.post('/iot/checkin', (req, res) => {
    const { deviceName, checkType, rawMessage, checkinTime } = req.body;
    console.log('checkin', req.body);

    const checkTime = new Date().toISOString(); // Using ISO format for LocalDateTime equivalent

    const sql = `INSERT INTO checkin_logs (device_name, check_type, raw_message, check_time, checkin_time) 
                 VALUES (?, ?, ?, ?, ?)`;
    const params = [deviceName, checkType, rawMessage, checkTime, checkinTime];

    db.run(sql, params, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        res.status(200).send('Checkin log inserted');
    });
});

// GET /api/iot/list
router.get('/iot/list', (req, res) => {
    const type = req.query.type;
    let sql = 'SELECT * FROM checkin_logs';
    const params = [];

    if (type) {
        sql += ' WHERE check_type = ?';
        params.push(type);
    }

    sql += ' ORDER BY check_time DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET /api/iot/get/:id
router.get('/iot/get/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM checkin_logs WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        if (!row) return res.status(404).send('Not found');
        res.json(row);
    });
});

// PUT /api/iot/update/:id
router.put('/iot/update/:id', (req, res) => {
    const { id } = req.params;
    const { deviceName, checkType, rawMessage, checkinTime } = req.body;
    
    const sql = `UPDATE checkin_logs SET device_name = ?, check_type = ?, raw_message = ?, checkin_time = ? 
                 WHERE id = ?`;
    const params = [deviceName, checkType, rawMessage, checkinTime, id];

    db.run(sql, params, function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).send('Not found');
        res.send('Update successful');
    });
});

// DELETE /api/iot/delete/:id
router.delete('/iot/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM checkin_logs WHERE id = ?';
    db.run(sql, [id], function(err) {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) return res.status(404).send('Not found');
        res.send('Delete successful');
    });
});

// app.use('/api', router);
app.use('/', router); // 同时支持不带 /api 前缀的请求，以兼容原有 Java 接口

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
