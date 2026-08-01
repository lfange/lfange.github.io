import{_ as a}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as e,b as t,d as n,e as l,w as c,a as p,r as o,o as i}from"./app-DFE3w5Wj.js";const d={},u=p(`<h1 id="docker-compose-多容器编排" tabindex="-1"><a class="header-anchor" href="#docker-compose-多容器编排"><span>Docker Compose 多容器编排</span></a></h1><blockquote><p>一个真实应用往往由多个服务组成（web + db + cache）。Docker Compose 用一份 <code>compose.yml</code> 声明式定义所有服务及其依赖，一条命令拉起整个环境。本篇系统讲解配置项、命令与实战。</p></blockquote><hr><h2 id="目录" tabindex="-1"><a class="header-anchor" href="#目录"><span>目录</span></a></h2><ol><li><a href="#compose-%E6%98%AF%E4%BB%80%E4%B9%88">Compose 是什么</a></li><li><a href="#%E5%AE%89%E8%A3%85">安装</a></li><li><a href="#composeyml-%E7%BB%93%E6%9E%84">compose.yml 结构</a></li><li><a href="#%E5%B8%B8%E7%94%A8%E9%85%8D%E7%BD%AE%E9%A1%B9">常用配置项</a></li><li><a href="#%E5%AE%8C%E6%95%B4%E7%A4%BA%E4%BE%8B">完整示例</a></li><li><a href="#%E7%8E%AF%E5%A2%83%E5%8F%98%E9%87%8F%E7%AE%A1%E7%90%86">环境变量管理</a></li><li><a href="#profiles-%E5%88%86%E7%BB%84">Profiles 分组</a></li><li><a href="#%E5%B8%B8%E7%94%A8%E5%91%BD%E4%BB%A4">常用命令</a></li><li><a href="#%E6%9C%80%E4%BD%B3%E5%AE%9E%E8%B7%B5">最佳实践</a></li></ol><hr><h2 id="compose-是什么" tabindex="-1"><a class="header-anchor" href="#compose-是什么"><span>Compose 是什么</span></a></h2><p>Docker Compose 是定义和运行多容器 Docker 应用的工具。核心思想：</p><ul><li>用一份 YAML 描述所有服务、网络、数据卷。</li><li><code>docker compose up</code> 一键创建并启动全部。</li><li><code>docker compose down</code> 一键停止并清理。</li></ul><p>适合：本地开发环境、CI/CD、中小型单机部署。大规模集群请用 Kubernetes。</p><blockquote><p>新版 Docker 集成了 Compose，命令为 <code>docker compose</code>（空格）。旧版独立二进制为 <code>docker-compose</code>（连字符）。两者功能基本一致，推荐用 <code>docker compose</code>。</p></blockquote><hr><h2 id="安装" tabindex="-1"><a class="header-anchor" href="#安装"><span>安装</span></a></h2><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># Docker Desktop（Win/Mac）自带 Compose</span>
<span class="token comment"># Linux 安装 Docker 时若装了 docker-compose-plugin 即可用 docker compose</span>

<span class="token comment"># 验证</span>
<span class="token function">docker</span> compose version
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>旧版独立安装（可选）：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 下载二进制</span>
<span class="token function">curl</span> <span class="token parameter variable">-SL</span> https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-linux-x86_64 <span class="token punctuation">\\</span>
  <span class="token parameter variable">-o</span> /usr/local/bin/docker-compose
<span class="token function">chmod</span> +x /usr/local/bin/docker-compose
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="compose-yml-结构" tabindex="-1"><a class="header-anchor" href="#compose-yml-结构"><span>compose.yml 结构</span></a></h2><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token comment"># 顶层三大块：services / volumes / networks</span>
<span class="token key atrule">services</span><span class="token punctuation">:</span>
  <span class="token key atrule">web</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> nginx<span class="token punctuation">:</span><span class="token number">1.25</span>
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;80:80&quot;</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> html<span class="token punctuation">:</span>/usr/share/nginx/html
    <span class="token key atrule">depends_on</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> db
    <span class="token key atrule">restart</span><span class="token punctuation">:</span> unless<span class="token punctuation">-</span>stopped

  <span class="token key atrule">db</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> mysql<span class="token punctuation">:</span><span class="token number">8</span>
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token key atrule">MYSQL_ROOT_PASSWORD</span><span class="token punctuation">:</span> secret
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> db<span class="token punctuation">-</span>data<span class="token punctuation">:</span>/var/lib/mysql

<span class="token key atrule">volumes</span><span class="token punctuation">:</span>
  <span class="token key atrule">html</span><span class="token punctuation">:</span>
  <span class="token key atrule">db-data</span><span class="token punctuation">:</span>

<span class="token key atrule">networks</span><span class="token punctuation">:</span>
  <span class="token key atrule">default</span><span class="token punctuation">:</span>
    <span class="token key atrule">driver</span><span class="token punctuation">:</span> bridge
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>三个顶层键：</p><table><thead><tr><th>键</th><th>作用</th></tr></thead><tbody><tr><td><code>services</code></td><td>定义各个容器服务（必填）</td></tr><tr><td><code>volumes</code></td><td>声明命名数据卷</td></tr><tr><td><code>networks</code></td><td>声明网络</td></tr></tbody></table><p>文件名优先级：<code>compose.yaml</code> &gt; <code>compose.yml</code> &gt; <code>docker-compose.yaml</code> &gt; <code>docker-compose.yml</code>。可用 <code>-f</code> 指定。</p><hr><h2 id="常用配置项" tabindex="-1"><a class="header-anchor" href="#常用配置项"><span>常用配置项</span></a></h2><h3 id="服务配置项总览" tabindex="-1"><a class="header-anchor" href="#服务配置项总览"><span>服务配置项总览</span></a></h3><table><thead><tr><th>配置</th><th>说明</th></tr></thead><tbody><tr><td><code>image</code></td><td>使用的镜像</td></tr><tr><td><code>build</code></td><td>构建镜像（替代 image）</td></tr><tr><td><code>ports</code></td><td>端口映射</td></tr><tr><td><code>volumes</code></td><td>挂载卷/目录</td></tr><tr><td><code>environment</code> / <code>env_file</code></td><td>环境变量</td></tr><tr><td><code>depends_on</code></td><td>依赖（启动顺序）</td></tr><tr><td><code>restart</code></td><td>重启策略</td></tr><tr><td><code>networks</code></td><td>加入的网络</td></tr><tr><td><code>command</code></td><td>覆盖默认命令</td></tr><tr><td><code>entrypoint</code></td><td>覆盖入口点</td></tr><tr><td><code>working_dir</code></td><td>工作目录</td></tr><tr><td><code>user</code></td><td>运行用户</td></tr><tr><td><code>healthcheck</code></td><td>健康检查</td></tr><tr><td><code>deploy</code></td><td>Swarm 部署配置（副本、资源限制）</td></tr><tr><td><code>labels</code></td><td>标签</td></tr><tr><td><code>logging</code></td><td>日志配置</td></tr></tbody></table><h3 id="build-构建镜像" tabindex="-1"><a class="header-anchor" href="#build-构建镜像"><span>build - 构建镜像</span></a></h3><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">services</span><span class="token punctuation">:</span>
  <span class="token key atrule">web</span><span class="token punctuation">:</span>
    <span class="token key atrule">build</span><span class="token punctuation">:</span>
      <span class="token key atrule">context</span><span class="token punctuation">:</span> ./web            <span class="token comment"># 构建上下文</span>
      <span class="token key atrule">dockerfile</span><span class="token punctuation">:</span> Dockerfile.prod
      <span class="token key atrule">args</span><span class="token punctuation">:</span>                     <span class="token comment"># 构建参数</span>
        <span class="token key atrule">VERSION</span><span class="token punctuation">:</span> <span class="token number">1.0</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> myapp<span class="token punctuation">:</span><span class="token number">1.0</span>            <span class="token comment"># 构建后镜像名</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="ports-端口" tabindex="-1"><a class="header-anchor" href="#ports-端口"><span>ports - 端口</span></a></h3><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">ports</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token string">&quot;80:80&quot;</span>          <span class="token comment"># 宿主:容器</span>
  <span class="token punctuation">-</span> <span class="token string">&quot;443:443&quot;</span>
  <span class="token punctuation">-</span> <span class="token string">&quot;3000&quot;</span>           <span class="token comment"># 仅容器端口，宿主随机</span>
  <span class="token punctuation">-</span> <span class="token string">&quot;127.0.0.1:8000:8000&quot;</span>  <span class="token comment"># 绑定到本地回环</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="volumes-挂载" tabindex="-1"><a class="header-anchor" href="#volumes-挂载"><span>volumes - 挂载</span></a></h3><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">volumes</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> db<span class="token punctuation">-</span>data<span class="token punctuation">:</span>/var/lib/mysql       <span class="token comment"># 命名卷</span>
  <span class="token punctuation">-</span> ./conf<span class="token punctuation">:</span>/etc/nginx/conf.d<span class="token punctuation">:</span>ro  <span class="token comment"># bind mount，只读</span>
  <span class="token punctuation">-</span> /tmp/cache<span class="token punctuation">:</span>/tmp/cache
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="environment-env-file" tabindex="-1"><a class="header-anchor" href="#environment-env-file"><span>environment / env_file</span></a></h3><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token comment"># 直接写</span>
<span class="token key atrule">environment</span><span class="token punctuation">:</span>
  <span class="token key atrule">MYSQL_ROOT_PASSWORD</span><span class="token punctuation">:</span> secret
  <span class="token key atrule">DEBUG</span><span class="token punctuation">:</span> <span class="token string">&quot;true&quot;</span>

<span class="token comment"># 从文件读</span>
<span class="token key atrule">env_file</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> .env
  <span class="token punctuation">-</span> .env.production
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="depends-on-启动顺序与健康检查" tabindex="-1"><a class="header-anchor" href="#depends-on-启动顺序与健康检查"><span>depends_on - 启动顺序与健康检查</span></a></h3><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">services</span><span class="token punctuation">:</span>
  <span class="token key atrule">web</span><span class="token punctuation">:</span>
    <span class="token key atrule">depends_on</span><span class="token punctuation">:</span>
      <span class="token key atrule">db</span><span class="token punctuation">:</span>
        <span class="token key atrule">condition</span><span class="token punctuation">:</span> service_healthy    <span class="token comment"># 等 db 健康才启动</span>
  <span class="token key atrule">db</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> mysql<span class="token punctuation">:</span><span class="token number">8</span>
    <span class="token key atrule">healthcheck</span><span class="token punctuation">:</span>
      <span class="token key atrule">test</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;CMD&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;mysqladmin&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;ping&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;-h&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;localhost&quot;</span><span class="token punctuation">]</span>
      <span class="token key atrule">interval</span><span class="token punctuation">:</span> 10s
      <span class="token key atrule">timeout</span><span class="token punctuation">:</span> 5s
      <span class="token key atrule">retries</span><span class="token punctuation">:</span> <span class="token number">5</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><code>depends_on</code> 只控制启动顺序，不等待「就绪」。要等就绪，用 <code>condition: service_healthy</code> 配合 <code>healthcheck</code>。</p></blockquote><h3 id="restart" tabindex="-1"><a class="header-anchor" href="#restart"><span>restart</span></a></h3><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">restart</span><span class="token punctuation">:</span> unless<span class="token punctuation">-</span>stopped    <span class="token comment"># 推荐：除非手动停止，否则总重启</span>
<span class="token comment"># no / always / unless-stopped / on-failure</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="networks" tabindex="-1"><a class="header-anchor" href="#networks"><span>networks</span></a></h3><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">services</span><span class="token punctuation">:</span>
  <span class="token key atrule">web</span><span class="token punctuation">:</span>
    <span class="token key atrule">networks</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> frontend
  <span class="token key atrule">db</span><span class="token punctuation">:</span>
    <span class="token key atrule">networks</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> backend

<span class="token key atrule">networks</span><span class="token punctuation">:</span>
  <span class="token key atrule">frontend</span><span class="token punctuation">:</span>
    <span class="token key atrule">driver</span><span class="token punctuation">:</span> bridge
  <span class="token key atrule">backend</span><span class="token punctuation">:</span>
    <span class="token key atrule">driver</span><span class="token punctuation">:</span> bridge
    <span class="token key atrule">internal</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>       <span class="token comment"># 内部网络，不可访问外网</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="deploy-资源限制-compose-v2-swarm" tabindex="-1"><a class="header-anchor" href="#deploy-资源限制-compose-v2-swarm"><span>deploy - 资源限制（Compose v2 / Swarm）</span></a></h3><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">deploy</span><span class="token punctuation">:</span>
  <span class="token key atrule">replicas</span><span class="token punctuation">:</span> <span class="token number">3</span>                          <span class="token comment"># 副本数（Swarm 生效）</span>
  <span class="token key atrule">resources</span><span class="token punctuation">:</span>
    <span class="token key atrule">limits</span><span class="token punctuation">:</span>
      <span class="token key atrule">cpus</span><span class="token punctuation">:</span> <span class="token string">&#39;0.5&#39;</span>
      <span class="token key atrule">memory</span><span class="token punctuation">:</span> 512M
    <span class="token key atrule">reservations</span><span class="token punctuation">:</span>
      <span class="token key atrule">memory</span><span class="token punctuation">:</span> 256M
  <span class="token key atrule">restart_policy</span><span class="token punctuation">:</span>
    <span class="token key atrule">condition</span><span class="token punctuation">:</span> on<span class="token punctuation">-</span>failure
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>单机 <code>docker compose up</code> 下 <code>replicas</code> 不生效，但 <code>resources.limits</code> 在 Compose v2 中也作用于单机。</p></blockquote><h3 id="logging-日志" tabindex="-1"><a class="header-anchor" href="#logging-日志"><span>logging - 日志</span></a></h3><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">logging</span><span class="token punctuation">:</span>
  <span class="token key atrule">driver</span><span class="token punctuation">:</span> json<span class="token punctuation">-</span>file
  <span class="token key atrule">options</span><span class="token punctuation">:</span>
    <span class="token key atrule">max-size</span><span class="token punctuation">:</span> <span class="token string">&quot;10m&quot;</span>        <span class="token comment"># 单文件最大</span>
    <span class="token key atrule">max-file</span><span class="token punctuation">:</span> <span class="token string">&quot;3&quot;</span>          <span class="token comment"># 保留文件数</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>生产必配日志轮转，否则容器日志会撑爆磁盘。</p></blockquote><hr><h2 id="完整示例" tabindex="-1"><a class="header-anchor" href="#完整示例"><span>完整示例</span></a></h2><p>一个 web + api + db + cache 的典型项目：</p><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token comment"># compose.yml</span>
<span class="token key atrule">services</span><span class="token punctuation">:</span>
  <span class="token key atrule">web</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> nginx<span class="token punctuation">:</span>1.25<span class="token punctuation">-</span>alpine
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;80:80&quot;</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> ./nginx.conf<span class="token punctuation">:</span>/etc/nginx/nginx.conf<span class="token punctuation">:</span>ro
      <span class="token punctuation">-</span> ./dist<span class="token punctuation">:</span>/usr/share/nginx/html<span class="token punctuation">:</span>ro
    <span class="token key atrule">depends_on</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> api
    <span class="token key atrule">networks</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> frontend
    <span class="token key atrule">restart</span><span class="token punctuation">:</span> unless<span class="token punctuation">-</span>stopped

  <span class="token key atrule">api</span><span class="token punctuation">:</span>
    <span class="token key atrule">build</span><span class="token punctuation">:</span> ./api
    <span class="token key atrule">image</span><span class="token punctuation">:</span> myapp<span class="token punctuation">-</span>api<span class="token punctuation">:</span><span class="token number">1.0</span>
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> NODE_ENV=production
      <span class="token punctuation">-</span> DB_HOST=db
      <span class="token punctuation">-</span> REDIS_HOST=cache
    <span class="token key atrule">depends_on</span><span class="token punctuation">:</span>
      <span class="token key atrule">db</span><span class="token punctuation">:</span>
        <span class="token key atrule">condition</span><span class="token punctuation">:</span> service_healthy
      <span class="token key atrule">cache</span><span class="token punctuation">:</span>
        <span class="token key atrule">condition</span><span class="token punctuation">:</span> service_started
    <span class="token key atrule">networks</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> frontend
      <span class="token punctuation">-</span> backend
    <span class="token key atrule">restart</span><span class="token punctuation">:</span> unless<span class="token punctuation">-</span>stopped
    <span class="token key atrule">deploy</span><span class="token punctuation">:</span>
      <span class="token key atrule">resources</span><span class="token punctuation">:</span>
        <span class="token key atrule">limits</span><span class="token punctuation">:</span>
          <span class="token key atrule">cpus</span><span class="token punctuation">:</span> <span class="token string">&#39;1&#39;</span>
          <span class="token key atrule">memory</span><span class="token punctuation">:</span> 512M

  <span class="token key atrule">db</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> mysql<span class="token punctuation">:</span><span class="token number">8</span>
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token key atrule">MYSQL_ROOT_PASSWORD</span><span class="token punctuation">:</span> $<span class="token punctuation">{</span>DB_ROOT_PASSWORD<span class="token punctuation">}</span>
      <span class="token key atrule">MYSQL_DATABASE</span><span class="token punctuation">:</span> app
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> db<span class="token punctuation">-</span>data<span class="token punctuation">:</span>/var/lib/mysql
    <span class="token key atrule">networks</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> backend
    <span class="token key atrule">restart</span><span class="token punctuation">:</span> unless<span class="token punctuation">-</span>stopped
    <span class="token key atrule">healthcheck</span><span class="token punctuation">:</span>
      <span class="token key atrule">test</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;CMD&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;mysqladmin&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;ping&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;-h&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;localhost&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;-uroot&quot;</span><span class="token punctuation">,</span> <span class="token string">&quot;-p\${DB_ROOT_PASSWORD}&quot;</span><span class="token punctuation">]</span>
      <span class="token key atrule">interval</span><span class="token punctuation">:</span> 10s
      <span class="token key atrule">timeout</span><span class="token punctuation">:</span> 5s
      <span class="token key atrule">retries</span><span class="token punctuation">:</span> <span class="token number">5</span>

  <span class="token key atrule">cache</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> redis<span class="token punctuation">:</span>7<span class="token punctuation">-</span>alpine
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> cache<span class="token punctuation">-</span>data<span class="token punctuation">:</span>/data
    <span class="token key atrule">networks</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> backend
    <span class="token key atrule">restart</span><span class="token punctuation">:</span> unless<span class="token punctuation">-</span>stopped
    <span class="token key atrule">command</span><span class="token punctuation">:</span> redis<span class="token punctuation">-</span>server <span class="token punctuation">-</span><span class="token punctuation">-</span>appendonly yes

<span class="token key atrule">volumes</span><span class="token punctuation">:</span>
  <span class="token key atrule">db-data</span><span class="token punctuation">:</span>
  <span class="token key atrule">cache-data</span><span class="token punctuation">:</span>

<span class="token key atrule">networks</span><span class="token punctuation">:</span>
  <span class="token key atrule">frontend</span><span class="token punctuation">:</span>
  <span class="token key atrule">backend</span><span class="token punctuation">:</span>
    <span class="token key atrule">internal</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">docker</span> compose up <span class="token parameter variable">-d</span>           <span class="token comment"># 启动全部</span>
<span class="token function">docker</span> compose <span class="token function">ps</span>              <span class="token comment"># 查看状态</span>
<span class="token function">docker</span> compose logs <span class="token parameter variable">-f</span> api     <span class="token comment"># 看 api 日志</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>注意：同网络内 <code>api</code> 服务用 <code>db</code>、<code>cache</code> 作为主机名连接（服务名即 DNS 名）。</p><hr><h2 id="环境变量管理" tabindex="-1"><a class="header-anchor" href="#环境变量管理"><span>环境变量管理</span></a></h2><h3 id="env-文件" tabindex="-1"><a class="header-anchor" href="#env-文件"><span>.env 文件</span></a></h3><p>Compose 自动读取同目录下的 <code>.env</code> 文件，用于变量插值：</p><div class="language-env line-numbers-mode" data-ext="env" data-title="env"><pre class="language-env"><code># .env
DB_ROOT_PASSWORD=secret
APP_PORT=8080
IMAGE_TAG=1.0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token comment"># compose.yml 中用 \${VAR}</span>
<span class="token key atrule">services</span><span class="token punctuation">:</span>
  <span class="token key atrule">api</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> myapp<span class="token punctuation">:</span>$<span class="token punctuation">{</span>IMAGE_TAG<span class="token punctuation">}</span>
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;\${APP_PORT}:3000&quot;</span>
  <span class="token key atrule">db</span><span class="token punctuation">:</span>
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token key atrule">MYSQL_ROOT_PASSWORD</span><span class="token punctuation">:</span> $<span class="token punctuation">{</span>DB_ROOT_PASSWORD<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="多环境" tabindex="-1"><a class="header-anchor" href="#多环境"><span>多环境</span></a></h3><p>用 <code>-f</code> 叠加多个 compose 文件，后者覆盖前者：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 基础 + 生产覆盖</span>
<span class="token function">docker</span> compose <span class="token parameter variable">-f</span> compose.yml <span class="token parameter variable">-f</span> compose.prod.yml up <span class="token parameter variable">-d</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token comment"># compose.prod.yml</span>
<span class="token key atrule">services</span><span class="token punctuation">:</span>
  <span class="token key atrule">api</span><span class="token punctuation">:</span>
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> NODE_ENV=production
    <span class="token key atrule">deploy</span><span class="token punctuation">:</span>
      <span class="token key atrule">resources</span><span class="token punctuation">:</span>
        <span class="token key atrule">limits</span><span class="token punctuation">:</span>
          <span class="token key atrule">cpus</span><span class="token punctuation">:</span> <span class="token string">&#39;2&#39;</span>
          <span class="token key atrule">memory</span><span class="token punctuation">:</span> 1G
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>或用 <code>--profile</code> 切换（见下）。</p><blockquote><p>⚠️ <code>.env</code> 含密码，<strong>必须加入 <code>.gitignore</code></strong>，不要提交到仓库。可提交 <code>.env.example</code> 作为模板。</p></blockquote><hr><h2 id="profiles-分组" tabindex="-1"><a class="header-anchor" href="#profiles-分组"><span>Profiles 分组</span></a></h2><p>用 profile 按需启动部分服务，避免全量启动：</p><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">services</span><span class="token punctuation">:</span>
  <span class="token key atrule">web</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> nginx<span class="token punctuation">:</span><span class="token number">1.25</span>

  <span class="token key atrule">db</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> mysql<span class="token punctuation">:</span><span class="token number">8</span>

  <span class="token comment"># 仅调试时启动</span>
  <span class="token key atrule">debug</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> busybox
    <span class="token key atrule">profiles</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;debug&quot;</span><span class="token punctuation">]</span>

  <span class="token comment"># 仅测试时启动</span>
  <span class="token key atrule">test</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> myapp<span class="token punctuation">-</span>test
    <span class="token key atrule">profiles</span><span class="token punctuation">:</span> <span class="token punctuation">[</span><span class="token string">&quot;test&quot;</span><span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">docker</span> compose up <span class="token parameter variable">-d</span>                    <span class="token comment"># 启动无 profile 的服务（web、db）</span>
<span class="token function">docker</span> compose <span class="token parameter variable">--profile</span> debug up <span class="token parameter variable">-d</span>    <span class="token comment"># 连同 debug 服务</span>
<span class="token function">docker</span> compose <span class="token parameter variable">--profile</span> <span class="token builtin class-name">test</span> run <span class="token builtin class-name">test</span>  <span class="token comment"># 跑一次测试</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="常用命令" tabindex="-1"><a class="header-anchor" href="#常用命令"><span>常用命令</span></a></h2><p>均在 compose 文件所在目录执行。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 启动（-d 后台，--build 强制重建镜像）</span>
<span class="token function">docker</span> compose up <span class="token parameter variable">-d</span>
<span class="token function">docker</span> compose up <span class="token parameter variable">-d</span> <span class="token parameter variable">--build</span>

<span class="token comment"># 停止并删除容器/网络（-v 连带删卷，慎用）</span>
<span class="token function">docker</span> compose down
<span class="token function">docker</span> compose down <span class="token parameter variable">-v</span>

<span class="token comment"># 查看状态</span>
<span class="token function">docker</span> compose <span class="token function">ps</span>
<span class="token function">docker</span> compose <span class="token function">ps</span> <span class="token parameter variable">-a</span>

<span class="token comment"># 日志</span>
<span class="token function">docker</span> compose logs <span class="token parameter variable">-f</span>
<span class="token function">docker</span> compose logs <span class="token parameter variable">-f</span> <span class="token parameter variable">--tail</span><span class="token operator">=</span><span class="token number">100</span> api
<span class="token function">docker</span> compose logs <span class="token parameter variable">--since</span> 30m

<span class="token comment"># 进入容器 / 执行命令</span>
<span class="token function">docker</span> compose <span class="token builtin class-name">exec</span> api <span class="token function">sh</span>
<span class="token function">docker</span> compose <span class="token builtin class-name">exec</span> db mysql <span class="token parameter variable">-uroot</span> <span class="token parameter variable">-p</span>

<span class="token comment"># 重启 / 停止 / 启动 单个服务</span>
<span class="token function">docker</span> compose restart api
<span class="token function">docker</span> compose stop api
<span class="token function">docker</span> compose start api

<span class="token comment"># 重新构建</span>
<span class="token function">docker</span> compose build
<span class="token function">docker</span> compose build --no-cache api

<span class="token comment"># 拉取最新镜像</span>
<span class="token function">docker</span> compose pull

<span class="token comment"># 查看配置（合并后最终生效的 yml）</span>
<span class="token function">docker</span> compose config

<span class="token comment"># 查看服务镜像</span>
<span class="token function">docker</span> compose images
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p>旧版 <code>docker-compose</code>（连字符）命令相同，新项目用 <code>docker compose</code>（空格）。</p></blockquote><hr><h2 id="最佳实践" tabindex="-1"><a class="header-anchor" href="#最佳实践"><span>最佳实践</span></a></h2><ul><li>✅ 固定镜像版本，不用 <code>latest</code></li><li>✅ 用 <code>.env</code> + <code>\${VAR}</code> 管理密码，<code>.env</code> 加入 <code>.gitignore</code></li><li>✅ 数据库服务配 <code>healthcheck</code>，业务服务 <code>depends_on: condition: service_healthy</code></li><li>✅ 所有服务配 <code>restart: unless-stopped</code></li><li>✅ 配 <code>logging</code> 日志轮转，防磁盘撑爆</li><li>✅ 内部服务用 <code>internal: true</code> 网络隔离，不暴露公网</li><li>✅ 用 <code>-f</code> 多文件或 <code>profiles</code> 区分开发/测试/生产</li><li>✅ 端口绑定公网服务用 <code>127.0.0.1:port:port</code> 限制来源</li><li>❌ 不要把数据库端口直接暴露到 0.0.0.0</li><li>❌ 不要 <code>down -v</code> 在生产（删卷丢数据）</li></ul><hr><h2 id="小结" tabindex="-1"><a class="header-anchor" href="#小结"><span>小结</span></a></h2><ul><li>Compose 用一份 yml 定义多服务、网络、卷，<code>up</code>/<code>down</code> 一键管理。</li><li>服务名即 DNS 名，同网络内可互连。</li><li><code>depends_on</code> + <code>healthcheck</code> 解决启动就绪问题。</li><li><code>.env</code> 管理敏感配置，多文件/profiles 区分环境。</li><li>生产必配：版本固定、重启策略、日志轮转、网络隔离。</li></ul>`,81);function r(k,m){const s=o("RouteLink");return i(),e("div",null,[u,t("p",null,[n("下一篇："),l(s,{to:"/serve/docker/docker-advanced.html"},{default:c(()=>[n("Docker 进阶与生产实践")]),_:1}),n(" 深入网络、存储、安全与监控。")])])}const h=a(d,[["render",r],["__file","docker-compose-guide.html.vue"]]),y=JSON.parse('{"path":"/serve/docker/docker-compose-guide.html","title":"Docker Compose 多容器编排","lang":"zh-CN","frontmatter":{"title":"Docker Compose 多容器编排","icon":"docker","category":["Serve","Docker"],"tag":["docker","compose","编排"],"description":"Docker Compose 多容器编排 一个真实应用往往由多个服务组成（web + db + cache）。Docker Compose 用一份 compose.yml 声明式定义所有服务及其依赖，一条命令拉起整个环境。本篇系统讲解配置项、命令与实战。 目录 Compose 是什么 安装 compose.yml 结构 常用配置项 完整示例 环境变量管...","head":[["meta",{"property":"og:url","content":"https://lfange.github.io/serve/docker/docker-compose-guide.html"}],["meta",{"property":"og:site_name","content":"哓番茄"}],["meta",{"property":"og:title","content":"Docker Compose 多容器编排"}],["meta",{"property":"og:description","content":"Docker Compose 多容器编排 一个真实应用往往由多个服务组成（web + db + cache）。Docker Compose 用一份 compose.yml 声明式定义所有服务及其依赖，一条命令拉起整个环境。本篇系统讲解配置项、命令与实战。 目录 Compose 是什么 安装 compose.yml 结构 常用配置项 完整示例 环境变量管..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2026-08-01T08:12:07.000Z"}],["meta",{"property":"article:author","content":"哓番茄"}],["meta",{"property":"article:tag","content":"docker"}],["meta",{"property":"article:tag","content":"compose"}],["meta",{"property":"article:tag","content":"编排"}],["meta",{"property":"article:modified_time","content":"2026-08-01T08:12:07.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Docker Compose 多容器编排\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2026-08-01T08:12:07.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"哓番茄\\",\\"url\\":\\"https://lfange.github.io/\\"}]}"]]},"headers":[{"level":2,"title":"目录","slug":"目录","link":"#目录","children":[]},{"level":2,"title":"Compose 是什么","slug":"compose-是什么","link":"#compose-是什么","children":[]},{"level":2,"title":"安装","slug":"安装","link":"#安装","children":[]},{"level":2,"title":"compose.yml 结构","slug":"compose-yml-结构","link":"#compose-yml-结构","children":[]},{"level":2,"title":"常用配置项","slug":"常用配置项","link":"#常用配置项","children":[{"level":3,"title":"服务配置项总览","slug":"服务配置项总览","link":"#服务配置项总览","children":[]},{"level":3,"title":"build - 构建镜像","slug":"build-构建镜像","link":"#build-构建镜像","children":[]},{"level":3,"title":"ports - 端口","slug":"ports-端口","link":"#ports-端口","children":[]},{"level":3,"title":"volumes - 挂载","slug":"volumes-挂载","link":"#volumes-挂载","children":[]},{"level":3,"title":"environment / env_file","slug":"environment-env-file","link":"#environment-env-file","children":[]},{"level":3,"title":"depends_on - 启动顺序与健康检查","slug":"depends-on-启动顺序与健康检查","link":"#depends-on-启动顺序与健康检查","children":[]},{"level":3,"title":"restart","slug":"restart","link":"#restart","children":[]},{"level":3,"title":"networks","slug":"networks","link":"#networks","children":[]},{"level":3,"title":"deploy - 资源限制（Compose v2 / Swarm）","slug":"deploy-资源限制-compose-v2-swarm","link":"#deploy-资源限制-compose-v2-swarm","children":[]},{"level":3,"title":"logging - 日志","slug":"logging-日志","link":"#logging-日志","children":[]}]},{"level":2,"title":"完整示例","slug":"完整示例","link":"#完整示例","children":[]},{"level":2,"title":"环境变量管理","slug":"环境变量管理","link":"#环境变量管理","children":[{"level":3,"title":".env 文件","slug":"env-文件","link":"#env-文件","children":[]},{"level":3,"title":"多环境","slug":"多环境","link":"#多环境","children":[]}]},{"level":2,"title":"Profiles 分组","slug":"profiles-分组","link":"#profiles-分组","children":[]},{"level":2,"title":"常用命令","slug":"常用命令","link":"#常用命令","children":[]},{"level":2,"title":"最佳实践","slug":"最佳实践","link":"#最佳实践","children":[]},{"level":2,"title":"小结","slug":"小结","link":"#小结","children":[]}],"git":{"createdTime":1785571927000,"updatedTime":1785571927000,"contributors":[{"name":"FanGe","email":"653398363@qq.com","commits":1}]},"readingTime":{"minutes":5.77,"words":1730},"filePathRelative":"serve/docker/docker-compose-guide.md","localizedDate":"2026年8月1日","excerpt":"","autoDesc":true}');export{h as comp,y as data};
