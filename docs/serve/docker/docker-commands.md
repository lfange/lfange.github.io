---
title: Docker 常用命令详解
icon: docker
category:
  - Serve
  - Docker
tag:
  - docker
  - 命令
---

# Docker 常用命令详解

> 本篇系统整理 Docker 日常运维的全部常用命令，按「镜像 / 容器 / 数据卷 / 网络 / 系统」分类，附参数说明与速查表，可作为案头手册随时查阅。

---

## 目录

1. [命令总览](#命令总览)
2. [镜像命令](#镜像命令)
3. [容器命令](#容器命令)
4. [数据卷命令](#数据卷命令)
5. [网络命令](#网络命令)
6. [系统管理命令](#系统管理命令)
7. [命令速查表](#命令速查表)

---

## 命令总览

Docker 命令格式：`docker [选项] 命令 [参数]`。新版 Docker 也支持 `docker 对象 子命令` 形式（如 `docker image ls` 等价 `docker images`）。

```bash
# 查看所有命令
docker --help
docker help run          # 查看 run 的详细用法
docker man docker-run    # 查看完整手册
```

---

## 镜像命令

```bash
# 搜索镜像
docker search nginx
docker search --limit 5 nginx       # 限制结果数

# 拉取镜像
docker pull nginx                    # 默认 latest
docker pull nginx:1.25               # 指定版本
docker pull myrepo/myapp:1.0         # 私有仓库

# 列出本地镜像
docker images                        # 等价 docker image ls
docker images -a                     # 含中间层
docker images --filter "dangling=true"  # 悬空镜像

# 删除镜像
docker rmi nginx:1.25                # 删除指定镜像
docker rmi -f nginx:1.25             # 强制删除（即使有容器依赖）
docker image prune                   # 删除悬空镜像
docker image prune -a                # 删除所有未被容器使用的镜像

# 构建镜像
docker build -t myapp:1.0 .          # -t 名称:标签，. 为构建上下文
docker build -t myapp:1.0 -f Dockerfile.prod .  # -f 指定 Dockerfile
docker build --no-cache -t myapp:1.0 .           # 不用缓存

# 给镜像打标签
docker tag myapp:1.0 myrepo/myapp:latest

# 推送到仓库
docker push myrepo/myapp:1.0

# 查看镜像分层历史
docker history nginx:1.25

# 查看镜像元数据
docker inspect nginx:1.25

# 导出 / 导入镜像（备份迁移用，详见备份篇）
docker save -o app.tar myapp:1.0     # 导出为 tar
docker load -i app.tar               # 从 tar 导入
```

> `latest` 是默认标签，但**不代表最新**，只是一个普通标签名。生产环境务必指定明确版本号，避免 `latest` 指向漂移导致行为变化。

---

## 容器命令

### 创建与运行

```bash
# 核心命令：docker run
docker run [选项] 镜像 [命令]
```

常用选项：

| 选项 | 含义 |
| ---- | ---- |
| `-d` | 后台运行 |
| `-it` | 交互式 + 分配终端（常用于进入 shell） |
| `--name` | 容器名 |
| `-p 宿主:容器` | 端口映射 |
| `-P` | 随机映射所有暴露端口 |
| `-v 宿主:容器[:ro]` | 挂载目录/数据卷，`:ro` 只读 |
| `-e KEY=VAL` | 环境变量 |
| `--env-file` | 从文件读取环境变量 |
| `--network` | 加入指定网络 |
| `--restart` | 重启策略：`no` / `always` / `unless-stopped` / `on-failure` |
| `--rm` | 容器退出后自动删除 |
| `--memory` / `--cpus` | 资源限制 |
| `-w` | 工作目录 |
| `--entrypoint` | 覆盖入口点 |

```bash
# 综合示例
docker run -d \
  --name web \
  -p 80:80 \
  -p 443:443 \
  -v /data/nginx/conf:/etc/nginx/conf.d:ro \
  -v /data/nginx/html:/usr/share/nginx/html \
  -e NGINX_HOST=example.com \
  --restart unless-stopped \
  nginx:1.25

# 交互式进入并退出即删
docker run -it --rm ubuntu:22.04 /bin/bash
```

### 查看与进入

```bash
# 查看运行中容器
docker ps
# 查看所有容器（含已停止）
docker ps -a
# 只显示容器 ID
docker ps -q
# 按状态过滤
docker ps -f "status=exited"

# 进入运行中的容器（推荐 exec，退出不导致容器停止）
docker exec -it web /bin/bash
docker exec -it web sh            # 镜像无 bash 时用 sh
# 执行单条命令
docker exec web cat /etc/hostname
```

### 生命周期

```bash
# 启动 / 停止 / 重启 / 暂停 / 恢复
docker start web
docker stop web
docker restart web
docker pause web
docker unpause web

# 停止所有运行中的容器
docker stop $(docker ps -q)

# 删除容器
docker rm web                      # 需先停止
docker rm -f web                   # 强制删除运行中的
docker rm $(docker ps -aq -f "status=exited")  # 删除所有已停止容器
docker container prune             # 同上
```

### 日志与状态

```bash
# 日志
docker logs web
docker logs -f web                 # 实时跟踪
docker logs --tail 100 web         # 末尾 100 行
docker logs --since 30m web        # 最近 30 分钟
docker logs -t web                 # 显示时间戳

# 资源占用（动态刷新，类似 top）
docker stats
docker stats --no-stream web       # 单次输出

# 详细信息
docker inspect web
docker inspect web --format '{{.NetworkSettings.IPAddress}}'  # 取特定字段

# 容器内进程
docker top web
# 端口映射
docker port web
```

### 文件拷贝与文件系统

```bash
# 宿主 <-> 容器拷贝
docker cp /local/file.txt web:/app/
docker cp web:/app/log.txt /local/

# 查看容器文件系统改动（相对于镜像）
docker diff web
# 导出容器文件系统为 tar（拍平，丢失分层，慎用）
docker export web -o web.tar
docker import web.tar my-image:1.0
```

### 提交容器为镜像（应急）

```bash
# 将容器当前状态固化为新镜像
docker commit -m "装了curl" -a "lfange" web my-nginx:1.1
```

> `docker commit` 会丢失数据卷和部分元数据，仅作应急；生产应坚持用 Dockerfile 构建。

---

## 数据卷命令

```bash
# 创建
docker volume create my-vol
# 列出
docker volume ls
# 详情（含宿主真实路径）
docker volume inspect my-vol
# 删除
docker volume rm my-vol
docker volume prune              # 删除所有未使用的卷（慎用，丢数据）

# 使用：在 run 时挂载
docker run -d -v my-vol:/data nginx:1.25          # 命名卷
docker run -d -v /data/mysql:/var/lib/mysql mysql # bind mount 宿主目录
```

数据卷三种挂载方式区别：

| 方式 | 命令 | 特点 |
| ---- | ---- | ---- |
| 命名卷（volume） | `-v my-vol:/data` | Docker 管理，独立于容器，推荐 |
| 绑定挂载（bind mount） | `-v /host/path:/data` | 直接挂宿主目录，路径耦合，便于开发调试 |
| 临时卷（tmpfs） | `--tmpfs /data` | 存内存中，容器停止即丢，适合敏感数据 |

---

## 网络命令

```bash
# 列出网络
docker network ls
# 创建网络
docker network create my-net
docker network create --driver bridge my-net
# 详情
docker network inspect my-net
# 连接 / 断开容器
docker network connect my-net web
docker network disconnect my-net web
# 删除
docker network rm my-net
docker network prune
```

Docker 默认三类网络：

| 网络 | 说明 |
| ---- | ---- |
| `bridge` | 默认，docker0 网桥，容器间通过 NAT 通信 |
| `host` | 容器直接用宿主网络栈，无隔离，性能最高 |
| `none` | 无网络，仅 lo 接口 |

> 同一自定义 bridge 网络内容器可用**容器名互相解析**（内置 DNS），如 `docker run --network my-net --name db` 后，同网络的 web 容器可用 `db` 作为主机名连接。默认 bridge 网络无此能力。

---

## 系统管理命令

```bash
# 查看 Docker 整体信息
docker info
# 查看磁盘占用
docker system df
docker system df -v              # 详细

# 清理
docker system prune              # 清理停止的容器、无用网络、悬空镜像、构建缓存
docker system prune -a           # 连同未使用的镜像一起删
docker system prune -a --volumes # 连同未使用的数据卷（丢数据！）

# 事件流（实时监听容器生命周期事件）
docker events
docker events --filter type=container
```

各对象独立清理命令：

```bash
docker container prune    # 已停止容器
docker image prune -a     # 未使用镜像
docker volume prune       # 未使用卷（慎）
docker network prune      # 未使用网络
docker builder prune      # 构建缓存
```

---

## 命令速查表

| 场景 | 命令 |
| ---- | ---- |
| 拉镜像 | `docker pull nginx:1.25` |
| 列镜像 | `docker images` |
| 删镜像 | `docker rmi nginx:1.25` |
| 构建镜像 | `docker build -t app:1.0 .` |
| 运行容器 | `docker run -d --name web -p 80:80 nginx` |
| 进入容器 | `docker exec -it web bash` |
| 看容器 | `docker ps` / `docker ps -a` |
| 看日志 | `docker logs -f --tail 100 web` |
| 看资源 | `docker stats` |
| 停 / 起 / 重启 | `docker stop/start/restart web` |
| 删容器 | `docker rm -f web` |
| 看详情 | `docker inspect web` |
| 拷文件 | `docker cp web:/app/x ./` |
| 创建卷 | `docker volume create my-vol` |
| 创建网络 | `docker network create my-net` |
| 看磁盘 | `docker system df` |
| 一键清理 | `docker system prune -a` |
| 查端口 | `docker port web` |
| 导出镜像 | `docker save -o app.tar app:1.0` |
| 导入镜像 | `docker load -i app.tar` |

---

## 小结

- 镜像命令围绕 `pull / images / rmi / build / save / load`。
- 容器命令围绕 `run / ps / exec / logs / start / stop / rm`。
- 重要数据用命名卷 `-v`，不要依赖容器可写层。
- 自定义网络让容器间可用容器名互连。
- `docker system prune` 一键清理，但 `--volumes` 会删数据，慎用。

下一篇：[Dockerfile 与镜像构建](./dockerfile-guide.md) 学会把应用打包成镜像。
