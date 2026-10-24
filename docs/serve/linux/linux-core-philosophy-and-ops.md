---
icon: article

category:
  - Serve
  - Guide

tag:
  - linux
  - core-philosophy
  - operations
  - demo
---

# Linux 核心思想与常用操作实战

## 一、Linux 核心思想 —— 理解它，才能驾驭它

### 1.1 一切皆文件 (Everything is a File)

这是 Linux 最根本的设计哲学。在 Linux 中，**普通文件、目录、设备、进程、网络 socket，甚至内核参数，都以文件的形式呈现**。

```
普通文件    →  ~/documents/note.txt      （读写数据）
硬盘设备    →  /dev/sda                   （cat /dev/sda 能读原始磁盘数据）
终端        →  /dev/tty                   （向终端写数据 = 屏幕显示）
进程信息    →  /proc/<pid>/status          （cat 一下就能看进程状态）
内核参数    →  /proc/sys/net/ipv4/ip_forward  （echo 1 > ... 就开启了 IP 转发）
```

**这意味着什么？** 只要你学会了 `cat`、`echo`、`ls`、`cp` 这几个文件操作命令，理论上你就能操作 Linux 的一切。

**Demo —— 用文件操作来控制系统：**

```bash
# 1. 查看 CPU 信息 —— 读一个"文件"
cat /proc/cpuinfo | grep "model name"

# 2. 查看内存 —— 读一个"文件"
cat /proc/meminfo | head -5

# 3. 修改主机名 —— 写一个"文件"
echo "my-server" > /etc/hostname

# 4. 开启 IP 转发（让这台机器能做路由器）—— 写一个"文件"
echo 1 > /proc/sys/net/ipv4/ip_forward

# 5. 查看当前运行的所有进程 —— 遍历一个"目录"
ls /proc/ | grep -E '^[0-9]+$' | head -10
```

> **领悟**：学习 Linux 时不要被"这个工具、那个工具"吓到，本质上都是在操作文件。掌握了文件操作，就掌握了 Linux 的钥匙。

---

### 1.2 小而美：一个程序只做一件事 (Do One Thing and Do It Well)

每个命令行工具只专注于做好一件事，然后通过 **管道 (`|`)** 把多个小程序组合起来，完成复杂的任务。

```
单一职责的小工具  +  管道组合  =  无限可能
```

**Demo —— 用管道串联完成一个复杂任务：**

```bash
# 需求：找出当前系统中占用内存最多的 5 个进程，只显示进程名和内存占用率

ps aux --sort=-%mem | awk '{print $4, $11}' | head -6 | tail -5

# 拆解分析：
# ps aux --sort=-%mem    → 列出所有进程，按内存降序（做好一件事：列出进程）
# awk '{print $4, $11}'  → 只提取第4列（内存）和第11列（进程名）（做好一件事：提取列）
# head -6                → 取前6行（含表头）（做好一件事：取头部）
# tail -5                → 去掉表头，保留5行 （做好一件事：取尾部）
# |                      → 管道，把前一个的输出变成后一个的输入
```

```bash
# 需求：统计 access.log 中访问量前 10 的 IP

cat /var/log/nginx/access.log | awk '{print $1}' | sort | uniq -c | sort -rn | head -10

# 每个命令都只做一件事：
# cat      → 读取文件
# awk      → 提取 IP 列
# sort     → 排序（让相同 IP 排在一起）
# uniq -c  → 统计去重（统计每个 IP 出现次数）
# sort -rn → 按数字降序排列
# head -10 → 取前 10 条
```

> **领悟**：不要试图找一个"万能命令"，而是学会用管道把简单命令组合起来。这是 Linux 命令行强大之美的核心。

---

### 1.3 一切皆可脚本化 (Everything is Scriptable)

Linux 鼓励你写 Shell 脚本把重复操作自动化。脚本就是把命令写进文件，让它批量执行。

**Demo —— 一个实用的日常备份脚本：**

