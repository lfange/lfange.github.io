# 服务器技术文档项目总览

> 本项目是一个综合性的服务器技术知识库，涵盖 Linux、Node.js、Electron、NW.js 等多个技术领域。

---

## 项目结构

```
serve/
├── README.md                          # 服务基础说明
├── PROJECT_OVERVIEW.md                # 本文档 - 项目总览
├── electron-deep-analysis.md          # Electron 深度分析
├── nwjs-deep-analysis.md              # NW.js 深度分析
├── electron-vs-nwjs-security-analysis.md  # Electron 与 NW.js 安全对比
├── nwjs-vs-electron-deep-comparison.md    # Electron 与 NW.js 深度对比
├── electron-security-research-blogs.md    # Electron 安全研究博客汇总
│
├── linux/                              # Linux 相关文档
│   ├── README.md                       # Linux 基础说明
│   ├── linux.md                        # Linux 常用命令
│   ├── linux-core-philosophy-and-ops.md  # Linux 核心哲学与运维
│   ├── linux-advanced-guide.md         # Linux 高级应用指南
│   └── china-os-deep-analysis.md       # 中国操作系统深度分析
│
├── node/                               # Node.js 相关文档
│   ├── README.md                       # Node.js 基础说明
│   ├── process.md                      # Node.js 进程管理
│   ├── lang.md                         # Node.js 语言特性
│   └── node-advanced-guide.md          # Node.js 高级应用指南
│
├── performance.md                      # 性能相关
├── frps.md                            # FRP 内网穿透
├── nginx.md                           # Nginx 配置
├── Database.md                        # 数据库相关
├── AIAgent.md                         # AI Agent 相关
├── sign.md                            # 签名相关
├── start.md                           # 入门指南
│
└── assets/                            # 图片和资源
```

---

## 技术领域概览

### 1. Linux 操作系统

#### 基础文档
- **[Linux 基础](./linux/README.md)** - Linux 基础知识介绍
- **[Linux 常用命令](./linux/linux.md)** - 快速查阅的命令手册
- **[Linux 核心哲学与运维](./linux/linux-core-philosophy-and-ops.md)** - Linux 的设计哲学与运维实践

#### 进阶文档
- **[Linux 高级应用指南](./linux/linux-advanced-guide.md)** - 系统管理、性能调优、安全加固、自动化运维
- **[中国操作系统深度分析](./linux/china-os-deep-analysis.md)** - 国产操作系统的研究与分析

### 2. Node.js 开发

#### 基础文档
- **[Node.js 基础](./node/README.md)** - Node.js 基础介绍
- **[Node.js 进程管理](./node/process.md)** - 进程相关操作
- **[Node.js 语言特性](./node/lang.md)** - JavaScript 语言特性

#### 进阶文档
- **[Node.js 高级应用指南](./node/node-advanced-guide.md)** - 性能优化、内存管理、异步编程、生产部署

### 3. Electron & NW.js

#### 深度分析
- **[Electron 深度分析](./electron-deep-analysis.md)** - Electron 架构、运行机制、常见问题
- **[NW.js 深度分析](./nwjs-deep-analysis.md)** - NW.js 版本历史、技术架构、系统支持

#### 对比研究
- **[Electron 与 NW.js 安全对比](./electron-vs-nwjs-security-analysis.md)** - 安全架构差异分析
- **[Electron 与 NW.js 深度对比](./nwjs-vs-electron-deep-comparison.md)** - 全面的技术对比，涵盖：
  - 版本兼容性
  - 技术架构
  - 系统支持
  - 打包发布
  - 版本更新机制
  - 生态系统

#### 安全研究
- **[Electron 安全研究博客汇总](./electron-security-research-blogs.md)** - 安全研究资料合集

### 4. 服务器软件

- **[Nginx](./nginx.md)** - Web 服务器配置
- **[FRP](./frps.md)** - 内网穿透工具
- **[数据库](./Database.md)** - 数据库相关知识
- **[性能优化](./performance.md)** - 性能调优指南
- **[签名](./sign.md)** - 数字签名相关
- **[入门指南](./start.md)** - 初学者入门

### 5. 其他技术

- **[AI Agent](./AIAgent.md)** - AI Agent 相关技术

---

## 使用指南

### 学习路径建议

#### 1. 初学者路径
1. 阅读 **[入门指南](./start.md)** 了解项目
2. 学习 **[Linux 基础](./linux/README.md)** 和 **[常用命令](./linux/linux.md)**
3. 掌握 **[Node.js 基础](./node/README.md)**

#### 2. 进阶学习路径
1. 深入 **[Linux 核心哲学](./linux/linux-core-philosophy-and-ops.md)** 和 **[高级应用指南](./linux/linux-advanced-guide.md)**
2. 学习 **[Node.js 高级应用](./node/node-advanced-guide.md)**
3. 研究 **[Electron](./electron-deep-analysis.md)** 或 **[NW.js](./nwjs-deep-analysis.md)**

#### 3. 架构决策路径
1. 阅读 **[Electron 与 NW.js 深度对比](./nwjs-vs-electron-deep-comparison.md)**
2. 了解 **[安全对比](./electron-vs-nwjs-security-analysis.md)**
3. 根据项目需求进行技术选型

### 快速查阅

| 任务 | 推荐文档 |
|------|---------|
| Linux 常用命令速查 | [linux.md](./linux/linux.md) |
| Linux 高级配置 | [linux-advanced-guide.md](./linux/linux-advanced-guide.md) |
| Node.js 性能调优 | [node-advanced-guide.md](./node/node-advanced-guide.md) |
| Electron/NW.js 选型 | [nwjs-vs-electron-deep-comparison.md](./nwjs-vs-electron-deep-comparison.md) |
| 安全研究 | [electron-security-research-blogs.md](./electron-security-research-blogs.md) |
| 服务器部署 | [nginx.md](./nginx.md), [frps.md](./frps.md) |

---

## 文档贡献指南

### 文档格式要求

所有 Markdown 文档应遵循以下格式：

1. **Front Matter** - 文档元数据（可选）
   ```markdown
   ---
   icon: article
   category:
     - Serve
     - Guide
   tag:
     - linux
   ---
   ```

2. **标题层级** - 使用 `#` 到 `###` 清晰的层级结构

3. **代码示例** - 标注语言并格式正确
   ```javascript
   // 示例代码
   ```

4. **链接引用** - 使用相对路径引用内部文档

5. **目录索引** - 长篇文档需要包含目录

### 新增文档流程

1. 确定文档所属的技术领域
2. 选择合适的目录存放
3. 遵循格式规范编写内容
4. 在本文档中更新项目结构和索引

---

## 更新计划

### 已完成
- [x] Linux 基础与进阶文档
- [x] Node.js 基础与进阶文档
- [x] Electron / NW.js 深度分析
- [x] Electron / NW.js 对比研究
- [x] 安全研究资料汇总

### 计划中
- [ ] 更多服务器软件的配置指南
- [ ] 容器化技术（Docker / Kubernetes）
- [ ] 监控与可观测性
- [ ] CI/CD 最佳实践
- [ ] 更多中国操作系统分析

---

## 参考资源

### 官方文档
- [Linux 内核文档](https://www.kernel.org/doc/)
- [Node.js 官方文档](https://nodejs.org/docs/)
- [Electron 官方文档](https://www.electronjs.org/docs)
- [NW.js 官方文档](https://docs.nwjs.io/)

### 推荐书籍
- 《鸟哥的 Linux 私房菜》
- 《深入理解 Node.js》
- 《Electron 实战》

---

## 许可证

本文档遵循项目整体许可证。

---

*最后更新: 2026年7月*
