---
title: Dockerfile 与镜像构建
icon: docker
category:
  - Serve
  - Docker
tag:
  - docker
  - dockerfile
  - 镜像构建
---

# Dockerfile 与镜像构建

> 本篇解决「怎么把自己的应用打包成镜像」。系统讲解 Dockerfile 全部常用指令、易混指令的区别、构建优化技巧与多阶段构建，给出可直接套用的最佳实践模板。

---

## 目录

1. [Dockerfile 是什么](#dockerfile-是什么)
2. [常用指令](#常用指令)
3. [易混指令辨析](#易混指令辨析)
4. [.dockerignore](#dockerignore)
5. [构建过程与缓存](#构建过程与缓存)
6. [多阶段构建](#多阶段构建)
7. [镜像构建优化](#镜像构建优化)
8. [实战示例](#实战示例)
9. [最佳实践清单](#最佳实践清单)

---

## Dockerfile 是什么

Dockerfile 是一个文本文件，按顺序记录「如何构建镜像」的指令。`docker build` 读取它，逐条执行，最终产出一个镜像。

最小示例：

```dockerfile
FROM nginx:1.25
COPY ./html /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -t my-nginx:1.0 .
```

每条指令对应镜像的一**层（Layer）**，层是只读的、可缓存的、可被多镜像共享的。

---

## 常用指令

### FROM - 基础镜像

```dockerfile
FROM nginx:1.25              # 指定版本
FROM ubuntu:22.04
FROM scratch                 # 空镜像，用于构建最小镜像（如 Go 静态二进制）
```

必须是第一条非注释指令。选基础镜像优先选官方 + 明确版本 + slim/alpine 变体。

### RUN - 执行命令

```dockerfile
# shell 形式
RUN apt update && apt install -y curl

# exec 形式（推荐，避免 shell 解析问题）
RUN ["apt", "update"]
```

`RUN` 在构建时执行，结果写入镜像层。每条 `RUN` 产生一层，应合并以减少层数：

```dockerfile
# 不好：3 层
RUN apt update
RUN apt install -y curl
RUN rm -rf /var/lib/apt/lists/*

# 好：1 层，且清理了 apt 缓存
RUN apt update && apt install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
```

### COPY 与 ADD - 拷贝文件

```dockerfile
COPY ./app /app              # 把宿主 app 目录拷到镜像 /app
COPY package.json /app/
```

### WORKDIR - 工作目录

```dockerfile
WORKDIR /app                 # 后续指令的当前目录
RUN npm install              # 在 /app 下执行
```

### ENV 与 ARG - 环境变量

```dockerfile
# ENV：运行时也生效，写入镜像元数据
ENV NODE_ENV=production
ENV APP_PORT=3000

# ARG：仅构建时生效，运行时不存在
ARG VERSION=1.0
RUN echo $VERSION
```

### EXPOSE - 声明端口

```dockerfile
EXPOSE 80 443
```

`EXPOSE` 只是**声明文档**，并不真正发布端口。真正映射要 `docker run -p`。但便于使用者知道容器提供哪些端口。

### VOLUME - 声明数据卷

```dockerfile
VOLUME /var/lib/mysql
```

声明此处应挂载卷。运行时若未手动挂载，Docker 会自动分配一个匿名卷。

### USER - 切换用户

```dockerfile
USER node
```

后续 `RUN`/`CMD`/`ENTRYPOINT` 以该用户身份执行。生产镜像应避免用 root 运行。

### CMD - 默认命令

```dockerfile
# 容器启动默认执行
CMD ["nginx", "-g", "daemon off;"]
```

### ENTRYPOINT - 入口点

```dockerfile
ENTRYPOINT ["nginx"]
```

### HEALTHCHECK - 健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
```

Docker 定期执行该命令，判断容器健康状态，便于编排系统重启不健康容器。

---

## 易混指令辨析

### CMD vs ENTRYPOINT

| | CMD | ENTRYPOINT |
| ---- | ---- | ---- |
| 作用 | 容器默认命令 / 默认参数 | 容器入口主程序 |
| 是否被 run 参数覆盖 | `docker run` 后的命令会**整体覆盖** CMD | 不被覆盖，run 后的参数作为**追加参数** |
| 数量 | 仅最后一条生效 | 仅最后一条生效 |

三种组合：

```dockerfile
# 1. 仅 CMD（最常见）
CMD ["nginx", "-g", "daemon off;"]
# docker run myimg        -> 执行 nginx -g "daemon off;"
# docker run myimg bash   -> 执行 bash（CMD 被覆盖）

# 2. ENTRYPOINT + CMD（CMD 充当默认参数）
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
# docker run myimg             -> nginx -g "daemon off;"
# docker run myimg -t          -> nginx -t（CMD 参数被覆盖，追加到 ENTRYPOINT）

# 3. 仅 ENTRYPOINT（强制执行主程序，参数可追加）
ENTRYPOINT ["nginx"]
# docker run myimg -t          -> nginx -t
```

> 经验：要让镜像像「可执行程序」一样接受参数，用 ENTRYPOINT + CMD 组合。

### COPY vs ADD

| | COPY | ADD |
| ---- | ---- | ---- |
| 拷贝本地文件 | ✅ | ✅ |
| 自动解压 tar.gz | ❌ | ✅ |
| 从 URL 下载 | ❌ | ✅（已不推荐） |
| 推荐度 | ⭐⭐⭐ 优先用 | 仅需自动解压时用 |

> 最佳实践：统一用 `COPY`，语义清晰。需要解压 tar 时才用 `ADD`，URL 下载应改用 `RUN curl ... && tar xzf`。

---

## .dockerignore

构建时会把构建上下文（`.`目录）整个发给 Docker 守护进程。`.dockerignore` 用于排除无关文件，减小上下文、加速构建、避免泄露敏感信息。

```
# .dockerignore
node_modules
npm-debug.log
.git
.gitignore
.env
*.md
dist
build
.DS_Store
Dockerfile
docker-compose*.yml
```

> 不写 `.dockerignore`，`COPY . /app` 会把 `node_modules`、`.git` 都拷进去，既慢又可能把宿主的依赖覆盖镜像里的。

---

## 构建过程与缓存

Docker 构建按指令逐层执行，每层有缓存。**只要某层指令没变，就用缓存**，且后续层也不变才命中。

```dockerfile
COPY . /app          # 任何源码改动都让这层失效
RUN npm install      # 于是这层也失效，重新装依赖（慢）
```

缓存失效是**传染的**：某层失效，其后所有层都失效。

**优化思路**：把「变动少的」放前面，「变动多的」放后面。

```dockerfile
# 不好：每次改代码都重装依赖
COPY . /app
RUN npm install

# 好：先拷依赖清单装依赖，再拷源码
COPY package*.json /app/
RUN npm install
COPY . /app
```

这样改代码只让 `COPY . /app` 之后的层失效，`npm install` 命中缓存，构建飞快。

---

## 多阶段构建

一个镜像里若包含编译工具链（gcc、node、maven），体积会很大。多阶段构建让你在第一阶段编译，第二阶段只把产物拷进运行镜像，大幅减小体积。

```dockerfile
# ---- 阶段1：构建 ----
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build              # 产物在 /app/dist

# ---- 阶段2：运行 ----
FROM nginx:1.25-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

效果：

- 阶段 1 镜像有 node + 源码 + node_modules（约 1GB），但不发布。
- 最终镜像只有 nginx + dist 静态文件（约 50MB）。
- `--from=builder` 从第一阶段拷贝产物。

Go 程序示例（极致精简）：

```dockerfile
FROM golang:1.21 AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o app -ldflags="-s -w" .

FROM scratch
COPY --from=builder /src/app /app
ENTRYPOINT ["/app"]
```

最终镜像只有二进制文件本身，可能仅十几 MB。

---

## 镜像构建优化

1. **合并 RUN**：用 `&&` 串联命令，减少层数。
2. **清理缓存**：装完包删 apt/apm 缓存（`rm -rf /var/lib/apt/lists/*`）。
3. **用小基础镜像**：`alpine` < `slim` < 完整版。注意 alpine 用 musl libc，个别依赖有兼容问题。
4. **善用缓存**：变动少的指令放前面（见上文）。
5. **多阶段构建**：编译与运行分离。
6. **`.dockerignore`**：减小上下文。
7. **固定版本**：`FROM node:18.19.0-alpine` 而非 `node:latest`，保证可复现。
8. **`--no-install-recommends`**（apt）：不装推荐包，减小体积。

查看镜像分层与体积：

```bash
docker history myapp:1.0
dive myapp:1.0          # 第三方工具，可视化分析每层
```

---

## 实战示例

### Node.js 应用

```dockerfile
FROM node:18.19-alpine
WORKDIR /app

# 先装依赖（利用缓存）
COPY package*.json ./
RUN npm ci --only=production

# 再拷源码
COPY . .

# 非 root 用户
USER node

ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

### Java (Spring Boot)

```dockerfile
# 构建
FROM maven:3.9-eclipse-temurin-17 AS builder
WORKDIR /src
COPY pom.xml .
RUN mvn dependency:go-offline            # 先下依赖（缓存）
COPY src ./src
RUN mvn package -DskipTests

# 运行
FROM eclipse-temurin:17-jre-alpine
COPY --from=builder /src/target/app.jar /app/app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
```

---

## 最佳实践清单

- ✅ 固定基础镜像版本，不用 `latest`
- ✅ 优先官方镜像，优先 alpine/slim
- ✅ 合并 RUN，每层做一件事但减少层数
- ✅ 装包后清理缓存
- ✅ 善用缓存：依赖清单在前，源码在后
- ✅ 多阶段构建分离编译与运行
- ✅ 用 `COPY` 而非 `ADD`
- ✅ 用 `ENTRYPOINT` + `CMD` 组合让镜像可参数化
- ✅ 非 root 用户运行
- ✅ 加 `HEALTHCHECK`
- ✅ 写 `.dockerignore`
- ❌ 不要在镜像里放密钥/密码（用运行时环境变量或 secrets）
- ❌ 不要 `commit` 容器代替 Dockerfile

---

## 小结

- Dockerfile 是镜像的「配方」，逐条指令逐层构建。
- `RUN` 构建时执行产生层，`CMD`/`ENTRYPOINT` 运行时执行。
- `CMD` 可被覆盖，`ENTRYPOINT` 主程序固定；`COPY` 优先于 `ADD`。
- 缓存传染：把变动少的放前面，`package.json` 在源码前。
- 多阶段构建是减小镜像体积的杀手锏。
- 生产镜像：小基础镜像 + 多阶段 + 非 root + 健康检查。

下一篇：[Docker Compose 多容器编排](./docker-compose-guide.md) 用一份 yml 管理多容器。