```bash
#!/bin/bash
# backup.sh —— 每日备份数据库 + 清理旧备份

DB_NAME="myapp"
BACKUP_DIR="/backup/db"
RETENTION_DAYS=7   # 保留 7 天

# 1. 创建备份目录
mkdir -p "$BACKUP_DIR"

# 2. 导出数据库（带时间戳）
mysqldump "$DB_NAME" | gzip > "$BACKUP_DIR/${DB_NAME}_$(date +%Y%m%d).sql.gz"

# 3. 删除超过 7 天的旧备份
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup done: $(date)"
```

```bash
# 添加定时任务，每天凌晨 2 点自动执行
# crontab -e
0 2 * * * /home/user/scripts/backup.sh >> /var/log/backup.log 2>&1
```

> **领悟**：如果你发现自己在重复输入某个命令组合，就该把它写成一个脚本。脚本化是"自动化思维"的起点。

---

### 1.4 文本为王 (Text is King)

Linux 的配置几乎全是纯文本文件。没有 Windows 的注册表、没有隐藏的二进制配置。**这意味着你可以用任何文本编辑器搞定一切配置。**

```bash
# 用户信息 —— 文本文件
cat /etc/passwd

# 系统服务 —— 文本文件
cat /etc/systemd/system/myapp.service

# 定时任务 —— 文本文件
crontab -l

# 网络配置 —— 文本文件
cat /etc/netplan/01-netcfg.yaml

# 日志 —— 文本文件
tail -f /var/log/syslog
```

> **领悟**：在 Linux 世界里，`grep` + `vim` 几乎能解决所有配置问题。不依赖 GUI，纯文本意味着你可以远程 SSH 管理一切。

---

### 1.5 沉默是金 (Silence is Golden)

Unix 哲学之一：**没有消息就是好消息**。一个命令执行成功了，它通常什么也不说。

```bash
# 成功复制文件 —— 没有任何输出
cp file1.txt file2.txt

# 想知道到底复制了没有？
ls -l file2.txt          # 自己检查
cp -v file1.txt file2.txt # 或者加 -v 让它说句话
```

> **领悟**：不要期望 Linux 命令总是给你"成功！"的提示。学会用 `$?`（上一条命令的退出码：0=成功，非0=失败）来判断。

```bash
cp file1.txt file2.txt
echo $?   # 输出 0 表示成功，非 0 表示失败

# 实战：脚本中判断上一步是否成功
if cp important.conf /etc/; then
    echo "部署成功"
else
    echo "部署失败，请检查权限" >&2
    exit 1
fi
```

---

### 1.6 哲学总结：一张图看懂 Linux 设计理念

```
┌─────────────────────────────────────────────────────────┐
│                    Linux 核心哲学                         │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │ 一切皆文件    │    │ 小而美       │                    │
│  │ Everything   │ +  │ Do One Thing│ = 强大而灵活的系统   │
│  │ is a File    │    │ Well         │                    │
│  └──────────────┘    └──────────────┘                    │
│          │                   │                            │
│          ▼                   ▼                            │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │ 文本为王      │    │ 管道组合      │                    │
│  │ Text is King │    │ Pipe |       │                    │
│  └──────────────┘    └──────────────┘                    │
│          │                   │                            │
│          ▼                   ▼                            │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │ 沉默是金      │    │ 一切可脚本化  │                    │
│  │ Silence is   │    │ Everything   │                    │
│  │ Golden       │    │ Scriptable   │                    │
│  └──────────────┘    └──────────────┘                    │
│                                                          │
│  核心理念：给你积木（小工具），而不是给你一整栋楼（大软件）│
│  你需要的是：理解积木 + 学会组合 = 搭建任何你想要的东西    │
└─────────────────────────────────────────────────────────┘
```

---

## 二、文件系统 —— 了解你的工作台

### 2.1 Linux 目录结构速览

```
/                  # 根目录，一切文件的起点
├── /bin           # 基础命令（ls, cp, mv, cat...）
├── /sbin          # 系统管理命令（fdisk, iptables...）
├── /etc           # 配置文件（"所有配置在这里"）
├── /dev           # 设备文件（硬盘、U盘、终端...）
├── /proc          # 进程和内核的虚拟文件系统（不占磁盘！）
├── /sys           # 内核和驱动的运行时信息
├── /tmp           # 临时文件（重启后清空）
├── /var           # 可变数据（日志 /var/log、数据库 /var/lib/mysql）
├── /home          # 用户主目录（~ = /home/你的用户名）
├── /root          # root 用户的主目录
├── /usr           # 用户安装的软件和库
├── /opt           # 第三方软件安装位置
└── /boot          # 启动相关的文件（内核镜像）
```

