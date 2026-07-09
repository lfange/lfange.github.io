# NW.js 与 Electron 深度对比分析：版本兼容性、技术架构、系统支持、打包发布与更新机制

> 本文档生成日期：2026/07/01
> 分析基于最新稳定版本：NW.js v0.112.0、Electron v32.x

---

## 目录

1. [概述](#1-概述)
2. [版本兼容性分析](#2-版本兼容性分析)
3. [技术架构深度对比](#3-技术架构深度对比)
4. [系统支持情况详解](#4-系统支持情况详解)
5. [打包发布详细对比](#5-打包发布详细对比)
6. [版本更新机制对比](#6-版本更新机制对比)
7. [生态系统与工具链](#7-生态系统与工具链)
8. [实际应用场景与选择指南](#8-实际应用场景与选择指南)
9. [参考资料](#9-参考资料)

---

## 1. 概述

### 1.1 项目简介

| 维度 | NW.js | Electron |
|------|-------|----------|
| **原名** | node-webkit | - |
| **创建者** | Roger Wang (Intel) | GitHub |
| **创建时间** | 2011年 | 2013年（Atom编辑器） |
| **核心哲学** | "Node 和 Blink 是平等的伙伴，共享一切" | "Main 进程管理一切，Renderer 进程被严格隔离" |
| **设计目标** | 直接的 Node.js + Blink 集成，开发简单 | 安全优先的多进程架构，稳定可靠 |

### 1.2 当前最新版本

| 组件 | NW.js v0.112.0 | Electron v32.x |
|------|-----------------|----------------|
| **Chromium** | 149 | 128 |
| **Node.js** | v26.1.0 | v20.16.0 |
| **发布日期** | 2026/05/24 | 2026 年中 |
| **V8 引擎** | 与 Chromium 149 对应 | 12.8 |

### 1.3 核心差异速览

| 维度 | NW.js | Electron |
|------|-------|----------|
| **进程模型** | 单进程（共享堆） | 多进程（Main + Renderer） |
| **Node 集成方式** | 直接修改 Chromium 源码，Node 和 Blink 在同一线程 | 独立 Main 进程运行 Node.js |
| **JavaScript 上下文** | Browser 和 Node 共享同一 V8 堆，可直接引用 | 完全隔离，需通过 IPC 通信 |
| **从 Renderer 使用 Node** | 直接在 DOM 中 `require('fs')` | 需要通过 preload 脚本或 IPC |
| **安全性模型** | 默认开放（Node 暴露在 DOM） | 默认安全（contextIsolation, preload 沙箱） |
| **学习曲线** | 更简单（像写网页一样写应用） | 更陡（需要理解进程模型和 IPC） |
| **性能** | 单进程共享内存，对象传递零开销 | 多进程隔离，IPC 通信有序列化开销 |

---

## 2. 版本兼容性分析

### 2.1 NW.js 版本历史与兼容性

NW.js 版本号遵循 `v0.MAJOR.MINOR` 命名规则。每个主版本通常对应一次 Chromium 稳定版升级。

#### 2.1.1 完整版本对照表（近期）

| NW.js 版本 | Chromium | Node.js | 发布日期 | 关键特性 |
|-----------|----------|---------|---------|---------|
| **v0.112.0** | 149 | v26.1.0 | 2026/05/24 | pointer lock 优化 |
| v0.111.3 | 148 | v26.1.0 | 2026/05/17 | |
| v0.111.0 | 148 | v25.9.0 | 2026/04/23 | |
| v0.110.0 | 147 | v25.8.2 | 2026/03/25 | |
| v0.109.0 | 146 | v25.6.1 | 2026/03/03 | |
| v0.108.0 | 145 | - | 2026/02/15 | |
| v0.107.0 | 144 | - | 2026/01/11 | |
| v0.106.0 | 143 | v25.1.0 | 2025/11/23 | **Win ARM64** |
| v0.105.0 | 142 | - | 2025/10/24 | |
| v0.104.0 | 141 | v24.9.0 | 2025/09/30 | |
| v0.103.0 | 140 | v24.7.0 | 2025/08/28 | |
| v0.102.0 | 139 | v24.5.0 | 2025/07/31 | |
| v0.101.0 | 138 | v24.3.0 | 2025/06~ | |
| v0.100.0 | 137 | v24.1.0 | 2025/05~ | |
| v0.99.0 | 136 | v23.11.0 | 2025/04~ | |
| v0.98.2 | 135 | v23.10.0 | 2025/04/17 | **ESM 支持** |
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
| v0.77.0 | 114 | v20.x | 2023/06/05 | **macOS ARM64** |
| v0.50.0 | 87 | v15.3.0 | 2020/11/19 | **Wayland 支持** |
| v0.42.4 | 78 | v13.x | 2019/11/13 | **NW2 默认** |
| v0.14.x | 50 | v5.x | 2016/05/06 | **LTS，Win XP 支持** |
| v0.13.0 | 49 | 5.9.0 | 2016/03/23 | **架构重构** |

#### 2.1.2 关键 Breaking Changes

**1. v0.13.0 架构重构（2016/03/23）—— 最重要的变更**

- **API 命名空间变更**：所有 API 从 `nw.gui` 库迁移到 `nw` 对象
- **架构变更**：从旧的 node-webkit 架构切换到新的 Chromium Content API 架构
- **构建风味变更**：引入 Normal、SDK、NaCl 三种构建
- **更快的发布周期**：目标是每次 Chromium 稳定版发布后不久就发布新的 NW.js 主版本

**迁移注意事项**：
- 旧代码 `require('nw.gui')` 不再可用，需通过 shim 脚本兼容
- 建议直接使用新的 `nw` API

**2. v0.14.x LTS（2016/05/06）**

- Chromium 固定在 50，Node.js 固定在 v5.x
- 计划活跃开发至少 1 年，之后维护 1 年
- 最后一个支持 Windows XP 和 Mac OS X < 10.9 的版本

**3. v0.42.4 NW2 模式（2019/11/13）**

- NW2 成为默认模式
- 修复窗口图标、维度等问题
- 修复 Node frame 跨域访问问题
- 改进 Web Worker 生命周期管理

**4. v0.50.0 Wayland 支持（2020/11/19）**

- Linux 平台添加 Wayland 显示服务器支持
- 通过 `--enable-features=UseOzonePlatform --ozone-platform=wayland` 启用

**5. v0.77.0 macOS ARM64 支持（2023/06/05）**

- macOS 平台开始支持 Apple Silicon (ARM64) 原生二进制

**6. v0.98.2 ESM 支持（2025/04/17）**

- Node context 中支持 ECMAScript 模块（ESM）
- 通过 `--enable-features=NWESM` 启用
- 支持 `NWChainImportNode` 和 `NWChainImportDom` 标志

**7. v0.106.0 Windows ARM64 支持（2025/11/23）**

- Windows 平台开始支持 ARM64 架构

#### 2.1.3 版本命名规则

NW.js 使用 `v0.MAJOR.MINOR` 命名：
- `MAJOR`：每次 Chromium 稳定版升级时递增
- `MINOR`：同一 Chromium 版本内的补丁和 Node.js 更新

**有趣的规律**：从 v0.13/Chromium 49 开始，NW.js 版本号 + 37 = Chromium 版本号：
- v0.13 → 49 (13+37)
- v0.112 → 149 (112+37)，完全吻合！

#### 2.1.4 Chromium 版本更新策略

- **紧密跟随**：NW.js 严格跟随 Chromium 稳定版发布节奏
- **约每 6 周**：每次 Chromium 稳定版发布后不久就发布新的 NW.js 主版本
- **完整对应**：每个 NW.js 主版本对应一个 Chromium 主版本
- **安全补丁**：Chromium 的 Critical/High 安全补丁在 NW.js 小版本中跟进

### 2.2 Electron 版本历史与兼容性

#### 2.2.1 完整版本对照表（近期）

| Electron 版本 | Chromium | Node.js | V8 | 发布日期 | 关键特性 |
|--------------|----------|---------|----|---------|---------|
| **v32.x** | 128 | v20.16.0 | 12.8 | 2026年中 | |
| v31.x | 126 | v20.14.0 | 12.6 | 2026年初 | |
| v30.x | 124 | v20.11.0 | 12.4 | 2025年底 | |
| v29.x | 122 | v20.11.0 | 12.2 | 2025年中 | |
| v28.x | 120 | v18.18.0 | 12.0 | 2025年初 | |
| v27.x | 118 | v18.17.0 | 11.8 | 2024年中 | |
| v26.x | 116 | v18.16.0 | 11.6 | 2024年初 | |
| v25.x | 114 | v18.15.0 | 11.4 | 2023年中 | |
| v24.x | 112 | v18.14.0 | 11.2 | 2023年初 | |
| v23.x | 110 | v18.12.0 | 11.0 | 2022年中 | |
| v22.x | 108 | v16.17.0 | 10.8 | 2022年初 | |
| v21.x | 106 | v16.16.0 | 10.6 | 2021年中 | |
| v20.x | 104 | v16.15.0 | 10.4 | 2021年初 | |
| v19.x | 102 | v16.14.0 | 10.2 | 2021年中 | |
| v18.x | 100 | v16.13.0 | 10.0 | 2022年初 | **Chromium 100** |
| v17.x | 98 | v16.13.0 | 9.8 | 2021年底 | |
| v16.x | 96 | v16.9.0 | 9.6 | 2021年中 | |
| v15.x | 94 | v16.5.0 | 9.4 | 2021年初 | |
| v14.x | 92 | v14.17.0 | 9.2 | 2021年中 | |
| v13.x | 91 | v14.16.0 | 9.1 | 2021年初 | |
| v12.x | 89 | v14.16.0 | 8.9 | 2021年初 | |
| v11.x | 87 | v12.18.0 | 8.7 | 2020年底 | |
| v10.x | 85 | v12.16.0 | 8.5 | 2020年中 | |
| v9.x | 83 | v12.14.0 | 8.3 | 2020年初 | |
| v8.x | 80 | v12.13.0 | 8.0 | 2020年初 | |
| v7.x | 78 | v12.8.0 | 7.8 | 2019年底 | |
| v6.x | 76 | v12.4.0 | 7.6 | 2019年中 | |
| v5.x | 73 | v12.0.0 | 7.3 | 2019年初 | **nodeIntegration 默认 false** |
| v4.x | 69 | v10.11.0 | 6.9 | 2018年底 | |
| v3.x | 66 | v10.2.0 | 6.6 | 2018年中 | |
| v2.x | 61 | v8.9.0 | 6.1 | 2018年初 | |
| v1.x | 58 | v7.9.0 | 5.8 | 2017年中 | |

#### 2.2.2 关键 Breaking Changes

**1. Electron 5.0（2019年初）—— 最重要的安全变更**

- **nodeIntegration 默认 false**：渲染进程默认无法访问 Node.js API
- 引入 contextIsolation 选项（默认 false，Electron 12+ 默认 true）
- 这是 Electron 安全模型的重大转折点

**2. Electron 12.0（2021年初）—— 安全默认配置**

- **contextIsolation 默认 true**：JavaScript 上下文隔离默认启用
- 进一步强化了安全模型
- preload 脚本成为 Main-Renderer 通信的唯一桥梁

**3. Electron 14.0（2021年中）—— Remote 模块移除**

- 移除 `remote` 模块（之前已弃用）
- 强制使用 IPC 进行进程间通信
- 减少安全攻击面

**4. Electron 20.0（2022年初）—— 新的安全默认**

- `sandbox` 选项相关改进
- 更多安全特性默认启用

#### 2.2.3 版本命名规则

Electron 使用 `MAJOR.MINOR.PATCH` 语义化版本（SemVer）：
- `MAJOR`：重大变更，可能包含 Breaking Changes
- `MINOR`：新功能，向后兼容
- `PATCH`：bug 修复，向后兼容

从 v4.0 开始，Electron 采用与 Chromium 主版本号对应的策略：
- Electron vN → Chromium v(N+65) （大致）
- Electron v32 → Chromium 128 (32+96=128)

#### 2.2.4 Chromium 版本更新策略

- **有选择地跟随**：Electron 并不严格跟随每一个 Chromium 版本，而是有选择地升级
- **约每 12 周**：发布节奏比 NW.js 稍慢
- **注重稳定性**：在跟进 Chromium 的同时，更注重现有功能的稳定性
- **LTS 版本**：提供长期支持版本，适合企业应用

### 2.3 版本兼容性详细对比

| 维度 | NW.js | Electron |
|------|-------|----------|
| **版本号规则** | v0.MAJOR.MINOR | MAJOR.MINOR.PATCH (SemVer) |
| **Chromium 跟随策略** | 严格跟随，每个 Chromium 主版本对应一个 NW.js 主版本 | 有选择地跟随，不是每个 Chromium 版本都对应 |
| **Chromium 更新频率** | 约每 6 周（与 Chromium 同步） | 约每 12 周（较慢） |
| **Node.js 更新频率** | 每次 NW.js 主版本通常更新 Node.js | 每次 Electron 主版本通常更新 Node.js |
| **Chromium 版本差距** | 当前（2026/07）Chromium 149，非常新 | 当前 Chromium 128，落后约 21 个版本 |
| **Node.js 版本差距** | v26.1.0，非常新 | v20.16.0，落后约 6 个主版本 |
| **LTS 支持** | 有（v0.14.x 是最后一个官方 LTS） | 有官方 LTS 计划 |
| **Breaking Changes** | 重大架构变更较少（v0.13, v0.42 是例外） | 较频繁的安全相关 Breaking Changes |
| **向后兼容性** | 较好，API 相对稳定 | 一般，安全变更可能需要代码修改 |

### 2.4 原生模块兼容性

#### 2.4.1 NW.js 原生模块

- **构建工具**：`nw-gyp` 或 `node-pre-gyp`
- **版本匹配**：必须使用与目标 NW.js 版本对应的 Node.js 头文件
- **问题**：
  - 原生模块需要针对每个 NW.js 版本重新编译
  - 不同平台需要分别编译
  - `node-pre-gyp` 可用于预编译二进制分发

#### 2.4.2 Electron 原生模块

- **构建工具**：`electron-rebuild`、`@electron/rebuild`
- **版本匹配**：必须使用与 Electron 版本对应的 Node.js 头文件和 V8 版本
- **问题**：
  - 原生模块需要针对每个 Electron 版本重新编译
  - ABI 兼容性问题更常见
  - `electron-rebuild` 工具简化了重建过程
  - 预编译模块通常提供 Electron 版本支持

#### 2.4.3 原生模块兼容性对比

| 方面 | NW.js | Electron |
|------|-------|----------|
| **构建工具** | nw-gyp、node-pre-gyp | electron-rebuild、@electron/rebuild |
| **社区支持** | 较少 | 较多，更多预编译模块支持 Electron |
| **ABI 稳定性** | 一般 | 一般 |
| **重建复杂度** | 中等 | 中等 |
| **预编译分发** | node-pre-gyp | electron-builder 集成支持 |

---

## 3. 技术架构深度对比

### 3.1 进程模型对比

#### 3.1.1 NW.js 进程模型：单进程共享堆

```
┌─────────────────────────────────────────────────────────┐
│                    NW.js 进程（单一）                     │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐   │
│  │           Chromium (Blink + V8)                 │   │
│  │  ┌──────────────┐    ┌──────────────────┐    │   │
│  │  │   Browser    │◄──►│   Node Context   │    │   │
│  │  │   Context    │    │  (require / fs) │    │   │
│  │  │ (DOM / window)│    │  Shared Heap    │    │   │
│  │  └──────────────┘    └──────────────────┘    │   │
│  │  ┌─────────────────────────────────────────┐  │   │
│  │  │      同一 V8 堆 | 同一消息循环          │  │   │
│  │  └─────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**关键特征**：
- Node.js 和 Chromium 的 Blink 引擎运行在**同一线程**
- JavaScript 对象位于**同一堆（heap）**中，可以直接互相引用
- 共享同一个消息循环（event loop）
- 可以从 DOM 直接调用 `require('fs')` 等 Node.js 模块
- 进程数：通常只有 1-2 个主进程（GPU 进程可能独立）

**优点**：
- 开发简单：像写网页一样写应用，无需理解进程模型
- 性能好：对象传递零开销，无需序列化/反序列化
- 内存占用低：共享堆，无需复制数据

**缺点**：
- 安全性差：Node API 暴露在 DOM，XSS 直接等于 RCE
- 稳定性差：一个窗口崩溃可能导致整个应用崩溃
- 扩展性差：多窗口管理复杂

#### 3.1.2 Electron 进程模型：多进程隔离

```
┌─────────────────────────────────────────────────────────┐
│                  Main 进程（1 个）                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Node.js 运行时（完整权限）                      │   │
│  │  - 窗口管理                                     │   │
│  │  - IPC 处理 (ipcMain)                           │   │
│  │  - 原生 API 调用                                │   │
│  └─────────────────────────────────────────────────┘   │
└───────────────┬─────────────────────────────────────────┘
                │ IPC (Mojo / ChannelMojo)
    ┌───────────┴──────────┬──────────────────┐
    ▼                      ▼                  ▼
┌──────────┐         ┌──────────┐      ┌──────────┐
│Renderer 1│         │Renderer 2│      │Renderer N│
│(沙箱)    │         │(沙箱)    │      │(沙箱)    │
│- Chromium│         │- Chromium│      │- Chromium│
│- DOM/CSS │         │- DOM/CSS │      │- DOM/CSS │
│- Preload │         │- Preload │      │- Preload │
│- contextIsolation │  │- contextIsolation│      │
└──────────┘         └──────────┘      └──────────┘
    │                      │                  │
    └───────────┬──────────┴──────────────────┘
                ▼
         ┌──────────┐
         │ GPU 进程  │
         └──────────┘
```

**关键特征**：
- **Main 进程**：唯一有权限访问 Node.js 的进程，不加载网页内容
- **Renderer 进程**：每个 BrowserWindow 一个，运行在沙箱中，默认无 Node 访问权限
- **Preload 脚本**：在渲染进程加载网页前运行，有权访问 Node.js，但在独立上下文中
- **contextIsolation**：Preload 和网页运行在不同 JavaScript 世界（Electron 12+ 默认 true）
- **sandbox**：可选，启用 Chromium OS 级沙箱
- 进程数：1 Main + N Renderers + GPU + 其他辅助进程

**优点**：
- 安全性好：渲染进程被隔离，XSS 无法直接访问 Node.js
- 稳定性好：一个窗口崩溃不影响其他窗口和主进程
- 可扩展：多窗口管理简单

**缺点**：
- 开发复杂：需要理解进程模型和 IPC
- 性能开销：IPC 通信有序列化/反序列化开销
- 内存占用高：每个渲染进程独立

#### 3.1.3 进程模型对比总结

| 维度 | NW.js | Electron |
|------|-------|----------|
| **进程数** | 1-2 个 | 3+N 个（Main + N Renderers + GPU + ...） |
| **Node 运行位置** | 与 Blink 在同一线程/进程 | 独立的 Main 进程 |
| **Renderer 隔离** | 无（共享进程） | 完全隔离（每个 Renderer 独立进程） |
| **崩溃隔离** | 差（单窗口崩溃可能影响全局） | 好（单窗口崩溃不影响其他） |
| **内存占用** | 低（共享堆） | 高（每个 Renderer 独立） |
| **开发复杂度** | 低（无需理解进程模型） | 高（需要理解 IPC） |
| **性能（对象传递）** | 好（零开销） | 一般（需要序列化） |

### 3.2 JavaScript 上下文机制对比

#### 3.2.1 NW.js JavaScript 上下文

NW.js 提供两种 JavaScript 上下文模式：

**1. 独立上下文模式（Separate Context Mode，默认）**

Browser Context（浏览器上下文）：
- 通过 HTML `<script>` 标签加载的脚本在此运行
- 全局对象是 `window`
- 可访问所有 DOM API
- 相对路径基于 HTML 文件位置解析

Node Context（Node 上下文）：
- 通过 `require()` 加载的模块在此运行
- 全局对象是 `global`（不是 `window`）
- `window` 对象不可隐式访问，必须显式传递
- `__dirname` 可用于获取当前文件目录
- 相对路径基于模块文件位置解析

**跨上下文访问**：
- 从 Browser Context 访问 Node API：直接使用 `require()`
- 从 Node Context 访问 Browser API：需要显式传递 `window` 对象
- **跨上下文类型检查问题**：`instanceof Array` 对跨上下文数组返回 false

**2. 混合上下文模式（Mixed Context Mode）**

- Browser 和 Node 上下文合并为一个
- 所有脚本共享同一个全局对象
- 简化开发但带来安全风险

#### 3.2.2 Electron JavaScript 上下文

Electron 采用严格隔离的上下文模型：

**1. Main 进程上下文**：
- 完整的 Node.js 环境
- 全局对象是 `global`
- 无 DOM 访问

**2. Renderer 进程 - Preload 上下文**：
- 有权限访问 Node.js（通过 `contextBridge`）
- 运行在独立的 JavaScript 世界（contextIsolation）
- 可以安全地暴露有限的 API 给网页

**3. Renderer 进程 - 网页上下文**：
- 普通的 Chromium 网页环境
- 默认无 Node.js 访问权限
- 只能通过 `contextBridge` 暴露的 API 与主进程通信

**contextBridge 的使用**：
```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readFile: (path) => ipcRenderer.invoke('read-file', path),
  // 只暴露必要的、安全的 API
});
```

#### 3.2.3 JavaScript 上下文对比总结

| 维度 | NW.js | Electron |
|------|-------|----------|
| **上下文隔离** | 可选（独立/混合模式） | 强制（contextIsolation 默认 true） |
| **DOM 访问 Node** | 直接 `require()` | 需要通过 contextBridge + IPC |
| **Node 访问 DOM** | 需要显式传递 window | 需要通过 IPC |
| **contextBridge** | 无此概念 | 核心安全特性 |
| **instanceof 问题** | 有（跨上下文类型检查失败） | 无（上下文完全隔离） |
| **安全性** | 低（默认 Node 暴露在 DOM） | 高（严格隔离） |

### 3.3 IPC 通信机制对比

#### 3.3.1 NW.js IPC 通信

由于 NW.js 的共享堆设计，IPC 通信需求相对较少：

**主要通信方式**：
- **直接函数调用**：由于共享堆，可以直接调用另一上下文的函数
- **事件传递**：使用 Node.js 的 EventEmitter 或 DOM 事件
- **消息传递**：`postMessage` 等

**示例**：
```javascript
// 在 DOM 中直接调用 Node.js
const fs = require('fs');
const content = fs.readFileSync('file.txt', 'utf8');

// 从 Node 访问 DOM（需显式传递 window）
function updateDOM(window) {
  window.document.body.innerHTML = 'Hello from Node';
}
```

#### 3.3.2 Electron IPC 通信

Electron 有完善的 IPC 机制：

**1. 请求-响应模式（invoke/handle）—— 推荐**：
```javascript
// 主进程
ipcMain.handle('get-user-data', async (event, userId) => {
  const data = await database.query(userId);
  return data;
});

// preload.js
contextBridge.exposeInMainWorld('api', {
  getUserData: (userId) => ipcRenderer.invoke('get-user-data', userId),
});

// 网页中使用
const userData = await window.api.getUserData(123);
```

**2. 单向消息（send/on）**：
```javascript
// 渲染进程 -> 主进程
ipcRenderer.send('log-event', { type: 'click' });

// 主进程 -> 渲染进程
mainWindow.webContents.send('update-available', { version: '2.0' });
```

**3. MessagePort（高性能场景）**：
- 用于高频消息、流式传输
- 基于 Chromium 的 Mojo IPC

**底层实现**：
- Electron IPC 基于 Chromium 的 Mojo 框架
- 使用 V8 ValueSerializer 进行序列化（基于结构化克隆算法）

#### 3.3.3 IPC 通信对比总结

| 维度 | NW.js | Electron |
|------|-------|----------|
| **通信需求** | 低（共享堆，可直接调用） | 高（进程隔离，必须 IPC） |
| **主要方式** | 直接函数调用、EventEmitter | ipcMain/ipcRenderer、MessagePort |
| **序列化开销** | 无（共享堆） | 有（结构化克隆） |
| **延迟** | 极低（直接调用） | 低（但高于直接调用） |
| **复杂度** | 简单 | 中等 |
| **类型安全** | 无 | 可实现（TypeScript） |

### 3.4 安全模型对比

#### 3.4.1 NW.js 安全模型

**默认状态**：
- Node.js API 直接暴露在 DOM 中
- 任何网页脚本都可以 `require('child_process').exec('rm -rf /')`
- XSS 漏洞 = RCE（远程代码执行）

**可用的安全措施**：
- **不要加载不可信内容**：这是最重要的
- **CSP（内容安全策略）**：减少 XSS 风险
- **混合上下文模式**：避免使用（更不安全）
- **--disable-node-worker**：禁用某些功能

**NW.js 安全配置示例**：
```javascript
// NW.js 中，安全性主要依赖于不加载第三方内容
// 可以设置 CSP
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'">
```

**结论**：NW.js 适合完全离线、内容 100% 可控的内部工具，不适合加载第三方内容。

#### 3.4.2 Electron 安全模型

**默认状态（Electron 12+）**：
- `nodeIntegration: false`：渲染进程无法访问 Node.js
- `contextIsolation: true`：Preload 和网页隔离
- `sandbox: false`（可选，推荐启用）

**安全隔离层次**：
```
┌──────────────────────────────────────────────────────┐
│              操作系统层                                │
│  ┌────────────────────────────────────────────────┐  │
│  │          沙箱 (Sandbox，可选)                   │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │      上下文隔离 (Context Isolation)      │  │  │
│  │  │  ┌───────────────────────────────────┐ │  │  │
│  │  │  │    Preload Script (有限 API)      │ │  │  │
│  │  │  │  ┌─────────────────────────────┐ │ │  │  │
│  │  │  │  │  Renderer (Web 内容)         │ │ │  │  │
│  │  │  │  │  (不能访问 Node.js)          │ │ │  │  │
│  │  │  │  └─────────────────────────────┘ │ │  │  │
│  │  │  └───────────────────────────────────┘ │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Electron 安全最佳实践**：
```javascript
const mainWindow = new BrowserWindow({
  webPreferences: {
    // 必须配置
    nodeIntegration: false,
    contextIsolation: true,
    sandbox: true,
    
    // 推荐配置
    webSecurity: true,
    allowRunningInsecureContent: false,
    experimentalFeatures: false,
    
    // Preload 脚本
    preload: path.join(__dirname, 'preload.js'),
  },
});

// 安全的 Content-Security-Policy
// 在 HTML 中设置
// <meta http-equiv="Content-Security-Policy"
//       content="default-src 'self'">

// 导航安全
mainWindow.webContents.on('will-navigate', (event, url) => {
  if (!url.startsWith('file://') && !isAllowedDomain(url)) {
    event.preventDefault();
  }
});

// 禁止新窗口，或在外部浏览器打开
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  shell.openExternal(url);
  return { action: 'deny' };
});
```

**contextBridge 安全暴露**：
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
    return () => ipcRenderer.removeListener('menu-action', subscription);
  },
  
  // 暴露平台信息（只读、安全的值）
  platform: process.platform,
  appVersion: process.env.npm_package_version,
});
```

**结论**：Electron 适合需要加载第三方内容的应用，通过多层防护提供安全性。

#### 3.4.3 安全模型对比总结

| 维度 | NW.js | Electron |
|------|-------|----------|
| **默认安全性** | 低（Node 暴露在 DOM） | 高（nodeIntegration: false, contextIsolation: true） |
| **XSS → RCE** | 是（直接） | 否（需绕过多层防护） |
| **安全配置** | 有限（主要靠不加载第三方内容） | 丰富（sandbox, CSP, contextIsolation 等） |
| **加载第三方内容** | 不推荐 | 可行（配合安全配置） |
| **安全审计工具** | 较少 | 丰富（electronegativity, 官方检查清单） |
| **官方安全文档** | 较少 | 详细完善 |

### 3.5 架构实现细节对比

#### 3.5.1 NW.js 架构实现

NW.js 通过**直接修改 Chromium 源码**来集成 Node.js：

- 修改 Chromium 的 Blink 引擎，让 Node.js 和 Blink 共享同一个 V8 实例
- 合并 Node.js 的 libuv 事件循环和 Chromium 的消息循环
- 这是一个深度集成，需要维护自己的 Chromium 分支

**优点**：
- 集成度高，性能好
- 可以充分利用 Chromium 的所有功能

**缺点**：
- 维护成本高：每次 Chromium 更新都需要重新应用修改
- 升级慢：修改 Chromium 源码是一项巨大的工作

#### 3.5.2 Electron 架构实现

Electron 通过**独立进程**的方式集成 Node.js：

- Main 进程：运行 Node.js，不加载网页
- Renderer 进程：运行 Chromium，不运行 Node.js（默认）
- IPC：通过 Mojo IPC 连接两者

**优点**：
- 维护相对简单：不需要大幅修改 Chromium 源码
- 升级相对容易：可以更快跟进 Chromium 更新（虽然实际上 NW.js 更快）

**缺点**：
- IPC 开销
- 开发复杂度高

---

## 4. 系统支持情况详解

### 4.1 当前支持矩阵

| 平台 | NW.js v0.112.0 | Electron v32.x |
|------|-----------------|----------------|
| **Windows x64** | ✅ 支持 | ✅ 支持 |
| **Windows ia32** | ✅ 支持 | ✅ 支持 |
| **Windows ARM64** | ✅ 支持 (v0.106.0+) | ✅ 支持 |
| **macOS Intel (x64)** | ✅ 支持 | ✅ 支持 |
| **macOS ARM64 (Apple Silicon)** | ✅ 支持 (v0.77.0+) | ✅ 支持 |
| **Linux x64** | ✅ 支持 | ✅ 支持 |
| **Linux ia32** | ❌ 已移除 | ❌ 已移除 |
| **Linux ARM64** | ❌ 不支持 | ✅ 支持 |
| **Linux ARMv7l** | ❌ 不支持 | ✅ 支持 |
| **Linux Wayland** | ✅ 支持 (v0.50.0+) | ✅ 支持 |

### 4.2 Windows 支持详情

#### 4.2.1 NW.js Windows 支持

| 版本 | NW.js 支持情况 |
|------|----------------|
| **Windows 11** | ✅ 完全支持 |
| **Windows 10** | ✅ 完全支持 |
| **Windows 8/8.1** | 需要较旧版本 NW.js |
| **Windows 7** | 需要较旧版本 NW.js（Chromium 已停止支持） |
| **Windows XP** | 仅 v0.14.x LTS 及更早版本支持 |

**特殊要求**：
- **DirectX 运行时**：需要 `D3DCompiler_43.dll` 和 `d3dx9_43.dll` 以确保 WebGL 兼容性
- **Windows ARM64**：v0.106.0（2025/11/23）起原生支持

**构建风味**：
- **Normal Build**：不含 DevTools，体积小，适合生产
- **SDK Build**：包含 DevTools，适合开发

#### 4.2.2 Electron Windows 支持

| 版本 | Electron 支持情况 |
|------|------------------|
| **Windows 11** | ✅ 完全支持 |
| **Windows 10** | ✅ 完全支持 |
| **Windows 8/8.1** | 需要较旧版本 Electron |
| **Windows 7** | Electron 23.x 是最后一个支持 Windows 7 的版本 |

**特殊要求**：
- **Visual C++ Redistributable**：某些情况下需要
- **Windows ARM64**：Electron 9+ 开始支持

#### 4.2.3 Windows 支持对比

| 方面 | NW.js | Electron |
|------|-------|----------|
| **Windows 11/10** | ✅ 完全支持 | ✅ 完全支持 |
| **Windows ARM64** | ✅ v0.106.0+ | ✅ v9+ |
| **Windows 7** | 需旧版本 | 最后支持：v23.x |
| **Windows XP** | 最后支持：v0.14.x | 从未正式支持 |
| **构建风味** | Normal / SDK 两种 | 单一构建 |

### 4.3 macOS 支持详情

#### 4.3.1 NW.js macOS 支持

| 架构 | NW.js 支持情况 |
|------|----------------|
| **Intel (x64)** | ✅ 完全支持 |
| **Apple Silicon (ARM64)** | ✅ v0.77.0+ 原生支持 |

**系统版本**：
- macOS 10.9+（最新 NW.js 版本）
- v0.14.x 及更早支持 Mac OS X < 10.9

**特殊功能**：
- **Mac App Store**：v0.12.3 起通过 `macappstore` 构建风味支持

#### 4.3.2 Electron macOS 支持

| 架构 | Electron 支持情况 |
|------|------------------|
| **Intel (x64)** | ✅ 完全支持 |
| **Apple Silicon (ARM64)** | ✅ v11+ 原生支持 |
| **Universal Binary** | ✅ 支持 |

**系统版本**：
- macOS 10.13+（最新 Electron 版本）
- 具体版本支持取决于 Electron 版本

#### 4.3.3 macOS 支持对比

| 方面 | NW.js | Electron |
|------|-------|----------|
| **Intel x64** | ✅ 完全支持 | ✅ 完全支持 |
| **Apple Silicon** | ✅ v0.77.0+ (2023/06) | ✅ v11+ (2021) |
| **Universal Binary** | 需自行构建 | ✅ 官方支持 |
| **Mac App Store** | ✅ 支持 | ✅ 支持 |
| **最低 macOS 版本** | 10.9+ | 10.13+ |

### 4.4 Linux 支持详情

#### 4.4.1 NW.js Linux 支持

| 架构 | NW.js 支持情况 |
|------|----------------|
| **x64 (amd64)** | ✅ 完全支持 |
| **ia32 (i386)** | ❌ 已在较新版本中移除 |
| **ARM64 (arm64/aarch64)** | ❌ 不支持 |
| **ARMv7l (armhf)** | ❌ 不支持 |

**显示服务器**：
- **X11**：完全支持
- **Wayland**：v0.50.0（2020/11/19）起支持，通过 `--enable-features=UseOzonePlatform --ozone-platform=wayland` 启用

**特殊依赖**：
- **libudev.so.0**：较旧发行版可能需要符号链接
- **libffmpegsumo.so**：媒体功能支持

**常见发行版支持**：
- Ubuntu、Debian、Fedora、Arch 等主流发行版均支持

#### 4.4.2 Electron Linux 支持

| 架构 | Electron 支持情况 |
|------|------------------|
| **x64 (amd64)** | ✅ 完全支持 |
| **ia32 (i386)** | ❌ 已在 v4.0+ 移除 |
| **ARM64 (arm64/aarch64)** | ✅ 支持 |
| **ARMv7l (armhf)** | ✅ 支持 |

**显示服务器**：
- **X11**：完全支持
- **Wayland**：支持，可通过 Ozone 平台启用

**特殊依赖**：
- **GTK3**：需要
- **libnotify**：通知功能
- **libXss**：屏幕保护相关

**常见发行版支持**：
- Ubuntu 18.04+、Debian 9+、Fedora 30+、Arch 等

#### 4.4.3 Linux 支持对比

| 方面 | NW.js | Electron |
|------|-------|----------|
| **x64** | ✅ 完全支持 | ✅ 完全支持 |
| **ia32** | ❌ 已移除 | ❌ 已移除 |
| **ARM64** | ❌ 不支持 | ✅ 支持 |
| **ARMv7l** | ❌ 不支持 | ✅ 支持 |
| **Wayland** | ✅ v0.50.0+ | ✅ 支持 |
| **Raspberry Pi** | ❌ 不支持 | ✅ 支持 |
| **Linux 生态** | 较小 | 较大 |

### 4.5 系统支持总结

| 平台 | NW.js | Electron |
|------|-------|----------|
| **Windows 桌面** | ✅ 良好支持 | ✅ 良好支持 |
| **Windows ARM64** | ✅ v0.106.0+ | ✅ 支持 |
| **macOS Intel** | ✅ 良好支持 | ✅ 良好支持 |
| **macOS Apple Silicon** | ✅ v0.77.0+ | ✅ 支持 |
| **Linux 桌面 x64** | ✅ 良好支持 | ✅ 良好支持 |
| **Linux ARM64** | ❌ 不支持 | ✅ 支持 |
| **Linux ARMv7l** | ❌ 不支持 | ✅ 支持 |
| **Linux Wayland** | ✅ v0.50.0+ | ✅ 支持 |
| **嵌入式/物联网** | 不太适合 | 更适合（ARM 支持） |

---

## 5. 打包发布详细对比

### 5.1 NW.js 打包发布

#### 5.1.1 基本打包方式

**方式一：直接文件分发（推荐）**

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

**package.json 配置**：
```json
{
  "name": "myapp",
  "version": "1.0.0",
  "main": "index.html",
  "window": {
    "title": "My App",
    "width": 800,
    "height": 600
  }
}
```

**方式二：Zip 打包**

将应用文件打包为 `package.nw`（实际为 ZIP 格式）：

```bash
# Linux/macOS
cd myapp && zip -r ../package.nw *

# Windows: 创建 ZIP 文件后重命名为 .nw
```

将 `package.nw` 放在 NW.js 可执行文件同目录下。

**方式三：合并为单一可执行文件**

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

#### 5.1.2 第三方打包工具

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

**nw-builder 示例**：
```javascript
// build.js
const nwBuilder = require('nw-builder');

const options = {
  files: ['./src/**/*', './package.json'],
  platforms: ['win32', 'linux64', 'osx64'],
  version: '0.112.0',
  flavor: 'normal',
  outDir: './dist',
  appName: 'MyApp',
  appVersion: '1.0.0',
  macIcns: './assets/icon.icns',
  winIco: './assets/icon.ico'
};

nwBuilder(options).then(() => {
  console.log('Build complete!');
});
```

#### 5.1.3 代码保护

**1. V8 快照（nwjc）**

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
- 编译后的代码**不跨平台**，也不跨 NW.js 版本兼容
- 需要为每个目标平台分别编译
- 闭包写法需要调整（不能使用 IIFE）
- 可以加载远程编译的 JS

**2. 其他保护方式**：
- 代码混淆（UglifyJS、Terser 等）
- 将敏感逻辑放在 Node.js 原生模块中（C++ addon）
- 使用 `nwjc` 的 V8 快照作为主要保护手段

#### 5.1.4 必须分发的文件

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

### 5.2 Electron 打包发布

#### 5.2.1 官方推荐工具

**1. electron-builder（最流行）**

功能最全面的打包工具，支持：
- 多平台构建（Windows、macOS、Linux）
- 自动更新集成
- 代码签名
- 多种打包格式（NSIS、dmg、AppImage、deb、rpm 等）
- 自动处理原生模块重建

**electron-builder 配置示例**：
```json
// package.json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "main": "main.js",
  "build": {
    "appId": "com.example.myapp",
    "productName": "My App",
    "directories": {
      "output": "dist"
    },
    "files": [
      "dist/**/*",
      "package.json"
    ],
    "asar": true,
    "asarUnpack": [
      "node_modules/sharp/**",
      "node_modules/sqlite3/**"
    ],
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/icon.ico",
      "signingHashAlgorithms": ["sha256"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    },
    "mac": {
      "target": ["dmg", "zip"],
      "icon": "build/icon.icns",
      "category": "public.app-category.utilities",
      "hardenedRuntime": true,
      "gatekeeperAssess": false,
      "entitlements": "build/entitlements.mac.plist",
      "entitlementsInherit": "build/entitlements.mac.plist"
    },
    "dmg": {
      "contents": [
        { "x": 130, "y": 220 },
        { "x": 410, "y": 220, "type": "link", "path": "/Applications" }
      ]
    },
    "linux": {
      "target": ["AppImage", "deb", "rpm"],
      "icon": "build/icons",
      "category": "Utility"
    }
  },
  "scripts": {
    "build": "electron-builder",
    "build:win": "electron-builder --win",
    "build:mac": "electron-builder --mac",
    "build:linux": "electron-builder --linux"
  }
}
```

**2. Electron Forge（官方）**

官方的构建工具链，集成了：
- 项目脚手架
- Webpack/Vite 集成
- 打包
- 发布

**Forge 配置示例**：
```javascript
// forge.config.js
module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'assets/icon'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        certificateFile: './cert.pfx',
        certificatePassword: process.env.CERTIFICATE_PASSWORD
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'example',
          name: 'my-electron-app'
        },
        prerelease: false
      }
    }
  ]
};
```

**3. electron-packager（基础工具）**

较基础的打包工具，适合简单需求。

#### 5.2.2 打包格式对比

| 格式 | 平台 | NW.js | Electron |
|------|------|-------|----------|
| **NSIS** | Windows | 需第三方工具 | ✅ electron-builder 内置 |
| **Portable EXE** | Windows | 可行 | ✅ electron-builder 内置 |
| **MSI** | Windows | 需第三方工具 | ✅ 支持 |
| **ZIP** | Windows/macOS/Linux | ✅ 简单 | ✅ 支持 |
| **DMG** | macOS | 需手动/第三方工具 | ✅ electron-builder 内置 |
| **PKG** | macOS | 需第三方工具 | ✅ 支持 |
| **AppImage** | Linux | 需第三方工具 | ✅ electron-builder 内置 |
| **DEB** | Linux | 需第三方工具 | ✅ electron-builder 内置 |
| **RPM** | Linux | 需第三方工具 | ✅ electron-builder 内置 |
| **Snap** | Linux | 需第三方工具 | ✅ 支持 |
| **Flatpak** | Linux | 需第三方工具 | ✅ 支持 |

#### 5.2.3 ASAR 归档

Electron 使用 **ASAR（Atom Shell Archive）** 格式打包应用文件：

```json
{
  "build": {
    "asar": true,
    "asarUnpack": [
      "node_modules/sharp/**",
      "node_modules/sqlite3/**"
    ]
  }
}
```

**ASAR 的优点**：
- 改进 Windows 上的路径长度问题
- 轻微的性能提升（减少文件系统调用）
- 基本的代码保护（不易直接查看）

**ASAR 的限制**：
- 原生模块需要解包（`asarUnpack`）
- 某些文件系统操作需要特殊处理

#### 5.2.4 代码保护

Electron 的代码保护方式：
- **ASAR 归档**：基本保护
- **代码混淆**：UglifyJS、Terser、webpack-obfuscator
- **原生模块**：将敏感逻辑放在 C++ addon 中
- **Bytenode**：V8 字节码编译（需要谨慎使用，可能有兼容性问题）
- **商业保护工具**：如 Enigma Virtual Box、VMProtect 等

**注意**：没有绝对安全的保护方式，只能增加逆向难度。

#### 5.2.5 代码签名

Electron 有完善的代码签名支持：

**Windows**：
- EV 代码签名证书（推荐）
- 标准代码签名证书
- electron-builder 自动处理签名

**macOS**：
- Apple Developer ID 证书
- Hardened Runtime
- Notarization（公证）
- electron-builder 自动处理

**Linux**：
- 通常不需要代码签名
- 可以使用 GPG 签名

### 5.3 打包发布详细对比

| 方面 | NW.js | Electron |
|------|-------|----------|
| **官方打包工具** | 无官方工具，推荐 nw-builder | ✅ Electron Forge、electron-builder |
| **打包格式** | 基础格式，高级格式需第三方工具 | ✅ 丰富（NSIS、dmg、AppImage、deb、rpm 等） |
| **ASAR 归档** | ❌ 无此概念 | ✅ 内置支持 |
| **代码签名** | 需手动配置 | ✅ 完善支持 |
| **自动更新集成** | ❌ 无内置，需第三方 | ✅ 内置 autoUpdater + electron-updater |
| **打包复杂度** | 简单（文件复制） | 中等（配置丰富） |
| **社区工具** | 较少 | 丰富且成熟 |
| **原生模块处理** | nw-gyp | electron-rebuild（builder 自动处理） |
| **跨平台构建** | 支持（nw-builder） | ✅ 优秀支持 |

---

## 6. 版本更新机制对比

### 6.1 NW.js 更新机制

#### 6.1.1 框架更新策略

- **Chromium 更新**：约每 6 周，严格跟随 Chromium 稳定版
- **Node.js 更新**：每次 NW.js 主版本通常更新 Node.js
- **发布节奏**：快速，新版本频繁

#### 6.1.2 应用自动更新

**重要**：NW.js **没有内置的自动更新机制**。

**第三方更新方案**：

| 方案 | 说明 |
|------|------|
| **node-webkit-updater** | 早期社区方案，为 node-webkit 设计 |
| **nwjs-autoupdater** | NW.js 专用的自动更新模块 |
| **nw-autoupdater** | 另一个 NW.js 自动更新工具 |
| **Squirrel.Windows** | 可用于 Windows 平台的更新框架 |
| **Electron-updater 思路** | 可参考类似模式实现 |

**自定义更新实现示例**：

```javascript
// 主逻辑（概念示例）
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const currentVersion = require('./package.json').version;
const updateServer = 'http://updates.example.com';

