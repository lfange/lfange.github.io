# Linux 高级应用指南

> 本文档涵盖 Linux 系统管理、性能调优、安全加固、自动化运维等高级主题

---

## 目录

1. [系统管理进阶](#系统管理进阶)
2. [性能监控与调优](#性能监控与调优)
3. [安全加固](#安全加固)
4. [自动化运维](#自动化运维)
5. [容器化部署](#容器化部署)
6. [日志管理](#日志管理)
7. [网络高级配置](#网络高级配置)

---

## 系统管理进阶

### Systemd 深度使用

Systemd 是现代 Linux 系统的初始化系统，提供了强大的服务管理功能。

#### 服务管理

```bash
# 查看服务状态
systemctl status service-name

# 启动/停止/重启服务
systemctl start service-name
systemctl stop service-name
systemctl restart service-name

# 启用/禁用开机自启
systemctl enable service-name
systemctl disable service-name

# 重新加载配置
systemctl daemon-reload
```

#### 自定义服务文件

创建 `/etc/systemd/system/myapp.service`:

```ini
[Unit]
Description=My Application Service
After=network.target

[Service]
Type=simple
User=appuser
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/app
Restart=always
RestartSec=10

# 资源限制
LimitNOFILE=65536
LimitNPROC=4096

[Install]
WantedBy=multi-user.target
```

#### 定时任务

使用 Systemd Timer 替代 Cron:

```ini
# myapp.timer
[Unit]
Description=Run myapp task daily

[Timer]
OnCalendar=daily
AccuracySec=1m
Persistent=true

[Install]
WantedBy=timers.target
```

```ini
# myapp.service
[Unit]
Description=Myapp Task

[Service]
Type=oneshot
ExecStart=/opt/myapp/task.sh
```

### 用户权限管理

#### Sudo 配置

编辑 `/etc/sudoers`:

```bash
# 允许用户执行特定命令
username ALL=(ALL) /usr/bin/systemctl restart nginx

# 不输入密码执行命令
username ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx

# 用户组权限
%admins ALL=(ALL) ALL
```

#### 文件访问控制列表 (ACL)

```bash
# 查看 ACL
getfacl /path/to/file

# 设置 ACL
setfacl -m u:username:rwx /path/to/file
setfacl -m g:groupname:r-x /path/to/file

# 删除 ACL
setfacl -x u:username /path/to/file
```

### 磁盘管理 LVM

#### LVM 基本操作

```bash
# 创建物理卷
pvcreate /dev/sdb1

# 创建卷组
vgcreate vgdata /dev/sdb1

# 创建逻辑卷
lvcreate -L 100G -n lvdata vgdata

# 格式化并挂载
mkfs.xfs /dev/vgdata/lvdata
mount /dev/vgdata/lvdata /data

# 扩展逻辑卷
lvextend -L +50G /dev/vgdata/lvdata
xfs_growfs /dev/vgdata/lvdata  # XFS
resize2fs /dev/vgdata/lvdata   # EXT4
```

---

## 性能监控与调优

### 系统监控工具

#### top/htop

```bash
# 交互式查看进程
top

# 更友好的界面
htop
```

#### vmstat - 系统整体统计

```bash
# 查看虚拟内存、进程、CPU 活动
vmstat 5 10  # 每 5 秒一次，共 10 次
```

#### iostat - 磁盘 I/O 统计

```bash
iostat -x 5  # 每 5 秒一次，显示扩展信息
```

#### free - 内存使用

```bash
free -h
```

#### dstat - 综合监控

```bash
# 安装
yum install dstat  # CentOS
apt install dstat  # Debian/Ubuntu

# 使用
dstat -c  # CPU
dstat -m  # 内存
dstat -d  # 磁盘
dstat -n  # 网络
```

### 性能调优参数

#### 网络调优

编辑 `/etc/sysctl.conf`:

```conf
# TCP 调优
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# TCP 连接回收
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 0
net.ipv4.tcp_fin_timeout = 30

# TCP 缓冲区
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864
net.ipv4.tcp_mem = 786432 1048576 1572864

# 端口范围
net.ipv4.ip_local_port_range = 1024 65535
```

应用配置:

```bash
sysctl -p
```

#### 文件描述符限制

编辑 `/etc/security/limits.conf`:

```conf
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
```

---

## 安全加固

### SSH 安全配置

编辑 `/etc/ssh/sshd_config`:

```conf
# 禁止 root 登录
PermitRootLogin no

# 禁止密码登录，使用密钥
PasswordAuthentication no
PubkeyAuthentication yes

# 端口
Port 2222

# 禁用不安全的认证
HostbasedAuthentication no
PermitEmptyPasswords no

# 登录验证次数
MaxAuthTries 3

# 空闲超时
ClientAliveInterval 300
ClientAliveCountMax 3
```

重启 SSH:

```bash
systemctl restart sshd
```

### 防火墙配置

#### firewalld (CentOS/RHEL)

```bash
# 启动 firewalld
systemctl start firewalld
systemctl enable firewalld

# 开放端口
firewall-cmd --zone=public --add-port=80/tcp --permanent
firewall-cmd --zone=public --add-port=443/tcp --permanent

# 开放服务
firewall-cmd --zone=public --add-service=http --permanent
firewall-cmd --zone=public --add-service=https --permanent

# 重载配置
firewall-cmd --reload

# 查看状态
firewall-cmd --list-all
```

#### ufw (Ubuntu/Debian)

```bash
# 启用 ufw
ufw enable

# 允许端口
ufw allow 80/tcp
ufw allow 443/tcp

# 允许服务
ufw allow http
ufw allow https

# 查看状态
ufw status
```

### Fail2Ban 防暴力破解

```bash
# 安装
yum install fail2ban fail2ban-systemd  # CentOS
apt install fail2ban  # Ubuntu/Debian

# 配置
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# 编辑 /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
maxretry = 3
findtime = 300
bantime = 86400

# 启动
systemctl start fail2ban
systemctl enable fail2ban

# 查看被禁 IP
fail2ban-client status sshd
```

### SELinux/AppArmor

#### SELinux 基础操作

```bash
# 查看状态
getenforce

# 临时关闭
setenforce 0

# 永久配置
vim /etc/selinux/config
SELINUX=enforcing|permissive|disabled

# 查看上下文
ls -Z

# 常见报错处理
# 恢复文件上下文
restorecon -R /var/www/html

# 允许端口
semanage port -a -t http_port_t -p tcp 8080
```

---

## 自动化运维

### Shell 脚本进阶

#### 完整脚本示例

```bash
#!/bin/bash
set -euo pipefail

# 日志函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 错误处理
error() {
    log "ERROR: $1"
    exit 1
}

# 主逻辑
main() {
    log "Starting backup..."
    
    # 备份目录
    BACKUP_DIR="/backup"
    DATE=$(date '+%Y%m%d_%H%M%S')
    
    # 创建备份目录
    mkdir -p "$BACKUP_DIR"
    
    # 备份数据
    tar czf "$BACKUP_DIR/data_$DATE.tar.gz" /data || error "Backup failed"
    
    log "Backup completed successfully"
}

main "$@"
```

#### 定时任务

编辑 crontab:

```bash
crontab -e
```

```crontab
# 每天凌晨 2 点执行备份
0 2 * * * /opt/scripts/backup.sh >> /var/log/backup.log 2>&1

# 每 10 分钟检查服务
*/10 * * * * /opt/scripts/check_service.sh

# 每周日凌晨 3 点更新
0 3 * * 0 /opt/scripts/update.sh
```

### Ansible 基础

#### 安装

```bash
# CentOS
yum install ansible

# Ubuntu
apt install ansible
```

#### 清单文件

`/etc/ansible/hosts`:

```ini
[webservers]
web1 ansible_host=192.168.1.10 ansible_user=admin
web2 ansible_host=192.168.1.11 ansible_user=admin

[dbservers]
db1 ansible_host=192.168.1.20 ansible_user=admin
```

#### Playbook 示例

`nginx.yml`:

```yaml
---
- name: Install and configure Nginx
  hosts: webservers
  become: yes
  tasks:
    - name: Install Nginx
      yum:
        name: nginx
        state: present

    - name: Start Nginx service
      service:
        name: nginx
        state: started
        enabled: yes
```

运行 Playbook:

```bash
ansible-playbook nginx.yml
```

---

## 容器化部署

### Docker 基础

#### 安装

```bash
# CentOS
yum install -y docker
systemctl start docker
systemctl enable docker

# Ubuntu
apt install docker.io
```

#### 常用命令

```bash
# 运行容器
docker run -d --name nginx -p 80:80 nginx

# 查看容器
docker ps
docker ps -a

# 查看日志
docker logs -f nginx

# 进入容器
docker exec -it nginx bash

# 停止/删除容器
docker stop nginx
docker rm nginx

# 镜像操作
docker pull nginx
docker images
docker rmi nginx
```

#### Docker Compose

创建 `docker-compose.yml`:

```yaml
version: '3'
services:
  web:
    image: nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - db

  db:
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: secret
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

运行:

```bash
docker-compose up -d
```

---

## 日志管理

### 系统日志

#### journald 日志管理

```bash
# 查看日志
journalctl
journalctl -u nginx.service
journalctl -u nginx.service -f  # 实时跟踪
journalctl --since today
journalctl --since "2023-01-01" --until "2023-01-02"

# 日志大小限制
# 编辑 /etc/systemd/journald.conf
SystemMaxUse=1G
SystemKeepFree=2G
RuntimeMaxUse=512M
RuntimeKeepFree=1G
```

#### rsyslog

`/etc/rsyslog.d/myapp.conf`:

```conf
if $programname == 'myapp' then /var/log/myapp.log
& stop
```

### 日志轮转

`/etc/logrotate.d/myapp`:

```conf
/var/log/myapp/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 root root
    sharedscripts
    postrotate
        systemctl reload myapp 2>/dev/null || true
    endscript
}
```

---

## 网络高级配置

### 静态 IP 配置

#### CentOS 8/RHEL 8

`/etc/sysconfig/network-scripts/ifcfg-eth0`:

```bash
TYPE=Ethernet
BOOTPROTO=static
NAME=eth0
DEVICE=eth0
ONBOOT=yes
IPADDR=192.168.1.100
PREFIX=24
GATEWAY=192.168.1.1
DNS1=8.8.8.8
DNS2=114.114.114.114
```

重启网络:

```bash
nmcli c reload
```

#### Ubuntu 20.04+

`/etc/netplan/01-netcfg.yaml`:

```yaml
network:
  ethernets:
    eth0:
      addresses: [192.168.1.100/24]
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 114.114.114.114]
  version: 2
```

应用配置:

```bash
netplan apply
```

### 网桥配置

`/etc/sysconfig/network-scripts/ifcfg-br0`:

```bash
TYPE=Bridge
BOOTPROTO=static
NAME=br0
DEVICE=br0
ONBOOT=yes
IPADDR=192.168.1.100
PREFIX=24
GATEWAY=192.168.1.1
```

`/etc/sysconfig/network-scripts/ifcfg-eth0`:

```bash
TYPE=Ethernet
BOOTPROTO=none
NAME=eth0
DEVICE=eth0
ONBOOT=yes
BRIDGE=br0
```

### iptables/ip6tables

#### 基本操作

```bash
# 查看规则
iptables -L -n -v --line-numbers

# 允许 SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 允许 HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 允许已建立的连接
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# 默认策略
iptables -P INPUT DROP
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT

# 保存规则
iptables-save > /etc/sysconfig/iptables
```

---

## 参考资料

- [Linux Kernel Documentation](https://www.kernel.org/doc/)
- [Systemd Documentation](https://www.freedesktop.org/software/systemd/man/)
- [Docker Documentation](https://docs.docker.com/)
- [Ansible Documentation](https://docs.ansible.com/)
- [Linux Performance](http://www.brendangregg.com/linuxperf.html)
