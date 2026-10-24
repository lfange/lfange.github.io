---
title: Docker 入门
icon: docker
category:
  - Serve
  - Docker
tag:
  - docker
  - 入门
---

# Docker 入门

> 本篇解决三个问题：Docker 是什么、为什么要用它、怎么装好并跑起第一个容器。读完你能用 Docker 拉取镜像、启动容器、理解核心概念。

---

## 目录

1. [什么是 Docker](#什么是-docker)
2. [Docker vs 虚拟机](#docker-vs-虚拟机)
3. [核心概念](#核心概念)
4. [安装 Docker](#安装-docker)
5. [配置镜像加速器](#配置镜像加速器)
6. [第一个容器](#第一个容器)
7. [容器生命周期初体验](#容器生命周期初体验)

---

## 什么是 Docker

Docker 是一个**容器化平台**，它把应用及其依赖（代码、运行时、系统库、配置）打包到一个标准化的**容器**中，让应用能在任何环境中一致地运行。

一句经典比喻：

> **Build Once, Run Anywhere.** —— 一次构建，到处运行。

传统部署的痛点：在开发机能跑，到测试机/生产机就报错（「我电脑上没问题啊」）。根因是环境差异——操作系统版本、依赖库、配置不同。Docker 把应用和它需要的环境一起打包，从根本上消除「环境不一致」。

---

## Docker vs 虚拟机

| 对比项 | 虚拟机 | Docker 容器 |
| ------ | ------ | ----------- |
| 隔离级别 | 硬件级（虚拟出整套硬件 + 完整 OS） | 操作系统级（共享宿主内核，隔离进程） |
| 启动速度 | 分钟级（要启动整个 OS） | 秒级（直接启动进程） |
| 资源占用 | 重（每个 VM 几 GB，要跑完整 OS） | 轻（单个容器通常几十 MB） |
| 镜像体积 | GB 级 | MB 级 |
| 并发密度 | 一台机几十个 VM | 一台机几百上千个容器 |
| 隔离强度 | 强（独立内核） | 弱（共享内核） |

**关键区别**：虚拟机虚拟硬件、跑完整操作系统；容器共享宿主内核、只隔离进程与文件系统。所以容器更轻更快，但隔离性弱于虚拟机。

> Docker 不是轻量级虚拟机——它没有自己的内核。这也是为什么 Windows 镜像不能直接跑在 Linux 宿主上（内核不同）。

---

## 核心概念

掌握这 5 个概念，Docker 就理解了一半。

| 概念 | 说明 | 类比 |
| ---- | ---- | ---- |
| **镜像（Image）** | 只读模板，含应用运行所需的所有内容 | 面向对象里的「类」/ 安装光盘 |
| **容器（Container）** | 镜像运行的实例，可读写 | 面向对象里的「对象」/ 运行中的程序 |
| **数据卷（Volume）** | 独立于容器的持久化存储 | 外接硬盘 |
| **仓库（Registry）** | 存放镜像的地方 | 应用商店 |
| **网络（Network）** | 容器间通信的虚拟网络 | 局域网 |

### 镜像与容器的关系

```
镜像 (nginx:1.25)  ──docker run──>  容器1 (my-nginx)
                   ──docker run──>  容器2 (my-nginx-2)
                   ──docker run──>  容器3 (my-nginx-3)
```

- 一个镜像可以启动多个容器，互不影响。
- 容器停止后，其可写层（运行时产生的数据）默认保留，但**删除容器即丢失**——所以重要数据要放数据卷。
- 镜像是分层的（Layer），多个镜像可共享底层，节省空间。

### 数据卷的作用

容器的设计哲学是**临时性的**：随时可以删掉重建。但数据库的数据、上传的文件不能丢。数据卷就是把这部分数据从容器中剥离出来，独立存储，容器删了卷还在。

---

## 安装 Docker

### CentOS 7+

```bash
# 卸载旧版本
sudo yum remove docker docker-client docker-client-latest docker-common \
  docker-latest docker-latest-logrotate docker-logrotate docker-engine

# 安装 yum-utils 并添加官方源
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo \
  https://download.docker.com/linux/centos/docker-ce.repo

# 安装 Docker CE
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 启动并设置开机自启
sudo systemctl start docker
sudo systemctl enable docker

# 验证
sudo docker run hello-world
```

### Ubuntu 20.04+

```bash
# 更新包索引并安装依赖
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# 添加 Docker 官方 GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 添加仓库
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 启动并设开机自启
sudo systemctl enable --now docker
```

### 国内一键安装（推荐，快）

```bash
# 使用阿里云镜像安装脚本
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
```

### 将当前用户加入 docker 组（免 sudo）

```bash
sudo usermod -aG docker $USER
# 重新登录后生效
```

> ⚠️ 将用户加入 docker 组等价于赋予 root 权限（docker 可挂载宿主任意目录），生产环境慎用，建议仍用 sudo。

### 验证安装

```bash
docker version        # 查看客户端与服务端版本
docker info           # 查看 Docker 详细信息
docker run hello-world  # 跑通即安装成功
```

---

## 配置镜像加速器

国内从 Docker Hub 拉镜像很慢，需配置加速器。编辑 `/etc/docker/daemon.json`：

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ]
}
```

重启生效：

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证加速器是否生效
docker info | grep -A 5 "Registry Mirrors"
```

> 公共加速器地址经常变动失效，若拉取超时，可搜索「docker 镜像加速器 2024」获取可用地址，或自建 / 使用云厂商提供的私有加速器。

---

## 第一个容器

### 1. 拉取镜像

```bash
# 拉取 nginx 镜像（默认 latest，生产应指定版本）
docker pull nginx:1.25

# 查看本地镜像
docker images
```

### 2. 启动容器

```bash
docker run -d \
  --name my-nginx \
  -p 8080:80 \
  nginx:1.25
```

参数解释：

| 参数 | 含义 |
| ---- | ---- |
| `-d` | 后台运行（detach） |
| `--name my-nginx` | 给容器命名为 my-nginx |
| `-p 8080:80` | 端口映射：宿主 8080 -> 容器 80 |
| `nginx:1.25` | 使用的镜像 |

打开浏览器访问 `http://服务器IP:8080`，看到 nginx 欢迎页即成功。

### 3. 查看与进入

```bash
# 查看运行中的容器
docker ps
# 查看所有容器（含已停止）
docker ps -a
# 进入容器查看
docker exec -it my-nginx sh
# 在容器内查看进程
ps aux
exit
```

### 4. 查看日志

```bash
# 查看容器日志
docker logs my-nginx
# 实时跟踪日志
docker logs -f my-nginx
```

### 5. 停止与删除

```bash
# 停止
docker stop my-nginx
# 启动（已存在的容器）
docker start my-nginx
# 删除容器（需先停止）
docker rm my-nginx
```

---

## 容器生命周期初体验

完整体会一次容器的「生老病死」：

```bash
# 1. 运行一个 ubuntu 容器，交互式进入
docker run -it --name my-ubuntu ubuntu:22.04 /bin/bash

# 2. 在容器内做一些改动（如装个软件）
apt update && apt install -y curl
exit

# 3. 容器已停止，查看
docker ps -a

# 4. 重新启动并进入
docker start my-ubuntu
docker exec -it my-ubuntu /bin/bash
# 发现之前装的 curl 还在——容器可写层保留了改动

# 5. 删除容器，改动丢失
docker rm -f my-ubuntu
```

**关键认知**：

- 容器内的改动（如 apt 装的软件）保存在容器的**可写层**，只要不删容器就还在。
- 一旦 `docker rm` 删除容器，这些改动全部丢失。
- 想永久保留改动，要么把改动写进 `Dockerfile` 重新构建镜像，要么用 `docker commit` 固化为新镜像（应急手段，不推荐）。
- 想保留数据（如数据库文件），用**数据卷**，不要依赖容器可写层。

---

## 小结

- Docker 解决「环境一致性」问题，靠的是把应用 + 依赖打包进容器。
- 容器比虚拟机轻量，共享宿主内核，秒级启动。
- 五大核心概念：镜像、容器、数据卷、仓库、网络。
- 安装后配镜像加速器，国内拉镜像才快。
- `docker run` 启动容器，`docker ps` 查看，`docker exec` 进入，`docker stop/rm` 停止删除。
- 容器是临时的，重要数据放数据卷。

下一篇：[Docker 常用命令详解](./docker-commands.md) 系统学习全部常用命令。
