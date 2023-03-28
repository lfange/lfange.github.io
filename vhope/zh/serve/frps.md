# frps

[frp](https://github.com/fatedier/frp) 是一个专注于内网穿透的高性能的反向代理应用，支持 TCP、UDP、HTTP、HTTPS 等多种协议。可以将内网服务以安全、便捷的方式通过具有公网 IP 节点的中转暴露到公网

### linux 下载 frps

```javascript
wget https://github.com/fatedier/frp/releases/download/v0.39.1/frp_0.39.1_linux_amd64.tar.gz
```

### 解压

```javascript
tar -zxvf frp_0.39.1_linux_amd64.tar.gz
```

### 服务端 frps.ini

```javascript
[common]
# frp监听的端口，默认是7000，可以改成其他的
bind_port = 7000
# 授权码，请改成更复杂的
token = 52010  # 这个token之后在客户端会用到

# frp管理后台端口，请按自己需求更改
dashboard_port = 7500
# frp管理后台用户名和密码，请改成自己的
dashboard_user = admin
dashboard_pwd = admin
enable_prometheus = true

# frp日志配置
log_file = /var/log/frps.log
log_level = info
log_max_days = 3
```

#### 服务端启动

```javascript
  ./frps -c ./frps.ini
  nohup ./frps -c ./frps.ini &  // linux 后台启动服务
```

### 客户端 frpc.ini

```javascript
[common]
server_addr = remote_IP // example IP 175.178.119.138
server_port = 7000
token=52010

[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 3389
remote_port = 7001

```

#### 客户端启动

```rust
./frpc -c ./frpc.ini
```
