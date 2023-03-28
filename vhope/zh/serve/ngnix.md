# Ngnix

nginx configuration

配置nginx时，需要将本地代码上传至服务器，可以看[linux 文件上传](/serve/linux.html#传送文件)

## 启动nginx

`start nginx`

## 查看nginx配置文件地址 
  `nginx -t`
## 重启nginx 
  - 修改配置后重新加载生效  `nginx -s  reload`
  - 重新打开日志文件 `nginx -s  reopen`

## 配置node项目绑定域名

  一般是通过nginx代理实现绑定域名

配置

```javascript
server {
    listen 80; # 端口
    server_name blog.ncgame.cc; # 域名
    location / {
        proxy_pass http://0.0.0.0:3000;
        proxy_read_timeout 18000; # 设置超时
    }
}
```

## HTTPS（SSL）配置

```
server {
    listen       443 ssl; # 端口
    server_name  blog.ncgame.cc;  # 域名

    ssl_certificate     /path/xxx.pem # 证书路径 pem or crt;
    ssl_certificate_key  /path/xxx.key; # 私钥

    ssl_session_cache    shared:SSL:1m;
    ssl_session_timeout  5m;

    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_ciphers  HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers  on;

    location / {
        # 这里可以配置静态服务器 or 代理
    }
}
# http 自动跳转到 https
server{
    listen 80;
    server_name blog.ncgame.cc;
    rewrite ^/(.*)$ https://blog.ncgame.cc:443/$1 permanent;
}
```