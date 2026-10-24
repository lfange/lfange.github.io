# Express Checkin Service

## 项目介绍
本项目是基于 Node.js Express 框架重写的签到管理服务，旨在替换原有的 Java Spring Boot 实现。项目使用轻量级的 SQLite 作为数据存储，具有高性能、低消耗、易部署的特点，适用于 IoT 设备签到日志的记录与查询。

## 核心功能
- **设备签到 (Checkin)**: 接收设备发送的签到请求，记录设备名称、检查类型、原始消息等，并自动生成服务端时间戳。
- **日志查询 (List)**: 支持按设备类型过滤查询所有签到日志。
- **详情查询 (Detail)**: 根据日志 ID 获取单条记录详情。
- **数据更新 (Update)**: 支持对已有签到记录的修改。
- **数据删除 (Delete)**: 支持根据 ID 删除特定的签到记录。

## 项目结构
```text
express-checkin-service/
├── db.js                # 数据库配置与初始化（SQLite）
├── server.js            # Express 服务入口与路由逻辑
├── package.json         # 项目依赖与脚本配置
├── checkin.db           # SQLite 数据库文件（自动生成）
└── node_modules/        # 项目依赖库
```

## 技术栈
- **运行时**: Node.js
- **框架**: Express.js
- **数据库**: SQLite3 (轻量级本地数据库)
- **中间件**: body-parser (解析 JSON), cors (跨域支持)

## 接口文档

### 1. 设备签到
- **URL**: `/api/iot/checkin`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "deviceName": "设备名称",
    "checkType": "检查类型",
    "rawMessage": "原始消息内容",
    "checkinTime": 1682332800000
  }
  ```

### 2. 获取签到列表
- **URL**: `/api/iot/list`
- **Method**: `GET`
- **Query Params**: `type` (可选，按类型过滤)

### 3. 获取记录详情
- **URL**: `/api/iot/get/:id`
- **Method**: `GET`

### 4. 更新签到记录
- **URL**: `/api/iot/update/:id`
- **Method**: `PUT`
- **Body**: 包含需要更新的字段。

### 5. 删除签到记录
- **URL**: `/api/iot/delete/:id`
- **Method**: `DELETE`

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 启动服务
```bash
node server.js
```
服务默认运行在 `http://localhost:3000`。

## 注意事项
- 数据库文件 `checkin.db` 会在首次运行服务时自动创建。
- 接口逻辑与原 Java 版本 `CheckinController` 保持一致，字段命名采用驼峰式以兼容前端。

```
setsid nohup node server.js >> server.log 2>&1 &
```
