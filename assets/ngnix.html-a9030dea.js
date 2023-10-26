import{_ as a}from"./plugin-vue_export-helper-c27b6911.js";import{r as i,o as l,c as r,b as n,d as e,f as t,w as c,e as d}from"./app-0956f404.js";const o={},p=n("h1",{id:"ngnix",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#ngnix","aria-hidden":"true"},"#"),e(" Ngnix")],-1),u=n("p",null,"nginx configuration",-1),v=d(`<h2 id="启动-nginx" tabindex="-1"><a class="header-anchor" href="#启动-nginx" aria-hidden="true">#</a> 启动 nginx</h2><p><code>start nginx</code></p><h2 id="查看-nginx-配置文件地址" tabindex="-1"><a class="header-anchor" href="#查看-nginx-配置文件地址" aria-hidden="true">#</a> 查看 nginx 配置文件地址</h2><p><code>nginx -t</code></p><h2 id="重启-nginx" tabindex="-1"><a class="header-anchor" href="#重启-nginx" aria-hidden="true">#</a> 重启 nginx</h2><ul><li>修改配置后重新加载生效 <code>nginx -s reload</code></li><li>重新打开日志文件 <code>nginx -s reopen</code></li></ul><h2 id="配置-node-项目绑定域名" tabindex="-1"><a class="header-anchor" href="#配置-node-项目绑定域名" aria-hidden="true">#</a> 配置 node 项目绑定域名</h2><p>一般是通过 nginx 代理实现绑定域名</p><p>配置</p><div class="language-javascript line-numbers-mode" data-ext="js"><pre class="language-javascript"><code>server <span class="token punctuation">{</span>
    listen <span class="token number">80</span><span class="token punctuation">;</span> # 端口
    server_name blog<span class="token punctuation">.</span>ncgame<span class="token punctuation">.</span>cc<span class="token punctuation">;</span> # 域名
    location <span class="token operator">/</span> <span class="token punctuation">{</span>
        proxy_pass http<span class="token operator">:</span><span class="token operator">/</span><span class="token operator">/</span><span class="token number">0.0</span><span class="token number">.0</span><span class="token number">.0</span><span class="token operator">:</span><span class="token number">3000</span><span class="token punctuation">;</span>
        proxy_read_timeout <span class="token number">18000</span><span class="token punctuation">;</span> # 设置超时
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="https-ssl-配置" tabindex="-1"><a class="header-anchor" href="#https-ssl-配置" aria-hidden="true">#</a> HTTPS（SSL）配置</h2><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>server {
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,12);function m(h,b){const s=i("RouterLink");return l(),r("div",null,[p,u,n("p",null,[e("配置 nginx 时，需要将本地代码上传至服务器，可以看"),t(s,{to:"/serve/linux.html#%E4%BC%A0%E9%80%81%E6%96%87%E4%BB%B6"},{default:c(()=>[e("linux 文件上传")]),_:1})]),v])}const g=a(o,[["render",m],["__file","ngnix.html.vue"]]);export{g as default};
