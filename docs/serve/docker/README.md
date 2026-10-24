---
title: Docker 系列
icon: docker
category:
  - Serve
  - Docker
tag:
  - docker
  - 容器
---

# Docker 系列

> 从零入门到生产实践，系统掌握 Docker 容器技术。本系列按「概念 → 命令 → 构建 → 编排 → 进阶 → 备份」的顺序递进，可顺序学习，也可按需查阅。

---

## 学习路径

| 阶段 | 文档 | 内容 |
| :--: | ---- | ---- |
| 入门 | [Docker 入门](./docker-getting-started.md) | 什么是 Docker、与虚拟机对比、核心概念、安装、第一个容器 |
| 基础 | [Docker 常用命令详解](./docker-commands.md) | 镜像 / 容器 / 数据卷 / 网络 / 系统命令与速查表 |
| 构建 | [Dockerfile 与镜像构建](./dockerfile-guide.md) | Dockerfile 指令、构建优化、多阶段构建、最佳实践 |
| 编排 | [Docker Compose 多容器编排](./docker-compose-guide.md) | compose.yml 结构、配置项、完整示例、环境管理 |
| 进阶 | [Docker 进阶与生产实践](./docker-advanced.md) | 网络深入、存储、安全加固、资源限制、日志、监控 |
| 运维 | [Docker 备份与迁移](./docker-backup-migrate.md) | 镜像 / 数据卷 / 配置的备份、传输、恢复与自动化 |

---

## 建议学习顺序

1. **先跑起来**：读《入门》，装好 Docker，成功运行第一个容器，建立直观感受。
2. **熟悉命令**：读《常用命令详解》，掌握镜像与容器的增删改查。
3. **会写镜像**：读《Dockerfile》，学会把自己的应用打包成镜像。
4. **多容器协作**：读《Compose》，用一份 yml 编排 web + db + 缓存。
5. **上生产**：读《进阶与生产实践》，搞定网络、安全、资源、监控。
6. **能兜底**：读《备份与迁移》，确保数据可备份、可恢复、可迁移。

---

## 适用读者

- 后端 / 前端工程师：想用 Docker 跑自己的项目、统一环境
- 运维工程师：需要部署、迁移、备份容器化服务
- 面试准备：Docker 是中高级后端 / 运维面试高频考点

> 本系列以实操为主，命令均可在 Linux 环境直接执行。Windows / macOS 用户建议使用 Docker Desktop，命令一致。
