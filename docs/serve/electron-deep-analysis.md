# Electron 深度分析：运行机制、架构原理、常见问题与性能优化

## 目录
1. [Electron 概述](#1-electron-概述)
2. [架构原理](#2-架构原理)
3. [进程模型](#3-进程模型)
4. [IPC 通信机制](#4-ipc-通信机制)
5. [渲染机制](#5-渲染机制)
6. [生命周期管理](#6-生命周期管理)
7. [安全模型](#7-安全模型)
8. [常见问题与解决方案](#8-常见问题与解决方案)
9. [性能优化](#9-性能优化)
10. [最佳实践](#10-最佳实践)

---

## 1. Electron 概述

Electron 是一个使用 Web 技术（HTML、CSS、JavaScript）构建跨平台桌面应用的框架。它由 GitHub 开发，最初为 Atom 编辑器而创建，现已广泛应用于 VS Code、Slack、Discord、Figma 等知名应用。

### 1.1 核心组成

```
┌──────────────────────────────────────────────┐
│                  Electron App                │
├──────────────────────────────────────────────┤
│  Chromium (渲染引擎)    │   Node.js (运行时)  │
├──────────────────────────────────────────────┤
│  libchromiumcontent     │   V8 / libuv       │
├──────────────────────────────────────────────┤
│              原生 API 层 (Native APIs)        │
├──────────────────────────────────────────────┤
│         操作系统 (Windows / macOS / Linux)    │
└──────────────────────────────────────────────┘
```

- **Chromium**：负责 UI 渲染，每个窗口对应一个 Chromium Renderer 进程
- **Node.js**：提供文件系统访问、网络操作、子进程管理等系统级能力
- **Native APIs**：通过 C++ 插件提供原生操作系统能力（菜单、托盘、通知、对话框等）

### 1.2 版本依赖关系

| Electron 版本 | Chromium 版本 | Node.js 版本 | V8 版本    |
|--------------|--------------|-------------|-----------|
| v28.x        | 120          | 18.18       | 12.0      |
| v29.x        | 122          | 20.11       | 12.2      |
| v30.x        | 124          | 20.11       | 12.4      |
| v31.x        | 126          | 20.14       | 12.6      |
| v32.x        | 128          | 20.16       | 12.8      |

---

## 2. 架构原理

### 2.1 整体架构

```
┌──────────────────────────────────────────────────────────┐
│                     Main Process (主进程)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Window 管理  │  │ 原生 API 调用 │  │ 应用生命周期管理  │  │
│  └─────────────┘  └──────────────┘  └─────────────────┘  │
│                          │                               │
│                    IPC 通信层                             │
│         (ipcMain / ipcRenderer / MessagePort)            │
│                          │                               │
├──────────────────────────┼───────────────────────────────┤
│              Renderer Process (渲染进程 x N)               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Chromium   │  │  DOM / CSS   │  │  JavaScript     │  │
│  │  渲染引擎    │  │  布局引擎     │  │  (V8 引擎)      │  │
│  └─────────────┘  └──────────────┘  └─────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### 2.2 多进程架构的动机

Electron 采用多进程架构的核心原因：

1. **稳定性隔离**：单个渲染进程崩溃不影响其他窗口和主进程
2. **安全性隔离**：渲染进程运行在沙箱中，限制系统级访问
3. **性能隔离**：各窗口独立运行，避免单页面卡顿影响全局
4. **Chromium 设计继承**：继承自 Chromium 的多进程架构设计

### 2.3 源码层面的初始化流程

```
app.on('ready')
    │
    ├── 创建 BrowserWindow
    │   ├── 初始化 NativeWindow (C++ 层)
    │   ├── 创建 RenderProcessHost
    │   ├── 建立 IPC 通道
    │   └── 加载 HTML 内容
    │
    ├── 注册原生模块
    │   ├── Menu, Tray, Notification
    │   └── dialog, clipboard, globalShortcut
    │
    └── 进入事件循环 (libuv event loop)
```

---

## 3. 进程模型

### 3.1 主进程 (Main Process)

主进程是应用的入口点，每个 Electron 应用有且仅有一个主进程。

```javascript
// main.js - 主进程
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,       // 安全：禁用 Node 集成
      contextIsolation: true,       // 安全：启用上下文隔离
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true,                // 安全：启用沙箱
    },
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(createWindow);

// 处理来自渲染进程的请求
ipcMain.handle('read-file', async (event, filePath) => {
  const fs = require('fs').promises;
  return await fs.readFile(filePath, 'utf-8');
});
```

**主进程职责**：
- 管理应用生命周期（启动、退出、激活等）
- 创建和管理 BrowserWindow 实例
- 注册系统级事件（菜单、托盘、快捷键）
- 处理原生对话框和通知
- 管理自动更新
- 通过 IPC 与渲染进程通信

### 3.2 渲染进程 (Renderer Process)

每个 BrowserWindow 运行在独立的渲染进程中。渲染进程负责 UI 展示和用户交互。

```javascript
// renderer.js - 渲染进程
// 通过 contextBridge 暴露的 API 访问主进程功能
const result = await window.electronAPI.readFile('/path/to/file.txt');

// 渲染进程不应直接使用 Node.js API
// 所有系统调用应通过 preload + IPC 完成
```

```javascript
// preload.js - 预加载脚本（桥梁）
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  // 只暴露必要的、安全的 API
});
```

### 3.3 GPU 进程

Chromium 使用独立的 GPU 进程进行图形加速：

```
主进程 ──创建──> GPU 进程
                    │
                    ├── 处理 WebGL 渲染
                    ├── 处理 Canvas 2D 加速
                    ├── 视频解码加速
                    └── CSS 动画合成
```

### 3.4 进程数计算

| 组件                | 进程数                |
|---------------------|----------------------|
| 主进程               | 1                    |
| 渲染进程             | N (每个 BrowserWindow 1个) |
| GPU 进程             | 1                    |
| 网络服务进程          | 1 (Chromium 网络栈)   |
| 扩展进程             | 按需 (DevTools 等)    |
| **总计**             | **3 + N + 扩展**      |

### 3.5 进程创建流程图

```
app.whenReady()
      │
      ▼
new BrowserWindow(options)
      │
      ▼
NativeWindow::Create()  ──── C++ 层
      │
      ├──> content::SiteInstance::CreateForURL()
      │         │
      │         ▼
      │    RenderProcessHost::Create()
      │         │
      │         ▼
      │    ChildProcessLauncher::Launch()  ── 创建子进程
      │         │
      │         ▼
      │    RenderProcess 启动
      │         │
      │         ├── 初始化 Blink 渲染引擎
      │         ├── 初始化 V8 JavaScript 引擎
      │         └── 建立 IPC 通道到主进程
      │
      └──> 注册 BrowserWindow 事件监听
```

---

## 4. IPC 通信机制

### 4.1 通信架构

```
┌─────────────────────────────────────────────────────────┐
│                      Main Process                       │
│  ┌───────────────────────────────────────────────────┐  │
│  │                   ipcMain                         │  │
│  │  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │  │
│  │  │  handle  │  │   on     │  │ handleOnce    │  │  │
│  │  └────┬─────┘  └────┬─────┘  └───────┬───────┘  │  │
│  └───────┼─────────────┼────────────────┼───────────┘  │
│          │             │                │               │
│    ┌─────┴─────────────┴────────────────┴──────────┐   │
│    │           mojo / ChannelMojo                   │   │
│    │         (底层 IPC 传输层)                       │   │
│    └─────┬─────────────┬────────────────┬──────────┘   │
└──────────┼─────────────┼────────────────┼──────────────┘
           │             │                │
    ┌──────┴─────────────┴────────────────┴──────────────┐
    │                Renderer Process A                   │
    │  ┌──────────────────────────────────────────────┐  │
    │  │                ipcRenderer                    │  │
    │  │  ┌──────────┐  ┌──────────┐  ┌────────────┐  │  │
    │  │  │  invoke  │  │   send   │  │  postMessage│  │  │
    │  │  └──────────┘  └──────────┘  └────────────┘  │  │
    │  └──────────────────────────────────────────────┘  │
    └────────────────────────────────────────────────────┘
```

### 4.2 IPC 通信模式

#### 模式 1: 请求-响应模式 (invoke/handle) — **推荐**

```javascript
// 主进程 (main.js)
ipcMain.handle('get-user-data', async (event, userId) => {
  const data = await database.query('SELECT * FROM users WHERE id = ?', [userId]);
  return data;  // 自动序列化返回
});

// 渲染进程 (preload.js)
contextBridge.exposeInMainWorld('api', {
  getUserData: (userId) => ipcRenderer.invoke('get-user-data', userId),
});

// 渲染进程使用
const userData = await window.api.getUserData(123);
```

**时序图**：
```
Renderer              Main
   │                    │
   │── invoke ─────────>│
   │                    │── 处理请求
   │                    │── 查询数据库
   │                    │── 返回结果
   │<──── result ───────│
   │                    │
```

#### 模式 2: 单向消息 (send/on)

```javascript
// 渲染进程 -> 主进程
ipcRenderer.send('log-event', { type: 'click', target: 'button-1' });

// 主进程
ipcMain.on('log-event', (event, data) => {
  logger.info(data);
  // 可选：回复
  event.reply('log-event-response', { status: 'logged' });
});

// 主进程 -> 渲染进程
mainWindow.webContents.send('update-available', { version: '2.0.0' });

// 渲染进程
ipcRenderer.on('update-available', (event, data) => {
  showUpdateNotification(data.version);
});
```

#### 模式 3: MessagePort (高性能场景)

```javascript
// 主进程
const { port1, port2 } = new MessageChannelMain();

// 将 port2 发送给渲染进程
mainWindow.webContents.postMessage('port', null, [port2]);

// 主进程侧使用 port1
port1.on('message', (event) => {
  console.log('Received:', event.data);
});
port1.postMessage('Hello from main');

// 渲染进程 (preload.js)
ipcRenderer.on('port', (event) => {
  const [port] = event.ports;
  port.onmessage = (e) => console.log('Received:', e.data);
  port.postMessage('Hello from renderer');
});
```

### 4.3 IPC 性能对比

| 通信方式          | 延迟 (小数据) | 吞吐量 (大数据) | 适用场景              |
|-------------------|--------------|----------------|----------------------|
| ipcMain.handle    | ~0.05ms      | 中等            | 请求-响应（推荐）      |
| ipcMain.on        | ~0.03ms      | 中等            | 单向消息、事件通知     |
| MessagePort       | ~0.01ms      | 高              | 高频消息、流式传输     |
| webContents.send  | ~0.04ms      | 中等            | 主进程 -> 渲染进程    |

### 4.4 底层实现原理

Electron 的 IPC 基于 Chromium 的 **Mojo** 框架：

```
JavaScript API (ipcMain/ipcRenderer)
        │
        ▼
Electron IPC Bridge (C++)
        │
        ▼
Mojo Interface (chromium)
        │
        ├── 本机: Unix Domain Socket / Named Pipe
        │
        └── 序列化: 使用 V8 ValueSerializer (基于结构化克隆算法)
```

---

## 5. 渲染机制

### 5.1 Chromium 渲染流水线

```
HTML ──> DOM Tree ──> Style ──> Layout ──> Paint ──> Composite ──> Display
         (解析)     (CSSOM)   (布局树)   (绘制)    (合成层)      (GPU)
```

### 5.2 BrowserWindow 配置对渲染的影响

```javascript
const mainWindow = new BrowserWindow({
  // === 渲染性能配置 ===
  webPreferences: {
    // 开启硬件加速（默认 true）
    // 某些虚拟化环境需要关闭
    hardwareAcceleration: true,

    // 离屏渲染（用于特殊场景如透明窗口）
    offscreen: false,

    // 后台限制（最小化时降低渲染频率）
    backgroundThrottling: true,
  },

  // === 窗口显示策略 ===
  show: false,  // 先隐藏，ready-to-show 后再显示，避免白屏

  // === 透明窗口 ===
  transparent: false,  // 透明窗口会严重影响性能

  // === 原生窗口操作 ===
  frame: true,   // false 时需自绘标题栏
});

// 避免白屏的最佳实践
mainWindow.once('ready-to-show', () => {
  mainWindow.show();
});
```

### 5.3 离屏渲染 (Offscreen Rendering)

用于嵌入到其他原生应用或进行截图：

```javascript
const offscreenWindow = new BrowserWindow({
  webPreferences: { offscreen: true },
  show: false,
});

// 获取渲染结果
offscreenWindow.webContents.on('paint', (event, dirty, image) => {
  // image 是 NativeImage
  // dirty 是脏区域矩形
});

// 手动触发帧捕获
offscreenWindow.webContents.invalidate();
```

---

## 6. 生命周期管理

### 6.1 应用生命周期

```
┌──────────┐
│  启动应用  │
└────┬─────┘
     ▼
┌──────────┐
│  ready   │ ← app.whenReady()
└────┬─────┘
     ▼
┌──────────┐
│  运行中   │ ← 创建窗口、处理事件
└────┬─────┘
     │
     ├──> 'window-all-closed' (所有窗口关闭)
     │         │
     │         ├── macOS: 应用保持活跃
     │         └── Windows/Linux: 退出
     │
     ├──> 'before-quit' (即将退出)
     │         │
     │         └── 清理资源、保存状态
     │
     └──> 'quit' (退出)
               │
               └── 最终清理
```

```javascript
// 完整的生命周期管理
const { app, BrowserWindow } = require('electron');

let mainWindow = null;

app.whenReady().then(() => {
  createWindow();

  // macOS: 点击 Dock 图标重新创建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 退出前保存状态
app.on('before-quit', async () => {
  // 阻止立即退出以完成异步操作
  // 注意：此事件中不应调用 app.quit()
  await saveApplicationState();
});

// 强制退出处理
app.on('quit', () => {
  // 同步清理
  cleanupTempFiles();
});
```

### 6.2 BrowserWindow 生命周期

```
new BrowserWindow()
      │
      ▼
┌────────────┐
│  creating   │ → 窗口对象创建，NativeWindow 初始化中
└─────┬──────┘
      ▼
┌────────────┐
│  loading    │ → 开始加载页面内容
└─────┬──────┘
      │
      ├── 'did-start-loading'
      ├── 'dom-ready'
      ├── 'did-finish-load'
      │
      ▼
┌────────────┐
│   ready     │ → 'ready-to-show' 事件
└─────┬──────┘
      ▼
┌────────────┐
│   active    │ → 窗口可见，用户可交互
└─────┬──────┘
      │
      ├── 'blur' / 'focus' (焦点变化)
      ├── 'minimize' / 'maximize' / 'restore'
      ├── 'resize' / 'move'
      │
      ▼
┌────────────┐
│   closing   │ → 'close' 事件（可取消）
└─────┬──────┘
      ▼
┌────────────┐
│   closed    │ → 'closed' 事件（不可逆）
└────────────┘
```

---

## 7. 安全模型

### 7.1 安全隔离层次

```
┌──────────────────────────────────────────────────────┐
│                    操作系统层                          │
│  ┌────────────────────────────────────────────────┐  │
│  │              沙箱 (Sandbox)                     │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │          上下文隔离 (Context Isolation)    │  │  │
│  │  │  ┌────────────────────────────────────┐  │  │  │
│  │  │  │      Preload Script                │  │  │  │
│  │  │  │  ┌──────────────────────────────┐  │  │  │  │
│  │  │  │  │     Renderer (Web 内容)       │  │  │  │  │
│  │  │  │  │   (不能访问 Node.js)          │  │  │  │  │
│  │  │  │  └──────────────────────────────┘  │  │  │  │
│  │  │  └────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

### 7.2 安全配置最佳实践

```javascript
const mainWindow = new BrowserWindow({
  webPreferences: {
    // === 必须配置 ===
    nodeIntegration: false,       // 禁止渲染进程使用 Node.js
    contextIsolation: true,       // 隔离 preload 和 web 上下文
    sandbox: true,                // 启用 Chromium 沙箱

    // === 推荐配置 ===
    webSecurity: true,            // 启用同源策略
    allowRunningInsecureContent: false,  // 禁止混合内容
    experimentalFeatures: false,  // 禁止实验性功能

    // === preload 脚本 ===
    preload: path.join(__dirname, 'preload.js'),
  },
});

// === 安全的内容安全策略 ===
// 在 HTML 中设置：
// <meta http-equiv="Content-Security-Policy"
//       content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'">

// === 导航安全 ===
mainWindow.webContents.on('will-navigate', (event, url) => {
  // 只允许同源导航
  if (!url.startsWith('file://') && !isAllowedDomain(url)) {
    event.preventDefault();
  }
});

// 禁止新窗口打开
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  // 在外部浏览器中打开
  require('electron').shell.openExternal(url);
  return { action: 'deny' };
});
```

### 7.3 Context Bridge 详解

```javascript
// preload.js - 安全的 API 暴露
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 只暴露特定函数，不暴露整个 ipcRenderer
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  saveFile: (content) => ipcRenderer.invoke('dialog:saveFile', content),

  // 使用回调包装事件监听
  onMenuAction: (callback) => {
    const subscription = (_event, action) => callback(action);
    ipcRenderer.on('menu-action', subscription);
    // 返回取消订阅函数
    return () => ipcRenderer.removeListener('menu-action', subscription);
  },

  // 暴露平台信息（只读、安全的值）
  platform: process.platform,
  appVersion: process.env.npm_package_version,
});

// 错误处理：contextBridge 抛出的错误不会泄漏到渲染进程
```

---

## 8. 常见问题与解决方案

### 8.1 白屏/启动慢

**现象**：应用启动后长时间显示白屏

**原因分析**：
```
启动时间线：
├── app ready            (~200ms)
├── 创建 BrowserWindow    (~50ms)
├── 加载 HTML             (~100ms)
├── 解析/执行 JS          (~500ms - 可能很长)
├── 首次渲染 (FCP)         (取决于 JS 大小)
└── 可交互 (TTI)           (取决于框架初始化)
```

**解决方案**：

```javascript
// 方案 1: 延迟显示窗口
const mainWindow = new BrowserWindow({
  show: false,
  backgroundColor: '#2e2c29',  // 设置背景色减少视觉白屏
});

mainWindow.once('ready-to-show', () => {
  mainWindow.show();
  // 可选：添加淡入动画
  mainWindow.webContents.executeJavaScript(`
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s';
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  `);
});

// 方案 2: 代码分割与懒加载
// 渲染进程中
const loadHeavyModule = () => import('./heavy-module.js');

// 方案 3: 使用启动画面
const splashWindow = new BrowserWindow({
  width: 400,
  height: 300,
  frame: false,
  transparent: true,
  alwaysOnTop: true,
});
splashWindow.loadFile('splash.html');

// 主窗口准备好后关闭启动画面
mainWindow.once('ready-to-show', () => {
  setTimeout(() => {
    splashWindow.close();
    mainWindow.show();
  }, 500);
});
```

### 8.2 内存泄漏

**常见泄漏场景**：

```javascript
// ❌ 内存泄漏 1: 未清理的事件监听器
ipcMain.on('data-update', handler);  // 主进程监听器不会被 GC

// ✅ 解决方案
function setupListener() {
  ipcMain.on('data-update', handler);
  window.on('closed', () => {
    ipcMain.removeListener('data-update', handler);
  });
}

// ❌ 内存泄漏 2: 未关闭的 BrowserWindow
let windows = [];
function openWindow() {
  const win = new BrowserWindow();
  windows.push(win);  // 引用保持，无法 GC
}
// 关闭后引用仍然保持

// ✅ 解决方案
function openWindow() {
  const win = new BrowserWindow();
  win.on('closed', () => {
    windows = windows.filter(w => w !== win);
  });
  windows.push(win);
}

// ❌ 内存泄漏 3: 渲染进程中的全局变量
window.globalCache = new Map();  // 永不释放

// ✅ 解决方案：使用 WeakMap 或定期清理
```

**内存监控**：

```javascript
// 主进程中监控内存
setInterval(() => {
  const memUsage = process.memoryUsage();
  console.log('Main Process Memory:', {
    rss: `${(memUsage.rss / 1024 / 1024).toFixed(1)} MB`,
    heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(1)} MB`,
    heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(1)} MB`,
    external: `${(memUsage.external / 1024 / 1024).toFixed(1)} MB`,
  });
}, 30000);

// 监控所有渲染进程的内存
app.on('web-contents-created', (event, contents) => {
  contents.on('render-process-gone', (event, details) => {
    console.error('Renderer crashed:', details);
  });
});

// 获取渲染进程内存（需要 enableBlinkFeatures）
mainWindow.webContents.getProcessMemoryInfo().then(info => {
  console.log('Renderer Memory:', info);
});
```

### 8.3 进程崩溃

```javascript
// 监控渲染进程崩溃
app.on('render-process-gone', (event, webContents, details) => {
  const { reason, exitCode } = details;
  console.error(`Renderer crashed: reason=${reason}, exitCode=${exitCode}`);

  // 根据原因采取不同策略
  switch (reason) {
    case 'crashed':
      // 记录崩溃信息用于调试
      const crashInfo = {
        url: webContents.getURL(),
        pid: webContents.getOSProcessId(),
        timestamp: new Date().toISOString(),
      };
      crashReporter.addExtraParameter('crashInfo', JSON.stringify(crashInfo));
      break;

    case 'killed':
      // 被系统 OOM Killer 杀死 — 需要减少内存使用
      break;

    case 'launch-failed':
      // 启动失败 — 可能是沙箱配置问题
      break;

    case 'clean-exit':
      // 正常退出，无需处理
      break;
  }
});

// 崩溃自动恢复
let crashCount = 0;
const MAX_CRASHES = 3;
const CRASH_WINDOW = 60000;  // 1 分钟内

app.on('render-process-gone', (event, webContents, details) => {
  if (details.reason === 'crashed') {
    crashCount++;
    setTimeout(() => crashCount--, CRASH_WINDOW);

    if (crashCount <= MAX_CRASHES) {
      // 恢复窗口
      const window = BrowserWindow.fromWebContents(webContents);
      if (window && !window.isDestroyed()) {
        window.loadFile('index.html');
      }
    } else {
      // 崩溃过多，显示错误页面
      console.error('Too many crashes, showing error page');
    }
  }
});
```

### 8.4 更新与分发问题

```javascript
// autoUpdater 最佳实践
const { autoUpdater } = require('electron-updater');

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

// 检查更新
app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify().catch(err => {
    console.log('Update check failed (offline or no updates):', err.message);
  });
});

// 下载进度
autoUpdater.on('download-progress', (progress) => {
  mainWindow.webContents.send('update-progress', progress.percent);
});

// 更新可用
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update-available');
});
```

### 8.5 跨平台兼容性问题

```javascript
// 平台检测
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';

// 路径处理（始终使用 path.join）
const path = require('path');
const userDataPath = app.getPath('userData');
const configPath = path.join(userDataPath, 'config.json');

// macOS 特殊行为
app.on('window-all-closed', () => {
  // macOS 上应用保持运行，除非用户按 Cmd+Q
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  // macOS 点击 Dock 图标时重新创建窗口
  if (isMac && BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 文件关联（Windows 特有）
if (isWindows) {
  app.setAsDefaultProtocolClient('myapp');
}

// 高 DPI 支持
if (isWindows) {
  app.commandLine.appendSwitch('high-dpi-support', '1');
  app.commandLine.appendSwitch('force-device-scale-factor', '1');
}
```

---

## 9. 性能优化

### 9.1 性能优化全景图

```
┌─────────────────────────────────────────────────────────────┐
│                    性能优化体系                              │
├───────────────┬───────────────┬───────────────┬─────────────┤
│   启动优化     │   运行时优化   │   内存优化     │  渲染优化   │
├───────────────┼───────────────┼───────────────┼─────────────┤
│ • 代码分割     │ • 虚拟列表     │ • 内存监控     │ • GPU 加速  │
│ • 延迟加载     │ • Web Worker  │ • 弱引用       │ • 分层渲染  │
│ • V8 快照      │ • 请求缓存     │ • 对象池       │ • CSS 优化  │
│ • 原生模块延迟 │ • 防抖节流     │ • 及时清理     │ • 离屏渲染  │
└───────────────┴───────────────┴───────────────┴─────────────┘
```

### 9.2 启动性能优化

#### 9.2.1 V8 快照 (V8 Snapshots)

```javascript
// 使用 V8 快照加速启动
// 1. 创建快照生成脚本
// snapshot-builder.js
const { app } = require('electron');

// 预加载核心模块
require('./core/database');
require('./core/config');
require('./core/logger');

app.whenReady().then(() => {
  // 触发快照生成
  process.exit();
});

// 2. 打包时配置
// electron-builder 配置
// "electronDownload": {
//   "customDir": "custom-electron-with-snapshot"
// }
```

#### 9.2.2 延迟加载原生模块

```javascript
// ❌ 立即加载所有模块
const fs = require('fs');
const crypto = require('crypto');
const sharp = require('sharp');  // 重量级原生模块
const sqlite3 = require('better-sqlite3');

// ✅ 按需加载
let _sharp = null;
async function getSharp() {
  if (!_sharp) {
    _sharp = await import('sharp');
  }
  return _sharp;
}

// ✅ 在空闲时预加载
app.whenReady().then(() => {
  // 主窗口准备好后，在空闲时预加载
  setTimeout(() => {
    getSharp().then(() => console.log('Sharp preloaded'));
  }, 3000);
});
```

#### 9.2.3 启动测量

```javascript
// 使用 Electron 内置的启动时间 API
app.on('ready', () => {
  const startTime = Date.now();
  createWindow();
  mainWindow.webContents.on('did-finish-load', () => {
    const loadTime = Date.now() - startTime;
    console.log(`App ready to interact in ${loadTime}ms`);
  });
});

// 更精细的测量
const { app } = require('electron');

// 记录关键时间点
const timing = {};
app.on('will-finish-launching', () => { timing.launch = Date.now(); });
app.on('ready', () => { timing.ready = Date.now(); });

mainWindow.webContents.on('did-start-loading', () => { timing.startLoad = Date.now(); });
mainWindow.webContents.on('dom-ready', () => { timing.domReady = Date.now(); });
mainWindow.webContents.on('did-finish-load', () => { timing.finishLoad = Date.now(); });
mainWindow.on('show', () => { timing.shown = Date.now(); });
```

### 9.3 运行时性能优化

#### 9.3.1 虚拟列表 (大列表渲染)

```javascript
// ❌ 直接渲染 10000 条数据
const items = Array.from({ length: 10000 }, (_, i) => ({ id: i, text: `Item ${i}` }));
// items.map(item => <div>{item.text}</div>)  // 创建 10000 个 DOM 节点

// ✅ 虚拟列表实现
class VirtualList {
  constructor(container, items, rowHeight, visibleCount) {
    this.container = container;
    this.items = items;
    this.rowHeight = rowHeight;
    this.visibleCount = visibleCount;
    this.scrollTop = 0;
    this.init();
  }

  init() {
    // 设置容器高度为总高度
    this.container.style.height = `${this.items.length * this.rowHeight}px`;
    this.container.style.position = 'relative';
    this.container.style.overflow = 'auto';

    // 创建固定数量的可见行
    this.visibleRows = [];
    for (let i = 0; i < this.visibleCount + 2; i++) {  // +2 for buffer
      const row = document.createElement('div');
      row.style.position = 'absolute';
      row.style.height = `${this.rowHeight}px`;
      row.style.width = '100%';
      this.container.appendChild(row);
      this.visibleRows.push(row);
    }

    this.container.addEventListener('scroll', () => this.onScroll());
    this.render();
  }

  onScroll() {
    this.scrollTop = this.container.scrollTop;
    this.render();
  }

  render() {
    const startIndex = Math.floor(this.scrollTop / this.rowHeight);
    const offsetY = startIndex * this.rowHeight;

    for (let i = 0; i < this.visibleRows.length; i++) {
      const itemIndex = startIndex + i;
      const row = this.visibleRows[i];

      if (itemIndex < this.items.length) {
        row.style.top = `${offsetY + i * this.rowHeight}px`;
        row.textContent = this.items[itemIndex].text;
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  }
}
```

#### 9.3.2 Web Worker 计算卸载

```javascript
// 主线程 - renderer.js
const worker = new Worker('./heavy-worker.js');

worker.postMessage({ type: 'process', data: largeDataset });

worker.onmessage = (event) => {
  const { result } = event.data;
  updateUI(result);
};

// heavy-worker.js
self.onmessage = (event) => {
  const { type, data } = event.data;

  if (type === 'process') {
    // 复杂计算在 Worker 线程中执行
    const result = data.map(item => {
      // 密集计算...
      return complexTransform(item);
    });

    self.postMessage({ result });
  }
};

// ✅ 使用 OffscreenCanvas 在 Worker 中渲染
// main.js
const offscreen = canvas.transferControlToOffscreen();
worker.postMessage({ canvas: offscreen }, [offscreen]);
```

#### 9.3.3 请求合并与缓存

```javascript
// 主进程中实现请求缓存
class RequestCache {
  constructor(ttl = 60000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  async get(key, fetchFn) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }

    const data = await fetchFn();
    this.cache.set(key, { data, timestamp: Date.now() });
    return data;
  }

  // 请求合并：多个相同请求共享一个 Promise
  getDeduped(key, fetchFn) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.data;
    }

    // 正在进行的请求
    if (cached && cached.promise) {
      return cached.promise;
    }

    const promise = fetchFn().then(data => {
      this.cache.set(key, { data, timestamp: Date.now() });
      return data;
    });

    this.cache.set(key, { promise, timestamp: Date.now() });
    return promise;
  }
}
```

### 9.4 内存优化

#### 9.4.1 对象池模式

```javascript
// 对象池：避免频繁创建/销毁大对象
class ObjectPool {
  constructor(factory, reset, initialSize = 10) {
    this.factory = factory;
    this.reset = reset;
    this.pool = [];
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.factory();
  }

  release(obj) {
    this.reset(obj);
    this.pool.push(obj);
  }
}

// 使用示例：DOM 元素池
const rowPool = new ObjectPool(
  () => document.createElement('div'),
  (row) => {
    row.textContent = '';
    row.className = '';
    row.style.cssText = '';
  },
  50
);

function renderRow(data) {
  const row = rowPool.acquire();
  row.textContent = data.text;
  row.className = 'list-item';
  return row;
}

function recycleRow(row) {
  rowPool.release(row);
}
```

#### 9.4.2 弱引用缓存

```javascript
// 使用 WeakRef 和 FinalizationRegistry 管理缓存
class WeakCache {
  constructor() {
    this.cache = new Map();
    this.registry = new FinalizationRegistry((key) => {
      this.cache.delete(key);
    });
  }

  set(key, value) {
    const ref = new WeakRef(value);
    this.cache.set(key, ref);
    this.registry.register(value, key);
  }

  get(key) {
    const ref = this.cache.get(key);
    if (ref) {
      const value = ref.deref();
      if (value !== undefined) return value;
      this.cache.delete(key);
    }
    return undefined;
  }
}
```

#### 9.4.3 渲染进程内存优化

```javascript
// 在渲染进程中
// 1. 图片懒加载
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img[data-src]').forEach(img => {
  observer.observe(img);
});

// 2. 及时释放 Blob URL
const blobUrl = URL.createObjectURL(blob);
// 使用完毕后
URL.revokeObjectURL(blobUrl);

// 3. 解除不再需要的引用
let largeData = null;  // 显式释放

// 4. 使用 requestIdleCallback 执行低优先级任务
requestIdleCallback(() => {
  // 清理缓存、压缩数据等
  garbageCollectIfNeeded();
});
```

### 9.5 渲染性能优化

#### 9.5.1 GPU 加速与合成层

```css
/* ✅ 使用 GPU 加速的属性 */
.gpu-accelerated {
  transform: translateZ(0);           /* 创建合成层 */
  will-change: transform, opacity;    /* 提示浏览器 */
}

/* ❌ 避免触发布局的属性（频繁变化时） */
.slow-animation {
  /* 不要动画化: width, height, left, top, margin, padding */
  /* 使用: transform, opacity 代替 */
}

/* ✅ 使用 transform 代替定位动画 */
.animate-in {
  transform: translateX(100px);       /* GPU 合成 */
  transition: transform 0.3s ease;
}

/* ❌ .animate-in { left: 100px; } */ /* 触发 Layout + Paint */
```

#### 9.5.2 渲染进程性能配置

```javascript
const mainWindow = new BrowserWindow({
  webPreferences: {
    // 禁用不必要的特性
    plugins: false,
    experimentalFeatures: false,
    webgl: true,  // 需要 WebGL 时启用

    // 设置合理的进程优先级
    // Chromium 标志
    // --disable-2d-canvas-clip-aa
    // --disable-gpu-vsync

    // 后台页面降低性能消耗
    backgroundThrottling: true,
  },
});

// 使用 frame 回调而不是 setInterval
function animate() {
  // 动画逻辑
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);

// 使用 IntersectionObserver 代替 scroll 事件
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('visible', entry.isIntersecting);
    });
  },
  { threshold: 0.1 }
);
```

#### 9.5.3 性能测量 (FPS 监控)

```javascript
// FPS 监控
class FPSMonitor {
  constructor() {
    this.frames = 0;
    this.lastTime = performance.now();
    this.fps = 60;
    this.running = false;
  }

  start() {
    this.running = true;
    this.tick();
  }

  stop() {
    this.running = false;
  }

  tick() {
    if (!this.running) return;

    this.frames++;
    const now = performance.now();
    if (now >= this.lastTime + 1000) {
      this.fps = Math.round((this.frames * 1000) / (now - this.lastTime));
      this.frames = 0;
      this.lastTime = now;
      this.onUpdate(this.fps);
    }
    requestAnimationFrame(() => this.tick());
  }

  onUpdate(fps) {
    // 发送到性能监控面板
    console.log(`FPS: ${fps}`);
  }
}
```

### 9.6 打包体积优化

```javascript
// electron-builder 配置优化
// electron-builder.json
{
  "appId": "com.example.app",
  "files": [
    "dist/**/*",       // 只包含构建产物
    "package.json"
  ],
  // 排除不必要的文件
  "asar": true,        // 打包成 asar 归档
  "asarUnpack": [
    "node_modules/sharp/**",    // 原生模块不解包会出问题
    "node_modules/sqlite3/**"
  ],
  // 排除开发依赖
  "npmRebuild": true,
  "nodeGypRebuild": true,
  // 压缩配置
  "compression": "maximum",
  // 只包含运行时需要的 Node 模块
  "extraResources": [],
  // 平台特定配置
  "mac": {
    "target": ["dmg", "zip"],
    "icon": "build/icon.icns",
    "minimumSystemVersion": "10.15"
  },
  "win": {
    "target": ["nsis"],
    "icon": "build/icon.ico"
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "icon": "build/icon.png",
    "category": "Utility"
  }
}
```

---

## 10. 最佳实践

### 10.1 项目结构推荐

```
my-electron-app/
├── src/
│   ├── main/                    # 主进程代码
│   │   ├── index.ts            # 主进程入口
│   │   ├── windows/            # 窗口管理
│   │   │   ├── main-window.ts
│   │   │   └── settings-window.ts
│   │   ├── ipc/                # IPC 处理
│   │   │   ├── file-handlers.ts
│   │   │   └── system-handlers.ts
│   │   ├── services/           # 业务服务
│   │   │   ├── database.ts
│   │   │   ├── updater.ts
│   │   │   └── logger.ts
│   │   └── utils/              # 工具函数
│   │       └── platform.ts
│   │
│   ├── preload/                 # Preload 脚本
│   │   ├── index.ts
│   │   └── api-bridge.ts
│   │
│   ├── renderer/                # 渲染进程
│   │   ├── index.html
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── store/
│   │   └── styles/
│   │
│   └── shared/                  # 共享代码
│       ├── types.ts
│       ├── constants.ts
│       └── ipc-channels.ts
│
├── build/                       # 构建配置
│   ├── icons/
│   └── entitlements.mac.plist
│
├── package.json
├── electron-builder.json
├── tsconfig.json
└── vite.config.ts
```

### 10.2 开发调试配置

```javascript
// 开发环境判断
const isDev = !app.isPackaged;

if (isDev) {
  // 自动打开 DevTools
  mainWindow.webContents.openDevTools();

  // 安装 React DevTools 等扩展
  const { default: installExtension, REACT_DEVELOPER_TOOLS } = require('electron-devtools-installer');
  installExtension(REACT_DEVELOPER_TOOLS);

  // 启用热重载
  require('electron-reloader')(module);
}

// 日志分级
const log = require('electron-log');
log.transports.file.level = isDev ? 'debug' : 'info';
log.transports.console.level = isDev ? 'debug' : 'warn';

// 性能分析
if (isDev) {
  app.commandLine.appendSwitch('enable-precise-memory-info');
  // Chrome 内部页面
  // chrome://gpu/         - GPU 信息
  // chrome://tracing/     - 性能追踪
  // chrome://process-internals/ - 进程信息
}
```

### 10.3 错误处理策略

```javascript
// 全局错误处理

// 主进程
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  log.error(error);
  // 记录后优雅退出
  app.quit();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  log.error('Unhandled Rejection:', reason);
});

// 渲染进程
window.addEventListener('error', (event) => {
  console.error('Renderer Error:', event.error);
  ipcRenderer.send('report-error', {
    message: event.error.message,
    stack: event.error.stack,
    filename: event.filename,
    lineno: event.lineno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Renderer Unhandled Rejection:', event.reason);
});
```

### 10.4 决策指南

| 场景                          | 推荐方案                                |
|-------------------------------|----------------------------------------|
| 简单的请求-响应                | ipcMain.handle / ipcRenderer.invoke    |
| 高频数据推送 (日志、状态)       | MessagePort 或 webContents.send        |
| 传输大文件/流                 | MessagePort + SharedArrayBuffer        |
| CPU 密集型计算                | Web Worker 或 子进程 (child_process)    |
| 跨窗口通信                    | MessagePort 或 主进程中转              |
| 持久化存储                    | electron-store / better-sqlite3        |
| 原生能力扩展                  | N-API 原生模块                         |
| 多窗口应用                    | 每个窗口独立渲染进程，主进程统一管理     |

---

## 参考资源

- [Electron 官方文档](https://www.electronjs.org/docs)
- [Electron 源码](https://github.com/electron/electron)
- [Chromium 多进程架构](https://www.chromium.org/developers/design-documents/multi-process-architecture/)
- [Mojo IPC 文档](https://chromium.googlesource.com/chromium/src/+/main/mojo/README.md)
- [V8 引擎文档](https://v8.dev/docs)

---

> 本文档基于 Electron 28+ 版本编写，部分 API 可能因版本而异。建议参考对应版本的官方文档。
