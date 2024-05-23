import{_ as i}from"./plugin-vue_export-helper-DlAUqK2U.js";import{r as a,o as t,c as l,b as n,d as e,e as r,w as o,a as c}from"./app-R7pVbBlq.js";const d={},p=n("h1",{id:"ngnix",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#ngnix"},[n("span",null,"Ngnix")])],-1),u=n("p",null,"nginx configuration",-1),g=c(`<h2 id="启动-nginx" tabindex="-1"><a class="header-anchor" href="#启动-nginx"><span>启动 nginx</span></a></h2><p><code>start nginx</code></p><h2 id="查看-nginx-配置文件地址" tabindex="-1"><a class="header-anchor" href="#查看-nginx-配置文件地址"><span>查看 nginx 配置文件地址</span></a></h2><p><code>nginx -t</code></p><h2 id="重启-nginx" tabindex="-1"><a class="header-anchor" href="#重启-nginx"><span>重启 nginx</span></a></h2><ul><li>修改配置后重新加载生效 <code>nginx -s reload</code></li><li>重新打开日志文件 <code>nginx -s reopen</code></li></ul><h2 id="配置-node-项目绑定域名" tabindex="-1"><a class="header-anchor" href="#配置-node-项目绑定域名"><span>配置 node 项目绑定域名</span></a></h2><p>一般是通过 nginx 代理实现绑定域名</p><p>配置</p><div class="language-javascript line-numbers-mode" data-ext="js" data-title="js"><pre class="language-javascript"><code>server <span class="token punctuation">{</span>
    listen <span class="token number">80</span><span class="token punctuation">;</span> # 端口
    server_name blog<span class="token punctuation">.</span>ncgame<span class="token punctuation">.</span>cc<span class="token punctuation">;</span> # 域名
    location <span class="token operator">/</span> <span class="token punctuation">{</span>
        proxy_pass http<span class="token operator">:</span><span class="token operator">/</span><span class="token operator">/</span><span class="token number">0.0</span><span class="token number">.0</span><span class="token number">.0</span><span class="token operator">:</span><span class="token number">3000</span><span class="token punctuation">;</span>
        proxy_read_timeout <span class="token number">18000</span><span class="token punctuation">;</span> # 设置超时
    <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="https-ssl-配置" tabindex="-1"><a class="header-anchor" href="#https-ssl-配置"><span>HTTPS（SSL）配置</span></a></h2><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>server {
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,12);function m(v,x){const s=a("RouteLink");return t(),l("div",null,[p,u,n("p",null,[e("配置 nginx 时，需要将本地代码上传至服务器，可以看"),r(s,{to:"/serve/linux.html#%E4%BC%A0%E9%80%81%E6%96%87%E4%BB%B6"},{default:o(()=>[e("linux 文件上传")]),_:1})]),g])}const _=i(d,[["render",m],["__file","ngnix.html.vue"]]),k=JSON.parse('{"path":"/serve/ngnix.html","title":"Ngnix","lang":"zh-CN","frontmatter":{"icon":"lock","category":["Serve","Guide"],"tag":["nginx"],"description":"Ngnix nginx configuration 配置 nginx 时，需要将本地代码上传至服务器，可以看 启动 nginx start nginx 查看 nginx 配置文件地址 nginx -t 重启 nginx 修改配置后重新加载生效 nginx -s reload 重新打开日志文件 nginx -s reopen 配置 node 项目绑定域名...","head":[["meta",{"property":"og:url","content":"https://lfange.github.io/serve/ngnix.html"}],["meta",{"property":"og:site_name","content":"哓番茄"}],["meta",{"property":"og:title","content":"Ngnix"}],["meta",{"property":"og:description","content":"Ngnix nginx configuration 配置 nginx 时，需要将本地代码上传至服务器，可以看 启动 nginx start nginx 查看 nginx 配置文件地址 nginx -t 重启 nginx 修改配置后重新加载生效 nginx -s reload 重新打开日志文件 nginx -s reopen 配置 node 项目绑定域名..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2023-03-29T13:35:43.000Z"}],["meta",{"property":"article:author","content":"哓番茄"}],["meta",{"property":"article:tag","content":"nginx"}],["meta",{"property":"article:modified_time","content":"2023-03-29T13:35:43.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Ngnix\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2023-03-29T13:35:43.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"哓番茄\\",\\"url\\":\\"https://lfange.github.io/\\"}]}"]]},"headers":[{"level":2,"title":"启动 nginx","slug":"启动-nginx","link":"#启动-nginx","children":[]},{"level":2,"title":"查看 nginx 配置文件地址","slug":"查看-nginx-配置文件地址","link":"#查看-nginx-配置文件地址","children":[]},{"level":2,"title":"重启 nginx","slug":"重启-nginx","link":"#重启-nginx","children":[]},{"level":2,"title":"配置 node 项目绑定域名","slug":"配置-node-项目绑定域名","link":"#配置-node-项目绑定域名","children":[]},{"level":2,"title":"HTTPS（SSL）配置","slug":"https-ssl-配置","link":"#https-ssl-配置","children":[]}],"git":{"createdTime":1670936960000,"updatedTime":1680096943000,"contributors":[{"name":"FanGe","email":"653398363@qq.com","commits":3}]},"readingTime":{"minutes":0.7,"words":210},"filePathRelative":"serve/ngnix.md","localizedDate":"2022年12月13日","excerpt":"","autoDesc":true}');export{_ as comp,k as data};
