---
title: Linux 入侵痕迹监测
icon: security
category:
  - Serve
  - Linux
  - 安全
tag:
  - linux
  - 安全
  - 应急响应
  - 入侵检测
---

# Linux 入侵痕迹监测

> 本文档面向**防御侧**：当怀疑服务器被入侵，或日常巡检需要排查异常时，如何系统地发现攻击者留下的痕迹，以及攻击者清除痕迹后如何反查。所有命令均为只读排查，不会修改系统状态。

---

## 目录

1. [排查思路与优先级](#排查思路与优先级)
2. [接入与登录痕迹](#接入与登录痕迹)
3. [用户与账户痕迹](#用户与账户痕迹)
4. [进程与网络痕迹](#进程与网络痕迹)
5. [文件系统痕迹](#文件系统痕迹)
6. [历史命令痕迹](#历史命令痕迹)
7. [持久化痕迹](#持久化痕迹)
8. [日志排查](#日志排查)
9. [auditd 审计配置](#auditd-审计配置)
10. [Rootkit 检测](#rootkit-检测)
11. [痕迹被清理后如何发现](#痕迹被清理后如何发现)
12. [常用工具汇总](#常用工具汇总)
13. [应急响应流程小结](#应急响应流程小结)

---

## 排查思路与优先级

入侵排查遵循「先易失、后难失」的原则：内存、网络连接、进程这些易失数据最先消失，必须优先固定；日志、文件等持久化痕迹可以稍后细查。

| 优先级 | 排查对象 | 易失性 | 说明 |
| :----: | -------- | :----: | ---- |
| P0 | 网络连接、进程、内存 | 极高 | 重启即丢失，第一时间固定 |
| P1 | 登录记录、当前用户 | 中 | wtmp/utmp 记录，重启仍在 |
| P2 | 文件系统、计划任务 | 低 | 持久化后门所在，需细查 |
| P3 | 历史日志、审计记录 | 低 | 时间跨度最大，溯源依据 |

> 提示：若条件允许，排查前先用 `dd` / `LiME` 对内存做镜像，用 `tar` 打包 `/var/log`，避免后续操作覆盖证据。

---

## 接入与登录痕迹

### 1. 当前在线用户

```bash
# 查看当前登录的所有用户、来源 IP、登录时间
w
# 等价于 w，信息更简略
who
# 仅列出登录用户名
users
```

重点关注：陌生用户名、异常来源 IP、长时间「still logged in」的会话、非业务时段的登录。

### 2. 历史登录记录

登录成功记录保存在 `/var/log/wtmp`（二进制），用 `last` 读取：

```bash
# 所有用户的登录历史（用户、终端、来源 IP、时间）
last
# 查看指定用户
last root
# 查看登录失败记录（/var/log/btmp）
lastb
# 查看 reboot 记录，判断是否有异常重启
last reboot
# 统计每个 IP 登录次数，找出异常高频来源
last | awk '{print $3}' | sort | uniq -c | sort -rn | head
```

`lastb`（失败登录）尤其重要：大量失败后紧跟一次成功，往往是爆破成功的特征。

### 3. wtmp / btmp 文件本身

```bash
# 查看登录相关二进制文件的时间与大小
ls -l /var/log/wtmp /var/log/btmp /var/log/utmp
# 文件大小为 0 或时间戳异常 → 可能被清空（见后文「痕迹被清理」）
file /var/log/wtmp
```

`/var/log/wtmp` 记录登录，`/var/log/btmp` 记录失败登录，`/var/run/utmp` 记录当前在线。三者被清空是强信号。

---

## 用户与账户痕迹

### 1. 异常账户

```bash
# 查看所有可登录用户（shell 非 nologin/false）
grep -v -E "nologin|false|sync|shutdown|halt" /etc/passwd
# 查找 UID 为 0 的用户（除 root 外不应存在）
awk -F: '$3==0 {print $1}' /etc/passwd
# 查找空口令账户
awk -F: '($2==""){print $1}' /etc/shadow
# 查看近期新增/修改的用户（按时间）
ls -lart /etc/passwd /etc/shadow /etc/group
```

UID 为 0 的非 root 账户、隐藏用户名（如大写 ROOT、空格用户名）是常见后门。

### 2. 提权配置

```bash
# 谁能执行 sudo，是否有异常 NOPASSWD
cat /etc/sudoers
ls -l /etc/sudoers.d/
# SUID 提权：找出近期的 SUID 文件（见文件系统章节）
find / -perm -4000 -type f 2>/dev/null
```

### 3. SSH 公钥后门

攻击者最常用的持久化之一：往 `authorized_keys` 塞公钥。

```bash
# 排查所有用户的 authorized_keys
find / -name authorized_keys 2>/dev/null -exec ls -l {} \; -exec cat {} \;
# 检查最近修改的 authorized_keys
find / -name authorized_keys -mtime -30 2>/dev/null
```

重点：陌生公钥、注释字段（末尾 user@host）异常、近期新增的 key。

---

## 进程与网络痕迹

### 1. 异常进程

```bash
# 查看所有进程的完整命令行（含参数）
ps auxf
# 按 CPU 排序
ps aux --sort=-%cpu | head
# 按内存排序
ps aux --sort=-%mem | head
# 查看进程树，找出孤儿进程 / 父进程异常的进程
pstree -ap
# 查找进程名被混淆的（如 [kworker] 带方括号是内核线程，不带方括号的同名进程可疑）
ps aux | grep -E "kworker|kthreadd" | grep -v "\["
```

伪装内核线程是常见手法：真正的内核线程在 `ps` 中显示为 `[kworker/...]`（带方括号），攻击者用普通进程起名 `kworker` 冒充。

### 2. 异常网络连接

```bash
# 所有 TCP 连接及对应进程（推荐 ss）
ss -antp
# 经典 netstat
netstat -antp
# 仅看监听端口
ss -lntp
# 查看对外建立的连接（排查反弹 shell / C2 回连）
ss -ant | grep ESTAB
# 找出连接外网 IP 的进程
ss -antp | grep ESTAB | grep -v "127.0.0.1\|::1"
```

重点关注：连接到陌生外网 IP 的 ESTABLISHED 连接、非业务端口的 LISTEN、`udp` 反弹。

### 3. 进程打开的文件与端口

```bash
# 某个可疑进程打开了哪些文件、网络连接
lsof -p <PID>
# 某端口对应进程
lsof -i:<端口>
# 查看所有网络连接关联的进程
lsof -i
# 已删除但仍被进程占用的文件（攻击者常删二进制留进程运行）
lsof | grep deleted
```

`lsof | grep deleted` 是高价值命令：攻击者上传后门后删除文件，但进程仍持有句柄——文件已不存在但进程还在跑。

### 4. 反弹 Shell 特征

```bash
# 反弹 shell 常见特征：bash/sh 持有网络 socket
lsof -p $(pgrep -x bash) 2>/dev/null | grep -E "TCP|UDP"
# 或查找建立了对外 TCP 连接的 shell 进程
for pid in $(pgrep -x "bash|sh|python|perl|nc|ncat"); do
  ls -l /proc/$pid/exe 2>/dev/null
  cat /proc/$pid/cmdline 2>/dev/null | tr '\0' ' '; echo
done
```

---

## 文件系统痕迹

### 1. 按时间排查最近修改

```bash
# 最近 3 天内修改的文件（排查攻击发生后的改动）
find / -mtime -3 -type f 2>/dev/null \
  | grep -vE "^/proc|^/sys|^/run|^/dev"
# 最近 3 天内新增的文件（change time，权限/属性变化）
find / -ctime -3 -type f 2>/dev/null \
  | grep -vE "^/proc|^/sys|^/run|^/dev"
# 排查 /tmp、/var/tmp、/dev/shm 等攻击者常用可写目录
ls -lart /tmp /var/tmp /dev/shm
```

`mtime`（内容修改）、`ctime`（状态改变）、`atime`（访问）。排查时优先按攻击发生时间窗口过滤。

### 2. SUID / SGID 异常文件

```bash
# 所有 SUID 文件（提权后门常用）
find / -perm -4000 -type f 2>/dev/null
# 所有 SGID 文件
find / -perm -2000 -type f 2>/dev/null
# 与系统基线对比，找出新增的 SUID 程序
```

正常 SUID 集合是固定的（`/usr/bin/sudo`、`/usr/bin/passwd`、`/usr/bin/su` 等），任何新增都需警惕。

### 3. 隐藏文件与目录

```bash
# 查找以 . 开头的隐藏文件（攻击者常藏工具于此）
find / -name ".*" -type f 2>/dev/null \
  | grep -vE "^/proc|^/sys|^/run|^/dev"
# 检查常见藏匿点
ls -la /tmp/.* /var/tmp/.* /dev/shm/.* 2>/dev/null
```

### 4. 关键目录完整性

```bash
# 系统关键二进制目录时间戳
ls -la /bin /sbin /usr/bin /usr/sbin /usr/local/bin
# 检查系统命令是否被替换（对比包管理器校验，RPM 系）
rpm -Va 2>/dev/null | grep -E "^..5"
# Debian 系
dpkg --verify 2>/dev/null
```

`rpm -Va` 中第 3 位为 `5` 表示 MD5 校验失败——该文件被篡改过，是替换型后门（如被 patch 过的 `ps`/`netstat`/`ls`）的强证据。

---

## 历史命令痕迹

```bash
# root 的历史命令
cat /root/.bash_history
history
# 所有用户的历史记录
find / -name ".*history" -type f 2>/dev/null -exec ls -l {} \;
# 检查 history 是否被清空（文件存在但为 0 字节，或异常短）
find / -name ".*history" -type f -size 0 2>/dev/null
# 关键命令检索（下载、提权、清理痕迹）
grep -hE "wget|curl|chmod|chown|rm -rf|history -c|unset|nc |ncat|/dev/tcp" \
  /root/.bash_history /home/*/.bash_history 2>/dev/null
```

`.bash_history` 为 0 字节、或文件被 `history -c` 清空、或环境变量 `HISTFILE=/dev/null`、`HISTSIZE=0`，都是攻击者抹除痕迹的典型表现。

---

## 持久化痕迹

攻击者拿到权限后会植入持久化机制保证重启仍有效，这是排查重点。

### 1. 计划任务

```bash
# 所有用户的 crontab
for user in $(cut -f1 -d: /etc/passwd); do
  crontab -u $user -l 2>/dev/null | grep -v "^#" | sed "s/^/$user: /"
done
# 系统级 cron
cat /etc/crontab
ls -la /etc/cron.d/ /etc/cron.daily/ /etc/cron.hourly/ /etc/cron.weekly/ /etc/cron.monthly/
# 检查每个 cron 文件内容
cat /etc/cron.d/* 2>/dev/null
```

### 2. 开机自启

```bash
# systemd 服务（重点关注 recent/modified 的）
systemctl list-unit-files --state=enabled
# 非系统自带的自启服务
systemctl list-units --type=service --state=running
# 传统自启
cat /etc/rc.local 2>/dev/null
ls -la /etc/init.d/ /etc/rc*.d/
# 用户级 systemd 服务（常被滥用）
find /home /root /etc/systemd -name "*.service" 2>/dev/null
ls -la ~/.config/systemd/user/ 2>/dev/null
```

### 3. systemd timer

```bash
# 比 cron 更隐蔽的定时器
systemctl list-timers --all
```

### 4. Shell 配置后门

```bash
# 检查所有 shell 启动文件是否被植入后门
cat /etc/profile /etc/bashrc /root/.bashrc /root/.bash_profile
find /home -name ".bashrc" -exec grep -lE "nc|/dev/tcp|python|perl|base64" {} \;
```

### 5. 动态链接库劫持

```bash
# 检查 LD_PRELOAD 是否被设置（rootkit 常用）
env | grep -i preload
cat /etc/ld.so.preload 2>/dev/null
# 检查 /etc/ld.so.conf.d/ 是否有异常路径
ls -la /etc/ld.so.conf.d/
cat /etc/ld.so.conf.d/*.conf
```

`/etc/ld.so.preload` 指向恶意 `.so` 是用户态 rootkit 的经典手法，可在不替换系统二进制的情况下隐藏进程/文件。

---

## 日志排查

### 1. 关键日志位置

| 日志文件 | 内容 |
| -------- | ---- |
| `/var/log/secure`（RHEL 系） | 认证、sudo、su、SSH 登录 |
| `/var/log/auth.log`（Debian 系） | 同上 |
| `/var/log/messages` / `syslog` | 系统通用日志 |
| `/var/log/audit/audit.log` | auditd 审计日志 |
| `/var/log/maillog` | 邮件服务 |
| `/var/log/cron` | 计划任务执行 |
| `/var/log/wtmp` `btmp` `utmp` | 登录二进制日志 |
| `~/.bash_history` | 用户命令历史 |
| `/var/log/lastlog` | 最后登录记录 |

### 2. 认证日志排查

```bash
# SSH 登录成功
grep "Accepted" /var/log/secure 2>/dev/null || grep "Accepted" /var/log/auth.log 2>/dev/null
# SSH 登录失败（爆破）
grep "Failed password" /var/log/secure 2>/dev/null | head
# 统计爆破来源 IP
grep "Failed password" /var/log/secure 2>/dev/null \
  | awk '{print $(NF-3)}' | sort | uniq -c | sort -rn | head
# sudo / su 提权记录
grep -E "sudo|su:" /var/log/secure 2>/dev/null
# 新建用户记录
grep "useradd" /var/log/secure 2>/dev/null
```

### 3. 日志被篡改的迹象

```bash
# 查看日志文件时间戳与大小
ls -la /var/log/
# 日志文件大小为 0 或明显短于预期 → 被清空
find /var/log -type f -size 0
# 日志被截断（如 cat /dev/null > auth.log）后时间戳会更新
ls -lart /var/log/ | tail
```

---

## auditd 审计配置

`auditd` 是 Linux 内核级的审计框架，能记录命令执行、文件访问、系统调用，是事前布防、事后溯源的核心工具。**应在日常加固阶段就部署好，而非入侵后才装。**

### 1. 安装与启用

```bash
# RHEL 系
yum install audit -y
# Debian 系
apt install auditd -y

systemctl enable --now auditd
```

### 2. 关键审计规则

编辑 `/etc/audit/rules.d/audit.rules`，加入：

```text
# 监控 /etc/passwd 的读写改动
-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/group -p wa -k identity
-w /etc/sudoers -p wa -k scope

# 监控 SSH 配置变更
-w /etc/ssh/sshd_config -p wa -k ssh_config

# 监控计划任务
-w /etc/crontab -p wa -k cron
-w /etc/cron.d/ -p wa -k cron
-w /var/spool/cron/ -p wa -k cron

# 监控登录相关文件被清空（反取证）
-w /var/log/wtmp -p wa -k logins
-w /var/log/btmp -p wa -k logins

# 监控命令执行（64 位系统）
-a always,exit -F arch=b64 -S execve -k cmd

# 监控系统时间篡改
-a always,exit -F arch=b64 -S adjtimex,settimeofday,clock_settime -k time-change
```

加载规则：

```bash
augenrules --load
# 查看已加载规则
auditctl -l
```

### 3. 查询审计日志

```bash
# 查询指定 key 的事件
ausearch -k identity
# 查询某时间范围
ausearch --start today --end now
# 查询登录相关
ausearch -k logins
# 汇总报告
aureport --summary
aureport -x   # 按可执行文件
```

---

## Rootkit 检测

当系统命令本身可能被替换时，`ps`/`netstat`/`ls` 的输出不再可信，需借助专用工具或从内核层交叉验证。

### 1. 专用扫描工具

```bash
# rkhunter：对比已知 rootkit 特征与系统文件哈希
yum install rkhunter -y   # 或 apt install rkhunter
rkhunter --update
rkhunter --check --sk
# chkrootkit
yum install chkrootkit -y  # 或 apt install chkrootkit
chkrootkit
```

### 2. 内核模块排查

```bash
# 查看已加载内核模块，找可疑/未签名的模块
lsmod
# 对比官方模块列表
cat /proc/modules | awk '{print $1}'
# 检查模块目录是否有异常 .ko 文件
find /lib/modules/$(uname -r) -name "*.ko" -mtime -30
```

LKM rootkit（如 adore-ng、Reptile）通过加载内核模块隐藏进程、文件、网络连接。

### 3. 交叉验证

当怀疑用户态工具被篡改时：

```bash
# 用静态编译的 busybox 绕过被 patch 的系统命令
busybox ps aux
busybox netstat -antp
busybox ls -la /tmp
# 从 /proc 直接读取，不依赖 ps
ls -d /proc/[0-9]* | while read p; do
  echo "$p: $(cat $p/cmdline 2>/dev/null | tr '\0' ' ')"
done
```

---

## 痕迹被清理后如何发现

攻击者通常会在撤离前清理痕迹：清空 `wtmp`/`btmp`/`auth.log`、`history -c`、删除后门文件、篡改时间戳。本节聚焦**发现清理行为本身**——清理也会留下「缺失」的痕迹。

### 1. 日志时间断层

```bash
# 日志按天统计行数，找出某天突然为 0 的「断档」
awk '{print $1" "$2}' /var/log/messages 2>/dev/null \
  | cut -d: -f1 | sort | uniq -c
# auth.log 按天统计，正常应有持续记录，突然归零即异常
grep -E "^[A-Z][a-z]{2} [0-9 ]{1,2}" /var/log/auth.log 2>/dev/null \
  | awk '{print $1,$2}' | sort | uniq -c
```

日志中某段时间完全空白，而前后都有正常记录，说明该时段日志被删/被清。

### 2. 登录记录缺失

```bash
# wtmp/btmp 文件大小为 0
ls -l /var/log/wtmp /var/log/btmp
# last 输出异常短或为空，但系统明显运行了很长时间
last | wc -l
# 检查 wtmp 文件是否被截断（mtime 异常新）
stat /var/log/wtmp
```

一台运行数月的服务器，`last` 只有寥寥几行甚至为空，几乎可以断定 `wtmp` 被清。

### 3. 轮转日志还在

```bash
# 即使当前日志被清，logrotate 保留的历史日志可能仍有痕迹
ls -la /var/log/*.log.* /var/log/*.[0-9] /var/log/*.gz 2>/dev/null
# 检查轮转后的历史日志
zcat /var/log/auth.log.1.gz 2>/dev/null | grep "Accepted"
ls -la /var/log/secure-* 2>/dev/null
```

攻击者常忘记清理 `auth.log.1`、`messages-20240101` 这类轮转备份——这是反查的金矿。

### 4. 文件时间戳异常

```bash
# 文件内容时间(mtime) 早于 文件创建时间(ctime) → 时间戳被篡改
find / -type f -mtime -30 2>/dev/null \
  | while read f; do
      m=$(stat -c %Y "$f" 2>/dev/null)
      c=$(stat -c %Z "$f" 2>/dev/null)
      [ -n "$m" ] && [ -n "$c" ] && [ "$m" -gt "$c" ] && echo "$f"
    done 2>/dev/null | head
```

正常情况下 `ctime ≥ mtime`（状态改变不会早于内容修改）。若 `mtime > ctime`，说明有人用 `touch` 倒拨了修改时间。

### 5. atime 异常

```bash
# 被攻击者读取过的后门文件 atime 会更新
# 排查 mtime 很旧但 atime 很新的可疑文件
find / -type f -atime -1 -mtime +30 2>/dev/null \
  | grep -vE "^/proc|^/sys|^/run|^/dev|^/var/log"
```

一个「30 天没改过」但「今天被读过」的系统文件，可能是后门被触发执行。

### 6. 进程与文件矛盾

```bash
# 进程在跑，但对应的二进制文件已被删除（见前文 lsof）
lsof | grep deleted
# PID 占用但 cmdline 为空 → 可能被 rootkit 隐藏
for p in /proc/[0-9]*; do
  [ ! -s "$p/cmdline" ] && echo "空 cmdline: $p"
done
```

### 7. 历史命令缺失

```bash
# .bash_history 为 0 字节但用户活跃登录
find / -name ".*history" -size 0 2>/dev/null
# HISTSIZE 被设为 0 或 HISTFILE 指向 /dev/null
grep -rE "HISTSIZE=0|HISTFILE=/dev/null|unset HISTFILE" \
  /etc/profile /etc/bashrc /root/.bashrc /home/*/.bashrc 2>/dev/null
```

---

## 常用工具汇总

| 工具 | 用途 | 说明 |
| ---- | ---- | ---- |
| `auditd` / `auditctl` | 内核级审计 | 事前布防核心，记录命令/文件/系统调用 |
| `rkhunter` | Rootkit 扫描 | 对比已知特征与文件哈希 |
| `chkrootkit` | Rootkit 扫描 | 同上，交叉使用 |
| `AIDE` | 文件完整性监控 | 替代 Tripwire，记录基线哈希，定期比对 |
| `Tripwire` | 文件完整性监控 | 经典 FIM 工具 |
| `osquery` | SQL 查询系统状态 | 用 SQL 排查进程/文件/ socket |
| `Wazuh` | HIDS / SIEM | 主机入侵检测 + 日志聚合告警 |
| `busybox` | 静态工具集 | 系统命令被篡改时的备用工具 |
| `LiME` | 内存取证 | 采集内存镜像供离线分析 |
| `Volatility` | 内存分析 | 分析内存镜像中的进程/连接/恶意代码 |

### AIDE 快速上手

```bash
yum install aide -y   # 或 apt install aide
# 初始化基线（在系统干净时执行）
aide --init
mv /var/lib/aide/aide.db.new.gz /var/lib/aide/aide.db.gz
# 之后定期校验（入侵后比对即发现被篡改的文件）
aide --check
```

> 基线必须在系统「干净」时建立，否则后门也会被当作正常状态记录。

---

## 应急响应流程小结

1. **隔离**：第一时间断网（保留本机访问），防止攻击者远程销毁证据或横向移动。
2. **固定易失证据**：抓内存镜像、`ps`/`ss`/`lsof` 输出存盘、打包 `/var/log`。
3. **接入排查**：`last`/`lastb`/`w` 找异常登录与爆破。
4. **账户排查**：UID=0 用户、新增用户、`authorized_keys`、sudoers。
5. **进程网络**：`ps auxf`、`ss -antp`、`lsof | grep deleted`、反弹 shell 特征。
6. **持久化排查**：cron、systemd service/timer、rc.local、`.bashrc`、`ld.so.preload`。
7. **文件排查**：`find -mtime`、SUID 文件、`rpm -Va` 校验完整性。
8. **日志深挖**：认证日志、时间断层、轮转备份、清理迹象。
9. **Rootkit 排查**：rkhunter/chkrootkit + busybox 交叉验证。
10. **清除与加固**：清除后门、修补漏洞、部署 auditd/AIDE、改密、收口 SSH（密钥+堡垒机+禁密码）。

> 核心原则：**让访问留痕且可追溯**——部署 `auditd` 事前审计、日志远程转发防本地篡改、堡垒机录制会话、AIDE 守护文件完整性。与其事后排查，不如事前布防。

---

## 参考资料

- [Red Hat: Security Hardening](https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux/8/html/security_hardening/)
- [Linux Audit 官方文档](https://linux.die.net/man/8/auditd)
- [rkhunter 项目](http://rkhunter.sourceforge.net/)
- [AIDE 项目](https://aide.github.io/)
- [osquery 官方文档](https://osquery.io/)
- [Linux 应急响应实战笔记](https://github.com/tide-emergency/yingji)