**记忆技巧：**

| 目录 | 记忆法 |
|------|--------|
| `/etc` | **E**verything **T**o **C**onfigure |
| `/var` | **VAR**iable — 经常变化的文件 |
| `/tmp` | **T**e**M**p — 临时文件 |
| `/opt` | **OPT**ional — 可选的第三方软件 |
| `/proc` | **PROC**ess — 进程信息 |

### 2.2 inode —— 文件的"身份证"

在 Linux 中，**文件名不是文件的唯一标识，inode 才是**。

- **inode**：存储文件的元数据（大小、权限、所有者、数据块位置），**不存文件名**
- **文件名**：只是指向 inode 的"标签"
- **block**：存储实际数据的地方

```bash
# 查看文件的 inode 号
ls -i hello.txt
# 输出：2621445 hello.txt   ← 2621445 就是 inode 号

# 查看 inode 详细信息
stat hello.txt
```

**这个知识有什么用？**

```bash
# 场景：磁盘空间满了但 du 查不到大文件 —— inode 被占满！
df -i          # 查看 inode 使用率

# 场景：删除名字奇怪删不掉的文件 —— 用 inode 删！
ls -i           # 找到 inode 号
find . -inum 2621445 -delete   # 按 inode 号删除
```

### 2.3 硬链接与软链接

```bash
# ┌──────────────────────────────────────────────────────┐
# │  硬链接 (Hard Link)                                    │
# │  · 多个文件名 → 同一个 inode                            │
# │  · 删除一个文件名，数据还在（inode 引用计数 > 0 即可）     │
# │  · 不能跨文件系统，不能链接目录                          │
# ├──────────────────────────────────────────────────────┤
# │  软链接 (Symbolic Link / Symlink)                      │
# │  · 一个特殊文件 → 存储的是目标路径（像 Windows 快捷方式） │
# │  · 可以跨文件系统，可以链接目录                          │
# │  · 目标被删除后，软链接就"断"了                          │
# └──────────────────────────────────────────────────────┘
```

```bash
# Demo：硬链接 vs 软链接

# 创建一个原始文件
echo "hello linux" > original.txt

# 创建硬链接
ln original.txt hard.txt
# hard.txt 和 original.txt 指向同一个 inode，修改任意一个，另一个同步变化

# 创建软链接
ln -s original.txt soft.txt
# soft.txt → original.txt，只是一个"指针"

ls -li  # -i 显示 inode 号，可以看到 hard.txt 和 original.txt 的 inode 相同
# 输出示例：
# 2621445 -rw-r--r-- 2 user user 12 Jun 22 10:00 original.txt
# 2621445 -rw-r--r-- 2 user user 12 Jun 22 10:00 hard.txt       ← inode 相同！
# 2621446 lrwxrwxrwx 1 user user 12 Jun 22 10:00 soft.txt -> original.txt

# 删除原文件后
rm original.txt
cat hard.txt  # ✅ 还能读到 "hello linux"（数据还在，inode 引用计数从 2 降到 1）
cat soft.txt  # ❌ 报错：No such file or directory（链接断了）
```

---

## 三、常用命令实战 —— 按场景学习

### 3.1 文件操作（最基础，每天用）

