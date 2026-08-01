import{_ as e}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,a as t,d as n,e as c,w as l,b as o,r as i,o as d}from"./app-ByTKU10L.js";const r={},p=o(`<h1 id="docker-常用命令详解" tabindex="-1"><a class="header-anchor" href="#docker-常用命令详解"><span>Docker 常用命令详解</span></a></h1><blockquote><p>本篇系统整理 Docker 日常运维的全部常用命令，按「镜像 / 容器 / 数据卷 / 网络 / 系统」分类，附参数说明与速查表，可作为案头手册随时查阅。</p></blockquote><hr><h2 id="目录" tabindex="-1"><a class="header-anchor" href="#目录"><span>目录</span></a></h2><ol><li><a href="#%E5%91%BD%E4%BB%A4%E6%80%BB%E8%A7%88">命令总览</a></li><li><a href="#%E9%95%9C%E5%83%8F%E5%91%BD%E4%BB%A4">镜像命令</a></li><li><a href="#%E5%AE%B9%E5%99%A8%E5%91%BD%E4%BB%A4">容器命令</a></li><li><a href="#%E6%95%B0%E6%8D%AE%E5%8D%B7%E5%91%BD%E4%BB%A4">数据卷命令</a></li><li><a href="#%E7%BD%91%E7%BB%9C%E5%91%BD%E4%BB%A4">网络命令</a></li><li><a href="#%E7%B3%BB%E7%BB%9F%E7%AE%A1%E7%90%86%E5%91%BD%E4%BB%A4">系统管理命令</a></li><li><a href="#%E5%91%BD%E4%BB%A4%E9%80%9F%E6%9F%A5%E8%A1%A8">命令速查表</a></li></ol><hr><h2 id="命令总览" tabindex="-1"><a class="header-anchor" href="#命令总览"><span>命令总览</span></a></h2><p>Docker 命令格式：<code>docker [选项] 命令 [参数]</code>。新版 Docker 也支持 <code>docker 对象 子命令</code> 形式（如 <code>docker image ls</code> 等价 <code>docker images</code>）。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看所有命令</span>
<span class="token function">docker</span> <span class="token parameter variable">--help</span>
<span class="token function">docker</span> <span class="token builtin class-name">help</span> run          <span class="token comment"># 查看 run 的详细用法</span>
<span class="token function">docker</span> <span class="token function">man</span> docker-run    <span class="token comment"># 查看完整手册</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="镜像命令" tabindex="-1"><a class="header-anchor" href="#镜像命令"><span>镜像命令</span></a></h2><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 搜索镜像</span>
<span class="token function">docker</span> search nginx
<span class="token function">docker</span> search <span class="token parameter variable">--limit</span> <span class="token number">5</span> nginx       <span class="token comment"># 限制结果数</span>

<span class="token comment"># 拉取镜像</span>
<span class="token function">docker</span> pull nginx                    <span class="token comment"># 默认 latest</span>
<span class="token function">docker</span> pull nginx:1.25               <span class="token comment"># 指定版本</span>
<span class="token function">docker</span> pull myrepo/myapp:1.0         <span class="token comment"># 私有仓库</span>

<span class="token comment"># 列出本地镜像</span>
<span class="token function">docker</span> images                        <span class="token comment"># 等价 docker image ls</span>
<span class="token function">docker</span> images <span class="token parameter variable">-a</span>                     <span class="token comment"># 含中间层</span>
<span class="token function">docker</span> images <span class="token parameter variable">--filter</span> <span class="token string">&quot;dangling=true&quot;</span>  <span class="token comment"># 悬空镜像</span>

<span class="token comment"># 删除镜像</span>
<span class="token function">docker</span> rmi nginx:1.25                <span class="token comment"># 删除指定镜像</span>
<span class="token function">docker</span> rmi <span class="token parameter variable">-f</span> nginx:1.25             <span class="token comment"># 强制删除（即使有容器依赖）</span>
<span class="token function">docker</span> image prune                   <span class="token comment"># 删除悬空镜像</span>
<span class="token function">docker</span> image prune <span class="token parameter variable">-a</span>                <span class="token comment"># 删除所有未被容器使用的镜像</span>

<span class="token comment"># 构建镜像</span>
<span class="token function">docker</span> build <span class="token parameter variable">-t</span> myapp:1.0 <span class="token builtin class-name">.</span>          <span class="token comment"># -t 名称:标签，. 为构建上下文</span>
<span class="token function">docker</span> build <span class="token parameter variable">-t</span> myapp:1.0 <span class="token parameter variable">-f</span> Dockerfile.prod <span class="token builtin class-name">.</span>  <span class="token comment"># -f 指定 Dockerfile</span>
<span class="token function">docker</span> build --no-cache <span class="token parameter variable">-t</span> myapp:1.0 <span class="token builtin class-name">.</span>           <span class="token comment"># 不用缓存</span>

<span class="token comment"># 给镜像打标签</span>
<span class="token function">docker</span> tag myapp:1.0 myrepo/myapp:latest

<span class="token comment"># 推送到仓库</span>
<span class="token function">docker</span> push myrepo/myapp:1.0

<span class="token comment"># 查看镜像分层历史</span>
<span class="token function">docker</span> <span class="token function">history</span> nginx:1.25

<span class="token comment"># 查看镜像元数据</span>
<span class="token function">docker</span> inspect nginx:1.25

<span class="token comment"># 导出 / 导入镜像（备份迁移用，详见备份篇）</span>
<span class="token function">docker</span> save <span class="token parameter variable">-o</span> app.tar myapp:1.0     <span class="token comment"># 导出为 tar</span>
<span class="token function">docker</span> load <span class="token parameter variable">-i</span> app.tar               <span class="token comment"># 从 tar 导入</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><code>latest</code> 是默认标签，但<strong>不代表最新</strong>，只是一个普通标签名。生产环境务必指定明确版本号，避免 <code>latest</code> 指向漂移导致行为变化。</p></blockquote><hr><h2 id="容器命令" tabindex="-1"><a class="header-anchor" href="#容器命令"><span>容器命令</span></a></h2><h3 id="创建与运行" tabindex="-1"><a class="header-anchor" href="#创建与运行"><span>创建与运行</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 核心命令：docker run</span>
<span class="token function">docker</span> run <span class="token punctuation">[</span>选项<span class="token punctuation">]</span> 镜像 <span class="token punctuation">[</span>命令<span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>常用选项：</p><table><thead><tr><th>选项</th><th>含义</th></tr></thead><tbody><tr><td><code>-d</code></td><td>后台运行</td></tr><tr><td><code>-it</code></td><td>交互式 + 分配终端（常用于进入 shell）</td></tr><tr><td><code>--name</code></td><td>容器名</td></tr><tr><td><code>-p 宿主:容器</code></td><td>端口映射</td></tr><tr><td><code>-P</code></td><td>随机映射所有暴露端口</td></tr><tr><td><code>-v 宿主:容器[:ro]</code></td><td>挂载目录/数据卷，<code>:ro</code> 只读</td></tr><tr><td><code>-e KEY=VAL</code></td><td>环境变量</td></tr><tr><td><code>--env-file</code></td><td>从文件读取环境变量</td></tr><tr><td><code>--network</code></td><td>加入指定网络</td></tr><tr><td><code>--restart</code></td><td>重启策略：<code>no</code> / <code>always</code> / <code>unless-stopped</code> / <code>on-failure</code></td></tr><tr><td><code>--rm</code></td><td>容器退出后自动删除</td></tr><tr><td><code>--memory</code> / <code>--cpus</code></td><td>资源限制</td></tr><tr><td><code>-w</code></td><td>工作目录</td></tr><tr><td><code>--entrypoint</code></td><td>覆盖入口点</td></tr></tbody></table><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 综合示例</span>
<span class="token function">docker</span> run <span class="token parameter variable">-d</span> <span class="token punctuation">\\</span>
  <span class="token parameter variable">--name</span> web <span class="token punctuation">\\</span>
  <span class="token parameter variable">-p</span> <span class="token number">80</span>:80 <span class="token punctuation">\\</span>
  <span class="token parameter variable">-p</span> <span class="token number">443</span>:443 <span class="token punctuation">\\</span>
  <span class="token parameter variable">-v</span> /data/nginx/conf:/etc/nginx/conf.d:ro <span class="token punctuation">\\</span>
  <span class="token parameter variable">-v</span> /data/nginx/html:/usr/share/nginx/html <span class="token punctuation">\\</span>
  <span class="token parameter variable">-e</span> <span class="token assign-left variable">NGINX_HOST</span><span class="token operator">=</span>example.com <span class="token punctuation">\\</span>
  <span class="token parameter variable">--restart</span> unless-stopped <span class="token punctuation">\\</span>
  nginx:1.25

<span class="token comment"># 交互式进入并退出即删</span>
<span class="token function">docker</span> run <span class="token parameter variable">-it</span> <span class="token parameter variable">--rm</span> ubuntu:22.04 /bin/bash
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="查看与进入" tabindex="-1"><a class="header-anchor" href="#查看与进入"><span>查看与进入</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看运行中容器</span>
<span class="token function">docker</span> <span class="token function">ps</span>
<span class="token comment"># 查看所有容器（含已停止）</span>
<span class="token function">docker</span> <span class="token function">ps</span> <span class="token parameter variable">-a</span>
<span class="token comment"># 只显示容器 ID</span>
<span class="token function">docker</span> <span class="token function">ps</span> <span class="token parameter variable">-q</span>
<span class="token comment"># 按状态过滤</span>
<span class="token function">docker</span> <span class="token function">ps</span> <span class="token parameter variable">-f</span> <span class="token string">&quot;status=exited&quot;</span>

<span class="token comment"># 进入运行中的容器（推荐 exec，退出不导致容器停止）</span>
<span class="token function">docker</span> <span class="token builtin class-name">exec</span> <span class="token parameter variable">-it</span> web /bin/bash
<span class="token function">docker</span> <span class="token builtin class-name">exec</span> <span class="token parameter variable">-it</span> web <span class="token function">sh</span>            <span class="token comment"># 镜像无 bash 时用 sh</span>
<span class="token comment"># 执行单条命令</span>
<span class="token function">docker</span> <span class="token builtin class-name">exec</span> web <span class="token function">cat</span> /etc/hostname
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="生命周期" tabindex="-1"><a class="header-anchor" href="#生命周期"><span>生命周期</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 启动 / 停止 / 重启 / 暂停 / 恢复</span>
<span class="token function">docker</span> start web
<span class="token function">docker</span> stop web
<span class="token function">docker</span> restart web
<span class="token function">docker</span> pause web
<span class="token function">docker</span> unpause web

<span class="token comment"># 停止所有运行中的容器</span>
<span class="token function">docker</span> stop <span class="token variable"><span class="token variable">$(</span><span class="token function">docker</span> <span class="token function">ps</span> <span class="token parameter variable">-q</span><span class="token variable">)</span></span>

<span class="token comment"># 删除容器</span>
<span class="token function">docker</span> <span class="token function">rm</span> web                      <span class="token comment"># 需先停止</span>
<span class="token function">docker</span> <span class="token function">rm</span> <span class="token parameter variable">-f</span> web                   <span class="token comment"># 强制删除运行中的</span>
<span class="token function">docker</span> <span class="token function">rm</span> <span class="token variable"><span class="token variable">$(</span><span class="token function">docker</span> <span class="token function">ps</span> <span class="token parameter variable">-aq</span> <span class="token parameter variable">-f</span> <span class="token string">&quot;status=exited&quot;</span><span class="token variable">)</span></span>  <span class="token comment"># 删除所有已停止容器</span>
<span class="token function">docker</span> container prune             <span class="token comment"># 同上</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="日志与状态" tabindex="-1"><a class="header-anchor" href="#日志与状态"><span>日志与状态</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 日志</span>
<span class="token function">docker</span> logs web
<span class="token function">docker</span> logs <span class="token parameter variable">-f</span> web                 <span class="token comment"># 实时跟踪</span>
<span class="token function">docker</span> logs <span class="token parameter variable">--tail</span> <span class="token number">100</span> web         <span class="token comment"># 末尾 100 行</span>
<span class="token function">docker</span> logs <span class="token parameter variable">--since</span> 30m web        <span class="token comment"># 最近 30 分钟</span>
<span class="token function">docker</span> logs <span class="token parameter variable">-t</span> web                 <span class="token comment"># 显示时间戳</span>

<span class="token comment"># 资源占用（动态刷新，类似 top）</span>
<span class="token function">docker</span> stats
<span class="token function">docker</span> stats --no-stream web       <span class="token comment"># 单次输出</span>

<span class="token comment"># 详细信息</span>
<span class="token function">docker</span> inspect web
<span class="token function">docker</span> inspect web <span class="token parameter variable">--format</span> <span class="token string">&#39;{{.NetworkSettings.IPAddress}}&#39;</span>  <span class="token comment"># 取特定字段</span>

<span class="token comment"># 容器内进程</span>
<span class="token function">docker</span> <span class="token function">top</span> web
<span class="token comment"># 端口映射</span>
<span class="token function">docker</span> port web
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="文件拷贝与文件系统" tabindex="-1"><a class="header-anchor" href="#文件拷贝与文件系统"><span>文件拷贝与文件系统</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 宿主 &lt;-&gt; 容器拷贝</span>
<span class="token function">docker</span> <span class="token function">cp</span> /local/file.txt web:/app/
<span class="token function">docker</span> <span class="token function">cp</span> web:/app/log.txt /local/

<span class="token comment"># 查看容器文件系统改动（相对于镜像）</span>
<span class="token function">docker</span> <span class="token function">diff</span> web
<span class="token comment"># 导出容器文件系统为 tar（拍平，丢失分层，慎用）</span>
<span class="token function">docker</span> <span class="token builtin class-name">export</span> web <span class="token parameter variable">-o</span> web.tar
<span class="token function">docker</span> <span class="token function">import</span> web.tar my-image:1.0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="提交容器为镜像-应急" tabindex="-1"><a class="header-anchor" href="#提交容器为镜像-应急"><span>提交容器为镜像（应急）</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 将容器当前状态固化为新镜像</span>
<span class="token function">docker</span> commit <span class="token parameter variable">-m</span> <span class="token string">&quot;装了curl&quot;</span> <span class="token parameter variable">-a</span> <span class="token string">&quot;lfange&quot;</span> web my-nginx:1.1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><code>docker commit</code> 会丢失数据卷和部分元数据，仅作应急；生产应坚持用 Dockerfile 构建。</p></blockquote><hr><h2 id="数据卷命令" tabindex="-1"><a class="header-anchor" href="#数据卷命令"><span>数据卷命令</span></a></h2><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 创建</span>
<span class="token function">docker</span> volume create my-vol
<span class="token comment"># 列出</span>
<span class="token function">docker</span> volume <span class="token function">ls</span>
<span class="token comment"># 详情（含宿主真实路径）</span>
<span class="token function">docker</span> volume inspect my-vol
<span class="token comment"># 删除</span>
<span class="token function">docker</span> volume <span class="token function">rm</span> my-vol
<span class="token function">docker</span> volume prune              <span class="token comment"># 删除所有未使用的卷（慎用，丢数据）</span>

<span class="token comment"># 使用：在 run 时挂载</span>
<span class="token function">docker</span> run <span class="token parameter variable">-d</span> <span class="token parameter variable">-v</span> my-vol:/data nginx:1.25          <span class="token comment"># 命名卷</span>
<span class="token function">docker</span> run <span class="token parameter variable">-d</span> <span class="token parameter variable">-v</span> /data/mysql:/var/lib/mysql mysql <span class="token comment"># bind mount 宿主目录</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>数据卷三种挂载方式区别：</p><table><thead><tr><th>方式</th><th>命令</th><th>特点</th></tr></thead><tbody><tr><td>命名卷（volume）</td><td><code>-v my-vol:/data</code></td><td>Docker 管理，独立于容器，推荐</td></tr><tr><td>绑定挂载（bind mount）</td><td><code>-v /host/path:/data</code></td><td>直接挂宿主目录，路径耦合，便于开发调试</td></tr><tr><td>临时卷（tmpfs）</td><td><code>--tmpfs /data</code></td><td>存内存中，容器停止即丢，适合敏感数据</td></tr></tbody></table><hr><h2 id="网络命令" tabindex="-1"><a class="header-anchor" href="#网络命令"><span>网络命令</span></a></h2><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 列出网络</span>
<span class="token function">docker</span> network <span class="token function">ls</span>
<span class="token comment"># 创建网络</span>
<span class="token function">docker</span> network create my-net
<span class="token function">docker</span> network create <span class="token parameter variable">--driver</span> bridge my-net
<span class="token comment"># 详情</span>
<span class="token function">docker</span> network inspect my-net
<span class="token comment"># 连接 / 断开容器</span>
<span class="token function">docker</span> network connect my-net web
<span class="token function">docker</span> network disconnect my-net web
<span class="token comment"># 删除</span>
<span class="token function">docker</span> network <span class="token function">rm</span> my-net
<span class="token function">docker</span> network prune
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Docker 默认三类网络：</p><table><thead><tr><th>网络</th><th>说明</th></tr></thead><tbody><tr><td><code>bridge</code></td><td>默认，docker0 网桥，容器间通过 NAT 通信</td></tr><tr><td><code>host</code></td><td>容器直接用宿主网络栈，无隔离，性能最高</td></tr><tr><td><code>none</code></td><td>无网络，仅 lo 接口</td></tr></tbody></table><blockquote><p>同一自定义 bridge 网络内容器可用<strong>容器名互相解析</strong>（内置 DNS），如 <code>docker run --network my-net --name db</code> 后，同网络的 web 容器可用 <code>db</code> 作为主机名连接。默认 bridge 网络无此能力。</p></blockquote><hr><h2 id="系统管理命令" tabindex="-1"><a class="header-anchor" href="#系统管理命令"><span>系统管理命令</span></a></h2><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看 Docker 整体信息</span>
<span class="token function">docker</span> info
<span class="token comment"># 查看磁盘占用</span>
<span class="token function">docker</span> system <span class="token function">df</span>
<span class="token function">docker</span> system <span class="token function">df</span> <span class="token parameter variable">-v</span>              <span class="token comment"># 详细</span>

<span class="token comment"># 清理</span>
<span class="token function">docker</span> system prune              <span class="token comment"># 清理停止的容器、无用网络、悬空镜像、构建缓存</span>
<span class="token function">docker</span> system prune <span class="token parameter variable">-a</span>           <span class="token comment"># 连同未使用的镜像一起删</span>
<span class="token function">docker</span> system prune <span class="token parameter variable">-a</span> <span class="token parameter variable">--volumes</span> <span class="token comment"># 连同未使用的数据卷（丢数据！）</span>

<span class="token comment"># 事件流（实时监听容器生命周期事件）</span>
<span class="token function">docker</span> events
<span class="token function">docker</span> events <span class="token parameter variable">--filter</span> <span class="token assign-left variable">type</span><span class="token operator">=</span>container
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>各对象独立清理命令：</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">docker</span> container prune    <span class="token comment"># 已停止容器</span>
<span class="token function">docker</span> image prune <span class="token parameter variable">-a</span>     <span class="token comment"># 未使用镜像</span>
<span class="token function">docker</span> volume prune       <span class="token comment"># 未使用卷（慎）</span>
<span class="token function">docker</span> network prune      <span class="token comment"># 未使用网络</span>
<span class="token function">docker</span> builder prune      <span class="token comment"># 构建缓存</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="命令速查表" tabindex="-1"><a class="header-anchor" href="#命令速查表"><span>命令速查表</span></a></h2><table><thead><tr><th>场景</th><th>命令</th></tr></thead><tbody><tr><td>拉镜像</td><td><code>docker pull nginx:1.25</code></td></tr><tr><td>列镜像</td><td><code>docker images</code></td></tr><tr><td>删镜像</td><td><code>docker rmi nginx:1.25</code></td></tr><tr><td>构建镜像</td><td><code>docker build -t app:1.0 .</code></td></tr><tr><td>运行容器</td><td><code>docker run -d --name web -p 80:80 nginx</code></td></tr><tr><td>进入容器</td><td><code>docker exec -it web bash</code></td></tr><tr><td>看容器</td><td><code>docker ps</code> / <code>docker ps -a</code></td></tr><tr><td>看日志</td><td><code>docker logs -f --tail 100 web</code></td></tr><tr><td>看资源</td><td><code>docker stats</code></td></tr><tr><td>停 / 起 / 重启</td><td><code>docker stop/start/restart web</code></td></tr><tr><td>删容器</td><td><code>docker rm -f web</code></td></tr><tr><td>看详情</td><td><code>docker inspect web</code></td></tr><tr><td>拷文件</td><td><code>docker cp web:/app/x ./</code></td></tr><tr><td>创建卷</td><td><code>docker volume create my-vol</code></td></tr><tr><td>创建网络</td><td><code>docker network create my-net</code></td></tr><tr><td>看磁盘</td><td><code>docker system df</code></td></tr><tr><td>一键清理</td><td><code>docker system prune -a</code></td></tr><tr><td>查端口</td><td><code>docker port web</code></td></tr><tr><td>导出镜像</td><td><code>docker save -o app.tar app:1.0</code></td></tr><tr><td>导入镜像</td><td><code>docker load -i app.tar</code></td></tr></tbody></table><hr><h2 id="小结" tabindex="-1"><a class="header-anchor" href="#小结"><span>小结</span></a></h2><ul><li>镜像命令围绕 <code>pull / images / rmi / build / save / load</code>。</li><li>容器命令围绕 <code>run / ps / exec / logs / start / stop / rm</code>。</li><li>重要数据用命名卷 <code>-v</code>，不要依赖容器可写层。</li><li>自定义网络让容器间可用容器名互连。</li><li><code>docker system prune</code> 一键清理，但 <code>--volumes</code> 会删数据，慎用。</li></ul>`,53);function m(u,k){const s=i("RouteLink");return d(),a("div",null,[p,t("p",null,[n("下一篇："),c(s,{to:"/serve/docker/dockerfile-guide.html"},{default:l(()=>[n("Dockerfile 与镜像构建")]),_:1}),n(" 学会把应用打包成镜像。")])])}const h=e(r,[["render",m],["__file","docker-commands.html.vue"]]),f=JSON.parse('{"path":"/serve/docker/docker-commands.html","title":"Docker 常用命令详解","lang":"zh-CN","frontmatter":{"title":"Docker 常用命令详解","icon":"docker","category":["Serve","Docker"],"tag":["docker","命令"],"description":"Docker 常用命令详解 本篇系统整理 Docker 日常运维的全部常用命令，按「镜像 / 容器 / 数据卷 / 网络 / 系统」分类，附参数说明与速查表，可作为案头手册随时查阅。 目录 命令总览 镜像命令 容器命令 数据卷命令 网络命令 系统管理命令 命令速查表 命令总览 Docker 命令格式：docker [选项] 命令 [参数]。新版 Doc...","head":[["meta",{"property":"og:url","content":"https://lfange.github.io/serve/docker/docker-commands.html"}],["meta",{"property":"og:site_name","content":"哓番茄"}],["meta",{"property":"og:title","content":"Docker 常用命令详解"}],["meta",{"property":"og:description","content":"Docker 常用命令详解 本篇系统整理 Docker 日常运维的全部常用命令，按「镜像 / 容器 / 数据卷 / 网络 / 系统」分类，附参数说明与速查表，可作为案头手册随时查阅。 目录 命令总览 镜像命令 容器命令 数据卷命令 网络命令 系统管理命令 命令速查表 命令总览 Docker 命令格式：docker [选项] 命令 [参数]。新版 Doc..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2026-08-01T08:12:07.000Z"}],["meta",{"property":"article:author","content":"哓番茄"}],["meta",{"property":"article:tag","content":"docker"}],["meta",{"property":"article:tag","content":"命令"}],["meta",{"property":"article:modified_time","content":"2026-08-01T08:12:07.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Docker 常用命令详解\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2026-08-01T08:12:07.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"哓番茄\\",\\"url\\":\\"https://lfange.github.io/\\"}]}"]]},"headers":[{"level":2,"title":"目录","slug":"目录","link":"#目录","children":[]},{"level":2,"title":"命令总览","slug":"命令总览","link":"#命令总览","children":[]},{"level":2,"title":"镜像命令","slug":"镜像命令","link":"#镜像命令","children":[]},{"level":2,"title":"容器命令","slug":"容器命令","link":"#容器命令","children":[{"level":3,"title":"创建与运行","slug":"创建与运行","link":"#创建与运行","children":[]},{"level":3,"title":"查看与进入","slug":"查看与进入","link":"#查看与进入","children":[]},{"level":3,"title":"生命周期","slug":"生命周期","link":"#生命周期","children":[]},{"level":3,"title":"日志与状态","slug":"日志与状态","link":"#日志与状态","children":[]},{"level":3,"title":"文件拷贝与文件系统","slug":"文件拷贝与文件系统","link":"#文件拷贝与文件系统","children":[]},{"level":3,"title":"提交容器为镜像（应急）","slug":"提交容器为镜像-应急","link":"#提交容器为镜像-应急","children":[]}]},{"level":2,"title":"数据卷命令","slug":"数据卷命令","link":"#数据卷命令","children":[]},{"level":2,"title":"网络命令","slug":"网络命令","link":"#网络命令","children":[]},{"level":2,"title":"系统管理命令","slug":"系统管理命令","link":"#系统管理命令","children":[]},{"level":2,"title":"命令速查表","slug":"命令速查表","link":"#命令速查表","children":[]},{"level":2,"title":"小结","slug":"小结","link":"#小结","children":[]}],"git":{"createdTime":1785571927000,"updatedTime":1785571927000,"contributors":[{"name":"FanGe","email":"653398363@qq.com","commits":1}]},"readingTime":{"minutes":6.46,"words":1937},"filePathRelative":"serve/docker/docker-commands.md","localizedDate":"2026年8月1日","excerpt":"","autoDesc":true}');export{h as comp,f as data};
