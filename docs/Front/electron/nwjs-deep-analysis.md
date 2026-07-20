# NW.js 深度分析：版本历史、技术架构、系统支持与生态

## 目录
1. [NW.js 概述](#1-nwjs-概述)
2. [版本历史与兼容性](#2-版本历史与兼容性)
3. [技术架构](#3-技术架构)
4. [系统支持](#4-系统支持)
5. [打包与分发](#5-打包与分发)
6. [更新机制](#6-更新机制)
7. [关键特性](#7-关键特性)
8. [与 Electron 的核心差异](#8-与-electron-的核心差异)

---

## 1. NW.js 概述

NW.js（原名 node-webkit）是一个基于 Chromium 和 Node.js 的应用运行时，允许开发者使用 HTML5、CSS3、JavaScript 和 WebGL 构建跨平台桌面应用。项目由 Roger Wang（Intel 开源技术中心）于 2011 年创建，是最早将 Node.js 与浏览器引擎整合的桌面应用框架之一。

**核心哲学**：NW.js 的核心设计理念是"Node.js 和 Blink 运行在同一线程，对象位于同一堆（heap）中，可以直接互相引用"。这与 Electron 的多进程隔离架构形成根本性区别。

**官网**：https://nwjs.io
**文档**：https://docs.nwjs.io
**GitHub**：https://github.com/nwjs/nw.js

---

## 2. 版本历史与兼容性

NW.js 的版本号遵循 `v0.MAJOR.MINOR` 的命名规则。每个主版本（minor version bump）通常对应一次 Chromium 稳定版升级。截至 2026 年 7 月，已发布 337+ 个版本。

### 2.1 最新稳定版本

**v0.112.0**（发布于 2026/05/24）
- Chromium 149.0.7827.29
- Node.js v26.1.0
- 改进：pointer lock 行为优化（ESC 不再自动结束 pointer lock）

### 2.2 完整版本对照表

| NW.js 版本 | Chromium | Node.js | 发布日期 | 关键特性 |
|-----------|----------|---------|---------|---------|
| v0.112.0 | 149 | v26.1.0 | 2026/05/24 | 最新稳定版 |
| v0.111.3 | 148 | v26.1.0 | 2026/05/17 | |
| v0.111.0 | 148 | v25.9.0 | 2026/04/23 | |
| v0.110.0 | 147 | v25.8.2 | 2026/03/25 | |
| v0.109.0 | 146 | v25.6.1 | 2026/03/03 | |
| v0.108.0 | 145 | - | 2026/02/15 | |
| v0.107.0 | 144 | - | 2026/01/11 | |
| v0.106.0 | 143 | v25.1.0 | 2025/11/23 | **Win ARM64**, Node.js v25 |
| v0.105.0 | 142 | - | 2025/10/24 | |
| v0.104.0 | 141 | v24.9.0 | 2025/09/30 | |
| v0.103.0 | 140 | v24.7.0 | 2025/08/28 | |
| v0.102.0 | 139 | v24.5.0 | 2025/07/31 | |
| v0.101.0 | 138 | v24.3.0 | 2025/06~ | |
| v0.100.0 | 137 | v24.1.0 | 2025/05~ | |
| v0.99.0 | 136 | v23.11.0 | 2025/04~ | |
| v0.98.2 | 135 | v23.10.0 | 2025/04/17 | **ESM 支持** (Node context) |
| v0.98.0 | 135 | - | 2025/04~ | |
| v0.97.0 | 134 | - | 2025/03~ | |
| v0.96.0 | 133 | - | 2025/02~ | |
| v0.95.0 | 132 | - | 2025/01~ | |
| v0.94.0 | 131 | v23.x | 2024/12~ | Node.js v23 |
| v0.93.0 | 130 | - | 2024/11~ | |
| v0.92.0 | 129 | v22.7.0 | 2024/10~ | |
| v0.91.0 | 128 | - | 2024/09~ | |
| v0.90.0 | 127 | - | 2024/08~ | |
| v0.89.0 | 126 | - | 2024/07~ | |
| v0.88.0 | 125 | v22.x | 2024/06~ | Node.js v22 |
| v0.87.0 | 124 | - | 2024/05~ | |
| v0.86.0 | 123 | - | 2024/04~ | |
| v0.85.0 | 122 | - | 2024/03~ | |
| v0.84.0 | 121 | - | 2024/02~ | |
| v0.83.0 | 120 | v21.1.0 | 2024/01~ | |
| v0.82.0 | 119 | - | 2023/12~ | |
| v0.81.0 | 118 | v20.7.0 | 2023/11~ | |
| v0.80.0 | 117 | v20.x | 2023/09/15 | |
| v0.79.0 | 116 | v20.5.1 | 2023/08~ | |
| v0.78.0 | 115 | v20.2.0 | 2023/07~ | |
| v0.77.0 | 114 | v20.x | 2023/06/05 | **macOS ARM64 支持** |
| v0.76.0 | 113 | v20.1.0 | 2023/05~ | |
| v0.75.0 | 112 | v19.8.1 | 2023/04~ | |
| v0.74.0 | 111 | v19.7.0 | 2023/03~ | |
| v0.73.0 | 110 | v19.x | 2023/02~ | |
| v0.72.0 | 109 | - | 2023/01~ | |
| v0.71.0 | 108 | v19.3.0 | 2022/12~ | |
| v0.70.0 | 107 | v19.0.0 | 2022/10~ | |
| v0.69.0 | 106 | v18.9.1 | 2022/09~ | |
| v0.68.0 | 105 | v18.8.0 | 2022/08~ | |
| v0.67.0 | 104 | v18.7.0 | 2022/07~ | |
| v0.66.0 | 103 | v18.4.0 | 2022/06~ | |
| v0.65.0 | 102 | v18.3.0 | 2022/05~ | |
| v0.64.0 | 101 | v18.0.0 | 2022/04~ | |
| v0.63.0 | 100 | v17.8.0 | 2022/03~ | **Chromium 100** |
| v0.62.0 | 99 | v17.7.1 | 2022/02~ | |
| v0.61.0 | 98 | - | 2022/01~ | |
| v0.60.0 | 97 | - | 2022/01/05 | |
| v0.59.0 | 96 | v17.1.0 | 2021/12~ | |
| v0.58.0 | 95 | - | 2021/11~ | |
| v0.57.0 | 94 | v16.10.0 | 2021/10~ | |
| v0.56.0 | 93 | v16.9.1 | 2021/09~ | |
| v0.55.0 | 92 | - | 2021/08~ | |
| v0.54.0 | 91 | v16.4.0 | 2021/06~ | |
| v0.53.0 | 90 | v15.14.0 | 2021/04~ | |
| v0.52.0 | 89 | v15.10.0 | 2021/03~ | |
| v0.51.0 | 88 | v15.8.0 | 2021/02~ | |
| v0.50.0 | 87 | v15.3.0 | 2020/11/19 | **Wayland 支持** |
| v0.49.0 | 86 | v15.0.1 | 2020/10~ | |
| v0.48.0 | 85 | v14.9.0 | 2020/08~ | |
| v0.47.0 | 84 | v14.5.0 | 2020/07~ | |
| v0.46.0 | 83 | v14.2.0 | 2020/05~ | |
| v0.45.0 | 81 | v14.0.0 | 2020/04~ | Node.js v14 |
| v0.44.0 | 80 | v13.8.0 | 2020/02~ | |
| v0.43.0 | 79 | v13.3.0 | 2019/12~ | |
| v0.42.4 | 78 | v13.x | 2019/11/13 | **NW2 模式成为默认** |
| v0.42.0 | 78 | v13.0.1 | 2019/10~ | |
| v0.41.0 | 77 | v12.12.0 | 2019/09~ | |
| v0.40.0 | 76 | v12.8.0 | 2019/07/30 | |
| v0.39.0 | 75 | v12.4.0 | 2019/06~ | |
| v0.38.0 | 74 | v12.0.0 | 2019/04~ | Node.js v12 |
| v0.37.0 | 73 | v11.12.0 | 2019/03~ | |
| v0.36.0 | 72 | v11.8.0 | 2019/01~ | |
| v0.35.0 | 71 | v11.3.0 | 2018/12~ | |
| v0.34.0 | 70 | v11.0.0 | 2018/11~ | |
| v0.33.0 | 69 | v10.10.0 | 2018/09~ | AV1 解码器, OffscreenCanvas |
| v0.32.0 | 68 | v10.8.0 | 2018/07~ | |
| v0.31.0 | 67 | v10.4.0 | 2018/05~ | |
| v0.30.0 | 66 | v10.0.0 | 2018/04/18 | Node.js v10 |
| v0.29.0 | 65 | v9.8.0 | 2018/03~ | |
| v0.28.0 | 64 | v9.4.0 | 2018/01~ | Spectre 缓解 |
| v0.27.0 | 63 | v9.3.0 | 2017/12~ | |
| v0.26.0 | 62 | v8.7.0 | 2017/10~ | |
| v0.25.0 | 61 | v8.5.0 | 2017/09~ | |
| v0.24.0 | 60 | v8.2.1 | 2017/08~ | |
| v0.23.0 | 59 | v8.0.0 | 2017/06~ | Node.js v8 |
| v0.22.0 | 58 | v7.10.0 | 2017/04~ | MP3 解码器 |
| v0.21.0 | 57 | v7.7.2 | 2017/03~ | WebView Cookie API |
| v0.20.0 | 56 | v7.6.0 | 2017/01/26 | WebAssembly 预览 |
| v0.19.0 | 55 | v7.2.1 | 2016/12~ | async/await 函数 |
| v0.18.0 | 54 | v6.8.0 | 2016/10~ | Node.js 在 Web Workers 中工作 |
| v0.17.0 | 53 | v6.5.0 | 2016/09~ | |
| v0.16.0 | 52 | v6.3.0 | 2016/07~ | |
| v0.15.0 | 51 | v6.2.0 | 2016/05~ | Node.js v6 |
| **v0.14.x** | **50** | **v5.x** | 2016/05/06 | **LTS 版本**（支持 Win XP, OSX < 10.9） |
| **v0.13.0** | **49** | **5.9.0** | 2016/03/23 | **架构重构里程碑** |
| v0.12.3 | ~41 | ~0.12.x | 2015/12~ | 旧架构最后版本 |

### 2.3 关键 Breaking Changes

#### v0.13.0 架构重构（2016/03/23）—— 最重要的 Breaking Change

这是 NW.js 历史上最大的架构变更：

1. **API 命名空间变更**：所有 API 从 `nw.gui` 库迁移到 `nw` 对象。旧代码 `require('nw.gui')` 不再可用，需要通过内置 shim 脚本兼容。

2. **架构变更**：从旧的 node-webkit 架构切换到新的 Chromium Content API 架构，使得大部分 Chromium 浏览器特性得以启用，包括：
   - Chrome Apps 支持
   - chrome.* 平台 API
   - NaCl 和 Pepper 插件
   - 内置 PDF 查看器
   - 打印预览
   - 富通知

3. **构建风味（Build Flavors）变更**：引入 Normal、SDK、NaCl 三种构建。v0.14 起 NaCl 构建因低使用率被移除。

4. **更快的发布周期**：目标是在每次 Chromium 稳定版发布后不久就发布新的 NW.js 主版本（约每 6 周）。

#### v0.14.x LTS（2016/05/06）

- Chromium 固定在 50，Node.js 固定在 v5.x
- 计划活跃开发至少 1 年，之后维护 1 年
- 最后一个支持 Windows XP 和 Mac OS X < 10.9 的版本

#### v0.42.4 NW2 模式（2019/11/13）

- **NW2 成为默认模式**：这是项目另一次关键重构，完成了大量内部重构以提供更多特性和更好的质量
- 修复了窗口图标、维度等问题
- 修复了 Node frame 跨域访问问题

#### v0.50.0 Wayland 支持（2020/11/19）

- Linux 平台添加 Wayland 显示服务器支持
- 通过 `--enable-features=UseOzonePlatform --ozone-platform=wayland` 启用

#### v0.77.0 macOS ARM64 支持（2023/06/05）

- macOS 平台开始支持 Apple Silicon (ARM64) 原生二进制

#### v0.98.2 ESM 支持（2025/04/17）

- Node context 中支持 ECMAScript 模块（ESM）
- 通过 `--enable-features=NWESM` 启用
- 支持 `NWChainImportNode` 和 `NWChainImportDom` 标志，允许在 DOM context 中直接加载 Node ESM 模块

#### v0.106.0 Windows ARM64 支持（2025/11/23）

- Windows 平台开始支持 ARM64 架构
- Node.js 升级到 v25

### 2.4 版本命名规则

NW.js 使用 `v0.MAJOR.MINOR` 命名：
- `MAJOR`：每次 Chromium 稳定版升级时递增
- `MINOR`：同一 Chromium 版本内的补丁和 Node.js 更新

从 v0.13 到 v0.112，NW.js 严格遵循了"每个 Chromium 主版本对应一个 NW.js 主版本"的策略，使 Chromium 版本号可以通过 `NW.js 版本 + 37 = Chromium 版本` 粗略估算（从 v0.13/Chromium 49 开始，v0.112/Chromium 149 = 112 + 37 = 149，完全吻合）。

---

## 3. 技术架构

### 3.1 核心设计：共享上下文 vs 多进程

NW.js 与 Electron 最根本的架构差异在于 JavaScript 上下文的处理方式。

```
┌─────────────────────────────────────────────────────────┐
│                    NW.js 架构                            │
├─────────────────────────────────────────────────────────┤
│  Chromium (Blink 渲染引擎)    │    Node.js (V8 运行时)   │
│  ┌─────────────────────┐     │  ┌───────────────────┐   │
│  │   Browser Context   │◄───►│  │   Node Context    │   │
│  │  (DOM / window)     │     │  │  (require / fs)   │   │
│  │  Shared Heap        │     │  │  Shared Heap      │   │
│  └─────────────────────┘     │  └───────────────────┘   │
├─────────────────────────────────────────────────────────┤
│            同一线程 | 同一 V8 堆 | 同一消息循环            │
└─────────────────────────────────────────────────────────┘
```

**关键特征**：
- Node.js 和 Chromium 的 Blink 引擎运行在**同一线程**
- JavaScript 对象位于**同一堆（heap）**中，可以直接互相引用
- 共享同一个消息循环（event loop）
- 这意味着可以从 DOM 直接调用 `require('fs')` 等 Node.js 模块

### 3.2 JavaScript 上下文机制

NW.js 提供两种 JavaScript 上下文模式：

#### 3.2.1 独立上下文模式（Separate Context Mode，默认）

这是 NW.js 的传统默认模式。Browser 上下文和 Node 上下文是分离的，但可以通过特定方式互相访问：

**Browser Context（浏览器上下文）**：
- 通过 HTML `<script>` 标签加载的脚本在此运行
- 全局对象是 `window`
- 可访问所有 DOM API
- 使用 `nw.Window.get().evalNWBin()` 加载编译后的 JS
- 相对路径基于 HTML 文件位置解析

**Node Context（Node 上下文）**：
- 通过 `require()` 加载的模块在此运行
- 全局对象是 `global`（不是 `window`）
- `window` 对象不可隐式访问，必须显式传递
- `__dirname` 可用于获取当前文件目录
- `console.log()` 输出重定向到 DevTools 控制台
- 相对路径基于模块文件位置解析

**跨上下文访问**：
- 从 Browser Context 访问 Node API：直接使用 `require()`
- 从 Node Context 访问 Browser API：需要显式传递 `window` 对象
- `Worker` 和 `WebSocket` 等浏览器特性在 Node Context 中不可用

**跨上下文类型检查问题**：
由于两个上下文有不同的全局对象，`instanceof` 检查会失败。例如：
- `someValue instanceof Array` 对跨上下文数组返回 false
- `obj.constructor === Array` 同样失败
- 解决方案：使用 `Array.isArray()` 或通过 `nwglobal` 模块访问另一上下文的构造函数

#### 3.2.2 混合上下文模式（Mixed Context Mode）

在混合模式下，Browser 和 Node 上下文合并为一个，所有脚本共享同一个全局对象。这简化了开发但可能带来安全风险（Node API 暴露在 DOM 中）。

### 3.3 与 Electron 架构的核心差异

| 维度 | NW.js | Electron |
|------|-------|----------|
| **进程模型** | 单进程（共享堆） | 多进程（Main + Renderer） |
| **Node.js 集成** | 直接修改 Chromium 源码，Node 和 Blink 在同一线程 | 通过独立的 Main 进程运行 Node.js |
| **JavaScript 上下文** | Browser 和 Node 共享同一 V8 堆，可直接引用 | 完全隔离，需通过 IPC 通信 |
| **从 Renderer 使用 Node** | 直接在 DOM 中 `require('fs')` | 需要通过 preload 脚本或 IPC |
| **安全性** | 较低（默认暴露 Node API 到 DOM） | 较高（默认隔离，contextIsolation） |
| **Chromium 更新** | 紧密跟随，每个主版本对应一个 Chromium 版本 | 有选择地跟随 |
| **入口点** | HTML 文件（`package.json` 的 `main` 字段） | JavaScript 文件（Main 进程入口） |
| **包大小** | 通常较小（共享库） | 通常较大（独立的 Electron 框架） |
| **原生模块重建** | 使用 `nw-gyp` 或 `node-pre-gyp` | 使用 `electron-rebuild` |
| **Chrome 应用 API** | 支持 chrome.* API | 不支持 |
| **NaCl/Pepper** | SDK 构建支持 | 不支持 |
| **PDF 查看器** | 内置支持 | 需额外配置 |
| **构建风味** | Normal（无 DevTools）和 SDK（含 DevTools） | 单一构建 |

### 3.4 NW2 模式（v0.42.4 起默认）

NW2 是 NW.js 的另一个关键架构改进，主要内部重构包括：
- 改进的窗口管理实现
- 更好的跨域处理
- Node frame 的跨域访问修复
- 更稳定的 Web Worker 生命周期管理

---

## 4. 系统支持

### 4.1 当前支持（v0.112.0）

| 平台 | x64 (64-bit) | ia32 (32-bit) | ARM64 |
|------|-------------|---------------|-------|
| **Windows** | 支持 | 支持 | 支持（v0.106.0 起） |
| **macOS** | 支持 (Intel) | 不支持 | 支持 (Apple Silicon, v0.77.0 起) |
| **Linux** | 支持 | **不支持**（已在较早版本中移除） | 不支持 |

### 4.2 Windows 支持详情

- **Windows 10/11**：完全支持
- **Windows 7/8**：需要较旧版本的 NW.js。Windows 7 在较新的 Chromium 版本中已不再支持
- **Windows XP**：仅 v0.14.x LTS 及更早版本支持
- **Windows ARM64**：v0.106.0（2025/11/23）起支持
- 需要 DirectX 运行时（`D3DCompiler_43.dll` 和 `d3dx9_43.dll`）以确保 WebGL 兼容性

### 4.3 macOS 支持详情

- **Intel Mac (x64)**：完全支持
- **Apple Silicon (ARM64)**：v0.77.0（2023/06/05）起原生支持
- **Mac OS X < 10.9**：仅 v0.14.x LTS 及更早版本支持
- **Mac App Store**：v0.12.3 起通过 `macappstore` 构建风味支持

### 4.4 Linux 支持详情

- **x64**：完全支持
- **Wayland**：v0.50.0（2020/11/19）起支持，通过 Ozone 平台
- **32-bit**：已在较新版本中移除
- 需要 `libudev.so.0`（较旧发行版可能需要符号链接）
- 媒体功能需要 `libffmpegsumo.so`

### 4.5 构建风味

每个平台提供两种构建：

1. **Normal Build**：
   - 不含 DevTools
   - 体积较小
   - 适合生产分发

2. **SDK Build**：
   - 包含 Chrome DevTools（F12 或 Cmd-Alt-I 打开）
   - 包含 NaCl 支持
   - 包含更多开发工具
   - 适合开发和调试

---

## 5. 打包与分发

### 5.1 基本打包方式

#### 方式一：直接文件分发（推荐）

将应用文件与 NW.js 可执行文件放在同一目录：
```
myapp/
├── nw.exe (或 nw)
├── nw.pak
├── icudtl.dat
├── package.json
├── index.html
└── node_modules/
```

#### 方式二：Zip 打包

将应用文件打包为 `package.nw`（实际为 ZIP 格式）：
```bash
# Linux/macOS
cd myapp && zip -r ../package.nw *

# Windows: 创建 ZIP 文件后重命名为 .nw
```

将 `package.nw` 放在 NW.js 可执行文件同目录下。

#### 方式三：合并为单一可执行文件

**Windows**：
```cmd
copy /b nw.exe+package.nw app.exe
```
注意：`nw.pak` 和 DLL 文件仍需一起分发。

**Linux**：
```bash
cat /usr/bin/nw app.nw > app && chmod +x app
```

**macOS**：
将应用内容放入 `nwjs.app/Contents/Resources/app.nw`，修改 `Info.plist` 和图标。

### 5.2 第三方打包工具

| 工具 | 说明 |
|------|------|
| **nw-builder** | 官方推荐的构建工具，支持跨平台构建，自动下载 NW.js 二进制文件 |
| **nwjs-builder-phoenix** | 功能更丰富的构建工具，支持更多自定义选项 |
| **grunt-nw-builder** | Grunt 插件版本 |
| **Web2Executable** | 跨平台 GUI 打包工具，使用 PySide，适合非命令行用户 |
| **nodebob** | Windows 环境下的构建工具（批处理脚本） |
| **nwjs-shell-builder** | Shell 脚本构建器，可集成到构建流程中 |
| **Nuwk!** | macOS 应用创建工具（alpha 阶段） |
| **generator-node-webkit** | Yeoman 生成器 |
| **Enigma Virtual Box** | 将 exe + dll + pak 合并为单一可执行文件的第三方工具 |
| **Inno Setup** | 创建 Windows 安装程序 |

### 5.3 代码保护

#### V8 快照（nwjc）

NW.js 提供将 JavaScript 编译为 V8 原生代码（快照）的功能，使用 `nwjc` 工具：

```bash
# 编译 JS 为原生代码
nwjc source.js binary.bin
```

加载编译后的代码：
```javascript
// 在 Browser Context 中加载
nw.Window.get().evalNWBin(null, 'binary.bin');
```

**注意事项**：
- v0.4.2 引入，v0.8.x 有安全漏洞（v0.9.x 修复）
- 旧版 `nwsnapshot` 工具已在 v0.12.0-rc1 后废弃
- v0.22 修复了编译代码比普通 JS 慢 30% 的性能问题
- 编译后的代码**不跨平台**，也不跨 NW.js 版本兼容
- 需要为每个目标平台分别编译
- 闭包写法需要调整（不能使用 IIFE）
- 可以加载远程编译的 JS

#### 其他保护方式

- 代码混淆（UglifyJS、Terser 等）
- 将敏感逻辑放在 Node.js 原生模块中（C++ addon）
- 使用 `nwjc` 的 V8 快照作为主要保护手段

### 5.4 必须分发的文件

**Windows**：
- `nw.exe`（或合并后的 `app.exe`）
- `nw.pak`（JavaScript 库文件）
- `icudtl.dat`（国际化数据，v0.10.0 起需要）
- `ffmpegsumo.dll`（媒体支持）
- `libEGL.dll` 和 `libGLESv2.dll`（WebGL/GPU 加速）
- Node.js 原生模块（`.node` 文件）

**Linux**：
- `nw` 可执行文件
- `nw.pak`
- `icudtl.dat`
- `libffmpegsumo.so`（媒体支持）

**macOS**：
- `nwjs.app` 完整包
- 自定义 `Info.plist` 和图标

---

## 6. 更新机制

### 6.1 内置支持

NW.js **没有内置的自动更新机制**。官方文档仅列出了社区维护的第三方解决方案。

### 6.2 第三方更新方案

| 方案 | 说明 |
|------|------|
| **node-webkit-updater** | 早期社区方案，为 node-webkit 设计的更新器 |
| **nwjs-autoupdater** | NW.js 专用的自动更新模块 |
| **nw-autoupdater** | 另一个 NW.js 自动更新工具 |
| **Squirrel.Windows** | 可用于 Windows 平台的更新框架 |
| **Electron-updater 思路** | 可参考类似模式：检查更新服务器 -> 下载新版本 -> 替换文件 -> 重启应用 |

### 6.3 自定义更新实现

开发者通常自行实现更新逻辑：
1. 在服务器上维护最新版本信息（JSON 文件）
2. 应用启动时检查版本号
3. 下载新的 `.nw` 包或完整二进制文件
4. 替换旧文件并重启应用

**实现示例**：
```javascript
// 概念示例
const http = require('http');
const fs = require('fs');
const currentVersion = require('./package.json').version;

http.get('http://updates.example.com/latest.json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const update = JSON.parse(data);
        if (update.version !== currentVersion) {
            // 下载并应用更新
            downloadUpdate(update.url);
        }
    });
});
```

---

## 7. 关键特性

### 7.1 原生 UI API

NW.js 提供丰富的原生 UI API：

- **Window API**：窗口创建、大小控制、全屏、最小化/最大化、置顶、透明窗口、无边框窗口、Kiosk 模式
- **Menu API**：原生菜单栏、上下文菜单、系统托盘菜单
- **Tray API**：系统托盘图标和菜单（v0.12.3 修复了 High-DPI 显示问题）
- **Clipboard API**：系统剪贴板操作，支持多种数据类型
- **Shell API**：打开文件/URL、显示文件在资源管理器中
- **Screen API**：屏幕信息、桌面捕获监控
- **Print API**：自定义打印选项（v0.20.0 添加 copies 选项）
- **File Dialogs**：原生文件选择对话框
- **Shortcut API**：全局快捷键（v0.13 变更）

### 7.2 Node.js 集成深度

- **DOM 中直接使用 Node.js**：在 HTML 的 `<script>` 标签中直接调用 `require('fs')`、`require('path')` 等
- **Web Workers 中的 Node.js**：v0.18.4 起支持在 Web Workers 中使用 Node.js API
- **Node.js 原生模块**：通过 `nw-gyp` 或 `node-pre-gyp` 编译，使用 `npm install` 安装
- **ESM 支持**：v0.98.2 起通过 `--enable-features=NWESM` 在 Node context 中支持 ESM
- **完整的 Node.js API**：支持所有 Node.js 核心模块和第三方模块

### 7.3 Chrome DevTools 支持

- **SDK Build** 包含完整的 Chrome DevTools
- 通过 F12（Windows/Linux）或 Cmd-Alt-I（macOS）打开
- 支持所有标准 DevTools 功能：Elements、Console、Sources、Network、Performance、Memory 等
- Normal Build 不包含 DevTools，适合生产环境

### 7.4 插件支持

- **NaCl (Native Client)**：SDK 构建支持。v0.13 引入，v0.14 起 NaCl 构建风味因低使用率被移除，但 SDK 构建仍保留 NaCl 支持
- **Pepper Plugin API (PPAPI)**：v0.13 架构重构后支持，包括 Flash 插件
- **NPAPI 插件**：旧版（v0.12 及之前）支持，通过 `plugins` 目录加载

### 7.5 PDF 支持

- **内置 PDF 查看器**：v0.13 架构重构后，Chromium 的内置 PDF 查看器可以正常使用
- 可直接在应用中嵌入 PDF 查看

### 7.6 其他特性

- **WebGL 支持**：通过 `libEGL.dll` 和 `libGLESv2.dll` 提供 GPU 加速
- **透明窗口**：支持透明和无边框窗口
- **Kiosk 模式**：全屏锁定模式
- **Chrome Apps API**：v0.13 起支持 chrome.* 平台 API
- **WebAssembly**：v0.20.0（Chromium 56）起支持
- **AV1 视频解码**：v0.33.0（Chromium 69）起支持
- **OffscreenCanvas**：v0.33.0（Chromium 69）起支持
- **Web Bluetooth**：v0.20.0（Chromium 56）起支持
- **Async Clipboard API**：v0.30.0（Chromium 66）起支持
- **CSS Grid Subgrid**：v0.80.0（Chromium 117）起支持
- **WebTransport**：v0.60.0（Chromium 97）起支持
- **Wayland 支持**：v0.50.0 起 Linux 平台支持 Wayland
- **CSS gap decorations**：v0.112.0（Chromium 149）起支持
- **Pointer Lock 改进**：v0.112.0 中 ESC 不再自动结束 pointer lock
- **Widevine DRM**：v0.50.1 起支持

### 7.7 ChromeDriver 测试支持

NW.js 支持通过 ChromeDriver 进行自动化测试：
```javascript
// 可以像测试 Chrome 一样测试 NW.js 应用
```

---

## 8. 与 Electron 的核心差异

### 8.1 架构哲学

| 方面 | NW.js | Electron |
|------|-------|----------|
| **设计理念** | "Node 和 Blink 是平等的伙伴，共享一切" | "Main 进程管理一切，Renderer 进程被严格隔离" |
| **进程数** | 单一主进程 | Main 进程 + 每个窗口一个 Renderer 进程 |
| **安全性模型** | 默认开放（Node 暴露在 DOM） | 默认安全（contextIsolation, preload 沙箱） |
| **学习曲线** | 更简单（像写网页一样写应用） | 更陡（需要理解进程模型和 IPC） |
| **性能** | 单进程共享内存，对象传递零开销 | 多进程隔离，IPC 通信有序列化开销 |

### 8.2 何时选择 NW.js

- 需要直接从 DOM 访问 Node.js API
- 需要 Chrome Apps API 支持
- 需要 NaCl/Pepper 插件支持
- 应用不需要严格的安全隔离
- 希望更简单的开发模型（无需理解 IPC）
- 需要更紧密的 Chromium 版本跟随
- 需要内置 PDF 查看器
- 移植旧版 node-webkit 应用

### 8.3 何时选择 Electron

- 需要严格的安全模型（contextIsolation）
- 需要多进程架构的优势
- 需要更大的社区和生态系统
- 需要自动更新（Electron 有内置的 autoUpdater）
- 需要更丰富的官方工具链（electron-builder, electron-forge）
- 应用有复杂的安全需求
- 需要更好的原生模块支持

---

## 参考资料

- NW.js 官网：https://nwjs.io
- NW.js 文档：https://docs.nwjs.io
- NW.js GitHub：https://github.com/nwjs/nw.js
- NW.js Wiki：https://github.com/nwjs/nw.js/wiki
- NW.js 下载：https://dl.nwjs.io
- NW.js 博客：https://nwjs.io/blog/
- NW.js 邮件列表：https://groups.google.com/g/nwjs-general
- NW.js Discord：https://discord.gg/tyx267vKRH
- NW.js Gitter：https://gitter.im/nwjs/nw.js

---

*文档生成日期：2026/07/01*
*NW.js 最新稳定版：v0.112.0 (Chromium 149, Node.js v26.1.0)*
