---
title: Docker Compose 多容器编排
icon: docker
category:
  - Serve
  - Docker
tag:
  - docker
  - compose
  - 编排
---

# Docker Compose 多容器编排

> 一个真实应用往往由多个服务组成（web + db + cache）。Docker Compose 用一份 `compose.yml` 声明式定义所有服务及其依赖，一条命令拉起整个环境。本篇系统讲解配置项、命令与实战。

---

## 目录

1. [Compose 是什么](#compose-是什么)
2. [安装](#安装)
3. [compose.yml 结构](#composeyml-结构)
4. [常用配置项](#常用配置项)
5. [完整示例](#完整示例)
6. [环境变量管理](#环境变量管理)
7. [Profiles 分组](#profiles-分组)
8. [常用命令](#常用命令)
9. [最佳实践](#最佳实践)

---

## Compose 是什么

Docker Compose 是定义和运行多容器 Docker 应用的工具。核心思想：

- 用一份 YAML 描述所有服务、网络、数据卷。
- `docker compose up` 一键创建并启动全部。
- `docker compose down` 一键停止并清理。

适合：本地开发环境、CI/CD、中小型单机部署。大规模集群请用 Kubernetes。

> 新版 Docker 集成了 Compose，命令为 `docker compose`（空格）。旧版独立二进制为 `docker-compose`（连字符）。两者功能基本一致，推荐用 `docker compose`。

---

## 安装

```bash
# Docker Desktop（Win/Mac）自带 Compose
# Linux 安装 Docker 时若装了 docker-compose-plugin 即可用 docker compose

# 验证
docker compose version
```

旧版独立安装（可选）：

```bash
# 下载二进制
curl -SL https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64 \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

---

## compose.yml 结构

```yaml
# 顶层三大块：services / volumes / networks
services:
  web:
    image: nginx:1.25
    ports:
      - "80:80"
    volumes:
      - html:/usr/share/nginx/html
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: secret
    volumes:
      - db-data:/var/lib/mysql

volumes:
  html:
  db-data:

networks:
  default:
    driver: bridge
```

三个顶层键：

| 键 | 作用 |
| ---- | ---- |
| `services` | 定义各个容器服务（必填） |
| `volumes` | 声明命名数据卷 |
| `networks` | 声明网络 |

文件名优先级：`compose.yaml` > `compose.yml` > `docker-compose.yaml` > `docker-compose.yml`。可用 `-f` 指定。

---

## 常用配置项

### 服务配置项总览

| 配置 | 说明 |
| ---- | ---- |
| `image` | 使用的镜像 |
| `build` | 构建镜像（替代 image） |
| `ports` | 端口映射 |
| `volumes` | 挂载卷/目录 |
| `environment` / `env_file` | 环境变量 |
| `depends_on` | 依赖（启动顺序） |
| `restart` | 重启策略 |
| `networks` | 加入的网络 |
| `command` | 覆盖默认命令 |
| `entrypoint` | 覆盖入口点 |
| `working_dir` | 工作目录 |
| `user` | 运行用户 |
| `healthcheck` | 健康检查 |
| `deploy` | Swarm 部署配置（副本、资源限制） |
| `labels` | 标签 |
| `logging` | 日志配置 |

### build - 构建镜像

```yaml
services:
  web:
    build:
      context: ./web            # 构建上下文
      dockerfile: Dockerfile.prod
      args:                     # 构建参数
        VERSION: 1.0
    image: myapp:1.0            # 构建后镜像名
```

### ports - 端口

```yaml
ports:
  - "80:80"          # 宿主:容器
  - "443:443"
  - "3000"           # 仅容器端口，宿主随机
  - "127.0.0.1:8000:8000"  # 绑定到本地回环
```

### volumes - 挂载

```yaml
volumes:
  - db-data:/var/lib/mysql       # 命名卷
  - ./conf:/etc/nginx/conf.d:ro  # bind mount，只读
  - /tmp/cache:/tmp/cache
```

### environment / env_file

```yaml
# 直接写
environment:
  MYSQL_ROOT_PASSWORD: secret
  DEBUG: "true"

# 从文件读
env_file:
  - .env
  - .env.production
```

### depends_on - 启动顺序与健康检查

```yaml
services:
  web:
    depends_on:
      db:
        condition: service_healthy    # 等 db 健康才启动
  db:
    image: mysql:8
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
```

> `depends_on` 只控制启动顺序，不等待「就绪」。要等就绪，用 `condition: service_healthy` 配合 `healthcheck`。

### restart

```yaml
restart: unless-stopped    # 推荐：除非手动停止，否则总重启
# no / always / unless-stopped / on-failure
```

### networks

```yaml
services:
  web:
    networks:
      - frontend
  db:
    networks:
      - backend

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true       # 内部网络，不可访问外网
```

### deploy - 资源限制（Compose v2 / Swarm）

```yaml
deploy:
  replicas: 3                          # 副本数（Swarm 生效）
  resources:
    limits:
      cpus: '0.5'
      memory: 512M
    reservations:
      memory: 256M
  restart_policy:
    condition: on-failure
```

> 单机 `docker compose up` 下 `replicas` 不生效，但 `resources.limits` 在 Compose v2 中也作用于单机。

### logging - 日志

```yaml
logging:
  driver: json-file
  options:
    max-size: "10m"        # 单文件最大
    max-file: "3"          # 保留文件数
```

> 生产必配日志轮转，否则容器日志会撑爆磁盘。

---

## 完整示例

一个 web + api + db + cache 的典型项目：

```yaml
# compose.yml
services:
  web:
    image: nginx:1.25-alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./dist:/usr/share/nginx/html:ro
    depends_on:
      - api
    networks:
      - frontend
    restart: unless-stopped

  api:
    build: ./api
    image: myapp-api:1.0
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - REDIS_HOST=cache
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    networks:
      - frontend
      - backend
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M

  db:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
      MYSQL_DATABASE: app
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-uroot", "-p${DB_ROOT_PASSWORD}"]
      interval: 10s
      timeout: 5s
      retries: 5

  cache:
    image: redis:7-alpine
    volumes:
      - cache-data:/data
    networks:
      - backend
    restart: unless-stopped
    command: redis-server --appendonly yes

volumes:
  db-data:
  cache-data:

networks:
  frontend:
  backend:
    internal: true
```

```bash
docker compose up -d           # 启动全部
docker compose ps              # 查看状态
docker compose logs -f api     # 看 api 日志
```

注意：同网络内 `api` 服务用 `db`、`cache` 作为主机名连接（服务名即 DNS 名）。

---

## 环境变量管理

### .env 文件

Compose 自动读取同目录下的 `.env` 文件，用于变量插值：

```env
# .env
DB_ROOT_PASSWORD=secret
APP_PORT=8080
IMAGE_TAG=1.0
```

```yaml
# compose.yml 中用 ${VAR}
services:
  api:
    image: myapp:${IMAGE_TAG}
    ports:
      - "${APP_PORT}:3000"
  db:
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_ROOT_PASSWORD}
```

### 多环境

用 `-f` 叠加多个 compose 文件，后者覆盖前者：

```bash
# 基础 + 生产覆盖
docker compose -f compose.yml -f compose.prod.yml up -d
```

```yaml
# compose.prod.yml
services:
  api:
    environment:
      - NODE_ENV=production
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
```

或用 `--profile` 切换（见下）。

> ⚠️ `.env` 含密码，**必须加入 `.gitignore`**，不要提交到仓库。可提交 `.env.example` 作为模板。

---

## Profiles 分组

用 profile 按需启动部分服务，避免全量启动：

```yaml
services:
  web:
    image: nginx:1.25

  db:
    image: mysql:8

  # 仅调试时启动
  debug:
    image: busybox
    profiles: ["debug"]

  # 仅测试时启动
  test:
    image: myapp-test
    profiles: ["test"]
```

```bash
docker compose up -d                    # 启动无 profile 的服务（web、db）
docker compose --profile debug up -d    # 连同 debug 服务
docker compose --profile test run test  # 跑一次测试
```

---

## 常用命令

均在 compose 文件所在目录执行。

```bash
# 启动（-d 后台，--build 强制重建镜像）
docker compose up -d
docker compose up -d --build

# 停止并删除容器/网络（-v 连带删卷，慎用）
docker compose down
docker compose down -v

# 查看状态
docker compose ps
docker compose ps -a

# 日志
docker compose logs -f
docker compose logs -f --tail=100 api
docker compose logs --since 30m

# 进入容器 / 执行命令
docker compose exec api sh
docker compose exec db mysql -uroot -p

# 重启 / 停止 / 启动 单个服务
docker compose restart api
docker compose stop api
docker compose start api

# 重新构建
docker compose build
docker compose build --no-cache api

# 拉取最新镜像
docker compose pull

# 查看配置（合并后最终生效的 yml）
docker compose config

# 查看服务镜像
docker compose images
```

> 旧版 `docker-compose`（连字符）命令相同，新项目用 `docker compose`（空格）。

---

## 最佳实践

- ✅ 固定镜像版本，不用 `latest`
- ✅ 用 `.env` + `${VAR}` 管理密码，`.env` 加入 `.gitignore`
- ✅ 数据库服务配 `healthcheck`，业务服务 `depends_on: condition: service_healthy`
- ✅ 所有服务配 `restart: unless-stopped`
- ✅ 配 `logging` 日志轮转，防磁盘撑爆
- ✅ 内部服务用 `internal: true` 网络隔离，不暴露公网
- ✅ 用 `-f` 多文件或 `profiles` 区分开发/测试/生产
- ✅ 端口绑定公网服务用 `127.0.0.1:port:port` 限制来源
- ❌ 不要把数据库端口直接暴露到 0.0.0.0
- ❌ 不要 `down -v` 在生产（删卷丢数据）

---

## 小结

- Compose 用一份 yml 定义多服务、网络、卷，`up`/`down` 一键管理。
- 服务名即 DNS 名，同网络内可互连。
- `depends_on` + `healthcheck` 解决启动就绪问题。
- `.env` 管理敏感配置，多文件/profiles 区分环境。
- 生产必配：版本固定、重启策略、日志轮转、网络隔离。

下一篇：[Docker 进阶与生产实践](./docker-advanced.md) 深入网络、存储、安全与监控。
