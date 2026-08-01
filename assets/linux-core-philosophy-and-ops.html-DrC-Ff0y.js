import{_ as n}from"./plugin-vue_export-helper-DlAUqK2U.js";import{c as s,o as a,a as e}from"./app-DFE3w5Wj.js";const l={},t=e(`<h1 id="linux-核心思想与常用操作实战" tabindex="-1"><a class="header-anchor" href="#linux-核心思想与常用操作实战"><span>Linux 核心思想与常用操作实战</span></a></h1><h2 id="一、linux-核心思想-——-理解它-才能驾驭它" tabindex="-1"><a class="header-anchor" href="#一、linux-核心思想-——-理解它-才能驾驭它"><span>一、Linux 核心思想 —— 理解它，才能驾驭它</span></a></h2><h3 id="_1-1-一切皆文件-everything-is-a-file" tabindex="-1"><a class="header-anchor" href="#_1-1-一切皆文件-everything-is-a-file"><span>1.1 一切皆文件 (Everything is a File)</span></a></h3><p>这是 Linux 最根本的设计哲学。在 Linux 中，<strong>普通文件、目录、设备、进程、网络 socket，甚至内核参数，都以文件的形式呈现</strong>。</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>普通文件    →  ~/documents/note.txt      （读写数据）
硬盘设备    →  /dev/sda                   （cat /dev/sda 能读原始磁盘数据）
终端        →  /dev/tty                   （向终端写数据 = 屏幕显示）
进程信息    →  /proc/&lt;pid&gt;/status          （cat 一下就能看进程状态）
内核参数    →  /proc/sys/net/ipv4/ip_forward  （echo 1 &gt; ... 就开启了 IP 转发）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>这意味着什么？</strong> 只要你学会了 <code>cat</code>、<code>echo</code>、<code>ls</code>、<code>cp</code> 这几个文件操作命令，理论上你就能操作 Linux 的一切。</p><p><strong>Demo —— 用文件操作来控制系统：</strong></p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 1. 查看 CPU 信息 —— 读一个&quot;文件&quot;</span>
<span class="token function">cat</span> /proc/cpuinfo <span class="token operator">|</span> <span class="token function">grep</span> <span class="token string">&quot;model name&quot;</span>

<span class="token comment"># 2. 查看内存 —— 读一个&quot;文件&quot;</span>
<span class="token function">cat</span> /proc/meminfo <span class="token operator">|</span> <span class="token function">head</span> <span class="token parameter variable">-5</span>

<span class="token comment"># 3. 修改主机名 —— 写一个&quot;文件&quot;</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;my-server&quot;</span> <span class="token operator">&gt;</span> /etc/hostname

<span class="token comment"># 4. 开启 IP 转发（让这台机器能做路由器）—— 写一个&quot;文件&quot;</span>
<span class="token builtin class-name">echo</span> <span class="token number">1</span> <span class="token operator">&gt;</span> /proc/sys/net/ipv4/ip_forward

<span class="token comment"># 5. 查看当前运行的所有进程 —— 遍历一个&quot;目录&quot;</span>
<span class="token function">ls</span> /proc/ <span class="token operator">|</span> <span class="token function">grep</span> <span class="token parameter variable">-E</span> <span class="token string">&#39;^[0-9]+$&#39;</span> <span class="token operator">|</span> <span class="token function">head</span> <span class="token parameter variable">-10</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><strong>领悟</strong>：学习 Linux 时不要被&quot;这个工具、那个工具&quot;吓到，本质上都是在操作文件。掌握了文件操作，就掌握了 Linux 的钥匙。</p></blockquote><hr><h3 id="_1-2-小而美-一个程序只做一件事-do-one-thing-and-do-it-well" tabindex="-1"><a class="header-anchor" href="#_1-2-小而美-一个程序只做一件事-do-one-thing-and-do-it-well"><span>1.2 小而美：一个程序只做一件事 (Do One Thing and Do It Well)</span></a></h3><p>每个命令行工具只专注于做好一件事，然后通过 <strong>管道 (<code>|</code>)</strong> 把多个小程序组合起来，完成复杂的任务。</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>单一职责的小工具  +  管道组合  =  无限可能
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>Demo —— 用管道串联完成一个复杂任务：</strong></p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 需求：找出当前系统中占用内存最多的 5 个进程，只显示进程名和内存占用率</span>

<span class="token function">ps</span> aux <span class="token parameter variable">--sort</span><span class="token operator">=</span>-%mem <span class="token operator">|</span> <span class="token function">awk</span> <span class="token string">&#39;{print $4, $11}&#39;</span> <span class="token operator">|</span> <span class="token function">head</span> <span class="token parameter variable">-6</span> <span class="token operator">|</span> <span class="token function">tail</span> <span class="token parameter variable">-5</span>

<span class="token comment"># 拆解分析：</span>
<span class="token comment"># ps aux --sort=-%mem    → 列出所有进程，按内存降序（做好一件事：列出进程）</span>
<span class="token comment"># awk &#39;{print $4, $11}&#39;  → 只提取第4列（内存）和第11列（进程名）（做好一件事：提取列）</span>
<span class="token comment"># head -6                → 取前6行（含表头）（做好一件事：取头部）</span>
<span class="token comment"># tail -5                → 去掉表头，保留5行 （做好一件事：取尾部）</span>
<span class="token comment"># |                      → 管道，把前一个的输出变成后一个的输入</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 需求：统计 access.log 中访问量前 10 的 IP</span>

<span class="token function">cat</span> /var/log/nginx/access.log <span class="token operator">|</span> <span class="token function">awk</span> <span class="token string">&#39;{print $1}&#39;</span> <span class="token operator">|</span> <span class="token function">sort</span> <span class="token operator">|</span> <span class="token function">uniq</span> <span class="token parameter variable">-c</span> <span class="token operator">|</span> <span class="token function">sort</span> <span class="token parameter variable">-rn</span> <span class="token operator">|</span> <span class="token function">head</span> <span class="token parameter variable">-10</span>

<span class="token comment"># 每个命令都只做一件事：</span>
<span class="token comment"># cat      → 读取文件</span>
<span class="token comment"># awk      → 提取 IP 列</span>
<span class="token comment"># sort     → 排序（让相同 IP 排在一起）</span>
<span class="token comment"># uniq -c  → 统计去重（统计每个 IP 出现次数）</span>
<span class="token comment"># sort -rn → 按数字降序排列</span>
<span class="token comment"># head -10 → 取前 10 条</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><strong>领悟</strong>：不要试图找一个&quot;万能命令&quot;，而是学会用管道把简单命令组合起来。这是 Linux 命令行强大之美的核心。</p></blockquote><hr><h3 id="_1-3-一切皆可脚本化-everything-is-scriptable" tabindex="-1"><a class="header-anchor" href="#_1-3-一切皆可脚本化-everything-is-scriptable"><span>1.3 一切皆可脚本化 (Everything is Scriptable)</span></a></h3><p>Linux 鼓励你写 Shell 脚本把重复操作自动化。脚本就是把命令写进文件，让它批量执行。</p><p><strong>Demo —— 一个实用的日常备份脚本：</strong></p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token shebang important">#!/bin/bash</span>
<span class="token comment"># backup.sh —— 每日备份数据库 + 清理旧备份</span>

<span class="token assign-left variable">DB_NAME</span><span class="token operator">=</span><span class="token string">&quot;myapp&quot;</span>
<span class="token assign-left variable">BACKUP_DIR</span><span class="token operator">=</span><span class="token string">&quot;/backup/db&quot;</span>
<span class="token assign-left variable">RETENTION_DAYS</span><span class="token operator">=</span><span class="token number">7</span>   <span class="token comment"># 保留 7 天</span>

<span class="token comment"># 1. 创建备份目录</span>
<span class="token function">mkdir</span> <span class="token parameter variable">-p</span> <span class="token string">&quot;<span class="token variable">$BACKUP_DIR</span>&quot;</span>

<span class="token comment"># 2. 导出数据库（带时间戳）</span>
mysqldump <span class="token string">&quot;<span class="token variable">$DB_NAME</span>&quot;</span> <span class="token operator">|</span> <span class="token function">gzip</span> <span class="token operator">&gt;</span> <span class="token string">&quot;<span class="token variable">$BACKUP_DIR</span>/<span class="token variable">\${DB_NAME}</span>_<span class="token variable"><span class="token variable">$(</span><span class="token function">date</span> +%Y%m%d<span class="token variable">)</span></span>.sql.gz&quot;</span>

<span class="token comment"># 3. 删除超过 7 天的旧备份</span>
<span class="token function">find</span> <span class="token string">&quot;<span class="token variable">$BACKUP_DIR</span>&quot;</span> <span class="token parameter variable">-name</span> <span class="token string">&quot;*.sql.gz&quot;</span> <span class="token parameter variable">-mtime</span> +<span class="token variable">$RETENTION_DAYS</span> <span class="token parameter variable">-delete</span>

<span class="token builtin class-name">echo</span> <span class="token string">&quot;Backup done: <span class="token variable"><span class="token variable">$(</span><span class="token function">date</span><span class="token variable">)</span></span>&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 添加定时任务，每天凌晨 2 点自动执行</span>
<span class="token comment"># crontab -e</span>
<span class="token number">0</span> <span class="token number">2</span> * * * /home/user/scripts/backup.sh <span class="token operator">&gt;&gt;</span> /var/log/backup.log <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span><span class="token file-descriptor important">&amp;1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><strong>领悟</strong>：如果你发现自己在重复输入某个命令组合，就该把它写成一个脚本。脚本化是&quot;自动化思维&quot;的起点。</p></blockquote><hr><h3 id="_1-4-文本为王-text-is-king" tabindex="-1"><a class="header-anchor" href="#_1-4-文本为王-text-is-king"><span>1.4 文本为王 (Text is King)</span></a></h3><p>Linux 的配置几乎全是纯文本文件。没有 Windows 的注册表、没有隐藏的二进制配置。<strong>这意味着你可以用任何文本编辑器搞定一切配置。</strong></p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 用户信息 —— 文本文件</span>
<span class="token function">cat</span> /etc/passwd

<span class="token comment"># 系统服务 —— 文本文件</span>
<span class="token function">cat</span> /etc/systemd/system/myapp.service

<span class="token comment"># 定时任务 —— 文本文件</span>
<span class="token function">crontab</span> <span class="token parameter variable">-l</span>

<span class="token comment"># 网络配置 —— 文本文件</span>
<span class="token function">cat</span> /etc/netplan/01-netcfg.yaml

<span class="token comment"># 日志 —— 文本文件</span>
<span class="token function">tail</span> <span class="token parameter variable">-f</span> /var/log/syslog
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><strong>领悟</strong>：在 Linux 世界里，<code>grep</code> + <code>vim</code> 几乎能解决所有配置问题。不依赖 GUI，纯文本意味着你可以远程 SSH 管理一切。</p></blockquote><hr><h3 id="_1-5-沉默是金-silence-is-golden" tabindex="-1"><a class="header-anchor" href="#_1-5-沉默是金-silence-is-golden"><span>1.5 沉默是金 (Silence is Golden)</span></a></h3><p>Unix 哲学之一：<strong>没有消息就是好消息</strong>。一个命令执行成功了，它通常什么也不说。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 成功复制文件 —— 没有任何输出</span>
<span class="token function">cp</span> file1.txt file2.txt

<span class="token comment"># 想知道到底复制了没有？</span>
<span class="token function">ls</span> <span class="token parameter variable">-l</span> file2.txt          <span class="token comment"># 自己检查</span>
<span class="token function">cp</span> <span class="token parameter variable">-v</span> file1.txt file2.txt <span class="token comment"># 或者加 -v 让它说句话</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><blockquote><p><strong>领悟</strong>：不要期望 Linux 命令总是给你&quot;成功！&quot;的提示。学会用 <code>$?</code>（上一条命令的退出码：0=成功，非0=失败）来判断。</p></blockquote><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">cp</span> file1.txt file2.txt
<span class="token builtin class-name">echo</span> <span class="token variable">$?</span>   <span class="token comment"># 输出 0 表示成功，非 0 表示失败</span>

<span class="token comment"># 实战：脚本中判断上一步是否成功</span>
<span class="token keyword">if</span> <span class="token function">cp</span> important.conf /etc/<span class="token punctuation">;</span> <span class="token keyword">then</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;部署成功&quot;</span>
<span class="token keyword">else</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;部署失败，请检查权限&quot;</span> <span class="token operator">&gt;</span><span class="token file-descriptor important">&amp;2</span>
    <span class="token builtin class-name">exit</span> <span class="token number">1</span>
<span class="token keyword">fi</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h3 id="_1-6-哲学总结-一张图看懂-linux-设计理念" tabindex="-1"><a class="header-anchor" href="#_1-6-哲学总结-一张图看懂-linux-设计理念"><span>1.6 哲学总结：一张图看懂 Linux 设计理念</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>┌─────────────────────────────────────────────────────────┐
│                    Linux 核心哲学                         │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │ 一切皆文件    │    │ 小而美       │                    │
│  │ Everything   │ +  │ Do One Thing│ = 强大而灵活的系统   │
│  │ is a File    │    │ Well         │                    │
│  └──────────────┘    └──────────────┘                    │
│          │                   │                            │
│          ▼                   ▼                            │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │ 文本为王      │    │ 管道组合      │                    │
│  │ Text is King │    │ Pipe |       │                    │
│  └──────────────┘    └──────────────┘                    │
│          │                   │                            │
│          ▼                   ▼                            │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │ 沉默是金      │    │ 一切可脚本化  │                    │
│  │ Silence is   │    │ Everything   │                    │
│  │ Golden       │    │ Scriptable   │                    │
│  └──────────────┘    └──────────────┘                    │
│                                                          │
│  核心理念：给你积木（小工具），而不是给你一整栋楼（大软件）│
│  你需要的是：理解积木 + 学会组合 = 搭建任何你想要的东西    │
└─────────────────────────────────────────────────────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="二、文件系统-——-了解你的工作台" tabindex="-1"><a class="header-anchor" href="#二、文件系统-——-了解你的工作台"><span>二、文件系统 —— 了解你的工作台</span></a></h2><h3 id="_2-1-linux-目录结构速览" tabindex="-1"><a class="header-anchor" href="#_2-1-linux-目录结构速览"><span>2.1 Linux 目录结构速览</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>/                  # 根目录，一切文件的起点
├── /bin           # 基础命令（ls, cp, mv, cat...）
├── /sbin          # 系统管理命令（fdisk, iptables...）
├── /etc           # 配置文件（&quot;所有配置在这里&quot;）
├── /dev           # 设备文件（硬盘、U盘、终端...）
├── /proc          # 进程和内核的虚拟文件系统（不占磁盘！）
├── /sys           # 内核和驱动的运行时信息
├── /tmp           # 临时文件（重启后清空）
├── /var           # 可变数据（日志 /var/log、数据库 /var/lib/mysql）
├── /home          # 用户主目录（~ = /home/你的用户名）
├── /root          # root 用户的主目录
├── /usr           # 用户安装的软件和库
├── /opt           # 第三方软件安装位置
└── /boot          # 启动相关的文件（内核镜像）
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>记忆技巧：</strong></p><table><thead><tr><th>目录</th><th>记忆法</th></tr></thead><tbody><tr><td><code>/etc</code></td><td><strong>E</strong>verything <strong>T</strong>o <strong>C</strong>onfigure</td></tr><tr><td><code>/var</code></td><td><strong>VAR</strong>iable — 经常变化的文件</td></tr><tr><td><code>/tmp</code></td><td><strong>T</strong>e<strong>M</strong>p — 临时文件</td></tr><tr><td><code>/opt</code></td><td><strong>OPT</strong>ional — 可选的第三方软件</td></tr><tr><td><code>/proc</code></td><td><strong>PROC</strong>ess — 进程信息</td></tr></tbody></table><h3 id="_2-2-inode-——-文件的-身份证" tabindex="-1"><a class="header-anchor" href="#_2-2-inode-——-文件的-身份证"><span>2.2 inode —— 文件的&quot;身份证&quot;</span></a></h3><p>在 Linux 中，<strong>文件名不是文件的唯一标识，inode 才是</strong>。</p><ul><li><strong>inode</strong>：存储文件的元数据（大小、权限、所有者、数据块位置），<strong>不存文件名</strong></li><li><strong>文件名</strong>：只是指向 inode 的&quot;标签&quot;</li><li><strong>block</strong>：存储实际数据的地方</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看文件的 inode 号</span>
<span class="token function">ls</span> <span class="token parameter variable">-i</span> hello.txt
<span class="token comment"># 输出：2621445 hello.txt   ← 2621445 就是 inode 号</span>

<span class="token comment"># 查看 inode 详细信息</span>
<span class="token function">stat</span> hello.txt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>这个知识有什么用？</strong></p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 场景：磁盘空间满了但 du 查不到大文件 —— inode 被占满！</span>
<span class="token function">df</span> <span class="token parameter variable">-i</span>          <span class="token comment"># 查看 inode 使用率</span>

<span class="token comment"># 场景：删除名字奇怪删不掉的文件 —— 用 inode 删！</span>
<span class="token function">ls</span> <span class="token parameter variable">-i</span>           <span class="token comment"># 找到 inode 号</span>
<span class="token function">find</span> <span class="token builtin class-name">.</span> <span class="token parameter variable">-inum</span> <span class="token number">2621445</span> <span class="token parameter variable">-delete</span>   <span class="token comment"># 按 inode 号删除</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_2-3-硬链接与软链接" tabindex="-1"><a class="header-anchor" href="#_2-3-硬链接与软链接"><span>2.3 硬链接与软链接</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># ┌──────────────────────────────────────────────────────┐</span>
<span class="token comment"># │  硬链接 (Hard Link)                                    │</span>
<span class="token comment"># │  · 多个文件名 → 同一个 inode                            │</span>
<span class="token comment"># │  · 删除一个文件名，数据还在（inode 引用计数 &gt; 0 即可）     │</span>
<span class="token comment"># │  · 不能跨文件系统，不能链接目录                          │</span>
<span class="token comment"># ├──────────────────────────────────────────────────────┤</span>
<span class="token comment"># │  软链接 (Symbolic Link / Symlink)                      │</span>
<span class="token comment"># │  · 一个特殊文件 → 存储的是目标路径（像 Windows 快捷方式） │</span>
<span class="token comment"># │  · 可以跨文件系统，可以链接目录                          │</span>
<span class="token comment"># │  · 目标被删除后，软链接就&quot;断&quot;了                          │</span>
<span class="token comment"># └──────────────────────────────────────────────────────┘</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># Demo：硬链接 vs 软链接</span>

<span class="token comment"># 创建一个原始文件</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;hello linux&quot;</span> <span class="token operator">&gt;</span> original.txt

<span class="token comment"># 创建硬链接</span>
<span class="token function">ln</span> original.txt hard.txt
<span class="token comment"># hard.txt 和 original.txt 指向同一个 inode，修改任意一个，另一个同步变化</span>

<span class="token comment"># 创建软链接</span>
<span class="token function">ln</span> <span class="token parameter variable">-s</span> original.txt soft.txt
<span class="token comment"># soft.txt → original.txt，只是一个&quot;指针&quot;</span>

<span class="token function">ls</span> <span class="token parameter variable">-li</span>  <span class="token comment"># -i 显示 inode 号，可以看到 hard.txt 和 original.txt 的 inode 相同</span>
<span class="token comment"># 输出示例：</span>
<span class="token comment"># 2621445 -rw-r--r-- 2 user user 12 Jun 22 10:00 original.txt</span>
<span class="token comment"># 2621445 -rw-r--r-- 2 user user 12 Jun 22 10:00 hard.txt       ← inode 相同！</span>
<span class="token comment"># 2621446 lrwxrwxrwx 1 user user 12 Jun 22 10:00 soft.txt -&gt; original.txt</span>

<span class="token comment"># 删除原文件后</span>
<span class="token function">rm</span> original.txt
<span class="token function">cat</span> hard.txt  <span class="token comment"># ✅ 还能读到 &quot;hello linux&quot;（数据还在，inode 引用计数从 2 降到 1）</span>
<span class="token function">cat</span> soft.txt  <span class="token comment"># ❌ 报错：No such file or directory（链接断了）</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="三、常用命令实战-——-按场景学习" tabindex="-1"><a class="header-anchor" href="#三、常用命令实战-——-按场景学习"><span>三、常用命令实战 —— 按场景学习</span></a></h2><h3 id="_3-1-文件操作-最基础-每天用" tabindex="-1"><a class="header-anchor" href="#_3-1-文件操作-最基础-每天用"><span>3.1 文件操作（最基础，每天用）</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># ───── 查看文件 ─────</span>
<span class="token function">ls</span> <span class="token parameter variable">-la</span>              <span class="token comment"># 列出所有文件（含隐藏文件），长格式</span>
<span class="token function">ls</span> <span class="token parameter variable">-lh</span>              <span class="token comment"># 人类可读的大小（K, M, G）</span>
<span class="token function">ls</span> <span class="token parameter variable">-lt</span>              <span class="token comment"># 按修改时间排序</span>

<span class="token function">cat</span> file.txt        <span class="token comment"># 显示全部内容（适合小文件）</span>
<span class="token function">less</span> file.txt       <span class="token comment"># 分页浏览（Space 翻页，q 退出，/ 搜索）</span>
<span class="token function">head</span> <span class="token parameter variable">-20</span> file.txt   <span class="token comment"># 看前 20 行</span>
<span class="token function">tail</span> <span class="token parameter variable">-f</span> app.log     <span class="token comment"># 实时追踪日志（Ctrl+C 退出）</span>

<span class="token comment"># ───── 创建/删除 ─────</span>
<span class="token function">mkdir</span> <span class="token parameter variable">-p</span> a/b/c      <span class="token comment"># 递归创建目录（即使 a, a/b 不存在也能创建）</span>
<span class="token function">touch</span> newfile.txt   <span class="token comment"># 创建空文件，或更新文件时间戳</span>
<span class="token function">rm</span> <span class="token parameter variable">-rf</span> dir/         <span class="token comment"># 递归强制删除（⚠️ 危险命令，用前确认）</span>
<span class="token function">rmdir</span> emptydir/     <span class="token comment"># 只能删空目录</span>

<span class="token comment"># ───── 复制/移动 ─────</span>
<span class="token function">cp</span> <span class="token builtin class-name">source</span> dest      <span class="token comment"># 复制文件</span>
<span class="token function">cp</span> <span class="token parameter variable">-r</span> src/ dest/    <span class="token comment"># 递归复制目录</span>
<span class="token function">mv</span> old new          <span class="token comment"># 移动/重命名（同一个命令）</span>

<span class="token comment"># ───── 查找文件 ─────</span>
<span class="token function">find</span> <span class="token builtin class-name">.</span> <span class="token parameter variable">-name</span> <span class="token string">&quot;*.log&quot;</span>            <span class="token comment"># 在当前目录下按名字找</span>
<span class="token function">find</span> /var/log <span class="token parameter variable">-mtime</span> <span class="token parameter variable">-1</span>        <span class="token comment"># 找最近 1 天内修改的文件</span>
<span class="token function">find</span> <span class="token builtin class-name">.</span> <span class="token parameter variable">-size</span> +100M              <span class="token comment"># 找大于 100MB 的文件</span>
<span class="token function">find</span> <span class="token builtin class-name">.</span> <span class="token parameter variable">-name</span> <span class="token string">&quot;*.tmp&quot;</span> <span class="token parameter variable">-delete</span>    <span class="token comment"># 找到并删除（⚠️ 先不加 -delete 确认一遍！）</span>

<span class="token comment"># locate 更快（需要先 updatedb 建索引），适合按名字快速查找</span>
<span class="token function">locate</span> nginx.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-2-文本处理-linux-最擅长的领域" tabindex="-1"><a class="header-anchor" href="#_3-2-文本处理-linux-最擅长的领域"><span>3.2 文本处理（Linux 最擅长的领域）</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># ───── 搜索文本 ─────</span>
<span class="token function">grep</span> <span class="token string">&quot;error&quot;</span> app.log                <span class="token comment"># 在文件中搜索包含 error 的行</span>
<span class="token function">grep</span> <span class="token parameter variable">-i</span> <span class="token string">&quot;error&quot;</span> app.log             <span class="token comment"># 忽略大小写</span>
<span class="token function">grep</span> <span class="token parameter variable">-v</span> <span class="token string">&quot;debug&quot;</span> app.log             <span class="token comment"># 反向：排除包含 debug 的行</span>
<span class="token function">grep</span> <span class="token parameter variable">-r</span> <span class="token string">&quot;TODO&quot;</span> ./src/               <span class="token comment"># 递归搜索目录</span>
<span class="token function">grep</span> <span class="token parameter variable">-c</span> <span class="token string">&quot;error&quot;</span> app.log             <span class="token comment"># 统计匹配行数</span>
<span class="token function">grep</span> <span class="token parameter variable">-A</span> <span class="token number">3</span> <span class="token string">&quot;error&quot;</span> app.log           <span class="token comment"># 显示匹配行及后 3 行（-B 前，-C 前后）</span>

<span class="token comment"># ───── 提取与转换 ─────</span>
<span class="token comment"># awk —— 列处理神器</span>
<span class="token function">awk</span> <span class="token string">&#39;{print $1, $3}&#39;</span> data.txt       <span class="token comment"># 打印第 1 和第 3 列</span>
<span class="token function">awk</span> -F<span class="token string">&#39;:&#39;</span> <span class="token string">&#39;{print $1}&#39;</span> /etc/passwd  <span class="token comment"># 以冒号为分隔符，打印第 1 列</span>
<span class="token function">awk</span> <span class="token string">&#39;$3 &gt; 1000&#39;</span> data.txt            <span class="token comment"># 第 3 列大于 1000 的行</span>

<span class="token comment"># sed —— 流编辑器，做替换</span>
<span class="token function">sed</span> <span class="token string">&#39;s/old/new/g&#39;</span> file.txt          <span class="token comment"># 替换（只输出不改文件）</span>
<span class="token function">sed</span> <span class="token parameter variable">-i</span> <span class="token string">&#39;s/old/new/g&#39;</span> file.txt       <span class="token comment"># 替换并写入文件（⚠️ 不可逆）</span>
<span class="token function">sed</span> <span class="token string">&#39;5,10d&#39;</span> file.txt                <span class="token comment"># 删除第 5 到 10 行（输出）</span>

<span class="token comment"># cut —— 简单切割</span>
<span class="token function">cut</span> -d<span class="token string">&#39;:&#39;</span> -f1,7 /etc/passwd         <span class="token comment"># 以:分隔，取第 1 和第 7 列</span>

<span class="token comment"># sort &amp; uniq —— 排序去重</span>
<span class="token function">sort</span> file.txt                       <span class="token comment"># 排序</span>
<span class="token function">sort</span> <span class="token parameter variable">-n</span>                             <span class="token comment"># 按数字排序</span>
<span class="token function">sort</span> <span class="token parameter variable">-rn</span>                            <span class="token comment"># 按数字倒序</span>
<span class="token function">uniq</span>                                <span class="token comment"># 去重（需要先 sort）</span>
<span class="token function">sort</span> file.txt <span class="token operator">|</span> <span class="token function">uniq</span> <span class="token parameter variable">-c</span>             <span class="token comment"># 去重并统计出现次数</span>
<span class="token function">sort</span> file.txt <span class="token operator">|</span> <span class="token function">uniq</span> <span class="token parameter variable">-c</span> <span class="token operator">|</span> <span class="token function">sort</span> <span class="token parameter variable">-rn</span>  <span class="token comment"># 按出现次数倒序排列</span>

<span class="token comment"># ───── 组合案例 ─────</span>
<span class="token comment"># 分析 Nginx 日志：找出访问量 Top 5 的接口</span>
<span class="token function">cat</span> access.log <span class="token operator">|</span> <span class="token function">awk</span> <span class="token string">&#39;{print $7}&#39;</span> <span class="token operator">|</span> <span class="token function">sort</span> <span class="token operator">|</span> <span class="token function">uniq</span> <span class="token parameter variable">-c</span> <span class="token operator">|</span> <span class="token function">sort</span> <span class="token parameter variable">-rn</span> <span class="token operator">|</span> <span class="token function">head</span> <span class="token parameter variable">-5</span>

<span class="token comment"># 批量替换多个文件中的字符串</span>
<span class="token function">find</span> <span class="token builtin class-name">.</span> <span class="token parameter variable">-name</span> <span class="token string">&quot;*.js&quot;</span> <span class="token parameter variable">-exec</span> <span class="token function">sed</span> <span class="token parameter variable">-i</span> <span class="token string">&#39;s/old_api/new_api/g&#39;</span> <span class="token punctuation">{</span><span class="token punctuation">}</span> <span class="token punctuation">\\</span><span class="token punctuation">;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-3-进程管理" tabindex="-1"><a class="header-anchor" href="#_3-3-进程管理"><span>3.3 进程管理</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># ───── 查看进程 ─────</span>
<span class="token function">ps</span> aux                  <span class="token comment"># 查看所有进程（BSD 风格）</span>
<span class="token function">ps</span> <span class="token parameter variable">-ef</span>                  <span class="token comment"># 查看所有进程（System V 风格）</span>
<span class="token function">ps</span> <span class="token parameter variable">-ef</span> <span class="token operator">|</span> <span class="token function">grep</span> nginx     <span class="token comment"># 查找特定进程</span>

<span class="token function">top</span>                     <span class="token comment"># 实时进程监控（按 q 退出）</span>
<span class="token function">htop</span>                    <span class="token comment"># top 的增强版（界面更友好，需安装）</span>

<span class="token comment"># ───── 进程树 ─────</span>
pstree <span class="token parameter variable">-p</span>               <span class="token comment"># 以树状图显示进程关系（带 PID）</span>

<span class="token comment"># ───── 终止进程 ─────</span>
<span class="token function">kill</span> <span class="token operator">&lt;</span>PID<span class="token operator">&gt;</span>              <span class="token comment"># 发送 TERM 信号（优雅终止，给进程清理的机会）</span>
<span class="token function">kill</span> <span class="token parameter variable">-9</span> <span class="token operator">&lt;</span>PID<span class="token operator">&gt;</span>           <span class="token comment"># 发送 KILL 信号（强制终止，不给任何机会）</span>
<span class="token function">kill</span> <span class="token parameter variable">-l</span>                 <span class="token comment"># 查看所有信号列表</span>

<span class="token function">pkill</span> <span class="token parameter variable">-f</span> <span class="token string">&quot;python app&quot;</span>   <span class="token comment"># 按进程名（含参数）终止</span>
<span class="token function">killall</span> nginx           <span class="token comment"># 终止所有同名进程</span>

<span class="token comment"># ───── 后台进程 ─────</span>
./myapp <span class="token operator">&amp;</span>               <span class="token comment"># 放到后台运行</span>
Ctrl+Z                  <span class="token comment"># 暂停当前前台任务</span>
<span class="token function">jobs</span>                    <span class="token comment"># 查看后台任务</span>
<span class="token function">bg</span> %1                   <span class="token comment"># 让任务 1 在后台继续运行</span>
<span class="token function">fg</span> %1                   <span class="token comment"># 把后台任务 1 拉回前台</span>

<span class="token function">nohup</span> ./myapp <span class="token operator">&amp;</span>         <span class="token comment"># 不挂断运行（关闭终端后继续跑）</span>
<span class="token function">nohup</span> ./myapp <span class="token operator">&gt;</span> app.log <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span><span class="token file-descriptor important">&amp;1</span> <span class="token operator">&amp;</span>  <span class="token comment"># 重定向所有输出</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>进程状态速查（ps aux 的 STAT 列）：</strong></p><table><thead><tr><th>状态</th><th>含义</th></tr></thead><tbody><tr><td><code>R</code></td><td>Running — 正在运行或可运行</td></tr><tr><td><code>S</code></td><td>Sleeping — 可中断的睡眠（等待事件）</td></tr><tr><td><code>D</code></td><td>Disk Sleep — 不可中断的睡眠（等待 I/O）</td></tr><tr><td><code>Z</code></td><td>Zombie — 僵尸进程（已结束，父进程未回收）</td></tr><tr><td><code>T</code></td><td>Stopped — 被暂停</td></tr><tr><td><code>&lt;</code></td><td>高优先级</td></tr><tr><td><code>N</code></td><td>低优先级</td></tr><tr><td><code>+</code></td><td>前台进程组</td></tr></tbody></table><h3 id="_3-4-权限管理" tabindex="-1"><a class="header-anchor" href="#_3-4-权限管理"><span>3.4 权限管理</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># ───── 理解权限 ─────</span>
<span class="token comment"># -rwxr-xr--  1  user  group  1024  Jun 22 10:00  file.txt</span>
<span class="token comment">#  └┬┘└─┬─┘└─┬─┘</span>
<span class="token comment">#  类型  │    └── 其他人的权限 (r-x = 读+执行)</span>
<span class="token comment">#       └── 组的权限 (r-x = 读+执行)</span>
<span class="token comment">#   所有者权限 (rwx = 读+写+执行)</span>

<span class="token comment"># r=4, w=2, x=1</span>
<span class="token comment"># rwx = 4+2+1 = 7</span>
<span class="token comment"># rw- = 4+2+0 = 6</span>
<span class="token comment"># r-x = 4+0+1 = 5</span>
<span class="token comment"># r-- = 4+0+0 = 4</span>

<span class="token comment"># ───── 修改权限 ─────</span>
<span class="token function">chmod</span> <span class="token number">755</span> script.sh     <span class="token comment"># rwxr-xr-x（所有者全权限，其他人读+执行）</span>
<span class="token function">chmod</span> <span class="token number">600</span> secret.key    <span class="token comment"># rw-------（只有所有者能读写）</span>
<span class="token function">chmod</span> +x script.sh      <span class="token comment"># 给所有人添加执行权限</span>
<span class="token function">chmod</span> u+x script.sh     <span class="token comment"># 只给所有者(u)添加执行权限</span>

<span class="token comment"># ───── 修改所有者 ─────</span>
<span class="token function">chown</span> user:group file.txt   <span class="token comment"># 同时改所有者和组</span>
<span class="token function">chown</span> <span class="token parameter variable">-R</span> user:group dir/    <span class="token comment"># 递归修改整个目录</span>

<span class="token comment"># ───── 特殊权限 ─────</span>
<span class="token comment"># SUID (4xxx)：以文件所有者的身份执行</span>
<span class="token function">chmod</span> <span class="token number">4755</span> /usr/bin/passwd   <span class="token comment"># passwd 需要 root 权限修改 /etc/shadow</span>

<span class="token comment"># SGID (2xxx)：以目录所属组的身份执行/创建文件</span>
<span class="token function">chmod</span> <span class="token number">2775</span> shared_dir/

<span class="token comment"># Sticky Bit (1xxx)：只有文件所有者能删除（如 /tmp）</span>
<span class="token function">chmod</span> <span class="token number">1777</span> /tmp
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-5-磁盘与存储" tabindex="-1"><a class="header-anchor" href="#_3-5-磁盘与存储"><span>3.5 磁盘与存储</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># ───── 查看磁盘 ─────</span>
<span class="token function">df</span> <span class="token parameter variable">-h</span>                   <span class="token comment"># 查看各分区使用情况（-h 人类可读）</span>
<span class="token function">df</span> <span class="token parameter variable">-i</span>                   <span class="token comment"># 查看 inode 使用情况</span>

<span class="token function">du</span> <span class="token parameter variable">-sh</span> /var/log         <span class="token comment"># 查看目录总大小</span>
<span class="token function">du</span> <span class="token parameter variable">-sh</span> * <span class="token operator">|</span> <span class="token function">sort</span> <span class="token parameter variable">-rh</span>     <span class="token comment"># 当前目录下各文件/目录大小排序</span>

lsblk                   <span class="token comment"># 列出所有块设备（硬盘、分区）</span>
<span class="token function">fdisk</span> <span class="token parameter variable">-l</span>                <span class="token comment"># 查看磁盘分区表</span>

<span class="token comment"># ───── 挂载 ─────</span>
<span class="token function">mount</span> /dev/sdb1 /mnt/data   <span class="token comment"># 挂载分区</span>
<span class="token function">umount</span> /mnt/data            <span class="token comment"># 卸载</span>
<span class="token function">df</span> <span class="token parameter variable">-h</span>                       <span class="token comment"># 确认挂载状态</span>

<span class="token comment"># ───── 自动挂载 ─────</span>
<span class="token comment"># 编辑 /etc/fstab，添加：</span>
<span class="token comment"># /dev/sdb1  /mnt/data  ext4  defaults  0  2</span>
<span class="token comment">#  设备       挂载点    文件系统  选项    dump  fsck顺序</span>

<span class="token function">mount</span> <span class="token parameter variable">-a</span>                <span class="token comment"># 测试 fstab 配置（不重启）</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-6-网络操作" tabindex="-1"><a class="header-anchor" href="#_3-6-网络操作"><span>3.6 网络操作</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># ───── 查看网络 ─────</span>
<span class="token function">ip</span> addr                 <span class="token comment"># 查看 IP 地址（现代方式）</span>
<span class="token function">ifconfig</span>                <span class="token comment"># 查看网络接口（传统方式，部分发行版需安装）</span>
<span class="token function">ip</span> route                <span class="token comment"># 查看路由表</span>

ss <span class="token parameter variable">-tlnp</span>                <span class="token comment"># 查看监听的 TCP 端口（比 netstat 更快）</span>
ss <span class="token parameter variable">-tlnp</span> <span class="token operator">|</span> <span class="token function">grep</span> :80     <span class="token comment"># 查看 80 端口被谁占用</span>

<span class="token comment"># ───── 网络诊断 ─────</span>
<span class="token function">ping</span> <span class="token parameter variable">-c</span> <span class="token number">4</span> google.com        <span class="token comment"># 测试连通性（发 4 个包）</span>
<span class="token function">traceroute</span> google.com       <span class="token comment"># 追踪路由路径</span>
<span class="token function">nslookup</span> example.com        <span class="token comment"># DNS 查询</span>
<span class="token function">dig</span> example.com             <span class="token comment"># DNS 详细查询（比 nslookup 更强）</span>

<span class="token function">curl</span> <span class="token parameter variable">-I</span> https://example.com     <span class="token comment"># 获取 HTTP 头</span>
<span class="token function">curl</span> <span class="token parameter variable">-X</span> POST <span class="token parameter variable">-d</span> <span class="token string">&quot;key=val&quot;</span> https://httpbin.org/post  <span class="token comment"># POST 请求</span>

<span class="token function">wget</span> https://example.com/file.tar.gz   <span class="token comment"># 下载文件</span>

<span class="token comment"># ───── 防火墙 (ufw 简化版) ─────</span>
ufw status                  <span class="token comment"># 查看状态</span>
ufw allow <span class="token number">80</span>/tcp            <span class="token comment"># 开放 80 端口</span>
ufw allow from <span class="token number">192.168</span>.1.0/24  <span class="token comment"># 允许某网段</span>
ufw <span class="token builtin class-name">enable</span>                  <span class="token comment"># 启用防火墙</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-7-用户与组管理" tabindex="-1"><a class="header-anchor" href="#_3-7-用户与组管理"><span>3.7 用户与组管理</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># ───── 用户 ─────</span>
<span class="token function">whoami</span>                      <span class="token comment"># 我是谁</span>
<span class="token function">id</span>                          <span class="token comment"># 我的 UID、GID、所属组</span>
<span class="token function">who</span>                         <span class="token comment"># 当前登录的所有用户</span>
w                           <span class="token comment"># 更详细：谁在登录，在干什么</span>

<span class="token function">useradd</span> <span class="token parameter variable">-m</span> <span class="token parameter variable">-s</span> /bin/bash newuser     <span class="token comment"># 创建用户（-m 创建家目录，-s 指定 shell）</span>
<span class="token function">passwd</span> newuser                       <span class="token comment"># 设置密码</span>
<span class="token function">usermod</span> <span class="token parameter variable">-aG</span> <span class="token function">docker</span> newuser           <span class="token comment"># 把用户加到 docker 组（-a 追加，别漏！）</span>
<span class="token function">userdel</span> <span class="token parameter variable">-r</span> newuser                   <span class="token comment"># 删除用户（-r 同时删除家目录）</span>

<span class="token comment"># ───── 切换用户 ─────</span>
<span class="token function">su</span> - otheruser              <span class="token comment"># 切换到 otheruser（- 表示加载其完整环境）</span>
<span class="token function">sudo</span> <span class="token builtin class-name">command</span>                <span class="token comment"># 以 root 身份执行一条命令</span>
<span class="token function">sudo</span> <span class="token parameter variable">-i</span>                     <span class="token comment"># 切换到 root 用户的交互式 shell</span>
visudo                      <span class="token comment"># 安全编辑 /etc/sudoers（别直接用 vim 编辑！）</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_3-8-包管理" tabindex="-1"><a class="header-anchor" href="#_3-8-包管理"><span>3.8 包管理</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># ───── Debian/Ubuntu (apt) ─────</span>
<span class="token function">apt</span> update                  <span class="token comment"># 更新软件包索引</span>
<span class="token function">apt</span> upgrade                 <span class="token comment"># 升级所有已安装的包</span>
<span class="token function">apt</span> <span class="token function">install</span> nginx           <span class="token comment"># 安装</span>
<span class="token function">apt</span> remove nginx            <span class="token comment"># 卸载（保留配置文件）</span>
<span class="token function">apt</span> purge nginx             <span class="token comment"># 彻底卸载（含配置文件）</span>
<span class="token function">apt</span> search keyword          <span class="token comment"># 搜索软件包</span>
<span class="token function">apt</span> show nginx              <span class="token comment"># 查看软件包详情</span>

<span class="token comment"># ───── RHEL/CentOS/Fedora (dnf/yum) ─────</span>
dnf <span class="token function">install</span> nginx           <span class="token comment"># 安装</span>
dnf update                  <span class="token comment"># 更新所有</span>
dnf remove nginx            <span class="token comment"># 卸载</span>
dnf search keyword          <span class="token comment"># 搜索</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="四、管道与重定向-——-linux-的-乐高积木" tabindex="-1"><a class="header-anchor" href="#四、管道与重定向-——-linux-的-乐高积木"><span>四、管道与重定向 —— Linux 的&quot;乐高积木&quot;</span></a></h2><h3 id="_4-1-三大数据流" tabindex="-1"><a class="header-anchor" href="#_4-1-三大数据流"><span>4.1 三大数据流</span></a></h3><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>         ┌─────────┐
stdin ──►│         │──► stdout (fd=1)  —— 正常输出
  (fd=0) │ 程序    │──► stderr (fd=2)  —— 错误输出
         └─────────┘
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># ───── 输出重定向 ─────</span>
<span class="token builtin class-name">command</span> <span class="token operator">&gt;</span> file.txt          <span class="token comment"># stdout 写入文件（覆盖）</span>
<span class="token builtin class-name">command</span> <span class="token operator">&gt;&gt;</span> file.txt         <span class="token comment"># stdout 追加到文件</span>

<span class="token comment"># ───── 错误重定向 ─────</span>
<span class="token builtin class-name">command</span> <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span> error.log        <span class="token comment"># stderr 写入文件</span>
<span class="token builtin class-name">command</span> <span class="token operator"><span class="token file-descriptor important">2</span>&gt;&gt;</span> error.log       <span class="token comment"># stderr 追加到文件</span>

<span class="token comment"># ───── 合并重定向 ─────</span>
<span class="token builtin class-name">command</span> <span class="token operator">&gt;</span> all.log <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span><span class="token file-descriptor important">&amp;1</span>      <span class="token comment"># stdout 和 stderr 都写入同一个文件</span>
<span class="token builtin class-name">command</span> <span class="token operator">&amp;&gt;</span> all.log          <span class="token comment"># 同上（bash 简写）</span>
<span class="token builtin class-name">command</span> <span class="token operator">&gt;&gt;</span> all.log <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span><span class="token file-descriptor important">&amp;1</span>     <span class="token comment"># 追加模式</span>

<span class="token comment"># ───── 输入重定向 ─────</span>
<span class="token builtin class-name">command</span> <span class="token operator">&lt;</span> input.txt         <span class="token comment"># 从文件读取 stdin</span>
mysql <span class="token parameter variable">-u</span> root <span class="token operator">&lt;</span> backup.sql  <span class="token comment"># 导入 SQL 文件</span>

<span class="token comment"># ───── 黑洞 ─────</span>
<span class="token builtin class-name">command</span> <span class="token operator">&gt;</span> /dev/null <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span><span class="token file-descriptor important">&amp;1</span>    <span class="token comment"># 丢弃所有输出（不想看任何东西时用）</span>

<span class="token comment"># ───── Here Document（多行输入） ─────</span>
<span class="token function">cat</span> <span class="token operator">&lt;&lt;</span> <span class="token string">EOF<span class="token bash punctuation"> <span class="token operator">&gt;</span> config.yaml</span>
server:
  host: 0.0.0.0
  port: 8080
EOF</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_4-2-管道——组合的力量" tabindex="-1"><a class="header-anchor" href="#_4-2-管道——组合的力量"><span>4.2 管道——组合的力量</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 管道 | 把左边命令的 stdout 连接到右边命令的 stdin</span>

<span class="token comment"># Demo：一行命令搞定&quot;找出占用磁盘最多的 5 个目录&quot;</span>
<span class="token function">du</span> <span class="token parameter variable">-sh</span> /* <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span>/dev/null <span class="token operator">|</span> <span class="token function">sort</span> <span class="token parameter variable">-rh</span> <span class="token operator">|</span> <span class="token function">head</span> <span class="token parameter variable">-5</span>

<span class="token comment"># Demo：查看某个进程打开的文件数</span>
<span class="token function">ls</span> <span class="token parameter variable">-l</span> /proc/<span class="token variable"><span class="token variable">$(</span>pgrep nginx <span class="token operator">|</span> <span class="token function">head</span> <span class="token parameter variable">-1</span><span class="token variable">)</span></span>/fd <span class="token operator">|</span> <span class="token function">wc</span> <span class="token parameter variable">-l</span>

<span class="token comment"># Demo：批量杀掉所有包含&quot;stale&quot;的进程</span>
<span class="token function">ps</span> aux <span class="token operator">|</span> <span class="token function">grep</span> stale <span class="token operator">|</span> <span class="token function">awk</span> <span class="token string">&#39;{print $2}&#39;</span> <span class="token operator">|</span> <span class="token function">xargs</span> <span class="token function">kill</span> <span class="token parameter variable">-9</span>
<span class="token comment">#                                                    ↑</span>
<span class="token comment">#                        xargs：把 stdin 转成命令行参数</span>
<span class="token comment">#                        因为 kill 不接受管道输入，需要 xargs 中转</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="五、shell-脚本入门-——-把重复变成自动化" tabindex="-1"><a class="header-anchor" href="#五、shell-脚本入门-——-把重复变成自动化"><span>五、Shell 脚本入门 —— 把重复变成自动化</span></a></h2><h3 id="_5-1-基本骨架" tabindex="-1"><a class="header-anchor" href="#_5-1-基本骨架"><span>5.1 基本骨架</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token shebang important">#!/bin/bash</span>
<span class="token comment"># ↑ shebang，告诉系统用哪个解释器执行这个脚本</span>

<span class="token builtin class-name">set</span> <span class="token parameter variable">-e</span>          <span class="token comment"># 任何命令失败就退出（推荐！防止错误累积）</span>
<span class="token builtin class-name">set</span> <span class="token parameter variable">-u</span>          <span class="token comment"># 使用未定义变量就报错</span>
<span class="token builtin class-name">set</span> <span class="token parameter variable">-o</span> pipefail <span class="token comment"># 管道中任何命令失败都算失败</span>

<span class="token comment"># 变量</span>
<span class="token assign-left variable">NAME</span><span class="token operator">=</span><span class="token string">&quot;world&quot;</span>
<span class="token builtin class-name">readonly</span> <span class="token assign-left variable">CONST</span><span class="token operator">=</span><span class="token string">&quot;不可改&quot;</span>    <span class="token comment"># 只读变量</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;Hello, <span class="token variable">\${NAME}</span>&quot;</span>      <span class="token comment"># \${} 是好习惯，防止歧义</span>

<span class="token comment"># 特殊变量</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;脚本名: <span class="token variable">$0</span>&quot;</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;第1个参数: <span class="token variable">$1</span>&quot;</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;参数个数: <span class="token variable">$#</span>&quot;</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;所有参数: <span class="token variable">$@</span>&quot;</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;上条命令退出码: <span class="token variable">$?</span>&quot;</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;当前进程 PID: <span class="token variable">$$</span>&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-2-条件判断" tabindex="-1"><a class="header-anchor" href="#_5-2-条件判断"><span>5.2 条件判断</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># ───── if 语句 ─────</span>
<span class="token keyword">if</span> <span class="token punctuation">[</span> <span class="token string">&quot;<span class="token variable">$1</span>&quot;</span> <span class="token operator">=</span> <span class="token string">&quot;start&quot;</span> <span class="token punctuation">]</span><span class="token punctuation">;</span> <span class="token keyword">then</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Starting...&quot;</span>
<span class="token keyword">elif</span> <span class="token punctuation">[</span> <span class="token string">&quot;<span class="token variable">$1</span>&quot;</span> <span class="token operator">=</span> <span class="token string">&quot;stop&quot;</span> <span class="token punctuation">]</span><span class="token punctuation">;</span> <span class="token keyword">then</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Stopping...&quot;</span>
<span class="token keyword">else</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Usage: <span class="token variable">$0</span> {start|stop}&quot;</span>
    <span class="token builtin class-name">exit</span> <span class="token number">1</span>
<span class="token keyword">fi</span>

<span class="token comment"># ───── 常用判断条件 ─────</span>
<span class="token punctuation">[</span> <span class="token parameter variable">-f</span> file.txt <span class="token punctuation">]</span>     <span class="token comment"># 文件存在且是普通文件</span>
<span class="token punctuation">[</span> <span class="token parameter variable">-d</span> /etc <span class="token punctuation">]</span>         <span class="token comment"># 目录存在</span>
<span class="token punctuation">[</span> <span class="token parameter variable">-x</span> script.sh <span class="token punctuation">]</span>    <span class="token comment"># 文件存在且可执行</span>
<span class="token punctuation">[</span> <span class="token parameter variable">-z</span> <span class="token string">&quot;<span class="token variable">$VAR</span>&quot;</span> <span class="token punctuation">]</span>       <span class="token comment"># 字符串为空</span>
<span class="token punctuation">[</span> <span class="token parameter variable">-n</span> <span class="token string">&quot;<span class="token variable">$VAR</span>&quot;</span> <span class="token punctuation">]</span>       <span class="token comment"># 字符串非空</span>
<span class="token punctuation">[</span> <span class="token string">&quot;<span class="token variable">$A</span>&quot;</span> <span class="token operator">=</span> <span class="token string">&quot;<span class="token variable">$B</span>&quot;</span> <span class="token punctuation">]</span>     <span class="token comment"># 字符串相等</span>
<span class="token punctuation">[</span> <span class="token string">&quot;<span class="token variable">$A</span>&quot;</span> <span class="token operator">!=</span> <span class="token string">&quot;<span class="token variable">$B</span>&quot;</span> <span class="token punctuation">]</span>    <span class="token comment"># 字符串不等</span>
<span class="token punctuation">[</span> <span class="token variable">$NUM</span> <span class="token parameter variable">-gt</span> <span class="token number">10</span> <span class="token punctuation">]</span>     <span class="token comment"># 数字大于 (greater than)</span>
<span class="token punctuation">[</span> <span class="token variable">$NUM</span> <span class="token parameter variable">-lt</span> <span class="token number">10</span> <span class="token punctuation">]</span>     <span class="token comment"># 数字小于 (less than)</span>
<span class="token punctuation">[</span> <span class="token variable">$NUM</span> <span class="token parameter variable">-eq</span> <span class="token number">10</span> <span class="token punctuation">]</span>     <span class="token comment"># 数字等于 (equal)</span>

<span class="token comment"># ───── 现代写法 [[ ]] 更安全 ─────</span>
<span class="token keyword">if</span> <span class="token punctuation">[</span><span class="token punctuation">[</span> <span class="token string">&quot;<span class="token variable">$1</span>&quot;</span> <span class="token operator">=~</span> ^<span class="token punctuation">[</span><span class="token number">0</span>-9<span class="token punctuation">]</span>+$ <span class="token punctuation">]</span><span class="token punctuation">]</span><span class="token punctuation">;</span> <span class="token keyword">then</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;参数是纯数字&quot;</span>
<span class="token keyword">fi</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-3-循环" tabindex="-1"><a class="header-anchor" href="#_5-3-循环"><span>5.3 循环</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># ───── for 循环 ─────</span>
<span class="token keyword">for</span> <span class="token for-or-select variable">i</span> <span class="token keyword">in</span> <span class="token punctuation">{</span><span class="token number">1</span><span class="token punctuation">..</span><span class="token number">5</span><span class="token punctuation">}</span><span class="token punctuation">;</span> <span class="token keyword">do</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;第 <span class="token variable">$i</span> 次&quot;</span>
<span class="token keyword">done</span>

<span class="token keyword">for</span> <span class="token for-or-select variable">file</span> <span class="token keyword">in</span> *.log<span class="token punctuation">;</span> <span class="token keyword">do</span>
    <span class="token function">gzip</span> <span class="token string">&quot;<span class="token variable">$file</span>&quot;</span>
<span class="token keyword">done</span>

<span class="token comment"># ───── while 循环 ─────</span>
<span class="token assign-left variable">COUNT</span><span class="token operator">=</span><span class="token number">0</span>
<span class="token keyword">while</span> <span class="token punctuation">[</span> <span class="token variable">$COUNT</span> <span class="token parameter variable">-lt</span> <span class="token number">5</span> <span class="token punctuation">]</span><span class="token punctuation">;</span> <span class="token keyword">do</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Count: <span class="token variable">$COUNT</span>&quot;</span>
    <span class="token assign-left variable">COUNT</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$((</span>COUNT <span class="token operator">+</span> <span class="token number">1</span><span class="token variable">))</span></span>
<span class="token keyword">done</span>

<span class="token comment"># ───── 读取文件每一行 ─────</span>
<span class="token keyword">while</span> <span class="token assign-left variable"><span class="token environment constant">IFS</span></span><span class="token operator">=</span> <span class="token builtin class-name">read</span> <span class="token parameter variable">-r</span> line<span class="token punctuation">;</span> <span class="token keyword">do</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;行内容: <span class="token variable">$line</span>&quot;</span>
<span class="token keyword">done</span> <span class="token operator">&lt;</span> file.txt
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-4-函数" tabindex="-1"><a class="header-anchor" href="#_5-4-函数"><span>5.4 函数</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 定义函数</span>
<span class="token function-name function">log</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token builtin class-name">local</span> <span class="token assign-left variable">level</span><span class="token operator">=</span><span class="token string">&quot;<span class="token variable">$1</span>&quot;</span>      <span class="token comment"># local 限制作用域（好习惯！）</span>
    <span class="token builtin class-name">local</span> <span class="token assign-left variable">msg</span><span class="token operator">=</span><span class="token string">&quot;<span class="token variable">$2</span>&quot;</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;[<span class="token variable"><span class="token variable">$(</span><span class="token function">date</span> <span class="token string">&#39;+%Y-%m-%d %H:%M:%S&#39;</span><span class="token variable">)</span></span>] [<span class="token variable">$level</span>] <span class="token variable">$msg</span>&quot;</span>
<span class="token punctuation">}</span>

<span class="token comment"># 调用</span>
log <span class="token string">&quot;INFO&quot;</span> <span class="token string">&quot;服务启动成功&quot;</span>
log <span class="token string">&quot;ERROR&quot;</span> <span class="token string">&quot;数据库连接失败&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_5-5-实用脚本示例" tabindex="-1"><a class="header-anchor" href="#_5-5-实用脚本示例"><span>5.5 实用脚本示例</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token shebang important">#!/bin/bash</span>
<span class="token comment"># deploy.sh —— 一个简易的部署脚本</span>

<span class="token builtin class-name">set</span> <span class="token parameter variable">-e</span>

<span class="token assign-left variable">APP_NAME</span><span class="token operator">=</span><span class="token string">&quot;myapp&quot;</span>
<span class="token assign-left variable">DEPLOY_DIR</span><span class="token operator">=</span><span class="token string">&quot;/opt/<span class="token variable">$APP_NAME</span>&quot;</span>
<span class="token assign-left variable">BACKUP_DIR</span><span class="token operator">=</span><span class="token string">&quot;/opt/backups/<span class="token variable">$APP_NAME</span>&quot;</span>
<span class="token assign-left variable">TIMESTAMP</span><span class="token operator">=</span><span class="token variable"><span class="token variable">$(</span><span class="token function">date</span> +%Y%m%d_%H%M%S<span class="token variable">)</span></span>

<span class="token comment"># 彩色输出</span>
<span class="token assign-left variable">GREEN</span><span class="token operator">=</span><span class="token string">&#39;\\033[0;32m&#39;</span>
<span class="token assign-left variable">RED</span><span class="token operator">=</span><span class="token string">&#39;\\033[0;31m&#39;</span>
<span class="token assign-left variable">NC</span><span class="token operator">=</span><span class="token string">&#39;\\033[0m&#39;</span> <span class="token comment"># No Color</span>

<span class="token function-name function">log_info</span><span class="token punctuation">(</span><span class="token punctuation">)</span>  <span class="token punctuation">{</span> <span class="token builtin class-name">echo</span> <span class="token parameter variable">-e</span> <span class="token string">&quot;<span class="token variable">\${GREEN}</span>[INFO]<span class="token variable">\${NC}</span> <span class="token variable">$1</span>&quot;</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>
<span class="token function-name function">log_error</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span> <span class="token builtin class-name">echo</span> <span class="token parameter variable">-e</span> <span class="token string">&quot;<span class="token variable">\${RED}</span>[ERROR]<span class="token variable">\${NC}</span> <span class="token variable">$1</span>&quot;</span> <span class="token operator">&gt;</span><span class="token file-descriptor important">&amp;2</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>

<span class="token comment"># 检查是否在项目根目录</span>
<span class="token keyword">if</span> <span class="token punctuation">[</span> <span class="token operator">!</span> <span class="token parameter variable">-f</span> <span class="token string">&quot;package.json&quot;</span> <span class="token punctuation">]</span><span class="token punctuation">;</span> <span class="token keyword">then</span>
    log_error <span class="token string">&quot;请在项目根目录执行此脚本&quot;</span>
    <span class="token builtin class-name">exit</span> <span class="token number">1</span>
<span class="token keyword">fi</span>

<span class="token comment"># 备份当前版本</span>
<span class="token keyword">if</span> <span class="token punctuation">[</span> <span class="token parameter variable">-d</span> <span class="token string">&quot;<span class="token variable">$DEPLOY_DIR</span>&quot;</span> <span class="token punctuation">]</span><span class="token punctuation">;</span> <span class="token keyword">then</span>
    log_info <span class="token string">&quot;备份当前版本...&quot;</span>
    <span class="token function">mkdir</span> <span class="token parameter variable">-p</span> <span class="token string">&quot;<span class="token variable">$BACKUP_DIR</span>&quot;</span>
    <span class="token function">cp</span> <span class="token parameter variable">-r</span> <span class="token string">&quot;<span class="token variable">$DEPLOY_DIR</span>&quot;</span> <span class="token string">&quot;<span class="token variable">$BACKUP_DIR</span>/<span class="token variable">$TIMESTAMP</span>&quot;</span>
<span class="token keyword">fi</span>

<span class="token comment"># 安装依赖 &amp; 构建</span>
log_info <span class="token string">&quot;安装依赖...&quot;</span>
<span class="token function">npm</span> ci <span class="token parameter variable">--production</span>

log_info <span class="token string">&quot;构建项目...&quot;</span>
<span class="token function">npm</span> run build

<span class="token comment"># 部署</span>
log_info <span class="token string">&quot;部署到 <span class="token variable">$DEPLOY_DIR</span>...&quot;</span>
<span class="token function">mkdir</span> <span class="token parameter variable">-p</span> <span class="token string">&quot;<span class="token variable">$DEPLOY_DIR</span>&quot;</span>
<span class="token function">cp</span> <span class="token parameter variable">-r</span> dist/* <span class="token string">&quot;<span class="token variable">$DEPLOY_DIR</span>/&quot;</span>

<span class="token comment"># 重启服务</span>
log_info <span class="token string">&quot;重启服务...&quot;</span>
<span class="token function">sudo</span> systemctl restart <span class="token string">&quot;<span class="token variable">$APP_NAME</span>&quot;</span>

<span class="token comment"># 健康检查</span>
<span class="token function">sleep</span> <span class="token number">3</span>
<span class="token keyword">if</span> <span class="token function">curl</span> <span class="token parameter variable">-sf</span> http://localhost:3000/health <span class="token operator">&gt;</span> /dev/null<span class="token punctuation">;</span> <span class="token keyword">then</span>
    log_info <span class="token string">&quot;✅ 部署成功！&quot;</span>
<span class="token keyword">else</span>
    log_error <span class="token string">&quot;❌ 健康检查失败，正在回滚...&quot;</span>
    <span class="token function">rm</span> <span class="token parameter variable">-rf</span> <span class="token string">&quot;<span class="token variable">$DEPLOY_DIR</span>&quot;</span>
    <span class="token function">cp</span> <span class="token parameter variable">-r</span> <span class="token string">&quot;<span class="token variable">$BACKUP_DIR</span>/<span class="token variable">$TIMESTAMP</span>&quot;</span> <span class="token string">&quot;<span class="token variable">$DEPLOY_DIR</span>&quot;</span>
    <span class="token function">sudo</span> systemctl restart <span class="token string">&quot;<span class="token variable">$APP_NAME</span>&quot;</span>
    log_info <span class="token string">&quot;已回滚到上一个版本&quot;</span>
    <span class="token builtin class-name">exit</span> <span class="token number">1</span>
<span class="token keyword">fi</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="六、systemd-服务管理-——-让你的程序开机自启" tabindex="-1"><a class="header-anchor" href="#六、systemd-服务管理-——-让你的程序开机自启"><span>六、Systemd 服务管理 —— 让你的程序开机自启</span></a></h2><h3 id="_6-1-编写-service-文件" tabindex="-1"><a class="header-anchor" href="#_6-1-编写-service-文件"><span>6.1 编写 Service 文件</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 创建服务文件</span>
<span class="token function">sudo</span> <span class="token function">vim</span> /etc/systemd/system/myapp.service
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-ini line-numbers-mode" data-ext="ini" data-title="ini"><pre class="language-ini"><code><span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Unit</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">Description</span><span class="token punctuation">=</span><span class="token value attr-value">My Application</span>
<span class="token key attr-name">After</span><span class="token punctuation">=</span><span class="token value attr-value">network.target          # 在网络启动后再启动</span>
<span class="token comment"># After=mysql.service         # 也可以等数据库先启动</span>

<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Service</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">Type</span><span class="token punctuation">=</span><span class="token value attr-value">simple                   # simple | forking | oneshot</span>
<span class="token key attr-name">User</span><span class="token punctuation">=</span><span class="token value attr-value">www-data                 # 以哪个用户运行</span>
<span class="token key attr-name">Group</span><span class="token punctuation">=</span><span class="token value attr-value">www-data</span>
<span class="token key attr-name">WorkingDirectory</span><span class="token punctuation">=</span><span class="token value attr-value">/opt/myapp</span>
<span class="token key attr-name">ExecStart</span><span class="token punctuation">=</span><span class="token value attr-value">/usr/bin/node /opt/myapp/index.js</span>
<span class="token key attr-name">ExecStop</span><span class="token punctuation">=</span><span class="token value attr-value">/bin/kill -TERM $MAINPID</span>
<span class="token key attr-name">Restart</span><span class="token punctuation">=</span><span class="token value attr-value">on-failure            # 失败后自动重启</span>
<span class="token key attr-name">RestartSec</span><span class="token punctuation">=</span><span class="token value attr-value">5                  # 重启间隔 5 秒</span>
<span class="token key attr-name">Environment</span><span class="token punctuation">=</span><span class="token value attr-value">NODE_ENV=production</span>
<span class="token key attr-name">EnvironmentFile</span><span class="token punctuation">=</span><span class="token value attr-value">-/etc/myapp/env  # - 表示文件不存在也不报错</span>

<span class="token comment"># 日志</span>
<span class="token key attr-name">StandardOutput</span><span class="token punctuation">=</span><span class="token value attr-value">journal</span>
<span class="token key attr-name">StandardError</span><span class="token punctuation">=</span><span class="token value attr-value">journal</span>
<span class="token key attr-name">SyslogIdentifier</span><span class="token punctuation">=</span><span class="token value attr-value">myapp</span>

<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">Install</span><span class="token punctuation">]</span></span>
<span class="token key attr-name">WantedBy</span><span class="token punctuation">=</span><span class="token value attr-value">multi-user.target    # 多用户模式下启动</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 重载配置 &amp; 启动</span>
<span class="token function">sudo</span> systemctl daemon-reload      <span class="token comment"># 每次修改 service 文件后都要执行</span>
<span class="token function">sudo</span> systemctl <span class="token builtin class-name">enable</span> myapp       <span class="token comment"># 开机自启</span>
<span class="token function">sudo</span> systemctl start myapp        <span class="token comment"># 启动</span>
<span class="token function">sudo</span> systemctl status myapp       <span class="token comment"># 查看状态</span>
<span class="token function">sudo</span> systemctl stop myapp         <span class="token comment"># 停止</span>
<span class="token function">sudo</span> systemctl restart myapp      <span class="token comment"># 重启</span>

<span class="token comment"># 查看日志</span>
journalctl <span class="token parameter variable">-u</span> myapp <span class="token parameter variable">-f</span>            <span class="token comment"># 实时查看日志</span>
journalctl <span class="token parameter variable">-u</span> myapp <span class="token parameter variable">--since</span> today <span class="token comment"># 今天的日志</span>
journalctl <span class="token parameter variable">-u</span> myapp <span class="token parameter variable">-n</span> <span class="token number">50</span>         <span class="token comment"># 最近 50 行</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="七、高效工作技巧" tabindex="-1"><a class="header-anchor" href="#七、高效工作技巧"><span>七、高效工作技巧</span></a></h2><h3 id="_7-1-命令行历史" tabindex="-1"><a class="header-anchor" href="#_7-1-命令行历史"><span>7.1 命令行历史</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">history</span>                 <span class="token comment"># 查看命令历史</span>
<span class="token operator">!</span><span class="token number">123</span>                    <span class="token comment"># 执行历史中第 123 条命令</span>
<span class="token operator">!</span><span class="token operator">!</span>                      <span class="token comment"># 执行上一条命令</span>
<span class="token operator">!</span>$                      <span class="token comment"># 引用上一条命令的最后一个参数</span>
<span class="token function">sudo</span> <span class="token operator">!</span><span class="token operator">!</span>                 <span class="token comment"># 用 sudo 重新执行上一条命令（忘了 sudo 时超有用）</span>
Ctrl+R                  <span class="token comment"># 反向搜索命令历史（最常用！）</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-2-别名" tabindex="-1"><a class="header-anchor" href="#_7-2-别名"><span>7.2 别名</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看已有别名</span>
<span class="token builtin class-name">alias</span>

<span class="token comment"># 设置别名</span>
<span class="token builtin class-name">alias</span> <span class="token assign-left variable">ll</span><span class="token operator">=</span><span class="token string">&#39;ls -alF&#39;</span>
<span class="token builtin class-name">alias</span> <span class="token assign-left variable">gs</span><span class="token operator">=</span><span class="token string">&#39;git status&#39;</span>
<span class="token builtin class-name">alias</span> <span class="token assign-left variable">gp</span><span class="token operator">=</span><span class="token string">&#39;git pull&#39;</span>
<span class="token builtin class-name">alias</span> <span class="token assign-left variable">k</span><span class="token operator">=</span><span class="token string">&#39;kubectl&#39;</span>

<span class="token comment"># 永久生效：写入 ~/.bashrc 或 ~/.bash_aliases</span>
<span class="token builtin class-name">echo</span> <span class="token string">&quot;alias ll=&#39;ls -alF&#39;&quot;</span> <span class="token operator">&gt;&gt;</span> ~/.bashrc
<span class="token builtin class-name">source</span> ~/.bashrc
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-3-环境变量" tabindex="-1"><a class="header-anchor" href="#_7-3-环境变量"><span>7.3 环境变量</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 查看</span>
<span class="token function">env</span>                     <span class="token comment"># 查看所有环境变量</span>
<span class="token builtin class-name">echo</span> <span class="token environment constant">$PATH</span>              <span class="token comment"># 查看 PATH</span>

<span class="token comment"># 临时设置（仅当前 shell）</span>
<span class="token builtin class-name">export</span> <span class="token assign-left variable">MY_VAR</span><span class="token operator">=</span><span class="token string">&quot;hello&quot;</span>
<span class="token builtin class-name">export</span> <span class="token assign-left variable"><span class="token environment constant">PATH</span></span><span class="token operator">=</span><span class="token string">&quot;<span class="token environment constant">$HOME</span>/bin:<span class="token environment constant">$PATH</span>&quot;</span>

<span class="token comment"># 永久设置：写入 ~/.bashrc 或 ~/.profile</span>
<span class="token builtin class-name">echo</span> <span class="token string">&#39;export JAVA_HOME=/usr/lib/jvm/java-17&#39;</span> <span class="token operator">&gt;&gt;</span> ~/.bashrc
<span class="token builtin class-name">source</span> ~/.bashrc
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_7-4-vim-速成-够用就行" tabindex="-1"><a class="header-anchor" href="#_7-4-vim-速成-够用就行"><span>7.4 Vim 速成（够用就行）</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 模式切换</span>
i           <span class="token comment"># 进入插入模式（编辑）</span>
Esc         <span class="token comment"># 退回命令模式</span>
:w          <span class="token comment"># 保存</span>
:q          <span class="token comment"># 退出</span>
:wq         <span class="token comment"># 保存并退出</span>
:q<span class="token operator">!</span>         <span class="token comment"># 不保存强制退出</span>

<span class="token comment"># 在命令模式下</span>
<span class="token function">dd</span>          <span class="token comment"># 删除当前行</span>
yy          <span class="token comment"># 复制当前行</span>
p           <span class="token comment"># 粘贴</span>
u           <span class="token comment"># 撤销</span>
Ctrl+R      <span class="token comment"># 重做</span>
/pattern    <span class="token comment"># 搜索</span>
n           <span class="token comment"># 下一个匹配</span>
:%s/old/new/g   <span class="token comment"># 全文替换</span>
gg          <span class="token comment"># 跳到文件开头</span>
G           <span class="token comment"># 跳到文件末尾</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="八、排查问题三板斧" tabindex="-1"><a class="header-anchor" href="#八、排查问题三板斧"><span>八、排查问题三板斧</span></a></h2><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 第一板斧：看日志</span>
<span class="token function">tail</span> <span class="token parameter variable">-f</span> /var/log/syslog
journalctl <span class="token parameter variable">-xe</span>
<span class="token function">dmesg</span> <span class="token operator">|</span> <span class="token function">tail</span> <span class="token parameter variable">-20</span>          <span class="token comment"># 内核日志</span>

<span class="token comment"># 第二板斧：看资源</span>
<span class="token function">top</span>                       <span class="token comment"># CPU + 内存</span>
<span class="token function">df</span> <span class="token parameter variable">-h</span>                     <span class="token comment"># 磁盘空间</span>
<span class="token function">free</span> <span class="token parameter variable">-h</span>                   <span class="token comment"># 内存</span>
iostat <span class="token parameter variable">-x</span> <span class="token number">1</span>               <span class="token comment"># 磁盘 I/O（需安装 sysstat）</span>

<span class="token comment"># 第三板斧：看进程</span>
<span class="token function">ps</span> aux <span class="token operator">|</span> <span class="token function">sort</span> <span class="token parameter variable">-rk</span> <span class="token number">3</span> <span class="token operator">|</span> <span class="token function">head</span> <span class="token parameter variable">-5</span>    <span class="token comment"># CPU 占用 Top 5</span>
<span class="token function">ps</span> aux <span class="token operator">|</span> <span class="token function">sort</span> <span class="token parameter variable">-rk</span> <span class="token number">4</span> <span class="token operator">|</span> <span class="token function">head</span> <span class="token parameter variable">-5</span>    <span class="token comment"># 内存占用 Top 5</span>
<span class="token function">lsof</span> <span class="token parameter variable">-i</span> :8080                    <span class="token comment"># 谁在用 8080 端口</span>
<span class="token function">strace</span> <span class="token parameter variable">-p</span> <span class="token operator">&lt;</span>PID<span class="token operator">&gt;</span>                  <span class="token comment"># 追踪进程的系统调用（终极调试手段）</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="九、学习路线建议" tabindex="-1"><a class="header-anchor" href="#九、学习路线建议"><span>九、学习路线建议</span></a></h2><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>入门阶段（1-2 周）
├── 理解&quot;一切皆文件&quot;
├── 文件操作：ls, cd, cp, mv, rm, cat, less, find
├── 权限概念：chmod, chown, sudo
├── 管道和重定向：|, &gt;, &gt;&gt;, &lt;
└── 用 Vim 做基本编辑

进阶阶段（2-4 周）
├── 文本处理三剑客：grep, awk, sed
├── 进程管理：ps, top, kill, nohup, jobs
├── Shell 脚本编写
├── Systemd 服务管理
└── 用户和组管理

高级阶段（持续学习）
├── 网络诊断：ss, tcpdump, iptables/ufw
├── 性能分析：strace, lsof, perf, iostat
├── 内核参数调优：/proc/sys, sysctl
├── 安全加固：SELinux/AppArmor, fail2ban
└── 容器化：Docker, systemd-nspawn
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="十、核心总结" tabindex="-1"><a class="header-anchor" href="#十、核心总结"><span>十、核心总结</span></a></h2><blockquote><p><strong>Linux 的学习不是背命令，而是理解它的设计哲学。</strong></p></blockquote><ol><li><strong>一切皆文件</strong> → 学一个操作模式，应用到一切</li><li><strong>小而美 + 管道</strong> → 学会&quot;搭积木&quot;，而不是找&quot;万能工具&quot;</li><li><strong>文本为王</strong> → 配置、日志、数据，全部可用 grep/vim 搞定</li><li><strong>沉默是金</strong> → 没报错就是成功，学会用 <code>$?</code> 和日志验证</li><li><strong>一切可脚本化</strong> → 重复操作就该写成脚本，解放自己</li></ol><p>记住这五点，Linux 的学习就会从&quot;背命令&quot;变成&quot;理解系统&quot;，事半功倍。</p>`,119),i=[t];function p(c,o){return a(),s("div",null,i)}const m=n(l,[["render",p],["__file","linux-core-philosophy-and-ops.html.vue"]]),u=JSON.parse('{"path":"/serve/linux/linux-core-philosophy-and-ops.html","title":"Linux 核心思想与常用操作实战","lang":"zh-CN","frontmatter":{"icon":"article","category":["Serve","Guide"],"tag":["linux","core-philosophy","operations","demo"],"description":"Linux 核心思想与常用操作实战 一、Linux 核心思想 —— 理解它，才能驾驭它 1.1 一切皆文件 (Everything is a File) 这是 Linux 最根本的设计哲学。在 Linux 中，普通文件、目录、设备、进程、网络 socket，甚至内核参数，都以文件的形式呈现。 这意味着什么？ 只要你学会了 cat、echo、ls、cp ...","head":[["meta",{"property":"og:url","content":"https://lfange.github.io/serve/linux/linux-core-philosophy-and-ops.html"}],["meta",{"property":"og:site_name","content":"哓番茄"}],["meta",{"property":"og:title","content":"Linux 核心思想与常用操作实战"}],["meta",{"property":"og:description","content":"Linux 核心思想与常用操作实战 一、Linux 核心思想 —— 理解它，才能驾驭它 1.1 一切皆文件 (Everything is a File) 这是 Linux 最根本的设计哲学。在 Linux 中，普通文件、目录、设备、进程、网络 socket，甚至内核参数，都以文件的形式呈现。 这意味着什么？ 只要你学会了 cat、echo、ls、cp ..."}],["meta",{"property":"og:type","content":"article"}],["meta",{"property":"og:locale","content":"zh-CN"}],["meta",{"property":"og:updated_time","content":"2026-07-09T04:55:41.000Z"}],["meta",{"property":"article:author","content":"哓番茄"}],["meta",{"property":"article:tag","content":"linux"}],["meta",{"property":"article:tag","content":"core-philosophy"}],["meta",{"property":"article:tag","content":"operations"}],["meta",{"property":"article:tag","content":"demo"}],["meta",{"property":"article:modified_time","content":"2026-07-09T04:55:41.000Z"}],["script",{"type":"application/ld+json"},"{\\"@context\\":\\"https://schema.org\\",\\"@type\\":\\"Article\\",\\"headline\\":\\"Linux 核心思想与常用操作实战\\",\\"image\\":[\\"\\"],\\"dateModified\\":\\"2026-07-09T04:55:41.000Z\\",\\"author\\":[{\\"@type\\":\\"Person\\",\\"name\\":\\"哓番茄\\",\\"url\\":\\"https://lfange.github.io/\\"}]}"]]},"headers":[{"level":2,"title":"一、Linux 核心思想 —— 理解它，才能驾驭它","slug":"一、linux-核心思想-——-理解它-才能驾驭它","link":"#一、linux-核心思想-——-理解它-才能驾驭它","children":[{"level":3,"title":"1.1 一切皆文件 (Everything is a File)","slug":"_1-1-一切皆文件-everything-is-a-file","link":"#_1-1-一切皆文件-everything-is-a-file","children":[]},{"level":3,"title":"1.2 小而美：一个程序只做一件事 (Do One Thing and Do It Well)","slug":"_1-2-小而美-一个程序只做一件事-do-one-thing-and-do-it-well","link":"#_1-2-小而美-一个程序只做一件事-do-one-thing-and-do-it-well","children":[]},{"level":3,"title":"1.3 一切皆可脚本化 (Everything is Scriptable)","slug":"_1-3-一切皆可脚本化-everything-is-scriptable","link":"#_1-3-一切皆可脚本化-everything-is-scriptable","children":[]},{"level":3,"title":"1.4 文本为王 (Text is King)","slug":"_1-4-文本为王-text-is-king","link":"#_1-4-文本为王-text-is-king","children":[]},{"level":3,"title":"1.5 沉默是金 (Silence is Golden)","slug":"_1-5-沉默是金-silence-is-golden","link":"#_1-5-沉默是金-silence-is-golden","children":[]},{"level":3,"title":"1.6 哲学总结：一张图看懂 Linux 设计理念","slug":"_1-6-哲学总结-一张图看懂-linux-设计理念","link":"#_1-6-哲学总结-一张图看懂-linux-设计理念","children":[]}]},{"level":2,"title":"二、文件系统 —— 了解你的工作台","slug":"二、文件系统-——-了解你的工作台","link":"#二、文件系统-——-了解你的工作台","children":[{"level":3,"title":"2.1 Linux 目录结构速览","slug":"_2-1-linux-目录结构速览","link":"#_2-1-linux-目录结构速览","children":[]},{"level":3,"title":"2.2 inode —— 文件的\\"身份证\\"","slug":"_2-2-inode-——-文件的-身份证","link":"#_2-2-inode-——-文件的-身份证","children":[]},{"level":3,"title":"2.3 硬链接与软链接","slug":"_2-3-硬链接与软链接","link":"#_2-3-硬链接与软链接","children":[]}]},{"level":2,"title":"三、常用命令实战 —— 按场景学习","slug":"三、常用命令实战-——-按场景学习","link":"#三、常用命令实战-——-按场景学习","children":[{"level":3,"title":"3.1 文件操作（最基础，每天用）","slug":"_3-1-文件操作-最基础-每天用","link":"#_3-1-文件操作-最基础-每天用","children":[]},{"level":3,"title":"3.2 文本处理（Linux 最擅长的领域）","slug":"_3-2-文本处理-linux-最擅长的领域","link":"#_3-2-文本处理-linux-最擅长的领域","children":[]},{"level":3,"title":"3.3 进程管理","slug":"_3-3-进程管理","link":"#_3-3-进程管理","children":[]},{"level":3,"title":"3.4 权限管理","slug":"_3-4-权限管理","link":"#_3-4-权限管理","children":[]},{"level":3,"title":"3.5 磁盘与存储","slug":"_3-5-磁盘与存储","link":"#_3-5-磁盘与存储","children":[]},{"level":3,"title":"3.6 网络操作","slug":"_3-6-网络操作","link":"#_3-6-网络操作","children":[]},{"level":3,"title":"3.7 用户与组管理","slug":"_3-7-用户与组管理","link":"#_3-7-用户与组管理","children":[]},{"level":3,"title":"3.8 包管理","slug":"_3-8-包管理","link":"#_3-8-包管理","children":[]}]},{"level":2,"title":"四、管道与重定向 —— Linux 的\\"乐高积木\\"","slug":"四、管道与重定向-——-linux-的-乐高积木","link":"#四、管道与重定向-——-linux-的-乐高积木","children":[{"level":3,"title":"4.1 三大数据流","slug":"_4-1-三大数据流","link":"#_4-1-三大数据流","children":[]},{"level":3,"title":"4.2 管道——组合的力量","slug":"_4-2-管道——组合的力量","link":"#_4-2-管道——组合的力量","children":[]}]},{"level":2,"title":"五、Shell 脚本入门 —— 把重复变成自动化","slug":"五、shell-脚本入门-——-把重复变成自动化","link":"#五、shell-脚本入门-——-把重复变成自动化","children":[{"level":3,"title":"5.1 基本骨架","slug":"_5-1-基本骨架","link":"#_5-1-基本骨架","children":[]},{"level":3,"title":"5.2 条件判断","slug":"_5-2-条件判断","link":"#_5-2-条件判断","children":[]},{"level":3,"title":"5.3 循环","slug":"_5-3-循环","link":"#_5-3-循环","children":[]},{"level":3,"title":"5.4 函数","slug":"_5-4-函数","link":"#_5-4-函数","children":[]},{"level":3,"title":"5.5 实用脚本示例","slug":"_5-5-实用脚本示例","link":"#_5-5-实用脚本示例","children":[]}]},{"level":2,"title":"六、Systemd 服务管理 —— 让你的程序开机自启","slug":"六、systemd-服务管理-——-让你的程序开机自启","link":"#六、systemd-服务管理-——-让你的程序开机自启","children":[{"level":3,"title":"6.1 编写 Service 文件","slug":"_6-1-编写-service-文件","link":"#_6-1-编写-service-文件","children":[]}]},{"level":2,"title":"七、高效工作技巧","slug":"七、高效工作技巧","link":"#七、高效工作技巧","children":[{"level":3,"title":"7.1 命令行历史","slug":"_7-1-命令行历史","link":"#_7-1-命令行历史","children":[]},{"level":3,"title":"7.2 别名","slug":"_7-2-别名","link":"#_7-2-别名","children":[]},{"level":3,"title":"7.3 环境变量","slug":"_7-3-环境变量","link":"#_7-3-环境变量","children":[]},{"level":3,"title":"7.4 Vim 速成（够用就行）","slug":"_7-4-vim-速成-够用就行","link":"#_7-4-vim-速成-够用就行","children":[]}]},{"level":2,"title":"八、排查问题三板斧","slug":"八、排查问题三板斧","link":"#八、排查问题三板斧","children":[]},{"level":2,"title":"九、学习路线建议","slug":"九、学习路线建议","link":"#九、学习路线建议","children":[]},{"level":2,"title":"十、核心总结","slug":"十、核心总结","link":"#十、核心总结","children":[]}],"git":{"createdTime":1783572941000,"updatedTime":1783572941000,"contributors":[{"name":"FanGe","email":"653398363@qq.com","commits":1}]},"readingTime":{"minutes":18.91,"words":5674},"filePathRelative":"serve/linux/linux-core-philosophy-and-ops.md","localizedDate":"2026年7月9日","excerpt":"","autoDesc":true}');export{m as comp,u as data};