```bash
# ───── 查看文件 ─────
ls -la              # 列出所有文件（含隐藏文件），长格式
ls -lh              # 人类可读的大小（K, M, G）
ls -lt              # 按修改时间排序

cat file.txt        # 显示全部内容（适合小文件）
less file.txt       # 分页浏览（Space 翻页，q 退出，/ 搜索）
head -20 file.txt   # 看前 20 行
tail -f app.log     # 实时追踪日志（Ctrl+C 退出）

# ───── 创建/删除 ─────
mkdir -p a/b/c      # 递归创建目录（即使 a, a/b 不存在也能创建）
touch newfile.txt   # 创建空文件，或更新文件时间戳
rm -rf dir/         # 递归强制删除（⚠️ 危险命令，用前确认）
rmdir emptydir/     # 只能删空目录

# ───── 复制/移动 ─────
cp source dest      # 复制文件
cp -r src/ dest/    # 递归复制目录
mv old new          # 移动/重命名（同一个命令）

# ───── 查找文件 ─────
find . -name "*.log"            # 在当前目录下按名字找
find /var/log -mtime -1        # 找最近 1 天内修改的文件
find . -size +100M              # 找大于 100MB 的文件
find . -name "*.tmp" -delete    # 找到并删除（⚠️ 先不加 -delete 确认一遍！）

# locate 更快（需要先 updatedb 建索引），适合按名字快速查找
locate nginx.conf
```

### 3.2 文本处理（Linux 最擅长的领域）

```bash
# ───── 搜索文本 ─────
grep "error" app.log                # 在文件中搜索包含 error 的行
grep -i "error" app.log             # 忽略大小写
grep -v "debug" app.log             # 反向：排除包含 debug 的行
grep -r "TODO" ./src/               # 递归搜索目录
grep -c "error" app.log             # 统计匹配行数
grep -A 3 "error" app.log           # 显示匹配行及后 3 行（-B 前，-C 前后）

# ───── 提取与转换 ─────
# awk —— 列处理神器
awk '{print $1, $3}' data.txt       # 打印第 1 和第 3 列
awk -F':' '{print $1}' /etc/passwd  # 以冒号为分隔符，打印第 1 列
awk '$3 > 1000' data.txt            # 第 3 列大于 1000 的行

# sed —— 流编辑器，做替换
sed 's/old/new/g' file.txt          # 替换（只输出不改文件）
sed -i 's/old/new/g' file.txt       # 替换并写入文件（⚠️ 不可逆）
sed '5,10d' file.txt                # 删除第 5 到 10 行（输出）

# cut —— 简单切割
cut -d':' -f1,7 /etc/passwd         # 以:分隔，取第 1 和第 7 列

# sort & uniq —— 排序去重
sort file.txt                       # 排序
sort -n                             # 按数字排序
sort -rn                            # 按数字倒序
uniq                                # 去重（需要先 sort）
sort file.txt | uniq -c             # 去重并统计出现次数
sort file.txt | uniq -c | sort -rn  # 按出现次数倒序排列

# ───── 组合案例 ─────
# 分析 Nginx 日志：找出访问量 Top 5 的接口
cat access.log | awk '{print $7}' | sort | uniq -c | sort -rn | head -5

# 批量替换多个文件中的字符串
find . -name "*.js" -exec sed -i 's/old_api/new_api/g' {} \;
```

### 3.3 进程管理

```bash
# ───── 查看进程 ─────
ps aux                  # 查看所有进程（BSD 风格）
ps -ef                  # 查看所有进程（System V 风格）
ps -ef | grep nginx     # 查找特定进程

top                     # 实时进程监控（按 q 退出）
htop                    # top 的增强版（界面更友好，需安装）

# ───── 进程树 ─────
pstree -p               # 以树状图显示进程关系（带 PID）

# ───── 终止进程 ─────
kill <PID>              # 发送 TERM 信号（优雅终止，给进程清理的机会）
kill -9 <PID>           # 发送 KILL 信号（强制终止，不给任何机会）
kill -l                 # 查看所有信号列表

pkill -f "python app"   # 按进程名（含参数）终止
killall nginx           # 终止所有同名进程

# ───── 后台进程 ─────
./myapp &               # 放到后台运行
Ctrl+Z                  # 暂停当前前台任务
jobs                    # 查看后台任务
bg %1                   # 让任务 1 在后台继续运行
fg %1                   # 把后台任务 1 拉回前台

nohup ./myapp &         # 不挂断运行（关闭终端后继续跑）
nohup ./myapp > app.log 2>&1 &  # 重定向所有输出
```

**进程状态速查（ps aux 的 STAT 列）：**

