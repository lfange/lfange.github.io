import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as a,o as s,b as e}from"./app-ByTKU10L.js";const i={},l=e(`<h1 id="linux-高级应用指南" tabindex="-1"><a class="header-anchor" href="#linux-高级应用指南"><span>Linux 高级应用指南</span></a></h1><blockquote><p>本文档涵盖 Linux 系统管理、性能调优、安全加固、自动化运维等高级主题</p></blockquote><hr><h2 id="目录" tabindex="-1"><a class="header-anchor" href="#目录"><span>目录</span></a></h2><ol><li><a href="#%E7%B3%BB%E7%BB%9F%E7%AE%A1%E7%90%86%E8%BF%9B%E9%98%B6">系统管理进阶</a></li><li><a href="#%E6%80%A7%E8%83%BD%E7%9B%91%E6%8E%A7%E4%B8%8E%E8%B0%83%E4%BC%98">性能监控与调优</a></li><li><a href="#%E5%AE%89%E5%85%A8%E5%8A%A0%E5%9B%BA">安全加固</a></li><li><a href="#%E8%87%AA%E5%8A%A8%E5%8C%96%E8%BF%90%E7%BB%B4">自动化运维</a></li><li><a href="#%E5%AE%B9%E5%99%A8%E5%8C%96%E9%83%A8%E7%BD%B2">容器化部署</a></li><li><a href="#%E6%97%A5%E5%BF%97%E7%AE%A1%E7%90%86">日志管理</a></li><li><a href="#%E7%BD%91%E7%BB%9C%E9%AB%98%E7%BA%A7%E9%85%8D%E7%BD%AE">网络高级配置</a></li></ol><hr><h2 id="系统管理进阶" tabindex="-1"><a class="header-anchor" href="#系统管理进阶"><span>系统管理进阶</span></a></h2><h3 id="systemd-深度使用" tabindex="-1"><a class="header-anchor" href="#systemd-深度使用"><span>Systemd 深度使用</span></a></h3><p>Systemd 是现代 Linux 系统的初始化系统，提供了强大的服务管理功能。</p><h4 id="服务管理" tabindex="-1"><a class="header-anchor" href="#服务管理"><span>服务管理</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看服务状态</span>
systemctl status service-name

<span class="token comment"># 启动/停止/重启服务</span>
systemctl start service-name
systemctl stop service-name
systemctl restart service-name

<span class="token comment"># 启用/禁用开机自启</span>
systemctl <span class="token builtin class-name">enable</span> service-name
systemctl disable service-name

<span class="token comment"># 重新加载配置</span>
systemctl daemon-reload
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="自定义服务文件" tabindex="-1"><a class="header-anchor" href="#自定义服务文件"><span>自定义服务文件</span></a></h4><p>创建 <code>/etc/systemd/system/myapp.service</code>:</p><div class="language-ini line-numbers-mode" data-ext="ini" data-title="ini"><pre class="language-ini"><code><span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Unit</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">Description</span><span class="token punctuation">=</span><span class="token value attr-value">My Application Service</span>
<span class="token key attr-name">After</span><span class="token punctuation">=</span><span class="token value attr-value">network.target</span>

<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Service</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">Type</span><span class="token punctuation">=</span><span class="token value attr-value">simple</span>
<span class="token key attr-name">User</span><span class="token punctuation">=</span><span class="token value attr-value">appuser</span>
<span class="token key attr-name">WorkingDirectory</span><span class="token punctuation">=</span><span class="token value attr-value">/opt/myapp</span>
<span class="token key attr-name">ExecStart</span><span class="token punctuation">=</span><span class="token value attr-value">/opt/myapp/app</span>
<span class="token key attr-name">Restart</span><span class="token punctuation">=</span><span class="token value attr-value">always</span>
<span class="token key attr-name">RestartSec</span><span class="token punctuation">=</span><span class="token value attr-value">10</span>

<span class="token comment"># 资源限制</span>
<span class="token key attr-name">LimitNOFILE</span><span class="token punctuation">=</span><span class="token value attr-value">65536</span>
<span class="token key attr-name">LimitNPROC</span><span class="token punctuation">=</span><span class="token value attr-value">4096</span>

<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Install</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">WantedBy</span><span class="token punctuation">=</span><span class="token value attr-value">multi-user.target</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="定时任务" tabindex="-1"><a class="header-anchor" href="#定时任务"><span>定时任务</span></a></h4><p>使用 Systemd Timer 替代 Cron:</p><div class="language-ini line-numbers-mode" data-ext="ini" data-title="ini"><pre class="language-ini"><code><span class="token comment"># myapp.timer</span>
<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Unit</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">Description</span><span class="token punctuation">=</span><span class="token value attr-value">Run myapp task daily</span>

<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Timer</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">OnCalendar</span><span class="token punctuation">=</span><span class="token value attr-value">daily</span>
<span class="token key attr-name">AccuracySec</span><span class="token punctuation">=</span><span class="token value attr-value">1m</span>
<span class="token key attr-name">Persistent</span><span class="token punctuation">=</span><span class="token value attr-value">true</span>

<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Install</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">WantedBy</span><span class="token punctuation">=</span><span class="token value attr-value">timers.target</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-ini line-numbers-mode" data-ext="ini" data-title="ini"><pre class="language-ini"><code><span class="token comment"># myapp.service</span>
<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Unit</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">Description</span><span class="token punctuation">=</span><span class="token value attr-value">Myapp Task</span>

<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Service</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">Type</span><span class="token punctuation">=</span><span class="token value attr-value">oneshot</span>
<span class="token key attr-name">ExecStart</span><span class="token punctuation">=</span><span class="token value attr-value">/opt/myapp/task.sh</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="用户权限管理" tabindex="-1"><a class="header-anchor" href="#用户权限管理"><span>用户权限管理</span></a></h3><h4 id="sudo-配置" tabindex="-1"><a class="header-anchor" href="#sudo-配置"><span>Sudo 配置</span></a></h4><p>编辑 <code>/etc/sudoers</code>:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 允许用户执行特定命令</span>
username <span class="token assign-left variable">ALL</span><span class="token operator">=</span><span class="token punctuation">(</span>ALL<span class="token punctuation">)</span> /usr/bin/systemctl restart nginx

<span class="token comment"># 不输入密码执行命令</span>
username <span class="token assign-left variable">ALL</span><span class="token operator">=</span><span class="token punctuation">(</span>ALL<span class="token punctuation">)</span> NOPASSWD: /usr/bin/systemctl restart nginx

<span class="token comment"># 用户组权限</span>
%admins <span class="token assign-left variable">ALL</span><span class="token operator">=</span><span class="token punctuation">(</span>ALL<span class="token punctuation">)</span> ALL
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="文件访问控制列表-acl" tabindex="-1"><a class="header-anchor" href="#文件访问控制列表-acl"><span>文件访问控制列表 (ACL)</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看 ACL</span>
getfacl /path/to/file

<span class="token comment"># 设置 ACL</span>
setfacl <span class="token parameter variable">-m</span> u:username:rwx /path/to/file
setfacl <span class="token parameter variable">-m</span> g:groupname:r-x /path/to/file

<span class="token comment"># 删除 ACL</span>
setfacl <span class="token parameter variable">-x</span> u:username /path/to/file
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="磁盘管理-lvm" tabindex="-1"><a class="header-anchor" href="#磁盘管理-lvm"><span>磁盘管理 LVM</span></a></h3><h4 id="lvm-基本操作" tabindex="-1"><a class="header-anchor" href="#lvm-基本操作"><span>LVM 基本操作</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 创建物理卷</span>
pvcreate /dev/sdb1

<span class="token comment"># 创建卷组</span>
vgcreate vgdata /dev/sdb1

<span class="token comment"># 创建逻辑卷</span>
lvcreate <span class="token parameter variable">-L</span> 100G <span class="token parameter variable">-n</span> lvdata vgdata

<span class="token comment"># 格式化并挂载</span>
mkfs.xfs /dev/vgdata/lvdata
<span class="token function">mount</span> /dev/vgdata/lvdata /data

<span class="token comment"># 扩展逻辑卷</span>
lvextend <span class="token parameter variable">-L</span> +50G /dev/vgdata/lvdata
xfs_growfs /dev/vgdata/lvdata  <span class="token comment"># XFS</span>
resize2fs /dev/vgdata/lvdata   <span class="token comment"># EXT4</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="性能监控与调优" tabindex="-1"><a class="header-anchor" href="#性能监控与调优"><span>性能监控与调优</span></a></h2><h3 id="系统监控工具" tabindex="-1"><a class="header-anchor" href="#系统监控工具"><span>系统监控工具</span></a></h3><h4 id="top-htop" tabindex="-1"><a class="header-anchor" href="#top-htop"><span>top/htop</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 交互式查看进程</span>
<span class="token function">top</span>

<span class="token comment"># 更友好的界面</span>
<span class="token function">htop</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="vmstat-系统整体统计" tabindex="-1"><a class="header-anchor" href="#vmstat-系统整体统计"><span>vmstat - 系统整体统计</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看虚拟内存、进程、CPU 活动</span>
<span class="token function">vmstat</span> <span class="token number">5</span> <span class="token number">10</span>  <span class="token comment"># 每 5 秒一次，共 10 次</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="iostat-磁盘-i-o-统计" tabindex="-1"><a class="header-anchor" href="#iostat-磁盘-i-o-统计"><span>iostat - 磁盘 I/O 统计</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>iostat <span class="token parameter variable">-x</span> <span class="token number">5</span>  <span class="token comment"># 每 5 秒一次，显示扩展信息</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="free-内存使用" tabindex="-1"><a class="header-anchor" href="#free-内存使用"><span>free - 内存使用</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">free</span> <span class="token parameter variable">-h</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="dstat-综合监控" tabindex="-1"><a class="header-anchor" href="#dstat-综合监控"><span>dstat - 综合监控</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 安装</span>
yum <span class="token function">install</span> dstat  <span class="token comment"># CentOS</span>
<span class="token function">apt</span> <span class="token function">install</span> dstat  <span class="token comment"># Debian/Ubuntu</span>

<span class="token comment"># 使用</span>
dstat <span class="token parameter variable">-c</span>  <span class="token comment"># CPU</span>
dstat <span class="token parameter variable">-m</span>  <span class="token comment"># 内存</span>
dstat <span class="token parameter variable">-d</span>  <span class="token comment"># 磁盘</span>
dstat <span class="token parameter variable">-n</span>  <span class="token comment"># 网络</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="性能调优参数" tabindex="-1"><a class="header-anchor" href="#性能调优参数"><span>性能调优参数</span></a></h3><h4 id="网络调优" tabindex="-1"><a class="header-anchor" href="#网络调优"><span>网络调优</span></a></h4><p>编辑 <code>/etc/sysctl.conf</code>:</p><div class="language-conf line-numbers-mode" data-ext="conf" data-title="conf"><pre class="language-conf"><code># TCP 调优
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.ipv4.tcp_max_syn_backlog = 65535

# TCP 连接回收
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_tw_recycle = 0
net.ipv4.tcp_fin_timeout = 30

# TCP 缓冲区
net.ipv4.tcp_rmem = 4096 87380 67108864
net.ipv4.tcp_wmem = 4096 65536 67108864
net.ipv4.tcp_mem = 786432 1048576 1572864

# 端口范围
net.ipv4.ip_local_port_range = 1024 65535
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>应用配置:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">sysctl</span> <span class="token parameter variable">-p</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="文件描述符限制" tabindex="-1"><a class="header-anchor" href="#文件描述符限制"><span>文件描述符限制</span></a></h4><p>编辑 <code>/etc/security/limits.conf</code>:</p><div class="language-conf line-numbers-mode" data-ext="conf" data-title="conf"><pre class="language-conf"><code>* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="安全加固" tabindex="-1"><a class="header-anchor" href="#安全加固"><span>安全加固</span></a></h2><h3 id="ssh-安全配置" tabindex="-1"><a class="header-anchor" href="#ssh-安全配置"><span>SSH 安全配置</span></a></h3><p>编辑 <code>/etc/ssh/sshd_config</code>:</p><div class="language-conf line-numbers-mode" data-ext="conf" data-title="conf"><pre class="language-conf"><code># 禁止 root 登录
PermitRootLogin no

# 禁止密码登录，使用密钥
PasswordAuthentication no
PubkeyAuthentication yes

# 端口
Port 2222

# 禁用不安全的认证
HostbasedAuthentication no
PermitEmptyPasswords no

# 登录验证次数
MaxAuthTries 3

# 空闲超时
ClientAliveInterval 300
ClientAliveCountMax 3
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>重启 SSH:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>systemctl restart sshd
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="防火墙配置" tabindex="-1"><a class="header-anchor" href="#防火墙配置"><span>防火墙配置</span></a></h3><h4 id="firewalld-centos-rhel" tabindex="-1"><a class="header-anchor" href="#firewalld-centos-rhel"><span>firewalld (CentOS/RHEL)</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 启动 firewalld</span>
systemctl start firewalld
systemctl <span class="token builtin class-name">enable</span> firewalld

<span class="token comment"># 开放端口</span>
firewall-cmd <span class="token parameter variable">--zone</span><span class="token operator">=</span>public --add-port<span class="token operator">=</span><span class="token number">80</span>/tcp <span class="token parameter variable">--permanent</span>
firewall-cmd <span class="token parameter variable">--zone</span><span class="token operator">=</span>public --add-port<span class="token operator">=</span><span class="token number">443</span>/tcp <span class="token parameter variable">--permanent</span>

<span class="token comment"># 开放服务</span>
firewall-cmd <span class="token parameter variable">--zone</span><span class="token operator">=</span>public --add-service<span class="token operator">=</span>http <span class="token parameter variable">--permanent</span>
firewall-cmd <span class="token parameter variable">--zone</span><span class="token operator">=</span>public --add-service<span class="token operator">=</span>https <span class="token parameter variable">--permanent</span>

<span class="token comment"># 重载配置</span>
firewall-cmd <span class="token parameter variable">--reload</span>

<span class="token comment"># 查看状态</span>
firewall-cmd --list-all
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="ufw-ubuntu-debian" tabindex="-1"><a class="header-anchor" href="#ufw-ubuntu-debian"><span>ufw (Ubuntu/Debian)</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 启用 ufw</span>
ufw <span class="token builtin class-name">enable</span>

<span class="token comment"># 允许端口</span>
ufw allow <span class="token number">80</span>/tcp
ufw allow <span class="token number">443</span>/tcp

<span class="token comment"># 允许服务</span>
ufw allow http
ufw allow https

<span class="token comment"># 查看状态</span>
ufw status
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="fail2ban-防暴力破解" tabindex="-1"><a class="header-anchor" href="#fail2ban-防暴力破解"><span>Fail2Ban 防暴力破解</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 安装</span>
yum <span class="token function">install</span> fail2ban fail2ban-systemd  <span class="token comment"># CentOS</span>
<span class="token function">apt</span> <span class="token function">install</span> fail2ban  <span class="token comment"># Ubuntu/Debian</span>

<span class="token comment"># 配置</span>
<span class="token function">cp</span> /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

<span class="token comment"># 编辑 /etc/fail2ban/jail.local</span>
<span class="token punctuation">[</span>sshd<span class="token punctuation">]</span>
enabled <span class="token operator">=</span> <span class="token boolean">true</span>
port <span class="token operator">=</span> <span class="token function">ssh</span>
maxretry <span class="token operator">=</span> <span class="token number">3</span>
findtime <span class="token operator">=</span> <span class="token number">300</span>
bantime <span class="token operator">=</span> <span class="token number">86400</span>

<span class="token comment"># 启动</span>
systemctl start fail2ban
systemctl <span class="token builtin class-name">enable</span> fail2ban

<span class="token comment"># 查看被禁 IP</span>
fail2ban-client status sshd
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="selinux-apparmor" tabindex="-1"><a class="header-anchor" href="#selinux-apparmor"><span>SELinux/AppArmor</span></a></h3><h4 id="selinux-基础操作" tabindex="-1"><a class="header-anchor" href="#selinux-基础操作"><span>SELinux 基础操作</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看状态</span>
getenforce

<span class="token comment"># 临时关闭</span>
setenforce <span class="token number">0</span>

<span class="token comment"># 永久配置</span>
<span class="token function">vim</span> /etc/selinux/config
<span class="token assign-left variable">SELINUX</span><span class="token operator">=</span>enforcing<span class="token operator">|</span>permissive<span class="token operator">|</span>disabled

<span class="token comment"># 查看上下文</span>
<span class="token function">ls</span> <span class="token parameter variable">-Z</span>

<span class="token comment"># 常见报错处理</span>
<span class="token comment"># 恢复文件上下文</span>
restorecon <span class="token parameter variable">-R</span> /var/www/html

<span class="token comment"># 允许端口</span>
semanage port <span class="token parameter variable">-a</span> <span class="token parameter variable">-t</span> http_port_t <span class="token parameter variable">-p</span> tcp <span class="token number">8080</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="自动化运维" tabindex="-1"><a class="header-anchor" href="#自动化运维"><span>自动化运维</span></a></h2><h3 id="shell-脚本进阶" tabindex="-1"><a class="header-anchor" href="#shell-脚本进阶"><span>Shell 脚本进阶</span></a></h3><h4 id="完整脚本示例" tabindex="-1"><a class="header-anchor" href="#完整脚本示例"><span>完整脚本示例</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token shebang important">#!/bin/bash</span>
<span class="token builtin class-name">set</span> <span class="token parameter variable">-euo</span> pipefail

<span class="token comment"># 日志函数</span>
<span class="token function-name function">log</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;[<span class="token variable"><span class="token variable">$(</span><span class="token function">date</span> <span class="token string">&#39;+%Y-%m-%d %H:%M:%S&#39;</span><span class="token variable">)</span></span>] <span class="token variable">$1</span>&quot;</span>
<span class="token punctuation">}</span>

<span class="token comment"># 错误处理</span>
<span class="token function-name function">error</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    log <span class="token string">&quot;ERROR: <span class="token variable">$1</span>&quot;</span>
    <span class="token builtin class-name">exit</span> <span class="token number">1</span>
<span class="token punctuation">}</span>

<span class="token comment"># 主逻辑</span>
<span class="token function-name function">main</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    log <span class="token string">&quot;Starting backup...&quot;</span>
    
    <span class="token comment"># 备份目录</span>
    <span class="token assign-left variable">BACKUP_DIR</span><span class="token operator">=</span><span class="token string">&quot;/backup&quot;</span>
    <span class="token assign-left variable">DATE</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span><span class="token function">date</span> <span class="token string">&#39;+%Y%m%d_%H%M%S&#39;</span><span class="token variable">)</span></span>
    
    <span class="token comment"># 创建备份目录</span>
    <span class="token function">mkdir</span> <span class="token parameter variable">-p</span> <span class="token string">&quot;<span class="token variable">$BACKUP_DIR</span>&quot;</span>
    
    <span class="token comment"># 备份数据</span>
    <span class="token function">tar</span> czf <span class="token string">&quot;<span class="token variable">$BACKUP_DIR</span>/data_<span class="token variable">$DATE</span>.tar.gz&quot;</span> /data <span class="token operator">||</span> error <span class="token string">&quot;Backup failed&quot;</span>
    
    log <span class="token string">&quot;Backup completed successfully&quot;</span>
<span class="token punctuation">}</span>

main <span class="token string">&quot;<span class="token variable">$@</span>&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="定时任务-1" tabindex="-1"><a class="header-anchor" href="#定时任务-1"><span>定时任务</span></a></h4><p>编辑 crontab:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">crontab</span> <span class="token parameter variable">-e</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><div class="language-crontab line-numbers-mode" data-ext="crontab" data-title="crontab"><pre class="language-crontab"><code># 每天凌晨 2 点执行备份
0 2 * * * /opt/scripts/backup.sh &gt;&gt; /var/log/backup.log 2&gt;&amp;1

# 每 10 分钟检查服务
*/10 * * * * /opt/scripts/check_service.sh

# 每周日凌晨 3 点更新
0 3 * * 0 /opt/scripts/update.sh
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="ansible-基础" tabindex="-1"><a class="header-anchor" href="#ansible-基础"><span>Ansible 基础</span></a></h3><h4 id="安装" tabindex="-1"><a class="header-anchor" href="#安装"><span>安装</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># CentOS</span>
yum <span class="token function">install</span> ansible

<span class="token comment"># Ubuntu</span>
<span class="token function">apt</span> <span class="token function">install</span> ansible
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="清单文件" tabindex="-1"><a class="header-anchor" href="#清单文件"><span>清单文件</span></a></h4><p><code>/etc/ansible/hosts</code>:</p><div class="language-ini line-numbers-mode" data-ext="ini" data-title="ini"><pre class="language-ini"><code><span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">webservers</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">web1 ansible_host</span><span class="token punctuation">=</span><span class="token value attr-value">192.168.1.10 ansible_user=admin</span>
<span class="token key attr-name">web2 ansible_host</span><span class="token punctuation">=</span><span class="token value attr-value">192.168.1.11 ansible_user=admin</span>

<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">dbservers</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">db1 ansible_host</span><span class="token punctuation">=</span><span class="token value attr-value">192.168.1.20 ansible_user=admin</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="playbook-示例" tabindex="-1"><a class="header-anchor" href="#playbook-示例"><span>Playbook 示例</span></a></h4><p><code>nginx.yml</code>:</p><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token punctuation">---</span>
<span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Install and configure Nginx
  <span class="token key atrule">hosts</span><span class="token punctuation">:</span> webservers
  <span class="token key atrule">become</span><span class="token punctuation">:</span> yes
  <span class="token key atrule">tasks</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Install Nginx
      <span class="token key atrule">yum</span><span class="token punctuation">:</span>
        <span class="token key atrule">name</span><span class="token punctuation">:</span> nginx
        <span class="token key atrule">state</span><span class="token punctuation">:</span> present

    <span class="token punctuation">-</span> <span class="token key atrule">name</span><span class="token punctuation">:</span> Start Nginx service
      <span class="token key atrule">service</span><span class="token punctuation">:</span>
        <span class="token key atrule">name</span><span class="token punctuation">:</span> nginx
        <span class="token key atrule">state</span><span class="token punctuation">:</span> started
        <span class="token key atrule">enabled</span><span class="token punctuation">:</span> yes
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行 Playbook:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>ansible-playbook nginx.yml
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><hr><h2 id="容器化部署" tabindex="-1"><a class="header-anchor" href="#容器化部署"><span>容器化部署</span></a></h2><h3 id="docker-基础" tabindex="-1"><a class="header-anchor" href="#docker-基础"><span>Docker 基础</span></a></h3><h4 id="安装-1" tabindex="-1"><a class="header-anchor" href="#安装-1"><span>安装</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># CentOS</span>
yum <span class="token function">install</span> <span class="token parameter variable">-y</span> <span class="token function">docker</span>
systemctl start <span class="token function">docker</span>
systemctl <span class="token builtin class-name">enable</span> <span class="token function">docker</span>

<span class="token comment"># Ubuntu</span>
<span class="token function">apt</span> <span class="token function">install</span> docker.io
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="常用命令" tabindex="-1"><a class="header-anchor" href="#常用命令"><span>常用命令</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 运行容器</span>
<span class="token function">docker</span> run <span class="token parameter variable">-d</span> <span class="token parameter variable">--name</span> nginx <span class="token parameter variable">-p</span> <span class="token number">80</span>:80 nginx

<span class="token comment"># 查看容器</span>
<span class="token function">docker</span> <span class="token function">ps</span>
<span class="token function">docker</span> <span class="token function">ps</span> <span class="token parameter variable">-a</span>

<span class="token comment"># 查看日志</span>
<span class="token function">docker</span> logs <span class="token parameter variable">-f</span> nginx

<span class="token comment"># 进入容器</span>
<span class="token function">docker</span> <span class="token builtin class-name">exec</span> <span class="token parameter variable">-it</span> nginx <span class="token function">bash</span>

<span class="token comment"># 停止/删除容器</span>
<span class="token function">docker</span> stop nginx
<span class="token function">docker</span> <span class="token function">rm</span> nginx

<span class="token comment"># 镜像操作</span>
<span class="token function">docker</span> pull nginx
<span class="token function">docker</span> images
<span class="token function">docker</span> rmi nginx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="docker-compose" tabindex="-1"><a class="header-anchor" href="#docker-compose"><span>Docker Compose</span></a></h4><p>创建 <code>docker-compose.yml</code>:</p><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">version</span><span class="token punctuation">:</span> <span class="token string">&#39;3&#39;</span>
<span class="token key atrule">services</span><span class="token punctuation">:</span>
  <span class="token key atrule">web</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> nginx
    <span class="token key atrule">ports</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> <span class="token string">&quot;80:80&quot;</span>
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> ./nginx.conf<span class="token punctuation">:</span>/etc/nginx/nginx.conf
    <span class="token key atrule">depends_on</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> db

  <span class="token key atrule">db</span><span class="token punctuation">:</span>
    <span class="token key atrule">image</span><span class="token punctuation">:</span> mysql<span class="token punctuation">:</span><span class="token number">5.7</span>
    <span class="token key atrule">environment</span><span class="token punctuation">:</span>
      <span class="token key atrule">MYSQL_ROOT_PASSWORD</span><span class="token punctuation">:</span> secret
    <span class="token key atrule">volumes</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> db_data<span class="token punctuation">:</span>/var/lib/mysql

<span class="token key atrule">volumes</span><span class="token punctuation">:</span>
  <span class="token key atrule">db_data</span><span class="token punctuation">:</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>运行:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">docker-compose</span> up <span class="token parameter variable">-d</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><hr><h2 id="日志管理" tabindex="-1"><a class="header-anchor" href="#日志管理"><span>日志管理</span></a></h2><h3 id="系统日志" tabindex="-1"><a class="header-anchor" href="#系统日志"><span>系统日志</span></a></h3><h4 id="journald-日志管理" tabindex="-1"><a class="header-anchor" href="#journald-日志管理"><span>journald 日志管理</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看日志</span>
journalctl
journalctl <span class="token parameter variable">-u</span> nginx.service
journalctl <span class="token parameter variable">-u</span> nginx.service <span class="token parameter variable">-f</span>  <span class="token comment"># 实时跟踪</span>
journalctl <span class="token parameter variable">--since</span> today
journalctl <span class="token parameter variable">--since</span> <span class="token string">&quot;2023-01-01&quot;</span> <span class="token parameter variable">--until</span> <span class="token string">&quot;2023-01-02&quot;</span>

<span class="token comment"># 日志大小限制</span>
<span class="token comment"># 编辑 /etc/systemd/journald.conf</span>
<span class="token assign-left variable">SystemMaxUse</span><span class="token operator">=</span>1G
<span class="token assign-left variable">SystemKeepFree</span><span class="token operator">=</span>2G
<span class="token assign-left variable">RuntimeMaxUse</span><span class="token operator">=</span>512M
<span class="token assign-left variable">RuntimeKeepFree</span><span class="token operator">=</span>1G
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="rsyslog" tabindex="-1"><a class="header-anchor" href="#rsyslog"><span>rsyslog</span></a></h4><p><code>/etc/rsyslog.d/myapp.conf</code>:</p><div class="language-conf line-numbers-mode" data-ext="conf" data-title="conf"><pre class="language-conf"><code>if $programname == &#39;myapp&#39; then /var/log/myapp.log
&amp; stop
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="日志轮转" tabindex="-1"><a class="header-anchor" href="#日志轮转"><span>日志轮转</span></a></h3><p><code>/etc/logrotate.d/myapp</code>:</p><div class="language-conf line-numbers-mode" data-ext="conf" data-title="conf"><pre class="language-conf"><code>/var/log/myapp/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 root root
    sharedscripts
    postrotate
        systemctl reload myapp 2&gt;/dev/null || true
    endscript
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="网络高级配置" tabindex="-1"><a class="header-anchor" href="#网络高级配置"><span>网络高级配置</span></a></h2><h3 id="静态-ip-配置" tabindex="-1"><a class="header-anchor" href="#静态-ip-配置"><span>静态 IP 配置</span></a></h3><h4 id="centos-8-rhel-8" tabindex="-1"><a class="header-anchor" href="#centos-8-rhel-8"><span>CentOS 8/RHEL 8</span></a></h4><p><code>/etc/sysconfig/network-scripts/ifcfg-eth0</code>:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token assign-left variable">TYPE</span><span class="token operator">=</span>Ethernet
<span class="token assign-left variable">BOOTPROTO</span><span class="token operator">=</span>static
<span class="token assign-left variable">NAME</span><span class="token operator">=</span>eth0
<span class="token assign-left variable">DEVICE</span><span class="token operator">=</span>eth0
<span class="token assign-left variable">ONBOOT</span><span class="token operator">=</span>yes
<span class="token assign-left variable">IPADDR</span><span class="token operator">=</span><span class="token number">192.168</span>.1.100
<span class="token assign-left variable">PREFIX</span><span class="token operator">=</span><span class="token number">24</span>
<span class="token assign-left variable">GATEWAY</span><span class="token operator">=</span><span class="token number">192.168</span>.1.1
<span class="token assign-left variable">DNS1</span><span class="token operator">=</span><span class="token number">8.8</span>.8.8
<span class="token assign-left variable">DNS2</span><span class="token operator">=</span><span class="token number">114.114</span>.114.114
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>重启网络:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>nmcli c reload
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h4 id="ubuntu-20-04" tabindex="-1"><a class="header-anchor" href="#ubuntu-20-04"><span>Ubuntu 20.04+</span></a></h4><p><code>/etc/netplan/01-netcfg.yaml</code>:</p><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">network</span><span class="token punctuation">:</span>
  <span class="token key atrule">ethernets</span><span class="token punctuation">:</span>
    <span class="token key atrule">eth0</span><span class="token punctuation">:</span>
      <span class="token key atrule">addresses</span><span class="token punctuation">:</span> <span class="token punctuation">[</span>192.168.1.100/24<span class="token punctuation">]</span>
      <span class="token key atrule">gateway4</span><span class="token punctuation">:</span> 192.168.1.1
      <span class="token key atrule">nameservers</span><span class="token punctuation">:</span>
        <span class="token key atrule">addresses</span><span class="token punctuation">:</span> <span class="token punctuation">[</span>8.8.8.8<span class="token punctuation">,</span> 114.114.114.114<span class="token punctuation">]</span>
  <span class="token key atrule">version</span><span class="token punctuation">:</span> <span class="token number">2</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>应用配置:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>netplan apply
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="网桥配置" tabindex="-1"><a class="header-anchor" href="#网桥配置"><span>网桥配置</span></a></h3><p><code>/etc/sysconfig/network-scripts/ifcfg-br0</code>:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token assign-left variable">TYPE</span><span class="token operator">=</span>Bridge
<span class="token assign-left variable">BOOTPROTO</span><span class="token operator">=</span>static
<span class="token assign-left variable">NAME</span><span class="token operator">=</span>br0
<span class="token assign-left variable">DEVICE</span><span class="token operator">=</span>br0
<span class="token assign-left variable">ONBOOT</span><span class="token operator">=</span>yes
<span class="token assign-left variable">IPADDR</span><span class="token operator">=</span><span class="token number">192.168</span>.1.100
<span class="token assign-left variable">PREFIX</span><span class="token operator">=</span><span class="token number">24</span>
<span class="token assign-left variable">GATEWAY</span><span class="token operator">=</span><span class="token number">192.168</span>.1.1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>/etc/sysconfig/network-scripts/ifcfg-eth0</code>:</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token assign-left variable">TYPE</span><span class="token operator">=</span>Ethernet
<span class="token assign-left variable">BOOTPROTO</span><span class="token operator">=</span>none
<span class="token assign-left variable">NAME</span><span class="token operator">=</span>eth0
<span class="token assign-left variable">DEVICE</span><span class="token operator">=</span>eth0
<span class="token assign-left variable">ONBOOT</span><span class="token operator">=</span>yes
<span class="token assign-left variable">BRIDGE</span><span class="token operator">=</span>br0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="iptables-ip6tables" tabindex="-1"><a class="header-anchor" href="#iptables-ip6tables"><span>iptables/ip6tables</span></a></h3><h4 id="基本操作" tabindex="-1"><a class="header-anchor" href="#基本操作"><span>基本操作</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看规则</span>
iptables <span class="token parameter variable">-L</span> <span class="token parameter variable">-n</span> <span class="token parameter variable">-v</span> --line-numbers

<span class="token comment"># 允许 SSH</span>
iptables <span class="token parameter variable">-A</span> INPUT <span class="token parameter variable">-p</span> tcp <span class="token parameter variable">--dport</span> <span class="token number">22</span> <span class="token parameter variable">-j</span> ACCEPT

<span class="token comment"># 允许 HTTP/HTTPS</span>
iptables <span class="token parameter variable">-A</span> INPUT <span class="token parameter variable">-p</span> tcp <span class="token parameter variable">--dport</span> <span class="token number">80</span> <span class="token parameter variable">-j</span> ACCEPT
iptables <span class="token parameter variable">-A</span> INPUT <span class="token parameter variable">-p</span> tcp <span class="token parameter variable">--dport</span> <span class="token number">443</span> <span class="token parameter variable">-j</span> ACCEPT

<span class="token comment"># 允许已建立的连接</span>
iptables <span class="token parameter variable">-A</span> INPUT <span class="token parameter variable">-m</span> state <span class="token parameter variable">--state</span> ESTABLISHED,RELATED <span class="token parameter variable">-j</span> ACCEPT

<span class="token comment"># 默认策略</span>
iptables <span class="token parameter variable">-P</span> INPUT DROP
iptables <span class="token parameter variable">-P</span> FORWARD DROP
iptables <span class="token parameter variable">-P</span> OUTPUT ACCEPT

<span class="token comment"># 保存规则</span>
iptables-save <span class="token operator">&gt;</span> /etc/sysconfig/iptables
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="参考资料" tabindex="-1"><a class="header-anchor" href="#参考资料"><span>参考资料</span></a></h2><ul><li><a href="https://www.kernel.org/doc/" target="_blank" rel="noopener noreferrer">Linux Kernel Documentation</a></li><li><a href="https://www.freedesktop.org/software/systemd/man/" target="_blank" rel="noopener noreferrer">Systemd Documentation</a></li><li><a href="https://docs.docker.com/" target="_blank" rel="noopener noreferrer">Docker Documentation</a></li><li><a href="https://docs.ansible.com/" target="_blank" rel="noopener noreferrer">Ansible Documentation</a></li><li><a href="http://www.brendangregg.com/linuxperf.html" target="_blank" rel="noopener noreferrer">Linux Performance</a></li></ul>`,133),t=[l];function c(p,r){return s(),a("div",null,t)}const v=n(i,[["render",c],["__file","linux-advanced-guide.html.vue"]]),u=JSON.parse('{"path":"/serve/linux/linux-advanced-guide.html","title":"Linux 高级应用指南","lang":"zh-CN","frontmatter":{"description":"Linux 高级应用指南 本文档涵盖 Linux 系统管理、性能调优、安全加固、自动化运维等高级主题 目录 系统管理进阶 性能监控与调优 安全加固 自动化运维 容器化部署 日志管理 网络高级配置 系统管理进阶 Systemd 深度使用 Systemd 是现代 Linux 系统的初始化系统，提供了强大的服务管理功能。 服务管理 自定义服务文件 创建 /e...","head":[["meta",{"property":"og:url","content":"https://lfange.github.io/serve/linux/linux-advanced-guide.html"}],["meta",{"property":"og:site_name","content":"哓番茄"}],["meta",{"property":"og:title","content":"Linux 高级应用指南"}],["meta",{"property":"og:description","content":"Linux 高级应用指南 本文档涵盖 Linux 系统管理、性能调优、安全加固、自动化运维等高级主题 目录 系统管理进阶 性能监控与调优 安全加固 自动化运维 容器化部署 日志管理 网络高级配置 系统管理进阶 Systemd 深度使用 Systemd 是现代 Linux 系统的初始化系统，提供了强大的服务管理功能。 服务管理 自定义服务文件 创建 /e..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2026-07-09T04:55:41.000Z"}],["meta",{"property":"article:author","content":"哓番茄"}],["meta",{"property":"article:modified_time","content":"2026-07-09T04:55:41.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Linux 高级应用指南\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2026-07-09T04:55:41.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"哓番茄\\",\\"url\\":\\"https://lfange.github.io/\\"}]}"]]},"headers":[{"level":2,"title":"目录","slug":"目录","link":"#目录","children":[]},{"level":2,"title":"系统管理进阶","slug":"系统管理进阶","link":"#系统管理进阶","children":[{"level":3,"title":"Systemd 深度使用","slug":"systemd-深度使用","link":"#systemd-深度使用","children":[]},{"level":3,"title":"用户权限管理","slug":"用户权限管理","link":"#用户权限管理","children":[]},{"level":3,"title":"磁盘管理 LVM","slug":"磁盘管理-lvm","link":"#磁盘管理-lvm","children":[]}]},{"level":2,"title":"性能监控与调优","slug":"性能监控与调优","link":"#性能监控与调优","children":[{"level":3,"title":"系统监控工具","slug":"系统监控工具","link":"#系统监控工具","children":[]},{"level":3,"title":"性能调优参数","slug":"性能调优参数","link":"#性能调优参数","children":[]}]},{"level":2,"title":"安全加固","slug":"安全加固","link":"#安全加固","children":[{"level":3,"title":"SSH 安全配置","slug":"ssh-安全配置","link":"#ssh-安全配置","children":[]},{"level":3,"title":"防火墙配置","slug":"防火墙配置","link":"#防火墙配置","children":[]},{"level":3,"title":"Fail2Ban 防暴力破解","slug":"fail2ban-防暴力破解","link":"#fail2ban-防暴力破解","children":[]},{"level":3,"title":"SELinux/AppArmor","slug":"selinux-apparmor","link":"#selinux-apparmor","children":[]}]},{"level":2,"title":"自动化运维","slug":"自动化运维","link":"#自动化运维","children":[{"level":3,"title":"Shell 脚本进阶","slug":"shell-脚本进阶","link":"#shell-脚本进阶","children":[]},{"level":3,"title":"Ansible 基础","slug":"ansible-基础","link":"#ansible-基础","children":[]}]},{"level":2,"title":"容器化部署","slug":"容器化部署","link":"#容器化部署","children":[{"level":3,"title":"Docker 基础","slug":"docker-基础","link":"#docker-基础","children":[]}]},{"level":2,"title":"日志管理","slug":"日志管理","link":"#日志管理","children":[{"level":3,"title":"系统日志","slug":"系统日志","link":"#系统日志","children":[]},{"level":3,"title":"日志轮转","slug":"日志轮转","link":"#日志轮转","children":[]}]},{"level":2,"title":"网络高级配置","slug":"网络高级配置","link":"#网络高级配置","children":[{"level":3,"title":"静态 IP 配置","slug":"静态-ip-配置","link":"#静态-ip-配置","children":[]},{"level":3,"title":"网桥配置","slug":"网桥配置","link":"#网桥配置","children":[]},{"level":3,"title":"iptables/ip6tables","slug":"iptables-ip6tables","link":"#iptables-ip6tables","children":[]}]},{"level":2,"title":"参考资料","slug":"参考资料","link":"#参考资料","children":[]}],"git":{"createdTime":1783572941000,"updatedTime":1783572941000,"contributors":[{"name":"FanGe","email":"653398363@qq.com","commits":1}]},"readingTime":{"minutes":5.46,"words":1638},"filePathRelative":"serve/linux/linux-advanced-guide.md","localizedDate":"2026年7月9日","excerpt":"","autoDesc":true}');export{v as comp,u as data};
