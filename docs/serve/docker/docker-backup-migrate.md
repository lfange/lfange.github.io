---
title: Docker 备份与迁移
icon: docker
category:
  - Serve
  - Docker
tag:
  - docker
  - 备份
  - 迁移
---

# Docker 备份与迁移

> 服务器上的 Docker 环境（镜像、数据卷、配置）如何完整备份到本地、再恢复到另一台机器？本篇给出可落地的完整流程与自动化脚本。

---

## 目录

1. [备份思路：要备份什么](#备份思路要备份什么)
2. [镜像备份与传输](#镜像备份与传输)
3. [数据卷备份与传输](#数据卷备份与传输)
4. [容器配置备份](#容器配置备份)
5. [完整备份到本地的流程](#完整备份到本地的流程)
6. [从本地恢复到服务器](#从本地恢复到服务器)
7. [自动化备份脚本](#自动化备份脚本)

---

## 备份思路：要备份什么

把服务器上的 Docker 环境完整迁移到本地，需备份三类内容：

| 备份对象 | 工具/方式 | 说明 |
| -------- | --------- | ---- |
| 镜像 | `docker save` / `docker load` | 导出为 tar 文件 |
| 数据卷 | 临时容器 + `tar` | 数据库等持久化数据，最关键 |
| 容器配置 | `compose.yml`、`.env`、`Dockerfile` | 声明式配置 |

**原则**：容器本身不建议「整体备份」--容器是临时实例，应通过「镜像 + 配置 + 数据卷」组合恢复。若确需保存某容器当前状态，用 `docker commit` 固化为镜像再导出。

---

## 镜像备份与传输

### 1. 在服务器上导出镜像

```bash
# 导出单个镜像为 tar
docker save -o nginx-1.25.tar nginx:1.25
# 导出多个镜像到一个 tar
docker save -o app-images.tar myapp:1.0 nginx:1.25 mysql:8
# 用 gzip 压缩（推荐）
docker save myapp:1.0 | gzip > myapp-1.0.tar.gz

ls -lh nginx-1.25.tar
```

`docker save` 保留镜像的分层结构与标签信息，适合完整迁移。

### 2. 传输到本地

```bash
# 方式一：scp（在本地终端执行，从服务器拉取）
scp user@server:/path/to/nginx-1.25.tar ./backup/

# 方式二：rsync（支持断点续传，大文件推荐）
rsync -avz --progress user@server:/path/to/nginx-1.25.tar ./backup/
```

### 3. 在本地加载镜像

```bash
docker load -i nginx-1.25.tar
docker load -i myapp-1.0.tar.gz
docker images
```

> `docker save`/`docker load` 操作**镜像**，保留分层历史与标签，推荐用于备份迁移。
> `docker export`/`docker import` 操作**容器文件系统**，拍平为单层，丢失历史与元数据，仅用于特殊场景。

---

## 数据卷备份与传输

数据卷不能用 `docker save` 备份，需借助一个临时容器挂载该卷，将数据打包出来。

### 1. 备份命名数据卷

```bash
# 用临时容器把卷 my-vol 的内容打包为 tar，输出到当前目录
docker run --rm \
  -v my-vol:/data:ro \
  -v $(pwd):/backup \
  alpine tar cvf /backup/my-vol.tar -C /data .

# 加 gzip 压缩（数据量大时推荐）
docker run --rm \
  -v my-vol:/data:ro \
  -v $(pwd):/backup \
  alpine tar czf /backup/my-vol.tar.gz -C /data .
```

参数说明：

- `--rm`：容器执行完自动删除，不留痕迹。
- `-v my-vol:/data:ro`：把要备份的卷以只读方式挂到容器的 `/data`。
- `-v $(pwd):/backup`：把宿主当前目录挂到容器的 `/backup`，用于输出 tar 文件。
- `-C /data`：切换到 `/data` 目录后再打包，避免 tar 包内含冗长的绝对路径。

### 2. 备份目录挂载（bind mount）

如果数据是直接挂载的宿主目录（如 `-v /data/mysql:/var/lib/mysql`），无需临时容器，直接打包宿主目录：

```bash
tar czf /tmp/mysql-data.tar.gz -C /data mysql
```

### 3. 传输到本地

```bash
scp user@server:/path/to/my-vol.tar.gz ./backup/
```

### 4. 数据库卷的注意事项

MySQL、PostgreSQL 等数据库**不建议直接拷贝裸数据文件**（可能因缓存未落盘导致文件不一致），更稳妥的方式是先做逻辑导出再传输：

```bash
# MySQL：逻辑备份
docker exec my-mysql sh -c 'mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --all-databases' \
  > all-db.sql
# PostgreSQL：逻辑备份
docker exec my-pg sh -c 'pg_dumpall -U postgres' > all-db.sql
# 传输到本地
scp user@server:/path/to/all-db.sql ./backup/
```

> 物理卷备份（tar 打包）适合文件型数据或停机状态下的数据库；运行中的数据库优先用逻辑导出（dump）。

---

## 容器配置备份

容器的「配置」即如何运行它，这部分最容易备份也最该备份。

### 1. 备份 Compose 文件

```bash
# 服务器上 compose 项目目录通常包含
#   compose.yml
#   .env              环境变量（含密码，注意安全）
#   Dockerfile        自构建镜像时
#   nginx.conf        等挂载进容器的配置文件

# 整个目录打包
tar czf /tmp/compose-project.tar.gz /opt/myapp/
# 传输到本地（本地执行）
scp user@server:/tmp/compose-project.tar.gz ./backup/
```

### 2. 导出运行中容器的配置（无 compose 文件时）

若容器是用 `docker run` 一条条起的，没有 compose 文件，可导出其配置辅助重建：

```bash
# 提取关键信息：镜像、端口、挂载、环境变量、重启策略
docker inspect my-nginx \
  --format '镜像: {{.Config.Image}}
端口: {{.NetworkSettings.Ports}}
挂载: {{.Mounts}}
重启策略: {{.HostConfig.RestartPolicy.Name}}'
```

> 也可用 `runlike` 工具从容器反推 `docker run` 命令：`pip install runlike && runlike my-nginx`。

### 3. 保存容器当前状态为镜像

若容器内做过手动修改想保留，先 commit 为镜像再 save 导出：

```bash
docker commit my-nginx my-nginx-custom:1.0
docker save -o my-nginx-custom.tar my-nginx-custom:1.0
```

> `docker commit` 会丢失数据卷和部分上下文，仅作应急；生产应坚持用 Dockerfile 构建。

---

## 完整备份到本地的流程

将服务器上一个 compose 项目的全部内容备份到本地，标准流程：

### 第一步：服务器上停服务（保证数据一致）

```bash
cd /opt/myapp
docker compose stop          # 停止容器但保留容器（不 down，便于排查）
# 或 docker compose down     # 停止并删除容器（数据卷保留）
```

> 数据库若追求一致性，停服务前先做逻辑 dump。

### 第二步：备份镜像

```bash
# 导出 compose 用到的所有镜像
docker save -o /tmp/myapp-images.tar \
  $(docker compose config | awk '{if($1=="image:") print $2}' | sort -u)
```

### 第三步：备份数据卷

```bash
# 对每个命名卷打包（示例：web-data、db-data）
for vol in web-data db-data; do
  docker run --rm -v $vol:/data:ro -v /tmp:/backup \
    alpine tar czf /backup/$vol.tar.gz -C /data .
done
```

### 第四步：备份配置目录

```bash
tar czf /tmp/myapp-config.tar.gz -C /opt myapp
```

### 第五步：传输到本地

```bash
# 在本地终端执行，一次性拉取所有备份
mkdir -p ./docker-backup/myapp
scp user@server:/tmp/myapp-images.tar ./docker-backup/myapp/
scp user@server:/tmp/web-data.tar.gz ./docker-backup/myapp/
scp user@server:/tmp/db-data.tar.gz ./docker-backup/myapp/
scp user@server:/tmp/myapp-config.tar.gz ./docker-backup/myapp/

# 或用 rsync 一次同步
rsync -avz --progress user@server:/tmp/ ./docker-backup/myapp/
```

### 第六步：本地验证完整性

```bash
cd ./docker-backup/myapp
# 加载镜像确认可用
docker load -i myapp-images.tar
docker images | grep myapp
# 检查 tar 包未损坏
gzip -t db-data.tar.gz && echo "数据卷包完整"
```

---

## 从本地恢复到服务器

### 1. 传输备份到新服务器

```bash
scp -r ./docker-backup/myapp user@newserver:/opt/
```

### 2. 加载镜像

```bash
cd /opt/myapp
docker load -i myapp-images.tar
```

### 3. 解压配置

```bash
tar xzf myapp-config.tar.gz -C /opt
cd /opt/myapp
```

### 4. 还原数据卷

```bash
# 先用 compose 创建空卷（启动一次即可创建）
docker compose up -d
docker compose stop

# 用临时容器把备份数据灌入卷
docker run --rm \
  -v web-data:/data \
  -v $(pwd):/backup \
  alpine sh -c 'cd /data && tar xzf /backup/web-data.tar.gz'

docker run --rm \
  -v db-data:/data \
  -v $(pwd):/backup \
  alpine sh -c 'cd /data && tar xzf /backup/db-data.tar.gz'
```

### 5. 启动服务并验证

```bash
docker compose up -d
docker compose ps
docker compose logs -f --tail=50
```

---

## 自动化备份脚本

服务器侧定时备份脚本 `/opt/backup-docker.sh`：

```bash
#!/bin/bash
set -e
BACKUP_DIR=/data/docker-backup
DATE=$(date +%Y%m%d-%H%M)
PROJECT_DIR=/opt/myapp
KEEP_DAYS=7

mkdir -p $BACKUP_DIR
cd $PROJECT_DIR

# 1. 备份镜像
IMAGES=$(docker compose config 2>/dev/null | awk '{if($1=="image:") print $2}' | sort -u)
docker save -o $BACKUP_DIR/images-$DATE.tar $IMAGES

# 2. 备份数据卷
VOLUMES=$(docker compose config 2>/dev/null | awk '{if($1=="volumes:") print $2}')
for vol in $VOLUMES; do
  docker run --rm -v $vol:/data:ro -v $BACKUP_DIR:/backup \
    alpine tar czf /backup/$vol-$DATE.tar.gz -C /data .
done

# 3. 备份配置目录
tar czf $BACKUP_DIR/config-$DATE.tar.gz -C /opt myapp

# 4. 清理过期备份
find $BACKUP_DIR -name "*.tar*" -mtime +$KEEP_DAYS -delete

echo "[$DATE] 备份完成: $BACKUP_DIR"
ls -lh $BACKUP_DIR/*-$DATE.tar*
```

加 cron 定时（每天凌晨 3 点）：

```bash
chmod +x /opt/backup-docker.sh
# crontab -e
0 3 * * * /opt/backup-docker.sh >> /var/log/docker-backup.log 2>&1
```

本地定期从服务器拉取备份：

```bash
# 本地 crontab，每天 4 点拉取最新备份
0 4 * * * rsync -avz user@server:/data/docker-backup/ /local/docker-backup/
```

---

## 小结

- 备份三件套：**镜像**（save/load）+ **数据卷**（临时容器 tar）+ **配置**（compose 目录）。
- 容器不整体备份，靠「镜像 + 配置 + 卷」重组。
- 数据库优先用 `mysqldump`/`pg_dump` 逻辑导出，别直接 tar 裸文件。
- 完整流程：停服务 -> 备份镜像/卷/配置 -> scp 传输 -> 本地 load 验证。
- 恢复：load 镜像 -> 临时容器灌卷数据 -> compose up。
- 定时备份 + 异地拉取，保证可恢复。

> 回到系列首页：[Docker 系列](./README.md)