| 状态 | 含义 |
|------|------|
| `R` | Running — 正在运行或可运行 |
| `S` | Sleeping — 可中断的睡眠（等待事件） |
| `D` | Disk Sleep — 不可中断的睡眠（等待 I/O） |
| `Z` | Zombie — 僵尸进程（已结束，父进程未回收） |
| `T` | Stopped — 被暂停 |
| `<` | 高优先级 |
| `N` | 低优先级 |
| `+` | 前台进程组 |

### 3.4 权限管理

```bash
# ───── 理解权限 ─────
# -rwxr-xr--  1  user  group  1024  Jun 22 10:00  file.txt
#  └┬┘└─┬─┘└─┬─┘
#  类型  │    └── 其他人的权限 (r-x = 读+执行)
#       └── 组的权限 (r-x = 读+执行)
#   所有者权限 (rwx = 读+写+执行)

# r=4, w=2, x=1
# rwx = 4+2+1 = 7
# rw- = 4+2+0 = 6
# r-x = 4+0+1 = 5
# r-- = 4+0+0 = 4

# ───── 修改权限 ─────
chmod 755 script.sh     # rwxr-xr-x（所有者全权限，其他人读+执行）
chmod 600 secret.key    # rw-------（只有所有者能读写）
chmod +x script.sh      # 给所有人添加执行权限
chmod u+x script.sh     # 只给所有者(u)添加执行权限

# ───── 修改所有者 ─────
chown user:group file.txt   # 同时改所有者和组
chown -R user:group dir/    # 递归修改整个目录

# ───── 特殊权限 ─────
# SUID (4xxx)：以文件所有者的身份执行
chmod 4755 /usr/bin/passwd   # passwd 需要 root 权限修改 /etc/shadow

# SGID (2xxx)：以目录所属组的身份执行/创建文件
chmod 2775 shared_dir/

# Sticky Bit (1xxx)：只有文件所有者能删除（如 /tmp）
chmod 1777 /tmp
```

### 3.5 磁盘与存储

```bash
# ───── 查看磁盘 ─────
df -h                   # 查看各分区使用情况（-h 人类可读）
df -i                   # 查看 inode 使用情况

du -sh /var/log         # 查看目录总大小
du -sh * | sort -rh     # 当前目录下各文件/目录大小排序

lsblk                   # 列出所有块设备（硬盘、分区）
fdisk -l                # 查看磁盘分区表

# ───── 挂载 ─────
mount /dev/sdb1 /mnt/data   # 挂载分区
umount /mnt/data            # 卸载
df -h                       # 确认挂载状态

# ───── 自动挂载 ─────
# 编辑 /etc/fstab，添加：
# /dev/sdb1  /mnt/data  ext4  defaults  0  2
#  设备       挂载点    文件系统  选项    dump  fsck顺序

mount -a                # 测试 fstab 配置（不重启）
```

### 3.6 网络操作

```bash
# ───── 查看网络 ─────
ip addr                 # 查看 IP 地址（现代方式）
ifconfig                # 查看网络接口（传统方式，部分发行版需安装）
ip route                # 查看路由表

ss -tlnp                # 查看监听的 TCP 端口（比 netstat 更快）
ss -tlnp | grep :80     # 查看 80 端口被谁占用

# ───── 网络诊断 ─────
ping -c 4 google.com        # 测试连通性（发 4 个包）
traceroute google.com       # 追踪路由路径
nslookup example.com        # DNS 查询
dig example.com             # DNS 详细查询（比 nslookup 更强）

curl -I https://example.com     # 获取 HTTP 头
curl -X POST -d "key=val" https://httpbin.org/post  # POST 请求

wget https://example.com/file.tar.gz   # 下载文件

# ───── 防火墙 (ufw 简化版) ─────
ufw status                  # 查看状态
ufw allow 80/tcp            # 开放 80 端口
ufw allow from 192.168.1.0/24  # 允许某网段
ufw enable                  # 启用防火墙
```

### 3.7 用户与组管理

