---
icon: performance
---

# 服务器性能优化指南

服务器性能优化目标是让系统运行更稳定、响应更快、资源使用更高效。本文档按常见性能瓶颈分类，给出优化措施、排查思路与常用命令。

## 1. 性能优化总体思路

- 先监控再优化：通过指标找出瓶颈，不要盲目调参。
- 分层定位：操作系统、网络、存储、应用、数据库分别分析。
- 量化指标：CPU、内存、IO、网络、负载、延迟等。
- 先排查热点：高 CPU、内存泄漏、磁盘满、慢查询、线程阻塞。

## 2. 常见性能指标

- CPU 使用率：%user、%system、%idle、%iowait。
- 内存使用：已用、空闲、缓存、交换区（swap）。
- 磁盘 IO：读写速率、IOPS、等待时间、队列深度。
- 网络：吞吐量、丢包、重传、连接数。
- 负载：1/5/15 分钟平均负载。
- 应用响应：请求延迟、慢查询、并发数。

## 3. 操作系统层面优化

### 3.1 CPU 优化

- 检查高耗 CPU 进程：`top`、`htop`、`ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu | head`
- 关停或重启异常进程。
- 对多线程/多进程应用使用 `taskset` 或 `cset` 固定 CPU 亲和性。
- 关停不必要服务，释放 CPU 资源。

常用命令：
- `top` / `htop`
- `ps -aux --sort=-%cpu | head -n 20`
- `mpstat -P ALL 1`
- `sar -u 1 5`

### 3.2 内存优化

- 检查内存占用：`free -m`、`vmstat`。
- 识别内存泄漏：`top`、`ps`、`pmap`、`smem`。
- 减少 swap 使用：`swapon -s`、`cat /proc/swaps`、`sudo swapoff -a`（谨慎）
- 优化缓存/页面回收：`echo 3 > /proc/sys/vm/drop_caches`（仅测试）
- 调整 `vm.swappiness`：降低 swap 触发阈值。

常用命令：
- `free -h`
- `vmstat 1 5`
- `cat /proc/meminfo`
- `smem -rt`
- `pmap -x <pid> | sort -k 4 -nr | head`

### 3.3 磁盘与文件系统优化

- 检查磁盘空间：`df -h`。
- 检查磁盘 IO：`iostat -x 1 5`、`iotop`。
- 磁盘瓶颈时：考虑提升 RAID、SSD、缓存、分区优化。
- 清理日志、过期缓存、临时文件。
- 对数据库或日志密集型应用，使用专用盘或独立分区。
- 调整文件系统挂载选项：`noatime`、`nodiratime`。
- 检查 inode 使用：`df -i`。

常用命令：
- `df -h` / `df -i`
- `iostat -x 1 5`
- `iotop -o`
- `lsblk`
- `du -sh /var/log/* | sort -hr | head`
- `tune2fs -o noatime /dev/sdX`

### 3.4 网络性能优化

- 检查网络带宽和丢包：`iftop`、`nload`、`iperf3`。
- 检查网络连接状态：`ss -tunlp`、`netstat -anp`。
- 优化 TCP 参数：
  - `net.core.somaxconn`
  - `net.ipv4.tcp_tw_recycle`
  - `net.ipv4.tcp_tw_reuse`
  - `net.ipv4.tcp_fin_timeout`
  - `net.core.netdev_max_backlog`
  - `net.ipv4.tcp_max_syn_backlog`
- 使用负载均衡、反向代理、缓存层、压缩、HTTP/2 等减轻后端压力。

常用命令：
- `ss -tulpn`
- `netstat -anp | grep ESTABLISHED | wc -l`
- `iftop -i eth0`
- `nload eth0`
- `ping` / `traceroute`
- `iperf3 -s` / `iperf3 -c <server>`
- `tcptraceroute`

### 3.5 系统参数调整

常见内核参数调整可以保留长期稳定性：
- `sysctl -w net.ipv4.tcp_tw_reuse=1`
- `sysctl -w net.ipv4.tcp_fin_timeout=30`
- `sysctl -w vm.swappiness=10`
- `sysctl -w vm.dirty_ratio=15`
- `sysctl -w vm.dirty_background_ratio=5`
- `sysctl -w fs.file-max=200000`
- `sysctl -w net.core.somaxconn=1024`
- `sysctl -w net.core.netdev_max_backlog=2500`

这些配置可写入 `/etc/sysctl.conf` 或 `/etc/sysctl.d/*.conf`。

## 4. 应用层优化

### 4.1 并发与连接管理

- 限制连接数、控制并发线程池或协程数。
- 使用异步 IO、连接复用、HTTP Keep-Alive。
- 对 Java 应用优化 JVM 参数：`-Xms`、`-Xmx`、`-XX:+UseG1GC`、`-XX:MaxGCPauseMillis=200`。
- 对 Node.js 应用使用集群模式或 PM2 进程管理。

### 4.2 缓存与静态资源

- 使用 Redis、Memcached、CDN 缓存热点数据。
- 静态资源使用 Nginx/OSS 缓存、浏览器缓存、gzip/ Brotli 压缩。
- 减少数据库查询频率、使用批量读取与预取。

### 4.3 数据库性能

- 检查慢查询：MySQL `SHOW GLOBAL STATUS`、`SHOW PROCESSLIST`、`EXPLAIN`。
- 建立合理索引，避免全表扫描。
- 优化事务、避免长事务和锁争用。
- 使用连接池、读写分离、分表分库、缓存结果。
- 调整数据库参数：`innodb_buffer_pool_size`、`query_cache_size`（旧版本）等。

常用命令/查询：
- `mysqladmin processlist`
- `mysql -e "SHOW GLOBAL STATUS LIKE 'Threads_connected'"`
- `mysql -e "SHOW PROCESSLIST"`
- `mysql -e "SHOW VARIABLES LIKE 'innodb_buffer_pool_size'"`
- `EXPLAIN SELECT ...`

## 5. 监控与诊断工具

- 系统级：`top`、`htop`、`vmstat`、`iostat`、`dstat`、`iotop`、`netstat`、`ss`。
- 日志分析：`journalctl`、`tail -f /var/log/syslog`、`grep`。
- 网络测试：`ping`、`traceroute`、`iperf3`、`curl -I`。
- 应用监控：Prometheus、Zabbix、Grafana、ELK、Datadog 等。
- 性能剖析：`perf`、`strace`、`lsof`、`pstack`。

## 6. 常见优化场景与命令汇总

### 6.1 排查 CPU 瓶颈

- `top -b -n 1 | head -20`
- `ps -eo pid,comm,pcpu,pmem --sort=-pcpu | head` 
- `pidstat 1 5`

### 6.2 排查内存瓶颈

- `free -m`
- `vmstat 1 5`
- `smem -k`
- `pmap -x <pid> | sort -nrk 4 | head`

### 6.3 排查磁盘瓶颈

- `iostat -x 1 5`
- `iotop -o -P`
- `df -h`
- `du -sh /var/log/* | sort -hr | head`

### 6.4 排查网络瓶颈

- `ss -tunlp`
- `netstat -s`
- `iftop -i eth0`
- `ping -c 10 <host>`
- `iperf3 -c <host>`

### 6.5 查看系统负载

- `uptime`
- `cat /proc/loadavg`
- `top` / `htop`

## 7. 结论与建议

- 先定位再优化，避免无效调参。
- 定期监控与容量规划，提前发现性能问题。
- 线上调整时谨慎测试，优先在预发布环境验证。
- 结合业务需求，选择适合的缓存、负载均衡、资源隔离方案。
- 记录优化结果，形成可复现的运维方案。