function checkForUpdates() {
  return new Promise((resolve, reject) => {
    http.get(`${updateServer}/latest.json`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const update = JSON.parse(data);
          resolve(update);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadUpdate(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    http.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(destPath);
      reject(err);
    });
  });
}

function applyUpdate(updatePath) {
  // 平台特定的更新逻辑
  if (process.platform === 'win32') {
    // Windows 更新逻辑
    exec(`update-installer.exe "${updatePath}"`);
  } else if (process.platform === 'darwin') {
    // macOS 更新逻辑
  } else {
    // Linux 更新逻辑
  }
}

// 使用
checkForUpdates().then(update => {
  if (update.version !== currentVersion) {
    console.log('New version available:', update.version);
    return downloadUpdate(update.url, './update.nw')
      .then(() => applyUpdate('./update.nw'));
  }
}).catch(console.error);
```

**NW.js 更新的挑战**：
- 没有内置方案，需要自己实现
- 更新整个 NW.js 运行时体积大（~100MB+）
- 可以只更新应用代码（package.nw），但需要框架兼容

### 6.2 Electron 更新机制

#### 6.2.1 框架更新策略

- **Chromium 更新**：约每 12 周，有选择地跟进
- **Node.js 更新**：每次 Electron 主版本通常更新 Node.js
- **LTS 版本**：提供长期支持版本
- **发布节奏**：相对保守，注重稳定性

#### 6.2.2 应用自动更新

Electron 有**完善的内置自动更新机制**：

**1. 内置 autoUpdater**

```javascript
// main.js
const { autoUpdater } = require('electron');