```bash
# ───── 用户 ─────
whoami                      # 我是谁
id                          # 我的 UID、GID、所属组
who                         # 当前登录的所有用户
w                           # 更详细：谁在登录，在干什么

useradd -m -s /bin/bash newuser     # 创建用户（-m 创建家目录，-s 指定 shell）
passwd newuser                       # 设置密码
usermod -aG docker newuser           # 把用户加到 docker 组（-a 追加，别漏！）
userdel -r newuser                   # 删除用户（-r 同时删除家目录）

# ───── 切换用户 ─────
su - otheruser              # 切换到 otheruser（- 表示加载其完整环境）
sudo command                # 以 root 身份执行一条命令
sudo -i                     # 切换到 root 用户的交互式 shell
visudo                      # 安全编辑 /etc/sudoers（别直接用 vim 编辑！）
```

### 3.8 包管理

```bash
# ───── Debian/Ubuntu (apt) ─────
apt update                  # 更新软件包索引
apt upgrade                 # 升级所有已安装的包
apt install nginx           # 安装
apt remove nginx            # 卸载（保留配置文件）
apt purge nginx             # 彻底卸载（含配置文件）
apt search keyword          # 搜索软件包
apt show nginx              # 查看软件包详情

# ───── RHEL/CentOS/Fedora (dnf/yum) ─────
dnf install nginx           # 安装
dnf update                  # 更新所有
dnf remove nginx            # 卸载
dnf search keyword          # 搜索
```

---

## 四、管道与重定向 —— Linux 的"乐高积木"

### 4.1 三大数据流

```
         ┌─────────┐
stdin ──►│         │──► stdout (fd=1)  —— 正常输出
  (fd=0) │ 程序    │──► stderr (fd=2)  —— 错误输出
         └─────────┘
```

```bash
# ───── 输出重定向 ─────
command > file.txt          # stdout 写入文件（覆盖）
command >> file.txt         # stdout 追加到文件

# ───── 错误重定向 ─────
command 2> error.log        # stderr 写入文件
command 2>> error.log       # stderr 追加到文件

# ───── 合并重定向 ─────
command > all.log 2>&1      # stdout 和 stderr 都写入同一个文件
command &> all.log          # 同上（bash 简写）
command >> all.log 2>&1     # 追加模式

# ───── 输入重定向 ─────
command < input.txt         # 从文件读取 stdin
mysql -u root < backup.sql  # 导入 SQL 文件

# ───── 黑洞 ─────
command > /dev/null 2>&1    # 丢弃所有输出（不想看任何东西时用）

# ───── Here Document（多行输入） ─────
cat << EOF > config.yaml
server:
  host: 0.0.0.0
  port: 8080
EOF
```

### 4.2 管道——组合的力量

```bash
# 管道 | 把左边命令的 stdout 连接到右边命令的 stdin

# Demo：一行命令搞定"找出占用磁盘最多的 5 个目录"
du -sh /* 2>/dev/null | sort -rh | head -5

# Demo：查看某个进程打开的文件数
ls -l /proc/$(pgrep nginx | head -1)/fd | wc -l

# Demo：批量杀掉所有包含"stale"的进程
ps aux | grep stale | awk '{print $2}' | xargs kill -9
#                                                    ↑
#                        xargs：把 stdin 转成命令行参数
#                        因为 kill 不接受管道输入，需要 xargs 中转
```

---

## 五、Shell 脚本入门 —— 把重复变成自动化

### 5.1 基本骨架

```bash
#!/bin/bash
# ↑ shebang，告诉系统用哪个解释器执行这个脚本

set -e          # 任何命令失败就退出（推荐！防止错误累积）
set -u          # 使用未定义变量就报错
set -o pipefail # 管道中任何命令失败都算失败

# 变量
NAME="world"
readonly CONST="不可改"    # 只读变量
echo "Hello, ${NAME}"      # ${} 是好习惯，防止歧义

# 特殊变量
echo "脚本名: $0"
echo "第1个参数: $1"
echo "参数个数: $#"
echo "所有参数: $@"
echo "上条命令退出码: $?"
echo "当前进程 PID: $$"
```

### 5.2 条件判断

