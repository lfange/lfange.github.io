---
title: 抓包与网络排查
icon: article
category:
  - 计算机网络
  - Guide
tag:
  - troubleshooting
  - tcpdump
---

# 抓包与网络排查

## 排查总思路

```text
分层定位：DNS 对不对 → TCP 通不通 → TLS 握手成功没 → HTTP 返回什么

口诀：先 ping 通不通，再 curl 对不对，最后 tcpdump 看细节
```

## 连通性排查

```bash
ping baidu.com            # ICMP：网络层连通性 + RTT + 丢包率
ping -c 4 -i 0.2 host     # 指定次数与间隔

# ping 不通 ≠ 主机挂了（ICMP 可能被防火墙禁了），继续测端口：

curl -v telnet://example.com:443     # 测端口连通（TLS 握手信息也可见）
nc -zv example.com 443               # 只测端口
telnet example.com 443

traceroute example.com               # 路径追踪（Linux）
tracert example.com                  # Windows
mtr example.com                      # traceroute + ping 持续统计（最好用）
```

### 常见结论对照

| 现象 | 可能原因 |
| --- | --- |
| ping IP 通、ping 域名不通 | DNS 问题 |
| ping 通、端口不通 | 服务没监听 / 防火墙拦端口 |
| 偶发超时 | 丢包，用 mtr 看哪一跳开始丢 |
| 高延迟 | 跨运营商、链路拥塞、GFW |

## curl：HTTP 排查第一工具

```bash
curl -v https://api.example.com           # 全过程：DNS/TLS/请求/响应
curl -o /dev/null -s -w '%{http_code} %{time_namelookup} %{time_connect} \
  %{time_appconnect} %{time_starttransfer} %{time_total}\n' https://example.com
# 拆解耗时：DNS / TCP / TLS / 首字节 / 总耗时 —— 性能定位利器

curl -X POST -H 'Content-Type: application/json' -d '{"a":1}' url
curl -L url                              # 跟随重定向
curl -k https://...                      # 忽略证书错误（仅排查用）
curl --resolve api.example.com:443:10.0.0.5 https://api.example.com
                                         # 域名指向指定 IP（绕过 DNS/测试某节点）
curl -H 'Host: api.example.com' http://10.0.0.5/   # 绕过 LB 直连后端
```

## tcpdump：命令行抓包

```bash
tcpdump -i any -nn port 443 and host 10.0.0.1
# -i any 所有网卡  -nn 不解析域名/端口名（更快更清晰）

tcpdump -i eth0 -nn -w dump.pcap         # 存文件，Wireshark 分析
tcpdump -r dump.pcap                     # 回放

# 常用过滤（BPF 语法）
tcpdump host 10.0.0.1                    # 按 IP
tcpdump port 8080                        # 按端口
tcpdump tcp[13] & 2 != 0                 # SYN 包（TCP 标志位）
tcpdump 'tcp[tcpflags] & (tcp-syn|tcp-fin) != 0'   # 建连+断连
```

### 用 tcpdump 看三次握手

```text
10.0.0.1.54321 > 10.0.0.2.8080: Flags [S]        seq 1234567890
10.0.0.2.8080 > 10.0.0.1.54321: Flags [S.]       seq 9876543210 ack 1234567891
10.0.0.1.54321 > 10.0.0.2.8080: Flags [.]        ack 9876543211
# S=SYN  .=ACK  F=FIN  P=PSH(数据)  R=RST(拒绝/异常重置)
```

**RST 出现的场景**：端口未监听、被防火墙拒绝、连接一端崩溃。

## Wireshark：图形化分析

```text
打开 pcap 文件后的常用姿势：
1. 显示过滤器（比抓包过滤器更高级）：
   http.response.code == 500
   tcp.analysis.retransmission      # 所有重传
   tcp.analysis.zero_window         # 零窗口（接收方撑不住了）
   tcp.flags.reset == 1             # RST
   dns && dns.flags.response == 1
2. Follow TCP Stream：还原完整会话（聊天/HTTP 内容一目了然）
3. Statistics → Flow Graph：时序图可视化（教学神器）
4. I/O Graph：吞吐随时间变化
```

## Linux 服务器侧排查

```bash
# 连接状态分布（一眼看出异常）
ss -tan | awk '{print $1}' | sort | uniq -c
#   大量 TIME_WAIT → 见 TCP 进阶篇
#   大量 CLOSE_WAIT → 应用没关连接，代码 bug

# 谁占着端口
ss -tlnp | grep 8080                  # -t tcp -l 监听 -n 数字 -p 进程
lsof -i :8080

# 重传/丢包统计
netstat -s | grep -iE 'retrans|drop'
nstat -az | grep -i retrans

# 网卡层问题
ethtool -S eth0 | grep -iE 'drop|err'  # 网卡丢包计数
ip -s link show eth0                    # 收发丢包

# 防火墙
iptables -L -n | head
```

## 浏览器侧排查

```text
DevTools → Network：
  Timing 面板：排队 / DNS / TCP / TLS / 等待(TTFB) / 下载 各阶段耗时
  Queueing 太长 → 浏览器并发连接限制（HTTP/1.1 同域 6 个）
  TTFB 太长 → 服务端慢（后端问题，不是网络）
  Content Download 太长 → 响应体大 / 带宽受限

HSTS/证书问题：直接看 Security 面板
```

## 实战案例

### 案例 1：接口偶发 30s 超时

```text
1. curl -w 拆耗时 → time_total 30s，connect 正常，卡在 starttransfer
2. tcpdump 抓包 → 大量重传，对方 ACK 稀疏
3. mtr → 中间某跳丢包 20%
结论：跨机房专线故障，切链路恢复
```

### 案例 2：服务上线后大量连接失败

```text
1. ss -tlnp → 端口在监听
2. 客户端报 connection refused → 抓包看到 RST
3. 检查发现全连接队列溢出：netstat -s | grep -i 'listen queue'
   （overflowed 计数暴涨）
4. 应用 accept 太慢 → 提高 somaxconn + 应用侧扩容
```

### 案例 3：HTTPS 证书校验失败

```text
curl -v → SSL certificate problem: unable to get local issuer certificate
原因：服务器没下发中间证书链
验证：openssl s_client -connect example.com:443 -servername example.com
      看 Certificate chain 是否完整
```

## 工具速查表

| 需求 | 工具 |
| --- | --- |
| HTTP 请求细节 | curl -v / httpie |
| HTTP 抓包调试代理 | Charles / Fiddler / mitmproxy / Whistle |
| TCP 层分析 | tcpdump + Wireshark |
| 链路质量 | mtr / ping |
| 端口探测 | nc / telnet / nmap |
| 证书诊断 | openssl s_client |
| 服务器连接状态 | ss / lsof / netstat |

下一篇：[计算机网络面试题集](./07-network-interview.md)。