autoUpdater.setFeedURL({
  url: 'https://updates.example.com/update.json'
});

autoUpdater.checkForUpdates();

autoUpdater.on('update-available', () => {
  console.log('Update available');
});

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall();
});

autoUpdater.on('error', (error) => {
  console.error('Update error:', error);
});
```

**2. electron-updater（推荐，与 electron-builder 集成）**

```javascript
// main.js
const { autoUpdater } = require('electron-updater');

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

app.whenReady().then(() => {
  autoUpdater.checkForUpdatesAndNotify().catch(err => {
    console.log('Update check failed:', err.message);
  });
});

autoUpdater.on('checking-for-update', () => {
  mainWindow.webContents.send('update-checking');
});

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-available', info);
});

autoUpdater.on('update-not-available', (info) => {
  mainWindow.webContents.send('update-not-available', info);
});

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow.webContents.send('update-progress', progressObj);
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow.webContents.send('update-downloaded', info);
});

// IPC 处理
ipcMain.handle('download-update', () => {
  return autoUpdater.downloadUpdate();
});

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall();
});
```

**electron-builder 配置更新服务器**：

```json
{
  "build": {
    "publish": [
      {
        "provider": "github",
        "owner": "example",
        "repo": "my-electron-app"
      }
    ]
  }
}
```

支持的发布提供商：
- GitHub
- GitLab
- Bitbucket
- 自定义服务器（generic）
- S3
- Spaces
- 等等

#### 6.2.3 更新策略对比

| 方面 | NW.js | Electron |
|------|-------|----------|
| **框架更新频率** | 快（~6 周） | 中等（~12 周） |
| **Chromium 跟进** | 严格跟随每个版本 | 有选择地跟进 |
| **内置自动更新** | ❌ 无 | ✅ 完善支持 |
| **第三方更新工具** | 有，但较少 | ✅ electron-updater（官方推荐） |
| **增量更新** | 需自行实现 | ✅ 支持（通过部分工具） |
| **更新体验** | 需自行实现，体验参差不齐 | ✅ 完善，用户体验好 |
| **LTS 支持** | 有（v0.14.x 是最后一个） | ✅ 官方 LTS 计划 |

### 6.3 更新架构对比

#### NW.js 更新架构

由于没有内置更新机制，NW.js 应用通常：
1. 自己实现更新检查逻辑
2. 下载新的 `package.nw`（应用代码）或完整 NW.js 运行时
3. 替换文件并重启

优点：
- 灵活，可以完全控制更新流程

缺点：
- 需要自己实现所有逻辑
- 容易出错
- 用户体验不一致

#### Electron 更新架构

Electron 使用 **Squirrel** 框架：
- **Squirrel.Windows**：Windows 平台
- **Squirrel.Mac**：macOS 平台
- **AppImage** + electron-updater：Linux 平台

优点：
- 官方支持，经过验证
- 良好的用户体验
- 支持增量更新（部分格式）
- 支持回滚

缺点：
- 配置相对复杂
- 需要签名（macOS/Windows Store）

---

## 7. 生态系统与工具链

### 7.1 社区规模与活跃度

| 指标 | NW.js | Electron |
|------|-------|----------|
| **GitHub Stars** | ~19.8k | ~112k |
| **GitHub Forks** | ~1.5k | ~14.8k |
| **NPM 下载量** | 较低 | 非常高 |
| **Stack Overflow 问题** | ~1.5k | ~18k+ |
| **公司支持** | 社区驱动 | GitHub、Microsoft、Slack 等 |
| **主要应用** | 较少 | VS Code、Slack、Discord、Figma、Notion 等 |
| **第三方库** | 较少 | 丰富 |

### 7.2 开发工具

#### NW.js 开发工具

| 工具 | 说明 |
|------|------|
| **DevTools** | SDK Build 包含 Chrome DevTools（F12 打开） |
| **nwjs-builder** | 构建工具 |
| **nw-gyp** | 原生模块构建 |
| **编辑器插件** | VS Code 有一些插件 |

#### Electron 开发工具

| 工具 | 说明 |
|------|------|
| **DevTools** | 内置 Chrome DevTools（可通过快捷键打开） |
| **Electron Forge** | 官方构建工具链 |
| **electron-builder** | 最流行的构建工具 |
| **electron-rebuild** | 原生模块重建 |
| **electron-updater** | 自动更新 |
| **electron-log** | 日志工具 |
| **electron-store** | 简单的数据持久化 |
| **electron-debug** | 调试工具 |
| **electron-context-menu** | 上下文菜单 |
| **VS Code 插件** | 丰富的插件支持 |
| **React DevTools** | React 调试 |
| **Redux DevTools** | Redux 调试 |

### 7.3 安全审计工具

#### NW.js 安全审计工具

- **较少**：没有专门的 NW.js 安全审计工具
- 通用的 Web 安全工具可用

#### Electron 安全审计工具

| 工具 | 说明 |
|------|------|
| **Electronegativity** | Doyensec 开发，静态分析 Electron 应用安全配置 |
| **官方安全检查清单** | Electron 官方提供的详细安全指南 |
| **ESLint 插件** | eslint-plugin-security 等 |
| **npm audit** | 依赖漏洞检查 |
| **Snyk** | 依赖漏洞检查 |

### 7.4 框架集成

#### NW.js 框架集成

- 可以使用任何前端框架（React、Vue、Angular 等）
- 集成相对简单（直接在网页中使用 Node.js）
- Webpack/Vite 等构建工具可用，但配置可能需要调整

#### Electron 框架集成

- 可以使用任何前端框架
- 有完善的集成方案：
  - **Vite + Electron**：vite-plugin-electron
  - **Webpack + Electron**：electron-webpack
  - **Next.js + Electron**：next-electron
  - **Nuxt + Electron**：nuxt-electron
  - 等等
- 丰富的样板项目：electron-react-boilerplate、electron-vue-vite 等

---

## 8. 实际应用场景与选择指南

### 8.1 选择 NW.js 如果...

✅ **你的应用完全离线且内容 100% 可控**
- 内部工具
- 企业内部应用
- 不加载任何第三方内容

✅ **你需要直接的 Node.js 访问，不想处理 IPC**
- 快速原型开发
- 简单的桌面工具
- 不想学习进程模型

✅ **你需要 Chrome Apps API 支持**
- 迁移旧的 Chrome Apps

✅ **你需要 NaCl/Pepper 插件支持**
- 特定的插件需求

✅ **你需要内置 PDF 查看器**
- PDF 相关应用

✅ **你从旧的 node-webkit 应用迁移**
- 改造成本高

✅ **你需要更紧密的 Chromium 版本跟随**
- 需要最新的 Chromium 特性

### 8.2 选择 Electron 如果...

✅ **你的应用需要加载任何第三方内容**
- Web 浏览器
- 邮件客户端
- 社交媒体应用
- 任何用户生成内容

✅ **安全性是首要考虑**
- 处理敏感数据
- 金融应用
- 企业应用

✅ **你需要多进程架构的优势**
- 稳定性要求高
- 多窗口应用
- 一个窗口崩溃不应影响其他

✅ **你需要自动更新机制**
- 消费者应用
- 需要持续更新的应用

✅ **你需要更大的生态和社区支持**
- 需要丰富的第三方库
- 需要良好的文档和教程
- 需要问题解决的社区支持

✅ **你需要丰富的打包和发布选项**
- 应用商店发布
- 多种安装包格式
- 代码签名

### 8.3 应用案例对比

#### NW.js 典型应用

- **内部工具**：企业内部的管理工具
- **原型开发**：快速验证想法
- **老旧应用**：从 node-webkit 时代延续下来的应用
- **特定技术需求**：需要 Chrome Apps API、NaCl 等

#### Electron 典型应用

- **VS Code**：代码编辑器
- **Slack**：团队协作
- **Discord**：聊天应用
- **Figma**：设计工具
- **Notion**：笔记应用
- **Microsoft Teams**（曾经使用，现在迁移到 WebView2）
- **Postman**：API 工具
- 等等...

### 8.4 迁移考虑

#### 从 NW.js 迁移到 Electron

**原因**：
- 需要更好的安全性
- 需要加载第三方内容
- 需要更大的生态
- 需要自动更新

**挑战**：
- 需要重写 Node.js 调用部分，改为 IPC
- 需要理解进程模型
- 需要学习新的 API

**迁移步骤**：
1. 学习 Electron 进程模型和 IPC
2. 将直接 Node 调用改为 IPC 通信
3. 重写窗口管理代码
4. 重新配置打包和发布

#### 从 Electron 迁移到 NW.js

**原因**：
- 需要简化开发（无需 IPC）
- 应用完全离线且内容可控
- 需要特定的 NW.js 功能

**挑战**：
- 安全模型的变化
- 需要移除 IPC 相关代码
- 打包发布工具的变化

---

## 9. 参考资料

### 9.1 NW.js 官方资源

- **官网**：https://nwjs.io
- **文档**：https://docs.nwjs.io
- **GitHub**：https://github.com/nwjs/nw.js
- **下载**：https://dl.nwjs.io
- **博客**：https://nwjs.io/blog/

### 9.2 Electron 官方资源

- **官网**：https://www.electronjs.org
- **文档**：https://www.electronjs.org/docs
- **GitHub**：https://github.com/electron/electron
- **安全文档**：https://www.electronjs.org/docs/latest/tutorial/security
- **Electron Forge**：https://www.electronforge.io
- **electron-builder**：https://www.electron.build

### 9.3 安全研究资源

- **Electronegativity**：https://github.com/doyensec/electronegativity
- **Doyensec Blog**：https://blog.doyensec.com
- **OWASP Electron Security Cheat Sheet**

---

**文档版本**：1.0  
**生成日期**：2026年7月  
**分析基础**：NW.js v0.112.0、Electron v32.x