```bash
# ───── if 语句 ─────
if [ "$1" = "start" ]; then
    echo "Starting..."
elif [ "$1" = "stop" ]; then
    echo "Stopping..."
else
    echo "Usage: $0 {start|stop}"
    exit 1
fi

# ───── 常用判断条件 ─────
[ -f file.txt ]     # 文件存在且是普通文件
[ -d /etc ]         # 目录存在
[ -x script.sh ]    # 文件存在且可执行
[ -z "$VAR" ]       # 字符串为空
[ -n "$VAR" ]       # 字符串非空
[ "$A" = "$B" ]     # 字符串相等
[ "$A" != "$B" ]    # 字符串不等
[ $NUM -gt 10 ]     # 数字大于 (greater than)
[ $NUM -lt 10 ]     # 数字小于 (less than)
[ $NUM -eq 10 ]     # 数字等于 (equal)

# ───── 现代写法 [[ ]] 更安全 ─────
if [[ "$1" =~ ^[0-9]+$ ]]; then
    echo "参数是纯数字"
fi
```

### 5.3 循环

```bash
# ───── for 循环 ─────
for i in {1..5}; do
    echo "第 $i 次"
done

for file in *.log; do
    gzip "$file"
done

# ───── while 循环 ─────
COUNT=0
while [ $COUNT -lt 5 ]; do
    echo "Count: $COUNT"
    COUNT=$((COUNT + 1))
done

# ───── 读取文件每一行 ─────
while IFS= read -r line; do
    echo "行内容: $line"
done < file.txt
```

### 5.4 函数

```bash
# 定义函数
log() {
    local level="$1"      # local 限制作用域（好习惯！）
    local msg="$2"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $msg"
}

# 调用
log "INFO" "服务启动成功"
log "ERROR" "数据库连接失败"
```

### 5.5 实用脚本示例

```bash
#!/bin/bash
# deploy.sh —— 一个简易的部署脚本

set -e

APP_NAME="myapp"
DEPLOY_DIR="/opt/$APP_NAME"
BACKUP_DIR="/opt/backups/$APP_NAME"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# 彩色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

log_info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    log_error "请在项目根目录执行此脚本"
    exit 1
fi

# 备份当前版本
if [ -d "$DEPLOY_DIR" ]; then
    log_info "备份当前版本..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$DEPLOY_DIR" "$BACKUP_DIR/$TIMESTAMP"
fi

# 安装依赖 & 构建
log_info "安装依赖..."
npm ci --production

log_info "构建项目..."
npm run build

# 部署
log_info "部署到 $DEPLOY_DIR..."
mkdir -p "$DEPLOY_DIR"
cp -r dist/* "$DEPLOY_DIR/"

# 重启服务
log_info "重启服务..."
sudo systemctl restart "$APP_NAME"

# 健康检查
sleep 3
if curl -sf http://localhost:3000/health > /dev/null; then
    log_info "✅ 部署成功！"
else
    log_error "❌ 健康检查失败，正在回滚..."
    rm -rf "$DEPLOY_DIR"
    cp -r "$BACKUP_DIR/$TIMESTAMP" "$DEPLOY_DIR"
    sudo systemctl restart "$APP_NAME"
    log_info "已回滚到上一个版本"
    exit 1
fi
```

---

## 六、Systemd 服务管理 —— 让你的程序开机自启

### 6.1 编写 Service 文件

```bash
# 创建服务文件
sudo vim /etc/systemd/system/myapp.service
```

```ini
[Unit]
Description=My Application
After=network.target          # 在网络启动后再启动
# After=mysql.service         # 也可以等数据库先启动

[Service]
Type=simple                   # simple | forking | oneshot
User=www-data                 # 以哪个用户运行
Group=www-data
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/node /opt/myapp/index.js
ExecStop=/bin/kill -TERM $MAINPID
Restart=on-failure            # 失败后自动重启
RestartSec=5                  # 重启间隔 5 秒
Environment=NODE_ENV=production
EnvironmentFile=-/etc/myapp/env  # - 表示文件不存在也不报错

# 日志
StandardOutput=journal
StandardError=journal
SyslogIdentifier=myapp

[Install]
WantedBy=multi-user.target    # 多用户模式下启动
```

```bash
# 重载配置 & 启动
sudo systemctl daemon-reload      # 每次修改 service 文件后都要执行
sudo systemctl enable myapp       # 开机自启
sudo systemctl start myapp        # 启动
sudo systemctl status myapp       # 查看状态
sudo systemctl stop myapp         # 停止
sudo systemctl restart myapp      # 重启

# 查看日志
journalctl -u myapp -f            # 实时查看日志
journalctl -u myapp --since today # 今天的日志
journalctl -u myapp -n 50         # 最近 50 行
```

