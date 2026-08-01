---
title: Docker 进阶与生产实践
icon: docker
category:
  - Serve
  - Docker
tag:
  - docker
  - 进阶
  - 生产实践
  - 安全
---

# Docker 进阶与生产实践

> 本篇面向上生产：深入理解容器网络与存储、做好安全加固与资源限制、管好日志与监控。读完你能把 Docker 安全稳定地跑在生产环境。

---

## 目录

1. [网络深入](#网络深入)
2. [存储深入](#存储深入)
3. [安全加固](#安全加固)
4. [资源限制](#资源限制)
5. [日志管理](#日志管理)
6. [监控](#监控)
7. [性能调优](#性能调优)
8. [生产编排选型](#生产编排选型)
9. [生产部署检查清单](#生产部署检查清单)

---

## 网络深入

### 网络驱动

| 驱动 | 适用场景 | 说明 |
| ---- | ---- | ---- |
| `bridge` | 默认，单机容器通信 | 软件网桥 docker0，NAT 出网 |
| `host` | 需要最高网络性能 | 容器直接用宿主网络栈，无隔离 |
| `none` | 完全隔离 | 仅 lo 接口 |
| `overlay` | 多机容器通信（Swarm） | 跨主机虚拟网络 |
| `macvlan` | 容器需要独立 MAC/IP | 容器像物理机一样接入局域网 |

### 默认 bridge vs 自定义 bridge

| | 默认 bridge（docker0） | 自定义 bridge |
| ---- | ---- | ---- |
| 容器名解析 | ❌ 只能用 IP | ✅ 可用容器名（内置 DNS） |
| 隔离性 | 所有容器同网段 | 按网络分组隔离 |
| 配置 | 自动 | 手动创建 |

```bash
# 创建自定义网络
docker network create app-net
# 启动容器加入网络
docker run -d --name db --network app-net mysql:8
docker run -d --name web --network app-net nginx
# web 容器内可用 mysql -h db 连接数据库
```

### 端口绑定与来源限制

```bash
# 默认绑定 0.0.0.0，公网可访问
docker run -p 80:80 nginx

# 仅本机可访问（安全）
docker run -p 127.0.0.1:80:80 nginx

# 仅特定 IP 可访问
docker run -p 192.168.1.100:80:80 nginx
```

> 生产建议：内部服务（数据库、缓存）不映射端口，只通过自定义网络内互联；对外服务用反向代理（nginx/traefik）统一入口。

### 跨主机通信

- **简单方案**：每台机跑容器，前置负载均衡，服务间通过宿主端口通信。
- **Swarm overlay**：Docker 自带，`docker swarm init` 后创建 overlay 网络跨机互联。
- **Kubernetes**：大规模集群的标准方案，Pod 网络跨节点互通。

---

## 存储深入

### 三种存储方式对比

| 方式 | 命令 | 数据位置 | 性能 | 适用 |
| ---- | ---- | ---- | ---- | ---- |
| 命名卷 volume | `-v myvol:/data` | Docker 管理（/var/lib/docker/volumes） | 好 | 持久数据，推荐 |
| 绑定挂载 bind mount | `-v /host:/data` | 宿主指定路径 | 好 | 开发挂代码、配置文件 |
| tmpfs | `--tmpfs /data` | 内存 | 极快 | 敏感临时数据，重启即丢 |

### 命名卷 vs bind mount

```bash
# 命名卷：Docker 管理生命周期，跨平台，权限由 Docker 处理
docker volume create db-data
docker run -v db-data:/var/lib/mysql mysql

# bind mount：直接挂宿主目录，路径强耦合，权限可能冲突
docker run -v /data/mysql:/var/lib/mysql mysql
```

> 生产优先用命名卷；需要直接编辑配置文件或挂源码时用 bind mount。

### 存储驱动

Docker 用存储驱动管理镜像分层与容器可写层，默认 `overlay2`：

```bash
docker info | grep "Storage Driver"
```

`overlay2` 性能最好，是当前默认。早期还有 `aufs`、`devicemapper`，已不推荐。一般无需改动。

### 数据卷的备份

数据卷不能用 `docker save` 备份，需用临时容器打包（详见[备份迁移篇](./docker-backup-migrate.md)）：

```bash
docker run --rm -v db-data:/data:ro -v $(pwd):/backup \
  alpine tar czf /backup/db.tar.gz -C /data .
```

---

## 安全加固

容器默认隔离弱于虚拟机（共享内核），生产环境必须加固。

### 1. 非 root 用户运行

```dockerfile
# Dockerfile 中
RUN groupadd -r app && useradd -r -g app app
USER app
```

```bash
# 或运行时指定
docker run --user 1000:1000 nginx
```

### 2. 只读文件系统

```bash
# 文件系统只读，仅挂载的卷可写
docker run --read-only --tmpfs /tmp nginx
```

### 3. 裁剪 capabilities

容器默认拥有部分 root capabilities。按需删除：

```bash
# 删除所有，再按需添加
docker run --cap-drop ALL --cap-add NET_BIND_SERVICE nginx
```

### 4. 禁用特权模式

```bash
# ❌ 危险：特权模式等于 root
docker run --privileged mysql

# ✅ 按需授权
docker run --cap-add SYS_NICE mysql
```

> `--privileged` 让容器几乎拥有宿主所有权限，生产严禁使用，除非特殊设备访问需求。

### 5. 资源限制

防止容器吃光宿主资源（见下节）。

### 6. 使用 seccomp / AppArmor

Docker 默认启用 seccomp 默认策略，限制危险系统调用。可用自定义策略进一步收紧。

### 7. 镜像安全

- 只用可信镜像（官方或私有仓库），不随便 `docker pull` 陌生人镜像。
- 定期扫描镜像漏洞：

```bash
# Trivy 扫描
trivy image myapp:1.0
# docker scout（Docker 官方）
docker scout cves myapp:1.0
```

- 不在镜像里硬编码密钥/密码，用 secrets 或环境变量注入。

### 8. 守护进程安全

- 不要把用户加入 docker 组（等价 root）。
- 开启 Docker 守护进程的 TLS（远程 API 认证）。
- 不要把 Docker socket（`/var/run/docker.sock`）挂给不可信容器。

---

## 资源限制

防止单个容器耗尽宿主 CPU/内存影响其他服务。

### 运行时限制

```bash
# 内存限制
docker run --memory=512m --memory-swap=1g myapp

# CPU 限制
docker run --cpus=1.5 myapp            # 最多用 1.5 核
docker run --cpuset-cpus=0,1 myapp     # 绑定到 0、1 号核

# CPU 优先级（权重，默认 1024）
docker run --cpu-shares=512 myapp

# IO 限制
docker run --device-read-bps=/dev/sda:10mb myapp
```

### Compose 中限制

```yaml
services:
  api:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:    # 保留（保底）
          memory: 256M
```

### OOM 处理

容器内存超限会被 OOM Killer 杀死（exit code 137）。重要容器可调高 OOM 优先级：

```bash
# --oom-score-adj 越低越不容易被杀（-1000 到 1000）
docker run --oom-score-adj=-500 mysql
```

---

## 日志管理

容器日志默认写到 json-file，**不轮转会撑爆磁盘**--这是生产常见故障。

### 配置日志轮转

```bash
# 单容器
docker run \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  nginx
```

```yaml
# Compose
services:
  web:
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"
```

### 全局默认轮转

编辑 `/etc/docker/daemon.json`，对所有容器生效：

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

```bash
sudo systemctl restart docker
```

### 集中式日志

生产推荐把日志统一收集到外部系统：

| 方案 | 说明 |
| ---- | ---- |
| `--log-driver fluentd` | 直接发到 Fluentd |
| `--log-driver syslog` | 发到 syslog |
| `--log-driver gelf` | 发到 Graylog/ELK |
| 文件挂载 + Filebeat | 容器写文件，Filebeat 采集到 ELK |

---

## 监控

### 基础：docker stats

```bash
docker stats                 # 实时，所有容器
docker stats --no-stream     # 单次快照
```

局限：只能看实时，无历史，无告警。

### cAdvisor + Prometheus + Grafana

标准开源监控栈：

- **cAdvisor**：采集容器指标（CPU/内存/网络/IO），由 Google 出品。
- **Prometheus**：时序数据库，定期拉取 cAdvisor 指标。
- **Grafana**：可视化面板。

```yaml
# 监控栈 compose 示例
services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker:/var/lib/docker:ro
    ports:
      - "8080:8080"

  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

### 健康检查与自动重启

```yaml
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/3000/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    restart: unless-stopped
```

 unhealthy 容器配合 `restart: unless-stopped` 可被自动重启（需 `autoheal` 类工具才会在 unhealthy 时强制重启）。

---

## 性能调优

1. **镜像层缓存**：构建时利用缓存，变动少的在前（见 [Dockerfile 篇](./dockerfile-guide.md)）。
2. **小镜像**：alpine + 多阶段构建，拉取快、攻击面小。
3. **存储驱动**：用 `overlay2`，确保宿主用 xfs/ext4。
4. **日志轮转**：必配，防磁盘满。
5. **资源限制**：防 noisy neighbor，保证关键服务资源。
6. **网络**：高性能场景用 `host` 网络（牺牲隔离）；多服务用自定义 bridge。
7. **Volume 性能**：命名卷优于 bind mount（bind mount 跨文件系统可能有性能损失）。
8. **减少容器数**：一个容器一个进程是原则，但同类轻量任务可合理合并。
9. **及时清理**：定期 `docker system prune` 清理无用镜像/容器/缓存。

```bash
# 查看磁盘占用
docker system df -v
```

---

## 生产编排选型

| 方案 | 适用规模 | 复杂度 | 说明 |
| ---- | ---- | ---- | ---- |
| Docker Compose | 单机 / 小规模 | 低 | 一台机器，简单可靠 |
| Docker Swarm | 中小规模多机 | 中 | Docker 内置，学习成本低 |
| Kubernetes | 大规模 / 生产标准 | 高 | 行业标准，生态丰富 |

- 个人项目、内部工具、单机部署：**Compose 足够**。
- 几台机器做高可用、不想上 K8s：**Swarm**。
- 公司级生产、需要弹性伸缩、滚动发布、服务网格：**Kubernetes**。

> 选型原则：用能解决问题的最简方案。不要为了用 K8s 而 K8s，单机 Compose 能搞定的事上 K8s 是过度工程。

---

## 生产部署检查清单

### 镜像与构建
- [ ] 固定镜像版本，不用 `latest`
- [ ] 用多阶段构建，镜像尽量小
- [ ] 非 root 用户运行
- [ ] 镜像扫描无高危漏洞
- [ ] 镜像里无硬编码密钥

### 配置与编排
- [ ] 所有服务配 `restart: unless-stopped`
- [ ] 配 `healthcheck`
- [ ] 配日志轮转（`max-size` / `max-file`）
- [ ] 数据库等内部服务不暴露端口
- [ ] `depends_on` 用 `service_healthy`

### 数据
- [ ] 持久数据用命名卷，不依赖容器可写层
- [ ] 数据卷定期备份（见 [备份迁移篇](./docker-backup-migrate.md)）
- [ ] 敏感配置用 `.env` 或 secrets，`.env` 不入库

### 安全
- [ ] 不用 `--privileged`
- [ ] 裁剪 capabilities（`--cap-drop ALL`）
- [ ] 不挂 Docker socket 给不可信容器
- [ ] 用户不加入 docker 组（或限定可信任用户）
- [ ] 对外端口最小化

### 资源
- [ ] 配 CPU/内存限制
- [ ] 关键服务调高 OOM 优先级

### 监控运维
- [ ] 接入监控（cAdvisor + Prometheus + Grafana）
- [ ] 日志集中收集
- [ ] 定期清理无用镜像/容器
- [ ] 有回滚方案（保留上一版本镜像）

---

## 小结

- 网络用自定义 bridge（容器名互连），内部服务不暴露端口。
- 持久数据用命名卷，定期备份。
- 安全：非 root、只读 FS、裁剪 cap、禁特权、扫漏洞、不挂 socket。
- 资源限制防容器互相影响；日志必配轮转防磁盘满。
- 监控用 cAdvisor + Prometheus + Grafana 标准栈。
- 编排选型：能 Compose 就别上 K8s。

下一篇：[Docker 备份与迁移](./docker-backup-migrate.md) 确保数据可备份、可恢复、可迁移。
