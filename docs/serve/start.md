# 数据库安装

1. 基础环境更新在开始之前，先确保系统包列表是最新的：`Bashsudo apt update && sudo apt upgrade -y`
2. 安装 NginxNginx 将作为反向代理服务器，站在 Spring Boot 前面处理 HTTPS 和负载均衡。安装： `sudo apt install nginx -y`启动： `sudo systemctl start nginx` 关键点： 稍后你需要配置 /etc/nginx/sites-available/default，将 80 端口的流量转发到 Spring Boot 的内网端口（默认 8080）。
3. 安装 PostgreSQLPostgreSQL 是目前开发者心目中最强大的开源关系型数据库。安装：` sudo apt install postgresql postgresql-contrib -y` 初始设置：Postgres 默认创建一个名为 postgres 的系统用户，切换过去：`sudo -i -u postgres`进入数据库终端： psql 建议： 为你的 Spring Boot 项目创建一个独立的数据库和用户，不要直接用超级用户。

   ```sql
     -- 修改用户的密码
     ALTER USER postgres WITH PASSWORD '您的密码';
   ```

   `sudo vi /etc/postgresql/14/main/postgresql.conf`修改 listen*addresses 在文件中搜索 listen_addresses，找到这一行： #listen_addresses = 'localhost' 去掉前面的 # 注释符，并将 localhost 改为 *： `listen_addresses = '_'` 重启服务 修改后必须重启才能生效：`sudo systemctl restart postgresql`

   该命令是确认端口状态 `ss -lntp | grep 5432`

4. 准备 Spring Boot 环境 Spring Boot 是以 .jar 包形式运行的，你只需要安装 JRE（Java 运行时环境）。安装 Java (以 Java 17 为例)： `sudo apt install openjdk-17-jdk -y`运行建议： 生产环境下，不要直接用 java -jar 命令在后台跑，建议将其配置为 Systemd 服务。这样即使服务器重启，你的服务也会自动拉起。整体架构逻辑图在你的配置中，流量的流向如下：组件作用监听端口 (默认)Nginx 接入外网流量、SSL 卸载、静态资源缓存 80 (HTTP) / 443 (HTTPS)Spring Boot 业务逻辑处理、API 接口 8080 `PostgreSQL` 数据持久化存储 5432
