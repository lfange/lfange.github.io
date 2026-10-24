---
title: Electron 离线打包完全指南
icon: package
category:
  - 前端
  - 桌面开发
---

# Electron 离线打包完全指南

> 在内网 / 无外网 / 网络受限环境下完成 Electron 应用的打包发布。

---

## 目录

1. [背景：为什么需要离线打包](#背景为什么需要离线打包)
2. [核心难点分析](#核心难点分析)
3. [方案一：配置镜像源（半离线）](#方案一配置镜像源半离线)
4. [方案二：完全离线打包（无外网）](#方案二完全离线打包无外网)
5. [方案三：缓存复用（多机器/CI）](#方案三缓存复用多机器ci)
6. [原生模块的离线处理](#原生模块的离线处理)
7. [常见问题与排查](#常见问题与排查)

---

## 背景：为什么需要离线打包

`electron-builder` 默认在打包时会从 **GitHub Release** 下载 Electron 预编译二进制（`electron-vX.X.X-win32-x64.zip`），以及 `app-builder`、`nsis`、`7za` 等辅助二进制。这带来三个典型痛点：

1. **国内网络访问 GitHub 极不稳定**，下载 electron 二进制经常超时失败（`EBADSLT` / `ETIMEDOUT`）。
2. **企业内网构建机无外网**，完全无法访问 GitHub、npm registry。
3. **CI/CD 需要稳定可重复**，每次构建都去外网拉资源既慢又不可控。

离线打包的目标：**把所有外部依赖在「有网机器」上提前准备好，再带到「无网机器」上完成打包**，整个过程不再依赖任何外网。

---

## 核心难点分析

一次 Electron 打包涉及的外部资源：

| 资源 | 下载来源 | 用途 | 缓存目录 |
|------|----------|------|----------|
| Electron 二进制 | `github.com/electron/electron/releases` | 运行时壳 | `~/.cache/electron` |
| `electron-builder` 辅助二进制（app-builder、nsis、7za 等） | `github.com/electron-userland/electron-builder-binaries/releases` | 打包工具链 | `~/.cache/electron-builder` |
| npm 依赖 | npm registry | 项目依赖 | 项目 `node_modules` |
| node-gyp headers | `nodejs.org/dist` | 原生模块重建 | `~/.electron-gyp` |
| fuses / wix / sign tools | 各自 GitHub Release | 代码签名 / 安装包定制 | `~/.cache/electron-builder` |

> 💡 Windows 上缓存目录实际为 `%LOCALAPPDATA%\electron\Cache` 和 `%LOCALAPPDATA%\electron-builder\Cache`。

只要把这四类资源提前准备好并放到对应缓存目录，打包就完全离线了。

---

## 方案一：配置镜像源（半离线）

**适用场景**：能访问国内镜像（如公司内网镜像 / 淘宝镜像），只是访问不了 GitHub。

通过环境变量把下载源切到镜像，是最简单的方式：

```bash
# Electron 二进制镜像
export ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/"
export ELECTRON_CUSTOM_DIR="{{ version }}"

# electron-builder 辅助二进制镜像
export ELECTRON_BUILDER_BINARIES_MIRROR="https://npmmirror.com/mirrors/electron-builder-binaries/"

# npm 镜像
npm config set registry https://registry.npmmirror.com

# 原生模块编译头文件镜像
export NODEJS_ORG_MIRROR="https://npmmirror.com/mirrors/node/"
```

Windows PowerShell 写法：

```powershell
$env:ELECTRON_MIRROR = "https://npmmirror.com/mirrors/electron/"
$env:ELECTRON_BUILDER_BINARIES_MIRROR = "https://npmmirror.com/mirrors/electron-builder-binaries/"
$env:NODEJS_ORG_MIRROR = "https://npmmirror.com/mirrors/node/"
npm config set registry https://registry.npmmirror.com
```

也可以写进项目 `.npmrc`（npm 安装 electron 时生效）：

```ini
electron_mirror=https://npmmirror.com/mirrors/electron/
electron_builder_binaries_mirror=https://npmmirror.com/mirrors/electron-builder-binaries/
registry=https://registry.npmmirror.com
```

配置后正常执行 `npm run build` 即可，electron-builder 会从镜像拉取资源。

> ⚠️ 这是「半离线」方案——仍需联网，只是换了个能访问的源。完全无外网请用方案二。

---

## 方案二：完全离线打包（无外网）

**适用场景**：构建机完全没有外网，必须把资源拷进去。

整体思路：**有网机器下载 → 拷到无网机器的缓存目录 → 直接打包**。

### 第 1 步：在有网机器准备 Electron 二进制

先确认项目使用的 Electron 版本（看 `package.json` 的 `devDependencies.electron`），假设是 `25.3.1`。

```bash
# 方法 A：直接用浏览器从镜像下载对应版本的 zip
# https://npmmirror.com/mirrors/electron/25.3.1/electron-v25.3.1-win32-x64.zip
# https://npmmirror.com/mirrors/electron/25.3.1/electron-v25.3.1-win32-x64.zip.sha256

# 方法 B：在有网机器跑一次打包，让它自动下载到缓存
# （设置好 ELECTRON_MIRROR 后执行构建）
npm run build
```

下载后文件应放到无网机器的缓存目录：

```
%LOCALAPPDATA%\electron\Cache\25.3.1\win32-x64\electron-v25.3.1-win32-x64.zip
```

> 文件名和目录结构必须严格一致，electron-builder 通过 `版本号/平台-架构/文件名` 定位。

### 第 2 步：准备 electron-builder 辅助二进制

`electron-builder` 会下载 `app-builder`、`nsis`、`nsis-resources`、`7za` 等。最稳妥的办法是在有网机器执行一次完整打包，然后直接把整个缓存目录拷走。

有网机器执行：

```bash
npm run build   # 完成后缓存已生成
```

缓存位置：

```
%LOCALAPPDATA%\electron-builder\Cache\
├── app-builder\
├── nsis\
├── nsis-resources\
└── 7za\
```

### 第 3 步：准备 node_modules

在有网机器执行 `npm install`（或 `npm ci`），把整个 `node_modules` 连同 `package-lock.json` 一起拷到无网机器。

```bash
# 有网机器
npm ci

# 打包传输（注意排除不必要的文件）
tar -czf node_modules.tar.gz node_modules package-lock.json
```

> 💡 如果项目使用了原生模块（如 `better-sqlite3`、`node-pty`），见下文「原生模块的离线处理」。

### 第 4 步：拷贝到无网机器

把以下内容拷到无网构建机：

1. 项目源码（含 `node_modules`、`package-lock.json`）
2. `%LOCALAPPDATA%\electron\Cache\` 整个目录
3. `%LOCALAPPDATA%\electron-builder\Cache\` 整个目录
4. 原生模块编译头（如需要）：`~/.electron-gyp`

### 第 5 步：无网机器执行打包

```bash
# 关键：禁用联网下载，强制使用缓存
$env:ELECTRON_SKIP_BINARY_DOWNLOAD=1        # 不重新下载 electron 二进制
$env:ELECTRON_BUILDER_OFFLINE=1             # electron-builder 离线模式（仅较高版本支持）

npm run build
```

打包时 electron-builder 会在缓存目录找到所需文件，整个流程不再访问外网。

---

## 方案三：缓存复用（多机器 / CI）

**适用场景**：多台构建机或 CI 流水线，希望复用同一份缓存，避免每台机器都下一遍。

### 思路

把缓存目录做成「可挂载的共享卷」或「CI cache」：

- **CI（GitHub Actions / GitLab CI）**：用官方 cache 机制缓存 `~/.cache/electron` 和 `~/.cache/electron-builder`。
- **多台内网机**：把缓存目录放到内网 NAS / 文件服务器，打包前用脚本同步到本地。

### 示例：GitLab CI 缓存配置

```yaml
build:
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths:
      - node_modules/
      - .cache/electron/
      - .cache/electron-builder/
  variables:
    ELECTRON_CACHE: .cache/electron
    ELECTRON_BUILDER_CACHE: .cache/electron-builder
  script:
    - npm ci
    - npm run build
```

> 关键点：通过 `ELECTRON_CACHE` 和 `ELECTRON_BUILDER_CACHE` 环境变量把缓存目录改到项目内，便于 CI 缓存。

### 示例：内网 NAS 同步脚本

```powershell
# 从 NAS 拉取预置缓存到本地（无网机器打包前执行）
$nas = "\\nas\build-cache\electron"
Copy-Item -Path "$nas\electron\Cache\*" -Destination "$env:LOCALAPPDATA\electron\Cache\" -Recurse -Force
Copy-Item -Path "$nas\electron-builder\Cache\*" -Destination "$env:LOCALAPPDATA\electron-builder\Cache\" -Recurse -Force
```

---

## 原生模块的离线处理

如果项目依赖原生模块（含 C++ 编译产物），离线打包要额外处理。

### 难点

原生模块需要针对 Electron 的 ABI 重新编译（`electron-rebuild`），编译时 `node-gyp` 会下载对应版本的 Node headers。

### 离线方案

**1. 在有网机器预编译好 `.node` 文件**

```bash
# 安装并重建原生模块（针对 electron 的 ABI）
npx electron-rebuild

# 或在 package.json scripts 中：
# "postinstall": "electron-builder install-app-deps"
```

编译完成后，`node_modules/<原生模块>/build/Release/*.node` 就是针对当前 Electron 版本的产物，**直接连同 `node_modules` 一起拷到无网机器即可**，无需在无网机器重新编译。

**2. 离线 node headers**

如果必须在无网机器重建，需提前下载 headers：

```bash
# 有网机器：下载对应 electron 版本的 node headers
# https://npmmirror.com/mirrors/electron/X.X.X/node-vX.X.X-headers.tar.gz

# 放到无网机器的 electron-gyp 缓存目录
# ~/.electron-gyp/X.X.X/node-vX.X.X-headers.tar.gz
```

并设置：

```bash
export NODEJS_ORG_MIRROR="file:///path/to/local/mirror"
```

> ✅ 最佳实践：**在有网机器完成原生模块重建，只拷编译产物**，彻底避免无网机器的编译环境问题。

---

## 常见问题与排查

### Q1：打包报 `EPERM` / 下载超时 `ETIMEDOUT`

原因：仍在尝试从 GitHub 下载。检查：

- 是否设置了 `ELECTRON_MIRROR`（半离线）或正确放了缓存文件（全离线）
- 缓存目录结构是否严格匹配 `版本号/平台-架构/文件名`
- 是否设置了 `ELECTRON_SKIP_BINARY_DOWNLOAD=1`

### Q2：报 `Cannot find module .../app-builder` 或 nsis 相关错误

原因：`electron-builder` 辅助二进制缺失。检查 `%LOCALAPPDATA%\electron-builder\Cache\` 下是否完整，必要时重新拷贝。

### Q3：原生模块报 `was compiled against a different Node.js version`

原因：原生模块用的 Node ABI 与 Electron 不匹配。执行 `npx electron-rebuild` 或 `electron-builder install-app-deps` 重建。

### Q4：缓存目录到底在哪？

```powershell
# 查看实际生效的缓存路径
echo $env:LOCALAPPDATA\electron\Cache
echo $env:LOCALAPPDATA\electron-builder\Cache

# 也可通过环境变量自定义
$env:ELECTRON_CACHE = "D:\build-cache\electron"
$env:ELECTRON_BUILDER_CACHE = "D:\build-cache\electron-builder"
```

### Q5：跨平台打包（在 Windows 上打 macOS 包）

Electron 默认不支持跨平台编译原生模块，且 macOS 包需在 macOS 上打。离线场景下建议**每个目标平台用对应系统的构建机**分别打包，再合并分发。

### Q6：如何验证打包完全离线？

最直接的办法：**打包前断开构建机网络**（拔网线 / 禁用网卡），若能成功打包则证明资源已全部就位。

```powershell
# 临时禁用网卡（管理员 PowerShell）
Disable-NetAdapter -Name "以太网" -Confirm:$false

# 打包
npm run build

# 恢复网卡
Enable-NetAdapter -Name "以太网"
```

---

## 总结

| 方案 | 适用场景 | 复杂度 | 是否需要外网 |
|------|----------|--------|--------------|
| 镜像源 | 能访问国内镜像 | 低 | 需要（访问镜像） |
| 完全离线 | 内网无外网 | 高 | 不需要 |
| 缓存复用 | 多机器 / CI | 中 | 首次需要 |

**核心原则**：把 Electron 二进制、electron-builder 辅助二进制、node_modules、原生模块产物这四类资源在「有网机器」备齐，放到「无网机器」的对应缓存目录，即可实现稳定可靠的离线打包。

相关笔记：[Electron 打包优化指南](./electron-optimization-guide.md)、[创建自签名代码签名证书](./code-signing.md)