---

## 七、高效工作技巧

### 7.1 命令行历史

```bash
history                 # 查看命令历史
!123                    # 执行历史中第 123 条命令
!!                      # 执行上一条命令
!$                      # 引用上一条命令的最后一个参数
sudo !!                 # 用 sudo 重新执行上一条命令（忘了 sudo 时超有用）
Ctrl+R                  # 反向搜索命令历史（最常用！）
```

### 7.2 别名

```bash
# 查看已有别名
alias

# 设置别名
alias ll='ls -alF'
alias gs='git status'
alias gp='git pull'
alias k='kubectl'

# 永久生效：写入 ~/.bashrc 或 ~/.bash_aliases
echo "alias ll='ls -alF'" >> ~/.bashrc
source ~/.bashrc
```

### 7.3 环境变量

```bash
# 查看
env                     # 查看所有环境变量
echo $PATH              # 查看 PATH

# 临时设置（仅当前 shell）
export MY_VAR="hello"
export PATH="$HOME/bin:$PATH"

# 永久设置：写入 ~/.bashrc 或 ~/.profile
echo 'export JAVA_HOME=/usr/lib/jvm/java-17' >> ~/.bashrc
source ~/.bashrc
```

### 7.4 Vim 速成（够用就行）

```bash
# 模式切换
i           # 进入插入模式（编辑）
Esc         # 退回命令模式
:w          # 保存
:q          # 退出
:wq         # 保存并退出
:q!         # 不保存强制退出

# 在命令模式下
dd          # 删除当前行
yy          # 复制当前行
p           # 粘贴
u           # 撤销
Ctrl+R      # 重做
/pattern    # 搜索
n           # 下一个匹配
:%s/old/new/g   # 全文替换
gg          # 跳到文件开头
G           # 跳到文件末尾
```

---

## 八、排查问题三板斧

```bash
# 第一板斧：看日志
tail -f /var/log/syslog
journalctl -xe
dmesg | tail -20          # 内核日志

# 第二板斧：看资源
top                       # CPU + 内存
df -h                     # 磁盘空间
free -h                   # 内存
iostat -x 1               # 磁盘 I/O（需安装 sysstat）

# 第三板斧：看进程
ps aux | sort -rk 3 | head -5    # CPU 占用 Top 5
ps aux | sort -rk 4 | head -5    # 内存占用 Top 5
lsof -i :8080                    # 谁在用 8080 端口
strace -p <PID>                  # 追踪进程的系统调用（终极调试手段）
```

---

## 九、学习路线建议

```
入门阶段（1-2 周）
├── 理解"一切皆文件"
├── 文件操作：ls, cd, cp, mv, rm, cat, less, find
├── 权限概念：chmod, chown, sudo
├── 管道和重定向：|, >, >>, <
└── 用 Vim 做基本编辑

进阶阶段（2-4 周）
├── 文本处理三剑客：grep, awk, sed
├── 进程管理：ps, top, kill, nohup, jobs
├── Shell 脚本编写
├── Systemd 服务管理
└── 用户和组管理

高级阶段（持续学习）
├── 网络诊断：ss, tcpdump, iptables/ufw
├── 性能分析：strace, lsof, perf, iostat
├── 内核参数调优：/proc/sys, sysctl
├── 安全加固：SELinux/AppArmor, fail2ban
└── 容器化：Docker, systemd-nspawn
```

---

## 十、核心总结

> **Linux 的学习不是背命令，而是理解它的设计哲学。**

1. **一切皆文件** → 学一个操作模式，应用到一切
2. **小而美 + 管道** → 学会"搭积木"，而不是找"万能工具"
3. **文本为王** → 配置、日志、数据，全部可用 grep/vim 搞定
4. **沉默是金** → 没报错就是成功，学会用 `$?` 和日志验证
5. **一切可脚本化** → 重复操作就该写成脚本，解放自己

记住这五点，Linux 的学习就会从"背命令"变成"理解系统"，事半功倍。
